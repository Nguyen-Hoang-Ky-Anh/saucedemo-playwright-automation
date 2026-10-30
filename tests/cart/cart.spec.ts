import { test, expect } from '../../fixtures/test.fixture';
import { PRODUCT_SLUGS, addToCartId, removeId, BUTTON_TEXT } from '../../data/constants';

test.describe('Cart - Flow', () => {
    test('CT-06: should retain items and Remove button status after reloading page', async ({
        page,
        loggedInPage,
    }) => {
        const { inventoryPage, cartPage } = loggedInPage;
        const product1 = PRODUCT_SLUGS[0];
        const product2 = PRODUCT_SLUGS[1];

        // Tiền điều kiện: Đã đăng nhập bằng standard_user, đang ở trang /inventory.html, đã thêm 2 sản phẩm vào giỏ
        await inventoryPage.addItemToCart(addToCartId(product1));
        await inventoryPage.addItemToCart(addToCartId(product2));
        await expect(inventoryPage.shoppingCartBadge).toHaveText('2');

        // Bước 1-2: Tải lại trang: nhấn F5 / reload trình duyệt
        await page.reload();

        // Bước 3 và Kết quả mong đợi:
        // - Sau khi tải lại, nút của 2 sản phẩm đã thêm vẫn là "Remove"
        // - Biểu tượng giỏ hàng vẫn hiển thị số 2
        await expect(inventoryPage.getProductButton(removeId(product1))).toHaveText(BUTTON_TEXT.REMOVE);
        await expect(inventoryPage.getProductButton(removeId(product2))).toHaveText(BUTTON_TEXT.REMOVE);
        await expect(inventoryPage.shoppingCartBadge).toHaveText('2');

        // Bước 4 và Kết quả mong đợi:
        // - Bấm vào biểu tượng giỏ hàng để mở trang /cart.html và kiểm tra danh sách
        // - Trang giỏ hàng /cart.html vẫn liệt kê đúng 2 sản phẩm đã thêm
        await inventoryPage.goToCart();
        await expect(page).toHaveURL(/cart\.html/);
        await expect(cartPage.cartItems).toHaveCount(2);
    });

    test('CT-07: should return to inventory page and preserve cart when clicking Continue Shopping', async ({
        page,
        loggedInPage,
    }) => {
        const { inventoryPage, cartPage } = loggedInPage;
        const product = PRODUCT_SLUGS[0];

        // Tiền điều kiện: Đã đăng nhập standard_user, đã thêm ít nhất 1 sản phẩm vào giỏ, đang ở /cart.html
        await inventoryPage.addItemToCart(addToCartId(product));
        await inventoryPage.goToCart();
        await expect(page).toHaveURL(/cart\.html/);

        // Bước 1: Bấm nút "Continue Shopping"
        await cartPage.continueShopping();

        // Bước 2 và Kết quả mong đợi:
        // - Quay lại trang sản phẩm /inventory.html, hiển thị tiêu đề "Products"
        await expect(page).toHaveURL(/inventory\.html/);
        await expect(inventoryPage.titleHeader).toHaveText('Products');

        // - Sản phẩm đã thêm vẫn được giữ: biểu tượng giỏ hàng giữ nguyên số lượng, nút của sản phẩm vẫn là "Remove"
        await expect(inventoryPage.shoppingCartBadge).toHaveText('1');
        await expect(inventoryPage.getProductButton(removeId(product))).toHaveText(BUTTON_TEXT.REMOVE);
    });
});