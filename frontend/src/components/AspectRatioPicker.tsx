import type { ImageAspectRatio } from '../types'
import { IMAGE_ASPECT_RATIOS } from '../types'

interface AspectRatioPickerProps {
  label: string
  value: ImageAspectRatio
  onChange: (value: ImageAspectRatio) => void
}

/** Kích thước icon hình chữ nhật minh họa tỉ lệ — tính theo đúng cách fit() trong Tao-du-lieu-demo-Sapo.html (khung 18px). */
const ICON_SIZE: Record<ImageAspectRatio, { w: number; h: number }> = {
  '1:1': { w: 18, h: 18 },
  '4:3': { w: 18, h: 13.5 },
  '3:4': { w: 13.5, h: 18 },
  '16:9': { w: 18, h: 10 },
}

/** Bộ chọn tỉ lệ ảnh dùng chung cho ConfigPanel/ArticleConfigPanel — icon hình chữ nhật + nhãn, luôn xếp 1 hàng (flex, không wrap) đúng theo mockup. */
export function AspectRatioPicker({ label, value, onChange }: AspectRatioPickerProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="field-label">{label}</label>
      <div className="flex gap-2">
        {IMAGE_ASPECT_RATIOS.map((ratio) => {
          const active = value === ratio.value
          const size = ICON_SIZE[ratio.value]
          return (
            <button
              key={ratio.value}
              type="button"
              title={ratio.label}
              onClick={() => onChange(ratio.value)}
              className={`flex flex-1 flex-col items-center justify-center gap-1.5 rounded-lg border py-2.5 text-xs font-medium transition ${
                active
                  ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
                  : 'border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <span
                className={`shrink-0 rounded-[2px] border-[1.5px] ${active ? 'border-blue-600' : 'border-slate-400 dark:border-slate-500'}`}
                style={{ width: size.w, height: size.h }}
              />
              <span className="whitespace-nowrap">{ratio.value}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
