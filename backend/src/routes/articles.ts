import { Router } from 'express'
import { postArticle, type SapoArticleInput } from '../sapoArticleClient.js'
import { requireStoreSession } from '../session.js'

export const articlesRouter = Router()

articlesRouter.post('/articles', requireStoreSession, async (req, res) => {
  const { storeUrl, article, blogName } = (req.body ?? {}) as {
    storeUrl?: string
    article?: SapoArticleInput
    blogName?: string
  }

  if (!storeUrl?.trim() || !article || !blogName?.trim()) {
    res.status(400).json({ error: 'Thiếu storeUrl, article hoặc blogName' })
    return
  }

  try {
    const result = await postArticle(storeUrl, article, blogName)
    res.json({ ok: true, ...result })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Không đăng được bài viết lên Sapo'
    res.status(502).json({ ok: false, error: message })
  }
})
