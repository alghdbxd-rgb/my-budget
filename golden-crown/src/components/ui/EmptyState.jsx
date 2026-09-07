export default function EmptyState({ icon, title, sub, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/10 bg-white/50 px-6 py-12 text-center">
      {icon && <div className="mb-3 text-4xl">{icon}</div>}
      <p className="font-bold text-teal-950">{title}</p>
      {sub && <p className="mt-1 max-w-xs text-sm text-black/50">{sub}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
