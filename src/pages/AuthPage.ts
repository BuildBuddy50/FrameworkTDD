import { Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { ADMIN } from '@utils/env';

/**
 * Login / registration screen. The app has a Customer/Admin toggle and
 * a login/register mode switch.
 */
export class AuthPage extends BasePage {
  get customerTab(): Locator {
    return this.page.getByRole('button', { name: /Customer/ });
  }

  get adminTab(): Locator {
    return this.page.getByRole('button', { name: /Admin/ });
  }

  get emailInput(): Locator {
    return this.page.getByPlaceholder('you@example.com');
  }

  get passwordInput(): Locator {
    return this.page.getByPlaceholder('At least 6 characters');
  }

  get nameInput(): Locator {
    return this.page.getByPlaceholder('Jane Doe');
  }

  get confirmInput(): Locator {
    return this.page.getByPlaceholder('Re-enter password');
  }

  get submitButton(): Locator {
    // "Sign in" / "Create account" — the main form button.
    return this.page.getByRole('button', { name: /^(Sign in|Create account|Please wait)/ }).last();
  }

  get switchToRegister(): Locator {
    return this.page.getByRole('button', { name: 'Create an account' });
  }

  /** Open the auth screen from anywhere. */
  async gotoAuth(): Promise<void> {
    await this.open('/');
    await this.signInButton.click();
    await expect(this.emailInput).toBeVisible();
  }

  async loginAsAdmin(): Promise<void> {
    await this.gotoAuth();
    await this.adminTab.click();
    await this.emailInput.fill(ADMIN.email);
    await this.passwordInput.fill(ADMIN.password);
    await this.submitButton.click();
  }

  async loginAsCustomer(email: string, password: string): Promise<void> {
    await this.gotoAuth();
    await this.customerTab.click();
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async register(name: string, email: string, password: string): Promise<void> {
    await this.gotoAuth();
    await this.customerTab.click();
    await this.switchToRegister.click();
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.confirmInput.fill(password);
    await this.submitButton.click();
  }

  /** The form surfaces API errors under the password field. */
  async expectError(text: string | RegExp): Promise<void> {
    await expect(this.page.getByText(text).first()).toBeVisible({ timeout: 10_000 });
  }
}
