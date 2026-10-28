import { useState } from 'react'
import { getPriceRangeBounds, matchIndustryFromName, PRICE_RANGE_CEILING } from '../mockGenerate'
import type { SapoCollection } from '../sapoApi'
import type { GenerationConfig, ImageAspectRatio, Industry } from '../types'
import { INDUSTRIES } from '../types'
import { AspectRatioPicker } from './AspectRatioPicker'
import { MultiSelectDropdown } from './MultiSelectDropdown'
import { PriceRangeSlider } from './PriceRangeSlider'
import { QuantitySegmented } from './QuantitySegmented'

const PRODUCT_QUANTITY_OPTIONS = [10, 20, 50, 100, 200]

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
      className="flex flex-col gap-4"
    >
      <div className="section-card flex flex-col gap-4">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Thông tin tạo sản phẩm</h2>
            {hasCollections && (
              <span className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Đã đồng bộ từ Sapo
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-slate-400">
            {hasCollections
              ? 'Chọn danh mục và số lượng sản phẩm cần tạo — AI tự đoán loại sản phẩm phù hợp theo tên danh mục.'
              : 'Chọn ngành nghề và số lượng sản phẩm cần tạo.'}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {collectionsLoading ? (
            <div className="flex flex-col gap-1.5">
              <label className="field-label">Danh mục sản phẩm</label>
              <p className="input flex items-center text-sm text-slate-400">Đang tải danh mục từ store...</p>
            </div>
          ) : hasCollections ? (
            <div className="flex flex-col gap-1.5">
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
                    onChange={(e) => {
                      const industry = e.target.value as Industry
                      const [priceMin, priceMax] = getPriceRangeBounds(industry)
                      onChange({ ...config, industry, priceMin, priceMax })
                    }}
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
                      const industry = e.target.value as Industry
                      const [priceMin, priceMax] = getPriceRangeBounds(industry)
                      onChange({ ...config, industry, priceMin, priceMax })
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
            <QuantitySegmented options={PRODUCT_QUANTITY_OPTIONS} value={config.quantity} onChange={(quantity) => onChange({ ...config, quantity })} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="field-label">Khoảng giá</label>
            <PriceRangeSlider
              bounds={[getPriceRangeBounds(config.industry)[0], PRICE_RANGE_CEILING]}
              valueMin={config.priceMin}
              valueMax={config.priceMax}
              onChange={(priceMin, priceMax) => onChange({ ...config, priceMin, priceMax })}
            />
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
              Đăng công khai ngay (bỏ chọn = đăng ở trạng thái ẩn/nháp)
            </label>
          </div>

          <AspectRatioPicker
            label="Tỉ lệ ảnh sản phẩm"
            value={config.imageAspectRatio}
            onChange={(imageAspectRatio: ImageAspectRatio) => onChange({ ...config, imageAspectRatio })}
          />

          {!collectionsLoading && (
            <div className="flex flex-col gap-1.5">
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

          <button
            type="submit"
            disabled={!isValid || isGenerating}
            className="mt-2 inline-flex h-[42px] items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-700 dark:disabled:text-slate-500"
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
      </div>
    </form>
  )
}
