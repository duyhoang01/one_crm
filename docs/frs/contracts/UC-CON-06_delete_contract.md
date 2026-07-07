# UC-CON-06 — Xóa Hợp đồng

> Module: M-02 Contract Management | Phiên bản: 1.1 | Ngày: 07/07/2026
> Trạng thái: Draft for Review

---

## 1. Thông tin chung

| Thuộc tính | Nội dung |
|---|---|
| **Tên chức năng** | Xóa Hợp đồng |
| **UC ID** | UC-CON-06 |
| **Mô tả** | Sales/Manager xóa một hợp đồng khỏi hệ thống bằng cách soft delete (set `deleted_at`). Chỉ được phép xóa khi hợp đồng chưa có Subscription nào. Thao tác yêu cầu nhập lý do xóa, xác nhận và ghi Audit Log bắt buộc. |
| **Tác nhân** | Sales, Manager |
| **Tiền điều kiện** | Đã đăng nhập và có quyền `contract:delete`. Hợp đồng tồn tại trong hệ thống (`deleted_at IS NULL`). |
| **Hậu điều kiện** | (Success) Hợp đồng được đánh dấu `deleted_at = now()`, không hiển thị trong hệ thống. Audit log ghi nhận actor, timestamp, mã HĐ, lý do xóa. Actor redirect về Danh sách Hợp đồng với toast thành công. (Failure) Không có dữ liệu nào bị thay đổi. Hợp đồng vẫn tồn tại nguyên vẹn. |
| **Ngoại lệ** | Hợp đồng có Subscription (bất kể trạng thái) → chặn xóa, nút 🗑️ disabled. |
| **Điểm vào** | (a) Nhấn icon 🗑️ trên row trong Danh sách (UC-CON-01). (b) Nhấn nút "🗑️ Xóa" trong action bar của Chi tiết Hợp đồng (UC-CON-03). |

### Quy tắc nghiệp vụ

| BR ID | Nội dung |
|---|---|
| BR-01 | Chỉ được xóa khi `subs.length = 0`. Kể cả subscription đã EXPIRED/REVOKED cũng chặn xóa — một khi HĐ đã phát sinh sub, không thể xóa. |
| BR-02 | Nút 🗑️ bị disabled ngay khi render nếu `subs.length > 0` — không đợi người dùng nhấn rồi mới báo lỗi. Tooltip: *"Đã có Subscription, không thể xóa"*. |
| BR-03 | Audit log bắt buộc — ghi nhận actor, timestamp, mã HĐ, loại HĐ, tên KH, **lý do xóa**. Nếu không ghi được thì rollback toàn bộ, không thực hiện soft delete. |
| BR-04 | Xóa là **soft delete** — set `contract.deleted_at = now()`, `contract.deleted_by = actor_id`, `contract.delete_reason = {lý do}`. Record vẫn tồn tại trong DB, không hiển thị trong UI. Không có luồng khôi phục qua UI (chỉ admin DB). |
| BR-05 | Field "Lý do xóa" là bắt buộc — nút "🗑️ Xóa" trong modal disabled cho đến khi field được điền. |

### Data model — Các field bổ sung cho soft delete

| Field | Kiểu | Nullable | Mô tả |
|---|---|---|---|
| `deleted_at` | timestamp | ✅ | NULL = HĐ đang hoạt động. Không null = đã xóa. |
| `deleted_by` | FK (user_id) | ✅ | Actor thực hiện xóa. |
| `delete_reason` | text | ✅ | Lý do xóa do người dùng nhập. |

---

## 2. Luồng nghiệp vụ

### 2.1 Luồng chính

| Bước | Actor | Hành động / Phản hồi |
|---|---|---|
| **1** | System | Tại Danh sách (UC-CON-01) hoặc Chi tiết (UC-CON-03), kiểm tra `subs.length` để set trạng thái nút 🗑️: disabled khi `subs.length > 0`, active khi `subs.length = 0`. |
| **2** | Sales/Manager | Nhấn icon 🗑️ (Danh sách) hoặc nút "🗑️ Xóa" (Chi tiết) — chỉ khả dụng khi `subs.length = 0`. |
| **3** | System | Mở modal xác nhận xóa. Hiển thị: thông tin tóm tắt HĐ (Mã HĐ, Tên KH, Loại HĐ, Ngày tạo), cảnh báo không thể khôi phục qua UI, field **"Lý do xóa \*"**. |
| **4** | Sales/Manager | Nhập lý do xóa vào textarea. Nút "🗑️ Xóa" active sau khi có nội dung (BR-05). |
| **5** | Sales/Manager | Nhấn **"🗑️ Xóa"** → tiếp bước 6; hoặc nhấn **"Hủy"** / **"✕"** / **ESC** → AF-01. |
| **6** | System | Re-check `subs.length = 0` ngay trước khi xóa (phòng race condition). |
| **6a** | System | **[Vẫn còn 0 sub]** → tiếp bước 7. **[Đã phát sinh sub giữa lúc modal mở]** → EF-01. |
| **7** | System | Ghi Audit Log (actor, timestamp, mã HĐ, loại HĐ, tên KH, lý do xóa). |
| **8** | System | Soft delete: set `deleted_at = now()`, `deleted_by = actor_id`, `delete_reason = {lý do}` (BR-04). |
| **9** | System | Đóng modal. Redirect về Danh sách Hợp đồng (UC-CON-01). Hiển thị toast: *"Đã xóa hợp đồng {mã HĐ}"*. |

### 2.2 Luồng phụ

**[AF-01: Hủy xóa]** — kích hoạt tại bước 5 khi người dùng không xác nhận.

| Bước | Actor | Hành động / Phản hồi |
|---|---|---|
| **5a** | Sales/Manager | Nhấn **"Hủy"** hoặc icon **"✕"** hoặc nhấn phím **ESC**. |
| **5b** | System | Đóng modal. Không thay đổi dữ liệu. Giữ nguyên trang hiện tại (Danh sách hoặc Chi tiết). |

### 2.3 Luồng ngoại lệ

**[EF-01: Race condition — phát sinh sub giữa lúc modal mở]** — kích hoạt tại bước 6a.

| Bước | Actor | Hành động / Phản hồi |
|---|---|---|
| **6b** | System | Đóng modal. Hiển thị toast lỗi: *"Không thể xóa — hợp đồng vừa có Subscription mới."* Không thay đổi dữ liệu. |
| → | — | Nút 🗑️ ở UI tự động chuyển sang disabled (UI re-sync khi page refresh hoặc next render). |

**[EF-02: Lỗi hệ thống khi xóa (ghi audit log hoặc DB thất bại)]** — kích hoạt tại bước 7 hoặc 8.

| Bước | Actor | Hành động / Phản hồi |
|---|---|---|
| **7a** | System | Rollback toàn bộ (BR-03). Hiển thị toast lỗi: *"Xóa thất bại. Vui lòng thử lại."* Đóng modal. Hợp đồng vẫn tồn tại nguyên vẹn. |

---

## 3. Mô tả giao diện

### 3.1 Modal xác nhận xóa

![Demo — Modal xác nhận xóa Hợp đồng](../../assets/M-02_contracts/UC-CON-06_screen_modal.png)

### 3.2 Các thành phần giao diện

| # | Thành phần | Loại | Mô tả |
|---|---|---|---|
| 1 | Tiêu đề modal | Heading | *"Bạn có chắc chắn muốn xóa hợp đồng này?"* — căn giữa, font lớn, màu navy. |
| 2 | Info box | Read-only card | Tóm tắt HĐ: `• Mã HĐ: {code}` · `• Khách hàng: {customerName}` · `• Loại: {type}` · `• Ngày tạo: {createdAt}`. Background `#F9FAFB`, border `var(--border)`. |
| 3 | Cảnh báo | Alert (warn) | Icon ⚠️. Text: *"Hợp đồng sẽ bị xóa vĩnh viễn và không thể khôi phục."* Background vàng nhạt. |
| 4 | Field "Lý do xóa \*" | Textarea (required) | Placeholder: *"Nhập lý do xóa hợp đồng..."* 3 rows. Bắt buộc — nút Xóa disabled khi field trống (BR-05). |
| 5 | Nút "🗑️ Xóa" | Button (Danger) | Màu đỏ (`btn-danger`). **Disabled** khi field Lý do trống; **active** khi đã điền. Sau khi nhấn: loading state, disabled để ngăn double-submit. |
| 6 | Nút "Hủy" | Button (Ghost) | Đóng modal, không thay đổi dữ liệu. |
| 7 | Nút "✕" đóng | Icon Button | Header modal, hành vi giống "Hủy". |
| 8 | Toast thành công | Toast (Success) | *"Đã xóa hợp đồng {mã HĐ}"*. Hiển thị sau bước 9. |
| 9 | Toast lỗi race condition | Toast (Error) | *"Không thể xóa — hợp đồng vừa có Subscription mới."* |
| 10 | Toast lỗi hệ thống | Toast (Error) | *"Xóa thất bại. Vui lòng thử lại."* |

### 3.3 Trạng thái nút 🗑️ Xóa

| Điều kiện | Trạng thái | Tooltip khi hover |
|---|---|---|
| `subs.length = 0` | Active — màu đỏ, click được | Không có tooltip |
| `subs.length ≥ 1` (bất kỳ status nào) | Disabled — opacity thấp, cursor not-allowed | *"Đã có Subscription, không thể xóa"* |

Áp dụng đồng nhất ở 2 vị trí: cột Thao tác trong Danh sách (UC-CON-01) và action bar trong Chi tiết (UC-CON-03).

---

## 4. Acceptance Criteria

### Nhóm 1: Xóa thành công

| AC ID | Given | When | Then |
|---|---|---|---|
| AC-CON-06-01 | HĐ "HD-CMC-2026-DEMO" (subs.length = 0) | Sales nhập lý do, nhấn 🗑️ Xóa | `deleted_at`, `deleted_by`, `delete_reason` được set. HĐ không xuất hiện trong Danh sách. Redirect về Danh sách. Toast *"Đã xóa hợp đồng HD-CMC-2026-DEMO"*. Audit log có bản ghi với actor, timestamp, lý do. |
| AC-CON-06-02 | Sales xóa HĐ từ Danh sách | Xóa thành công | Row HĐ biến mất khỏi bảng ngay, không cần reload trang. |
| AC-CON-06-03 | Sales xóa HĐ từ trang Chi tiết (UC-CON-03) | Xóa thành công | Modal đóng, redirect về Danh sách. |

### Nhóm 2: Chặn xóa khi đã có Subscription

| AC ID | Given | When | Then |
|---|---|---|---|
| AC-CON-06-04 | HĐ có 2 sub ACTIVE | Sales xem Danh sách | Nút 🗑️ disabled, không click được. |
| AC-CON-06-05 | HĐ có 1 sub ACTIVE và 1 sub EXPIRED | Sales xem Danh sách | Nút 🗑️ vẫn disabled — bất kỳ sub nào cũng chặn. |
| AC-CON-06-06 | HĐ có 1 sub REVOKED | Sales xem Danh sách | Nút 🗑️ vẫn disabled — REVOKED vẫn tính là đã phát sinh sub. |
| AC-CON-06-07 | HĐ subs.length > 0 | Sales hover vào nút 🗑️ disabled | Tooltip: *"Đã có Subscription, không thể xóa"*. |

### Nhóm 3: Lý do xóa bắt buộc

| AC ID | Given | When | Then |
|---|---|---|---|
| AC-CON-06-08 | Modal xóa đang mở, field Lý do trống | Sales xem modal | Nút "🗑️ Xóa" disabled. |
| AC-CON-06-09 | Modal xóa đang mở | Sales nhập lý do vào textarea | Nút "🗑️ Xóa" chuyển sang active. |
| AC-CON-06-10 | Sales xóa thành công | | `delete_reason` được lưu vào contract record và audit log. |

### Nhóm 4: Hủy thao tác

| AC ID | Given | When | Then |
|---|---|---|---|
| AC-CON-06-11 | Modal xóa đang mở | Sales nhấn "Hủy" | Modal đóng. HĐ không thay đổi. |
| AC-CON-06-12 | Modal xóa đang mở | Sales nhấn phím ESC | Modal đóng. Không xóa. |
| AC-CON-06-13 | Modal xóa đang mở | Sales nhấn "✕" | Modal đóng. Không xóa. |

### Nhóm 5: Race condition

| AC ID | Given | When | Then |
|---|---|---|---|
| AC-CON-06-14 | Sales mở modal xóa cho HĐ subs=0; trong lúc modal mở, user khác tạo sub mới cho cùng HĐ | Sales nhấn "🗑️ Xóa" | BE re-check phát hiện subs.length > 0, từ chối xóa. Toast *"Không thể xóa — hợp đồng vừa có Subscription mới."* Modal đóng, record không thay đổi. |

### Nhóm 6: Lỗi hệ thống

| AC ID | Given | When | Then |
|---|---|---|---|
| AC-CON-06-15 | DB hoặc audit log service gặp lỗi khi xóa | Sales xác nhận xóa | Rollback, toast *"Xóa thất bại. Vui lòng thử lại."* HĐ vẫn tồn tại nguyên vẹn (`deleted_at` vẫn NULL). |

---

## 5. Lịch sử thay đổi

| Phiên bản | Ngày | Người cập nhật | Nội dung |
|---|---|---|---|
| 1.0 | 06/07/2026 | Claude (AI) | Tạo mới — bóc tách từ PRD v2.3. |
| 1.1 | 07/07/2026 | Claude (AI) | Giải quyết OQ-01/OQ-02/OQ-03: đổi sang soft delete, bổ sung data model (`deleted_at`, `deleted_by`, `delete_reason`), thêm field "Lý do xóa \*" bắt buộc trong modal, bỏ wireframe text thay bằng screenshot demo, cập nhật AC theo thay đổi. |

### Quyết định đã chốt

| # | Nội dung | Quyết định |
|---|---|---|
| OQ-01 | Hard delete hay soft delete? | **Soft delete** — set `deleted_at`, `deleted_by`, `delete_reason`. Record giữ trong DB, không hiển thị UI. Không có luồng khôi phục qua UI (admin DB only). |
| OQ-02 | File đính kèm sau khi xóa HĐ? | **Giữ liên kết**, không xóa ngay. Phase 3 sẽ implement scheduled job xóa file vĩnh viễn sau 3 tháng kể từ `contract.deleted_at`. |
| OQ-03 | UC-CON-06 đúng không hay là UC-CON-05? | Đã thống nhất với BA: UC-CON-06 là Xóa HĐ. Lỗi đánh số trong PRD v2.3 đã được ghi nhận. |
