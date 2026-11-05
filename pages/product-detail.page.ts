import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class ProductDetailPage extends BasePage {
  readonly titleHeader: Locator;
  readonly backToProductsButton: Locator;
  readonly productName: Locator;
  readonly productDescription: Locator;
  readonly productPrice: Locator;
  readonly addToCartButton: Locator;

  constructor(page: Page) {
    super(page);
    this.titleHeader = page.locator('.title');
    this.backToProductsButton = page.locator('[data-test="back-to-products"]');
    this.productName = page.locator('[data-test="inventory-item-name"]');
    this.productDescription = page.locator('[data-test="inventory-item-desc"]');
    this.productPrice = page.locator('[data-test="inventory-item-price"]');
    this.addToCartButton = page.locator('[data-test^="add-to-cart"]');
  }

  /**
   * Lấy tên sản phẩm hiển thị trên trang chi tiết
   */
  async getProductName(): Promise<string> {
    return (await this.productName.textContent())?.trim() ?? '';
  }

  /**
   * Lấy giá sản phẩm hiển thị trên trang chi tiết
   */
  async getProductPrice(): Promise<string> {
    return (await this.productPrice.textContent())?.trim() ?? '';
  }

  /**
   * Bấm quay lại trang danh sách sản phẩm
   */
  async backToProducts() {
    await this.backToProductsButton.click();
  }
}
