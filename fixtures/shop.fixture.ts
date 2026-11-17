import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { USERS } from '../test-data/users';

type ShopFixtures = {
  loginPage: LoginPage;
  /** Inventory page, already logged in as standard_user. */
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
};

export const test = base.extend<ShopFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await use(loginPage);
  },

  // Every test that asks for inventoryPage gets its own fresh login, so tests never
  // depend on each other. Playwright gives each test a new browser context, which
  // also means an empty cart (the cart lives in the browser's localStorage).
  inventoryPage: async ({ page, loginPage }, use) => {
    await loginPage.login(USERS.standard);
    const inventoryPage = new InventoryPage(page);
    await base.expect(inventoryPage.title).toHaveText('Products');
    await use(inventoryPage);
  },

  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },

  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
});

export { expect } from '@playwright/test';
