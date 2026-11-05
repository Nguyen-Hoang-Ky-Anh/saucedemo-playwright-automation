# Hướng Dẫn Sử Dụng Page Object Model (POM) & Custom Fixtures

Tài liệu này hướng dẫn chi tiết cách sử dụng các **Page Objects** và **Fixtures** đã được xây dựng sẵn trong dự án để viết các kịch bản kiểm thử (Test Cases) ngắn gọn, dễ đọc, và không bị trùng lặp mã nguồn.

---

## 1. Giới Thiệu Tổng Quan

Trong dự án này:
- **`pages/`**: Nơi quản lý **Locator** (tọa độ phần tử) và các **Hành động nghiệp vụ** (Actions) của từng màn hình.
- **`fixtures/test.fixture.ts`**: Nơi tự động khởi tạo các Page Object và thiết lập sẵn trạng thái đăng nhập (Pre-conditions), giúp bạn không cần phải `new Page(...)` thủ công trong từng file test.

---

## 2. Danh Sách Các Page Objects Đang Có

Mọi Page Object đều kế thừa từ `BasePage` (có sẵn `navigateTo()`, `getCurrentUrl()`, `getPageTitle()`).

### 2.1. `LoginPage` (`pages/login.page.ts`)
Đại diện cho màn hình Đăng nhập của SauceDemo.

- **Locators có sẵn:**
  - `usernameInput`: Ô nhập tên đăng nhập (`[data-test="username"]`).
  - `passwordInput`: Ô nhập mật khẩu (`[data-test="password"]`).
  - `loginButton`: Nút bấm đăng nhập (`[data-test="login-button"]`).
  - `errorMessage`: Vùng hiển thị thông báo lỗi khi đăng nhập thất bại (`[data-test="error"]`).
- **Methods (Hành động):**
  - `open()`: Mở trang chủ đăng nhập (`page.goto('/')`).
  - `login(username?, password?)`: Điền thông tin và bấm nút đăng nhập (nếu không truyền tham số, hàm sẽ tự động lấy từ file `.env`).
  - `getErrorMessage()`: Lấy chuỗi thông báo lỗi.

---

### 2.2. `InventoryPage` (`pages/inventory.page.ts`)
Đại diện cho màn hình Danh sách sản phẩm (Products).

- **Locators có sẵn:**
  - `titleHeader`: Tiêu đề trang (`.title` - thường chứa chữ "Products").
  - `inventoryItems`: Danh sách các thẻ sản phẩm (`[data-test="inventory-item"]`).
  - `shoppingCartLink`: Icon giỏ hàng góc trên bên phải.
  - `shoppingCartBadge`: Huy hiệu số lượng hiển thị trên giỏ hàng.
- **Methods (Hành động):**
  - `open()`: Mở trực tiếp trang `/inventory.html`.
  - `addItemToCart(itemName)`: Thêm một sản phẩm vào giỏ hàng (truyền selector data-test, ví dụ: `'add-to-cart-sauce-labs-backpack'`).
  - `goToCart()`: Nhấp vào icon để chuyển sang trang Giỏ hàng.
  - `getItemCount()`: Trả về số lượng sản phẩm hiển thị trên trang.

---

### 2.3. `CartPage` (`pages/cart.page.ts`)
Đại diện cho màn hình Giỏ hàng (Your Cart).

- **Locators có sẵn:**
  - `titleHeader`: Tiêu đề giỏ hàng.
  - `cartItems`: Danh sách sản phẩm có trong giỏ hàng.
  - `checkoutButton`: Nút chuyển sang thanh toán (`[data-test="checkout"]`).
  - `continueShoppingButton`: Nút tiếp tục mua sắm.
- **Methods (Hành động):**
  - `open()`: Mở trang giỏ hàng `/cart.html`.
  - `proceedToCheckout()`: Bấm nút Checkout.
  - `removeItem(removeBtnSelector)`: Xóa một sản phẩm ra khỏi giỏ.
  - `getItemCount()`: Lấy số lượng mặt hàng trong giỏ.

---

### 2.4. `CheckoutPage` (`pages/checkout.page.ts`)
Đại diện cho các bước Thanh toán & Xác nhận đơn hàng.

- **Locators có sẵn:**
  - `firstNameInput`, `lastNameInput`, `postalCodeInput`: Các ô thông tin khách hàng.
  - `continueButton`: Nút tiếp tục sang Step 2.
  - `finishButton`: Nút xác nhận thanh toán ở Step 2.
  - `completeHeader`: Tiêu đề thông báo đặt hàng thành công (`Thank you for your order!`).
- **Methods (Hành động):**
  - `fillCustomerInformation(firstName, lastName, postalCode)`: Điền thông tin cá nhân và bấm Continue.
  - `finishOrder()`: Bấm nút Finish để hoàn tất đơn hàng.

---

## 3. Cách Sử Dụng Custom Fixtures

File [fixtures/test.fixture.ts](file:///d:/testing_prj/fixtures/test.fixture.ts) cung cấp 2 nhóm fixture chính:

### Quy tắc quan trọng:
> Thay vì import từ `@playwright/test`, trong các file test bạn luôn import từ:
> ```typescript
> import { test, expect } from '../fixtures/test.fixture';
> ```

---

### Cách 1: Sử dụng Fixture Page Đơn Lẻ (`loginPage`, `inventoryPage`, `cartPage`, `checkoutPage`)
Dùng khi bạn muốn tự kiểm soát luồng từ đầu (ví dụ: test màn hình login, test validation).

```typescript
import { test, expect } from '../fixtures/test.fixture';

test('Kiểm tra đăng nhập thất bại khi tài khoản bị khóa', async ({ loginPage }) => {
  // 1. Mở trang login
  await loginPage.open();

  // 2. Đăng nhập với tài khoản bị khóa
  await loginPage.login('locked_out_user', 'secret_sauce');

  // 3. Assertion kiểm tra lỗi
  await expect(loginPage.errorMessage).toBeVisible();
  await expect(loginPage.errorMessage).toContainText('Sorry, this user has been locked out.');
});
```

---

### Cách 2: Sử dụng Fixture Tự Động Đăng Nhập (`loggedInPage`)
**Khuyến nghị dùng cho 90% các test case về Giỏ hàng, Chi tiết sản phẩm, Checkout.**
Khi gọi `{ loggedInPage }`, Playwright sẽ:
1. Tự động mở trang.
2. Tự động đăng nhập bằng tài khoản chuẩn từ `.env`.
3. Đưa trình duyệt đến sẵn trang `/inventory.html`.
4. Trả về sẵn tất cả các instance: `loginPage`, `inventoryPage`, `cartPage`, `checkoutPage`.

#### Ví dụ kiểm thử trọn vẹn luồng E2E:
```typescript
import { test, expect } from '../fixtures/test.fixture';

test('Luồng mua hàng từ trang sản phẩm đến thanh toán thành công', async ({ loggedInPage, page }) => {
  // Trích xuất các page cần dùng từ fixture
  const { inventoryPage, cartPage, checkoutPage } = loggedInPage;

  // Lúc này bạn ĐÃ Ở SẴN trang /inventory.html rồi:
  await expect(page).toHaveURL(/.*inventory.html/);

  // 1. Thêm sản phẩm vào giỏ
  await inventoryPage.addItemToCart('add-to-cart-sauce-labs-backpack');
  await expect(inventoryPage.shoppingCartBadge).toHaveText('1');

  // 2. Chuyển sang Giỏ hàng
  await inventoryPage.goToCart();
  await expect(cartPage.titleHeader).toHaveText('Your Cart');

  // 3. Bấm Checkout
  await cartPage.proceedToCheckout();

  // 4. Điền thông tin giao hàng
  await checkoutPage.fillCustomerInformation('Vinh', 'Nguyen', '700000');

  // 5. Hoàn tất đơn hàng
  await checkoutPage.finishOrder();

  // 6. Kiểm tra thông báo thành công
  await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
});
```

---

## 4. Những Điểm Cần Lưu Ý Khi Viết Code (Best Practices)

1. **Không đặt `expect(...)` kiểm tra logic test trong file `Page`:**
   - File `Page` chỉ cung cấp Locator và Action.
   - Các câu lệnh kiểm tra kết quả mong đợi (`expect(...)`) phải luôn nằm trong file test (`*.spec.ts`).
2. **Không khởi tạo Class thủ công:**
   - Tránh viết: `const loginPage = new LoginPage(page);` trong test.
   - Hãy khai báo trực tiếp trong tham số của hàm test: `async ({ loginPage, inventoryPage }) => { ... }`.
3. **Ưu tiên sử dụng Web-first Assertions:**
   - Sử dụng `await expect(locator).toBeVisible()` hoặc `await expect(locator).toHaveText(...)` để tận dụng cơ chế tự động chờ (Auto-waiting & Retrying) của Playwright.
