import { Router } from 'express'

export const imagesRouter = Router()

interface PexelsPhoto {
  src: { medium: string; large: string; large2x: string; original: string }
  photographer: string
  url: string
  width: number
  height: number
}

interface PixabayHit {
  pageURL: string
  tags: string
  webformatURL: string
  largeImageURL: string
  imageWidth: number
  imageHeight: number
  user: string
}

/** 1 ảnh sau khi đã chuẩn hóa từ Pexels hoặc Pixabay về cùng 1 dạng, để gộp chung lọc/xếp hạng. */
interface NormalizedPhoto {
  url: string
  raw: string
  photographer: string
  sourceUrl: string
  width: number
  height: number
  /** Văn bản dùng để lọc độ liên quan (filterRelevantPhotos) — với Pexels là slug URL, với Pixabay là tags do người upload tự gắn (thường CHÍNH XÁC hơn slug vì là từ khóa thật, không phải suy ra từ câu miêu tả). */
  matchText: string
}

/** Tỉ lệ khung hình (width/height) đích cho từng lựa chọn của người dùng — dùng để ưu tiên ảnh gốc có tỉ lệ gần đúng. */
const TARGET_RATIO: Record<string, number> = {
  '1:1': 1,
  '4:3': 4 / 3,
  '3:4': 3 / 4,
  '16:9': 16 / 9,
}

/**
 * Từ chung chung, bỏ qua khi lọc độ liên quan của ảnh — vì gần như ảnh nào cũng "match" được các từ
 * này (VD ảnh vỏ sò cũng chứa "seafood"), nên phải dựa vào các từ CỤ THỂ hơn trong từ khóa (VD "crab").
 */
const GENERIC_IMAGE_WORDS = new Set([
  'fresh', 'organic', 'seafood', 'dairy', 'fruit', 'fruits', 'vegetable', 'vegetables',
  'meat', 'drink', 'bottle', 'jar', 'carton', 'snack', 'market', 'food', 'imported', 'seasonal',
  // Từ đếm/cấu trúc chung chung trong từ khóa đồ điện máy (VD "two door", "side by side", "front load") —
  // tự thân không đặc trưng cho sản phẩm nào, giữ lại dễ khớp nhầm ảnh bất kỳ có chứa đúng từ này
  // (VD ảnh không liên quan gì tới tủ lạnh nhưng slug có chữ "two" vẫn lọt qua bộ lọc).
  'two', 'one', 'side', 'door', 'load', 'front', 'top', 'wall', 'mounted',
])

/**
 * Từ viết tắt ngắn (<3 ký tự) nhưng vẫn rất CỤ THỂ, không nên bị loại bởi ngưỡng độ dài mặc định (VD "tv") —
 * thiếu "tv" trong danh sách từ cốt lõi từng khiến từ khóa như "modern tv wall mounted" (đã bỏ "wall",
 * "mounted" vì quá chung chung) chỉ còn lại "modern" làm tiêu chí lọc, kéo về toàn ảnh phòng khách chung
 * chung bất kỳ thay vì ưu tiên ảnh thực sự có TV.
 */
const SHORT_CORE_WORDS = new Set(['tv'])

/**
 * Pexels xếp hạng theo mức độ liên quan nhưng vẫn lọt vài ảnh không đúng chủ đề trong top kết quả (VD
 * tìm "mud crab seafood" ra cả ảnh vỏ sò, hải sản chung chung không phải cua) — lọc lại bằng cách chỉ giữ
 * ảnh có slug URL (Pexels tự đặt theo nội dung ảnh, VD ".../freshly-caught-crabs-on-ice-..._id/") chứa
 * ít nhất 1 từ CỤ THỂ (không nằm trong GENERIC_IMAGE_WORDS) của từ khóa tìm kiếm. Nếu lọc còn quá ít ảnh
 * (< 3, có thể do từ khóa toàn từ chung chung) thì giữ nguyên danh sách gốc — tránh lọc sạch còn 0 ảnh.
 */
function filterRelevantPhotos<T extends { matchText: string }>(photos: T[], query: string): T[] {
  const coreWords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => (w.length >= 3 || SHORT_CORE_WORDS.has(w)) && !GENERIC_IMAGE_WORDS.has(w))

  if (coreWords.length === 0) return photos

  const filtered = photos.filter((p) => coreWords.some((w) => p.matchText.includes(w)))

  return filtered.length >= 3 ? filtered : photos
}

/**
 * Ưu tiên giữ ảnh có tỉ lệ khung hình GỐC gần với tỉ lệ người dùng đã chọn (VD chọn hiển thị vuông 1:1 thì
 * ưu tiên ảnh gốc cũng gần vuông) — vì bước crop sau đó (xem cropImageUrl() ở sapoApi.ts) luôn ép cứng về
 * đúng kích thước đích, ảnh gốc càng lệch tỉ lệ thì càng phải cắt bỏ nhiều, dễ cắt mất chủ thể/lệch trọng
 * tâm (VD ảnh ngang cắt về khung dọc thường chỉ còn phần giữa, mất góc sản phẩm). Loại bỏ luôn ảnh lệch quá
 * xa (>50%) nếu còn đủ ảnh (>=3) sau khi lọc — không thì giữ nguyên để tránh lọc sạch còn quá ít lựa chọn.
 */
function preferMatchingAspectRatio<T extends { width: number; height: number }>(photos: T[], aspectRatio: string): T[] {
  const target = TARGET_RATIO[aspectRatio]
  if (!target) return photos

  const scored = photos
    .map((p) => ({ photo: p, deviation: Math.abs(p.width / p.height - target) / target }))
    .sort((a, b) => a.deviation - b.deviation)

  const closeEnough = scored.filter((s) => s.deviation <= 0.5).map((s) => s.photo)
  return closeEnough.length >= 3 ? closeEnough : photos
}

/**
 * Tìm ảnh khớp `query` trên Pexels — miễn phí, không cần thẻ tín dụng, đăng ký tại
 * https://www.pexels.com/api/. Trả về [] nếu lỗi/không cấu hình key (không throw) — để Pixabay vẫn chạy
 * độc lập, không phụ thuộc lẫn nhau.
 */
async function searchPexels(query: string): Promise<NormalizedPhoto[]> {
  const apiKey = process.env.PEXELS_API_KEY
  if (!apiKey) return []

  // Thêm "white background" vào câu tìm — thiên hướng Pexels trả ảnh chụp sản phẩm nền sạch (kiểu ảnh
  // catalog: chỉ có sản phẩm, không có người/khung cảnh) thay vì ảnh đời thường/lifestyle, giống cách các
  // trang bán hàng thật hiển thị ảnh sản phẩm. CHỈ áp dụng cho câu gửi Pexels — lọc độ liên quan
  // (filterRelevantPhotos) vẫn dựa trên `query` GỐC, không tính "white"/"background" là từ khoá cụ thể.
  const searchParams = new URLSearchParams({ query: `${query} white background`, per_page: '40' })
  const response = await fetch(`https://api.pexels.com/v1/search?${searchParams}`, {
    headers: { Authorization: apiKey },
  })
  if (!response.ok) return []

  const data = (await response.json()) as { photos?: PexelsPhoto[] }
  return (data.photos ?? []).map((p) => ({
    url: p.src.large2x,
    raw: p.src.original,
    photographer: p.photographer,
    sourceUrl: p.url,
    width: p.width,
    height: p.height,
    matchText: p.url.toLowerCase(),
  }))
}

/**
 * Tìm ảnh khớp `query` trên Pixabay — miễn phí, đăng ký tại https://pixabay.com/api/docs/. Bổ sung cho
 * Pexels vì Pixabay có nhiều ảnh kiểu "sản phẩm cô lập" hơn cho 1 số ngành (VD đồ điện máy: Pexels chủ yếu
 * chỉ có ảnh nội thất phòng khách chứa TV/tủ lạnh nhỏ, thiếu hẳn ảnh chụp riêng sản phẩm). Không bắt buộc —
 * nếu chưa cấu hình PIXABAY_API_KEY thì bỏ qua, chỉ dùng Pexels (không phá vỡ tool nếu chưa có key).
 */
async function searchPixabay(query: string): Promise<NormalizedPhoto[]> {
  const apiKey = process.env.PIXABAY_API_KEY
  if (!apiKey) return []

  const searchParams = new URLSearchParams({
    key: apiKey,
    q: query,
    image_type: 'photo',
    per_page: '40',
    safesearch: 'true',
  })
  const response = await fetch(`https://pixabay.com/api/?${searchParams}`)
  if (!response.ok) return []

  const data = (await response.json()) as { hits?: PixabayHit[] }
  return (data.hits ?? []).map((h) => ({
    url: h.webformatURL,
    raw: h.largeImageURL,
    photographer: h.user,
    sourceUrl: h.pageURL,
    width: h.imageWidth,
    height: h.imageHeight,
    // Pixabay có sẵn `tags` (từ khóa do người upload tự gắn, VD "tv, television, screen") — gộp cùng slug
    // trang để lọc độ liên quan, đáng tin hơn slug suy luận một mình (xem filterRelevantPhotos).
    matchText: `${h.pageURL} ${h.tags}`.toLowerCase(),
  }))
}

/**
 * Tìm ảnh thật khớp từ khóa sản phẩm qua Pexels + Pixabay (gộp kết quả 2 nguồn).
 *
 * Đây là ảnh stock chụp đúng LOẠI sản phẩm (vd: tìm "bluetooth headphones" ra
 * ảnh tai nghe bluetooth thật), KHÔNG phải ảnh chụp đúng sản phẩm cụ thể bạn
 * đang bán — muốn có ảnh 100% đúng hàng thật, vẫn cần tự chụp/upload sau.
 */
imagesRouter.get('/image-search', async (req, res) => {
  const query = String(req.query.query ?? '').trim()
  if (!query) {
    res.status(400).json({ error: 'Thiếu tham số query' })
    return
  }

  if (!process.env.PEXELS_API_KEY && !process.env.PIXABAY_API_KEY) {
    res.status(500).json({ error: 'Chưa cấu hình PEXELS_API_KEY hoặc PIXABAY_API_KEY trong backend/.env' })
    return
  }

  // Tỉ lệ khung hình người dùng đã chọn hiển thị (1:1, 4:3, 3:4, 16:9) — CHỈ dùng để ưu tiên ảnh có tỉ lệ
  // gốc gần đúng (preferMatchingAspectRatio), KHÔNG dùng để thiên hướng orientation khi tìm kiếm trên Pexels
  // (đã từng thử, làm tập kết quả liên quan bị thu hẹp quá mức và trả về nhiều ảnh sai chủ đề — xem lịch sử).
  const aspectRatio = String(req.query.aspectRatio ?? '')

  try {
    // Gọi song song 2 nguồn — nguồn nào lỗi/chưa cấu hình key thì trả [] (xem searchPexels/searchPixabay),
    // không làm hỏng nguồn còn lại.
    const [pexelsPhotos, pixabayPhotos] = await Promise.all([searchPexels(query), searchPixabay(query)])
    const allPhotos = [...pexelsPhotos, ...pixabayPhotos]

    if (allPhotos.length === 0) {
      res.status(404).json({ error: `Không tìm thấy ảnh nào khớp "${query}"` })
      return
    }

    const relevant = filterRelevantPhotos(allPhotos, query)
    const final = aspectRatio ? preferMatchingAspectRatio(relevant, aspectRatio) : relevant
    res.json({ photos: final.map(({ matchText: _matchText, ...photo }) => photo) })
  } catch (err) {
    res.status(502).json({ error: err instanceof Error ? err.message : 'Lỗi không xác định khi tìm ảnh' })
  }
})
