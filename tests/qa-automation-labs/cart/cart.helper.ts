import { expect, Page } from '@playwright/test';
import {
  CartProduct,
  parsePriceCents,
  QaAutomationLabsCartPage,
} from '../../../pages/qa-automation-labs-cart.page';
import { QaAutomationLabsProductPage } from '../../../pages/qa-automation-labs-product.page';

const MENS_WEAR_CATEGORY = {
  path: '/mens-wear.php', // TODO: Xác minh path danh mục trên site thật.
};

export interface AddedProduct {
  name: string;
  priceCents: number;
}

export async function clearCart(page: Page): Promise<void> {
  const cartPage = new QaAutomationLabsCartPage(page);
  await cartPage.openCartByIcon();
  await cartPage.clearProducts();
}

export async function addTwoDistinctProducts(page: Page): Promise<[AddedProduct, AddedProduct]> {
  const productPage = new QaAutomationLabsProductPage(page);
  const cartPage = new QaAutomationLabsCartPage(page);

  await page.goto(MENS_WEAR_CATEGORY.path);
  // TODO: Xác minh mens-wear.php vẫn là đường dẫn danh mục dùng được sau khi mở giỏ.
  expect(new URL(page.url()).pathname).toBe(MENS_WEAR_CATEGORY.path);
  await expect(productPage.productList.first()).toBeVisible();

  const productLinks = productPage.productList;
  expect(await productLinks.count(), 'Danh mục phải có ít nhất hai sản phẩm khác nhau.').toBeGreaterThanOrEqual(2);

  const products: AddedProduct[] = [];
  for (let index = 0; index < 2; index += 1) {
    const productLink = productLinks.nth(index);
    const name = (await productLink.innerText()).trim();
    const card = productLink.locator('..');
    const priceCents = parsePriceCents(await card.innerText());
    const addButton = card.getByRole('button', { name: /add .*to cart/i });

    expect(name, 'Hai sản phẩm được chọn phải khác nhau.').not.toBe(products[0]?.name);
    await expect(addButton, `Sản phẩm "${name}" phải có nút thêm vào giỏ.`).toBeVisible();
    await addButton.click();
    products.push({ name, priceCents });

    await expect
      .poll(() => cartPage.getCartBadgeCount(), {
        message: `Icon giỏ hàng phải hiển thị ${index + 1} sản phẩm sau khi thêm.`,
      })
      .toBe(index + 1);
  }

  return [products[0], products[1]];
}

export function expectCartProduct(
  actual: CartProduct,
  expected: AddedProduct,
): void {
  expect(actual.name, 'Tên sản phẩm trong giỏ phải khớp tên đã ghi lúc thêm.').toBe(expected.name);
  expect(actual.priceCents, `Giá của "${expected.name}" trong giỏ phải khớp giá lúc thêm.`).toBe(
    expected.priceCents,
  );
  expect(actual.quantity, `Số lượng "${expected.name}" trong giỏ phải bằng 1.`).toBe(1);
}
