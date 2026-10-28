import { test, expect } from '../../fixtures/test.fixture';
import { toCents } from '../../utils/common-helpers';

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
});