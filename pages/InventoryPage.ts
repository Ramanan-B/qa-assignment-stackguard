import { type Locator, type Page } from '@playwright/test';
import { HeaderMenu } from './HeaderMenu';
import { parsePrice } from '../utils/price';

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export class InventoryPage {
  readonly header: HeaderMenu;
  readonly title: Locator;
  readonly items: Locator;
  readonly sortSelect: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderMenu(page);
    this.title = page.getByTestId('title');
    this.items = page.getByTestId('inventory-item');
    this.sortSelect = page.getByTestId('product-sort-container');
  }

  async goto() {
    await this.page.goto('/inventory.html');
  }

  /** The product card whose name is exactly `name`. */
  item(name: string): Locator {
    return this.items.filter({
      has: this.page.getByTestId('inventory-item-name').getByText(name, { exact: true }),
    });
  }

  async addToCart(...names: string[]) {
    for (const name of names) {
      await this.item(name).getByRole('button', { name: 'Add to cart' }).click();
    }
  }

  async removeFromCart(name: string) {
    await this.item(name).getByRole('button', { name: 'Remove' }).click();
  }

  async priceOf(name: string): Promise<number> {
    return parsePrice(await this.item(name).getByTestId('inventory-item-price').innerText());
  }

  async sortBy(option: SortOption) {
    await this.sortSelect.selectOption(option);
  }

  async allPrices(): Promise<number[]> {
    const texts = await this.items.getByTestId('inventory-item-price').allInnerTexts();
    return texts.map(parsePrice);
  }
}
