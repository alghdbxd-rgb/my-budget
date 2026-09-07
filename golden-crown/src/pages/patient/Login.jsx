import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import Button from '../../components/ui/Button'
import { Field, Input } from '../../components/ui/Field'

const DEMO_OTP = '1234'

export default function Login() {
  const { loginPatient } = useApp()
  const nav = useNavigate()
  const [phone, setPhone] = useState('')
  const [stage, setStage] = useState('phone') // phone | otp
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')

  const sendOtp = (e) => {
    e.preventDefault()
    if (!/^0?7\d{9}$/.test(phone.replace(/\s/g, ''))) {
      setError('أدخل رقم موبايل عراقي صحيح (مثال: 07701234567)')
      return
    }
    setError('')
    setStage('otp')
  }

  const verify = (e) => {
    e.preventDefault()
    if (otp !== DEMO_OTP) {
      setError('الرمز غير صحيح، حاول مجدداً')
      return
    }
    loginPatient(phone)
    nav('/p')
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-teal-950 px-6 py-10">
      <div className="mx-auto w-full max-w-sm text-center text-white">
        <span className="text-5xl">👑</span>
        <h1 className="mt-3 text-xl font-extrabold">التاج الذهبي</h1>
        <p className="mt-1 text-sm text-gold-100/70">تسجيل الدخول برقم الموبايل — بدون كلمة مرور</p>
      </div>

      <div className="mx-auto mt-6 w-full max-w-sm rounded-2xl bg-white p-5">
        {stage === 'phone' ? (
          <form onSubmit={sendOtp} className="space-y-4">
            <Field label="رقم الموبايل" required error={error}>
              <Input
                inputMode="tel"
                dir="ltr"
                className="text-left"
                placeholder="07701234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </Field>
            <Button type="submit" variant="gold" className="w-full py-3.5">
              إرسال رمز التحقق (OTP)
            </Button>
            <p className="text-center text-[11px] text-black/40">
              رقم الموبايل هو الهوية الفريدة للمريض في النظام
            </p>
          </form>
        ) : (
          <form onSubmit={verify} className="space-y-4">
            <div className="flex items-center gap-2 rounded-xl bg-teal-900/5 p-3 text-sm text-teal-900">
              <ShieldCheck size={18} />
              <span>
                تم إرسال رمز تحقق تجريبي للرقم <b dir="ltr">{phone}</b> — استخدم{' '}
                <b>{DEMO_OTP}</b> (محاكاة، بدون SMS فعلي)
              </span>
            </div>
            <Field label="رمز التحقق" required error={error}>
              <Input
                inputMode="numeric"
                maxLength={4}
                dir="ltr"
                className="text-center text-lg tracking-[0.5em]"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              />
            </Field>
            <Button type="submit" variant="gold" className="w-full py-3.5">
              تأكيد الدخول
            </Button>
            <button
              type="button"
              onClick={() => setStage('phone')}
              className="block w-full text-center text-xs font-semibold text-teal-800"
            >
              تغيير رقم الموبايل
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
