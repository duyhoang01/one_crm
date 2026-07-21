# Prompt sinh ảnh BPMN — Module M-08 Audit & Notification

> **Cách dùng:** copy code block → dán ChatGPT (chế độ tạo ảnh) → xuất PNG → lưu đè
> `docs/assets/M-08_audit_notification/UC-XXX-NN_bpmn.png`. FRS §2 đã trỏ sẵn đường dẫn nên ảnh tự hiển thị.
>
> Style theo mẫu `docs/frs/catalog/_bpmn_prompts.md` (Template A — ChatGPT tạo ảnh, swimlane text-spec).
> Nếu ChatGPT không gen được ảnh, thêm dòng cuối prompt: *Output as a Mermaid flowchart code block if image generation is not available, using subgraph for swimlanes.*

---

## UC-AUD-01 — Tra cứu Audit log

```
Create a BPMN 2.0 swimlane diagram for the "Audit Log Search" (Tra cứu Audit log) feature of
OneCRM — a B2B CRM for cybersecurity products (EDR/EPP/C-Shield/AV/CA). This is a READ-ONLY
cross-entity investigation screen (filter + search over an append-only audit log); every write
action only NAVIGATES to another use case. The audit records themselves can never be edited.

=== SWIMLANES ===
Pool: "UC-AUD-01 — Tra cứu Audit log"
Lane 1: User (License Admin / Manager / Auditor)
Lane 2: System

=== TRIGGER (note above Start Event) ===
Click menu "Audit log" (nhóm Hệ thống). Tiền điều kiện: có quyền audit:view.

=== MAIN FLOW ===
Step 1  [User]    Start Event → Task "Mở menu Audit log"
Step 2  [System]  Gateway (Exclusive) "Có quyền audit:view?"
  → Có    → tiếp Step 3
  → Không → Exception Flow EF-01 (→ End 3)
Step 3  [System]  Task "Lọc mặc định 30 ngày qua; tính KPI theo khoảng (tổng / thất bại / thao tác nhạy cảm); render bảng 7 cột — cột 'Chi tiết' (before → after + lý do) hiển thị SẴN trong cột — + sticky header"
Step 4  [User]    Gateway (Exclusive) "Thao tác?" — fan-out 3 branches:
  → Thu hẹp bộ lọc (đổi khoảng thời gian / chọn đối tượng / chọn người thực hiện / tìm nội dung / chip 'Chỉ thất bại'): Alternate Flow AF-01
  → Bấm liên kết ở cột Đối tượng: End (End 2 — Mở màn hồ sơ đối tượng)
  → Không thao tác: End (End 1 — Ở lại màn điều tra)

=== ALTERNATE FLOW AF-01: Thu hẹp & lọc lại ===
Triggered from Step 4 (thao tác lọc / tìm)
AF-01a  [User]    Task "Đổi khoảng thời gian / đối tượng / người thực hiện / từ khoá / chip 'Chỉ thất bại'"
AF-01b  [System]  Task "Cập nhật CHỈ phần kết quả + KPI (giữ focus ô tìm); hiển thị x/y bản ghi. Nếu không có bản ghi khớp → empty state (icon 🔍 + gợi ý 'mở rộng khoảng thời gian hoặc bỏ bớt điều kiện lọc')"
→ Loop back to Step 4 (ở lại màn, KHÔNG tạo End Event)

=== EXCEPTION FLOW EF-01: Không có quyền ===
Triggered from Step 2 (NO path) — vai trò Sales/CSKH
EF-01a  [System]  Task "Hiển thị màn 'Không có quyền'; API trả 403"
→ End (End 3 — Từ chối, không đủ quyền)

=== NODE INTEGRITY RULES (critical) ===
- The diagram MUST contain EXACTLY: Start Event, Step 1–4, AF-01a, AF-01b, EF-01a, End 1, End 2, End 3. Do NOT synthesize or duplicate any node.
- There is NO row-click-to-expand interaction: the "Chi tiết" (before → after + lý do) is ALWAYS visible in its column — do NOT add any task/branch for expanding a row.
- Step 4 has 3 branches: ONE dashed-blue to AF-01 (loop), ONE solid-black to End 2, ONE solid-black to End 1. Do NOT omit or merge branches.
- AF-01 loops back to Step 4 (dashed blue) — it is NOT terminal; the empty state is a visual outcome INSIDE AF-01, not a separate End.
- Keep labels concise (≤12 words); space nodes so Vietnamese text renders fully.

=== LAYOUT RULES (critical) ===
- Main-flow nodes Start → Step 1 → Step 2 → Step 3 → Step 4 on ONE straight horizontal lane, left to right.
- AF-01 sub-diagram directly BELOW Step 4 (AF-01a in User lane, AF-01b in System lane); short dashed-blue loop-back arrow up to Step 4.
- EF-01 sub-diagram directly BELOW Step 2.
- End 1 and End 2 to the right of Step 4, stacked compactly; End 3 to the right of/below EF-01.
- Connector lines never cross unrelated boxes; orthogonal right-angle routing only.

=== VISUAL STYLE ===
- Standard BPMN 2.0. Start = filled circle; End = thick border circle; Task = rounded rect; Gateway = diamond with X.
- Main flow: solid black arrows. Alternate (AF, incl. loop-back): dashed blue. Exception (EF): dashed red.
- Legend in bottom-left (Sequence Flow, Alternate Flow, Exception Flow, Gateway, User Task, System Task, Start/End Event).
- Step numbers visible on each numbered task/gateway. Language: Vietnamese for all labels.

=== DO NOT INCLUDE ===
- Any edit/delete of audit records — the log is append-only (BR-02); no form/modal.
- The "Toàn vẹn dữ liệu / kiểm tra chuỗi hash" tab (FR-AUD-03) — out of scope, đã bỏ khỏi demo.
- Technical terms hash/SHA256/event-code on any box — use business language.

=== END EVENTS LEGEND (bottom-right box, title "KẾT THÚC (END EVENTS)") ===
1. End 1 — Ở lại màn điều tra — không thao tác / sau xem chi tiết
2. End 2 — Mở màn hồ sơ đối tượng (KH / HĐ / Subscription / Gói / License) — liên kết chéo
3. End 3 — Từ chối (403) — EF-01, không đủ quyền
```

---

## UC-NOT-01 — Hộp thư & thông báo trong ứng dụng

```
Create a BPMN 2.0 swimlane diagram for the "In-app Inbox & Bell" (Hộp thư & thông báo trong ứng
dụng) feature of OneCRM — a B2B CRM for cybersecurity products. Users receive & read COMMERCIAL
notifications (renewal / activation / suspend / grace) addressed to them, via a bell dropdown and
a full inbox. READ-ONLY except marking read; entity links only NAVIGATE out.

=== SWIMLANES ===
Pool: "UC-NOT-01 — Hộp thư & thông báo trong ứng dụng"
Lane 1: User (Mọi vai trò)
Lane 2: System

=== TRIGGER (note above Start Event) ===
(a) Bấm chuông 🔔 trên thanh trên cùng
(b) Mở menu "Thông báo" → tab "Hộp thư của tôi"

=== MAIN FLOW ===
Step 1  [User]    Start Event → Task "Bấm chuông (bảng xổ) HOẶC mở menu Thông báo → tab Hộp thư của tôi"
Step 2  [System]  Task "Lọc thông báo theo VAI TRÒ người nhận của người dùng hiện tại (quyết định theo vai trò, KHÔNG theo số lượng)"
Gateway (unnumbered — no badge) "Vai trò có nhận thông báo thương mại?"
  → Không (License Admin / Auditor) → Alternate Flow AF-02
  → Có → tiếp Step 3
Step 3  [System]  Task "Render danh sách (chuông: vài mục gần nhất; hộp thư: đầy đủ); chấm xanh = chưa đọc; badge số chưa đọc"
Step 4  [User]    Gateway (Exclusive) "Thao tác?" — fan-out 4 branches:
  → Bấm 1 thông báo: Alternate Flow AF-01
  → "Đánh dấu tất cả đã đọc" (ở bảng xổ chuông là nút "Đọc hết"): tiếp Step 5
  → "Xem tất cả →" (CHỈ có ở bảng xổ chuông): End (End 2 — Mở Hộp thư đầy đủ)
  → Không thao tác: End (End 1 — Ở lại)
Step 5  [System]  Task "Đánh dấu tất cả thông báo là đã đọc; cập nhật badge chưa đọc + tắt chấm đỏ chuông"
→ loop back to Step 4 (ở lại màn, danh sách đã đọc hết)

=== ALTERNATE FLOW AF-01: Mở 1 thông báo ===
Triggered from Step 4 (bấm 1 thông báo)
AF-01a  [System]  Task "Đánh dấu thông báo đã đọc; cập nhật badge"
AF-01b  [User]    Gateway (Exclusive) "Bấm liên kết đối tượng?"
  → Có   → End (End 3 — Mở màn hồ sơ đối tượng liên quan)
  → Không → Loop back to Step 4 (ở lại)

=== ALTERNATE FLOW AF-02: Vai trò không nhận thông báo thương mại ===
Triggered from the unnumbered gateway (NO path) — License Admin / Auditor
AF-02a  [System]  Task "Hiển thị empty-state giải thích: vai trò này không nhận thông báo thương mại; xem toàn cảnh ở 'Lịch sử gửi'; gợi ý đổi vai trò để xem hộp thư nhận"
→ End (End 4 — Empty-state theo vai trò)

=== NODE INTEGRITY RULES (critical) ===
- MUST contain EXACTLY: Start Event, Step 1–5, unnumbered "Vai trò có nhận thông báo thương mại?" gateway, AF-01a/AF-01b, AF-02a, End 1–4. No extra/duplicate nodes.
- The unnumbered gateway decides by ROLE (License Admin / Auditor do not receive) — NOT by item count. It has NO badge.
- Step 4 has 4 branches: 1 dashed-blue to AF-01, 1 solid to Step 5, 1 solid to End 2, 1 solid to End 1.
- Step 5 (đánh dấu tất cả đã đọc) LOOPS BACK to Step 4 — it is NOT terminal (user vẫn ở màn).
- AF-01b's "Không" branch loops back to Step 4 (dashed blue), not terminal.
- The inbox chip filter "Tất cả / Chưa đọc" is a view-toggle (below process altitude) — do NOT model it as a separate process node.
- 1 NODE = 1 LANE: each task/gateway belongs to exactly ONE actor lane (see LANE ASSIGNMENT). NEVER render a System node inside the User band, or a User node inside the System band.
- Keep labels concise; adequate spacing for full Vietnamese text.

=== LANE ASSIGNMENT (critical — đặt mỗi node ĐÚNG lane của actor) ===
- USER lane (top band): Start Event, Step 1, Step 4 gateway "Thao tác?".
- SYSTEM lane (bottom band): Step 2, the unnumbered gateway "Vai trò có nhận thông báo thương mại?", Step 3, Step 5.
- AF-01 & AF-02 are bordered dashed SUB-BOXES in the lower area (below/around the System band); inside each box the nodes keep their User/System icon (AF-01a = System, AF-01b = User gateway, AF-02a = System).
- End events sit next to the branch that reaches them (see LAYOUT).

=== LAYOUT RULES (critical) ===
- Do NOT force all main-flow nodes onto one horizontal line. The flow moves left→right but SHIFTS between the User (top) and System (bottom) bands according to each step's actor (per LANE ASSIGNMENT) — a correct swimlane zig-zags between lanes.
- A sequence flow between a User node and a System node CROSSES the horizontal lane divider VERTICALLY (orthogonal): Step 1 (User) ↓ Step 2 (System); Step 3 (System) ↑ Step 4 (User); Step 4 (User) ↓ Step 5 (System).
- Step 5 loop-back arrow returns from the System band UP to Step 4 in the User band (short, orthogonal) — do NOT arc it across the whole top of the canvas.
- AF-01 sub-box below Step 4; AF-02 sub-box below the unnumbered gateway.
- End 1 & End 2 to the right of Step 4 (User band), stacked compactly; End 3 right of AF-01; End 4 right of AF-02.
- Orthogonal right-angle routing only; keep cross-lane connectors short; no long diagonals; no crossing over unrelated boxes.

=== VISUAL STYLE ===
- Standard BPMN 2.0. Start filled circle; End thick border; Task rounded rect; Gateway diamond X.
- Main flow solid black; AF (incl. loop-back) dashed blue; no EF in this UC.
- Legend bottom-left. Step numbers visible. Vietnamese labels.

=== DO NOT INCLUDE ===
- Any operational notification (credentials / technical alert) — commercial only (BR-01).
- Channel preference / opt-out settings — Phase 2+ (out of scope).
- The internal send mechanism (queue/worker/retry) — that is UC-NOT-03 / FR-NOT-01, not here.

=== END EVENTS LEGEND (bottom-right box, title "KẾT THÚC (END EVENTS)") ===
1. End 1 — Ở lại (đã đọc / không thao tác)
2. End 2 — Mở Hộp thư đầy đủ — "Xem tất cả →" từ chuông
3. End 3 — Mở màn hồ sơ đối tượng liên quan — bấm liên kết
4. End 4 — Empty-state theo vai trò — AF-02 (Admin/Auditor không nhận thông báo thương mại)
```

---

## UC-NOT-02 — Lịch nhắc gia hạn tự động

```
Create a BPMN 2.0 swimlane diagram for the "Automated Renewal Reminder" (Lịch nhắc gia hạn tự
động) feature of OneCRM — a B2B CRM for cybersecurity products. A daily cron scans subscriptions
approaching expiry and pushes renewal reminders to the right recipients per threshold. Users can
also view the reminder schedule. The main flow is the SYSTEM cron; user-view is an alternate path.

=== SWIMLANES ===
Pool: "UC-NOT-02 — Lịch nhắc gia hạn tự động"
Lane 1: User (Sales / Manager / CSKH — xem lịch)
Lane 2: System (cron)

=== TRIGGER (note above Start Event) ===
(a) Cron tự động 08:00 hằng ngày (gửi nhắc)
(b) User mở menu "Thông báo" → tab "Lịch nhắc gia hạn" (xem lịch)

=== MAIN FLOW (cron — LẶP cho TỪNG subscription) ===
Step 1  [System]  Start Event (Timer ⏰ 08:00) → Task "Quét & lấy danh sách subscription ACTIVE / SUSPENDED (bỏ qua PENDING_PROVISION)"
Step 2  [System]  Gateway (Exclusive) "Còn subscription trong danh sách chưa xử lý?"
  → Không → End (End 1 — Hoàn tất đợt nhắc)
  → Có → tiếp Step 3
Step 3  [System]  Task "Lấy subscription kế tiếp; tính (end_date − hôm nay) — end_date lấy theo license hết hiệu lực thực"
Step 4  [System]  Gateway (Exclusive) "Rơi đúng mốc nhắc?"
  → Không → loop back to Step 2 (bỏ qua sub này → xét sub kế)
  → Có → tiếp Step 5
Step 5  [System]  Gateway (Exclusive) "Đã có gói gia hạn kế tiếp ACTIVE / subscription terminal?"
  → Có → loop back to Step 2 (bỏ qua sub này)
  → Không → tiếp Step 6
Step 6  [System]  Gateway (Exclusive) "Đã nhắc mốc này hôm nay chưa?"
  → Rồi → loop back to Step 2 (bỏ qua, idempotent)
  → Chưa → tiếp Step 7
Step 7  [System]  Task "Xác định người nhận theo mốc (60d: Sales+Manager … 1d: tất cả — đọc từ cấu hình); gửi nhắc gia hạn vào hộp thư người nhận"
→ loop back to Step 2 (đã gửi → xét sub kế)

=== ALTERNATE FLOW AF-01: User xem lịch nhắc ===
Triggered independently by (b) — user mở tab Lịch nhắc gia hạn
AF-01a  [User]    Task "Mở tab 'Lịch nhắc gia hạn'"
AF-01b  [System]  Task "Hiển thị 5 bucket mốc (60/30/14/7/1) + người nhận từng mốc (đọc cấu hình) + KPI (sẽ nhắc / số mốc / lần chạy kế 08:00)"
→ End (End 2 — Xem lịch nhắc, ở lại màn)

=== NODE INTEGRITY RULES (critical) ===
- MUST contain EXACTLY: Start Event (timer), Step 1–7, AF-01a/AF-01b, End 1, End 2. No extra/duplicate nodes. There are ONLY 2 End events.
- This is a LOOP over the scanned list; Step 2 is the loop gateway. The three skip branches (Step 4 "Không", Step 5 "Có", Step 6 "Rồi") and the send (after Step 7) ALL return to Step 2 via loop-back arrows — do NOT turn any of them into a separate End. "Bỏ qua subscription" is a loop-back, NOT a terminal.
- The ONLY terminal of the cron is End 1 (Step 2's "Không còn sub" branch) — reached ONCE when the whole list is processed.
- AF-01 is a SEPARATE, USER-triggered view path (user mở tab); it ends at End 2 and does NOT connect into the cron loop.
- Keep labels concise; adequate spacing for full Vietnamese text.

=== LAYOUT RULES (critical) ===
- Cron main flow Step 1 → Step 2 → Step 3 → Step 4 → Step 5 → Step 6 → Step 7 on ONE horizontal line in the System lane, left to right.
- Loop-back arrows (from Step 4/5/6 skip branches and from Step 7) route BELOW the main line and return leftward to Step 2 — merge the three skip branches into ONE labeled path "bỏ qua sub này" before the loop-back; keep routing orthogonal, do not cross task boxes.
- End 1 sits just below/right of Step 2 (its "Không còn sub" branch).
- AF-01 sub-diagram in a separate area further below, spanning User→System lanes (AF-01a in User lane, AF-01b in System lane), ending at End 2.
- Orthogonal right-angle routing only; no long diagonal lines.

=== VISUAL STYLE ===
- Standard BPMN 2.0. Start = filled circle WITH a small clock/timer icon (⏰) inside; End = thick border; Task = rounded rect; Gateway = diamond X.
- Main flow solid black (incl. loop-back arrows — they are sequence flows within the cron); AF dashed blue; no EF in this UC.
- Legend bottom-left (add "⏰ Timer Start Event" and "⟳ Vòng lặp — xét từng subscription"). Step numbers visible. Vietnamese labels.

=== DO NOT INCLUDE ===
- end_date computed as start_date + duration — end_date always comes from the real license expiry (BR-02).
- Any manual "gửi ngay" send action — this UC is the automatic scheduler only.
- Notification content/body or channel routing detail — belongs to FR-NOT-01, not here.

=== END EVENTS LEGEND (bottom-right box, title "KẾT THÚC (END EVENTS)") ===
1. End 1 — Hoàn tất đợt nhắc — đã xử lý toàn bộ danh sách; đã gửi cho các sub đủ điều kiện (đúng người nhận theo mốc)
2. End 2 — Xem lịch nhắc (ở lại màn) — AF-01, user mở tab
(Lưu ý: "bỏ qua subscription" — không rơi mốc / đã có gói gia hạn / đã nhắc hôm nay — là LOOP-BACK về Step 2, KHÔNG phải End event.)
```

---

## UC-NOT-03 — Lịch sử gửi thông báo

```
Create a BPMN 2.0 swimlane diagram for the "Notification Send History" (Lịch sử gửi thông báo)
feature of OneCRM — a B2B CRM for cybersecurity products. An ADMIN-ONLY read screen listing every
notification the system has sent (all channels, all recipients) with delivery result, for
monitoring and complaint investigation. READ-ONLY; filter + search only.

=== SWIMLANES ===
Pool: "UC-NOT-03 — Lịch sử gửi thông báo"
Lane 1: User (License Admin)
Lane 2: System

=== TRIGGER (note above Start Event) ===
Menu "Thông báo" → tab "Lịch sử gửi" (tab chỉ hiển thị với License Admin).

=== MAIN FLOW ===
Step 1  [User]    Start Event → Task "Mở tab 'Lịch sử gửi'"
Step 2  [System]  Gateway (Exclusive) "Là License Admin?"
  → Có    → tiếp Step 3
  → Không → Exception Flow EF-01 (→ End 2)
Step 3  [System]  Task "Render toàn bộ lịch sử gửi (mọi kênh, mọi người nhận) + thanh lọc: tìm người nhận/mẫu, lọc Kênh, lọc Kết quả"
Step 4  [User]    Gateway (Exclusive) "Thao tác?" — fan-out 2 branches:
  → Tìm / lọc (người nhận/mẫu · Kênh · Kết quả): Alternate Flow AF-01
  → Không thao tác: End (End 1 — Ở lại màn)

=== ALTERNATE FLOW AF-01: Tìm & lọc lịch sử gửi ===
Triggered from Step 4 (thao tác tìm / lọc)
AF-01a  [User]    Task "Tìm theo người nhận/mẫu; lọc Kênh (Email / Trong ứng dụng); lọc Kết quả (Đã gửi / Đang gửi / Thất bại)"
AF-01b  [System]  Task "Cập nhật CHỈ phần kết quả (giữ focus ô tìm); hiển thị x/y; dòng Thất bại kèm lý do (vd hộp thư từ chối, đã thử lại 3 lần, đã cảnh báo vận hành)"
→ Loop back to Step 4 (ở lại màn, KHÔNG tạo End Event)

=== EXCEPTION FLOW EF-01: Phi-admin truy cập ===
Triggered from Step 2 (NO path) — vai trò không phải License Admin
EF-01a  [System]  Task "Tab 'Lịch sử gửi' không hiển thị; gọi thẳng API 'xem tất cả' → 403"
→ End (End 2 — Từ chối, không đủ quyền)

=== NODE INTEGRITY RULES (critical) ===
- MUST contain EXACTLY: Start Event, Step 1–4, AF-01a/AF-01b, EF-01a, End 1, End 2. No extra/duplicate nodes.
- Step 4 is an action gateway: ONE dashed-blue branch to AF-01 (loop), ONE solid-black branch to End 1.
- AF-01 loops back to Step 4 (dashed blue) — it is NOT terminal.
- History rows are NOT clickable (recipient is plain text, no entity link) — do NOT add any row-click / navigate branch.
- Keep labels concise; adequate spacing for full Vietnamese text.

=== LAYOUT RULES (critical) ===
- Main-flow Step 1 → Step 2 → Step 3 → Step 4 on ONE horizontal lane.
- AF-01 sub-diagram directly BELOW Step 4 (AF-01a in User lane, AF-01b in System lane); short dashed-blue loop-back arrow up to Step 4.
- EF-01 sub-diagram directly BELOW Step 2.
- End 1 to the right of Step 4; End 2 right of/below EF-01.
- Orthogonal right-angle routing; no crossing over unrelated boxes.

=== VISUAL STYLE ===
- Standard BPMN 2.0. Start filled circle; End thick border; Task rounded rect; Gateway diamond X.
- Main flow solid black; loop-back dashed blue; Exception (EF) dashed red.
- Legend bottom-left. Step numbers visible. Vietnamese labels.

=== DO NOT INCLUDE ===
- Any per-user "own inbox" view — that is UC-NOT-01 (this screen is admin, all sends).
- A manual "gửi lại" (resend) action — out of scope OQ (retry runs in background).
- The internal queue/worker mechanics as tasks — describe result only, not implementation.

=== END EVENTS LEGEND (bottom-right box, title "KẾT THÚC (END EVENTS)") ===
1. End 1 — Ở lại màn (xem / lọc lịch sử gửi)
2. End 2 — Từ chối (403) — EF-01, phi-admin truy cập
```
