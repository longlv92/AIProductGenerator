export type Industry =
  | 'Thời trang'
  | 'Giày dép'
  | 'Mỹ phẩm'
  | 'Đồ gia dụng'
  | 'Điện tử'
  | 'Thực phẩm'
  | 'Mẹ & Bé'
  | 'Phụ kiện'
  | 'Nội thất'

export const INDUSTRIES: Industry[] = [
  'Thời trang',
  'Giày dép',
  'Mỹ phẩm',
  'Đồ gia dụng',
  'Điện tử',
  'Thực phẩm',
  'Mẹ & Bé',
  'Phụ kiện',
  'Nội thất',
]

export type PriceSegment = 'Bình dân' | 'Trung cấp' | 'Cao cấp'

export const PRICE_SEGMENTS: PriceSegment[] = ['Bình dân', 'Trung cấp', 'Cao cấp']

export type ProductStatus = 'draft' | 'posting' | 'posted' | 'error'

export type WeightUnit = 'g' | 'kg'

export interface ProductAttribute {
  name: string
  value: string
}

export interface Product {
  id: string
  // Thông tin sản phẩm
  name: string
  /** Từ khóa tiếng Anh mô tả loại sản phẩm — dùng để tìm ảnh thật khớp nội dung (Pexels). */
  imageKeyword: string
  sku: string
  barcode: string
  unit: string
  shortDescription: string
  description: string
  // Thông tin giá
  price: number
  compareAtPrice: number
  costPrice: number
  applyTax: boolean
  // Phân loại
  category: string
  brand: string
  collection: string
  tags: string[]
  // Thông tin kho
  warehouseLocation: string
  manageStock: boolean
  allowNegativeStock: boolean
  stockQuantity: number
  // Vận chuyển
  requiresShipping: boolean
  weight: number
  weightUnit: WeightUnit
  // Thuộc tính
  attributes: ProductAttribute[]
  // Tối ưu SEO
  seoTitle: string
  seoDescription: string
  // Trạng thái đăng
  status: ProductStatus
  errorReason?: string
  sapoProductUrl?: string
}

export type ConnectionStatus = 'disconnected' | 'connected'

export type ImageAspectRatio = '1:1' | '4:3' | '3:4' | '16:9'

export const IMAGE_ASPECT_RATIOS: { value: ImageAspectRatio; label: string }[] = [
  { value: '1:1', label: 'Vuông (1:1)' },
  { value: '4:3', label: 'Ngang (4:3)' },
  { value: '3:4', label: 'Dọc (3:4)' },
  { value: '16:9', label: 'Rộng (16:9)' },
]

export type ViewMode = 'grid' | 'list' | 'table'

export interface GenerationConfig {
  industry: Industry | string
  storeUrl: string
  quantity: number
  priceSegment: PriceSegment
  extraPrompt: string
  imageAspectRatio: ImageAspectRatio
}

export type AppMode = 'products' | 'articles'

export type ArticleTopic = 'Khuyến mãi' | 'Hướng dẫn sử dụng' | 'Tin tức ngành hàng' | 'Đánh giá sản phẩm' | 'Mẹo hay & Kinh nghiệm' | 'Sự kiện cửa hàng'

export const ARTICLE_TOPICS: ArticleTopic[] = [
  'Khuyến mãi',
  'Hướng dẫn sử dụng',
  'Tin tức ngành hàng',
  'Đánh giá sản phẩm',
  'Mẹo hay & Kinh nghiệm',
  'Sự kiện cửa hàng',
]

export type ArticleTone = 'Chuyên nghiệp' | 'Thân thiện' | 'Hài hước'

export const ARTICLE_TONES: ArticleTone[] = ['Chuyên nghiệp', 'Thân thiện', 'Hài hước']

export type ArticleStatus = 'draft' | 'posting' | 'posted' | 'error'

export interface Article {
  id: string
  title: string
  author: string
  /** Từ khóa tiếng Anh mô tả chủ đề bài viết — dùng để tìm ảnh thật khớp nội dung (Pexels). */
  imageKeyword: string
  excerpt: string
  content: string
  tags: string[]
  blog: string
  seoTitle: string
  seoDescription: string
  status: ArticleStatus
  errorReason?: string
  sapoArticleUrl?: string
}

export interface ArticleGenerationConfig {
  topic: ArticleTopic | string
  /** Ngành hàng thực tế của store — để nội dung bài viết bám sát sản phẩm store đang bán, không chung chung. */
  industry: Industry | string
  storeUrl: string
  quantity: number
  tone: ArticleTone
  extraPrompt: string
  publishNow: boolean
  imageAspectRatio: ImageAspectRatio
}
