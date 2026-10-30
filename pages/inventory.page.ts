import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class InventoryPage extends BasePage {
  readonly titleHeader: Locator;
  readonly inventoryItems: Locator;
  readonly shoppingCartLink: Locator;
  readonly shoppingCartBadge: Locator;
  readonly menuButton: Locator;
  readonly logoutLink: Locator;

  constructor(page: Page) {
    super(page);
    this.titleHeader = page.locator('.title');
    this.inventoryItems = page.locator('[data-test="inventory-item"]');
    this.shoppingCartLink = page.locator('[data-test="shopping-cart-link"]');
    this.shoppingCartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.menuButton = page.locator('#react-burger-menu-btn');
    this.logoutLink = page.locator('[data-test="logout-sidebar-link"]');
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

  /**
   * Mở menu điều hướng
   */
  async openMenu() {
    await this.menuButton.click();
  }

  /**
   * Đăng xuất qua menu điều hướng
   */
  async logout() {
    await this.openMenu();
    await this.logoutLink.click();
  }
}
