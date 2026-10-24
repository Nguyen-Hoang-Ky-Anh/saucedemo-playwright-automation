# Hướng Dẫn Thiết Lập & Sử Dụng Playwright Automation (SauceDemo)

Tài liệu này hướng dẫn chi tiết từng bước cách thiết lập môi trường, cấu hình và thực thi kiểm thử tự động hóa với **Playwright** và **TypeScript** cho dự án SauceDemo.

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
npm install -D @playwright/test
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
├── tests/                           # Thư mục chứa các file kịch bản kiểm thử (*.spec.ts)
│   └── example.spec.ts              # Kịch bản kiểm thử mẫu cho SauceDemo
├── playwright-report/               # Báo cáo kết quả kiểm thử định dạng HTML (sinh ra sau khi test)
├── test-results/                    # Chứa screenshots, videos, trace khi test thất bại
├── playwright.config.ts             # File cấu hình trung tâm của Playwright
├── package.json                     # Quản lý dependencies và các script chạy lệnh
├── tsconfig.json                    # Cấu hình TypeScript
└── README.md                        # Giới thiệu dự án
```

---

## 4. Chi Tiết File Cấu Hình `playwright.config.ts`

File cấu hình [playwright.config.ts](file:///d:/testing_prj/playwright.config.ts) được thiết lập tối ưu cho ứng dụng SauceDemo:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Thư mục chứa các test suites
  testDir: './tests',

  // Chạy các test song song để tối ưu tốc độ
  fullyParallel: true,

  // Chặn vô tình commit `test.only` khi chạy trên CI
  forbidOnly: !!process.env.CI,

  // Thử lại khi test fail trên CI
  retries: process.env.CI ? 2 : 0,

  // Số worker chạy song song (1 worker khi chạy trên CI để tránh nghẽn tài nguyên)
  workers: process.env.CI ? 1 : undefined,

  // Định dạng xuất báo cáo kiểm thử
  reporter: 'html',

  use: {
    // URL gốc của ứng dụng (dùng relative path trong test: page.goto('/'))
    baseURL: 'https://www.saucedemo.com',

    // Ghi lại trace khi test bị retry để điều tra lỗi
    trace: 'on-first-retry',

    // Tự động chụp ảnh khi test case thất bại
    screenshot: 'only-on-failure',

    // Giữ lại video quay màn hình khi có test fail
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Có thể bổ sung firefox hoặc webkit tại đây nếu cần
  ],
});
```

---

## 5. Các Lệnh Thực Thi Kiểm Thử (NPM Scripts)

Trong file [package.json](file:///d:/testing_prj/package.json), các câu lệnh sau đã được cấu hình sẵn:

| Câu lệnh | Mô tả | Chi tiết |
| :--- | :--- | :--- |
| `npm test` | Chạy toàn bộ test suites | Chạy ở chế độ ngầm (Headless) |
| `npm run test:ui` | Mở giao diện Playwright UI | Cung cấp timeline, live locator, time-travel debugging |
| `npm run test:headed` | Chạy test có hiển thị trình duyệt | Quan sát trực tiếp các thao tác click, điền form trên màn hình |
| `npm run test:report` | Xem báo cáo kiểm thử HTML | Mở web server cục bộ xem biểu đồ, kết quả, log, ảnh chụp lỗi |

---

## 6. Hướng Dẫn Viết Kịch Bản Test Mới

Các kịch bản kiểm thử mới phải được đặt trong thư mục `tests/` với đuôi định dạng `.spec.ts`.

### Ví dụ kịch bản kiểm thử chuẩn (`tests/example.spec.ts`):

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
    await page.goto('/');

    await page.fill('[data-test="username"]', 'standard_user');
    await page.fill('[data-test="password"]', 'secret_sauce');
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
