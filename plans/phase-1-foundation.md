# Phase 1: Foundation + Auth

**Dependencies:** None — must be completed first.
**Parallel:** Nothing. All subsequent phases depend on this.

## Goal

Build the project skeleton: HTML entry point with CDN libraries, client-side routing with auth guard, state management, base styles, and Firebase Google OAuth. Unauthenticated users see only the login screen.

## Files to Create

| File | Purpose |
|---|---|
| `index.html` | Entry point. CDN script tags for Firebase (auth + firestore), PapaParse, Chart.js. Links to all CSS. Module script tags for all JS. Single `<div id="app">` mount point. |
| `js/main.js` | `DOMContentLoaded` listener. Initialize Firebase app. Set up `onAuthStateChanged` observer — on sign-in, store user in state and call `showScreen('dashboard')`; on sign-out, clear state and call `showScreen('login')`. |
| `js/router.js` | `SCREENS` map linking screen names to render functions. `showScreen(name)` clears `#app` innerHTML and calls the screen's `render()`. Auth guard: if not authenticated and screen !== 'login', redirect to login. |
| `js/state.js` | Immutable state store. `getState()` returns a frozen copy. `setState(updates)` creates a new state object merged with updates. Initial shape: `{ user: null, transactions: [], filters: {}, loading: false }` |
| `js/firebase-config.js` | Exports the Firebase config object (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId). **User must fill in values from their Firebase console.** |
| `js/services/auth.js` | `signInWithGoogle()` — creates GoogleAuthProvider, calls `signInWithPopup`. `signOut()` — calls Firebase `signOut`. `getCurrentUser()` — returns `firebase.auth().currentUser`. |
| `js/screens/login.js` | `render()` returns a centered card with app title "Financial Dashboard", subtitle, and a styled Google sign-in button. On click, calls `signInWithGoogle()`. |
| `css/base.css` | CSS reset (box-sizing, margin 0). System font stack. Container max-width 1200px. `.screen` base class. Media query breakpoints: mobile (<768px), tablet (768-1024px), desktop (>1024px). |
| `css/colors.css` | CSS custom properties: `--bg`, `--surface`, `--text`, `--primary`, `--success` (income green), `--danger` (expense red), `--border`, `--shadow`. Light theme. |
| `css/screens/login.css` | Full-viewport centered layout. Card with shadow. Google button styled with Google brand colors. |

## Implementation Notes

- Use Firebase v9+ compat mode via CDN (`firebase-app-compat.js`, `firebase-auth-compat.js`, `firebase-firestore-compat.js`) — this avoids needing a bundler while still using modern Firebase.
- All JS files loaded as regular `<script>` tags (not modules) since there's no build step. Use an IIFE or namespace pattern (e.g., `window.App = {}`) to avoid globals.
- The router should update `document.title` and `location.hash` for each screen.
- Start script in package.json: `"start": "npx http-server . -p 3010 -c-1"`

## Verification

1. `npx http-server . -p 3010 -c-1`
2. Open `http://localhost:3010`
3. See login screen with Google sign-in button
4. Click sign-in → Google OAuth popup → redirect to empty dashboard screen
5. Refresh page → still authenticated (Firebase persists session)
6. Sign out → back to login screen
7. Navigate to `#dashboard` while signed out → redirected to login
