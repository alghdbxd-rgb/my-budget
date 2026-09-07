import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import { fmtDate } from '../../lib/status'
import { COMPLAINTS } from '../../lib/db'

const TABS = [
  { id: 'open', label: 'حالات جديدة' },
  { id: 'ready', label: 'مكتملة' },
]

export default function Inbox() {
  const { db } = useApp()
  const doctorId = db.session.doctorId
  const [tab, setTab] = useState('open')

  const mine = db.consultations.filter((c) => c.doctorId === doctorId)
  const list = mine
    .filter((c) => (tab === 'ready' ? c.status === 'ready' : c.status !== 'ready'))
    .sort((a, b) => (b.urgent === a.urgent ? a.createdAt - b.createdAt : b.urgent ? 1 : -1))

  return (
    <div>
      <PageHeader title="صندوق الحالات" subtitle={`${mine.length} حالة مسنَدة إليك`} />

      <div className="mb-4 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-xl py-2.5 text-sm font-bold ${
              tab === t.id ? 'bg-teal-900 text-white' : 'bg-white text-black/50'
            }`}
          >
            {t.label} ({mine.filter((c) => (t.id === 'ready' ? c.status === 'ready' : c.status !== 'ready')).length})
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState icon="📭" title="لا توجد حالات هنا" sub="ستظهر الحالات الجديدة المسنَدة إليك هنا فور توجيهها." />
      ) : (
        <div className="space-y-3">
          {list.map((c) => {
            const complaint = COMPLAINTS.find((x) => x.id === c.complaintId)
            return (
              <Link key={c.id} to={`/d/case/${c.id}`}>
                <Card className={c.urgent ? 'border-red-300' : ''}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="flex items-center gap-1.5 font-bold text-teal-950">
                        {complaint?.icon} {c.specialty}
                      </p>
                      <p className="mt-0.5 text-xs text-black/40">{fmtDate(c.createdAt)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {c.urgent && (
                        <Badge tone="red">
                          <AlertTriangle size={11} /> طارئة
                        </Badge>
                      )}
                      {c.reassignedAt && <Badge tone="orange">معاد توجيهها</Badge>}
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-black/50">
                    ألم: {c.answers.step3?.painLevel ?? '—'}/10 · صور: {c.answers.step4?.images?.length ?? 0}
                  </p>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
