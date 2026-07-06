# UC-CON-03 — Xem Chi tiết Hợp đồng

> Module: M-02 Contract Management | Phiên bản: 1.0 | Ngày: 06/07/2026
> Trạng thái: Draft for Review

---

## 1. Thông tin chung

| Thuộc tính | Nội dung |
|---|---|
| **Tên chức năng** | Xem Chi tiết Hợp đồng |
| **UC ID** | UC-CON-03 |
| **Mô tả** | Sales xem toàn bộ thông tin chi tiết của một hợp đồng: thông tin chính, danh sách subscription, timeline sự kiện, và audit log. Giao diện tổ chức theo tab. |
| **Tác nhân** | Sales, Manager |
| **Tiền điều kiện** | Đã đăng nhập và có quyền `contract:read`. Hợp đồng tồn tại trong hệ thống (chưa bị xóa). |
| **Hậu điều kiện** | (Success) Trang chi tiết hiển thị đúng và đầy đủ thông tin hợp đồng. Không thay đổi dữ liệu. (Failure) Không tìm thấy hợp đồng → redirect về danh sách, hiển thị thông báo lỗi. |
| **Ngoại lệ** | Hợp đồng đã bị xóa → trả về 404, redirect về danh sách. |
| **Quy tắc nghiệp vụ** | BR-01: Mọi thay đổi trạng thái subscription được phản ánh realtime từ webhook — trang detail chỉ đọc, không tự thay đổi trạng thái. BR-02: Pool license chỉ hiển thị với hợp đồng loại Reseller. BR-03: Timeline sắp xếp theo thời gian giảm dần (mới nhất trên cùng). BR-04: Audit log hỗ trợ tìm kiếm theo actor, hành động, chi tiết. |

---

## 2. Luồng nghiệp vụ

### 2.1 Luồng chính

| Bước | Actor | Hành động / Phản hồi |
|---|---|---|
| **1** | Sales | Nhấn vào hàng hợp đồng trên màn hình Danh sách (UC-CON-01), hoặc nhấn nút **"Xem"** trong cột Thao tác. |
| **2** | System | Navigate sang trang Chi tiết. Hiển thị Hero section: icon, mã HĐ, tên khách hàng, badge Loại HĐ, badge Trạng thái, thanh tiến trình thời hạn hợp đồng. |
| **3** | System | Hiển thị action bar: **Sửa**, **+ Thêm Sub**, **Xóa**. |
| **4** | System | Hiển thị tab mặc định **"Thông tin HĐ"** với grid thông tin (4 cột): Khách hàng, Loại HĐ, Ngày ký, Mô tả. Bên dưới là danh sách subscription tóm tắt. |
| **5** | Sales | (Tùy chọn) Chuyển sang các tab khác. |
| **5a** | Sales | Chọn tab **"Subscriptions"** → System hiển thị danh sách subscription đầy đủ theo loại hợp đồng (xem mục 3.3). |
| **5b** | Sales | Chọn tab **"Timeline"** → System hiển thị chuỗi sự kiện sắp xếp giảm dần theo thời gian, lazy-load khi cuộn. |
| **5c** | Sales | Chọn tab **"Audit Log"** → System hiển thị bảng audit log có ô tìm kiếm, lazy-load khi cuộn. |

### 2.2 Luồng phụ

**[AF-01: Từ trang Chi tiết Khách hàng]** — kích hoạt khi Sales xem hợp đồng từ tab "Hợp đồng & Sub" của Customer 360°.

| Bước | Actor | Hành động / Phản hồi |
|---|---|---|
| **1a** | Sales | Nhấn mã hợp đồng trong tab Hợp đồng & Sub của Customer 360°. |
| → | — | Điều hướng sang trang Chi tiết Hợp đồng — luồng tiếp tục từ bước 2. |

### 2.3 Luồng ngoại lệ

**[EF-01: Hợp đồng không tồn tại]** — kích hoạt tại bước 2 nếu ID hợp đồng không hợp lệ hoặc đã bị xóa.

| Bước | Actor | Hành động / Phản hồi |
|---|---|---|
| **2a** | System | Hiển thị toast lỗi: *"Không tìm thấy hợp đồng."* Redirect về Danh sách Hợp đồng. |

---

## 3. Mô tả giao diện

### 3.1 Wireframe

```
┌─────────────────────────────────────────────────────────────┐
│  OneCRM › Hợp đồng › HD-2026-FPT-001                        │  ← Breadcrumb
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────┐  │
│  │  [📄] HD-2026-FPT-001          [Direct] [● Active]   │  │
│  │       FPT Software · Ký: 21/05/2026                  │  │
│  │  ─────────────────────────────────────────────────   │  │
│  │  KH          Loại HĐ    Ngày ký      Mô tả           │  │
│  │  FPT Soft.   Direct     21/05/2026   EDR 200 seat     │  │
│  │  ─────────────────────────────────────────────────   │  │
│  │  ████████████████░░░░  65% · còn 344 ngày            │  │  ← Progress bar
│  │               [ ✏️ Sửa ]  [ + Thêm Sub ]  [ 🗑 Xóa ] │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  [📋 Thông tin HĐ] [🔑 Subscriptions] [📅 Timeline] [📋 Audit] │
│  ──────────────────────────────────────────────────────── │
│  {Nội dung tab hiện tại}                                   │
└─────────────────────────────────────────────────────────────┘

Ghi chú: Progress bar màu xanh (>30 ngày), vàng (≤30 ngày), đỏ (hết hạn/expired).
```

> **Demo HTML:** [docs/demo/v2.3.2_contracts.html](../../demo/v2.3.2_contracts.html) — section `con-view-detail`

---

### 3.2 Các thành phần giao diện

| # | Thành phần | Loại | Mô tả |
|---|---|---|---|
| 1 | Hero section | Card | Hiển thị icon, mã HĐ, tên KH, badges loại + trạng thái, thanh progress thời hạn. Immutable — chỉ đọc. |
| 2 | Action bar | Button group | **Sửa** (secondary) → mở UC-CON-04. **+ Thêm Sub** (primary) → mở modal tạo subscription. **Xóa** (danger/ghost) → trigger UC-CON-06. |
| 3 | Progress bar | Visual | Hiển thị % thời gian hợp đồng đã qua. Màu: xanh `>30 ngày`, vàng `≤30 ngày`, đỏ `expired`. Kèm label "còn X ngày" hoặc "Hết hạn". |
| 4 | Tab bar | Tab navigation | 4 tabs: Thông tin HĐ, Subscriptions, Timeline, Audit Log. Tab active có border-bottom primary. |
| 5 | Info grid | 4-column grid | Hiển thị: Khách hàng (link), Loại HĐ (badge), Ngày ký, Mô tả. |
| 6 | Subscription list | Card list | Danh sách sub theo loại HĐ — xem mục 3.3. |
| 7 | Timeline | Scrollable list | Sự kiện có dot màu theo severity, lazy-load khi cuộn. |
| 8 | Audit log | Searchable table | Cột: Thời gian, Nguồn (badge), Actor, Hành động, Chi tiết, Kết quả. Tìm kiếm debounce 300ms. |

---

### 3.3 Tab Subscriptions theo loại hợp đồng

**Loại DIRECT:**

| Thành phần | Mô tả |
|---|---|
| Sub card | Mã sub, tên gói, badge trạng thái, ngày hết hạn, thanh usage (X/Y seat). |
| License Mirror | Dải màu xanh bên dưới sub card — hiển thị thông tin đồng bộ từ EDR/AV: expiration_date, activated_at, usage thực tế. |
| Nút thêm sub | **"+ Thêm Subscription"** mở modal tạo sub. |

**Loại RESELLER:**

| Thành phần | Mô tả |
|---|---|
| Pool card | Mỗi sản phẩm 1 pool: tên sản phẩm, thanh progress (used/total license), số KH cuối đang dùng. |
| Allocation table | Expand pool → bảng KH cuối: Tên KH, Số seat, Trạng thái sub. Sort được. Khi >10 records: hiện "Xem thêm". |
| Pool status summary | Mini badges: X active · Y grace · Z suspended. |

---

### 3.4 Badge trạng thái hợp đồng

| Trạng thái | Màu nền | Màu chữ | Ý nghĩa |
|---|---|---|---|
| DRAFT | `#F3F4F6` | `#4B5563` | Đang soạn thảo, chưa ký |
| ACTIVE | `#ECFDF5` | `#059669` | Đang hiệu lực |
| EXPIRED | `#FEF2F2` | `#FB2C36` | Hết hạn |
| TERMINATED | `#F3EFFE` | `#7C3AED` | Đã thanh lý |
| PENDING | `#FFFBEB` | `#D97706` | Chờ xử lý |

---

## 4. Acceptance Criteria

### Nhóm 1: Hiển thị đúng thông tin

| AC ID | Given | When | Then |
|---|---|---|---|
| AC-CON-03-01 | Hợp đồng HD-2026-FPT-001 loại DIRECT, trạng thái ACTIVE | Sales nhấn vào hàng trong danh sách | Hero section hiển thị đúng: mã HĐ, tên KH, badge DIRECT, badge ACTIVE, progress bar. |
| AC-CON-03-02 | Hợp đồng loại RESELLER có 2 pool (EDR + AV) | Sales mở tab Subscriptions | Hiển thị 2 pool card riêng biệt, mỗi pool có thanh progress used/total và danh sách KH cuối. |
| AC-CON-03-03 | Hợp đồng loại DIRECT | Sales mở tab Subscriptions | Không hiển thị pool. Chỉ hiển thị danh sách subscription card và License Mirror. |

### Nhóm 2: Progress bar thời hạn

| AC ID | Given | When | Then |
|---|---|---|---|
| AC-CON-03-04 | Hợp đồng còn 15 ngày hết hạn | Sales mở trang chi tiết | Progress bar màu vàng (warn), label "còn 15 ngày". |
| AC-CON-03-05 | Hợp đồng đã hết hạn (expired) | Sales mở trang chi tiết | Progress bar màu đỏ, label "Hết hạn". |

### Nhóm 3: Timeline và Audit Log

| AC ID | Given | When | Then |
|---|---|---|---|
| AC-CON-03-06 | Hợp đồng có 5 sự kiện timeline | Sales chọn tab Timeline | Hiển thị 5 sự kiện, sắp xếp mới nhất trên cùng. |
| AC-CON-03-07 | Audit log có 30 bản ghi | Sales nhập từ khóa "Sales A" vào ô tìm kiếm | Chỉ hiển thị các bản ghi có actor hoặc hành động chứa "Sales A". |

### Nhóm 4: Trường hợp lỗi

| AC ID | Given | When | Then |
|---|---|---|---|
| AC-CON-03-08 | Hợp đồng ID không tồn tại | Sales truy cập URL /contracts/{invalid-id} | Hiển thị toast lỗi "Không tìm thấy hợp đồng." Redirect về danh sách. |

---

## 5. Review Checklist

> Claude tự review — đánh dấu ✅/❌ trước khi submit cho BA review.

### Nghiệp vụ
- ✅ Luồng chính bao phủ happy path
- ✅ AF-01 (từ Customer 360°) đã được định nghĩa
- ✅ EF-01 (không tìm thấy) đã xử lý
- ✅ BR-01 đến BR-04 đã định nghĩa rõ
- ✅ AC bao phủ cả Direct và Reseller

### Giao diện
- ✅ Progress bar màu theo trạng thái
- ✅ Tab Subscriptions khác nhau theo loại HĐ
- ✅ Audit log có search
- ❓ **Open question 1:** Pool của Reseller — khi tổng allocation > pool total, có block tạo sub mới không, hay chỉ cảnh báo? Cần confirm BR.
- ❓ **Open question 2:** Nút "+ Thêm Sub" có hiển thị khi HĐ đã EXPIRED/TERMINATED không? Hay bị disable?
- ❓ **Open question 3:** Timeline và Audit Log của trang Chi tiết HĐ có tách biệt với Timeline/Audit của Customer 360° không? Hay là merge chung?
