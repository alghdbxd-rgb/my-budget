import { useParams, Navigate, Link } from 'react-router-dom'
import { Printer, MapPin } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import Button from '../../components/ui/Button'
import { fmtDate } from '../../lib/status'
import { COMPLAINTS, GOVERNORATES } from '../../lib/db'

export default function Report() {
  const { id } = useParams()
  const { db } = useApp()
  const cs = db.consultations.find((c) => c.id === id)
  if (!cs || cs.status !== 'ready') return <Navigate to={`/p/status/${id}`} replace />

  const doctor = db.doctors.find((d) => d.id === cs.doctorId)
  const patient = db.patients.find((p) => p.id === cs.patientId)
  const complaint = COMPLAINTS.find((c) => c.id === cs.complaintId)
  const region = GOVERNORATES.find((g) => g.id === cs.answers.step1?.region)
  const s3 = cs.answers.step3 || {}

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between print:hidden">
        <Link to="/p/orders" className="text-sm font-semibold text-teal-800">
          ← طلباتي
        </Link>
        <Button onClick={() => window.print()} variant="outline" className="gap-2">
          <Printer size={16} /> طباعة / حفظ PDF
        </Button>
      </div>

      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm print:border-0 print:shadow-none">
        <div className="flex items-center justify-between border-b border-dashed border-black/10 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-3xl">👑</span>
            <div>
              <p className="font-extrabold text-teal-950">التاج الذهبي</p>
              <p className="text-[11px] text-black/40">منصة استشارات طب الأسنان</p>
            </div>
          </div>
          <div className="text-left text-xs text-black/40">
            <p>التقرير الاستشاري</p>
            <p className="font-mono font-bold text-teal-900" dir="ltr">
              {cs.code}
            </p>
          </div>
        </div>

        <section className="mt-4">
          <h2 className="mb-2 text-sm font-extrabold text-teal-950">1. ملخص الحالة</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 rounded-xl bg-black/[0.02] p-3 text-sm">
            <p>
              <span className="text-black/40">المريض: </span>
              {patient?.name || 'غير محدد'}
            </p>
            <p>
              <span className="text-black/40">العمر: </span>
              {cs.answers.step1?.age || '—'}
            </p>
            <p>
              <span className="text-black/40">المحافظة: </span>
              {region?.name || '—'}
            </p>
            <p>
              <span className="text-black/40">الشكوى: </span>
              {complaint?.label} {complaint?.icon}
            </p>
            <p>
              <span className="text-black/40">شدة الألم: </span>
              {s3.painLevel ?? '—'} / 10
            </p>
            <p>
              <span className="text-black/40">مدة الأعراض: </span>
              {s3.duration || '—'}
            </p>
            <p>
              <span className="text-black/40">تورّم: </span>
              {s3.swelling ? 'نعم' : 'لا'}
            </p>
            <p>
              <span className="text-black/40">حرارة: </span>
              {s3.fever ? 'نعم' : 'لا'}
            </p>
            {s3.tooth && (
              <p>
                <span className="text-black/40">السن المحدد: </span>
                {s3.tooth}
              </p>
            )}
            <p>
              <span className="text-black/40">تاريخ الطلب: </span>
              {fmtDate(cs.createdAt)}
            </p>
          </div>
          {cs.answers.step4?.images?.length > 0 && (
            <div className="mt-3 flex gap-2">
              {cs.answers.step4.images.map((img) => (
                <img key={img.id} src={img.dataUrl} alt="" className="h-16 w-16 rounded-lg object-cover" />
              ))}
            </div>
          )}
        </section>

        <section className="mt-5">
          <h2 className="mb-2 text-sm font-extrabold text-teal-950">2. الرأي الاستشاري والتوجيه العلاجي</h2>
          <p className="whitespace-pre-line rounded-xl border border-teal-900/10 bg-teal-900/[0.03] p-3 text-sm leading-relaxed text-teal-950">
            {cs.opinion}
          </p>
          <p className="mt-2 text-xs text-black/40">
            الطبيب: {doctor?.name} — {doctor?.specialty}
          </p>
        </section>

        <section className="mt-5">
          <h2 className="mb-2 text-sm font-extrabold text-teal-950">3. تنبيه طبي وقانوني</h2>
          <p className="rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
            {db.settings.legalNotice}
          </p>
        </section>

        <div className="mt-6 flex items-center justify-between border-t border-dashed border-black/10 pt-4 text-xs text-black/30">
          <span>الرمز التسلسلي: {cs.code}</span>
          <span>صادر عن منصة التاج الذهبي</span>
        </div>
      </div>

      <Link to={`/p/doctors/${cs.id}`} className="mt-4 block print:hidden">
        <Button variant="gold" className="w-full gap-2 py-3.5">
          <MapPin size={18} /> عرض أقرب الأطباء لحجز موعد
        </Button>
      </Link>
    </div>
  )
}
