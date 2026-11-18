import { expect, Page } from '@playwright/test';
import { QaAutomationLabsCartPage } from '../../../pages/qa-automation-labs-cart.page';
import { QaAutomationLabsCheckoutPage } from '../../../pages/qa-automation-labs-checkout.page';
import { QaAutomationLabsProductPage } from '../../../pages/qa-automation-labs-product.page';

const MENS_WEAR_PATH = '/mens-wear.php'; // TODO: Xác minh đường dẫn danh mục trên site thật.

export async function addOneProductToCart(page: Page): Promise<void> {
  const productPage = new QaAutomationLabsProductPage(page);
  const cartPage = new QaAutomationLabsCartPage(page);

  await page.goto(MENS_WEAR_PATH);
  await expect(productPage.productList.first(), 'Danh mục phải hiển thị sản phẩm.').toBeVisible();

  const firstProduct = productPage.productList.first();
  const productCard = firstProduct.locator('..');
  const addButton = productCard.getByRole('button', { name: /add .*to cart/i });
  await expect(addButton, 'Sản phẩm đầu tiên phải có nút thêm vào giỏ.').toBeVisible();
  await addButton.click();

  await expect
    .poll(() => cartPage.getCartBadgeCount(), {
      message: 'Icon giỏ hàng phải hiển thị một sản phẩm.',
    })
    .toBe(1);
}

export async function clearCheckoutCart(page: Page): Promise<void> {
  const cartPage = new QaAutomationLabsCartPage(page);
  await page.goto('/cart.php');
  await expect(page).toHaveURL(/\/cart\.php(?:[?#]|$)/);
  await cartPage.clearProducts();
}

export async function openCheckoutFromCart(page: Page): Promise<void> {
  const cartIcon = page.locator('a[href$="cart.php"]').first();
  await expect(cartIcon, 'Icon giỏ hàng phải có thể mở giỏ.').toBeVisible();
  await cartIcon.click();
  await expect(page).toHaveURL(/\/cart\.php(?:[?#]|$)/);

  const checkoutPage = new QaAutomationLabsCheckoutPage(page);
  // TODO: Xác minh nhãn nút mở checkout trên site thật.
  await checkoutPage.checkoutButton.click();
  await checkoutPage.expectInformationStep();
}

export async function fillValidCheckoutInformation(
  checkoutPage: QaAutomationLabsCheckoutPage,
): Promise<void> {
  await checkoutPage.expectInformationStep();
  const count = await checkoutPage.inputFields.count();

  for (let index = 0; index < count; index += 1) {
    const field = checkoutPage.inputFields.nth(index);
    const meta = await field.evaluate((el) => {
      const input = el as HTMLInputElement | HTMLTextAreaElement;
      const labels = Array.from(input.labels ?? [])
        .map((label) => label.innerText.trim())
        .join(' ');
      return {
        text: `${labels} ${input.placeholder} ${input.name} ${input.id}`.toLowerCase(),
        type: input.getAttribute('type') ?? 'text',
      };
    });

    if (meta.type === 'email' || meta.text.includes('email') || meta.text.includes('mail')) {
      await field.fill(process.env.QA_AUTOMATIONLABS_DEMO_EMAIL || 'demo@demo.com');
    } else if (meta.text.includes('phone') || meta.text.includes('tel') || meta.text.includes('mobile')) {
      await field.fill('0987654321');
    } else if (
      meta.type === 'number' ||
      meta.text.includes('zip') ||
      meta.text.includes('postal') ||
      meta.text.includes('pin') ||
      meta.text.includes('code')
    ) {
      await field.fill('12345');
    } else if (meta.text.includes('first')) {
      await field.fill('John');
    } else if (meta.text.includes('last')) {
      await field.fill('Doe');
    } else {
      await field.fill('123 Main Street');
    }
  }
}
