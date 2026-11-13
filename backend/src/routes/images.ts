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
 * Truy vấn nhiều từ khóa ("|"): mỗi từ khóa phải khớp cả DANH TỪ CHÍNH (từ cuối, VD "speaker" trong "mini bluetooth
 * speaker") — tránh ảnh chỉ khớp từ phụ như "mini" (ra xe Mini Cooper) hay "bookshelf" (ra kệ sách). Bỏ hết thì trả [].
 */
function requireHeadNoun<T extends { matchText: string }>(photos: T[], query: string): T[] {
  const words = query.toLowerCase().split(/\s+/)
  const head = words[words.length - 1].replace(/s$/, '')
  return photos.filter((p) => p.matchText.includes(head) && !OFF_TOPIC_WORDS.test(p.matchText.replace(/[-_/,]+/g, ' ')))
}

/**
 * Ảnh khớp danh từ chính nhưng sai ngữ cảnh — đồ chơi, xe cổ, xe buýt trường học, xe bán tải, bóng đá… (VD "coach bus" ra
 * "school bus", "antique car bus"; "coach" ra huấn luyện viên bóng đá). Chỉ áp dụng cho truy vấn nhiều từ khóa.
 */
const OFF_TOPIC_WORDS =
  /\b(toy|toys|miniature|antique|vintage|rustic|school|pickup|soccer|football|lego|model car|cartoon|illustration|fire truck|ice cream|garbage|sweeper|plowing|plow|double decker|tire|tires|seats|catering|wine|monster truck|makeup|sponge|sponges|candle|candles)\b/

/** Độ lệch tỉ lệ (|w/h − đích| / đích) coi là "gần đúng tỉ lệ" — crop đi tối đa ~12% ảnh, gần như không mất chủ thể. */
const CLOSE_RATIO_DEVIATION = 0.12
/** Cần ít nhất chừng này ảnh gần đúng tỉ lệ mới chỉ dùng riêng nhóm đó (bài viết Album lấy tới 10 ảnh/bài). */
const MIN_CLOSE_PHOTOS = 8

/** Ảnh sản phẩm: số ảnh tối thiểu giữ lại khi lọc theo tỉ lệ (bù bằng ảnh lệch tỉ lệ ≤ 50%, frontend cắt lại cho đúng). */
const PRODUCT_MIN_PHOTOS = 24

function ratioDeviation(p: { width: number; height: number }, target: number): number {
  return Math.abs(p.width / p.height - target) / target
}

/**
 * Ưu tiên ảnh có tỉ lệ khung hình GỐC gần với tỉ lệ người dùng đã chọn (VD chọn 16:9 thì lấy ảnh gốc cũng
 * ~16:9) — để ảnh tải lên không bị cắt mất chủ thể. Ảnh được xếp theo độ lệch tăng dần:
 * - Đủ ảnh gần đúng tỉ lệ (độ lệch ≤ 12%, >= MIN_CLOSE_PHOTOS) → chỉ trả về nhóm này.
 * - Không đủ → bù thêm các ảnh lệch ít nhất kế tiếp (tối đa lệch 50%) cho đủ MIN_CLOSE_PHOTOS; frontend
 *   (cropImageUrl ở sapoApi.ts) sẽ không cắt cứng các ảnh lệch nhiều này mà giữ nguyên khung gốc.
 * Lọc còn < 3 ảnh → giữ nguyên danh sách gốc, tránh lọc sạch.
 */
function preferMatchingAspectRatio<T extends { width: number; height: number }>(
  photos: T[],
  aspectRatio: string,
  minPhotos = MIN_CLOSE_PHOTOS,
): T[] {
  const target = TARGET_RATIO[aspectRatio]
  if (!target) return photos

  const sorted = photos
    .map((photo) => ({ photo, deviation: ratioDeviation(photo, target) }))
    .sort((a, b) => a.deviation - b.deviation)

  const close = sorted.filter((s) => s.deviation <= CLOSE_RATIO_DEVIATION)
  const chosen =
    close.length >= minPhotos ? close : sorted.filter((s) => s.deviation <= 0.5).slice(0, Math.max(minPhotos, close.length))
  return chosen.length >= 3 ? chosen.map((s) => s.photo) : photos
}

/**
 * Từ chỉ người trong slug Pexels / tags Pixabay — ảnh SẢN PHẨM chỉ nên có sản phẩm (VD tìm "karaoke microphone" hay ra
 * ảnh người đang hát, "over ear headphones" ra ảnh người đeo tai nghe).
 */
const PEOPLE_WORDS =
  /\b(man|men|woman|women|person|people|persons|girl|girls|boy|boys|guy|guys|lady|ladies|singer|singing|sings|child|children|kid|kids|baby|hand|hands|holding|wearing|performer|performing|musician|portrait|couple|friends|crowd|model|businessman|speaking|listening|female|male|teen|teenager|audience|dancing|dancer|dancers)\b/

function hasPeople(matchText: string): boolean {
  return PEOPLE_WORDS.test(matchText.replace(/[-_/]+/g, ' '))
}

/** Loại ảnh có người; còn quá ít (< 3) thì giữ cả nhưng xếp ảnh không có người lên trước. */
function preferNoPeople<T extends { matchText: string }>(photos: T[]): T[] {
  const clean = photos.filter((p) => !hasPeople(p.matchText))
  if (clean.length >= 3) return clean
  return [...clean, ...photos.filter((p) => hasPeople(p.matchText))]
}

/** Hướng ảnh tương ứng tỉ lệ đã chọn — dùng cho lượt tìm BỔ SUNG (không thay thế lượt tìm chính). */
function orientationFor(aspectRatio: string): { pexels: string; pixabay: string } | null {
  const target = TARGET_RATIO[aspectRatio]
  if (!target) return null
  if (target > 1) return { pexels: 'landscape', pixabay: 'horizontal' }
  if (target < 1) return { pexels: 'portrait', pixabay: 'vertical' }
  return { pexels: 'square', pixabay: 'all' }
}

/**
 * Tìm ảnh khớp `query` trên Pexels — miễn phí, không cần thẻ tín dụng, đăng ký tại
 * https://www.pexels.com/api/. Trả về [] nếu lỗi/không cấu hình key (không throw) — để Pixabay vẫn chạy
 * độc lập, không phụ thuộc lẫn nhau.
 */
async function searchPexels(query: string, orientation?: string): Promise<NormalizedPhoto[]> {
  const apiKey = process.env.PEXELS_API_KEY
  if (!apiKey) return []

  // Thêm "white background" vào câu tìm — thiên hướng Pexels trả ảnh chụp sản phẩm nền sạch (kiểu ảnh
  // catalog: chỉ có sản phẩm, không có người/khung cảnh) thay vì ảnh đời thường/lifestyle, giống cách các
  // trang bán hàng thật hiển thị ảnh sản phẩm. CHỈ áp dụng cho câu gửi Pexels — lọc độ liên quan
  // (filterRelevantPhotos) vẫn dựa trên `query` GỐC, không tính "white"/"background" là từ khoá cụ thể.
  const searchParams = new URLSearchParams({ query: `${query} white background`, per_page: '40' })
  if (orientation) searchParams.set('orientation', orientation)
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
async function searchPixabay(query: string, orientation?: string): Promise<NormalizedPhoto[]> {
  const apiKey = process.env.PIXABAY_API_KEY
  if (!apiKey) return []

  const searchParams = new URLSearchParams({
    key: apiKey,
    q: query,
    image_type: 'photo',
    per_page: '40',
    safesearch: 'true',
  })
  if (orientation) searchParams.set('orientation', orientation)
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

  // Tỉ lệ khung hình người dùng đã chọn (1:1, 4:3, 3:4, 16:9) — dùng để ưu tiên ảnh có tỉ lệ gốc gần đúng
  // (preferMatchingAspectRatio) và tìm bổ sung 1 lượt theo orientation. Không dùng orientation THAY cho lượt tìm
  // chính (đã từng thử, làm tập kết quả liên quan bị thu hẹp quá mức và trả về nhiều ảnh sai chủ đề).
  const aspectRatio = String(req.query.aspectRatio ?? '')
  // productOnly=1: ảnh sản phẩm — bỏ ảnh có người (xem preferNoPeople). Ảnh bài viết không truyền, giữ ảnh có người.
  const productOnly = req.query.productOnly === '1'

  try {
    // Gọi song song 2 nguồn — nguồn nào lỗi/chưa cấu hình key thì trả [] (xem searchPexels/searchPixabay),
    // không làm hỏng nguồn còn lại.
    // Có chọn tỉ lệ → tìm BỔ SUNG thêm 1 lượt theo hướng ảnh tương ứng (VD 16:9 → ảnh ngang) để có thêm nhiều ảnh
    // gốc gần đúng tỉ lệ. Chỉ gộp thêm, không thay lượt tìm chính — lọc độ liên quan bên dưới vẫn áp dụng cho tất cả.
    //
    // `query` có thể gồm nhiều từ khóa thay thế cách nhau bởi "|" (VD "bluetooth speaker|portable speaker|wireless speaker")
    // — loại hàng ít ảnh stock (loa...) gộp nhiều lượt tìm để có nhiều ảnh khác nhau hơn. Từ khóa đầu tìm đủ cả lượt
    // theo hướng ảnh; các từ khóa phụ chỉ tìm lượt chính (đỡ tốn lượt gọi API). Mỗi từ khóa lọc độ liên quan riêng.
    // Từ có dấu "-" phía trước (VD "kitchen sink|stainless sink -bathroom") = loại ảnh có từ đó — tách ra khỏi câu tìm.
    const excludeWords = [...query.matchAll(/(?:^|\s)-([\p{L}\d]+)/gu)].map((m) => m[1].toLowerCase())
    const cleanQuery = query.replace(/(?:^|\s)-[\p{L}\d]+/gu, ' ')
    const alternatives = [...new Set(cleanQuery.split('|').map((q) => q.trim()).filter(Boolean))].slice(0, 4)
    const orientation = orientationFor(aspectRatio)
    const perAlternative = await Promise.all(
      alternatives.map(async (alt, i) => {
        const results = await Promise.all([
          searchPexels(alt),
          searchPixabay(alt),
          i === 0 && orientation ? searchPexels(alt, orientation.pexels) : Promise.resolve([]),
          i === 0 && orientation && orientation.pixabay !== 'all' ? searchPixabay(alt, orientation.pixabay) : Promise.resolve([]),
        ])
        const relevant = filterRelevantPhotos(results.flat(), alt)
        return alternatives.length > 1 ? requireHeadNoun(relevant, alt) : relevant
      }),
    )
    const seen = new Set<string>()
    // Khử trùng theo cả ảnh gốc lẫn trang nguồn — Pixabay hay trả cùng 1 ảnh với link largeImageURL khác nhau giữa các lượt tìm.
    const allPhotos = perAlternative.flat().filter((p) => {
      if (seen.has(p.raw) || seen.has(p.sourceUrl)) return false
      if (excludeWords.some((w) => p.matchText.includes(w))) return false
      seen.add(p.raw)
      seen.add(p.sourceUrl)
      return true
    })

    if (allPhotos.length === 0) {
      res.status(404).json({ error: `Không tìm thấy ảnh nào khớp "${query}"` })
      return
    }

    const relevant = productOnly ? preferNoPeople(allPhotos) : allPhotos
    // Ảnh sản phẩm luôn được cắt đúng tỉ lệ ở frontend → giữ nhiều ảnh hơn (đỡ trùng ảnh giữa các sản phẩm cùng loại).
    const final = aspectRatio ? preferMatchingAspectRatio(relevant, aspectRatio, productOnly ? PRODUCT_MIN_PHOTOS : MIN_CLOSE_PHOTOS) : relevant
    res.json({ photos: final.map(({ matchText: _matchText, ...photo }) => photo) })
  } catch (err) {
    res.status(502).json({ error: err instanceof Error ? err.message : 'Lỗi không xác định khi tìm ảnh' })
  }
})
