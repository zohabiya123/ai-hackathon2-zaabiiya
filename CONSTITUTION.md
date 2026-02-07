# Evolution Todo Hackathon App — Project Constitution

## 1. Project Identity
- **Name:** Evolution Todo Hackathon App
- **Type:** Single Page Application (SPA)
- **Purpose:** A modern, production-ready todo management dashboard with authentication, analytics, and theme support.

## 2. Tech Stack
| Layer          | Technology                  |
|----------------|-----------------------------|
| Framework      | React 18 + Vite             |
| Language       | JavaScript (ES2022+)        |
| Styling        | CSS Modules + CSS Variables  |
| Routing        | React Router v6             |
| State          | React Context + useReducer  |
| Icons          | Lucide React                |
| Storage        | localStorage (client-side)  |
| Build Tool     | Vite 5                      |

## 3. Architecture Pattern
- **Clean Architecture** with separation of concerns
- **Feature-based folder structure** — each feature owns its components, hooks, context, and styles
- **Context-driven state** — AuthContext, TodoContext, ThemeContext
- **No backend** — all data persisted in localStorage

## 4. Folder Structure
```
src/
├── app/                    # App shell, router, providers
│   ├── App.jsx
│   ├── Router.jsx
│   └── Providers.jsx
├── features/
│   ├── auth/               # Authentication feature
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   └── styles/
│   ├── todos/              # Todo dashboard feature
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   └── styles/
│   └── theme/              # Theme system feature
│       ├── components/
│       ├── context/
│       ├── hooks/
│       └── styles/
├── shared/                 # Shared utilities & components
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   └── styles/
├── assets/                 # Static assets
├── main.jsx
└── index.css
```

## 5. Coding Standards
- Functional components only (no class components)
- Custom hooks for reusable logic
- CSS Modules for component-scoped styling
- CSS Variables for theming (defined in `:root` and `[data-theme="dark"]`)
- Named exports for components, default exports for pages
- Prop destructuring in function parameters
- Early returns for guard clauses

## 6. Design Principles
- **Mobile-first responsive design** (breakpoints: 768px, 1024px, 1280px)
- **Accessible** — semantic HTML, ARIA labels, keyboard navigation
- **Performant** — lazy loading, memoization where needed
- **Consistent** — design tokens via CSS Variables
- **Smooth** — CSS transitions for theme switch and interactions

## 7. Feature Phases
| Phase | Feature              | Spec File                    |
|-------|----------------------|------------------------------|
| 1     | Theme System         | specs/FEATURE-THEME.md       |
| 2     | Authentication       | specs/FEATURE-AUTH.md        |
| 3     | Todo Dashboard       | specs/FEATURE-TODO-DASHBOARD.md |
| 4     | AI Chatbot           | specs/FEATURE-AI-CHATBOT.md     |
| 5     | Cloud-Native Deploy  | specs/FEATURE-DEPLOYMENT.md     |

## 8. Rules
1. No feature shall be coded without a written spec
2. Specs define UI, behavior, data model, and edge cases
3. Code must match spec — deviations require spec update first
4. Every component must support both dark and light themes
5. All user data stays in localStorage
6. No external API calls — fully offline-capable
