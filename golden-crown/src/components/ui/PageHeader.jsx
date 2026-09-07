import { ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function PageHeader({ title, subtitle, back, actions }) {
  const nav = useNavigate()
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="flex items-start gap-2">
        {back && (
          <button
            onClick={() => nav(-1)}
            className="mt-0.5 rounded-full p-1.5 text-teal-900 hover:bg-teal-900/5"
            aria-label="رجوع"
          >
            <ChevronRight size={20} />
          </button>
        )}
        <div>
          <h1 className="text-lg font-extrabold text-teal-950">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-black/50">{subtitle}</p>}
        </div>
      </div>
      {actions}
    </div>
  )
}
