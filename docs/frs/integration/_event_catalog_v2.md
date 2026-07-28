# Phụ lục A — Danh mục event tích hợp (Event Catalog)

> Module: Integration Layer | Phiên bản: 2.0 | Ngày: 27/07/2026 *(v1.0: 14/07/2026)*
> Áp dụng 2 điểm sửa Critical (**A**, **B**) từ [Review kiến trúc — Event Catalog](_event_catalog_review.md); mọi nội dung khác giữ nguyên như v1.0.

---

## 0. Mục đích tài liệu & đối tượng đọc

### Tài liệu này dùng để làm gì

Đây là **danh mục event tích hợp (Event Catalog)** — bản khai báo **nội dung** của mọi event trao đổi giữa OneCRM và Product Module CMC EDR. Nó là **nguồn sự thật duy nhất** trả lời 4 câu hỏi:

1. **Có những event nào?** — Sản phẩm gửi những event nào về CRM (inbound, §3), và CRM gửi những event nào sang sản phẩm (outbound, §4).
2. **Mỗi event chứa những thông tin gì?** — Mọi event đều có **2 lớp**:
   - (a) **metadata chung** — 7 trường bắt buộc (`event_id`, `event_key`, `occurred_at`, `subscription_id`, `product_id`, `correlation_id`, `schema_version`) **giống hệt nhau ở mọi event, mọi sản phẩm**, dùng để chống trùng, chống sai thứ tự và truy vết (§2).
   - (b) **payload** — phần nội dung **riêng theo từng loại event** (vd `activation_date`, `usage_snapshot`…), được khai báo chi tiết ở §3/§4.
3. **Nhận được event inbound rồi CRM xử lý thế nào?** — Ánh xạ event → `license_mirror.status` + tác động lên subscription (§3.2); quy tắc xử lý bắt buộc: chống trùng, chống sai thứ tự, xác thực nguồn (§5).
4. **Nhận được lệnh outbound rồi EDR phải làm gì?** — Với mỗi lệnh CRM gửi sang, EDR thực hiện nghiệp vụ gì và gửi event nào về để xác nhận (§4).

> **Phân vai với FRS khác:** [UC-INT-01](UC-INT-01_publish_outbound_event.md)/[UC-INT-02](UC-INT-02_receive_inbound_event.md) đặc tả *cơ chế* (làm sao publish/nhận, retry, outbox/inbox); tài liệu này khai báo *nội dung* (gửi/nhận **cái gì**, mang **trường nào**, nghĩa **là gì**). Đây là **mô tả kỹ thuật** hai bên phải cùng tuân thủ — không phải mô tả một chức năng có giao diện.

Tài liệu **thay thế** `docs/prd/inbound_outbound_concept.md` v1.0 (bản cũ có lỗ hổng làm hỏng module License Mirror & Usage).

### Ai đọc, để làm gì

| Đối tượng | Đọc để làm gì |
| --- | --- |
| **Dev Integration Layer** | Nguồn chuẩn để build outbox publisher + webhook receiver: metadata (§2), danh sách event key (§3/§4), quy tắc idempotent / chống sai thứ tự / HMAC (§5) |
| **Đội sản phẩm EDR** | Biết CRM **gửi lệnh gì** và **mong nhận phản hồi gì**, đúng format nào — để hai bên **thống nhất hợp đồng event** trước khi tích hợp |
| **Dev / BA License Mirror & Usage** | Bảng ánh xạ event → `license_mirror.status` (§3.2) **trực tiếp** quyết định trạng thái hiển thị của mỗi bản ghi License Mirror — ví dụ *Đang hoạt động · Trong ân hạn · Hạn chế tính năng · Đã ngừng · Đã thu hồi* |
| **QA** | Cơ sở viết test: chống xử lý trùng — một event dù nhận về nhiều lần cũng chỉ xử lý một lần (§5.1), chống event đến muộn (§5.2), ánh xạ trạng thái đúng (§3.2), lệnh thất bại (§3.5) |
| **BA / PO** | Theo dõi Open Questions (§6), phê duyệt thay đổi nghiệp vụ (ân hạn / hạn chế tính năng — §3) |

---

## 1. Thuật ngữ & Chữ viết tắt

> Mục này giải nghĩa các thuật ngữ và chữ viết tắt được dùng xuyên suốt tài liệu. Đọc trước khi đi vào các bảng đặc tả event ở §2 trở đi.

### 1.1 Thuật ngữ

| Thuật ngữ | Giải nghĩa |
| --- | --- |
| **`correlation_id`** | Mã dùng để **nối một lệnh outbound của CRM với phản hồi inbound của sản phẩm**, nhờ đó biết được một event đến là phản hồi cho lệnh nào (xem §2 và §3.3). |
| **Idempotent (chống xử lý trùng)** | Tính chất đảm bảo cùng một event dù nhận về nhiều lần cũng chỉ được áp dụng **đúng một lần**, dựa trên `event_id` (xem §5.1). |
| **Webhook** | Cơ chế trong đó sản phẩm chủ động gọi HTTP tới một endpoint của CRM để đẩy event inbound về. |
| **Outbox** | Bảng hàng chờ lưu các event outbound đã được ghi *cùng giao dịch với thay đổi nghiệp vụ* nhưng chưa gửi đi, giúp worker gửi lại và bảo đảm không mất lệnh (xem UC-INT-01). |
| **Inbox (`WEBHOOK_INBOX`)** | Bảng lưu mọi event inbound đã nhận, phục vụ chống trùng, xử lý lại (replay) và truy vết (xem UC-INT-05). |
| **Replay** | Việc xử lý lại các event inbound đã lưu, theo đúng thứ tự thời gian `occurred_at` (xem §5.2 và UC-INT-05). |
| **HMAC-SHA256** | Thuật toán ký và xác thực chữ ký số trên nội dung webhook, giúp CRM xác minh event thật sự đến từ một sản phẩm hợp lệ (xem §5.3). |
| **`license_mirror` (Mirror)** | Bản sao **chỉ-đọc** tại CRM, phản ánh lại trạng thái và mức sử dụng của license thật bên sản phẩm. CRM không sở hữu license mà chỉ soi chiếu lại (thuộc module License Mirror & Usage). |
| **Tenant** | Đơn vị quản lý khách hàng bên trong sản phẩm EDR (mỗi khách hàng tương ứng một tenant). EDR thực thi các hành động Tạm dừng/Khôi phục ở cấp tenant (xem §3.3). |
| **Provisioning** | Quá trình sản phẩm khởi tạo hạ tầng để khách hàng bắt đầu dùng được dịch vụ (tạo tenant, cấp license, tạo tài khoản quản trị…). |
| **Ân hạn (`EXPIRED`)** | Giai đoạn ngay sau khi license hết hạn nhưng khách hàng **vẫn dùng đủ tính năng** trong một khoảng thời gian, trước khi bị hạn chế (xem §3.1). |
| **Hạn chế tính năng (`GRACE_EXPIRED`)** | Giai đoạn sau ân hạn: khách hàng bị **giảm hoặc khoá bớt tính năng** nhưng dịch vụ chưa dừng hẳn (xem §3.2). |
| **Product Module** | Một sản phẩm trong hệ sinh thái tích hợp với OneCRM (EDR, C-Shield, AV, CA). Mỗi Product Module tự khai báo tập trạng thái và bảng ánh xạ event của riêng mình. |
| **`license_status_set`** | Tập tên trạng thái hiển thị cho người dùng, **do từng Product Module khai báo**, không cố định (hardcode) trong lõi CRM (xem nguyên tắc NT-5, §1.3). |

### 1.2 Chữ viết tắt

| Viết tắt | Nghĩa đầy đủ |
| --- | --- |
| **YT-1..YT-5** | 5 yếu tố cốt lõi (anchor) của OneCRM trong PRD; ví dụ YT-1 là vai trò passive-observer của CRM |
| **NT** | Nguyên tắc nền — quy tắc chi phối cách trao đổi event, đánh số trong tài liệu này (§1.3) |
| **OQ** | Open Question — câu hỏi mở chưa chốt (§6) |

### 1.3 Nguyên tắc nền

Năm nguyên tắc dưới đây chi phối toàn bộ cách CRM trao đổi event với sản phẩm. Mọi quy tắc nghiệp vụ và bảng ánh xạ event ở các mục sau đều phải tuân thủ chúng.

| Mã | Nguyên tắc | Diễn giải đầy đủ |
| --- | --- | --- |
| **NT-1** | `license_mirror` phản ánh *"khách hàng có dùng được dịch vụ hay không"*, chứ không phản ánh trạng thái kỹ thuật của bản ghi license. | Mọi thay đổi của mirror **chỉ** đến từ **event `license.*`** do EDR gửi — CRM đọc event **trạng thái license**, **không** đọc event hạ tầng (đúng NT-2).  Riêng Tạm dừng / Khôi phục: bên trong EDR thực thi ở **cấp Tenant**, nhưng event gửi về CRM **vẫn mang tên `license.suspended` / `license.reactivated`** và **echo lại `correlation_id`** của lệnh CRM đã gửi.  Nhờ `correlation_id`, cùng một event `license.suspended` phân biệt được **hai nguồn**: • **Có** `correlation_id` → do CRM ra lệnh **Tạm dừng** (xác nhận lệnh — command-ack). • **Không** có `correlation_id` → do **EDR chủ động gửi về**, xảy ra **tự nhiên** (khách hết ân hạn, không gia hạn).  → Không cần event `tenant.*` riêng. |
| **NT-2** | CRM chỉ **quan sát**, tuyệt đối không tự suy diễn trạng thái. | Trạng thái của một license tại CRM chỉ được thay đổi khi **sản phẩm chủ động gửi event** báo về. CRM không được tự tính toán theo kiểu "license này chắc đã hết hạn rồi" dựa trên ngày tháng, vì làm như vậy sẽ vi phạm vai trò passive-observer đã được chốt tại anchor YT-1. |
| **NT-3** | Mọi event, ở cả hai chiều, đều bắt buộc phải mang đủ bộ **metadata dùng chung**. | Bộ metadata 7 trường (đặc tả tại §2) là bắt buộc. Thiếu `event_id` thì không thể chống xử lý trùng; thiếu `occurred_at` thì không thể chặn event đến sai thứ tự; thiếu `correlation_id` thì không thể truy vết một phản hồi thuộc về lệnh nào. |
| **NT-4** | Sản phẩm tự xử lý những lỗi mà nó có thể tự khắc phục; những lỗi không tự khắc phục được thì **bắt buộc phải báo về** cho CRM. | **Lỗi tạm thời** (timeout, nghẽn mạng, service nội bộ chưa sẵn sàng): sản phẩm **tự thử lại có giới hạn số lần**, **không** cần báo về CRM.  **Lỗi vĩnh viễn** (tenant không tồn tại, gói không hợp lệ…) **hoặc đã hết số lần thử lại**: sản phẩm **bắt buộc** gửi event `subscription.command_failed` (xem §3.5).  Nếu không có cơ chế này, CRM phải chờ vô hạn rồi đoán mò lý do — trong khi sản phẩm đã biết chính xác nguyên nhân thất bại. |
| **NT-5** | Tên trạng thái hiển thị cho người dùng do **từng Product Module khai báo**, không cố định trong lõi CRM. | Mã event kỹ thuật của sản phẩm không nhất thiết trùng nghĩa với dòng chữ mà người dùng đọc trên màn hình. Ví dụ: EDR gửi event `license.expired`, nhưng dòng chữ hiển thị đúng cho một khách hàng đang trong giai đoạn ân hạn lại phải là "Trong ân hạn" (xem §3.2). Vì vậy, lõi CRM tra tên hiển thị từ `license_status_set` do Product Module khai báo, thay vì cố định danh sách trạng thái trong mã nguồn. |

---

## 2. Metadata dùng chung — bắt buộc cho MỌI event, cả 2 chiều

> *Bộ metadata này là đề xuất của BA — chưa có trong tài liệu tích hợp gốc.* **Đây là nội dung cần thống nhất chính thức với phía sản phẩm trước khi triển khai.**

Mỗi event gồm **hai lớp**: lớp **metadata** (7 trường cố định, đặc tả trong bảng dưới) và lớp **payload** (nội dung nghiệp vụ riêng theo từng loại event, đặc tả tại §3.2, §4.2 và §4.3). Bảng dưới đặc tả lớp metadata — bắt buộc và **giống hệt nhau** ở mọi event, cả chiều inbound lẫn outbound, cho mọi Product Module.

| # | Trường | Kiểu dữ liệu | Bắt buộc | Mô tả |
| --- | --- | --- | --- | --- |
| 1 | `event_id` | UUID | Có | Mã định danh **duy nhất** của từng event, do bên gửi sinh ra. Là khoá để chống xử lý trùng. |
| 2 | `event_key` | string | Có | Mã định danh **loại** event, theo quy ước `nhóm.hành_động` (ví dụ: `license.activated`). Quyết định cách CRM diễn giải payload và ánh xạ trạng thái. |
| 3 | `occurred_at` | timestamp (UTC, ISO-8601) | Có | Thời điểm sự việc **thật sự xảy ra tại nguồn** — không phải thời điểm gửi tin đi. Là mốc để sắp xếp thứ tự các event. |
| 4 | `subscription_id` | string | Có | Mã subscription trong CRM mà event liên quan tới. Là khoá đối chiếu event về đúng đối tượng nghiệp vụ. |
| 5 | `product_id` | string | Có | Mã Product Module gửi hoặc nhận event (ví dụ: `CMC_EDR`). |
| 6 | `correlation_id` | UUID | Có với event outbound; với event inbound chỉ bắt buộc khi đó là phản hồi cho một lệnh của CRM | Mã liên kết một lệnh CRM gửi đi với phản hồi tương ứng của sản phẩm. Với một lệnh outbound, `correlation_id` chính bằng `event_id` của lệnh đó; sản phẩm phản hồi bằng cách đặt lại giá trị này vào event inbound. |
| 7 | `schema_version` | string | Có | Phiên bản cấu trúc của `payload`, cho phép nâng cấp định dạng payload theo thời gian mà vẫn giữ tương thích ngược. |
| — | `payload` | object | Có | Phần **nội dung nghiệp vụ** riêng của từng loại event; cấu trúc phụ thuộc `event_key` (chi tiết tại §3.2, §4.2, §4.3). *(Đây là lớp payload, liệt kê ở đây để thấy quan hệ với metadata.)* |

### 2.1 Ví dụ — event OUTBOUND *(CRM → sản phẩm)*

Lệnh Tạm dừng subscription. `payload` đi kèm metadata; các trường metadata nằm ở cấp ngoài cùng.

```
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

### 2.2 Ví dụ — event INBOUND *(sản phẩm → CRM)*

Sản phẩm báo **đã nhận yêu cầu và khởi tạo xong tenant** (chờ khởi tạo license), **phản hồi cho** lệnh `subscription.submitted` mà CRM gửi trước đó. Ở bước này **chưa có** `activation_date` / `expiration_date` — hai mốc này chỉ có khi license kích hoạt thành công (event `license.activated`, §3.2 `EVT-IN-03`).

```
{
  "event_id": "3d5f8a1b-9e2c-4f76-8a0d-6b7c8d9e0f1a",
  "event_key": "license.pending",
  "occurred_at": "2026-07-14T04:05:10.000Z",
  "subscription_id": "SUB-2026-021",
  "product_id": "CMC_EDR",
  "correlation_id": "1a2b3c4d-0000-0000-0000-000000000000",
  "schema_version": "1.0",
  "payload": {
    "external_ref": "TENANT-EDR-8842"
  }
}
```

> **Chữ ký HMAC** không nằm trong thân tin — nó ở **HTTP header** (`X-Signature: sha256=...`), ký trên toàn bộ body. Xem §5.3.
>
> **`payload` khác nhau theo từng `event_key`** — chi tiết payload của từng loại: §4.2/4.3 (outbound), §3.2 (inbound). Bộ trường **metadata** (7 trường trên) thì **giống nhau ở mọi event, mọi sản phẩm**.

---

## 3. Event INBOUND — Sản phẩm → CRM (chi tiết: CMC EDR)

> **Toàn bộ §3 là mô hình ĐỀ XUẤT của BA, CHƯA xác nhận với đội EDR** — sẽ chốt trong buổi làm việc (xem OQ-INT-01/08/10, §6).

### 3.1 Vòng đời license của EDR — mô hình đề xuất

Dòng trạng thái tự nhiên của license EDR khi khách **không gia hạn**: sau khi hết hạn, license đi lần lượt qua **EXPIRED** (còn dùng đủ tính năng — giai đoạn ân hạn) → **GRACE_EXPIRED** (hạn chế tính năng) → **SUSPENDED** (ngừng hẳn), **không** "chết ngay". Suốt các giai đoạn này `sub.status` **giữ nguyên ACTIVE**, chỉ `license_mirror.status` phản ánh mức suy giảm:

```
  (start)
     │  License được gán cho tenant, chưa active
     ▼
  PENDING ──► PROVISIONING ──► ACTIVE
                                 │  (nếu KHÔNG gia hạn — vòng đời tự nhiên)
                                 │  trước hết hạn 60 ngày
                                 ▼
                          EXPIRING_SOON    (Sắp hết hạn — vẫn dùng bình thường)
                                 │  hết hạn (cập nhật ngay)
                                 ▼
                          EXPIRED          (Trong ân hạn — vẫn dùng ĐỦ tính năng)
                                 │  sau 30 ngày
                                 ▼
                          GRACE_EXPIRED    (Hạn chế tính năng)
                                 │  sau 30 ngày
                                 ▼
                          SUSPENDED        (Ngừng dịch vụ)
                                 │  gia hạn
                                 ▼
                          RENEWED ──► (end)

  • sub.status = ACTIVE từ khi kích hoạt, giữ nguyên qua EXPIRING_SOON / EXPIRED /
    GRACE_EXPIRED; chỉ chuyển SUSPENDED khi license SUSPENDED.
  • Gia hạn license được ở BẤT KỲ trạng thái nào (không ràng buộc trạng thái
    tenant): EDR tạo một license mới bắt đầu ở ACTIVE, đánh dấu license cũ là RENEWED.
  • Ngoài vòng đời tự nhiên trên, CRM có thể chủ động ra lệnh Tạm dừng / Khôi
    phục bất kỳ lúc nào. EDR thực thi ở cấp TENANT (Suspend Tenant / Reactivate
    Tenant), rồi báo về bằng event trạng thái license → mirror license phía CRM
    chuyển ACTIVE → SUSPENDED (Tạm dừng) hoặc SUSPENDED → ACTIVE (Khôi phục).
    Đây là luồng do lệnh, tách khỏi vòng đời tự nhiên — chi tiết ở §3.3.
```

> **Điểm cốt lõi của mô hình đề xuất:**
>
> - **`license.expired` → mirror `EXPIRED`** — hết hạn nhưng **còn dùng đủ tính năng** (giai đoạn ân hạn).  
>   Hiển thị "Trong ân hạn", `sub` giữ **ACTIVE**. *(Ví dụ chuẩn NT-5: trạng thái raw `EXPIRED` ≠ chữ khách đọc "Trong ân hạn".)*
> - **`license.grace_expired` → mirror `GRACE_EXPIRED`** — sau ân hạn 30 ngày, khách **bị hạn chế tính năng** (30 ngày).  
>   `sub` **vẫn giữ ACTIVE**, chỉ mirror phản ánh mức hạn chế.
> - **`license.suspended` → mirror `SUSPENDED`** — ngừng dịch vụ, không dùng được tính năng nào.  
>   `sub` → **SUSPENDED**.
> - **`license.expiring_soon` → mirror `EXPIRING_SOON`** — trước hết hạn 60 ngày, cảnh báo sớm.  
>   Khách vẫn dùng bình thường, `sub` giữ **ACTIVE**.
> - **Gia hạn license** — thực hiện được ở bất kỳ trạng thái nào.  
>   EDR tạo một license mới bắt đầu ở `ACTIVE`, đồng thời đánh dấu license cũ là `RENEWED` để bàn giao cho bản kế tiếp.

### 3.2 Bảng event inbound — EDR

| ID | `event_key` | Nghĩa thật với khách hàng | CRM đặt `license_mirror.status` | Tên hiển thị | Tác động lên subscription |
| --- | --- | --- | --- | --- | --- |
| EVT-IN-01 | `license.pending` | EDR đã nhận yêu cầu, khởi tạo xong Tenant | `PENDING` | Chờ khởi tạo | — |
| EVT-IN-02 | `license.provisioning` | Khách **đã dùng được đầy đủ tính năng**; chỉ còn một số cấu hình chưa khớp vận hành nên vài dữ liệu chưa hợp lý | `PROVISIONING` | Đang triển khai | — |
| EVT-IN-03 | `license.activated` | **Kích hoạt chính thức** — cấu hình đã khớp vận hành, dữ liệu chuẩn; bắt đầu tính thời gian sử dụng | `ACTIVE` | Đang hoạt động | `sub.activation_date`, `sub.end_date` ← `expiration_date` của license; `sub.status = ACTIVE` |
| EVT-IN-04 | `license.expiring_soon` | Sắp hết hạn | `EXPIRING_SOON` | Sắp hết hạn | `sub` giữ **ACTIVE**. CRM **ưu tiên** nhận qua event này (đúng NT-2, không tự suy diễn). **Fallback đã chốt:** nếu chưa nhận được event mà vẫn còn cách hạn trong khoảng `renewal_notice_days`, License Mirror & Usage **tạm giữ** cách tự tính hiện tại — không mất tính năng nhắc gia hạn cho tới khi EDR triển khai event này (ngoài phạm vi Integration Layer, cần cập nhật ở FRS License Mirror & Usage) |
| EVT-IN-05 | `license.expired` | **Hết hạn nhưng vào ân hạn.** Khách **vẫn dùng đủ tính năng**. | `EXPIRED` | **Trong ân hạn** | `sub` giữ **ACTIVE**. → mở ra **cơ hội bán "Gia hạn gấp"** |
| EVT-IN-06 | `license.grace_expired` | **Hết ân hạn** → khách chuyển sang **dùng hạn chế tính năng, trong 30 ngày** | `GRACE_EXPIRED` | **Hạn chế tính năng** | `sub` giữ **ACTIVE** *(sub chưa chết; mirror `GRACE_EXPIRED` thể hiện mức hạn chế)*. → tạo **cơ hội gia hạn KHẨN**, ưu tiên xếp trên cả "Gia hạn gấp" |
| EVT-IN-07 | `license.suspended` | **Ngừng hoàn toàn — khách không dùng được bất kỳ tính năng nào.** Hai nguồn phân biệt bằng `correlation_id` (xem §3.3). | `SUSPENDED` | Đã ngừng | `sub.status = SUSPENDED`. *CÓ* `correlation_id` → do CRM ra lệnh **Tạm dừng** (UC-SUB-09). *KHÔNG* có → **tự nhiên** (khách hết ân hạn, không gia hạn). |
| EVT-IN-08 | `license.reactivated` | **EDR đã khôi phục dịch vụ theo lệnh CRM** | `ACTIVE` | Đang hoạt động | `sub.status = ACTIVE`. **Luôn CÓ** `correlation_id` — phản hồi lệnh **Khôi phục** (UC-SUB-10). Khôi phục chỉ xảy ra do lệnh, không có đường tự nhiên. |
| EVT-IN-09 | `license.renewed` | Bản ghi license cũ được đánh dấu đã gia hạn | `RENEWED` | Đã gia hạn | Sub cũ → `RENEWED` (bàn giao cho bản kế tiếp) |
| EVT-IN-10 | `license.usage_synced` | Báo mức sử dụng định kỳ | *(không đổi)* | — | Cập nhật `used_seats` + `last_synced_at`. **Chu kỳ: 3 giờ** |
| EVT-IN-11 | `subscription.command_failed` | Sản phẩm báo **KHÔNG thực thi được một lệnh của CRM** (vd Tạm dừng / Khôi phục thất bại) — bắt buộc theo NT-4 | — *(không đổi status)* | — | Đánh dấu lệnh trong outbox là **"Sản phẩm từ chối"** và đưa vào hàng đợi xử lý. **Chi tiết trường dữ liệu + ranh giới lỗi: xem §3.5** |

> **Lưu ý:** `sub.status` chỉ đi thẳng `ACTIVE → SUSPENDED` — ở cấp **sub** **không** có trạng thái `EXPIRED`/`GRACE_EXPIRED` (các giai đoạn ân hạn/hạn chế đều để `sub` ACTIVE; mức suy giảm chỉ phản ánh qua `license_mirror.status`).
>
> 🔴 **A — `license_mirror.status` là chuỗi raw, KHÔNG phải `ENUM`:** giá trị ở cột này là **mã trạng thái thô do EDR khai báo** (đúng schema PRD §5.3.8: *"string — Raw từ product"*), nên đây là vocabulary **riêng của EDR** — sản phẩm khác có thể dùng tập khác (cơ chế khai báo: NT-5).
>
> **Hệ quả thiết kế License Mirror & Usage:** **không** tạo `ENUM`/`CHECK constraint` cố định cho cột này; mọi logic đọc trạng thái xuyên sản phẩm phải tra theo `license_status_set` của đúng Product Module, không hardcode tên trạng thái EDR.

### 3.3 Xác nhận lệnh Tạm dừng/Khôi phục — event `license.*` mang `correlation_id` (command-ack) *(đề xuất)*

EDR thực thi Tạm dừng/Khôi phục bên trong ở **cấp Tenant**, nhưng **event xác nhận gửi về CRM đặt tên `license.suspended` / `license.reactivated`** và **echo `correlation_id`** của lệnh CRM đã gửi. Vì vậy CRM cập nhật `license_mirror.status` từ chính event **trạng thái license** (đúng NT-2 — không đọc event hạ tầng tenant), còn `correlation_id` cho biết thay đổi này **do CRM ra lệnh** hay **tự nhiên**.

| Event EDR gửi về | Là phản hồi cho lệnh | `correlation_id` | CRM đặt mirror | Nguyên nhân ghi lại |
| --- | --- | --- | --- | --- |
| `license.suspended` | `subscription.suspended` (UC-SUB-09) | **có** | `SUSPENDED` | Do CRM ra lệnh **Tạm dừng** — `last_change_source = command_ack` |
| `license.reactivated` | `subscription.reactivated` (UC-SUB-10) | **có** | `ACTIVE` | Do CRM ra lệnh **Khôi phục** — `last_change_source = command_ack` |
| `license.suspended` | *(không phải phản hồi lệnh nào)* | **không** | `SUSPENDED` | **Tự nhiên** — khách hết ân hạn, không gia hạn — `last_change_source = product_event` |

**Vai trò của `correlation_id`** *(nên nó nằm trong metadata bắt buộc, §2)*:

- `license.suspended` **có** `correlation_id` khớp lệnh CRM → **xác nhận lệnh Tạm dừng đã có hiệu lực** → mirror SUSPENDED + ghi audit *"lệnh Tạm dừng có hiệu lực lúc {occurred_at}"*; lưu `last_change_source = "command_ack"` + `source_command_event_id`.
- `license.suspended` **không** có `correlation_id` → đường **tự nhiên** (khách không gia hạn, hết 30 ngày hạn chế) → mirror SUSPENDED; lưu `last_change_source = "product_event"`. **Đây là hợp lệ, KHÔNG phải bất thường.**
- `license.reactivated` **luôn** phải có `correlation_id` (Khôi phục chỉ xảy ra do lệnh CRM) → nếu về mà **không khớp** lệnh nào → ghi nhận + **cảnh báo** *(EDR khôi phục dịch vụ mà CRM không yêu cầu — bất thường)*.

### 3.4 Payload từng event inbound

Mọi event đều có bộ **metadata 7 trường (§2)** bọc ngoài. Bảng dưới liệt kê phần **payload** riêng của từng event inbound và **hướng dẫn cách điền** từng trường. *(Toàn bộ §3 là mô hình đề xuất — xem banner đầu §3; trường nào EDR có cách khác sẽ điều chỉnh khi chốt.)*

| Event | Payload (ngoài metadata §2) | Mô tả — cách điền từng trường |
| --- | --- | --- |
| `license.pending` | `external_ref` | `external_ref`: mã định danh tenant EDR vừa khởi tạo — để CRM đối chiếu về đúng đối tượng bên sản phẩm. |
| `license.provisioning` | `external_ref` | `external_ref`: mã tenant đang triển khai (như trên). |
| `license.activated` | `external_ref`, `activation_date`, `expiration_date`, `usage_snapshot` | `activation_date`: ngày kích hoạt chính thức (bắt đầu tính hạn). `expiration_date`: ngày hết hạn → CRM gán vào `sub.end_date`. `usage_snapshot`: `{ used_seats, total_seats }` tại thời điểm kích hoạt. |
| `license.expiring_soon` | `expiration_date` | `expiration_date`: ngày sẽ hết hạn — để CRM tính số ngày còn lại và nhắc gia hạn. |
| `license.expired` | `expiration_date` | `expiration_date`: ngày đã hết hạn (đầu giai đoạn ân hạn) — để CRM tính mức khẩn nhắc gia hạn. |
| `license.grace_expired` | *(chỉ metadata)* | Không có trường payload riêng — mốc vào giai đoạn hạn chế lấy từ `occurred_at` (metadata §2). |
| `license.suspended` | `reason` *(tùy chọn)* | `reason`: lý do ngừng (để hiển thị/audit), nếu sản phẩm gửi kèm. **Thời điểm ngừng có hiệu lực = `occurred_at` (metadata §2)** — không cần trường riêng. |
| `license.reactivated` | *(chỉ metadata)* | Không có trường payload riêng — thời điểm khôi phục có hiệu lực lấy từ `occurred_at` (metadata §2). |
| `license.renewed` | `external_ref` *(bản mới)* | Tham chiếu tới license/subscription kế tiếp — để CRM nối chuỗi gia hạn (bản cũ → bản mới). |
| `license.usage_synced` | `usage_snapshot` | `usage_snapshot`: `{ used_seats, total_seats }` hiện tại → CRM cập nhật `used_seats` + `last_synced_at`. |
| `subscription.command_failed` | `original_event_key`, `reason_code`, `reason`, `attempts`, `failed_at` | Ý nghĩa từng trường: xem bảng chi tiết ở §3.5. |

> **Lưu ý về `correlation_id`:** đây là trường **metadata (§2)**, không phải payload. Nó bắt buộc với các event **phản hồi lệnh CRM** (`license.suspended` / `license.reactivated` — §3.3; `subscription.command_failed` — §3.5); các event **tự nhiên** (`expired`, `grace_expired`, `usage_synced`…) không mang `correlation_id`.

### 3.5 `subscription.command_failed` — sản phẩm báo "tôi không làm được lệnh của anh"

**Chiều: sản phẩm → CRM (inbound).** Bắt buộc theo NT-4. Đây là phản hồi báo **thất bại** cho một lệnh outbound (§4) mà sản phẩm không thực thi được.

| Trường | Ý nghĩa |
| --- | --- |
| `original_event_key` | Lệnh nào của CRM bị fail (`subscription.suspended`…) |
| `correlation_id` | Nối về đúng lệnh gốc trong outbox |
| `reason_code` | Mã lỗi máy đọc được. Bộ mã đã biết từ EDR: `TENANT_CODE_EXISTS` (tenant_code trùng), `ACCOUNT_OWNER_EXISTS` (username/email chủ tài khoản trùng), `INVALID_PACKAGE`, `TENANT_NOT_FOUND`, `ACCESS_DENIED` (không đủ quyền), `SYSTEM_ERROR` (lỗi hệ thống nội bộ EDR)… |
| `reason` | Câu tiếng Việt cho người vận hành đọc |
| `attempts` | Sản phẩm đã tự thử mấy lần trước khi bỏ cuộc |
| `failed_at` | Thời điểm sản phẩm kết luận thất bại |

**Ranh giới trách nhiệm** *(trả lời câu hỏi của BA ngày 14/07)*:

| Loại lỗi | Ví dụ | Ai xử lý |
| --- | --- | --- |
| **Tạm thời** | Timeout · DB nghẽn · service nội bộ chưa sẵn sàng | **Sản phẩm tự thử lại, có giới hạn số lần** *(đề xuất: 5 lần / 30 phút)*. CRM không cần biết — lỗi tự khỏi; nếu báo về chỉ tạo báo động giả rồi tự tắt |
| **Vĩnh viễn** | Tenant không tồn tại · gói không hợp lệ · sai cấu hình · vượt hạn mức | **Bắt buộc gửi `subscription.command_failed`** |
| **Hết trần retry** | Thử 5 lần vẫn timeout | **Coi là vĩnh viễn** → gửi `command_failed`. *Không có trần thì lỗi tạm thời hoá thành im lặng vĩnh viễn, và CRM lại phải đoán mò* |

**CRM làm gì khi nhận:** đánh dấu lệnh trong outbox là **"Sản phẩm từ chối"** *(khác "chưa tới nơi")* · hiện lý do thật ở màn Sự kiện gửi đi · đưa vào hàng đợi License Mirror & Usage. Nhờ vậy Integration Layer nói được *"CMC EDR **từ chối** lệnh Tạm dừng: tenant không tồn tại"* thay vì *"nghi ngờ sản phẩm không thực thi lệnh"*.

---

## 4. Event OUTBOUND — CRM → Sản phẩm

### 4.1 Danh sách *(6 event — tài liệu cũ thiếu EVT-OUT-06)*

| ID | Nghiệp vụ | `event_key` | Kích hoạt bởi | EDR làm gì | EDR gửi lại |
| --- | --- | --- | --- | --- | --- |
| EVT-OUT-01 | Xác nhận subscription | `subscription.submitted` | UC-SUB-05 | Create Tenant → Tenant License → Tenant Admin → Org (nếu SINGLE_ORG) → Org License → Org Admin | `license.pending` |
| EVT-OUT-02 | Tạm dừng | `subscription.suspended` | UC-SUB-09 | **Suspend Tenant** (cấp tenant) | `license.suspended` *(CÓ correlation_id)* → mirror = SUSPENDED, §3.3 |
| EVT-OUT-03 | Khôi phục | `subscription.reactivated` | UC-SUB-10 | **Reactivate Tenant** (cấp tenant) | `license.reactivated` *(CÓ correlation_id)* → mirror = ACTIVE, §3.3 |
| EVT-OUT-04 | Thu hồi | `subscription.terminated` | UC-SUB-08 | *(EDR chưa có cơ chế revoke license)* | — *(EDR không phát event xác nhận — luồng Thu hồi cần chốt với EDR)* |
| EVT-OUT-05 | Gia hạn | `subscription.renewed` | UC-SUB-07 | Tạo Tenant/Org License mới; đánh dấu bản cũ Renewed | `license.renewed` *(bản cũ)* + `license.activated` *(bản mới)* |
| EVT-OUT-06 | **Yêu cầu cập nhật mức dùng** | `usage.force_sync_requested` | UC-LIC-03 | Gửi lại số liệu mức sử dụng | `license.usage_synced` |

> **EVT-OUT-06 bị thiếu trong tài liệu cũ** dù PRD FR-LIC-04 BR-04.2 đã yêu cầu và demo đã hiển thị.

### 4.2 Payload từng event outbound

Mọi lệnh đều có bộ **metadata 7 trường (§2)** bọc ngoài. Bảng dưới liệt kê phần **payload** riêng của từng lệnh outbound và hướng dẫn cách điền từng trường.

| `event_key` | Payload (ngoài metadata §2) | Mô tả — cách điền từng trường |
| --- | --- | --- |
| `subscription.submitted` | Bộ trường tạo tenant — **xem chi tiết §4.2.1** | EDR cần đủ thông tin để tạo tenant + license + tài khoản kích hoạt. Danh sách trường cụ thể (theo form *Create Tenant* của EDR) ở bảng §4.2.1. |
| `subscription.renewed` | cùng schema `subscription.submitted` | Cùng bộ trường như submitted — EDR tạo license mới cho kỳ kế tiếp. |
| `subscription.suspended` | `reason`, `effective_at` | `reason`: lấy từ `subscription.suspend_reason` (đã có từ v2.4). `effective_at`: thời điểm lệnh có hiệu lực. |
| `subscription.reactivated` | `effective_at` | `effective_at`: thời điểm khôi phục có hiệu lực. |
| `subscription.terminated` | `reason`, `effective_at` | `reason`: lý do thu hồi. `effective_at`: thời điểm có hiệu lực. |
| `usage.force_sync_requested` | *(chỉ metadata)* | Không có trường payload riêng — chỉ yêu cầu sản phẩm gửi lại usage (phản hồi bằng `license.usage_synced`). |

### 4.2.1 Payload chi tiết — `subscription.submitted` (tạo tenant)

Danh sách trường theo đúng yêu cầu tạo tenant của EDR (đối chiếu form *Create Tenant*). `tenant_code` do EDR tự sinh; các trường còn lại CRM gửi thẳng — **kể cả product/add-on theo đúng key kỹ thuật của EDR**. Các key kỹ thuật này được **khai báo trong cấu hình gói (M-04) của Product Module EDR** (đúng tinh thần NT-5), **không hardcode trong lõi CRM** — nên vẫn giữ vai trò passive-observer, đồng thời bỏ được khâu EDR map lại.

| Trường | Bắt buộc | Nguồn (bảng CRM) | Mô tả |
| --- | --- | --- | --- |
| `structure_mode` | Có | **Subscription** · `scope.tenant_mode` | Giá trị `MULTI` / `SINGLE` (UC-SUB-02, mục "Cấu hình sản phẩm" per-sub). |
| `tenant_name` | Có | **Customer** | EDR tự sinh `tenant_code` từ đây rồi trả về qua `external_ref` — CRM KHÔNG gửi tenant_code. |
| `contract_phone_number` | — | **Customer / Contract** *(cần chốt field)* | SĐT liên hệ hợp đồng. |
| `contract_email` | — | **Customer / Contract** *(cần chốt field)* | Email liên hệ hợp đồng. |
| `product` | Có | **Package** · `product_id` | Key kỹ thuật EDR: `EDR` / `EPP` / `EPR` — khai trong cấu hình gói M-04. |
| `package_code` | Có | **Package** · `code` | Mã gói CRM — để truy vết/đối soát commercial. |
| `features[]` | — | **Package** · `features[]` | Add-on theo key kỹ thuật EDR (vd `vulnerability-detection`…); đã ràng buộc theo `featureCatalog` của EDR (UC-CAT BR-01.5). CRM gửi trực tiếp, không hardcode ở lõi. |
| `seat_count` | Có | **Subscription** · `license_qty` | Số ghế. |
| `subscription_plan` | Có | **Package** · `duration_months` | 🔴 **Lệch enum**: CRM đang {12, 24, 36} = 1/2/3 năm; EDR cần 1/3/5 năm — xem ghi chú dưới. |
| `activation.full_name` | Có | **Subscription** *— sẽ bổ sung* | Họ tên chủ tài khoản kích hoạt. |
| `activation.username` | Có | **Subscription** *— sẽ bổ sung* | Tên đăng nhập — duy nhất, không dấu cách (trùng → EDR báo `ACCOUNT_OWNER_EXISTS`). |
| `activation.email` | Có | **Subscription** *— sẽ bổ sung* | Email chủ tài khoản — duy nhất. |

> 🔴 **Hai điểm CRM cần xử lý (đã đối chiếu PRD/FRS):**
>
> - **Kỳ hạn lệch enum:** CRM dùng `duration_months` ∈ {12, 24, 36} = **1/2/3 năm** (UC-CAT BR-01.3), còn EDR chỉ nhận **1/3/5 năm** → CRM thiếu 5 năm, thừa 2 năm. Cần chốt: EDR mở thêm giá trị, hay CRM đổi enum kỳ hạn cho gói EDR.
> - **Tài khoản kích hoạt chưa được thu thập:** UC-SUB-02 (tạo subscription) hiện chưa capture `full_name` / `username` / `email`. Ba trường này **định nghĩa trước ở đây**, sẽ **bổ sung mục "Tài khoản kích hoạt" vào subscription** (UC-SUB-02/05) sau.

---

## 5. Quy tắc xử lý bắt buộc (mọi sản phẩm)

### 5.1 Chống xử lý trùng (idempotent)

**Quy tắc:** mỗi event chỉ được áp dụng **đúng một lần**, nhận diện bằng `event_id`. Event đã xử lý rồi thì bỏ qua, không áp dụng lần hai.

**Vì sao:** cơ chế giao nhận là *at-least-once* (ít nhất một lần) — một event chắc chắn sẽ có lúc bị gửi lặp (retry sau timeout, hoặc broker gửi lại). Không chống trùng thì một event đổi trạng thái/trừ pool có thể bị áp hai lần.

### 5.2 🔴 Chống event đến sai thứ tự

```
license.suspended  — xảy ra 10:00, gửi lỗi → retry lúc 10:05
license.activated  — xảy ra 10:02, tới ngay lúc 10:02

CRM xử lý theo thứ tự NHẬN ĐƯỢC:
   10:02  → ACTIVE
   10:05  → SUSPENDED   (nhưng thực ra là chuyện của 10:00)

Kết quả: license SAI trạng thái, và sai vĩnh viễn.
```

**Quy tắc:** chỉ áp dụng event khi `occurred_at` của nó **mới hơn** `license_mirror.last_event_occurred_at`. Event cũ hơn → **ghi nhận nhưng KHÔNG áp dụng**, đánh dấu "đến muộn".

**Kéo theo:** cần thêm cột `license_mirror.last_event_occurred_at`. Đây cũng là nền của **replay theo chuỗi** — xử lý lại phải chạy tuần tự theo `occurred_at`, không xử lý lẻ tin cũ.

> 🔴 **B — Phạm vi watermark:** quy tắc trên **chỉ áp dụng cho event làm ĐỔI `license_mirror.status`** — tức tất cả, trừ `usage_synced` (`EVT-IN-10`) và `command_failed` (`EVT-IN-11`).
>
> `license.usage_synced` chạy mỗi 3 giờ (tần suất cao) và **không đổi status**. Nếu cho nó tính chung vào watermark, nó sẽ liên tục đẩy mốc thời gian lên và **loại nhầm** event trạng thái đến muộn (hiếm nhưng quan trọng):
>
> ```
> 10:00  usage_synced (occurred_at=10:00)  → đẩy watermark chung = 10:00
> 09:58  license.suspended tới muộn lúc 10:01
>        → 09:58 < 10:00 → BỊ LOẠI OAN → mirror KHÔNG chuyển SUSPENDED (sai vĩnh viễn)
> ```
>
> **Giải pháp:** `usage_synced` dùng mốc riêng `license_mirror.last_synced_at`, không đụng tới `last_event_occurred_at`. Watermark `last_event_occurred_at` chỉ được cập nhật bởi event **đổi status**.

### 5.3 Xác thực nguồn gửi (HMAC)

**Quy tắc:** mỗi webhook phải ký **HMAC-SHA256** bằng `runtime_config.webhook_secret`. Chữ ký sai → trả **4xx, từ chối ngay** và **KHÔNG ghi** vào `WEBHOOK_INBOX` (chỉ log ở hạ tầng, rate-limited + source IP, cho đội bảo mật).

**Vì sao không lưu tin sai chữ ký:** tránh kẻ lạ đổ rác vào inbox (DoS), và giữ cho mọi dòng trong inbox đều đã xác thực. Nếu sản phẩm cấu hình sai khoá → không tin nào hợp lệ → kênh "im lặng" (được cơ chế cảnh báo im lặng bắt). Điều tra tấn công giả mạo thuộc an ninh hạ tầng, không phải dashboard CRM.

**Đổi khoá — ràng buộc bắt buộc:** *đổi khoá KHÔNG được làm mất dữ liệu webhook hợp lệ.* Nếu đổi "cứng" (chỉ nhận khoá mới ngay lập tức), mọi tin gửi trong lúc EDR chưa kịp cập nhật khoá sẽ bị coi là "chữ ký sai" và không xử lý lại được → mất dữ liệu thật. PRD §5.3.7 đã có sẵn `secret_rotation_state` (ân hạn 7 ngày); cách phổ biến là chấp nhận **song song cả khoá cũ lẫn mới** trong thời gian ân hạn (dual-secret rotation). Cơ chế cụ thể để Dev quyết.

### 5.4 Không chặn đường trả lời

**Quy tắc:** CRM trả **200 OK ngay** khi nhận webhook, rồi xử lý bất đồng bộ (không bắt sản phẩm chờ). Vòng đời xử lý một tin: `RECEIVED → PROCESSED`, hoặc khi lỗi `FAILED_RETRYING → FAILED` (tối đa 5 lần thử).

### 5.5 Vòng đời dữ liệu

**Khối lượng:** `license.usage_synced` mỗi 3 giờ × N sub = 8 tin/sub/ngày. Với 500 sub → ~4.000 tin/ngày, ~1,5 triệu/năm. Ba nơi xử lý khác nhau:

- **Hàng đợi (Message Queue):** tin chỉ tồn tại tới khi xử lý **thành công** — cơ chế hàng đợi thông thường, không phải việc CRM lưu trữ.
- **Cơ sở dữ liệu (`WEBHOOK_INBOX`):** giai đoạn này **KHÔNG purge tự động** — mọi tin (kể cả `usage_synced` đã xử lý xong) giữ nguyên trong DB. Backup/lưu trữ dài hạn để phân tích sau.
- **Giao diện** (tab Tích hợp): thay vì ẩn mặc định `usage_synced` thành công, dùng **bộ lọc mặc định theo thời gian** (vd 3 ngày gần nhất) để màn không bị 4.000 tin/ngày làm ngợp; người dùng tự nới khoảng khi cần tra cứu xa hơn.

---

## 6. Open Questions

> Đối chiếu với `docs/plans/M-07_event_catalog_questions.md`. **Toàn bộ Open Question dưới đây đang ở trạng thái CHƯA chốt.** (Một số nội dung ở §3 đã được sửa theo thiết kế đúng, nhưng chưa xem là đã chốt.)

| Mã | Nội dung | Mức |
| --- | --- | --- |
| **OQ-INT-01** | **CHƯA chốt:** đề xuất Tạm dừng/Khôi phục xác nhận qua `license.suspended` / `license.reactivated` mang `correlation_id` (§3.3) — bỏ `tenant.*`. | 🔴 Cần chốt với EDR |
| **OQ-INT-04** | **CHƯA chốt:** đề xuất metadata 7 trường (§2) là chuẩn bắt buộc — cần thống nhất với sản phẩm. | 🔴 Cần chốt với EDR |
| **OQ-INT-05** | **CHƯA chốt:** đề xuất chặn event đến muộn theo `occurred_at` + cột `license_mirror.last_event_occurred_at` (§5.2). | 🔴 Cần chốt với EDR |
