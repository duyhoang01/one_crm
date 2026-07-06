# Checklist Review UI/UX

> Áp dụng khi review file demo HTML trước khi chốt giao diện module.
> Claude tự review và list open questions. Bạn bổ sung thêm rule tại mục 4.

---

## 1. Design System

- [ ] Màu sắc đúng token: primary `#0268C5`, navy `#1F2533`, text-secondary `#636363`, danger `#FB2C36`
- [ ] Font Inter, font-size nhất quán (14px body, 13px secondary, 12px caption)
- [ ] Border radius nhất quán: `r-sm: 8px`, `r-md: 12px`, `r-lg: 16px`
- [ ] Shadow dùng đúng biến: `shadow-md`, `shadow-lg`
- [ ] Spacing nhất quán với module đã có (Customer)

## 2. Components

- [ ] Badges dùng đúng màu theo loại (B2B, Reseller, B2C, Other; contract status)
- [ ] Buttons có đủ states: default, hover, disabled, loading
- [ ] Form fields có focus state: border `#0268C5` + box-shadow `rgba(2,104,197,.1)`
- [ ] Empty states có icon + message + CTA
- [ ] Toast notifications nhất quán (success green, error red, info navy)
- [ ] Modals có animation `modal-in`, ESC close, backdrop click close

## 3. UX

- [ ] Destructive actions (xóa) có bước xác nhận
- [ ] Form validation hiển thị lỗi inline dưới field
- [ ] Table có sort, search, filter, pagination
- [ ] Loading state ngăn double-submit
- [ ] Breadcrumb đúng với context hiện tại
- [ ] Sidebar active state đúng khi navigate

## 4. Quy tắc bổ sung (bạn cập nhật)

<!-- Thêm rule tại đây -->
- [ ] {Rule 1}
- [ ] {Rule 2}
