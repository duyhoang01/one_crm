# UC-CON-05 — Upload / Xóa File đính kèm Hợp đồng

> Module: M-02 Contract Management | Phiên bản: 1.1 | Ngày: 06/07/2026
> Trạng thái: Draft for Review

---

## 1. Thông tin chung

| Thuộc tính | Nội dung |
|---|---|
| **Mã Use Case** | UC-CON-05 |
| **Tên** | Upload / Xóa File đính kèm Hợp đồng |
| **Mô tả** | Sales quản lý file đính kèm (bản scan/chụp HĐ giấy, phụ lục...) gắn với 1 hợp đồng — bao gồm upload file mới và xóa mềm (soft delete) file đã đính kèm. Áp dụng tại 2 điểm chạm: (1) Chi tiết HĐ (UC-CON-03) — upload/xóa tức thời; (2) Form Tạo HĐ (UC-CON-02) — file staged cục bộ, ghi storage sau khi HĐ tạo thành công. |
| **Tác nhân** | Sales |
| **Tiền điều kiện** | Quyền `contract:update` (tại Chi tiết HĐ) hoặc `contract:create` (tại Form Tạo HĐ). HĐ tồn tại và `deletedAt IS NULL` (chỉ áp dụng cho luồng tại Chi tiết HĐ). |
| **Hậu điều kiện (Upload thành công)** | File status = `ACTIVE`, liên kết `contract_id`, lưu trên S3/MinIO theo convention BR-07. Audit log ghi. |
| **Hậu điều kiện (Xóa thành công)** | File status = `DELETED` (soft delete) — ẩn khỏi danh sách UI. Audit log ghi. |
| **Hậu điều kiện (Hủy)** | Không có thay đổi nào. |
| **Hậu điều kiện (Validate thất bại)** | Không có file nào được thêm hoặc xóa. |
| **Hậu điều kiện (Upload lỗi mạng)** | Không tạo attachment record, không ghi audit log. Tại Form Tạo HĐ: HĐ đã tạo không bị ảnh hưởng (không rollback). |
| **Trigger — Upload (Chi tiết HĐ)** | Nhấn "+ Đính kèm file" hoặc kéo thả vào dropzone tại panel "📎 Đính kèm". |
| **Trigger — Upload (Form Tạo HĐ)** | Kéo thả hoặc chọn file tại dropzone trong modal Tạo HĐ (AF-02 của UC-CON-02). |
| **Trigger — Xóa** | Nhấn "🗑️" trên file trong danh sách đính kèm. |
| **Liên kết** | UC-CON-02 (Form Tạo HĐ), UC-CON-03 (Chi tiết HĐ) |

### Business Rules

| Mã | Nội dung |
|---|---|
| **BR-01** | Định dạng file hợp lệ: PDF, DOCX, XLSX, JPG, PNG. |
| **BR-02** | Dung lượng tối đa: 10MB/file. |
| **BR-03** | Tối đa 15 file/HĐ — chỉ tính file có `status = ACTIVE`; file `DELETED` không tính vào giới hạn. |
| **BR-04** | Validate định dạng và dung lượng phía client trước khi submit. |
| **BR-05** | Xóa = soft delete (`status = DELETED`). Dữ liệu vẫn giữ trên storage, chỉ ẩn khỏi UI. Không có luồng khôi phục trong Phase 1. |
| **BR-06** | Audit log best-effort: nếu ghi thất bại, thao tác upload/xóa vẫn thành công (không rollback). |
| **BR-07** | Storage key convention: `contracts/{contract_id}/{uuid}-{filename}`. |
| **BR-08** | Tại Form Tạo HĐ: file chỉ staged cục bộ; ghi thật lên storage sau khi HĐ tạo thành công. |
| **BR-09** | Không phân biệt "chủ file" khi xóa — bất kỳ Sales có quyền truy cập HĐ đều có thể xóa. |
| **BR-10** | Không có cơ chế auto-retry ở tầng UI. Sales chủ động nhấn nút "Thử lại" để upload lại. |

---

## 2. Luồng nghiệp vụ

### 2.1 Luồng chính — Upload file tại Chi tiết HĐ

| Bước | Tác nhân | Hành động | Ghi chú |
|---|---|---|---|
| 1 | Sales | Mở panel "📎 Đính kèm", nhấn "+ Đính kèm file" hoặc kéo thả file vào dropzone. | — |
| 2 | System | Nhận file từ thao tác của Sales. | — |
| 3 | System | Validate client-side: định dạng (BR-01), dung lượng (BR-02), tổng file `ACTIVE + file mới ≤ 15` (BR-03). Nếu không hợp lệ → **EF-01**. | — |
| 4 | System | Upload file lên storage theo convention BR-07. Tạo attachment record. Nếu lỗi mạng/hệ thống → **EF-03**. | — |
| 5 | System | Ghi audit log (best-effort, BR-06). | — |
| 6 | System | Thêm file vào danh sách: icon ✓ xanh, tên file, dung lượng, thời gian upload, nút 🗑️. Toast "Đã đính kèm — {filename} đã được tải lên". | — |

### 2.2 Luồng phụ

#### AF-01 — Xóa file đính kèm tại Chi tiết HĐ

| Bước | Tác nhân | Hành động | Ghi chú |
|---|---|---|---|
| 1a | Sales | Nhấn "🗑️" trên file trong danh sách. | — |
| 1b | System | Hiển thị dialog xác nhận: tiêu đề "Xóa file đính kèm" + nội dung "Bạn có chắc chắn muốn xóa file {filename}? Hành động này không thể hoàn tác." | — |
| 1c | Sales | Nhấn "🗑️ Xóa" để xác nhận. Hoặc nhấn "Hủy" → **AF-04**. | — |
| 1d | System | Cập nhật `attachment.status = DELETED`. Ghi audit log (BR-06). Nếu lỗi server-side → **EF-02**. | Theo BR-05. |
| 1e | System | Ẩn file ngay khỏi danh sách. Toast "Đã xóa — {filename} thành công". | — |

#### AF-02 — Upload file trong Form Tạo HĐ

| Bước | Tác nhân | Hành động | Ghi chú |
|---|---|---|---|
| 2a | Sales | Kéo thả hoặc click chọn file trong dropzone tại Form Tạo HĐ. | — |
| 2b | System | Validate client-side. Nếu không hợp lệ → **EF-01**, icon ✕ đỏ + tooltip lý do (không chặn tiếp tục nhập form). | Theo BR-04. |
| 2c | System | Thêm file vào danh sách tạm: icon ✓ xanh, tên file, dung lượng, nút 🗑️ (xóa cục bộ). | Chưa gọi server, chưa có storage key. Theo BR-08. |
| 2d | System | Khi Sales nhấn "Tạo" và HĐ tạo thành công → upload các file hợp lệ đã staged lên storage, tạo attachment record cho từng file. Nếu lỗi mạng 1 file → **EF-03** (không rollback HĐ, file khác không ảnh hưởng). | — |

#### AF-03 — Bỏ file khỏi danh sách tạm (Form Tạo HĐ)

| Bước | Tác nhân | Hành động |
|---|---|---|
| 1 | Sales | Nhấn 🗑️ trên file trong danh sách tạm của Form Tạo HĐ. |
| 2 | System | Xóa file khỏi danh sách tạm ngay lập tức, không gọi server. |

#### AF-04 — Hủy xóa

| Bước | Tác nhân | Hành động |
|---|---|---|
| 1 | Sales | Nhấn "Hủy" trong dialog xác nhận xóa. |
| 2 | System | Đóng dialog. File vẫn còn trong danh sách. Không có thay đổi. |

### 2.3 Luồng ngoại lệ

#### EF-01 — Validate thất bại (client-side)

| Trường hợp | Thông báo lỗi |
|---|---|
| Định dạng không hợp lệ | "Định dạng không hợp lệ (.{EXT}) — chỉ chấp nhận PDF, DOCX, XLSX, JPG, PNG" |
| Vượt dung lượng 10MB | "Vượt giới hạn kích thước — file nặng X.XMB, tối đa 10MB" |
| Đã đạt 15 file ACTIVE | Toast: "Đã đạt tối đa 15 file/HĐ" |

> Tại Chi tiết HĐ: file không upload. Tại Form Tạo HĐ: file không thêm vào danh sách tạm, không chặn submit form.

#### EF-02 — Lỗi xóa server-side (race condition)

| Bước | Hành động |
|---|---|
| 1 | Hiển thị toast: "Không thể xóa — file có thể đã được xóa trước đó". |
| 2 | Refresh danh sách file tự động. |

#### EF-03 — Lỗi upload mạng/hệ thống

| Điểm chạm | Hành động |
|---|---|
| **Tại Chi tiết HĐ** | Hiển thị thông báo: "Upload thất bại — Lỗi kết nối hoặc hệ thống lưu trữ đang gián đoạn. Vui lòng thử lại." + nút "Thử lại". File không xuất hiện trong danh sách. Nhấn "Thử lại" → gọi lại upload đúng file mà không cần Sales chọn lại (BR-10). |
| **Tại Form Tạo HĐ** | HĐ không rollback. Thông báo riêng cho từng file lỗi: "HĐ {code} đã tạo thành công. {filename} chưa upload được — vào Chi tiết để đính kèm lại." |

---

## 3. Mô tả giao diện

### 3.1 Tổng quan

UC-CON-05 tương tác qua 2 bề mặt:
1. **Panel "📎 Đính kèm"** tại màn hình Chi tiết HĐ (UC-CON-03): upload và xóa tức thời.
2. **Dropzone trong modal Tạo HĐ** (UC-CON-02): staged upload, ghi storage sau khi HĐ tạo thành công.

### 3.2 Mô tả component

#### Panel "📎 Đính kèm" tại Chi tiết HĐ

| Component | Mô tả |
|---|---|
| Header collapsible | Hiển thị tên "Đính kèm" + số lượng file hiện có (chỉ tính `ACTIVE`). Có thể thu gọn/mở rộng. |
| Dropzone | Kéo thả hoặc click để chọn file. Hiển thị gợi ý: định dạng chấp nhận, giới hạn 10MB/file, tối đa 15 file. |
| Nút "+ Đính kèm file" | Secondary button. Trigger luồng upload chính. |
| Danh sách file | Mỗi file hiển thị: icon loại file, tên file, dung lượng, ngày upload, tên người upload, nút ⬇ "Tải về", nút 🗑️ "Xóa". |

#### Danh sách file — Trạng thái

| Trạng thái | Icon | Mô tả |
|---|---|---|
| Upload thành công | ✓ xanh | File hợp lệ đã lưu trên storage. |
| Upload thất bại | ✕ đỏ + tooltip | Lý do thất bại validate. File không ghi server. |
| Đang upload | Loading spinner | Upload đang tiến hành. |

#### Dialog xác nhận xóa (AF-01)

| Component | Mô tả |
|---|---|
| Tiêu đề | "Xóa file đính kèm" |
| Nội dung | "Bạn có chắc chắn muốn xóa file {filename}? Hành động này không thể hoàn tác." |
| Nút "Hủy" | Ghost button — thực hiện AF-04. |
| Nút "🗑️ Xóa" | Danger button — xác nhận xóa AF-01. |

#### Dropzone trong Form Tạo HĐ (UC-CON-02)

| Component | Mô tả |
|---|---|
| Dropzone | Kéo thả hoặc click chọn file. Hiển thị định dạng + giới hạn. |
| Danh sách file tạm | Mỗi file: icon loại file, tên file, dung lượng, status icon (✓ / ✕), badge "NEW", ô mô tả (optional), nút 🗑️ (xóa tạm cục bộ). |

---

## 4. Acceptance Criteria

### Nhóm 1: Upload tại Chi tiết HĐ

| Mã | Given | When | Then |
|---|---|---|---|
| AC-CON-05-01 | HĐ đang có 3 file ACTIVE. | Kéo thả PDF 5MB hợp lệ vào dropzone. | Upload thành công. File xuất hiện trong danh sách với icon ✓. Toast "Đã đính kèm — {filename}". |
| AC-CON-05-02 | Sales click "+ Đính kèm file", chọn DOCX 2MB. | Chọn file. | Upload thành công. File xuất hiện trong danh sách. |
| AC-CON-05-03 | Upload thành công. | — | Audit log ghi: actor, timestamp, tên file, `action = UPLOAD`. |
| AC-CON-05-04 | Upload thành công. | — | Storage key của file đúng convention: `contracts/{contract_id}/{uuid}-{filename}`. |

### Nhóm 2: Validate — Định dạng và dung lượng

| Mã | Given | When | Then |
|---|---|---|---|
| AC-CON-05-05 | Sales chọn file .exe. | Chọn file. | Lỗi: "Định dạng không hợp lệ (.EXE) — chỉ chấp nhận PDF, DOCX, XLSX, JPG, PNG". File không upload. |
| AC-CON-05-06 | Sales chọn file PDF 25MB. | Chọn file. | Lỗi: "Vượt giới hạn kích thước — file nặng 25.0MB, tối đa 10MB". File không upload. |
| AC-CON-05-07 | HĐ đã có 15 file ACTIVE. | Upload thêm 1 file. | Toast "Đã đạt tối đa 15 file/HĐ". File không được thêm. |
| AC-CON-05-08 | HĐ có 14 file ACTIVE + 3 file DELETED. | Upload 1 file hợp lệ. | Upload thành công — file DELETED không tính vào giới hạn 15 (BR-03). |

### Nhóm 3: Xóa file đính kèm

| Mã | Given | When | Then |
|---|---|---|---|
| AC-CON-05-09 | Sales nhấn 🗑️ trên file, xác nhận "🗑️ Xóa". | — | File `status = DELETED`, ẩn khỏi danh sách. Toast "Đã xóa {filename} thành công". Audit log ghi `action = DELETE`. |
| AC-CON-05-10 | File đã bị xóa mềm. | Sales mở lại Chi tiết HĐ. | File không xuất hiện trong danh sách. |
| AC-CON-05-11 | File "A" do Sales X upload. | Sales Y nhấn 🗑️ trên file "A". | Xóa thành công — không phân biệt chủ file (BR-09). |

### Nhóm 4: Upload trong Form Tạo HĐ (staged)

| Mã | Given | When | Then |
|---|---|---|---|
| AC-CON-05-12 | Sales ở Form Tạo HĐ (chưa lưu). | Kéo thả PDF hợp lệ vào dropzone. | File thêm vào danh sách tạm với icon ✓. Chưa gọi server, chưa có storage key. |
| AC-CON-05-13 | Đã staged 1 file hợp lệ trong Form Tạo. | Nhấn "Tạo", HĐ tạo thành công. | File upload thật lên storage, tạo attachment record. Panel "Đính kèm" tại UC-CON-03 hiển thị file. |
| AC-CON-05-14 | Đã staged 1 file .exe (không hợp lệ). | Nhấn "Tạo". | HĐ tạo thành công. File .exe không upload, không xuất hiện tại Chi tiết HĐ. |
| AC-CON-05-16 | Có 1 file trong danh sách tạm của Form Tạo (chưa lưu). | Sales nhấn 🗑️ trên file đó. | File xóa khỏi danh sách tạm ngay, không gọi server. |

### Nhóm 5: Hủy và dialog

| Mã | Given | When | Then |
|---|---|---|---|
| AC-CON-05-15 | Dialog xác nhận xóa đang mở. | Nhấn "Hủy". | Dialog đóng. File vẫn còn trong danh sách ACTIVE. |

### Nhóm 6: Lỗi mạng và retry

| Mã | Given | When | Then |
|---|---|---|---|
| AC-CON-05-17 | Storage đang gián đoạn. | Upload PDF hợp lệ tại Chi tiết HĐ. | Lỗi: "Upload thất bại — Lỗi kết nối hoặc hệ thống lưu trữ đang gián đoạn. Vui lòng thử lại." + nút "Thử lại". File không xuất hiện trong danh sách. |
| AC-CON-05-18 | Vừa gặp EF-03, storage đã khôi phục. | Nhấn "Thử lại". | Upload thành công. Không cần chọn lại file. |
| AC-CON-05-19 | Staged 2 file trong Form Tạo; 1 file lỗi mạng khi upload sau khi nhấn "Tạo". | HĐ tạo thành công. | HĐ không rollback. File OK xuất hiện tại Chi tiết. Thông báo riêng cho file lỗi: "HĐ {code} đã tạo thành công. {filename} chưa upload được — vào Chi tiết để đính kèm lại." |

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
- ✅ Mô tả UI đủ chi tiết
- ✅ Component states đã mô tả
- ✅ Toast/error messages đã định nghĩa
