import type { ImageAspectRatio } from './types'

export interface SapoCollection {
  id: string
  name: string
  /** true nếu do người dùng tự nhập trong tool (chưa thật sự tồn tại trên store cho đến khi đăng sản phẩm đầu tiên). */
  isNew?: boolean
}

// Đọc từ biến môi trường build-time của Vite (VITE_BACKEND_URL) — set trong Render (hoặc .env.production)
// khi deploy để trỏ đúng domain backend thật; mặc định localhost khi chạy dev trên máy.
export const BACKEND_URL: string = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:4000'

export interface ConnectResult {
  ok: boolean
  error?: string
}

/**
 * Gửi URL store + API Key/Secret (Private App) lên backend để xác thực ngay
 * (backend thử gọi 1 API thật của Sapo) — chỉ lưu lại nếu đúng.
 */
export async function connectStore(storeUrl: string, apiKey: string, apiSecret: string): Promise<ConnectResult> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storeUrl, apiKey, apiSecret }),
      credentials: 'include',
      signal: AbortSignal.timeout(10000),
    })
    const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null
    if (res.ok && data?.ok) return { ok: true }
    return { ok: false, error: data?.error ?? 'Kết nối thất bại, vui lòng thử lại.' }
  } catch (err) {
    return {
      ok: false,
      error: `Không gọi được backend — kiểm tra backend đã chạy chưa (npm run dev trong thư mục backend). Chi tiết: ${
        err instanceof Error ? err.message : String(err)
      }`,
    }
  }
}

export interface PostProductInput {
  name: string
  description: string
  shortDescription: string
  category: string
  brand: string
  tags: string[]
  price: number
  compareAtPrice: number
  sku: string
  barcode: string
  stockQuantity: number
  weight: number
  weightUnit: string
  /** Các URL ảnh THẬT đã khớp sản phẩm (qua Pexels) — bỏ trống/mảng rỗng nếu chưa tìm được ảnh thật. */
  imageUrls?: string[]
  /** true = đăng công khai ngay; false = đăng ở trạng thái ẩn/nháp trên Sapo (xem backend/sapoClient.ts:createProduct). */
  publishNow: boolean
}

export interface PostProductResult {
  ok: boolean
  productId?: string
  productUrl?: string
  collection?: { id: string; name: string }
  error?: string
  /** true = backend không gọi được (có thể chưa chạy) — khác với Sapo từ chối request. */
  backendUnavailable?: boolean
}

/**
 * Đăng 1 sản phẩm thật lên Sapo qua backend (POST /admin/products.json, kèm
 * gán danh mục qua /admin/custom_collections.json + /admin/collects.json nếu
 * có collectionName). KHÔNG có dữ liệu giả lập cho việc này — nếu backend
 * không gọi được, trả về backendUnavailable:true để App.tsx tự quyết định có
 * mô phỏng hay báo lỗi thẳng cho người dùng.
 */
export async function postProductToSapo(
  storeUrl: string,
  product: PostProductInput,
  collectionName?: string,
): Promise<PostProductResult> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storeUrl, product, collectionName }),
      credentials: 'include',
      signal: AbortSignal.timeout(15000),
    })
    const data = (await res.json().catch(() => null)) as
      | {
          ok?: boolean
          productId?: string | number
          productUrl?: string
          collection?: { id: string | number; name: string }
          error?: string
        }
      | null

    if (res.ok && data?.ok) {
      return {
        ok: true,
        productId: data.productId !== undefined ? String(data.productId) : undefined,
        productUrl: data.productUrl,
        collection: data.collection ? { id: String(data.collection.id), name: data.collection.name } : undefined,
      }
    }
    return { ok: false, error: data?.error ?? 'Đăng sản phẩm thất bại, vui lòng thử lại.' }
  } catch (err) {
    return {
      ok: false,
      backendUnavailable: true,
      error: `Không gọi được backend — kiểm tra backend đã chạy chưa (npm run dev trong thư mục backend). Chi tiết: ${
        err instanceof Error ? err.message : String(err)
      }`,
    }
  }
}

export interface DeleteDemoDataResult {
  ok: boolean
  deletedProducts?: number
  deletedArticles?: number
  error?: string
}

/**
 * Xóa hẳn toàn bộ sản phẩm + bài viết demo (tag `demo`) của 1 store khỏi Sapo — xem
 * backend/routes/cleanup.ts. Hành động KHÔNG thể hoàn tác, nơi gọi (App.tsx) phải xác nhận với
 * người dùng trước khi gọi hàm này.
 */
export async function deleteDemoData(storeUrl: string): Promise<DeleteDemoDataResult> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/cleanup/demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storeUrl }),
      credentials: 'include',
      signal: AbortSignal.timeout(120000),
    })
    const data = (await res.json().catch(() => null)) as
      | { ok?: boolean; deletedProducts?: number; deletedArticles?: number; error?: string }
      | null

    if (res.ok && data?.ok) {
      return { ok: true, deletedProducts: data.deletedProducts ?? 0, deletedArticles: data.deletedArticles ?? 0 }
    }
    return { ok: false, error: data?.error ?? 'Xóa dữ liệu demo thất bại, vui lòng thử lại.' }
  } catch (err) {
    return { ok: false, error: `Không gọi được backend. Chi tiết: ${err instanceof Error ? err.message : String(err)}` }
  }
}

export interface AiGeneratedProductContent {
  name: string
  shortDescription: string
  description: string
  price: number
  compareAtPrice: number
  category: string
  brand: string
  tags: string[]
  imageKeyword: string
  weight: number
  attributes: { name: string; value: string }[]
  seoTitle: string
  seoDescription: string
}

export interface GenerateProductsParams {
  industry: string
  priceSegment: string
  extraPrompt: string
  count: number
  collectionName?: string
}

export interface GenerateProductsResult {
  ok: boolean
  products?: AiGeneratedProductContent[]
  error?: string
  /** true = backend không gọi được (có thể chưa chạy) — khác với AI/Claude từ chối hoặc chưa cấu hình key. */
  backendUnavailable?: boolean
}

/**
 * Sinh 1 lô sản phẩm bằng AI thật (Claude) qua backend. KHÔNG có dữ liệu giả
 * lập ở đây — App.tsx tự quyết định rơi về mockGenerate.ts cục bộ khi
 * backendUnavailable hoặc khi backend báo lỗi (VD chưa cấu hình ANTHROPIC_API_KEY).
 */
export async function generateProductsBatch(params: GenerateProductsParams): Promise<GenerateProductsResult> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/generate-products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      signal: AbortSignal.timeout(60000),
    })
    const data = (await res.json().catch(() => null)) as
      | { ok?: boolean; products?: AiGeneratedProductContent[]; error?: string }
      | null
    if (res.ok && data?.ok && Array.isArray(data.products)) {
      return { ok: true, products: data.products }
    }
    return { ok: false, error: data?.error ?? 'Sinh sản phẩm bằng AI thất bại.' }
  } catch (err) {
    return {
      ok: false,
      backendUnavailable: true,
      error: `Không gọi được backend — kiểm tra backend đã chạy chưa (npm run dev trong thư mục backend). Chi tiết: ${
        err instanceof Error ? err.message : String(err)
      }`,
    }
  }
}

interface RawPhoto {
  /** Ảnh sẵn dùng, không crop theo tỉ lệ nào (Pexels large2x) — dùng khi không truyền aspectRatio. */
  url: string
  /** Ảnh gốc chưa crop — dùng làm nguồn để cropImageUrl() cắt chính xác theo tỉ lệ đã chọn. */
  raw: string
}

const imageSearchCache = new Map<string, Promise<RawPhoto[]>>()

/** Kích thước đích (px) cho từng tỉ lệ khung hình — dùng để crop ảnh Pexels đúng tỉ lệ đã chọn. */
const CROP_SIZE_BY_RATIO: Record<ImageAspectRatio, { w: number; h: number }> = {
  '1:1': { w: 1200, h: 1200 },
  '4:3': { w: 1200, h: 900 },
  '3:4': { w: 900, h: 1200 },
  '16:9': { w: 1280, h: 720 },
}

/**
 * Cắt ảnh gốc đúng tỉ lệ khung hình đã chọn — CHỈ hoạt động với ảnh từ Pexels CDN (images.pexels.com), vì
 * đây là dịch vụ resize/crop qua tham số URL (`fit=crop&w=&h=`) riêng của Pexels. Ảnh từ nguồn khác (VD
 * Pixabay — xem backend/routes/images.ts) không hỗ trợ crop qua URL nên giữ nguyên kích thước gốc; khi
 * hiển thị trên giao diện vẫn được CSS `object-cover` tự crop vừa khung, chỉ ảnh THẬT đăng lên Sapo mới
 * không được crop sẵn đúng tỉ lệ trong trường hợp này. Không truyền aspectRatio → giữ nguyên ảnh gốc.
 */
function cropImageUrl(rawUrl: string, aspectRatio?: ImageAspectRatio): string {
  if (!aspectRatio || !rawUrl.includes('images.pexels.com')) return rawUrl
  const { w, h } = CROP_SIZE_BY_RATIO[aspectRatio]
  const separator = rawUrl.includes('?') ? '&' : '?'
  return `${rawUrl}${separator}auto=compress&cs=tinysrgb&fit=crop&w=${w}&h=${h}`
}

/**
 * Tìm NHIỀU ảnh thật khớp `query` (từ khóa tiếng Anh) qua backend → Pexels
 * API — dùng để 1 sản phẩm có nhiều ảnh (gallery) thay vì chỉ 1 ảnh đại diện.
 * Trả về mảng rỗng nếu backend chưa chạy/chưa cấu hình PEXELS_API_KEY hoặc
 * không tìm thấy ảnh — nơi gọi tự lo phương án dự phòng (xem ProductImage.tsx).
 *
 * Backend trả về tối đa 15 ảnh khớp `query` — cache cả danh sách theo `query`
 * trong phiên làm việc (đỡ gọi lại Pexels nhiều lần, tránh tốn hạn mức miễn
 * phí), rồi dùng `variationKey` (VD sku sản phẩm) làm điểm bắt đầu chọn ảnh —
 * tránh nhiều sản phẩm cùng loại (VD nhiều "váy") hiện trùng y hệt bộ ảnh.
 *
 * `aspectRatio` (nếu truyền): ảnh trả về được crop đúng tỉ lệ này (xem cropImageUrl()), đồng thời thiên
 * hướng kết quả tìm kiếm sang orientation phù hợp (xem backend/routes/images.ts) — không chỉ hiển thị
 * đúng tỉ lệ trên giao diện mà ảnh thật sự tải lên Sapo cũng đúng tỉ lệ đã chọn.
 */
export async function fetchProductImageUrls(query: string, variationKey = '', count = 1, aspectRatio?: ImageAspectRatio): Promise<string[]> {
  if (!query) return []
  const cacheKey = `${query}::${aspectRatio ?? ''}`
  if (!imageSearchCache.has(cacheKey)) {
    imageSearchCache.set(cacheKey, fetchProductImageUrlsUncached(query, aspectRatio))
  }
  const photos = await imageSearchCache.get(cacheKey)!
  if (photos.length === 0) return []
  const startIndex = hashString(query + variationKey) % photos.length
  const n = Math.min(count, photos.length)
  // Có aspectRatio → crop từ ảnh gốc cho đúng tỉ lệ. Không có → dùng sẵn large2x (nhẹ hơn ảnh gốc nhiều).
  return Array.from({ length: n }, (_, i) => {
    const photo = photos[(startIndex + i) % photos.length]
    return aspectRatio ? cropImageUrl(photo.raw, aspectRatio) : photo.url
  })
}

/** Tìm 1 ảnh thật khớp `query` — xem fetchProductImageUrls() (đây chỉ lấy ảnh đầu tiên). */
export async function fetchProductImageUrl(query: string, variationKey = '', aspectRatio?: ImageAspectRatio): Promise<string | null> {
  const urls = await fetchProductImageUrls(query, variationKey, 1, aspectRatio)
  return urls[0] ?? null
}

async function fetchProductImageUrlsUncached(query: string, aspectRatio?: ImageAspectRatio): Promise<RawPhoto[]> {
  try {
    const params = new URLSearchParams({ query })
    if (aspectRatio) params.set('aspectRatio', aspectRatio)
    const res = await fetch(`${BACKEND_URL}/api/image-search?${params}`, {
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) return []
    const data = (await res.json()) as { photos?: Array<{ url: string; raw: string }> }
    return data.photos?.map((p) => ({ url: p.url, raw: p.raw })) ?? []
  } catch {
    return []
  }
}

/**
 * Lấy danh sách Danh mục (Collection) CÓ SẴN trong store Sapo đã kết nối.
 *
 * Ưu tiên gọi backend thật (xem thư mục /backend — endpoint GET /api/collections,
 * dùng API Key/Secret đã lưu cho store này để gọi thật GET /admin/collections.json
 * của Sapo). Nếu backend chưa chạy hoặc store chưa kết nối, tự động rơi về dữ
 * liệu giả lập để vẫn demo được giao diện.
 */
export async function fetchStoreCollections(storeUrl: string): Promise<SapoCollection[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/collections?storeUrl=${encodeURIComponent(storeUrl)}`, {
      credentials: 'include',
      signal: AbortSignal.timeout(4000),
    })
    if (res.ok) {
      const data = (await res.json()) as { collections?: Array<{ id: string | number; name: string }> }
      if (Array.isArray(data.collections)) {
        return data.collections.map((c) => ({ id: String(c.id), name: c.name }))
      }
    } else {
      const data = (await res.json().catch(() => null)) as { error?: string } | null
      console.warn('[sapoApi] Backend trả lỗi, dùng dữ liệu giả lập:', data?.error ?? res.statusText)
    }
  } catch (err) {
    console.warn('[sapoApi] Không gọi được backend (có thể chưa chạy), dùng dữ liệu giả lập:', err)
  }

  return mockFetchStoreCollections(storeUrl)
}

const SAMPLE_COLLECTIONS = [
  'Sản phẩm mới',
  'Bán chạy nhất',
  'Đang khuyến mãi',
  'Thời trang nam',
  'Thời trang nữ',
  'Chăm sóc da',
  'Đồ gia dụng',
  'Phụ kiện điện thoại',
]

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function hashString(input: string): number {
  let hash = 0
  for (let i = 0; i < input.length; i++) hash = (hash * 31 + input.charCodeAt(i)) >>> 0
  return hash
}

/** Dữ liệu giả lập dùng khi chưa có/không gọi được backend thật — xem fetchStoreCollections(). */
async function mockFetchStoreCollections(storeUrl: string): Promise<SapoCollection[]> {
  await delay(500 + Math.random() * 500)
  const hash = hashString(storeUrl.trim().toLowerCase())
  if (hash % 10 < 3) return []

  const count = 3 + (hash % 4)
  const start = hash % SAMPLE_COLLECTIONS.length
  const names = Array.from({ length: count }, (_, i) => SAMPLE_COLLECTIONS[(start + i) % SAMPLE_COLLECTIONS.length])
  return [...new Set(names)].map((name, i) => ({ id: `col-${i}`, name }))
}

// ─── Tin tức (Article/Blog) — cùng pattern với sản phẩm ở trên ───

export interface SapoBlog {
  id: string
  name: string
  isNew?: boolean
}

export interface PostArticleInput {
  title: string
  author: string
  content: string
  excerpt: string
  tags: string[]
  imageUrls?: string[]
  publishNow: boolean
}

export interface PostArticleResult {
  ok: boolean
  articleId?: string
  articleUrl?: string
  blog?: { id: string; name: string }
  error?: string
  backendUnavailable?: boolean
}

/** Đăng 1 bài viết thật lên Sapo qua backend (POST /admin/blogs/{id}/articles.json). Cùng nguyên tắc với postProductToSapo(). */
export async function postArticleToSapo(storeUrl: string, article: PostArticleInput, blogName: string): Promise<PostArticleResult> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/articles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storeUrl, article, blogName }),
      credentials: 'include',
      signal: AbortSignal.timeout(15000),
    })
    const data = (await res.json().catch(() => null)) as
      | {
          ok?: boolean
          articleId?: string | number
          articleUrl?: string
          blog?: { id: string | number; name: string }
          error?: string
        }
      | null

    if (res.ok && data?.ok) {
      return {
        ok: true,
        articleId: data.articleId !== undefined ? String(data.articleId) : undefined,
        articleUrl: data.articleUrl,
        blog: data.blog ? { id: String(data.blog.id), name: data.blog.name } : undefined,
      }
    }
    return { ok: false, error: data?.error ?? 'Đăng bài viết thất bại, vui lòng thử lại.' }
  } catch (err) {
    return {
      ok: false,
      backendUnavailable: true,
      error: `Không gọi được backend — kiểm tra backend đã chạy chưa (npm run dev trong thư mục backend). Chi tiết: ${
        err instanceof Error ? err.message : String(err)
      }`,
    }
  }
}

export interface AiGeneratedArticleContent {
  title: string
  excerpt: string
  content: string
  tags: string[]
  imageKeyword: string
  author: string
  seoTitle: string
  seoDescription: string
}

export interface GenerateArticlesParams {
  topic: string
  industry: string
  tone: string
  extraPrompt: string
  count: number
}

export interface GenerateArticlesResult {
  ok: boolean
  articles?: AiGeneratedArticleContent[]
  error?: string
  backendUnavailable?: boolean
}

/** Sinh 1 lô bài viết bằng AI thật (Claude) qua backend. Cùng nguyên tắc với generateProductsBatch(). */
export async function generateArticlesBatch(params: GenerateArticlesParams): Promise<GenerateArticlesResult> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/generate-articles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      signal: AbortSignal.timeout(60000),
    })
    const data = (await res.json().catch(() => null)) as
      | { ok?: boolean; articles?: AiGeneratedArticleContent[]; error?: string }
      | null
    if (res.ok && data?.ok && Array.isArray(data.articles)) {
      return { ok: true, articles: data.articles }
    }
    return { ok: false, error: data?.error ?? 'Sinh bài viết bằng AI thất bại.' }
  } catch (err) {
    return {
      ok: false,
      backendUnavailable: true,
      error: `Không gọi được backend — kiểm tra backend đã chạy chưa (npm run dev trong thư mục backend). Chi tiết: ${
        err instanceof Error ? err.message : String(err)
      }`,
    }
  }
}

/**
 * Lấy danh sách Blog CÓ SẴN trong store Sapo đã kết nối. Cùng nguyên tắc với
 * fetchStoreCollections() — rơi về dữ liệu giả lập nếu backend chưa chạy.
 */
export async function fetchStoreBlogs(storeUrl: string): Promise<SapoBlog[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/blogs?storeUrl=${encodeURIComponent(storeUrl)}`, {
      credentials: 'include',
      signal: AbortSignal.timeout(4000),
    })
    if (res.ok) {
      const data = (await res.json()) as { blogs?: Array<{ id: string | number; name: string }> }
      if (Array.isArray(data.blogs)) {
        return data.blogs.map((b) => ({ id: String(b.id), name: b.name }))
      }
    } else {
      const data = (await res.json().catch(() => null)) as { error?: string } | null
      console.warn('[sapoApi] Backend trả lỗi, dùng dữ liệu giả lập:', data?.error ?? res.statusText)
    }
  } catch (err) {
    console.warn('[sapoApi] Không gọi được backend (có thể chưa chạy), dùng dữ liệu giả lập:', err)
  }

  return mockFetchStoreBlogs(storeUrl)
}

const SAMPLE_BLOGS = ['Tin tức', 'Khuyến mãi', 'Blog chia sẻ', 'Sự kiện']

/** Dữ liệu giả lập dùng khi chưa có/không gọi được backend thật — xem fetchStoreBlogs(). */
async function mockFetchStoreBlogs(storeUrl: string): Promise<SapoBlog[]> {
  await delay(400 + Math.random() * 400)
  const hash = hashString(`blog-${storeUrl.trim().toLowerCase()}`)
  if (hash % 10 < 2) return []

  const count = 1 + (hash % SAMPLE_BLOGS.length)
  const names = SAMPLE_BLOGS.slice(0, count)
  return names.map((name, i) => ({ id: `blog-${i}`, name }))
}

/**
 * Lấy tên chủ store Sapo (GET /admin/store.json → `store_owner`) — dùng làm
 * tác giả mặc định cho bài viết thay vì tên do AI/dữ liệu mẫu tự bịa ra.
 * Trả về `null` nếu backend chưa chạy hoặc Sapo không trả về tên.
 */
export async function fetchStoreOwnerName(storeUrl: string): Promise<string | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/store-owner?storeUrl=${encodeURIComponent(storeUrl)}`, {
      credentials: 'include',
      signal: AbortSignal.timeout(4000),
    })
    if (!res.ok) return null
    const data = (await res.json()) as { ownerName?: string | null }
    return data.ownerName ?? null
  } catch {
    return null
  }
}
