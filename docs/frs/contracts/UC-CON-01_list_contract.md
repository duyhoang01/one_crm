# UC-CON-01 — Danh sách Hợp đồng

> Module: M-02 Contract Management | Phiên bản: 1.0 | Ngày: 06/07/2026
> Trạng thái: Draft for Review

---

## 1. Thông tin chung

| Thuộc tính | Nội dung |
|---|---|
| **Mã Use Case** | UC-CON-01 |
| **Tên** | Danh sách Hợp đồng |
| **Mô tả** | Sales xem, tìm kiếm, lọc và sort toàn bộ hợp đồng. Đây là điểm vào trung tâm của module Contract. |
| **Tác nhân** | Sales, Manager |
| **Tiền điều kiện** | Đã đăng nhập hệ thống; có quyền `contract:view`. |
| **Hậu điều kiện** | Không thay đổi dữ liệu. Chỉ đọc và điều hướng. Danh sách hiển thị mặc định theo `contract.createdAt` giảm dần. |
| **Trigger** | Người dùng click menu "Hợp đồng" trên sidebar. |
| **Liên kết** | UC-CON-02 (Thêm mới), UC-CON-03 (Chi tiết), UC-CON-04 (Cập nhật), UC-CON-06 (Xóa) |

### Business Rules

| Mã | Nội dung |
|---|---|
| **BR-01** | Có 2 loại hợp đồng hiển thị trong danh sách: `DIRECT` (badge xanh dương) và `RESELLER` (badge tím). |
| **BR-02** | Nút 🗑️ bị `disabled` khi `subs.length > 0` (áp dụng với cả Manager). Tooltip hiển thị: "Đã có Subscription, không thể xóa". Nút `active` khi `subs.length = 0` và điều hướng sang UC-CON-06. |

---

## 2. Luồng nghiệp vụ

![BPMN — Luồng xem danh sách Hợp đồng](../../assets/M-02_contracts/UC-CON-01_bpmn.png)

### 2.1 Luồng chính

| Bước | Tác nhân | Hành động | Ghi chú |
|---|---|---|---|
| 1 | Sales / Manager | Click menu "Hợp đồng" trên sidebar. | — |
| 2 | System | Tải danh sách hợp đồng, sort mặc định `contract.createdAt` giảm dần, không áp dụng filter nào. | — |
| 3 | Sales / Manager | Nhập từ khoá vào ô tìm kiếm và/hoặc chọn giá trị trong dropdown "Loại HĐ" (tuỳ chọn). | Hai bộ lọc kết hợp với nhau (AND). |
| 4 | System | Lọc realtime, cập nhật counter kết quả và danh sách. Nếu không có kết quả → **EF-01**. | — |
| 5 | Sales / Manager | Click vào header cột để sort. | Chỉ các cột có nhãn "Sortable". |
| 6 | System | Áp dụng sort cho cột được chọn (click lần 1 → asc, lần 2 → desc). Cập nhật icon sort trên cột đó. Reset icon các cột còn lại về `↕`. | — |
| 7 | Sales / Manager | Chọn một trong các hành động: click row, click "+ Thêm Hợp đồng", click ✏️, hoặc click 🗑️. | — |
| 8 | System | Thực hiện kiểm tra điều kiện và điều hướng tương ứng: (a) Click row → UC-CON-03; (b) Click "+ Thêm Hợp đồng" → UC-CON-02; (c) Click ✏️ → UC-CON-04; (d) Click 🗑️: nếu `subs.length > 0` → disabled, hiện tooltip; nếu `subs.length = 0` → UC-CON-06. | Theo BR-02. |

### 2.2 Luồng phụ

#### AF-01 — Xóa bộ lọc

| Bước | Tác nhân | Hành động |
|---|---|---|
| 1 | Sales / Manager | Nhấn nút "Xóa bộ lọc" (Ghost button). |
| 2 | System | Reset ô tìm kiếm về rỗng, dropdown "Loại HĐ" về "Tất cả loại". Render lại toàn bộ danh sách không filter. |

### 2.3 Luồng ngoại lệ

#### EF-01 — Không có kết quả phù hợp

| Bước | Tác nhân | Hành động |
|---|---|---|
| 1 | System | Ẩn bảng danh sách. |
| 2 | System | Hiển thị empty state: icon minh hoạ + text "Không tìm thấy hợp đồng phù hợp". |
| 3 | System | Ẩn pagination, cập nhật counter hiển thị "0 kết quả". |
| 4 | Sales / Manager | (Tuỳ chọn) Nhấn nút "Xóa bộ lọc" trên empty state → **AF-01**. |

---

## 3. Mô tả giao diện

### 3.1 Tổng quan màn hình

![Wireframe — Danh sách Hợp đồng](../../assets/M-02_contracts/UC-CON-01_wireframe.png)

Màn hình Danh sách Hợp đồng bao gồm 3 khu vực chính:
1. **Thanh công cụ (Toolbar):** Ô tìm kiếm, dropdown Loại HĐ, nút "Xóa bộ lọc", nút "+ Thêm Hợp đồng".
2. **Bảng danh sách:** Hiển thị các hợp đồng theo bộ lọc và sort hiện tại.
3. **Thanh phân trang (Pagination):** Counter tổng số kết quả và điều hướng trang.

### 3.2 Mô tả component

#### Thanh công cụ

| Component | Loại | Mô tả |
|---|---|---|
| Ô tìm kiếm | Text input | Tìm theo `contract.code`, `contract.customerName`, `contract.description`. Filter realtime khi gõ. Placeholder: "Tìm theo mã HĐ, khách hàng...". |
| Dropdown "Loại HĐ" | Select | Các giá trị: **Tất cả loại** (mặc định), **DIRECT**, **RESELLER**. |
| Nút "Xóa bộ lọc" | Ghost button | Luôn hiển thị. Thực hiện **AF-01**. |
| Nút "+ Thêm Hợp đồng" | Primary button | Điều hướng sang UC-CON-02. |

#### Bảng danh sách

| # | Cột | Nguồn dữ liệu | Mô tả hiển thị | Sortable |
|---|---|---|---|---|
| 1 | **Mã HĐ** | `contract.code` | Dòng 1: mã HĐ — font monospace, bold, màu navy. Dòng 2: `contract.createdAt` định dạng `dd/MM/yyyy`, font nhỏ, màu xám. | ✅ |
| 2 | **Khách hàng** | `contract.customerName` | Dòng 1: tên khách hàng. Dòng 2: loại KH (B2B / Reseller / B2C / Other), font nhỏ, màu xám. | ✅ |
| 3 | **Loại HĐ** | `contract.type` | Badge: `DIRECT` → xanh dương; `RESELLER` → tím. | ✅ |
| 4 | **Ngày ký** | `contract.signedDate` | Định dạng `dd/MM/yyyy`. Hiển thị "—" khi `signedDate = null`. | ✅ |
| 5 | **Subscriptions** | `contract.subs` | Dòng 1: tổng số sub, ví dụ "3 subs". Dòng 2: số sub có status=ACTIVE, màu xanh lá, ví dụ "2 active". Hiển thị "—" khi `subs.length = 0`. | ✅ |
| 6 | **Pool License** | `contract.poolItems` | Chỉ với `RESELLER`: mỗi pool item một dòng theo định dạng `{productName}: {allocatedQty}/{poolTotal}`. Với `DIRECT`: hiển thị "—". | ❌ |
| 7 | **Thao tác** | — | Nút ✏️ (luôn active). Nút 🗑️: `disabled` khi `subs.length > 0` (tooltip "Đã có Subscription, không thể xóa"), `active` khi `subs.length = 0`. | ❌ |

#### Pagination

| Component | Mô tả |
|---|---|
| Counter | Hiển thị "X–Y / N hợp đồng". |
| Phân trang | 10 records/trang. Nút trang hiện tại được highlight. |
| Ẩn khi EF-01 | Không hiển thị khi không có kết quả. |

#### Empty State (EF-01)

| Component | Mô tả |
|---|---|
| Icon | Icon minh hoạ trạng thái rỗng. |
| Text | "Không tìm thấy hợp đồng phù hợp". |
| Nút | "Xóa bộ lọc" — thực hiện AF-01. |

---

## 4. Acceptance Criteria

### Nhóm 1: Hiển thị danh sách cơ bản

| Mã | Given | When | Then |
|---|---|---|---|
| AC-CON-01-01 | Có 4 hợp đồng trong hệ thống (2 DIRECT, 2 RESELLER). | Mở màn hình Danh sách. | Hiển thị đủ 4 HĐ. Cột Pool License: có dữ liệu với RESELLER, hiển thị "—" với DIRECT. |
| AC-CON-01-02 | HĐ DIRECT có 3 sub (2 ACTIVE, 1 SUSPENDED). | Xem cột Subscriptions. | Dòng 1: "3 subs". Dòng 2: "2 active" màu xanh lá. |
| AC-CON-01-03 | HĐ RESELLER có 2 pool: EDR 200/500, AV 100/300. | Xem cột Pool License. | 2 dòng: "EDR/EPP: 200/500" và "Antivirus (AV): 100/300". |
| AC-CON-01-04 | HĐ có `signedDate = null`. | Xem cột Ngày ký. | Hiển thị "—". |
| AC-CON-01-05 | HĐ chưa có sub nào (`subs.length = 0`). | Xem cột Subscriptions. | Hiển thị "—" (không hiển thị "0 subs"). |

### Nhóm 2: Tìm kiếm và lọc

| Mã | Given | When | Then |
|---|---|---|---|
| AC-CON-01-06 | Có HĐ mã "HD-CMC-2025-001". | Nhập "CMC-2025" vào ô tìm kiếm. | Chỉ hiển thị HĐ match. Counter và pagination cập nhật. |
| AC-CON-01-07 | Danh sách có cả DIRECT và RESELLER. | Chọn filter "RESELLER". | Chỉ hiển thị các HĐ RESELLER. |
| AC-CON-01-08 | Đang áp dụng filter "RESELLER" + search "HD-2025". | Nhấn "Xóa bộ lọc". | Ô tìm kiếm rỗng, dropdown về "Tất cả loại", toàn bộ HĐ hiển thị. |
| AC-CON-01-09 | Không có HĐ nào match bộ lọc. | Nhập từ khoá không khớp. | Bảng ẩn, empty state hiển thị, counter "0 kết quả", pagination ẩn. |

### Nhóm 3: Sort

| Mã | Given | When | Then |
|---|---|---|---|
| AC-CON-01-10 | Nhiều HĐ, chưa sort theo "Mã HĐ". | Click header "Mã HĐ" lần 1. | Sort asc (A→Z), icon ↑ trên cột "Mã HĐ", các cột khác reset về ↕. |
| AC-CON-01-11 | Đang sort "Mã HĐ" asc. | Click header "Mã HĐ" lần 2. | Sort desc (Z→A), icon ↓. |
| AC-CON-01-12 | Đang sort "Mã HĐ". | Click header "Subscriptions". | Sort theo tổng số sub, icon ↑ trên cột "Subscriptions", cột "Mã HĐ" reset về ↕. |
| AC-CON-01-13 | Nhiều HĐ, một số có `signedDate = null`. | Click header "Ngày ký". | Sort asc theo ngày, HĐ có `signedDate = null` xuống cuối. |

### Nhóm 4: Điều hướng

| Mã | Given | When | Then |
|---|---|---|---|
| AC-CON-01-14 | Sales đang xem danh sách. | Click vào row "HD-CMC-2025-001". | Điều hướng sang UC-CON-03. |
| AC-CON-01-15 | Sales đang xem danh sách. | Click ✏️ trên row. | Điều hướng sang UC-CON-04. |
| AC-CON-01-16 | HĐ chưa có sub (`subs.length = 0`). | Sales click 🗑️. | Điều hướng sang UC-CON-06. |
| AC-CON-01-17 | Sales đang xem danh sách. | Click "+ Thêm Hợp đồng". | Điều hướng sang UC-CON-02. |

### Nhóm 5: Trạng thái nút xóa

| Mã | Given | When | Then |
|---|---|---|---|
| AC-CON-01-18 | HĐ có `subs.length > 0`. | Xem row trong danh sách. | Nút 🗑️ ở trạng thái `disabled`. Hover hiển thị tooltip "Đã có Subscription, không thể xóa". |
| AC-CON-01-19 | HĐ có `subs.length = 0`. | Xem row trong danh sách. | Nút 🗑️ ở trạng thái `active`. |
| AC-CON-01-20 | 1 HĐ có sub, 1 HĐ không có sub — cùng hiển thị trên màn hình. | Xem danh sách. | HĐ có sub: 🗑️ `disabled`. HĐ không có sub: 🗑️ `active`. Cả 2 trạng thái cùng tồn tại trên màn hình. |

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
