import { useState } from 'react'
import type { SapoBlog } from '../sapoApi'
import type { ArticleGenerationConfig, ImageAspectRatio } from '../types'
import { ARTICLE_TONES, ARTICLE_TOPICS, INDUSTRIES } from '../types'
import { AspectRatioPicker } from './AspectRatioPicker'
import { MultiSelectDropdown } from './MultiSelectDropdown'
import { QuantitySegmented } from './QuantitySegmented'

const ARTICLE_QUANTITY_OPTIONS = [5, 10, 20, 50]

interface ArticleConfigPanelProps {
  config: ArticleGenerationConfig
  onChange: (config: ArticleGenerationConfig) => void
  onSubmit: () => void
  isGenerating: boolean
  progress: { done: number; total: number } | null
  blogs: SapoBlog[]
  blogsLoading: boolean
  selectedBlogIds: string[]
  onToggleBlog: (id: string) => void
  onAddBlog: (name: string) => void
}

export function ArticleConfigPanel({
  config,
  onChange,
  onSubmit,
  isGenerating,
  progress,
  blogs,
  blogsLoading,
  selectedBlogIds,
  onToggleBlog,
  onAddBlog,
}: ArticleConfigPanelProps) {
  const [newBlogName, setNewBlogName] = useState('')

  const hasBlogs = blogs.length > 0
  const isValid = config.topic.trim() !== '' && config.quantity >= 1

  function submitNewBlog() {
    if (newBlogName.trim()) {
      onAddBlog(newBlogName.trim())
      setNewBlogName('')
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (isValid && !isGenerating) onSubmit()
      }}
      className="flex flex-col gap-4"
    >
      <div className="section-card flex flex-col gap-4">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Thông tin tạo tin tức</h2>
            {hasBlogs && (
              <span className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Đã đồng bộ từ Sapo
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-slate-400">Chọn chủ đề và số lượng bài viết cần tạo — chọn blog để đăng vào (nếu có).</p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="field-label">
              Ngành hàng của store <span className="text-red-500">*</span>
            </label>
            <select className="input" value={config.industry} onChange={(e) => onChange({ ...config, industry: e.target.value })}>
              {INDUSTRIES.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-400">Nội dung bài viết sẽ bám theo đúng ngành hàng này, không viết chung chung.</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="field-label">
              Chủ đề <span className="text-red-500">*</span>
            </label>
            <select className="input" value={config.topic} onChange={(e) => onChange({ ...config, topic: e.target.value })}>
              {ARTICLE_TOPICS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="field-label">Giọng văn</label>
            <select className="input" value={config.tone} onChange={(e) => onChange({ ...config, tone: e.target.value as ArticleGenerationConfig['tone'] })}>
              {ARTICLE_TONES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="field-label">
              Số lượng bài viết <span className="text-red-500">*</span>
            </label>
            <QuantitySegmented options={ARTICLE_QUANTITY_OPTIONS} value={config.quantity} onChange={(quantity) => onChange({ ...config, quantity })} />
            <p className="text-xs text-slate-400">Tối đa 50 bài viết mỗi lần tạo.</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="field-label">Khi đăng lên Sapo</label>
            <label className="input flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={config.publishNow}
                onChange={(e) => onChange({ ...config, publishNow: e.target.checked })}
                className="h-4 w-4 cursor-pointer accent-blue-600"
              />
              Đăng công khai ngay (bỏ chọn = lưu nháp)
            </label>
          </div>

          <AspectRatioPicker
            label="Tỉ lệ ảnh bài viết"
            value={config.imageAspectRatio}
            onChange={(imageAspectRatio: ImageAspectRatio) => onChange({ ...config, imageAspectRatio })}
          />

          {blogsLoading ? (
            <div className="flex flex-col gap-1.5">
              <label className="field-label">Blog đăng bài</label>
              <p className="input flex items-center text-sm text-slate-400">Đang tải blog từ store...</p>
            </div>
          ) : hasBlogs ? (
            <div className="flex flex-col gap-1.5">
              <label className="field-label">Blog đăng bài</label>
              <p className="-mt-0.5 text-xs text-slate-400">Chọn 1 hoặc nhiều — bài viết tạo ra sẽ được rải đều vào các blog đã chọn.</p>
              <MultiSelectDropdown
                options={blogs.map((b) => ({ id: b.id, label: b.isNew ? `${b.name} (mới)` : b.name }))}
                selectedIds={selectedBlogIds}
                onToggle={onToggleBlog}
                placeholder="Chọn blog..."
              />
            </div>
          ) : null}

          {!blogsLoading && (
            <div className="flex flex-col gap-1.5">
              <label className="field-label">{hasBlogs ? 'Thêm blog khác (nếu cần)' : 'Tạo blog mới (nếu store chưa có sẵn)'}</label>
              <div className="flex gap-2">
                <input
                  className="input"
                  placeholder="VD: Tin tức, Khuyến mãi..."
                  value={newBlogName}
                  onChange={(e) => setNewBlogName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      submitNewBlog()
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={submitNewBlog}
                  disabled={!newBlogName.trim()}
                  className="shrink-0 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  + Thêm
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!isValid || isGenerating}
            className="mt-2 inline-flex h-[42px] items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-700 dark:disabled:text-slate-500"
          >
            {isGenerating && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
            {isGenerating ? 'Đang tạo...' : 'Tạo bài viết'}
          </button>

          {isGenerating && progress && (
            <div className="flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${(progress.done / progress.total) * 100}%` }}
                />
              </div>
              <span className="whitespace-nowrap text-xs font-medium text-slate-500 dark:text-slate-400">
                {progress.done}/{progress.total}
              </span>
            </div>
          )}
        </div>
      </div>
    </form>
  )
}
