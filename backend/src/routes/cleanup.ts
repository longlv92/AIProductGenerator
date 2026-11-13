import { Router } from 'express'
import { deleteArticlesByTag } from '../sapoArticleClient.js'
import { deleteProductsByTag } from '../sapoClient.js'
import { deleteRecordedItems } from '../createdItems.js'
import { requireStoreSession } from '../session.js'

export const cleanupRouter = Router()

/** Tag các bản cũ của tool tự gắn cho sản phẩm/bài viết — giờ không gắn nữa, chỉ còn dùng để dọn dữ liệu đăng từ trước. */
const LEGACY_DEMO_TAG = 'demo'

/**
 * POST /api/cleanup/demo — xóa hẳn toàn bộ sản phẩm + bài viết tool đã đăng lên 1 store: các mục đã ghi lại id
 * (xem createdItems.ts) + dữ liệu cũ còn gắn tag `demo`. Hành động không thể hoàn tác — frontend phải xác nhận với người dùng trước khi gọi route này.
 */
cleanupRouter.post('/cleanup/demo', requireStoreSession, async (req, res) => {
  const { storeUrl } = (req.body ?? {}) as { storeUrl?: string }

  if (!storeUrl?.trim()) {
    res.status(400).json({ error: 'Thiếu storeUrl' })
    return
  }

  try {
    const recorded = await deleteRecordedItems(storeUrl)
    const [products, articles] = await Promise.all([
      deleteProductsByTag(storeUrl, LEGACY_DEMO_TAG),
      deleteArticlesByTag(storeUrl, LEGACY_DEMO_TAG),
    ])
    res.json({
      ok: true,
      deletedProducts: recorded.deletedProducts + products.deleted,
      failedProducts: recorded.failedProducts + products.failed,
      deletedArticles: recorded.deletedArticles + articles.deleted,
      failedArticles: recorded.failedArticles + articles.failed,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Không xóa được dữ liệu demo'
    res.status(502).json({ ok: false, error: message })
  }
})
