# CLAUDE.md — OneCRM Project Context & Working Rules

## 1. Dự án

**OneCRM** — CRM nội bộ cho doanh nghiệp phân phối sản phẩm an ninh mạng (B2B).

### Tech stack
- Frontend: React + Vite (đang phát triển)
- Demo/prototype: HTML SPA tĩnh tại `docs/demo/`
- Tài liệu: Markdown — PRD (`docs/prd/OneCRM_PRD_v2.7.md`, nguồn sự thật) + FRS (`docs/frs/`). **Bản đồ tổng: `docs/README.md`**

---

## 2. Cấu trúc thư mục

```
one_crm/
├── docs/
│   ├── README.md               # ⭐ BẢN ĐỒ tài liệu — đọc ĐẦU TIÊN (module map · quy ước · điều hướng)
│   ├── TRACEABILITY.md         # Ma trận truy vết UC ↔ FRS ↔ demo ↔ trạng thái
│   ├── prd/
│   │   └── OneCRM_PRD_v2.7.md   # ⭐ Nguồn sự thật HIỆN HÀNH (v2.3–v2.6 giữ lịch sử)
│   ├── frs/                    # Đặc tả chi tiết — 1 thư mục / module (xem README)
│   │   ├── _templates/         # checklist_frs · checklist_ui · frs_template
│   │   ├── customers/ contracts/ subscriptions/ catalog/ licenses/
│   │   ├── integration/ audit_notification/ settings/
│   │   └── (mỗi folder: UC-*.md + _bpmn_prompts.md hoặc _event_catalog.md)
│   ├── demo/                   # SPA HTML tĩnh, versioned theo module (v1.0 → v2.8)
│   ├── assets/                 # Ảnh BPMN/wireframe/screen — M-0X_<domain>/ + settings/ + shared/
│   ├── plans/                  # Ghi chú quyết định · open-question · kế hoạch
│   └── tools/                  # bpmn_editor.html + samples/*.bpmn
```

---

## 3. Module map

> Bản đồ đầy đủ + chi tiết UC: **`docs/README.md`** và **`docs/TRACEABILITY.md`**. Bảng dưới là tra cứu nhanh.

| Module | Code (UC prefix) | Mô tả | UC | PRD | FRS folder |
|---|---|---|---|---|---|
| Customer Management | M-01 (CUS) | Quản lý khách hàng B2B | UC-CUS-01..05 | §6.1 | `frs/customers/` |
| Contract Management | M-02 (CON) | Hợp đồng lightweight | UC-CON-01..06 | §6.2 | `frs/contracts/` |
| Subscription Management | M-03 (SUB) | Đối tượng thương mại chính | UC-SUB-01..10 | §6.3 | `frs/subscriptions/` |
| Product & Package Catalog | M-04 (CAT) | Danh mục sản phẩm & gói | UC-CAT-01..07 | §6.4 | `frs/catalog/` |
| License Mirror & Usage | M-05 (LIC) | Gương trạng thái license + mức dùng | UC-LIC-01..04 | §6.5 | `frs/licenses/` |
| Provisioning Timeline | M-06 (EVT) | Dòng thời gian provisioning | *(chỉ PRD — chưa tách FRS)* | §6.6 | — |
| Integration Layer | M-07 (INT) | Outbox/webhook — event-driven passive | UC-INT-01..06 | §6.7 | `frs/integration/` |
| Audit & Notification | M-08 (AUD/NOT) | Nhật ký + thông báo | UC-AUD-01 · UC-NOT-01..03 | §6.8 | `frs/audit_notification/` |
| **Cấu hình** *(menu gom — KHÔNG phải module riêng)* | SET / USR | Màn cấu hình vận hành; nội dung thuộc M-04/M-07/M-08 + nền tảng | UC-SET-01..03 · UC-USR-01 | *(rải theo module)* | `frs/settings/` |
| EDR Module | PM-01 (EDR) | Product Module đầy đủ (Phase 2) | — | §6.9 | *(trong PRD)* |
| C-Shield / AV | PM-02 / PM-03 | Skeleton khai báo | — | §6.10 / §6.11 | *(trong PRD)* |

**Nguồn sự thật:** PRD hiện hành = `OneCRM_PRD_v2.7.md` (v2.3–v2.6 giữ lịch sử). Mọi BR/AC/luồng trace về đây.

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

### Về demo HTML — 6 QUY TẮC BẮT BUỘC

> Áp dụng **mỗi khi tạo mới demo** và **mỗi khi sửa/update UI của demo đã có**.
> Sau khi làm xong, **tự review lại theo đúng 6 mục này với tư duy PO 20 năm kinh nghiệm**
> (vừa hiểu nghiệp vụ, vừa giỏi UI/UX) — không chờ người dùng phát hiện lỗi.

1. **Demo = ảnh sản phẩm cuối.** Mọi chữ trên màn hình là chữ **người dùng thật sẽ đọc**.
   TUYỆT ĐỐI không để lọt: tên field/bảng (`license_mirror.expiration_date`, `runtime_config`),
   tên sự kiện kỹ thuật (`license.active`, webhook, outbox), mã tài liệu (BR-xx, FR-xx, P1/P2),
   ghi chú phạm vi ("Phase 1", "chưa lưu lịch sử"), từ lóng nội bộ ("Sub", "mirror", "ops").
   → Nói **hậu quả với khách hàng**, không nói **trạng thái hệ thống**.

2. **Đủ thông tin cho nghiệp vụ vận hành của TỪNG persona.** Trước khi dựng màn, liệt kê:
   persona nào vào màn này, vào lúc nào, để trả lời câu hỏi gì, rồi mới chọn trường hiển thị.
   Thiếu một trường mà persona cần → màn vô dụng; thừa trường → nhiễu.

3. **Gom nhóm & sắp xếp theo mức độ quan trọng + tần suất sử dụng.**
   Thông tin hỏi mỗi lần → trên cùng, không cần cuộn. Thông tin hiếm dùng → xuống dưới.
   Thông tin chỉ dùng khi có sự cố → chỉ hiện khi có sự cố (cảnh báo không thường trực).

4. **KHÔNG trùng lặp.** Một dữ liệu chỉ xuất hiện **một chỗ** — không lặp ở 2 tab, 2 section,
   hay 2 lần trong cùng màn. Nếu 2 màn cùng cần → **tách component dùng chung**, không copy code
   (copy code = hai màn sẽ trôi dạt mỗi nơi một kiểu).

5. **Layout cân đối.** Không để một cột/nửa màn trống trong khi nửa kia đầy.
   Các ô cùng hàng phải thẳng lưới. Badge/nhãn cùng nhóm phải cùng kích thước, cùng đường nền.

6. **Có link & action đúng chỗ để vận hành.** Mỗi màn phải trả lời được *"rồi sao nữa?"*:
   nút đặt **cạnh dữ liệu mà nó tác động**; hành động theo **ngữ cảnh** (chỉ hiện khi thực sự cần);
   liên kết chéo tới màn liên quan (KH / HĐ / Subscription / Timeline). Ngưỡng cấu hình
   (SLA, ngưỡng cảnh báo, chu kỳ...) **không hardcode** — đọc từ cấu hình sản phẩm.

### Về git
- Không tự push lên remote trừ khi được yêu cầu rõ ràng.
- Tạo commit message rõ ràng theo format: `docs(UC-XXX-NN): mô tả ngắn`.

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **one_crm** (1336 symbols, 1504 relationships, 11 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> Index stale? Run `node .gitnexus/run.cjs analyze` from the project root — it auto-selects an available runner. No `.gitnexus/run.cjs` yet? `npx gitnexus analyze` (npm 11 crash → `npm i -g gitnexus`; #1939).

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows. For regression review, compare against the default branch: `detect_changes({scope: "compare", base_ref: "main"})`.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `query({search_query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `context({name: "symbolName"})`.
- For security review, `explain({target: "fileOrSymbol"})` lists taint findings (source→sink flows; needs `analyze --pdg`).

## Never Do

- NEVER edit a function, class, or method without first running `impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `rename` which understands the call graph.
- NEVER commit changes without running `detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/one_crm/context` | Codebase overview, check index freshness |
| `gitnexus://repo/one_crm/clusters` | All functional areas |
| `gitnexus://repo/one_crm/processes` | All execution flows |
| `gitnexus://repo/one_crm/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
