# Prompt sinh ảnh BPMN — Cấu hình & Người dùng (UC-SET-* / UC-USR-*)

> **Cách dùng:** copy code block → dán ChatGPT (chế độ tạo ảnh) → xuất PNG → lưu đè
> `docs/assets/settings/UC-XXX-NN_bpmn.png`. FRS §2 đã trỏ sẵn đường dẫn nên ảnh tự hiển thị.
>
> Style theo mẫu `docs/frs/catalog/_bpmn_prompts.md` (Template A). **Đã áp các bài học từ đợt review M-08:**
> (1) có mục **LANE ASSIGNMENT** — gán rõ node nào ở lane nào, **không ép tất cả lên 1 hàng ngang** (luồng zig-zag giữa 2 band theo actor);
> (2) mọi nhánh đều **kết thúc tường minh** (có nhánh "không thao tác");
> (3) vòng lặp vẽ rõ, **không** để "loop hoặc End" mơ hồ;
> (4) chặn sẵn node hư cấu bằng NODE INTEGRITY.
>
> Nếu ChatGPT không gen được ảnh, thêm cuối prompt: *Output as a Mermaid flowchart code block if image generation is not available, using subgraph for swimlanes.*

---

## UC-SET-01 — Quản lý mẫu thông báo

```
Create a BPMN 2.0 swimlane diagram for the "Manage Notification Templates" (Quản lý mẫu thông báo)
feature of OneCRM — a B2B CRM for cybersecurity products. An ADMIN-ONLY screen to edit the content
(subject / body) of COMMERCIAL notification templates without redeploying software. Template
variables are declared by the system per template and are READ-ONLY to the admin.

=== SWIMLANES ===
Pool: "UC-SET-01 — Quản lý mẫu thông báo"
Lane 1: User (License Admin)
Lane 2: System

=== TRIGGER (note above Start Event) ===
Menu "Cấu hình" → tab "Mẫu thông báo" (menu chỉ hiển thị với License Admin).

=== MAIN FLOW ===
Step 1  [User]    Start Event → Task "Mở menu Cấu hình"
Step 2  [System]  Gateway (Exclusive) "Có quyền setting:edit?"
  → Có    → tiếp Step 3
  → Không → Exception Flow EF-01 (→ End 3)
Step 3  [System]  Task "Mở tab 'Mẫu thông báo'; render danh sách mẫu: tên + kênh (Email / Trong ứng dụng) + tiêu đề xem trước + chip biến dùng được"
Step 4  [User]    Gateway (Exclusive) "Thao tác?" — fan-out 2 branches:
  → Bấm "✏️ Sửa" trên 1 mẫu: tiếp Step 5
  → Không thao tác: End (End 2 — Ở lại màn, không thay đổi)
Step 5  [System]  Task "Mở hộp thoại sửa mẫu: Tên mẫu / Tiêu đề / Nội dung (sửa được) + danh sách biến dùng được (CHỈ ĐỌC)"
Step 6  [User]    Task "Sửa nội dung → bấm '💾 Lưu'" → Alternate Flow AF-01

=== ALTERNATE FLOW AF-01: Lưu mẫu ===
Triggered from Step 6
AF-01a  [System]  Gateway (Exclusive) "Biến dùng trong tiêu đề/nội dung ĐỀU nằm trong danh sách khai báo?"
  → Có    → tiếp AF-01b
  → Không → Exception Flow EF-02
AF-01b  [System]  Task "Cập nhật tên / tiêu đề / nội dung; ghi Audit log (template.updated); đóng hộp thoại; hiện thông báo ngắn 'Đã lưu · có hiệu lực ngay · đã ghi Audit log'"
→ End (End 1 — Đã lưu mẫu)

=== EXCEPTION FLOW EF-02: Biến không hợp lệ ===
Triggered from AF-01a (NO path)
EF-02a  [System]  Task "KHÔNG lưu; giữ hộp thoại mở; hiện lỗi ngay trong hộp thoại: liệt kê biến sai + giải thích 'biến này không có dữ liệu khi gửi nên sẽ hiển thị trống' + liệt kê biến hợp lệ"
→ Loop back to Step 6 (sửa lại, KHÔNG tạo End Event)

=== EXCEPTION FLOW EF-01: Không có quyền ===
Triggered from Step 2 (NO path) — vai trò ≠ License Admin
EF-01a  [System]  Task "Menu 'Cấu hình' không hiển thị; gọi thẳng API → 403"
→ End (End 3 — Từ chối, không đủ quyền)

=== NODE INTEGRITY RULES (critical) ===
- MUST contain EXACTLY: Start Event, Step 1–6, AF-01a (gateway) / AF-01b, EF-01a, EF-02a, End 1, End 2, End 3. No extra/duplicate nodes.
- EF-02 (biến không hợp lệ) LOOPS BACK to **Step 6** — it is NOT terminal; saving is BLOCKED, the dialog stays open. EF-02a must **NEVER** connect forward into AF-01b or End 1 (that would mean "invalid variable → still saved", the opposite of the rule).
- The variable list in the edit dialog is READ-ONLY — do NOT draw any task/branch for "thêm biến mới".
- Nút "Hủy" của hộp thoại chỉ đóng hộp thoại (không đổi dữ liệu) — dưới altitude process, do NOT model it as a node.
- 1 NODE = 1 LANE (see LANE ASSIGNMENT). NEVER put a System node in the User band or vice-versa.
- Keep labels concise; adequate spacing for full Vietnamese text.

=== LANE ASSIGNMENT (critical — đặt mỗi node ĐÚNG lane của actor) ===
- USER lane (top band): Start Event, Step 1, Step 4 gateway "Thao tác?", **Step 6**.
- SYSTEM lane (bottom band): Step 2 gateway, Step 3, Step 5, AF-01a, AF-01b, EF-01a, EF-02a.
- End events sit next to the branch that reaches them.
- ⚠️ **SELF-CHECK before finalizing** — verify node by node: **1, 4, 6 in the User band**; **2, 3, 5, AF-01a, AF-01b, EF-01a, EF-02a in the System band**. Step 6 is a USER task and is frequently mis-placed into the System band — double-check it specifically.

=== LAYOUT RULES (critical) ===
- Do NOT force all main-flow nodes onto one horizontal line. The flow moves left→right but SHIFTS between the User (top) and System (bottom) bands per LANE ASSIGNMENT — a correct swimlane zig-zags.
- Cross-lane sequence flows cross the lane divider VERTICALLY (orthogonal): Step 1 (User) ↓ Step 2 (System); Step 3 (System) ↑ Step 4 (User); Step 4 ↓ Step 5 (System); Step 5 ↑ Step 6 (User); Step 6 ↓ AF-01.
- AF-01 sub-box below Step 6; EF-01 sub-box below Step 2.
- End 1 right of AF-01; End 2 right of Step 4; End 3 right of/below EF-01.
- Orthogonal right-angle routing only; keep cross-lane connectors short; no long diagonals.

=== VISUAL STYLE ===
- Standard BPMN 2.0. Start filled circle; End thick border; Task rounded rect; Gateway diamond X.
- Main flow solid black; AF dashed blue; EF dashed red.
- Legend bottom-left. Step numbers visible. Vietnamese labels.

=== DO NOT INCLUDE ===
- Any "thêm biến mới" action — variables are system-declared, read-only (BR-03).
- Operational templates (credentials / technical alert) or Timeline event templates — commercial templates only (BR-02).
- Multi-language / translation UI — Vietnamese only in this phase (BR-07).

=== END EVENTS LEGEND (bottom-right box, title "KẾT THÚC (END EVENTS)") ===
1. End 1 — Đã lưu mẫu (hiệu lực ngay, đã ghi Audit log)
2. End 2 — Ở lại màn (xem, không thay đổi)
3. End 3 — Từ chối (403) — EF-01, không đủ quyền
```

---

## UC-SET-02 — Cấu hình tham số theo sản phẩm

```
Create a BPMN 2.0 swimlane diagram for the "Product Runtime Config" (Cấu hình tham số theo sản phẩm)
feature of OneCRM — a B2B CRM for cybersecurity products. An ADMIN-ONLY screen: pick a product first,
then view / edit that product's operational parameters (renewal reminder thresholds, status-mismatch
alert threshold, auto-reconcile delay, product portal URL). The "usage push interval" is shown but is
READ-ONLY (declared by the product). Products not yet integrated are reference-only (no edit).

=== SWIMLANES ===
Pool: "UC-SET-02 — Cấu hình tham số theo sản phẩm"
Lane 1: User (License Admin)
Lane 2: System

=== TRIGGER (note above Start Event) ===
Menu "Cấu hình" → tab "Tham số theo sản phẩm" (menu chỉ hiển thị với License Admin).

=== MAIN FLOW ===
Step 1  [User]    Start Event → Task "Mở menu Cấu hình → tab 'Tham số theo sản phẩm'"
Step 2  [System]  Gateway (Exclusive) "Có quyền setting:edit?"
  → Có    → tiếp Step 3
  → Không → Exception Flow EF-01 (→ End 3)
Step 3  [System]  Task "Render bộ chọn sản phẩm + tham số của sản phẩm đang chọn (mặc định EDR), đọc từ cấu hình sản phẩm — KHÔNG hardcode"
Step 4  [User]    Gateway (Exclusive) "Thao tác?" — fan-out 3 branches:
  → Chọn sản phẩm khác: Alternate Flow AF-01
  → Bấm "✏️ Chỉnh sửa tham số": Alternate Flow AF-02
  → Không thao tác: End (End 2 — Ở lại màn, không thay đổi)

=== ALTERNATE FLOW AF-01: Chọn sản phẩm ===
Triggered from Step 4
AF-01a  [System]  Task "Render lại tham số của sản phẩm được chọn"
AF-01b  [System]  Gateway (Exclusive) "Sản phẩm đã tích hợp thực tế?"
  → Có    → hiện nút "✏️ Chỉnh sửa tham số"
  → Không → hiển thị cảnh báo "chưa tích hợp" và ẨN nút chỉnh sửa (chỉ tham khảo)
→ Loop back to Step 4 (ở lại màn, KHÔNG tạo End Event)

=== ALTERNATE FLOW AF-02: Chỉnh sửa tham số ===
Triggered from Step 4 (chỉ với sản phẩm đã tích hợp)
AF-02a  [System]  Task "Mở hộp thoại các tham số SỬA ĐƯỢC (mốc nhắc · ngưỡng lệch trạng thái · tự động đối soát · đường dẫn cổng) — KHÔNG có 'Chu kỳ cập nhật số máy' (chỉ đọc) và KHÔNG có 'Ân hạn xoay khóa' (đã dời sang UC-SET-03)"
AF-02b  [User]    Task "Sửa giá trị → bấm '💾 Lưu'"
AF-02c  [System]  Task "Kiểm tra đường dẫn cổng còn giữ phần {mã tenant}; cập nhật cấu hình; ghi Audit log (config.updated); hiện thông báo ngắn (nếu thiếu {mã tenant} → thông báo ngắn CẢNH BÁO nhưng vẫn lưu)"
→ End (End 1 — Đã lưu tham số)

=== EXCEPTION FLOW EF-01: Không có quyền ===
Triggered from Step 2 (NO path)
EF-01a  [System]  Task "Menu 'Cấu hình' không hiển thị; gọi thẳng API → 403"
→ End (End 3 — Từ chối, không đủ quyền)

=== NODE INTEGRITY RULES (critical) ===
- MUST contain EXACTLY: Start Event, Step 1–4, AF-01a/AF-01b, AF-02a/AF-02b/AF-02c, EF-01a, End 1, End 2, End 3. No extra/duplicate nodes.
- AF-01 ALWAYS loops back to Step 4 (both gateway branches) — it is NOT terminal; the "chưa tích hợp" case is a visual state, not an End.
- AF-01b gateway has NO number badge.
- Do NOT draw any node where CRM "ra lệnh" cho sản phẩm — CRM chỉ lưu tham số của mình (observer boundary).
- 1 NODE = 1 LANE (see LANE ASSIGNMENT).
- Keep labels concise; adequate spacing for full Vietnamese text.

=== LANE ASSIGNMENT (critical) ===
- USER lane (top band): Start Event, Step 1, Step 4 gateway "Thao tác?", **AF-02b**.
- SYSTEM lane (bottom band): Step 2 gateway, Step 3, AF-01a, AF-01b gateway, AF-02a, AF-02c, EF-01a.
- End events sit next to the branch that reaches them.
- ⚠️ **SELF-CHECK before finalizing** — verify node by node: **Step 1, Step 4, AF-02b in the User band**; **Step 2, Step 3, AF-01a, AF-01b, AF-02a, AF-02c, EF-01a in the System band**. **AF-02b is a USER task** ("Sửa giá trị → bấm Lưu") and is frequently mis-placed into the System band — double-check it specifically.

=== LAYOUT RULES (critical) ===
- Do NOT force all main-flow nodes onto one horizontal line — zig-zag between User (top) and System (bottom) bands per LANE ASSIGNMENT.
- Cross-lane flows cross the divider VERTICALLY (orthogonal): Step 1 (User) ↓ Step 2 (System); Step 3 (System) ↑ Step 4 (User); Step 4 ↓ AF-01 / AF-02.
- AF-01 sub-box below-left of Step 4 with a short dashed-blue loop-back arrow up to Step 4; AF-02 sub-box below-right of Step 4.
- EF-01 sub-box below Step 2.
- End 1 right of AF-02; End 2 right of Step 4; End 3 right of/below EF-01.
- Orthogonal right-angle routing only; no long diagonals; no crossing over unrelated boxes.

=== VISUAL STYLE ===
- Standard BPMN 2.0. Start filled circle; End thick border; Task rounded rect; Gateway diamond X.
- Main flow solid black; AF (incl. loop-back) dashed blue; EF dashed red.
- Legend bottom-left. Step numbers visible. Vietnamese labels.

=== DO NOT INCLUDE ===
- Any node implying CRM controls the product's behaviour (vd "ra lệnh product đổi chu kỳ push") — CRM is a passive observer.
- An edit field for "Chu kỳ cập nhật số máy" (usage push interval) — it is READ-ONLY (declared by the product at integration time); do NOT draw it inside the edit dialog task.
- Edit controls for products not yet integrated (skeleton) — reference-only (BR-03).
- Global (all-product) config — parameters are always per product (BR-02).

=== END EVENTS LEGEND (bottom-right box, title "KẾT THÚC (END EVENTS)") ===
1. End 1 — Đã lưu tham số (hiệu lực chu kỳ kế tiếp, đã ghi Audit log)
2. End 2 — Ở lại màn (xem, không thay đổi)
3. End 3 — Từ chối (403) — EF-01, không đủ quyền
```

---

## UC-SET-03 — Bảo mật tích hợp (xoay khóa)

```
Create a BPMN 2.0 swimlane diagram for the "Integration Secret Rotation" (Bảo mật tích hợp — xoay khóa)
feature of OneCRM — a B2B CRM for cybersecurity products. An ADMIN-ONLY screen showing, per product,
the secret key used to authenticate data the product sends to CRM: masked key with a controlled
reveal toggle, rotation due status, and a rotate action. On rotation the OLD key stays accepted for
a grace period so the integration is not interrupted.

=== SWIMLANES ===
Pool: "UC-SET-03 — Bảo mật tích hợp (xoay khóa)"
Lane 1: User (License Admin)
Lane 2: System

=== TRIGGER (note above Start Event) ===
Menu "Cấu hình" → tab "Bảo mật tích hợp" (menu chỉ hiển thị với License Admin).

=== MAIN FLOW ===
Step 1  [User]    Start Event → Task "Mở menu Cấu hình → tab 'Bảo mật tích hợp'"
Step 2  [System]  Gateway (Exclusive) "Có quyền setting:edit?"
  → Có    → tiếp Step 3
  → Không → Exception Flow EF-01 (→ End 3)
Step 3  [System]  Task "Render mỗi sản phẩm một thẻ: khóa ĐÃ CHE + tình trạng (Còn hạn / Quá hạn xoay khóa) + xoay gần nhất · đến hạn kế · ân hạn + nút '🔄 Xoay khóa mới'"
Step 4  [User]    Gateway (Exclusive) "Thao tác?" — fan-out 4 branches:
  → Bấm 👁 hé lộ khóa: Alternate Flow AF-01
  → Bấm "🔄 Xoay khóa mới": Alternate Flow AF-02
  → Bấm ✏️ cạnh "Ân hạn khóa cũ": Alternate Flow AF-03
  → Không thao tác: End (End 2 — Ở lại màn, không thay đổi)

=== ALTERNATE FLOW AF-03: Chỉnh thời gian ân hạn ===
Triggered from Step 4
AF-03a  [System]  Task "Mở hộp thoại nhỏ: ô 'Ân hạn khóa cũ (ngày)' + giải thích khóa cũ còn được chấp nhận trong khoảng này + nhắc đây là thỏa thuận với đội tích hợp"
AF-03b  [User]    Task "Nhập số ngày → bấm '💾 Lưu' (hoặc Hủy)"
AF-03c  [System]  Task "Validate > 0 ngày; lưu; ghi Audit log; hiện thông báo ngắn 'Áp dụng cho lần xoay khóa kế tiếp'. Nếu ≤ 0 → báo lỗi, KHÔNG lưu, giữ hộp thoại"
→ Loop back to Step 4 (KHÔNG tạo End Event)

=== ALTERNATE FLOW AF-01: Hé lộ / che khóa ===
Triggered from Step 4
AF-01a  [System]  Task "Hiện đầy đủ khóa (bấm lại để che). Không rời màn, không đổi dữ liệu"
→ Loop back to Step 4 (KHÔNG tạo End Event)

=== ALTERNATE FLOW AF-02: Xoay khóa ===
Triggered from Step 4
AF-02a  [System]  Task "Mở hộp thoại xác nhận: giải thích khóa mới sẽ gửi cho đội tích hợp sản phẩm, khóa CŨ vẫn được chấp nhận trong thời gian ân hạn, thao tác được ghi Audit log"
AF-02b  [User]    Gateway (Exclusive) "Xác nhận xoay khóa?"
  → Không (Hủy) → Loop back to Step 4
  → Có → tiếp AF-02c
AF-02c  [System]  Task "Sinh khóa mới; cập nhật 'xoay gần nhất' và 'đến hạn kế tiếp'; bỏ trạng thái quá hạn; ghi Audit log (secret.rotated); hiện thông báo ngắn 'Đã xoay khóa · khóa cũ còn ân hạn N ngày'"
→ End (End 1 — Đã xoay khóa)

=== EXCEPTION FLOW EF-01: Không có quyền ===
Triggered from Step 2 (NO path)
EF-01a  [System]  Task "Menu 'Cấu hình' không hiển thị; gọi thẳng API → 403"
→ End (End 3 — Từ chối, không đủ quyền)

=== NODE INTEGRITY RULES (critical) ===
- MUST contain EXACTLY: Start Event, Step 1–4, AF-01a, AF-02a/AF-02b/AF-02c, AF-03a/AF-03b/AF-03c, EF-01a, End 1, End 2, End 3. No extra/duplicate nodes.
- AF-01 (hé lộ khóa) and AF-03 (chỉnh ân hạn) ALWAYS loop back to Step 4 — they are NOT terminal.
- AF-02b's "Hủy" branch loops back to Step 4 — not terminal.
- Do NOT draw any node where CRM pushes/forces the new key INTO the product — CRM only issues the key and hands it to the integration team (observer boundary).
- 1 NODE = 1 LANE (see LANE ASSIGNMENT).
- Keep labels concise; adequate spacing for full Vietnamese text.

=== LANE ASSIGNMENT (critical) ===
- USER lane (top band): Start Event, Step 1, Step 4 gateway "Thao tác?", AF-02b gateway "Xác nhận xoay khóa?", AF-03b.
- SYSTEM lane (bottom band): Step 2 gateway, Step 3, AF-01a, AF-02a, AF-02c, AF-03a, AF-03c, EF-01a.
- End events sit next to the branch that reaches them.

=== LAYOUT RULES (critical) ===
- Do NOT force all main-flow nodes onto one horizontal line — zig-zag between User (top) and System (bottom) bands per LANE ASSIGNMENT.
- Cross-lane flows cross the divider VERTICALLY (orthogonal): Step 1 (User) ↓ Step 2 (System); Step 3 (System) ↑ Step 4 (User); Step 4 ↓ AF-01 / AF-02.
- AF-01 sub-box below-left of Step 4 with a short dashed-blue loop-back up to Step 4; AF-02 sub-box below-right of Step 4, its "Hủy" loop-back also returning to Step 4.
- EF-01 sub-box below Step 2.
- End 1 right of AF-02c; End 2 right of Step 4; End 3 right of/below EF-01.
- Orthogonal right-angle routing only; no long diagonals; no crossing over unrelated boxes.

=== VISUAL STYLE ===
- Standard BPMN 2.0. Start filled circle; End thick border; Task rounded rect; Gateway diamond X.
- Main flow solid black; AF (incl. loop-backs) dashed blue; EF dashed red.
- Legend bottom-left. Step numbers visible. Vietnamese labels.

=== DO NOT INCLUDE ===
- Any node where CRM directly updates the product's side of the key — product team updates it themselves (BR-07).
- The raw key value anywhere on the diagram — keys are masked by default (BR-04).
- Certificate / TLS / infrastructure security topics — out of scope for this screen.

=== END EVENTS LEGEND (bottom-right box, title "KẾT THÚC (END EVENTS)") ===
1. End 1 — Đã xoay khóa (khóa cũ còn ân hạn, đã ghi Audit log)
2. End 2 — Ở lại màn (xem, không thay đổi)
3. End 3 — Từ chối (403) — EF-01, không đủ quyền
```

---

## UC-USR-01 — Người dùng & phân quyền

```
Create a BPMN 2.0 swimlane diagram for the "Users & Permissions" (Người dùng & phân quyền) feature of
OneCRM — a B2B CRM for cybersecurity products. This is a 100% READ-ONLY reference screen: a list of
accounts and a role-vs-capability matrix. Account administration is handled by the company-wide
identity system, NOT here — there is no create / edit / delete action anywhere on this screen.

=== SWIMLANES ===
Pool: "UC-USR-01 — Người dùng & phân quyền"
Lane 1: User (License Admin / Manager / Auditor)
Lane 2: System

=== TRIGGER (note above Start Event) ===
Bấm menu "Người dùng & phân quyền" (nhóm Hệ thống).

=== MAIN FLOW ===
Step 1  [User]    Start Event → Task "Mở menu 'Người dùng & phân quyền'"
Step 2  [System]  Gateway (Exclusive) "Có quyền users:view?"
  → Có (License Admin / Manager / Auditor) → tiếp Step 3
  → Không (Sales / CSKH) → Exception Flow EF-01 (→ End 2)
Step 3  [System]  Task "Render danh sách tài khoản (tên · email · vai trò) + ma trận quyền theo vai trò"
Step 4  [User]    Task "Xem / cuộn danh sách và ma trận — không có thao tác ghi"
→ End (End 1 — Ở lại màn, chỉ xem)

=== EXCEPTION FLOW EF-01: Không có quyền ===
Triggered from Step 2 (NO path) — Sales / CSKH
EF-01a  [System]  Task "Menu không hiển thị với Sales / CSKH; gọi thẳng API → 403"
→ End (End 2 — Từ chối, không đủ quyền)

=== NO ALTERNATE FLOW ===
Màn hoàn toàn chỉ đọc — không có luồng phụ. Do NOT invent any AF, edit dialog, or write action.

=== NODE INTEGRITY RULES (critical) ===
- MUST contain EXACTLY: Start Event, Step 1–4, EF-01a, End 1, End 2. No extra/duplicate nodes.
- Do NOT add ANY create / edit / delete / assign-role node or button — the screen is read-only in this phase (BR-02).
- Do NOT add a filter / search node — the screen has none.
- 1 NODE = 1 LANE (see LANE ASSIGNMENT).
- Keep labels concise; adequate spacing for full Vietnamese text.

=== LANE ASSIGNMENT (critical) ===
- USER lane (top band): Start Event, Step 1, Step 4.
- SYSTEM lane (bottom band): Step 2 gateway, Step 3, EF-01a.
- End 1 right of Step 4 (User band); End 2 right of/below EF-01 (System band).

=== LAYOUT RULES (critical) ===
- Do NOT force all nodes onto one horizontal line — zig-zag between bands per LANE ASSIGNMENT: Step 1 (User) ↓ Step 2 (System) → Step 3 (System) ↑ Step 4 (User).
- Cross-lane flows cross the divider VERTICALLY (orthogonal).
- EF-01 sub-box directly BELOW Step 2.
- Orthogonal right-angle routing only; no long diagonals; no crossing over unrelated boxes.

=== VISUAL STYLE ===
- Standard BPMN 2.0. Start filled circle; End thick border; Task rounded rect; Gateway diamond X.
- Main flow solid black; EF dashed red; no AF in this UC.
- Legend bottom-left. Step numbers visible. Vietnamese labels.

=== DO NOT INCLUDE ===
- Any account CRUD (tạo / khóa / đổi vai trò) — handled by the company identity system (BR-02).
- Any node that grants or revokes permission — the matrix is reference only (BR-03).
- Sensitive account data beyond name / email / role (BR-04).

=== END EVENTS LEGEND (bottom-right box, title "KẾT THÚC (END EVENTS)") ===
1. End 1 — Ở lại màn (chỉ xem danh sách & ma trận quyền)
2. End 2 — Từ chối (403) — EF-01, Sales / CSKH không có quyền
```
