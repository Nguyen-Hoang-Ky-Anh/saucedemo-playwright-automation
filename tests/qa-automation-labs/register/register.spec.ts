import { expect, test } from '@playwright/test';
import {
  QaAutomationLabsRegisterPage,
  type RegisterData,
} from '../../../pages/qa-automation-labs-register.page';

const TD04: RegisterData = {
  firstName: 'Nguyen Van An',
  lastName: 'Nguyen',
  email: 'demo@demo.com',
  telephone: '9876543210',
  gender: 'Female',
  dateOfBirth: '1990-01-15',
  country: 'India',
  password: 'Abc@12345!xyz',
  passwordConfirm: 'Abc@12345!xyz',
};

test.describe('Register', () => {
  let registerPage: QaAutomationLabsRegisterPage;

  test.beforeEach(async ({ page }) => {
    registerPage = new QaAutomationLabsRegisterPage(page);
    await registerPage.open();
  });

  test('RG-11: Password và Password Confirm không khớp', async ({ page }) => {
    // Dùng email demo đã tồn tại để bảo đảm không thể tạo tài khoản mới nếu validation hỏng.
    await registerPage.fillRequiredFields({
      ...TD04,
      email: 'demo@demo.com',
      password: 'Abc@1234',
      passwordConfirm: 'Abc@5678',
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
      { value: 'abc', label: 'Weak' },
      { value: 'Abcdefgh', label: 'Medium' },
      { value: 'Abc12345', label: 'Strong' },
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
    // Test này phụ thuộc vào tài khoản demo@demo.com đã có sẵn trên site.
    await registerPage.fillRequiredFields({
      ...TD04,
      email: 'demo@demo.com',
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
