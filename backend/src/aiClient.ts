export interface GeneratedProductContent {
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

export interface GenerateParams {
  industry: string
  priceSegment: string
  extraPrompt: string
  count: number
  collectionName?: string
}

const SYSTEM_PROMPT = `Bạn là chuyên gia tạo nội dung sản phẩm cho website bán hàng tại Việt Nam.
Nhiệm vụ: sinh danh sách sản phẩm dưới dạng JSON THUẦN — không markdown, không code fence, không giải thích gì thêm ngoài JSON.

Mỗi sản phẩm gồm ĐÚNG các trường sau (không thêm/bớt trường):
- name: tên sản phẩm tiếng Việt, tự nhiên, hấp dẫn, không trùng lặp giữa các sản phẩm trong cùng danh sách
- shortDescription: mô tả ngắn 1 câu
- description: mô tả CHI TIẾT dạng HTML, ít nhất 3 đoạn <p> + 1 danh sách <ul><li> điểm nổi bật (3-5 gạch đầu dòng) — gồm: đoạn mở đầu giới thiệu sản phẩm, danh sách điểm nổi bật/tính năng, đoạn nói về chất liệu/công dụng/đối tượng phù hợp, đoạn cam kết đóng gói/đổi trả. Viết tự nhiên, không lặp lại y nguyên câu giữa các sản phẩm.
- price: giá bán VNĐ, số nguyên, hợp lý theo phân khúc giá được yêu cầu
- compareAtPrice: giá so sánh VNĐ, số nguyên, LỚN HƠN price khoảng 10-30%
- category: loại sản phẩm cụ thể bằng tiếng Việt, ngắn gọn (VD: "Áo thun nam", không phải cả ngành hàng)
- brand: tên thương hiệu tự sáng tạo, hợp lý với ngành hàng, KHÔNG dùng thương hiệu thật đã tồn tại ngoài đời
- tags: mảng 3-5 từ khóa tiếng Việt viết thường, không dấu #
- imageKeyword: cụm từ khóa TIẾNG ANH ngắn (3-5 từ) để tìm ảnh minh họa đúng loại sản phẩm, VD "wireless bluetooth headphones"
- weight: khối lượng ước tính, đơn vị gram, số nguyên hợp lý theo loại sản phẩm
- attributes: mảng thuộc tính liên quan nếu sản phẩm thực sự cần (VD kích thước, màu sắc, dung tích) — mỗi phần tử {"name": "...", "value": "..."}; để mảng rỗng [] nếu không cần thiết
- seoTitle: tiêu đề SEO ngắn (dưới 60 ký tự)
- seoDescription: mô tả SEO ngắn (dưới 160 ký tự)

Trả về CHÍNH XÁC theo cấu trúc: {"products": [ {...}, {...} ]}`

function buildUserPrompt(params: GenerateParams): string {
  const lines = [
    `Ngành nghề: ${params.industry}`,
    `Phân khúc giá: ${params.priceSegment}`,
    // "Danh mục cụ thể" phải LẤN ÁT "Ngành nghề" khi có cả 2 — nếu không nói rõ ưu tiên, model hay
    // sinh sản phẩm chung chung theo cả ngành hàng thay vì đúng loại danh mục người dùng đã chọn.
    params.collectionName
      ? `Danh mục sản phẩm cụ thể trên store: "${params.collectionName}" — ĐÂY LÀ YÊU CẦU QUAN TRỌNG NHẤT, ưu tiên hơn "Ngành nghề" ở trên. TẤT CẢ sản phẩm sinh ra PHẢI đúng loại thuộc danh mục "${params.collectionName}" này, KHÔNG được sinh sản phẩm thuộc loại khác trong cùng ngành hàng dù vẫn hợp lệ với ngành nghề nói chung.`
      : '',
    params.extraPrompt.trim() ? `Yêu cầu bổ sung từ người bán: ${params.extraPrompt.trim()}` : '',
    `Hãy tạo đúng ${params.count} sản phẩm khác nhau, đa dạng, phù hợp thị trường và thị hiếu người Việt Nam.`,
  ].filter(Boolean)
  return lines.join('\n')
}

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenced) return fenced[1].trim()
  return text.trim()
}

/**
 * Gọi Claude (Anthropic Messages API) với 1 system + user prompt, trả về JSON
 * đã parse — dùng chung cho cả sinh sản phẩm (generateProducts) lẫn sinh bài
 * viết (generateArticles) để khỏi lặp lại phần gọi API + xử lý lỗi.
 */
async function callClaudeForJson(systemPrompt: string, userPrompt: string): Promise<unknown> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('Chưa cấu hình ANTHROPIC_API_KEY trong backend/.env')
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-5',
      max_tokens: 4096,
      // Viết nội dung sản phẩm/bài viết không cần suy luận sâu — hạ effort để rẻ + nhanh hơn.
      output_config: { effort: 'low' },
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`Claude API trả lỗi ${response.status}: ${body.slice(0, 300)}`)
  }

  const data = (await response.json()) as { content?: Array<{ type: string; text?: string }> }
  const text = data.content?.find((block) => block.type === 'text')?.text
  if (!text) {
    throw new Error('Claude không trả về nội dung text.')
  }

  try {
    return JSON.parse(extractJson(text))
  } catch {
    throw new Error('Không đọc được JSON từ phản hồi của AI.')
  }
}

function sanitizeProduct(raw: unknown): GeneratedProductContent | null {
  if (!raw || typeof raw !== 'object') return null
  const p = raw as Record<string, unknown>

  if (typeof p.name !== 'string' || !p.name.trim()) return null
  const price = Number(p.price)
  const compareAtPrice = Number(p.compareAtPrice)
  if (!Number.isFinite(price) || price <= 0) return null

  return {
    name: p.name,
    shortDescription: typeof p.shortDescription === 'string' ? p.shortDescription : '',
    description: typeof p.description === 'string' ? p.description : `<p>${p.name}</p>`,
    price: Math.round(price),
    compareAtPrice: Number.isFinite(compareAtPrice) && compareAtPrice > price ? Math.round(compareAtPrice) : Math.round(price * 1.15),
    category: typeof p.category === 'string' && p.category.trim() ? p.category : 'Khác',
    brand: typeof p.brand === 'string' && p.brand.trim() ? p.brand : 'No Brand',
    tags: Array.isArray(p.tags) ? p.tags.filter((t): t is string => typeof t === 'string').slice(0, 6) : [],
    imageKeyword: typeof p.imageKeyword === 'string' ? p.imageKeyword : p.name,
    weight: Number.isFinite(Number(p.weight)) && Number(p.weight) > 0 ? Math.round(Number(p.weight)) : 300,
    attributes: Array.isArray(p.attributes)
      ? p.attributes
          .filter((a): a is { name: string; value: string } => !!a && typeof a === 'object' && typeof (a as { name?: unknown }).name === 'string')
          .slice(0, 4)
      : [],
    seoTitle: typeof p.seoTitle === 'string' && p.seoTitle.trim() ? p.seoTitle : p.name,
    seoDescription: typeof p.seoDescription === 'string' ? p.seoDescription : '',
  }
}

/**
 * Gọi Claude (Anthropic Messages API) để sinh nội dung sản phẩm thật bằng AI,
 * thay cho bộ template cố định (mockGenerate.ts ở frontend chỉ còn dùng làm
 * phương án dự phòng khi không gọi được AI thật — xem routes/generate.ts).
 */
export async function generateProducts(params: GenerateParams): Promise<GeneratedProductContent[]> {
  const parsed = await callClaudeForJson(SYSTEM_PROMPT, buildUserPrompt(params))

  const rawList = (parsed as { products?: unknown[] })?.products
  if (!Array.isArray(rawList)) {
    throw new Error('Phản hồi AI thiếu mảng "products".')
  }

  const products = rawList.map(sanitizeProduct).filter((p): p is GeneratedProductContent => p !== null)
  if (products.length === 0) {
    throw new Error('AI không sinh được sản phẩm hợp lệ nào.')
  }
  return products
}

export interface GeneratedArticleContent {
  title: string
  excerpt: string
  content: string
  tags: string[]
  imageKeyword: string
  author: string
  seoTitle: string
  seoDescription: string
}

export interface GenerateArticleParams {
  topic: string
  industry: string
  tone: string
  extraPrompt: string
  count: number
}

const ARTICLE_SYSTEM_PROMPT = `Bạn là biên tập viên nội dung cho blog của website bán hàng tại Việt Nam.
Nhiệm vụ: sinh danh sách bài viết dưới dạng JSON THUẦN — không markdown, không code fence, không giải thích gì thêm ngoài JSON.

Mỗi bài viết gồm ĐÚNG các trường sau (không thêm/bớt trường):
- title: tiêu đề bài viết tiếng Việt, hấp dẫn, không trùng lặp giữa các bài trong cùng danh sách
- excerpt: tóm tắt ngắn 1 câu
- content: nội dung CHI TIẾT dạng HTML, ít nhất 3 đoạn <p> + 1 danh sách <ul><li> (3-5 gạch đầu dòng) — gồm: đoạn mở đầu, danh sách ý chính/mẹo/lý do, đoạn triển khai thêm, đoạn kết kèm lời kêu gọi hành động (CTA) tới cửa hàng. Viết đúng giọng văn được yêu cầu, không lặp lại y nguyên câu giữa các bài.
- tags: mảng 3-5 từ khóa tiếng Việt viết thường, không dấu #
- imageKeyword: cụm từ khóa TIẾNG ANH ngắn (3-5 từ) để tìm ảnh minh họa đúng chủ đề bài viết
- author: tên tác giả tự sáng tạo, hợp lý (tiếng Việt)
- seoTitle: tiêu đề SEO ngắn (dưới 60 ký tự)
- seoDescription: mô tả SEO ngắn (dưới 160 ký tự)

Trả về CHÍNH XÁC theo cấu trúc: {"articles": [ {...}, {...} ]}`

function buildArticleUserPrompt(params: GenerateArticleParams): string {
  const lines = [
    `Ngành hàng của cửa hàng: ${params.industry} — ĐÂY LÀ YÊU CẦU QUAN TRỌNG NHẤT: toàn bộ bài viết (tiêu đề, nội dung, ví dụ, mẹo, tin tức...) PHẢI xoay quanh đúng ngành hàng này, không được viết nội dung chung chung không liên quan tới sản phẩm cửa hàng đang bán.`,
    `Chủ đề/thể loại bài viết: ${params.topic}`,
    `Giọng văn: ${params.tone}`,
    params.extraPrompt.trim() ? `Yêu cầu bổ sung từ người bán: ${params.extraPrompt.trim()}` : '',
    `Hãy tạo đúng ${params.count} bài viết khác nhau, đa dạng góc nhìn, phù hợp thị trường và thị hiếu người Việt Nam.`,
  ].filter(Boolean)
  return lines.join('\n')
}

function sanitizeArticle(raw: unknown): GeneratedArticleContent | null {
  if (!raw || typeof raw !== 'object') return null
  const a = raw as Record<string, unknown>

  if (typeof a.title !== 'string' || !a.title.trim()) return null

  return {
    title: a.title,
    excerpt: typeof a.excerpt === 'string' ? a.excerpt : '',
    content: typeof a.content === 'string' ? a.content : `<p>${a.title}</p>`,
    tags: Array.isArray(a.tags) ? a.tags.filter((t): t is string => typeof t === 'string').slice(0, 6) : [],
    imageKeyword: typeof a.imageKeyword === 'string' ? a.imageKeyword : a.title,
    author: typeof a.author === 'string' && a.author.trim() ? a.author : 'Đội ngũ biên tập',
    seoTitle: typeof a.seoTitle === 'string' && a.seoTitle.trim() ? a.seoTitle : a.title,
    seoDescription: typeof a.seoDescription === 'string' ? a.seoDescription : '',
  }
}

/**
 * Gọi Claude để sinh nội dung bài viết thật bằng AI, thay cho bộ template cố
 * định (mockGenerateArticle.ts ở frontend chỉ còn dùng làm phương án dự
 * phòng khi không gọi được AI thật — xem routes/generateArticles.ts).
 */
export async function generateArticles(params: GenerateArticleParams): Promise<GeneratedArticleContent[]> {
  const parsed = await callClaudeForJson(ARTICLE_SYSTEM_PROMPT, buildArticleUserPrompt(params))

  const rawList = (parsed as { articles?: unknown[] })?.articles
  if (!Array.isArray(rawList)) {
    throw new Error('Phản hồi AI thiếu mảng "articles".')
  }

  const articles = rawList.map(sanitizeArticle).filter((a): a is GeneratedArticleContent => a !== null)
  if (articles.length === 0) {
    throw new Error('AI không sinh được bài viết hợp lệ nào.')
  }
  return articles
}
