import { expect, Page } from '@playwright/test';
import { QaAutomationLabsLoginPage } from '../../../pages/qa-automation-labs-login.page';
import { getDemoCredentials } from '../test-data';

export async function loginAsDemo(page: Page): Promise<void> {
  const credentials = getDemoCredentials();
  const loginPage = new QaAutomationLabsLoginPage(page);

  await loginPage.open();
  await loginPage.emailInput.fill(credentials.email);
  await loginPage.passwordInput.fill(credentials.password);
  await loginPage.loginButton.click();
  // TODO: Xác minh chỉ báo đăng nhập thành công ổn định trên site thật.
  await expect(loginPage.emailInput, 'Đăng nhập phải thành công và form đăng nhập biến mất.').toBeHidden();
}
