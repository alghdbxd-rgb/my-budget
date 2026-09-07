import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import { Field, Input } from '../../components/ui/Field'
import { fmtDate } from '../../lib/status'

export default function Settings() {
  const { db, updateSettings } = useApp()
  const s = db.settings
  const [form, setForm] = useState({
    freeConsultationsLimit: s.freeConsultationsLimit,
    consultFee: s.consultFee,
    discountPercent: s.discountPercent,
    doctorResponseHours: s.doctorResponseHours,
    painThreshold: s.escalation.painThreshold,
  })
  const [saved, setSaved] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: Number(e.target.value) }))

  const codes = [...db.codes].sort((a, b) => (b.redeemedAt || 0) - (a.redeemedAt || 0))

  return (
    <div className="space-y-6">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          updateSettings({
            freeConsultationsLimit: form.freeConsultationsLimit,
            consultFee: form.consultFee,
            discountPercent: form.discountPercent,
            doctorResponseHours: form.doctorResponseHours,
            escalation: { ...s.escalation, painThreshold: form.painThreshold },
          })
          setSaved(true)
          setTimeout(() => setSaved(false), 1800)
        }}
        className="space-y-4"
      >
        <Card className="space-y-4">
          <p className="text-sm font-bold text-teal-950">إعدادات النظام — تسري فوراً بدون إعادة نشر</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="عدّاد الاستشارات المجانية">
              <Input type="number" value={form.freeConsultationsLimit} onChange={set('freeConsultationsLimit')} />
            </Field>
            <Field label="رسم الاستشارة (د.ع)">
              <Input type="number" value={form.consultFee} onChange={set('consultFee')} />
            </Field>
            <Field label="قيمة الخصم الافتراضي (%)">
              <Input type="number" value={form.discountPercent} onChange={set('discountPercent')} />
            </Field>
            <Field label="مدة رد الطبيب (ساعة)">
              <Input type="number" value={form.doctorResponseHours} onChange={set('doctorResponseHours')} />
            </Field>
          </div>
          <Field
            label="حد شدة الألم للتصعيد الطارئ (من 10)"
            hint="التصعيد يحدث عند اجتماع: تورّم + حرارة + ألم فوق هذا الحد"
          >
            <Input type="number" min={0} max={10} value={form.painThreshold} onChange={set('painThreshold')} />
          </Field>
        </Card>
        <Button type="submit" variant="gold" className="w-full py-3">
          {saved ? 'تم الحفظ ✓ — سارٍ الآن' : 'حفظ الإعدادات'}
        </Button>
      </form>

      <div>
        <h2 className="mb-2 text-sm font-bold text-teal-950">متابعة الأكواد ({codes.length})</h2>
        {codes.length === 0 ? (
          <EmptyState icon="🎫" title="لا توجد أكواد بعد" />
        ) : (
          <div className="space-y-2">
            {codes.map((c) => (
              <Card key={c.id} className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-sm font-bold text-teal-950" dir="ltr">
                    {c.value}
                  </p>
                  <p className="text-xs text-black/40">{c.consultationId}</p>
                </div>
                <div className="text-left">
                  <Badge tone={c.redeemed ? 'green' : 'gold'}>{c.redeemed ? 'مصروف' : 'غير مصروف'}</Badge>
                  {c.redeemedAt && <p className="mt-1 text-[10px] text-black/30">{fmtDate(c.redeemedAt)}</p>}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
