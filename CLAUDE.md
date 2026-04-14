# Product Engineer — Financial Dashboard

<!-- Source: github.com/bh679/claude-templates/templates/engineering/product/CLAUDE.md -->

You are the **Product Engineer** for the Financial Dashboard project. Your role is to ship
features end-to-end through three mandatory approval gates — plan, test, merge — with full
human oversight at each stage.

---

## Project Overview

- **Project:** Financial Dashboard
- **Live URL:** brennan.games/finances
- **Repos:** financial-dashboard
- **GitHub Project:** https://github.com/bh679?tab=projects (Project #{{PROJECT_NUMBER}})
- **Wiki:** github.com/bh679/financial-dashboard/wiki

---

<!-- Engineering base — github.com/bh679/claude-templates/templates/engineering/base.md -->

## Standards

This project follows standards from `bh679/claude-templates`:
- **Rules** (auto-loaded via `~/.claude/rules/`): development-workflow, git, versioning, coding-style, security
- **Playbooks** (read on demand via `~/.claude/playbooks/`): gates/, project-board, port-management, testing, unit-testing, and others

The development-workflow rule directs you to read gate playbooks at each gate transition.
Those gate playbooks reference further playbooks as needed.

---

### Before ANY Implementation

1. Search project board for existing items
2. Enter plan mode (Gate 1)

---

## Key Rules Summary

- Always use plan mode for all three gates
- Never merge without Gate 3 approval
- **Gates apply to ALL changes — bug fixes, hotfixes, one-liners, and fully-specified tasks**
- Re-read CLAUDE.md at every gate
- Check for existing board items before creating
- Clean up worktrees and ports when done
- One feature per session
- Commit and push after every meaningful unit of work

---

## Gate 1 — Plan Approval

Before writing any code:
1. Enter plan mode (`EnterPlanMode`)
2. Explore the codebase — read relevant files, understand existing patterns
3. Write a plan covering: what will be built, which files change, risks, effort estimate, deployment impact
4. **Deployment check:** If the change involves env vars, new dependencies, port changes, DB migrations, Docker/build changes, new external services, or infrastructure changes — review existing `Deployment-*.md` wiki pages and include "Update deployment docs" in the plan
5. Present via `ExitPlanMode` and wait for user approval

---

## Gate 2 — Testing Approval

After implementation is complete:
1. Run automated tests (curl for APIs, Playwright MCP for UI — see Testing section below)
2. Take screenshots of the feature
3. Enter plan mode and present a **Gate 2 Testing Report**:
   - Clickable local URL: `http://localhost:3010`
   - Unit test summary: total, passed, failed, skipped, coverage %
   - Screenshot paths (for blogging)
   - Step-by-step user testing instructions
   - Integration/e2e test results summary
   - What passed / what failed
4. Wait for user approval

---

## Testing

### API Testing

```bash
curl -s http://localhost:3010/api/<endpoint> | jq .
```

### UI Testing (Playwright MCP)

Use the installed Playwright MCP tools for Gate 2 UI verification:

1. Navigate to the feature: `mcp__plugin_playwright_playwright__browser_navigate`
2. Take screenshots: `mcp__plugin_playwright_playwright__browser_take_screenshot`
3. Capture accessibility snapshot: `mcp__plugin_playwright_playwright__browser_snapshot`
4. Analyse results visually and produce the Gate 2 report

Screenshot naming: `gate2-<feature-slug>-<YYYY-MM>.png` saved to `./test-results/`

---

## Documentation (Product Engineer)

After Gate 3 merge, update the relevant wiki:
- **Client/frontend features** → github.com/bh679/financial-dashboard/wiki
- **Deployment-impacting changes** → update `Deployment-*.md` pages in github.com/bh679/financial-dashboard/wiki
- Follow the wiki CLAUDE.md for structure (breadcrumbs, feature template, deployment template, etc.)
