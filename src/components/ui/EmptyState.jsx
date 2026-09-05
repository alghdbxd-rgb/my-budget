export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      {icon && (
        <div className="rounded-full bg-slate-100 p-3 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
          {icon}
        </div>
      )}
      <div>
        <p className="font-semibold text-slate-600 dark:text-slate-300">{title}</p>
        {description && (
          <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}
