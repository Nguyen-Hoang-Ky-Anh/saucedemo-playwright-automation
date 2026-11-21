import { expect, test } from '@playwright/test';
import { QaAutomationLabsCartPage } from '../../../pages/qa-automation-labs-cart.page';
import { QaAutomationLabsLoginPage } from '../../../pages/qa-automation-labs-login.page';
import { QaAutomationLabsRegisterPage } from '../../../pages/qa-automation-labs-register.page';
import { getDemoCredentials } from '../test-data';

test.describe('Login', () => {
  let loginPage: QaAutomationLabsLoginPage;
  const demoCredentials = getDemoCredentials();

  test.beforeEach(async ({ page }) => {
    loginPage = new QaAutomationLabsLoginPage(page);
    await loginPage.open();
  });
  
  test('LG-01: Kiểm tra đăng nhập thành công bằng tài khoản demo (TD-01)', async ({ page }) => {
    const cartPage = new QaAutomationLabsCartPage(page);

    await test.step('1) Nhập Email hợp lệ theo TD-01 vào ô Email.', async () => {
      await loginPage.emailInput.fill(demoCredentials.email);
    });

    await test.step('2) Nhập Password hợp lệ theo TD-01 vào ô Password.', async () => {
      await loginPage.passwordInput.fill(demoCredentials.password);
    });

    await test.step('3) Bấm nút Login.', async () => {
      await loginPage.loginButton.click();
    });

    await expect(page, 'Đăng nhập thành công phải chuyển hướng tới trang Shop.').toHaveURL(/\/shop\.php(?:[?#]|$)/);
    await expect(loginPage.emailInput, 'Form đăng nhập phải ẩn sau khi đăng nhập thành công.').toBeHidden();
    await expect(cartPage.cartIcon, 'Icon giỏ hàng phải hiển thị trên thanh điều hướng.').toBeVisible();
  });
  
  test('LG-02: Kiểm tra đăng nhập với mật khẩu sai', async ({ page }) => {
    const loginUrl = page.url();

    await test.step('1) Nhập Email hợp lệ theo TD-01 vào ô Email.', async () => {
      await loginPage.emailInput.fill(demoCredentials.email);
    });

    await test.step('2) Nhập mật khẩu sai theo TD-03 vào ô Password.', async () => {
      await loginPage.passwordInput.fill('wrong_password');
    });

    await test.step('3) Bấm nút Login.', async () => {
      await loginPage.loginButton.click();
    });

    await expect(loginPage.errorMessage.first(), 'Phải hiển thị thông báo lỗi thông tin đăng nhập không đúng.').toBeVisible();
    await expect(loginPage.loginButton, 'Nút Login phải vẫn hiển thị trên trang đăng nhập.').toBeVisible();
    await expect(page, 'Phải vẫn ở lại trang đăng nhập.').toHaveURL(loginUrl);
  });

  test('LG-03: Đăng nhập với email chưa đăng ký', async ({ page }) => {
    await loginPage.emailInput.fill('unregistered_user_9999@example.com');
    await loginPage.passwordInput.fill(demoCredentials.password);
    const loginUrl = page.url();

    await loginPage.loginButton.click();

    await expect(loginPage.errorMessage.first()).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
    await expect(page).toHaveURL(loginUrl);
  });

  test('LG-04: Để trống Email', async ({ page }) => {
    await loginPage.emailInput.fill('');
    await loginPage.passwordInput.fill(demoCredentials.password);
    const loginUrl = page.url();

    await loginPage.loginButton.click();

    const hasAlert = await loginPage.errorMessage.first().isVisible();
    const validationMessage = await loginPage.emailInput.evaluate(
        (input: HTMLInputElement) => input.validationMessage,
    );
    expect(hasAlert || validationMessage !== '').toBe(true);
    await expect(loginPage.loginButton).toBeVisible();
    await expect(page).toHaveURL(loginUrl);
  });

  test('LG-05: Để trống Password', async ({ page }) => {
    await loginPage.emailInput.fill(demoCredentials.email);
    await loginPage.passwordInput.fill('');
    const loginUrl = page.url();

    await loginPage.loginButton.click();

    const hasAlert = await loginPage.errorMessage.first().isVisible();
    const validationMessage = await loginPage.passwordInput.evaluate(
        (input: HTMLInputElement) => input.validationMessage,
    );
    expect(hasAlert || validationMessage !== '').toBe(true);
    await expect(loginPage.loginButton).toBeVisible();
    await expect(page).toHaveURL(loginUrl);
  });

  test('LG-06: Để trống cả Email và Password', async ({ page }) => {
    await loginPage.emailInput.fill('');
    await loginPage.passwordInput.fill('');
    const loginUrl = page.url();

    await loginPage.loginButton.click();

    // Xác minh nếu site có thể hiển thị đồng thời lỗi của cả hai trường.
    await expect(loginPage.errorMessage.first()).toBeVisible();
    await expect(page).toHaveURL(loginUrl);

    await loginPage.emailInput.fill(demoCredentials.email);
    await loginPage.loginButton.click();

    // Site hiện chỉ hiển thị một lỗi bắt buộc mỗi lần gửi form.
    await expect(loginPage.errorMessage.first()).toBeVisible();
    await expect(page).toHaveURL(loginUrl);
  });

  test('LG-07: Email sai định dạng', async ({ page }) => {
    const loginUrl = page.url();

    for (const email of ['demo', 'demo@']) {
      await test.step(`Từ chối email "${email}"`, async () => {
        await loginPage.emailInput.fill(email);
        await loginPage.passwordInput.fill(demoCredentials.password);
        await loginPage.loginButton.click();

        // Xác minh nội dung cụ thể của cảnh báo email trên site thật.
        const validationMessage = await loginPage.emailInput.evaluate(
          (input: HTMLInputElement) => input.validationMessage,
        );
        const isTypeMismatch = await loginPage.emailInput.evaluate(
          (input: HTMLInputElement) => input.validity.typeMismatch,
        );
        expect(validationMessage).not.toBe('');
        expect(isTypeMismatch).toBe(true);
        await expect(loginPage.loginButton).toBeVisible();
        await expect(page).toHaveURL(loginUrl);
      });
    }
  });

  test('LG-08: Autofill demo credentials', async () => {
    await expect(loginPage.emailInput).toHaveValue('');
    await expect(loginPage.passwordInput).toHaveValue('');
    await expect(loginPage.autofillDemoCredentialsButton).toBeVisible();
    await expect(loginPage.autofillDemoCredentialsButton).toBeEnabled();

    await loginPage.autofillDemoCredentialsButton.click();

    await expect(loginPage.emailInput).toHaveValue(demoCredentials.email);
    await expect(loginPage.passwordInput).toHaveValue(demoCredentials.password);
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
  });

  test('Kiểm tra chức năng "remember me" ghi nhớ khi đăng nhập',async ({page, context, browser})=>{
    const cartPage=  new QaAutomationLabsCartPage(page);
    await test.step('1) Nhập email hợp lệ theo TD-01 vào ô email.', async () => {
      await loginPage.emailInput.fill(demoCredentials.email);
    });
    await test.step('2) Nhập password hợp lệ theo TD-01 vào ô password.',async () => {
      await loginPage.passwordInput.fill(demoCredentials.password);
    });
    await test.step('3) Tick chọn "Remember me".',async () => {
      await loginPage.rememberMeCheckbox.check();
      await expect(loginPage.rememberMeCheckbox,'Remember me phải được chọn.').toBeChecked();
    });

    await test.step('4) Bấm nút login rồi đóng trình duyệt để kiểm tra.',async () => {
      await loginPage.loginButton.click();
      await expect(page, 'Đăng nhập thành công phải chuyển hướng tới trang Shop.').toHaveURL(/\/shop\.php(?:[?#]|$)/);
      await expect(cartPage.cartIcon,'Icon giỏ hàng phải hiển thị trên thanh điều hướng.').toBeVisible();
      //lưu lại cookie và đóng trình duyệt
      const storageState = await context.storageState();
      const persisState = {...storageState, cookies: storageState.cookies.filter((cookie) => cookie.expires !==-1)};
      const newContext = await browser.newContext({storageState:persisState})
      try{
        const newPage = await newContext.newPage();
        const newLoginPage = new QaAutomationLabsLoginPage(newPage);
        await newLoginPage.open();

        await expect(newLoginPage.emailInput,'Email phải được tự động điền sẵn.').toHaveValue(demoCredentials.email);
        await newLoginPage.passwordInput.fill(demoCredentials.password);
        await newLoginPage.loginButton.click();
        await expect(newPage,'Chỉ cần bấm Login là phải đăng nhập thành công.').toHaveURL(/\/shop\.php(?:[?#]|$)/);

      }finally {
       await newContext.close();
      }
    });
  });

  test('LG-10: Kiểm tra chuyển đổi trạng thái khi chưa đăng nhập nhưng mở trang giỏ hàng',async ({page})=>{
    const cartPage=  new QaAutomationLabsCartPage(page);
    await test.step('1) Nhập đường dẫn /cart.php lên thanh địa chỉ và nhấn Enter.', async ()=>{
      await page.goto('/cart.php',{waitUntil:'domcontentloaded'});
    });
    await test.step('2) Kiểm tra hệ thống chặn truy cập và chuyển hướng về trang đăng nhập.', async ()=>{
      await expect(page, 'Hệ thống phải chặn truy cập /cart.php và điều hướng về trang đăng nhập.').not.toHaveURL(/\/cart\.php(?:[?#]|$)/,);
    });
    await expect(loginPage.signInHeading).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
    await expect(cartPage.cartTotal,'Không được hiển thị nội dung giỏ hàng khi chưa đăng nhập.').toBeHidden();

  });

  test('LG-12: Link "Register Here"', async ({ page }) => {
    const registerPage = new QaAutomationLabsRegisterPage(page);
    await expect(loginPage.signInHeading).toBeVisible();
    await expect(loginPage.newUserText).toBeVisible();

    await expect(loginPage.registerHereLink).toBeVisible();
    await loginPage.registerHereLink.click();

    await expect(page).toHaveURL(/.*\/register\.php/);

    await expect(registerPage.createAccountHeading).toBeVisible();
    await expect(registerPage.personalDetailsSection).toBeVisible();
  });
});