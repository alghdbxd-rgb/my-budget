import { GOVERNORATES } from '../../../lib/db'
import { Field, Input, Select } from '../../../components/ui/Field'

export default function Step1({ value, onChange, errors }) {
  const set = (k) => (e) => onChange({ ...value, [k]: e.target.value })
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-extrabold text-teal-950">بيانات أساسية</h2>
      <p className="text-sm text-black/50">تساعدنا هذه المعلومات على تقييم حالتك بدقة.</p>

      <Field label="العمر" required error={errors.age}>
        <Input
          type="number"
          min={0}
          max={120}
          value={value.age || ''}
          onChange={set('age')}
          placeholder="مثال: 29"
        />
      </Field>

      <Field label="الجنس" required error={errors.gender}>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'male', label: 'ذكر' },
            { id: 'female', label: 'أنثى' },
          ].map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => onChange({ ...value, gender: g.id })}
              className={`rounded-xl border-2 py-3 text-sm font-semibold ${
                value.gender === g.id
                  ? 'border-teal-900 bg-teal-900 text-white'
                  : 'border-black/10 text-black/60'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </Field>

      <Field label="المحافظة / المنطقة" required error={errors.region}>
        <Select value={value.region || ''} onChange={set('region')}>
          <option value="">اختر المحافظة</option>
          {GOVERNORATES.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="أمراض مزمنة" hint="اتركها فارغة أو اكتب «لا يوجد» إن لم تكن موجودة">
        <Input value={value.chronic || ''} onChange={set('chronic')} placeholder="مثال: سكري، ضغط..." />
      </Field>

      <Field label="حساسية دوائية" hint="اتركها فارغة أو اكتب «لا يوجد» إن لم تكن موجودة">
        <Input value={value.allergies || ''} onChange={set('allergies')} placeholder="مثال: بنسلين" />
      </Field>
    </div>
  )
}
