# Deploy lên Render — cho nhiều người dùng thử chung 1 bản

## Trước khi bắt đầu

Tool đã được sửa để nhiều người dùng chung 1 backend an toàn — ai kết nối store nào thì
chỉ trình duyệt người đó dùng được store đó (xem `backend/src/session.ts`). Không có
đăng nhập tài khoản kiểu email/password — "đăng nhập" chính là việc kết nối 1 store qua
Sapo OAuth hoặc Private App.

**Lưu ý về dữ liệu**: `backend/data/store-connections.json` lưu token kết nối của mọi
người. Trên Render, dữ liệu này nằm trên 1 persistent disk (gói trả phí, ~$7/tháng +
phí disk nhỏ) — **free tier của Render xóa sạch ổ đĩa mỗi lần service tự ngủ/khởi động
lại**, không phù hợp cho tool này (ai cũng phải kết nối lại liên tục).

## Bước 1 — Đẩy code lên GitHub (bạn tự làm, cần đăng nhập tài khoản GitHub của bạn)

Code đã được commit sẵn ở local (`git log` để xem). Bạn tạo 1 repo GitHub mới (trống,
không cần README/license), rồi chạy đúng 3 lệnh dưới trong thư mục
`/home/sapo/Desktop/AIProductGenerator` (thay `<url-repo-cua-ban>`):

```bash
git remote add origin <url-repo-cua-ban>
git branch -M main
git push -u origin main
```

## Bước 2 — Deploy Blueprint trên Render

1. Vào [dashboard.render.com](https://dashboard.render.com) → **New** → **Blueprint**.
2. Chọn repo GitHub vừa đẩy code lên. Render tự đọc `render.yaml` ở gốc repo.
3. Render sẽ hỏi nhập giá trị cho các biến đánh dấu `sync: false` — nhập trực tiếp
   trên dashboard (không dán vào chat với tôi):
   - `PEXELS_API_KEY`
   - `OPENAI_API_KEY`
   - `SAPO_OAUTH_CLIENT_ID`
   - `SAPO_OAUTH_CLIENT_SECRET`
4. Bấm **Apply** — Render tạo 2 service: `sapo-ai-tool-backend` (Node, gói `starter`
   trả phí + disk 1GB) và `sapo-ai-tool-frontend` (static site, miễn phí).

`render.yaml` đã tự cấu hình sẵn `APP_URL`, `CORS_ORIGIN`, `VITE_BACKEND_URL` trỏ đúng
domain dự kiến (`https://sapo-ai-tool-backend.onrender.com` /
`https://sapo-ai-tool-frontend.onrender.com`). Nếu khi tạo Blueprint bạn đổi tên service
khác đi, Render sẽ cấp domain khác — sửa lại đúng 3 biến này trong
`render.yaml` (mục `envVars` của từng service) cho khớp rồi commit + push lại.

## Bước 3 — Kiểm tra sau khi deploy xong

```bash
curl https://sapo-ai-tool-backend.onrender.com/health
```

Mở `https://sapo-ai-tool-frontend.onrender.com`, thử kết nối 1 store qua OAuth — luồng
mở popup vẫn hoạt động y hệt local, chỉ khác domain.

## (Không bắt buộc) Cập nhật Sapo Partner Portal

`redirect_uri` của OAuth được tool tự dựng từ `APP_URL` lúc chạy (không cần đăng ký sẵn
trên Sapo Partner Portal — form tạo app của Sapo không có trường Redirect URL, xem ghi
chú trong `backend/src/oauth.ts`), nên **không bắt buộc** phải sửa gì trên Partner
Portal để OAuth chạy được. Chỉ nên cập nhật nếu bạn muốn app hiển thị đẹp/đúng khi liệt
kê công khai: `Application Url`, `Preference Url`, `Support Url` → domain frontend thật.

## Cập nhật code sau này

Mỗi lần sửa code xong, `git add` + `git commit` + `git push` — Render tự động build và
deploy lại theo commit mới trên nhánh `main`.
