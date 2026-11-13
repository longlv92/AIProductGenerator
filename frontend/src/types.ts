export type Industry =
  | 'Thời trang - Trang sức'
  | 'Mỹ phẩm - Làm đẹp'
  | 'Thực phẩm - Nhà hàng'
  | 'Đồ gia dụng - Sinh hoạt'
  | 'Thiết bị nhà bếp'
  | 'Thiết bị vệ sinh - Nhà tắm'
  | 'Hóa phẩm - Vệ sinh nhà cửa'
  | 'Nội thất - Trang trí'
  | 'Thiết kế - Thi công nội thất'
  | 'Studio - Chụp ảnh & Quay phim'
  | 'Sách - Văn phòng phẩm'
  | 'Thủ công - Mỹ nghệ - Quà tặng'
  | 'Công nghệ - Kỹ thuật số'
  | 'Ô tô - Xe máy'
  | 'Thiết bị điện'
  | 'Âm thanh - Loa, Micro, Tai nghe'
  | 'Vận tải - Gửi hàng, Chành xe'
  | 'Thể thao - Dịch vụ'
  | 'Khác'

export const INDUSTRIES: Industry[] = [
  'Thời trang - Trang sức',
  'Mỹ phẩm - Làm đẹp',
  'Thực phẩm - Nhà hàng',
  'Đồ gia dụng - Sinh hoạt',
  'Thiết bị nhà bếp',
  'Thiết bị vệ sinh - Nhà tắm',
  'Hóa phẩm - Vệ sinh nhà cửa',
  'Nội thất - Trang trí',
  'Thiết kế - Thi công nội thất',
  'Studio - Chụp ảnh & Quay phim',
  'Sách - Văn phòng phẩm',
  'Thủ công - Mỹ nghệ - Quà tặng',
  'Công nghệ - Kỹ thuật số',
  'Ô tô - Xe máy',
  'Thiết bị điện',
  'Âm thanh - Loa, Micro, Tai nghe',
  'Vận tải - Gửi hàng, Chành xe',
  'Thể thao - Dịch vụ',
  'Khác',
]

/**
 * Ngành CHỈ dùng cho tin tức — chưa có bộ sản phẩm mẫu riêng (xem mockGenerate.ts), nên không đưa vào INDUSTRIES
 * để khỏi hiện ở ô chọn ngành của phần sản phẩm.
 */
export type ArticleIndustry = Industry | 'Phụ tùng - Phụ kiện xe tải' | 'Thực phẩm bổ sung - Sức khỏe trẻ em'

export const ARTICLE_INDUSTRIES: ArticleIndustry[] = [
  ...INDUSTRIES.slice(0, INDUSTRIES.indexOf('Ô tô - Xe máy') + 1),
  'Phụ tùng - Phụ kiện xe tải',
  ...INDUSTRIES.slice(INDUSTRIES.indexOf('Ô tô - Xe máy') + 1, INDUSTRIES.indexOf('Khác')),
  'Thực phẩm bổ sung - Sức khỏe trẻ em',
  'Khác',
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

export type AppMode = 'products' | 'articles' | 'jobs'

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
/** Chủ đề đặc biệt: mỗi bài lấy chủ đề theo tên blog nó được đăng vào (xem topicForBlog) — chọn nhiều blog cùng lúc vẫn đúng nội dung từng blog. */
export const AUTO_TOPIC = 'Tự động theo tên blog'

export function articleTopicsFor(industry: string): string[] {
  const topics = industry === 'Thiết kế - Thi công nội thất' ? [PROJECT_TOPIC, ...ARTICLE_TOPICS] : ARTICLE_TOPICS
  return [...topics, AUTO_TOPIC]
}

/**
 * Đoán chủ đề bài viết từ tên blog — VD "Hướng dẫn sử dụng sản phẩm" → Hướng dẫn sử dụng, "Tư vấn chọn mua..." → Mẹo hay &
 * Kinh nghiệm, "Tin tức âm thanh" → Tin tức ngành hàng. Không đoán được → Tin tức ngành hàng.
 */
export function topicForBlog(blogName: string | undefined, industry: string): string {
  const name = (blogName ?? '').toLowerCase()
  if (name.includes('dự án') && industry === 'Thiết kế - Thi công nội thất') return PROJECT_TOPIC
  if (name.includes('hướng dẫn')) return 'Hướng dẫn sử dụng'
  if (['tư vấn', 'kinh nghiệm', 'mẹo', 'chia sẻ'].some((k) => name.includes(k))) return 'Mẹo hay & Kinh nghiệm'
  if (['khuyến mãi', 'ưu đãi', 'sale', 'giảm giá'].some((k) => name.includes(k))) return 'Khuyến mãi'
  if (['đánh giá', 'review'].some((k) => name.includes(k))) return 'Đánh giá sản phẩm'
  if (name.includes('sự kiện')) return 'Sự kiện cửa hàng'
  return 'Tin tức ngành hàng'
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
  /** 'job' = tin tuyển dụng (tab Tuyển dụng) — hiển thị tách riêng khỏi tab Tin tức. */
  kind?: 'job'
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
  /** Tag người dùng tự nhập (cách nhau bởi dấu phẩy) — gắn cho mọi bài viết tạo ra, thay cho tag tự sinh. */
  tags: string
  /** Khung giao diện bài viết của theme (Sapo template_layout, VD "article.project") — '' = mặc định. */
  templateLayout: string
}

export const JOB_LOCATIONS = ['Tự động', 'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ'] as const
export type JobLocation = (typeof JOB_LOCATIONS)[number]

/** Cấu hình tạo tin tuyển dụng (tab Tuyển dụng) — ngành cố định Thiết kế - Thi công nội thất. */
export interface JobGenerationConfig {
  quantity: number
  /** "Tự động" = rải đều các thành phố lớn. */
  location: JobLocation
  /** Hạn nộp hồ sơ, dạng 'YYYY-MM-DD' (ô chọn ngày) — tag deadline: ghi dạng dd/mm/yyyy. */
  deadline: string
  blogName: string
  publishNow: boolean
  imageAspectRatio: ImageAspectRatio
  /** Tag thêm do người dùng tự nhập (ngoài các tag quy ước loc/type/salary/exp/qty/deadline). */
  tags: string
  /** Khung giao diện bài viết của theme (Sapo template_layout) — '' = mặc định. */
  templateLayout: string
}
