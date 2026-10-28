interface ResultsHeaderProps {
  total: number
  createdCount: number
  storeUrl: string
  onPostAll: () => void
  postAllDisabled: boolean
}

/** Thanh tổng kết ở CUỐI khu vực kết quả — đúng vị trí nút đăng chính trong mockup (dưới bảng, không phải trên). */
export function ResultsHeader({ total, createdCount, storeUrl, onPostAll, postAllDisabled }: ResultsHeaderProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900/60">
      <p className="text-sm text-slate-600 dark:text-slate-300">
        {createdCount}/{total} đã tạo ·{' '}
        <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {storeUrl}
        </span>
      </p>

      <button
        onClick={onPostAll}
        disabled={postAllDisabled}
        className="inline-flex h-[42px] items-center justify-center gap-2 self-start rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-700 dark:disabled:text-slate-500 sm:self-auto"
      >
        Đăng tất cả lên Sapo
      </button>
    </div>
  )
}
