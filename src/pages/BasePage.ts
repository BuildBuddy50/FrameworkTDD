import { Page, Locator, expect } from '@playwright/test';
import { env } from '@utils/env';

/**
 * BasePage holds behaviour common to every page object: navigation,
 * pointing the SPA at the correct API, waiting, and toast handling.
 *
 * The Nova Store frontend is a single-page app that reads its API base
 * from localStorage key "ns_api_base". We set that before the app boots
 * so the UI talks to the environment under test.
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  /** Header elements shared across the app. */
  get header(): Locator {
    return this.page.locator('header, nav').first();
  }

  get searchBox(): Locator {
    return this.page.getByPlaceholder('Search products…');
  }

  get cartButton(): Locator {
    return this.page.getByRole('button', { name: /cart/i });
  }

  get signInButton(): Locator {
    return this.page.getByRole('button', { name: 'Sign in', exact: true });
  }

  /**
   * Load the app and pin its API base to the environment under test.
   * Uses an init script so localStorage is set before any app JS runs.
   */
  async open(path = '/'): Promise<void> {
    await this.page.addInitScript((apiBase) => {
      window.localStorage.setItem('ns_api_base', apiBase);
      // Start each test from a clean cart/session.
      window.localStorage.removeItem('ns_cart_api');
      window.localStorage.removeItem('ns_token_api');
    }, env.apiURL);
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle');
  }

  /** Assert a toast/notification containing text appears. */
  async expectToast(text: string | RegExp): Promise<void> {
    await expect(this.page.getByText(text).first()).toBeVisible({ timeout: 10_000 });
  }

  async clickByText(text: string | RegExp): Promise<void> {
    await this.page.getByText(text).first().click();
  }

  title(): Promise<string> {
    return this.page.title();
  }
}
