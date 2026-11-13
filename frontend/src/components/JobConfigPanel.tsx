import type { ArticleTemplateList } from '../sapoApi'
import type { ImageAspectRatio, JobGenerationConfig, JobLocation } from '../types'
import { JOB_LOCATIONS } from '../types'
import { AspectRatioPicker } from './AspectRatioPicker'
import { TemplateLayoutField } from './TemplateLayoutField'
import { QuantitySegmented } from './QuantitySegmented'

const JOB_QUANTITY_OPTIONS = [5, 8, 10]

interface JobConfigPanelProps {
  config: JobGenerationConfig
  onChange: (config: JobGenerationConfig) => void
  onSubmit: () => void
  isGenerating: boolean
  progress: { done: number; total: number } | null
  /** Khung giao diện bài viết store đang dùng — gợi ý cho ô chọn khung. */
  templates: ArticleTemplateList
}

/** Form tạo tin tuyển dụng — tin được đăng lên Sapo dưới dạng bài viết trong blog riêng (mặc định "Tuyển dụng"). */
export function JobConfigPanel({ config, onChange, onSubmit, isGenerating, progress, templates }: JobConfigPanelProps) {
  const isValid = config.quantity >= 1 && config.deadline !== ''

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
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Thông tin tạo tin tuyển dụng</h2>
          <p className="mt-0.5 text-sm text-slate-400">Mỗi tin là 1 vị trí khác nhau, đăng lên Sapo dưới dạng bài viết trong blog tuyển dụng.</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="field-label">Ngành</label>
          <p className="input flex items-center text-sm text-slate-600 dark:text-slate-300">Thiết kế - Thi công nội thất</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="field-label">
            Số lượng tin <span className="text-red-500">*</span>
          </label>
          <QuantitySegmented options={JOB_QUANTITY_OPTIONS} value={config.quantity} onChange={(quantity) => onChange({ ...config, quantity })} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="field-label">Địa điểm làm việc</label>
          <select className="input" value={config.location} onChange={(e) => onChange({ ...config, location: e.target.value as JobLocation })}>
            {JOB_LOCATIONS.map((l) => (
              <option key={l} value={l}>
                {l === 'Tự động' ? 'Tự động (rải đều các thành phố)' : l}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="field-label">
            Hạn nộp hồ sơ <span className="text-red-500">*</span>
          </label>
          <input type="date" className="input" value={config.deadline} onChange={(e) => onChange({ ...config, deadline: e.target.value })} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="field-label">Blog đăng tin</label>
          <input
            className="input"
            placeholder="Tuyển dụng"
            value={config.blogName}
            onChange={(e) => onChange({ ...config, blogName: e.target.value })}
          />
          <p className="text-xs text-slate-400">Store chưa có blog này thì sẽ tự tạo khi đăng.</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="field-label">Tag thêm (nếu cần)</label>
          <input
            className="input"
            placeholder="VD: tuyển gấp, nội thất"
            value={config.tags}
            onChange={(e) => onChange({ ...config, tags: e.target.value })}
          />
          <p className="text-xs text-slate-400">
            Tự gắn sẵn tag quy ước: <code>loc:</code> <code>type:</code> <code>salary:</code> <code>exp:</code> <code>qty:</code>{' '}
            <code>deadline:</code> — ô này chỉ để thêm tag khác, cách nhau bởi dấu phẩy.
          </p>
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

        <TemplateLayoutField value={config.templateLayout} onChange={(templateLayout) => onChange({ ...config, templateLayout })} templates={templates.templates} source={templates.source} />

        <AspectRatioPicker
          label="Tỉ lệ ảnh đại diện"
          value={config.imageAspectRatio}
          onChange={(imageAspectRatio: ImageAspectRatio) => onChange({ ...config, imageAspectRatio })}
        />

        <button
          type="submit"
          disabled={!isValid || isGenerating}
          className="mt-2 inline-flex h-[42px] items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-700 dark:disabled:text-slate-500"
        >
          {isGenerating && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
          {isGenerating ? 'Đang tạo...' : 'Tạo tin tuyển dụng'}
        </button>

        {isGenerating && progress && (
          <div className="flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div className="h-full rounded-full bg-blue-600 transition-all duration-300" style={{ width: `${(progress.done / progress.total) * 100}%` }} />
            </div>
            <span className="whitespace-nowrap text-xs font-medium text-slate-500 dark:text-slate-400">
              {progress.done}/{progress.total}
            </span>
          </div>
        )}
      </div>
    </form>
  )
}
