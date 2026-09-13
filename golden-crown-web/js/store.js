/* =============================================================
   منصة التاج الذهبي — طبقة البيانات (تخزين محلي فقط)
   -------------------------------------------------------------
   كل شيء يُحفظ في localStorage داخل متصفح المستخدم. لا يوجد خادم
   ولا قاعدة بيانات خارجية — هذه نسخة معاينة كاملة للواجهات
   والتدفقات قبل الربط بالباك-إند الحقيقي.
   ============================================================= */
(function () {
  'use strict';

  var KEY = 'gc-web-v1';

  /* ---------- ثوابت مرجعية ---------- */

  var GOVERNORATES = [
    { id: 'baghdad', name: 'بغداد', lat: 33.3152, lng: 44.3661 },
    { id: 'basra', name: 'البصرة', lat: 30.5085, lng: 47.7804 },
    { id: 'erbil', name: 'أربيل', lat: 36.191, lng: 44.0092 },
    { id: 'najaf', name: 'النجف', lat: 31.9986, lng: 44.3325 },
    { id: 'karbala', name: 'كربلاء', lat: 32.6149, lng: 44.0242 },
    { id: 'mosul', name: 'نينوى', lat: 36.335, lng: 43.1189 },
    { id: 'kirkuk', name: 'كركوك', lat: 35.4681, lng: 44.3922 },
    { id: 'nasiriyah', name: 'ذي قار', lat: 31.0559, lng: 46.2568 },
    { id: 'diwaniyah', name: 'الديوانية', lat: 31.9892, lng: 44.9247 },
    { id: 'anbar', name: 'الأنبار', lat: 33.4258, lng: 43.3111 }
  ];

  var SPECIALTIES = [
    'طب أسنان عام',
    'علاج تسوّس وحشوات',
    'أمراض اللثة',
    'تقويم الأسنان',
    'تجميل الأسنان',
    'جراحة الفم والفكين',
    'أسنان الأطفال'
  ];

  var COMPLAINTS = [
    { id: 'pain', label: 'ألم في السن', icon: '⚡', specialty: 'طب أسنان عام' },
    { id: 'decay', label: 'تسوّس', icon: '🦷', specialty: 'علاج تسوّس وحشوات' },
    { id: 'gum', label: 'نزف أو التهاب لثة', icon: '🩸', specialty: 'أمراض اللثة' },
    { id: 'ortho', label: 'اعوجاج وتقويم', icon: '📐', specialty: 'تقويم الأسنان' },
    { id: 'cosmetic', label: 'تجميل وتبييض', icon: '✨', specialty: 'تجميل الأسنان' },
    { id: 'extraction', label: 'خلع أو جراحة', icon: '🔧', specialty: 'جراحة الفم والفكين' },
    { id: 'child', label: 'أسنان طفل', icon: '🧒', specialty: 'أسنان الأطفال' },
    { id: 'other', label: 'شكوى أخرى', icon: '❓', specialty: 'طب أسنان عام' }
  ];

  /* قنوات الإحالة الأربع المذكورة في العرض (FR-36) */
  var CHANNELS = [
    { id: 'medical_groups', name: 'المجموعات الطبية التخصصية', target: 90 },
    { id: 'public_campaign', name: 'الحملة الجماهيرية المباشرة', target: 80 },
    { id: 'colleges', name: 'كليات طب الأسنان والطلاب', target: 70 },
    { id: 'owners_pages', name: 'الصفحات الشخصية للمسؤولين', target: 60 },
    { id: 'direct', name: 'دخول مباشر', target: 0 }
  ];

  var WALLETS = [
    { id: 'zaincash', name: 'زين كاش', hint: 'محفظة زين كاش العراقية' },
    { id: 'asiahawala', name: 'آسيا حوالة', hint: 'محفظة آسياسيل' },
    { id: 'fastpay', name: 'فاست باي', hint: 'FastPay — المرحلة الثانية', phase2: true },
    { id: 'qicard', name: 'كي كارد', hint: 'Qi Card — المرحلة الثانية', phase2: true }
  ];

  /* نص التنبيه الإلزامي — حرفياً كما في وثيقة المتطلبات (القسم 8 / FR-20) */
  var LEGAL_NOTICE =
    'هذا التقرير الصادر يمثل رأياً استشارياً وتوجيهياً مبنياً بالكامل على البيانات والصور التي قمت ' +
    'بإدخالها ورفعها عبر المنصة الرقمية، ولا يغني بأي حال من الأحوال عن الفحص السريري المباشر ' +
    'والدقيق داخل العيادة الفعلية، ولا يعتبر وصفة علاجية نهائية، بل هو دليل إرشادي لمساعدتك على ' +
    'اتخاذ القرار السليم ومناقشته مع طبيبك المعالج للحفاظ على سلامتك.';

  var LEGAL_SOURCE = 'اللجان الطبية المشرفة على منصة التاج الذهبي';

  /* البنود المفتوحة في وثيقة المتطلبات (القسم 9) — تظهر في لوحة الإدارة */
  var OPEN_DECISIONS = [
    { id: 'D1', title: 'نمط الاستشارة', detail: 'رأي مكتوب غير متزامن، أم مكالمة مرئية مباشرة، أم الاثنان؟ يحدد نحو 40% من كلفة البناء.', ref: 'FR-14', weight: 'حرج' },
    { id: 'D2', title: 'سعر الاستشارة', detail: 'لا يرد سعر الاستشارة في العرض، وكل اقتصاديات الخصم قائمة عليه.', ref: 'FR-23 / FR-25', weight: 'حرج' },
    { id: 'D3', title: 'أجور الأطباء', detail: 'نسبة من الإيراد، أم أجر لكل حالة، أم راتب ثابت؟ غير معرَّف.', ref: 'FR-30', weight: 'حرج' },
    { id: 'D4', title: 'نموذج العيادات الشريكة', detail: 'كيفية ضمّها والتعاقد معها وتسويتها مالياً، وهل تحتاج بوابة خاصة بها.', ref: 'FR-27', weight: 'حرج' },
    { id: 'D5', title: 'تعارض الشريحة المجانية', detail: 'العرض يقول "أول 2000 مستخدم مجاناً" والإعلان يقول "أول استشارتين مجاناً" — سقف إجمالي مقابل سقف لكل مستخدم.', ref: 'FR-24', weight: 'حرج' },
    { id: 'D6', title: 'منطق المطابقة الجغرافية', detail: 'الأقرب بتحديد الموقع، أم حسب المحافظة، أم بربط يدوي؟', ref: 'FR-8', weight: 'متوسط' },
    { id: 'D7', title: 'دور الذكاء الاصطناعي', detail: 'العرض يذكره لإنتاج الفيديو التسويقي فقط ولا يدّعي تشخيصاً آلياً — يلزم تثبيت ذلك صراحةً.', ref: '—', weight: 'متوسط' },
    { id: 'D8', title: 'التحقق من الإجازات المهنية', detail: 'جهة التحقق (النقابة/وزارة الصحة) وتحديد متحمّل المسؤولية الطبية.', ref: 'NFR-17', weight: 'حرج' },
    { id: 'D9', title: 'الموافقة على اشتراكات البيانات', detail: 'بيع الوصول لقاعدة بيانات المرضى دون طبقة موافقة صريحة هو أعلى بنود المخاطرة في الوثيقة.', ref: 'FR-33 / NFR-5', weight: 'حرج' },
    { id: 'D10', title: 'مدة الدعم وأرقام مستوى الخدمة', detail: 'عبارات وصفية بلا أرقام ملزمة داخل عقد التنفيذ.', ref: 'NFR-7 / NFR-14 / NFR-15', weight: 'متوسط' }
  ];

  /* ---------- أدوات ---------- */

  function uid(prefix) {
    /* معرّف قصير يسهل قراءته في الجداول والتقارير */
    return (
      (prefix || '') +
      Date.now().toString(36).slice(-4).toUpperCase() +
      Math.random().toString(36).slice(2, 4).toUpperCase()
    );
  }

  /* مولّد أرقام شبه عشوائي بذرة ثابتة — ليكون العرض التجريبي متطابقاً في كل مرة */
  function rng(seed) {
    var t = seed >>> 0;
    return function () {
      t += 0x6d2b79f5;
      var r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }

  function pick(rand, arr) {
    return arr[Math.floor(rand() * arr.length)];
  }

  function makeCode(rand) {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var s = '';
    for (var i = 0; i < 6; i++) s += chars[Math.floor((rand ? rand() : Math.random()) * chars.length)];
    return 'GC-' + s;
  }

  var DAY = 86400000;

  /* ---------- البيانات التجريبية ---------- */

  function seed() {
    var rand = rng(20260913);
    var now = Date.now();

    var clinics = [
      { id: 'CL-1', name: 'عيادة الابتسامة الذهبية', region: 'baghdad', address: 'الكرادة، بغداد', lat: 33.31, lng: 44.37, partner: true },
      { id: 'CL-2', name: 'مركز النور لطب الأسنان', region: 'baghdad', address: 'الجادرية، بغداد', lat: 33.34, lng: 44.4, partner: true },
      { id: 'CL-3', name: 'عيادة الفرات التخصصية', region: 'basra', address: 'العشار، البصرة', lat: 30.51, lng: 47.78, partner: true },
      { id: 'CL-4', name: 'مركز زاگروس', region: 'erbil', address: 'عنكاوا، أربيل', lat: 36.19, lng: 44.01, partner: true },
      { id: 'CL-5', name: 'مركز النجف التخصصي', region: 'najaf', address: 'حي السلام، النجف', lat: 32.0, lng: 44.33, partner: true },
      { id: 'CL-6', name: 'عيادة نينوى الحديثة', region: 'mosul', address: 'الجانب الأيمن، الموصل', lat: 36.34, lng: 43.12, partner: true },
      { id: 'CL-7', name: 'عيادة كربلاء المركزية', region: 'karbala', address: 'باب بغداد، كربلاء', lat: 32.61, lng: 44.03, partner: false },
      { id: 'CL-8', name: 'مركز كركوك لطب الأسنان', region: 'kirkuk', address: 'شورجة، كركوك', lat: 35.47, lng: 44.39, partner: true }
    ];

    function doctor(o) {
      return Object.assign(
        {
          status: 'active',
          rating: 4.5,
          reviewsCount: 0,
          photo: null,
          phone: '',
          supervisorId: 'SV-1',
          licenseNo: '',
          licenseVerified: false,
          payoutModel: 'share',
          sharePercent: 70,
          hours: [
            { day: 6, from: '09:00', to: '17:00' },
            { day: 0, from: '09:00', to: '17:00' },
            { day: 1, from: '09:00', to: '17:00' },
            { day: 2, from: '09:00', to: '17:00' },
            { day: 3, from: '09:00', to: '14:00' }
          ],
          credentials: [{ name: 'إجازة نقابة أطباء الأسنان العراقية', fileName: 'license.pdf' }],
          createdAt: now - 80 * DAY
        },
        o
      );
    }

    var doctors = [
      doctor({ id: 'DR-1', name: 'د. أحمد الجبوري', specialty: 'طب أسنان عام', clinicId: 'CL-1', region: 'baghdad', bio: 'خبرة 9 سنوات في طب الأسنان العام وحالات الطوارئ.', rating: 4.8, reviewsCount: 143, phone: '07701112233', licenseNo: 'IQ-D-10233', licenseVerified: true }),
      doctor({ id: 'DR-2', name: 'د. زينب العامري', specialty: 'علاج تسوّس وحشوات', clinicId: 'CL-2', region: 'baghdad', bio: 'استشارية علاج تحفظي، دبلوم عالي في الحشوات التجميلية.', rating: 4.9, reviewsCount: 201, phone: '07702223344', licenseNo: 'IQ-D-11877', licenseVerified: true }),
      doctor({ id: 'DR-3', name: 'د. مصطفى كريم', specialty: 'أمراض اللثة', clinicId: 'CL-1', region: 'baghdad', bio: 'أخصائي أمراض لثة وزراعة أسنان.', rating: 4.5, reviewsCount: 76, phone: '07703334455', licenseNo: 'IQ-D-12044', licenseVerified: true, supervisorId: 'SV-2' }),
      doctor({ id: 'DR-4', name: 'د. رند الساعدي', specialty: 'تقويم الأسنان', clinicId: 'CL-3', region: 'basra', bio: 'أخصائية تقويم للأطفال والبالغين.', rating: 4.7, reviewsCount: 98, phone: '07704445566', licenseNo: 'IQ-D-12910', licenseVerified: true, supervisorId: 'SV-2' }),
      doctor({ id: 'DR-5', name: 'د. هيمن رشيد', specialty: 'تجميل الأسنان', clinicId: 'CL-4', region: 'erbil', bio: 'تجميل الابتسامة والعدسات الخزفية.', rating: 4.6, reviewsCount: 54, phone: '07505556677', licenseNo: 'IQ-D-13188', licenseVerified: true, supervisorId: 'SV-2' }),
      doctor({ id: 'DR-6', name: 'د. علي حسين', specialty: 'جراحة الفم والفكين', clinicId: 'CL-5', region: 'najaf', bio: 'جراحة فم وفكين وخلع الأسنان المطمورة.', rating: 4.4, reviewsCount: 39, phone: '07806667788', licenseNo: 'IQ-D-13421', licenseVerified: true }),
      doctor({ id: 'DR-7', name: 'د. سارة توفيق', specialty: 'طب أسنان عام', clinicId: 'CL-6', region: 'mosul', bio: 'طبيبة أسنان عامة، متابعة حالات الطوارئ.', rating: 4.3, reviewsCount: 21, phone: '07707778899', licenseNo: 'IQ-D-13999', licenseVerified: true }),
      doctor({ id: 'DR-8', name: 'د. نور الهدى صالح', specialty: 'أسنان الأطفال', clinicId: 'CL-8', region: 'kirkuk', bio: 'أخصائية أسنان أطفال وسلوكيات العلاج.', rating: 4.6, reviewsCount: 44, phone: '07708889900', licenseNo: 'IQ-D-14120', licenseVerified: true, supervisorId: 'SV-2' }),
      doctor({ id: 'DR-9', name: 'د. يوسف كامل', specialty: 'علاج تسوّس وحشوات', clinicId: 'CL-1', region: 'baghdad', bio: 'طلب انضمام جديد بانتظار اعتماد الإجازة.', status: 'pending', rating: 0, reviewsCount: 0, phone: '07709990011', licenseNo: 'IQ-D-14488', licenseVerified: false, createdAt: now - 6 * DAY }),
      doctor({ id: 'DR-10', name: 'د. منى الزبيدي', specialty: 'أمراض اللثة', clinicId: 'CL-3', region: 'basra', bio: 'حساب موقوف مؤقتاً لمراجعة جودة.', status: 'disabled', rating: 4.1, reviewsCount: 15, phone: '07700001122', licenseNo: 'IQ-D-12377', licenseVerified: true, supervisorId: 'SV-2' })
    ];

    var supervisors = [
      { id: 'SV-1', name: 'م. حيدر الربيعي', phone: '07711111111', scope: 'الوسط والجنوب', status: 'active', createdAt: now - 85 * DAY },
      { id: 'SV-2', name: 'م. دلال العبيدي', phone: '07722222222', scope: 'الشمال والفرات', status: 'active', createdAt: now - 85 * DAY }
    ];

    var admins = [
      { id: 'AD-1', name: 'د. خالد', role: 'super_admin', note: 'الشريك ومقدّم العرض' },
      { id: 'AD-2', name: 'الأستاذ عبد اللطيف', role: 'super_admin', note: 'شريك النجاح والممول' }
    ];

    var firstNames = ['مصطفى', 'زينب', 'علي', 'نور', 'حسين', 'فاطمة', 'أحمد', 'مريم', 'حيدر', 'رقية', 'عمر', 'سجى', 'كرار', 'دعاء', 'يوسف', 'آية', 'محمد', 'هبة', 'باسم', 'شهد'];
    var lastNames = ['الجبوري', 'العامري', 'الساعدي', 'الخفاجي', 'الدليمي', 'الزبيدي', 'البياتي', 'الطائي', 'الحسناوي', 'الشمري'];

    var patients = [];
    var i;
    for (i = 0; i < 168; i++) {
      var created = now - Math.floor(rand() * 90) * DAY;
      patients.push({
        id: 'PT-' + (100 + i),
        phone: '077' + String(10000000 + Math.floor(rand() * 89999999)).slice(0, 8),
        name: pick(rand, firstNames) + ' ' + pick(rand, lastNames),
        age: 16 + Math.floor(rand() * 50),
        gender: rand() < 0.52 ? 'female' : 'male',
        region: pick(rand, GOVERNORATES).id,
        chronic: rand() < 0.18 ? 'سكري' : 'لا يوجد',
        allergies: rand() < 0.12 ? 'بنسلين' : 'لا يوجد',
        channel: pick(rand, ['medical_groups', 'public_campaign', 'public_campaign', 'colleges', 'owners_pages', 'direct']),
        createdAt: created
      });
    }
    /* حساب تجريبي ثابت للدخول السريع */
    patients.unshift({
      id: 'PT-1',
      phone: '07701234567',
      name: 'مريض تجريبي',
      age: 29,
      gender: 'male',
      region: 'baghdad',
      chronic: 'لا يوجد',
      allergies: 'لا يوجد',
      channel: 'direct',
      createdAt: now - 12 * DAY
    });

    var opinions = [
      'بناءً على الوصف والصور المرفقة، الأعراض تتوافق مع تسوّس متوسط العمق. يُنصح بمراجعة العيادة خلال أسبوع لإجراء حشوة بعد الكشف السريري والأشعة اللازمة، مع تجنّب الأطعمة شديدة البرودة على الجهة المصابة.',
      'الصورة تُظهر احمراراً وانتفاخاً في اللثة حول السن المصاب. يُنصح بغسول مطهر مرتين يومياً وتنظيف لثوي عميق في العيادة خلال 3–5 أيام، ومراجعة فورية إذا زاد التورّم أو ظهرت حرارة.',
      'الحالة تستدعي مراجعة عاجلة خلال 24 ساعة لتقييم احتمال وجود خُراج سني. لا يُكتفى بالمسكنات، والكشف السريري مع الأشعة ضروري لتحديد ما إذا كان العلاج يتطلب سحب عصب أو تصريفاً.',
      'وضع الأسنان الأمامية يحتمل علاجاً تقويمياً. الخطوة الأولى صور أشعة بانورامية وقياسات في العيادة لتحديد نوع الجهاز والمدة التقريبية، ولا يمكن تثبيت خطة نهائية عن بُعد.',
      'الأعراض تتوافق مع حساسية عاج مكشوف. يُنصح بمعجون خاص للحساسية لمدة أسبوعين ومراجعة العيادة لتقييم الحاجة إلى طبقة عازلة أو حشوة عنقية.'
    ];

    var durations = ['يوم واحد', 'يومان', '3 أيام', 'أسبوع', 'أكثر من أسبوعين'];
    var worse = ['عند المضغ', 'مع البارد', 'مع الحار', 'ليلاً', 'عند اللمس'];

    var consultations = [];
    var codes = [];
    var transactions = [];
    var audit = [];
    var complaints = [];

    var freeUsed = 0;
    var fee = 10000;

    for (i = 0; i < 214; i++) {
      var p = patients[Math.floor(rand() * patients.length)];
      var ageDays = Math.floor(rand() * 90);
      var createdAt = now - ageDays * DAY - Math.floor(rand() * DAY);
      var complaint = pick(rand, COMPLAINTS);
      var pain = 1 + Math.floor(rand() * 10);
      var swelling = rand() < 0.22;
      var fever = rand() < 0.14;
      var urgent = pain >= 8 && swelling && fever;
      var cs = {
        id: 'CS-' + (1000 + i),
        patientId: p.id,
        code: null,
        status: 'new',
        urgent: urgent,
        complaintId: complaint.id,
        specialty: complaint.specialty,
        doctorId: null,
        supervisorId: null,
        createdAt: createdAt,
        channel: p.channel,
        answers: {
          step1: { age: p.age, gender: p.gender, region: p.region, chronic: p.chronic, allergies: p.allergies },
          step2: { complaintId: complaint.id, tooth: String(11 + Math.floor(rand() * 37)) },
          step3: { painLevel: pain, duration: pick(rand, durations), worseWhen: pick(rand, worse), swelling: swelling, fever: fever },
          step4: { images: [], note: '' }
        },
        paymentStatus: 'pending',
        paymentMethod: null,
        amount: 0,
        opinion: '',
        qualityNotes: []
      };

      var roll = rand();
      if (roll < 0.08) {
        /* استبيان لم يُكمل — يظهر في قمع التحويل */
        cs.status = 'draft';
        consultations.push(cs);
        continue;
      }

      /* الدفع */
      var free = freeUsed < 120 && rand() < 0.55;
      if (free) {
        freeUsed++;
        cs.paymentStatus = 'paid';
        cs.paymentMethod = 'free';
        cs.amount = 0;
      } else if (rand() < 0.05) {
        cs.paymentStatus = 'failed';
        consultations.push(cs);
        continue;
      } else {
        cs.paymentStatus = 'paid';
        cs.paymentMethod = rand() < 0.62 ? 'zaincash' : 'asiahawala';
        cs.amount = fee;
      }

      /* الإسناد */
      var candidates = doctors.filter(function (d) {
        return d.status === 'active' && d.specialty === cs.specialty;
      });
      if (!candidates.length) {
        candidates = doctors.filter(function (d) {
          return d.status === 'active';
        });
      }
      var doc = pick(rand, candidates);
      cs.doctorId = doc.id;
      cs.supervisorId = doc.supervisorId;
      cs.code = makeCode(rand);
      cs.status = 'in_review';
      codes.push({ id: uid('CD-'), value: cs.code, consultationId: cs.id, redeemed: false, clinicId: null, redeemedAt: null, discount: 0 });

      var r2 = rand();
      /* الحالات المفتوحة تكون حديثة فقط — أي حالة قديمة يجب أن تكون قد أُجيبت أو أُغلقت */
      if (ageDays <= 2 && r2 < 0.5) {
        if (r2 < 0.14) {
          cs.status = 'new';
          cs.doctorId = null;
        } else {
          cs.status = 'in_review';
        }
      } else {
        var respHours = urgent ? 0.4 + rand() * 2 : 2 + rand() * 30;
        cs.answeredAt = createdAt + respHours * 3600000;
        if (cs.answeredAt > now) cs.answeredAt = now - 3600000;
        cs.responseHours = Math.round(((cs.answeredAt - createdAt) / 3600000) * 10) / 10;
        cs.opinion = pick(rand, opinions);
        cs.status = rand() < 0.35 ? 'closed' : 'answered';
        cs.qualityStatus = rand() < 0.55 ? 'reviewed' : 'pending';
        cs.patientRating = 3 + Math.floor(rand() * 3);

        /* صرف الكود في العيادة الشريكة */
        if (rand() < 0.42) {
          var codeRow = codes[codes.length - 1];
          var clinic = pick(rand, clinics.filter(function (c) { return c.partner; }));
          var redeemedAt = cs.answeredAt + Math.floor(rand() * 6 + 1) * DAY;
          if (redeemedAt < now) {
            codeRow.redeemed = true;
            codeRow.redeemedAt = redeemedAt;
            codeRow.clinicId = clinic.id;
            codeRow.discount = cs.amount;
            var doctorShare = Math.round(cs.amount * 0.7);
            transactions.push({
              id: uid('TX-'),
              type: 'consultation',
              consultationId: cs.id,
              doctorId: cs.doctorId,
              clinicId: clinic.id,
              amount: cs.amount,
              doctorShare: doctorShare,
              platformShare: cs.amount - doctorShare,
              clinicDiscount: cs.amount,
              settled: rand() < 0.5,
              date: redeemedAt
            });
          }
        } else if (cs.amount > 0) {
          var dShare = Math.round(cs.amount * 0.7);
          transactions.push({
            id: uid('TX-'),
            type: 'consultation',
            consultationId: cs.id,
            doctorId: cs.doctorId,
            clinicId: null,
            amount: cs.amount,
            doctorShare: dShare,
            platformShare: cs.amount - dShare,
            clinicDiscount: 0,
            settled: rand() < 0.5,
            date: cs.answeredAt
          });
        }

        if (rand() < 0.06) {
          complaints.push({
            id: uid('CP-'),
            consultationId: cs.id,
            patientId: cs.patientId,
            text: pick(rand, ['الرد تأخر أكثر من المتوقع.', 'أحتاج توضيحاً إضافياً عن الخطة العلاجية.', 'لم تُذكر كلفة العلاج التقريبية.']),
            status: rand() < 0.5 ? 'open' : 'resolved',
            createdAt: cs.answeredAt + DAY
          });
        }
      }

      consultations.push(cs);
    }

    consultations.sort(function (a, b) {
      return b.createdAt - a.createdAt;
    });

    /* حالتان ثابتتان للحساب التجريبي لتجربة كل الشاشات فوراً */
    var demoReady = {
      id: 'CS-2001',
      patientId: 'PT-1',
      code: 'GC-7XQ2KD',
      status: 'answered',
      urgent: false,
      complaintId: 'decay',
      specialty: 'علاج تسوّس وحشوات',
      doctorId: 'DR-2',
      supervisorId: 'SV-1',
      createdAt: now - 40 * 3600000,
      channel: 'direct',
      answers: {
        step1: { age: 29, gender: 'male', region: 'baghdad', chronic: 'لا يوجد', allergies: 'لا يوجد' },
        step2: { complaintId: 'decay', tooth: '26' },
        step3: { painLevel: 4, duration: '3 أيام', worseWhen: 'عند المضغ', swelling: false, fever: false },
        step4: { images: [], note: 'الألم يزداد مع الحلويات.' }
      },
      paymentStatus: 'paid',
      paymentMethod: 'zaincash',
      amount: fee,
      opinion: opinions[0],
      answeredAt: now - 20 * 3600000,
      responseHours: 20,
      qualityStatus: 'reviewed',
      qualityNotes: []
    };
    var demoUrgent = {
      id: 'CS-2002',
      patientId: 'PT-1',
      code: 'GC-9M4TRZ',
      status: 'in_review',
      urgent: true,
      complaintId: 'pain',
      specialty: 'طب أسنان عام',
      doctorId: 'DR-1',
      supervisorId: 'SV-1',
      createdAt: now - 2 * 3600000,
      channel: 'direct',
      answers: {
        step1: { age: 29, gender: 'male', region: 'baghdad', chronic: 'لا يوجد', allergies: 'لا يوجد' },
        step2: { complaintId: 'pain', tooth: '46' },
        step3: { painLevel: 9, duration: 'يوم واحد', worseWhen: 'ليلاً', swelling: true, fever: true },
        step4: { images: [], note: 'تورّم واضح في الخد مع حرارة.' }
      },
      paymentStatus: 'paid',
      paymentMethod: 'asiahawala',
      amount: fee,
      opinion: '',
      qualityNotes: []
    };
    consultations.unshift(demoUrgent, demoReady);
    codes.push({ id: uid('CD-'), value: 'GC-7XQ2KD', consultationId: 'CS-2001', redeemed: false, clinicId: null, redeemedAt: null, discount: 0 });
    codes.push({ id: uid('CD-'), value: 'GC-9M4TRZ', consultationId: 'CS-2002', redeemed: false, clinicId: null, redeemedAt: null, discount: 0 });

    audit.push(
      { id: uid('AL-'), who: 'النظام', role: 'system', what: 'تصعيد تلقائي لحالة طارئة CS-2002 إلى قائمة المشرفين', targetPatientId: 'PT-1', when: now - 2 * 3600000 },
      { id: uid('AL-'), who: 'د. زينب العامري', role: 'doctor', what: 'عرض صور وبيانات الاستشارة CS-2001', targetPatientId: 'PT-1', when: now - 25 * 3600000 },
      { id: uid('AL-'), who: 'د. خالد', role: 'super_admin', what: 'تفعيل حساب الطبيب د. نور الهدى صالح', targetPatientId: null, when: now - 5 * DAY }
    );

    var waitlist = [];
    for (i = 0; i < 37; i++) {
      waitlist.push({
        id: uid('WL-'),
        name: pick(rand, firstNames) + ' ' + pick(rand, lastNames),
        phone: '077' + String(10000000 + Math.floor(rand() * 89999999)).slice(0, 8),
        region: pick(rand, GOVERNORATES).id,
        type: rand() < 0.75 ? 'patient' : 'doctor',
        channel: pick(rand, ['medical_groups', 'public_campaign', 'colleges', 'owners_pages']),
        createdAt: now - Math.floor(rand() * 60) * DAY
      });
    }

    var visits = [];
    for (i = 0; i < 90; i++) {
      var d0 = now - i * DAY;
      CHANNELS.forEach(function (ch) {
        if (ch.id === 'direct') return;
        visits.push({ date: d0, channel: ch.id, count: 20 + Math.floor(rand() * 90) });
      });
      visits.push({ date: d0, channel: 'direct', count: 8 + Math.floor(rand() * 25) });
    }

    return {
      version: 1,
      createdAt: now,
      session: { role: 'guest', patientId: null, doctorId: null, supervisorId: null, adminId: null },
      clinics: clinics,
      doctors: doctors,
      supervisors: supervisors,
      admins: admins,
      patients: patients,
      consultations: consultations,
      codes: codes,
      transactions: transactions,
      audit: audit,
      complaints: complaints,
      waitlist: waitlist,
      visits: visits,
      drafts: {},
      templates: [
        { id: uid('TP-'), title: 'تسوّس بسيط', body: 'الأعراض الموصوفة تتوافق مع تسوّس بسيط. يُنصح بمراجعة أقرب عيادة خلال أسبوعين لإجراء حشوة وقائية بعد الكشف السريري.' },
        { id: uid('TP-'), title: 'التهاب لثة', body: 'الأعراض تتوافق مع التهاب لثة. يُنصح بغسول فموي مطهر مرتين يومياً ومراجعة العيادة خلال 3–5 أيام إن لم يتحسن الألم.' },
        { id: uid('TP-'), title: 'حالة تستدعي مراجعة عاجلة', body: 'بناءً على الأعراض الموصوفة، يُنصح بمراجعة أقرب عيادة أسنان خلال 24 ساعة لتقييم الحالة سريرياً وإجراء الأشعة اللازمة.' }
      ],
      settings: {
        consultFee: fee,
        currency: 'د.ع',
        freeMode: 'total_cap',            /* total_cap = أول 2000 مستخدم | per_user = أول استشارتين لكل مستخدم (بند متعارض D5) */
        freeTotalCap: 2000,
        freePerUser: 2,
        freeUsed: freeUsed,
        doctorSharePercent: 70,
        clinicDiscountPercent: 100,       /* نسبة مبلغ الاستشارة التي تُخصم من كلفة العلاج */
        slaHours: 24,
        urgentSlaMinutes: 60,
        escalation: { painThreshold: 8, requireSwelling: true, requireFever: true },
        matching: 'geo_nearest',
        legalNotice: LEGAL_NOTICE,
        legalSource: LEGAL_SOURCE,
        legalLocked: true,                /* النص إلزامي ولا يُحذف من التقرير (FR-20) */
        launched: false,
        homeHeadline: 'رأي طبيب أسنان مختص… وأنت في بيتك',
        homeSub: 'أجب عن استبيان قصير، ارفع صور ابتسامتك، واحصل على رأي استشاري موثّق خلال ساعات — ثم توجيه لأقرب عيادة مناسبة لحالتك.'
      }
    };
  }

  /* ---------- الوصول للتخزين ---------- */

  var state = null;
  var listeners = [];

  function load() {
    if (state) return state;
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) {
        state = seed();
        persist();
        return state;
      }
      var parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== 1) throw new Error('stale');
      state = parsed;
      return state;
    } catch (e) {
      state = seed();
      persist();
      return state;
    }
  }

  function persist() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      /* قد تمتلئ مساحة التخزين عند رفع صور كثيرة */
      console.warn('تعذّر الحفظ محلياً:', e);
    }
  }

  function update(fn) {
    load();
    fn(state);
    persist();
    listeners.forEach(function (l) {
      try { l(state); } catch (e) { console.error(e); }
    });
    return state;
  }

  function subscribe(fn) {
    listeners.push(fn);
    return function () {
      listeners = listeners.filter(function (l) { return l !== fn; });
    };
  }

  function reset() {
    state = seed();
    persist();
    listeners.forEach(function (l) { l(state); });
    return state;
  }

  function log(s, entry) {
    s.audit.unshift({
      id: uid('AL-'),
      who: entry.who || 'النظام',
      role: entry.role || 'system',
      what: entry.what,
      targetPatientId: entry.targetPatientId || null,
      when: Date.now()
    });
    if (s.audit.length > 500) s.audit.length = 500;
  }

  /* ---------- الواجهة العامة ---------- */

  window.GC = window.GC || {};
  window.GC.store = {
    KEY: KEY,
    GOVERNORATES: GOVERNORATES,
    SPECIALTIES: SPECIALTIES,
    COMPLAINTS: COMPLAINTS,
    CHANNELS: CHANNELS,
    WALLETS: WALLETS,
    OPEN_DECISIONS: OPEN_DECISIONS,
    LEGAL_NOTICE: LEGAL_NOTICE,
    LEGAL_SOURCE: LEGAL_SOURCE,
    load: load,
    update: update,
    subscribe: subscribe,
    reset: reset,
    log: log,
    uid: uid,
    makeCode: makeCode,
    DAY: DAY
  };
})();
