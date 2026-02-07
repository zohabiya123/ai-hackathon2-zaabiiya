# Feature Spec: Authentication System

## Overview
Client-side authentication with login/signup forms, session persistence via localStorage, and protected route guarding.

## Data Model
```js
User {
  id: string (uuid),
  name: string,
  email: string,
  password: string (stored as-is, client-only demo),
  avatar: string (initials-based),
  createdAt: string (ISO date)
}

Session {
  isAuthenticated: boolean,
  currentUser: User | null
}
```

**Storage Keys:**
- `evo_users` — Array of registered users
- `evo_session` — Current session object

## Pages & Components

### 1. Login Page (`/login`)
- **Layout:** Centered card on gradient background
- **Fields:**
  - Email (required, email validation)
  - Password (required, min 6 chars)
- **Actions:**
  - "Sign In" button — validates, authenticates, redirects to `/dashboard`
  - "Create account" link — navigates to `/signup`
- **Error States:**
  - "Invalid email or password" — wrong credentials
  - Field-level validation messages
- **UX:** Password visibility toggle, loading state on submit

### 2. Signup Page (`/signup`)
- **Layout:** Centered card on gradient background
- **Fields:**
  - Full Name (required, min 2 chars)
  - Email (required, email validation, unique check)
  - Password (required, min 6 chars)
  - Confirm Password (must match)
- **Actions:**
  - "Create Account" button — registers user, auto-login, redirects to `/dashboard`
  - "Sign in" link — navigates to `/login`
- **Error States:**
  - "Email already registered"
  - Password mismatch
  - Field-level validation

### 3. Protected Route Wrapper
- Checks `isAuthenticated` from AuthContext
- If not authenticated → redirect to `/login`
- If authenticated → render child routes

## AuthContext API
```js
{
  user: User | null,
  isAuthenticated: boolean,
  login: (email, password) => { success: boolean, error?: string },
  signup: (name, email, password) => { success: boolean, error?: string },
  logout: () => void,
  updateProfile: (updates) => void
}
```

## Behavior Rules
1. On app load, check `evo_session` in localStorage to restore session
2. After login/signup, store session and redirect to `/dashboard`
3. On logout, clear session (not user data) and redirect to `/login`
4. Unauthenticated users cannot access `/dashboard` or any protected route
5. Authenticated users visiting `/login` or `/signup` are redirected to `/dashboard`

## UI Design
- Gradient background: `linear-gradient(135deg, primary-color, accent-color)`
- Card: white/dark bg, rounded corners (16px), shadow, max-width 420px
- Inputs: full-width, 48px height, rounded (10px), border on focus
- Button: full-width, 48px, gradient background, bold text, hover scale effect
- Smooth transitions between login/signup
