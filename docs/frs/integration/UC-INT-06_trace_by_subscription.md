# UC-INT-06 — Tra cứu theo subscription

> Module: M-07 Integration Layer | Phiên bản: 2.0 | Ngày: 15/07/2026
> Trạng thái: Draft for Review · **Đã có demo** — gỡ hộp tóm tắt/kết luận (xem §5)

---

## 1. Thông tin chung

| Thuộc tính | Nội dung |
|---|---|
| **Mã Use Case** | UC-INT-06 |
| **Tên** | Tra cứu theo subscription |
| **Mô tả** | Xem **toàn bộ trao đổi dữ liệu hai chiều** của **một** subscription trên **một dòng thời gian gộp** — mỗi dòng tự mang đủ ngữ cảnh (trạng thái + lý do lỗi). **Không có hộp tóm tắt/kết luận** *(gỡ 15/07 — xem §5)*. Đây là màn được dùng khi **Sales kêu cứu**: *"khách này sao chưa dùng được?"* |
| **Tác nhân** | License Admin *(xem + hành động)* · Auditor *(chỉ xem)* |
| **Tiền điều kiện** | Quyền `integration:view`. |
| **Hậu điều kiện** | Chỉ đọc. *(Hành động xử lý lại thuộc UC-INT-05.)* |
| **Trigger** | (1) Tab **Tra cứu theo subscription**. (2) Bấm mã subscription từ UC-INT-04 / UC-INT-05. (3) Từ hàng đợi sự cố của UC-LIC-01. |
| **Liên kết** | UC-INT-04, UC-INT-05, UC-LIC-02, UC-SUB-03 (tiến độ khách hàng thấy) |

### Business Rules

| Mã | Nội dung | Vì sao |
|---|---|---|
| **BR-01** | Hiển thị **cả hai chiều** trên **một** dòng thời gian: *events CRM gửi* (📤) và *events sản phẩm báo về* (📥), sắp theo `occurred_at`. | Tách hai chiều ra hai chỗ thì người dùng phải tự ghép — mà ghép chính là việc cần làm. |
| **BR-02** | 🔴 **Gộp các sự kiện liên tiếp giống hệt nhau** *(cùng chiều · cùng loại · cùng trạng thái · cùng lý do lỗi)* thành **một dòng "× N"** kèm khoảng thời gian. | 40 events *"báo mức sử dụng — cùng một lỗi"* **không kể thêm được gì**; chúng chỉ **chôn mất** hai sự kiện thật sự giải thích vấn đề. Đây là lỗi mà bản demo đầu tiên mắc phải. |
| ~~**BR-03**~~ | ❌ **Đã gỡ (rà lại 15/07).** Bản trước có "hộp kết luận / tóm tắt thống kê" ở đầu màn. **Bỏ hoàn toàn** — xem lý do ở §5 Lịch sử thay đổi. Màn giờ chỉ có **dòng thời gian gộp hai chiều** (BR-01/BR-02), **không có** hộp tóm tắt hay kết luận nào. | Mọi phiên bản tóm tắt đều **buộc phải suy luận** (lỗi tại ai / hậu quả với khách) mà CRM không đủ dữ kiện để phán đúng (YT-1). Người xem tự đọc dòng thời gian — mỗi dòng đã có trạng thái + lý do lỗi inline. |
| **BR-04** | **Màn trống phải gợi ý sẵn** các subscription **đang có sự cố tích hợp**, xếp nặng trước. | **Không ai thuộc lòng mã subscription.** Ô tìm kiếm rỗng bắt người dùng sang màn khác tìm mã rồi quay lại dán — trong khi chính màn này đã có sẵn dữ liệu đó. |
| **BR-05** | Liên kết chéo: **Xem license** (UC-LIC-02) · **Tiến độ khách hàng thấy** (UC-SUB-03 Timeline). | Phân biệt rõ **sự kiện kỹ thuật** (màn này) với **điều khách hàng nhìn thấy** (Timeline). |
| **BR-06** | Không tìm thấy subscription → nói rõ *"Không tìm thấy {mã}"*, **vẫn giữ** danh sách gợi ý (BR-04). | — |
| **BR-07** | **Mỗi dòng thời gian tự mang đủ ngữ cảnh chẩn đoán**: chiều (📤/📥) · tên nghiệp vụ · badge trạng thái · **lý do lỗi inline** *(với dòng lỗi)* · thời điểm. | Vì không còn hộp tóm tắt, dòng thời gian phải **tự đủ** để người vận hành đọc ra vấn đề — không cần một câu diễn giải phía trên. |

---

## 2. Luồng nghiệp vụ

### 2.1 Luồng chính

| Bước | Actor | Hành động / Phản hồi |
|---|---|---|
| **1** | Người dùng | Mở tab **Tra cứu**; hoặc tới đây kèm sẵn mã subscription *(từ UC-INT-04/05, UC-LIC-01)*. |
| **2** | System | **[Gateway — Đã có mã subscription chưa?]** Chưa → **AF-01** *(màn gợi ý)*. Rồi → tiếp bước 3. |
| **3** | System | **[Gateway — Subscription tồn tại?]** Không → **EF-01**. Có → tiếp bước 4. |
| **4** | System | Lấy **toàn bộ** sự kiện hai chiều của subscription, sắp theo `occurred_at` (BR-01); **gộp** các sự kiện liên tiếp giống hệt nhau (BR-02). |
| **5** | System | Render: header khách hàng/gói/sản phẩm + liên kết chéo (BR-05) → **dòng thời gian gộp hai chiều** (BR-01/BR-02), mỗi dòng đủ ngữ cảnh chẩn đoán (BR-07). **Không** có hộp tóm tắt/kết luận. |
| **6** | Người dùng | **[Gateway — Làm gì?]**<br>→ **Xem license** → UC-LIC-02 (**End 3**) · **Tiến độ khách hàng thấy** → UC-SUB-03 (**End 4**) · Tra mã khác → về bước 3 · Không thao tác → **End 1**.<br>*(Muốn gửi lại / xử lý lại → tự chuyển sang tab **Sự kiện gửi đi** / **Sự kiện nhận về** — màn này **chỉ đọc**, không có nút hành động, đúng Hậu điều kiện.)* |

### 2.2 Luồng phụ

**[AF-01: Màn chưa có mã — gợi ý subscription đang có sự cố]**

| Bước | Actor | Hành động / Phản hồi |
|---|---|---|
| **AF-01a** | System | Dựng danh sách subscription **đang có sự cố tích hợp** *(có event gửi đi thất bại vĩnh viễn, hoặc có event CRM xử lý lỗi)*, xếp **nặng trước** (BR-04). |
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
| **End 3** | Sang UC-LIC-02 (chi tiết license). |
| **End 4** | Sang UC-SUB-03 tab Timeline (tiến độ khách hàng thấy). |

*(End 2 cũ — "sang UC-INT-04/05" — đã gỡ: màn này chỉ đọc, không còn nút hành động trực tiếp. Muốn gửi lại/xử lý lại thì dùng tab Sự kiện gửi đi / nhận về.)*

---

## 3. Mô tả giao diện

Demo: `v2.7.0_integration.html`, tab **"Tra cứu theo subscription"** *(`intRenderTrace`)*.

Bố cục 3 phần: **(1) ô tìm mã sub** · **(2) header** (khách/gói/sản phẩm + nút Xem license, Tiến độ khách hàng thấy) · **(3) dòng thời gian gộp hai chiều**. **Không** có hộp tóm tắt/kết luận nào ở giữa (BR-03 đã gỡ).

Ràng buộc bắt buộc: **gộp sự kiện lặp** thành dòng "× N" (BR-02) · mỗi dòng lỗi **hiện lý do inline** (BR-07) · **màn trống phải gợi ý** subscription đang có sự cố (BR-04).

---

## 4. Acceptance Criteria

| Mã | Given | When | Then |
|---|---|---|---|
| AC-INT-06-01 | `SUB-2026-021` có **42 sự kiện**, trong đó 40 events usage **cùng một lỗi** liên tiếp. | Tra cứu. | Dòng thời gian gộp còn **3 dòng**; dòng gộp ghi **"× 40 events giống nhau"** + khoảng thời gian (BR-02). Hai sự kiện quan trọng *(kích hoạt, tạm dừng)* **nhìn thấy ngay**, không bị chôn. |
| AC-INT-06-02 | `SUB-2026-021` có event nhận về **Xử lý lỗi** *(thiếu trường "ngày hết hạn")*. | Tra cứu. | Dòng thời gian tương ứng có badge **Xử lý lỗi** + **lý do inline** *"Thiếu trường bắt buộc 'ngày hết hạn'..."* ngay dưới tên event (BR-07). **KHÔNG** có hộp tóm tắt/kết luận nào ở đầu màn (BR-03 đã gỡ). |
| AC-INT-06-03 | Subscription có **event gửi đi thất bại vĩnh viễn**. | Tra cứu. | Dòng thời gian tương ứng có badge **Thất bại vĩnh viễn** + lý do lỗi inline *(vd "Không kết nối được tới hàng đợi...")*. **Không** có câu suy luận "khách có thể vẫn đang dùng dịch vụ" ở đầu màn. |
| AC-INT-06-04 | Subscription **không có events nào đang lỗi**. | Tra cứu. | Dòng thời gian hiện các sự kiện bình thường (badge Đã gửi / Đã xử lý), **không** có hộp "Không có sự cố" hay thông báo tổng nào — người xem tự thấy không có dòng đỏ. |
| AC-INT-06-05 | Mở tab **lần đầu**, chưa nhập mã. | Mở màn. | Hiện **danh sách subscription đang có sự cố**, xếp nặng trước — bấm một phát là vào (BR-04). **Không** phải ô trống bắt thuộc lòng mã. |
| AC-INT-06-06 | Hệ thống **không có sự cố tích hợp nào**. | Mở tab. | *"Hiện không có subscription nào gặp sự cố tích hợp."* |
| AC-INT-06-07 | Nhập mã **không tồn tại**. | Tra cứu. | Báo *"Không tìm thấy {mã}"*; **danh sách gợi ý vẫn còn** (BR-06, EF-01). |
| AC-INT-06-08 | Đang xem một subscription. | Bấm **"Tiến độ khách hàng thấy"**. | Sang **UC-SUB-03 tab Timeline** — để đối chiếu *sự kiện kỹ thuật* ↔ *điều khách hàng nhìn thấy* (BR-05). |
| AC-INT-06-09 | **Auditor** đăng nhập. | Tra cứu. | Xem được đầy đủ dòng thời gian; màn **chỉ đọc**, không có nút hành động nào (đúng Hậu điều kiện — hành động thuộc UC-INT-04/05). |

---

## 5. Review Checklist

### Lịch sử thay đổi

| Phiên bản | Ngày | Tác giả | Mô tả |
|---|---|---|---|
| 1.0 | 14/07/2026 | Claude (AI) | Khởi tạo. Trace: PRD v2.6 §6.7.6 (FR-INT-05 — *"trace webhook của sub X khi Sales báo lỗi"*).<br>**Bổ sung so với PRD:** BR-01 *(một dòng thời gian gộp hai chiều)* · 🔴 BR-02 *(gộp sự kiện lặp — bản demo đầu tiên đổ 42 dòng y hệt nhau, chôn mất 2 sự kiện thật)* · 🔴 BR-03 *(bắt buộc kết luận, không bắt người dùng tự suy)* · BR-04 *(màn trống gợi ý — không ai thuộc mã subscription)*. |
| 1.1 | 15/07/2026 | Claude (AI) | Đổi đơn vị đếm "lệnh"/"tin" → **"events"** (tiếng Anh, thống nhất 2 chiều) theo yêu cầu BA — xem UC-INT-03 BR-08. |
| 1.2 | 15/07/2026 | Claude (AI) | *(bước trung gian trong ngày)* Từng thử hạ "kết luận lỗi tại ai" xuống "tóm tắt thuần thống kê". Nhưng khi rà tiếp phát hiện **ngay cả tóm tắt thống kê vẫn buộc phải suy luận**: câu *"khách có thể vẫn đang dùng dịch vụ"* chỉ đúng với lệnh Tạm dừng/Thu hồi — **sai ngược** với Khôi phục (khách vẫn bị khoá) và **vô nghĩa** với lệnh Yêu cầu cập nhật mức dùng *(bằng chứng: SUB-2026-005 có event chết là force_sync)*. |
| **2.0** | 15/07/2026 | Claude (AI) | **🔴 GỠ HOÀN TOÀN hộp tóm tắt/kết luận (BR-03) — theo quyết định BA.** Kết luận sau 2 vòng rà: **mọi** dạng tóm tắt trên màn này đều phải suy luận (lỗi tại ai / hậu quả với khách) mà CRM — passive-observer — không đủ dữ kiện phán đúng cho mọi loại event ⇒ không viết được thành BR chắc chắn cho dev. Màn giờ chỉ còn **header + dòng thời gian gộp hai chiều**; mỗi dòng lỗi tự mang **lý do inline** (BR-07 mới) để người vận hành tự đọc. Bỏ luôn nút hành động trên màn này (đúng Hậu điều kiện "chỉ đọc" — hành động thuộc UC-INT-04/05). Gỡ End 2. Demo `intTraceFacts` đã xoá. |

### Nghiệp vụ
- ✅ Xem được **toàn bộ trao đổi hai chiều** của một sub trên một dòng thời gian — thứ mà 2 tab kia (một chiều, toàn hệ thống) không cho
- ✅ **Không tự phán** lỗi tại ai / hậu quả với khách — chỉ trưng **sự thật quan sát được** (trạng thái + lý do lỗi), để người vận hành tự kết luận (YT-1)
- ✅ Màn trống **không bỏ rơi người dùng** (vẫn gợi ý sub đang có sự cố — BR-04)
- ✅ Phân biệt rõ **sự kiện kỹ thuật** ↔ **điều khách hàng thấy** (liên kết sang Timeline)
- ⚠️ **Đánh đổi đã chấp nhận**: mất "câu trả lời trong 3 giây" — người vận hành phải tự đọc dòng thời gian. Bù lại: không bao giờ đưa ra kết luận sai. Nếu sau này cần tóm tắt, phải là loại **không phụ thuộc loại event** mới an toàn.

---

## Footer

| Mục | Nội dung |
|---|---|
| **Giao diện** | ✅ Có demo — `v2.7.0_integration.html`, tab "Tra cứu theo subscription" |
| **UC liên quan** | UC-INT-04, UC-INT-05, UC-LIC-02, UC-SUB-03 |
| **Trace PRD** | §6.7.6 (FR-INT-05) |
