# Phụ lục A — Danh mục event tích hợp (Event Catalog)

> Module: M-07 Integration Layer | Phiên bản: 2.0 | Ngày: 27/07/2026 *(v1.0: 14/07/2026)*
> Áp dụng 2 điểm sửa Critical (**A**, **B**) từ [Review kiến trúc — Event Catalog](_event_catalog_review.md); mọi nội dung khác giữ nguyên như v1.0.
> **Đây là hợp đồng kỹ thuật giữa OneCRM và mọi Product Module.** Mục đích, phạm vi và đối tượng đọc: xem §0.

---

## 0. Mục đích tài liệu & đối tượng đọc

### Tài liệu này dùng để làm gì

Đây là **danh mục event tích hợp (Event Catalog)** — bản khai báo **nội dung** của mọi event trao đổi giữa OneCRM và Product Module CMC EDR. Nó là **nguồn sự thật duy nhất** trả lời 3 câu hỏi:

1. **Có những event nào?** — Sản phẩm gửi những event nào về CRM (inbound, §3), và CRM gửi những event nào sang sản phẩm (outbound, §4).
2. **Mỗi event chứa những thông tin gì?** — Mọi event đều có **2 lớp**: (a) **metadata chung** — 7 trường bắt buộc (`event_id`, `event_key`, `occurred_at`, `subscription_id`, `product_id`, `correlation_id`, `schema_version`) **giống hệt nhau ở mọi event, mọi sản phẩm**, dùng để chống trùng, chống sai thứ tự và truy vết (§2); (b) **payload** — phần nội dung **riêng theo từng loại event** (vd `activation_date`, `usage_snapshot`…), được khai báo chi tiết ở §3/§4.
3. **Nhận được event rồi CRM xử lý thế nào?** — Ánh xạ event → `license_mirror.status` + tác động lên subscription (§3.2); quy tắc xử lý bắt buộc: chống trùng, chống sai thứ tự, xác thực nguồn (§5).

> **Phân vai với FRS khác:** [UC-INT-01](UC-INT-01_publish_outbound_event.md)/[UC-INT-02](UC-INT-02_receive_inbound_event.md) đặc tả *cơ chế* (làm sao publish/nhận, retry, outbox/inbox); tài liệu này khai báo *nội dung* (gửi/nhận **cái gì**, mang **trường nào**, nghĩa **là gì**). Đây là **mô tả kỹ thuật** hai bên phải cùng tuân thủ — không phải mô tả một chức năng có giao diện.

Tài liệu **thay thế** `docs/prd/inbound_outbound_concept.md` v1.0 (bản cũ có lỗ hổng làm hỏng M-05).

### Ai đọc, để làm gì

| Đối tượng | Đọc để làm gì |
|---|---|
| **Dev M-07 (Integration Layer)** | Nguồn chuẩn để build outbox publisher + webhook receiver: metadata (§2), danh sách event key (§3/§4), quy tắc idempotent / chống sai thứ tự / HMAC (§5) |
| **Đội sản phẩm EDR** | Biết CRM **gửi lệnh gì** và **mong nhận phản hồi gì**, đúng format nào — để hai bên **thống nhất hợp đồng event** trước khi tích hợp |
| **Dev / BA M-05 (License Mirror & Usage)** | Bảng ánh xạ event → `license_mirror.status` (§3.2) **trực tiếp** quyết định trạng thái M-05 hiển thị |
| **QA** | Cơ sở viết test: idempotency (§5.1), chống event đến muộn (§5.2), mapping trạng thái đúng (§3.2), lệnh thất bại (§4.4) |
| **BA / PO** | Theo dõi Open Questions (§6), phê duyệt thay đổi nghiệp vụ (GRACE / REVOKED — §3) |

---

## 1. Thuật ngữ & Chữ viết tắt

> Mục này giải nghĩa các thuật ngữ và chữ viết tắt được dùng xuyên suốt tài liệu. Đọc trước khi đi vào các bảng đặc tả event ở §2 trở đi.

### 1.1 Thuật ngữ

| Thuật ngữ | Giải nghĩa |
|---|---|
| **Event (sự kiện)** | Một thông điệp mô tả *một việc đã xảy ra* (ví dụ: license đã được kích hoạt) hoặc *một lệnh cần thực hiện* (ví dụ: tạm dừng subscription), được trao đổi giữa OneCRM và Product Module. Mỗi event gồm phần **metadata** và phần **payload**. |
| **Inbound** | Chiều truyền tin **từ sản phẩm về CRM**. Product Module gửi event báo cho CRM biết trạng thái hoặc kết quả xử lý (đặc tả tại §3). |
| **Outbound** | Chiều truyền tin **từ CRM sang sản phẩm**. OneCRM gửi lệnh yêu cầu Product Module thực hiện một nghiệp vụ (đặc tả tại §4). |
| **`event_key`** | Mã định danh **loại** event, theo quy ước `nhóm.hành_động` (ví dụ: `license.activated`, `subscription.suspended`). Đây là trường quyết định cách CRM diễn giải và xử lý event. |
| **Metadata (dùng chung)** | Bộ 7 trường bắt buộc **bọc ngoài** mọi event và **giống hệt nhau** ở mọi loại event, mọi sản phẩm (đặc tả tại §2). Metadata phục vụ việc định danh, định tuyến, chống trùng và truy vết — bản thân nó **không chứa** nội dung nghiệp vụ. |
| **Payload** | Phần **nội dung nghiệp vụ** riêng của từng loại event (ví dụ: ngày kích hoạt, số ghế đã dùng). Cấu trúc của payload thay đổi tùy theo `event_key`. |
| **`correlation_id`** | Mã dùng để **nối một lệnh outbound của CRM với phản hồi inbound của sản phẩm**, nhờ đó biết được một event đến là phản hồi cho lệnh nào (xem §2 và §3.3). |
| **Idempotent (chống xử lý trùng)** | Tính chất đảm bảo cùng một event dù nhận về nhiều lần cũng chỉ được áp dụng **đúng một lần**, dựa trên `event_id` (xem §5.1). |
| **Webhook** | Cơ chế trong đó sản phẩm chủ động gọi HTTP tới một endpoint của CRM để đẩy event inbound về. |
| **Outbox** | Bảng hàng chờ lưu các event outbound đã được ghi *cùng giao dịch với thay đổi nghiệp vụ* nhưng chưa gửi đi, giúp worker gửi lại và bảo đảm không mất lệnh (xem UC-INT-01). |
| **Inbox (`WEBHOOK_INBOX`)** | Bảng lưu mọi event inbound đã nhận, phục vụ chống trùng, xử lý lại (replay) và truy vết (xem UC-INT-05). |
| **Replay** | Việc xử lý lại các event inbound đã lưu, theo đúng thứ tự thời gian `occurred_at` (xem §5.2 và UC-INT-05). |
| **HMAC-SHA256** | Thuật toán ký và xác thực chữ ký số trên nội dung webhook, giúp CRM xác minh event thật sự đến từ một sản phẩm hợp lệ (xem §5.3). |
| **`license_mirror` (Mirror)** | Bản sao **chỉ-đọc** tại CRM, phản ánh lại trạng thái và mức sử dụng của license thật bên sản phẩm. CRM không sở hữu license mà chỉ soi chiếu lại (thuộc module M-05). |
| **Tenant** | Đơn vị quản lý khách hàng bên trong sản phẩm EDR (mỗi khách hàng tương ứng một tenant). EDR thực thi các hành động Tạm dừng/Khôi phục ở cấp tenant (xem §3.3). |
| **Provisioning** | Quá trình sản phẩm khởi tạo hạ tầng để khách hàng bắt đầu dùng được dịch vụ (tạo tenant, cấp license, tạo tài khoản quản trị…). |
| **Ân hạn (GRACE)** | Giai đoạn ngay sau khi license hết hạn nhưng khách hàng **vẫn dùng đủ tính năng** trong một khoảng thời gian, trước khi bị hạn chế (xem §3.1). |
| **Hạn chế tính năng (RESTRICTED)** | Giai đoạn sau ân hạn: khách hàng bị **giảm hoặc khoá bớt tính năng** nhưng dịch vụ chưa dừng hẳn (xem §3.2). |
| **Product Module** | Một sản phẩm trong hệ sinh thái tích hợp với OneCRM (EDR, C-Shield, AV, CA). Mỗi Product Module tự khai báo tập trạng thái và bảng ánh xạ event của riêng mình. |
| **`license_status_set`** | Tập tên trạng thái hiển thị cho người dùng, **do từng Product Module khai báo**, không cố định (hardcode) trong lõi CRM (xem nguyên tắc NT-5, §1.3). |

### 1.2 Chữ viết tắt

| Viết tắt | Nghĩa đầy đủ |
|---|---|
| **CRM** | OneCRM — hệ thống quản lý quan hệ khách hàng thương mại |
| **EDR** | CMC EDR — Endpoint Detection & Response (sản phẩm chính triển khai ở Phase 1) |
| **AV** | CMC Antivirus |
| **CA** | CMC Certificate Authority |
| **BA / PO** | Business Analyst / Product Owner |
| **PRD / FRS** | Product Requirements Document / Functional Requirements Specification |
| **UC** | Use Case |
| **BR / AC** | Business Rule / Acceptance Criteria |
| **YT-1..YT-5** | 5 yếu tố cốt lõi (anchor) của OneCRM trong PRD; ví dụ YT-1 là vai trò passive-observer của CRM |
| **NT** | Nguyên tắc nền — quy tắc chi phối cách trao đổi event, đánh số trong tài liệu này (§1.3) |
| **OQ** | Open Question — câu hỏi mở chưa chốt (§6) |
| **BK / TS / Q** | Mã câu hỏi và câu trả lời tham chiếu tới `docs/plans/M-07_event_catalog_questions.md` |
| **M-05 / M-07** | Module License Mirror & Usage / Module Integration Layer |
| **HMAC** | Hash-based Message Authentication Code |
| **UUID** | Universally Unique Identifier |
| **UTC** | Coordinated Universal Time |

### 1.3 Nguyên tắc nền

Năm nguyên tắc dưới đây chi phối toàn bộ cách CRM trao đổi event với sản phẩm. Mọi quy tắc nghiệp vụ và bảng ánh xạ event ở các mục sau đều phải tuân thủ chúng.

| Mã | Nguyên tắc | Diễn giải đầy đủ |
|---|---|---|
| **NT-1** | `license_mirror` phản ánh *"khách hàng có dùng được dịch vụ hay không"*, chứ không phản ánh trạng thái kỹ thuật của bản ghi license. | Mọi thay đổi của mirror đều đến từ **event `license.*`** do EDR gửi (đúng NT-2 — CRM đọc event trạng thái license, không đọc event hạ tầng). Với Tạm dừng/Khôi phục: EDR thực thi bên trong ở **cấp Tenant**, nhưng **event xác nhận gửi về vẫn đặt tên `license.suspended` / `license.reactivated`** và **echo `correlation_id`** của lệnh CRM. Nhờ đó `license.suspended` có **hai nguồn** phân biệt bằng `correlation_id`: *có* → do CRM ra lệnh Tạm dừng (command-ack); *không* → tự nhiên (khách hết ân hạn, không gia hạn). Không cần event `tenant.*` riêng. |
| **NT-2** | CRM chỉ **quan sát**, tuyệt đối không tự suy diễn trạng thái. | Trạng thái của một license tại CRM chỉ được thay đổi khi **sản phẩm chủ động gửi event** báo về. CRM không được tự tính toán theo kiểu "license này chắc đã hết hạn rồi" dựa trên ngày tháng, vì làm như vậy sẽ vi phạm vai trò passive-observer đã được chốt tại anchor YT-1. |
| **NT-3** | Mọi event, ở cả hai chiều, đều bắt buộc phải mang đủ bộ **metadata dùng chung**. | Bộ metadata 7 trường (đặc tả tại §2) là bắt buộc. Thiếu `event_id` thì không thể chống xử lý trùng; thiếu `occurred_at` thì không thể chặn event đến sai thứ tự; thiếu `correlation_id` thì không thể truy vết một phản hồi thuộc về lệnh nào. |
| **NT-4** | Sản phẩm tự xử lý những lỗi mà nó có thể tự khắc phục; những lỗi không tự khắc phục được thì **bắt buộc phải báo về** cho CRM. | Với lỗi tạm thời (timeout, nghẽn mạng, service nội bộ chưa sẵn sàng), sản phẩm phải **tự thử lại có giới hạn số lần** và không cần báo về CRM. Nhưng khi đã hết số lần thử hoặc gặp lỗi vĩnh viễn (tenant không tồn tại, gói không hợp lệ…), sản phẩm **bắt buộc** gửi event `subscription.command_failed` (xem §4.4). Nếu không có cơ chế này, CRM sẽ phải chờ vô hạn rồi đoán mò lý do, trong khi thực tế sản phẩm đã biết chính xác nguyên nhân thất bại. |
| **NT-5** | Tên trạng thái hiển thị cho người dùng do **từng Product Module khai báo**, không cố định trong lõi CRM. | Mã event kỹ thuật của sản phẩm không nhất thiết trùng nghĩa với dòng chữ mà người dùng đọc trên màn hình. Ví dụ: EDR gửi event `license.expired`, nhưng dòng chữ hiển thị đúng cho một khách hàng đang trong giai đoạn ân hạn lại phải là "Trong ân hạn" (xem §3.2). Vì vậy, lõi CRM tra tên hiển thị từ `license_status_set` do Product Module khai báo, thay vì cố định danh sách trạng thái trong mã nguồn. |

---

## 2. Metadata dùng chung — bắt buộc cho MỌI event, cả 2 chiều

> *Bộ metadata này là đề xuất của BA — chưa có trong tài liệu tích hợp gốc. **Đây là nội dung cần thống nhất chính thức với phía sản phẩm trước khi triển khai.***

Mỗi event gồm **hai lớp**: lớp **metadata** (7 trường cố định, đặc tả trong bảng dưới) và lớp **payload** (nội dung nghiệp vụ riêng theo từng loại event, đặc tả tại §3.2, §4.2 và §4.3). Bảng dưới đặc tả lớp metadata — bắt buộc và **giống hệt nhau** ở mọi event, cả chiều inbound lẫn outbound, cho mọi Product Module.

| # | Trường | Kiểu dữ liệu | Bắt buộc | Mô tả |
|---|---|---|---|---|
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

### 2.2 Ví dụ — event INBOUND *(sản phẩm → CRM)*

Sản phẩm báo **đã nhận yêu cầu và khởi tạo xong tenant** (chờ khởi tạo license), **phản hồi cho** lệnh `subscription.submitted` mà CRM gửi trước đó. Ở bước này **chưa có** `activation_date` / `expiration_date` — hai mốc này chỉ có khi license kích hoạt thành công (event `license.activated`, §3.2 #3).

```json
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

> **`payload` khác nhau theo từng `event_key`** — chi tiết payload của từng loại: §4.2/4.3 (outbound), §3.2 (inbound). Bộ trường **metadata** (7 trường trên) thì **giống nhau ở mọi event, mọi sản phẩm**.

---

## 3. Event INBOUND — Sản phẩm → CRM (chi tiết: CMC EDR)

> **Toàn bộ §3 là mô hình ĐỀ XUẤT của BA, CHƯA xác nhận với đội EDR** — sẽ chốt trong buổi làm việc (xem OQ-INT-01/08/10, §6).

### 3.1 Vòng đời license của EDR — mô hình đề xuất

**Đề xuất:** giả định **mọi gói EDR đều đi qua ân hạn** trước khi ngừng — không có gói nào "chết ngay". Chuỗi trạng thái tự nhiên (khi khách không gia hạn) đi qua **ba giai đoạn**, trong đó `sub.status` **giữ nguyên ACTIVE** cho tới khi ngừng hẳn:

```
                        ┌──────── (CRM ra lệnh Tạm dừng) ───────────┐
                        │  license.suspended (CÓ correlation_id)     ▼
PENDING→PROVISIONING→ ACTIVE ─license.expired→ GRACE ─license.grace_expired→ RESTRICTED ─license.suspended→ SUSPENDED
                        ▲       (Trong ân hạn,        (Hạn chế tính năng,     (tự nhiên, KHÔNG
                        │        dùng ĐỦ)              30 ngày)                correlation_id)
                        │  license.reactivated
                        └──(CÓ correlation_id, do CRM ra lệnh Khôi phục)

  sub.status:  ACTIVE ───────────── ACTIVE ───────────────── ACTIVE ──────────────────► SUSPENDED
               (mirror lần lượt: ACTIVE → GRACE → RESTRICTED → SUSPENDED)

  (CRM ra lệnh Thu hồi) ──subscription.terminated──► EDR ──license.revoked──► REVOKED
     khai báo chính thức — EDR Phase 1 CHƯA gửi thật; UI/cảnh báo REVOKED tạm ẩn (§3.4).
```

> **Điểm cốt lõi của mô hình đề xuất:**
> - **EDR gửi `license.expired` để báo VÀO ÂN HẠN** (không phải "đã chết"). CRM map `license.expired` → mirror **GRACE**, hiển thị "Trong ân hạn", `sub` giữ ACTIVE. *(Đây là ví dụ chuẩn của NT-5: tên event `expired` ≠ chữ khách đọc "Trong ân hạn".)*
> - **Không dùng `license.grace_started`** (giả định 14/07 đã bỏ) — vai trò "vào ân hạn" do chính `license.expired` đảm nhận.
> - `license.grace_expired` → mirror **RESTRICTED** (hạn chế tính năng, 30 ngày); `sub` **vẫn giữ ACTIVE** *(sub chưa chết, chỉ mirror phản ánh mức hạn chế)*.
> - `license.suspended` → mirror **SUSPENDED**, `sub` → **SUSPENDED** (ngừng hẳn, không dùng được tính năng nào).

### 3.2 Bảng event inbound — EDR

| # | `event_key` | Nghĩa THẬT với khách hàng | CRM đặt `license_mirror.status` | Tên hiển thị | Tác động lên subscription |
|---|---|---|---|---|---|
| 1 | `license.pending` | EDR đã nhận yêu cầu, khởi tạo xong Tenant | `PENDING` | Chờ khởi tạo | — |
| 2 | `license.provisioning` | Đang triển khai license | `PROVISIONING` | Đang triển khai | — |
| 3 | `license.activated` | **Kích hoạt thành công — khách bắt đầu dùng được** | `ACTIVE` | Đang hoạt động | `sub.activation_date`, `sub.end_date` ← `expiration_date` của license; `sub.status = ACTIVE` |
| 4 | `license.expired` *(đề xuất: gửi khi VÀO ân hạn — KHÔNG phải "đã chết")* | **Hết hạn nhưng vào ân hạn.** Khách **vẫn dùng đủ tính năng**. | `GRACE` | **Trong ân hạn** | `sub` giữ **ACTIVE**. → view **Cơ hội doanh thu: "Gia hạn gấp"** |
| 5 | `license.grace_expired` | **Hết ân hạn** → khách chuyển sang **dùng hạn chế tính năng, trong 30 ngày** | `RESTRICTED` | **Hạn chế tính năng** | `sub` giữ **ACTIVE** *(sub chưa chết; mirror RESTRICTED thể hiện mức hạn chế)*. → **Cơ hội gia hạn KHẨN, xếp trên cả "Gia hạn gấp"** |
| 6 | `license.suspended` | **Ngừng hoàn toàn — khách không dùng được bất kỳ tính năng nào.** Hai nguồn phân biệt bằng `correlation_id` (xem §3.3). | `SUSPENDED` | Đã ngừng | `sub.status = SUSPENDED`. *CÓ* `correlation_id` → do CRM ra lệnh **Tạm dừng** (UC-SUB-09). *KHÔNG* có → **tự nhiên** (khách hết ân hạn, không gia hạn). |
| 7 | `license.reactivated` | **EDR đã khôi phục dịch vụ theo lệnh CRM** | `ACTIVE` | Đang hoạt động | `sub.status = ACTIVE`. **Luôn CÓ** `correlation_id` — phản hồi lệnh **Khôi phục** (UC-SUB-10). Khôi phục chỉ xảy ra do lệnh, không có đường tự nhiên. |
| 8 | `license.revoked` *(xem §3.4)* | **CRM đã ra lệnh Thu hồi** (chấm dứt hợp đồng) và EDR xác nhận đã thực thi | `REVOKED` | Đã thu hồi | `sub.status = REVOKED`. **Phase 1: EDR chưa gửi event này thật** — mọi UI/cảnh báo phản ứng với REVOKED tạm ẩn (§3.4) |
| 9 | `license.renewed` | Bản ghi license cũ được đánh dấu đã gia hạn | `RENEWED` | Đã gia hạn | Sub cũ → `RENEWED` (bàn giao cho bản kế tiếp) |
| 10 | `license.usage_synced` | Báo mức sử dụng định kỳ | *(không đổi)* | — | Cập nhật `used_seats` + `last_synced_at`. **Chu kỳ: 3 giờ** |
| 11 | `license.expiring_soon` | Sắp hết hạn | `EXPIRING_SOON` **Giữ** *(event + fallback)* | Sắp hết hạn | `sub` giữ **ACTIVE**. CRM **ưu tiên** nhận qua event này (đúng NT-2, không tự suy diễn). **Fallback đã chốt:** nếu chưa nhận được event mà vẫn còn cách hạn trong khoảng `renewal_notice_days`, M-05 **tạm giữ** cách tự tính hiện tại — không mất tính năng nhắc gia hạn cho tới khi EDR triển khai event này (ngoài phạm vi M-07, cần cập nhật ở FRS M-05) |

> **Lưu ý mô hình (đề xuất):** `sub.status` chỉ đi thẳng `ACTIVE → SUSPENDED` trong vòng đời tự nhiên của EDR — **không** dùng trạng thái `EXPIRED` ở cấp sub cho luồng này (ba giai đoạn ân hạn/hạn chế đều để `sub` ACTIVE, mức độ suy giảm phản ánh qua `license_mirror.status`).

> 🔴 **A — Làm rõ:** `license_mirror.status` (cột thứ 3 ở bảng trên) là **mã trạng thái raw của EDR** — kiểu dữ liệu **string tự do**, không phải một `ENUM`/tập giá trị cố định dùng chung cho mọi sản phẩm. Đúng theo schema PRD (§5.3.8 `LICENSE_MIRROR.status`: *"string — Raw từ product, set declare per Product Module"*) và §5.3.7 `PRODUCT_MODULE_CONFIG.license_status_set`: mỗi Product Module tự khai báo tập raw status + tên hiển thị + mapping sang trạng thái sub của riêng mình. Bảng trên là **vocabulary riêng của EDR** — sản phẩm khác khi tích hợp sau này có thể dùng tập giá trị khác, không suy rộng danh sách 9 dòng này sang sản phẩm khác. **Hệ quả cho thiết kế M-05:** cột `license_mirror.status` **không được** tạo `ENUM`/`CHECK constraint` cố định; mọi logic đọc trạng thái xuyên sản phẩm phải tra theo khai báo `license_status_set` của đúng Product Module, không hardcode theo tên trạng thái của EDR.

### 3.3 Xác nhận lệnh Tạm dừng/Khôi phục — event `license.*` mang `correlation_id` (command-ack) *(đề xuất)*

EDR thực thi Tạm dừng/Khôi phục bên trong ở **cấp Tenant**, nhưng **event xác nhận gửi về CRM đặt tên `license.suspended` / `license.reactivated`** và **echo `correlation_id`** của lệnh CRM đã gửi. Vì vậy CRM cập nhật `license_mirror.status` từ chính event **trạng thái license** (đúng NT-2 — không đọc event hạ tầng tenant), còn `correlation_id` cho biết thay đổi này **do CRM ra lệnh** hay **tự nhiên**.

| Event EDR gửi về | Là phản hồi cho lệnh | `correlation_id` | CRM đặt mirror | Nguyên nhân ghi lại |
|---|---|---|---|---|
| `license.suspended` | `subscription.suspended` (UC-SUB-09) | **có** | `SUSPENDED` | Do CRM ra lệnh **Tạm dừng** — `last_change_source = command_ack` |
| `license.reactivated` | `subscription.reactivated` (UC-SUB-10) | **có** | `ACTIVE` | Do CRM ra lệnh **Khôi phục** — `last_change_source = command_ack` |
| `license.suspended` | *(không phải phản hồi lệnh nào)* | **không** | `SUSPENDED` | **Tự nhiên** — khách hết ân hạn, không gia hạn — `last_change_source = product_event` |

**Vai trò của `correlation_id`** *(nên nó nằm trong metadata bắt buộc, §2)*:
- `license.suspended` **có** `correlation_id` khớp lệnh CRM → **xác nhận lệnh Tạm dừng đã có hiệu lực** → mirror SUSPENDED + ghi audit *"lệnh Tạm dừng có hiệu lực lúc {occurred_at}"*; lưu `last_change_source = "command_ack"` + `source_command_event_id`.
- `license.suspended` **không** có `correlation_id` → đường **tự nhiên** (khách không gia hạn, hết 30 ngày hạn chế) → mirror SUSPENDED; lưu `last_change_source = "product_event"`. **Đây là hợp lệ, KHÔNG phải bất thường.**
- `license.reactivated` **luôn** phải có `correlation_id` (Khôi phục chỉ xảy ra do lệnh CRM) → nếu về mà **không khớp** lệnh nào → ghi nhận + **cảnh báo** *(EDR khôi phục dịch vụ mà CRM không yêu cầu — bất thường)*.

> **Vì sao mô hình này sạch hơn giả định `tenant.*` ngày 14/07:** CRM chỉ đọc event **trạng thái license** (`license.*`) — đúng vai trò quan sát YT-1, không phải diễn giải event hạ tầng tenant. `correlation_id` chỉ bổ sung **nguyên nhân** (do lệnh hay tự nhiên) cho audit/hiển thị, không quyết định có đổi mirror hay không.

> **OQ-INT-01 (chưa chốt):** đề xuất Tạm dừng/Khôi phục xác nhận qua `license.suspended` / `license.reactivated` mang `correlation_id`, bỏ `tenant.*` khỏi danh mục.

### 3.4 REVOKED — khai báo chính thức `license.revoked`, nhưng ẩn UI/cảnh báo ở Phase 1 *(rà lại 14/07)*

**Quyết định (rà lại 14/07):** khai báo **`license.revoked` → `REVOKED`** là event inbound chính thức trong danh mục — đây là phản hồi cho lệnh outbound `subscription.terminated` (Thu hồi, UC-SUB-08), **không** còn đi qua `tenant.terminated` như thiết kế trước (§3.3). Nhờ vậy `license_mirror.status` phân biệt được rõ **Tạm dừng** (`SUSPENDED`, có thể khôi phục) và **Thu hồi** (`REVOKED`, chấm dứt hợp đồng) — điều bản thiết kế cũ không làm được.

**Nhưng:** EDR **hiện tại chưa có cơ chế revoke license thật**, tức **chưa thực sự gửi `license.revoked`**. Vì vậy ở **Phase 1**:
- Danh mục **khai báo sẵn** event key + mapping (forward-compatible — khi EDR làm xong, không cần đổi hợp đồng event).
- **Chưa thiết kế/triển khai** bất kỳ tính năng, cảnh báo, hay giao diện nào **phản ứng với trạng thái REVOKED** (vd mismatch detection UC-LIC-04 BR-09 "lệch kiểu A", banner "sản phẩm không thực thi lệnh") — **tạm ẩn/bỏ qua**, chưa thực hiện.
- Lệnh outbound `subscription.terminated` (Thu hồi) vẫn được **gửi và ghi nhận đã gửi** ở UC-INT-01 như bình thường — chỉ là **CRM chưa mong đợi phản hồi `license.revoked` thật** từ EDR trong Phase 1, nên không dựng cơ chế phát hiện "chưa phản hồi" cho riêng trường hợp này.

**Kéo theo M-05** (ngoài phạm vi M-07, cần đối chiếu riêng khi làm/rà M-05): vì `REVOKED` giờ là trạng thái chính thức trong danh mục (khác với quyết định cũ "gỡ REVOKED khỏi M-05"), **có thể giữ nguyên `REVOKED` trong demo/FRS M-05 hiện có** — nhưng ẩn mọi cảnh báo/mismatch logic liên quan tới nó cho tới khi EDR triển khai event thật.

---

## 4. Event OUTBOUND — CRM → Sản phẩm

### 4.1 Danh sách *(6 event — tài liệu cũ thiếu #6)*

| # | Nghiệp vụ | `event_key` | Kích hoạt bởi | EDR làm gì | EDR gửi lại |
|---|---|---|---|---|---|
| 1 | Xác nhận subscription | `subscription.submitted` | UC-SUB-05 | Create Tenant → Tenant License → Tenant Admin → Org (nếu SINGLE_ORG) → Org License → Org Admin | `license.pending` |
| 2 | Tạm dừng | `subscription.suspended` | UC-SUB-09 | **Suspend Tenant** (cấp tenant) | `license.suspended` *(CÓ correlation_id)* → mirror = SUSPENDED, §3.3 |
| 3 | Khôi phục | `subscription.reactivated` | UC-SUB-10 | **Reactivate Tenant** (cấp tenant) | `license.reactivated` *(CÓ correlation_id)* → mirror = ACTIVE, §3.3 |
| 4 | Thu hồi | `subscription.terminated` | UC-SUB-08 | *(Phase 1: EDR chưa có cơ chế revoke thật — §3.4)* | `license.revoked` → *(mirror = REVOKED — khai báo, chưa thực thi thật ở EDR Phase 1)* |
| 5 | Gia hạn | `subscription.renewed` | UC-SUB-07 | Tạo Tenant/Org License mới; đánh dấu bản cũ Renewed | `license.renewed` *(bản cũ)* + `license.activated` *(bản mới)* |
| 6 | **Yêu cầu cập nhật mức dùng** | `usage.force_sync_requested` | UC-LIC-03 | Gửi lại số liệu mức sử dụng | `license.usage_synced` |

> **#6 bị thiếu trong tài liệu cũ** dù PRD FR-LIC-04 BR-04.2 đã yêu cầu và demo đã hiển thị.

### 4.2 Payload — `subscription.submitted` / `subscription.renewed`

Giữ nguyên schema hiện có *(customer · package · admin · license_qty · structure_mode)*, **kèm metadata §2**.

### 4.3 Payload — `suspended` / `reactivated` / `terminated` *(tài liệu cũ không có)*

```json
{
  "reason": "Khách hàng ngừng hợp đồng",
  "effective_at": "2026-07-14T10:00:00Z"
}
```
> `reason` lấy từ `subscription.suspend_reason` (đã có từ v2.4). `effective_at` = thời điểm lệnh có hiệu lực.

### 4.4 `subscription.command_failed` — sản phẩm báo "tôi không làm được lệnh của anh"

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

### 5.2 🔴 Chống event đến sai thứ tự — sẽ xảy ra, không phải "nếu"

> `license.suspended` (xảy ra **10:00**) gửi lỗi, retry lúc 10:05.
> `license.activated` (xảy ra **10:02**) tới ngay lúc 10:02.
> CRM xử lý theo thứ tự **nhận được**: ACTIVE (10:02) → SUSPENDED (10:05, nhưng là chuyện của 10:00).
> **Kết quả: license sai trạng thái, và sai vĩnh viễn.**

**Quy tắc:** chỉ áp dụng event khi `occurred_at` **mới hơn** `license_mirror.last_event_occurred_at`. Event cũ hơn → **ghi nhận, KHÔNG áp dụng**, đánh dấu *"đến muộn"*.

→ Cần thêm cột **`license_mirror.last_event_occurred_at`**. Đây cũng là nền của **replay theo chuỗi** (M-07: xử lý lại phải chạy tuần tự theo `occurred_at`, không xử lý lẻ tin cũ).

> 🔴 **B — Phạm vi watermark:** quy tắc trên **chỉ áp dụng cho các event làm đổi `license_mirror.status`** (§3.2 #1–#9, #11). `license.usage_synced` (#10) chạy **mỗi 3 giờ**, tần suất cao, và **không đổi status** — nếu tính chung vào watermark `last_event_occurred_at`, nó sẽ liên tục đẩy mốc thời gian lên và khiến event trạng thái đến muộn (hiếm, quan trọng) bị **loại nhầm**:
> ```
> 10:00  usage_synced (occurred_at=10:00) → nếu ĐẨY watermark chung = 10:00
> 09:58  license.suspended gửi lỗi, tới muộn lúc 10:01
>        → 09:58 < 10:00 → BỊ LOẠI OAN, mirror KHÔNG chuyển SUSPENDED — sai trạng thái vĩnh viễn
> ```
> `usage_synced` dùng mốc **riêng**: `license_mirror.last_synced_at` (đã có ở §3.2 #10) — không đụng tới `last_event_occurred_at`. `last_event_occurred_at` chỉ được cập nhật bởi các event **đổi status** (#1–#9, #11).

### 5.3 Xác thực nguồn gửi
HMAC-SHA256 theo `runtime_config.webhook_secret`. **Chữ ký sai → trả 4xx, TỪ CHỐI NGAY, KHÔNG ghi `WEBHOOK_INBOX`** — chỉ log ở hạ tầng (rate-limited + source IP) cho đội bảo mật *(SG-4, chốt 16/07)*. Không lưu để tránh kẻ lạ đổ rác vào inbox (DoS) và để mọi dòng trong inbox đều đã xác thực. Sự cố khoá sai được **cảnh báo im lặng** bắt (sản phẩm sai khoá → không tin nào hợp lệ → kênh im lặng); điều tra tấn công giả mạo thuộc **an ninh hạ tầng**, không phải dashboard CRM.

**Đổi khoá (rà lại 14/07 — BK-3/Q8):** BA để **Dev quyết định cơ chế cụ thể**. FRS chỉ nêu **ràng buộc nghiệp vụ bắt buộc**: *đổi khoá bảo mật KHÔNG được làm mất dữ liệu webhook hợp lệ* — vì nếu đổi khoá "cứng" (chỉ chấp nhận khoá mới ngay lập tức), mọi tin gửi trong lúc EDR chưa kịp cập nhật khoá sẽ bị đánh dấu "chữ ký không hợp lệ" và **không xử lý lại được** (BR-01) → mất dữ liệu license/usage thật. PRD §5.3.7 đã có sẵn field `secret_rotation_state` (ân hạn 7 ngày) mà Dev có thể dùng làm cơ sở — cách làm phổ biến là chấp nhận song song cả khoá cũ lẫn mới trong thời gian ân hạn (dual-secret rotation).

### 5.4 Không chặn đường trả lời
CRM trả **200 OK ngay** khi nhận, xử lý bất đồng bộ. Vòng đời: `RECEIVED → PROCESSED` / `FAILED_RETRYING → FAILED` *(tối đa 5 lần thử)*.

### 5.5 Vòng đời dữ liệu *(chốt 14/07 — theo trả lời BK-2, thay cho đề xuất cũ)*
`license.usage_synced` mỗi **3 giờ** × N sub = **8 tin/sub/ngày**. 500 sub → **4.000 tin/ngày**, **~1,5 triệu/năm**.

- **Message Queue**: tin chỉ tồn tại tới khi xử lý **thành công** — đúng cơ chế hàng đợi thông thường, không phải việc của CRM lưu trữ.
- **Database (`WEBHOOK_INBOX`)**: **KHÔNG có purge tự động ở giai đoạn này** — mọi tin (kể cả `usage_synced` đã xử lý xong) **giữ nguyên trong DB**. Cơ chế backup/lưu trữ dài hạn **để sau, chưa phân tích trong giai đoạn này**.
- **Giao diện** (tab Tích hợp — cả *Sự kiện gửi đi* và *Sự kiện nhận về*): thay vì ẩn mặc định `usage_synced` thành công, dùng **bộ lọc mặc định theo thời gian** — vd **3 ngày gần nhất** — để màn không bị 4.000 tin/ngày làm ngợp; người dùng tự nới khoảng thời gian khi cần tra cứu xa hơn.

---

## 6. Open Questions

> Rà lại lần 2 — 14/07/2026 — đối chiếu với `docs/plans/M-07_event_catalog_questions.md` sau khi BA trả lời đầy đủ Q1–Q9 + LH-1..3 + BK-1..3 + TS-1..5. Lần rà đầu (cùng ngày) đã đóng một số OQ dựa trên câu trả lời **chưa đầy đủ lúc đó** — 2 trong số đó (REVOKED, GRACE) hoá ra **ngược lại thiết kế đã viết**, đã sửa lại nội dung thật ở §3, không chỉ đổi nhãn OQ. OQ-INT-07 cũng bị đóng nhầm ở lần rà đầu (dựa theo đề xuất cũ) — đã sửa theo câu trả lời đúng (BK-2).

| Mã | Nội dung | Mức |
|---|---|---|
| **OQ-INT-01** | **CHƯA chốt:** đề xuất Tạm dừng/Khôi phục xác nhận qua `license.suspended` / `license.reactivated` mang `correlation_id` (§3.3) — bỏ `tenant.*`; Thu hồi dùng `license.revoked` riêng (§3.4). | 🔴 Cần chốt với EDR |
| ~~OQ-INT-04~~ | **Đã chốt:** metadata 7 trường (§2) là chuẩn bắt buộc. | — |
| ~~OQ-INT-05~~ | **Đã chốt:** chặn event đến muộn theo `occurred_at` + cột `license_mirror.last_event_occurred_at` (§5.2). | — |
| ~~OQ-INT-06~~ | **Đã chốt:** GIỮ `EXPIRING_SOON`, ưu tiên event `license.expiring_soon`, **fallback** tự tính `renewal_notice_days` khi chưa có event (§3.2 #11). | — |
| ~~OQ-INT-07~~ | **Đã chốt (sửa lại theo BK-2 — bản trước dựa trên đề xuất cũ, sai):** **không** purge tự động, giữ nguyên DB, backup để sau; **bộ lọc mặc định theo thời gian** (vd 3 ngày) ở tab Tích hợp thay vì ẩn `usage_synced` thành công (§5.5). | — |
| ~~OQ-INT-09~~ | **Đã chốt:** REVOKED — khai báo `license.revoked` → `REVOKED` chính thức (không còn qua `tenant.terminated`); EDR chưa gửi thật ở Phase 1 nên mọi UI/cảnh báo liên quan tạm ẩn (§3.4). | — |
| **OQ-INT-10** | **CHƯA chốt:** đề xuất EDR gửi `license.expired` để báo **vào ân hạn** → mirror `GRACE`; không dùng `license.grace_started`; giả định **mọi gói EDR đều đi qua ân hạn** (§3.1, §3.2). | 🔴 Cần chốt với EDR |
| **OQ-INT-08** | **CHƯA chốt:** đề xuất khi mirror = `RESTRICTED` (hạn chế tính năng), `sub.status` **giữ ACTIVE** (PA A) — mức hạn chế phản ánh qua `license_mirror.status`, không đổi trạng thái sub (§3.2 #5). | 🔴 Cần chốt với EDR |
