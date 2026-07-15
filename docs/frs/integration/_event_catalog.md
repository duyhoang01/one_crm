# Phụ lục A — Danh mục sự kiện tích hợp (Event Catalog)

> Module: M-07 Integration Layer | Phiên bản: 1.0 (Draft) | Ngày: 14/07/2026
> **Đây là hợp đồng kỹ thuật giữa OneCRM và mọi Product Module.** UC-INT-01/02 mô tả *cơ chế*; tài liệu này khai *nội dung*.
> Thay thế `docs/prd/inbound_outbound_concept.md` v1.0 (bản cũ có 3 lỗ hổng làm hỏng M-05 — xem §7).

**Ký hiệu:** ✅ đã chốt · 🆕 sự kiện mới đề xuất · ⚠️ suy luận của BA/AI, **cần xác nhận** · ❓ Open Question

---

## 1. Nguyên tắc nền (đọc trước khi đọc bảng)

| # | Nguyên tắc | Vì sao |
|---|---|---|
| **NT-1** | **`license_mirror` phản ánh "khách có dùng được dịch vụ không"** — KHÔNG phải "bản ghi license kỹ thuật đang mang trạng thái gì". | ⚠️ **Cần xác nhận.** EDR thực thi Tạm dừng/Khôi phục ở **cấp Tenant**, không ở cấp License. Nếu mirror chỉ soi bản ghi license thì nó **không bao giờ đổi** khi tenant bị suspend → M-05 báo lệch trạng thái oan. Vì vậy `tenant.*` **cũng là** tín hiệu đổi trạng thái mirror cho Tạm dừng/Khôi phục. *(Thu hồi dùng `license.revoked` riêng — §3.4, không qua `tenant.*`.)* |
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

### 3.1 Vòng đời license của EDR — mô hình đúng *(rà lại 14/07/2026 — BA chọn tách event riêng cho ân hạn và thu hồi)*

**Đây là thay đổi lớn nhất so với tài liệu cũ.** Sau khi hết hạn, khách hàng đi qua **BA giai đoạn**, không phải "chết ngay" — và **Thu hồi** giờ có event riêng, tách khỏi Tạm dừng:

```
                                    ┌── (CRM ra lệnh Tạm dừng) ──┐
                                    │                             ▼
PENDING → PROVISIONING → ACTIVE ────┼──────────────────────► SUSPENDED (Đã ngừng)
                                    │                             ▲
                                    ├─► GRACE ──────────► RESTRICTED ──┘
                                    │  license.grace_started      license.grace_expired
                                    │  (Trong ân hạn, dùng ĐỦ)    (Hạn chế tính năng, 30 ngày)
                                    │
                                    └─► EXPIRED — license.expired
                                       (Hết hạn, KHÔNG có ân hạn cho gói này)

  (CRM ra lệnh Thu hồi, từ BẤT KỲ trạng thái nào) ──license.revoked──► REVOKED
     🆕 khai báo chính thức trong danh mục — nhưng EDR CHƯA thực sự gửi event này ở Phase 1.
     Mọi cảnh báo/giao diện phản ứng với REVOKED TẠM ẨN cho tới khi EDR triển khai (§3.4).
```

> 🔴 **Tài liệu cũ hiểu sai chỗ này**, và M-05 đang code theo cái sai: `license.expired` bị map thành **"Hết hạn"**, tô xám, gắn nhãn *"số liệu cuối trước khi ngừng"* — **coi như license đã chết**, kể cả với khách đang trong ân hạn vẫn dùng đầy đủ. **Cách vá (rà lại 14/07):** tách hẳn một event `license.grace_started` cho trường hợp có ân hạn — `license.expired` chỉ còn dùng cho trường hợp **không có ân hạn** (mốc hết hạn = dừng ngay hoặc hạn chế ngay, tuỳ gói). ⚠️ **Giả định cần xác nhận với EDR:** liệu có gói nào thực sự không có ân hạn không, hay EDR luôn đi qua GRACE trước khi suspend — nếu luôn có ân hạn thì `license.expired` gần như không bao giờ được EDR gửi trên thực tế, chỉ tồn tại trong danh mục cho trường hợp biên.

### 3.2 Bảng sự kiện inbound — EDR

| # | `event_key` | Nghĩa THẬT với khách hàng | CRM đặt `license_mirror.status` | Tên hiển thị | Tác động lên subscription |
|---|---|---|---|---|---|
| 1 | `license.pending` | EDR đã nhận yêu cầu, khởi tạo xong Tenant | `PENDING` | Chờ khởi tạo | — |
| 2 | `license.provisioning` | Đang triển khai license | `PROVISIONING` | Đang triển khai | — |
| 3 | `license.activated` | **Kích hoạt thành công — khách bắt đầu dùng được** | `ACTIVE` | Đang hoạt động | `sub.activation_date`, `sub.end_date` ← `expiration_date` của license; `sub.status = ACTIVE` |
| 4 | `license.grace_started` 🆕 *(chốt lại 14/07 — event riêng, không tái dùng `expired`)* | **Hết hạn nhưng gói có ân hạn.** Khách **vẫn dùng đủ tính năng**. | `GRACE` | **Trong ân hạn** | `sub` giữ **ACTIVE**. → view **Cơ hội doanh thu: "Gia hạn gấp"** |
| 5 | `license.grace_expired` ✅ | **Hết ân hạn** → khách chuyển sang **dùng hạn chế tính năng, trong 30 ngày** | `RESTRICTED` 🆕 | **Hạn chế tính năng** | ⚠️ `sub.status = EXPIRED` *(đề xuất — sub vẫn gia hạn được, BR-08)*. → **Cơ hội gia hạn KHẨN, xếp trên cả "Gia hạn gấp"** *(chốt 14/07)* |
| 6 | `license.expired` ⚠️ *(nghĩa đen, chỉ áp dụng khi gói KHÔNG có ân hạn — xem cảnh báo ở §3.1)* | Hết hạn, **không** đi qua giai đoạn ân hạn | `RESTRICTED` *(cùng xử lý như hết ân hạn — hạn chế tính năng 30 ngày, không dừng ngay)* | Hạn chế tính năng | ⚠️ `sub.status = EXPIRED`, sub vẫn gia hạn được — cùng quy tắc với dòng #5 |
| 7 | `license.suspended` ✅ | **Ngừng do hết hạn không gia hạn** — hết 30 ngày hạn chế tính năng. *(Đây là đường **tự nhiên**; đường "ngừng do CRM ra lệnh Tạm dừng" đi bằng `tenant.*` — xem §3.3. Đường "ngừng do CRM ra lệnh Thu hồi" đi bằng `license.revoked` — xem §3.4.)* | `SUSPENDED` | Đã ngừng | `sub` giữ nguyên. **Không** có `correlation_id` *(không phải phản hồi lệnh nào)* → CRM biết nguyên nhân là **khách không gia hạn**, không phải do ta ra lệnh |
| 8 | `license.revoked` 🆕 *(chốt 14/07 — xem §3.4)* | **CRM đã ra lệnh Thu hồi** (chấm dứt hợp đồng) và EDR xác nhận đã thực thi | `REVOKED` | Đã thu hồi | `sub.status = REVOKED`. **Phase 1: EDR chưa gửi event này thật** — mọi UI/cảnh báo phản ứng với REVOKED tạm ẩn (§3.4) |
| 9 | `license.renewed` | Bản ghi license cũ được đánh dấu đã gia hạn | `RENEWED` | Đã gia hạn | Sub cũ → `RENEWED` (bàn giao cho bản kế tiếp) |
| 10 | `license.usage_synced` | Báo mức sử dụng định kỳ | *(không đổi)* | — | Cập nhật `used_seats` + `last_synced_at`. **Chu kỳ: 3 giờ** *(chốt 14/07 — tài liệu cũ ghi 1 giờ)* |
| 11 | `license.expiring_soon` | Sắp hết hạn | `EXPIRING_SOON` ✅ **Giữ** *(rà lại 14/07 — event + fallback)* | Sắp hết hạn | `sub` giữ **ACTIVE**. CRM **ưu tiên** nhận qua event này (đúng NT-2, không tự suy diễn). ⚠️ **Fallback đã chốt:** nếu chưa nhận được event mà vẫn còn cách hạn trong khoảng `renewal_notice_days`, M-05 **tạm giữ** cách tự tính hiện tại — không mất tính năng nhắc gia hạn cho tới khi EDR triển khai event này (ngoài phạm vi M-07, cần cập nhật ở FRS M-05) |

### 3.3 Sự kiện cấp Tenant = **xác nhận lệnh CRM đã có hiệu lực** *(chốt 14/07/2026)*

Bối cảnh: *"EDR chưa có action tương đương trên model License. Nhưng có thể dùng các tính năng tương đương trên **Tenant**: Suspend (terminated) / Reactivate (Resume)."*

**Cách hiểu đúng** *(chốt theo BA 14/07)*: sự kiện cấp tenant là **cơ chế nội bộ của EDR**, NHƯNG **đồng thời là phản hồi cho đúng lệnh CRM đã gửi trước đó** — nó **mang `correlation_id` trỏ về lệnh gốc**. Vì vậy CRM cập nhật `license_mirror.status` **không phải vì "đọc" sự kiện hạ tầng của EDR** *(điều đó vi phạm YT-1)*, mà vì nhận được **xác nhận rằng lệnh của chính mình đã ăn** — đây là khái niệm cấp thương mại, hợp lệ với vai trò quan sát.

| `event_key` | Là phản hồi cho lệnh | `correlation_id` | CRM đặt `license_mirror.status` | Nguyên nhân ghi lại |
|---|---|---|---|---|
| `tenant.suspended` | `subscription.suspended` (UC-SUB-09) | **có** | `SUSPENDED` (Đã ngừng) | Do CRM ra lệnh **Tạm dừng** |
| `tenant.reactivated` | `subscription.reactivated` (UC-SUB-10) | **có** | `ACTIVE` (Đang hoạt động) | Do CRM ra lệnh **Khôi phục** |

> ⚠️ **Rà lại 14/07 — bỏ `tenant.terminated` khỏi bảng này.** Trước đây "Thu hồi" (`subscription.terminated`) cũng đi qua cơ chế `tenant.*` + `correlation_id` như trên, đổ về `SUSPENDED` — nghĩa là Tạm dừng và Thu hồi **không phân biệt được** trên `license_mirror.status`. BA đã chọn tách hẳn: **Thu hồi giờ dùng event riêng `license.revoked`** (§3.4), không còn qua `tenant.terminated`. Cơ chế `correlation_id` ở bảng trên **chỉ còn áp dụng cho Tạm dừng/Khôi phục**.

**`correlation_id` là bản lề của toàn bộ chỗ này** *(nên nó nằm trong envelope bắt buộc, §2)*:
- Sự kiện tenant **có** `correlation_id` khớp một lệnh CRM đã gửi → **đây là xác nhận lệnh** → cập nhật mirror + ghi audit *"lệnh {tên} đã có hiệu lực lúc {occurred_at}"*.
- Sự kiện tenant **không có** `correlation_id`, hoặc trỏ về lệnh **không tồn tại** → EDR tự suspend tenant mà CRM **không hề ra lệnh** → **KHÔNG đổi mirror theo**; ghi nhận + **cảnh báo** *(bất thường: sản phẩm tự ý ngắt dịch vụ của một khách CRM không yêu cầu — có thể là sự cố thật hoặc thao tác nhầm phía EDR)*.

> **Vì sao cách này đúng hơn "tenant.* luôn đổi mirror":** nó **không** bắt CRM diễn giải sự kiện hạ tầng một cách vô điều kiện. Mirror chỉ đổi khi có **lệnh của chính CRM được xác nhận** — nối bằng `correlation_id`. Nhờ vậy vẫn vá được lỗ hổng LH-1 *(sub bị thu hồi không còn nằm oan trong hàng đợi mức Cao)*, mà **không** phá ranh giới quan sát YT-1.

**Ghi vào metadata của mirror** *(đề xuất)*: khi cập nhật từ một sự kiện tenant, lưu `last_change_source = "command_ack"` + `source_command_event_id` — để về sau truy được *"trạng thái này đổi vì lệnh nào, chứ không phải vì license tự đổi"*. Phân biệt với `last_change_source = "product_event"` (đường tự nhiên: hết hạn, ân hạn…).

> ✅ **OQ-INT-01 — đã chốt (14/07/2026):** sự kiện tenant cập nhật mirror **khi và chỉ khi** là phản hồi có `correlation_id` cho lệnh CRM. *(Nếu sau này EDR bổ sung action ở cấp license thì thêm `license.*` tương ứng, cơ chế `correlation_id` giữ nguyên.)*

### 3.4 ✅ REVOKED — khai báo chính thức `license.revoked`, nhưng ẩn UI/cảnh báo ở Phase 1 *(rà lại 14/07)*

**Quyết định (rà lại 14/07):** khai báo **`license.revoked` → `REVOKED`** là event inbound chính thức trong danh mục — đây là phản hồi cho lệnh outbound `subscription.terminated` (Thu hồi, UC-SUB-08), **không** còn đi qua `tenant.terminated` như thiết kế trước (§3.3). Nhờ vậy `license_mirror.status` phân biệt được rõ **Tạm dừng** (`SUSPENDED`, có thể khôi phục) và **Thu hồi** (`REVOKED`, chấm dứt hợp đồng) — điều bản thiết kế cũ không làm được.

**Nhưng — theo LH-1:** EDR **hiện tại chưa có cơ chế revoke license thật**, tức **chưa thực sự gửi `license.revoked`**. Vì vậy ở **Phase 1**:
- Danh mục **khai báo sẵn** event key + mapping (forward-compatible — khi EDR làm xong, không cần đổi hợp đồng sự kiện).
- **Chưa thiết kế/triển khai** bất kỳ tính năng, cảnh báo, hay giao diện nào **phản ứng với trạng thái REVOKED** (vd mismatch detection UC-LIC-04 BR-09 "lệch kiểu A", banner "sản phẩm không thực thi lệnh") — **tạm ẩn/bỏ qua**, chưa thực hiện.
- Lệnh outbound `subscription.terminated` (Thu hồi) vẫn được **gửi và ghi nhận đã gửi** ở UC-INT-01 như bình thường — chỉ là **CRM chưa mong đợi phản hồi `license.revoked` thật** từ EDR trong Phase 1, nên không dựng cơ chế phát hiện "chưa phản hồi" cho riêng trường hợp này.

⚠️ **Kéo theo M-05** (ngoài phạm vi M-07, cần đối chiếu riêng khi làm/rà M-05): vì `REVOKED` giờ là trạng thái chính thức trong danh mục (khác với quyết định cũ "gỡ REVOKED khỏi M-05"), **có thể giữ nguyên `REVOKED` trong demo/FRS M-05 hiện có** — nhưng ẩn mọi cảnh báo/mismatch logic liên quan tới nó cho tới khi EDR triển khai event thật.

---

## 4. Sự kiện OUTBOUND — CRM → Sản phẩm

### 4.1 Danh sách *(6 sự kiện — tài liệu cũ thiếu #6)*

| # | Nghiệp vụ | `event_key` | Kích hoạt bởi | EDR làm gì | EDR gửi lại |
|---|---|---|---|---|---|
| 1 | Xác nhận subscription | `subscription.submitted` | UC-SUB-05 | Create Tenant → Tenant License → Tenant Admin → Org (nếu SINGLE_ORG) → Org License → Org Admin | `license.pending` |
| 2 | Tạm dừng | `subscription.suspended` | UC-SUB-09 | **Suspend Tenant** | `tenant.suspended` → *(mirror = SUSPENDED, §3.3)* |
| 3 | Khôi phục | `subscription.reactivated` | UC-SUB-10 | **Reactivate Tenant** | `tenant.reactivated` → *(mirror = ACTIVE)* |
| 4 | Thu hồi | `subscription.terminated` | UC-SUB-08 | *(Phase 1: EDR chưa có cơ chế revoke thật — §3.4)* | `license.revoked` → *(mirror = REVOKED — khai báo, chưa thực thi thật ở EDR Phase 1)* |
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

✅ **Đổi khoá (rà lại 14/07 — BK-3/Q8):** BA để **Dev quyết định cơ chế cụ thể**. FRS chỉ nêu **ràng buộc nghiệp vụ bắt buộc**: *đổi khoá bảo mật KHÔNG được làm mất dữ liệu webhook hợp lệ* — vì nếu đổi khoá "cứng" (chỉ chấp nhận khoá mới ngay lập tức), mọi tin gửi trong lúc EDR chưa kịp cập nhật khoá sẽ bị đánh dấu "chữ ký không hợp lệ" và **không xử lý lại được** (BR-01) → mất dữ liệu license/usage thật. PRD §5.3.7 đã có sẵn field `secret_rotation_state` (ân hạn 7 ngày) mà Dev có thể dùng làm cơ sở — cách làm phổ biến là chấp nhận song song cả khoá cũ lẫn mới trong thời gian ân hạn (dual-secret rotation).

### 5.4 Không chặn đường trả lời
CRM trả **200 OK ngay** khi nhận, xử lý bất đồng bộ. Vòng đời: `RECEIVED → PROCESSED` / `FAILED_RETRYING → FAILED` *(tối đa 5 lần thử)*.

### 5.5 ✅ Vòng đời dữ liệu *(chốt 14/07 — theo trả lời BK-2, thay cho đề xuất cũ)*
`license.usage_synced` mỗi **3 giờ** × N sub = **8 tin/sub/ngày**. 500 sub → **4.000 tin/ngày**, **~1,5 triệu/năm**.

- **Message Queue**: tin chỉ tồn tại tới khi xử lý **thành công** — đúng cơ chế hàng đợi thông thường, không phải việc của CRM lưu trữ.
- **Database (`WEBHOOK_INBOX`)**: **KHÔNG có purge tự động ở giai đoạn này** — mọi tin (kể cả `usage_synced` đã xử lý xong) **giữ nguyên trong DB**. Cơ chế backup/lưu trữ dài hạn **để sau, chưa phân tích trong giai đoạn này**.
- **Giao diện** (tab Tích hợp — cả *Sự kiện gửi đi* và *Sự kiện nhận về*): thay vì ẩn mặc định `usage_synced` thành công, dùng **bộ lọc mặc định theo thời gian** — vd **3 ngày gần nhất** — để màn không bị 4.000 tin/ngày làm ngợp; người dùng tự nới khoảng thời gian khi cần tra cứu xa hơn.

---

## 6. C-Shield · CMC Antivirus · CMC CA — khung bắt buộc *(high-level)*

**Không bịa event cho sản phẩm chưa làm việc với ta.** Nhưng mọi Product Module **bắt buộc** khai đủ **4 nhóm** dưới đây vào `PRODUCT_MODULE_CONFIG.inbound_event_mapping` / `outbound_event_mapping`, đều **bọc trong envelope chung §2**:

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
| **C-Shield** | ⚠️ tentative (§6.1) | ⚠️ tentative (§6.1) | ⚠️ tentative (§6.1) | ❌ thiếu |
| **CMC Antivirus** | ⚠️ tentative (§6.1) | ⚠️ tentative (§6.1) | ⚠️ tentative (§6.1) | ❌ thiếu |
| **CMC CA** | ❌ **chưa có declaration nào — kể cả skeleton** (§6.2) | ❌ | ❌ | ❌ |

### 6.1 C-Shield · CMC Antivirus — khung đề xuất *(⚠️ 100% suy luận từ PRD §6.10/§6.11, CHƯA xác nhận với đội sản phẩm)*

**Nguồn:** PRD v2.6 §6.10.7 (C-Shield "Outbound/Inbound Mapping — tentative") và §6.11.7 (AV, tương tự) — đây là **placeholder do chính PRD tự nhận "tentative"**, không phải bịa mới. Dưới đây chỉ **sắp xếp lại** các event đã có trong PRD vào 4 nhóm bắt buộc + đề xuất phần N4 còn thiếu hoàn toàn ở cả hai PRD.

| Nhóm | C-Shield *(PRD §6.10.7)* | CMC Antivirus *(PRD §6.11.7)* |
|---|---|---|
| **N1. Khởi tạo** | `registration.received` → `project.created` → `jwt.generated` → `sdk.build.started/completed` → `sdk.delivered` | `keys.allocated` → `keys.delivered` |
| **N2. Đổi trạng thái license** | `instance.activated` → `ACTIVE`; `instance.grace` → `GRACE`; `instance.revoked` → `REVOKED`; `instance.expired` → `EXPIRED` | `key.activated` → `ACTIVE`; `key.expired` → `EXPIRED`; `key.revoked` → `REVOKED` |
| **N3. Báo mức sử dụng** | `usage.report` → cập nhật `apps_active` / `apps_total` (PRD §6.10.5) | `usage.report` → cập nhật `devices_activated` / `devices_total` (PRD §6.11.5) |
| **N4. Báo lệnh thất bại** | ❌ **PRD chưa khai** — đề xuất thêm `subscription.command_failed` cùng cấu trúc §4.4 *(nhất quán với EDR, tránh lặp lại LH-3 cho 2 sản phẩm này)* | ❌ **PRD chưa khai** — đề xuất tương tự |

⚠️ **Lưu ý khi đối chiếu:** tên event trong PRD **không theo convention `license.*`/`tenant.*`** đã chốt cho EDR (§3, §NT-5) — đây là điều **cần đội sản phẩm C-Shield/AV xác nhận lại** khi vào Phase 3/4, không phải điều FRS này tự đổi tên được. Cũng chưa có `grace_started` tương đương cho C-Shield dù PRD có trạng thái `GRACE_PERIOD` ở LICENSE_INSTANCE (§6.10.6) — cùng dạng lỗ hổng LH-2 của EDR, **áp dụng luôn nguyên tắc NT-2** khi Phase 3 triển khai thật: mọi đổi trạng thái phải có event tương ứng, không suy diễn.

### 6.2 CMC CA — không có gì để khai, kể cả skeleton

Khác C-Shield/AV *(đã có declaration skeleton trong PRD §6.10/§6.11, dù chưa functional)*, **CMC CA không xuất hiện ở bất kỳ đâu trong PRD** — không có PM-04, không có Module Registration, không có license status set. Roadmap YT-5 xếp CA vào **Phase 5+ ("CA và sản phẩm tương lai")**, tức **chưa tới lượt scoping**.

→ Đây **không phải một Open Question ở tầm M-07** (không thể "chốt danh mục sự kiện" cho một sản phẩm chưa có declaration) — mà là **gap giữa demo và PRD**: demo `v2.7.0_integration.html` đang hiển thị CMC CA như một sản phẩm đã tích hợp. Cần báo lại cho BA/PO quyết định: (a) gỡ CMC CA khỏi demo cho tới khi có PM-04 skeleton, hoặc (b) gắn nhãn rõ "minh hoạ trước — chưa có trong PRD" nếu vẫn muốn giữ demo cho mục đích trình bày roadmap.

---

## 7. Ba lỗ hổng của tài liệu cũ — và cách vá

| # | Lỗ hổng trong `inbound_outbound_concept.md` v1.0 | Hệ quả với M-05 | Cách vá *(rà lại 14/07)* |
|---|---|---|---|
| **LH-1** | Không có event nào đặt license về REVOKED ⇒ mirror vĩnh viễn `ACTIVE`/`SUSPENDED` | **Mọi sub bị thu hồi nằm mãi trong hàng đợi mức Cao** + banner đỏ oan | §3.4 — 🆕 khai báo `license.revoked` → `REVOKED` chính thức, nhưng **ẩn mọi UI/cảnh báo phản ứng với REVOKED ở Phase 1** (EDR chưa gửi event thật) |
| **LH-2** | Không có sự kiện nào đưa license vào ân hạn; `license.expired` bị hiểu là "đã chết" | Khách **đang dùng bình thường** trong ân hạn bị báo **"đang mất dịch vụ" mức Cao** | §3.1, §3.2 — 🆕 event riêng `license.grace_started` = **vào ân hạn**; `license.expired` trả về nghĩa đen, chỉ dùng khi gói không có ân hạn |
| **LH-3** | Sản phẩm không có đường báo "không thực thi được lệnh" | CRM **đoán mò** *"nghi ngờ sản phẩm không thực thi lệnh"* | §4.4 — 🆕 `subscription.command_failed` |

---

## 8. Việc kéo theo ở M-05 *(bắt buộc, nếu §3 được duyệt — ngoài phạm vi rà soát M-07 này, cần đối chiếu riêng khi làm/rà M-05)*

| Nơi | Sửa gì |
|---|---|
| Demo `v2.6.0_license.html` | **Giữ `REVOKED`** *(đổi so với quyết định cũ — REVOKED nay là trạng thái chính thức, §3.4)*, nhưng **ẩn mọi mismatch/cảnh báo liên quan** cho tới khi EDR gửi event thật; `GRACE` → **"Trong ân hạn"** (dùng đủ, **không** tô xám); thêm trạng thái **"Hạn chế tính năng"** cho `RESTRICTED` |
| UC-LIC-02 §3.5 | Trường hợp *"License đã ngừng"* đang gộp cả ân hạn + hết hạn → **tách các giai đoạn**: Trong ân hạn / Hạn chế tính năng / Đã ngừng / Đã thu hồi |
| UC-LIC-04 BR-04, BR-09, BR-10 | Ân hạn + Hạn chế tính năng: **KHÔNG** vào hàng đợi mismatch — chuyện **thương mại**, hệ thống chạy đúng. **REVOKED**: mismatch logic liên quan (BR-09 "lệch kiểu A") **tạm ẩn/bỏ qua** — chưa triển khai (LH-1) |
| UC-LIC-01 §3.4 | Thêm loại cơ hội **"Gia hạn khẩn"** *(hạn chế tính năng — còn 30 ngày)*, **xếp trên "Gia hạn gấp"** *(đang ân hạn)* |
| UC-LIC (chung) | `EXPIRING_SOON`: ưu tiên nhận qua `license.expiring_soon`, **fallback** giữ nguyên tự tính `renewal_notice_days` khi chưa có event (§3.2 #11) |

---

## 9. Open Questions

> Rà lại lần 2 — 14/07/2026 — đối chiếu với `docs/plans/M-07_event_catalog_questions.md` sau khi BA trả lời đầy đủ Q1–Q9 + LH-1..3 + BK-1..3 + TS-1..5. Lần rà đầu (cùng ngày) đã đóng một số OQ dựa trên câu trả lời **chưa đầy đủ lúc đó** — 2 trong số đó (REVOKED, GRACE) hoá ra **ngược lại thiết kế đã viết**, đã sửa lại nội dung thật ở §3, không chỉ đổi nhãn OQ. OQ-INT-07 cũng bị đóng nhầm ở lần rà đầu (dựa theo đề xuất cũ) — đã sửa theo câu trả lời đúng (BK-2).

| Mã | Nội dung | Mức |
|---|---|---|
| ~~OQ-INT-01~~ | ✅ **Đã chốt:** `tenant.*` đổi mirror khi và chỉ khi là phản hồi có `correlation_id` cho lệnh CRM — **nay chỉ áp dụng cho Tạm dừng/Khôi phục** (§3.3); Thu hồi tách ra dùng `license.revoked` riêng (§3.4). | — |
| ~~OQ-INT-04~~ | ✅ **Đã chốt:** envelope 7 trường (§2) là chuẩn bắt buộc. | — |
| ~~OQ-INT-05~~ | ✅ **Đã chốt:** chặn sự kiện đến muộn theo `occurred_at` + cột `license_mirror.last_event_occurred_at` (§5.2). | — |
| ~~OQ-INT-06~~ | ✅ **Đã chốt:** GIỮ `EXPIRING_SOON`, ưu tiên event `license.expiring_soon`, **fallback** tự tính `renewal_notice_days` khi chưa có event (§3.2 #11). | — |
| ~~OQ-INT-07~~ | ✅ **Đã chốt (sửa lại theo BK-2 — bản trước dựa trên đề xuất cũ, sai):** **không** purge tự động, giữ nguyên DB, backup để sau; **bộ lọc mặc định theo thời gian** (vd 3 ngày) ở tab Tích hợp thay vì ẩn `usage_synced` thành công (§5.5). | — |
| ~~OQ-INT-09~~ 🆕 | ✅ **Đã chốt:** REVOKED — khai báo `license.revoked` → `REVOKED` chính thức (không còn qua `tenant.terminated`); EDR chưa gửi thật ở Phase 1 nên mọi UI/cảnh báo liên quan tạm ẩn (§3.4). | — |
| ~~OQ-INT-10~~ 🆕 | ✅ **Đã chốt:** GRACE — thêm event riêng `license.grace_started` (không tái dùng `license.expired`); `license.expired` trả về nghĩa đen, chỉ dùng khi gói không có ân hạn (§3.1, §3.2). ⚠️ Giả định cần EDR xác nhận: có gói nào thực sự không ân hạn không. | — |
| **OQ-INT-02** | C-Shield / AV phản hồi thế nào cho `subscription.suspended` / `terminated` / `renewed`? **Đã có khung đề xuất** ở §6.1 (nguồn PRD §6.10.7/§6.11.7), nhưng event key **chưa theo convention `license.*`** và N4 (báo lỗi) **PRD chưa khai** — cần đội sản phẩm C-Shield/AV xác nhận, không phải BA CRM tự quyết. | 🔴 Chặn dev *(Phase 3/4)* |
| **OQ-INT-03** | CMC CA — **không có declaration nào trong PRD, kể cả skeleton** (khác C-Shield/AV). BA xác nhận (TS-4): demo chỉ tạm thời, Phase 1 chỉ làm cho EDR — cần BA/PO quyết định gỡ CMC CA khỏi demo hay gắn nhãn "minh hoạ trước". | 🟠 |
| **OQ-INT-08** | Sub chuyển `EXPIRED` khi license vào **Hạn chế tính năng** — đúng không? (§3.2 #5) | 🟠 |
