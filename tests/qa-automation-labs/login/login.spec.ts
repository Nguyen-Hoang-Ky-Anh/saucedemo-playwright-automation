import { expect, test } from '@playwright/test';
import { QaAutomationLabsLoginPage } from '../../../pages/qa-automation-labs-login.page';

test.describe('Login', () => {
  let loginPage: QaAutomationLabsLoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new QaAutomationLabsLoginPage(page);
    await loginPage.open();
  });

  test('LG-06: Để trống cả Email và Password', async ({ page }) => {
    await loginPage.emailInput.fill('');
    await loginPage.passwordInput.fill('');
    const loginUrl = page.url();

    await loginPage.loginButton.click();

    // Xác minh nếu site có thể hiển thị đồng thời lỗi của cả hai trường.
    await expect(loginPage.errorMessage.first()).toBeVisible();
    await expect(page).toHaveURL(loginUrl);

    await loginPage.emailInput.fill('demo@demo.com');
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
        await loginPage.passwordInput.fill('demo');
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

    await expect(loginPage.emailInput).toHaveValue('demo@demo.com');
    await expect(loginPage.passwordInput).toHaveValue('demo');
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
  });
});