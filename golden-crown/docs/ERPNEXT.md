# دليل نظام ERPNext الشامل — من الصفر حتى ربط "التاج الذهبي"

> **الغرض من هذا المستند:** شرح كل ما يتعلق بنظام ERPNext — ما هو، كيف بُني،
> ماذا يحتوي، كيف يُنصَّب ويُشغَّل ويُخصَّص ويُؤمَّن — ثم ترجمة ذلك إلى خطة
> عملية لربط واجهات منصة **التاج الذهبي** (المجلد `golden-crown/`) بخادم
> ERPNext حقيقي بدلاً من `localStorage`، وهو البند الأول في قائمة "بنود
> مؤجَّلة" في `golden-crown/README.md`.
>
> **لمن هذا المستند:** المطوّر الذي سينفّذ الربط، ومسؤول التشغيل الذي سيدير
> الخادم، وصاحب القرار الذي يريد فهم ما الذي يشتريه ويتحمّله.
>
> **ملاحظة عن الإصدارات:** ERPNext مشروع حي يصدر نسخة رئيسية سنوياً تقريباً.
> الأمثلة هنا مكتوبة على أساس خط الإصدار **v15** (مع Frappe Framework v15)
> وهو الأوسع انتشاراً وقت كتابة المستند. تحقق دائماً من نسختك الفعلية بـ
> `bench version` وراجع التوثيق الرسمي قبل الاعتماد على تفصيلة دقيقة.

---

## فهرس المحتويات

| # | القسم | لماذا تقرأه |
|---|-------|-------------|
| [1](#1-ما-هو-erpnext) | ما هو ERPNext | فهم المنتج والفرق بينه وبين Frappe |
| [2](#2-المعمارية-التقنية) | المعمارية التقنية | ما الذي يعمل فعلياً على الخادم |
| [3](#3-المفاهيم-الأساسية) | المفاهيم الأساسية | Bench / Site / App / DocType — أهم قسم |
| [4](#4-موديولات-erpnext) | الموديولات | ما الذي يأتي جاهزاً في الصندوق |
| [5](#5-المحاسبة-بعمق) | المحاسبة بعمق | قلب النظام، ولازم لتوزيع الأرباح |
| [6](#6-موديول-الرعاية-الصحية-frappe-health) | الرعاية الصحية | الأقرب لطبيعة التاج الذهبي |
| [7](#7-الصلاحيات-والأمان) | الصلاحيات والأمان | حماية بيانات المرضى |
| [8](#8-الأتمتة-وسير-العمل) | الأتمتة وسير العمل | Workflow / Hooks / المهام المجدولة |
| [9](#9-واجهة-الـ-api) | واجهة الـ API | العمود الفقري للربط مع React |
| [10](#10-التقارير-ولوحات-المعلومات-وصيغ-الطباعة) | التقارير والطباعة | تقرير PDF عربي RTL |
| [11](#11-التعريب-والاتجاه-rtl) | التعريب و RTL | واجهة عربية كاملة |
| [12](#12-التخصيص-وبناء-تطبيق-خاص) | التخصيص | كيف تضيف ما ليس موجوداً |
| [13](#13-التنصيب-والتشغيل-والصيانة) | التنصيب والتشغيل | من التطوير حتى الإنتاج |
| [14](#14-خريطة-الربط-التاج-الذهبي--erpnext) | **خريطة الربط** | الجزء العملي لهذا المشروع |
| [15](#15-المحاذير-والأخطاء-الشائعة) | المحاذير | ما الذي يوجع لاحقاً |
| [16](#16-الترخيص-والتكلفة-والاستضافة) | الترخيص والتكلفة | القرار التجاري |
| [17](#17-مسرد-المصطلحات) | مسرد المصطلحات | مرجع سريع |
| [18](#18-مراجع-رسمية) | مراجع | روابط موثوقة |

---

## 1. ما هو ERPNext

**ERPNext** نظام تخطيط موارد مؤسسات (ERP) مفتوح المصدر بالكامل، مكتوب بلغة
Python، يغطي المحاسبة والمبيعات والمشتريات والمخازن والتصنيع والمشاريع
والعلاقات مع العملاء وغيرها. تطوّره وترعاه شركة **Frappe Technologies**
(الهند)، ومرخّص تحت **GPLv3** — أي أنه مجاني الاستخدام والتعديل والاستضافة
الذاتية، بشروط (انظر [القسم 16](#16-الترخيص-والتكلفة-والاستضافة)).

### 1.1 الفرق الجوهري: Frappe مقابل ERPNext

هذه أكثر نقطة يُساء فهمها، وهي مفتاح كل ما بعدها:

```
┌─────────────────────────────────────────────────────────┐
│  تطبيقاتك أنت (مثال: golden_crown)                      │  ← ما سنبنيه
├─────────────────────────────────────────────────────────┤
│  ERPNext        │  hrms   │  healthcare  │  payments    │  ← تطبيقات جاهزة
├─────────────────────────────────────────────────────────┤
│              Frappe Framework                            │  ← المنصة
│  (DocType, ORM, REST API, صلاحيات, واجهة Desk, jobs)     │
├─────────────────────────────────────────────────────────┤
│   Python / MariaDB / Redis / Node.js / Nginx             │  ← البنية
└─────────────────────────────────────────────────────────┘
```

- **Frappe Framework** = منصة تطوير تطبيقات ويب كاملة (شبيهة بـ Django لكن
  «meta-driven»: تعرّف نماذج البيانات من الواجهة لا بالكود فقط). تعطيك مجاناً:
  قاعدة بيانات، ORM، واجهة إدارية جاهزة (Desk)، نظام صلاحيات، REST API تلقائي،
  مهام خلفية، بريد، تقارير، طباعة PDF، ترجمة، سجل تدقيق.
- **ERPNext** = تطبيق (app) واحد يعمل *فوق* Frappe، يضيف منطق الأعمال:
  الفواتير، القيود، المخزون، أوامر التصنيع… إلخ.

**النتيجة العملية للمشروع:** لسنا مضطرين لاستخدام موديولات ERPNext كما هي.
يمكننا الاستفادة من Frappe كـ Backend-as-a-Framework (DocTypes + API + صلاحيات)
واستخدام موديول المحاسبة من ERPNext فقط حيث يلزم. هذا خيار معماري مهم سنعود
إليه في [القسم 14](#14-خريطة-الربط-التاج-الذهبي--erpnext).

### 1.2 متى يكون ERPNext الخيار الصحيح

| يناسبك إذا… | لا يناسبك إذا… |
|---|---|
| تحتاج محاسبة/فوترة حقيقية بقيود مزدوجة | تحتاج API خفيف جداً بلا منطق أعمال |
| تريد لوحة إدارة جاهزة بلا بنائها من الصفر | فريقك لا يعرف Python إطلاقاً ولا نية للتعلّم |
| تريد صلاحيات وأدوار وسجل تدقيق جاهزة | تحتاج زمن استجابة بالميلي ثانية (real-time trading) |
| تريد استضافة ذاتية وملكية كاملة للبيانات | تريد نظاماً «بلا خادم» أو صفر صيانة |
| ستوسّع لاحقاً (موارد بشرية، مخزون، مشتريات) | نطاقك ثابت وصغير جداً ولن يكبر |

بالنسبة للتاج الذهبي: النظام **مناسب**، لأن المطلوب فيه فوترة، توزيع أرباح بين
طبيب/عيادة/منصة، أدوار متعددة (مريض/طبيب/مشرف/إدارة)، سجل تدقيق طبي، ولوحة
إدارة — وكل ذلك جاهز أو شبه جاهز.

---

## 2. المعمارية التقنية

### 2.1 المكوّنات التي تعمل على الخادم

| المكوّن | الدور | ملاحظات تشغيلية |
|---|---|---|
| **Python (Werkzeug/Gunicorn)** | خادم الويب وتنفيذ منطق التطبيق | عدد العمّال (workers) يُضبط حسب المعالجات |
| **MariaDB** (أو PostgreSQL) | قاعدة البيانات | MariaDB هو المسار المدعوم رسمياً؛ PostgreSQL أقل نضجاً |
| **Redis** (٣ نسخ منفصلة) | كاش + طابور مهام + قنوات socket.io | `redis_cache`, `redis_queue`, `redis_socketio` |
| **Node.js + socket.io** | التحديثات الفورية (real-time) والإشعارات | يعمل على منفذ 9000 افتراضياً |
| **RQ workers** | تنفيذ المهام الخلفية | طوابير: `short` / `default` / `long` |
| **Scheduler** | المهام المجدولة (يومي/ساعي/cron) | إن توقف، تتوقف كل الأتمتة الزمنية بصمت |
| **Nginx** | بوابة عكسية + الملفات الثابتة + SSL | يُولَّد تلقائياً بـ `bench setup nginx` |
| **Supervisor** (أو systemd) | إبقاء العمليات حيّة | يُولَّد بـ `bench setup supervisor` |
| **wkhtmltopdf / Chromium** | توليد PDF من HTML | مهم جداً لتقرير الاستشارة العربي |

### 2.2 تدفّق الطلب

```
متصفح المريض (React)
   │  HTTPS
   ▼
 Nginx  ──► ملف ثابت؟ يُخدَم مباشرة
   │
   ▼ (طلب /api/…)
Gunicorn → Frappe: مصادقة → صلاحيات → DocType controller → MariaDB
   │
   ├─► مهمة ثقيلة؟ ──► Redis Queue ──► RQ Worker (بالخلفية)
   └─► إشعار فوري؟ ──► Redis ──► socket.io ──► المتصفح
```

القاعدة العملية: **كل شيء يستغرق أكثر من ثانية يجب أن يذهب لطابور خلفي**
(`frappe.enqueue`)، وإلا ستحجب عامل ويب كاملاً وتُبطئ كل المستخدمين.

### 2.3 التعددية (Multi-tenancy)

Frappe يدعم عدة «مواقع» (sites) على نفس الخادم، كل موقع بقاعدة بيانات مستقلة
تماماً وملفات مستقلة:

```
frappe-bench/
├── apps/            # الكود: frappe, erpnext, golden_crown …
├── sites/
│   ├── common_site_config.json   # إعدادات مشتركة (redis, db host …)
│   ├── goldencrown.iq/
│   │   ├── site_config.json      # كلمة سر قاعدة البيانات، مفاتيح، حدود
│   │   ├── private/files/        # ملفات لا تُخدَم إلا بصلاحية ← صور الأسنان
│   │   └── public/files/         # ملفات عامة ← الشعارات
│   └── staging.goldencrown.iq/
├── config/          # nginx / supervisor / redis
├── logs/
└── env/             # بيئة Python الافتراضية
```

**نقطة أمنية حرجة للمشروع:** صور المرضى **يجب** أن تكون في `private/files`
وليس `public/files`، لأن الأخير يُخدَم لأي شخص يملك الرابط بلا أي تحقق.

---

## 3. المفاهيم الأساسية

### 3.1 Bench

`bench` هو أداة سطر الأوامر التي تدير كل شيء: إنشاء المواقع، تنصيب التطبيقات،
التحديث، النسخ الاحتياطي، تشغيل الخادم.

```bash
bench new-site goldencrown.local            # موقع جديد
bench get-app erpnext --branch version-15   # تنزيل تطبيق
bench --site goldencrown.local install-app erpnext
bench start                                 # تشغيل التطوير (كل العمليات)
bench --site goldencrown.local migrate      # تطبيق تغييرات المخطط
bench --site goldencrown.local console      # صدفة Python تفاعلية
bench --site goldencrown.local backup --with-files
bench build                                 # بناء أصول الواجهة (JS/CSS)
```

### 3.2 Site (الموقع)

وحدة العزل: قاعدة بيانات + ملفات + إعدادات. مثالياً:
- `goldencrown.local` للتطوير على جهازك،
- `staging.goldencrown.iq` للاختبار والمراجعة مع العميل،
- `goldencrown.iq` للإنتاج.

### 3.3 App (التطبيق)

مجلد Python قياسي يحوي DocTypes وكوداً و`hooks.py`. **قاعدة ذهبية: لا تعدّل
كود `frappe` أو `erpnext` مباشرة أبداً.** أي تعديل تفقده عند أول `bench update`.
كل تخصيصاتك تعيش في تطبيقك الخاص (`golden_crown`).

### 3.4 DocType — أهم مفهوم في النظام كله

الـ **DocType** هو تعريف نموذج بيانات. عندما تنشئ DocType باسم
`Consultation`، يقوم Frappe تلقائياً بـ:

1. إنشاء جدول `tabConsultation` في MariaDB،
2. توليد نموذج إدخال وقائمة وفلاتر في واجهة Desk،
3. فتح REST API كامل على `/api/resource/Consultation`،
4. ربطه بنظام الصلاحيات والتقارير والطباعة وسجل التغييرات.

بلا سطر كود واحد. هذه هي القيمة الحقيقية للمنصة.

#### الحقول المعيارية الموجودة في كل مستند

| الحقل | المعنى |
|---|---|
| `name` | المفتاح الأساسي (نص، وليس رقماً تسلسلياً بالضرورة) |
| `owner` | من أنشأ المستند |
| `creation` / `modified` | وقت الإنشاء / آخر تعديل |
| `modified_by` | آخر من عدّل |
| `docstatus` | `0` مسودة، `1` مُعتمَد (submitted)، `2` ملغى |
| `idx` | ترتيب السطر (في الجداول الفرعية) |
| `parent` / `parenttype` / `parentfield` | ربط السطر بمستنده الأب |

#### أهم أنواع الحقول

| النوع | الاستخدام |
|---|---|
| `Data` / `Small Text` / `Text` / `Text Editor` | نصوص بأطوال مختلفة |
| `Int` / `Float` / `Currency` / `Percent` | أرقام (استخدم `Currency` للمبالغ دائماً) |
| `Select` | قائمة قيم ثابتة مفصولة بأسطر |
| `Link` | ربط بمستند من DocType آخر (مفتاح خارجي) |
| `Dynamic Link` | ربط بـ DocType يُحدَّد وقت التشغيل |
| `Table` | جدول فرعي (سطور داخل المستند) |
| `Check` | صح/خطأ (0/1) |
| `Date` / `Datetime` / `Time` | تواريخ وأوقات |
| `Attach` / `Attach Image` | ملف مرفق |
| `Password` | يُخزَّن مشفَّراً ولا يعود في الـ API |
| `Code` / `JSON` | كود أو بيانات منظّمة |
| `Geolocation` | خرائط وإحداثيات |

#### خصائص مهمة على مستوى الـ DocType

- **`is_submittable`**: يفعّل دورة مسودة ← اعتماد ← إلغاء. المستند المعتمد
  لا يمكن تعديل حقوله (إلا ما وُسِم `allow_on_submit`). هذا هو ما يجعل الفواتير
  والقيود موثوقة محاسبياً.
- **`is_single`**: مستند واحد فقط للنظام كله — مثالي لصفحات الإعدادات
  (كإعدادات التاج الذهبي: الرسم، حد التصعيد، نسبة الخصم…).
- **`is_child_table`**: يُستخدم داخل حقل `Table` فقط.
- **`is_tree`**: بنية شجرية (مثل شجرة الحسابات ومراكز الكلفة).
- **`track_changes`**: يسجّل كل تغيير في DocType اسمه `Version` — سجل تدقيق مجاني.
- **`track_seen` / `track_views`**: يسجّل من فتح المستند — مفيد جداً لتدقيق
  اطّلاع الأطباء على بيانات المرضى.

#### التسمية (Naming)

| الطريقة | مثال | ملاحظة |
|---|---|---|
| `naming_series` | `CS-.YYYY.-.####` ← `CS-2026-0042` | الأشيع والأوضح |
| `field:` | الاسم = قيمة حقل معيّن | مثل رقم هاتف المريض |
| `autoname: hash` | معرّف عشوائي | يخفي حجم الأعمال عن المنافسين |
| `prompt` | المستخدم يكتب الاسم | نادر |
| صيغة مركّبة | `{patient}-{creation}` | مرن |

> **توصية للمشروع:** استخدم `naming_series` للاستشارات (`CS-.YYYY.-.#####`)
> لأنها مقروءة ويسهل على موظف الدعم نطقها هاتفياً — وهو ما تفعله الواجهة
> الحالية أصلاً (`CS-1001`).

### 3.5 التحكّم بمنطق المستند (Controllers)

كل DocType يمكن أن يملك ملف Python فيه صنف يرث `Document`، ويستخدم دوال
دورة الحياة:

```python
# golden_crown/golden_crown/doctype/consultation/consultation.py
import frappe
from frappe.model.document import Document

class Consultation(Document):
    def validate(self):
        """يُنفَّذ قبل كل حفظ — مكان التحقق وحساب الحقول المشتقة."""
        self.urgent = self.compute_urgency()
        if self.pain_level and not (0 <= self.pain_level <= 10):
            frappe.throw("مستوى الألم يجب أن يكون بين 0 و 10")

    def before_insert(self):
        """قبل أول إدخال فقط."""

    def on_update(self):
        """بعد الحفظ بنجاح."""

    def on_submit(self):
        """عند الاعتماد (docstatus 0 → 1) — هنا تُنشأ القيود المالية."""

    def on_cancel(self):
        """عند الإلغاء (1 → 2) — هنا تُعكس القيود."""

    def compute_urgency(self):
        s = frappe.get_single("Golden Crown Settings")
        return int(
            (self.pain_level or 0) >= s.pain_threshold
            and (self.swelling or not s.require_swelling)
            and (self.fever or not s.require_fever)
        )
```

> لاحظ التطابق شبه الحرفي مع `computeUrgency` في
> `golden-crown/src/lib/engine.js` — المنطق ينتقل كما هو تقريباً، لكنه يصبح
> **غير قابل للتلاعب من المتصفح**، وهذه هي الفائدة الأمنية الأكبر من الربط.

---

## 4. موديولات ERPNext

ما يلي نظرة على ما يأتي جاهزاً. العمود الأخير يوضح صلته بمشروعنا.

| الموديول | يغطي | أهم الـ DocTypes | صلته بالتاج الذهبي |
|---|---|---|---|
| **Accounts** | القيود، الفواتير، المدفوعات، الضرائب | Sales Invoice, Purchase Invoice, Payment Entry, Journal Entry, Account, Cost Center | **أساسي** — رسم الاستشارة وتوزيع الأرباح |
| **Selling** | العملاء، عروض الأسعار، أوامر البيع | Customer, Quotation, Sales Order | جزئي — المريض كـ Customer |
| **Buying** | الموردون، أوامر الشراء | Supplier, Purchase Order | جزئي — الطبيب كـ Supplier عند صرف حصته |
| **Stock** | المخزون، الحركات، التسعير | Item, Stock Entry, Warehouse, Item Price | ضعيف — إلا لو بيع مستلزمات لاحقاً |
| **Manufacturing** | أوامر التصنيع وقوائم المواد | BOM, Work Order | غير مستخدم |
| **Projects** | المشاريع والمهام وتسجيل الوقت | Project, Task, Timesheet | اختياري لإدارة التطوير |
| **CRM** | العملاء المحتملون والفرص | Lead, Opportunity | مفيد لطلبات انضمام الأطباء والمختبرات |
| **Support** | تذاكر الدعم | Issue | مفيد لشكاوى المرضى |
| **Assets** | الأصول والإهلاك | Asset | غير مستخدم |
| **Quality** | إجراءات الجودة والمراجعات | Quality Inspection, Quality Review | يفيد لوحة المشرف (مراجعة جودة الردود) |
| **HR** (تطبيق `hrms` منفصل) | الموظفون، الرواتب، الإجازات | Employee, Salary Slip | لاحقاً عند توظيف طاقم |
| **Healthcare** (تطبيق `healthcare` منفصل) | المرضى، الأطباء، المواعيد، السجل الطبي | Patient, Healthcare Practitioner, Patient Appointment, Patient Encounter | **الأقرب** — انظر القسم 6 |
| **Payments** (تطبيق `payments` منفصل) | بوابات الدفع | Payment Gateway, Payment Request | نقطة الربط مع زين كاش/آسيا حوالة |
| **Website / Portal** | صفحات عامة وبوابة العميل | Web Page, Web Form, Blog Post | بديل جزئي، لكن واجهتنا React مستقلة |

> **انتبه:** منذ الإصدار v14 خرجت الموارد البشرية والرعاية الصحية والمدفوعات
> من ERPNext إلى تطبيقات مستقلة. تنصيبها يتم بأمر منفصل:
> `bench get-app healthcare && bench --site … install-app healthcare`.

---

## 5. المحاسبة بعمق

هذا القسم مهم لأن كل ما يتعلق بالمال في التاج الذهبي (رسم 5,000 د.ع،
70% للطبيب، 30% للمنصة، خصم 15% عند العيادة) سيمرّ من هنا.

### 5.1 البنية

- **Company**: الشركة/الكيان القانوني. يمكن تعدد الشركات في نفس الموقع.
- **Fiscal Year**: السنة المالية.
- **Chart of Accounts**: شجرة الحسابات (أصول، خصوم، حقوق ملكية، إيرادات، مصروفات).
- **Account**: حساب مفرد في الشجرة، له `root_type` و`account_type`.
- **Cost Center**: مركز كلفة لتقسيم النتائج (مثلاً: لكل محافظة).
- **Accounting Dimension**: بُعد تحليلي إضافي (مثلاً: لكل عيادة، لكل تخصص).

### 5.2 القيد المزدوج ودفتر الأستاذ

ERPNext لا يسمح بتعديل الأرصدة مباشرة. كل حركة مالية تنتج **GL Entry** (سطور
دفتر الأستاذ) تلقائياً عند **اعتماد** (submit) مستند، ويجب أن يتساوى المدين
مع الدائن دائماً. لهذا:

- لا تُنشئ `GL Entry` يدوياً عبر الـ API — أنشئ المستند المصدر واعتمده.
- لتصحيح خطأ: **ألغِ** (cancel) وأنشئ **بديلاً** (amend)، لا تحذف.

### 5.3 المستندات المالية الأساسية

| المستند | متى يُستخدم في مشروعنا |
|---|---|
| **Sales Invoice** | تحصيل رسم الاستشارة من المريض |
| **Payment Entry** | تسجيل استلام النقد فعلياً (زين كاش/آسيا حوالة) |
| **Purchase Invoice** | إثبات استحقاق حصة الطبيب (70%) كالتزام على المنصة |
| **Journal Entry** | التسويات وتوزيع الحصص عند عدم الحاجة لفاتورة كاملة |
| **Mode of Payment** | تعريف «زين كاش» و«آسيا حوالة» و«نقد» |
| **Item** | صنف خدمي واحد: «استشارة أسنان عن بُعد» |
| **Customer / Supplier** | المريض عميل، الطبيب/العيادة مورّد |

### 5.4 مثال: دورة حياة استشارة مدفوعة

```
1) المريض يدفع 5,000 د.ع
   └─ Sales Invoice (المريض) 5,000 ← اعتماد
      قيد:  مدين: مدينون 5,000 | دائن: إيراد استشارات 5,000
2) تأكيد التحصيل من بوابة الدفع
   └─ Payment Entry ضد الفاتورة
      قيد:  مدين: زين كاش 5,000 | دائن: مدينون 5,000
3) صرف الكود في العيادة ← استحقاق حصة الطبيب 3,500
   └─ Purchase Invoice (الطبيب) 3,500 ← اعتماد
      قيد:  مدين: كلفة استشارات 3,500 | دائن: دائنون 3,500
      المتبقّي 1,500 هو ربح المنصة (فرق تلقائي في قائمة الدخل)
4) دفع مستحقات الطبيب دورياً
   └─ Payment Entry
      قيد:  مدين: دائنون 3,500 | دائن: الصندوق/البنك 3,500
```

هذا بالضبط ما تحاكيه الآن دالة `redeemCode` في
`golden-crown/src/context/AppContext.jsx` عبر مصفوفة `transactions` وحقلي
`doctorShare` / `platformShare`، وما تعرضه صفحتا
`src/pages/admin/Finance.jsx` و `src/pages/doctor/Finance.jsx`.

### 5.5 نقاط انتباه محاسبية

- **العملة**: اضبط `IQD` كعملة الشركة، وانتبه لعدد المنازل العشرية (الدينار
  العراقي بلا كسور عملياً — اضبط `currency_precision`).
- **الضريبة**: إن وُجدت التزامات ضريبية، تُدار عبر `Sales Taxes and Charges
  Template`، لا بالحساب اليدوي في الواجهة.
- **الاستشارة المجانية**: لا تُنشئ لها فاتورة بقيمة صفر بلا داعٍ؛ إما فاتورة
  بخصم 100% (يبقي الأثر الإحصائي) أو لا فاتورة إطلاقاً مع تسجيلها في عدّاد
  `usedFreeCount`. القرار محاسبي — اسأل محاسب العميل.
- **الأرقام الحالية افتراضية**: الرسم 5,000 ونسبة 70/30 ونسبة الخصم 15% كلها
  «قيم معاينة» بحسب البند 11 في `README.md`، ويجب اعتمادها رسمياً قبل الإطلاق.

---

## 6. موديول الرعاية الصحية (Frappe Health)

تطبيق مستقل يضيف نموذج بيانات طبياً جاهزاً. يستحق الدراسة قبل بناء DocTypes
من الصفر.

| DocType | المعنى | المقابل في التاج الذهبي |
|---|---|---|
| **Patient** | المريض (مرتبط بـ Customer للفوترة) | `patients[]` |
| **Healthcare Practitioner** | الطبيب (مرتبط بـ Employee أو Supplier) | `doctors[]` |
| **Practitioner Schedule** | جدول أوقات دوام الطبيب | `doctor.hours[]` |
| **Healthcare Service Unit** | وحدة الخدمة (عيادة/غرفة) | `clinics[]` |
| **Patient Appointment** | موعد | حجز الموعد في `DoctorMatches.jsx` |
| **Patient Encounter** | زيارة/استشارة بتشخيص وخطة علاج | `consultations[]` + `opinion` |
| **Patient Medical Record** | السجل الطبي التراكمي | ملف المريض |
| **Vital Signs** | العلامات الحيوية | حرارة/تورّم (جزئياً) |
| **Fee Validity** | صلاحية مجانية للمراجعات ضمن مدة | نظام الاستشارات المجانية |
| **Clinical Procedure / Lab Test** | إجراءات وفحوصات | غير مستخدم حالياً |
| **Healthcare Settings** | إعدادات عامة (Single) | `settings` |

### 6.1 هل نستخدمه أم نبني DocTypes خاصة؟

| | استخدام `healthcare` | بناء DocTypes خاصة في `golden_crown` |
|---|---|---|
| السرعة الأولى | أسرع (نماذج جاهزة) | أبطأ |
| المطابقة للمواصفات | جزئية — مصمّم لعيادة حضورية لا لاستشارة عن بُعد | مطابقة 100% |
| الفوترة التلقائية | جاهزة ومربوطة | تحتاج ربطاً يدوياً |
| التعقيد الزائد | كبير (حقول ومسارات لا نحتاجها) | صفر |
| التحديثات المستقبلية | تتبع تحديثات التطبيق | تحت سيطرتنا |

**التوصية المتوازنة لهذا المشروع:**
استخدم `Patient` و`Healthcare Practitioner` و`Healthcare Service Unit` من
تطبيق `healthcare` (لأنها مربوطة أصلاً بالفوترة والسجل الطبي)، وابنِ
**DocTypes خاصة** لما هو فريد في المنصة: `Consultation`،
`Consultation Code`، `Consultation Payout`، `Golden Crown Settings`.
هذا يعطي أفضل نسبة «جاهز/مطابق».

> إن رأى الفريق أن تطبيق `healthcare` ثقيل على الحاجة، فالبديل المقبول هو
> بناء كل الـ DocTypes داخل `golden_crown` والاكتفاء بـ ERPNext للمحاسبة.
> القرار يجب أن يُتخذ **قبل** كتابة أي كود ربط، لأن التراجع عنه لاحقاً مكلف.

---

## 7. الصلاحيات والأمان

بيانات المرضى حسّاسة، وهذا القسم ليس اختيارياً.

### 7.1 طبقات الصلاحيات

1. **Role (الدور)**: مجموعة صلاحيات تُسنَد للمستخدم. أدوارنا المقترحة:
   `GC Patient`, `GC Doctor`, `GC Supervisor`, `GC Admin`, `GC Clinic Staff`.
2. **DocPerm**: لكل DocType، ماذا يستطيع كل دور: قراءة، كتابة، إنشاء، حذف،
   اعتماد، إلغاء، تعديل بعد الاعتماد، طباعة، تصدير، مشاركة، تقرير.
3. **Permission Level (0-9)**: صلاحية على **مستوى الحقل**. مثال: يرى الطبيب
   الإجابات الطبية (level 0) ولا يرى وسيلة الدفع (level 1).
4. **User Permission**: يقيّد مستخدماً بسجلات محدّدة — «هذا الطبيب لا يرى إلا
   الاستشارات المسندة إليه». **هذه أهم طبقة في مشروعنا.**
5. **`if_owner`**: يرى المستخدم ما أنشأه فقط — مثالية للمريض.
6. **Permission Query Conditions**: شرط SQL يُحقن في كل استعلام قائمة، لمنطق
   أعقد مما تسمح به الطبقات السابقة:

```python
# hooks.py
permission_query_conditions = {
    "Consultation": "golden_crown.permissions.consultation_query",
}

# golden_crown/permissions.py
def consultation_query(user):
    roles = frappe.get_roles(user)
    if "GC Admin" in roles or "GC Supervisor" in roles:
        return ""
    if "GC Doctor" in roles:
        pr = frappe.db.get_value("Healthcare Practitioner", {"user": user}, "name")
        return f"`tabConsultation`.doctor = {frappe.db.escape(pr)}"
    patient = frappe.db.get_value("Patient", {"user": user}, "name")
    return f"`tabConsultation`.patient = {frappe.db.escape(patient)}"
```

### 7.2 المصادقة

| الطريقة | الاستخدام المناسب |
|---|---|
| **جلسة بكوكيز** (`/api/method/login`) | واجهة Desk، وواجهة ويب على نفس النطاق |
| **API Key + Secret** (`Authorization: token key:secret`) | **تكامل خادم↔خادم فقط** |
| **OAuth 2 / Bearer Token** | تطبيقات طرف ثالث وتطبيقات الموبايل |
| **التحقق بخطوتين (2FA)** | إلزامي للإدارة والمشرفين |

> ⚠️ **تحذير حاسم:** لا تضع `api_key:api_secret` أبداً داخل تطبيق React —
> أي متصفح يستطيع قراءتها من حزمة JS. للمريض والطبيب استخدم **جلسة بكوكيز
> `HttpOnly`** أو **OAuth**، ولا شيء غير ذلك.

### 7.3 ممارسات أمنية إلزامية لهذا المشروع

- ✅ صور الأسنان في `private/files` مع فحص صلاحية عند كل تنزيل.
- ✅ HTTPS إجباري + `Strict-Transport-Security`.
- ✅ تفعيل `track_changes` و`track_views` على `Consultation` (سجل من اطّلع
  على ماذا ومتى) — هذا هو المقابل الحقيقي لمصفوفة `auditLog` الحالية.
- ✅ تحديد صلاحية المشرف على **رؤية** الردود لا على تعديل محتواها الطبي.
- ✅ تعطيل `server_script_enabled` في الإنتاج إن لم تكن هناك حاجة فعلية.
- ✅ تقييد معدّل الطلبات (Rate Limiting) على مسار إرسال OTP تحديداً، وإلا
  فهو باب مفتوح لاستنزاف رصيد الرسائل.
- ✅ سياسة احتفاظ بالبيانات وحق الحذف — بند مفتوح في المواصفات ويجب حسمه.
- ✅ نسخ احتياطية مشفّرة خارج الخادم، مع **اختبار استرجاع** دوري فعلي.

---

## 8. الأتمتة وسير العمل

### 8.1 Workflow (سير العمل)

DocType جاهز يتيح تعريف حالات وانتقالات بلا كود. مثال لحالة الاستشارة —
وهو انعكاس مباشر لـ `STATUS_MAP` في `golden-crown/src/lib/status.js`:

| الحالة | docstatus | من يستطيع الانتقال منها | إلى |
|---|---|---|---|
| مسودة (`draft`) | 0 | GC Patient | مستلمة |
| مستلمة (`new`) | 0 | النظام (بعد الدفع) | قيد المراجعة |
| قيد المراجعة (`in_review`) | 0 | GC Doctor | جاهزة |
| مُعاد توجيهها (`reassigned`) | 0 | GC Supervisor | قيد المراجعة |
| مُصعَّدة (`escalated`) | 0 | النظام / GC Supervisor | قيد المراجعة |
| جاهزة (`ready`) | 1 | — | (نهائية) |

### 8.2 Hooks

ملف `hooks.py` هو نقطة التمديد المركزية:

```python
app_name = "golden_crown"

doc_events = {
    "Consultation": {
        "validate": "golden_crown.consultation.validate",
        "on_submit": "golden_crown.consultation.on_ready",
    },
    "Payment Entry": {
        "on_submit": "golden_crown.billing.on_payment_received",
    },
}

scheduler_events = {
    "hourly": [
        "golden_crown.tasks.escalate_overdue_consultations",
    ],
    "daily": [
        "golden_crown.tasks.expire_stale_codes",
        "golden_crown.tasks.send_doctor_payout_summary",
    ],
    "cron": {
        "*/15 * * * *": ["golden_crown.tasks.retry_failed_payments"],
    },
}

fixtures = ["Custom Field", "Property Setter", "Role", "Workflow"]
```

### 8.3 المهام الخلفية

```python
frappe.enqueue(
    "golden_crown.tasks.generate_report_pdf",
    queue="long",          # short / default / long
    timeout=600,
    consultation="CS-2026-0042",
)
```

مثال عملي مباشر من المواصفات: **التصعيد التلقائي عند تأخر رد الطبيب** عن
`doctorResponseHours` (24 ساعة افتراضياً) — مهمة ساعية تبحث عن الاستشارات
المتأخرة وتعيد توجيهها وتُعلم المشرف. حالياً هذا غير ممكن في النسخة المحلية
لأنها بلا خادم.

### 8.4 الإشعارات والـ Webhooks

- **Notification**: إشعار بالبريد/داخل النظام عند شرط معيّن.
- **Webhook**: يرسل طلب HTTP لخدمة خارجية عند حدث — مثلاً إرسال SMS للمريض
  عند جاهزية التقرير، عبر مزوّد رسائل عراقي.
- **Email / SMS Settings**: إعدادات مركزية للمزوّدين.

---

## 9. واجهة الـ API

هذا هو القسم الذي سيستخدمه مطوّر React يومياً.

### 9.1 المصادقة

```http
POST /api/method/login
Content-Type: application/json

{ "usr": "user@example.com", "pwd": "••••••" }
```
تُرجِع كوكيز جلسة (`sid`). أرسل بعدها كل الطلبات بـ `credentials: "include"`.

```http
GET /api/resource/Consultation
Authorization: token 8f2b1c…:4e7a9d…      ← خادم↔خادم فقط، لا في المتصفح
```

### 9.2 عمليات CRUD

| العملية | الطلب |
|---|---|
| قائمة | `GET /api/resource/Consultation?fields=["name","status"]&limit_page_length=20` |
| مستند واحد | `GET /api/resource/Consultation/CS-2026-0042` |
| إنشاء | `POST /api/resource/Consultation` + JSON في الجسم |
| تعديل | `PUT /api/resource/Consultation/CS-2026-0042` |
| حذف | `DELETE /api/resource/Consultation/CS-2026-0042` |
| عدّ | `GET /api/method/frappe.client.get_count?doctype=Consultation` |

### 9.3 الفلاتر والترتيب والصفحات

```
GET /api/resource/Consultation
  ?filters=[["status","=","in_review"],["urgent","=",1]]
  &fields=["name","patient","doctor","creation"]
  &order_by=creation desc
  &limit_start=0
  &limit_page_length=20
```

المعاملات المدعومة تشمل: `=`, `!=`, `>`, `<`, `>=`, `<=`, `like`, `not like`,
`in`, `not in`, `between`, `is` (`set` / `not set`).

> **تنبيه أداء:** `limit_page_length=0` تعني «كل السجلات». لا تستخدمها على
> جدول ينمو. الافتراضي 20، والحد الأقصى الآمن عملياً بضع مئات.

### 9.4 استدعاء دوال مخصّصة

كل ما يتجاوز CRUD البسيط يجب أن يكون دالة على الخادم:

```python
# golden_crown/api.py
import frappe

@frappe.whitelist()
def submit_consultation(consultation: str, payment_method: str):
    """يدفع، يولّد الكود، يوجّه للطبيب — كل ذلك في معاملة واحدة على الخادم."""
    doc = frappe.get_doc("Consultation", consultation)
    doc.check_permission("write")
    ...
    return {"code": doc.code, "doctor": doc.doctor}

@frappe.whitelist(allow_guest=True)
def request_otp(phone: str):
    """متاحة بلا تسجيل دخول — احمها بتقييد المعدّل!"""
    ...
```

الاستدعاء: `POST /api/method/golden_crown.api.submit_consultation`

قواعد ذهبية:
- بلا `@frappe.whitelist()` لا يمكن استدعاء الدالة من الويب إطلاقاً (وهذا جيد).
- `allow_guest=True` تفتح الدالة للعالم كله — استخدمها بأضيق نطاق ممكن.
- **لا تثق أبداً** بأي قيمة قادمة من العميل: تحقق من الصلاحية داخل الدالة.
- تجنّب `ignore_permissions=True` إلا بفهم كامل لما تتجاوزه.

### 9.5 رفع الملفات (صور الأسنان)

```http
POST /api/method/upload_file
Content-Type: multipart/form-data

file=<binary>
doctype=Consultation
docname=CS-2026-0042
is_private=1          ← إلزامي لصور المرضى
```

### 9.6 الأخطاء

| الرمز | المعنى | التعامل في الواجهة |
|---|---|---|
| 200 | نجاح | — |
| 401 | غير مصادَق | أعد التوجيه لشاشة الدخول |
| 403 | مصادَق لكن ممنوع | رسالة «لا تملك صلاحية» |
| 404 | غير موجود | صفحة غير موجود |
| 409 | تعارض تعديل متزامن | أعد تحميل المستند |
| 417 | فشل تحقق (`frappe.throw`) | اعرض نص الرسالة للمستخدم |
| 429 | تجاوز حد الطلبات | أعد المحاولة بتراجع تدريجي |
| 500 | خطأ خادم | رسالة عامة + راجع `Error Log` |

نص الخطأ يعود في `_server_messages` أو `exception` — استخرجه واعرضه بالعربية.

### 9.7 CORS والنطاقات

إن كان React على نطاق مختلف عن ERPNext، فعّل في `site_config.json`:

```json
{
  "allow_cors": "https://app.goldencrown.iq",
  "cookie_samesite": "None"
}
```

> **الأفضل والأبسط:** ضع الواجهة والخادم على **نفس النطاق** (React على `/`
> وERPNext على `/api` عبر Nginx). هذا يلغي مشاكل CORS والكوكيز نهائياً، وهو
> ما أنصح به لهذا المشروع.

### 9.8 مكتبات جاهزة للواجهة

- **`frappe-js-sdk`** — عميل JS يغلّف الـ API (مصادقة، CRUD، رفع ملفات).
- **`frappe-react-sdk`** — خطافات React جاهزة مبنية على SWR:
  `useFrappeGetDocList`, `useFrappeCreateDoc`, `useFrappeAuth` …

هذه المكتبات تختصر جزءاً كبيراً من العمل، لكن لا تلغي الحاجة لطبقة ترجمة
تحوّل شكل بيانات ERPNext إلى الشكل الذي تتوقعه مكوّنات الواجهة الحالية.

---

## 10. التقارير ولوحات المعلومات وصيغ الطباعة

### 10.1 أنواع التقارير

| النوع | كيف يُبنى | متى |
|---|---|---|
| **Report Builder** | بلا كود من الواجهة | قوائم وفلاتر بسيطة |
| **Query Report** | استعلام SQL | تجميعات وإحصاءات |
| **Script Report** | Python + JS | منطق معقّد وأعمدة محسوبة |
| **Dashboard Chart** | من الواجهة | الرسوم في لوحة الإدارة |
| **Number Card** | من الواجهة | أرقام سريعة (عدد الاستشارات اليوم…) |

هذا يغطي ما تعرضه `src/pages/admin/Stats.jsx` حالياً بحسابات في المتصفح.

### 10.2 صيغ الطباعة و PDF

- **Print Format**: قالب يُبنى إما بمحرّر مرئي أو بـ Jinja + HTML/CSS.
- **Letter Head**: ترويسة وتذييل.
- **توليد PDF**: `wkhtmltopdf` (المسار التقليدي) أو مولّد قائم على Chromium
  في الإصدارات الأحدث.

```
GET /api/method/frappe.utils.print_format.download_pdf
  ?doctype=Consultation&name=CS-2026-0042
  &format=Golden Crown Report&no_letterhead=0
```

### 10.3 تقرير عربي RTL — نقاط عملية

الواجهة الحالية تعتمد طباعة المتصفح (`window.print`) لإثبات صحة الاتصال
العربي مبكراً، والمواصفات تعتبر ذلك مؤقتاً. عند الانتقال للتوليد من الخادم:

1. **الخط**: ثبّت خطاً عربياً يدعم التشكيل والاتصال (مثل Noto Naskh Arabic)
   على الخادم نفسه، ولا تعتمد على خطوط النظام الافتراضية.
2. **الاتجاه**: `direction: rtl; text-align: right;` في CSS القالب.
3. **الأرقام**: احسم شكل الأرقام (عربية ٠١٢٣ أم إنجليزية 0123) واثبت عليه؛
   تطبيق `مصروفي` في جذر المستودع يقبل الشكلين ويحوّلهما — اتبع نفس المنطق.
4. **الاختبار المبكر**: ولّد PDF حقيقياً في **أول أسبوع** من الربط. مشاكل
   تقطّع الحروف العربية في `wkhtmltopdf` معروفة، واكتشافها متأخراً مكلف.
5. **الحجم**: صور الأسنان قد تضخّم الملف — اضغطها قبل الإدراج.

---

## 11. التعريب والاتجاه RTL

- **الترجمة**: Frappe يدعم العربية أصلاً. ملفات `.csv` في `translations/`
  داخل تطبيقك تغطي نصوصك الخاصة. تُلتقط النصوص القابلة للترجمة عبر
  `_("النص")` في Python و`__("Text")` في JS.
- **لغة المستخدم**: تُضبط لكل مستخدم من ملفه الشخصي، وتؤثر على واجهة Desk
  وعلى رسائل الخطأ العائدة من الـ API — وهذا يعني أن رسائل `frappe.throw`
  ستصل واجهتك بالعربية تلقائياً إن ضُبطت اللغة صحيحاً.
- **RTL في Desk**: مدعوم، لكن جودته تتفاوت بين الإصدارات. بما أن المرضى
  والأطباء سيستخدمون واجهة React المخصّصة، فإن Desk للإدارة الداخلية فقط
  وهذا يقلّل من أهمية المسألة.
- **التاريخ والوقت**: اضبط المنطقة الزمنية `Asia/Baghdad` على مستوى الموقع.
  خزّن كل شيء بـ UTC واعرضه محلياً — الواجهة الحالية تستخدم
  `toLocaleString('ar-IQ')` في `src/lib/status.js` وهو النهج الصحيح.

---

## 12. التخصيص وبناء تطبيق خاص

### 12.1 سُلّم التخصيص (من الأخف للأثقل)

1. **Customize Form** — إخفاء/إظهار حقول، تغيير التسميات، جعل حقل إلزامياً.
2. **Custom Field** — إضافة حقل لـ DocType قياسي.
3. **Property Setter** — تغيير خاصية على حقل قياسي.
4. **Client Script** — JS يعمل في نموذج Desk.
5. **Server Script** — Python بلا كود مُنشَر (يتطلب تفعيلاً صريحاً).
6. **تطبيق خاص (Custom App)** — DocTypes وكود ومسارات كاملة. **هذا خيارنا.**

### 12.2 إنشاء التطبيق

```bash
bench new-app golden_crown
bench --site goldencrown.local install-app golden_crown
```

الهيكل الناتج:

```
apps/golden_crown/golden_crown/
├── hooks.py                 # نقاط التمديد
├── api.py                   # دوال whitelisted للواجهة
├── permissions.py           # شروط الصلاحيات
├── tasks.py                 # المهام المجدولة
├── engine.py                # محرك التوجيه والتصعيد (منقول من engine.js)
├── billing.py               # الفوترة وتوزيع الحصص
└── golden_crown/doctype/
    ├── consultation/
    ├── consultation_code/
    ├── consultation_payout/
    └── golden_crown_settings/
```

### 12.3 نقل التخصيصات بين البيئات (Fixtures)

التخصيصات المصنوعة من الواجهة تعيش في قاعدة البيانات، لا في Git. لنقلها
من التطوير للإنتاج:

```python
# hooks.py
fixtures = [
    "Custom Field",
    "Property Setter",
    {"dt": "Role", "filters": [["name", "like", "GC %"]]},
    "Workflow", "Workflow State", "Workflow Action",
    "Print Format",
]
```

```bash
bench --site dev.local export-fixtures     # تصدير إلى ملفات JSON في التطبيق
git commit && git push
bench --site prod.iq migrate               # استيراد تلقائي عند الترحيل
```

**بلا هذه الخطوة ستضيع تخصيصاتك أو تختلف البيئات عن بعضها — وهو من أكثر
أخطاء مشاريع ERPNext شيوعاً.**

---

## 13. التنصيب والتشغيل والصيانة

### 13.1 خيارات التنصيب

| الخيار | مناسب لـ | ملاحظات |
|---|---|---|
| **Frappe Cloud** | من لا يريد إدارة خوادم | استضافة رسمية، تحديثات ونسخ تلقائية، اشتراك شهري |
| **Docker** (`frappe_docker`) | الإنتاج الحديث والفرق التقنية | إعادة إنتاج مضمونة، أسهل ترقية |
| **bench على خادم** | أقصى تحكّم | يتطلب خبرة Linux حقيقية |
| **Easy Install script** | تجربة سريعة | ليس للإنتاج الجاد |

### 13.2 التنصيب للتطوير (اختصار)

```bash
# المتطلبات: Python 3.11+, Node 18+, MariaDB 10.6+, Redis, yarn, wkhtmltopdf
pip install frappe-bench
bench init frappe-bench --frappe-branch version-15
cd frappe-bench

bench new-site goldencrown.local
bench get-app erpnext --branch version-15
bench --site goldencrown.local install-app erpnext

bench new-app golden_crown
bench --site goldencrown.local install-app golden_crown

bench start        # http://goldencrown.local:8000
```

### 13.3 الإنتاج

```bash
bench setup production frappe          # nginx + supervisor
bench setup nginx && sudo service nginx reload
bench --site goldencrown.iq add-domain goldencrown.iq
sudo bench setup lets-encrypt goldencrown.iq    # شهادة SSL
bench --site goldencrown.iq set-config developer_mode 0
```

### 13.4 النسخ الاحتياطي والاسترجاع

```bash
bench --site goldencrown.iq backup --with-files      # قاعدة البيانات + الملفات
bench --site goldencrown.iq restore <sql.gz> \
  --with-private-files <tar> --with-public-files <tar>
```

- جدول النسخ التلقائي يُضبط بـ `backup_limit` و`scheduler`.
- **ارفع النسخ خارج الخادم** (S3 أو ما يعادله). نسخة على نفس القرص ليست نسخة.
- **اختبر الاسترجاع فعلياً كل ربع سنة.** نسخة لم تُختبر = لا نسخة.

### 13.5 التحديث

```bash
bench update                    # سحب + بناء + ترحيل (كل شيء)
bench update --patch            # الترحيل فقط
bench --site goldencrown.iq migrate
```

**قاعدة صارمة:** لا تحدّث الإنتاج مباشرة أبداً. جرّب على `staging` بنسخة من
بيانات الإنتاج، وخذ نسخة احتياطية قبل كل تحديث.

### 13.6 المراقبة والتشخيص

| الأداة | ماذا تعطيك |
|---|---|
| `Error Log` (DocType) | الاستثناءات غير الملتقطة |
| `Scheduled Job Log` | هل تعمل المهام المجدولة فعلاً |
| `Activity Log` / `Access Log` | من دخل ومن وصل لماذا |
| `Version` | ما الذي تغيّر في كل مستند ومن غيّره |
| `bench doctor` | صحة الطوابير والمجدول |
| `logs/*.log` | سجلات nginx و worker و scheduler |
| `/api/method/frappe.ping` | فحص حياة بسيط للمراقبة الخارجية |

**تنبيه شائع ومكلف:** المجدول (scheduler) قد يتوقف بصمت بعد ترحيل أو خطأ،
فتتوقف كل الأتمتة (التصعيد، الإشعارات، التقارير) دون أي رسالة خطأ ظاهرة.
راقب `Scheduled Job Log` بشكل استباقي.

---

## 14. خريطة الربط: التاج الذهبي ← ERPNext

هذا القسم هو الترجمة العملية لكل ما سبق، على الكود الموجود فعلاً في
`golden-crown/`.

### 14.1 خريطة الكيانات

| في `src/lib/db.js` (الحالي) | في ERPNext (المقترح) | ملاحظات |
|---|---|---|
| `patients[]` | `Patient` (healthcare) + `Customer` | الهاتف هو المعرّف الفريد |
| `doctors[]` | `Healthcare Practitioner` + `Supplier` | `status` → حقل `gc_status`: pending/active/disabled |
| `doctor.hours[]` | `Practitioner Schedule` أو جدول فرعي | أيام الأحد–الخميس |
| `doctor.credentials[]` | `File` مرفقة + حقل اعتماد | إجازة نقابة الأطباء |
| `clinics[]` | `Healthcare Service Unit` | مع حقلي `latitude` / `longitude` |
| `governorates` | `Territory` أو DocType `GC Governorate` | ثابتة، 6 محافظات + إحداثيات |
| `consultations[]` | **`Consultation`** (DocType خاص) | القلب |
| `consultation.answers` | جداول فرعية + حقول | لا تخزّنها JSON خام — ستحتاج فلترتها |
| `consultation.opinion` | `Text Editor` + `Patient Encounter` | الرأي الطبي |
| `codes[]` | **`Consultation Code`** (DocType خاص) | كود `GC-XXXXXX` |
| `transactions[]` | **`Consultation Payout`** + Sales/Purchase Invoice | الجزء المحاسبي |
| `auditLog[]` | `Version` + `Access Log` + `Activity Log` | مدمج، لا تبنِ سجلاً موازياً |
| `complaints[]` | `Issue` (Support) | تذاكر جاهزة بحالات وتصنيف |
| `templates[]` | **`Consultation Template`** (DocType خاص) | قوالب رد الطبيب |
| `interests[]` | `Lead` (CRM) | طلبات انضمام الأطباء والمختبرات |
| `settings` | **`Golden Crown Settings`** (Single DocType) | كل الأرقام القابلة للضبط |
| `drafts{}` | `Consultation` بحالة `draft` | حفظ تلقائي حقيقي عبر الخادم |
| `session` | جلسة Frappe | لا تُدار في المتصفح |

### 14.2 DocTypes المقترحة بالتفصيل

**`Consultation`** — قابل للاعتماد (`is_submittable`), `track_changes`, `track_views`

| الحقل | النوع | ملاحظة |
|---|---|---|
| `naming_series` | Select | `CS-.YYYY.-.#####` |
| `patient` | Link → Patient | إلزامي |
| `doctor` | Link → Healthcare Practitioner | يُملأ بالتوجيه التلقائي |
| `clinic` | Link → Healthcare Service Unit | يُشتق من الطبيب |
| `status` | Select | draft/new/in_review/ready/reassigned/escalated |
| `urgent` | Check | **محسوب على الخادم فقط** — للقراءة في الواجهة |
| `complaint_type` | Link → GC Complaint Type | ألم/تسوّس/لثة/تقويم/تجميل/خلع/أخرى |
| `specialty` | Data | يُشتق من نوع الشكوى |
| `pain_level` | Int (0-10) | |
| `duration` / `worse_when` | Data | |
| `swelling` / `fever` | Check | مدخلات التصعيد |
| `tooth_number` | Data | ترقيم FDI (مثل `26`) |
| `images` | Table → GC Consultation Image | **`is_private = 1` إلزامي** |
| `payment_status` | Select | pending/paid/failed |
| `payment_method` | Link → Mode of Payment | زين كاش/آسيا حوالة/مجاني |
| `code` | Link → Consultation Code | يُولَّد بعد الدفع |
| `opinion` | Text Editor | الرأي الطبي، level 0 |
| `ready_at` | Datetime | |
| `sales_invoice` | Link → Sales Invoice | الربط المحاسبي |

**`Consultation Code`**: `code` (فريد), `consultation` (Link), `redeemed` (Check),
`redeemed_at` (Datetime), `clinic` (Link), `discount_percent` (Percent).

**`Consultation Payout`**: `consultation`, `doctor`, `clinic`, `amount`,
`doctor_share`, `platform_share`, `settled` (Check), `purchase_invoice` (Link).

**`Golden Crown Settings`** (Single): `consult_fee`, `free_consultations_limit`,
`used_free_count`, `doctor_response_hours`, `pain_threshold`, `require_swelling`,
`require_fever`, `discount_percent`, `doctor_share_percent`,
`legal_notice` (Text Editor), `legal_notice_approved` (Check), نصوص المحتوى.

### 14.3 نقل المنطق من المتصفح إلى الخادم

هذه أهم نقطة معمارية في الربط كله. المنطق الموجود الآن في المتصفح **يجب**
أن ينتقل للخادم، لأن أي كود في المتصفح قابل للتلاعب:

| المنطق الحالي | الملف | يصبح على الخادم |
|---|---|---|
| `computeUrgency` | `src/lib/engine.js` | `Consultation.validate()` |
| `matchDoctors` / `routeConsultation` | `src/lib/engine.js` | `golden_crown.engine.route()` تُستدعى بعد الدفع |
| `distanceKm` (Haversine) | `src/lib/geo.js` | `golden_crown.engine` أو استعلام SQL جغرافي |
| توليد الكود `makeCode` | `src/lib/db.js` | `Consultation Code.autoname` — لضمان التفرّد |
| حساب `doctorShare` / `platformShare` | `AppContext.redeemCode` | `golden_crown.billing.create_payout()` |
| فحص أهلية المجاني `isFreeEligible` | `AppContext` | دالة whitelisted تقرأ الإعدادات |
| كتابة `auditLog` | `AppContext.log` | تلقائي عبر `track_changes` / `track_views` |
| التحقق من المدخلات | `src/lib/validate.js` | يبقى في الواجهة **للتجربة** + يُكرَّر على الخادم **للأمان** |

> **قاعدة:** التحقق في الواجهة للراحة، والتحقق على الخادم للحقيقة. لا تحذف
> تحقق الواجهة، لكن لا تعتمد عليه أبداً.

### 14.4 مصادقة المريض بالـ OTP

المواصفات تتطلب دخول المريض برقم موبايل عراقي + رمز SMS. ERPNext لا يوفر
هذا جاهزاً، فيُبنى هكذا:

```python
@frappe.whitelist(allow_guest=True)
def request_otp(phone: str):
    phone = normalize_iraqi_phone(phone)      # 07XXXXXXXXX
    enforce_rate_limit(phone, limit=3, window=600)   # ← إلزامي
    code = generate_numeric_code(6)
    frappe.cache().set_value(f"otp:{phone}", hash_code(code), expires_in_sec=300)
    send_sms(phone, f"رمز الدخول: {code}")
    return {"sent": True}

@frappe.whitelist(allow_guest=True)
def verify_otp(phone: str, code: str):
    stored = frappe.cache().get_value(f"otp:{phone}")
    if not stored or not verify_code(stored, code):
        frappe.throw("رمز غير صحيح أو منتهي الصلاحية")
    user = get_or_create_patient_user(phone)   # ينشئ User + Patient + Customer
    frappe.local.login_manager.login_as(user.name)
    return {"ok": True}
```

نقاط انتباه: خزّن **بصمة** الرمز لا الرمز نفسه؛ صلاحية قصيرة (5 دقائق)؛
عدد محاولات محدود؛ تقييد معدّل صارم على الإرسال؛ ومزوّد SMS عراقي حقيقي
(بند مفتوح في المواصفات). رمز `1234` الحالي للمعاينة فقط ويجب ألا يصل للإنتاج.

### 14.5 الدفع

بوابات زين كاش وآسيا حوالة ليست ضمن تكاملات ERPNext الجاهزة، فتُبنى كـ
تكامل مخصّص:

1. الواجهة تطلب `create_payment_intent(consultation)`.
2. الخادم ينشئ `Payment Request` ويعيد رابط/بيانات البوابة.
3. المريض يدفع في البوابة.
4. البوابة تستدعي **Webhook** على الخادم.
5. الخادم **يتحقق من التوقيع**، ثم ينشئ `Payment Entry` ويعتمده، ويولّد الكود،
   ويشغّل التوجيه التلقائي، ويُعلم المريض.

> ⚠️ **لا تعتمد أبداً** على رجوع المتصفح من البوابة كإثبات دفع. الإثبات
> الوحيد المقبول هو الـ webhook الموقّع من جهة الخادم. حالة `fail-test`
> الموجودة الآن في `payConsultation` مفيدة كاختبار — أبقِ ما يعادلها في
> بيئة الاختبار.

### 14.6 طبقة الاتصال في React

الهدف: استبدال `src/lib/db.js` و`src/context/AppContext.jsx` بطبقة REST،
**مع الإبقاء على نفس واجهة `useApp()` قدر الإمكان** حتى لا تتغيّر عشرات
المكوّنات في `src/pages/`.

```js
// src/lib/api.js — البديل المقترح لـ db.js
const BASE = import.meta.env.VITE_API_URL || ''

async function request(path, { method = 'GET', body, params } = {}) {
  const url = new URL(BASE + path, window.location.origin)
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, typeof v === 'string' ? v : JSON.stringify(v))
    }
  }
  const res = await fetch(url, {
    method,
    credentials: 'include',                 // كوكيز الجلسة
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(res.status, extractArabicMessage(data))
  return data.data ?? data.message
}

export const api = {
  listConsultations: (filters) =>
    request('/api/resource/Consultation', {
      params: {
        filters,
        fields: ['name', 'status', 'urgent', 'doctor', 'creation'],
        order_by: 'creation desc',
        limit_page_length: 20,
      },
    }),

  getConsultation: (name) => request(`/api/resource/Consultation/${name}`),

  saveDraft: (name, answers) =>
    request(`/api/resource/Consultation/${name}`, { method: 'PUT', body: answers }),

  pay: (consultation, method) =>
    request('/api/method/golden_crown.api.submit_consultation', {
      method: 'POST',
      body: { consultation, payment_method: method },
    }),

  redeemCode: (code, clinic) =>
    request('/api/method/golden_crown.api.redeem_code', {
      method: 'POST',
      body: { code, clinic },
    }),
}
```

**فروق جوهرية عن النسخة المحلية يجب معالجتها في الواجهة:**

| الآن (محلي) | بعد الربط (شبكة) |
|---|---|
| كل العمليات فورية ومتزامنة | كل عملية غير متزامنة وقد تفشل |
| لا حالات تحميل | تحتاج `loading` لكل شاشة |
| لا أخطاء شبكة | تحتاج معالجة خطأ + إعادة محاولة |
| `db` كاملة في الذاكرة | جلب بحسب الحاجة + صفحات + كاش |
| الحفظ التلقائي فوري | تأخير (debounce) + مؤشر «جارٍ الحفظ» |
| كل الأدوار ترى كل شيء | كل دور يرى ما يخصّه فقط (403 واردة) |
| `resetDb()` يمسح كل شيء | لا وجود لها — بيانات حقيقية |

> نصيحة عملية: استخدم `frappe-react-sdk` أو `@tanstack/react-query` لإدارة
> الكاش وحالات التحميل بدل بنائها يدوياً. الحفاظ على شكل `useApp()` الحالي
> كواجهة خارجية يجعل الهجرة تدريجية بدل إعادة كتابة شاملة.

### 14.7 خطة الهجرة على مراحل

| المرحلة | العمل | معيار الإنجاز |
|---|---|---|
| **0. القرار** | حسم: `healthcare` أم DocTypes خاصة بالكامل | قرار موثّق ومعتمد |
| **1. البنية** | خادم dev + staging، تطبيق `golden_crown`، Git | `bench start` يعمل، التطبيق مثبّت |
| **2. النموذج** | كل الـ DocTypes + الأدوار + الصلاحيات + fixtures | إنشاء استشارة يدوياً من Desk |
| **3. المنطق** | نقل التوجيه والتصعيد والفوترة للخادم + اختبارات | اختبارات Python تمر |
| **4. المصادقة** | OTP حقيقي + مزوّد SMS + أدوار المستخدمين | دخول برقم حقيقي |
| **5. القراءة** | ربط شاشات العرض بالـ API (قراءة فقط) | لوحات المريض والطبيب حيّة |
| **6. الكتابة** | الاستبيان، الحفظ التلقائي، رفع الصور، كتابة الرد | دورة كاملة عبر الخادم |
| **7. الدفع** | بوابة حقيقية + webhook + قيود محاسبية | فاتورة ودفعة صحيحتان |
| **8. التقرير** | PDF عربي من الخادم | تقرير مطبوع مقبول شكلاً |
| **9. التشغيل** | إنتاج + SSL + نسخ + مراقبة + اختبار استرجاع | استرجاع ناجح مُوثّق |
| **10. التسليم** | بيانات حقيقية، النص القانوني المعتمد، تدريب | قبول العميل |

### 14.8 قائمة تحقق قبل الإطلاق

- [ ] لا يوجد أي `api_key`/`api_secret` داخل كود الواجهة أو حزمتها.
- [ ] كل صور المرضى `is_private = 1` ولا تُخدَم بلا صلاحية.
- [ ] رمز OTP التجريبي `1234` مُزال نهائياً.
- [ ] الأرقام المالية (5,000 / 70:30 / 15%) معتمدة رسمياً من العميل.
- [ ] النص القانوني/الطبي النهائي مُستلَم ومُعتمَد (بند 11).
- [ ] سياسة الاحتفاظ بالبيانات وحق الحذف مكتوبة ومنفّذة.
- [ ] كل دور مُختبَر بأنه **لا** يرى ما لا يخصّه (اختبار سلبي، لا إيجابي فقط).
- [ ] `Scheduled Job Log` يُظهر تنفيذ المهام فعلياً.
- [ ] نسخة احتياطية خارجية + **استرجاع مُختبَر فعلياً** لا نظرياً.
- [ ] `developer_mode = 0` و`server_script_enabled` مغلق في الإنتاج.
- [ ] تقييد معدّل الطلبات مفعّل على مسارات OTP والدفع.
- [ ] HTTPS + شهادة صالحة + تجديد تلقائي.
- [ ] خطة تراجع (rollback) مكتوبة لكل نشر.

---

## 15. المحاذير والأخطاء الشائعة

| الخطأ | العاقبة | الوقاية |
|---|---|---|
| تعديل كود `frappe`/`erpnext` مباشرة | يضيع عند أول تحديث | كل شيء في تطبيقك الخاص |
| تخصيصات من الواجهة بلا `fixtures` | البيئات تتباعد ولا يمكن إعادة الإنتاج | صدّر fixtures والتزم بها في Git |
| مفاتيح API في المتصفح | تسريب كامل للنظام | جلسة كوكيز أو OAuth فقط |
| `limit_page_length=0` | استعلام يقتل الخادم | صفحات دائماً |
| المنطق الحسّاس في الواجهة | تلاعب من المستخدم | كل قرار مالي/طبي على الخادم |
| تجاهل `Scheduled Job Log` | توقّف الأتمتة بصمت | مراقبة استباقية |
| حذف مستندات مالية بدل الإلغاء | فساد الدفاتر | cancel + amend |
| نسخ احتياطية غير مُختبَرة | كارثة وقت الحاجة | اختبار استرجاع ربع سنوي |
| ترقية الإنتاج مباشرة | توقّف الخدمة | staging أولاً، دائماً |
| `ignore_permissions=True` بلا فهم | تجاوز كل الحماية | استخدمها بأضيق نطاق وبمراجعة |
| تخزين الإجابات كـ JSON خام | استحالة الفلترة والتقارير | حقول حقيقية أو جداول فرعية |
| اختبار PDF العربي في النهاية | إعادة عمل مكلفة | اختبره في الأسبوع الأول |
| افتراض أن Desk تكفي كواجهة نهائية | تجربة سيئة للمرضى | Desk للإدارة، React للمستخدمين |

---

## 16. الترخيص والتكلفة والاستضافة

### 16.1 الترخيص

ERPNext وFrappe مرخّصان تحت **GPLv3**. عملياً:

- ✅ الاستخدام التجاري والاستضافة الذاتية والتعديل مسموحة بلا رسوم ترخيص.
- ⚠️ إن وزّعت نسخة معدّلة من ERPNext نفسه، يلزمك إتاحة الكود المعدّل بنفس
  الترخيص.
- ℹ️ تطبيق React منفصل يتخاطب مع الخادم عبر REST يُعامَل عادةً كعمل مستقل لا
  كعمل مشتق — لكن الحدود القانونية للـ GPL دقيقة وتختلف بحسب طبيعة الربط.

> هذا شرح تقني للترخيص وليس استشارة قانونية. إن كانت هناك نية لبيع المنصة
> أو ترخيصها لأطراف أخرى، اعرض النموذج على مستشار قانوني مختص.

### 16.2 التكلفة الواقعية

البرنامج مجاني، والتكلفة الحقيقية في التشغيل:

| البند | ملاحظة |
|---|---|
| الخادم | يبدأ من ~2 vCPU / 4 GB RAM لبداية صغيرة، ويكبر مع المستخدمين |
| النسخ الاحتياطي الخارجي | تخزين كائنات (S3 أو ما يعادله) |
| النطاق والشهادة | الشهادة مجانية عبر Let's Encrypt |
| رسائل SMS | تكلفة تشغيلية متكررة وحسّاسة للحجم (كل OTP رسالة) |
| بوابة الدفع | نسبة على كل عملية |
| الصيانة والتحديث | وقت مهندس دوري — البند الأكبر غالباً وأكثره إغفالاً |
| Frappe Cloud (بديل) | اشتراك شهري مقابل إلغاء أعباء الإدارة |

---

## 17. مسرد المصطلحات

| المصطلح | المعنى |
|---|---|
| **Bench** | أداة سطر الأوامر التي تدير المواقع والتطبيقات |
| **Site** | موقع مستقل بقاعدة بيانات وملفات وإعدادات خاصة |
| **App** | تطبيق Python يعمل فوق Frappe |
| **DocType** | تعريف نموذج بيانات (جدول + نموذج + API + صلاحيات) |
| **Document / Doc** | سجل واحد من DocType |
| **Child Table** | جدول فرعي داخل مستند |
| **Single DocType** | DocType بمستند واحد فقط (إعدادات) |
| **docstatus** | 0 مسودة، 1 معتمد، 2 ملغى |
| **Submit / Cancel / Amend** | اعتماد / إلغاء / إنشاء نسخة معدّلة |
| **Desk** | واجهة الإدارة الجاهزة على `/app` |
| **Hooks** | نقاط تمديد معرّفة في `hooks.py` |
| **Fixtures** | تخصيصات مُصدَّرة كملفات JSON لنقلها بين البيئات |
| **Whitelisted Method** | دالة Python مسموح استدعاؤها عبر HTTP |
| **GL Entry** | سطر في دفتر الأستاذ العام |
| **Naming Series** | نمط ترقيم تلقائي للمستندات |
| **User Permission** | تقييد مستخدم بسجلات محدّدة |
| **RQ** | Redis Queue — نظام المهام الخلفية |

---

## 18. مراجع رسمية

| المرجع | الرابط |
|---|---|
| توثيق ERPNext | https://docs.frappe.io/erpnext |
| توثيق Frappe Framework | https://docs.frappe.io/framework |
| توثيق الـ REST API | https://docs.frappe.io/framework/user/en/api/rest |
| توثيق Frappe Health | https://docs.frappe.io/healthcare |
| مستودع ERPNext | https://github.com/frappe/erpnext |
| مستودع Frappe | https://github.com/frappe/frappe |
| frappe_docker | https://github.com/frappe/frappe_docker |
| المنتدى الرسمي | https://discuss.frappe.io |
| Frappe Cloud | https://frappecloud.com |
| frappe-react-sdk | https://github.com/nikkothari22/frappe-react-sdk |

---

## ملحق: أسئلة مفتوحة تحتاج قراراً قبل بدء الربط

هذه أسئلة **لا يستطيع المطوّر الإجابة عنها وحده**، وتأخيرها يعطّل العمل:

1. `healthcare` app أم DocTypes خاصة بالكامل؟ (يحدّد نموذج البيانات كله)
2. الاستضافة: خادم ذاتي، أم Docker، أم Frappe Cloud؟
3. مزوّد SMS العراقي المعتمد؟ (يحدّد شكل تكامل OTP وتكلفته)
4. تفاصيل تكامل زين كاش وآسيا حوالة (وثائق فنية + بيانات اعتماد اختبار)؟
5. الأرقام النهائية: الرسم، نسبة الطبيب/العيادة/المنصة، الخصم، مدة الرد،
   حدود التصعيد؟
6. النص القانوني/الطبي المعتمد للتنبيه في التقرير؟
7. سياسة الاحتفاظ بالبيانات ومدتها، وآلية تنفيذ حق حذف بيانات المريض؟
8. من يملك حساب المريض إن كان قاصراً أو يستخدم هاتف أحد أقاربه؟
9. هل تُخزَّن صور الأسنان إلى أجل غير مسمى؟ ومن يحق له الاطّلاع عليها لاحقاً؟
10. من يتحمّل المسؤولية الطبية عن الرأي الاستشاري، وكيف يُوثَّق ذلك في النظام؟

> البنود 5 و6 و7 مذكورة أصلاً كبنود مفتوحة في `golden-crown/README.md`
> (القسم المقابل للبند 11 من وثيقة المواصفات)، والبنود 8–10 تُطرح هنا لأن
> الانتقال من نموذج أولي محلي إلى نظام حقيقي يخزّن بيانات صحية يجعلها
> أسئلة واجبة لا اختيارية.
