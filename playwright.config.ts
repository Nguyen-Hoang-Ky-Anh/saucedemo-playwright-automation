import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

// Bật chế độ T20 (chạy toàn bộ theo thứ tự, ghi nhận lỗi): T20=1
const isT20 = process.env.T20 === '1';

const chromium = { ...devices['Desktop Chrome'] };

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: !isT20,
  forbidOnly: !!process.env.CI,
  retries: isT20 ? 0 : process.env.CI ? 2 : 0,
  workers: isT20 ? 1 : process.env.CI ? 1 : undefined,
  reporter: isT20
      ? [
        ['html', { open: 'never' }],
        ['json', { outputFile: 'test-results/results.json' }],
      ]
      : 'html',
  use: {
    baseURL: 'https://www.saucedemo.com',
    trace: isT20 ? 'on' : 'on-first-retry',
    screenshot: 'only-on-failure',
    video: isT20 ? 'on' : 'retain-on-failure',
  },

  projects: isT20
      ? [
        { name: '1-login',    testMatch: /login\.spec\.ts/,    use: chromium },
        { name: '2-products', testMatch: /products\.spec\.ts/, use: chromium },
        { name: '3-cart',     testMatch: /cart\.spec\.ts/,     use: chromium },
        { name: '4-checkout', testMatch: /checkout\.spec\.ts/, use: chromium },
        { name: '5-state',    testMatch: /state\.spec\.ts/,    use: chromium },
      ]
      : [
        {
          name: 'chromium',
          use: { ...devices['Desktop Chrome'] },
        },
      ],
});