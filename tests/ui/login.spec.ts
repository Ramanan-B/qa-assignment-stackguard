import { test, expect } from '../../fixtures/shop.fixture';
import { InventoryPage } from '../../pages/InventoryPage';
import { USERS } from '../../test-data/users';

test.describe('Login', () => {
  test('standard user can log in and sees the product list', async ({ page, loginPage }) => {
    await loginPage.login(USERS.standard);

    const inventory = new InventoryPage(page);
    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(inventory.title).toHaveText('Products');
    await expect(inventory.items).toHaveCount(6);
  });

  const failures = [
    {
      name: 'locked-out user is refused',
      username: USERS.lockedOut,
      password: undefined,
      error: 'Epic sadface: Sorry, this user has been locked out.',
    },
    {
      name: 'wrong password is refused',
      username: USERS.standard,
      password: 'wrong_password',
      error: 'Epic sadface: Username and password do not match any user in this service',
    },
    {
      name: 'empty username is refused',
      username: '',
      password: undefined,
      error: 'Epic sadface: Username is required',
    },
    {
      name: 'empty password is refused',
      username: USERS.standard,
      password: '',
      error: 'Epic sadface: Password is required',
    },
  ];

  for (const { name, username, password, error } of failures) {
    test(name, async ({ page, loginPage }) => {
      await loginPage.login(username, password);

      await expect(loginPage.error).toHaveText(error);
      await expect(page).not.toHaveURL(/inventory/);
    });
  }
});
