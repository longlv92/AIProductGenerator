import { Router } from 'express'
import { fetchCollectionsRaw } from '../sapoClient.js'
import { grantStoreSession } from '../session.js'
import { saveConnection } from '../tokenStore.js'

export const connectRouter = Router()

connectRouter.post('/connect', async (req, res) => {
  const { storeUrl, apiKey, apiSecret } = (req.body ?? {}) as { storeUrl?: string; apiKey?: string; apiSecret?: string }

  if (!storeUrl?.trim() || !apiKey?.trim() || !apiSecret?.trim()) {
    res.status(400).json({ error: 'Thiếu URL store, API Key hoặc API Secret' })
    return
  }

  try {
    // Gọi thử 1 API thật để chắc chắn key/secret đúng trước khi lưu lại.
    await fetchCollectionsRaw(storeUrl, apiKey, apiSecret)
    saveConnection(storeUrl, { authType: 'private_app', apiKey, apiSecret, connectedAt: new Date().toISOString() })
    grantStoreSession(req, res, storeUrl)
    res.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Không xác thực được với Sapo'
    res.status(401).json({ error: message })
  }
})
