interface QuantitySegmentedProps {
  options: number[]
  value: number
  onChange: (value: number) => void
}

/**
 * Chọn số lượng cần tạo bằng các nút bấm sẵn (thay cho ô nhập số tự do) — theo đúng thiết kế trong
 * Tao-du-lieu-demo-Sapo.html (mục "2. Số lượng cần tạo").
 */
export function QuantitySegmented({ options, value, onChange }: QuantitySegmentedProps) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-lg border border-slate-300 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800">
      {options.map((n) => {
        const on = n === value
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`min-w-[44px] rounded-md px-3 py-1.5 text-sm font-medium transition ${
              on
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {n}
          </button>
        )
      })}
    </div>
  )
}
