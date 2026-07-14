# Nợ UI demo — xử lý một lượt khi rà toàn bộ demo

> Ghi nhận các điểm demo **chưa đạt quy tắc UI** nhưng **cố ý hoãn** để không làm vỡ phạm vi công việc đang chạy.
> Mỗi mục ghi rõ: vi phạm quy tắc nào · sửa ở đâu · sửa xong kéo theo việc gì.

---

## DEBT-01 — Tên tab còn từ lóng nội bộ & tiếng Anh kỹ thuật

**Ghi nhận:** 14/07/2026 · **Trạng thái:** hoãn (BA quyết định xử lý sau) · **Mức độ:** trung bình

| Chỗ sai | Đang hiển thị | Phải là |
|---|---|---|
| Chi tiết Subscription | **"📋 Thông tin Sub"** | "Thông tin chung" |
| Chi tiết Subscription | **"📋 Audit Log"** | "Nhật ký hoạt động" |
| Chi tiết Khách hàng (M-01) | **"📋 Audit Log"** | "Nhật ký hoạt động" |
| Chi tiết Hợp đồng (M-02) | **"📋 Audit Log"** | "Nhật ký hoạt động" |

**Vi phạm:** quy tắc demo #1 (CLAUDE.md) — *"TUYỆT ĐỐI không để lọt từ lóng nội bộ ('Sub') và thuật ngữ kỹ thuật tiếng Anh trong chữ người dùng thật sẽ đọc."*

**Hệ quả đang tồn tại:** **FRS và prompt BPMN đã dùng tên đúng** ("Thông tin chung", "Nhật ký hoạt động"), còn demo thì chưa → **dev đọc hai nguồn thấy hai tên khác nhau**. Ai chạm vào phần này trước khi DEBT-01 được xử lý cần biết điều đó.

**Khi xử lý, phải làm đủ:**
1. Đổi nhãn tab trong `docs/demo/v2.6.0_license.html` (3 module: khách hàng · hợp đồng · subscription). *Chỉ đổi **nhãn hiển thị** — giữ nguyên id panel (`sub-tp-info`, `sub-tp-audit`…) để không vỡ JS.*
2. Chụp lại ảnh: `UC-SUB-03_screen_*`, `UC-CUS-03_screen_*`, `UC-CON-03_screen_*` (những ảnh có thanh tab).
3. Rà lại FRS UC-CUS-03 và UC-CON-03 — hai file này có thể đang gọi tab là "Audit".

---

## DEBT-02 — Mã BR gắn chữ cái ở UC-LIC-04

**Ghi nhận:** 14/07/2026 · **Trạng thái:** hoãn · **Mức độ:** thấp

`BR-01b` và `BR-08b` (UC-LIC-04) không đúng quy ước `BR-NN` của checklist FRS. Đổi số sẽ kéo theo tham chiếu chéo ở UC-LIC-01, UC-LIC-02 và các AC — nên gom vào một lượt dọn, không sửa lẻ.
