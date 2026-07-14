# Prompt sinh ảnh BPMN — Module M-03 Subscription Management

> **Cách dùng:** copy code block → dán ChatGPT (chế độ tạo ảnh) → xuất PNG → lưu đè
> `docs/assets/M-03_subscriptions/UC-SUB-03_bpmn.png`. FRS đã trỏ sẵn đường dẫn nên ảnh tự hiển thị.
>
> **Trạng thái (14/07/2026):** ảnh hiện tại **CHƯA ĐẠT** — nhánh "Chuyển tab" vẫn nối vào End 1 và
> nhánh "✏️ Sửa" bị mất. Prompt dưới đây đã chặn cả hai lỗi. **Cần sinh lại.**
>
> Style theo mẫu `docs/frs/catalog/_bpmn_prompts.md`. Các UC khác của M-03 (UC-SUB-01, 02, 04…10)
> chưa có prompt — bổ sung khi cần vẽ lại.

---

## UC-SUB-03 — Chi tiết Subscription *(VẼ LẠI — ảnh cũ đã lỗi thời)*

> **Vì sao phải vẽ lại:** (1) nhánh **"Chuyển tab" đang nối thẳng vào End 1** — sai, chuyển tab là **loop ở lại trang**; (2) có **hai "End 6"**; (3) nội dung tab License còn là thiết kế cũ (`subRenderLicense`, "quota/bar chart", "Mismatch >15ph SLA") — nay tab đã đổi tên **License & Usage** và dùng **component chung với UC-LIC-02**, ngưỡng SLA **đọc từ cấu hình sản phẩm**, không hardcode 15 phút.

```
Create a BPMN 2.0 swimlane diagram for the "Subscription Detail" (Chi tiết Subscription) feature
of OneCRM — a B2B CRM for cybersecurity products (EDR / C-Shield / Antivirus / CA).
This is a READ-ONLY hub page with 4 tabs; every write action only NAVIGATES to another use case.

=== SWIMLANES ===
Pool: "UC-SUB-03 — Chi tiết Subscription"
Lane 1: User  (Sales / CSKH / License Admin / Manager / Auditor)
Lane 2: System

=== ENTRY POINTS (note above Start Event) ===
(a) Click vào row subscription từ Danh sách (UC-SUB-01)
(b) Hệ thống tự điều hướng sau khi tạo thành công (UC-SUB-02)
Tiền điều kiện: có quyền subscription:view

=== MAIN FLOW ===
Step 1  [User]    Start Event → Task "Vào trang chi tiết (click row UC-SUB-01 hoặc auto-redirect sau tạo)"
Step 2  [System]  Gateway (Exclusive) "Subscription tồn tại?"
  → Có    → tiếp Step 3
  → Không → Exception Flow EF-01 (→ End 9)
Step 3  [System]  Task "Render breadcrumb + banner nháp (nếu là bản nháp) + hero (mã, badge trạng thái, tên KH, nút hành động theo vai trò & trạng thái) + thanh 4 tab"
Step 4  [System]  Task "Render tab mặc định 'Thông tin chung': các trường, link hợp đồng, link khách hàng, chuỗi gia hạn (nếu có)"
Step 5  [User]    Task "Chọn một thao tác trên trang"
Step 6  [System]  Gateway (Exclusive) "Loại thao tác?" — fan ra các nhánh:
  → "Chuyển tab (License & Usage / Timeline / Nhật ký)" → AF-01 / AF-02 / AF-03 → LOOP quay lại Step 5
  → "Click link Hợp đồng"      → AF-04 → End 6 (UC-CON-03)
  → "Click link Khách hàng"    → AF-05 → End 7 (UC-CUS-03)
  → "✏️ Sửa" (chỉ khi nháp)     → End 1 (UC-SUB-04)
  → "✅ Xác nhận" (chỉ khi nháp) → End 2 (UC-SUB-05)
  → "🗑️ Xoá" (chỉ khi nháp)     → End 3 (UC-SUB-06)
  → "🔄 Gia hạn"               → End 4 (UC-SUB-07)
  → "⊘ Thu hồi / ⏸ Tạm dừng / ▶ Khôi phục" → End 5 (UC-SUB-08 / 09 / 10)
  → "← Quay lại / breadcrumb"  → End 8 (UC-SUB-01)

=== ALTERNATE FLOW AF-01: Chuyển tab "License & Usage" (loop — ở lại trang) ===
Triggered at Step 6
AF-01a  [User]    Task "Nhấn tab 'License & Usage'"
AF-01b  [System]  Task "Render bằng COMPONENT DÙNG CHUNG với UC-LIC-02: cảnh báo (nếu có) → khối Trạng thái license + Mức sử dụng → Thông tin từ sản phẩm (chỉ khi sản phẩm có metadata riêng) → hàng hành động theo ngữ cảnh (Đồng bộ lại · Xem tiến độ triển khai · Mở trang quản trị sản phẩm — KHÔNG có nút Gia hạn, nút này nằm ở Hero)"
→ LOOP: mũi tên quay lại Step 5. KHÔNG tạo End Event.

=== ALTERNATE FLOW AF-02: Chuyển tab "Timeline" (loop) ===
AF-02a  [User]    Task "Nhấn tab 'Timeline'"
AF-02b  [System]  Task "Render sự kiện theo thời gian giảm dần (mới nhất lên đầu)"
→ LOOP: quay lại Step 5. KHÔNG tạo End Event.

=== ALTERNATE FLOW AF-03: Chuyển tab "Nhật ký hoạt động" (loop) ===
AF-03a  [User]    Task "Nhấn tab 'Nhật ký hoạt động'"
AF-03b  [System]  Task "Render bảng nhật ký 6 cột: Thời gian | Nguồn | Người thực hiện | Hành động | Chi tiết | Kết quả"
→ LOOP: quay lại Step 5. KHÔNG tạo End Event.

=== ALTERNATE FLOW AF-04 / AF-05: Điều hướng chéo ===
AF-04a  [User]  Task "Click link mã hợp đồng"    → End 6 (UC-CON-03)
AF-05a  [User]  Task "Click link tên khách hàng" → End 7 (UC-CUS-03)

=== EXCEPTION FLOW EF-01: Subscription không tồn tại ===
Triggered from Step 2
EF-01a  [System]  Task "Thông báo ngắn 'Không tìm thấy subscription'"
EF-01b  [System]  Task "Giữ nguyên màn danh sách UC-SUB-01, KHÔNG điều hướng"
→ End 9

=== NODE INTEGRITY RULES (critical) ===
- MỖI End Event CHỈ ĐƯỢC VẼ MỘT LẦN, là MỘT vòng tròn duy nhất. Nếu nhiều đường cùng dẫn tới
  một End, cho các mũi tên HỘI TỤ vào đúng vòng tròn đó — TUYỆT ĐỐI không vẽ thêm một vòng tròn End
  thứ hai mang cùng số. (Bản vẽ trước bị lỗi này: End 1 / End 2 / End 3 / End 4 bị vẽ hai lần ở hai
  chỗ khác nhau.)
- EXACTLY one node per listed item: Start, Step 1–6, AF-01a/b, AF-02a/b, AF-03a/b, AF-04a, AF-05a,
  EF-01a/b, and End 1..End 9. No extra/bridge nodes.
- CÁC NHÁNH CHUYỂN TAB (AF-01/02/03) LÀ LOOP: mũi tên quay TRỰC TIẾP về node "Step 5" đã có.
  Chúng KHÔNG nối vào bất kỳ End Event nào và KHÔNG sinh node mới.
  ⛔ LỖI ĐÃ LẶP LẠI HAI LẦN — KIỂM TRA KỸ: nhánh "Chuyển tab" KHÔNG ĐƯỢC nối vào End 1 (hay bất kỳ
  End nào). End 1 CHỈ đến từ nhánh "✏️ Sửa".
- Gateway Step 6 có ĐÚNG 9 nhánh ra, và nhánh "✏️ Sửa" LÀ BẮT BUỘC — bản vẽ trước **làm mất hẳn**
  nhánh này rồi lấy "Chuyển tab" chiếm chỗ của nó. Danh sách nhánh (đếm đủ 9):
  (1) Chuyển tab → LOOP về Step 5 · (2) ✏️ Sửa → End 1 · (3) ✅ Xác nhận → End 2 ·
  (4) 🗑️ Xoá → End 3 · (5) 🔄 Gia hạn → End 4 · (6) ⊘ Thu hồi / ⏸ Tạm dừng / ▶ Khôi phục → End 5 ·
  (7) Click link Hợp đồng → End 6 · (8) Click link Khách hàng → End 7 · (9) ← Quay lại → End 8.
- Nhãn trên nhánh PHẢI khớp với bảng legend: nếu legend ghi "End 1 = UC-SUB-04 (Chỉnh sửa)" thì nhánh
  dẫn tới End 1 phải mang nhãn "✏️ Sửa", không phải nhãn nào khác.
- Every End number is UNIQUE — exactly one End 1 … one End 9. No two End events share a number.
  (Bản vẽ cũ có hai "End 6".)
- Keep every box label concise (≤ ~12 words) so all Vietnamese text renders fully.

=== LANE INTEGRITY RULES (critical) ===
- Lane label MUST match the actor of every task inside it. Render/guard tasks → lane "System".
  Click/nhấn tasks → lane "User". Do NOT swap lanes.

=== LAYOUT RULES (critical) ===
- ⚠️ LANE THẮNG LAYOUT: luồng chính chạy TỪ TRÁI SANG PHẢI, nhưng VỊ TRÍ DỌC của mỗi node do
  LANE của nó quyết định — KHÔNG phải do việc canh cho thẳng hàng. Node của System phải nằm TRONG
  lane System kể cả khi điều đó làm luồng chính gấp khúc lên/xuống qua ranh giới lane. Đường gấp khúc
  qua lane là ĐÚNG và MONG ĐỢI. TUYỆT ĐỐI KHÔNG kéo một node sang lane sai chỉ để giữ nó thẳng hàng
  với node trước. (Bản vẽ trước bị lỗi này: các task hệ thống bị dồn hết lên lane người dùng cho thẳng hàng.)
- Main flow (Start → Step 1 → Step 2 → Step 3 → Step 4 → Step 5 → Step 6) chạy left-to-right; vị trí dọc
  của từng node do LANE của nó quyết định (Step 2/3/4 là System → nằm trong lane System).
- The 9 End events fan out to the RIGHT of Step 6, stacked vertically, each with its own short
  orthogonal branch — no long diagonals, no crossing.
- The 3 tab sub-flows sit directly BELOW Step 6 with compact right-angle loop-back arrows to Step 5.
- EF-01 sits directly BELOW Step 2.

=== VISUAL STYLE ===
- Standard BPMN 2.0. Main flow = solid black; AF = dashed blue; EF = dashed red. Step-number badges on
  each box and gateway. Vietnamese labels. Legend bottom-left.
- Annotation box (top-right) titled "HIỂN THỊ NÚT HÀNH ĐỘNG (theo vai trò & trạng thái)":
  • ✅ Xác nhận / ✏️ Sửa / 🗑️ Xoá : chỉ khi là bản nháp
  • ⊘ Thu hồi : Manager & License Admin, khi đang hiệu lực / tạm dừng / chờ kích hoạt
  • 🔄 Gia hạn : khi đang hiệu lực / tạm dừng / hết hạn
  • ⏸ Tạm dừng : Sales & Manager, khi đang hiệu lực
  • ▶ Khôi phục : Sales & Manager, khi đang tạm dừng
  • ← Quay lại : luôn hiện

=== DO NOT INCLUDE ===
- KHÔNG vẽ chi tiết bên trong các UC được điều hướng tới (UC-SUB-04…10, UC-CON-03, UC-CUS-03).
- KHÔNG vẽ nội dung chi tiết của tab License & Usage — nó là component dùng chung, đặc tả đầy đủ nằm
  ở UC-LIC-02 §3. Chỉ vẽ MỘT node AF-01b nói rõ "dùng chung với UC-LIC-02".
- KHÔNG ghi ngưỡng SLA lệch trạng thái bằng số cứng (ví dụ "15 phút") — ngưỡng đọc từ cấu hình sản phẩm.
- KHÔNG biến nhánh chuyển tab thành End Event.
- KHÔNG vẽ nút "Gia hạn" bên trong tab License & Usage — nút Gia hạn CHỈ nằm ở Hero (chốt 14/07/2026:
  một hành động chỉ xuất hiện một chỗ trên cùng một màn).

=== END EVENTS LEGEND (bottom-right box, title "KẾT THÚC (END EVENTS)") ===
1. End 1 — UC-SUB-04 (Chỉnh sửa): Step 6, ✏️ Sửa khi là bản nháp.
2. End 2 — UC-SUB-05 (Xác nhận): Step 6, ✅ Xác nhận khi là bản nháp.
3. End 3 — UC-SUB-06 (Xoá nháp): Step 6, 🗑️ Xoá khi là bản nháp.
4. End 4 — UC-SUB-07 (Gia hạn): Step 6, 🔄 Gia hạn.
5. End 5 — UC-SUB-08 / 09 / 10 (Thu hồi / Tạm dừng / Khôi phục): Step 6, theo vai trò & trạng thái.
6. End 6 — UC-CON-03 (Chi tiết hợp đồng): AF-04, click link hợp đồng.
7. End 7 — UC-CUS-03 (Khách hàng 360°): AF-05, click link khách hàng.
8. End 8 — UC-SUB-01 (Về danh sách): Step 6, ← Quay lại / breadcrumb.
9. End 9 — Ở lại danh sách: EF-01, subscription không tồn tại.

Output as a Mermaid flowchart code block if image generation is not available, using subgraph for swimlanes.
```
