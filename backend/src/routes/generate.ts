import { Router } from 'express'
import { generateProducts } from '../aiClient.js'

export const generateRouter = Router()

generateRouter.post('/generate-products', async (req, res) => {
  const { industry, priceSegment, extraPrompt, count, collectionName } = (req.body ?? {}) as {
    industry?: string
    priceSegment?: string
    extraPrompt?: string
    count?: number
    collectionName?: string
  }

  if (!industry?.trim() || !priceSegment?.trim() || !count || count < 1) {
    res.status(400).json({ ok: false, error: 'Thiếu industry, priceSegment hoặc count' })
    return
  }

  try {
    const products = await generateProducts({
      industry,
      priceSegment,
      extraPrompt: extraPrompt ?? '',
      count: Math.min(count, 10),
      collectionName,
    })
    res.json({ ok: true, products })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Không sinh được sản phẩm bằng AI'
    res.status(502).json({ ok: false, error: message })
  }
})
