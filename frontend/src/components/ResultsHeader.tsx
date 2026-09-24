interface ResultsHeaderProps {
  total: number
  createdCount: number
  storeUrl: string
  onPostAll: () => void
  postAllDisabled: boolean
}

export function ResultsHeader({ total, createdCount, storeUrl, onPostAll, postAllDisabled }: ResultsHeaderProps) {
  return (
    <div className="section-card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Kết quả ({createdCount}/{total} đã tạo)
        </h2>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Đăng vào {storeUrl}
        </p>
      </div>

      <button
        onClick={onPostAll}
        disabled={postAllDisabled}
        className="inline-flex items-center justify-center gap-2 self-start rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-700 dark:disabled:text-slate-500 sm:self-auto"
      >
        Đăng tất cả lên Sapo
      </button>
    </div>
  )
}
