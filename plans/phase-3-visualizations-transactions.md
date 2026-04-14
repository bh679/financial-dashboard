# Phase 3: Dashboard Visualizations + Transactions List

**Dependencies:** Phase 2A (Firestore service + data model) AND Phase 2B (layout shell + card component)
**Parallel:** Nothing — both 2A and 2B must be complete.

## Goal

Wire real Firestore data into Chart.js visualizations on the dashboard. Build the full transactions list screen with filtering, sorting, search, pagination, and inline category editing.

## Files to Create / Modify

| File | Action | Purpose |
|---|---|---|
| `js/screens/dashboard.js` | **Modify** | Replace placeholder cards with live Firestore aggregates. Add monthly income vs expenses bar chart (Chart.js). Add category breakdown pie chart. Add business split donut chart. Add date range selector (current month / current year / all time). |
| `js/components/chart-panel.js` | **Create** | Reusable Chart.js wrapper: `renderChart({ containerId, type, data, options })`. Handles canvas creation, responsive resize, destroy-on-rerender (prevents Chart.js memory leaks). |
| `js/components/transaction-table.js` | **Create** | Sortable table component: `renderTransactionTable(transactions, options)`. Columns: Date, Description, Amount, Category, Business. Click column header to sort. Pagination (25 per page). Row click opens edit modal. Color-code amounts (green positive, red negative). |
| `js/components/category-badge.js` | **Create** | `renderCategoryBadge(category, business)` → colored badge HTML. Each category gets a consistent color. Business type shown as a subtle label. |
| `js/components/modal.js` | **Create** | Reusable modal: `showModal({ title, content, onConfirm, onCancel })`. Backdrop click to close. Escape key to close. Trap focus inside modal for accessibility. Used for transaction edit and delete confirmation. |
| `js/screens/transactions.js` | **Create** | Transactions list screen. Filter bar: date range (from/to inputs), business dropdown (Tech Work / Freediving Work / All), category dropdown, type (income/expense/all), text search. Filters update Firestore query. Results in transaction table. Bulk actions: delete selected. Edit modal for changing category/business on a single transaction. |
| `css/components/chart-panel.css` | **Create** | Chart container with aspect ratio. Responsive canvas. |
| `css/components/transaction-table.css` | **Create** | Table with alternating row colors. Sortable header indicators. Pagination controls. Responsive: horizontal scroll on mobile. |
| `css/components/category-badge.css` | **Create** | Pill-shaped badge. Color variations per category. |
| `css/components/modal.css` | **Create** | Centered modal with backdrop. Animation (fade in). Responsive width. |
| `css/screens/transactions.css` | **Create** | Filter bar layout (flex wrap). Table container. |

## Dashboard Layout

```
+---------------------------------------------------+
|  [Total Income]   [Total Expenses]   [Net P/L]    |   ← summary cards
+---------------------------------------------------+
|  [Date Range: Month ▼ | Year ▼ | All]             |   ← filter
+---------------------------+-----------------------+
|                           |                       |
|   Monthly Bar Chart       |  Category Pie Chart   |
|   (income vs expenses)    |  (where money goes)   |
|                           |                       |
+---------------------------+-----------------------+
|                                                   |
|   Business Split (Tech Work vs Freediving Work)   |
|   Donut chart or horizontal bar                   |
|                                                   |
+---------------------------------------------------+
```

## Chart Specifications

### Monthly Bar Chart
- X-axis: months (Jan–Dec or filtered range)
- Y-axis: dollar amount
- Two bars per month: income (green) and expenses (red)
- Tooltip shows exact amounts
- Stacked option toggle

### Category Pie Chart
- Segments: each expense category (Claude API, AWS, Domains, Freediving, etc.)
- Legend with amounts
- Click segment to filter transactions list

### Business Donut
- Two segments: Tech Work total, Freediving Work total
- Center text: overall net

## Data Flow

1. On dashboard render → call `getTransactions(dateFilter)` from Firestore
2. Aggregate client-side: sum by month, sum by category, sum by business
3. Pass aggregated data to Chart.js instances
4. Summary cards: computed from same query results
5. Cache results in state to avoid re-querying on screen switches

## Verification

1. Import a CSV with mixed transactions (Phase 2A must be done)
2. Navigate to Dashboard → verify cards show correct totals
3. Monthly chart shows bars for months with transactions
4. Pie chart shows category breakdown
5. Change date range → charts and cards update
6. Navigate to Transactions → see all imported transactions
7. Filter by "Tech Work" → only tech transactions shown
8. Search "anthropic" → filtered to Claude API transactions
9. Click a row → edit modal → change category → save → table updates
10. Sort by amount → verify order changes
