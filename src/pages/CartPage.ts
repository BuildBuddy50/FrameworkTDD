import { Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { CheckoutInfo } from '@data/testData';

/**
 * Cart -> Checkout -> Order confirmation flow.
 */
export class CartPage extends BasePage {
  get proceedButton(): Locator {
    return this.page.getByRole('button', { name: 'Proceed to checkout' });
  }

  get placeOrderButton(): Locator {
    return this.page.getByRole('button', { name: /Place order/ });
  }

  get couponInput(): Locator {
    return this.page.getByPlaceholder('Coupon code');
  }

  get applyCouponButton(): Locator {
    return this.page.getByRole('button', { name: 'Apply' });
  }

  get emptyMessage(): Locator {
    return this.page.getByText('Your cart is empty.');
  }

  async goToCart(): Promise<void> {
    await this.cartButton.click();
  }

  async proceedToCheckout(): Promise<void> {
    await this.proceedButton.click();
  }

  /** Fill the checkout form. Field labels come straight from the app. */
  async fillCheckout(info: CheckoutInfo): Promise<void> {
    await this.fillByLabel('Full name', info.name);
    await this.fillByLabel('Email', info.email);
    await this.fillByLabel('Phone', info.phone);
    await this.fillByLabel('Address', info.address);
    await this.fillByLabel('City', info.city);
    await this.fillByLabel('ZIP / Postal', info.zip);
    // Card fields (default payment method is card).
    await this.fillByLabel('Name on card', info.cardName).catch(() => {});
    await this.fillByLabel('Card number', info.cardNumber).catch(() => {});
    await this.fillByLabel('Expiry (MM/YY)', info.expiry).catch(() => {});
    await this.fillByLabel('CVC', info.cvc).catch(() => {});
  }

  async placeOrder(): Promise<void> {
    await this.placeOrderButton.click();
  }

  async applyCoupon(code: string): Promise<void> {
    await this.couponInput.fill(code);
    await this.applyCouponButton.click();
  }

  async expectOrderConfirmed(): Promise<void> {
    await expect(this.page.getByText('Thank you for your order!')).toBeVisible({ timeout: 15_000 });
  }

  /** Read the confirmed order number from the success screen. */
  async confirmedOrderNumber(): Promise<string> {
    const text = await this.page.getByText(/Order #\d+/).first().innerText();
    return (text.match(/#(\d+)/)?.[1]) ?? '';
  }

  private async fillByLabel(label: string, value: string): Promise<void> {
    const field = this.page
      .locator('label', { hasText: new RegExp(`^${label}$`) })
      .locator('xpath=following-sibling::input[1] | .//input')
      .first();
    // Fallback to getByLabel if the DOM structure differs.
    if (await field.count()) {
      await field.fill(value);
    } else {
      await this.page.getByLabel(label, { exact: false }).first().fill(value);
    }
  }
}
