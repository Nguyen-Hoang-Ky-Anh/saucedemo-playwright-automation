import { test, expect } from '@playwright/test';

test.describe('SauceDemo Login Flow', () => {
  test('should display login page title and form elements', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Swag Labs/i);
    await expect(page.locator('[data-test="username"]')).toBeVisible();
    await expect(page.locator('[data-test="password"]')).toBeVisible();
    await expect(page.locator('[data-test="login-button"]')).toBeVisible();
  });

  test('should login successfully with standard user', async ({ page }) => {
    const username = process.env.SAUCE_USERNAME!;
    const password = process.env.SAUCE_PASSWORD!;

    await page.goto('/');

    await page.fill('[data-test="username"]', username);
    await page.fill('[data-test="password"]', password);
    await page.click('[data-test="login-button"]');

    await expect(page).toHaveURL(/.*inventory.html/);
    await expect(page.locator('.title')).toHaveText('Products');
  });
});
