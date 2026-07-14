# Prompt sinh ảnh BPMN — Module M-05 License & Usage (UC-LIC-01…04)

> **Style theo mẫu M-04** (`docs/frs/catalog/_bpmn_prompts.md`): khung tiếng Anh + nhãn node tiếng Việt; có `NODE INTEGRITY RULES`, `LANE INTEGRITY RULES`, `LAYOUT RULES`, `END EVENTS LEGEND`, và dòng Mermaid fallback.
>
> **Cách dùng:** mỗi prompt là 1 code block → Copy → dán ChatGPT (chế độ tạo ảnh) → xuất PNG → đặt đúng tên → lưu vào thư mục asset tương ứng. FRS đã trỏ sẵn đường dẫn nên ảnh tự hiển thị.
>
> | Prompt | Tên file | Thư mục |
> |---|---|---|
> | UC-LIC-01 | `UC-LIC-01_bpmn.png` | `docs/assets/M-05_licenses/` |
> | UC-LIC-02 | `UC-LIC-02_bpmn.png` | `docs/assets/M-05_licenses/` |
> | UC-LIC-03 | `UC-LIC-03_bpmn.png` | `docs/assets/M-05_licenses/` |
> | UC-LIC-04 | `UC-LIC-04_bpmn.png` | `docs/assets/M-05_licenses/` |
>
> **UC-SUB-03** thuộc M-03 → prompt nằm ở [`docs/frs/subscriptions/_bpmn_prompts.md`](../subscriptions/_bpmn_prompts.md).

---

## 📌 Trạng thái ảnh — cập nhật 14/07/2026, **sau lượt sinh lại thứ hai**

| Ảnh | Trạng thái | Còn phải sửa gì |
|---|---|---|
| **UC-LIC-04** | ✅ **Đạt** | — (không sinh lại từ lượt 1) |
| **UC-LIC-01** | ✅ **Đạt** | Lane đúng · 6 nhánh · nhấn dòng → chi tiết license · Auditor đã có trong ghi chú. *Gợn nhỏ:* End 1 bị vẽ **hai vòng tròn** (một ở cột phải, một dưới EF-01) — cùng nghĩa nên không sai logic; sinh lại sẽ gộp. |
| **UC-LIC-02** | ❌ Sinh lại | (a) **Mỗi End vẽ hai lần** — End 2/3/4/5 xuất hiện cả ở cột phải lẫn dưới các khối AF; (b) **AF-04c** (sản phẩm tự xác thực) bị đặt trong lane System → lane "Trang quản trị sản phẩm" rỗng. |
| **UC-LIC-03** | ❌ Sinh lại | (a) **Bước 3/4/5 (task hệ thống) vẫn nằm trong lane "Người dùng"**; (b) **bước 6** (sản phẩm gửi số liệu) vẫn nằm trong lane System, không phải lane "Sản phẩm"; (c) ghi chú nghiệp vụ **gán sai mã BR** (ghi BR-05 cho quyền, BR-03 cho license nháp). |
| **UC-SUB-03** | ❌ Sinh lại | Logic đã đúng (đủ 9 nhánh · có nhánh "✏️ Sửa" · End 1–9 duy nhất · tab không có nút Gia hạn). Còn lại: **bước 2/3/4 (task hệ thống) vẫn nằm trong lane "User"**. |

### 🔑 Nguyên nhân gốc của lỗi lane (đã sửa trong prompt)

Prompt cũ **tự mâu thuẫn**: `LAYOUT RULES` bắt *"luồng chính nằm trên MỘT hàng ngang, canh trên"*, trong khi `LANE INTEGRITY RULES` bắt *"task hệ thống phải ở lane System"*. Không thể thoả cả hai — máy chọn vế layout và dồn hết node lên lane trên.

**Đã thay bằng luật `⚠️ LANE THẮNG LAYOUT`:** luồng chính chạy trái→phải, nhưng **vị trí dọc của mỗi node do lane của nó quyết định**; đường gấp khúc qua ranh giới lane là **đúng và mong đợi**; cấm kéo node sang lane sai chỉ để giữ thẳng hàng. Kèm luật **"mỗi End chỉ vẽ MỘT vòng tròn — nhiều đường thì hội tụ vào cùng vòng tròn đó"**.

→ **Cần sinh lại 3 ảnh:** UC-LIC-02, UC-LIC-03, UC-SUB-03. *(UC-LIC-01 tuỳ chọn — chỉ để gộp vòng tròn End 1 trùng.)*

---

## ⚠️ Lỗi của bộ ảnh lượt đầu — các prompt dưới đây đã chặn sẵn

| Ảnh | Lỗi đã phát hiện | Luật chặn trong prompt mới |
|---|---|---|
| **UC-LIC-01** | **Bộ khung đúng** (bước 1–5, AF-01, AF-02, AF-04), nhưng: (a) 5 nhánh ra của gateway bước 5 bị nhiễu **CRUD gói của M-04** ("＋ Thêm gói", "Sửa gói DRAFT/ACTIVE", "Xoá gói nháp", "✏️/🗑️ disabled"); (b) **thiếu nhánh mở chi tiết license** — "Click row" lại trỏ vào "Ở lại màn"; (c) **cùng số End mang hai nghĩa** (cột phải ghi End 3 = "Sửa gói", bảng legend ghi End 3 = "Mở modal gia hạn"); (d) empty state ghi "Chưa có gói nào khớp bộ lọc" + nút "＋ Tạo gói"; (e) ghi chú "10 gói/trang" (đúng: 15 bản ghi/trang) | `MAIN FLOW` liệt kê **đúng 6 nhánh** của bước 5; `DO NOT INCLUDE` cấm mọi node về gói; luật "mỗi số End là duy nhất"; empty state đúng chữ |
| **UC-LIC-02** | **Trùng số End** (hai "End 4", hai "End 2"); chữ bị đè/vỡ | `END EVENTS LEGEND` liệt đủ 9 End **duy nhất**; luật "no two End events share a number" |
| **UC-LIC-03** | **Trùng mã EF** (hai hộp cùng ghi "EF-03a") | Luật "each EF id appears exactly once"; đã bỏ hẳn EF-05 (hạn mức người dùng — BR-03 chốt không giới hạn) |
| **UC-LIC-04** | **Hai lane bị hoán đổi**: lane ghi "License Admin" lại chứa task của System và ngược lại | `LANE INTEGRITY RULES` — nhãn lane phải khớp actor của mọi task nằm trong lane đó |
| **UC-SUB-03** | Nhánh **"Chuyển tab" nối thẳng vào End 1** (phải loop về bước 5); hai "End 6"; nội dung tab License còn là thiết kế cũ | Luật loop-back bắt buộc; End 1..9 duy nhất; nội dung tab cập nhật theo component dùng chung |

---

## UC-LIC-01 — Danh sách License & Usage

```
Create a BPMN 2.0 swimlane diagram for the "License & Usage list" (Danh sách License & Usage)
feature of OneCRM — a B2B CRM for cybersecurity products (EDR / C-Shield / Antivirus / CA).

CONTEXT (critical): CRM is a PASSIVE OBSERVER of licenses. This screen is READ-ONLY +
NAVIGATION. It shows the license status that the PRODUCT reports back. It is organised into
3 views by user intent: "Cần xử lý" (issue queue, for License Admin/Manager), "Cơ hội doanh thu"
(revenue opportunities, for Sales), "Tất cả license" (lookup). There is NO create / edit / delete
of anything on this screen.

=== SWIMLANES ===
Pool: "UC-LIC-01 — Danh sách License & Usage"
Lane 1: Người dùng  (Sales / CSKH / Manager / License Admin / Auditor)
Lane 2: System

=== ENTRY POINTS (note above Start Event) ===
(a) Người dùng chọn menu "License & Usage" trên sidebar

=== MAIN FLOW ===
Step 1  [Người dùng]  Start Event → Task "Chọn menu 'License & Usage'"
Step 2  [System]      Task "Tính dải KPI, số đếm của cả 3 view, và danh sách cảnh báo sự cố diện rộng (UC-LIC-04)"
Step 3  [System]      Task "Chọn view mặc định theo ngữ cảnh (BR-01); ẩn/hiện view theo quyền (BR-02)"
Step 4  [System]      Task "Render view đang chọn (banner sự cố diện rộng → dải KPI → bảng)"
Step 5  [Người dùng]  Gateway (Exclusive) "Người dùng muốn làm gì?" — fan ra 6 nhánh:
  → "Đổi view (3 tab)"                       → Alternate Flow AF-01 → LOOP quay lại Step 5
  → "Lọc / tìm kiếm / sắp xếp"               → Alternate Flow AF-02 → LOOP quay lại Step 5
  → "Nhấn một dòng license"                  → Alternate Flow AF-03 → End 2 (UC-LIC-02)
  → "Bấm 'Gia hạn' trên dòng cơ hội"          → Alternate Flow AF-04 → End 3 (UC-SUB-07)
  → "Bấm 'Mở subscription' trên dòng cơ hội"  → Alternate Flow AF-04 → End 4 (UC-SUB-03)
  → "Không thao tác"                          → End 1 (Ở lại màn danh sách)

=== ALTERNATE FLOW AF-01: Đổi view (loop — ở lại màn) ===
Triggered at Step 5
AF-01a  [Người dùng]  Task "Bấm tab 'Cần xử lý' / 'Cơ hội doanh thu' / 'Tất cả license'"
AF-01b  [System]      Task "Render view tương ứng. Số đếm badge & KPI KHÔNG đổi (đã tính ở Step 2 — BR-04)"
→ LOOP: mũi tên quay lại Step 5. KHÔNG tạo End Event.

=== ALTERNATE FLOW AF-02: Lọc / tìm kiếm / sắp xếp (loop — ở lại màn) ===
Triggered at Step 5 — chỉ ở view "Tất cả license"
AF-02a  [Người dùng]  Task "Nhập từ khoá (tên KH / mã subscription / mã định danh), HOẶC chọn bộ lọc: Sản phẩm · Trạng thái license · Mức sử dụng · Thời hạn license"
AF-02b  [System]      Task "Lọc (BR-06), sắp xếp, phân trang lại từ trang 1 (15 bản ghi/trang — BR-07), cập nhật dòng đếm. Không còn bản ghi khớp → EF-01"
→ LOOP: mũi tên quay lại Step 5. KHÔNG tạo End Event.

=== ALTERNATE FLOW AF-03: Mở chi tiết license ===
Triggered at Step 5 — nhấn một dòng bất kỳ (ở cả 3 view)
AF-03a  [Người dùng]  Task "Nhấn một dòng license"
→ End 2 (Chi tiết license — UC-LIC-02)

=== ALTERNATE FLOW AF-04: Hành động trên dòng cơ hội ===
Triggered at Step 5 — chỉ ở view "Cơ hội doanh thu"
AF-04a  [Sales]  Task "Bấm 'Gia hạn' (cơ hội loại Gia hạn)"        → End 3 (modal Gia hạn — UC-SUB-07)
AF-04b  [Sales]  Task "Bấm 'Mở subscription' (cơ hội Bán thêm số lượng)" → End 4 (UC-SUB-03)

=== EXCEPTION FLOW EF-01: Không có bản ghi (empty state) ===
Triggered from Step 4 (view rỗng) hoặc AF-02b (lọc không khớp)
EF-01a  [System]  Task "Hiển thị empty state theo view: 'Không có license nào cần xử lý' / 'Chưa có cơ hội nào' / 'Không có license nào khớp bộ lọc'"
→ End 1 (Ở lại màn — không điều hướng)

=== NODE INTEGRITY RULES (critical — prevents extra/garbled nodes) ===
- MỖI End Event CHỈ ĐƯỢC VẼ MỘT LẦN, là MỘT vòng tròn duy nhất. Nếu nhiều đường cùng dẫn tới
  một End, cho các mũi tên HỘI TỤ vào đúng vòng tròn đó — TUYỆT ĐỐI không vẽ thêm một vòng tròn End
  thứ hai mang cùng số. (Bản vẽ trước bị lỗi này: End 1 / End 2 / End 3 / End 4 bị vẽ hai lần ở hai
  chỗ khác nhau.)
- The diagram MUST contain EXACTLY one node per item listed: Start Event, Step 1–5,
  AF-01a/AF-01b, AF-02a/AF-02b, AF-03a, AF-04a/AF-04b, EF-01a, and End 1..End 4.
  Do NOT synthesize, duplicate, or insert any additional task/gateway/node.
- Step 5 is the ONLY gateway, with EXACTLY the 6 outgoing branches listed above — no other branch.
- AF-01 and AF-02 are LOOPS: they return to the existing Step 5 node. They create NO End Event
  and NO new node. Do NOT draw them ending in an End Event.
- Every End event number is UNIQUE and carries ONE meaning everywhere it appears — the branch label,
  the End circle, and the legend box MUST agree. Exactly one End 1, one End 2, one End 3, one End 4.
  (Bản vẽ cũ bị lỗi này: cột phải ghi "End 3 — Sửa gói" trong khi legend ghi "End 3 — Mở modal gia hạn".)
- "Nhấn một dòng license" MUST lead to End 2 (Chi tiết license — UC-LIC-02). It must NOT lead to
  "Ở lại màn". (Bản vẽ cũ bị lỗi này: "Click row" trỏ vào End 1.)
- Keep every box label concise (≤ ~12 words) so all Vietnamese text renders fully.

=== LANE INTEGRITY RULES (critical) ===
- Each lane's label MUST match the actor of every task inside it. Tasks done by the system
  (tính KPI, chọn view mặc định, render, lọc, empty state) go in lane "System" — NEVER in the
  user lane. Tasks done by a person (chọn menu, bấm tab, nhập từ khoá, nhấn dòng, bấm nút) go in
  lane "Người dùng" — NEVER in the System lane. Do NOT swap the two lanes.

=== LAYOUT RULES (critical — follow strictly to avoid crossing lines) ===
- ⚠️ LANE THẮNG LAYOUT: luồng chính chạy TỪ TRÁI SANG PHẢI, nhưng VỊ TRÍ DỌC của mỗi node do
  LANE của nó quyết định — KHÔNG phải do việc canh cho thẳng hàng. Node của System phải nằm TRONG
  lane System kể cả khi điều đó làm luồng chính gấp khúc lên/xuống qua ranh giới lane. Đường gấp khúc
  qua lane là ĐÚNG và MONG ĐỢI. TUYỆT ĐỐI KHÔNG kéo một node sang lane sai chỉ để giữ nó thẳng hàng
  với node trước. (Bản vẽ trước bị lỗi này: các task hệ thống bị dồn hết lên lane người dùng cho thẳng hàng.)
- Main flow (Start → Step 1 → Step 2 → Step 3 → Step 4 → Step 5) sits left-to-right; vị trí dọc theo lane của từng node (xem luật LANE THẮNG LAYOUT).
- The 4 navigation End events fan out to the RIGHT of Step 5, stacked vertically, each with its own
  short orthogonal branch — no long diagonals.
- AF-01 / AF-02 sit directly BELOW Step 5 with compact right-angle loop-back arrows to Step 5.
  EF-01 sits directly BELOW Step 4.
- Connector lines must NEVER cross unrelated boxes. Each branch label sits next to its own arrow only.

=== VISUAL STYLE ===
- Standard BPMN 2.0. Start = filled circle; End = thick border circle; Task = rounded rectangle;
  Gateway = diamond with X. Main flow = solid black; Alternate (AF) = dashed blue; Exception (EF) =
  dashed red. Step-number badges on each box and the gateway. Language: Vietnamese for all labels.
- Legend (bottom-left) explaining arrow types + node types.

=== BUSINESS NOTES (bottom-middle box, title "GHI CHÚ NGHIỆP VỤ") ===
Chỉ được ghi đúng các ý dưới đây — KHÔNG tự bịa thêm ghi chú nào khác:
- View mặc định chọn theo ngữ cảnh (BR-01); view "Cần xử lý" + banner sự cố diện rộng chỉ hiện với
  **Manager / License Admin / Auditor** (BR-02) — Auditor xem được nhưng KHÔNG có nút Đồng bộ lại.
- Số đếm badge & KPI tính ở Step 2 — đúng cho MỌI view, kể cả view chưa mở (BR-04).
- View "Tất cả license" mặc định đẩy license có vấn đề lên đầu (BR-05).
- Bộ lọc "Thời hạn license": Đã quá hạn · Còn dưới 30 / 60 / 90 ngày (BR-06).
- Phân trang 15 bản ghi/trang (BR-07).
- Khách hàng triển khai tại chỗ: vẫn hiện, gắn nhãn "Không theo dõi tự động", loại khỏi mọi cảnh báo
  và cơ hội bán thêm (BR-08).

=== DO NOT INCLUDE (critical — bản vẽ cũ đã sai vì phần này) ===
- TUYỆT ĐỐI KHÔNG vẽ bất kỳ node nào về GÓI SẢN PHẨM (package): KHÔNG "＋ Thêm gói", KHÔNG "Tạo gói",
  KHÔNG "Sửa gói (DRAFT/ACTIVE)", KHÔNG "Xoá gói nháp", KHÔNG nút "✏️/🗑️ disabled + tooltip",
  KHÔNG "10 gói/trang", KHÔNG "Hiện mọi phiên bản", KHÔNG empty state "Chưa có gói nào khớp bộ lọc".
  Đó là module Danh mục gói (M-04) — KHÔNG liên quan tới màn này.
- KHÔNG có bất kỳ thao tác tạo / sửa / xoá nào — đây là màn CHỈ ĐỌC + ĐIỀU HƯỚNG (CRM là bên quan sát).
- KHÔNG vẽ thao tác chỉnh sửa license (đổi trạng thái, set số lượng, thu hồi) — CRM không có quyền đó.
- KHÔNG vẽ nội dung bên trong UC-LIC-02 / UC-SUB-07 / UC-SUB-03 — chỉ dừng ở End điều hướng.

=== END EVENTS LEGEND (bottom-right box, title "KẾT THÚC (END EVENTS)") ===
1. End 1 — Ở lại màn danh sách: mặc định; sau AF-01 (đổi view), AF-02 (lọc/sắp xếp), hoặc EF-01 (empty state).
2. End 2 — Chi tiết license (UC-LIC-02): Step 5, nhấn một dòng.
3. End 3 — Modal Gia hạn (UC-SUB-07): Step 5, bấm "Gia hạn" trên dòng cơ hội.
4. End 4 — Chi tiết subscription (UC-SUB-03): Step 5, bấm "Mở subscription" trên dòng cơ hội.

Output as a Mermaid flowchart code block if image generation is not available, using subgraph for swimlanes.
```

---

## UC-LIC-02 — Xem chi tiết License

```
Create a BPMN 2.0 swimlane diagram for the "License Detail" (Xem chi tiết License) feature of
OneCRM — a B2B CRM for cybersecurity products (EDR / C-Shield / Antivirus / CA).

CONTEXT (critical): CRM is a PASSIVE OBSERVER. This screen shows the license status reported by
the PRODUCT. It has NO license-editing action (no status change, no seat change, no revoke).
All lifecycle actions belong to the SUBSCRIPTION (UC-SUB-03), not here.

=== SWIMLANES ===
Pool: "UC-LIC-02 — Xem chi tiết License"
Lane 1: Người dùng  (Sales / CSKH / Manager / License Admin / Auditor)
Lane 2: System
Lane 3: Trang quản trị sản phẩm (hệ thống ngoài)

=== ENTRY POINTS (note above Start Event) ===
(a) Nhấn một dòng ở Danh sách License & Usage (UC-LIC-01)
(b) Bấm "Xem trong module License & Usage" ở tab License & Usage của Chi tiết Subscription (UC-SUB-03)

=== MAIN FLOW ===
Step 1  [Người dùng]  Start Event → Task "Mở chi tiết license (từ UC-LIC-01 hoặc UC-SUB-03)"
Step 2  [System]      Gateway (Exclusive) "Subscription tồn tại & đã có license?"
  → "Không tồn tại"        → Exception Flow EF-01 (→ End 6)
  → "Chưa có license (nháp)" → Exception Flow EF-02 (→ End 1)
  → "Có"                   → tiếp Step 3
Step 3  [System]      Task "Đánh giá cảnh báo (UC-LIC-04) theo ngưỡng cấu hình của sản phẩm; render: cảnh báo (nếu có) · khối Trạng thái license + Mức sử dụng · Thông tin từ sản phẩm (nếu có) · hàng hành động theo ngữ cảnh"
Step 4  [Người dùng]  Gateway (Exclusive) "Người dùng muốn làm gì?" — fan ra 6 nhánh:
  → "🔄 Đồng bộ lại"                  → AF-01 → End 2 (UC-LIC-03)
  → "Gia hạn"                        → AF-02 → End 3 (UC-SUB-07)
  → "Xem tiến độ triển khai"          → AF-03 → End 4 (Timeline của UC-SUB-03)
  → "↗ Mở trang quản trị sản phẩm"    → AF-04 → End 5
  → "Điều hướng chéo (KH / HĐ / Sub)" → AF-05 → End 7 / End 8 / End 9
  → "Quay lại / không thao tác"       → End 1

=== ALTERNATE FLOW AF-01: Đồng bộ lại mức sử dụng ===
Triggered at Step 4 — nút chỉ hiện theo điều kiện ngữ cảnh
AF-01a  [Người dùng]  Task "Bấm '🔄 Đồng bộ lại' → chuyển sang UC-LIC-03"
→ End 2 (Đã gửi yêu cầu đồng bộ)

=== ALTERNATE FLOW AF-02: Gia hạn ===
Triggered at Step 4 — chỉ hiện khi license còn hiệu lực và sắp/đã quá hạn
AF-02a  [Người dùng]  Task "Bấm 'Gia hạn' → mở modal gia hạn (UC-SUB-07)"
→ End 3

=== ALTERNATE FLOW AF-03: Xem tiến độ triển khai ===
Triggered at Step 4 — chỉ hiện khi license đang chờ kích hoạt HOẶC đang lệch trạng thái
AF-03a  [Người dùng]  Task "Bấm 'Xem tiến độ triển khai' → mở tab Timeline của UC-SUB-03"
→ End 4

=== ALTERNATE FLOW AF-04: Mở trang quản trị sản phẩm ===
Triggered at Step 4 — chỉ với người có quyền license:view_portal
AF-04a  [Người dùng]                  Task "Bấm '↗ Mở trang quản trị sản phẩm'"
AF-04b  [System]                      Task "Ghi nhật ký hoạt động (ai · subscription nào · mã định danh nào); mở tab mới tới địa chỉ sinh từ cấu hình sản phẩm"
AF-04c  [Trang quản trị sản phẩm]     Task "Sản phẩm TỰ xác thực người dùng — không có tài khoản thì từ chối. CRM KHÔNG xác thực hộ"
→ End 5

=== ALTERNATE FLOW AF-05: Điều hướng chéo ===
Triggered at Step 4
AF-05a  [Người dùng]  Gateway (Exclusive) "Đích điều hướng?"
  → "Tên khách hàng"        → End 7 (UC-CUS-03)
  → "Mã hợp đồng"           → End 8 (UC-CON-03)
  → "Nút 'Mở subscription'" → End 9 (UC-SUB-03)

=== EXCEPTION FLOW EF-01: Subscription không tồn tại ===
Triggered from Step 2
EF-01a  [System]  Task "Không mở được trang chi tiết; quay lại danh sách UC-LIC-01 kèm thông báo ngắn 'Không tìm thấy subscription'"
→ End 6

=== EXCEPTION FLOW EF-02: Subscription chưa có license ===
Triggered from Step 2 — subscription ở trạng thái nháp / chưa gửi sang sản phẩm
EF-02a  [System]  Task "Hiển thị trạng thái 'Chưa có license'; không mức sử dụng, không cảnh báo, không hành động"
→ End 1 (Ở lại màn chi tiết)

=== NODE INTEGRITY RULES (critical) ===
- MỖI End Event CHỈ ĐƯỢC VẼ MỘT LẦN, là MỘT vòng tròn duy nhất. Nếu nhiều đường cùng dẫn tới
  một End, cho các mũi tên HỘI TỤ vào đúng vòng tròn đó — TUYỆT ĐỐI không vẽ thêm một vòng tròn End
  thứ hai mang cùng số. (Bản vẽ trước bị lỗi này: End 1 / End 2 / End 3 / End 4 bị vẽ hai lần ở hai
  chỗ khác nhau.)
- EXACTLY one node per listed item: Start, Step 1–4, AF-01a, AF-02a, AF-03a, AF-04a/b/c,
  AF-05a (gateway), EF-01a, EF-02a, and End 1..End 9. No extra/bridge/placeholder nodes.
- Every End event number is UNIQUE — exactly one End 1, one End 2, … one End 9. TWO DIFFERENT
  branches may NEVER carry the same End number (bản vẽ cũ bị lỗi này: hai "End 4", hai "End 2").
- Step 2 has EXACTLY 3 outgoing branches; Step 4 has EXACTLY 6; AF-05a has EXACTLY 3.
- KHÔNG có node nào chỉnh sửa license — không đổi trạng thái, không set số lượng, không thu hồi.
- Keep every box label concise (≤ ~12 words) so all Vietnamese text renders fully; do not let
  labels overlap arrows or lane titles.

=== LANE INTEGRITY RULES (critical) ===
- Lane label MUST match the actor of every task inside it. AF-04c (sản phẩm tự xác thực người dùng) là
  node DUY NHẤT nằm trong lane "Trang quản trị sản phẩm" — bản vẽ trước đặt nhầm nó trong lane System,
  khiến lane sản phẩm rỗng (chỉ còn mấy vòng tròn End). End Event KHÔNG phải node của lane này. System tasks (đánh giá cảnh báo, render, ghi nhật ký,
  empty/không tìm thấy) go in lane "System". Do NOT swap lanes.

=== LAYOUT RULES (critical) ===
- ⚠️ LANE THẮNG LAYOUT: luồng chính chạy TỪ TRÁI SANG PHẢI, nhưng VỊ TRÍ DỌC của mỗi node do
  LANE của nó quyết định — KHÔNG phải do việc canh cho thẳng hàng. Node của System phải nằm TRONG
  lane System kể cả khi điều đó làm luồng chính gấp khúc lên/xuống qua ranh giới lane. Đường gấp khúc
  qua lane là ĐÚNG và MONG ĐỢI. TUYỆT ĐỐI KHÔNG kéo một node sang lane sai chỉ để giữ nó thẳng hàng
  với node trước. (Bản vẽ trước bị lỗi này: các task hệ thống bị dồn hết lên lane người dùng cho thẳng hàng.)
- Main flow (Start → Step 1 → Step 2 → Step 3 → Step 4) left-to-right; vị trí dọc theo lane của từng node.
- The AF sub-flows sit directly BELOW Step 4, aligned to its x-position; their End events drop
  straight down. EF-01 / EF-02 sit directly BELOW Step 2.
- End events fan out with short orthogonal branches — no long diagonals, no crossing unrelated boxes.

=== VISUAL STYLE ===
- Standard BPMN 2.0. Main flow = solid black; AF = dashed blue; EF = dashed red. Step-number badges on
  each box and gateway. Vietnamese labels. Legend bottom-left.

=== DO NOT INCLUDE ===
- KHÔNG vẽ thao tác chỉnh sửa license (đổi trạng thái / số lượng / thu hồi) — BR-01, CRM là bên quan sát.
- KHÔNG vẽ nội dung bên trong UC-LIC-03 / UC-SUB-07 / UC-SUB-03 — chỉ dừng ở End điều hướng.
- KHÔNG vẽ CRM gọi API sản phẩm để "hỏi trạng thái" — CRM chỉ nhận dữ liệu sản phẩm gửi về.

=== END EVENTS LEGEND (bottom-right box, title "KẾT THÚC (END EVENTS)") ===
1. End 1 — Ở lại màn chi tiết: Step 4 (quay lại / không thao tác), hoặc EF-02 (chưa có license).
2. End 2 — Đã gửi yêu cầu đồng bộ (UC-LIC-03): AF-01.
3. End 3 — Mở modal Gia hạn (UC-SUB-07): AF-02.
4. End 4 — Chuyển sang Timeline của subscription (UC-SUB-03): AF-03.
5. End 5 — Mở trang quản trị sản phẩm (tab mới): AF-04.
6. End 6 — Không tìm thấy subscription, quay lại danh sách: EF-01.
7. End 7 — Khách hàng 360° (UC-CUS-03): AF-05.
8. End 8 — Chi tiết hợp đồng (UC-CON-03): AF-05.
9. End 9 — Chi tiết subscription (UC-SUB-03): AF-05.

Output as a Mermaid flowchart code block if image generation is not available, using subgraph for swimlanes.
```

---

## UC-LIC-03 — Đồng bộ lại mức sử dụng

```
Create a BPMN 2.0 swimlane diagram for the "Request usage re-sync" (Đồng bộ lại mức sử dụng)
feature of OneCRM — a B2B CRM for cybersecurity products (EDR / C-Shield / Antivirus / CA).

CONTEXT (critical): This is an ASYNCHRONOUS REQUEST, not a command. CRM asks the product to send
its usage numbers again; CRM NEVER edits the numbers itself, and there is NO committed response
time. The UI must say clearly that it is waiting for the product.

=== SWIMLANES ===
Pool: "UC-LIC-03 — Đồng bộ lại mức sử dụng"
Lane 1: Người dùng  (Sales / CSKH / Manager / License Admin — KHÔNG có Auditor)
Lane 2: System
Lane 3: Sản phẩm (hệ thống ngoài)

=== ENTRY POINTS (note above Start Event) ===
(a) Bấm "🔄 Đồng bộ lại" ở màn Chi tiết license (UC-LIC-02)
(b) Bấm "🔄 Đồng bộ lại" ở tab License & Usage của Chi tiết Subscription (UC-SUB-03)

=== MAIN FLOW ===
Step 1  [Người dùng]  Start Event → Task "Bấm '🔄 Đồng bộ lại' (cạnh khối Mức sử dụng)"
Step 2  [System]      CHUỖI 4 GATEWAY kiểm tra tuần tự (mỗi gateway rẽ về đúng MỘT EF):
  Gateway 2a "Có quyền license:force_sync?"          → Không → EF-01 (→ End 3)
  Gateway 2b "Sản phẩm hỗ trợ gửi lại số liệu?"       → Không → EF-02 (→ End 3)
  Gateway 2c "Subscription đang Active / Tạm dừng?"   → Không → EF-03 (→ End 3)
  Gateway 2d "Trong giới hạn 1 lần / 5 phút / sub?"    → Vượt  → EF-04 (→ End 3)
  → Tất cả "Có" → tiếp Step 3
Step 3  [System]      Task "Ghi nhận yêu cầu (202), gửi sang sản phẩm; ghi nhật ký hoạt động + một dòng tiến độ vào Timeline của subscription"
Step 4  [System]      Task "Thông báo: 'Đã gửi yêu cầu đồng bộ — đang chờ {sản phẩm} gửi lại số liệu. Thời gian phản hồi không cam kết.'"
Step 5  [System]      Task "Nút đổi thành chỉ báo tại chỗ '⏳ Đang chờ {sản phẩm} phản hồi…'"
Step 6  [Sản phẩm]    Task "Sản phẩm gửi lại số liệu mức sử dụng"
Step 7  [System]      Task "Cập nhật mức sử dụng + thời điểm cập nhật; chỉ báo chờ biến mất"
→ End 1 (Sản phẩm đã gửi lại số liệu)

=== ALTERNATE FLOW AF-01: Sản phẩm không phản hồi ===
Triggered after Step 5 — quá ngưỡng chờ mà chưa nhận được số liệu
AF-01a  [System]  Task "Đổi chỉ báo thành '⚠️ {Sản phẩm} chưa phản hồi — kết nối có thể đang chậm hoặc gián đoạn'"
AF-01b  [System]  Task "Số liệu mức sử dụng GIỮ NGUYÊN — CRM không tự sửa số"
→ End 2 (Đã gửi yêu cầu nhưng sản phẩm chưa phản hồi)

=== EXCEPTION FLOWS (đều kết thúc End 3 — KHÔNG phát sinh yêu cầu nào sang sản phẩm) ===
EF-01a  [System]  Task "Không có quyền → giao diện KHÔNG render nút; gọi thẳng API → 403"
EF-02a  [System]  Task "Sản phẩm không hỗ trợ → ẨN HẲN nút; gọi thẳng API → 400 NOT_SUPPORTED"
EF-03a  [System]  Task "Sub không ở trạng thái Active/Tạm dừng → nút DISABLE + tooltip; gọi API → 400"
EF-04a  [System]  Task "Vượt 1 lần/5 phút cùng subscription → 429 + báo còn bao nhiêu phút nữa được thử lại"
→ Cả 4 hội tụ về End 3 (Từ chối — không phát sinh yêu cầu)

=== NODE INTEGRITY RULES (critical) ===
- MỖI End Event CHỈ ĐƯỢC VẼ MỘT LẦN, là MỘT vòng tròn duy nhất. Nếu nhiều đường cùng dẫn tới
  một End, cho các mũi tên HỘI TỤ vào đúng vòng tròn đó — TUYỆT ĐỐI không vẽ thêm một vòng tròn End
  thứ hai mang cùng số. (Bản vẽ trước bị lỗi này: End 1 / End 2 / End 3 / End 4 bị vẽ hai lần ở hai
  chỗ khác nhau.)
- EXACTLY one node per listed item: Start, Step 1, the 4 gateways (2a/2b/2c/2d), Step 3–7,
  AF-01a/AF-01b, EF-01a, EF-02a, EF-03a, EF-04a, and End 1 / End 2 / End 3.
- MỖI MÃ EF CHỈ XUẤT HIỆN ĐÚNG MỘT LẦN. Bốn hộp ngoại lệ mang bốn mã KHÁC NHAU: EF-01a, EF-02a,
  EF-03a, EF-04a. (Bản vẽ cũ bị lỗi: hai hộp cùng ghi "EF-03a".)
- CHỈ CÓ 4 EF — KHÔNG có EF-05, KHÔNG có bất kỳ node nào về "hạn mức theo người dùng" /
  "20 lượt/giờ/người" / QUOTA_EXCEEDED. Chốt 13/07/2026: KHÔNG giới hạn số lượt theo người dùng.
- Step 6 is the ONLY node in the "Sản phẩm" lane on the happy path. There is NO node where CRM
  edits usage numbers by itself.
- Keep every box label concise (≤ ~12 words) so all Vietnamese text renders fully.

=== LANE INTEGRITY RULES (critical — bản vẽ trước sai đúng chỗ này) ===
- Lane label MUST match the actor of every task inside. Cụ thể, KHÔNG được đặt sai:
  · Lane "Người dùng" chứa **ĐÚNG MỘT** node: Step 1 (bấm nút). Không có gì khác.
  · Lane "System" chứa: 4 gateway (2a–2d), Step 3, Step 4, Step 5, Step 7, và cả 4 hộp EF + AF-01a/AF-01b.
    Step 3 / Step 4 / Step 5 là **tác vụ hệ thống** (gear icon) — TUYỆT ĐỐI không vẽ chúng trong lane
    "Người dùng", và không gắn icon người cho chúng.
  · Lane "Sản phẩm" chứa **ĐÚNG MỘT** node trên luồng chính: Step 6 (sản phẩm gửi lại số liệu).
    Không đặt Step 6 trong lane System. End events KHÔNG phải là node của lane Sản phẩm.
- Nếu một node phải nằm ở lane khác với node kế trước, vẽ mũi tên đi dọc qua ranh giới lane —
  KHÔNG kéo node sang lane sai để cho thẳng hàng.

=== LAYOUT RULES (critical) ===
- ⚠️ LANE THẮNG LAYOUT: luồng chính chạy TỪ TRÁI SANG PHẢI, nhưng VỊ TRÍ DỌC của mỗi node do
  LANE của nó quyết định — KHÔNG phải do việc canh cho thẳng hàng. Node của System phải nằm TRONG
  lane System kể cả khi điều đó làm luồng chính gấp khúc lên/xuống qua ranh giới lane. Đường gấp khúc
  qua lane là ĐÚNG và MONG ĐỢI. TUYỆT ĐỐI KHÔNG kéo một node sang lane sai chỉ để giữ nó thẳng hàng
  với node trước. (Bản vẽ trước bị lỗi này: các task hệ thống bị dồn hết lên lane người dùng cho thẳng hàng.)
- Main flow (Start → Step 1 → 2a → 2b → 2c → 2d → Step 3 → Step 4 → Step 5 → Step 6 → Step 7 → End 1)
  left-to-right; vị trí dọc theo lane của từng node (xem luật LANE THẮNG LAYOUT).
- The 4 EF boxes sit directly BELOW their own gateway (EF-01a below 2a, EF-02a below 2b, EF-03a below
  2c, EF-04a below 2d), then converge downward into a single End 3.
- AF-01 sits directly BELOW Step 5, dropping to End 2.
- No long diagonals; no line crossing an unrelated box.

=== VISUAL STYLE ===
- Standard BPMN 2.0. Main flow = solid black; AF = dashed blue; EF = dashed red. External-system task
  (Step 6) uses a distinct icon/colour. Step-number badges on each box and gateway. Vietnamese labels.
  Legend bottom-left.

=== BUSINESS NOTES (bottom-middle box, title "GHI CHÚ NGHIỆP VỤ") ===
Chỉ được ghi đúng các ý dưới đây, KÈM ĐÚNG MÃ BR — không tự gán mã BR khác:
- Đây là yêu cầu XIN dữ liệu, không phải lệnh; không cam kết thời gian phản hồi (BR-06).
- Chỉ áp dụng cho subscription đang Active / Tạm dừng (BR-01).
- Giới hạn 1 lần / 5 phút / subscription (BR-02). KHÔNG giới hạn theo người dùng (BR-03).
- Chỉ người có quyền license:force_sync mới thấy nút; Auditor KHÔNG có (BR-04).
- Sản phẩm khai báo không hỗ trợ → ẩn hẳn nút (BR-05).
- Ghi nhật ký hoạt động + 1 dòng tiến độ vào Timeline của subscription (BR-07).
- Số liệu chỉ đổi khi sản phẩm gửi về — CRM không tự sửa số (BR-08).

=== DO NOT INCLUDE ===
- KHÔNG vẽ CRM tự sửa số liệu mức sử dụng — số chỉ đổi khi sản phẩm gửi về (BR-08).
- KHÔNG vẽ hạn mức theo người dùng (EF-05 cũ đã bị bỏ).
- KHÔNG cam kết thời gian phản hồi của sản phẩm — không vẽ timer/SLA cứng trên luồng chính.

=== END EVENTS LEGEND (bottom-right box, title "KẾT THÚC (END EVENTS)") ===
1. End 1 — Sản phẩm đã gửi lại số liệu; mức sử dụng cập nhật (Step 7).
2. End 2 — Đã gửi yêu cầu nhưng sản phẩm chưa phản hồi; số liệu giữ nguyên (AF-01).
3. End 3 — Từ chối (403 / 400 / 429) — không phát sinh yêu cầu nào (EF-01…EF-04).

Output as a Mermaid flowchart code block if image generation is not available, using subgraph for swimlanes.
```

---

## UC-LIC-04 — Phát hiện & cảnh báo sự cố license

```
Create a BPMN 2.0 swimlane diagram for "License issue detection & alerting"
(Phát hiện & cảnh báo sự cố license) in OneCRM — a B2B CRM for cybersecurity products.

CONTEXT (critical): The system ONLY DETECTS AND WARNS. It never changes any license or
subscription status, and never calls the product. The diagram therefore has TWO INDEPENDENT
FLOWS that are NOT connected by a sequence flow: (A) the System scan, and (B) the human handling
the queue afterwards.

=== SWIMLANES ===
Pool: "UC-LIC-04 — Phát hiện & cảnh báo sự cố license"
Lane 1: System        ← chứa TOÀN BỘ Flow A (quét, chấm mức độ, đẩy vào hàng đợi)
Lane 2: License Admin ← chứa TOÀN BỘ Flow B (mở hàng đợi, xử lý)

=== ENTRY POINTS (note above the two Start Events) ===
(a) Flow A: Cron quét định kỳ; và mỗi lần render màn License & Usage
(b) Flow B: License Admin mở view "Cần xử lý"

=== FLOW A — QUÉT & CẢNH BÁO (lane System) ===
Step 1  [System]  Start Event A → Task "Quét định kỳ toàn bộ license mirror"
Step 2  [System]  Task "Mỗi license: đối chiếu 3 dấu hiệu (lệch trạng thái / chưa cập nhật / bất thường dữ liệu); áp dụng loại trừ (ân hạn · vừa gia hạn · chờ trong ngưỡng · on-premise)"
Step 3  [System]  Task "Chấm mức độ theo bảng quyết định: Cao (có người đang chịu thiệt ngay) / Trung bình (đang mù thông tin) / Thấp (chỉ sai dữ liệu nội bộ)"
Step 4  [System]  Task "Gom theo sản phẩm; đánh giá sự cố diện rộng theo NGƯỠNG KÉP (≥ 3 license VÀ ≥ 30% số license đang hoạt động của sản phẩm)"
Step 5  [System]  Task "Đẩy vào hàng đợi 'Cần xử lý' + banner diện rộng (UC-LIC-01). KHÔNG thay đổi trạng thái nào"
→ End 1 (Hoàn tất một chu kỳ quét — cảnh báo đã vào hàng đợi/banner)

=== FLOW B — XỬ LÝ (lane License Admin) ===
Step 6  [License Admin]  Start Event B → Task "Mở view 'Cần xử lý', đọc cột 'Việc cần làm'"
Step 7  [License Admin]  Gateway (Exclusive) "Xử lý thế nào?" — 4 nhánh:
  → "Nhấn dòng xem chi tiết"                  → End 2 (UC-LIC-02)
  → "Đồng bộ lại (sự cố chưa cập nhật)"        → End 3 (UC-LIC-03)
  → "Xem tiến độ triển khai"                  → End 4 (Timeline — UC-SUB-03)
  → "Xử lý ngoài hệ thống"                    → Step 8
Step 8  [License Admin]  Task "Liên hệ đội sản phẩm / bộ phận vận hành (ngoài hệ thống)"
→ End 5 (Sự cố tự biến mất khỏi hàng đợi khi dữ liệu về đúng — không có nút 'đã đọc')

=== NODE INTEGRITY RULES (critical) ===
- MỖI End Event CHỈ ĐƯỢC VẼ MỘT LẦN, là MỘT vòng tròn duy nhất. Nếu nhiều đường cùng dẫn tới
  một End, cho các mũi tên HỘI TỤ vào đúng vòng tròn đó — TUYỆT ĐỐI không vẽ thêm một vòng tròn End
  thứ hai mang cùng số. (Bản vẽ trước bị lỗi này: End 1 / End 2 / End 3 / End 4 bị vẽ hai lần ở hai
  chỗ khác nhau.)
- EXACTLY one node per listed item: Start A, Step 1–5, End 1; Start B, Step 6, Step 7 (gateway),
  Step 8, End 2..End 5. No extra/bridge nodes.
- Flow A and Flow B are NOT joined by any sequence flow. Do NOT draw an arrow from Step 5 to Step 6.
  (Optionally a thin dashed ANNOTATION line labelled "hàng đợi 'Cần xử lý'" may hint the hand-off.)
- There is NO node where the system changes a license/subscription status, and NO node where the
  system calls the product. Detection only.
- Every End number is unique (End 1..End 5).
- Keep every box label concise (≤ ~12 words) so all Vietnamese text renders fully.

=== LANE INTEGRITY RULES (critical — bản vẽ cũ bị lỗi đúng chỗ này) ===
- Lane 1 is labelled "System" and MUST contain ONLY Start A + Step 1–5 + End 1 — all machine tasks.
- Lane 2 is labelled "License Admin" and MUST contain ONLY Start B + Step 6–8 + End 2..End 5 — all
  human tasks.
- DO NOT SWAP THE LANE LABELS. A lane whose label says "License Admin" must not contain the cron scan;
  a lane whose label says "System" must not contain "mở view Cần xử lý".

=== LAYOUT RULES (critical) ===
- ⚠️ LANE THẮNG LAYOUT: luồng chính chạy TỪ TRÁI SANG PHẢI, nhưng VỊ TRÍ DỌC của mỗi node do
  LANE của nó quyết định — KHÔNG phải do việc canh cho thẳng hàng. Node của System phải nằm TRONG
  lane System kể cả khi điều đó làm luồng chính gấp khúc lên/xuống qua ranh giới lane. Đường gấp khúc
  qua lane là ĐÚNG và MONG ĐỢI. TUYỆT ĐỐI KHÔNG kéo một node sang lane sai chỉ để giữ nó thẳng hàng
  với node trước. (Bản vẽ trước bị lỗi này: các task hệ thống bị dồn hết lên lane người dùng cho thẳng hàng.)
- Flow A on ONE straight horizontal line at the top (inside lane System).
- Flow B on ONE straight horizontal line below it (inside lane License Admin).
- Step 7's 4 branches fan out to the RIGHT, stacked vertically, short orthogonal arrows only.
- No line crosses an unrelated box.

=== VISUAL STYLE ===
- Standard BPMN 2.0. Start = filled circle; End = thick border circle; Task = rounded rectangle;
  Gateway = diamond with X. System tasks use a gear icon; human tasks a person icon. Step-number
  badges on each box and gateway. Vietnamese labels. Legend bottom-left.
- Optional small annotation box (top-right) titled "MỨC ĐỘ": "Cao = có người đang chịu thiệt ngay ·
  Trung bình = chưa thiệt nhưng đang mù thông tin · Thấp = chỉ sai dữ liệu nội bộ". Thin, faded,
  not wired into the flow.

=== DO NOT INCLUDE ===
- KHÔNG vẽ hệ thống tự sửa trạng thái license/subscription — chỉ cảnh báo (BR-17).
- KHÔNG vẽ CRM gọi sang sản phẩm khi phát hiện sự cố.
- KHÔNG vẽ nút "đã đọc" / "bỏ qua cảnh báo" — cảnh báo tự tắt khi dữ liệu về đúng (BR-18).
- KHÔNG vẽ ngưỡng cứng bằng số phút/giờ trên node — ngưỡng đọc từ cấu hình của từng sản phẩm.

=== END EVENTS LEGEND (bottom-right box, title "KẾT THÚC (END EVENTS)") ===
1. End 1 — Hoàn tất một chu kỳ quét: cảnh báo đã vào hàng đợi + banner (Flow A).
2. End 2 — Mở chi tiết license (UC-LIC-02): Step 7.
3. End 3 — Đồng bộ lại số liệu (UC-LIC-03): Step 7, với sự cố "chưa cập nhật".
4. End 4 — Xem tiến độ triển khai (Timeline — UC-SUB-03): Step 7.
5. End 5 — Xử lý ngoài hệ thống: Step 8; sự cố tự biến mất khỏi hàng đợi khi dữ liệu về đúng.

Output as a Mermaid flowchart code block if image generation is not available, using subgraph for swimlanes.
```

---

## UC-SUB-03

> 📌 **Đã chuyển sang [`docs/frs/subscriptions/_bpmn_prompts.md`](../subscriptions/_bpmn_prompts.md)**
> — UC-SUB-03 thuộc **M-03**, không thuộc M-05. Prompt bản mới nhất nằm ở đó.
