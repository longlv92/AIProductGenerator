import { Router } from 'express'
import { fetchBlogs, fetchStoreOwnerName } from '../sapoArticleClient.js'
import { requireStoreSession } from '../session.js'

export const blogsRouter = Router()

blogsRouter.get('/blogs', requireStoreSession, async (req, res) => {
  const storeUrl = String(req.query.storeUrl ?? '').trim()
  if (!storeUrl) {
    res.status(400).json({ error: 'Thiếu tham số storeUrl' })
    return
  }

  try {
    const blogs = await fetchBlogs(storeUrl)
    res.json({ blogs })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Lỗi không xác định khi gọi Sapo API'
    res.status(502).json({ error: message })
  }
})

blogsRouter.get('/store-owner', requireStoreSession, async (req, res) => {
  const storeUrl = String(req.query.storeUrl ?? '').trim()
  if (!storeUrl) {
    res.status(400).json({ error: 'Thiếu tham số storeUrl' })
    return
  }

  try {
    const ownerName = await fetchStoreOwnerName(storeUrl)
    res.json({ ownerName })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Lỗi không xác định khi gọi Sapo API'
    res.status(502).json({ error: message })
  }
})
