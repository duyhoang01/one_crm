# CLAUDE.md — OneCRM Project Context & Working Rules

## 1. Dự án

**OneCRM** — CRM nội bộ cho doanh nghiệp phân phối sản phẩm an ninh mạng (B2B).

### Tech stack
- Frontend: React + Vite (đang phát triển)
- Demo/prototype: HTML SPA tĩnh tại `docs/demo/`
- Tài liệu: Markdown (FRS) + DOCX (PRD)

---

## 2. Cấu trúc thư mục

```
one_crm/
├── docs/
│   ├── assets/
│   │   ├── M-01_customers/     # Ảnh cho module Khách hàng
│   │   ├── M-02_contracts/     # Ảnh cho module Hợp đồng
│   │   └── shared/
│   ├── demo/
│   │   ├── v2.2.x_customers.html   # Demo SPA module Khách hàng
│   │   └── v2.3.2_contracts.html   # Demo SPA module Hợp đồng
│   ├── frs/
│   │   ├── _templates/
│   │   │   ├── checklist_frs.md    # Self-review bắt buộc trước khi submit FRS
│   │   │   └── frs_template.md     # Template FRS chuẩn
│   │   ├── customers/          # UC-CUS-01..05
│   │   └── contracts/          # UC-CON-01..06
│   └── prd/
│       └── OneCRM_PRD_v2.3.docx    # Nguồn sự thật — mọi FRS phải trace về đây
```

---

## 3. Module map

| Module | Code | Mô tả | UC |
|---|---|---|---|
| Customer Management | M-01 (CUS) | Quản lý khách hàng B2B | UC-CUS-01..05 |
| Contract Management | M-02 (CON) | Quản lý hợp đồng & subscription | UC-CON-01..06 |

### UC-CUS (Khách hàng)
- UC-CUS-01: Danh sách khách hàng
- UC-CUS-02: Tạo khách hàng
- UC-CUS-03: Xem chi tiết khách hàng (360°)
- UC-CUS-04: Cập nhật khách hàng
- UC-CUS-05: Xóa khách hàng

### UC-CON (Hợp đồng)
- UC-CON-01: Danh sách hợp đồng
- UC-CON-02: Tạo hợp đồng
- UC-CON-03: Xem chi tiết hợp đồng
- UC-CON-04: Cập nhật hợp đồng
- UC-CON-05: Quản lý đính kèm
- UC-CON-06: Xóa hợp đồng

---

## 4. Quy ước đặt tên file asset

```
UC-{MOD}-{NN}_{type}_{mô_tả}.png
```

| `type` | Ý nghĩa |
|---|---|
| `bpmn` | Sơ đồ luồng BPMN 2.0 |
| `wireframe` | Wireframe thiết kế |
| `screen` | Ảnh chụp màn hình demo |

**Ví dụ:** `UC-CON-03_screen_detail_direct_info.png`

---

## 5. Quy tắc viết FRS

- **Ngôn ngữ**: Tiếng Việt (trừ thuật ngữ kỹ thuật giữ nguyên tiếng Anh)
- **Cấu trúc bắt buộc** (5 mục):
  1. Thông tin chung
  2. Luồng nghiệp vụ
  3. Mô tả giao diện
  4. Acceptance Criteria
  5. Lịch sử thay đổi (hoặc Review Checklist)
- **Self-review**: Chạy checklist tại `docs/frs/_templates/checklist_frs.md` trước khi submit
- **Nguồn sự thật**: Mọi BR, AC, luồng phải có thể trace về `OneCRM_PRD_v2.3.docx`

---

## 6. Thuật ngữ

| Viết tắt | Nghĩa đầy đủ |
|---|---|
| HĐ | Hợp đồng |
| KH | Khách hàng |
| Sub | Subscription (giấy phép sử dụng) |
| BR | Business Rule |
| AC | Acceptance Criteria |
| AF | Alternative Flow (Luồng phụ) |
| EF | Exception Flow (Luồng ngoại lệ) |
| DIRECT | Loại hợp đồng bán trực tiếp cho end-user |
| RESELLER | Loại hợp đồng qua kênh phân phối |
| Pool | License pool của hợp đồng RESELLER |
| FRS | Functional Requirements Specification |
| PRD | Product Requirements Document |

---

## 7. Kỹ thuật demo SPA

### Contract SPA (`v2.3.2_contracts.html`)
- Mở module: `showModule('contract')`
- Mở modal tạo: `conOpenModal('conModalCreate')`
- Chọn loại HĐ: `conSelectType('RESELLER', el)`
- Mở chi tiết: `conOpenDetail('con-001')` / `conOpenDetail('con-002')`
- Chuyển tab: `conSwitchTab(tabEl, panelId)` — **phải dùng hàm này**, không toggle CSS thủ công vì nó trigger các hàm render như `conRenderSubsPanel()`, `conRenderAuditPanel()`
- Panel IDs: `con-tp-info`, `con-tp-subs`, `con-tp-timeline`, `con-tp-audit`, `con-tp-attach`
- RESELLER pool hiển thị trong accordion bên trong `con-tp-info`, **không có** panel `con-tp-pool` riêng

### Customer SPA (`v2.2.x_customers.html`)
- Mở chi tiết KH: `showCustomer360(id)`
- `render360(c)` pre-render TẤT CẢ tab cùng lúc khi load — chỉ cần show/hide để chụp ảnh
- Tab IDs: `tab-overview`, `tab-contracts`, `tab-timeline`, `tab-audit`

---

## 8. Quy tắc làm việc

### Quy tắc quan trọng nhất
> **Nếu chưa rõ yêu cầu, hỏi lại, không tự suy diễn.**
> Khi có bất kỳ ambiguity nào về requirement, spec, hay hành vi mong muốn — đặt câu hỏi cụ thể trước khi thực hiện.

### Về nguồn thông tin
- Chỉ phát biểu dựa trên thông tin có trong PRD, FRS, hoặc code demo.
- Nếu suy luận từ context, phải nói rõ: *"Tôi đang suy luận từ X"* hoặc *"Cần verify với PRD v2.3"*.
- Không tự thêm business logic không có trong tài liệu.

### Về FRS
- Không tự sửa nội dung FRS ngoài phạm vi yêu cầu.
- Khi thêm Open Question (OQ), đánh dấu rõ là assumption chưa verify.
- Giữ nguyên numbering section trừ khi được yêu cầu thay đổi.

### Về ảnh và asset
- Dùng đúng convention `_screen_` (không phải `_screenshot_`).
- Khi embed ảnh vào FRS, dùng đường dẫn tương đối từ thư mục `frs/` về `assets/`.

### Về git
- Không tự push lên remote trừ khi được yêu cầu rõ ràng.
- Tạo commit message rõ ràng theo format: `docs(UC-XXX-NN): mô tả ngắn`.
