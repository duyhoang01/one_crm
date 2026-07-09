# UC-SUB-01 — Danh sách Subscription

> Module: M-03 Subscription Management | Phiên bản: 1.0 | Ngày: 08/07/2026
> Trạng thái: Draft for Review

---

## 1. Thông tin chung

| Thuộc tính | Nội dung |
|---|---|
| **Mã Use Case** | UC-SUB-01 |
| **Tên** | Danh sách Subscription |
| **Mô tả** | Sales / Manager xem, tìm kiếm, lọc và sort toàn bộ subscription từ tất cả hợp đồng. Đây là điểm vào trung tâm của module Subscription. |
| **Tác nhân** | Sales, Manager |
| **Tiền điều kiện** | Đã đăng nhập hệ thống; có quyền `subscription:view`. |
| **Hậu điều kiện** | Không thay đổi dữ liệu. Chỉ đọc và điều hướng. Danh sách hiển thị mặc định theo `sub.createdAt` giảm dần. |
| **Trigger** | Người dùng click menu "Subscription" trên sidebar. |
| **Liên kết** | UC-SUB-02 (Tạo mới), UC-SUB-03 (Chi tiết), UC-SUB-04 (Chỉnh sửa), UC-SUB-06 (Xóa Draft) |

### Business Rules

| Mã | Nội dung |
|---|---|
| **BR-01** | Danh sách tổng hợp toàn bộ subscription từ tất cả hợp đồng, không phân biệt hợp đồng hay khách hàng. |
| **BR-02** | Sort mặc định theo `sub.createdAt` giảm dần (bản ghi mới nhất lên đầu). |
| **BR-03** | Phân trang 10 bản ghi/trang. |
| **BR-04** | Nút ✏️ Sửa: chỉ hiển thị và active khi `sub.status = DRAFT`. Ẩn hoàn toàn với các trạng thái khác. |
| **BR-05** | Nút 🗑️ Xóa: chỉ hiển thị và active khi `sub.status = DRAFT`. Với các trạng thái khác: hiển thị ở trạng thái `disabled`, tooltip "Chỉ xóa được khi ở trạng thái Draft". |
| **BR-06** | Filter "Sắp hết hạn": lọc các sub có `sub.endDate` trong vòng 30 ngày kể từ hôm nay VÀ `sub.status = ACTIVE`. |
| **BR-07** | Bảy trạng thái subscription: `DRAFT`, `PENDING_PROVISION`, `ACTIVE`, `SUSPENDED`, `EXPIRED`, `REVOKED`, `RENEWED`. Mỗi trạng thái hiển thị badge màu riêng biệt (xem §3.2). |
| **BR-08** | Tìm kiếm áp dụng đồng thời trên các field: `sub.id`, `sub.customerName`, `sub.packageName`, `sub.beneficiaryName`. Không phân biệt hoa thường. |

---

## 2. Luồng nghiệp vụ

### 2.1 Luồng chính

| Bước | Tác nhân | Hành động | Ghi chú |
|---|---|---|---|
| 1 | Sales / Manager | Click menu "Subscription" trên sidebar. | — |
| 2 | System | Tải danh sách tất cả subscription, sort mặc định `sub.createdAt` giảm dần, không áp dụng filter nào. | BR-01, BR-02 |
| 3 | Sales / Manager | (Tuỳ chọn) Nhập từ khoá vào ô tìm kiếm và/hoặc chọn giá trị trong các dropdown lọc. | BR-08 |
| 4 | System | Lọc realtime, cập nhật counter và danh sách. Nếu không có kết quả → **EF-01**. | — |
| 5 | Sales / Manager | (Tuỳ chọn) Click header cột để sort. | Chỉ các cột có nhãn "Sortable". |
| 6 | System | Áp dụng sort cho cột được chọn (click lần 1 → tăng dần, lần 2 → giảm dần). Cập nhật icon sort trên cột đó. Reset icon các cột còn lại về `↕`. | — |
| 7 | Sales / Manager | Chọn một trong các hành động: click row, click "+ Thêm Subscription", click ✏️, click 🗑️, bật toggle "Sắp hết hạn". | — |
| 8 | System | Thực hiện kiểm tra điều kiện và điều hướng: (a) Click row → UC-SUB-03; (b) "+ Thêm Subscription" → UC-SUB-02; (c) ✏️ → UC-SUB-04; (d) 🗑️ active → UC-SUB-06; (e) 🗑️ disabled → hiện tooltip; (f) Toggle "Sắp hết hạn" → AF-02. | BR-04, BR-05 |

### 2.2 Luồng phụ

#### AF-01 — Xóa bộ lọc

| Bước | Tác nhân | Hành động |
|---|---|---|
| 1 | Sales / Manager | Nhấn nút "Xóa bộ lọc". |
| 2 | System | Reset ô tìm kiếm về rỗng, dropdown Trạng thái và Loại HĐ về "Tất cả", tắt toggle "Sắp hết hạn". Render lại toàn bộ danh sách không filter. |

#### AF-02 — Bật / tắt filter "Sắp hết hạn"

| Bước | Tác nhân | Hành động |
|---|---|---|
| 1 | Sales / Manager | Click toggle "Sắp hết hạn". |
| 2 | System | Lọc danh sách: chỉ giữ sub có `endDate` ≤ 30 ngày kể từ hôm nay VÀ `status = ACTIVE`. Cập nhật counter và danh sách. Các bộ lọc khác vẫn giữ nguyên (kết hợp AND). |
| 3 | Sales / Manager | Click lại toggle để tắt. |
| 4 | System | Bỏ điều kiện "Sắp hết hạn", render lại với các bộ lọc còn lại. |

### 2.3 Luồng ngoại lệ

#### EF-01 — Không có kết quả phù hợp

| Bước | Tác nhân | Hành động |
|---|---|---|
| 1 | System | Ẩn bảng danh sách và pagination. |
| 2 | System | Hiển thị empty state: icon minh hoạ + text "Không tìm thấy subscription phù hợp với bộ lọc hiện tại". |
| 3 | System | Cập nhật counter hiển thị "0 kết quả". |
| 4 | Sales / Manager | (Tuỳ chọn) Nhấn "Xóa bộ lọc" trên empty state → **AF-01**. |

---

## 3. Mô tả giao diện

### 3.1 Tổng quan màn hình

> **Demo HTML:** [docs/demo/v2.4.0_subscriptions.html](../../demo/v2.4.0_subscriptions.html)

Màn hình Danh sách Subscription gồm 3 khu vực chính:
1. **Thanh công cụ (Toolbar):** Ô tìm kiếm, dropdown Trạng thái, dropdown Loại HĐ, toggle "Sắp hết hạn", nút "Xóa bộ lọc", nút "+ Thêm Subscription".
2. **Bảng danh sách:** Hiển thị subscription theo bộ lọc và sort hiện tại.
3. **Thanh phân trang (Pagination):** Counter tổng số kết quả và điều hướng trang.

**Screenshot — Màn hình mặc định:**

![Danh sách Subscription — mặc định](../../assets/M-03_subscriptions/UC-SUB-01_screen_list_default.png)

**Screenshot — Filter "Sắp hết hạn" đang bật:**

![Danh sách Subscription — filter Sắp hết hạn](../../assets/M-03_subscriptions/UC-SUB-01_screen_list_expiring.png)

### 3.2 Mô tả component

#### Thanh công cụ

| Component | Loại | Mô tả |
|---|---|---|
| Ô tìm kiếm | Text input | Tìm theo mã sub, tên khách hàng, gói sản phẩm, đơn vị thụ hưởng. Filter realtime khi gõ. Placeholder: "Tìm theo mã sub, gói sản phẩm, khách hàng, đơn vị thụ hưởng...". |
| Dropdown Trạng thái | Select | Các giá trị: **Tất cả trạng thái** (mặc định), DRAFT, PENDING_PROVISION, ACTIVE, SUSPENDED, EXPIRED, REVOKED, RENEWED. |
| Dropdown Loại HĐ | Select | Các giá trị: **Tất cả loại** (mặc định), DIRECT, RESELLER. |
| Toggle "Sắp hết hạn" | Toggle button | Khi bật: chỉ hiện sub ACTIVE có `endDate` ≤ 30 ngày. Kết hợp AND với các filter khác. |
| Nút "Xóa bộ lọc" | Ghost button | Luôn hiển thị. Thực hiện AF-01. |
| Nút "+ Thêm Subscription" | Primary button | Mở UC-SUB-02. |

#### Bảng danh sách

| # | Cột | Nguồn dữ liệu | Mô tả hiển thị | Sortable |
|---|---|---|---|---|
| 1 | **Mã Sub** | `sub.id` | Font monospace, màu navy, bold. | ✅ |
| 2 | **Khách hàng** | `sub.customerName`, `sub.beneficiaryName` | Dòng 1: tên khách hàng. Dòng 2 (chỉ RESELLER): "→ {tên đơn vị thụ hưởng}", font nhỏ, màu xám. | ✅ |
| 3 | **Loại HĐ** | `sub.contractType` | Badge: `DIRECT` → nền xanh dương nhạt, chữ xanh đậm; `RESELLER` → nền vàng nhạt, chữ nâu. | ✅ |
| 4 | **Gói sản phẩm** | `sub.packageName` | Text thường. | ✅ |
| 5 | **Ngày hết hạn** | `sub.endDate` | Định dạng `dd/MM/yyyy`. Hiển thị "—" khi `endDate = null`. Màu đỏ khi `endDate` < hôm nay VÀ `status = ACTIVE`. | ✅ |
| 6 | **Trạng thái** | `sub.status` | Badge màu theo trạng thái (xem bảng badge bên dưới). | ✅ |
| 7 | **Thao tác** | — | Nút ✏️ Sửa: chỉ hiện khi `status = DRAFT` (BR-04). Nút 🗑️ Xóa: disabled với tooltip khi không phải DRAFT, active khi DRAFT (BR-05). | ❌ |

#### Badge trạng thái

| Trạng thái | Màu nền | Màu chữ | Nhãn hiển thị |
|---|---|---|---|
| DRAFT | Xám nhạt | Xám đậm | Draft |
| PENDING_PROVISION | Vàng nhạt | Nâu vàng | Chờ kích hoạt |
| ACTIVE | Xanh lá nhạt | Xanh lá đậm | Đang hoạt động |
| SUSPENDED | Cam nhạt | Cam đậm | Tạm dừng |
| EXPIRED | Đỏ nhạt | Đỏ đậm | Hết hạn |
| REVOKED | Đỏ đậm | Trắng | Đã thu hồi |
| RENEWED | Xanh dương nhạt | Xanh dương đậm | Đã gia hạn |

#### Pagination

| Component | Mô tả |
|---|---|
| Counter | Hiển thị "X–Y / N subscription". |
| Phân trang | 10 bản ghi/trang (BR-03). Nút trang hiện tại được highlight. |
| Ẩn khi EF-01 | Không hiển thị khi danh sách rỗng. |

---

## 4. Acceptance Criteria

### Nhóm 1: Hiển thị danh sách cơ bản

| Mã | Given | When | Then |
|---|---|---|---|
| AC-SUB-01-01 | Hệ thống có 15 subscription từ 5 hợp đồng khác nhau. | Mở màn hình Danh sách. | Hiển thị 10 bản ghi đầu tiên (trang 1/2), sort theo `createdAt` giảm dần. Counter hiển thị "1–10 / 15 subscription". |
| AC-SUB-01-02 | Sub thuộc hợp đồng RESELLER, có `beneficiaryName = "Công ty ABC"`. | Xem cột Khách hàng. | Dòng 1: tên khách hàng. Dòng 2: "→ Công ty ABC". |
| AC-SUB-01-03 | Sub có `endDate = null`. | Xem cột Ngày hết hạn. | Hiển thị "—". |
| AC-SUB-01-04 | Sub có status = DRAFT. | Xem cột Thao tác. | Nút ✏️ và 🗑️ cùng hiển thị và active. |
| AC-SUB-01-05 | Sub có status = ACTIVE. | Xem cột Thao tác. | Nút ✏️ ẩn. Nút 🗑️ hiển thị ở trạng thái disabled. Hover hiện tooltip "Chỉ xóa được khi ở trạng thái Draft". |

### Nhóm 2: Tìm kiếm

| Mã | Given | When | Then |
|---|---|---|---|
| AC-SUB-01-06 | Có sub mã "SUB-2026-001". | Nhập "2026-001" vào ô tìm kiếm. | Chỉ hiển thị sub match. Counter cập nhật. |
| AC-SUB-01-07 | Có sub của khách hàng "FPT Software". | Nhập "fpt" (chữ thường) vào ô tìm kiếm. | Hiển thị tất cả sub của FPT Software (không phân biệt hoa thường). |
| AC-SUB-01-08 | Có sub với `beneficiaryName = "Mekong Foods"`. | Nhập "Mekong" vào ô tìm kiếm. | Sub đó hiển thị trong kết quả. |
| AC-SUB-01-09 | Nhập từ khoá không khớp bất kỳ field nào. | Nhập "xxxxxxx". | Empty state hiển thị, counter "0 kết quả", pagination ẩn. |

### Nhóm 3: Lọc

| Mã | Given | When | Then |
|---|---|---|---|
| AC-SUB-01-10 | Danh sách có sub với nhiều trạng thái khác nhau. | Chọn filter "ACTIVE". | Chỉ hiển thị sub có `status = ACTIVE`. |
| AC-SUB-01-11 | Danh sách có cả sub DIRECT và RESELLER. | Chọn filter "RESELLER". | Chỉ hiển thị sub thuộc hợp đồng RESELLER. |
| AC-SUB-01-12 | Có 3 sub ACTIVE: 1 hết hạn sau 15 ngày, 1 sau 45 ngày, 1 đã EXPIRED. | Bật toggle "Sắp hết hạn". | Chỉ hiển thị sub ACTIVE hết hạn sau 15 ngày. Sub 45 ngày và EXPIRED không hiển thị. |
| AC-SUB-01-13 | Đang filter "ACTIVE" + search "FPT" + toggle "Sắp hết hạn" bật. | Nhấn "Xóa bộ lọc". | Tất cả filter reset, toàn bộ subscription hiển thị. |
| AC-SUB-01-14 | Đang filter "RESELLER" + search "CMC". | Kết hợp 2 bộ lọc. | Chỉ hiển thị sub RESELLER có chứa "CMC" trong các field tìm kiếm (AND logic). |

### Nhóm 4: Sort

| Mã | Given | When | Then |
|---|---|---|---|
| AC-SUB-01-15 | Chưa sort theo "Ngày hết hạn". | Click header "Ngày hết hạn" lần 1. | Sort tăng dần (gần nhất lên đầu), icon ↑ trên cột đó, các cột khác reset về ↕. |
| AC-SUB-01-16 | Đang sort "Ngày hết hạn" tăng dần. | Click header "Ngày hết hạn" lần 2. | Sort giảm dần, icon ↓. |
| AC-SUB-01-17 | Đang sort "Ngày hết hạn". | Click header "Trạng thái". | Sort theo trạng thái, icon ↑ trên "Trạng thái", cột "Ngày hết hạn" reset về ↕. |

### Nhóm 5: Điều hướng và thao tác

| Mã | Given | When | Then |
|---|---|---|---|
| AC-SUB-01-18 | Sales đang xem danh sách. | Click vào row bất kỳ. | Điều hướng sang UC-SUB-03 (Chi tiết). |
| AC-SUB-01-19 | Sales đang xem danh sách. | Click nút "+ Thêm Subscription". | Mở modal UC-SUB-02. |
| AC-SUB-01-20 | Sub có status = DRAFT. | Sales click ✏️. | Mở modal UC-SUB-04 với dữ liệu của sub đó. |
| AC-SUB-01-21 | Sub có status = DRAFT. | Sales click 🗑️. | Mở modal xác nhận UC-SUB-06. |

---

## 5. Review Checklist

> Claude tự review — đánh dấu ✅/❌ trước khi submit cho BA review.

### Nghiệp vụ
- ✅ Luồng chính bao phủ happy path
- ✅ Luồng phụ đã định nghĩa (AF-01 xóa bộ lọc, AF-02 sắp hết hạn)
- ✅ Luồng ngoại lệ đã xử lý (EF-01 không có kết quả)
- ✅ BR đã định nghĩa rõ (BR-01 đến BR-08)
- ✅ AC bao phủ các trường hợp quan trọng (5 nhóm, 21 AC)
- ✅ Nội dung bám sát demo v2.4.0

### Giao diện
- ✅ Mô tả UI đủ chi tiết (toolbar, bảng, badge, pagination)
- ✅ Component states đã mô tả (disabled button + tooltip, empty state)
- ✅ Badge trạng thái đã định nghĩa đủ 7 loại
