/* =============================================================
   العروض — تسجيل العرض والبحث عنه، وبكجات العروض
   ============================================================= */
(function () {
  'use strict';

  var U = window.AS.ui;
  var S = window.AS.store;
  var V = window.AS.views;
  var el = U.el;

  window.AS.screens = window.AS.screens || {};

  /* ---------- اختيار العقار ---------- */

  function propertyPicker(selectedId, onPick) {
    var wrap = el('div', { class: 'stack-sm' });
    var search = el('input', { type: 'search', placeholder: 'ابحث عن العقار بالكود أو العنوان…' });
    var listHost = el('div', { style: 'max-height:190px;overflow:auto' });
    var current = selectedId;

    function paint() {
      var q = search.value.trim().toLowerCase();
      var list = S.db.properties.filter(function (p) {
        if (!q) return true;
        return [p.code, p.title, p.area, S.govName(p.gov), p.ownerName].join(' ').toLowerCase().indexOf(q) !== -1;
      }).slice(0, 40);

      U.clear(listHost);
      if (!list.length) {
        listHost.appendChild(el('div', { class: 'small muted', style: 'padding:8px', text: 'لا يوجد عقار مطابق — سجّل عقاراً جديداً.' }));
      }
      list.forEach(function (p) {
        var on = p.id === current;
        var row = el('button', {
          type: 'button',
          class: 'list-row',
          style: 'width:100%;text-align:right;cursor:pointer;font-family:inherit;margin-bottom:6px' + (on ? ';border-color:var(--brand-600);background:var(--brand-100)' : ''),
          onclick: function () { current = p.id; onPick(p); paint(); }
        }, [
          el('span', { class: 'list-row__thumb', text: S.typeIcon(p.type) }),
          el('span', { class: 'grow' }, [
            el('span', { class: 'tiny mono muted', text: p.code + ' · ' }),
            el('span', { style: 'font-weight:700', text: p.title }),
            el('span', { class: 'small muted', style: 'display:block', text: V.locText(p) + ' · ' + U.money(p.price, p.currency) })
          ]),
          on ? el('span', { text: '✓' }) : null
        ]);
        listHost.appendChild(row);
      });
    }

    var t;
    search.addEventListener('input', function () { clearTimeout(t); t = setTimeout(paint, 160); });
    paint();

    wrap.appendChild(el('div', { class: 'searchbox' }, [search]));
    wrap.appendChild(listHost);
    wrap.appendChild(el('button', {
      class: 'btn btn--ghost btn--sm', type: 'button', text: '➕ عقار جديد',
      onclick: function () {
        window.AS.screens.propertyForm(null, function (saved) {
          current = saved.id;
          onPick(saved);
          search.value = saved.code;
          paint();
        });
      }
    }));
    return wrap;
  }

  /* ---------- نموذج العرض ---------- */

  function offerForm(existing, prefillPropertyId, onSaved) {
    var o = Object.assign({
      code: '', propertyId: prefillPropertyId || '', title: '', kind: 'sale',
      price: 0, currency: S.db.settings.mainCurrency, downPayment: 0,
      installCount: 0, installAmount: 0, installPeriod: 'شهري',
      commissionPct: S.db.settings.defaultCommission, marketer: 'المكتب', channel: 'مباشر',
      validUntil: Date.now() + 30 * 86400000, status: 'active', highlights: [], notes: '', featured: false
    }, existing || {});
    o.highlights = (o.highlights || []).slice();
    var isNew = !o.id;

    var picked = o.propertyId ? S.property(o.propertyId) : null;
    var pickedLine = el('div', { class: 'panel small', text: picked ? '✅ ' + picked.code + ' — ' + picked.title : 'لم يُختر عقار بعد' });

    var f = {};
    f.title = el('input', { type: 'text', value: o.title, placeholder: 'عنوان العرض كما يُنشر' });
    f.kind = U.select(S.PURPOSES.map(function (x) { return { value: x.id, label: x.name }; }), o.kind);
    f.price = el('input', { type: 'text', inputmode: 'numeric', value: o.price || '' });
    f.currency = U.select([{ value: 'USD', label: '$ دولار' }, { value: 'IQD', label: 'د.ع دينار' }], o.currency);
    f.commissionPct = el('input', { type: 'text', inputmode: 'decimal', value: o.commissionPct || '' });
    f.down = el('input', { type: 'text', inputmode: 'numeric', value: o.downPayment || '', placeholder: 'اتركه فارغاً إذا بلا تقسيط' });
    f.installCount = el('input', { type: 'text', inputmode: 'numeric', value: o.installCount || '' });
    f.installAmount = el('input', { type: 'text', inputmode: 'numeric', value: o.installAmount || '' });
    f.installPeriod = U.select(['شهري', 'ربع سنوي', 'نصف سنوي', 'سنوي'].map(function (x) { return { value: x, label: x }; }), o.installPeriod);
    f.marketer = el('input', { type: 'text', value: o.marketer, placeholder: 'اسم المسوّق المسؤول' });
    f.channel = U.select(['مباشر', 'فيسبوك', 'إنستغرام', 'واتساب', 'موقع الشركة', 'إحالة زبون', 'لوحة إعلانية'].map(function (x) {
      return { value: x, label: x };
    }), o.channel);
    f.validUntil = el('input', { type: 'date', value: U.dateInput(o.validUntil) });
    f.status = U.select(S.OFFER_STATUS.map(function (x) { return { value: x.id, label: x.name }; }), o.status);
    f.featured = el('input', { type: 'checkbox' });
    f.featured.checked = !!o.featured;
    f.notes = el('textarea', { placeholder: 'شروط العرض، ملاحظات التفاوض…' });
    f.notes.value = o.notes || '';

    /* نقاط بارزة */
    var hlHost = el('div', { class: 'stack-sm' });
    function paintHighlights() {
      U.clear(hlHost);
      o.highlights.forEach(function (h, i) {
        hlHost.appendChild(el('div', { class: 'row', style: 'gap:6px;flex-wrap:nowrap' }, [
          el('input', {
            type: 'text', value: h, class: 'grow',
            oninput: function (e) { o.highlights[i] = e.target.value; }
          }),
          el('button', {
            class: 'btn btn--ghost btn--sm', type: 'button', text: '✕',
            onclick: function () { o.highlights.splice(i, 1); paintHighlights(); }
          })
        ]));
      });
      hlHost.appendChild(el('button', {
        class: 'btn btn--ghost btn--sm', type: 'button', text: '➕ إضافة نقطة',
        onclick: function () { o.highlights.push(''); paintHighlights(); }
      }));
    }
    paintHighlights();

    function applyProperty(p) {
      picked = p;
      o.propertyId = p.id;
      pickedLine.textContent = '✅ ' + p.code + ' — ' + p.title;
      if (!f.title.value) f.title.value = p.title;
      if (!U.toNum(f.price.value)) f.price.value = p.price || '';
      f.currency.value = p.currency || 'USD';
      f.kind.value = p.purpose || 'sale';
    }

    var body = el('div', { class: 'stack' }, [
      el('div', { class: 'card' }, [
        el('div', { class: 'card__head' }, [el('h3', { class: 'card__title', text: '١. العقار المرتبط بالعرض' })]),
        el('div', { class: 'stack-sm' }, [pickedLine, propertyPicker(o.propertyId, applyProperty)])
      ]),
      el('div', { class: 'card stack-sm' }, [
        el('h3', { class: 'card__title', text: '٢. تفاصيل العرض' }),
        el('div', { class: 'grid grid--2' }, [
          U.field('عنوان العرض', f.title),
          el('div', { class: 'grid grid--2' }, [U.field('نوع العرض', f.kind), U.field('الحالة', f.status)])
        ]),
        el('div', { class: 'grid grid--4' }, [
          U.field('السعر المعلن', f.price),
          U.field('العملة', f.currency),
          U.field('نسبة العمولة ٪', f.commissionPct, 'للإيجار: نسبة من إيجار الفترة'),
          U.field('صالح حتى', f.validUntil)
        ]),
        el('div', { class: 'grid grid--4' }, [
          U.field('الدفعة الأولى', f.down),
          U.field('عدد الأقساط', f.installCount),
          U.field('قيمة القسط', f.installAmount),
          U.field('دورية القسط', f.installPeriod)
        ]),
        el('div', { class: 'grid grid--3' }, [
          U.field('المسوّق', f.marketer),
          U.field('قناة التسويق', f.channel),
          el('label', { class: 'switch', style: 'margin-top:22px' }, [f.featured, el('span', { text: 'عرض مميّز (يظهر بالواجهة)' })])
        ]),
        U.field('النقاط البارزة للعرض', hlHost),
        U.field('ملاحظات', f.notes)
      ])
    ]);

    var m = U.modal({
      title: isNew ? '🏷️ تسجيل عرض جديد' : 'تعديل العرض ' + (o.code || ''),
      body: body, wide: true,
      foot: [
        el('button', {
          class: 'btn', type: 'button', text: '💾 حفظ العرض',
          onclick: function () {
            if (!o.propertyId) return U.toast('اختر العقار المرتبط بالعرض', 'err');
            var data = {
              id: o.id,
              code: o.code || S.nextCode('offer'),
              propertyId: o.propertyId,
              title: f.title.value.trim() || (picked ? picked.title : ''),
              kind: f.kind.value,
              price: U.toNum(f.price.value), currency: f.currency.value,
              downPayment: U.toNum(f.down.value),
              installCount: U.toNum(f.installCount.value),
              installAmount: U.toNum(f.installAmount.value),
              installPeriod: f.installPeriod.value,
              commissionPct: U.toNum(f.commissionPct.value),
              marketer: f.marketer.value.trim(), channel: f.channel.value,
              validUntil: f.validUntil.value ? new Date(f.validUntil.value).getTime() : 0,
              status: f.status.value,
              highlights: o.highlights.filter(function (h) { return h && h.trim(); }),
              notes: f.notes.value.trim(),
              featured: f.featured.checked,
              views: o.views || 0,
              createdAt: o.createdAt
            };
            var saved = S.upsert('offers', data);
            m.close();
            U.toast('تم حفظ العرض ' + saved.code, 'ok');
            if (onSaved) onSaved(saved);
          }
        }),
        el('button', { class: 'btn btn--ghost', type: 'button', text: 'إلغاء', onclick: function () { m.close(); } })
      ]
    });
    return m;
  }

  window.AS.screens.newOfferFor = function (propertyId, cb) { offerForm(null, propertyId, cb); };
  window.AS.screens.offerForm = offerForm;

  /* ---------- تسجيل صفقة ---------- */

  function closeDeal(v, done) {
    var o = v.offer, p = v.prop;
    var commission = o.kind === 'rent'
      ? o.price * (o.commissionPct || 0) / 100
      : o.price * (o.commissionPct || 0) / 100;

    var buyer = el('input', { type: 'text', placeholder: 'اسم المشتري / المستأجر' });
    var amount = el('input', { type: 'text', inputmode: 'numeric', value: Math.round(commission) || '' });
    var m = U.modal({
      title: '🤝 تسجيل صفقة — ' + o.code,
      body: el('div', { class: 'stack-sm' }, [
        el('p', { class: 'small muted', text: 'سيُغلق العرض، وتتحوّل حالة العقار، وتُسجَّل العمولة في القاصة.' }),
        U.field('اسم الطرف الثاني', buyer),
        U.field('مبلغ العمولة (' + U.curSign(o.currency) + ')', amount)
      ]),
      foot: [
        el('button', {
          class: 'btn', type: 'button', text: '✅ إتمام الصفقة',
          onclick: function () {
            o.status = 'closed';
            p.status = o.kind === 'rent' ? 'rented' : 'sold';
            S.save();
            m.close();
            window.AS.screens.cashEntryForm({
              direction: 'in',
              amount: U.toNum(amount.value),
              currency: o.currency,
              category: o.kind === 'rent' ? 'عمولة إيجار' : 'عمولة بيع',
              party: buyer.value.trim() || (p.ownerName || ''),
              refType: 'offer', refId: o.id,
              note: 'عمولة ' + o.code + ' — ' + (o.title || p.title)
            }, function () {
              U.toast('تم تسجيل الصفقة والعمولة', 'ok');
              if (done) done();
            });
          }
        }),
        el('button', { class: 'btn btn--ghost', type: 'button', text: 'إلغاء', onclick: function () { m.close(); } })
      ]
    });
  }

  /* ---------- شاشة العروض ---------- */

  window.AS.screens.offers = function (host, ctx) {
    var q = ctx.state.offersQuery = ctx.state.offersQuery || V.defaultQuery({ status: '' });

    function render(rebuildPanel) {
      var views = S.offersView();
      var list = V.applyQuery(views, q);
      var db = S.db;

      var counts = { active: 0, reserved: 0, closed: 0, expired: 0 };
      views.forEach(function (v) { counts[v.offer.status] = (counts[v.offer.status] || 0) + 1; });

      var grid = el('div', { class: 'prop-grid' }, list.map(function (v) {
        return V.offerCard(v, {
          admin: true,
          onOpen: function () {
            V.detailModal(v, {
              admin: true,
              extraFoot: [
                el('button', { class: 'btn btn--ghost', type: 'button', text: '✏️ تعديل', onclick: function () { offerForm(v.offer, null, function () { render(); }); } }),
                v.offer.status !== 'closed'
                  ? el('button', { class: 'btn btn--gold', type: 'button', text: '🤝 تسجيل صفقة', onclick: function () { closeDeal(v, render); } })
                  : null
              ].filter(Boolean)
            });
          }
        });
      }));

      var panel = V.searchPanel(q, function () { render(); }, { showStatus: true, defaultStatus: '' });

      U.mount(host, el('div', { class: 'stack' }, [
        el('div', { class: 'main__head' }, [
          el('div', {}, [
            el('h1', { text: 'العروض' }),
            el('p', { class: 'muted small', text: 'سجّل العرض مرة واحدة، ثم دوّر عليه بثانية واحدة بالبحث أو الكود.' })
          ]),
          el('div', { class: 'row', style: 'gap:8px' }, [
            el('button', {
              class: 'btn btn--ghost', type: 'button', text: '📤 تصدير النتائج',
              onclick: function () { exportOffers(list); }
            }),
            el('button', { class: 'btn', type: 'button', text: '➕ عرض جديد', onclick: function () { offerForm(null, null, function () { render(); }); } })
          ])
        ]),
        el('div', { class: 'grid grid--4' }, [
          U.stat({ label: 'عروض فعّالة', value: U.num(counts.active || 0), icon: '🟢', variant: 'brand' }),
          U.stat({ label: 'محجوزة بعربون', value: U.num(counts.reserved || 0), icon: '🔒' }),
          U.stat({ label: 'منجزة', value: U.num(counts.closed || 0), icon: '🤝' }),
          U.stat({ label: 'إجمالي العروض', value: U.num(views.length), icon: '🏷️' })
        ]),
        panel,
        el('div', { class: 'row row--between' }, [
          el('span', { class: 'small muted', text: 'النتائج: ' + U.num(list.length) + ' عرض' }),
          el('span', { class: 'small muted', text: q.text ? 'بحث عن: «' + q.text + '»' : '' })
        ]),
        list.length ? grid : U.empty('ما في عرض مطابق للبحث — جرّب تصفير الفلاتر', '🔍')
      ]));
    }

    render(true);
  };

  function exportOffers(list) {
    var rows = [['كود العرض', 'العنوان', 'النوع', 'الغرض', 'المحافظة', 'المنطقة', 'المساحة', 'السعر', 'العملة', 'الحالة', 'صالح حتى', 'المالك', 'هاتف المالك']];
    list.forEach(function (v) {
      rows.push([
        v.offer.code, v.title, S.typeName(v.type), S.purposeName(v.offer.kind),
        S.govName(v.gov), v.area, v.space, v.price, v.currency,
        S.statusOf(S.OFFER_STATUS, v.offer.status).name,
        v.offer.validUntil ? U.shortDate(v.offer.validUntil) : '',
        v.prop.ownerName || '', v.prop.ownerPhone || ''
      ]);
    });
    var csv = '﻿' + rows.map(function (r) {
      return r.map(function (c) { return '"' + String(c == null ? '' : c).replace(/"/g, '""') + '"'; }).join(',');
    }).join('\n');
    U.download('عروض-' + U.dateInput(Date.now()) + '.csv', csv, 'text/csv;charset=utf-8');
    U.toast('تم تصدير النتائج', 'ok');
  }

  /* ---------- بكجات العروض ---------- */

  function packageForm(existing, onSaved) {
    var k = Object.assign({
      code: '', name: '', offerIds: [], audience: '', discountPct: 0,
      validUntil: Date.now() + 30 * 86400000, notes: '', status: 'active', currency: S.db.settings.mainCurrency
    }, existing || {});
    k.offerIds = (k.offerIds || []).slice();

    var f = {};
    f.name = el('input', { type: 'text', value: k.name, placeholder: 'مثال: بكج شقق بغداد بالتقسيط' });
    f.audience = el('input', { type: 'text', value: k.audience, placeholder: 'لمن موجّه هذا البكج؟' });
    f.discount = el('input', { type: 'text', inputmode: 'decimal', value: k.discountPct || '' });
    f.validUntil = el('input', { type: 'date', value: U.dateInput(k.validUntil) });
    f.status = U.select([{ value: 'active', label: 'فعّال' }, { value: 'closed', label: 'منتهي' }], k.status);
    f.notes = el('textarea', {});
    f.notes.value = k.notes || '';

    var search = el('input', { type: 'search', placeholder: 'ابحث عن عرض لإضافته…' });
    var listHost = el('div', { style: 'max-height:230px;overflow:auto' });
    var totalLine = el('div', { class: 'panel small' });

    function paint() {
      var qtext = search.value.trim().toLowerCase();
      var views = S.offersView().filter(function (v) {
        return !qtext || v.haystack.indexOf(qtext) !== -1;
      });
      U.clear(listHost);
      views.slice(0, 60).forEach(function (v) {
        var on = k.offerIds.indexOf(v.offer.id) !== -1;
        var cb = el('input', { type: 'checkbox' });
        cb.checked = on;
        cb.addEventListener('change', function () {
          var i = k.offerIds.indexOf(v.offer.id);
          if (cb.checked && i === -1) k.offerIds.push(v.offer.id);
          if (!cb.checked && i !== -1) k.offerIds.splice(i, 1);
          totals();
        });
        listHost.appendChild(el('label', { class: 'list-row', style: 'cursor:pointer;margin-bottom:6px' }, [
          cb,
          el('span', { class: 'grow' }, [
            el('span', { class: 'tiny mono muted', text: v.offer.code + ' · ' }),
            el('span', { style: 'font-weight:700', text: v.title }),
            el('span', { class: 'small muted', style: 'display:block', text: V.locText(v.prop) })
          ]),
          el('span', { class: 'small nowrap', text: U.money(v.price, v.currency) })
        ]));
      });
      totals();
    }

    function totals() {
      var sum = 0;
      k.offerIds.forEach(function (oid) {
        var o = S.offer(oid);
        if (o) sum += S.toMain(o.price, o.currency);
      });
      var disc = U.toNum(f.discount.value);
      totalLine.innerHTML = '<b>' + U.num(k.offerIds.length) + '</b> عرض داخل البكج · القيمة الإجمالية <b>'
        + U.moneyShort(sum, S.db.settings.mainCurrency) + '</b>'
        + (disc ? ' · بعد خصم ' + U.num(disc) + '٪: <b>' + U.moneyShort(sum * (1 - disc / 100), S.db.settings.mainCurrency) + '</b>' : '');
    }

    var t;
    search.addEventListener('input', function () { clearTimeout(t); t = setTimeout(paint, 160); });
    f.discount.addEventListener('input', totals);
    paint();

    var m = U.modal({
      title: k.id ? 'تعديل البكج' : '🎁 بكج عروض جديد',
      body: el('div', { class: 'stack' }, [
        el('div', { class: 'grid grid--2' }, [
          U.field('اسم البكج', f.name),
          U.field('الفئة المستهدفة', f.audience)
        ]),
        el('div', { class: 'grid grid--3' }, [
          U.field('نسبة الخصم ٪', f.discount),
          U.field('صالح حتى', f.validUntil),
          U.field('الحالة', f.status)
        ]),
        U.field('العروض داخل البكج', el('div', { class: 'stack-sm' }, [
          el('div', { class: 'searchbox' }, [search]), listHost, totalLine
        ])),
        U.field('ملاحظات وشروط البكج', f.notes)
      ]),
      wide: true,
      foot: [
        el('button', {
          class: 'btn', type: 'button', text: '💾 حفظ البكج',
          onclick: function () {
            if (!f.name.value.trim()) return U.toast('اكتب اسم البكج', 'err');
            if (!k.offerIds.length) return U.toast('اختر عرضاً واحداً على الأقل', 'err');
            var saved = S.upsert('packages', {
              id: k.id, code: k.code || S.nextCode('package'),
              name: f.name.value.trim(), audience: f.audience.value.trim(),
              offerIds: k.offerIds, discountPct: U.toNum(f.discount.value),
              validUntil: f.validUntil.value ? new Date(f.validUntil.value).getTime() : 0,
              status: f.status.value, notes: f.notes.value.trim(),
              currency: S.db.settings.mainCurrency, createdAt: k.createdAt
            });
            m.close();
            U.toast('تم حفظ البكج ' + saved.code, 'ok');
            if (onSaved) onSaved(saved);
          }
        }),
        el('button', { class: 'btn btn--ghost', type: 'button', text: 'إلغاء', onclick: function () { m.close(); } })
      ]
    });
  }

  function packageText(k) {
    var db = S.db;
    var lines = ['🎁 ' + k.name + ' (' + k.code + ')'];
    if (k.audience) lines.push('موجّه إلى: ' + k.audience);
    lines.push('');
    k.offerIds.forEach(function (oid, i) {
      var o = S.offer(oid);
      if (!o) return;
      var p = S.property(o.propertyId) || {};
      lines.push((i + 1) + '. ' + (o.title || p.title));
      lines.push('   الموقع: ' + V.locText(p));
      lines.push('   السعر: ' + U.money(o.price, o.currency) + (p.space ? ' · المساحة: ' + U.num(p.space) + ' م²' : ''));
    });
    if (k.discountPct) lines.push('\nخصم خاص: ' + U.num(k.discountPct) + '٪');
    if (k.validUntil) lines.push('صالح حتى: ' + U.shortDate(k.validUntil));
    if (k.notes) lines.push('\n' + k.notes);
    lines.push('\n' + db.settings.company + ' · ' + db.settings.phone);
    return lines.join('\n');
  }

  window.AS.screens.packages = function (host) {
    function render() {
      var db = S.db;

      function card(k) {
        var sum = 0;
        var items = k.offerIds.map(function (oid) { return S.offer(oid); }).filter(Boolean);
        items.forEach(function (o) { sum += S.toMain(o.price, o.currency); });
        var left = U.daysLeft(k.validUntil);

        return el('div', { class: 'card stack-sm' }, [
          el('div', { class: 'card__head' }, [
            el('div', {}, [
              el('div', { class: 'tiny mono muted', text: k.code }),
              el('h3', { class: 'card__title', text: k.name })
            ]),
            U.badge(k.status === 'active' ? 'فعّال' : 'منتهي', k.status === 'active' ? 'ok' : 'muted')
          ]),
          k.audience ? el('div', { class: 'small muted', text: '🎯 ' + k.audience }) : null,
          el('div', { class: 'grid grid--3' }, [
            U.stat({ label: 'عدد العروض', value: U.num(items.length), icon: '🏷️' }),
            U.stat({ label: 'قيمة البكج', value: U.moneyShort(sum, db.settings.mainCurrency), icon: '💰' }),
            U.stat({ label: 'الخصم', value: k.discountPct ? U.num(k.discountPct) + '٪' : '—', icon: '🎁' })
          ]),
          el('div', { class: 'stack-sm' }, items.map(function (o) {
            var p = S.property(o.propertyId) || {};
            return el('div', { class: 'list-row' }, [
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
            el('span', { class: 'tiny muted', text: k.validUntil ? (left >= 0 ? 'ينتهي خلال ' + U.num(left) + ' يوم' : 'انتهت مدته') : '' }),
            el('div', { class: 'row', style: 'gap:6px' }, [
              el('button', { class: 'btn btn--ghost btn--sm', type: 'button', text: '📋 نسخ', onclick: function () { U.copy(packageText(k), 'نُسخ البكج — جاهز للإرسال'); } }),
              el('a', { class: 'btn btn--ghost btn--sm', href: U.whatsapp(db.settings.whatsapp, packageText(k)), target: '_blank', rel: 'noopener', text: '💬 إرسال' }),
              el('button', { class: 'btn btn--ghost btn--sm', type: 'button', text: '✏️', onclick: function () { packageForm(k, render); } }),
              el('button', {
                class: 'btn btn--ghost btn--sm', type: 'button', text: '🗑️',
                onclick: function () {
                  U.confirm('حذف البكج «' + k.name + '»؟', function () { S.remove('packages', k.id); render(); }, 'حذف', 'danger');
                }
              })
            ])
          ])
        ]);
      }

      U.mount(host, el('div', { class: 'stack' }, [
        el('div', { class: 'main__head' }, [
          el('div', {}, [
            el('h1', { text: 'بكجات العروض' }),
            el('p', { class: 'muted small', text: 'اجمع عدة عروض في بكج واحد وأرسله للزبون أو المستثمر برسالة وحدة.' })
          ]),
          el('button', { class: 'btn', type: 'button', text: '➕ بكج جديد', onclick: function () { packageForm(null, render); } })
        ]),
        db.packages.length
          ? el('div', { class: 'grid grid--2' }, db.packages.map(card))
          : U.empty('ما في بكجات — أنشئ بكج وجمّع فيه أحسن عروضك', '🎁')
      ]));
    }

    render();
  };
})();
