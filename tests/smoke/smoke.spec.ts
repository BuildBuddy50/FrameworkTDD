import { test, expect } from '@fixtures/pageFixtures';
import { makeUser, makeCheckout } from '@data/testData';

/**
 * SMOKE SUITE — fast, critical-path checks that must pass on every build.
 * Tag: @smoke
 */
test.describe('Nova Store — Smoke @smoke', () => {
  test('SMOKE-01: storefront loads with products', async ({ shopPage }) => {
    await shopPage.gotoShop();
    const count = await shopPage.productCount();
    expect(count).toBeGreaterThan(0);
    await expect(shopPage.searchBox).toBeVisible();
  });

  test('SMOKE-02: a new customer can register', async ({ authPage, page }) => {
    const user = makeUser('smoke');
    await authPage.register(user.name, user.email, user.password);
    // On success the app toasts a welcome and lands on the shop.
    await expect(page.getByText(new RegExp(`Welcome, ${user.name}`, 'i'))).toBeVisible();
  });

  test('SMOKE-03: admin can log in and reach the dashboard', async ({ authPage, adminPage }) => {
    await authPage.loginAsAdmin();
    await adminPage.expectLoaded();
  });

  test('SMOKE-04: a product can be added to the cart', async ({ shopPage, cartPage }) => {
    await shopPage.gotoShop();
    await shopPage.addFirstProductToCart();
    await cartPage.goToCart();
    await expect(cartPage.proceedButton).toBeVisible();
  });

  test('SMOKE-05: guest can complete checkout end-to-end', async ({ shopPage, cartPage }) => {
    await shopPage.gotoShop();
    await shopPage.addFirstProductToCart();
    await cartPage.goToCart();
    await cartPage.proceedToCheckout();
    await cartPage.fillCheckout(makeCheckout());
    await cartPage.placeOrder();
    await cartPage.expectOrderConfirmed();
    expect(await cartPage.confirmedOrderNumber()).not.toEqual('');
  });
});
