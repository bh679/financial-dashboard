# Phase 2A: Data Layer + Import

**Dependencies:** Phase 1 (auth + Firebase SDK loaded)
**Parallel:** Can run simultaneously with **Phase 2B**. No shared files.

## Goal

Build the Firestore data access layer, Revolut CSV parser using PapaParse, auto-categorization engine, and the Import screen with drag-and-drop file upload, preview, and confirmation.

## Files to Create

| File | Purpose |
|---|---|
| `js/services/firestore.js` | CRUD operations scoped to `users/{uid}/transactions`. Functions: `addTransactions(transactions[])` — batch write; `getTransactions(filters?)` — query with optional date range, business, category filters; `updateTransaction(id, updates)` — update category/business; `deleteTransaction(id)`; `getMonthlyAggregates(year)` — query and group by month. |
| `js/utils/csv-parser.js` | Wraps PapaParse. `parseRevolutCSV(file)` → returns promise of normalized transaction objects. Maps Revolut columns to app data model. Handles date parsing, amount sign detection (negative = expense, positive = income), currency extraction. Skips header rows and empty rows. |
| `js/utils/categorizer.js` | `categorizeTransaction(description)` → returns `{ category, business }`. Rule-based keyword matching against description field. See rules table below. `getCategoryRules()` returns the full rules list. `addCustomRule(keyword, category, business)` for future extensibility. |
| `js/utils/date-utils.js` | `parseDate(dateStr)` — handles Revolut date formats. `getMonthKey(date)` → "2024-03". `getYearKey(date)` → "2024". `formatDate(date)` → human-readable. `isInRange(date, start, end)`. `getMonthName(monthKey)`. |
| `js/utils/formatters.js` | `formatCurrency(amount, currency)` → "$1,234.56". `formatNumber(n)`. `formatPercent(n)`. `truncateText(str, maxLen)`. |
| `js/screens/import.js` | Import screen with: (1) drag-and-drop zone for CSV files, (2) file input fallback, (3) preview table showing parsed rows with auto-assigned categories, (4) ability to edit category/business before import, (5) "Import All" and "Cancel" buttons. On confirm, writes to Firestore via `addTransactions()`. Shows success count. |
| `js/components/import-dropzone.js` | Reusable dropzone component. Handles dragover/dragleave/drop events. File type validation (.csv only). Visual feedback (border highlight on drag). Accepts an `onFile(file)` callback. |
| `css/screens/import.css` | Import screen layout. Preview table styles. |
| `css/components/import-dropzone.css` | Dashed border dropzone. Drag-active state. Icon and text styling. |

## Auto-Categorization Rules

| Keywords (case-insensitive) | Category | Business |
|---|---|---|
| `anthropic`, `claude` | Claude API | Tech Work |
| `aws`, `amazon web services` | AWS | Tech Work |
| `namecheap`, `godaddy`, `cloudflare`, `domain` | Domains | Tech Work |
| `github`, `vercel`, `netlify`, `heroku`, `digitalocean` | Hosting & Tools | Tech Work |
| `ssi`, `aida`, `molchanov`, `freediv`, `apnea` | Freediving | Freediving Work |
| `wetsuit`, `fins`, `mask`, `snorkel`, `dive` | Freediving Equipment | Freediving Work |
| *(no match)* | Uncategorized | *(user must assign)* |

## Revolut CSV Parsing Notes

- PapaParse auto-detects delimiters and handles quoted fields
- Revolut CSV columns typically include: Type, Product, Started Date, Completed Date, Description, Amount, Fee, Currency, State, Balance
- Negative amounts = money out (expense), positive = money in (income)
- Filter out rows where State !== "COMPLETED"
- Store the raw CSV row in `rawRow` field for audit

## Firestore Security Rules (document for later)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/transactions/{transactionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Verification

1. Prepare a sample Revolut CSV (or mock one with the expected columns)
2. Navigate to Import screen
3. Drag a CSV file onto the dropzone
4. Verify: rows appear in preview table with auto-assigned categories
5. Edit a category in the preview → verify it updates
6. Click "Import All" → verify success message
7. Check Firestore console → transactions exist under `users/{uid}/transactions`
8. Import the same file again → should handle duplicates gracefully (by date+description+amount)
