import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import Badge from '../../components/ui/Badge'

const STATUS_TONE = { active: 'green', pending: 'gold', disabled: 'red' }
const STATUS_LABEL = { active: 'معتمد', pending: 'بانتظار الاعتماد', disabled: 'معطّل' }

export default function DoctorLogin() {
  const { db, setRole } = useApp()
  const nav = useNavigate()

  return (
    <div className="mx-auto min-h-screen max-w-md px-4 py-8">
      <div className="mb-6 text-center">
        <span className="text-4xl">🩺</span>
        <h1 className="mt-2 text-lg font-extrabold text-teal-950">بوابة الطبيب</h1>
        <p className="mt-1 text-sm text-black/50">
          نسخة معاينة — اختر حساب طبيب لعرض تجربته (بدل تسجيل دخول حقيقي)
        </p>
      </div>

      <div className="space-y-2">
        {db.doctors.map((d) => (
          <button
            key={d.id}
            onClick={() => {
              setRole('doctor', { doctorId: d.id })
              nav('/d')
            }}
            className="flex w-full items-center justify-between rounded-2xl border border-black/10 bg-white p-4 text-start hover:border-teal-700/40"
          >
            <div>
              <p className="font-bold text-teal-950">{d.name}</p>
              <p className="text-xs text-black/40">{d.specialty}</p>
            </div>
            <Badge tone={STATUS_TONE[d.status]}>{STATUS_LABEL[d.status]}</Badge>
          </button>
        ))}
      </div>
    </div>
  )
}
