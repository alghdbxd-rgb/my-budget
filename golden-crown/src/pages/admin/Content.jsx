import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { Field, Input, Textarea } from '../../components/ui/Field'

export default function Content() {
  const { db, updateSettings } = useApp()
  const [form, setForm] = useState({
    homeHeadline: db.settings.homeHeadline,
    homeSub: db.settings.homeSub,
    questionnaireIntro: db.settings.questionnaireIntro,
    legalNotice: db.settings.legalNotice,
  })
  const [saved, setSaved] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <div>
      <p className="mb-4 text-sm text-black/50">
        تعديل نصوص الواجهات مباشرة بدون تدخل برمجي — تُطبَّق فوراً على كل الواجهات (F-A-04).
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          updateSettings(form)
          setSaved(true)
          setTimeout(() => setSaved(false), 1800)
        }}
        className="space-y-4"
      >
        <Card className="space-y-4">
          <p className="text-sm font-bold text-teal-950">الصفحة الرئيسية للمريض</p>
          <Field label="العنوان الرئيسي">
            <Input value={form.homeHeadline} onChange={set('homeHeadline')} />
          </Field>
          <Field label="النص الفرعي">
            <Textarea value={form.homeSub} onChange={set('homeSub')} />
          </Field>
        </Card>

        <Card>
          <Field label="مقدمة الاستبيان التشخيصي">
            <Textarea value={form.questionnaireIntro} onChange={set('questionnaireIntro')} />
          </Field>
        </Card>

        <Card>
          <Field
            label="نص التنبيه الطبي والقانوني"
            hint="يظهر كاملاً في كل تقرير — إلزامي بلا استثناء"
          >
            <Textarea value={form.legalNotice} onChange={set('legalNotice')} className="min-h-32" />
          </Field>
          {!db.settings.legalNoticeApproved && (
            <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-amber-50 p-2 text-xs text-amber-800">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              هذا النص مؤقت لأغراض المعاينة فقط — بانتظار الاعتماد النهائي من الطرف الطبي/القانوني
              للعميل (بند مفتوح رقم 11 في وثيقة المواصفات) قبل الإطلاق الفعلي.
            </p>
          )}
        </Card>

        <Button type="submit" variant="gold" className="w-full py-3">
          {saved ? 'تم الحفظ ✓' : 'حفظ ونشر التعديلات'}
        </Button>
      </form>

      <div className="mt-6 rounded-2xl border border-dashed border-black/15 p-4 text-center text-xs text-black/40">
        إدارة البانرات الترويجية — نقطة توسعة للمرحلة الثانية
      </div>
    </div>
  )
}
