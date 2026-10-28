import type { Article, ArticleTone, ArticleTopic, Industry } from './types'

interface IndustryContext {
  /** Cụm từ tiếng Việt chỉ ngành hàng, chèn vào câu văn (VD "sản phẩm thời trang"). */
  label: string
  /** Từ khóa tiếng Anh để nối thêm vào imageKeyword của template, giúp ảnh minh họa sát ngành hơn. */
  imageKeyword: string
}

/** Ngữ cảnh ngành hàng của store — chèn vào tiêu đề/nội dung/ảnh/tag để bài viết không còn chung chung, bám đúng thứ store đang bán. */
const INDUSTRY_CONTEXT: Record<Industry, IndustryContext> = {
  'Thời trang - Trang sức': { label: 'thời trang và trang sức', imageKeyword: 'jewelry fashion accessories' },
  'Mỹ phẩm - Làm đẹp': { label: 'mỹ phẩm và làm đẹp', imageKeyword: 'cosmetics skincare beauty' },
  'Thực phẩm - Nhà hàng': { label: 'thực phẩm', imageKeyword: 'food grocery' },
  'Đồ gia dụng - Sinh hoạt': { label: 'đồ gia dụng', imageKeyword: 'home appliances kitchen' },
  'Hóa phẩm - Vệ sinh nhà cửa': { label: 'hóa phẩm vệ sinh nhà cửa', imageKeyword: 'household cleaning products' },
  'Nội thất - Trang trí': { label: 'nội thất và trang trí nhà cửa', imageKeyword: 'home furniture decor' },
  'Sách - Văn phòng phẩm': { label: 'sách và văn phòng phẩm', imageKeyword: 'books office supplies' },
  'Thủ công - Mỹ nghệ - Quà tặng': { label: 'thủ công mỹ nghệ và quà tặng', imageKeyword: 'handmade crafts gifts' },
  'Công nghệ - Kỹ thuật số': { label: 'công nghệ và thiết bị kỹ thuật số', imageKeyword: 'electronics gadgets' },
  'Ô tô - Xe máy': { label: 'ô tô và xe máy', imageKeyword: 'car motorcycle accessories' },
  'Thiết bị điện': { label: 'thiết bị điện gia dụng', imageKeyword: 'home appliances electronics store' },
  'Thể thao - Dịch vụ': { label: 'thể thao', imageKeyword: 'sports fitness equipment' },
  Khác: { label: 'cửa hàng', imageKeyword: 'retail store' },
}

function getIndustryContext(industry: string): IndustryContext {
  return INDUSTRY_CONTEXT[industry as Industry] ?? { label: industry || 'cửa hàng', imageKeyword: industry || 'retail store' }
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
    // Tag "demo" để nhận diện + xóa hàng loạt sau này (xem backend/routes/cleanup.ts), cùng nguyên tắc với
    // mockGenerate.ts — không phải tag marketing bịa ra, không tính vào 3 tag hiển thị ở đầu.
    tags: [...new Set(['demo', ...tags])],
    blog: blogName ?? '',
    seoTitle: title,
    seoDescription: excerpt,
    status: 'draft',
  }
}
