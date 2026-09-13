/* =============================================================
   بوابة الطبيب — FR-10 .. FR-13
   ============================================================= */
(function () {
  'use strict';
  var S = window.GC.store, U = window.GC.ui, E = window.GC.engine;
  var view = U.$('#view');

  function db() { return S.load(); }
  function me() {
    var d = db();
    return E.doctorById(d, d.session.doctorId);
  }
  function go(h) { location.hash = h; }

  var NAV = [
    { key: 'inbox', icon: '📥', label: 'صندوق الحالات' },
    { key: 'schedule', icon: '🗓️', label: 'أوقات الزيارة' },
    { key: 'finance', icon: '💰', label: 'حسابي' },
    { key: 'profile', icon: '👤', label: 'البروفايل' }
  ];

  function paintNav(active) {
    var host = U.$('#side-nav');
    U.clear(host);
    var doc = me();
    if (!doc) return;
    var wrap = U.el('div', { class: 'side__links-wrap' }, NAV.map(function (it) {
      return U.el('a', {
        class: 'side__link' + (it.key === active ? ' is-active' : ''), href: '#/' + it.key
      }, [U.el('span', { class: 'ico', text: it.icon }), U.el('span', { text: it.label })]);
    }));
    host.appendChild(wrap);
    var foot = U.$('#side-foot');
    U.clear(foot);
    foot.appendChild(U.el('div', {}, [
      U.el('div', { html: 'الطبيب: <b style="color:#fff">' + U.esc(doc.name) + '</b>' }),
      U.el('div', { text: doc.specialty }),
      U.el('button', {
        class: 'btn btn--sm btn--ghost', style: 'margin-top:8px;color:#fff;border-color:rgba(255,255,255,.3)',
        text: 'تبديل الحساب',
        onclick: function () {
          S.update(function (d) { d.session.doctorId = null; });
          go('#/login');
        }
      })
    ]));
  }

  function head(title, sub, actions) {
    return U.el('div', { class: 'page-head' }, [
      U.el('div', {}, [U.el('h1', { text: title }), sub ? U.el('p', { text: sub }) : null]),
      actions ? U.el('div', { class: 'row', style: 'gap:8px' }, actions) : null
    ]);
  }

  /* ---------- اختيار الحساب (لا يوجد خادم مصادقة في نسخة المعاينة) ---------- */

  function renderLogin() {
    var d = db();
    var active = d.doctors.filter(function (x) { return x.status === 'active'; });
    U.mount(view, U.el('div', { class: 'stack', style: 'max-width:520px' }, [
      head('دخول الطبيب', 'حسابات الأطباء يُنشئها المشرف العام — اختر حساباً لتجربة البوابة.'),
      U.el('div', { class: 'card stack' }, active.map(function (x) {
        return U.el('button', {
          class: 'wallet', type: 'button',
          onclick: function () {
            S.update(function (dd) { dd.session.doctorId = x.id; dd.session.role = 'doctor'; });
            go('#/inbox');
          }
        }, [
          U.el('span', { class: 'wallet__icon', text: '🩺' }),
          U.el('span', { class: 'grow' }, [
            U.el('div', { text: x.name }),
            U.el('div', { class: 'small muted', text: x.specialty })
          ])
        ]);
      }))
    ]));
  }

  /* ---------- صندوق الحالات (FR-12) ---------- */

  var filter = 'open';

  function renderInbox() {
    var d = db(), doc = me();
    var mine = d.consultations.filter(function (c) { return c.doctorId === doc.id; });
    var open = mine.filter(function (c) { return c.status === 'new' || c.status === 'in_review'; });
    var answered = mine.filter(function (c) { return c.status === 'answered'; });
    var closed = mine.filter(function (c) { return c.status === 'closed'; });

    var tabs = [
      { key: 'open', label: 'قيد المراجعة (' + U.num(open.length) + ')', rows: open },
      { key: 'answered', label: 'مُجاب عليها (' + U.num(answered.length) + ')', rows: answered },
      { key: 'closed', label: 'مغلقة (' + U.num(closed.length) + ')', rows: closed }
    ];
    var current = tabs.filter(function (t) { return t.key === filter; })[0] || tabs[0];

    var seg = U.el('div', { class: 'seg' }, tabs.map(function (t) {
      return U.el('button', {
        class: t.key === filter ? 'is-active' : '', text: t.label,
        onclick: function () { filter = t.key; renderInbox(); }
      });
    }));

    var urgentOpen = open.filter(function (c) { return c.urgent; });

    U.mount(view, U.el('div', { class: 'stack' }, [
      head('صندوق الحالات', 'الحالات المسندة إليك فقط — لا يمكنك الاطلاع على حالات خارج نطاقك (NFR-3).'),
      U.el('div', { class: 'grid grid--kpi' }, [
        U.stat({ label: 'قيد المراجعة', value: U.num(open.length) }),
        U.stat({ label: 'طارئة', value: U.num(urgentOpen.length), accent: urgentOpen.length ? 'danger' : null }),
        U.stat({ label: 'مُجاب عليها', value: U.num(answered.length) }),
        U.stat({ label: 'الزمن الملزم', value: U.num(d.settings.slaHours) + ' ساعة' })
      ]),
      U.el('div', { class: 'toolbar' }, [seg]),
      current.rows.length ? U.table([
        { title: 'الحالة', key: 'id' },
        { title: 'وردت', render: function (c) { return U.ago(c.createdAt); } },
        { title: 'الشكوى', render: function (c) {
            var cm = S.COMPLAINTS.filter(function (x) { return x.id === c.complaintId; })[0];
            return cm ? cm.icon + ' ' + cm.label : '—';
          } },
        { title: 'الألم', render: function (c) { return U.num((c.answers.step3 || {}).painLevel) + '/١٠'; } },
        { title: 'المحافظة', render: function (c) {
            var g = E.govById((c.answers.step1 || {}).region);
            return g ? g.name : '—';
          } },
        { title: 'الوسم', render: function (c) {
            var box = U.el('div', { class: 'row', style: 'gap:4px' });
            if (c.urgent) box.appendChild(U.badge('طارئة', 'danger'));
            if (E.isOverdue(db(), c)) box.appendChild(U.badge('متأخرة', 'warn'));
            if (!c.urgent && !E.isOverdue(db(), c)) box.appendChild(U.badge(E.statusLabel(c.status), E.statusTone(c.status)));
            return box;
          } },
        { title: '', render: function (c) {
            return U.el('button', {
              class: 'btn btn--sm ' + (c.status === 'in_review' || c.status === 'new' ? 'btn--gold' : 'btn--ghost'),
              text: c.status === 'in_review' || c.status === 'new' ? 'فتح وكتابة الرأي' : 'عرض',
              onclick: function () { go('#/case/' + c.id); }
            });
          } }
      ], current.rows) : U.empty('لا توجد حالات في هذه القائمة.', '📭')
    ]));
  }

  /* ---------- شاشة كتابة الرأي (FR-13) ---------- */

  function renderCase(id) {
    var d = db(), doc = me();
    var c = E.consultationById(d, id);
    if (!c || c.doctorId !== doc.id) {
      U.mount(view, U.el('div', { class: 'stack' }, [
        head('غير مصرّح'),
        U.el('div', { class: 'alert alert--danger', text: 'هذه الحالة ليست ضمن نطاق إسنادك.' })
      ]));
      return;
    }

    /* تسجيل الاطّلاع في سجل التدقيق */
    S.update(function (dd) {
      S.log(dd, { who: doc.name, role: 'doctor', what: 'اطّلاع على بيانات وصور الحالة ' + c.id, targetPatientId: c.patientId });
    });

    var p = E.patientById(d, c.patientId);
    var a1 = c.answers.step1 || {}, a3 = c.answers.step3 || {}, a4 = c.answers.step4 || {};
    var cm = S.COMPLAINTS.filter(function (x) { return x.id === c.complaintId; })[0];
    var g = E.govById(a1.region);

    function row(k, v) { return U.el('div', { class: 'report__row' }, [U.el('b', { text: k }), U.el('span', { text: v })]); }

    var textarea = U.el('textarea', { style: 'min-height:200px', placeholder: 'اكتب رأيك الاستشاري بلغة واضحة للمريض...' });
    textarea.value = c.opinion || '';

    var templateChips = U.el('div', { class: 'chips' }, d.templates.map(function (t) {
      return U.el('button', {
        class: 'chip', type: 'button', text: t.title,
        onclick: function () {
          textarea.value = (textarea.value ? textarea.value + '\n' : '') + t.body;
          textarea.focus();
        }
      });
    }));

    var done = c.status === 'answered' || c.status === 'closed';

    U.mount(view, U.el('div', { class: 'stack' }, [
      head('الحالة ' + c.id, (cm ? cm.label : '') + ' · وردت ' + U.ago(c.createdAt), [
        U.el('button', { class: 'btn btn--sm btn--ghost', text: '→ رجوع للصندوق', onclick: function () { go('#/inbox'); } })
      ]),
      c.urgent ? U.el('div', { class: 'alert alert--danger', text: '🚨 حالة طارئة — الزمن الملزم للرد ' + U.num(d.settings.urgentSlaMinutes) + ' دقيقة.' }) : null,
      U.el('div', { class: 'grid grid--wide' }, [
        U.el('div', { class: 'stack' }, [
          U.el('div', { class: 'card' }, [
            U.el('h3', { text: 'بيانات المريض والأعراض' }),
            U.el('div', { class: 'report__grid' }, [
              row('الاسم', p ? p.name || '—' : '—'),
              row('العمر والجنس', U.num(a1.age) + ' سنة · ' + (a1.gender === 'female' ? 'أنثى' : 'ذكر')),
              row('المحافظة', g ? g.name : '—'),
              row('أمراض مزمنة', a1.chronic || 'لا يوجد'),
              row('حساسية', a1.allergies || 'لا يوجد'),
              row('السن المصاب', (c.answers.step2 || {}).tooth || 'غير محدد'),
              row('شدة الألم', U.num(a3.painLevel) + '/١٠'),
              row('المدة', a3.duration || '—'),
              row('يزداد', a3.worseWhen || '—'),
              row('تورّم/حرارة', (a3.swelling ? 'تورّم' : 'بلا تورّم') + ' · ' + (a3.fever ? 'حرارة' : 'بلا حرارة'))
            ]),
            a4.note ? U.el('p', { class: 'small', style: 'margin-top:10px', text: 'ملاحظة المريض: ' + a4.note }) : null
          ]),
          U.el('div', { class: 'card' }, [
            U.el('h3', { text: 'الصور المرفوعة' }),
            (a4.images && a4.images.length)
              ? U.el('div', { class: 'thumbs' }, a4.images.map(function (src) {
                  return U.el('div', { class: 'thumb' }, [U.el('img', { src: src, alt: 'صورة الحالة' })]);
                }))
              : U.el('p', { class: 'small muted', text: 'لم يرفع المريض صوراً.' })
          ])
        ]),
        U.el('div', { class: 'stack' }, [
          U.el('div', { class: 'card stack' }, [
            U.el('h3', { text: done ? 'الرأي الاستشاري المعتمد' : 'كتابة الرأي الاستشاري' }),
            done ? null : U.el('p', { class: 'card__sub', text: 'قوالب جاهزة:' }),
            done ? null : templateChips,
            textarea,
            done
              ? U.el('div', { class: 'alert alert--ok', text: 'تم اعتماد التقرير وإصدار رمز الخصم ' + (c.code || '') })
              : U.el('button', {
                  class: 'btn btn--gold btn--block', text: 'اعتماد وإرسال التقرير للمريض',
                  onclick: function () {
                    var text = textarea.value.trim();
                    if (text.length < 40) { U.toast('الرأي قصير جداً — اكتب توجيهاً واضحاً للمريض', 'error'); return; }
                    S.update(function (dd) {
                      var cc = E.consultationById(dd, c.id);
                      if (!cc) return;
                      cc.opinion = text;
                      cc.status = 'answered';
                      cc.answeredAt = Date.now();
                      cc.responseHours = Math.round(((cc.answeredAt - cc.createdAt) / 3600000) * 10) / 10;
                      cc.qualityStatus = 'pending';
                      S.log(dd, { who: doc.name, role: 'doctor', what: 'اعتماد الرأي الاستشاري للحالة ' + cc.id, targetPatientId: cc.patientId });
                    });
                    U.toast('تم اعتماد التقرير ✅', 'ok');
                    go('#/inbox');
                  }
                })
          ]),
          U.el('div', { class: 'card' }, [
            U.el('h3', { text: 'تنبيه إلزامي' }),
            U.el('p', { class: 'small muted', text: 'يُضاف نص التنبيه الطبي والقانوني تلقائياً إلى التقرير، ولا يجوز تقديم الرأي كوصفة علاجية نهائية.' })
          ])
        ])
      ])
    ]));
  }

  /* ---------- أوقات الزيارة (FR-11) ---------- */

  function renderSchedule() {
    var doc = me();
    var hours = (doc.hours || []).slice();
    var host = U.el('div', { class: 'stack' });

    function paint() {
      U.clear(host);
      for (var day = 0; day < 7; day++) {
        (function (day) {
          var row = hours.filter(function (h) { return h.day === day; })[0];
          var enabled = U.el('input', { type: 'checkbox' });
          enabled.checked = !!row;
          var from = U.el('input', { type: 'time', value: row ? row.from : '09:00' });
          var to = U.el('input', { type: 'time', value: row ? row.to : '17:00' });
          from.disabled = to.disabled = !row;
          enabled.addEventListener('change', function () {
            if (enabled.checked) hours.push({ day: day, from: from.value, to: to.value });
            else hours = hours.filter(function (h) { return h.day !== day; });
            paint();
          });
          function sync() {
            var r = hours.filter(function (h) { return h.day === day; })[0];
            if (r) { r.from = from.value; r.to = to.value; }
          }
          from.addEventListener('change', sync);
          to.addEventListener('change', sync);
          host.appendChild(U.el('div', { class: 'row', style: 'gap:10px;border-bottom:1px solid var(--line);padding:8px 0' }, [
            U.el('label', { class: 'check', style: 'min-width:120px' }, [enabled, U.el('span', { text: U.dayName(day) })]),
            from, U.el('span', { text: '—' }), to
          ]));
        })(day);
      }
    }
    paint();

    U.mount(view, U.el('div', { class: 'stack' }, [
      head('أوقات الزيارة والاجتماعات الافتراضية', 'تظهر للمريض عند حجز موعد مراجعة.'),
      U.el('div', { class: 'card stack' }, [
        host,
        U.el('button', {
          class: 'btn btn--gold', text: 'حفظ التقويم',
          onclick: function () {
            S.update(function (dd) {
              var x = E.doctorById(dd, doc.id);
              if (x) x.hours = hours.slice().sort(function (a, b) { return a.day - b.day; });
            });
            U.toast('تم حفظ الأوقات', 'ok');
          }
        })
      ])
    ]));
  }

  /* ---------- حساب الطبيب ---------- */

  function renderFinance() {
    var d = db(), doc = me();
    var txs = d.transactions.filter(function (t) { return t.doctorId === doc.id; });
    var earned = txs.reduce(function (a, t) { return a + t.doctorShare; }, 0);
    var unsettled = txs.filter(function (t) { return !t.settled; }).reduce(function (a, t) { return a + t.doctorShare; }, 0);
    var q = E.doctorQuality(d, 90).filter(function (r) { return r.doctor.id === doc.id; })[0];

    U.mount(view, U.el('div', { class: 'stack' }, [
      head('حسابي', 'نموذج الأجور (نسبة/لكل حالة/راتب) بند مفتوح مع الإدارة.'),
      U.el('div', { class: 'grid grid--kpi' }, [
        U.stat({ label: 'إجمالي المستحقات', value: U.money(earned, d.settings.currency), accent: 'gold' }),
        U.stat({ label: 'غير مسوّاة', value: U.money(unsettled, d.settings.currency) }),
        U.stat({ label: 'نسبتك', value: U.pct(doc.sharePercent || d.settings.doctorSharePercent) }),
        U.stat({ label: 'متوسط زمن ردّك', value: U.hours(q ? q.avgResponse : null) })
      ]),
      txs.length ? U.table([
        { title: 'التاريخ', render: function (t) { return U.date(t.date); } },
        { title: 'الحالة', key: 'consultationId' },
        { title: 'قيمة الاستشارة', render: function (t) { return U.num(t.amount); } },
        { title: 'حصتك', render: function (t) { return U.num(t.doctorShare); } },
        { title: 'التسوية', render: function (t) { return t.settled ? U.badge('مسوّاة', 'ok') : U.badge('معلّقة', 'warn'); } }
      ], txs.slice(0, 60)) : U.empty('لا توجد حركات مالية بعد.', '💰')
    ]));
  }

  /* ---------- البروفايل (FR-10) ---------- */

  function renderProfile() {
    var d = db(), doc = me();
    var name = U.el('input', { type: 'text', value: doc.name });
    var phone = U.el('input', { type: 'tel', value: doc.phone || '' });
    var specialty = U.el('select', {}, S.SPECIALTIES.map(function (s) { return U.el('option', { value: s, text: s }); }));
    specialty.value = doc.specialty;
    var bio = U.el('textarea', {});
    bio.value = doc.bio || '';
    var clinic = E.clinicById(d, doc.clinicId);

    U.mount(view, U.el('div', { class: 'stack' }, [
      head('البروفايل', 'ما يراه المريض عند توجيهه إليك.'),
      U.el('div', { class: 'grid grid--2' }, [
        U.el('div', { class: 'card stack' }, [
          U.el('label', { class: 'field' }, [U.el('span', { class: 'field__label', text: 'الاسم' }), name]),
          U.el('label', { class: 'field' }, [U.el('span', { class: 'field__label', text: 'الهاتف' }), phone]),
          U.el('label', { class: 'field' }, [U.el('span', { class: 'field__label', text: 'التخصص' }), specialty]),
          U.el('label', { class: 'field' }, [U.el('span', { class: 'field__label', text: 'نبذة' }), bio]),
          U.el('button', {
            class: 'btn btn--gold', text: 'حفظ',
            onclick: function () {
              S.update(function (dd) {
                var x = E.doctorById(dd, doc.id);
                if (x) {
                  x.name = name.value.trim();
                  x.phone = U.normalizeDigits(phone.value).trim();
                  x.specialty = specialty.value;
                  x.bio = bio.value.trim();
                }
              });
              U.toast('تم الحفظ', 'ok');
              paintNav('profile');
            }
          })
        ]),
        U.el('div', { class: 'card stack' }, [
          U.el('h3', { text: 'بيانات معتمدة من الإدارة' }),
          U.el('p', { class: 'small muted', text: 'العيادة والإجازة والمشرف المسؤول لا يعدّلها الطبيب.' }),
          U.el('div', { class: 'report__grid' }, [
            U.el('div', { class: 'report__row' }, [U.el('b', { text: 'العيادة' }), U.el('span', { text: clinic ? clinic.name : '—' })]),
            U.el('div', { class: 'report__row' }, [U.el('b', { text: 'العنوان' }), U.el('span', { text: clinic ? clinic.address : '—' })]),
            U.el('div', { class: 'report__row' }, [U.el('b', { text: 'رقم الإجازة' }), U.el('span', { text: doc.licenseNo || '—' })]),
            U.el('div', { class: 'report__row' }, [U.el('b', { text: 'حالة التوثيق' }), U.el('span', { text: doc.licenseVerified ? 'موثّقة' : 'غير موثّقة' })]),
            U.el('div', { class: 'report__row' }, [U.el('b', { text: 'التقييم' }), U.el('span', { text: '★ ' + (doc.rating || '—') + ' (' + U.num(doc.reviewsCount) + ' تقييم)' })])
          ])
        ])
      ])
    ]));
  }

  var ROUTES = {
    inbox: renderInbox,
    schedule: renderSchedule,
    finance: renderFinance,
    profile: renderProfile
  };

  function route() {
    var parts = (location.hash || '#/inbox').replace('#/', '').split('/');
    var key = parts[0] || 'inbox';
    if (!me()) { U.clear(U.$('#side-nav')); renderLogin(); return; }
    if (key === 'case') { paintNav('inbox'); renderCase(parts[1]); return; }
    if (!ROUTES[key]) key = 'inbox';
    paintNav(key);
    ROUTES[key]();
    window.scrollTo(0, 0);
  }

  window.addEventListener('hashchange', route);
  U.roleBar('doctor');
  route();
})();
