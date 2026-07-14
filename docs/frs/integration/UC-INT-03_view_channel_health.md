# UC-INT-03 — Xem tình trạng kết nối

> Module: M-07 Integration Layer | Phiên bản: 1.0 | Ngày: 14/07/2026
> Trạng thái: Draft for Review · **§3 Mô tả giao diện: chờ dựng demo** *(BA chốt: FRS trước → demo → quay lại bổ sung §3)*

---

## 1. Thông tin chung

| Thuộc tính | Nội dung |
|---|---|
| **Mã Use Case** | UC-INT-03 |
| **Tên** | Xem tình trạng kết nối |
| **Mô tả** | Với **mỗi sản phẩm**, tổng hợp tình trạng **hai chiều** — *lệnh CRM gửi có tới nơi không* và *sản phẩm có báo về không, CRM có xử lý được không* — rồi **kết luận thành một câu kèm việc phải làm**. Đây là màn **đóng OQ-LIC-03**: phân biệt **"sản phẩm không gửi gì"** với **"có gửi nhưng CRM xử lý lỗi"** — hai nguyên nhân cần **hành động ngược nhau**. |
| **Tác nhân** | License Admin · Auditor *(chỉ đọc)* |
| **Tiền điều kiện** | Đã đăng nhập; có quyền `integration:view`. |
| **Hậu điều kiện** | Chỉ đọc — không thay đổi dữ liệu. |
| **Trigger** | (1) Bấm menu **Tích hợp**. (2) Bấm *"Xem tình trạng kết nối"* từ banner **"Không nhận được dữ liệu"** của UC-LIC-01. |
| **Liên kết** | UC-INT-04, UC-INT-05, UC-LIC-01 (banner sự cố diện rộng), UC-LIC-04 |

### Business Rules

| Mã | Nội dung |
|---|---|
| **BR-01** | **Phân quyền**: chỉ `integration:view` — mặc định **License Admin** và **Auditor**. Sales / CSKH / Manager **không thấy cả mục menu**. *Đây là dữ liệu vận hành nhạy cảm; cho Sales thấy chỉ gây hoang mang mà họ không xử lý được gì.* |
| **BR-02** | Mỗi sản phẩm **một thẻ**, chia **hai nửa**: **Gửi đi** (chờ gửi · đang thử lại · **thất bại vĩnh viễn** · sản phẩm từ chối) và **Nhận về** (nhận gần nhất lúc nào · số nhận trong 24h · **số xử lý lỗi** · tỷ lệ lỗi). |
| **BR-03** | **Bắt buộc có KẾT LUẬN thành câu, kèm việc phải làm.** Không được chỉ hiện số liệu thô. *Số liệu bắt người đọc tự suy; kết luận nói thẳng phải gọi ai.* |
| **BR-04** | **Ngưỡng "im lặng bất thường"** = **2 × `runtime_config.usage_push_interval`** của sản phẩm đó — **không hardcode**. Giá trị hiện hành: chu kỳ **3 giờ** → ngưỡng **6 giờ** *(chốt 14/07/2026)*. |
| **BR-05** | **Loại trừ khách hàng triển khai tại chỗ** — họ không có kênh tự động, không tính vào bất kỳ chỉ số nào. |
| **BR-06** | Một sản phẩm **có thể có nhiều kết luận cùng lúc** *(vd EDR: vừa có lệnh chưa tới nơi, vừa im lặng)*. Sắp xếp theo mức nghiêm trọng giảm dần. |

### Các kết luận — bảng quyết định

| Mã | Điều kiện | Kết luận hiển thị | Ai phải hành động |
|---|---|---|---|
| **BR-07** | Có **≥ 1 lệnh thất bại vĩnh viễn** | *"{n} lệnh chưa tới được {sản phẩm}"* — **khách hàng có thể vẫn dùng dịch vụ dù đã bị tạm dừng/thu hồi trên CRM**. Báo vận hành, rồi gửi lại. | **Vận hành** (hạ tầng) |
| **BR-08** | Có **≥ 1 lệnh bị sản phẩm từ chối** *(`subscription.command_failed`)* | *"{sản phẩm} **từ chối** {n} lệnh: {lý do thật}"* — **không phải "chưa tới nơi"**. | **Đội sản phẩm** — với lý do cụ thể trong tay |
| **BR-09** | **Không nhận được tin nào** quá ngưỡng (BR-04) **và không có tin lỗi** | *"Không nhận được dữ liệu nào từ {sản phẩm} trong {X} giờ"* — nghi sự cố phía sản phẩm hoặc đường truyền. **Liên hệ đội sản phẩm.** | **Đội sản phẩm** |
| **BR-10** | **Có nhận** nhưng **≥ 3 tin xử lý lỗi** | *"Nhận được dữ liệu nhưng CRM xử lý lỗi ({m}/{n} tin)"* + **lý do phổ biến nhất**. → **Đây là lỗi phía CRM — ĐỪNG gọi sản phẩm.** Sửa quy tắc đọc dữ liệu rồi xử lý lại. | **Chính chúng ta** |
| **BR-11** | Có tin **chữ ký không hợp lệ** *(bất kể số lượng)* | *"{n} tin gửi tới với chữ ký không hợp lệ"* — nguồn **không xác thực được**: có thể sản phẩm vừa đổi khoá, hoặc **bên thứ ba giả mạo**. **Không xử lý lại được.** | **Bảo mật + đội sản phẩm** |
| **BR-12** | Không rơi vào các trường hợp trên | *"Kênh hoạt động bình thường — nhận dữ liệu gần nhất {X} trước."* | Không ai |

> **BR-11 không có ngưỡng số lượng** — khác mọi quy tắc còn lại. **Một** tin chữ ký sai đã là tín hiệu bảo mật; gộp nó vào ngưỡng đám đông là bỏ lọt.

> **BR-09 vs BR-10 chính là lý do module này tồn tại.** Cùng một triệu chứng ở M-05 (*"license lâu không cập nhật"*) nhưng **hai nguyên nhân ngược nhau**: một bên phải gọi đội sản phẩm, một bên tuyệt đối **đừng** gọi — vì lỗi là của mình. Không có màn này, người vận hành **đoán**.

---

## 2. Luồng nghiệp vụ

### 2.1 Luồng chính

| Bước | Actor | Hành động / Phản hồi |
|---|---|---|
| **1** | Người dùng | Mở module **Tích hợp** *(từ menu, hoặc từ banner của UC-LIC-01)*. |
| **2** | System | **[Gateway — Có quyền `integration:view`?]** Không → **EF-01**. Có → tiếp bước 3. |
| **3** | System | Với **mỗi sản phẩm**: tổng hợp chỉ số hai chiều (BR-02), loại trừ khách triển khai tại chỗ (BR-05), đọc ngưỡng từ cấu hình sản phẩm (BR-04). |
| **4** | System | Chấm **kết luận** theo bảng quyết định BR-07…BR-12; sắp xếp theo mức nghiêm trọng (BR-06). |
| **5** | System | Render mỗi sản phẩm một thẻ: hai nửa chỉ số + (các) kết luận + nút hành động tương ứng. |
| **6** | Người dùng | **[Gateway — Làm gì tiếp?]**<br>→ *"Xem sự kiện gửi đi"* → **UC-INT-04** (**End 2**) · *"Xem sự kiện nhận về"* → **UC-INT-05** (**End 3**) · Không thao tác → **End 1**. |

### 2.2 Luồng ngoại lệ

**[EF-01: Không có quyền]** — tại bước 2.

| Bước | Actor | Hành động / Phản hồi |
|---|---|---|
| **EF-01a** | System | **Mục menu "Tích hợp" không hiển thị**. Gọi thẳng API → **403**. |
| → | — | **End 4**. |

### 2.3 Điểm kết thúc

| End | Mô tả |
|---|---|
| **End 1** | Ở lại màn. |
| **End 2** | Sang UC-INT-04 (sự kiện gửi đi), lọc sẵn theo sản phẩm. |
| **End 3** | Sang UC-INT-05 (sự kiện nhận về), lọc sẵn theo sản phẩm. |
| **End 4** | Từ chối — không đủ quyền. |

---

## 3. Mô tả giao diện

> ⏳ **Chờ dựng demo.** Theo quyết định của BA (14/07/2026): FRS kỹ thuật trước → dựng demo → quay lại bổ sung mục này kèm ảnh chụp.
> Ràng buộc bắt buộc khi dựng: mỗi sản phẩm **một thẻ, hai nửa** (BR-02) · **kết luận thành câu, kèm việc phải làm** (BR-03) · ngưỡng đọc từ cấu hình, **hiển thị được** ngưỡng đang áp dụng (BR-04).

---

## 4. Acceptance Criteria

### Nhóm 1: Kết luận đúng nguyên nhân *(giá trị cốt lõi của module)*

| Mã | Given | When | Then |
|---|---|---|---|
| AC-INT-03-01 | EDR: **không nhận được tin nào trong 61 giờ**; **không** có tin lỗi. Ngưỡng = 6 giờ. | Mở màn. | Kết luận **"Không nhận được dữ liệu nào từ CMC EDR trong 61 giờ"** + **"Liên hệ đội CMC EDR"** (BR-09). |
| AC-INT-03-02 | AV: nhận **42 tin**, **41 tin xử lý lỗi**, lý do phổ biến nhất là *thiếu trường "ngày hết hạn"*. | Mở màn. | Kết luận **"Nhận được dữ liệu nhưng CRM xử lý lỗi (41/42 tin)"** + nêu lý do + câu **"Đây là lỗi phía CRM — đừng gọi sản phẩm"** (BR-10). |
| AC-INT-03-03 | EDR có **3 lệnh thất bại vĩnh viễn** *(Tạm dừng)*. | Mở màn. | Kết luận **"3 lệnh chưa tới được CMC EDR"** + cảnh báo **khách hàng có thể vẫn đang dùng dịch vụ** (BR-07). |
| AC-INT-03-04 | EDR **vừa** có 3 lệnh thất bại **vừa** im lặng 61 giờ. | Mở màn. | **Hiện CẢ HAI kết luận**, xếp theo mức nghiêm trọng (BR-06). |
| AC-INT-03-05 | CA nhận **1 tin chữ ký không hợp lệ** *(chỉ 1)*. | Mở màn. | **Vẫn hiện** kết luận cảnh báo bảo mật (BR-11) — **không** bị bỏ qua vì số lượng nhỏ. |
| AC-INT-03-06 | EDR **từ chối** 2 lệnh với lý do *"tenant không tồn tại"*. | Mở màn. | Kết luận **"CMC EDR từ chối 2 lệnh: tenant không tồn tại"** — **không** hiển thị là *"chưa tới nơi"* (BR-08). |
| AC-INT-03-07 | C-Shield: mọi lệnh tới nơi, nhận tin đều đặn, không lỗi. | Mở màn. | **"Kênh hoạt động bình thường"** (BR-12). |

### Nhóm 2: Ngưỡng & loại trừ

| Mã | Given | When | Then |
|---|---|---|---|
| AC-INT-03-08 | Sản phẩm khai `usage_push_interval = 3h`. | Mở màn. | Ngưỡng im lặng = **6 giờ** *(2 ×)*. Đổi cấu hình thành 12h → ngưỡng tự thành **24 giờ**, **không sửa code** (BR-04). |
| AC-INT-03-09 | Sản phẩm có 5 khách **triển khai tại chỗ**, không gửi gì bao giờ. | Mở màn. | 5 khách này **không** làm sản phẩm bị kết luận "im lặng" (BR-05). |

### Nhóm 3: Phân quyền

| Mã | Given | When | Then |
|---|---|---|---|
| AC-INT-03-10 | **Sales** đăng nhập. | Xem sidebar. | **Không thấy** mục menu "Tích hợp". Gọi thẳng API → **403** (BR-01, EF-01). |
| AC-INT-03-11 | **Auditor** đăng nhập. | Mở màn. | **Xem được đầy đủ**; **không có** nút Gửi lại / Xử lý lại ở bất kỳ đâu (UC-INT-04 BR-01, UC-INT-05 BR-01). |

---

## 5. Review Checklist

### Lịch sử thay đổi

| Phiên bản | Ngày | Tác giả | Mô tả |
|---|---|---|---|
| 1.0 | 14/07/2026 | Claude (AI) | Khởi tạo. **FR mới, chưa có trong PRD v2.6** — đề xuất bổ sung **FR-INT-07**. Đây là màn **đóng OQ-LIC-03** (M-05 không tự phân biệt được "sản phẩm không gửi gì" vs "CRM xử lý lỗi"). |

### Nghiệp vụ
- ✅ Kết luận **nói rõ ai phải hành động**, không chỉ hiện số liệu
- ✅ Phân biệt được **4 nguyên nhân khác nhau** cho cùng một triệu chứng ở M-05
- ✅ Ngưỡng đọc từ cấu hình sản phẩm — không hardcode
- ✅ Tin chữ ký sai **không có ngưỡng đám đông** — 1 tin cũng phải báo
- ⚠️ Cần bổ sung **FR-INT-07** vào PRD (chờ duyệt plan PRD v2.7)

---

## Footer

| Mục | Nội dung |
|---|---|
| **Giao diện** | ⏳ Chờ dựng demo |
| **UC liên quan** | UC-INT-04, UC-INT-05, UC-INT-06, UC-LIC-01, UC-LIC-04 |
| **Trace PRD** | **FR-INT-07 (mới — chưa có trong PRD v2.6)** |
