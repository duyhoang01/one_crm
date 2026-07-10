# Prompt sinh ảnh BPMN (ChatGPT image) — Module M-04 Catalog (UC-CAT-01…07)

> **Style theo mẫu UC-CON-06:** khung tiếng Anh + nhãn node tiếng Việt; có `NODE INTEGRITY RULES` (chống thừa/rối node), `LAYOUT RULES` (chống đè/cắt line), `END EVENTS LEGEND`, và dòng Mermaid fallback.
>
> **Cách dùng:** mỗi prompt là 1 code block → bấm **Copy** góc block → dán ChatGPT (chế độ tạo ảnh) → xuất PNG, đặt tên đúng `UC-CAT-0X_bpmn.png` → lưu `docs/assets/M-04_catalog/`. FRS đã trỏ sẵn đường dẫn nên ảnh tự hiển thị.
>
> Nếu ChatGPT không vẽ được ảnh diagram: mỗi prompt đã có dòng cuối yêu cầu xuất **Mermaid flowchart** — dán vào https://mermaid.live để render.
>
> **Ghi chú gọn-sơ-đồ** (để ảnh dễ đọc): UC-CAT-04 gộp 4 nút vòng đời (🚀/⏹/🗑️/↩️) thành **1 nhánh → UC-CAT-07**; UC-CAT-07 gộp 4 thao tác vào **1 khung guard chung**. Nếu muốn tách đủ 8 End (UC-CAT-04) hoặc 4 End Success riêng (UC-CAT-07) trên sơ đồ, báo để chỉnh.

---

## UC-CAT-01 — Danh sách Sản phẩm (Kanban)

```
Create a BPMN 2.0 swimlane diagram for the "Product Catalog — Kanban" (Danh sách Sản phẩm)
feature of OneCRM — a B2B CRM for cybersecurity products (EDR/EPP/AV/CA). This is a
read-only + navigation screen: the System renders a Kanban grid of products, and the user's
click choice fans out to navigation End Events. There is NO create/update/delete flow.

=== SWIMLANES ===
Pool: "UC-CAT-01 — Danh sách Sản phẩm"
Lane 1: Người dùng
Lane 2: System

=== ENTRY POINTS (note above Start Event) ===
(a) Click menu "📦 Sản phẩm" trên sidebar → showModule('product')

=== MAIN FLOW ===
Step 1  [System]      Start Event → Task "Tải toàn bộ product, render lưới Kanban 2 cột (thẻ: icon, tên, mô tả, badge trạng thái, 📦 gói đang bán, 👥 subscription, nút 'Xem N gói')"
Step 2  [Người dùng]  Gateway (Exclusive) "Loại thao tác?"
  → Nhánh "Click thân thẻ (đầu thẻ)":  catOpenProduct(prodId) → End 1 (Chi tiết Sản phẩm — UC-CAT-02)
  → Nhánh "Click nút 'Xem N gói của sản phẩm →'":  catViewPackages(prodId) → End 2 (Danh sách Gói đã lọc — UC-CAT-03)

=== ALTERNATE FLOW AF-01: Catalog rỗng (chưa có product) ===
Triggered at Step 1 — catalog không có product nào
AF-01a  [System]  Task "Lưới Kanban không render thẻ nào; hiển thị empty state 'Chưa có sản phẩm nào trong danh mục'"
→ End 3 (Empty state) — không điều hướng

=== NODE INTEGRITY RULES (critical — prevents extra/garbled nodes) ===
- The diagram MUST contain EXACTLY one node per item explicitly listed in this spec: Start Event,
  Step 1 (Task), Step 2 (Gateway diamond), AF-01a (Task), and the 3 End sub-events (End 1, End 2, End 3).
  Do NOT synthesize, duplicate, or insert any additional task/gateway/node — no placeholder or
  "bridge" nodes between two listed nodes.
- Step 2 is a SINGLE exclusive gateway with exactly TWO outgoing branches: "Click thân thẻ" → End 1,
  and "Click nút 'Xem N gói'" → End 2. No third branch out of this gateway.
- End 3 is reached ONLY from AF-01a (the empty-state path), NOT from the Step 2 gateway.
- There is NO write/save/CRUD node anywhere — no create, update, or delete task exists in this UC.
- Each numbered badge must attach to the exact single node it belongs to. The gateway diamond (Step 2)
  must visibly show its step-number badge, same as the task box.
- Keep every box label concise (≤ ~12 words) with adequate spacing so all Vietnamese text renders fully.

=== LAYOUT RULES (critical — follow strictly to avoid crossing lines) ===
- The main flow sits on a single straight horizontal lane, left to right, top-aligned:
  Start → Step 1 → Step 2 (gateway). Do NOT float Step 1 or Step 2 above/below that lane.
- From the Step 2 gateway, the two navigation branches fan out to the right toward End 1 (top) and
  End 2 (bottom), each with its own short orthogonal branch — no long diagonal lines.
- AF-01 (empty state) is placed directly BELOW Step 1, aligned to Step 1's x-position, dropping straight
  down to AF-01a → End 3.
- Connector lines must NEVER cross unrelated boxes. Use short right-angle drops only.
- Each branch label sits immediately next to that branch's own outgoing arrow only.

=== VISUAL STYLE ===
- Standard BPMN 2.0 notation. Start = filled circle; End = thick border circle; Task = rounded rectangle;
  Gateway = diamond with X (exclusive). Main flow = solid black arrows; Alternate (AF) = dashed blue.
  Step numbers visible on each box/diamond. Language: Vietnamese for all node labels.
- Add a legend (bottom-left) explaining arrow types + node types.

=== DO NOT INCLUDE ===
- KHÔNG vẽ luồng tạo / sửa / xóa product — đây là màn read-only (BR-01, anchor YT-1: CRM là
  passive-observer; thêm sản phẩm = thêm Product Module, không CRUD ở màn Catalog).
- KHÔNG vẽ chi tiết bên trong UC-CAT-02 (Chi tiết Sản phẩm) hay UC-CAT-03 (Danh sách Gói) — chỉ
  dừng ở End Event điều hướng sang các UC đó.
- KHÔNG có luồng ngoại lệ (EF) — màn read-only không phát sinh thao tác ghi dữ liệu.

=== END EVENTS LEGEND (bottom-right box, title "KẾT THÚC (END EVENTS)") ===
1. End 1 (Chi tiết Sản phẩm) — Step 2, click thân thẻ → catOpenProduct(prodId), điều hướng UC-CAT-02.
2. End 2 (Danh sách Gói đã lọc) — Step 2, click nút "Xem N gói của sản phẩm →" → catViewPackages(prodId),
   điều hướng UC-CAT-03 lọc sẵn theo product.
3. End 3 (Empty state) — AF-01, catalog chưa có product, không điều hướng.

Output as a Mermaid flowchart code block if image generation is not available, using subgraph for swimlanes.
```

---

## UC-CAT-02 — Chi tiết Sản phẩm

```
Create a BPMN 2.0 swimlane diagram for the "Product Detail" (Chi tiết Sản phẩm)
feature of OneCRM — a B2B CRM system for cybersecurity products (EDR/EPP/AV/CA).

=== SWIMLANES ===
Pool: "UC-CAT-02 — Chi tiết Sản phẩm"
Lane 1: Người dùng
Lane 2: System

=== ENTRY POINTS (note above Start Event) ===
(a) Click vào thẻ sản phẩm (product card) trên Kanban tại UC-CAT-01

=== MAIN FLOW ===
Step 1  [Người dùng]  Start Event → Task "Click thẻ sản phẩm trên Kanban (UC-CAT-01)"
Step 2  [System]      Gateway (Exclusive) "Sản phẩm tồn tại?"
  → Có (YES) path: continue to Step 3
  → Không (NO) path: Exception Flow EF-01 (→ End 3)
Step 3  [System]      Task "Render breadcrumb 'Sản phẩm' + hero (avatar, tên, badge trạng thái, meta, nút '← Quay lại') + tab bar 3 tab"
Step 4  [System]      Task "Render tab mặc định 'Thông tin': card Thông tin sản phẩm + card Thông tin kỹ thuật (read-only)"
Step 5  [Người dùng]  Task "Chọn thao tác trên trang (chuyển tab / Sửa mapping / Quay lại)"
Step 6  [System]      Gateway (Exclusive) "Loại thao tác?"  (fan-out nhiều nhánh)
  → Nhánh "Chuyển tab Tính năng": Alternate Flow AF-01 → LOOP quay lại Step 5 (ở lại trang)
  → Nhánh "Chuyển tab Mapping trạng thái": Alternate Flow AF-02 → LOOP quay lại Step 5 (ở lại trang)
  → Nhánh "✏️ Sửa mapping" (chỉ role Manager / License Admin): → End 2
  → Nhánh "← Quay lại / breadcrumb 'Sản phẩm'": → End 1

=== ALTERNATE FLOW AF-01: Chuyển tab Tính năng (ở lại trang) ===
Triggered at Step 6 (nhánh "Chuyển tab Tính năng") — user click tab "Tính năng ({N})"
AF-01a  [Người dùng]  Task "Click tab 'Tính năng ({N})' trên tab bar"
AF-01b  [System]      Task "Render danh sách tính năng nhóm theo component — mỗi component 1 bảng: Module | Tính năng | Loại"
→ LOOP: mũi tên quay lại Step 5 "Chọn thao tác" (KHÔNG End Event — ở lại trang)

=== ALTERNATE FLOW AF-02: Chuyển tab Mapping trạng thái (ở lại trang) ===
Triggered at Step 6 (nhánh "Chuyển tab Mapping trạng thái") — user click tab "Mapping trạng thái"
AF-02a  [Người dùng]  Task "Click tab 'Mapping trạng thái' trên tab bar"
AF-02b  [System]      Task "Render bảng mapping: Trạng thái gốc | Tên hiển thị | → Trạng thái Sub (CRM). Nút '✏️ Sửa mapping' chỉ hiện với Manager / License Admin"
→ LOOP: mũi tên quay lại Step 5 "Chọn thao tác" (KHÔNG End Event — ở lại trang)

=== EXCEPTION FLOW EF-01: Sản phẩm không tồn tại ===
Triggered from Step 2 (nhánh "Không" / NO path) — sản phẩm không tồn tại trong hệ thống
EF-01a  [System]  Task "Không mở được trang chi tiết (catProd(id) trả về rỗng)"
EF-01b  [System]  Task "Giữ nguyên màn hình Kanban sản phẩm (UC-CAT-01), không điều hướng"
→ End 3 (Ở lại Kanban — EF-01)

=== NODE INTEGRITY RULES (critical — prevents extra/garbled nodes) ===
- The diagram MUST contain EXACTLY one node per item listed here: Start Event, Step 1–6,
  AF-01a/AF-01b, AF-02a/AF-02b, EF-01a/EF-01b, and the 3 End sub-events (End 1, End 2, End 3).
  Do NOT synthesize, duplicate, or insert any additional task/gateway/node — no placeholder or
  "bridge" nodes between two listed nodes.
- Step 6 is a fan-out Exclusive Gateway with FOUR outgoing branches. Its two tab branches
  (AF-01, AF-02) each end with a LOOP arrow returning DIRECTLY to Step 5 "Chọn thao tác" — they
  DO NOT create any End Event and DO NOT create a new node; they re-enter the existing Step 5 node.
- Step 6's "✏️ Sửa mapping" branch connects DIRECTLY to End 2 (điều hướng). Step 6's
  "← Quay lại" branch connects DIRECTLY to End 1 (điều hướng). No intermediate nodes on these.
- Step 2's "Không" (NO) branch connects DIRECTLY and ONLY to the EF-01 sub-process container (→ End 3).
  Step 3 is reached ONLY via Step 2's "Có" (YES) branch (solid black arrow, main flow).
- Each numbered badge (Step 1–6) must attach to the exact single node it belongs to. Every gateway
  diamond must visibly show its step number badge, same as task boxes.
- Keep every box label concise (≤ ~12 words) with adequate spacing so all Vietnamese text renders fully.

=== LAYOUT RULES (critical — follow strictly to avoid crossing lines) ===
- ALL main-flow nodes (Start → Step 1 → Step 2 → Step 3 → Step 4 → Step 5 → Step 6) MUST sit on a
  single straight horizontal lane, left to right, top-aligned. Do NOT float any main-flow step above/below.
- AF-01 and AF-02 sub-diagrams MUST be positioned directly BELOW Step 6 (their trigger gateway),
  aligned to Step 6's x-position. EF-01 MUST be positioned directly BELOW Step 2 (its trigger gateway),
  aligned to Step 2's x-position.
- The tab-switch loop (AF-01 / AF-02 back to Step 5) MUST be drawn as a compact right-angle return arrow —
  short, clean, NOT cutting across or crossing any other line/box.
- Connector lines must NEVER cross unrelated boxes. Use short orthogonal (right-angle) drops straight
  down to each sub-diagram — no long diagonal lines.
- Each gateway's Có/Không (or branch) label sits immediately next to that gateway's own outgoing arrow only.

=== VISUAL STYLE ===
- Standard BPMN 2.0 notation. Start = filled circle; End = thick border circle; Task = rounded rectangle;
  Gateway = diamond with X (exclusive). Main flow = solid black arrows; Alternate (AF) = dashed blue;
  Exception (EF) = dashed red. Step numbers visible on each box. Language: Vietnamese for all labels.
- Add a legend (bottom-left) explaining arrow types + node types.

=== DO NOT INCLUDE ===
- KHÔNG vẽ thao tác sửa thông tin sản phẩm (tên, code, mô tả, trạng thái, integration type,
  module class, danh sách tính năng) — toàn bộ thông tin sản phẩm là read-only, do Admin đăng ký ở tầng hệ thống (BR-01).
- KHÔNG vẽ chi tiết bên trong editor "Sửa mapping" — đó là Use Case riêng, ngoài phạm vi; chỉ vẽ nhánh dẫn tới End 2.
- KHÔNG biến nhánh chuyển tab thành End Event — chuyển tab là loop ở lại trang (quay lại Step 5).

=== END EVENTS LEGEND (bottom-right box, title "KẾT THÚC (END EVENTS)") ===
1. End 1 — Về Kanban Sản phẩm (UC-CAT-01): Step 6 nhánh "← Quay lại" / breadcrumb "Sản phẩm".
2. End 2 — Mở editor Sửa mapping (UC riêng — ngoài phạm vi): Step 6 nhánh "✏️ Sửa mapping" (chỉ Manager / License Admin).
3. End 3 — Ở lại Kanban (EF-01): Step 2 sản phẩm không tồn tại, không điều hướng.

Output as a Mermaid flowchart code block if image generation is not available, using subgraph for swimlanes.
```

---

## UC-CAT-03 — Danh sách Gói sản phẩm

```
Create a BPMN 2.0 swimlane diagram for the "Package List" (Danh sách Gói sản phẩm)
feature of OneCRM — a B2B CRM system for cybersecurity products (EDR/EPP/AV/CA).

=== SWIMLANES ===
Pool: "UC-CAT-03 — Danh sách Gói sản phẩm"
Lane 1: Người dùng
Lane 2: System

=== ENTRY POINTS (note above Start Event) ===
(a) Click menu "🎁 Gói sản phẩm" trên sidebar → mở danh sách đầy đủ
(b) Click nút "Xem N gói" ở Chi tiết / Kanban Sản phẩm → mở danh sách đã lọc sẵn theo product_id

=== MAIN FLOW ===
Step 1  [System]      Start Event → Task "Tải danh sách gói, gộp phiên bản hiện hành, sort created_at giảm dần, phân trang 10 gói/trang"
Step 2  [Người dùng]  Task "(Tuỳ chọn) Nhập từ khoá và/hoặc chọn bộ lọc Sản phẩm, Trạng thái; hoặc tích 'Hiện mọi phiên bản'"
Step 3  [System]      Task "Lọc realtime (AND bộ lọc); nếu chọn Trạng thái/tích 'mọi phiên bản' → bỏ gộp version; cập nhật counter + danh sách"
Step 4  [System]      Gateway (Exclusive) "Có kết quả phù hợp?"
  → YES path: continue to Step 5
  → NO path:  Exception Flow EF-01
Step 5  [Người dùng]  Task "(Tuỳ chọn) Click header cột Sortable để sort"
Step 6  [System]      Task "Áp dụng sort (lần 1 tăng, lần 2 giảm); cập nhật icon ↑/↓; reset cột khác về ↕; về trang 1"
Step 7  [Người dùng]  Task "Chọn một hành động trên danh sách"
Step 8  [System]      Gateway (Exclusive) "Loại thao tác?" — fan các nhánh:
  → "Click row"                          → End 1 (Chi tiết gói)
  → "＋ Thêm gói"                          → End 2 (Tạo gói)
  → "✏️ Sửa (DRAFT/ACTIVE)"               → End 3 (Sửa gói)
  → "🗑️ Xóa (DRAFT + đủ quyền)"          → End 4 (Xóa gói nháp)
  → "✏️/🗑️ disabled (hiện tooltip)"      → End 5 (Ở lại màn)
  → "Search / lọc / tích 'mọi phiên bản'" → Alternate Flow AF-01
  → "Sort / chuyển trang"                 → Alternate Flow AF-02

=== ALTERNATE FLOW AF-01: Tìm kiếm / Lọc / Toggle "Hiện mọi phiên bản" ===
Triggered at Step 2 / Step 8 — vòng lặp, ở lại màn (loop back re-render)
AF-01a  [Người dùng]  Task "Nhập từ khoá, HOẶC chọn dropdown Sản phẩm/Trạng thái, HOẶC tích/bỏ tích 'Hiện mọi phiên bản'"
AF-01b  [System]      Task "Re-render danh sách (AND bộ lọc); nếu chọn Trạng thái/tích 'mọi phiên bản' → hiện mọi version; về trang 1; cập nhật counter"
  → Loop back to Step 3 (re-render) → nếu có kết quả: End 5 (Ở lại màn); nếu không còn kết quả: Exception Flow EF-01

=== ALTERNATE FLOW AF-02: Sort / Phân trang ===
Triggered at Step 5 / Step 8 — vòng lặp, ở lại màn (loop back re-render)
AF-02a  [Người dùng]  Task "Click header cột Sortable, HOẶC nhấn nút trang ‹ / số trang / ›"
AF-02b  [System]      Task "Sort: toggle asc/desc, cập nhật icon, về trang 1. Phân trang: hiện 10 gói của trang, cập nhật counter + highlight nút trang"
  → Loop back to Step 6 (re-render) → End 5 (Ở lại màn)

=== EXCEPTION FLOW EF-01: Không có kết quả phù hợp ===
Triggered from Step 4 gateway (NO path) — tìm kiếm / bộ lọc không khớp gói nào
EF-01a  [System]      Task "Ẩn các hàng dữ liệu; xóa nội dung thanh phân trang (pager ẩn)"
EF-01b  [System]      Task "Hiển thị empty state: icon 🎁 + 'Chưa có gói nào khớp bộ lọc' + gợi ý + nút '＋ Tạo gói'"
EF-01c  [Người dùng]  Task "(Tuỳ chọn) Nhấn '＋ Tạo gói' → mở form Tạo gói (End 2, UC riêng)"
→ End 6 (Empty state)

=== NODE INTEGRITY RULES (critical — prevents extra/garbled nodes) ===
- The diagram MUST contain EXACTLY one node per item listed: Start Event, Step 1–8,
  AF-01a/AF-01b, AF-02a/AF-02b, EF-01a/EF-01b/EF-01c, and the 6 End sub-events (End 1–End 6).
  Do NOT synthesize, duplicate, or insert any additional task/gateway/node — no placeholder
  or "bridge" nodes between two listed nodes.
- Step 4 gateway "Có kết quả phù hợp?": "Có" (YES) branch → Step 5 (main flow, solid black);
  "Không" (NO) branch connects DIRECTLY and ONLY to the EF-01 sub-process container.
- Step 8 gateway "Loại thao tác?" fans out to EXACTLY 7 outgoing branches, each labeled and each
  landing on its correct target: 5 branches → End 1..End 5 directly; 1 branch → AF-01; 1 branch → AF-02.
  No branch may merge, cross, or land on a wrong End event; no extra branch.
- AF-01 loop returns to Step 3 (re-render); AF-02 loop returns to Step 6 (re-render). The filter/sort
  loops re-enter the exact re-render step — never spawn a new node. From AF-01 the empty case flows to EF-01.
- Each numbered badge attaches to the exact single node it belongs to. Every gateway diamond must
  visibly show its step-number badge (Step 4, Step 8), same as task boxes.
- Status badges shown as text only inside labels (Draft / Active / Retired) — do NOT draw them as nodes.
- Keep every box label concise (≤ ~12 words) with adequate spacing so all Vietnamese text renders fully.

=== LAYOUT RULES (critical — follow strictly to avoid crossing lines) ===
- ALL main-flow nodes (Start → Step 1 → Step 2 → ... → Step 8 → End events) MUST sit on a single
  straight horizontal lane, left to right, top-aligned. Do NOT float any main-flow step above/below.
- AF-01 sub-diagram sits directly BELOW Step 2 / Step 3 (its trigger + re-render return), aligned to
  that x-position. AF-02 sits directly BELOW Step 5 / Step 6. EF-01 sits directly BELOW Step 4 gateway.
- The 7 End events fan out to the RIGHT of Step 8 gateway, stacked vertically, each reached by its own
  short orthogonal branch — no long diagonal lines, no crossing unrelated boxes.
- Loop-back connectors (AF-01→Step 3, AF-02→Step 6) use short orthogonal right-angle paths; never cut
  through other boxes or labels.
- Each gateway's Có/Không (and Step 8 action) branch label sits immediately next to that gateway's own
  outgoing arrow only.

=== VISUAL STYLE ===
- Standard BPMN 2.0 notation. Start = filled circle; End = thick border circle; Task = rounded rectangle;
  Gateway = diamond with X (exclusive). Main flow = solid black arrows; Alternate (AF) = dashed blue;
  Exception (EF) = dashed red. Step-number badges visible on each box (numbered circles). Language:
  Vietnamese for all labels.
- Add a legend (bottom-left) explaining arrow types + node types.

=== DO NOT INCLUDE ===
- KHÔNG vẽ hành vi bên trong form Tạo gói / Sửa gói (chỉ End điều hướng — UC riêng).
- KHÔNG vẽ modal xác nhận Xóa gói nháp (chỉ End 4 điều hướng — UC riêng).
- KHÔNG vẽ hành động Publish (Xuất bản) / Ngừng bán — chúng KHÔNG có trên màn danh sách (nằm ở hero
  trang Chi tiết gói).
- KHÔNG vẽ nội dung Chi tiết gói / tab Version history (chỉ End 1 điều hướng — UC riêng).
- KHÔNG vẽ thay đổi dữ liệu — đây là màn chỉ đọc & điều hướng.

=== END EVENTS LEGEND (bottom-right box, title "KẾT THÚC (END EVENTS)") ===
1. End 1 (Chi tiết gói) — Step 8: Click row → mở UC Chi tiết gói (có tab Version history)
2. End 2 (Tạo gói) — Step 8 "＋ Thêm gói" hoặc EF-01 "＋ Tạo gói" → mở form Tạo gói (UC riêng)
3. End 3 (Sửa gói) — Step 8: ✏️ khi gói DRAFT/ACTIVE → mở form Sửa gói (UC riêng)
4. End 4 (Xóa gói nháp) — Step 8: 🗑️ khi gói DRAFT + đủ quyền → mở modal Xóa (UC riêng)
5. End 5 (Ở lại màn) — nút ✏️/🗑️ disabled (tooltip) / sau AF-01 (search, lọc, toggle) / sau AF-02 (sort, phân trang)
6. End 6 (Empty state) — EF-01: không có kết quả phù hợp với bộ lọc

Output as a Mermaid flowchart code block if image generation is not available, using subgraph for swimlanes.
```

---

## UC-CAT-04 — Chi tiết Gói sản phẩm

```
Create a BPMN 2.0 swimlane diagram for the "Package Detail" (Chi tiết Gói sản phẩm)
feature of OneCRM — a B2B CRM system for cybersecurity products (EDR/EPP/AV/CA).
This is a READ-ONLY navigation hub with 4 tabs; every write action only navigates
to another use case (no form / modal behaviour is drawn here).

=== SWIMLANES ===
Pool: "UC-CAT-04 — Chi tiết Gói sản phẩm"
Lane 1: Người dùng
Lane 2: System

=== ENTRY POINTS (note above Start Event) ===
(a) Click một hàng ở Danh sách gói (UC-CAT-03)
(b) Hệ thống tự điều hướng sau khi Tạo (UC-CAT-05) / Sửa (UC-CAT-06) / Rollback (UC-CAT-07)

=== MAIN FLOW ===
Step 1  [Người dùng]  Task "Vào trang chi tiết gói (click hàng ở Danh sách hoặc auto-redirect sau Tạo/Sửa/Rollback)"
Step 2  [System]      Gateway (Exclusive) "Gói tồn tại?"
  → [Có] path: continue to Step 3
  → [Không] path: Exception Flow EF-01 (→ End 8)
Step 3  [System]      Task "Render breadcrumb 'Gói sản phẩm' + hero (avatar, tên gói, badge v{n}, badge trạng thái, meta, nút hành động theo trạng thái & quyền) + tab bar 4 tab"
Step 4  [System]      Task "Render tab mặc định 'Thông tin chung' — card 'Thông tin gói' chỉ đọc"
Step 5  [Người dùng]  Task "Chọn một thao tác trên trang (chuyển tab / Mở phiên bản khác / nút hành động / ← Quay lại)"
Step 6  [System]      Gateway (Exclusive) "Loại thao tác?" — fan nhiều nhánh:
  → [Chuyển tab: Tính năng / Version history / Subscriptions]  Alternate Flow AF-01 / AF-02 / AF-03 (ở lại trang, quay lại Step 5)
  → [✏️ Sửa]                    → End 1 (UC-CAT-06)
  → [🚀/⏹/🗑️/↩️ Thao tác vòng đời] → modal Vòng đời (UC-CAT-07) → End 2 (gộp Xuất bản/Ngừng bán/Xóa/Rollback)
  → [Mở phiên bản khác (Version history)] → End 3 (UC-CAT-04, gói khác)
  → [← Quay lại]                → End 4 (UC-CAT-03)

=== ALTERNATE FLOW AF-01 / AF-02 / AF-03: Chuyển tab (ở lại trang) ===
Triggered at Step 6 (nhánh "Chuyển tab") — Người dùng click một tab khác
AF-0x-a  [Người dùng]  Task "Click tab 'Tính năng của gói' / 'Version history' / 'Subscriptions' (pkgSwitchTab)"
AF-0x-b  [System]      Task "Render nội dung tab tương ứng chỉ đọc (grid tính năng / danh sách phiên bản cùng họ / bảng subscription)"
→ Loop back to Step 5 (ở lại trang — KHÔNG tạo End Event)

=== EXCEPTION FLOW EF-01: Gói không tồn tại ===
Triggered from Step 2 (nhánh "Không") — gói không tồn tại trong hệ thống
EF-01a  [System]  Task "Không mở trang chi tiết; điều hướng về Danh sách gói (UC-CAT-03)"
→ End 8 (Về Danh sách gói — EF-01)

=== NODE INTEGRITY RULES (critical — prevents extra/garbled nodes) ===
- The diagram MUST contain EXACTLY one node per item listed: Start Event, Step 1–6,
  AF-0x-a/AF-0x-b (one combined branch for tab-switch), EF-01a, the modal Vòng đời node,
  and End 1, End 2, End 3, End 4, End 8. Do NOT synthesize, duplicate, or insert any
  bridge/placeholder node between two listed nodes.
- Step 2's "Không" branch connects DIRECTLY and ONLY to EF-01a. Step 3 is reached ONLY
  via Step 2's "Có" branch (solid black arrow, main flow).
- The tab-switch branch (AF-01/AF-02/AF-03) MUST loop BACK to the exact "Step 5 —
  Chọn một thao tác" node — it stays on the page and creates NO End Event.
- Each hero action branch goes to its correct End: ✏️ Sửa → End 1; the 4 lifecycle
  buttons (🚀 Xuất bản / ⏹ Ngừng bán / 🗑️ Xóa / ↩️ Rollback) are MERGED into ONE branch
  "→ modal Vòng đời (UC-CAT-07) → End 2"; Mở phiên bản khác → End 3; ← Quay lại → End 4.
- Do NOT draw a separate node per hero button — collapse the 4 lifecycle buttons into a
  single labelled branch. Emoji badges (🚀 ⏹ 🗑️ ↩️ ✏️ ← ) shown on branch labels only.
- Every gateway diamond must visibly show its Step number badge, same as task boxes.
- Keep every box label concise (≤ ~12 words) so all Vietnamese text renders fully.

=== LAYOUT RULES (critical — follow strictly to avoid crossing lines) ===
- ALL main-flow nodes (Start → Step 1 → Step 2 → Step 3 → Step 4 → Step 5 → Step 6)
  MUST sit on a single straight horizontal lane, left to right, top-aligned.
- From gateway Step 6, the action End events (End 1, End 2 via modal Vòng đời, End 3,
  End 4) fan DOWNWARD / outward compactly to the right — short orthogonal drops, no long
  diagonals.
- The tab-switch branch (AF) is placed directly BELOW Step 6 and returns with a clean
  right-angle line back to Step 5 (loop) — do not cross other boxes.
- EF-01 sub-diagram is placed directly BELOW Step 2, aligned to its x-position; its End 8
  drops straight down.
- Connector lines must NEVER cross unrelated boxes. Each gateway's branch label sits
  immediately next to that branch's own outgoing arrow only.

=== VISUAL STYLE ===
- Standard BPMN 2.0 notation. Start = filled circle; End = thick border circle; Task =
  rounded rectangle; Gateway = diamond with X (exclusive). Main flow = solid black arrows;
  Alternate/tab-switch (AF) = dashed blue; Exception (EF) = dashed red. Step number badge
  visible on each box and gateway. Language: Vietnamese for all node labels.
- Add a legend (bottom-left) explaining arrow types + node types.

=== DO NOT INCLUDE ===
- KHÔNG vẽ hành vi của form Sửa gói (UC-CAT-06) — chỉ End điều hướng.
- KHÔNG vẽ nội dung các modal vòng đời Xuất bản/Ngừng bán/Xóa/Rollback (UC-CAT-07) —
  chỉ 1 node "modal Vòng đời" rồi End điều hướng.
- KHÔNG vẽ thao tác chỉnh sửa trực tiếp trên trang — toàn bộ phần thông tin là chỉ đọc.
- KHÔNG tạo node riêng cho từng nút hành động ở hero.

=== END EVENTS LEGEND (bottom-right box, title "KẾT THÚC (END EVENTS)") ===
1. End 1 — Điều hướng UC-CAT-06 (Sửa gói): Step 6 → ✏️ Sửa
2. End 2 — Điều hướng UC-CAT-07 (Vòng đời): Step 6 → 🚀 Xuất bản / ⏹ Ngừng bán / 🗑️ Xóa / ↩️ Rollback (qua modal Vòng đời)
3. End 3 — Mở chi tiết phiên bản khác (UC-CAT-04, gói khác): Step 6 → "Mở" ở Version history
4. End 4 — Ở lại trang / về Danh sách gói (UC-CAT-03): Step 6 → ← Quay lại (hoặc nút disabled → tooltip → ở lại)
5. End 8 — Về Danh sách gói (EF-01): Step 2 → gói không tồn tại

Output as a Mermaid flowchart code block if image generation is not available, using subgraph for swimlanes.
```

---

## UC-CAT-05 — Tạo Gói sản phẩm

```
Create a BPMN 2.0 swimlane diagram for the "Create Package" (Tạo Gói sản phẩm)
feature of OneCRM — a B2B CRM system for cybersecurity products (EDR/EPP/AV/CA).
The modal is a 2-step wizard (① Thông tin chung — ② Tính năng của gói).

=== SWIMLANES ===
Pool: "UC-CAT-05 — Tạo Gói sản phẩm"
Lane 1: Sales/Manager
Lane 2: System

=== ENTRY POINTS (note above Start Event) ===
(a) Nút "＋ Thêm gói" ở Danh sách gói (UC-CAT-03)
(b) Nút "＋ Tạo gói" ở empty state của Danh sách gói (UC-CAT-03)

=== MAIN FLOW ===
Step 1  [System]        Start Event → Task "Mở modal wizard ở Bước 1 — Thông tin chung; form rỗng; dropdown Sản phẩm chỉ ACTIVE; Thời hạn mặc định 12"
Step 2  [Sales/Manager] Task "Nhập Bước 1: chọn Sản phẩm, Mã gói (nhập tay), Tên gói, Thời hạn; (tùy chọn) Seat / Số thiết bị"
Step 3  [Sales/Manager] Task "Click 'Tiếp theo: Tính năng →'"
Step 4  [System]        Gateway (Exclusive) "Bước 1 hợp lệ?"
  → YES path: continue to Step 5
  → NO path:  Exception Flow EF-01 (hiện lỗi inline, LOOP quay Bước 1 — không End)
Step 5  [Sales/Manager] Task "Bước 2 — Tính năng: tích/bỏ tích tính năng (lưới 3 cột). Tính năng 'Mặc định' luôn ✓ và khóa"
Step 6  [Sales/Manager] Task "Click '💾 Tạo'"
Step 7  [System]        Task "Tạo gói {status: DRAFT, version: 1, features:[...], created_at, created_by}; đóng modal; toast; điều hướng Chi tiết gói (UC-CAT-04)"
               → End (Success)

=== ALTERNATE FLOW AF-01: Hủy tạo gói ===
Triggered at any of Step 2 / Step 3 / Step 5 / Step 6 — Sales/Manager không tiếp tục
AF-01a  [Sales/Manager]  Task "Click 'Hủy' hoặc icon '✕' ở modal-header"
AF-01b  [System]         Task "Đóng modal, không lưu; không tạo gói; dữ liệu không thay đổi"
→ End (Cancelled)

=== ALTERNATE FLOW AF-02: Đổi sản phẩm ở Bước 1 ===
Triggered at Step 2 — Sales/Manager chọn lại một sản phẩm khác ở dropdown
AF-02a  [Sales/Manager]  Task "Chọn sản phẩm khác ở dropdown Sản phẩm"
AF-02b  [System]         Task "Cập nhật trường số lượng (Seat ↔ Số thiết bị) theo has_instances; reset lưới tính năng Bước 2"
→ Quay lại Step 2 (tiếp tục nhập, KHÔNG phải End)

=== EXCEPTION FLOW EF-01: Validate Bước 1 không hợp lệ (LOOP — không phải End) ===
Triggered from Step 4 gateway "Bước 1 hợp lệ?" NO path — Bước 1 vi phạm ràng buộc.
System giữ modal ở Bước 1, hiện lỗi inline, KHÔNG đóng modal, KHÔNG sang Bước 2.
Các trường hợp lỗi inline:
  EF-01a  Chưa chọn Sản phẩm → "Vui lòng chọn sản phẩm"
  EF-01b  Chưa nhập Mã gói → "Vui lòng nhập mã gói"
  EF-01c  Mã gói trùng (realtime, cùng sản phẩm, bản chưa RETIRED) → "Mã gói đã tồn tại trong sản phẩm này (gói đang bán). Vui lòng chọn mã khác."
  EF-01d  Chưa nhập Tên gói → "Vui lòng nhập tên gói"
  EF-01e  Thời hạn không phải số nguyên > 0 → "Thời hạn phải là số nguyên > 0"
EF-01x  [System]  Task "Hiện lỗi inline tương ứng; giữ ở Bước 1"
→ LOOP: mũi tên quay về Step 2 (người dùng sửa rồi click 'Tiếp theo' lại → Step 3). Đây KHÔNG phải End Event.

=== NODE INTEGRITY RULES (critical — prevents extra/garbled nodes) ===
- The diagram MUST contain EXACTLY one node per item explicitly listed: Start Event,
  Step 1–7, End (Success), AF-01a/AF-01b, AF-02a/AF-02b, EF-01x (the validate-loop task),
  and the 2 End sub-events. Do NOT synthesize, duplicate, or insert any additional
  task/gateway/node — no placeholder or "bridge" nodes between two listed nodes.
- Step 4 is the ONLY gateway. Its "Không" (NO) branch connects to EF-01x (hiện lỗi inline),
  and EF-01x LOOPS BACK to Step 2 with a return arrow — it does NOT reach any End event.
  Its "Có" (YES) branch is the ONLY way to reach Step 5 (solid black arrow, main flow).
- Step 7 is a plain Task with a single outgoing arrow straight to End (Success) — NO gateway,
  NO YES/NO branch after it.
- AF-02 loops back to Step 2 (continue), it does NOT end the flow.
- Each numbered badge must attach to the exact single node it belongs to. The gateway diamond
  must visibly show its "Step 4" badge, same as task boxes.
- Keep every box label concise (≤ ~12 words) with adequate spacing so all Vietnamese text renders fully.

=== LAYOUT RULES (critical — follow strictly to avoid crossing lines) ===
- ALL main-flow nodes (Start → Step 1 → ... → Step 7 → End) MUST sit on a single straight
  horizontal lane, left to right, top-aligned. Do NOT float any main-flow step above/below.
- The EF-01 validate loop: draw EF-01x directly BELOW Step 4, with a short return arrow back
  UP to Step 2 — keep the loop compact and orthogonal, no long diagonal lines.
- AF-01 (Hủy) sub-diagram sits directly BELOW its trigger steps; AF-02 (đổi sản phẩm) sits
  directly BELOW Step 2. Align each sub-diagram to its trigger's x-position.
- Connector lines must NEVER cross unrelated boxes. Use short orthogonal (right-angle) drops.
- Each gateway's Có/Không branch label sits immediately next to that gateway's own outgoing arrow only.

=== VISUAL STYLE ===
- Standard BPMN 2.0 notation. Start = filled circle; End = thick border circle; Task = rounded
  rectangle; Gateway = diamond with X (exclusive). Main flow = solid black arrows; Alternate (AF)
  = dashed blue; Exception/loop (EF) = dashed red. Step number badges visible on each box and the
  gateway. Language: Vietnamese for all node labels.
- Add a legend (bottom-left) explaining arrow types + node types.

=== DO NOT INCLUDE ===
- Gói mới LUÔN ở trạng thái DRAFT, version 1 — KHÔNG vẽ luồng Xuất bản / Active / mở bán ở đây
  (đó là UC-CAT-07).
- KHÔNG hard delete, KHÔNG luồng khôi phục.
- Mã gói do người dùng NHẬP TAY — KHÔNG tự sinh mã.
- KHÔNG vẽ EF-01 như một End event — nó là vòng lặp sửa lỗi quay về Bước 1.

=== END EVENTS LEGEND (bottom-right box, title "KẾT THÚC (END EVENTS)") ===
1. End (Success) — Bước 7: gói tạo với status = DRAFT, version = 1; đóng modal; toast; điều hướng UC-CAT-04.
2. End (Cancelled) — AF-01: người dùng click 'Hủy' / '✕' tại bất kỳ bước nào (2–6); không tạo gói; dữ liệu không đổi.

Output as a Mermaid flowchart code block if image generation is not available, using subgraph for swimlanes.
```

---

## UC-CAT-06 — Sửa Gói sản phẩm

```
Create a BPMN 2.0 swimlane diagram for the "Edit Package" (Sửa Gói sản phẩm)
feature of OneCRM — a B2B CRM system for cybersecurity products (EDR/EPP/AV/CA).
This feature uses a versioning "clone-on-edit" rule: a package that already has an
active subscription is immutable — saving changes creates a NEW DRAFT version (v+1)
instead of overwriting the version currently on sale (existing customers are grandfathered).

=== SWIMLANES ===
Pool: "UC-CAT-06 — Sửa Gói sản phẩm"
Lane 1: Sales/Manager
Lane 2: System

=== ENTRY POINTS (note above Start Event) ===
(a) Nút "✏️ Sửa" trên hàng gói DRAFT/ACTIVE trong Danh sách gói (UC-CAT-03)
(b) Nút "✏️ Sửa" ở hero trang Chi tiết gói (UC-CAT-04)

=== MAIN FLOW ===
Step 1  [Sales/Manager] Start Event → Task "Click '✏️ Sửa' ở Danh sách hoặc hero Chi tiết gói"
Step 2  [System]        Gateway (Exclusive) "Gói RETIRED?"
  → YES path: Exception Flow EF-01 (chặn mở form + toast)
  → NO path:  continue to Step 3
Step 3  [System]        Task "Mở modal pre-fill wizard 2 bước; Sản phẩm disabled, Mã gói readonly; banner versioning nếu gói ACTIVE"
Step 4  [Sales/Manager] Task "Sửa Tên gói, Thời hạn, Seat/Số thiết bị, Tính năng của gói"
Step 5  [Sales/Manager] Task "Nhấn '💾 Lưu' — 'Hủy' / ✕ → Alternate Flow AF-01"
Step 6  [System]        Gateway (Exclusive) "Dữ liệu hợp lệ?"
  → YES path: continue to Step 7
  → NO path:  Exception Flow EF-02 (validate lỗi, loop về form)
Step 7  [System]        Gateway (Exclusive) "Gói đã có subscription? (ACTIVE và pkgSubCount > 0)"
  → YES path: Task "Tạo phiên bản mới DRAFT v+1 sao chép cấu hình; giữ bản cũ ACTIVE; điều hướng Chi tiết phiên bản mới; toast 'Đã tạo phiên bản mới (nháp)'"
               → End 2 (Success — Tạo phiên bản mới nháp)
  → NO path:  Task "Cập nhật tại chỗ (Object.assign patch) lên gói hiện tại; đóng modal; cập nhật Chi tiết/Danh sách; toast 'Đã cập nhật gói'"
               → End 1 (Success — Cập nhật tại chỗ)

=== ALTERNATE FLOW AF-01: Cancel Edit ===
Triggered at Step 5 — Sales/Manager nhấn "Hủy" hoặc ✕
AF-01a  [Sales/Manager]  Task "Nhấn 'Hủy' hoặc icon '✕' ở modal"
AF-01b  [System]         Task "Đóng modal. KHÔNG lưu thay đổi. Gói giữ nguyên cấu hình và trạng thái"
→ End 3 (Cancelled)

=== EXCEPTION FLOW EF-01: Gói RETIRED không thể sửa ===
Triggered from Step 2 gateway (YES path) — gói có status = RETIRED
EF-01a  [System]  Task "Không mở modal. Hiển thị toast lỗi 'Không thể sửa' / 'Gói đã ngừng bán không thể chỉnh sửa.'"
EF-01b  [System]  Task "Không thay đổi dữ liệu; trạng thái gói giữ nguyên RETIRED"
→ End 4 (Rejected — RETIRED)

=== EXCEPTION FLOW EF-02: Validate thất bại ===
Triggered from Step 6 gateway (NO path) — Tên gói trống hoặc Thời hạn không phải số nguyên > 0
EF-02a  [System]  Task "Về bước 1 wizard; lỗi inline: Tên gói 'Vui lòng nhập tên gói' / Thời hạn 'Thời hạn phải là số nguyên > 0'"
EF-02b  [System]  Task "Giữ nguyên form với dữ liệu đã nhập; không lưu; modal không đóng"
→ Loop back to Step 5 (sửa lỗi rồi Lưu lại — KHÔNG phải End Event)

=== NODE INTEGRITY RULES (critical — prevents extra/garbled nodes) ===
- The diagram MUST contain EXACTLY one node per item explicitly listed: Start Event, Step 1,
  Gateway "Gói RETIRED?" (Step 2), Step 3, Step 4, Step 5, Gateway "Dữ liệu hợp lệ?" (Step 6),
  Gateway "Gói đã có subscription?" (Step 7), the 2 outcome Tasks of Step 7 (create-new-version
  Task and update-in-place Task), End 1, End 2, AF-01a/AF-01b, EF-01a/EF-01b, EF-02a/EF-02b,
  and the End sub-events End 1/End 2/End 3/End 4. Do NOT synthesize, duplicate, or insert any
  additional task/gateway/node — no placeholder or "bridge" nodes.
- Gateway Step 7 "Gói đã có subscription?" is the clone-on-edit decision and has TWO distinct
  branches that MUST fan out to TWO DIFFERENT End events — do NOT merge them:
    • YES → create-new-version Task → End 2 (Success — Tạo phiên bản mới nháp)
    • NO  → update-in-place Task → End 1 (Success — Cập nhật tại chỗ)
- Gateway Step 6 "Dữ liệu hợp lệ?" NO path connects ONLY to EF-02; EF-02 loops back to Step 5
  (NOT to any End event). Step 7 is reached ONLY via Step 6 YES path (solid black main-flow arrow).
- Gateway Step 2 "Gói RETIRED?" YES path connects DIRECTLY and ONLY to EF-01; Step 3 is reached
  ONLY via Step 2 NO path.
- Each numbered badge must attach to the exact single node it belongs to. Every gateway diamond
  must visibly show its step number badge, same as task boxes.
- Keep every box label concise (≤ ~12 words) with adequate spacing so all Vietnamese text renders fully.

=== LAYOUT RULES (critical — follow strictly to avoid crossing lines) ===
- ALL main-flow nodes (Start → Step 1 → Gateway 2 → Step 3 → Step 4 → Step 5 → Gateway 6 →
  Gateway 7) MUST sit on a single straight horizontal lane, left to right, top-aligned. Do NOT
  float any main-flow step above/below that lane.
- EF-01 (RETIRED) sub-diagram sits directly BELOW Gateway "Gói RETIRED?" (Step 2), aligned to its
  x-position. EF-02 (validate) sub-diagram sits directly BELOW Gateway "Dữ liệu hợp lệ?" (Step 6).
  AF-01 (Cancel) sits directly BELOW Step 5.
- The clone-on-edit Gateway (Step 7) fans out to its 2 outcome Tasks and 2 End events compactly on
  the right side: YES branch → create-new-version Task → End 2; NO branch → update-in-place Task →
  End 1. Keep both branches short and tidy — no long diagonal lines, no crossing.
- Connector lines must NEVER cross unrelated boxes. Use short orthogonal (right-angle) drops for
  each sub-diagram. Each gateway's Có/Không branch label sits immediately next to that gateway's
  own outgoing arrow only.

=== VISUAL STYLE ===
- Standard BPMN 2.0 notation. Start = filled circle; End = thick border circle; Task = rounded
  rectangle; Gateway = diamond with X (exclusive). Main flow = solid black arrows; Alternate (AF)
  = dashed blue; Exception (EF) = dashed red. Step number badges visible on each box and gateway.
  Language: Vietnamese for all node labels.
- Add a legend (bottom-left) explaining arrow types + node types.

=== DO NOT INCLUDE ===
- KHÔNG vẽ sửa trường Sản phẩm (product_id) hay Mã gói (code) — hai trường này KHÔNG thể thay đổi
  sau khi tạo (disabled / readonly).
- KHÔNG vẽ luồng Xuất bản phiên bản mới — đó là UC-CAT-07, ngoài scope. Phiên bản mới tạo ở đây
  chỉ dừng ở trạng thái DRAFT (nháp), chưa có hiệu lực áp dụng.
- KHÔNG gộp 2 nhánh của Gateway clone-on-edit thành 1 End chung.

=== END EVENTS LEGEND (bottom-right box, title "KẾT THÚC (END EVENTS)") ===
1. End 1 (Success — Cập nhật tại chỗ) — Gói DRAFT, HOẶC ACTIVE & pkgSubCount = 0; ghi đè trực tiếp; toast "Đã cập nhật gói".
2. End 2 (Success — Tạo phiên bản mới nháp) — Gói ACTIVE & pkgSubCount > 0; tạo bản DRAFT v+1 sao chép cấu hình; bản cũ giữ ACTIVE; toast "Đã tạo phiên bản mới (nháp)".
3. End 3 (Cancelled) — AF-01: nhấn "Hủy" / ✕; modal đóng, không lưu; gói giữ nguyên.
4. End 4 (Rejected — RETIRED) — EF-01: gói RETIRED tại pre-check (Step 2); modal không mở; toast "Không thể sửa".

Output as a Mermaid flowchart code block if image generation is not available, using subgraph for swimlanes.
```

---

## UC-CAT-07 — Quản lý vòng đời Gói sản phẩm

```
Create a BPMN 2.0 swimlane diagram for the "Package Lifecycle" (Quản lý vòng đời Gói sản phẩm)
feature of OneCRM — a B2B CRM system for cybersecurity products (EDR/EPP/AV/CA).
This UC gộp 4 thao tác chuyển trạng thái vòng đời của một Gói bán hàng (package) vào MỘT khung guard chung
(để sơ đồ gọn, dễ đọc): Xuất bản (DRAFT→ACTIVE) / Ngừng bán (ACTIVE→RETIRED) / Xóa nháp (hard delete gói DRAFT)
/ Rollback (RETIRED → clone-forward tạo bản nháp v+1). Mọi thao tác đi qua modal xác nhận + guard quyền + guard
trạng thái, khác nhau chỉ ở modal và bước Thực thi.

=== SWIMLANES ===
Pool: "UC-CAT-07 — Quản lý vòng đời Gói"
Lane 1: Sales/Manager
Lane 2: System

=== ENTRY POINTS (note above Start Event) ===
Bốn nút vòng đời ở hero trang Chi tiết gói (UC-CAT-04), hiển thị theo trạng thái gói:
(a) "🚀 Xuất bản"  — hiện khi gói DRAFT
(b) "⏹ Ngừng bán"  — hiện khi gói ACTIVE
(c) "🗑️ Xóa"       — active khi gói DRAFT (gói ACTIVE/RETIRED → disabled + tooltip)
(d) "↩️ Rollback"   — hiện khi gói RETIRED

=== MAIN FLOW (khung guard GỘP CHUNG cho cả 4 thao tác) ===
Step 1  [System]        Start Event → Task "Hiển thị hero Chi tiết gói với các nút vòng đời theo trạng thái gói"
Step 2  [Sales/Manager] Task "Click một nút vòng đời: 🚀 Xuất bản / ⏹ Ngừng bán / 🗑️ Xóa / ↩️ Rollback"
Step 3  [System]        Gateway (Exclusive) "Thao tác nào?"
  → nhánh "Xuất bản [DRAFT]"   → hội tụ vào Step 4
  → nhánh "Ngừng bán [ACTIVE]" → hội tụ vào Step 4
  → nhánh "Xóa nháp [DRAFT]"   → hội tụ vào Step 4
  → nhánh "Rollback [RETIRED]" → hội tụ vào Step 4
  (Cả 4 nhánh hội tụ vào MỘT Task Step 4 — không vẽ 4 luồng song song đầy đủ)
Step 4  [System]        Task "Mở modal xác nhận tương ứng (pkgConfirmModal)"
Step 5  [Sales/Manager] Gateway (Exclusive) "Xác nhận thao tác?"
  → YES path: continue to Step 6
  → NO path (Hủy / ✕ / click ngoài modal): Alternate Flow AF-01
Step 6  [System]        Gateway (Exclusive) "Đủ quyền? (guard quyền — BR-07)"
  → YES path: continue to Step 7
  → NO path:  Exception Flow EF-01
Step 7  [System]        Gateway (Exclusive) "Trạng thái hợp lệ? (guard trạng thái — BR-07)"
  → YES path: continue to Step 8
  → NO path:  Exception Flow EF-02
Step 8  [System]        Task "Thực thi thao tác + cập nhật trạng thái"
                        (faded note cạnh Task, đặc thù mỗi thao tác:
                         • Xuất bản: gói → ACTIVE, retire bản ACTIVE cũ cùng họ
                         • Ngừng bán: gói → RETIRED, giữ nguyên subscription hiện tại (grandfather)
                         • Xóa nháp: hard delete gói khỏi catalog
                         • Rollback: clone-forward tạo bản nháp v{max+1}, bản cũ giữ RETIRED)
Step 9  [System]        Task "Đóng modal → toast thành công → cập nhật hero / điều hướng theo thao tác"
               → End (Success — theo thao tác)

=== ALTERNATE FLOW AF-01: Hủy modal (dùng chung 4 thao tác) ===
Triggered at Step 5 (NO path) — người dùng không xác nhận
AF-01a  [Sales/Manager]  Task "Nhấn 'Hủy' / icon '✕' / click vùng ngoài modal (overlay)"
AF-01b  [System]         Task "Đóng modal. KHÔNG thay đổi dữ liệu. Gói giữ nguyên trạng thái"
→ End (Cancelled)

=== EXCEPTION FLOW EF-01: Thiếu quyền ===
Triggered from Step 6 (NO path) — guard quyền chặn (không phải người tạo gói / Manager theo thao tác)
EF-01a  [System]  Task "Đóng modal. Hiển thị toast từ chối quyền theo thao tác"
EF-01b  [System]  Task "KHÔNG thay đổi dữ liệu; trạng thái gói giữ nguyên"
→ End (Rejected — thiếu quyền)

=== EXCEPTION FLOW EF-02: Trạng thái không hợp lệ / race condition ===
Triggered from Step 7 (NO path) — trạng thái gói ≠ trạng thái hợp lệ cho thao tác (bị người khác đổi)
EF-02a  [System]  Task "Đóng modal. Hiển thị toast lỗi trạng thái theo thao tác"
EF-02b  [System]  Task "KHÔNG thay đổi dữ liệu; trạng thái gói giữ nguyên"
→ End (Rejected — trạng thái sai)

=== NODE INTEGRITY RULES (critical — prevents extra/garbled nodes) ===
- The diagram MUST contain EXACTLY one node per item explicitly listed: Start Event, Step 1–9,
  End (Success), AF-01a/AF-01b, EF-01a/EF-01b, EF-02a/EF-02b, and the 4 End sub-events.
  Do NOT synthesize, duplicate, or insert any additional task/gateway/node — no placeholder or
  "bridge" nodes between two listed nodes.
- Gateway Step 3 "Thao tác nào?" có ĐÚNG 4 nhánh (Xuất bản[DRAFT] / Ngừng bán[ACTIVE] / Xóa nháp[DRAFT]
  / Rollback[RETIRED]); cả 4 nhánh HỘI TỤ vào MỘT Task Step 4 "Mở modal xác nhận tương ứng".
  KHÔNG vẽ 4 luồng song song đầy đủ (4 modal / 4 guard / 4 thực thi riêng) — gộp để sơ đồ gọn.
- Ghi chú đặc thù mỗi thao tác (auto-retire / grandfather / hard delete / clone-forward) đặt là
  TEXT MỜ (faded annotation) cạnh Task Step 8 "Thực thi", KHÔNG tách thành node riêng.
- Step 5's "Không" (NO) branch connects DIRECTLY and ONLY to the AF-01 sub-process container.
  Step 6 gateway is reached ONLY via Step 5's "Có" (YES) branch (solid black arrow, main flow).
  Step 7 gateway is reached ONLY via Step 6's "Có" (YES) branch.
- Each numbered badge must attach to the exact single node it belongs to. Every gateway diamond must
  visibly show its step number badge, same as task boxes.
- Keep every box label concise (≤ ~12 words) with adequate spacing so all Vietnamese text renders fully.

=== LAYOUT RULES (critical — follow strictly to avoid crossing lines) ===
- The main guard frame (Gateway Step 3 "Thao tác nào?" → Step 4 modal → Step 5 → Step 6 → Step 7
  → Step 8 Thực thi → Step 9 → End) MUST sit on a single straight horizontal lane, left to right,
  top-aligned. Do NOT float any main-flow step above/below that lane.
- The 4 branches of Gateway Step 3 fan out compactly (short stacked lines) and CONVERGE into the single
  Step 4 Task — draw a tidy merge, không dây dài chéo.
- EF-01 (thiếu quyền) sits directly BELOW gateway Step 6; EF-02 (trạng thái sai) directly BELOW
  gateway Step 7; AF-01 (Hủy) directly BELOW gateway Step 5 — each aligned to its trigger's x-position.
- Connector lines must NEVER cross unrelated boxes. Use short orthogonal (right-angle) drops straight
  down to each sub-diagram — no long diagonal lines.
- Each gateway's Có/Không branch label sits immediately next to that gateway's own outgoing arrow only.

=== VISUAL STYLE ===
- Standard BPMN 2.0 notation. Start = filled circle; End = thick border circle; Task = rounded rectangle;
  Gateway = diamond with X (exclusive). Main flow = solid black arrows; Alternate (AF) = dashed blue;
  Exception (EF) = dashed red. Step numbers visible on each box. Language: Vietnamese for all labels.
- Add a legend (bottom-left) explaining arrow types + node types.
- Optional: một khối phụ nhỏ ở góc trên-phải, tiêu đề "STATE MACHINE", dạng chú thích:
  "DRAFT →(Xuất bản)→ ACTIVE →(Ngừng bán)→ RETIRED ; RETIRED →(Rollback, clone-forward)→ DRAFT (v+1)".
  Vẽ mảnh, mờ, tách khỏi main flow — chỉ là chú thích, không nối dây vào các Step.

=== DO NOT INCLUDE ===
- KHÔNG "hồi sinh" bản RETIRED — Rollback là clone-forward tạo phiên bản nháp MỚI, bản RETIRED cũ giữ nguyên (BR-05, BR-06).
- KHÔNG hard delete gói ACTIVE/RETIRED — chỉ gói DRAFT mới được Xóa (BR-04, BR-09).
- KHÔNG vẽ chi tiết form Sửa gói (UC-CAT-06) — ngoài scope UC này.
- KHÔNG vẽ 4 luồng song song đầy đủ — dùng khung guard gộp chung.

=== END EVENTS LEGEND (bottom-right box, title "KẾT THÚC (END EVENTS)") ===
1. End (Success — theo thao tác) — Step 9 thực thi thành công:
   • Xuất bản → gói ACTIVE, bản ACTIVE cũ cùng họ auto-retire, cập nhật hero in-place.
   • Ngừng bán → gói RETIRED, subscription hiện tại giữ nguyên (grandfather), cập nhật hero.
   • Xóa nháp → gói xóa vĩnh viễn, điều hướng về Danh sách gói (UC-CAT-03).
   • Rollback → tạo bản nháp v{max+1}, điều hướng sang Chi tiết bản nháp mới (UC-CAT-04).
2. End (Cancelled) — AF-01: người dùng Hủy / ✕ / click ngoài modal; trạng thái không đổi.
3. End (Rejected — thiếu quyền) — EF-01: guard quyền chặn; toast từ chối; dữ liệu không đổi.
4. End (Rejected — trạng thái sai) — EF-02: guard trạng thái chặn (kể cả race); toast lỗi; dữ liệu không đổi.

Output as a Mermaid flowchart code block if image generation is not available, using subgraph for swimlanes.
```
