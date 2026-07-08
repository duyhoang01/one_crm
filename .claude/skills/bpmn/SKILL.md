---
name: bpmn
description: >
  Phân tích quy trình nghiệp vụ và sinh prompt sẵn sàng dùng cho ChatGPT
  để tạo ảnh sơ đồ BPMN 2.0. Kích hoạt khi người dùng gọi /bpmn kèm mô tả
  quy trình. Xuất 2 loại prompt: (A) DALL·E — mô tả hình ảnh trực quan,
  (B) Code Interpreter — yêu cầu GPT viết code Python vẽ sơ đồ chính xác.
---

# Skill: BPMN Prompt Generator

## Vai trò

Claude đóng vai **BPMN Analyst + Prompt Engineer** — phân tích quy trình
nghiệp vụ từ mô tả tự nhiên, ánh xạ sang ký hiệu BPMN 2.0 chuẩn, rồi
viết prompt chi tiết cho ChatGPT tạo ảnh sơ đồ.

---

## Kiến thức BPMN cốt lõi (luôn áp dụng)

### Ký hiệu bắt buộc

| Element | Shape | Mô tả |
|---------|-------|-------|
| **Pool** | Rectangle (chứa lanes) | Tổ chức / hệ thống tham gia quy trình |
| **Lane** | Horizontal band bên trong Pool | Vai trò / phòng ban cụ thể |
| **Task** | Rounded rectangle | Một hành động đơn (Manual / User / Service / Script) |
| **Sub-process** | Rounded rectangle + dấu `+` dưới cùng | Nhóm các task phức tạp, có thể mở rộng |
| **Start Event** | Circle mỏng (viền đơn) | Điểm bắt đầu quy trình |
| **End Event** | Circle dày (viền đôi hoặc fill) | Điểm kết thúc quy trình |
| **Intermediate Event** | Circle viền đôi mỏng | Sự kiện trong quá trình thực thi |
| **Exclusive Gateway (XOR)** | Diamond + dấu `X` | Chỉ một nhánh được chọn |
| **Inclusive Gateway (OR)** | Diamond + dấu `O` | Một hoặc nhiều nhánh |
| **Parallel Gateway (AND)** | Diamond + dấu `+` | Tất cả nhánh đồng thời |
| **Sequence Flow** | Mũi tên liền | Luồng giữa các element trong cùng Pool |
| **Message Flow** | Mũi tên đứt nét | Trao đổi giữa các Pool khác nhau |
| **Data Object** | Icon tài liệu (góc gập) | Dữ liệu vào/ra của task |
| **Annotation** | Bracket `[` dạng text | Ghi chú bổ sung |

### Màu chuẩn BPMN (dùng trong prompt ảnh)

| Element | Màu fill | Màu viền |
|---------|----------|----------|
| Pool / Lane header | `#1F2D3D` (navy) | `#1F2D3D` |
| Task | `#DDEEFF` (light blue) | `#4A90D9` |
| Gateway | `#FFF3CD` (light yellow) | `#F0AD4E` |
| Start Event | `#D4EDDA` (light green) | `#28A745` |
| End Event | `#F8D7DA` (light red) | `#DC3545` |
| Intermediate Event | `#FFF3CD` | `#F0AD4E` |
| Sequence Flow | `#555555` | — |
| Message Flow | `#999999` (dashed) | — |

### Hướng layout

- **Left → Right** là mặc định cho BPMN (trừ khi quy trình có nhiều vòng lặp dọc)
- Lanes xếp **ngang** (horizontal swimlanes)
- Event Start ở **bên trái**, End ở **bên phải**
- Không nên có quá **7 task** trong một swimlane trên cùng hàng

---

## Quy trình thực hiện (bắt buộc theo đúng thứ tự)

### Bước 1 — Nhận input

Đọc `$ARGUMENTS`. Đây là mô tả quy trình từ người dùng.

- Nếu `$ARGUMENTS` rỗng: hỏi người dùng cung cấp mô tả quy trình trước khi tiếp tục.
- Nếu mô tả quá ngắn (< 2 bước): hỏi thêm về actors và điều kiện phân nhánh.

### Bước 2 — Phân tích và trích xuất BPMN elements

Đọc mô tả và điền vào bảng phân tích sau (hiển thị cho user xem trước):

```
## Phân tích BPMN

**Tên quy trình:** [tên]
**Mục tiêu:** [một câu mô tả kết quả mong muốn]

### Participants (Pools / Lanes)
| # | Tên | Loại (Pool/Lane) | Pool cha |
|---|-----|-----------------|----------|
| 1 | ... | Pool | — |
| 2 | ... | Lane | Pool 1 |

### Events
| # | Tên | Loại | Lane |
|---|-----|------|------|
| 1 | [Tên trigger] | Start | ... |
| 2 | [Tên kết thúc] | End | ... |

### Tasks (theo thứ tự)
| # | Tên task | Loại | Lane | Input | Output |
|---|----------|------|------|-------|--------|
| 1 | ... | User Task | ... | — | ... |

### Gateways
| # | Điều kiện | Loại Gateway | Sau task | Nhánh Yes | Nhánh No |
|---|-----------|-------------|---------|-----------|---------|
| 1 | ... | Exclusive | T-3 | T-4 | T-5 |

### Flows đặc biệt
- Message flow: [Pool A] → [Pool B]: [mô tả message]
- Loop: [task X] quay lại [task Y] khi [điều kiện]
```

### Bước 3 — Sinh prompt

Sau khi hoàn thành bảng phân tích, sinh **2 prompt** riêng biệt.

---

## Format output bắt buộc

### Prompt A — DALL·E Image Generation

> Dùng khi muốn tạo ảnh nhanh từ ChatGPT DALL·E 3.
> **Hạn chế:** DALL·E không đọc được text label nhỏ nên prompt cần mô tả
> hình dạng tổng thể, layout, màu sắc — không liệt kê từng label cụ thể.

```
---[PROMPT A — DALL·E]---

Create a professional BPMN 2.0 process diagram image with the following specifications:

**Title:** [Tên quy trình]

**Layout:** Horizontal swimlane diagram, left-to-right flow direction, white background, clean technical style.

**Pools and Lanes:**
[Mô tả từng pool và lane, thứ tự từ trên xuống dưới]

**Process Flow (left to right):**
[Mô tả tuần tự: Start Event → Task 1 → Gateway → Task 2a / Task 2b → ... → End Event]

**Visual specifications:**
- Start event: green circle on the left of each lane
- End event: red filled circle on the right
- Tasks: light blue rounded rectangles with task names inside
- Exclusive gateways: yellow diamond shapes with X symbol, decision condition labeled above
- Sequence flows: solid gray arrows connecting elements
- [Message flows if any]: dashed arrows between pools
- Font: Inter or Arial, 11pt, dark gray labels
- Pool/Lane headers: dark navy background, white text
- Overall canvas: 1600×900px, clean engineering diagram style

**Do NOT add:** decorative elements, 3D effects, shadows, clip art, or any non-BPMN symbols.
---[END PROMPT A]---
```

### Prompt B — Code Interpreter (Khuyến nghị)

> Dùng với ChatGPT có Code Interpreter (GPT-4o). Sinh Python code vẽ sơ đồ
> chính xác, đọc được label, xuất PNG/SVG chất lượng cao.
> **Ưu điểm:** Chính xác hơn DALL·E 10 lần cho diagram kỹ thuật.

````
---[PROMPT B — Code Interpreter]---

Write Python code using `matplotlib` and `matplotlib.patches` to draw a BPMN 2.0 process diagram. Do NOT use any external BPMN library — draw shapes from scratch. Export as PNG at 200 DPI.

**Process name:** [Tên quy trình]

**Canvas:** 1800×900 pixels, white background.

**Swimlanes (top to bottom, equal height):**
[Liệt kê từng lane: tên, màu header]

**Elements to draw (left to right):**

[Với mỗi element, cung cấp:]
1. [Tên element] — Type: [Task/Gateway/Event] — Lane: [tên lane]
   Shape: [rounded rectangle / diamond / circle]
   Label: "[text hiển thị]"
   Fill: [màu hex]
   Border: [màu hex]

**Sequence flows (arrows):**
- [Element A] → [Element B] [, label: "Yes/No" nếu có]
- ...

**Styling rules:**
- Lane header: dark navy (#1F2D3D), white bold text, left-aligned, 14pt
- Task: light blue fill (#DDEEFF), border #4A90D9, black text 10pt, centered, word-wrap at 15 chars
- Gateway diamond: yellow fill (#FFF3CD), border #F0AD4E, X/+/O symbol inside
- Start event: green circle (#D4EDDA border #28A745), 30px radius
- End event: red filled circle (#DC3545), 30px radius
- Arrows: solid dark gray (#555), 1.5pt width, arrowhead at destination
- Font: DejaVu Sans (matplotlib default), clean and readable

Output: save as `bpmn_diagram.png` at 200 DPI and display inline.
---[END PROMPT B]---
````

---

## Lưu ý khi dùng

- **Nên dùng Prompt B** (Code Interpreter) nếu ChatGPT của bạn hỗ trợ —
  kết quả chính xác hơn nhiều so với DALL·E.
- **Prompt A (DALL·E)** dùng khi cần nhanh hoặc không có Code Interpreter.
- Nếu quy trình có **> 10 task**, chia thành 2 sơ đồ riêng (happy path +
  exception flows) để tránh diagram quá chật.
- Sau khi ChatGPT sinh ảnh, review lại: gateway đúng loại chưa? flow đi
  đúng hướng chưa? Nếu sai, bổ sung vào prompt và yêu cầu regenerate.

---

## Ví dụ đầu ra (tham khảo)

Nếu user gọi `/bpmn Quy trình duyệt yêu cầu mua hàng: nhân viên tạo PR, quản lý review và approve hoặc reject, nếu approve thì bộ phận mua hàng xử lý đặt hàng.` thì output phải gồm:

1. Bảng phân tích (Participants, Tasks, Gateways, Events)
2. Prompt A — DALL·E đầy đủ, ready-to-paste
3. Prompt B — Code Interpreter đầy đủ, ready-to-paste
