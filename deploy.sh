#!/usr/bin/env bash
set -euo pipefail

# ============================================================
#  Evolution Todo App — Minikube Deployment Script
# ============================================================
#
#  Usage:
#    ./deploy.sh [command]
#
#  Commands:
#    up        Start Minikube + build + deploy with Helm (default)
#    docker    Build & run with Docker only (no K8s)
#    manifests Deploy using raw K8s manifests (no Helm)
#    helm      Deploy using Helm chart
#    status    Show cluster status
#    logs      Tail pod logs
#    forward   Port-forward to localhost:8080
#    destroy   Tear down everything
#    help      Show this help message
# ============================================================

APP_NAME="evo-todo"
NAMESPACE="evo-todo"
IMAGE_TAG="latest"
LOCAL_PORT=8080

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log()  { echo -e "${GREEN}[+]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[x]${NC} $1" >&2; }
info() { echo -e "${CYAN}[i]${NC} $1"; }

# ── Prerequisites check ──────────────────────────────────────
check_prereqs() {
    local missing=()
    for cmd in docker minikube kubectl helm; do
        if ! command -v "$cmd" &>/dev/null; then
            missing+=("$cmd")
        fi
    done
    if [ ${#missing[@]} -gt 0 ]; then
        err "Missing tools: ${missing[*]}"
        echo "Install them first:"
        echo "  docker   → https://docs.docker.com/get-docker/"
        echo "  minikube → https://minikube.sigs.k8s.io/docs/start/"
        echo "  kubectl  → https://kubernetes.io/docs/tasks/tools/"
        echo "  helm     → https://helm.sh/docs/intro/install/"
        exit 1
    fi
    log "All prerequisites found"
}

# ── Minikube ─────────────────────────────────────────────────
ensure_minikube() {
    if minikube status --format='{{.Host}}' 2>/dev/null | grep -q "Running"; then
        log "Minikube already running"
    else
        log "Starting Minikube..."
        minikube start --driver=docker --cpus=2 --memory=4096
    fi

    log "Enabling addons..."
    minikube addons enable ingress 2>/dev/null || true
    minikube addons enable metrics-server 2>/dev/null || true

    log "Configuring Docker to use Minikube daemon..."
    eval $(minikube docker-env)
}

# ── Docker build ─────────────────────────────────────────────
build_image() {
    log "Building Docker image ${APP_NAME}:${IMAGE_TAG}..."
    docker build -t "${APP_NAME}:${IMAGE_TAG}" .
    local size=$(docker images "${APP_NAME}:${IMAGE_TAG}" --format "{{.Size}}")
    log "Image built: ${APP_NAME}:${IMAGE_TAG} (${size})"
}

# ── Deploy with raw manifests ────────────────────────────────
deploy_manifests() {
    log "Deploying with raw K8s manifests..."
    kubectl apply -f k8s/namespace.yaml
    kubectl apply -f k8s/
    log "Waiting for rollout..."
    kubectl rollout status deployment/${APP_NAME} -n ${NAMESPACE} --timeout=120s
    log "Manifest deployment complete"
}

# ── Deploy with Helm ─────────────────────────────────────────
deploy_helm() {
    log "Deploying with Helm..."
    helm upgrade --install ${APP_NAME} helm/evo-todo/ \
        --namespace ${NAMESPACE} \
        --create-namespace \
        --set image.tag=${IMAGE_TAG} \
        --wait --timeout 120s
    log "Helm deployment complete"
}

# ── Docker-only mode ─────────────────────────────────────────
deploy_docker() {
    log "Building and running with Docker Compose..."
    docker compose up -d --build
    log "App running at http://localhost:3000"
}

# ── Status ───────────────────────────────────────────────────
show_status() {
    info "Cluster status for namespace: ${NAMESPACE}"
    echo ""
    kubectl get all -n ${NAMESPACE} 2>/dev/null || warn "Namespace not found"
    echo ""
    kubectl get ingress -n ${NAMESPACE} 2>/dev/null || true
    echo ""
    kubectl get hpa -n ${NAMESPACE} 2>/dev/null || true
}

# ── Logs ─────────────────────────────────────────────────────
show_logs() {
    kubectl logs -l app=${APP_NAME} -n ${NAMESPACE} --tail=100 -f
}

# ── Port forward ─────────────────────────────────────────────
port_forward() {
    log "Port-forwarding svc/${APP_NAME} to localhost:${LOCAL_PORT}..."
    info "Access at: http://localhost:${LOCAL_PORT}"
    kubectl port-forward svc/${APP_NAME} ${LOCAL_PORT}:80 -n ${NAMESPACE}
}

# ── Destroy ──────────────────────────────────────────────────
destroy() {
    warn "Tearing down..."

    if helm list -n ${NAMESPACE} 2>/dev/null | grep -q ${APP_NAME}; then
        helm uninstall ${APP_NAME} -n ${NAMESPACE}
        log "Helm release removed"
    fi

    kubectl delete namespace ${NAMESPACE} --ignore-not-found=true
    log "Namespace deleted"

    docker compose down 2>/dev/null || true
    log "Teardown complete"
}

# ── Full deployment (default) ────────────────────────────────
deploy_full() {
    check_prereqs
    ensure_minikube
    build_image
    deploy_helm
    echo ""
    show_status
    echo ""
    log "Deployment complete!"
    info "Run './deploy.sh forward' to access at http://localhost:${LOCAL_PORT}"
    info "Or add '$(minikube ip) evo-todo.local' to your hosts file"
}

# ── Help ─────────────────────────────────────────────────────
show_help() {
    echo "Evolution Todo App — Deploy Script"
    echo ""
    echo "Usage: ./deploy.sh [command]"
    echo ""
    echo "Commands:"
    echo "  up        Full deploy: Minikube + build + Helm (default)"
    echo "  docker    Docker Compose only (no K8s)"
    echo "  manifests Deploy with raw K8s manifests"
    echo "  helm      Deploy with Helm chart (assumes Minikube running)"
    echo "  status    Show cluster resource status"
    echo "  logs      Tail application logs"
    echo "  forward   Port-forward to localhost:${LOCAL_PORT}"
    echo "  destroy   Remove all deployed resources"
    echo "  help      Show this message"
}

# ── Main ─────────────────────────────────────────────────────
case "${1:-up}" in
    up)        deploy_full ;;
    docker)    deploy_docker ;;
    manifests) check_prereqs && ensure_minikube && build_image && deploy_manifests ;;
    helm)      check_prereqs && build_image && deploy_helm ;;
    status)    show_status ;;
    logs)      show_logs ;;
    forward)   port_forward ;;
    destroy)   destroy ;;
    help|-h)   show_help ;;
    *)         err "Unknown command: $1" && show_help && exit 1 ;;
esac
