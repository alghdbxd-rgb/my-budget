// تخزين محلي فقط (localStorage) — لا يوجد اتصال بأي خادم أو API خارجي.
// هذا يحاكي قاعدة البيانات لأغراض المعاينة والتجربة قبل الربط بالباك-إند الحقيقي (ERPNext).

const KEY = 'gc-db-v1'

export const GOVERNORATES = [
  { id: 'baghdad', name: 'بغداد', lat: 33.3152, lng: 44.3661 },
  { id: 'basra', name: 'البصرة', lat: 30.5085, lng: 47.7804 },
  { id: 'erbil', name: 'أربيل', lat: 36.191, lng: 44.0092 },
  { id: 'najaf', name: 'النجف', lat: 31.9986, lng: 44.3325 },
  { id: 'mosul', name: 'الموصل', lat: 36.335, lng: 43.1189 },
  { id: 'nasiriyah', name: 'الناصرية', lat: 31.0559, lng: 46.2568 },
]

export const COMPLAINTS = [
  { id: 'pain', label: 'ألم', icon: '🦷', specialty: 'طب أسنان عام' },
  { id: 'decay', label: 'تسوّس', icon: '🕳️', specialty: 'علاج تسوّس' },
  { id: 'gum', label: 'لثة', icon: '🩸', specialty: 'علاج لثة' },
  { id: 'ortho', label: 'تقويم', icon: '📐', specialty: 'تقويم أسنان' },
  { id: 'cosmetic', label: 'تجميل', icon: '✨', specialty: 'تجميل أسنان' },
  { id: 'extraction', label: 'خلع', icon: '🔧', specialty: 'جراحة فم وأسنان' },
  { id: 'other', label: 'أخرى', icon: '❓', specialty: 'طب أسنان عام' },
]

export const CONSULT_FEE = 5000 // د.ع — رقم افتراضي للمعاينة، بانتظار الاعتماد النهائي (بند 11)

function uid(prefix = '') {
  return (
    prefix +
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 8)
  ).toUpperCase()
}

function makeCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return `GC-${s}`
}

function doctor(over) {
  return {
    id: uid('DR-'),
    status: 'active', // active | pending | disabled
    rating: 4.6,
    reviewsCount: 12,
    hours: [
      { day: 0, from: '09:00', to: '17:00' },
      { day: 1, from: '09:00', to: '17:00' },
      { day: 2, from: '09:00', to: '17:00' },
      { day: 3, from: '09:00', to: '17:00' },
      { day: 4, from: '09:00', to: '14:00' },
    ],
    credentials: [{ name: 'إجازة نقابة الأطباء العراقية', fileName: 'license.pdf' }],
    photo: null,
    createdAt: Date.now(),
    ...over,
  }
}

function seed() {
  const g = Object.fromEntries(GOVERNORATES.map((x) => [x.id, x]))

  const clinics = [
    { id: 'CL-1', name: 'عيادة الابتسامة الذهبية', region: 'baghdad', lat: 33.31, lng: 44.37, address: 'الكرادة، بغداد' },
    { id: 'CL-2', name: 'مركز النور لطب الأسنان', region: 'baghdad', lat: 33.34, lng: 44.4, address: 'الجادرية، بغداد' },
    { id: 'CL-3', name: 'عيادة الفرات', region: 'basra', lat: 30.51, lng: 47.78, address: 'العشار، البصرة' },
    { id: 'CL-4', name: 'عيادة زاگروس', region: 'erbil', lat: 36.19, lng: 44.01, address: 'عنكاوا، أربيل' },
    { id: 'CL-5', name: 'مركز النجف التخصصي', region: 'najaf', lat: 32.0, lng: 44.33, address: 'حي السلام، النجف' },
    { id: 'CL-6', name: 'عيادة الموصل الحديثة', region: 'mosul', lat: 36.34, lng: 43.12, address: 'الجانب الأيمن، الموصل' },
  ]

  const doctors = [
    doctor({ id: 'DR-1', name: 'د. أحمد الجبوري', specialty: 'طب أسنان عام', clinicId: 'CL-1', bio: 'خبرة 9 سنوات في طب الأسنان العام وحالات الطوارئ.', rating: 4.8, reviewsCount: 143 }),
    doctor({ id: 'DR-2', name: 'د. زينب العامري', specialty: 'علاج تسوّس', clinicId: 'CL-2', bio: 'استشارية علاج تحفظي وتسوّس، دبلوم عالي.', rating: 4.9, reviewsCount: 201 }),
    doctor({ id: 'DR-3', name: 'د. مصطفى كريم', specialty: 'علاج لثة', clinicId: 'CL-1', bio: 'أخصائي أمراض لثة وزراعة أسنان.', rating: 4.5, reviewsCount: 76 }),
    doctor({ id: 'DR-4', name: 'د. رند الساعدي', specialty: 'تقويم أسنان', clinicId: 'CL-3', bio: 'أخصائية تقويم أسنان للأطفال والبالغين.', rating: 4.7, reviewsCount: 98 }),
    doctor({ id: 'DR-5', name: 'د. هيمن رشيد', specialty: 'تجميل أسنان', clinicId: 'CL-4', bio: 'تجميل الأسنان والابتسامة الهوليودية.', rating: 4.6, reviewsCount: 54 }),
    doctor({ id: 'DR-6', name: 'د. علي حسين', specialty: 'جراحة فم وأسنان', clinicId: 'CL-5', bio: 'جراحة فم وفكين وخلع الأسنان المطمورة.', rating: 4.4, reviewsCount: 39 }),
    doctor({ id: 'DR-7', name: 'د. سارة توفيق', specialty: 'طب أسنان عام', clinicId: 'CL-6', bio: 'طبيبة أسنان عامة، متابعة حالات الطوارئ.', rating: 4.3, reviewsCount: 21 }),
    doctor({ id: 'DR-8', name: 'د. يوسف كامل', specialty: 'علاج تسوّس', clinicId: 'CL-1', status: 'pending', bio: 'طلب انضمام جديد بانتظار اعتماد الشهادة.', rating: 0, reviewsCount: 0 }),
    doctor({ id: 'DR-9', name: 'د. منى الزبيدي', specialty: 'علاج لثة', clinicId: 'CL-3', status: 'disabled', bio: 'حساب موقوف مؤقتاً.', rating: 4.1, reviewsCount: 15 }),
  ]

  const patients = [
    {
      id: 'PT-1',
      phone: '07701234567',
      name: 'مريض تجريبي',
      age: 29,
      gender: 'male',
      region: 'baghdad',
      chronic: 'لا يوجد',
      allergies: 'لا يوجد',
      createdAt: Date.now() - 86400000 * 5,
    },
  ]

  const now = Date.now()
  const consultations = [
    {
      id: 'CS-1001',
      patientId: 'PT-1',
      code: 'GC-7XQ2KD',
      status: 'ready',
      urgent: false,
      complaintId: 'decay',
      specialty: 'علاج تسوّس',
      doctorId: 'DR-2',
      createdAt: now - 3600_000 * 40,
      answers: {
        step1: { age: 29, gender: 'male', region: 'baghdad', chronic: 'لا يوجد', allergies: 'لا يوجد' },
        step2: { complaintId: 'decay' },
        step3: { painLevel: 4, duration: '3 أيام', worseWhen: 'عند المضغ', swelling: false, fever: false, tooth: '26' },
        step4: { images: [] },
      },
      paymentStatus: 'paid',
      paymentMethod: 'zaincash',
      opinion:
        'بناءً على الوصف والصور المرفقة، الأعراض تتوافق مع تسوّس متوسط العمق في السن رقم 26. يُنصح بمراجعة العيادة خلال أسبوع لإجراء حشوة تجميلية بعد الكشف السريري والأشعة اللازمة. يمكن استخدام مسكن ألم عام حتى موعد المراجعة عند اللزوم وتجنب الأطعمة شديدة البرودة أو الحرارة على الجهة المصابة.',
      readyAt: now - 3600_000 * 20,
    },
    {
      id: 'CS-1002',
      patientId: 'PT-1',
      code: 'GC-9M4TRZ',
      status: 'in_review',
      urgent: true,
      complaintId: 'pain',
      specialty: 'طب أسنان عام',
      doctorId: 'DR-1',
      createdAt: now - 3600_000 * 2,
      answers: {
        step1: { age: 29, gender: 'male', region: 'baghdad', chronic: 'لا يوجد', allergies: 'لا يوجد' },
        step2: { complaintId: 'pain' },
        step3: { painLevel: 9, duration: 'يوم واحد', worseWhen: 'ليلاً', swelling: true, fever: true, tooth: '46' },
        step4: { images: [] },
      },
      paymentStatus: 'paid',
      paymentMethod: 'asiahawala',
      opinion: '',
    },
  ]

  const codes = [
    { id: 'CD-1', value: 'GC-7XQ2KD', consultationId: 'CS-1001', redeemed: false, discount: 0, clinicId: null, redeemedAt: null },
  ]

  const transactions = []

  const auditLog = [
    { id: uid('AL-'), who: 'د. زينب العامري', role: 'doctor', what: 'عرض تقرير استشارة CS-1001', targetPatientId: 'PT-1', when: now - 3600_000 * 25 },
    { id: uid('AL-'), who: 'د. أحمد الجبوري', role: 'doctor', what: 'عرض إجابات استبيان CS-1002 (حالة طارئة)', targetPatientId: 'PT-1', when: now - 3600_000 * 2 },
  ]

  const complaints = [
    { id: uid('CP-'), consultationId: 'CS-1001', patientId: 'PT-1', text: 'الرد تأخر قليلاً لكن المحتوى كان مفيداً.', status: 'open', createdAt: now - 3600_000 * 10 },
  ]

  const templates = [
    { id: uid('TP-'), title: 'تسوّس بسيط', body: 'الأعراض الموصوفة تتوافق مع تسوّس بسيط. يُنصح بمراجعة أقرب عيادة خلال أسبوعين لإجراء حشوة وقائية.' },
    { id: uid('TP-'), title: 'التهاب لثة', body: 'الأعراض تتوافق مع التهاب لثة. يُنصح باستخدام غسول فموي مطهر مرتين يومياً ومراجعة العيادة خلال 3-5 أيام إن لم يتحسن الألم.' },
    { id: uid('TP-'), title: 'حالة تستدعي مراجعة عاجلة', body: 'بناءً على الأعراض الموصوفة، يُنصح بمراجعة أقرب عيادة أسنان خلال 24 ساعة لتقييم الحالة سريرياً وإجراء الأشعة اللازمة.' },
  ]

  return {
    version: 1,
    session: { patientId: null, role: 'guest', doctorId: null },
    governorates: g,
    clinics,
    doctors,
    patients,
    consultations,
    codes,
    transactions,
    auditLog,
    complaints,
    templates,
    interests: [],
    drafts: {},
    settings: {
      freeConsultationsLimit: 2000,
      usedFreeCount: 1382,
      doctorResponseHours: 24,
      escalation: { painThreshold: 8, requireSwelling: true, requireFever: true },
      discountPercent: 15,
      consultFee: CONSULT_FEE,
      legalNoticeApproved: false,
      legalNotice:
        'هذا التقرير استشارة أولية عن بُعد ولا يغني عن الكشف السريري المباشر. النص النهائي المعتمد قانونياً وطبياً لم يُسلَّم بعد من الطرف الطبي/القانوني للعميل (بند مفتوح رقم 11 في وثيقة المواصفات) — هذا نص مؤقت لأغراض المعاينة فقط ويجب استبداله قبل الإطلاق الفعلي.',
      questionnaireIntro: 'أجب عن الأسئلة التالية بدقة ليتمكن الطبيب من تقييم حالتك بشكل صحيح.',
      homeHeadline: 'استشارة أسنان موثوقة، من مكانك',
      homeSub: 'أجب عن استبيان قصير، ارفع صورك، واحصل على رأي طبيب مختص خلال ساعات.',
    },
  }
}

export function loadDb() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) {
      const s = seed()
      saveDb(s)
      return s
    }
    const parsed = JSON.parse(raw)
    if (!parsed.version) throw new Error('stale')
    return parsed
  } catch {
    const s = seed()
    saveDb(s)
    return s
  }
}

export function saveDb(db) {
  localStorage.setItem(KEY, JSON.stringify(db))
}

export function resetDb() {
  const s = seed()
  saveDb(s)
  return s
}

export { uid, makeCode }
