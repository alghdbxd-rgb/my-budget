import { useState } from 'react'
import { FileCheck } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'

const TABS = [
  { id: 'pending', label: 'طلبات جديدة' },
  { id: 'active', label: 'معتمدون' },
  { id: 'disabled', label: 'معطّلون' },
]

export default function Doctors() {
  const { db, setDoctorStatus } = useApp()
  const [tab, setTab] = useState('pending')
  const list = db.doctors.filter((d) => d.status === tab)

  return (
    <div>
      <div className="mb-4 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold ${
              tab === t.id ? 'bg-teal-900 text-white' : 'bg-white text-black/50'
            }`}
          >
            {t.label} ({db.doctors.filter((d) => d.status === t.id).length})
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="py-10 text-center text-sm text-black/40">لا يوجد أطباء في هذه القائمة</p>
      ) : (
        <div className="space-y-3">
          {list.map((d) => (
            <Card key={d.id}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-teal-950">{d.name}</p>
                  <p className="text-xs text-black/40">
                    {d.specialty} {d.phone ? `· ${d.phone}` : ''}
                  </p>
                </div>
                <Badge tone={d.status === 'active' ? 'green' : d.status === 'pending' ? 'gold' : 'red'}>
                  {d.status === 'active' ? 'معتمد' : d.status === 'pending' ? 'قيد المراجعة' : 'معطّل'}
                </Badge>
              </div>
              {d.bio && <p className="mt-2 text-xs text-black/50">{d.bio}</p>}
              {d.credentials?.length > 0 && (
                <div className="mt-2 space-y-1">
                  {d.credentials.map((c) => (
                    <div key={c.fileName} className="flex items-center gap-1.5 text-xs text-black/50">
                      <FileCheck size={13} className="text-emerald-600" /> {c.name}
                      {c.fileName && <span className="text-black/30">({c.fileName})</span>}
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-3 flex gap-2">
                {d.status !== 'active' && (
                  <Button variant="gold" className="flex-1 py-2 text-xs" onClick={() => setDoctorStatus(d.id, 'active')}>
                    تفعيل / اعتماد
                  </Button>
                )}
                {d.status !== 'disabled' && (
                  <Button variant="danger" className="flex-1 py-2 text-xs" onClick={() => setDoctorStatus(d.id, 'disabled')}>
                    {d.status === 'pending' ? 'رفض' : 'تعطيل'}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
