# UC-CON-06 — Xóa Hợp đồng

> Module: M-02 Contract Management | Phiên bản: 1.0 | Ngày: 06/07/2026
> Trạng thái: Draft for Review

---

## 1. Thông tin chung

| Thuộc tính | Nội dung |
|---|---|
| **Tên chức năng** | Xóa Hợp đồng |
| **UC ID** | UC-CON-06 |
| **Mô tả** | Sales xóa vĩnh viễn một hợp đồng khỏi hệ thống. Thao tác yêu cầu nhập lý do xóa bắt buộc và xác nhận. Xóa là permanent — không thể khôi phục. |
| **Tác nhân** | Sales (có quyền `contract:delete`) |
| **Tiền điều kiện** | Đã đăng nhập, có quyền `contract:delete`. Hợp đồng tồn tại và chưa bị xóa. |
| **Hậu điều kiện** | (Success) Hợp đồng bị xóa vĩnh viễn khỏi DB. Audit log ghi nhận actor, timestamp, lý do xóa. Sales được redirect về Danh sách Hợp đồng với toast thành công. (Failure) Không có dữ liệu nào bị xóa. Hợp đồng vẫn tồn tại nguyên vẹn. |
| **Ngoại lệ** | Hợp đồng có subscription ACTIVE → chặn xóa, hiển thị cảnh báo. |
| **Quy tắc nghiệp vụ** | BR-01: Xóa là permanent (hard delete) — không dùng soft delete như Customer. BR-02: Bắt buộc nhập lý do xóa (≥10 ký tự). Nút "Xóa" bị disabled cho đến khi có lý do hợp lệ. BR-03: Audit log bắt buộc — nếu không ghi được thì rollback, không xóa hợp đồng. BR-04: Hợp đồng có subscription ACTIVE bị chặn xóa — Sales phải terminate/cancel tất cả sub trước. |

---

## 2. Luồng nghiệp vụ

### 2.1 Luồng chính

| Bước | Actor | Hành động / Phản hồi |
|---|---|---|
| **1** | Sales | Nhấn nút **"🗑 Xóa"** trên trang Chi tiết Hợp đồng (UC-CON-03), hoặc nhấn icon xóa trong cột Thao tác của Danh sách (UC-CON-01). |
| **2** | System | Kiểm tra điều kiện: hợp đồng có subscription ACTIVE không? |
| **2a** | System | **[Có sub ACTIVE]** → EF-01. **[Không có]** → tiếp bước 3. |
| **3** | System | Mở modal xác nhận xóa. Hiển thị: thông tin tóm tắt hợp đồng (mã HĐ, tên KH, loại, ngày ký, số sub), cảnh báo "Hành động không thể hoàn tác". Nút "Xóa" disabled. |
| **4** | Sales | Nhập lý do xóa vào textarea. |
| **5** | System | Khi lý do ≥10 ký tự → enable nút **"Xóa"**. |
| **6** | Sales | Nhấn **"Xóa"**. |
| **7** | System | Xóa vĩnh viễn hợp đồng, ghi Audit Log (actor, timestamp, lý do). |
| **8** | System | Đóng modal. Redirect về Danh sách Hợp đồng. Hiển thị toast *"Đã xóa hợp đồng [mã HĐ]"*. |

### 2.2 Luồng phụ

**[AF-01: Sales hủy xóa]** — kích hoạt tại bước 3, 4 hoặc 5.

| Bước | Actor | Hành động / Phản hồi |
|---|---|---|
| **Nx** | Sales | Nhấn **"Hủy"** hoặc nhấn **"✕"** hoặc nhấn **ESC**. |
| **Nx+1** | System | Đóng modal. Không xóa dữ liệu. Giữ nguyên trang hiện tại (Chi tiết hoặc Danh sách). |

### 2.3 Luồng ngoại lệ

**[EF-01: Hợp đồng có subscription ACTIVE]** — kích hoạt tại bước 2a.

| Bước | Actor | Hành động / Phản hồi |
|---|---|---|
| **2b** | System | Mở modal cảnh báo (không phải modal xóa): *"Không thể xóa hợp đồng đang có [N] subscription Active. Vui lòng kết thúc tất cả subscription trước."* Hiển thị danh sách tên các sub đang ACTIVE. Chỉ có nút "Đóng". |

**[EF-02: Lỗi hệ thống khi xóa]** — kích hoạt tại bước 7 nếu DB/audit log thất bại.

| Bước | Actor | Hành động / Phản hồi |
|---|---|---|
| **7a** | System | Rollback toàn bộ. Hiển thị toast lỗi: *"Xóa thất bại. Vui lòng thử lại."* Đóng modal. Hợp đồng vẫn tồn tại. |

---

## 3. Mô tả giao diện

### 3.1 Wireframe — Modal xác nhận xóa

```
┌──────────────────────────────────────────┐
│  Xóa Hợp đồng                      [✕]  │
├──────────────────────────────────────────┤
│                                          │
│   Bạn có chắc chắn muốn xóa             │
│       hợp đồng này?                      │
│                                          │
│  ┌──────────────────────────────────┐    │
│  │ Mã HĐ:     HD-2026-FPT-001      │    │
│  │ Khách hàng: FPT Software        │    │
│  │ Loại:      Direct               │    │
│  │ Ngày ký:   21/05/2026           │    │
│  │ Subscription: 1 (đã kết thúc)   │    │
│  └──────────────────────────────────┘    │
│                                          │
│  ┌── ⚠️ ──────────────────────────────┐  │
│  │ Hợp đồng sẽ bị xóa vĩnh viễn     │  │
│  │ và không thể khôi phục.           │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Lý do xóa *                             │
│  ┌──────────────────────────────────┐    │
│  │ Nhập lý do xóa hợp đồng...      │    │
│  │                                  │    │
│  └──────────────────────────────────┘    │
│                                          │
├──────────────────────────────────────────┤
│              [ Hủy ]  [ Xóa (disabled) ] │
└──────────────────────────────────────────┘

Ghi chú:
- Nút "Xóa" chuyển từ disabled → enabled khi lý do ≥10 ký tự.
- Nút "Xóa" luôn nằm trước nút "Hủy" (primary action first).
```

### 3.2 Wireframe — Modal cảnh báo có sub ACTIVE (EF-01)

```
┌──────────────────────────────────────────┐
│  Không thể xóa hợp đồng            [✕]  │
├──────────────────────────────────────────┤
│  ┌── ⚠️ ──────────────────────────────┐  │
│  │ Hợp đồng đang có 2 subscription   │  │
│  │ Active. Vui lòng kết thúc tất cả  │  │
│  │ subscription trước khi xóa.       │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Subscription đang Active:               │
│  · EDR Enterprise 200 seat · ACTIVE      │
│  · C-Shield Gateway 5 node · ACTIVE      │
│                                          │
├──────────────────────────────────────────┤
│                              [ Đóng ]    │
└──────────────────────────────────────────┘
```

> **Demo HTML:** [docs/demo/v2.3.2_contracts.html](../../demo/v2.3.2_contracts.html) — modal `conModalDelete`

---

### 3.3 Các thành phần giao diện

| # | Thành phần | Loại | Mô tả |
|---|---|---|---|
| 1 | Info box | Read-only card | Hiển thị tóm tắt hợp đồng: mã HĐ, tên KH, loại, ngày ký, số sub. Background `#F9FAFB`. |
| 2 | Cảnh báo permanent | Alert (warn) | Background `#FFFBEB`, border `#FDE68A`. Text: *"Hợp đồng sẽ bị xóa vĩnh viễn và không thể khôi phục."* |
| 3 | Textarea lý do xóa | Form field | Bắt buộc nhập. Placeholder: *"Nhập lý do xóa hợp đồng..."* Validate realtime: enable nút Xóa khi ≥10 ký tự. |
| 4 | Nút "Xóa" | Button (danger) | Disabled mặc định. Enable khi lý do hợp lệ. Background `#FB2C36`. Sau khi nhấn: loading state, disabled để tránh double-submit. |
| 5 | Nút "Hủy" | Button (ghost) | Đóng modal, không xóa dữ liệu. |

---

## 4. Acceptance Criteria

### Nhóm 1: Xóa thành công

| AC ID | Given | When | Then |
|---|---|---|---|
| AC-CON-06-01 | Hợp đồng HD-2026-FPT-001 không có sub ACTIVE | Sales nhấn Xóa, nhập lý do "Khách hàng yêu cầu hủy", nhấn xác nhận | Hợp đồng bị xóa vĩnh viễn. Redirect về danh sách. Toast "Đã xóa hợp đồng HD-2026-FPT-001". Audit log có bản ghi xóa với lý do. |
| AC-CON-06-02 | Sales nhập lý do 15 ký tự | Nhìn vào nút Xóa | Nút Xóa ở trạng thái enabled (không còn disabled). |

### Nhóm 2: Validation lý do

| AC ID | Given | When | Then |
|---|---|---|---|
| AC-CON-06-03 | Modal xóa vừa mở | Chưa nhập lý do | Nút Xóa disabled, không thể click. |
| AC-CON-06-04 | Sales nhập lý do 5 ký tự ("Hủy.") | Nhìn vào nút Xóa | Nút Xóa vẫn disabled. |
| AC-CON-06-05 | Sales nhập lý do đủ ký tự, sau đó xóa hết | Nhìn vào nút Xóa | Nút Xóa trở lại disabled. |

### Nhóm 3: Chặn xóa khi có sub ACTIVE

| AC ID | Given | When | Then |
|---|---|---|---|
| AC-CON-06-06 | Hợp đồng có 2 subscription ACTIVE | Sales nhấn nút Xóa | Hiển thị modal cảnh báo (không phải modal xóa thường). Liệt kê 2 sub đang ACTIVE. Không có textarea lý do. Chỉ có nút "Đóng". |
| AC-CON-06-07 | Hợp đồng có 1 sub ACTIVE và 1 sub EXPIRED | Sales nhấn nút Xóa | Vẫn hiển thị modal cảnh báo — chỉ cần 1 sub ACTIVE là đã chặn. |

### Nhóm 4: Hủy thao tác

| AC ID | Given | When | Then |
|---|---|---|---|
| AC-CON-06-08 | Modal xóa đang mở, đã nhập lý do | Sales nhấn "Hủy" | Modal đóng. Hợp đồng không bị xóa. Trang Chi tiết vẫn hiển thị đúng. |
| AC-CON-06-09 | Modal xóa đang mở | Sales nhấn phím ESC | Modal đóng. Không xóa. |

---

## 5. Review Checklist

> Claude tự review — đánh dấu ✅/❌ trước khi submit cho BA review.

### Nghiệp vụ
- ✅ Luồng chính bao phủ happy path (không có sub ACTIVE)
- ✅ AF-01 (hủy xóa) đã định nghĩa
- ✅ EF-01 (có sub ACTIVE) đã xử lý với modal riêng
- ✅ EF-02 (lỗi hệ thống) đã có rollback
- ✅ BR-01 đến BR-04 đã định nghĩa
- ✅ Hard delete khác biệt với soft delete của Customer

### Giao diện
- ✅ Nút Xóa disabled mặc định, enable theo điều kiện
- ✅ Modal cảnh báo EF-01 tách biệt với modal xóa thường
- ✅ Toast thành công sau khi xóa
- ❓ **Open question 1:** Độ dài tối thiểu lý do xóa — demo đang validate realtime khi có text, nhưng PRD chưa quy định số ký tự tối thiểu. Đề xuất 10 ký tự — cần confirm.
- ❓ **Open question 2:** Nút Xóa: layout trong footer — demo đặt "Xóa" trước "Hủy" (danger action first). Cần confirm với UX pattern chung của team.
- ❓ **Open question 3:** Sau khi xóa từ trang Chi tiết → redirect về danh sách. Sau khi xóa từ bảng danh sách → ở lại danh sách. Cần confirm behavior này.
