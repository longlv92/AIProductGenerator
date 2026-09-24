# Đặc tả Tool: AI Product Generator cho Sapo

> Web tool cá nhân, tự động sinh **sản phẩm** và **tin tức (bài viết blog)** bằng AI và đẩy thẳng lên 1 store Sapo thật.
> Người dùng nhập URL + API Key/Secret của store (Private App) → chọn tab Sản phẩm hoặc Tin tức → cấu hình (danh mục/chủ đề, số lượng...) → AI sinh nội dung → xem lại, sửa nếu cần → đăng lên Sapo.

- **Phiên bản tài liệu:** 3.0 (bổ sung tính năng Tin tức)
- **Ngày:** 16/09/2026
- **Nền tảng đích:** Sapo (Sapo Web / Sapo Omnichannel)
- **Phạm vi sử dụng:** Công cụ cá nhân, 1 người dùng, kết nối 1 hoặc vài store của chính mình — **không phải** SaaS đa người dùng (xem mục 10.4).

---

## 1. Tổng quan

### 1.1. Vấn đề

Nhập sản phẩm thủ công lên website Sapo tốn nhiều thời gian: phải tự nghĩ tên, viết mô tả, đặt giá, gắn tag, chọn danh mục, tìm ảnh cho từng sản phẩm.

### 1.2. Giải pháp đã triển khai

1. Kết nối 1 store Sapo bằng **URL + API Key + API Secret** (Private App).
2. Nếu store đã có sẵn danh mục (collection) → chọn 1 hoặc nhiều danh mục có sẵn để rải sản phẩm vào. Nếu store chưa có danh mục nào → chọn **ngành nghề** dựng sẵn (app sẽ tạo danh mục mới khi đăng).
3. Nhập **số lượng**, **phân khúc giá**, **tỉ lệ ảnh**, và (tùy chọn) **yêu cầu bổ sung**.
4. Bấm **Tạo sản phẩm** → sinh nội dung bằng AI thật (Claude) nếu đã cấu hình key, hoặc dữ liệu mẫu local (miễn phí) nếu chưa → hiển thị danh sách sản phẩm dạng card/list/table.
5. Xem lại, **chỉnh sửa** từng sản phẩm, xóa bớt, chọn nhiều để xóa/đăng hàng loạt.
6. **Đăng lên Sapo** (từng sản phẩm hoặc hàng loạt) — tạo sản phẩm thật + gán danh mục thật + kèm ảnh thật.
7. Chuyển sang tab **📰 Tin tức** (cùng giao diện, dùng chung store đã kết nối) để sinh và đăng **bài viết blog** theo cùng nguyên lý — xem chi tiết ở mục 15.

### 1.3. Đối tượng người dùng

- Chủ shop Sapo muốn tự động lấp đầy sản phẩm mẫu/thật nhanh cho 1 hoặc vài store của mình.

---

## 2. Tính năng đã triển khai

| # | Tính năng | Trạng thái |
|---|-----------|-----------|
| F1 | Kết nối store Sapo bằng API Key/Secret (Private App), xác thực ngay khi nhập | ✅ Đã làm |
| F2 | Tự nhận diện danh mục có sẵn trên store, ẩn "Ngành nghề" nếu đã có danh mục | ✅ Đã làm |
| F3 | Chọn 1 hoặc nhiều danh mục, rải sản phẩm đều vào các danh mục đã chọn | ✅ Đã làm |
| F4 | Ngành nghề dựng sẵn (9 ngành) khi store chưa có danh mục | ✅ Đã làm |
| F5 | Sinh sản phẩm bằng AI thật (Claude), theo lô 5 sản phẩm/lần | ✅ Đã làm (cần tự cấu hình `ANTHROPIC_API_KEY`) |
| F6 | Dữ liệu mẫu local miễn phí, tự động dùng khi chưa cấu hình AI hoặc AI lỗi | ✅ Đã làm (fallback tự động, không gián đoạn trải nghiệm) |
| F7 | Tìm ảnh thật khớp sản phẩm qua Pexels, nhiều ảnh/sản phẩm, độ phân giải cao | ✅ Đã làm (cần tự cấu hình `PEXELS_API_KEY`) |
| F8 | Ảnh placeholder (gradient + emoji) khi chưa có ảnh thật | ✅ Đã làm |
| F9 | Chọn tỉ lệ ảnh (1:1, 4:3, 3:4, 16:9) | ✅ Đã làm |
| F10 | 3 kiểu hiển thị: Lưới / Danh sách / Bảng | ✅ Đã làm |
| F11 | Chọn nhiều sản phẩm (checkbox), xóa hàng loạt, đăng hàng loạt | ✅ Đã làm |
| F12 | Chỉnh sửa đầy đủ trường sản phẩm trước khi đăng (kể cả xem trước ảnh) | ✅ Đã làm |
| F13 | Đăng sản phẩm thật lên Sapo (`POST /admin/products.json`), kèm ảnh, gán danh mục | ✅ Đã làm |
| F14 | Tự tạo danh mục mới trên Sapo nếu chọn ngành nghề (chưa có danh mục sẵn) | ✅ Đã làm (find-or-create, tránh tạo trùng) |
| F15 | Giữ trạng thái kết nối qua localStorage — reload trang không mất kết nối | ✅ Đã làm |
| F16 | Xuất dữ liệu (JSON/CSV) | ❌ Chưa làm |
| F17 | Chống trùng SKU/tên trước khi đăng | ❌ Chưa làm (Sapo cho phép SKU trùng, chưa cần) |
| F18 | Hàng đợi / retry tự động khi đăng hàng loạt | ❌ Chưa làm (đăng tuần tự, lỗi hiển thị trên từng card, không tự retry) |
| F19 | **Tin tức (Article):** tab riêng, sinh + đăng bài viết blog lên Sapo — cùng kiến trúc với Sản phẩm | ✅ Đã làm — chi tiết mục 15 |

---

## 3. Luồng hoạt động thực tế (2 bước, không phải 3 bước)

```
[Màn hình Kết nối]
  Nhập URL store + API Key + API Secret → bấm "Kết nối"
  → backend xác thực NGAY bằng 1 API call thật tới Sapo, chỉ lưu nếu đúng
  → lưu store_url vào localStorage (khỏi phải kết nối lại khi reload trang)
        │
        ▼
[Màn hình Tạo sản phẩm] (gộp chung form tạo + chọn danh mục, không tách bước riêng)
  → tự tải danh mục có sẵn của store (GET /admin/collections.json)
  → CÓ danh mục sẵn: hiện multi-select danh mục (ẩn "Ngành nghề")
     - danh mục nào không đoán được ngành nghề tương ứng → hiện cảnh báo,
       cho chọn ngành nghề fallback riêng cho các danh mục đó
  → CHƯA có danh mục nào: hiện dropdown "Ngành nghề" (9 ngành dựng sẵn)
  → nhập số lượng, phân khúc giá, tỉ lệ ảnh, yêu cầu bổ sung (tùy chọn)
        │
        ▼
  Bấm "Tạo sản phẩm" → sinh theo lô 5 sản phẩm/lần
    - Thử gọi AI thật (Claude) trước
    - Lỗi/chưa cấu hình → tự rơi về dữ liệu mẫu local (không báo lỗi chặn người dùng,
      chỉ hiện banner vàng "Đang dùng dữ liệu mẫu")
        │
        ▼
  Render danh sách sản phẩm (Lưới / Danh sách / Bảng)
    - Ảnh: tìm qua Pexels theo từ khóa AI sinh ra → fallback Picsum → fallback gradient
        │
        ├──► [Sửa từng sản phẩm] (xem trước ảnh, sửa mọi trường)
        ├──► [Chọn nhiều → Xóa hàng loạt]
        └──► [Đăng 1 SP / Đăng đã chọn / Đăng tất cả]
                    │
                    ▼
        POST /admin/products.json (kèm ảnh thật nếu có)
        + find-or-create danh mục trên Sapo + gán collect
                    │
                    ▼
        Card cập nhật: "✓ Đã đăng" (kèm link) hoặc lỗi + lý do
```

---

## 4. Giao diện (UI/UX) — theo đúng những gì đã build

### 4.1. Màn hình Kết nối (`ConnectStoreScreen`)

3 trường: **URL store**, **API Key**, **API Secret** (ẩn dạng password). Bấm "Kết nối" → gọi backend xác thực ngay, báo lỗi cụ thể nếu sai.

### 4.2. Màn hình Tạo sản phẩm (form chính)

| Trường | Điều kiện hiện | Bắt buộc |
|--------|-----------------|----------|
| Danh mục sản phẩm (multi-select) | Store đã có ≥1 danh mục | Có (khi hiện) |
| Ngành nghề (dropdown) | Store chưa có danh mục nào, hoặc làm ngành fallback cho danh mục không đoán được | Có (khi hiện) |
| Thêm danh mục khác | Luôn hiện | Không |
| Số lượng sản phẩm | Luôn hiện | Có (tối đa 50/lần) |
| Phân khúc giá | Luôn hiện | Không (mặc định Trung cấp) |
| Tỉ lệ ảnh sản phẩm | Luôn hiện | Không (mặc định 1:1) |
| Yêu cầu bổ sung | Luôn hiện | Không — ảnh hưởng tới tag + 1 đoạn riêng trong mô tả, và có thể override giới tính (nam/nữ) của loại sản phẩm |

### 4.3. Vùng kết quả

- 3 kiểu xem: **Lưới** (card), **Danh sách** (row), **Bảng**.
- Mỗi sản phẩm hiển thị: ảnh, tên, giá + giá so sánh (% giảm), tag, badge 📁 danh mục, loại · nhãn hiệu · SKU, mô tả ngắn.
- Checkbox chọn nhiều → **Xóa đã chọn** / **Đăng sản phẩm đã chọn**.
- Nút **Sửa** (mở modal chỉnh sửa đầy đủ trường + xem trước 4 ảnh) và **Đăng lên Sapo** trên từng card.
- Trạng thái: `draft` (chưa đăng) → `posting` (đang đăng) → `posted` (✓ Đã đăng, có link) / `error` (lý do lỗi cụ thể từ Sapo).

---

## 5. Kiến trúc kỹ thuật thực tế

```
┌──────────────────────┐        ┌───────────────────────────┐
│  Frontend             │──────► │  Backend                   │
│  React + Vite + TS    │  HTTP  │  Node.js + Express + TS    │
│  Tailwind CSS v4      │◄────── │  (tsx watch, ESM)          │
│  localhost:5173       │        │  localhost:4000             │
└──────────────────────┘        └─────────────┬───────────────┘
                                                │
                       ┌────────────────────────┼───────────────────────┐
                       ▼                        ▼                       ▼
              ┌─────────────────┐    ┌───────────────────┐   ┌──────────────────┐
              │  Sapo Admin API │    │  Anthropic API     │   │  Pexels API       │
              │  (Private App,  │    │  (Claude Sonnet 5, │   │  (tìm ảnh thật    │
              │  Basic Auth)    │    │  sinh nội dung SP) │   │  theo từ khóa)    │
              └─────────────────┘    └───────────────────┘   └──────────────────┘
```

**Không có database, không có queue/worker.** Toàn bộ state sản phẩm sống trong React state (mất khi đóng tab — chưa có tính năng lưu nháp). Backend chỉ lưu duy nhất 1 thứ trên đĩa: API Key/Secret của từng store đã kết nối, dạng file JSON (`backend/data/store-connections.json`, đã gitignore).

### 5.1. Module thực tế

| Module | File chính | Trách nhiệm |
|--------|-----------|-------------|
| Frontend orchestrator | `frontend/src/App.tsx` | State tổng, luồng tạo/đăng sản phẩm, fallback logic |
| Dữ liệu mẫu local | `frontend/src/mockGenerate.ts` | Sinh sản phẩm giả lập theo 9 template ngành, khớp tên danh mục, override giới tính |
| Gọi backend | `frontend/src/sapoApi.ts` | connectStore, fetchStoreCollections, generateProductsBatch, postProductToSapo, fetchProductImageUrls |
| Sinh nội dung AI | `backend/src/aiClient.ts` | Gọi Claude API thật, parse + validate JSON trả về |
| Client Sapo | `backend/src/sapoClient.ts` | Basic Auth, tạo sản phẩm, find-or-create danh mục, gán collect |
| Lưu key store | `backend/src/tokenStore.ts`, `storeAuth.ts` | Đọc/ghi file JSON API Key/Secret theo từng store |
| Route ảnh | `backend/src/routes/images.ts` | Gọi Pexels, trả nhiều ảnh/từ khóa |

### 5.2. Vì sao vẫn cần backend dù chỉ 1 người dùng

- Không thể gọi thẳng Sapo API / Pexels / Anthropic từ trình duyệt: vướng CORS, và sẽ lộ API Key/Secret + Anthropic key ở phía client.
- Cần 1 nơi lưu API Key/Secret của store lâu dài (không phải nhập lại mỗi lần mở app).

---

## 6. Tích hợp AI (sinh nội dung sản phẩm)

### 6.1. Thực tế đã triển khai

- **Model:** `claude-sonnet-5`, gọi trực tiếp bằng `fetch()` tới Anthropic Messages API (không dùng SDK, giữ backend gọn nhẹ).
- **Cấu hình:** `max_tokens: 4096`, `output_config: { effort: 'low' }` — nội dung sản phẩm không cần suy luận sâu, hạ effort để rẻ + nhanh hơn.
- **Theo lô:** 5 sản phẩm/lần gọi (`GENERATION_BATCH_SIZE = 5` ở frontend), tối đa 10 sản phẩm/request ở backend.
- **Bắt buộc có key:** đọc từ `backend/.env` → `ANTHROPIC_API_KEY`. Nếu để trống hoặc gọi lỗi, backend trả lỗi rõ ràng, **frontend tự động rơi về dữ liệu mẫu local** cho lô đó (không chặn người dùng), kèm banner cảnh báo "Đang dùng dữ liệu mẫu, chưa phải AI thật".
- **Chi phí ước tính:** Sonnet 5 = $2/1M input token, $10/1M output token → khoảng 80đ/sản phẩm, ~4.000–5.000đ cho 50 sản phẩm.

### 6.2. Cấu trúc JSON thật từ AI (khớp `GeneratedProductContent`)

```json
{
  "products": [
    {
      "name": "Áo sơ mi nam form rộng basic",
      "shortDescription": "Áo sơ mi nam chất liệu thoáng mát, dễ phối đồ.",
      "description": "<p>...</p><p><strong>Điểm nổi bật:</strong></p><ul><li>...</li></ul><p>...</p>",
      "price": 259000,
      "compareAtPrice": 329000,
      "category": "Áo sơ mi nam",
      "brand": "Uniwear",
      "tags": ["áo sơ mi", "nam", "công sở"],
      "imageKeyword": "men office shirt",
      "weight": 250,
      "attributes": [{ "name": "Kích thước", "value": "L" }],
      "seoTitle": "Áo sơ mi nam form rộng basic",
      "seoDescription": "..."
    }
  ]
}
```

### 6.3. Prompt thật (rút gọn từ `backend/src/aiClient.ts`)

- System prompt yêu cầu: JSON thuần, đúng 13 trường cố định, **mô tả chi tiết dạng HTML ≥3 đoạn `<p>` + 1 danh sách `<ul><li>` điểm nổi bật** (không phải 1 câu ngắn như bản spec cũ), `imageKeyword` là cụm tiếng Anh 3-5 từ.
- User prompt gồm: ngành nghề, phân khúc giá, tên danh mục cụ thể trên store (nếu có — để AI viết đúng loại sản phẩm theo danh mục thay vì chọn ngẫu nhiên), yêu cầu bổ sung từ người bán, số lượng cần tạo.

### 6.4. Kiểm soát chất lượng đã có

- `sanitizeProduct()` ở backend: validate/coerce từng trường, loại sản phẩm không hợp lệ (thiếu `name`/`price` hợp lý).
- `compareAtPrice` luôn > `price` (tự tính lại 115% nếu AI trả sai).
- Dữ liệu mẫu local cũng áp dụng logic tương tự để tên không trùng lặp trong cùng lô (rải đều tổ hợp loại sản phẩm × tính từ trước khi lặp lại).

---

## 7. Xử lý ảnh sản phẩm — đã triển khai bằng ảnh thật (Pexels), không phải sinh ảnh AI

Khác với bản spec gốc (dự tính sinh ảnh AI hoặc placeholder), thực tế chọn phương án **tìm ảnh thật qua Pexels API** vì miễn phí, không cần thẻ, và đơn giản hơn sinh ảnh AI.

### 7.1. Cơ chế

1. AI (hoặc dữ liệu mẫu) sinh `imageKeyword` — cụm từ khóa tiếng Anh mô tả đúng loại sản phẩm (VD "men office shirt").
2. Backend (`GET /api/image-search?query=...`) gọi Pexels, lấy **15 ảnh khớp** (`per_page=15`), trả URL độ phân giải `large2x` (~940×650, nét gấp đôi — tránh dùng cỡ `medium` 350px dễ vỡ).
3. Frontend cache danh sách 15 ảnh theo từ khóa (đỡ gọi lại Pexels nhiều lần), rồi dùng **SKU sản phẩm** làm hạt giống để chọn ra **4 ảnh khác nhau** cho mỗi sản phẩm — tránh nhiều sản phẩm cùng loại (VD nhiều "váy") hiện trùng y hệt 1 tấm ảnh.
4. Nếu chưa cấu hình `PEXELS_API_KEY`, hoặc không tìm được ảnh khớp: rơi về ảnh minh họa Lorem Picsum (không cần key), rồi cuối cùng là ô gradient + emoji theo ngành hàng nếu ảnh lỗi tải.

### 7.2. Khi đăng lên Sapo

- **Chỉ gửi ảnh THẬT (Pexels)** lên Sapo (`images: [{ src: url }, ...]`, tối đa 4 ảnh/sản phẩm) — **không bao giờ** gửi ảnh Picsum/gradient placeholder lên store thật, để tránh gắn nhầm ảnh không liên quan cho sản phẩm thật.
- Nếu chưa cấu hình `PEXELS_API_KEY`: sản phẩm vẫn đăng lên Sapo bình thường, chỉ là **không kèm ảnh**.
- Sapo tự tải ảnh từ URL Pexels về CDN riêng của Sapo khi tạo sản phẩm (đã xác nhận qua test thật).

### 7.3. Giới hạn Sapo

Mỗi sản phẩm tối đa 250 ảnh (Sapo) — tool hiện chỉ gửi tối đa 4, còn rất xa giới hạn.

---

## 8. Tích hợp Sapo API (đẩy sản phẩm)

### 8.1. Xác thực — Private App (Basic Auth), KHÔNG dùng OAuth

Quyết định có chủ đích: vì tool chỉ phục vụ 1 người dùng (chính chủ), đăng ký Public App + luồng OAuth (redirect, callback, refresh token...) là thừa và rắc rối hơn cần thiết. Đổi sang **Private App**:

1. Người dùng tự tạo 1 Private App trên chính store Sapo của họ (trong khu vực quản trị store → Ứng dụng), được cấp **API Key** + **API Secret** riêng cho store đó, với quyền đọc/ghi sản phẩm + danh mục.
2. Nhập URL store + API Key + API Secret vào tool → backend gọi thử 1 API thật (`GET /admin/collections.json`) để xác thực **trước khi lưu**.
3. Lưu vào `backend/data/store-connections.json`, khóa theo `store_url` đã chuẩn hóa (bỏ `https://`, dấu `/` cuối, viết thường).
4. Mọi request sau đó dùng header `Authorization: Basic base64(apiKey:apiSecret)`.

> Lưu ý quan trọng đã phát hiện khi làm: Sapo Private App dùng **Basic Auth**, khác với Sapo OAuth dùng header riêng `X-Sapo-Access-Token` — hai kiểu xác thực không thể dùng lẫn cho nhau.

**Đường quay lại OAuth (nếu sau này mở rộng thành SaaS nhiều người dùng):** chỉ cần sửa `backend/src/storeAuth.ts` — đây là điểm duy nhất `sapoClient.ts` phụ thuộc để lấy credentials, đổi cách lấy token ở đây là đủ, không phải sửa các API call khác.

### 8.2. Các endpoint thực tế đang dùng

| Thao tác | Method & Endpoint |
|----------|-------------------|
| Xác thực khi kết nối / lấy danh mục | `GET /admin/collections.json` |
| Tạo sản phẩm | `POST /admin/products.json` |
| Tạo danh mục mới (custom collection) | `POST /admin/custom_collections.json` |
| Gán sản phẩm vào danh mục | `POST /admin/collects.json` |

Không dùng `PUT`/`DELETE` sản phẩm, không dùng Webhook — ngoài phạm vi hiện tại.

### 8.3. Ánh xạ trường: nội dung tạo ra → Sapo (theo đúng `sapoClient.ts`)

| Trường trên tool | Trường trên Sapo | Ghi chú |
|------------------|------------------|---------|
| name | `product.name` | |
| description | `product.content` | HTML nhiều đoạn |
| shortDescription | `product.summary` | |
| category | `product.product_type` | Free-text, không cần tồn tại trước |
| brand | `product.vendor` | |
| tags | `product.tags` | Join bằng `, ` |
| imageUrls (Pexels, thật) | `product.images[].src` | Chỉ gửi khi có ảnh thật |
| price | `product.variants[0].price` | |
| compareAtPrice | `product.variants[0].compare_at_price` | |
| sku, barcode | `product.variants[0].sku`, `.barcode` | |
| stockQuantity | `product.variants[0].inventory_quantity` | |
| weight, weightUnit | `product.variants[0].weight`, `.weight_unit` | |
| collection (tên) | Gán qua `POST /admin/collects.json` sau khi find-or-create | Tách biệt khỏi `category` — `category` là product_type tự do, `collection` là Collection thật trên store |

### 8.4. Danh mục (Collection) — find-or-create

Trước khi gán, backend tìm danh mục theo tên (không phân biệt hoa/thường) trong danh sách hiện có; nếu chưa có mới tạo (`POST /admin/custom_collections.json`). Tránh tạo trùng khi nhiều sản phẩm trong cùng lô dùng chung 1 danh mục mới. **Lưu ý:** vẫn có thể trùng nếu 2 request chạy gần như đồng thời (race condition) — chấp nhận được ở quy mô 1 người dùng, chưa cần hàng đợi khóa riêng.

Nếu danh mục đích là **Smart Collection** (tự động theo luật) thay vì Custom Collection, Sapo trả 422 khi gán — tool bắt lỗi này và hiển thị thông báo dễ hiểu thay vì lỗi kỹ thuật thô.

### 8.5. Đăng hàng loạt

- Đăng **tuần tự**, cách nhau 180ms giữa các request (không dùng hàng đợi/BullMQ như spec gốc dự tính — không cần thiết ở quy mô cá nhân).
- Không có retry tự động; lỗi hiển thị ngay trên từng card kèm lý do thật từ Sapo, người dùng tự bấm đăng lại.
- Không chống trùng SKU/tên — đã kiểm chứng Sapo cho phép SKU trùng, nên bỏ qua bước này để đơn giản hóa.

---

## 9. Lưu trữ dữ liệu thực tế (không có database)

### 9.1. File `backend/data/store-connections.json`

Duy nhất thứ được lưu bền trên đĩa. Dạng object, khóa theo `store_url` đã chuẩn hóa:

```json
{
  "shop-abc.mysapo.net": {
    "apiKey": "...",
    "apiSecret": "...",
    "connectedAt": "2026-09-15T08:32:26.073Z"
  }
}
```

Đã thêm vào `.gitignore` — không commit lên git.

### 9.2. State sản phẩm — chỉ sống trong React state

Sản phẩm tạo ra (`Product[]` trong `App.tsx`) **không được lưu lại** ở backend hay trình duyệt — đóng tab/reload là mất, phải tạo lại. Đây là khác biệt lớn nhất so với bản spec gốc (dự tính có bảng `generation_batch` + `product_draft` trong PostgreSQL). Quyết định giữ đơn giản vì tool dùng để tạo rồi đăng ngay trong 1 phiên làm việc, chưa có nhu cầu lưu nháp dài hạn.

### 9.3. `localStorage` (trình duyệt)

Chỉ lưu 1 giá trị: `sapo_ai_generator_store_url` — URL store đã kết nối, để reload trang không bị đá về màn hình kết nối lại.

---

## 10. Xử lý lỗi, hiệu năng, bảo mật thực tế

### 10.1. Nguyên tắc xuyên suốt: "thật trước, dự phòng tự động sau" (real-first, graceful fallback)

Áp dụng cho MỌI tích hợp ngoài: AI thật → dữ liệu mẫu local; ảnh Pexels thật → Picsum → gradient; kết nối Sapo thật → báo lỗi rõ ràng (không có mock cho việc đăng sản phẩm thật). Mỗi hàm gọi backend đều phân biệt 2 loại lỗi: **`backendUnavailable`** (không gọi được backend — có thể chưa `npm run dev`) khác với **lỗi nghiệp vụ thật** (Sapo/AI/Pexels từ chối request) — để người dùng biết chính xác cần sửa gì.

### 10.2. Xử lý lỗi cụ thể

- Lỗi sinh AI (thiếu key, key sai, Claude lỗi): fallback dữ liệu mẫu cho lô đó + banner cảnh báo, không chặn thao tác.
- Lỗi tìm ảnh (thiếu `PEXELS_API_KEY`, không tìm thấy): fallback ảnh placeholder, sản phẩm vẫn đăng được (không kèm ảnh).
- Lỗi đăng Sapo: hiển thị nguyên văn lý do Sapo trả về trên card, người dùng tự bấm đăng lại.
- Lỗi gán danh mục vào Smart Collection: thông báo riêng, dễ hiểu.

### 10.3. Hiệu năng

- Sinh AI theo lô 5, đăng tuần tự cách nhau 180ms — đủ dùng ở quy mô cá nhân (chưa cần backoff/rate-limit handling phức tạp).
- Cache ảnh Pexels theo từ khóa trong phiên làm việc (`Map` ở frontend) — giảm số lần gọi API khi nhiều sản phẩm cùng loại.

### 10.4. Bảo mật

- API Key/Secret của store: chỉ lưu ở backend (file JSON), không bao giờ gửi về/lưu ở frontend.
- `ANTHROPIC_API_KEY`, `PEXELS_API_KEY`: chỉ trong `backend/.env`, không commit git (`.env` đã gitignore, chỉ `.env.example` có mặt trong repo).
- **Giới hạn đã biết:** file JSON lưu API Key/Secret ở dạng **plaintext**, không mã hóa — chấp nhận được vì chạy local, 1 người dùng, máy cá nhân. Nếu sau này mở rộng thành SaaS nhiều người dùng, **bắt buộc** phải đổi sang: mã hóa khi lưu (hoặc secret manager), database thật thay vì file JSON, và quay lại OAuth thay vì mỗi người dùng tự tạo Private App (xem mục 8.1).

---

## 11. Tech stack thực tế

| Thành phần | Đã dùng |
|-----------|---------|
| Frontend | React 19 + Vite + TypeScript + Tailwind CSS v4 (`@tailwindcss/vite`, không dùng PostCSS) |
| Backend | Node.js + Express + TypeScript, chạy bằng `tsx watch` (dev), ESM thuần (`"type": "module"`) |
| AI | Anthropic API — `claude-sonnet-5`, gọi bằng `fetch()` thuần (không dùng SDK) |
| Ảnh | Pexels API (miễn phí, không cần thẻ) |
| Lưu trữ | File JSON (`backend/data/store-connections.json`) — **không có database** |
| Hàng đợi | **Không có** — xử lý tuần tự trực tiếp |
| Triển khai | Chạy local (`npm run dev` ở cả 2 thư mục `frontend/` và `backend/`) — chưa deploy lên server/cloud |

---

## 12. Trạng thái hiện tại & việc còn thiếu

Phần lớn tính năng MVP (mục 2) đã hoàn thành và kiểm thử bằng cách đăng thật lên store Sapo thật. Việc còn thiếu / có thể làm tiếp nếu cần:

| Hạng mục | Ghi chú |
|----------|---------|
| Lưu nháp sản phẩm đã tạo | Hiện mất khi reload; có thể thêm localStorage/IndexedDB nếu cần giữ giữa các phiên |
| Xuất JSON/CSV | Chưa làm |
| Retry tự động khi đăng hàng loạt lỗi | Hiện phải tự bấm lại từng sản phẩm lỗi |
| Chống trùng SKU/tên | Chưa cần (Sapo cho phép trùng SKU) |
| Triển khai lên server thật (thay vì chạy local) | Chưa làm — đang chạy `localhost` |
| Đa người dùng / OAuth | Ngoài phạm vi hiện tại (xem mục 8.1, 10.4) |

---

## 13. Rủi ro & lưu ý

- **Chất lượng nội dung AI/mẫu:** vẫn cần người xem lại trước khi bán thật (giá, mô tả, chính tả) — tool không tự động hoàn toàn.
- **Ảnh Pexels là ảnh stock đúng LOẠI sản phẩm, không phải ảnh chụp đúng hàng thật đang bán** — cần tự chụp/thay ảnh thật nếu muốn bán chính xác 100% đúng hàng.
- **Chi phí AI:** phát sinh phí thật khi bật `ANTHROPIC_API_KEY` (~80đ/sản phẩm với Sonnet 5, effort thấp) — mặc định tool chạy miễn phí bằng dữ liệu mẫu cho tới khi người dùng chủ động cấu hình key.
- **File lưu API Key/Secret dạng plaintext** trên máy chạy backend — chỉ an toàn khi máy đó là máy cá nhân, không public.
- **Không có bản sao lưu sản phẩm đã tạo** — nếu reload trang giữa chừng, phải tạo lại từ đầu.

---

## 14. Tiêu chí hoàn thành (Definition of Done) — cập nhật theo thực tế

- [x] Kết nối store Sapo bằng API Key/Secret, xác thực thật trước khi lưu.
- [x] Tự nhận diện danh mục có sẵn, hoặc cho chọn ngành nghề nếu chưa có.
- [x] Sinh sản phẩm bằng AI thật (khi có key) với đủ trường: ảnh, tên, mô tả, giá, giá so sánh, tag, danh mục — có fallback dữ liệu mẫu miễn phí khi chưa/không dùng được AI.
- [x] Sản phẩm render dạng lưới/danh sách/bảng, chỉnh sửa được đầy đủ trường.
- [x] Đăng 1, nhiều (đã chọn), hoặc tất cả sản phẩm lên Sapo thật — kèm ảnh thật, gán đúng danh mục thật.
- [x] Báo lỗi rõ ràng, đúng lý do thật từ Sapo/AI/Pexels khi có sự cố.
- [ ] Chống trùng, retry tự động, xuất dữ liệu — chưa làm (xem mục 12).
- [x] Tab Tin tức: sinh + đăng bài viết blog thật lên Sapo, kèm ảnh thật, tác giả lấy theo tên chủ store thật — xem mục 15.

---

## 15. Tính năng Tin tức (Article) — mở rộng thêm, cùng kiến trúc với Sản phẩm

### 15.1. Tổng quan

Sau khi hoàn thành phần Sản phẩm, tool được mở rộng thêm 1 tab **📰 Tin tức** ngay trong cùng giao diện (chuyển đổi bằng 2 tab dưới header), dùng chung store đã kết nối. Tin tức sinh và đăng **bài viết blog** (Article, trong 1 Blog của Sapo) thay vì sản phẩm — cùng nguyên lý "thật trước, dự phòng tự động sau" như phần Sản phẩm (mục 10.1).

### 15.2. Điểm khác biệt cố ý so với Sản phẩm

| Khác biệt | Lý do |
|-----------|-------|
| **Chủ đề bài viết KHÔNG gắn với Blog chọn để đăng** (ngược với Sản phẩm, nơi chọn Danh mục vừa quyết định nội dung vừa quyết định nơi đăng) | Tên Blog trên Sapo thường chung chung (VD "Tin tức") không đủ để suy ra chủ đề bài viết như tên Danh mục sản phẩm (VD "Áo sơ mi nam" tự nói lên loại sản phẩm) — nên tách riêng: **Chủ đề** (dropdown, 6 lựa chọn dựng sẵn) quyết định nội dung, **Blog** (multi-select từ store thật, hoặc tạo mới) chỉ quyết định nơi đăng |
| **Chỉ 1 ảnh đại diện/bài** (Sản phẩm nhận tối đa 4 ảnh) | Sapo Article API chỉ nhận 1 field `image` (số ít), khác `images[]` (mảng) của Product — đã xác nhận qua test thật |
| **Tác giả = tên chủ store thật**, không phải tên AI/mẫu tự bịa | Lấy từ `store_owner` (`GET /admin/store.json`) ngay khi kết nối, override tự động cho mọi bài viết sinh ra (vẫn sửa tay được trong modal Sửa) |
| **Tùy chọn đăng công khai ngay hoặc lưu nháp** (`publishNow`) | Sapo Article hỗ trợ trạng thái nháp (không gửi `published_on`) — sản phẩm Sapo không có khái niệm nháp tương đương nên không có tùy chọn này |
| **Giọng văn** (Chuyên nghiệp / Thân thiện / Hài hước) thay cho Phân khúc giá | Bài viết không có giá — thay bằng lựa chọn ảnh hưởng văn phong |

### 15.3. Chủ đề dựng sẵn (6 chủ đề)

Khuyến mãi · Hướng dẫn sử dụng · Tin tức ngành hàng · Đánh giá sản phẩm · Mẹo hay & Kinh nghiệm · Sự kiện cửa hàng.

### 15.4. Tích hợp Sapo API thật (đã kiểm chứng bằng cách tạo + xoá bài viết test thật)

| Thao tác | Method & Endpoint | Lưu ý phát hiện khi test thật |
|----------|-------------------|-------------------------------|
| Lấy danh sách blog | `GET /admin/blogs.json` | Trường tên blog là **`name`**, KHÔNG phải `title` như tài liệu Sapo gợi ý ban đầu |
| Lấy tên chủ store | `GET /admin/store.json` | Trường `store_owner` |
| Tạo blog mới (nếu store chưa có) | `POST /admin/blogs.json` — `{ blog: { name } }` | Cùng nguyên tắc find-or-create với danh mục sản phẩm (mục 8.4) |
| Tạo bài viết | `POST /admin/blogs/{blog_id}/articles.json` | Trường tóm tắt ngắn là **`summary`**, KHÔNG phải `excerpt`; ảnh gửi qua `image: { src: url }` (số ít); `published_on` (ISO datetime) = đăng công khai ngay, bỏ trống = lưu nháp |

### 15.5. Ánh xạ trường: nội dung tạo ra → Sapo (`SapoArticleInput` → Article)

| Trường trên tool | Trường trên Sapo | Ghi chú |
|-------------------|-------------------|---------|
| title | `article.title` | |
| author | `article.author` | = tên chủ store thật (mục 15.2) |
| content | `article.content` | HTML nhiều đoạn + bullet, cùng phong cách với mô tả sản phẩm (mục 6.3) |
| excerpt | `article.summary` | **Không phải `excerpt`** — xem 15.4 |
| tags | `article.tags` | Join bằng `, ` |
| imageUrls[0] (Pexels, thật) | `article.image.src` | Chỉ gửi ảnh ĐẦU TIÊN — Sapo Article chỉ nhận 1 ảnh |
| publishNow | `article.published_on` | true → ISO datetime hiện tại; false → không gửi field (lưu nháp) |
| blog (tên) | Gán qua path `/admin/blogs/{blog_id}/articles.json` sau khi find-or-create | Không có resource `collect` riêng như sản phẩm — bài viết thuộc thẳng 1 blog qua URL path |

### 15.6. Sinh nội dung bằng AI / dữ liệu mẫu

- **AI thật:** `generateArticles()` trong `backend/src/aiClient.ts`, dùng chung hàm `callClaudeForJson()` với `generateProducts()` (cùng model `claude-sonnet-5`, cùng `effort: 'low'`) — chỉ khác system/user prompt. Yêu cầu nội dung ≥3 đoạn `<p>` + 1 `<ul><li>` điểm chính + đoạn kết có lời kêu gọi hành động (CTA), giống độ chi tiết với mô tả sản phẩm.
- **Dữ liệu mẫu local (`frontend/src/mockGenerateArticle.ts`):** 6 template theo chủ đề, mỗi template có `titleCores` × `angles` để rải đều tổ hợp chống trùng tên (cùng kỹ thuật với `nouns × adjectives` ở `mockGenerate.ts`, mục 6.4). "Yêu cầu bổ sung" cũng được đưa vào tag + 1 đoạn riêng trong nội dung, cùng nguyên tắc với sản phẩm.
- Ảnh: dùng lại đúng cơ chế Pexels đã có (mục 7) — mỗi chủ đề có sẵn 1 `imageKeyword` tiếng Anh, lấy ảnh thật qua `fetchProductImageUrl()` (chỉ 1 ảnh, không phải `fetchProductImageUrls()` nhiều ảnh như sản phẩm).

### 15.7. Module mới (thêm vào bảng mục 5.1)

| Module | File chính | Trách nhiệm |
|--------|-----------|-------------|
| Dữ liệu mẫu tin tức | `frontend/src/mockGenerateArticle.ts` | Sinh bài viết giả lập theo 6 template chủ đề |
| Gọi backend (tin tức) | Bổ sung trong `frontend/src/sapoApi.ts` | fetchStoreBlogs, fetchStoreOwnerName, generateArticlesBatch, postArticleToSapo |
| Sinh nội dung AI (tin tức) | Bổ sung trong `backend/src/aiClient.ts` | `generateArticles()`, dùng chung `callClaudeForJson()` |
| Client Sapo (tin tức) | `backend/src/sapoArticleClient.ts` | Basic Auth, fetch/tạo blog, tạo bài viết, lấy tên chủ store |
| Route tin tức | `backend/src/routes/blogs.ts`, `routes/articles.ts`, `routes/generateArticles.ts` | GET /api/blogs, GET /api/store-owner, POST /api/articles, POST /api/generate-articles |
| UI tin tức | `frontend/src/components/Article{Card,ListRow,Table,ConfigPanel}.tsx`, `EditArticleModal.tsx` | Mirror 1-1 với component Sản phẩm tương ứng |

### 15.8. Tái sử dụng component có chủ đích

Để tránh trùng lặp không cần thiết, các component sau được **dùng chung nguyên vẹn** cho cả Sản phẩm lẫn Tin tức (không tạo bản sao riêng): `ProductToolbar` (đã generic sẵn — chọn tất cả, xóa/đăng hàng loạt, chuyển view), `ResultsHeader`, `MultiSelectDropdown`, `Checkbox`, `ProductImage` (nhận `seed`/`category`/`imageKeyword` chung chung, không phụ thuộc kiểu dữ liệu Sản phẩm). `EmptyState` được tổng quát hóa thêm props `icon`/`title`/`subtitle` (giữ nguyên mặc định cho Sản phẩm) để tái dùng cho Tin tức.
