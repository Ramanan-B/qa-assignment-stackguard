# QA Engineer Assignment

Playwright + TypeScript tests for:

- **Sauce Demo** (https://www.saucedemo.com): UI tests for login → cart → checkout → logout.
- **Restful-Booker** (https://restful-booker.herokuapp.com): API tests for creating, reading, updating and deleting bookings, plus failure cases.

| Deliverable | Where |
|---|---|
| Test plan: risks, top 10 test cases, automate or not | [docs/TEST_PLAN.md](docs/TEST_PLAN.md) |
| UI tests (22) | [tests/ui/](tests/ui/) |
| API tests (16) | [tests/api/](tests/api/) |
| Bug reports (12) | [docs/BUG_REPORTS.md](docs/BUG_REPORTS.md) |
| How AI was used | [docs/AI_NOTES.md](docs/AI_NOTES.md) |

---

## 1. Set up

You need **Node.js 20 or newer** and **git**.

```bash
git clone https://github.com/Ramanan-B/qa-assignment-stackguard.git
cd qa-assignment-stackguard
npm install
npx playwright install chromium
```

No accounts, passwords or `.env` file are needed. Both sites are public.

## 2. Run the tests

```bash
npm test               # all 38 tests (UI + API)
npm run test:ui        # only the Sauce Demo UI tests
npm run test:api       # only the Restful-Booker API tests
npm run report         # open the HTML report of the last run in the browser
```

**What you should see:** `38 passed`.

Five lines start with `x` instead of `✓`. These are the **known-bug tests**. They are expected to fail while the bug exists, so Playwright counts them as passed. See the next section.

---

## 3. Check the bugs yourself

### Option A: re-run the automated bug checks (one command)

The 5 tests for known bugs are tagged `@known-bug`:

```bash
npx playwright test --grep @known-bug
```

| Bug | Test | What it checks |
|---|---|---|
| BUG-01 | `checkout is blocked when the cart is empty` | An empty cart can't be checked out |
| BUG-02 | `item total is shown with exactly two decimal places` | A $99.95 cart is shown as `$99.95` |
| BUG-API-01 | `deleting a booking that does not exist returns 404` | DELETE with a wrong id gives 404 |
| BUG-API-02 | `creating a booking with required fields missing returns 400` | A booking with missing fields gives 400 |
| BUG-API-03 | `creating a booking with checkout before checkin is rejected` | Impossible dates are refused |

**How to read the result**

| You see | Meaning |
|---|---|
| `x` on the line, and `5 passed` at the end | All 5 bugs are **still there**. The tests failed, as expected. |
| A test marked as failed with *"Expected to fail, but passed"* | That bug has been **fixed**. Remove the `test.fail(...)` line from that test. |

**To see the actual wrong value**, for example the real `$99.94999999999999` text:

1. Open the test file and comment out its `test.fail(...)` line.
2. Run the test on its own, then open the report:
   ```bash
   npx playwright test -g "exactly two decimal places"
   npm run report
   ```

The report shows *Expected* and *Received* side by side, with a screenshot and trace for UI tests. Put the `test.fail(...)` line back afterwards.

### Option B: check by hand

Full steps for every bug are in [docs/BUG_REPORTS.md](docs/BUG_REPORTS.md). The quick checks:

**Sauce Demo.** Log in at https://www.saucedemo.com with password `secret_sauce`.

| Bug | Log in as | Do this | You will see |
|---|---|---|---|
| BUG-01 | `standard_user` | Add nothing. Cart → Checkout → fill the form → Continue → Finish | "Thank you for your order!" for an empty cart |
| BUG-02 | `standard_user` | Add Bike Light, Bolt T-Shirt, Fleece Jacket, Onesie and the red T-Shirt → Checkout → Continue | `Item total: $99.94999999999999` |
| BUG-03 | `problem_user` | Add any item → Checkout → type a first name, then a last name | The last name replaces the first name. Continue says "Last Name is required" |
| BUG-04 | `error_user` | Add any item → Checkout → fill the form → Continue → Finish | Nothing happens |
| BUG-05 | `error_user` | Add any item → Checkout → type a last name | The field stays empty, but Continue still works |
| BUG-06 | `problem_user` | Click "Add to cart" on all 6 products | The cart badge stops at 3 |
| BUG-07 | `visual_user` | Note the Backpack price → add it → Checkout → Continue | The list shows a different price from the one charged ($29.99) |
| BUG-08 | `problem_user` | Look at the product list | Every product has the same image |
| BUG-09 | `problem_user` | Sort by "Name (Z to A)" | The order doesn't change |

**Restful-Booker.** Run these in Git Bash, macOS or Linux. In Windows PowerShell, type `curl.exe` instead of `curl`.

```bash
# BUG-API-02: missing fields. Expected 400, you get 500.
curl -i -X POST https://restful-booker.herokuapp.com/booking \
  -H "Content-Type: application/json" -d '{"firstname":"QA"}'

# BUG-API-03: checkout before check-in. Expected 400, you get 200 and a booking id.
curl -i -X POST https://restful-booker.herokuapp.com/booking \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -d '{"firstname":"QA","lastname":"Check","totalprice":150,"depositpaid":true,"bookingdates":{"checkin":"2027-03-10","checkout":"2027-03-01"}}'

# BUG-API-01: delete a booking that doesn't exist. Expected 404, you get 405.
# 1) get a token
curl -X POST https://restful-booker.herokuapp.com/auth \
  -H "Content-Type: application/json" -d '{"username":"admin","password":"password123"}'
# 2) put the token in place of <TOKEN>
curl -i -X DELETE https://restful-booker.herokuapp.com/booking/999999999 \
  -H "Cookie: token=<TOKEN>"
```

The BUG-API-03 command creates a real booking on the shared site. Delete it afterwards with `curl -X DELETE https://restful-booker.herokuapp.com/booking/<ID> -H "Cookie: token=<TOKEN>"`.

---

## 4. What the tests cover

**UI: Sauce Demo (22 tests)**

| File | Tests | Covers |
|---|---|---|
| [login.spec.ts](tests/ui/login.spec.ts) | 5 | Valid login, locked-out user, wrong password, empty username, empty password |
| [cart.spec.ts](tests/ui/cart.spec.ts) | 5 | Cart badge, cart contents and removing an item, Continue Shopping, sorting by price |
| [checkout.spec.ts](tests/ui/checkout.spec.ts) | 9 | Full purchase, totals and 8% tax, two-decimal amounts, each required field, cancel on each step, empty cart |
| [logout.spec.ts](tests/ui/logout.spec.ts) | 3 | Logout, protected pages blocked after logout, browser Back after logout |

**API: Restful-Booker (16 tests)**

| File | Tests | Covers |
|---|---|---|
| [auth.spec.ts](tests/api/auth.spec.ts) | 2 | Token for valid login, no token for a wrong password |
| [booking-crud.spec.ts](tests/api/booking-crud.spec.ts) | 6 | Create, read, search by name, full update (PUT), partial update (PATCH), delete |
| [booking-negative.spec.ts](tests/api/booking-negative.spec.ts) | 8 | Missing or invalid token (403 and data unchanged), wrong id (404), invalid input |

## 5. Project layout

| Folder | What it holds |
|---|---|
| `pages/` | Page objects: one class per Sauce Demo page |
| `api/` | `BookingClient`: one method per Restful-Booker endpoint |
| `fixtures/` | Shared setup: a logged-in shop, the API client, an auth token, and automatic clean-up of bookings |
| `test-data/` | Test users, and generators for unique customers and bookings |
| `utils/` | Price helpers that do the maths in cents |
| `tests/ui/`, `tests/api/` | The tests |
| `docs/` | Test plan, bug reports, AI notes |

## 6. How the tests are built

- **Page objects.** Locators live in one place per page, so a UI change is fixed once.
- **Clear locators.** The tests use the site's `data-test` attributes (`getByTestId`) and roles (`getByRole`), never CSS or XPath that depends on layout.
- **No fixed waits.** There is no `waitForTimeout`. Playwright waits automatically for elements and assertions.
- **Independent tests.** Each test uses a fresh browser and logs in on its own, so tests can run in any order and in parallel.
- **Tests create their own data.**
  - Each test makes its own customer or booking, with a unique name.
  - Every booking a test creates is deleted afterwards, even if the test fails, because the API is shared by everyone.
- **Known bugs use `test.fail()`.** The test describes the correct behaviour and is marked as expected to fail. The suite stays green, and we are told as soon as the bug is fixed.

## 7. Status: what's not done

- **Automated checks for BUG-03 to BUG-09.** These bugs come from the deliberately faulty test accounts (`problem_user`, `error_user`, `visual_user`). They are reproduced and documented, but don't have automated tests yet.
- **GitHub Actions workflow** (bonus): not added yet.
- **Sort by name** isn't automated. Only the price sorts are.
- **Other browsers.** Only Chromium is used. Firefox and WebKit could be added in `playwright.config.ts`.
- **Manual by design:** input edge cases and exploratory testing (test cases 9 and 10 in the test plan).
- **Out of scope:** accessibility, performance and security testing.
