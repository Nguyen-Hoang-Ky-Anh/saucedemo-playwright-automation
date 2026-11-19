import { Locator, Page } from '@playwright/test';

export class QaAutomationLabsLoginPage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly autofillDemoCredentialsButton: Locator;
  readonly errorMessage: Locator;
  readonly signInHeading: Locator;
  readonly newUserText: Locator;
  readonly registerHereLink: Locator;
  readonly rememberMeCheckbox: Locator;

  constructor(private readonly page: Page) {
    // TODO: Xác minh nhãn truy cập của các trường trên site thật.
    this.emailInput = page.getByLabel('Email', { exact: true });
    this.passwordInput = page.getByLabel('Password', { exact: true });
    this.loginButton = page.getByRole('button', { name: 'Login', exact: true });
    this.autofillDemoCredentialsButton = page.getByRole('button', {
      name: /Autofill demo credentials/,
    });
    this.rememberMeCheckbox = page
      .getByRole('checkbox', { name: /remember me/i })
      .or(page.locator('#rememberMe'));
    // TODO: Xác minh vùng thông báo lỗi có role="alert" trên site thật.
    this.errorMessage = page.getByRole('alert');
    this.signInHeading = page.getByRole('heading', { name: 'Sign in' });
    this.newUserText = page.getByText('New user?');
    this.registerHereLink = page.getByRole('link', { name: 'Register Here' });
  }

  async open(retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await this.page.goto('/', { waitUntil: 'domcontentloaded', timeout: 15000 });
        await this.loginButton.waitFor({ state: 'visible', timeout: 10000 });
        return;
      } catch (error) {
        if (attempt === retries) {
          throw error;
        }
        await this.page.waitForTimeout(1000 * attempt);
      }
    }
  }

  async clickRegisterHere(): Promise<void> {
    await this.registerHereLink.click();
  }
}
