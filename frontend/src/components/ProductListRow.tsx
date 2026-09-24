import { discountPercent, formatVnd } from '../format'
import type { ImageAspectRatio, Product } from '../types'
import { Checkbox } from './Checkbox'
import { ProductImage } from './ProductImage'

interface ProductListRowProps {
  product: Product
  aspectRatio: ImageAspectRatio
  selected: boolean
  onToggleSelect: () => void
  onEdit: () => void
  onPost: () => void
  onDelete: () => void
}

export function ProductListRow({
  product,
  aspectRatio,
  selected,
  onToggleSelect,
  onEdit,
  onPost,
  onDelete,
}: ProductListRowProps) {
  const pct = discountPercent(product.price, product.compareAtPrice)
  const isError = product.status === 'error'
  const isPosting = product.status === 'posting'
  const isPosted = product.status === 'posted'

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border bg-white p-3 transition sm:flex-row sm:items-center dark:bg-slate-900 ${
        selected ? 'border-blue-400 ring-1 ring-blue-400/40' : isError ? 'border-red-300 dark:border-red-800' : 'border-slate-200 dark:border-slate-800'
      }`}
    >
      <div className="flex items-center gap-3">
        <Checkbox checked={selected} onChange={onToggleSelect} title="Chọn sản phẩm" />
        <ProductImage
          seed={product.sku}
          category={product.category}
          name={product.name}
          imageKeyword={product.imageKeyword}
          aspectRatio={aspectRatio}
          className="w-20 shrink-0"
          rounded="rounded-lg"
        />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{product.name}</h3>
        <p className="truncate text-xs text-slate-400">{product.category} · {product.brand} · SKU {product.sku}</p>
        {product.collection && (
          <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
            📁 {product.collection}
          </span>
        )}
        <div className="mt-1 flex flex-wrap gap-1">
          {product.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              #{tag}
            </span>
          ))}
        </div>
        {isError && (
          <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">{product.errorReason ?? 'Có lỗi xảy ra khi đăng sản phẩm.'}</p>
        )}
      </div>

      <div className="flex shrink-0 items-baseline gap-2 sm:w-40 sm:flex-col sm:items-end sm:gap-0.5">
        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{formatVnd(product.price)}</span>
        {pct !== null && (
          <span className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 line-through">{formatVnd(product.compareAtPrice)}</span>
            <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-600 dark:bg-red-500/10 dark:text-red-400">
              -{pct}%
            </span>
          </span>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={onEdit}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Sửa
        </button>

        {isPosted ? (
          <a
            href={product.sapoProductUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
          >
            ✓ Đã đăng
          </a>
        ) : (
          <button
            onClick={onPost}
            disabled={isPosting}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700"
          >
            {isPosting && <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
            {isError ? 'Thử lại' : isPosting ? 'Đang đăng...' : 'Đăng lên Sapo'}
          </button>
        )}

        <button
          onClick={onDelete}
          title="Xóa sản phẩm"
          className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-red-500 dark:hover:bg-slate-800"
        >
          ×
        </button>
      </div>
    </div>
  )
}
