import {test, expect} from '../../fixtures/test.fixture';
import {PRODUCT_SLUGS, addToCartId, removeId, BUTTON_TEXT, ERROR_MESSAGES} from '../../data/constants';

test.describe('State Test Cases', () => {
    test('ST-01: should toggle button and cart badge when adding then removing an item', async ({loggedInPage}) => {
        const {inventoryPage} = loggedInPage;

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

    test('ST-02: should return to inventory page when clicking Cancel on checkout overview',
        async ({
                   page,
                   checkoutOverviewPage,
                   inventoryPage,
               }) => {

        // Bước 1: bấm Cancel
        await checkoutOverviewPage.cancelCheckout();

        // Kết quả mong đợi: quay về trang sản phẩm
        await expect(page).toHaveURL(/inventory\.html/);
        await expect(inventoryPage.titleHeader).toHaveText('Products');
    });

    test('ST-03: should redirect to login page with error when opening /cart.html without login',
        async ({
                   page,
                   cartPage,
                   loginPage,
               }) => {
        // Bước 1-2: mở thẳng /cart.html khi chưa đăng nhập
        await cartPage.open();

        // Kết quả mong đợi: bị chặn, về trang login, có thông báo lỗi
        await expect(page).toHaveURL('/');
        await expect(loginPage.loginButton).toBeVisible();
        await expect(loginPage.errorMessage).toHaveText(ERROR_MESSAGES.CART_REQUIRES_LOGIN);
    });
});