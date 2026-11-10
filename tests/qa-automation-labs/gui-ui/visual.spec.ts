
import { expect, test } from '@playwright/test';

const LOGIN_PATH = '/';
const BASELINE_NAME = 'login-page.png';

const LOGIN_VIEWPORT = {
  width: 1280,
  height: 720,
};

test.describe('Visual', () => {
  test.use({
    viewport: LOGIN_VIEWPORT,
    storageState: { cookies: [], origins: [] },
  });

  test('UI-01: So sánh ảnh chụp trang đăng nhập với ảnh baseline', async ({
                                                                            page,
                                                                            browserName,
                                                                          }) => {
    test.skip(browserName !== 'chromium', 'UI-01 chỉ chạy trên Chromium.');

    test.info().annotations.push({
      type: 'Ưu tiên',
      description: 'P3',
    });

    test.info().annotations.push({
      type: 'Kỹ thuật',
      description: 'GUI (so sánh ảnh)',
    });

    await test.step('1) Mở trang đăng nhập bằng Chromium.', async () => {
      await page.goto(LOGIN_PATH);

      await expect(
          page.getByLabel('Email', { exact: true })
      ).toBeVisible();

      await expect(
          page.getByLabel('Password', { exact: true })
      ).toBeVisible();

      await expect(
          page.getByRole('button', { name: 'Login', exact: true })
      ).toBeVisible();
    });

    await test.step('2) Chụp ảnh màn hình trang đăng nhập.', async () => {
      await test.info().attach('login-page-captured.png', {
        body: await page.screenshot({
          animations: 'disabled',
          caret: 'hide',
        }),
        contentType: 'image/png',
      });
    });

    await test.step('3) So sánh ảnh vừa chụp với ảnh baseline.', async () => {
      await expect(page).toHaveScreenshot(BASELINE_NAME, {
        animations: 'disabled',
        caret: 'hide',
        mask: [
          page.getByPlaceholder(/search/i),
          page.getByRole('button', { name: /autofill demo credentials/i }),
        ],
      });
    });
  });
});
