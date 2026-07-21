# OneCRM — Audit Action Catalog (M-08)

> Chuẩn hóa trường `action` của `AUDIT_LOG` (PRD §5.3.14) thành một **taxonomy ổn
> định, i18n-ready, query-được** — dùng chung cho mọi module. Thay thế các chuỗi
> action tự do đang trôi dạt mỗi nơi một kiểu.

- **Version:** 0.1 (draft) · **Ngày:** 2026-07-17 · **Chủ sở hữu:** BA + Team M-08
- **Liên quan:** [`_event_catalog.md`](integration/_event_catalog.md) (sự kiện tích hợp kích hoạt các action `SYSTEM`), PRD §5.3.14 `AUDIT_LOG`.

---

## 1. Mô hình (design)

Audit action **KHÔNG** lưu chuỗi hiển thị tự do. Mỗi bản ghi audit lưu:

| Trường | Kiểu | Mô tả |
|---|---|---|
| `action_code` | string enum | Định danh hành động, dạng `<entity>.<verb>`. **Machine-stable, language-independent.** Đây là *identity* để filter/report/aggregate. |
| `entity_type` | string enum | Loại đối tượng (khớp `action_code`). Đã có sẵn trong §5.3.14. |
| `actor_type` | enum `USER` \| `SYSTEM` | Người thực hiện hay hệ thống tự động. |
| `source` | enum `UI` \| `WEBHOOK` \| `SCHEDULER` \| `API` | Kênh phát sinh. |

**Display label** (chữ người dùng đọc) được **suy ra tại view-time** từ `action_code`
qua bảng i18n (§6) — muốn đổi câu chữ hay thêm ngôn ngữ chỉ sửa bảng label, **không
đụng dữ liệu đã ghi**.

```
audit row: { action_code:"subscription.suspended", entity_type:"subscription",
             actor_type:"USER", source:"UI", ... }
   render(vi) → "Tạm dừng Subscription"
   render(en) → "Suspended subscription"
```

**Vì sao thiết kế này chuyên nghiệp hơn chuỗi tự do:**
- Ổn định: đổi câu chữ không phá filter/report/test.
- i18n: đa ngôn ngữ không cần migrate dữ liệu.
- Query/aggregate: đếm "bao nhiêu lần `*.deleted`", "mọi action trên `subscription`"… bằng code, không regex chữ.
- Chống trôi dạt: mọi module dùng chung enum; thêm action mới phải qua governance (§8).

---

## 2. Actor & Source — chủ động vs quan sát (YT-3)

OneCRM là passive-observer. Tách rõ 2 nhóm:

- **USER intent** — người trong CRM chủ động thao tác thương mại. Label thể **chủ động** ("Tạm dừng Subscription").
- **SYSTEM observed** — CRM ghi nhận **trạng thái do product báo về** (qua webhook) hoặc cron nội bộ. Label thể **bị động / quan sát** ("License đã kích hoạt"), **không** dùng câu ra lệnh ("Kích hoạt license") để khỏi hiểu nhầm CRM điều khiển kỹ thuật.

---

## 3. Verb taxonomy (động từ chuẩn)

| verb | Nghĩa | Tính chất |
|---|---|---|
| `created` / `updated` / `deleted` | Vòng đời cơ bản của bản ghi | USER |
| `published` / `retired` | Phát hành / ngừng bán (catalog) | USER |
| `approved` | Phê duyệt chuyển bước | USER |
| `renewed` / `suspended` / `resumed` / `revoked` | Vòng đời subscription | USER |
| `reviewed` | Rà soát (không đổi dữ liệu) | USER |
| `synced` | Đồng bộ thủ công (force-sync) | USER |
| `attachment_added` / `attachment_removed` | Đính kèm / gỡ tài liệu | USER |
| `pool_created` | Tạo pool license (reseller) | USER |
| `rotated` | Xoay khóa bảo mật | USER |
| `activated` / `expired` / `suspended` / `graced` | Trạng thái license **do product báo** | SYSTEM |
| `usage_updated` / `usage_high` | Snapshot & cảnh báo mức dùng | SYSTEM |
| `expiry_reminded` | Nhắc sắp hết hạn (scheduler) | SYSTEM |
| `portal_opened` | Mở cổng sản phẩm | USER |

> Lưu ý trùng verb `suspended`: `subscription.suspended` (USER — Sales tạm dừng
> thương mại) **khác** `license.suspended` (SYSTEM — product tạm khóa kỹ thuật).
> Phân biệt bằng `entity_type` + `actor_type`.

---

## 4. Entity taxonomy (đối tượng chuẩn)

| `entity_type` | Label VI | Label EN | Module |
|---|---|---|---|
| `customer` | Khách hàng | Customer | M-01 |
| `contract` | Hợp đồng | Contract | M-02 |
| `pool` | Pool License | License pool | M-02 |
| `attachment` | Tài liệu đính kèm | Attachment | M-02 |
| `subscription` | Subscription | Subscription | M-03 |
| `package` | Gói sản phẩm | Package | M-04 |
| `license` | License | License | M-05 |
| `template` | Mẫu thông báo | Notification template | M-08 |
| `config` | Tham số sản phẩm | Runtime config | M-04/M-07 |
| `secret` | Khóa tích hợp | Integration secret | M-07 |

> `entity_type` giữ nhãn hiển thị nhất quán với app: `Subscription`/`License` để
> tiếng Anh (như sidebar), còn lại tiếng Việt.

---

## 5. Danh mục Action đầy đủ

Cột **Trigger** chỉ có ở action `SYSTEM` — là sự kiện inbound (xem `_event_catalog.md`) làm phát sinh audit.

### M-01 Customer
| `action_code` | Label VI | Label EN | actor | source |
|---|---|---|---|---|
| `customer.created` | Tạo Khách hàng | Created customer | USER | UI |
| `customer.updated` | Cập nhật Khách hàng | Updated customer | USER | UI |
| `customer.deleted` | Xóa Khách hàng | Deleted customer | USER | UI |

### M-02 Contract
| `action_code` | Label VI | Label EN | actor | source |
|---|---|---|---|---|
| `contract.created` | Tạo Hợp đồng | Created contract | USER | UI |
| `contract.updated` | Cập nhật Hợp đồng | Updated contract | USER | UI |
| `contract.deleted` | Xóa Hợp đồng | Deleted contract | USER | UI |
| `contract.pool_created` | Tạo Pool License | Created license pool | USER | UI |
| `contract.attachment_added` | Đính kèm tài liệu | Added attachment | USER | UI |
| `contract.attachment_removed` | Gỡ tài liệu | Removed attachment | USER | UI |

### M-03 Subscription
| `action_code` | Label VI | Label EN | actor | source |
|---|---|---|---|---|
| `subscription.created` | Tạo Subscription | Created subscription | USER | UI |
| `subscription.updated` | Cập nhật Subscription | Updated subscription | USER | UI |
| `subscription.approved` | Phê duyệt Subscription | Approved subscription | USER | UI |
| `subscription.renewed` | Gia hạn Subscription | Renewed subscription | USER | UI |
| `subscription.suspended` | Tạm dừng Subscription | Suspended subscription | USER | UI |
| `subscription.resumed` | Khôi phục Subscription | Resumed subscription | USER | UI |
| `subscription.revoked` | Thu hồi Subscription | Revoked subscription | USER | UI |
| `subscription.reviewed` | Rà soát Subscription | Reviewed subscription | USER | UI |

### M-04 Package / Catalog
| `action_code` | Label VI | Label EN | actor | source |
|---|---|---|---|---|
| `package.created` | Tạo Gói sản phẩm | Created package | USER | UI |
| `package.updated` | Cập nhật Gói sản phẩm | Updated package | USER | UI |
| `package.deleted` | Xóa Gói sản phẩm | Deleted package | USER | UI |
| `package.published` | Phát hành Gói sản phẩm | Published package | USER | UI |
| `package.retired` | Ngừng bán Gói sản phẩm | Retired package | USER | UI |

### M-05 License & Usage
| `action_code` | Label VI | Label EN | actor | source | Trigger (event) |
|---|---|---|---|---|---|
| `license.synced` | Đồng bộ License thủ công | Manually synced license | USER | UI | — |
| `license.portal_opened` | Mở cổng sản phẩm | Opened product portal | USER | UI | — |
| `license.activated` | License đã kích hoạt | License activated | SYSTEM | WEBHOOK | `license.active` |
| `license.expired` | License đã hết hạn | License expired | SYSTEM | WEBHOOK | `license.expired` |
| `license.suspended` | License bị tạm khóa | License suspended | SYSTEM | WEBHOOK | `license.suspended` |
| `license.graced` | License vào ân hạn | License in grace period | SYSTEM | WEBHOOK | `license.grace` |
| `license.usage_updated` | Cập nhật mức sử dụng | Usage updated | SYSTEM | WEBHOOK | `usage.snapshot` |
| `license.usage_high` | Cảnh báo mức sử dụng cao | High usage flagged | SYSTEM | SCHEDULER | — |
| `license.expiry_reminded` | Nhắc sắp hết hạn | Expiry reminder sent | SYSTEM | SCHEDULER | — |

### M-07 Integration / M-08 Settings
| `action_code` | Label VI | Label EN | actor | source |
|---|---|---|---|---|
| `template.updated` | Cập nhật Mẫu thông báo | Updated notification template | USER | UI |
| `config.updated` | Cập nhật Tham số sản phẩm | Updated runtime config | USER | UI |
| `secret.rotated` | Xoay khóa tích hợp | Rotated integration secret | USER | UI |

---

## 6. Bảng label i18n (nguồn sự thật cho display)

Label render theo template. Với action có tham số động (số máy, ngày…), phần định lượng nằm ở `detail`, **không** nhét vào label.

```jsonc
// audit.labels.vi.json  (rút gọn)
{
  "customer.created": "Tạo Khách hàng",
  "subscription.suspended": "Tạm dừng Subscription",
  "license.activated": "License đã kích hoạt",
  "package.retired": "Ngừng bán Gói sản phẩm"
  // ... (đầy đủ theo §5)
}
// audit.labels.en.json → bản EN tương ứng
```

Thiếu key → hiển thị chính `action_code` + cảnh báo log (không crash).

---

## 7. Mapping từ chuỗi cũ → `action_code` (dọn 45 chuỗi loạn)

| Chuỗi cũ (đang dùng ở demo/module) | → `action_code` |
|---|---|
| `Tạo Customer`, `Tạo Customer (Holding)` | `customer.created` |
| `Cập nhật thông tin` (customer) | `customer.updated` |
| `CREATE CONTRACT`, `Tạo HD-2026-…` | `contract.created` |
| `UPDATE signed_date` | `contract.updated` |
| `Xóa Hợp đồng` | `contract.deleted` |
| `CREATE POOL ITEM` | `contract.pool_created` |
| `CREATE SUBSCRIPTION`, `Tạo Subscription (Draft)`, `Tạo Subscription (Gia hạn)`, `EDIT_DRAFT` | `subscription.created` / `subscription.updated` |
| `Phê duyệt Subscription (DRAFT → PENDING_PROVISION)` | `subscription.approved` |
| `RENEW`, `RENEWED`, `Sub chuyển RENEWED` | `subscription.renewed` |
| `SUSPEND`, `Sub chuyển SUSPENDED` | `subscription.suspended` |
| `RESUME` | `subscription.resumed` |
| `Thu hồi Subscription` | `subscription.revoked` |
| `Review Subscription` | `subscription.reviewed` |
| `Phát hành Gói sản phẩm` | `package.published` |
| `Ngừng bán Gói sản phẩm` | `package.retired` |
| `Đồng bộ License thủ công` | `license.synced` |
| `Mở Product portal` | `license.portal_opened` |
| `Sub chuyển ACTIVE` | `license.activated` |
| `Sub chuyển EXPIRED` | `license.expired` |
| `License.suspended event` | `license.suspended` |
| `license.grace event từ EDR` | `license.graced` |
| `Cập nhật license mirror`, `Cập nhật mức sử dụng`, `Usage snapshot cập nhật`, `Yêu cầu cập nhật mức sử dụng` | `license.usage_updated` |
| `Usage alert 90%+` | `license.usage_high` |
| `Alert sắp hết hạn` | `license.expiry_reminded` |

### KHÔNG phải action (đang bị nhét sai field → tách khỏi cột Action)
| Chuỗi | Bản chất |
|---|---|
| `Báo bộ phận vận hành kiểm tra số liệu phía sản phẩm.` | Hướng dẫn xử lý (recommendation/next-step) |
| `Yêu cầu đồng bộ lại; nếu vẫn im lặng thì báo vận hành kiểm tra kết nối.` | Hướng dẫn xử lý |
| `Ghi nhận vi phạm` | Cần làm rõ ngữ cảnh — chưa xếp được, đánh dấu OQ |

---

## 8. Governance — thêm action mới

1. Có nghiệp vụ mới cần audit → chọn `entity` + `verb` (tái dùng verb §3 nếu được).
2. Đặt `action_code = <entity>.<verb>`, thêm dòng vào §5 + key label vi/en §6.
3. Nếu là `SYSTEM`: khai báo `source` + `trigger` (event nào ở `_event_catalog.md`).
4. Không tạo verb mới nếu verb cũ diễn đạt được (chống nở taxonomy).

---

## 9. Open Questions

- **OQ-A1:** `Ghi nhận vi phạm` thuộc nghiệp vụ nào (compliance/usage)? → chưa map được.
- **OQ-A2:** Có cần `subscription.submitted` tách khỏi `subscription.approved` không (2 bước DRAFT→PENDING) hay gộp một?
- **OQ-A3:** Có ghi audit cho `reviewed` (hành động chỉ đọc) không, hay chỉ ghi khi có thay đổi dữ liệu?
