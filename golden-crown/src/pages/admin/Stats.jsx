import { useApp } from '../../context/AppContext'
import { GOVERNORATES } from '../../lib/db'
import Card from '../../components/ui/Card'

function StatCard({ label, value, sub }) {
  return (
    <Card>
      <p className="text-2xl font-extrabold text-teal-950">{value}</p>
      <p className="mt-1 text-xs text-black/50">{label}</p>
      {sub && <p className="mt-0.5 text-[10px] text-black/30">{sub}</p>}
    </Card>
  )
}

export default function Stats() {
  const { db } = useApp()
  const consultations = db.consultations.filter((c) => c.status !== 'draft')
  const paid = consultations.filter((c) => c.paymentStatus === 'paid')
  const conversion = consultations.length ? Math.round((paid.length / consultations.length) * 100) : 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayCount = consultations.filter((c) => c.createdAt >= today.getTime()).length

  const byRegion = GOVERNORATES.map((g) => ({
    ...g,
    count: db.patients.filter((p) => p.region === g.id).length,
  })).sort((a, b) => b.count - a.count)
  const maxRegion = Math.max(1, ...byRegion.map((r) => r.count))

  const doctorPerf = db.doctors
    .filter((d) => d.status === 'active')
    .map((d) => ({
      ...d,
      done: db.consultations.filter((c) => c.doctorId === d.id && c.status === 'ready').length,
    }))
    .sort((a, b) => b.done - a.done)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="إجمالي المستخدمين" value={db.patients.length.toLocaleString('ar')} />
        <StatCard label="استشارات اليوم" value={todayCount.toLocaleString('ar')} />
        <StatCard label="معدل التحويل" value={`${conversion}%`} sub="من استبيان إلى دفع" />
        <StatCard label="الشكاوى المفتوحة" value={db.complaints.filter((c) => c.status === 'open').length} />
      </div>

      <div>
        <h2 className="mb-2 text-sm font-bold text-teal-950">توزيع المناطق (عدد المرضى)</h2>
        <Card className="space-y-2">
          {byRegion.map((r) => (
            <div key={r.id} className="flex items-center gap-3">
              <span className="w-16 shrink-0 text-xs text-black/50">{r.name}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/5">
                <div
                  className="h-full rounded-full bg-gold-500"
                  style={{ width: `${(r.count / maxRegion) * 100}%` }}
                />
              </div>
              <span className="w-6 text-left text-xs font-bold text-teal-950">{r.count}</span>
            </div>
          ))}
        </Card>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-bold text-teal-950">أداء الأطباء (حالات مكتملة)</h2>
        <Card className="space-y-2">
          {doctorPerf.map((d) => (
            <div key={d.id} className="flex items-center justify-between text-sm">
              <span className="text-teal-950">{d.name}</span>
              <span className="font-bold text-gold-700">{d.done}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}
