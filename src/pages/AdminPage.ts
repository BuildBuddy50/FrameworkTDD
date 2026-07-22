import { Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { NewProduct } from '@data/testData';

/**
 * Admin dashboard: stats, product management (add/edit/delete),
 * customers, and orders.
 */
export class AdminPage extends BasePage {
  get storeAdminHeading(): Locator {
    return this.page.getByText('Store Admin').first();
  }

  get productNameInput(): Locator {
    return this.page.getByPlaceholder('Name *');
  }

  get productPriceInput(): Locator {
    return this.page.getByPlaceholder('Price *');
  }

  get productCategoryInput(): Locator {
    return this.page.getByPlaceholder('Category');
  }

  get productStockInput(): Locator {
    return this.page.getByPlaceholder('Stock');
  }

  get productDescriptionInput(): Locator {
    return this.page.getByPlaceholder('Description');
  }

  get addProductButton(): Locator {
    return this.page.getByRole('button', { name: /^(Add product|Save changes|Saving)/ });
  }

  async expectLoaded(): Promise<void> {
    await expect(this.storeAdminHeading).toBeVisible({ timeout: 15_000 });
  }

  /** Create a product through the admin form. */
  async addProduct(p: NewProduct): Promise<void> {
    await this.productNameInput.fill(p.name);
    await this.productPriceInput.fill(p.price);
    await this.productCategoryInput.fill(p.category);
    await this.productStockInput.fill(p.stock);
    await this.productDescriptionInput.fill(p.description);
    await this.addProductButton.click();
  }

  /** Row in the admin product list matching a name. */
  productRow(name: string): Locator {
    return this.page.locator('div', { hasText: name }).filter({ has: this.page.getByRole('button', { name: 'Delete' }) }).last();
  }

  async expectProductListed(name: string): Promise<void> {
    await expect(this.page.getByText(name).first()).toBeVisible({ timeout: 10_000 });
  }

  async deleteProduct(name: string): Promise<void> {
    await this.productRow(name).getByRole('button', { name: 'Delete' }).click();
  }
}
