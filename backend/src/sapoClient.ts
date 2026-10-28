import { getStoreAuthHeader, type StoreAuthHeader } from './storeAuth.js'
import { normalizeStoreUrl } from './tokenStore.js'

export interface SapoCollection {
  id: number | string
  name: string
}

export interface SapoProductInput {
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
  /** Các URL ảnh THẬT đã khớp sản phẩm (qua Pexels) — chỉ set khi tìm được ảnh thật, không phải ảnh placeholder. */
  imageUrls?: string[]
  /** true = đăng công khai ngay; false = gửi published_on: null để Sapo lưu ở trạng thái ẩn/nháp. */
  publishNow: boolean
}

export interface PostProductResult {
  productId: number | string
  productUrl: string
  collection?: SapoCollection
}

function buildBasicAuthHeader(apiKey: string, apiSecret: string): string {
  return `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')}`
}

/** Gọi Sapo API bằng API Key/Secret truyền thẳng vào (Private App, CHƯA lưu) — chỉ dùng để xác thực lần đầu, xem fetchCollectionsRaw(). */
async function sapoRequest(
  storeUrl: string,
  apiKey: string,
  apiSecret: string,
  path: string,
  method: 'GET' | 'POST',
  body?: unknown,
): Promise<unknown> {
  return sapoRequestAuthed(storeUrl, { name: 'Authorization', value: buildBasicAuthHeader(apiKey, apiSecret) }, path, method, body)
}

/**
 * Gọi Sapo API cho 1 store ĐÃ kết nối — dùng header xác thực chung do
 * storeAuth.ts trả về (Private App `Authorization: Basic ...` hoặc OAuth
 * `X-Sapo-Access-Token: ...`), không cần biết store đang dùng kiểu nào.
 */
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

  // DELETE thành công của Sapo có thể trả về body rỗng (204/200 không JSON) — tránh crash khi parse JSON rỗng.
  const text = await response.text()
  return text ? JSON.parse(text) : {}
}

function parseCollectionsResponse(data: unknown): SapoCollection[] {
  const rawList = Array.isArray(data) ? data : (data as { collections?: unknown[] })?.collections ?? []

  return (rawList as Array<{ id: number | string; name: string }>)
    .filter((item) => item && typeof item.name === 'string')
    .map((item) => ({ id: item.id, name: item.name }))
}

/**
 * Gọi GET /admin/collections.json bằng API Key/Secret truyền thẳng vào (chưa
 * lưu) — dùng để XÁC THỰC ngay khi người dùng vừa nhập key/secret, trước khi
 * quyết định có lưu lại hay không (xem routes/connect.ts). Chỉ áp dụng cho
 * Private App — OAuth không có bước xác thực trước-khi-lưu tương tự.
 */
export async function fetchCollectionsRaw(storeUrl: string, apiKey: string, apiSecret: string): Promise<SapoCollection[]> {
  const data = await sapoRequest(storeUrl, apiKey, apiSecret, '/admin/collections.json', 'GET')
  return parseCollectionsResponse(data)
}

async function fetchCollectionsWithHeader(storeUrl: string, header: StoreAuthHeader['header']): Promise<SapoCollection[]> {
  const data = await sapoRequestAuthed(storeUrl, header, '/admin/collections.json', 'GET')
  return parseCollectionsResponse(data)
}

/** Gọi GET /admin/collections.json cho 1 store đã kết nối (Private App hoặc OAuth). */
export async function fetchCollections(storeUrl: string): Promise<SapoCollection[]> {
  const { storeUrl: resolvedUrl, header } = getStoreAuthHeader(storeUrl)
  return fetchCollectionsWithHeader(resolvedUrl, header)
}

/**
 * Tìm danh mục theo đúng tên (không phân biệt hoa/thường); nếu chưa có thì
 * tạo mới bằng POST /admin/custom_collections.json. "Tìm trước, tạo sau" thay
 * vì tin vào cờ isNew của frontend — tránh tạo trùng danh mục nếu nhiều sản
 * phẩm trong cùng lô cùng dùng 1 danh mục mới.
 *
 * Lưu ý: vẫn có thể trùng nếu 2 request đăng SP chạy gần như đồng thời (race
 * condition) — chấp nhận được với tool 1 người dùng, không xây hàng đợi khóa
 * riêng cho việc này.
 */
export async function findOrCreateCollection(storeUrl: string, name: string): Promise<SapoCollection> {
  const { storeUrl: resolvedUrl, header } = getStoreAuthHeader(storeUrl)

  const existing = await fetchCollectionsWithHeader(resolvedUrl, header)
  const match = existing.find((c) => c.name.trim().toLowerCase() === name.trim().toLowerCase())
  if (match) return match

  const data = (await sapoRequestAuthed(resolvedUrl, header, '/admin/custom_collections.json', 'POST', {
    custom_collection: { name },
  })) as { custom_collection?: { id: number | string; name: string } }

  if (!data.custom_collection?.id) {
    throw new Error('Sapo không trả về id sau khi tạo danh mục mới.')
  }
  return { id: data.custom_collection.id, name: data.custom_collection.name }
}

/** POST /admin/collects.json — gán 1 sản phẩm vào 1 danh mục THƯỜNG (không áp dụng cho danh mục thông minh/smart collection). */
export async function addProductToCollection(storeUrl: string, productId: number | string, collectionId: number | string): Promise<void> {
  const { storeUrl: resolvedUrl, header } = getStoreAuthHeader(storeUrl)
  try {
    await sapoRequestAuthed(resolvedUrl, header, '/admin/collects.json', 'POST', {
      collect: { product_id: productId, collection_id: collectionId },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    if (message.includes('422')) {
      throw new Error('Không gán được vào danh mục này — có thể đây là "danh mục thông minh" (tự động theo luật), Sapo không cho gán thủ công.')
    }
    throw err
  }
}

/**
 * POST /admin/products.json — tạo sản phẩm thật trên Sapo.
 *
 * Chỉ gửi kèm `images` khi có `imageUrls` — tức ảnh THẬT đã khớp qua Pexels
 * (xem routes/images.ts + frontend sapoApi.ts:fetchProductImageUrls). Không
 * bao giờ gửi ảnh placeholder (Lorem Picsum/gradient) lên vì sẽ khiến sản
 * phẩm thật trên store hiển thị ảnh sai/không liên quan.
 */
export async function createProduct(storeUrl: string, input: SapoProductInput): Promise<{ id: number | string }> {
  const { storeUrl: resolvedUrl, header } = getStoreAuthHeader(storeUrl)

  const data = (await sapoRequestAuthed(resolvedUrl, header, '/admin/products.json', 'POST', {
    product: {
      name: input.name,
      content: input.description,
      summary: input.shortDescription,
      product_type: input.category,
      vendor: input.brand,
      tags: input.tags.join(', '),
      // published_on: null — tài liệu Sapo xác nhận đây là cách tạo sản phẩm ở trạng thái CHƯA xuất bản
      // (ẩn/nháp). Bỏ qua field này hoàn toàn khi publishNow=true để giữ đúng hành vi mặc định trước đây
      // (Sapo tự xuất bản ngay khi không gửi published_on).
      ...(input.publishNow ? {} : { published_on: null }),
      ...(input.imageUrls && input.imageUrls.length > 0
        ? { images: input.imageUrls.map((src) => ({ src })) }
        : {}),
      variants: [
        {
          price: input.price,
          compare_at_price: input.compareAtPrice,
          sku: input.sku,
          barcode: input.barcode,
          inventory_quantity: input.stockQuantity,
          weight: input.weight,
          weight_unit: input.weightUnit,
        },
      ],
    },
  })) as { product?: { id: number | string } }

  if (!data.product?.id) {
    throw new Error('Sapo không trả về id sau khi tạo sản phẩm.')
  }
  return { id: data.product.id }
}

/** Tạo sản phẩm + (tùy chọn) gán vào 1 danh mục theo tên — gộp cả luồng cho route /api/products. */
export async function postProduct(
  storeUrl: string,
  input: SapoProductInput,
  collectionName?: string,
): Promise<PostProductResult> {
  const { id: productId } = await createProduct(storeUrl, input)
  const productUrl = `https://${normalizeStoreUrl(storeUrl)}/admin/products/${productId}`

  if (!collectionName) {
    return { productId, productUrl }
  }

  const collection = await findOrCreateCollection(storeUrl, collectionName)
  await addProductToCollection(storeUrl, productId, collection.id)
  return { productId, productUrl, collection }
}

/**
 * Tìm toàn bộ sản phẩm có gắn tag `demo` (tag hệ thống tự gắn khi sinh bằng tool này — xem
 * mockGenerate.ts) rồi xóa hẳn khỏi Sapo. Trả về số lượng đã xóa.
 *
 * Sapo KHÔNG hỗ trợ tham số lọc theo tag ở GET /admin/products.json (đã tra cứu tài liệu chính thức) —
 * nên phải tự phân trang qua TOÀN BỘ sản phẩm của store (chỉ lấy field id+tags cho nhẹ), tự lọc tag ở phía
 * mình, rồi mới gọi DELETE từng sản phẩm khớp. Chấp nhận chậm hơn 1 API filter có sẵn vì không có lựa chọn
 * khác — tool cho 1 người dùng, store demo thường không có hàng chục nghìn sản phẩm.
 */
export async function deleteProductsByTag(storeUrl: string, tag: string): Promise<{ deleted: number; failed: number }> {
  const { storeUrl: resolvedUrl, header } = getStoreAuthHeader(storeUrl)
  const PAGE_SIZE = 250
  let page = 1
  let deleted = 0
  let failed = 0

  while (true) {
    const data = (await sapoRequestAuthed(
      resolvedUrl,
      header,
      `/admin/products.json?limit=${PAGE_SIZE}&page=${page}&fields=id,tags`,
      'GET',
    )) as { products?: Array<{ id: number | string; tags?: string }> }

    const products = data.products ?? []
    if (products.length === 0) break

    const matched = products.filter((p) =>
      (p.tags ?? '')
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .includes(tag.toLowerCase()),
    )

    for (const p of matched) {
      try {
        await sapoRequestAuthed(resolvedUrl, header, `/admin/products/${p.id}.json`, 'DELETE')
        deleted++
      } catch {
        failed++
      }
    }

    if (products.length < PAGE_SIZE) break
    page++
  }

  return { deleted, failed }
}
