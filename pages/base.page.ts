import { Page } from '@playwright/test';

export abstract class BasePage {
  constructor(protected page: Page) {}

  /**
   * Điều hướng tới đường dẫn tương đối (dựa trên baseURL)
   */
  async navigateTo(path: string = '/') {
    await this.page.goto(path);
  }

  /**
   * Lấy URL hiện tại của trang
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Lấy tiêu đề trang
   */
  async getPageTitle(): Promise<string> {
    return this.page.title();
  }
}
