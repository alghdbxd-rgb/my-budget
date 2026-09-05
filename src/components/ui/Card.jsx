export function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, action }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">{title}</h3>
        {subtitle && (
          <p className="mt-0.5 text-sm text-slate-400 dark:text-slate-500">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  )
}
