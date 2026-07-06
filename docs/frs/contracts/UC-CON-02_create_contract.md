# UC-CON-02 — Thêm mới Hợp đồng

> Module: M-02 Contract Management | Phiên bản: 1.0 | Ngày: 06/07/2026
> Trạng thái: Draft for Review

---

## 1. Thông tin chung

| Thuộc tính | Nội dung |
|---|---|
| **Mã Use Case** | UC-CON-02 |
| **Tên** | Thêm mới Hợp đồng |
| **Mô tả** | Sales tạo hồ sơ hợp đồng mới cho khách hàng đã tồn tại trong hệ thống. Hỗ trợ 2 loại: `DIRECT` và `RESELLER`. HĐ loại `RESELLER` có thêm section License Pool. Sales có thể đính kèm file HĐ giấy ngay tại bước tạo. |
| **Tác nhân** | Sales |
| **Tiền điều kiện** | Đã đăng nhập hệ thống; có quyền `contract:create`. Tồn tại ít nhất 1 Customer chưa bị xóa mềm (`deletedAt IS NULL`). |
| **Hậu điều kiện (Success)** | Contract record tạo với `subs = []` và `poolItems` theo khai báo. Audit log ghi. File hợp lệ lưu vào S3/MinIO. Sau tạo → điều hướng UC-CON-03. |
| **Hậu điều kiện (Failure)** | Không có record nào được tạo. Modal giữ nguyên dữ liệu đã nhập. |
| **Trigger** | Click nút "+ Thêm Hợp đồng" tại UC-CON-01. |
| **Liên kết** | UC-CON-01 (Danh sách), UC-CON-03 (Chi tiết), UC-CON-05 (Đính kèm file) |

### Business Rules

| Mã | Nội dung |
|---|---|
| **BR-01** | `contract.code` do Sales nhập thủ công, phải unique toàn hệ thống, so sánh case-insensitive. Ví dụ: "HD-CMC-2025-001" và "hd-cmc-2025-001" được coi là trùng nhau. |
| **BR-02** | `contract.type` (`DIRECT` / `RESELLER`) không thể thay đổi sau khi tạo. |
| **BR-03** | HĐ loại `RESELLER` bắt buộc có ít nhất 1 License Pool khi tạo. `pool_total` của mỗi pool item là bất biến (immutable) sau khi tạo. |
| **BR-04** | Dropdown Khách hàng chỉ hiển thị KH có `deletedAt IS NULL`. |
| **BR-05** | Audit log là bắt buộc — nếu không ghi được thì rollback toàn bộ transaction. |
| **BR-06** | File đính kèm: định dạng hợp lệ gồm PDF, DOCX, XLSX, JPG, PNG; dung lượng tối đa 10MB/file; tối đa 15 file/HĐ. |

---

## 2. Luồng nghiệp vụ

### 2.1 Luồng chính

| Bước | Tác nhân | Hành động | Ghi chú |
|---|---|---|---|
| 1 | Sales | Nhấn nút "+ Thêm Hợp đồng". | — |
| 2 | System | Mở modal "Thêm Hợp đồng mới", reset toàn bộ fields về trạng thái trống. | — |
| 3 | Sales | Điền Mã hợp đồng. | — |
| 4 | System | Validate realtime: kiểm tra trùng mã sau mỗi keystroke. Nếu trùng → hiển thị lỗi inline (không block tiếp tục nhập). | Theo BR-01. |
| 5 | Sales | Chọn Khách hàng từ dropdown. | Chỉ KH `deletedAt IS NULL` theo BR-04. |
| 6 | Sales | Chọn Loại hợp đồng (radio card: Direct / Reseller). | — |
| 7 | System | Nếu chọn `RESELLER` → hiển thị section License Pool, tự thêm 1 dòng pool rỗng. Nếu chọn `DIRECT` → ẩn section. | — |
| 8 | Sales | Nhập Ngày ký (tuỳ chọn). Nhập Mô tả (tuỳ chọn). | — |
| 9 | Sales | (Tuỳ chọn) Đính kèm file → **AF-01**. | — |
| 10 | Sales | Nhấn nút "💾 Tạo". | — |
| 11 | System | Validate toàn bộ form: required fields, format ngày, pool items (nếu RESELLER). Nếu thất bại → **EF-01**. | Theo BR-03 với RESELLER. |
| 12 | System | Kiểm tra lần cuối trùng mã server-side. Nếu trùng → **EF-02**. | — |
| 13 | System | Tạo Contract record. Ghi Audit Log. Upload các file hợp lệ lên S3/MinIO (nếu có). | Theo BR-05, BR-06. |
| 14 | System | Đóng modal. Hiển thị toast "Tạo thành công — Hợp đồng {code} đã được tạo". Điều hướng sang UC-CON-03. | — |

### 2.2 Luồng phụ

#### AF-01 — Đính kèm file

| Bước | Tác nhân | Hành động |
|---|---|---|
| 1 | Sales | Kéo thả file vào dropzone hoặc click để chọn file. |
| 2 | System | Validate client-side: kiểm tra định dạng (BR-06) và dung lượng (BR-06). |
| 3a | System | File hợp lệ → thêm vào danh sách với icon ✓ xanh, tên file, dung lượng, badge "NEW", ô mô tả, nút 🗑️. |
| 3b | System | File không hợp lệ → icon ✕ đỏ + tooltip ghi rõ lý do. File không được submit khi nhấn "Tạo". Không chặn tiếp tục nhập form. |

#### AF-02 — Thêm dòng Pool License (chỉ áp dụng với RESELLER)

| Bước | Tác nhân | Hành động |
|---|---|---|
| 1 | Sales | Nhấn nút "+ Thêm sản phẩm vào Pool". |
| 2 | System | Append 1 dòng mới gồm: dropdown Gói sản phẩm (grouped EPP / EDR / EPR, required), input Tổng số license (số nguyên > 0, required), cảnh báo "⚠️ Không thể thay đổi sau khi lưu", nút [✕] xóa dòng. |

#### AF-03 — Hủy tạo hợp đồng

| Bước | Tác nhân | Hành động |
|---|---|---|
| 1 | Sales | Nhấn nút "Hủy" hoặc click vào vùng overlay bên ngoài modal. |
| 2 | System | Đóng modal ngay, không hiển thị dialog xác nhận. Không tạo record. Toàn bộ dữ liệu và file đã staged bị hủy. |

### 2.3 Luồng ngoại lệ

#### EF-01 — Validation form thất bại

| Bước | Hành động |
|---|---|
| 1 | Highlight viền đỏ tại field lỗi, hiển thị message lỗi inline bên dưới field. |
| 2 | Modal giữ nguyên toàn bộ dữ liệu đã nhập. Không tạo record. |
| 3 | Trường hợp RESELLER + pool thiếu thông tin → hiển thị toast: "Thiếu thông tin Pool — Điền đầy đủ Gói sản phẩm và Pool tổng". |

#### EF-02 — Trùng mã hợp đồng (server-side)

| Bước | Hành động |
|---|---|
| 1 | Hiển thị lỗi inline bên dưới field Mã HĐ: "Mã hợp đồng đã tồn tại". |
| 2 | Không tạo record. Modal giữ nguyên dữ liệu. |

---

## 3. Mô tả giao diện

### 3.1 Tổng quan

Modal "Thêm Hợp đồng mới" gồm các khu vực:
1. **Thông tin cơ bản:** Mã HĐ, Khách hàng, Loại HĐ, Ngày ký, Mô tả.
2. **Section License Pool (RESELLER only):** Hiển thị điều kiện — chỉ khi chọn `RESELLER`.
3. **Khu vực đính kèm file:** Dropzone và danh sách file tạm.
4. **Footer hành động:** Nút "💾 Tạo" và nút "Hủy".

### 3.2 Mô tả component

#### Thông tin cơ bản

| Component | Loại | Bắt buộc | Mô tả |
|---|---|---|---|
| Mã hợp đồng | Text input | ✅ | Placeholder: "VD: HD-CMC-2025-001". Hint: "Nhập mã theo quy ước công ty, không trùng với HĐ khác". Validate realtime kiểm tra trùng (BR-01). |
| Khách hàng | Dropdown | ✅ | Chỉ hiển thị KH `deletedAt IS NULL`. Format hiển thị: "Tên KH (Loại)". |
| Loại hợp đồng | Radio card | ✅ | 2 cards: **Direct** và **Reseller**. Chọn Reseller → hiện section Pool. Chọn Direct → ẩn section, xóa pool đã nhập. Immutable sau khi tạo (BR-02). |
| Ngày ký | Date picker | ❌ | Format `dd/MM/yyyy`. |
| Mô tả | Textarea | ❌ | 2 rows. |

#### Section License Pool (RESELLER only)

| Component | Loại | Bắt buộc | Mô tả |
|---|---|---|---|
| Header section | Text | — | "Phân bổ số lượng bản quyền theo sản phẩm". |
| Dropdown Gói sản phẩm | Select (grouped) | ✅ | Nhóm: EPP / EDR / EPR. Mỗi dòng pool cần chọn 1 sản phẩm. |
| Tổng số license | Number input | ✅ | Số nguyên > 0. Format phân cách nghìn. Cảnh báo inline: "⚠️ Không thể thay đổi sau khi lưu". |
| Nút [✕] xóa dòng | Icon button | — | Xóa dòng pool tương ứng khỏi form. |
| Nút "+ Thêm sản phẩm vào Pool" | Text button | — | Thêm dòng pool mới (AF-02). |

#### Khu vực đính kèm file

| Component | Mô tả |
|---|---|
| Dropzone | Kéo thả hoặc click để chọn file. Hiển thị gợi ý: định dạng PDF/DOCX/XLSX/JPG/PNG, tối đa 10MB, tối đa 15 file. |
| Danh sách file tạm | Mỗi file hiển thị: icon loại file, tên file, dung lượng, status icon (✓ xanh nếu hợp lệ / ✕ đỏ nếu không hợp lệ), badge "NEW", ô mô tả (optional), nút 🗑️ xóa tạm. |

#### Footer hành động

| Component | Loại | Mô tả |
|---|---|---|
| "💾 Tạo" | Primary button | Kích hoạt luồng chính bước 10. |
| "Hủy" | Ghost button | Thực hiện AF-03. |
| Click overlay | — | Click ngoài vùng modal → thực hiện AF-03. |

---

## 4. Acceptance Criteria

### Nhóm 1: Tạo hợp đồng thành công

| Mã | Given | When | Then |
|---|---|---|---|
| AC-CON-02-01 | Sales điền mã "HD-CMC-2026-001", KH "FPT Software", loại Direct, Ngày ký 01/07/2026. | Nhấn "Tạo". | Contract tạo thành công với `type=DIRECT`, `subs=[]`, `poolItems=[]`. Toast "Tạo thành công". Điều hướng UC-CON-03. |
| AC-CON-02-02 | Sales điền đủ required fields, không nhập Ngày ký và Mô tả. | Nhấn "Tạo". | Tạo thành công với `signedDate = null`, `description = null`. |
| AC-CON-02-03 | Sales chọn Reseller, thêm 1 pool "EPP Business: 500". | Nhấn "Tạo". | Contract với `type=RESELLER`, `poolItems=[{productId: EPP, poolTotal: 500, allocatedQty: 0}]`. Audit log ghi. |
| AC-CON-02-04 | Sales chọn Reseller, 2 pool: EDR 500 + EPR 200. | Nhấn "Tạo". | 2 pool items được tạo. Cột Pool License tại Danh sách: "EDR: 0/500" và "EPR: 0/200". |
| AC-CON-02-05 | Sales tạo Reseller, kèm 1 file PDF hợp lệ. | Nhấn "Tạo". | Contract tạo thành công. File lưu trên S3/MinIO. Panel "Đính kèm" tại UC-CON-03 hiển thị file. |

### Nhóm 2: Hiển thị section License Pool

| Mã | Given | When | Then |
|---|---|---|---|
| AC-CON-02-06 | Modal vừa mở, chưa chọn loại HĐ. | — | Section License Pool ẩn. |
| AC-CON-02-07 | Sales chọn loại "Reseller". | Chọn. | Section Pool xuất hiện, tự thêm 1 dòng pool rỗng. |
| AC-CON-02-08 | Sales đang ở chế độ Reseller (2 dòng pool đã nhập), sau đó chọn lại Direct. | Chọn "Direct". | Section Pool ẩn, 2 dòng pool đã nhập bị xóa khỏi UI. |

### Nhóm 3: Validation và lỗi

| Mã | Given | When | Then |
|---|---|---|---|
| AC-CON-02-09 | Mã "HD-CMC-2025-001" đã tồn tại trong hệ thống. | Sales nhập đúng mã đó. | Lỗi inline ngay lập tức: "Mã hợp đồng đã tồn tại" (realtime validate). |
| AC-CON-02-10 | Sales bỏ trống Mã HĐ và không chọn KH. | Nhấn "Tạo". | Lỗi inline: "Mã hợp đồng là bắt buộc" dưới field Mã; "Vui lòng chọn khách hàng" dưới field KH. |
| AC-CON-02-11 | Sales chọn Reseller, 1 dòng pool thiếu Gói sản phẩm. | Nhấn "Tạo". | Toast lỗi: "Thiếu thông tin Pool — Điền đầy đủ Gói sản phẩm và Pool tổng". Không tạo record. |

### Nhóm 4: Đính kèm file

| Mã | Given | When | Then |
|---|---|---|---|
| AC-CON-02-12 | Sales kéo thả file PDF 1.5MB vào dropzone. | Thả file. | File xuất hiện trong danh sách tạm với icon ✓ xanh, tên file, dung lượng, nút 🗑️. |
| AC-CON-02-13 | Sales chọn file .exe. | Chọn file. | Icon ✕ đỏ + tooltip "Định dạng không hợp lệ (.EXE)". File không submit. |
| AC-CON-02-14 | Sales chọn file PDF 25MB. | Chọn file. | Icon ✕ đỏ + tooltip "Vượt giới hạn kích thước — file nặng 25.0MB, tối đa 10MB". File không submit. |
| AC-CON-02-15 | Danh sách tạm có 1 file. | Sales nhấn 🗑️ trên file. | File bị xóa khỏi danh sách tạm ngay lập tức. |
| AC-CON-02-16 | Đã có 15 file trong danh sách tạm. | Sales cố thêm file thứ 16. | Toast: "Đã đạt tối đa 15 file/HĐ". File không được thêm. |

### Nhóm 5: Hủy

| Mã | Given | When | Then |
|---|---|---|---|
| AC-CON-02-17 | Sales đã nhập thông tin vào form. | Nhấn "Hủy" hoặc click ngoài overlay. | Modal đóng ngay, không có dialog xác nhận, không tạo record nào. |

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
