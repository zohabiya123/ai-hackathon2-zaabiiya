# Feature Spec: Theme System (Dark / Light Mode)

## Overview
Global theme toggle between dark and light modes using CSS variables, with persistence in localStorage and smooth transitions.

## Data Model
```js
Theme: "light" | "dark"
```

**Storage Key:** `evo_theme`

## CSS Variables (Design Tokens)

### Light Theme (default)
```css
:root {
  --bg-primary: #f8fafc;
  --bg-secondary: #ffffff;
  --bg-tertiary: #f1f5f9;
  --card-bg: #ffffff;
  --sidebar-bg: #1e293b;
  --sidebar-text: #e2e8f0;
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #94a3b8;
  --border-color: #e2e8f0;
  --primary: #6366f1;
  --primary-hover: #4f46e5;
  --primary-light: #e0e7ff;
  --accent: #8b5cf6;
  --success: #22c55e;
  --warning: #f59e0b;
  --danger: #ef4444;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 30px rgba(0,0,0,0.12);
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --transition: 0.2s ease;
}
```

### Dark Theme
```css
[data-theme="dark"] {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-tertiary: #334155;
  --card-bg: #1e293b;
  --sidebar-bg: #0f172a;
  --sidebar-text: #e2e8f0;
  --text-primary: #f1f5f9;
  --text-secondary: #cbd5e1;
  --text-muted: #64748b;
  --border-color: #334155;
  --primary: #818cf8;
  --primary-hover: #6366f1;
  --primary-light: #1e1b4b;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.3);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.4);
  --shadow-lg: 0 10px 30px rgba(0,0,0,0.5);
}
```

## ThemeContext API
```js
{
  theme: "light" | "dark",
  toggleTheme: () => void,
  isDark: boolean
}
```

## Theme Toggle Component
- **Icon:** Sun icon (in dark mode) / Moon icon (in light mode)
- **Position:** Header bar, right side
- **Animation:** Icon rotates on toggle (180deg transition)
- **Size:** 40px circle button

## Behavior Rules
1. On first visit, default to `light` theme
2. On toggle, set `data-theme` attribute on `<html>` element
3. Persist preference to `evo_theme` in localStorage
4. On app load, read `evo_theme` and apply before first render (no flash)
5. All components must use CSS variables — no hardcoded colors
6. Transition: `background-color`, `color`, `border-color` with `var(--transition)`

## Transition Effect
```css
body {
  transition: background-color var(--transition),
              color var(--transition);
}
```

All themed elements should include transition for smooth switch.
