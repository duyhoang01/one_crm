# OneCRM — Ma trận truy vết (Traceability Matrix)

> Truy vết **UC ↔ FRS ↔ demo ↔ trạng thái** cho toàn bộ dự án. Bản đồ tổng: [`README.md`](README.md). Chú giải trạng thái: ✅ đặc tả xong · 🟡 draft v1.0 · 📄 chỉ PRD · ⏳ skeleton/phase sau.
>
> **Ánh xạ FR ↔ UC chi tiết** nằm trong PRD §6.x.2 ("Danh sách FRS") của từng module; bảng dưới trỏ tới file FRS là nguồn chốt hành vi.

---

## M-01 Customer Management — CUS
PRD §6.1 · Demo `demo/v2.2.x_customers.html` · Assets `assets/M-01_customers/` · FR: `FR-CUS-*` (PRD §6.1.2)

| UC | Tên | FRS | Trạng thái |
|---|---|---|---|
| UC-CUS-01 | Danh sách khách hàng | [file](frs/customers/UC-CUS-01_list_customer.md) | ✅ |
| UC-CUS-02 | Tạo khách hàng | [file](frs/customers/UC-CUS-02_create_customer.md) | ✅ |
| UC-CUS-03 | Xem chi tiết khách hàng (360°) | [file](frs/customers/UC-CUS-03_view_customer.md) | ✅ |
| UC-CUS-04 | Cập nhật khách hàng | [file](frs/customers/UC-CUS-04_update_customer.md) | ✅ |
| UC-CUS-05 | Xóa khách hàng | [file](frs/customers/UC-CUS-05_delete_customer.md) | ✅ |

## M-02 Contract Management — CON
PRD §6.2 · Demo `demo/v2.3.2_contracts.html` · Assets `assets/M-02_contracts/` · FR: `FR-CON-*` (PRD §6.2.2)

| UC | Tên | FRS | Trạng thái |
|---|---|---|---|
| UC-CON-01 | Danh sách hợp đồng | [file](frs/contracts/UC-CON-01_list_contract.md) | ✅ |
| UC-CON-02 | Tạo hợp đồng | [file](frs/contracts/UC-CON-02_create_contract.md) | ✅ |
| UC-CON-03 | Xem chi tiết hợp đồng | [file](frs/contracts/UC-CON-03_view_contract.md) | ✅ |
| UC-CON-04 | Cập nhật hợp đồng | [file](frs/contracts/UC-CON-04_update_contract.md) | ✅ |
| UC-CON-05 | Quản lý đính kèm | [file](frs/contracts/UC-CON-05_manage_attachment.md) | ✅ |
| UC-CON-06 | Xóa hợp đồng | [file](frs/contracts/UC-CON-06_delete_contract.md) | ✅ |

## M-03 Subscription Management — SUB
PRD §6.3 · Demo `demo/v2.4.0_subscriptions.html` · Assets `assets/M-03_subscriptions/` · FR: `FR-SUB-*` (PRD §6.3.2; + FR-SUB-11 auto-transition)

| UC | Tên | FRS | Trạng thái |
|---|---|---|---|
| UC-SUB-01 | Danh sách Subscription | [file](frs/subscriptions/UC-SUB-01_list_subscription.md) | ✅ |
| UC-SUB-02 | Tạo Subscription | [file](frs/subscriptions/UC-SUB-02_create_subscription.md) | ✅ |
| UC-SUB-03 | Chi tiết Subscription | [file](frs/subscriptions/UC-SUB-03_detail_subscription.md) | ✅ |
| UC-SUB-04 | Chỉnh sửa Subscription | [file](frs/subscriptions/UC-SUB-04_edit_subscription.md) | ✅ |
| UC-SUB-05 | Xác nhận Subscription | [file](frs/subscriptions/UC-SUB-05_approve_subscription.md) | ✅ |
| UC-SUB-06 | Xóa Subscription Draft | [file](frs/subscriptions/UC-SUB-06_delete_draft_subscription.md) | ✅ |
| UC-SUB-07 | Gia hạn Subscription | [file](frs/subscriptions/UC-SUB-07_renew_subscription.md) | ✅ |
| UC-SUB-08 | Thu hồi Subscription | [file](frs/subscriptions/UC-SUB-08_revoke_subscription.md) | ✅ |
| UC-SUB-09 | Tạm dừng Subscription | [file](frs/subscriptions/UC-SUB-09_suspend_subscription.md) | ✅ |
| UC-SUB-10 | Khôi phục Subscription | [file](frs/subscriptions/UC-SUB-10_resume_subscription.md) | ✅ |

## M-04 Product & Package Catalog — CAT
PRD §6.4 · Demo `demo/v2.5.0_catalog.html` · Assets `assets/M-04_catalog/` · FR: `FR-CAT-*` (PRD §6.4.2)

| UC | Tên | FRS | Trạng thái |
|---|---|---|---|
| UC-CAT-01 | Danh sách Sản phẩm (Product Kanban) | [file](frs/catalog/UC-CAT-01_product_kanban.md) | ✅ |
| UC-CAT-02 | Chi tiết Sản phẩm | [file](frs/catalog/UC-CAT-02_product_detail.md) | ✅ |
| UC-CAT-03 | Danh sách Gói sản phẩm (Package List) | [file](frs/catalog/UC-CAT-03_package_list.md) | ✅ |
| UC-CAT-04 | Chi tiết Gói sản phẩm | [file](frs/catalog/UC-CAT-04_package_detail.md) | ✅ |
| UC-CAT-05 | Tạo Gói sản phẩm | [file](frs/catalog/UC-CAT-05_create_package.md) | ✅ |
| UC-CAT-06 | Sửa Gói sản phẩm (clone-on-edit) | [file](frs/catalog/UC-CAT-06_edit_package.md) | ✅ |
| UC-CAT-07 | Quản lý vòng đời Gói sản phẩm | [file](frs/catalog/UC-CAT-07_package_lifecycle.md) | ✅ |

## M-05 License Mirror & Usage Tracking — LIC
PRD §6.5 · Demo `demo/v2.6.0_license.html` · Assets `assets/M-05_licenses/` · FR: `FR-LIC-*` (PRD §6.5.2–6.5.8)

| UC | Tên | FRS | Trạng thái |
|---|---|---|---|
| UC-LIC-01 | Danh sách License & Usage | [file](frs/licenses/UC-LIC-01_list_license_usage.md) | ✅ |
| UC-LIC-02 | Xem chi tiết License | [file](frs/licenses/UC-LIC-02_view_license_detail.md) | ✅ |
| UC-LIC-03 | Đồng bộ lại mức sử dụng (Force Sync) | [file](frs/licenses/UC-LIC-03_force_sync_usage.md) | ✅ |
| UC-LIC-04 | Phát hiện & cảnh báo sự cố license | [file](frs/licenses/UC-LIC-04_detect_license_issues.md) | ✅ |

## M-06 Provisioning Timeline — EVT
PRD §6.6 · Không tách FRS riêng (dòng thời gian nhúng trong 360° KH/Sub) · FR: `FR-EVT-01..03`

| UC | Tên | Nguồn | Trạng thái |
|---|---|---|---|
| FR-EVT-01 | Xem Timeline của Subscription | PRD §6.6.2 | 📄 |
| FR-EVT-02 | System Append Event (từ webhook) | PRD §6.6.3 | 📄 |
| FR-EVT-03 | Tra cứu Timeline (cross-sub) | PRD §6.6.4 | 📄 |

## M-07 Integration Layer — INT
PRD §6.7 · Demo `demo/v2.7.0_integration.html` · Assets `assets/M-07_integration/` · Danh mục sự kiện: [`_event_catalog.md`](frs/integration/_event_catalog.md)

| UC | Tên | FR (PRD) | FRS | BPMN | Trạng thái |
|---|---|---|---|---|---|
| UC-INT-01 | Phát hành sự kiện ra sản phẩm (Outbound) | FR-INT-01, 02 | [file](frs/integration/UC-INT-01_publish_outbound_event.md) | ✅ §2 | ✅ |
| UC-INT-02 | Tiếp nhận & xử lý sự kiện từ sản phẩm (Inbound) | FR-INT-03, 04 | [file](frs/integration/UC-INT-02_receive_inbound_event.md) | ✅ §2 | ✅ |
| UC-INT-03 | Xem tình trạng kết nối | FR-INT-07 | [file](frs/integration/UC-INT-03_view_channel_health.md) | ✅ §2 | ✅ |
| UC-INT-04 | Sự kiện gửi đi & Gửi lại lệnh | FR-INT-05, 06 | [file](frs/integration/UC-INT-04_outbox_and_retry.md) | ✅ §2 | ✅ |
| UC-INT-05 | Sự kiện nhận về & Xử lý lại theo chuỗi | FR-INT-05, 06 | [file](frs/integration/UC-INT-05_inbox_and_replay.md) | ✅ §2 | ✅ |
| UC-INT-06 | Tra cứu theo subscription | FR-INT-05 | [file](frs/integration/UC-INT-06_trace_by_subscription.md) | ✅ §2 | ✅ |

## M-08 Audit & Notification — AUD / NOT
PRD §6.8 · Demo `demo/v2.8.0_audit_notification.html` · Assets `assets/M-08_audit_notification/` · FR: `FR-AUD-*` / `FR-NOT-*` (PRD §6.8)

| UC | Tên | FRS | Trạng thái |
|---|---|---|---|
| UC-AUD-01 | Tra cứu Audit log | [file](frs/audit_notification/UC-AUD-01_search_audit_log.md) | 🟡 |
| UC-NOT-01 | Hộp thư & thông báo trong ứng dụng | [file](frs/audit_notification/UC-NOT-01_inbox_and_bell.md) | 🟡 |
| UC-NOT-02 | Lịch nhắc gia hạn tự động | [file](frs/audit_notification/UC-NOT-02_renewal_scheduler.md) | 🟡 |
| UC-NOT-03 | Lịch sử gửi thông báo | [file](frs/audit_notification/UC-NOT-03_send_history.md) | 🟡 |

## Cấu hình (Settings) — SET / USR
Menu gom, **không phải module riêng** · FRS `frs/settings/` · Assets `assets/settings/`

| UC | Tên | Nội dung thuộc | FRS | Trạng thái |
|---|---|---|---|---|
| UC-SET-01 | Quản lý mẫu thông báo | M-08 | [file](frs/settings/UC-SET-01_manage_notification_templates.md) | 🟡 |
| UC-SET-02 | Cấu hình tham số theo sản phẩm | M-04 / M-07 (Product Module) | [file](frs/settings/UC-SET-02_product_runtime_config.md) | 🟡 |
| UC-SET-03 | Bảo mật tích hợp (xoay khóa) | M-07 | [file](frs/settings/UC-SET-03_integration_secret_rotation.md) | 🟡 |
| UC-USR-01 | Người dùng & phân quyền | Nền tảng (`USER_PROFILE`, Phase 2+ skeleton) | [file](frs/settings/UC-USR-01_view_users_and_permissions.md) | 🟡 |

## Product Modules — PM
| Module | FR / nội dung | Nguồn | Trạng thái |
|---|---|---|---|
| PM-01 EDR | Full functional (Phase 2) | PRD §6.9 (FR-EDR-01..03 + 8 section khai báo) | ✅ đặc tả (triển khai Phase 2) |
| PM-02 C-Shield | Declaration skeleton | PRD §6.10 | ⏳ Phase 3 |
| PM-03 AV | Declaration skeleton | PRD §6.11 | ⏳ Phase 4 |

---

*Cập nhật: 21/07/2026. Trạng thái phản ánh mức đặc tả FRS tại thời điểm cập nhật; chi tiết BR/AC/luồng xem file FRS tương ứng.*
