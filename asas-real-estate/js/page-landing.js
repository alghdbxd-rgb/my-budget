/* =============================================================
   الصفحة الرئيسية — الأرقام الحيّة، العروض المميّزة، البكجات، وطلب الزبون
   ============================================================= */
(function () {
  'use strict';

  var U = window.AS.ui;
  var S = window.AS.store;
  var V = window.AS.views;
  var el = U.el;

  var db = S.db;

  window.AS.site.fillCompany();

  /* ---------- قوائم البحث السريع ---------- */

  function fillSelect(node, options, includeAll, allLabel) {
    if (!node) return;
    U.clear(node);
    if (includeAll) node.appendChild(el('option', { value: '', text: allLabel }));
    options.forEach(function (o) { node.appendChild(el('option', { value: o.value, text: o.label })); });
  }

  var form = U.$('#quick-search');
  fillSelect(form.kind, S.PURPOSES.map(function (x) { return { value: x.id, label: x.name }; }), true, 'الغرض: الكل');
  fillSelect(form.type, S.TYPES.map(function (x) { return { value: x.id, label: x.icon + ' ' + x.name }; }), true, 'النوع: الكل');
  fillSelect(form.gov, S.GOVS.map(function (x) { return { value: x.id, label: x.name }; }), true, 'كل المحافظات');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var parts = [];
    ['q', 'kind', 'type', 'gov'].forEach(function (k) {
      var v = form[k].value.trim();
      if (v) parts.push(k + '=' + encodeURIComponent(v));
    });
    location.href = 'offers.html' + (parts.length ? '?' + parts.join('&') : '');
  });

  /* ---------- الأرقام ---------- */

  var views = S.offersView();
  var active = views.filter(function (v) { return v.offer.status === 'active'; });
  var govs = {};
  db.properties.forEach(function (p) { govs[p.gov] = true; });

  U.mount(U.$('#hero-kpis'), U.frag([
    el('div', {}, [el('b', { text: U.num(active.length) }), el('span', { text: 'عرض فعّال' })]),
    el('div', {}, [el('b', { text: U.num(db.properties.filter(function (p) { return p.inHand; }).length) }), el('span', { text: 'عقار تحت اليد' })]),
    el('div', {}, [el('b', { text: U.num(Object.keys(govs).length) }), el('span', { text: 'محافظة' })])
  ]));

  var capital = db.investors.reduce(function (s, i) { return s + S.toMain(i.capital, i.currency); }, 0);
  var portfolio = db.properties.reduce(function (s, p) {
    return p.status !== 'sold' ? s + S.toMain(p.price, p.currency) : s;
  }, 0);

  U.mount(U.$('#invest-kpis'), U.frag([
    U.stat({ label: 'رأس مال مُدار', value: U.shortNum(capital), icon: '💼' }),
    U.stat({ label: 'قيمة المحفظة', value: U.shortNum(portfolio), icon: '🏙️' }),
    U.stat({ label: 'شركاء', value: U.num(db.investors.length), icon: '🤝' })
  ]));

  /* ---------- العروض المميّزة ---------- */

  var featured = active.filter(function (v) { return v.offer.featured; });
  if (featured.length < 3) {
    active.forEach(function (v) {
      if (featured.length < 6 && featured.indexOf(v) === -1) featured.push(v);
    });
  }
  featured = featured.slice(0, 6);

  var grid = U.$('#featured-grid');
  if (featured.length) {
    U.mount(grid, U.frag(featured.map(function (v) { return V.offerCard(v); })));
  } else {
    U.mount(grid, U.empty('لا توجد عروض منشورة بعد', '🏠'));
  }

  /* ---------- البكجات ---------- */

  var pkgHost = U.$('#packages-grid');
  var pkgs = db.packages.filter(function (k) { return k.status === 'active'; });

  if (!pkgs.length) {
    U.mount(pkgHost, U.empty('لا توجد بكجات منشورة حالياً', '🎁'));
  } else {
    U.mount(pkgHost, U.frag(pkgs.map(function (k) {
      var items = k.offerIds.map(function (oid) { return S.offer(oid); }).filter(Boolean);
      var sum = items.reduce(function (s, o) { return s + S.toMain(o.price, o.currency); }, 0);
      var left = U.daysLeft(k.validUntil);

      return el('div', { class: 'card stack-sm' }, [
        el('div', { class: 'card__head' }, [
          el('div', {}, [
            el('span', { class: 'tiny mono muted', text: k.code }),
            el('h3', { class: 'card__title', text: k.name })
          ]),
          k.discountPct ? U.badge('خصم ' + U.num(k.discountPct) + '٪', 'gold') : U.badge('عرض خاص', 'ok')
        ]),
        k.audience ? el('div', { class: 'small muted', text: '🎯 ' + k.audience }) : null,
        el('div', { class: 'stack-sm' }, items.map(function (o) {
          var p = S.property(o.propertyId) || {};
          var view = S.offersView().filter(function (x) { return x.offer.id === o.id; })[0];
          return el('button', {
            class: 'list-row', type: 'button',
            style: 'width:100%;text-align:right;cursor:pointer;font-family:inherit',
            onclick: function () { if (view) V.detailModal(view); }
          }, [
            el('span', { class: 'list-row__thumb', text: S.typeIcon(p.type) }),
            el('span', { class: 'grow' }, [
              el('span', { style: 'font-weight:700', text: o.title || p.title }),
              el('span', { class: 'small muted', style: 'display:block', text: V.locText(p) })
            ]),
            el('span', { class: 'small nowrap', text: U.money(o.price, o.currency) })
          ]);
        })),
        k.notes ? el('div', { class: 'panel small', text: k.notes }) : null,
        el('div', { class: 'row row--between' }, [
          el('span', { class: 'small muted', text: 'القيمة الإجمالية: ' + U.moneyShort(sum, db.settings.mainCurrency) }),
          el('span', { class: 'tiny muted', text: k.validUntil && left >= 0 ? 'ينتهي خلال ' + U.num(left) + ' يوم' : '' })
        ]),
        el('a', {
          class: 'btn btn--block', target: '_blank', rel: 'noopener',
          href: U.whatsapp(db.settings.whatsapp, 'مرحباً، أريد تفاصيل ' + k.name + ' (' + k.code + ')'),
          text: '💬 اطلب تفاصيل البكج'
        })
      ]);
    })));
  }

  /* ---------- نموذج طلب الزبون ---------- */

  var lead = U.$('#lead-form');
  fillSelect(lead.wantPurpose, S.PURPOSES.map(function (x) { return { value: x.id, label: x.name }; }), false);
  fillSelect(lead.wantType, S.TYPES.map(function (x) { return { value: x.id, label: x.name }; }), true, 'أي نوع');
  fillSelect(lead.wantGov, S.GOVS.map(function (x) { return { value: x.id, label: x.name }; }), true, 'أي محافظة');

  lead.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = lead.name.value.trim();
    var phone = lead.phone.value.trim();
    if (!name || !phone) return U.toast('اكتب الاسم ورقم الهاتف', 'err');

    var client = S.upsert('clients', {
      name: name, phone: phone, source: 'الموقع', status: 'new',
      wantType: lead.wantType.value, wantPurpose: lead.wantPurpose.value, wantGov: lead.wantGov.value,
      budgetMax: U.toNum(lead.budgetMax.value), currency: lead.currency.value,
      spaceMin: U.toNum(lead.spaceMin.value), note: lead.note.value.trim()
    });

    lead.reset();
    var matches = S.matchesFor(client);
    U.modal({
      title: 'وصلنا طلبك ✅',
      body: el('div', { class: 'stack-sm' }, [
        el('p', { text: 'شكراً ' + name + '، سجّلنا طلبك وراح يتواصل معك المكتب.' }),
        matches.length
          ? el('div', { class: 'stack-sm' }, [
            el('div', { class: 'small', style: 'font-weight:700', text: 'وهذه ' + U.num(matches.length) + ' عروض تطابق طلبك الآن:' }),
            el('div', { class: 'prop-grid' }, matches.slice(0, 4).map(function (v) { return V.offerCard(v); }))
          ])
          : el('p', { class: 'small muted', text: 'ما عدنا عرض مطابق هسه، بس أول ما يوصل عرض يناسبك نخبرك.' })
      ]),
      wide: matches.length > 0,
      foot: [
        el('a', {
          class: 'btn', target: '_blank', rel: 'noopener',
          href: U.whatsapp(db.settings.whatsapp, 'مرحباً، سجّلت طلباً باسم ' + name),
          text: '💬 تابع بالواتساب'
        })
      ]
    });
    U.toast('تم تسجيل طلبك', 'ok');
  });
})();
