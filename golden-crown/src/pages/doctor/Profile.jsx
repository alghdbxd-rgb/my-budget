import { useState } from 'react'
import { Star, FileCheck } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { Field, Input, Textarea } from '../../components/ui/Field'

export default function Profile() {
  const { db, updateDoctorProfile } = useApp()
  const doctor = db.doctors.find((d) => d.id === db.session.doctorId)
  const clinic = db.clinics.find((c) => c.id === doctor?.clinicId)
  const [form, setForm] = useState({ name: doctor.name, bio: doctor.bio || '' })
  const [saved, setSaved] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <div>
      <PageHeader title="بروفايلي" subtitle={doctor.specialty} />

      <Card className="mb-3 flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-900/10 text-2xl">🩺</div>
        <div>
          <p className="font-bold text-teal-950">{doctor.name}</p>
          <div className="mt-1 flex items-center gap-1 text-xs text-gold-700">
            <Star size={13} fill="currentColor" /> {doctor.rating || '—'} ({doctor.reviewsCount} تقييم)
          </div>
        </div>
      </Card>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          updateDoctorProfile(doctor.id, form)
          setSaved(true)
          setTimeout(() => setSaved(false), 1800)
        }}
        className="space-y-4"
      >
        <Card className="space-y-4">
          <Field label="الاسم">
            <Input value={form.name} onChange={set('name')} />
          </Field>
          <Field label="نبذة">
            <Textarea value={form.bio} onChange={set('bio')} />
          </Field>
        </Card>
        <Button type="submit" variant="primary" className="w-full py-3">
          {saved ? 'تم الحفظ ✓' : 'حفظ التعديلات'}
        </Button>
      </form>

      <Card className="mt-3">
        <h3 className="mb-2 text-sm font-bold text-teal-950">موقع العيادة</h3>
        <p className="text-sm text-black/60">{clinic?.name || 'غير مرتبط بعيادة'}</p>
        <p className="text-xs text-black/40">{clinic?.address}</p>
      </Card>

      <Card className="mt-3">
        <h3 className="mb-2 text-sm font-bold text-teal-950">الشهادات المعتمدة</h3>
        {doctor.credentials?.length ? (
          <div className="space-y-2">
            {doctor.credentials.map((c) => (
              <div key={c.fileName} className="flex items-center gap-2 text-sm text-black/60">
                <FileCheck size={16} className="text-emerald-600" /> {c.name}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-black/40">لا توجد شهادات مرفوعة</p>
        )}
        <Badge tone={doctor.status === 'active' ? 'green' : doctor.status === 'pending' ? 'gold' : 'red'} className="mt-3">
          {doctor.status === 'active' ? 'حساب معتمد' : doctor.status === 'pending' ? 'بانتظار الاعتماد' : 'معطّل'}
        </Badge>
      </Card>
    </div>
  )
}
