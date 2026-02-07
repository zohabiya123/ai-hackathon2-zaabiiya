# Feature Spec: Todo Dashboard

## Overview
Main application view with sidebar navigation, stats cards, todo list with full CRUD, categories, priorities, search, and filters.

## Data Model
```js
Todo {
  id: string (uuid),
  userId: string,
  title: string,
  description: string (optional),
  completed: boolean,
  priority: "low" | "medium" | "high",
  category: "personal" | "work" | "health" | "learning" | "other",
  createdAt: string (ISO date),
  updatedAt: string (ISO date)
}
```

**Storage Key:** `evo_todos`

## Layout Structure
```
┌─────────┬────────────────────────────────────┐
│         │  Header (search + user + theme)     │
│         ├────────────────────────────────────┤
│ Sidebar │  Stats Cards Row                    │
│         ├────────────────────────────────────┤
│         │  Filters Bar                        │
│         ├────────────────────────────────────┤
│         │  Todo List                          │
│         │                                    │
│         │                                    │
└─────────┴────────────────────────────────────┘
```

## Components

### 1. Sidebar
- **Logo/App Name** at top: "Evolution" with icon
- **Navigation Items:**
  - Dashboard (active by default)
  - All Tasks
  - Categories
  - Analytics (future)
- **Category Quick Filters:**
  - Personal (icon + count)
  - Work (icon + count)
  - Health (icon + count)
  - Learning (icon + count)
- **Bottom:** User avatar + name + logout button
- **Responsive:** Collapses to hamburger menu on mobile (<768px)

### 2. Header Bar
- **Left:** Page title ("Dashboard")
- **Center:** Search bar (searches title + description)
- **Right:** Theme toggle + User avatar dropdown

### 3. Stats Cards (4 cards in row)
| Card          | Icon    | Value              | Color   |
|---------------|---------|---------------------|---------|
| Total Tasks   | List    | Count of all todos  | Blue    |
| Completed     | Check   | Count of done       | Green   |
| In Progress   | Clock   | Count of not done   | Orange  |
| High Priority | Alert   | Count of high prio  | Red     |

- Each card: rounded (14px), subtle shadow, icon circle, large number, label
- Hover: slight lift effect

### 4. Filters Bar
- **Priority filter:** All / Low / Medium / High (pill buttons)
- **Category filter:** All / Personal / Work / Health / Learning (pill buttons)
- **Sort:** Newest / Oldest / Priority
- **Add Todo button:** "+ Add Task" prominent button on right

### 5. Todo List
- **Todo Item Card:**
  - Checkbox (custom styled, animated)
  - Title (strikethrough when completed)
  - Description preview (1 line, truncated)
  - Priority badge (color-coded: green/orange/red)
  - Category badge (icon + label)
  - Time ago label ("2h ago", "yesterday")
  - Actions: Edit (pencil icon), Delete (trash icon)
- **Empty State:** Illustration/icon + "No tasks yet. Create your first task!"
- **Completed tasks** appear with reduced opacity

### 6. Add/Edit Todo Modal
- **Fields:**
  - Title (required, max 100 chars)
  - Description (optional, max 500 chars, textarea)
  - Priority (radio group: Low / Medium / High)
  - Category (select dropdown)
- **Actions:** Save / Cancel
- **Backdrop:** semi-transparent overlay, click outside to close
- **Animation:** slide up + fade in

### 7. Delete Confirmation Modal
- "Are you sure?" message
- Todo title shown
- "Delete" (red) + "Cancel" buttons

## TodoContext API
```js
{
  todos: Todo[],
  filteredTodos: Todo[],
  stats: { total, completed, inProgress, highPriority },
  filters: { priority, category, search, sort },
  addTodo: (todo) => void,
  updateTodo: (id, updates) => void,
  deleteTodo: (id) => void,
  toggleTodo: (id) => void,
  setFilters: (filterUpdates) => void
}
```

## Behavior Rules
1. Todos are user-scoped — each user sees only their own todos
2. Adding a todo auto-sets `createdAt` and `updatedAt`
3. Toggling complete updates `updatedAt`
4. Filters work combinatorially (priority AND category AND search)
5. Search is case-insensitive, debounced (300ms)
6. Stats update in real-time as todos change
7. Todos persist in localStorage under `evo_todos`
8. Category counts in sidebar update dynamically

## UI Design
- Cards: `var(--card-bg)`, border-radius 14px, padding 20px
- Priority colors: Low=#22c55e, Medium=#f59e0b, High=#ef4444
- Category colors: Personal=#8b5cf6, Work=#3b82f6, Health=#10b981, Learning=#f59e0b
- Todo items: card-style, hover highlight, smooth checkbox animation
- Modal: centered, max-width 500px, rounded 16px, shadow-xl
- Responsive grid: 4 cols → 2 cols → 1 col for stats cards
