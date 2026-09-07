import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, CheckCircle2 } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { GOVERNORATES } from '../../lib/db'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { Field, Input, Select, Textarea } from '../../components/ui/Field'

const SPECIALTIES = [
  'طب أسنان عام',
  'علاج تسوّس',
  'علاج لثة',
  'تقويم أسنان',
  'تجميل أسنان',
  'جراحة فم وأسنان',
]

export default function JoinDoctor() {
  const { applyAsDoctor } = useApp()
  const [form, setForm] = useState({ name: '', phone: '', specialty: SPECIALTIES[0], region: 'baghdad', bio: '', fileName: '' })
  const [done, setDone] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  if (done) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 text-center">
        <CheckCircle2 className="mb-3 text-emerald-600" size={48} />
        <h1 className="text-lg font-extrabold text-teal-950">تم استلام طلبك</h1>
        <p className="mt-2 text-sm text-black/60">
          سيراجع فريقنا شهاداتك ويتواصل معك لتفعيل حسابك على المنصة. يمكنك متابعة حالة الطلب من
          خلالنا.
        </p>
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
      <h1 className="text-xl font-extrabold text-teal-950">انضم كطبيب شريك</h1>
      <p className="mt-1 text-sm text-black/50">
        عبّئ بياناتك وسيراجع فريقنا شهاداتك قبل تفعيل حسابك (F-A-02).
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          applyAsDoctor(form)
          setDone(true)
        }}
        className="mt-5 space-y-4"
      >
        <Card className="space-y-4">
          <Field label="الاسم الكامل" required>
            <Input required value={form.name} onChange={set('name')} placeholder="د. فلان الفلاني" />
          </Field>
          <Field label="رقم الموبايل" required>
            <Input required value={form.phone} onChange={set('phone')} placeholder="07xxxxxxxxx" inputMode="tel" />
          </Field>
          <Field label="التخصص" required>
            <Select value={form.specialty} onChange={set('specialty')}>
              {SPECIALTIES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          </Field>
          <Field label="المحافظة" required>
            <Select value={form.region} onChange={set('region')}>
              {GOVERNORATES.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="نبذة مختصرة" hint="الخبرة، الشهادات، مجالات الاهتمام">
            <Textarea value={form.bio} onChange={set('bio')} placeholder="9 سنوات خبرة في..." />
          </Field>
          <Field label="رفع الشهادة / إجازة مزاولة المهنة" hint="محاكاة رفع ملف — لا يتم رفع أي ملف فعلياً">
            <input
              type="file"
              onChange={(e) => setForm((f) => ({ ...f, fileName: e.target.files?.[0]?.name || '' }))}
              className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm"
            />
          </Field>
        </Card>
        <Button type="submit" variant="gold" className="w-full py-3.5">
          إرسال طلب الانضمام
        </Button>
      </form>
    </div>
  )
}
