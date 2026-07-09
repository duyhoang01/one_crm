# UC-SUB-04 — Chỉnh sửa Subscription

> Module: M-03 Subscription Management | Phiên bản: 1.0 | Ngày: 09/07/2026
> Trạng thái: Draft for Review

---

## 1. Thông tin chung

| Thuộc tính | Nội dung |
|---|---|
| **Mã Use Case** | UC-SUB-04 |
| **Tên** | Chỉnh sửa Subscription |
| **Mô tả** | Sales / CSKH / License Admin / Manager chỉnh sửa thông tin của một subscription đang ở trạng thái DRAFT. Người dùng có thể cập nhật hợp đồng, số lượng, ngày tháng và thông tin bổ sung. Nếu đổi sang hợp đồng khác, subscription sẽ được dịch chuyển sang contract mới. |
| **Tác nhân** | Sales, CSKH, License Admin, Manager |
| **Tiền điều kiện** | (1) Đã đăng nhập; có quyền `subscription:edit`. (2) Subscription tồn tại và `sub.status = DRAFT`. |
| **Hậu điều kiện** | (Thành công) Thông tin subscription được cập nhật; nếu chuyển sang hợp đồng khác thì sub bị dịch chuyển sang contract mới. (Thất bại) Dữ liệu không thay đổi, form giữ nguyên giá trị với thông báo lỗi. |
| **Trigger** | (1) Click ✏️ tại row subscription trong UC-SUB-01. (2) Click "✏️ Sửa" trong hero section UC-SUB-03. |
| **Liên kết** | UC-SUB-01 (Danh sách), UC-SUB-03 (Chi tiết — quay lại sau khi lưu) |

### Business Rules

| Mã | Nội dung |
|---|---|
| **BR-01** | Chỉ subscription có `sub.status = DRAFT` mới được chỉnh sửa. Mọi trạng thái khác: không hiển thị nút "✏️ Sửa". |
| **BR-02** | Các trường không thể thay đổi sau khi tạo: Mã Subscription (`sub.id`), Product (`sub.productId`). |
| **BR-03** | Gói sản phẩm (`packageName`) là readonly trong form edit — được xác định bởi hợp đồng, không thể thay đổi độc lập. |
| **BR-04** | Nếu người dùng đổi sang hợp đồng khác, subscription sẽ được dịch chuyển khỏi contract cũ và gắn vào contract mới. |
| **BR-05** | Số seats (DIRECT) phải > 0. Số license (RESELLER) phải > 0. |
| **BR-06** | Đơn vị thụ hưởng (`beneficiaryId`) là bắt buộc khi `contractType = RESELLER`, không hiển thị khi `contractType = DIRECT`. |
| **BR-07** | Ngày hết hạn (`endDate`) được tự động tính khi người dùng nhập `startDate` (endDate = startDate + duration_months - 1 ngày). Người dùng vẫn có thể sửa trực tiếp `endDate`. |
| **BR-08** | Deal Code và Ghi chú là tùy chọn. |
| **BR-09** | Sau khi lưu thành công, form đóng lại, hệ thống cập nhật hero + tab Thông tin chung của trang UC-SUB-03 (nếu đang mở detail) hoặc cập nhật dòng trong danh sách UC-SUB-01. |

---

## 2. Luồng nghiệp vụ

### 2.1 Luồng chính

| Bước | Tác nhân | Hành động | Ghi chú |
|---|---|---|---|
| 1 | Sales / Manager | Click ✏️ tại row subscription trong UC-SUB-01 hoặc click "✏️ Sửa" trong hero section UC-SUB-03. | — |
| 2 | System | Kiểm tra subscription tồn tại và `sub.status = DRAFT`. | → **EF-01** nếu không hợp lệ. |
| 3 | System | Mở modal "Chỉnh sửa Subscription". Pre-fill toàn bộ dữ liệu hiện tại vào form. Mã Sub hiển thị trên header modal (readonly). | BR-02, BR-03 |
| 4 | Sales / Manager | Chỉnh sửa các trường trong form. Tùy chọn: đổi hợp đồng → **AF-01**; nhập ngày bắt đầu → **AF-02**. | — |
| 5 | Sales / Manager | Click "💾 Lưu thay đổi". | — |
| 6 | System | Validate toàn bộ form. | — |
| — | — | **[Gateway — Dữ liệu hợp lệ?]** | — |
| — | — | → [Không]: Hiển thị lỗi inline bên dưới từng field không hợp lệ. Giữ nguyên form → **EF-02**. | BR-05, BR-06 |
| — | — | → [Có]: Tiếp tục bước 7. | — |
| 7 | System | Lưu thay đổi vào cơ sở dữ liệu. Nếu người dùng đổi hợp đồng, dịch chuyển subscription khỏi contract cũ và gắn vào contract mới. | BR-04 |
| 8 | System | Đóng modal. Hiển thị toast "Đã cập nhật thành công". | — |
| 9 | System | Cập nhật giao diện: hero + tab Thông tin chung tại UC-SUB-03 (nếu đang mở detail), hoặc dòng tương ứng trong bảng UC-SUB-01. | BR-09 |

### 2.2 Luồng phụ

#### AF-01 — Đổi hợp đồng

Kích hoạt tại bước 4 khi người dùng chọn hợp đồng khác trong dropdown.

| Bước | Tác nhân | Hành động | Ghi chú |
|---|---|---|---|
| 4a | Sales / Manager | Xoá lựa chọn hợp đồng hiện tại, tìm và chọn hợp đồng mới. | — |
| 4b | System | Load thông tin hợp đồng mới: loại HĐ, gói sản phẩm, duration. Reset các field phụ thuộc (seats/license, beneficiary). | BR-04 |
| → | — | Tiếp tục từ bước 4. | — |

#### AF-02 — Tính toán ngày hết hạn tự động

Kích hoạt tại bước 4 khi người dùng nhập hoặc thay đổi ngày bắt đầu.

| Bước | Tác nhân | Hành động | Ghi chú |
|---|---|---|---|
| 4a | Sales / Manager | Chọn hoặc nhập Ngày bắt đầu mới. | — |
| 4b | System | Tính lại Ngày hết hạn = Ngày bắt đầu + `duration_months` - 1 ngày. Cập nhật realtime field Ngày hết hạn. | BR-07 |
| → | — | Tiếp tục từ bước 4. | — |

### 2.3 Luồng ngoại lệ

#### EF-01 — Subscription không thể chỉnh sửa

Kích hoạt tại bước 2 khi subscription không tồn tại hoặc `sub.status ≠ DRAFT`.

| Bước | Tác nhân | Hành động | Ghi chú |
|---|---|---|---|
| 1 | System | Đóng modal ngay (nếu đang mở). Hiển thị toast lỗi: "Không thể chỉnh sửa subscription này". | — |
| → | — | Kết thúc luồng. | — |

#### EF-02 — Validate thất bại

Kích hoạt tại bước 6 khi dữ liệu không hợp lệ.

| Bước | Tác nhân | Hành động | Ghi chú |
|---|---|---|---|
| 1 | System | Hiển thị lỗi inline bên dưới từng field không hợp lệ. | BR-05, BR-06 |
| 2 | System | Giữ nguyên form với dữ liệu đã nhập. Không lưu thay đổi. Modal không đóng. | — |

---

## 3. Mô tả giao diện

### 3.1 Wireframe

> **Demo HTML:** [docs/demo/v2.4.0_subscriptions.html](../../demo/v2.4.0_subscriptions.html)
> Hàm liên quan: `subOpenEditSub(id)`, `subSubmitEditSub()`, `subEditSubCalcEndDate()`, `subEditSubOnContractChange()`

```
┌──────────────────────────────────────────────────────────┐
│  Chỉnh sửa Subscription        [SUB-2026-001]         ✕ │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Hợp đồng *                                             │
│  [🔍 HD-CMC-2025-001 · FPT Software              ▼]     │
│                                                          │
│  Gói sản phẩm (readonly)      Thời hạn (readonly)       │
│  [CMC EDR Standard        🔒] [12 tháng          🔒]    │
│                                                          │
│  ── DIRECT only ─────────────────────────────────────   │
│  Số seats *                                             │
│  [50                                                 ]  │
│                                                          │
│  ── RESELLER only ───────────────────────────────────   │
│  Đơn vị thụ hưởng *           Số license *             │
│  [Chọn đơn vị thụ hưởng   ▼] [100                   ]  │
│                                                          │
│  Ngày bắt đầu                 Ngày hết hạn (tự tính)   │
│  [01/08/2026               ]  [31/07/2027          🔒]  │
│                                                          │
│  Deal Code (tùy chọn)                                   │
│  [                                                   ]  │
│                                                          │
│  Ghi chú (tùy chọn)                                     │
│  [                                                   ]  │
│  [                                                   ]  │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                          [Hủy]  [💾 Lưu thay đổi]       │
└──────────────────────────────────────────────────────────┘
```

**Screenshot — Modal Chỉnh sửa Draft Subscription:**

![Chỉnh sửa Subscription — modal](../../assets/M-03_subscriptions/UC-SUB-04_screen_modal_edit.png)

### 3.2 Thành phần UI

| # | Thành phần | Loại | Mô tả |
|---|---|---|---|
| 1 | Header modal | Text + Badge | Tiêu đề "Chỉnh sửa Subscription" kèm badge mã sub (`SUB-YYYY-NNN`). Nút ✕ đóng modal không lưu. |
| 2 | Dropdown Hợp đồng | Searchable dropdown | Tìm kiếm theo mã HĐ hoặc tên khách hàng. Hiển thị `contractCode · customerName`. Khi thay đổi → kích hoạt AF-01. |
| 3 | Gói sản phẩm | Text readonly | Tự điền từ hợp đồng đã chọn. Hiển thị icon 🔒. Không thể chỉnh sửa trực tiếp (BR-03). |
| 4 | Thời hạn | Text readonly | Tự điền từ package của hợp đồng. Định dạng "X tháng". Hiển thị icon 🔒. |
| 5 | Số seats | Number input | Chỉ hiển thị khi `contractType = DIRECT`. Placeholder: "Nhập số seats". |
| 6 | Đơn vị thụ hưởng | Select dropdown | Chỉ hiển thị khi `contractType = RESELLER`. Danh sách đơn vị thụ hưởng đã đăng ký. |
| 7 | Số license | Number input | Chỉ hiển thị khi `contractType = RESELLER`. Placeholder: "Nhập số license". |
| 8 | Ngày bắt đầu | Date picker | Tùy chọn. Khi thay đổi → kích hoạt AF-02. |
| 9 | Ngày hết hạn | Date picker | Tự tính theo AF-02. Người dùng có thể sửa trực tiếp để ghi đè (BR-07). |
| 10 | Deal Code | Text input | Tùy chọn. Không validate format. |
| 11 | Ghi chú | Textarea | Tùy chọn. 2 rows mặc định. |
| 12 | Nút "💾 Lưu thay đổi" | Primary button | Submit form. Kích hoạt bước 5–9 luồng chính. |
| 13 | Nút "Hủy" | Ghost button | Đóng modal, không lưu bất kỳ thay đổi nào. |

### 3.3 Bảng field

| # | Field | Bắt buộc | Điều kiện hiển thị | Validation & Mô tả |
|---|---|---|---|---|
| 1 | Hợp đồng | ✓ | Tất cả | Searchable; hiện `contractCode · customerName`; lỗi: "Vui lòng chọn hợp đồng". |
| 2 | Gói sản phẩm | — | Tất cả | Readonly; tự động từ hợp đồng. Hiển thị icon 🔒. |
| 3 | Thời hạn | — | Tất cả | Readonly; VD: "12 tháng". Hiển thị icon 🔒. |
| 4 | Số seats | ✓ | DIRECT only | Số nguyên > 0; lỗi: "Số seats phải > 0". |
| 5 | Đơn vị thụ hưởng | ✓ | RESELLER only | Dropdown; lỗi: "Vui lòng chọn đơn vị thụ hưởng". |
| 6 | Số license | ✓ | RESELLER only | Số nguyên > 0; lỗi: "Số license phải > 0". |
| 7 | Ngày bắt đầu | — | Tất cả | Date picker; tùy chọn. Khi thay đổi → tự tính ngày hết hạn (BR-07). |
| 8 | Ngày hết hạn | — | Tất cả | Tự tính từ startDate + duration_months - 1 ngày. Có thể sửa tay để ghi đè. |
| 9 | Deal Code | — | Tất cả | Text tự do; tùy chọn. |
| 10 | Ghi chú | — | Tất cả | Textarea; tùy chọn. |

---

## 4. Acceptance Criteria

### Nhóm 1: Mở form

| Mã | Given | When | Then |
|---|---|---|---|
| AC-SUB-04-01 | Sub "SUB-2026-001" có `status = DRAFT`, gắn với HĐ DIRECT "HD-CMC-2025-001", `seats = 50`, `startDate = 01/08/2026`, `endDate = 31/07/2027`. | Click ✏️ từ UC-SUB-01. | Modal "Chỉnh sửa Subscription" mở. Tất cả field điền sẵn đúng giá trị hiện tại. Gói sản phẩm và Thời hạn hiển thị readonly với icon 🔒. Header badge hiển thị "SUB-2026-001". |
| AC-SUB-04-02 | Sub "SUB-2026-002" có `status = ACTIVE`. | Xem cột Thao tác tại UC-SUB-01. | Nút ✏️ không hiển thị. Không có cách mở form chỉnh sửa từ UI. |
| AC-SUB-04-03 | Sub DIRECT đang mở form edit. | Quan sát form. | Chỉ hiển thị field Số seats. Không hiển thị Đơn vị thụ hưởng và Số license. |
| AC-SUB-04-04 | Sub RESELLER đang mở form edit. | Quan sát form. | Hiển thị Đơn vị thụ hưởng và Số license (có giá trị hiện tại). Không hiển thị Số seats. |

### Nhóm 2: Validate

| Mã | Given | When | Then |
|---|---|---|---|
| AC-SUB-04-05 | Form đang mở, người dùng xóa trắng ô Hợp đồng. | Click "💾 Lưu thay đổi". | Lỗi inline bên dưới ô Hợp đồng: "Vui lòng chọn hợp đồng". Modal không đóng. |
| AC-SUB-04-06 | HĐ DIRECT, người dùng xóa trắng Số seats. | Click "💾 Lưu thay đổi". | Lỗi inline bên dưới Số seats: "Số seats phải > 0". Modal không đóng. |
| AC-SUB-04-07 | HĐ DIRECT, người dùng nhập Số seats = 0. | Click "💾 Lưu thay đổi". | Lỗi inline bên dưới Số seats: "Số seats phải > 0". Modal không đóng. |
| AC-SUB-04-08 | HĐ RESELLER, người dùng xóa lựa chọn Đơn vị thụ hưởng. | Click "💾 Lưu thay đổi". | Lỗi inline bên dưới Đơn vị thụ hưởng: "Vui lòng chọn đơn vị thụ hưởng". Modal không đóng. |

### Nhóm 3: Lưu thành công

| Mã | Given | When | Then |
|---|---|---|---|
| AC-SUB-04-09 | Sub DIRECT "SUB-2026-001", `seats = 50`. Sửa Số seats thành 100. | Click "💾 Lưu thay đổi". | `seats` cập nhật thành 100. Modal đóng. Toast "Đã cập nhật thành công". Dòng tại UC-SUB-01 cập nhật ngay, không cần tải lại trang. |
| AC-SUB-04-10 | Sub RESELLER, sửa Đơn vị thụ hưởng và Số license. | Click "💾 Lưu thay đổi". | `beneficiaryId` và `licenseQty` cập nhật. Modal đóng. Toast "Đã cập nhật thành công". |
| AC-SUB-04-11 | Sub đang gắn với HĐ "HD-A". Người dùng đổi sang HĐ "HD-B" (cùng loại). | Click "💾 Lưu thay đổi". | Sub bị tách khỏi HD-A và gắn vào HD-B. Modal đóng. Toast "Đã cập nhật thành công". |

### Nhóm 4: Tính toán tự động

| Mã | Given | When | Then |
|---|---|---|---|
| AC-SUB-04-12 | Gói 12 tháng. Ngày bắt đầu hiện tại = 01/01/2026, Ngày hết hạn = 31/12/2026. | Sửa Ngày bắt đầu thành 01/08/2026. | Field Ngày hết hạn tự động cập nhật = 31/07/2027 (01/08/2026 + 12 tháng - 1 ngày). |
| AC-SUB-04-13 | Gói 6 tháng. | Nhập Ngày bắt đầu = 01/03/2026. | Ngày hết hạn tự tính = 31/08/2026 (01/09/2026 - 1 ngày). |

### Nhóm 5: Exception

| Mã | Given | When | Then |
|---|---|---|---|
| AC-SUB-04-14 | Sub "SUB-2026-005" có `status = PENDING_PROVISION`. | Gửi request mở form edit (bypass UI). | Hệ thống không mở modal. Hiển thị toast lỗi "Không thể chỉnh sửa subscription này". |
| AC-SUB-04-15 | Sub "SUB-2026-999" không tồn tại trong hệ thống. | Gửi request chỉnh sửa. | Hệ thống không mở modal. Hiển thị toast lỗi "Không thể chỉnh sửa subscription này". |

---

## 5. Review Checklist

> Claude tự review — đánh dấu ✅/❌ trước khi submit cho BA review.

### Nghiệp vụ
- ✅ Luồng chính bao phủ happy path (DIRECT và RESELLER)
- ✅ Luồng phụ đã định nghĩa: AF-01 (đổi hợp đồng), AF-02 (tính ngày hết hạn tự động)
- ✅ Luồng ngoại lệ đầy đủ: EF-01 (sub không phải DRAFT hoặc không tồn tại), EF-02 (validate lỗi)
- ✅ BR đã định nghĩa rõ (BR-01 đến BR-09)
- ✅ AC bao phủ 5 nhóm, 15 AC (≥ 12 yêu cầu)
- ✅ Tiền/hậu điều kiện định nghĩa đầy đủ cho cả success lẫn failure
- ✅ Trigger từ 2 điểm vào (UC-SUB-01 và UC-SUB-03) đều được mô tả

### Giao diện
- ✅ Wireframe ASCII phản ánh đúng cấu trúc modal với 2 luồng DIRECT/RESELLER
- ✅ Readonly fields ghi rõ nguồn dữ liệu và icon 🔒
- ✅ Cột "Điều kiện hiển thị" trong bảng field mô tả rõ từng trường hợp (DIRECT only / RESELLER only / Tất cả)
- ✅ Footer button order đúng: [Hủy] trái · [💾 Lưu thay đổi] phải
- ✅ Demo reference và function names đã đính kèm tại §3.1
- ✅ Gateway format 3 dòng riêng trong luồng chính (bước 6)
