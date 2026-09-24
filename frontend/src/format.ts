export function formatVnd(amount: number): string {
  return `${amount.toLocaleString('vi-VN')}đ`
}

export function discountPercent(price: number, compareAtPrice: number): number | null {
  if (compareAtPrice <= price) return null
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
}
