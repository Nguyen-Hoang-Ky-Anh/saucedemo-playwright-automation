# Quy Chuẩn Dự Án Kiểm Thử Tự Động Hóa (Playwright)

Tài liệu này định nghĩa các quy ước và chuẩn mực bắt buộc áp dụng cho dự án: **Quy tắc đặt tên (Naming)**, **Chiến lược chọn Locator**, và **Cấu trúc thư mục (Folder Structure)**. Mọi thành viên tham gia phát triển kịch bản test cần tuân thủ nghiêm ngặt để đảm bảo mã nguồn đồng nhất, dễ đọc và dễ bảo trì.

---

## 1. Cấu Trúc Thư Mục (Folder Structure)

Dự án áp dụng mô hình chuẩn **Page Object Model (POM)** kết hợp phân tách dữ liệu kiểm thử và tiện ích mở rộng:

```plaintext
testing_prj/
├── pages/                       # Lớp Page Object Model (POM)
│   ├── base.page.ts             # Base Page chứa hàm/locator dùng chung (navigation, wait, dialog)
│   ├── login.page.ts            # Định nghĩa locator và action của trang Login
│   ├── inventory.page.ts        # Định nghĩa locator và action của trang Inventory/Products
│   └── cart.page.ts             # Trang giỏ hàng
├── tests/                       # Các kịch bản kiểm thử (Test Specs)
│   ├── e2e/                     # Các luồng kiểm thử đầu cuối (End-to-End user journeys)
│   │   └── checkout-flow.spec.ts
│   ├── auth/                    # Kiểm thử phân hệ xác thực
│   │   └── login.spec.ts
│   └── inventory/               # Kiểm thử danh sách sản phẩm & giỏ hàng
│       └── add-to-cart.spec.ts
├── data/                        # Dữ liệu phục vụ kiểm thử (Test Data)
│   ├── constants.ts             # Các hằng số (Messages, Error texts, Titles)
│   └── test-users.json          # Dữ liệu các loại account (standard, locked, problem, performance)
├── utils/                       # Hàm tiện ích dùng chung (Helpers)
│   ├── env.ts                   # Trích xuất và validate biến môi trường
│   └── common-helpers.ts        # Format chuỗi, tiền tệ, xử lý ngày tháng
├── playwright-report/           # Báo cáo HTML (được bỏ qua bởi .gitignore)
├── test-results/                # Artifacts khi test fail: trace, screenshot, video (.gitignore)
├── .env                         # Thông tin bảo mật/credentials nội bộ (.gitignore)
├── .env.example                 # File mẫu cấu hình biến môi trường
├── playwright.config.ts         # Cấu hình trung tâm Playwright
├── package.json                 # Quản lý dependencies & scripts
└── rule.md                      # Tài liệu quy chuẩn này
```

### Nguyên tắc phân bổ code:
- **`pages/`**: CHỈ chứa định vị phần tử (Locators) và các hàm thực thi hành động (Actions, ví dụ: `login()`, `addProductToCart()`). **TUYỆT ĐỐI KHÔNG** đặt assertion `expect(...)` kiểm tra logic test case bên trong `pages/` (trừ kiểm tra trạng thái hiển thị của trang).
- **`tests/`**: CHỈ chứa kịch bản kiểm thử, gọi các hàm từ `pages/` và thực hiện các bước kiểm tra mong đợi (`expect(...)`).

---

## 2. Quy Tắc Đặt Tên (Naming Convention)

### 2.1. File và Thư Mục
| Thành phần | Quy ước | Ví dụ |
| :--- | :--- | :--- |
| **Thư mục** | `kebab-case` | `tests/`, `pages/`, `test-data/` |
| **Test spec file** | `<tính-năng>.spec.ts` | `login.spec.ts`, `cart-checkout.spec.ts` |
| **Page object file** | `<tên-trang>.page.ts` | `login.page.ts`, `inventory.page.ts` |
| **File dữ liệu / util** | `kebab-case.ts` / `.json` | `constants.ts`, `test-users.json` |

### 2.2. Biến, Lớp, Hàm và Test Case
| Thành phần | Quy ước | Ví dụ tốt | Tránh dùng |
| :--- | :--- | :--- | :--- |
| **Tên Class (Page Object)** | `PascalCase` | `LoginPage`, `InventoryPage` | `loginpage`, `login_page` |
| **Hàm / Method** | `camelCase` (Động từ + Danh từ) | `fillUsername()`, `clickLoginButton()` | `username()`, `btn()` |
| **Biến lưu Locator** | `camelCase` (Danh từ + Loại element) | `usernameInput`, `loginButton`, `errorMessage` | `txtUser`, `btnLogin`, `e1` |
| **Biến hằng số (Constants)** | `UPPER_SNAKE_CASE` | `DEFAULT_TIMEOUT`, `INVALID_CREDENTIALS_MSG` | `defaultTimeout` |
| **Test Suite (`test.describe`)**| Mô tả rõ tính năng/màn hình | `test.describe('Authentication - Login Feature', ...)` | `test.describe('Login', ...)` |
| **Test Case (`test(...)`)** | Bắt đầu bằng động từ thể hiện hành vi mong đợi (`should...`) | `should display error when password is empty` | `test 1`, `check login fail` |

---

## 3. Chiến Lược Chọn Locator (Locator Strategy)

Playwright khuyến nghị chọn locator theo hành vi người dùng thật (User-centric) và các thuộc tính dành riêng cho kiểm thử tự động.

### Thứ Tự Ưu Tiên (Priority Order):

```
1. getByTestId / [data-test="..."]  (Tối ưu nhất cho SauceDemo)
2. getByRole(...)                   (Chuẩn trợ năng - Accessibility)
3. getByPlaceholder(...)            (Cho các ô nhập liệu)
4. getByText(...)                   (Cho nhãn, thông báo tĩnh)
5. CSS Selector ngữ nghĩa           (Hạn chế)
6. XPath                            (CẤM DÙNG, trừ trường hợp bất khả kháng)
```

### 3.1. Chi tiết và Ví dụ:

#### Ưu tiên 1: `data-test` / Test Attributes (Khuyến nghị hàng đầu trong SauceDemo)
Website SauceDemo cung cấp sẵn các thuộc tính `data-test` chuẩn quốc tế, bền vững nhất khi UI thay đổi layout hoặc style:
- ✅ `page.locator('[data-test="username"]')`
- ✅ `page.locator('[data-test="login-button"]')`
- ✅ `page.locator('[data-test="inventory-item"]')`

#### Ưu tiên 2: `getByRole` (Chuẩn Accessibility của Playwright)
Mô phỏng cách người dùng và trình đọc màn hình tìm kiếm thành phần:
- ✅ `page.getByRole('button', { name: 'Login' })`
- ✅ `page.getByRole('heading', { name: 'Products' })`

#### Ưu tiên 3: `getByPlaceholder` và `getByText`
- ✅ `page.getByPlaceholder('Username')`
- ✅ `page.getByText('Epic sadface: Password is required')`

#### CÁC DẠNG LOCATOR CẦN TRÁNH TUYỆT ĐỐI (ANTI-PATTERNS):
- ❌ **XPath dài, phụ thuộc vị trí DOM:**
  ```typescript
  // KHÔNG DÙNG: Cực kỳ dễ vỡ khi đổi cấu trúc HTML
  page.locator('/html/body/div[1]/div/div[2]/div[1]/div/div/form/div[1]/input');
  ```
- ❌ **CSS Selector bám vào class tự sinh hoặc style:**
  ```typescript
  // KHÔNG DÙNG: Class thay đổi khi cập nhật framework UI
  page.locator('.form-group > div:nth-child(2) > input');
  ```
- ❌ **Hardcode text có thể dịch đa ngôn ngữ:**
  ```typescript
  // Tránh hardcode trực tiếp, nên đưa vào file constants.ts
  ```

---

## 4. Quy Chuẩn Viết Mã (Coding Best Practices)

1. **Không Hardcode Credentials / Sensitive Data:**
   - Mọi tài khoản, mật khẩu, API key phải lấy qua biến môi trường `process.env.*` từ file `.env` (thông qua `dotenv`).
2. **Tận dụng tính năng Tự Động Đợi (Auto-waiting):**
   - Không sử dụng `page.waitForTimeout(5000)` (trừ khi cần debug). Playwright đã tự động đợi phần tử hiển thị và tương tác được (Actionability checks).
3. **Sử dụng Web-first Assertions:**
   - Luôn sử dụng assertions bất đồng bộ có tính năng tự retry:
     - ✅ `await expect(page.locator('.title')).toHaveText('Products');`
     - ❌ `expect(await page.locator('.title').textContent()).toBe('Products');` (Dễ lỗi do không tự động retry).
