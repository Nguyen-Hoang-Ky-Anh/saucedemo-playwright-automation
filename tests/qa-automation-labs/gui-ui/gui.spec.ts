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
  test('GUI-01: Form đăng nhập: ô Email, Password, Remember me, nút Login', async ({ page }) => {
    test.info().annotations.push({
      type: 'Ưu tiên',
      description: 'P3',
    });
    test.info().annotations.push({
      type: 'Kỹ thuật',
      description: 'GUI',
    });

    const loginPage = new QaAutomationLabsLoginPage(page);

    // Mở trang đăng nhập https://shop.qaautomationlabs.com/
    await loginPage.open();

    // Quan sát khung "Sign in": các ô nhập, checkbox và các nút, link hiển thị
    await test.step('Quan sát khung "Sign in": các ô nhập, checkbox và các nút, link hiển thị', async () => {
      // Hiển thị đủ: ô Email, ô Password, checkbox "Remember me", nút "Login", nút "Autofill demo credentials", link "Register Here"
      await expect(loginPage.signInHeading, 'Khung "Sign in" phải hiển thị').toBeVisible();
      await expect(loginPage.emailInput, 'Ô Email phải hiển thị').toBeVisible();
      await expect(loginPage.passwordInput, 'Ô Password phải hiển thị').toBeVisible();
      await expect(loginPage.rememberMeCheckbox, 'Checkbox "Remember me" phải hiển thị').toBeVisible();
      await expect(loginPage.loginButton, 'Nút "Login" phải hiển thị').toBeVisible();
      await expect(loginPage.autofillDemoCredentialsButton, 'Nút "Autofill demo credentials" phải hiển thị').toBeVisible();
      await expect(loginPage.registerHereLink, 'Link "Register Here" phải hiển thị').toBeVisible();
    });

    // Nhập "demo" vào ô Password và quan sát cách hiển thị ký tự
    await test.step('Nhập "demo" vào ô Password và quan sát cách hiển thị ký tự', async () => {
      await loginPage.passwordInput.fill('demo');
      await expect(loginPage.passwordInput).toHaveValue('demo');
      // Ô Password hiển thị ký tự dạng dấu chấm
      await expect(loginPage.passwordInput, 'Ô Password phải có thuộc tính type="password" để ẩn ký tự dạng dấu chấm').toHaveAttribute('type', 'password');
    });

    // Bấm vào ô "Remember me" rồi bấm lại một lần nữa
    await test.step('3) Bấm vào ô "Remember me" rồi bấm lại một lần nữa', async () => {
      // Ban đầu checkbox chưa được chọn
      await expect(loginPage.rememberMeCheckbox).not.toBeChecked();

      // Bấm lần 1: Checkbox được chọn
      await loginPage.rememberMeCheckbox.click();
      await expect(loginPage.rememberMeCheckbox, 'Checkbox "Remember me" phải được chọn').toBeChecked();

      // Bấm lại một lần nữa: Checkbox bỏ chọn bình thường
      await loginPage.rememberMeCheckbox.click();
      await expect(loginPage.rememberMeCheckbox, 'Checkbox "Remember me" phải được bỏ chọn').not.toBeChecked();
    });

    // Bấm nút "Autofill demo credentials" và quan sát hai ô nhập
    await test.step('Bấm nút "Autofill demo credentials" và quan sát hai ô nhập', async () => {
      await loginPage.autofillDemoCredentialsButton.click();

      // Bấm "Autofill demo credentials" điền sẵn Email demo@demo.com và Password demo
      await expect(loginPage.emailInput, 'Email phải được điền sẵn demo@demo.com').toHaveValue('demo@demo.com');
      await expect(loginPage.passwordInput, 'Password phải được điền sẵn demo').toHaveValue('demo');
    });
  });

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
