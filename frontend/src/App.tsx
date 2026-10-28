import { useEffect, useState } from 'react'
import { ArticleCard } from './components/ArticleCard'
import { ArticleConfigPanel } from './components/ArticleConfigPanel'
import { ArticleListRow } from './components/ArticleListRow'
import { ArticleTable } from './components/ArticleTable'
import { ConfigPanel } from './components/ConfigPanel'
import { ConnectStoreScreen } from './components/ConnectStoreScreen'
import { EditArticleModal } from './components/EditArticleModal'
import { EditProductModal } from './components/EditProductModal'
import { EmptyState } from './components/EmptyState'
import { formatVnd } from './format'
import { ProductCard } from './components/ProductCard'
import { ProductListRow } from './components/ProductListRow'
import { ProductTable } from './components/ProductTable'
import { ProductToolbar } from './components/ProductToolbar'
import { ResultsHeader } from './components/ResultsHeader'
import { generateMockProduct, getPriceRangeBounds, slugifySku } from './mockGenerate'
import { generateMockArticle } from './mockGenerateArticle'
import {
  BACKEND_URL,
  connectStore,
  deleteDemoData,
  fetchProductImageUrls,
  fetchStoreBlogs,
  fetchStoreCollections,
  fetchStoreOwnerName,
  generateArticlesBatch,
  generateProductsBatch,
  postArticleToSapo,
  postProductToSapo,
  type AiGeneratedArticleContent,
  type AiGeneratedProductContent,
  type SapoBlog,
  type SapoCollection,
} from './sapoApi'
import type { AppMode, Article, ArticleGenerationConfig, ConnectionStatus, GenerationConfig, Product, ViewMode } from './types'

const GENERATION_BATCH_SIZE = 5

const ERROR_REASONS = [
  'Trùng SKU với sản phẩm đã có trên store.',
  'Hết hạn phiên kết nối, vui lòng kết nối lại Sapo.',
  'Lỗi kết nối tới Sapo, vui lòng thử lại.',
]

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function buildProductFromAi(content: AiGeneratedProductContent, index: number, collectionName?: string): Product {
  return {
    id: `draft-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
    name: content.name,
    imageKeyword: content.imageKeyword,
    sku: slugifySku(content.name, index),
    // Giá vốn/mã vạch/tag để trống — không tự bịa, người dùng tự điền nếu cần (xem EditProductModal).
    barcode: '',
    unit: 'Cái',
    shortDescription: content.shortDescription,
    description: content.description,
    price: content.price,
    compareAtPrice: content.compareAtPrice,
    costPrice: 0,
    applyTax: false,
    category: content.category,
    brand: content.brand,
    collection: collectionName ?? '',
    tags: [],
    warehouseLocation: 'Cửa hàng chính',
    manageStock: true,
    allowNegativeStock: false,
    stockQuantity: Math.floor(Math.random() * 100),
    requiresShipping: true,
    weight: content.weight,
    weightUnit: 'g',
    attributes: content.attributes,
    seoTitle: content.seoTitle,
    seoDescription: content.seoDescription,
    status: 'draft',
  }
}

function buildArticleFromAi(content: AiGeneratedArticleContent, index: number, blogName?: string): Article {
  return {
    id: `draft-article-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
    title: content.title,
    author: content.author,
    imageKeyword: content.imageKeyword,
    excerpt: content.excerpt,
    content: content.content,
    tags: content.tags,
    blog: blogName ?? '',
    seoTitle: content.seoTitle,
    seoDescription: content.seoDescription,
    status: 'draft',
  }
}

type Stage = 'connect' | 'generator'

/**
 * Trạng thái kết nối chỉ nằm trong bộ nhớ (React state) — hễ trang bị tải lại
 * (F5 nhầm, Vite hot-reload lúc dev, máy ngủ...) là mất hết, phải kết nối lại
 * từ đầu. Lưu tạm storeUrl vào localStorage để lần load trang sau tự nhận ra
 * store đã kết nối trước đó và vào thẳng màn hình tạo sản phẩm (backend đã
 * lưu sẵn key/secret cho store này rồi, không cần nhập lại).
 */
const STORE_URL_KEY = 'sapo_ai_generator_store_url'

function loadSavedStoreUrl(): string | null {
  try {
    return localStorage.getItem(STORE_URL_KEY)
  } catch {
    return null
  }
}

function saveStoreUrl(storeUrl: string) {
  try {
    localStorage.setItem(STORE_URL_KEY, storeUrl)
  } catch {
    // Bỏ qua nếu trình duyệt chặn localStorage (duyệt ẩn danh...) — chỉ mất tính năng nhớ, không ảnh hưởng chức năng chính.
  }
}

function clearSavedStoreUrl() {
  try {
    localStorage.removeItem(STORE_URL_KEY)
  } catch {
    // Bỏ qua, xem ghi chú ở saveStoreUrl.
  }
}

export default function App() {
  const [config, setConfig] = useState<GenerationConfig>(() => ({
    industry: 'Thời trang - Trang sức',
    storeUrl: loadSavedStoreUrl() ?? '',
    quantity: 10,
    priceMin: getPriceRangeBounds('Thời trang - Trang sức')[0],
    priceMax: getPriceRangeBounds('Thời trang - Trang sức')[1],
    extraPrompt: '',
    imageAspectRatio: '1:1',
    publishNow: true,
  }))

  const [products, setProducts] = useState<Product[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(() =>
    loadSavedStoreUrl() ? 'connected' : 'disconnected',
  )
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [collections, setCollections] = useState<SapoCollection[]>([])
  const [collectionsLoading, setCollectionsLoading] = useState(false)
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([])
  const [connectError, setConnectError] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [aiUnavailable, setAiUnavailable] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  const [mode, setMode] = useState<AppMode>('products')
  const [articleConfig, setArticleConfig] = useState<ArticleGenerationConfig>(() => ({
    topic: 'Khuyến mãi',
    // Mặc định theo đúng ngành hàng đang chọn ở tab Sản phẩm — tránh bài viết lạc chủ đề so với thứ store đang bán.
    industry: 'Thời trang - Trang sức',
    storeUrl: loadSavedStoreUrl() ?? '',
    quantity: 5,
    tone: 'Thân thiện',
    extraPrompt: '',
    publishNow: false,
    imageAspectRatio: '1:1',
  }))
  const [articles, setArticles] = useState<Article[]>([])
  const [isGeneratingArticles, setIsGeneratingArticles] = useState(false)
  const [articleProgress, setArticleProgress] = useState<{ done: number; total: number } | null>(null)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const [articleViewMode, setArticleViewMode] = useState<ViewMode>('grid')
  const [selectedArticleIds, setSelectedArticleIds] = useState<Set<string>>(new Set())
  const [blogs, setBlogs] = useState<SapoBlog[]>([])
  const [blogsLoading, setBlogsLoading] = useState(false)
  const [selectedBlogIds, setSelectedBlogIds] = useState<string[]>([])
  const [aiArticleUnavailable, setAiArticleUnavailable] = useState(false)
  const [aiArticleError, setAiArticleError] = useState<string | null>(null)
  const [storeOwnerName, setStoreOwnerName] = useState<string | null>(null)
  const [isDeletingDemoData, setIsDeletingDemoData] = useState(false)
  const [deleteDemoMessage, setDeleteDemoMessage] = useState<string | null>(null)

  const stage: Stage = connectionStatus !== 'connected' ? 'connect' : 'generator'

  /**
   * Xóa hẳn toàn bộ sản phẩm + bài viết demo (tag `demo`) của store đang kết nối khỏi Sapo — hành động
   * không thể hoàn tác nên bắt xác nhận trước (xem sapoApi.ts:deleteDemoData).
   */
  async function handleDeleteDemoData() {
    if (!window.confirm(`Xóa HẲN toàn bộ sản phẩm và bài viết demo (gắn tag "demo") khỏi ${config.storeUrl}?\n\nKhông thể hoàn tác.`)) {
      return
    }
    setIsDeletingDemoData(true)
    setDeleteDemoMessage(null)
    const result = await deleteDemoData(config.storeUrl)
    setIsDeletingDemoData(false)
    setDeleteDemoMessage(
      result.ok
        ? `Đã xóa ${result.deletedProducts ?? 0} sản phẩm và ${result.deletedArticles ?? 0} bài viết demo.`
        : `Lỗi: ${result.error}`,
    )
  }

  async function loadCollectionsFor(storeUrl: string) {
    setCollectionsLoading(true)
    const result = await fetchStoreCollections(storeUrl)
    setCollections(result)
    setCollectionsLoading(false)
  }

  async function loadBlogsFor(storeUrl: string) {
    setBlogsLoading(true)
    const result = await fetchStoreBlogs(storeUrl)
    setBlogs(result)
    setBlogsLoading(false)
  }

  /** Đánh dấu 1 store là đã kết nối (Private App hoặc OAuth đều gọi hàm này) — set config, lưu localStorage, tải danh mục/blog/tên chủ store. */
  function applyConnectedStore(storeUrl: string) {
    setConfig((c) => ({ ...c, storeUrl }))
    setArticleConfig((c) => ({ ...c, storeUrl }))
    setConnectionStatus('connected')
    saveStoreUrl(storeUrl)
    void loadCollectionsFor(storeUrl)
    void loadBlogsFor(storeUrl)
    void fetchStoreOwnerName(storeUrl).then(setStoreOwnerName)
  }

  // Trang vừa load lại mà đã có store lưu sẵn (xem STORE_URL_KEY) → tải luôn danh mục + blog, khỏi bắt kết nối lại.
  // Hoặc vừa được Sapo redirect về sau khi duyệt quyền OAuth (?oauthConnected=1&store=...) — trường hợp popup
  // bị trình duyệt chặn nên luồng OAuth chạy thẳng trên tab hiện tại thay vì popup riêng.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const oauthStore = params.get('oauthConnected') === '1' ? params.get('store') : null

    if (oauthStore) {
      applyConnectedStore(oauthStore)
      // Xóa query khỏi URL để reload trang sau không bị hiểu nhầm là kết nối lại.
      window.history.replaceState({}, '', window.location.pathname)
    } else if (config.storeUrl && connectionStatus === 'connected') {
      void loadCollectionsFor(config.storeUrl)
      void loadBlogsFor(config.storeUrl)
      void fetchStoreOwnerName(config.storeUrl).then(setStoreOwnerName)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Popup OAuth (mở từ ConnectStoreScreen) báo kết quả về tab chính qua postMessage rồi tự đóng —
  // tab web tool không bị điều hướng đi đâu cả trong suốt bước duyệt quyền trên Sapo.
  useEffect(() => {
    function onOAuthMessage(event: MessageEvent) {
      if (event.origin !== new URL(BACKEND_URL).origin) return
      const data = event.data as { source?: string; ok?: boolean; store?: string; error?: string } | null
      if (!data || data.source !== 'sapo-oauth') return

      setIsConnecting(false)
      if (data.ok && data.store) {
        setConnectError(null)
        applyConnectedStore(data.store)
      } else {
        setConnectError(data.error ?? 'Kết nối OAuth thất bại, vui lòng thử lại.')
      }
    }

    window.addEventListener('message', onOAuthMessage)
    return () => window.removeEventListener('message', onOAuthMessage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleConnect(storeUrl: string, apiKey: string, apiSecret: string) {
    setConnectError(null)
    setIsConnecting(true)
    const result = await connectStore(storeUrl, apiKey, apiSecret)
    setIsConnecting(false)

    if (!result.ok) {
      setConnectError(result.error ?? 'Kết nối thất bại, vui lòng thử lại.')
      return
    }

    applyConnectedStore(storeUrl)
  }

  function resetToConnect() {
    setConnectionStatus('disconnected')
    setCollections([])
    setSelectedCollectionIds([])
    setBlogs([])
    setSelectedBlogIds([])
    setStoreOwnerName(null)
    setConnectError(null)
    clearSavedStoreUrl()
  }

  function addCollection(name: string) {
    const id = `new-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    let added = false
    setCollections((prev) => {
      if (prev.some((c) => c.name.toLowerCase() === name.toLowerCase())) return prev
      added = true
      return [...prev, { id, name, isNew: true }]
    })
    if (added) setSelectedCollectionIds((prev) => [...prev, id])
  }

  function toggleCollection(id: string) {
    setSelectedCollectionIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]))
  }

  function addBlog(name: string) {
    const id = `new-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    let added = false
    setBlogs((prev) => {
      if (prev.some((b) => b.name.toLowerCase() === name.toLowerCase())) return prev
      added = true
      return [...prev, { id, name, isNew: true }]
    })
    if (added) setSelectedBlogIds((prev) => [...prev, id])
  }

  function toggleBlog(id: string) {
    setSelectedBlogIds((prev) => (prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]))
  }

  async function handleGenerate() {
    const quantity = config.quantity
    const startCount = products.length
    const target = startCount + quantity
    const chosenCollections = collections.filter((c) => selectedCollectionIds.includes(c.id))

    function collectionForIndex(globalIndex: number): string | undefined {
      return chosenCollections.length > 0 ? chosenCollections[globalIndex % chosenCollections.length].name : undefined
    }

    // Dữ liệu mẫu: đếm số thứ tự RIÊNG trong từng danh mục (tiếp nối số sản phẩm của danh mục đó đã có trong
    // danh sách) + bắt đầu từ 1 điểm ngẫu nhiên, để các lần tạo khác nhau (VD sau khi tải lại trang) không lặp
    // lại đúng bộ tên đã đăng lên store lần trước. `usedNames` chặn trùng tên với mọi sản phẩm đã có.
    const usedNames = new Set(products.map((p) => p.name.toLowerCase()))
    const variantCounters = new Map<string, { next: number; offset: number }>()
    function nextVariant(collectionName: string | undefined): { variantIndex: number; variantOffset: number } {
      const key = collectionName ?? ''
      const counter = variantCounters.get(key) ?? {
        next: products.filter((p) => p.collection === key).length,
        offset: Math.floor(Math.random() * 1000),
      }
      variantCounters.set(key, { ...counter, next: counter.next + 1 })
      return { variantIndex: counter.next, variantOffset: counter.offset }
    }

    setIsGenerating(true)
    setAiError(null)
    setProgress({ done: startCount, total: target })

    let done = 0
    while (done < quantity) {
      const batchSize = Math.min(GENERATION_BATCH_SIZE, quantity - done)
      const batchStartIndex = startCount + done

      const result = await generateProductsBatch({
        industry: config.industry,
        priceSegment: `${formatVnd(config.priceMin)} - ${formatVnd(config.priceMax)}`,
        extraPrompt: config.extraPrompt,
        count: batchSize,
        collectionName: collectionForIndex(batchStartIndex),
      })

      if (result.ok && result.products) {
        setAiUnavailable(false)
        const newProducts = result.products.map((content, i) =>
          buildProductFromAi(content, batchStartIndex + i, collectionForIndex(batchStartIndex + i)),
        )
        setProducts((prev) => [...prev, ...newProducts])
      } else {
        // AI thật không dùng được (chưa cấu hình ANTHROPIC_API_KEY, backend chưa chạy, lỗi mạng...) → rơi về dữ liệu mẫu cục bộ.
        setAiUnavailable(true)
        setAiError(result.error ?? null)
        for (let i = 0; i < batchSize; i++) {
          await delay(200 + Math.random() * 200)
          const globalIndex = batchStartIndex + i
          const collectionName = collectionForIndex(globalIndex)
          const product = generateMockProduct(
            config.industry,
            config.priceMin,
            config.priceMax,
            config.extraPrompt,
            globalIndex,
            collectionName,
            { ...nextVariant(collectionName), usedNames },
          )
          setProducts((prev) => [...prev, product])
        }
      }

      done += batchSize
      setProgress({ done: startCount + done, total: target })
    }

    setIsGenerating(false)
    setProgress(null)
  }

  async function postProduct(id: string) {
    const product = products.find((p) => p.id === id)
    if (!product) return

    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'posting', errorReason: undefined } : p)))

    // Chỉ gửi ảnh thật đã khớp qua Pexels (mảng rỗng nếu chưa cấu hình
    // PEXELS_API_KEY hoặc không tìm thấy) — không bao giờ gửi ảnh Picsum ngẫu
    // nhiên lên store thật. Lấy tối đa 4 ảnh/sản phẩm thay vì chỉ 1.
    // Dùng product.sku làm variationKey để ảnh ĐẦU TIÊN gửi lên TRÙNG với ảnh
    // đang hiển thị trên card (ProductCard/ProductListRow/ProductTable đều
    // dùng product.sku làm `seed`).
    const imageUrls = await fetchProductImageUrls(product.imageKeyword, product.sku, 4, config.imageAspectRatio)

    const result = await postProductToSapo(
      config.storeUrl,
      {
        name: product.name,
        description: product.description,
        shortDescription: product.shortDescription,
        category: product.category,
        brand: product.brand,
        tags: product.tags,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        sku: product.sku,
        barcode: product.barcode,
        stockQuantity: product.stockQuantity,
        weight: product.weight,
        weightUnit: product.weightUnit,
        imageUrls,
        publishNow: config.publishNow,
      },
      product.collection || undefined,
    )

    if (result.backendUnavailable) {
      // Backend không chạy được — mô phỏng để vẫn xem được giao diện, không phải kết quả thật.
      await delay(700 + Math.random() * 800)
      const success = Math.random() < 0.85
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p
          if (success) {
            return { ...p, status: 'posted', sapoProductUrl: `${config.storeUrl}/admin/products/${p.sku.toLowerCase()}` }
          }
          return { ...p, status: 'error', errorReason: ERROR_REASONS[Math.floor(Math.random() * ERROR_REASONS.length)] }
        }),
      )
      return
    }

    if (result.ok) {
      if (result.collection) {
        // Danh mục mới vừa được tạo thật trên Sapo — cập nhật lại id thật, bỏ nhãn "mới" để lần đăng sau khỏi tạo trùng.
        setCollections((prev) =>
          prev.map((c) => (c.name === result.collection!.name ? { id: result.collection!.id, name: c.name, isNew: false } : c)),
        )
      }
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: 'posted', sapoProductUrl: result.productUrl ?? p.sapoProductUrl } : p)),
      )
    } else {
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'error', errorReason: result.error } : p)))
    }
  }

  function handlePostOne(id: string) {
    void postProduct(id)
  }

  async function postMany(ids: string[]) {
    for (const id of ids) {
      void postProduct(id)
      await delay(180)
    }
  }

  async function handlePostAll() {
    await postMany(products.filter((p) => p.status === 'draft' || p.status === 'error').map((p) => p.id))
  }

  async function handlePostSelected() {
    await postMany(products.filter((p) => selectedIds.has(p.id) && (p.status === 'draft' || p.status === 'error')).map((p) => p.id))
  }

  async function handleGenerateArticles() {
    const quantity = articleConfig.quantity
    const startCount = articles.length
    const target = startCount + quantity
    const chosenBlogs = blogs.filter((b) => selectedBlogIds.includes(b.id))

    function blogForIndex(globalIndex: number): string | undefined {
      return chosenBlogs.length > 0 ? chosenBlogs[globalIndex % chosenBlogs.length].name : undefined
    }

    setIsGeneratingArticles(true)
    setAiArticleError(null)
    setArticleProgress({ done: startCount, total: target })

    let done = 0
    while (done < quantity) {
      const batchSize = Math.min(GENERATION_BATCH_SIZE, quantity - done)
      const batchStartIndex = startCount + done

      const result = await generateArticlesBatch({
        topic: articleConfig.topic,
        industry: articleConfig.industry,
        tone: articleConfig.tone,
        extraPrompt: articleConfig.extraPrompt,
        count: batchSize,
      })

      if (result.ok && result.articles) {
        setAiArticleUnavailable(false)
        const newArticles = result.articles.map((content, i) => {
          const article = buildArticleFromAi(content, batchStartIndex + i, blogForIndex(batchStartIndex + i))
          // Dùng tên chủ store thật (Sapo: store_owner) làm tác giả thay vì tên AI tự bịa.
          return storeOwnerName ? { ...article, author: storeOwnerName } : article
        })
        setArticles((prev) => [...prev, ...newArticles])
      } else {
        // AI thật không dùng được → rơi về dữ liệu mẫu cục bộ (cùng nguyên tắc với handleGenerate() ở sản phẩm).
        setAiArticleUnavailable(true)
        setAiArticleError(result.error ?? null)
        for (let i = 0; i < batchSize; i++) {
          await delay(200 + Math.random() * 200)
          const globalIndex = batchStartIndex + i
          const article = generateMockArticle(
            articleConfig.topic,
            articleConfig.tone,
            articleConfig.extraPrompt,
            globalIndex,
            articleConfig.industry,
            blogForIndex(globalIndex),
          )
          setArticles((prev) => [...prev, storeOwnerName ? { ...article, author: storeOwnerName } : article])
        }
      }

      done += batchSize
      setArticleProgress({ done: startCount + done, total: target })
    }

    setIsGeneratingArticles(false)
    setArticleProgress(null)
  }

  async function postArticle(id: string) {
    const article = articles.find((a) => a.id === id)
    if (!article) return

    setArticles((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'posting', errorReason: undefined } : a)))

    // Bài viết Sapo chỉ nhận 1 ảnh đại diện (khác sản phẩm nhận nhiều ảnh) — chỉ lấy 1 ảnh thật.
    const imageUrls = await fetchProductImageUrls(article.imageKeyword, article.id, 1, articleConfig.imageAspectRatio)

    const result = await postArticleToSapo(
      config.storeUrl,
      {
        title: article.title,
        author: article.author,
        content: article.content,
        excerpt: article.excerpt,
        tags: article.tags,
        imageUrls,
        publishNow: articleConfig.publishNow,
      },
      // Chưa chọn blog nào → mặc định "Tin tức", vì mọi store Sapo đều có sẵn blog này.
      article.blog || 'Tin tức',
    )

    if (result.backendUnavailable) {
      await delay(700 + Math.random() * 800)
      const success = Math.random() < 0.85
      setArticles((prev) =>
        prev.map((a) => {
          if (a.id !== id) return a
          if (success) {
            return { ...a, status: 'posted', sapoArticleUrl: `${config.storeUrl}/admin/articles/${a.id}` }
          }
          return { ...a, status: 'error', errorReason: ERROR_REASONS[Math.floor(Math.random() * ERROR_REASONS.length)] }
        }),
      )
      return
    }

    if (result.ok) {
      if (result.blog) {
        setBlogs((prev) => prev.map((b) => (b.name === result.blog!.name ? { id: result.blog!.id, name: b.name, isNew: false } : b)))
      }
      setArticles((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'posted', sapoArticleUrl: result.articleUrl ?? a.sapoArticleUrl } : a)),
      )
    } else {
      setArticles((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'error', errorReason: result.error } : a)))
    }
  }

  function handlePostOneArticle(id: string) {
    void postArticle(id)
  }

  async function postManyArticles(ids: string[]) {
    for (const id of ids) {
      void postArticle(id)
      await delay(180)
    }
  }

  async function handlePostAllArticles() {
    await postManyArticles(articles.filter((a) => a.status === 'draft' || a.status === 'error').map((a) => a.id))
  }

  async function handlePostSelectedArticles() {
    await postManyArticles(
      articles.filter((a) => selectedArticleIds.has(a.id) && (a.status === 'draft' || a.status === 'error')).map((a) => a.id),
    )
  }

  function handleDeleteOneArticle(id: string) {
    setArticles((prev) => prev.filter((a) => a.id !== id))
    setSelectedArticleIds((prev) => {
      if (!prev.has(id)) return prev
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  function toggleSelectArticle(id: string) {
    setSelectedArticleIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAllArticles() {
    setSelectedArticleIds((prev) => (prev.size === articles.length ? new Set() : new Set(articles.map((a) => a.id))))
  }

  function deleteSelectedArticles() {
    setArticles((prev) => prev.filter((a) => !selectedArticleIds.has(a.id)))
    setSelectedArticleIds(new Set())
  }

  function handleDeleteOne(id: string) {
    setProducts((prev) => prev.filter((p) => p.id !== id))
    setSelectedIds((prev) => {
      if (!prev.has(id)) return prev
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    setSelectedIds((prev) => (prev.size === products.length ? new Set() : new Set(products.map((p) => p.id))))
  }

  function deleteSelected() {
    setProducts((prev) => prev.filter((p) => !selectedIds.has(p.id)))
    setSelectedIds(new Set())
  }

  const createdCount = products.length
  const targetTotal = progress?.total ?? createdCount
  const hasPostable = products.some((p) => p.status === 'draft' || p.status === 'error')
  const hasSelectedPostable = products.some((p) => selectedIds.has(p.id) && (p.status === 'draft' || p.status === 'error'))
  const allSelected = products.length > 0 && selectedIds.size === products.length

  const createdArticleCount = articles.length
  const targetArticleTotal = articleProgress?.total ?? createdArticleCount
  const hasPostableArticles = articles.some((a) => a.status === 'draft' || a.status === 'error')
  const hasSelectedPostableArticles = articles.some((a) => selectedArticleIds.has(a.id) && (a.status === 'draft' || a.status === 'error'))
  const allArticlesSelected = articles.length > 0 && selectedArticleIds.size === articles.length

  return (
    <div className="flex min-h-screen flex-col bg-[#E9ECF1] dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex h-[60px] max-w-[1440px] items-center gap-3 px-4 sm:px-6">
          <span className="shrink-0 text-[15px] font-semibold text-slate-900 dark:text-slate-100">AI Product Generator cho Sapo</span>

          {stage === 'generator' && (
            <span className="hidden items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1 text-xs sm:inline-flex dark:bg-slate-800">
              {storeOwnerName && <span className="font-semibold text-slate-700 dark:text-slate-200">{storeOwnerName}</span>}
              <span className="font-mono text-[11px] text-slate-400">{config.storeUrl}</span>
            </span>
          )}

          {stage === 'generator' && (
            <div className="ml-auto hidden shrink-0 items-center gap-3 text-xs sm:flex">
              {deleteDemoMessage && (
                <span className="max-w-[220px] truncate text-slate-400" title={deleteDemoMessage}>
                  {deleteDemoMessage}
                </span>
              )}
              <button onClick={resetToConnect} className="text-slate-400 hover:text-blue-600 hover:underline dark:hover:text-blue-400">
                Đổi store
              </button>
              <button
                onClick={() => void handleDeleteDemoData()}
                disabled={isDeletingDemoData}
                className="h-[38px] rounded-lg border border-slate-300 px-3.5 font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                title='Xóa toàn bộ sản phẩm + bài viết đã đăng từ tool này (gắn tag "demo") khỏi Sapo'
              >
                {isDeletingDemoData ? 'Đang xóa...' : 'Xóa dữ liệu demo cũ'}
              </button>
            </div>
          )}
        </div>
      </header>

      {stage === 'generator' && (
        <div className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex max-w-[1440px] items-center gap-5 px-4 sm:px-6">
            <button
              onClick={() => setMode('products')}
              className={`flex items-center gap-1.5 py-3 text-sm transition ${
                mode === 'products'
                  ? 'font-semibold text-slate-900 shadow-[inset_0_-2px_0_#007AFF] dark:text-slate-100'
                  : 'font-normal text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Sản phẩm <span className="font-normal text-slate-400">{products.length}</span>
            </button>
            <button
              onClick={() => setMode('articles')}
              className={`flex items-center gap-1.5 py-3 text-sm transition ${
                mode === 'articles'
                  ? 'font-semibold text-slate-900 shadow-[inset_0_-2px_0_#007AFF] dark:text-slate-100'
                  : 'font-normal text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Tin tức <span className="font-normal text-slate-400">{articles.length}</span>
            </button>
            <span className="ml-auto rounded bg-[#FFF4E0] px-2 py-0.5 font-mono text-xs font-semibold text-[#A15C00] dark:bg-amber-500/10 dark:text-amber-400">
              tag: demo
            </span>
          </div>
        </div>
      )}

      {stage === 'connect' && (
        <ConnectStoreScreen onConnect={(url, key, secret) => void handleConnect(url, key, secret)} isConnecting={isConnecting} connectError={connectError} />
      )}

      {stage === 'generator' && mode === 'products' && (
        <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-4 py-6 sm:px-6">
          {aiUnavailable && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-500/10 dark:text-amber-400">
              <span>⚠️</span>
              <div>
                <p className="font-medium">Đang dùng dữ liệu mẫu, chưa phải AI thật.</p>
                <p className="mt-0.5 text-xs opacity-90">
                  Kiểm tra <code>ANTHROPIC_API_KEY</code> trong <code>backend/.env</code> và backend đã chạy chưa.
                  {aiError && <> Chi tiết: {aiError}</>}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[420px_minmax(0,1fr)]">
            <ConfigPanel
              config={config}
              onChange={setConfig}
              onSubmit={handleGenerate}
              isGenerating={isGenerating}
              progress={progress}
              collections={collections}
              collectionsLoading={collectionsLoading}
              selectedCollectionIds={selectedCollectionIds}
              onToggleCollection={toggleCollection}
              onAddCollection={addCollection}
            />

            <section className="flex min-w-0 flex-col gap-4">
              {products.length > 0 && (
                <ProductToolbar
                  totalCount={products.length}
                  selectedCount={selectedIds.size}
                  allSelected={allSelected}
                  onToggleSelectAll={toggleSelectAll}
                  onPostSelected={() => void handlePostSelected()}
                  postSelectedDisabled={!hasSelectedPostable || isGenerating}
                  onDeleteSelected={deleteSelected}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                />
              )}

              {products.length === 0 && !isGenerating ? (
                <EmptyState />
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {products.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={index}
                      aspectRatio={config.imageAspectRatio}
                      selected={selectedIds.has(product.id)}
                      onToggleSelect={() => toggleSelect(product.id)}
                      onEdit={() => setEditingProduct(product)}
                      onPost={() => handlePostOne(product.id)}
                      onDelete={() => handleDeleteOne(product.id)}
                    />
                  ))}
                </div>
              ) : viewMode === 'list' ? (
                <div className="flex flex-col gap-3">
                  {products.map((product) => (
                    <ProductListRow
                      key={product.id}
                      product={product}
                      aspectRatio={config.imageAspectRatio}
                      selected={selectedIds.has(product.id)}
                      onToggleSelect={() => toggleSelect(product.id)}
                      onEdit={() => setEditingProduct(product)}
                      onPost={() => handlePostOne(product.id)}
                      onDelete={() => handleDeleteOne(product.id)}
                    />
                  ))}
                </div>
              ) : (
                <ProductTable
                  products={products}
                  aspectRatio={config.imageAspectRatio}
                  selectedIds={selectedIds}
                  allSelected={allSelected}
                  onToggleSelect={toggleSelect}
                  onToggleSelectAll={toggleSelectAll}
                  onEdit={(product) => setEditingProduct(product)}
                  onPost={handlePostOne}
                  onDelete={handleDeleteOne}
                />
              )}

              {products.length > 0 && (
                <ResultsHeader
                  total={targetTotal}
                  createdCount={createdCount}
                  storeUrl={config.storeUrl}
                  onPostAll={() => void handlePostAll()}
                  postAllDisabled={!hasPostable || isGenerating}
                />
              )}
            </section>
          </div>
        </main>
      )}

      {stage === 'generator' && mode === 'articles' && (
        <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-4 py-6 sm:px-6">
          {aiArticleUnavailable && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-500/10 dark:text-amber-400">
              <span>⚠️</span>
              <div>
                <p className="font-medium">Đang dùng dữ liệu mẫu, chưa phải AI thật.</p>
                <p className="mt-0.5 text-xs opacity-90">
                  Kiểm tra <code>ANTHROPIC_API_KEY</code> trong <code>backend/.env</code> và backend đã chạy chưa.
                  {aiArticleError && <> Chi tiết: {aiArticleError}</>}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[420px_minmax(0,1fr)]">
            <ArticleConfigPanel
              config={articleConfig}
              onChange={setArticleConfig}
              onSubmit={handleGenerateArticles}
              isGenerating={isGeneratingArticles}
              progress={articleProgress}
              blogs={blogs}
              blogsLoading={blogsLoading}
              selectedBlogIds={selectedBlogIds}
              onToggleBlog={toggleBlog}
              onAddBlog={addBlog}
            />

            <section className="flex min-w-0 flex-col gap-4">
              {articles.length > 0 && (
                <ProductToolbar
                  totalCount={articles.length}
                  selectedCount={selectedArticleIds.size}
                  allSelected={allArticlesSelected}
                  onToggleSelectAll={toggleSelectAllArticles}
                  onPostSelected={() => void handlePostSelectedArticles()}
                  postSelectedDisabled={!hasSelectedPostableArticles || isGeneratingArticles}
                  onDeleteSelected={deleteSelectedArticles}
                  viewMode={articleViewMode}
                  onViewModeChange={setArticleViewMode}
                />
              )}

              {articles.length === 0 && !isGeneratingArticles ? (
                <EmptyState
                  icon="📰"
                  title='Điền thông tin bên trên và bấm "Tạo bài viết" để bắt đầu'
                  subtitle="AI sẽ sinh tiêu đề, nội dung, tag và ảnh minh họa cho từng bài viết — chỉ trong vài giây."
                />
              ) : articleViewMode === 'grid' ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {articles.map((article, index) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      index={index}
                      aspectRatio={articleConfig.imageAspectRatio}
                      selected={selectedArticleIds.has(article.id)}
                      onToggleSelect={() => toggleSelectArticle(article.id)}
                      onEdit={() => setEditingArticle(article)}
                      onPost={() => handlePostOneArticle(article.id)}
                      onDelete={() => handleDeleteOneArticle(article.id)}
                    />
                  ))}
                </div>
              ) : articleViewMode === 'list' ? (
                <div className="flex flex-col gap-3">
                  {articles.map((article) => (
                    <ArticleListRow
                      key={article.id}
                      article={article}
                      aspectRatio={articleConfig.imageAspectRatio}
                      selected={selectedArticleIds.has(article.id)}
                      onToggleSelect={() => toggleSelectArticle(article.id)}
                      onEdit={() => setEditingArticle(article)}
                      onPost={() => handlePostOneArticle(article.id)}
                      onDelete={() => handleDeleteOneArticle(article.id)}
                    />
                  ))}
                </div>
              ) : (
                <ArticleTable
                  articles={articles}
                  aspectRatio={articleConfig.imageAspectRatio}
                  selectedIds={selectedArticleIds}
                  allSelected={allArticlesSelected}
                  onToggleSelect={toggleSelectArticle}
                  onToggleSelectAll={toggleSelectAllArticles}
                  onEdit={(article) => setEditingArticle(article)}
                  onPost={handlePostOneArticle}
                  onDelete={handleDeleteOneArticle}
                />
              )}

              {articles.length > 0 && (
                <ResultsHeader
                  total={targetArticleTotal}
                  createdCount={createdArticleCount}
                  storeUrl={config.storeUrl}
                  onPostAll={() => void handlePostAllArticles()}
                  postAllDisabled={!hasPostableArticles || isGeneratingArticles}
                />
              )}
            </section>
          </div>
        </main>
      )}

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          collections={collections}
          imageAspectRatio={config.imageAspectRatio}
          onClose={() => setEditingProduct(null)}
          onSave={(updated) => {
            setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
            setEditingProduct(null)
          }}
        />
      )}

      {editingArticle && (
        <EditArticleModal
          article={editingArticle}
          blogs={blogs}
          imageAspectRatio={articleConfig.imageAspectRatio}
          onClose={() => setEditingArticle(null)}
          onSave={(updated) => {
            setArticles((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))
            setEditingArticle(null)
          }}
        />
      )}
    </div>
  )
}
