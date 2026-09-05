const VARIANTS = {
  primary:
    "bg-teal-600 text-white hover:bg-teal-700 focus-visible:outline-teal-600 shadow-sm shadow-teal-600/20",
  secondary:
    "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700",
  ghost:
    "bg-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
  danger: "bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400",
}

export function Button({
  children,
  variant = "primary",
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
