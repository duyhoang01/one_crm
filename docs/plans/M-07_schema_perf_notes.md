# M-07 Integration — Ghi chú Schema, Hiệu năng & Bảo mật cần xử lý khi làm DB/dev

> Ngày lập: 16/07/2026 · Nguồn: rà soát demo `docs/demo/v2.7.0_integration.html` + đối chiếu schema PRD v2.6 (§5.3.10–5.3.12).
> Mục đích: gom các điểm mà **giao diện demo đang hiển thị / hành vi đã chốt** nhưng **cần bổ sung schema, index, hoặc quyết định thiết kế** thì mới chạy đúng và đủ hiệu năng ở hệ thống thật. Track khi bước vào thiết kế DB / code M-07.

Mức: 🔴 chặn dev · 🟠 cần trước khi lên production · 🟢 cải thiện.

---

## A. Thiếu trong schema — cần bổ sung cột / chốt định nghĩa

| Mã | Vấn đề | Hiện trạng schema | Đề xuất | Mức |
|----|----|----|----|----|
| **SG-1** | Cột "Lỗi ở bước nào" (`fail_stage`) — phân loại Xác thực / Nhận diện subscription / Đọc dữ liệu | `WEBHOOK_INBOX` **chỉ có `last_error` (text tự do)**, không có cột phân loại | Thêm **`fail_stage` enum** {SIGNATURE, CORRELATION, MAPPING, ORDERING, SCHEMA}. Worker biết bước fail lúc xử lý (các gate BR-01/05/07/08/09 của UC-INT-02) — chỉ cần lưu lại. Không có nó thì cột "Lỗi ở bước nào" + bộ lọc theo bước là không lấy được thật | 🟠 |
| **SG-2** | `product_code` trên sự kiện gửi đi | `OUTBOX_EVENT` **không có `product_id`/`product_code`**, chỉ có `target_topic` (topic RabbitMQ) | Thêm **`product_code`** vào `OUTBOX_EVENT`. Tab "Sự kiện gửi đi" lọc + hiển thị theo sản phẩm → cần cột này (+ index). *(WEBHOOK_INBOX đã có `product_code` sẵn.)* | 🟠 |
| ~~**SG-3**~~ | Ngữ nghĩa `correlation_id` chưa nhất quán | PRD §5.3.11 ghi "= subscription_id"; catalog §2.1 ghi "= event_id của lệnh" | ✅ **CHỐT 16/07 — tách 2 trường độc lập:** `subscription_id` = khoá map về sub (luôn có); `correlation_id` = **event_id của lệnh** (product echo → nối lệnh↔phản hồi, trống nếu event tự nhiên). **Đã sửa:** PRD §5.3.11 (OUTBOX + subscription_id, redefine correlation_id), §5.3.12 (WEBHOOK_INBOX tương tự). | ✅ |
| ~~**SG-4**~~ | Có LƯU dòng chữ-ký-sai không? | Cột `signature_ok` tồn tại; BR-01 "ghi nhận" vs §6.7.1 "không vào pipeline" — mập mờ | ✅ **CHỐT 16/07 — KHÔNG ghi.** Chữ ký sai → Receiver **trả 4xx, KHÔNG ghi `WEBHOOK_INBOX`** (chỉ log hạ tầng rate-limited + source IP cho forensics). Lý do: (1) lỗi khoá thật đã được **cảnh báo im lặng** bắt; (2) điều tra giả mạo thuộc **an ninh hạ tầng**, không phải dashboard CRM; (3) không lưu = **hết DoS write-amplification** + inbox chỉ chứa dữ liệu đã xác thực. **Đã sửa:** UC-INT-02 BR-01/BR-02/EF-01/AC-INT-02-02, PRD §5.3.12 (bỏ cột `signature`/`signature_ok`) + §6.7.1, catalog §5.3, demo (bỏ thẻ cảnh báo badSig + cột "Xác thực" + fail-stage SIGNATURE + seed chữ-ký-sai). | ✅ |

---

## B. Hiệu năng

Gốc rễ: **`WEBHOOK_INBOX` là append-only và (theo catalog §5.5) chưa purge** → phình vô hạn. `license.usage_synced` 3h × N sub = 8 tin/sub/ngày ≈ **1,5 triệu tin/năm** (500 sub). Mọi aggregate/scan trên bảng này **chậm dần theo thời gian**. Tab "Tình trạng kết nối" là màn ăn nặng nhất.

| Mã | Vấn đề | Đề xuất | Mức |
|----|----|----|----|
| **PF-1** | Bảng append-only không biên, chưa có chiến lược lưu trữ | **Partition theo tháng** ngay từ đầu (rẻ khi làm sớm, đắt khi retrofit) + chốt chính sách archive. Catalog §5.5 để "backup/archival để sau" — chính là món nợ này | 🟠 |
| **PF-2** | Tab Kênh chạy `MAX(received_at)` + `COUNT` theo product **mỗi lần mở** trên bảng khổng lồ | **Bảng tổng hợp cập-nhật-khi-ghi** `channel_health` (`product_code, last_inbound_at, dead_count, failed_count, sig_fail_count_24h…`) → tab Kênh **đọc O(1)** thay vì quét toàn bảng. Worker cập nhật lúc nhận webhook. *(Đúng hướng AI-driven: worker tự duy trì summary.)* | 🟠 |
| **PF-3** | Thiếu index cho lọc/aggregate | Index `WEBHOOK_INBOX(product_code, received_at)`, `(product_code, status)`, `(correlation_id)`; `OUTBOX_EVENT` tương tự (kèm SG-2) | 🟠 |
| **PF-4** | ✅ **Đã chốt & áp vào demo (PA2, 16/07):** lọc danh sách Sự kiện gửi đi/nhận về = **thuần thời gian** (một index range scan, kết quả bị chặn) thay vì "lai" (unresolved không giới hạn tuổi). Bỏ banner "Đang ẩn N events". Lệnh/tin kẹt cũ vẫn được **tab Kênh** bắt (đếm theo status + index) và **drill-down mở sẵn "Toàn bộ"** (lọc status+product, rất chọn lọc). | (áp dụng ở dev) | 🟢 |

---

## C. Cảnh báo bảo mật (chữ ký không hợp lệ) — feasibility

> ✅ **CHỐT 16/07: bỏ hoàn toàn cảnh báo chữ-ký-sai khỏi CRM** (theo SG-4 "không ghi"). Mục dưới ghi lại để đối chiếu — **tất cả đã đóng/moot**.

| Mã | Vấn đề | Trạng thái |
|----|----|----|
| ~~**SEC-1**~~ | Điều kiện có dữ liệu + chống DoS | ✅ Đóng theo **SG-4**: không ghi sig-fail → không có cảnh báo trong CRM → không còn bài toán DoS/nguồn-dữ-liệu ở đây |
| ~~**SEC-2**~~ | "từ CMC CA" sai bản chất | ✅ **Moot** — đã bỏ thẻ cảnh báo (câu chữ đã sửa trước đó nhưng nay thẻ cũng bỏ luôn) |
| ~~**SEC-3**~~ | Đếm all-time → alert fatigue | ✅ **Moot** — không còn cảnh báo để treo. Lỗi khoá thật do **cảnh báo im lặng** phủ |

---

## D. Khác

| Mã | Vấn đề | Đề xuất | Mức |
|----|----|----|----|
| **MI-1** | Số lần thử tối đa "**10**" đang **hardcode** (cột "10/10", tooltip) | Đọc từ cấu hình (`max_retry` của `OUTBOX_EVENT` / runtime_config) — quy tắc demo #6 "ngưỡng không hardcode". Giá trị chốt hiện tại: outbound 10 lần/24h, inbound processor 5 lần/1h (PRD §6.7 BR-02.3/BR-04.3) | 🟢 |
| **MI-2** | Nhãn badge mirror còn lẫn tiếng Anh (`Active/Pending/Suspended/Expired/Revoked`); chữ "events" lẫn trong UI tích hợp | Việt hoá đồng bộ (demo rule #1). Chưa làm — chờ quyết | 🟢 |

---

## Đã sửa trong demo phiên 16/07 (ghi để đối chiếu, không cần track thêm)

- Đồng bộ toàn bộ event/state theo mô hình EDR xác nhận (license.expired=GRACE, bỏ tenant.*/grace_started, thêm RESTRICTED, command-ack qua license.* + correlation_id).
- Tinh gọn tab Kênh: bỏ throughput/`%`/badSig-thường-trực → chỉ giữ số hành động được (silence, dead, failed) + cảnh báo bảo mật bật-khi-có.
- Bỏ note thừa đầu tab; bỏ banner "Đang ẩn N events" (PA2).
- Alert bảo mật nêu sự thật (sản phẩm/số tin/thời điểm) + 2 khả năng + "cần điều tra"; sửa attribution (SEC-2).
- Đổi nhãn `DEAD_LETTER` "Thất bại vĩnh viễn" → "Đã ngừng tự gửi lại" (khớp việc có nút Gửi lại).
- Event lạ ở inbound hiện thêm `event_key` thật + gợi ý "cần khai báo vào cấu hình sản phẩm".
