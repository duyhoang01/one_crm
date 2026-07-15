# UC-INT-01 — Phát hành sự kiện ra sản phẩm (Outbound)

> Module: M-07 Integration Layer | Phiên bản: 1.0 | Ngày: 14/07/2026
> Trạng thái: Draft for Review · **Tính năng NGẦM — không có giao diện người dùng**
> Danh mục sự kiện: [Phụ lục A](_event_catalog.md)

---

## 1. Thông tin chung

| Thuộc tính | Nội dung |
|---|---|
| **Mã Use Case** | UC-INT-01 |
| **Tên** | Phát hành sự kiện ra sản phẩm |
| **Mô tả** | Khi một thao tác thương mại được chốt trên CRM (xác nhận / tạm dừng / khôi phục / thu hồi / gia hạn subscription, hoặc yêu cầu cập nhật mức dùng), CRM **ghi ý định đó thành sự kiện** và **đẩy sang sản phẩm qua hàng đợi**. CRM **không gọi API sản phẩm**, không chờ sản phẩm trả lời. |
| **Tác nhân** | System *(không có người dùng trực tiếp)* |
| **Tiền điều kiện** | Thao tác thương mại đã ghi thành công vào CRM. |
| **Hậu điều kiện** | (Thành công) Sự kiện đã được đẩy lên hàng đợi, trạng thái **Đã gửi**. (Thất bại) Sau khi hết số lần thử → **Thất bại vĩnh viễn**, hiện ở UC-INT-04 để người vận hành gửi lại. |
| **Trigger** | UC-SUB-05 / 07 / 08 / 09 / 10 · UC-LIC-03 |
| **Liên kết** | UC-INT-02 (nhận phản hồi), UC-INT-04 (xem & gửi lại), UC-LIC-04 (cảnh báo khi lệnh không tới nơi), [Phụ lục A §4](_event_catalog.md) |

### Business Rules

| Mã | Nội dung | Vì sao |
|---|---|---|
| **BR-01** | **Ghi sự kiện trong CÙNG một giao dịch với thay đổi nghiệp vụ.** Nếu ghi được subscription mà không ghi được sự kiện (hoặc ngược lại) → **huỷ cả hai**. | Đây là toàn bộ lý do tồn tại của outbox. Nếu tách ra: CRM ghi "đã tạm dừng" nhưng sự kiện không sinh → **sản phẩm không bao giờ biết**, khách vẫn dùng, và CRM **không hề biết là mình đã mất lệnh**. |
| **BR-02** | Việc **đẩy lên hàng đợi** do một tiến trình nền làm **sau đó**, **không** làm trong giao dịch nghiệp vụ. | Nếu đẩy ngay trong giao dịch: hàng đợi chậm → người dùng ngồi chờ; hàng đợi chết → không tạm dừng được subscription. Nghiệp vụ **không được phụ thuộc** vào tình trạng hạ tầng tích hợp. |
| **BR-03** | **Gửi ít nhất một lần** (at-least-once). Sản phẩm **phải** tự chống trùng theo `event_id`. | Mất lệnh nguy hiểm hơn lặp lệnh: mất lệnh "tạm dừng" = thất thoát doanh thu; lặp lệnh "tạm dừng" = vô hại (sản phẩm bỏ qua lần hai). |
| **BR-04** | **Giữ đúng thứ tự theo từng subscription.** Các sự kiện của **cùng một** subscription phải được đẩy **tuần tự theo `occurred_at`**. Sự kiện của **các subscription khác nhau** thì đẩy song song thoải mái. | Trạng thái license là **máy trạng thái**: chưa kích hoạt thì không tạm dừng được. Đẩy song song trong cùng một sub → sản phẩm nhận "tạm dừng" trước "khởi tạo" → từ chối lệnh. *(Chốt 13/07/2026.)* |
| **BR-05** | Mỗi sự kiện mang **envelope chuẩn** ([Phụ lục A §2](_event_catalog.md)): `event_id` · `event_key` · `occurred_at` · `subscription_id` · `product_id` · `correlation_id` · `schema_version`. | `correlation_id` là thứ duy nhất nối **lệnh CRM gửi** với **phản hồi sản phẩm** — không có nó thì không phân biệt được *"license tạm dừng vì ta ra lệnh"* với *"license tạm dừng vì hết hạn"*. |
| **BR-06** | Thử lại theo **giãn cách tăng dần**, tối đa **10 lần**. Hết số lần → **Thất bại vĩnh viễn** + cảnh báo vận hành. | — |
| **BR-07** | **Không tự động gửi lại vô hạn.** Hết số lần thử là **dừng**, chờ người quyết định. | Lệnh không tới nơi có thể do sản phẩm từ chối một cách chính đáng. Gửi lại vô hạn = đấm vào tường. |
| **BR-08** | **KHÔNG được có giao diện tạo sự kiện thủ công.** | Vi phạm YT-3: đó là **ra lệnh kỹ thuật** cho sản phẩm. CRM chỉ phát hành **ý định thương mại**, sinh ra từ một thao tác nghiệp vụ có thật. |
| **BR-09** | Sản phẩm khai báo **không hỗ trợ** một loại sự kiện *(vd `usage.force_sync_requested` khi `supports_force_sync = false`)* → **không sinh sự kiện**, không đẩy. | Đẩy lệnh mà sản phẩm không hiểu = rác trong hàng đợi + cảnh báo giả. |

---

## 2. Luồng nghiệp vụ

### 2.1 Luồng chính

| Bước | Actor | Hành động / Phản hồi |
|---|---|---|
| **1** | System | Một thao tác thương mại được chốt *(xác nhận / tạm dừng / khôi phục / thu hồi / gia hạn subscription; hoặc yêu cầu cập nhật mức dùng)*. |
| **2** | System | **[Gateway — Sản phẩm có hỗ trợ loại sự kiện này?]** Không → **EF-01** (không sinh sự kiện). Có → tiếp bước 3. |
| **3** | System | **Trong cùng giao dịch với thay đổi nghiệp vụ** (BR-01): ghi sự kiện vào hàng chờ gửi, trạng thái **Chờ gửi**, kèm envelope đầy đủ (BR-05). |
| **4** | System | Giao dịch nghiệp vụ kết thúc. **Người dùng nhận phản hồi ngay** — không chờ sản phẩm (BR-02). |
| **5** | System *(tiến trình nền)* | Lấy các sự kiện **Chờ gửi**, giữ đúng thứ tự theo từng subscription (BR-04), đẩy lên hàng đợi. |
| **6** | System | **[Gateway — Đẩy thành công?]** Có → trạng thái **Đã gửi**, ghi thời điểm. Kết thúc **End 1**.<br>Không → **AF-01** (thử lại). |
| **7** | Sản phẩm | Nhận sự kiện, tự chống trùng theo `event_id` (BR-03), xử lý bất đồng bộ → phản hồi bằng sự kiện inbound (**UC-INT-02**). |

### 2.2 Luồng phụ

**[AF-01: Thử lại]** — kích hoạt tại bước 6.

| Bước | Actor | Hành động / Phản hồi |
|---|---|---|
| **AF-01a** | System | Chuyển trạng thái **Đang thử lại**, tăng số lần thử, chờ theo giãn cách tăng dần (BR-06). |
| **AF-01b** | System | Thử đẩy lại. Thành công → **Đã gửi** (**End 1**). Chưa hết 10 lần → lặp lại AF-01a. Hết 10 lần → **AF-02**. |

**[AF-02: Thất bại vĩnh viễn]** — kích hoạt khi hết số lần thử.

| Bước | Actor | Hành động / Phản hồi |
|---|---|---|
| **AF-02a** | System | Trạng thái **Thất bại vĩnh viễn**; ghi lý do lỗi lần cuối. **Dừng, không thử thêm** (BR-07). |
| **AF-02b** | System | Cảnh báo vận hành; sự kiện hiện ở **UC-INT-04** để người vận hành xem và gửi lại tay. |
| → | — | Kết thúc **End 2**. ⚠️ **Lệnh chưa tới nơi → sản phẩm vẫn đang làm theo trạng thái cũ** → nguy cơ khách vẫn dùng dịch vụ dù CRM đã ghi nhận dừng. |

**[AF-03: Sản phẩm từ chối lệnh]** — sản phẩm **đã nhận** nhưng **không thực thi được**.

| Bước | Actor | Hành động / Phản hồi |
|---|---|---|
| **AF-03a** | Sản phẩm | Gặp lỗi **vĩnh viễn** *(tenant không tồn tại, gói không hợp lệ…)*, hoặc **hết trần tự thử lại** → gửi **`subscription.command_failed`** kèm `correlation_id` + lý do ([Phụ lục A §4.4](_event_catalog.md)). |
| **AF-03b** | System | Đối chiếu `correlation_id` → tìm đúng lệnh gốc → đánh dấu **"Sản phẩm từ chối"** *(khác hẳn "chưa tới nơi")*, hiện **lý do thật** ở UC-INT-04; đưa vào hàng đợi xử lý của UC-LIC-04. |
| → | — | Kết thúc **End 3**. *Nhờ vậy CRM nói được "CMC EDR **từ chối** lệnh Tạm dừng: tenant không tồn tại" thay vì "**nghi ngờ** sản phẩm không thực thi lệnh".* |

### 2.3 Luồng ngoại lệ

**[EF-01: Sản phẩm không hỗ trợ loại sự kiện này]** — tại bước 2.

| Bước | Actor | Hành động / Phản hồi |
|---|---|---|
| **EF-01a** | System | **Không sinh sự kiện**, không đẩy (BR-09). Giao diện đã ẩn nút tương ứng từ trước (UC-LIC-03). |
| → | — | Kết thúc **End 4**. |

**[EF-02: Ghi sự kiện thất bại]** — tại bước 3.

| Bước | Actor | Hành động / Phản hồi |
|---|---|---|
| **EF-02a** | System | **Huỷ toàn bộ giao dịch** — thay đổi nghiệp vụ **cũng không được ghi** (BR-01). Báo lỗi cho người dùng, yêu cầu thao tác lại. |
| → | — | Kết thúc **End 5**. *Thà không làm gì còn hơn ghi nghiệp vụ mà mất lệnh — vì mất lệnh thì **không ai biết là đã mất**.* |

### 2.4 Điểm kết thúc

| End | Mô tả |
|---|---|
| **End 1** | Sự kiện đã tới hàng đợi — sản phẩm sẽ xử lý bất đồng bộ. |
| **End 2** | Thất bại vĩnh viễn — chờ người vận hành gửi lại (UC-INT-04). |
| **End 3** | Sản phẩm từ chối lệnh — có lý do cụ thể. |
| **End 4** | Sản phẩm không hỗ trợ — không sinh sự kiện. |
| **End 5** | Huỷ giao dịch — nghiệp vụ không được ghi. |

---

## 3. Mô tả giao diện

**Không có.** Đây là tính năng ngầm. Kết quả của nó **quan sát được** ở:
- **UC-INT-04** — danh sách sự kiện gửi đi, trạng thái, lý do lỗi, nút gửi lại.
- **UC-INT-03** — nửa "kênh gửi đi" của mỗi thẻ sản phẩm.
- **UC-INT-06** — dòng thời gian của một subscription.

---

## 4. Acceptance Criteria

### Nhóm 1: Ghi sự kiện cùng giao dịch

| Mã | Given | When | Then |
|---|---|---|---|
| AC-INT-01-01 | Subscription đang hoạt động. | Người dùng Tạm dừng subscription. | Trong **cùng một giao dịch**: `sub.status = SUSPENDED` **và** sự kiện `subscription.suspended` được ghi ở trạng thái **Chờ gửi** (BR-01). |
| AC-INT-01-02 | Ghi sự kiện gặp lỗi *(vd hết chỗ lưu)*. | Người dùng Tạm dừng subscription. | **Toàn bộ giao dịch bị huỷ** — `sub.status` **vẫn là ACTIVE**; người dùng nhận thông báo lỗi (EF-02). |
| AC-INT-01-03 | Hàng đợi đang **chết hoàn toàn**. | Người dùng Tạm dừng subscription. | Thao tác **vẫn thành công ngay**, người dùng không phải chờ (BR-02). Sự kiện nằm ở **Chờ gửi** cho tới khi hàng đợi sống lại. |
| AC-INT-01-04 | Sản phẩm khai báo `supports_force_sync = false`. | Gọi API yêu cầu cập nhật mức dùng. | **Không sinh sự kiện nào** (BR-09, EF-01). |

### Nhóm 2: Thứ tự và chống trùng

| Mã | Given | When | Then |
|---|---|---|---|
| AC-INT-01-05 | Cùng một subscription có 2 sự kiện chờ gửi: `subscription.submitted` (10:00) và `subscription.suspended` (10:01). | Tiến trình nền chạy. | Đẩy **tuần tự**: `submitted` trước, `suspended` sau (BR-04). **Không** đẩy song song. |
| AC-INT-01-06 | Hai subscription **khác nhau** cùng có sự kiện chờ gửi. | Tiến trình nền chạy. | Được đẩy **song song** — thứ tự chỉ ràng buộc **trong phạm vi một subscription** (BR-04). |
| AC-INT-01-07 | Một sự kiện được đẩy **2 lần** do lỗi mạng. | Sản phẩm nhận. | Sản phẩm **bỏ qua lần hai** theo `event_id` (BR-03). Không thực thi 2 lần. |

### Nhóm 3: Thất bại

| Mã | Given | When | Then |
|---|---|---|---|
| AC-INT-01-08 | Đẩy thất bại 3 lần liên tiếp. | Tiến trình nền chạy. | Trạng thái **Đang thử lại**, số lần thử = 3, chờ theo giãn cách tăng dần (BR-06). |
| AC-INT-01-09 | Đẩy thất bại **10 lần**. | Tiến trình nền chạy. | Trạng thái **Thất bại vĩnh viễn**; **không thử thêm** (BR-07); hiện ở UC-INT-04 với nút Gửi lại; cảnh báo vận hành. |
| AC-INT-01-10 | Sản phẩm nhận lệnh Tạm dừng nhưng **tenant không tồn tại**. | Sản phẩm gửi `subscription.command_failed`. | Lệnh gốc *(tìm qua `correlation_id`)* đổi thành **"Sản phẩm từ chối"**, hiển thị lý do **"Tenant không tồn tại"** — **không** hiển thị là "chưa tới nơi" (AF-03). |

### Nhóm 4: Ranh giới

| Mã | Given | When | Then |
|---|---|---|---|
| AC-INT-01-11 | Bất kỳ vai trò nào, kể cả License Admin. | Rà toàn bộ giao diện. | **Không tồn tại** chức năng "tạo sự kiện thủ công" hay "sửa nội dung sự kiện rồi gửi" (BR-08). |
| AC-INT-01-12 | Sự kiện đang chờ gửi. | Rà hành vi hệ thống. | CRM **không gọi API nào** của sản phẩm để hỏi trạng thái (YT-3). |

---

## 5. Review Checklist

### Lịch sử thay đổi

| Phiên bản | Ngày | Tác giả | Mô tả |
|---|---|---|---|
| 1.0 | 14/07/2026 | Claude (AI) | Khởi tạo. Trace: PRD v2.6 §6.7 FR-INT-01, FR-INT-02. Bổ sung so với PRD: **BR-04** (giữ thứ tự theo từng sub — chốt 13/07), **BR-09** (không sinh sự kiện khi sản phẩm không hỗ trợ), **AF-03** (`subscription.command_failed` — sản phẩm từ chối lệnh, [Phụ lục A §4.4](_event_catalog.md)), envelope chuẩn (BR-05). |

### Nghiệp vụ
- ✅ Ghi sự kiện **cùng giao dịch** — không bao giờ "ghi nghiệp vụ nhưng mất lệnh"
- ✅ Nghiệp vụ **không phụ thuộc** tình trạng hạ tầng tích hợp (hàng đợi chết vẫn tạm dừng được subscription)
- ✅ Thứ tự **theo từng subscription**, không chặn toàn cục
- ✅ **Không có** đường tạo/sửa sự kiện thủ công (YT-3)
- ✅ **OQ-INT-04 — đã chốt (rà lại 14/07):** envelope chuẩn ([Phụ lục A §2](_event_catalog.md)) — đã dùng làm BR-05.

---

## 6. Bàn giao cho Thiết kế kỹ thuật (TDD)

> FRS này khẳng định **hành vi CRM phải đảm bảo**. **Cơ chế** thực hiện *(worker, hàng đợi, khoá, backoff…)* là việc của **Tài liệu Thiết kế kỹ thuật (TDD)** — do architect/dev viết khi bắt đầu code *(chốt 14/07/2026)*. FRS **không** mô tả cơ chế, để không trói đặc tả vào một cách hiện thực cụ thể.
>
> Danh sách dưới đây là **những điểm TDD BẮT BUỘC phải giải** — mỗi điểm neo vào một cam kết nghiệp vụ đã chốt ở trên, để không rơi rớt khi bàn giao:

| # | TDD phải trả lời | Neo vào |
|---|---|---|
| 1 | **Transaction outbox**: ghi sự kiện + thay đổi nghiệp vụ trong **một** giao dịch bằng cơ chế gì; rollback ra sao khi một trong hai lỗi. | BR-01, EF-02 |
| 2 | **Tiến trình đẩy**: quét bảng theo chu kỳ hay hàng đợi nội bộ; kích thước lô; điều gì xảy ra khi worker **chết giữa lô** (lấy lại được, không gửi trùng ngoài mức "ít nhất một lần"). | BR-02, BR-03 |
| 3 | **Giữ thứ tự theo từng subscription** khi **nhiều worker chạy song song**: khoá theo `subscription_id`? phân mảnh? — *ràng buộc là BR-04, cách làm là TDD*. | BR-04 |
| 4 | **Topology hàng đợi**: exchange / queue / định tuyến theo `product_id`; cô lập sự cố một sản phẩm không kéo sập sản phẩm khác. | BR-02 |
| 5 | **Công thức giãn cách retry** (giá trị cụ thể) + trần **10 lần** + tiêu chí chuyển **Thất bại vĩnh viễn**. | BR-06, BR-07 |
| 6 | **Sinh & truyền envelope**: cấp `event_id`, `occurred_at`, `correlation_id` ở đâu trong luồng ghi. | BR-05 |
| 7 | **Đối chiếu `correlation_id`** khi nhận `subscription.command_failed` để tìm đúng lệnh gốc. | AF-03 |
| 8 | **Cảnh báo vận hành** khi có lệnh Thất bại vĩnh viễn — kênh nào, ngưỡng nào. | AF-02b |

---

## Footer

| Mục | Nội dung |
|---|---|
| **Giao diện** | Không có — tính năng ngầm |
| **Thiết kế kỹ thuật** | Cơ chế nằm ở **TDD M-07** *(chưa viết — việc của dev)*; các điểm bắt buộc giải: §6 |
| **UC liên quan** | UC-INT-02, UC-INT-04, UC-INT-06, UC-LIC-03, UC-LIC-04, UC-SUB-05/07/08/09/10 |
| **Trace PRD** | OneCRM_PRD_v2.6.md §6.7.2 (FR-INT-01), §6.7.3 (FR-INT-02) |
