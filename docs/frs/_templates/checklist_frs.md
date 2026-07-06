# Checklist Review FRS

> Áp dụng cho mỗi file FRS trước khi chuyển trạng thái từ **Draft** → **Ready for Dev**.
> Claude tự review và đánh dấu. Bạn bổ sung thêm rule tại mục 5.

---

## 1. Thông tin chung

- [ ] UC ID đúng format `UC-{MOD}-{NN}`
- [ ] Tên tính năng nhất quán với module map
- [ ] Đủ 4 trường: Tác nhân, Tiền điều kiện, Hậu điều kiện (success + failure), Ngoại lệ
- [ ] Mỗi Business Rule có mã `BR-{NN}` riêng
- [ ] Phiên bản và ngày cập nhật chính xác

## 2. Luồng nghiệp vụ

- [ ] Luồng chính bao phủ đầy đủ happy path end-to-end
- [ ] Mỗi bước có Actor rõ ràng (Sales / System / Manager)
- [ ] Các luồng phụ (AF) được định nghĩa đầy đủ
- [ ] Các luồng ngoại lệ (EF) có mã riêng và hướng giải quyết
- [ ] Business Rules được trích dẫn tại bước liên quan
- [ ] Không có bước "mồ côi" (bước không kết nối với luồng chính)

## 3. Giao diện

- [ ] Wireframe ASCII đủ chi tiết để dev hình dung layout
- [ ] Bảng thành phần giao diện liệt kê đủ UI elements quan trọng
- [ ] Trạng thái loading/disabled của buttons được ghi rõ
- [ ] Error messages được định nghĩa cụ thể (text chính xác)
- [ ] Tham chiếu đúng file demo HTML

## 4. Acceptance Criteria

- [ ] Mỗi Business Rule có ít nhất 1 AC tương ứng
- [ ] AC dùng đúng format Given / When / Then
- [ ] Có AC cho happy path
- [ ] Có AC cho các trường hợp lỗi quan trọng (EF)
- [ ] AC ID đúng format `AC-{MOD}-{NN}-{XX}`

## 5. Quy tắc bổ sung (bạn cập nhật)

<!-- Thêm rule tại đây -->
- [ ] {Rule 1}
- [ ] {Rule 2}
