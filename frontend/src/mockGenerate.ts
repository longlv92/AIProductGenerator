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
  adjectives: string[]
  tagPool: string[]
  basePriceRange: Record<PriceSegment, [number, number]>
  brandPool: string[]
  unit: string
  weightRangeGrams: [number, number]
  attributePresets?: AttributePreset[]
}

const TEMPLATES: Record<Industry, Template> = {
  'Thời trang': {
    category: 'Thời trang',
    nouns: ['Áo thun nam', 'Áo sơ mi nữ', 'Quần jean', 'Váy liền thân', 'Áo khoác bomber', 'Chân váy xếp ly'],
    nounKeywords: ['men t-shirt', 'women blouse shirt', 'jeans', 'dress', 'bomber jacket', 'pleated skirt'],
    adjectives: ['form regular', 'phong cách tối giản', 'chất liệu cotton', 'form rộng basic', 'họa tiết trơn'],
    tagPool: ['thời trang', 'basic', 'unisex', 'form rộng', 'cotton', 'trendy'],
    basePriceRange: { 'Bình dân': [99000, 199000], 'Trung cấp': [199000, 450000], 'Cao cấp': [450000, 1200000] },
    brandPool: ['Basic House', 'Local Brand Co', 'Uniwear', 'CottonLab'],
    unit: 'Cái',
    weightRangeGrams: [150, 500],
    attributePresets: [
      { name: 'Kích thước', values: ['S', 'M', 'L', 'XL'] },
      { name: 'Màu sắc', values: ['Đen', 'Trắng', 'Xám', 'Be'] },
    ],
  },
  'Giày dép': {
    category: 'Giày dép',
    nouns: ['Giày sneaker nam', 'Giày thể thao nữ', 'Giày lười da', 'Dép quai ngang', 'Giày boot cổ cao', 'Sandal nữ quai chéo'],
    nounKeywords: ['men sneakers', 'women sports shoes', 'leather loafers', 'slide sandals', 'high ankle boots', 'women strap sandals'],
    adjectives: ['đế êm nhẹ', 'chống trơn trượt', 'thiết kế năng động', 'phong cách basic', 'form ôm chân'],
    tagPool: ['giày dép', 'sneaker', 'basic', 'êm chân', 'chống trượt'],
    basePriceRange: { 'Bình dân': [150000, 350000], 'Trung cấp': [350000, 800000], 'Cao cấp': [800000, 2500000] },
    brandPool: ['UrbanStep', 'ComfortWalk', 'ViStride', 'FootFlex'],
    unit: 'Đôi',
    weightRangeGrams: [300, 900],
    attributePresets: [
      { name: 'Kích cỡ', values: ['38', '39', '40', '41', '42'] },
      { name: 'Màu sắc', values: ['Đen', 'Trắng', 'Nâu'] },
    ],
  },
  'Mỹ phẩm': {
    category: 'Mỹ phẩm',
    nouns: ['Kem dưỡng ẩm', 'Serum vitamin C', 'Sữa rửa mặt', 'Son dưỡng môi', 'Toner cân bằng da', 'Mặt nạ giấy'],
    nounKeywords: ['moisturizer cream', 'vitamin c serum', 'facial cleanser', 'lip balm', 'facial toner', 'sheet mask skincare'],
    adjectives: ['cho da nhạy cảm', 'chiết xuất thiên nhiên', 'không chứa cồn', 'dưỡng trắng da', 'phục hồi da'],
    tagPool: ['skincare', 'dưỡng da', 'thiên nhiên', 'vegan', 'không paraben'],
    basePriceRange: { 'Bình dân': [79000, 150000], 'Trung cấp': [150000, 400000], 'Cao cấp': [400000, 1500000] },
    brandPool: ['PureSkin', 'BeauLab', 'Cocoon Vietnam', 'DearDerm'],
    unit: 'Hộp',
    weightRangeGrams: [50, 300],
    attributePresets: [{ name: 'Dung tích', values: ['30ml', '50ml', '100ml'] }],
  },
  'Đồ gia dụng': {
    category: 'Đồ gia dụng',
    nouns: ['Nồi chiên không dầu', 'Bình giữ nhiệt', 'Máy xay sinh tố', 'Bộ dao inox', 'Thớt gỗ', 'Hộp đựng thực phẩm'],
    nounKeywords: ['air fryer', 'thermos flask', 'blender', 'stainless steel knife set', 'wooden cutting board', 'food storage container'],
    adjectives: ['dung tích lớn', 'tiết kiệm điện', 'thiết kế nhỏ gọn', 'chống dính', 'bền bỉ'],
    tagPool: ['gia dụng', 'nhà bếp', 'tiện ích', 'bền bỉ', 'tiết kiệm điện'],
    basePriceRange: { 'Bình dân': [99000, 300000], 'Trung cấp': [300000, 900000], 'Cao cấp': [900000, 3000000] },
    brandPool: ['HomeTech', 'KitchenPro', 'Sunhouse Style', 'LivWell'],
    unit: 'Cái',
    weightRangeGrams: [300, 3000],
  },
  'Điện tử': {
    category: 'Điện tử',
    nouns: ['Tai nghe bluetooth', 'Sạc dự phòng', 'Loa mini', 'Bàn phím cơ', 'Chuột không dây', 'Đèn led bàn học'],
    nounKeywords: ['bluetooth headphones', 'power bank', 'mini speaker', 'mechanical keyboard', 'wireless mouse', 'led desk lamp'],
    adjectives: ['pin trâu', 'chống nước', 'kết nối nhanh', 'thiết kế gọn nhẹ', 'âm thanh sống động'],
    tagPool: ['điện tử', 'công nghệ', 'phụ kiện điện thoại', 'bluetooth', 'gaming'],
    basePriceRange: { 'Bình dân': [150000, 350000], 'Trung cấp': [350000, 900000], 'Cao cấp': [900000, 3500000] },
    brandPool: ['TechZone', 'SoundMax', 'GadgetHub', 'ProLink'],
    unit: 'Cái',
    weightRangeGrams: [100, 800],
    attributePresets: [{ name: 'Màu sắc', values: ['Đen', 'Trắng', 'Xanh'] }],
  },
  'Thực phẩm': {
    category: 'Thực phẩm',
    nouns: [
      'Trà thảo mộc túi lọc',
      'Hạt điều rang muối',
      'Mật ong nguyên chất',
      'Snack rong biển',
      'Cà phê rang xay',
      'Ngũ cốc ăn sáng',
      'Tôm sú tươi',
      'Cua biển tươi',
      'Cá hồi phi lê',
      'Thịt bò tươi',
    ],
    nounKeywords: [
      'herbal tea bags',
      'roasted cashew nuts',
      'pure honey jar',
      'seaweed snack',
      'ground coffee',
      'breakfast cereal',
      'fresh tiger shrimp seafood',
      'fresh crab seafood',
      'salmon fillet fish',
      'fresh beef meat',
    ],
    nounTags: [[], [], [], [], [], [], ['tôm', 'hải sản'], ['cua', 'hải sản'], ['cá', 'hải sản', 'cá hồi'], ['thịt', 'thịt bò', 'bò']],
    adjectives: ['nguyên chất 100%', 'không chất bảo quản', 'đóng gói tiện lợi', 'nhập khẩu', 'organic', 'tươi ngon, đảm bảo chất lượng'],
    tagPool: ['thực phẩm', 'ăn vặt', 'organic', 'tốt cho sức khỏe', 'quà tặng'],
    basePriceRange: { 'Bình dân': [39000, 99000], 'Trung cấp': [99000, 250000], 'Cao cấp': [250000, 700000] },
    brandPool: ['Quê Nhà', 'GreenFarm', 'Nông Sản Việt', 'VietTaste'],
    unit: 'Gói',
    weightRangeGrams: [100, 1000],
    attributePresets: [{ name: 'Trọng lượng', values: ['250g', '500g', '1kg'] }],
  },
  'Mẹ & Bé': {
    category: 'Mẹ & Bé',
    nouns: ['Bình sữa chống sặc', 'Địu em bé', 'Khăn xô sơ sinh', 'Đồ chơi phát triển trí tuệ', 'Ghế ăn dặm', 'Máy hâm sữa'],
    nounKeywords: ['baby milk bottle', 'baby carrier', 'baby muslin cloth', 'educational baby toy', 'baby high chair', 'baby bottle warmer'],
    adjectives: ['an toàn cho bé', 'chất liệu hữu cơ', 'không BPA', 'dễ vệ sinh', 'thiết kế nhỏ gọn'],
    tagPool: ['mẹ và bé', 'sơ sinh', 'an toàn', 'organic', 'hữu ích'],
    basePriceRange: { 'Bình dân': [89000, 250000], 'Trung cấp': [250000, 600000], 'Cao cấp': [600000, 2000000] },
    brandPool: ['BabyCare', 'MommyLove', 'KidJoy', 'LittleStar'],
    unit: 'Cái',
    weightRangeGrams: [100, 1500],
  },
  'Phụ kiện': {
    category: 'Phụ kiện',
    nouns: ['Túi đeo chéo', 'Ví da nam', 'Vòng tay charm', 'Kính mát', 'Thắt lưng da', 'Mũ lưỡi trai'],
    nounKeywords: ['crossbody bag', 'men leather wallet', 'charm bracelet', 'sunglasses', 'leather belt', 'baseball cap'],
    adjectives: ['da bò thật', 'thiết kế trẻ trung', 'phong cách unisex', 'chống tia UV', 'form basic'],
    tagPool: ['phụ kiện', 'thời trang', 'unisex', 'da thật', 'basic'],
    basePriceRange: { 'Bình dân': [79000, 199000], 'Trung cấp': [199000, 500000], 'Cao cấp': [500000, 1800000] },
    brandPool: ['UrbanStyle', 'LeatherCraft', 'ChicAccessory', 'DailyWear'],
    unit: 'Cái',
    weightRangeGrams: [50, 400],
    attributePresets: [{ name: 'Màu sắc', values: ['Đen', 'Nâu', 'Be'] }],
  },
  'Nội thất': {
    category: 'Nội thất',
    nouns: ['Kệ sách gỗ', 'Ghế làm việc công thái học', 'Đèn bàn học', 'Gối tựa lưng', 'Rèm cửa chống nắng', 'Thảm trải phòng khách'],
    nounKeywords: ['wooden bookshelf', 'ergonomic office chair', 'desk lamp', 'back cushion pillow', 'blackout curtains', 'living room rug'],
    adjectives: ['gỗ tự nhiên', 'thiết kế tối giản', 'tiết kiệm không gian', 'dễ lắp đặt', 'phong cách Bắc Âu'],
    tagPool: ['nội thất', 'trang trí nhà', 'tối giản', 'gỗ tự nhiên', 'Bắc Âu'],
    basePriceRange: { 'Bình dân': [199000, 500000], 'Trung cấp': [500000, 1500000], 'Cao cấp': [1500000, 6000000] },
    brandPool: ['WoodLiving', 'NordicHome', 'CasaDecor', 'MinimalHaus'],
    unit: 'Cái',
    weightRangeGrams: [1000, 8000],
    attributePresets: [{ name: 'Màu sắc', values: ['Gỗ tự nhiên', 'Trắng', 'Đen'] }],
  },
}

const FALLBACK_TEMPLATE: Template = TEMPLATES['Phụ kiện']

/**
 * Từ khóa để đoán ngành nghề từ TÊN DANH MỤC có sẵn trong store (vì danh mục
 * do người dùng tự đặt, không khớp thẳng với 8 ngành dựng sẵn). Thứ tự khai
 * báo có ý nghĩa: kiểm tra trước sẽ ưu tiên khi 1 tên khớp nhiều từ khóa
 * (VD: "Phụ kiện điện thoại" nên rơi vào Điện tử, không phải Phụ kiện).
 */
const INDUSTRY_KEYWORDS: [Industry, string[]][] = [
  ['Giày dép', ['giày', 'dép', 'sandal', 'sneaker', 'boot']],
  ['Thời trang', ['thời trang', 'áo', 'quần', 'váy', 'đầm', 'thun', 'sơ mi', 'jean']],
  ['Mỹ phẩm', ['mỹ phẩm', 'da', 'dưỡng', 'skincare', 'trang điểm', 'tóc', 'serum', 'kem']],
  ['Điện tử', ['điện tử', 'điện thoại', 'công nghệ', 'âm thanh', 'gaming']],
  ['Đồ gia dụng', ['gia dụng', 'bếp', 'dọn dẹp']],
  ['Thực phẩm', ['thực phẩm', 'đồ ăn', 'đồ uống', 'đồ khô', 'ăn vặt']],
  ['Mẹ & Bé', ['mẹ', 'bé', 'sơ sinh', 'ăn dặm', 'trẻ em']],
  ['Nội thất', ['nội thất', 'phòng khách', 'phòng ngủ', 'phòng làm việc', 'trang trí nhà']],
  ['Phụ kiện', ['phụ kiện', 'túi xách', 'ví', 'trang sức', 'kính mắt', 'thắt lưng']],
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
const GENERIC_WORDS = new Set(['nam', 'nữ', 'unisex', 'trẻ', 'em', 'người', 'lớn', 'cho', 'và', 'các', 'bộ', 'đồ', 'set'])

/**
 * Trong 1 ngành, tìm các loại sản phẩm (chỉ số trong `nouns`) có tên khớp với
 * tên danh mục cụ thể (VD danh mục "Váy bó" → chỉ chọn trong các noun chứa
 * "váy", bỏ qua "quần jean", "áo thun"...). Trả về TOÀN BỘ chỉ số nếu không
 * tên nào khớp cụ thể — để không làm hẹp lựa chọn khi danh mục đặt tên chung
 * chung (VD "Thời trang nam").
 */
const VIETNAMESE_WORD_SPLIT = /[^a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+/

/**
 * Tách 1 chuỗi tiếng Việt thành các "cụm" để so khớp: từng âm tiết đứng riêng
 * có nghĩa (>=3 ký tự) + các cặp âm tiết liền kề (bigram) — vì nhiều từ tiếng
 * Việt là ghép 2 âm tiết ngắn (VD "sơ mi", "áo dài") mà tách riêng thì mỗi âm
 * tiết chỉ 2 ký tự, không đủ để so khớp đáng tin cậy một mình.
 */
function extractPhrases(text: string): Set<string> {
  const tokens = text.toLowerCase().split(VIETNAMESE_WORD_SPLIT).filter(Boolean)
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
  const lowerText = matchText.toLowerCase()
  if (textPhrases.size === 0 && !lowerText.trim()) return allIndices

  const matches = template.nouns
    .map((noun, i) => {
      const nounPhrases = extractPhrases(noun)
      const tags = template.nounTags?.[i] ?? []
      const phraseOverlap = [...nounPhrases].some((p) => textPhrases.has(p))
      const tagOverlap = tags.some((tag) => lowerText.includes(tag.toLowerCase()))
      return { i, match: phraseOverlap || tagOverlap }
    })
    .filter(({ match }) => match)
    .map(({ i }) => i)

  return matches.length > 0 ? matches : allIndices
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

export function generateBarcode(): string {
  let code = ''
  for (let i = 0; i < 12; i++) code += Math.floor(Math.random() * 10)
  return code
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
function buildDescriptionHtml(
  template: Template,
  noun: string,
  primaryAdjective: string,
  brand: string,
  priceSegment: PriceSegment,
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

  const attributeBullets = (template.attributePresets ?? []).map((preset) => `${preset.name}: ${preset.values.join(', ')}`)

  const bullets = [...featureBullets, ...attributeBullets]
  const bulletsHtml = bullets.map((b) => `<li>${b}</li>`).join('')

  return [
    `<p>${noun} ${primaryAdjective} từ ${brand} — lựa chọn đáng cân nhắc trong phân khúc ${priceSegment.toLowerCase()}, mang lại sự cân bằng giữa chất lượng, thẩm mỹ và mức giá hợp lý.</p>`,
    extraPrompt.trim() ? `<p><strong>Theo yêu cầu riêng:</strong> ${extraPrompt.trim()}.</p>` : '',
    bullets.length > 0 ? `<p><strong>Điểm nổi bật:</strong></p><ul>${bulletsHtml}</ul>` : '',
    `<p>Phù hợp với: ${tags.slice(0, 3).join(', ')}. Sản phẩm được chọn lọc kỹ về chất liệu và độ hoàn thiện, phù hợp dùng hàng ngày lẫn làm quà tặng.</p>`,
    `<p>Cam kết đóng gói cẩn thận khi giao hàng, hỗ trợ đổi trả trong 7 ngày nếu sản phẩm lỗi từ nhà sản xuất.</p>`,
  ]
    .filter(Boolean)
    .join('\n')
}

export function generateMockProduct(
  industry: string,
  priceSegment: PriceSegment,
  extraPrompt: string,
  index: number,
  collectionName?: string,
): Product {
  const templateKey = (collectionName && matchIndustryFromName(collectionName)) || industry
  const template = TEMPLATES[templateKey as Industry] ?? FALLBACK_TEMPLATE
  const seed = index + Math.floor(Math.random() * 1000)
  // Gộp tên danh mục + yêu cầu bổ sung khi lọc loại sản phẩm phù hợp — người dùng hay gõ thẳng loại sản
  // phẩm cụ thể vào ô "Yêu cầu bổ sung" thay vì chỉ đặt tên danh mục (xem relevantNounIndices()).
  const matchText = `${collectionName ?? ''} ${extraPrompt}`.trim()
  const candidateIndices = matchText ? relevantNounIndices(template, matchText) : template.nouns.map((_, i) => i)

  // Rải đều index qua từng tổ hợp (loại sản phẩm × tính từ) trước khi lặp lại —
  // tránh trùng tên khi bộ loại sản phẩm khớp danh mục chỉ còn 1-2 lựa chọn
  // (VD danh mục "Váy bó" chỉ khớp 2/6 loại của ngành Thời trang).
  const nounIndex = candidateIndices[index % candidateIndices.length]
  const adjIndex = Math.floor(index / candidateIndices.length) % template.adjectives.length
  const { noun, imageKeyword } = applyGenderOverride(
    template.nouns[nounIndex],
    template.nounKeywords[nounIndex],
    `${collectionName ?? ''} ${extraPrompt}`,
  )
  const adjective = template.adjectives[adjIndex]
  const name = `${noun} ${adjective}`

  const [min, max] = template.basePriceRange[priceSegment]
  const price = roundPrice(min + Math.random() * (max - min))
  const discountPct = 0.1 + Math.random() * 0.25
  const compareAtPrice = roundPrice(price * (1 + discountPct))
  const costPrice = roundPrice(price * (0.55 + Math.random() * 0.2))

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

  const shortDescription = `${noun} ${adjective}, phù hợp phân khúc ${priceSegment.toLowerCase()}.`
  const brand = pick(template.brandPool, seed + 3)

  return {
    id: `draft-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    imageKeyword,
    sku: slugifySku(noun, index),
    barcode: generateBarcode(),
    unit: template.unit,
    shortDescription,
    description: buildDescriptionHtml(template, noun, adjective, brand, priceSegment, tags, extraPrompt, seed),
    price,
    compareAtPrice,
    costPrice,
    applyTax: false,
    category: template.category,
    brand,
    collection: collectionName ?? '',
    tags: [...new Set(tags)],
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
