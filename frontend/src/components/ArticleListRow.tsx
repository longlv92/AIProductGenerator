import type { Article, ImageAspectRatio } from '../types'
import { Checkbox } from './Checkbox'
import { ProductImage } from './ProductImage'

interface ArticleListRowProps {
  article: Article
  aspectRatio: ImageAspectRatio
  selected: boolean
  onToggleSelect: () => void
  onEdit: () => void
  onPost: () => void
  onDelete: () => void
}

export function ArticleListRow({ article, aspectRatio, selected, onToggleSelect, onEdit, onPost, onDelete }: ArticleListRowProps) {
  const isError = article.status === 'error'
  const isPosting = article.status === 'posting'
  const isPosted = article.status === 'posted'

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border bg-white p-3 transition sm:flex-row sm:items-center dark:bg-slate-900 ${
        selected ? 'border-blue-400 ring-1 ring-blue-400/40' : isError ? 'border-red-300 dark:border-red-800' : 'border-slate-200 dark:border-slate-800'
      }`}
    >
      <div className="flex items-center gap-3">
        <Checkbox checked={selected} onChange={onToggleSelect} title="Chọn bài viết" />
        <ProductImage
          seed={article.id}
          category={article.blog}
          name={article.title}
          imageKeyword={article.imageKeyword}
          aspectRatio={aspectRatio}
          className="w-20 shrink-0"
          rounded="rounded-lg"
        />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{article.title}</h3>
        <p className="truncate text-xs text-slate-400">Tác giả: {article.author}</p>
        {article.blog && (
          <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
            📰 {article.blog}
          </span>
        )}
        <div className="mt-1 flex flex-wrap gap-1">
          {article.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              #{tag}
            </span>
          ))}
        </div>
        {isError && (
          <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">{article.errorReason ?? 'Có lỗi xảy ra khi đăng bài viết.'}</p>
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
            href={article.sapoArticleUrl}
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
          title="Xóa bài viết"
          className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-red-500 dark:hover:bg-slate-800"
        >
          ×
        </button>
      </div>
    </div>
  )
}
