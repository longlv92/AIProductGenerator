import { Router } from 'express'
import { deleteArticlesByTag } from '../sapoArticleClient.js'
import { deleteProductsByTag } from '../sapoClient.js'
import { requireStoreSession } from '../session.js'

export const cleanupRouter = Router()

/** Tag hệ thống tự gắn cho MỌI sản phẩm/bài viết do tool này sinh ra — xem mockGenerate.ts/mockGenerateArticle.ts. */
const DEMO_TAG = 'demo'

/**
 * POST /api/cleanup/demo — xóa hẳn toàn bộ sản phẩm + bài viết demo (gắn tag `demo`) của 1 store khỏi
 * Sapo. Hành động không thể hoàn tác — frontend phải xác nhận với người dùng trước khi gọi route này.
 */
cleanupRouter.post('/cleanup/demo', requireStoreSession, async (req, res) => {
  const { storeUrl } = (req.body ?? {}) as { storeUrl?: string }

  if (!storeUrl?.trim()) {
    res.status(400).json({ error: 'Thiếu storeUrl' })
    return
  }

  try {
    const [products, articles] = await Promise.all([deleteProductsByTag(storeUrl, DEMO_TAG), deleteArticlesByTag(storeUrl, DEMO_TAG)])
    res.json({ ok: true, deletedProducts: products.deleted, failedProducts: products.failed, deletedArticles: articles.deleted, failedArticles: articles.failed })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Không xóa được dữ liệu demo'
    res.status(502).json({ ok: false, error: message })
  }
})
