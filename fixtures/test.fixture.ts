import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';
import { CartPage } from '../pages/cart.page';
import { CheckoutPage } from '../pages/checkout.page';
import { expect } from '@playwright/test';
import { CHECKOUT_INFO, PRODUCT_SLUGS, addToCartId } from '../data/constants';

// Định nghĩa kiểu cho các Fixture của dự án
type AppFixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  loggedInPage: {
    loginPage: LoginPage;
    inventoryPage: InventoryPage;
    cartPage: CartPage;
    checkoutPage: CheckoutPage;
  };
  checkoutOverviewPage: CheckoutPage;
  checkoutInformationPage: CheckoutPage;
  checkoutCompletePage: CheckoutPage;
};

export const test = base.extend<AppFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },

  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },

  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },

  // Fixture tự động đăng nhập trước khi chạy test case
  loggedInPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await loginPage.open();
    await loginPage.login();

    await expect(page).toHaveURL(/inventory\.html/);

    await use({ loginPage, inventoryPage, cartPage, checkoutPage });
  },
  // Tiền điều kiện CO-06: đã login, có hàng, đang ở Checkout: Your Information
  checkoutInformationPage: async ({ page, loggedInPage }, use) => {
    const { inventoryPage, cartPage, checkoutPage } = loggedInPage;

    await inventoryPage.addItemToCart(addToCartId(PRODUCT_SLUGS[0]));
    await inventoryPage.goToCart();
    await cartPage.proceedToCheckout();
    await expect(page).toHaveURL(/checkout-step-one\.html/);

    await use(checkoutPage);
  },

  // Tiền điều kiện ST-02, CO-05: đang ở Checkout: Overview
  checkoutOverviewPage: async ({ page, checkoutInformationPage }, use) => {
    await checkoutInformationPage.fillCustomerInformation(
        CHECKOUT_INFO.FIRST_NAME,
        CHECKOUT_INFO.LAST_NAME,
        CHECKOUT_INFO.POSTAL_CODE,
    );
    await expect(page).toHaveURL(/checkout-step-two\.html/);

    await use(checkoutInformationPage);
  },

  // Tiền điều kiện CO-07: đã đặt hàng, đang ở Checkout: Complete
  checkoutCompletePage: async ({ page, checkoutOverviewPage }, use) => {
    await checkoutOverviewPage.finishOrder();
    await expect(page).toHaveURL(/checkout-complete\.html/);

    await use(checkoutOverviewPage);
  },
});

export { expect } from '@playwright/test';
