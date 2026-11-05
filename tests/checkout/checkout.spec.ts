import { test, expect } from '../../fixtures/test.fixture';
import { toCents } from '../../utils/common-helpers';
import {addToCartId, CHECKOUT_INFO, PRODUCT_SLUGS} from "../../data/constants";

test.describe('Checkout - Flow', () => {
    test('CO-01: should complete full checkout flow successfully', async ({page, checkoutInformationPage,}) => {
        // Tiền điều kiện từ checkoutInformationPage: Đã đăng nhập, thêm hàng, bấm checkout đến Step 1

        // Bước 5: Điền First Name, Last Name, Postal Code hợp lệ
        await checkoutInformationPage.fillCustomerInformation(
            CHECKOUT_INFO.FIRST_NAME,
            CHECKOUT_INFO.LAST_NAME,
            CHECKOUT_INFO.POSTAL_CODE
        );

        // Bước 6: Tại trang tổng kết, bấm Finish
        await expect(page).toHaveURL(/checkout-step-two\.html/);
        await checkoutInformationPage.finishOrder();

        // Kết quả: Hoàn tất đơn hàng, hiển thị thông báo cảm ơn
        await expect(page).toHaveURL(/checkout-complete\.html/);
        await expect(checkoutInformationPage.completeHeader).toHaveText('Thank you for your order!');
    });

    test('CO-02: should show error when First Name is empty', async ({page, checkoutInformationPage,}) => {
        // Bước 1-3: Để trống First Name
        await checkoutInformationPage.fillCustomerInformation(
            '', // Trống
            CHECKOUT_INFO.LAST_NAME,
            CHECKOUT_INFO.POSTAL_CODE
        );

        // Kết quả: Ở lại trang cũ, báo lỗi First Name
        await expect(page).toHaveURL(/checkout-step-one\.html/);
        await expect(checkoutInformationPage.errorMessage).toHaveText('Error: First Name is required');
    });

    test('CO-03: should show error when Last Name is empty', async ({page, checkoutInformationPage,}) => {
        // Bước 1-4: Để trống Last Name
        await checkoutInformationPage.fillCustomerInformation(
            CHECKOUT_INFO.FIRST_NAME,
            '', // Trống
            CHECKOUT_INFO.POSTAL_CODE
        );

        // Kết quả: Báo lỗi Last Name
        await expect(page).toHaveURL(/checkout-step-one\.html/);
        await expect(checkoutInformationPage.errorMessage).toHaveText('Error: Last Name is required');
    });

    test('CO-04: should show error when Postal Code is empty', async ({page, checkoutInformationPage,}) => {
        // Bước 1-3: Để trống Postal Code
        await checkoutInformationPage.fillCustomerInformation(
            CHECKOUT_INFO.FIRST_NAME,
            CHECKOUT_INFO.LAST_NAME,
            '' // Trống
        );

        // Kết quả: Báo lỗi Postal Code
        await expect(page).toHaveURL(/checkout-step-one\.html/);
        await expect(checkoutInformationPage.errorMessage).toHaveText('Error: Postal Code is required');
    });

    test('CO-05: should show Total equal to Item total plus Tax on overview page', async ({
                                                                                              checkoutOverviewPage,
                                                                                          }) => {
        // Bước 1-3: lấy Item total, Tax, Total
        const itemTotal = await checkoutOverviewPage.getItemTotal();
        const tax = await checkoutOverviewPage.getTax();
        const total = await checkoutOverviewPage.getTotal();

        // Bước 4: Item total + Tax phải bằng Total
        expect(toCents(itemTotal) + toCents(tax)).toBe(toCents(total));
    });

    test('CO-06: should return to cart page when clicking Cancel on information step', async ({
                                                                                                  page,
                                                                                                  checkoutInformationPage,
                                                                                              }) => {
        await checkoutInformationPage.cancelCheckout();

        await expect(page).toHaveURL(/cart\.html/);
    });

    test('CO-07: should return to inventory page with empty cart badge after clicking Back Home', async ({
                                                                                                             page,
                                                                                                             checkoutCompletePage,
                                                                                                             inventoryPage,
                                                                                                         }) => {
        await checkoutCompletePage.backToProducts();

        await expect(page).toHaveURL(/inventory\.html/);
        await expect(inventoryPage.shoppingCartBadge).toHaveCount(0);
    });

    // test.describe('Checkout - Flow', () => {
    //     test.beforeEach(async ({page, loggedInPage}) =>{
    //         const {inventoryPage, cartPage} = loggedInPage;
    //         // đã đăng nhận thêm 1 sản phẩm chuyển đến trang checkout tiền điều kiện
    //         await inventoryPage.addItemToCart(addToCartId(PRODUCT_SLUGS[0]));
    //         await inventoryPage.goToCart();
    //         await cartPage.proceedToCheckout();
    //         await expect(page).toHaveURL(/checkout-step-one\.html/);
    //
    //     });

        test('CO-08: should handle First Name containing only spaces or special characters', async({checkoutInformationPage,page
                                                                                                   }) =>{
            // nhập khoảng trắng vào first name
            await checkoutInformationPage.fillCustomerInformation('        ','Phuc','12345');
            await checkoutInformationPage.finishOrder();
            await page.waitForTimeout((1000));

            // nhập ký tự đặt biệt
            await page.goto('https://www.saucedemo.com/checkout-step-one.html');
            await checkoutInformationPage.fillCustomerInformation('@#$%!^','Phuc','12345');
            await page.waitForTimeout(1000);
        });

        test('CO-09: should handle boundary lengths 1 and 256 characters in checkout fields', async({checkoutInformationPage,page})=>
        {
            // Nhập một chữ P
            await checkoutInformationPage.fillCustomerInformation('P','P','P');
            // await page.waitForTimeout(30000);
            // Nhập 256 chữ P
            const str = 'P'.repeat(256);
            await page.goto('https://www.saucedemo.com/checkout-step-one.html');
            await checkoutInformationPage.fillCustomerInformation(str,str,str);
            await page.waitForTimeout(1000);
        });
    // });
    test('CO-10: should prioritize First Name error when both First and Last Name are empty', async ({page, checkoutInformationPage,}) => {
        // Bước 1-3: Để trống cả First Name và Last Name
        await checkoutInformationPage.fillCustomerInformation(
            '', // Trống
            '', // Trống
            CHECKOUT_INFO.POSTAL_CODE
        );

        // Kết quả: Ưu tiên báo lỗi First Name
        await expect(page).toHaveURL(/checkout-step-one\.html/);
        await expect(checkoutInformationPage.errorMessage).toHaveText('Error: First Name is required');
    });
});