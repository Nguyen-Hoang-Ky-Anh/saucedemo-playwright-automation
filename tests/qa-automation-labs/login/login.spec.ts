import { expect, test } from '@playwright/test';
import { QaAutomationLabsCartPage } from '../../../pages/qa-automation-labs-cart.page';
import { QaAutomationLabsLoginPage } from '../../../pages/qa-automation-labs-login.page';
import { getDemoCredentials } from '../test-data';

test.describe('Login', () => {
  let loginPage: QaAutomationLabsLoginPage;
  const demoCredentials = getDemoCredentials();

  test.beforeEach(async ({ page }) => {
    loginPage = new QaAutomationLabsLoginPage(page);
    await loginPage.open();
  });
  
  test('LG-01: Kiểm tra đăng nhập thành công bằng tài khoản demo (TD-01)', async ({ page }) => {
    const cartPage = new QaAutomationLabsCartPage(page);

    await test.step('1) Nhập Email hợp lệ theo TD-01 vào ô Email.', async () => {
      await loginPage.emailInput.fill(demoCredentials.email);
    });

    await test.step('2) Nhập Password hợp lệ theo TD-01 vào ô Password.', async () => {
      await loginPage.passwordInput.fill(demoCredentials.password);
    });

    await test.step('3) Bấm nút Login.', async () => {
      await loginPage.loginButton.click();
    });

    await expect(page, 'Đăng nhập thành công phải chuyển hướng tới trang Shop.').toHaveURL(/\/shop\.php(?:[?#]|$)/);
    await expect(loginPage.emailInput, 'Form đăng nhập phải ẩn sau khi đăng nhập thành công.').toBeHidden();
    await expect(cartPage.cartIcon, 'Icon giỏ hàng phải hiển thị trên thanh điều hướng.').toBeVisible();
  });
  
  test('LG-02: Kiểm tra đăng nhập với mật khẩu sai', async ({ page }) => {
    const loginUrl = page.url();

    await test.step('1) Nhập Email hợp lệ theo TD-01 vào ô Email.', async () => {
      await loginPage.emailInput.fill(demoCredentials.email);
    });

    await test.step('2) Nhập mật khẩu sai theo TD-03 vào ô Password.', async () => {
      await loginPage.passwordInput.fill('wrong_password');
    });

    await test.step('3) Bấm nút Login.', async () => {
      await loginPage.loginButton.click();
    });

    await expect(loginPage.errorMessage.first(), 'Phải hiển thị thông báo lỗi thông tin đăng nhập không đúng.').toBeVisible();
    await expect(loginPage.loginButton, 'Nút Login phải vẫn hiển thị trên trang đăng nhập.').toBeVisible();
    await expect(page, 'Phải vẫn ở lại trang đăng nhập.').toHaveURL(loginUrl);
  });

  test('LG-03: Đăng nhập với email chưa đăng ký', async ({ page }) => {
    await loginPage.emailInput.fill('unregistered_user_9999@example.com');
    await loginPage.passwordInput.fill(demoCredentials.password);
    const loginUrl = page.url();

    await loginPage.loginButton.click();

    await expect(loginPage.errorMessage.first()).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
    await expect(page).toHaveURL(loginUrl);
  });

  test('LG-04: Để trống Email', async ({ page }) => {
    await loginPage.emailInput.fill('');
    await loginPage.passwordInput.fill(demoCredentials.password);
    const loginUrl = page.url();

    await loginPage.loginButton.click();

    const hasAlert = await loginPage.errorMessage.first().isVisible();
    const validationMessage = await loginPage.emailInput.evaluate(
        (input: HTMLInputElement) => input.validationMessage,
    );
    expect(hasAlert || validationMessage !== '').toBe(true);
    await expect(loginPage.loginButton).toBeVisible();
    await expect(page).toHaveURL(loginUrl);
  });

  test('LG-05: Để trống Password', async ({ page }) => {
    await loginPage.emailInput.fill(demoCredentials.email);
    await loginPage.passwordInput.fill('');
    const loginUrl = page.url();

    await loginPage.loginButton.click();

    const hasAlert = await loginPage.errorMessage.first().isVisible();
    const validationMessage = await loginPage.passwordInput.evaluate(
        (input: HTMLInputElement) => input.validationMessage,
    );
    expect(hasAlert || validationMessage !== '').toBe(true);
    await expect(loginPage.loginButton).toBeVisible();
    await expect(page).toHaveURL(loginUrl);
  });

  test('LG-06: Để trống cả Email và Password', async ({ page }) => {
    await loginPage.emailInput.fill('');
    await loginPage.passwordInput.fill('');
    const loginUrl = page.url();

    await loginPage.loginButton.click();

    // Xác minh nếu site có thể hiển thị đồng thời lỗi của cả hai trường.
    await expect(loginPage.errorMessage.first()).toBeVisible();
    await expect(page).toHaveURL(loginUrl);

    await loginPage.emailInput.fill(demoCredentials.email);
    await loginPage.loginButton.click();

    // Site hiện chỉ hiển thị một lỗi bắt buộc mỗi lần gửi form.
    await expect(loginPage.errorMessage.first()).toBeVisible();
    await expect(page).toHaveURL(loginUrl);
  });

  test('LG-07: Email sai định dạng', async ({ page }) => {
    const loginUrl = page.url();

    for (const email of ['demo', 'demo@']) {
      await test.step(`Từ chối email "${email}"`, async () => {
        await loginPage.emailInput.fill(email);
        await loginPage.passwordInput.fill(demoCredentials.password);
        await loginPage.loginButton.click();

        // Xác minh nội dung cụ thể của cảnh báo email trên site thật.
        const validationMessage = await loginPage.emailInput.evaluate(
          (input: HTMLInputElement) => input.validationMessage,
        );
        const isTypeMismatch = await loginPage.emailInput.evaluate(
          (input: HTMLInputElement) => input.validity.typeMismatch,
        );
        expect(validationMessage).not.toBe('');
        expect(isTypeMismatch).toBe(true);
        await expect(loginPage.loginButton).toBeVisible();
        await expect(page).toHaveURL(loginUrl);
      });
    }
  });

  test('LG-08: Autofill demo credentials', async () => {
    await expect(loginPage.emailInput).toHaveValue('');
    await expect(loginPage.passwordInput).toHaveValue('');
    await expect(loginPage.autofillDemoCredentialsButton).toBeVisible();
    await expect(loginPage.autofillDemoCredentialsButton).toBeEnabled();

    await loginPage.autofillDemoCredentialsButton.click();

    await expect(loginPage.emailInput).toHaveValue(demoCredentials.email);
    await expect(loginPage.passwordInput).toHaveValue(demoCredentials.password);
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
  });
});