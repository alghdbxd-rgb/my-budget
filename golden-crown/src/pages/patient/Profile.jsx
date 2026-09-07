import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { GOVERNORATES } from '../../lib/db'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { Field, Input, Select } from '../../components/ui/Field'

export default function Profile() {
  const { db, updatePatientProfile } = useApp()
  const patient = db.patients.find((p) => p.id === db.session.patientId)
  const [form, setForm] = useState({
    name: patient?.name || '',
    age: patient?.age || '',
    gender: patient?.gender || '',
    region: patient?.region || '',
    chronic: patient?.chronic || '',
    allergies: patient?.allergies || '',
  })
  const [saved, setSaved] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <div>
      <PageHeader title="ملفي الشخصي" subtitle={patient?.phone} />
      <form
        onSubmit={(e) => {
          e.preventDefault()
          updatePatientProfile(patient.id, form)
          setSaved(true)
          setTimeout(() => setSaved(false), 2000)
        }}
        className="space-y-4"
      >
        <Card className="space-y-4">
          <Field label="الاسم">
            <Input value={form.name} onChange={set('name')} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="العمر">
              <Input type="number" value={form.age} onChange={set('age')} />
            </Field>
            <Field label="الجنس">
              <Select value={form.gender} onChange={set('gender')}>
                <option value="">—</option>
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
              </Select>
            </Field>
          </div>
          <Field label="المحافظة">
            <Select value={form.region} onChange={set('region')}>
              <option value="">—</option>
              {GOVERNORATES.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="أمراض مزمنة">
            <Input value={form.chronic} onChange={set('chronic')} />
          </Field>
          <Field label="حساسية دوائية">
            <Input value={form.allergies} onChange={set('allergies')} />
          </Field>
        </Card>
        <Button type="submit" variant="primary" className="w-full py-3">
          {saved ? 'تم الحفظ ✓' : 'حفظ التعديلات'}
        </Button>
      </form>
    </div>
  )
}
