import { useState } from 'react'
import { AlertTriangle, Clock, Shuffle } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { matchDoctors } from '../../lib/engine'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import { statusInfo, fmtDate, timeAgo } from '../../lib/status'
import { COMPLAINTS } from '../../lib/db'

function ReassignPicker({ cs, onClose }) {
  const { db, reassignConsultation } = useApp()
  const options = matchDoctors(db, { specialty: cs.specialty, regionId: undefined }, { requireHours: false }).filter(
    (m) => m.doctor.id !== cs.doctorId,
  )
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="w-full max-w-sm rounded-t-2xl bg-white p-5 sm:rounded-2xl">
        <p className="mb-3 font-bold text-teal-950">إعادة توجيه الحالة إلى</p>
        <div className="max-h-72 space-y-2 overflow-y-auto">
          {options.length === 0 && <p className="text-sm text-black/40">لا يوجد بديل متاح بنفس التخصص</p>}
          {options.map((m) => (
            <button
              key={m.doctor.id}
              onClick={() => {
                reassignConsultation(cs.id, m.doctor.id, 'تجاوز مدة الرد المحددة')
                onClose()
              }}
              className="flex w-full items-center justify-between rounded-xl border border-black/10 p-3 text-sm hover:border-teal-700/40"
            >
              <span className="font-semibold text-teal-950">{m.doctor.name}</span>
              <span className="text-xs text-black/40">حمل: {m.load}</span>
            </button>
          ))}
        </div>
        <Button variant="ghost" onClick={onClose} className="mt-3 w-full">
          إلغاء
        </Button>
      </div>
    </div>
  )
}

export default function Queue() {
  const { db } = useApp()
  const [reassigning, setReassigning] = useState(null)
  const [filter, setFilter] = useState('all')

  const list = db.consultations
    .filter((c) => c.paymentStatus === 'paid')
    .filter((c) => filter === 'all' || (filter === 'urgent' ? c.urgent : filter === 'ready' ? c.status === 'ready' : c.status !== 'ready'))
    .sort((a, b) => (b.urgent === a.urgent ? a.createdAt - b.createdAt : b.urgent ? 1 : -1))

  const respHours = db.settings.doctorResponseHours

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {[
          { id: 'all', label: 'الكل' },
          { id: 'urgent', label: 'طارئة' },
          { id: 'open', label: 'قيد المراجعة' },
          { id: 'ready', label: 'مكتملة' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold ${
              filter === f.id ? 'bg-teal-900 text-white' : 'bg-white text-black/50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState icon="🗂️" title="لا توجد استشارات في هذا الفلتر" />
      ) : (
        <div className="space-y-3">
          {list.map((c) => {
            const s = statusInfo(c.status)
            const doctor = db.doctors.find((d) => d.id === c.doctorId)
            const overdue = c.status !== 'ready' && Date.now() - c.createdAt > respHours * 3600_000
            const complaint = COMPLAINTS.find((x) => x.id === c.complaintId)
            return (
              <Card key={c.id} className={c.urgent ? 'border-red-300' : overdue ? 'border-orange-300' : ''}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="flex items-center gap-1.5 font-bold text-teal-950">
                      {complaint?.icon} {c.specialty}
                      <span className="font-mono text-[10px] font-normal text-black/30">{c.id}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-black/40">
                      {doctor?.name || 'بدون طبيب مُسنَد'} · {fmtDate(c.createdAt)} ({timeAgo(c.createdAt)})
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge tone={s.tone}>{s.label}</Badge>
                    {c.urgent && (
                      <Badge tone="red">
                        <AlertTriangle size={11} /> طارئة
                      </Badge>
                    )}
                    {overdue && (
                      <Badge tone="orange">
                        <Clock size={11} /> تجاوز مدة الرد
                      </Badge>
                    )}
                  </div>
                </div>
                {c.status !== 'ready' && (
                  <Button
                    onClick={() => setReassigning(c)}
                    variant="subtle"
                    className="mt-3 w-full gap-1.5 py-2 text-xs"
                  >
                    <Shuffle size={14} /> إعادة توجيه لطبيب آخر
                  </Button>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {reassigning && <ReassignPicker cs={reassigning} onClose={() => setReassigning(null)} />}
    </div>
  )
}
