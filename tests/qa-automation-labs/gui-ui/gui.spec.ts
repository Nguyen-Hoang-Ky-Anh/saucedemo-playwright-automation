import { expect, Locator, Page, test } from '@playwright/test';
import { QaAutomationLabsLoginPage } from '../../../pages/qa-automation-labs-login.page';
import { QaAutomationLabsRegisterPage } from '../../../pages/qa-automation-labs-register.page';

async function tabUntilFocused(page: Page, target: Locator, maxTabs = 6): Promise<void> {
  for (let step = 0; step < maxTabs; step += 1) {
    await page.keyboard.press('Tab');
    const isFocused = await target.evaluate((el) => document.activeElement === el);
    if (isFocused) {
      return;
    }
  }
  await expect(target).toBeFocused();
}

test.describe('GUI', () => {
  // Ưu tiên P3, GUI.
  test('GUI-02: Dùng phím Tab di chuyển trên form đăng nhập và đăng ký', async ({ page }) => {
    await test.step('1) Kiểm tra thứ tự Tab trên form đăng nhập (/).', async () => {
      const loginPage = new QaAutomationLabsLoginPage(page);
      await loginPage.open();

      await loginPage.emailInput.click();
      await expect(loginPage.emailInput).toBeFocused();

      const loginFocusSequence: Array<{ name: string; locator: Locator }> = [
        { name: 'Password', locator: loginPage.passwordInput },
        { name: 'Toggle Password', locator: page.locator('#togglePassword') },
        { name: 'Remember Me', locator: page.locator('#rememberMe') },
        { name: 'Login Button', locator: loginPage.loginButton },
        { name: 'Autofill Demo Credentials', locator: loginPage.autofillDemoCredentialsButton },
      ];

      for (const step of loginFocusSequence) {
        await page.keyboard.press('Tab');
        await expect(step.locator, `Phím Tab phải di chuyển focus tới "${step.name}".`).toBeFocused();
      }
    });

    await test.step('2) Kiểm tra thứ tự Tab trên form đăng ký (/register.php).', async () => {
      const registerPage = new QaAutomationLabsRegisterPage(page);
      await registerPage.open();

      await registerPage.firstNameInput.click();
      await expect(registerPage.firstNameInput).toBeFocused();

      const registerFocusSequence: Array<{ name: string; locator: Locator }> = [
        { name: 'Last Name', locator: registerPage.lastNameInput },
        { name: 'E-Mail', locator: registerPage.emailInput },
        { name: 'Telephone', locator: registerPage.telephoneInput },
        { name: 'Gender (Male)', locator: registerPage.maleRadio },
        { name: 'Date of Birth', locator: registerPage.dateOfBirthInput },
        { name: 'Country', locator: registerPage.countrySelect },
        { name: 'Interest Fashion', locator: page.locator('#interestFashion') },
        { name: 'Interest Electronics', locator: page.locator('#interestElectronics') },
        { name: 'Interest Sports', locator: page.locator('#interestSports') },
        { name: 'Interest Books', locator: page.locator('#interestBooks') },
        { name: 'Photo', locator: page.locator('#regphoto') },
        { name: 'Password', locator: registerPage.passwordInput },
        { name: 'Password Confirm', locator: registerPage.passwordConfirmInput },
        { name: 'Register Button', locator: registerPage.registerButton },
      ];

      for (const step of registerFocusSequence) {
        await tabUntilFocused(page, step.locator);
        await expect(step.locator, `Phím Tab phải di chuyển focus tới "${step.name}".`).toBeFocused();
      }
    });
  });
});
