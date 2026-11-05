import { test, expect } from '../fixtures/test.fixture';

test.describe('SauceDemo E2E Flow: Login -> Inventory -> Cart -> Checkout', () => {
  test('should complete the entire shopping journey from login to checkout finish', async ({ loggedInPage, page }) => {
    const { inventoryPage, cartPage, checkoutPage } = loggedInPage;

    // 1. Thêm sản phẩm vào giỏ hàng tại trang Inventory
    await expect(page).toHaveURL(/.*inventory.html/);
    await inventoryPage.addItemToCart('add-to-cart-sauce-labs-backpack');
    await expect(inventoryPage.shoppingCartBadge).toHaveText('1');

    // 2. Chuyển sang trang Giỏ hàng (Cart)
    await inventoryPage.goToCart();
    await expect(page).toHaveURL(/.*cart.html/);
    await expect(cartPage.titleHeader).toHaveText('Your Cart');
    expect(await cartPage.getItemCount()).toBe(1);

    // 3. Tiến hành Checkout
    await cartPage.proceedToCheckout();
    await expect(page).toHaveURL(/.*checkout-step-one.html/);
    await expect(checkoutPage.titleHeader).toHaveText('Checkout: Your Information');

    // 4. Nhập thông tin thanh toán (Step 1)
    await checkoutPage.fillCustomerInformation('Vinh', 'Nguyen', '700000');
    await expect(page).toHaveURL(/.*checkout-step-two.html/);
    await expect(checkoutPage.titleHeader).toHaveText('Checkout: Overview');

    // 5. Hoàn tất đơn hàng (Step 2 -> Complete)
    await checkoutPage.finishOrder();
    await expect(page).toHaveURL(/.*checkout-complete.html/);
    await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
    await expect(checkoutPage.completeText).toBeVisible();
  });
});
