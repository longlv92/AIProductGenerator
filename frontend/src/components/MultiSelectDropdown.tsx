import { useEffect, useRef, useState } from 'react'
import { Checkbox } from './Checkbox'

interface Option {
  id: string
  label: string
}

interface MultiSelectDropdownProps {
  options: Option[]
  selectedIds: string[]
  onToggle: (id: string) => void
  placeholder: string
}

export function MultiSelectDropdown({ options, selectedIds, onToggle, placeholder }: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedLabels = options.filter((o) => selectedIds.includes(o.id)).map((o) => o.label)
  const summary =
    selectedLabels.length === 0
      ? placeholder
      : selectedLabels.length <= 2
        ? selectedLabels.join(', ')
        : `${selectedLabels.slice(0, 2).join(', ')} +${selectedLabels.length - 2} khác`

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`input flex w-full items-center justify-between gap-2 text-left ${
          selectedLabels.length === 0 ? 'text-slate-400' : 'text-slate-900 dark:text-slate-100'
        }`}
      >
        <span className="truncate">{summary}</span>
        <svg
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
          {options.length === 0 ? (
            <p className="px-3 py-2 text-sm text-slate-400">Không có lựa chọn nào.</p>
          ) : (
            options.map((opt) => {
              const selected = selectedIds.includes(opt.id)
              return (
                <label
                  key={opt.id}
                  className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  <Checkbox checked={selected} onChange={() => onToggle(opt.id)} />
                  <span className="truncate text-slate-700 dark:text-slate-200">{opt.label}</span>
                </label>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
