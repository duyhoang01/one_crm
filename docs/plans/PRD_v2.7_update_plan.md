# Plan cập nhật PRD — v2.6 → v2.7

> Ngày: 14/07/2026 · Soạn: Claude (AI) · **Trạng thái: CHỜ BA DUYỆT — chưa sửa PRD**
> Nguồn thay đổi: bộ FRS `UC-LIC-01..04` (M-05) · `UC-SUB-03` v1.3 (M-03) · demo `v2.6.0_license.html` · 20 câu chốt trong `M-05_open_questions.md` · 2 quyết định ngày 14/07 (Auditor · nút Gia hạn)

---

## 0. Tóm tắt: 3 nhóm việc

| Nhóm | Module | Vì sao | Mức độ |
|---|---|---|---|
| **A. Sửa lỗi PRD đang tự mâu thuẫn** | M-05, M-06 | PRD hiện có chỗ **BR chọi AC ngay trong cùng một bảng** — dev đọc sẽ code sai | 🔴 **Chặn dev** |
| **B. Đồng bộ PRD với các quyết định đã chốt** | M-05 | Ngưỡng, thang mức độ, phân quyền, banner… đã chốt trong FRS nhưng PRD chưa phản ánh | 🟠 Chặn golive |
| **C. Chống trôi dạt PRD ↔ FRS** | M-05 | §6.5 vẫn giữ bảng FR đầy đủ, trong khi FRS đã là nguồn sự thật → hai nơi sẽ lệch nhau | 🟠 Quan trọng |

**Không đụng tới:** M-01, M-02, M-04, M-08, PM-01…03.
**Hoãn:** M-07 (xem §5).

---

## 1. NHÓM A — Lỗi PRD tự mâu thuẫn *(bắt buộc sửa)*

### A1. 🔴 FR-LIC-04 — BR-04.7 chọi thẳng AC-04.5 *(§6.5.5)*

Trong **cùng một bảng**, PRD hiện viết:

| Ô | Nội dung hiện tại |
|---|---|
| Business Rules | **BR-04.7:** "**Quota 20 lượt/giờ/người**… Vượt → **429**" |
| AC | **AC-04.5:** "User đồng bộ 30 sub khác nhau trong 1 giờ → **cho phép, không có quota theo người dùng**" |

Hai câu **phủ định nhau**. Chốt ngày 13/07 (câu hỏi Q2 trong `M-05_open_questions.md`): **KHÔNG giới hạn theo người dùng** — vì sau sự cố kết nối, vận hành cần đồng bộ lại hàng loạt; chặn theo người dùng sẽ cản đúng lúc cần nhất. Bảo vệ tải là việc của sản phẩm.

→ **XOÁ BR-04.7.** Ghi rõ trong BR-04.4: *"chỉ giới hạn theo subscription (1 lần/5 phút), **không** giới hạn theo người dùng"*. FRS `UC-LIC-03` BR-03 đã ghi đúng — PRD phải theo.

### A2. 🔴 FR-EVT-01 — ô Business Rules và AC bị dán nhầm nội dung *(§6.6.2, M-06)*

FR-EVT-01 là **"Xem Timeline của Subscription"**, nhưng cả ô *Business Rules* lẫn ô *AC* đang chứa **nguyên văn AC-07.1…07.3 của FR-LIC-07** (cảnh báo lệch trạng thái): *"Sub SUSPENDED > 15 phút mà mirror còn ACTIVE → alert P2…"*. Không liên quan gì tới việc xem timeline.

→ Viết lại BR + AC thật cho FR-EVT-01. *(Lỗi copy-paste có sẵn từ trước, không phải do đợt này gây ra — nhưng đã thấy thì phải sửa.)*

---

## 2. NHÓM B — Đồng bộ với quyết định đã chốt *(M-05, §6.5)*

### B1. FR-LIC-01 *(§6.5.2)* — Tác nhân & quyền xem

| Hiện tại | Phải sửa thành |
|---|---|
| Actor: Sales, CSKH, Manager | Sales, CSKH, **Manager, License Admin, Auditor** |
| BR-01.3: "View **không cần quyền đặc biệt**" | Cần quyền **`license:view`** (quy ước `{tài_nguyên}:{hành_động}`) |

*(BR-01.4 về portal deep-link đã đúng — giữ nguyên.)*

### B2. FR-LIC-06 *(§6.5.7)* — Đây là màn hình chính của M-05, PRD đang mô tả thiếu

| Hạng mục | Hiện tại | Phải bổ sung |
|---|---|---|
| Actor | License Admin, Manager | **+ Sales, CSKH, Auditor** |
| Ngưỡng | Hardcode *"≥ 90%"*, *"24h"* trong BR-06.2 / US-07 / AC-06.1 | Đọc từ `runtime_config`: `upsell_threshold_pct` · `2 × usage_push_interval` — **không hardcode** |
| Cấu trúc màn | Không mô tả | **3 view theo ý định người dùng**: Cần xử lý · Cơ hội doanh thu · Tất cả license *(→ trỏ FRS UC-LIC-01)* |
| Phân quyền | Không có | View "Cần xử lý" + banner diện rộng: quyền **`license:view_issues`** — Manager, License Admin, **Auditor** *(chốt 14/07: Auditor xem được, không có nút tạo tác động)* |
| On-premise | Không có | Vẫn hiện trong danh sách, nhãn **"Không theo dõi tự động"**, **loại khỏi mọi cảnh báo** và cơ hội bán thêm |
| Sales phụ trách | Không có | Lấy từ **người tạo subscription** *(mô hình phân công KH ngoài phạm vi giai đoạn này)* |
| Bộ lọc thời hạn | Không có | **Đã quá hạn** · Còn dưới 30 / 60 / 90 ngày |

### B3. FR-LIC-07 *(§6.5.8)* — Thang mức độ & banner diện rộng

| Hạng mục | Hiện tại | Phải sửa |
|---|---|---|
| Thang ưu tiên | **"alert ops P2 (P1 nếu nhiều)"** — mã nội bộ | **Cao / Trung bình / Thấp**, theo **bảng quyết định** chấm bằng hậu quả (FRS UC-LIC-04 BR-09…BR-13) |
| Lệch kiểu C | Luôn kiểm tra `auto_reconcile_after_hours` | **Chỉ kiểm tra khi sản phẩm CÓ khai báo** ngưỡng. Để trống → **không kiểm tra** *(EDR: triển khai 1–2 tháng là bình thường — áp ngưỡng cứng sẽ gắn cờ mọi sub EDR mới)* |
| Sự cố diện rộng | Không có | **Ngưỡng kép: ≥ 3 license VÀ ≥ 30%** số license đang hoạt động của sản phẩm đó. *(Tỷ lệ chặn đầu sản phẩm lớn; số tuyệt đối chặn đầu sản phẩm nhỏ — banner không gộp được gì khi chỉ 1–2 dòng.)* Hai banner: **Lệnh không được thực thi** · **Không nhận được dữ liệu** |
| On-premise | Không có | Loại khỏi mọi cảnh báo diện rộng |
| AC-07.1 | Hardcode *"> 15 phút"* | Theo `mismatch_sla_minutes` của sản phẩm |
| Tự tắt | Không có | Cảnh báo **tự biến mất** khi dữ liệu về đúng — **không có nút "đã đọc"** |

### B4. Quy ước tên quyền — thêm một bảng nhỏ vào §6.5

`license:view` · `license:view_issues` · `license:view_portal` · `license:force_sync`
*(BR-01.4 và BR-04.6 đã dùng đúng quy ước — chỉ cần gom lại một chỗ cho dev dễ tra.)*

---

## 3. NHÓM C — Chống trôi dạt PRD ↔ FRS *(cần bạn quyết)*

**Vấn đề:** §6.5 hiện mô tả **đầy đủ** hành vi màn hình trong bảng FR. Nhưng nay bộ FRS `UC-LIC-01..04` mới là nguồn sự thật (có đủ luồng, giao diện, AC, ảnh chụp demo). **Hai nơi cùng mô tả một thứ = chắc chắn sẽ lệch nhau** — đúng cái bẫy mà chúng ta vừa mất công gỡ ở tab License (FRS nói một đằng, demo làm một nẻo).

**§6.3 (M-03) đã giải bài này rồi** — v2.4 bỏ 10 bảng FR-SUB, thay bằng **bảng ánh xạ FR ↔ UC + link sang FRS**, chỉ giữ lại FR của System (FR-SUB-11).

### Đề xuất: làm §6.5 giống §6.3

| Giữ nguyên trong PRD | Chuyển sang trỏ FRS |
|---|---|
| **FR-LIC-02** Update License Status *(System — không có UI)* | **FR-LIC-01** → UC-LIC-02 |
| **FR-LIC-03** Update Usage Snapshot *(System)* | **FR-LIC-04** → UC-LIC-03 |
| **FR-LIC-05** List License Instances *(skeleton Phase sau)* | **FR-LIC-06** → UC-LIC-01 |
| Data model, ngưỡng `runtime_config`, quy ước quyền | **FR-LIC-07** → UC-LIC-04 |

PRD giữ vai trò **"cái gì và vì sao"** (BR nền, ràng buộc, ngưỡng cấu hình); FRS giữ **"trông ra sao và nghiệm thu thế nào"**. Mỗi thứ một nơi, không lặp.

> ⚠️ Nếu bạn **không** chọn phương án này, tôi sẽ vá tại chỗ các bảng FR (nhóm B) — nhưng phải chấp nhận **PRD và FRS mô tả trùng nhau**, và mỗi lần đổi UI sẽ phải nhớ sửa cả hai.

---

## 4. Việc phụ đi kèm

- **§ Lịch sử phiên bản:** thêm dòng **v2.7 — 14/07/2026 — Nguyễn Công Giang**, tóm tắt thay đổi.
- **§0.2 "Việc phải làm — theo module":** thêm khối M-05 *(hiện chỉ có M-02, M-03, M-04)*.
- **Tên file:** tạo `OneCRM_PRD_v2.7.md` *(clone từ v2.6 — đúng cách đã làm ở các version trước)*.

---

## 5. HOÃN — M-07 Integration Layer

Đề xuất **FR-INT-07** (màn Tình trạng kết nối) và **BR-06.6…06.13** (replay chuỗi, không gửi thông báo cho khách) đã soạn trong `docs/plans/M-07_demo_v2.7_plan.md`, nhưng **demo v2.7 đang tạm gác** theo yêu cầu của bạn.

→ **Không đưa vào PRD lần này.** Chốt demo v2.7 xong mới cập nhật — đúng nguyên tắc *demo trước, spec sau*.

---

## 6. ✅ Chu kỳ đẩy mức sử dụng — ĐÃ CHỐT 3 GIỜ (14/07/2026)

**Bối cảnh:** `inbound_outbound_concept.md` §3.1.3 ghi **1 giờ**, còn PRD/FRS/demo dùng **24 giờ**. Đây **không phải** việc phải hỏi đội EDR — cả hai tài liệu đều do BA soạn, và **EDR chưa bắt đầu làm**. Tức đây là mâu thuẫn **nội bộ**, phải chốt **trước khi** gửi đội EDR, nếu không họ sẽ implement theo bản họ đọc được.

**Chốt: `usage_push_interval = 3h`** cho mọi sản phẩm → ngưỡng "chưa cập nhật" = **6 giờ** (2 × chu kỳ).

| Nơi | Việc |
|---|---|
| PRD §5.3.7 `runtime_config` | `usage_push_interval` — sửa **24h → 3h**; ngưỡng phái sinh **48h → 6h** |
| `inbound_outbound_concept.md` §3.1.3 | Sửa **1 giờ → 3 giờ** cho khớp |
| FRS UC-LIC-02 BR-08 · UC-LIC-04 BR-02 + AC-04/05 | ✅ **Đã sửa** — ví dụ cũ *"chưa cập nhật 30 giờ → không vào hàng đợi"* đã **sai** với ngưỡng 6h, nay đổi thành 4 giờ (không) / 8 giờ (có) |
| Demo v2.6 + v2.7 (`runtime_config` của 4 sản phẩm) | ✅ **Đã sửa** — kiểm chứng bằng script: hàng đợi vẫn **11 việc**, **5 cơ hội**, **2 banner**. Dữ liệu demo không có license nào rơi vào vùng 6–48h nên hành vi không đổi |

> **Lưu ý còn lại (chưa xử lý):** ngưỡng phát hiện "kênh chết" = 2 × chu kỳ = **6 giờ**. Nếu sau này muốn phát hiện nhanh hơn nữa mà không tăng tải, cân nhắc tách **nhịp tim** (event rỗng, tần suất cao) khỏi **dữ liệu mức sử dụng** — hiện ta đang dùng **một** tín hiệu để trả lời **hai** câu hỏi khác nhau: *"số liệu mới tới đâu"* và *"kênh còn sống không"*.

## 7. Câu hỏi cần bạn chốt trước khi tôi thực hiện

1. **Nhóm C** — làm §6.5 theo kiểu §6.3 (PRD trỏ FRS, hết trùng lặp), hay **vá tại chỗ** giữ nguyên bảng FR đầy đủ?
2. **Tên file** — tạo `OneCRM_PRD_v2.7.md`, hay sửa thẳng vào `v2.6`?
3. **A2 (FR-EVT-01 của M-06)** — sửa luôn trong đợt này, hay tách riêng vì thuộc module khác?
