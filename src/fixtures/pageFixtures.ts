import { test as base } from '@playwright/test';
import { AuthPage } from '@pages/AuthPage';
import { ShopPage } from '@pages/ShopPage';
import { CartPage } from '@pages/CartPage';
import { AdminPage } from '@pages/AdminPage';

/**
 * Custom fixtures: each page object is constructed once per test and
 * injected, so specs read cleanly and never `new` a page object.
 *
 *   test('...', async ({ shopPage }) => { ... });
 */
type Pages = {
  authPage: AuthPage;
  shopPage: ShopPage;
  cartPage: CartPage;
  adminPage: AdminPage;
};

export const test = base.extend<Pages>({
  authPage: async ({ page }, use) => {
    await use(new AuthPage(page));
  },
  shopPage: async ({ page }, use) => {
    await use(new ShopPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  adminPage: async ({ page }, use) => {
    await use(new AdminPage(page));
  },
});

export const expect = test.expect;
