# Checklist Review FRS

> Áp dụng cho mỗi file FRS trước khi chuyển trạng thái từ **Draft** → **Ready for Dev**.
> Claude tự review và đánh dấu. Bạn bổ sung thêm rule tại mục 5.

---

## 1. Thông tin chung

- [ ] UC ID đúng format `UC-{MOD}-{NN}`
- [ ] Tên tính năng nhất quán với module map
- [ ] Đủ 4 trường: Tác nhân, Tiền điều kiện, Hậu điều kiện (success + failure), Ngoại lệ
- [ ] Mỗi Business Rule có mã `BR-{NN}` riêng. mỗi BR trên 1 dòng
- [ ] Phiên bản và ngày cập nhật chính xác

## 2. Luồng nghiệp vụ

- [ ] Luồng chính bao phủ đầy đủ happy path end-to-end
- [ ] Mỗi bước có Actor rõ ràng (Sales / System / Manager)
- [ ] Các luồng phụ (AF) được định nghĩa đầy đủ
- [ ] Các luồng ngoại lệ (EF) có mã riêng và hướng giải quyết
- [ ] Business Rules được trích dẫn tại bước liên quan
- [ ] Không có bước "mồ côi" (bước không kết nối với luồng chính)

## 3. Giao diện

- [ ] Wireframe ASCII đủ chi tiết để dev hình dung layout
- [ ] Bảng thành phần giao diện liệt kê đủ UI elements quan trọng
- [ ] Trạng thái loading/disabled của buttons được ghi rõ
- [ ] Error messages được định nghĩa cụ thể (text chính xác)
- [ ] Tham chiếu đúng file demo HTML

## 4. Acceptance Criteria

- [ ] Mỗi Business Rule có ít nhất 1 AC tương ứng
- [ ] AC dùng đúng format Given / When / Then
- [ ] Có AC cho happy path
- [ ] Có AC cho các trường hợp lỗi quan trọng (EF)
- [ ] AC ID đúng format `AC-{MOD}-{NN}-{XX}`

## 5. Quy tắc bổ sung (bạn cập nhật)

- Với các mục cần tách ý, hãy xuống dòng để dễ đọc
- Với các step dạng: Yes và No thì mỗi ý trình bày trên một dòng
- Các giá trị tại cột "Bước" phải mapping với ký hiệu step trên BPMN, không chấp nhận các step dạng: Nx, Nx+1, Nx+2
# OneCRM FSD/SRS — Checklist Review Tài liệu cho AI

> Tổng hợp từ toàn bộ feedback của BA trong quá trình viết và review tài liệu
> UC module M-01 (Customer) và M-02 (Contract Management).
> AI phải tự check toàn bộ checklist này TRƯỚC KHI deliver tài liệu.

---

## 1. Cấu trúc & Metadata

- [ ] **File đặt tên đúng convention**: `UC-{MODULE}-{NN}_{Ten_Tinh_Nang}.md` (VD: `UC-CON-03_Them_Moi_Hop_Dong.md`).
- [ ] **Header metadata** đầy đủ: Module · Phiên bản · Ngày · Trạng thái.
- [ ] **Trạng thái** mặc định khi tạo mới: `Draft for Review`.
- [ ] **5 section bắt buộc** theo đúng thứ tự:
  1. Thông tin chung chức năng
  2. Luồng nghiệp vụ (Luồng chính · Luồng phụ · Luồng ngoại lệ)
  3. Mô tả giao diện (Wireframe · Thành phần UI · Field table)
  4. Acceptance Criteria (nhóm theo scenario)
  5. Lịch sử thay đổi
- [ ] **Footer** cuối tài liệu có: Figma link · API contract link · UC liên quan.
- [ ] **UC liên quan** liệt kê đúng số UC đã chốt — không tự đặt số mới.

---

## 2. Mục 1 — Thông tin chung chức năng

- [ ] **Tên chức năng** nhất quán với tên UC ID và tên file.
- [ ] **UC ID** đúng numbering đã chốt trong module (không tự đặt lại).
- [ ] **Mô tả** súc tích 2-4 câu, không lặp lại luồng nghiệp vụ.
- [ ] **Tác nhân** liệt kê đúng persona (Sales / Manager / System...) — không thêm actor không có trong PRD.
- [ ] **Tiền điều kiện** bao gồm: quyền (`permission:action`) + điều kiện data (`entity tồn tại, chưa bị xóa`).
- [ ] **Hậu điều kiện** có 2 nhánh rõ: `(Success)` và `(Failure)`.
- [ ] **Trigger** nếu có nhiều hơn 1 điều kiện → **tách dòng riêng** cho từng trigger: `(1)...` `(2)...` `(3)...` — không viết liền 1 dòng.
- [ ] **Business Rules** đánh số `BR-NN`, mỗi BR 1 dòng, không nhét nhiều rule vào 1 ô bảng.
- [ ] BR nào có nhiều vế `AND/OR` → **tách dòng** bằng `<br>` trong bảng markdown.

---

## 3. Mục 2 — Luồng nghiệp vụ

### 3.1 Format bảng luồng

- [ ] **3 cột bắt buộc**: Bước · Actor · Hành động / Phản hồi.
- [ ] **Bước** đánh số rõ: `1`, `2`, `3`... cho luồng chính; `AF-01a`, `AF-01b`... cho luồng phụ; `EF-01`... cho ngoại lệ.
- [ ] **Số bước mapping** với BPMN diagram nếu có — phải khớp chính xác.
- [ ] **Gateway** format 3 dòng riêng biệt:
  ```
  [Gateway — Câu hỏi?]
  → [Có]: Mô tả nhánh YES
  → [Không]: Mô tả nhánh NO
  ```
  Không viết gateway trên 1 dòng liền.
- [ ] **Bước cuối** của luồng chính có `→ End (Success)` hoặc ghi rõ End Event.

### 3.2 Nội dung luồng

- [ ] **Luồng chính** chỉ mô tả happy path — không nhét xử lý lỗi vào đây.
- [ ] **Luồng phụ (AF)** có ghi rõ: kích hoạt tại step nào của luồng chính.
- [ ] **Luồng ngoại lệ (EF)** có ghi rõ: kích hoạt tại gateway nào.
- [ ] **Mỗi luồng phụ/ngoại lệ** có dòng cuối ghi rõ quay về đâu: `→ Quay lại luồng chính tại step N` hoặc `End (Cancelled)`.
- [ ] **End Events** — nếu có nhiều kết thúc: liệt kê thành bảng riêng `2.4 Kết thúc (End Events)`.
- [ ] **Actor "System"** cho các bước tự động — không để trống hoặc dùng "—" cho bước hệ thống xử lý.

### 3.3 Ngôn ngữ trong luồng

- [ ] **Không dùng từ tiếng Anh** cho hành động UI: `Click` → `Nhấn`, `Submit` → `Nhấn nút`, `Cancel` → `Hủy`.
- [ ] **Tên nút** trong luồng phải khớp chính xác với tên nút trong UI: `"💾 Tạo"`, `"← Quay lại"`, `"＋ Thêm Pool"`.
- [ ] **Toast message** trong luồng phải khớp với text toast thực tế trong demo.

---

## 4. Mục 3 — Mô tả giao diện

### 4.1 Wireframe

- [ ] **Wireframe ASCII** bao gồm các trạng thái chính của form (mặc định · có điều kiện · có lỗi · có file).
- [ ] **Không vẽ wireframe pixel-perfect** — chỉ cần đủ để người đọc hình dung layout.

### 4.2 Bảng thành phần UI

- [ ] **Cột bắt buộc**: # · Thành phần · Loại · Mô tả.
- [ ] **Số thứ tự** trong bảng thành phần được tham chiếu từ AC (VD: `AC-xx-yy` ghi rõ "xem thành phần #7").
- [ ] **Tất cả UI element** có trong demo đều phải được mô tả — không bỏ sót nút/modal/accordion.

### 4.3 Bảng field

- [ ] **Cột bắt buộc**: # · Field · Bắt buộc · Điều kiện hiển thị · Mô tả & Validation.
- [ ] **Điều kiện hiển thị** phải ghi rõ (`Tất cả` / `Reseller only` / `Khi chọn X`...).
- [ ] **Message lỗi** phải ghi đúng text hiển thị trên UI (khớp với demo).
- [ ] **Field immutable** ghi rõ: `Không thể thay đổi sau khi tạo` — không dùng từ "immutable".

---

## 5. Mục 4 — Acceptance Criteria

- [ ] **AC ID** format: `AC-{UC_ID}-{NN}` (VD: `AC-CON-03-01`). Đánh số liên tục, không bỏ số.
- [ ] **Nhóm AC** theo scenario rõ ràng: "Nhóm 1: Tạo thành công — DIRECT", "Nhóm 2: Validate"...
- [ ] **Mỗi AC** có đủ 4 cột: AC ID · Given · When · Then.
- [ ] **Given** mô tả đủ ngữ cảnh để test độc lập (không cần đọc AC khác).
- [ ] **When** là hành động của actor (click/nhập/kéo thả) hoặc `"—"` nếu là trạng thái tĩnh.
- [ ] **Then** ghi kết quả observable (UI thay đổi gì, toast gì, navigate đâu, data lưu gì).
- [ ] **Then** tham chiếu step số nếu có BPMN: `"Steps 12→13→14→15→16→17: ..."`.
- [ ] **AC cover đủ** các case: Happy path · Validation fail · Permission deny · Edge case (giới hạn file, empty state...).
- [ ] **Không viết AC quá chung chung**: `"Hệ thống hoạt động đúng"` → phải cụ thể observable behavior.

---

## 6. Mục 5 — Lịch sử thay đổi

- [ ] **Mỗi lần update** thêm 1 row mới, không sửa row cũ.
- [ ] **Format**: Phiên bản · Ngày · Người cập nhật · Nội dung (gạch đầu dòng những gì đã thay đổi).
- [ ] **Version bump**: patch (1.0→1.1) khi sửa nhỏ; minor (1.x→2.0) khi thay đổi luồng chính.
- [ ] **Không để trống** cột Nội dung — phải ghi cụ thể đã sửa gì.

---

## 7. Ngôn ngữ & Thuật ngữ

- [ ] **Không dùng từ tiếng Anh** nếu có từ tiếng Việt nghiệp vụ tương đương:

| ❌ Không dùng | ✅ Dùng thay |
|---|---|
| immutable | không thể thay đổi sau khi tạo |
| gateway | điểm quyết định / [Gateway] |
| trigger | điều kiện kích hoạt / Trigger |
| submit | nhấn nút / xác nhận |
| cancel | hủy |
| soft delete | xóa mềm |
| hard delete | xóa vĩnh viễn |
| upload | đính kèm / tải lên |
| dropdown | danh sách chọn |
| toast | thông báo ngắn |

- [ ] **Thuật ngữ domain** dùng nhất quán xuyên suốt tài liệu:
  - `KH` = khách hàng
  - `HĐ` = hợp đồng
  - `Sub` = Subscription
  - `pool_total` → `Tổng số license (Total)`
  - `allocated_qty` → `Đã dùng (Used)`
  - `available` → `Còn lại (Available)`

- [ ] **Tên nút** viết đúng như trên UI, có icon nếu UI có: `"💾 Tạo"`, `"🗑️ Xóa"`, `"← Quay lại"`.
- [ ] **UC reference** viết đúng tên + số: `UC-CON-03 (Thêm mới HĐ)` — không chỉ viết số hoặc tên.

---

## 8. Format & Trình bày

- [ ] **Dòng dài trong ô bảng** (nhiều vế, nhiều bước): dùng `<br>` để tách dòng — không viết liền 1 đoạn dài.
- [ ] **Danh sách trong ô bảng**: dùng `—` bullet thay vì `-` (ký tự gạch ngang đẹp hơn trong markdown rendered).
- [ ] **Không dùng bold quá nhiều** — chỉ bold tên field, tên nút, điểm nhấn quan trọng. Không bold toàn câu.
- [ ] **Code/field name** dùng backtick: `contract.code`, `signedDate`, `status=ACTIVE`.
- [ ] **Gateway trong bảng** luôn tách 3 dòng (câu hỏi · [Có] · [Không]) — không viết trên 1 dòng.
- [ ] **Số thứ tự có đánh số rõ** (trigger, tiền điều kiện nhiều vế, BR...) → tách dòng với `(1)`, `(2)`, `(3)`.

---

## 9. Consistency xuyên tài liệu

- [ ] **UC numbering** nhất quán với các file đã tạo trong module — không tự đánh lại số.
- [ ] **AC numbering** không trùng lặp trong cùng 1 UC, không bỏ số.
- [ ] **BR numbering** trong BR table nhất quán với các BR đã reference ở luồng và AC.
- [ ] **Cross-reference** giữa UC đúng: luồng phụ/ngoại lệ của UC này tham chiếu đúng UC kia.
- [ ] **Tên file output** khớp với UC ID và tên tính năng trong header.

---

## 10. Self-review trước khi deliver

AI phải tự kiểm tra các điểm sau trước khi output tài liệu:

- [ ] Đọc lại toàn bộ mục 2 — mỗi Gateway có đủ 3 dòng riêng?
- [ ] Đọc lại mục 1 — Trigger/Tiền điều kiện/BR có dòng dài nào cần tách không?
- [ ] Đọc lại mục 4 — AC nào chưa có Given/When/Then đủ cụ thể?
- [ ] Đọc lại toàn bộ — còn từ "immutable", "submit", "gateway" không được dùng?
- [ ] UC liên quan ở footer có đúng số UC đã chốt không?
- [ ] Lịch sử thay đổi đã có row cho version hiện tại chưa?
- [ ] Tên file output có đúng convention không?

---
