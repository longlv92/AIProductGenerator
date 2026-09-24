import { useState } from 'react'
import { discountPercent, formatVnd } from '../format'
import type { ImageAspectRatio, Product } from '../types'
import { Checkbox } from './Checkbox'
import { ProductImage } from './ProductImage'

interface ProductCardProps {
  product: Product
  index: number
  aspectRatio: ImageAspectRatio
  selected: boolean
  onToggleSelect: () => void
  onEdit: () => void
  onPost: () => void
  onDelete: () => void
}

export function ProductCard({
  product,
  index,
  aspectRatio,
  selected,
  onToggleSelect,
  onEdit,
  onPost,
  onDelete,
}: ProductCardProps) {
  const [expanded, setExpanded] = useState(false)
  const pct = discountPercent(product.price, product.compareAtPrice)
  const isError = product.status === 'error'
  const isPosting = product.status === 'posting'
  const isPosted = product.status === 'posted'

  return (
    <div
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
      className={`animate-card-in group relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:bg-slate-900 ${
        selected
          ? 'border-blue-400 ring-1 ring-blue-400/40'
          : isError
            ? 'border-red-300 ring-1 ring-red-300/40 dark:border-red-800'
            : 'border-slate-200 dark:border-slate-800'
      }`}
    >
      <div className="absolute left-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-md bg-white/90 shadow dark:bg-slate-800/90">
        <Checkbox checked={selected} onChange={onToggleSelect} title="Chọn sản phẩm" />
      </div>

      <button
        onClick={onDelete}
        title="Xóa sản phẩm"
        className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-slate-400 shadow transition hover:bg-white hover:text-red-500 dark:bg-slate-800/80 dark:text-slate-500"
      >
        ×
      </button>

      <ProductImage
        seed={product.sku}
        category={product.category}
        name={product.name}
        imageKeyword={product.imageKeyword}
        aspectRatio={aspectRatio}
        className="w-full"
      />

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{product.name}</h3>

        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold text-blue-600 dark:text-blue-400">{formatVnd(product.price)}</span>
          {pct !== null && (
            <>
              <span className="text-xs text-slate-400 line-through">{formatVnd(product.compareAtPrice)}</span>
              <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-600 dark:bg-red-500/10 dark:text-red-400">
                -{pct}%
              </span>
            </>
          )}
        </div>

        <div className="flex flex-wrap gap-1">
          {product.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            >
              #{tag}
            </span>
          ))}
        </div>

        {product.collection && (
          <span className="inline-flex w-fit items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
            📁 {product.collection}
          </span>
        )}

        <p className="text-[11px] font-medium text-slate-400">
          {product.category} · {product.brand} · SKU {product.sku}
        </p>

        <p
          className={`cursor-pointer text-xs text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 ${expanded ? '' : 'line-clamp-2'}`}
          onClick={() => setExpanded((v) => !v)}
        >
          {product.shortDescription}
        </p>

        <div className="mt-auto flex items-center gap-2 pt-2">
          <button
            onClick={onEdit}
            className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Sửa
          </button>

          {isPosted ? (
            <a
              href={product.sapoProductUrl}
              target="_blank"
              rel="noreferrer"
              className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
            >
              ✓ Đã đăng
            </a>
          ) : (
            <button
              onClick={onPost}
              disabled={isPosting}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700"
            >
              {isPosting && <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
              {isError ? 'Thử lại' : isPosting ? 'Đang đăng...' : 'Đăng lên Sapo'}
            </button>
          )}
        </div>

        {isError && (
          <p className="rounded-md bg-red-50 px-2 py-1 text-[11px] text-red-600 dark:bg-red-500/10 dark:text-red-400">
            {product.errorReason ?? 'Có lỗi xảy ra khi đăng sản phẩm.'}
          </p>
        )}
      </div>
    </div>
  )
}
