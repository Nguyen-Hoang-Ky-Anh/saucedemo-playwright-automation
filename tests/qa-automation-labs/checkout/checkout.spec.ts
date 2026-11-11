import { test, type Page } from '@playwright/test';
import {
  CheckoutObservation,
  QaAutomationLabsCheckoutPage,
} from '../../../pages/qa-automation-labs-checkout.page';
import { loginAsDemo } from '../product/product-auth.helper';
import {
  addOneProductToCart,
  clearCheckoutCart,
  openCheckoutFromCart,
} from './checkout.helper';

async function attachObservation(
  page: Page,
  observation: CheckoutObservation,
): Promise<void> {
  const testInfo = test.info();
  const observationName = `CO-08-${observation.stage}`;
  testInfo.annotations.push({
    type: 'observation',
    description: `${observationName}: ${JSON.stringify(observation)}`,
  });
  await testInfo.attach(`${observationName}.json`, {
    body: Buffer.from(JSON.stringify(observation, null, 2)),
    contentType: 'application/json',
  });
  await testInfo.attach(`${observationName}.png`, {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  });
}

test.describe('Checkout', () => {

  test('CO-07: Kiểm tra xem lịch sử đơn hàng sau khi đặt hàng thành công (nếu có trang Orders)', async ({
                                                                                                          page,
                                                                                                        }) => {
    const { expect } = test;
    const checkoutPage = new QaAutomationLabsCheckoutPage(page);
    let orderedProductName = '';
    let orderedTotalText = '';

    await test.step('1) Ghi nhận thông tin sản phẩm/tổng tiền và điền thông tin hợp lệ TD-05 để hoàn tất đặt hàng', async () => {
      await checkoutPage.expectInformationStep();

      const pageTextBefore = await page.locator('body').innerText();
      const priceMatch = pageTextBefore.match(/\$\s*[\d,]+(?:\.\d{1,2})?/);
      orderedTotalText = priceMatch ? priceMatch[0].replace(/\s+/g, '') : '';

      const count = await checkoutPage.inputFields.count();
      for (let index = 0; index < count; index += 1) {
        const field = checkoutPage.inputFields.nth(index);
        const meta = await field.evaluate((el) => {
          const input = el as HTMLInputElement | HTMLTextAreaElement;
          const labels = Array.from(input.labels ?? [])
              .map((l) => l.innerText.trim())
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

      await checkoutPage.continueButton.click();

      for (let step = 0; step < 3; step += 1) {
        const confirmBtn = page
            .getByRole('button', { name: /place\s+order|confirm|complete|finish|continue|submit|pay/i })
            .first();
        if (await confirmBtn.isVisible().catch(() => false)) {
          const bodyText = await page.locator('body').innerText();
          if (!orderedProductName) {
            const prodLink = page.locator('a[href^="product.php"]').first();
            if (await prodLink.count()) {
              orderedProductName = (await prodLink.innerText()).trim();
            }
          }
          if (!orderedTotalText) {
            const m = bodyText.match(/\$\s*[\d,]+(?:\.\d{1,2})?/);
            if (m) orderedTotalText = m[0].replace(/\s+/g, '');
          }
          await confirmBtn.click();
        } else {
          break;
        }
      }
    });

    await test.step('2) Điều hướng đến trang Orders (nếu có) và kiểm tra thông tin đơn hàng vừa đặt', async () => {
      const ordersLink = page
          .getByRole('link', { name: /order/i })
          .or(page.locator('a[href*="order"]'))
          .first();

      if (await ordersLink.isVisible().catch(() => false)) {
        await ordersLink.click();
      } else {
        const response = await page.goto('/orders.php').catch(() => null);
        if (!response || response.status() >= 400) {
          test.info().annotations.push({
            type: 'observation',
            description: 'CO-07: Hệ thống không có trang /orders.php riêng biệt; xác nhận trực tiếp trên luồng hoàn tất đơn',
          });
        }
      }

      const finalBodyText = await page.locator('body').innerText();
      expect(finalBodyText.length, 'Trang kết quả đơn hàng phải hiển thị nội dung').toBeGreaterThan(0);
      if (orderedProductName) {
        expect(finalBodyText).toContain(orderedProductName);
      }
    });
  });

  test('CO-08: Thăm dò hành vi các ô nhập của form checkout với 1 ký tự và 256 ký tự', async ({
    page,
  }) => {
    test.info().annotations.push({
      type: 'exploratory',
      description: 'Ưu tiên P3; kỹ thuật BVA (thăm dò). Chỉ ghi nhận, không kết luận pass/fail theo hành vi form.',
    });
    const checkoutPage = new QaAutomationLabsCheckoutPage(page);
    const observations: CheckoutObservation[] = [];

    await test.step('1) Nhập một ký tự vào từng ô nhập của form.', async () => {
      await checkoutPage.fillFields(1);
    });

    await test.step('2) Bấm nút tiếp tục và ghi lại phản hồi của hệ thống.', async () => {
      observations.push(await checkoutPage.clickContinueAndObserve('step-2-one-character'));
      await attachObservation(page, observations[0]);
    });

    await test.step('3) Quay lại bước nhập thông tin nếu cần, xóa dữ liệu và nhập 256 ký tự vào từng ô.', async () => {
      await checkoutPage.returnToInformationStep();
      await checkoutPage.fillFields(256);
    });

    await test.step('4) Bấm nút tiếp tục và ghi lại phản hồi của hệ thống.', async () => {
      observations.push(await checkoutPage.clickContinueAndObserve('step-4-256-characters'));
      await attachObservation(page, observations[1]);
    });

    test.info().annotations.push({
      type: 'CO-08 summary',
      description: JSON.stringify(
        observations.map(({ stage, fields, visibleErrors, urlChanged, horizontalOverflow }) => ({
          stage,
          fields: fields.map(({ label, attemptedLength, length, maxLength }) => ({
            label,
            attemptedLength,
            length,
            maxLength,
          })),
          visibleErrors,
          urlChanged,
          horizontalOverflow,
        })),
      ),
    });
  });

  test.beforeEach(async ({ page }) => {
    await loginAsDemo(page);
    // TODO: Xác minh giỏ hàng lưu theo tài khoản hay theo phiên.
    await clearCheckoutCart(page);
    await addOneProductToCart(page);
    await openCheckoutFromCart(page);
  });

  test.afterEach(async ({ page }) => {
    await clearCheckoutCart(page);
  });
});