import { test, expect } from '../../fixtures/test.fixture';
import { toCents } from '../../utils/common-helpers';
import {addToCartId, PRODUCT_SLUGS} from "../../data/constants";

test.describe('Checkout - Flow', () => {
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
});