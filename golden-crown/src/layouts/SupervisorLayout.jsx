import { Outlet, Link } from 'react-router-dom'
import { ListOrdered, ShieldAlert } from 'lucide-react'
import TopTabs from './TopTabs'

const TABS = [
  { to: '/s', label: 'طابور الاستشارات', icon: ListOrdered, end: true },
  { to: '/s/quality', label: 'الجودة والشكاوى', icon: ShieldAlert },
]

export default function SupervisorLayout() {
  return (
    <div className="mx-auto min-h-full max-w-2xl px-4 pb-10">
      <header className="flex items-center justify-between py-3">
        <Link to="/s" className="flex items-center gap-2">
          <span className="text-xl">👑</span>
          <span className="text-sm font-extrabold text-teal-950">لوحة المشرف</span>
        </Link>
        <span className="text-xs text-black/40">المشرف • نور عبد الله</span>
      </header>
      <TopTabs items={TABS} />
      <Outlet />
    </div>
  )
}
