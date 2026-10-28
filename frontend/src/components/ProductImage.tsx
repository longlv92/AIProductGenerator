import { useEffect, useState } from 'react'
import { CATEGORY_EMOJI, aspectRatioClass, gradientFor, productImageUrl } from '../productVisual'
import { fetchProductImageUrl } from '../sapoApi'
import type { ImageAspectRatio } from '../types'

interface ProductImageProps {
  seed: string
  category: string
  name: string
  imageKeyword?: string
  aspectRatio: ImageAspectRatio
  className?: string
  rounded?: string
}

export function ProductImage({ seed, category, name, imageKeyword, aspectRatio, className = '', rounded = '' }: ProductImageProps) {
  const [src, setSrc] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    setFailed(false)
    setSrc(null)

    async function resolve() {
      if (imageKeyword) {
        const matched = await fetchProductImageUrl(imageKeyword, seed, aspectRatio)
        if (cancelled) return
        if (matched) {
          setSrc(matched)
          return
        }
      }
      // Không có từ khóa, hoặc không tìm được ảnh khớp → rơi về ảnh minh họa ngẫu nhiên.
      if (!cancelled) setSrc(productImageUrl(seed, aspectRatio))
    }

    void resolve()
    return () => {
      cancelled = true
    }
  }, [seed, imageKeyword, aspectRatio])

  if (failed || !src) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br text-2xl ${aspectRatioClass(aspectRatio)} ${gradientFor(category)} ${rounded} ${className}`}
        title={!src ? 'Đang tìm ảnh...' : 'Không tải được ảnh — đang hiển thị ảnh minh họa'}
      >
        {!src ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white" />
        ) : (
          CATEGORY_EMOJI[category] ?? '🛍️'
        )}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={name}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`object-cover ${aspectRatioClass(aspectRatio)} ${rounded} ${className}`}
    />
  )
}
