# Review mâu thuẫn — Module Tích hợp (M-07) & EDR (PM-01)

> Ngày review: 16/07/2026 · Người thực hiện: BA (với hỗ trợ AI) · Trạng thái: **Chờ BA quyết nguồn sự thật**
> Phạm vi: `docs/frs/integration/` (UC-INT-01..06 + `_event_catalog.md`), PRD v2.6 §6.7 (M-07) và §6.9 (EDR), §5.5.1/§5.5.2 (state machine), §5.3.4/§5.3.7/§5.3.8 (entity), và bộ UC-SUB có phát/nhận event.

---

## 1. Nguồn gốc chung của toàn bộ mâu thuẫn

Ngày **14/07/2026**, tài liệu `_event_catalog.md` được **viết lại hoàn toàn** thành hợp đồng tích hợp mới: đổi tên nhiều event key, bổ sung mô hình ân hạn hai giai đoạn (`grace_started` / `grace_expired` → `RESTRICTED`), tách Thu hồi thành `license.revoked` → `REVOKED`, đưa đường Tạm dừng/Khôi phục qua `tenant.*` + `correlation_id`, và chốt chu kỳ đẩy usage **3 giờ**. Bộ **UC-INT-01..06 đã được cập nhật đồng bộ** với danh mục mới này.

**Nhưng** các phần sau của PRD v2.6 **chưa được cập nhật theo**, vẫn giữ mô hình EDR cũ (trước 14/07):
- §6.9.4 (License Status Set), §6.9.6 (Outbound Mapping), §6.9.7 (Inbound Mapping)
- §5.5.1 (SUBSCRIPTION state machine), §5.5.2 (LICENSE_MIRROR.status)
- §6.7.1 (định nghĩa metadata webhook)
- §5.3.7 (`runtime_config` — tham số thời gian)

Ngoài ra một số **file UC-SUB** dùng lẫn tên event cũ/mới, và **UC-SUB-08 có một lỗi đặc tả vi phạm nguyên tắc observer** (mục F-01).

> **Hệ quả:** đây phần lớn là **document drift** (tài liệu trôi dạt), không phải bất đồng thiết kế. Cách xử lý chủ đạo: **chọn `_event_catalog.md` (bản 14/07) + UC-INT làm nguồn sự thật cho hợp đồng tích hợp, rồi cập nhật PRD §6.9/§6.7/§5.5/§5.3.7 cho khớp.** Riêng một số mục danh mục tự đánh dấu ⚠️ (chưa xác nhận với đội EDR) thì vẫn là Open Question thật sự — xem mục 4.

---

## 2. Bảng tổng hợp mâu thuẫn

| Mã | Chiều | Mâu thuẫn | Bản CŨ (PRD §6.9/§6.7/§5.x) | Bản MỚI (catalog + UC-INT) | Mức |
|----|----|----|----|----|----|
| **A-01** | inbound | Tên event kích hoạt license | `license.active` | `license.activated` | 🔴 Cao |
| **A-02** | inbound | Tên event báo mức dùng | `usage.report` | `license.usage_synced` | 🔴 Cao |
| **A-03** | outbound | Tên event xác nhận sub | `subscription.created` | `subscription.submitted` | 🟠 TB |
| **A-04** | outbound | Tên event khôi phục | `subscription.resumed` | `subscription.reactivated` | 🟠 TB |
| **A-05** | outbound | Tên event thu hồi | `subscription.revoked` | `subscription.terminated` | 🟠 TB |
| **A-06** | outbound | Tên event gia hạn | `subscription.created + RENEWAL` (§6.9.6) **vs** `subscription.renewed` (§5.5.1 prose) | `subscription.renewed` | 🟠 TB |
| **A-07** | inbound | Tên event vào ân hạn | `license.grace` | `license.grace_started` | 🟠 TB |
| **B-01** | inbound | Ánh xạ khi hết hạn | `license.expired` → mirror **EXPIRED**, sub EXPIRED | `license.expired` → mirror **RESTRICTED** (chỉ khi gói không ân hạn) | 🔴 Cao |
| **B-02** | inbound | Giai đoạn hết ân hạn | (không có) | `license.grace_expired` → **RESTRICTED** ("Hạn chế tính năng", 30 ngày) | 🟠 TB |
| **B-03** | inbound | Trạng thái Thu hồi | EDR status set **không có REVOKED**; không có `license.revoked` | `license.revoked` → **REVOKED** (khai báo chính thức, EDR Phase 1 chưa gửi thật) | 🔴 Cao |
| **B-04** | inbound | Trạng thái sắp hết hạn | (không có) | `license.expiring_soon` → **EXPIRING_SOON** | 🟢 Thấp |
| **B-05** | hiển thị | Tên hiển thị GRACE | "Trong gia hạn" (§6.9.4) | "Trong ân hạn" | 🟢 Thấp |
| **C-01** | inbound | Đường Tạm dừng/Khôi phục | `license.suspended`/(không có event khôi phục) trực tiếp đổi mirror | `tenant.suspended`/`tenant.reactivated` + `correlation_id` (command-ack) | 🔴 Cao |
| **D-01** | cấu hình | Chu kỳ đẩy usage | §6.9.9 EDR = **1h**; §5.3.7 = **24h** | catalog + UC-INT = **3h** | 🔴 Cao |
| **E-01** | metadata | Tên trường loại event | `event_type` (§6.7.1) | `event_key` | 🔴 Cao |
| **E-02** | metadata | Tên trường bọc payload | `data` (§6.7.1) | `payload` | 🔴 Cao |
| **E-03** | metadata | Khoá đối chiếu | chỉ `correlation_id = sub_id`; không có `product_id` | `subscription_id` + `product_id` là 2 trường riêng | 🟠 TB |
| **E-04** | metadata | `schema_version` | §6.7.1 optional; UC-INT-02 bước 1 liệt kê 6 trường (thiếu) | catalog: bắt buộc, đủ 7 trường | 🟢 Thấp |
| **F-01** | đặc tả | UC-SUB-08 tự ghi thẳng `licMirrorStatus = REVOKED` | — | Vi phạm YT-1/NT-2 (mirror chỉ đổi khi product gửi event) | 🔴 Cao |
| **F-02** | đặc tả | UC-SUB-05 thiếu mô hình actor kích hoạt + bước PENDING_PROVISION → ACTIVE | — | Có trong mô tả nghiệp vụ M-03/catalog nhưng FRS thiếu | 🟠 TB |

---

## 3. Chi tiết từng mâu thuẫn

### Nhóm A — Tên event key lệch nhau

**A-01 — Event kích hoạt license: `license.active` vs `license.activated`** 🔴
- Bản cũ: PRD §6.9.7 (dòng 2065), §5.5.5 Date Model (dòng 1268), UC-SUB-02 BR-10 (dòng 35) — đều dùng `license.active`.
- Bản mới: `_event_catalog.md` §3.2 + ví dụ JSON §2.2, UC-INT-02 (bước 9 + AC), UC-SUB-07 BR-09 — đều dùng `license.activated`.
- **Vì sao quan trọng:** đây là event inbound **quan trọng nhất** — nó đặt `sub.status = ACTIVE` và ghi `sub.activated_at`, `sub.end_date`. Hai tên khác nhau nghĩa là Product Module và CRM sẽ **không bắt tay được** nếu không thống nhất. Đây cũng là nguồn ngày tháng (§5.5.5) nên sai tên là hỏng cả Date Model.
- **Khuyến nghị:** chốt một tên duy nhất. Danh mục mới dùng `license.activated`; nếu chọn tên này thì sửa PRD §6.9.7, §5.5.5 và UC-SUB-02.

**A-02 — Event báo mức dùng: `usage.report` vs `license.usage_synced`** 🔴
- Bản cũ: PRD §6.9.7 (dòng 2070) = `usage.report`.
- Bản mới: catalog §3.2 (#10), UC-INT-02 (BR-10) = `license.usage_synced`. Event outbound `usage.force_sync_requested` cũng mong nhận lại `license.usage_synced`.
- **Vì sao quan trọng:** sai tên thì mọi tin usage (8 tin/sub/ngày) rơi vào nhánh xử lý sai → M-05 không cập nhật được số ghế, tính năng chào bán thêm (upsell) và phát hiện "kênh chết" đều hỏng.

**A-03..A-05 — Tên event outbound** 🟠
- Xác nhận sub: `subscription.created` (PRD §6.9.6 dòng 2050) vs `subscription.submitted` (catalog §4.1, UC-INT, UC-SUB-05 BR-04).
- Khôi phục: `subscription.resumed` (PRD §6.9.6 dòng 2052) vs `subscription.reactivated` (catalog, UC-SUB-10 BR-09, UC-INT-02).
- Thu hồi: `subscription.revoked` (PRD §6.9.6 dòng 2053) vs `subscription.terminated` (catalog, UC-SUB-08 BR-09, UC-INT-02).
- **Vì sao quan trọng:** đây là các lệnh CRM gửi đi; sai tên thì Product Module không nhận đúng lệnh. Việc sửa là cơ học nhưng bắt buộc phải khớp trên cả 3 nơi (PRD §6.9.6 · catalog §4.1 · UC-SUB tương ứng).

**A-06 — Event gia hạn: mâu thuẫn NGAY TRONG PRD** 🟠
- PRD §6.9.6 (dòng 2054): Renew → `subscription.created + context.type="RENEWAL" + previous_subscription_id`.
- PRD §5.5.1 (văn xuôi, dòng 1227): "CRM publish `subscription.renewed` qua Outbox".
- Catalog §4.1 + UC-SUB-07 BR-09: `subscription.renewed`.
- **Vì sao quan trọng:** hai chỗ trong cùng một PRD nói hai tên khác nhau cho cùng một nghiệp vụ. Cần chốt: gia hạn là **một event riêng** (`subscription.renewed`) hay **tái dùng** `subscription.created` với cờ `context.type="RENEWAL"`? Quyết định này ảnh hưởng cách Product Module phân biệt "mua mới" với "gia hạn".

**A-07 — Event vào ân hạn: `license.grace` vs `license.grace_started`** 🟠
- Bản cũ: PRD §6.9.7 (dòng 2067) = `license.grace`.
- Bản mới: catalog §3.2 (#4), UC-INT-02 BR-14 = `license.grace_started` (đặt tên có "started" để đối xứng với `grace_expired`).

### Nhóm B — Mô hình trạng thái license (RESTRICTED / REVOKED / grace_expired / EXPIRING_SOON)

**B-01 — Hết hạn: mirror EXPIRED hay RESTRICTED?** 🔴
- Bản cũ: PRD §6.9.7 (dòng 2068) + §6.9.4: `license.expired` → mirror **EXPIRED**, sub **EXPIRED**.
- Bản mới: catalog §3.2 (#6) + UC-INT-02 BR-14: `license.expired` → mirror **RESTRICTED** (và chỉ dùng khi gói không có ân hạn; đường thường đi qua `grace_started` → `grace_expired`).
- **Vì sao quan trọng:** đây chính là **lỗ hổng LH-2** mà danh mục mới đã vá — mô hình cũ coi hết hạn là "license chết" và báo động mức Cao oan cho khách vẫn đang dùng trong ân hạn. Nếu PRD vẫn giữ EXPIRED thì M-05 tiếp tục báo động sai.

**B-02 — Giai đoạn hết ân hạn (`grace_expired` → RESTRICTED)** 🟠
- Bản mới có `license.grace_expired` → **RESTRICTED** ("Hạn chế tính năng", 30 ngày). PRD hoàn toàn không có khái niệm này.

**B-03 — Trạng thái Thu hồi (REVOKED)** 🔴
- Bản cũ: EDR license_status_set (§6.9.4, dòng 2024–2030) chỉ có 7 trạng thái **PENDING / PROVISIONING / ACTIVE / SUSPENDED / GRACE / EXPIRED / RENEWED — KHÔNG có REVOKED**. §5.5.2 (dòng 1233) cũng liệt kê đúng 7 trạng thái này, không có REVOKED. Không có event `license.revoked`.
- Bản mới: catalog §3.4 + UC-INT-02 BR-13: `license.revoked` → **REVOKED** (khai báo chính thức trong danh mục; lưu ý EDR Phase 1 **chưa gửi thật**, nên UI/cảnh báo phản ứng với REVOKED **tạm ẩn**).
- **Vì sao quan trọng:** đây là **lỗ hổng LH-1**. Nếu PRD không có REVOKED thì không phân biệt được Tạm dừng (có thể khôi phục) với Thu hồi (chấm dứt), và sub bị thu hồi nằm mãi trong hàng đợi mức Cao. Liên quan trực tiếp F-01 bên dưới.

**B-04 — Trạng thái sắp hết hạn (EXPIRING_SOON)** 🟢
- Bản mới có `license.expiring_soon` → EXPIRING_SOON (kèm cơ chế fallback tự tính `renewal_notice_days`). PRD không có. Mức thấp vì đã có fallback, không chặn dev.

**B-05 — Tên hiển thị GRACE** 🟢
- PRD §6.9.4 (dòng 2028): GRACE → "**Trong gia hạn**". Catalog: "**Trong ân hạn**".
- "Gia hạn" (renewal/kéo dài hợp đồng) và "ân hạn" (thời gian nhân nhượng sau hết hạn) là **hai khái niệm khác nhau** — "Trong gia hạn" là nhãn sai nghĩa. Nên dùng "Trong ân hạn".

### Nhóm C — Đường Tạm dừng/Khôi phục

**C-01 — `license.suspended` trực tiếp vs `tenant.*` + command-ack** 🔴
- Bản cũ: PRD §6.9.7 (dòng 2066): `license.suspended` → mirror SUSPENDED trực tiếp. PRD **không có** event khôi phục tương ứng, cũng không có `tenant.suspended`/`tenant.reactivated`.
- Bản mới: catalog §3.3 + UC-INT-02 BR-12: Tạm dừng/Khôi phục xác nhận qua `tenant.suspended`/`tenant.reactivated`, và **chỉ đổi mirror khi có `correlation_id`** khớp lệnh CRM đã gửi (mô hình command-ack).
- **Vì sao quan trọng:** hai kiến trúc khác hẳn nhau. Bản mới xuất phát từ thực tế "EDR thực thi Tạm dừng/Khôi phục ở cấp Tenant, không ở cấp License" (NT-1).
- ⚠️ **Lưu ý:** chính danh mục cũng đánh dấu NT-1 là **cần xác nhận với đội EDR**. Vậy đây vừa là drift (PRD cũ) vừa còn một phần là Open Question thật — xem mục 4.

### Nhóm D — Tham số thời gian

**D-01 — Chu kỳ đẩy usage: 1h vs 24h vs 3h (BA TÊN CÙNG MỘT THAM SỐ)** 🔴
- PRD §6.9.9 EDR runtime_config (dòng 2093): `usage_push_interval_hours: 1` — **1 giờ**. §6.9.5 (dòng 2040) cũng ghi "Push interval: 1h".
- PRD §5.3.7 mô tả field (dòng 1079): `usage_push_interval` — "**chốt v2.6: 24h** cho mọi sản phẩm". Ngưỡng "chưa cập nhật" = 2× → 48h.
- Catalog §5.5 (chốt 14/07, BK-2) + UC-INT-02/03/05: **3 giờ** → ngưỡng "kênh chết" = 2× = **6 giờ**; ước lượng 8 tin/sub/ngày, 500 sub → 4.000 tin/ngày.
- **Vì sao quan trọng:** con số này quyết định (a) ngưỡng phát hiện "kênh chết" ở UC-INT-03, (b) ước lượng khối lượng tin để thiết kế lưu trữ, (c) độ tươi của số liệu usage. Ba giá trị khác nhau (1h / 3h / 24h) chênh nhau tới **24 lần**.
- **Khuyến nghị:** lấy **3h** (quyết định mới nhất, 14/07, đã phân tích khối lượng) làm chuẩn cho EDR; cập nhật §6.9.9 (1h) và §5.3.7 (24h) cho khớp. **Cần BA xác nhận** vì §5.3.7 ghi "cho mọi sản phẩm".

### Nhóm E — Metadata / Envelope (hợp đồng dây)

**E-01 — Tên trường loại event: `event_type` vs `event_key`** 🔴
- PRD §6.7.1 (dòng 1801): `event_type`. Catalog §2 + UC-INT-01 BR-05: `event_key`.

**E-02 — Tên trường bọc payload: `data` vs `payload`** 🔴
- PRD §6.7.1 (dòng 1805): `data`. Catalog §2: `payload`.
- **Vì sao quan trọng (E-01+E-02):** đây là tên trường trên dây (wire contract). Product Module gửi `event_type`/`data` trong khi CRM đọc `event_key`/`payload` (hoặc ngược lại) thì mọi webhook fail. Phải thống nhất tuyệt đối.

**E-03 — `subscription_id` + `product_id` là trường riêng hay gộp vào `correlation_id`?** 🟠
- Catalog §2: envelope có **7 trường**, gồm `subscription_id` và `product_id` riêng biệt.
- PRD §6.7.1: chỉ có `correlation_id` ("= sub_id của CRM, product echo"); **không có** `product_id` và **không có** `subscription_id` riêng.
- **Vì sao quan trọng:** khác nhau về cách đối chiếu tin về subscription và cách chọn khoá bảo mật theo `product_id`. Cần chốt một mô hình envelope.

**E-04 — `schema_version` bắt buộc hay optional** 🟢
- Catalog: bắt buộc (đủ 7 trường). PRD §6.7.1: optional. UC-INT-02 bước 1 liệt kê chỉ 6 trường (thiếu `schema_version`) trong khi UC-INT-01 BR-05 liệt kê đủ 7. Cần thống nhất và sửa liệt kê ở UC-INT-02.

### Nhóm F — Vi phạm nguyên tắc / lỗi đặc tả

**F-01 — UC-SUB-08 tự ghi thẳng `licMirrorStatus = REVOKED`** 🔴
- UC-SUB-08 BR-05 (dòng 29) + bước 7 (dòng 53): khi thu hồi, CRM đặt **ngay** `sub.status = REVOKED` **và** `sub.licMirrorStatus = REVOKED`, `licMirrorExpiry = null`.
- **Vì sao là lỗi:** `license_mirror.status` là **bản soi chiếu chỉ-đọc** từ product; theo YT-1/NT-2/BR-06 nó **chỉ được đổi khi product gửi event** (nguồn ghi duy nhất là Webhook Receiver — catalog §8, mục "Nguồn ghi duy nhất"). CRM tự đặt `licMirrorStatus = REVOKED` là **vi phạm ranh giới observer**. Thêm nữa, catalog §3.4 nói rõ EDR Phase 1 **chưa gửi `license.revoked` thật** nên mọi phản ứng với REVOKED phải **tạm ẩn** — trong khi UC-SUB-08 lại chủ động đặt mirror REVOKED. Đây là mâu thuẫn trực tiếp.
- **Khuyến nghị:** UC-SUB-08 chỉ được đổi `sub.status` (đối tượng thương mại của CRM), **không** đụng `licMirrorStatus`. Mirror để nguyên, chờ (tương lai) `license.revoked` từ EDR. Cần đối chiếu lại với quyết định "Phase 1 ẩn mọi phản ứng REVOKED".

**F-02 — UC-SUB-05 thiếu mô hình actor kích hoạt + bước → ACTIVE** 🟠
- UC-SUB-05 dừng ở `PENDING_PROVISION`, **không** đặc tả: (a) bước chuyển PENDING_PROVISION → ACTIVE, (b) mô hình actor kích hoạt (AUTO / PRODUCT_ADMIN / CUSTOMER_SELF / SALES) mà mô tả nghiệp vụ M-03 và catalog §3.1 đều nói tới.
- **Vì sao quan trọng:** "ai bấm kích hoạt, và CRM chờ webhook nào để sang ACTIVE" là logic cốt lõi; hiện nằm rải rác ở mô tả M-03 nhưng chưa vào FRS chức năng nào. Cần một nơi đặc tả chính thức (bổ sung vào UC-SUB-05 hoặc tạo UC riêng cho "Kích hoạt").

---

## 4. Điểm cần BA quyết (không chỉ là drift — cần suy nghĩ/đối chiếu EDR)

| # | Câu hỏi cần quyết | Ghi chú |
|---|---|---|
| **Q1** | **Chốt `_event_catalog.md` (14/07) + UC-INT là nguồn sự thật cho hợp đồng tích hợp, PRD §6.9/§6.7 phải cập nhật theo?** | Nếu "có" → phần lớn nhóm A/B/C/E là việc sửa PRD cho khớp. Đây là quyết định nền, cần chốt trước tiên. |
| **Q2** | **Chu kỳ đẩy usage của EDR: 3h hay 24h?** (D-01) | §5.3.7 ghi 24h "cho mọi sản phẩm" (chốt 13/07, M-05); catalog ghi 3h (chốt 14/07, M-07). Hai quyết định ở hai ngày khác nhau cho cùng tham số. Cần EDR/BA chốt lại. |
| **Q3** | **Đường Tạm dừng/Khôi phục qua `tenant.*` + command-ack (NT-1) đã xác nhận với đội EDR chưa?** (C-01) | Danh mục tự đánh dấu NT-1 ⚠️ cần xác nhận. Nếu EDR có action cấp License thật thì mô hình đổi. |
| **Q4** | **Gia hạn là event riêng `subscription.renewed` hay `subscription.created + RENEWAL`?** (A-06) | Ảnh hưởng cách Product Module phân biệt mua mới vs gia hạn. |
| **Q5** | **Envelope: có `subscription_id` + `product_id` riêng, hay chỉ `correlation_id`?** (E-03) | Chốt cấu trúc envelope trước khi Dev code Receiver. |
| **Q6** | **Giả định "có gói EDR không có ân hạn" (để `license.expired` đi thẳng RESTRICTED) — EDR xác nhận?** (B-01) | Nếu EDR luôn đi qua ân hạn thì `license.expired` gần như không bao giờ được gửi. |

---

## 5. Đề xuất thứ tự xử lý (trước khi làm BPMN/wireframe)

1. **Chốt Q1** (nguồn sự thật). Đây là điều kiện cần cho mọi bước sau.
2. **Sửa nhóm F (lỗi đặc tả)** — F-01 (UC-SUB-08 vi phạm observer) và F-02 (bổ sung mô hình kích hoạt). Đây là lỗi độc lập, sửa được ngay không cần chờ EDR.
3. **Đồng bộ nhóm E (envelope)** — chốt tên trường (`event_key`/`payload`), cập nhật PRD §6.7.1 và UC-INT-02. Đây là nền của mọi event.
4. **Đồng bộ nhóm A + B (event key + trạng thái)** — cập nhật PRD §6.9.4/§6.9.6/§6.9.7 và §5.5.1/§5.5.2 theo danh mục; sửa các UC-SUB dùng tên cũ (đặc biệt `license.active` → `license.activated` ở UC-SUB-02).
5. **Chốt Q2 + Q3 + Q4 + Q5 + Q6** (các Open Question cần EDR) — cập nhật D-01, C-01, A-06, E-03, B-01 sau khi có câu trả lời.
6. Sau khi tài liệu thống nhất → **làm BPMN + wireframe + đặc tả chuẩn cho từng UC-INT**.

---

*Ghi chú: bản review này đối chiếu trạng thái tài liệu tại 16/07/2026. Mọi trích dẫn dòng theo PRD `OneCRM_PRD_v2.6.md` và các file FRS tại thời điểm review; nếu tài liệu được sửa, cần chạy lại đối chiếu.*

---

## 6. Trạng thái xử lý (cập nhật 16/07/2026)

> Quyết định nền: **Nguồn sự thật = `_event_catalog.md` (14/07) + UC-INT**; **usage EDR = 3 giờ**.

### Đã đồng bộ ✅

| Mã | Đã sửa ở đâu |
|---|---|
| A-01 | `license.active`→`license.activated` toàn bộ PRD (state machine §5.5.1, date model §5.5.5, M-05 §6.5, EDR §6.9) + UC-SUB-02 |
| A-02 | `usage.report`→`license.usage_synced` (PRD §6.9.7 + các mô tả M-05/M-06/case-study thuộc EDR; **giữ nguyên** C-Shield/AV §6.10/§6.11) |
| A-03/04/05/06 | Outbound keys PRD §6.9.6: `subscription.submitted` / `reactivated` / `terminated` / `renewed` |
| A-07 | `license.grace`→`license.grace_started` (PRD §6.9.7 + case-study) |
| B-01 | `license.expired`→mirror `RESTRICTED` (PRD §6.9.7) |
| B-02/B-03/B-04 | Bổ sung `RESTRICTED` / `REVOKED` / `EXPIRING_SOON` + event `grace_expired`/`revoked`/`expiring_soon` (PRD §6.9.4, §6.9.7, §5.5.2) |
| B-05 | GRACE display "Trong ân hạn" (PRD §6.9.4) |
| C-01 | Đường `tenant.*` command-ack (PRD §6.9.7) |
| D-01 | usage **3h** (PRD §6.9.5, §6.9.9, §5.3.7) |
| E-01/E-02 (wire) | Webhook body §6.7.1 + §6.9.10 dùng `event_key`/`payload` |
| E-03 | Envelope §6.7.1 có `subscription_id` + `product_id` riêng |
| E-04 | UC-INT-02 bước 1 bổ sung `schema_version` |
| F-01 | UC-SUB-08 gỡ mọi chỗ CRM tự ghi `licMirrorStatus = REVOKED`; BR-05 thêm ghi chú observer |

### Còn treo — cần quyết định/thiết kế riêng ⏸

| Mã | Việc còn lại |
|---|---|
| **E-01/E-02 (nội bộ)** | Đổi tên **trường/cột DB** `event_type`→`event_key`, `data`→`payload` ở §5.3.11 OUTBOX_EVENT, §5.3.12 WEBHOOK_INBOX, M-06 Timeline, M-07 FR-INT, case study — **đụng schema DB**, cần quyết định naming-convention toàn dự án (có thể migration). Wire-contract đã đồng bộ, phần này là chuẩn hoá nội bộ. |
| **F-02** | UC-SUB-05 bổ sung mô hình actor kích hoạt (AUTO/PRODUCT_ADMIN/CUSTOMER_SELF/SALES) + bước PENDING_PROVISION→ACTIVE — cần thiết kế, làm trong pha hoàn thiện FRS. |
| **C-01 / B-01 (OQ EDR)** | Vị trí catalog đã áp vào tài liệu kèm nhãn ⚠️; vẫn cần đội EDR xác nhận (mô hình `tenant.*` theo NT-1; giả định "có gói không ân hạn"). |
| Minor | UC-SUB-08 vẫn set `licMirrorExpiry=null`/`lastSync='—'` (trường mirror) — cosmetic, rà lại khi hoàn thiện FRS. |

---

## 7. Cập nhật lần 2 (16/07 — sau khi đội EDR trả lời OQ)

Đội EDR đã xác nhận, làm **thay đổi mô hình** mà bản sync lần 1 (mục 6) vừa áp — đã cập nhật lại toàn bộ catalog + PRD + UC-INT-02:

| Điểm | Giả định lần 1 (14/07) | **EDR xác nhận 16/07** |
|---|---|---|
| Vào ân hạn | `license.grace_started` → GRACE | **`license.expired` → GRACE** (EDR gửi `expired` để báo *vào ân hạn*; **bỏ** `grace_started`; mọi gói đều có ân hạn) |
| Hết hạn (không ân hạn) | `license.expired` → RESTRICTED | **Không tồn tại** — mọi gói EDR đều qua ân hạn |
| Tạm dừng/Khôi phục | `tenant.suspended`/`tenant.reactivated` command-ack | **`license.suspended`/`license.reactivated` mang `correlation_id`** (bỏ hoàn toàn `tenant.*`) |
| `license.suspended` không corr_id | *(không định nghĩa)* | **Tự nhiên** (hết ân hạn không gia hạn) — hợp lệ, không phải bất thường |
| NT-1 | ⚠️ "tenant.* cũng là tín hiệu" (chưa xác nhận) | ✅ Viết lại: mirror do event `license.*` điều khiển; corr_id chỉ ghi nguyên nhân |
| **OQ-INT-08** (sub khi RESTRICTED) | treo 🟠 | ✅ **Chốt: sub giữ ACTIVE** (PA A) — không sang EXPIRED |

**Hệ quả state machine:** vòng đời tự nhiên EDR là `sub ACTIVE → SUSPENDED` (mirror lần lượt ACTIVE → GRACE → RESTRICTED → SUSPENDED); `sub.status` **không đi qua EXPIRED**. Đã cập nhật §5.5.1, §5.5.5, FR-SUB-11 (§6.3.3).

**File đã cập nhật lần 2:** `_event_catalog.md` (NT-1, §3.1/§3.2/§3.3/§4.1, §7 LH-2, OQ-INT-01/08/10), PRD §6.9.4/§6.9.7/§6.9.8 + §5.5.1/§5.5.5 + §6.3.3 + FR-EDR-02 AC + case study, UC-INT-02 (BR-12/13/14 + AC-INT-02-09..12c + self-review + version 1.2).

→ **C-01 và B-01 (OQ EDR) nay đã đóng.** Hai luồng BPMN Suspend/Resume và Hết-hạn/Ân-hạn giờ đã đủ cơ sở để vẽ.
