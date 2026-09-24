interface EmptyStateProps {
  icon?: string
  title?: string
  subtitle?: string
}

export function EmptyState({
  icon = '🛍️',
  title = 'Điền thông tin bên trên và bấm "Tạo sản phẩm" để bắt đầu',
  subtitle = 'AI sẽ sinh tên, mô tả, giá, tag và danh mục cho từng sản phẩm — chỉ trong vài giây.',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/50 py-16 text-center dark:border-slate-700 dark:bg-slate-900/50">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-2xl dark:bg-blue-500/10">{icon}</div>
      <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">{title}</p>
      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{subtitle}</p>
    </div>
  )
}
