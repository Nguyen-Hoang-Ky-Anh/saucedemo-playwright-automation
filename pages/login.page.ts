import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  // Locators tuân thủ quy chuẩn: data-test và camelCase
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');
    this.errorMessage = page.locator('[data-test="error"]');
  }

  /**
   * Mở trang login
   */
  async open() {
    await this.navigateTo('/');
  }

  /**
   * Điền thông tin tài khoản và đăng nhập
   */
  async login(username?: string, password?: string) {
    const user = username ?? process.env.SAUCE_USERNAME!;
    const pass = password ?? process.env.SAUCE_PASSWORD!;

    if (user) await this.usernameInput.fill(user);
    if (pass) await this.passwordInput.fill(pass);
    await this.loginButton.click();
  }

  /**
   * Lấy nội dung thông báo lỗi khi đăng nhập sai
   */
  async getErrorMessage(): Promise<string> {
    return (await this.errorMessage.textContent()) ?? '';
  }
}
