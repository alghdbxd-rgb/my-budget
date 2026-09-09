# دليل نظام ERPNext الشامل

> مرجع عربي متكامل لنظام **ERPNext** المفتوح المصدر: المفاهيم، الوحدات، المحاسبة ودفتر الأستاذ العام، التخصيص والبرمجة، التشغيل والصيانة.
>
> التوثيق الرسمي: <https://docs.frappe.io/erpnext> — وصفحة دفتر الأستاذ العام: <https://docs.frappe.io/erpnext/general-ledger>

---

## الفهرس

| # | القسم |
|---|-------|
| 1 | [ما هو ERPNext](#1-ما-هو-erpnext) |
| 2 | [المعمارية التقنية (إطار Frappe)](#2-المعمارية-التقنية-إطار-frappe) |
| 3 | [المفاهيم الأساسية: DocType وما حوله](#3-المفاهيم-الأساسية-doctype-وما-حوله) |
| 4 | [الإعداد الأولي للنظام](#4-الإعداد-الأولي-للنظام) |
| 5 | [وحدة المحاسبة](#5-وحدة-المحاسبة) |
| 6 | [دفتر الأستاذ العام General Ledger](#6-دفتر-الأستاذ-العام-general-ledger) |
| 7 | [التقارير المالية](#7-التقارير-المالية) |
| 8 | [المبيعات](#8-المبيعات) |
| 9 | [المشتريات](#9-المشتريات) |
| 10 | [المخزون والمستودعات](#10-المخزون-والمستودعات) |
| 11 | [التصنيع](#11-التصنيع) |
| 12 | [الموارد البشرية والرواتب](#12-الموارد-البشرية-والرواتب) |
| 13 | [المشاريع](#13-المشاريع) |
| 14 | [الأصول الثابتة](#14-الأصول-الثابتة) |
| 15 | [CRM والدعم والجودة](#15-crm-والدعم-والجودة) |
| 16 | [الموقع والبوابة والمتجر](#16-الموقع-والبوابة-والمتجر) |
| 17 | [المستخدمون والصلاحيات](#17-المستخدمون-والصلاحيات) |
| 18 | [سير العمل والأتمتة والإشعارات](#18-سير-العمل-والأتمتة-والإشعارات) |
| 19 | [التخصيص والبرمجة](#19-التخصيص-والبرمجة) |
| 20 | [واجهات REST API والتكامل](#20-واجهات-rest-api-والتكامل) |
| 21 | [التقارير ولوحات المعلومات](#21-التقارير-ولوحات-المعلومات) |
| 22 | [الاستيراد والتصدير والنسخ الاحتياطي](#22-الاستيراد-والتصدير-والنسخ-الاحتياطي) |
| 23 | [التنصيب والنشر والصيانة](#23-التنصيب-والنشر-والصيانة) |
| 24 | [الأداء والتوسع](#24-الأداء-والتوسع) |
| 25 | [التعريب والامتثال الضريبي (ZATCA)](#25-التعريب-والامتثال-الضريبي-zatca) |
| 26 | [مشاكل شائعة وحلولها](#26-مشاكل-شائعة-وحلولها) |
| 27 | [مسرد المصطلحات](#27-مسرد-المصطلحات) |
| 28 | [مصادر ومراجع](#28-مصادر-ومراجع) |

---

## 1. ما هو ERPNext

**ERPNext** نظام تخطيط موارد مؤسسات (ERP) مفتوح المصدر بالكامل، تطوّره شركة **Frappe Technologies**، ومرخّص برخصة **GPLv3** — أي أن استخدامه مجاني تماماً بلا رسوم تراخيص أو عدد مستخدمين محدود، والتكلفة تكون فقط في الاستضافة والتنفيذ والدعم.

### ماذا يغطّي

نظام واحد يربط كل عمليات المنشأة في قاعدة بيانات واحدة:

- المحاسبة المالية والقيد المزدوج
- المبيعات ودورة العميل (عرض سعر ← أمر بيع ← تسليم ← فاتورة ← تحصيل)
- المشتريات ودورة المورّد (طلب مواد ← أمر شراء ← استلام ← فاتورة ← سداد)
- المخزون متعدد المستودعات مع التتبّع بالدفعات والأرقام التسلسلية
- التصنيع (قوائم المواد، أوامر العمل، بطاقات المهام، خطط الإنتاج)
- الموارد البشرية والرواتب (عبر تطبيق `hrms` المنفصل)
- المشاريع والمهام وسجلات الوقت
- الأصول الثابتة والإهلاك
- إدارة علاقات العملاء، الدعم الفني، الجودة
- موقع إلكتروني وبوابة عملاء ومتجر إلكتروني

### لماذا يختاره الناس

| الميزة | التفصيل |
|--------|---------|
| مفتوح المصدر | الشيفرة كاملة على GitHub، لا حبس مع مورّد (vendor lock‑in) |
| قابلية التخصيص | إضافة حقول وسير عمل وتقارير وسكربتات دون تعديل الشيفرة الأصلية |
| تكامل داخلي | كل الوحدات على قاعدة بيانات واحدة — لا حاجة لجسور تكامل |
| API كامل | كل مستند في النظام له REST API تلقائياً |
| متعدد الشركات والعملات واللغات | مع دعم كامل للعربية والاتجاه من اليمين لليسار (RTL) |

### حدوده وما يجب معرفته قبل التبني

- يحتاج خبرة تقنية للتشغيل والصيانة (Linux، MariaDB، Redis، Nginx) ما لم تستخدم استضافة مُدارة مثل **Frappe Cloud**.
- الترقيات بين الإصدارات الكبرى تتطلب تخطيطاً واختباراً، خصوصاً مع التخصيصات الكثيرة.
- بعض متطلبات التوطين (مثل فوترة ZATCA السعودية) تحتاج تطبيقات إضافية من طرف ثالث.
- الأداء يتأثر بالتخصيص السيّئ (سكربتات ثقيلة داخل `validate` مثلاً).

### الإصدارات

- **v13 / v14**: إصدارات سابقة، فُصل فيها تطبيق الموارد البشرية إلى `hrms` وتطبيق المدفوعات إلى `payments`.
- **v15**: الإصدار المستقر واسع الانتشار — واجهة محدّثة، نظام **Serial and Batch Bundle** الجديد لتتبّع المخزون، فصل المتجر الإلكتروني إلى تطبيق `webshop`، شاشة **Plant Floor** للتصنيع، ومتطلبات Python 3.10+ وMariaDB 10.6+ وNode 18+.
- **v16 وما بعده**: تطوير مستمر على فرع `develop` مع انتقال تدريجي للواجهة المبنية على Frappe UI.

> تحقّق دائماً من الإصدار الفعلي لديك: `bench version` أو من واجهة النظام: **Help ← About**.

---

## 2. المعمارية التقنية (إطار Frappe)

ERPNext ليس نظاماً قائماً بذاته، بل **تطبيق** يعمل فوق إطار **Frappe Framework** — إطار ويب متكامل بلغة Python يوفّر قاعدة البيانات والصلاحيات والواجهة والتقارير والـ API جاهزة.

```
┌──────────────────────────────────────────────────────────┐
│  المتصفح: واجهة Desk (JS)  +  البوابة/الموقع  +  الموبايل │
└───────────────┬──────────────────────────────────────────┘
                │ HTTP / WebSocket
┌───────────────▼──────────────────────────────────────────┐
│  Nginx  (بروكسي عكسي + ملفات ثابتة + SSL)                │
├──────────────────────────────────────────────────────────┤
│  Gunicorn ← تطبيق Frappe (Python)                        │
│      ├── تطبيق erpnext                                    │
│      ├── تطبيق hrms / payments / webshop ...              │
│      └── تطبيقاتك المخصّصة                                │
├──────────────────────────────────────────────────────────┤
│  عمّال الخلفية (RQ Workers): short / default / long        │
│  Scheduler (المهام المجدولة)   Socket.IO (Node)           │
├──────────────────────────────────────────────────────────┤
│  MariaDB (البيانات)      Redis (cache / queue / socketio) │
└──────────────────────────────────────────────────────────┘
```

### مكوّنات الحزمة التقنية

| المكوّن | الدور |
|---------|-------|
| **Python** | لغة الخادم ومنطق العمل |
| **MariaDB** | قاعدة البيانات الأساسية (PostgreSQL مدعوم تجريبياً) |
| **Redis** | ثلاث نسخ: للتخزين المؤقت، ولطوابير المهام، وللبثّ اللحظي |
| **Node.js + Socket.IO** | التحديثات اللحظية (إشعارات، تقدّم العمليات) |
| **Nginx + Supervisor** | الخدمة في الإنتاج ومراقبة العمليات |
| **RQ (Redis Queue)** | تشغيل المهام الطويلة في الخلفية |

### Bench والـ Site والـ App

- **Bench**: أداة سطر الأوامر ومجلد العمل الذي يحتوي كل شيء (`frappe-bench/`).
- **App (تطبيق)**: حزمة برمجية مثل `frappe`، `erpnext`، `hrms`، أو تطبيقك أنت.
- **Site (موقع)**: قاعدة بيانات مستقلة + ملفات + إعدادات. البِنش الواحد يستضيف عدة مواقع، وكل موقع يثبّت مجموعة تطبيقات مختارة — هذا أساس تعدد المستأجرين (multi-tenancy).

```
frappe-bench/
├── apps/                    # التطبيقات (كل واحد مستودع git)
│   ├── frappe/
│   ├── erpnext/
│   └── my_custom_app/
├── sites/
│   ├── common_site_config.json   # إعدادات مشتركة (منافذ Redis، المضيف...)
│   ├── assets/                   # ملفات JS/CSS المبنية
│   └── mysite.local/
│       ├── site_config.json      # اسم قاعدة البيانات وكلمة المرور ومفتاح التشفير
│       ├── private/backups/      # النسخ الاحتياطية
│       └── public/files/         # المرفقات العامة
├── config/                  # nginx.conf, supervisor.conf, redis_*.conf
├── logs/
└── env/                     # بيئة Python الافتراضية
```

---

## 3. المفاهيم الأساسية: DocType وما حوله

فهم هذه المفاهيم يفتح لك النظام كله — فكل شيء في ERPNext مبني عليها.

### 3.1 DocType

الـ **DocType** هو تعريف نوع المستند: يولّد في آنٍ واحد جدولاً في قاعدة البيانات (`tab<DocType Name>`)، ونموذج إدخال، وقائمة عرض، وصلاحيات، وREST API. أمثلة: `Sales Invoice`, `Item`, `Employee`, `GL Entry`.

أنواع الـ DocType:

| النوع | الوصف | مثال |
|-------|-------|------|
| عادي | جدول بسجلات متعددة | `Customer` |
| **Child Table** (`istable`) | جدول فرعي داخل مستند أب، لا يُفتح مستقلاً | `Sales Invoice Item` |
| **Single** (`issingle`) | سجل واحد فقط، للإعدادات | `Stock Settings`, `System Settings` |
| **Tree** | هيكل شجري متداخل (nested set: `lft`/`rgt`) | `Account`, `Item Group`, `Cost Center`, `Warehouse` |
| **Submittable** | يمر بحالات: مسودة ← مُعتمد ← ملغى | `Sales Invoice`, `Stock Entry` |
| **Virtual** | لا جدول له، يقرأ من مصدر خارجي | تكاملات مخصّصة |

### 3.2 حالة المستند docstatus

| القيمة | الحالة | المعنى |
|--------|--------|--------|
| `0` | Draft — مسودة | قابل للتعديل، لا أثر محاسبي أو مخزني |
| `1` | Submitted — معتمد | مُثبّت، يولّد قيود دفتر الأستاذ وحركات المخزون |
| `2` | Cancelled — ملغى | ملغى، وتُنشأ له قيود عكسية |

> القاعدة الذهبية: **المستند المعتمد لا يُعدّل**. لتصحيحه: ألغِه (Cancel) ثم أنشئ نسخة معدّلة (Amend) تحمل رقماً بلاحقة مثل `ACC-SINV-2026-00012-1`.

### 3.3 أنواع الحقول (Fieldtypes)

`Data`, `Link`, `Dynamic Link`, `Select`, `Autocomplete`, `Table`, `Table MultiSelect`, `Currency`, `Float`, `Int`, `Percent`, `Check`, `Date`, `Datetime`, `Time`, `Duration`, `Text`, `Small Text`, `Long Text`, `Text Editor`, `Markdown Editor`, `Code`, `JSON`, `Attach`, `Attach Image`, `Signature`, `Barcode`, `Color`, `Rating`, `Password`, `Geolocation`, بالإضافة لحقول التنسيق: `Section Break`, `Column Break`, `Tab Break`, `HTML`, `Heading`.

- **Link**: علاقة بجدول آخر (مثل حقل `customer` المرتبط بـ `Customer`).
- **Dynamic Link**: علاقة يحدد نوعَها حقلٌ آخر — مثل `party_type`/`party` في القيود: النوع قد يكون `Customer` أو `Supplier` أو `Employee`.

### 3.4 التسمية (Naming)

طرق توليد اسم المستند (المفتاح الأساسي):

| الطريقة | مثال |
|---------|------|
| `naming_series:` | `ACC-SINV-.YYYY.-.#####` ← `ACC-SINV-2026-00001` |
| `field:` | اسم المستند = قيمة حقل معيّن (مثل اسم العنصر) |
| `format:` | صيغة مركّبة من حقول وتواريخ |
| `hash` | معرّف عشوائي |
| `prompt` | يطلب من المستخدم كتابة الاسم |

مثال حقيقي: قيود دفتر الأستاذ تُسمّى بالصيغة `ACC-GLE-.YYYY.-.#####`.

### 3.5 دورة حياة المستند (Hooks على مستوى المستند)

عند الحفظ والاعتماد، ينادي النظام دوالّ بالترتيب:

```
before_insert → autoname → validate → before_save → on_update → after_insert
before_submit → on_submit          (عند الاعتماد)
before_cancel → on_cancel          (عند الإلغاء)
on_update_after_submit             (عند تعديل حقل مسموح بعد الاعتماد)
on_trash → after_delete            (عند الحذف)
```

هذه هي النقاط التي تعلّق عليها منطقك المخصّص (انظر [التخصيص والبرمجة](#19-التخصيص-والبرمجة)).

---

## 4. الإعداد الأولي للنظام

ترتيب الإعداد الصحيح يوفّر عليك إعادة عمل كثيرة لاحقاً:

1. **الشركة (Company)**: الاسم، الاختصار، العملة الافتراضية، البلد. الاختصار يظهر في أسماء الحسابات والمستودعات.
2. **السنة المالية (Fiscal Year)**: تاريخ البداية والنهاية، وربطها بالشركة.
3. **شجرة الحسابات (Chart of Accounts)**: تُنشأ تلقائياً حسب البلد، أو ارفع شجرتك عبر ملف. عدّلها قبل بدء الترحيل.
4. **مراكز التكلفة (Cost Centers)** والأبعاد المحاسبية إن لزم.
5. **الإعدادات المحاسبية (Accounts Settings)**: الجرد الدائم، السماح بتغيير تاريخ القيد، تقريب الفروق، ...
6. **العملات وأسعار الصرف** إن كنت متعدد العملات.
7. **قوالب الضرائب**: `Sales Taxes and Charges Template`، `Purchase Taxes and Charges Template`، `Item Tax Template`.
8. **المستودعات (Warehouses)** وإعدادات المخزون وطريقة التقييم.
9. **العناصر (Items)** ومجموعاتها ووحدات القياس.
10. **العملاء والموردون** ومجموعاتهم وشروط الدفع.
11. **الأرصدة الافتتاحية**: قيد يومية بعلامة *Is Opening = Yes* للحسابات، و**Stock Reconciliation** للمخزون الافتتاحي.
12. **المستخدمون والأدوار والصلاحيات**.
13. **حسابات البريد** وقوالب الطباعة والترويسة.

---

## 5. وحدة المحاسبة

### 5.1 مبدأ القيد المزدوج

كل عملية مالية في ERPNext تُترجم إلى قيود متوازنة: **مجموع المدين = مجموع الدائن**. النظام يرفض اعتماد أي مستند لا يحقق هذا التوازن (باستثناء فرق تقريب صغير يُرحّل تلقائياً لحساب *Round Off*).

معادلة الميزانية: **الأصول = الخصوم + حقوق الملكية**.

### 5.2 شجرة الحسابات (Chart of Accounts)

هيكل شجري من نوعين:
- **مجموعة (Group)**: حاوية لا تقبل القيود مباشرة.
- **دفتر (Ledger)**: حساب طرفي تُرحّل إليه القيود.

أنواع الجذور الخمسة: **Asset (أصول)** — **Liability (خصوم)** — **Income (إيرادات)** — **Expense (مصروفات)** — **Equity (حقوق ملكية)**.

خصائص مهمة في الحساب: `account_type` (بنك، نقد، مدينون، دائنون، مخزون، ضريبة، إهلاك...)، `account_currency`، `is_group`، `company`، `freeze` (تجميد الحساب)، ورقم الحساب `account_number`.

### 5.3 مستندات المحاسبة الأساسية

| المستند | الاستخدام |
|---------|-----------|
| **Journal Entry** (قيد يومية) | قيود يدوية: افتتاحية، تسويات، استهلاكات، تحويلات بنكية |
| **Payment Entry** (قيد دفع) | مقبوضات ومدفوعات وتسوية مع الفواتير والدفعات المقدّمة |
| **Sales Invoice** (فاتورة مبيعات) | إثبات الإيراد والمدين |
| **Purchase Invoice** (فاتورة مشتريات) | إثبات المصروف/الأصل والدائن |
| **Payment Request** | طلب سداد يُرسل للعميل مع رابط دفع |
| **Payment Reconciliation** | مطابقة الدفعات مع الفواتير المفتوحة |
| **Bank Reconciliation / Statement Import** | مطابقة كشف الحساب البنكي |
| **Period Closing Voucher** | إقفال الفترة وترحيل الأرباح المحتجزة |
| **Accounting Period** | منع الترحيل في فترات مقفلة |

### 5.4 أدوات محاسبية مهمة

- **الأبعاد المحاسبية (Accounting Dimensions)**: بُعد إضافي للتحليل غير مركز التكلفة والمشروع — مثل الفرع أو القطاع أو خط المنتج. يضاف كحقل في كل مستند محاسبي ويظهر كعمود في التقارير.
- **دفتر الحسابات (Finance Book)**: مجموعات قيود متوازية لنفس الشركة — تُستخدم مثلاً لجداول إهلاك مختلفة (ضريبي مقابل محاسبي).
- **الموازنات (Budget)**: سقف على حساب/مركز تكلفة/مشروع مع إجراء عند التجاوز (تحذير أو منع).
- **الإيراد/المصروف المؤجل (Deferred Revenue/Expense)**: توزيع المبلغ على فترات بجدولة تلقائية.
- **ضريبة الاستقطاع (Tax Withholding Category)**: خصم ضريبي عند المنبع للموردين.
- **قواعد التسعير (Pricing Rule)** و**قوائم الأسعار (Price List)** و**قواعد الشحن (Shipping Rule)**.
- **تخصيص مركز التكلفة (Cost Center Allocation)**: توزيع تلقائي لمبلغ مركز تكلفة على عدة مراكز بنسب.

---

## 6. دفتر الأستاذ العام (General Ledger)

> المرجع الرسمي: <https://docs.frappe.io/erpnext/general-ledger>

دفتر الأستاذ العام هو **السجل المركزي لكل حركة مالية في النظام**. أي مستند معتمد له أثر مالي (فاتورة، دفعة، قيد يومية، حركة مخزون في نظام الجرد الدائم، إهلاك أصل، قسيمة راتب) يُترجَم تلقائياً إلى سجلات في جدول **GL Entry**. ولأن كل حركة تُقيَّد مدين/دائن، يبقى الدفتر متوازناً دائماً.

### 6.1 GL Entry: سجل القيد

كل سطر في دفتر الأستاذ هو مستند من نوع `GL Entry`، يُسمّى بالصيغة `ACC-GLE-.YYYY.-.#####`، وهو **مستند معتمد (submittable)** يُنشئه النظام ولا يُكتب يدوياً.

أهم حقوله كما هي في شيفرة ERPNext:

| الحقل | النوع | المعنى |
|-------|------|--------|
| `posting_date` | Date | تاريخ الترحيل — التاريخ الذي يظهر به القيد في التقارير |
| `transaction_date` | Date | تاريخ المعاملة الفعلي |
| `account` | Link → Account | الحساب المتأثر |
| `party_type` / `party` | Link / Dynamic Link | نوع الطرف (عميل، مورّد، موظف...) والطرف نفسه |
| `debit` / `credit` | Currency | المبلغ مدين/دائن **بعملة الشركة** |
| `account_currency` | Link → Currency | عملة الحساب |
| `debit_in_account_currency` / `credit_in_account_currency` | Currency | المبلغ بعملة الحساب |
| `transaction_currency` | Link → Currency | عملة المعاملة الأصلية |
| `transaction_exchange_rate` | Float | سعر الصرف المستخدم |
| `debit_in_transaction_currency` / `credit_in_transaction_currency` | Currency | المبلغ بعملة المعاملة |
| `debit_in_reporting_currency` / `credit_in_reporting_currency` | Currency | المبلغ بعملة التقارير للشركة |
| `against` | Text | الحسابات المقابلة في نفس المستند |
| `against_voucher_type` / `against_voucher` | Link / Dynamic Link | المستند المقابل — مثلاً الفاتورة التي تُسوّى بهذه الدفعة |
| `voucher_type` / `voucher_no` | Link / Dynamic Link | نوع ورقم المستند المصدر للقيد |
| `voucher_subtype` | Small Text | تصنيف فرعي للمستند (مثل نوع قيد الدفع) |
| `voucher_detail_no` | Data | معرّف السطر داخل المستند المصدر |
| `cost_center` | Link → Cost Center | مركز التكلفة |
| `project` | Link → Project | المشروع |
| `finance_book` | Link → Finance Book | دفتر الحسابات (للقيود المتوازية) |
| `fiscal_year` | Link → Fiscal Year | السنة المالية |
| `company` | Link → Company | الشركة |
| `is_opening` | Select (No/Yes) | هل القيد افتتاحي |
| `is_advance` | Select (No/Yes) | هل يمثّل دفعة مقدّمة |
| `due_date` | Date | تاريخ الاستحقاق (يُستخدم في تقارير الأعمار) |
| `is_cancelled` | Check | مُلغى — يُستبعد من التقارير افتراضياً |
| `remarks` | Text | ملاحظات/وصف القيد |

### 6.2 كيف تُنشأ القيود فعلياً

المحرّك المسؤول هو `erpnext/accounts/general_ledger.py`، ويمر بالخطوات التالية عند اعتماد أي مستند:

1. **`make_gl_entries()`** — نقطة الدخول: يستقبل خريطة القيود (`gl_map`) من المستند.
2. **`process_gl_map()`** — معالجة الخريطة قبل الحفظ:
   - **`distribute_gl_based_on_cost_center_allocation()`**: توزيع المبالغ حسب قواعد تخصيص مراكز التكلفة.
   - **`merge_similar_entries()`**: دمج السطور المتطابقة (نفس الحساب والطرف ومركز التكلفة والأبعاد) في سطر واحد لتقليل الضجيج.
   - **`toggle_debit_credit_if_negative()`**: تحويل المبالغ السالبة إلى الجهة المقابلة بدل تسجيل سالب.
   - **`process_debit_credit_difference()`** و**`make_round_off_gle()`**: إن بقي فرق ضمن حدّ السماح، يُرحَّل إلى حساب *Round Off* المحدّد في الشركة؛ وإن تجاوز الحد يرفع النظام خطأ **"Debit and Credit not equal"**.
3. **`make_acc_dimensions_offsetting_entry()`** — إنشاء قيد موازن للأبعاد المحاسبية عند تفعيل الخاصية.
4. **`save_entries()` / `make_entry()`** — حفظ واعتماد كل سجل `GL Entry`، مع تحديث **المبالغ المستحقة** على الفواتير المرتبطة (`update_outstanding`).
5. عند **الإلغاء**: `make_reverse_gl_entries()` تنشئ قيوداً عكسية، و`set_as_cancel()` تعلّم القيود القديمة بـ `is_cancelled = 1` بدل حذفها — فيبقى الأثر التدقيقي كاملاً.

كذلك يتحقق النظام قبل الترحيل من: أن الحساب ليس مجموعة، وأنه يخصّ نفس الشركة، وأن **الفترة المحاسبية ليست مقفلة**، وأن الحساب غير مجمّد، وأن التاريخ داخل سنة مالية صالحة.

### 6.3 تقرير General Ledger

التقرير هو الواجهة التي تقرأ بها هذا الجدول: **Accounting ← General Ledger**.

#### الفلاتر المتاحة

| الفلتر | النوع | الفائدة |
|--------|------|---------|
| **Company** | Link | الشركة (إلزامي) |
| **From Date / To Date** | Date | الفترة الزمنية للتقرير |
| **Finance Book** | Link | حصر النتائج بدفتر حسابات معيّن |
| **Account** | MultiSelectList | حساب واحد أو عدة حسابات — اختيار حساب مجموعة يشمل أبناءه |
| **Voucher No** | Data | كل قيود مستند بعينه |
| **Against Voucher No** | Data | القيود المرتبطة بمستند مقابل معيّن |
| **Party Type / Party / Party Name** | Autocomplete / MultiSelect | حصر بعميل أو مورّد أو موظف |
| **Categorize by** | Select | التجميع: *Categorize by Voucher* أو *Voucher (Consolidated)* أو *Account* أو *Party* |
| **Tax Id** | Data | البحث بالرقم الضريبي للطرف |
| **Currency** | Select | عملة العرض (Presentation Currency) — عرض النتائج بعملة مختلفة بسعر الصرف |
| **Cost Center** | MultiSelectList | مركز/مراكز تكلفة |
| **Project** | MultiSelectList | مشروع/مشاريع |
| **Consider Accounting Dimensions** | Check | إظهار الأبعاد المحاسبية كأعمدة وفلاتر |
| **Show Opening Entries** | Check | إظهار القيود الافتتاحية ضمن السطور |
| **Disable Opening Balance Calculation** | Check | تعطيل حساب الرصيد الافتتاحي (يسرّع التقارير الكبيرة) |
| **Include Default FB Entries** | Check | تضمين قيود دفتر الحسابات الافتراضي مع الدفتر المحدّد |
| **Show Cancelled Entries** | Check | إظهار القيود الملغاة |
| **Show Net Values in Party Account** | Check | عرض صافي القيمة لحساب الطرف بدل المدين والدائن منفصلين |
| **Show Credit / Debit in Company Currency** | Check | عرض المبالغ بعملة الشركة |
| **Add Columns in Transaction Currency** | Check | إضافة أعمدة بعملة المعاملة الأصلية |
| **Show Remarks** | Check | إظهار عمود الملاحظات |
| **Ignore Exchange Rate Revaluation and Gain / Loss Journals** | Check | استبعاد قيود إعادة تقييم الصرف والأرباح/الخسائر |
| **Ignore System Generated Credit / Debit Notes** | Check | استبعاد إشعارات الدائن/المدين التي ينشئها النظام آلياً |

#### أعمدة التقرير

`GL Entry` — `Posting Date` — `Account` — `Debit (العملة)` — `Credit (العملة)` — `Balance (العملة)` — [`Debit (Transaction)` / `Credit (Transaction)` / `Transaction Currency` عند التفعيل] — `Voucher Type` — `Voucher Subtype` — `Voucher No` — `Against Account` — `Party Type` — `Party` — `Party Name` — `Project` — [أعمدة الأبعاد المحاسبية] — `Cost Center` — `Against Voucher Type` — `Against Voucher` — `Supplier Invoice No` — `Remarks`.

#### قراءة التقرير

- يبدأ التقرير بسطر **Opening (الرصيد الافتتاحي)** قبل تاريخ البداية، ثم السطور التفصيلية، ثم **Total** و**Closing (الرصيد الختامي)**.
- عمود **Balance** رصيد تراكمي يتحرك مع كل سطر.
- **الرصيد الختامي = الافتتاحي + مجموع المدين − مجموع الدائن** (للحسابات المدينة الطبيعة، والعكس للدائنة).
- عند اختيار *Categorize by Party* أو *Account*، تُعرض مجاميع فرعية لكل طرف/حساب.

### 6.4 أمثلة عملية على القيود

**فاتورة مبيعات بمبلغ 1,000 + ضريبة 15% (نظام جرد دائم):**

| الحساب | مدين | دائن |
|--------|------|------|
| المدينون (Debtors) | 1,150 | |
| إيرادات المبيعات | | 1,000 |
| ضريبة القيمة المضافة المستحقة | | 150 |
| تكلفة البضاعة المباعة | 600 | |
| المخزون (Stock In Hand) | | 600 |

**تحصيل من العميل عبر Payment Entry:**

| الحساب | مدين | دائن |
|--------|------|------|
| البنك | 1,150 | |
| المدينون | | 1,150 |

ويكون `against_voucher` في هذا القيد = رقم فاتورة المبيعات، وهو ما يجعل التقرير قادراً على معرفة الفواتير المسدّدة من المفتوحة.

### 6.5 تشخيص المشاكل عبر دفتر الأستاذ

| العرض | السبب المرجّح | الفحص |
|-------|---------------|-------|
| رصيد العميل لا يطابق تقرير الذمم | دفعة غير مربوطة بفاتورة (`against_voucher` فارغ) | فلترة بالطرف ومراجعة عمود Against Voucher، ثم **Payment Reconciliation** |
| رصيد المخزون المحاسبي ≠ تقرير المخزون | قيود يدوية على حساب المخزون، أو جرد غير دائم | تقرير **Stock and Account Value Comparison** |
| فرق تقريب غريب | تقريب العملات متعدد السطور | مراجعة قيود حساب *Round Off* |
| قيود لا تظهر | فلتر Finance Book أو استبعاد القيود الملغاة أو الافتتاحية | فعّل *Show Opening Entries* / *Show Cancelled Entries* |
| بطء شديد في التقرير | مدى تواريخ واسع مع حساب الرصيد الافتتاحي | فعّل *Disable Opening Balance Calculation* وضيّق الفلاتر |

> **ملاحظات مهمة**: قيود دفتر الأستاذ لا تُحذف عند الإلغاء بل تُعلَّم كملغاة وتُنشأ لها قيود عكسية. ولإعادة بناء القيود بعد تغيير إعداد محاسبي، يوفّر النظام أداة **Repost Accounting Ledger** (يجب استخدامها بحذر وبعد نسخة احتياطية).

---

## 7. التقارير المالية

| التقرير | الغرض |
|---------|-------|
| **General Ledger** | كل الحركات التفصيلية (الفصل السابق) |
| **Trial Balance** | ميزان المراجعة: افتتاحي/حركة/ختامي لكل حساب |
| **Balance Sheet** | المركز المالي: الأصول والخصوم وحقوق الملكية |
| **Profit and Loss Statement** | الأرباح والخسائر عن فترة |
| **Cash Flow** | التدفقات النقدية (تشغيلية، استثمارية، تمويلية) |
| **Accounts Receivable / Payable** | الذمم المدينة والدائنة مع الأعمار (Ageing) |
| **Accounts Receivable Summary** | ملخّص مجمّع لكل عميل |
| **Trial Balance for Party** | ميزان مراجعة على مستوى الأطراف |
| **Sales / Purchase Register** | سجل الفواتير التفصيلي مع الضرائب |
| **Item-wise Sales / Purchase Register** | تحليل حسب الصنف |
| **Budget Variance Report** | الموازنة مقابل الفعلي |
| **Gross Profit** | هامش الربح حسب الصنف/العميل/المندوب |
| **Bank Reconciliation Statement** | فروق كشف البنك |
| **Consolidated Financial Statement** | قوائم موحّدة لمجموعة شركات |

جميعها تدعم فلاتر الفترة والشركة ودفتر الحسابات والأبعاد المحاسبية، والتصدير إلى Excel/CSV/PDF، والجدولة بالبريد عبر **Auto Email Report**.

---

## 8. المبيعات

### الدورة الكاملة

```
Lead (عميل محتمل) → Opportunity (فرصة) → Quotation (عرض سعر)
     → Sales Order (أمر بيع) → Delivery Note (سند تسليم)
     → Sales Invoice (فاتورة) → Payment Entry (تحصيل)
```

كل مستند يمكن توليده من سابقه بضغطة واحدة مع ترحيل البيانات، ويمكن تخطّي خطوات (فاتورة مباشرة دون أمر بيع مثلاً).

### المستندات والبيانات المرجعية

| العنصر | الوصف |
|--------|-------|
| **Customer** | العميل: المجموعة، المنطقة، شروط الدفع، الحد الائتماني، العملة |
| **Quotation** | عرض سعر بصلاحية زمنية، يتحوّل لأمر بيع |
| **Sales Order** | التزام بالتسليم؛ منه تُتابع نسب التسليم والفوترة |
| **Delivery Note** | خروج البضاعة من المخزون |
| **Sales Invoice** | إثبات الإيراد؛ يدعم **POS** والفوترة المتكررة |
| **Blanket Order** | اتفاقية كمية/سعر لفترة |
| **Price List / Item Price** | قوائم أسعار متعددة بعملات مختلفة |
| **Pricing Rule** | خصومات وأسعار مشروطة (كمية، عميل، فترة) |
| **Promotional Scheme** | حزم عروض متعددة الشروط |
| **Sales Person / Sales Partner** | المندوبون والعمولات |
| **Territory / Customer Group** | تقسيم السوق للتقارير والتسعير |

**تقارير مهمة**: Sales Analytics، Sales Order Analysis، Item-wise Sales History، Customer Credit Balance، Sales Funnel، Delivered Items To Be Billed.

---

## 9. المشتريات

```
Material Request (طلب مواد) → Request for Quotation (طلب عروض)
     → Supplier Quotation → Purchase Order (أمر شراء)
     → Purchase Receipt (سند استلام) → Purchase Invoice → Payment Entry
```

| العنصر | الوصف |
|--------|-------|
| **Supplier** | المورّد: المجموعة، شروط الدفع، العملة، الرقم الضريبي |
| **Material Request** | طلب داخلي (شراء، تحويل، تصنيع، إصدار مواد) |
| **RFQ / Supplier Quotation** | طلب عروض ومقارنتها؛ يمكن للمورّد الإدخال عبر البوابة |
| **Purchase Order** | التزام الشراء ومتابعة الاستلام والفوترة |
| **Purchase Receipt** | إدخال البضاعة للمخزون وإثبات فروق التكلفة |
| **Purchase Invoice** | إثبات المصروف/الأصل والدائن |
| **Landed Cost Voucher** | توزيع مصاريف الشحن والجمارك على تكلفة الأصناف |
| **Supplier Scorecard** | تقييم أداء الموردين بمعايير ودرجات |
| **Subcontracting Order / Receipt** | التصنيع لدى الغير مع تتبّع المواد المرسلة |

**تقارير مهمة**: Purchase Analytics، Purchase Order Analysis، Requested Items To Order، Purchase Receipt Trends، Item-wise Purchase History.

---

## 10. المخزون والمستودعات

### المفاهيم

- **Item (الصنف)**: قد يكون مخزنياً أو خدمياً، بمتغيرات (Variants) عبر خصائص مثل المقاس واللون.
- **Warehouse (المستودع)**: شجري، ومرتبط بحساب مخزون في نظام الجرد الدائم.
- **Stock Ledger Entry (SLE)**: سجل كل حركة صنف — الكمية، سعر التقييم، الرصيد بعد الحركة.
- **Bin**: الرصيد المجمّع لصنف في مستودع (فعلي، محجوز، مطلوب، متوقع).
- **Serial No / Batch No**: تتبّع بالرقم التسلسلي أو الدفعة؛ في v15 تُدار عبر **Serial and Batch Bundle**.

### الحركات

| المستند | الاستخدام |
|---------|-----------|
| **Stock Entry** | استلام مواد، صرف، تحويل بين مستودعات، تصنيع، إعادة تعبئة |
| **Stock Reconciliation** | جرد فعلي وتعديل الكميات/التقييم، وإدخال الأرصدة الافتتاحية |
| **Delivery Note / Purchase Receipt** | حركات البيع والشراء |
| **Material Request** | طلبات النقل والشراء |
| **Pick List / Packing Slip / Shipment** | التجهيز والتغليف والشحن |
| **Quality Inspection** | فحص الجودة عند الاستلام أو التسليم |
| **Putaway Rule** | توجيه البضاعة الواردة لمواقع التخزين |

### التقييم والمحاسبة

- طرق التقييم: **FIFO** (الوارد أولاً صادر أولاً) و**Moving Average** (المتوسط المتحرك).
- **الجرد الدائم (Perpetual Inventory)**: كل حركة مخزون تولّد قيوداً محاسبية فوراً — وهو الوضع الافتراضي والمنصوح به.
- **إعادة الطلب (Reorder Level)**: توليد طلبات مواد تلقائياً عند نزول الرصيد عن حد معيّن.

**تقارير مهمة**: Stock Balance، Stock Ledger، Stock Projected Qty، Stock Ageing، Item Shortage Report، Batch-wise Balance History، Stock and Account Value Comparison.

---

## 11. التصنيع

| العنصر | الوصف |
|--------|-------|
| **BOM (قائمة المواد)** | مكوّنات المنتج وكمياتها وتكلفتها، وتدعم التداخل (BOM داخل BOM) |
| **Work Order (أمر عمل)** | أمر تصنيع كمية محددة مع حجز المواد ومتابعة الإنجاز |
| **Job Card (بطاقة مهمة)** | تنفيذ عملية على محطة عمل مع تسجيل الوقت |
| **Operation / Workstation / Routing** | العمليات ومحطات العمل ومساراتها وتكلفة الساعة |
| **Production Plan** | التخطيط من أوامر البيع/توقعات الطلب وتوليد أوامر العمل وطلبات الشراء |
| **BOM Update Tool** | استبدال مكوّن في كل قوائم المواد دفعة واحدة |
| **Downtime Entry** | تسجيل توقف المحطات |
| **Plant Floor** | شاشة متابعة أرضية المصنع (v15) |

التكلفة تُحتسب من المواد + العمليات (وقت × تكلفة ساعة) + المصاريف الإضافية، وتُرحَّل عبر قيود **Work in Progress** ثم **Finished Goods**.

---

## 12. الموارد البشرية والرواتب

منذ الإصدار 14 صارت الموارد البشرية تطبيقاً مستقلاً باسم **`hrms`** يُثبّت بجانب ERPNext.

| المجال | المستندات |
|--------|-----------|
| **بيانات الموظفين** | Employee، Employee Group، Designation، Department، Branch |
| **الحضور والانصراف** | Attendance، Employee Checkin، Shift Type، Shift Assignment، Attendance Request |
| **الإجازات** | Leave Type، Leave Policy، Leave Allocation، Leave Application، Holiday List، Compensatory Leave |
| **الرواتب** | Salary Component، Salary Structure، Salary Structure Assignment، Payroll Entry، Salary Slip، Payroll Period، Income Tax Slab |
| **المصروفات** | Expense Claim، Employee Advance، Travel Request |
| **التوظيف** | Job Opening، Job Applicant، Job Offer، Appointment Letter، Employee Onboarding/Separation |
| **الأداء والتطوير** | Appraisal، Appraisal Template، Goal، Training Program/Event/Result |

الرواتب تُرحَّل محاسبياً عبر قيد يومية لكل دورة، ويمكن توليد ملف تحويل بنكي. التطبيق يوفّر أيضاً تطبيق موبايل لطلبات الإجازة والحضور.

---

## 13. المشاريع

- **Project**: الميزانية، التواريخ، العميل، نسبة الإنجاز، والربحية (إيراد مقابل تكلفة).
- **Task**: مهام هرمية بحالات وتبعيات وتواريخ، بعرض قائمة/Kanban/Gantt.
- **Timesheet**: تسجيل ساعات العمل، مع إمكانية الفوترة منها مباشرة.
- **Activity Type / Activity Cost**: أنواع الأنشطة وتكلفة الساعة لكل موظف.
- **Project Template**: قالب مشروع بمهام جاهزة.

المشروع يظهر كبُعد في القيود المحاسبية، فتستطيع استخراج أرباح وخسائر لكل مشروع من دفتر الأستاذ.

---

## 14. الأصول الثابتة

| العنصر | الوصف |
|--------|-------|
| **Asset Category** | فئة الأصل: الحسابات المحاسبية، طريقة ومدة الإهلاك |
| **Asset** | الأصل: تاريخ الشراء، القيمة، القيمة التخريدية، الموقع، المسؤول |
| **Depreciation Schedule** | جدول الإهلاك المولّد تلقائياً |
| **Asset Movement** | نقل الأصل بين المواقع أو الموظفين |
| **Asset Repair** | تكاليف الصيانة وإضافتها للقيمة عند اللزوم |
| **Asset Value Adjustment** | تعديل القيمة الدفترية |
| **Asset Capitalization** | رسملة أصل من مواد وخدمات |
| **Asset Maintenance** | جدولة الصيانة الدورية |

طرق الإهلاك: **القسط الثابت (Straight Line)**، **القسط المتناقص (Declining Balance / WDV)**، **المضاعف المتناقص (Double Declining)**، أو **يدوي (Manual)**. قيود الإهلاك تُرحَّل تلقائياً عبر المجدول الشهري، ويمكن استخدام **Finance Book** لجدولَي إهلاك مختلفين (محاسبي وضريبي).

---

## 15. CRM والدعم والجودة

**CRM**: `Lead` ← `Opportunity` ← `Quotation`، مع `Contact` و`Address` و`Campaign` و`Communication` (تكامل البريد) و`Appointment` (حجز مواعيد). يوجد أيضاً تطبيق **Frappe CRM** المستقل بواجهة أحدث.

**الدعم**: `Issue` (تذكرة)، `Service Level Agreement` (أوقات الاستجابة والحل)، `Warranty Claim`، `Maintenance Schedule/Visit`. للدعم المتقدم يوجد تطبيق **Frappe Helpdesk** المستقل.

**الجودة**: `Quality Inspection` و`Quality Inspection Template`، و`Quality Goal`، `Quality Procedure`، `Quality Review`، `Quality Action`، `Non Conformance`، `Quality Feedback` — لبناء نظام إدارة جودة مطابق لمنهجيات ISO.

---

## 16. الموقع والبوابة والمتجر

- **Website**: صفحات (`Web Page`)، مدوّنة (`Blog Post`)، نماذج ويب (`Web Form`)، قوائم تنقّل، سمات (`Website Theme`).
- **Customer / Supplier Portal**: يدخل العميل ليرى عروضه وأوامره وفواتيره وشحناته، والمورّد ليقدّم عروض أسعار.
- **Webshop**: تطبيق منفصل (منذ v15) للمتجر الإلكتروني — عرض المنتجات، السلة، الطلبات، بوابات الدفع عبر تطبيق `payments`.
- **Frappe Builder**: أداة بناء صفحات بالسحب والإفلات.

---

## 17. المستخدمون والصلاحيات

نموذج الصلاحيات في Frappe متعدد الطبقات:

1. **Role (الدور)**: يُمنح للمستخدم، وعليه تُبنى صلاحيات كل DocType.
2. **Role Permissions Manager**: لكل دور ونوع مستند: قراءة، كتابة، إنشاء، حذف، اعتماد، إلغاء، تعديل بعد الاعتماد، طباعة، بريد، تصدير، مشاركة، تقرير.
3. **Permission Level (0–9)**: صلاحية على مستوى الحقول — ترفع مستوى حقول حساسة (كالتكلفة) وتمنح دوراً معيناً فقط حق قراءتها/تعديلها.
4. **User Permission**: تقييد مستخدم بسجلات معيّنة (شركة، مستودع، منطقة) فيرى ما يخصّه فقط.
5. **Role Profile / Module Profile**: حزم أدوار ووحدات جاهزة لتسريع إنشاء المستخدمين.
6. **Share**: مشاركة مستند بعينه مع مستخدم محدد.
7. **`permission_query_conditions` / `has_permission`**: شروط برمجية مخصّصة في التطبيقات.

أفضل الممارسات: حساب `Administrator` للطوارئ فقط، تفعيل التحقق بخطوتين، مراجعة دورية لـ **User Permissions**، ومنع صلاحية الحذف عن معظم الأدوار والاكتفاء بالإلغاء.

---

## 18. سير العمل والأتمتة والإشعارات

| الأداة | الوظيفة |
|--------|---------|
| **Workflow** | مسار اعتمادات: حالات (`Workflow State`) وانتقالات (`Workflow Action`) لكل دور — مثل: مسودة ← بانتظار موافقة المدير ← معتمد |
| **Notification** | إشعار/بريد عند شرط معيّن (عند الحفظ، عند تغيير قيمة، قبل تاريخ بأيام) |
| **Email Alert / Email Digest** | ملخص دوري بالمؤشرات للإدارة |
| **Assignment Rule** | توزيع تلقائي للمستندات على الموظفين (بالتناوب أو حسب الحمل) |
| **Auto Repeat** | تكرار مستند دورياً (فاتورة اشتراك شهرية مثلاً) |
| **Scheduled Job / `scheduler_events`** | مهام مجدولة برمجية (يومية، ساعية، أسبوعية، أو بـ cron) |
| **Webhook** | استدعاء رابط خارجي عند حدث في النظام |
| **Server Script (Scheduler)** | سكربت Python يعمل بجدولة دون كتابة تطبيق |
| **Energy Points** | تحفيز المستخدمين بنقاط على الإنجازات |

---

## 19. التخصيص والبرمجة

### 19.1 التخصيص بدون كود

| الأداة | ماذا تفعل |
|--------|-----------|
| **Customize Form** | إضافة/إخفاء/إعادة ترتيب الحقول، تغيير التسميات والخصائص لأي DocType |
| **Custom Field** | حقل جديد على مستند قياسي |
| **Property Setter** | تعديل خاصية حقل قياسي (إلزامي، للقراءة فقط، مخفي) دون تعديل الشيفرة |
| **Custom DocType** | نوع مستند جديد كلياً خاص بعملك |
| **Print Format Builder / Print Designer** | تصميم قوالب الطباعة |
| **Workspace** | تخصيص الصفحات الرئيسية للوحدات |
| **Report Builder** | تقارير جدولية بالفلاتر والأعمدة دون كود |

### 19.2 السكربتات

**Client Script** (JavaScript في المتصفح، على مستند محدد):

```javascript
frappe.ui.form.on("Sales Invoice", {
    customer(frm) {
        if (!frm.doc.customer) return;
        frappe.db.get_value("Customer", frm.doc.customer, "customer_group")
            .then(r => frm.set_value("customer_group", r.message.customer_group));
    },
    validate(frm) {
        if (frm.doc.grand_total > 100000 && !frm.doc.po_no) {
            frappe.throw(__("رقم أمر الشراء إلزامي للفواتير فوق 100,000"));
        }
    },
    refresh(frm) {
        if (frm.doc.docstatus === 1) {
            frm.add_custom_button(__("إرسال تذكير"), () => {
                frappe.call({ method: "my_app.api.send_reminder", args: { name: frm.doc.name } });
            });
        }
    }
});
```

**Server Script** (Python من داخل الواجهة — يتطلب تفعيل `server_script_enabled`):

```python
# نوع: Document Event | DocType: Sales Invoice | الحدث: Before Save
if doc.grand_total > 50000 and not doc.taxes:
    frappe.throw("لا يمكن اعتماد فاتورة كبيرة بدون ضرائب")
```

### 19.3 التطبيق المخصّص (الطريقة المهنية)

التخصيص الجاد يوضع في تطبيق مستقل ليبقى قابلاً للنسخ والترقية والتتبّع في Git:

```bash
bench new-app my_app
bench --site mysite.local install-app my_app
```

`hooks.py` هو ملف الربط الرئيسي:

```python
app_name = "my_app"

doc_events = {
    "Sales Invoice": {
        "validate": "my_app.overrides.sales_invoice.validate",
        "on_submit": "my_app.overrides.sales_invoice.on_submit",
    }
}

scheduler_events = {
    "daily": ["my_app.tasks.send_daily_summary"],
    "cron": {"0 2 * * *": ["my_app.tasks.nightly_sync"]},
}

doctype_js = {"Sales Invoice": "public/js/sales_invoice.js"}

fixtures = ["Custom Field", "Property Setter", {"dt": "Role", "filters": [["name", "like", "My %"]]}]

override_doctype_class = {"Sales Invoice": "my_app.overrides.CustomSalesInvoice"}
```

مثال على منطق خادم:

```python
import frappe
from frappe import _

def validate(doc, method=None):
    if doc.is_return and not doc.return_against:
        frappe.throw(_("يجب تحديد الفاتورة الأصلية للمرتجع"))

@frappe.whitelist()
def get_customer_balance(customer: str, company: str) -> float:
    return frappe.db.get_value(
        "GL Entry",
        {"party_type": "Customer", "party": customer, "company": company, "is_cancelled": 0},
        "sum(debit) - sum(credit)",
    ) or 0.0
```

### 19.4 قواعد ذهبية للتخصيص

- **لا تعدّل شيفرة `frappe` أو `erpnext` مباشرة** — سيضيع التعديل عند أول ترقية.
- ضع كل شيء في تطبيق مخصّص تحت Git، وصدّر التخصيصات كـ `fixtures`.
- لا تضع عمليات ثقيلة في `validate` — استخدم `frappe.enqueue` للخلفية.
- استخدم `frappe.db.get_value` بدل تحميل مستند كامل عند الحاجة لحقل واحد.
- اختبر كل تخصيص على موقع تجريبي بنسخة من بيانات الإنتاج قبل النشر.

---

## 20. واجهات REST API والتكامل

كل DocType متاح تلقائياً عبر REST دون كتابة أي كود.

### المصادقة

| الطريقة | الاستخدام |
|---------|-----------|
| **API Key + Secret** | `Authorization: token <api_key>:<api_secret>` — الأنسب للتكاملات بين الأنظمة |
| **جلسة (Cookie)** | `/api/method/login` بالمستخدم وكلمة المرور |
| **OAuth 2.0** | لتطبيقات الطرف الثالث |

### نقاط النهاية

```bash
# قائمة مع فلاتر وحقول
GET /api/resource/Sales Invoice?filters=[["status","=","Overdue"]]&fields=["name","customer","grand_total"]&limit_page_length=20

# مستند واحد
GET /api/resource/Sales Invoice/ACC-SINV-2026-00001

# إنشاء
POST /api/resource/Sales Invoice     (JSON في الجسم)

# تعديل
PUT /api/resource/Sales Invoice/ACC-SINV-2026-00001

# حذف
DELETE /api/resource/Sales Invoice/ACC-SINV-2026-00001

# استدعاء دالة معلن عنها بـ @frappe.whitelist()
POST /api/method/my_app.api.get_customer_balance
```

مثال عملي:

```bash
curl -X GET "https://erp.example.com/api/resource/GL Entry" \
  -H "Authorization: token abc123:def456" \
  --data-urlencode 'filters=[["account","=","1110 - النقدية - ABC"],["posting_date",">=","2026-01-01"]]' \
  --data-urlencode 'fields=["posting_date","debit","credit","voucher_no"]' \
  -G
```

**أدوات تكامل أخرى**: Webhooks، `frappe-client` لبايثون، تكامل البريد (IMAP/SMTP)، بوابات الدفع عبر تطبيق `payments`، ودعم Google Calendar/Drive/Contacts، وواردات/صادرات CSV.

---

## 21. التقارير ولوحات المعلومات

| النوع | الوصف |
|-------|-------|
| **Report Builder** | تقرير جدولي من الواجهة: أعمدة، فلاتر، تجميع، حفظ وإتاحة للأدوار |
| **Query Report** | تقرير بجملة SQL مباشرة، مع فلاتر معرّفة |
| **Script Report** | تقرير بلغة Python يعيد أعمدة وبيانات — أقوى وأكثر مرونة |
| **Dashboard Chart** | رسوم بيانية من مستند أو تقرير أو SQL |
| **Number Card** | مؤشر رقمي مفرد (KPI) |
| **Dashboard / Workspace** | تجميع البطاقات والرسوم في صفحة واحدة |
| **Auto Email Report** | إرسال أي تقرير دورياً بالبريد كـ Excel أو CSV |
| **Prepared Report** | تشغيل التقارير الثقيلة في الخلفية وحفظ نتيجتها |
| **Insights** | تطبيق Frappe مستقل للتحليلات ولوحات BI متقدمة |

كل قائمة في النظام تدعم أيضاً عروضاً بديلة: **List, Report, Kanban, Calendar, Gantt, Dashboard, Image, Tree, Map**.

---

## 22. الاستيراد والتصدير والنسخ الاحتياطي

### الاستيراد

**Data Import** أداة الاستيراد القياسية: نزّل القالب (بالحقول التي تختارها)، املأه، ثم ارفعه في وضع **Insert** أو **Update**، مع معاينة الأخطاء قبل التنفيذ. ترتيب الترحيل الموصى به:

```
الشركة والسنة المالية → شجرة الحسابات → مراكز التكلفة
→ مجموعات ووحدات القياس والأصناف → المستودعات
→ العملاء والموردون والعناوين وجهات الاتصال
→ قوائم الأسعار وأسعار الأصناف
→ الأرصدة الافتتاحية (قيد يومية افتتاحي + Stock Reconciliation)
→ الفواتير المفتوحة (لتظهر صحيحة في تقارير الذمم)
```

### النسخ الاحتياطي

```bash
bench --site mysite.local backup                 # قاعدة البيانات فقط
bench --site mysite.local backup --with-files    # مع المرفقات
bench --site mysite.local restore /path/to/backup.sql.gz
```

- النسخ تُحفظ في `sites/<site>/private/backups/`.
- فعّل النسخ التلقائي وارفعه لتخزين خارجي (S3/Dropbox/Google Drive) عبر إعدادات النظام أو مهمة مجدولة.
- **اختبر الاستعادة دورياً** — نسخة لم تُختبر ليست نسخة.
- احتفظ بمفتاح التشفير `encryption_key` من `site_config.json`؛ بدونه لا تُقرأ الحقول المشفّرة (كلمات مرور التكاملات).

---

## 23. التنصيب والنشر والصيانة

### خيارات التشغيل

| الخيار | الأنسب لـ |
|--------|-----------|
| **Frappe Cloud** | الإنتاج بلا صداع صيانة — نسخ احتياطي وترقيات وSSL مُدارة |
| **Docker (frappe_docker)** | نشر موحّد وقابل للتكرار، والأنسب للفرق التقنية |
| **Easy Install Script** | إعداد سريع على خادم نظيف |
| **Manual Bench Install** | تحكّم كامل، وهو المسار المعتاد للتطوير |
| **مزوّدون آخرون** | استضافات متخصّصة بـ ERPNext |

### متطلبات تقريبية (v15)

Ubuntu 22.04+ أو Debian، Python 3.10+، MariaDB 10.6+، Redis 6+، Node 18+، Yarn، wkhtmltopdf (نسخة patched qt للطباعة الصحيحة). موارد البداية: 4 GB RAM (8+ للإنتاج الجاد) و2 vCPU وقرص SSD.

### أوامر Bench الأساسية

```bash
# التطوير
bench start                                  # تشغيل كل العمليات
bench new-site mysite.local                  # موقع جديد
bench get-app erpnext --branch version-15    # جلب تطبيق
bench --site mysite.local install-app erpnext
bench --site mysite.local console            # صدفة Python تفاعلية
bench --site mysite.local mariadb            # صدفة قاعدة البيانات

# الصيانة
bench --site mysite.local migrate            # تطبيق تغييرات المخطط بعد التحديث
bench --site mysite.local clear-cache
bench build                                  # بناء ملفات JS/CSS
bench restart
bench update                                 # جلب التحديثات + بناء + ترحيل
bench --site mysite.local set-maintenance-mode on
bench --site mysite.local enable-scheduler
bench doctor                                 # فحص العمّال والطوابير

# الإنتاج
bench setup production <user>
bench setup nginx && bench setup supervisor
bench setup lets-encrypt mysite.com
```

### روتين ترقية آمن

1. نسخة احتياطية كاملة (قاعدة بيانات + ملفات) واحتفظ بها خارج الخادم.
2. جرّب الترقية أولاً على موقع نسخة طبق الأصل من الإنتاج.
3. راجع ملاحظات إصدار Frappe وERPNext والتغييرات الكاسرة.
4. راجع تطبيقاتك المخصّصة وتوافق فرعها مع الإصدار الجديد.
5. فعّل وضع الصيانة، نفّذ `bench update`، ثم `bench --site ... migrate`.
6. اختبر: فاتورة، دفعة، حركة مخزون، تقرير General Ledger، الطباعة، البريد.

### المراقبة والسجلات

- سجلات النظام في `frappe-bench/logs/` (`web.error.log`, `worker.error.log`, `schedule.log`).
- من الواجهة: **Error Log**، **Scheduled Job Log**، **Background Jobs**، **Email Queue**، **Activity Log**، و**Version** (سجل تغييرات كل مستند).
- راقب: امتلاء القرص، حجم `tabVersion` و`tabError Log`، تراكم طوابير Redis، وتوقف المجدول.

---

## 24. الأداء والتوسع

| المحور | الإجراء |
|--------|---------|
| **عمّال Gunicorn** | عدّل العدد ≈ (2 × عدد الأنوية) + 1 في `common_site_config.json` |
| **عمّال الخلفية** | ثلاثة طوابير: `short` و`default` و`long` — زد عمّال `long` لو كثرت التقارير والاستيراد |
| **MariaDB** | ضبط `innodb_buffer_pool_size` (≈ 60–70% من الذاكرة)، ومراجعة الاستعلامات البطيئة |
| **Redis** | افصل نسخ cache/queue/socketio، وراقب الاستهلاك |
| **التقارير الثقيلة** | استخدم **Prepared Report** وضيّق نطاق التواريخ وعطّل حساب الرصيد الافتتاحي |
| **تنظيف البيانات** | حذف دوري لسجلات `Error Log` و`Version` و`Email Queue` القديمة |
| **الفهارس** | أضف فهرساً على الحقول كثيرة الفلترة في مستنداتك المخصّصة |
| **الملفات** | انقل المرفقات الكبيرة لتخزين خارجي، وفعّل CDN للملفات الثابتة |
| **التخصيص** | راجع السكربتات التي تعمل في `validate`/`refresh` — أكثر البطء يأتي منها |

---

## 25. التعريب والامتثال الضريبي (ZATCA)

### العربية وواجهة RTL

- النظام يدعم العربية كاملة: **My Settings ← Language ← العربية**، وتنقلب الواجهة تلقائياً إلى الاتجاه من اليمين لليسار.
- الترجمات قابلة للتعديل عبر DocType **Translation** لتغيير أي مصطلح بما يناسب عرفك المحلي.
- قوالب الطباعة تدعم العربية؛ تأكد من خط عربي مناسب في القالب وفي إعداد wkhtmltopdf لتفادي تشوّه الحروف في PDF.
- التقويم الهجري والصيغ المحلية تُضاف عبر تطبيقات أو دوال مخصّصة.

### ضريبة القيمة المضافة والفوترة الإلكترونية

- **ضريبة القيمة المضافة (15% في السعودية)**: تُعرَّف عبر `Sales/Purchase Taxes and Charges Template` و`Item Tax Template` و`Tax Category`، وتُستخرج إقراراتها من تقارير Sales/Purchase Register وحسابات الضريبة في دفتر الأستاذ.
- **فوترة ZATCA (فاتورة)**:
  - **المرحلة الأولى (الإصدار)**: فاتورة إلكترونية بحقول إلزامية ورمز **QR** مشفّر بصيغة TLV يتضمن اسم البائع والرقم الضريبي والتاريخ والإجمالي وقيمة الضريبة.
  - **المرحلة الثانية (الربط)**: توليد XML بمعيار **UBL 2.1**، وختم تشفيري (Cryptographic Stamp)، وربط مباشر مع منصة الهيئة (Clearance للفواتير الضريبية وReporting للفواتير المبسطة).
  - ERPNext لا يوفّر هذا جاهزاً في النواة؛ تُستخدم تطبيقات متخصّصة (مثل حزم امتثال ZATCA من شركاء التنفيذ) — تحقّق من دعم الحزمة لإصدارك قبل الاعتماد.

> عند التنفيذ في السعودية أو الخليج: ثبّت متطلبات الرقم الضريبي والعنوان الوطني في بيانات الشركة والعملاء منذ البداية، فتعديلها بعد إصدار آلاف الفواتير مكلف.

---

## 26. مشاكل شائعة وحلولها

| المشكلة | السبب | الحل |
|---------|-------|------|
| `Debit and Credit not equal` | فرق تقريب أو خطأ في سطور القيد | راجع حساب *Round Off* في الشركة ودقّة العملة |
| لا يمكن الترحيل في تاريخ معيّن | فترة محاسبية مقفلة أو تجميد حسابات | راجع **Accounting Period** و**Accounts Settings** |
| رصيد المخزون سالب | تسلسل حركات غير صحيح أو تاريخ رجعي | فعّل/راجع منع الرصيد السالب، وأعد ترتيب الحركات |
| قيمة المخزون ≠ حساب المخزون | قيود يدوية على حساب المخزون | تقرير **Stock and Account Value Comparison**، وامنع القيد اليدوي على حسابات المخزون |
| البريد لا يُرسل | إعداد SMTP أو حظر المزوّد | **Email Account** و**Email Queue** وسجل الأخطاء |
| المهام المجدولة متوقفة | المجدول معطّل | `bench --site ... enable-scheduler` و`bench doctor` |
| PDF مشوّه أو عربي مقلوب | نسخة wkhtmltopdf غير مناسبة أو خط ناقص | ثبّت نسخة patched-qt واضبط الخط في القالب |
| بطء عام مفاجئ | مهمة خلفية عالقة أو استعلام ثقيل أو امتلاء القرص | **Background Jobs**، سجلات الأخطاء، مساحة القرص |
| فقدان تخصيصات بعد الترقية | التعديل كان على الشيفرة الأصلية | انقل التخصيصات لتطبيق مخصّص و`fixtures` |
| مستند معتمد بحاجة تعديل | تصميم النظام يمنع ذلك | Cancel ثم Amend، أو اسمح بتعديل حقل محدد عبر `allow_on_submit` |

---

## 27. مسرد المصطلحات

| English | العربية | المعنى |
|---------|---------|--------|
| DocType | نوع المستند | تعريف الجدول والنموذج والصلاحيات |
| Doc / Document | مستند | سجل من نوع مستند |
| Submit / Cancel / Amend | اعتماد / إلغاء / تعديل بنسخة | دورة حياة المستند المالي |
| GL Entry | قيد دفتر الأستاذ | سطر مدين أو دائن مرحّل |
| Voucher | المستند المصدر | الفاتورة أو القيد الذي ولّد القيود |
| Against Voucher | المستند المقابل | الفاتورة التي تُسوّى بالدفعة |
| Chart of Accounts | شجرة الحسابات | الهيكل الشجري للحسابات |
| Cost Center | مركز التكلفة | وحدة تحليل التكاليف |
| Accounting Dimension | البُعد المحاسبي | بُعد تحليلي إضافي (فرع، قطاع) |
| Finance Book | دفتر الحسابات | مجموعة قيود متوازية |
| Fiscal Year | السنة المالية | فترة التقارير السنوية |
| Party / Party Type | الطرف / نوع الطرف | العميل أو المورّد أو الموظف |
| Outstanding Amount | المبلغ المستحق | غير المسدّد من الفاتورة |
| Perpetual Inventory | الجرد الدائم | ترحيل محاسبي فوري لحركات المخزون |
| Stock Ledger Entry | قيد دفتر المخزون | سجل حركة صنف |
| Valuation Rate | سعر التقييم | تكلفة الوحدة في المخزون |
| BOM | قائمة المواد | مكوّنات المنتج المصنّع |
| Work Order | أمر العمل | أمر تصنيع كمية |
| Naming Series | سلسلة الترقيم | صيغة توليد أرقام المستندات |
| Workflow | سير العمل | مسار الاعتمادات |
| Bench | البِنش | أداة ومجلد إدارة التنصيب |
| Site | الموقع | قاعدة بيانات وإعدادات مستقلة |
| App | التطبيق | حزمة برمجية فوق Frappe |
| Fixtures | التثبيتات | تخصيصات تُصدَّر مع التطبيق |
| Hook | خطّاف | نقطة ربط منطق مخصّص |

---

## 28. مصادر ومراجع

| المصدر | الرابط |
|--------|--------|
| توثيق ERPNext الرسمي | <https://docs.frappe.io/erpnext> |
| صفحة دفتر الأستاذ العام | <https://docs.frappe.io/erpnext/general-ledger> |
| توثيق إطار Frappe | <https://docs.frappe.io/framework> |
| شيفرة ERPNext على GitHub | <https://github.com/frappe/erpnext> |
| شيفرة Frappe Framework | <https://github.com/frappe/frappe> |
| تطبيق الموارد البشرية | <https://github.com/frappe/hrms> |
| منتدى المجتمع | <https://discuss.frappe.io> |
| دورات Frappe School | <https://frappe.school> |
| الاستضافة المُدارة | <https://frappecloud.com> |
| التنصيب عبر Docker | <https://github.com/frappe/frappe_docker> |

> ملاحظة أخيرة: أسماء الحقول والفلاتر الواردة في فصل دفتر الأستاذ العام مستخرجة من شيفرة ERPNext على فرع `develop`، وقد تختلف اختلافاً طفيفاً حسب إصدارك — راجع التوثيق الرسمي لإصدارك عند أي تعارض.
