# saucedemo-playwright-automation

Kiểm thử tự động hóa hai website bằng **Playwright 1.64 + TypeScript**, theo mô hình **Page Object Model (POM)**:

- **SauceDemo (Swag Labs)**: https://www.saucedemo.com
- **QA Automation Labs**: https://shop.qaautomationlabs.com

## Tài Liệu Thiết Lập & Hướng Dẫn Chi Tiết
Vui lòng tham khảo file tài liệu đầy đủ tại: [PLAYWRIGHT_SETUP_GUIDE.md](./PLAYWRIGHT_SETUP_GUIDE.md).

Quy chuẩn đặt tên, chọn locator và cấu trúc thư mục: [rule.md](./rule.md). Mẫu mô tả Pull Request: [pull_request_template.md](./pull_request_template.md).

## Phạm Vi Kiểm Thử

Tổng cộng **110 test case** (TC) thuộc **13 module**, nằm trong bảng Test Case List của nhóm. Mỗi module có một file spec riêng:

| Site | Module | Mã TC | Số TC | File spec |
| :--- | :--- | :--- | :---: | :--- |
| SauceDemo | Login / Logout | LG-01 → LG-09 | 9 | `tests/sauce-demo-tests/login/login.spec.ts` |
| SauceDemo | Product (Inventory) | PR-01 → PR-07 | 7 | `tests/sauce-demo-tests/products/products.spec.ts` |
| SauceDemo | Cart | CT-01 → CT-08 | 8 | `tests/sauce-demo-tests/cart/cart.spec.ts` |
| SauceDemo | Checkout | CO-01 → CO-10 | 10 | `tests/sauce-demo-tests/checkout/checkout.spec.ts` |
| SauceDemo | State Transition | ST-01 → ST-03 | 3 | `tests/sauce-demo-tests/state/state.spec.ts` |
| SauceDemo | GUI / UI | GUI-01 → UI-03 | 5 | `tests/sauce-demo-tests/gui-ui/gui_ui.spec.ts` |
| QA Labs | Login | LG-01 → LG-12 | 12 | `tests/qa-automation-labs/login/login.spec.ts` |
| QA Labs | Register | RG-01 → RG-17 | 17 | `tests/qa-automation-labs/register/register.spec.ts` |
| QA Labs | Product | PR-01 → PR-09 | 9 | `tests/qa-automation-labs/product/product.spec.ts` |
| QA Labs | Filter | FL-01 → FL-08 | 8 | `tests/qa-automation-labs/filter/filter.spec.ts` |
| QA Labs | Cart | CT-01 → CT-09 | 9 | `tests/qa-automation-labs/cart/cart.spec.ts` |
| QA Labs | Checkout | CO-01 → CO-08 | 8 | `tests/qa-automation-labs/checkout/checkout.spec.ts` |
| QA Labs | GUI / UI | GUI-01 → UI-02 | 5 | `tests/qa-automation-labs/gui-ui/gui.spec.ts`, `visual.spec.ts` |

Lưu ý: số test Playwright chạy thực tế khác số TC trong bảng trên, vì một số TC được tách theo dữ liệu (ví dụ CT-08, CO-08, CO-09 của SauceDemo), một số test bổ sung chưa có trong Test Case List, và một số TC của QA Labs chưa có script tự động. Chi tiết xem tài liệu danh sách bug bàn giao của nhóm.

## Yêu Cầu Môi Trường

- **Node.js** LTS từ `v18` trở lên (CI chạy `v20`) và **npm**.
- **Git**.
- Trình duyệt Chromium do Playwright quản lý (cài ở bước dưới). Cấu hình hiện chỉ định nghĩa project Chromium; Firefox chỉ dùng cho smoke test theo Test Plan.

## Cài Đặt Nhanh

```bash
# Clone mã nguồn và cài thư viện theo package-lock.json
git clone https://github.com/Nguyen-Hoang-Ky-Anh/saucedemo-playwright-automation.git
cd saucedemo-playwright-automation
npm ci

# Cài trình duyệt Chromium (thêm --with-deps nếu chạy trên Linux)
npx playwright install chromium

# Tạo file biến môi trường cục bộ rồi điền giá trị (Windows PowerShell: Copy-Item .env.example .env)
cp .env.example .env
```

## Cấu Hình Biến Môi Trường

Điền các biến trong file `.env` cục bộ (hoặc Secrets/Variables của GitHub cho CI). Có thể sao chép `.env.example` làm mẫu; thay các giá trị placeholder trên máy cá nhân và **không commit `.env`**. Nếu thiếu biến bắt buộc, test sẽ báo rõ tên biến còn thiếu.

| Biến | Bắt buộc | Dùng cho |
| :--- | :---: | :--- |
| `QA_AUTOMATIONLABS_BASE_URL` | Không | Origin của QA Automation Labs. Mặc định `https://shop.qaautomationlabs.com/` |
| `QA_AUTOMATIONLABS_DEMO_EMAIL`, `QA_AUTOMATIONLABS_DEMO_PASSWORD` | Có (QA Labs) | Tài khoản demo đăng nhập QA Automation Labs (TD-01) |
| `QA_REGISTER_TD04_FIRST_NAME`, `_LAST_NAME`, `_TELEPHONE`, `_GENDER`, `_DOB`, `_COUNTRY`, `_PASSWORD` | Có (module Register) | Dữ liệu đăng ký hợp lệ (TD-04). `_GENDER` chỉ nhận `Male`, `Female` hoặc `Other` |
| `QA_REGISTER_PASSWORD_MISMATCH`, `_CONFIRM_MISMATCH`, `_WEAK`, `_MEDIUM`, `_STRONG` | Có (module Register) | Dữ liệu kiểm tra mật khẩu không khớp và độ mạnh mật khẩu |
| `QA_CHECKOUT_TD05_*` (FIRST_NAME, LAST_NAME, EMAIL, PHONE, ADDRESS, CITY, STATE, ZIP, COUNTRY, CARD_NUMBER, CARD_EXPIRY, CARD_CVV) | Không | Dữ liệu checkout hợp lệ (TD-05) của QA Labs, có giá trị mặc định |
| `SAUCE_USERNAME`, `SAUCE_PASSWORD`, `SAUCE_LOCKED_USERNAME`, `SAUCE_GLITCH_USERNAME`, `SAUCE_INVALID_USERNAME`, `SAUCE_INVALID_PASSWORD`, `SAUCE_WRONG_PASSWORD` | Không | Tài khoản SauceDemo (TD-01, 02, 03, 06). Mặc định dùng tài khoản demo công khai của SauceDemo |

## Các Lệnh Chạy Nhanh

```bash
# Chạy test SauceDemo
npm run test:saucedemo

# Chạy test QA Automation Labs
npm run test:qalabs

# Chạy test của cả hai site
npm run test:all

# Chạy kiểm thử với giao diện trực quan (UI mode)
npm run test:ui

# Chạy có hiển thị trình duyệt
npm run test:headed

# Xem báo cáo HTML
npm run test:report
```

Playwright có hai project: `chromium` (SauceDemo) và `qaautomationlabs` (QA Automation Labs). Chạy riêng từng phần:

```bash
# Chạy theo project
npx playwright test --project=qaautomationlabs

# Chạy một file spec
npx playwright test tests/qa-automation-labs/cart/cart.spec.ts --project=qaautomationlabs

# Chạy theo mã hoặc tên test case (hai site có mã trùng nhau, thêm --project để lọc)
npx playwright test -g "CO-03" --project=qaautomationlabs

# Debug từng bước bằng Playwright Inspector
npx playwright test --debug
```

## Chế Độ T20 (Chạy Tuần Tự & Ghi Nhận Lỗi)

Đặt `T20=1` để chạy toàn bộ suite theo thứ tự, ghi nhận lỗi phục vụ báo cáo. Ở chế độ này Playwright chạy 1 worker, không retry, bật trace và video cho mọi test, và chia thành 6 project theo module (`1-login` → `5-state` của SauceDemo, `6-qaautomationlabs`). Kết quả gồm báo cáo HTML và file `test-results/results.json`.

```bash
# Windows PowerShell
$env:T20="1"; npx playwright test

# Windows CMD (để dấu ngoặc kép, tránh biến bị dính khoảng trắng thành "1 ")
set "T20=1" && npx playwright test

# Git Bash / Linux / macOS
T20=1 npx playwright test
```

Chế độ này chậm và nặng hơn chạy thường. Để chỉ chạy QA Labs: `npx playwright test --project=6-qaautomationlabs` (sau khi đặt `T20=1`).

Biến `T20` giữ nguyên trong cửa sổ terminal đã đặt. Muốn quay về chạy thường thì mở terminal mới, hoặc tắt biến: `Remove-Item Env:T20` (PowerShell), `set T20=` (CMD), `unset T20` (Git Bash).

## Kiểm Thử So Sánh Ảnh (Visual)

Các test UI-01, UI-02 của SauceDemo và QA Labs dùng `toHaveScreenshot` của Playwright, chỉ chạy trên Chromium. Ảnh baseline nằm trong thư mục `*.spec.ts-snapshots/` cạnh file spec và có hậu tố theo hệ điều hành (`-win32`, `-linux`), nên máy chạy khác hệ điều hành sẽ dùng bộ baseline tương ứng. CI chạy trên Linux nên dùng baseline `-linux`.

Khi giao diện thay đổi có chủ đích, cập nhật baseline rồi mở Pull Request kèm ảnh mới để reviewer đối chiếu:

```bash
npx playwright test tests/qa-automation-labs/gui-ui/visual.spec.ts --project=qaautomationlabs --update-snapshots
```

Không chạy `--update-snapshots` chỉ để làm test xanh khi chưa kiểm tra ảnh khác biệt (`*-diff.png` trong `test-results/`). Ở QA Labs, các vùng hay thay đổi (ô tìm kiếm, nút Autofill) được che bằng `mask` trong test.

## Báo Cáo & Kết Quả

- `playwright-report/`: báo cáo HTML, xem bằng `npm run test:report`.
- `test-results/`: screenshot, video, trace và ảnh `actual/expected/diff` của test lỗi. Xem trace bằng:

```bash
npx playwright show-trace test-results/<tên-thư-mục-kết-quả>/trace.zip
```

Hai thư mục này được `.gitignore` bỏ qua. Nếu xuất thêm file kết quả (ví dụ `results.json` ở thư mục gốc), hãy xóa trước khi commit và dùng `git add <file cần commit>` thay cho `git add .`.

## CI (GitHub Actions)

Workflow [.github/workflows/ci.yml](./.github/workflows/ci.yml) chạy khi push hoặc mở Pull Request vào `main`/`master`:

1. Chạy trên `ubuntu-latest` với Node.js 20, cài thư viện bằng `npm ci`.
2. Cài trình duyệt bằng `npx playwright install --with-deps`.
3. Chạy `npx playwright test` (trên CI: 1 worker, tối đa 2 lần retry).
4. Tải báo cáo `playwright-report/` lên artifact (lưu 7 ngày), kể cả khi test lỗi.

Các biến môi trường lấy từ GitHub: `QA_AUTOMATIONLABS_BASE_URL` là **Variable**; tài khoản demo, `QA_REGISTER_*` và `SAUCE_*` là **Secrets** (các biến `SAUCE_WRONG_PASSWORD` và `QA_CHECKOUT_TD05_*` chưa khai báo trên CI nên dùng giá trị mặc định). Khi thêm biến bắt buộc mới cho test, cần bổ sung vào `ci.yml` và `.env.example`.

## Cấu Trúc Thư Mục

```plaintext
saucedemo-playwright-automation/
├── .github/workflows/ci.yml        # Pipeline CI (GitHub Actions)
├── data/constants.ts               # Tài khoản, thông điệp lỗi, dữ liệu dùng chung của SauceDemo
├── fixtures/test.fixture.ts        # Fixture: loginPage, loggedInPage, checkout* (tiền điều kiện sẵn)
├── pages/                          # Page Object Model (chỉ locator và action, không đặt expect kiểm tra logic)
│   ├── base.page.ts
│   ├── login.page.ts, inventory.page.ts, cart.page.ts,
│   │   checkout.page.ts, product-detail.page.ts          # SauceDemo
│   └── qa-automation-labs-*.page.ts                      # QA Automation Labs (login, register, product, filter, cart, checkout)
├── tests/
│   ├── sauce-demo-tests/           # cart, checkout, gui-ui, login, products, state
│   └── qa-automation-labs/         # cart, checkout, filter, gui-ui, login, product, register
│       └── test-data.ts            # Đọc dữ liệu test từ biến môi trường
├── utils/common-helpers.ts         # Hàm tiện ích (tách số tiền, ...)
├── playwright.config.ts            # Cấu hình trung tâm Playwright (2 project, chế độ T20)
├── .env.example                    # Mẫu biến môi trường (không commit .env)
├── PLAYWRIGHT_SETUP_GUIDE.md       # Hướng dẫn thiết lập chi tiết
├── rule.md                         # Quy chuẩn đặt tên, locator, thư mục
└── pull_request_template.md        # Mẫu Pull Request
```

## Quy Ước Làm Việc

- Theo Branch protection rule của repo, không push trực tiếp lên `main`: tạo nhánh riêng, mở Pull Request theo [pull_request_template.md](./pull_request_template.md) và chờ CI xanh.
- Tên test bắt đầu bằng mã TC, ví dụ `CO-03: ...`; file `*.spec.ts` đặt trong thư mục của đúng module.
- Locator ưu tiên `data-test`/`getByTestId`, rồi `getByRole`, `getByPlaceholder`, `getByText`; không dùng XPath.
- Không hardcode mật khẩu hay dữ liệu nhạy cảm: đọc qua `process.env` từ `.env`.
- Dùng web-first assertion (`await expect(locator)...`), không dùng `waitForTimeout`.

Chi tiết xem [rule.md](./rule.md).

## Xử Lý Sự Cố Thường Gặp

| Hiện tượng | Cách xử lý |
| :--- | :--- |
| `Executable doesn't exist at ...` | Chạy `npx playwright install --with-deps chromium` |
| `Missing required environment variable: ...` | Điền biến còn thiếu trong `.env` (xem bảng biến môi trường) |
| Test Visual báo lệch ảnh hoặc thiếu baseline | Mở ảnh `diff` trong `test-results/`; chỉ cập nhật baseline khi giao diện đổi có chủ đích. Máy khác hệ điều hành cần có baseline `-win32`/`-linux` tương ứng |
| Test lỗi lẻ tẻ do mạng chậm | Chạy lại một test: `npx playwright test -g "<mã TC>"`; xem video/trace trong `test-results/` |
