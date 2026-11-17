# Bug Reports

All bugs below were reproduced on **2026-11-17** with:
- Chromium (Playwright 1.60) on Windows 11, desktop viewport.
- https://www.saucedemo.com and https://restful-booker.herokuapp.com.

Every account uses the password `secret_sauce`.

**Severity scale**

| Severity | Meaning |
|---|---|
| **Critical** | A customer can't complete a purchase, and there is no workaround. |
| **High** | Wrong orders, wrong money or wrong data reach the business, or a core feature is broken. |
| **Medium** | The feature works, but the result is wrong or misleading in a visible way. |
| **Low** | A cosmetic problem or a wrong technical detail, with little impact on users. |

> **Note on the faulty test accounts.** Sauce Demo ships `problem_user`, `error_user` and `visual_user` as intentionally broken accounts. The bugs found with them (BUG-03 to BUG-09) are written up as if they were real defects. These are the failures a production shop would have to catch.

## Summary

| ID | Title | Area | Severity | Automated test |
|---|---|---|---|---|
| [BUG-03](#bug-03) | Typing a last name fills the First Name field, so checkout is blocked | UI, `problem_user` | Critical | – |
| [BUG-04](#bug-04) | The Finish button does nothing, so the order can't be placed | UI, `error_user` | Critical | – |
| [BUG-01](#bug-01) | An order can be completed with an empty cart | UI, all users | High | [checkout.spec.ts](../tests/ui/checkout.spec.ts) |
| [BUG-05](#bug-05) | Checkout continues with an empty Last Name | UI, `error_user` | High | – |
| [BUG-06](#bug-06) | Add to cart does nothing for 3 of 6 products, and Remove doesn't work | UI, `problem_user`, `error_user` | High | – |
| [BUG-07](#bug-07) | The product list shows different prices from the price charged | UI, `visual_user` | High | – |
| [BUG-02](#bug-02) | The item total is shown as `$99.94999999999999` | UI, all users | Medium | [checkout.spec.ts](../tests/ui/checkout.spec.ts) |
| [BUG-08](#bug-08) | Every product shows the same placeholder image | UI, `problem_user` | Medium | – |
| [BUG-09](#bug-09) | Sorting has no effect on the product list | UI, `problem_user` | Medium | – |
| [BUG-API-02](#bug-api-02) | Creating a booking with missing fields returns 500 | API | Medium | [booking-negative.spec.ts](../tests/api/booking-negative.spec.ts) |
| [BUG-API-03](#bug-api-03) | A booking with checkout before check-in is accepted | API | Medium | [booking-negative.spec.ts](../tests/api/booking-negative.spec.ts) |
| [BUG-API-01](#bug-api-01) | Deleting a non-existent booking returns 405 instead of 404 | API | Low | [booking-negative.spec.ts](../tests/api/booking-negative.spec.ts) |

The automated tests for known bugs are marked `test.fail()`, so the suite stays green while the bug exists. When a bug is fixed, Playwright reports that test as an unexpected pass, which tells us to remove the marker.

---

## Sauce Demo: checkout flow

### BUG-01

**An order can be completed with an empty cart**

- **Account:** `standard_user` (any account)
- **Severity:** High

**Steps**

1. Log in as `standard_user`. Don't add any product.
2. Click the cart icon, then **Checkout**.
3. Enter a first name, last name and postal code (for example *Ana / Silva / 10001*), then click **Continue**.
4. Click **Finish**.

**Expected:** checkout isn't possible with an empty cart. The **Checkout** button is disabled, or a message like "Your cart is empty" is shown.

**Actual:**
- The overview shows no items, `Item total: $0` and `Total: $0.00`.
- **Finish** opens the confirmation page with "Thank you for your order!".

**Why High:** empty, unfulfillable orders reach the business, and the customer is told an order was placed. No money is charged and it's not a common customer path, so it is not Critical.

### BUG-02

**The item total is shown as `$99.94999999999999`**

- **Account:** `standard_user` (any account)
- **Severity:** Medium

**Steps**

1. Log in as `standard_user`.
2. Add these 5 products: Sauce Labs Bike Light ($9.99), Sauce Labs Bolt T-Shirt ($15.99), Sauce Labs Fleece Jacket ($49.99), Sauce Labs Onesie ($7.99) and Test.allTheThings() T-Shirt (Red) ($15.99). Together they cost $99.95.
3. Open the cart, click **Checkout**, fill in the details and click **Continue**.

**Expected:** `Item total: $99.95`. Every amount has exactly two decimal places.

**Actual:** `Item total: $99.94999999999999`. Tax ($8.00) and Total ($107.95) are correct.

**Why Medium:** the wrong number is shown on the page where the customer confirms payment, which hurts trust. The amount charged is still correct, so it's not High.

**Likely cause:** prices are added as floating-point numbers and never rounded for display. Calculating in cents, or formatting with `toFixed(2)`, would fix it.

### BUG-03

**Typing a last name fills the First Name field, so checkout is blocked**

- **Account:** `problem_user`
- **Severity:** Critical

**Steps**

1. Log in as `problem_user` and add the Sauce Labs Backpack to the cart.
2. Open the cart and click **Checkout**.
3. Type *Ana* in **First Name**, *Silva* in **Last Name** and *10001* in **Postal Code**.
4. Click **Continue**.

**Expected:** each value stays in its own field, and the user goes to the overview page.

**Actual:**
- The text typed into **Last Name** replaces the value in **First Name**: First Name shows *Silva* and Last Name stays empty.
- **Continue** shows "Error: Last Name is required".

**Why Critical:** the customer can't get past step one, so no purchase is possible and there's no workaround.

### BUG-04

**The Finish button does nothing, so the order can't be placed**

- **Account:** `error_user`
- **Severity:** Critical

**Steps**

1. Log in as `error_user` and add the Sauce Labs Backpack.
2. Open the cart, click **Checkout**, fill in the details and click **Continue**.
3. On the overview page, click **Finish**.

**Expected:** the confirmation page opens with "Thank you for your order!", and the cart is emptied.

**Actual:**
- Nothing happens. The user stays on `checkout-step-two.html` and the cart badge is unchanged.
- The browser console shows `TypeError: ... cesetRart is not a function`.

**Why Critical:** this is the last step of the purchase, so no order can be completed.

### BUG-05

**Checkout continues with an empty Last Name**

- **Account:** `error_user`
- **Severity:** High

**Steps**

1. Log in as `error_user` and add any product.
2. Open the cart and click **Checkout**.
3. Type *Ana* in **First Name**, *Silva* in **Last Name** and *10001* in **Postal Code**.
4. Click **Continue**.

**Expected:**
- The Last Name field keeps the typed value.
- If the field is empty, "Error: Last Name is required" is shown. This is how `standard_user` behaves.

**Actual:**
- The **Last Name** field doesn't keep any input and stays empty.
- **Continue** still goes to the overview page with no error.

**Why High:** orders without a customer's last name could reach the business, which is a problem for delivery and invoicing. It also shows that the required-field check can be bypassed for this account.

### BUG-06

**Add to cart does nothing for 3 of 6 products, and Remove doesn't work**

- **Accounts:** `problem_user`, `error_user`
- **Severity:** High

**Steps**

1. Log in as `problem_user`.
2. Click **Add to cart** on each of the 6 products, from top to bottom, and watch the cart badge.
3. Click **Remove** on a product that was added.
4. Repeat steps 1 and 2 as `error_user`.

**Expected:**
- Each **Add to cart** click adds the product and increases the badge by 1. With all 6 products added, the badge shows 6.
- **Remove** takes the product out and decreases the badge by 1.

**Actual:**
- For both accounts, these 3 products are never added: Sauce Labs Bolt T-Shirt, Sauce Labs Fleece Jacket and Test.allTheThings() T-Shirt (Red). The badge stops at 3.
- For `problem_user`, **Remove** doesn't change the cart. The badge stays at 3.
- For `error_user`, the browser console shows "Failed to add item to the cart." for each failed click, but no message is shown to the user.

**Why High:** half of the catalogue can't be bought, and the customer gets no feedback. Other products can still be bought, so it's not Critical.

### BUG-07

**The product list shows different prices from the price charged**

- **Account:** `visual_user`
- **Severity:** High

**Steps**

1. Log in as `visual_user` and note the prices on the product list.
2. Log in as `standard_user` in another browser and compare.
3. As `visual_user`, add the Sauce Labs Backpack, then check out to the overview page.

**Expected:** the product list shows the real prices, and the price shown matches the price charged.

**Actual:**
- Every price on the list is wrong. For example:
  - Backpack: $15.32 (real price $29.99)
  - Bike Light: $83.1 (real price $9.99)
  - Fleece Jacket: $13.91 (real price $49.99)
- The overview charges the real price: `Item total: $29.99`.
- Some prices are also missing their second decimal place, for example $83.1.

**Why High:** customers are charged a different price from the one they chose to buy at. This is misleading pricing and a likely source of complaints and refunds.

### BUG-08

**Every product shows the same placeholder image**

- **Account:** `problem_user`
- **Severity:** Medium

**Steps**

1. Log in as `problem_user`.
2. Look at the product images on the product list.

**Expected:** each product shows its own photo, as it does for `standard_user`, where there are 6 different images.

**Actual:** all 6 products show the same image, `sl-404…jpg`, which is a "not found" placeholder.

**Why Medium:** buying still works, but the customer can't see what they are buying, which hurts sales and trust.

### BUG-09

**Sorting has no effect on the product list**

- **Account:** `problem_user`
- **Severity:** Medium

**Steps**

1. Log in as `problem_user`.
2. In the sort menu, choose **Name (Z to A)**.
3. Then choose **Price (low to high)**.

**Expected:**
- After step 2, the list is in reverse alphabetical order, starting with "Test.allTheThings() T-Shirt (Red)".
- After step 3, the list is ordered from $7.99 up to $49.99.

**Actual:** the list stays in the default A to Z order after both choices.

**Why Medium:** a convenience feature is broken. It makes products harder to find, but it doesn't block buying.

---

## Restful-Booker API

**Base URL:** `https://restful-booker.herokuapp.com`. The token comes from `POST /auth` (admin / password123) and is sent as `Cookie: token=<token>`.

### BUG-API-02

**Creating a booking with missing fields returns 500**

- **Severity:** Medium

**Steps**

1. `POST /booking` with the body `{"firstname": "QA"}` and the header `Content-Type: application/json`.

**Expected:** `400 Bad Request` with a message that says which required fields are missing.

**Actual:** `500 Internal Server Error`, with the body `Internal Server Error`.

**Why Medium:**
- The server doesn't validate input, so a client mistake is reported as a server crash.
- The client gets no useful error message.
- Real 500 errors in monitoring get lost among these.

### BUG-API-03

**A booking with checkout before check-in is accepted**

- **Severity:** Medium

**Steps**

1. `POST /booking` with a complete, valid body, except that `"bookingdates": {"checkin": "2027-03-10", "checkout": "2027-03-01"}`.

**Expected:** `400 Bad Request`, because checkout must be after check-in.

**Actual:** `200 OK`. The booking is created with the impossible dates and gets a `bookingid`.

**Why Medium:** invalid bookings are stored, and anything that uses the dates, such as availability or price per night, will be wrong. The data is still readable and can be fixed, so it's not High.

### BUG-API-01

**Deleting a non-existent booking returns 405 instead of 404**

- **Severity:** Low

**Steps**

1. Get a token from `POST /auth`.
2. `DELETE /booking/999999999` with `Cookie: token=<token>`.

**Expected:** `404 Not Found`. This is what `GET /booking/999999999` returns.

**Actual:** `405 Method Not Allowed`.

**Why Low:**
- No data is harmed.
- However, 405 tells the client that DELETE isn't supported at all, so a client can't tell "this booking doesn't exist" from "you can't do that".
- It is also inconsistent with GET for the same id.

---

## Observed, not logged as bugs

These behaviours are unusual, but the API's own documentation describes them, so I treated them as design decisions to discuss, not as defects:

- `POST /auth` with a wrong password returns `200 OK` with `{"reason": "Bad credentials"}`, not `401`. The security-relevant part, that no token is issued, works correctly and is tested.
- A successful `DELETE /booking/{id}` returns `201 Created`, not `200` or `204`.
- `POST /booking` accepts a negative `totalprice`. No business rule for this was documented, so it should be confirmed with the product owner before it is logged as a bug.
