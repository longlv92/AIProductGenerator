import { useId } from 'react'

interface TemplateLayoutFieldProps {
  value: string
  onChange: (value: string) => void
  /** Khung giao diện bài viết store đang dùng (lấy từ các bài viết có sẵn) — gợi ý trong danh sách thả xuống. */
  templates: string[]
  /** Nguồn danh sách — 'theme' là đầy đủ; 'articles' chỉ gồm khung đã có bài viết dùng. */
  source: 'theme' | 'articles' | 'none'
}

/**
 * Chọn khung giao diện bài viết (Sapo: template_layout, VD "article.project") — chọn từ danh sách khung store đang
 * dùng hoặc tự gõ tên khung có trong theme. Để trống = khung mặc định của theme.
 */
export function TemplateLayoutField({ value, onChange, templates, source }: TemplateLayoutFieldProps) {
  const listId = useId()
  const options = [...new Set(['article', ...templates])]
  return (
    <div className="flex flex-col gap-1.5">
      <label className="field-label">Khung giao diện bài viết</label>
      <select className="input" value={options.includes(value) || value === '' ? value : '__custom'} onChange={(e) => onChange(e.target.value === '__custom' ? value || 'article.' : e.target.value)}>
        <option value="">Mặc định của theme</option>
        {options.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
        <option value="__custom">Khác (tự nhập)...</option>
      </select>
      {value !== '' && !options.includes(value) && (
        <input
          className="input"
          list={listId}
          placeholder="VD: article.project"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      <datalist id={listId}>
        {options.map((t) => (
          <option key={t} value={t} />
        ))}
      </datalist>
      <p className="text-xs text-slate-400">
        {source === 'theme'
          ? 'Đã lấy đủ danh sách khung từ theme đang dùng của store.'
          : source === 'articles'
            ? 'Chỉ gợi ý được khung đã có bài viết dùng — kết nối lại store (cấp thêm quyền đọc theme) để lấy đủ danh sách tự động.'
            : 'Chưa lấy được danh sách khung từ store — có thể tự nhập tên khung, VD article.project.'}
      </p>
    </div>
  )
}
