import { test, expect } from '../fixtures/test.fixture';

test.describe('SauceDemo Authentication & Inventory with POM & Fixtures', () => {
  test('should display login page title and form elements', async ({ loginPage }) => {
    await loginPage.open();

    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('should login successfully using loginPage fixture', async ({ loginPage, inventoryPage, page }) => {
    await loginPage.open();
    await loginPage.login();

    await expect(page).toHaveURL(/.*inventory.html/);
    await expect(inventoryPage.titleHeader).toHaveText('Products');
  });

  test('should show error when login with locked user', async ({ loginPage }) => {
    await loginPage.open();
    await loginPage.login('locked_out_user', 'secret_sauce');

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('Sorry, this user has been locked out.');
  });

  test('should verify products page using loggedInPage fixture', async ({ loggedInPage, page }) => {
    const { inventoryPage } = loggedInPage;

    await expect(page).toHaveURL(/.*inventory.html/);
    const count = await inventoryPage.getItemCount();
    expect(count).toBeGreaterThan(0);
  });
});
