import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutGrid, X, RotateCcw } from 'lucide-react'
import { useApp } from '../context/AppContext'

const PORTALS = [
  { to: '/', label: 'الموقع التسويقي', emoji: '🌐' },
  { to: '/p', label: 'تطبيق المريض', emoji: '🧑‍⚕️' },
  { to: '/d', label: 'بوابة الطبيب', emoji: '🩺' },
  { to: '/s', label: 'لوحة المشرف', emoji: '🛡️' },
  { to: '/a', label: 'لوحة الإدارة', emoji: '⚙️' },
]

export default function DemoSwitcher() {
  const [open, setOpen] = useState(false)
  const { hardReset } = useApp()
  const loc = useLocation()

  return (
    <div className="fixed bottom-4 start-4 z-50 print:hidden">
      {open && (
        <div className="mb-3 w-64 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl">
          <div className="border-b border-black/5 bg-teal-950 px-4 py-3 text-gold-200">
            <p className="text-xs font-bold">أداة معاينة — تنقّل بين الواجهات</p>
            <p className="mt-0.5 text-[11px] text-gold-200/70">
              كل البيانات محلية في متصفحك فقط، بلا سيرفر
            </p>
          </div>
          <div className="flex flex-col p-2">
            {PORTALS.map((p) => {
              const active = p.to === '/' ? loc.pathname === '/' : loc.pathname.startsWith(p.to)
              return (
                <Link
                  key={p.to}
                  to={p.to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold ${
                    active ? 'bg-gold-100 text-gold-800' : 'text-teal-950 hover:bg-black/5'
                  }`}
                >
                  <span>{p.emoji}</span>
                  {p.label}
                </Link>
              )
            })}
            <button
              onClick={() => {
                if (confirm('سيتم مسح كل البيانات التجريبية والبدء من جديد، متابعة؟')) {
                  hardReset()
                  setOpen(false)
                }
              }}
              className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              <RotateCcw size={16} />
              إعادة تهيئة البيانات التجريبية
            </button>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-500 text-teal-950 shadow-xl ring-4 ring-white transition-transform active:scale-95"
        aria-label="تبديل الواجهة"
      >
        {open ? <X size={22} /> : <LayoutGrid size={22} />}
      </button>
    </div>
  )
}
