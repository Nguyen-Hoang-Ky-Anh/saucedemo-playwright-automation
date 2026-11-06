import { test, expect } from '../../../fixtures/test.fixture';
// import {PRODUCT_SLUGS} from "../../../data/constants";
test.describe('GUI and UI baseline and performance', ()=>{
    test('GUI-01: should render login form elements properly and mask password input', async ({loginPage})=>{
        await loginPage.navigateTo('/');
        await expect(loginPage.usernameInput).toBeVisible();
        await expect(loginPage.passwordInput).toBeVisible();
        await expect(loginPage.loginButton).toBeVisible();
        // kiểm tra pw có thuộc tính type để ẩn không
        await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
    });

    test('GUI-02: should navigate focus sequentially when pressing tab on login form',async ({page, loginPage}) =>{
        await loginPage.navigateTo('/');
        await page.mouse.click(0,0); // reset tọa độ để có thể tab theo đúng thứ tự

        await page.keyboard.press('Tab');
        await expect(loginPage.usernameInput).toBeFocused();
        await page.keyboard.press('Tab');
        await expect(loginPage.passwordInput).toBeFocused();
        await page.keyboard.press('Tab');
        await expect(loginPage.loginButton).toBeFocused();
    });

    test('UI-01: should match login page baseline screenshot', async({page, loginPage}) =>{
        await loginPage.navigateTo('/');
        // so sánh ảnh chụp với ảnh baseline trang đăng nhập
        await expect(page).toHaveScreenshot('login-page-baseline.png');
    });

    test('UI-02: should match inventory page baseline screenshot',async({page,loggedInPage})=>{
        const {inventoryPage} = loggedInPage;
        //so sánh ảnh chụp chụp với ảnh baseline trang sản phẩm đảm bảo vào thì có sản phẩm trước rồi mới so sánh
        await expect(inventoryPage.inventoryItems.first()).toBeVisible();
        await expect(page).toHaveScreenshot('inventory-page-baseline.png',{fullPage:true});
    });

    test('UI-03: should load inventory page in less than 15s for performance_glitch_user', async ({ page, loginPage }) => {
        // tính time từ khi đăng nhập đến khi load sản phẩm mất bao nhiêu giây
        // dưới 15 giây thì pass
        await loginPage.navigateTo('/');
        await loginPage.usernameInput.fill('performance_glitch_user');
        await loginPage.passwordInput.fill('secret_sauce');

        const start = Date.now();
        await loginPage.loginButton.click();
        await expect(page).toHaveURL(/inventory\.html/, { timeout: 15000 });
        await expect(page.locator('[data-test="inventory-item"]').first())
            .toBeVisible({ timeout: 15000 });
        const loadTime = Date.now() - start;

        expect(loadTime).toBeLessThan(15000);
    });
})