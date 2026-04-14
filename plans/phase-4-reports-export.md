# Phase 4: Reports + Export

**Dependencies:** Phase 3 (working data queries and aggregation logic)
**Parallel:** Phase 5 (mobile polish) can partially overlap.

## Goal

Build the Reports screen with configurable date ranges, business filtering, summary tables, and two export formats: a detailed CSV for tax/accounting and a summary report for JobSeeker applications.

## Files to Create

| File | Purpose |
|---|---|
| `js/screens/reports.js` | Reports screen with: (1) date range picker (custom from/to, or presets: This Month, Last Month, This Quarter, This Financial Year, Last Financial Year, All Time), (2) business filter toggle (Tech Work / Freediving Work / All), (3) summary tables showing monthly breakdown and category totals, (4) export buttons for Tax CSV and JobSeeker Summary. |
| `js/utils/export.js` | `exportTaxCSV(transactions, dateRange)` — generates and downloads a CSV file. `exportJobSeekerSummary(transactions, dateRange)` — generates and downloads a text/HTML summary. `downloadFile(content, filename, mimeType)` — helper to trigger browser download. |
| `css/screens/reports.css` | Reports layout. Date picker row. Summary tables. Export button group. Print-friendly styles. |

## Tax CSV Export Format

Filename: `financial-report-{startDate}-to-{endDate}.csv`

Columns:
```
Date, Description, Amount, Currency, Category, Business, Type
2024-03-15, Anthropic API, -45.00, AUD, Claude API, Tech Work, Expense
2024-03-16, Client Payment, 2500.00, AUD, Freelance, Tech Work, Income
```

- Sorted by date ascending
- Negative amounts for expenses, positive for income
- Include a summary row at the bottom: Total Income, Total Expenses, Net

## JobSeeker Summary Export Format

Filename: `jobseeker-summary-{startDate}-to-{endDate}.txt`

```
FINANCIAL SUMMARY
Period: 1 March 2024 — 31 March 2024
Generated: 14 April 2026

INCOME
  Tech Work:        $2,500.00
  Freediving Work:  $1,200.00
  Total Income:     $3,700.00

EXPENSES
  Tech Work:        $890.00
    Claude API:     $245.00
    AWS:            $520.00
    Domains:        $125.00
  Freediving Work:  $340.00
    Equipment:      $340.00
  Total Expenses:   $1,230.00

NET INCOME:         $2,470.00

---
This report was generated from imported bank statements.
```

## Australian Financial Year

The date presets should use Australian financial year (1 July – 30 June):
- "This Financial Year" = 1 July of current FY to today
- "Last Financial Year" = 1 July to 30 June of previous FY

## Reports Screen Layout

```
+---------------------------------------------------+
|  Date Range: [This FY ▼] [1 Jul 2025] — [Today]   |
|  Business:   [All ▼]                               |
+---------------------------------------------------+
|                                                    |
|  MONTHLY BREAKDOWN TABLE                           |
|  Month | Income | Expenses | Net                   |
|  Jul 2025 | $3,200 | $1,100 | $2,100             |
|  Aug 2025 | $2,800 | $950  | $1,850              |
|  ...                                               |
|  TOTALS   | $18,500 | $7,200 | $11,300            |
|                                                    |
+---------------------------------------------------+
|                                                    |
|  CATEGORY BREAKDOWN TABLE                          |
|  Category | Business | Total | % of Expenses       |
|  Claude API | Tech | $2,940 | 40.8%               |
|  AWS | Tech | $1,560 | 21.7%                      |
|  ...                                               |
|                                                    |
+---------------------------------------------------+
|                                                    |
|  [Export Tax CSV]  [Export JobSeeker Summary]       |
|                                                    |
+---------------------------------------------------+
```

## Verification

1. Navigate to Reports screen
2. Select "This Financial Year" → tables populate with correct date range
3. Filter to "Tech Work" → only tech categories shown
4. Click "Export Tax CSV" → CSV file downloads with correct data
5. Open CSV in Excel/Numbers → verify columns, amounts, totals
6. Click "Export JobSeeker Summary" → text file downloads
7. Verify summary matches the on-screen totals
8. Test "Last Financial Year" preset → correct July–June range
9. Test custom date range → tables update correctly
