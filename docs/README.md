# OneCRM — Bản đồ tài liệu (Documentation Map)

> **Đọc file này đầu tiên.** Đây là cửa vào của toàn bộ tài liệu dự án OneCRM — nơi định vị mọi module, quy ước đặt tên, và cách điều hướng. OneCRM là **Commercial CRM passive-observer** cho hệ sinh thái sản phẩm an ninh mạng của CMC Cybersecurity (EDR, C-Shield, AV, CA); kiến trúc 2 lớp **Core (M-01…M-08) + Product Module (PM-01…03)**.

---

## 1. Điều hướng nhanh — đọc gì, khi nào

| Bạn muốn… | Đọc |
|---|---|
| Hiểu tổng thể sản phẩm, anchor, data model, đặc tả FR | **`prd/OneCRM_PRD_v2.7.md`** — nguồn sự thật hiện hành |
| Đặc tả chi tiết một tính năng (luồng, BR, AC, wireframe, BPMN) | **`frs/<module>/UC-*.md`** — xem cột "FRS folder" bên dưới |
| Tra 1 UC ↔ FR ↔ demo ↔ trạng thái | **`TRACEABILITY.md`** |
| Xem giao diện chạy thử | **`demo/v<x>.<y>_<module>.html`** (mở bằng trình duyệt) |
| Quy tắc làm việc / văn phong / quy ước | **`../CLAUDE.md`** |

**Thứ tự nguồn sự thật:** demo (chốt UI) → FRS (đặc tả hành vi) → PRD (tổng quan + FR). Khi FRS và PRD lệch, **FRS là nguồn chốt hành vi**; PRD giữ vai trò tổng quan + truy vết.

---

## 2. Bản đồ module

| Module | Code (UC prefix) | Mô tả | UC | PRD § | FRS folder | Demo | Assets |
|---|---|---|---|---|---|---|---|
| Customer Management | **M-01** (CUS) | Quản lý khách hàng B2B | UC-CUS-01..05 | §6.1 | `frs/customers/` | `demo/v2.2.x_customers.html` | `assets/M-01_customers/` |
| Contract Management | **M-02** (CON) | Hợp đồng lightweight | UC-CON-01..06 | §6.2 | `frs/contracts/` | `demo/v2.3.2_contracts.html` | `assets/M-02_contracts/` |
| Subscription Management | **M-03** (SUB) | Đối tượng thương mại chính | UC-SUB-01..10 | §6.3 | `frs/subscriptions/` | `demo/v2.4.0_subscriptions.html` | `assets/M-03_subscriptions/` |
| Product & Package Catalog | **M-04** (CAT) | Danh mục sản phẩm & gói | UC-CAT-01..07 | §6.4 | `frs/catalog/` | `demo/v2.5.0_catalog.html` | `assets/M-04_catalog/` |
| License Mirror & Usage | **M-05** (LIC) | Gương trạng thái license + mức dùng | UC-LIC-01..04 | §6.5 | `frs/licenses/` | `demo/v2.6.0_license.html` | `assets/M-05_licenses/` |
| Provisioning Timeline | **M-06** (EVT) | Dòng thời gian provisioning | *(chỉ PRD — chưa tách FRS)* | §6.6 | — | *(nhúng trong 360° KH/Sub)* | — |
| Integration Layer | **M-07** (INT) | Outbox/webhook — event-driven passive | UC-INT-01..06 | §6.7 | `frs/integration/` | `demo/v2.7.0_integration.html` | `assets/M-07_integration/` |
| Audit & Notification | **M-08** (AUD/NOT) | Nhật ký + thông báo | UC-AUD-01 · UC-NOT-01..03 | §6.8 | `frs/audit_notification/` | `demo/v2.8.0_audit_notification.html` | `assets/M-08_audit_notification/` |
| **Cấu hình** *(menu gom — KHÔNG phải module riêng)* | SET / USR | Màn cấu hình vận hành; **nội dung thuộc M-04/M-07/M-08 + nền tảng** | UC-SET-01..03 · UC-USR-01 | *(rải theo module)* | `frs/settings/` | *(trong các demo trên)* | `assets/settings/` |
| EDR Module | **PM-01** (EDR) | Product Module đầy đủ (Phase 2) | — | §6.9 | *(trong PRD)* | — | — |
| C-Shield / AV | **PM-02 / PM-03** | Skeleton khai báo | — | §6.10 / §6.11 | *(trong PRD)* | — | — |

> **"Cấu hình" (Settings)** là một **menu gom** các màn cấu hình, không phải module độc lập. Mỗi UC-SET tự khai chủ sở hữu nội dung: UC-SET-01 → M-08; UC-SET-02 → khai báo Product Module (M-04/M-07); UC-SET-03 → M-07; UC-USR-01 → nền tảng (`USER_PROFILE`, Phase 2+ skeleton).

---

## 3. Cấu trúc thư mục

```
docs/
├── README.md            ← file này (bản đồ tổng)
├── TRACEABILITY.md      ← ma trận truy vết UC ↔ FRS ↔ demo ↔ trạng thái
├── prd/
│   ├── OneCRM_PRD_v2.7.md   ← ⭐ NGUỒN SỰ THẬT hiện hành
│   └── OneCRM_PRD_v2.3…2.6  ← bản lịch sử (đóng băng)
├── frs/
│   ├── _templates/          ← checklist_frs · checklist_ui · frs_template
│   └── <module>/            ← UC-*.md + _bpmn_prompts.md (hoặc _event_catalog.md ở integration)
├── demo/                    ← SPA HTML tĩnh, đặt tên v<major>.<minor>_<module>.html
├── assets/                  ← ảnh BPMN/wireframe/screen — M-0X_<domain>/ + settings/ + shared/
├── plans/                   ← ghi chú quyết định · open-question · kế hoạch
└── tools/                   ← bpmn_editor.html + samples/*.bpmn (bpmn-js offline)
```

---

## 4. Quy ước đặt tên (naming conventions)

- **UC prefix theo module:** CUS · CON · SUB · CAT · LIC · EVT · INT · AUD · NOT · SET · USR.
- **File FRS:** `UC-<PREFIX>-<NN>_<slug_tiếng_anh>.md` (vd `UC-INT-04_outbox_and_retry.md`).
- **Ảnh asset:** `UC-<MOD>-<NN>_<type>_<mô_tả>.png`, `type` ∈ `bpmn` · `wireframe` · `screen` (vd `UC-CON-03_screen_detail_direct_info.png`). Thư mục asset dùng **mã module**: `assets/M-0X_<domain>/`.
- **Demo:** `v<major>.<minor>_<module>.html` — version demo tăng theo mốc module (không phải version PRD).
- **BPMN:** prompt sinh ảnh lưu ở `frs/<module>/_bpmn_prompts.md`; file `.bpmn` (bpmn-js) ở `tools/samples/`; ảnh PNG ở `assets/<module>/`. *(Riêng integration dùng `_event_catalog.md` làm danh mục sự kiện thay cho _bpmn_prompts.)*

---

## 5. Quy trình tài liệu (demo-first)

1. **Dựng/duyệt demo HTML** → chốt UI (áp 6 quy tắc demo trong `CLAUDE.md`).
2. **Viết FRS** cho từng UC: Thông tin chung · Business Rule · Luồng nghiệp vụ (kèm **BPMN**) · Mô tả giao diện (kèm **wireframe**) · Acceptance Criteria · Review checklist.
3. **Self-review** theo `frs/_templates/checklist_frs.md`.
4. **Trace về PRD** (§6.x) — cập nhật FR/AC nếu lệch; FRS là nguồn chốt hành vi.

---

## 6. Chú giải trạng thái (dùng trong TRACEABILITY.md)

| Ký hiệu | Nghĩa |
|---|---|
| ✅ | Đặc tả xong — có FRS + demo chốt + (BPMN/wireframe nếu là UC có UI) |
| 🟡 | Draft v1.0 — có FRS nhưng còn mới / chờ rà thêm |
| 📄 | Chỉ có trong PRD (chưa tách FRS) |
| ⏳ | Skeleton / phase sau |

---

*Cập nhật: 21/07/2026. File này là bản đồ điều hướng — chi tiết nằm ở PRD/FRS/TRACEABILITY tương ứng.*
