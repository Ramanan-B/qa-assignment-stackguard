import { test, expect } from '../../fixtures/shop.fixture';
import { newCustomer } from '../../test-data/users';
import { toCents } from '../../utils/price';

const BACKPACK = 'Sauce Labs Backpack';
const BIKE_LIGHT = 'Sauce Labs Bike Light';
// These five items sum to $99.95, which the site renders as $99.94999999999999
// (a floating-point rounding bug). All six items ($129.94) happen to render correctly.
const FIVE_ITEMS_99_95 = [
  'Sauce Labs Bike Light',
  'Sauce Labs Bolt T-Shirt',
  'Sauce Labs Fleece Jacket',
  'Sauce Labs Onesie',
  'Test.allTheThings() T-Shirt (Red)',
];
const TAX_RATE = 0.08;

test.describe('Checkout', () => {
  test('happy path: user can buy two items and the cart is emptied', async ({ page, inventoryPage, cartPage, checkoutPage }) => {
    await inventoryPage.addToCart(BACKPACK, BIKE_LIGHT);
    await inventoryPage.header.openCart();
    await cartPage.checkout();

    await expect(checkoutPage.title).toHaveText('Checkout: Your Information');
    await checkoutPage.fillInformation(newCustomer());
    await checkoutPage.continue();

    await expect(checkoutPage.title).toHaveText('Checkout: Overview');
    await expect(checkoutPage.itemNames).toHaveText([BACKPACK, BIKE_LIGHT]);
    await checkoutPage.finish();

    await expect(page).toHaveURL(/checkout-complete\.html$/);
    await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
    await expect(inventoryPage.header.cartBadge).toBeHidden();

    await checkoutPage.backHomeButton.click();
    await expect(inventoryPage.title).toHaveText('Products');
  });

  test('overview shows correct item total, 8% tax and total', async ({ inventoryPage, cartPage, checkoutPage }) => {
    const listPrices = [await inventoryPage.priceOf(BACKPACK), await inventoryPage.priceOf(BIKE_LIGHT)];
    await inventoryPage.addToCart(BACKPACK, BIKE_LIGHT);
    await inventoryPage.header.openCart();
    await cartPage.checkout();
    await checkoutPage.fillInformation(newCustomer());
    await checkoutPage.continue();

    // Prices on the overview match the product list.
    expect(await checkoutPage.itemPricesOnOverview()).toEqual(listPrices);

    const expectedItemTotal = listPrices.reduce((sum, p) => sum + toCents(p), 0);
    const expectedTax = Math.round(expectedItemTotal * TAX_RATE);
    const { itemTotal, tax, total } = await checkoutPage.summary();

    expect(toCents(itemTotal)).toBe(expectedItemTotal);
    expect(toCents(tax)).toBe(expectedTax);
    expect(toCents(total)).toBe(expectedItemTotal + expectedTax);
  });

  test('item total is shown with exactly two decimal places', async ({ inventoryPage, cartPage, checkoutPage }) => {
    test.fail(true, 'Known bug BUG-02: a $99.95 cart shows "Item total: $99.94999999999999"');

    await inventoryPage.addToCart(...FIVE_ITEMS_99_95);
    await inventoryPage.header.openCart();
    await cartPage.checkout();
    await checkoutPage.fillInformation(newCustomer());
    await checkoutPage.continue();

    for (const label of [checkoutPage.subtotalLabel, checkoutPage.taxLabel, checkoutPage.totalLabel]) {
      await expect(label).toHaveText(/\$\d+\.\d{2}$/);
    }
  });

  const missingFields = [
    { field: 'first name', customer: { firstName: '' }, error: 'Error: First Name is required' },
    { field: 'last name', customer: { lastName: '' }, error: 'Error: Last Name is required' },
    { field: 'postal code', customer: { postalCode: '' }, error: 'Error: Postal Code is required' },
  ];

  for (const { field, customer, error } of missingFields) {
    test(`cannot continue without ${field}`, async ({ inventoryPage, cartPage, checkoutPage }) => {
      await inventoryPage.addToCart(BACKPACK);
      await inventoryPage.header.openCart();
      await cartPage.checkout();

      await checkoutPage.fillInformation({ ...newCustomer(), ...customer });
      await checkoutPage.continue();

      await expect(checkoutPage.error).toHaveText(error);
      await expect(checkoutPage.title).toHaveText('Checkout: Your Information');
    });
  }

  test('cancelling on the information step returns to the cart with items kept', async ({ inventoryPage, cartPage, checkoutPage }) => {
    await inventoryPage.addToCart(BACKPACK);
    await inventoryPage.header.openCart();
    await cartPage.checkout();

    await checkoutPage.cancelButton.click();

    await expect(cartPage.title).toHaveText('Your Cart');
    await expect(cartPage.itemNames).toHaveText([BACKPACK]);
  });

  test('cancelling on the overview step returns to products with items kept', async ({ inventoryPage, cartPage, checkoutPage }) => {
    await inventoryPage.addToCart(BACKPACK);
    await inventoryPage.header.openCart();
    await cartPage.checkout();
    await checkoutPage.fillInformation(newCustomer());
    await checkoutPage.continue();

    await checkoutPage.cancelButton.click();

    await expect(inventoryPage.title).toHaveText('Products');
    await expect(inventoryPage.header.cartBadge).toHaveText('1');
  });

  test('checkout is blocked when the cart is empty', async ({ inventoryPage, cartPage }) => {
    test.fail(true, 'Known bug BUG-01: an order can be completed with an empty cart');

    await inventoryPage.header.openCart();
    await expect(cartPage.items).toHaveCount(0);

    // Expected: checkout is unavailable for an empty cart.
    await expect(cartPage.checkoutButton).toBeDisabled({ timeout: 2_000 });
  });
});
