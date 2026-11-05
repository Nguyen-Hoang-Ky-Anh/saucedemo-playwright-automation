import type { Page, Locator } from '@playwright/test';
import { test, expect } from '../../fixtures/test.fixture';
import { toCents } from '../../utils/common-helpers';
import { addToCartId, CHECKOUT_INFO, PRODUCT_SLUGS } from '../../data/constants';

const OVERVIEW_TITLE = 'Checkout: Overview';
const COMPLETE_TITLE = 'Checkout: Complete!';
const PAYMENT_INFO = 'SauceCard #31337';
const SHIPPING_INFO = 'Free Pony Express Delivery!';

// Dữ liệu CO-08 (theo test case detail): Space "  " hoặc "@#$%"
const CO08_DATA = [
    { label: 'only spaces', value: '  ' },
    { label: 'special characters', value: '@#$%' },
];

// Dữ liệu CO-09 (theo test case detail): một ký tự "P" và chuỗi 256 ký tự "P"
const CO09_LENGTHS = [
    { label: '1 character', value: 'P' },
    { label: '256 characters', value: 'P'.repeat(256) },
];
const CO09_FIELDS = [
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'postalCode', label: 'Postal Code' },
] as const;

/**
 * Ghi lại hành vi thực tế (CO-08, CO-09): không kết luận pass/fail,
 * chỉ ghi URL hiện tại và thông báo lỗi (nếu có) vào annotation của báo cáo.
 */
async function recordActualBehavior(page: Page, errorMessage: Locator, note: string) {
    const hasError = await errorMessage.isVisible();
    const errorText = hasError ? await errorMessage.innerText() : 'không có thông báo lỗi';
    test.info().annotations.push({
        type: 'actual-behavior',
        description: `${note} | URL: ${page.url()} | Lỗi: ${errorText}`,
    });
    // Chỉ đảm bảo hệ thống ở một trong hai bước checkout, không bị lỗi khác
    await expect(page).toHaveURL(/checkout-step-(one|two)\.html/);
}

test.describe('Checkout - Flow', () => {
    // Tiền điều kiện từ fixture checkoutInformationPage: đã đăng nhập, thêm hàng, bấm checkout đến Step 1
    // (tương ứng các bước 1-4 của test case detail)

    test('CO-01: should complete full checkout flow successfully', async ({ page, checkoutInformationPage }) => {
        // Bước 5: Nhập đầy đủ First Name, Last Name, Postal Code hợp lệ (TD-05) rồi Continue
        await checkoutInformationPage.fillCustomerInformation(
            CHECKOUT_INFO.FIRST_NAME,
            CHECKOUT_INFO.LAST_NAME,
            CHECKOUT_INFO.POSTAL_CODE
        );

        // Bước 6: Tại trang tổng kết, kiểm tra thông tin
        await expect(page).toHaveURL(/checkout-step-two\.html/);
        await expect(page.locator('[data-test="title"]')).toHaveText(OVERVIEW_TITLE);
        await expect(page.locator('[data-test="payment-info-value"]')).toHaveText(PAYMENT_INFO);
        await expect(page.locator('[data-test="shipping-info-value"]')).toHaveText(SHIPPING_INFO);
        await expect(page.locator('[data-test="subtotal-label"]')).toBeVisible();
        await expect(page.locator('[data-test="tax-label"]')).toBeVisible();
        await expect(page.locator('[data-test="total-label"]')).toBeVisible();
        await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(1);

        // Bước 6: bấm Finish
        await checkoutInformationPage.finishOrder();

        // Kết quả: /checkout-complete.html, tiêu đề "Checkout: Complete!", thông báo "Thank you for your order!"
        await expect(page).toHaveURL(/checkout-complete\.html/);
        await expect(page.locator('[data-test="title"]')).toHaveText(COMPLETE_TITLE);
        await expect(checkoutInformationPage.completeHeader).toHaveText('Thank you for your order!');
    });

    test('CO-02: should show error when First Name is empty', async ({ page, checkoutInformationPage }) => {
        await checkoutInformationPage.fillCustomerInformation(
            '',
            CHECKOUT_INFO.LAST_NAME,
            CHECKOUT_INFO.POSTAL_CODE
        );

        await expect(page).toHaveURL(/checkout-step-one\.html/);
        await expect(checkoutInformationPage.errorMessage).toHaveText('Error: First Name is required');
    });

    test('CO-03: should show error when Last Name is empty', async ({ page, checkoutInformationPage }) => {
        await checkoutInformationPage.fillCustomerInformation(
            CHECKOUT_INFO.FIRST_NAME,
            '',
            CHECKOUT_INFO.POSTAL_CODE
        );

        await expect(page).toHaveURL(/checkout-step-one\.html/);
        await expect(checkoutInformationPage.errorMessage).toHaveText('Error: Last Name is required');
    });

    test('CO-04: should show error when Postal Code is empty', async ({ page, checkoutInformationPage }) => {
        await checkoutInformationPage.fillCustomerInformation(
            CHECKOUT_INFO.FIRST_NAME,
            CHECKOUT_INFO.LAST_NAME,
            ''
        );

        await expect(page).toHaveURL(/checkout-step-one\.html/);
        await expect(checkoutInformationPage.errorMessage).toHaveText('Error: Postal Code is required');
    });

    test('CO-05: should show Total equal to Item total plus Tax on overview page', async ({ checkoutOverviewPage }) => {
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

    // CO-08: nhập First Name chỉ gồm space hoặc ký tự đặc biệt, ghi nhận hành vi thực tế (không kết luận pass/fail)
    for (const data of CO08_DATA) {
        test(`CO-08: should record behavior when First Name contains ${data.label}`, async ({
                                                                                                page,
                                                                                                checkoutInformationPage,
                                                                                            }) => {
            await checkoutInformationPage.fillCustomerInformation(
                data.value,
                CHECKOUT_INFO.LAST_NAME,
                CHECKOUT_INFO.POSTAL_CODE
            );

            await recordActualBehavior(page, checkoutInformationPage.errorMessage, `First Name = "${data.value}"`);
        });
    }

    // CO-09: nhập 1 ký tự và 256 ký tự vào từng ô, ghi nhận hành vi thực tế (không kết luận pass/fail).
    // Mỗi trường được tách riêng, các trường còn lại dùng dữ liệu hợp lệ.
    for (const field of CO09_FIELDS) {
        for (const length of CO09_LENGTHS) {
            test(`CO-09: should record behavior when ${field.label} has ${length.label}`, async ({
                                                                                                     page,
                                                                                                     checkoutInformationPage,
                                                                                                 }) => {
                // Dò giới hạn thực tế của ô nhập (maxlength) trước khi nhập
                const maxLength = await page.locator(`[data-test="${field.key}"]`).getAttribute('maxlength');
                test.info().annotations.push({
                    type: 'actual-limit',
                    description: `${field.label}: maxlength = ${maxLength ?? 'không giới hạn'}`,
                });

                const values: Record<string, string> = {
                    firstName: CHECKOUT_INFO.FIRST_NAME,
                    lastName: CHECKOUT_INFO.LAST_NAME,
                    postalCode: CHECKOUT_INFO.POSTAL_CODE,
                };
                values[field.key] = length.value;

                await checkoutInformationPage.fillCustomerInformation(
                    values.firstName,
                    values.lastName,
                    values.postalCode
                );

                await recordActualBehavior(
                    page,
                    checkoutInformationPage.errorMessage,
                    `${field.label} = ${length.label}`
                );
            });
        }
    }

    test('CO-10: should prioritize First Name error when both First and Last Name are empty', async ({
                                                                                                         page,
                                                                                                         checkoutInformationPage,
                                                                                                     }) => {
        await checkoutInformationPage.fillCustomerInformation('', '', CHECKOUT_INFO.POSTAL_CODE);

        await expect(page).toHaveURL(/checkout-step-one\.html/);
        await expect(checkoutInformationPage.errorMessage).toHaveText('Error: First Name is required');
    });

    // --- Test case mới, CHƯA có trong test case detail: cần bổ sung CO-11, CO-12 vào detail ---

    // Tổ hợp 7: chỉ Last Name và Postal Code trống
    test('CO-11: should show Last Name error when Last Name and Postal Code are empty', async ({
                                                                                                   page,
                                                                                                   checkoutInformationPage,
                                                                                               }) => {
        await checkoutInformationPage.fillCustomerInformation(CHECKOUT_INFO.FIRST_NAME, '', '');

        await expect(page).toHaveURL(/checkout-step-one\.html/);
        await expect(checkoutInformationPage.errorMessage).toHaveText('Error: Last Name is required');
    });

    // Tổ hợp 8: trống cả ba trường
    test('CO-12: should show First Name error when all three fields are empty', async ({
                                                                                           page,
                                                                                           checkoutInformationPage,
                                                                                       }) => {
        await checkoutInformationPage.fillCustomerInformation('', '', '');

        await expect(page).toHaveURL(/checkout-step-one\.html/);
        await expect(checkoutInformationPage.errorMessage).toHaveText('Error: First Name is required');
    });
});

// --- CO-13 đến CO-15: test case mới, CHƯA có trong test case detail ---
test.describe('Checkout - Multiple products and empty cart', () => {
    const SLUGS = [PRODUCT_SLUGS[0], PRODUCT_SLUGS[1], PRODUCT_SLUGS[2]];

    test('CO-13: should show Total equal to Item total plus Tax with multiple products', async ({
                                                                                                    page,
                                                                                                    loggedInPage,
                                                                                                }) => {
        const { inventoryPage, cartPage } = loggedInPage;
        for (const slug of SLUGS) {
            await inventoryPage.addItemToCart(addToCartId(slug));
        }
        await inventoryPage.goToCart();
        await cartPage.proceedToCheckout();

        await page.locator('[data-test="firstName"]').fill(CHECKOUT_INFO.FIRST_NAME);
        await page.locator('[data-test="lastName"]').fill(CHECKOUT_INFO.LAST_NAME);
        await page.locator('[data-test="postalCode"]').fill(CHECKOUT_INFO.POSTAL_CODE);
        await page.locator('[data-test="continue"]').click();
        await expect(page).toHaveURL(/checkout-step-two\.html/);

        const parse = (text: string): number => parseFloat(text.replace(/[^0-9.]/g, ''));
        const itemTotal = parse(await page.locator('[data-test="subtotal-label"]').innerText());
        const tax = parse(await page.locator('[data-test="tax-label"]').innerText());
        const total = parse(await page.locator('[data-test="total-label"]').innerText());

        expect(toCents(itemTotal) + toCents(tax)).toBe(toCents(total));
    });

    test('CO-14: should list on overview the same products as in cart', async ({ page, loggedInPage }) => {
        const { inventoryPage, cartPage } = loggedInPage;
        for (const slug of SLUGS) {
            await inventoryPage.addItemToCart(addToCartId(slug));
        }
        await inventoryPage.goToCart();

        const names = page.locator('[data-test="inventory-item-name"]');
        const prices = page.locator('[data-test="inventory-item-price"]');
        const quantities = page.locator('[data-test="item-quantity"]');
        const cartNames = await names.allInnerTexts();
        const cartPrices = await prices.allInnerTexts();
        const cartQuantities = await quantities.allInnerTexts();

        await cartPage.proceedToCheckout();
        await page.locator('[data-test="firstName"]').fill(CHECKOUT_INFO.FIRST_NAME);
        await page.locator('[data-test="lastName"]').fill(CHECKOUT_INFO.LAST_NAME);
        await page.locator('[data-test="postalCode"]').fill(CHECKOUT_INFO.POSTAL_CODE);
        await page.locator('[data-test="continue"]').click();
        await expect(page).toHaveURL(/checkout-step-two\.html/);

        expect(await names.allInnerTexts()).toEqual(cartNames);
        expect(await prices.allInnerTexts()).toEqual(cartPrices);
        expect(await quantities.allInnerTexts()).toEqual(cartQuantities);
    });

    test('CO-15: should record behavior when checking out with an empty cart', async ({ page, loggedInPage }) => {
        const { inventoryPage, cartPage } = loggedInPage;
        await inventoryPage.goToCart();
        await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(0);

        await cartPage.proceedToCheckout();

        // Ghi nhận hành vi thực tế, không kết luận pass/fail
        test.info().annotations.push({
            type: 'actual-behavior',
            description: `Checkout với giỏ rỗng | URL: ${page.url()}`,
        });
        await expect(page).toHaveURL(/checkout-step-(one|two)\.html|cart\.html/);
    });
});