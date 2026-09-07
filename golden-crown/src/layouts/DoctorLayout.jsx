import { Outlet, Navigate, Link } from 'react-router-dom'
import { Inbox, CalendarClock, Wallet, UserCog, LogOut } from 'lucide-react'
import { useApp } from '../context/AppContext'
import BottomNav from './BottomNav'

const NAV = [
  { to: '/d', label: 'الحالات', icon: Inbox, end: true },
  { to: '/d/schedule', label: 'الجدول', icon: CalendarClock },
  { to: '/d/finance', label: 'الحسابات', icon: Wallet },
  { to: '/d/profile', label: 'البروفايل', icon: UserCog },
]

export default function DoctorLayout() {
  const { db, setRole } = useApp()
  const doctorId = db.session.doctorId
  const doctor = db.doctors.find((x) => x.id === doctorId)

  if (!doctorId) return <Navigate to="/d/login" replace />
  if (doctor?.status !== 'active')
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center">
        <div>
          <p className="mb-2 text-3xl">⛔</p>
          <p className="font-bold text-teal-950">
            حساب هذا الطبيب {doctor?.status === 'pending' ? 'بانتظار اعتماد الإدارة' : 'معطّل حالياً'}
          </p>
          <button
            onClick={() => setRole('guest', { doctorId: null })}
            className="mt-4 text-sm font-semibold text-teal-800 underline"
          >
            اختيار حساب آخر
          </button>
        </div>
      </div>
    )

  return (
    <div className="mx-auto min-h-full max-w-lg pb-24">
      <header className="flex items-center justify-between border-b border-black/5 bg-white px-4 py-3">
        <Link to="/d" className="flex items-center gap-2">
          <span className="text-xl">👑</span>
          <span className="text-sm font-extrabold text-teal-950">بوابة الطبيب</span>
        </Link>
        <div className="flex items-center gap-2 text-xs text-black/50">
          <span>{doctor?.name}</span>
          <button
            onClick={() => setRole('guest', { doctorId: null })}
            className="rounded-full p-1.5 hover:bg-black/5"
            aria-label="تبديل الحساب"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>
      <main className="px-4 py-4">
        <Outlet />
      </main>
      <BottomNav items={NAV} />
    </div>
  )
}
