import { discountPercent, formatVnd } from '../format'
import type { ImageAspectRatio, Product } from '../types'
import { Checkbox } from './Checkbox'
import { ProductImage } from './ProductImage'

interface ProductTableProps {
  products: Product[]
  aspectRatio: ImageAspectRatio
  selectedIds: Set<string>
  allSelected: boolean
  onToggleSelect: (id: string) => void
  onToggleSelectAll: () => void
  onEdit: (product: Product) => void
  onPost: (id: string) => void
  onDelete: (id: string) => void
}

const STATUS_LABEL: Record<Product['status'], { text: string; className: string }> = {
  draft: { text: 'Nháp', className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
  posting: { text: 'Đang đăng...', className: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' },
  posted: { text: '✓ Đã đăng', className: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' },
  error: { text: 'Lỗi', className: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' },
}

/** Bảng preview gọn: mỗi dòng chỉ còn ảnh nhỏ + 1 dòng meta thay vì nhiều cột rời (Danh mục/SKU/Tag riêng) — theo đúng mật độ ở Tao-du-lieu-demo-Sapo.html mục "3a". */
export function ProductTable({
  products,
  aspectRatio,
  selectedIds,
  allSelected,
  onToggleSelect,
  onToggleSelectAll,
  onEdit,
  onPost,
  onDelete,
}: ProductTableProps) {
  return (
    <div className="section-card overflow-x-auto p-0">
      <table className="w-full min-w-[820px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs text-slate-400 dark:border-slate-800">
            <th className="w-10 px-4 py-2.5">
              <Checkbox checked={allSelected} onChange={onToggleSelectAll} title="Chọn tất cả" />
            </th>
            <th className="w-12 px-2 py-2.5 font-medium">Ảnh</th>
            <th className="px-2 py-2.5 font-medium">Sản phẩm</th>
            <th className="px-2 py-2.5 text-right font-medium">Giá</th>
            <th className="px-2 py-2.5 text-right font-medium">Tồn kho</th>
            <th className="px-2 py-2.5 font-medium">Trạng thái</th>
            <th className="px-4 py-2.5 text-right font-medium">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const pct = discountPercent(product.price, product.compareAtPrice)
            const isPosting = product.status === 'posting'
            const isPosted = product.status === 'posted'
            const isError = product.status === 'error'
            const selected = selectedIds.has(product.id)
            const status = STATUS_LABEL[product.status]

            return (
              <tr
                key={product.id}
                onClick={() => onToggleSelect(product.id)}
                className={`cursor-pointer border-b border-slate-100 last:border-0 dark:border-slate-800 ${selected ? 'bg-blue-50/60 dark:bg-blue-500/5' : ''}`}
              >
                <td className="px-4 py-2 align-middle" onClick={(e) => e.stopPropagation()}>
                  <Checkbox checked={selected} onChange={() => onToggleSelect(product.id)} title="Chọn sản phẩm" />
                </td>
                <td className="px-2 py-2 align-middle">
                  <ProductImage
                    seed={product.sku}
                    category={product.category}
                    name={product.name}
                    imageKeyword={product.imageKeyword}
                    aspectRatio={aspectRatio}
                    className="w-10"
                    rounded="rounded-md"
                  />
                </td>
                <td className="max-w-[320px] py-2 align-middle">
                  <p className="truncate font-medium text-slate-900 dark:text-slate-100">{product.name}</p>
                  <p className="truncate text-xs text-slate-400">
                    {product.category} · {product.brand} · SKU {product.sku}
                    {product.collection && <> · 📁 {product.collection}</>}
                  </p>
                  {isError && <p className="mt-0.5 truncate text-xs text-red-600 dark:text-red-400">{product.errorReason}</p>}
                </td>
                <td className="whitespace-nowrap px-2 py-2 text-right align-middle tabular-nums">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{formatVnd(product.price)}</span>
                  {pct !== null && (
                    <span className="ml-1.5 text-xs text-slate-400 line-through">{formatVnd(product.compareAtPrice)}</span>
                  )}
                </td>
                <td className="px-2 py-2 text-right align-middle tabular-nums text-slate-500 dark:text-slate-400">
                  {product.stockQuantity}
                </td>
                <td className="px-2 py-2 align-middle">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}>{status.text}</span>
                </td>
                <td className="px-4 py-2 align-middle" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(product)}
                      className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      Sửa
                    </button>
                    {isPosted ? (
                      <a
                        href={product.sapoProductUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                      >
                        Xem
                      </a>
                    ) : (
                      <button
                        onClick={() => onPost(product.id)}
                        disabled={isPosting}
                        className="rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700"
                      >
                        {isError ? 'Thử lại' : isPosting ? '...' : 'Đăng'}
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(product.id)}
                      title="Xóa sản phẩm"
                      className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-red-500 dark:hover:bg-slate-800"
                    >
                      ×
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
