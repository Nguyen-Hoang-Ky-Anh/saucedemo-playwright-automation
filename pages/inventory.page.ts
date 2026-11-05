import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class InventoryPage extends BasePage {
  readonly titleHeader: Locator;
  readonly inventoryItems: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly itemAddButtons: Locator;
  readonly shoppingCartLink: Locator;
  readonly shoppingCartBadge: Locator;
  readonly menuButton: Locator;
  readonly logoutLink: Locator;

  readonly sortDropdown: Locator;

  constructor(page: Page) {
    super(page);
    this.titleHeader = page.locator('.title');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    this.inventoryItems = page.locator('[data-test="inventory-item"]');
    this.itemNames = page.locator('[data-test="inventory-item-name"]');
    this.itemPrices = page.locator('[data-test="inventory-item-price"]');
    this.itemAddButtons = page.locator('[data-test^="add-to-cart"]');
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

  /**
   * Chọn kiểu sắp xếp danh sách sản phẩm
   * @param option Giá trị tùy chọn (ví dụ: 'az', 'za', 'lohi', 'hilo')
   */
  async selectSortOption(option: 'az' | 'za' | 'lohi' | 'hilo') {
    await this.sortDropdown.selectOption(option);
  }

  /**
   * Lấy danh sách toàn bộ tên sản phẩm đang hiển thị
   */
  async getAllProductNames(): Promise<string[]> {
    return this.itemNames.allTextContents();
  }

  /**
   * Lấy danh sách toàn bộ giá sản phẩm dưới dạng số thực (number)
   */
  async getAllProductPrices(): Promise<number[]> {
    const priceTexts = await this.itemPrices.allTextContents();
    return priceTexts.map(text => parseFloat(text.replace('$', '').trim()));
  }

  /**
   * Nhấp vào tên của một sản phẩm theo vị trí index
   */
  async clickProductByIndex(index: number = 0) {
    await this.itemNames.nth(index).click();
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
