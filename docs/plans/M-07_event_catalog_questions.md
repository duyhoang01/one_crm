# M-07 Integration — Phân tích danh mục sự kiện & bộ câu hỏi cần chốt

> Ngày: 14/07/2026 · Soạn: Claude (AI) · Người trả lời: BA (Nguyễn Công Giang)
> Nguồn: `docs/prd/inbound_outbound_concept.md` v1.0 · PRD v2.6 §5.5.2, §6.7 · FRS M-05 (UC-LIC-01…04) · demo `v2.7.0_integration.html`
> **Mục đích:** chốt danh mục sự kiện + hành vi CRM/sản phẩm **trước khi** viết FRS. Đặc tả trên một danh mục còn lỗ hổng = dev code ra bug.

**Mức độ chặn:**
🔴 **Chặn dev** — không chốt thì không code được đúng
🟠 **Chặn golive** — code được nhưng vận hành sẽ sai
🟡 **Defer được**

---

## PHẦN I — BA LỖ HỔNG LÀM HỎNG M-05

Ba mục dưới đây **không phải góp ý cho đẹp**. Chúng khiến module License & Usage (đã đặc tả xong, đã duyệt) **chạy sai ngay ngày đầu**.

### 🔴 LH-1. Không có sự kiện nào đặt license về **Thu hồi (REVOKED)** → cảnh báo giả vĩnh viễn

**Hiện trạng:** CRM gửi `subscription.terminated` → EDR *"Suspend License vĩnh viễn (Revoke)"* → EDR gửi lại **`tenant.terminated`** → CRM chỉ *"ghi nhận nội bộ, cập nhật audit"* (§2.3, §3.1.2).

**Hệ quả:** `license_mirror.status` **không bao giờ đổi**. Nó vẫn là `ACTIVE`.

Mà UC-LIC-04 BR-09 định nghĩa **lệch kiểu A** = *subscription đã Thu hồi **và** license vẫn Đang hoạt động quá SLA* → **mức độ Cao**, vào hàng đợi, và nếu ≥3 khách thì **bắn banner "Sản phẩm không thực thi lệnh từ CRM — nguy cơ thất thoát doanh thu"**.

→ **Mọi subscription bị thu hồi sẽ vĩnh viễn nằm trong hàng đợi sự cố mức Cao.** Thu hồi 3 khách là banner đỏ nổi lên, dù sản phẩm đã làm đúng. Hàng đợi thành rác trong tuần đầu.

**Gốc rễ:** `tenant.*` là **sự kiện cấp hạ tầng** (tenant), còn CRM quan sát **license**. Sự kiện tenant không đổi được trạng thái license.

### 🔴 LH-2. Không có sự kiện nào đặt license vào **Ân hạn (GRACE)**

**Hiện trạng:** PRD §5.5.2 khai báo EDR có status `GRACE`. §4.3 của concept doc còn nói rõ *"`sub.status = ACTIVE` + `license_mirror.status = GRACE` là **hợp lệ**"*. UC-LIC-02 có hẳn một trong 7 trường hợp hiển thị cho ân hạn, UC-LIC-04 BR-04 cố ý **loại ân hạn khỏi hàng đợi**.

**Nhưng danh mục inbound chỉ có:** `license.expiring_soon` → `EXPIRING_SOON`, `license.expired` → `EXPIRED`, `license.grace_expired` → `GRACE_EXPIRED`.

**Không có `license.grace_started`.** Tức **không có đường nào để mirror vào trạng thái GRACE**.

**Hệ quả:** khách hết hạn nhưng vẫn đang dùng trong ân hạn → CRM thấy `license = EXPIRED` + `sub = ACTIVE` → đúng định nghĩa **lệch kiểu B** (BR-10) → **mức độ Cao**, báo *"khách hàng đang mất dịch vụ"* — trong khi khách **vẫn dùng bình thường**. Cảnh báo sai, mức cao nhất.

**Ngoài ra:** `EXPIRING_SOON` và `GRACE_EXPIRED` là **hai trạng thái CRM đang không dùng ở đâu cả** — M-05 tự tính "sắp hết hạn" từ `expiration_date` + `renewal_notice_days`. Cần chốt: giữ hay bỏ?

### 🟠 LH-3. Sản phẩm **không có đường báo "tôi không làm được lệnh của anh"**

**Hiện trạng:** CRM gửi `subscription.suspended`. Nếu EDR nhận nhưng **thực thi thất bại** (API nội bộ lỗi, tenant không tồn tại…) thì **không có event nào để báo lại**.

**Hệ quả:** Outbox của CRM ghi **"Đã gửi"** (vì broker đã nhận) → màn *Sự kiện gửi đi* xanh, mọi thứ "bình thường". Nhưng license vẫn chạy. CRM chỉ phát hiện **sau khi SLA lệch trạng thái hết hạn** — và khi đó nó báo *"nghi ngờ sản phẩm không thực thi lệnh"*, tức **đoán mò**, trong khi sản phẩm **đã biết chính xác nó fail và fail vì gì**.

→ Cần một event kiểu **`subscription.command_failed`** (hoặc `license.command_rejected`) mang `event_key gốc + lý do`. Có nó thì M-07 nói được *"CMC EDR **từ chối** lệnh Tạm dừng: tenant không tồn tại"* — thay vì *"nghi ngờ"*.

---

## PHẦN II — THIẾU SÓT TRONG DANH MỤC

### 🔴 TS-1. Thiếu hẳn event outbound `usage.force_sync_requested`

PRD FR-LIC-04 BR-04.2 ghi rõ: Force Sync → **OUTBOX `usage.force_sync_requested`**. Demo v2.7 có hiển thị (*"Yêu cầu cập nhật mức sử dụng"*). Nhưng **§2.1 của concept doc chỉ liệt kê 5 event**, không có nó.

→ Danh sách outbound thật phải là **6**.

### 🔴 TS-2. Không có **envelope chung** cho event

§4.2 nói *"CRM xử lý idempotency theo `event_id`"* — nhưng **payload schema ở §2.2 không có `event_id`**. Cũng không có: `occurred_at`, `correlation_id`, `product_id`, `schema_version`.

Không có envelope thì: không idempotent được, không truy vết được lệnh nào sinh ra phản hồi nào (màn Tra cứu của M-07 dựa vào đúng thứ này), và không nâng cấp schema được về sau.

### 🟠 TS-3. Thiếu payload cho 3 event outbound

§2.2 chỉ định nghĩa schema cho `subscription.submitted` và `subscription.renewed`. Còn `suspended` / `reactivated` / `terminated` thì **không có**. Ít nhất cần: `subscription_id` + `reason` *(SUBSCRIPTION đã có cột `suspend_reason` từ v2.4)* + `effective_at`.

### 🟠 TS-4. **CMC CA không có mục nào** trong danh mục

Demo có CMC CA (chữ ký số, `supports_force_sync = false`). Concept doc có EDR, C-Shield, AV — **không có CA**.

### 🟠 TS-5. C-Shield / AV: **không có event cho tạm dừng / thu hồi / gia hạn**

Hai sản phẩm này chỉ khai `provisioning.pending/done/failed` + `usage_synced`. Vậy khi CRM gửi `subscription.suspended` cho C-Shield thì nó phản hồi bằng gì? **Không định nghĩa** → lặp lại đúng lỗ hổng LH-1/LH-3, nhưng cho 2 sản phẩm.

---

## PHẦN III — BẪY KỸ THUẬT CHƯA ĐỊNH NGHĨA

### 🔴 BK-1. Sự kiện đến **sai thứ tự** (out-of-order) — sẽ xảy ra, không phải "nếu"

Webhook qua mạng, có retry. Kịch bản thật:

> `license.suspended` (xảy ra 10:00) gửi lần 1 **thất bại**, retry lúc 10:05.
> `license.activated` (xảy ra 10:02) gửi lần 1 **thành công** lúc 10:02.
> CRM xử lý: ACTIVE (10:02) → rồi SUSPENDED (10:05, nhưng là chuyện của 10:00).

**Kết quả: license bị đặt sai trạng thái, và sai vĩnh viễn** cho tới lần đồng bộ sau.

→ Phải có **chốt chặn sự kiện cũ**: chỉ áp dụng khi `occurred_at` **mới hơn** `occurred_at` của sự kiện đã áp dụng gần nhất cho mirror đó. Sự kiện cũ hơn → **ghi nhận, không áp dụng** (đây cũng chính là nền của replay chuỗi BR-06.10 đã chốt).

**→ Điều này bắt buộc `occurred_at` phải nằm trong envelope (TS-2), và mirror phải lưu thêm `last_event_occurred_at`.**

### 🟠 BK-2. Khối lượng `license.usage_synced` và vòng đời dữ liệu

Chu kỳ **3 giờ** (chốt 14/07) × N subscription = **8 tin/sub/ngày**. 500 sub → **4.000 tin/ngày**, **~1,5 triệu/năm** — chỉ riêng usage.

`WEBHOOK_INBOX` giữ bao lâu? Không định nghĩa. Nếu giữ mãi thì màn *Sự kiện nhận về* sẽ ngập rác usage và không ai tìm thấy sự kiện quan trọng *(đúng lỗi mà tôi vừa phải sửa trong demo: 42 dòng usage chôn mất 2 sự kiện thật)*.

### 🟠 BK-3. Đổi khoá bảo mật (HMAC secret rotation)

PRD §5.3.7 có `secret_rotation_state` (old_secret + grace 7 ngày). Concept doc **không nhắc**. Demo M-07 có ca *"chữ ký không hợp lệ"*. Cần chốt: trong 7 ngày ân hạn, CRM chấp nhận **cả khoá cũ và mới**?

---

## PHẦN IV — CÂU HỎI (trả lời lần lượt theo số)

### 🔴 Q1. Sự kiện đặt license về **Thu hồi** — thêm event mới hay đổi cách hiểu `tenant.terminated`?

- **(a)** Thêm **`license.revoked`** vào danh mục EDR → CRM set `license_mirror.status = REVOKED`. *(Đề xuất của tôi — nhất quán: mọi thay đổi trạng thái license đều đi qua namespace `license.*`; `tenant.*` chỉ là sự kiện hạ tầng, ghi audit.)*
- **(b)** Cho `tenant.terminated` **kiêm luôn** việc set license = REVOKED.
- **(c)** Không có REVOKED trong status set của EDR *(PRD §5.5.2 hiện đúng là không có!)* → M-05 phải bỏ khái niệm "license bị thu hồi". ⚠️ Nhưng M-05 FRS + demo **đang dùng** REVOKED.

**Trả lời:**

---

### 🔴 Q2. Sự kiện đặt license vào **Ân hạn** — thêm `license.grace_started`?

- **(a)** Thêm **`license.grace_started`** → `license_mirror.status = GRACE`. *(Đề xuất của tôi.)*
- **(b)** Suy ra ở CRM: `license.expired` + sản phẩm khai báo có ân hạn → CRM **tự** đặt GRACE. ⚠️ Vi phạm YT-1: CRM **suy diễn** trạng thái license thay vì quan sát.

Kèm theo: hai trạng thái **`EXPIRING_SOON`** và **`GRACE_EXPIRED`** — **giữ hay bỏ?** M-05 hiện **không dùng cái nào** (tự tính "sắp hết hạn" từ `expiration_date` + `renewal_notice_days`).

**Trả lời:**

---

### 🔴 Q3. Sản phẩm báo **"không thực thi được lệnh"** bằng cách nào?

Không có nó thì M-07 chỉ **đoán** (*"nghi ngờ sản phẩm không thực thi lệnh"*), trong khi sản phẩm **biết chính xác** nó fail vì gì.

- **(a)** Thêm event **`subscription.command_failed`** *(mang `original_event_key` + `reason` + `failed_at`)*. *(Đề xuất của tôi.)*
- **(b)** Không thêm — chấp nhận CRM chỉ phát hiện gián tiếp qua SLA lệch trạng thái.

**Trả lời:**

---

### 🔴 Q4. **Envelope chung** cho mọi event (cả 2 chiều)

Đề xuất của tôi — bắt buộc, mọi sản phẩm:

| Trường | Ý nghĩa | Vì sao bắt buộc |
|---|---|---|
| `event_id` | UUID, duy nhất | Chống xử lý trùng (§4.2 đã yêu cầu nhưng schema không có) |
| `event_key` | Loại sự kiện | — |
| `occurred_at` | Thời điểm việc **thật sự xảy ra** ở nguồn | Chống sự kiện đến sai thứ tự (BK-1) |
| `subscription_id` | Khoá đối chiếu | Không có → tin mồ côi |
| `product_id` | Sản phẩm gửi | Chọn đúng khoá HMAC + mapping |
| `correlation_id` | Nối lệnh CRM gửi ↔ phản hồi sản phẩm | Nền của màn Tra cứu (M-07) |
| `schema_version` | Phiên bản schema | Nâng cấp không vỡ |

**Đồng ý? Có thêm/bớt trường nào không?**

**Trả lời:**

---

### 🔴 Q5. Chặn **sự kiện đến sai thứ tự** (BK-1)

- **(a)** Chỉ áp dụng khi `occurred_at` **mới hơn** `last_event_occurred_at` của mirror. Sự kiện cũ hơn → **ghi nhận, KHÔNG áp dụng**, đánh dấu *"đến muộn"*. *(Đề xuất của tôi — cần thêm cột `license_mirror.last_event_occurred_at`.)*
- **(b)** Cứ áp dụng theo thứ tự **nhận được** (như hiện tại) → chấp nhận rủi ro sai trạng thái.

**Trả lời:**

---

### 🟠 Q6. **C-Shield / AV / CA** — mức độ chi tiết

Bạn nói: *chi tiết với EDR, high-level với C-Shield / AV / CA*. Xác nhận cách làm:

- Với **EDR**: đặc tả **đầy đủ từng event**, hành vi CRM và hành vi sản phẩm.
- Với **3 sản phẩm còn lại**: chỉ khai **khung bắt buộc mà mọi Product Module phải tuân theo** — envelope (Q4), 4 nhóm sự kiện bắt buộc *(khởi tạo · đổi trạng thái license · báo mức dùng · báo lệnh thất bại)* — còn **event key và payload cụ thể thì để trống, chờ đội sản phẩm khai báo** vào `PRODUCT_MODULE_CONFIG`.

→ Như vậy FRS **không bịa** event cho 3 sản phẩm chưa làm việc với ta, nhưng vẫn **ràng buộc** họ phải khai đủ 4 nhóm. **Đồng ý?**

**Trả lời:**

---

### 🟠 Q7. Vòng đời dữ liệu sự kiện (BK-2)

3 giờ/lần × 500 sub ≈ **4.000 tin usage/ngày**, ~1,5 triệu/năm.

- Giữ `WEBHOOK_INBOX` bao lâu? *(đề xuất: **90 ngày** cho tin đã xử lý; **giữ vô thời hạn** cho tin lỗi/chưa xử lý cho tới khi được xử lý xong)*
- Màn *Sự kiện nhận về* có nên **mặc định ẩn** `usage_synced` đã xử lý thành công *(vì chúng chiếm >95% khối lượng và không mang thông tin gì khi thành công)*, có bộ lọc để bật lại?

**Trả lời:**

---

### 🟠 Q8. Đổi khoá bảo mật (BK-3)

Trong 7 ngày ân hạn đổi khoá, CRM chấp nhận **cả khoá cũ lẫn khoá mới**? *(đề xuất: **có** — nếu không, mọi tin gửi bằng khoá cũ sẽ bị đánh dấu "chữ ký không hợp lệ" và **không xử lý lại được**, tức mất dữ liệu thật.)*

**Trả lời:**

---

### 🟡 Q9. Chu kỳ `license.usage_synced` trong concept doc

Tài liệu ghi **1 giờ**; đã chốt **3 giờ** (14/07). Tôi sẽ sửa `inbound_outbound_concept.md` §3.1.3 cho khớp — **xác nhận?**

**Trả lời:**

---

## PHẦN V — CẤU TRÚC FRS ĐỀ XUẤT (sau khi chốt các câu trên)

Module này **kỹ thuật nhiều hơn giao diện** — nên chia UC theo **năng lực hệ thống**, không theo màn hình:

| UC | Tên | Loại | Tác nhân |
|---|---|---|---|
| **UC-INT-01** | Phát hành sự kiện ra sản phẩm *(ghi outbox + worker publish)* | ⚙️ Ngầm | System |
| **UC-INT-02** | Tiếp nhận & xử lý sự kiện từ sản phẩm *(webhook receiver + processor)* | ⚙️ Ngầm | System, Product |
| **UC-INT-03** | Xem tình trạng kết nối | 🖥️ Giao diện | License Admin, Auditor |
| **UC-INT-04** | Danh sách sự kiện gửi đi + **Gửi lại lệnh** | 🖥️ + hành động | License Admin |
| **UC-INT-05** | Danh sách sự kiện nhận về + **Xử lý lại theo chuỗi** | 🖥️ + hành động | License Admin |
| **UC-INT-06** | Tra cứu theo subscription | 🖥️ Giao diện | License Admin, Auditor |
| **Phụ lục A** | **Danh mục sự kiện** — envelope · outbound · inbound theo từng sản phẩm · hành vi CRM ↔ sản phẩm | 📋 Tham chiếu | — |

**Phụ lục A là trái tim của module này** — nó là hợp đồng kỹ thuật giữa CRM và mọi Product Module. UC-INT-01/02 chỉ mô tả *cơ chế*; Phụ lục A khai *nội dung*.

**Đồng ý cấu trúc này không?**

**Trả lời:**
