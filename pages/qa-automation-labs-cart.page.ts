import { expect, Locator, Page } from '@playwright/test';

export interface CartProduct {
  name: string;
  priceCents: number;
  quantity: number;
}

export class QaAutomationLabsCartPage {
  readonly cartIcon: Locator;
  readonly cartProducts: Locator;
  readonly cartRows: Locator;
  readonly cartTotal: Locator;
  readonly removeButtons: Locator;

  constructor(private readonly page: Page) {
    // TODO: Xác minh href và accessible name của icon giỏ trên site thật.
    this.cartIcon = page.locator('a[href$="cart.php"]');
    // TODO: Xác minh từng dòng sản phẩm tiếp tục có trường Quantity.
    this.cartRows = page.getByRole('row').filter({ has: page.getByRole('spinbutton') });
    this.cartProducts = this.cartRows;
    // TODO: Xác minh nội dung nhãn tổng tiền trên trang giỏ.
    this.cartTotal = page.getByRole('heading', { name: /^(?:grand\s+)?total\s*:/i });
    // TODO: Xác minh nút xóa có accessible name "Remove".
    this.removeButtons = page.getByRole('button', { name: /remove/i });
  }

  async openCartByIcon(): Promise<void> {
    // Có thể có cả icon desktop và mobile; click icon đang visible
    const visibleCartIcon = this.cartIcon.first();
    await expect(visibleCartIcon, 'Icon giỏ hàng phải hiển thị.').toBeVisible({ timeout: 10000 });
    await visibleCartIcon.click();
    await expect(this.page).toHaveURL(/\/cart\.php(?:[?#]|$)/);
  }

  async getCartBadgeCount(): Promise<number> {
    const text = (await this.cartIcon.innerText()).trim();
    const count = text.match(/\d+/);
    if (!count) {
      throw new Error('Không đọc được số lượng trên icon giỏ hàng.');
    }
    return Number(count[0]);
  }

  async readProducts(): Promise<CartProduct[]> {
    const products: CartProduct[] = [];

    for (let index = 0; index < (await this.cartRows.count()); index += 1) {
      const row = this.cartRows.nth(index);
      const cells = row.getByRole('cell');
      const name = (await cells.nth(0).innerText()).trim();
      const priceCents = parsePriceCents(await cells.nth(1).innerText());
      const quantityInput = row.getByRole('spinbutton');
      const quantity = (await quantityInput.count())
        ? Number(await quantityInput.inputValue())
        : parseQuantity(await row.innerText());

      products.push({ name, priceCents, quantity });
    }

    return products;
  }

  async getTotalCents(): Promise<number> {
    await expect(this.cartTotal, 'Trang giỏ hàng phải hiển thị nhãn tổng tiền.').toHaveCount(1);
    return parsePriceCents(await this.cartTotal.innerText());
  }

  async removeFirstProduct(): Promise<void> {
    await expect(this.removeButtons.first(), 'Sản phẩm đầu tiên phải có nút xóa.').toBeVisible();
    await this.removeButtons.first().click();
  }

  async clearProducts(): Promise<void> {
    while ((await this.cartRows.count()) > 0) {
      const previousCount = await this.cartRows.count();
      await this.removeButtons.first().click();
      await expect
        .poll(() => this.cartRows.count(), {
          message: 'Sản phẩm phải biến mất khỏi giỏ sau khi xóa.',
        })
        .toBeLessThan(previousCount);
    }
  }
}

export function parsePriceCents(text: string): number {
  const match = text.match(/\$\s*([\d,]+)(?:\.(\d{1,2}))?/);
  if (!match) {
    throw new Error(`Không đọc được giá sản phẩm: ${text}`);
  }
  const wholeDollars = Number(match[1].replaceAll(',', ''));
  const cents = Number((match[2] ?? '').padEnd(2, '0'));
  return wholeDollars * 100 + cents;
}

function parseQuantity(text: string): number {
  const match = text.match(/\bqty\b\s*:?\s*(\d+)|\bquantity\b\s*:?\s*(\d+)/i);
  if (match) {
    return Number(match[1] ?? match[2]);
  }
  throw new Error('Không đọc được số lượng sản phẩm trong giỏ hàng.');
}
