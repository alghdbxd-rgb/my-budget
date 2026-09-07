import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, CheckCircle2 } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { Field, Input, Select } from '../../components/ui/Field'

export default function LabsInterest() {
  const { registerInterest } = useApp()
  const [form, setForm] = useState({ name: '', contact: '', kind: 'lab' })
  const [done, setDone] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  if (done) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 text-center">
        <CheckCircle2 className="mb-3 text-emerald-600" size={48} />
        <h1 className="text-lg font-extrabold text-teal-950">شكراً لاهتمامك</h1>
        <p className="mt-2 text-sm text-black/60">سجّلنا بياناتك وسنتواصل معك عند إطلاق باقات الشراكة.</p>
        <Link to="/" className="mt-6">
          <Button variant="outline">العودة للرئيسية</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <Link to="/" className="mb-4 flex items-center gap-1 text-sm font-semibold text-teal-800">
        <ChevronRight size={16} /> الرئيسية
      </Link>
      <h1 className="text-xl font-extrabold text-teal-950">مختبرات ومعلنون</h1>
      <p className="mt-1 text-sm text-black/50">
        هذا القسم لتجميع بيانات الاهتمام فقط حالياً — بوابة الاشتراكات الكاملة مؤجَّلة للمرحلة الثانية.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          registerInterest(form.kind, { name: form.name, contact: form.contact })
          setDone(true)
        }}
        className="mt-5 space-y-4"
      >
        <Card className="space-y-4">
          <Field label="نوع الجهة" required>
            <Select value={form.kind} onChange={set('kind')}>
              <option value="lab">مختبر أسنان</option>
              <option value="advertiser">معلن</option>
            </Select>
          </Field>
          <Field label="اسم الجهة" required>
            <Input required value={form.name} onChange={set('name')} />
          </Field>
          <Field label="رقم موبايل أو بريد للتواصل" required>
            <Input required value={form.contact} onChange={set('contact')} />
          </Field>
        </Card>
        <Button type="submit" variant="gold" className="w-full py-3.5">
          إرسال
        </Button>
      </form>
    </div>
  )
}
