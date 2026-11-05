import { test, expect } from '../../../fixtures/test.fixture';
import { PRODUCT_SLUGS, addToCartId, removeId, BUTTON_TEXT } from '../../../data/constants';

test.describe('Cart - Flow', () => {
    test('CT-01: should change button to Remove and show cart badge as 1 when adding 1 item', async ({ loggedInPage }) => {
        const { inventoryPage } = loggedInPage;
        const product = PRODUCT_SLUGS[0];

        // Bước 1: Bấm "Add to cart"
        await inventoryPage.addItemToCart(addToCartId(product));

        // Bước 2 và Kết quả: Nút đổi thành "Remove", biểu tượng giỏ hiện 1
        await expect(inventoryPage.getProductButton(removeId(product))).toHaveText(BUTTON_TEXT.REMOVE);
        await expect(inventoryPage.shoppingCartBadge).toHaveText('1');
    });

    test('CT-02: should show cart badge as 2 when adding 2 items', async ({ loggedInPage }) => {
        const { inventoryPage } = loggedInPage;

        // Bước 1-2: Bấm "Add to cart" 2 sản phẩm
        await inventoryPage.addItemToCart(addToCartId(PRODUCT_SLUGS[0]));
        await inventoryPage.addItemToCart(addToCartId(PRODUCT_SLUGS[1]));

        // Bước 3 và Kết quả: Nút đổi thành "Remove", biểu tượng giỏ hiện 2
        await expect(inventoryPage.getProductButton(removeId(PRODUCT_SLUGS[0]))).toHaveText(BUTTON_TEXT.REMOVE);
        await expect(inventoryPage.getProductButton(removeId(PRODUCT_SLUGS[1]))).toHaveText(BUTTON_TEXT.REMOVE);
        await expect(inventoryPage.shoppingCartBadge).toHaveText('2');
    });

    // Kiểm tra đủ tên, giá, số lượng (1) và nút Remove theo detail
    test('CT-03: should navigate to cart page and display correct item details after adding an item', async ({
                                                                                                                 page,
                                                                                                                 loggedInPage,
                                                                                                             }) => {
        const { inventoryPage, cartPage } = loggedInPage;
        const product = PRODUCT_SLUGS[0];

        // Tiền điều kiện: ghi nhớ tên và giá trên trang sản phẩm TRƯỚC khi thêm
        const productCard = page
            .locator('[data-test="inventory-item"]')
            .filter({ has: page.locator(`[data-test="${addToCartId(product)}"]`) });
        const expectedName = await productCard.locator('[data-test="inventory-item-name"]').innerText();
        const expectedPrice = await productCard.locator('[data-test="inventory-item-price"]').innerText();

        await inventoryPage.addItemToCart(addToCartId(product));

        // Bước 1: Bấm mở giỏ hàng
        await inventoryPage.goToCart();

        // Bước 2 và Kết quả: đúng trang, đúng tiêu đề, liệt kê đúng 1 sản phẩm
        await expect(page).toHaveURL(/cart\.html/);
        await expect(cartPage.titleHeader).toHaveText('Your Cart');
        await expect(cartPage.cartItems).toHaveCount(1);

        // Kiểm tra tên, giá, số lượng, nút Remove của dòng sản phẩm
        const cartItem = cartPage.cartItems.first();
        await expect(cartItem.locator('[data-test="inventory-item-name"]')).toHaveText(expectedName);
        await expect(cartItem.locator('[data-test="inventory-item-price"]')).toHaveText(expectedPrice);
        await expect(cartItem.locator('[data-test="item-quantity"]')).toHaveText('1');
        await expect(page.locator(`[data-test="${removeId(product)}"]`)).toBeVisible();
    });

    // Tách thành 2 trường hợp theo detail
    // (a) giỏ có 1 sản phẩm -> xóa -> rỗng
    test('CT-04a: should remove the only item and hide cart badge when clicking Remove in cart', async ({
                                                                                                            loggedInPage,
                                                                                                        }) => {
        const { inventoryPage, cartPage } = loggedInPage;
        const product = PRODUCT_SLUGS[0];

        // Tiền điều kiện: đã thêm 1 sản phẩm, đang ở giỏ hàng
        await inventoryPage.addItemToCart(addToCartId(product));
        await inventoryPage.goToCart();

        // Bước 1: Bấm "Remove" trong giỏ
        await cartPage.removeItem(removeId(product));

        // Kết quả: sản phẩm biến mất, biểu tượng giỏ không còn hiện số
        await expect(cartPage.cartItems).toHaveCount(0);
        await expect(inventoryPage.shoppingCartBadge).not.toBeVisible();
    });

    // (b) giỏ có 2 sản phẩm -> xóa 1 -> icon giảm từ 2 xuống 1
    test('CT-04b: should decrease cart badge from 2 to 1 and keep the other item when removing one item', async ({
                                                                                                                     loggedInPage,
                                                                                                                 }) => {
        const { inventoryPage, cartPage } = loggedInPage;
        const product1 = PRODUCT_SLUGS[0];
        const product2 = PRODUCT_SLUGS[1];

        // Tiền điều kiện: đã thêm 2 sản phẩm, đang ở giỏ hàng
        await inventoryPage.addItemToCart(addToCartId(product1));
        await inventoryPage.addItemToCart(addToCartId(product2));
        await inventoryPage.goToCart();
        await expect(cartPage.cartItems).toHaveCount(2);
        await expect(inventoryPage.shoppingCartBadge).toHaveText('2');

        // Bước 1: Xóa sản phẩm thứ nhất
        await cartPage.removeItem(removeId(product1));

        // Kết quả: còn 1 dòng, icon giỏ giảm xuống 1, sản phẩm còn lại vẫn có nút Remove
        await expect(cartPage.cartItems).toHaveCount(1);
        await expect(inventoryPage.shoppingCartBadge).toHaveText('1');
        await expect(page_locator(cartPage, removeId(product1))).toHaveCount(0);
        await expect(page_locator(cartPage, removeId(product2))).toBeVisible();
    });

    test('CT-05: should show empty cart page and no badge when cart is empty', async ({ page, loggedInPage }) => {
        const { inventoryPage, cartPage } = loggedInPage;

        // Bước 1-2: Không thêm gì cả, bấm thẳng vào giỏ hàng
        await expect(inventoryPage.shoppingCartBadge).not.toBeVisible();
        await inventoryPage.goToCart();

        // Kết quả: Không hiện số trên biểu tượng, danh sách giỏ hàng trống
        await expect(page).toHaveURL(/cart\.html/);
        await expect(inventoryPage.shoppingCartBadge).not.toBeVisible();
        await expect(cartPage.cartItems).toHaveCount(0);
    });

    test('CT-06: should retain items and Remove button status after reloading page', async ({
                                                                                                page,
                                                                                                loggedInPage,
                                                                                            }) => {
        const { inventoryPage, cartPage } = loggedInPage;
        const product1 = PRODUCT_SLUGS[0];
        const product2 = PRODUCT_SLUGS[1];

        // Tiền điều kiện: đã thêm 2 sản phẩm vào giỏ
        await inventoryPage.addItemToCart(addToCartId(product1));
        await inventoryPage.addItemToCart(addToCartId(product2));
        await expect(inventoryPage.shoppingCartBadge).toHaveText('2');

        // Bước 1-2: Tải lại trang
        await page.reload();

        // Bước 3 và Kết quả
        await expect(inventoryPage.getProductButton(removeId(product1))).toHaveText(BUTTON_TEXT.REMOVE);
        await expect(inventoryPage.getProductButton(removeId(product2))).toHaveText(BUTTON_TEXT.REMOVE);
        await expect(inventoryPage.shoppingCartBadge).toHaveText('2');

        // Bước 4 và Kết quả
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

        // Tiền điều kiện: đã thêm 1 sản phẩm, đang ở /cart.html
        await inventoryPage.addItemToCart(addToCartId(product));
        await inventoryPage.goToCart();
        await expect(page).toHaveURL(/cart\.html/);

        // Bước 1: Bấm "Continue Shopping"
        await cartPage.continueShopping();

        // Bước 2 và Kết quả
        await expect(page).toHaveURL(/inventory\.html/);
        await expect(inventoryPage.titleHeader).toHaveText('Products');
        await expect(inventoryPage.shoppingCartBadge).toHaveText('1');
        await expect(inventoryPage.getProductButton(removeId(product))).toHaveText(BUTTON_TEXT.REMOVE);
    });

    // n = 3, 5, 6 (nom, max-, max); kiểm tra thêm các sản phẩm chưa chọn vẫn là "Add to cart"
    const quantities = [3, 5, 6];
    for (const n of quantities) {
        test(`CT-08: should update badge to ${n}, change ${n} buttons to Remove and keep the rest as Add to cart`, async ({
                                                                                                                              loggedInPage,
                                                                                                                          }) => {
            const { inventoryPage } = loggedInPage;

            // Bấm Add to cart lần lượt n sản phẩm đầu tiên
            for (let i = 0; i < n; i++) {
                await inventoryPage.addItemToCart(addToCartId(PRODUCT_SLUGS[i]));
            }

            // Biểu tượng giỏ hiện đúng số n
            await expect(inventoryPage.shoppingCartBadge).toHaveText(n.toString());

            // Đúng n sản phẩm đã chọn đổi thành Remove
            for (let i = 0; i < n; i++) {
                await expect(inventoryPage.getProductButton(removeId(PRODUCT_SLUGS[i]))).toHaveText(BUTTON_TEXT.REMOVE);
            }

            // Các sản phẩm còn lại (nếu có) vẫn là "Add to cart" (n = 3, 5; với n = 6 vòng lặp này rỗng)
            for (let i = n; i < PRODUCT_SLUGS.length; i++) {
                await expect(inventoryPage.getProductButton(addToCartId(PRODUCT_SLUGS[i]))).toHaveText(BUTTON_TEXT.ADD_TO_CART);
            }
        });
    }
});

// Helper nhỏ: lấy locator theo data-test trong phạm vi cartPage
// (cartPage.cartItems là locator danh sách dòng; dùng page của nó để tìm nút Remove)
function page_locator(cartPage: { cartItems: { page(): any } }, dataTest: string) {
    return cartPage.cartItems.page().locator(`[data-test="${dataTest}"]`);
}