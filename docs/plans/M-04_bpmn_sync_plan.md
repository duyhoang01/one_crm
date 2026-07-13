# Plan — Đồng bộ BPMN ↔ FRS · Module M-04 Product & Package Catalog

> Mục tiêu: review toàn bộ ảnh BPMN của module Catalog, nhúng vào FRS tương ứng, và cập nhật §2 (Luồng nghiệp vụ) theo đúng step thể hiện trên BPMN.
> Cập nhật lần cuối: 10/07/2026

---

## 1. Nguyên tắc áp dụng (đã chốt với BA)

| # | Nguyên tắc |
|---|---|
| 1 | **Step theo BPMN** — số bước, gateway, End Event trong §2 FRS phải khớp badge trên ảnh. |
| 2 | Nếu **FRS ≠ BPMN** → **liệt kê conflict để BA chốt**, KHÔNG tự ý ghi đè. |
| 3 | Nếu **ảnh BPMN có lỗi rõ ràng** (mâu thuẫn demo/BR) → **không ghi đè spec**; flag để render lại. |
| 4 | Ảnh lưu tại `docs/assets/M-04_catalog/UC-CAT-0X_bpmn.png`; FRS đã trỏ sẵn path → tự hiển thị. |
| 5 | Prompt sinh ảnh: `docs/frs/catalog/_bpmn_prompts.md` (style UC-CON-06). Template chuẩn: `.claude/skills/bpmn/PROMPT_TEMPLATES.md`. |

---

## 2. Kết quả review — đối chiếu FRS ↔ BPMN (7 UC)

| UC | Tên | Ảnh BPMN | Đối chiếu §2 | Hành động |
|---|---|---|---|---|
| **UC-CAT-01** | Danh sách Sản phẩm (Kanban) | ✅ Tốt | ⚠️ Ảnh có **thêm Gateway "Catalog có sản phẩm?"** + tách task Tải/Render (FRS gốc gộp 1 bước) | ✅ **Đã sửa §2 theo ảnh** |
| **UC-CAT-02** | Chi tiết Sản phẩm | ✅ Tốt | ✅ Khớp (bước 1–6; gateway ② "Sản phẩm tồn tại?", ⑥ "Loại thao tác?"; AF-01/02 loop; EF-01 → End 3) | ✅ Nhúng ảnh |
| **UC-CAT-03** | Danh sách Gói sản phẩm | ✅ Tốt *(đã render lại)* | ✅ Khớp (8 step; gateway ④ "Có kết quả phù hợp?", ⑧ "Loại thao tác?" fan 7 nhánh; AF-01 có gateway con "Còn kết quả?", AF-02; EF-01 có gateway "Nhấn ＋Tạo gói?"; End 1–6) | ✅ Nhúng ảnh |
| **UC-CAT-04** | Chi tiết Gói sản phẩm | ✅ Tốt | ✅ Khớp (bước 1–6; gateway ② ⑥; **8 End Event**, 4 nút vòng đời tách riêng; AF-01/02/03; EF-01 → End 8) | ✅ Nhúng ảnh |
| **UC-CAT-05** | Tạo Gói sản phẩm | ✅ Tốt | ✅ Khớp (7 step; gateway ④ "Step 1 hợp lệ?"; AF-01 Hủy / AF-02 đổi sản phẩm; EF-01 validate loop; End 1 Success / End 2 Cancelled) | ✅ Nhúng ảnh |
| **UC-CAT-06** | Sửa Gói sản phẩm | ✅ Tốt | ✅ Khớp (7 step; gateway ② "Gói RETIRED?", ⑥ "Dữ liệu hợp lệ?", ⑦ clone-on-edit fan 2 End; AF-01; EF-01/02; End 1–4) | ✅ Nhúng ảnh |
| **UC-CAT-07** | Quản lý vòng đời Gói | ✅ Tốt | ✅ Khớp (**4 track** P1–P6 / R1–R6 / D1–D6 / B1–B6; mỗi track: gateway "Người dùng quyết định?" + gateway gộp "Đủ quyền VÀ trạng thái hợp lệ?"; AF-01 → End 5; EF-01 → End 6; EF-02 → End 7; **7 End Events**) | ✅ Nhúng ảnh |

**Tổng kết:** ✅ **7/7 UC đã khớp** — không còn conflict.

---

## 3. Việc đã thực hiện

### Đợt 1 (commit `a5e0bbf`)
- Sinh 16 screenshot demo (puppeteer-core headless) → `docs/assets/M-04_catalog/`, nhúng vào 7 FRS.
- Viết 7 prompt BPMN (`_bpmn_prompts.md`, style UC-CON-06 với NODE INTEGRITY + LAYOUT RULES).
- Nhúng ảnh BPMN UC-CAT-01…04; **sửa §2 UC-CAT-01** theo ảnh (thêm Gateway "Catalog có sản phẩm?", tách task Tải/Render, cập nhật trigger AF-01 + End 3).
- Flag ảnh UC-CAT-03 lỗi; giữ §2 chuẩn.
- Changelog v1.1 cho UC-CAT-01…04.

### Đợt 2
- Review lại toàn bộ 7 ảnh BPMN (đọc từng ảnh, đối chiếu §2 từng UC).
- **Nhúng ảnh BPMN UC-CAT-05 / 06 / 07** (gỡ ghi chú placeholder "chưa tồn tại").
- Xác nhận §2 của 05/06/07 **khớp hoàn toàn** với BPMN → không cần sửa luồng.
- Changelog v1.1 + cập nhật dòng Review Checklist §5 cho UC-CAT-05/06/07.
- Tạo file plan này.

---

### Đợt 3 (lượt này)
- BA **render lại ảnh UC-CAT-03** → review lại: node ma ⑤ đã biến mất, thứ tự sort đúng (⑤ User click header → ⑥ System áp dụng sort), 8 badge khớp 8 step.
- Gỡ dòng cảnh báo trong FRS UC-CAT-03; cập nhật changelog v1.1 + Review Checklist §5.
- ✅ **Conflict duy nhất đã được giải quyết — 7/7 UC khớp.**

---

## 4. ✅ CONFLICT ĐÃ GIẢI QUYẾT — UC-CAT-03 (lưu lại để tham chiếu)

**Bản render ĐẦU của `UC-CAT-03_bpmn.png` đã sai so với prompt (đã render lại, hiện đã đúng):**

| Prompt (8 step, chuẩn) | Ảnh BPMN (9 badge) | Vấn đề |
|---|---|---|
| ① Tải danh sách gói | ① Tải danh sách gói | ✅ |
| ② Nhập từ khoá / lọc | ② Nhập từ khoá / lọc | ✅ |
| ③ Lọc realtime | ③ Lọc realtime | ✅ |
| ④ Gateway "Có kết quả phù hợp?" | ④ Gateway "Có kết quả phù hợp?" | ✅ |
| *(không tồn tại)* | ⑤ **"Render tab mặc định 'Thông tin': card Thông tin sản phẩm + card Thông tin kỹ thuật"** | ❌ **NODE MA** — nội dung của **UC-CAT-02**, bị image-gen "leak" sang. Màn Danh sách Gói là bảng filter/sort/phân trang, **không có tab, không có card thông tin sản phẩm**. |
| ⑤ **User** Click header cột để sort | ⑥ **System** Áp dụng sort | ❌ **đảo nhân quả** — hệ thống sort TRƯỚC khi người dùng bấm |
| ⑥ **System** Áp dụng sort | ⑦ **User** Click header cột để sort | ❌ đảo |
| ⑦ Chọn hành động | ⑧ Chọn hành động | ⚠️ lệch badge |
| ⑧ Gateway "Loại thao tác?" | ⑨ Gateway "Loại thao tác?" | ⚠️ lệch badge |

**Rủi ro nếu đã ghi §2 theo ảnh lỗi:** đặc tả sẽ có 1 bước không tồn tại trong demo + 1 bước đảo ngược logic → sai lệch với `v2.5.0_catalog.html`.

**✅ Cách xử lý (đã thực hiện):** KHÔNG ghi đè §2 theo artifact lỗi. Giữ §2 chuẩn + flag cảnh báo → BA **render lại ảnh** bằng đúng prompt trong `_bpmn_prompts.md` (prompt vốn đúng, chỉ ChatGPT vẽ sai). Bản render mới đã đúng: node ma biến mất, thứ tự sort đúng, 8 badge khớp 8 step → §2 giữ nguyên, chỉ gỡ cảnh báo.

**📌 Bài học (cho pilot AI-driven SDLC):** artifact do AI sinh (ảnh BPMN) **không mặc nhiên là nguồn sự thật**. Khi ảnh mâu thuẫn với spec/demo → **dừng lại, đối chiếu, hỏi** thay vì ghi đè spec. Prompt đúng + render lại rẻ hơn nhiều so với sửa sai đặc tả.

---

## 5. Còn tồn / bước tiếp

| # | Việc | Trạng thái |
|---|---|---|
| 1 | ~~Render lại BPMN UC-CAT-03 → đồng bộ §2 + gỡ cảnh báo~~ | ✅ **Xong** (đợt 3) |
| 2 | **Update PRD** — data model + base lại M-04 theo FRS + changelog rõ cho dev. **Input đầy đủ đã có tại → [`M-04_versioning_decisions.md`](./M-04_versioning_decisions.md)** (11 mục phải sửa, gồm cả M-02/M-03) | ⏸ **Chờ BA ra lệnh** |
| 3 | ~~Chốt Model A vs B (rollback)~~ | ✅ **Đã chốt: Model A (clone-forward)** — xem file quyết định |
| 4 | ~~Gia hạn trên gói RETIRED có được không~~ | ✅ **Đã chốt: ĐƯỢC** (grandfathering, chuẩn thị trường VN) |
| 5 | OQ còn treo: **EOL** (tách RETIRED thương mại ↔ EOL kỹ thuật) · **hint upsell** khi gia hạn gói retired · **`change_note`** + diff version · **on-prem perpetual** | ⏸ Phase sau |
