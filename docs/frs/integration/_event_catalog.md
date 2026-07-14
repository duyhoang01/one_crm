# Phụ lục A — Danh mục sự kiện tích hợp (Event Catalog)

> Module: M-07 Integration Layer | Phiên bản: 1.0 (Draft) | Ngày: 14/07/2026
> **Đây là hợp đồng kỹ thuật giữa OneCRM và mọi Product Module.** UC-INT-01/02 mô tả *cơ chế*; tài liệu này khai *nội dung*.
> Thay thế `docs/prd/inbound_outbound_concept.md` v1.0 (bản cũ có 3 lỗ hổng làm hỏng M-05 — xem §7).

**Ký hiệu:** ✅ đã chốt · 🆕 sự kiện mới đề xuất · ⚠️ suy luận của BA/AI, **cần xác nhận** · ❓ Open Question

---

## 1. Nguyên tắc nền (đọc trước khi đọc bảng)

| # | Nguyên tắc | Vì sao |
|---|---|---|
| **NT-1** | **`license_mirror` phản ánh "khách có dùng được dịch vụ không"** — KHÔNG phải "bản ghi license kỹ thuật đang mang trạng thái gì". | ⚠️ **Cần xác nhận.** EDR thực thi Thu hồi/Tạm dừng ở **cấp Tenant**, không ở cấp License. Nếu mirror chỉ soi bản ghi license thì nó **không bao giờ đổi** khi tenant bị suspend → M-05 báo lệch trạng thái mức Cao **oan** cho mọi sub bị thu hồi. Vì vậy `tenant.*` **cũng là** tín hiệu đổi trạng thái mirror. |
| **NT-2** | CRM **quan sát**, không suy diễn. Trạng thái license chỉ đổi khi **sản phẩm gửi sự kiện**. | YT-1. CRM không tự tính "chắc là hết hạn rồi". |
| **NT-3** | Mọi sự kiện, **cả hai chiều**, phải mang **envelope chung** (§2). | Không có `event_id` thì không chống trùng; không có `occurred_at` thì không chặn được sự kiện đến sai thứ tự; không có `correlation_id` thì không truy vết được lệnh nào sinh ra phản hồi nào. |
| **NT-4** | **Sản phẩm tự lo cái nó tự khỏi được; cái nó không tự khỏi được thì phải nói.** | Lỗi tạm thời (timeout, nghẽn) → sản phẩm **tự retry có trần**. Hết trần / lỗi vĩnh viễn → **bắt buộc** gửi `subscription.command_failed` (§4.4). Không có nó, CRM chờ vô hạn rồi **đoán mò** trong khi sản phẩm biết chính xác lý do. |
| **NT-5** | Tên trạng thái hiển thị cho người dùng **do Product Module khai báo** (`license_status_set`), không hardcode ở lõi. | Tên sự kiện của EDR (`license.expired`) **không** trùng nghĩa với chữ người dùng đọc ("Trong ân hạn") — xem §3.2. |

---

## 2. Envelope chung — bắt buộc cho MỌI sự kiện, cả 2 chiều

⚠️ *Đề xuất của BA/AI — chưa có trong tài liệu gốc. **Đây là mục cần thống nhất với phía sản phẩm.***

| Trường | Kiểu | Bắt buộc | Ý nghĩa — và không có thì hỏng gì |
|---|---|---|---|
| `event_id` | UUID | ✓ | Định danh **duy nhất** của sự kiện. Không có → không chống được xử lý trùng (webhook gửi ít nhất một lần ⇒ **sẽ** lặp → áp dụng 2 lần). |
| `event_key` | string | ✓ | Loại sự kiện (xem §3, §4). |
| `occurred_at` | timestamp (UTC) | ✓ | Thời điểm việc **thật sự xảy ra ở nguồn** — **KHÔNG phải** lúc gửi. Không có → không chặn được **sự kiện đến sai thứ tự** (§5.2) → license sai trạng thái vĩnh viễn. |
| `subscription_id` | string | ✓ | Khoá đối chiếu về subscription trong CRM. Không có → tin **mồ côi**, không biết của khách nào. |
| `product_id` | string | ✓ | Sản phẩm gửi/nhận. Không có → không chọn được đúng khoá bảo mật và đúng bảng ánh xạ. |
| `correlation_id` | UUID | ✓ *(inbound: chỉ khi là phản hồi của một lệnh CRM)* | Nối **lệnh CRM gửi ↔ phản hồi sản phẩm**. Không có → không trả lời được *"license tạm dừng vì ta ra lệnh, hay vì hết hạn?"* (§3.2 — `license.suspended` có 2 nguồn). |
| `schema_version` | string | ✓ | Phiên bản schema của `payload`. Không có → nâng cấp schema là vỡ tương thích. |
| `payload` | object | ✓ | Nội dung riêng theo từng `event_key` (xem ví dụ §2.1, §2.2). |

### 2.1 Ví dụ — sự kiện OUTBOUND *(CRM → sản phẩm)*

Lệnh Tạm dừng subscription. `payload` bọc trong envelope; các trường envelope nằm ở cấp ngoài cùng.

```json
{
  "event_id": "9f1c2e7a-4b8d-4e21-9c3f-1a2b3c4d5e6f",
  "event_key": "subscription.suspended",
  "occurred_at": "2026-07-14T03:12:45.000Z",
  "subscription_id": "SUB-2026-021",
  "product_id": "CMC_EDR",
  "correlation_id": "9f1c2e7a-4b8d-4e21-9c3f-1a2b3c4d5e6f",
  "schema_version": "1.0",
  "payload": {
    "reason": "Khách hàng ngừng hợp đồng",
    "effective_at": "2026-07-14T03:12:45.000Z"
  }
}
```

> `correlation_id` của một lệnh outbound = chính `event_id` của nó. Sản phẩm **phản hồi lại** bằng cách đặt `correlation_id` này vào tin inbound → CRM nối được lệnh ↔ phản hồi.

### 2.2 Ví dụ — sự kiện INBOUND *(sản phẩm → CRM)*

Sản phẩm báo license đã kích hoạt, **phản hồi cho** lệnh `subscription.submitted` mà CRM gửi trước đó.

```json
{
  "event_id": "3d5f8a1b-9e2c-4f76-8a0d-6b7c8d9e0f1a",
  "event_key": "license.activated",
  "occurred_at": "2026-07-14T04:05:10.000Z",
  "subscription_id": "SUB-2026-021",
  "product_id": "CMC_EDR",
  "correlation_id": "1a2b3c4d-0000-0000-0000-000000000000",
  "schema_version": "1.0",
  "payload": {
    "external_ref": "TENANT-EDR-8842",
    "activation_date": "2026-07-14",
    "expiration_date": "2027-07-14",
    "usage_snapshot": { "used_seats": 0, "total_seats": 500 }
  }
}
```

> **Chữ ký HMAC** không nằm trong thân tin — nó ở **HTTP header** (`X-Signature: sha256=...`), ký trên toàn bộ body. Xem §5.3.

> **`payload` khác nhau theo từng `event_key`** — chi tiết payload của từng loại: §4.2/4.3 (outbound), §3.2 (inbound). Bộ trường **envelope** (7 trường trên) thì **giống nhau ở mọi sự kiện, mọi sản phẩm**.

---

## 3. Sự kiện INBOUND — Sản phẩm → CRM (chi tiết: CMC EDR)

### 3.1 Vòng đời license của EDR — mô hình đúng *(chốt 14/07/2026)*

**Đây là thay đổi lớn nhất so với tài liệu cũ.** Sau khi hết hạn, khách hàng đi qua **BA giai đoạn**, không phải "chết ngay":

```
                                    ┌── (CRM ra lệnh Tạm dừng) ──┐
                                    │                             ▼
PENDING → PROVISIONING → ACTIVE ────┼──────────────────────► SUSPENDED (Đã ngừng)
                                    │                             ▲
                                    │  hết hạn                    │ hết 30 ngày
                                    └─► GRACE ──────────► RESTRICTED ──┘
                                      (Trong ân hạn)    (Hạn chế tính năng)
                                       dùng ĐỦ           dùng HẠN CHẾ, 30 ngày
```

> 🔴 **Tài liệu cũ hiểu sai chỗ này**, và M-05 đang code theo cái sai: `license.expired` bị map thành **"Hết hạn"**, tô xám, gắn nhãn *"số liệu cuối trước khi ngừng"* — **coi như license đã chết**, trong khi **khách vẫn đang dùng đầy đủ**. Hệ quả: khách đang ân hạn bị M-05 chấm **lệch kiểu B — mức Cao — "khách hàng đang mất dịch vụ"**, hoàn toàn sai.

### 3.2 Bảng sự kiện inbound — EDR

| # | `event_key` | Nghĩa THẬT với khách hàng | CRM đặt `license_mirror.status` | Tên hiển thị | Tác động lên subscription |
|---|---|---|---|---|---|
| 1 | `license.pending` | EDR đã nhận yêu cầu, khởi tạo xong Tenant | `PENDING` | Chờ khởi tạo | — |
| 2 | `license.provisioning` | Đang triển khai license | `PROVISIONING` | Đang triển khai | — |
| 3 | `license.activated` | **Kích hoạt thành công — khách bắt đầu dùng được** | `ACTIVE` | Đang hoạt động | `sub.activation_date`, `sub.end_date` ← `expiration_date` của license; `sub.status = ACTIVE` |
| 4 | `license.expired` ✅ | ⚠️ **KHÔNG phải "đã chết".** Đây là mốc **hết hạn → bắt đầu ÂN HẠN**. Khách **vẫn dùng đủ tính năng**. | `GRACE` | **Trong ân hạn** | `sub` giữ **ACTIVE**. → view **Cơ hội doanh thu: "Gia hạn gấp"** |
| 5 | `license.grace_expired` ✅ | **Hết ân hạn** → khách chuyển sang **dùng hạn chế tính năng, trong 30 ngày** | `RESTRICTED` 🆕 | **Hạn chế tính năng** | ⚠️ `sub.status = EXPIRED` *(đề xuất — sub vẫn gia hạn được, BR-08)*. → **Cơ hội gia hạn KHẨN, xếp trên cả "Gia hạn gấp"** *(chốt 14/07)* |
| 6 | `license.suspended` ✅ | **Ngừng do hết hạn không gia hạn** — hết 30 ngày hạn chế tính năng. *(Đây là đường **tự nhiên**; đường "ngừng do CRM ra lệnh" đi bằng `tenant.*` — xem §3.3.)* | `SUSPENDED` | Đã ngừng | `sub` giữ nguyên. **Không** có `correlation_id` *(không phải phản hồi lệnh nào)* → CRM biết nguyên nhân là **khách không gia hạn**, không phải do ta ra lệnh |
| 7 | `license.renewed` | Bản ghi license cũ được đánh dấu đã gia hạn | `RENEWED` | Đã gia hạn | Sub cũ → `RENEWED` (bàn giao cho bản kế tiếp) |
| 8 | `license.usage_synced` | Báo mức sử dụng định kỳ | *(không đổi)* | — | Cập nhật `used_seats` + `last_synced_at`. **Chu kỳ: 3 giờ** *(chốt 14/07 — tài liệu cũ ghi 1 giờ)* |
| 9 | `license.expiring_soon` | Sắp hết hạn | ❓ **Đề xuất BỎ** | — | CRM **tự tính** "sắp hết hạn" từ `expiration_date` + `renewal_notice_days` (M-05 đang làm vậy). Giữ event này = hai nguồn sự thật cho cùng một việc |

### 3.3 Sự kiện cấp Tenant = **xác nhận lệnh CRM đã có hiệu lực** *(chốt 14/07/2026)*

Bối cảnh: *"EDR chưa có action tương đương trên model License. Nhưng có thể dùng các tính năng tương đương trên **Tenant**: Suspend (terminated) / Reactivate (Resume)."*

**Cách hiểu đúng** *(chốt theo BA 14/07)*: sự kiện cấp tenant là **cơ chế nội bộ của EDR**, NHƯNG **đồng thời là phản hồi cho đúng lệnh CRM đã gửi trước đó** — nó **mang `correlation_id` trỏ về lệnh gốc**. Vì vậy CRM cập nhật `license_mirror.status` **không phải vì "đọc" sự kiện hạ tầng của EDR** *(điều đó vi phạm YT-1)*, mà vì nhận được **xác nhận rằng lệnh của chính mình đã ăn** — đây là khái niệm cấp thương mại, hợp lệ với vai trò quan sát.

| `event_key` | Là phản hồi cho lệnh | `correlation_id` | CRM đặt `license_mirror.status` | Nguyên nhân ghi lại |
|---|---|---|---|---|
| `tenant.suspended` | `subscription.suspended` (UC-SUB-09) | **có** | `SUSPENDED` (Đã ngừng) | Do CRM ra lệnh **Tạm dừng** |
| `tenant.reactivated` | `subscription.reactivated` (UC-SUB-10) | **có** | `ACTIVE` (Đang hoạt động) | Do CRM ra lệnh **Khôi phục** |
| `tenant.terminated` | `subscription.terminated` (UC-SUB-08) | **có** | `SUSPENDED` (Đã ngừng) | Do CRM ra lệnh **Thu hồi** |

**`correlation_id` là bản lề của toàn bộ chỗ này** *(nên nó nằm trong envelope bắt buộc, §2)*:
- Sự kiện tenant **có** `correlation_id` khớp một lệnh CRM đã gửi → **đây là xác nhận lệnh** → cập nhật mirror + ghi audit *"lệnh {tên} đã có hiệu lực lúc {occurred_at}"*.
- Sự kiện tenant **không có** `correlation_id`, hoặc trỏ về lệnh **không tồn tại** → EDR tự suspend tenant mà CRM **không hề ra lệnh** → **KHÔNG đổi mirror theo**; ghi nhận + **cảnh báo** *(bất thường: sản phẩm tự ý ngắt dịch vụ của một khách CRM không yêu cầu — có thể là sự cố thật hoặc thao tác nhầm phía EDR)*.

> **Vì sao cách này đúng hơn "tenant.* luôn đổi mirror":** nó **không** bắt CRM diễn giải sự kiện hạ tầng một cách vô điều kiện. Mirror chỉ đổi khi có **lệnh của chính CRM được xác nhận** — nối bằng `correlation_id`. Nhờ vậy vẫn vá được lỗ hổng LH-1 *(sub bị thu hồi không còn nằm oan trong hàng đợi mức Cao)*, mà **không** phá ranh giới quan sát YT-1.

**Ghi vào metadata của mirror** *(đề xuất)*: khi cập nhật từ một sự kiện tenant, lưu `last_change_source = "command_ack"` + `source_command_event_id` — để về sau truy được *"trạng thái này đổi vì lệnh nào, chứ không phải vì license tự đổi"*. Phân biệt với `last_change_source = "product_event"` (đường tự nhiên: hết hạn, ân hạn…).

> ✅ **OQ-INT-01 — đã chốt (14/07/2026):** sự kiện tenant cập nhật mirror **khi và chỉ khi** là phản hồi có `correlation_id` cho lệnh CRM. *(Nếu sau này EDR bổ sung action ở cấp license thì thêm `license.*` tương ứng, cơ chế `correlation_id` giữ nguyên.)*

### 3.4 ❓ REVOKED — hoãn sang phase sau *(chốt 14/07)*

EDR **chưa có cơ chế revoke license**. Trạng thái `REVOKED` **không bị bỏ hoàn toàn**, nhưng **Phase 1 không dùng**: khi EDR làm được revoke thật, thêm `license.revoked` → `REVOKED` mà không phá hợp đồng sự kiện.

**Phase 1:** M-05 phải **gỡ `REVOKED` khỏi tập trạng thái license hiển thị** *(demo + FRS UC-LIC-01/02/04 đang có — tự thêm sai)*. Thu hồi hợp đồng → EDR suspend tenant → `tenant.terminated` (có `correlation_id`) → license về `SUSPENDED` (§3.3). Sự khác nhau giữa *Tạm dừng* và *Thu hồi* nằm ở `sub.status` (SUSPENDED vs REVOKED) và ở lệnh gốc mà `correlation_id` trỏ về — **không** cần một trạng thái license riêng.

---

## 4. Sự kiện OUTBOUND — CRM → Sản phẩm

### 4.1 Danh sách *(6 sự kiện — tài liệu cũ thiếu #6)*

| # | Nghiệp vụ | `event_key` | Kích hoạt bởi | EDR làm gì | EDR gửi lại |
|---|---|---|---|---|---|
| 1 | Xác nhận subscription | `subscription.submitted` | UC-SUB-05 | Create Tenant → Tenant License → Tenant Admin → Org (nếu SINGLE_ORG) → Org License → Org Admin | `license.pending` |
| 2 | Tạm dừng | `subscription.suspended` | UC-SUB-09 | **Suspend Tenant** | `tenant.suspended` → *(mirror = SUSPENDED, §3.3)* |
| 3 | Khôi phục | `subscription.reactivated` | UC-SUB-10 | **Reactivate Tenant** | `tenant.reactivated` → *(mirror = ACTIVE)* |
| 4 | Thu hồi | `subscription.terminated` | UC-SUB-08 | **Suspend Tenant** *(EDR chưa có revoke — §3.4)* | `tenant.terminated` → *(mirror = SUSPENDED)* |
| 5 | Gia hạn | `subscription.renewed` | UC-SUB-07 | Tạo Tenant/Org License mới; đánh dấu bản cũ Renewed | `license.renewed` *(bản cũ)* + `license.activated` *(bản mới)* |
| 6 | **Yêu cầu cập nhật mức dùng** 🆕 | `usage.force_sync_requested` | UC-LIC-03 | Gửi lại số liệu mức sử dụng | `license.usage_synced` |

> **#6 bị thiếu trong tài liệu cũ** dù PRD FR-LIC-04 BR-04.2 đã yêu cầu và demo đã hiển thị.

### 4.2 Payload — `subscription.submitted` / `subscription.renewed`

Giữ nguyên schema hiện có *(customer · package · admin · license_qty · structure_mode)*, **bọc trong envelope §2**.

### 4.3 Payload — `suspended` / `reactivated` / `terminated` ⚠️ *(tài liệu cũ không có)*

```json
{
  "reason": "Khách hàng ngừng hợp đồng",
  "effective_at": "2026-07-14T10:00:00Z"
}
```
> `reason` lấy từ `subscription.suspend_reason` (đã có từ v2.4). `effective_at` = thời điểm lệnh có hiệu lực.

### 4.4 🆕 `subscription.command_failed` — sản phẩm báo "tôi không làm được lệnh của anh"

**Chiều: sản phẩm → CRM.** Bắt buộc theo NT-4.

| Trường | Ý nghĩa |
|---|---|
| `original_event_key` | Lệnh nào của CRM bị fail (`subscription.suspended`…) |
| `correlation_id` | Nối về đúng lệnh gốc trong outbox |
| `reason_code` | Mã lỗi máy đọc được (`TENANT_NOT_FOUND`, `INVALID_PACKAGE`…) |
| `reason` | Câu tiếng Việt cho người vận hành đọc |
| `attempts` | Sản phẩm đã tự thử mấy lần trước khi bỏ cuộc |
| `failed_at` | — |

**Ranh giới trách nhiệm** *(trả lời câu hỏi của BA ngày 14/07)*:

| Loại lỗi | Ví dụ | Ai xử lý |
|---|---|---|
| **Tạm thời** | Timeout · DB nghẽn · service nội bộ chưa sẵn sàng | **Sản phẩm tự retry, có trần** *(đề xuất: 5 lần / 30 phút)*. CRM không cần biết — nó tự khỏi, báo về chỉ tạo báo động giả rồi tự tắt |
| **Vĩnh viễn** | Tenant không tồn tại · gói không hợp lệ · sai cấu hình · vượt hạn mức | **Bắt buộc gửi `subscription.command_failed`** |
| **Hết trần retry** | Thử 5 lần vẫn timeout | **Coi là vĩnh viễn** → gửi `command_failed`. *Không có trần thì lỗi tạm thời hoá thành im lặng vĩnh viễn, và CRM lại phải đoán mò* |

**CRM làm gì khi nhận:** đánh dấu lệnh trong outbox là **"Sản phẩm từ chối"** *(khác "chưa tới nơi")* · hiện lý do thật ở màn Sự kiện gửi đi · đưa vào hàng đợi M-05. Nhờ vậy M-07 nói được *"CMC EDR **từ chối** lệnh Tạm dừng: tenant không tồn tại"* thay vì *"nghi ngờ sản phẩm không thực thi lệnh"*.

---

## 5. Quy tắc xử lý bắt buộc (mọi sản phẩm)

### 5.1 Chống xử lý trùng
Idempotent theo **`event_id`**. Đã xử lý → bỏ qua, không áp dụng lần hai. *(At-least-once delivery: sản phẩm/broker **sẽ** gửi lặp.)*

### 5.2 🔴 Chống sự kiện đến sai thứ tự — sẽ xảy ra, không phải "nếu"

> `license.suspended` (xảy ra **10:00**) gửi lỗi, retry lúc 10:05.
> `license.activated` (xảy ra **10:02**) tới ngay lúc 10:02.
> CRM xử lý theo thứ tự **nhận được**: ACTIVE (10:02) → SUSPENDED (10:05, nhưng là chuyện của 10:00).
> **Kết quả: license sai trạng thái, và sai vĩnh viễn.**

**Quy tắc:** chỉ áp dụng sự kiện khi `occurred_at` **mới hơn** `license_mirror.last_event_occurred_at`. Sự kiện cũ hơn → **ghi nhận, KHÔNG áp dụng**, đánh dấu *"đến muộn"*.

→ Cần thêm cột **`license_mirror.last_event_occurred_at`**. Đây cũng là nền của **replay theo chuỗi** (M-07: xử lý lại phải chạy tuần tự theo `occurred_at`, không xử lý lẻ tin cũ).

### 5.3 Xác thực nguồn gửi
HMAC-SHA256 theo `runtime_config.webhook_secret`. Chữ ký sai → **từ chối, KHÔNG xử lý lại được** *(nguồn chưa xác thực được)*.
⚠️ **Đổi khoá:** PRD §5.3.7 có `secret_rotation_state` (ân hạn 7 ngày) → trong 7 ngày, CRM chấp nhận **cả khoá cũ lẫn mới**. *Không làm vậy thì mọi tin gửi bằng khoá cũ bị đánh dấu "chữ ký không hợp lệ" và **không xử lý lại được** — mất dữ liệu thật.*

### 5.4 Không chặn đường trả lời
CRM trả **200 OK ngay** khi nhận, xử lý bất đồng bộ. Vòng đời: `RECEIVED → PROCESSED` / `FAILED_RETRYING → FAILED` *(tối đa 5 lần thử)*.

### 5.5 ⚠️ Vòng đời dữ liệu *(đề xuất — chưa có trong tài liệu nào)*
`license.usage_synced` mỗi **3 giờ** × N sub = **8 tin/sub/ngày**. 500 sub → **4.000 tin/ngày**, **~1,5 triệu/năm**.
- Tin **đã xử lý xong**: giữ **90 ngày** rồi dọn.
- Tin **lỗi / chưa xử lý**: **giữ tới khi xử lý xong**, không tự dọn.
- Màn *Sự kiện nhận về*: **mặc định ẩn** `usage_synced` đã xử lý thành công *(>95% khối lượng, không mang tin gì khi thành công)*, có bộ lọc bật lại.

---

## 6. C-Shield · CMC Antivirus · CMC CA — khung bắt buộc *(high-level)*

**Không bịa event cho sản phẩm chưa làm việc với ta.** Nhưng mọi Product Module **bắt buộc** khai đủ **4 nhóm** dưới đây vào `PRODUCT_MODULE_CONFIG.inbound_event_mapping` / `outbound_event_mapping`:

| Nhóm bắt buộc | Vì sao không được thiếu |
|---|---|
| **N1. Khởi tạo** *(đang chờ · đang triển khai · đã kích hoạt)* | Không có → CRM không biết khi nào khách bắt đầu dùng được; `sub.end_date` không có nguồn |
| **N2. Đổi trạng thái license** *(tạm dừng · khôi phục · hết hạn/ân hạn · gia hạn)* | Không có → M-05 báo lệch trạng thái **oan**, hàng đợi thành rác |
| **N3. Báo mức sử dụng** | Không có → không phát hiện được cơ hội bán thêm, và không phát hiện được **kênh chết** |
| **N4. Báo lệnh thất bại** *(§4.4)* | Không có → CRM chờ vô hạn rồi đoán mò |

**Hiện trạng khai báo:**

| Sản phẩm | N1 | N2 | N3 | N4 |
|---|---|---|---|---|
| **CMC EDR** | ✅ đầy đủ (§3) | ✅ | ✅ | ❓ chưa có — cần bổ sung |
| **C-Shield** | ✅ `subscription.provisioning.pending/done/failed` | ❌ **thiếu hoàn toàn** | ✅ `license.usage_synced` | ❌ thiếu |
| **CMC Antivirus** | ✅ *(giống C-Shield)* | ❌ **thiếu hoàn toàn** | ✅ | ❌ thiếu |
| **CMC CA** | ❌ **chưa có mục nào trong tài liệu nào** | ❌ | ❌ | ❌ |

> ❓ **OQ-INT-02:** C-Shield và AV **không có event nào cho tạm dừng / thu hồi / gia hạn**. Vậy khi CRM gửi `subscription.suspended` cho C-Shield, nó phản hồi bằng gì? Chưa chốt → **lặp lại đúng lỗ hổng của EDR, nhân cho 2 sản phẩm**.
> ❓ **OQ-INT-03:** CMC CA chưa có danh mục sự kiện nào, dù demo đã có sản phẩm này.

---

## 7. Ba lỗ hổng của tài liệu cũ — và cách vá

| # | Lỗ hổng trong `inbound_outbound_concept.md` v1.0 | Hệ quả với M-05 | Cách vá |
|---|---|---|---|
| **LH-1** | `tenant.terminated` → *"chỉ ghi nhận nội bộ"* ⇒ mirror vĩnh viễn `ACTIVE` | **Mọi sub bị thu hồi nằm mãi trong hàng đợi mức Cao** + banner đỏ oan | §3.3 — `tenant.*` đổi trạng thái mirror ⚠️ |
| **LH-2** | Không có sự kiện nào đưa license vào ân hạn; `license.expired` bị hiểu là "đã chết" | Khách **đang dùng bình thường** trong ân hạn bị báo **"đang mất dịch vụ" mức Cao** | §3.1, §3.2 — `license.expired` = **bắt đầu ân hạn** ✅ |
| **LH-3** | Sản phẩm không có đường báo "không thực thi được lệnh" | CRM **đoán mò** *"nghi ngờ sản phẩm không thực thi lệnh"* | §4.4 — 🆕 `subscription.command_failed` |

---

## 8. Việc kéo theo ở M-05 *(bắt buộc, nếu §3 được duyệt)*

| Nơi | Sửa gì |
|---|---|
| Demo `v2.6.0_license.html` | Bỏ `REVOKED`; `EXPIRED` → **"Trong ân hạn"** (dùng đủ, **không** tô xám); thêm trạng thái **"Hạn chế tính năng"** |
| UC-LIC-02 §3.5 | Trường hợp *"License đã ngừng"* đang gộp cả ân hạn + hết hạn → **tách 3 giai đoạn** |
| UC-LIC-04 BR-04, BR-10 | Ân hạn: đã loại khỏi hàng đợi ✅. **Hạn chế tính năng**: cũng **KHÔNG** vào hàng đợi — hệ thống chạy đúng, đây là chuyện **thương mại** |
| UC-LIC-01 §3.4 | Thêm loại cơ hội **"Gia hạn khẩn"** *(hạn chế tính năng — còn 30 ngày)*, **xếp trên "Gia hạn gấp"** *(đang ân hạn)* — chốt 14/07 |

---

## 9. Open Questions

| Mã | Nội dung | Mức |
|---|---|---|
| ~~OQ-INT-01~~ | ✅ **Đã chốt 14/07:** sự kiện tenant đổi mirror khi và chỉ khi là phản hồi có `correlation_id` cho lệnh CRM (§3.3). | — |
| **OQ-INT-02** | C-Shield / AV phản hồi thế nào cho `subscription.suspended` / `terminated` / `renewed`? | 🔴 Chặn dev *(Phase 3/4)* |
| **OQ-INT-03** | CMC CA — danh mục sự kiện | 🟠 |
| **OQ-INT-04** | Envelope (§2) — duyệt? | 🔴 |
| **OQ-INT-05** | Chặn sự kiện đến muộn (§5.2) + cột `last_event_occurred_at` — duyệt? | 🔴 |
| **OQ-INT-06** | `license.expiring_soon` — bỏ hay giữ? (§3.2 #9) | 🟡 |
| **OQ-INT-07** | Vòng đời dữ liệu + ẩn `usage_synced` thành công (§5.5) — duyệt? | 🟠 |
| **OQ-INT-08** | Sub chuyển `EXPIRED` khi license vào **Hạn chế tính năng** — đúng không? (§3.2 #5) | 🟠 |
