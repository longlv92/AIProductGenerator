import { useState } from 'react'
import { matchIndustryFromName } from '../mockGenerate'
import type { SapoCollection } from '../sapoApi'
import type { GenerationConfig, ImageAspectRatio, Industry } from '../types'
import { IMAGE_ASPECT_RATIOS, INDUSTRIES, PRICE_SEGMENTS } from '../types'
import { MultiSelectDropdown } from './MultiSelectDropdown'

interface ConfigPanelProps {
  config: GenerationConfig
  onChange: (config: GenerationConfig) => void
  onSubmit: () => void
  isGenerating: boolean
  progress: { done: number; total: number } | null
  collections: SapoCollection[]
  collectionsLoading: boolean
  selectedCollectionIds: string[]
  onToggleCollection: (id: string) => void
  onAddCollection: (name: string) => void
}

export function ConfigPanel({
  config,
  onChange,
  onSubmit,
  isGenerating,
  progress,
  collections,
  collectionsLoading,
  selectedCollectionIds,
  onToggleCollection,
  onAddCollection,
}: ConfigPanelProps) {
  const [customIndustry, setCustomIndustry] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState('')

  const hasCollections = collections.length > 0
  const selectedCollections = collections.filter((c) => selectedCollectionIds.includes(c.id))
  const unmatchedCollections = selectedCollections.filter((c) => !matchIndustryFromName(c.name))
  const isValid = hasCollections
    ? selectedCollectionIds.length > 0 && config.quantity >= 1
    : config.industry.trim() !== '' && config.quantity >= 1

  function submitNewCollection() {
    if (newCollectionName.trim()) {
      onAddCollection(newCollectionName.trim())
      setNewCollectionName('')
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (isValid && !isGenerating) onSubmit()
      }}
      className="grid grid-cols-1 gap-4 lg:grid-cols-3"
    >
      <div className="section-card flex flex-col gap-4 lg:col-span-2">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Thông tin tạo sản phẩm</h2>
          <p className="mt-0.5 text-sm text-slate-400">
            {hasCollections
              ? 'Chọn danh mục và số lượng sản phẩm cần tạo — AI tự đoán loại sản phẩm phù hợp theo tên danh mục.'
              : 'Chọn ngành nghề và số lượng sản phẩm cần tạo.'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {collectionsLoading ? (
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="field-label">Danh mục sản phẩm</label>
              <p className="input flex items-center text-sm text-slate-400">Đang tải danh mục từ store...</p>
            </div>
          ) : hasCollections ? (
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="field-label">
                Danh mục sản phẩm <span className="text-red-500">*</span>
              </label>
              <p className="-mt-0.5 text-xs text-slate-400">Chọn 1 hoặc nhiều — sản phẩm tạo ra sẽ được rải đều vào các danh mục đã chọn.</p>
              <MultiSelectDropdown
                options={collections.map((c) => ({ id: c.id, label: c.isNew ? `${c.name} (mới)` : c.name }))}
                selectedIds={selectedCollectionIds}
                onToggle={onToggleCollection}
                placeholder="Chọn danh mục..."
              />

              {unmatchedCollections.length > 0 && (
                <div className="mt-1 flex flex-col gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-500/10">
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    Không tự đoán được loại sản phẩm từ tên danh mục:{' '}
                    <strong>{unmatchedCollections.map((c) => c.name).join(', ')}</strong>. Chọn ngành nghề để áp dụng cho các danh mục
                    này:
                  </p>
                  <select
                    className="input"
                    value={config.industry}
                    onChange={(e) => onChange({ ...config, industry: e.target.value as Industry })}
                  >
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>
                        {ind}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <label className="field-label">
                Ngành nghề <span className="text-red-500">*</span>
              </label>
              {customIndustry ? (
                <input
                  autoFocus
                  className="input"
                  placeholder="Nhập ngành nghề tùy chỉnh"
                  value={config.industry}
                  onChange={(e) => onChange({ ...config, industry: e.target.value })}
                  onBlur={() => {
                    if (!config.industry.trim()) setCustomIndustry(false)
                  }}
                />
              ) : (
                <select
                  className="input"
                  value={config.industry}
                  onChange={(e) => {
                    if (e.target.value === '__custom__') {
                      setCustomIndustry(true)
                      onChange({ ...config, industry: '' })
                    } else {
                      onChange({ ...config, industry: e.target.value as Industry })
                    }
                  }}
                >
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                  <option value="__custom__">Khác (tự nhập)...</option>
                </select>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="field-label">
              Số lượng sản phẩm <span className="text-red-500">*</span>
            </label>
            <input
              className="input"
              type="number"
              min={1}
              max={50}
              value={config.quantity}
              onChange={(e) => onChange({ ...config, quantity: Math.max(1, Math.min(50, Number(e.target.value) || 1)) })}
            />
            <p className="text-xs text-slate-400">Tối đa 50 sản phẩm mỗi lần tạo.</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="field-label">Phân khúc giá</label>
            <select
              className="input"
              value={config.priceSegment}
              onChange={(e) => onChange({ ...config, priceSegment: e.target.value as GenerationConfig['priceSegment'] })}
            >
              {PRICE_SEGMENTS.map((seg) => (
                <option key={seg} value={seg}>
                  {seg}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="field-label">Tỉ lệ ảnh sản phẩm</label>
            <div className="flex flex-wrap gap-2">
              {IMAGE_ASPECT_RATIOS.map((ratio) => (
                <button
                  key={ratio.value}
                  type="button"
                  onClick={() => onChange({ ...config, imageAspectRatio: ratio.value as ImageAspectRatio })}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                    config.imageAspectRatio === ratio.value
                      ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
                      : 'border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  {ratio.label}
                </button>
              ))}
            </div>
          </div>

          {!collectionsLoading && (
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="field-label">
                {hasCollections ? 'Thêm danh mục khác (nếu cần)' : 'Tạo danh mục mới (nếu store chưa có sẵn)'}
              </label>
              <div className="flex gap-2">
                <input
                  className="input"
                  placeholder="VD: Áo thun nam, Quà tặng..."
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      submitNewCollection()
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={submitNewCollection}
                  disabled={!newCollectionName.trim()}
                  className="shrink-0 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  + Thêm
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="section-card flex flex-col gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Tùy chọn bổ sung</h2>
          <p className="mt-0.5 text-sm text-slate-400">Không bắt buộc — giúp AI sinh sản phẩm sát ý bạn hơn.</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="field-label">Yêu cầu bổ sung</label>
          <textarea
            className="input min-h-[104px] resize-y"
            placeholder="Ví dụ: áo thun nam, phong cách tối giản..."
            value={config.extraPrompt}
            onChange={(e) => onChange({ ...config, extraPrompt: e.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={!isValid || isGenerating}
          className="mt-auto inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-700 dark:disabled:text-slate-500"
        >
          {isGenerating && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
          {isGenerating ? 'Đang tạo...' : 'Tạo sản phẩm'}
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
    </form>
  )
}
