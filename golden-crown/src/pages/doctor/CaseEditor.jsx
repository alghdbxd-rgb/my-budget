import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ShieldOff } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { Textarea } from '../../components/ui/Field'
import { fmtDate } from '../../lib/status'
import { COMPLAINTS, GOVERNORATES } from '../../lib/db'

export default function CaseEditor() {
  const { id } = useParams()
  const nav = useNavigate()
  const { db, viewConsultation, submitOpinion } = useApp()
  const doctorId = db.session.doctorId
  const doctor = db.doctors.find((d) => d.id === doctorId)
  const cs = db.consultations.find((c) => c.id === id)
  const [text, setText] = useState(cs?.opinion || '')

  useEffect(() => {
    if (cs && cs.doctorId === doctorId) {
      viewConsultation(cs.id, { name: doctor?.name, role: 'doctor' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cs?.id])

  if (!cs) return <PageHeader title="الحالة غير موجودة" back />
  if (cs.doctorId !== doctorId) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <ShieldOff className="text-red-500" size={36} />
        <p className="font-bold text-teal-950">غير مصرح لك بالوصول لهذه الحالة</p>
        <p className="text-sm text-black/50">هذه الحالة مسنَدة لطبيب آخر.</p>
        <Button variant="outline" onClick={() => nav('/d')}>
          العودة للصندوق
        </Button>
      </div>
    )
  }

  const complaint = COMPLAINTS.find((x) => x.id === cs.complaintId)
  const region = GOVERNORATES.find((g) => g.id === cs.answers.step1?.region)
  const s3 = cs.answers.step3 || {}
  const readOnly = cs.status === 'ready'

  return (
    <div>
      <PageHeader
        title="مراجعة الاستشارة"
        subtitle={fmtDate(cs.createdAt)}
        back
        actions={cs.urgent && <Badge tone="red">حالة طارئة</Badge>}
      />

      <Card className="mb-3">
        <h3 className="mb-2 text-sm font-bold text-teal-950">بيانات الاستبيان</h3>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
          <p>
            <span className="text-black/40">العمر: </span>
            {cs.answers.step1?.age || '—'}
          </p>
          <p>
            <span className="text-black/40">الجنس: </span>
            {cs.answers.step1?.gender === 'male' ? 'ذكر' : 'أنثى'}
          </p>
          <p>
            <span className="text-black/40">المحافظة: </span>
            {region?.name || '—'}
          </p>
          <p>
            <span className="text-black/40">أمراض مزمنة: </span>
            {cs.answers.step1?.chronic || '—'}
          </p>
          <p>
            <span className="text-black/40">حساسية: </span>
            {cs.answers.step1?.allergies || '—'}
          </p>
          <p>
            <span className="text-black/40">الشكوى: </span>
            {complaint?.label}
          </p>
          <p>
            <span className="text-black/40">شدة الألم: </span>
            {s3.painLevel ?? '—'}/10
          </p>
          <p>
            <span className="text-black/40">المدة: </span>
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
              <span className="text-black/40">السن: </span>
              {s3.tooth}
            </p>
          )}
        </div>
      </Card>

      <Card className="mb-3">
        <h3 className="mb-2 text-sm font-bold text-teal-950">
          الصور المرفقة ({cs.answers.step4?.images?.length ?? 0})
        </h3>
        {cs.answers.step4?.images?.length ? (
          <div className="flex gap-2">
            {cs.answers.step4.images.map((img) => (
              <img key={img.id} src={img.dataUrl} alt="" className="h-24 w-24 rounded-lg object-cover" />
            ))}
          </div>
        ) : (
          <p className="text-xs text-black/40">لم يرفق المريض صوراً</p>
        )}
      </Card>

      <Card>
        <h3 className="mb-2 text-sm font-bold text-teal-950">الرأي الاستشاري</h3>
        {!readOnly && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {db.templates.map((t) => (
              <button
                key={t.id}
                onClick={() => setText(t.body)}
                className="rounded-full bg-teal-900/5 px-3 py-1 text-xs font-semibold text-teal-900 hover:bg-teal-900/10"
              >
                {t.title}
              </button>
            ))}
          </div>
        )}
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={readOnly}
          placeholder="اكتب رأيك الاستشاري والتوجيه العلاجي هنا..."
          className="min-h-40"
        />
        {!readOnly ? (
          <Button
            onClick={() => {
              submitOpinion(cs.id, doctorId, text)
              nav('/d')
            }}
            disabled={!text.trim()}
            variant="gold"
            className="mt-3 w-full py-3"
          >
            إرسال الرأي وإصدار التقرير
          </Button>
        ) : (
          <p className="mt-2 text-xs text-emerald-700">✓ تم إرسال هذا الرأي وإصدار التقرير للمريض</p>
        )}
      </Card>
    </div>
  )
}
