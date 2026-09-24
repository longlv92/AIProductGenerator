import type { ViewMode } from '../types'
import { Checkbox } from './Checkbox'

interface ProductToolbarProps {
  totalCount: number
  selectedCount: number
  allSelected: boolean
  onToggleSelectAll: () => void
  onPostSelected: () => void
  postSelectedDisabled: boolean
  onDeleteSelected: () => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

const VIEW_OPTIONS: { value: ViewMode; label: string; icon: string }[] = [
  { value: 'grid', label: 'Lưới', icon: '▦' },
  { value: 'list', label: 'Danh sách', icon: '☰' },
  { value: 'table', label: 'Bảng', icon: '▤' },
]

export function ProductToolbar({
  totalCount,
  selectedCount,
  allSelected,
  onToggleSelectAll,
  onPostSelected,
  postSelectedDisabled,
  onDeleteSelected,
  viewMode,
  onViewModeChange,
}: ProductToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <Checkbox checked={allSelected} onChange={onToggleSelectAll} disabled={totalCount === 0} title="Chọn tất cả" />
          Chọn tất cả
        </label>

        {selectedCount > 0 && (
          <>
            <span className="text-sm text-slate-400">Đã chọn {selectedCount}</span>
            <button
              onClick={onPostSelected}
              disabled={postSelectedDisabled}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-700 dark:disabled:text-slate-500"
            >
              Đăng đã chọn ({selectedCount})
            </button>
            <button
              onClick={onDeleteSelected}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-500/10"
            >
              Xóa đã chọn ({selectedCount})
            </button>
          </>
        )}
      </div>

      <div className="inline-flex self-start rounded-lg border border-slate-200 bg-white p-0.5 dark:border-slate-800 dark:bg-slate-900">
        {VIEW_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onViewModeChange(opt.value)}
            title={opt.label}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
              viewMode === opt.value
                ? 'bg-blue-600 text-white'
                : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            <span aria-hidden>{opt.icon}</span>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
