import { test, expect } from '../../fixtures/shop.fixture';

const BACKPACK = 'Sauce Labs Backpack';
const BIKE_LIGHT = 'Sauce Labs Bike Light';
const ONESIE = 'Sauce Labs Onesie';

test.describe('Cart', () => {
  test('cart badge follows items added and removed on the product list', async ({ inventoryPage }) => {
    const { cartBadge } = inventoryPage.header;
    await expect(cartBadge).toBeHidden();

    await inventoryPage.addToCart(BACKPACK, BIKE_LIGHT);
    await expect(cartBadge).toHaveText('2');

    await inventoryPage.removeFromCart(BACKPACK);
    await expect(cartBadge).toHaveText('1');

    await inventoryPage.removeFromCart(BIKE_LIGHT);
    await expect(cartBadge).toBeHidden();
  });

  test('cart lists exactly the items added, and removing one updates it', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addToCart(BACKPACK, BIKE_LIGHT, ONESIE);
    await inventoryPage.header.openCart();

    await expect(cartPage.title).toHaveText('Your Cart');
    await expect(cartPage.itemNames).toHaveText([BACKPACK, BIKE_LIGHT, ONESIE]);

    await cartPage.remove(BIKE_LIGHT);

    await expect(cartPage.itemNames).toHaveText([BACKPACK, ONESIE]);
    await expect(cartPage.header.cartBadge).toHaveText('2');
  });

  test('continue shopping returns to the product list and keeps the cart', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addToCart(BACKPACK);
    await inventoryPage.header.openCart();

    await cartPage.continueShoppingButton.click();

    await expect(inventoryPage.title).toHaveText('Products');
    await expect(inventoryPage.header.cartBadge).toHaveText('1');
  });
});

test.describe('Product sorting', () => {
  test('price low to high sorts products by ascending price', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('lohi');

    const prices = await inventoryPage.allPrices();
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('price high to low sorts products by descending price', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('hilo');

    const prices = await inventoryPage.allPrices();
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });
});
