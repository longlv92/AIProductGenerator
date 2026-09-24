import { Router } from 'express'
import { fetchCollections } from '../sapoClient.js'
import { requireStoreSession } from '../session.js'

export const collectionsRouter = Router()

collectionsRouter.get('/collections', requireStoreSession, async (req, res) => {
  const storeUrl = String(req.query.storeUrl ?? '').trim()
  if (!storeUrl) {
    res.status(400).json({ error: 'Thiếu tham số storeUrl' })
    return
  }

  try {
    const collections = await fetchCollections(storeUrl)
    res.json({ collections })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Lỗi không xác định khi gọi Sapo API'
    res.status(502).json({ error: message })
  }
})
