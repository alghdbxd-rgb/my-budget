import { useApp } from '../../context/AppContext'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import { fmtDate } from '../../lib/status'

const ROLE_TONE = { doctor: 'teal', supervisor: 'gold', clinic: 'orange', system: 'red', admin: 'gray' }
const ROLE_LABEL = { doctor: 'طبيب', supervisor: 'مشرف', clinic: 'عيادة', system: 'نظام', admin: 'إدارة' }

export default function Audit() {
  const { db } = useApp()
  const log = db.auditLog

  return (
    <div>
      <p className="mb-4 text-sm text-black/50">
        كل اطّلاع على بيانات مريض أو صوره — بهوية المطّلِع والوقت (F-B-06).
      </p>
      {log.length === 0 ? (
        <EmptyState icon="🧾" title="لا توجد أحداث بعد" />
      ) : (
        <div className="space-y-2">
          {log.map((e) => {
            const patient = db.patients.find((p) => p.id === e.targetPatientId)
            return (
              <Card key={e.id} className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm text-teal-950">{e.what}</p>
                  <p className="mt-1 text-xs text-black/40">
                    بواسطة <b>{e.who}</b> {patient ? `— المريض: ${patient.phone}` : ''}
                  </p>
                </div>
                <div className="text-left">
                  <Badge tone={ROLE_TONE[e.role] || 'gray'}>{ROLE_LABEL[e.role] || e.role}</Badge>
                  <p className="mt-1 text-[10px] text-black/30">{fmtDate(e.when)}</p>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
