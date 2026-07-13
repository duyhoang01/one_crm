# Quyết định — Versioning Gói sản phẩm & tác động M-02 / M-03 / M-04

> Đây là **nguồn đầu vào cho việc update PRD** (data model + module M-04 + changelog cho dev).
> Chốt ngày 10/07/2026 với BA. Mọi FR/BR mới phải bám đúng file này.

---

## 1. Quyết định gốc — Model versioning

### ✅ D0 — Chọn **Model A (Clone-forward)**

| | Nội dung |
|---|---|
| **Cách hoạt động** | Mỗi version = **1 bản ghi PACKAGE bất biến**, số tăng dần. Trạng thái (`DRAFT`/`ACTIVE`/`RETIRED`) nằm **trên bản ghi version**. **Rollback = tạo version MỚI (v+1)** sao chép cấu hình bản cũ; bản RETIRED **không đụng vào**. |
| **Không chọn** | Model B (re-activate + bảng `activation_history`) |
| **Lý do** | ① Data model đơn giản (trạng thái = 1 field), ít bug. ② `sub.package_id` ghim 1 version → cấu hình **đóng băng vĩnh viễn** (đúng **YT-2**: 1 sub : 1 package). ③ Đúng chuẩn ngành (Stripe Price immutable + archive; Confluence restore = tạo version mới). ④ Câu hỏi "ngày D bán cấu hình gì" là của **billing/compliance**, không phải câu hằng ngày của CRM passive-observer (**YT-1**) — Model B chỉ thắng ở đúng câu này. |
| **Đánh đổi (chấp nhận)** | ① Phình version number (rollback về v1 sinh v4 ≡ v1) → giảm nhẹ bằng field `rolledBackFrom`. ② Timeline "version nào ACTIVE lúc nào" không first-class → **bù bằng audit event có timestamp + actor cho mọi Publish/Retire** (bắt buộc). |

---

## 2. Quyết định vận hành (theo chuẩn thị trường VN)

### ✅ D1 — Gia hạn trên gói đã NGỪNG BÁN: **VẪN CHO PHÉP** (grandfathering)

- Sub gia hạn **giữ nguyên `package_id`** của sub cũ — **kể cả khi gói đó đã `RETIRED`**.
- **Lý do:** "Ngừng bán" là hành động **thương mại nội bộ** (không chào bán cho KH **mới**), KHÔNG phải chấm dứt dịch vụ với KH cũ.
  - HĐ đã ký ghi rõ gói + giá + điều khoản → ép đổi gói = **đổi điều khoản thương mại**, cần KH đồng ý.
  - KH khối nhà nước / ngân hàng: gói đã trúng thầu → đổi gói có thể phải **đấu thầu lại** → nguy cơ mất KH.
  - **YT-2**: doanh thu chủ yếu từ gia hạn → chặn gia hạn = tự chặn dòng doanh thu; Sales sẽ không bao giờ dám bấm "Ngừng bán".
- **Demo hiện tại đã đúng** (`subSubmitRenew`: `packageId: predecessor.packageId`) → **không cần sửa code**.

### ✅ D2 — Phạm vi chặn của "Ngừng bán" (RETIRED)

> **Chặn:** chọn gói khi **tạo HĐ mới** / **thêm gói vào HĐ**.
> **KHÔNG chặn:** tạo subscription mới **trong HĐ đã ký**, và **gia hạn**.

### ✅ D3 — HĐ **ghim version** tại thời điểm ký *(hệ quả logic của D1 + D2)*

- `CONTRACT` tham chiếu **`package_id` = 1 bản ghi version cụ thể**, KHÔNG phải "họ gói" (product + code).
- Mọi sub + gia hạn dưới HĐ đó dùng **đúng version đã ghim**, kể cả khi catalog đã publish version mới hoặc đã retire bản đó.
- Pool của HĐ **RESELLER** cũng ghim version.
- **Lý do:** KH nhận đúng cái đã ký; ngừng bán không phá HĐ đang chạy.

### ⛔ D4 — Nâng cấp lên version mới = **Upgrade**, KHÔNG phải gia hạn

- Đổi sub sang version mới là hành vi **có chủ đích, cần KH đồng ý** → chính là **Upgrade**.
- ⚠️ Đụng **OQ-06** (Upgrade/Downgrade) — **Phase 1 tạm reject `501 NOT_IMPLEMENTED`**.
- → Phase 1: **không được** ngầm "nâng cấp" qua đường gia hạn.

---

### ✅ D5 — **Pool ghim theo GÓI, không theo sản phẩm** *(chốt 13/07/2026)*

- `CONTRACT_POOL_ITEM` đổi khoá nghiệp vụ: `product_id` → **`package_id`**. `product_id` giữ lại làm **cột dẫn xuất** để hiển thị/lọc.
- UNIQUE `(contract_id, package_id)` — hai gói khác nhau của **cùng một sản phẩm** là **2 pool riêng biệt**.
- **Lý do:** pool theo `product_id` cho phép đại lý rút license của gói **đắt tiền** (vd EPR 4.5M) từ pool đã mua theo giá gói **rẻ** (vd EPP 800k) → **rò rỉ giá**.
- ⚠️ **Migration:** pool cũ có sub thuộc nhiều gói → phải **tách pool + chia lại `pool_total`**; cần BA/Sales xác nhận số liệu, không tự động được.

---

## 3. Việc phải sửa (input cho update PRD / FRS / demo)

> ✅ **Toàn bộ 11 mục dưới đây đã thực hiện xong ngày 13/07/2026** — xem §5.

| # | Module | Tài liệu | Nội dung |
|---|---|---|---|
| 1 | **M-04** | PRD data model | `PACKAGE`: bỏ `scope_template` (đã làm ở §5.3.5) và bỏ `tier`. Thêm `rolledBackFrom` (lineage rollback). |
| 2 | **M-04** | PRD §6.4 | **Base lại theo FRS UC-CAT-01..07** (bỏ FR-CAT cũ). **Bổ sung FR còn thiếu: Xóa gói nháp (hard delete, chỉ DRAFT) và Rollback (clone-forward v+1)** — PRD hiện chỉ có Publish/Retire. |
| 3 | **M-04** | PRD §6.9.3 (EDR Package Schema) | Bỏ `tier`, bỏ `scope_template.tenant_mode_options` (scope đã chuyển sang SUBSCRIPTION). |
| 4 | **M-04** | PRD + FRS UC-CAT-07 | BR "Ngừng bán": ghi rõ phạm vi chặn theo **D2**. |
| 5 | **M-04** | PRD | Bắt buộc **audit event có timestamp + actor** cho mọi Publish / Retire / Delete / Rollback (bù điểm yếu Model A). |
| 6 | **M-04** | PRD | Làm rõ **clone-on-edit**: `DRAFT` hoặc `ACTIVE`-chưa-có-sub → sửa tại chỗ; `ACTIVE`-đã-có-sub → tạo version mới nháp. Và **chọn tính năng Model B** (package tick feature từ `featureCatalog` ở **mức Feature**; loại "Mặc định" luôn khóa). Và **gộp phiên bản hiện hành** ở màn danh sách (ưu tiên ACTIVE > DRAFT > RETIRED). |
| 7 | **M-02** | PRD data model + FRS UC-CON-02 | `CONTRACT` ghim `package_id` = **version cụ thể** (D3). Danh sách chọn gói khi tạo HĐ **chỉ hiện `ACTIVE`**. Pool RESELLER cũng ghim version. |
| 8 | **M-03** | FRS UC-SUB-02 | Gói **kế thừa từ HĐ (đã ghim version)** — KHÔNG lấy bản `ACTIVE` hiện hành của catalog. |
| 9 | **M-03** | FRS UC-SUB-07 (Gia hạn) | Ghi rõ **D1**: sub kế tiếp giữ nguyên `package_id`, kể cả gói `RETIRED`. Muốn đổi version = **Upgrade → OQ-06, Phase 1 chưa hỗ trợ** (D4). |
| 10 | **M-03** | PRD §6.9.6 (outbound) | Payload `subscription.created` phải gửi **`package_code` + `package_version`** (không chỉ tên) để Product biết chính xác cấu hình đã bán (**YT-3**). |
| 11 | **Demo** | `v2.5.0_catalog.html` | Hợp nhất nguồn gói: `CON_PACKAGES_BY_PRODUCT` (M-02/M-03, **không có** `status`/`version`) → dùng chung `CAT_PACKAGES` (lọc `ACTIVE` khi tạo HĐ). *Hiện là 2 mock tách rời.* |

> **Mức độ tác động M-02 / M-03: MEDIUM** — sửa BR + data model + 1 dòng payload. **KHÔNG cần migration dữ liệu** (`sub.package_id` vốn đã ghim version). Không đụng anchor **YT-1 / YT-4**.

---

## 4. Open Questions — hoãn, xử lý phase sau

| OQ | Nội dung | Trạng thái |
|---|---|---|
| **OQ-CAT-01** | **EOL (End of Life)** — tách 2 khái niệm đang bị gộp:<br>• `RETIRED` = **thương mại**, ngừng chào bán KH mới → **gia hạn vẫn OK** (D1).<br>• `EOL` = **kỹ thuật**, Product khai tử, không cấp license nữa → **gia hạn KHÔNG được**, bắt buộc migrate.<br>EOL là quyết định của **Product Module**, không phải Sales/CRM (**YT-1** — CRM chỉ *biết* qua khai báo/webhook). | ⏸ **Phase sau** |
| **OQ-CAT-02** | **Hint upsell** khi gia hạn trên gói `RETIRED` ("Gói đã ngừng bán, bản hiện hành là v{n} — cân nhắc tư vấn KH nâng cấp") → biến dọn catalog thành cơ hội bán (**YT-2**). | ⏸ **Làm sau** |
| **OQ-CAT-03** | Có thêm **`change_note`** bắt buộc cho mỗi version (lý do thay đổi) + màn **so sánh diff 2 version**? | ⏸ Chưa chốt |
| **OQ-CAT-04** | **On-prem = perpetual** (license trọn đời) — có kèm **maintenance term** (cái mới renew được) không? Ảnh hưởng **YT-2**. | ⏸ Phase on-prem |

---

## 5. Đã thực hiện (13/07/2026)

| Hạng mục | File | Nội dung |
|---|---|---|
| **Demo** | `docs/demo/v2.5.0_catalog.html` | Hợp nhất nguồn gói: `CON_PACKAGES_BY_PRODUCT` build từ `CAT_PACKAGES` lọc `ACTIVE`. Pool mang `packageId`/`packageName`. HĐ DIRECT có mục chọn gói. Tạo sub kế thừa gói từ HĐ/pool. Gia hạn & sửa sub tra `duration` qua `conPkgAny` (đúng cả gói `RETIRED`). |
| **FRS M-02** | UC-CON-01 v1.1 · UC-CON-02 v1.1 · UC-CON-03 v1.5 · UC-CON-04 v1.1 | BR-07…BR-10 (UC-CON-02): DIRECT bắt buộc 1 gói · dropdown chỉ `ACTIVE` · HĐ ghim `package_id` · mỗi gói tối đa 1 pool. UC-CON-04 BR-02 viết lại + BR-07. Hiển thị pool theo tên gói + phiên bản. |
| **FRS M-03** | UC-SUB-02 v1.3 · UC-SUB-07 v1.2 | BR-12 (gói kế thừa từ HĐ đã ghim). BR-10 (gia hạn giữ `package_id` kể cả `RETIRED`) + BR-11 (đổi version = Upgrade → OQ-06, `501`). |
| **PRD** | `docs/prd/OneCRM_PRD_v2.5.md` | **§0 Changelog cho Dev** (D0–D5, việc theo module, migration). §5.3.2b `CONTRACT_PACKAGE` (mới). §5.3.3 `CONTRACT_POOL_ITEM` đổi khoá sang `package_id`. §5.3.5 PACKAGE + `rolled_back_from`. **§6.4 M-04 viết lại theo FRS UC-CAT-01..07** (thêm FR Xóa nháp + Rollback). §6.9.3 gỡ `tier`/`scope_template`. §6.9.6 payload thêm `package_code` + `package_version`. OQ-CAT-01..05. |

### ✅ D6 — HĐ DIRECT: **1 gói / 1 HĐ** *(chốt 13/07/2026)*

- Phase 1: mỗi HĐ `DIRECT` ghim **đúng 1 gói**. Bán nhiều gói cho 1 KH → **tách nhiều HĐ**.
- Bảng `CONTRACT_PACKAGE` giữ dạng **1:N** để nếu phase sau cần nhiều gói/HĐ thì **chỉ nới ràng buộc ở application layer**, không phải migration schema.
- Ghi chú PRD v2.2 *"HĐ DIRECT nhiều product là hợp lệ"* **không còn hiệu lực** ở Phase 1.

---

## 6. Liên quan

- Plan đồng bộ BPMN ↔ FRS: [`M-04_bpmn_sync_plan.md`](./M-04_bpmn_sync_plan.md)
- FRS module Catalog: `docs/frs/catalog/UC-CAT-01..07`
- Demo: `docs/demo/v2.5.0_catalog.html`
- PRD: `docs/prd/OneCRM_PRD_v2.5.md`
