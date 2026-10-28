export function formatVnd(amount: number): string {
  return `${amount.toLocaleString('vi-VN')}đ`
}

export function discountPercent(price: number, compareAtPrice: number): number | null {
  if (compareAtPrice <= price) return null
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
}

/** Đếm số từ của nội dung HTML (bỏ thẻ) — dùng cho cột "Độ dài" ở bảng preview bài viết. */
export function wordCount(html: string): number {
  const text = html.replace(/<[^>]+>/g, ' ').trim()
  return text ? text.split(/\s+/).length : 0
}
