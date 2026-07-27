# Review kiến trúc — Event Catalog (M-07)

> Tài liệu được review: [`_event_catalog.md`](_event_catalog.md)
> Người review: System Architect (event-driven integration) | Ngày: 27/07/2026
> Phạm vi: đây là **file comment riêng** — chỉ nêu điểm cần sửa, **không** chỉnh trực tiếp catalog.

**Ký hiệu mức độ:** 🔴 Critical (chặn build / gây sai dữ liệu vĩnh viễn) · 🟠 High (rủi ro kiến trúc lớn) · 🟡 Medium (khoảng trống hợp đồng) · ⚪ Low (vệ sinh tài liệu).

---

## 0. Đánh giá tổng quan

Catalog viết tốt ở tầng nghiệp vụ: phân vai inbound/outbound rõ, có metadata chung, có 3 quy tắc lõi (idempotent · ordering · HMAC), có mô hình ân hạn/hạn chế mạch lạc. **Điểm mạnh nhất** là nguyên tắc nền NT-1→NT-5 và việc tách "nội dung event" khỏi "cơ chế" (UC-INT-01/02).

**Nhưng ở tầng kiến trúc phân tán, còn 5 vấn đề đủ nặng để gây sai dữ liệu hoặc chặn implement**, và một số mâu thuẫn nội bộ mới phát sinh sau các lần sửa gần đây. Chi tiết dưới đây, xếp theo mức độ.

| # | Mức | Vấn đề | Vị trí |
|---|---|---|---|
| A | 🔴 | `license_mirror.status` là **enum lõi chuẩn hoá** hay **chuỗi raw của sản phẩm**? — mâu thuẫn giữa §3.2 và NT-5/§6.1 | §3.2 · NT-5 · §6.1 |
| B | 🔴 | **Watermark chống-sai-thứ-tự dùng chung** cho event trạng thái và `usage_synced` → event trạng thái đến muộn bị **loại nhầm** | §5.2 · §3.2 #10 |
| C | 🟠 | `occurred_at` là **khoá thứ tự duy nhất** — không an toàn với lệch đồng hồ / trùng mốc thời gian | §5.2 · §2 |
| D | 🟠 | Chưa định nghĩa **trạng thái CRM khi gửi lệnh** (optimistic hay chờ ack) ↔ rollback khi `command_failed` | §4.4 · NT-2 · §4.1 |
| E | 🟠 | **Mâu thuẫn nội bộ** sau các lần sửa: (E1) OQ-INT-04 vs banner §2; (E2) banner §3 vs §3.4/OQ-INT-09 | §2 · §9 · §3.4 |
| F | 🟡 | `correlation_id` thực chất **1:N** (1 lệnh → pending/provisioning/activated) nhưng §3.3 mô tả như **1:1 ack** | §2.1 · §3.3 |
| G | 🟡 | `schema_version` **không có chính sách xử lý** khi gặp version lạ/mới hơn | §2 (#7) |
| H | 🟡 | Không có quy tắc cho **`subscription_id` inbound không tồn tại** ở CRM | §2 (#4) |
| I | 🟡 | Webhook **FAILED sau 5 lần** → mirror **lỗi thời vĩnh viễn**; thiếu liên kết DLQ ↔ replay ↔ cảnh báo ops | §5.4 · §5.2 |
| J | 🟡 | Thiếu **quản trị namespace `event_key`**; lõi phải **dispatch theo bảng**, không match chuỗi `license.*` | NT-1 · §3.2 · §6.1 |
| K | ⚪ | Vệ sinh: version/ngày tài liệu cũ; ký hiệu ✅ "đã chốt" dùng lẫn sau khi mở lại OQ | Header · §3.4 · §6 |
| L | ⚪ | `webhook_secret` số ít vs nhu cầu **dual-secret** khi đổi khoá | §5.3 |

---

## A. 🔴 `license_mirror.status`: enum lõi hay chuỗi raw của sản phẩm?

**Vấn đề.** §3.2 trình bày `license_mirror.status` như một **enum cố định** (`PENDING/ACTIVE/GRACE/RESTRICTED/SUSPENDED/REVOKED/RENEWED/EXPIRING_SOON`). Nhưng:
- **NT-5** nói tên trạng thái **do từng Product Module khai báo**, lõi không hardcode.
- **§6.1** cho thấy vocabulary trạng thái **khác nhau theo sản phẩm**: EDR có `GRACE`/`RESTRICTED` (không có `EXPIRED`); C-Shield/AV có `EXPIRED` (không có `RESTRICTED`).

Tức tập trạng thái **không đồng nhất** giữa các sản phẩm → `license_mirror.status` **không thể** là một enum lõi đóng.

**Vì sao nặng.** Đây là quyết định nền quyết định cả schema DB M-05 lẫn logic mismatch (UC-LIC-04):
- Nếu Dev hiểu là enum lõi → sẽ tạo `CHECK constraint`/`ENUM` cột, và **C-Shield Phase 3 sẽ vỡ** vì `EXPIRED` không nằm trong enum EDR.
- Logic mismatch `sub.status ↔ mirror.status` nếu viết theo hằng số lõi (`if mirror.status == 'GRACE'`) sẽ **không áp được** cho sản phẩm dùng từ khác.

**Đề xuất.** Nêu **dứt khoát** trong §3.2 (và glossary): `license_mirror.status` lưu **mã trạng thái RAW của sản phẩm (string)**, lõi **không enumerate**; hiển thị tra `license_status_set`; **mọi logic xuyên trạng thái** (mismatch, dashboard, hàng đợi) phải đọc từ `PRODUCT_MODULE_CONFIG` (ví dụ mỗi trạng thái gắn cờ ngữ nghĩa `is_serviceable`, `is_terminal`, `counts_as_mismatch`), **không so hằng số**. Bảng §3.2 nên ghi rõ "đây là mã raw của **EDR**", không phải enum chung.

---

## B. 🔴 Watermark chống-sai-thứ-tự dùng chung → loại nhầm event trạng thái đến muộn

**Vấn đề.** §5.2 quy định: *chỉ áp dụng event khi `occurred_at` mới hơn `license_mirror.last_event_occurred_at`*. Quy tắc phát biểu cho **"event"** nói chung, **không phân loại**. Trong khi đó `license.usage_synced` (§3.2 #10) chạy **mỗi 3 giờ**, tần suất cao, mốc thời gian luôn mới.

Nếu `usage_synced` **cũng đẩy** `last_event_occurred_at` lên:

```
10:00  usage_synced (occurred_at=10:00)      → watermark = 10:00
09:58  license.suspended (occurred_at=09:58) gửi lỗi, tới muộn lúc 10:01
       → 09:58 < 10:00 → BỊ LOẠI, đánh dấu "đến muộn"
       → mirror KHÔNG chuyển SUSPENDED — sai trạng thái vĩnh viễn
```

Đây đúng loại lỗi mà §5.2 muốn chống, nhưng **chính watermark dùng chung lại tạo ra nó** — vì trộn event tần suất cao (usage) với event trạng thái hiếm.

**Đề xuất.** Tách rõ: watermark thứ tự **chỉ áp cho event chuyển-trạng-thái**; `usage_synced` (không đổi status) **không tham gia** watermark và có đường idempotency/so-mới riêng cho `used_seats` (so theo `last_synced_at`, không đụng `last_event_occurred_at`). Ghi minh thị trong §5.2 danh sách event nào cập nhật watermark.

---

## C. 🟠 `occurred_at` làm khoá thứ tự duy nhất là không an toàn

**Vấn đề.** Thứ tự chỉ dựa `occurred_at` (wall-clock của sản phẩm) có 2 điểm yếu kinh điển:
1. **Lệch đồng hồ** giữa sản phẩm và CRM → thứ tự sai dù logic đúng.
2. **Trùng mốc**: hai chuyển trạng thái liên tiếp (vd `grace_expired` rồi `suspended` trong cùng batch) có thể cùng `occurred_at` tới mili-giây → quy tắc "mới **hơn**" (strictly newer) sẽ **loại cái thứ hai**.

**Đề xuất.** Bổ sung **số thứ tự nguồn tăng đơn điệu theo subscription** (vd `source_sequence` mà sản phẩm phát), dùng làm khoá thứ tự chính; `occurred_at` chỉ để hiển thị/audit. Nếu không thể có sequence từ sản phẩm, tối thiểu định nghĩa **tie-breaker** khi `occurred_at` bằng nhau (vd ưu tiên trạng thái "nặng" hơn theo thứ hạng vòng đời). Đây là ràng buộc cần **chốt với EDR** cùng OQ metadata.

---

## D. 🟠 Trạng thái CRM khi gửi lệnh chưa định nghĩa ↔ rollback khi `command_failed`

**Vấn đề.** §4.4 xử lý `command_failed` bằng cách đánh dấu outbox "Sản phẩm từ chối". Nhưng **chưa nói CRM đặt trạng thái sub/mirror thế nào tại thời điểm GỬI lệnh**:
- Nếu **optimistic** (gửi Tạm dừng là set `sub.status=SUSPENDED` ngay) → khi `command_failed` về, phải **rollback**, mà §4.4 không mô tả rollback.
- Nếu **ack-driven** (chỉ đổi khi nhận `license.suspended`) → nhất quán với **NT-2**, nhưng cần nói rõ và UC-SUB-08/09/10 phải tuân theo.

**Vì sao nặng.** Đây là ranh giới nhất quán giữa outbound command và local state. Bỏ ngỏ → mỗi Dev tự quyết, dẫn tới sub "kẹt" ở trạng thái đã set mà lệnh thật đã fail.

**Đề xuất.** Theo tinh thần NT-2, chốt **ack-driven**: gửi lệnh **không** đổi `sub/mirror`; chỉ đổi khi có event xác nhận; `command_failed` → giữ nguyên trạng thái cũ + hiển thị "lệnh bị từ chối". Ghi rõ ràng buộc này và trace về UC-SUB.

---

## E. 🟠 Mâu thuẫn nội bộ (phát sinh sau các lần sửa gần đây)

**E1 — Metadata: đã chốt hay chưa?**
- §2 (dòng 104): *"⚠️ Bộ metadata này là **đề xuất của BA — chưa thống nhất chính thức** với phía sản phẩm."*
- §9 OQ-INT-04: *"✅ **Đã chốt:** metadata 7 trường là chuẩn bắt buộc."*

Hai phát biểu **ngược nhau** về cùng một thứ. → Chọn một: hoặc mở lại OQ-INT-04 thành "chưa chốt" cho khớp §2, hoặc bỏ cảnh báo §2 nếu thực sự đã chốt.

**E2 — §3.4 REVOKED nằm trong vùng "chưa xác nhận" nhưng tự nhận "chính thức".**
- Banner §3 (dòng 168): *"⚠️ **Toàn bộ §3** là mô hình ĐỀ XUẤT, CHƯA xác nhận với EDR."*
- §3.4 tiêu đề còn dấu **✅** và OQ-INT-09 ghi *"✅ Đã chốt: REVOKED… chính thức"*.

§3.4 **nằm trong** §3 → bị banner phủ định. Cần thống nhất: REVOKED là "chính thức" (mâu thuẫn banner) hay cũng "đề xuất, forward-declared" (khớp banner). Gợi ý: giữ REVOKED là **khai báo forward-compatible chưa xác nhận**, hạ dấu ✅ ở §3.4 để nhất quán với các OQ vừa mở lại (01/08/10).

---

## F. 🟡 `correlation_id` là 1:N, không phải 1:1 ack

**Vấn đề.** §2.1 định nghĩa `correlation_id` inbound = `event_id` của lệnh outbound. Nhưng một lệnh `subscription.submitted` sinh **chuỗi nhiều event** (`license.pending` → `provisioning` → `activated`), **tất cả** cùng echo một `correlation_id`. Trong khi §3.3 mô tả `correlation_id` như **ack 1:1** cho Tạm dừng/Khôi phục.

**Hệ quả.** Logic "match phản hồi ↔ lệnh" nếu code theo giả định 1:1 (tìm thấy 1 phản hồi là đóng lệnh) sẽ **đóng sớm** khi mới nhận `pending`. → Cần mô hình "một lệnh có thể có **nhiều** phản hồi tiến trình + một phản hồi **kết thúc**".

**Đề xuất.** Nói rõ trong §2: `correlation_id` = "được gây ra bởi lệnh nào" (1:N), và định nghĩa event nào là **terminal** cho một lệnh (vd `activated`/`command_failed` đóng vòng đời của `submitted`).

---

## G. 🟡 `schema_version` thiếu chính sách xử lý

§2 (#7) cho phép nâng version payload nhưng **không nói CRM làm gì khi gặp version lạ/mới hơn**: từ chối? xử lý best-effort? cảnh báo? Không có chính sách → mỗi bên tự hiểu, mất mục đích của versioning. **Đề xuất:** quy tắc tương thích tường minh — CRM chấp nhận cùng major, bỏ qua field lạ (forward-compatible); major mới hơn danh mục biết → đưa vào DLQ + cảnh báo, không âm thầm bỏ.

## H. 🟡 Thiếu quy tắc cho `subscription_id` inbound không tồn tại

§2 (#4) chỉ xử lý trường hợp **thiếu** `subscription_id` (mồ côi). Chưa có quy tắc khi `subscription_id` **có nhưng CRM không biết** (sai id, tạo ngoài luồng, lệch dữ liệu). → **Đề xuất:** cách ly (quarantine) + cảnh báo ops, **không** tạo mirror ngầm.

## I. 🟡 Webhook FAILED terminal → mirror lỗi thời vĩnh viễn

§5.4: sau 5 lần → `FAILED`. Nếu tin đó là **chuyển trạng thái thật**, mirror **kẹt sai vĩnh viễn** cho tới khi có người replay. UC-INT-05 có replay, nhưng catalog **chưa nối** FAILED → cảnh báo ops → replay thành một đường bắt buộc. **Đề xuất:** mọi event **trạng thái** rơi vào `FAILED` phải **nổi cảnh báo** (khác `usage_synced` FAILED — chỉ mất một điểm dữ liệu); nêu liên kết tới replay.

## J. 🟡 Quản trị namespace `event_key` + lõi phải dispatch theo bảng

NT-1 và §3.2 gắn chặt với tiền tố `license.*` của EDR; §6.1 cho thấy C-Shield/AV dùng `instance.*`, `key.*`, `jwt.*`. Nếu lõi **match chuỗi** `license.*` để xử lý thì **không mở rộng** cho sản phẩm khác (vi phạm tinh thần "thêm product không sửa core"). **Đề xuất:** khẳng định lõi **dispatch hoàn toàn theo `inbound_event_mapping`** trong `PRODUCT_MODULE_CONFIG`, không hardcode tiền tố; định nghĩa quy ước namespace `event_key` cho tài liệu (dù mỗi product tự đặt).

## K. ⚪ Vệ sinh tài liệu

- Header còn *"Phiên bản 1.0 (Draft) · Ngày 14/07/2026"* trong khi nội dung đã qua nhiều vòng (16/07 và các sửa sau). → Cập nhật version/ngày, thêm changelog ngắn.
- Ký hiệu **✅ "đã chốt"** vẫn còn ở §3.4 và vài chỗ §6/§5 sau khi đã **mở lại** OQ-INT-01/08/10 — dễ gây hiểu nhầm mức độ chốt. Rà đồng bộ ký hiệu với trạng thái OQ thật.
- §5.3 còn *"(SG-4, chốt 16/07)"* — nếu chuẩn hoá bỏ tham chiếu ngày nội bộ thì gỡ luôn cho nhất quán.

## L. ⚪ `webhook_secret` số ít vs dual-secret

§5.3 khuyến nghị dual-secret rotation nhưng schema chỉ nhắc `runtime_config.webhook_secret` (số ít) + `secret_rotation_state`. Nên nói rõ trong thời gian ân hạn tồn tại **đồng thời 2 khoá** (current + previous) để không mất tin — tránh Dev hiểu là một field.

---

## Ưu tiên xử lý đề xuất

1. **Chốt ngay A + B** (Critical) — vì quyết định schema M-05 và tính đúng đắn dữ liệu mirror; nên đưa vào agenda buổi làm việc EDR cùng bộ metadata.
2. **C + D + E** (High) — C/D chốt với EDR; E là sửa tài liệu nội bộ, làm được ngay.
3. **F→J** (Medium) — bổ sung khi hoàn thiện hợp đồng trước Phase 3 (C-Shield), vì phần lớn liên quan đa-sản-phẩm.
4. **K + L** (Low) — vệ sinh, gộp vào lần cập nhật version kế tiếp.
