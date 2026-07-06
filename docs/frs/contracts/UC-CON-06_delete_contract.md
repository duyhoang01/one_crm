# UC-CON-06 — Xóa Hợp đồng

> Module: M-02 Contract Management | Phiên bản: 1.0 | Ngày: 06/07/2026
> Trạng thái: Draft for Review

---

## 1. Thông tin chung

| Thuộc tính | Nội dung |
|---|---|
| **Tên chức năng** | Xóa Hợp đồng |
| **UC ID** | UC-CON-06 |
| **Mô tả** | Sales xóa một hợp đồng khỏi hệ thống. Chỉ được phép xóa khi hợp đồng chưa có Subscription nào. Thao tác yêu cầu xác nhận và ghi Audit Log bắt buộc. |
| **Tác nhân** | Sales, Manager |
| **Tiền điều kiện** | Đã đăng nhập và có quyền `contract:delete`. Hợp đồng tồn tại trong hệ thống. |
| **Hậu điều kiện** | (Success) Hợp đồng bị xóa khỏi hệ thống. Audit log ghi nhận actor, timestamp, mã HĐ. Sales redirect về Danh sách Hợp đồng với toast thành công. (Failure) Không có dữ liệu nào bị xóa. Hợp đồng vẫn tồn tại nguyên vẹn. |
| **Ngoại lệ** | Hợp đồng có Subscription (bất kể trạng thái) → chặn xóa, nút 🗑️ disabled. |
| **Điểm vào** | (a) Click icon 🗑️ trên row trong Danh sách (UC-CON-01). (b) Click nút "🗑️ Xóa" trong action bar của Chi tiết Hợp đồng (UC-CON-03). |

### Quy tắc nghiệp vụ

| BR ID | Nội dung |
|---|---|
| BR-01 | Chỉ được xóa khi `subs.length = 0`. Kể cả subscription đã EXPIRED/REVOKED cũng chặn xóa — một khi HĐ đã phát sinh sub, không thể xóa. |
| BR-02 | Nút 🗑️ bị disabled ngay khi render nếu `subs.length > 0` — không đợi Sales click rồi mới báo lỗi (BR đồng bộ với UC-CON-01 BR-02). Tooltip: *"Đã có Subscription, không thể xóa"*. |
| BR-03 | Audit log bắt buộc — ghi nhận actor, timestamp, mã HĐ, loại HĐ, tên KH. Nếu không ghi được thì rollback, không xóa hợp đồng. |
| BR-04 | Xóa là hard delete — contract record bị xóa vật lý khỏi hệ thống (khác với Customer là soft delete). Không có luồng khôi phục qua UI. |

---

## 2. Luồng nghiệp vụ

### 2.1 Luồng chính

| Bước | Actor | Hành động / Phản hồi |
|---|---|---|
| **1** | System | Tại Danh sách (UC-CON-01) hoặc Chi tiết (UC-CON-03), kiểm tra `subs.length` để set trạng thái nút 🗑️: disabled khi `subs.length > 0`, active khi `subs.length = 0`. |
| **2** | Sales/Manager | Nhấn icon 🗑️ (Danh sách) hoặc nút "🗑️ Xóa" (Chi tiết) — chỉ khả dụng khi `subs.length = 0`. |
| **3** | System | Mở modal xác nhận xóa. Hiển thị: thông tin tóm tắt HĐ (mã HĐ, tên KH, loại HĐ, ngày ký), cảnh báo không thể hoàn tác. |
| **4** | Sales/Manager | Chọn hành động: nhấn **"Xóa"** → tiếp bước 5; hoặc nhấn **"Hủy"** / **"✕"** / **ESC** → AF-01. |
| **5** | System | Re-check `subs.length = 0` ngay trước khi xóa (phòng race condition). |
| **5a** | System | **[Vẫn còn 0 sub]** → tiếp bước 6. **[Đã phát sinh sub giữa lúc modal mở]** → EF-01. |
| **6** | System | Ghi Audit Log (actor, timestamp, mã HĐ, loại HĐ, tên KH). |
| **7** | System | Xóa contract record khỏi hệ thống (hard delete, BR-04). |
| **8** | System | Đóng modal. Redirect về Danh sách Hợp đồng (UC-CON-01). Hiển thị toast: *"Đã xóa hợp đồng {mã HĐ}"*. |

### 2.2 Luồng phụ

**[AF-01: Hủy xóa]** — kích hoạt tại bước 4 khi Sales không xác nhận.

| Bước | Actor | Hành động / Phản hồi |
|---|---|---|
| **4a** | Sales | Nhấn **"Hủy"** hoặc icon **"✕"** hoặc nhấn phím **ESC**. |
| **4b** | System | Đóng modal. Không xóa dữ liệu. Giữ nguyên trang hiện tại (Danh sách hoặc Chi tiết). |

### 2.3 Luồng ngoại lệ

**[EF-01: Race condition — phát sinh sub giữa lúc modal mở]** — kích hoạt tại bước 5a.

| Bước | Actor | Hành động / Phản hồi |
|---|---|---|
| **5b** | System | Đóng modal. Hiển thị toast lỗi: *"Không thể xóa — hợp đồng vừa có Subscription mới."* Không xóa record. |
| → | — | Nút 🗑️ ở UI đã tự động chuyển sang disabled (UI sẽ re-sync khi page refresh hoặc next render). |

**[EF-02: Lỗi hệ thống khi xóa (ghi audit log hoặc DB thất bại)]** — kích hoạt tại bước 6 hoặc 7.

| Bước | Actor | Hành động / Phản hồi |
|---|---|---|
| **6a** | System | Rollback toàn bộ (BR-03). Hiển thị toast lỗi: *"Xóa thất bại. Vui lòng thử lại."* Đóng modal. Hợp đồng vẫn tồn tại. |

---

## 3. Mô tả giao diện

### 3.1 Wireframe — Modal xác nhận xóa

```
┌──────────────────────────────────────────┐
│  Xóa Hợp đồng                      [✕]  │
├──────────────────────────────────────────┤
│                                          │
│   Bạn có chắc chắn muốn xóa             │
│         hợp đồng này?                    │
│                                          │
│  ┌──────────────────────────────────┐    │
│  │ Mã HĐ:     HD-CMC-2026-001      │    │
│  │ Khách hàng: FPT Software        │    │
│  │ Loại:      Direct               │    │
│  │ Ngày ký:   01/07/2026           │    │
│  └──────────────────────────────────┘    │
│                                          │
│  ┌── ⚠️ ──────────────────────────────┐  │
│  │ Hợp đồng sẽ bị xóa vĩnh viễn     │  │
│  │ và không thể khôi phục.           │  │
│  └────────────────────────────────────┘  │
│                                          │
├──────────────────────────────────────────┤
│         [ Hủy ]        [ 🗑️ Xóa ]       │
└──────────────────────────────────────────┘
```

### 3.2 Các thành phần giao diện

| # | Thành phần | Loại | Mô tả |
|---|---|---|---|
| 1 | Info box | Read-only card | Hiển thị tóm tắt HĐ: Mã HĐ, Tên KH, Loại HĐ, Ngày ký. Background `#F9FAFB`. Field null hiển thị "—". |
| 2 | Cảnh báo permanent | Alert (warn) | Background `#FFFBEB`, border `#FDE68A`. Icon ⚠️. Text: *"Hợp đồng sẽ bị xóa vĩnh viễn và không thể khôi phục."* |
| 3 | Nút "🗑️ Xóa" | Button (Danger) | Background `#FB2C36`, text white. Sau khi nhấn: loading state, disabled để ngăn double-submit. |
| 4 | Nút "Hủy" | Button (Ghost) | Đóng modal, không xóa dữ liệu. |
| 5 | Nút "✕" đóng | Icon Button | Hành vi giống nút "Hủy". |
| 6 | Toast thành công | Toast (Success) | *"Đã xóa hợp đồng {mã HĐ}"*. Màu xanh lá. Hiển thị sau bước 8. |
| 7 | Toast lỗi race condition | Toast (Error) | *"Không thể xóa — hợp đồng vừa có Subscription mới."* |
| 8 | Toast lỗi hệ thống | Toast (Error) | *"Xóa thất bại. Vui lòng thử lại."* |

### 3.3 Trạng thái nút 🗑️ Xóa

| Điều kiện | Trạng thái | Tooltip khi hover |
|---|---|---|
| `subs.length = 0` | Active — màu đỏ, click được | Không có tooltip |
| `subs.length ≥ 1` (bất kỳ status nào) | Disabled — opacity 0.5, cursor not-allowed | *"Đã có Subscription, không thể xóa"* |

Áp dụng đồng nhất ở 2 vị trí: cột Thao tác trong Danh sách (UC-CON-01) và action bar trong Chi tiết (UC-CON-03).

---

## 4. Acceptance Criteria

### Nhóm 1: Xóa thành công

| AC ID | Given | When | Then |
|---|---|---|---|
| AC-CON-06-01 | HĐ "HD-CMC-2026-001" (subs.length = 0) | Sales nhấn 🗑️, xác nhận trong modal | HĐ bị xóa khỏi hệ thống. Redirect về Danh sách. Toast *"Đã xóa hợp đồng HD-CMC-2026-001"*. Audit log có bản ghi xóa với actor và timestamp. |
| AC-CON-06-02 | Sales xóa HĐ từ Danh sách | Xóa thành công | Row HĐ biến mất khỏi bảng ngay, không cần reload trang. |
| AC-CON-06-03 | Sales xóa HĐ từ trang Chi tiết (UC-CON-03) | Xóa thành công | Modal đóng, redirect về Danh sách (vì HĐ vừa xem không còn tồn tại). |

### Nhóm 2: Chặn xóa khi đã có Subscription

| AC ID | Given | When | Then |
|---|---|---|---|
| AC-CON-06-04 | HĐ có 2 sub ACTIVE | Sales xem Danh sách | Nút 🗑️ disabled (opacity 0.5), không click được. |
| AC-CON-06-05 | HĐ có 1 sub ACTIVE và 1 sub EXPIRED | Sales xem Danh sách | Nút 🗑️ vẫn disabled — có bất kỳ sub nào (kể cả EXPIRED) là đã chặn. |
| AC-CON-06-06 | HĐ có 1 sub REVOKED (terminal) | Sales xem Danh sách | Nút 🗑️ vẫn disabled — REVOKED vẫn tính là "đã phát sinh sub" theo BR-01. |
| AC-CON-06-07 | HĐ subs.length > 0 | Sales hover vào nút 🗑️ disabled | Tooltip hiển thị: *"Đã có Subscription, không thể xóa"*. |

### Nhóm 3: Hủy thao tác

| AC ID | Given | When | Then |
|---|---|---|---|
| AC-CON-06-08 | Modal xóa đang mở | Sales nhấn "Hủy" | Modal đóng. HĐ không bị xóa. Trang hiện tại giữ nguyên. |
| AC-CON-06-09 | Modal xóa đang mở | Sales nhấn phím ESC | Modal đóng. Không xóa. |
| AC-CON-06-10 | Modal xóa đang mở | Sales nhấn "✕" | Modal đóng. Không xóa. |

### Nhóm 4: Race condition

| AC ID | Given | When | Then |
|---|---|---|---|
| AC-CON-06-11 | Sales mở modal xóa cho HĐ subs=0; trong lúc modal mở, Sales khác tạo sub mới cho cùng HĐ | Sales nhấn "🗑️ Xóa" | BE re-check phát hiện subs.length > 0, từ chối xóa. Toast *"Không thể xóa — hợp đồng vừa có Subscription mới."* Modal đóng, record không bị xóa. |

### Nhóm 5: Lỗi hệ thống

| AC ID | Given | When | Then |
|---|---|---|---|
| AC-CON-06-12 | DB hoặc audit log service gặp lỗi khi xóa | Sales xác nhận xóa | Rollback, toast *"Xóa thất bại. Vui lòng thử lại."* HĐ vẫn tồn tại nguyên vẹn. |

---

## 5. Review Checklist

> Claude tự review — đánh dấu ✅/❌ trước khi submit cho BA review.

### Nghiệp vụ
- ✅ Luồng chính bao phủ happy path (subs.length = 0)
- ✅ AF-01 (hủy xóa) đã định nghĩa
- ✅ EF-01 (race condition) đã xử lý
- ✅ EF-02 (lỗi hệ thống) có rollback
- ✅ BR-01 đến BR-04 đã định nghĩa rõ
- ✅ AC bao phủ cả chặn xóa (mọi sub status), race condition, lỗi hệ thống
- ✅ Nội dung bám sát PRD v2.3 (BR-01, BR-02 lấy từ UC-CON-01 Section 6.2.2)

### Giao diện
- ✅ Modal xác nhận với info box và cảnh báo
- ✅ Nút "🗑️ Xóa" disabled/active theo BR đã mô tả
- ✅ Tooltip khi hover icon disabled
- ✅ Toast messages (thành công, race condition, lỗi hệ thống) đã định nghĩa
- ✅ Redirect behavior (từ Danh sách và từ Chi tiết) khác nhau

### Open Questions
- ❓ **OQ-01**: PRD v2.3 chưa định nghĩa rõ hard delete hay soft delete cho CONTRACT. File này giả định hard delete vì entity CONTRACT không có field `deleted_at` (khác CUSTOMER). Cần confirm với BA.
- ❓ **OQ-02**: Sau khi xóa HĐ, các attachment file đính kèm có bị xóa khỏi storage không? Hay chỉ mất liên kết? PRD v2.3 chưa specify.
- ❓ **OQ-03**: PRD UC-CON-01 flow gọi delete là "UC-CON-05" trong một số chỗ — đây là lỗi đánh số trong PRD. Numbering của UC-CON-06 theo thống nhất với BA ngày 06/07/2026.
