# BPMN Prompt Templates — nguồn tham chiếu cho skill `/bpmn`

> **Cách dùng:** Bạn **dán / sửa** template BPMN của mình vào file này. Mỗi khi chạy `/bpmn`, Claude **ĐỌC file này** và **điền** vào template phù hợp — KHÔNG tự chế cấu trúc khác.
>
> **Placeholder:** phần trong `{...}` hoặc `[...]` = giá trị điền theo từng UC (lấy từ bảng phân tích Bước 2). Mọi nội dung NGOÀI placeholder giữ nguyên từng chữ.
>
> **Chọn template theo công cụ render:**
> - **Template A** — ChatGPT tạo ảnh trực tiếp (swimlane text-spec, style UC-CON-06). ← **MẶC ĐỊNH** cho M-04 trở đi.
> - **Template B** — ChatGPT Code Interpreter (Python/matplotlib, house-style navy/xanh khớp ảnh M-01/M-02/M-03).
>
> Nếu user không nói rõ, hỏi 1 câu chọn A hay B (hoặc dùng A mặc định).

# Prompt cho ChatGPT — Vẽ BPMN UC-CAT-03 (Danh sách Gói sản phẩm — Package List)

```
Create a BPMN 2.0 swimlane diagram for the "Package List" (Danh sách Gói sản phẩm) feature of
OneCRM — a B2B CRM system for cybersecurity products (EDR/EPP/AV/CA). This is a READ-ONLY +
NAVIGATION hub-lite screen (search/filter/sort/paginate) — no form or CRUD UI is rendered here;
actions like Create/Edit/Delete/Detail all navigate to separate out-of-scope Use Cases.

=== SWIMLANES ===
Pool: "UC-CAT-03 — Danh sách Gói sản phẩm (Package List)"
Lane 1: User (Sales / Manager / License Admin / CSKH / Auditor)
Lane 2: System

=== TRIGGER (note above Start Event) ===
(a) Click menu "🎁 Gói sản phẩm" trên sidebar (showModule('package'))
(b) Click nút "Xem N gói" ở Chi tiết/Kanban Sản phẩm — mở list đã lọc sẵn theo product_id

=== MAIN FLOW ===
Step 1  [System]  Start Event → Task "Tải danh sách gói, áp dụng gộp phiên bản hiện hành (ưu tiên ACTIVE > DRAFT > RETIRED, cùng hạng thì version cao nhất), sort created_at giảm dần, phân trang 10 gói/trang"
Step 2  [User]    Task "(Tuỳ chọn) Nhập từ khoá và/hoặc chọn bộ lọc Sản phẩm / Trạng thái, hoặc tích 'Hiện mọi phiên bản'"
Step 3  [System]  Task "Lọc realtime (AND các bộ lọc); nếu tích 'Hiện mọi phiên bản' hoặc chọn Trạng thái → bỏ gộp version; cập nhật counter và danh sách"
Step 4  [System]  Gateway (Exclusive) "Có kết quả phù hợp?"
  → YES path: continue to Step 5
  → NO path:  Exception Flow EF-01
Step 5  [User]    Task "(Tuỳ chọn) Click header cột Sortable để sort"
Step 6  [System]  Task "Áp dụng sort (lần 1 → tăng dần, lần 2 → giảm dần); cập nhật icon cột đó (↑/↓); reset các cột khác về ↕; về trang 1"
Step 7  [User]    Task "Chọn một hành động trên danh sách"
Step 8  [System]  Gateway (Exclusive) "Loại thao tác?" — fan-out 7 branches:
  → Click row:                              End (End 1 — Chi tiết gói)
  → Click "＋ Thêm gói":                     End (End 2 — Tạo gói)
  → Click ✏️ Sửa (gói DRAFT/ACTIVE):         End (End 3 — Sửa gói)
  → Click 🗑️ Xóa (gói DRAFT + đủ quyền):     End (End 4 — Xóa gói nháp)
  → Click ✏️/🗑️ đang disabled (chỉ hiện tooltip): End (End 5 — Ở lại màn)
  → Search / lọc Sản phẩm / lọc Trạng thái / toggle "Hiện mọi phiên bản": Alternate Flow AF-01
  → Sort / chuyển trang:                    Alternate Flow AF-02

=== ALTERNATE FLOW AF-01: Tìm kiếm / Lọc / Toggle "Hiện mọi phiên bản" ===
Triggered from Step 8 (search/filter/toggle action) — cùng logic với Step 2/3/4 ở lần tải đầu
AF-01a  [User]    Task "Nhập từ khoá, HOẶC chọn dropdown Sản phẩm/Trạng thái, HOẶC tích/bỏ tích 'Hiện mọi phiên bản'"
AF-01b  [System]  Task "Re-render danh sách (AND các bộ lọc); nếu chọn Trạng thái hoặc tích 'Hiện mọi phiên bản' → hiển thị tất cả version; về trang 1; cập nhật counter"
Gateway (unnumbered) "Còn kết quả phù hợp?"
  → YES path: End (End 5 — Ở lại màn)
  → NO path:  Exception Flow EF-01 (dùng chung node với Step 4's EF-01)

=== ALTERNATE FLOW AF-02: Sort / Phân trang ===
Triggered from Step 8 (sort/pagination action) — cùng logic với Step 5/6 ở lần tải đầu
AF-02a  [User]    Task "Click header cột Sortable, HOẶC nhấn nút trang ‹ / số trang / ›"
AF-02b  [System]  Task "Với sort: toggle asc/desc, cập nhật icon, về trang 1. Với phân trang: hiển thị 10 gói của trang được chọn, cập nhật counter, highlight nút trang"
→ End (End 5 — Ở lại màn)

=== EXCEPTION FLOW EF-01: Không có kết quả phù hợp ===
Triggered from TWO points: (1) Step 4 (NO path — lần tải/lọc đầu tiên), (2) AF-01's internal
"Còn kết quả phù hợp?" gateway (NO path — sau khi lọc lại). Draw EF-01 as ONE single shared
sub-process with two incoming arrows (one from Step 4, one from AF-01's internal gateway).
EF-01a  [System]  Task "Ẩn các hàng dữ liệu; xóa nội dung thanh phân trang"
EF-01b  [System]  Task "Hiển thị empty state: icon 🎁 + 'Chưa có gói nào khớp bộ lọc' + gợi ý 'Thử xoá bộ lọc hoặc tạo gói mới.' + nút '＋ Tạo gói'"
EF-01c  [User]    Gateway (Exclusive) "(Tuỳ chọn) Nhấn '＋ Tạo gói'?"
  → YES path: End (End 2 — Tạo gói, dùng chung node với Step 8's End 2)
  → NO path:  End (End 6 — Empty state)

=== NODE INTEGRITY RULES (critical — prevents extra/garbled nodes) ===
- The diagram MUST contain EXACTLY these nodes: Start Event, Step 1–8, End 1–6, AF-01a/AF-01b +
  1 unnumbered gateway, AF-02a/AF-02b, EF-01a/EF-01b/EF-01c. Do NOT synthesize, duplicate, or
  insert any additional task/gateway/node not explicitly listed above.
- End 2 ("Tạo gói") has TWO valid incoming arrows — one from Step 8's "＋ Thêm gói" branch, one
  from EF-01c's YES branch — both must point to the SAME single End 2 node, not two separate
  copies.
- EF-01 has TWO valid incoming arrows — one from Step 4 (NO), one from AF-01's internal gateway
  (NO) — both must point to the SAME single EF-01 sub-process, not two separate copies.
- AF-01's internal "Còn kết quả phù hợp?" gateway has NO number badge.
- Each numbered badge (1–8) must be attached to the exact single node it belongs to per this spec.
- Do NOT render any Create/Edit/Delete/Publish/Retire form or modal UI — only buttons and their
  navigation arrows to the relevant End event; those behaviors are separate out-of-scope Use Cases.
- Keep every box label concise (roughly ≤12 words) and give adequate spacing between nodes so all
  Vietnamese text renders fully and legibly — do not compress or overlap boxes.

=== LAYOUT RULES (critical — follow strictly to avoid crossing lines) ===
- Main-flow nodes Step 1 → Step 2 → ... → Step 8 MUST sit on a single straight horizontal lane,
  left to right, top-aligned.
- EF-01 sub-diagram MUST be positioned directly BELOW Step 4 (its primary trigger point). Route
  the second incoming arrow (from AF-01's internal gateway) as a short dashed line down to the
  same EF-01 box — do not duplicate the box.
- AF-01 and AF-02 sub-diagrams MUST be positioned directly BELOW Step 8, side by side.
- End 1 through End 5 (Step 8's direct branches) sit to the right of Step 8, stacked in a compact
  vertical group at the same horizontal position — do not spread them across the whole canvas width.
- End 6 sits directly below/right of EF-01.
- Connector lines must NEVER cross over unrelated task/gateway boxes. Use short, direct orthogonal
  (right-angle) routing only — no long diagonal lines spanning the canvas.

=== VISUAL STYLE ===
- Use standard BPMN 2.0 notation
- Start event: filled circle
- End events: thick border circle
- Tasks: rounded rectangles
- Gateways: diamonds with X (exclusive)
- Main flow: solid black arrows
- Alternate flows (AF): dashed blue arrows
- Exception flows (EF): dashed red arrows
- Add a legend in the bottom-left corner explaining shape/arrow types (Sequence Flow, Alternate
  Flow, Exception Flow, Gateway, User Task, System Task, Start/End Event)
- Step numbers must be visible on each numbered task/gateway box
- Language: Vietnamese for all labels

=== DO NOT INCLUDE ===
- Any Create/Edit/Delete/Publish/Ngừng bán form or modal — out of scope, only buttons + navigation
- Publish (Xuất bản) / Ngừng bán buttons anywhere on this screen — per BR-12 they live only on the
  Package Detail page's hero, not on this list screen
- Version-history detail content — belongs to the separate Package Detail Use Case (End 1 target)

=== END EVENTS LEGEND (bottom-right box, title "KẾT THÚC (END EVENTS)") ===
1. End 1 — Chi tiết gói (UC riêng, có tab Version history) — click row
2. End 2 — Tạo gói (UC riêng) — "＋ Thêm gói" hoặc "＋ Tạo gói" ở empty state
3. End 3 — Sửa gói (UC riêng) — ✏️ Sửa khi gói DRAFT/ACTIVE
4. End 4 — Xóa gói nháp (UC riêng) — 🗑️ Xóa khi gói DRAFT + đủ quyền
5. End 5 — Ở lại màn — nút disabled / sau AF-01 (search, lọc, toggle) / sau AF-02 (sort, phân trang)
6. End 6 — Empty state — EF-01, không có kết quả phù hợp với bộ lọc
```

---

**Lưu ý khi dùng:** Nếu ChatGPT không gen được BPMN dạng diagram trực tiếp, thêm dòng này vào cuối prompt:

```
Output as a Mermaid flowchart code block if image generation
is not available, using subgraph for swimlanes.
```




# Prompt cho ChatGPT — Vẽ BPMN UC-CAT-02 (Chi tiết Sản phẩm)

```
Create a BPMN 2.0 swimlane diagram for the "Product Detail" (Chi tiết Sản phẩm) feature of
OneCRM — a B2B CRM system for cybersecurity products (EDR/EPP/AV/CA). This is a READ-ONLY hub
screen with 3 tabs — no product data mutation. Only the "Sửa mapping" button navigates out to
a separate, out-of-scope Use Case (only the button + navigation is shown here).

=== SWIMLANES ===
Pool: "UC-CAT-02 — Chi tiết Sản phẩm"
Lane 1: User (Sales / CSKH / Manager / License Admin / Auditor)
Lane 2: System

=== MAIN FLOW ===
Step 1  [User]    Start Event → Task "Click vào thẻ sản phẩm trên Kanban (UC-CAT-01)"
Step 2  [System]  Gateway (Exclusive) "Sản phẩm tồn tại?"
  → YES path: continue to Step 3
  → NO path:  Exception Flow EF-01
Step 3  [System]  Task "Render breadcrumb 'Sản phẩm' + hero section (avatar, tên, badge trạng thái, dòng meta, nút '← Quay lại') + tab bar 3 tab"
Step 4  [System]  Task "Render tab mặc định 'Thông tin': card 'Thông tin sản phẩm' + card 'Thông tin kỹ thuật (Admin/tích hợp)'"
Step 5  [User]    Task "Chọn một thao tác: chuyển tab / '✏️ Sửa mapping' / '← Quay lại'"
Step 6  [System]  Gateway (Exclusive) "Loại thao tác người dùng chọn?" — fan-out 4 branches:
  → Chuyển tab "Tính năng":          Alternate Flow AF-01 (ở lại trang, loop back to Step 5)
  → Chuyển tab "Mapping trạng thái": Alternate Flow AF-02 (ở lại trang, loop back to Step 5)
  → Click "✏️ Sửa mapping" (chỉ role Manager/License Admin): End (End 2 — Mở editor Sửa mapping, ngoài phạm vi)
  → Click "← Quay lại" / breadcrumb "Sản phẩm": End (End 1 — Về Kanban Sản phẩm UC-CAT-01)

=== ALTERNATE FLOW AF-01: Chuyển tab Tính năng ===
Triggered from Step 6 when user clicks tab "Tính năng"
AF-01a  [User]    Task "Click tab 'Tính năng ({N})' trên tab bar"
AF-01b  [System]  Task "catSwitchTab('feat') → render danh sách tính năng nhóm theo component, mỗi component một bảng 3 cột (Module | Tính năng | Loại: Mặc định/Theo gói/Add-on)"
→ Loop back to Step 5 (ở lại trang, KHÔNG tạo End Event)

=== ALTERNATE FLOW AF-02: Chuyển tab Mapping trạng thái ===
Triggered from Step 6 when user clicks tab "Mapping trạng thái"
AF-02a  [User]    Task "Click tab 'Mapping trạng thái' trên tab bar"
AF-02b  [System]  Task "catSwitchTab('map') → render bảng statusMap 3 cột (Trạng thái gốc | Tên hiển thị | → Trạng thái Sub CRM). Nút '✏️ Sửa mapping' chỉ hiện với role Manager/License Admin"
→ Loop back to Step 5 (ở lại trang, KHÔNG tạo End Event)

=== EXCEPTION FLOW EF-01: Sản phẩm không tồn tại ===
Triggered from Step 2 (NO path) — product id không tồn tại trong hệ thống
EF-01a  [System]  Task "catProd(id) trả về rỗng — không mở được trang chi tiết"
EF-01b  [System]  Task "Giữ nguyên màn hình Kanban Sản phẩm (UC-CAT-01), không điều hướng"
→ End (End 3 — Ở lại Kanban, EF-01)

=== NODE INTEGRITY RULES (critical — prevents extra/garbled nodes) ===
- The diagram MUST contain EXACTLY these nodes: Start Event, Step 1–6, End 1, End 2, End 3,
  AF-01a/AF-01b, AF-02a/AF-02b, EF-01a/EF-01b. Do NOT synthesize, duplicate, or insert any
  additional task/gateway/node not explicitly listed above.
- AF-01 and AF-02 are LOOP-BACK flows, not terminal flows: their final arrow returns to Step 5
  (not to any End event). Draw this return arrow as a dashed blue line curving back up/left to
  Step 5 — do NOT create a duplicate copy of Step 5, reuse the same Step 5 node as the
  destination of both loop-back arrows.
- Step 6's 4 outgoing branches must be clearly distinguished: 2 dashed-blue (AF-01, AF-02,
  looping back) and 2 solid-black leading to distinct End events (End 1, End 2) — do not merge
  or omit any of the 4 branches.
- Do NOT render the actual "Sửa mapping" editor UI — only the button and the navigation arrow
  to End 2; the editor itself is a separate out-of-scope Use Case.
- Keep every box label concise (roughly ≤12 words) and give adequate spacing between nodes so
  all Vietnamese text renders fully and legibly — do not compress or overlap boxes.

=== LAYOUT RULES (critical — follow strictly to avoid crossing lines) ===
- Main-flow nodes Step 1 → Step 2 → Step 3 → Step 4 → Step 5 → Step 6 MUST sit on a single
  straight horizontal lane, left to right, top-aligned.
- AF-01 and AF-02 sub-diagrams MUST be positioned directly BELOW Step 6 (their trigger point),
  side by side, with short orthogonal loop-back arrows returning up to Step 5 — keep these
  loop-back arrows close to the Step 5–Step 6 area, do NOT route them diagonally across the
  whole canvas.
- EF-01 sub-diagram MUST be positioned directly BELOW Step 2 (its trigger point).
- End 1 and End 2 (from Step 6's two terminal branches) sit to the right of Step 6, at the same
  height as the main flow lane, side by side — do not stack them vertically.
- Connector lines must NEVER cross over unrelated task/gateway boxes. Use short, direct
  orthogonal (right-angle) routing only.

=== VISUAL STYLE ===
- Use standard BPMN 2.0 notation
- Start event: filled circle
- End events: thick border circle
- Tasks: rounded rectangles
- Gateways: diamonds with X (exclusive)
- Main flow: solid black arrows
- Alternate flows (AF, including loop-backs): dashed blue arrows
- Exception flows (EF): dashed red arrows
- Add a legend in the bottom-left corner explaining shape/arrow types (Sequence Flow, Alternate
  Flow, Exception Flow, Gateway, User Task, System Task, Start/End Event)
- Step numbers must be visible on each numbered task/gateway box
- Language: Vietnamese for all labels

=== DO NOT INCLUDE ===
- Any Create/Edit/Delete Product task or button — product info is 100% read-only on this screen (BR-01)
- The actual Mapping-editor UI/form — out of scope, only the button + End 2 navigation arrow
- Any additional tab, filter, or pagination control not listed in this spec

=== END EVENTS LEGEND (bottom-right box, title "KẾT THÚC (END EVENTS)") ===
1. End 1 — Về Kanban Sản phẩm (UC-CAT-01) — click "← Quay lại" / breadcrumb
2. End 2 — Mở editor Sửa mapping (UC riêng, ngoài phạm vi) — chỉ role Manager/License Admin
3. End 3 — Ở lại Kanban — EF-01, sản phẩm không tồn tại
```

---

**Lưu ý khi dùng:** Nếu ChatGPT không gen được BPMN dạng diagram trực tiếp, thêm dòng này vào cuối prompt:

```
Output as a Mermaid flowchart code block if image generation
is not available, using subgraph for swimlanes.
```



# Prompt cho ChatGPT — Vẽ BPMN UC-CAT-01 (Danh sách Sản phẩm — Product Kanban)

```
Create a BPMN 2.0 swimlane diagram for the "Product Catalog List" (Danh sách Sản phẩm —
Product Kanban) feature of OneCRM — a B2B CRM system for cybersecurity products (EDR/EPP/AV/CA).
This is a READ-ONLY navigation screen — no data mutation of any kind.

=== SWIMLANES ===
Pool: "UC-CAT-01 — Danh sách Sản phẩm (Product Kanban)"
Lane 1: User (Sales / CSKH / Manager / License Admin / Auditor)
Lane 2: System

=== TRIGGER (note above Start Event) ===
Click menu "📦 Sản phẩm" trên sidebar (showModule('product'))

=== MAIN FLOW ===
Step 1  [System]  Start Event → Task "Tải toàn bộ product trong catalog"
Gateway (unnumbered — no badge) "Catalog có sản phẩm?"
  → YES path: continue to render Kanban, then Step 2
  → NO path:  Alternate Flow AF-01
Task (part of Step 1, no separate badge) "Render lưới Kanban 2 cột: mỗi thẻ gồm icon, tên,
  mô tả ngắn, badge trạng thái (● Đang hoạt động / ● Ngừng), thống kê gói ('📦 N gói đang bán'
  hoặc 'nActive/nPkg' nếu có gói RETIRED/DRAFT), thống kê subscription ('👥 N subscription'),
  nút 'Xem N gói của sản phẩm →'"
Step 2  [User]    Gateway (Exclusive) "Loại thao tác?" — fan-out 2 branches:
  → Click thân thẻ (đầu thẻ): End (End 1 — Điều hướng UC-CAT-02)
  → Click nút "Xem N gói của sản phẩm →": End (End 2 — Điều hướng UC-CAT-03, đã lọc theo product)

=== ALTERNATE FLOW AF-01: Catalog Rỗng ===
Triggered from the "Catalog có sản phẩm?" gateway (NO path) — chưa có product nào trong hệ thống
AF-01a  [System]  Task "Lưới Kanban không render thẻ nào. Hiển thị empty state: 'Chưa có sản phẩm nào trong danh mục.'"
→ End (End 3 — Empty State, không điều hướng)

=== NO EXCEPTION FLOW ===
Màn hình hoàn toàn read-only (chỉ xem + điều hướng) — không có luồng ngoại lệ (EF).
Do NOT invent any EF branch, error toast, or rollback logic anywhere in this diagram.

=== NODE INTEGRITY RULES (critical — prevents extra/garbled nodes) ===
- The diagram MUST contain EXACTLY these nodes: Start Event, Step 1 Task, the unnumbered
  "Catalog có sản phẩm?" gateway, the Kanban-render Task, Step 2 Gateway, AF-01a, and the
  3 End events (End 1, End 2, End 3). Do NOT synthesize, duplicate, or insert any additional
  task/gateway/node not explicitly listed above.
- The "Catalog có sản phẩm?" gateway has NO number badge — leave it visually unlabeled
  (still draw the diamond shape), do not assign it "2" or any other digit.
- Step 2's gateway badge "2" belongs only to the "Loại thao tác?" diamond — not to either of
  its two outgoing branches or End nodes.
- Do NOT add any Create/Edit/Delete task, form, or button anywhere in this diagram — per BR-01
  this screen is 100% read-only navigation.
- Keep every box label concise (roughly ≤12 words) and give adequate spacing between nodes so
  all Vietnamese text renders fully and legibly — do not compress or overlap boxes.

=== LAYOUT RULES (critical — follow strictly to avoid crossing lines) ===
- ALL main-flow nodes (Start Event → Step 1 Task → gateway → Kanban-render Task → Step 2 Gateway)
  MUST sit on a single straight horizontal lane, left to right, top-aligned.
- AF-01 sub-diagram MUST be positioned directly BELOW the "Catalog có sản phẩm?" gateway
  (its trigger point), aligned to that gateway's horizontal (x-axis) position.
- End 1 and End 2 (from Step 2's two branches) should sit side by side to the right of Step 2,
  at the same height as the main flow lane — do not stack them vertically.
- End 3 sits directly below AF-01a.
- Connector lines must NEVER cross over unrelated task/gateway boxes. Use short, direct
  orthogonal (right-angle) routing only — no long diagonal lines spanning the canvas.

=== VISUAL STYLE ===
- Use standard BPMN 2.0 notation
- Start event: filled circle
- End events: thick border circle
- Tasks: rounded rectangles
- Gateways: diamonds with X (exclusive)
- Main flow: solid black arrows
- Alternate flow (AF): dashed blue arrows
- Add a legend in the bottom-left corner explaining shape/arrow types (Sequence Flow, Alternate
  Flow, Gateway, User Task, System Task, Start/End Event)
- Step numbers must be visible on each numbered task/gateway box (Step 1, Step 2, AF-01a only —
  per NODE INTEGRITY RULES above, the empty-catalog gateway stays unlabeled)
- Language: Vietnamese for all labels

=== DO NOT INCLUDE ===
- Any Create/Edit/Delete Product task or button (out of scope per BR-01 — Product managed
  entirely outside this screen, at Product Module level)
- Any Exception Flow (EF), error toast, rollback, or system-error branch — this screen has none
- Pagination, filter, or search controls — not part of this UC's documented flow

=== END EVENTS LEGEND (bottom-right box, title "KẾT THÚC (END EVENTS)") ===
1. End 1 — Chi tiết Sản phẩm (UC-CAT-02) — click thân thẻ, catOpenProduct(prodId)
2. End 2 — Danh sách Gói đã lọc (UC-CAT-03) — click "Xem N gói", catViewPackages(prodId)
3. End 3 — Empty State — AF-01, catalog chưa có product, không điều hướng
```

---

**Lưu ý khi dùng:** Nếu ChatGPT không gen được BPMN dạng diagram trực tiếp, thêm dòng này vào cuối prompt:

```
Output as a Mermaid flowchart code block if image generation
is not available, using subgraph for swimlanes.
```