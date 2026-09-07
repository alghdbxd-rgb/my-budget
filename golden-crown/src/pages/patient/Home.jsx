import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { statusInfo } from '../../lib/status'

export default function Home() {
  const { db } = useApp()
  const nav = useNavigate()
  const patientId = db.session.patientId
  const draft = db.drafts[patientId]
  const remainingFree = Math.max(0, db.settings.freeConsultationsLimit - db.settings.usedFreeCount)
  const latest = db.consultations
    .filter((c) => c.patientId === patientId && c.status !== 'draft')
    .sort((a, b) => b.createdAt - a.createdAt)[0]

  const start = () => {
    if (draft) nav(`/p/consult/${draft.step || 1}`)
    else nav('/p/consult/1')
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-3xl bg-gradient-to-b from-teal-900 to-teal-950 p-6 text-center text-white">
        <p className="text-xl font-extrabold">{db.settings.homeHeadline}</p>
        <p className="mt-2 text-sm leading-relaxed text-gold-100/80">{db.settings.homeSub}</p>
        <Button onClick={start} variant="gold" className="mt-5 w-full py-4 text-base">
          {draft ? 'متابعة الاستبيان' : 'احصل على استشارتك الآن'}
        </Button>
        {remainingFree > 0 && (
          <p className="mt-3 text-xs text-gold-100/70">
            متبقٍ {remainingFree.toLocaleString('ar')} استشارة مجانية من أصل{' '}
            {db.settings.freeConsultationsLimit.toLocaleString('ar')}
          </p>
        )}
      </div>

      {draft && (
        <Card className="border-gold-300 bg-gold-50">
          <p className="text-sm font-bold text-teal-950">لديك استبيان محفوظ لم يكتمل</p>
          <p className="mt-1 text-xs text-black/50">تم حفظ إجاباتك تلقائياً، أكمل من حيث توقفت.</p>
        </Card>
      )}

      {latest && (
        <Link to={latest.status === 'ready' ? `/p/report/${latest.id}` : `/p/status/${latest.id}`}>
          <Card className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-teal-950">آخر استشارة</p>
              <p className="mt-0.5 text-xs text-black/50">{latest.specialty}</p>
            </div>
            <Badge tone={statusInfo(latest.status).tone}>{statusInfo(latest.status).label}</Badge>
          </Card>
        </Link>
      )}

      <div className="grid grid-cols-3 gap-2 text-center">
        {['استبيان قصير', 'رأي طبيب مختص', 'تقرير PDF فوري'].map((t) => (
          <div key={t} className="rounded-xl bg-white p-3 text-[11px] font-semibold text-teal-900 shadow-sm">
            {t}
          </div>
        ))}
      </div>
    </div>
  )
}
