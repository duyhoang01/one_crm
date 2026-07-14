# Phương án demo v2.7 — M-07 Integration Layer (Tích hợp)

> Ngày: 13/07/2026 · Người soạn: Claude (AI) · Duyệt: BA (Nguyễn Công Giang)
> Nguồn: PRD v2.6 §6.7 (FR-INT-01…06) · demo hiện hành `v2.6.0_license.html`
> **Trạng thái:** chờ duyệt để dựng `docs/demo/v2.7.0_integration.html`

---

## 1. Vì sao module này cần demo

**M-07 có 6 FR nhưng chỉ 2 FR có giao diện** — 4 FR còn lại là worker nền và HTTP endpoint:

| FR | Bản chất | Có màn hình? |
|---|---|---|
| FR-INT-01 Publish Outbound Event | Thư viện nội bộ (ghi outbox cùng transaction) | ❌ |
| FR-INT-02 Outbox Publisher Worker | Worker nền | ❌ |
| FR-INT-03 Webhook Receiver | HTTP endpoint | ❌ |
| FR-INT-04 Webhook Processor Worker | Worker nền | ❌ |
| **FR-INT-05** Xem Outbox & Webhook Inbox | **Màn hình Admin** | ✅ |
| **FR-INT-06** Retry / Reprocess thủ công | **Hành động Admin** | ✅ |

→ Demo v2.7 **không phải "vẽ lại kiến trúc"**, mà là: **dựng công cụ để một người thật xử lý một sự cố thật.**

### Giá trị nghiệp vụ lớn nhất: đóng OQ-LIC-03

M-05 đã ghi nhận một Open Question **không tự giải được**: khi nhiều license cùng ngừng cập nhật, CRM **không phân biệt** được hai nguyên nhân **cần hành động ngược nhau**:

| Triệu chứng (nhìn từ M-05) | Nguyên nhân thật | Ai phải xử lý |
|---|---|---|
| License lâu không cập nhật | **Không nhận được webhook nào** | Gọi đội sản phẩm |
| License lâu không cập nhật | **Nhận đủ webhook nhưng CRM xử lý lỗi** (đổi định dạng, mapping fail) | **Lỗi của chúng ta** — đừng gọi sản phẩm |

Dữ liệu để phân biệt nằm trong `WEBHOOK_INBOX` — tức trong M-07. **Đây là lý do chính để làm v2.7.**

---

## 2. Persona & thời điểm sử dụng

| Persona | Vào khi nào | Câu hỏi cần trả lời | Màn |
|---|---|---|---|
| **License Admin** *(người dùng chính)* | Khi M-05 báo sự cố diện rộng, hoặc khi ops báo lỗi | "Kênh với sản phẩm X đang sống hay chết? Lỗi ở phía họ hay phía mình?" | **1** |
| **License Admin** | Sau khi đã sửa nguyên nhân | "Chạy lại đống event lỗi thế nào?" | **2, 3** |
| **License Admin / CSKH*** | Khi Sales báo "sub này không active" | "Sub SUB-2026-007 đã xảy ra chuyện gì?" | **4** |
| **Auditor** | Kiểm toán | Xem được tất cả, **không** có nút retry/reprocess | 1–4 (chỉ đọc) |
| Sales / CSKH / Manager | — | **Không vào được module Tích hợp** (BR-05.1: dữ liệu vận hành nhạy cảm) | — |

*(*) Chốt Q3: chỉ **License Admin** xem payload. CSKH cần trace sub thì đi qua Timeline nghiệp vụ (M-06), không vào M-07.*

---

## 3. Ranh giới bắt buộc (YT-1 / YT-3)

| ✅ Được làm | ❌ **Cấm tuyệt đối** |
|---|---|
| Xem sự kiện đã gửi / đã nhận | **Tạo sự kiện thủ công** — đó là *ra lệnh kỹ thuật* cho sản phẩm |
| **Gửi lại** sự kiện thất bại (retry) | **Sửa nội dung** rồi gửi — CRM không được bịa dữ liệu của sản phẩm |
| **Xử lý lại** webhook lỗi (reprocess) | Gọi API sản phẩm để "hỏi trạng thái" |
| Xem chữ ký hợp lệ / không | Hiển thị `webhook_secret` |

> Nếu demo có nút **"Tạo sự kiện mới"** → đã phá YT-3. **Sẽ không vẽ nút đó.**

---

## 4. Bốn màn hình

### Màn 1 — 🩺 Tình trạng kết nối *(FR mới, xem §6)*

**Trả lời:** *"Kênh nào đang chết, và lỗi ở phía ai?"*
Mỗi sản phẩm một thẻ, chia hai nửa: **kênh gửi đi** và **kênh nhận về**.

| Nửa | Chỉ số | Nguồn |
|---|---|---|
| **Gửi đi** (CRM → sản phẩm) | Đang chờ gửi · Đang thử lại · **Thất bại vĩnh viễn** · độ trễ trung bình · lần gửi gần nhất | `OUTBOX_EVENT` |
| **Nhận về** (sản phẩm → CRM) | **Nhận gần nhất lúc nào** · số nhận trong 24h · **số xử lý lỗi** · tỉ lệ lỗi | `WEBHOOK_INBOX` |

**Bắt buộc: kết luận thành một câu** — đây là điểm cốt lõi của màn này:

| Điều kiện | Kết luận hiển thị |
|---|---|
| Không nhận webhook nào quá ngưỡng | 🔴 *"Không nhận được dữ liệu nào từ {sản phẩm} trong {X} giờ — nghi ngờ sự cố phía sản phẩm hoặc đường truyền. **Liên hệ đội sản phẩm.**"* |
| Có nhận nhưng phần lớn xử lý lỗi | 🟠 *"Nhận {n} tin nhưng {m} tin xử lý lỗi ({lý do phổ biến nhất}) — **lỗi phía CRM**, đừng gọi sản phẩm. Sửa mapping rồi xử lý lại."* |
| Có sự kiện gửi đi thất bại vĩnh viễn | 🔴 *"{n} lệnh chưa tới được {sản phẩm} — khách hàng có thể vẫn dùng dịch vụ dù đã bị dừng."* |
| Bình thường | 🟢 *"Kênh hoạt động bình thường — nhận tin gần nhất {X} phút trước."* |

### Màn 2 — 📤 Sự kiện gửi đi (Outbox)

**Trả lời:** *"Lệnh của CRM có tới nơi không?"*

| Cột | Nội dung |
|---|---|
| Trạng thái | Chờ gửi · Đã gửi · Đang thử lại · **Thất bại vĩnh viễn** (badge màu) |
| Loại sự kiện | Tên nghiệp vụ, không phải mã kỹ thuật: "Tạo subscription", "Tạm dừng", "Thu hồi", "Gia hạn", "Yêu cầu cập nhật mức sử dụng" |
| Khách hàng / Subscription | Tên KH + mã sub (link → M-05 / M-03) |
| Sản phẩm | Icon + tên |
| Số lần đã thử | "{n}/10" — đỏ khi chạm trần |
| Lỗi cuối | Câu ngắn gọn |
| Thời điểm | Tạo lúc / gửi thành công lúc |

**Bộ lọc:** trạng thái · sản phẩm · loại sự kiện · **mã subscription** · khoảng thời gian.
**Chi tiết (drawer):** nội dung gửi (định dạng đọc được) · lịch sử từng lần thử + lỗi · **nút Gửi lại**.

### Màn 3 — 📥 Sự kiện nhận về (Webhook Inbox)

**Trả lời:** *"Sản phẩm có báo về không, và ta xử lý được không?"*

| Cột | Nội dung |
|---|---|
| Trạng thái | Đã nhận · Đã xử lý · Đang thử lại · **Xử lý lỗi** |
| Loại sự kiện | "License đã kích hoạt", "License tạm dừng", "Báo cáo mức sử dụng"… |
| Khách hàng / Subscription | Từ `correlation_id`. **Không map được → nhãn "Không xác định được subscription"** |
| Chữ ký | ✅ Hợp lệ / ❌ Không hợp lệ |
| **Lỗi ở bước nào** | *Thiếu trường bắt buộc {tên trường}* · *Không tìm thấy subscription* · *Loại sự kiện lạ* · *Sai định dạng dữ liệu* |
| Nhận lúc / Xử lý lúc | — |

**Chi tiết:** nội dung nhận · lý do lỗi cụ thể · **nút Xử lý lại**.

### Màn 4 — 🔍 Tra cứu theo subscription

**Trả lời:** *"Sub này đã xảy ra chuyện gì?"* — màn Admin/CSKH thực sự dùng khi Sales kêu cứu.

Nhập mã subscription → **một dòng thời gian gộp cả hai chiều**:

```
14/07 09:00  📤 CRM gửi: Tạm dừng subscription          → Đã gửi
14/07 09:00  📥 Sản phẩm báo: (chưa có phản hồi)
13/07 08:00  📥 Sản phẩm báo: Mức sử dụng 287/300       → Đã xử lý
12/07 10:15  📥 Sản phẩm báo: License đã kích hoạt      → ❌ Xử lý lỗi: thiếu trường "expiration_date"
```

Kèm liên kết sang **Timeline nghiệp vụ** (M-06) để đối chiếu: *sự kiện kỹ thuật* ↔ *điều khách hàng thấy*.

---

## 5. Liên kết chéo — thứ mà module rời rạc không làm được

| Từ | Đến | Vì sao |
|---|---|---|
| Banner M-05 *"Không nhận được dữ liệu từ CMC EDR"* | **Màn 1** của đúng sản phẩm đó | Đóng OQ-LIC-03: biết ngay lỗi ở phía ai |
| Hàng đợi "Cần xử lý" (M-05), dòng lệch trạng thái | **Màn 4** của đúng subscription đó | Xem lệnh đã gửi chưa, sản phẩm phản hồi gì |
| Timeline subscription (M-06) | **Màn 4** | Đối chiếu sự kiện kỹ thuật ↔ nghiệp vụ |
| Màn 2/3 → tên KH, mã sub | M-05 / M-03 / M-01 | Quay lại ngữ cảnh thương mại |

---

## 6. Đề xuất bổ sung PRD (chốt 13/07/2026, **chưa cập nhật PRD — chờ lệnh**)

### FR-INT-07 (mới) — Xem tình trạng kênh tích hợp

| Thuộc tính | Nội dung |
|---|---|
| **Mô tả** | Tổng hợp tình trạng kênh gửi/nhận theo từng sản phẩm; **kết luận nguyên nhân** (phía sản phẩm hay phía CRM) để ops hành động đúng. |
| **Actor** | License Admin, Auditor (chỉ đọc) |
| **BR-07.1** | Phân biệt 2 nguyên nhân: **không nhận được tin nào** (nghi phía sản phẩm) vs **nhận được nhưng xử lý lỗi** (lỗi phía CRM). |
| **BR-07.2** | Ngưỡng "im lặng bất thường" lấy từ `runtime_config.usage_push_interval` của sản phẩm (chốt: 24h → ngưỡng 48h) — **không hardcode**. |
| **BR-07.3** | Kết luận hiển thị **thành câu tiếng Việt kèm hành động cần làm**, không chỉ hiện số liệu thô. |
| **BR-07.4** | Loại trừ khách hàng **triển khai tại chỗ** (không có kênh tự động). |

### FR-INT-06 bổ sung — Retry / Reprocess **hàng loạt**

| Mã | Nội dung |
|---|---|
| **BR-06.6** | Cho phép **chọn nhiều dòng** hoặc **"Xử lý lại tất cả lỗi của sản phẩm X"**. *Lý do: sau khi sửa mapping, không ai bấm tay 42 lần — nếu không có, ops sẽ chạy script ngoài hệ thống và **mất audit trail**.* |
| **BR-06.7** | **Bắt buộc nhập lý do** cho thao tác hàng loạt; ghi **một bản ghi audit cho cả lô** (kèm số lượng + danh sách id). |
| **BR-06.8** | Giới hạn số lượng mỗi lô (đề xuất **500**) để không dội tải; vượt → chia lô. |
| **BR-06.9** | Vẫn **idempotent** theo `event_id` — xử lý lại tin đã thành công thì không nhân đôi tác động. |
| **BR-06.10** | **Xử lý lại = replay CHUỖI** *(chốt 13/07/2026)*: gom toàn bộ sự kiện của **cùng subscription** có `occurred_at ≥` sự kiện được chọn (**kể cả cái đã xử lý thành công**), xử lý **tuần tự theo `occurred_at` tăng dần**.<br>*Lý do:* **(a)** không thể chặn tin cũ — nếu cấm xử lý lại `license.active` đang lỗi thì license **mãi không về đúng trạng thái**; **(b)** nhưng replay một tin cũ **lẻ** sẽ **ghi đè ngược** trạng thái (replay `active` 10/07 sau khi `suspended` 12/07 đã áp dụng → mirror sai). Replay cả chuỗi cho ra **trạng thái cuối đúng** và giữ đúng thứ tự state machine (chưa active thì không suspend được). |
| **BR-06.11** | Trong chế độ replay: **KHÔNG bắn lại thông báo** (M-08) và **KHÔNG sinh sự kiện gửi đi mới** (outbox).<br>*Chốt 13/07/2026: đây là **nghiệp vụ kỹ thuật nội bộ của CRM, khách hàng không cần biết**. Nếu thiếu quy tắc này, replay 42 sự kiện = khách nhận 42 thông báo "license đã bị tạm dừng" — sự cố còn to hơn cái đang sửa.* |
| **BR-06.12** | Retry hàng loạt: gom theo **subscription**; mỗi subscription là **một chuỗi tuần tự**, các subscription khác nhau chạy song song. Giữ đúng BR-04.5 (thứ tự theo `correlation_id`). |
| **BR-06.13** | Trước khi chạy, giao diện **phải hiện rõ** sẽ replay những sự kiện nào và **trạng thái cuối cùng dự kiến** — không âm thầm. Ghi 1 dòng vào Timeline nghiệp vụ: *"Đã xử lý lại {n} sự kiện tích hợp — {Admin}, {lý do}"*. |

---

## 7. Dữ liệu demo — 2 kịch bản **đối lập** (chứng minh giá trị)

| Sản phẩm | Kịch bản | Kết luận màn 1 phải ra |
|---|---|---|
| **CMC EDR** | Webhook inbox **rỗng 31 giờ**; outbox vẫn gửi bình thường | 🔴 *"Không nhận được dữ liệu nào từ CMC EDR trong 31 giờ — liên hệ đội sản phẩm"* |
| **CMC Antivirus** | Nhận **42 webhook, 42 cái xử lý lỗi**, cùng lý do *thiếu trường `expiration_date`* (sản phẩm đổi định dạng) | 🟠 *"Nhận 42 tin nhưng 42 tin xử lý lỗi — **lỗi phía CRM**, đừng gọi sản phẩm"* |
| **CMC EDR** (outbox) | **3 lệnh tạm dừng thất bại vĩnh viễn** — khớp đúng banner "Lệnh không được thực thi" ở M-05 | 🔴 *"3 lệnh chưa tới được CMC EDR — khách vẫn dùng dịch vụ dù đã bị dừng"* |
| **C-Shield** | Kênh khoẻ mạnh | 🟢 *"Kênh hoạt động bình thường"* |
| Các case lẻ | Chữ ký không hợp lệ · không map được subscription (orphan) · loại sự kiện lạ · đang thử lại | Mỗi cái 1 dòng trong màn 3 |

---

## 8. Câu hỏi mở (ghi nhận, chưa giải)

| Mã | Nội dung | Ảnh hưởng |
|---|---|---|
| **OQ-INT-01** | **Xoay khoá bảo mật webhook** (`webhook_secret`, PRD BR-03.7 có grace 7 ngày) — có làm giao diện xoay khoá không, hay thao tác ở hạ tầng? | Nếu có → thêm màn cấu hình tích hợp |
| ~~**OQ-INT-02**~~ | **ĐÃ CHỐT 13/07/2026** → **replay chuỗi** (BR-06.10…06.13): không chặn tin cũ, nhưng không replay lẻ; replay không bắn thông báo. | ✅ Đóng |
| **OQ-INT-03** | Sự kiện thất bại vĩnh viễn để bao lâu thì dọn? Lưu payload bao lâu (dung lượng + quyền riêng tư)? | Vận hành dài hạn |



---

## 9. Việc cần làm (sau khi duyệt phương án)

1. Dựng `docs/demo/v2.7.0_integration.html` (clone v2.6) — 4 màn + liên kết chéo + dữ liệu 2 kịch bản đối lập.
2. Tuân thủ **6 quy tắc bắt buộc về demo** (CLAUDE.md §8) + tự review như PO.
3. Chốt demo → viết FRS `UC-INT-01..04` + đề xuất **FR-INT-07** và **BR-06.6…06.9** cho PRD.
4. ~~Chốt OQ-INT-02~~ — **đã chốt**: replay chuỗi, tuần tự theo thời gian, không bắn thông báo.
