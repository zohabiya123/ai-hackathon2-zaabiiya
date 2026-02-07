# Feature Spec: Cloud-Native Deployment (Phase V)

## Overview
Containerize the Evolution Todo App and deploy it to Kubernetes using Docker, Helm, Minikube, kubectl-ai, and kagent. The app is a static React SPA served by nginx — no backend runtime required. The deployment stack provides production-grade infrastructure: rolling updates, autoscaling, health checks, and AI-assisted cluster management.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Developer Workstation                                          │
│                                                                 │
│  ┌──────────┐    ┌──────────────┐    ┌───────────────────────┐ │
│  │ Dockerfile│───▶│ Docker Image │───▶│ Minikube Cluster      │ │
│  │ (multi-   │    │ evo-todo:tag │    │                       │ │
│  │  stage)   │    └──────────────┘    │  ┌─────────────────┐  │ │
│  └──────────┘                         │  │ Namespace:       │  │ │
│                                       │  │ evo-todo         │  │ │
│  ┌──────────┐    ┌──────────────┐    │  │                 │  │ │
│  │ Helm     │───▶│ helm install │───▶│  │  ┌───────────┐  │  │ │
│  │ Chart    │    └──────────────┘    │  │  │ Deployment │  │  │ │
│  └──────────┘                         │  │  │ (nginx)    │  │  │ │
│                                       │  │  │ replicas:2 │  │  │ │
│  ┌──────────┐    ┌──────────────┐    │  │  └─────┬─────┘  │  │ │
│  │kubectl-ai│───▶│ AI-generated │───▶│  │        │        │  │ │
│  │          │    │ manifests    │    │  │  ┌─────▼─────┐  │  │ │
│  └──────────┘    └──────────────┘    │  │  │ Service   │  │  │ │
│                                       │  │  │ ClusterIP │  │  │ │
│  ┌──────────┐    ┌──────────────┐    │  │  └─────┬─────┘  │  │ │
│  │ kagent   │───▶│ AI Cluster   │───▶│  │        │        │  │ │
│  │          │    │ Management   │    │  │  ┌─────▼─────┐  │  │ │
│  └──────────┘    └──────────────┘    │  │  │ Ingress   │  │  │ │
│                                       │  │  │ nginx     │  │  │ │
│                                       │  │  └───────────┘  │  │ │
│                                       │  │                 │  │ │
│                                       │  │  ┌───────────┐  │  │ │
│                                       │  │  │ HPA       │  │  │ │
│                                       │  │  │ 2-10 pods │  │  │ │
│                                       │  │  └───────────┘  │  │ │
│                                       │  └─────────────────┘  │ │
│                                       └───────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Stack

| Component        | Technology                          | Purpose                          |
|------------------|-------------------------------------|----------------------------------|
| Container Runtime| Docker / Docker Desktop             | Build & run OCI images           |
| Base Image       | Node 20 (build) + nginx:alpine (run)| Multi-stage: build then serve    |
| Orchestration    | Kubernetes (Minikube)               | Container orchestration          |
| Package Manager  | Helm 3                              | Templated K8s manifest management|
| AI Ops           | kubectl-ai                          | Natural language → K8s manifests |
| AI Agent         | kagent                              | AI-powered cluster management    |
| Ingress          | nginx Ingress Controller            | External traffic routing         |

## 1. Docker Configuration

### 1.1 Multi-Stage Dockerfile

```
Stage 1 — "build"
├── Base: node:20-alpine
├── Copy: package.json, package-lock.json
├── Run: npm ci (clean install, deterministic)
├── Copy: source code
├── Run: npm run build → /app/dist
│
Stage 2 — "production"
├── Base: nginx:1.27-alpine
├── Copy: custom nginx.conf → /etc/nginx/nginx.conf
├── Copy: --from=build /app/dist → /usr/share/nginx/html
├── Expose: 80
├── Healthcheck: curl localhost:80/index.html
├── User: nginx (non-root)
└── CMD: nginx -g "daemon off;"
```

**Image Target:**
- Size: < 25MB (alpine-based)
- No dev dependencies in production image
- Non-root user for security

### 1.2 nginx Configuration

```
- Worker processes: auto
- SPA routing: try_files $uri $uri/ /index.html (fallback for React Router)
- Gzip: on (js, css, html, json, svg)
- Cache headers: static assets 1y, index.html no-cache
- Security headers: X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- Access log: /var/log/nginx/access.log
- Port: 80
```

### 1.3 docker-compose.yml

```yaml
services:
  frontend:
    build: .
    ports: ["3000:80"]
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80/"]
      interval: 30s
      timeout: 5s
      retries: 3
```

### 1.4 .dockerignore

```
node_modules, .git, dist, *.md (except specs), .env*, .vscode
```

## 2. Kubernetes Manifests

All manifests live in `k8s/` directory. Target namespace: `evo-todo`.

### 2.1 Resource List

| File                  | Kind            | Purpose                              |
|-----------------------|-----------------|--------------------------------------|
| namespace.yaml        | Namespace       | Isolate app resources                |
| configmap.yaml        | ConfigMap       | nginx.conf stored as config          |
| deployment.yaml       | Deployment      | Pod spec with 2 replicas, probes     |
| service.yaml          | Service         | ClusterIP on port 80                 |
| ingress.yaml          | Ingress         | Route evo-todo.local → service       |
| hpa.yaml              | HPA             | Autoscale 2–10 pods at 70% CPU      |

### 2.2 Deployment Spec

```yaml
replicas: 2
strategy: RollingUpdate (maxSurge: 1, maxUnavailable: 0)
container:
  image: evo-todo:latest
  port: 80
  resources:
    requests: { cpu: 50m, memory: 64Mi }
    limits:   { cpu: 200m, memory: 128Mi }
  livenessProbe:  httpGet /index.html :80 (period: 30s)
  readinessProbe: httpGet /index.html :80 (period: 10s)
  startupProbe:   httpGet /index.html :80 (failureThreshold: 3)
securityContext:
  runAsNonRoot: true
  readOnlyRootFilesystem: false  # nginx needs /var/cache
```

### 2.3 Ingress

```
Host: evo-todo.local
Path: / → service:80
Annotations: nginx rewrite, ssl-redirect off
```

### 2.4 HPA

```
minReplicas: 2
maxReplicas: 10
targetCPUUtilizationPercentage: 70
```

## 3. Helm Chart

Chart lives in `helm/evo-todo/`.

### 3.1 Structure

```
helm/evo-todo/
├── Chart.yaml              # Chart metadata (v0.1.0, appVersion 1.0.0)
├── values.yaml             # Default configuration values
├── .helmignore
└── templates/
    ├── _helpers.tpl         # Template helpers (name, labels, selectors)
    ├── namespace.yaml
    ├── configmap.yaml
    ├── deployment.yaml
    ├── service.yaml
    ├── ingress.yaml
    ├── hpa.yaml
    └── NOTES.txt            # Post-install instructions
```

### 3.2 Configurable Values

```yaml
replicaCount: 2
image:
  repository: evo-todo
  tag: latest
  pullPolicy: IfNotPresent
service:
  type: ClusterIP
  port: 80
ingress:
  enabled: true
  host: evo-todo.local
resources:
  requests: { cpu: 50m, memory: 64Mi }
  limits:   { cpu: 200m, memory: 128Mi }
autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPU: 70
nginx:
  gzip: true
  cacheControl: true
```

## 4. Minikube Deployment

### 4.1 Prerequisites

| Tool       | Min Version | Install Command                                  |
|------------|-------------|--------------------------------------------------|
| Docker     | 24.x       | `winget install Docker.DockerDesktop`             |
| Minikube   | 1.32+       | `winget install Kubernetes.minikube`              |
| kubectl    | 1.29+       | `winget install Kubernetes.kubectl`               |
| Helm       | 3.14+       | `winget install Helm.Helm`                        |
| kubectl-ai | latest      | `go install github.com/sozercan/kubectl-ai@latest`|
| kagent     | latest      | `pip install kagent`                              |

### 4.2 Deployment Steps

```bash
# 1. Start Minikube
minikube start --driver=docker --cpus=2 --memory=4096

# 2. Enable addons
minikube addons enable ingress
minikube addons enable metrics-server

# 3. Point Docker to Minikube's daemon
eval $(minikube docker-env)       # Linux/Mac
minikube docker-env --shell powershell | Invoke-Expression  # Windows

# 4. Build image inside Minikube
docker build -t evo-todo:latest .

# 5a. Deploy with raw manifests
kubectl apply -f k8s/

# 5b. OR deploy with Helm
helm install evo-todo helm/evo-todo/ --namespace evo-todo --create-namespace

# 6. Add hosts entry
echo "$(minikube ip) evo-todo.local" >> /etc/hosts    # Linux/Mac
# Windows: Add to C:\Windows\System32\drivers\etc\hosts

# 7. Access the app
minikube service evo-todo -n evo-todo --url
# OR
curl http://evo-todo.local
```

## 5. kubectl-ai Integration

kubectl-ai translates natural language into Kubernetes manifests and commands.

### 5.1 Setup

```bash
# Install
go install github.com/sozercan/kubectl-ai@latest

# Configure (requires OpenAI API key)
export OPENAI_API_KEY="sk-..."
```

### 5.2 Usage Examples

```bash
# Generate deployment manifest
kubectl-ai "create a deployment for evo-todo with nginx image, 2 replicas, port 80"

# Scale operation
kubectl-ai "scale evo-todo deployment to 5 replicas in evo-todo namespace"

# Create HPA
kubectl-ai "create an HPA for evo-todo targeting 70% CPU, min 2 max 10 replicas"

# Debug pods
kubectl-ai "show me why pods in evo-todo namespace are crashing"

# Network policy
kubectl-ai "create a network policy that only allows ingress on port 80 for evo-todo"

# Resource audit
kubectl-ai "check resource usage for all pods in evo-todo namespace"
```

### 5.3 Workflow

```
Developer prompt → kubectl-ai → Generated YAML → Review → Apply
                                     ↓
                              (human approval required)
```

## 6. kagent Integration

kagent provides an AI agent that monitors and manages the Kubernetes cluster.

### 6.1 Setup

```bash
# Install kagent
pip install kagent

# Or via Helm
helm repo add kagent https://kagent-dev.github.io/kagent/
helm install kagent kagent/kagent --namespace kagent --create-namespace

# Configure
kagent init --kubeconfig ~/.kube/config
```

### 6.2 Capabilities

| Capability           | Description                                           |
|----------------------|-------------------------------------------------------|
| Health Monitoring    | Continuous cluster health assessment                  |
| Incident Response    | Auto-detect and suggest fixes for failures            |
| Resource Optimization| Recommend right-sizing for CPU/memory requests/limits |
| Troubleshooting      | Natural language debugging ("why is my pod failing?") |
| Compliance           | Check against security best practices                 |

### 6.3 Usage Examples

```bash
# Interactive troubleshooting
kagent chat "why are my evo-todo pods not ready?"

# Health check
kagent diagnose deployment/evo-todo -n evo-todo

# Resource recommendations
kagent optimize -n evo-todo

# Security audit
kagent audit -n evo-todo
```

### 6.4 kagent Agent Configuration

```yaml
# kagent-config.yaml
apiVersion: kagent.dev/v1alpha1
kind: Agent
metadata:
  name: evo-todo-agent
  namespace: kagent
spec:
  description: "AI agent for Evolution Todo App cluster management"
  model:
    provider: openai
    name: gpt-4
  tools:
    - name: k8s
      config:
        namespaces: ["evo-todo"]
        allowedOperations: ["get", "list", "describe", "logs"]
    - name: prometheus
      config:
        endpoint: "http://prometheus:9090"
  triggers:
    - type: schedule
      interval: 5m
      action: healthCheck
    - type: event
      resource: pods
      eventType: Warning
      action: diagnose
```

## 7. Verification Steps

### 7.1 Docker Verification

```bash
# Build succeeds
docker build -t evo-todo:latest .

# Image size < 25MB
docker images evo-todo:latest --format "{{.Size}}"

# Container runs and serves content
docker run -d -p 3000:80 --name evo-test evo-todo:latest
curl http://localhost:3000          # → HTML response
curl http://localhost:3000/login    # → SPA fallback (same HTML)

# Health check passes
docker inspect --format='{{.State.Health.Status}}' evo-test

# Cleanup
docker rm -f evo-test
```

### 7.2 Kubernetes Verification

```bash
# All resources created
kubectl get all -n evo-todo

# Pods running (2/2 ready)
kubectl get pods -n evo-todo -o wide

# Service endpoints resolved
kubectl get endpoints -n evo-todo

# Ingress configured
kubectl get ingress -n evo-todo

# HPA active
kubectl get hpa -n evo-todo

# Logs clean
kubectl logs -l app=evo-todo -n evo-todo --tail=50

# Liveness/readiness probes passing
kubectl describe pods -l app=evo-todo -n evo-todo | grep -A3 "Conditions"

# Port-forward test
kubectl port-forward svc/evo-todo 8080:80 -n evo-todo &
curl http://localhost:8080
```

### 7.3 Helm Verification

```bash
# Release exists
helm list -n evo-todo

# Values rendered correctly
helm get values evo-todo -n evo-todo

# Manifest dry-run
helm template evo-todo helm/evo-todo/ --debug

# Upgrade test
helm upgrade evo-todo helm/evo-todo/ --set replicaCount=3 -n evo-todo
kubectl get pods -n evo-todo   # → 3 pods
```

### 7.4 Rolling Update Test

```bash
# Rebuild with change
docker build -t evo-todo:v2 .

# Update deployment image
kubectl set image deployment/evo-todo evo-todo=evo-todo:v2 -n evo-todo

# Watch rollout
kubectl rollout status deployment/evo-todo -n evo-todo

# Verify zero downtime (should see no 5xx)
kubectl rollout history deployment/evo-todo -n evo-todo
```

## 8. File Manifest

| File                           | Purpose                          |
|--------------------------------|----------------------------------|
| `Dockerfile`                   | Multi-stage frontend build       |
| `nginx.conf`                   | SPA-ready nginx configuration    |
| `.dockerignore`                | Exclude files from Docker context|
| `docker-compose.yml`           | Local Docker orchestration       |
| `k8s/namespace.yaml`           | Kubernetes namespace             |
| `k8s/configmap.yaml`           | nginx config as ConfigMap        |
| `k8s/deployment.yaml`          | Pod deployment spec              |
| `k8s/service.yaml`             | ClusterIP service                |
| `k8s/ingress.yaml`             | Ingress routing rules            |
| `k8s/hpa.yaml`                 | Horizontal Pod Autoscaler        |
| `helm/evo-todo/Chart.yaml`     | Helm chart metadata              |
| `helm/evo-todo/values.yaml`    | Default Helm values              |
| `helm/evo-todo/.helmignore`    | Helm package exclusions          |
| `helm/evo-todo/templates/*.yaml`| Templated K8s manifests         |
| `kagent-config.yaml`           | kagent agent definition          |
| `deploy.sh`                    | One-command deployment script    |
