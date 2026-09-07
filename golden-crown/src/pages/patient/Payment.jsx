import { useState } from 'react'
import { useNavigate, useParams, Navigate } from 'react-router-dom'
import { ChevronRight, Wallet, Landmark, AlertTriangle } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'

export default function Payment() {
  const { id } = useParams()
  const nav = useNavigate()
  const { db, payConsultation, retryPayment, isFreeEligible } = useApp()
  const cs = db.consultations.find((c) => c.id === id)
  const [loading, setLoading] = useState(false)

  if (!cs) return <Navigate to="/p" replace />
  if (cs.paymentStatus === 'paid') return <Navigate to={`/p/status/${cs.id}`} replace />

  const free = isFreeEligible()

  const pay = (method) => {
    setLoading(true)
    setTimeout(() => {
      const res = payConsultation(cs.id, method)
      setLoading(false)
      if (res.ok) nav(`/p/status/${cs.id}`)
    }, 700)
  }

  return (
    <div className="mx-auto min-h-screen max-w-md px-4 pb-10 pt-5">
      <button
        onClick={() => nav(`/p/consult/4`)}
        className="mb-4 flex items-center gap-1 text-sm font-semibold text-teal-800"
      >
        <ChevronRight size={16} /> رجوع للاستبيان
      </button>

      <h1 className="text-lg font-extrabold text-teal-950">إتمام الدفع</h1>
      <p className="mt-1 text-sm text-black/50">استشارتك جاهزة للإرسال — أكمل الخطوة الأخيرة.</p>

      {cs.paymentStatus === 'failed' && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          <AlertTriangle size={18} />
          فشلت عملية الدفع السابقة. بياناتك محفوظة بالكامل، أعد المحاولة.
        </div>
      )}

      <Card className="mt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-black/50">التخصص</span>
          <span className="font-bold text-teal-950">{cs.specialty}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-black/50">رسم الاستشارة</span>
          <span className="font-bold text-teal-950">
            {free ? 'مجاناً 🎉' : `${db.settings.consultFee.toLocaleString('ar')} د.ع`}
          </span>
        </div>
      </Card>

      {free ? (
        <div className="mt-5">
          <div className="mb-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
            استشارتك ضمن عرض أول {db.settings.freeConsultationsLimit.toLocaleString('ar')} استشارة مجانية.
          </div>
          <Button
            onClick={() => pay('free')}
            disabled={loading}
            variant="gold"
            className="w-full py-3.5"
          >
            {loading ? 'جارِ التأكيد...' : 'تأكيد الاستشارة المجانية'}
          </Button>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          <button
            onClick={() => pay('zaincash')}
            disabled={loading}
            className="flex w-full items-center gap-3 rounded-2xl border-2 border-black/10 bg-white p-4 text-start hover:border-teal-700/40 disabled:opacity-50"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
              <Wallet size={20} />
            </span>
            <span>
              <span className="block text-sm font-bold text-teal-950">زين كاش</span>
              <span className="block text-xs text-black/40">الدفع عبر محفظة زين كاش</span>
            </span>
          </button>
          <button
            onClick={() => pay('asiahawala')}
            disabled={loading}
            className="flex w-full items-center gap-3 rounded-2xl border-2 border-black/10 bg-white p-4 text-start hover:border-teal-700/40 disabled:opacity-50"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Landmark size={20} />
            </span>
            <span>
              <span className="block text-sm font-bold text-teal-950">آسيا حوالة</span>
              <span className="block text-xs text-black/40">الدفع عبر آسيا حوالة</span>
            </span>
          </button>

          <button
            onClick={() => pay('fail-test')}
            disabled={loading}
            className="block w-full text-center text-[11px] text-black/30 underline"
          >
            (لأغراض المعاينة) محاكاة فشل الدفع
          </button>
        </div>
      )}

      {cs.paymentStatus === 'failed' && (
        <button onClick={() => retryPayment(cs.id)} className="mt-2 block w-full text-center text-xs text-black/40">
          إعادة تعيين حالة الدفع
        </button>
      )}
    </div>
  )
}
