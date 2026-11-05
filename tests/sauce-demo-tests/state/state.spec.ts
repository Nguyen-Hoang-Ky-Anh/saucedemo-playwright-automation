import { test, expect } from '../../../fixtures/test.fixture';
import { PRODUCT_SLUGS, addToCartId, removeId, BUTTON_TEXT, ERROR_MESSAGES } from '../../../data/constants';

// URL trang đăng nhập (có hoặc không có dấu "/" ở cuối), dùng chung cách kiểm tra với LG-06/LG-07
const LOGIN_URL = /^https:\/\/www\.saucedemo\.com\/?$/;

// Thông báo yêu cầu đăng nhập cho trang checkout bước 1 (nên chuyển vào ERROR_MESSAGES trong constants)
const CHECKOUT_STEP_ONE_REQUIRES_LOGIN = "Epic sadface: You can only access '/checkout-step-one.html' when you are logged in.";

test.describe('State Test Cases', () => {
    test('ST-01: should toggle button and cart badge when adding then removing an item', async ({ loggedInPage }) => {
        const { inventoryPage } = loggedInPage;

        // Chuẩn bị dữ liệu test
        const productSlug = PRODUCT_SLUGS[0];
        const addButton = inventoryPage.getProductButton(addToCartId(productSlug));
        const removeButton = inventoryPage.getProductButton(removeId(productSlug));

        // Thêm sản phẩm
        await inventoryPage.addItemToCart(addToCartId(productSlug));

        // Xác minh: nút đổi thành Remove, giỏ hàng có 1 sản phẩm
        await expect(removeButton).toHaveText(BUTTON_TEXT.REMOVE);
        await expect(inventoryPage.shoppingCartBadge).toHaveText('1');

        // Xóa chính sản phẩm đó
        await inventoryPage.removeItemFromCart(removeId(productSlug));

        // Xác minh: nút quay lại Add to cart, giỏ hàng rỗng
        await expect(addButton).toHaveText(BUTTON_TEXT.ADD_TO_CART);
        await expect(inventoryPage.shoppingCartBadge).toHaveCount(0);
    });

    test('ST-02: should return to inventory page and keep cart items when clicking Cancel on checkout overview', async ({
                                                                                                                            page,
                                                                                                                            checkoutOverviewPage,
                                                                                                                            inventoryPage,
                                                                                                                            cartPage,
                                                                                                                        }) => {
        // Ghi lại các sản phẩm đang có ở trang tổng kết trước khi Cancel
        const itemNames = page.locator('[data-test="inventory-item-name"]');
        const namesBefore = await itemNames.allInnerTexts();
        expect(namesBefore.length).toBeGreaterThan(0);

        // Bước 1: bấm Cancel
        await checkoutOverviewPage.cancelCheckout();

        // Kết quả mong đợi: quay về trang sản phẩm
        await expect(page).toHaveURL(/inventory\.html/);
        await expect(inventoryPage.titleHeader).toHaveText('Products');

        // Kết quả mong đợi: giỏ hàng được giữ nguyên (biểu tượng giỏ hàng và danh sách sản phẩm trong giỏ)
        await expect(inventoryPage.shoppingCartBadge).toHaveText(String(namesBefore.length));
        await inventoryPage.goToCart();
        await expect(page).toHaveURL(/cart\.html/);
        await expect(cartPage.cartItemNames).toHaveText(namesBefore);
    });

    test('ST-03: should redirect to login page with error when opening /cart.html without login', async ({
                                                                                                             page,
                                                                                                             cartPage,
                                                                                                             loginPage,
                                                                                                         }) => {
        // Bước 1-2: mở thẳng /cart.html khi chưa đăng nhập
        await cartPage.open();

        // Kết quả mong đợi: bị chặn, về trang login, có thông báo lỗi
        await expect(page).toHaveURL(LOGIN_URL);
        await expect(loginPage.loginButton).toBeVisible();
        await expect(loginPage.errorMessage).toHaveText(ERROR_MESSAGES.CART_REQUIRES_LOGIN);
    });

    // --- Test case mới, CHƯA có trong test case detail (mục 3: truy cập thẳng bằng URL) ---

    // S0 → S3: chưa đăng nhập, mở thẳng /checkout-step-one.html
    test('ST-04: should redirect to login page with error when opening /checkout-step-one.html without login', async ({
                                                                                                                          page,
                                                                                                                          loginPage,
                                                                                                                      }) => {
        await page.goto('/checkout-step-one.html');

        await expect(page).toHaveURL(LOGIN_URL);
        await expect(loginPage.loginButton).toBeVisible();
        await expect(loginPage.errorMessage).toHaveText(CHECKOUT_STEP_ONE_REQUIRES_LOGIN);
    });

    // S1 → S4: đã đăng nhập, ở trang sản phẩm, mở thẳng /checkout-step-two.html (bỏ qua bước nhập thông tin)
    // Ghi nhận hành vi thực tế, không kết luận pass/fail
    test('ST-05: should record behavior when opening /checkout-step-two.html directly from inventory', async ({
                                                                                                                  page,
                                                                                                                  loggedInPage,
                                                                                                              }) => {
        // Tiền điều kiện: fixture loggedInPage đã đăng nhập, đang ở trang sản phẩm (S1)
        void loggedInPage;
        await expect(page).toHaveURL(/inventory\.html/);

        await page.goto('/checkout-step-two.html');

        test.info().annotations.push({
            type: 'actual-behavior',
            description: `S1 → S4 | URL: ${page.url()} | Tiêu đề: ${await page.locator('[data-test="title"]').innerText().catch(() => 'không có')}`,
        });
        await expect(page).toHaveURL(/checkout-step-two\.html|checkout-step-one\.html|cart\.html|inventory\.html/);
    });

    // S1 → S5: đã đăng nhập, ở trang sản phẩm, mở thẳng /checkout-complete.html (chưa đặt hàng)
    // Ghi nhận hành vi thực tế, không kết luận pass/fail
    test('ST-06: should record behavior when opening /checkout-complete.html directly from inventory', async ({
                                                                                                                  page,
                                                                                                                  loggedInPage,
                                                                                                              }) => {
        // Tiền điều kiện: fixture loggedInPage đã đăng nhập, đang ở trang sản phẩm (S1)
        void loggedInPage;
        await expect(page).toHaveURL(/inventory\.html/);

        await page.goto('/checkout-complete.html');

        test.info().annotations.push({
            type: 'actual-behavior',
            description: `S1 → S5 | URL: ${page.url()} | Tiêu đề: ${await page.locator('[data-test="title"]').innerText().catch(() => 'không có')}`,
        });
        await expect(page).toHaveURL(/checkout-complete\.html|checkout-step-one\.html|cart\.html|inventory\.html/);
    });

    // --- Test case mới, CHƯA có trong test case detail (mục 4: nút Back và reload) ---

    // S5 → S4: bấm Back của trình duyệt sau khi Finish. Ghi nhận hành vi thực tế
    test('ST-07: should record behavior when clicking browser Back after Finish', async ({
                                                                                             page,
                                                                                             checkoutCompletePage,
                                                                                         }) => {
        await expect(page).toHaveURL(/checkout-complete\.html/);
        await expect(checkoutCompletePage.completeHeader).toHaveText('Thank you for your order!');

        await page.goBack();

        test.info().annotations.push({
            type: 'actual-behavior',
            description: `S5 → S4 (Back) | URL: ${page.url()} | Số sản phẩm hiển thị: ${await page.locator('[data-test="inventory-item"]').count()}`,
        });
        await expect(page).toHaveURL(/checkout-step-two\.html|checkout-complete\.html|cart\.html|inventory\.html/);
    });

    // S3 → S3: reload ở trang nhập thông tin, vẫn đăng nhập và ở lại trang
    test('ST-08: should stay on checkout step one after reload', async ({ page, checkoutInformationPage }) => {
        await expect(page).toHaveURL(/checkout-step-one\.html/);

        await page.reload();

        await expect(page).toHaveURL(/checkout-step-one\.html/);
        await expect(page.locator('[data-test="title"]')).toHaveText('Checkout: Your Information');
        await expect(page.locator('[data-test="continue"]')).toBeVisible();
        await expect(checkoutInformationPage.errorMessage).toHaveCount(0);
    });

    // S4 → S4: reload ở trang tổng kết, vẫn ở lại trang và giữ nguyên sản phẩm, số tiền
    test('ST-09: should stay on checkout overview with same items after reload', async ({
                                                                                            page,
                                                                                            checkoutOverviewPage,
                                                                                        }) => {
        await expect(page).toHaveURL(/checkout-step-two\.html/);
        const itemNames = page.locator('[data-test="inventory-item-name"]');
        const namesBefore = await itemNames.allInnerTexts();
        const totalBefore = await checkoutOverviewPage.getTotal();

        await page.reload();

        await expect(page).toHaveURL(/checkout-step-two\.html/);
        await expect(page.locator('[data-test="title"]')).toHaveText('Checkout: Overview');
        expect(await itemNames.allInnerTexts()).toEqual(namesBefore);
        expect(await checkoutOverviewPage.getTotal()).toBe(totalBefore);
    });
});