import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { TEST_USERS } from '../data/constants';

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
  async login(username = TEST_USERS.STANDARD.username, password = TEST_USERS.STANDARD.password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /**
   * Lấy nội dung thông báo lỗi khi đăng nhập sai
   */
  async getErrorMessage(): Promise<string> {
    return (await this.errorMessage.textContent()) ?? '';
  }
}
