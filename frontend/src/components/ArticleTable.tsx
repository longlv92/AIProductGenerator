import { wordCount } from '../format'
import type { Article, ImageAspectRatio } from '../types'
import { Checkbox } from './Checkbox'
import { ProductImage } from './ProductImage'

interface ArticleTableProps {
  articles: Article[]
  aspectRatio: ImageAspectRatio
  selectedIds: Set<string>
  allSelected: boolean
  onToggleSelect: (id: string) => void
  onToggleSelectAll: () => void
  onEdit: (article: Article) => void
  onPost: (id: string) => void
  onDelete: (id: string) => void
}

const STATUS_LABEL: Record<Article['status'], { text: string; className: string }> = {
  draft: { text: 'Nháp', className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
  posting: { text: 'Đang đăng...', className: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' },
  posted: { text: '✓ Đã đăng', className: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' },
  error: { text: 'Lỗi', className: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' },
}

/** Bảng preview gọn, cùng mật độ với ProductTable — cột "Độ dài" tính từ nội dung thật thay vì bịa số. */
export function ArticleTable({
  articles,
  aspectRatio,
  selectedIds,
  allSelected,
  onToggleSelect,
  onToggleSelectAll,
  onEdit,
  onPost,
  onDelete,
}: ArticleTableProps) {
  return (
    <div className="section-card overflow-x-auto p-0">
      <table className="w-full min-w-[820px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs text-slate-400 dark:border-slate-800">
            <th className="w-10 px-4 py-2.5">
              <Checkbox checked={allSelected} onChange={onToggleSelectAll} title="Chọn tất cả" />
            </th>
            <th className="w-12 px-2 py-2.5 font-medium">Ảnh</th>
            <th className="px-2 py-2.5 font-medium">Bài viết</th>
            <th className="px-2 py-2.5 font-medium">Chuyên mục</th>
            <th className="px-2 py-2.5 text-right font-medium">Độ dài</th>
            <th className="px-2 py-2.5 font-medium">Trạng thái</th>
            <th className="px-4 py-2.5 text-right font-medium">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {articles.map((article) => {
            const isPosting = article.status === 'posting'
            const isPosted = article.status === 'posted'
            const isError = article.status === 'error'
            const selected = selectedIds.has(article.id)
            const status = STATUS_LABEL[article.status]

            return (
              <tr
                key={article.id}
                onClick={() => onToggleSelect(article.id)}
                className={`cursor-pointer border-b border-slate-100 last:border-0 dark:border-slate-800 ${selected ? 'bg-blue-50/60 dark:bg-blue-500/5' : ''}`}
              >
                <td className="px-4 py-2 align-middle" onClick={(e) => e.stopPropagation()}>
                  <Checkbox checked={selected} onChange={() => onToggleSelect(article.id)} title="Chọn bài viết" />
                </td>
                <td className="px-2 py-2 align-middle">
                  <ProductImage
                    seed={article.id}
                    category={article.blog}
                    name={article.title}
                    imageKeyword={article.imageKeyword}
                    aspectRatio={aspectRatio}
                    className="w-10"
                    rounded="rounded-md"
                  />
                </td>
                <td className="max-w-[320px] py-2 align-middle">
                  <p className="truncate font-medium text-slate-900 dark:text-slate-100">{article.title}</p>
                  <p className="truncate text-xs text-slate-400">
                    {article.author} · {article.excerpt}
                  </p>
                  {isError && <p className="mt-0.5 truncate text-xs text-red-600 dark:text-red-400">{article.errorReason}</p>}
                </td>
                <td className="px-2 py-2 align-middle text-slate-500 dark:text-slate-400">
                  {article.blog && <>📰 {article.blog}</>}
                </td>
                <td className="whitespace-nowrap px-2 py-2 text-right align-middle tabular-nums text-slate-500 dark:text-slate-400">
                  {wordCount(article.content)} từ
                </td>
                <td className="px-2 py-2 align-middle">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}>{status.text}</span>
                </td>
                <td className="px-4 py-2 align-middle" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(article)}
                      className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      Sửa
                    </button>
                    {isPosted ? (
                      <a
                        href={article.sapoArticleUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                      >
                        Xem
                      </a>
                    ) : (
                      <button
                        onClick={() => onPost(article.id)}
                        disabled={isPosting}
                        className="rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700"
                      >
                        {isError ? 'Thử lại' : isPosting ? '...' : 'Đăng'}
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(article.id)}
                      title="Xóa bài viết"
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
