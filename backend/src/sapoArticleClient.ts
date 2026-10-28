import { getStoreAuthHeader, type StoreAuthHeader } from './storeAuth.js'
import { normalizeStoreUrl } from './tokenStore.js'

export interface SapoBlog {
  id: number | string
  name: string
}

export interface SapoArticleInput {
  title: string
  author: string
  content: string
  excerpt: string
  tags: string[]
  /** Các URL ảnh THẬT đã khớp bài viết (qua Pexels) — chỉ set khi tìm được ảnh thật, không phải ảnh placeholder. */
  imageUrls?: string[]
  /** true = đăng công khai ngay (published_on = hiện tại); false = lưu nháp trên Sapo. */
  publishNow: boolean
}

export interface PostArticleResult {
  articleId: number | string
  articleUrl: string
  blog: SapoBlog
}

async function sapoRequestAuthed(
  storeUrl: string,
  header: { name: string; value: string },
  path: string,
  method: 'GET' | 'POST' | 'DELETE',
  body?: unknown,
): Promise<unknown> {
  const endpoint = `https://${normalizeStoreUrl(storeUrl)}${path}`
  const response = await fetch(endpoint, {
    method,
    headers: {
      [header.name]: header.value,
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const responseBody = await response.text().catch(() => '')
    throw new Error(`Sapo API trả lỗi ${response.status} ${response.statusText}: ${responseBody.slice(0, 300)}`)
  }

  // DELETE thành công của Sapo có thể trả về body rỗng — tránh crash khi parse JSON rỗng.
  const text = await response.text()
  return text ? JSON.parse(text) : {}
}

function parseBlogsResponse(data: unknown): SapoBlog[] {
  const rawList = Array.isArray(data) ? data : (data as { blogs?: unknown[] })?.blogs ?? []

  return (rawList as Array<{ id: number | string; name: string }>)
    .filter((item) => item && typeof item.name === 'string')
    .map((item) => ({ id: item.id, name: item.name }))
}

async function fetchBlogsWithHeader(storeUrl: string, header: StoreAuthHeader['header']): Promise<SapoBlog[]> {
  const data = await sapoRequestAuthed(storeUrl, header, '/admin/blogs.json', 'GET')
  return parseBlogsResponse(data)
}

/** Gọi GET /admin/blogs.json cho 1 store đã kết nối (Private App hoặc OAuth). */
export async function fetchBlogs(storeUrl: string): Promise<SapoBlog[]> {
  const { storeUrl: resolvedUrl, header } = getStoreAuthHeader(storeUrl)
  return fetchBlogsWithHeader(resolvedUrl, header)
}

/**
 * Gọi GET /admin/store.json lấy tên chủ store (`store_owner`) — dùng làm tác
 * giả mặc định cho bài viết thay vì tên do AI/dữ liệu mẫu tự bịa ra.
 */
export async function fetchStoreOwnerName(storeUrl: string): Promise<string | null> {
  const { storeUrl: resolvedUrl, header } = getStoreAuthHeader(storeUrl)
  const data = (await sapoRequestAuthed(resolvedUrl, header, '/admin/store.json', 'GET')) as {
    store?: { store_owner?: string }
  }
  return data.store?.store_owner?.trim() || null
}

/**
 * Tìm blog theo đúng tên (không phân biệt hoa/thường); nếu chưa có thì tạo
 * mới bằng POST /admin/blogs.json. Cùng nguyên tắc "tìm trước, tạo sau" như
 * findOrCreateCollection() ở sapoClient.ts — tránh tạo trùng blog khi nhiều
 * bài viết trong cùng lô cùng dùng 1 blog mới.
 */
export async function findOrCreateBlog(storeUrl: string, name: string): Promise<SapoBlog> {
  const { storeUrl: resolvedUrl, header } = getStoreAuthHeader(storeUrl)

  const existing = await fetchBlogsWithHeader(resolvedUrl, header)
  const match = existing.find((b) => b.name.trim().toLowerCase() === name.trim().toLowerCase())
  if (match) return match

  const data = (await sapoRequestAuthed(resolvedUrl, header, '/admin/blogs.json', 'POST', {
    blog: { name },
  })) as { blog?: { id: number | string; name: string } }

  if (!data.blog?.id) {
    throw new Error('Sapo không trả về id sau khi tạo blog mới.')
  }
  return { id: data.blog.id, name: data.blog.name }
}

/**
 * POST /admin/blogs/{blogId}/articles.json — tạo bài viết thật trên Sapo.
 *
 * Chỉ gửi kèm `image` khi có `imageUrls` — tức ảnh THẬT đã khớp qua Pexels,
 * cùng nguyên tắc với createProduct() ở sapoClient.ts.
 */
export async function createArticle(
  storeUrl: string,
  blogId: number | string,
  input: SapoArticleInput,
): Promise<{ id: number | string }> {
  const { storeUrl: resolvedUrl, header } = getStoreAuthHeader(storeUrl)

  const data = (await sapoRequestAuthed(resolvedUrl, header, `/admin/blogs/${blogId}/articles.json`, 'POST', {
    article: {
      title: input.title,
      author: input.author,
      content: input.content,
      summary: input.excerpt,
      tags: input.tags.join(', '),
      ...(input.publishNow ? { published_on: new Date().toISOString() } : {}),
      ...(input.imageUrls && input.imageUrls.length > 0 ? { image: { src: input.imageUrls[0] } } : {}),
    },
  })) as { article?: { id: number | string } }

  if (!data.article?.id) {
    throw new Error('Sapo không trả về id sau khi tạo bài viết.')
  }
  return { id: data.article.id }
}

/** Tạo bài viết + find-or-create blog theo tên — gộp cả luồng cho route /api/articles. */
export async function postArticle(storeUrl: string, input: SapoArticleInput, blogName: string): Promise<PostArticleResult> {
  const blog = await findOrCreateBlog(storeUrl, blogName)
  const { id: articleId } = await createArticle(storeUrl, blog.id, input)
  const articleUrl = `https://${normalizeStoreUrl(storeUrl)}/admin/articles/${articleId}`
  return { articleId, articleUrl, blog }
}

/**
 * Tìm toàn bộ bài viết có gắn tag `demo` rồi xóa hẳn khỏi Sapo — cùng nguyên tắc với
 * deleteProductsByTag() ở sapoClient.ts (Sapo không hỗ trợ lọc theo tag, phải tự phân trang + lọc).
 * Article không có API liệt kê toàn store (phải biết blog_id), nên phải lặp qua TỪNG blog trước.
 */
export async function deleteArticlesByTag(storeUrl: string, tag: string): Promise<{ deleted: number; failed: number }> {
  const { storeUrl: resolvedUrl, header } = getStoreAuthHeader(storeUrl)
  const blogs = await fetchBlogsWithHeader(resolvedUrl, header)
  const PAGE_SIZE = 250
  let deleted = 0
  let failed = 0

  for (const blog of blogs) {
    let page = 1
    while (true) {
      const data = (await sapoRequestAuthed(
        resolvedUrl,
        header,
        `/admin/blogs/${blog.id}/articles.json?limit=${PAGE_SIZE}&page=${page}&fields=id,tags`,
        'GET',
      )) as { articles?: Array<{ id: number | string; tags?: string }> }

      const articles = data.articles ?? []
      if (articles.length === 0) break

      const matched = articles.filter((a) =>
        (a.tags ?? '')
          .split(',')
          .map((t) => t.trim().toLowerCase())
          .includes(tag.toLowerCase()),
      )

      for (const a of matched) {
        try {
          await sapoRequestAuthed(resolvedUrl, header, `/admin/blogs/${blog.id}/articles/${a.id}.json`, 'DELETE')
          deleted++
        } catch {
          failed++
        }
      }

      if (articles.length < PAGE_SIZE) break
      page++
    }
  }

  return { deleted, failed }
}
