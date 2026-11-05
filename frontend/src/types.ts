export type Industry =
  | 'Thời trang - Trang sức'
  | 'Mỹ phẩm - Làm đẹp'
  | 'Thực phẩm - Nhà hàng'
  | 'Đồ gia dụng - Sinh hoạt'
  | 'Hóa phẩm - Vệ sinh nhà cửa'
  | 'Nội thất - Trang trí'
  | 'Thiết kế - Thi công nội thất'
  | 'Studio - Chụp ảnh & Quay phim'
  | 'Sách - Văn phòng phẩm'
  | 'Thủ công - Mỹ nghệ - Quà tặng'
  | 'Công nghệ - Kỹ thuật số'
  | 'Ô tô - Xe máy'
  | 'Thiết bị điện'
  | 'Thể thao - Dịch vụ'
  | 'Khác'

export const INDUSTRIES: Industry[] = [
  'Thời trang - Trang sức',
  'Mỹ phẩm - Làm đẹp',
  'Thực phẩm - Nhà hàng',
  'Đồ gia dụng - Sinh hoạt',
  'Hóa phẩm - Vệ sinh nhà cửa',
  'Nội thất - Trang trí',
  'Thiết kế - Thi công nội thất',
  'Studio - Chụp ảnh & Quay phim',
  'Sách - Văn phòng phẩm',
  'Thủ công - Mỹ nghệ - Quà tặng',
  'Công nghệ - Kỹ thuật số',
  'Ô tô - Xe máy',
  'Thiết bị điện',
  'Thể thao - Dịch vụ',
  'Khác',
]

/**
 * Ngành CHỈ dùng cho tin tức — chưa có bộ sản phẩm mẫu riêng (xem mockGenerate.ts), nên không đưa vào INDUSTRIES
 * để khỏi hiện ở ô chọn ngành của phần sản phẩm.
 */
export type ArticleIndustry = Industry | 'Phụ tùng - Phụ kiện xe tải'

export const ARTICLE_INDUSTRIES: ArticleIndustry[] = [
  ...INDUSTRIES.slice(0, INDUSTRIES.indexOf('Ô tô - Xe máy') + 1),
  'Phụ tùng - Phụ kiện xe tải',
  ...INDUSTRIES.slice(INDUSTRIES.indexOf('Ô tô - Xe máy') + 1),
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
  /** Khoảng giá sản phẩm (VNĐ) người dùng tự kéo chọn — xem ConfigPanel.tsx + mockGenerate.ts:getPriceRangeBounds(). */
  priceMin: number
  priceMax: number
  extraPrompt: string
  imageAspectRatio: ImageAspectRatio
  /** true = đăng công khai ngay (mặc định, giữ nguyên hành vi trước đây); false = đăng ở trạng thái ẩn/nháp trên Sapo. */
  publishNow: boolean
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

/**
 * Chủ đề riêng của ngành Thiết kế - Thi công nội thất — bài "câu chuyện dự án": 1 đoạn kể ngắn + phần còn lại toàn ảnh
 * công trình (xem generateProjectStoryArticle ở mockGenerateArticle.ts). Không đưa vào ARTICLE_TOPICS vì ngành khác không dùng.
 */
export const PROJECT_TOPIC = 'Dự án đã thi công'

/** Danh sách chủ đề hiển thị theo ngành — thêm chủ đề "Dự án đã thi công" cho riêng ngành Thiết kế - Thi công nội thất. */
export function articleTopicsFor(industry: string): string[] {
  return industry === 'Thiết kế - Thi công nội thất' ? [PROJECT_TOPIC, ...ARTICLE_TOPICS] : ARTICLE_TOPICS
}

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
  /** Nối thêm bộ ảnh vào cuối nội dung (blog Album, bài dự án đã thi công) — App.tsx tự tìm ảnh khi tạo nháp/lúc đăng. */
  appendGallery?: boolean
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
