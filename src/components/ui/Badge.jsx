const TONES = {
  primary: "bg-primary-50 text-primary-600 dark:bg-primary-950/30 dark:text-primary-400",
  green: "bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400",
  rose: "bg-rose-50 text-rose-500 dark:bg-rose-950/30 dark:text-rose-400",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
  slate: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
}

// شارة موحّدة لكل النظام — إما بلون دلالي (tone) أو بلون التصنيف الفعلي (color)
export function Badge({ tone = "slate", color, children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold ${color ? "" : TONES[tone]} ${className}`}
      style={color ? { background: `${color}1a`, color } : undefined}
    >
      {children}
    </span>
  )
}
