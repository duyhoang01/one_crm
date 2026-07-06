# UC-CUS-05 — Xóa Khách hàng

> Module: M-01 Customer Management | Phiên bản: 1.0 | Ngày: 06/07/2026
> Trạng thái: Draft for Review

---

## 1. Thông tin chung

| Mục             | Nội dung                                                                                                                                                 |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Use Case ID** | UC-CUS-05                                                                                                                                                |
| **Tên**         | Xóa Khách hàng                                                                                                                                           |
| **Mô tả**       | Sales xóa một hồ sơ Customer khỏi hệ thống. Chỉ cho phép xóa KH chưa phát sinh hợp đồng. Thực hiện **soft delete** (đánh dấu `deleted_at`).            |
| **Tác nhân**    | Sales                                                                                                                                                    |
| **Tiền điều kiện** | Đã đăng nhập. Có quyền `customer:delete`. Customer record tồn tại (`deleted_at IS NULL`). `contracts.length = 0`.                                    |
| **Hậu điều kiện** | **(Success)** Customer record được đánh dấu `deleted_at` (không xóa vật lý). Audit log ghi nhận actor, timestamp, snapshot thông tin KH. **(Failure)** Không có record nào bị xóa. |
| **Ngoại lệ nghiệp vụ** | KH đã có ít nhất 1 hợp đồng (bất kể status: ACTIVE, EXPIRED, v.v.) → BE reject.                                                                |
| **Use case liên quan** | UC-CUS-01 (Danh sách), UC-CUS-03 (Customer 360°)                                                                                                 |

### Business Rules

| ID      | Nội dung                                                                                                                                                              |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **BR-01** | Chỉ xóa được khi `contracts.length = 0`. **Kể cả hợp đồng đã EXPIRED** cũng chặn xóa — "đã phát sinh dữ liệu" áp dụng cho mọi trạng thái hợp đồng.              |
| **BR-02** | **Soft delete** — hệ thống đánh dấu trường `deleted_at = NOW()`, **không xóa vật lý** bản ghi khỏi DB. **Không có** luồng khôi phục (restore) qua UI.             |
| **BR-03** | Action xóa **disabled ngay khi render** — không đợi Sales click rồi mới báo lỗi. Icon 🗑️ tự động disabled khi `contracts.length ≥ 1`.                            |
| **BR-04** | **Audit log bắt buộc** — ghi snapshot: tên, loại, MST, email, actor, timestamp. Nếu không ghi được thì **rollback**, không đánh dấu `deleted_at`.                  |

---

## 2. Luồng nghiệp vụ

### 2.1 Luồng chính (Happy Path)

| Bước | Tác nhân | Hành động                                                                                                                                                                         |
| ---- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | System   | Khi render Danh sách hoặc Customer 360°, kiểm tra `contracts.length` của từng KH để set trạng thái icon/nút xóa: **active** (0 hợp đồng) hoặc **disabled** (≥ 1 hợp đồng).     |
| 2    | Sales    | Nhấn icon **🗑️** trên dòng KH (tại Danh sách) **HOẶC** nút **"🗑️ Xóa"** trên Profile Header (tại Customer 360°). Action chỉ khả dụng khi `contracts.length = 0`.               |
| 3    | System   | Mở modal **"Xóa Khách hàng"** với nội dung xác nhận, info box thông tin KH, và alert cảnh báo.                                                                                    |
| 4    | Sales    | Nhấn nút **"Xóa"** (đỏ) → bước 5. Hoặc nhấn **"Hủy"** / **X** → AF-01.                                                                                                           |
| 5    | System   | **Re-check ngay trước khi xóa**: kiểm tra lại `contracts.length = 0` (phòng race condition). → **[Vẫn còn 0]** bước 6 · → **[Đã phát sinh HĐ]** EF-01.                           |
| 6    | System   | Ghi **Audit Log** với snapshot: tên KH, loại, MST (nếu có), email (nếu có), actor (Sales hiện tại), timestamp.                                                                   |
| 7    | System   | Đánh dấu `deleted_at = NOW()` trên Customer record. KH không còn hiển thị trên bất kỳ UI nào.                                                                                    |
| 8    | System   | Đóng modal. Toast: _"Đã xóa — [Tên KH] đã bị xóa khỏi hệ thống"_. Cập nhật UI theo điểm xuất phát (xem bước 8a / 8b).                                                          |
|      |          | **8a** (từ Danh sách): Xóa dòng KH khỏi bảng ngay, không reload trang.                                                                                                           |
|      |          | **8b** (từ Customer 360°): Điều hướng về trang Danh sách (không thể ở lại 360° của KH đã xóa).                                                                                   |

### 2.2 Luồng phụ

#### AF-01 — Hủy thao tác xóa

| Bước | Tác nhân | Hành động                                                                                       |
| ---- | -------- | ----------------------------------------------------------------------------------------------- |
| 1    | Sales    | Nhấn nút **"Hủy"** hoặc icon **X** (close modal).                                               |
| 2    | System   | Đóng modal **ngay lập tức**. **Không** hiển thị dialog xác nhận bổ sung.                        |
| 3    | System   | Không thay đổi bất kỳ dữ liệu nào. Không ghi Audit log.                                         |

### 2.3 Luồng ngoại lệ

#### EF-01 — Race condition: KH phát sinh HĐ trong lúc modal đang mở

| Bước | Tác nhân | Hành động                                                                                                                              |
| ---- | -------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | System   | Re-check tại bước 5 phát hiện `contracts.length > 0` (có HĐ mới được tạo trong khoảng thời gian modal đang mở).                       |
| 2    | System   | **Không** đánh dấu `deleted_at`. Đóng modal.                                                                                           |
| 3    | System   | Toast lỗi: _"Không thể xóa — khách hàng vừa phát sinh hợp đồng."_                                                                      |
| 4    | System   | Sales cần **refresh trang** để thấy icon 🗑️ đã chuyển sang trạng thái disabled.                                                       |

#### EF-02 — Bypass UI qua API trực tiếp

| Bước | Tác nhân | Hành động                                                                                                                         |
| ---- | -------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 1    | External | Sales hoặc bên ngoài gọi trực tiếp API `DELETE /customers/{id}` cho KH đã có hợp đồng.                                           |
| 2    | System   | Backend phát hiện `contracts.length > 0`. Từ chối request với **HTTP 409 Conflict**.                                              |
| 3    | System   | Response body: `{ "error": "Khách hàng đã có hợp đồng, không thể xóa." }`. Record không bị xóa.                                  |

---

## 3. Mô tả giao diện

### 3.1 Icon / Nút Xóa — Trạng thái

| Vị trí          | Điều kiện                              | Trạng thái                                                                                                                           |
| ---------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Bảng Danh sách  | `contracts.length = 0`                 | **Active** — màu đỏ (`color: var(--danger)`), `cursor: pointer`. Không có tooltip.                                                  |
| Bảng Danh sách  | `contracts.length ≥ 1`                 | **Disabled** — `opacity: 0.5`, `cursor: not-allowed`. Tooltip: _"Chỉ có thể xóa khách hàng chưa phát sinh dữ liệu."_               |
| Customer 360°   | `contracts.length = 0`                 | Nút **"🗑️ Xóa"** active — màu đỏ, danger variant.                                                                                  |
| Customer 360°   | `contracts.length ≥ 1`                 | Nút **"🗑️ Xóa"** disabled — `opacity: 0.5`, `cursor: not-allowed`. Tooltip tương tự.                                               |

---

### 3.2 Modal "Xóa Khách hàng"

Modal xuất hiện giữa màn hình, overlay mờ phía sau. Title: **"Xóa Khách hàng"** (đỏ hoặc xám đậm tùy design system).

#### Nội dung Modal

| Section              | Nội dung                                                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Câu hỏi xác nhận** | _"Bạn có chắc chắn muốn xóa khách hàng này?"_ — căn giữa, in đậm.                                                                         |
| **Info box**         | Nền xám nhạt, border radius. Liệt kê: Tên KH / Loại / MST (chỉ nếu có) / Email (chỉ nếu có). **Field null không hiển thị dòng** (không dùng dash). |
| **Alert Warning**    | Icon ⚠️ + _"Khách hàng sẽ bị xóa vĩnh viễn và không thể khôi phục."_ Nền vàng nhạt (`background: var(--warning-light)`).                  |

#### Footer Modal

| Nút       | Vị trí | Loại               | Hành vi                                                                    |
| --------- | ------ | ------------------ | -------------------------------------------------------------------------- |
| **Xóa**   | Trái   | Danger (đỏ)        | Submit xóa. Disable + spinner sau click (ngăn double-submit).              |
| **Hủy**   | Phải   | Ghost              | Đóng modal ngay, không hỏi xác nhận (AF-01).                               |

---

### 3.3 Toast Messages

| Tình huống                        | Toast                                                                        | Loại    |
| --------------------------------- | ---------------------------------------------------------------------------- | ------- |
| Xóa thành công                    | _"Đã xóa — [Tên KH] đã bị xóa khỏi hệ thống."_                             | Success (xanh lá) |
| Race condition (EF-01)            | _"Không thể xóa — khách hàng vừa phát sinh hợp đồng."_                      | Error (đỏ) |

---

### 3.4 Component States

| Component              | State          | Mô tả                                                                 |
| ---------------------- | -------------- | --------------------------------------------------------------------- |
| Icon 🗑️ (Danh sách)   | Active         | Màu đỏ, cursor pointer                                                |
| Icon 🗑️ (Danh sách)   | Disabled       | Opacity 0.5, cursor not-allowed, tooltip                              |
| Nút "🗑️ Xóa" (360°)  | Active         | Danger variant, màu đỏ                                                |
| Nút "🗑️ Xóa" (360°)  | Disabled       | Opacity 0.5, cursor not-allowed, tooltip                              |
| Modal                  | Open           | Overlay mờ, info box + alert đầy đủ                                   |
| Nút "Xóa" (modal)      | Default        | Danger — đỏ, active                                                   |
| Nút "Xóa" (modal)      | Loading        | Disable + spinner, ngăn double-click                                  |
| Toast "Đã xóa"         | Show           | Xanh lá, auto-dismiss                                                 |
| Toast lỗi race         | Show           | Đỏ, auto-dismiss hoặc dismiss thủ công                                |
| Dòng bảng (Danh sách)  | Sau xóa        | Dòng biến mất khỏi bảng ngay (optimistic update hoặc re-fetch)        |

---

## 4. Acceptance Criteria

| AC ID          | Given                                                                                                                                 | When                                                                        | Then                                                                                                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-CUS-05-01   | KH "Lê Thị C" (B2C), `contracts.length = 0`                                                                                          | Sales nhấn icon xóa, xác nhận trong modal                                   | Record bị soft delete (`deleted_at` được set). Toast _"Đã xóa"_ xuất hiện. Audit log ghi snapshot KH (tên, loại, email, actor, timestamp).                       |
| AC-CUS-05-02   | Sales thực hiện xóa KH "Lê Thị C" từ trang Danh sách (AC-05-01 thành công)                                                          | Xóa thành công                                                               | Dòng KH "Lê Thị C" **biến mất khỏi bảng ngay**, không cần reload trang.                                                                                          |
| AC-CUS-05-03   | Sales đang xem Customer 360° của KH chưa có HĐ, xóa từ Profile Hero                                                                  | Xóa thành công                                                               | Modal đóng. Điều hướng **về trang Danh sách**. Toast _"Đã xóa"_ xuất hiện.                                                                                       |
| AC-CUS-05-04   | KH "FPT Software" có 1 HĐ `status = ACTIVE`                                                                                          | Sales xem trang Danh sách                                                    | Icon xóa hiển thị **disabled** (opacity 0.5, cursor not-allowed). Không thể click.                                                                               |
| AC-CUS-05-05   | KH có 1 HĐ `status = EXPIRED`, không còn HĐ nào khác                                                                                 | Sales xem trang Danh sách                                                    | Icon xóa **vẫn disabled** — EXPIRED vẫn tính là "đã phát sinh dữ liệu" (BR-01).                                                                                  |
| AC-CUS-05-06   | KH có HĐ (icon xóa ở trạng thái disabled)                                                                                            | Sales hover chuột vào icon xóa                                               | Tooltip xuất hiện: _"Chỉ có thể xóa khách hàng chưa phát sinh dữ liệu."_                                                                                         |
| AC-CUS-05-07   | KH đã có HĐ (bất kỳ status)                                                                                                           | Sales gọi API `DELETE /customers/{id}` trực tiếp (bypass UI)                | Backend trả về **HTTP 409 Conflict** với message `"Khách hàng đã có hợp đồng, không thể xóa."` Record không bị xóa.                                              |
| AC-CUS-05-08   | Modal xóa đang mở cho KH chưa có HĐ                                                                                                   | Sales nhấn **"Hủy"** hoặc icon **X**                                         | Modal đóng ngay, **không** có dialog xác nhận thêm. Record không bị xóa. Không tạo Audit log.                                                                    |
| AC-CUS-05-09   | Sales mở modal xóa. Trong lúc modal đang mở, Sales khác (hoặc luồng khác) tạo HĐ cho cùng KH (race condition)                        | Sales nhấn **"Xóa"** để xác nhận                                             | BE re-check phát hiện `contracts.length > 0`. **Từ chối xóa**. Modal đóng. Toast lỗi: _"Không thể xóa — khách hàng vừa phát sinh hợp đồng."_ Record không bị xóa. |

---

## 5. Review Checklist

> Claude tự review — đánh dấu ✅/❌ trước khi submit cho BA review.

### Nghiệp vụ
- ✅ Luồng chính bao phủ happy path
- ✅ Luồng phụ đã định nghĩa
- ✅ Luồng ngoại lệ đã xử lý
- ✅ BR đã định nghĩa rõ
- ✅ AC bao phủ các trường hợp quan trọng
- ✅ Nội dung bám sát PRD v2.3

### Giao diện
- ✅ Wireframe hoặc mô tả UI đủ chi tiết
- ✅ Component states (default/disabled/loading) đã mô tả
- ✅ Toast/error messages đã định nghĩa
