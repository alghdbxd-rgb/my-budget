import { useState } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import { Input } from '../../components/ui/Field'
import { fmtDate } from '../../lib/status'

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl bg-white p-3 text-center shadow-sm">
      <p className="text-sm font-extrabold text-teal-950">{value}</p>
      <p className="mt-1 text-[10px] text-black/40">{label}</p>
    </div>
  )
}

export default function Finance() {
  const { db, redeemCode, settleTransaction } = useApp()
  const [code, setCode] = useState('')
  const [msg, setMsg] = useState(null)

  const paidNonFree = db.consultations.filter((c) => c.paymentStatus === 'paid' && c.paymentMethod !== 'free')
  const grossIncome = paidNonFree.length * db.settings.consultFee
  const totalDoctorShare = db.transactions.reduce((s, t) => s + t.doctorShare, 0)
  const totalPlatformShare = db.transactions.reduce((s, t) => s + t.platformShare, 0)
  const pendingSettlements = db.transactions.filter((t) => !t.settled).length

  const doRedeem = () => {
    if (!code.trim()) return
    const res = redeemCode(code, 'CL-1')
    if (res.ok) setMsg({ ok: true, text: 'تم صرف الكود وتحديث تقرير النسب فوراً' })
    else if (res.reason === 'already_redeemed') setMsg({ ok: false, text: `تم صرف هذا الكود مسبقاً بتاريخ ${fmtDate(res.at)}` })
    else setMsg({ ok: false, text: 'الكود غير موجود' })
    setCode('')
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="الدخل الإجمالي (تقديري)" value={`${grossIncome.toLocaleString('ar')} د.ع`} />
        <StatCard label="حصة الأطباء المصروفة" value={`${totalDoctorShare.toLocaleString('ar')} د.ع`} />
        <StatCard label="حصة المنصة" value={`${totalPlatformShare.toLocaleString('ar')} د.ع`} />
        <StatCard label="تسويات معلّقة" value={pendingSettlements} />
      </div>

      <Card>
        <p className="mb-2 text-sm font-bold text-teal-950">صرف كود استشارة (نقطة العيادة)</p>
        <div className="flex gap-2">
          <Input dir="ltr" placeholder="GC-XXXXXX" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className="flex-1 text-left" />
          <Button onClick={doRedeem} variant="gold" className="px-4">
            صرف
          </Button>
        </div>
        {msg && (
          <p className={`mt-2 flex items-center gap-1.5 text-xs font-semibold ${msg.ok ? 'text-emerald-700' : 'text-red-600'}`}>
            {msg.ok ? <CheckCircle2 size={14} /> : <XCircle size={14} />} {msg.text}
          </p>
        )}
      </Card>

      <div>
        <h2 className="mb-2 text-sm font-bold text-teal-950">الحركات المالية</h2>
        {db.transactions.length === 0 ? (
          <EmptyState icon="💰" title="لا توجد حركات مالية بعد" />
        ) : (
          <div className="space-y-2">
            {db.transactions.map((t) => {
              const doctor = db.doctors.find((d) => d.id === t.doctorId)
              return (
                <Card key={t.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-teal-950">{doctor?.name || '—'}</p>
                    <p className="text-xs text-black/40">
                      {t.consultationId} · {fmtDate(t.date)}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-black/40">
                      طبيب {t.doctorShare.toLocaleString('ar')} / منصة {t.platformShare.toLocaleString('ar')}
                    </p>
                    {t.settled ? (
                      <Badge tone="green">تمت التسوية</Badge>
                    ) : (
                      <Button variant="subtle" className="mt-1 px-2.5 py-1 text-[11px]" onClick={() => settleTransaction(t.id)}>
                        تسوية الآن
                      </Button>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
