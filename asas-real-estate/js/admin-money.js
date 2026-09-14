/* =============================================================
   القاصة والمستثمرون — إدخال الأموال وصرفها ومتابعة رؤوس الأموال
   ============================================================= */
(function () {
  'use strict';

  var U = window.AS.ui;
  var S = window.AS.store;
  var el = U.el;

  window.AS.screens = window.AS.screens || {};

  /* ---------- وصل القبض / الصرف ---------- */

  function receipt(entry) {
    var db = S.db;
    var box = S.byId(db.boxes, entry.boxId) || {};
    var area = el('div', { class: 'receipt print-area' }, [
      el('div', { class: 'row row--between' }, [
        el('div', {}, [
          el('h3', { text: db.settings.company }),
          el('div', { class: 'small', text: db.settings.address + ' · ' + db.settings.phone })
        ]),
        el('div', { style: 'text-align:left' }, [
          el('div', { style: 'font-weight:800', text: entry.direction === 'in' ? 'وصل قبض' : 'وصل صرف' }),
          el('div', { class: 'small', text: 'رقم: ' + (entry.receiptNo || '—') }),
          el('div', { class: 'small', text: U.shortDate(entry.date) })
        ])
      ]),
      el('hr'),
      el('table', {}, [
        el('tbody', {}, [
          el('tr', {}, [el('td', { text: entry.direction === 'in' ? 'استلمنا من' : 'صرفنا إلى' }), el('td', { text: entry.party || '—' })]),
          el('tr', {}, [el('td', { text: 'المبلغ' }), el('td', { text: U.money(entry.amount, entry.currency) })]),
          el('tr', {}, [el('td', { text: 'وذلك عن' }), el('td', { text: entry.category + (entry.note ? ' — ' + entry.note : '') })]),
          el('tr', {}, [el('td', { text: 'طريقة الدفع' }), el('td', { text: entry.method || '—' })]),
          el('tr', {}, [el('td', { text: 'القاصة' }), el('td', { text: box.name || '—' })])
        ])
      ]),
      el('div', { class: 'row row--between', style: 'margin-top:26px' }, [
        el('div', { class: 'small', text: 'توقيع المستلم: ................' }),
        el('div', { class: 'small', text: 'توقيع المحاسب: ................' })
      ])
    ]);

    U.modal({
      title: 'وصل ' + (entry.direction === 'in' ? 'قبض' : 'صرف'),
      body: area,
      foot: [el('button', { class: 'btn', type: 'button', text: '🖨️ طباعة', onclick: function () { window.print(); } })]
    });
  }

  /* ---------- نموذج حركة القاصة ---------- */

  function cashEntryForm(prefill, onSaved) {
    var db = S.db;
    var e = Object.assign({
      boxId: db.boxes.length ? db.boxes[0].id : '', direction: 'in', amount: 0,
      currency: db.settings.mainCurrency, category: '', party: '', method: 'نقد',
      refType: '', refId: '', note: '', date: Date.now()
    }, prefill || {});

    if (!db.boxes.length) {
      U.toast('أضف قاصة أولاً', 'err');
      return;
    }

    /* إذا جاءت الحركة من صفقة أو مستثمر بعملة معيّنة، نختار قاصة بنفس العملة */
    if (prefill && prefill.currency) {
      var sameCur = db.boxes.filter(function (b) { return b.currency === prefill.currency; })[0];
      if (sameCur) e.boxId = sameCur.id;
    }
    var startBox = S.byId(db.boxes, e.boxId) || db.boxes[0];
    e.boxId = startBox.id;
    e.currency = startBox.currency;

    var f = {};
    f.direction = el('div', { class: 'seg' });
    var dirBtns = {};
    [['in', '⬅️ قبض (دخول أموال)'], ['out', '➡️ صرف (خروج أموال)']].forEach(function (pair) {
      var b = el('button', {
        type: 'button', class: e.direction === pair[0] ? 'is-on' : '', text: pair[1],
        onclick: function () {
          e.direction = pair[0];
          Object.keys(dirBtns).forEach(function (k) { dirBtns[k].classList.toggle('is-on', k === pair[0]); });
          fillCats();
        }
      });
      dirBtns[pair[0]] = b;
      f.direction.appendChild(b);
    });

    var curLabel = el('div', {
      class: 'panel center', style: 'font-weight:800;padding:9px',
      text: U.curSign(e.currency)
    });
    f.box = U.select(db.boxes.map(function (b) { return { value: b.id, label: b.name + ' (' + U.curSign(b.currency) + ')' }; }), e.boxId, {
      onchange: function () {
        var box = S.byId(db.boxes, f.box.value);
        if (box) { e.currency = box.currency; curLabel.textContent = U.curSign(box.currency); }
      }
    });
    f.amount = el('input', { type: 'text', inputmode: 'numeric', value: e.amount || '', placeholder: 'المبلغ' });
    f.category = el('select', {});
    f.party = el('input', { type: 'text', value: e.party, placeholder: 'اسم الشخص أو الجهة' });
    f.method = U.select(['نقد', 'حوالة مصرفية', 'زين كاش', 'آسيا حوالة', 'صك'].map(function (x) { return { value: x, label: x }; }), e.method);
    f.date = el('input', { type: 'date', value: U.dateInput(e.date) });
    f.note = el('input', { type: 'text', value: e.note, placeholder: 'بيان الحركة' });

    function fillCats() {
      var cats = S.CASH_CATS[e.direction];
      U.clear(f.category);
      cats.forEach(function (c) {
        var o = el('option', { value: c, text: c });
        if (c === e.category) o.selected = true;
        f.category.appendChild(o);
      });
    }
    fillCats();

    var m = U.modal({
      title: '💰 حركة قاصة جديدة',
      body: el('div', { class: 'stack-sm' }, [
        f.direction,
        el('div', { class: 'grid grid--3' }, [
          U.field('القاصة', f.box),
          U.field('المبلغ', f.amount),
          U.field('العملة (حسب القاصة)', curLabel)
        ]),
        el('div', { class: 'grid grid--3' }, [
          U.field('التصنيف', f.category),
          U.field('الطرف الثاني', f.party),
          U.field('طريقة الدفع', f.method)
        ]),
        el('div', { class: 'grid grid--2' }, [
          U.field('التاريخ', f.date),
          U.field('البيان', f.note)
        ])
      ]),
      foot: [
        el('button', {
          class: 'btn', type: 'button', text: '💾 حفظ الحركة',
          onclick: function () {
            var amount = U.toNum(f.amount.value);
            if (!amount) return U.toast('اكتب المبلغ', 'err');
            var saved = S.upsert('cash', {
              id: e.id,
              boxId: f.box.value, direction: e.direction, amount: amount, currency: e.currency,
              category: f.category.value, party: f.party.value.trim(), method: f.method.value,
              refType: e.refType || '', refId: e.refId || '',
              receiptNo: e.receiptNo || S.nextCode('receipt'),
              note: f.note.value.trim(),
              date: f.date.value ? new Date(f.date.value).getTime() : Date.now(),
              createdAt: e.createdAt
            });
            m.close();
            U.toast('تم تسجيل الحركة', 'ok');
            if (onSaved) onSaved(saved);
          }
        }),
        el('button', { class: 'btn btn--ghost', type: 'button', text: 'إلغاء', onclick: function () { m.close(); } })
      ]
    });
  }

  window.AS.screens.cashEntryForm = cashEntryForm;

  /* ---------- شاشة القاصة ---------- */

  function boxForm(existing, done) {
    var b = Object.assign({ name: '', kind: 'cash', currency: S.db.settings.mainCurrency, openingBalance: 0 }, existing || {});
    var f = {
      name: el('input', { type: 'text', value: b.name, placeholder: 'مثال: قاصة المكتب' }),
      kind: U.select([{ value: 'cash', label: 'نقد' }, { value: 'bank', label: 'حساب مصرفي' }, { value: 'wallet', label: 'محفظة إلكترونية' }], b.kind),
      currency: U.select([{ value: 'USD', label: '$ دولار' }, { value: 'IQD', label: 'د.ع دينار' }], b.currency),
      opening: el('input', { type: 'text', inputmode: 'numeric', value: b.openingBalance || '' })
    };
    var m = U.modal({
      title: b.id ? 'تعديل القاصة' : '➕ قاصة جديدة',
      body: el('div', { class: 'grid grid--2' }, [
        U.field('اسم القاصة', f.name),
        U.field('النوع', f.kind),
        U.field('العملة', f.currency),
        U.field('الرصيد الافتتاحي', f.opening)
      ]),
      foot: [
        el('button', {
          class: 'btn', type: 'button', text: '💾 حفظ',
          onclick: function () {
            if (!f.name.value.trim()) return U.toast('اكتب اسم القاصة', 'err');
            S.upsert('boxes', {
              id: b.id, name: f.name.value.trim(), kind: f.kind.value,
              currency: f.currency.value, openingBalance: U.toNum(f.opening.value), createdAt: b.createdAt
            });
            m.close();
            if (done) done();
          }
        }),
        el('button', { class: 'btn btn--ghost', type: 'button', text: 'إلغاء', onclick: function () { m.close(); } })
      ]
    });
  }

  window.AS.screens.cash = function (host, ctx) {
    var state = ctx.state.cash = ctx.state.cash || { box: '', dir: '', month: '', text: '' };

    function render() {
      var db = S.db;
      var text = state.text.trim().toLowerCase();

      var entries = db.cash.filter(function (e) {
        if (state.box && e.boxId !== state.box) return false;
        if (state.dir && e.direction !== state.dir) return false;
        if (state.month && U.monthKey(e.date) !== state.month) return false;
        if (!text) return true;
        return [e.party, e.category, e.note, e.receiptNo].join(' ').toLowerCase().indexOf(text) !== -1;
      }).sort(function (a, b) { return b.date - a.date; });

      var totals = { in: 0, out: 0 };
      entries.forEach(function (e) {
        var v = S.toMain(e.amount, e.currency);
        if (e.direction === 'in') totals.in += v; else totals.out += v;
      });

      var months = {};
      db.cash.forEach(function (e) { months[U.monthKey(e.date)] = true; });
      var monthOpts = [{ value: '', label: 'كل الأشهر' }].concat(Object.keys(months).sort().reverse().map(function (k) {
        return { value: k, label: U.monthLabel(k) };
      }));

      var search = el('input', { type: 'search', value: state.text, placeholder: 'ابحث بالاسم أو البيان أو رقم الوصل…' });
      var t;
      search.addEventListener('input', function () { clearTimeout(t); t = setTimeout(function () { state.text = search.value; render(); }, 180); });

      var rows = entries.map(function (e) {
        var box = S.byId(db.boxes, e.boxId) || {};
        return [
          { text: e.receiptNo || '—', class: 'mono tiny' },
          U.shortDate(e.date),
          e.direction === 'in'
            ? el('span', { class: 'badge badge--ok', text: 'قبض' })
            : el('span', { class: 'badge badge--danger', text: 'صرف' }),
          e.category,
          e.party || '—',
          box.name || '—',
          { text: U.money(e.amount, e.currency), class: 'num ' + (e.direction === 'in' ? 'money-in' : 'money-out') },
          el('div', { class: 'row', style: 'gap:4px;flex-wrap:nowrap' }, [
            el('button', { class: 'btn btn--ghost btn--sm', type: 'button', text: '🧾', title: 'وصل', onclick: function () { receipt(e); } }),
            el('button', { class: 'btn btn--ghost btn--sm', type: 'button', text: '✏️', title: 'تعديل', onclick: function () { cashEntryForm(e, render); } }),
            el('button', {
              class: 'btn btn--ghost btn--sm', type: 'button', text: '🗑️', title: 'حذف',
              onclick: function () { U.confirm('حذف هذه الحركة؟', function () { S.remove('cash', e.id); render(); }, 'حذف', 'danger'); }
            })
          ])
        ];
      });

      U.mount(host, el('div', { class: 'stack' }, [
        el('div', { class: 'main__head' }, [
          el('div', {}, [
            el('h1', { text: 'القاصة' }),
            el('p', { class: 'muted small', text: 'كل دينار داخل أو خارج — بوصل مرقّم وقابل للطباعة.' })
          ]),
          el('div', { class: 'row', style: 'gap:8px' }, [
            el('button', { class: 'btn btn--ghost', type: 'button', text: '🏦 قاصة جديدة', onclick: function () { boxForm(null, render); } }),
            el('button', { class: 'btn', type: 'button', text: '➕ حركة جديدة', onclick: function () { cashEntryForm(null, render); } })
          ])
        ]),

        el('div', { class: 'grid grid--auto' }, db.boxes.map(function (b) {
          var bal = S.boxBalance(b.id);
          return el('div', { class: 'stat' }, [
            el('div', { class: 'stat__label' }, [
              el('span', { text: b.kind === 'bank' ? '🏦' : b.kind === 'wallet' ? '📱' : '💵' }),
              el('span', { text: b.name })
            ]),
            el('div', { class: 'stat__value', text: U.money(bal, b.currency) }),
            el('div', { class: 'row row--between' }, [
              el('span', { class: 'stat__hint', text: 'افتتاحي: ' + U.shortNum(b.openingBalance) }),
              el('button', { class: 'btn btn--ghost btn--sm', type: 'button', text: '✏️', onclick: function () { boxForm(b, render); } })
            ])
          ]);
        })),

        el('div', { class: 'grid grid--3' }, [
          U.stat({ label: 'داخل (حسب الفلتر)', value: U.moneyShort(totals.in, db.settings.mainCurrency), icon: '⬅️', variant: 'brand' }),
          U.stat({ label: 'خارج (حسب الفلتر)', value: U.moneyShort(totals.out, db.settings.mainCurrency), icon: '➡️' }),
          U.stat({ label: 'الصافي', value: U.moneyShort(totals.in - totals.out, db.settings.mainCurrency), icon: '📊', variant: 'gold' })
        ]),

        el('div', { class: 'toolbar' }, [
          el('div', { class: 'searchbox grow' }, [search]),
          U.select([{ value: '', label: 'كل القواصة' }].concat(db.boxes.map(function (b) { return { value: b.id, label: b.name }; })), state.box,
            { onchange: function (ev) { state.box = ev.target.value; render(); } }),
          U.select([{ value: '', label: 'قبض وصرف' }, { value: 'in', label: 'قبض فقط' }, { value: 'out', label: 'صرف فقط' }], state.dir,
            { onchange: function (ev) { state.dir = ev.target.value; render(); } }),
          U.select(monthOpts, state.month, { onchange: function (ev) { state.month = ev.target.value; render(); } }),
          el('button', {
            class: 'btn btn--ghost btn--sm', type: 'button', text: '📤 تصدير CSV',
            onclick: function () { exportCash(entries); }
          })
        ]),

        entries.length
          ? U.table(['الوصل', 'التاريخ', 'النوع', 'التصنيف', 'الطرف', 'القاصة', 'المبلغ', ''], rows)
          : U.empty('ما في حركات مطابقة', '💰')
      ]));
    }

    render();
  };

  function exportCash(entries) {
    var rows = [['رقم الوصل', 'التاريخ', 'النوع', 'التصنيف', 'الطرف', 'المبلغ', 'العملة', 'طريقة الدفع', 'البيان']];
    entries.forEach(function (e) {
      rows.push([e.receiptNo, U.shortDate(e.date), e.direction === 'in' ? 'قبض' : 'صرف', e.category, e.party, e.amount, e.currency, e.method, e.note]);
    });
    var csv = '﻿' + rows.map(function (r) {
      return r.map(function (c) { return '"' + String(c == null ? '' : c).replace(/"/g, '""') + '"'; }).join(',');
    }).join('\n');
    U.download('القاصة-' + U.dateInput(Date.now()) + '.csv', csv, 'text/csv;charset=utf-8');
  }

  /* ---------- المستثمرون ---------- */

  function investorForm(existing, done) {
    var iv = Object.assign({
      name: '', phone: '', capital: 0, currency: S.db.settings.mainCurrency,
      sharePct: 0, joinedAt: Date.now(), status: 'active', notes: ''
    }, existing || {});

    var f = {
      name: el('input', { type: 'text', value: iv.name, placeholder: 'اسم المستثمر أو الشركة' }),
      phone: el('input', { type: 'tel', value: iv.phone, placeholder: '07XXXXXXXXX' }),
      capital: el('input', { type: 'text', inputmode: 'numeric', value: iv.capital || '' }),
      currency: U.select([{ value: 'USD', label: '$ دولار' }, { value: 'IQD', label: 'د.ع دينار' }], iv.currency),
      sharePct: el('input', { type: 'text', inputmode: 'decimal', value: iv.sharePct || '' }),
      joinedAt: el('input', { type: 'date', value: U.dateInput(iv.joinedAt) }),
      status: U.select([{ value: 'active', label: 'نشط' }, { value: 'paused', label: 'متوقف' }, { value: 'exited', label: 'منسحب' }], iv.status),
      notes: el('textarea', {})
    };
    f.notes.value = iv.notes || '';

    var m = U.modal({
      title: iv.id ? 'تعديل المستثمر' : '🤝 مستثمر جديد',
      body: el('div', { class: 'stack-sm' }, [
        el('div', { class: 'grid grid--2' }, [U.field('الاسم', f.name), U.field('الهاتف', f.phone)]),
        el('div', { class: 'grid grid--3' }, [
          U.field('رأس المال المتفق عليه', f.capital),
          U.field('العملة', f.currency),
          U.field('نسبة الشراكة ٪', f.sharePct)
        ]),
        el('div', { class: 'grid grid--2' }, [U.field('تاريخ الانضمام', f.joinedAt), U.field('الحالة', f.status)]),
        U.field('ملاحظات', f.notes)
      ]),
      foot: [
        el('button', {
          class: 'btn', type: 'button', text: '💾 حفظ',
          onclick: function () {
            if (!f.name.value.trim()) return U.toast('اكتب اسم المستثمر', 'err');
            S.upsert('investors', {
              id: iv.id, name: f.name.value.trim(), phone: f.phone.value.trim(),
              capital: U.toNum(f.capital.value), currency: f.currency.value,
              sharePct: U.toNum(f.sharePct.value),
              joinedAt: f.joinedAt.value ? new Date(f.joinedAt.value).getTime() : Date.now(),
              status: f.status.value, notes: f.notes.value.trim(), createdAt: iv.createdAt
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

  window.AS.screens.investors = function (host) {
    function render() {
      var db = S.db;
      var main = db.settings.mainCurrency;
      var totalCapital = db.investors.reduce(function (s, i) { return s + S.toMain(i.capital, i.currency); }, 0);
      var totalPaid = db.investors.reduce(function (s, i) { return s + Math.max(0, S.investorPaid(i.id)); }, 0);
      var totalProfit = db.investors.reduce(function (s, i) { return s + S.investorProfit(i.id); }, 0);

      var colors = ['var(--brand-600)', 'var(--gold-500)', 'var(--info)', 'var(--purple)', 'var(--ok)', 'var(--warn)'];
      var donut = U.donutChart(db.investors.map(function (i, idx) {
        return { label: i.name, value: Math.round(S.toMain(i.capital, i.currency)), color: colors[idx % colors.length] };
      }), { centerValue: U.shortNum(totalCapital), centerLabel: 'رأس المال' });

      function card(iv, idx) {
        var paid = S.investorPaid(iv.id);
        var profit = S.investorProfit(iv.id);
        var target = S.toMain(iv.capital, iv.currency);
        var moves = db.cash.filter(function (e) { return e.refType === 'investor' && e.refId === iv.id; })
          .sort(function (a, b) { return b.date - a.date; }).slice(0, 4);

        return el('div', { class: 'card stack-sm' }, [
          el('div', { class: 'card__head' }, [
            el('div', {}, [
              el('h3', { class: 'card__title', text: iv.name }),
              el('div', { class: 'small muted', text: (iv.phone || '—') + ' · منذ ' + U.shortDate(iv.joinedAt) })
            ]),
            U.badge(iv.status === 'active' ? 'نشط' : iv.status === 'paused' ? 'متوقف' : 'منسحب', iv.status === 'active' ? 'ok' : 'muted')
          ]),
          el('div', { class: 'grid grid--3' }, [
            U.stat({ label: 'رأس المال', value: U.moneyShort(iv.capital, iv.currency), icon: '💼' }),
            U.stat({ label: 'المدفوع فعلياً', value: U.moneyShort(paid, main), icon: '✅' }),
            U.stat({ label: 'أرباح مستلمة', value: U.moneyShort(profit, main), icon: '📈' })
          ]),
          el('div', {}, [
            el('div', { class: 'row row--between small' }, [
              el('span', { text: 'نسبة الشراكة ' + U.num(iv.sharePct) + '٪' }),
              el('span', { class: 'muted', text: 'التسديد ' + U.pct(target ? (paid / target) * 100 : 0) })
            ]),
            U.progress(paid, target || 1)
          ]),
          moves.length ? el('div', { class: 'timeline' }, moves.map(function (e) {
            return el('div', { class: 'timeline__item small' }, [
              el('div', { html: '<b>' + (e.direction === 'in' ? 'دفع' : 'استلم') + '</b> ' + U.money(e.amount, e.currency) + ' — ' + U.esc(e.category) }),
              el('div', { class: 'tiny muted', text: U.shortDate(e.date) })
            ]);
          })) : el('div', { class: 'small muted', text: 'لا توجد حركات مالية بعد.' }),
          iv.notes ? el('div', { class: 'panel small', text: iv.notes }) : null,
          el('div', { class: 'row', style: 'gap:6px' }, [
            el('button', {
              class: 'btn btn--sm grow', type: 'button', text: '⬅️ إيداع رأس مال',
              onclick: function () {
                window.AS.screens.cashEntryForm({
                  direction: 'in', category: 'رأس مال مستثمر', party: iv.name,
                  currency: iv.currency, refType: 'investor', refId: iv.id,
                  note: 'حصة رأس مال — ' + iv.name
                }, render);
              }
            }),
            el('button', {
              class: 'btn btn--gold btn--sm grow', type: 'button', text: '➡️ توزيع أرباح',
              onclick: function () {
                window.AS.screens.cashEntryForm({
                  direction: 'out', category: 'توزيع أرباح', party: iv.name,
                  currency: iv.currency, refType: 'investor', refId: iv.id,
                  note: 'توزيع أرباح — ' + iv.name
                }, render);
              }
            }),
            el('button', { class: 'btn btn--ghost btn--sm', type: 'button', text: '✏️', onclick: function () { investorForm(iv, render); } }),
            el('button', {
              class: 'btn btn--ghost btn--sm', type: 'button', text: '🗑️',
              onclick: function () { U.confirm('حذف المستثمر «' + iv.name + '»؟', function () { S.remove('investors', iv.id); render(); }, 'حذف', 'danger'); }
            })
          ])
        ]);
      }

      U.mount(host, el('div', { class: 'stack' }, [
        el('div', { class: 'main__head' }, [
          el('div', {}, [
            el('h1', { text: 'المستثمرون' }),
            el('p', { class: 'muted small', text: 'رؤوس الأموال، نِسب الشراكة، والأرباح الموزّعة.' })
          ]),
          el('button', { class: 'btn', type: 'button', text: '➕ مستثمر جديد', onclick: function () { investorForm(null, render); } })
        ]),
        el('div', { class: 'grid grid--3' }, [
          U.stat({ label: 'رأس المال المتفق عليه', value: U.moneyShort(totalCapital, main), icon: '💼', variant: 'brand' }),
          U.stat({ label: 'المستلم فعلياً', value: U.moneyShort(totalPaid, main), icon: '✅' }),
          U.stat({ label: 'أرباح موزّعة', value: U.moneyShort(totalProfit, main), icon: '📈', variant: 'gold' })
        ]),
        db.investors.length ? el('div', { class: 'card' }, [
          el('h3', { class: 'card__title', text: 'توزيع رؤوس الأموال' }),
          donut
        ]) : null,
        db.investors.length
          ? el('div', { class: 'grid grid--2' }, db.investors.map(card))
          : U.empty('ما في مستثمرين — أضف أول مستثمر وابدأ متابعة حصصه', '🤝')
      ]));
    }

    render();
  };
})();
