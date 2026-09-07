import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

const DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

export default function Schedule() {
  const { db, updateDoctorProfile } = useApp()
  const doctor = db.doctors.find((d) => d.id === db.session.doctorId)
  const [hours, setHours] = useState(() => {
    const map = {}
    doctor?.hours?.forEach((h) => (map[h.day] = { from: h.from, to: h.to }))
    return map
  })
  const [saved, setSaved] = useState(false)

  const toggle = (day) => {
    setHours((h) => {
      const next = { ...h }
      if (next[day]) delete next[day]
      else next[day] = { from: '09:00', to: '17:00' }
      return next
    })
  }

  const setTime = (day, key, val) => {
    setHours((h) => ({ ...h, [day]: { ...h[day], [key]: val } }))
  }

  const save = () => {
    const arr = Object.entries(hours).map(([day, t]) => ({ day: Number(day), ...t }))
    updateDoctorProfile(doctor.id, { hours: arr })
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  return (
    <div>
      <PageHeader title="جدول الأوقات" subtitle="أيام وساعات الاستشارة — تُستخدم كفلتر في محرك التوجيه" />
      <div className="space-y-2">
        {DAYS.map((label, day) => {
          const active = !!hours[day]
          return (
            <Card key={day} className={`flex items-center gap-3 ${active ? '' : 'opacity-60'}`}>
              <button
                onClick={() => toggle(day)}
                className={`h-6 w-11 shrink-0 rounded-full transition-colors ${active ? 'bg-teal-800' : 'bg-black/10'}`}
              >
                <span
                  className={`block h-5 w-5 translate-y-0.5 rounded-full bg-white transition-transform ${
                    active ? '-translate-x-0.5' : '-translate-x-5'
                  }`}
                />
              </button>
              <span className="w-16 text-sm font-bold text-teal-950">{label}</span>
              {active && (
                <div className="flex flex-1 items-center justify-end gap-2 text-sm">
                  <input
                    type="time"
                    value={hours[day].from}
                    onChange={(e) => setTime(day, 'from', e.target.value)}
                    className="rounded-lg border border-black/10 px-2 py-1.5"
                  />
                  <span className="text-black/30">—</span>
                  <input
                    type="time"
                    value={hours[day].to}
                    onChange={(e) => setTime(day, 'to', e.target.value)}
                    className="rounded-lg border border-black/10 px-2 py-1.5"
                  />
                </div>
              )}
            </Card>
          )
        })}
      </div>
      <Button onClick={save} variant="gold" className="mt-4 w-full py-3">
        {saved ? 'تم الحفظ ✓' : 'حفظ الجدول'}
      </Button>
    </div>
  )
}
