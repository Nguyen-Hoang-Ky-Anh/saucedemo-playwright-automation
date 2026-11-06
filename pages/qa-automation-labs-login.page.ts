import { Locator, Page } from '@playwright/test';

export class QaAutomationLabsLoginPage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly autofillDemoCredentialsButton: Locator;
  readonly errorMessage: Locator;

  constructor(private readonly page: Page) {
    // TODO: Xác minh nhãn truy cập của các trường trên site thật.
    this.emailInput = page.getByLabel('Email', { exact: true });
    this.passwordInput = page.getByLabel('Password', { exact: true });
    this.loginButton = page.getByRole('button', { name: 'Login', exact: true });
    this.autofillDemoCredentialsButton = page.getByRole('button', {
      name: /Autofill demo credentials/,
    });
    // TODO: Xác minh vùng thông báo lỗi có role="alert" trên site thật.
    this.errorMessage = page.getByRole('alert');
  }

  async open() {
    // TODO: Xác minh trang đăng nhập nằm tại root của QA_AUTOMATIONLABS_BASE_URL.
    await this.page.goto('/');
  }
}
