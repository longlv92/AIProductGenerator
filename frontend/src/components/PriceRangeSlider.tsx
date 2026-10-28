import { useState } from 'react'
import { formatVnd } from '../format'

interface PriceRangeSliderProps {
  /** Giới hạn min/max của thanh trượt — tính theo ngành đang chọn, xem mockGenerate.ts:getPriceRangeBounds(). */
  bounds: [number, number]
  valueMin: number
  valueMax: number
  onChange: (min: number, max: number) => void
}

/**
 * Thanh trượt 2 tay cầm để chọn khoảng giá (thay cho 3 mức Bình dân/Trung cấp/Cao cấp cố định trước đây) —
 * dựng từ 2 <input type="range"> chồng lên nhau, xem index.css:.range-thumb để biết cách 2 input chồng
 * nhau vẫn kéo độc lập được.
 */
export function PriceRangeSlider({ bounds, valueMin, valueMax, onChange }: PriceRangeSliderProps) {
  const [min, max] = bounds
  const span = Math.max(1, max - min)
  // Khoảng cách tối thiểu giữa 2 tay cầm (làm tròn tới hàng chục nghìn) — tránh 2 tay cầm chồng khít
  // hoàn toàn lên nhau khiến người dùng không còn kéo được tay cầm nào riêng biệt nữa.
  const minGap = Math.max(10000, Math.round(span * 0.03))

  function handleMinInput(raw: number) {
    onChange(Math.min(raw, valueMax - minGap), valueMax)
  }
  function handleMaxInput(raw: number) {
    onChange(valueMin, Math.max(raw, valueMin + minGap))
  }

  // Ô nhập giá chính xác — thanh trượt chia đều cả dải tới 50 triệu nên khó kéo trúng các mức giá nhỏ
  // (VD 35.000đ cho nước lau sàn). Người dùng gõ tự do, chỉ áp dụng (kẹp trong giới hạn + giữ đúng thứ tự
  // min < max) khi rời ô hoặc nhấn Enter, để không bị nhảy số giữa chừng khi đang gõ.
  function commitMin(raw: number) {
    onChange(Math.max(min, Math.min(raw, valueMax - minGap)), valueMax)
  }
  function commitMax(raw: number) {
    onChange(valueMin, Math.min(max, Math.max(raw, valueMin + minGap)))
  }

  const pctMin = ((valueMin - min) / span) * 100
  const pctMax = ((valueMax - min) / span) * 100

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <PriceInput label="Giá thấp nhất" value={valueMin} onCommit={commitMin} />
        <span className="text-slate-400">–</span>
        <PriceInput label="Giá cao nhất" value={valueMax} onCommit={commitMax} />
      </div>
      <div className="relative h-5">
        <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-slate-200 dark:bg-slate-700" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-blue-600"
          style={{ left: `${pctMin}%`, right: `${100 - pctMax}%` }}
        />
        <input
          type="range"
          aria-label="Giá thấp nhất"
          min={min}
          max={max}
          step={10000}
          value={valueMin}
          onChange={(e) => handleMinInput(Number(e.target.value))}
          className="range-thumb absolute inset-0 h-5 w-full"
        />
        <input
          type="range"
          aria-label="Giá cao nhất"
          min={min}
          max={max}
          step={10000}
          value={valueMax}
          onChange={(e) => handleMaxInput(Number(e.target.value))}
          className="range-thumb absolute inset-0 h-5 w-full"
        />
      </div>
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>{formatVnd(min)}</span>
        <span>{formatVnd(max)}</span>
      </div>
    </div>
  )
}

function formatThousands(amount: number): string {
  return amount.toLocaleString('vi-VN')
}

function PriceInput({ label, value, onCommit }: { label: string; value: number; onCommit: (value: number) => void }) {
  // null = không đang sửa → hiển thị theo `value` (đổi theo thanh trượt); chuỗi = bản nháp người dùng đang gõ.
  const [draft, setDraft] = useState<string | null>(null)

  function commit() {
    if (draft === null) return
    const digits = draft.replace(/\D/g, '')
    if (digits) onCommit(Number(digits))
    setDraft(null)
  }

  return (
    <div className="relative min-w-0 flex-1">
      <input
        type="text"
        inputMode="numeric"
        aria-label={label}
        className="input pr-7 text-sm"
        value={draft ?? formatThousands(value)}
        onFocus={(e) => e.target.select()}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, '')
          setDraft(digits ? formatThousands(Number(digits)) : '')
        }}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur()
          if (e.key === 'Escape') setDraft(null)
        }}
      />
      <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-slate-400">đ</span>
    </div>
  )
}
