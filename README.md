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

Các suite hiện có nằm trong `tests/sauce-demo-tests/`; các spec cho QA Automation Labs nằm trong `tests/qa-automation-labs/`. Đặt biến môi trường `QA_AUTOMATIONLABS_BASE_URL` thành origin thật của site trước khi chạy suite QA Automation Labs; nếu chưa đặt, cấu hình hiển thị placeholder `TODO` và URL cần được cung cấp.
