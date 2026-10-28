import type { Industry, PriceSegment, Product, ProductAttribute } from './types'

interface AttributePreset {
  name: string
  values: string[]
}

interface Template {
  category: string
  nouns: string[]
  /** Từ khóa tiếng Anh song song với `nouns` (cùng chỉ số) — dùng để tìm ảnh thật theo loại sản phẩm. */
  nounKeywords: string[]
  /**
   * Từ đồng nghĩa/liên quan song song với `nouns` (cùng chỉ số, có thể để mảng rỗng) — dùng thêm khi so khớp
   * tên danh mục/yêu cầu bổ sung với loại sản phẩm, cho các từ quá ngắn hoặc không xuất hiện y nguyên trong
   * tên noun (VD noun "Cua biển" cần thêm tag "hải sản" để khớp danh mục "Thịt và hải sản").
   */
  nounTags?: string[][]
  /**
   * Tag "nhóm" song song với `nouns` — CHỈ dùng khi không noun nào khớp qua tên/`nounTags`, để danh mục cha
   * đặt tên chung (VD "Nhà tắm") vẫn thu hẹp được về đúng nhóm (bồn cầu + gạch kính + khử mùi), mà không làm
   * danh mục con cụ thể hơn (VD "Gạch & kính nhà tắm" cũng chứa chữ "nhà tắm") lẫn sang các loại khác trong nhóm.
   */
  nounGroupTags?: string[][]
  adjectives: string[]
  tagPool: string[]
  basePriceRange: Record<PriceSegment, [number, number]>
  brandPool: string[]
  unit: string
  weightRangeGrams: [number, number]
  attributePresets?: AttributePreset[]
  /**
   * Loại nội dung mô tả — chọn đúng cách diễn đạt trong buildDescriptionHtml(), tránh câu chữ vô lý khi
   * áp dụng chung 1 mẫu cho mọi ngành (VD nói "chất liệu, độ hoàn thiện" hay "đổi trả trong 7 ngày" cho
   * xoài/cua tươi là sai thực tế). Mặc định 'durable' (hàng bền) nếu không khai báo.
   */
  descriptionKind?: 'durable' | 'food' | 'cosmetics'
}

const TEMPLATES: Record<Industry, Template> = {
  'Thời trang - Trang sức': {
    category: 'Thời trang - Trang sức',
    // Gộp chung quần áo + giày dép + phụ kiện + trang sức (trước đây 4 ngành riêng) — dùng nounTags để vẫn
    // lọc đúng loại khi danh mục cụ thể hơn (VD danh mục "Giày nam" chỉ nên gợi ý các noun giày, không lẫn áo).
    nouns: [
      'Áo thun nam',
      'Áo sơ mi nữ',
      'Quần jean',
      'Váy liền thân',
      'Áo khoác bomber',
      'Chân váy xếp ly',
      'Giày sneaker nam',
      'Giày thể thao nữ',
      'Giày lười da',
      'Dép quai ngang',
      'Giày boot cổ cao',
      'Sandal nữ quai chéo',
      'Túi đeo chéo',
      'Ví da nam',
      'Kính mát',
      'Thắt lưng da',
      'Mũ lưỡi trai',
      'Dây chuyền bạc',
      'Nhẫn bạc nữ',
      'Bông tai ngọc trai',
      'Lắc tay bạc',
      'Vòng tay đá phong thủy',
    ],
    nounKeywords: [
      'men t-shirt',
      'women blouse shirt',
      'jeans',
      'dress',
      'bomber jacket',
      'pleated skirt',
      'men sneakers',
      'women sports shoes',
      'leather loafers',
      'slide sandals',
      'high ankle boots',
      'women strap sandals',
      'crossbody bag',
      'men leather wallet',
      'sunglasses',
      'leather belt',
      'baseball cap',
      'silver necklace',
      'silver ring women',
      'pearl earrings',
      'silver bracelet',
      'gemstone bracelet',
    ],
    nounTags: [
      ['áo', 'áo thun', 'thời trang'],
      ['áo', 'áo sơ mi', 'thời trang'],
      ['quần', 'quần jean', 'jean', 'thời trang'],
      ['váy', 'đầm', 'thời trang'],
      ['áo', 'áo khoác', 'thời trang'],
      ['váy', 'chân váy', 'thời trang'],
      ['giày', 'sneaker', 'giày dép'],
      ['giày', 'giày thể thao', 'giày dép'],
      ['giày', 'giày lười', 'giày dép'],
      ['dép', 'giày dép'],
      ['giày', 'boot', 'giày dép'],
      ['sandal', 'giày dép'],
      ['túi', 'túi xách', 'phụ kiện'],
      ['ví', 'phụ kiện'],
      ['kính', 'kính mát', 'phụ kiện'],
      ['thắt lưng', 'phụ kiện'],
      ['mũ', 'nón', 'phụ kiện'],
      ['dây chuyền', 'trang sức'],
      ['nhẫn', 'trang sức'],
      ['bông tai', 'hoa tai', 'trang sức'],
      ['lắc tay', 'vòng tay', 'trang sức'],
      ['vòng tay', 'trang sức', 'đá phong thủy'],
    ],
    adjectives: ['thiết kế trẻ trung', 'phong cách hiện đại', 'chất lượng cao cấp', 'dễ phối đồ', 'phù hợp làm quà tặng'],
    tagPool: ['thời trang', 'phụ kiện', 'trang sức', 'basic', 'trendy', 'quà tặng'],
    basePriceRange: { 'Bình dân': [79000, 250000], 'Trung cấp': [250000, 700000], 'Cao cấp': [700000, 2500000] },
    brandPool: ['Basic House', 'UrbanStep', 'UrbanStyle', 'LeatherCraft', 'SilverLune'],
    unit: 'Cái',
    weightRangeGrams: [50, 700],
    attributePresets: [{ name: 'Màu sắc', values: ['Đen', 'Trắng', 'Be', 'Bạc'] }],
  },
  'Mỹ phẩm - Làm đẹp': {
    category: 'Mỹ phẩm - Làm đẹp',
    // Chia theo các dòng skincare hay gặp trên store (Làm sạch, Toner, Serum, Dưỡng ẩm, Chống nắng, Mặt nạ) —
    // nounTags mang đúng tên dòng để danh mục đặt theo dòng sản phẩm chỉ gợi ý đúng loại.
    nouns: [
      'Kem dưỡng ẩm',
      'Serum vitamin C',
      'Sữa rửa mặt',
      'Son dưỡng môi',
      'Toner cân bằng da',
      'Mặt nạ giấy',
      'Máy rửa mặt',
      'Cọ trang điểm bộ',
      'Sữa rửa mặt Yến Mạch',
      'Gel rửa mặt BHA 0.5%',
      'Sữa rửa mặt Trà Xanh',
      'Nước tẩy trang Micellar',
      'Dầu tẩy trang Hoa Trà',
      'Toner Hoa Cúc',
      'Toner AHA Làm Sáng',
      'Toner Rau Má Cân Bằng',
      'Serum Niacinamide 10%',
      'Serum Vitamin C 15%',
      'Serum Peptide Phục Hồi',
      'Serum Hyaluronic Acid B5',
      'Serum Retinol 0.5%',
      'Kem dưỡng Ceramide',
      'Gel dưỡng Rau Má',
      'Lotion dưỡng ẩm Hạnh Nhân',
      'Kem dưỡng ban đêm Bakuchiol',
      'Kem chống nắng Aqua SPF50+',
      'Kem chống nắng Nâng Tông SPF50',
      'Kem chống nắng Vật Lý SPF45',
      'Xịt chống nắng SPF50+ PA++++',
      'Mặt nạ ngủ Yến Mạch',
      'Mặt nạ đất sét Bentonite',
      'Mặt nạ Collagen',
    ],
    nounKeywords: [
      'moisturizer cream',
      'vitamin c serum',
      'facial cleanser',
      'lip balm',
      'facial toner',
      'sheet mask skincare',
      'facial cleansing brush',
      'makeup brush set',
      'oat facial cleanser',
      'salicylic acid gel cleanser',
      'green tea foam cleanser',
      'micellar cleansing water',
      'cleansing oil skincare',
      'chamomile toner bottle',
      'exfoliating toner bottle',
      'centella toner bottle',
      'niacinamide serum dropper',
      'vitamin c serum dropper',
      'peptide serum bottle',
      'hyaluronic acid serum',
      'retinol serum bottle',
      'ceramide moisturizer jar',
      'centella gel moisturizer',
      'face lotion bottle',
      'night cream jar',
      'sunscreen tube',
      'tone up sunscreen',
      'mineral sunscreen',
      'sunscreen spray',
      'sleeping mask jar',
      'clay mask jar',
      'collagen sheet mask',
    ],
    nounTags: [
      ['dưỡng ẩm', 'kem dưỡng'],
      ['serum', 'tinh chất'],
      ['làm sạch', 'rửa mặt'],
      ['son', 'môi'],
      ['toner', 'nước hoa hồng'],
      ['mặt nạ'],
      ['làm sạch', 'rửa mặt'],
      ['trang điểm'],
      ['làm sạch', 'rửa mặt'],
      ['làm sạch', 'rửa mặt'],
      ['làm sạch', 'rửa mặt'],
      ['làm sạch', 'tẩy trang'],
      ['làm sạch', 'tẩy trang'],
      ['toner', 'nước hoa hồng'],
      ['toner', 'nước hoa hồng'],
      ['toner', 'nước hoa hồng'],
      ['serum', 'tinh chất'],
      ['serum', 'tinh chất'],
      ['serum', 'tinh chất'],
      ['serum', 'tinh chất'],
      ['serum', 'tinh chất'],
      ['dưỡng ẩm', 'kem dưỡng'],
      ['dưỡng ẩm', 'kem dưỡng'],
      ['dưỡng ẩm'],
      ['dưỡng ẩm', 'kem dưỡng'],
      ['chống nắng', 'spf'],
      ['chống nắng', 'spf'],
      ['chống nắng', 'spf'],
      ['chống nắng', 'spf'],
      ['mặt nạ'],
      ['mặt nạ'],
      ['mặt nạ'],
    ],
    adjectives: ['cho da nhạy cảm', 'chiết xuất thiên nhiên', 'không chứa cồn', 'dưỡng trắng da', 'phục hồi da', 'kiềm dầu'],
    tagPool: ['skincare', 'dưỡng da', 'thiên nhiên', 'vegan', 'không paraben'],
    basePriceRange: { 'Bình dân': [79000, 150000], 'Trung cấp': [150000, 400000], 'Cao cấp': [400000, 1500000] },
    brandPool: ['PureSkin', 'BeauLab', 'Cocoon Vietnam', 'DearDerm', 'Luma', 'Hana Lab', 'Sera Derm', 'Dew & Co', 'Mộc An', 'Kiyo'],
    unit: 'Hộp',
    weightRangeGrams: [50, 300],
    attributePresets: [
      { name: 'Dung tích', values: ['30ml', '50ml', '100ml'] },
      { name: 'Loại da', values: ['Da dầu, Da hỗn hợp', 'Da khô, Da nhạy cảm', 'Da nhạy cảm, Da hỗn hợp', 'Mọi loại da'] },
    ],
    descriptionKind: 'cosmetics',
  },
  'Đồ gia dụng - Sinh hoạt': {
    category: 'Đồ gia dụng - Sinh hoạt',
    nouns: [
      'Nồi chiên không dầu',
      'Bình giữ nhiệt',
      'Máy xay sinh tố',
      'Bộ dao inox',
      'Thớt gỗ',
      'Hộp đựng thực phẩm',
      'Lò vi sóng',
      'Bếp từ đôi',
      'Ấm siêu tốc',
      'Máy đánh trứng cầm tay',
      'Máy pha cà phê',
    ],
    nounKeywords: [
      'air fryer',
      'thermos flask',
      'blender',
      'stainless steel knife set',
      'wooden cutting board',
      'food storage container',
      'microwave oven',
      'induction cooktop',
      'electric kettle',
      'hand mixer kitchen',
      'coffee maker machine',
    ],
    adjectives: ['dung tích lớn', 'tiết kiệm điện', 'thiết kế nhỏ gọn', 'chống dính', 'bền bỉ'],
    tagPool: ['gia dụng', 'nhà bếp', 'tiện ích', 'bền bỉ', 'tiết kiệm điện'],
    basePriceRange: { 'Bình dân': [99000, 300000], 'Trung cấp': [300000, 900000], 'Cao cấp': [900000, 3000000] },
    brandPool: ['HomeTech', 'KitchenPro', 'Sunhouse Style', 'LivWell'],
    unit: 'Cái',
    weightRangeGrams: [300, 3000],
  },
  'Hóa phẩm - Vệ sinh nhà cửa': {
    category: 'Hóa phẩm - Vệ sinh nhà cửa',
    nouns: [
      'Nước lau sàn tinh dầu',
      'Nước lau sàn đậm đặc',
      'Nước lau sàn gỗ',
      'Nước lau kính',
      'Bình xịt lau kính đa năng',
      'Nước rửa chén',
      'Nước rửa chén sinh học',
      'Viên rửa chén cho máy rửa chén',
      'Nước giặt',
      'Nước giặt cho bé',
      'Viên giặt',
      'Nước xả vải',
      'Nước tẩy bồn cầu',
      'Viên thả bồn cầu',
      'Gel tẩy bồn cầu',
      'Nước tẩy gạch men',
      'Xịt tẩy cặn vách tắm',
      'Kem tẩy cặn canxi',
      'Xịt khử mùi nhà tắm',
      'Sáp thơm khử mùi',
      'Túi than hoạt tính khử mùi',
    ],
    nounKeywords: [
      'floor cleaner bottle',
      'floor cleaning liquid',
      'wood floor cleaner',
      'glass cleaner spray',
      'window cleaner spray bottle',
      'dishwashing liquid',
      'eco dish soap bottle',
      'dishwasher tablets',
      'laundry detergent bottle',
      'baby laundry detergent',
      'laundry pods',
      'fabric softener',
      'toilet bowl cleaner',
      'toilet tank tablet',
      'toilet gel cleaner',
      'bathroom tile cleaner',
      'shower glass cleaner spray',
      'limescale remover bathroom',
      'bathroom air freshener spray',
      'air freshener gel',
      'activated charcoal deodorizer bag',
    ],
    nounTags: [
      ['sàn nhà'],
      ['sàn nhà'],
      ['sàn nhà', 'sàn gỗ'],
      ['cửa kính'],
      ['cửa kính'],
      ['rửa bát', 'bát đĩa'],
      ['rửa bát', 'bát đĩa'],
      ['rửa bát', 'máy rửa bát'],
      ['giặt xả'],
      ['giặt xả'],
      ['giặt xả'],
      ['giặt', 'xả vải'],
      ['toilet', 'wc'],
      ['toilet', 'wc'],
      ['toilet', 'wc'],
      ['gạch'],
      ['gạch', 'vách kính'],
      ['gạch', 'vách kính'],
      [],
      [],
      [],
    ],
    nounGroupTags: [
      [],
      [],
      [],
      [],
      [],
      ['bếp'],
      ['bếp'],
      ['bếp'],
      ['quần áo'],
      ['quần áo'],
      ['quần áo'],
      ['quần áo'],
      ['nhà tắm', 'phòng tắm'],
      ['nhà tắm', 'phòng tắm'],
      ['nhà tắm', 'phòng tắm'],
      ['nhà tắm', 'phòng tắm'],
      ['nhà tắm', 'phòng tắm'],
      ['nhà tắm', 'phòng tắm'],
      ['nhà tắm', 'phòng tắm'],
      ['nhà tắm', 'phòng tắm'],
      ['nhà tắm', 'phòng tắm'],
    ],
    adjectives: ['hương chanh sả', 'diệt khuẩn 99,9%', 'chiết xuất thiên nhiên', 'không gây kích ứng', 'dung tích lớn', 'hương hoa thơm mát'],
    tagPool: ['vệ sinh nhà cửa', 'tẩy rửa', 'diệt khuẩn', 'an toàn', 'hương thơm'],
    basePriceRange: { 'Bình dân': [25000, 80000], 'Trung cấp': [80000, 200000], 'Cao cấp': [200000, 500000] },
    brandPool: ['CleanHome', 'Sạch Xanh', 'EcoFresh', 'PureNest'],
    unit: 'Chai',
    weightRangeGrams: [200, 4000],
    attributePresets: [{ name: 'Quy cách', values: ['Chai 500ml', 'Chai 1L', 'Túi 2L', 'Can 3.6L'] }],
    descriptionKind: 'cosmetics',
  },
  'Công nghệ - Kỹ thuật số': {
    category: 'Công nghệ - Kỹ thuật số',
    nouns: [
      'Tai nghe bluetooth',
      'Sạc dự phòng',
      'Loa mini',
      'Bàn phím cơ',
      'Chuột không dây',
      'Đèn led bàn học',
      'Ốp lưng điện thoại',
      'Cáp sạc USB',
      'Giá đỡ điện thoại',
    ],
    nounKeywords: [
      'bluetooth headphones',
      'power bank',
      'mini speaker',
      'mechanical keyboard',
      'wireless mouse',
      'led desk lamp',
      'phone case',
      'usb charging cable',
      'phone stand holder',
    ],
    adjectives: ['pin trâu', 'chống nước', 'kết nối nhanh', 'thiết kế gọn nhẹ', 'âm thanh sống động'],
    tagPool: ['công nghệ', 'kỹ thuật số', 'phụ kiện điện thoại', 'bluetooth', 'gaming'],
    basePriceRange: { 'Bình dân': [150000, 350000], 'Trung cấp': [350000, 900000], 'Cao cấp': [900000, 3500000] },
    brandPool: ['TechZone', 'SoundMax', 'GadgetHub', 'ProLink'],
    unit: 'Cái',
    weightRangeGrams: [50, 800],
    attributePresets: [{ name: 'Màu sắc', values: ['Đen', 'Trắng', 'Xanh'] }],
  },
  'Thiết bị điện': {
    category: 'Thiết bị điện',
    nouns: [
      'Tivi 43 inch Smart TV',
      'Tivi 55 inch 4K',
      'Tivi 65 inch 4K',
      'Loa bluetooth di động',
      'Loa soundbar',
      'Loa kéo karaoke',
      'Tủ lạnh 2 cánh Inverter',
      'Tủ lạnh side by side',
      'Tủ lạnh mini văn phòng',
      'Tủ đông mini',
      'Tủ đông lớn 300L',
      'Điều hòa treo tường 1 chiều',
      'Điều hòa 2 chiều Inverter',
      'Quạt điều hòa hơi nước',
      'Quạt cây làm mát',
      'Máy giặt cửa trước Inverter',
      'Máy giặt cửa trên',
      'Máy giặt sấy 2 trong 1',
      'Máy sấy quần áo',
    ],
    nounKeywords: [
      'modern tv wall mounted',
      'tv wall unit living room',
      'modern tv wall mounted',
      'portable bluetooth speaker',
      'soundbar speaker',
      'karaoke speaker',
      'two door refrigerator',
      'side by side refrigerator',
      'compact refrigerator',
      'freezer drawer kitchen',
      'built in freezer kitchen',
      'wall mounted air conditioner',
      'inverter air conditioner',
      'personal cooling fan',
      'standing fan',
      'front load washing machine',
      'top load washing machine',
      'washer dryer combo',
      'laundry dryer appliance',
    ],
    nounTags: [
      ['tivi', 'tv', 'smart tv', 'điện máy'],
      ['tivi', 'tv', '4k', 'điện máy'],
      ['tivi', 'tv', '4k', 'điện máy'],
      ['loa', 'âm thanh', 'điện máy'],
      ['loa', 'soundbar', 'âm thanh', 'điện máy'],
      ['loa', 'loa kéo', 'karaoke', 'âm thanh', 'điện máy'],
      ['tủ lạnh', 'điện lạnh', 'điện máy'],
      ['tủ lạnh', 'điện lạnh', 'điện máy'],
      ['tủ lạnh', 'điện lạnh', 'điện máy', 'mini'],
      ['tủ đông', 'tủ lạnh', 'điện lạnh', 'điện máy', 'mini'],
      ['tủ đông', 'tủ lạnh', 'điện lạnh', 'điện máy'],
      ['điều hòa', 'máy lạnh', 'điện lạnh', 'điện máy', 'làm mát'],
      ['điều hòa', 'máy lạnh', 'điện lạnh', 'điện máy', 'làm mát'],
      ['quạt', 'làm mát', 'điều hòa', 'điện máy'],
      ['quạt', 'làm mát', 'điện máy'],
      ['máy giặt', 'điện máy'],
      ['máy giặt', 'điện máy'],
      ['máy giặt', 'máy sấy', 'điện máy'],
      ['máy sấy', 'máy giặt', 'điện máy'],
    ],
    adjectives: ['tiết kiệm điện', 'công nghệ Inverter', 'bảo hành chính hãng', 'vận hành êm ái', 'thiết kế hiện đại'],
    tagPool: ['điện máy', 'điện lạnh', 'gia dụng lớn', 'tiết kiệm điện', 'chính hãng'],
    basePriceRange: { 'Bình dân': [3500000, 7000000], 'Trung cấp': [7000000, 15000000], 'Cao cấp': [15000000, 35000000] },
    brandPool: ['Samsung', 'LG', 'Sony', 'Panasonic', 'Aqua', 'Toshiba'],
    unit: 'Cái',
    weightRangeGrams: [8000, 80000],
    attributePresets: [{ name: 'Bảo hành', values: ['12 tháng', '24 tháng'] }],
  },
  'Thực phẩm - Nhà hàng': {
    category: 'Thực phẩm - Nhà hàng',
    nouns: [
      'Trà thảo mộc túi lọc',
      'Hạt điều rang muối',
      'Mật ong nguyên chất',
      'Snack rong biển',
      'Cà phê rang xay',
      'Ngũ cốc ăn sáng',
      'Tôm sú tươi',
      'Cua gạch Cà Mau',
      'Cá hồi phi lê Na Uy',
      'Thịt bò Úc thăn ngoại',
      'Gà ta nguyên con',
      'Chả mực Hạ Long',
      'Cá thu cắt khúc',
      'Cá thu một nắng',
      'Cá nục tươi',
      'Cá chim trắng',
      'Mực ống tươi',
      'Thịt heo xay',
      'Cải bó xôi tươi',
      'Bông cải xanh tươi',
      'Cà rốt baby tươi',
      'Khoai tây Đà Lạt',
      'Hành tây tươi',
      'Ngò rí tươi',
      'Đậu cove tươi',
      'Cà chua Hà Lan',
      'Bí đao tươi',
      'Đậu bắp tươi',
      'Mướp hữu cơ',
      'Cà tím tươi',
      'Củ cải trắng',
      'Khoai lang tím',
      'Táo Envy New Zealand',
      'Xoài cát Hòa Lộc',
      'Kiwi vàng New Zealand',
      'Bơ sáp Đắk Lắk',
      'Dưa hấu không hạt',
      'Chuối xiêm',
      'Bưởi da xanh',
      'Dưa lưới ruột cam',
      'Trứng gà ta',
      'Trứng vịt tươi',
      'Sữa tươi tiệt trùng nguyên kem',
      'Sữa chua uống',
    ],
    nounKeywords: [
      'herbal tea bags',
      'roasted cashew nuts',
      'pure honey jar',
      'seaweed snack',
      'ground coffee',
      'breakfast cereal',
      'fresh tiger shrimp seafood',
      'mud crab seafood',
      'norwegian salmon fillet',
      'australian beef striploin steak',
      'whole chicken poultry',
      'squid cake seafood',
      'mackerel fish steak',
      'dried mackerel fish',
      'small mackerel fish',
      'pomfret fish whole',
      'fresh squid seafood',
      'ground pork meat',
      'fresh spinach vegetable',
      'fresh broccoli vegetable',
      'fresh baby carrots',
      'fresh potatoes',
      'onion vegetable',
      'cilantro coriander herb',
      'green beans vegetable',
      'cherry tomatoes vegetable',
      'winter melon vegetable',
      'okra vegetable',
      'luffa gourd vegetable',
      'eggplant vegetable',
      'daikon radish vegetable',
      'purple sweet potato',
      'fresh envy apples',
      'fresh mango fruit',
      'gold kiwi fruit',
      'avocado fruit',
      'watermelon fruit',
      'banana bunch fruit',
      'pomelo fruit',
      'cantaloupe melon fruit',
      'fresh chicken eggs',
      'fresh duck eggs',
      'fresh milk bottle',
      'probiotic yogurt drink bottle',
    ],
    nounTags: [
      [],
      [],
      [],
      [],
      [],
      [],
      ['tôm', 'hải sản'],
      ['cua', 'hải sản'],
      ['cá', 'hải sản', 'cá hồi'],
      ['thịt', 'thịt bò', 'bò'],
      ['gà', 'thịt gà', 'gà ta', 'hải sản'],
      ['mực', 'chả mực', 'hải sản'],
      ['cá', 'cá thu', 'hải sản'],
      ['cá', 'cá thu', 'hải sản', 'khô'],
      ['cá', 'cá nục', 'hải sản'],
      ['cá', 'cá chim', 'hải sản'],
      ['mực', 'mực ống', 'hải sản'],
      ['thịt', 'thịt heo', 'heo'],
      ['rau', 'rau củ', 'rau xanh', 'cải'],
      ['rau', 'rau củ', 'rau xanh', 'bông cải'],
      ['rau củ', 'củ', 'cà rốt'],
      ['rau củ', 'củ', 'khoai tây'],
      ['rau củ', 'củ', 'hành tây', 'hành'],
      ['rau', 'rau xanh', 'ngò', 'ngò rí', 'rau thơm'],
      ['rau', 'đậu', 'đậu cove'],
      ['rau củ', 'cà chua'],
      ['rau củ', 'bí', 'bí đao'],
      ['rau', 'đậu', 'đậu bắp'],
      ['rau', 'mướp'],
      ['rau củ', 'cà tím'],
      ['rau củ', 'củ cải', 'củ'],
      ['rau củ', 'khoai lang', 'củ'],
      ['trái cây', 'hoa quả', 'quả', 'táo'],
      ['trái cây', 'hoa quả', 'quả', 'xoài'],
      ['trái cây', 'hoa quả', 'quả', 'kiwi'],
      ['trái cây', 'hoa quả', 'quả', 'bơ'],
      ['trái cây', 'hoa quả', 'quả', 'dưa hấu'],
      ['trái cây', 'hoa quả', 'quả', 'chuối'],
      ['trái cây', 'hoa quả', 'quả', 'bưởi'],
      ['trái cây', 'hoa quả', 'quả', 'dưa lưới'],
      ['trứng', 'trứng gà'],
      ['trứng', 'trứng vịt'],
      ['sữa', 'sữa tươi'],
      ['sữa', 'sữa chua', 'yogurt'],
    ],
    adjectives: ['nguyên chất 100%', 'không chất bảo quản', 'đóng gói tiện lợi', 'nhập khẩu', 'organic', 'tươi ngon, đảm bảo chất lượng'],
    tagPool: ['thực phẩm', 'ăn vặt', 'organic', 'tốt cho sức khỏe', 'quà tặng'],
    basePriceRange: { 'Bình dân': [39000, 99000], 'Trung cấp': [99000, 250000], 'Cao cấp': [250000, 700000] },
    brandPool: ['Quê Nhà', 'GreenFarm', 'Nông Sản Việt', 'VietTaste'],
    unit: 'Gói',
    weightRangeGrams: [100, 1000],
    attributePresets: [{ name: 'Trọng lượng', values: ['250g', '500g', '1kg'] }],
    descriptionKind: 'food',
  },
  'Nội thất - Trang trí': {
    category: 'Nội thất - Trang trí',
    nouns: [
      'Kệ sách gỗ',
      'Ghế làm việc công thái học',
      'Đèn bàn học',
      'Gối tựa lưng',
      'Rèm cửa chống nắng',
      'Thảm trải phòng khách',
      'Tranh treo tường trang trí',
      'Gương trang trí treo tường',
      'Chậu cây để bàn',
    ],
    nounKeywords: [
      'wooden bookshelf',
      'ergonomic office chair',
      'desk lamp',
      'back cushion pillow',
      'blackout curtains',
      'living room rug',
      'wall art decor',
      'decorative wall mirror',
      'small potted plant decor',
    ],
    adjectives: ['gỗ tự nhiên', 'thiết kế tối giản', 'tiết kiệm không gian', 'dễ lắp đặt', 'phong cách Bắc Âu'],
    tagPool: ['nội thất', 'trang trí nhà', 'tối giản', 'gỗ tự nhiên', 'Bắc Âu'],
    basePriceRange: { 'Bình dân': [199000, 500000], 'Trung cấp': [500000, 1500000], 'Cao cấp': [1500000, 6000000] },
    brandPool: ['WoodLiving', 'NordicHome', 'CasaDecor', 'MinimalHaus'],
    unit: 'Cái',
    weightRangeGrams: [300, 8000],
    attributePresets: [{ name: 'Màu sắc', values: ['Gỗ tự nhiên', 'Trắng', 'Đen'] }],
  },
  'Sách - Văn phòng phẩm': {
    category: 'Sách - Văn phòng phẩm',
    nouns: [
      'Sổ tay bìa da',
      'Bút ký cao cấp',
      'Balo laptop chống nước',
      'Hộp bút đa năng',
      'Bìa còng hồ sơ',
      'Giấy note dán nhiều màu',
      'Bảng trắng ghi chú',
      'Máy tính cầm tay',
      'Bút highlight dạ quang',
      'Hộp bút chì màu',
      'Sách bìa cứng',
      'Kẹp giấy bướm',
    ],
    nounKeywords: [
      'leather notebook',
      'premium pen',
      'waterproof laptop backpack',
      'pencil case',
      'ring binder file',
      'sticky notes',
      'whiteboard',
      'calculator',
      'highlighter markers',
      'colored pencils',
      'hardcover books',
      'binder clips',
    ],
    nounTags: [
      ['sổ', 'sổ tay', 'văn phòng phẩm'],
      ['bút', 'bút ký', 'văn phòng phẩm'],
      ['balo', 'túi', 'văn phòng phẩm'],
      ['hộp bút', 'văn phòng phẩm'],
      ['bìa còng', 'hồ sơ', 'văn phòng phẩm'],
      ['giấy note', 'ghi chú', 'văn phòng phẩm'],
      ['bảng', 'ghi chú', 'văn phòng phẩm'],
      ['máy tính', 'văn phòng phẩm'],
      ['bút', 'highlight', 'văn phòng phẩm'],
      ['bút chì', 'văn phòng phẩm'],
      ['sách', 'văn phòng phẩm'],
      ['kẹp giấy', 'văn phòng phẩm'],
    ],
    adjectives: ['chất lượng cao cấp', 'thiết kế tiện dụng', 'bền bỉ theo thời gian', 'phù hợp đi học đi làm', 'phù hợp làm quà tặng'],
    tagPool: ['văn phòng phẩm', 'sách', 'học tập', 'làm việc', 'quà tặng'],
    basePriceRange: { 'Bình dân': [19000, 89000], 'Trung cấp': [89000, 250000], 'Cao cấp': [250000, 800000] },
    brandPool: ['PaperLab', 'OfficePro', 'StudyMate', 'InkWell'],
    unit: 'Cái',
    weightRangeGrams: [50, 1200],
  },
  'Thủ công - Mỹ nghệ - Quà tặng': {
    category: 'Thủ công - Mỹ nghệ - Quà tặng',
    nouns: [
      'Nến thơm handmade',
      'Tranh thêu tay',
      'Gốm sứ thủ công',
      'Hộp quà tặng handmade',
      'Móc khóa da thủ công',
      'Tượng gỗ mỹ nghệ',
      'Khung ảnh gỗ',
      'Thiệp chúc mừng handmade',
      'Bình hoa gốm',
      'Set trà gốm sứ',
    ],
    nounKeywords: [
      'scented candle handmade',
      'hand embroidery art',
      'handmade ceramic pottery',
      'gift box handmade',
      'leather keychain handmade',
      'wooden carving sculpture',
      'wooden photo frame',
      'handmade greeting card',
      'ceramic vase',
      'ceramic tea set',
    ],
    adjectives: ['làm thủ công tỉ mỉ', 'thiết kế độc đáo', 'phù hợp làm quà tặng', 'nguyên liệu tự nhiên', 'phiên bản giới hạn'],
    tagPool: ['thủ công', 'mỹ nghệ', 'quà tặng', 'handmade', 'độc đáo'],
    basePriceRange: { 'Bình dân': [59000, 199000], 'Trung cấp': [199000, 550000], 'Cao cấp': [550000, 2000000] },
    brandPool: ['Thủ Công Việt', 'ArtisanCraft', 'HandmadeHouse', 'MộcGift'],
    unit: 'Cái',
    weightRangeGrams: [50, 2000],
  },
  'Ô tô - Xe máy': {
    category: 'Ô tô - Xe máy',
    nouns: [
      'Camera hành trình ô tô',
      'Nước hoa ô tô',
      'Bọc ghế da ô tô',
      'Mũ bảo hiểm fullface',
      'Găng tay lái xe máy',
      'Gương chiếu hậu xe máy',
      'Sạc nhanh ô tô',
      'Thảm lót sàn ô tô',
      'Áo mưa xe máy',
      'Giá đỡ điện thoại ô tô',
      'Khóa chống trộm xe máy',
    ],
    nounKeywords: [
      'car dash camera',
      'car air freshener',
      'car seat cover leather',
      'full face motorcycle helmet',
      'motorcycle gloves',
      'motorcycle mirror',
      'car phone charger',
      'car floor mat',
      'motorcycle raincoat',
      'car phone holder mount',
      'motorcycle anti-theft lock',
    ],
    nounTags: [
      ['ô tô', 'camera hành trình'],
      ['ô tô', 'nước hoa xe'],
      ['ô tô', 'bọc ghế'],
      ['xe máy', 'mũ bảo hiểm'],
      ['xe máy', 'găng tay'],
      ['xe máy', 'gương'],
      ['ô tô', 'sạc'],
      ['ô tô', 'thảm lót sàn'],
      ['xe máy', 'áo mưa'],
      ['ô tô', 'giá đỡ điện thoại'],
      ['xe máy', 'khóa chống trộm'],
    ],
    adjectives: ['chất lượng bền bỉ', 'lắp đặt dễ dàng', 'thiết kế chắc chắn', 'phù hợp đi mưa nắng', 'bảo hành chính hãng'],
    tagPool: ['ô tô', 'xe máy', 'phụ kiện xe', 'bền bỉ', 'chính hãng'],
    basePriceRange: { 'Bình dân': [69000, 250000], 'Trung cấp': [250000, 800000], 'Cao cấp': [800000, 3000000] },
    brandPool: ['AutoGear', 'MotoPro', 'RideSafe', 'CarMate'],
    unit: 'Cái',
    weightRangeGrams: [100, 3000],
  },
  'Thể thao - Dịch vụ': {
    category: 'Thể thao - Dịch vụ',
    nouns: [
      'Thảm tập yoga',
      'Bình nước thể thao',
      'Tạ tay tập gym',
      'Vợt cầu lông',
      'Bóng đá size 5',
      'Dây nhảy thể dục',
      'Băng quấn cổ tay gym',
      'Balo thể thao chống nước',
      'Găng tay tập gym',
      'Bóng rổ',
      'Đồng hồ thể thao điện tử',
    ],
    nounKeywords: [
      'yoga mat',
      'sports water bottle',
      'dumbbell weights',
      'badminton racket',
      'soccer ball',
      'jump rope',
      'wrist wrap gym',
      'sports backpack waterproof',
      'gym workout gloves',
      'basketball',
      'sports smartwatch',
    ],
    adjectives: ['bền bỉ chịu lực', 'thiết kế thể thao năng động', 'chống trơn trượt', 'thoáng khí', 'phù hợp tập luyện hàng ngày'],
    tagPool: ['thể thao', 'gym', 'yoga', 'tập luyện', 'năng động'],
    basePriceRange: { 'Bình dân': [59000, 199000], 'Trung cấp': [199000, 550000], 'Cao cấp': [550000, 2000000] },
    brandPool: ['FitZone', 'SportMax', 'ActiveLife', 'GymGear'],
    unit: 'Cái',
    weightRangeGrams: [100, 2000],
  },
  'Khác': {
    category: 'Khác',
    nouns: ['Bình sữa chống sặc', 'Địu em bé', 'Khăn xô sơ sinh', 'Đồ chơi phát triển trí tuệ', 'Ghế ăn dặm', 'Máy hâm sữa'],
    nounKeywords: ['baby milk bottle', 'baby carrier', 'baby muslin cloth', 'educational baby toy', 'baby high chair', 'baby bottle warmer'],
    adjectives: ['an toàn cho bé', 'chất liệu hữu cơ', 'không BPA', 'dễ vệ sinh', 'thiết kế nhỏ gọn'],
    tagPool: ['mẹ và bé', 'sơ sinh', 'an toàn', 'organic', 'hữu ích'],
    basePriceRange: { 'Bình dân': [89000, 250000], 'Trung cấp': [250000, 600000], 'Cao cấp': [600000, 2000000] },
    brandPool: ['BabyCare', 'MommyLove', 'KidJoy', 'LittleStar'],
    unit: 'Cái',
    weightRangeGrams: [100, 1500],
  },
}

const FALLBACK_TEMPLATE: Template = TEMPLATES['Khác']

/**
 * Khoảng giá (VNĐ) bao trùm cả 3 mức Bình dân → Cao cấp khai báo sẵn trong template của 1 ngành — dùng làm
 * giới hạn min/max cho thanh trượt chọn khoảng giá (xem ConfigPanel.tsx). Không còn bắt người dùng chọn
 * đúng 1 trong 3 mức cố định như trước, mà để tự kéo chọn khoảng giá cụ thể trong phạm vi hợp lý của ngành.
 */
export function getPriceRangeBounds(industry: string): [number, number] {
  const template = TEMPLATES[industry as Industry] ?? FALLBACK_TEMPLATE
  return [template.basePriceRange['Bình dân'][0], template.basePriceRange['Cao cấp'][1]]
}

/** Trần trên cùng của thanh trượt khoảng giá — luôn kéo được tới mức này bất kể ngành, dù khoảng giá mặc định theo ngành thấp hơn. */
export const PRICE_RANGE_CEILING = 50_000_000

/**
 * Từ khóa để đoán ngành nghề từ TÊN DANH MỤC có sẵn trong store (vì danh mục
 * do người dùng tự đặt, không khớp thẳng với 13 ngành dựng sẵn). Thứ tự khai
 * báo có ý nghĩa: kiểm tra trước sẽ ưu tiên khi 1 tên khớp nhiều từ khóa
 * (VD: "Thiết bị điện gia dụng" nên rơi vào Thiết bị điện, không phải Đồ gia dụng).
 */
const INDUSTRY_KEYWORDS: [Industry, string[]][] = [
  [
    'Hóa phẩm - Vệ sinh nhà cửa',
    ['hóa phẩm', 'tẩy rửa', 'vệ sinh nhà', 'nhà cửa', 'nước lau', 'lau sàn', 'lau kính', 'rửa chén', 'rửa bát', 'nước giặt', 'nước xả', 'xả vải', 'giặt xả', 'nhà tắm', 'phòng tắm', 'bồn cầu', 'khử mùi'],
  ],
  ['Thiết bị điện', ['thiết bị điện', 'điện máy', 'điện lạnh', 'tivi', 'tủ lạnh', 'điều hòa', 'máy lạnh', 'máy giặt']],
  ['Công nghệ - Kỹ thuật số', ['công nghệ', 'kỹ thuật số', 'điện tử', 'điện thoại', 'âm thanh', 'gaming']],
  ['Ô tô - Xe máy', ['ô tô', 'xe máy', 'xe hơi', 'phụ kiện xe']],
  ['Thể thao - Dịch vụ', ['thể thao', 'gym', 'yoga', 'tập luyện']],
  ['Sách - Văn phòng phẩm', ['sách', 'văn phòng phẩm', 'vpp', 'bút', 'sổ tay']],
  ['Thủ công - Mỹ nghệ - Quà tặng', ['thủ công', 'mỹ nghệ', 'handmade']],
  ['Mỹ phẩm - Làm đẹp', ['mỹ phẩm', 'làm đẹp', 'da', 'dưỡng', 'skincare', 'trang điểm', 'tóc', 'serum', 'kem', 'làm sạch', 'tẩy trang', 'rửa mặt', 'toner', 'chống nắng', 'mặt nạ']],
  ['Đồ gia dụng - Sinh hoạt', ['gia dụng', 'sinh hoạt', 'bếp', 'dọn dẹp']],
  ['Thực phẩm - Nhà hàng', ['thực phẩm', 'nhà hàng', 'đồ ăn', 'đồ uống', 'đồ khô', 'ăn vặt']],
  ['Nội thất - Trang trí', ['nội thất', 'trang trí', 'phòng khách', 'phòng ngủ', 'phòng làm việc']],
  [
    'Thời trang - Trang sức',
    ['thời trang', 'trang sức', 'áo', 'quần', 'váy', 'đầm', 'thun', 'sơ mi', 'jean', 'giày', 'dép', 'sandal', 'sneaker', 'boot', 'túi xách', 'ví', 'kính mắt', 'thắt lưng'],
  ],
  ['Khác', ['mẹ', 'bé', 'sơ sinh', 'ăn dặm', 'trẻ em']],
]

/** Đoán ngành nghề gần đúng nhất từ tên danh mục — trả về null nếu không khớp từ khóa nào. */
export function matchIndustryFromName(name: string): Industry | null {
  const lower = name.toLowerCase()
  for (const [industry, keywords] of INDUSTRY_KEYWORDS) {
    if (keywords.some((kw) => lower.includes(kw))) return industry
  }
  return null
}

/** Từ ngắn/chung chung, bỏ qua khi so khớp tên danh mục với loại sản phẩm cụ thể — tránh khớp nhầm (VD "nam" trong rất nhiều tên). */
const GENERIC_WORDS = new Set([
  'nam', 'nữ', 'unisex', 'trẻ', 'em', 'người', 'lớn', 'cho', 'và', 'các', 'bộ', 'đồ', 'set',
  'nhàbếp', 'giadụng', 'giađình', 'nhàtắm', 'phòngtắm',
  // "Nước lau sàn" / "Nước lau kính" / "Nước giặt"... đều mở đầu bằng "nước"/"lau" — giữ lại thì danh mục
  // "Nước lau sàn" khớp cả nước lau kính, nước giặt; chỉ phần sau ("sàn", "kính", "giặt") mới phân biệt loại.
  'nước', 'lau',
  // "Làm sạch" (dòng skincare) — giữ "làm" thì khớp nhầm "Toner AHA Làm Sáng"; vẫn khớp đúng qua tag "làm sạch".
  'làm',
])

/**
 * 1 số cụm 2 âm tiết mang nghĩa CHUNG CHUNG khi đứng cùng nhau (VD "nhà bếp" = khu bếp nói chung, không phải
 * ám chỉ riêng sản phẩm "bếp"/"bếp từ"), nhưng nếu tách riêng từng âm tiết thì "bếp" lại trùng với tên sản
 * phẩm cụ thể (VD "Bếp từ đôi") — gây khớp nhầm chỉ vì danh mục ghi "Gia dụng NHÀ BẾP" (ý nói cả nhóm đồ
 * dùng trong bếp, không riêng gì bếp nấu). Ghép các cụm này thành 1 token trước khi tách, rồi liệt vào
 * GENERIC_WORDS ở trên, để không còn "bếp"/"gia"/"dụng" đứng riêng làm sai lệch kết quả so khớp.
 */
// "mặt nạ" ghép thành 1 token (nhưng KHÔNG liệt vào GENERIC_WORDS) — tách riêng thì "mặt" khớp nhầm cả "Sữa rửa mặt",
// còn "nạ" chỉ 2 ký tự nên bị bỏ qua, khiến danh mục "Mặt nạ" ra lẫn sữa rửa mặt.
const AMBIGUOUS_COMPOUND_PHRASES = ['nhà bếp', 'gia dụng', 'gia đình', 'nhà tắm', 'phòng tắm', 'mặt nạ']

function joinAmbiguousCompounds(text: string): string {
  return AMBIGUOUS_COMPOUND_PHRASES.reduce((acc, phrase) => acc.replaceAll(phrase, phrase.replace(/\s+/g, '')), text)
}

/**
 * Trong 1 ngành, tìm các loại sản phẩm (chỉ số trong `nouns`) có tên khớp với
 * tên danh mục cụ thể (VD danh mục "Váy bó" → chỉ chọn trong các noun chứa
 * "váy", bỏ qua "quần jean", "áo thun"...). Trả về TOÀN BỘ chỉ số nếu không
 * tên nào khớp cụ thể — để không làm hẹp lựa chọn khi danh mục đặt tên chung
 * chung (VD "Thời trang nam").
 */
const VIETNAMESE_WORD_SPLIT = /[^a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+/

/**
 * Tiếng Việt có 2 kiểu đặt dấu cho các vần "oa/oe/uy" — kiểu cũ đặt dấu trên nguyên âm sau (VD "hoà",
 * "toà", "xoè"), kiểu mới đặt trên nguyên âm trước (VD "hòa", "tòa", "xòe"). Tên danh mục do người dùng tự
 * gõ trên store thật nên không kiểm soát được kiểu gõ — nếu không chuẩn hóa, so khớp chuỗi con sẽ coi
 * "Điều hoà" (danh mục thật) và "điều hòa" (tag khai báo trong code) là 2 từ khác nhau, làm bỏ sót kết quả.
 */
function normalizeVietnameseTone(text: string): string {
  return text
    .replace(/oà/g, 'òa')
    .replace(/oá/g, 'óa')
    .replace(/oả/g, 'ỏa')
    .replace(/oã/g, 'õa')
    .replace(/oạ/g, 'ọa')
    .replace(/oè/g, 'òe')
    .replace(/oé/g, 'óe')
    .replace(/oẻ/g, 'ỏe')
    .replace(/oẽ/g, 'õe')
    .replace(/oẹ/g, 'ọe')
    .replace(/uý/g, 'úy')
    .replace(/uỳ/g, 'ùy')
    .replace(/uỷ/g, 'ủy')
    .replace(/uỹ/g, 'ũy')
    .replace(/uỵ/g, 'ụy')
}

/**
 * Tách 1 chuỗi tiếng Việt thành các "cụm" để so khớp: từng âm tiết đứng riêng
 * có nghĩa (>=3 ký tự) + các cặp âm tiết liền kề (bigram) — vì nhiều từ tiếng
 * Việt là ghép 2 âm tiết ngắn (VD "sơ mi", "áo dài") mà tách riêng thì mỗi âm
 * tiết chỉ 2 ký tự, không đủ để so khớp đáng tin cậy một mình.
 */
function extractPhrases(text: string): Set<string> {
  const tokens = joinAmbiguousCompounds(normalizeVietnameseTone(text.toLowerCase())).split(VIETNAMESE_WORD_SPLIT).filter(Boolean)
  const phrases = new Set<string>()
  tokens.forEach((w, i) => {
    if (w.length >= 3 && !GENERIC_WORDS.has(w)) phrases.add(w)
    if (i < tokens.length - 1 && !GENERIC_WORDS.has(tokens[i]) && !GENERIC_WORDS.has(tokens[i + 1])) {
      phrases.add(`${tokens[i]} ${tokens[i + 1]}`)
    }
  })
  return phrases
}

function detectVietnameseGender(text: string): 'nam' | 'nữ' | null {
  const words = text.toLowerCase().split(VIETNAMESE_WORD_SPLIT).filter(Boolean)
  if (words.includes('nam')) return 'nam'
  if (words.includes('nữ')) return 'nữ'
  return null
}

/**
 * Dữ liệu mẫu chỉ có 1 biến thể giới tính viết cứng cho mỗi loại trang phục
 * (VD "Áo sơ mi nữ" — không có bản "nam" riêng). Nếu người dùng yêu cầu rõ
 * giới tính (qua tên danh mục hoặc yêu cầu bổ sung) khác với giới tính mặc
 * định của noun đã chọn, đổi lại cho khớp (cả tên tiếng Việt lẫn từ khóa tìm
 * ảnh tiếng Anh) — tránh trả về đúng loại áo nhưng sai giới tính yêu cầu.
 */
function applyGenderOverride(
  noun: string,
  imageKeyword: string,
  requestText: string,
): { noun: string; imageKeyword: string } {
  const wanted = detectVietnameseGender(requestText)
  const current = detectVietnameseGender(noun)
  if (!wanted || !current || wanted === current) return { noun, imageKeyword }

  const newNoun = noun.replace(new RegExp(current, 'i'), wanted)
  const newImageKeyword =
    wanted === 'nam' ? imageKeyword.replace(/\bwomen'?s?\b/i, 'men') : imageKeyword.replace(/\bmen'?s?\b/i, 'women')

  return { noun: newNoun, imageKeyword: newImageKeyword }
}

/**
 * So khớp loại sản phẩm (chỉ số trong `nouns`) với văn bản người dùng nhập (tên danh mục + yêu cầu bổ sung
 * gộp lại — không chỉ tên danh mục, vì người dùng hay gõ thẳng loại sản phẩm cụ thể vào "Yêu cầu bổ sung",
 * VD "tôm, cua, cá, hải sản"). Khớp qua 2 kênh: (1) cụm từ trong tên noun trùng với văn bản, (2) `nounTags`
 * của noun trùng với văn bản (bắt các từ quá ngắn để lọt qua extractPhrases, VD "cá", "cua").
 */
function relevantNounIndices(template: Template, matchText: string): number[] {
  const allIndices = template.nouns.map((_, i) => i)
  const textPhrases = extractPhrases(matchText)
  const lowerText = normalizeVietnameseTone(matchText.toLowerCase())
  if (textPhrases.size === 0 && !lowerText.trim()) return allIndices

  const matches = template.nouns
    .map((noun, i) => {
      const nounPhrases = extractPhrases(noun)
      const tags = template.nounTags?.[i] ?? []
      const phraseOverlap = [...nounPhrases].some((p) => textPhrases.has(p))
      const tagOverlap = tags.some((tag) => lowerText.includes(normalizeVietnameseTone(tag.toLowerCase())))
      return { i, match: phraseOverlap || tagOverlap }
    })
    .filter(({ match }) => match)
    .map(({ i }) => i)
  if (matches.length > 0) return matches

  const groupMatches = allIndices.filter((i) =>
    (template.nounGroupTags?.[i] ?? []).some((tag) => lowerText.includes(normalizeVietnameseTone(tag.toLowerCase()))),
  )
  return groupMatches.length > 0 ? groupMatches : allIndices
}

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length]
}

function roundPrice(n: number): number {
  return Math.round(n / 1000) * 1000
}

function randomInRange([min, max]: [number, number]): number {
  return Math.round(min + Math.random() * (max - min))
}

export function slugifySku(text: string, index: number): string {
  const initials = text
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 6)
  return `${initials || 'SP'}-${String(index + 1).padStart(3, '0')}`
}

function generateAttributes(template: Template, seed: number): ProductAttribute[] {
  if (!template.attributePresets) return []
  return template.attributePresets.map((preset, i) => ({
    name: preset.name,
    value: pick(preset.values, seed + i * 3),
  }))
}

function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * Mô tả chi tiết dạng HTML nhiều đoạn + bullet điểm nổi bật — thay cho 1 câu
 * ngắn trước đây, để giống mô tả sản phẩm thật trên các trang bán hàng.
 */
/**
 * Câu "chất lượng" + "chính sách" theo TỪNG LOẠI nội dung — tránh dùng chung 1 mẫu "chất liệu, độ hoàn
 * thiện" / "đổi trả trong 7 ngày" cho mọi ngành, vì vô lý với hàng tươi sống (VD xoài/cua không có "độ
 * hoàn thiện", không thể "đổi trả sau 7 ngày" như hàng bền). Nhắc thẳng tên sản phẩm (`noun`) thay vì nói
 * chung chung "sản phẩm" để mô tả đọc cụ thể hơn.
 */
const DESCRIPTION_COPY: Record<NonNullable<Template['descriptionKind']>, { quality: (noun: string) => string; policy: string }> = {
  durable: {
    quality: (noun) => `${noun} được chọn lọc kỹ về chất liệu và độ hoàn thiện, phù hợp dùng hàng ngày lẫn làm quà tặng.`,
    policy: 'Cam kết đóng gói cẩn thận khi giao hàng, hỗ trợ đổi trả trong 7 ngày nếu sản phẩm lỗi từ nhà sản xuất.',
  },
  food: {
    quality: (noun) => `${noun} được chọn lọc kỹ từ nguồn gốc rõ ràng, đảm bảo độ tươi ngon, phù hợp dùng hàng ngày lẫn làm quà biếu.`,
    policy:
      'Đóng gói kỹ, bảo quản đúng cách trong suốt quá trình giao hàng để giữ trọn độ tươi ngon; hỗ trợ đổi lại ngay nếu phát hiện hàng không đạt chất lượng khi nhận.',
  },
  cosmetics: {
    quality: (noun) => `${noun} được chọn lọc kỹ về thành phần và nguồn gốc, phù hợp dùng hàng ngày lẫn làm quà tặng.`,
    policy: 'Cam kết đóng gói cẩn thận khi giao hàng, hỗ trợ đổi trả trong 7 ngày nếu sản phẩm lỗi từ nhà sản xuất hoặc bị hư hại trong quá trình vận chuyển.',
  },
}

/**
 * Mô tả chi tiết dạng HTML nhiều phần, mỗi phần có tiêu đề (h2) riêng — thay cho bản trước chỉ 1 đoạn mở +
 * 1 danh sách ngắn không tiêu đề, để mô tả sản phẩm có cấu trúc rõ ràng giống trang bán hàng thật (mở đầu →
 * điểm nổi bật → thông tin chi tiết → đối tượng phù hợp → chính sách), cùng cách tiếp cận đã áp dụng cho
 * nội dung bài viết (xem mockGenerateArticle.ts).
 */
function buildDescriptionHtml(
  template: Template,
  noun: string,
  primaryAdjective: string,
  brand: string,
  tags: string[],
  extraPrompt: string,
  seed: number,
): string {
  const otherAdjectives = template.adjectives.filter((a) => a !== primaryAdjective)
  const featureBullets = otherAdjectives
    .slice((seed % Math.max(otherAdjectives.length, 1)))
    .concat(otherAdjectives)
    .slice(0, 3)
    .map((a) => capitalizeFirst(a))
  const featureBulletsHtml = featureBullets.map((b) => `<li>${b}</li>`).join('')

  const attributeBullets = [
    ...(template.attributePresets ?? []).map((preset) => `${preset.name}: ${preset.values.join(', ')}`),
    `Thương hiệu: ${brand}`,
    `Đơn vị tính: ${template.unit}`,
  ]
  const attributeBulletsHtml = attributeBullets.map((b) => `<li>${b}</li>`).join('')

  const copy = DESCRIPTION_COPY[template.descriptionKind ?? 'durable']

  return [
    `<p>${noun} ${primaryAdjective} từ ${brand} — lựa chọn đáng cân nhắc, mang lại sự cân bằng giữa chất lượng, thẩm mỹ và mức giá hợp lý.</p>`,
    extraPrompt.trim() ? `<p><strong>Theo yêu cầu riêng:</strong> ${extraPrompt.trim()}.</p>` : '',
    featureBullets.length > 0 ? `<h2>Điểm nổi bật</h2><ul>${featureBulletsHtml}</ul>` : '',
    `<h2>Thông tin chi tiết</h2><ul>${attributeBulletsHtml}</ul>`,
    `<h2>Phù hợp với ai?</h2><p>Phù hợp với: ${tags.slice(0, 3).join(', ')}. ${copy.quality(noun)}</p>`,
    `<h2>Chính sách bảo hành &amp; đổi trả</h2><p>${copy.policy}</p>`,
  ]
    .filter(Boolean)
    .join('\n')
}

/** Số tổ hợp (loại sản phẩm × tính từ, kể cả cặp 2 tính từ) tối đa của 1 bộ loại sản phẩm — dùng làm giới hạn khi né tên trùng. */
function variantSpace(template: Template, candidateCount: number): number {
  const A = template.adjectives.length
  return candidateCount * A * Math.max(A, 1)
}

/**
 * Chọn (loại sản phẩm, tính từ) cho biến thể thứ `variant` trong 1 danh mục. Rải đều qua từng tổ hợp
 * (loại sản phẩm × tính từ) trước khi lặp lại — tránh trùng tên khi bộ loại sản phẩm khớp danh mục chỉ còn
 * 1-2 lựa chọn (VD danh mục "Váy bó" chỉ khớp 2/6 loại của ngành Thời trang).
 */
function pickVariant(template: Template, candidateIndices: number[], variant: number): { nounIndex: number; adjective: string } {
  const L = candidateIndices.length
  const A = template.adjectives.length
  const primarySpace = L * A

  if (variant < primarySpace) {
    return { nounIndex: candidateIndices[variant % L], adjective: template.adjectives[Math.floor(variant / L) % A] }
  }
  // Đã dùng hết tổ hợp noun × 1 tính từ (VD danh mục chỉ khớp 1-2 loại nhưng tạo số lượng lớn, như
  // "Rau củ" chỉ có 2 loại × 6 tính từ = 12 tổ hợp mà cần tạo 30) — ghép thêm 1 tính từ thứ 2 (luôn
  // khác tính từ đầu) để mở rộng không gian tổ hợp lên gấp nhiều lần, tránh lặp y hệt tên sản phẩm.
  const extraIndex = variant - primarySpace
  const pairIndex = Math.floor(extraIndex / L)
  const primaryAdjIndex = pairIndex % A
  const secondaryOffset = 1 + (Math.floor(pairIndex / A) % (A - 1))
  const secondaryAdjIndex = (primaryAdjIndex + secondaryOffset) % A
  return {
    nounIndex: candidateIndices[extraIndex % L],
    adjective: `${template.adjectives[primaryAdjIndex]}, ${template.adjectives[secondaryAdjIndex]}`,
  }
}

export interface MockProductOptions {
  /**
   * Số thứ tự của sản phẩm TRONG RIÊNG danh mục của nó (mặc định = `index`). Khi chọn nhiều danh mục, `index`
   * là số thứ tự chung chia vòng tròn qua các danh mục — nếu dùng thẳng để chọn loại sản phẩm, mỗi danh mục chỉ
   * nhận các index cách nhau đúng bằng số danh mục, nên luôn rơi vào cùng 1 loại (VD 8 danh mục, danh mục
   * "Nước lau kính" chỉ có 2 loại → index 1, 9, 17... đều lẻ → lần nào cũng ra "Bình xịt lau kính").
   */
  variantIndex?: number
  /**
   * Độ lệch ngẫu nhiên (cố định cho cả 1 lượt tạo của 1 danh mục) — xoay điểm bắt đầu trong nhóm tổ hợp 1 tính từ,
   * để mỗi lượt tạo mới (VD sau khi tải lại trang) không ra lại đúng bộ tên đã đăng lần trước.
   */
  variantOffset?: number
  /** Tên (viết thường) đã có trong danh sách — bỏ qua tổ hợp trùng tên, kể cả giữa các danh mục chồng nhau (VD "Nhà tắm" và "Bồn cầu"). */
  usedNames?: Set<string>
}

export function generateMockProduct(
  industry: string,
  priceMin: number,
  priceMax: number,
  extraPrompt: string,
  index: number,
  collectionName?: string,
  options: MockProductOptions = {},
): Product {
  const templateKey = (collectionName && matchIndustryFromName(collectionName)) || industry
  const template = TEMPLATES[templateKey as Industry] ?? FALLBACK_TEMPLATE
  const seed = index + Math.floor(Math.random() * 1000)
  // Gộp tên danh mục + yêu cầu bổ sung khi lọc loại sản phẩm phù hợp — người dùng hay gõ thẳng loại sản
  // phẩm cụ thể vào ô "Yêu cầu bổ sung" thay vì chỉ đặt tên danh mục (xem relevantNounIndices()).
  const matchText = `${collectionName ?? ''} ${extraPrompt}`.trim()
  const candidateIndices = matchText ? relevantNounIndices(template, matchText) : template.nouns.map((_, i) => i)

  const requestText = `${collectionName ?? ''} ${extraPrompt}`
  const buildName = (variant: number) => {
    const { nounIndex, adjective } = pickVariant(template, candidateIndices, variant)
    const { noun, imageKeyword } = applyGenderOverride(template.nouns[nounIndex], template.nounKeywords[nounIndex], requestText)
    return { noun, imageKeyword, adjective, name: `${noun} ${adjective}` }
  }

  const primarySpace = candidateIndices.length * template.adjectives.length
  const offset = options.variantOffset ?? 0
  // Chỉ xoay vòng trong nhóm 1 tính từ — hết nhóm đó mới sang tên ghép 2 tính từ (dài hơn), như khi không có offset.
  const variantFor = (ordinal: number) => (ordinal < primarySpace ? (ordinal + offset) % primarySpace : ordinal)
  const ordinal = options.variantIndex ?? index
  const maxAttempts = variantSpace(template, candidateIndices.length)
  let picked = buildName(variantFor(ordinal))
  for (let attempt = 1; options.usedNames?.has(picked.name.toLowerCase()) && attempt < maxAttempts; attempt++) {
    picked = buildName(variantFor(ordinal + attempt))
  }
  const { noun, imageKeyword, adjective, name } = picked
  options.usedNames?.add(name.toLowerCase())

  // Đảm bảo max >= min dù người dùng kéo 2 tay cầm sát nhau hoặc lệch thứ tự — tránh Math.random() nhân với số âm.
  const lo = Math.min(priceMin, priceMax)
  const hi = Math.max(priceMin, priceMax, lo + 1)
  const price = roundPrice(lo + Math.random() * (hi - lo))
  const discountPct = 0.1 + Math.random() * 0.25
  const compareAtPrice = roundPrice(price * (1 + discountPct))

  // Dùng nội bộ để dựng câu "Phù hợp với: ..." trong mô tả — KHÔNG trả ra field `tags` của sản phẩm
  // (giá vốn/mã vạch/tag để trống, người dùng tự điền nếu cần — xem return bên dưới).
  const tags = [...template.tagPool].sort(() => Math.random() - 0.5).slice(0, 3 + (seed % 2))
  // Tách theo dấu phẩy/chấm phẩy trước (VD "màu đen, chống nước") — mỗi cụm
  // yêu cầu 1 tag riêng, thay vì trước đây chỉ lấy đúng 1 TỪ đầu tiên.
  const extraTags = extraPrompt
    .trim()
    .split(/[,;]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 3)
  tags.unshift(...extraTags)

  const shortDescription = `${noun} ${adjective}.`
  const brand = pick(template.brandPool, seed + 3)

  return {
    id: `draft-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    imageKeyword,
    sku: slugifySku(noun, index),
    barcode: '',
    unit: template.unit,
    shortDescription,
    description: buildDescriptionHtml(template, noun, adjective, brand, tags, extraPrompt, seed),
    price,
    compareAtPrice,
    costPrice: 0,
    applyTax: false,
    category: template.category,
    brand,
    collection: collectionName ?? '',
    // Tag hệ thống (KHÔNG phải tag marketing bịa ra) — để nhận diện + xóa hàng loạt sau này qua nút "Xóa dữ
    // liệu demo cũ" (xem backend/routes/cleanup.ts). Không đụng tới costPrice/barcode (vẫn để trống).
    tags: ['demo'],
    warehouseLocation: 'Cửa hàng chính',
    manageStock: true,
    allowNegativeStock: false,
    stockQuantity: Math.floor(Math.random() * 100),
    requiresShipping: true,
    weight: randomInRange(template.weightRangeGrams),
    weightUnit: 'g',
    attributes: generateAttributes(template, seed),
    seoTitle: name,
    seoDescription: shortDescription,
    status: 'draft',
  }
}
