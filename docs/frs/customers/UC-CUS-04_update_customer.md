# UC-CUS-04 — Cập nhật Thông tin Khách hàng

> Module: M-01 Customer Management | Phiên bản: 1.0 | Ngày: 06/07/2026
> Trạng thái: Draft for Review

---

## 1. Thông tin chung

| Mục             | Nội dung                                                                                                                                       |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Use Case ID** | UC-CUS-04                                                                                                                                      |
| **Tên**         | Cập nhật Thông tin Khách hàng                                                                                                                  |
| **Mô tả**       | Sales chỉnh sửa thông tin liên hệ và hồ sơ của Customer đã tồn tại: Tên, Email, SĐT, Địa chỉ, Lĩnh vực, Thuộc tập đoàn. Loại KH và MST bị khóa. |
| **Tác nhân**    | Sales                                                                                                                                          |
| **Tiền điều kiện** | Đã đăng nhập. Có quyền `customer:update`. Customer tồn tại, `deleted_at IS NULL`.                                                          |
| **Hậu điều kiện** | **(Success)** Customer record cập nhật trong DB. Audit log ghi chi tiết field thay đổi (giá trị cũ → mới). **(Failure)** Không có thay đổi nào lưu. |
| **Use case liên quan** | UC-CUS-01 (Danh sách), UC-CUS-03 (Customer 360°)                                                                                     |

### Business Rules

| ID      | Nội dung                                                                                                                                                              |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **BR-01** | **Loại KH** và **MST** là field bất biến — hiển thị readonly với icon 🔒 và ghi chú "Không thể thay đổi". **Server-side phải enforce**, không chỉ dừng ở UI.       |
| **BR-02** | **Email**: bắt buộc với B2B, Reseller, B2C; tùy chọn với Other. Unique trong nhóm `{B2B, Reseller}`; unique riêng trong nhóm `{B2C}`. Không kiểm tra trùng với KH đã xóa (`deleted_at IS NOT NULL`). |
| **BR-03** | Field **"Lĩnh vực kinh doanh"**: chỉ hiển thị với B2B, Reseller. Field **"Thuộc tập đoàn"**: hiển thị với B2B, Reseller, Other. **Cả hai field ẩn với B2C**.       |
| **BR-04** | Dropdown **"Thuộc tập đoàn"** không hiển thị chính KH đang sửa. Chỉ hiện KH loại B2B/Reseller và `deleted_at IS NULL`.                                             |
| **BR-05** | **Audit log bắt buộc** — nếu không ghi được Audit log thì **rollback** toàn bộ, không cập nhật Customer record.                                                      |
| **BR-06** | Nếu Sales không thay đổi giá trị nào → vẫn cho lưu thành công nhưng **không tạo Audit log entry mới**.                                                              |

---

## 2. Luồng nghiệp vụ

### 2.1 Luồng chính (Happy Path)

| Bước | Tác nhân | Hành động                                                                                                                                                                |
| ---- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1    | Sales    | Nhấn **"✏️ Chỉnh sửa"** từ cột Thao tác tại Danh sách (UC-CUS-01) **HOẶC** từ action bar Profile Header tại Customer 360° (UC-CUS-03).                                |
| 2    | System   | Mở modal **"Cập nhật Khách hàng"**. Pre-fill toàn bộ field từ dữ liệu hiện tại của Customer.                                                                           |
| 3    | System   | Khóa field **Loại KH** và **MST** (readonly, icon 🔒). Hiển thị/ẩn các field theo Loại KH hiện tại (BR-03).                                                           |
| 4    | Sales    | Chỉnh sửa một hoặc nhiều field: Tên, Email, SĐT, Địa chỉ, Lĩnh vực kinh doanh (nếu B2B/Reseller), Thuộc tập đoàn (nếu không phải B2C).                               |
| 5    | Sales    | Nhấn **"💾 Lưu"** → tiếp bước 6. Hoặc nhấn **"Hủy"** → AF-02.                                                                                                         |
| 6    | System   | **Frontend validate**: required Tên, required Email theo loại KH, format email hợp lệ, format SĐT hợp lệ. → **[Thất bại]** EF-01 · → **[Thành công]** bước 7.         |
| 7    | System   | **Backend kiểm tra trùng email** (chỉ khi email thay đổi so với giá trị hiện tại). → **[Có trùng]** EF-02 · → **[Không trùng]** bước 8.                               |
| 8    | System   | **So sánh diff** giữa giá trị cũ và giá trị mới của tất cả fields. → **[Không có field nào thay đổi]** đóng modal, không ghi Audit log (BR-06) · → **[Có thay đổi]** bước 9. |
| 9    | System   | Cập nhật Customer record trong DB. Ghi Audit Log với chi tiết từng field: `"{giá_trị_cũ}" → "{giá_trị_mới}"`.                                                         |
| 10   | System   | Đóng modal. Toast: _"Đã lưu — Hồ sơ [Tên KH] cập nhật"_. Refresh UI theo luồng xuất phát (xem AF-01).                                                                 |

### 2.2 Luồng phụ

#### AF-01 — Sau khi lưu thành công từ Customer 360°

| Bước | Tác nhân | Hành động                                                                             |
| ---- | -------- | ------------------------------------------------------------------------------------- |
| 1    | System   | Bước 10 → **Re-render Customer 360°** ngay với dữ liệu mới. Không điều hướng trang. |
| 2    | System   | Tab đang active (Tổng quan) cập nhật thông tin mới. Không cần reload trang.          |

#### AF-01b — Sau khi lưu thành công từ Danh sách

| Bước | Tác nhân | Hành động                                                                                |
| ---- | -------- | ---------------------------------------------------------------------------------------- |
| 1    | System   | Bước 10 → **Cập nhật dòng** tương ứng trong bảng Danh sách ngay, không reload trang.   |

#### AF-02 — Hủy thao tác

| Bước | Tác nhân | Hành động                                                                                        |
| ---- | -------- | ------------------------------------------------------------------------------------------------ |
| 1    | Sales    | Nhấn nút **"Hủy"** hoặc nhấn **X** (close) trên modal.                                          |
| 2    | System   | Đóng modal **ngay lập tức**. **Không hiển thị** dialog xác nhận (khác với UC-CUS-02 Tạo mới). |
| 3    | System   | Không lưu bất kỳ thay đổi nào.                                                                   |

### 2.3 Luồng ngoại lệ

#### EF-01 — Frontend validation thất bại

| Bước | Tác nhân | Hành động                                                                                   |
| ---- | -------- | ------------------------------------------------------------------------------------------- |
| 1    | System   | Phát hiện vi phạm validation (Tên trống, Email sai format, Email bắt buộc mà để trống...). |
| 2    | System   | Highlight **viền đỏ** trên field lỗi. Hiển thị **message lỗi inline** bên dưới field.      |
| 3    | System   | **Không** gọi API cập nhật. Form **giữ nguyên** dữ liệu Sales đã nhập.                     |

#### EF-02 — Email đã tồn tại (Backend)

| Bước | Tác nhân | Hành động                                                                                                                            |
| ---- | -------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 1    | System   | Backend phát hiện email mới đã được dùng bởi KH khác trong cùng nhóm (không tính KH đã xóa).                                        |
| 2    | System   | Toast lỗi: _"Email này đã được sử dụng. [Xem hồ sơ →]"_ (link mở tab mới sang Customer 360° của KH đang dùng email đó).            |
| 3    | System   | **Không** cập nhật record. Form **giữ nguyên** dữ liệu Sales đã nhập.                                                               |

---

## 3. Mô tả giao diện

### 3.1 Modal "Cập nhật Khách hàng"

Modal xuất hiện giữa màn hình, overlay mờ phía sau. Title: **"Cập nhật Khách hàng"**.

---

### 3.2 Danh sách Fields

| Field                 | Loại input         | Validate                                   | Điều kiện hiển thị           | Ghi chú                               |
| --------------------- | ------------------ | ------------------------------------------ | ----------------------------- | ------------------------------------- |
| **Loại KH**           | Readonly           | Không validate                             | Luôn hiển thị                 | Icon 🔒, nền xám nhạt, cursor: not-allowed, chú thích "Không thể thay đổi" |
| **Mã số thuế (MST)**  | Readonly           | Không validate                             | B2B, Reseller                 | Icon 🔒, nền xám nhạt, cursor: not-allowed, chú thích "Không thể thay đổi". **Ẩn hoàn toàn** với B2C, Other. |
| **Tên**               | Text input         | Required. Không được để trống.             | Luôn hiển thị                 | Label: "Tên khách hàng *"             |
| **Email**             | Email input        | Required với B2B/Reseller/B2C. Format email hợp lệ. | Luôn hiển thị    | Tùy chọn với Other.                   |
| **Số điện thoại**     | Text input         | Format SĐT Việt Nam (tuỳ chọn validate)    | Luôn hiển thị                 |                                       |
| **Lĩnh vực kinh doanh** | Select / text    | Không bắt buộc                             | **Chỉ** B2B, Reseller         | Ẩn với B2C, Other.                    |
| **Thuộc tập đoàn**    | Searchable dropdown| Không bắt buộc                             | B2B, Reseller, Other          | **Ẩn với B2C.** Không hiện chính KH đang sửa. Chỉ hiện B2B/Reseller chưa xóa. Option "-- Không có --" ở đầu. |
| **Địa chỉ**           | Textarea           | Không bắt buộc                             | Luôn hiển thị                 |                                       |

---

### 3.3 Footer Modal

| Nút              | Loại      | Hành vi                                                                             |
| ---------------- | --------- | ----------------------------------------------------------------------------------- |
| **💾 Lưu**       | Primary   | Submit form. Disable + hiển thị loading spinner sau khi click (ngăn double-submit). Re-enable nếu có lỗi. |
| **Hủy**          | Ghost     | Đóng modal ngay, không hỏi xác nhận (AF-02).                                        |

---

### 3.4 Validation — Thời điểm và hiển thị

| Thuộc tính           | Giá trị                                                          |
| -------------------- | ---------------------------------------------------------------- |
| Thời điểm validate   | **Chỉ khi nhấn "Lưu"** (không validate realtime khi đang nhập) |
| Hiển thị lỗi field   | Viền đỏ + message inline bên dưới field lỗi                     |
| Màu message lỗi      | Đỏ (`color: var(--danger)`)                                      |
| Sau khi sửa lỗi      | Viền đỏ biến mất khi field được điền đúng và nhấn Lưu lại       |

---

### 3.5 Component States

| Component               | State          | Mô tả                                                           |
| ----------------------- | -------------- | --------------------------------------------------------------- |
| Modal                   | Open           | Overlay mờ, form pre-filled đầy đủ                             |
| Field Loại KH / MST     | Readonly       | Nền xám nhạt (`background: var(--gray-100)`), `cursor: not-allowed`, icon 🔒 |
| Field editable          | Default        | Viền bình thường, cursor text                                   |
| Field editable          | Error          | Viền đỏ + message lỗi inline                                    |
| Nút "💾 Lưu"           | Default        | Active, màu primary                                             |
| Nút "💾 Lưu"           | Loading        | Disable + spinner, ngăn double-click                            |
| Dropdown "Thuộc TĐ"    | Default        | Hiển thị "-- Không có --" nếu KH không có parent               |
| Toast thành công        | Show           | _"Đã lưu — Hồ sơ [Tên KH] cập nhật"_ (xanh lá, auto-dismiss) |
| Toast lỗi email trùng   | Show           | _"Email này đã được sử dụng. [Xem hồ sơ →]"_ (đỏ, có link)   |

---

## 4. Acceptance Criteria

| AC ID          | Given                                                                                        | When                                                        | Then                                                                                                                                                    |
| -------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-CUS-04-01   | KH "FPT Software" (B2B) với Email và SĐT hiện tại                                           | Sales sửa Email và SĐT, nhấn **Lưu**                        | Cập nhật thành công. Audit log ghi 2 entries (email: cũ→mới; phone: cũ→mới). Toast _"Đã lưu"_ xuất hiện.                                              |
| AC-CUS-04-02   | KH "Nguyễn Văn A" (B2C)                                                                      | Sales mở modal Cập nhật                                     | Field **MST** và **Lĩnh vực kinh doanh** không hiển thị trong modal.                                                                                   |
| AC-CUS-04-03   | KH có `parentId = null`                                                                      | Sales mở dropdown **"Thuộc tập đoàn"**                      | Có option _"-- Không có --"_ ở đầu. Danh sách bên dưới: chỉ KH loại B2B/Reseller chưa xóa. **Không** có chính KH đang sửa trong list.                 |
| AC-CUS-04-04   | KH "FPT Software" (B2B, MST="0101247332")                                                    | Sales mở modal Cập nhật                                     | Field **Loại KH** và **MST** hiển thị readonly, icon 🔒, nền xám nhạt. Sales **không thể** focus hoặc nhập vào 2 field này.                             |
| AC-CUS-04-05   | Sales gửi API request `PATCH /customers/{id}` với `type` hoặc `tax` khác giá trị gốc (bypass UI) | Backend nhận request                                    | Backend **từ chối** thay đổi, giữ nguyên giá trị gốc trong DB. Trả về response lỗi (4xx). Không cập nhật bất kỳ field nào.                             |
| AC-CUS-04-06   | KH B2B, Sales xóa trắng field **Tên**                                                        | Nhấn **Lưu**                                                | Lỗi inline _"Tên là bắt buộc"_. Không cập nhật. Form giữ nguyên dữ liệu.                                                                              |
| AC-CUS-04-07   | Email `"abc@fpt.com"` đã tồn tại ở KH B2B khác (không bị xóa)                               | Sales đổi email KH hiện tại thành `"abc@fpt.com"`, nhấn Lưu | Toast lỗi _"Email này đã được sử dụng. [Xem hồ sơ →]"_. Không cập nhật. Form giữ nguyên.                                                              |
| AC-CUS-04-08   | KH "Old Corp" đã bị xóa mềm (`deleted_at IS NOT NULL`) có email `"x@old.com"`               | Sales sửa email KH khác thành `"x@old.com"`, nhấn Lưu      | **Cập nhật thành công** — không kiểm tra trùng với KH đã xóa.                                                                                          |
| AC-CUS-04-09   | Sales mở modal nhưng không thay đổi bất kỳ giá trị nào                                       | Nhấn **Lưu**                                                | Hệ thống không báo lỗi. Modal đóng bình thường. **Không tạo** Audit log entry mới (BR-06).                                                              |
| AC-CUS-04-10   | Sales đang xem Customer 360° "FPT Software", mở modal Cập nhật từ Profile Header (AF-01)    | Đổi Tên thành "FPT Software JSC", nhấn Lưu                 | Modal đóng. Customer 360° **re-render ngay** với tên mới trên Profile Header và breadcrumb. Không cần reload trang.                                     |
| AC-CUS-04-11   | Sales đang ở Danh sách, mở modal Cập nhật từ cột Thao tác (icon ✏️)                         | Sửa thông tin, nhấn Lưu                                     | Modal đóng. **Dòng trong bảng** Danh sách cập nhật ngay với thông tin mới. Không cần reload trang.                                                      |

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
