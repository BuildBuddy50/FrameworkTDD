import { Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Storefront: product grid, search, sort, and "Add to cart".
 */
export class ShopPage extends BasePage {
  /** Every product card's "Add to cart" button. */
  get addToCartButtons(): Locator {
    return this.page.getByRole('button', { name: 'Add to cart' });
  }

  get productHeadings(): Locator {
    return this.page.locator('h3');
  }

  get sortSelect(): Locator {
    return this.page.locator('select').first();
  }

  get productCountText(): Locator {
    return this.page.getByText(/\d+ products/);
  }

  async gotoShop(): Promise<void> {
    await this.open('/');
    await expect(this.addToCartButtons.first()).toBeVisible({ timeout: 15_000 });
  }

  async productCount(): Promise<number> {
    return this.addToCartButtons.count();
  }

  async search(term: string): Promise<void> {
    await this.searchBox.fill(term);
    await this.page.waitForTimeout(400); // debounce-safe
  }

  async sortBy(label: 'Featured' | 'Price: Low to High' | 'Price: High to Low' | 'Top Rated'): Promise<void> {
    await this.sortSelect.selectOption({ label });
    await this.page.waitForTimeout(300);
  }

  /** Add the first visible product to the cart; returns its name. */
  async addFirstProductToCart(): Promise<string> {
    const name = (await this.productHeadings.first().innerText()).trim();
    await this.addToCartButtons.first().click();
    await this.expectToast(/added to cart/i);
    return name;
  }

  /** All product prices currently shown, top to bottom. */
  async visiblePrices(): Promise<number[]> {
    const texts = await this.page.locator('span.font-bold').allInnerTexts();
    return texts
      .map((t) => t.replace(/[^0-9.]/g, ''))
      .filter((t) => t.length > 0)
      .map(Number);
  }
}
