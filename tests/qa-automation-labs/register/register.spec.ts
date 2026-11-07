import { expect, test } from '@playwright/test';
import { QaAutomationLabsRegisterPage } from '../../../pages/qa-automation-labs-register.page';
import { getDemoCredentials, getRegisterTestData } from '../test-data';

test.describe('Register', () => {
  let registerPage: QaAutomationLabsRegisterPage;
  const demoCredentials = getDemoCredentials();
  const registerTestData = getRegisterTestData();

  test.beforeEach(async ({ page }) => {
    registerPage = new QaAutomationLabsRegisterPage(page);
    await registerPage.open();
  });

  test('RG-11: Password và Password Confirm không khớp', async ({ page }) => {
    // Dùng email demo đã tồn tại để bảo đảm không thể tạo tài khoản mới nếu validation hỏng.
    await registerPage.fillRequiredFields({
      ...registerTestData.td04,
      email: demoCredentials.email,
      password: registerTestData.mismatchedPassword,
      passwordConfirm: registerTestData.mismatchedPasswordConfirm,
    });
    const registerUrl = page.url();
    const usersBefore = await page.evaluate(() => localStorage.getItem('users'));

    await registerPage.registerButton.click();

    await expect(page.getByText('Passwords do not match.', { exact: true })).toBeVisible();
    await expect(page).toHaveURL(registerUrl);
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('users')))
      .toBe(usersBefore);
  });


  test('RG-12: Chỉ báo độ mạnh mật khẩu', async () => {
    const strengthLevels = [
      { value: registerTestData.weakPassword, label: 'Weak' },
      { value: registerTestData.mediumPassword, label: 'Medium' },
      { value: registerTestData.strongPassword, label: 'Strong' },
    ];

    await registerPage.passwordInput.focus();

    for (const { value, label } of strengthLevels) {
      await test.step(`Hiển thị mức ${label} cho mật khẩu ${value}`, async () => {
        await registerPage.passwordInput.fill(value);

        await expect(registerPage.passwordStrengthIndicator)
            .toHaveText(`Password strength: ${label}`);
      });
    }

    // Kiểm tra trạng thái khi mật khẩu rỗng.
    await registerPage.passwordInput.fill('');

    await expect(registerPage.passwordStrengthIndicator).toHaveCount(0);

    await expect(registerPage.passwordStrengthBar)
        .toHaveAttribute('style', 'width: 0%;');
  });


  test('RG-13: Đăng ký bằng email đã tồn tại', async ({ page }) => {
    // Test này phụ thuộc vào tài khoản demo đã có sẵn trên site.
    await registerPage.fillRequiredFields({
      ...registerTestData.td04,
      email: demoCredentials.email,
    });
    const registerUrl = page.url();
    const usersBefore = await page.evaluate(() => localStorage.getItem('users'));

    await registerPage.registerButton.click();

    await expect(
      page.getByText('This email is already registered. Please login.', { exact: true }),
    ).toBeVisible();
    await expect(page).toHaveURL(registerUrl);
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('users')))
      .toBe(usersBefore);
  });

  test('RG-14: Bộ đếm ký tự của First Name', async () => {
    await expect(registerPage.firstNameInput).toHaveValue('');
    await expect(registerPage.firstNameCharacterCount).toHaveText('0 characters');

    await registerPage.firstNameInput.fill('A');
    await expect(registerPage.firstNameCharacterCount).toHaveText('1 character');

    await registerPage.firstNameInput.fill('Nguyen Van An');
    await expect(registerPage.firstNameCharacterCount).toHaveText('13 characters');

    await registerPage.firstNameInput.fill('Nguyen');
    await expect(registerPage.firstNameCharacterCount).toHaveText('6 characters');
  });
});
