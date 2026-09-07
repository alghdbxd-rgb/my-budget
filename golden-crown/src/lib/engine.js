import { distanceKm } from './geo'

// أيام الدوام: 0=الأحد … 6=السبت (أسبوع عمل عراقي أحد-خميس بشكل افتراضي)
function isWithinHours(doctor, date = new Date()) {
  const day = date.getDay()
  const slot = doctor.hours?.find((h) => h.day === day)
  if (!slot) return false
  const cur = date.getHours() * 60 + date.getMinutes()
  const [fh, fm] = slot.from.split(':').map(Number)
  const [th, tm] = slot.to.split(':').map(Number)
  return cur >= fh * 60 + fm && cur <= th * 60 + tm
}

/**
 * محرك التوجيه — F-B-01
 * مطابقة: التخصص + الموقع الجغرافي. استبعاد: معطّل / خارج الدوام / غير معتمد.
 */
export function matchDoctors(db, { specialty, regionId }, { requireHours = true } = {}) {
  const region = db.governorates[regionId]
  const list = db.doctors
    .filter((d) => d.specialty === specialty)
    .filter((d) => d.status === 'active')
    .filter((d) => !requireHours || isWithinHours(d))
    .map((d) => {
      const clinic = db.clinics.find((c) => c.id === d.clinicId)
      const dist = region && clinic ? distanceKm(region, clinic) : Infinity
      const load = db.consultations.filter(
        (c) => c.doctorId === d.id && ['new', 'in_review'].includes(c.status),
      ).length
      return { doctor: d, clinic, distanceKm: dist, load }
    })
    .sort((a, b) => a.distanceKm - b.distanceKm)
  return list
}

/** يرجع نتيجة مطابقة صارمة، وإن فشلت يرجع بديلاً واضحاً (تجاهل شرط أوقات الدوام) */
export function routeConsultation(db, { specialty, regionId }) {
  let matches = matchDoctors(db, { specialty, regionId }, { requireHours: true })
  let fallback = false
  if (matches.length === 0) {
    matches = matchDoctors(db, { specialty, regionId }, { requireHours: false })
    fallback = true
  }
  if (matches.length === 0) return { doctor: null, fallback: true, matches: [] }
  // توزيع حمل عادل: اختيار الأقل حِملاً من أقرب 3 مطابقين
  const pool = matches.slice(0, 3)
  const chosen = [...pool].sort((a, b) => a.load - b.load)[0]
  return { doctor: chosen.doctor, fallback, matches }
}

/** التصعيد الطارئ — F-S-02: اجتماع (تورم + حرارة + ألم فوق الحد) */
export function computeUrgency(step3, settings) {
  if (!step3) return false
  const esc = settings.escalation
  const painOk = (step3.painLevel ?? 0) >= esc.painThreshold
  const swellingOk = esc.requireSwelling ? !!step3.swelling : true
  const feverOk = esc.requireFever ? !!step3.fever : true
  return painOk && swellingOk && feverOk
}

export { isWithinHours }
