import fs from 'node:fs'
import path from 'node:path'
import { getStoreAuthHeader } from './storeAuth.js'
import { normalizeStoreUrl } from './tokenStore.js'

/**
 * Ghi lại id sản phẩm/bài viết mà tool này đã đăng lên từng store — để nút "Xóa dữ liệu demo" biết cần xóa gì
 * mà KHÔNG phải gắn tag "demo" lên dữ liệu thật. Lưu cùng thư mục DATA_DIR với store-connections.json (đã .gitignore).
 */
interface StoreItems {
  products: Array<number | string>
  articles: Array<{ blogId: number | string; id: number | string }>
}

const DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.resolve(process.cwd(), 'data')
const FILE_PATH = path.join(DATA_DIR, 'created-items.json')

function readAll(): Record<string, StoreItems> {
  try {
    return JSON.parse(fs.readFileSync(FILE_PATH, 'utf8')) as Record<string, StoreItems>
  } catch {
    return {}
  }
}

function writeAll(data: Record<string, StoreItems>) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2))
}

function update(storeUrl: string, fn: (items: StoreItems) => void) {
  const all = readAll()
  const key = normalizeStoreUrl(storeUrl)
  const items = all[key] ?? { products: [], articles: [] }
  fn(items)
  all[key] = items
  writeAll(all)
}

export function recordCreatedProduct(storeUrl: string, id: number | string) {
  update(storeUrl, (items) => items.products.push(id))
}

export function recordCreatedArticle(storeUrl: string, blogId: number | string, id: number | string) {
  update(storeUrl, (items) => items.articles.push({ blogId, id }))
}

/** DELETE 1 tài nguyên; 404 (đã bị xóa tay trên Sapo) cũng coi là xong. */
async function deleteResource(storeUrl: string, resourcePath: string): Promise<boolean> {
  const { storeUrl: resolvedUrl, header } = getStoreAuthHeader(storeUrl)
  const res = await fetch(`https://${normalizeStoreUrl(resolvedUrl)}${resourcePath}`, {
    method: 'DELETE',
    headers: { [header.name]: header.value, Accept: 'application/json' },
  }).catch(() => null)
  return Boolean(res && (res.ok || res.status === 404))
}

/** Xóa hẳn mọi sản phẩm/bài viết tool đã ghi lại cho store này; mục xóa lỗi được giữ lại để lần sau thử tiếp. */
export async function deleteRecordedItems(
  storeUrl: string,
): Promise<{ deletedProducts: number; failedProducts: number; deletedArticles: number; failedArticles: number }> {
  const key = normalizeStoreUrl(storeUrl)
  const items = readAll()[key] ?? { products: [], articles: [] }
  const keepProducts: StoreItems['products'] = []
  const keepArticles: StoreItems['articles'] = []

  for (const id of items.products) {
    if (!(await deleteResource(storeUrl, `/admin/products/${id}.json`))) keepProducts.push(id)
  }
  for (const a of items.articles) {
    if (!(await deleteResource(storeUrl, `/admin/blogs/${a.blogId}/articles/${a.id}.json`))) keepArticles.push(a)
  }

  // Đọc lại trước khi ghi — trong lúc xóa có thể vừa đăng thêm mục mới.
  update(storeUrl, (current) => {
    const doneProducts = new Set(items.products.filter((id) => !keepProducts.includes(id)).map(String))
    const doneArticles = new Set(items.articles.filter((a) => !keepArticles.includes(a)).map((a) => String(a.id)))
    current.products = current.products.filter((id) => !doneProducts.has(String(id)))
    current.articles = current.articles.filter((a) => !doneArticles.has(String(a.id)))
  })

  return {
    deletedProducts: items.products.length - keepProducts.length,
    failedProducts: keepProducts.length,
    deletedArticles: items.articles.length - keepArticles.length,
    failedArticles: keepArticles.length,
  }
}
