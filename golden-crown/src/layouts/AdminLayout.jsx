import { Outlet, Link } from 'react-router-dom'
import { BarChart3, Stethoscope, Landmark, FileEdit, SlidersHorizontal, History } from 'lucide-react'
import TopTabs from './TopTabs'

const TABS = [
  { to: '/a', label: 'الإحصائيات', icon: BarChart3, end: true },
  { to: '/a/doctors', label: 'الأطباء', icon: Stethoscope },
  { to: '/a/finance', label: 'الحركات المالية', icon: Landmark },
  { to: '/a/content', label: 'المحتوى', icon: FileEdit },
  { to: '/a/settings', label: 'الإعدادات', icon: SlidersHorizontal },
  { to: '/a/audit', label: 'سجل التدقيق', icon: History },
]

export default function AdminLayout() {
  return (
    <div className="mx-auto min-h-full max-w-3xl px-4 pb-10">
      <header className="flex items-center justify-between py-3">
        <Link to="/a" className="flex items-center gap-2">
          <span className="text-xl">👑</span>
          <span className="text-sm font-extrabold text-teal-950">لوحة الإدارة</span>
        </Link>
        <span className="text-xs text-black/40">Admin</span>
      </header>
      <TopTabs items={TABS} />
      <Outlet />
    </div>
  )
}
