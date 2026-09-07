import { COMPLAINTS } from '../../../lib/db'

export default function Step2({ value, onChange, errors }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-extrabold text-teal-950">ما هي شكواك الرئيسية؟</h2>
      <p className="text-sm text-black/50">اختر الأقرب لحالتك، يمكنك التوضيح أكثر في الخطوة التالية.</p>

      <div className="grid grid-cols-2 gap-3">
        {COMPLAINTS.map((c) => {
          const active = value.complaintId === c.id
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onChange({ complaintId: c.id })}
              className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-center transition-colors ${
                active ? 'border-gold-500 bg-gold-50' : 'border-black/10 bg-white hover:border-teal-700/40'
              }`}
            >
              <span className="text-3xl">{c.icon}</span>
              <span className="text-sm font-bold text-teal-950">{c.label}</span>
            </button>
          )
        })}
      </div>
      {errors.complaintId && <p className="text-xs font-semibold text-red-600">{errors.complaintId}</p>}
    </div>
  )
}
