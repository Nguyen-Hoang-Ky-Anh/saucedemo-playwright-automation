import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

// Bật chế độ T20 (chạy toàn bộ theo thứ tự, ghi nhận lỗi): T20=1
const isT20 = process.env.T20 === '1';

const chromium = { ...devices['Desktop Chrome'] };
const sauceDemoTestDir = './tests/sauce-demo-tests';
const qaAutomationLabsTestDir = './tests/qa-automation-labs';
// TODO: Set QA_AUTOMATIONLABS_BASE_URL to the actual site origin before running QA Automation Labs tests.
const qaAutomationLabsBaseURL = process.env.QA_AUTOMATIONLABS_BASE_URL || 'https://shop.qaautomationlabs.com/';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  fullyParallel: !isT20,
  forbidOnly: !!process.env.CI,
  retries: isT20 ? 0 : process.env.CI ? 2 : 0,
  workers: isT20 ? 1 : process.env.CI ? 2 : undefined,
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
        { name: '1-login',    testDir: sauceDemoTestDir, testMatch: /login\.spec\.ts/,    use: chromium },
        { name: '2-products', testDir: sauceDemoTestDir, testMatch: /products\.spec\.ts/, use: chromium },
        { name: '3-cart',     testDir: sauceDemoTestDir, testMatch: /cart\.spec\.ts/,     use: chromium },
        { name: '4-checkout', testDir: sauceDemoTestDir, testMatch: /checkout\.spec\.ts/, use: chromium },
        { name: '5-state',    testDir: sauceDemoTestDir, testMatch: /state\.spec\.ts/,    use: chromium },
        {
          name: '6-qaautomationlabs',
          testDir: qaAutomationLabsTestDir,
          use: {
            ...chromium,
            baseURL: qaAutomationLabsBaseURL,
            ignoreHTTPSErrors: true,
            launchOptions: {
              args: ['--ignore-certificate-errors'],
            },
          },
        },
      ]
      : [
        {
          name: 'chromium',
          testDir: sauceDemoTestDir,
          use: chromium,
        },
        {
          name: 'firefox',
          testDir: sauceDemoTestDir,
          grep: /@smoke/,
          use: { ...devices['Desktop Firefox'] },
        },
        {
          name: 'webkit',
          testDir: sauceDemoTestDir,
          grep: /@smoke/,
          use: { ...devices['Desktop Safari'] },
        },
        {
          name: 'qaautomationlabs',
          testDir: qaAutomationLabsTestDir,
          use: {
            ...chromium,
            baseURL: qaAutomationLabsBaseURL,
            ignoreHTTPSErrors: true,
            launchOptions: {
              args: ['--ignore-certificate-errors'],
            },
          },
        },
      ],
});