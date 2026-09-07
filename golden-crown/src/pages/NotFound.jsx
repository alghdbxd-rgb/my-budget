import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-4xl">🦷</p>
      <p className="font-bold text-teal-950">الصفحة غير موجودة</p>
      <Link to="/" className="text-sm font-semibold text-teal-800 underline">
        العودة للرئيسية
      </Link>
    </div>
  )
}
