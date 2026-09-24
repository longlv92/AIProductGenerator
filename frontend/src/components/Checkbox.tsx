interface CheckboxProps {
  checked: boolean
  onChange: () => void
  disabled?: boolean
  title?: string
  className?: string
}

export function Checkbox({ checked, onChange, disabled, title, className = '' }: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      title={title}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation()
        onChange()
      }}
      className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border transition disabled:cursor-not-allowed disabled:opacity-40 ${
        checked
          ? 'border-blue-600 bg-blue-600'
          : 'border-slate-300 bg-white hover:border-blue-400 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-blue-500'
      } ${className}`}
    >
      {checked && (
        <svg viewBox="0 0 12 10" className="h-2.5 w-2.5" fill="none">
          <path d="M1 5L4.5 8.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  )
}
