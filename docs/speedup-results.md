# Kết quả đo chạy song song và smoke cross-browser

## Môi trường và phương pháp đo

- Máy: Windows 11 Home Single Language (10.0.26300), Intel Core i5-12500H, 15.6 GB RAM.
- Đo toàn bộ 65 test trong `tests/sauce-demo-tests` trên Chromium, mỗi mức workers chạy 3 lần.
- Thời gian là elapsed wall-clock của lệnh `npx playwright test tests/sauce-demo-tests --project=chromium --workers=<n> --reporter=line`.
- Speedup = T(1)/T(n); hiệu suất = speedup/n. Cả 9 lượt đều pass 65/65.

| Workers | Lần 1 (s) | Lần 2 (s) | Lần 3 (s) | Trung vị T(n) (s) | Speedup | Hiệu suất |
|---:|---:|---:|---:|---:|---:|---:|
| 1 | 79.79 | 77.83 | 78.04 | 78.04 | 1.00 | 100.00% |
| 2 | 41.49 | 42.30 | 41.21 | 41.49 | 1.88 | 94.05% |
| 4 | 24.90 | 25.21 | 24.86 | 24.90 | 3.13 | 78.35% |

### Nhận xét

- 2 workers đạt speedup 1.88x với hiệu suất 94.05%; cấu hình này giảm đáng kể thời gian chạy.
- 4 workers đạt speedup 3.13x; hiệu suất giảm còn 78.35%, cho thấy mức tăng thêm có lợi ích giảm dần.
- Không có test fail trong các lượt chạy song song; không có lỗi cần ghi nhận nguyên nhân.

## Smoke cross-browser

Lệnh `npm run test:smoke -- --reporter=line` hoàn tất với 21 passed, 0 failed (23.72 giây elapsed). Thời gian dưới đây là elapsed wall-clock của từng project khi chạy riêng với reporter line.

| Trình duyệt | Passed | Failed | Thời gian (s) |
|---|---:|---:|---:|
| Chromium | 7 | 0 | 6.42 |
| Firefox | 7 | 0 | 14.79 |
| WebKit | 7 | 0 | 8.23 |
