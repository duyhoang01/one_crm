# UC-INT-06 — Tra cứu theo subscription

> Module: M-07 Integration Layer | Phiên bản: 1.0 | Ngày: 14/07/2026
> Trạng thái: Draft for Review · **§3 Mô tả giao diện: chờ dựng demo**

---

## 1. Thông tin chung

| Thuộc tính | Nội dung |
|---|---|
| **Mã Use Case** | UC-INT-06 |
| **Tên** | Tra cứu theo subscription |
| **Mô tả** | Xem **toàn bộ trao đổi dữ liệu hai chiều** của **một** subscription trên **một dòng thời gian gộp**, kèm **kết luận** vấn đề đang nằm ở đâu. Đây là màn được dùng khi **Sales kêu cứu**: *"khách này sao chưa dùng được?"* |
| **Tác nhân** | License Admin *(xem + hành động)* · Auditor *(chỉ xem)* |
| **Tiền điều kiện** | Quyền `integration:view`. |
| **Hậu điều kiện** | Chỉ đọc. *(Hành động xử lý lại thuộc UC-INT-05.)* |
| **Trigger** | (1) Tab **Tra cứu theo subscription**. (2) Bấm mã subscription từ UC-INT-04 / UC-INT-05. (3) Từ hàng đợi sự cố của UC-LIC-01. |
| **Liên kết** | UC-INT-04, UC-INT-05, UC-LIC-02, UC-SUB-03 (tiến độ khách hàng thấy) |

### Business Rules

| Mã | Nội dung | Vì sao |
|---|---|---|
| **BR-01** | Hiển thị **cả hai chiều** trên **một** dòng thời gian: *lệnh CRM gửi* (📤) và *tin sản phẩm báo về* (📥), sắp theo `occurred_at`. | Tách hai chiều ra hai chỗ thì người dùng phải tự ghép — mà ghép chính là việc cần làm. |
| **BR-02** | 🔴 **Gộp các sự kiện liên tiếp giống hệt nhau** *(cùng chiều · cùng loại · cùng trạng thái · cùng lý do lỗi)* thành **một dòng "× N"** kèm khoảng thời gian. | 40 tin *"báo mức sử dụng — cùng một lỗi"* **không kể thêm được gì**; chúng chỉ **chôn mất** hai sự kiện thật sự giải thích vấn đề. Đây là lỗi mà bản demo đầu tiên mắc phải. |
| **BR-03** | 🔴 **Bắt buộc có KẾT LUẬN ở đầu màn**: vấn đề là gì · **lỗi ở phía ai** · việc phải làm — kèm nút hành động. | Persona vào đây **đang bị Sales hỏi**. Bắt họ tự đọc 42 dòng rồi tự suy = màn hình vô dụng đúng lúc cần nhất. |
| **BR-04** | **Màn trống phải gợi ý sẵn** các subscription **đang có sự cố tích hợp**, xếp nặng trước. | **Không ai thuộc lòng mã subscription.** Ô tìm kiếm rỗng bắt người dùng sang màn khác tìm mã rồi quay lại dán — trong khi chính màn này đã có sẵn dữ liệu đó. |
| **BR-05** | Liên kết chéo: **Xem license** (UC-LIC-02) · **Tiến độ khách hàng thấy** (UC-SUB-03 Timeline). | Phân biệt rõ **sự kiện kỹ thuật** (màn này) với **điều khách hàng nhìn thấy** (Timeline). |
| **BR-06** | Không tìm thấy subscription → nói rõ *"Không tìm thấy {mã}"*, **vẫn giữ** danh sách gợi ý (BR-04). | — |

### Kết luận — bảng quyết định (BR-03)

| Điều kiện | Kết luận | Hành động gợi ý |
|---|---|---|
| Có lệnh **thất bại vĩnh viễn** | *"{n} lệnh của CRM chưa tới được {sản phẩm}"* — khách **có thể vẫn dùng được** dù CRM đã ghi nhận dừng | → UC-INT-04 (gửi lại) |
| Có lệnh **bị sản phẩm từ chối** | *"{Sản phẩm} **từ chối** lệnh {tên}: {lý do thật}"* | → đội sản phẩm, kèm lý do |
| Có tin **CRM xử lý lỗi** | *"{n} tin từ {sản phẩm} mà CRM xử lý lỗi"* — sản phẩm **có gửi**, **CRM đọc hỏng** → **lỗi phía CRM, đừng gọi đội sản phẩm** | → **Xử lý lại theo chuỗi** (UC-INT-05) |
| Không có gì bất thường | *"Không có sự cố tích hợp nào với subscription này"* — nếu khách vẫn kêu thì **vấn đề nằm ngoài kênh tích hợp** | — |

---

## 2. Luồng nghiệp vụ

### 2.1 Luồng chính

| Bước | Actor | Hành động / Phản hồi |
|---|---|---|
| **1** | Người dùng | Mở tab **Tra cứu**; hoặc tới đây kèm sẵn mã subscription *(từ UC-INT-04/05, UC-LIC-01)*. |
| **2** | System | **[Gateway — Đã có mã subscription chưa?]** Chưa → **AF-01** *(màn gợi ý)*. Rồi → tiếp bước 3. |
| **3** | System | **[Gateway — Subscription tồn tại?]** Không → **EF-01**. Có → tiếp bước 4. |
| **4** | System | Lấy **toàn bộ** sự kiện hai chiều của subscription, sắp theo `occurred_at` (BR-01); **gộp** các sự kiện liên tiếp giống hệt nhau (BR-02). |
| **5** | System | Chấm **kết luận** theo bảng quyết định; render: header khách hàng/gói/sản phẩm + liên kết chéo (BR-05) → **hộp kết luận** (BR-03) → dòng thời gian đã gộp. |
| **6** | Người dùng | **[Gateway — Làm gì?]**<br>→ Bấm hành động ở hộp kết luận → **UC-INT-04 / UC-INT-05** (**End 2**) · **Xem license** → UC-LIC-02 (**End 3**) · **Tiến độ khách hàng thấy** → UC-SUB-03 (**End 4**) · Tra mã khác → về bước 3 · Không thao tác → **End 1**. |

### 2.2 Luồng phụ

**[AF-01: Màn chưa có mã — gợi ý subscription đang có sự cố]**

| Bước | Actor | Hành động / Phản hồi |
|---|---|---|
| **AF-01a** | System | Dựng danh sách subscription **đang có sự cố tích hợp** *(có lệnh thất bại vĩnh viễn, hoặc có tin CRM xử lý lỗi)*, xếp **nặng trước** (BR-04). |
| **AF-01b** | System | Hiển thị ô tìm kiếm + danh sách gợi ý *(tên khách · sản phẩm · mã sub · loại sự cố + số lượng)*. Không có sự cố nào → *"Hiện không có subscription nào gặp sự cố tích hợp."* |
| **AF-01c** | Người dùng | Bấm một dòng gợi ý → về bước 3 với mã đó. |

### 2.3 Luồng ngoại lệ

**[EF-01: Không tìm thấy subscription]**

| Bước | Actor | Hành động / Phản hồi |
|---|---|---|
| **EF-01a** | System | Báo *"Không tìm thấy {mã}"*; **vẫn giữ danh sách gợi ý** (BR-06). |
| → | — | Ở lại màn (**End 1**). |

### 2.4 Điểm kết thúc

| End | Mô tả |
|---|---|
| **End 1** | Ở lại màn tra cứu. |
| **End 2** | Sang UC-INT-04 (gửi lại) hoặc UC-INT-05 (xử lý lại chuỗi). |
| **End 3** | Sang UC-LIC-02 (chi tiết license). |
| **End 4** | Sang UC-SUB-03 tab Timeline (tiến độ khách hàng thấy). |

---

## 3. Mô tả giao diện

> ⏳ **Chờ dựng demo.**
> Ràng buộc bắt buộc: **hộp kết luận ở đầu màn** (BR-03) · **gộp sự kiện lặp** (BR-02) · **màn trống phải gợi ý** subscription đang có sự cố (BR-04).

---

## 4. Acceptance Criteria

| Mã | Given | When | Then |
|---|---|---|---|
| AC-INT-06-01 | `SUB-2026-021` có **42 sự kiện**, trong đó 40 tin usage **cùng một lỗi** liên tiếp. | Tra cứu. | Dòng thời gian gộp còn **3 dòng**; dòng gộp ghi **"× 40 tin giống nhau"** + khoảng thời gian (BR-02). Hai sự kiện quan trọng *(kích hoạt, tạm dừng)* **nhìn thấy ngay**, không bị chôn. |
| AC-INT-06-02 | Cùng subscription trên. | Tra cứu. | **Hộp kết luận đầu màn**: *"41 tin từ CMC Antivirus mà CRM xử lý lỗi — sản phẩm **có gửi dữ liệu**, nhưng CRM không đọc được. **Lỗi phía CRM, đừng gọi đội sản phẩm.**"* + nút **Xử lý lại** (BR-03). |
| AC-INT-06-03 | Subscription có **2 lệnh thất bại vĩnh viễn**. | Tra cứu. | Kết luận: *"2 lệnh của CRM chưa tới được {sản phẩm}"* + cảnh báo khách **có thể vẫn đang dùng dịch vụ** + nút sang UC-INT-04. |
| AC-INT-06-04 | Subscription **không có sự cố nào**. | Tra cứu. | Kết luận: *"Không có sự cố tích hợp nào với subscription này"* + gợi ý *"nếu khách vẫn kêu thì vấn đề nằm ngoài kênh tích hợp"*. |
| AC-INT-06-05 | Mở tab **lần đầu**, chưa nhập mã. | Mở màn. | Hiện **danh sách subscription đang có sự cố**, xếp nặng trước — bấm một phát là vào (BR-04). **Không** phải ô trống bắt thuộc lòng mã. |
| AC-INT-06-06 | Hệ thống **không có sự cố tích hợp nào**. | Mở tab. | *"Hiện không có subscription nào gặp sự cố tích hợp."* |
| AC-INT-06-07 | Nhập mã **không tồn tại**. | Tra cứu. | Báo *"Không tìm thấy {mã}"*; **danh sách gợi ý vẫn còn** (BR-06, EF-01). |
| AC-INT-06-08 | Đang xem một subscription. | Bấm **"Tiến độ khách hàng thấy"**. | Sang **UC-SUB-03 tab Timeline** — để đối chiếu *sự kiện kỹ thuật* ↔ *điều khách hàng nhìn thấy* (BR-05). |
| AC-INT-06-09 | **Auditor** đăng nhập. | Tra cứu. | Xem được đầy đủ; hộp kết luận **không có nút hành động**. |

---

## 5. Review Checklist

### Lịch sử thay đổi

| Phiên bản | Ngày | Tác giả | Mô tả |
|---|---|---|---|
| 1.0 | 14/07/2026 | Claude (AI) | Khởi tạo. Trace: PRD v2.6 §6.7.6 (FR-INT-05 — *"trace webhook của sub X khi Sales báo lỗi"*).<br>**Bổ sung so với PRD:** BR-01 *(một dòng thời gian gộp hai chiều)* · 🔴 BR-02 *(gộp sự kiện lặp — bản demo đầu tiên đổ 42 dòng y hệt nhau, chôn mất 2 sự kiện thật)* · 🔴 BR-03 *(bắt buộc kết luận, không bắt người dùng tự suy)* · BR-04 *(màn trống gợi ý — không ai thuộc mã subscription)*. |

### Nghiệp vụ
- ✅ Trả lời được **đúng câu Sales đang hỏi**, trong 3 giây, không bắt đọc 42 dòng
- ✅ Nói rõ **lỗi ở phía ai** — phía sản phẩm hay phía CRM
- ✅ Màn trống **không bỏ rơi người dùng**
- ✅ Phân biệt rõ **sự kiện kỹ thuật** ↔ **điều khách hàng thấy** (liên kết sang Timeline)

---

## Footer

| Mục | Nội dung |
|---|---|
| **Giao diện** | ⏳ Chờ dựng demo |
| **UC liên quan** | UC-INT-04, UC-INT-05, UC-LIC-02, UC-SUB-03 |
| **Trace PRD** | §6.7.6 (FR-INT-05) |
