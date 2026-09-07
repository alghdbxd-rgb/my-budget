import ToothChart from '../../../components/ToothChart'
import { Field, Select } from '../../../components/ui/Field'

const DURATIONS = ['أقل من يوم', 'يوم واحد', '2-3 أيام', 'أسبوع', 'أكثر من أسبوع']
const WORSE_WHEN = ['عند المضغ', 'مع الحرارة/البرودة', 'ليلاً', 'باستمرار', 'غير محدد']

function YesNo({ label, value, onChange, error }) {
  return (
    <Field label={label} required error={error}>
      <div className="grid grid-cols-2 gap-2">
        {[
          { v: true, label: 'نعم' },
          { v: false, label: 'لا' },
        ].map((o) => (
          <button
            key={String(o.v)}
            type="button"
            onClick={() => onChange(o.v)}
            className={`rounded-xl border-2 py-3 text-sm font-semibold ${
              value === o.v ? 'border-teal-900 bg-teal-900 text-white' : 'border-black/10 text-black/60'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </Field>
  )
}

export default function Step3({ value, onChange, errors }) {
  const set = (k) => (v) => onChange({ ...value, [k]: v })
  const painLevel = value.painLevel ?? 0

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-extrabold text-teal-950">تفاصيل الأعراض</h2>

      <Field label="شدة الألم" required error={errors.painLevel}>
        <div className="rounded-xl border border-black/10 bg-white p-4">
          <div className="mb-1 flex items-center justify-between text-xs font-semibold text-black/40">
            <span>لا يوجد ألم</span>
            <span className="text-lg font-extrabold text-gold-600">{painLevel}</span>
            <span>أقصى ألم</span>
          </div>
          <input
            type="range"
            min={0}
            max={10}
            value={painLevel}
            onChange={(e) => set('painLevel')(Number(e.target.value))}
            className="w-full accent-gold-500"
          />
        </div>
      </Field>

      <Field label="منذ متى تعاني من الأعراض؟" required error={errors.duration}>
        <Select value={value.duration || ''} onChange={(e) => set('duration')(e.target.value)}>
          <option value="">اختر المدة</option>
          {DURATIONS.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </Select>
      </Field>

      <Field label="متى يزداد الألم؟">
        <Select value={value.worseWhen || ''} onChange={(e) => set('worseWhen')(e.target.value)}>
          <option value="">اختر (اختياري)</option>
          {WORSE_WHEN.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </Select>
      </Field>

      <YesNo label="هل يوجد تورّم؟" value={value.swelling} onChange={set('swelling')} error={errors.swelling} />
      <YesNo label="هل يوجد ارتفاع حرارة؟" value={value.fever} onChange={set('fever')} error={errors.fever} />

      <Field label="حدد السن المصاب على المخطط">
        <ToothChart value={value.tooth} onChange={set('tooth')} />
      </Field>
    </div>
  )
}
