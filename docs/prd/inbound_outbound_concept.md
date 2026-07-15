# Inbound / Outbound Integration Concept — OneCRM × Product Modules

> Tài liệu này mô tả toàn bộ luồng trao đổi sự kiện giữa OneCRM (Commercial CRM) và các Product Module (EDR, C-Shield, AV, CA).
> Nguồn: Sơ đồ kiến trúc Integration v1.0 — phiên bản 09/07/2026.

---

## 1. Tổng quan kiến trúc

OneCRM áp dụng mô hình **Event-Driven Passive Observer** (YT-3):

- **CRM → Product Module (Outbound):** CRM publish event vào Outbox → RabbitMQ. Product Module subscribe và xử lý bất đồng bộ. CRM không gọi API Product trực tiếp.
- **Product Module → CRM (Inbound):** Product Module gửi webhook HMAC-signed về CRM khi trạng thái license thay đổi. CRM xử lý với idempotency key.

```
┌──────────────────────┐     Outbox + RabbitMQ     ┌──────────────────────┐
│   OneCRM (CRM)       │ ──────────────────────►   │   Product Module     │
│   Commercial Layer   │                            │   (EDR / C-Shield /  │
│                      │ ◄──────────────────────    │    AV / CA)          │
└──────────────────────┘     Webhook (HMAC)         └──────────────────────┘
```

---

## 2. Outbound Events — CRM → Product Module

### 2.1 Danh sách event outbound

| # | Nghiệp vụ | Event Key | Trigger | Ghi chú |
|---|---|---|---|---|
| 1 | Xác nhận Subscription | `subscription.submitted` | UC-SUB-05: DRAFT → PENDING_PROVISION | Bắt đầu provisioning mới |
| 2 | Tạm dừng Subscription | `subscription.suspended` | UC-SUB-09: ACTIVE → SUSPENDED | Product Module tạm dừng license kỹ thuật |
| 3 | Khôi phục Subscription | `subscription.reactivated` | UC-SUB-10: SUSPENDED → ACTIVE | Product Module khôi phục license kỹ thuật |
| 4 | Thu hồi Subscription | `subscription.terminated` | UC-SUB-08: any → REVOKED | Product Module đình chỉ license vĩnh viễn |
| 5 | Gia hạn Subscription | `subscription.renewed` | UC-SUB-07: predecessor → RENEWED, new → ACTIVE | Product Module tạo license mới, đánh dấu cũ là Renewed |

### 2.2 Payload schema — `subscription.submitted` và `subscription.renewed`

```json
{
  "event_key": "subscription.submitted | subscription.renewed",
  "subscription_id": "SUB-2026-001",
  "previous_subscription_id": "SUB-2025-090",   // chỉ có trong subscription.renewed
  "customer": {
    "customer_id": "CUS-001",
    "contract_id": "CON-2024-001",
    "contract_phone": "0901234567",
    "contract_email": "contact@fpt.com"
  },
  "package": {
    "package_id": "PKG-EDR-PRO",
    "package_tier": "PRO",
    "structure_mode": "SINGLE_ORG | MULTI_ORG",
    "product_module_config": { ... },
    "license_qty": 500
  },
  "admin": {
    "admin_name": "Nguyễn Văn A",
    "email_admin": "admin@fpt.com",
    "admin_username": "admin.fpt"
  }
}
```

### 2.3 EDR xử lý khi nhận các outbound event

| Event nhận | Hành động của EDR | Event gửi lại CRM (Inbound) |
|---|---|---|
| `subscription.submitted` | Create Tenant → Create Tenant License → Create Tenant Admin → Create Org (nếu SINGLE_ORG) → Create Org License → Create Org Admin | `license.pending` |
| `subscription.suspended` | Suspend Tenant (kỹ thuật) | `tenant.suspended` |
| `subscription.reactivated` | Reactivate Tenant (kỹ thuật) | `tenant.reactivated` |
| `subscription.terminated` | Suspend License vĩnh viễn (Revoke) | `tenant.terminated` |
| `subscription.renewed` | Tạo Tenant License mới → Tạo Org License mới → Update Tenant/Org License cũ thành "Renewed" | `license.renewed` (bản ghi cũ) + `license.activated` (bản ghi mới) |

---

## 3. Inbound Events — Product Module → CRM

### 3.1 EDR Inbound

#### 3.1.1 License Status Updates (onEvent)

| Event Key | Trigger | CRM xử lý |
|---|---|---|
| `license.pending` | EDR vừa nhận subscription.submitted, khởi tạo xong Tenant | Update `license_mirror.status = PENDING`, `last_synced_at` |
| `license.provisioning` | EDR đang provisioning license | Update `license_mirror.status = PROVISIONING`, `last_synced_at` |
| `license.activated` | License kích hoạt thành công | Update `license_mirror.status = ACTIVE`, `last_synced_at`; Update `sub.activation_date` và `sub.end_date` (= `license_mirror.expiration_date`); **Update `sub.status = ACTIVE`** |
| `license.expiring_soon` | License sắp hết hạn (ngưỡng cấu hình) | Update `license_mirror.status = EXPIRING_SOON`, `last_synced_at` |
| `license.expired` | License đã hết hạn | Update `license_mirror.status = EXPIRED`, `last_synced_at` |
| `license.grace_expired` | Grace period kết thúc | Update `license_mirror.status = GRACE_EXPIRED`, `last_synced_at` |
| `license.suspended` | License bị tạm dừng kỹ thuật phía Product | Update `license_mirror.status = SUSPENDED`, `last_synced_at`; **Update `sub.status = SUSPENDED`** |
| `license.renewed` | License cũ được đánh dấu Renewed (sau renewal) | Update `license_mirror.status = RENEWED`, `last_synced_at`; Update `activation_date` và `expiration_date` của License Mirror |

#### 3.1.2 Tenant Status Updates (onEvent)

| Event Key | Trigger | CRM xử lý |
|---|---|---|
| `tenant.suspended` | EDR tạm dừng Tenant (sau `subscription.suspended`) | Ghi nhận nội bộ, cập nhật audit |
| `tenant.reactivated` | EDR khôi phục Tenant (sau `subscription.reactivated`) | Ghi nhận nội bộ, cập nhật audit |
| `tenant.terminated` | EDR đình chỉ license (sau `subscription.terminated`) | Ghi nhận nội bộ, cập nhật audit |

#### 3.1.3 Usage Sync (onSchedule)

| Event Key | Lịch | CRM xử lý |
|---|---|---|
| `license.usage_synced` | Mỗi 3 giờ *(sửa 14/07/2026 — chốt lại từ 1 giờ, xem [Phụ lục A §3.2](../frs/integration/_event_catalog.md))* | Update `license_mirror.used_seats` |

### 3.2 C-Shield Inbound

| Event Key | Ý nghĩa |
|---|---|
| `subscription.provisioning.pending` | Đang chờ provisioning |
| `subscription.provisioning.done` | Provisioning hoàn thành |
| `subscription.provisioning.failed` | Provisioning thất bại |
| `license.usage_synced` | Đồng bộ usage mỗi 3 giờ *(sửa 14/07/2026 — chốt lại từ 1 giờ)* |

### 3.3 AV Inbound

Tương tự C-Shield — cùng event pattern:
- `subscription.provisioning.pending`
- `subscription.provisioning.done`
- `subscription.provisioning.failed`
- `license.usage_synced` (3h interval — sửa 14/07/2026, chốt lại từ 1h)

---

## 4. Quy tắc chung

### 4.1 Outbox pattern (Outbound)

- CRM ghi event vào bảng `outbox_events` trong cùng DB transaction với thay đổi nghiệp vụ.
- Background worker đọc outbox và publish lên RabbitMQ.
- Đảm bảo **at-least-once delivery**. Product Module xử lý idempotency.

### 4.2 Webhook (Inbound)

- Product Module gửi webhook POST đến CRM endpoint.
- CRM verify chữ ký HMAC-SHA256.
- CRM xử lý idempotency theo `event_id` — bỏ qua event đã xử lý trước đó.
- CRM không blocking — trả về 200 OK ngay, xử lý bất đồng bộ.

### 4.3 Mismatch detection (FR-LIC-07)

- Nếu `sub.status` lệch `license_mirror.status` quá ngưỡng SLA (`mismatch_sla_minutes`, default 15 phút) → alert Ops.
- CRM không tự sửa mismatch — chỉ cảnh báo.
- Trường hợp hợp lệ: `sub.status = ACTIVE` + `license_mirror.status = GRACE` (KH vẫn dùng trong grace period).

---

## 5. Lịch sử

| Phiên bản | Ngày | Ghi chú |
|---|---|---|
| 1.0 | 09/07/2026 | Tạo mới — trích xuất từ sơ đồ kiến trúc Integration |
