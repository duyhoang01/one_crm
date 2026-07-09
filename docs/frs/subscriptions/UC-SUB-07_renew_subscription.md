# UC-SUB-07 — Gia hạn Subscription

> Module: M-03 Subscription Management | Phiên bản: 1.0 | Ngày: 09/07/2026
> Trạng thái: Draft for Review

---

## 1. Thông tin chung

| Thuộc tính | Nội dung |
|---|---|
| **Mã Use Case** | UC-SUB-07 |
| **Tên** | Gia hạn Subscription |
| **Mô tả** | Sales / CSKH / License Admin tạo một subscription mới ở trạng thái DRAFT để gia hạn một subscription cũ đang ở trạng thái ACTIVE, SUSPENDED, hoặc EXPIRED. Subscription mới kế thừa toàn bộ thông tin sản phẩm từ sub cũ. Sub cũ chuyển sang RENEWED sau khi gia hạn thành công. |
| **Tác nhân** | Sales, CSKH, License Admin, Manager |
| **Tiền điều kiện** | (1) Đã đăng nhập hệ thống; có quyền `subscription:renew`. (2) Subscription tồn tại và `sub.status ∈ {ACTIVE, SUSPENDED, EXPIRED}`. |
| **Hậu điều kiện** | (Thành công) Một subscription mới được tạo với `status = DRAFT`, `previousSubId` trỏ về sub cũ. Sub cũ chuyển thành `status = RENEWED`. (Thất bại) Không có thay đổi nào được thực hiện. |
| **Trigger** | User click "🔄 Gia hạn" trong hero section UC-SUB-03. |
| **Liên kết** | UC-SUB-01 (Danh sách), UC-SUB-03 (Chi tiết sub mới — điều hướng sau khi gia hạn), UC-SUB-05 (Xác nhận sub mới để tiếp tục provisioning) |

### Business Rules

| Mã | Nội dung |
|---|---|
| **BR-01** | Nút "🔄 Gia hạn" hiển thị khi `sub.status ∈ {ACTIVE, SUSPENDED, EXPIRED}`. Không hiển thị với các trạng thái DRAFT, REVOKED, RENEWED, PENDING_PROVISION. |
| **BR-02** | Subscription mới được tạo kế thừa toàn bộ thông tin từ sub cũ: `contractId`, `contractType`, `customerId`, `beneficiaryName`, `packageId`, `packageName`, `productId`, `seatCount`/`licenseQty`. |
| **BR-03** | Subscription mới có `status = DRAFT` và `previousSubId = sub_cũ.id`. |
| **BR-04** | Sub cũ chuyển thành `status = RENEWED` ngay khi gia hạn thành công. |
| **BR-05** | Tính ngày hết hạn mới theo quy tắc: (a) Nếu `sub.status = SUSPENDED`: base = today (ngày hiện tại); (b) Nếu `sub.status ∈ {ACTIVE, EXPIRED}`: base = `sub.endDate` (ngày hết hạn cũ); `newEndDate = base + duration_months - 1 ngày`. `duration_months` lấy từ gói sản phẩm (`package.duration_months`). Người dùng có thể chỉnh ngày hết hạn mới trong form trước khi xác nhận. |
| **BR-06** | Deal Code và Ghi chú là trường mới, không kế thừa từ sub cũ. Người dùng nhập cho lần gia hạn này. |
| **BR-07** | Sau khi tạo thành công, hệ thống điều hướng sang trang UC-SUB-03 của subscription mới. |
| **BR-08** | Timeline sub mới ghi: `"DRAFT tạo để gia hạn · Gia hạn từ [predecessor_id]"`. Timeline sub cũ ghi: `"Đã được gia hạn · Subscription kế tiếp: [newId]"`. |
| **BR-09** | Sub mới ở trạng thái DRAFT — cần thực hiện UC-SUB-05 (Xác nhận) để chuyển sang PENDING_PROVISION và gửi provisioning. |

---

## 2. Luồng nghiệp vụ

### 2.1 Luồng chính

| Bước | Tác nhân | Hành động | Ghi chú |
|---|---|---|---|
| 1 | Sales / CSKH | Click "🔄 Gia hạn" trong hero section UC-SUB-03. | BR-01 |
| 2 | System | Kiểm tra subscription tồn tại và `sub.status ∈ {ACTIVE, SUSPENDED, EXPIRED}`. | → EF-01 nếu không hợp lệ. |
| 3 | System | Tính ngày hết hạn mới theo BR-05. Xác định `duration_months` từ `package.duration_months`. | BR-05 |
| 4 | System | Mở modal "Gia hạn Subscription" với: tóm tắt thông tin sub cũ (readonly), ngày tính từ (readonly), ngày hết hạn mới (pre-filled, có thể sửa), Deal Code (trống), Ghi chú (trống). | BR-02, BR-05, BR-06 |
| 5 | Sales / CSKH | Review thông tin. (Tuỳ chọn) Chỉnh ngày hết hạn mới, nhập Deal Code, nhập Ghi chú. | — |
| 6 | Sales / CSKH | Click "🔄 Gia hạn". | — |
| 7 | System | [Gateway] **Ngày hết hạn mới đã nhập?** | — |
| — | → Không | Hiển thị lỗi inline "Ngày hết hạn là bắt buộc". Giữ nguyên form, không đóng modal. | → EF-02 |
| — | → Có | Tiếp tục bước 8. | — |
| 8 | System | Tạo subscription mới với `status = DRAFT`, `previousSubId = sub_cũ.id`, và thông tin kế thừa từ BR-02. | BR-02, BR-03 |
| 9 | System | Cập nhật sub cũ: `status = RENEWED`. | BR-04 |
| 10 | System | Ghi timeline và audit log cho cả sub cũ và sub mới theo BR-08. | BR-08 |
| 11 | System | Đóng modal. Hiển thị toast thành công: "Đã tạo Subscription gia hạn — [newId] ở trạng thái Draft". | — |
| 12 | System | Điều hướng sang trang UC-SUB-03 của subscription mới. | BR-07 |

### 2.2 Luồng phụ

#### AF-01 — Hủy gia hạn

Kích hoạt tại bước 5 hoặc 6 khi người dùng muốn hủy bỏ.

| Bước | Tác nhân | Hành động |
|---|---|---|
| 1 | Sales / CSKH | Nhấn "Hủy" hoặc click vùng overlay ngoài modal. |
| 2 | System | Đóng modal ngay lập tức. Không tạo record. Không thay đổi sub cũ. |
| → | — | Quay lại UC-SUB-03 của sub cũ (không thay đổi). |

### 2.3 Luồng ngoại lệ

#### EF-01 — Sub không tồn tại hoặc status không hợp lệ

Kích hoạt tại bước 2.

| Bước | Tác nhân | Hành động |
|---|---|---|
| 1 | System | Hiển thị toast lỗi: "Không thể gia hạn — Subscription không hợp lệ hoặc trạng thái không cho phép gia hạn". |
| 2 | System | Không mở modal. Không thay đổi dữ liệu. |

#### EF-02 — Ngày hết hạn trống khi submit

Kích hoạt tại bước 7 (nhánh → Không).

| Bước | Tác nhân | Hành động |
|---|---|---|
| 1 | System | Hiển thị lỗi inline bên dưới field Ngày hết hạn mới: "Ngày hết hạn là bắt buộc". |
| 2 | System | Giữ nguyên form, không đóng modal, không tạo record. |

---

## 3. Mô tả giao diện

### 3.1 Wireframe

```
┌─ Gia hạn Subscription ────────────────────────────────────┐
│                                                             │
│  ┌── Thông tin gia hạn ──────────────────────────────────┐ │
│  │  Gia hạn từ:            SUB-2026-001                  │ │
│  │  Gói:                   EDR Pro (12 tháng)            │ │
│  │  Trạng thái hiện tại:   [● ACTIVE]                    │ │
│  │  Ngày tính từ:          ngày hết hạn cũ (20/01/2026)  │ │
│  │  Ngày hết hạn mới:      [  20/01/2027  ▼]             │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  Deal Code (tùy chọn):  [________________________]         │
│  Ghi chú (tùy chọn):   [________________________]         │
│                                                             │
│              [Hủy]              [🔄 Gia hạn]              │
└─────────────────────────────────────────────────────────────┘
```

> **Demo HTML:** [docs/demo/v2.4.0_subscriptions.html](../../demo/v2.4.0_subscriptions.html) — hàm `subOpenRenew(id)`, `subConfirmRenew()`

**Screenshot — Modal Gia hạn (sub đang ACTIVE):**

![Gia hạn Subscription — modal ACTIVE](../../assets/M-03_subscriptions/UC-SUB-07_screen_modal_renew_active.png)

**Screenshot — Modal Gia hạn (sub đang SUSPENDED — ngày tính từ hôm nay):**

![Gia hạn Subscription — modal SUSPENDED](../../assets/M-03_subscriptions/UC-SUB-07_screen_modal_renew_suspended.png)

### 3.2 Thành phần giao diện

| # | Thành phần | Loại | Mô tả |
|---|---|---|---|
| 1 | Modal header | Text | Tiêu đề "Gia hạn Subscription", không thể kéo thay đổi kích thước. |
| 2 | Khung "Thông tin gia hạn" | Panel readonly | Hiển thị: mã sub cũ (Gia hạn từ), tên gói + thời hạn (Gói), badge trạng thái hiện tại (Trạng thái hiện tại), ngày tính từ kèm ghi chú (Ngày tính từ). Toàn bộ readonly — không chỉnh sửa được. |
| 3 | Field "Ngày hết hạn mới" | Date picker | Pre-filled theo BR-05. Cho phép người dùng chọn lại ngày khác. Bắt buộc khi submit. |
| 4 | Field "Deal Code" | Text input | Tuỳ chọn. Trống ban đầu. Không validate format. |
| 5 | Field "Ghi chú" | Textarea | Tuỳ chọn. Trống ban đầu. |
| 6 | Nút "Hủy" | Ghost button | Đóng modal, không thay đổi dữ liệu. Kích hoạt AF-01. |
| 7 | Nút "🔄 Gia hạn" | Primary button | Submit form, thực hiện bước 7–12 luồng chính. Disabled trong khi đang xử lý (loading state). |

### 3.3 Bảng field

| # | Field | Bắt buộc | Mô tả |
|---|---|---|---|
| 1 | Ngày hết hạn mới | Có | Pre-filled theo BR-05 (tính từ endDate cũ hoặc today tuỳ trạng thái sub). Người dùng có thể chỉnh. Bắt buộc khi submit. |
| 2 | Deal Code | Không | Text input mới cho lần gia hạn này. Không kế thừa từ sub cũ (BR-06). |
| 3 | Ghi chú | Không | Textarea. Không kế thừa từ sub cũ (BR-06). |

---

## 4. Acceptance Criteria

### Nhóm 1: Điều kiện hiển thị nút Gia hạn

| Mã | Given | When | Then |
|---|---|---|---|
| AC-SUB-07-01 | Sub có `status = ACTIVE`. | Xem hero section UC-SUB-03. | Nút "🔄 Gia hạn" hiển thị và active. |
| AC-SUB-07-02 | Sub có `status = SUSPENDED`. | Xem hero section UC-SUB-03. | Nút "🔄 Gia hạn" hiển thị và active. |
| AC-SUB-07-03 | Sub có `status = EXPIRED`. | Xem hero section UC-SUB-03. | Nút "🔄 Gia hạn" hiển thị và active. |
| AC-SUB-07-04 | Sub có `status ∈ {DRAFT, REVOKED, RENEWED, PENDING_PROVISION}`. | Xem hero section UC-SUB-03. | Nút "🔄 Gia hạn" không hiển thị. |

### Nhóm 2: Nội dung modal

| Mã | Given | When | Then |
|---|---|---|---|
| AC-SUB-07-05 | Sub ACTIVE "SUB-2026-001", gói "EDR Pro 12 tháng", `endDate = 20/01/2026`. | Click "🔄 Gia hạn". | Modal mở. Hiển thị "Gia hạn từ: SUB-2026-001", "Gói: EDR Pro (12 tháng)", "Trạng thái hiện tại: ACTIVE", "Ngày tính từ: 20/01/2026 (ngày hết hạn cũ)". Ngày hết hạn mới pre-filled = 20/01/2027. |
| AC-SUB-07-06 | Sub SUSPENDED "SUB-2026-002", `endDate = 30/06/2026`, ngày hiện tại = 09/07/2026. | Click "🔄 Gia hạn". | "Ngày tính từ" hiển thị "09/07/2026 (hôm nay)". Ngày hết hạn mới pre-filled = 08/07/2027 (09/07/2026 + 12 tháng - 1 ngày). |
| AC-SUB-07-07 | Modal vừa mở. | Xem các field Deal Code và Ghi chú. | Cả 2 field đều trống. Không có giá trị kế thừa từ sub cũ. |

### Nhóm 3: Tạo subscription mới thành công

| Mã | Given | When | Then |
|---|---|---|---|
| AC-SUB-07-08 | Form hợp lệ, ngày hết hạn mới = 20/01/2027. | Click "🔄 Gia hạn". | Sub mới được tạo với `status = DRAFT`, `previousSubId = sub_cũ.id`, kế thừa `contractId`, `packageId`, `packageName`, `customerId`, `seatCount`/`licenseQty` từ sub cũ. |
| AC-SUB-07-09 | Gia hạn thành công. | Kiểm tra sub cũ. | Sub cũ có `status = RENEWED`. |
| AC-SUB-07-10 | Gia hạn thành công, sub cũ = "SUB-2026-001", sub mới = "SUB-2026-005". | Xem timeline của cả 2 sub. | Timeline sub mới ghi: "DRAFT tạo để gia hạn · Gia hạn từ SUB-2026-001". Timeline sub cũ ghi: "Đã được gia hạn · Subscription kế tiếp: SUB-2026-005". |
| AC-SUB-07-11 | Gia hạn thành công. | Hệ thống xử lý xong. | Modal đóng. Toast hiển thị "Đã tạo Subscription gia hạn — [newId] ở trạng thái Draft". Hệ thống điều hướng sang UC-SUB-03 của sub mới. |

### Nhóm 4: Tính ngày hết hạn theo trạng thái sub cũ

| Mã | Given | When | Then |
|---|---|---|---|
| AC-SUB-07-12 | Sub ACTIVE, `endDate = 01/03/2026`, gói 12 tháng. | Mở modal gia hạn. | Ngày hết hạn mới pre-filled = 28/02/2027 (01/03/2026 + 12 tháng - 1 ngày). "Ngày tính từ" hiển thị "01/03/2026 (ngày hết hạn cũ)". |
| AC-SUB-07-13 | Sub EXPIRED, `endDate = 15/12/2025`, gói 6 tháng. | Mở modal gia hạn. | Ngày hết hạn mới pre-filled = 14/06/2026 (15/12/2025 + 6 tháng - 1 ngày). "Ngày tính từ" hiển thị "15/12/2025 (ngày hết hạn cũ)". |
| AC-SUB-07-14 | Sub SUSPENDED, `endDate = 30/04/2026`, gói 12 tháng, ngày hiện tại = 09/07/2026. | Mở modal gia hạn. | Ngày hết hạn mới pre-filled = 08/07/2027 (09/07/2026 + 12 tháng - 1 ngày). "Ngày tính từ" hiển thị "09/07/2026 (hôm nay)". Không dùng endDate cũ. |

### Nhóm 5: Ngoại lệ

| Mã | Given | When | Then |
|---|---|---|---|
| AC-SUB-07-15 | Sub có `status = RENEWED`. | URL trực tiếp hoặc gọi API gia hạn. | Toast lỗi hiển thị "Không thể gia hạn — Subscription không hợp lệ hoặc trạng thái không cho phép gia hạn". Modal không mở. Không có record nào được tạo. |
| AC-SUB-07-16 | Modal đang mở, người dùng xóa ngày hết hạn mới thành trống. | Click "🔄 Gia hạn". | Lỗi inline hiển thị bên dưới field "Ngày hết hạn là bắt buộc". Modal không đóng. Không có record nào được tạo. Sub cũ không thay đổi trạng thái. |

---

## 5. Lịch sử thay đổi

| Phiên bản | Ngày | Người thực hiện | Mô tả thay đổi |
|---|---|---|---|
| 1.0 | 09/07/2026 | BA | Khởi tạo tài liệu — Draft for Review |

### Review Checklist

> Claude tự review — đánh dấu ✅/❌ trước khi submit cho BA review.

#### Nghiệp vụ
- ✅ Luồng chính bao phủ happy path (12 bước, gateway tại bước 7)
- ✅ Luồng phụ đã định nghĩa: AF-01 (Hủy modal)
- ✅ Luồng ngoại lệ đầy đủ: EF-01 (status không hợp lệ), EF-02 (ngày hết hạn trống)
- ✅ BR đã định nghĩa rõ (BR-01 đến BR-09), bao gồm logic tính ngày theo từng trạng thái
- ✅ AC bao phủ 5 nhóm, 16 AC (≥ 12 theo yêu cầu)
- ✅ Phân biệt rõ 3 case tính ngày: ACTIVE / EXPIRED (từ endDate) vs SUSPENDED (từ today)
- ✅ BR-09 nêu rõ sub mới cần UC-SUB-05 để hoàn tất provisioning

#### Giao diện
- ✅ Wireframe ASCII đúng layout modal
- ✅ Readonly fields đã ghi rõ nguồn dữ liệu và lý do không chỉnh sửa
- ✅ Deal Code và Ghi chú rõ ràng là trường mới, không kế thừa (BR-06)
- ✅ Footer button order đúng: [Hủy] trái · [🔄 Gia hạn] phải
- ✅ Demo reference đúng file `v2.4.0_subscriptions.html` với hàm `subOpenRenew(id)`, `subConfirmRenew()`
