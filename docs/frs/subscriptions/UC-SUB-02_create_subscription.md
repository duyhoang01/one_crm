# UC-SUB-02 — Tạo Subscription

> Module: M-03 Subscription Management | Phiên bản: 1.0 | Ngày: 08/07/2026
> Trạng thái: Draft for Review

---

## 1. Thông tin chung

| Thuộc tính | Nội dung |
|---|---|
| **Mã Use Case** | UC-SUB-02 |
| **Tên** | Tạo Subscription |
| **Mô tả** | Sales / Manager tạo mới một subscription ở trạng thái DRAFT. Subscription được liên kết với một hợp đồng cụ thể. Gói sản phẩm và thời hạn được xác định tự động từ hợp đồng hoặc do người dùng chọn tuỳ theo loại hợp đồng. |
| **Tác nhân** | Sales, Manager |
| **Tiền điều kiện** | Đã đăng nhập; có quyền `subscription:create`; tồn tại ít nhất một hợp đồng trong hệ thống. |
| **Hậu điều kiện** | (Thành công) Subscription mới được tạo với `status = DRAFT`. Hệ thống điều hướng sang UC-SUB-03 (Chi tiết). (Thất bại) Dữ liệu không thay đổi, form giữ nguyên giá trị đã nhập. |
| **Trigger** | Người dùng click nút "+ Thêm Subscription" từ UC-SUB-01. |
| **Liên kết** | UC-SUB-01 (Danh sách), UC-SUB-03 (Chi tiết — điều hướng sau khi tạo), UC-SUB-05 (Xác nhận) |

### Business Rules

| Mã | Nội dung |
|---|---|
| **BR-01** | Mã Subscription được hệ thống tự động sinh theo định dạng `SUB-{YYYY}-{NNN}` (năm hiện tại, số thứ tự 3 chữ số, tăng dần). Người dùng không nhập tay. |
| **BR-02** | Subscription mới tạo luôn có `status = DRAFT`. |
| **BR-03** | Gói sản phẩm (package) được xác định theo loại hợp đồng: (a) DIRECT → tự động lấy `contract.packages[0]`, người dùng không được thay đổi; (b) RESELLER có 1 pool → tự động lấy gói đầu tiên của pool đó, người dùng không được thay đổi; (c) RESELLER có ≥ 2 pool → người dùng chọn từ dropdown nhóm theo pool. |
| **BR-04** | Thời hạn (duration) được tự động lấy từ `package.duration_months` sau khi gói được xác định. Người dùng không nhập tay. |
| **BR-05** | Ngày hết hạn (dự kiến) = Ngày bắt đầu + `duration_months` - 1 ngày. Nếu người dùng chưa nhập ngày bắt đầu khi gói được xác định, hệ thống mặc định lấy ngày hiện tại làm ngày bắt đầu. |
| **BR-06** | DIRECT: bắt buộc nhập Số thiết bị (> 0). Không có Đơn vị thụ hưởng, không có Số license. |
| **BR-07** | RESELLER: bắt buộc chọn Đơn vị thụ hưởng và nhập Số license (> 0). Không có Số thiết bị. |
| **BR-08** | Số license không được vượt quá số license còn lại trong pool tương ứng. Hệ thống hiển thị hint "Còn X / Y license khả dụng" ngay sau khi xác định được gói sản phẩm. |
| **BR-09** | Các field Khách hàng, Loại hợp đồng, Gói sản phẩm, Thời hạn, Ngày hết hạn đều là readonly — tự động điền từ dữ liệu hợp đồng, người dùng không chỉnh sửa. |
| **BR-10** | Ngày bắt đầu và Ngày hết hạn là **dự kiến** — không phải nguồn sự thật. Sau khi Product Module kích hoạt license, ngày hết hạn thực sẽ được đồng bộ lại qua webhook `license.active`. |

---

## 2. Luồng nghiệp vụ

### 2.1 Luồng chính

| Bước | Tác nhân | Hành động | Ghi chú |
|---|---|---|---|
| 1 | Sales / Manager | Click "+ Thêm Subscription" từ màn UC-SUB-01. | — |
| 2 | System | Mở modal "Thêm Subscription mới". Form rỗng. Mã Sub được sinh sẵn (ẩn, không hiện trên form). | BR-01 |
| 3 | Sales / Manager | Nhập từ khoá vào ô tìm kiếm hợp đồng, chọn một hợp đồng từ dropdown kết quả. | Tìm theo mã HĐ hoặc tên khách hàng. |
| 4 | System | Tự động điền: Khách hàng, Loại hợp đồng (readonly). Hiển thị phần Sản phẩm & License. Xác định và hiển thị Gói sản phẩm, Thời hạn theo BR-03. Tính và hiển thị Ngày hết hạn theo BR-05. Hiển thị hint pool khả dụng nếu là RESELLER (BR-08). | BR-03, BR-04, BR-05 |
| 5 | Sales / Manager | (DIRECT) Nhập Số thiết bị. | BR-06 |
| 5 | Sales / Manager | (RESELLER) Chọn Đơn vị thụ hưởng, nhập Số license. | BR-07 |
| 6 | Sales / Manager | (Tuỳ chọn) Chỉnh Ngày bắt đầu → Ngày hết hạn tự động cập nhật. | BR-05 |
| 7 | Sales / Manager | (Tuỳ chọn) Nhập Deal Code, Ghi chú. | — |
| 8 | Sales / Manager | Click "💾 Tạo". | — |
| 9 | System | Validate toàn bộ form → **EF-01..EF-05** nếu có lỗi. | — |
| 10 | System | Tạo subscription mới với `status = DRAFT`. Đóng modal. Hiển thị toast "Đã tạo subscription thành công". Điều hướng sang UC-SUB-03 với sub vừa tạo. | BR-02 |

### 2.2 Luồng phụ

#### AF-01 — RESELLER ≥ 2 pool: chọn gói sản phẩm

Kích hoạt tại bước 4 khi hợp đồng RESELLER có từ 2 pool trở lên.

| Bước | Tác nhân | Hành động |
|---|---|---|
| 4a | System | Hiển thị dropdown Gói sản phẩm với các nhóm (`optgroup`) theo từng pool. Mỗi nhóm có nhãn: "{Tên sản phẩm} — còn {X}/{Y} license". |
| 4b | Sales / Manager | Chọn gói sản phẩm từ dropdown. |
| 4c | System | Điền Thời hạn từ gói đã chọn. Cập nhật Ngày hết hạn (BR-05). Hiển thị hint pool khả dụng của pool tương ứng (BR-08). |
| → | — | Tiếp tục từ bước 5. |

#### AF-02 — Người dùng chỉnh Ngày bắt đầu

Kích hoạt tại bước 6.

| Bước | Tác nhân | Hành động |
|---|---|---|
| 6a | Sales / Manager | Chọn hoặc nhập Ngày bắt đầu. |
| 6b | System | Tính lại Ngày hết hạn = Ngày bắt đầu + `duration_months` - 1 ngày. Cập nhật field Ngày hết hạn. |
| → | — | Tiếp tục từ bước 7. |

#### AF-03 — Đổi hợp đồng sau khi đã chọn

Kích hoạt tại bước 3 khi người dùng xoá ô tìm kiếm và chọn lại hợp đồng khác.

| Bước | Tác nhân | Hành động |
|---|---|---|
| 3a | Sales / Manager | Xoá lựa chọn hợp đồng hiện tại, chọn hợp đồng mới. |
| 3b | System | Reset toàn bộ phần Sản phẩm & License, Ngày bắt đầu, Ngày hết hạn. Thực hiện lại bước 4 với hợp đồng mới. |
| → | — | Tiếp tục từ bước 4. |

### 2.3 Luồng ngoại lệ

#### EF-01 — Chưa chọn hợp đồng

| Bước | Tác nhân | Hành động |
|---|---|---|
| 1 | System | Hiển thị lỗi inline bên dưới ô tìm kiếm hợp đồng: "Vui lòng chọn hợp đồng". |
| 2 | System | Giữ nguyên form, không đóng modal. |

#### EF-02 — RESELLER ≥ 2 pool: chưa chọn gói sản phẩm

| Bước | Tác nhân | Hành động |
|---|---|---|
| 1 | System | Hiển thị lỗi inline bên dưới dropdown Gói sản phẩm: "Vui lòng chọn gói sản phẩm". |
| 2 | System | Giữ nguyên form, không đóng modal. |

#### EF-03 — DIRECT: Số thiết bị không hợp lệ

| Bước | Tác nhân | Hành động |
|---|---|---|
| 1 | System | Hiển thị lỗi inline bên dưới field Số thiết bị: "Số thiết bị phải lớn hơn 0". |
| 2 | System | Giữ nguyên form, không đóng modal. |

#### EF-04 — RESELLER: Chưa chọn đơn vị thụ hưởng

| Bước | Tác nhân | Hành động |
|---|---|---|
| 1 | System | Hiển thị lỗi inline bên dưới dropdown Đơn vị thụ hưởng: "Vui lòng chọn đơn vị thụ hưởng". |
| 2 | System | Giữ nguyên form, không đóng modal. |

#### EF-05 — RESELLER: Số license vượt pool khả dụng

| Bước | Tác nhân | Hành động |
|---|---|---|
| 1 | System | Hiển thị lỗi inline bên dưới field Số license: "Vượt pool khả dụng — còn lại {X} license". |
| 2 | System | Giữ nguyên form, không đóng modal. |

---

## 3. Mô tả giao diện

### 3.1 Tổng quan

> **Demo HTML:** [docs/demo/v2.4.0_subscriptions.html](../../demo/v2.4.0_subscriptions.html)

Modal "Thêm Subscription mới" gồm 5 phần theo thứ tự từ trên xuống:

1. **Hợp đồng** — ô tìm kiếm có thể tìm theo mã hoặc tên khách hàng.
2. **Thông tin hợp đồng** — readonly, tự hiện sau khi chọn HĐ.
3. **Sản phẩm & License** — gói, thời hạn, và fields license/seats tuỳ theo loại HĐ.
4. **Thời gian** — ngày bắt đầu (dự kiến) và ngày hết hạn (dự kiến, readonly).
5. **Bổ sung** — Deal Code và Ghi chú (tuỳ chọn).

### 3.2 Mô tả các field

| # | Field | Bắt buộc | Loại | Mô tả & Validation |
|---|---|---|---|---|
| 1 | Hợp đồng | ✓ | Searchable dropdown | Tìm theo mã HĐ hoặc tên khách hàng. Mỗi option hiển thị: mã HĐ (monospace) + badge DIRECT/RESELLER + tên khách hàng. Sau khi chọn: hiển thị tên hợp đồng đã chọn trong ô, giá trị ID lưu vào hidden input. |
| 2 | Khách hàng | — | Text readonly | Tự điền từ `contract.customerName` sau khi chọn HĐ. |
| 3 | Loại hợp đồng | — | Text readonly | Tự điền từ `contract.type` (`DIRECT` / `RESELLER`). |
| 4 | Gói sản phẩm | ✓ | Select / Text readonly | DIRECT & RESELLER 1 pool: readonly, tự điền. RESELLER ≥ 2 pool: dropdown, nhóm theo pool bằng `optgroup`. |
| 5 | Thời hạn | — | Text readonly | Tự điền từ `package.duration_months`, định dạng "X tháng". |
| 6 | Số thiết bị | ✓ (DIRECT) | Number input | Chỉ hiện với DIRECT. Phải > 0. |
| 7 | Đơn vị thụ hưởng | ✓ (RESELLER) | Select | Chỉ hiện với RESELLER. Chọn từ danh sách đơn vị thụ hưởng đã đăng ký. |
| 8 | Số license | ✓ (RESELLER) | Number input | Chỉ hiện với RESELLER. Phải > 0 và ≤ số license còn lại trong pool. Hint "Còn X / Y license khả dụng" hiển thị bên dưới. |
| 9 | Ngày bắt đầu (dự kiến) | — | Date picker | Tuỳ chọn. Nếu để trống khi gói được xác định, hệ thống mặc định hôm nay. |
| 10 | Ngày hết hạn (dự kiến) | — | Date readonly | Tự tính = Ngày bắt đầu + `duration_months` - 1 ngày. Cập nhật realtime khi Ngày bắt đầu thay đổi. |
| 11 | Deal Code | — | Text input | Tuỳ chọn. Không validate format. |
| 12 | Ghi chú | — | Textarea | Tuỳ chọn. |

### 3.3 Footer modal

| Nút | Loại | Hành động |
|---|---|---|
| Hủy | Ghost button | Đóng modal, không lưu. |
| 💾 Tạo | Primary button | Submit form, thực hiện bước 9–10 luồng chính. |

---

## 4. Acceptance Criteria

### Nhóm 1: Mở form và reset

| Mã | Given | When | Then |
|---|---|---|---|
| AC-SUB-02-01 | Sales đang ở màn UC-SUB-01. | Click "+ Thêm Subscription". | Modal mở. Ô tìm kiếm HĐ rỗng. Phần Thông tin HĐ và Sản phẩm & License ẩn. Ngày bắt đầu và hết hạn rỗng. |
| AC-SUB-02-02 | Đang mở modal, đã chọn HĐ và điền một số field. | Click "Hủy" rồi mở lại. | Toàn bộ form reset về trạng thái rỗng ban đầu. |

### Nhóm 2: Chọn hợp đồng và auto-fill

| Mã | Given | When | Then |
|---|---|---|---|
| AC-SUB-02-03 | Có HĐ mã "HD-CMC-2025-001" của "FPT Software". | Nhập "FPT" vào ô tìm kiếm HĐ. | Dropdown hiển thị HĐ của FPT. Mỗi option có badge DIRECT/RESELLER màu tương ứng và tên khách hàng ở dòng 2. |
| AC-SUB-02-04 | Chọn HĐ DIRECT có gói "CMC EDR Standard, 12 tháng". | Chọn HĐ từ dropdown. | Khách hàng và Loại HĐ tự điền (readonly). Gói sản phẩm tự điền "CMC EDR Standard" (readonly). Thời hạn tự điền "12 tháng". Ngày hết hạn tự tính = hôm nay + 12 tháng - 1 ngày. |
| AC-SUB-02-05 | Chọn HĐ RESELLER có 1 pool (CMC EDR). | Chọn HĐ. | Gói sản phẩm tự điền gói đầu tiên của pool (readonly). Hint "Còn X / Y license khả dụng" hiển thị. Phần Đơn vị thụ hưởng + Số license hiện ra. |
| AC-SUB-02-06 | Chọn HĐ RESELLER có 2 pool (CA + CMC EDR). | Chọn HĐ. | Dropdown Gói sản phẩm hiển thị 2 nhóm optgroup. Mỗi nhóm có label "{Tên sản phẩm} — còn X/Y license". |
| AC-SUB-02-07 | Đã chọn HĐ A. | Xoá và chọn lại HĐ B (loại khác). | Toàn bộ phần Sản phẩm & License, Ngày bắt đầu, Ngày hết hạn reset và tính lại theo HĐ B. |

### Nhóm 3: Tính ngày

| Mã | Given | When | Then |
|---|---|---|---|
| AC-SUB-02-08 | Đã chọn HĐ, gói 12 tháng, chưa nhập Ngày bắt đầu. | Gói được xác định (auto-fill hoặc người dùng chọn). | Ngày bắt đầu tự điền = hôm nay. Ngày hết hạn = hôm nay + 12 tháng - 1 ngày. |
| AC-SUB-02-09 | Gói 12 tháng. Ngày bắt đầu = 01/08/2026. | Nhập ngày bắt đầu. | Ngày hết hạn tự tính = 31/07/2027. |
| AC-SUB-02-10 | Gói 6 tháng. Ngày bắt đầu = 01/03/2026. | Nhập ngày bắt đầu. | Ngày hết hạn = 31/08/2026 (01/09/2026 - 1 ngày). |

### Nhóm 4: Validate và lỗi

| Mã | Given | When | Then |
|---|---|---|---|
| AC-SUB-02-11 | Form chưa chọn HĐ. | Click "💾 Tạo". | Lỗi inline "Vui lòng chọn hợp đồng". Modal không đóng. |
| AC-SUB-02-12 | HĐ DIRECT, Số thiết bị để trống. | Click "💾 Tạo". | Lỗi inline "Số thiết bị phải lớn hơn 0". |
| AC-SUB-02-13 | HĐ RESELLER, chưa chọn Đơn vị thụ hưởng. | Click "💾 Tạo". | Lỗi inline "Vui lòng chọn đơn vị thụ hưởng". |
| AC-SUB-02-14 | HĐ RESELLER, pool còn 50 license, nhập Số license = 80. | Click "💾 Tạo". | Lỗi inline "Vượt pool khả dụng — còn lại 50 license". Modal không đóng. |
| AC-SUB-02-15 | HĐ RESELLER ≥ 2 pool, chưa chọn Gói sản phẩm. | Click "💾 Tạo". | Lỗi inline "Vui lòng chọn gói sản phẩm". |

### Nhóm 5: Tạo thành công

| Mã | Given | When | Then |
|---|---|---|---|
| AC-SUB-02-16 | Form hợp lệ (HĐ DIRECT, đủ fields bắt buộc). | Click "💾 Tạo". | Sub mới tạo với `status = DRAFT`. Mã Sub theo định dạng `SUB-{YYYY}-{NNN}`. Modal đóng. Toast "Đã tạo subscription thành công". Điều hướng sang UC-SUB-03 của sub vừa tạo. |
| AC-SUB-02-17 | Form hợp lệ (HĐ RESELLER, đủ fields bắt buộc). | Click "💾 Tạo". | Sub mới tạo với `status = DRAFT`, có `beneficiaryId` và `licenseQty`. Modal đóng. Điều hướng sang UC-SUB-03. |
| AC-SUB-02-18 | Sub mới vừa tạo. | Xem màn UC-SUB-03. | Badge trạng thái hiển thị "Draft". Mã Sub, HĐ, gói, ngày hết hạn khớp với form vừa nhập. |

---

## 5. Review Checklist

> Claude tự review — đánh dấu ✅/❌ trước khi submit cho BA review.

### Nghiệp vụ
- ✅ Luồng chính bao phủ happy path (DIRECT và RESELLER)
- ✅ Luồng phụ đã định nghĩa: AF-01 (RESELLER ≥ 2 pool), AF-02 (chỉnh ngày), AF-03 (đổi HĐ)
- ✅ Luồng ngoại lệ đầy đủ: EF-01..EF-05
- ✅ BR đã định nghĩa rõ (BR-01 đến BR-10)
- ✅ AC bao phủ 5 nhóm, 18 AC
- ✅ Phân biệt rõ DIRECT vs RESELLER vs RESELLER ≥ 2 pool

### Giao diện
- ✅ Thứ tự 5 phần của form đã mô tả
- ✅ Readonly fields ghi rõ nguồn dữ liệu
- ✅ Hint pool khả dụng đã mô tả
- ✅ Footer button order đúng: [Hủy] trái · [💾 Tạo] phải
- ✅ Ngày bắt đầu / hết hạn ghi rõ là "dự kiến" (BR-10)
