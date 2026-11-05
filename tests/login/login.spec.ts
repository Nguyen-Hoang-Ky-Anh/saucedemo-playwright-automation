import { test, expect } from '../../fixtures/test.fixture';
import { TEST_USERS, WRONG_PASSWORD, ERROR_MESSAGES } from '../../data/constants';

// URL trang đăng nhập (có hoặc không có dấu "/" ở cuối)
const LOGIN_URL = /^https:\/\/www\.saucedemo\.com\/?$/;

test.describe('Authentication - Login Flow', () => {
    test.beforeEach(async ({ loginPage }) => {
        await loginPage.open();
    });

    test('LG-01: should login successfully with standard_user', async ({
                                                                           page,
                                                                           loginPage,
                                                                           inventoryPage,
                                                                       }) => {
        // Bước 1-3: Nhập standard_user, secret_sauce theo TD-01 và bấm nút Login
        await loginPage.login(TEST_USERS.STANDARD.username, TEST_USERS.STANDARD.password);

        // Kết quả mong đợi: Hệ thống chuyển đến trang /inventory.html và hiển thị tiêu đề "Products"
        await expect(page).toHaveURL(/inventory\.html/);
        await expect(inventoryPage.titleHeader).toHaveText('Products');
    });

    test('LG-02: should show error when logging in with locked_out_user', async ({
                                                                                     page,
                                                                                     loginPage,
                                                                                 }) => {
        // Bước 1-3: Nhập locked_out_user, secret_sauce theo TD-02 và bấm nút Login
        await loginPage.login(TEST_USERS.LOCKED.username, TEST_USERS.LOCKED.password);

        // Kết quả mong đợi: Không đăng nhập được, vẫn ở trang đăng nhập và hiển thị thông báo lỗi
        await expect(page).toHaveURL(LOGIN_URL);
        await expect(loginPage.loginButton).toBeVisible();
        await expect(loginPage.errorMessage).toHaveText(ERROR_MESSAGES.LOCKED_OUT_USER);
    });

    test('LG-03: should show error when logging in with wrong password', async ({
                                                                                    page,
                                                                                    loginPage,
                                                                                }) => {
        // Bước 1-3: Nhập standard_user, mật khẩu sai wrong_password và bấm nút Login
        await loginPage.login(TEST_USERS.STANDARD.username, WRONG_PASSWORD);

        // Kết quả mong đợi: Không đăng nhập được, vẫn ở trang đăng nhập và hiển thị thông báo lỗi
        await expect(page).toHaveURL(LOGIN_URL);
        await expect(loginPage.loginButton).toBeVisible();
        await expect(loginPage.errorMessage).toHaveText(ERROR_MESSAGES.USER_NOT_MATCH);
    });

    test('LG-04: should show error when username is empty', async ({
                                                                       page,
                                                                       loginPage,
                                                                   }) => {
        // Bước 1-3: Để trống ô Username, nhập mật khẩu secret_sauce theo TD-01 và bấm nút Login
        await loginPage.fillPassword(TEST_USERS.STANDARD.password);
        await loginPage.clickLogin();

        // Kết quả mong đợi: Không đăng nhập được, vẫn ở trang đăng nhập và hiển thị thông báo lỗi
        await expect(page).toHaveURL(LOGIN_URL);
        await expect(loginPage.loginButton).toBeVisible();
        await expect(loginPage.errorMessage).toHaveText(ERROR_MESSAGES.USERNAME_REQUIRED);
    });

    test('LG-05: should show error when password is empty', async ({
                                                                       page,
                                                                       loginPage,
                                                                   }) => {
        // Bước 1-3: Nhập username standard_user theo TD-01, để trống ô Password và bấm nút Login
        await loginPage.fillUsername(TEST_USERS.STANDARD.username);
        await loginPage.clickLogin();

        // Kết quả mong đợi: Không đăng nhập được, vẫn ở trang đăng nhập và hiển thị thông báo lỗi
        await expect(page).toHaveURL(LOGIN_URL);
        await expect(loginPage.loginButton).toBeVisible();
        await expect(loginPage.errorMessage).toHaveText(ERROR_MESSAGES.PASSWORD_REQUIRED);
    });

    test('LG-06: should return to login page with empty fields after logout from menu', async ({
                                                                                                   page,
                                                                                                   loggedInPage,
                                                                                               }) => {
        const { loginPage, inventoryPage } = loggedInPage;

        // Bước 1-3: Bấm nút menu (biểu tượng ba gạch), bấm mục Logout và quan sát trang chuyển đến
        await inventoryPage.logout();

        // Kết quả mong đợi: Quay về trang đăng nhập, hiển thị ô Username, Password và nút Login; các ô nhập không còn dữ liệu
        await expect(page).toHaveURL(LOGIN_URL);
        await expect(loginPage.usernameInput).toBeVisible();
        await expect(loginPage.passwordInput).toBeVisible();
        await expect(loginPage.loginButton).toBeVisible();
        await expect(loginPage.usernameInput).toHaveValue('');
        await expect(loginPage.passwordInput).toHaveValue('');

        // Bước 4: Bấm nút Back của trình duyệt
        await page.goBack();

        // Kết quả mong đợi: Không quay lại được trang sản phẩm, vẫn ở trang đăng nhập
        await expect(page).toHaveURL(LOGIN_URL);
        await expect(loginPage.loginButton).toBeVisible();
        await expect(page.locator('[data-test="inventory-list"]')).toHaveCount(0);
    });

    test('LG-07: should redirect to login page with error when opening /inventory.html without login', async ({
                                                                                                                  page,
                                                                                                                  loginPage,
                                                                                                                  inventoryPage,
                                                                                                              }) => {
        // Bước 1-2: Nhập URL https://www.saucedemo.com/inventory.html trực tiếp lên thanh địa chỉ và nhấn Enter
        await inventoryPage.open();

        // Kết quả mong đợi: Bị chặn, không vào được trang sản phẩm; điều hướng về trang đăng nhập và hiển thị thông báo lỗi
        await expect(page).toHaveURL(LOGIN_URL);
        await expect(loginPage.loginButton).toBeVisible();
        await expect(loginPage.errorMessage).toHaveText(ERROR_MESSAGES.INVENTORY_REQUIRES_LOGIN);
    });

    test('LG-08: should show error when logging in with non-existent username', async ({
                                                                                           page,
                                                                                           loginPage,
                                                                                       }) => {
        // Bước 1-3: Nhập username không tồn tại invalid_user_123 theo TD-03, mật khẩu chung secret_sauce và bấm nút Login
        await loginPage.login(TEST_USERS.INVALID.username, TEST_USERS.STANDARD.password);

        // Kết quả mong đợi: Không đăng nhập được, vẫn ở trang đăng nhập và hiển thị thông báo lỗi
        await expect(page).toHaveURL(LOGIN_URL);
        await expect(loginPage.loginButton).toBeVisible();
        await expect(loginPage.errorMessage).toHaveText(ERROR_MESSAGES.USER_NOT_MATCH);
    });

    test('LG-09: should show username required error when both username and password are empty', async ({
                                                                                                            page,
                                                                                                            loginPage,
                                                                                                        }) => {
        // Bước 1-3: Để trống cả hai ô Username và Password, bấm nút Login và quan sát thông báo lỗi được ưu tiên hiển thị
        await loginPage.clickLogin();

        // Kết quả mong đợi: Không đăng nhập được, vẫn ở trang đăng nhập; hiển thị lỗi của username trước theo thứ tự ưu tiên
        await expect(page).toHaveURL(LOGIN_URL);
        await expect(loginPage.loginButton).toBeVisible();
        await expect(loginPage.errorMessage).toHaveText(ERROR_MESSAGES.USERNAME_REQUIRED);
    });

    // --- Test case mới (cần bổ sung vào test case detail) ---

    // UI3 + PI1: username trống + mật khẩu sai
    test('LG-10: should show username required error when username is empty and password is wrong', async ({
                                                                                                               page,
                                                                                                               loginPage,
                                                                                                           }) => {
        await loginPage.fillPassword(WRONG_PASSWORD);
        await loginPage.clickLogin();

        await expect(page).toHaveURL(LOGIN_URL);
        await expect(loginPage.loginButton).toBeVisible();
        await expect(loginPage.errorMessage).toHaveText(ERROR_MESSAGES.USERNAME_REQUIRED);
    });

    // UI2 + PI2: username không tồn tại + để trống password
    test('LG-11: should show password required error when username does not exist and password is empty', async ({
                                                                                                                     page,
                                                                                                                     loginPage,
                                                                                                                 }) => {
        await loginPage.fillUsername(TEST_USERS.INVALID.username);
        await loginPage.clickLogin();

        await expect(page).toHaveURL(LOGIN_URL);
        await expect(loginPage.loginButton).toBeVisible();
        await expect(loginPage.errorMessage).toHaveText(ERROR_MESSAGES.PASSWORD_REQUIRED);
    });

    // UI1 + PI1: locked_out_user + mật khẩu sai
    test('LG-12: should show credentials mismatch error when locked_out_user uses wrong password', async ({
                                                                                                              page,
                                                                                                              loginPage,
                                                                                                          }) => {
        await loginPage.login(TEST_USERS.LOCKED.username, WRONG_PASSWORD);

        await expect(page).toHaveURL(LOGIN_URL);
        await expect(loginPage.loginButton).toBeVisible();
        await expect(loginPage.errorMessage).toHaveText(ERROR_MESSAGES.USER_NOT_MATCH);
    });
});