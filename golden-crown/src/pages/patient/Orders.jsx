import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import { statusInfo, fmtDate } from '../../lib/status'

export default function Orders() {
  const { db } = useApp()
  const patientId = db.session.patientId
  const list = db.consultations
    .filter((c) => c.patientId === patientId && c.status !== 'draft')
    .sort((a, b) => b.createdAt - a.createdAt)

  return (
    <div>
      <PageHeader title="طلباتي" subtitle="سجل الاستشارات، الأكواد والمواعيد" />
      {list.length === 0 ? (
        <EmptyState icon="📋" title="لا توجد استشارات بعد" sub="ابدأ استشارتك الأولى من الرئيسية" />
      ) : (
        <div className="space-y-3">
          {list.map((c) => {
            const s = statusInfo(c.status)
            const href = c.status === 'ready' ? `/p/report/${c.id}` : `/p/status/${c.id}`
            return (
              <Link key={c.id} to={href}>
                <Card>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-teal-950">{c.specialty}</p>
                    <Badge tone={s.tone}>{s.label}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-black/40">{fmtDate(c.createdAt)}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    {c.code && (
                      <span className="rounded-lg bg-black/5 px-2 py-1 font-mono" dir="ltr">
                        {c.code}
                      </span>
                    )}
                    {c.code &&
                      (() => {
                        const code = db.codes.find((x) => x.value === c.code)
                        return (
                          <Badge tone={code?.redeemed ? 'green' : 'gold'}>
                            {code?.redeemed ? 'مصروف' : 'غير مصروف'}
                          </Badge>
                        )
                      })()}
                    {c.appointment && (
                      <Badge tone="teal">
                        موعد: {new Date(c.appointment.when).toLocaleDateString('ar-IQ')}
                      </Badge>
                    )}
                    {c.urgent && <Badge tone="red">حالة طارئة</Badge>}
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
