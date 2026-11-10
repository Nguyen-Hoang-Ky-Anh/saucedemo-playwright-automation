# saucedemo-playwright-automation

## Tài Liệu Thiết Lập & Hướng Dẫn Chi Tiết
Vui lòng tham khảo file tài liệu đầy đủ tại: [PLAYWRIGHT_SETUP_GUIDE.md](./PLAYWRIGHT_SETUP_GUIDE.md).

## Các Lệnh Chạy Nhanh

```bash
# Chạy test SauceDemo
npm run test:saucedemo

# Chạy test QA Automation Labs (cần cấu hình URL trước)
npm run test:qalabs

# Chạy test của cả hai site
npm run test:all

# Chạy kiểm thử với giao diện trực quan (UI mode)
npm run test:ui

# Xem báo cáo HTML
npm run test:report
```

Các suite hiện có nằm trong `tests/sauce-demo-tests/`; các spec cho QA Automation Labs nằm trong `tests/qa-automation-labs/`. Module Cart có các test CT-03 kiểm tra sản phẩm trong giỏ và CT-04 xóa một sản phẩm. Đặt biến môi trường `QA_AUTOMATIONLABS_BASE_URL` thành origin thật của site trước khi chạy suite QA Automation Labs.

```bash
npx playwright test tests/qa-automation-labs --project=qaautomationlabs
```

Chạy riêng các test Cart:

```bash
npx playwright test tests/qa-automation-labs/cart/cart.spec.ts --project=qaautomationlabs
```

Trước khi chạy, đặt `QA_AUTOMATIONLABS_BASE_URL`, `QA_AUTOMATIONLABS_DEMO_EMAIL` và `QA_AUTOMATIONLABS_DEMO_PASSWORD` trong file `.env` cục bộ hoặc môi trường CI. Có thể sao chép `.env.example` làm mẫu; thay các giá trị placeholder trên máy cá nhân và không commit `.env`. Nếu thiếu biến đăng nhập, test sẽ báo rõ tên biến còn thiếu.
