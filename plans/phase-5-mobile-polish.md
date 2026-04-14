# Phase 5: Mobile Polish

**Dependencies:** Phase 3 minimum (core UI must exist)
**Parallel:** Can partially overlap with Phase 4 (reports).

## Goal

Refine responsive behavior across all screens. Add mobile hamburger menu, optimize touch targets, add loading states, empty states, and error handling. Ensure the app is fully usable on mobile (375px+).

## Files to Modify

| File | Changes |
|---|---|
| `css/base.css` | Add/refine media queries for 375px, 768px, 1024px breakpoints. Mobile-first adjustments for font sizes, spacing, padding. |
| `js/components/sidebar.js` | Add hamburger toggle button. Sidebar slides in/out as overlay on mobile. Close on nav link click. Close on backdrop click. Body scroll lock when sidebar open. |
| `js/components/header.js` | Add hamburger icon button (visible only on mobile). Compact layout — hide display name, show only avatar. |
| `css/components/sidebar.css` | Transform translateX(-100%) when hidden on mobile. Transition animation. Backdrop overlay. Z-index stacking. |
| `css/components/header.css` | Mobile adjustments — hamburger positioning, compact spacing. |
| `css/components/card.css` | Stack cards vertically on mobile (flex-direction column). Full-width cards. |
| `css/components/transaction-table.css` | Horizontal scroll wrapper on mobile. Minimum column widths. Alternatively: card-based layout for each transaction on mobile (hide table, show cards). |
| `css/components/chart-panel.css` | Full-width charts on mobile. Reduce chart height. |
| `css/screens/dashboard.css` | Single column layout on mobile. Chart grid → stacked. |
| `css/screens/transactions.css` | Filter bar wraps on mobile. Stacked inputs. |
| `css/screens/import.css` | Full-width dropzone. Smaller preview table or card layout. |
| `css/screens/reports.css` | Stacked date pickers. Full-width export buttons. Responsive tables. |
| `js/router.js` | Add loading spinner during Firestore fetches. Show error message on fetch failure (with retry button). |

## Loading & Empty States

### Loading State
- Show a centered spinner (CSS-only animation) while Firestore queries run
- Skeleton cards on dashboard while data loads
- Table shows "Loading transactions..." placeholder

### Empty States
- **Dashboard (no data):** "No transactions yet. Import a Revolut CSV to get started." with link to Import screen
- **Transactions (no results):** "No transactions match your filters." with "Clear filters" button
- **Import (success):** "Successfully imported N transactions!" with link to Dashboard

### Error States
- **Auth error:** "Sign-in failed. Please try again." with retry button
- **Firestore error:** "Failed to load data. Check your connection." with retry button
- **CSV parse error:** "Could not parse this file. Please check it's a valid Revolut CSV export."
- **Import error:** "Failed to save N transactions. Please try again."

## Mobile-Specific Interactions

- Touch targets minimum 44x44px (Apple HIG)
- Swipe-to-dismiss for sidebar overlay
- Long-press on transaction row → edit modal (alternative to click)
- Pull-to-refresh on transactions list (optional, nice-to-have)

## Responsive Breakpoints

| Breakpoint | Layout |
|---|---|
| < 768px (mobile) | Single column. Sidebar hidden → hamburger. Cards stacked. Charts full-width. Tables scroll or card layout. |
| 768–1024px (tablet) | Sidebar visible but narrow (200px). 2-column chart grid. Cards in row. |
| > 1024px (desktop) | Full sidebar (240px). 2-column charts. Cards in row. Tables full-width. |

## Verification

1. Open Chrome DevTools → toggle device toolbar
2. Test at 375px (iPhone SE): all screens render correctly, no horizontal overflow
3. Test at 768px (iPad): sidebar visible, 2-column layout
4. Test at 1440px (desktop): full layout
5. Hamburger menu: opens/closes smoothly, backdrop dismisses
6. Import a CSV on mobile: dropzone works with tap, preview scrollable
7. Dashboard charts resize correctly when rotating device
8. Loading spinners appear during data fetches
9. Empty state shows on fresh account with no imports
10. Error state shows when offline (disconnect network in DevTools)
