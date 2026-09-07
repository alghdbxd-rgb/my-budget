import { useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { MapPin, Star, Clock, CheckCircle2 } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { matchDoctors } from '../../lib/engine'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'

const DAY_LABELS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

function BookModal({ match, consultationId, onClose }) {
  const { bookAppointment } = useApp()
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [done, setDone] = useState(false)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="w-full max-w-sm rounded-t-2xl bg-white p-5 sm:rounded-2xl">
        {done ? (
          <div className="py-4 text-center">
            <CheckCircle2 className="mx-auto mb-2 text-emerald-600" size={40} />
            <p className="font-bold text-teal-950">تم حجز موعدك</p>
            <p className="mt-1 text-sm text-black/50">
              {match.doctor.name} — {date} {time}
            </p>
            <Button onClick={onClose} variant="outline" className="mt-4 w-full">
              إغلاق
            </Button>
          </div>
        ) : (
          <>
            <p className="mb-3 font-bold text-teal-950">حجز موعد مع {match.doctor.name}</p>
            <label className="mb-3 block text-sm">
              <span className="mb-1 block font-semibold">التاريخ</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-black/10 px-3 py-2.5"
              />
            </label>
            <label className="mb-4 block text-sm">
              <span className="mb-1 block font-semibold">الوقت</span>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-xl border border-black/10 px-3 py-2.5"
              />
            </label>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={onClose} className="flex-1">
                إلغاء
              </Button>
              <Button
                variant="gold"
                className="flex-1"
                disabled={!date || !time}
                onClick={() => {
                  bookAppointment(consultationId, match.doctor.id, new Date(`${date}T${time}`).getTime())
                  setDone(true)
                }}
              >
                تأكيد الحجز
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function DoctorMatches() {
  const { id } = useParams()
  const { db } = useApp()
  const cs = db.consultations.find((c) => c.id === id)
  const [booking, setBooking] = useState(null)
  if (!cs) return <Navigate to="/p" replace />

  const patient = db.patients.find((p) => p.id === cs.patientId)
  const matches = matchDoctors(db, { specialty: cs.specialty, regionId: patient?.region }, { requireHours: false })

  return (
    <div>
      <PageHeader title="أقرب الأطباء" subtitle={cs.specialty} back />

      {matches.length === 0 ? (
        <EmptyState
          icon="🗺️"
          title="لا يوجد طبيب متاح بهذا التخصص حالياً"
          sub="سيتم تعيين أقرب طبيب متاح فور توفره — يمكنك المتابعة من صفحة طلباتي."
        />
      ) : (
        <div className="space-y-3">
          {matches.map((m) => (
            <Card key={m.doctor.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-teal-950">{m.doctor.name}</p>
                  <p className="text-xs text-black/40">{m.doctor.specialty}</p>
                  <div className="mt-1 flex items-center gap-1 text-xs text-gold-700">
                    <Star size={13} fill="currentColor" /> {m.doctor.rating || '—'} ({m.doctor.reviewsCount})
                  </div>
                </div>
                <span className="rounded-full bg-teal-900/5 px-2.5 py-1 text-xs font-bold text-teal-900">
                  {Number.isFinite(m.distanceKm) ? `${m.distanceKm.toFixed(0)} كم` : '—'}
                </span>
              </div>

              <div className="mt-3 flex items-start gap-2 rounded-xl bg-black/[0.03] p-2.5 text-xs text-black/50">
                <MapPin size={14} className="mt-0.5 shrink-0" />
                <span>
                  {m.clinic?.name} — {m.clinic?.address}
                  <span className="mt-0.5 block text-[10px] text-black/30">
                    (خارطة تفاعلية بانتظار ربط خدمة الخرائط — بند مفتوح رقم 11)
                  </span>
                </span>
              </div>

              <div className="mt-2 flex items-center gap-2 text-xs text-black/40">
                <Clock size={13} />
                {m.doctor.hours?.length
                  ? m.doctor.hours.map((h) => `${DAY_LABELS[h.day]} ${h.from}-${h.to}`).join(' · ')
                  : 'غير محدد'}
              </div>

              <Button onClick={() => setBooking(m)} variant="outline" className="mt-3 w-full">
                حجز موعد
              </Button>
            </Card>
          ))}
        </div>
      )}

      {booking && <BookModal match={booking} consultationId={cs.id} onClose={() => setBooking(null)} />}
    </div>
  )
}
