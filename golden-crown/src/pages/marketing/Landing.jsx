import { Link } from 'react-router-dom'
import { Stethoscope, ShieldCheck, MapPin, FileCheck2, Sparkles } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'

const FEATURES = [
  { icon: Stethoscope, title: 'رأي طبيب مختص', text: 'استشارة أسنان حقيقية من طبيب معتمد خلال ساعات.' },
  { icon: ShieldCheck, title: 'بياناتك محمية', text: 'صورك وبياناتك الطبية مشفّرة وبصلاحيات وصول صارمة.' },
  { icon: MapPin, title: 'توجيه لأقرب عيادة', text: 'بعد التقرير، نقترح عليك أقرب الأطباء المناسبين لحالتك.' },
  { icon: FileCheck2, title: 'تقرير PDF واضح', text: 'ملخص حالتك والرأي الاستشاري بصيغة يمكن حفظها ومشاركتها.' },
]

const SOON = [
  { title: 'الدورات العلمية', text: 'دورات تدريبية لأطباء الأسنان — قريباً' },
  { title: 'فرص العمل', text: 'إعلانات توظيف للعيادات والكوادر الطبية — قريباً' },
]

export default function Landing() {
  const { registerInterest } = useApp()

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-b from-teal-950 to-teal-900 px-4 pb-16 pt-10 text-white">
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <span className="text-5xl">👑</span>
          <h1 className="mt-3 text-2xl font-extrabold">التاج الذهبي</h1>
          <p className="mt-3 text-base leading-relaxed text-gold-100/90">
            استشارة أسنان موثوقة، من مكانك. أجب عن استبيان قصير، ارفع صورك، واحصل على رأي طبيب
            مختص خلال ساعات.
          </p>
          <Link to="/p" className="mt-6 w-full">
            <Button variant="gold" className="w-full py-4 text-base">
              احصل على استشارتك الآن
            </Button>
          </Link>
          <p className="mt-3 text-xs text-gold-100/60">
            أول 2000 استشارة مجانية بالكامل — لفترة محدودة
          </p>
        </div>
      </section>

      <section className="mx-auto -mt-8 max-w-md px-4">
        <div className="grid grid-cols-2 gap-3">
          {FEATURES.map((f) => (
            <Card key={f.title} className="text-center">
              <f.icon className="mx-auto mb-2 text-teal-800" size={22} />
              <p className="text-sm font-bold text-teal-950">{f.title}</p>
              <p className="mt-1 text-xs text-black/50">{f.text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-md px-4">
        <Card className="border-gold-300 bg-gold-50">
          <p className="flex items-center gap-2 font-bold text-teal-950">
            <Stethoscope size={18} /> هل أنت طبيب أسنان؟
          </p>
          <p className="mt-1 text-sm text-black/60">
            انضم كطبيب شريك واستقبل حالات من منطقتك مباشرة على جدولك.
          </p>
          <Link to="/join-doctor" className="mt-3 inline-block">
            <Button variant="outline">سجّل كطبيب شريك</Button>
          </Link>
        </Card>
      </section>

      <section className="mx-auto mt-6 max-w-md px-4">
        <h2 className="mb-2 text-sm font-bold text-teal-950">قريباً على المنصة</h2>
        <div className="grid grid-cols-2 gap-3">
          {SOON.map((s) => (
            <div key={s.title} className="rounded-2xl border border-dashed border-black/15 p-4 text-center opacity-70">
              <Sparkles className="mx-auto mb-1 text-gold-500" size={18} />
              <p className="text-xs font-bold text-teal-950">{s.title}</p>
              <p className="mt-1 text-[11px] text-black/40">{s.text}</p>
            </div>
          ))}
        </div>
        <button
          onClick={() => {
            const email = prompt('راسلنا لمعرفة فرص التعاون كمختبر أو معلن — أدخل بريدك أو رقمك:')
            if (email) {
              registerInterest('lab_or_advertiser', { contact: email })
              alert('تم تسجيل اهتمامك، سنتواصل معك قريباً.')
            }
          }}
          className="mt-3 block w-full text-center text-xs font-semibold text-teal-800 underline"
        >
          مختبر أو معلن؟ سجّل اهتمامك للتعاون معنا
        </button>
      </section>

      <section className="mx-auto mt-10 max-w-md px-4 pb-14">
        <div className="rounded-2xl border border-black/10 bg-white p-4">
          <p className="mb-3 text-center text-xs font-bold text-black/40">
            دخول النظام — نسخة معاينة تجريبية (بدون سيرفر)
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Link to="/p">
              <Button variant="subtle" className="w-full">
                تطبيق المريض
              </Button>
            </Link>
            <Link to="/d">
              <Button variant="subtle" className="w-full">
                بوابة الطبيب
              </Button>
            </Link>
            <Link to="/s">
              <Button variant="subtle" className="w-full">
                لوحة المشرف
              </Button>
            </Link>
            <Link to="/a">
              <Button variant="subtle" className="w-full">
                لوحة الإدارة
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
