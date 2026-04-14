# Phase 2B: Navigation + Layout Shell

**Dependencies:** Phase 1 (routing, auth)
**Parallel:** Can run simultaneously with **Phase 2A**. No shared files.

## Goal

Build the persistent app chrome — header with user info and sign-out, sidebar navigation with active state, reusable summary card component, and the dashboard screen structure with placeholder data.

## Files to Create

| File | Purpose |
|---|---|
| `js/components/header.js` | Renders top bar: app title "Financial Dashboard" on the left, user avatar (from Google auth `photoURL`) + display name + sign-out button on the right. Mobile: compact layout with hamburger trigger for sidebar. |
| `js/components/sidebar.js` | Vertical nav with links: Dashboard, Import, Transactions, Reports. Each link calls `showScreen(name)`. Active state highlighted based on current screen. Mobile: slides in/out as overlay, triggered by hamburger in header. |
| `js/components/card.js` | Reusable summary card: `renderCard({ title, value, subtitle, color })` → returns HTML string. Used on dashboard for "Total Income", "Total Expenses", "Net Profit/Loss". Color-coded (green for income, red for expenses, blue for net). |
| `js/screens/dashboard.js` | Dashboard screen with: (1) row of 3 summary cards (placeholder values for now — "—"), (2) placeholder area for monthly bar chart (Phase 3), (3) placeholder area for category pie chart (Phase 3). Layout: cards in flex row, charts in 2-column grid below. |
| `css/components/header.css` | Fixed top bar. Flexbox layout. Avatar circle. Sign-out button. Z-index above sidebar. |
| `css/components/sidebar.css` | Fixed left sidebar (240px wide on desktop). Nav links with hover/active states. Mobile: transform translateX for slide animation, overlay backdrop. |
| `css/components/card.css` | Card with rounded corners, shadow, padding. Title muted, value large bold, subtitle small. Color accent on left border. |
| `css/screens/dashboard.css` | Cards row (flex, gap). Chart grid (2 columns on desktop, 1 on mobile). Content area padded to account for fixed header + sidebar. |

## Layout Architecture

```
+------------------------------------------+
|              HEADER (fixed top)           |
+--------+---------------------------------+
|        |                                 |
|  SIDE  |         CONTENT AREA            |
|  BAR   |     (screens render here)       |
|        |                                 |
| (fixed |                                 |
|  left) |                                 |
|        |                                 |
+--------+---------------------------------+
```

- Header: 60px height, fixed, full width
- Sidebar: 240px width, fixed, below header
- Content: margin-left 240px, margin-top 60px, padding 24px
- Mobile (<768px): sidebar hidden by default, hamburger toggles overlay

## Router Integration

The router's `showScreen()` must be updated to:
1. Render header + sidebar on every screen **except** login
2. Only replace the content area, not the full `#app`
3. Update sidebar active state when screen changes

Approach: `#app` contains `#header`, `#sidebar`, `#content`. Login screen replaces all of `#app`. Other screens only replace `#content` innerHTML.

## Verification

1. Sign in → see header with name/avatar, sidebar with 4 nav links, dashboard with 3 placeholder cards
2. Click each nav link → content area changes, sidebar highlights active link
3. Sign out → full login screen (no header/sidebar visible)
4. Resize to mobile → sidebar collapses, hamburger appears
5. Tap hamburger → sidebar slides in as overlay
6. Tap a nav link in mobile sidebar → sidebar closes, content changes
