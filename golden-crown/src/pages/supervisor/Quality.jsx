import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import { Textarea } from '../../components/ui/Field'
import { fmtDate } from '../../lib/status'

export default function Quality() {
  const { db, addQualityNote, resolveComplaint } = useApp()
  const [notes, setNotes] = useState({})

  const answered = db.consultations.filter((c) => c.status === 'ready')
  const complaints = db.complaints

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 text-sm font-bold text-teal-950">مراجعة جودة الردود</h2>
        {answered.length === 0 ? (
          <EmptyState icon="⭐" title="لا توجد ردود مكتملة بعد" />
        ) : (
          <div className="space-y-3">
            {answered.map((c) => {
              const doctor = db.doctors.find((d) => d.id === c.doctorId)
              return (
                <Card key={c.id}>
                  <p className="text-sm font-bold text-teal-950">
                    {c.specialty} — {doctor?.name}
                  </p>
                  <p className="mt-1 line-clamp-3 whitespace-pre-line text-xs text-black/50">{c.opinion}</p>
                  {c.qualityNotes?.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {c.qualityNotes.map((n) => (
                        <p key={n.id} className="rounded-lg bg-gold-50 px-2 py-1 text-[11px] text-gold-800">
                          {n.note}
                        </p>
                      ))}
                    </div>
                  )}
                  <div className="mt-2 flex gap-2">
                    <input
                      value={notes[c.id] || ''}
                      onChange={(e) => setNotes((n) => ({ ...n, [c.id]: e.target.value }))}
                      placeholder="أضف ملاحظة جودة..."
                      className="flex-1 rounded-lg border border-black/10 px-2.5 py-1.5 text-xs"
                    />
                    <Button
                      variant="subtle"
                      className="px-3 py-1.5 text-xs"
                      onClick={() => {
                        if (!notes[c.id]?.trim()) return
                        addQualityNote(c.id, notes[c.id])
                        setNotes((n) => ({ ...n, [c.id]: '' }))
                      }}
                    >
                      إضافة
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold text-teal-950">شكاوى المرضى</h2>
        {complaints.length === 0 ? (
          <EmptyState icon="📮" title="لا توجد شكاوى" />
        ) : (
          <div className="space-y-3">
            {complaints.map((cp) => (
              <Card key={cp.id}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm text-teal-950">{cp.text}</p>
                    <p className="mt-1 text-[11px] text-black/40">{fmtDate(cp.createdAt)}</p>
                  </div>
                  <Badge tone={cp.status === 'open' ? 'orange' : 'green'}>
                    {cp.status === 'open' ? 'مفتوحة' : 'تمت المعالجة'}
                  </Badge>
                </div>
                {cp.status === 'open' && (
                  <ResolveBox onSubmit={(note) => resolveComplaint(cp.id, note)} />
                )}
                {cp.note && <p className="mt-2 rounded-lg bg-emerald-50 p-2 text-xs text-emerald-800">{cp.note}</p>}
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function ResolveBox({ onSubmit }) {
  const [val, setVal] = useState('')
  return (
    <div className="mt-2 flex gap-2">
      <Textarea value={val} onChange={(e) => setVal(e.target.value)} className="min-h-16 flex-1 text-xs" placeholder="إجراء المعالجة..." />
      <Button
        variant="gold"
        className="self-start px-3 py-1.5 text-xs"
        onClick={() => val.trim() && onSubmit(val)}
      >
        إغلاق الشكوى
      </Button>
    </div>
  )
}
