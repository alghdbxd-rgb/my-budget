import { useApp } from '../../context/AppContext'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import { fmtDate } from '../../lib/status'

export default function Finance() {
  const { db } = useApp()
  const doctorId = db.session.doctorId
  const mine = db.consultations.filter((c) => c.doctorId === doctorId)
  const txs = db.transactions.filter((t) => t.doctorId === doctorId)
  const totalDue = txs.reduce((s, t) => s + t.doctorShare, 0)
  const settled = txs.filter((t) => t.settled).reduce((s, t) => s + t.doctorShare, 0)
  const pending = totalDue - settled

  return (
    <div>
      <PageHeader title="لوحة حساباتي" subtitle="الإيراد والنسب المستحقة" />

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'إجمالي الحالات', value: mine.length.toLocaleString('ar') },
          { label: 'حسابات مستحقة', value: `${pending.toLocaleString('ar')} د.ع` },
          { label: 'تم تسويتها', value: `${settled.toLocaleString('ar')} د.ع` },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-white p-3 text-center shadow-sm">
            <p className="text-sm font-extrabold text-teal-950">{s.value}</p>
            <p className="mt-1 text-[10px] text-black/40">{s.label}</p>
          </div>
        ))}
      </div>

      <h3 className="mb-2 mt-5 text-sm font-bold text-teal-950">الأكواد المصروفة في عيادتك</h3>
      {txs.length === 0 ? (
        <EmptyState icon="💳" title="لا توجد أكواد مصروفة بعد" sub="ستظهر هنا فور صرف المريض للكود في العيادة" />
      ) : (
        <div className="space-y-2">
          {txs.map((t) => (
            <Card key={t.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-teal-950">استشارة {t.consultationId}</p>
                <p className="text-xs text-black/40">{fmtDate(t.date)}</p>
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-teal-950">{t.doctorShare.toLocaleString('ar')} د.ع</p>
                <Badge tone={t.settled ? 'green' : 'gold'}>{t.settled ? 'تمت التسوية' : 'قيد التسوية'}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
