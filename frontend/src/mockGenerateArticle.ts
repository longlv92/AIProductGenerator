import type { Article, ArticleTone, ArticleTopic, Industry } from './types'

interface IndustryContext {
  /** Cụm từ tiếng Việt chỉ ngành hàng, chèn vào câu văn (VD "sản phẩm thời trang"). */
  label: string
  /** Từ khóa tiếng Anh để nối thêm vào imageKeyword của template, giúp ảnh minh họa sát ngành hơn. */
  imageKeyword: string
}

/** Ngữ cảnh ngành hàng của store — chèn vào tiêu đề/nội dung/ảnh/tag để bài viết không còn chung chung, bám đúng thứ store đang bán. */
const INDUSTRY_CONTEXT: Record<Industry, IndustryContext> = {
  'Thời trang': { label: 'thời trang', imageKeyword: 'fashion clothing' },
  'Giày dép': { label: 'giày dép', imageKeyword: 'shoes footwear' },
  'Mỹ phẩm': { label: 'mỹ phẩm', imageKeyword: 'cosmetics skincare beauty' },
  'Đồ gia dụng': { label: 'đồ gia dụng', imageKeyword: 'home appliances kitchen' },
  'Điện tử': { label: 'thiết bị điện tử', imageKeyword: 'electronics gadgets' },
  'Thực phẩm': { label: 'thực phẩm', imageKeyword: 'food grocery' },
  'Mẹ & Bé': { label: 'mẹ và bé', imageKeyword: 'baby mother care' },
  'Phụ kiện': { label: 'phụ kiện thời trang', imageKeyword: 'fashion accessories' },
  'Nội thất': { label: 'nội thất', imageKeyword: 'home furniture decor' },
}

function getIndustryContext(industry: string): IndustryContext {
  return INDUSTRY_CONTEXT[industry as Industry] ?? { label: industry || 'cửa hàng', imageKeyword: industry || 'retail store' }
}

interface ArticleTemplate {
  /** Ý tưởng tiêu đề cốt lõi — kết hợp với `angles` để tránh trùng tên (giống nouns × adjectives ở mockGenerate.ts). */
  titleCores: string[]
  angles: string[]
  introFragments: string[]
  bulletFragments: string[]
  ctaFragments: string[]
  tagPool: string[]
  imageKeyword: string
  authorPool: string[]
  /** Nối thêm ngành hàng vào cuối tiêu đề, viết sao cho khớp văn phong titleCores/angles của topic này. */
  titleIndustrySuffix: (industryLabel: string) => string
}

const TEMPLATES: Record<ArticleTopic, ArticleTemplate> = {
  'Khuyến mãi': {
    titleCores: [
      'Chương trình khuyến mãi tháng này',
      'Deal hot không thể bỏ lỡ',
      'Ưu đãi đặc biệt dành cho khách hàng thân thiết',
      'Flash sale cuối tuần',
      'Giảm giá sốc mừng sự kiện lớn',
    ],
    angles: ['— giảm giá đến 50%', 'cho đơn hàng đầu tiên', 'chỉ trong tuần này', 'áp dụng toàn bộ sản phẩm', 'số lượng có hạn'],
    introFragments: [
      'Đừng bỏ lỡ cơ hội mua sắm với mức giá tốt nhất trong tháng.',
      'Cửa hàng vừa tung ra loạt ưu đãi hấp dẫn dành riêng cho khách hàng.',
      'Đây là thời điểm vàng để sắm sửa với ngân sách tiết kiệm hơn.',
    ],
    bulletFragments: [
      'Áp dụng cho tất cả sản phẩm đang có trên cửa hàng',
      'Không giới hạn số lượng đơn hàng mỗi khách',
      'Kết hợp được với các mã giảm giá khác',
      'Miễn phí vận chuyển cho đơn từ 300.000đ',
      'Ưu tiên xử lý đơn trong ngày',
    ],
    ctaFragments: [
      'Ghé cửa hàng ngay hôm nay để không bỏ lỡ ưu đãi này.',
      'Liên hệ với chúng tôi để được tư vấn và đặt hàng sớm nhất.',
      'Theo dõi cửa hàng để cập nhật thêm nhiều chương trình hấp dẫn khác.',
    ],
    tagPool: ['khuyến mãi', 'ưu đãi', 'giảm giá', 'sale', 'deal hot'],
    imageKeyword: 'sale promotion shopping discount',
    authorPool: ['Đội ngũ Marketing', 'Ban biên tập', 'Phòng Kinh doanh'],
    titleIndustrySuffix: (label) => `cho dòng sản phẩm ${label}`,
  },
  'Hướng dẫn sử dụng': {
    titleCores: [
      'Hướng dẫn sử dụng sản phẩm đúng cách',
      'Cách bảo quản sản phẩm bền lâu',
      'Mẹo sử dụng hiệu quả nhất',
      'Hướng dẫn từng bước cho người mới',
      'Những điều cần biết trước khi sử dụng',
    ],
    angles: ['dành cho người mới bắt đầu', 'chi tiết từ A đến Z', 'ai cũng nên biết', 'theo khuyến nghị chuyên gia', 'đơn giản, dễ áp dụng'],
    introFragments: [
      'Nhiều khách hàng vẫn còn băn khoăn khi lần đầu sử dụng sản phẩm.',
      'Bài viết này sẽ giúp bạn sử dụng sản phẩm đúng cách và bền lâu hơn.',
      'Chỉ với vài bước đơn giản, bạn có thể tận dụng tối đa công dụng sản phẩm.',
    ],
    bulletFragments: [
      'Đọc kỹ hướng dẫn đi kèm trước khi sử dụng lần đầu',
      'Vệ sinh và bảo quản đúng nơi khô ráo, thoáng mát',
      'Tránh để sản phẩm tiếp xúc trực tiếp với nhiệt độ cao',
      'Kiểm tra định kỳ để đảm bảo chất lượng tốt nhất',
      'Liên hệ hỗ trợ nếu gặp vấn đề trong quá trình sử dụng',
    ],
    ctaFragments: [
      'Nếu cần hỗ trợ thêm, đừng ngần ngại liên hệ với cửa hàng.',
      'Xem thêm các bài hướng dẫn khác trên blog của chúng tôi.',
      'Lưu lại bài viết này để tham khảo khi cần nhé.',
    ],
    tagPool: ['hướng dẫn', 'mẹo hay', 'sử dụng', 'bảo quản', 'tips'],
    imageKeyword: 'product tutorial guide instructions',
    authorPool: ['Đội ngũ Kỹ thuật', 'Ban biên tập', 'Chuyên viên sản phẩm'],
    titleIndustrySuffix: (label) => `với sản phẩm ${label}`,
  },
  'Tin tức ngành hàng': {
    titleCores: [
      'Xu hướng thị trường đáng chú ý',
      'Cập nhật tin tức ngành hàng mới nhất',
      'Những thay đổi lớn trong ngành',
      'Góc nhìn thị trường tuần qua',
      'Dự báo xu hướng thời gian tới',
    ],
    angles: ['năm nay có gì mới', 'người tiêu dùng cần biết', 'ảnh hưởng thế nào đến bạn', 'theo báo cáo mới nhất', 'đáng quan tâm'],
    introFragments: [
      'Thị trường đang có nhiều biến động đáng chú ý trong thời gian gần đây.',
      'Cùng điểm qua những thông tin nổi bật nhất của ngành trong giai đoạn này.',
      'Nắm bắt xu hướng sớm sẽ giúp bạn đưa ra quyết định mua sắm thông minh hơn.',
    ],
    bulletFragments: [
      'Nhu cầu của người tiêu dùng đang dịch chuyển rõ rệt',
      'Nhiều thương hiệu đẩy mạnh đầu tư vào chất lượng sản phẩm',
      'Giá cả có xu hướng ổn định hơn so với giai đoạn trước',
      'Kênh mua sắm trực tuyến tiếp tục tăng trưởng',
      'Người dùng ngày càng quan tâm đến yếu tố bền vững',
    ],
    ctaFragments: [
      'Theo dõi cửa hàng để cập nhật tin tức ngành hàng mới nhất.',
      'Chia sẻ bài viết nếu bạn thấy thông tin hữu ích.',
      'Đón đọc thêm nhiều bài phân tích khác trên blog.',
    ],
    tagPool: ['tin tức', 'xu hướng', 'thị trường', 'cập nhật', 'ngành hàng'],
    imageKeyword: 'retail industry news trends',
    authorPool: ['Ban biên tập', 'Phòng Phân tích thị trường'],
    titleIndustrySuffix: (label) => `ngành ${label}`,
  },
  'Đánh giá sản phẩm': {
    titleCores: [
      'Đánh giá chi tiết sản phẩm',
      'Trải nghiệm thực tế sau 1 tháng sử dụng',
      'Có nên mua sản phẩm này không?',
      'Review chi tiết ưu và nhược điểm',
      'Đánh giá từ góc nhìn người dùng thật',
    ],
    angles: ['đáng đồng tiền bát gạo', 'liệu có xứng đáng?', 'khách quan, chi tiết', 'từ trải nghiệm thực tế', 'so với các lựa chọn khác'],
    introFragments: [
      'Sau thời gian sử dụng thực tế, đây là những gì chúng tôi ghi nhận được.',
      'Bài đánh giá này tổng hợp trải nghiệm thật từ khách hàng đã mua sản phẩm.',
      'Cùng xem sản phẩm này có thực sự đáng mua như lời đồn hay không.',
    ],
    bulletFragments: [
      'Chất lượng hoàn thiện tốt, đúng như mô tả',
      'Thiết kế gọn gàng, dễ sử dụng trong đời sống hàng ngày',
      'Mức giá hợp lý so với các sản phẩm cùng phân khúc',
      'Một vài điểm có thể cải thiện thêm trong phiên bản sau',
      'Được nhiều khách hàng phản hồi tích cực',
    ],
    ctaFragments: [
      'Nếu bạn đang cân nhắc, đây là thời điểm phù hợp để trải nghiệm thử.',
      'Xem thêm các đánh giá sản phẩm khác trên blog cửa hàng.',
      'Để lại bình luận nếu bạn đã từng sử dụng sản phẩm này.',
    ],
    tagPool: ['đánh giá', 'review', 'trải nghiệm', 'sản phẩm', 'nhận xét'],
    imageKeyword: 'product review unboxing test',
    authorPool: ['Đội ngũ Trải nghiệm khách hàng', 'Ban biên tập'],
    titleIndustrySuffix: (label) => `sản phẩm ${label}`,
  },
  'Mẹo hay & Kinh nghiệm': {
    titleCores: [
      'Mẹo hay giúp cuộc sống dễ dàng hơn',
      'Kinh nghiệm chọn mua thông minh',
      'Bí quyết nhỏ mà hiệu quả lớn',
      'Những lưu ý ít ai để ý',
      'Kinh nghiệm được nhiều người chia sẻ',
    ],
    angles: ['ai cũng nên biết', 'áp dụng ngay hôm nay', 'đơn giản mà hữu ích', 'từ kinh nghiệm thực tế', 'tiết kiệm thời gian, chi phí'],
    introFragments: [
      'Những mẹo nhỏ dưới đây có thể giúp ích rất nhiều trong cuộc sống hàng ngày.',
      'Tổng hợp kinh nghiệm hữu ích được nhiều khách hàng chia sẻ lại.',
      'Chỉ cần lưu ý vài điều đơn giản, mọi thứ sẽ dễ dàng hơn rất nhiều.',
    ],
    bulletFragments: [
      'Ưu tiên lựa chọn sản phẩm phù hợp với nhu cầu thực tế',
      'So sánh kỹ trước khi quyết định mua sắm',
      'Tận dụng các chương trình ưu đãi để tiết kiệm chi phí',
      'Bảo quản đúng cách để dùng được lâu dài',
      'Tham khảo đánh giá từ những người đã trải nghiệm trước',
    ],
    ctaFragments: [
      'Hy vọng những chia sẻ này sẽ hữu ích cho bạn.',
      'Ghé cửa hàng để được tư vấn thêm kinh nghiệm phù hợp.',
      'Đón đọc thêm nhiều mẹo hay khác trên blog của chúng tôi.',
    ],
    tagPool: ['mẹo hay', 'kinh nghiệm', 'bí quyết', 'tips', 'chia sẻ'],
    imageKeyword: 'lifestyle tips everyday life',
    authorPool: ['Ban biên tập', 'Cộng đồng khách hàng'],
    titleIndustrySuffix: (label) => `khi mua sắm ${label}`,
  },
  'Sự kiện cửa hàng': {
    titleCores: [
      'Sự kiện đặc biệt sắp diễn ra',
      'Cùng điểm lại sự kiện vừa qua',
      'Chương trình offline dành cho khách hàng',
      'Kỷ niệm cột mốc đáng nhớ',
      'Sự kiện khai trương/mở rộng cửa hàng',
    ],
    angles: ['đừng bỏ lỡ', 'nhiều hoạt động thú vị', 'dành riêng cho khách hàng thân thiết', 'quy mô lớn nhất từ trước đến nay', 'nhiều quà tặng hấp dẫn'],
    introFragments: [
      'Cửa hàng chuẩn bị tổ chức một sự kiện đặc biệt dành cho khách hàng.',
      'Cùng nhìn lại những khoảnh khắc đáng nhớ trong sự kiện vừa qua.',
      'Đây là dịp để khách hàng trải nghiệm và giao lưu trực tiếp cùng cửa hàng.',
    ],
    bulletFragments: [
      'Nhiều hoạt động trải nghiệm sản phẩm trực tiếp',
      'Quà tặng và ưu đãi đặc biệt dành cho người tham dự',
      'Cơ hội giao lưu, trao đổi trực tiếp với đội ngũ cửa hàng',
      'Minigame và phần thưởng hấp dẫn trong suốt sự kiện',
      'Không gian được đầu tư chỉn chu, chuyên nghiệp',
    ],
    ctaFragments: [
      'Đăng ký tham gia ngay để không bỏ lỡ sự kiện.',
      'Theo dõi cửa hàng để cập nhật lịch sự kiện sắp tới.',
      'Hẹn gặp bạn tại sự kiện lần này!',
    ],
    tagPool: ['sự kiện', 'offline', 'khách hàng', 'trải nghiệm', 'cửa hàng'],
    imageKeyword: 'store event people gathering',
    authorPool: ['Ban tổ chức sự kiện', 'Ban biên tập'],
    titleIndustrySuffix: (label) => `ngành ${label}`,
  },
}

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length]
}

function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function buildContentHtml(
  template: ArticleTemplate,
  tone: ArticleTone,
  tags: string[],
  extraPrompt: string,
  industryLabel: string,
  seed: number,
): string {
  const intro = pick(template.introFragments, seed)
  const bullets = template.bulletFragments
    .slice(seed % template.bulletFragments.length)
    .concat(template.bulletFragments)
    .slice(0, 4)
    .map((b) => capitalizeFirst(b))
  const cta = pick(template.ctaFragments, seed + 5)

  const toneNote: Record<ArticleTone, string> = {
    'Chuyên nghiệp': 'Nội dung được biên soạn với văn phong rõ ràng, mạch lạc, đảm bảo tính chính xác.',
    'Thân thiện': 'Nội dung được chia sẻ theo cách gần gũi, dễ đọc, như một lời tâm sự tới khách hàng.',
    'Hài hước': 'Nội dung được viết theo phong cách dí dỏm, vui vẻ, mang lại cảm giác thoải mái khi đọc.',
  }

  return [
    `<p>${intro} Nội dung xoay quanh ngành hàng ${industryLabel} — lĩnh vực chính mà cửa hàng đang kinh doanh. ${toneNote[tone]}</p>`,
    extraPrompt.trim() ? `<p><strong>Theo yêu cầu riêng:</strong> ${extraPrompt.trim()}.</p>` : '',
    `<p><strong>Những điểm đáng chú ý:</strong></p><ul>${bullets.map((b) => `<li>${b}</li>`).join('')}</ul>`,
    `<p>Với những thông tin trên về ${industryLabel}, hy vọng bạn đọc sẽ có thêm góc nhìn hữu ích. Đừng quên theo dõi để không bỏ lỡ các bài viết liên quan tới ${tags.slice(0, 2).join(', ')}.</p>`,
    `<p>${cta}</p>`,
  ]
    .filter(Boolean)
    .join('\n')
}

export function generateMockArticle(
  topic: ArticleTopic | string,
  tone: ArticleTone,
  extraPrompt: string,
  index: number,
  industry: string,
  blogName?: string,
): Article {
  const template = TEMPLATES[topic as ArticleTopic] ?? TEMPLATES['Tin tức ngành hàng']
  const industryContext = getIndustryContext(industry)
  const seed = index + Math.floor(Math.random() * 1000)

  // Rải đều index qua từng tổ hợp (ý tưởng tiêu đề × góc nhìn) trước khi lặp
  // lại — cùng nguyên tắc chống trùng tên đã áp dụng cho sản phẩm.
  const coreIndex = index % template.titleCores.length
  const angleIndex = Math.floor(index / template.titleCores.length) % template.angles.length
  const titleCore = template.titleCores[coreIndex]
  const angle = template.angles[angleIndex]
  // Luôn gắn ngành hàng của store vào tiêu đề — tránh bài viết chung chung không liên quan tới thứ store đang bán.
  const title = `${titleCore} ${angle} ${template.titleIndustrySuffix(industryContext.label)}`

  const tags = [...template.tagPool].sort(() => Math.random() - 0.5).slice(0, 3 + (seed % 2))
  tags.unshift(industryContext.label)
  const extraTags = extraPrompt
    .trim()
    .split(/[,;]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 3)
  tags.unshift(...extraTags)

  const excerpt = `${titleCore} ${angle} ${template.titleIndustrySuffix(industryContext.label)}.`

  return {
    id: `draft-article-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
    title,
    author: pick(template.authorPool, seed + 3),
    imageKeyword: `${template.imageKeyword} ${industryContext.imageKeyword}`,
    excerpt,
    content: buildContentHtml(template, tone, tags, extraPrompt, industryContext.label, seed),
    tags: [...new Set(tags)],
    blog: blogName ?? '',
    seoTitle: title,
    seoDescription: excerpt,
    status: 'draft',
  }
}
