# UC-{MOD}-{NN} — {Tên tính năng}

> Module: M-{XX} {Tên Module} | Phiên bản: 1.0 | Ngày: {DD/MM/YYYY}
> Trạng thái: Draft for Review

---

## 1. Thông tin chung

| Thuộc tính | Nội dung |
|---|---|
| **Tên chức năng** | {Tên tính năng} |
| **UC ID** | UC-{MOD}-{NN} |
| **Mô tả** | {Mô tả ngắn gọn mục đích tính năng} |
| **Tác nhân** | {Sales / Manager / System} |
| **Tiền điều kiện** | {Điều kiện phải đúng trước khi thực hiện} |
| **Hậu điều kiện** | (Success) {Trạng thái sau khi thành công}. (Failure) {Trạng thái sau khi thất bại} |
| **Ngoại lệ** | {Các trường hợp đặc biệt cần xử lý} |
| **Quy tắc nghiệp vụ** | BR-{NN}: {Mô tả rule}. |

---

## 2. Luồng nghiệp vụ

### 2.1 Luồng chính

| Bước | Actor | Hành động / Phản hồi |
|---|---|---|
| **1** | {Actor} | {Hành động} |
| **2** | System | {Phản hồi} |

### 2.2 Luồng phụ

**[AF-01: {Tên luồng phụ}]** — kích hoạt tại bước {N}.

| Bước | Actor | Hành động / Phản hồi |
|---|---|---|
| **Na** | {Actor} | {Hành động} |
| → | — | Tiếp tục từ bước {N}. |

### 2.3 Luồng ngoại lệ

**[EF-01: {Tên ngoại lệ}]** — kích hoạt tại bước {N}.

| Bước | Actor | Hành động / Phản hồi |
|---|---|---|
| **Na** | System | {Xử lý lỗi} |
| → | — | {Hướng giải quyết} |

---

## 3. Mô tả giao diện

### 3.1 Wireframe

```
{ASCII wireframe}
```

> **Demo HTML:** [docs/demo/v{X.X.X}_{module}.html](../../demo/v{X.X.X}_{module}.html)

---

### 3.2 Các thành phần giao diện

| # | Thành phần | Loại | Mô tả |
|---|---|---|---|
| 1 | {Tên component} | {Button/Form/Table/Modal...} | {Mô tả hành vi} |

---

### 3.3 Các field trong form

| # | Field | Bắt buộc | Mô tả & Validation |
|---|---|---|---|
| 1 | {Tên field} | ✓ / — | {Validation rule} |

---

## 4. Acceptance Criteria

### Nhóm 1: {Tên nhóm}

| AC ID | Given | When | Then |
|---|---|---|---|
| AC-{MOD}-{NN}-01 | {Điều kiện} | {Hành động} | {Kết quả mong đợi} |
