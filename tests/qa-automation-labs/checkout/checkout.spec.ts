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