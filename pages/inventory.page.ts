import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class InventoryPage extends BasePage {
  readonly titleHeader: Locator;
  readonly inventoryItems: Locator;
  readonly shoppingCartLink: Locator;
  readonly shoppingCartBadge: Locator;

  constructor(page: Page) {
    super(page);
    this.titleHeader = page.locator('.title');
    this.inventoryItems = page.locator('[data-test="inventory-item"]');
    this.shoppingCartLink = page.locator('[data-test="shopping-cart-link"]');
    this.shoppingCartBadge = page.locator('[data-test="shopping-cart-badge"]');
  }

  /**
   * Mở trực tiếp trang Inventory
   */
  async open() {
    await this.navigateTo('/inventory.html');
  }

  /**
   * Thêm sản phẩm vào giỏ hàng theo data-test identifier
   * @param itemName Tên nhận diện nút add-to-cart (ví dụ: 'add-to-cart-sauce-labs-backpack')
   */
  async addItemToCart(itemName: string) {
    await this.page.locator(`[data-test="${itemName}"]`).click();
  }

  /**
   * Xóa sản phẩm khỏi giỏ hàng theo data-test identifier
   * @param itemName Tên nhận diện nút remove
   * (ví dụ: 'remove-sauce-labs-backpack')
   */
  async removeItemFromCart(itemName: string) {
    await this.page.locator(`[data-test="${itemName}"]`).click();
  }

  /**
   * Nhấp mở giỏ hàng
   */
  async goToCart() {
    await this.shoppingCartLink.click();
  }

  /**
   * Đếm số lượng sản phẩm đang hiển thị
   */
  async getItemCount(): Promise<number> {
    return this.inventoryItems.count();
  }

  /** Lấy nút của sản phẩm theo data-test (để test tự kiểm tra) */
  getProductButton(itemName: string): Locator {
    return this.page.locator(`[data-test="${itemName}"]`);
  }
}
