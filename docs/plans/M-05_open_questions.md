# M-05 License Mirror & Usage — Bộ câu hỏi cần chốt

> Ngày: 13/07/2026 · Người soạn: Claude (AI) · Người trả lời: BA (Nguyễn Công Giang)
> Nguồn: self-review 4 FRS `UC-LIC-01..04` + demo `v2.6.0_license.html`
> **Cách dùng:** trả lời lần lượt theo số câu. Câu nào chưa chốt thì FRS giữ nguyên trạng thái *giả định chưa xác nhận*.

**Mức độ chặn:**
🔴 **Chặn dev** — không chốt thì không code được đúng
🟠 **Chặn golive** — code được nhưng vận hành sẽ sai/nhiễu
🟡 **Có thể defer** — ảnh hưởng chất lượng, không chặn

---

## NHÓM A — Conflict trong logic (phải chốt trước)

### 🔴 Q1. Ngưỡng "chờ kích hoạt quá lâu" của EDR

**Bối cảnh:** FRS UC-LIC-04 BR-01(C) hiện quy định: subscription chờ kích hoạt quá **24 giờ** mà sản phẩm chưa phản hồi → vào hàng đợi sự cố.

**Vấn đề:** Bạn đã nói EDR chuyển sang *đang triển khai* mất **vài ngày**, rồi tới *hoạt động* mất **1–2 tháng**. Với ngưỡng 24h, **mọi subscription EDR mới đều bị gắn cờ sự cố** → dashboard vô dụng ngay ngày đầu.

**Câu hỏi:** chọn một trong ba:
- **(a)** Tắt hẳn kiểm tra "chờ kích hoạt quá lâu" ở Phase 1 (chỉ giữ 2 loại sự cố còn lại), chờ đội sản phẩm cho số liệu thật.
- **(b)** Đổi cách đo: **không** đo tổng thời gian chờ, mà đo **sự im lặng** — sản phẩm chưa gửi *bất kỳ tín hiệu nào* quá X ngày (X do đội EDR cung cấp).
- **(c)** Giữ 24h nhưng chỉ áp dụng cho sản phẩm khai báo ngưỡng, EDR để trống → không kiểm tra.

**Đề xuất của tôi:** **(b)** — đo tiến triển, không đo độ dài. Nhưng cần số X từ đội EDR (xem Q7).

Giang: chọn C. 
---

### 🟠 Q2. Force Sync khi license đã hết hạn

**Bối cảnh:** FRS UC-LIC-03 BR-01 (bám PRD BR-04.1) cho phép Đồng bộ lại khi **subscription** đang Active/Tạm dừng.

**Vấn đề:** Có trường hợp subscription `Active` nhưng **license đã Hết hạn/Thu hồi** (chính là lệch kiểu B). Nút *Đồng bộ lại* vẫn hiện, dù sản phẩm chẳng còn số liệu nào để gửi.

**Câu hỏi:** có chặn Force Sync theo **trạng thái license** (chỉ cho phép khi license Active/Trong gia hạn) không, hay giữ nguyên theo trạng thái subscription như PRD?

**Đề xuất của tôi:** vẫn **cho phép** — vì đúng lúc lệch trạng thái, ta *cần* hỏi lại sản phẩm để xác minh. Nhưng đổi nhãn nút thành *"Yêu cầu sản phẩm xác minh lại"* cho đúng ý nghĩa.

Giang: Vẫn cho phép. 

---

### 🟠 Q3. "Sắp hết hạn" — KPI và bộ lọc đang lệch nhau

**Bối cảnh:** KPI/cơ hội gia hạn **bao gồm** license đã quá hạn đang trong ân hạn (số ngày âm). Bộ lọc *"Hết hạn trong 30 ngày"* lại **loại** chúng ra.

**Vấn đề:** cùng một khái niệm cho hai kết quả khác nhau — bấm KPI ra 4, lọc ra 3.

**Câu hỏi:** license **đang trong ân hạn** (đã quá hạn nhưng KH vẫn dùng) có được tính là "sắp hết hạn" không?

**Đề xuất của tôi:** **Có** — và bộ lọc phải đổi tên thành *"Cần gia hạn (≤ 30 ngày hoặc đã quá hạn)"* để hai chỗ khớp nhau.

Giang: thể hiện đúng bản chất sắp hết hạn của license, không liên quan gì đến "Đang trong ân hạn" => Vẫn giữ bộ lọc còn 30 ngày, nhưng thêm 1 option đã quá hạn. Chú ý, đặt lại title filter cho đủ bao quát và thể hiện đúng ý nghĩa lọc (nếu thực sự cần)
---

## NHÓM B — Ngưỡng cấu hình (tôi đang **bịa số**, cần số thật)

> **Cảnh báo:** toàn bộ số dưới đây do tôi tự đặt để demo chạy được. Không có trong PRD, chưa ai duyệt.

### 🔴 Q4. Chu kỳ đẩy dữ liệu của từng sản phẩm

Tôi đang giả định: **EDR 6h · C-Shield 12h · AV 24h · CA 24h**.
Số này quyết định ngưỡng "license lâu chưa cập nhật" (công thức hiện tại = **2 × chu kỳ đẩy**).

**Câu hỏi:** (1) Số thật là bao nhiêu cho từng sản phẩm? (2) Công thức "2 ×" có hợp lý không, hay đội vận hành muốn con số cố định riêng?


Giang: Tạm thời giả lập toàn bộ sản phẩm là 24h giờ. Đây là đồng bộ về mặt Usage.. còn khi licesne thay đổi trạng thái hoặc Subs thay đổi trạng thái thì cần đồng bộ dưới 15 phút.
Số chính thức sẽ điều chỉnh ở phase sau. 
---

### 🟠 Q5. Ngưỡng SLA lệch trạng thái theo từng sản phẩm

Tôi đang giả định: **EDR 15 phút · C-Shield 15 · AV 30 · CA 60** (PRD chỉ nói *mặc định 15 phút*).

**Câu hỏi:** mỗi sản phẩm có ngưỡng riêng thật không, hay dùng chung 15 phút cho tất cả?

---

### 🟠 Q6. Ngưỡng báo gia hạn & ngưỡng "sắp dùng hết"

Tôi đang giả định:

| Sản phẩm | Báo gia hạn trước | Sắp dùng hết khi |
|---|---|---|
| CMC EDR | **90 ngày** *(mua sắm doanh nghiệp/chính phủ cần thời gian)* | 90% |
| C-Shield | 60 ngày | 90% |
| CMC Antivirus | **30 ngày** *(bán lẻ, chu kỳ ngắn)* | **85%** |
| CMC CA | 60 ngày | 90% |

**Câu hỏi:** Sales muốn được nhắc trước bao nhiêu ngày cho từng sản phẩm? Ngưỡng "sắp dùng hết" để chào bán thêm là bao nhiêu %?

---

### 🔴 Q7. Ba số liệu về quy trình triển khai EDR (hỏi đội EDR)

Cần cho Q1 và cho cảnh báo "đọng kích hoạt":

1. Từ lúc CRM gửi yêu cầu đến lúc EDR chuyển sang *đang triển khai* — **bình thường mất bao lâu**, và **quá bao lâu thì bất thường**?
2. Trong lúc triển khai, **bao lâu không có bước tiến nào** thì coi là việc đang bị treo?
3. Triển khai kéo dài **bao lâu thì Sales cần vào cuộc** (nguy cơ khách huỷ)?

**Câu hỏi:** bạn hỏi giúp đội EDR, hay để tôi soạn email/câu hỏi gửi họ?

---

## NHÓM C — Nghiệp vụ chưa có luồng

### 🔴 Q8. "Bán thêm số lượng" thực hiện bằng cách nào?

**Bối cảnh:** View *Cơ hội doanh thu* phát hiện khách sắp dùng hết seat và khuyên "nên chào bán thêm". Nhưng **bấm xong thì làm gì?**

Hai hướng mâu thuẫn nhau trong PRD:
- **(a)** Tạo **subscription mới** — đúng anchor YT-2 (*doanh thu = tạo sub mới*).
- **(b)** **Tăng seat** của subscription hiện tại — đây là **Upgrade**, mà Upgrade đang là **OQ-06, Phase 1 trả 501 NOT_IMPLEMENTED**.

**Hệ quả:** hiện dòng "Bán thêm số lượng" **không có nút hành động** vì tôi không biết luồng.

**Câu hỏi:** chọn (a) hay (b)? Nếu (a) thì sub mới có `previous_subscription_id` trỏ về sub cũ không (để biết đây là bán thêm, không phải khách mới)?

Giang: Có thể nâng cấp hoặc mua thêm Subs mới. nhưng luồng này chưa define. Cứ để tạm như hiện tại là "Mở subs"
---

### 🟠 Q9. Đại lý — pool đã cạn thì bán thêm thế nào?

**Bối cảnh:** FRS UC-LIC-01 BR-12: với hợp đồng đại lý, đơn vị thụ hưởng sắp dùng hết **không** đương nhiên là doanh thu mới; chỉ khi **pool của đại lý cạn** mới là cơ hội bán thêm pool.

**Vấn đề:** **chưa có luồng nào** để "bán thêm pool cho đại lý". Hiện chỉ có nút "Mở subscription".

**Câu hỏi:** bán thêm pool = **sửa hợp đồng** (thêm/ tăng pool item, UC-CON-04) hay **ký phụ lục/hợp đồng mới**?

Giang: chưa giải ở phase này. 
---

### 🟠 Q10. Người phụ trách khách hàng (chặn view Cơ hội)

**Bối cảnh:** Hiện **Sales A nhìn thấy cơ hội của mọi khách hàng**, kể cả khách của Sales B → hai người có thể gọi trùng một khách.

**Vấn đề:** data model **không có** trường *người phụ trách* trên CUSTOMER.

**Câu hỏi:** có bổ sung mô hình "khách hàng này ai phụ trách" không? Nếu có → thêm vào CUSTOMER (M-01) và lọc view Cơ hội theo người phụ trách. Nếu không → chấp nhận gọi trùng, hay để Manager phân công thủ công ngoài hệ thống?

Giang: Tạm thời cơ chế phân quyền, assign này nằm ngoài scope. 
Bạn có thể thể hiện thêm thông tin sale phụ trách từ người thực hiện tạo subscription. 

---

## NHÓM D — Phân quyền & persona

### 🟠 Q11. Auditor có xem được module License & Usage không?

PRD có persona **Auditor** (chỉ đọc), nhưng FRS UC-LIC-01/02 tôi **không liệt kê** Auditor trong Tác nhân.

**Câu hỏi:** Auditor có được xem danh sách + chi tiết license không? (Đã chốt: Auditor **không** được bấm Đồng bộ lại.)

**Đề xuất của tôi:** **Có** — xem được tất cả, không có nút nào tạo tác động.

Giang: Theo đề xuất của bạn
---

### 🟡 Q12. Tên capability

Tôi tự đặt: `usage.force_sync` · `license.view_portal_link` · `license.view_mismatch` · `license:view`.

**Câu hỏi:** có quy ước đặt tên quyền chung của dự án chưa? (dạng `module:action` hay `module.action`?)

Giang: chưa có, bạn phân tích tổng thể rồi đề xuất. 

---

### 🟠 Q13. Khách hàng on-premise

**Bối cảnh:** on-prem không có kênh cập nhật tự động → không có license mirror/usage.

**Câu hỏi:** subscription on-prem **có xuất hiện** trong danh sách License & Usage không?
- **(a)** Không hiện — không có gì để quan sát.
- **(b)** Hiện, nhưng gắn nhãn "Không theo dõi tự động" và loại khỏi mọi cảnh báo.

**Đề xuất của tôi:** **(b)** — để Sales không tưởng là dữ liệu bị mất.

Giang: chọn B. 
---

## NHÓM E — Phân loại & mức độ

### 🟠 Q14. Thang mức độ sự cố

PRD chỉ định nghĩa **P1/P2** cho riêng cảnh báo lệch trạng thái. Tôi mở rộng thành **Cao / Trung bình / Thấp** cho cả 3 loại sự cố (lệch · chưa cập nhật · bất thường dữ liệu).

**Câu hỏi:** duyệt thang 3 mức này không? Nếu có, có cần map ngược về P1/P2 khi gửi cảnh báo cho đội vận hành không?

giang: duyệt
---

### 🟠 Q15. Lệch kiểu B có phải mức "Cao" không?

- **Kiểu A** (sub đã dừng, license vẫn chạy → KH dùng miễn phí): PRD nói **ưu tiên cao** ✔
- **Kiểu B** (sub còn hiệu lực, license đã ngừng → **KH mất dịch vụ**): PRD **không nói rõ**. Tôi tự xếp **Cao**.

**Câu hỏi:** giữ B ở mức **Cao** (mất khách + uy tín cũng đắt ngang mất tiền), hay hạ xuống **Trung bình** cho sát PRD?

Giang: Có. giữ mức cao. Chú ý định nghĩa rõ logic phân loại mức độ nghiêm trọng. logic phải rành mạch rõ dàng và khả thi với dữ liệu mà hệ thống có thể lấy được. Và đương nhiên phải đảm bảo tính hữu dụng trong nghiệp vụ của người dùng. 
---

### 🟡 Q16. Ngưỡng kép cho banner sự cố diện rộng

Tôi tự đặt: cảnh báo khi **≥ 3 license** *và* **≥ 30%** số license đang hoạt động của sản phẩm đó.

**Câu hỏi:** hai con số này ổn không? (Lý do dùng ngưỡng kép: sản phẩm 200 license thì 3 cái hỏng là bình thường; sản phẩm 5 license thì 3 cái là thảm hoạ.)

Giang: nếu 5 license mà 3 cái fail thì > 30% rồi, cần gì phải thêm điều kiện >= 3 license?

---

### 🟡 Q17. Hạn mức Force Sync theo người dùng

Tôi tự thêm: **20 lượt/giờ/người** (PRD chỉ có 1 lượt/subscription/5 phút).

**Lý do:** giới hạn theo subscription **không chặn được** người quét 500 subscription khác nhau → dội 500 yêu cầu vào sản phẩm.

**Câu hỏi:** duyệt con số 20/giờ? Hay để sản phẩm tự bảo vệ mình bằng cơ chế chặn tải?

Giang: Không giới hạn, vì giả sử trong trường hợp hệ thống vừa khôi phục, có thể cần đồng bộ lại nhiều bản ghi cùng lúc để update trạng thái mới nhất. 
---

## NHÓM F — Phạm vi

### 🟡 Q18. LICENSE_INSTANCE (License đã phát hành)

Đã thống nhất **hoãn sang phase sau**. Nhưng khi làm sẽ phải chốt:

**Câu hỏi:** CRM có mirror **toàn bộ** license instance không?
- **(a)** Có → phân trang trong CRM (đúng FR-LIC-05 BR-05.3 hiện tại), nhưng CRM phải lưu hàng chục nghìn bản ghi runtime **không phục vụ mục đích thương mại nào** — sát ranh giới YT-4.
- **(b)** Không → tra cứu tại trang quản trị sản phẩm, và **phải sửa BR-05.3 trong PRD**.

Giang: Lý do gì bạn khẳng định không phục vụ mục đích thương mại nào?
---

### 🟠 Q19. Cảnh báo hiện là mô hình "kéo"

Người dùng **phải mở màn** mới thấy sự cố. Push notification thuộc **M-08** (chưa làm).

**Câu hỏi:** nếu M-08 chưa xong khi golive M-05 → có cần **quy trình trực ban thủ công** (License Admin mở dashboard mỗi ngày N lần) không? Ai chịu trách nhiệm?

Giang: tôi sẽ viết luôn M-08 trước release. 

---

### 🟡 Q20. Module Catalog vẫn hiển thị giá

Bạn đã chốt **bỏ hoàn toàn scope về giá**. Nhưng module **Sản phẩm & Gói (M-04, demo v2.5)** vẫn còn cột **giá** trong danh sách gói và trường giá trong form tạo/sửa gói.

**Câu hỏi:** gỡ giá khỏi M-04 (demo + PRD §5.3.5 PACKAGE) luôn không? Việc này đụng vào phần v2.5 đã chốt nên tôi chưa tự làm.

Giang: bạn check lại các module đó. bỏ thông tin giá đi. 
---

## Bảng theo dõi trả lời

| # | Câu hỏi | Mức | Trả lời | Ngày chốt |
|---|---|---|---|---|
| Q1 | Ngưỡng chờ kích hoạt EDR | 🔴 | **(c)** Chỉ kiểm tra khi sản phẩm khai báo ngưỡng; EDR để trống → không kiểm tra | 13/07/2026 |
| Q2 | Force Sync khi license hết hạn | 🟠 | **Vẫn cho phép** — đúng lúc lệch là lúc cần hỏi lại sản phẩm | 13/07/2026 |
| Q3 | "Sắp hết hạn" — KPI vs bộ lọc | 🟠 | Bộ lọc theo **hạn license**: Đã quá hạn · Còn dưới 30/60/90 ngày (không lẫn với ân hạn) | 13/07/2026 |
| Q4 | Chu kỳ đẩy dữ liệu từng sản phẩm | 🔴 | **24h** cho mọi sản phẩm (usage) → ngưỡng chưa-cập-nhật **48h**. Đổi trạng thái phải đồng bộ **< 15 phút** | 13/07/2026 |
| Q5 | SLA lệch theo sản phẩm | 🟠 | **15 phút** cho mọi sản phẩm | 13/07/2026 |
| Q6 | Ngưỡng gia hạn & sắp dùng hết | 🟠 | Báo gia hạn **60 ngày** · sắp dùng hết **90%** — đều **cấu hình được** | 13/07/2026 |
| Q7 | 3 số liệu triển khai EDR | 🔴 | Hết chặn dev nhờ Q1(c). Vẫn nên hỏi đội EDR cho phase sau (OQ-LIC-02) | 13/07/2026 |
| Q8 | Luồng "bán thêm số lượng" | 🔴 | Có thể nâng cấp **hoặc** mua sub mới — **luồng chưa định nghĩa**; tạm giữ nút "Mở subscription" | 13/07/2026 |
| Q9 | Bán thêm pool cho đại lý | 🟠 | **Chưa giải ở phase này** | 13/07/2026 |
| Q10 | Người phụ trách khách hàng | 🟠 | Phân công/phân quyền **ngoài phạm vi**; hiển thị *Sales phụ trách* = **người tạo subscription** | 13/07/2026 |
| Q11 | Auditor xem được không | 🟠 | **Có** — xem danh sách + chi tiết, không có nút tạo tác động | 13/07/2026 |
| Q12 | Quy ước tên quyền | 🟡 | **`{tài_nguyên}:{hành_động}`** → `license:view` · `license:force_sync` · `license:view_portal` · `license:view_issues` | 13/07/2026 |
| Q13 | Khách on-premise | 🟠 | **(b)** Vẫn hiện + nhãn "Không theo dõi tự động", **loại khỏi mọi cảnh báo** | 13/07/2026 |
| Q14 | Thang mức độ Cao/TB/Thấp | 🟠 | **Duyệt** — kèm bảng quyết định chỉ dùng 4 trường CRM đã có | 13/07/2026 |
| Q15 | Lệch kiểu B = Cao? | 🟠 | **Giữ mức Cao**; logic phân loại viết lại thành bảng quyết định rành mạch (UC-LIC-04 BR-09…BR-13) | 13/07/2026 |
| Q16 | Ngưỡng kép banner | 🟡 | **Giữ cả hai** — tỷ lệ chặn đầu sản phẩm lớn, số tuyệt đối chặn đầu sản phẩm nhỏ (1–2 dòng thì banner không gộp được gì) | 13/07/2026 |
| Q17 | Hạn mức Force Sync/người | 🟡 | **Bỏ** — vận hành cần đồng bộ hàng loạt sau sự cố. Giữ 1 lượt/sub/5 phút | 13/07/2026 |
| Q18 | LICENSE_INSTANCE mirror đủ? | 🟡 | Hoãn phase sau. Đề xuất: khai báo `instance_mirror_mode` = FULL / COUNT_ONLY / NONE theo độ hạt của instance | 13/07/2026 |
| Q19 | Trực ban khi chưa có M-08 | 🟠 | **M-08 sẽ viết trước release** → cảnh báo được đẩy chủ động | 13/07/2026 |
| Q20 | Gỡ giá khỏi M-04 | 🟡 | **Gỡ** — đã bỏ `price` khỏi PACKAGE (PRD §5.3.5) và khỏi demo | 13/07/2026 |
