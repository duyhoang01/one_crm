# UC-CON-03 — Xem Chi tiết Hợp đồng

> Module: M-02 Contract Management | Phiên bản: 1.2 | Ngày: 06/07/2026
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
| **Điểm vào** | (1) Nhấn vào dòng hợp đồng trong Danh sách UC-CON-01 (Danh sách Hợp đồng).<br>(2) Nhấn mã HĐ trong Tab Hợp đồng & Sub của UC-CUS-03 (Customer 360°). |

### Quy tắc nghiệp vụ

| BR ID | Nội dung |
|---|---|
| BR-01 | Panel **Subscription** chỉ hiển thị khi `contract.type = DIRECT`.<br>Panel **License Pool** chỉ hiển thị khi `contract.type = RESELLER`.<br>Không hiển thị cả hai cùng lúc. |
| BR-02 | `activated_at` và `expires_at` trong Date Block lấy từ `license_mirror`. CRM không tự tính — nếu chưa nhận event webhook → hiển thị placeholder "—". |
| BR-03 | Audit Log sắp xếp DESC theo `created_at`. Scope: `entity_type = 'CONTRACT' AND entity_id = {id}`. Search client-side, debounce 300ms. |
| BR-04 | Trạng thái sub được phản ánh qua webhook — trang detail chỉ đọc, không tự thay đổi trạng thái. |
| BR-05 | Provisioning events (webhook/lifecycle của sub) **không** hiển thị tại đây — chúng thuộc về Chi tiết Subscription, không thuộc Contract. |

---

## 2. Luồng nghiệp vụ

### 2.1 Luồng chính

| Bước | Actor | Hành động / Phản hồi |
|---|---|---|
| **1** | Sales | Nhấn vào dòng hợp đồng trong Danh sách (UC-CON-01) hoặc nhấn mã HĐ trong tab Hợp đồng & Sub của Customer 360° (UC-CUS-03). |
| **2** | System | Điều hướng sang trang Chi tiết. Hiển thị **Contract Header**: icon 📄, mã HĐ (font monospace, navy, bold), tên KH (liên kết → Customer 360°), badge Loại HĐ, ngày ký (nếu có). |
| **3** | System | Hiển thị **Action bar**: **✏️ Chỉnh sửa** → UC-CON-04; **+ Thêm Subscription** (luôn hiển thị với HĐ loại DIRECT, bất kể đã có sub hay chưa); **🗑️ Xóa** → UC-CON-06 (disabled nếu subs.length > 0). |
| **4** | System | Hiển thị **panel Thông tin chung**: grid 4 cột — Mã HĐ (readonly), Khách hàng (link), Loại HĐ (badge), Ngày ký, Mô tả. |
| **5** | System | [Điểm quyết định — Loại HĐ?]<br>→ [DIRECT]: Hiển thị **panel Subscriptions** (xem mục 3.3).<br>→ [RESELLER]: Hiển thị **panel License Pool** (xem mục 3.4). |
| **6** | System | Hiển thị **panel Đính kèm** (accordion, xem chi tiết tại UC-CON-05 Quản lý đính kèm). |
| **7** | System | Hiển thị **panel Audit Log** (cuộn lazy load + tìm kiếm, xem mục 3.6). |
| **8** | Sales | (Tuỳ chọn) Tương tác với các panel: mở rộng/thu gọn, cuộn lazy load, tìm kiếm audit log. |
| → | — | **End (Success)** — Trang chi tiết hiển thị đầy đủ. Không thay đổi dữ liệu. |

### 2.2 Luồng phụ

**[AF-01: Từ Customer 360°]** — kích hoạt tại bước 1 khi entry point là tab Hợp đồng & Sub.

| Bước | Actor | Hành động / Phản hồi |
|---|---|---|
| **1a** | Sales | Tại Customer 360° (UC-CUS-03), tab Hợp đồng & Sub, nhấn mã hợp đồng. |
| **1b** | System | Điều hướng sang trang Chi tiết Hợp đồng. |
| → | — | Quay lại luồng chính tại bước 2. |

**[AF-02: Thêm Subscription (DIRECT)]** — kích hoạt tại bước 3 khi Sales nhấn "+ Thêm Subscription".

| Bước | Actor | Hành động / Phản hồi |
|---|---|---|
| **3a** | Sales | Nhấn **"+ Thêm Subscription"** trong action bar (luôn hiển thị với DIRECT — kể cả khi đã có sub). |
| **3b** | System | Điều hướng sang UC-SUB (tạo sub mới, pre-fill `contract_id`). |
| → | — | **End (Điều hướng ra ngoài)** — Sales tiếp tục tại UC-SUB. |

**[AF-03: Thêm Pool License (RESELLER)]** — kích hoạt tại panel License Pool.

| Bước | Actor | Hành động / Phản hồi |
|---|---|---|
| **5a** | Sales | Nhấn **"➕ Thêm Pool"** hoặc **"➕ Thêm sản phẩm vào Pool"** trong panel License Pool. |
| **5b** | System | Điều hướng sang luồng AF-01 của UC-CON-04 (Cập nhật Hợp đồng — Thêm Pool). |
| → | — | **End (Điều hướng ra ngoài)** — Sales tiếp tục tại UC-CON-04. |

### 2.3 Luồng ngoại lệ

**[EF-01: Hợp đồng không tìm thấy]** — kích hoạt tại bước 2 khi API trả về 404 (ID không hợp lệ hoặc HĐ đã bị xóa).

| Bước | Actor | Hành động / Phản hồi |
|---|---|---|
| **2a** | System | Hiển thị thông báo ngắn lỗi: *"Không tìm thấy hợp đồng."* Điều hướng về Danh sách Hợp đồng (UC-CON-01). |
| → | — | **End (Failure)** |

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

| # | Thành phần | Loại | Mô tả |
|---|---|---|---|
| 1 | Sub Header | Text group | Mã sub (monospace), tên gói (bold), badge trạng thái sub |
| 2 | Date Block | Text pair | `activated_at` và `expires_at` lấy từ `license_mirror`.<br>Nếu chưa nhận webhook → hiển thị "—".<br>Màu chữ theo status: ACTIVE=xanh, EXPIRED=đỏ, GRACE=vàng. |
| 3 | Usage Bar | Progress bar | Chỉ hiển thị khi usage > 0%.<br>Label: "Mức sử dụng license" + % in đậm.<br>Màu bar: xanh ≤80%, cam >80%.<br>Caption: "Đã kích hoạt n/m" (n = active, m = tổng được cấp phép theo sub). |
| 4 | License Mirror Strip | Info strip | Dải màu xanh nhạt bên dưới card.<br>Hiển thị: trạng thái mirror, version, last sync từ sản phẩm. |

**Nút "+ Thêm Subscription"**: luôn hiển thị ở action bar (xem mục 3.1) và lặp lại ở cuối danh sách sub, điều hướng sang UC-SUB.

**Trạng thái rỗng** (chưa có sub nào): icon minh hoạ + "Chưa có Subscription" + nút "+ Thêm Subscription".

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
| AC-CON-03-01 | HĐ "HD-CMC-2026-001" (DIRECT) tồn tại | Sales nhấn vào dòng HĐ trong Danh sách | Trang Chi tiết mở, Contract Header hiển thị đúng mã, tên KH, badge DIRECT, ngày ký. |
| AC-CON-03-02 | Hợp đồng ID không tồn tại | Sales truy cập URL `/contracts/{invalid-id}` | Thông báo ngắn lỗi "Không tìm thấy hợp đồng." Điều hướng về Danh sách. |
| AC-CON-03-03 | HĐ "HD-CMC-2026-001" được mở từ Customer 360° | Sales nhấn mã HĐ trong tab Hợp đồng & Sub | Trang Chi tiết mở đúng HĐ (AF-01). Breadcrumb cập nhật. |
| AC-CON-03-04 | HĐ DIRECT, `subs.length = 0` | Sales xem trang Chi tiết | Nút "🗑️ Xóa" ở trạng thái active. Nút "+ Thêm Subscription" hiển thị trong action bar. |
| AC-CON-03-05 | HĐ DIRECT, `subs.length > 0` | Sales xem trang Chi tiết | Nút "🗑️ Xóa" disabled (opacity 0.5), tooltip "Đã có Subscription, không thể xóa". Nút "+ Thêm Subscription" vẫn hiển thị trong action bar. |
| AC-CON-03-06 | HĐ RESELLER | Sales xem action bar | Nút "+ Thêm Subscription" **không xuất hiện** trong action bar. Chỉ có "✏️ Chỉnh sửa" và "🗑️ Xóa". |

### Nhóm 2: Panel theo loại HĐ

| AC ID | Given | When | Then |
|---|---|---|---|
| AC-CON-03-07 | HĐ DIRECT có 2 sub (1 ACTIVE, 1 EXPIRED) | Sales xem trang Chi tiết | Panel Subscriptions hiển thị 2 sub card. Panel License Pool không xuất hiện. |
| AC-CON-03-08 | HĐ DIRECT chưa có sub nào (`subs.length = 0`) | Sales xem panel Subscriptions | Trạng thái rỗng: icon minh hoạ + "Chưa có Subscription" + nút "+ Thêm Subscription". |
| AC-CON-03-09 | HĐ RESELLER có 2 pool items (EDR + AV) | Sales xem trang Chi tiết | Panel License Pool hiển thị 2 pool blocks. Panel Subscriptions không xuất hiện. |
| AC-CON-03-10 | HĐ DIRECT, sub chưa nhận webhook (`license_mirror` chưa có data) | Sales xem Subscription Card | Date Block hiển thị "—" cho `activated_at` và `expires_at`. |
| AC-CON-03-11 | HĐ DIRECT, sub có usage = 0% | Sales xem Subscription Card | Usage Bar không hiển thị (ẩn hoàn toàn). |
| AC-CON-03-12 | HĐ DIRECT, sub có usage = 72% | Sales xem Subscription Card | Usage Bar hiển thị. Progress bar màu xanh (72% ≤ 80%). |
| AC-CON-03-13 | HĐ DIRECT, sub có usage = 85% | Sales xem Subscription Card | Progress bar màu cam (85% > 80%). |

### Nhóm 3: License Pool (RESELLER)

| AC ID | Given | When | Then |
|---|---|---|---|
| AC-CON-03-14 | Pool có 3 allocations | Sales xem Panel License Pool | Chế độ Full Inline. Hiển thị 3 dòng với sort controls. |
| AC-CON-03-15 | Pool có 8 allocations | Sales xem Panel License Pool | Chế độ Preview + Link. 5 dòng đầu + liên kết "Xem danh sách Subscription" + dòng tóm tắt "Hiển thị 5/8 · còn 3 end-customer". |
| AC-CON-03-16 | HĐ RESELLER, pool có 8 allocations | Sales nhấn liên kết "Xem danh sách Subscription" | Tab mới mở UC-SUB-01, pre-fill `contract_id`. |
| AC-CON-03-17 | `pool_total=500`, `allocated_qty=430` (86%) | Sales xem pool bar | Hiển thị "430 / 500 đã cấp · còn 70". Bar màu cam (86% > 80%). |

### Nhóm 4: Audit Log

| AC ID | Given | When | Then |
|---|---|---|---|
| AC-CON-03-18 | HĐ có 5 audit entries | Sales mở panel Audit Log | 5 entries hiển thị DESC theo `created_at`. Counter "5 / 5 bản ghi". |
| AC-CON-03-19 | Entry UPDATE: `signedDate: "2026-01-01" → "2026-07-15"` | Sales xem cột Chi tiết | Hiển thị: `signedDate: "2026-01-01" → "2026-07-15"`. |
| AC-CON-03-20 | Entry có `source_webhook_id IS NOT NULL` | Sales xem cột Nguồn | Badge "Webhook" màu tím. |
| AC-CON-03-21 | Sales đang xem panel Audit Log | Sales nhập "FPT" vào ô tìm kiếm (sau debounce 300ms) | Chỉ hiện entries có "FPT" trong Actor/Hành động/Chi tiết. Từ khoá được highlight màu vàng. Counter hiển thị "N kết quả". |
| AC-CON-03-22 | Sales đang xem kết quả tìm kiếm "FPT" | Sales xóa nội dung ô tìm kiếm | Toàn bộ entries hiển thị lại. Lazy load hoạt động trở lại. Counter về "{loaded}/{total} bản ghi". |
| AC-CON-03-23 | HĐ có 47 audit entries, panel đang hiển thị 20 entries đầu (counter "20 / 47") | Sales cuộn đến cuối danh sách | 20 entries tiếp theo được tải thêm (append). Counter cập nhật "40 / 47". |

---

## 5. Lịch sử thay đổi

| Phiên bản | Ngày | Người cập nhật | Nội dung |
|---|---|---|---|
| 1.0 | 06/07/2026 | Claude (AI) | Tạo mới — bóc tách từ PRD v2.3 section 6.2.4 (thiếu trong PRD, tái cấu trúc từ cross-reference UC-CON-04/05 và UC-CUS-03 Tab 2). |
| 1.1 | 06/07/2026 | Claude (AI) | Giải quyết OQ-01/OQ-03: nút "+ Thêm Sub" luôn hiển thị với DIRECT; xóa BR Timeline (provisioning events thuộc Sub detail). |
| 1.2 | 06/07/2026 | Claude (AI) | Self-review theo checklist FRS: tách gateway bước 5, sửa ngôn ngữ (Navigate → Điều hướng, row → dòng, click → nhấn, toast → thông báo ngắn), thêm End Events, chuẩn bảng UI section 3.3, bổ sung AC-CON-03-06/08/16 còn thiếu, renumber AC. |

### Quyết định đã chốt

| # | Nội dung | Quyết định |
|---|---|---|
| OQ-01 | Nút "+ Thêm Subscription" hiển thị khi nào? | **Luôn hiển thị** trong action bar với mọi HĐ DIRECT, bất kể đã có sub hay chưa. |
| OQ-03 | Provisioning events (webhook) có hiển thị tại Chi tiết HĐ không? | **Không.** Provisioning events gắn với Subscription, không gắn với Contract. Chúng sẽ hiển thị trong form Chi tiết Subscription (UC-SUB). |

---

## Footer

| Thuộc tính | Giá trị |
|---|---|
| **Demo HTML** | [v2.3.2_contracts.html](../../demo/v2.3.2_contracts.html) |
| **Figma** | _(chưa có link — cần BA bổ sung)_ |
| **API Contract** | _(chưa có link — cần BE bổ sung)_ |
| **UC liên quan** | UC-CON-01 (Danh sách HĐ) · UC-CON-04 (Cập nhật HĐ) · UC-CON-05 (Quản lý đính kèm) · UC-CON-06 (Xóa HĐ) · UC-CUS-03 (Customer 360°) |
