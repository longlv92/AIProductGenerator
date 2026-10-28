import type { ImageAspectRatio } from './types'

const ASPECT_RATIO_DIMENSIONS: Record<ImageAspectRatio, { w: number; h: number }> = {
  '1:1': { w: 480, h: 480 },
  '4:3': { w: 480, h: 360 },
  '3:4': { w: 360, h: 480 },
  '16:9': { w: 480, h: 270 },
}

/** Ảnh thật lấy từ Lorem Picsum (ổn định theo seed, không cần API key) — chỉ là ảnh minh họa ngẫu nhiên, chưa khớp nội dung sản phẩm. */
export function productImageUrl(seed: string, ratio: ImageAspectRatio): string {
  const { w, h } = ASPECT_RATIO_DIMENSIONS[ratio]
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`
}

export const GRADIENTS = [
  'from-indigo-400 to-purple-500',
  'from-rose-400 to-orange-400',
  'from-emerald-400 to-teal-500',
  'from-sky-400 to-blue-500',
  'from-amber-400 to-pink-500',
]

export const CATEGORY_EMOJI: Record<string, string> = {
  'Thời trang - Trang sức': '👕',
  'Mỹ phẩm - Làm đẹp': '💄',
  'Thực phẩm - Nhà hàng': '🍯',
  'Đồ gia dụng - Sinh hoạt': '🏠',
  'Hóa phẩm - Vệ sinh nhà cửa': '🧴',
  'Nội thất - Trang trí': '🛋️',
  'Sách - Văn phòng phẩm': '📚',
  'Thủ công - Mỹ nghệ - Quà tặng': '🎁',
  'Công nghệ - Kỹ thuật số': '🔌',
  'Ô tô - Xe máy': '🏍️',
  'Thiết bị điện': '📺',
  'Thể thao - Dịch vụ': '🏀',
  'Khác': '🍼',
  // Chủ đề tin tức
  'Khuyến mãi': '🎉',
  'Hướng dẫn sử dụng': '📖',
  'Tin tức ngành hàng': '📰',
  'Đánh giá sản phẩm': '⭐',
  'Mẹo hay & Kinh nghiệm': '💡',
  'Sự kiện cửa hàng': '🎪',
}

export function gradientFor(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash + seed.charCodeAt(i)) % GRADIENTS.length
  return GRADIENTS[hash]
}

export function aspectRatioClass(ratio: ImageAspectRatio): string {
  switch (ratio) {
    case '1:1':
      return 'aspect-square'
    case '4:3':
      return 'aspect-[4/3]'
    case '3:4':
      return 'aspect-[3/4]'
    case '16:9':
      return 'aspect-video'
  }
}
