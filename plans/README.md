# Financial Dashboard — Implementation Plans

## Overview

Business finance dashboard for two verticals — **Tech Work** and **Freediving Work**. Imports Revolut CSV statements, auto-categorizes transactions, visualizes earnings vs expenses, and exports data for Australian tax returns and JobSeeker applications.

- **Stack:** Vanilla HTML/CSS/JS (no frameworks, no build step)
- **Auth:** Firebase Google OAuth
- **Data:** Firebase Firestore
- **Charts:** Chart.js (CDN)
- **CSV:** PapaParse (CDN)
- **Hosting:** brennan.games/finances
- **Local dev:** `npx http-server . -p 3010 -c-1`

## Phases

| Phase | Plan File | Depends On | Can Parallel With |
|---|---|---|---|
| 1 | [phase-1-foundation.md](phase-1-foundation.md) | — | Nothing (must be first) |
| 2A | [phase-2a-data-import.md](phase-2a-data-import.md) | Phase 1 | **Phase 2B** |
| 2B | [phase-2b-navigation-layout.md](phase-2b-navigation-layout.md) | Phase 1 | **Phase 2A** |
| 3 | [phase-3-visualizations-transactions.md](phase-3-visualizations-transactions.md) | Phase 2A + 2B | Nothing |
| 4 | [phase-4-reports-export.md](phase-4-reports-export.md) | Phase 3 | Phase 5 (partial) |
| 5 | [phase-5-mobile-polish.md](phase-5-mobile-polish.md) | Phase 3 | Phase 4 (partial) |

## Parallelism Map

```
Phase 1: Foundation + Auth
   |
   +---> Phase 2A: Data Layer + Import ---+
   |                                       +---> Phase 3: Charts + Transactions
   +---> Phase 2B: Nav + Layout Shell ----+          |
                                                     +---> Phase 4: Reports + Export
                                                     |          |
                                                     +---> Phase 5: Mobile Polish
                                                            (overlaps Phase 4)
```

## Prerequisites (User Action)

1. Create a Firebase project at console.firebase.google.com
2. Enable **Google** sign-in provider under Authentication
3. Create a **Firestore** database
4. Register a web app and copy the config
5. Add `localhost:3010` and `brennan.games` to authorized domains

## File Structure

```
index.html
css/
  base.css              — reset, typography, responsive breakpoints
  colors.css            — CSS custom properties
  components/           — header, sidebar, card, chart-panel, transaction-table,
                          import-dropzone, modal, category-badge
  screens/              — login, dashboard, transactions, import, reports
js/
  main.js               — entry point, Firebase init, auth observer
  router.js             — screen map, showScreen(), auth guard
  state.js              — getState(), setState()
  firebase-config.js    — Firebase project config
  components/           — header, sidebar, card, chart-panel, transaction-table,
                          import-dropzone, modal, category-badge
  screens/              — login, dashboard, transactions, import, reports
  utils/                — csv-parser, categorizer, formatters, date-utils, export
  services/             — auth, firestore
```

## Firestore Data Model

```
users/{uid}/transactions/{docId}
{
  date: Timestamp,
  description: string,
  amount: number,
  currency: string,
  type: "income" | "expense",
  category: string,              // "Claude API", "AWS", "Domains", etc.
  business: "Tech Work" | "Freediving Work" | "Personal",
  source: "revolut-csv",
  importedAt: Timestamp,
  rawRow: object                 // original CSV row for audit trail
}
```

## Verification (End-to-End Golden Path)

Sign in → Import Revolut CSV → Verify auto-categorization → Check dashboard charts → Filter transactions → Export tax CSV → Export JobSeeker summary → Sign out
