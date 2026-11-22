import { expect, test } from '@playwright/test';
import { QaAutomationLabsLoginPage } from '../../../pages/qa-automation-labs-login.page';
import { QaAutomationLabsRegisterPage } from '../../../pages/qa-automation-labs-register.page';
import { getDemoCredentials, getRegisterTestData } from '../test-data';

test.describe('Register', () => {
  test.describe.configure({ mode: 'serial' });
  let registerPage: QaAutomationLabsRegisterPage;
  const demoCredentials = getDemoCredentials();
  const registerTestData = getRegisterTestData();

  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    registerPage = new QaAutomationLabsRegisterPage(page);
    await registerPage.open();
  });

  test('RG-01: Đăng ký thành công với đủ trường bắt buộc', async ({ page }) => {
    const loginPage = new QaAutomationLabsLoginPage(page);
    const uniqueEmail = `rg01_${Date.now()}@example.com`;
    const newUser = {
      ...registerTestData.td04,
      email: uniqueEmail,
    };

    // form "Create your account" hiển thị đầy đủ
    await expect(registerPage.createAccountHeading).toBeVisible();
    await expect(registerPage.personalDetailsSection).toBeVisible();

    // Nhập đầy đủ các trường bắt buộc hợp lệ theo TD-04, để trống trường không bắt buộc
    await registerPage.fillRequiredFields(newUser);

    // Bấm nút "Register"
    await registerPage.registerButton.click();

    // Tạo tài khoản thành công, hiển thị thông báo và điều hướng sang trang đăng nhập
    const successAlert = page.locator('.alert-success, [role="alert"]').first();
    const hasSuccessAlert = await successAlert.isVisible().catch(() => false);
    if (hasSuccessAlert) {
      await expect(successAlert).toBeVisible();
    }
    await expect(page).toHaveURL(/.*(\/|\/index\.php|\/login\.php)$/);
    await expect(loginPage.signInHeading).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();

    // Đăng nhập lại ở trang đăng nhập bằng đúng E-Mail và Password vừa đăng ký
    await loginPage.emailInput.fill(newUser.email);
    await loginPage.passwordInput.fill(newUser.password);
    await loginPage.loginButton.click();

    // Đăng nhập lại bằng tài khoản vừa tạo thành công, vào được trang mua sắm
    await expect(loginPage.emailInput).toBeHidden();
    await expect(loginPage.loginButton).toBeHidden();
    await expect(page.locator('a[href*="cart"]').first()).toBeVisible();
  });

  test('RG-02: Để trống First Name', async ({ page }) => {
    // form "Create your account" hiển thị đầy đủ
    await expect(registerPage.createAccountHeading).toBeVisible();

    // Để trống ô First Name, nhập các trường còn lại hợp lệ theo TD-04
    await registerPage.fillRequiredFields({
      ...registerTestData.td04,
      email: `rg02_${Date.now()}@example.com`,
      firstName: '',
    });
    const registerUrl = page.url();
    const usersBefore = await page.evaluate(() => localStorage.getItem('users'));

    // Bấm nút "Register"
    await registerPage.registerButton.click();

    // Hệ thống chặn đăng ký, không tạo tài khoản, giữ nguyên ở trang /register.php
    await expect(page).toHaveURL(registerUrl);
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('users')))
      .toBe(usersBefore);

    // Hiển thị thông báo lỗi bắt buộc nhập First Name
    const isInvalid = await registerPage.firstNameInput.evaluate(
      (input: HTMLInputElement) => !input.checkValidity() || input.validationMessage !== '',
    );
    const hasAlert = await registerPage.errorMessages.first().isVisible().catch(() => false);
    const hasErrorText = await page
      .locator('.invalid-feedback, .text-danger, .error-message')
      .first()
      .isVisible()
      .catch(() => false);

    expect(isInvalid || hasAlert || hasErrorText).toBe(true);
  });

  test('RG-03: Để trống Last Name', async ({ page }) => {
    // form "Create your account" hiển thị đầy đủ
    await expect(registerPage.createAccountHeading).toBeVisible();

    // Nhập các trường hợp lệ theo TD-04, để trống ô Last Name
    await registerPage.fillRequiredFields({
      ...registerTestData.td04,
      email: `rg03_${Date.now()}@example.com`,
      lastName: '',
    });
    const registerUrl = page.url();
    const usersBefore = await page.evaluate(() => localStorage.getItem('users'));

    // Bấm nút "Register"
    await registerPage.registerButton.click();

    // Hệ thống chặn đăng ký, không tạo tài khoản, giữ nguyên ở trang /register.php
    await expect(page).toHaveURL(registerUrl);
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('users')))
      .toBe(usersBefore);

    // Hiển thị thông báo lỗi bắt buộc nhập Last Name
    const isInvalid = await registerPage.lastNameInput.evaluate(
      (input: HTMLInputElement) => !input.checkValidity() || input.validationMessage !== '',
    );
    const hasAlert = await registerPage.errorMessages.first().isVisible().catch(() => false);
    const hasErrorText = await page
      .locator('.invalid-feedback, .text-danger, .error-message')
      .first()
      .isVisible()
      .catch(() => false);
    expect(isInvalid || hasAlert || hasErrorText).toBe(true);
  });

  // Ưu tiên P2, EP, bảng quyết định.
  test('RG-04: Kiểm tra đăng ký khi để trống trường E-Mail', async ({ page }) => {
    const registerUrl = page.url();
    const usersBefore = await page.evaluate(() => localStorage.getItem('users'));

    await test.step('1-2) Nhập đầy đủ các trường bắt buộc hợp lệ theo TD-04 và để trống trường E-Mail.', async () => {
      await registerPage.fillRequiredFields({
        ...registerTestData.td04,
        email: '',
      });
    });

    await test.step('3) Bấm nút Register.', async () => {
      await registerPage.registerButton.click();
    });

    const isInvalid = await registerPage.emailInput.evaluate(
      (input: HTMLInputElement) => !input.checkValidity() || input.validationMessage !== '',
    );
    const hasAlert = await registerPage.errorMessages.first().isVisible().catch(() => false);
    const hasErrorText = await page
      .locator('.invalid-feedback, .text-danger, .error-message')
      .first()
      .isVisible()
      .catch(() => false);

    expect(isInvalid || hasAlert || hasErrorText).toBe(true);
    await expect(page).toHaveURL(registerUrl);
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('users')))
      .toBe(usersBefore);
  });

  // Ưu tiên P2, EP, bảng quyết định.
  test('RG-05: Kiểm tra đăng ký khi để trống trường Telephone', async ({ page }) => {
    const registerUrl = page.url();
    const usersBefore = await page.evaluate(() => localStorage.getItem('users'));

    await test.step('1-2) Nhập đầy đủ các trường bắt buộc hợp lệ theo TD-04 và để trống trường Telephone.', async () => {
      await registerPage.fillRequiredFields({
        ...registerTestData.td04,
        email: `rg05_${Date.now()}@example.com`,
        telephone: '',
      });
    });

    await test.step('3) Bấm nút Register.', async () => {
      await registerPage.registerButton.click();
    });

    const isInvalid = await registerPage.telephoneInput.evaluate(
      (input: HTMLInputElement) => !input.checkValidity() || input.validationMessage !== '',
    );
    const hasAlert = await registerPage.errorMessages.first().isVisible().catch(() => false);
    const hasErrorText = await page
      .locator('.invalid-feedback, .text-danger, .error-message')
      .first()
      .isVisible()
      .catch(() => false);

    expect(isInvalid || hasAlert || hasErrorText).toBe(true);
    await expect(page).toHaveURL(registerUrl);
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('users')))
      .toBe(usersBefore);
  });

  // Ưu tiên P2, EP, bảng quyết định.
  test('RG-06: Kiểm tra đăng ký khi không chọn trường Gender', async ({ page }) => {
    const registerUrl = page.url();
    const usersBefore = await page.evaluate(() => localStorage.getItem('users'));
    const { gender: _ignoredGender, ...td04WithoutGender } = registerTestData.td04;

    await test.step('1-2) Nhập đầy đủ các trường bắt buộc hợp lệ theo TD-04 và giữ nguyên trạng thái chưa chọn Gender.', async () => {
      await registerPage.fillRequiredFields({
        ...td04WithoutGender,
        email: `rg06_${Date.now()}@example.com`,
      });
      await expect(registerPage.maleRadio).not.toBeChecked();
      await expect(registerPage.femaleRadio).not.toBeChecked();
      await expect(registerPage.otherRadio).not.toBeChecked();
    });

    await test.step('3) Bấm nút Register.', async () => {
      await registerPage.registerButton.click();
    });

    const isInvalid = await registerPage.maleRadio.evaluate(
      (input: HTMLInputElement) => !input.checkValidity() || input.validationMessage !== '',
    );
    const hasAlert = await registerPage.errorMessages.first().isVisible().catch(() => false);
    const hasErrorText = await page
      .locator('.invalid-feedback, .text-danger, .error-message')
      .first()
      .isVisible()
      .catch(() => false);

    expect(isInvalid || hasAlert || hasErrorText).toBe(true);
    await expect(page).toHaveURL(registerUrl);
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('users')))
      .toBe(usersBefore);
  });

  test('RG-07: Để trống Date of Birth', async ({ page }) => {
    await registerPage.fillRequiredFields({
      ...registerTestData.td04,
      email: `rg07_${Date.now()}@example.com`,
      dateOfBirth: '',
    });
    const registerUrl = page.url();
    const usersBefore = await page.evaluate(() => localStorage.getItem('users'));

    await registerPage.registerButton.click();

    const isInvalid = await registerPage.dateOfBirthInput.evaluate(
        (input: HTMLInputElement) => !input.checkValidity() || input.validationMessage !== '',
    );
    const hasAlert = await registerPage.errorMessages.first().isVisible().catch(() => false);
    const hasErrorText = await page
        .locator('.invalid-feedback, .text-danger, .error-message')
        .first()
        .isVisible()
        .catch(() => false);

    expect(isInvalid || hasAlert || hasErrorText).toBe(true);
    await expect(page).toHaveURL(registerUrl);
    await expect
        .poll(() => page.evaluate(() => localStorage.getItem('users')))
        .toBe(usersBefore);
  });

  test('RG-08: Không chọn Country', async ({ page }) => {
    await registerPage.fillRequiredFields({
      ...registerTestData.td04,
      email: `rg08_${Date.now()}@example.com`,
    });
    await registerPage.countrySelect.selectOption({ index: 0 });
    const registerUrl = page.url();
    const usersBefore = await page.evaluate(() => localStorage.getItem('users'));

    await registerPage.registerButton.click();

    const isInvalid = await registerPage.countrySelect.evaluate(
        (select: HTMLSelectElement) => !select.checkValidity() || select.validationMessage !== '',
    );
    const hasAlert = await registerPage.errorMessages.first().isVisible().catch(() => false);
    const hasErrorText = await page
        .locator('.invalid-feedback, .text-danger, .error-message')
        .first()
        .isVisible()
        .catch(() => false);

    expect(isInvalid || hasAlert || hasErrorText).toBe(true);
    await expect(page).toHaveURL(registerUrl);
    await expect
        .poll(() => page.evaluate(() => localStorage.getItem('users')))
        .toBe(usersBefore);
  });

  test('RG-09: Email sai định dạng', async ({ page }) => {
    const registerUrl = page.url();
    const usersBefore = await page.evaluate(() => localStorage.getItem('users'));

    for (const invalidEmail of ['abc', 'abc@', '@abc.com']) {
      await test.step(`Từ chối email "${invalidEmail}"`, async () => {
        await registerPage.fillRequiredFields({
          ...registerTestData.td04,
          email: invalidEmail,
        });

        await registerPage.registerButton.click();

        const isInvalid = await registerPage.emailInput.evaluate(
            (input: HTMLInputElement) => !input.checkValidity() || input.validationMessage !== '',
        );
        const hasAlert = await registerPage.errorMessages.first().isVisible().catch(() => false);
        const hasErrorText = await page
            .locator('.invalid-feedback, .text-danger, .error-message')
            .first()
            .isVisible()
            .catch(() => false);

        expect(isInvalid || hasAlert || hasErrorText).toBe(true);
        await expect(page).toHaveURL(registerUrl);
        await expect
            .poll(() => page.evaluate(() => localStorage.getItem('users')))
            .toBe(usersBefore);
      });
    }
  });

  test('RG-10: Telephone sai định dạng (chữ, ký tự đặc biệt, quá ngắn)', async ({ page }) => {
    const registerUrl = page.url();
    const usersBefore = await page.evaluate(() => localStorage.getItem('users'));

    await test.step('Từ chối chữ/ký tự đặc biệt ("abc")', async () => {
      await registerPage.fillRequiredFields({
        ...registerTestData.td04,
        email: `rg10_alpha_${Date.now()}@example.com`,
      });
      await registerPage.telephoneInput.fill('');
      await registerPage.telephoneInput.pressSequentially('abc');

      await registerPage.registerButton.click();

      const isInvalid = await registerPage.telephoneInput.evaluate(
          (input: HTMLInputElement) => !input.checkValidity() || input.validationMessage !== '',
      );
      const hasAlert = await registerPage.errorMessages.first().isVisible().catch(() => false);
      const hasErrorText = await page
          .locator('.invalid-feedback, .text-danger, .error-message')
          .first()
          .isVisible()
          .catch(() => false);

      expect(isInvalid || hasAlert || hasErrorText).toBe(true);
      await expect(page).toHaveURL(registerUrl);
      await expect
          .poll(() => page.evaluate(() => localStorage.getItem('users')))
          .toBe(usersBefore);
    });

    await test.step('Từ chối số điện thoại quá ngắn ("123")', async () => {
      await registerPage.fillRequiredFields({
        ...registerTestData.td04,
        email: `rg10_short_${Date.now()}@example.com`,
        telephone: '123',
      });

      await registerPage.registerButton.click();

      const isInvalid = await registerPage.telephoneInput.evaluate(
          (input: HTMLInputElement) => !input.checkValidity() || input.validationMessage !== '',
      );
      const hasAlert = await registerPage.errorMessages.first().isVisible().catch(() => false);
      const hasErrorText = await page
          .locator('.invalid-feedback, .text-danger, .error-message')
          .first()
          .isVisible()
          .catch(() => false);

      expect(isInvalid || hasAlert || hasErrorText).toBe(true);
      await expect(page).toHaveURL(registerUrl);
      await expect
          .poll(() => page.evaluate(() => localStorage.getItem('users')))
          .toBe(usersBefore);
    });
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

  test('RG-15: Kiểm tra chức năng chọn và bỏ chọn các Interests (Fashion, Electronics, Sports, Books)',async ({page}) => {
    const loginPage = new QaAutomationLabsLoginPage(page);
    const newUser = {...registerTestData.td04,
      email: `rg15_short_${Date.now()}@example.com`};
    await registerPage.fillRequiredFields(newUser);
    await test.step('Tại mục Interest lần lượt tích chọn nhiều mục (Fashion, Electronics, Sports, Books).',async () => {
      await registerPage.fashionCheckbox.check();
      await registerPage.electronicsCheckbox.check();
      await registerPage.sportsCheckbox.check();
      await registerPage.booksCheckbox.check();

      await expect(registerPage.fashionCheckbox).toBeChecked();
      await expect(registerPage.electronicsCheckbox).toBeChecked();
      await expect(registerPage.sportsCheckbox).toBeChecked();
      await expect(registerPage.booksCheckbox).toBeChecked();
    });
    await test.step('Bỏ chọn một hoặc nhiều mục đã chọn.',async () => {
      await registerPage.fashionCheckbox.uncheck();
      await registerPage.electronicsCheckbox.uncheck();
      await expect(registerPage.fashionCheckbox).not.toBeChecked();
      await expect(registerPage.electronicsCheckbox).not.toBeChecked();
    });
    await test.step('Giữ lại các mục muốn chọn và bấm Register.',async () => {
      await expect(registerPage.sportsCheckbox).toBeChecked();
      await expect(registerPage.booksCheckbox).toBeChecked();
      await registerPage.registerButton.click();
      await expect(page,'Hệ thống phải chấp nhận và chuyển hướng về trang đăng nhập.').toHaveURL(/.*(\/|\/index\.php|\/login\.php)$/);

    });
    await expect(loginPage.signInHeading).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();

  });
  test('RG-16: Kiểm tra chức năng tải ảnh đại diện lên (Upload Profile Photo - trường tùy chọn)',async ({page}) => {
    const loginPage = new QaAutomationLabsLoginPage(page);
    const registerUrl = page.url();
    const usersBefore = await page.evaluate(()=>localStorage.getItem('users'));
    await registerPage.fillRequiredFields({
      ...registerTestData.td04,email: `rg16_${Date.now()}@example.com`,
    });

    await test.step('Tại mục Profile photo tải lên mục không phải ảnh và bấm Register.',async () => {

      await registerPage.profilePhotoInput.setInputFiles({
        name: 'not-an-image.txt',
        mimeType:'text/plain',
        buffer: Buffer.from('Noi dung file van ban khong phai hinh anh'),
      });
      await registerPage.registerButton.click();

      const isInvalid = await registerPage.profilePhotoInput.evaluate(
          (input: HTMLInputElement) => !input.checkValidity() || input.validationMessage !== '',
      );
      const hasAlert = await registerPage.errorMessages.first().isVisible().catch(() => false);
      const hasErrorText = await page
          .locator('.invalid-feedback, .text-danger, .error-message')
          .first()
          .isVisible()
          .catch(() => false);

      expect(isInvalid || hasAlert || hasErrorText).toBe(true);
      await expect(page).toHaveURL(registerUrl);
      await expect
          .poll(() => page.evaluate(() => localStorage.getItem('users')))
          .toBe(usersBefore);
    });

    await test.step('Thay thế bằng một file ảnh hợp lệ và bấm Register.',async () => {

      await registerPage.profilePhotoInput.setInputFiles({
        name: 'profile-photo.png',
        mimeType:'image/png',
        buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64'),
      });
      const uploadFile = await registerPage.profilePhotoInput.evaluate((input:HTMLInputElement)=>input.files?.[0]?.name??'');
      expect(uploadFile).toBe('profile-photo.png');

      await registerPage.registerButton.click();
      await expect(page).toHaveURL(/.*(\/|\/index\.php|\/login\.php)$/);
      await expect(loginPage.signInHeading).toBeVisible();
      await expect(loginPage.loginButton).toBeVisible();

    });

  });
  test('RG-17: Kiểm tra diều hướng khi bấm vào link sign in tại trang đăng ký',async ({page}) => {
    const loginPage = new QaAutomationLabsLoginPage(page);

    await test.step('1) Tìm liên kết Sign in trong biểu mẫu đăng ký trên trang (/register.php).',async () => {
      await expect(registerPage.signInLink).toBeVisible();
    });

    await test.step('2) Bấm vào link Sign in và kiểm tra chuyển về trang đăng nhập.',async () => {
       await registerPage.signInLink.click();
       await expect(page).toHaveURL(/.*(\/|\/index\.php|\/login\.php)$/);

       await expect(loginPage.signInHeading).toBeVisible();
       await expect(loginPage.emailInput).toBeVisible();
       await expect(loginPage.passwordInput).toBeVisible();
       await expect(loginPage.loginButton).toBeVisible();
    });
  });

});
