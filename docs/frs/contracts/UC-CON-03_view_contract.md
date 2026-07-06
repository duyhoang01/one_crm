# UC-CON-03 — Xem Chi tiết Hợp đồng

> Module: M-02 Contract Management | Phiên bản: 1.0 | Ngày: 06/07/2026
> Trạng thái: Draft for Review

---

## 1. Thông tin chung

| Thuộc tính | Nội dung |
|---|---|
| **Tên chức năng** | Xem Chi tiết Hợp đồng |
| **UC ID** | UC-CON-03 |
| **Mô tả** | Sales xem toàn bộ thông tin của một hợp đồng: thông tin cơ bản, danh sách Subscription (DIRECT) hoặc License Pool (RESELLER), file đính kèm, và audit log. Màn hình chỉ đọc — không thay đổi dữ liệu. |
| **Tác nhân** | Sales, Manager |
| **Tiền điều kiện** | Đã đăng nhập và có quyền `contract:view`. Hợp đồng tồn tại trong hệ thống (chưa bị xóa). |
| **Hậu điều kiện** | (Success) Trang chi tiết hiển thị đúng và đầy đủ thông tin hợp đồng. Không thay đổi dữ liệu. (Failure) Hợp đồng không tìm thấy → toast lỗi, redirect về Danh sách. |
| **Điểm vào** | (a) Click vào row hợp đồng trong UC-CON-01. (b) Click mã HĐ trong Tab Hợp đồng & Sub của UC-CUS-03 (Customer 360°). |

### Quy tắc nghiệp vụ

| BR ID | Nội dung |
|---|---|
| BR-01 | Section **Subscription** (DIRECT) chỉ hiển thị với HĐ loại DIRECT. Section **License Pool** chỉ hiển thị với HĐ loại RESELLER. Không trộn lẫn. |
| BR-02 | `activated_at` và `expires_at` trong Date Block lấy từ `license_mirror`. CRM không tự tính — nếu chưa nhận event webhook → hiển thị placeholder "—". |
| BR-03 | Timeline sắp xếp DESC theo `occurred_at` (mới nhất trên cùng). Chỉ hiển thị event có `internal_only = false`. Lazy load, không search/filter ở Sprint 0. |
| BR-04 | Audit Log sắp xếp DESC theo `created_at`. Scope: `entity_type = 'CONTRACT' AND entity_id = {id}`. Search client-side, debounce 300ms. |
| BR-05 | Trạng thái sub được phản ánh qua webhook — trang detail chỉ đọc, không tự thay đổi trạng thái. |

---

## 2. Luồng nghiệp vụ

### 2.1 Luồng chính

| Bước | Actor | Hành động / Phản hồi |
|---|---|---|
| **1** | Sales | Nhấn vào row hợp đồng trong Danh sách (UC-CON-01) hoặc nhấn mã HĐ trong tab Hợp đồng & Sub của Customer 360° (UC-CUS-03). |
| **2** | System | Navigate sang trang Chi tiết. Hiển thị **Contract Header**: icon 📄, mã HĐ (font monospace, navy, bold), tên KH (link → Customer 360°), badge Loại HĐ, ngày ký (nếu có). |
| **3** | System | Hiển thị **Action bar**: **✏️ Chỉnh sửa** → UC-CON-04; **+ Thêm Subscription** (chỉ DIRECT); **🗑️ Xóa** → UC-CON-06 (disabled nếu subs.length > 0). |
| **4** | System | Hiển thị **panel Thông tin chung**: grid 4 cột — Mã HĐ (readonly), Khách hàng (link), Loại HĐ (badge), Ngày ký, Mô tả. |
| **5** | System | Hiển thị phần nội dung theo loại HĐ: DIRECT → panel Subscriptions; RESELLER → panel License Pool. |
| **6** | System | Hiển thị **panel Đính kèm** (accordion collapsible, xem chi tiết tại UC-CON-05). |
| **7** | System | Hiển thị **panel Audit Log** (cuộn + tìm kiếm, xem mục 3.4). |
| **8** | Sales | (Tuỳ chọn) Tương tác với các panel: mở rộng/thu gọn, cuộn lazy load, tìm kiếm audit log. |

### 2.2 Luồng phụ

**[AF-01: Từ Customer 360°]** — kích hoạt tại bước 1 khi entry point là tab Hợp đồng & Sub.

| Bước | Actor | Hành động / Phản hồi |
|---|---|---|
| **1a** | Sales | Tại Customer 360° (UC-CUS-03), tab Hợp đồng & Sub, nhấn mã hợp đồng. |
| → | — | Điều hướng sang trang Chi tiết Hợp đồng — luồng tiếp tục từ bước 2. |

**[AF-02: Thêm Subscription (DIRECT)]** — kích hoạt tại bước 3 khi Sales nhấn "+ Thêm Subscription".

| Bước | Actor | Hành động / Phản hồi |
|---|---|---|
| **3a** | Sales | Nhấn **"+ Thêm Subscription"** trong action bar (chỉ hiển thị với DIRECT). |
| → | — | Điều hướng sang UC-SUB (tạo sub mới, pre-fill contract_id). |

**[AF-03: Thêm Pool License (RESELLER)]** — kích hoạt tại panel License Pool.

| Bước | Actor | Hành động / Phản hồi |
|---|---|---|
| **5a** | Sales | Nhấn **"+ Thêm Pool"** hoặc **"+ Thêm sản phẩm vào Pool"** trong panel License Pool. |
| → | — | Điều hướng sang luồng AF-01 của UC-CON-04 (Thêm Pool License). |

### 2.3 Luồng ngoại lệ

**[EF-01: Hợp đồng không tìm thấy]** — kích hoạt khi ID không hợp lệ hoặc HĐ đã bị xóa.

| Bước | Actor | Hành động / Phản hồi |
|---|---|---|
| **2a** | System | Hiển thị toast lỗi: *"Không tìm thấy hợp đồng."* Redirect về Danh sách Hợp đồng (UC-CON-01). |

---

## 3. Mô tả giao diện

### 3.1 Contract Header

```
┌─────────────────────────────────────────────────────────────┐
│  OneCRM › Hợp đồng › HD-CMC-2026-001                        │  ← Breadcrumb
├─────────────────────────────────────────────────────────────┤
│  📄  HD-CMC-2026-001        [Direct]                        │
│      FPT Software · Ký: 01/07/2026                         │
│                                                             │
│              [ ✏️ Chỉnh sửa ]  [ + Thêm Sub ]  [ 🗑 Xóa ] │
└─────────────────────────────────────────────────────────────┘
```

**Badge Loại HĐ:**

| Loại | Màu nền | Màu chữ |
|---|---|---|
| DIRECT | `#EFF6FF` | `#1D4ED8` |
| RESELLER | `#F5F3FF` | `#7C3AED` |

**Nút "🗑️ Xóa"**: disabled (opacity 0.5, cursor not-allowed, tooltip "Đã có Subscription, không thể xóa") khi `subs.length > 0`. Active khi `subs.length = 0`.

---

### 3.2 Panel Thông tin chung

Grid 4 cột, hiển thị dưới Contract Header:

| # | Field | Nguồn dữ liệu | Ghi chú |
|---|---|---|---|
| 1 | Mã HĐ | `contract.code` | Font monospace, readonly. |
| 2 | Khách hàng | `contract.customerName` | Text-link → UC-CUS-03 (Customer 360°). |
| 3 | Loại HĐ | `contract.type` | Badge DIRECT/RESELLER. |
| 4 | Ngày ký | `contract.signedDate` | Format dd/MM/yyyy. "—" nếu null. |
| 5 | Mô tả | `contract.description` | Full width, dạng text thuần. "—" nếu null. |
| 6 | Ngày tạo | `contract.createdAt` | dd/MM/yyyy HH:mm. |
| 7 | Người tạo | `contract.createdBy` | Display name. |

---

### 3.3 Panel Subscriptions (DIRECT only)

Hiển thị danh sách subscription gắn với HĐ này.

**Mỗi Subscription Card gồm:**

| Thành phần | Mô tả |
|---|---|
| Sub Header | Mã sub (monospace), tên gói (bold), badge trạng thái sub |
| Date Block | `activated_at` (lấy từ `license_mirror`) và `expires_at` (lấy từ `license_mirror`). Nếu chưa nhận webhook → hiển thị "—". Màu theo status: ACTIVE=xanh, EXPIRED=đỏ, GRACE=vàng. |
| Usage Bar | Chỉ hiển thị khi usage > 0%. Label "Mức sử dụng license" + % in đậm. Progress bar xanh ≤80%, cam >80%. Caption: "Đã kích hoạt n/m" (n = active, m = total được cấp phép theo sub). |
| License Mirror Strip | Dải màu xanh nhạt bên dưới card — hiển thị thông tin đồng bộ từ sản phẩm: trạng thái mirror, version, last sync. |

**Nút "+ Thêm Subscription"**: ở đầu hoặc cuối danh sách, điều hướng sang UC-SUB.

**Empty state** (chưa có sub): icon + "Chưa có Subscription" + nút "+ Thêm Subscription".

---

### 3.4 Panel License Pool (RESELLER only)

Hiển thị danh sách pool items và phân bổ.

**Pool Block — Chế độ Full Inline (< 5 allocations/pool):**

| Thành phần | Mô tả |
|---|---|
| Pool Header | 🏊 Pool · [Tên sản phẩm] |
| Thanh phân bổ | `[used] / [total] đã cấp · còn [remaining]`. Progress bar cam nếu >80%. |
| Controls | Sort by Seat ↓ \| Status ↕ |
| Allocation Rows | Mặc định hiện 3 dòng đầu (theo sort hiện tại). Nếu còn ẩn: "+N chưa hiện: [summary]" + nút "Xem tất cả N ↓". Mỗi dòng: tên end-customer, số seat, badge status. |

**Pool Block — Chế độ Preview + Link (≥ 5 allocations/pool):**

| Thành phần | Mô tả |
|---|---|
| Pool Header | Giống trên, không có controls Sort |
| 5 rows đầu | Sort theo seats giảm dần, cố định, không expand |
| Text-link | "Xem danh sách Subscription" — căn phải, color var(--primary), font-size 12px, underline, hover opacity 0.7. Click → mở UC-SUB-01 ở tab mới, pre-fill contract_id. |
| Dòng tóm tắt | "Hiển thị 5 / N · còn (N-5) end-customer · [x Đang hoạt động · y Trong gia hạn · z Tạm dừng]" — căn giữa, màu chữ nhạt. |

**Nút "➕ Thêm Pool" / "➕ Thêm sản phẩm vào Pool"**: điều hướng sang AF-01 của UC-CON-04.

---

### 3.5 Panel Đính kèm

Xem chi tiết đầy đủ tại **UC-CON-05 Upload / Xóa File đính kèm Hợp đồng**.

Panel accordion collapsible:
- Tiêu đề: "📎 Đính kèm ({N} file)"
- Danh sách file ACTIVE: icon loại file, tên file, dung lượng, ngày upload, tên người upload, nút ⬇ Tải về, nút 🗑️ Xóa
- Dropzone + nút "+ Đính kèm file"

---

### 3.6 Panel Audit Log

Search bar cố định ở đầu panel (ngoài scroll container).

**Các cột:**

| # | Cột | Nguồn dữ liệu | Searchable |
|---|---|---|---|
| 1 | Thời gian | `audit_log.created_at` — dd/MM/yyyy HH:mm | ❌ |
| 2 | Nguồn | Derive từ actor và action (xem bảng Source) | ❌ |
| 3 | Actor | `audit_log.actor_id` → display name. Null → "System" | ✅ |
| 4 | Hành động | `audit_log.action` | ✅ |
| 5 | Chi tiết | CREATE: `{field}: {value}`. UPDATE: `{field}: "{before}" → "{after}"`. DELETE: `reason: {reason}`. FAILED: prefix [FAILED] màu đỏ nhạt | ✅ |
| 6 | Kết quả | ✓ Thành công (xanh) / ✗ Thất bại (đỏ) | ❌ |

**Bảng Source — cột Nguồn:**

| Điều kiện | Badge | Màu |
|---|---|---|
| actor=null + action có "webhook/event từ/license." | Webhook | Tím |
| actor=null còn lại | System | Xám |
| Actor là người dùng UI | (Tên) | Xanh dương |
| Gọi qua API external | API | Xanh lá |

**Tải dữ liệu:**

| Thuộc tính | Giá trị |
|---|---|
| Scope | `entity_type = 'CONTRACT' AND entity_id = {id}` |
| Sort | DESC `audit_log.created_at` |
| Batch đầu | 20 bản ghi gần nhất |
| Lazy load trigger | Scroll đến `scrollHeight - 80px` |
| Batch size | 20 bản ghi / lần |

**Search:**

| Thuộc tính | Giá trị |
|---|---|
| Scope | Actor + Hành động + Chi tiết |
| Xử lý | Client-side filter, debounce 300ms |
| Highlight | Từ khoá match được highlight màu vàng |
| Khi search active | Hiển thị toàn bộ kết quả match — lazy load tạm dừng |
| Khi xóa search | Reset lazy state, load lại từ đầu |
| Counter | "{n} kết quả" khi search; "{loaded}/{total} bản ghi" khi không search |

**Empty state:** Icon 🔍 + "Không tìm thấy kết quả" + "Thử từ khoá khác".

---

## 4. Acceptance Criteria

### Nhóm 1: Điều hướng và hiển thị

| AC ID | Given | When | Then |
|---|---|---|---|
| AC-CON-03-01 | HĐ "HD-CMC-2026-001" (DIRECT) tồn tại | Sales click row trong Danh sách | Trang Chi tiết mở, Contract Header hiển thị đúng mã, tên KH, badge DIRECT, ngày ký. |
| AC-CON-03-02 | Hợp đồng ID không tồn tại | Sales truy cập URL /contracts/{invalid-id} | Toast lỗi "Không tìm thấy hợp đồng." Redirect về Danh sách. |
| AC-CON-03-03 | HĐ "HD-CMC-2026-001" được mở từ Customer 360° | Sales click mã HĐ trong tab Hợp đồng & Sub | Trang Chi tiết mở đúng HĐ (AF-01). Breadcrumb cập nhật. |
| AC-CON-03-04 | HĐ subs.length = 0 | Sales xem trang Chi tiết | Nút "🗑️ Xóa" active (không disabled). |
| AC-CON-03-05 | HĐ subs.length > 0 | Sales xem trang Chi tiết | Nút "🗑️ Xóa" disabled (opacity 0.5), tooltip "Đã có Subscription, không thể xóa". |

### Nhóm 2: Panel theo loại HĐ

| AC ID | Given | When | Then |
|---|---|---|---|
| AC-CON-03-06 | HĐ DIRECT có 2 sub (1 ACTIVE, 1 EXPIRED) | Sales xem trang Chi tiết | Panel Subscriptions hiển thị 2 sub card. Panel License Pool không xuất hiện. |
| AC-CON-03-07 | HĐ RESELLER có 2 pool items (EDR + AV) | Sales xem trang Chi tiết | Panel License Pool hiển thị 2 pool blocks. Panel Subscriptions không xuất hiện. |
| AC-CON-03-08 | HĐ DIRECT, sub chưa nhận webhook (license_mirror chưa có data) | Sales xem Subscription Card | Date Block hiển thị "—" cho activated_at và expires_at. |
| AC-CON-03-09 | HĐ DIRECT, sub có usage = 0% | Sales xem Subscription Card | Usage Bar không hiển thị. |
| AC-CON-03-10 | HĐ DIRECT, sub có usage = 72% | Sales xem Subscription Card | Usage Bar hiển thị. Progress bar màu xanh (72% ≤ 80%). |
| AC-CON-03-11 | HĐ DIRECT, sub có usage = 85% | Sales xem Subscription Card | Progress bar màu cam (85% > 80%). |

### Nhóm 3: License Pool (RESELLER)

| AC ID | Given | When | Then |
|---|---|---|---|
| AC-CON-03-12 | Pool có 3 allocations | Sales xem Panel License Pool | Chế độ Full Inline. Hiển thị 3 dòng với sort controls. |
| AC-CON-03-13 | Pool có 8 allocations | Sales xem Panel License Pool | Chế độ Preview + Link. 5 rows đầu + text-link "Xem danh sách Subscription" + dòng tóm tắt "Hiển thị 5/8 · còn 3 end-customer". |
| AC-CON-03-14 | Sales click link "Xem danh sách Subscription" trong Preview mode | Click | Tab mới mở UC-SUB-01, pre-fill contract_id. |
| AC-CON-03-15 | Pool_total=500, allocated_qty=430 (86%) | Sales xem pool bar | "430 / 500 đã cấp · còn 70". Bar màu cam (86% > 80%). |

### Nhóm 4: Audit Log

| AC ID | Given | When | Then |
|---|---|---|---|
| AC-CON-03-16 | HĐ có 5 audit entries | Sales mở panel Audit Log | 5 entries DESC theo created_at. Counter "5 / 5 bản ghi". |
| AC-CON-03-17 | Entry UPDATE: signedDate: "2026-01-01" → "2026-07-15" | Sales xem cột Chi tiết | Hiển thị: `signedDate: "2026-01-01" → "2026-07-15"`. |
| AC-CON-03-18 | Entry source_webhook_id IS NOT NULL | Sales xem cột Nguồn | Badge "Webhook" màu tím. |
| AC-CON-03-19 | Sales nhập "FPT" vào search bar | Debounce 300ms | Chỉ hiện entries có "FPT" trong Actor/Hành động/Chi tiết. Highlight màu vàng. Counter "N kết quả". |
| AC-CON-03-20 | Sales xóa text search | Sau xóa | Toàn bộ entries hiển thị lại. Lazy load hoạt động. Counter về "{loaded}/{total} bản ghi". |
| AC-CON-03-21 | HĐ có 47 audit entries | Sales scroll 20 entries đầu, counter "20 / 47". Scroll → 20 tiếp append | Counter "40 / 47". |

---

## 5. Review Checklist

> Claude tự review — đánh dấu ✅/❌ trước khi submit cho BA review.

### Nghiệp vụ
- ✅ Luồng chính bao phủ happy path (cả DIRECT và RESELLER)
- ✅ AF-01 (từ Customer 360°), AF-02 (Thêm Sub), AF-03 (Thêm Pool) đã định nghĩa
- ✅ EF-01 (không tìm thấy) đã xử lý
- ✅ BR-01 đến BR-05 đã định nghĩa rõ
- ✅ AC bao phủ cả DIRECT/RESELLER và các edge case
- ✅ Nội dung bám sát PRD v2.3 (chi tiết layout lấy từ UC-CUS-03 Tab 2 và UC-CON-04/05)

### Giao diện
- ✅ Contract Header với Action bar đã mô tả
- ✅ Panel Subscriptions (DIRECT) với Subscription Card đầy đủ
- ✅ Panel License Pool (RESELLER) với cả 2 chế độ Full Inline và Preview + Link
- ✅ Panel Đính kèm tham chiếu UC-CON-05
- ✅ Audit Log với search, lazy load, counter đã mô tả
- ✅ Trạng thái nút 🗑️ (disabled/active) theo BR-01 của UC-CON-01

### Open Questions
- ❓ **OQ-01**: Nút "+ Thêm Subscription" có hiển thị khi HĐ không có sub nào không (empty state)? Hay luôn hiển thị trong action bar?
- ❓ **OQ-02**: Panel Audit Log trong Chi tiết HĐ có scope riêng (CONTRACT only) hay merge chung với Timeline của HĐ?
- ❓ **OQ-03**: Timeline của HĐ (provisioning events của các sub gắn với HĐ này) — có được hiển thị ở đây không, hay chỉ ở Chi tiết Sub?
