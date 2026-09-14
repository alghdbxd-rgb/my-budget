/* =============================================================
   لوحة العمل — الهيكل، لوحة القياس، الزبائن، التقارير، الإعدادات
   ============================================================= */
(function () {
  'use strict';

  var U = window.AS.ui;
  var S = window.AS.store;
  var V = window.AS.views;
  var el = U.el;
  var SC = window.AS.screens = window.AS.screens || {};

  var NAV = [
    { id: 'dash', name: 'لوحة القياس', icon: '📊' },
    { id: 'offers', name: 'العروض', icon: '🏷️' },
    { id: 'properties', name: 'العقارات', icon: '🏠' },
    { id: 'stock', name: 'نقاط البيع', icon: '📍' },
    { id: 'packages', name: 'بكجات العروض', icon: '🎁' },
    { id: 'cash', name: 'القاصة', icon: '💰' },
    { id: 'investors', name: 'المستثمرون', icon: '🤝' },
    { id: 'clients', name: 'الزبائن والطلبات', icon: '👥' },
    { id: 'reports', name: 'التقارير', icon: '📈' },
    { id: 'settings', name: 'الإعدادات', icon: '⚙️' }
  ];

  var ctx = { state: {} };

  /* ---------- لوحة القياس ---------- */

  SC.dash = function (host) {
    var db = S.db;
    var main = db.settings.mainCurrency;
    var views = S.offersView();
    var active = views.filter(function (v) { return v.offer.status === 'active'; });
    var monthStart = new Date();
    monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);

    var closedThisMonth = db.offers.filter(function (o) {
      return o.status === 'closed' && (o.updatedAt || o.createdAt) >= monthStart.getTime();
    });
    var monthCash = S.cashTotals(function (e) { return e.date >= monthStart.getTime(); });
    var balance = db.boxes.reduce(function (s, b) { return s + S.toMain(S.boxBalance(b.id), b.currency); }, 0);
    var capital = db.investors.reduce(function (s, i) { return s + S.toMain(i.capital, i.currency); }, 0);
    var newClients = db.clients.filter(function (c) { return c.status === 'new'; });

    /* حركة ٦ أشهر */
    var monthsBack = [];
    for (var i = 5; i >= 0; i--) {
      var d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      monthsBack.push(U.monthKey(d.getTime()));
    }
    var inSeries = monthsBack.map(function (k) {
      var t = S.cashTotals(function (e) { return U.monthKey(e.date) === k && e.direction === 'in'; });
      return { label: U.monthLabel(k), value: t.in };
    });
    var outSeries = monthsBack.map(function (k) {
      var t = S.cashTotals(function (e) { return U.monthKey(e.date) === k && e.direction === 'out'; });
      return { label: U.monthLabel(k), value: t.out, tone: 'danger' };
    });

    /* توزيع الأنواع */
    var colors = ['var(--brand-600)', 'var(--gold-500)', 'var(--info)', 'var(--purple)', 'var(--ok)', 'var(--warn)', 'var(--danger)', 'var(--brand-300)'];
    var byType = {};
    db.properties.forEach(function (p) { byType[p.type] = (byType[p.type] || 0) + 1; });
    var typeData = Object.keys(byType).map(function (t, idx) {
      return { label: S.typeName(t), value: byType[t], color: colors[idx % colors.length] };
    }).sort(function (a, b) { return b.value - a.value; });

    /* أفضل المناطق */
    var byArea = {};
    db.properties.forEach(function (p) {
      var key = S.govName(p.gov) + (p.area ? ' — ' + p.area : '');
      byArea[key] = (byArea[key] || 0) + 1;
    });
    var areaData = Object.keys(byArea).map(function (k) { return { label: k, value: byArea[k] }; })
      .sort(function (a, b) { return b.value - a.value; }).slice(0, 6);

    var expiring = active.filter(function (v) {
      var d = U.daysLeft(v.offer.validUntil);
      return d != null && d >= 0 && d <= 10;
    }).sort(function (a, b) { return a.offer.validUntil - b.offer.validUntil; });

    var lastCash = db.cash.slice().sort(function (a, b) { return b.date - a.date; }).slice(0, 6);

    U.mount(host, el('div', { class: 'stack' }, [
      el('div', { class: 'main__head' }, [
        el('div', {}, [
          el('h1', { text: 'أهلاً بك 👋' }),
          el('p', { class: 'muted small', text: db.settings.company + ' · ' + U.date(Date.now()) })
        ]),
        el('div', { class: 'row', style: 'gap:8px' }, [
          el('button', { class: 'btn btn--ghost', type: 'button', text: '🏠 عقار جديد', onclick: function () { SC.propertyForm(null, function () { go('properties'); }); } }),
          el('button', { class: 'btn', type: 'button', text: '🏷️ عرض جديد', onclick: function () { SC.offerForm(null, null, function () { go('offers'); }); } })
        ])
      ]),

      el('div', { class: 'grid grid--4' }, [
        U.stat({ label: 'عروض فعّالة', value: U.num(active.length), icon: '🏷️', variant: 'brand', hint: 'من أصل ' + U.num(views.length) + ' عرض' }),
        U.stat({ label: 'عقارات تحت اليد', value: U.num(db.properties.filter(function (p) { return p.inHand; }).length), icon: '📍', hint: U.num(db.properties.length) + ' عقار مسجّل' }),
        U.stat({ label: 'رصيد القواصة', value: U.moneyShort(balance, main), icon: '💰', variant: 'gold', hint: U.num(db.boxes.length) + ' قاصة' }),
        U.stat({ label: 'صفقات هذا الشهر', value: U.num(closedThisMonth.length), icon: '🤝', hint: 'داخل الشهر: ' + U.moneyShort(monthCash.in, main) })
      ]),

      el('div', { class: 'grid grid--2' }, [
        el('div', { class: 'card' }, [
          el('div', { class: 'card__head' }, [
            el('h3', { class: 'card__title', text: 'حركة الأموال — آخر ٦ أشهر' }),
            el('span', { class: 'row', style: 'gap:10px' }, [
              el('span', { class: 'tiny' }, [el('span', { style: 'color:var(--brand-600)', text: '▬ ' }), 'داخل']),
              el('span', { class: 'tiny' }, [el('span', { style: 'color:var(--danger)', text: '▬ ' }), 'خارج'])
            ])
          ]),
          U.barChart({ data: inSeries, height: 150 }),
          U.barChart({ data: outSeries, height: 120 })
        ]),
        el('div', { class: 'card' }, [
          el('h3', { class: 'card__title', text: 'توزيع العقارات حسب النوع' }),
          typeData.length ? U.donutChart(typeData, { centerValue: U.num(db.properties.length), centerLabel: 'عقار' }) : U.empty('لا توجد عقارات', '🏠')
        ])
      ]),

      el('div', { class: 'grid grid--2' }, [
        el('div', { class: 'card' }, [
          el('h3', { class: 'card__title', text: 'أكثر المناطق التي نعمل بها' }),
          U.hbarChart(areaData)
        ]),
        el('div', { class: 'card' }, [
          el('div', { class: 'card__head' }, [
            el('h3', { class: 'card__title', text: 'عروض تنتهي قريباً' }),
            U.badge(U.num(expiring.length) + ' عرض', expiring.length ? 'warn' : 'muted')
          ]),
          expiring.length ? el('div', {}, expiring.slice(0, 5).map(function (v) {
            return el('div', { class: 'list-row' }, [
              el('span', { class: 'list-row__thumb', text: S.typeIcon(v.type) }),
              el('span', { class: 'grow' }, [
                el('span', { style: 'font-weight:700', text: v.title }),
                el('span', { class: 'small muted', style: 'display:block', text: v.offer.code + ' · ' + V.locText(v.prop) })
              ]),
              U.badge('خلال ' + U.num(U.daysLeft(v.offer.validUntil)) + ' يوم', 'warn')
            ]);
          })) : U.empty('ما في عروض قريبة الانتهاء', '✅')
        ])
      ]),

      el('div', { class: 'grid grid--2' }, [
        el('div', { class: 'card' }, [
          el('div', { class: 'card__head' }, [
            el('h3', { class: 'card__title', text: 'آخر حركات القاصة' }),
            el('button', { class: 'btn btn--ghost btn--sm', type: 'button', text: 'عرض الكل', onclick: function () { go('cash'); } })
          ]),
          lastCash.length ? el('div', {}, lastCash.map(function (e) {
            return el('div', { class: 'list-row' }, [
              el('span', { class: 'list-row__thumb', text: e.direction === 'in' ? '⬅️' : '➡️' }),
              el('span', { class: 'grow' }, [
                el('span', { style: 'font-weight:700', text: e.category }),
                el('span', { class: 'small muted', style: 'display:block', text: (e.party || '—') + ' · ' + U.shortDate(e.date) })
              ]),
              el('span', { class: e.direction === 'in' ? 'money-in' : 'money-out', text: U.money(e.amount, e.currency) })
            ]);
          })) : U.empty('ما في حركات', '💰')
        ]),
        el('div', { class: 'card' }, [
          el('div', { class: 'card__head' }, [
            el('h3', { class: 'card__title', text: 'طلبات زبائن جديدة' }),
            U.badge(U.num(newClients.length), newClients.length ? 'info' : 'muted')
          ]),
          newClients.length ? el('div', {}, newClients.slice(0, 5).map(function (c) {
            var matches = S.matchesFor(c);
            return el('div', { class: 'list-row' }, [
              el('span', { class: 'list-row__thumb', text: '👤' }),
              el('span', { class: 'grow' }, [
                el('span', { style: 'font-weight:700', text: c.name }),
                el('span', { class: 'small muted', style: 'display:block', text: S.typeName(c.wantType) + ' · ' + S.govName(c.wantGov) + ' · حتى ' + U.moneyShort(c.budgetMax, c.currency) })
              ]),
              U.badge(U.num(matches.length) + ' مطابق', matches.length ? 'ok' : 'muted')
            ]);
          })) : U.empty('ما في طلبات جديدة', '👥')
        ])
      ])
    ]));
  };

  /* ---------- الزبائن والطلبات ---------- */

  function clientForm(existing, done) {
    var c = Object.assign({
      name: '', phone: '', source: 'مباشر', status: 'new',
      wantType: '', wantPurpose: 'sale', wantGov: '', budgetMax: 0,
      currency: S.db.settings.mainCurrency, spaceMin: 0, note: ''
    }, existing || {});

    var f = {
      name: el('input', { type: 'text', value: c.name, placeholder: 'اسم الزبون' }),
      phone: el('input', { type: 'tel', value: c.phone, placeholder: '07XXXXXXXXX' }),
      source: U.select(['مباشر', 'الموقع', 'فيسبوك', 'إنستغرام', 'واتساب', 'إحالة', 'لوحة إعلانية'].map(function (x) { return { value: x, label: x }; }), c.source),
      status: U.select(S.CLIENT_STATUS.map(function (x) { return { value: x.id, label: x.name }; }), c.status),
      wantType: U.select([{ value: '', label: 'أي نوع' }].concat(S.TYPES.map(function (x) { return { value: x.id, label: x.name }; })), c.wantType),
      wantPurpose: U.select(S.PURPOSES.map(function (x) { return { value: x.id, label: x.name }; }), c.wantPurpose),
      wantGov: U.select([{ value: '', label: 'أي محافظة' }].concat(S.GOVS.map(function (x) { return { value: x.id, label: x.name }; })), c.wantGov),
      budgetMax: el('input', { type: 'text', inputmode: 'numeric', value: c.budgetMax || '' }),
      currency: U.select([{ value: 'USD', label: '$ دولار' }, { value: 'IQD', label: 'د.ع دينار' }], c.currency),
      spaceMin: el('input', { type: 'text', inputmode: 'numeric', value: c.spaceMin || '' }),
      note: el('textarea', {})
    };
    f.note.value = c.note || '';

    var m = U.modal({
      title: c.id ? 'تعديل الطلب' : '👤 طلب زبون جديد',
      body: el('div', { class: 'stack-sm' }, [
        el('div', { class: 'grid grid--4' }, [
          U.field('الاسم', f.name), U.field('الهاتف', f.phone),
          U.field('المصدر', f.source), U.field('الحالة', f.status)
        ]),
        el('div', { class: 'grid grid--3' }, [
          U.field('النوع المطلوب', f.wantType),
          U.field('الغرض', f.wantPurpose),
          U.field('المحافظة', f.wantGov)
        ]),
        el('div', { class: 'grid grid--3' }, [
          U.field('أعلى ميزانية', f.budgetMax),
          U.field('العملة', f.currency),
          U.field('أقل مساحة (م²)', f.spaceMin)
        ]),
        U.field('ملاحظات', f.note)
      ]),
      foot: [
        el('button', {
          class: 'btn', type: 'button', text: '💾 حفظ',
          onclick: function () {
            if (!f.name.value.trim()) return U.toast('اكتب اسم الزبون', 'err');
            S.upsert('clients', {
              id: c.id, name: f.name.value.trim(), phone: f.phone.value.trim(),
              source: f.source.value, status: f.status.value,
              wantType: f.wantType.value, wantPurpose: f.wantPurpose.value, wantGov: f.wantGov.value,
              budgetMax: U.toNum(f.budgetMax.value), currency: f.currency.value,
              spaceMin: U.toNum(f.spaceMin.value), note: f.note.value.trim(), createdAt: c.createdAt
            });
            m.close();
            U.toast('تم الحفظ', 'ok');
            if (done) done();
          }
        }),
        el('button', { class: 'btn btn--ghost', type: 'button', text: 'إلغاء', onclick: function () { m.close(); } })
      ]
    });
  }

  function matchesModal(c) {
    var list = S.matchesFor(c);
    var body = el('div', { class: 'stack-sm' }, [
      el('p', { class: 'small muted', text: 'العروض الفعّالة المطابقة لطلب ' + c.name + ':' }),
      list.length
        ? el('div', { class: 'prop-grid' }, list.map(function (v) { return V.offerCard(v, { admin: true }); }))
        : U.empty('ما في عرض مطابق حالياً', '🔍')
    ]);
    U.modal({
      title: '🎯 مطابقات الطلب (' + U.num(list.length) + ')',
      body: body, wide: true,
      foot: list.length ? [
        el('button', {
          class: 'btn', type: 'button', text: '📋 نسخ العروض المطابقة',
          onclick: function () {
            var text = list.map(function (v) { return V.shareText(v, S.db.settings); }).join('\n\n———\n\n');
            U.copy(text, 'نُسخت المطابقات');
          }
        }),
        el('a', {
          class: 'btn btn--ghost', target: '_blank', rel: 'noopener',
          href: U.whatsapp(c.phone, 'مرحباً ' + c.name + '،\nهذه عروض تناسب طلبك:\n\n' + list.slice(0, 3).map(function (v) { return V.shareText(v, S.db.settings); }).join('\n\n———\n\n')),
          text: '💬 إرسال للزبون'
        })
      ] : null
    });
  }

  SC.clients = function (host, c2) {
    var state = c2.state.clients = c2.state.clients || { text: '', status: '' };

    function render() {
      var db = S.db;
      var text = state.text.trim().toLowerCase();
      var list = db.clients.filter(function (c) {
        if (state.status && c.status !== state.status) return false;
        if (!text) return true;
        return [c.name, c.phone, c.note, S.govName(c.wantGov)].join(' ').toLowerCase().indexOf(text) !== -1;
      }).sort(function (a, b) { return b.createdAt - a.createdAt; });

      var search = el('input', { type: 'search', value: state.text, placeholder: 'ابحث باسم الزبون أو رقمه…' });
      var t;
      search.addEventListener('input', function () { clearTimeout(t); t = setTimeout(function () { state.text = search.value; render(); }, 180); });

      U.mount(host, el('div', { class: 'stack' }, [
        el('div', { class: 'main__head' }, [
          el('div', {}, [
            el('h1', { text: 'الزبائن والطلبات' }),
            el('p', { class: 'muted small', text: 'سجّل طلب الزبون مرة، والنظام يطلّعلك العروض المطابقة.' })
          ]),
          el('button', { class: 'btn', type: 'button', text: '➕ طلب جديد', onclick: function () { clientForm(null, render); } })
        ]),
        el('div', { class: 'toolbar' }, [
          el('div', { class: 'searchbox grow' }, [search]),
          U.select([{ value: '', label: 'كل الحالات' }].concat(S.CLIENT_STATUS.map(function (x) { return { value: x.id, label: x.name }; })), state.status,
            { onchange: function (e) { state.status = e.target.value; render(); } })
        ]),
        list.length ? el('div', { class: 'grid grid--2' }, list.map(function (c) {
          var st = S.statusOf(S.CLIENT_STATUS, c.status);
          var matches = S.matchesFor(c);
          return el('div', { class: 'card stack-sm' }, [
            el('div', { class: 'card__head' }, [
              el('div', {}, [
                el('h3', { class: 'card__title', text: c.name }),
                el('div', { class: 'small muted', text: (c.phone || '—') + ' · ' + c.source + ' · ' + U.ago(c.createdAt) })
              ]),
              U.badge(st.name, st.tone)
            ]),
            el('div', { class: 'panel small' }, [
              el('div', { text: '🔎 يطلب: ' + (c.wantType ? S.typeName(c.wantType) : 'أي نوع') + ' · ' + S.purposeName(c.wantPurpose) + ' · ' + (c.wantGov ? S.govName(c.wantGov) : 'أي محافظة') }),
              el('div', { text: '💵 الميزانية: حتى ' + U.money(c.budgetMax, c.currency) + (c.spaceMin ? ' · مساحة ≥ ' + U.num(c.spaceMin) + ' م²' : '') }),
              c.note ? el('div', { class: 'muted', text: '📝 ' + c.note }) : null
            ]),
            el('div', { class: 'row', style: 'gap:6px' }, [
              el('button', {
                class: 'btn btn--sm grow', type: 'button',
                text: '🎯 ' + U.num(matches.length) + ' عرض مطابق',
                onclick: function () { matchesModal(c); }
              }),
              c.phone ? el('a', { class: 'btn btn--ghost btn--sm', href: U.whatsapp(c.phone, 'مرحباً ' + c.name), target: '_blank', rel: 'noopener', text: '💬' }) : null,
              c.phone ? el('a', { class: 'btn btn--ghost btn--sm', href: 'tel:' + c.phone, text: '📞' }) : null,
              el('button', { class: 'btn btn--ghost btn--sm', type: 'button', text: '✏️', onclick: function () { clientForm(c, render); } }),
              el('button', {
                class: 'btn btn--ghost btn--sm', type: 'button', text: '🗑️',
                onclick: function () { U.confirm('حذف طلب «' + c.name + '»؟', function () { S.remove('clients', c.id); render(); }, 'حذف', 'danger'); }
              })
            ])
          ]);
        })) : U.empty('ما في طلبات مسجّلة', '👥')
      ]));
    }

    render();
  };

  /* ---------- التقارير ---------- */

  SC.reports = function (host) {
    var db = S.db;
    var main = db.settings.mainCurrency;

    var byStatus = {};
    db.offers.forEach(function (o) { byStatus[o.status] = (byStatus[o.status] || 0) + 1; });
    var colors = { active: 'var(--ok)', reserved: 'var(--warn)', closed: 'var(--info)', expired: 'var(--muted)' };
    var statusData = S.OFFER_STATUS.map(function (s) {
      return { label: s.name, value: byStatus[s.id] || 0, color: colors[s.id] };
    });

    var commissions = {};
    db.cash.forEach(function (e) {
      if (e.direction !== 'in' || e.category.indexOf('عمولة') !== 0) return;
      var k = U.monthKey(e.date);
      commissions[k] = (commissions[k] || 0) + S.toMain(e.amount, e.currency);
    });
    var commMonths = Object.keys(commissions).sort().slice(-6);
    var commData = commMonths.map(function (k) {
      return { label: U.monthLabel(k), value: commissions[k], tone: 'gold-500' };
    });

    var byMarketer = {};
    db.offers.forEach(function (o) {
      if (o.status !== 'closed') return;
      var k = o.marketer || 'غير محدد';
      byMarketer[k] = (byMarketer[k] || 0) + 1;
    });
    var marketerData = Object.keys(byMarketer).map(function (k) { return { label: k, value: byMarketer[k] }; })
      .sort(function (a, b) { return b.value - a.value; });

    var byChannel = {};
    db.offers.forEach(function (o) {
      var k = o.channel || 'مباشر';
      byChannel[k] = (byChannel[k] || 0) + 1;
    });
    var channelData = Object.keys(byChannel).map(function (k) { return { label: k, value: byChannel[k] }; })
      .sort(function (a, b) { return b.value - a.value; });

    var topViewed = S.offersView().slice().sort(function (a, b) { return (b.offer.views || 0) - (a.offer.views || 0); }).slice(0, 8);

    var stockValue = db.properties.reduce(function (s, p) {
      return p.status !== 'sold' ? s + S.toMain(p.price, p.currency) : s;
    }, 0);
    var soldValue = db.properties.reduce(function (s, p) {
      return p.status === 'sold' ? s + S.toMain(p.price, p.currency) : s;
    }, 0);
    var all = S.cashTotals();

    U.mount(host, el('div', { class: 'stack' }, [
      el('div', { class: 'main__head' }, [
        el('div', {}, [
          el('h1', { text: 'التقارير' }),
          el('p', { class: 'muted small', text: 'أرقام المكتب كلها بمكان واحد.' })
        ])
      ]),
      el('div', { class: 'grid grid--4' }, [
        U.stat({ label: 'قيمة المعروض', value: U.moneyShort(stockValue, main), icon: '🏠', variant: 'brand' }),
        U.stat({ label: 'قيمة المُباع', value: U.moneyShort(soldValue, main), icon: '🤝' }),
        U.stat({ label: 'إجمالي الداخل', value: U.moneyShort(all.in, main), icon: '⬅️', variant: 'gold' }),
        U.stat({ label: 'إجمالي الخارج', value: U.moneyShort(all.out, main), icon: '➡️' })
      ]),
      el('div', { class: 'grid grid--2' }, [
        el('div', { class: 'card' }, [
          el('h3', { class: 'card__title', text: 'حالات العروض' }),
          U.donutChart(statusData, { centerValue: U.num(db.offers.length), centerLabel: 'عرض' })
        ]),
        el('div', { class: 'card' }, [
          el('h3', { class: 'card__title', text: 'العمولات المستلمة شهرياً' }),
          commData.length ? U.barChart({ data: commData, height: 180 }) : U.empty('لا توجد عمولات مسجّلة', '💵')
        ])
      ]),
      el('div', { class: 'grid grid--2' }, [
        el('div', { class: 'card' }, [
          el('h3', { class: 'card__title', text: 'الصفقات حسب المسوّق' }),
          marketerData.length ? U.hbarChart(marketerData) : U.empty('لا توجد صفقات منجزة', '🏅')
        ]),
        el('div', { class: 'card' }, [
          el('h3', { class: 'card__title', text: 'العروض حسب قناة التسويق' }),
          U.hbarChart(channelData)
        ])
      ]),
      el('div', { class: 'card' }, [
        el('h3', { class: 'card__title', text: 'الأكثر مشاهدة' }),
        topViewed.length ? U.table(['الكود', 'العرض', 'المنطقة', 'السعر', 'المشاهدات'], topViewed.map(function (v) {
          return [
            { text: v.offer.code, class: 'mono tiny' },
            v.title,
            V.locText(v.prop),
            { text: U.money(v.price, v.currency), class: 'num' },
            { text: U.num(v.offer.views || 0), class: 'num' }
          ];
        })) : U.empty('لا توجد عروض', '👁️')
      ])
    ]));
  };

  /* ---------- الإعدادات ---------- */

  SC.settings = function (host) {
    function render() {
      var db = S.db;
      var s = db.settings;

      var f = {
        company: el('input', { type: 'text', value: s.company }),
        slogan: el('input', { type: 'text', value: s.slogan }),
        phone: el('input', { type: 'tel', value: s.phone }),
        whatsapp: el('input', { type: 'tel', value: s.whatsapp }),
        email: el('input', { type: 'text', value: s.email }),
        address: el('input', { type: 'text', value: s.address }),
        mainCurrency: U.select([{ value: 'USD', label: '$ دولار' }, { value: 'IQD', label: 'د.ع دينار' }], s.mainCurrency),
        usdRate: el('input', { type: 'text', inputmode: 'numeric', value: s.usdRate }),
        defaultCommission: el('input', { type: 'text', inputmode: 'decimal', value: s.defaultCommission })
      };

      var mediaBytes = window.AS.media.usage(db.properties.map(function (p) { return p.media; }));
      var dataBytes = new Blob([S.exportJSON()]).size;

      var importFile = el('input', { type: 'file', accept: '.json', style: 'display:none' });
      importFile.addEventListener('change', function () {
        var file = importFile.files[0];
        if (!file) return;
        var r = new FileReader();
        r.onload = function () {
          try {
            S.importJSON(r.result);
            U.toast('تم استيراد النسخة', 'ok');
            render();
          } catch (err) {
            U.toast('الملف غير صالح', 'err');
          }
        };
        r.readAsText(file);
        importFile.value = '';
      });

      U.mount(host, el('div', { class: 'stack' }, [
        el('div', { class: 'main__head' }, [
          el('div', {}, [
            el('h1', { text: 'الإعدادات' }),
            el('p', { class: 'muted small', text: 'بيانات الشركة، العملة، والنسخ الاحتياطي.' })
          ])
        ]),

        el('div', { class: 'card stack-sm' }, [
          el('h3', { class: 'card__title', text: 'بيانات الشركة' }),
          el('div', { class: 'grid grid--2' }, [
            U.field('اسم الشركة', f.company),
            U.field('الشعار النصي', f.slogan),
            U.field('هاتف', f.phone),
            U.field('واتساب', f.whatsapp),
            U.field('البريد', f.email),
            U.field('العنوان', f.address)
          ]),
          el('div', { class: 'grid grid--3' }, [
            U.field('العملة الأساسية للتقارير', f.mainCurrency),
            U.field('سعر صرف الدولار (دينار)', f.usdRate),
            U.field('نسبة العمولة الافتراضية ٪', f.defaultCommission)
          ]),
          el('button', {
            class: 'btn', type: 'button', text: '💾 حفظ الإعدادات',
            onclick: function () {
              s.company = f.company.value.trim();
              s.slogan = f.slogan.value.trim();
              s.phone = f.phone.value.trim();
              s.whatsapp = f.whatsapp.value.trim();
              s.email = f.email.value.trim();
              s.address = f.address.value.trim();
              s.mainCurrency = f.mainCurrency.value;
              s.usdRate = U.toNum(f.usdRate.value) || 1320;
              s.defaultCommission = U.toNum(f.defaultCommission.value);
              S.save();
              U.toast('تم الحفظ', 'ok');
              paintShell();
            }
          })
        ]),

        el('div', { class: 'card stack-sm' }, [
          el('h3', { class: 'card__title', text: 'النسخ الاحتياطي' }),
          el('p', { class: 'small muted', text: 'البيانات محفوظة داخل هذا المتصفح فقط. صدّر نسخة بين فترة وأخرى، خصوصاً قبل تغيير الجهاز.' }),
          el('div', { class: 'grid grid--3' }, [
            U.stat({ label: 'حجم البيانات', value: window.AS.media.humanSize(dataBytes), icon: '🗃️' }),
            U.stat({ label: 'حجم الوسائط', value: window.AS.media.humanSize(mediaBytes), icon: '🖼️' }),
            U.stat({ label: 'عدد السجلات', value: U.num(db.properties.length + db.offers.length + db.cash.length + db.clients.length), icon: '#️⃣' })
          ]),
          el('div', { class: 'row', style: 'gap:8px' }, [
            el('button', {
              class: 'btn', type: 'button', text: '📤 تصدير نسخة JSON',
              onclick: function () {
                U.download('نسخة-أساس-' + U.dateInput(Date.now()) + '.json', S.exportJSON());
                U.toast('تم تنزيل النسخة', 'ok');
              }
            }),
            el('button', { class: 'btn btn--ghost', type: 'button', text: '📥 استيراد نسخة', onclick: function () { importFile.click(); } }),
            importFile
          ])
        ]),

        el('div', { class: 'card stack-sm' }, [
          el('h3', { class: 'card__title', text: 'منطقة الخطر' }),
          el('div', { class: 'row', style: 'gap:8px' }, [
            el('button', {
              class: 'btn btn--ghost', type: 'button', text: '↺ إرجاع البيانات التجريبية',
              onclick: function () {
                U.confirm('سيُستبدل كل شيء بالبيانات التجريبية. متأكد؟', function () { S.reset(); U.toast('تم', 'ok'); render(); }, 'نعم', 'danger');
              }
            }),
            el('button', {
              class: 'btn btn--danger', type: 'button', text: '🗑️ تفريغ كل البيانات',
              onclick: function () {
                U.confirm('سيُحذف كل شيء نهائياً من هذا المتصفح. متأكد؟', function () { S.clearAll(); U.toast('تم التفريغ', 'ok'); render(); }, 'نعم، فرّغ', 'danger');
              }
            })
          ])
        ])
      ]));
    }

    render();
  };

  /* ---------- الهيكل والتوجيه ---------- */

  var current = 'dash';
  var mainHost, sideHost, mobileHost;

  function counts() {
    var db = S.db;
    return {
      offers: db.offers.filter(function (o) { return o.status === 'active'; }).length,
      properties: db.properties.length,
      stock: db.properties.filter(function (p) { return p.inHand; }).length,
      packages: db.packages.length,
      investors: db.investors.length,
      clients: db.clients.filter(function (c) { return c.status === 'new'; }).length
    };
  }

  function navButton(item, compact) {
    var c = counts()[item.id];
    return el('button', {
      class: 'navbtn' + (current === item.id ? ' is-on' : ''), type: 'button',
      onclick: function () { go(item.id); }
    }, [
      el('span', { class: 'ic', text: item.icon }),
      el('span', { text: item.name }),
      !compact && c ? el('span', { class: 'cnt', text: U.num(c) }) : null
    ]);
  }

  function paintShell() {
    var db = S.db;
    U.clear(sideHost);
    sideHost.appendChild(el('div', { class: 'side__brand' }, [
      el('span', { class: 'brand__mark', text: 'أ' }),
      el('span', {}, [
        el('span', { class: 'brand__name', text: db.settings.company }),
        el('span', { class: 'brand__sub', text: 'لوحة العمل' })
      ])
    ]));
    NAV.forEach(function (item) { sideHost.appendChild(navButton(item)); });
    sideHost.appendChild(el('div', { class: 'side__foot stack-sm' }, [
      el('a', { href: 'index.html', style: 'color:#cfe4dc', text: '🌐 موقع الشركة' }),
      el('a', { href: 'offers.html', style: 'color:#cfe4dc;display:block', text: '🔎 صفحة العروض' }),
      el('div', { class: 'row', style: 'gap:6px;margin-top:8px' }, [U.themeToggle()]),
      el('div', { class: 'tiny', style: 'margin-top:6px', text: 'البيانات محفوظة بهذا المتصفح' })
    ]));

    U.clear(mobileHost);
    NAV.forEach(function (item) { mobileHost.appendChild(navButton(item, true)); });
  }

  function go(screen) {
    if (!SC[screen]) screen = 'dash';
    /* أي نافذة مفتوحة تُغلق قبل تبديل الشاشة (مثلاً عند الرجوع بزر المتصفح) */
    U.$$('.modal-back').forEach(function (n) { if (n.parentNode) n.parentNode.removeChild(n); });
    document.body.classList.remove('no-scroll');
    current = screen;
    location.hash = '#/' + screen;
    paintShell();
    U.clear(mainHost);
    SC[screen](mainHost, ctx);
    window.scrollTo(0, 0);
  }

  function boot() {
    var app = U.$('#app');
    sideHost = el('aside', { class: 'side' });
    mainHost = el('main', { class: 'main' });
    mobileHost = el('nav', { class: 'mobilebar' });
    app.appendChild(el('div', { class: 'shell' }, [sideHost, mainHost]));
    app.appendChild(mobileHost);

    var hash = (location.hash || '').replace('#/', '');
    go(SC[hash] ? hash : 'dash');

    window.addEventListener('hashchange', function () {
      var h = (location.hash || '').replace('#/', '');
      if (h && h !== current && SC[h]) go(h);
    });

    U.registerServiceWorker();
  }

  window.AS.admin = { boot: boot, go: go };
})();
