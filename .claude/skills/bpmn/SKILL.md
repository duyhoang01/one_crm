---
name: bpmn
description: >
  Phân tích quy trình nghiệp vụ và sinh prompt sẵn sàng dùng cho ChatGPT
  để tạo ảnh sơ đồ BPMN 2.0 — đúng visual style của dự án OneCRM.
  Kích hoạt khi người dùng gọi /bpmn kèm mô tả quy trình.
  Xuất prompt Code Interpreter (Python/matplotlib) khớp với style ảnh hiện có.
---

# Skill: BPMN Prompt Generator — OneCRM Style

## Vai trò

Claude đóng vai **BPMN Analyst + Prompt Engineer** — phân tích quy trình
nghiệp vụ từ mô tả tự nhiên, ánh xạ sang ký hiệu BPMN 2.0 chuẩn, rồi
viết prompt Code Interpreter cho ChatGPT tạo ảnh BPMN **khớp với visual
style đang dùng trong dự án OneCRM**.

---

## Visual Style Chuẩn OneCRM (bắt buộc áp dụng)

Phân tích từ các ảnh BPMN hiện có (UC-CON-01 → UC-CON-05, UC-CUS-01 → UC-CUS-05):

### Bố cục tổng thể (top → bottom)

```
┌─────────────────────────────────────────────────────┐
│  TITLE BAR  (dark navy #1E3A5F, white bold text)   │
├──┬──────────────────────────────────────────────────┤
│P │ LANE HEADER │  LANE 1 CONTENT (Sales/Manager)   │
│O ├─────────────┼──────────────────────────────────  │
│O │ LANE HEADER │  LANE 2 CONTENT (System)           │
│L ├─────────────┼────────────────────────────────────┤
│  │  AF / EF sub-sections (nếu có)                  │
├──┴──────────────────────────────────────────────────┤
│  FOOTER: [CHÚ GIẢI] | [GHI CHÚ NGHIỆP VỤ] | [END EVENTS] │
└─────────────────────────────────────────────────────┘
```

### Title Bar

- Background: **#1E3A5F** (dark navy)
- Text: white, bold, ~18pt
- Format: `UC-XXX-NN — Tên tính năng (BPMN 2.0)` — hoặc `UC-XXX-NN — Tên tính năng`
- Full width, height ~55px

### Pool label

- Cột dọc bên trái ~30px, background navy, text trắng xoay 90°
- Tên Pool = tên module (VD: "Pool: UC-CON-XX — Tên tính năng")

### Lanes

| Lane | Header fill | Header text | Content bg | Icon |
|------|------------|------------|-----------|------|
| Sales / Manager | `#3B82F6` (blue) | White bold | `#EFF6FF` (very light blue) | 👤 |
| System | `#6B7280` (gray) | White bold | `#F9FAFB` (near white) | ⚙ |

- Header strip bên trái ~80px, chứa icon + tên role
- Đường kẻ ngang phân cách lanes: 1pt gray

### Task (Hoạt động)

```
┌──────────────────────┐
│ 👤  ① (badge số)    │
│                      │
│   Tên task ngắn      │
│   (2-3 dòng max)     │
└──────────────────────┘
```

- Shape: rounded rectangle, border-radius 8px
- User Task fill: `#DBEAFE` (light blue), border `#3B82F6`
- System Task fill: `#F3F4F6` (light gray), border `#9CA3AF`
- Badge số: hình tròn nhỏ dark (#1E3A5F), số trắng, góc trên trái
- Icon: 👤 (User Task) hoặc ⚙ (System Task), góc trên trái cạnh badge
- Text: tiếng Việt, đen, 9-10pt, căn giữa

### Events

- **Start Event**: Circle ∅40px, viền xanh lá `#16A34A` 2.5pt, fill trắng, label "Start" bên dưới
- **End Event**: Circle ∅40px, fill đen `#111827`, có thể có ring ngoài, label bên dưới (tên kết thúc)
- End event có thể nhiều cái — mỗi cái ghi tên kết quả bên dưới

### Gateway (XOR Exclusive)

- Diamond 55×55px, fill `#FEF9C3` (light yellow), border `#EAB308` 2pt
- Chữ **X** ở giữa, màu đen
- Label "Gateway N:" + điều kiện — đặt **bên trên** hoặc bên cạnh
- Nhánh "Có" và "Không" — label italic nhỏ trên mũi tên

### Flow types

| Loại | Style | Màu |
|------|-------|-----|
| Sequence Flow (chính) | Solid, arrowhead ▶ | `#111827` (black) |
| Association / AF | Dashed, arrowhead ▶ | `#3B82F6` (blue) |
| Exception Flow / EF | Dashed, arrowhead ▶ | `#EF4444` (red) |

### AF / EF Sections (Sub-flow boxes)

**Alternative Flow (AF):**
```
┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  ← dashed border #3B82F6
  AF-01: Tên luồng phụ                    ← bold blue header
│ [step] → [step] → ...               │
└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
```
- Fill: `#EFF6FF` (very light blue), border dashed `#3B82F6`

**Exception Flow (EF):**
```
┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  ← dashed border #EF4444
  EF-01a. Tên lỗi                         ← bold red text
│ • Bullet point mô tả hành vi hệ thống│
└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
```
- Fill: `#FEF2F2` (very light red/pink), border dashed `#EF4444`

### Footer — 3 cột bắt buộc

```
┌──────────────────┬────────────────────────┬──────────────────────────┐
│   CHÚ GIẢI       │  GHI CHÚ NGHIỆP VỤ     │  ĐIỂM KẾT THÚC           │
│  (Legend)        │  (Business Notes)       │  (End Events)             │
│                  │                         │                           │
│ 🟢 Start Event   │ • Bullet 1              │ ① ● Kết thúc — mô tả    │
│ ⚫ End Event     │ • Bullet 2              │ ② ● Kết thúc — mô tả    │
│ 👤 User Task     │ • Bullet 3              │                           │
│ ⚙ System Task   │                         │                           │
│ ⬦ Gateway (XOR) │                         │                           │
└──────────────────┴────────────────────────┴──────────────────────────┘
```
- Background: `#F8FAFC`, border `#E2E8F0` solid 1pt
- Header ô: bold, gray

---

## Ký hiệu BPMN 2.0 cốt lõi

| Element | Shape | Mô tả |
|---------|-------|-------|
| **Pool** | Rectangle (outer container) | Tổ chức / hệ thống |
| **Lane** | Horizontal band | Vai trò: Sales/Manager, System |
| **Task** | Rounded rectangle + badge số | Một hành động đơn |
| **Sub-process** | Rounded rect + dấu `[+]` dưới | Nhóm task phức tạp |
| **Start Event** | Thin circle | Bắt đầu quy trình |
| **End Event** | Thick/filled circle | Kết thúc quy trình |
| **XOR Gateway** | Diamond + X | Rẽ nhánh điều kiện |
| **Sequence Flow** | Solid arrow | Luồng chính |
| **AF section** | Blue dashed box | Luồng phụ / alternative |
| **EF section** | Red dashed box | Luồng lỗi / exception |

---

## Quy trình thực hiện

### Bước 1 — Nhận input

Đọc `$ARGUMENTS`:
- Nếu rỗng: hỏi mô tả quy trình trước khi tiếp tục.
- Nếu chỉ nêu tên UC (VD: "UC-CON-03"): tự suy luận từ context OneCRM, nhưng note rõ là đang suy luận.

### Bước 2 — Phân tích BPMN

Hiển thị bảng phân tích:

```
## Phân tích BPMN: [Tên UC]

### Lanes
| Lane | Role | Icon |
|------|------|------|
| 1    | Sales / Manager | 👤 |
| 2    | System | ⚙ |

### Happy Path (Main Flow)
| # | Step | Actor | Task label (ngắn) |
|---|------|-------|-------------------|
| 1 | ... | Sales | ... |

### Alternative Flows (AF)
| AF-ID | Tên | Trigger | Steps |
|-------|-----|---------|-------|

### Exception Flows (EF)
| EF-ID | Tên | Điều kiện | Hành vi |
|-------|-----|-----------|---------|

### End Events
| # | Tên | Màu |
|---|-----|-----|
```

### Bước 3 — Sinh prompt Code Interpreter

Sinh **1 prompt duy nhất**, sẵn sàng copy vào ChatGPT (GPT-4o + Code Interpreter).

---

## Format output bắt buộc

````
---[PROMPT — Code Interpreter]---

Write Python code using matplotlib and matplotlib.patches to draw a BPMN 2.0 process diagram matching the OneCRM project visual style. Draw all shapes from scratch — do NOT use any external BPMN library. Save as `[filename].png` at 200 DPI and display inline.

═══ PROCESS SPECIFICATION ═══════════════════════════════════════════

Title: "[UC-XXX-NN — Tên tính năng (BPMN 2.0)]"
Canvas: [W]×[H]px, white background

═══ LAYOUT ══════════════════════════════════════════════════════════

SECTION 1 — TITLE BAR (full width, height 55px, y=0):
  Fill: #1E3A5F | Text: white bold 18pt, centered | Text: "[title]"

SECTION 2 — POOL LABEL (left strip, width 30px, y=55 to [bottom of lanes]):
  Fill: #1E3A5F | Text: white 10pt, rotated 90°: "[pool label]"

SECTION 3 — SWIMLANES (x=30, y=55, width=canvas_width−30):

  LANE 1 — "Sales / Manager" (height [H1]px):
    Header strip (width 80px): fill #3B82F6, icon 👤 + text "SALES /\nMANAGER" white bold 10pt
    Content area: fill #EFF6FF

  LANE 2 — "System" (height [H2]px):
    Header strip (width 80px): fill #6B7280, icon ⚙ + text "SYSTEM" white bold 10pt
    Content area: fill #F9FAFB

  Lane separator line: y=[H1+55], width=canvas_width, color #D1D5DB 1pt

SECTION 4 — FOOTER (y=[bottom of lanes], height 160px):
  3 equal columns, fill #F8FAFC, border #E2E8F0 1pt
  Col 1: "CHÚ GIẢI (LEGEND)" — list symbols
  Col 2: "GHI CHÚ NGHIỆP VỤ (Business Notes)" — bullet list
  Col 3: "ĐIỂM KẾT THÚC (END EVENTS)" — numbered list

═══ ELEMENTS ════════════════════════════════════════════════════════

(For each element, draw at approximate (cx, cy) center coordinates)

EVENTS:
  [E1] Start Event — circle r=20, border #16A34A 2.5pt, fill white
       Position: (cx, cy) | Label below: "Start"
  [Ex] End Event — circle r=20, fill #111827, outer ring #374151
       Position: (cx, cy) | Label below: "[result name]"

TASKS:
  [T1] "[label]" — User Task (👤) — Lane [N]
       Rounded rect [W×H]px, fill #DBEAFE, border #3B82F6 1.5pt
       Badge ①: dark circle top-left, white "1"
       Position: top-left corner (x, y)

  [Tn] "[label]" — System Task (⚙) — Lane [N]
       Rounded rect [W×H]px, fill #F3F4F6, border #9CA3AF 1.5pt
       Badge ⑧: dark circle top-left, white "n"
       Position: top-left corner (x, y)

GATEWAYS:
  [G1] Gateway 1: "[condition label]"
       Diamond 55×55px, fill #FEF9C3, border #EAB308 2pt, "X" center black
       Position center: (cx, cy)
       Labels on branches: "Có" (→ right/down), "Không" (→ down/up)

SUB-SECTIONS (AF/EF — draw as bordered box regions):
  [AF-01] "AF-01: [name]" — dashed box fill #EFF6FF, border #3B82F6 1.5pt dashed
          Contains: [list elements inside]
          Box coords: (x, y, w, h)

  [EF-01] "EF-01: [name]" — dashed box fill #FEF2F2, border #EF4444 1.5pt dashed
          Contains: [list elements or bullet text]
          Box coords: (x, y, w, h)

═══ SEQUENCE FLOWS ══════════════════════════════════════════════════

Main flows (solid black #111827, 1.5pt, arrowhead):
  E1 → T1
  T1 → T2 (cross-lane: route orthogonally, right-angle bend)
  ...

Alternative flows (dashed blue #3B82F6, 1.5pt, arrowhead):
  AF-01a → AF-01b

Exception flows (dashed red #EF4444, 1.5pt, arrowhead):
  [Gateway] → EF-01a (label "Có" on arrow)

═══ FOOTER CONTENT ══════════════════════════════════════════════════

CHÚ GIẢI:
  🟢 Start Event — Bắt đầu quy trình
  ⚫ End Event — Kết thúc quy trình
  👤 User Task (Sales/Manager)
  ⚙ System Task (Hệ thống)
  ⬦ Gateway (Exclusive / XOR)
  → Sequence Flow (Luồng chính)
  --→ Association Flow (Luồng phụ – AF)
  ··→ Exception Flow (Luồng ngoại lệ – EF)

GHI CHÚ NGHIỆP VỤ:
  [Bullet list of business rules relevant to this UC]

ĐIỂM KẾT THÚC:
  ① ⚫ [Tên kết thúc 1]
  ② ⚫ [Tên kết thúc 2]
  ...

═══ STYLING RULES ═══════════════════════════════════════════════════

- Font: DejaVu Sans (matplotlib default). All text in Vietnamese.
- Task label: black 9pt, centered, word-wrap at ~18 chars/line, max 3 lines
- Cross-lane arrows: route with 90° bends, not diagonal
- All text in task boxes: horizontally and vertically centered
- Badge circles: radius 10px, fill #1E3A5F, white text 8pt bold
- Annotation arrows (dashed): use linestyle='--', dash pattern (5,3)
- EF section: light red fill #FEF2F2 to visually stand out
- DO NOT add shadows, gradients, or 3D effects
- Save at 200 DPI, tight bounding box

---[END PROMPT]---
````

---

## Lưu ý khi dùng

- **Luôn dùng Code Interpreter** (GPT-4o) — không dùng DALL·E cho technical diagram.
- Nếu diagram quá chật (> 8 task trong happy path), chia AF/EF ra section riêng bên dưới lanes.
- Sau khi ChatGPT sinh ảnh, kiểm tra: gateway đúng loại? AF/EF box đúng màu? Badge số đúng thứ tự?
- Nếu sai layout, bổ sung vào chat: *"Shift T3 right by 150px, re-route arrow from G1 to T4 to avoid overlap with T3 box"*
- File output đặt tên theo convention: `UC-CON-NN_bpmn.png` hoặc `UC-CUS-NN_bpmn.png`
