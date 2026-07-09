# UC-SUB-05 — Xác nhận Subscription

> Module: M-03 Subscription Management | Phiên bản: 1.0 | Ngày: 09/07/2026
> Trạng thái: Draft for Review

---

## 1. Thông tin chung

| Thuộc tính | Nội dung |
|---|---|
| **Mã Use Case** | UC-SUB-05 |
| **Tên** | Xác nhận Subscription |
| **Mô tả** | Sales / CSKH / License Admin / Manager xác nhận một subscription đang ở trạng thái DRAFT để đẩy vào quy trình provisioning. Hệ thống chuyển trạng thái sang `PENDING_PROVISION` và publish event `subscription.created` qua Outbox. |
| **Tác nhân** | Sales, CSKH, License Admin, Manager |
| **Tiền điều kiện** | (1) Đã đăng nhập; có quyền `subscription:approve`. (2) Subscription tồn tại và `sub.status = DRAFT`. |
| **Hậu điều kiện** | (Thành công) `sub.status` chuyển thành `PENDING_PROVISION`. Timeline và Audit ghi nhận sự kiện. Hệ thống publish event `subscription.created` qua Outbox. (Thất bại) Trạng thái không thay đổi. |
| **Trigger** | User click "✅ Xác nhận" trong hero section của UC-SUB-03. |
| **Liên kết** | UC-SUB-01 (Danh sách), UC-SUB-03 (Chi tiết — quay lại sau khi xác nhận) |

### Business Rules

| Mã | Nội dung |
|---|---|
| **BR-01** | Chỉ subscription có `sub.status = DRAFT` mới có thể xác nhận. Nút "✅ Xác nhận" chỉ hiển thị khi `sub.status = DRAFT`. |
| **BR-02** | Các actor có quyền xác nhận: Sales, CSKH, License Admin, Manager (bất kỳ ai trong các role này đã đăng nhập). |
| **BR-03** | Sau khi xác nhận: `sub.status = PENDING_PROVISION`. |
| **BR-04** | System publish event `subscription.created` qua Outbox → Product Module nhận và bắt đầu provisioning. |
| **BR-05** | Hệ thống ghi timeline entry: icon 📤, nội dung "Subscription được phê duyệt & gửi provisioning", mô tả trạng thái `DRAFT → PENDING_PROVISION · Sự kiện subscription.created đã publish`. |
| **BR-06** | Hệ thống ghi audit entry: action `Phê duyệt Subscription (DRAFT → PENDING_PROVISION)`, detail `Gửi yêu cầu provisioning tới hệ thống product`, result `SUCCESS`. |
| **BR-07** | Modal xác nhận hiển thị tóm tắt thông tin sub (Mã Sub, Khách hàng, Gói, Hợp đồng) để người dùng review trước khi confirm. Với hợp đồng RESELLER, bổ sung dòng Đơn vị thụ hưởng. |
| **BR-08** | Sau khi xác nhận thành công: hero section và tab Thông tin chung được cập nhật ngay lập tức (không cần reload trang). |

---

## 2. Luồng nghiệp vụ

### 2.1 Luồng chính

| Bước | Tác nhân | Hành động | Ghi chú |
|---|---|---|---|
| 1 | Sales / CSKH / License Admin / Manager | Click "✅ Xác nhận" từ hero section UC-SUB-03. | Nút chỉ hiển thị khi `sub.status = DRAFT` — BR-01. |
| 2 | System | Kiểm tra `sub.status`. | — |
| — | — | [Gateway: sub tồn tại VÀ `sub.status = DRAFT`?] | — |
| — | — | → Không hợp lệ: chuyển sang **EF-01**. | — |
| — | — | → Hợp lệ: tiếp tục bước 3. | — |
| 3 | System | Mở modal "Xác nhận Subscription" với tóm tắt thông tin: Mã Sub, Khách hàng (+ Đơn vị thụ hưởng nếu RESELLER), Gói + số license, Hợp đồng. | BR-07 |
| 4 | Sales / CSKH / License Admin / Manager | Review thông tin trong modal. | — |
| — | — | [Gateway: người dùng quyết định?] | — |
| — | — | → Nhấn "Hủy" hoặc click ngoài modal: chuyển sang **AF-01**. | — |
| — | — | → Nhấn "✅ Xác nhận": tiếp tục bước 5. | — |
| 5 | System | Chuyển `sub.status = PENDING_PROVISION`. | BR-03 |
| 6 | System | Ghi timeline entry (BR-05) và audit entry (BR-06). | BR-05, BR-06 |
| 7 | System | Publish event `subscription.created` qua Outbox. | BR-04 |
| 8 | System | Đóng modal, hiển thị toast thành công "Đã phê duyệt — trạng thái chuyển sang PENDING_PROVISION". | — |
| 9 | System | Cập nhật hero section và tab Thông tin chung với trạng thái mới (không reload trang). | BR-08 |

### 2.2 Luồng phụ

#### AF-01 — Người dùng hủy modal

| Bước | Tác nhân | Hành động |
|---|---|---|
| 1 | Sales / CSKH / License Admin / Manager | Nhấn "Hủy" hoặc click ra ngoài vùng modal. |
| 2 | System | Đóng modal. Không thay đổi dữ liệu. |
| 3 | — | Quay lại màn UC-SUB-03 với trạng thái sub không đổi. |

### 2.3 Luồng ngoại lệ

#### EF-01 — Sub không tồn tại hoặc không phải DRAFT

| Bước | Tác nhân | Hành động |
|---|---|---|
| 1 | System | Phát hiện sub không tồn tại hoặc `sub.status ≠ DRAFT` tại thời điểm click. |
| 2 | System | Đóng modal (nếu đã mở). Hiển thị toast error "Subscription không thể xác nhận". |
| 3 | System | Không thay đổi dữ liệu. Trạng thái sub giữ nguyên. |

---

## 3. Mô tả giao diện

### 3.1 Wireframe

> **Demo HTML:** [docs/demo/v2.4.0_subscriptions.html](../../demo/v2.4.0_subscriptions.html)
> **Hàm demo:** `subOpenApproveDraft(id)`, `subConfirmApproveDraft()`

Modal "Xác nhận Subscription" xuất hiện từ hero section của màn UC-SUB-03 khi user click "✅ Xác nhận":

```
┌─ Xác nhận Subscription ───────────────────────────────────┐
│                                                             │
│  ┌── Thông tin subscription ────────────────────────────┐  │
│  │  Mã Subscription:  SUB-2026-001                      │  │
│  │  Khách hàng:       FPT Software                      │  │
│  │  Gói:              EDR Pro · 500 license             │  │
│  │  Hợp đồng:         HĐ-2024-001                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ⚠ Sau khi xác nhận, subscription sẽ được gửi đến hệ      │
│    thống sản phẩm để khởi tạo license.                     │
│                                                             │
│              [Hủy]          [✅ Xác nhận]                  │
└─────────────────────────────────────────────────────────────┘
```

*Lưu ý: Với hợp đồng RESELLER, bổ sung dòng "Đơn vị thụ hưởng" trong bảng thông tin subscription.*

**Screenshot — Modal Gửi Subscription đi (Phê duyệt):**

![Phê duyệt Subscription — modal xác nhận](../../assets/M-03_subscriptions/UC-SUB-05_screen_modal_approve.png)

### 3.2 Thành phần UI

| Component | Mô tả |
|---|---|
| Modal header | Tiêu đề "Xác nhận Subscription" + nút ✕ đóng modal. |
| Bảng thông tin summary | Hiển thị readonly 4 dòng (DIRECT) hoặc 5 dòng (RESELLER). Nền xám nhạt, border-radius `r-sm`. |
| Cảnh báo | Icon ⚠ màu cam + text giải thích hậu quả của hành động. |
| Nút "Hủy" | Ghost button, căn trái trong footer. Thực hiện AF-01. |
| Nút "✅ Xác nhận" | Primary button, căn phải trong footer. Thực hiện bước 5–9 luồng chính. |
| Toast thành công | Hiển thị sau khi đóng modal: "Đã phê duyệt — trạng thái chuyển sang PENDING_PROVISION". |
| Toast lỗi | Hiển thị khi EF-01: "Subscription không thể xác nhận". |

### 3.3 Bảng field hiển thị trong modal

| # | Field | Nguồn dữ liệu | Hiển thị theo loại HĐ |
|---|---|---|---|
| 1 | Mã Subscription | `sub.id` | DIRECT + RESELLER |
| 2 | Khách hàng | `sub.customerName` | DIRECT + RESELLER |
| 3 | Đơn vị thụ hưởng | `sub.beneficiaryName` | Chỉ RESELLER |
| 4 | Gói | `sub.packageName` + `sub.licenseQty / sub.deviceQty` | DIRECT: "{tên gói} · {N} thiết bị". RESELLER: "{tên gói} · {N} license". |
| 5 | Hợp đồng | `sub.contractCode` | DIRECT + RESELLER |

*Tất cả field là readonly — không có input nhập liệu trong modal này.*

---

## 4. Acceptance Criteria

### Nhóm 1: Điều kiện hiển thị nút

| Mã | Given | When | Then |
|---|---|---|---|
| AC-SUB-05-01 | Sub có `status = DRAFT`. | Xem hero section UC-SUB-03. | Nút "✅ Xác nhận" hiển thị và active. |
| AC-SUB-05-02 | Sub có `status = ACTIVE`. | Xem hero section UC-SUB-03. | Nút "✅ Xác nhận" không hiển thị. |
| AC-SUB-05-03 | Sub có `status = PENDING_PROVISION`. | Xem hero section UC-SUB-03. | Nút "✅ Xác nhận" không hiển thị. |
| AC-SUB-05-04 | User đăng nhập với role Sales (hoặc CSKH, License Admin, Manager), sub có `status = DRAFT`. | Xem hero section UC-SUB-03. | Nút "✅ Xác nhận" hiển thị và active cho tất cả các role trên. |

### Nhóm 2: Modal hiển thị đúng thông tin

| Mã | Given | When | Then |
|---|---|---|---|
| AC-SUB-05-05 | Sub DIRECT: mã "SUB-2026-001", khách hàng "FPT Software", gói "EDR Pro · 200 thiết bị", hợp đồng "HĐ-2024-001". | Click "✅ Xác nhận". | Modal mở, hiển thị đúng 4 dòng thông tin. Không có dòng Đơn vị thụ hưởng. |
| AC-SUB-05-06 | Sub RESELLER có `beneficiaryName = "Mekong Foods"`. | Click "✅ Xác nhận". | Modal mở, hiển thị 5 dòng thông tin bao gồm "Đơn vị thụ hưởng: Mekong Foods". |
| AC-SUB-05-07 | Modal đang mở. | Nhấn "Hủy". | Modal đóng. `sub.status` vẫn là DRAFT. Không có toast. |
| AC-SUB-05-08 | Modal đang mở. | Click ra ngoài vùng modal. | Modal đóng. `sub.status` vẫn là DRAFT. |

### Nhóm 3: Xác nhận thành công

| Mã | Given | When | Then |
|---|---|---|---|
| AC-SUB-05-09 | Sub có `status = DRAFT`. | Click "✅ Xác nhận" trong modal. | `sub.status` chuyển thành `PENDING_PROVISION`. |
| AC-SUB-05-10 | Xác nhận thành công. | Sau khi modal đóng. | Toast hiển thị: "Đã phê duyệt — trạng thái chuyển sang PENDING_PROVISION". |
| AC-SUB-05-11 | Xác nhận thành công. | Xem tab Timeline UC-SUB-03. | Có entry mới nhất: icon 📤, "Subscription được phê duyệt & gửi provisioning", mô tả "DRAFT → PENDING_PROVISION · Sự kiện subscription.created đã publish". |
| AC-SUB-05-12 | Xác nhận thành công. | Xem tab Audit Log UC-SUB-03. | Có entry: action "Phê duyệt Subscription (DRAFT → PENDING_PROVISION)", detail "Gửi yêu cầu provisioning tới hệ thống product", result "SUCCESS". |
| AC-SUB-05-13 | Xác nhận thành công. | Xem hero section UC-SUB-03 (không reload trang). | Badge trạng thái hiển thị "Chờ kích hoạt" (PENDING_PROVISION). Nút "✅ Xác nhận" không còn hiển thị. |

### Nhóm 4: Luồng ngoại lệ

| Mã | Given | When | Then |
|---|---|---|---|
| AC-SUB-05-14 | Sub đã được xác nhận bởi người dùng khác (race condition, `status ≠ DRAFT`) trong khi modal đang mở. | Nhấn "✅ Xác nhận" trong modal. | Toast error "Subscription không thể xác nhận". Modal đóng. `sub.status` không thay đổi. |

---

## 5. Lịch sử thay đổi

| Phiên bản | Ngày | Tác giả | Mô tả |
|---|---|---|---|
| 1.0 | 09/07/2026 | BA Team | Khởi tạo tài liệu — Draft for Review. |
