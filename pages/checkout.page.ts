import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { parsePrice } from '../utils/common-helpers';

export class CheckoutPage extends BasePage {
  readonly titleHeader: Locator;
  // Step 1: Thông tin khách hàng
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  readonly errorMessage: Locator;

  // Step 2 & Complete: Tổng quan và Hoàn tất
  readonly finishButton: Locator;
  readonly completeHeader: Locator;
  readonly completeText: Locator;
  readonly backHomeButton: Locator;

  // Step 3: Price
  readonly itemTotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;

  constructor(page: Page) {
    super(page);
    this.titleHeader = page.locator('.title');
    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
    this.cancelButton = page.locator('[data-test="cancel"]');
    this.errorMessage = page.locator('[data-test="error"]');

    this.finishButton = page.locator('[data-test="finish"]');
    this.completeHeader = page.locator('[data-test="complete-header"]');
    this.completeText = page.locator('[data-test="complete-text"]');
    this.backHomeButton = page.locator('[data-test="back-to-products"]');

    this.itemTotalLabel = page.locator('[data-test="subtotal-label"]');
    this.taxLabel = page.locator('[data-test="tax-label"]');
    this.totalLabel = page.locator('[data-test="total-label"]');
  }

  /**
   * Điền thông tin cá nhân ở bước Checkout Step One
   */
  async fillCustomerInformation(firstName: string, lastName: string, postalCode: string) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
    await this.continueButton.click();
  }

  /**
   * Xác nhận hoàn tất đơn hàng ở bước Checkout Step Two
   */
  async finishOrder() {
    await this.finishButton.click();
  }

  /**
   * Bấm nút Cancel (ở bước Overview sẽ quay về trang Inventory)
   */
  async cancelCheckout() {
    await this.cancelButton.click();
  }

  /** Lấy "Item total" ở trang Overview dưới dạng số */
  async getItemTotal(): Promise<number> {
    return parsePrice((await this.itemTotalLabel.textContent()) ?? '');
  }

  /** Lấy "Tax" ở trang Overview dưới dạng số */
  async getTax(): Promise<number> {
    return parsePrice((await this.taxLabel.textContent()) ?? '');
  }

  /** Lấy "Total" ở trang Overview dưới dạng số */
  async getTotal(): Promise<number> {
    return parsePrice((await this.totalLabel.textContent()) ?? '');
  }

  /** Bấm Back Home ở trang Checkout: Complete */
  async backToProducts() {
    await this.backHomeButton.click();
  }
}
