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
   * Điền tên đăng nhập
   */
  async fillUsername(username: string) {
    await this.usernameInput.fill(username);
  }

  /**
   * Điền mật khẩu
   */
  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  /**
   * Nhấp nút Login
   */
  async clickLogin() {
    await this.loginButton.click();
  }

  /**
   * Điền thông tin tài khoản và đăng nhập
   */
  async login(username?: string, password?: string) {
    if (username !== undefined) {
      await this.fillUsername(username);
    } else {
      await this.fillUsername(TEST_USERS.STANDARD.username);
    }
    if (password !== undefined) {
      await this.fillPassword(password);
    } else {
      await this.fillPassword(TEST_USERS.STANDARD.password);
    }
    await this.clickLogin();
  }

  /**
   * Lấy nội dung thông báo lỗi khi đăng nhập sai
   */
  async getErrorMessage(): Promise<string> {
    return (await this.errorMessage.textContent()) ?? '';
  }
}
