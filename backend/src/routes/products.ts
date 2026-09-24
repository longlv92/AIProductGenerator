import { Router } from 'express'
import { postProduct, type SapoProductInput } from '../sapoClient.js'
import { requireStoreSession } from '../session.js'

export const productsRouter = Router()

productsRouter.post('/products', requireStoreSession, async (req, res) => {
  const { storeUrl, product, collectionName } = (req.body ?? {}) as {
    storeUrl?: string
    product?: SapoProductInput
    collectionName?: string
  }

  if (!storeUrl?.trim() || !product) {
    res.status(400).json({ error: 'Thiếu storeUrl hoặc product' })
    return
  }

  try {
    const result = await postProduct(storeUrl, product, collectionName)
    res.json({ ok: true, ...result })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Không đăng được sản phẩm lên Sapo'
    res.status(502).json({ ok: false, error: message })
  }
})
