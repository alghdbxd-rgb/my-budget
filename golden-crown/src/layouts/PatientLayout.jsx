import { Outlet, Navigate, Link } from 'react-router-dom'
import { Home, ClipboardList, User2, LogOut } from 'lucide-react'
import { useApp } from '../context/AppContext'
import BottomNav from './BottomNav'

const NAV = [
  { to: '/p', label: 'الرئيسية', icon: Home, end: true },
  { to: '/p/orders', label: 'طلباتي', icon: ClipboardList },
  { to: '/p/profile', label: 'ملفي', icon: User2 },
]

export default function PatientLayout() {
  const { db, logout } = useApp()
  const patient = db.patients.find((p) => p.id === db.session.patientId)

  if (!db.session.patientId) return <Navigate to="/p/login" replace />

  return (
    <div className="mx-auto min-h-full max-w-md pb-24">
      <header className="flex items-center justify-between border-b border-black/5 bg-white px-4 py-3 print:hidden">
        <Link to="/p" className="flex items-center gap-2">
          <span className="text-xl">👑</span>
          <span className="text-sm font-extrabold text-teal-950">التاج الذهبي</span>
        </Link>
        <div className="flex items-center gap-2 text-xs text-black/50">
          <span>{patient?.name || patient?.phone}</span>
          <button onClick={logout} className="rounded-full p-1.5 hover:bg-black/5" aria-label="خروج">
            <LogOut size={16} />
          </button>
        </div>
      </header>
      <main className="px-4 py-4">
        <Outlet />
      </main>
      <div className="print:hidden">
        <BottomNav items={NAV} />
      </div>
    </div>
  )
}
