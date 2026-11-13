import { AUTO_TOPIC, PROJECT_TOPIC, topicForBlog, type Article, type ArticleIndustry, type ArticleTone, type ArticleTopic, type Industry } from './types'

interface IndustryContext {
  /** Cụm từ tiếng Việt chỉ ngành hàng, chèn vào câu văn (VD "sản phẩm thời trang"). */
  label: string
  /** Từ khóa tiếng Anh để nối thêm vào imageKeyword của template, giúp ảnh minh họa sát ngành hơn. */
  imageKeyword: string
}

/** Ngữ cảnh ngành hàng của store — chèn vào tiêu đề/nội dung/ảnh/tag để bài viết không còn chung chung, bám đúng thứ store đang bán. */
const INDUSTRY_CONTEXT: Record<ArticleIndustry, IndustryContext> = {
  'Thời trang - Trang sức': { label: 'thời trang và trang sức', imageKeyword: 'jewelry fashion accessories' },
  'Mỹ phẩm - Làm đẹp': { label: 'mỹ phẩm và làm đẹp', imageKeyword: 'cosmetics skincare beauty' },
  'Thực phẩm - Nhà hàng': { label: 'thực phẩm', imageKeyword: 'food grocery' },
  'Đồ gia dụng - Sinh hoạt': { label: 'đồ gia dụng', imageKeyword: 'home appliances kitchen' },
  'Thiết bị nhà bếp': { label: 'thiết bị nhà bếp', imageKeyword: 'modern kitchen' },
  'Thiết bị vệ sinh - Nhà tắm': { label: 'thiết bị vệ sinh và phụ kiện nhà tắm', imageKeyword: 'modern bathroom' },
  'Hóa phẩm - Vệ sinh nhà cửa': { label: 'hóa phẩm vệ sinh nhà cửa', imageKeyword: 'household cleaning products' },
  'Nội thất - Trang trí': { label: 'đồ gỗ nội thất và trang trí nhà cửa', imageKeyword: 'wooden furniture home decor' },
  'Thiết kế - Thi công nội thất': { label: 'thiết kế thi công nội thất', imageKeyword: 'interior design living room' },
  'Studio - Chụp ảnh & Quay phim': { label: 'studio chụp ảnh và quay phim', imageKeyword: 'photography studio camera' },
  'Sách - Văn phòng phẩm': { label: 'sách và văn phòng phẩm', imageKeyword: 'books office supplies' },
  'Thủ công - Mỹ nghệ - Quà tặng': { label: 'thủ công mỹ nghệ và quà tặng', imageKeyword: 'handmade crafts gifts' },
  'Công nghệ - Kỹ thuật số': { label: 'công nghệ và thiết bị kỹ thuật số', imageKeyword: 'electronics gadgets' },
  'Ô tô - Xe máy': { label: 'ô tô và xe máy', imageKeyword: 'car motorcycle accessories' },
  'Phụ tùng - Phụ kiện xe tải': { label: 'phụ tùng và phụ kiện xe tải, xe khách', imageKeyword: 'truck parts' },
  'Thực phẩm bổ sung - Sức khỏe trẻ em': { label: 'sức khỏe trẻ em', imageKeyword: 'healthy children' },
  'Thiết bị điện': { label: 'thiết bị điện gia dụng', imageKeyword: 'home appliances electronics store' },
  'Âm thanh - Loa, Micro, Tai nghe': { label: 'thiết bị âm thanh', imageKeyword: 'hifi speakers' },
  'Vận tải - Gửi hàng, Chành xe': { label: 'vận tải, gửi hàng và chành xe', imageKeyword: 'cargo truck' },
  'Thể thao - Dịch vụ': { label: 'thể thao', imageKeyword: 'sports fitness equipment' },
  Khác: { label: 'cửa hàng', imageKeyword: 'retail store' },
}

function getIndustryContext(industry: string): IndustryContext {
  return INDUSTRY_CONTEXT[industry as ArticleIndustry] ?? { label: industry || 'cửa hàng', imageKeyword: industry || 'retail store' }
}

interface ArticleTemplate {
  /** Ý tưởng tiêu đề cốt lõi — kết hợp với `angles` để tránh trùng tên (giống nouns × adjectives ở mockGenerate.ts). */
  titleCores: string[]
  angles: string[]
  introFragments: string[]
  /** Tiêu đề (h2) + 3 đoạn văn mở rộng bối cảnh — đứng ngay sau đoạn mở bài, tăng độ dài và chiều sâu nội dung. */
  contextHeading: string
  contextFragments: string[]
  /** Tiêu đề (h2) + 3 đoạn văn đào sâu chi tiết hơn nữa — đứng sau phần bối cảnh, trước danh sách điểm nổi bật. */
  detailHeading: string
  detailFragments: string[]
  bulletFragments: string[]
  /** Tiêu đề (h2) đứng trước danh sách bulletFragments. */
  bulletsHeading: string
  /** Tiêu đề (h2) + danh sách lưu ý riêng — tách biệt với bulletFragments để bài có 2 phần nội dung rõ ràng. */
  adviceHeading: string
  adviceFragments: string[]
  /** Tiêu đề (h2) "Câu hỏi thường gặp" + các câu hỏi con dùng thẻ h3 — thêm chiều sâu và đa dạng cấp tiêu đề cho bài. */
  faqHeading: string
  faq: { q: string; a: string }[]
  /** Tiêu đề (h2) phần kết + đoạn văn tổng kết đứng trước câu CTA. */
  closingHeading: string
  closingFragments: string[]
  ctaFragments: string[]
  tagPool: string[]
  imageKeyword: string
  authorPool: string[]
  /** Nối thêm ngành hàng vào cuối tiêu đề, viết sao cho khớp văn phong titleCores/angles của topic này. */
  titleIndustrySuffix: (industryLabel: string) => string
  /**
   * Từ khóa ảnh RIÊNG cho từng tiêu đề (song song `titleCores`) — ảnh khớp đúng nội dung bài (VD bài hội thảo ra ảnh hội
   * thảo, bài bảo quản ra ảnh lọ thuốc) thay vì 1 ảnh chung cả chủ đề. Không khai báo → dùng `imageKeyword`.
   */
  titleImageKeywords?: string[]
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
    contextHeading: 'Vì sao chương trình này đáng để bạn quan tâm?',
    contextFragments: [
      'Trong bối cảnh chi tiêu ngày càng được cân nhắc kỹ lưỡng, một chương trình ưu đãi đúng thời điểm không chỉ giúp khách hàng tiết kiệm mà còn là cơ hội để trải nghiệm những sản phẩm vốn đang cân nhắc mua.',
      'Chương trình lần này được xây dựng dựa trên phản hồi thực tế từ khách hàng thân thiết, tập trung vào những sản phẩm được quan tâm nhiều nhất trong thời gian gần đây.',
      'Khác với các đợt giảm giá thông thường, lần này mức ưu đãi được áp dụng rộng rãi hơn và thời gian triển khai cũng được kéo dài hơn để nhiều khách hàng có thể sắp xếp mua sắm.',
    ],
    detailHeading: 'Cách để không bỏ lỡ ưu đãi',
    detailFragments: [
      'Để tận dụng tối đa chương trình, bạn nên theo dõi thông báo qua các kênh chính thức của cửa hàng như website, fanpage hoặc email, vì một số ưu đãi chỉ được công bố trong thời gian ngắn.',
      'Nhiều khách hàng có thói quen lưu sẵn sản phẩm vào giỏ hàng trước khi chương trình bắt đầu, để có thể đặt hàng ngay khi mã giảm giá được kích hoạt.',
      'Nếu đang phân vân giữa nhiều sản phẩm, đây cũng là thời điểm tốt để tham khảo thêm đánh giá từ những khách hàng đã mua trước đó.',
    ],
    bulletFragments: [
      'Áp dụng cho tất cả sản phẩm đang có trên cửa hàng',
      'Không giới hạn số lượng đơn hàng mỗi khách',
      'Kết hợp được với các mã giảm giá khác',
      'Miễn phí vận chuyển cho đơn từ 300.000đ',
      'Ưu tiên xử lý đơn trong ngày',
    ],
    bulletsHeading: 'Ưu đãi lần này bao gồm những gì?',
    adviceHeading: 'Lưu ý khi áp dụng ưu đãi',
    adviceFragments: [
      'Kiểm tra kỹ thời gian áp dụng vì mỗi chương trình thường chỉ kéo dài trong khoảng thời gian giới hạn',
      'Một số sản phẩm có thể hết hàng sớm do nhu cầu tăng cao, nên đặt hàng sớm nếu đã ưng ý',
      'Đọc kỹ điều kiện áp dụng (mức đơn tối thiểu, khu vực giao hàng...) trước khi đặt để tránh nhầm lẫn',
    ],
    faqHeading: 'Câu hỏi thường gặp',
    faq: [
      {
        q: 'Chương trình áp dụng đến khi nào?',
        a: 'Thời gian áp dụng cụ thể sẽ được thông báo trực tiếp trên trang cửa hàng, thường kéo dài trong một khoảng thời gian giới hạn nên bạn nên đặt hàng sớm.',
      },
      {
        q: 'Có thể kết hợp với các mã giảm giá khác không?',
        a: 'Tùy từng thời điểm, một số mã có thể được kết hợp — bạn nên kiểm tra kỹ điều kiện áp dụng trước khi thanh toán.',
      },
    ],
    closingHeading: 'Lời kết',
    closingFragments: [
      'Những chương trình ưu đãi như thế này không diễn ra thường xuyên, vì vậy đây là thời điểm hợp lý để cân nhắc những sản phẩm đã để ý từ trước.',
      'Dù bạn là khách hàng mới hay đã gắn bó lâu dài, đây đều là cơ hội tốt để trải nghiệm sản phẩm với mức chi phí hợp lý hơn.',
      'Cửa hàng luôn cố gắng mang đến những ưu đãi thực chất, thay vì chỉ giảm giá trên danh nghĩa.',
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
    contextHeading: 'Vì sao cần sử dụng đúng cách?',
    contextFragments: [
      'Rất nhiều trường hợp sản phẩm xuống cấp nhanh hoặc không phát huy hết công dụng không phải do chất lượng kém, mà đơn giản là vì chưa được sử dụng và bảo quản đúng cách ngay từ đầu.',
      'Chỉ cần dành vài phút tìm hiểu trước khi dùng, bạn có thể tránh được những lỗi cơ bản mà nhiều người mới thường gặp phải.',
      'Hướng dẫn dưới đây được tổng hợp dựa trên khuyến nghị của nhà sản xuất kết hợp với kinh nghiệm thực tế từ đội ngũ hỗ trợ khách hàng.',
    ],
    detailHeading: 'Hướng dẫn chi tiết từng bước',
    detailFragments: [
      'Bước đầu tiên và quan trọng nhất là đọc kỹ tài liệu đi kèm sản phẩm, vì mỗi phiên bản/model có thể có một vài lưu ý khác nhau.',
      'Sau khi sử dụng lần đầu, hãy dành thời gian quan sát phản ứng của sản phẩm để kịp thời điều chỉnh nếu có dấu hiệu bất thường.',
      'Việc ghi chú lại lịch sử sử dụng/bảo trì cũng giúp bạn dễ dàng theo dõi và phát hiện sớm các vấn đề phát sinh.',
    ],
    bulletFragments: [
      'Đọc kỹ hướng dẫn đi kèm trước khi sử dụng lần đầu',
      'Vệ sinh và bảo quản đúng nơi khô ráo, thoáng mát',
      'Tránh để sản phẩm tiếp xúc trực tiếp với nhiệt độ cao',
      'Kiểm tra định kỳ để đảm bảo chất lượng tốt nhất',
      'Liên hệ hỗ trợ nếu gặp vấn đề trong quá trình sử dụng',
    ],
    bulletsHeading: 'Các bước và lưu ý quan trọng',
    adviceHeading: 'Một số sai lầm thường gặp',
    adviceFragments: [
      'Sử dụng sai mục đích hoặc sai công suất khuyến nghị, khiến sản phẩm nhanh hỏng',
      'Bỏ qua bước vệ sinh/bảo trì định kỳ vì nghĩ rằng chưa cần thiết',
      'Tự ý sửa chữa khi gặp sự cố thay vì liên hệ nơi bán hoặc trung tâm bảo hành',
    ],
    faqHeading: 'Câu hỏi thường gặp',
    faq: [
      {
        q: 'Cần vệ sinh sản phẩm bao lâu một lần?',
        a: 'Tùy loại sản phẩm, nhưng nhìn chung nên vệ sinh định kỳ theo khuyến nghị trong tài liệu đi kèm để đảm bảo tuổi thọ và hiệu quả sử dụng.',
      },
      {
        q: 'Nếu sản phẩm gặp lỗi thì nên làm gì?',
        a: 'Bạn nên liên hệ trực tiếp với cửa hàng hoặc trung tâm bảo hành thay vì tự ý sửa chữa, để tránh ảnh hưởng đến chính sách bảo hành.',
      },
    ],
    closingHeading: 'Lời kết',
    closingFragments: [
      'Sử dụng đúng cách ngay từ đầu không chỉ giúp sản phẩm bền hơn mà còn đảm bảo an toàn trong quá trình sử dụng hàng ngày.',
      'Nếu vẫn còn thắc mắc sau khi đọc hướng dẫn này, đừng ngại đặt câu hỏi trực tiếp với đội ngũ hỗ trợ.',
      'Hy vọng những chia sẻ trên sẽ giúp bạn yên tâm hơn trong quá trình sử dụng sản phẩm.',
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
    contextHeading: 'Bối cảnh thị trường hiện tại',
    contextFragments: [
      'Sau giai đoạn biến động vì nhiều yếu tố kinh tế và thói quen tiêu dùng thay đổi, thị trường đang dần bước vào một chu kỳ ổn định hơn với những dấu hiệu phục hồi rõ nét.',
      'Các doanh nghiệp trong ngành cũng đang điều chỉnh chiến lược để thích ứng, từ cách vận hành cho tới cách tiếp cận khách hàng.',
      'Đây là những thông tin đáng để người tiêu dùng nắm bắt, bởi chúng ảnh hưởng trực tiếp đến quyết định mua sắm trong thời gian tới.',
    ],
    detailHeading: 'Những yếu tố đang tác động đến ngành',
    detailFragments: [
      'Sự thay đổi trong hành vi tiêu dùng, đặc biệt là xu hướng mua sắm trực tuyến, đang buộc các doanh nghiệp phải điều chỉnh cách vận hành và tiếp cận khách hàng.',
      'Chi phí nguyên vật liệu và vận chuyển cũng là yếu tố ảnh hưởng trực tiếp đến giá thành sản phẩm trong thời gian gần đây.',
      'Bên cạnh đó, yếu tố bền vững và trách nhiệm với môi trường ngày càng được người tiêu dùng quan tâm khi lựa chọn thương hiệu.',
    ],
    bulletFragments: [
      'Nhu cầu của người tiêu dùng đang dịch chuyển rõ rệt',
      'Nhiều thương hiệu đẩy mạnh đầu tư vào chất lượng sản phẩm',
      'Giá cả có xu hướng ổn định hơn so với giai đoạn trước',
      'Kênh mua sắm trực tuyến tiếp tục tăng trưởng',
      'Người dùng ngày càng quan tâm đến yếu tố bền vững',
    ],
    bulletsHeading: 'Những điểm đáng chú ý',
    adviceHeading: 'Người mua sắm nên làm gì?',
    adviceFragments: [
      'Theo dõi sát các chương trình ưu đãi để mua đúng thời điểm giá tốt',
      'Ưu tiên lựa chọn thương hiệu/cửa hàng có uy tín và chính sách rõ ràng',
      'Cân nhắc nhu cầu thực tế thay vì chạy theo xu hướng nhất thời',
    ],
    faqHeading: 'Câu hỏi thường gặp',
    faq: [
      {
        q: 'Xu hướng này sẽ kéo dài bao lâu?',
        a: 'Rất khó để đưa ra con số chính xác, nhưng theo các báo cáo hiện tại, xu hướng này được dự đoán sẽ còn tiếp tục trong ít nhất vài quý tới.',
      },
      {
        q: 'Người tiêu dùng bị ảnh hưởng như thế nào?',
        a: 'Ảnh hưởng rõ nhất là sự thay đổi về giá cả và cách các thương hiệu tiếp cận, giới thiệu sản phẩm tới khách hàng.',
      },
    ],
    closingHeading: 'Lời kết',
    closingFragments: [
      'Thị trường sẽ còn tiếp tục thay đổi trong thời gian tới, và việc cập nhật thông tin thường xuyên sẽ giúp bạn đưa ra quyết định mua sắm hợp lý hơn.',
      'Chúng tôi sẽ tiếp tục cập nhật những diễn biến mới nhất của ngành trong các bài viết tiếp theo.',
      'Hy vọng những thông tin trên phần nào giúp bạn có cái nhìn rõ ràng hơn về thị trường hiện tại.',
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
    contextHeading: 'Trải nghiệm thực tế như thế nào?',
    contextFragments: [
      'Trước khi đưa ra bất kỳ nhận xét nào, chúng tôi đã dành thời gian sử dụng sản phẩm trong điều kiện thực tế hàng ngày, thay vì chỉ đánh giá qua thông số trên giấy.',
      'Mỗi tiêu chí đánh giá dưới đây đều dựa trên cảm nhận trực tiếp, kết hợp với phản hồi từ những khách hàng đã mua và sử dụng sản phẩm.',
      'Mục tiêu của bài viết là cung cấp góc nhìn khách quan nhất, giúp bạn đọc dễ dàng hình dung sản phẩm có phù hợp với nhu cầu của mình hay không.',
    ],
    detailHeading: 'Đánh giá chi tiết từng khía cạnh',
    detailFragments: [
      'Về mặt thiết kế, sản phẩm mang đến cảm giác chắc chắn, các chi tiết được hoàn thiện tỉ mỉ và phù hợp với nhu cầu sử dụng hàng ngày.',
      'Về hiệu năng/công dụng, sản phẩm đáp ứng tốt những gì được quảng cáo, không có sự chênh lệch đáng kể giữa lời giới thiệu và trải nghiệm thực tế.',
      'Về mức giá, đây là yếu tố được đánh giá cao nhất khi so sánh với các sản phẩm cùng phân khúc trên thị trường.',
    ],
    bulletFragments: [
      'Chất lượng hoàn thiện tốt, đúng như mô tả',
      'Thiết kế gọn gàng, dễ sử dụng trong đời sống hàng ngày',
      'Mức giá hợp lý so với các sản phẩm cùng phân khúc',
      'Một vài điểm có thể cải thiện thêm trong phiên bản sau',
      'Được nhiều khách hàng phản hồi tích cực',
    ],
    bulletsHeading: 'Ưu điểm và điểm cần lưu ý',
    adviceHeading: 'Sản phẩm này có phù hợp với bạn không?',
    adviceFragments: [
      'Phù hợp nếu bạn ưu tiên sự tiện dụng và mức giá hợp lý hơn là các tính năng cao cấp',
      'Cân nhắc thêm nếu bạn có yêu cầu cao về một vài chi tiết nhỏ vẫn còn hạn chế',
      'Nên so sánh với nhu cầu thực tế của bản thân trước khi quyết định mua',
    ],
    faqHeading: 'Câu hỏi thường gặp',
    faq: [
      {
        q: 'Sản phẩm có đáng để nâng cấp/mua mới không?',
        a: 'Nếu bạn đang tìm một lựa chọn cân bằng giữa chất lượng và mức giá, đây là sản phẩm đáng để cân nhắc.',
      },
      {
        q: 'Có điểm nào cần lưu ý trước khi mua không?',
        a: 'Bạn nên xác định rõ nhu cầu sử dụng thực tế để tránh mua thừa tính năng hoặc chưa đáp ứng đủ yêu cầu.',
      },
    ],
    closingHeading: 'Lời kết',
    closingFragments: [
      'Nhìn chung, đây là một lựa chọn đáng cân nhắc trong tầm giá, với chất lượng tương xứng với những gì được quảng cáo.',
      'Không có sản phẩm nào hoàn hảo tuyệt đối, quan trọng là nó có đáp ứng đúng nhu cầu của bạn hay không.',
      'Hy vọng bài đánh giá này giúp bạn có thêm cơ sở để đưa ra quyết định mua sắm phù hợp.',
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
    contextHeading: 'Vì sao những kinh nghiệm này hữu ích?',
    contextFragments: [
      'Không phải lúc nào lý thuyết cũng đúng với thực tế — nhiều kinh nghiệm chỉ thực sự đúc kết được sau một thời gian trải nghiệm và mắc phải một vài sai lầm nhỏ.',
      'Những chia sẻ dưới đây được tổng hợp từ chính những khách hàng đã sử dụng sản phẩm/dịch vụ, không phải lý thuyết suông.',
      'Áp dụng đúng những kinh nghiệm này có thể giúp bạn tiết kiệm được thời gian, chi phí và tránh những rắc rối không đáng có.',
    ],
    detailHeading: 'Áp dụng vào thực tế như thế nào?',
    detailFragments: [
      'Không cần áp dụng tất cả cùng lúc — hãy bắt đầu với 1-2 mẹo phù hợp nhất với hoàn cảnh của bạn rồi dần điều chỉnh.',
      'Ghi chú lại những gì hiệu quả với bản thân sẽ giúp bạn xây dựng được thói quen mua sắm/sử dụng thông minh hơn theo thời gian.',
      'Nhiều khách hàng chia sẻ rằng chỉ cần thay đổi một vài thói quen nhỏ cũng đã tiết kiệm được đáng kể chi phí và thời gian.',
    ],
    bulletFragments: [
      'Ưu tiên lựa chọn sản phẩm phù hợp với nhu cầu thực tế',
      'So sánh kỹ trước khi quyết định mua sắm',
      'Tận dụng các chương trình ưu đãi để tiết kiệm chi phí',
      'Bảo quản đúng cách để dùng được lâu dài',
      'Tham khảo đánh giá từ những người đã trải nghiệm trước',
    ],
    bulletsHeading: 'Những mẹo hữu ích nên áp dụng',
    adviceHeading: 'Lưu ý khi áp dụng',
    adviceFragments: [
      'Mỗi người có nhu cầu khác nhau, nên chọn lọc kinh nghiệm phù hợp với hoàn cảnh của bản thân',
      'Không nên áp dụng máy móc mà chưa cân nhắc đến điều kiện thực tế',
      'Kết hợp nhiều nguồn tham khảo khác nhau để có cái nhìn khách quan hơn',
    ],
    faqHeading: 'Câu hỏi thường gặp',
    faq: [
      {
        q: 'Áp dụng những mẹo này có mất nhiều thời gian không?',
        a: 'Hầu hết đều là những thay đổi nhỏ trong thói quen hàng ngày, không đòi hỏi nhiều thời gian hay công sức để thực hiện.',
      },
      {
        q: 'Có cần áp dụng đúng thứ tự không?',
        a: 'Không nhất thiết — bạn có thể chọn những mẹo phù hợp nhất với nhu cầu của mình để áp dụng trước.',
      },
    ],
    closingHeading: 'Lời kết',
    closingFragments: [
      'Những mẹo nhỏ tưởng chừng đơn giản nhưng nếu áp dụng đúng cách có thể tạo ra khác biệt lớn trong trải nghiệm mua sắm và sử dụng hàng ngày.',
      'Chúng tôi sẽ tiếp tục tổng hợp thêm nhiều kinh nghiệm hữu ích khác trong các bài viết sắp tới.',
      'Cảm ơn bạn đã dành thời gian đọc, hy vọng bài viết mang lại giá trị thiết thực.',
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
    contextHeading: 'Điều gì làm nên sự kiện này?',
    contextFragments: [
      'Đây không chỉ là dịp để giới thiệu sản phẩm, mà còn là cơ hội để cửa hàng gặp gỡ và lắng nghe trực tiếp phản hồi từ khách hàng.',
      'Sự kiện được chuẩn bị kỹ lưỡng với nhiều hoạt động đa dạng, hướng đến trải nghiệm thực tế thay vì chỉ dừng lại ở việc trưng bày sản phẩm.',
      'Đội ngũ tổ chức đã lắng nghe góp ý từ những lần trước để mang đến một chương trình chỉn chu và trọn vẹn hơn.',
    ],
    detailHeading: 'Những hoạt động chính trong sự kiện',
    detailFragments: [
      'Bên cạnh khu vực trải nghiệm sản phẩm, sự kiện còn có các hoạt động tương tác giúp khách hàng hiểu rõ hơn về câu chuyện và giá trị của thương hiệu.',
      'Đội ngũ nhân viên sẽ có mặt xuyên suốt để tư vấn, giải đáp thắc mắc và hỗ trợ khách hàng lựa chọn sản phẩm phù hợp.',
      'Một số hoạt động sẽ có giới hạn số lượng người tham gia, vì vậy khách hàng nên chú ý thời gian để không bỏ lỡ.',
    ],
    bulletFragments: [
      'Nhiều hoạt động trải nghiệm sản phẩm trực tiếp',
      'Quà tặng và ưu đãi đặc biệt dành cho người tham dự',
      'Cơ hội giao lưu, trao đổi trực tiếp với đội ngũ cửa hàng',
      'Minigame và phần thưởng hấp dẫn trong suốt sự kiện',
      'Không gian được đầu tư chỉn chu, chuyên nghiệp',
    ],
    bulletsHeading: 'Điểm nhấn của sự kiện',
    adviceHeading: 'Lưu ý cho người tham dự',
    adviceFragments: [
      'Đến sớm để có thời gian trải nghiệm đầy đủ các hoạt động trong khuôn khổ sự kiện',
      'Theo dõi thông báo chính thức để nắm rõ thời gian, địa điểm cụ thể',
      'Đăng ký trước (nếu có) để đảm bảo suất tham gia và nhận ưu đãi đầy đủ',
    ],
    faqHeading: 'Câu hỏi thường gặp',
    faq: [
      {
        q: 'Sự kiện có thu phí tham dự không?',
        a: 'Thông tin cụ thể về việc tham dự sẽ được thông báo trên các kênh chính thức của cửa hàng trước khi sự kiện diễn ra.',
      },
      {
        q: 'Có cần đăng ký trước không?',
        a: 'Một số hoạt động có thể yêu cầu đăng ký trước để đảm bảo suất tham gia, bạn nên theo dõi thông báo để nắm rõ.',
      },
    ],
    closingHeading: 'Lời kết',
    closingFragments: [
      'Đây là dịp hiếm hoi để khách hàng trải nghiệm trực tiếp và trò chuyện cùng đội ngũ cửa hàng, thay vì chỉ mua sắm trực tuyến như thường ngày.',
      'Chúng tôi mong muốn mỗi sự kiện đều để lại những trải nghiệm đáng nhớ cho người tham dự.',
      'Rất mong được đón tiếp bạn tại sự kiện lần này.',
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

/**
 * Nội dung chi tiết dạng HTML nhiều phần, mỗi phần có tiêu đề (h2) riêng — thay cho bản trước chỉ 1 đoạn
 * mở + 1 danh sách ngắn, để bài viết đủ dài và có cấu trúc rõ ràng giống bài blog thật (mở bài → bối cảnh
 * → điểm nổi bật → lưu ý → kết bài), thay vì chỉ vài câu chung chung.
 */
function buildContentHtml(
  template: ArticleTemplate,
  tone: ArticleTone,
  tags: string[],
  extraPrompt: string,
  industryLabel: string,
  seed: number,
): string {
  const intro = pick(template.introFragments, seed)
  const contextFrag1 = pick(template.contextFragments, seed)
  const contextFrag2 = pick(template.contextFragments, seed + 1)
  const detailFrag1 = pick(template.detailFragments, seed)
  const detailFrag2 = pick(template.detailFragments, seed + 1)
  const bullets = template.bulletFragments
    .slice(seed % template.bulletFragments.length)
    .concat(template.bulletFragments)
    .slice(0, template.bulletFragments.length)
    .map((b) => capitalizeFirst(b))
  const advice = template.adviceFragments
    .slice(seed % template.adviceFragments.length)
    .concat(template.adviceFragments)
    .slice(0, template.adviceFragments.length)
    .map((a) => capitalizeFirst(a))
  const closing = pick(template.closingFragments, seed + 2)
  const cta = pick(template.ctaFragments, seed + 5)

  const toneNote: Record<ArticleTone, string> = {
    'Chuyên nghiệp': 'Nội dung được biên soạn với văn phong rõ ràng, mạch lạc, đảm bảo tính chính xác.',
    'Thân thiện': 'Nội dung được chia sẻ theo cách gần gũi, dễ đọc, như một lời tâm sự tới khách hàng.',
    'Hài hước': 'Nội dung được viết theo phong cách dí dỏm, vui vẻ, mang lại cảm giác thoải mái khi đọc.',
  }

  return [
    `<p>${intro} Nội dung xoay quanh ngành hàng ${industryLabel} — lĩnh vực chính mà cửa hàng đang kinh doanh. ${toneNote[tone]}</p>`,
    extraPrompt.trim() ? `<p><strong>Theo yêu cầu riêng:</strong> ${extraPrompt.trim()}.</p>` : '',
    `<h2>${template.contextHeading}</h2>`,
    `<p>${contextFrag1}</p>`,
    `<p>${contextFrag2}</p>`,
    `<h2>${template.detailHeading}</h2>`,
    `<p>${detailFrag1}</p>`,
    `<p>${detailFrag2}</p>`,
    `<h2>${template.bulletsHeading}</h2>`,
    `<ul>${bullets.map((b) => `<li>${b}</li>`).join('')}</ul>`,
    `<h2>${template.adviceHeading}</h2>`,
    `<ul>${advice.map((a) => `<li>${a}</li>`).join('')}</ul>`,
    `<h2>${template.faqHeading}</h2>`,
    ...template.faq.map((item) => `<h3>${item.q}</h3>\n<p>${item.a}</p>`),
    `<h2>${template.closingHeading}</h2>`,
    `<p>${closing}</p>`,
    `<p>Với những thông tin trên về ${industryLabel}, hy vọng bạn đọc sẽ có thêm góc nhìn hữu ích. Đừng quên theo dõi để không bỏ lỡ các bài viết liên quan tới ${tags.slice(0, 2).join(', ')}.</p>`,
    `<p>${cta}</p>`,
  ]
    .filter(Boolean)
    .join('\n')
}

/**
 * Nội dung RIÊNG theo ngành × chủ đề — ghi đè lên mẫu chung của chủ đề (TEMPLATES) khi có, vì mẫu chung chỉ
 * chèn tên ngành vào câu nên bài đọc chung chung (VD bài "Hướng dẫn sử dụng" cho đồ gỗ cần nói chuyện lau
 * gỗ, chống mối mọt, không phải "sử dụng sản phẩm đúng cách" nói chung). Trường nào không khai báo thì dùng
 * lại của mẫu chung. `imageKeyword` ở đây dùng NGUYÊN VĂN (không nối thêm từ khóa ngành) vì đã đủ cụ thể.
 */
const INDUSTRY_TOPIC_OVERRIDES: Partial<Record<ArticleIndustry, Partial<Record<ArticleTopic, Partial<ArticleTemplate>>>>> = {
  'Nội thất - Trang trí': {
    'Khuyến mãi': {
      titleCores: [
        'Tuần lễ vàng đồ gỗ nội thất',
        'Ưu đãi bộ bàn ăn gỗ tự nhiên',
        'Sale lớn sofa gỗ và kệ tivi',
        'Đón nhà mới — ưu đãi trọn bộ nội thất gỗ',
        'Xả kho mẫu trưng bày đồ gỗ',
      ],
      angles: ['giảm đến 30%', 'tặng kèm phụ kiện trang trí', 'miễn phí lắp đặt tận nhà', 'trả góp 0% lãi suất', 'số lượng có hạn'],
      introFragments: [
        'Nếu bạn đang ấp ủ kế hoạch làm mới không gian sống, đây là thời điểm hợp lý để sở hữu món đồ gỗ ưng ý với chi phí nhẹ nhàng hơn.',
        'Showroom vừa triển khai chương trình ưu đãi dành riêng cho các dòng nội thất gỗ tự nhiên được khách hàng quan tâm nhiều nhất.',
        'Đồ gỗ là khoản đầu tư dùng hàng chục năm, nên một đợt ưu đãi đúng lúc có thể giúp bạn tiết kiệm đáng kể.',
      ],
      contextHeading: 'Vì sao nên mua đồ gỗ trong đợt ưu đãi này?',
      contextFragments: [
        'Giá gỗ nguyên liệu như sồi, óc chó, tần bì thường biến động theo mùa, nên các đợt ưu đãi lớn là cơ hội để mua được sản phẩm gỗ thật với mức giá tốt trước khi giá điều chỉnh.',
        'Chương trình áp dụng cho cả những mẫu bán chạy như bàn ăn mặt gỗ nguyên tấm, kệ tivi gỗ sồi và giường ngủ khung gỗ — không chỉ hàng tồn hay mẫu cũ.',
        'Mỗi sản phẩm đều được hoàn thiện bằng sơn PU hoặc dầu lau gỗ an toàn, bảo hành kết cấu và hỗ trợ bảo dưỡng định kỳ như khi mua giá gốc.',
      ],
      detailHeading: 'Cách chọn được món đồ gỗ phù hợp khi mua ưu đãi',
      detailFragments: [
        'Trước khi chốt đơn, hãy đo kỹ kích thước phòng và lối đi — đồ gỗ tự nhiên thường nặng và khó đổi trả hơn đồ nội thất công nghiệp.',
        'Nên đến showroom xem trực tiếp vân gỗ và màu hoàn thiện, vì ảnh chụp khó thể hiện đúng sắc độ gỗ dưới ánh sáng thật trong nhà bạn.',
        'Nếu mua nhiều món cùng lúc (bàn ăn, kệ tivi, tủ giày), hãy chọn cùng một loại gỗ và tông màu để không gian liền mạch, hài hòa.',
      ],
      bulletFragments: [
        'Giảm giá trực tiếp trên bàn ăn, sofa gỗ, kệ tivi và giường ngủ',
        'Miễn phí vận chuyển và lắp đặt trong nội thành',
        'Tặng gói bảo dưỡng gỗ miễn phí sau 6 tháng sử dụng',
        'Hỗ trợ trả góp 0% qua thẻ tín dụng',
        'Bảo hành kết cấu gỗ lên đến 24 tháng',
      ],
      bulletsHeading: 'Ưu đãi lần này gồm những gì?',
      adviceHeading: 'Lưu ý khi đặt mua đồ gỗ ưu đãi',
      adviceFragments: [
        'Xác nhận rõ loại gỗ (gỗ tự nhiên nguyên khối, gỗ ghép hay gỗ công nghiệp phủ veneer) trước khi thanh toán',
        'Kiểm tra lịch giao hàng vì các mẫu đặt đóng theo kích thước có thể cần thêm thời gian sản xuất',
        'Giữ lại hóa đơn và phiếu bảo hành để được hỗ trợ bảo dưỡng, sửa chữa về sau',
      ],
      faq: [
        {
          q: 'Hàng ưu đãi có phải hàng trưng bày, hàng lỗi không?',
          a: 'Phần lớn sản phẩm trong chương trình là hàng mới nguyên kiện. Riêng mục "xả kho mẫu trưng bày" sẽ được ghi chú rõ tình trạng để bạn cân nhắc trước khi mua.',
        },
        {
          q: 'Có được đổi màu hoàn thiện hoặc kích thước theo yêu cầu không?',
          a: 'Một số mẫu hỗ trợ đóng theo kích thước và màu sơn riêng — bạn liên hệ showroom để được báo giá và thời gian sản xuất cụ thể.',
        },
      ],
      closingFragments: [
        'Một món đồ gỗ tốt có thể đồng hành cùng gia đình hàng chục năm, nên mua đúng thời điểm ưu đãi là lựa chọn vừa tiết kiệm vừa bền vững.',
        'Dù bạn đang hoàn thiện nhà mới hay chỉ muốn thay một chiếc bàn ăn, đây là dịp tốt để chọn được sản phẩm gỗ ưng ý.',
        'Số lượng mỗi mẫu có hạn vì đồ gỗ tự nhiên được sản xuất theo lô — hãy giữ chỗ sớm nếu đã ưng mẫu nào.',
      ],
      ctaFragments: [
        'Ghé showroom hoặc nhắn tin cho chúng tôi để được tư vấn mẫu và kích thước phù hợp với không gian nhà bạn.',
        'Đặt lịch xem mẫu trực tiếp để cảm nhận chất gỗ trước khi quyết định.',
        'Liên hệ ngay để giữ giá ưu đãi cho mẫu bạn yêu thích.',
      ],
      tagPool: ['đồ gỗ', 'nội thất gỗ', 'khuyến mãi', 'ưu đãi', 'bàn ăn gỗ'],
      imageKeyword: 'wooden furniture sale showroom',
      titleIndustrySuffix: () => '',
    },
    'Hướng dẫn sử dụng': {
      titleCores: [
        'Cách vệ sinh đồ gỗ nội thất đúng cách',
        'Hướng dẫn bảo dưỡng bàn ăn gỗ tự nhiên',
        'Cách chống mối mọt và ẩm mốc cho đồ gỗ',
        'Hướng dẫn xử lý vết xước trên mặt gỗ',
        'Cách giữ màu gỗ bền đẹp theo năm tháng',
      ],
      angles: ['tại nhà', 'chi tiết từng bước', 'cho người mới', 'vào mùa nồm ẩm', 'không cần thợ'],
      introFragments: [
        'Đồ gỗ tự nhiên càng dùng càng đẹp nếu được chăm sóc đúng cách, nhưng cũng rất dễ xuống cấp nếu lau chùi sai.',
        'Nhiều gia đình vô tình làm hỏng lớp hoàn thiện của bàn ghế gỗ chỉ vì dùng sai loại khăn hoặc nước tẩy rửa.',
        'Chỉ cần vài thói quen đơn giản mỗi tuần, bộ nội thất gỗ của bạn có thể giữ được vẻ đẹp như mới trong nhiều năm.',
      ],
      contextHeading: 'Vì sao đồ gỗ cần được chăm sóc riêng?',
      contextFragments: [
        'Gỗ là vật liệu tự nhiên, luôn "thở" theo độ ẩm môi trường — co lại khi hanh khô và nở ra khi nồm ẩm, nên dễ cong vênh, nứt chân chim nếu đặt sai vị trí.',
        'Lớp sơn PU hay dầu lau gỗ bên ngoài bảo vệ thớ gỗ khỏi nước và vết bẩn, nhưng sẽ mòn dần nếu thường xuyên lau bằng hóa chất mạnh.',
        'Khí hậu nóng ẩm ở Việt Nam là điều kiện thuận lợi cho mối mọt và nấm mốc, đặc biệt với đồ gỗ đặt sát tường hoặc ở tầng trệt.',
      ],
      detailHeading: 'Các bước vệ sinh và bảo dưỡng cơ bản',
      detailFragments: [
        'Hằng ngày chỉ cần lau bụi bằng khăn cotton hoặc microfiber khô, lau xuôi theo chiều vân gỗ để không đẩy bụi vào khe thớ gỗ.',
        'Khi có vết bẩn, dùng khăn vắt thật ráo với nước ấm pha chút xà phòng trung tính, sau đó lau lại ngay bằng khăn khô — tuyệt đối không để nước đọng trên mặt gỗ.',
        'Cứ 3–6 tháng một lần, thoa một lớp sáp ong hoặc dầu dưỡng gỗ chuyên dụng để nuôi gỗ, giữ độ bóng và tăng khả năng chống thấm.',
      ],
      bulletFragments: [
        'Dùng khăn mềm, lau theo chiều vân gỗ',
        'Lót đế cốc, khay khi đặt đồ nóng hoặc ướt lên mặt bàn',
        'Đặt đồ gỗ cách tường 5–10cm để thoáng khí',
        'Tránh ánh nắng chiếu trực tiếp làm bạc màu gỗ',
        'Dưỡng gỗ bằng sáp ong hoặc dầu chuyên dụng định kỳ',
      ],
      bulletsHeading: 'Thói quen giúp đồ gỗ luôn bền đẹp',
      adviceHeading: 'Những sai lầm cần tránh',
      adviceFragments: [
        'Không dùng nước tẩy rửa chứa cồn, amoniac hay nước lau kính lên mặt gỗ — dễ làm bong tróc lớp sơn',
        'Không đặt đồ gỗ sát điều hòa, lò sưởi hoặc cửa sổ hướng nắng vì gỗ dễ co ngót, nứt nẻ',
        'Không kéo lê bàn ghế trên sàn — hãy nhấc lên hoặc dán miếng nỉ dưới chân để tránh lỏng mộng gỗ',
      ],
      faq: [
        {
          q: 'Mùa nồm ẩm đồ gỗ bị mốc trắng thì xử lý thế nào?',
          a: 'Lau sạch bằng khăn khô, sau đó lau lại bằng khăn thấm chút giấm trắng pha loãng để diệt nấm mốc, để khô hoàn toàn rồi đánh một lớp sáp dưỡng. Nên bật máy hút ẩm và đóng cửa vào những ngày nồm.',
        },
        {
          q: 'Vết xước nhỏ trên mặt bàn gỗ có tự xử lý được không?',
          a: 'Vết xước nông có thể làm mờ bằng bút sáp màu gỗ hoặc dầu dưỡng gỗ. Với vết xước sâu, nứt mặt hay bong sơn diện rộng, bạn nên liên hệ cửa hàng để được thợ xử lý đúng kỹ thuật.',
        },
      ],
      closingFragments: [
        'Chăm sóc đồ gỗ không mất nhiều thời gian, quan trọng là làm đúng cách và đều đặn.',
        'Một bộ bàn ghế gỗ được bảo dưỡng tốt không chỉ bền hơn mà còn lên màu đẹp hơn theo thời gian.',
        'Chỉ cần nhớ nguyên tắc "khô, thoáng, tránh hóa chất mạnh", đồ gỗ nhà bạn sẽ luôn giữ được vẻ đẹp tự nhiên.',
      ],
      ctaFragments: [
        'Cần tư vấn thêm về cách bảo dưỡng từng loại gỗ? Liên hệ ngay với chúng tôi.',
        'Cửa hàng có sẵn sáp ong và dầu dưỡng gỗ chuyên dụng — ghé mua để chăm sóc đồ gỗ đúng cách.',
        'Đăng ký dịch vụ bảo dưỡng định kỳ tại nhà để đội ngũ kỹ thuật chăm sóc đồ gỗ giúp bạn.',
      ],
      tagPool: ['đồ gỗ', 'bảo dưỡng gỗ', 'vệ sinh nội thất', 'chống mối mọt', 'mẹo nhà cửa'],
      imageKeyword: 'wood furniture care polishing',
      titleIndustrySuffix: () => '',
    },
    'Tin tức ngành hàng': {
      titleCores: [
        'Xu hướng nội thất gỗ năm nay',
        'Gỗ sồi, óc chó hay tần bì — loại gỗ nào đang được ưa chuộng',
        'Phong cách Japandi và sự trở lại của gỗ tự nhiên',
        'Đồ gỗ có chứng nhận FSC — xu hướng tiêu dùng xanh',
        'Bảng màu gỗ được các kiến trúc sư lựa chọn nhiều nhất',
      ],
      angles: ['cho căn hộ hiện đại', 'theo góc nhìn chuyên gia', 'tại thị trường Việt Nam', 'cho gia đình trẻ', 'mà bạn nên biết'],
      introFragments: [
        'Thị trường nội thất gỗ đang thay đổi nhanh khi người tiêu dùng ngày càng quan tâm tới vật liệu tự nhiên và thiết kế tối giản.',
        'Sau nhiều năm thống trị của đồ nội thất công nghiệp, gỗ tự nhiên đang quay trở lại mạnh mẽ trong các căn hộ thành thị.',
        'Từ showroom đến các công trình nhà ở, gỗ vẫn là chất liệu được lựa chọn hàng đầu để tạo cảm giác ấm cúng cho không gian sống.',
      ],
      contextHeading: 'Bức tranh chung của thị trường đồ gỗ',
      contextFragments: [
        'Nhu cầu với đồ gỗ tự nhiên tăng đều ở nhóm khách hàng trẻ, đặc biệt là các gia đình mới mua căn hộ muốn đầu tư nội thất dùng lâu dài thay vì thay mới sau vài năm.',
        'Việt Nam hiện là một trong những nước xuất khẩu đồ gỗ lớn của thế giới, nên người tiêu dùng trong nước ngày càng dễ tiếp cận sản phẩm đạt chuẩn xuất khẩu với giá hợp lý.',
        'Các phong cách như Japandi, Scandinavian và Mid-century đều lấy gỗ sáng màu làm chủ đạo, kéo theo nhu cầu với gỗ sồi, tần bì và gỗ thông tăng mạnh.',
      ],
      detailHeading: 'Những điểm nổi bật đáng chú ý',
      detailFragments: [
        'Gỗ óc chó với tông nâu trầm và vân gỗ sang trọng đang được ưa chuộng ở phân khúc cao cấp, đặc biệt cho bàn ăn và kệ tivi.',
        'Thiết kế đa năng như giường có ngăn kéo, bàn ăn mở rộng hay kệ kết hợp tủ lưu trữ được chuộng vì phù hợp diện tích căn hộ nhỏ.',
        'Lớp hoàn thiện gốc nước và dầu lau gỗ tự nhiên dần thay thế sơn gốc dầu, vừa an toàn cho sức khỏe vừa giữ được cảm giác chạm gỗ thật.',
      ],
      bulletFragments: [
        'Gỗ sáng màu (sồi, tần bì) lên ngôi trong căn hộ hiện đại',
        'Thiết kế tối giản, đường nét bo tròn mềm mại',
        'Nội thất đa năng tối ưu diện tích',
        'Ưu tiên gỗ có nguồn gốc rõ ràng, chứng nhận FSC',
        'Hoàn thiện gốc nước, an toàn cho trẻ nhỏ',
      ],
      bulletsHeading: 'Xu hướng nổi bật',
      adviceHeading: 'Gợi ý khi chọn đồ gỗ theo xu hướng',
      adviceFragments: [
        'Chọn tông gỗ chủ đạo cho cả căn nhà trước, sau đó mới chọn từng món để tránh mỗi món một màu',
        'Ưu tiên thiết kế bền vững thay vì chạy theo mẫu quá "trend" dễ lỗi thời sau vài năm',
        'Hỏi rõ nguồn gốc gỗ và chứng nhận để đảm bảo chất lượng cũng như tính bền vững',
      ],
      faq: [
        {
          q: 'Gỗ tự nhiên và gỗ công nghiệp khác nhau thế nào?',
          a: 'Gỗ tự nhiên có vân gỗ thật, độ bền cao và có thể sửa chữa, đánh bóng lại nhiều lần; gỗ công nghiệp (MDF, MFC) giá mềm hơn, ít cong vênh nhưng kém chịu nước và khó sửa khi hỏng.',
        },
        {
          q: 'Chứng nhận FSC có ý nghĩa gì?',
          a: 'FSC xác nhận gỗ được khai thác từ rừng trồng được quản lý có trách nhiệm, đảm bảo nguồn gốc hợp pháp và thân thiện với môi trường.',
        },
      ],
      closingFragments: [
        'Xu hướng có thể thay đổi, nhưng giá trị của gỗ tự nhiên — bền, ấm áp và gần gũi — thì vẫn luôn được trân trọng.',
        'Nắm bắt xu hướng giúp bạn chọn được món đồ gỗ vừa hợp thời vừa dùng được lâu dài.',
        'Thị trường đồ gỗ đang mang đến nhiều lựa chọn hơn bao giờ hết, quan trọng là chọn đúng thứ phù hợp với không gian và lối sống của bạn.',
      ],
      ctaFragments: [
        'Ghé showroom để trải nghiệm các mẫu đồ gỗ theo xu hướng mới nhất.',
        'Theo dõi chúng tôi để cập nhật thêm tin tức và cảm hứng thiết kế nội thất gỗ.',
        'Liên hệ để được tư vấn phối đồ gỗ phù hợp với phong cách căn hộ của bạn.',
      ],
      tagPool: ['nội thất gỗ', 'xu hướng nội thất', 'japandi', 'gỗ tự nhiên', 'thiết kế nhà'],
      imageKeyword: 'wooden interior design living room',
      titleIndustrySuffix: () => '',
    },
    'Đánh giá sản phẩm': {
      titleCores: [
        'Đánh giá bàn ăn gỗ sồi 6 ghế',
        'Trải nghiệm kệ tivi gỗ óc chó sau 1 năm sử dụng',
        'Review giường ngủ khung gỗ tần bì',
        'Có nên mua sofa khung gỗ tự nhiên',
        'So sánh bàn làm việc gỗ nguyên tấm và gỗ ghép',
      ],
      angles: ['chi tiết ưu nhược điểm', 'từ khách hàng thực tế', 'có đáng tiền không', 'cho căn hộ 70m²', 'trước khi xuống tiền'],
      introFragments: [
        'Đồ gỗ là món đầu tư không nhỏ, vì vậy những đánh giá thực tế sẽ giúp bạn có thêm cơ sở trước khi quyết định.',
        'Chúng tôi đã tổng hợp trải nghiệm thực tế và phản hồi của khách hàng để mang tới bài đánh giá khách quan nhất.',
        'Không chỉ nhìn đẹp trên ảnh, một món đồ gỗ tốt cần chắc chắn, dễ chăm sóc và phù hợp thói quen sinh hoạt của gia đình.',
      ],
      contextHeading: 'Tổng quan sản phẩm',
      contextFragments: [
        'Sản phẩm được làm từ gỗ tự nhiên đã qua tẩm sấy đạt độ ẩm tiêu chuẩn, giúp hạn chế cong vênh và nứt nẻ khi thời tiết thay đổi.',
        'Các mối nối sử dụng liên kết mộng truyền thống kết hợp ke sắt ẩn, đảm bảo chắc chắn mà vẫn giữ được thẩm mỹ.',
        'Bề mặt hoàn thiện bằng sơn PU mờ, giữ được cảm giác vân gỗ thật khi chạm tay, đồng thời chống thấm nước ở mức sinh hoạt thông thường.',
      ],
      detailHeading: 'Trải nghiệm thực tế',
      detailFragments: [
        'Sau thời gian sử dụng, mặt gỗ vẫn giữ màu ổn định, không xuất hiện vết nứt chân chim dù trải qua cả mùa hanh khô lẫn nồm ẩm.',
        'Điểm cộng lớn là kết cấu đầm chắc, không rung lắc hay phát ra tiếng kêu như nhiều sản phẩm gỗ công nghiệp cùng tầm giá.',
        'Điểm cần lưu ý là sản phẩm khá nặng, nên cần xác định vị trí đặt cố định ngay từ đầu để tránh di chuyển nhiều lần.',
      ],
      bulletFragments: [
        'Gỗ tự nhiên tẩm sấy kỹ, ít cong vênh',
        'Vân gỗ đẹp, mỗi sản phẩm là một nét riêng',
        'Kết cấu chắc chắn, chịu lực tốt',
        'Lớp hoàn thiện dễ lau chùi',
        'Có thể đánh bóng, làm mới sau nhiều năm',
      ],
      bulletsHeading: 'Ưu điểm nổi bật',
      adviceHeading: 'Nhược điểm cần cân nhắc',
      adviceFragments: [
        'Giá cao hơn đồ gỗ công nghiệp cùng kích thước',
        'Trọng lượng lớn, cần nhiều người khi di chuyển',
        'Vân và màu gỗ có thể khác nhẹ so với ảnh mẫu do đặc tính tự nhiên của gỗ',
      ],
      faq: [
        {
          q: 'Sản phẩm có phù hợp gia đình có trẻ nhỏ không?',
          a: 'Có. Các cạnh được bo tròn và lớp hoàn thiện gốc nước an toàn, tuy nhiên vẫn nên lót đế khi trẻ dùng màu nước hoặc đồ ăn trên mặt gỗ.',
        },
        {
          q: 'Thời gian bảo hành bao lâu?',
          a: 'Sản phẩm được bảo hành kết cấu và mối mọt theo chính sách của cửa hàng, kèm hỗ trợ bảo dưỡng bề mặt khi có nhu cầu.',
        },
      ],
      closingFragments: [
        'Nhìn chung, đây là lựa chọn đáng cân nhắc cho những ai muốn đầu tư một món đồ gỗ bền đẹp, dùng lâu dài.',
        'Nếu ưu tiên độ bền và cảm giác gỗ thật, sản phẩm hoàn toàn xứng đáng với mức giá.',
        'Với những gia đình yêu thích sự ấm áp của gỗ tự nhiên, đây là món nội thất khó làm bạn thất vọng.',
      ],
      ctaFragments: [
        'Ghé showroom để trải nghiệm trực tiếp sản phẩm trước khi quyết định.',
        'Liên hệ để nhận báo giá và tư vấn kích thước phù hợp với không gian nhà bạn.',
        'Xem thêm các mẫu đồ gỗ khác đang có sẵn tại cửa hàng.',
      ],
      tagPool: ['review đồ gỗ', 'bàn ăn gỗ', 'nội thất gỗ', 'đánh giá', 'gỗ tự nhiên'],
      imageKeyword: 'solid wood dining table',
      titleIndustrySuffix: () => '',
    },
    'Mẹo hay & Kinh nghiệm': {
      titleCores: [
        'Kinh nghiệm chọn đồ gỗ nội thất cho nhà mới',
        'Mẹo phối màu gỗ trong một không gian',
        'Cách phân biệt gỗ tự nhiên và gỗ công nghiệp',
        'Bí quyết bố trí đồ gỗ cho phòng khách nhỏ',
        'Mẹo chọn bàn ăn gỗ vừa vặn với phòng bếp',
      ],
      angles: ['không phải ai cũng biết', 'cho căn hộ chung cư', 'dễ áp dụng', 'từ kiến trúc sư', 'tránh mua sai'],
      introFragments: [
        'Chọn đồ gỗ không chỉ là chọn mẫu đẹp mà còn cần hiểu về chất liệu, kích thước và cách bố trí trong không gian.',
        'Nhiều người chỉ nhận ra mình chọn sai đồ gỗ sau khi đã kê vào nhà — quá to, lệch tông hoặc không hợp công năng.',
        'Dưới đây là những kinh nghiệm thực tế giúp bạn chọn và bố trí đồ gỗ thông minh hơn.',
      ],
      contextHeading: 'Hiểu đúng về các loại gỗ',
      contextFragments: [
        'Gỗ tự nhiên nguyên khối có vân không lặp lại, cầm nặng tay và mặt cắt cạnh thấy rõ thớ gỗ; gỗ công nghiệp phủ veneer thường có vân đều, cạnh dán nẹp.',
        'Gỗ sồi và tần bì có màu sáng, vân rõ, hợp phong cách hiện đại; gỗ óc chó tông trầm sang trọng; gỗ thông giá mềm, phù hợp phong cách mộc mạc.',
        'Gỗ ghép thanh (finger joint) là giải pháp trung gian — vẫn là gỗ tự nhiên nhưng ghép từ nhiều thanh nhỏ, giá dễ chịu và ít cong vênh hơn.',
      ],
      detailHeading: 'Kinh nghiệm chọn và bố trí',
      detailFragments: [
        'Nguyên tắc "tối đa 3 tông gỗ" trong một không gian giúp nhà gọn mắt: một tông chủ đạo cho đồ lớn, một tông nhấn và một tông sàn.',
        'Với phòng khách nhỏ, ưu tiên sofa và kệ tivi chân cao, thiết kế thanh mảnh để lộ sàn nhà, tạo cảm giác rộng rãi hơn.',
        'Bàn ăn nên chừa khoảng trống ít nhất 75–90cm xung quanh để kéo ghế thoải mái; mỗi người ngồi cần khoảng 60cm chiều dài mặt bàn.',
      ],
      bulletFragments: [
        'Đo kỹ không gian trước khi chọn kích thước',
        'Chọn một tông gỗ chủ đạo cho cả nhà',
        'Ưu tiên thiết kế chân cao cho phòng nhỏ',
        'Kiểm tra mặt cắt cạnh để nhận biết loại gỗ',
        'Hỏi rõ độ ẩm gỗ và quy trình tẩm sấy',
      ],
      bulletsHeading: 'Mẹo nhanh cần nhớ',
      adviceHeading: 'Lưu ý để không mua sai',
      adviceFragments: [
        'Đừng chỉ nhìn ảnh — hãy xem mẫu thật hoặc xin mẫu gỗ màu để đối chiếu với sàn và tường nhà bạn',
        'Cẩn thận với sản phẩm giá quá rẻ so với "gỗ tự nhiên" được quảng cáo',
        'Hỏi kỹ chính sách bảo hành mối mọt và cong vênh trước khi mua',
      ],
      faq: [
        {
          q: 'Nhà có trẻ nhỏ nên chọn loại gỗ nào?',
          a: 'Nên chọn gỗ cứng như sồi, tần bì với lớp hoàn thiện gốc nước, cạnh bo tròn — vừa chịu va đập tốt vừa an toàn cho trẻ.',
        },
        {
          q: 'Chung cư có nên dùng đồ gỗ tự nhiên không?',
          a: 'Hoàn toàn nên, miễn là chọn kích thước phù hợp. Đồ gỗ tự nhiên giúp căn hộ ấm cúng hơn và bền hơn nhiều so với đồ công nghiệp.',
        },
      ],
      closingFragments: [
        'Một chút hiểu biết về gỗ sẽ giúp bạn chọn được món đồ vừa đẹp, vừa bền, vừa đáng tiền.',
        'Áp dụng những mẹo trên, không gian nhà bạn sẽ hài hòa và tiện nghi hơn hẳn.',
        'Đồ gỗ đẹp nhất là món phù hợp với không gian và thói quen sinh hoạt của chính gia đình bạn.',
      ],
      ctaFragments: [
        'Cần tư vấn chọn đồ gỗ cho nhà mới? Liên hệ đội ngũ thiết kế của chúng tôi.',
        'Ghé showroom để xem trực tiếp các loại gỗ và nhận mẫu màu miễn phí.',
        'Theo dõi chúng tôi để nhận thêm nhiều mẹo hay về nội thất gỗ.',
      ],
      tagPool: ['kinh nghiệm mua đồ gỗ', 'nội thất gỗ', 'mẹo trang trí', 'phòng khách', 'gỗ tự nhiên'],
      imageKeyword: 'wooden furniture home decor',
      titleIndustrySuffix: () => '',
    },
    'Sự kiện cửa hàng': {
      titleCores: [
        'Khai trương showroom đồ gỗ nội thất mới',
        'Workshop "Tự tay làm đồ gỗ nhỏ"',
        'Triển lãm bộ sưu tập nội thất gỗ mới',
        'Ngày hội tri ân khách hàng yêu đồ gỗ',
        'Tọa đàm thiết kế nhà với gỗ tự nhiên',
      ],
      angles: ['cuối tuần này', 'miễn phí tham dự', 'cùng kiến trúc sư', 'nhiều quà tặng hấp dẫn', 'số chỗ có hạn'],
      introFragments: [
        'Chúng tôi hân hạnh mời bạn tham gia sự kiện đặc biệt dành cho những ai yêu thích vẻ đẹp của gỗ tự nhiên.',
        'Đây là dịp để bạn trải nghiệm trực tiếp các mẫu nội thất gỗ mới nhất và gặp gỡ đội ngũ thiết kế.',
        'Sự kiện được tổ chức nhằm tri ân khách hàng đã đồng hành cùng cửa hàng trong suốt thời gian qua.',
      ],
      contextHeading: 'Thông tin sự kiện',
      contextFragments: [
        'Không gian sự kiện được bố trí như một căn nhà thật với phòng khách, phòng ăn và phòng ngủ hoàn thiện bằng đồ gỗ, giúp bạn dễ hình dung khi đưa về nhà.',
        'Khách tham dự có thể xem tận mắt quy trình hoàn thiện bề mặt gỗ và trò chuyện với thợ mộc lành nghề.',
        'Sự kiện phù hợp cho cả gia đình, có khu vực riêng cho trẻ em trải nghiệm lắp ráp đồ gỗ mini.',
      ],
      detailHeading: 'Chương trình diễn ra',
      detailFragments: [
        'Buổi sáng là phần giới thiệu bộ sưu tập mới và chia sẻ của kiến trúc sư về cách phối đồ gỗ cho từng kiểu căn hộ.',
        'Buổi chiều là workshop thực hành làm đồ gỗ nhỏ như khay, thớt, giá sách mini — sản phẩm được mang về làm kỷ niệm.',
        'Xuyên suốt sự kiện có tư vấn thiết kế miễn phí và ưu đãi riêng cho khách đặt hàng ngay tại showroom.',
      ],
      bulletFragments: [
        'Tham quan bộ sưu tập nội thất gỗ mới',
        'Workshop làm đồ gỗ nhỏ mang về',
        'Tư vấn thiết kế miễn phí 1-1',
        'Ưu đãi riêng cho khách tham dự',
        'Quà tặng sáp dưỡng gỗ cho 50 khách đầu tiên',
      ],
      bulletsHeading: 'Hoạt động nổi bật',
      adviceHeading: 'Lưu ý cho khách tham dự',
      adviceFragments: [
        'Đăng ký trước để giữ chỗ tham gia workshop vì số lượng có hạn',
        'Mang theo kích thước hoặc bản vẽ căn hộ nếu muốn được tư vấn thiết kế cụ thể',
        'Đến sớm để nhận quà tặng dành cho những khách đầu tiên',
      ],
      faq: [
        {
          q: 'Sự kiện có mất phí không?',
          a: 'Sự kiện hoàn toàn miễn phí. Riêng workshop thực hành cần đăng ký trước để cửa hàng chuẩn bị nguyên liệu.',
        },
        {
          q: 'Có thể đưa trẻ nhỏ đi cùng không?',
          a: 'Có, sự kiện có khu vực trải nghiệm dành riêng cho trẻ em với đồ gỗ mini an toàn.',
        },
      ],
      closingFragments: [
        'Đây là dịp hiếm hoi để bạn vừa trải nghiệm, vừa học hỏi và tìm được món đồ gỗ ưng ý cho ngôi nhà của mình.',
        'Chúng tôi rất mong được gặp bạn và cùng chia sẻ niềm yêu thích với gỗ tự nhiên.',
        'Hãy dành một ngày cuối tuần để tận hưởng không gian ấm áp của đồ gỗ cùng gia đình.',
      ],
      ctaFragments: [
        'Đăng ký tham dự ngay hôm nay để giữ chỗ.',
        'Liên hệ hotline hoặc nhắn tin fanpage để được hỗ trợ đăng ký.',
        'Chia sẻ sự kiện tới bạn bè cùng yêu thích đồ gỗ nhé!',
      ],
      tagPool: ['sự kiện', 'showroom đồ gỗ', 'workshop gỗ', 'nội thất gỗ', 'tri ân khách hàng'],
      imageKeyword: 'furniture showroom interior',
      titleIndustrySuffix: () => '',
    },
  },
  'Studio - Chụp ảnh & Quay phim': {
    'Khuyến mãi': {
      titleCores: [
        'Ưu đãi mùa cưới tại studio',
        'Combo chụp ảnh cưới và quay phóng sự',
        'Ưu đãi gói chụp ảnh gia đình',
        'Ưu đãi chụp ảnh kỷ yếu cho cả lớp',
        'Ưu đãi gói chụp ảnh sản phẩm cho shop online',
      ],
      angles: ['giảm đến 30%', 'tặng album ảnh cao cấp', 'tặng ảnh phóng lớn treo tường', 'miễn phí trang phục và makeup', 'số suất có hạn'],
      introFragments: [
        'Mùa cưới đang đến gần, và đây là thời điểm lý tưởng để các cặp đôi giữ lịch chụp với chi phí nhẹ nhàng hơn.',
        'Studio vừa ra mắt chương trình ưu đãi dành riêng cho các gói chụp ảnh và quay phim được khách hàng đặt nhiều nhất.',
        'Những khoảnh khắc quan trọng xứng đáng được lưu giữ trọn vẹn — và một đợt ưu đãi đúng lúc giúp bạn làm điều đó dễ dàng hơn.',
      ],
      contextHeading: 'Vì sao nên đặt lịch trong đợt ưu đãi này?',
      contextFragments: [
        'Lịch chụp cuối tuần trong mùa cưới thường kín trước vài tháng, nên đặt sớm trong đợt ưu đãi vừa giữ được ngày đẹp vừa tiết kiệm chi phí.',
        'Ưu đãi áp dụng cho trọn gói từ lên concept, trang phục, makeup, chụp, hậu kỳ đến in album, không phát sinh thêm chi phí ẩn.',
        'Các concept mới của studio đều được thử nghiệm kỹ về ánh sáng và bố cục trước khi đưa vào gói, nên bạn nhận được chất lượng ổn định ngay cả khi chọn gói ưu đãi.',
        'Khách đặt combo chụp ảnh và quay phim cùng lúc sẽ được làm việc với một ekip thống nhất, giúp ảnh và video đồng bộ màu sắc, phong cách.',
      ],
      detailHeading: 'Chi tiết các gói ưu đãi',
      detailFragments: [
        'Gói chụp ảnh cưới studio bao gồm 3 bộ trang phục, makeup cô dâu, 30 ảnh chỉnh sửa kỹ và một album 25x35cm.',
        'Gói chụp ngoại cảnh được hỗ trợ chi phí di chuyển trong bán kính 30km, tặng thêm video hậu trường ngắn.',
        'Gói chụp ảnh sản phẩm cho shop online tính theo số lượng sản phẩm, có nền trắng chuẩn sàn thương mại điện tử và ảnh lifestyle.',
      ],
      bulletFragments: [
        'giảm trực tiếp trên giá gói khi đặt cọc trong thời gian ưu đãi',
        'tặng album hoặc ảnh phóng lớn tùy gói',
        'miễn phí trang phục và makeup cho gói chụp cưới',
        'giao file ảnh chỉnh sửa trong 7–10 ngày',
        'hỗ trợ dời lịch 1 lần miễn phí',
      ],
      bulletsHeading: 'Quyền lợi khi đặt lịch',
      adviceHeading: 'Lưu ý khi đặt lịch',
      adviceFragments: [
        'chốt ngày chụp càng sớm càng tốt vì cuối tuần thường kín lịch',
        'trao đổi trước concept và ảnh tham khảo để ekip chuẩn bị đạo cụ phù hợp',
        'kiểm tra kỹ số lượng ảnh chỉnh sửa và kích thước album có trong gói',
      ],
      faq: [
        { q: 'Ưu đãi có áp dụng khi chụp vào ngày trong tuần không?', a: 'Có, ưu đãi áp dụng cho mọi ngày. Chụp ngày trong tuần còn được ưu tiên chọn khung giờ đẹp.' },
        { q: 'Đã đặt cọc thì có đổi gói được không?', a: 'Bạn có thể nâng cấp lên gói cao hơn và chỉ cần bù phần chênh lệch, ưu đãi vẫn được giữ nguyên.' },
      ],
      closingHeading: 'Lời kết',
      closingFragments: [
        'Những bức ảnh đẹp sẽ còn lại rất lâu sau ngày chụp, vì vậy hãy chọn thời điểm và ekip thật phù hợp.',
        'Chúng tôi mong được đồng hành cùng bạn lưu giữ những khoảnh khắc đáng nhớ nhất.',
        'Ưu đãi có số suất giới hạn, hãy liên hệ sớm để giữ lịch chụp ưng ý.',
      ],
      ctaFragments: [
        'Nhắn tin fanpage hoặc gọi hotline để được tư vấn gói phù hợp và giữ lịch chụp.',
        'Ghé studio để xem trực tiếp mẫu album và trang phục trước khi quyết định.',
        'Đặt lịch ngay hôm nay để nhận ưu đãi tốt nhất.',
      ],
      tagPool: ['ưu đãi', 'chụp ảnh cưới', 'album ảnh', 'quay phim', 'studio'],
      imageKeyword: 'wedding photoshoot studio',
      titleIndustrySuffix: () => '',
    },
    'Hướng dẫn sử dụng': {
      titleCores: [
        'Chuẩn bị gì trước buổi chụp ảnh cưới',
        'Cách tạo dáng tự nhiên trước ống kính',
        'Cách bảo quản album ảnh luôn bền đẹp',
        'Quy trình đặt lịch và làm việc với studio',
        'Cách chọn trang phục cho buổi chụp ảnh gia đình',
      ],
      angles: ['cho người lần đầu đi chụp', 'từ A đến Z', 'theo kinh nghiệm của nhiếp ảnh gia', 'đơn giản mà hiệu quả', 'ai cũng làm được'],
      introFragments: [
        'Một buổi chụp thành công phụ thuộc rất nhiều vào khâu chuẩn bị, không chỉ ở tay nghề của nhiếp ảnh gia.',
        'Nhiều khách hàng lần đầu đến studio thường lúng túng không biết bắt đầu từ đâu — bài viết này sẽ giúp bạn hình dung rõ từng bước.',
        'Chỉ cần nắm vài nguyên tắc cơ bản, bạn sẽ tự tin hơn hẳn khi đứng trước ống kính.',
      ],
      contextHeading: 'Vì sao khâu chuẩn bị lại quan trọng?',
      contextFragments: [
        'Thời gian chụp thường chỉ vài tiếng, nếu chuẩn bị kỹ về trang phục, concept và tâm lý thì ekip sẽ tập trung được vào việc bắt khoảnh khắc đẹp.',
        'Ánh sáng studio và ngoại cảnh rất khác nhau, việc chọn màu trang phục và giờ chụp phù hợp quyết định phần lớn chất lượng ảnh.',
        'Trao đổi trước với nhiếp ảnh gia giúp hai bên thống nhất phong cách, tránh trường hợp ảnh nhận về không đúng mong đợi.',
      ],
      detailHeading: 'Các bước thực hiện',
      detailFragments: [
        'Bước đầu tiên là gửi cho studio vài ảnh tham khảo bạn thích để ekip lên concept, chọn bối cảnh và đạo cụ phù hợp.',
        'Trước ngày chụp nên ngủ đủ giấc, uống nhiều nước và hạn chế đồ ăn mặn để gương mặt không bị phù.',
        'Trong buổi chụp, hãy thả lỏng vai, nhìn vào điểm phía sau ống kính và tương tác tự nhiên với người chụp cùng thay vì cố gắng tạo dáng cứng nhắc.',
        'Album ảnh nên được cất ở nơi khô ráo, tránh ánh nắng trực tiếp, lật trang bằng tay khô để không làm xước bề mặt ảnh.',
      ],
      bulletFragments: [
        'chuẩn bị 2–3 bộ trang phục có màu trơn, tránh họa tiết quá rối',
        'mang theo phụ kiện nhỏ như mũ, hoa, kính để ảnh thêm sinh động',
        'đến sớm 30 phút để makeup và làm quen không gian',
        'thống nhất trước số lượng ảnh và thời gian giao file',
        'bảo quản album trong hộp kèm theo, tránh nơi ẩm',
      ],
      bulletsHeading: 'Danh sách cần chuẩn bị',
      adviceHeading: 'Những lỗi thường gặp nên tránh',
      adviceFragments: [
        'mặc đồ quá rộng hoặc quá chật khiến dáng đứng thiếu tự nhiên',
        'chọn trang phục trùng màu với phông nền',
        'để album gần nguồn nhiệt hoặc trong tủ kín ẩm mốc lâu ngày',
      ],
      faq: [
        { q: 'Không biết tạo dáng thì có chụp đẹp được không?', a: 'Hoàn toàn được. Nhiếp ảnh gia sẽ hướng dẫn từng dáng và khuyến khích bạn tương tác tự nhiên để ảnh có cảm xúc.' },
        { q: 'Có được xem ảnh ngay trong buổi chụp không?', a: 'Có, ekip sẽ cho bạn xem nhanh trên máy để điều chỉnh dáng và góc chụp ngay tại chỗ.' },
      ],
      closingHeading: 'Tổng kết',
      closingFragments: [
        'Chuẩn bị kỹ một chút sẽ giúp buổi chụp nhẹ nhàng, vui vẻ và cho ra những bức ảnh ưng ý.',
        'Đừng ngại hỏi ekip bất cứ điều gì bạn còn băn khoăn trước buổi chụp.',
        'Một bộ ảnh đẹp bắt đầu từ sự thoải mái của chính bạn trước ống kính.',
      ],
      ctaFragments: [
        'Liên hệ studio để nhận bản checklist chuẩn bị chi tiết cho từng gói chụp.',
        'Đặt lịch tư vấn miễn phí để được ekip hướng dẫn trước buổi chụp.',
        'Theo dõi fanpage để xem thêm mẹo tạo dáng từ nhiếp ảnh gia.',
      ],
      tagPool: ['hướng dẫn', 'tạo dáng', 'chuẩn bị chụp ảnh', 'bảo quản album', 'kinh nghiệm'],
      imageKeyword: 'photographer directing photoshoot',
      titleIndustrySuffix: () => '',
    },
    'Tin tức ngành hàng': {
      titleCores: [
        'Xu hướng chụp ảnh cưới năm nay',
        'Phong cách quay phim phóng sự cưới đang lên ngôi',
        'Ảnh film và màu hoài cổ quay trở lại',
        'Nhu cầu chụp ảnh sản phẩm cho shop online tăng mạnh',
        'Album in ảnh vẫn được ưa chuộng trong thời đại số',
      ],
      angles: ['được nhiều cặp đôi lựa chọn', 'theo ghi nhận của studio', 'và những điều cần biết', 'qua góc nhìn nhiếp ảnh gia', 'trong mùa cưới này'],
      introFragments: [
        'Thị trường chụp ảnh và quay phim liên tục thay đổi theo thị hiếu của khách hàng trẻ.',
        'Từ concept, màu ảnh đến cách kể chuyện bằng video, mỗi mùa cưới lại mang đến những xu hướng mới đáng chú ý.',
        'Studio tổng hợp những thay đổi nổi bật nhất mà ekip ghi nhận được qua các buổi chụp gần đây.',
      ],
      contextHeading: 'Bối cảnh thị trường',
      contextFragments: [
        'Các cặp đôi ngày càng ưu tiên ảnh tự nhiên, giàu cảm xúc thay vì những bức ảnh tạo dáng cầu kỳ như trước.',
        'Video ngắn dạng phóng sự hoặc highlight 1–3 phút được chia sẻ nhiều trên mạng xã hội, trở thành phần không thể thiếu trong gói cưới.',
        'Các shop online đầu tư nhiều hơn cho hình ảnh vì ảnh đẹp ảnh hưởng trực tiếp đến tỷ lệ chuyển đổi trên sàn thương mại điện tử.',
        'Dù ảnh số tiện lợi, album in vẫn được giữ làm kỷ vật gia đình vì cảm giác cầm trên tay khác hẳn khi xem trên màn hình.',
      ],
      detailHeading: 'Điểm đáng chú ý',
      detailFragments: [
        'Màu ảnh trong trẻo, da tự nhiên và ánh sáng mềm đang thay thế dần phong cách chỉnh màu đậm, tương phản mạnh.',
        'Concept chụp tại nhà riêng, quán cà phê quen hay nơi hai người gặp nhau lần đầu được nhiều cặp đôi chọn để bộ ảnh mang câu chuyện riêng.',
        'Photobook khổ vuông, bìa vải hoặc bìa da khắc tên là lựa chọn phổ biến cho album cưới và album gia đình.',
      ],
      bulletFragments: [
        'ảnh tự nhiên, giàu cảm xúc lên ngôi',
        'video highlight ngắn cho mạng xã hội',
        'màu ảnh film, hoài cổ được ưa chuộng',
        'concept mang câu chuyện riêng của khách hàng',
        'album in cao cấp vẫn giữ vị trí quan trọng',
      ],
      bulletsHeading: 'Xu hướng nổi bật',
      adviceHeading: 'Gợi ý cho khách hàng',
      adviceFragments: [
        'chọn phong cách bạn thích lâu dài, không chỉ chạy theo trào lưu',
        'xem kỹ portfolio thật của studio thay vì chỉ ảnh quảng cáo',
        'cân nhắc thêm video ngắn để lưu giữ cả âm thanh và chuyển động',
      ],
      faq: [
        { q: 'Ảnh theo xu hướng có nhanh lỗi thời không?', a: 'Những phong cách tự nhiên, ánh sáng mềm thường bền theo thời gian hơn các hiệu ứng màu quá đậm.' },
        { q: 'Có nên vừa chụp ảnh vừa quay phim không?', a: 'Nếu ngân sách cho phép, combo ảnh và video giúp lưu giữ trọn vẹn cả khoảnh khắc lẫn cảm xúc của ngày quan trọng.' },
      ],
      closingHeading: 'Lời kết',
      closingFragments: [
        'Xu hướng thay đổi theo từng năm, nhưng điều quan trọng nhất vẫn là bộ ảnh phản ánh đúng con người và câu chuyện của bạn.',
        'Studio luôn cập nhật concept mới để mang đến cho khách hàng nhiều lựa chọn phù hợp.',
        'Hy vọng những thông tin trên giúp bạn có thêm ý tưởng cho buổi chụp sắp tới.',
      ],
      ctaFragments: [
        'Xem thêm các bộ ảnh mới nhất trên fanpage của studio.',
        'Liên hệ để được tư vấn concept theo xu hướng phù hợp với bạn.',
        'Đăng ký nhận bản tin để không bỏ lỡ các concept mới.',
      ],
      tagPool: ['xu hướng', 'ảnh cưới', 'quay phim phóng sự', 'photobook', 'chụp ảnh sản phẩm'],
      imageKeyword: 'wedding photographer camera',
      titleIndustrySuffix: () => '',
    },
    'Đánh giá sản phẩm': {
      titleCores: [
        'Trải nghiệm gói chụp ảnh cưới studio',
        'Đánh giá gói quay phim phóng sự cưới',
        'Review album ảnh bìa da cao cấp',
        'Trải nghiệm gói chụp ảnh gia đình cuối tuần',
        'Đánh giá gói chụp ảnh sản phẩm cho shop online',
      ],
      angles: ['từ khách hàng thực tế', 'sau khi nhận sản phẩm', 'ưu và nhược điểm', 'có đáng tiền không', 'chi tiết từng hạng mục'],
      introFragments: [
        'Trước khi đặt một gói chụp, ai cũng muốn biết thực tế trải nghiệm sẽ như thế nào.',
        'Bài viết tổng hợp chia sẻ của khách hàng đã sử dụng dịch vụ, từ lúc tư vấn đến khi nhận album và video.',
        'Chúng tôi đánh giá thẳng thắn từng hạng mục để bạn có cái nhìn khách quan trước khi lựa chọn.',
      ],
      contextHeading: 'Tổng quan gói dịch vụ',
      contextFragments: [
        'Gói được thiết kế cho khách hàng muốn trọn gói từ concept, trang phục, makeup đến hậu kỳ mà không phải tự lo nhiều khâu.',
        'Thời gian thực hiện trung bình 3–5 tiếng, giao file chỉnh sửa sau khoảng 7–10 ngày và album sau 2–3 tuần.',
        'Ekip gồm nhiếp ảnh gia chính, trợ lý ánh sáng và chuyên viên makeup, với gói quay phim có thêm quay phim và dựng video.',
      ],
      detailHeading: 'Đánh giá chi tiết',
      detailFragments: [
        'Chất lượng ảnh được khách hàng đánh giá cao ở màu da tự nhiên, ánh sáng đều và khoảnh khắc bắt được nhiều cảm xúc.',
        'Album in giấy lụa dày, màu in trung thực với file gốc, gáy đóng chắc chắn và mở phẳng 180 độ.',
        'Điểm cần cải thiện là thời gian chờ album vào mùa cao điểm có thể kéo dài thêm vài ngày.',
      ],
      bulletFragments: [
        'ekip thân thiện, hướng dẫn tạo dáng kỹ',
        'màu ảnh tự nhiên, chỉnh sửa tinh tế',
        'album in đẹp, chất liệu bền',
        'video dựng có cảm xúc, nhạc phù hợp',
        'giá hợp lý so với chất lượng nhận được',
      ],
      bulletsHeading: 'Điểm cộng nổi bật',
      adviceHeading: 'Điều cần cân nhắc',
      adviceFragments: [
        'mùa cưới nên đặt trước ít nhất 1–2 tháng',
        'gói cơ bản có ít trang phục hơn, cân nhắc nâng cấp nếu muốn nhiều concept',
        'nên chốt danh sách ảnh chọn in sớm để nhận album đúng hẹn',
      ],
      faq: [
        { q: 'Số lượng ảnh nhận được có đúng như cam kết không?', a: 'Có, bạn nhận toàn bộ file gốc đã lọc và đúng số ảnh chỉnh sửa kỹ ghi trong hợp đồng.' },
        { q: 'Nếu không ưng ảnh chỉnh sửa thì sao?', a: 'Studio hỗ trợ chỉnh lại miễn phí theo góp ý trong vòng 7 ngày sau khi giao file.' },
      ],
      closingHeading: 'Kết luận',
      closingFragments: [
        'Nhìn chung đây là gói dịch vụ đáng cân nhắc cho những ai muốn một bộ ảnh chỉn chu mà không tốn nhiều công sức chuẩn bị.',
        'Phản hồi tích cực từ khách hàng là động lực để studio tiếp tục nâng cao chất lượng dịch vụ.',
        'Hãy xem trực tiếp mẫu album tại studio để tự cảm nhận chất lượng.',
      ],
      ctaFragments: [
        'Đặt lịch xem mẫu album và tư vấn gói chụp miễn phí.',
        'Chia sẻ trải nghiệm của bạn với studio để giúp những khách hàng khác.',
        'Nhắn tin để nhận báo giá chi tiết từng gói.',
      ],
      tagPool: ['đánh giá', 'review studio', 'album ảnh cưới', 'quay phim cưới', 'khách hàng thực tế'],
      imageKeyword: 'wedding photo album',
      titleIndustrySuffix: () => '',
    },
    'Mẹo hay & Kinh nghiệm': {
      titleCores: [
        'Mẹo chọn studio chụp ảnh cưới ưng ý',
        'Kinh nghiệm chụp ảnh cho bé không quấy khóc',
        'Mẹo chọn màu trang phục lên ảnh đẹp',
        'Kinh nghiệm chọn ngày giờ chụp ngoại cảnh',
        'Mẹo chụp ảnh sản phẩm đẹp cho shop online',
      ],
      angles: ['ai cũng nên biết', 'từ nhiếp ảnh gia lâu năm', 'giúp tiết kiệm chi phí', 'đơn giản mà hiệu quả', 'cho người mới'],
      introFragments: [
        'Một vài mẹo nhỏ có thể tạo ra khác biệt lớn cho bộ ảnh của bạn.',
        'Từ kinh nghiệm thực hiện hàng trăm buổi chụp, ekip studio chia sẻ những điều nên biết trước khi bắt đầu.',
        'Không cần kiến thức chuyên môn, chỉ cần lưu ý đúng chỗ là ảnh đã đẹp hơn rất nhiều.',
      ],
      contextHeading: 'Vì sao những mẹo này hữu ích?',
      contextFragments: [
        'Phần lớn ảnh chưa đẹp không do máy móc mà do chọn sai thời điểm, sai trang phục hoặc thiếu chuẩn bị tâm lý.',
        'Với trẻ nhỏ, thời gian vui vẻ hợp tác thường rất ngắn, nên cần sắp xếp lịch và đạo cụ hợp lý.',
        'Ảnh sản phẩm đẹp giúp shop online nổi bật giữa hàng nghìn sản phẩm tương tự trên sàn.',
      ],
      detailHeading: 'Kinh nghiệm thực tế',
      detailFragments: [
        'Chụp ngoại cảnh nên chọn khung giờ sáng sớm hoặc chiều muộn — ánh sáng vàng mềm giúp da đẹp và ít bóng gắt.',
        'Với bé, nên chụp sau giấc ngủ và bữa ăn, chuẩn bị đồ chơi quen thuộc để bé thấy an tâm.',
        'Trang phục màu pastel, be, trắng kem dễ lên ảnh và dễ phối với nhiều bối cảnh khác nhau.',
        'Chụp sản phẩm nên dùng nguồn sáng lớn, khuếch tán và giữ nền đồng nhất cho cả bộ ảnh.',
      ],
      bulletFragments: [
        'xem portfolio thật và đọc đánh giá của khách cũ',
        'chụp vào giờ vàng để có ánh sáng đẹp',
        'chọn trang phục màu trơn, tránh logo lớn',
        'chuẩn bị đạo cụ mang dấu ấn cá nhân',
        'thống nhất phong cách chỉnh màu ngay từ đầu',
      ],
      bulletsHeading: 'Mẹo nên áp dụng',
      adviceHeading: 'Những điều nên tránh',
      adviceFragments: [
        'chọn studio chỉ vì giá rẻ mà không xem kỹ chất lượng',
        'xếp lịch chụp quá sát ngày cưới',
        'ép trẻ tạo dáng khi bé đã mệt',
      ],
      faq: [
        { q: 'Trời âm u có chụp ngoại cảnh được không?', a: 'Được, trời âm u cho ánh sáng mềm, đều, rất hợp với ảnh chân dung nếu không có mưa.' },
        { q: 'Shop nhỏ có cần thuê studio chụp sản phẩm không?', a: 'Nếu số lượng sản phẩm lớn hoặc cần ảnh đồng bộ, thuê studio giúp tiết kiệm thời gian và ảnh chuyên nghiệp hơn.' },
      ],
      closingHeading: 'Lời kết',
      closingFragments: [
        'Áp dụng những mẹo trên, bạn sẽ thấy buổi chụp nhẹ nhàng và kết quả đẹp hơn mong đợi.',
        'Mỗi buổi chụp là một trải nghiệm — hãy tận hưởng nó thay vì quá áp lực.',
        'Studio luôn sẵn sàng tư vấn thêm nếu bạn còn băn khoăn.',
      ],
      ctaFragments: [
        'Lưu lại bài viết để áp dụng cho buổi chụp sắp tới.',
        'Nhắn tin studio để được tư vấn concept và lịch chụp phù hợp.',
        'Theo dõi fanpage để nhận thêm mẹo từ ekip nhiếp ảnh gia.',
      ],
      tagPool: ['mẹo hay', 'kinh nghiệm chụp ảnh', 'chụp ảnh bé', 'chụp ảnh sản phẩm', 'chọn studio'],
      imageKeyword: 'photographer outdoor golden hour',
      titleIndustrySuffix: () => '',
    },
    'Sự kiện cửa hàng': {
      titleCores: [
        'Workshop nhiếp ảnh cơ bản tại studio',
        'Ngày hội chụp ảnh gia đình miễn phí',
        'Triển lãm ảnh cưới của studio',
        'Buổi trải nghiệm concept chụp ảnh mới',
        'Mini show giới thiệu album và photobook',
      ],
      angles: ['cuối tuần này', 'dành cho khách hàng thân thiết', 'mở cửa tự do', 'số lượng có hạn', 'nhiều quà tặng hấp dẫn'],
      introFragments: [
        'Studio mở cửa chào đón khách hàng đến tham quan, trải nghiệm và giao lưu cùng ekip nhiếp ảnh gia.',
        'Đây là dịp để bạn tận mắt xem quy trình chụp, ánh sáng studio và các mẫu album thực tế.',
        'Sự kiện được tổ chức để tri ân khách hàng đã đồng hành cùng studio trong thời gian qua.',
      ],
      contextHeading: 'Về sự kiện',
      contextFragments: [
        'Không gian studio được bố trí thành nhiều góc concept khác nhau để khách tham dự chụp thử và nhận ảnh ngay.',
        'Ekip sẽ chia sẻ kinh nghiệm thực tế về ánh sáng, bố cục và cách tạo dáng tự nhiên.',
        'Khu trưng bày giới thiệu các mẫu album, photobook và ảnh phóng lớn với nhiều chất liệu khác nhau.',
      ],
      detailHeading: 'Chương trình diễn ra',
      detailFragments: [
        'Buổi sáng là workshop nhiếp ảnh cơ bản, hướng dẫn sử dụng máy ảnh và điện thoại để chụp đẹp hơn.',
        'Buổi chiều là phần chụp ảnh gia đình miễn phí theo lượt, mỗi gia đình nhận 3 ảnh chỉnh sửa.',
        'Xuyên suốt sự kiện có tư vấn gói chụp và ưu đãi riêng cho khách đặt lịch tại chỗ.',
      ],
      bulletFragments: [
        'workshop nhiếp ảnh cơ bản miễn phí',
        'chụp ảnh gia đình nhận file trong ngày',
        'tham quan khu trưng bày album và photobook',
        'ưu đãi riêng cho khách đặt lịch tại sự kiện',
        'quà tặng khung ảnh cho 50 khách đầu tiên',
      ],
      bulletsHeading: 'Hoạt động nổi bật',
      adviceHeading: 'Lưu ý cho khách tham dự',
      adviceFragments: [
        'đăng ký trước để giữ lượt chụp ảnh gia đình',
        'mang theo máy ảnh hoặc điện thoại để thực hành trong workshop',
        'đến sớm để nhận quà tặng dành cho những khách đầu tiên',
      ],
      faq: [
        { q: 'Sự kiện có mất phí không?', a: 'Sự kiện hoàn toàn miễn phí, chỉ cần đăng ký trước để studio sắp xếp lượt chụp.' },
        { q: 'Có thể đưa trẻ nhỏ đi cùng không?', a: 'Có, studio có góc concept riêng cho bé và khu vực nghỉ ngơi cho gia đình.' },
      ],
      closingHeading: 'Hẹn gặp bạn tại studio',
      closingFragments: [
        'Đây là dịp hiếm hoi để vừa học hỏi, vừa có những bức ảnh kỷ niệm cùng gia đình.',
        'Chúng tôi rất mong được gặp bạn và cùng chia sẻ niềm yêu thích với nhiếp ảnh.',
        'Hãy dành một ngày cuối tuần để lưu lại khoảnh khắc đẹp bên những người thân yêu.',
      ],
      ctaFragments: [
        'Đăng ký tham dự ngay hôm nay để giữ chỗ.',
        'Liên hệ hotline hoặc nhắn tin fanpage để được hỗ trợ đăng ký.',
        'Chia sẻ sự kiện tới bạn bè cùng yêu thích chụp ảnh nhé!',
      ],
      tagPool: ['sự kiện', 'workshop nhiếp ảnh', 'chụp ảnh gia đình', 'triển lãm ảnh', 'tri ân khách hàng'],
      imageKeyword: 'photography studio lighting',
      titleIndustrySuffix: () => '',
    },
  },
  'Phụ tùng - Phụ kiện xe tải': {
    'Khuyến mãi': {
      titleCores: [
        'Ưu đãi lớn cho đại lý phụ tùng xe tải',
        'Chiết khấu sỉ phụ tùng xe ben, xe đầu kéo',
        'Ưu đãi đèn LED và đèn điện xe tải',
        'Xả kho phụ kiện và đồ chơi xe tải',
        'Ưu đãi phụ tùng xe khách cho nhà xe',
      ],
      angles: ['giảm đến 25%', 'giá tốt cho đơn số lượng lớn', 'miễn phí vận chuyển toàn quốc', 'tặng kèm quà cho gara', 'số lượng có hạn'],
      introFragments: [
        'Kho hàng vừa triển khai chương trình ưu đãi dành cho đại lý, gara và chủ xe đang tìm nguồn phụ tùng xe tải ổn định với giá tốt.',
        'Dù bạn mua sỉ để phân phối lại hay mua lẻ thay thế cho xe nhà, đây là thời điểm hợp lý để nhập hàng với chi phí nhẹ hơn.',
        'Xe chạy đường dài cần phụ tùng chuẩn và có sẵn khi cần — đợt ưu đãi này giúp đại lý chủ động tồn kho trước mùa cao điểm vận tải.',
      ],
      contextHeading: 'Vì sao nên nhập hàng trong đợt này?',
      contextFragments: [
        'Cuối năm là mùa cao điểm vận tải hàng hóa, nhu cầu thay lọc, má phanh, bóng đèn và phụ tùng hao mòn tăng mạnh, nhập sớm giúp đại lý không bị đứt hàng.',
        'Giá phụ tùng nhập khẩu thường biến động theo tỷ giá, nên các đợt chiết khấu lớn là cơ hội để chốt giá vốn tốt.',
        'Chương trình áp dụng cho phụ tùng xe tải, xe ben, xe đầu kéo và xe khách của nhiều dòng phổ biến như Hino, Isuzu, Hyundai, Howo, Thaco, Dongfeng.',
        'Khách mua lẻ vẫn được hưởng giá ưu đãi, còn đại lý và gara có bảng chiết khấu riêng theo số lượng đơn hàng.',
      ],
      detailHeading: 'Chi tiết chương trình',
      detailFragments: [
        'Nhóm phụ tùng hao mòn như lọc dầu, lọc gió, lọc nhiên liệu, má phanh, bố côn được chiết khấu theo bậc số lượng.',
        'Đèn pha LED, đèn gầm, đèn hậu, đèn xi nhan và đèn nóc cabin có giá sỉ riêng cho đơn từ 10 bộ trở lên.',
        'Phụ kiện và đồ chơi xe tải như ốp inox, còi hơi, gương cầu, thảm lót cabin, rèm cabin được giảm giá theo combo.',
      ],
      bulletFragments: [
        'chiết khấu theo bậc số lượng cho đại lý và gara',
        'giá lẻ ưu đãi cho chủ xe và tài xế',
        'giao hàng toàn quốc qua chành xe và nhà xe',
        'đổi trả nếu phụ tùng không đúng mã, sai đời xe',
        'hỗ trợ tra mã phụ tùng theo số khung, số máy',
      ],
      bulletsHeading: 'Quyền lợi khi đặt hàng',
      adviceHeading: 'Lưu ý khi đặt hàng',
      adviceFragments: [
        'gửi kèm ảnh tem, mã phụ tùng cũ hoặc số khung để tra đúng hàng',
        'đại lý nên đặt sớm để được ưu tiên xuất kho trong mùa cao điểm',
        'kiểm tra hàng ngay khi nhận và báo lại trong 3 ngày nếu có sai sót',
      ],
      faq: [
        { q: 'Mua lẻ 1 món có được hưởng ưu đãi không?', a: 'Có, khách mua lẻ vẫn được giảm giá theo chương trình; mức chiết khấu sâu hơn áp dụng cho đơn sỉ theo số lượng.' },
        { q: 'Hàng gửi về tỉnh mất bao lâu?', a: 'Thông thường 1–3 ngày tùy tuyến, kho gửi qua chành xe, nhà xe khách hoặc đơn vị vận chuyển theo yêu cầu của khách.' },
      ],
      closingHeading: 'Lời kết',
      closingFragments: [
        'Một nguồn phụ tùng ổn định, đúng mã và giá tốt giúp xe ít nằm gara và đại lý giữ chân được khách hàng lâu dài.',
        'Chúng tôi mong được trở thành nhà cung cấp phụ tùng tin cậy cho đại lý, gara và các chủ xe trên khắp cả nước.',
        'Ưu đãi có thời hạn, hãy liên hệ sớm để nhận bảng giá sỉ mới nhất.',
      ],
      ctaFragments: [
        'Gọi hotline hoặc nhắn Zalo để nhận bảng giá sỉ và tra mã phụ tùng miễn phí.',
        'Đại lý, gara liên hệ ngay để được tư vấn chính sách chiết khấu riêng.',
        'Ghé kho để xem hàng trực tiếp và nhận ưu đãi ngay tại chỗ.',
      ],
      tagPool: ['phụ tùng xe tải', 'giá sỉ', 'đại lý phụ tùng', 'đèn LED xe tải', 'khuyến mãi'],
      imageKeyword: 'truck spare parts warehouse',
      titleIndustrySuffix: () => '',
    },
    'Hướng dẫn sử dụng': {
      titleCores: [
        'Cách tra đúng mã phụ tùng xe tải',
        'Hướng dẫn lắp đèn LED cho xe tải và xe đầu kéo',
        'Cách thay lọc dầu, lọc gió xe tải đúng kỹ thuật',
        'Hướng dẫn kiểm tra hệ thống phanh hơi xe ben',
        'Cách lắp đặt phụ kiện cabin xe khách',
      ],
      angles: ['cho tài xế và chủ xe', 'từng bước chi tiết', 'theo kinh nghiệm thợ gara', 'tránh mua nhầm hàng', 'an toàn và tiết kiệm'],
      introFragments: [
        'Phụ tùng xe tải có rất nhiều mã khác nhau theo dòng xe và đời xe, chỉ cần sai một chi tiết là lắp không vừa hoặc nhanh hỏng.',
        'Bài viết tổng hợp hướng dẫn thực tế từ đội ngũ kỹ thuật, giúp tài xế và chủ xe tự kiểm tra, thay thế đúng cách.',
        'Nắm được vài nguyên tắc cơ bản, bạn sẽ tiết kiệm đáng kể thời gian và chi phí sửa chữa cho xe tải, xe ben, xe khách.',
      ],
      contextHeading: 'Vì sao cần làm đúng kỹ thuật?',
      contextFragments: [
        'Xe tải và xe đầu kéo vận hành liên tục với tải trọng lớn, phụ tùng lắp sai hoặc kém chất lượng có thể gây hỏng dây chuyền sang các bộ phận khác.',
        'Hệ thống điện xe tải dùng điện 24V, khác xe con 12V, nên lắp đèn và phụ kiện điện cần chọn đúng điện áp để tránh cháy bóng, chập dây.',
        'Bảo dưỡng định kỳ đúng hạn giúp xe giữ được công suất, tiết kiệm nhiên liệu và hạn chế nằm đường giữa chuyến.',
      ],
      detailHeading: 'Các bước thực hiện',
      detailFragments: [
        'Để tra mã phụ tùng, hãy chụp lại tem trên chi tiết cũ, số khung (VIN) và số máy của xe rồi gửi cho kho để đối chiếu catalogue chính hãng.',
        'Khi lắp đèn LED, ngắt nguồn ắc quy trước, kiểm tra điện áp 24V, dùng rơ-le và cầu chì riêng cho cụm đèn công suất lớn như đèn gầm, đèn trợ sáng.',
        'Thay lọc dầu nên làm khi máy còn ấm, xả hết dầu cũ, bôi một lớp dầu mới lên gioăng lọc và siết vừa tay để tránh rò rỉ.',
        'Với phanh hơi, kiểm tra áp suất bình hơi, xả nước đọng hằng ngày và theo dõi độ mòn má phanh, tang trống định kỳ.',
      ],
      bulletFragments: [
        'luôn đối chiếu mã phụ tùng với số khung, số máy',
        'chọn đèn và phụ kiện điện đúng điện áp 24V',
        'dùng rơ-le, cầu chì riêng cho đèn công suất lớn',
        'thay lọc theo số km khuyến nghị của nhà sản xuất',
        'xả nước bình hơi phanh hằng ngày',
      ],
      bulletsHeading: 'Nguyên tắc cần nhớ',
      adviceHeading: 'Những lỗi thường gặp',
      adviceFragments: [
        'mua phụ tùng theo tên gọi mà không kiểm tra mã, dẫn đến lắp không vừa',
        'đấu đèn trực tiếp vào dây zin không qua rơ-le khiến nóng dây, chập điện',
        'kéo dài thời gian thay lọc làm động cơ mòn nhanh và hao nhiên liệu',
      ],
      faq: [
        { q: 'Không biết mã phụ tùng thì có mua được không?', a: 'Được, bạn chỉ cần gửi ảnh chi tiết cũ, ảnh tem hoặc số khung xe, kỹ thuật viên sẽ tra giúp đúng mã.' },
        { q: 'Đèn LED xe con có lắp được cho xe tải không?', a: 'Không nên, vì đa số xe tải dùng điện 24V; hãy chọn đèn ghi rõ dải điện áp 12–24V hoặc 24V.' },
      ],
      closingHeading: 'Tổng kết',
      closingFragments: [
        'Làm đúng kỹ thuật ngay từ đầu giúp xe vận hành bền bỉ và giảm chi phí sửa chữa về lâu dài.',
        'Nếu chưa chắc chắn, đừng ngại liên hệ đội ngũ kỹ thuật để được hướng dẫn trước khi tự thay thế.',
        'Phụ tùng đúng mã cộng với lắp đặt đúng cách là chìa khóa cho những chuyến hàng an toàn.',
      ],
      ctaFragments: [
        'Gửi ảnh phụ tùng cũ qua Zalo để được tra mã miễn phí.',
        'Liên hệ kho để đặt đúng phụ tùng cho dòng xe của bạn.',
        'Theo dõi fanpage để xem thêm video hướng dẫn từ thợ gara.',
      ],
      tagPool: ['hướng dẫn', 'tra mã phụ tùng', 'đèn LED 24V', 'bảo dưỡng xe tải', 'phanh hơi'],
      imageKeyword: 'truck mechanic repair',
      titleIndustrySuffix: () => '',
    },
    'Tin tức ngành hàng': {
      titleCores: [
        'Thị trường phụ tùng xe tải cuối năm',
        'Nhu cầu đèn LED cho xe tải và xe đầu kéo tăng mạnh',
        'Phụ tùng xe ben hút hàng nhờ công trình hạ tầng',
        'Nhà xe khách đầu tư nâng cấp nội thất và phụ kiện',
        'Xu hướng độ đồ chơi xe đầu kéo',
      ],
      angles: ['và những điều đại lý cần biết', 'theo ghi nhận từ kho hàng', 'tác động tới giá phụ tùng', 'cơ hội cho nhà phân phối', 'trong mùa cao điểm vận tải'],
      introFragments: [
        'Ngành vận tải hàng hóa và hành khách tiếp tục tăng trưởng, kéo theo nhu cầu phụ tùng, phụ kiện cho xe tải, xe ben, xe đầu kéo và xe khách.',
        'Từ đại lý tỉnh đến gara sửa chữa, thị trường phụ tùng xe tải đang có nhiều chuyển động đáng chú ý.',
        'Kho hàng tổng hợp những thay đổi nổi bật dựa trên đơn đặt hàng sỉ và lẻ trong thời gian gần đây.',
      ],
      contextHeading: 'Bối cảnh thị trường',
      contextFragments: [
        'Các dự án cao tốc, cảng biển và khu công nghiệp được đẩy mạnh khiến xe ben, xe đầu kéo hoạt động với tần suất cao, phụ tùng hao mòn cần thay thường xuyên hơn.',
        'Chủ xe ngày càng chú trọng an toàn khi chạy đêm, nên đèn LED, đèn gầm, đèn cảnh báo và camera hành trình được lắp nhiều hơn.',
        'Nhà xe khách cạnh tranh bằng chất lượng dịch vụ, đầu tư rèm cabin, thảm sàn, đèn trần LED và các phụ kiện tiện nghi cho hành khách.',
        'Giá phụ tùng nhập khẩu chịu ảnh hưởng từ tỷ giá và chi phí logistics, khiến đại lý có xu hướng nhập sớm để giữ giá vốn.',
      ],
      detailHeading: 'Điểm đáng chú ý',
      detailFragments: [
        'Nhóm hàng hao mòn như lọc, má phanh, bố côn, dây curoa vẫn chiếm tỷ trọng lớn nhất trong đơn sỉ của các đại lý.',
        'Đèn LED 24V tiết kiệm điện, tuổi thọ cao đang dần thay thế bóng halogen trên xe tải và xe đầu kéo đời mới.',
        'Đồ chơi xe đầu kéo như ốp inox, còi hơi, đèn nóc, logo trang trí được tài xế trẻ ưa chuộng để tạo dấu ấn cho xe.',
      ],
      bulletFragments: [
        'nhu cầu phụ tùng hao mòn tăng theo mùa vận tải',
        'đèn LED 24V thay thế dần bóng halogen',
        'xe ben, xe đầu kéo hút hàng nhờ công trình hạ tầng',
        'nhà xe khách đầu tư nội thất và tiện nghi',
        'đại lý nhập sớm để giữ giá vốn',
      ],
      bulletsHeading: 'Xu hướng nổi bật',
      adviceHeading: 'Gợi ý cho đại lý và gara',
      adviceFragments: [
        'ưu tiên tồn kho nhóm hàng hao mòn của các dòng xe phổ biến trong khu vực',
        'chọn nhà phân phối có nguồn hàng ổn định và hỗ trợ tra mã nhanh',
        'bổ sung đèn LED và đồ chơi xe để tăng biên lợi nhuận',
      ],
      faq: [
        { q: 'Giá phụ tùng xe tải có tăng trong thời gian tới không?', a: 'Giá có thể biến động theo tỷ giá và chi phí vận chuyển, vì vậy đại lý nên theo dõi bảng giá và nhập hàng vào các đợt chiết khấu.' },
        { q: 'Nên chọn phụ tùng chính hãng hay hàng thay thế?', a: 'Tùy chi tiết: bộ phận liên quan an toàn như phanh nên ưu tiên chính hãng hoặc thương hiệu uy tín; phụ kiện trang trí có thể chọn hàng thay thế chất lượng tốt.' },
      ],
      closingHeading: 'Lời kết',
      closingFragments: [
        'Thị trường nhiều cơ hội nhưng cũng nhiều cạnh tranh, nguồn hàng ổn định và đúng mã là lợi thế lớn nhất của mỗi đại lý.',
        'Kho hàng sẽ tiếp tục cập nhật thông tin thị trường để đại lý và gara chủ động kế hoạch nhập hàng.',
        'Hy vọng những thông tin trên giúp bạn có thêm góc nhìn để kinh doanh phụ tùng hiệu quả hơn.',
      ],
      ctaFragments: [
        'Đăng ký nhận bảng giá sỉ hằng tháng qua Zalo.',
        'Liên hệ để được tư vấn danh mục hàng phù hợp với khu vực của bạn.',
        'Theo dõi fanpage để cập nhật tin tức thị trường phụ tùng.',
      ],
      tagPool: ['thị trường phụ tùng', 'xe đầu kéo', 'xe ben', 'xe khách', 'nhà phân phối'],
      imageKeyword: 'semi truck highway',
      titleIndustrySuffix: () => '',
    },
    'Đánh giá sản phẩm': {
      titleCores: [
        'Đánh giá đèn pha LED 24V cho xe tải',
        'Trải nghiệm bộ má phanh thay thế cho xe đầu kéo',
        'Review còi hơi và đèn nóc cabin xe tải',
        'Đánh giá lọc nhiên liệu cho xe ben',
        'Trải nghiệm rèm và thảm cabin cho xe khách',
      ],
      angles: ['sau 3 tháng sử dụng', 'từ tài xế đường dài', 'ưu và nhược điểm', 'có đáng tiền không', 'so với hàng zin'],
      introFragments: [
        'Trước khi nhập số lượng lớn hay thay cho xe nhà, ai cũng muốn biết phụ tùng có thật sự bền và đáng tiền.',
        'Bài viết tổng hợp phản hồi thực tế từ tài xế, chủ xe và gara đã sử dụng sản phẩm trên xe tải, xe ben, xe khách.',
        'Chúng tôi đánh giá thẳng thắn từng tiêu chí để đại lý và chủ xe có cái nhìn khách quan.',
      ],
      contextHeading: 'Tổng quan sản phẩm',
      contextFragments: [
        'Sản phẩm phù hợp với nhiều dòng xe phổ biến như Hino, Isuzu, Hyundai, Howo, Thaco, Dongfeng, có đầy đủ mã theo đời xe.',
        'Điều kiện thử nghiệm là xe chạy tuyến dài Bắc – Nam, tải nặng, thường xuyên chạy đêm và qua đèo dốc.',
        'Tiêu chí đánh giá gồm độ vừa vặn khi lắp, độ bền, hiệu quả sử dụng và mức giá so với hàng chính hãng.',
      ],
      detailHeading: 'Đánh giá chi tiết',
      detailFragments: [
        'Đèn pha LED cho ánh sáng trắng, chiếu xa và rộng hơn rõ rệt so với bóng halogen, không gây chói xe đối diện khi chỉnh góc đúng.',
        'Má phanh ăn đều, ít tiếng kêu, sau hơn 30.000 km độ mòn vẫn trong mức cho phép khi chạy đèo dốc thường xuyên.',
        'Điểm cần lưu ý là một số mã cần chỉnh lại giắc cắm hoặc giá đỡ khi lắp cho xe đời cũ.',
      ],
      bulletFragments: [
        'lắp vừa khít, đúng mã theo đời xe',
        'độ bền tốt khi chạy tải nặng, đường dài',
        'tiết kiệm điện với đèn LED 24V',
        'giá thấp hơn đáng kể so với hàng zin',
        'được bảo hành và đổi trả rõ ràng',
      ],
      bulletsHeading: 'Điểm cộng nổi bật',
      adviceHeading: 'Điều cần cân nhắc',
      adviceFragments: [
        'kiểm tra kỹ mã và đời xe trước khi đặt hàng',
        'nên lắp tại gara có kinh nghiệm với xe tải để đảm bảo đúng kỹ thuật',
        'với bộ phận an toàn như phanh, hãy thay theo bộ thay vì thay lẻ từng bánh',
      ],
      faq: [
        { q: 'Phụ tùng thay thế có bền bằng hàng zin không?', a: 'Hàng thay thế từ thương hiệu uy tín có độ bền gần tương đương với giá mềm hơn; quan trọng là chọn đúng mã và lắp đúng kỹ thuật.' },
        { q: 'Sản phẩm được bảo hành như thế nào?', a: 'Tùy loại hàng, thời gian bảo hành từ 3 đến 12 tháng; lỗi do nhà sản xuất được đổi mới trong thời gian bảo hành.' },
      ],
      closingHeading: 'Kết luận',
      closingFragments: [
        'Nhìn chung đây là lựa chọn đáng cân nhắc cho chủ xe muốn cân bằng giữa chất lượng và chi phí vận hành.',
        'Phản hồi tích cực từ tài xế là cơ sở để kho tiếp tục chọn lọc nguồn hàng chất lượng.',
        'Đại lý có thể đặt mẫu để tự kiểm tra trước khi nhập số lượng lớn.',
      ],
      ctaFragments: [
        'Liên hệ để nhận báo giá sỉ và lẻ cho sản phẩm.',
        'Đặt hàng mẫu để kiểm tra chất lượng trước khi nhập số lượng.',
        'Chia sẻ trải nghiệm của bạn để giúp các chủ xe khác lựa chọn.',
      ],
      tagPool: ['đánh giá', 'đèn LED xe tải', 'má phanh', 'phụ kiện cabin', 'tài xế đường dài'],
      imageKeyword: 'truck headlight',
      titleIndustrySuffix: () => '',
    },
    'Mẹo hay & Kinh nghiệm': {
      titleCores: [
        'Kinh nghiệm chọn nhà phân phối phụ tùng xe tải uy tín',
        'Mẹo phân biệt phụ tùng xe tải chính hãng và hàng nhái',
        'Kinh nghiệm bảo dưỡng xe đầu kéo chạy đường dài',
        'Mẹo chọn đèn LED xe tải sáng mà bền',
        'Kinh nghiệm mở đại lý phụ tùng xe tải',
      ],
      angles: ['ai cũng nên biết', 'từ chủ gara lâu năm', 'giúp tiết kiệm chi phí', 'cho người mới vào nghề', 'tránh mất tiền oan'],
      introFragments: [
        'Một vài kinh nghiệm nhỏ có thể giúp chủ xe và đại lý tránh được những khoản chi phí không đáng có.',
        'Từ kinh nghiệm phân phối phụ tùng cho hàng trăm đại lý, gara và nhà xe, chúng tôi chia sẻ những điều nên biết.',
        'Không cần là thợ chuyên nghiệp, chỉ cần lưu ý đúng chỗ là bạn đã chọn được phụ tùng tốt hơn.',
      ],
      contextHeading: 'Vì sao những kinh nghiệm này hữu ích?',
      contextFragments: [
        'Thị trường phụ tùng xe tải có rất nhiều hàng trôi nổi, bao bì giống hàng chính hãng nhưng chất lượng kém xa.',
        'Xe đầu kéo và xe khách chạy đường dài, một hỏng hóc giữa đường có thể gây thiệt hại lớn hơn nhiều so với giá phụ tùng.',
        'Với đại lý, chọn đúng nguồn hàng và đúng danh mục quyết định vòng quay vốn và uy tín với khách hàng.',
      ],
      detailHeading: 'Kinh nghiệm thực tế',
      detailFragments: [
        'Hàng chính hãng thường có tem chống giả, mã vạch truy xuất được, chữ in sắc nét và vật liệu đồng đều; hàng nhái hay có mép đúc thô, sai font chữ.',
        'Chọn đèn LED nên xem chip, tản nhiệt bằng nhôm đúc và chuẩn chống nước IP67 trở lên, tránh đèn quá rẻ nhưng công suất ghi ảo.',
        'Xe chạy đường dài nên có sổ theo dõi bảo dưỡng, ghi rõ số km thay lọc, dầu, má phanh để không bỏ sót hạng mục.',
        'Mở đại lý nên bắt đầu từ nhóm hàng hao mòn của các dòng xe phổ biến trong khu vực trước khi mở rộng sang đồ chơi, phụ kiện.',
      ],
      bulletFragments: [
        'kiểm tra tem chống giả và mã vạch',
        'chọn nhà phân phối hỗ trợ tra mã và đổi trả',
        'ưu tiên đèn LED có tản nhiệt tốt, chuẩn IP67',
        'ghi sổ bảo dưỡng theo số km',
        'tồn kho theo dòng xe phổ biến tại địa phương',
      ],
      bulletsHeading: 'Kinh nghiệm nên áp dụng',
      adviceHeading: 'Những điều nên tránh',
      adviceFragments: [
        'ham rẻ mua phụ tùng an toàn như phanh, lốp không rõ nguồn gốc',
        'nhập quá nhiều mã ít người dùng khiến tồn kho lâu',
        'tự độ đèn công suất lớn mà không nâng cấp dây điện, rơ-le',
      ],
      faq: [
        { q: 'Mở đại lý phụ tùng xe tải cần vốn bao nhiêu?', a: 'Tùy quy mô, đại lý nhỏ có thể bắt đầu với nhóm hàng hao mòn phổ biến; nhà phân phối sẽ hỗ trợ tư vấn danh mục phù hợp với số vốn.' },
        { q: 'Làm sao biết nhà phân phối có uy tín?', a: 'Hãy xem nguồn gốc hàng, chính sách đổi trả, khả năng tra mã nhanh và hỏi thêm ý kiến từ các gara, đại lý đã hợp tác.' },
      ],
      closingHeading: 'Lời kết',
      closingFragments: [
        'Áp dụng những kinh nghiệm trên, bạn sẽ chọn được phụ tùng tốt hơn và kinh doanh hiệu quả hơn.',
        'Một chiếc xe được chăm sóc đúng cách sẽ mang lại nhiều chuyến hàng an toàn và lợi nhuận ổn định.',
        'Kho hàng luôn sẵn sàng tư vấn thêm nếu bạn còn băn khoăn.',
      ],
      ctaFragments: [
        'Lưu lại bài viết để áp dụng khi chọn mua phụ tùng.',
        'Liên hệ để được tư vấn danh mục hàng cho đại lý mới.',
        'Theo dõi fanpage để nhận thêm kinh nghiệm từ thợ gara và tài xế.',
      ],
      tagPool: ['kinh nghiệm', 'phân biệt hàng nhái', 'mở đại lý', 'bảo dưỡng xe đầu kéo', 'đèn LED xe tải'],
      imageKeyword: 'truck engine maintenance',
      titleIndustrySuffix: () => '',
    },
    'Sự kiện cửa hàng': {
      titleCores: [
        'Hội nghị khách hàng đại lý phụ tùng xe tải',
        'Ngày hội tri ân tài xế và chủ xe',
        'Khai trương kho phụ tùng xe tải mới',
        'Buổi giới thiệu dòng đèn LED xe tải mới',
        'Ngày hội kiểm tra xe tải miễn phí',
      ],
      angles: ['cuối tuần này', 'dành cho đại lý và gara', 'nhiều quà tặng hấp dẫn', 'số lượng có hạn', 'mở cửa tự do'],
      introFragments: [
        'Kho hàng tổ chức sự kiện để gặp gỡ, tri ân đại lý, gara, nhà xe và các bác tài đã đồng hành trong thời gian qua.',
        'Đây là dịp để bạn xem trực tiếp các dòng phụ tùng, đèn và phụ kiện mới, đồng thời nhận ưu đãi chỉ có tại sự kiện.',
        'Sự kiện mở cửa cho tất cả khách hàng mua sỉ và mua lẻ quan tâm đến phụ tùng xe tải, xe ben, xe đầu kéo và xe khách.',
      ],
      contextHeading: 'Về sự kiện',
      contextFragments: [
        'Khu trưng bày được chia theo nhóm hàng: phụ tùng máy, hệ thống phanh, hệ thống điện và đèn, phụ kiện cabin và đồ chơi xe.',
        'Đội ngũ kỹ thuật có mặt để tư vấn, tra mã phụ tùng và giải đáp thắc mắc về bảo dưỡng xe.',
        'Khu vực bãi xe rộng cho phép tài xế đưa xe vào kiểm tra đèn, điện, phanh miễn phí.',
      ],
      detailHeading: 'Chương trình diễn ra',
      detailFragments: [
        'Buổi sáng là hội nghị đại lý, giới thiệu chính sách chiết khấu mới và các dòng sản phẩm sắp ra mắt.',
        'Buổi chiều là ngày hội kiểm tra xe miễn phí, trình diễn đèn LED và hướng dẫn lắp đặt phụ kiện.',
        'Xuyên suốt sự kiện có bốc thăm trúng thưởng và ưu đãi riêng cho đơn hàng đặt tại chỗ.',
      ],
      bulletFragments: [
        'giới thiệu chính sách đại lý mới',
        'kiểm tra đèn, điện, phanh xe miễn phí',
        'trình diễn đèn LED và phụ kiện mới',
        'ưu đãi riêng cho đơn đặt tại sự kiện',
        'bốc thăm trúng thưởng cho bác tài',
      ],
      bulletsHeading: 'Hoạt động nổi bật',
      adviceHeading: 'Lưu ý cho khách tham dự',
      adviceFragments: [
        'đại lý đăng ký trước để được xếp chỗ tại hội nghị',
        'mang theo giấy tờ xe nếu muốn kiểm tra và tra mã phụ tùng',
        'đến sớm để nhận quà tặng dành cho những khách đầu tiên',
      ],
      faq: [
        { q: 'Sự kiện có mất phí không?', a: 'Sự kiện hoàn toàn miễn phí, đại lý chỉ cần đăng ký trước để kho chuẩn bị chỗ ngồi và tài liệu.' },
        { q: 'Xe đầu kéo có vào bãi kiểm tra được không?', a: 'Được, bãi xe đủ rộng cho xe đầu kéo, xe ben và xe khách vào kiểm tra.' },
      ],
      closingHeading: 'Hẹn gặp bạn tại kho',
      closingFragments: [
        'Đây là dịp để kết nối, chia sẻ kinh nghiệm và cùng nhau phát triển thị trường phụ tùng xe tải.',
        'Chúng tôi rất mong được gặp các đại lý, gara và bác tài tại sự kiện.',
        'Hãy dành chút thời gian ghé kho để nhận ưu đãi và kiểm tra xe miễn phí.',
      ],
      ctaFragments: [
        'Đăng ký tham dự ngay qua hotline hoặc Zalo.',
        'Chia sẻ sự kiện tới các bác tài và đại lý trong nhóm của bạn.',
        'Liên hệ để nhận thư mời hội nghị đại lý.',
      ],
      tagPool: ['sự kiện', 'hội nghị đại lý', 'tri ân tài xế', 'kiểm tra xe miễn phí', 'phụ tùng xe tải'],
      imageKeyword: 'truck parts store',
      titleIndustrySuffix: () => '',
    },
  },
}

// Ngành Thiết kế - Thi công dùng lại bộ bài đồ gỗ nội thất cho 6 chủ đề chung (sofa, bàn ăn gỗ… trùng nhóm sản phẩm); bài
// riêng về công trình đã làm nằm ở chủ đề "Dự án đã thi công" (xem generateProjectStoryArticle).
INDUSTRY_TOPIC_OVERRIDES['Thiết kế - Thi công nội thất'] = INDUSTRY_TOPIC_OVERRIDES['Nội thất - Trang trí']

/**
 * Ngành Âm thanh (loa, micro, tai nghe, thiết bị xử lý) — 3 chủ đề "Tin tức ngành hàng", "Mẹo hay & Kinh nghiệm" (tư vấn
 * chọn mua) và "Hướng dẫn sử dụng" khớp 3 blog hay gặp ở store âm thanh: Tin tức âm thanh / Tư vấn chọn mua / Hướng dẫn.
 */
INDUSTRY_TOPIC_OVERRIDES['Âm thanh - Loa, Micro, Tai nghe'] = {
  'Tin tức ngành hàng': {
    titleCores: [
      'Xu hướng loa karaoke gia đình',
      'Loa bluetooth di động thế hệ mới',
      'Tai nghe chống ồn chủ động',
      'Công nghệ vang số và chống hú',
      'Thị trường thiết bị âm thanh gia đình',
    ],
    angles: ['năm nay có gì mới', 'đáng chú ý nhất hiện nay', 'người dùng Việt đang quan tâm', 'thay đổi ra sao', 'qua góc nhìn chuyên gia'],
    introFragments: [
      'Nhu cầu nghe nhạc và hát karaoke tại nhà của người Việt chưa bao giờ giảm, kéo theo hàng loạt dòng thiết bị âm thanh mới ra mắt mỗi năm.',
      'Các hãng âm thanh liên tục cập nhật công nghệ kết nối, pin và xử lý âm thanh để thiết bị nhỏ gọn hơn mà vẫn cho âm lượng lớn.',
      'Từ loa kéo, loa bluetooth đến tai nghe TWS, thị trường âm thanh đang có nhiều chuyển động đáng chú ý mà người dùng nên biết trước khi mua.',
    ],
    contextHeading: 'Bối cảnh thị trường',
    contextFragments: [
      'Không gian sống thu hẹp ở các căn hộ chung cư khiến người dùng ưu tiên loa nhỏ gọn, dễ di chuyển nhưng vẫn đủ hay để hát karaoke cuối tuần.',
      'Kết nối Bluetooth 5.3 và chuẩn codec mới giúp âm thanh không dây gần với chất lượng có dây, xóa bớt rào cản của người nghe kỹ tính.',
      'Các hãng như JBL, Harman Kardon tập trung vào loa di động và soundbar, trong khi Acnos, Kadma đẩy mạnh dòng loa kéo, loa xách tay karaoke.',
    ],
    detailHeading: 'Những điểm mới đáng chú ý',
    detailFragments: [
      'Vang số tích hợp chống hú tự động giúp người không rành kỹ thuật vẫn chỉnh được dàn karaoke ổn định chỉ bằng vài nút bấm.',
      'Loa party ngày càng chú trọng hiệu ứng đèn LED đồng bộ theo nhạc, biến phòng khách thành không gian tiệc tại gia.',
      'Tai nghe TWS tầm trung đã có chống ồn chủ động, thời lượng pin cả ngày — tính năng trước đây chỉ có ở dòng cao cấp.',
      'Soundbar kết hợp loa sub không dây trở thành lựa chọn phổ biến thay cho dàn âm thanh nhiều cục cồng kềnh.',
    ],
    bulletFragments: [
      'loa karaoke ngày càng nhỏ gọn nhưng công suất lớn hơn',
      'micro không dây dùng sóng UHF ổn định, ít bị nhiễu',
      'pin loa di động phổ biến từ 12 đến 24 giờ',
      'ứng dụng điện thoại cho phép chỉnh EQ và echo trực tiếp',
      'chuẩn chống nước IP67 xuất hiện nhiều ở loa bluetooth',
    ],
    bulletsHeading: 'Tóm tắt nhanh',
    adviceHeading: 'Người mua nên lưu ý gì?',
    adviceFragments: [
      'chọn thiết bị theo diện tích phòng và nhu cầu thực tế, không chạy theo công suất danh nghĩa',
      'ưu tiên hàng chính hãng có tem bảo hành, tránh hàng trôi nổi giá rẻ bất thường',
      'nghe thử trực tiếp tại showroom trước khi quyết định với các dòng loa karaoke',
    ],
    faq: [
      { q: 'Loa bluetooth có thay được dàn karaoke không?', a: 'Với phòng nhỏ và nhu cầu hát vui, loa xách tay karaoke kèm micro không dây là đủ. Phòng lớn hoặc hát thường xuyên vẫn nên dùng dàn loa, vang số và cục đẩy riêng.' },
      { q: 'Có nên chờ mẫu mới ra rồi mới mua?', a: 'Nếu mẫu hiện tại đã đáp ứng đủ nhu cầu thì không cần chờ. Mẫu cũ khi có mẫu mới thường được giảm giá khá tốt.' },
    ],
    closingHeading: 'Lời kết',
    closingFragments: [
      'Thị trường âm thanh thay đổi nhanh, nhưng tiêu chí chọn mua vẫn là nghe hay, bền và phù hợp không gian sử dụng.',
      'Theo dõi chuyên mục tin tức âm thanh để cập nhật sớm các dòng sản phẩm mới.',
      'Mọi thắc mắc về thiết bị, đội ngũ kỹ thuật luôn sẵn sàng tư vấn miễn phí.',
    ],
    ctaFragments: [
      'Ghé showroom để nghe thử trực tiếp các mẫu loa, micro mới nhất.',
      'Gọi hotline để được tư vấn cấu hình phù hợp với không gian nhà bạn.',
      'Theo dõi fanpage để không bỏ lỡ tin tức và ưu đãi mới.',
    ],
    tagPool: ['tin tức âm thanh', 'loa karaoke', 'loa bluetooth', 'tai nghe', 'xu hướng'],
    imageKeyword: 'studio monitor speakers|hifi speakers|audio mixer|stereo speakers',
    titleIndustrySuffix: () => '',
  },
  'Mẹo hay & Kinh nghiệm': {
    titleCores: [
      'Cách chọn loa karaoke gia đình',
      'Kinh nghiệm chọn micro không dây',
      'Nên mua loa kéo hay loa xách tay',
      'Cách chọn tai nghe phù hợp nhu cầu',
      'Cách phối dàn karaoke loa, vang số, cục đẩy',
    ],
    angles: ['không lo mua sai', 'theo từng tầm giá', 'từ chuyên gia âm thanh', 'cho người mới bắt đầu', 'mới nhất năm nay'],
    introFragments: [
      'Chọn thiết bị âm thanh không khó nếu bạn biết rõ mình cần gì và dùng trong không gian nào.',
      'Nhiều khách hàng mua loa công suất thật lớn rồi mới thấy phòng bị ù, tiếng không rõ — một lỗi rất phổ biến có thể tránh được.',
      'Bài tư vấn này tổng hợp kinh nghiệm thực tế từ đội ngũ kỹ thuật sau hàng nghìn lần lắp đặt dàn âm thanh cho gia đình.',
    ],
    contextHeading: 'Xác định nhu cầu trước khi mua',
    contextFragments: [
      'Hãy trả lời ba câu hỏi: dùng trong phòng bao nhiêu mét vuông, chủ yếu để nghe nhạc hay hát karaoke, và có cần mang đi dã ngoại không.',
      'Phòng dưới 20m² chỉ cần loa công suất vừa phải; phòng trên 30m² nên tính tới loa sub để tiếng bass đầy đặn hơn.',
      'Nếu hát karaoke thường xuyên, khoản đầu tư vào micro và vang số quan trọng không kém chiếc loa.',
    ],
    detailHeading: 'Tiêu chí chọn theo từng loại thiết bị',
    detailFragments: [
      'Loa: nên xem dải tần, độ nhạy và kích thước bass thay vì chỉ nhìn con số công suất trên hộp.',
      'Micro không dây: chọn sóng UHF, có chống hú và khoảng cách thu ít nhất 30–50m để hát thoải mái khắp phòng.',
      'Tai nghe: TWS tiện lợi khi di chuyển, chụp tai cho âm trường rộng khi nghe lâu, tai nghe thể thao cần chống mồ hôi và bám tai chắc.',
      'Vang số và cục đẩy: chọn công suất cục đẩy lớn hơn khoảng 1,5 lần công suất loa để dàn chạy khỏe, không bị méo tiếng.',
    ],
    bulletFragments: [
      'phòng 15–20m²: loa karaoke 2 đường tiếng bass 25–30cm',
      'phòng 25–35m²: thêm loa sub điện để tăng độ dày âm trầm',
      'dã ngoại, ngoài trời: loa kéo hoặc loa xách tay pin từ 8 giờ',
      'nghe nhạc trong phòng ngủ: loa bookshelf hoặc loa bluetooth mini',
      'xem phim: soundbar kèm loa sub không dây',
    ],
    bulletsHeading: 'Gợi ý nhanh theo không gian',
    adviceHeading: 'Sai lầm thường gặp khi mua thiết bị âm thanh',
    adviceFragments: [
      'chọn loa công suất quá lớn so với diện tích phòng khiến âm bị dội, ù tai',
      'mua micro rẻ đi kèm dàn đắt khiến tiếng hát mỏng, dễ hú',
      'bỏ qua chân loa, kệ loa khiến loa đặt sai độ cao và âm thanh bị mất chi tiết',
    ],
    faq: [
      { q: 'Ngân sách 10 triệu nên mua gì để hát karaoke?', a: 'Có thể chọn 1 loa xách tay karaoke tốt kèm 2 micro không dây, hoặc cặp loa karaoke gia đình cỡ vừa kết hợp vang số cơ bản.' },
      { q: 'Loa JBL có hát karaoke được không?', a: 'Một số dòng loa party của JBL có cổng micro và hát được, nhưng nếu ưu tiên karaoke thì các dòng chuyên dụng như Acnos, Kadma sẽ cho tiếng hát dễ nghe hơn.' },
    ],
    closingHeading: 'Tổng kết',
    closingFragments: [
      'Thiết bị phù hợp nhất là thiết bị khớp với không gian và thói quen sử dụng của gia đình bạn.',
      'Đừng ngại nhờ kỹ thuật viên tư vấn cấu hình trước khi mua, việc này hoàn toàn miễn phí.',
      'Một dàn âm thanh được phối đúng sẽ dùng bền và hay hơn nhiều so với mua lẻ từng món không đồng bộ.',
    ],
    ctaFragments: [
      'Gửi diện tích phòng và nhu cầu sử dụng qua fanpage để nhận gợi ý cấu hình miễn phí.',
      'Đặt lịch nghe thử tại showroom để chọn đúng thiết bị.',
      'Gọi hotline để được kỹ thuật viên tư vấn trực tiếp.',
    ],
    tagPool: ['tư vấn chọn mua', 'kinh nghiệm', 'loa karaoke', 'micro không dây', 'tai nghe'],
    imageKeyword: 'living room speakers|home theater speakers|bookshelf speakers|stereo speakers',
    titleIndustrySuffix: () => '',
  },
  'Hướng dẫn sử dụng': {
    titleCores: [
      'Cách kết nối loa bluetooth với tivi và điện thoại',
      'Cách chỉnh vang số hát karaoke hay',
      'Cách ghép đôi micro không dây với loa',
      'Cách bảo quản loa và micro bền lâu',
      'Cách sạc và dùng pin loa di động đúng cách',
    ],
    angles: ['đơn giản trong 5 phút', 'từng bước chi tiết', 'cho người không rành kỹ thuật', 'tránh hỏng hóc', 'theo hướng dẫn của kỹ thuật viên'],
    introFragments: [
      'Thiết bị tốt nhưng cài đặt chưa đúng sẽ không phát huy hết chất lượng âm thanh.',
      'Nhiều lỗi như rè, hú, mất kết nối thực ra chỉ do thao tác sai và có thể tự khắc phục tại nhà.',
      'Bài hướng dẫn này giúp bạn làm chủ thiết bị âm thanh của mình mà không cần gọi kỹ thuật.',
    ],
    contextHeading: 'Trước khi bắt đầu',
    contextFragments: [
      'Đọc kỹ sách hướng dẫn đi kèm và kiểm tra thiết bị đã được sạc đầy hoặc cắm nguồn ổn định.',
      'Đặt loa trên kệ hoặc chân loa chắc chắn, cách tường khoảng 20–30cm để tiếng bass không bị dội.',
      'Vặn nhỏ âm lượng tổng trước khi bật thiết bị để tránh tiếng nổ làm hỏng củ loa.',
    ],
    detailHeading: 'Các bước thực hiện',
    detailFragments: [
      'Kết nối bluetooth: bật chế độ ghép đôi trên loa (thường nhấn giữ nút Bluetooth 3 giây), sau đó chọn tên loa trong danh sách thiết bị trên điện thoại hoặc tivi.',
      'Chỉnh vang số: đặt echo khoảng 30–40%, delay vừa phải, giảm nhẹ dải bass của micro để tiếng hát rõ, rồi tăng dần âm lượng tổng.',
      'Ghép micro: bật micro, nhấn nút pair trên đầu thu hoặc loa, chờ đèn báo đứng yên là micro đã nhận sóng.',
      'Bảo quản: tháo pin micro khi không dùng lâu, lau loa bằng khăn khô, tránh để thiết bị nơi ẩm hoặc nắng trực tiếp.',
    ],
    bulletFragments: [
      'luôn giảm âm lượng trước khi bật hoặc tắt thiết bị',
      'không hướng micro thẳng vào loa để tránh hú',
      'sạc loa di động khi pin còn khoảng 20%, không để cạn kiệt',
      'cập nhật firmware qua ứng dụng của hãng nếu có',
      'dùng dây tín hiệu đúng chuẩn, cắm chặt các jack',
    ],
    bulletsHeading: 'Mẹo dùng hằng ngày',
    adviceHeading: 'Lỗi thường gặp và cách khắc phục',
    adviceFragments: [
      'loa bị rè: kiểm tra lại dây tín hiệu và giảm mức gain trên vang số',
      'micro bị hú: lùi micro ra xa loa, bật chế độ chống hú hoặc giảm echo',
      'mất kết nối bluetooth: xóa thiết bị khỏi danh sách đã ghép đôi rồi kết nối lại',
    ],
    faq: [
      { q: 'Loa bluetooth kết nối được 2 điện thoại cùng lúc không?', a: 'Nhiều dòng loa hiện nay hỗ trợ kết nối đa điểm. Bạn xem mục thông số hoặc thử ghép đôi thiết bị thứ hai theo hướng dẫn của hãng.' },
      { q: 'Có nên để loa cắm sạc liên tục?', a: 'Không nên. Hãy rút sạc khi pin đã đầy để kéo dài tuổi thọ pin của loa.' },
    ],
    closingHeading: 'Tổng kết',
    closingFragments: [
      'Chỉ cần sử dụng và bảo quản đúng cách, thiết bị âm thanh có thể đồng hành cùng gia đình bạn trong nhiều năm.',
      'Nếu đã thử các bước trên mà vẫn chưa khắc phục được, hãy liên hệ bộ phận kỹ thuật để được hỗ trợ.',
      'Lưu lại bài viết để tiện xem lại khi cần.',
    ],
    ctaFragments: [
      'Liên hệ hotline kỹ thuật để được hướng dẫn trực tiếp qua video call.',
      'Mang thiết bị đến showroom để được kiểm tra và căn chỉnh miễn phí.',
      'Theo dõi chuyên mục hướng dẫn để cập nhật thêm mẹo sử dụng.',
    ],
    tagPool: ['hướng dẫn sử dụng', 'kết nối bluetooth', 'vang số', 'micro không dây', 'bảo quản loa'],
    imageKeyword: 'bluetooth speaker|portable speaker|wireless speaker|smartphone speaker',
    titleIndustrySuffix: () => '',
  },
  'Khuyến mãi': {
    titleCores: [
      'Ưu đãi loa karaoke gia đình',
      'Combo loa kéo kèm micro không dây',
      'Sale tai nghe chính hãng',
      'Ưu đãi trọn bộ dàn karaoke',
      'Giảm giá loa bluetooth JBL, Harman Kardon',
    ],
    angles: ['giảm đến 30%', 'quà tặng hấp dẫn', 'trả góp 0%', 'số lượng có hạn', 'giá tốt nhất năm'],
    introFragments: [
      'Chương trình ưu đãi lớn dành cho khách hàng yêu âm nhạc và karaoke đã chính thức bắt đầu.',
      'Đây là thời điểm lý tưởng để nâng cấp dàn âm thanh gia đình với mức giá tốt nhất trong năm.',
      'Hàng loạt mẫu loa, micro và tai nghe chính hãng được giảm giá sâu trong thời gian ngắn.',
    ],
    contextHeading: 'Vì sao nên mua trong đợt ưu đãi này?',
    contextFragments: [
      'Toàn bộ sản phẩm là hàng chính hãng, đầy đủ tem bảo hành, được kỹ thuật viên kiểm tra trước khi giao.',
      'Ưu đãi áp dụng cho cả combo trọn bộ, giúp bạn tiết kiệm hơn nhiều so với mua lẻ từng thiết bị.',
      'Hỗ trợ trả góp 0% lãi suất giúp dễ dàng sở hữu dàn âm thanh cao cấp.',
    ],
    detailHeading: 'Chi tiết chương trình',
    detailFragments: [
      'Giảm trực tiếp trên giá niêm yết với các dòng loa karaoke, loa kéo và loa bluetooth.',
      'Mua combo loa và vang số được tặng kèm micro không dây hoặc chân loa.',
      'Miễn phí giao hàng và lắp đặt, căn chỉnh âm thanh tận nhà trong nội thành.',
    ],
    bulletFragments: [
      'giảm giá trực tiếp đến 30%',
      'tặng micro, chân loa khi mua combo',
      'trả góp 0% qua thẻ tín dụng',
      'miễn phí lắp đặt và cân chỉnh âm thanh',
      'bảo hành chính hãng 12–24 tháng',
    ],
    bulletsHeading: 'Quyền lợi khách hàng',
    adviceHeading: 'Lưu ý khi tham gia',
    adviceFragments: [
      'ưu đãi áp dụng có thời hạn và số lượng giới hạn',
      'quà tặng có thể thay đổi theo tình trạng kho',
      'liên hệ trước để giữ hàng với các mẫu bán chạy',
    ],
    faq: [
      { q: 'Mua online có được ưu đãi như tại showroom không?', a: 'Có, mọi kênh mua hàng đều áp dụng cùng mức ưu đãi trong thời gian chương trình.' },
      { q: 'Hàng khuyến mãi có được bảo hành đầy đủ không?', a: 'Có, sản phẩm khuyến mãi vẫn được bảo hành chính hãng như bình thường.' },
    ],
    closingHeading: 'Đừng bỏ lỡ',
    closingFragments: [
      'Cơ hội sở hữu thiết bị âm thanh chính hãng với giá tốt chỉ có trong thời gian ngắn.',
      'Nâng cấp dàn âm thanh để những buổi hát karaoke cuối tuần thêm trọn vẹn.',
      'Số lượng có hạn, hãy đặt hàng sớm.',
    ],
    ctaFragments: [
      'Gọi hotline hoặc nhắn tin fanpage để giữ suất ưu đãi.',
      'Ghé showroom để nghe thử và nhận quà trực tiếp.',
      'Đặt hàng online ngay hôm nay để được giao nhanh.',
    ],
    tagPool: ['khuyến mãi', 'giảm giá', 'loa karaoke', 'combo karaoke', 'trả góp 0%'],
    imageKeyword: 'bluetooth speaker|wireless headphones|portable speaker|karaoke microphone',
    titleIndustrySuffix: () => '',
  },
  'Đánh giá sản phẩm': {
    titleCores: [
      'Đánh giá loa xách tay karaoke',
      'Trải nghiệm tai nghe TWS chống ồn',
      'Đánh giá loa soundbar kèm sub',
      'Đánh giá loa bluetooth Harman Kardon',
      'Đánh giá micro karaoke không dây',
    ],
    angles: ['sau 1 tháng sử dụng', 'có đáng tiền không', 'ưu và nhược điểm', 'chi tiết từ A đến Z', 'trong tầm giá'],
    introFragments: [
      'Thông số trên giấy chỉ là một phần, trải nghiệm thực tế mới cho biết thiết bị có thật sự đáng mua.',
      'Đội ngũ kỹ thuật đã dùng thử sản phẩm trong nhiều tình huống: nghe nhạc, xem phim và hát karaoke.',
      'Bài đánh giá khách quan giúp bạn có thêm góc nhìn trước khi quyết định.',
    ],
    contextHeading: 'Thiết kế và hoàn thiện',
    contextFragments: [
      'Vỏ loa chắc chắn, các nút điều khiển bố trí hợp lý, dễ thao tác kể cả khi đang hát.',
      'Trọng lượng vừa phải, có quai xách hoặc bánh xe giúp di chuyển thuận tiện.',
      'Hiệu ứng đèn LED và màu sắc trẻ trung phù hợp với không gian phòng khách hiện đại.',
    ],
    detailHeading: 'Chất lượng âm thanh',
    detailFragments: [
      'Dải trầm chắc, không bị ù khi mở âm lượng lớn trong phòng khoảng 20m².',
      'Dải trung rõ ràng, giọng hát nổi bật, phù hợp cả nhạc trẻ lẫn nhạc vàng.',
      'Dải cao sáng nhưng không chói, nghe lâu không mệt tai.',
      'Kết nối ổn định, độ trễ thấp khi xem phim hoặc chơi game.',
    ],
    bulletFragments: [
      'âm bass mạnh, chắc tiếng',
      'pin dùng thực tế trên 10 giờ',
      'kết nối bluetooth nhanh, ổn định',
      'micro bắt giọng tốt, ít hú',
      'giá hợp lý trong phân khúc',
    ],
    bulletsHeading: 'Ưu điểm nổi bật',
    adviceHeading: 'Điểm cần cân nhắc',
    adviceFragments: [
      'âm lượng tối đa phù hợp phòng vừa và nhỏ, chưa đủ cho sân vườn rộng',
      'ứng dụng điều khiển chưa có nhiều tùy chỉnh chuyên sâu',
      'cần thời gian làm quen để chỉnh echo phù hợp giọng hát',
    ],
    faq: [
      { q: 'Sản phẩm phù hợp với ai?', a: 'Phù hợp với gia đình hay hát karaoke cuối tuần, người thích nghe nhạc và cần thiết bị dễ di chuyển.' },
      { q: 'Có nên mua thêm loa sub?', a: 'Nếu phòng trên 25m² hoặc bạn thích tiếng bass sâu, ghép thêm loa sub sẽ cải thiện rõ rệt.' },
    ],
    closingHeading: 'Kết luận',
    closingFragments: [
      'Đây là lựa chọn đáng cân nhắc trong tầm giá nhờ âm thanh cân bằng và thiết kế tiện dụng.',
      'Nên nghe thử trực tiếp để cảm nhận rõ nhất chất âm có hợp gu của bạn hay không.',
      'Mọi câu hỏi về sản phẩm, đội ngũ kỹ thuật luôn sẵn sàng giải đáp.',
    ],
    ctaFragments: [
      'Ghé showroom để nghe thử trực tiếp sản phẩm.',
      'Liên hệ hotline để nhận báo giá và ưu đãi hiện có.',
      'Xem thêm các bài đánh giá khác trên website.',
    ],
    tagPool: ['đánh giá', 'review', 'loa bluetooth', 'tai nghe', 'micro karaoke'],
    imageKeyword: 'over ear headphones|wireless earbuds|portable speaker|hifi speakers',
    titleIndustrySuffix: () => '',
  },
  'Sự kiện cửa hàng': {
    titleCores: [
      'Khai trương showroom âm thanh mới',
      'Ngày hội trải nghiệm loa karaoke',
      'Đêm nhạc trải nghiệm dàn âm thanh',
      'Workshop chỉnh âm thanh karaoke tại nhà',
      'Tuần lễ vàng thiết bị âm thanh',
    ],
    angles: ['cuối tuần này', 'với nhiều quà tặng', 'miễn phí tham dự', 'cùng chuyên gia âm thanh', 'dành cho khách hàng thân thiết'],
    introFragments: [
      'Sự kiện là dịp để khách hàng nghe thử và trải nghiệm trực tiếp các thiết bị âm thanh mới nhất.',
      'Chúng tôi trân trọng mời bạn và gia đình đến tham dự chương trình với nhiều hoạt động hấp dẫn.',
      'Không chỉ mua sắm, đây còn là cơ hội giao lưu cùng cộng đồng yêu âm nhạc.',
    ],
    contextHeading: 'Giới thiệu sự kiện',
    contextFragments: [
      'Khu trải nghiệm được bố trí theo từng không gian: phòng karaoke gia đình, góc nghe nhạc hi-fi và khu tai nghe.',
      'Kỹ thuật viên sẽ trực tiếp demo cách phối dàn và chỉnh vang số để hát hay hơn.',
      'Khách tham dự được nghe thử mọi sản phẩm mà không bắt buộc mua hàng.',
    ],
    detailHeading: 'Hoạt động nổi bật',
    detailFragments: [
      'Thi hát karaoke với giải thưởng là loa bluetooth và tai nghe chính hãng.',
      'Tư vấn cấu hình miễn phí theo diện tích phòng của từng gia đình.',
      'Ưu đãi riêng cho khách mua hàng tại sự kiện.',
    ],
    bulletFragments: [
      'nghe thử miễn phí mọi thiết bị',
      'quà tặng cho khách check-in',
      'bốc thăm trúng thưởng cuối chương trình',
      'ưu đãi riêng chỉ có tại sự kiện',
      'tư vấn 1–1 cùng kỹ thuật viên',
    ],
    bulletsHeading: 'Quyền lợi khi tham dự',
    adviceHeading: 'Thông tin cần biết',
    adviceFragments: [
      'đăng ký trước để được giữ chỗ trong khu trải nghiệm',
      'mang theo điện thoại để thử kết nối với loa yêu thích',
      'quà tặng có số lượng giới hạn theo thứ tự đến trước',
    ],
    faq: [
      { q: 'Có mất phí tham dự không?', a: 'Sự kiện hoàn toàn miễn phí, bạn chỉ cần đăng ký trước để được giữ chỗ.' },
      { q: 'Có được mang trẻ em theo không?', a: 'Có, khu trải nghiệm có chỉnh âm lượng vừa phải, phù hợp cả gia đình.' },
    ],
    closingHeading: 'Hẹn gặp bạn',
    closingFragments: [
      'Sự kiện sẽ là dịp tuyệt vời để tìm ra thiết bị âm thanh ưng ý cho gia đình.',
      'Rất mong được đón tiếp bạn tại showroom.',
      'Chia sẻ thông tin sự kiện để bạn bè cùng tham gia.',
    ],
    ctaFragments: [
      'Đăng ký tham dự qua fanpage hoặc hotline.',
      'Theo dõi fanpage để cập nhật lịch trình chi tiết.',
      'Rủ bạn bè cùng đến để nhận thêm quà.',
    ],
    tagPool: ['sự kiện', 'showroom', 'trải nghiệm âm thanh', 'karaoke', 'quà tặng'],
    imageKeyword: 'concert speakers|stage speakers|karaoke microphone|sound system speakers',
    titleIndustrySuffix: () => '',
  },
}

/**
 * Ngành Vận tải - Gửi hàng, Chành xe (gửi hàng lẻ, hàng ghép, bao chuyến từ Đồng Nai đi TP.HCM, miền Trung, Tây Nguyên,
 * miền Tây) — nội dung bám theo dịch vụ và tuyến xe thật của ngành, không nói chung chung "sản phẩm".
 */
INDUSTRY_TOPIC_OVERRIDES['Vận tải - Gửi hàng, Chành xe'] = {
  'Tin tức ngành hàng': {
    titleCores: [
      'Giá cước vận chuyển hàng hóa đường bộ',
      'Nhu cầu gửi hàng từ Đồng Nai đi các tỉnh',
      'Tuyến cao tốc mới rút ngắn thời gian giao hàng',
      'Thị trường chành xe và gửi hàng ghép',
      'Mùa cao điểm vận chuyển nông sản',
    ],
    angles: ['có gì thay đổi', 'đáng chú ý nhất hiện nay', 'chủ hàng cần biết', 'tác động ra sao tới chủ shop', 'qua góc nhìn nhà xe'],
    introFragments: [
      'Đồng Nai là cửa ngõ công nghiệp của miền Đông Nam Bộ, mỗi ngày có hàng trăm chuyến xe chở hàng đi TP.HCM, miền Trung, Tây Nguyên và miền Tây.',
      'Hoạt động vận chuyển hàng hóa đường bộ đang có nhiều chuyển động mới, từ giá nhiên liệu, hạ tầng cao tốc đến thói quen gửi hàng của chủ shop online.',
      'Với doanh nghiệp, nhà vườn hay chủ shop, chi phí và thời gian vận chuyển ảnh hưởng trực tiếp đến giá bán và trải nghiệm của khách hàng.',
    ],
    contextHeading: 'Bối cảnh thị trường vận tải',
    contextFragments: [
      'Các tuyến cao tốc Dầu Giây – Phan Thiết, Phan Thiết – Vĩnh Hảo, Vĩnh Hảo – Cam Lâm đưa vào khai thác giúp xe tải từ Đồng Nai đi Nha Trang, Quảng Ngãi rút ngắn đáng kể thời gian.',
      'Thương mại điện tử phát triển khiến lượng đơn hàng lẻ tăng mạnh, nhà xe phải tổ chức gom hàng, ghép chuyến linh hoạt hơn để giữ giá cước hợp lý.',
      'Giá dầu diesel biến động là yếu tố lớn nhất tác động đến cước vận chuyển, nhất là với các tuyến dài lên Tây Nguyên hay ra miền Trung.',
    ],
    detailHeading: 'Những điểm mới đáng chú ý',
    detailFragments: [
      'Nhiều nhà xe đã gắn định vị GPS và gửi mã vận đơn cho khách, giúp chủ hàng theo dõi được xe đang ở đâu thay vì phải gọi điện hỏi.',
      'Dịch vụ gửi hàng ghép ngày càng phổ biến với các shop nhỏ — không cần thuê nguyên xe mà vẫn đi được tuyến dài với chi phí thấp.',
      'Mùa thu hoạch nông sản Tây Nguyên và miền Tây, nhu cầu xe bao chuyến tăng vọt, chủ hàng nên đặt xe sớm vài ngày để giữ chỗ.',
      'Thu hộ (COD) trở thành dịch vụ gần như bắt buộc với chủ shop online gửi hàng đi tỉnh.',
    ],
    bulletFragments: [
      'cao tốc mới giúp tuyến Đồng Nai – Nha Trang nhanh hơn',
      'hàng ghép là lựa chọn tiết kiệm cho shop nhỏ',
      'xe bao chuyến tăng giá vào mùa nông sản',
      'theo dõi hành trình bằng GPS ngày càng phổ biến',
      'thu hộ COD hỗ trợ chủ shop bán hàng đi tỉnh',
    ],
    bulletsHeading: 'Tóm tắt nhanh',
    adviceHeading: 'Chủ hàng nên lưu ý gì?',
    adviceFragments: [
      'so sánh giá cước theo kg, theo khối và theo chuyến để chọn hình thức gửi phù hợp với lượng hàng',
      'đặt xe trước vào các dịp cao điểm như Tết, mùa nông sản để tránh hết chỗ',
      'khai báo đúng giá trị hàng hóa để được đền bù đầy đủ khi có sự cố',
    ],
    faq: [
      { q: 'Giá cước vận chuyển có thay đổi theo giá xăng dầu không?', a: 'Có. Nhà xe thường điều chỉnh cước khi giá dầu biến động mạnh, vì vậy nên hỏi báo giá mới nhất trước mỗi lần gửi.' },
      { q: 'Gửi hàng từ Đồng Nai đi Nha Trang mất bao lâu?', a: 'Với hàng ghép, hàng thường đến nơi sau khoảng 1 ngày. Xe bao chuyến có thể giao trong ngày tùy giờ xuất phát.' },
    ],
    closingHeading: 'Lời kết',
    closingFragments: [
      'Thị trường vận tải thay đổi liên tục, nhưng điều chủ hàng cần nhất vẫn là giao đúng hẹn, hàng nguyên vẹn và cước rõ ràng.',
      'Theo dõi chuyên mục tin tức vận tải để cập nhật sớm giá cước và lịch xe mới.',
      'Mọi thắc mắc về tuyến xe, giá cước, đội ngũ điều phối luôn sẵn sàng hỗ trợ.',
    ],
    ctaFragments: [
      'Gọi hotline để nhận báo giá cước mới nhất cho tuyến bạn cần gửi.',
      'Nhắn tin fanpage để đặt lịch lấy hàng tận nơi.',
      'Ghé kho Đồng Nai để gửi hàng và được tư vấn đóng gói miễn phí.',
    ],
    tagPool: ['tin tức vận tải', 'giá cước', 'gửi hàng đi tỉnh', 'chành xe', 'đồng nai'],
    imageKeyword: 'freight truck|cargo truck|coach bus|intercity bus',
    titleIndustrySuffix: () => '',
  },
  'Mẹo hay & Kinh nghiệm': {
    titleCores: [
      'Cách đóng gói hàng gửi đi tỉnh an toàn',
      'Nên gửi hàng lẻ, hàng ghép hay thuê xe bao chuyến',
      'Kinh nghiệm gửi nông sản đi xa',
      'Cách tính cước vận chuyển theo kg và theo khối',
      'Kinh nghiệm chọn nhà xe uy tín',
    ],
    angles: ['chủ shop nên biết', 'để tiết kiệm chi phí', 'tránh hư hỏng, thất lạc', 'cho người mới gửi hàng', 'từ kinh nghiệm thực tế'],
    introFragments: [
      'Gửi hàng đi tỉnh tưởng đơn giản nhưng chỉ cần đóng gói sai cách hoặc chọn sai hình thức vận chuyển là có thể tốn thêm chi phí, thậm chí hư hỏng hàng.',
      'Không ít chủ shop từng phải đền tiền cho khách vì hàng vỡ, móp méo hoặc giao trễ — phần lớn có thể tránh được nếu nắm vài kinh nghiệm cơ bản.',
      'Mỗi loại hàng, mỗi tuyến đường phù hợp với một cách gửi khác nhau. Bài viết dưới đây tổng hợp kinh nghiệm từ đội ngũ nhà xe nhiều năm chạy tuyến.',
    ],
    contextHeading: 'Vì sao cần chọn đúng cách gửi?',
    contextFragments: [
      'Hàng lẻ tính cước theo kiện hoặc theo kg, phù hợp vài thùng hàng; hàng ghép tính theo khối hoặc tấn, rẻ hơn khi hàng nhiều nhưng chưa đủ một xe.',
      'Xe bao chuyến chạy thẳng, không dừng gom hàng nên nhanh và an toàn nhất, phù hợp hàng số lượng lớn hoặc hàng cần giao gấp.',
      'Hàng nông sản, hàng dễ vỡ, hàng cồng kềnh mỗi loại cần cách đóng gói và xếp xe khác nhau để không bị dập, đè.',
    ],
    detailHeading: 'Kinh nghiệm thực tế',
    detailFragments: [
      'Dùng thùng carton 5 lớp cho hàng nặng, chèn xốp hoặc giấy vụn vào khoảng trống để hàng không xê dịch khi xe chạy.',
      'Hàng dễ vỡ nên dán nhãn "Hàng dễ vỡ – Nhẹ tay" và báo trước với nhà xe để được xếp lên trên, không bị đè.',
      'Nông sản như trái cây, rau củ nên đóng sọt hoặc thùng có lỗ thoáng khí, gửi chuyến tối để hàng đến nơi vào sáng sớm còn tươi.',
      'Ghi rõ tên, số điện thoại người nhận ở ít nhất 2 mặt thùng, chụp ảnh kiện hàng trước khi giao cho nhà xe.',
    ],
    bulletFragments: [
      '1 – 5 kiện hàng: chọn gửi hàng lẻ',
      'vài tạ đến vài tấn: chọn gửi hàng ghép',
      'hàng nhiều hoặc cần gấp: thuê xe bao chuyến',
      'hàng giá trị cao: mua thêm bảo hiểm hàng hóa',
      'luôn giữ lại biên nhận và mã vận đơn',
    ],
    bulletsHeading: 'Chọn hình thức gửi nhanh',
    adviceHeading: 'Lưu ý để tiết kiệm chi phí',
    adviceFragments: [
      'gom hàng gửi một lần thay vì gửi lẻ nhiều lần trong tuần',
      'hỏi rõ cước đã bao gồm bốc xếp, giao tận nơi hay chưa để tránh phát sinh',
      'chọn nhà xe có tuyến cố định, chạy hằng ngày để hàng không phải chờ ghép chuyến lâu',
    ],
    faq: [
      { q: 'Hàng cồng kềnh nhưng nhẹ tính cước thế nào?', a: 'Thường được quy đổi theo thể tích (khối). Nhà xe sẽ tính theo giá trị lớn hơn giữa khối lượng thực và khối lượng quy đổi.' },
      { q: 'Có gửi được hàng đông lạnh không?', a: 'Hàng cần giữ lạnh nên đóng thùng xốp kèm đá khô, gửi chuyến nhanh và báo trước để nhà xe sắp xếp chỗ phù hợp.' },
    ],
    closingHeading: 'Lời kết',
    closingFragments: [
      'Đóng gói kỹ và chọn đúng hình thức vận chuyển là hai cách đơn giản nhất để hàng đến tay khách an toàn với chi phí hợp lý.',
      'Hy vọng những kinh nghiệm trên giúp việc gửi hàng đi tỉnh của bạn nhẹ nhàng hơn.',
      'Cần tư vấn cách gửi cho từng loại hàng, cứ liên hệ đội ngũ điều phối để được hỗ trợ.',
    ],
    ctaFragments: [
      'Gọi hotline để được tư vấn hình thức gửi tiết kiệm nhất cho lô hàng của bạn.',
      'Đặt lịch lấy hàng tận nơi qua fanpage hoặc Zalo.',
      'Mang hàng tới kho Đồng Nai để được hỗ trợ đóng gói miễn phí.',
    ],
    tagPool: ['kinh nghiệm gửi hàng', 'đóng gói hàng hóa', 'hàng ghép', 'bao chuyến', 'tiết kiệm cước'],
    imageKeyword: 'cargo truck|delivery truck|coach bus|sleeper bus',
    titleIndustrySuffix: () => '',
  },
  'Hướng dẫn sử dụng': {
    titleCores: [
      'Hướng dẫn gửi hàng lẻ đi tỉnh',
      'Hướng dẫn đặt xe bao chuyến',
      'Hướng dẫn tra cứu hành trình đơn hàng',
      'Hướng dẫn gửi hàng thu hộ COD',
      'Hướng dẫn khai báo giá trị và mua bảo hiểm hàng hóa',
    ],
    angles: ['từng bước chi tiết', 'đơn giản cho người mới', 'chỉ trong 5 phút', 'qua điện thoại và Zalo', 'tại kho Đồng Nai'],
    introFragments: [
      'Nhiều khách hàng lần đầu gửi hàng còn bỡ ngỡ không biết bắt đầu từ đâu, cần chuẩn bị gì và mất bao lâu thì hàng tới nơi.',
      'Quy trình gửi hàng tại nhà xe khá đơn giản — chỉ cần chuẩn bị đúng thông tin, phần còn lại đội ngũ điều phối sẽ hỗ trợ.',
      'Bài viết hướng dẫn từng bước để bạn tự gửi hàng, theo dõi đơn và nhận tiền thu hộ mà không cần phải hỏi lại nhiều lần.',
    ],
    contextHeading: 'Cần chuẩn bị gì trước khi gửi?',
    contextFragments: [
      'Thông tin người nhận gồm họ tên, số điện thoại và địa chỉ chi tiết đến phường, xã — địa chỉ càng rõ, giao càng nhanh.',
      'Hàng đã được đóng gói chắc chắn, có ghi chú nếu là hàng dễ vỡ, hàng cần giữ khô hoặc không được xếp chồng.',
      'Số tiền cần thu hộ (nếu có) và giá trị hàng hóa để khai báo, giúp việc đền bù rõ ràng khi có sự cố.',
    ],
    detailHeading: 'Quy trình gửi hàng',
    detailFragments: [
      'Đầu tiên, gọi hotline hoặc nhắn Zalo báo loại hàng, số kiện, khối lượng và tuyến cần gửi để nhận báo giá.',
      'Bạn có thể mang hàng tới kho Đồng Nai hoặc hẹn giờ để xe tới lấy hàng tận nơi.',
      'Khi nhận hàng, nhân viên kiểm đếm, cân hàng, lập phiếu gửi và gửi mã vận đơn qua tin nhắn cho bạn.',
      'Trong lúc hàng đi đường, bạn theo dõi hành trình bằng mã vận đơn; khi giao xong, tiền thu hộ được đối soát và chuyển khoản theo lịch đã thỏa thuận.',
    ],
    bulletFragments: [
      'kiểm tra kỹ thông tin người nhận trước khi chốt phiếu',
      'giữ lại phiếu gửi hoặc ảnh chụp phiếu',
      'báo trước nếu cần giao giờ hành chính hoặc giao gấp',
      'hàng giá trị cao nên khai báo và mua bảo hiểm',
      'liên hệ ngay nếu người nhận báo hàng có dấu hiệu bất thường',
    ],
    bulletsHeading: 'Lưu ý quan trọng',
    adviceHeading: 'Mẹo để đơn hàng đi nhanh hơn',
    adviceFragments: [
      'gửi hàng trước giờ xe chạy trong ngày để kịp chuyến sớm nhất',
      'báo trước cho người nhận để luôn có người nghe máy khi xe tới',
      'dùng cùng một mẫu tin nhắn đặt hàng để nhân viên xử lý nhanh hơn',
    ],
    faq: [
      { q: 'Tôi có thể đổi địa chỉ nhận khi hàng đang đi đường không?', a: 'Được, nếu hàng chưa giao. Bạn báo ngay cho tổng đài kèm mã vận đơn; phí phát sinh (nếu có) sẽ được báo trước.' },
      { q: 'Tiền thu hộ bao lâu thì được chuyển về?', a: 'Tiền thu hộ thường được đối soát và chuyển khoản trong 1 – 3 ngày làm việc sau khi giao hàng thành công.' },
    ],
    closingHeading: 'Lời kết',
    closingFragments: [
      'Chỉ với vài bước đơn giản, việc gửi hàng đi tỉnh trở nên nhanh chóng và dễ kiểm soát hơn nhiều.',
      'Lưu lại bài hướng dẫn này để dùng cho những lần gửi hàng tiếp theo.',
      'Nếu gặp khó khăn ở bước nào, đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ.',
    ],
    ctaFragments: [
      'Gọi hotline để được hướng dẫn và báo giá ngay.',
      'Nhắn Zalo để đặt lịch lấy hàng tận nơi.',
      'Theo dõi fanpage để cập nhật lịch xe và hướng dẫn mới.',
    ],
    tagPool: ['hướng dẫn gửi hàng', 'tra cứu vận đơn', 'thu hộ cod', 'bảo hiểm hàng hóa', 'gửi hàng đi tỉnh'],
    imageKeyword: 'delivery truck|cargo truck|coach bus|luxury bus',
    titleIndustrySuffix: () => '',
  },
  'Khuyến mãi': {
    titleCores: [
      'Ưu đãi cước gửi hàng tuyến Đồng Nai – TP.HCM',
      'Giảm giá cước hàng ghép đi miền Trung',
      'Ưu đãi thuê xe bao chuyến đi Tây Nguyên',
      'Miễn phí lấy hàng tận nơi',
      'Ưu đãi cho chủ shop gửi hàng thường xuyên',
    ],
    angles: ['— tiết kiệm đến 20%', 'dành cho khách hàng mới', 'trong tháng này', 'áp dụng mọi tuyến', '— số chuyến có hạn'],
    introFragments: [
      'Nhằm tri ân khách hàng đã đồng hành, nhà xe triển khai chương trình ưu đãi cước vận chuyển trên các tuyến chạy hằng ngày.',
      'Nếu bạn đang có kế hoạch gửi lô hàng lớn hoặc cần xe cho mùa cao điểm, đây là thời điểm tốt để tiết kiệm chi phí vận chuyển.',
      'Chương trình ưu đãi lần này dành cho cả khách gửi lẻ lẫn doanh nghiệp, nhà vườn cần xe bao chuyến.',
    ],
    contextHeading: 'Vì sao nên tận dụng ưu đãi lần này?',
    contextFragments: [
      'Chi phí vận chuyển chiếm phần đáng kể trong giá vốn của chủ shop và nhà vườn, giảm vài phần trăm cước cũng giúp tăng lợi nhuận rõ rệt.',
      'Ưu đãi áp dụng trên các tuyến xe chạy cố định mỗi ngày nên hàng không phải chờ lâu để ghép chuyến.',
      'Khách hàng ký hợp đồng gửi hàng thường xuyên còn được giữ mức cước ưu đãi trong nhiều tháng tiếp theo.',
    ],
    detailHeading: 'Cách nhận ưu đãi',
    detailFragments: [
      'Báo mã chương trình khi gọi hotline hoặc nhắn Zalo đặt xe, nhân viên sẽ áp dụng mức cước ưu đãi ngay trên phiếu gửi.',
      'Với xe bao chuyến, nên đặt lịch trước ít nhất 1 – 2 ngày vì số chuyến ưu đãi mỗi tuần có giới hạn.',
      'Chủ shop gửi hàng đều đặn có thể đăng ký tài khoản khách hàng thân thiết để được đối soát công nợ và cước theo tháng.',
    ],
    bulletFragments: [
      'áp dụng cho gửi hàng lẻ, hàng ghép và bao chuyến',
      'miễn phí lấy hàng tận nơi trong khu vực Đồng Nai',
      'hỗ trợ thu hộ COD không thu thêm phí',
      'có xuất hóa đơn VAT cho doanh nghiệp',
      'ưu tiên xếp chuyến sớm nhất trong ngày',
    ],
    bulletsHeading: 'Quyền lợi nổi bật',
    adviceHeading: 'Lưu ý khi tham gia',
    adviceFragments: [
      'ưu đãi không cộng dồn với các chương trình giảm cước khác',
      'cước ưu đãi tính theo bảng giá niêm yết tại thời điểm gửi',
      'đặt xe sớm để chắc chắn còn chuyến trong thời gian chương trình',
    ],
    faq: [
      { q: 'Ưu đãi có áp dụng cho hàng cồng kềnh không?', a: 'Có, ưu đãi áp dụng trên cước đã quy đổi theo khối lượng hoặc thể tích của hàng.' },
      { q: 'Tôi gửi hàng lần đầu có được ưu đãi không?', a: 'Có. Khách hàng mới được giảm cước ngay đơn đầu tiên khi báo mã chương trình.' },
    ],
    closingHeading: 'Lời kết',
    closingFragments: [
      'Ưu đãi có thời hạn — đặt xe sớm để không bỏ lỡ mức cước tốt nhất trong tháng.',
      'Cảm ơn quý khách đã tin tưởng gửi gắm hàng hóa trên mỗi chuyến xe.',
      'Mọi thắc mắc về chương trình, vui lòng liên hệ tổng đài để được giải đáp.',
    ],
    ctaFragments: [
      'Gọi hotline ngay để giữ mức cước ưu đãi.',
      'Nhắn Zalo để đặt lịch lấy hàng miễn phí.',
      'Theo dõi fanpage để nhận thông báo ưu đãi tiếp theo.',
    ],
    tagPool: ['ưu đãi cước', 'khuyến mãi vận chuyển', 'gửi hàng giá rẻ', 'bao chuyến', 'đồng nai'],
    imageKeyword: 'freight truck|semi truck|coach bus|intercity bus',
    titleIndustrySuffix: () => '',
  },
  'Đánh giá sản phẩm': {
    titleCores: [
      'So sánh gửi hàng lẻ và gửi hàng ghép',
      'Đánh giá dịch vụ xe bao chuyến',
      'Gửi hàng qua nhà xe hay qua đơn vị chuyển phát',
      'Đánh giá tuyến Đồng Nai – Đà Lạt mùa nông sản',
      'Trải nghiệm gửi hàng thu hộ COD đi miền Tây',
    ],
    angles: ['ưu và nhược điểm', 'nên chọn loại nào', 'từ góc nhìn chủ shop', 'chi phí thực tế ra sao', 'sau nhiều tháng sử dụng'],
    introFragments: [
      'Mỗi hình thức vận chuyển có ưu điểm riêng, chọn đúng sẽ giúp tiết kiệm đáng kể cả chi phí lẫn thời gian giao hàng.',
      'Bài viết tổng hợp đánh giá thực tế từ các chủ shop, nhà vườn và doanh nghiệp thường xuyên gửi hàng từ Đồng Nai đi các tỉnh.',
      'Không có hình thức nào tốt nhất cho mọi trường hợp — điều quan trọng là phù hợp với lượng hàng, tuyến đường và thời gian giao.',
    ],
    contextHeading: 'Tiêu chí đánh giá',
    contextFragments: [
      'Chi phí: so sánh cước trên mỗi kg, mỗi khối hàng và các khoản phát sinh như bốc xếp, giao tận nơi.',
      'Thời gian: tính từ lúc giao hàng cho nhà xe đến khi người nhận ký nhận, bao gồm cả thời gian chờ ghép chuyến.',
      'Độ an toàn: tỷ lệ hàng nguyên vẹn, khả năng theo dõi hành trình và chính sách đền bù khi có sự cố.',
    ],
    detailHeading: 'Kết quả đánh giá',
    detailFragments: [
      'Gửi hàng lẻ linh hoạt, phù hợp vài kiện hàng mỗi ngày, nhưng cước tính trên mỗi kg cao hơn hàng ghép.',
      'Hàng ghép có cước thấp hơn rõ rệt khi hàng từ vài tạ trở lên, đổi lại có thể chờ thêm vài giờ để gom đủ chuyến.',
      'Xe bao chuyến nhanh và an toàn nhất vì chạy thẳng, không bốc dỡ dọc đường, phù hợp hàng giá trị cao hoặc cần giao gấp.',
      'So với đơn vị chuyển phát, nhà xe có lợi thế ở hàng nặng, hàng cồng kềnh và tuyến tỉnh; chuyển phát mạnh ở hàng nhỏ giao tận nhà trong nội thành.',
    ],
    bulletFragments: [
      'hàng lẻ: linh hoạt, phù hợp shop nhỏ',
      'hàng ghép: tiết kiệm cho lô hàng vừa',
      'bao chuyến: nhanh, an toàn cho hàng lớn',
      'nhà xe mạnh ở hàng nặng, cồng kềnh',
      'nên kết hợp nhiều hình thức tùy đơn hàng',
    ],
    bulletsHeading: 'Tóm tắt đánh giá',
    adviceHeading: 'Lời khuyên lựa chọn',
    adviceFragments: [
      'ước tính tổng lượng hàng mỗi tuần để chọn hình thức gửi có chi phí trên mỗi đơn thấp nhất',
      'ưu tiên nhà xe có tuyến cố định và chính sách đền bù rõ ràng bằng văn bản',
      'thử gửi một vài đơn nhỏ trước khi ký hợp đồng gửi hàng dài hạn',
    ],
    faq: [
      { q: 'Hàng ghép có bị lẫn hay thất lạc không?', a: 'Hàng được dán mã và lập phiếu riêng cho từng chủ hàng, kiểm đếm khi lên và xuống xe nên rất hiếm khi thất lạc.' },
      { q: 'Bao nhiêu hàng thì nên thuê xe bao chuyến?', a: 'Khi hàng gần đầy một xe (từ khoảng 70% tải trọng) hoặc cần giao gấp, thuê bao chuyến thường kinh tế và an toàn hơn ghép hàng.' },
    ],
    closingHeading: 'Lời kết',
    closingFragments: [
      'Hiểu rõ ưu nhược điểm từng hình thức giúp bạn chủ động hơn trong việc lên kế hoạch giao hàng.',
      'Hy vọng bài đánh giá giúp bạn chọn được cách gửi phù hợp với nhu cầu kinh doanh.',
      'Đội ngũ điều phối luôn sẵn sàng tư vấn phương án vận chuyển tối ưu cho từng lô hàng.',
    ],
    ctaFragments: [
      'Gọi hotline để được tư vấn và so sánh giá cước cho lô hàng của bạn.',
      'Nhắn Zalo gửi thông tin hàng để nhận báo giá trong vài phút.',
      'Theo dõi fanpage để xem thêm các bài đánh giá và kinh nghiệm vận chuyển.',
    ],
    tagPool: ['so sánh dịch vụ', 'hàng lẻ', 'hàng ghép', 'bao chuyến', 'đánh giá nhà xe'],
    imageKeyword: 'cargo truck|semi truck|sleeper bus|coach bus',
    titleIndustrySuffix: () => '',
  },
  'Sự kiện cửa hàng': {
    titleCores: [
      'Khai trương kho hàng mới tại Đồng Nai',
      'Mở thêm tuyến xe Đồng Nai – Quảng Ngãi',
      'Lịch xe chạy dịp Tết Nguyên Đán',
      'Tăng chuyến tuyến Đồng Nai – Đà Lạt mùa nông sản',
      'Tri ân khách hàng gửi hàng thân thiết',
    ],
    angles: ['thông báo chính thức', 'quý khách lưu ý', 'nhiều ưu đãi đi kèm', 'từ tuần này', 'phục vụ nhu cầu cao điểm'],
    introFragments: [
      'Để phục vụ nhu cầu gửi hàng ngày càng tăng, nhà xe tiếp tục mở rộng hệ thống kho bãi và tăng cường đội xe trên các tuyến chính.',
      'Xin gửi tới quý khách hàng thông báo về hoạt động mới của nhà xe trong thời gian tới.',
      'Cảm ơn quý khách đã tin tưởng gửi gắm hàng hóa — đây là thông tin quan trọng để quý khách chủ động sắp xếp lịch gửi hàng.',
    ],
    contextHeading: 'Thông tin chi tiết',
    contextFragments: [
      'Kho hàng mới có mặt bằng rộng, có xe nâng và mái che, giúp việc bốc xếp nhanh hơn và hàng hóa được bảo quản tốt hơn khi chờ lên xe.',
      'Các tuyến đi Nha Trang, Quảng Ngãi, Đà Lạt và Tây Nguyên được tăng thêm chuyến mỗi ngày trong mùa cao điểm.',
      'Lịch nhận hàng và lịch xe chạy dịp lễ, Tết được công bố sớm để khách hàng kịp gửi hàng trước khi nghỉ.',
    ],
    detailHeading: 'Quý khách cần lưu ý',
    detailFragments: [
      'Nên gửi hàng sớm 3 – 5 ngày trước kỳ nghỉ lễ để hàng kịp đến nơi trước khi người nhận nghỉ.',
      'Các chuyến bao xe dịp cao điểm cần đặt trước và đặt cọc để giữ xe.',
      'Thời gian giao hàng có thể kéo dài thêm vài giờ vào ngày cao điểm do lưu lượng xe trên cao tốc tăng.',
    ],
    bulletFragments: [
      'kho mới có xe nâng, mái che',
      'tăng chuyến trên các tuyến chính',
      'công bố lịch xe dịp lễ, Tết sớm',
      'hỗ trợ lấy hàng tận nơi trong ngày cao điểm',
      'tổng đài hoạt động xuyên suốt cả ngày nghỉ',
    ],
    bulletsHeading: 'Điểm nổi bật',
    adviceHeading: 'Để việc gửi hàng thuận lợi',
    adviceFragments: [
      'đặt lịch gửi hàng qua hotline hoặc Zalo trước khi mang hàng tới kho',
      'kiểm tra lịch xe chạy của tuyến cần gửi trên fanpage',
      'chuẩn bị sẵn thông tin người nhận để làm phiếu gửi nhanh hơn',
    ],
    faq: [
      { q: 'Dịp Tết nhà xe nghỉ từ ngày nào?', a: 'Lịch nghỉ cụ thể được thông báo trên fanpage và tại kho trước ít nhất 2 tuần, các tuyến chính vẫn chạy đến sát Tết.' },
      { q: 'Kho mới có nhận gửi hàng cồng kềnh không?', a: 'Có. Kho mới có xe nâng và khu vực riêng cho hàng cồng kềnh, hàng pallet.' },
    ],
    closingHeading: 'Lời kết',
    closingFragments: [
      'Mỗi bước mở rộng đều nhằm mục tiêu giao hàng nhanh hơn, an toàn hơn cho quý khách.',
      'Rất mong tiếp tục nhận được sự tin tưởng và đồng hành của quý khách trên mọi tuyến xe.',
      'Mọi góp ý xin gửi về tổng đài để chúng tôi phục vụ ngày càng tốt hơn.',
    ],
    ctaFragments: [
      'Gọi hotline để đặt lịch gửi hàng ngay hôm nay.',
      'Theo dõi fanpage để cập nhật lịch xe và thông báo mới nhất.',
      'Ghé kho mới tại Đồng Nai để được tư vấn trực tiếp.',
    ],
    tagPool: ['thông báo', 'lịch xe chạy', 'kho hàng đồng nai', 'tuyến mới', 'tri ân khách hàng'],
    imageKeyword: 'freight truck|delivery truck|intercity bus|luxury bus',
    titleIndustrySuffix: () => '',
  },
}

/**
 * Ngành Thực phẩm bổ sung - Sức khỏe trẻ em — nội dung dựa trên giới thiệu thương hiệu Cellrokids (hệ sinh thái dược phẩm
 * Cellromax Science, Hàn Quốc; sản phẩm có bằng sáng chế, chứng nhận chuẩn quốc tế; nói không với nguyên liệu kém chất lượng).
 * KHÔNG tự bịa công dụng/chỉ số cụ thể; mọi CTA kèm câu khuyến cáo bắt buộc của thực phẩm bảo vệ sức khỏe.
 */
const KIDS_DISCLAIMER = ' <em>Sản phẩm này không phải là thuốc và không có tác dụng thay thế thuốc chữa bệnh.</em>'
const KIDS_CTA = (texts: string[]) => texts.map((t) => t + KIDS_DISCLAIMER)

INDUSTRY_TOPIC_OVERRIDES['Thực phẩm bổ sung - Sức khỏe trẻ em'] = {
  'Tin tức ngành hàng': {
    titleCores: [
      'Cellrokids — thương hiệu chăm sóc sức khỏe trẻ em từ Hàn Quốc',
      'Hệ sinh thái dược phẩm Cellromax Science và dòng sản phẩm Cellrokids',
      'Xu hướng chọn sản phẩm bổ sung có nguồn gốc rõ ràng cho trẻ',
      'Tiêu chuẩn quốc tế trong sản xuất sản phẩm cho trẻ em',
      'Vì sao phụ huynh Việt quan tâm sản phẩm sức khỏe trẻ em Hàn Quốc',
    ],
    angles: ['có gì đặc biệt', 'phụ huynh nên biết', 'qua góc nhìn chuyên gia', 'đáng chú ý hiện nay', 'những điều cần hiểu đúng'],
    introFragments: [
      'Cellrokids được biết đến là thương hiệu phát triển từ hệ sinh thái dược phẩm Cellromax Science — đơn vị tiên phong tại Hàn Quốc trong nghiên cứu, phát triển và sản xuất các sản phẩm chất lượng cao vì sức khỏe trẻ em.',
      'Trong bối cảnh phụ huynh ngày càng kỹ tính khi chọn sản phẩm cho con, những thương hiệu có nền tảng nghiên cứu bài bản và nguồn gốc minh bạch đang được quan tâm nhiều hơn.',
      'Với mong muốn bảo vệ và cải thiện sức khỏe của trẻ, Cellrokids theo đuổi triết lý nói không với nguyên liệu chất lượng thấp và giá thành rẻ.',
    ],
    contextHeading: 'Về thương hiệu Cellrokids',
    contextFragments: [
      'Cellrokids thuộc hệ sinh thái dược phẩm Cellromax Science của Hàn Quốc, nơi các sản phẩm được nghiên cứu, phát triển và sản xuất trong cùng một quy trình khép kín.',
      'Các sản phẩm của thương hiệu được cấp bằng sáng chế và giấy chứng nhận đạt chuẩn quốc tế — điểm mà nhiều phụ huynh xem là thước đo quan trọng khi lựa chọn.',
      'Đội ngũ lãnh đạo và chuyên gia nghiên cứu của công ty đặt chất lượng nguyên liệu lên hàng đầu, không đánh đổi chất lượng để hạ giá thành.',
    ],
    detailHeading: 'Điều làm nên sự khác biệt',
    detailFragments: [
      'Nền tảng nghiên cứu dược phẩm giúp mỗi sản phẩm được phát triển dựa trên cơ sở khoa học thay vì chạy theo xu hướng thị trường.',
      'Nguyên liệu được chọn lọc kỹ lưỡng — đội ngũ chuyên gia thẳng thắn nói không với nguyên liệu chất lượng thấp, giá rẻ.',
      'Bằng sáng chế và chứng nhận đạt chuẩn quốc tế là minh chứng cho quy trình sản xuất được kiểm soát chặt chẽ.',
      'Sản phẩm được thiết kế riêng cho trẻ em, chú trọng sự an toàn và phù hợp với từng độ tuổi theo hướng dẫn trên bao bì.',
    ],
    bulletFragments: [
      'thương hiệu thuộc hệ sinh thái Cellromax Science, Hàn Quốc',
      'tiên phong nghiên cứu sản phẩm vì sức khỏe trẻ em',
      'sản phẩm có bằng sáng chế và chứng nhận chuẩn quốc tế',
      'nói không với nguyên liệu kém chất lượng, giá rẻ',
      'đội ngũ chuyên gia nghiên cứu đồng hành phát triển sản phẩm',
    ],
    bulletsHeading: 'Tóm tắt nhanh',
    adviceHeading: 'Phụ huynh nên lưu ý gì?',
    adviceFragments: [
      'chọn sản phẩm chính hãng, có tem nhãn và thông tin nhà sản xuất rõ ràng',
      'đọc kỹ hướng dẫn sử dụng, dùng đúng độ tuổi và liều lượng ghi trên bao bì',
      'tham khảo ý kiến bác sĩ hoặc chuyên gia dinh dưỡng nếu trẻ có vấn đề sức khỏe đặc biệt',
    ],
    faq: [
      { q: 'Cellrokids là thương hiệu của nước nào?', a: 'Cellrokids là thương hiệu phát triển từ hệ sinh thái dược phẩm Cellromax Science của Hàn Quốc.' },
      { q: 'Làm sao để mua đúng hàng chính hãng?', a: 'Nên mua tại cửa hàng, đại lý phân phối chính thức và kiểm tra tem nhãn, hạn sử dụng trước khi mua.' },
    ],
    closingHeading: 'Lời kết',
    closingFragments: [
      'Chọn sản phẩm cho con là chọn sự an tâm — và nguồn gốc rõ ràng, chất lượng nguyên liệu luôn là điều nên đặt lên đầu.',
      'Theo dõi chuyên mục để cập nhật thêm thông tin về chăm sóc sức khỏe trẻ em.',
      'Mọi thắc mắc về sản phẩm, đội ngũ tư vấn luôn sẵn sàng hỗ trợ phụ huynh.',
    ],
    ctaFragments: KIDS_CTA([
      'Liên hệ hotline để được tư vấn sản phẩm phù hợp với độ tuổi của bé.',
      'Ghé cửa hàng để được tư vấn trực tiếp về các sản phẩm Cellrokids chính hãng.',
      'Theo dõi fanpage để cập nhật kiến thức chăm sóc sức khỏe trẻ em.',
    ]),
    tagPool: ['cellrokids', 'sức khỏe trẻ em', 'hàn quốc', 'cellromax science', 'mẹ và bé'],
    imageKeyword: 'pharmaceutical laboratory|science laboratory|healthy children|happy children',
    titleImageKeywords: [
      'vitamin bottle|supplement bottle|happy children',
      'pharmaceutical laboratory|laboratory research|research scientist',
      'pharmacy shelves|pharmacy store|vitamin bottle',
      'laboratory research|laboratory equipment|research scientist',
      'mother child|parent child|family breakfast',
    ],
    titleIndustrySuffix: () => '',
  },
  'Mẹo hay & Kinh nghiệm': {
    titleCores: [
      'Cách chọn sản phẩm bổ sung an toàn cho trẻ',
      'Kinh nghiệm đọc nhãn sản phẩm dành cho trẻ em',
      'Xây dựng thói quen ăn uống lành mạnh cho bé',
      'Chăm sóc sức khỏe cho trẻ khi giao mùa',
      'Bổ sung dinh dưỡng cho trẻ biếng ăn',
    ],
    angles: ['bố mẹ nên biết', 'theo lời khuyên chuyên gia', 'đơn giản mà hiệu quả', 'cho phụ huynh lần đầu', 'tránh những sai lầm thường gặp'],
    introFragments: [
      'Sức khỏe của trẻ được xây dựng từ những thói quen nhỏ mỗi ngày: ăn uống đủ chất, ngủ đủ giấc, vận động và một tinh thần vui vẻ.',
      'Trước rất nhiều sản phẩm dành cho trẻ trên thị trường, không ít phụ huynh băn khoăn nên chọn thế nào cho an toàn và phù hợp.',
      'Bài viết tổng hợp những kinh nghiệm thực tế giúp bố mẹ chăm sóc sức khỏe cho con một cách khoa học hơn.',
    ],
    contextHeading: 'Vì sao cần chọn lựa kỹ?',
    contextFragments: [
      'Cơ thể trẻ đang phát triển nên nhạy cảm hơn người lớn — nguyên liệu kém chất lượng hay dùng sai cách đều có thể ảnh hưởng không tốt.',
      'Sản phẩm bổ sung chỉ hỗ trợ, không thay thế được bữa ăn đa dạng và chế độ sinh hoạt lành mạnh hằng ngày.',
      'Mỗi độ tuổi có nhu cầu dinh dưỡng khác nhau, vì vậy cần chọn sản phẩm đúng đối tượng ghi trên bao bì.',
    ],
    detailHeading: 'Kinh nghiệm thực tế',
    detailFragments: [
      'Ưu tiên thương hiệu có nền tảng nghiên cứu rõ ràng, có bằng sáng chế hoặc chứng nhận đạt chuẩn quốc tế như các sản phẩm Cellrokids.',
      'Đọc kỹ bảng thành phần, độ tuổi sử dụng, hạn sử dụng và thông tin nhà sản xuất trước khi mua.',
      'Duy trì bữa ăn đủ 4 nhóm chất, nhiều rau xanh và trái cây; hạn chế đồ ngọt, nước có gas và đồ ăn nhanh.',
      'Cho trẻ ngủ đủ giấc, vận động ngoài trời mỗi ngày — nền tảng quan trọng không sản phẩm nào thay thế được.',
    ],
    bulletFragments: [
      'chọn sản phẩm chính hãng, nguồn gốc rõ ràng',
      'dùng đúng độ tuổi, đúng liều theo hướng dẫn',
      'kết hợp chế độ ăn đa dạng, đủ chất',
      'theo dõi phản ứng của trẻ trong thời gian đầu sử dụng',
      'hỏi ý kiến bác sĩ khi trẻ có bệnh lý',
    ],
    bulletsHeading: 'Ghi nhớ nhanh',
    adviceHeading: 'Những sai lầm nên tránh',
    adviceFragments: [
      'tự ý tăng liều với mong muốn con khỏe nhanh hơn',
      'dùng cùng lúc quá nhiều loại sản phẩm bổ sung khác nhau',
      'mua sản phẩm trôi nổi, giá rẻ bất thường, không rõ nguồn gốc',
    ],
    faq: [
      { q: 'Trẻ ăn uống đầy đủ có cần dùng thêm sản phẩm bổ sung không?', a: 'Không phải trẻ nào cũng cần. Phụ huynh nên theo dõi thể trạng của con và tham khảo ý kiến bác sĩ trước khi bổ sung.' },
      { q: 'Nên cho trẻ dùng sản phẩm bổ sung vào lúc nào?', a: 'Thời điểm dùng tùy từng sản phẩm, phụ huynh nên làm theo hướng dẫn in trên bao bì.' },
    ],
    closingHeading: 'Lời kết',
    closingFragments: [
      'Chăm con khỏe không khó nếu bố mẹ kiên trì với những thói quen đúng và chọn sản phẩm có nguồn gốc rõ ràng.',
      'Hy vọng những kinh nghiệm trên giúp hành trình chăm con của bạn nhẹ nhàng hơn.',
      'Mỗi đứa trẻ là một cá thể riêng — hãy lắng nghe và quan sát con thật kỹ.',
    ],
    ctaFragments: KIDS_CTA([
      'Liên hệ hotline để được tư vấn chế độ chăm sóc phù hợp cho bé.',
      'Ghé cửa hàng để được tư vấn trực tiếp về sản phẩm Cellrokids.',
      'Theo dõi fanpage để nhận thêm kinh nghiệm chăm con mỗi tuần.',
    ]),
    tagPool: ['kinh nghiệm chăm con', 'dinh dưỡng cho trẻ', 'sức khỏe trẻ em', 'cellrokids', 'mẹ và bé'],
    imageKeyword: 'family breakfast|mother child|healthy children|kids playing',
    titleImageKeywords: [
      'pharmacy shelves|pharmacy store|drugstore',
      'vitamin bottle|pill bottle|supplement bottle',
      'children eating vegetables|kids healthy food|family breakfast',
      'sick child|child fever|child blanket',
      'toddler eating|child eating|kid eating',
    ],
    titleIndustrySuffix: () => '',
  },
  'Hướng dẫn sử dụng': {
    titleCores: [
      'Hướng dẫn cho trẻ dùng sản phẩm bổ sung đúng cách',
      'Hướng dẫn bảo quản sản phẩm dành cho trẻ em',
      'Hướng dẫn kiểm tra hàng chính hãng Cellrokids',
      'Hướng dẫn chọn sản phẩm theo độ tuổi của bé',
      'Hướng dẫn giúp trẻ hợp tác khi dùng sản phẩm bổ sung',
    ],
    angles: ['chi tiết từng bước', 'đơn giản cho bố mẹ', 'để đạt hiệu quả tốt nhất', 'an toàn cho bé', 'mà phụ huynh hay bỏ qua'],
    introFragments: [
      'Dùng đúng cách là yếu tố quan trọng để sản phẩm phát huy tác dụng và an toàn cho trẻ.',
      'Nhiều phụ huynh chỉ quan tâm chọn sản phẩm tốt mà bỏ qua cách dùng và bảo quản — điều ảnh hưởng không nhỏ tới chất lượng sản phẩm.',
      'Bài viết hướng dẫn những điều cơ bản bố mẹ cần nắm khi cho trẻ sử dụng các sản phẩm chăm sóc sức khỏe.',
    ],
    contextHeading: 'Trước khi cho trẻ sử dụng',
    contextFragments: [
      'Đọc kỹ hướng dẫn sử dụng, đối tượng sử dụng và lưu ý in trên bao bì sản phẩm.',
      'Kiểm tra hạn sử dụng, tem nhãn và tình trạng bao bì còn nguyên vẹn.',
      'Nếu trẻ đang dùng thuốc hoặc có bệnh lý, hỏi ý kiến bác sĩ trước khi bổ sung thêm sản phẩm.',
    ],
    detailHeading: 'Cách sử dụng và bảo quản',
    detailFragments: [
      'Dùng đúng liều lượng theo độ tuổi ghi trên bao bì, không tự ý tăng hoặc giảm liều.',
      'Duy trì đều đặn theo hướng dẫn thay vì dùng ngắt quãng, khi nhớ khi quên.',
      'Bảo quản nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp; đậy kín nắp sau mỗi lần dùng.',
      'Để sản phẩm xa tầm tay trẻ em, người lớn nên trực tiếp cho trẻ dùng theo đúng liều.',
    ],
    bulletFragments: [
      'đọc kỹ hướng dẫn trước khi dùng',
      'dùng đúng liều theo độ tuổi',
      'bảo quản nơi khô ráo, thoáng mát',
      'để xa tầm tay trẻ em',
      'ngưng dùng và hỏi bác sĩ nếu trẻ có biểu hiện bất thường',
    ],
    bulletsHeading: 'Lưu ý quan trọng',
    adviceHeading: 'Mẹo giúp bé hợp tác',
    adviceFragments: [
      'cho bé dùng vào một khung giờ cố định mỗi ngày để tạo thói quen',
      'khen ngợi, động viên thay vì ép buộc khi bé chưa quen',
      'giải thích đơn giản cho bé hiểu vì sao cần chăm sóc sức khỏe mỗi ngày',
    ],
    faq: [
      { q: 'Quên một lần dùng thì có cần dùng bù không?', a: 'Không nên dùng gấp đôi liều. Phụ huynh chỉ cần tiếp tục dùng theo lịch bình thường ở lần kế tiếp.' },
      { q: 'Làm sao nhận biết sản phẩm Cellrokids chính hãng?', a: 'Mua tại điểm bán chính thức, kiểm tra tem nhãn phụ tiếng Việt, thông tin nhà phân phối và hạn sử dụng trên bao bì.' },
    ],
    closingHeading: 'Lời kết',
    closingFragments: [
      'Dùng đúng cách, bảo quản đúng chuẩn là cách đơn giản nhất để bảo vệ sức khỏe của bé.',
      'Lưu lại bài hướng dẫn để tiện tra cứu khi cần.',
      'Nếu còn thắc mắc, phụ huynh đừng ngần ngại liên hệ để được tư vấn.',
    ],
    ctaFragments: KIDS_CTA([
      'Liên hệ hotline để được hướng dẫn sử dụng chi tiết.',
      'Nhắn tin fanpage để được tư vấn sản phẩm theo độ tuổi của bé.',
      'Ghé cửa hàng để kiểm tra và mua sản phẩm Cellrokids chính hãng.',
    ]),
    tagPool: ['hướng dẫn sử dụng', 'cellrokids', 'bảo quản sản phẩm', 'hàng chính hãng', 'sức khỏe trẻ em'],
    imageKeyword: 'mother child|parent child|healthy children|happy children',
    titleImageKeywords: [
      'pill bottle|vitamin bottle|mother child',
      'medicine cabinet|pill bottles|vitamin bottles',
      'pharmacy shelves|pharmacy store|drugstore',
      'siblings|toddler|happy children',
      'mother child|parent child|smiling child',
    ],
    titleIndustrySuffix: () => '',
  },
  'Khuyến mãi': {
    titleCores: [
      'Ưu đãi sản phẩm Cellrokids chính hãng',
      'Tuần lễ chăm sóc sức khỏe cho bé',
      'Quà tặng cho mẹ khi mua sản phẩm Cellrokids',
      'Ưu đãi mùa tựu trường cho bé',
      'Tri ân khách hàng thân thiết của Cellrokids',
    ],
    angles: ['— số lượng có hạn', 'trong tháng này', 'dành cho khách hàng mới', 'khi mua combo', 'tại cửa hàng và online'],
    introFragments: [
      'Nhằm đồng hành cùng các gia đình trong hành trình chăm sóc sức khỏe cho con, cửa hàng triển khai chương trình ưu đãi dành cho các sản phẩm Cellrokids chính hãng.',
      'Đây là dịp để phụ huynh sở hữu sản phẩm chất lượng từ hệ sinh thái dược phẩm Cellromax Science Hàn Quốc với chi phí tiết kiệm hơn.',
      'Chương trình áp dụng cho toàn bộ sản phẩm Cellrokids đang có tại cửa hàng trong thời gian diễn ra ưu đãi.',
    ],
    contextHeading: 'Vì sao nên tận dụng chương trình?',
    contextFragments: [
      'Cellrokids là thương hiệu phát triển từ Cellromax Science — đơn vị tiên phong tại Hàn Quốc về sản phẩm vì sức khỏe trẻ em.',
      'Sản phẩm có bằng sáng chế, chứng nhận đạt chuẩn quốc tế và cam kết không dùng nguyên liệu chất lượng thấp.',
      'Mua trong chương trình vẫn đảm bảo hàng chính hãng, đầy đủ tem nhãn và hạn sử dụng dài.',
    ],
    detailHeading: 'Cách nhận ưu đãi',
    detailFragments: [
      'Mua trực tiếp tại cửa hàng hoặc đặt hàng online trên website, ưu đãi được áp dụng tự động vào đơn hàng.',
      'Khách hàng mua combo nhiều sản phẩm sẽ nhận thêm quà tặng dành cho mẹ và bé.',
      'Số lượng quà tặng có hạn, ưu tiên các đơn hàng đặt sớm.',
    ],
    bulletFragments: [
      'cam kết hàng chính hãng Cellrokids',
      'giao hàng nhanh, đóng gói cẩn thận',
      'tư vấn miễn phí theo độ tuổi của bé',
      'quà tặng kèm cho đơn combo',
      'hỗ trợ đổi trả nếu sản phẩm lỗi từ nhà sản xuất',
    ],
    bulletsHeading: 'Quyền lợi khi mua hàng',
    adviceHeading: 'Lưu ý khi tham gia',
    adviceFragments: [
      'ưu đãi không áp dụng đồng thời với các chương trình khác',
      'chọn đúng sản phẩm theo độ tuổi của bé, cần thì nhờ nhân viên tư vấn',
      'kiểm tra sản phẩm khi nhận hàng',
    ],
    faq: [
      { q: 'Mua online có được ưu đãi như tại cửa hàng không?', a: 'Có, chương trình áp dụng cho cả đơn hàng tại cửa hàng và đơn đặt online.' },
      { q: 'Sản phẩm trong chương trình có phải hàng cận date không?', a: 'Không. Sản phẩm trong chương trình là hàng chính hãng, hạn sử dụng còn dài.' },
    ],
    closingHeading: 'Lời kết',
    closingFragments: [
      'Chăm sóc sức khỏe cho con với chi phí hợp lý hơn — đừng bỏ lỡ chương trình lần này.',
      'Cảm ơn quý phụ huynh đã tin chọn Cellrokids đồng hành cùng sức khỏe của bé.',
      'Ưu đãi có hạn, đặt hàng sớm để nhận đủ quà tặng.',
    ],
    ctaFragments: KIDS_CTA([
      'Đặt hàng ngay trên website để nhận ưu đãi.',
      'Liên hệ hotline để được tư vấn và giữ quà tặng.',
      'Ghé cửa hàng để mua sản phẩm Cellrokids với giá ưu đãi.',
    ]),
    tagPool: ['khuyến mãi', 'cellrokids', 'ưu đãi mẹ và bé', 'hàng chính hãng', 'quà tặng'],
    imageKeyword: 'happy children|smiling child|mother child|kids playing',
    titleImageKeywords: [
      'vitamin bottle|supplement bottle|gift box',
      'happy children|healthy children|kids playing',
      'gift box|gift boxes|wrapped gift',
      'kids playing|happy children|smiling child',
      'gift box|wrapped gift|mother child',
    ],
    titleIndustrySuffix: () => '',
  },
  'Đánh giá sản phẩm': {
    titleCores: [
      'Vì sao phụ huynh tin chọn Cellrokids',
      'Đánh giá thương hiệu Cellrokids',
      'Cellrokids và tiêu chí chọn sản phẩm cho trẻ của phụ huynh',
      'Cảm nhận của phụ huynh sau thời gian dùng Cellrokids cho con',
      'Cellrokids có gì khác so với sản phẩm trôi nổi',
    ],
    angles: ['qua trải nghiệm thực tế', 'ưu điểm nổi bật', 'những điều cần biết', 'có đáng tin không', 'qua các tiêu chí quan trọng'],
    introFragments: [
      'Khi chọn sản phẩm cho con, điều phụ huynh quan tâm nhất là an toàn, nguồn gốc rõ ràng và chất lượng thật sự.',
      'Bài viết điểm lại những tiêu chí giúp Cellrokids trở thành lựa chọn của nhiều gia đình trong việc chăm sóc sức khỏe trẻ em.',
      'Thay vì chỉ nhìn vào giá, phụ huynh ngày càng chú ý đến nền tảng nghiên cứu và nguyên liệu phía sau mỗi sản phẩm.',
    ],
    contextHeading: 'Tiêu chí đánh giá',
    contextFragments: [
      'Nguồn gốc: thương hiệu thuộc hệ sinh thái dược phẩm Cellromax Science, Hàn Quốc.',
      'Chất lượng: sản phẩm được cấp bằng sáng chế và giấy chứng nhận đạt chuẩn quốc tế.',
      'Nguyên liệu: cam kết nói không với nguyên liệu chất lượng thấp và giá thành rẻ.',
    ],
    detailHeading: 'Nhận xét chi tiết',
    detailFragments: [
      'Điểm cộng lớn nhất là nền tảng nghiên cứu dược phẩm — sản phẩm được phát triển bởi đội ngũ chuyên gia, không phải hàng gia công đại trà.',
      'Bằng sáng chế và chứng nhận quốc tế giúp phụ huynh có căn cứ rõ ràng để yên tâm, thay vì chỉ dựa vào lời quảng cáo.',
      'Triết lý không đánh đổi chất lượng lấy giá rẻ khiến giá sản phẩm có thể cao hơn hàng trôi nổi, nhưng đổi lại là sự an tâm về nguyên liệu.',
      'Bao bì, hướng dẫn sử dụng rõ ràng theo độ tuổi giúp bố mẹ dễ dàng cho con dùng đúng cách.',
    ],
    bulletFragments: [
      'nguồn gốc Hàn Quốc minh bạch',
      'có bằng sáng chế, chứng nhận quốc tế',
      'nguyên liệu được chọn lọc kỹ',
      'hướng dẫn sử dụng rõ ràng theo độ tuổi',
      'giá phản ánh đúng chất lượng',
    ],
    bulletsHeading: 'Tóm tắt đánh giá',
    adviceHeading: 'Lời khuyên cho phụ huynh',
    adviceFragments: [
      'chọn sản phẩm phù hợp nhu cầu và độ tuổi thực tế của con',
      'mua tại điểm bán chính thức để đảm bảo hàng chính hãng',
      'kết hợp sản phẩm với chế độ ăn uống và sinh hoạt lành mạnh',
    ],
    faq: [
      { q: 'Hiệu quả có giống nhau ở mọi trẻ không?', a: 'Không. Hiệu quả có thể khác nhau tùy thể trạng và chế độ sinh hoạt của từng trẻ.' },
      { q: 'Giá Cellrokids có cao hơn sản phẩm khác không?', a: 'Có thể cao hơn hàng trôi nổi do thương hiệu không dùng nguyên liệu giá rẻ, chất lượng thấp.' },
    ],
    closingHeading: 'Lời kết',
    closingFragments: [
      'Nguồn gốc rõ ràng, nghiên cứu bài bản và nguyên liệu chất lượng là những lý do khiến Cellrokids được nhiều phụ huynh tin chọn.',
      'Hy vọng bài đánh giá giúp bố mẹ có thêm thông tin trước khi chọn sản phẩm cho con.',
      'Mỗi lựa chọn cho con đều đáng được cân nhắc kỹ — và chất lượng luôn nên là ưu tiên số một.',
    ],
    ctaFragments: KIDS_CTA([
      'Liên hệ hotline để được tư vấn sản phẩm phù hợp cho bé.',
      'Ghé cửa hàng để xem trực tiếp các sản phẩm Cellrokids.',
      'Theo dõi fanpage để đọc thêm chia sẻ của các phụ huynh.',
    ]),
    tagPool: ['đánh giá', 'cellrokids', 'review sản phẩm cho bé', 'sức khỏe trẻ em', 'hàn quốc'],
    imageKeyword: 'pediatrician child|doctor child|mother child|healthy children',
    titleImageKeywords: [
      'mother child|parent child|smiling child',
      'vitamin bottle|supplement bottle|laboratory research',
      'pharmacy shelves|vitamin bottle|pill bottle',
      'happy children|smiling child|mother child',
      'laboratory research|pharmaceutical laboratory|pill bottle',
    ],
    titleIndustrySuffix: () => '',
  },
  'Sự kiện cửa hàng': {
    titleCores: [
      'Hội thảo chăm sóc sức khỏe trẻ em cùng chuyên gia',
      'Ra mắt sản phẩm mới của Cellrokids',
      'Ngày hội gia đình khỏe cùng Cellrokids',
      'Chương trình tư vấn dinh dưỡng miễn phí cho bé',
      'Cellrokids đồng hành cùng phụ huynh mùa tựu trường',
    ],
    angles: ['thông báo chính thức', 'mời quý phụ huynh tham dự', 'nhiều quà tặng hấp dẫn', 'cuối tuần này', 'số chỗ có hạn'],
    introFragments: [
      'Với mong muốn bảo vệ và cải thiện sức khỏe của trẻ, Cellrokids tổ chức chương trình dành riêng cho các gia đình có con nhỏ.',
      'Đây là dịp để phụ huynh gặp gỡ, trao đổi trực tiếp với chuyên gia về chăm sóc sức khỏe và dinh dưỡng cho trẻ.',
      'Kính mời quý phụ huynh cùng các bé tham gia chương trình với nhiều hoạt động bổ ích và quà tặng.',
    ],
    contextHeading: 'Nội dung chương trình',
    contextFragments: [
      'Chuyên gia chia sẻ kiến thức chăm sóc sức khỏe trẻ em theo từng độ tuổi và giải đáp thắc mắc của phụ huynh.',
      'Giới thiệu về hệ sinh thái dược phẩm Cellromax Science và quy trình nghiên cứu, sản xuất sản phẩm Cellrokids.',
      'Khu vui chơi dành cho các bé trong lúc bố mẹ tham gia tư vấn.',
    ],
    detailHeading: 'Thông tin tham dự',
    detailFragments: [
      'Phụ huynh đăng ký trước qua hotline hoặc fanpage để được giữ chỗ.',
      'Mỗi gia đình tham dự nhận quà tặng từ Cellrokids, số lượng có hạn.',
      'Chương trình miễn phí tham dự, không bắt buộc mua hàng.',
    ],
    bulletFragments: [
      'trao đổi trực tiếp với chuyên gia',
      'tư vấn miễn phí theo độ tuổi của bé',
      'quà tặng cho mỗi gia đình',
      'ưu đãi riêng cho khách tham dự',
      'khu vui chơi cho bé',
    ],
    bulletsHeading: 'Điểm nổi bật',
    adviceHeading: 'Để tham gia thuận lợi',
    adviceFragments: [
      'đăng ký sớm vì số chỗ có hạn',
      'chuẩn bị trước các câu hỏi về sức khỏe của bé để được giải đáp',
      'đến sớm 15 phút để check-in và nhận quà',
    ],
    faq: [
      { q: 'Tham dự có mất phí không?', a: 'Chương trình hoàn toàn miễn phí, phụ huynh chỉ cần đăng ký trước để giữ chỗ.' },
      { q: 'Có thể đưa bé đi cùng không?', a: 'Có. Chương trình có khu vui chơi riêng cho các bé.' },
    ],
    closingHeading: 'Lời kết',
    closingFragments: [
      'Rất mong được gặp quý phụ huynh và các bé tại chương trình.',
      'Cellrokids mong muốn đồng hành cùng các gia đình trên hành trình nuôi dạy con khỏe mạnh.',
      'Cảm ơn quý phụ huynh đã luôn quan tâm và tin tưởng.',
    ],
    ctaFragments: KIDS_CTA([
      'Đăng ký tham dự ngay qua hotline.',
      'Nhắn tin fanpage để giữ chỗ cho gia đình bạn.',
      'Theo dõi fanpage để cập nhật lịch chương trình mới nhất.',
    ]),
    tagPool: ['sự kiện', 'cellrokids', 'hội thảo sức khỏe trẻ em', 'mẹ và bé', 'tư vấn dinh dưỡng'],
    imageKeyword: 'happy children|kids playing|family breakfast|mother child',
    titleImageKeywords: [
      'health seminar|seminar audience|conference audience',
      'vitamin bottle|supplement bottle|gift box',
      'family event|kids party|children party',
      'pediatrician child|doctor child|children eating vegetables',
      'kids playing|happy children|children party',
    ],
    titleIndustrySuffix: () => '',
  },
}

/**
 * Ngành Thiết bị nhà bếp (bếp từ, hút mùi, lò, máy rửa bát, chậu vòi, lọc nước, gia dụng bếp, nồi chảo) — mỗi tiêu đề có ảnh
 * riêng (titleImageKeywords) để ảnh khớp đúng thiết bị bài đang nói tới.
 */
INDUSTRY_TOPIC_OVERRIDES['Thiết bị nhà bếp'] = {
  'Tin tức ngành hàng': {
    titleCores: [
      'Xu hướng bếp từ âm kính cho căn hộ hiện đại',
      'Máy rửa bát ngày càng phổ biến trong gia đình Việt',
      'Bếp liền khối: thiết bị âm tủ lên ngôi',
      'Thiết bị bếp thông minh kết nối điện thoại',
      'Nồi chiên không dầu và xu hướng nấu ăn ít dầu mỡ',
    ],
    angles: ['năm nay có gì mới', 'đáng chú ý nhất hiện nay', 'người tiêu dùng đang quan tâm', 'thay đổi ra sao', 'qua góc nhìn chuyên gia'],
    introFragments: [
      'Căn bếp ngày càng được đầu tư như một không gian sống chính, kéo theo nhu cầu thiết bị bếp vừa đẹp, vừa tiện, vừa tiết kiệm thời gian.',
      'Từ bếp từ, máy hút mùi đến máy rửa bát, thiết bị nhà bếp đang thay đổi nhanh về công nghệ và thiết kế.',
      'Người nội trợ hiện đại không chỉ cần nấu nhanh mà còn muốn căn bếp sạch sẽ, an toàn và dễ dọn dẹp.',
    ],
    contextHeading: 'Bối cảnh thị trường',
    contextFragments: [
      'Căn hộ chung cư diện tích vừa phải khiến thiết bị âm tủ, gọn gàng được ưu tiên hơn các thiết bị đặt rời cồng kềnh.',
      'Bếp từ dần thay thế bếp gas nhờ an toàn hơn, nấu nhanh hơn và mặt kính dễ lau chùi.',
      'Máy rửa bát, máy lọc nước từng được xem là xa xỉ nay đã trở thành thiết bị quen thuộc trong nhiều gia đình trẻ.',
    ],
    detailHeading: 'Những điểm mới đáng chú ý',
    detailFragments: [
      'Bếp từ đời mới có cảm ứng trượt, tự nhận diện vùng nấu theo kích thước nồi và khóa an toàn trẻ em.',
      'Máy hút mùi chạy êm hơn, tự điều chỉnh tốc độ theo lượng khói và có chế độ hút sau khi nấu xong.',
      'Lò nướng âm tủ tích hợp chức năng hấp, nướng đối lưu, giúp một thiết bị làm được nhiều món.',
      'Máy rửa bát mini 6 – 8 bộ phù hợp gia đình ít người, lắp được cả ở bếp nhỏ.',
    ],
    bulletFragments: [
      'bếp từ âm kính thay thế dần bếp gas',
      'thiết bị âm tủ cho bếp gọn gàng',
      'máy rửa bát mini cho gia đình nhỏ',
      'máy hút mùi chạy êm, tự động',
      'nồi chiên không dầu cho bữa ăn ít dầu mỡ',
    ],
    bulletsHeading: 'Tóm tắt nhanh',
    adviceHeading: 'Người mua nên lưu ý gì?',
    adviceFragments: [
      'đo kích thước tủ bếp trước khi chọn thiết bị âm tủ',
      'kiểm tra nguồn điện, aptomat riêng cho bếp từ và lò nướng công suất lớn',
      'ưu tiên hàng chính hãng có bảo hành và lắp đặt tận nơi',
    ],
    faq: [
      { q: 'Bếp từ có tốn điện không?', a: 'Bếp từ truyền nhiệt trực tiếp vào đáy nồi nên hiệu suất cao, nấu nhanh hơn và thường tiết kiệm hơn bếp hồng ngoại.' },
      { q: 'Nhà ít người có nên mua máy rửa bát?', a: 'Có thể chọn dòng mini 6 – 8 bộ, vừa tiết kiệm nước vừa giải phóng thời gian rửa bát mỗi ngày.' },
    ],
    closingHeading: 'Lời kết',
    closingFragments: [
      'Thiết bị bếp thay đổi nhanh, nhưng tiêu chí chọn mua vẫn là an toàn, bền và phù hợp không gian.',
      'Theo dõi chuyên mục để cập nhật sớm các dòng thiết bị bếp mới.',
      'Mọi thắc mắc về thiết bị, đội ngũ kỹ thuật luôn sẵn sàng tư vấn miễn phí.',
    ],
    ctaFragments: [
      'Ghé showroom để trải nghiệm trực tiếp các thiết bị bếp mới nhất.',
      'Gọi hotline để được tư vấn bộ thiết bị phù hợp với căn bếp nhà bạn.',
      'Theo dõi fanpage để không bỏ lỡ tin tức và ưu đãi mới.',
    ],
    tagPool: ['tin tức nhà bếp', 'bếp từ', 'máy rửa bát', 'thiết bị âm tủ', 'xu hướng'],
    imageKeyword: 'modern kitchen|kitchen interior',
    titleImageKeywords: [
      'induction cooktop|induction stove|induction hob -fire -flame',
      'dishwasher|dish washer',
      'built in oven|modern kitchen|kitchen interior -pizza -bread',
      'modern kitchen|kitchen interior|kitchen appliances',
      'air fryer|airfryer',
    ],
    titleIndustrySuffix: () => '',
  },
  'Mẹo hay & Kinh nghiệm': {
    titleCores: [
      'Cách chọn bếp từ phù hợp cho gia đình',
      'Kinh nghiệm chọn máy hút mùi đúng công suất',
      'Nên chọn chậu rửa bát inox hay chậu đá',
      'Cách chọn máy lọc nước cho gia đình',
      'Kinh nghiệm chọn bộ nồi, chảo dùng cho bếp từ',
    ],
    angles: ['không phải ai cũng biết', 'cho người mới sắm bếp', 'tránh mua sai', 'theo kinh nghiệm thợ lắp đặt', 'tiết kiệm mà vẫn bền'],
    introFragments: [
      'Sắm thiết bị bếp là khoản đầu tư dùng nhiều năm, chọn sai không chỉ tốn tiền mà còn bất tiện mỗi ngày nấu nướng.',
      'Không ít gia đình mua thiết bị theo quảng cáo rồi mới phát hiện không vừa tủ bếp hoặc không hợp thói quen nấu.',
      'Bài viết tổng hợp kinh nghiệm thực tế từ đội ngũ kỹ thuật lắp đặt thiết bị bếp nhiều năm.',
    ],
    contextHeading: 'Vì sao cần chọn kỹ?',
    contextFragments: [
      'Thiết bị âm tủ cần khớp kích thước khoét đá, khoét tủ — chọn sai phải sửa tủ rất tốn kém.',
      'Công suất bếp từ, lò nướng cần phù hợp đường điện trong nhà để tránh nhảy aptomat.',
      'Máy hút mùi quá yếu so với diện tích bếp sẽ không hút hết khói, dầu mỡ bám tủ bếp nhanh hơn.',
    ],
    detailHeading: 'Kinh nghiệm thực tế',
    detailFragments: [
      'Bếp từ đôi phù hợp gia đình 3 – 5 người; nhà nấu nhiều món cùng lúc nên chọn bếp ba hoặc bếp từ kết hợp hồng ngoại.',
      'Máy hút mùi nên rộng bằng hoặc hơn mặt bếp, lắp cách mặt bếp khoảng 65 – 75 cm để hút hiệu quả.',
      'Chậu inox bền, rẻ, dễ vệ sinh; chậu đá nhân tạo sang trọng, ít ồn nhưng giá cao hơn và cần tránh va đập mạnh.',
      'Nồi, chảo dùng cho bếp từ phải có đáy nhiễm từ — thử bằng nam châm, hút chặt là dùng được.',
    ],
    bulletFragments: [
      'đo kích thước tủ trước khi mua thiết bị âm',
      'kiểm tra đường điện cho bếp từ, lò nướng',
      'máy hút mùi rộng bằng hoặc hơn mặt bếp',
      'nồi chảo phải có đáy nhiễm từ',
      'chọn máy lọc nước theo nguồn nước nhà dùng',
    ],
    bulletsHeading: 'Ghi nhớ nhanh',
    adviceHeading: 'Những sai lầm nên tránh',
    adviceFragments: [
      'chỉ nhìn công suất danh nghĩa mà bỏ qua nhu cầu thực tế',
      'mua thiết bị trôi nổi, không có bảo hành chính hãng',
      'tự lắp đặt thiết bị âm tủ khi chưa có kinh nghiệm',
    ],
    faq: [
      { q: 'Nồi gang, nồi nhôm có dùng được bếp từ không?', a: 'Nồi gang dùng được. Nồi nhôm thường không nhiễm từ, trừ loại có đáy từ ghép thêm.' },
      { q: 'Nhà dùng nước máy có cần máy lọc nước RO không?', a: 'Nước máy đã qua xử lý nhưng vẫn có thể còn cặn, clo. Máy lọc giúp nước uống trực tiếp an toàn và ngon hơn.' },
    ],
    closingHeading: 'Lời kết',
    closingFragments: [
      'Chọn đúng thiết bị ngay từ đầu giúp căn bếp dùng bền, đẹp và tiện lợi nhiều năm.',
      'Hy vọng những kinh nghiệm trên giúp bạn sắm bếp tự tin hơn.',
      'Cần tư vấn cấu hình bếp cụ thể, cứ liên hệ đội ngũ kỹ thuật để được hỗ trợ.',
    ],
    ctaFragments: [
      'Gọi hotline để được tư vấn thiết bị theo kích thước bếp nhà bạn.',
      'Ghé showroom để xem và thử trực tiếp các thiết bị.',
      'Theo dõi fanpage để nhận thêm mẹo hay cho căn bếp.',
    ],
    tagPool: ['kinh nghiệm chọn mua', 'bếp từ', 'máy hút mùi', 'chậu rửa', 'máy lọc nước'],
    imageKeyword: 'modern kitchen|kitchen interior',
    titleImageKeywords: [
      'induction cooktop|induction stove|induction hob -fire -flame',
      'range hood|exhaust hood|cooker hood -hoodie -hooded -lens -halloween',
      'kitchen sink|stainless steel sink|double sink -bathroom -mirror',
      'water purifier|water dispenser|water filter -soap -coffee -beauty -beverage -umbrella',
      'cooking pot|frying pan|saucepan|pots pans -cutlery -flowerpot -poterie -teapot -coffee',
    ],
    titleIndustrySuffix: () => '',
  },
  'Hướng dẫn sử dụng': {
    titleCores: [
      'Hướng dẫn sử dụng bếp từ an toàn, bền lâu',
      'Hướng dẫn vệ sinh máy hút mùi tại nhà',
      'Hướng dẫn xếp bát đĩa vào máy rửa bát đúng cách',
      'Hướng dẫn vệ sinh lò vi sóng nhanh sạch',
      'Hướng dẫn thay lõi lọc máy lọc nước',
    ],
    angles: ['chi tiết từng bước', 'đơn giản tại nhà', 'chỉ trong 10 phút', 'để thiết bị bền hơn', 'mà nhiều người làm sai'],
    introFragments: [
      'Thiết bị bếp tốt đến đâu cũng cần dùng và vệ sinh đúng cách mới bền và an toàn.',
      'Nhiều hư hỏng của thiết bị bếp đến từ thói quen sử dụng sai mà người dùng không để ý.',
      'Bài viết hướng dẫn từng bước để bạn tự chăm sóc thiết bị tại nhà mà không cần gọi thợ.',
    ],
    contextHeading: 'Trước khi bắt đầu',
    contextFragments: [
      'Tắt nguồn và chờ thiết bị nguội hoàn toàn trước khi vệ sinh.',
      'Chuẩn bị khăn mềm, nước ấm và dung dịch tẩy rửa trung tính — tránh dùng miếng cọ kim loại làm xước bề mặt.',
      'Đọc lại sách hướng dẫn đi kèm để biết các bộ phận tháo rời được.',
    ],
    detailHeading: 'Cách thực hiện',
    detailFragments: [
      'Với bếp từ, đặt nồi đúng tâm vùng nấu, không kéo lê nồi trên mặt kính và lau sạch mặt bếp sau mỗi lần nấu.',
      'Lưới lọc máy hút mùi nên tháo ra ngâm nước ấm pha nước rửa bát 15 – 20 phút rồi chải sạch, làm định kỳ mỗi tháng.',
      'Xếp bát đĩa trong máy rửa bát úp mặt bẩn về phía tay phun, không xếp chồng khít lên nhau; cặn thức ăn lớn nên gạt bỏ trước.',
      'Lò vi sóng có thể làm sạch bằng cách hâm nóng một bát nước pha chanh vài phút cho hơi nước làm mềm vết bẩn rồi lau.',
    ],
    bulletFragments: [
      'luôn ngắt nguồn trước khi vệ sinh',
      'không dùng miếng cọ kim loại',
      'vệ sinh lưới lọc hút mùi mỗi tháng',
      'thay lõi lọc nước đúng định kỳ',
      'không để kim loại vào lò vi sóng',
    ],
    bulletsHeading: 'Lưu ý quan trọng',
    adviceHeading: 'Mẹo để thiết bị bền hơn',
    adviceFragments: [
      'lau khô thiết bị sau khi vệ sinh, tránh để đọng nước',
      'dùng ổn áp hoặc aptomat riêng cho thiết bị công suất lớn',
      'bảo dưỡng định kỳ tại trung tâm bảo hành chính hãng',
    ],
    faq: [
      { q: 'Mặt kính bếp từ bị ố vàng phải làm sao?', a: 'Dùng dung dịch chuyên dụng cho mặt kính bếp hoặc giấm pha loãng, lau bằng khăn mềm khi bếp đã nguội.' },
      { q: 'Bao lâu thì thay lõi lọc máy lọc nước?', a: 'Tùy từng cấp lọc và chất lượng nước, thường từ 3 đến 24 tháng — xem hướng dẫn của hãng hoặc nhờ kỹ thuật viên kiểm tra.' },
    ],
    closingHeading: 'Lời kết',
    closingFragments: [
      'Chỉ vài phút chăm sóc mỗi tuần giúp thiết bị bếp luôn sạch đẹp và bền bỉ.',
      'Lưu lại bài hướng dẫn để tiện làm theo khi cần.',
      'Nếu thiết bị có dấu hiệu bất thường, hãy liên hệ trung tâm bảo hành để được kiểm tra.',
    ],
    ctaFragments: [
      'Gọi hotline để đặt lịch bảo dưỡng thiết bị tận nhà.',
      'Ghé cửa hàng để mua lõi lọc, phụ kiện chính hãng.',
      'Theo dõi fanpage để nhận thêm hướng dẫn hữu ích.',
    ],
    tagPool: ['hướng dẫn sử dụng', 'vệ sinh thiết bị bếp', 'bếp từ', 'máy rửa bát', 'bảo dưỡng'],
    imageKeyword: 'modern kitchen|kitchen interior',
    titleImageKeywords: [
      'induction cooktop|induction stove|induction hob -fire -flame',
      'range hood|exhaust hood|cooker hood -hoodie -hooded -lens -halloween',
      'dishwasher|dish washer',
      'microwave oven|microwave -pizza -cat',
      'water purifier|water dispenser|water filter -soap -coffee -beauty -beverage -umbrella',
    ],
    titleIndustrySuffix: () => '',
  },
  'Khuyến mãi': {
    titleCores: [
      'Ưu đãi trọn bộ thiết bị bếp âm tủ',
      'Giảm giá bếp từ và máy hút mùi',
      'Sale máy rửa bát mùa cuối năm',
      'Tặng bộ nồi khi mua bếp từ',
      'Ưu đãi gia dụng nhà bếp cho nhà mới',
    ],
    angles: ['— giảm đến 30%', 'kèm lắp đặt miễn phí', 'trong tháng này', 'trả góp 0% lãi suất', '— số lượng có hạn'],
    introFragments: [
      'Nếu bạn đang chuẩn bị làm bếp mới hoặc nâng cấp thiết bị, đây là thời điểm hợp lý để tiết kiệm đáng kể chi phí.',
      'Showroom triển khai chương trình ưu đãi cho các dòng thiết bị bếp được khách hàng quan tâm nhiều nhất.',
      'Chương trình áp dụng cho cả thiết bị bếp âm tủ lẫn gia dụng nhà bếp chính hãng.',
    ],
    contextHeading: 'Vì sao nên mua lúc này?',
    contextFragments: [
      'Mua trọn bộ thiết bị bếp cùng lúc giúp đồng bộ thiết kế và được mức giá tốt hơn mua lẻ từng món.',
      'Chương trình kèm lắp đặt miễn phí, tiết kiệm thêm chi phí thi công.',
      'Hàng chính hãng, bảo hành đầy đủ theo chính sách của hãng.',
    ],
    detailHeading: 'Cách nhận ưu đãi',
    detailFragments: [
      'Đặt hàng tại showroom hoặc online, ưu đãi được áp dụng trực tiếp vào hóa đơn.',
      'Khách mua combo bếp từ và máy hút mùi được tặng thêm bộ nồi dùng cho bếp từ.',
      'Hỗ trợ trả góp 0% qua thẻ tín dụng cho đơn hàng từ giá trị nhất định.',
    ],
    bulletFragments: [
      'hàng chính hãng, bảo hành đầy đủ',
      'lắp đặt miễn phí nội thành',
      'tặng quà khi mua combo',
      'trả góp 0% lãi suất',
      'đổi mới trong 7 ngày nếu lỗi nhà sản xuất',
    ],
    bulletsHeading: 'Quyền lợi khi mua hàng',
    adviceHeading: 'Lưu ý khi tham gia',
    adviceFragments: [
      'ưu đãi không cộng dồn với chương trình khác',
      'đo kích thước tủ bếp trước khi đặt thiết bị âm tủ',
      'đặt lịch lắp đặt sớm trong mùa cao điểm',
    ],
    faq: [
      { q: 'Mua online có được lắp đặt miễn phí không?', a: 'Có, đơn hàng online trong khu vực nội thành được lắp đặt miễn phí như mua tại showroom.' },
      { q: 'Có được xem hàng trước khi thanh toán không?', a: 'Có. Khách được kiểm tra hàng trước khi kỹ thuật viên tiến hành lắp đặt.' },
    ],
    closingHeading: 'Lời kết',
    closingFragments: [
      'Ưu đãi có hạn — đặt hàng sớm để sở hữu căn bếp mơ ước với chi phí tiết kiệm.',
      'Cảm ơn quý khách đã tin chọn thiết bị bếp chính hãng tại cửa hàng.',
      'Liên hệ ngay để được tư vấn combo phù hợp.',
    ],
    ctaFragments: [
      'Gọi hotline để giữ ưu đãi và đặt lịch lắp đặt.',
      'Ghé showroom để xem trực tiếp các thiết bị trong chương trình.',
      'Đặt hàng online để nhận ưu đãi ngay.',
    ],
    tagPool: ['khuyến mãi', 'thiết bị bếp giá tốt', 'bếp từ', 'máy rửa bát', 'trả góp 0%'],
    imageKeyword: 'modern kitchen|kitchen interior',
    titleImageKeywords: [
      'built in oven|modern kitchen|kitchen interior -pizza -bread',
      'induction cooktop|range hood|exhaust hood -fire -flame -hoodie -hooded -lens',
      'dishwasher|dish washer',
      'cooking pot|stainless pot|saucepan|pots pans -cutlery -flowerpot -poterie -teapot -coffee',
      'air fryer|blender|electric kettle -watch',
    ],
    titleIndustrySuffix: () => '',
  },
  'Đánh giá sản phẩm': {
    titleCores: [
      'Đánh giá bếp từ đôi tầm trung',
      'Đánh giá máy rửa bát mini cho gia đình nhỏ',
      'So sánh bếp từ và bếp gas',
      'Đánh giá nồi chiên không dầu dung tích lớn',
      'So sánh máy ép chậm và máy xay sinh tố',
    ],
    angles: ['sau 6 tháng sử dụng', 'ưu và nhược điểm', 'có đáng tiền không', 'nên chọn loại nào', 'từ trải nghiệm thực tế'],
    introFragments: [
      'Trước khi xuống tiền cho một thiết bị bếp, nhiều người muốn nghe đánh giá thực tế từ người đã dùng.',
      'Bài viết đánh giá dựa trên trải nghiệm sử dụng hằng ngày, không chỉ dựa vào thông số trên giấy.',
      'Mỗi thiết bị có ưu điểm riêng, quan trọng là phù hợp nhu cầu và thói quen nấu nướng của gia đình bạn.',
    ],
    contextHeading: 'Tiêu chí đánh giá',
    contextFragments: [
      'Hiệu quả: nấu nhanh, sạch, ổn định trong quá trình dùng thực tế.',
      'Tiện lợi: dễ thao tác, dễ vệ sinh, phù hợp không gian bếp.',
      'Chi phí: giá mua, điện năng tiêu thụ và chi phí bảo dưỡng lâu dài.',
    ],
    detailHeading: 'Nhận xét chi tiết',
    detailFragments: [
      'Bếp từ đôi tầm trung đáp ứng tốt nhu cầu gia đình 3 – 5 người, nấu nhanh, mặt kính dễ lau; điểm trừ là kén nồi đáy từ.',
      'Bếp gas lửa mạnh, dùng được mọi loại nồi nhưng nóng bếp, khó vệ sinh và kém an toàn hơn bếp từ.',
      'Máy rửa bát mini rửa sạch, sấy khô tốt, tiết kiệm nước so với rửa tay; cần thời gian làm quen cách xếp bát.',
      'Máy ép chậm giữ được nhiều nước và ít bọt; máy xay sinh tố đa năng hơn, làm được cả sinh tố, xay thịt, xay hạt.',
    ],
    bulletFragments: [
      'bếp từ: an toàn, nhanh, dễ lau',
      'bếp gas: lửa mạnh, dùng mọi loại nồi',
      'máy rửa bát: tiết kiệm thời gian, nước',
      'máy ép chậm: nước ép ngon, ít bọt',
      'máy xay: đa năng, giá dễ tiếp cận',
    ],
    bulletsHeading: 'Tóm tắt đánh giá',
    adviceHeading: 'Lời khuyên lựa chọn',
    adviceFragments: [
      'chọn thiết bị theo thói quen nấu nướng thực tế của gia đình',
      'ưu tiên thương hiệu có trung tâm bảo hành gần nhà',
      'đọc kỹ chính sách đổi trả trước khi mua',
    ],
    faq: [
      { q: 'Bếp từ có độc hại không?', a: 'Bếp từ đạt chuẩn an toàn, từ trường chỉ tập trung ở vùng nấu và rất yếu khi đứng cách bếp vài chục cm.' },
      { q: 'Máy rửa bát có rửa được nồi chảo không?', a: 'Rửa được nồi chảo inox; chảo chống dính, đồ gỗ, đồ gang nên rửa tay để bền hơn.' },
    ],
    closingHeading: 'Lời kết',
    closingFragments: [
      'Hiểu rõ ưu nhược điểm giúp bạn chọn đúng thiết bị cho căn bếp của mình.',
      'Hy vọng bài đánh giá giúp bạn có thêm góc nhìn trước khi quyết định.',
      'Đội ngũ tư vấn luôn sẵn sàng giải đáp thêm về từng thiết bị.',
    ],
    ctaFragments: [
      'Ghé showroom để trải nghiệm trực tiếp trước khi mua.',
      'Gọi hotline để được tư vấn và so sánh các dòng thiết bị.',
      'Theo dõi fanpage để xem thêm các bài đánh giá mới.',
    ],
    tagPool: ['đánh giá', 'review thiết bị bếp', 'bếp từ', 'máy rửa bát', 'nồi chiên không dầu'],
    imageKeyword: 'modern kitchen|kitchen interior',
    titleImageKeywords: [
      'induction cooktop|induction stove|induction hob -fire -flame',
      'dishwasher|dish washer',
      'gas stove|gas cooktop|induction cooktop -fire',
      'air fryer|airfryer',
      'slow juicer|juicer|blender -watch',
    ],
    titleIndustrySuffix: () => '',
  },
  'Sự kiện cửa hàng': {
    titleCores: [
      'Khai trương showroom thiết bị nhà bếp mới',
      'Ngày hội nấu ăn cùng bếp từ',
      'Trải nghiệm miễn phí máy rửa bát tại showroom',
      'Workshop làm bánh với lò nướng âm tủ',
      'Tuần lễ bảo dưỡng thiết bị bếp miễn phí',
    ],
    angles: ['thông báo chính thức', 'mời quý khách tham dự', 'nhiều quà tặng hấp dẫn', 'cuối tuần này', 'số chỗ có hạn'],
    introFragments: [
      'Nhằm mang đến trải nghiệm thực tế cho khách hàng, cửa hàng tổ chức chương trình đặc biệt tại showroom.',
      'Đây là dịp để quý khách tận tay trải nghiệm các thiết bị bếp trước khi quyết định mua.',
      'Kính mời quý khách và gia đình tham gia chương trình với nhiều hoạt động thú vị.',
    ],
    contextHeading: 'Nội dung chương trình',
    contextFragments: [
      'Đầu bếp trình diễn nấu ăn trực tiếp trên bếp từ, lò nướng và nồi chiên không dầu.',
      'Kỹ thuật viên hướng dẫn cách sử dụng, vệ sinh và bảo dưỡng thiết bị đúng cách.',
      'Tư vấn thiết kế, bố trí thiết bị cho từng kiểu bếp.',
    ],
    detailHeading: 'Thông tin tham dự',
    detailFragments: [
      'Quý khách đăng ký trước qua hotline hoặc fanpage để được giữ chỗ.',
      'Khách tham dự nhận quà tặng và ưu đãi riêng khi mua hàng trong ngày.',
      'Chương trình miễn phí tham dự, không bắt buộc mua hàng.',
    ],
    bulletFragments: [
      'trải nghiệm thiết bị trực tiếp',
      'trình diễn nấu ăn cùng đầu bếp',
      'tư vấn thiết kế bếp miễn phí',
      'quà tặng cho khách tham dự',
      'ưu đãi riêng trong ngày sự kiện',
    ],
    bulletsHeading: 'Điểm nổi bật',
    adviceHeading: 'Để tham gia thuận lợi',
    adviceFragments: [
      'đăng ký sớm vì số chỗ có hạn',
      'mang theo kích thước bếp nhà để được tư vấn chính xác',
      'đến sớm 15 phút để nhận quà',
    ],
    faq: [
      { q: 'Tham dự có mất phí không?', a: 'Chương trình hoàn toàn miễn phí, chỉ cần đăng ký trước để giữ chỗ.' },
      { q: 'Có được mua hàng với giá ưu đãi trong ngày không?', a: 'Có, khách tham dự được áp dụng ưu đãi riêng cho đơn hàng trong ngày sự kiện.' },
    ],
    closingHeading: 'Lời kết',
    closingFragments: [
      'Rất mong được đón tiếp quý khách tại showroom.',
      'Cảm ơn quý khách đã luôn quan tâm và đồng hành cùng cửa hàng.',
      'Theo dõi fanpage để cập nhật các chương trình tiếp theo.',
    ],
    ctaFragments: [
      'Đăng ký tham dự ngay qua hotline.',
      'Nhắn tin fanpage để giữ chỗ.',
      'Ghé showroom để được tư vấn trực tiếp.',
    ],
    tagPool: ['sự kiện', 'showroom', 'trải nghiệm thiết bị bếp', 'workshop', 'ưu đãi'],
    imageKeyword: 'modern kitchen|kitchen interior',
    titleImageKeywords: [
      'kitchen showroom|modern kitchen|kitchen interior',
      'cooking class|chef cooking|induction cooktop -fire -flame',
      'dishwasher|dish washer',
      'baking class|built in oven|electric oven -pizza',
      'range hood|exhaust hood|built in oven -hoodie -hooded -lens -halloween -pizza',
    ],
    titleIndustrySuffix: () => '',
  },
}

interface GalleryAlbum {
  title: string
  imageKeyword: string
}

/**
 * Blog "Album" (VD blog tên "Album", "Album ảnh") — bài viết chỉ toàn ảnh, không có chữ. Bản nháp để trống nội dung,
 * lúc đăng mới dựng nội dung bằng bộ ảnh tìm được (xem buildGalleryContentHtml + App.tsx postArticle).
 */
export function isGalleryBlog(blogName?: string): boolean {
  return !!blogName && blogName.toLowerCase().includes('album')
}

/** Nội dung bài viết chỉ gồm ảnh, xếp dọc full chiều rộng — dùng cho blog Album (xem isGalleryBlog). */
export function buildGalleryContentHtml(imageUrls: string[], alt: string): string {
  const safeAlt = alt.replace(/"/g, '&quot;')
  return imageUrls.map((src) => `<p><img src="${src}" alt="${safeAlt}" style="width:100%;height:auto;" /></p>`).join('\n')
}

/** Tên album × từ khóa ảnh riêng từng album — để mỗi album ra bộ ảnh khác nhau, không dùng chung 1 từ khóa cả ngành. */
const GALLERY_ALBUMS: Partial<Record<Industry, GalleryAlbum[]>> = {
  'Studio - Chụp ảnh & Quay phim': [
    { title: 'Album ảnh cưới', imageKeyword: 'wedding couple photoshoot' },
    { title: 'Album ảnh cưới ngoại cảnh', imageKeyword: 'wedding couple outdoor photoshoot' },
    { title: 'Album ảnh gia đình', imageKeyword: 'family portrait photoshoot' },
    { title: 'Album ảnh bé yêu', imageKeyword: 'baby newborn photoshoot' },
    { title: 'Album ảnh kỷ yếu', imageKeyword: 'graduation students group photo' },
    { title: 'Album ảnh chân dung', imageKeyword: 'professional headshot portrait' },
    { title: 'Album ảnh sản phẩm', imageKeyword: 'product photography studio' },
    { title: 'Hậu trường buổi chụp', imageKeyword: 'photographer behind the scenes' },
  ],
  'Vận tải - Gửi hàng, Chành xe': [
    { title: 'Album đội xe tải', imageKeyword: 'cargo truck|freight truck|semi truck|delivery truck' },
    { title: 'Album xe khách giường nằm', imageKeyword: 'coach bus|sleeper bus|intercity bus|luxury bus' },
    { title: 'Album bốc xếp hàng hóa', imageKeyword: 'truck loading|forklift truck|loading truck|cargo truck' },
    { title: 'Album xe chở hàng đi tỉnh', imageKeyword: 'delivery truck|cargo truck|freight truck|semi truck' },
    { title: 'Album xe chạy tuyến', imageKeyword: 'highway truck|freight truck|coach bus|intercity bus' },
  ],
  'Thiết bị nhà bếp': [
    { title: 'Album bếp từ, bếp gas', imageKeyword: 'induction cooktop|gas stove|induction stove -fire -flame' },
    { title: 'Album không gian bếp đẹp', imageKeyword: 'modern kitchen|kitchen interior|luxury kitchen' },
    { title: 'Album lò nướng, lò vi sóng', imageKeyword: 'built in oven|microwave oven|electric oven -pizza -bread -cat' },
    { title: 'Album chậu vòi rửa', imageKeyword: 'kitchen sink|kitchen faucet|stainless steel sink -bathroom -mirror' },
    { title: 'Album gia dụng nhà bếp', imageKeyword: 'air fryer|blender|electric kettle|rice cooker -watch -egg' },
  ],
  'Âm thanh - Loa, Micro, Tai nghe': [
    { title: 'Album loa karaoke', imageKeyword: 'karaoke speaker|pa speaker|loudspeaker|speaker box' },
    { title: 'Album loa bluetooth di động', imageKeyword: 'bluetooth speaker|portable speaker|wireless speaker' },
    { title: 'Album dàn âm thanh gia đình', imageKeyword: 'home theater speakers|stereo speakers|hifi speakers|bookshelf speakers' },
    { title: 'Album tai nghe', imageKeyword: 'over ear headphones|wireless headphones|wireless earbuds' },
    { title: 'Album micro karaoke', imageKeyword: 'karaoke microphone|wireless microphone|handheld microphone' },
    { title: 'Album thiết bị xử lý âm thanh', imageKeyword: 'audio mixer|power amplifier|sound mixer' },
  ],
}

const STUDIO_GALLERY_ANGLES = ['concept Hàn Quốc', 'phong cách tối giản', 'tông màu film hoài cổ', 'ánh sáng tự nhiên', 'mùa thu', 'tháng này']
const GENERIC_GALLERY_ANGLES = ['tháng này', 'mùa mới', 'tuần qua', 'cuối tuần', 'đầu năm', 'cuối năm']

function genericGalleryAlbums(industryContext: IndustryContext): GalleryAlbum[] {
  return [
    { title: 'Album hình ảnh cửa hàng', imageKeyword: `${industryContext.imageKeyword} store interior` },
    { title: 'Album sản phẩm mới', imageKeyword: industryContext.imageKeyword },
    { title: 'Khoảnh khắc cùng khách hàng', imageKeyword: `${industryContext.imageKeyword} customer shopping` },
    { title: 'Hậu trường cửa hàng', imageKeyword: `${industryContext.imageKeyword} behind the scenes` },
    { title: 'Góc trưng bày nổi bật', imageKeyword: `${industryContext.imageKeyword} display` },
    { title: 'Bộ sưu tập ảnh sản phẩm', imageKeyword: `${industryContext.imageKeyword} collection` },
  ]
}

function generateGalleryArticle(index: number, industry: string, blogName: string): Article {
  const industryContext = getIndustryContext(industry)
  const industryAlbums = GALLERY_ALBUMS[industry as Industry]
  const albums = industryAlbums ?? genericGalleryAlbums(industryContext)
  const angles = industry === 'Studio - Chụp ảnh & Quay phim' ? STUDIO_GALLERY_ANGLES : GENERIC_GALLERY_ANGLES
  // Rải đều qua từng tổ hợp (album × góc nhìn) trước khi lặp lại — cùng nguyên tắc chống trùng tiêu đề như bài viết thường.
  const album = albums[index % albums.length]
  const angle = angles[Math.floor(index / albums.length) % angles.length]
  const title = `${album.title} ${angle}`
  return {
    id: `draft-article-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
    title,
    author: 'Ban biên tập',
    imageKeyword: album.imageKeyword,
    excerpt: `${title}.`,
    content: '',
    tags: ['album', industryContext.label],
    blog: blogName,
    seoTitle: title,
    seoDescription: `${title}.`,
    status: 'draft',
    appendGallery: true,
  }
}

interface ProjectStyle {
  name: string
  imageKeyword: string
  /** Đoạn thứ 2 của câu chuyện — vật liệu chọn theo phong cách. */
  materials: string
}

const PROJECT_SPACES = [
  'Căn hộ 2 phòng ngủ 75m²',
  'Căn hộ 3 phòng ngủ 110m²',
  'Căn hộ studio 35m²',
  'Nhà phố 4 tầng 5x18m',
  'Biệt thự song lập 220m²',
  'Penthouse 180m²',
  'Nhà vườn 1 tầng',
  'Căn hộ duplex 150m²',
]

const PROJECT_STYLES: ProjectStyle[] = [
  {
    name: 'Japandi',
    imageKeyword: 'japanese living room',
    materials: 'Vật liệu được chọn để chịu được độ ẩm mùa nồm: gỗ MDF chống ẩm lõi xanh, sơn gốc nước và sàn gỗ kỹ thuật có lớp phủ UV.',
  },
  {
    name: 'hiện đại tối giản',
    imageKeyword: 'modern living room',
    materials: 'Bề mặt chủ đạo là laminate vân gỗ sáng, đá nhân tạo cho mặt bếp và kính cường lực cho vách tắm — dễ lau chùi và bền màu theo năm tháng.',
  },
  {
    name: 'Bắc Âu',
    imageKeyword: 'scandinavian living room',
    materials: 'Gỗ sồi tự nhiên, vải bố và gạch men trắng mờ được phối cùng nhau, cho cảm giác sáng và ấm mà không bị lạnh.',
  },
  {
    name: 'Indochine',
    imageKeyword: 'indochine interior design',
    materials: 'Gạch bông, gỗ óc chó, mây tre đan và đèn đồng được dùng tiết chế, giữ nét Đông Dương mà không khiến căn nhà nặng nề.',
  },
  {
    name: 'Wabi-sabi',
    imageKeyword: 'rustic interior',
    materials: 'Tường sơn hiệu ứng vôi, gỗ tần bì để mộc và sàn xi măng mài giữ lại vẻ thô mộc, tự nhiên của từng loại vật liệu.',
  },
  {
    name: 'hiện đại ấm cúng',
    imageKeyword: 'cozy living room',
    materials: 'Veneer gỗ óc chó, nỉ màu đất và đèn LED 3000K tạo nên không gian ấm, sang mà vẫn gọn gàng.',
  },
]

/** Tiêu đề lớn 2 vế — vế sau hiển thị màu xám nhạt, giống mẫu "Bắt đầu từ thói quen / của người ở." */
const PROJECT_HEADLINES: [string, string][] = [
  ['Bắt đầu từ thói quen', 'của người ở.'],
  ['Ít đồ hơn,', 'nhiều khoảng thở hơn.'],
  ['Ánh sáng là', 'vật liệu đầu tiên.'],
  ['Một ngôi nhà', 'lớn lên cùng gia đình.'],
  ['Gỗ, vải và nắng —', 'đủ cho một ngày bình yên.'],
  ['Thiết kế cho', 'những buổi tối ở nhà.'],
  ['Gọn gàng không có nghĩa', 'là lạnh lẽo.'],
]

const PROJECT_NEEDS = [
  'Chủ nhà muốn một căn hộ yên tĩnh sau giờ làm, dễ dọn dẹp khi có hai con nhỏ.',
  'Gia chủ làm việc tại nhà nhiều ngày trong tuần, cần một góc làm việc riêng mà không chia cắt phòng khách.',
  'Ba thế hệ cùng sống chung nên chủ nhà ưu tiên lối đi rộng, ít bậc và nhiều chỗ ngồi chung.',
  'Chủ nhà thích nấu ăn và tiếp bạn bè cuối tuần, muốn bếp và bàn ăn trở thành trung tâm của ngôi nhà.',
  'Cặp vợ chồng trẻ muốn một không gian tối giản, ít đồ nhưng đủ chỗ chứa cho cả hai.',
  'Gia chủ thường xuyên đi công tác, muốn mỗi lần về nhà là được nghỉ ngơi trong một không gian ấm và gọn.',
  'Chủ nhà nuôi hai chú mèo nên cần bề mặt chống trầy, vải sofa dễ vệ sinh và nhiều góc nắng cho thú cưng.',
]

const PROJECT_SOLUTIONS = [
  'Chúng tôi gỡ bỏ vách ngăn bếp, gom toàn bộ tủ đồ vào một mảng tường gỗ liền khối và dùng rèm linen hai lớp để điều tiết nắng hướng Tây.',
  'Chúng tôi mở rộng cửa sổ, chuyển phòng khách ra phía ban công và dùng vách lam gỗ để chia không gian mà vẫn giữ được ánh sáng.',
  'Chúng tôi thiết kế tủ âm tường kịch trần, đặt bàn ăn đảo nối liền bếp và dùng đèn hắt trần để không gian thoáng hơn.',
  'Chúng tôi làm hệ kệ đa năng chạy dọc phòng khách, kết hợp sofa góc chữ L và bàn trà nâng hạ để linh hoạt mỗi khi có khách.',
  'Chúng tôi chuyển phòng ngủ phụ thành phòng làm việc kiêm phòng đọc, dùng cửa lùa kính khung nhôm mảnh để đóng mở linh hoạt.',
  'Chúng tôi giữ lại kết cấu cũ, chỉ thay sàn, sơn lại tường và làm nội thất rời để chủ nhà dễ thay đổi bố cục về sau.',
]

const PROJECT_OWNERS = [
  'Gia đình anh Tuấn',
  'Chị Hà và anh Minh',
  'Gia đình chị Lan',
  'Anh Quân',
  'Vợ chồng anh Nam',
  'Gia đình cô Hạnh',
  'Chị Thảo',
  'Gia đình anh Phong',
  'Anh Khoa và chị Vy',
]

/**
 * Khối "Câu chuyện dự án" giống mẫu: nhãn nhỏ + tiêu đề lớn 2 vế (bên trái), 2 đoạn kể + dòng "Chủ đầu tư" (bên phải).
 * Dùng style inline vì nội dung đăng thẳng lên Sapo (không có CSS riêng của tool); flex-wrap để màn hình hẹp tự xuống dòng.
 */
function buildProjectStoryHtml(headline: [string, string], need: string, solution: string, materials: string, owner: string): string {
  return [
    '<div style="display:flex;flex-wrap:wrap;gap:24px 48px;padding:32px;border-radius:24px;background:#ffffff;">',
    '<div style="flex:1 1 280px;">',
    '<p><span style="display:inline-block;padding:4px 12px;border-radius:999px;background:#f1f0ec;font-size:13px;font-weight:600;"><span style="color:#e4572e;">●</span> Câu chuyện dự án</span></p>',
    `<h2 style="font-size:2.2em;line-height:1.15;margin:12px 0 0;">${headline[0]}<br /><span style="color:#8a8a85;">${headline[1]}</span></h2>`,
    '</div>',
    '<div style="flex:1 1 320px;line-height:1.75;">',
    `<p>${need} ${solution}</p>`,
    `<p>${materials}</p>`,
    `<p><span style="display:inline-block;padding:4px 12px;border-radius:999px;background:#fde4dc;color:#b33a1a;font-weight:600;margin-right:8px;">Chủ đầu tư</span>${owner}</p>`,
    '</div>',
    '</div>',
  ].join('\n')
}

/** Bài "Dự án đã thi công": khối câu chuyện ngắn ở đầu, phần còn lại toàn ảnh công trình (App.tsx nối thêm qua appendGallery). */
function generateProjectStoryArticle(index: number, industry: string, blogName?: string): Article {
  const industryContext = getIndustryContext(industry)
  // Rải đều qua từng tổ hợp (không gian × phong cách) trước khi lặp lại — tránh trùng tiêu đề.
  const space = PROJECT_SPACES[index % PROJECT_SPACES.length]
  const style = PROJECT_STYLES[Math.floor(index / PROJECT_SPACES.length) % PROJECT_STYLES.length]
  const seed = index + Math.floor(Math.random() * 1000)
  const title = `${space} phong cách ${style.name}`
  const owner = pick(PROJECT_OWNERS, seed)
  const excerpt = `${pick(PROJECT_NEEDS, seed + 1)} Dự án ${space.toLowerCase()} theo phong cách ${style.name}.`
  return {
    id: `draft-article-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
    title,
    author: 'Ban biên tập',
    imageKeyword: style.imageKeyword,
    excerpt,
    content: buildProjectStoryHtml(
      pick(PROJECT_HEADLINES, seed),
      pick(PROJECT_NEEDS, seed + 1),
      pick(PROJECT_SOLUTIONS, seed + 2),
      style.materials,
      owner,
    ),
    tags: ['dự án', 'thi công nội thất', style.name.toLowerCase(), industryContext.label],
    blog: blogName ?? '',
    seoTitle: `Dự án ${title}`,
    seoDescription: excerpt,
    status: 'draft',
    appendGallery: true,
  }
}

export function generateMockArticle(
  topic: ArticleTopic | string,
  tone: ArticleTone,
  extraPrompt: string,
  index: number,
  industry: string,
  blogName?: string,
): Article {
  if (blogName && isGalleryBlog(blogName)) return generateGalleryArticle(index, industry, blogName)
  if (topic === AUTO_TOPIC) topic = topicForBlog(blogName, industry)
  if (topic === PROJECT_TOPIC) return generateProjectStoryArticle(index, industry, blogName)
  const baseTemplate = TEMPLATES[topic as ArticleTopic] ?? TEMPLATES['Tin tức ngành hàng']
  const override = INDUSTRY_TOPIC_OVERRIDES[industry as ArticleIndustry]?.[topic as ArticleTopic]
  const template: ArticleTemplate = { ...baseTemplate, ...override }
  const industryContext = getIndustryContext(industry)
  const seed = index + Math.floor(Math.random() * 1000)

  // Rải đều index qua từng tổ hợp (ý tưởng tiêu đề × góc nhìn) trước khi lặp
  // lại — cùng nguyên tắc chống trùng tên đã áp dụng cho sản phẩm.
  const coreIndex = index % template.titleCores.length
  const angleIndex = Math.floor(index / template.titleCores.length) % template.angles.length
  const titleCore = template.titleCores[coreIndex]
  const angle = template.angles[angleIndex]
  // Luôn gắn ngành hàng của store vào tiêu đề — tránh bài viết chung chung không liên quan tới thứ store đang bán.
  const title = `${titleCore} ${angle} ${template.titleIndustrySuffix(industryContext.label)}`.trim()

  const tags = [...template.tagPool].sort(() => Math.random() - 0.5).slice(0, 3 + (seed % 2))
  tags.unshift(industryContext.label)
  const extraTags = extraPrompt
    .trim()
    .split(/[,;]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 3)
  tags.unshift(...extraTags)

  const excerpt = `${title}.`

  return {
    id: `draft-article-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
    title,
    author: pick(template.authorPool, seed + 3),
    imageKeyword: template.titleImageKeywords?.[coreIndex] ?? override?.imageKeyword ?? `${template.imageKeyword} ${industryContext.imageKeyword}`,
    excerpt,
    content: buildContentHtml(template, tone, tags, extraPrompt, industryContext.label, seed),
    // App.tsx thay bằng tag người dùng tự nhập khi tạo bài; nút xóa dữ liệu demo dựa vào id backend ghi lại, không cần tag.
    tags: [...new Set(tags)],
    blog: blogName ?? '',
    seoTitle: title,
    seoDescription: excerpt,
    status: 'draft',
  }
}
