# ★ Dòng Thời Gian Lịch Sử Việt Nam

Trang web tĩnh hiển thị các sự kiện lịch sử Việt Nam theo **dòng thời gian**,
dựng bằng **TimelineJS v3 (KnightLab)** đã **Việt hóa** nhãn giao diện. Mỗi sự
kiện kèm mô tả và **bài báo liên quan**. Có trang quản lý để tự thêm/sửa sự kiện.

Chạy hoàn toàn phía client, không cần server, deploy thẳng lên **GitHub Pages**.

## Tính năng

- **TimelineJS (KnightLab)**: slide ngang, zoom theo năm, thanh điều hướng thời
  gian ở dưới, nhóm theo thời kỳ (Dựng nước, Bắc thuộc, Phong kiến, Pháp thuộc,
  Hiện đại, Thống nhất & đổi mới).
- **Việt hóa**: nhãn giao diện (tháng, "Đang tải", nút điều hướng, năm TCN...)
  qua file ngôn ngữ `assets/js/vi.json`.
- **Bài báo liên quan**: mỗi sự kiện gắn nhiều link bài báo/nguồn, hiện trong
  nội dung slide, mở ở tab mới. Nếu sự kiện không có ảnh, bài báo đầu tiên được
  dùng làm media (TimelineJS tự tạo preview với nguồn hỗ trợ như Wikipedia).
- **Trang quản lý** (`manage.html`): thêm/sửa/xóa sự kiện (năm, tháng, ngày,
  tiêu đề, thời kỳ, tóm tắt, ảnh, thẻ, danh sách bài báo). Lưu trong trình
  duyệt (localStorage), **Xuất/Nhập JSON** để đưa vào mã nguồn.
- **Hỗ trợ năm trước Công nguyên**: nhập năm âm (vd `-2879`) hiển thị "TCN".
- Tông đỏ–vàng theo cờ Việt Nam.

## TimelineJS nạp từ đâu?

CSS/JS của TimelineJS nạp qua CDN chính thức của KnightLab:

```
https://cdn.knightlab.com/libs/timeline3/latest/css/timeline.css
https://cdn.knightlab.com/libs/timeline3/latest/js/timeline.js
```

Cần kết nối Internet để nạp thư viện. File dữ liệu `data/history.json` được
`assets/js/app.js` chuyển sang định dạng TimelineJS (`start_date` / `text` /
`media`) rồi khởi tạo `TL.Timeline` với `language: "assets/js/vi.json"`.

## Thêm / sửa sự kiện

Hai cách:

1. **Qua trang quản lý** (`manage.html`) — tiện thử nhanh. Dữ liệu lưu trong
   trình duyệt của bạn. Để công khai cho mọi người, bấm **Xuất JSON** rồi dán
   nội dung vào `data/history.json`.

2. **Sửa trực tiếp** `data/history.json`. Mỗi sự kiện có dạng:

```json
{
  "id": "dien-bien-phu-1954",
  "year": 1954,
  "month": 5,
  "day": 7,
  "era": "Đấu tranh giành độc lập hiện đại",
  "title": "Chiến thắng Điện Biên Phủ",
  "summary": "Mô tả ngắn gọn...",
  "image": "https://... (tùy chọn)",
  "tags": ["Điện Biên Phủ", "Genève"],
  "articles": [
    { "title": "Tên bài báo", "url": "https://..." }
  ]
}
```

- `year` bắt buộc; `month`, `day` tùy chọn. Năm **âm** = trước Công nguyên.
- `era` là tên thời kỳ (dùng để nhóm). Các sự kiện cùng `era` gom chung một mục.
- `articles` là mảng, mỗi phần tử cần ít nhất `url`.

## Chạy thử cục bộ

Vì trang dùng `fetch` để nạp `data/history.json`, mở trực tiếp bằng `file://`
có thể bị trình duyệt chặn. Chạy một server tĩnh:

```bash
python -m http.server 8000
# rồi mở http://localhost:8000
```

## Deploy lên GitHub Pages

1. Tạo repo tên `lichsuvietnam.github.io` (dạng user/organization pages) trên
   tài khoản `lichsuvietnam`, hoặc một repo bất kỳ rồi bật Pages.
2. Push toàn bộ thư mục này lên nhánh `main`.
3. **Settings → Pages → Build and deployment → Source** chọn
   **Deploy from a branch**, branch `main`, thư mục `/ (root)`, **Save**.
4. Đợi ~1 phút. Repo tên `<user>.github.io` sẽ chạy ở `https://<user>.github.io/`.

File `.nojekyll` đã có sẵn để GitHub Pages phục vụ tệp tĩnh trực tiếp.

## Cấu trúc

```
index.html              — trang dòng thời gian
manage.html             — trang quản lý sự kiện
data/history.json       — dữ liệu sự kiện (nguồn chính)
.nojekyll               — để GitHub Pages phục vụ tệp tĩnh
assets/
  css/  style.css, manage.css
  js/   app.js (trang chính), manage.js (quản lý), vi.json (ngôn ngữ TimelineJS)
  icons/ favicon.svg
```

> Dữ liệu sự kiện mẫu mang tính tham khảo giáo dục. Hãy đối chiếu nguồn chính
> thống khi dùng cho mục đích học thuật.
