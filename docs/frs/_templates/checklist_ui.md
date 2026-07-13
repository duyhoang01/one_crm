# Checklist Review UI/UX

> Áp dụng khi review file demo HTML trước khi chốt giao diện module.
> Claude tự review và list open questions. Bạn bổ sung thêm rule tại mục 4.

---

## 1. Design System

- [ ] Màu sắc đúng token: primary `#0268C5`, navy `#1F2533`, text-secondary `#636363`, danger `#FB2C36`
- [ ] Font Inter, font-size nhất quán (14px body, 13px secondary, 12px caption)
- [ ] Border radius nhất quán: `r-sm: 8px`, `r-md: 12px`, `r-lg: 16px`
- [ ] Shadow dùng đúng biến: `shadow-md`, `shadow-lg`
- [ ] Spacing nhất quán với module đã có (Customer)

## 2. Components

- [ ] Badges dùng đúng màu theo loại (B2B, Reseller, B2C, Other; contract status)
- [ ] Buttons có đủ states: default, hover, disabled, loading
- [ ] Form fields có focus state: border `#0268C5` + box-shadow `rgba(2,104,197,.1)`
- [ ] Empty states có icon + message + CTA
- [ ] Toast notifications nhất quán (success green, error red, info navy)
- [ ] Modals có animation `modal-in`, ESC close, backdrop click close

## 3. UX

- [ ] Destructive actions (xóa) có bước xác nhận
- [ ] Form validation hiển thị lỗi inline dưới field
- [ ] Table có sort, search, filter, pagination
- [ ] Loading state ngăn double-submit
- [ ] Breadcrumb đúng với context hiện tại
- [ ] Sidebar active state đúng khi navigate

## 4. Quy tắc bổ sung (bạn cập nhật)

<!-- Thêm rule tại đây -->
- Những thông tin mô tả của BR không được thể hiện dưới dạng text trên file demo mà phải chuyển thể thành giao diện, hình ảnh, icon thân thiện với người dùng
# OneCRM Demo HTML — Checklist UI/UX cho tính năng mới

> Tổng hợp từ toàn bộ feedback của BA trong quá trình build module M-01 và M-02.
> Áp dụng bắt buộc khi build bất kỳ tính năng mới nào trong demo HTML.

---

## 1. Màn danh sách (List View)

- [ ] **Không có stats row mặc định** — chỉ thêm stat card nếu có BR hoặc UC rõ ràng yêu cầu. Không tự thêm vì "trông hay hơn".
- [ ] **Phân trang** đúng PAGE_SIZE theo spec (mặc định 10 bản ghi/trang). Không hiện tất cả records trên 1 trang.
- [ ] **Sort mặc định** theo `createdAt DESC` — bản ghi mới nhất lên đầu.
- [ ] **Các cột sortable** hiển thị icon `↕` (neutral) → `↑`/`↓` (active, màu primary) khi click. Chỉ sort các field có giá trị scalar rõ ràng.
- [ ] **Filter** chỉ thêm các option có trong data model thực. Không tự thêm filter status/product nếu entity đó không có field đó.
- [ ] **Nút Xem** trong cột Thao tác: **bỏ** — click vào row đã mở detail rồi. Chỉ cần nút ✏️ và 🗑️.
- [ ] **Nút 🗑️ Xóa** trong danh sách: disabled (opacity .4, cursor not-allowed) kèm tooltip lý do khi không đủ điều kiện. Không ẩn nút.
- [ ] **Ô tìm kiếm** placeholder phản ánh đúng field được search (không để "Tìm kiếm...").

---

## 2. Form Thêm mới / Tạo (Create Modal)

- [ ] **Tiêu đề modal** dùng "Thêm" thay vì "Tạo" (VD: "Thêm Hợp đồng mới").
- [ ] **Nút submit** dùng "💾 Tạo" — không dùng "Tạo Hợp đồng", "Lưu hợp đồng" hay text dài. Ngoại lệ: nếu context cần rõ hơn thì confirm với BA.
- [ ] **Mã định danh** (code, ID) do người dùng **nhập tay** — không tự sinh. Validate unique realtime sau mỗi keystroke, hiện lỗi inline (không block tiếp tục nhập).
- [ ] **Immutable fields** sau khi tạo: ghi rõ `🔒 Không thể thay đổi` dưới field, không dùng từ "immutable".
- [ ] **Radio/type selector** dùng radio card (có label + mô tả ngắn), không dùng dropdown.
- [ ] **Dynamic section** (VD: Pool License chỉ hiện khi chọn Reseller): ẩn hoàn toàn khi không applicable, tự động thêm 1 dòng rỗng khi section hiện ra.
- [ ] **Dropdown phụ thuộc** (VD: Gói sản phẩm grouped theo Sản phẩm): dùng `<optgroup>` để nhóm.
- [ ] **Input số lượng**: dùng `type="text" inputmode="numeric"`, format phân cách nghìn (dấu chấm vi-VN), parse khi submit.
- [ ] **Cảnh báo** ở pool/số lượng immutable: `⚠️ Không thể thay đổi sau khi lưu` — không dùng từ tiếng Anh.
- [ ] **Ngày tháng**: field label rõ "dự kiến" nếu là estimated, không dùng làm nguồn sự thật.
- [ ] **File đính kèm** trong form tạo:
  - Validate client-side (format + size) trước khi thêm vào list tạm.
  - File không hợp lệ → **không thêm vào list**, hiện toast lỗi.
  - File hợp lệ → icon ✓ xanh + tên file + dung lượng (KB/MB) + nút 🗑️ SVG icon.
  - Nút xóa file dùng SVG trash icon, không dùng ký tự ✕ (dễ nhầm với status).
  - Summary: `"X file hợp lệ · Y file không hợp lệ"` — không dùng "bị từ chối", "thất bại".
- [ ] **Sau khi tạo thành công**: điều hướng sang màn **Chi tiết** của record vừa tạo, không về danh sách.

---

## 3. Form Chỉnh sửa (Edit Modal)

- [ ] **Không hiện alert "Trường bất biến"** nếu đã có chú thích `🔒` ở từng field — dư thừa.
- [ ] **Immutable fields** dùng `readonly` + style khác biệt (xám nhạt) + chú thích `🔒 Không thể thay đổi`.
- [ ] **Chỉ sửa được** các field cho phép theo spec. Không tự ý thêm field có thể sửa.

---

## 4. Form Xác nhận Xóa (Delete Confirmation Modal)

- [ ] Dùng đúng **Design System modal**: `modal-header` (tiêu đề + nút ✕) + `modal-body` + `modal-footer`.
- [ ] **Tiêu đề** modal header rõ ràng: "Xóa {entity}" (VD: "Xóa Hợp đồng", "Xóa file đính kèm").
- [ ] **Body**: "Bạn có chắc chắn muốn xóa **{tên}**? Hành động này không thể hoàn tác." — không dùng jargon kỹ thuật (soft delete, BR-xx).
- [ ] **Footer**: `[Hủy]` bên trái · `[🗑️ Xóa]` (btn-danger) bên phải.
- [ ] **Bắt buộc nhập lý do** nếu UC yêu cầu — textarea + disable nút Xóa khi trống.
- [ ] **Điều kiện xóa** enforce ở cả UI (disable nút) và trong hàm xử lý (guard check).
- [ ] Sau khi xóa: **quay về danh sách**, không ở lại màn detail.

---

## 5. Màn Chi tiết (Detail View)

- [ ] **Hero header** chỉ chứa: mã định danh, tên entity, badge type, các nút action. **Không** chứa thông tin chi tiết — thông tin chi tiết nằm trong tab.
- [ ] **Tab**: click tab nào chỉ hiện nội dung của **đúng tab đó**. CSS `.tab-panel { display:none } .tab-panel.active { display:block }` bắt buộc.
- [ ] **Tab ẩn/hiện** theo điều kiện (VD: tab Pool License chỉ với Reseller): xử lý qua CSS class `hidden`, không xóa khỏi DOM.
- [ ] **Accordion** trong tab:
  - Header luôn visible kể cả khi body collapsed.
  - Nút action (VD: "＋ Thêm Pool") đặt trong **header accordion**, không trong body — luôn accessible.
  - Counter (số item) cập nhật realtime sau mỗi thao tác.
- [ ] **Pool License**:
  - Hiển thị: Tên Gói sản phẩm (bold, to) + Tên Sản phẩm (sub-label, nhỏ hơn).
  - Số liệu: Total / Used / Available (không dùng "allocated", "seats" chung chung).
  - Badge: `🔒 Không thể thay đổi` cạnh số Total.
  - Sub thuộc pool: tên beneficiary + **badge trạng thái** + số license.
  - Lọc Sub theo `packageId`, không theo `productId`.
- [ ] **File đính kèm** trong detail:
  - Chỉ hiện file `status = ACTIVE`.
  - Mỗi file: icon loại · tên · dung lượng (KB/MB) · người upload · ngày · nút ⬇ Tải về · nút 🗑️.
  - Dropzone kéo thả ngay trong accordion.
  - Upload lỗi (EF-03): hiện **row lỗi inline** màu đỏ + nút "🔄 Thử lại" + nút ✕ bỏ qua.
- [ ] **Tab Subscriptions**: hiển thị dạng **bảng** (không phải card), cột thay đổi theo Direct/Reseller.
- [ ] **Tab Timeline**: sort giảm dần (mới nhất trên đầu).
- [ ] **Tab Audit Log**: có ô search realtime + counter hiển thị số sự kiện.

---

## 6. Text & Label — Chuẩn ngôn ngữ

- [ ] **Không dùng từ tiếng Anh** trong UI label nếu có từ tiếng Việt tương đương rõ ràng.
- [ ] Các từ **đã bị ban**: `immutable`, `allocated`, `seats` (chung chung), `pool` (một mình), `submit`, `cancel` (thay bằng "Hủy").
- [ ] **Terminology chuẩn**:

| ❌ Cũ | ✅ Mới |
|---|---|
| Immutable | Không thể thay đổi sau khi tạo |
| Allocated / Đã phân bổ | Đã dùng (Used) |
| Available / Còn khả dụng | Còn lại (Available) |
| Pool tổng / seats cam kết | Tổng số license (Total) |
| % đã phân bổ | % đã dùng |
| Seats từ pool | License dùng (Used) |
| Bị từ chối / Thất bại (upload client) | Không hợp lệ |
| Đã xóa khỏi danh sách | Đã xóa thành công |

- [ ] **Hint text** phải có ý nghĩa thực tế — không dùng `"Nhập tay — mã duy nhất toàn hệ thống"`, thay bằng `"Nhập mã theo quy ước công ty, không trùng với HĐ khác"`.
- [ ] **Placeholder** dùng ví dụ cụ thể: `"VD: HD-CMC-2025-001"`, `"VD: Cung cấp EDR cho 500 thiết bị"`.

---

## 7. Dữ liệu demo (Mock Data)

- [ ] **Đủ bản ghi để test phân trang** — tối thiểu 2 trang (> PAGE_SIZE). Thêm ~20 bản ghi đa dạng.
- [ ] **Đa dạng trạng thái** — mock data phải cover đủ các status chính: Active, Pending, Expired, v.v.
- [ ] **Có bản ghi DELETED** (nếu entity hỗ trợ soft delete) để test filter.
- [ ] **Mock data phản ánh đúng schema** — không thêm field không có trong data model (VD: `totalValue`, `status` trên Contract).
- [ ] **Tên/mô tả thực tế** — dùng tên công ty Việt Nam thật (FPT, Viettel, CMC...), không dùng "Test Company 1".

---

## 8. Phân quyền (Role-based UI)

- [ ] **Nút nguy hiểm** (Xóa, Revoke): chỉ render enabled khi đúng role VÀ đúng điều kiện nghiệp vụ. Disabled khi thiếu một trong hai.
- [ ] **Tooltip** trên nút disabled: giải thích lý do (`"Chỉ Manager mới được xóa"` hoặc `"Đã có Subscription, không thể xóa"`).
- [ ] **Không dùng điều kiện phân quyền phức tạp** trong demo Phase 1 — giữ đơn giản: Sales vs Manager.

---

## 9. Consistency với Design System

- [ ] **Modal** luôn dùng class: `overlay` → `modal` → `modal-header` + `modal-body` + `modal-footer`.
- [ ] **Không tự tạo dialog** bằng `position:fixed` inline style — dùng Design System overlay pattern.
- [ ] **Button order trong footer**: `[Ghost/Secondary]` bên trái · `[Primary/Danger]` bên phải.
- [ ] **Toast** dùng hàm `toast(type, title, message)` đã có sẵn. Không tự build notification riêng.
- [ ] **Icon xóa**: dùng SVG trash icon, không dùng emoji 🗑️ trong nút (có thể dùng trong toast/label).
- [ ] **Tab panel**: bắt buộc có `.tab-panel { display:none }` và `.tab-panel.active { display:block }` trong CSS.
- [ ] **Số tiền / số lượng**: format phân cách nghìn `vi-VN` (`toLocaleString('vi-VN')`), đơn vị rõ ràng.
- [ ] **Dung lượng file**: < 1MB → hiện KB; ≥ 1MB → hiện MB (1 chữ số thập phân).

---

## 10. Sau khi build xong — Self-review checklist

Trước khi deliver file demo, tự check:

- [ ] Click vào mỗi tab trong Detail → chỉ hiện đúng nội dung tab đó, không leak sang tab khác
- [ ] Mở console browser → không có JS error khi thao tác bình thường
- [ ] Thử tạo record mới → redirect đúng về Detail, không về List
- [ ] Thử xóa record → toast đúng, quay về List
- [ ] Thử với role Sales và Manager → phân quyền nút hoạt động đúng
- [ ] Scroll danh sách → phân trang hoạt động đúng, sort đúng
- [ ] Upload file hợp lệ → ✓ xanh, upload file sai format → toast lỗi, không thêm vào list
- [ ] Accordion expand/collapse → nút trong header luôn accessible

---
