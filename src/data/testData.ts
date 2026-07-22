/**
 * Test-data factories. Every generated record is unique per run so
 * tests never collide with each other or with previous executions.
 */

const stamp = () => `${Date.now()}${Math.floor(Math.random() * 1000)}`;

export interface NewUser {
  name: string;
  email: string;
  password: string;
}

export function makeUser(prefix = 'user'): NewUser {
  const id = stamp();
  return {
    name: `Test ${prefix} ${id}`,
    email: `${prefix}.${id}@example.com`,
    password: 'Passw0rd!',
  };
}

export interface CheckoutInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
}
export function makeCheckout(): CheckoutInfo {
  const id = stamp();
  return {
    name: `Buyer ${id}`,
    email: `buyer.${id}@example.com`,
    phone: '5551234567',
    address: '221B Baker Street',
    city: 'London',
    zip: 'NW16XE',
    cardName: 'BUYER TEST',
    cardNumber: '4242424242424242',
    expiry: '12/28',
    cvc: '123',
  };
}

export interface NewProduct {
  name: string;
  price: string;
  category: string;
  stock: string;
  description: string;
}

export function makeProduct(): NewProduct {
  const id = stamp();
  return {
    name: `QA Product ${id}`,
    price: '49.99',
    category: 'Electronics',
    stock: '25',
    description: `Automated test product ${id}`,
  };
}

/** Coupons hardcoded in the API. */
export const COUPONS = {
  percent10: 'SAVE10',
  flat5: 'WELCOME5',
};
