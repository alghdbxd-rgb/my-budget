/* =============================================================
   بوابة العيادة الشريكة — التحقق من رمز الخصم وصرفه (FR-26)
   ============================================================= */
(function () {
  'use strict';
  var S = window.GC.store, U = window.GC.ui, E = window.GC.engine;
  var view = U.$('#view');

  function db() { return S.load(); }

  function render() {
    var d = db();
    var clinicSel = U.el('select', {}, d.clinics.filter(function (c) { return c.partner; })
      .map(function (c) { return U.el('option', { value: c.id, text: c.name }); }));
    var code = U.el('input', {
      type: 'text', placeholder: 'GC-XXXXXX',
      style: 'text-transform:uppercase;font-size:1.2rem;letter-spacing:2px;text-align:center;direction:ltr'
    });
    var result = U.el('div', {});

    function check(redeem) {
      var value = String(code.value || '').trim().toUpperCase();
      U.clear(result);
      if (!value) { U.toast('أدخل الرمز', 'error'); return; }
      var row = db().codes.filter(function (c) { return c.value === value; })[0];
      if (!row) {
        result.appendChild(U.el('div', { class: 'alert alert--danger', text: 'الرمز غير موجود في النظام.' }));
        return;
      }
      var cs = E.consultationById(db(), row.consultationId);
      if (row.redeemed) {
        result.appendChild(U.el('div', { class: 'alert alert--warn', text: 'الرمز مستخدَم سابقاً بتاريخ ' + U.dateTime(row.redeemedAt) + ' — لا يُصرف مرتين.' }));
        return;
      }
      if (!cs || !(cs.status === 'answered' || cs.status === 'closed')) {
        result.appendChild(U.el('div', { class: 'alert alert--warn', text: 'الاستشارة لم تُنجز بعد — لا يمكن صرف الرمز.' }));
        return;
      }
      var patient = E.patientById(db(), cs.patientId);
      var discount = Math.round((cs.amount || 0) * (db().settings.clinicDiscountPercent / 100));

      var info = U.el('div', { class: 'card stack' }, [
        U.el('h3', { text: 'الرمز صالح ✅' }),
        U.el('div', { class: 'report__grid' }, [
          U.el('div', { class: 'report__row' }, [U.el('b', { text: 'الحالة' }), U.el('span', { text: cs.id })]),
          U.el('div', { class: 'report__row' }, [U.el('b', { text: 'المريض' }), U.el('span', { text: patient ? (patient.name || patient.phone) : '—' })]),
          U.el('div', { class: 'report__row' }, [U.el('b', { text: 'تاريخ التقرير' }), U.el('span', { text: U.date(cs.answeredAt || cs.createdAt) })]),
          U.el('div', { class: 'report__row' }, [U.el('b', { text: 'قيمة الخصم' }), U.el('span', { text: U.money(discount, db().settings.currency) })])
        ])
      ]);
      result.appendChild(info);

      if (!redeem) {
        info.appendChild(U.el('button', {
          class: 'btn btn--gold btn--block', text: 'تأكيد الصرف داخل ' + clinicSel.options[clinicSel.selectedIndex].text,
          onclick: function () { check(true); }
        }));
        return;
      }

      S.update(function (dd) {
        var r = dd.codes.filter(function (c) { return c.value === value; })[0];
        var c2 = E.consultationById(dd, r.consultationId);
        r.redeemed = true;
        r.redeemedAt = Date.now();
        r.clinicId = clinicSel.value;
        r.discount = discount;
        var tx = dd.transactions.filter(function (t) { return t.consultationId === c2.id; })[0];
        if (tx) { tx.clinicId = clinicSel.value; tx.clinicDiscount = discount; }
        var cl = E.clinicById(dd, clinicSel.value);
        S.log(dd, {
          who: cl ? cl.name : 'عيادة', role: 'clinic',
          what: 'صرف رمز الخصم ' + value + ' للحالة ' + c2.id, targetPatientId: c2.patientId
        });
      });
      U.clear(result);
      result.appendChild(U.el('div', { class: 'alert alert--ok', text: 'تم صرف الرمز — يُخصم ' + U.money(discount, db().settings.currency) + ' من كلفة العلاج. الرمز الآن غير قابل لإعادة الاستخدام.' }));
      code.value = '';
    }

    var recent = db().codes.filter(function (c) { return c.redeemed; })
      .sort(function (a, b) { return b.redeemedAt - a.redeemedAt; }).slice(0, 10);

    U.mount(view, U.el('div', { class: 'stack' }, [
      U.el('h1', { text: 'التحقق من رمز الخصم' }),
      U.el('p', { class: 'muted', text: 'أدخل الرمز التسلسلي الموجود في تقرير المريض للتحقق منه وصرفه مرة واحدة.' }),
      U.el('div', { class: 'card stack' }, [
        U.el('label', { class: 'field' }, [U.el('span', { class: 'field__label', text: 'العيادة' }), clinicSel]),
        U.el('label', { class: 'field' }, [U.el('span', { class: 'field__label', text: 'الرمز التسلسلي' }), code]),
        U.el('button', { class: 'btn btn--block', text: 'تحقق', onclick: function () { check(false); } })
      ]),
      result,
      U.el('div', { class: 'card' }, [
        U.el('h3', { text: 'آخر الأكواد المصروفة' }),
        recent.length ? U.table([
          { title: 'الرمز', key: 'value' },
          { title: 'الحالة', key: 'consultationId' },
          { title: 'العيادة', render: function (r) {
              var c = E.clinicById(db(), r.clinicId);
              return c ? c.name : '—';
            } },
          { title: 'التاريخ', render: function (r) { return U.dateTime(r.redeemedAt); } },
          { title: 'الخصم', render: function (r) { return U.num(r.discount); } }
        ], recent) : U.empty('لم يُصرف أي رمز بعد.', '🎟️')
      ])
    ]));
  }

  U.roleBar('clinic');
  render();
})();
