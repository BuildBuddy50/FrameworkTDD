import { test, expect } from '@fixtures/pageFixtures';
import { makeUser, makeProduct, makeCheckout, COUPONS } from '@data/testData';

/**
 * REGRESSION SUITE — broader functional coverage across features.
 * Tag: @regression
 */
test.describe('Nova Store — Regression @regression', () => {
  test('REG-01: login fails with invalid credentials', async ({ authPage }) => {
    await authPage.loginAsCustomer('nobody@example.com', 'wrongpass');
    await authPage.expectError(/invalid email or password/i);
  });

  test('REG-02: registration is rejected for a duplicate email', async ({ authPage, page }) => {
    const user = makeUser('dup');
    // First registration succeeds.
    await authPage.register(user.name, user.email, user.password);
    await expect(page.getByText(/Welcome,/i)).toBeVisible();
    // Second attempt with the same email must fail.
    await authPage.register(user.name, user.email, user.password);
    await authPage.expectError(/already exists/i);
  });

  test('REG-03: product search filters the grid', async ({ shopPage }) => {
    await shopPage.gotoShop();
    const before = await shopPage.productCount();
    await shopPage.search('Headphones');
    const after = await shopPage.productCount();
    expect(after).toBeGreaterThan(0);
    expect(after).toBeLessThanOrEqual(before);
    await expect(shopPage.productHeadings.first()).toContainText(/headphones/i);
  });

  test('REG-04: sorting by price low-to-high orders products ascending', async ({ shopPage }) => {
    await shopPage.gotoShop();
    await shopPage.sortBy('Price: Low to High');
    const prices = await shopPage.visiblePrices();
    const sorted = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sorted);
  });

  test('REG-05: admin can create a product and see it in the store', async ({
    authPage,
    adminPage,
    shopPage,
  }) => {
    const product = makeProduct();
    await authPage.loginAsAdmin();
    await adminPage.expectLoaded();
    await adminPage.addProduct(product);
    await adminPage.expectProductListed(product.name);

    // Verify it now appears on the storefront.
    await shopPage.gotoShop();
    await shopPage.search(product.name);
    await expect(shopPage.productHeadings.first()).toContainText(product.name);
  });
});
