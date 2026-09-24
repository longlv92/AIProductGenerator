import { Router } from 'express'

export const imagesRouter = Router()

interface PexelsPhoto {
  src: { medium: string; large: string; large2x: string; original: string }
  photographer: string
  url: string
}

/** Ánh xạ tỉ lệ khung hình người dùng chọn → orientation Pexels hỗ trợ khi tìm kiếm (ưu tiên ảnh gốc đã đúng bố cục). */
const ORIENTATION_BY_RATIO: Record<string, string> = {
  '1:1': 'square',
  '4:3': 'landscape',
  '16:9': 'landscape',
  '3:4': 'portrait',
}

/**
 * Tìm 1 ảnh thật khớp từ khóa sản phẩm qua Pexels API (miễn phí, không cần
 * thẻ tín dụng — đăng ký tại https://www.pexels.com/api/).
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

  const apiKey = process.env.PEXELS_API_KEY
  if (!apiKey) {
    res.status(500).json({ error: 'Chưa cấu hình PEXELS_API_KEY trong backend/.env' })
    return
  }

  // Tỉ lệ khung hình người dùng chọn (1:1, 4:3, 3:4, 16:9) — dùng để vừa thiên hướng tìm ảnh có bố cục
  // hợp (orientation), vừa trả kèm URL gốc để phía gọi tự crop chính xác đúng tỉ lệ (xem sapoApi.ts:cropImageUrl).
  const aspectRatio = String(req.query.aspectRatio ?? '')
  const orientation = ORIENTATION_BY_RATIO[aspectRatio]

  try {
    // Lấy nhiều kết quả (không chỉ 1) — nhiều sản phẩm có thể cùng imageKeyword
    // (VD cùng là "váy"), nếu luôn trả đúng 1 ảnh thì tất cả sẽ hiện ảnh giống
    // hệt nhau. Trả cả danh sách để phía gọi tự chọn ảnh khác nhau cho từng SP.
    const searchParams = new URLSearchParams({ query, per_page: '15' })
    if (orientation) searchParams.set('orientation', orientation)
    const response = await fetch(`https://api.pexels.com/v1/search?${searchParams}`, {
      headers: { Authorization: apiKey },
    })

    if (!response.ok) {
      const body = await response.text().catch(() => '')
      res.status(502).json({ error: `Pexels API trả lỗi ${response.status}: ${body.slice(0, 200)}` })
      return
    }

    const data = (await response.json()) as { photos?: PexelsPhoto[] }
    const photos = data.photos ?? []
    if (photos.length === 0) {
      res.status(404).json({ error: `Không tìm thấy ảnh nào khớp "${query}"` })
      return
    }

    // large2x (~940x650, độ nét gấp đôi) — dùng khi phía gọi không cần crop theo tỉ lệ cụ thể.
    // raw (ảnh gốc) — để phía gọi tự crop chính xác đúng tỉ lệ đã chọn qua tham số URL của Pexels CDN.
    res.json({
      photos: photos.map((p) => ({ url: p.src.large2x, raw: p.src.original, photographer: p.photographer, sourceUrl: p.url })),
    })
  } catch (err) {
    res.status(502).json({ error: err instanceof Error ? err.message : 'Lỗi không xác định khi tìm ảnh' })
  }
})
