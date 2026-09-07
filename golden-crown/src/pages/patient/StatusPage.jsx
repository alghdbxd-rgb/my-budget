import { useParams, Link, Navigate } from 'react-router-dom'
import { CheckCircle2, Circle, AlertTriangle } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

const STAGES = [
  { key: 'new', label: 'مستلمة' },
  { key: 'in_review', label: 'قيد المراجعة الطبية' },
  { key: 'ready', label: 'جاهزة' },
]

function stageIndex(status) {
  if (status === 'ready') return 2
  if (status === 'in_review' || status === 'reassigned') return 1
  return 0
}

export default function StatusPage() {
  const { id } = useParams()
  const { db } = useApp()
  const cs = db.consultations.find((c) => c.id === id)
  if (!cs) return <Navigate to="/p" replace />
  if (cs.status === 'ready') return <Navigate to={`/p/report/${cs.id}`} replace />

  const idx = stageIndex(cs.status)
  const doctor = db.doctors.find((d) => d.id === cs.doctorId)

  return (
    <div>
      <PageHeader title="حالة طلبك" subtitle={cs.specialty} back />

      {cs.urgent && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          <AlertTriangle size={18} />
          تم رصد مؤشرات تستدعي أولوية عالية — تم تصعيد حالتك لمراجعة عاجلة.
        </div>
      )}

      <Card>
        <div className="space-y-5">
          {STAGES.map((s, i) => (
            <div key={s.key} className="flex items-center gap-3">
              {i <= idx ? (
                <CheckCircle2 className="text-teal-800" size={22} />
              ) : (
                <Circle className="text-black/20" size={22} />
              )}
              <div className="flex-1">
                <p className={`text-sm font-bold ${i <= idx ? 'text-teal-950' : 'text-black/30'}`}>{s.label}</p>
              </div>
              {i === idx && <span className="pulse-ring h-2 w-2 rounded-full bg-gold-500" />}
            </div>
          ))}
        </div>
      </Card>

      {doctor && (
        <Card className="mt-3">
          <p className="text-xs text-black/40">تمت إحالة حالتك إلى</p>
          <p className="mt-1 font-bold text-teal-950">{doctor.name}</p>
          <p className="text-xs text-black/40">{doctor.specialty}</p>
        </Card>
      )}

      <p className="mt-4 text-center text-xs text-black/40">
        سنُشعرك فور جاهزية تقريرك. عادة خلال {db.settings.doctorResponseHours} ساعة.
      </p>

      <Link to="/p/orders" className="mt-6 block">
        <Button variant="outline" className="w-full">
          عرض كل طلباتي
        </Button>
      </Link>
    </div>
  )
}
