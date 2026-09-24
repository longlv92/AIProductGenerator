import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import { articlesRouter } from './routes/articles.js'
import { blogsRouter } from './routes/blogs.js'
import { collectionsRouter } from './routes/collections.js'
import { connectRouter } from './routes/connect.js'
import { generateRouter } from './routes/generate.js'
import { generateArticlesRouter } from './routes/generateArticles.js'
import { imagesRouter } from './routes/images.js'
import { oauthRouter } from './routes/oauth.js'
import { productsRouter } from './routes/products.js'

const app = express()

// credentials: true — bắt buộc để trình duyệt gửi kèm cookie phiên (session.ts) trong các request
// cross-site tới backend (frontend/backend deploy ở 2 domain khác nhau khi lên production).
app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173', credentials: true }))
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

app.use('/api', collectionsRouter)
app.use('/api', connectRouter)
app.use('/api', productsRouter)
app.use('/api', imagesRouter)
app.use('/api', generateRouter)
app.use('/api', blogsRouter)
app.use('/api', articlesRouter)
app.use('/api', generateArticlesRouter)
app.use('/api', oauthRouter)

const port = Number(process.env.PORT) || 4000
app.listen(port, () => {
  console.log(`Backend đang chạy tại http://localhost:${port}`)
})
