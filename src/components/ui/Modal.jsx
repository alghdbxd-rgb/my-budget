import { X } from "lucide-react"
import { useEffect } from "react"

export function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="إغلاق"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
      />
      <div className="animate-fade-in relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h2>
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
