import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class CartPage extends BasePage {
  readonly titleHeader: Locator;
  readonly cartItems: Locator;
  readonly cartItemNames: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    super(page);
    this.titleHeader = page.locator('.title');
    this.cartItems = page.locator('[data-test="inventory-item"]');
    this.cartItemNames = page.locator('[data-test="inventory-item-name"]');
    this.checkoutButton = page.locator('[data-test="checkout"]');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
  }

  /**
   * Mở trực tiếp trang Giỏ hàng
   */
  async open() {
    await this.navigateTo('/cart.html');
  }

  /**
   * Bấm nút Checkout để sang bước thanh toán
   */
  async proceedToCheckout() {
    await this.checkoutButton.click();
  }

  /**
   * Xóa sản phẩm khỏi giỏ hàng theo data-test
   */
  async removeItem(removeButtonSelector: string) {
    await this.page.locator(`[data-test="${removeButtonSelector}"]`).click();
  }

  /**
   * Bấm nút Continue Shopping để tiếp tục mua hàng
   */
  async continueShopping() {
    await this.continueShoppingButton.click();
  }

  /**
   * Lấy số lượng sản phẩm có trong giỏ hàng
   */
  async getItemCount(): Promise<number> {
    return this.cartItems.count();
  }
}
