# QA Engineer Assignment

Playwright + TypeScript tests for:

- **Sauce Demo** (https://www.saucedemo.com): UI tests for the main shopping journey (login, cart, checkout, logout).
- **Restful-Booker** (https://restful-booker.herokuapp.com): API tests for booking CRUD and failure cases.

## Setup

Requires Node.js 18+.

```bash
npm install
npx playwright install chromium
```

## Running tests

```bash
npm test            # all tests
npm run test:ui     # Sauce Demo UI tests only
npm run test:api    # Restful-Booker API tests only
npm run report      # open the last HTML report
```

## Project layout

| Path | What it holds |
|---|---|
| `pages/` | Page objects for Sauce Demo |
| `fixtures/` | Shared Playwright fixtures (logged-in page, API auth token) |
| `tests/ui/` | UI tests |
| `tests/api/` | API tests |
| `docs/` | Test plan, bug reports, AI notes |

## Status

Work in progress. This section will list anything not finished.
