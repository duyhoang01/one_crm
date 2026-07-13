# RELEASE NOTE — OneCRM PRD v2.4 → v2.5

> **Ngày:** 13/07/2026 · **Người soạn:** Nguyễn Công Giang
> **Đối tượng:** Dev (BE + FE), QA
> **Đọc gì tiếp:** DDL đầy đủ tại **PRD v2.5 §0.3** · Data model tại **§5.3** · Đặc tả M-04 tại **§6.4** + FRS `docs/frs/catalog/`

---

## 1. Tóm tắt trong 30 giây

v2.5 làm **2 việc**:

1. **Bổ sung module M-04 Product & Package Catalog** — trước chỉ có FR sơ bộ, nay có đặc tả đầy đủ (7 UC + BPMN + AC), kèm **versioning gói**.
2. **Versioning gói kéo theo thay đổi lan sang M-02 (Hợp đồng) và M-03 (Subscription)** — có **1 thay đổi BREAKING ở DB**.

⚠️ **Thay đổi BREAKING duy nhất:** `contract_pool_item` đổi khoá nghiệp vụ từ **`product_id` → `package_id`**. Pool giờ gắn theo **gói**, không theo **sản phẩm**.

---

## 2. Thay đổi DB (bắt buộc ALTER)

| # | Bảng | Thay đổi | Mức độ |
|---|---|---|---|
| 1 | **`contract_pool_item`** | Thêm `package_id` (NOT NULL, FK → `package`). Đổi UNIQUE `(contract_id, product_id)` → **`(contract_id, package_id)`**. `product_id` **hạ cấp thành cột dẫn xuất**, chỉ để hiển thị/lọc. | ⚠️ **BREAKING** |
| 2 | **`contract_package`** | **Bảng mới.** HĐ `DIRECT` ghim gói. UNIQUE `(contract_id, package_id)` + unique index `(contract_id)` để enforce **1 gói / 1 HĐ** ở Phase 1. | Mới |
| 3 | **`package`** | Thêm `rolled_back_from` (UUID, nullable, FK self). Đổi UNIQUE `(product_id, code)` → **`(product_id, code, version)`** — 1 họ gói có nhiều version. | Nhẹ |
| 4 | **`subscription`** | **Không đổi.** `package_id` vốn đã ghim 1 version cụ thể. | — |
| 5 | **`contract`** | **Không đổi cột.** Gói tách sang bảng `contract_package`. | — |
| 6 | `product_module_config.package_schema` (jsonb) | Gỡ `tier`, `tenant_mode`, `scope_template` khỏi schema EDR. `tenant_mode` chuyển thành **scope per-subscription** (`scope_schema`). | Data-level |

**DDL:** PRD v2.5 **§0.3.2** · **Reseed:** **§0.3.3**

> ✅ **Xác nhận: DB hiện tại là DỮ LIỆU TEST, chưa lên production.**
> → Đường thực thi: chạy **DDL §0.3.2** (có `TRUNCATE contract_pool_item`) → **reseed §0.3.3** → chạy 3 query rào chắn.
> → **Không backfill.** Mục backfill (§0.3.4) chỉ dùng cho các lần đổi schema **sau khi đã có production** — lần này bỏ qua.

**Reseed cần đảm bảo có đủ các tình huống test:**

- ít nhất 1 **họ gói đa version** (`DRAFT` + `ACTIVE` + `RETIRED`) → test Publish / Retire / Rollback
- ít nhất 1 **HĐ RESELLER có ≥ 2 pool** (2 gói khác nhau, nên có cả trường hợp 2 gói **cùng một sản phẩm**)
- ít nhất 1 **sub đang trỏ gói `RETIRED`** → test grandfathering (D1: gia hạn vẫn phải chạy được)

Bộ seed tham chiếu: `docs/demo/v2.5.0_catalog.html` (`CAT_PACKAGES`, `conContracts`) — đã dựng sẵn đủ 3 tình huống trên.

---

## 3. Quy tắc nghiệp vụ mới (dev phải enforce)

| Mã | Quy tắc | Enforce ở đâu |
|---|---|---|
| **D0** | **Versioning Model A (clone-forward).** Mỗi version gói = 1 bản ghi `package` **bất biến**. Trạng thái nằm trên bản ghi version. **Rollback = tạo version mới `v+1`** sao chép cấu hình bản cũ (`rolled_back_from`), **không** bật lại bản `RETIRED`. | M-04 service |
| **D1** | **Grandfathering.** Gia hạn **giữ nguyên `package_id`** — **kể cả gói đã `RETIRED`**. Không chặn gia hạn vì gói ngừng bán. `duration_months` lấy từ **đúng version đã ghim**. | M-03 renew |
| **D2** | **Phạm vi chặn của `RETIRED`.** **Chặn:** chọn gói khi tạo HĐ mới / thêm pool. **KHÔNG chặn:** tạo sub trong HĐ đã ký, gia hạn. | M-02 dropdown |
| **D3** | **HĐ ghim phiên bản.** `contract_package.package_id` / `contract_pool_item.package_id` trỏ **1 bản ghi version cụ thể**. Catalog publish v mới hay retire v cũ **không** đụng HĐ đã ký. | M-02 + M-03 |
| **D4** | **Đổi version = Upgrade, không phải gia hạn.** Modal gia hạn **không có** lựa chọn đổi gói. Upgrade thuộc **OQ-06** → Phase 1 trả **`501 NOT_IMPLEMENTED`**. | M-03 API |
| **D5** | **1 pool = 1 gói.** 1 HĐ RESELLER có **N pool**. Hai gói khác nhau của **cùng một sản phẩm** = **2 pool riêng biệt**. Trừ pool tra theo `package_id`, **không** theo `product_id`. | DB constraint + M-02/M-03 |
| **D6** | **HĐ DIRECT: 1 gói / 1 HĐ** (Phase 1). Bán nhiều gói cho 1 KH → tách nhiều HĐ. | DB unique index |
| **C6** | **Clone-on-edit.** Sửa gói `DRAFT` **hoặc** `ACTIVE`-**chưa có sub** → update tại chỗ. Sửa gói `ACTIVE`-**đã có sub** → sinh version mới `DRAFT`, bản đang chạy giữ nguyên. | M-04 service |
| **C5** | **Audit bắt buộc.** Mọi **Publish / Retire / Delete / Rollback** phải ghi `audit_log` có **`timestamp` + `actor`**. Thiếu audit → không trả lời được *"ai ngừng bán gói này, lúc nào"* (điểm bù cho Model A). | M-04 service |

> **Vì sao D5 quan trọng:** pool khoá theo `product_id` cho phép đại lý rút license **gói đắt** (CMC EPR ~4.5tr/seat) từ pool đã mua theo giá **gói rẻ** (CMC EPP ~800k/seat) → **rò rỉ giá, sai tiền thật**. Ràng buộc `UNIQUE (contract_id, package_id)` **không được nới**.

---

## 4. Thay đổi theo module

### M-04 Product & Package Catalog — **mới, §6.4 viết lại hoàn toàn**

- FR-CAT-01..09 cũ **bị thay thế**. §6.4 nay base theo FRS **UC-CAT-01..07**.
- **FR mới mà v2.4 chưa có:** **Xóa gói nháp** (hard delete, chỉ `DRAFT`) và **Rollback** (clone-forward `v+1`).
- Vòng đời version: `DRAFT` → *(Publish)* → `ACTIVE` → *(Retire / bị version mới thay thế)* → `RETIRED` (**terminal**).
- Publish version mới → version `ACTIVE` cũ **tự động `RETIRED`**. Trong 1 họ gói chỉ có **tối đa 1 version `ACTIVE`**.
- **Tính năng tick ở mức Feature** (không ở mức module, không tách lẻ CRUD). Feature loại **"Mặc định"** luôn include và **khóa**.
- Màn danh sách gói: **1 dòng / 1 họ gói**, chọn phiên bản hiện hành theo ưu tiên **`ACTIVE` > `DRAFT` > `RETIRED`**.
- **Bỏ `tier`, bỏ `scope_template`** khỏi PACKAGE.

**FRS:** `docs/frs/catalog/UC-CAT-01..07` (đủ BPMN + giao diện + AC)

### M-02 Contract Management

| Việc | Chi tiết |
|---|---|
| HĐ DIRECT **bắt buộc chọn 1 gói** khi tạo | Lưu vào `contract_package` (D3, D6) |
| Pool **ghim theo gói** | `contract_pool_item.package_id` (D5) |
| Dropdown gói **chỉ hiện `ACTIVE`** | Áp dụng cả tạo HĐ và thêm pool (D2) |
| Trừ/kiểm tra pool tra theo `package_id` | Mọi chỗ `poolItems.find(p => p.product_id === X)` → **`p.package_id === X`** |
| Hiển thị pool theo **tên gói + phiên bản** | Danh sách HĐ, chi tiết HĐ, timeline, audit — dùng `package_name` (`v{n}`) thay `product_name` |

**FRS đã cập nhật:** UC-CON-01 v1.1 · **UC-CON-02 v1.1** (BR-07…BR-10) · UC-CON-03 v1.5 · **UC-CON-04 v1.1** (BR-02 viết lại + BR-07)

### M-03 Subscription Management

| Việc | Chi tiết |
|---|---|
| Gói **kế thừa từ HĐ đã ghim** | `contract_package.package_id` (DIRECT) hoặc `pool.package_id` (RESELLER). **KHÔNG** tra bản `ACTIVE` hiện hành của catalog (D3) |
| Gia hạn **giữ nguyên `package_id`, kể cả `RETIRED`** | Không chặn gia hạn vì gói ngừng bán (D1) |
| Đổi version ≠ gia hạn | Modal gia hạn không có lựa chọn đổi gói; Upgrade → **`501`** (D4) |
| RESELLER: **1 pool = 1 option** trong dropdown gói | Không còn `optgroup` theo sản phẩm |
| **Outbound payload thêm `package_code` + `package_version`** | Event `subscription.created` / `subscription.renewed`. Product Module cần biết **chính xác cấu hình đã bán** (YT-3) — tên gói không phân biệt được v1 với v2. **Gia hạn gửi `package_version` của sub cũ**, kể cả gói `RETIRED`. |

**FRS đã cập nhật:** **UC-SUB-02 v1.3** (BR-12) · **UC-SUB-07 v1.2** (BR-10, BR-11)

---

## 5. Thay đổi ảnh hưởng FE

| Màn hình | Thay đổi |
|---|---|
| Tạo HĐ | HĐ `DIRECT` có thêm mục **"Gói sản phẩm"** (bắt buộc, chỉ gói `ACTIVE`). HĐ `RESELLER`: dòng pool chọn **gói** thay vì sản phẩm; chặn trùng gói. |
| Chi tiết HĐ | Accordion Pool License: header **"N gói"**, mỗi card hiển thị **tên gói + phiên bản** (dòng phụ: tên sản phẩm). Nút đổi thành **"＋ Thêm gói vào Pool"**. |
| Danh sách HĐ | Cột Pool License hiển thị `{packageName}: {used}/{total}` — **tên gói**, không phải tên sản phẩm. |
| Thêm Pool (modal) | Dropdown **Gói sản phẩm** (group theo sản phẩm, chỉ `ACTIVE`, loại trừ gói đã có pool) thay cho dropdown **Sản phẩm**. |
| Tạo Sub | Gói **readonly, auto-fill từ HĐ**. RESELLER ≥ 2 pool: dropdown mỗi pool 1 option kèm số license còn lại. |
| Gia hạn Sub | **Không có** lựa chọn đổi gói. Gói `RETIRED` **vẫn gia hạn được**. |
| Catalog (mới) | Kanban sản phẩm · chi tiết sản phẩm · danh sách gói · chi tiết gói (tab Thông tin/Tính năng/Phiên bản/Audit) · tạo/sửa gói · Publish/Ngừng bán/Xóa nháp/Rollback. |

**Demo tham chiếu:** `docs/demo/v2.5.0_catalog.html` — đã implement đầy đủ, dùng làm chuẩn giao diện.

---

## 6. Open Questions còn treo (Phase sau — **không block v2.5**)

| OQ | Nội dung |
|---|---|
| **OQ-CAT-01** | **EOL (End of Life)** — tách `RETIRED` (thương mại, gia hạn vẫn OK) khỏi `EOL` (kỹ thuật, Product khai tử → gia hạn KHÔNG được, phải migrate). EOL là quyết định của **Product Module**, không phải CRM (YT-1). |
| **OQ-CAT-02** | **Hint upsell** khi gia hạn trên gói `RETIRED`. |
| **OQ-CAT-03** | Bắt buộc **`change_note`** cho mỗi version + màn **so sánh diff 2 version**? |
| **OQ-CAT-04** | **On-prem = perpetual** (trọn đời) — có kèm **maintenance term** không? |
| **OQ-06** *(có sẵn)* | **Upgrade/Downgrade flow** — Phase 1 trả `501 NOT_IMPLEMENTED`. Liên quan trực tiếp D4. |

---

## 7. Checklist bàn giao

**DB (dữ liệu test — không backfill):**

- [ ] Chạy **DDL §0.3.2** trên DB dev (gồm `TRUNCATE contract_pool_item`)
- [ ] **Reseed §0.3.3**: `package` (đa version) · `contract_package` (1 gói/HĐ DIRECT) · `contract_pool_item` (1 pool = 1 gói) · `subscription` (có ≥ 1 sub trỏ gói `RETIRED`)
- [ ] Chạy **3 query rào chắn** §0.3.3 — cả 3 phải trả **0 dòng**

**Backend:**

- [ ] Sửa mọi query trừ/kiểm tra pool: `product_id` → **`package_id`**
- [ ] Dropdown chọn gói (tạo HĐ, thêm pool) lọc **chỉ `status = ACTIVE`** (D2)
- [ ] Tạo sub: lấy gói **từ HĐ đã ghim**, không tra bản `ACTIVE` hiện hành (D3)
- [ ] Gia hạn: **giữ nguyên `package_id`**, không chặn khi gói `RETIRED` (D1)
- [ ] Thêm **`package_code` + `package_version`** vào outbound event payload (YT-3)
- [ ] API Upgrade trả **`501 NOT_IMPLEMENTED`** (D4 / OQ-06)
- [ ] Ghi **audit có `timestamp` + `actor`** cho mọi Publish / Retire / Delete / Rollback (C5)
- [ ] Build M-04 theo FRS `docs/frs/catalog/UC-CAT-01..07` (gồm **Xóa nháp** + **Rollback** — 2 FR mới)

**Frontend:** theo §5 và demo `docs/demo/v2.5.0_catalog.html`
