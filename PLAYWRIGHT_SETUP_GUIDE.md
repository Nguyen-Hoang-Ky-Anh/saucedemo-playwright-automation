# Hướng Dẫn Thiết Lập & Sử Dụng Playwright Automation (SauceDemo & QA Automation Labs)

Tài liệu này hướng dẫn chi tiết từng bước cách thiết lập môi trường, cấu hình và thực thi kiểm thử tự động hóa với **Playwright** và **TypeScript** cho SauceDemo và QA Automation Labs.

---

## 1. Yêu cầu Tiền đề (Prerequisites)

Trước khi bắt đầu, đảm bảo máy tính của bạn đã cài đặt:

- **Node.js**: Phiên bản LTS khuyến nghị (từ `v18.x` trở lên, dự án hiện đang chạy trên Node `v26.x`).
  - Kiểm tra phiên bản:
    ```bash
    node -v
    npm -v
    ```
- **Git**: Đã cài đặt để quản lý mã nguồn.
- **Trình soạn thảo mã nguồn**: Visual Studio Code, WebStorm hoặc trình soạn thảo tương đương.

---

## 2. Các Bước Thiết Lập Từ Đầu (Setup Step-by-Step)

### Bước 2.1: Clone Repository & Kiểm tra Nhánh
1. Mở terminal tại thư mục làm việc và clone mã nguồn từ GitHub:
   ```bash
   git clone https://github.com/Nguyen-Hoang-Ky-Anh/saucedemo-playwright-automation.git .
   ```
2. Chuyển sang nhánh chính:
   ```bash
   git checkout main
   ```

### Bước 2.2: Cài Đặt Playwright Test Framework
Cài đặt thư viện `@playwright/test` vào `devDependencies`:
```bash
npm install -D @playwright/test dotenv
```

### Bước 2.3: Tải Trình Duyệt Thực Thi Kiểm Thử (Browsers)
Playwright quản lý trình duyệt độc lập, thực hiện tải trình duyệt Chromium:
```bash
npx playwright install chromium
```
*(Nếu muốn chạy trên cả Firefox và WebKit/Safari, chạy lệnh: `npx playwright install`)*

---

## 3. Cấu Trúc Thư Mục Dự Án

```plaintext
testing_prj/
├── tests/
│   ├── sauce-demo-tests/            # Các suite SauceDemo hiện có
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── gui-ui/                  # Bao gồm baseline screenshot của Playwright
│   │   ├── login/
│   │   ├── products/
│   │   └── state/
│   └── qa-automation-labs/          # Các spec dành cho QA Automation Labs
│       ├── cart/
│       ├── checkout/
│       ├── filter/
│       ├── gui-ui/
│       ├── login/
│       ├── product/
│       └── register/
├── playwright-report/               # Báo cáo kết quả kiểm thử định dạng HTML (sinh ra sau khi test)
├── test-results/                    # Chứa screenshots, videos, trace khi test thất bại
├── .env                             # Biến môi trường cục bộ (chứa user/pass, không push lên git)
├── .env.example                     # Mẫu biến môi trường cho team/CI tham khảo
├── playwright.config.ts             # File cấu hình trung tâm của Playwright
├── package.json                     # Quản lý dependencies và các script chạy lệnh
├── tsconfig.json                    # Cấu hình TypeScript
└── README.md                        # Giới thiệu dự án
```

---

## 4. Chi Tiết File Cấu Hình `playwright.config.ts`

File cấu hình [playwright.config.ts](./playwright.config.ts) có project riêng cho mỗi site. Project SauceDemo dùng `tests/sauce-demo-tests/` và URL `https://www.saucedemo.com`; project QA Automation Labs dùng `tests/qa-automation-labs/` và Chromium.

Đặt `QA_AUTOMATIONLABS_BASE_URL` thành origin thật của QA Automation Labs trong `.env` hoặc môi trường CI trước khi chạy project này. URL vẫn là placeholder có ghi chú TODO trong cấu hình cho tới khi được cung cấp; không có URL mặc định được suy đoán. Các trang site này có đường dẫn như `/shop.php`, `/cart.php` và `/register.php`. Test so sánh ảnh có thể dùng assertion screenshot tích hợp `toHaveScreenshot` của Playwright trên Chromium; không cần cài thêm thư viện.

---

## 5. Các Lệnh Thực Thi Kiểm Thử (NPM Scripts)

Chọn site cần chạy bằng script tương ứng trong file [package.json](./package.json):

| Câu lệnh | Mô tả | Chi tiết |
| :--- | :--- | :--- |
| `npm run test:saucedemo` | Chạy suite SauceDemo | Chạy test trong `tests/sauce-demo-tests/` |
| `npm run test:qalabs` | Chạy suite QA Automation Labs | Cần đặt `QA_AUTOMATIONLABS_BASE_URL`; do spec hiện rỗng nên Playwright báo chưa có test để chạy |
| `npm run test:all` | Chạy test của cả hai site | Chạy tất cả project đã cấu hình |
| `npm test` | Chạy toàn bộ test suites | Tương đương `npm run test:all` |
| `npm run test:ui` | Mở giao diện Playwright UI | Cung cấp timeline, live locator, time-travel debugging |
| `npm run test:headed` | Chạy test có hiển thị trình duyệt | Quan sát trực tiếp các thao tác click, điền form trên màn hình |
| `npm run test:report` | Xem báo cáo kiểm thử HTML | Mở web server cục bộ xem biểu đồ, kết quả, log, ảnh chụp lỗi |

---

## 6. Hướng Dẫn Viết Kịch Bản Test Mới

Kịch bản SauceDemo mới phải được đặt trong `tests/sauce-demo-tests/`; kịch bản QA Automation Labs đặt trong thư mục tương ứng dưới `tests/qa-automation-labs/`. Tất cả file test có đuôi `.spec.ts`.

### Ví dụ kịch bản kiểm thử chuẩn (`tests/sauce-demo-tests/login/login.spec.ts`):

```typescript
import { test, expect } from '@playwright/test';

test.describe('SauceDemo Login Flow', () => {
  // Test case 1: Kiểm tra phần tử trang đăng nhập
  test('should display login page title and form elements', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Swag Labs/i);
    await expect(page.locator('[data-test="username"]')).toBeVisible();
    await expect(page.locator('[data-test="password"]')).toBeVisible();
    await expect(page.locator('[data-test="login-button"]')).toBeVisible();
  });

  // Test case 2: Kiểm tra đăng nhập thành công
  test('should login successfully with standard user', async ({ page }) => {
    const username = process.env.SAUCE_USERNAME!;
    const password = process.env.SAUCE_PASSWORD!;

    await page.goto('/');

    await page.fill('[data-test="username"]', username);
    await page.fill('[data-test="password"]', password);
    await page.click('[data-test="login-button"]');

    // Kiểm tra URL và tiêu đề trang Inventory
    await expect(page).toHaveURL(/.*inventory.html/);
    await expect(page.locator('.title')).toHaveText('Products');
  });
});
```

---

## 7. Gỡ Lỗi & Xử Lý Sự Cố (Troubleshooting & Debugging)

### 7.1. Chế độ Debug từng bước (Playwright Inspector)
Dùng lệnh sau để dừng lại từng dòng lệnh và có thanh công cụ step-over:
```bash
npx playwright test --debug
```

### 7.2. Ghi đè Trace Viewer
Nếu muốn xem lại toàn bộ network, console log, DOM snapshot của từng test:
```bash
npx playwright show-trace test-results/<tên-thư-mục-kết-quả>/trace.zip
```

### 7.3. Lỗi thiếu browser binaries
Nếu gặp lỗi `Executable doesn't exist at ...`:
```bash
npx playwright install --with-deps chromium
```
Lệnh trên sẽ cài đặt bổ sung cả các thư viện hệ thống cần thiết (đặc biệt hữu ích khi chạy trên Linux/CI).
