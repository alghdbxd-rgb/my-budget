/* =============================================================
   أساس العقارية — طبقة البيانات
   -------------------------------------------------------------
   كل شيء يُحفظ محلياً في متصفح المستخدم (localStorage) بلا خادم.
   عند الربط بسيرفر حقيقي، تُستبدل دوال الحفظ والقراءة هنا فقط
   بنداءات API ويبقى باقي التطبيق كما هو (انظر README).
   ============================================================= */
(function () {
  'use strict';

  window.AS = window.AS || {};

  var KEY = 'asas-re-v1';

  /* ---------- ثوابت مرجعية ---------- */

  var GOVS = [
    { id: 'baghdad', name: 'بغداد', areas: ['الكرادة', 'المنصور', 'زيونة', 'الجادرية', 'الحارثية', 'اليرموك', 'الدورة', 'الشعب', 'الغزالية', 'أبو غريب'] },
    { id: 'basra', name: 'البصرة', areas: ['العشار', 'الجنينة', 'البراضعية', 'الزبير', 'أبو الخصيب', 'حي الحسين'] },
    { id: 'erbil', name: 'أربيل', areas: ['عنكاوا', 'المجيدي', 'شارع ٦٠', 'سيتي ستار'] },
    { id: 'najaf', name: 'النجف', areas: ['حي السلام', 'حي النصر', 'الميلاد', 'الحنانة'] },
    { id: 'karbala', name: 'كربلاء', areas: ['حي الحسين', 'حي المعلمين', 'العباسية', 'باب بغداد'] },
    { id: 'babil', name: 'بابل', areas: ['الحلة المركز', 'الثورة', 'الجمعية', 'المحاويل'] },
    { id: 'nineveh', name: 'نينوى', areas: ['الموصل الجديدة', 'المثنى', 'الزهور', 'حي الشرطة'] },
    { id: 'kirkuk', name: 'كركوك', areas: ['الواسطي', 'رحيم آوا', 'شورجة'] },
    { id: 'anbar', name: 'الأنبار', areas: ['الرمادي المركز', 'الفلوجة', 'حي التأميم'] },
    { id: 'dhiqar', name: 'ذي قار', areas: ['الناصرية المركز', 'حي الزيتون', 'سومر'] },
    { id: 'diyala', name: 'ديالى', areas: ['بعقوبة', 'المفرق', 'الخالص'] },
    { id: 'wasit', name: 'واسط', areas: ['الكوت', 'حي الزهراء', 'الحي'] },
    { id: 'maysan', name: 'ميسان', areas: ['العمارة', 'حي الحسين'] },
    { id: 'muthanna', name: 'المثنى', areas: ['السماوة', 'حي الزهراء'] },
    { id: 'qadisiyah', name: 'القادسية', areas: ['الديوانية المركز', 'حي الجزائر'] },
    { id: 'salahaddin', name: 'صلاح الدين', areas: ['تكريت', 'سامراء', 'بلد'] },
    { id: 'sulaymaniyah', name: 'السليمانية', areas: ['سالم', 'بختياري', 'جوارباخ'] },
    { id: 'duhok', name: 'دهوك', areas: ['المركز', 'زاخو'] }
  ];

  var TYPES = [
    { id: 'apartment', name: 'شقة', icon: '🏢' },
    { id: 'house', name: 'دار', icon: '🏠' },
    { id: 'land', name: 'قطعة أرض', icon: '🟩' },
    { id: 'shop', name: 'محل', icon: '🏪' },
    { id: 'office', name: 'مكتب', icon: '🏬' },
    { id: 'building', name: 'عمارة', icon: '🏘️' },
    { id: 'farm', name: 'بستان / مزرعة', icon: '🌴' },
    { id: 'chalet', name: 'شاليه / استراحة', icon: '🏖️' },
    { id: 'warehouse', name: 'مخزن', icon: '📦' }
  ];

  var PURPOSES = [
    { id: 'sale', name: 'للبيع', icon: '🏷️' },
    { id: 'rent', name: 'للإيجار', icon: '🔑' },
    { id: 'investment', name: 'استثمار / شراكة', icon: '📈' }
  ];

  var PROP_STATUS = [
    { id: 'available', name: 'متاح', tone: 'ok' },
    { id: 'reserved', name: 'محجوز', tone: 'warn' },
    { id: 'sold', name: 'مباع', tone: 'muted' },
    { id: 'rented', name: 'مؤجّر', tone: 'info' },
    { id: 'paused', name: 'موقوف', tone: 'muted' }
  ];

  var OFFER_STATUS = [
    { id: 'active', name: 'فعّال', tone: 'ok' },
    { id: 'reserved', name: 'محجوز بعربون', tone: 'warn' },
    { id: 'closed', name: 'منجز', tone: 'info' },
    { id: 'expired', name: 'منتهي', tone: 'muted' }
  ];

  var FINISH = ['سوبر ديلوكس', 'ديلوكس', 'جيد', 'يحتاج تصليح', 'هيكل', 'أرض فضاء'];

  var FEATURES = [
    'كراج سيارة', 'مصعد', 'مولدة خاصة', 'حديقة', 'مسبح', 'مفروش', 'تكييف مركزي',
    'واجهة شارع رئيسي', 'قرب مدرسة', 'قرب سوق', 'خزان ماء', 'سيستم حماية', 'طابو صرف', 'مشتمل'
  ];

  var CASH_CATS = {
    in: ['عمولة بيع', 'عمولة إيجار', 'عربون حجز', 'رأس مال مستثمر', 'إيراد إيجار', 'دفعة زبون', 'إيراد آخر'],
    out: ['توزيع أرباح', 'رواتب', 'إيجار مكتب', 'دعاية وإعلان', 'مصاريف تشغيل', 'إرجاع عربون', 'صيانة عقار', 'مصروف آخر']
  };

  var CLIENT_STATUS = [
    { id: 'new', name: 'طلب جديد', tone: 'info' },
    { id: 'following', name: 'قيد المتابعة', tone: 'warn' },
    { id: 'visited', name: 'زار العقار', tone: 'purple' },
    { id: 'deal', name: 'أتمّ الصفقة', tone: 'ok' },
    { id: 'lost', name: 'منسحب', tone: 'muted' }
  ];

  /* ---------- أدوات ---------- */

  function id(prefix) {
    return (prefix || 'x') + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
  }

  function byId(list, v) {
    for (var i = 0; i < list.length; i++) if (list[i].id === v) return list[i];
    return null;
  }

  function govName(gid) {
    var g = byId(GOVS, gid);
    return g ? g.name : gid || '';
  }

  function typeName(tid) {
    var t = byId(TYPES, tid);
    return t ? t.name : tid || '';
  }

  function typeIcon(tid) {
    var t = byId(TYPES, tid);
    return t ? t.icon : '🏠';
  }

  function purposeName(pid) {
    var p = byId(PURPOSES, pid);
    return p ? p.name : pid || '';
  }

  function statusOf(list, sid) {
    return byId(list, sid) || { id: sid, name: sid || '—', tone: 'muted' };
  }

  var days = 86400000;

  /* ---------- بيانات تجريبية ---------- */

  function seed() {
    var now = Date.now();

    function prop(o) {
      return Object.assign({
        id: id('p'), code: '', title: '', type: 'house', purpose: 'sale',
        gov: 'baghdad', area: '', address: '', lat: null, lng: null, mapUrl: '',
        space: 0, frontage: 0, rooms: 0, baths: 0, floors: 1, floorNo: 0, age: 0,
        finish: 'جيد', furnished: false,
        price: 0, currency: 'USD', rentPeriod: 'yearly', negotiable: true,
        ownerName: '', ownerPhone: '', deedType: 'طابو صرف',
        status: 'available', inHand: true, exclusive: false,
        features: [], notes: '', media: [],
        createdAt: now, updatedAt: now
      }, o);
    }

    var props = [
      prop({
        id: 'p-1', code: 'ع-1001', title: 'دار طابقين — زيونة قرب ساحة المنتصر',
        type: 'house', purpose: 'sale', gov: 'baghdad', area: 'زيونة', address: 'محلة 714 زقاق 21',
        lat: 33.3436, lng: 44.4409, space: 300, frontage: 15, rooms: 5, baths: 3, floors: 2, age: 8,
        finish: 'سوبر ديلوكس', price: 450000, currency: 'USD', ownerName: 'أبو محمد الجنابي', ownerPhone: '07901234567',
        exclusive: true, features: ['كراج سيارة', 'حديقة', 'مولدة خاصة', 'طابو صرف'],
        notes: 'صاحب العقار مستعجل بالبيع، يقبل تفاوض ٢٠ ألف.', createdAt: now - 12 * days
      }),
      prop({
        id: 'p-2', code: 'ع-1002', title: 'شقة 3 غرف — كرادة داخل، مجمع النخيل',
        type: 'apartment', purpose: 'sale', gov: 'baghdad', area: 'الكرادة', address: 'مجمع النخيل السكني، بناية B طابق 6',
        lat: 33.3013, lng: 44.4301, space: 165, rooms: 3, baths: 2, floorNo: 6, age: 3,
        finish: 'ديلوكس', price: 175000, currency: 'USD', ownerName: 'سيف عبدالله', ownerPhone: '07715558822',
        features: ['مصعد', 'تكييف مركزي', 'سيستم حماية', 'مفروش'], furnished: true, createdAt: now - 9 * days
      }),
      prop({
        id: 'p-3', code: 'ع-1003', title: 'قطعة أرض 600 م² — المنصور، واجهة شارع رئيسي',
        type: 'land', purpose: 'investment', gov: 'baghdad', area: 'المنصور', address: 'شارع الأميرات',
        lat: 33.3128, lng: 44.3402, space: 600, frontage: 20, finish: 'أرض فضاء',
        price: 1200000, currency: 'USD', ownerName: 'شركة الرافدين للاستثمار', ownerPhone: '07801112233',
        exclusive: true, features: ['واجهة شارع رئيسي', 'طابو صرف'],
        notes: 'مناسبة لبناء مجمع تجاري — دراسة الجدوى متوفرة عند الإدارة.', createdAt: now - 22 * days
      }),
      prop({
        id: 'p-4', code: 'ع-1004', title: 'محل تجاري 45 م² — شارع فلسطين',
        type: 'shop', purpose: 'rent', gov: 'baghdad', area: 'الشعب', address: 'شارع فلسطين قرب تقاطع المثنى',
        lat: 33.3591, lng: 44.4222, space: 45, frontage: 5, finish: 'جيد',
        price: 1500000, currency: 'IQD', rentPeriod: 'monthly', ownerName: 'حيدر الربيعي', ownerPhone: '07709998877',
        features: ['واجهة شارع رئيسي', 'قرب سوق'], status: 'available', createdAt: now - 5 * days
      }),
      prop({
        id: 'p-5', code: 'ع-1005', title: 'دار 200 م² — النجف، حي السلام',
        type: 'house', purpose: 'sale', gov: 'najaf', area: 'حي السلام', address: 'قرب جامع الرحمن',
        lat: 31.9954, lng: 44.3266, space: 200, rooms: 4, baths: 2, floors: 1, age: 12,
        finish: 'جيد', price: 135000, currency: 'USD', ownerName: 'أم علي', ownerPhone: '07801234000',
        status: 'reserved', features: ['كراج سيارة', 'مشتمل'], createdAt: now - 30 * days
      }),
      prop({
        id: 'p-6', code: 'ع-1006', title: 'عمارة 8 شقق — البصرة، العشار',
        type: 'building', purpose: 'investment', gov: 'basra', area: 'العشار', address: 'شارع الكورنيش',
        lat: 30.5258, lng: 47.8134, space: 420, rooms: 24, baths: 10, floors: 4, age: 6,
        finish: 'ديلوكس', price: 980000, currency: 'USD', ownerName: 'مكتب الخليج', ownerPhone: '07700001122',
        exclusive: true, features: ['مصعد', 'مولدة خاصة', 'سيستم حماية'],
        notes: 'مؤجّرة بالكامل، مردود سنوي تقريبي ٨٪.', createdAt: now - 40 * days
      }),
      prop({
        id: 'p-7', code: 'ع-1007', title: 'شقة مفروشة للإيجار — أربيل، عنكاوا',
        type: 'apartment', purpose: 'rent', gov: 'erbil', area: 'عنكاوا', address: 'مجمع إيمبريال',
        lat: 36.2334, lng: 43.9944, space: 120, rooms: 2, baths: 2, floorNo: 3,
        finish: 'سوبر ديلوكس', furnished: true, price: 900, currency: 'USD', rentPeriod: 'monthly',
        ownerName: 'رامي يوسف', ownerPhone: '07504445566',
        features: ['مفروش', 'مصعد', 'مسبح', 'تكييف مركزي'], createdAt: now - 3 * days
      }),
      prop({
        id: 'p-8', code: 'ع-1008', title: 'بستان 2 دونم — كربلاء، طريق الحسينية',
        type: 'farm', purpose: 'sale', gov: 'karbala', area: 'العباسية', address: 'طريق الحسينية كم 7',
        lat: 32.6511, lng: 44.0322, space: 5000, finish: 'أرض فضاء',
        price: 260000, currency: 'USD', ownerName: 'جبار الكربلائي', ownerPhone: '07811122334',
        features: ['حديقة', 'خزان ماء'], createdAt: now - 16 * days
      })
    ];

    function offer(o) {
      return Object.assign({
        id: id('o'), code: '', propertyId: '', title: '', kind: 'sale',
        price: 0, currency: 'USD', downPayment: 0, installCount: 0, installAmount: 0, installPeriod: 'شهري',
        commissionPct: 2, marketer: 'المكتب', channel: 'مباشر',
        validUntil: 0, status: 'active', highlights: [], notes: '',
        views: 0, featured: false, createdAt: now, updatedAt: now
      }, o);
    }

    var offers = [
      offer({
        id: 'o-1', code: 'ض-2001', propertyId: 'p-1', title: 'دار زيونة — فرصة بيع سريع',
        kind: 'sale', price: 450000, currency: 'USD', commissionPct: 2, validUntil: now + 25 * days,
        highlights: ['تفاوض حتى ٤٣٠ ألف', 'تسليم فوري', 'طابو جاهز'], featured: true, views: 148,
        createdAt: now - 12 * days
      }),
      offer({
        id: 'o-2', code: 'ض-2002', propertyId: 'p-2', title: 'شقة النخيل — بالتقسيط',
        kind: 'sale', price: 175000, currency: 'USD', downPayment: 60000, installCount: 24, installAmount: 4800,
        installPeriod: 'شهري', commissionPct: 2, validUntil: now + 40 * days,
        highlights: ['دفعة أولى ٦٠ ألف', 'تقسيط ٢٤ شهر', 'مفروشة بالكامل'], featured: true, views: 96,
        createdAt: now - 9 * days
      }),
      offer({
        id: 'o-3', code: 'ض-2003', propertyId: 'p-3', title: 'أرض المنصور — شراكة استثمارية',
        kind: 'investment', price: 1200000, currency: 'USD', commissionPct: 1.5, validUntil: now + 60 * days,
        highlights: ['حصص تبدأ من ٥٠ ألف', 'عائد متوقع ١٨٪ خلال سنتين'], views: 212, createdAt: now - 22 * days
      }),
      offer({
        id: 'o-4', code: 'ض-2004', propertyId: 'p-4', title: 'محل شارع فلسطين — إيجار شهري',
        kind: 'rent', price: 1500000, currency: 'IQD', commissionPct: 100, validUntil: now + 15 * days,
        highlights: ['العمولة إيجار شهر واحد', 'استلام فوري'], views: 63, createdAt: now - 5 * days
      }),
      offer({
        id: 'o-5', code: 'ض-2005', propertyId: 'p-5', title: 'دار النجف — محجوزة بعربون',
        kind: 'sale', price: 135000, currency: 'USD', commissionPct: 2, status: 'reserved',
        validUntil: now + 10 * days, highlights: ['عربون ٥٠٠٠ دولار مستلم'], views: 74, createdAt: now - 30 * days
      }),
      offer({
        id: 'o-6', code: 'ض-2006', propertyId: 'p-7', title: 'شقة عنكاوا المفروشة — إيجار شهري',
        kind: 'rent', price: 900, currency: 'USD', commissionPct: 50, validUntil: now + 20 * days,
        highlights: ['مفروشة بالكامل', 'خدمات المجمع مشمولة'], views: 41, createdAt: now - 3 * days
      }),
      offer({
        id: 'o-7', code: 'ض-2007', propertyId: 'p-6', title: 'عمارة العشار — دخل إيجاري جاهز',
        kind: 'investment', price: 980000, currency: 'USD', commissionPct: 1.5, validUntil: now + 45 * days,
        highlights: ['مؤجّرة ١٠٠٪', 'مردود ٨٪ سنوياً'], featured: true, views: 187, createdAt: now - 40 * days
      })
    ];

    var packages = [
      {
        id: 'k-1', code: 'بكج-01', name: 'بكج شقق بغداد بالتقسيط',
        offerIds: ['o-2'], audience: 'الموظفون وأصحاب الدخل الثابت',
        price: 0, currency: 'USD', discountPct: 3, validUntil: now + 30 * days,
        notes: 'خصم ٣٪ عند الدفع النقدي الكامل خلال مدة البكج.', status: 'active', createdAt: now - 8 * days
      },
      {
        id: 'k-2', code: 'بكج-02', name: 'بكج الفرص الاستثمارية',
        offerIds: ['o-3', 'o-7'], audience: 'المستثمرون وأصحاب رؤوس الأموال',
        price: 0, currency: 'USD', discountPct: 0, validUntil: now + 60 * days,
        notes: 'يشمل دراسة جدوى مبدئية وزيارة ميدانية مع مختص.', status: 'active', createdAt: now - 20 * days
      }
    ];

    var boxes = [
      { id: 'b-1', name: 'قاصة المكتب (نقد)', kind: 'cash', currency: 'IQD', openingBalance: 5000000, createdAt: now - 90 * days },
      { id: 'b-2', name: 'قاصة الدولار', kind: 'cash', currency: 'USD', openingBalance: 12000, createdAt: now - 90 * days },
      { id: 'b-3', name: 'حساب المصرف', kind: 'bank', currency: 'IQD', openingBalance: 25000000, createdAt: now - 90 * days }
    ];

    var entries = [
      { id: 'c-1', boxId: 'b-2', direction: 'in', amount: 9000, currency: 'USD', category: 'عمولة بيع', party: 'سيف عبدالله', method: 'نقد', refType: 'offer', refId: 'o-2', receiptNo: 'و-101', note: 'عمولة بيع شقة النخيل', date: now - 6 * days, createdAt: now - 6 * days },
      { id: 'c-2', boxId: 'b-2', direction: 'in', amount: 5000, currency: 'USD', category: 'عربون حجز', party: 'أم علي', method: 'نقد', refType: 'offer', refId: 'o-5', receiptNo: 'و-102', note: 'عربون حجز دار النجف', date: now - 4 * days, createdAt: now - 4 * days },
      { id: 'c-3', boxId: 'b-1', direction: 'out', amount: 1200000, currency: 'IQD', category: 'دعاية وإعلان', party: 'شركة إعلانات', method: 'نقد', refType: '', refId: '', receiptNo: 'ص-55', note: 'حملة تسويق شهر', date: now - 3 * days, createdAt: now - 3 * days },
      { id: 'c-4', boxId: 'b-3', direction: 'in', amount: 50000000, currency: 'IQD', category: 'رأس مال مستثمر', party: 'علاء الحسيني', method: 'حوالة مصرفية', refType: 'investor', refId: 'i-1', receiptNo: 'و-103', note: 'حصة رأس مال', date: now - 25 * days, createdAt: now - 25 * days },
      { id: 'c-5', boxId: 'b-1', direction: 'out', amount: 3000000, currency: 'IQD', category: 'رواتب', party: 'موظفو المكتب', method: 'نقد', refType: '', refId: '', receiptNo: 'ص-56', note: 'رواتب الشهر', date: now - 2 * days, createdAt: now - 2 * days }
    ];

    var investors = [
      { id: 'i-1', name: 'علاء الحسيني', phone: '07901110000', capital: 50000000, currency: 'IQD', sharePct: 35, joinedAt: now - 25 * days, status: 'active', notes: 'يفضّل المشاريع السكنية في بغداد.', createdAt: now - 25 * days },
      { id: 'i-2', name: 'شركة المدى للاستثمار', phone: '07805556666', capital: 120000, currency: 'USD', sharePct: 45, joinedAt: now - 70 * days, status: 'active', notes: 'مهتمة بالأراضي التجارية.', createdAt: now - 70 * days },
      { id: 'i-3', name: 'نور الدين كريم', phone: '07712223333', capital: 30000, currency: 'USD', sharePct: 20, joinedAt: now - 50 * days, status: 'active', notes: '', createdAt: now - 50 * days }
    ];

    var clients = [
      { id: 'cl-1', name: 'محمد الساعدي', phone: '07701234567', source: 'الموقع', status: 'following', wantType: 'apartment', wantPurpose: 'sale', wantGov: 'baghdad', budgetMax: 200000, currency: 'USD', spaceMin: 140, note: 'يريد شقة قريبة من الكرادة', createdAt: now - 4 * days },
      { id: 'cl-2', name: 'زينب عبد الرزاق', phone: '07811119999', source: 'فيسبوك', status: 'new', wantType: 'house', wantPurpose: 'sale', wantGov: 'najaf', budgetMax: 150000, currency: 'USD', spaceMin: 180, note: '', createdAt: now - 1 * days },
      { id: 'cl-3', name: 'مكتب الأمين', phone: '07500001111', source: 'إحالة', status: 'deal', wantType: 'land', wantPurpose: 'investment', wantGov: 'baghdad', budgetMax: 1500000, currency: 'USD', spaceMin: 500, note: 'مشترٍ جاد لأرض المنصور', createdAt: now - 18 * days }
    ];

    return {
      meta: { version: 1, createdAt: now, seeded: true },
      settings: {
        company: 'أساس للاستثمار العقاري',
        slogan: 'عقار بموقعه… واستثمار بأرقامه',
        phone: '07901234567',
        whatsapp: '07901234567',
        address: 'بغداد — زيونة، شارع الربيعي',
        email: 'info@asas-realestate.iq',
        mainCurrency: 'USD',
        usdRate: 1320,
        defaultCommission: 2,
        nextPropertyNo: 1009,
        nextOfferNo: 2008,
        nextPackageNo: 3,
        nextReceiptNo: 104
      },
      properties: props,
      offers: offers,
      packages: packages,
      boxes: boxes,
      cash: entries,
      investors: investors,
      clients: clients
    };
  }

  /* ---------- التحميل والحفظ ---------- */

  var db = null;
  var subs = [];

  function load() {
    if (db) return db;
    try {
      var raw = localStorage.getItem(KEY);
      db = raw ? JSON.parse(raw) : seed();
    } catch (e) {
      db = seed();
    }
    /* ضمان وجود كل المفاتيح بعد أي ترقية */
    var base = { properties: [], offers: [], packages: [], boxes: [], cash: [], investors: [], clients: [] };
    Object.keys(base).forEach(function (k) { if (!Array.isArray(db[k])) db[k] = base[k]; });
    if (!db.settings) db.settings = seed().settings;
    return db;
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(db));
    } catch (e) {
      if (window.AS.ui) window.AS.ui.toast('امتلأت مساحة التخزين في المتصفح — صدّر نسخة احتياطية ثم احذف وسائط قديمة', 'err');
    }
    subs.forEach(function (fn) { try { fn(db); } catch (e) {} });
  }

  function subscribe(fn) { subs.push(fn); return function () { subs = subs.filter(function (f) { return f !== fn; }); }; }

  function reset() {
    db = seed();
    save();
  }

  function clearAll() {
    db = seed();
    db.properties = []; db.offers = []; db.packages = []; db.cash = []; db.investors = []; db.clients = [];
    db.meta.seeded = false;
    save();
  }

  function exportJSON() {
    return JSON.stringify(db, null, 2);
  }

  function importJSON(text) {
    var next = JSON.parse(text);
    if (!next || typeof next !== 'object' || !Array.isArray(next.properties)) throw new Error('ملف غير صالح');
    db = next;
    load();
    save();
  }

  /* ---------- ترقيم تلقائي ---------- */

  function nextCode(kind) {
    var s = db.settings;
    if (kind === 'property') return 'ع-' + (s.nextPropertyNo++);
    if (kind === 'offer') return 'ض-' + (s.nextOfferNo++);
    if (kind === 'package') return 'بكج-' + ('0' + (s.nextPackageNo++)).slice(-2);
    return 'و-' + (s.nextReceiptNo++);
  }

  /* ---------- عمليات الكيانات ---------- */

  function upsert(collection, item) {
    var list = db[collection];
    var now = Date.now();
    if (item.id) {
      var found = byId(list, item.id);
      if (found) {
        Object.assign(found, item, { updatedAt: now });
        save();
        return found;
      }
    }
    item.id = item.id || id(collection.slice(0, 2));
    item.createdAt = item.createdAt || now;
    item.updatedAt = now;
    list.unshift(item);
    save();
    return item;
  }

  function remove(collection, itemId) {
    db[collection] = db[collection].filter(function (x) { return x.id !== itemId; });
    save();
  }

  function property(pid) { return byId(db.properties, pid); }
  function offer(oid) { return byId(db.offers, oid); }

  /** العروض مع بيانات عقارها — الأساس لكل شاشات البحث */
  function offersView() {
    return db.offers.map(function (o) {
      var p = property(o.propertyId) || {};
      return {
        offer: o,
        prop: p,
        title: o.title || p.title || '',
        gov: p.gov || '',
        area: p.area || '',
        type: p.type || '',
        space: p.space || 0,
        rooms: p.rooms || 0,
        price: o.price || p.price || 0,
        currency: o.currency || p.currency || 'USD',
        cover: coverOf(p),
        haystack: [
          o.code, o.title, (o.highlights || []).join(' '), o.notes, o.marketer,
          p.code, p.title, p.address, p.area, govName(p.gov), typeName(p.type),
          p.ownerName, p.ownerPhone, p.notes, (p.features || []).join(' ')
        ].join(' ').toLowerCase()
      };
    });
  }

  function coverOf(p) {
    var m = (p && p.media) || [];
    for (var i = 0; i < m.length; i++) if (m[i].cover && m[i].kind === 'image') return m[i];
    for (var j = 0; j < m.length; j++) if (m[j].kind === 'image') return m[j];
    return null;
  }

  function hasVideo(p) {
    return ((p && p.media) || []).some(function (m) { return m.kind === 'video'; });
  }

  /* ---------- حسابات مالية ---------- */

  function toMain(amount, currency) {
    var s = db.settings;
    if (currency === s.mainCurrency) return amount;
    if (s.mainCurrency === 'USD') return amount / (s.usdRate || 1320);
    return amount * (s.usdRate || 1320);
  }

  function boxBalance(boxId) {
    var box = byId(db.boxes, boxId);
    if (!box) return 0;
    return db.cash.reduce(function (sum, e) {
      /* كل قاصة بعملتها — لا تُخلط الحركات بعملة ثانية */
      if (e.boxId !== boxId || e.currency !== box.currency) return sum;
      return sum + (e.direction === 'in' ? e.amount : -e.amount);
    }, box.openingBalance || 0);
  }

  function cashTotals(filterFn) {
    var t = { in: 0, out: 0 };
    db.cash.forEach(function (e) {
      if (filterFn && !filterFn(e)) return;
      var v = toMain(e.amount, e.currency);
      if (e.direction === 'in') t.in += v; else t.out += v;
    });
    t.net = t.in - t.out;
    return t;
  }

  function investorPaid(investorId) {
    return db.cash.reduce(function (sum, e) {
      if (e.refType !== 'investor' || e.refId !== investorId) return sum;
      return sum + (e.direction === 'in' ? toMain(e.amount, e.currency) : -toMain(e.amount, e.currency));
    }, 0);
  }

  function investorProfit(investorId) {
    return db.cash.reduce(function (sum, e) {
      if (e.refType !== 'investor' || e.refId !== investorId) return sum;
      if (e.direction === 'out' && e.category === 'توزيع أرباح') return sum + toMain(e.amount, e.currency);
      return sum;
    }, 0);
  }

  /** مطابقة طلب زبون مع العروض المتاحة */
  function matchesFor(client) {
    return offersView().filter(function (v) {
      if (v.offer.status !== 'active') return false;
      if (client.wantType && v.type && v.type !== client.wantType) return false;
      if (client.wantPurpose && v.offer.kind !== client.wantPurpose) return false;
      if (client.wantGov && v.gov && v.gov !== client.wantGov) return false;
      if (client.budgetMax) {
        var price = toMain(v.price, v.currency);
        var budget = toMain(client.budgetMax, client.currency || 'USD');
        if (price > budget * 1.1) return false;
      }
      if (client.spaceMin && v.space && v.space < client.spaceMin * 0.9) return false;
      return true;
    });
  }

  window.AS.store = {
    GOVS: GOVS, TYPES: TYPES, PURPOSES: PURPOSES, PROP_STATUS: PROP_STATUS, OFFER_STATUS: OFFER_STATUS,
    FINISH: FINISH, FEATURES: FEATURES, CASH_CATS: CASH_CATS, CLIENT_STATUS: CLIENT_STATUS,
    load: load, save: save, subscribe: subscribe, reset: reset, clearAll: clearAll,
    exportJSON: exportJSON, importJSON: importJSON,
    id: id, byId: byId, nextCode: nextCode, upsert: upsert, remove: remove,
    govName: govName, typeName: typeName, typeIcon: typeIcon, purposeName: purposeName, statusOf: statusOf,
    property: property, offer: offer, offersView: offersView, coverOf: coverOf, hasVideo: hasVideo,
    toMain: toMain, boxBalance: boxBalance, cashTotals: cashTotals,
    investorPaid: investorPaid, investorProfit: investorProfit, matchesFor: matchesFor,
    get db() { return load(); }
  };

  load();
})();
