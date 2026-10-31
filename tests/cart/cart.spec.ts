import { test, expect } from '../../fixtures/test.fixture';
import { PRODUCT_SLUGS, addToCartId, removeId, BUTTON_TEXT } from '../../data/constants';

test.describe('Cart - Flow', () => {
    test('CT-01: should change button to Remove and show cart badge as 1 when adding 1 item', async ({loggedInPage,}) => {
        const { inventoryPage } = loggedInPage;
        const product = PRODUCT_SLUGS[0]; // Sản phẩm đầu tiên

        // Bước 1: Bấm "Add to cart"
        await inventoryPage.addItemToCart(addToCartId(product));

        // Bước 2 và Kết quả: Nút đổi thành "Remove", biểu tượng giỏ hiện 1
        await expect(inventoryPage.getProductButton(removeId(product))).toHaveText(BUTTON_TEXT.REMOVE);
        await expect(inventoryPage.shoppingCartBadge).toHaveText('1');
    });

    test('CT-02: should show cart badge as 2 when adding 2 items', async ({loggedInPage,}) => {
        const { inventoryPage } = loggedInPage;

        // Bước 1-2: Bấm "Add to cart" 2 sản phẩm
        await inventoryPage.addItemToCart(addToCartId(PRODUCT_SLUGS[0]));
        await inventoryPage.addItemToCart(addToCartId(PRODUCT_SLUGS[1]));

        // Bước 3 và Kết quả: Nút đổi thành "Remove", biểu tượng giỏ hiện 2
        await expect(inventoryPage.getProductButton(removeId(PRODUCT_SLUGS[0]))).toHaveText(BUTTON_TEXT.REMOVE);
        await expect(inventoryPage.getProductButton(removeId(PRODUCT_SLUGS[1]))).toHaveText(BUTTON_TEXT.REMOVE);
        await expect(inventoryPage.shoppingCartBadge).toHaveText('2');
    });

    test('CT-03: should navigate to cart page and display correct item details after adding an item', async ({page, loggedInPage,}) => {
        const { inventoryPage, cartPage } = loggedInPage;
        const product = PRODUCT_SLUGS[0];

        // Tiền điều kiện: Thêm sản phẩm
        await inventoryPage.addItemToCart(addToCartId(product));

        // Bước 1: Bấm mở giỏ hàng
        await inventoryPage.goToCart();

        // Bước 2 và Kết quả: Đúng trang, đúng tiêu đề, liệt kê đúng sản phẩm
        await expect(page).toHaveURL(/cart\.html/);
        await expect(cartPage.titleHeader).toHaveText('Your Cart');
        await expect(cartPage.cartItems).toHaveCount(1);
        await expect(page.locator(`[data-test="${removeId(product)}"]`)).toBeVisible();
    });

    test('CT-04: should remove item from list and update badge when clicking Remove in cart', async ({loggedInPage,}) => {
        const { inventoryPage, cartPage } = loggedInPage;
        const product = PRODUCT_SLUGS[0];

        // Tiền điều kiện: Đã thêm sản phẩm, đang ở giỏ hàng
        await inventoryPage.addItemToCart(addToCartId(product));
        await inventoryPage.goToCart();

        // Bước 1: Bấm nút "Remove" trong giỏ
        await cartPage.removeItem(removeId(product));

        // Bước 2 và Kết quả: Sản phẩm biến mất, biểu tượng giỏ rỗng
        await expect(cartPage.cartItems).toHaveCount(0);
        await expect(inventoryPage.shoppingCartBadge).not.toBeVisible();
    });

    test('CT-05: should show empty cart page and no badge when cart is empty', async ({page, loggedInPage,}) => {
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

    const quantities = [3, 5, 6];
    for (const n of quantities) {
        test(`CT-08: should update badge to ${n} and change buttons to Remove when adding ${n} items`, async ({
                                                                                                                  loggedInPage,
                                                                                                              }) => {
            const { inventoryPage } = loggedInPage;

            // Bấm Add to cart lần lượt n sản phẩm
            for (let i = 0; i < n; i++) {
                await inventoryPage.addItemToCart(addToCartId(PRODUCT_SLUGS[i]));
            }

            // Kiểm tra biểu tượng giỏ hàng hiện đúng số n
            await expect(inventoryPage.shoppingCartBadge).toHaveText(n.toString());

            // Kiểm tra đúng n nút đã đổi thành Remove
            for (let i = 0; i < n; i++) {
                await expect(inventoryPage.getProductButton(removeId(PRODUCT_SLUGS[i]))).toHaveText(BUTTON_TEXT.REMOVE);
            }
        });
    }
});