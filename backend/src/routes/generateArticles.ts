import { Router } from 'express'
import { generateArticles } from '../aiClient.js'

export const generateArticlesRouter = Router()

generateArticlesRouter.post('/generate-articles', async (req, res) => {
  const { topic, industry, tone, extraPrompt, count } = (req.body ?? {}) as {
    topic?: string
    industry?: string
    tone?: string
    extraPrompt?: string
    count?: number
  }

  if (!topic?.trim() || !industry?.trim() || !tone?.trim() || !count || count < 1) {
    res.status(400).json({ ok: false, error: 'Thiếu topic, industry, tone hoặc count' })
    return
  }

  try {
    const articles = await generateArticles({
      topic,
      industry,
      tone,
      extraPrompt: extraPrompt ?? '',
      count: Math.min(count, 10),
    })
    res.json({ ok: true, articles })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Không sinh được bài viết bằng AI'
    res.status(502).json({ ok: false, error: message })
  }
})
