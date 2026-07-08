---
description: Review một file FRS theo checklist chuẩn OneCRM, báo cáo mục đạt/chưa đạt/cần xác nhận
---

Thực hiện review FRS theo các bước sau:

**1. Xác định file cần review:**
- Nếu `$ARGUMENTS` có giá trị → đọc file đó
- Nếu không có argument → tìm file FRS được chỉnh sửa gần nhất trong `docs/frs/` bằng `git diff --name-only HEAD`

**2. Đọc checklist:**
Đọc `docs/frs/_templates/checklist_frs.md` để lấy toàn bộ tiêu chí review.

**3. Đối chiếu từng mục:**
Đọc kỹ nội dung FRS, đối chiếu với từng mục trong checklist.

**4. Báo cáo kết quả theo format:**

```
## Kết quả review: [tên file]

### ✅ Đạt (X mục)
- [mục 1]: [giải thích ngắn]
- ...

### ❌ Chưa đạt (X mục)
- [mục]: [giải thích + gợi ý fix]
- ...

### ⚠️ Cần xác nhận với PRD (X mục)
- [mục]: [nêu điểm cần verify]
- ...

---
**Tổng kết:** X/Y mục đạt · [nhận xét tổng thể 1 câu]
```

**5. Nếu có lỗi nghiêm trọng:** Hỏi người dùng có muốn fix ngay không trước khi kết thúc.
