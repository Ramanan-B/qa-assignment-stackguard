import { test, expect } from '../../fixtures/shop.fixture';

test.describe('Logout', () => {
  test('logout returns to the login page', async ({ page, inventoryPage, loginPage }) => {
    await inventoryPage.header.logout();

    await expect(page).toHaveURL(/saucedemo\.com\/$/);
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('protected pages cannot be opened after logout', async ({ page, inventoryPage, loginPage }) => {
    await inventoryPage.header.logout();
    await expect(loginPage.loginButton).toBeVisible();

    for (const path of ['/inventory.html', '/cart.html', '/checkout-step-one.html']) {
      await page.goto(path);
      await expect(loginPage.error).toHaveText(
        `Epic sadface: You can only access '${path}' when you are logged in.`,
      );
    }
  });

  test('browser Back after logout does not show the product list', async ({ page, inventoryPage, loginPage }) => {
    await inventoryPage.header.logout();
    await expect(loginPage.loginButton).toBeVisible();

    await page.goBack();

    await expect(inventoryPage.items).toHaveCount(0);
    await expect(loginPage.loginButton).toBeVisible();
  });
});
