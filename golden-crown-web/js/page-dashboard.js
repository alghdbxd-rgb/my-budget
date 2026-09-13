/* =============================================================
   لوحة الإدارة (المشرف العام) — FR-29 .. FR-32 + إدارة القواعد
   ============================================================= */
(function () {
  'use strict';
  var S = window.GC.store, U = window.GC.ui, E = window.GC.engine;
  var view = U.$('#view');
  var range = 30; /* نطاق التحليل بالأيام */

  function db() { return S.load(); }
  function go(h) { location.hash = h; }

  var NAV = [
    { group: 'المتابعة', items: [
      { key: 'overview', icon: '📊', label: 'نظرة عامة' },
      { key: 'consultations', icon: '🗂️', label: 'الاستشارات' },
      { key: 'quality', icon: '⭐', label: 'الجودة وزمن الاستجابة' }
    ]},
    { group: 'الإدارة', items: [
      { key: 'doctors', icon: '🩺', label: 'الأطباء' },
      { key: 'supervisors', icon: '🛡️', label: 'المشرفون' },
      { key: 'clinics', icon: '🏥', label: 'العيادات الشريكة' },
      { key: 'finance', icon: '💰', label: 'المالية والأكواد' }
    ]},
    { group: 'النمو', items: [
      { key: 'growth', icon: '📣', label: 'القنوات وقائمة الانتظار' }
    ]},
    { group: 'الضبط', items: [
      { key: 'content', icon: '📝', label: 'المحتوى والتنبيه' },
      { key: 'settings', icon: '⚙️', label: 'قواعد العمل' },
      { key: 'decisions', icon: '❗', label: 'القرارات المفتوحة' },
      { key: 'audit', icon: '🧾', label: 'سجل التدقيق' }
    ]}
  ];

  function paintNav(active) {
    var host = U.$('#side-nav');
    U.clear(host);
    var wrap = U.el('div', { class: 'side__links-wrap' });
    NAV.forEach(function (g) {
      var box = U.el('div', { class: 'side__group' }, [U.el('div', { class: 'side__group-title', text: g.group })]);
      g.items.forEach(function (it) {
        box.appendChild(U.el('a', {
          class: 'side__link' + (it.key === active ? ' is-active' : ''),
          href: '#/' + it.key
        }, [U.el('span', { class: 'ico', text: it.icon }), U.el('span', { text: it.label })]));
      });
      wrap.appendChild(box);
    });
    host.appendChild(wrap);
  }

  function head(title, sub, actions) {
    return U.el('div', { class: 'page-head' }, [
      U.el('div', {}, [U.el('h1', { text: title }), sub ? U.el('p', { text: sub }) : null]),
      actions ? U.el('div', { class: 'row', style: 'gap:8px' }, actions) : null
    ]);
  }

  function card(title, sub, content, actions) {
    var c = U.el('div', { class: 'card' });
    if (title) {
      c.appendChild(U.el('div', { class: 'card__head' }, [
        U.el('div', {}, [U.el('h3', { class: 'card__title', text: title }), sub ? U.el('p', { class: 'card__sub', text: sub }) : null]),
        actions ? U.el('div', { class: 'row', style: 'gap:6px' }, actions) : null
      ]));
    }
    c.appendChild(content);
    return c;
  }

  function rangePicker(onChange) {
    var opts = [{ v: 7, t: '٧ أيام' }, { v: 30, t: '٣٠ يوماً' }, { v: 90, t: '٩٠ يوماً' }];
    var seg = U.el('div', { class: 'seg' });
    opts.forEach(function (o) {
      seg.appendChild(U.el('button', {
        class: range === o.v ? 'is-active' : '', text: o.t,
        onclick: function () { range = o.v; onChange(); }
      }));
    });
    return seg;
  }

  function csv(filename, rows) {
    var content = '﻿' + rows.map(function (r) {
      return r.map(function (cell) {
        var s = String(cell == null ? '' : cell).replace(/"/g, '""');
        return '"' + s + '"';
      }).join(',');
    }).join('\n');
    var blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    U.toast('تم تصدير الملف', 'ok');
  }

  /* ================= نظرة عامة ================= */

  function renderOverview() {
    var d = db();
    var m = E.metrics(d, range);
    var ts = E.timeseries(d, range);
    var nodes = [];

    nodes.push(head('نظرة عامة', 'المؤشرات خلال آخر ' + U.num(range) + ' يوماً — البيانات محلية وتجريبية.', [
      rangePicker(renderOverview),
      U.el('button', {
        class: 'btn btn--sm btn--ghost', text: '⬇️ تصدير الملخص',
        onclick: function () {
          csv('golden-crown-summary.csv', [
            ['المؤشر', 'القيمة'],
            ['المستخدمون (الإجمالي)', m.patients.total],
            ['مستخدمون جدد (الفترة)', m.patients.period],
            ['استشارات الفترة', m.consultations.period],
            ['مدفوعة/مؤكدة', m.paid],
            ['مُجاب عليها', m.answered],
            ['نسبة التحويل %', m.conversion],
            ['إيراد الفترة', m.revenue],
            ['حصة المنصة', m.platformShare],
            ['حصة الأطباء', m.doctorShare],
            ['متوسط زمن الاستجابة (ساعة)', m.avgResponse],
            ['تجاوزات زمن الرد', m.slaBreaches],
            ['نسبة صرف الأكواد %', m.redemption]
          ]);
        }
      })
    ]));

    if (m.overdue) {
      nodes.push(U.el('div', { class: 'alert alert--warn', text: '⚠️ ' + U.num(m.overdue) + ' حالة تجاوزت زمن الرد الملزم — راجع قائمة المشرفين لإعادة التوجيه.' }));
    }

    nodes.push(U.el('div', { class: 'grid grid--kpi' }, [
      U.stat({ label: 'المستخدمون المسجّلون', value: U.num(m.patients.total), delta: m.patients.delta, hint: '+' + U.num(m.patients.period) + ' خلال الفترة' }),
      U.stat({ label: 'الاستشارات', value: U.num(m.consultations.period), delta: m.consultations.delta, hint: 'الإجمالي ' + U.num(m.consultations.total) }),
      U.stat({ label: 'نسبة التحويل إلى استشارة مؤكدة', value: U.pct(m.conversion), hint: U.num(m.paid) + ' من ' + U.num(m.consultations.period) }),
      U.stat({ label: 'إيراد الفترة', value: U.money(m.revenue, d.settings.currency), hint: 'حصة المنصة ' + U.money(m.platformShare, d.settings.currency), accent: 'gold' }),
      U.stat({ label: 'متوسط زمن الاستجابة', value: U.hours(m.avgResponse), hint: 'الزمن الملزم ' + U.num(d.settings.slaHours) + ' ساعة' }),
      U.stat({ label: 'حالات مفتوحة الآن', value: U.num(m.open), hint: U.num(m.overdue) + ' منها متأخرة', accent: m.overdue ? 'danger' : null }),
      U.stat({ label: 'حالات طارئة (الفترة)', value: U.num(m.urgent), hint: 'تُصعَّد تلقائياً للمشرفين' }),
      U.stat({ label: 'المقاعد المجانية المتبقية', value: U.num(m.freeLeft), hint: 'من أصل ' + U.num(d.settings.freeTotalCap) })
    ]));

    /* السلسلة الزمنية */
    var chartHost = U.el('div', {});
    nodes.push(card('حركة الاستشارات يومياً', 'من اليمين (الأقدم) إلى اليسار (الأحدث)', chartHost));
    setTimeout(function () {
      U.lineChart(chartHost, {
        height: 240,
        series: [
          {
            name: 'استشارات واردة', color: U.colors.s1, area: true,
            points: ts.map(function (b) { return { y: b.consultations, label: U.shortDate(b.date), fullLabel: U.date(b.date) }; })
          },
          {
            name: 'ردود الأطباء', color: U.colors.s3,
            points: ts.map(function (b) { return { y: b.answered, label: U.shortDate(b.date), fullLabel: U.date(b.date) }; })
          }
        ]
      });
    }, 0);

    /* الإيراد */
    var revHost = U.el('div', {});
    nodes.push(card('الإيراد اليومي', 'يُحتسب عند تأكيد الدفع', revHost));
    setTimeout(function () {
      U.barChart(revHost, {
        height: 200,
        color: U.colors.s2,
        yFormat: function (v) { return U.num(v / 1000) + 'k'; },
        data: ts.map(function (b) { return { label: U.shortDate(b.date), fullLabel: U.date(b.date), value: b.revenue }; })
      });
    }, 0);

    /* القمع + التوزيع الجغرافي */
    var funnelHost = U.el('div', {});
    var geoHost = U.el('div', {});
    nodes.push(U.el('div', { class: 'grid grid--2' }, [
      card('قمع التحويل', 'من زيارة الموقع إلى صرف الكود في العيادة', funnelHost),
      card('التوزيع الجغرافي', 'عدد الاستشارات حسب المحافظة', geoHost)
    ]));
    setTimeout(function () {
      U.funnelChart(funnelHost, E.funnel(db(), range));
      U.hbarChart(geoHost, { data: E.byGovernorate(db(), range).slice(0, 8), sequential: true });
    }, 0);

    /* الشكاوى + القنوات */
    var donutHost = U.el('div', {});
    var chanHost = U.el('div', {});
    nodes.push(U.el('div', { class: 'grid grid--2' }, [
      card('الشكاوى الرئيسية', 'توزيع الحالات حسب نوع الشكوى', donutHost),
      card('قنوات الإحالة', 'الزيارات ونسبة تحويلها إلى استشارات', chanHost)
    ]));
    setTimeout(function () {
      U.donutChart(donutHost, { data: E.byComplaint(db(), range).map(function (c) { return { name: c.icon + ' ' + c.name, value: c.value }; }), centerLabel: 'حالة' });
      var chans = E.byChannel(db(), range);
      U.mount(chanHost, U.table(
        [
          { title: 'القناة', key: 'name' },
          { title: 'زيارات', render: function (r) { return U.num(r.visits); } },
          { title: 'استشارات', render: function (r) { return U.num(r.consultations); } },
          { title: 'التحويل', render: function (r) { return U.num(r.conversion) + '%'; } },
          { title: 'هدف التغطية', render: function (r) { return r.target ? U.pct(r.target) : '—'; } }
        ],
        chans
      ));
    }, 0);

    U.mount(view, U.el('div', { class: 'stack' }, nodes));
  }

  /* ================= الاستشارات ================= */

  var csFilters = { q: '', status: '', urgent: '', region: '', doctor: '' };

  function renderConsultations() {
    var d = db();
    var nodes = [head('الاستشارات', 'كل الحالات مع إمكانية البحث والفلترة وإعادة التوجيه.')];

    var search = U.el('input', { type: 'search', placeholder: 'بحث برقم الحالة أو الكود أو الهاتف', value: csFilters.q });
    var status = U.el('select', {}, [U.el('option', { value: '', text: 'كل الحالات' })].concat(
      Object.keys(E.STATUS).map(function (k) { return U.el('option', { value: k, text: E.STATUS[k].label }); })
    ));
    status.value = csFilters.status;
    var urgent = U.el('select', {}, [
      U.el('option', { value: '', text: 'الطوارئ: الكل' }),
      U.el('option', { value: '1', text: 'الطارئة فقط' }),
      U.el('option', { value: '0', text: 'غير الطارئة' })
    ]);
    urgent.value = csFilters.urgent;
    var region = U.el('select', {}, [U.el('option', { value: '', text: 'كل المحافظات' })].concat(
      S.GOVERNORATES.map(function (g) { return U.el('option', { value: g.id, text: g.name }); })
    ));
    region.value = csFilters.region;
    var doctor = U.el('select', {}, [U.el('option', { value: '', text: 'كل الأطباء' })].concat(
      d.doctors.map(function (x) { return U.el('option', { value: x.id, text: x.name }); })
    ));
    doctor.value = csFilters.doctor;

    [search, status, urgent, region, doctor].forEach(function (ctrl) {
      ctrl.addEventListener('input', function () {
        csFilters = { q: search.value.trim(), status: status.value, urgent: urgent.value, region: region.value, doctor: doctor.value };
        paint();
      });
    });

    var tableHost = U.el('div', {});
    nodes.push(U.el('div', { class: 'toolbar' }, [search, status, urgent, region, doctor,
      U.el('button', { class: 'btn btn--sm btn--ghost', text: '⬇️ تصدير CSV', onclick: function () { exportRows(); } })
    ]));
    nodes.push(tableHost);
    U.mount(view, U.el('div', { class: 'stack' }, nodes));

    function filtered() {
      var dd = db();
      return dd.consultations.filter(function (c) {
        var p = E.patientById(dd, c.patientId);
        if (csFilters.status && c.status !== csFilters.status) return false;
        if (csFilters.urgent === '1' && !c.urgent) return false;
        if (csFilters.urgent === '0' && c.urgent) return false;
        if (csFilters.region && (c.answers.step1 || {}).region !== csFilters.region) return false;
        if (csFilters.doctor && c.doctorId !== csFilters.doctor) return false;
        if (csFilters.q) {
          var q = csFilters.q.toLowerCase();
          var hay = [c.id, c.code || '', p ? p.phone : '', p ? p.name : ''].join(' ').toLowerCase();
          if (hay.indexOf(q) === -1) return false;
        }
        return true;
      });
    }

    function exportRows() {
      var rows = [['رقم الحالة', 'التاريخ', 'المريض', 'المحافظة', 'الشكوى', 'الطبيب', 'الحالة', 'طارئة', 'الدفع', 'المبلغ', 'زمن الرد (ساعة)', 'الكود']];
      filtered().forEach(function (c) {
        var dd = db();
        var p = E.patientById(dd, c.patientId);
        var doc = E.doctorById(dd, c.doctorId);
        var g = E.govById((c.answers.step1 || {}).region);
        var cm = S.COMPLAINTS.filter(function (x) { return x.id === c.complaintId; })[0];
        rows.push([c.id, U.date(c.createdAt), p ? p.name || p.phone : '—', g ? g.name : '—',
          cm ? cm.label : '—', doc ? doc.name : '—', E.statusLabel(c.status), c.urgent ? 'نعم' : 'لا',
          c.paymentStatus, c.amount || 0, c.responseHours != null ? c.responseHours : '', c.code || '']);
      });
      csv('golden-crown-consultations.csv', rows);
    }

    function paint() {
      var dd = db();
      var rows = filtered().slice(0, 200);
      U.mount(tableHost, U.el('div', { class: 'stack' }, [
        U.el('p', { class: 'small muted', text: 'ظهرت ' + U.num(rows.length) + ' من ' + U.num(filtered().length) + ' حالة.' }),
        rows.length ? U.table([
          { title: 'الحالة', render: function (c) {
              return U.el('button', { class: 'btn btn--sm btn--ghost', text: c.id, onclick: function () { caseModal(c.id); } });
            } },
          { title: 'التاريخ', render: function (c) { return U.ago(c.createdAt); } },
          { title: 'المريض', render: function (c) {
              var p = E.patientById(dd, c.patientId);
              return p ? (p.name || p.phone) : '—';
            } },
          { title: 'المحافظة', render: function (c) {
              var g = E.govById((c.answers.step1 || {}).region);
              return g ? g.name : '—';
            } },
          { title: 'الشكوى', render: function (c) {
              var cm = S.COMPLAINTS.filter(function (x) { return x.id === c.complaintId; })[0];
              return cm ? cm.icon + ' ' + cm.label : '—';
            } },
          { title: 'الطبيب', render: function (c) {
              var doc = E.doctorById(dd, c.doctorId);
              return doc ? doc.name : '— غير مسند';
            } },
          { title: 'الحالة', render: function (c) {
              var box = U.el('div', { class: 'row', style: 'gap:4px' }, [U.badge(E.statusLabel(c.status), E.statusTone(c.status))]);
              if (c.urgent) box.appendChild(U.badge('طارئة', 'danger'));
              if (E.isOverdue(dd, c)) box.appendChild(U.badge('متأخرة', 'warn'));
              return box;
            } },
          { title: 'زمن الرد', render: function (c) { return U.hours(c.responseHours); } },
          { title: 'المبلغ', render: function (c) { return c.amount ? U.num(c.amount) : 'مجاني'; } }
        ], rows) : U.empty('لا توجد حالات مطابقة للفلاتر.', '🔍')
      ]));
    }
    paint();
  }

  function caseModal(id) {
    var d = db();
    var c = E.consultationById(d, id);
    if (!c) return;
    var p = E.patientById(d, c.patientId);
    var doc = E.doctorById(d, c.doctorId);
    var a1 = c.answers.step1 || {}, a3 = c.answers.step3 || {};
    var cm = S.COMPLAINTS.filter(function (x) { return x.id === c.complaintId; })[0];
    var g = E.govById(a1.region);

    function row(k, v) {
      return U.el('div', { class: 'report__row' }, [U.el('b', { text: k }), U.el('span', { text: v })]);
    }

    var body = U.el('div', { class: 'stack' }, [
      U.el('div', { class: 'row', style: 'gap:6px' }, [
        U.badge(E.statusLabel(c.status), E.statusTone(c.status)),
        c.urgent ? U.badge('طارئة', 'danger') : null,
        U.badge(c.paymentStatus === 'paid' ? (c.amount ? 'مدفوعة' : 'مجانية') : 'غير مدفوعة', c.paymentStatus === 'paid' ? 'ok' : 'muted')
      ]),
      row('المريض', p ? (p.name || '—') + ' · ' + p.phone : '—'),
      row('المحافظة', g ? g.name : '—'),
      row('الشكوى', cm ? cm.label : '—'),
      row('السن', (c.answers.step2 || {}).tooth || 'غير محدد'),
      row('شدة الألم', U.num(a3.painLevel) + '/١٠ · ' + (a3.duration || '—')),
      row('تورّم/حرارة', (a3.swelling ? 'تورّم' : 'بلا تورّم') + ' · ' + (a3.fever ? 'حرارة' : 'بلا حرارة')),
      row('الطبيب', doc ? doc.name + ' — ' + doc.specialty : 'غير مسند'),
      row('زمن الرد', U.hours(c.responseHours)),
      row('الكود', c.code || '—'),
      c.opinion ? U.el('div', {}, [U.el('h4', { text: 'الرأي الاستشاري' }), U.el('div', { class: 'report__opinion', text: c.opinion })]) : null
    ]);

    var m = U.modal({
      title: 'الحالة ' + c.id,
      body: body,
      actions: [U.el('button', { class: 'btn btn--ghost', text: 'إغلاق', onclick: function () { m.close(); } })]
    });
  }

  /* ================= الجودة ================= */

  function renderQuality() {
    var d = db();
    var rows = E.doctorQuality(d, range).filter(function (r) { return r.cases > 0; });
    var m = E.metrics(d, range);
    var chartHost = U.el('div', {});

    var nodes = [
      head('الجودة وزمن الاستجابة', 'مؤشرات كل طبيب خلال آخر ' + U.num(range) + ' يوماً (FR-18).', [rangePicker(renderQuality)]),
      U.el('div', { class: 'grid grid--kpi' }, [
        U.stat({ label: 'متوسط زمن الاستجابة', value: U.hours(m.avgResponse) }),
        U.stat({ label: 'تجاوزات الزمن الملزم', value: U.num(m.slaBreaches), accent: m.slaBreaches ? 'danger' : null }),
        U.stat({ label: 'حالات مفتوحة', value: U.num(m.open) }),
        U.stat({ label: 'شكاوى مفتوحة', value: U.num(d.complaints.filter(function (c) { return c.status === 'open'; }).length) })
      ]),
      card('متوسط زمن الرد لكل طبيب (ساعة)', 'كلما قلّ كان أفضل', chartHost),
      card('تفصيل الأداء', null, U.table([
        { title: 'الطبيب', render: function (r) { return r.doctor.name; } },
        { title: 'التخصص', render: function (r) { return r.doctor.specialty; } },
        { title: 'حالات', render: function (r) { return U.num(r.cases); } },
        { title: 'مُجاب عليها', render: function (r) { return U.num(r.answered); } },
        { title: 'مفتوحة', render: function (r) { return U.num(r.open); } },
        { title: 'متوسط الرد', render: function (r) { return U.hours(r.avgResponse); } },
        { title: 'تجاوزات', render: function (r) {
            return r.breaches ? U.badge(U.num(r.breaches), 'danger') : U.badge('٠', 'ok');
          } },
        { title: 'تقييم المراجعين', render: function (r) { return r.avgRating ? '★ ' + r.avgRating : '—'; } }
      ], rows))
    ];

    U.mount(view, U.el('div', { class: 'stack' }, nodes));
    setTimeout(function () {
      U.hbarChart(chartHost, {
        color: U.colors.s2,
        format: function (v) { return U.num(v) + ' س'; },
        data: rows.filter(function (r) { return r.avgResponse != null; })
          .map(function (r) { return { label: r.doctor.name, value: r.avgResponse }; })
      });
    }, 0);
  }

  /* ================= الأطباء (FR-2 / FR-31) ================= */

  function renderDoctors() {
    var d = db();
    var quality = {};
    E.doctorQuality(d, 90).forEach(function (r) { quality[r.doctor.id] = r; });

    var pending = d.doctors.filter(function (x) { return x.status === 'pending'; });

    var nodes = [
      head('الأطباء', 'حسابات الأطباء يُنشئها ويفعّلها المشرف العام — لا تسجيل ذاتي (FR-2).', [
        U.el('button', { class: 'btn btn--gold btn--sm', text: '➕ إنشاء حساب طبيب', onclick: function () { doctorForm(null); } })
      ])
    ];

    if (pending.length) {
      nodes.push(U.el('div', { class: 'alert alert--warn', text: '⏳ ' + U.num(pending.length) + ' طلب انضمام بانتظار التحقق من الإجازة والتفعيل.' }));
    }

    nodes.push(card('قائمة الأطباء', null, U.table([
      { title: 'الطبيب', render: function (x) {
          return U.el('div', {}, [
            U.el('div', { class: 'list-item__title', text: x.name }),
            U.el('div', { class: 'list-item__meta', text: x.phone || '—' })
          ]);
        } },
      { title: 'التخصص', key: 'specialty' },
      { title: 'العيادة', render: function (x) {
          var c = E.clinicById(db(), x.clinicId);
          return c ? c.name : '—';
        } },
      { title: 'المشرف', render: function (x) {
          var s = db().supervisors.filter(function (v) { return v.id === x.supervisorId; })[0];
          return s ? s.name : '— غير مرتبط';
        } },
      { title: 'الإجازة', render: function (x) {
          return x.licenseVerified ? U.badge('موثّقة', 'ok') : U.badge('غير موثّقة', 'warn');
        } },
      { title: 'الحالة', render: function (x) {
          return U.badge(
            x.status === 'active' ? 'مفعّل' : x.status === 'pending' ? 'بانتظار التفعيل' : 'موقوف',
            x.status === 'active' ? 'ok' : x.status === 'pending' ? 'warn' : 'muted'
          );
        } },
      { title: 'حالات (٩٠ يوم)', render: function (x) { return U.num((quality[x.id] || {}).cases || 0); } },
      { title: 'إجراءات', render: function (x) {
          var box = U.el('div', { class: 'row', style: 'gap:6px' });
          box.appendChild(U.el('button', { class: 'btn btn--sm btn--ghost', text: 'تعديل', onclick: function () { doctorForm(x.id); } }));
          if (x.status !== 'active') {
            box.appendChild(U.el('button', {
              class: 'btn btn--sm btn--ok', text: 'تفعيل',
              onclick: function () { setDoctorStatus(x.id, 'active'); }
            }));
          } else {
            box.appendChild(U.el('button', {
              class: 'btn btn--sm btn--danger', text: 'إيقاف',
              onclick: function () {
                U.confirmDialog('إيقاف حساب ' + x.name + '؟ لن تُسند إليه حالات جديدة.', function () { setDoctorStatus(x.id, 'disabled'); }, 'إيقاف');
              }
            }));
          }
          return box;
        } }
    ], d.doctors)));

    U.mount(view, U.el('div', { class: 'stack' }, nodes));
  }

  function setDoctorStatus(id, status) {
    S.update(function (d) {
      var x = E.doctorById(d, id);
      if (!x) return;
      x.status = status;
      S.log(d, {
        who: 'د. خالد', role: 'super_admin',
        what: (status === 'active' ? 'تفعيل' : 'إيقاف') + ' حساب الطبيب ' + x.name
      });
    });
    U.toast(status === 'active' ? 'تم تفعيل الحساب' : 'تم إيقاف الحساب', 'ok');
    renderDoctors();
  }

  function doctorForm(id) {
    var d = db();
    var x = id ? E.doctorById(d, id) : null;
    var f = {};
    function field(label, node, hint) {
      return U.el('label', { class: 'field' }, [
        U.el('span', { class: 'field__label', text: label }), node,
        hint ? U.el('span', { class: 'field__hint', text: hint }) : null
      ]);
    }
    f.name = U.el('input', { type: 'text', value: x ? x.name : '' });
    f.phone = U.el('input', { type: 'tel', value: x ? x.phone || '' : '' });
    f.specialty = U.el('select', {}, S.SPECIALTIES.map(function (s) { return U.el('option', { value: s, text: s }); }));
    if (x) f.specialty.value = x.specialty;
    f.clinic = U.el('select', {}, [U.el('option', { value: '', text: '— بلا عيادة —' })].concat(
      d.clinics.map(function (c) { return U.el('option', { value: c.id, text: c.name }); })
    ));
    if (x) f.clinic.value = x.clinicId || '';
    f.supervisor = U.el('select', {}, [U.el('option', { value: '', text: '— بلا مشرف —' })].concat(
      d.supervisors.map(function (s) { return U.el('option', { value: s.id, text: s.name + ' (' + s.scope + ')' }); })
    ));
    if (x) f.supervisor.value = x.supervisorId || '';
    f.license = U.el('input', { type: 'text', value: x ? x.licenseNo || '' : '' });
    f.verified = U.el('input', { type: 'checkbox' });
    f.verified.checked = x ? !!x.licenseVerified : false;
    f.share = U.el('input', { type: 'number', min: '0', max: '100', value: x ? x.sharePercent : d.settings.doctorSharePercent });
    f.bio = U.el('textarea', {});
    f.bio.value = x ? x.bio || '' : '';

    var body = U.el('div', { class: 'stack' }, [
      field('الاسم', f.name),
      field('رقم الهاتف', f.phone),
      field('التخصص', f.specialty),
      field('العيادة', f.clinic),
      field('المشرف المسؤول', f.supervisor, 'نطاق كل مشرف يغطي مجموعة محددة من الأطباء والحالات (FR-3).'),
      field('رقم إجازة مزاولة المهنة', f.license),
      U.el('label', { class: 'check' }, [f.verified, U.el('span', { text: 'تم التحقق من الإجازة لدى النقابة/وزارة الصحة' })]),
      field('نسبة الطبيب من الإيراد %', f.share, 'بند مفتوح: نموذج أجور الأطباء غير محسوم في العرض (D3).'),
      field('نبذة', f.bio)
    ]);

    var m = U.modal({
      title: x ? 'تعديل حساب: ' + x.name : 'إنشاء حساب طبيب',
      body: body,
      actions: [
        U.el('button', { class: 'btn btn--ghost', text: 'إلغاء', onclick: function () { m.close(); } }),
        U.el('button', {
          class: 'btn btn--gold', text: 'حفظ',
          onclick: function () {
            if (!f.name.value.trim()) { U.toast('الاسم مطلوب', 'error'); return; }
            S.update(function (dd) {
              var target = x ? E.doctorById(dd, x.id) : null;
              if (!target) {
                target = {
                  id: S.uid('DR-'), status: 'active', rating: 0, reviewsCount: 0,
                  hours: [], credentials: [], photo: null, payoutModel: 'share', createdAt: Date.now()
                };
                dd.doctors.push(target);
              }
              target.name = f.name.value.trim();
              target.phone = U.normalizeDigits(f.phone.value).trim();
              target.specialty = f.specialty.value;
              target.clinicId = f.clinic.value || null;
              target.supervisorId = f.supervisor.value || null;
              target.licenseNo = f.license.value.trim();
              target.licenseVerified = f.verified.checked;
              target.sharePercent = Number(U.normalizeDigits(f.share.value)) || dd.settings.doctorSharePercent;
              target.bio = f.bio.value.trim();
              var clinic = E.clinicById(dd, target.clinicId);
              if (clinic) target.region = clinic.region;
              S.log(dd, { who: 'د. خالد', role: 'super_admin', what: (x ? 'تعديل' : 'إنشاء') + ' حساب الطبيب ' + target.name });
            });
            m.close();
            U.toast('تم الحفظ', 'ok');
            renderDoctors();
          }
        })
      ]
    });
  }

  /* ================= المشرفون (FR-3) ================= */

  function renderSupervisors() {
    var d = db();
    var nodes = [
      head('المشرفون', 'فريق جودة المتابعة الطبية — لكل مشرف نطاق من الأطباء والحالات.', [
        U.el('button', { class: 'btn btn--gold btn--sm', text: '➕ إضافة مشرف', onclick: function () { supervisorForm(null); } })
      ]),
      card('هرمية الصلاحيات', 'المستويات الأربعة كما في وثيقة المتطلبات', U.table([
        { title: 'المستوى', key: 'level' },
        { title: 'الجهة', key: 'who' },
        { title: 'الصلاحيات', key: 'perms' }
      ], [
        { level: 'مشرف عام (Super Admin)', who: 'د. خالد والأستاذ عبد اللطيف', perms: 'لوحة تحكم كاملة، تفعيل الحسابات، الإحصائيات، الحركات المالية، سجل التدقيق' },
        { level: 'مشرفون (Supervisors)', who: 'فريق جودة المتابعة الطبية', perms: 'متابعة جودة الاستشارات، تسريع الطوارئ، إعادة التوجيه ضمن نطاقهم' },
        { level: 'أطباء (Doctors)', who: 'نخبة أطباء الأسنان', perms: 'بروفايل، تقويم، حالاتهم المسندة فقط' },
        { level: 'مراجعون (Users)', who: 'الجمهور والمرضى', perms: 'رفع الشكوى والصور ومتابعة حالتهم وتقاريرهم' }
      ]))
    ];

    nodes.push(card('قائمة المشرفين', null, U.table([
      { title: 'المشرف', key: 'name' },
      { title: 'الهاتف', key: 'phone' },
      { title: 'النطاق', key: 'scope' },
      { title: 'الأطباء ضمن نطاقه', render: function (s) {
          return U.num(db().doctors.filter(function (x) { return x.supervisorId === s.id; }).length);
        } },
      { title: 'حالات مفتوحة', render: function (s) {
          return U.num(db().consultations.filter(function (c) {
            return c.supervisorId === s.id && (c.status === 'new' || c.status === 'in_review');
          }).length);
        } },
      { title: 'الحالة', render: function (s) {
          return U.badge(s.status === 'active' ? 'مفعّل' : 'موقوف', s.status === 'active' ? 'ok' : 'muted');
        } },
      { title: 'إجراءات', render: function (s) {
          return U.el('div', { class: 'row', style: 'gap:6px' }, [
            U.el('button', { class: 'btn btn--sm btn--ghost', text: 'تعديل', onclick: function () { supervisorForm(s.id); } }),
            U.el('button', {
              class: 'btn btn--sm ' + (s.status === 'active' ? 'btn--danger' : 'btn--ok'),
              text: s.status === 'active' ? 'إيقاف' : 'تفعيل',
              onclick: function () {
                S.update(function (dd) {
                  var t = dd.supervisors.filter(function (v) { return v.id === s.id; })[0];
                  if (t) t.status = t.status === 'active' ? 'disabled' : 'active';
                  S.log(dd, { who: 'د. خالد', role: 'super_admin', what: 'تغيير حالة حساب المشرف ' + s.name });
                });
                renderSupervisors();
              }
            })
          ]);
        } }
    ], d.supervisors)));

    U.mount(view, U.el('div', { class: 'stack' }, nodes));
  }

  function supervisorForm(id) {
    var d = db();
    var s = id ? d.supervisors.filter(function (x) { return x.id === id; })[0] : null;
    var name = U.el('input', { type: 'text', value: s ? s.name : '' });
    var phone = U.el('input', { type: 'tel', value: s ? s.phone : '' });
    var scope = U.el('input', { type: 'text', value: s ? s.scope : '', placeholder: 'مثال: الوسط والجنوب' });
    var m = U.modal({
      title: s ? 'تعديل مشرف' : 'إضافة مشرف',
      body: U.el('div', { class: 'stack' }, [
        U.el('label', { class: 'field' }, [U.el('span', { class: 'field__label', text: 'الاسم' }), name]),
        U.el('label', { class: 'field' }, [U.el('span', { class: 'field__label', text: 'الهاتف' }), phone]),
        U.el('label', { class: 'field' }, [U.el('span', { class: 'field__label', text: 'نطاق الإشراف' }), scope])
      ]),
      actions: [
        U.el('button', { class: 'btn btn--ghost', text: 'إلغاء', onclick: function () { m.close(); } }),
        U.el('button', {
          class: 'btn btn--gold', text: 'حفظ',
          onclick: function () {
            if (!name.value.trim()) { U.toast('الاسم مطلوب', 'error'); return; }
            S.update(function (dd) {
              var t = s ? dd.supervisors.filter(function (x) { return x.id === s.id; })[0] : null;
              if (!t) {
                t = { id: S.uid('SV-'), status: 'active', createdAt: Date.now() };
                dd.supervisors.push(t);
              }
              t.name = name.value.trim();
              t.phone = U.normalizeDigits(phone.value).trim();
              t.scope = scope.value.trim();
              S.log(dd, { who: 'د. خالد', role: 'super_admin', what: (s ? 'تعديل' : 'إنشاء') + ' حساب مشرف: ' + t.name });
            });
            m.close();
            renderSupervisors();
          }
        })
      ]
    });
  }

  /* ================= العيادات ================= */

  function renderClinics() {
    var d = db();
    var rows = d.clinics.map(function (c) {
      var codes = d.codes.filter(function (k) { return k.clinicId === c.id; });
      var discount = d.transactions.filter(function (t) { return t.clinicId === c.id; })
        .reduce(function (a, t) { return a + (t.clinicDiscount || 0); }, 0);
      return {
        clinic: c,
        doctors: d.doctors.filter(function (x) { return x.clinicId === c.id; }).length,
        redeemed: codes.length,
        discount: discount
      };
    });

    U.mount(view, U.el('div', { class: 'stack' }, [
      head('العيادات الشريكة', 'نموذج التعاقد والتسوية المالية بند مفتوح في الوثيقة (D4 / FR-27).'),
      U.el('div', { class: 'alert alert--warn', text: 'تنبيه: لا يمكن إطلاق آلية الخصم (FR-25) قبل حسم من يتحمّل قيمة الخصم وكيف تُسوّى مع العيادة.' }),
      card('القائمة', null, U.table([
        { title: 'العيادة', render: function (r) { return r.clinic.name; } },
        { title: 'المحافظة', render: function (r) { var g = E.govById(r.clinic.region); return g ? g.name : '—'; } },
        { title: 'العنوان', render: function (r) { return r.clinic.address; } },
        { title: 'شريكة', render: function (r) { return r.clinic.partner ? U.badge('نعم', 'ok') : U.badge('لا', 'muted'); } },
        { title: 'أطباء', render: function (r) { return U.num(r.doctors); } },
        { title: 'أكواد مصروفة', render: function (r) { return U.num(r.redeemed); } },
        { title: 'قيمة الخصومات', render: function (r) { return U.money(r.discount, db().settings.currency); } }
      ], rows))
    ]));
  }

  /* ================= المالية (FR-30 / FR-26) ================= */

  function renderFinance() {
    var d = db();
    var m = E.metrics(d, range);
    var txs = d.transactions.filter(function (t) { return Date.now() - t.date <= range * S.DAY; });
    var redeemHost = U.el('div', {});

    var codeInput = U.el('input', { type: 'text', placeholder: 'GC-XXXXXX', style: 'text-transform:uppercase' });
    var clinicSel = U.el('select', {}, d.clinics.filter(function (c) { return c.partner; })
      .map(function (c) { return U.el('option', { value: c.id, text: c.name }); }));

    U.mount(redeemHost, U.el('div', { class: 'stack' }, [
      U.el('div', { class: 'row', style: 'gap:8px' }, [codeInput, clinicSel,
        U.el('button', {
          class: 'btn btn--sm', text: 'تحقق وصرف',
          onclick: function () { redeem(codeInput.value, clinicSel.value); }
        })
      ]),
      U.el('p', { class: 'small muted', text: 'الرمز يُستخدم مرة واحدة فقط ويُعلَّم كمُستخدَم فور الصرف (FR-26).' })
    ]));

    var nodes = [
      head('المالية والأكواد', 'الحركات وتوزيع الإيراد وصرف أكواد الخصم.', [
        rangePicker(renderFinance),
        U.el('button', {
          class: 'btn btn--sm btn--ghost', text: '⬇️ تصدير الحركات',
          onclick: function () {
            var rows = [['رقم الحركة', 'التاريخ', 'الحالة', 'الطبيب', 'العيادة', 'المبلغ', 'حصة الطبيب', 'حصة المنصة', 'الخصم', 'مسوّاة']];
            txs.forEach(function (t) {
              var doc = E.doctorById(db(), t.doctorId);
              var cl = E.clinicById(db(), t.clinicId);
              rows.push([t.id, U.date(t.date), t.consultationId, doc ? doc.name : '—', cl ? cl.name : '—',
                t.amount, t.doctorShare, t.platformShare, t.clinicDiscount || 0, t.settled ? 'نعم' : 'لا']);
            });
            csv('golden-crown-transactions.csv', rows);
          }
        })
      ]),
      U.el('div', { class: 'grid grid--kpi' }, [
        U.stat({ label: 'إجمالي الإيراد', value: U.money(m.revenue, d.settings.currency), accent: 'gold' }),
        U.stat({ label: 'حصة المنصة', value: U.money(m.platformShare, d.settings.currency), hint: U.num(100 - d.settings.doctorSharePercent) + '% من كل استشارة' }),
        U.stat({ label: 'مستحقات الأطباء', value: U.money(m.doctorShare, d.settings.currency), hint: 'غير مسوّاة: ' + U.money(m.unsettled, d.settings.currency) }),
        U.stat({ label: 'نسبة صرف الأكواد', value: U.pct(m.redemption), hint: U.num(m.redeemed) + ' كود مصروف' })
      ]),
      card('صرف كود خصم (بوابة العيادة)', 'يمكن للعيادة الشريكة استخدام صفحة مستقلة: clinic.html', redeemHost),
      card('الحركات المالية', U.num(txs.length) + ' حركة خلال الفترة', U.table([
        { title: 'الحركة', key: 'id' },
        { title: 'التاريخ', render: function (t) { return U.date(t.date); } },
        { title: 'الحالة', key: 'consultationId' },
        { title: 'الطبيب', render: function (t) { var x = E.doctorById(db(), t.doctorId); return x ? x.name : '—'; } },
        { title: 'العيادة', render: function (t) { var c = E.clinicById(db(), t.clinicId); return c ? c.name : '—'; } },
        { title: 'المبلغ', render: function (t) { return U.num(t.amount); } },
        { title: 'حصة الطبيب', render: function (t) { return U.num(t.doctorShare); } },
        { title: 'حصة المنصة', render: function (t) { return U.num(t.platformShare); } },
        { title: 'التسوية', render: function (t) {
            return t.settled
              ? U.badge('مسوّاة', 'ok')
              : U.el('button', {
                  class: 'btn btn--sm btn--ghost', text: 'تعليم كمسوّاة',
                  onclick: function () {
                    S.update(function (dd) {
                      var tx = dd.transactions.filter(function (x) { return x.id === t.id; })[0];
                      if (tx) tx.settled = true;
                      S.log(dd, { who: 'د. خالد', role: 'super_admin', what: 'تسوية الحركة ' + t.id });
                    });
                    renderFinance();
                  }
                });
          } }
      ], txs.slice(0, 120)))
    ];

    U.mount(view, U.el('div', { class: 'stack' }, nodes));
  }

  function redeem(value, clinicId) {
    var code = String(value || '').trim().toUpperCase();
    if (!code) { U.toast('أدخل الرمز', 'error'); return; }
    var outcome = null;
    S.update(function (d) {
      var row = d.codes.filter(function (c) { return c.value === code; })[0];
      if (!row) { outcome = { ok: false, msg: 'الرمز غير موجود' }; return; }
      if (row.redeemed) { outcome = { ok: false, msg: 'الرمز مستخدَم سابقاً بتاريخ ' + U.date(row.redeemedAt) }; return; }
      var cs = E.consultationById(d, row.consultationId);
      if (!cs || !(cs.status === 'answered' || cs.status === 'closed')) {
        outcome = { ok: false, msg: 'لا يمكن صرف الرمز قبل صدور التقرير' };
        return;
      }
      row.redeemed = true;
      row.redeemedAt = Date.now();
      row.clinicId = clinicId;
      row.discount = Math.round((cs.amount || 0) * (d.settings.clinicDiscountPercent / 100));
      var tx = d.transactions.filter(function (t) { return t.consultationId === cs.id; })[0];
      if (tx) {
        tx.clinicId = clinicId;
        tx.clinicDiscount = row.discount;
      }
      var cl = E.clinicById(d, clinicId);
      S.log(d, {
        who: cl ? cl.name : 'عيادة', role: 'clinic',
        what: 'صرف رمز الخصم ' + code + ' للحالة ' + cs.id, targetPatientId: cs.patientId
      });
      outcome = { ok: true, msg: 'تم الصرف — يُخصم ' + U.money(row.discount, d.settings.currency) + ' من كلفة العلاج' };
    });
    U.toast(outcome.msg, outcome.ok ? 'ok' : 'error');
    if (location.hash.indexOf('finance') !== -1) renderFinance();
    return outcome;
  }

  /* ================= النمو والقنوات (FR-36 / FR-37) ================= */

  function renderGrowth() {
    var d = db();
    var chans = E.byChannel(d, range);
    var chartHost = U.el('div', {});
    var waitlist = d.waitlist.slice(0, 60);

    var nodes = [
      head('القنوات وقائمة الانتظار', 'قياس القنوات الأربع قبل الإطلاق (FR-36) وتسجيل ما قبل الإطلاق (FR-37).', [rangePicker(renderGrowth)]),
      U.el('div', { class: 'grid grid--kpi' }, [
        U.stat({ label: 'إجمالي الزيارات', value: U.num(chans.reduce(function (a, c) { return a + c.visits; }, 0)) }),
        U.stat({ label: 'قائمة الانتظار', value: U.num(d.waitlist.length), hint: U.num(d.waitlist.filter(function (w) { return w.type === 'patient'; }).length) + ' مريضاً' }),
        U.stat({ label: 'طلبات جهات وشركاء', value: U.num(d.waitlist.filter(function (w) { return w.type !== 'patient'; }).length) }),
        U.stat({ label: 'أفضل قناة تحويلاً', value: chans.slice().sort(function (a, b) { return b.conversion - a.conversion; })[0].name })
      ]),
      card('زيارات القنوات', 'روابط الحملات: index.html?src=medical_groups', chartHost),
      card('تفصيل القنوات', null, U.table([
        { title: 'القناة', key: 'name' },
        { title: 'الزيارات', render: function (r) { return U.num(r.visits); } },
        { title: 'استشارات', render: function (r) { return U.num(r.consultations); } },
        { title: 'نسبة التحويل', render: function (r) { return U.num(r.conversion) + '%' ; } },
        { title: 'هدف التغطية في العرض', render: function (r) { return r.target ? U.pct(r.target) : '—'; } }
      ], chans)),
      card('قائمة الانتظار', U.num(d.waitlist.length) + ' مسجّل', U.table([
        { title: 'الاسم', key: 'name' },
        { title: 'الهاتف', key: 'phone' },
        { title: 'المحافظة', render: function (w) { var g = E.govById(w.region); return g ? g.name : '—'; } },
        { title: 'النوع', render: function (w) {
            var map = { patient: 'مريض', doctor: 'طبيب', lab: 'مختبر', ads: 'مكتب إعلان', clinic: 'عيادة', academy: 'أكاديمية' };
            return map[w.type] || w.type;
          } },
        { title: 'القناة', render: function (w) {
            var c = S.CHANNELS.filter(function (x) { return x.id === w.channel; })[0];
            return c ? c.name : '—';
          } },
        { title: 'التاريخ', render: function (w) { return U.date(w.createdAt); } }
      ], waitlist), [
        U.el('button', {
          class: 'btn btn--sm btn--ghost', text: '⬇️ تصدير',
          onclick: function () {
            var rows = [['الاسم', 'الهاتف', 'المحافظة', 'النوع', 'القناة', 'التاريخ']];
            db().waitlist.forEach(function (w) {
              var g = E.govById(w.region);
              rows.push([w.name, w.phone, g ? g.name : '', w.type, w.channel, U.date(w.createdAt)]);
            });
            csv('golden-crown-waitlist.csv', rows);
          }
        })
      ])
    ];

    U.mount(view, U.el('div', { class: 'stack' }, nodes));
    setTimeout(function () {
      U.hbarChart(chartHost, { data: chans.map(function (c) { return { label: c.name, value: c.visits }; }), sequential: true });
    }, 0);
  }

  /* ================= المحتوى والتنبيه (FR-20) ================= */

  function renderContent() {
    var d = db();
    var headline = U.el('input', { type: 'text', value: d.settings.homeHeadline });
    var sub = U.el('textarea', {});
    sub.value = d.settings.homeSub;
    var legal = U.el('textarea', { style: 'min-height:160px' });
    legal.value = d.settings.legalNotice;
    legal.disabled = d.settings.legalLocked;
    var source = U.el('input', { type: 'text', value: d.settings.legalSource });
    source.disabled = d.settings.legalLocked;

    var lock = U.el('input', { type: 'checkbox' });
    lock.checked = d.settings.legalLocked;
    lock.addEventListener('change', function () {
      legal.disabled = lock.checked;
      source.disabled = lock.checked;
    });

    var templates = U.el('div', { class: 'stack' });
    function paintTemplates() {
      U.clear(templates);
      db().templates.forEach(function (t) {
        templates.appendChild(U.el('div', { class: 'list-item' }, [
          U.el('div', {}, [
            U.el('div', { class: 'list-item__title', text: t.title }),
            U.el('div', { class: 'list-item__meta', text: t.body.slice(0, 110) + (t.body.length > 110 ? '…' : '') })
          ]),
          U.el('button', {
            class: 'btn btn--sm btn--ghost', text: 'حذف',
            onclick: function () {
              U.confirmDialog('حذف القالب «' + t.title + '»؟', function () {
                S.update(function (dd) {
                  dd.templates = dd.templates.filter(function (x) { return x.id !== t.id; });
                });
                paintTemplates();
              }, 'حذف');
            }
          })
        ]));
      });
    }
    paintTemplates();

    var tTitle = U.el('input', { type: 'text', placeholder: 'عنوان القالب' });
    var tBody = U.el('textarea', { placeholder: 'نص الرأي الجاهز...' });

    U.mount(view, U.el('div', { class: 'stack' }, [
      head('المحتوى والتنبيه', 'نصوص الواجهة والتنبيه الطبي والقانوني وقوالب ردود الأطباء.'),
      card('نصوص الصفحة الرئيسية', null, U.el('div', { class: 'stack' }, [
        U.el('label', { class: 'field' }, [U.el('span', { class: 'field__label', text: 'العنوان الرئيسي' }), headline]),
        U.el('label', { class: 'field' }, [U.el('span', { class: 'field__label', text: 'النص التعريفي' }), sub]),
        U.el('button', {
          class: 'btn btn--gold', text: 'حفظ النصوص',
          onclick: function () {
            S.update(function (dd) {
              dd.settings.homeHeadline = headline.value.trim();
              dd.settings.homeSub = sub.value.trim();
            });
            U.toast('تم حفظ نصوص الصفحة', 'ok');
          }
        })
      ])),
      card('التنبيه الطبي والقانوني الإلزامي', 'يظهر في كل تقرير ولا يجوز حذفه (FR-20 / NFR-16).', U.el('div', { class: 'stack' }, [
        U.el('div', { class: 'alert alert--warn', text: 'النص أدناه منقول حرفياً من وثيقة المتطلبات. أي تعديل يستوجب موافقة الجهة الطبية/القانونية المنسوب إليها.' }),
        U.el('label', { class: 'check' }, [lock, U.el('span', { text: 'قفل النص (يمنع التعديل غير المقصود)' })]),
        U.el('label', { class: 'field' }, [U.el('span', { class: 'field__label', text: 'نص التنبيه' }), legal]),
        U.el('label', { class: 'field' }, [U.el('span', { class: 'field__label', text: 'الجهة المنسوب إليها' }), source]),
        U.el('div', { class: 'row', style: 'gap:8px' }, [
          U.el('button', {
            class: 'btn btn--gold', text: 'حفظ',
            onclick: function () {
              if (!legal.value.trim()) { U.toast('لا يمكن ترك التنبيه فارغاً', 'error'); return; }
              S.update(function (dd) {
                dd.settings.legalLocked = lock.checked;
                if (!lock.checked) {
                  dd.settings.legalNotice = legal.value.trim();
                  dd.settings.legalSource = source.value.trim();
                }
                S.log(dd, { who: 'د. خالد', role: 'super_admin', what: 'تحديث إعدادات التنبيه القانوني' });
              });
              U.toast('تم الحفظ', 'ok');
            }
          }),
          U.el('button', {
            class: 'btn btn--ghost', text: 'استعادة النص الأصلي',
            onclick: function () {
              S.update(function (dd) {
                dd.settings.legalNotice = S.LEGAL_NOTICE;
                dd.settings.legalSource = S.LEGAL_SOURCE;
              });
              renderContent();
              U.toast('تمت الاستعادة', 'ok');
            }
          })
        ])
      ])),
      card('قوالب ردود الأطباء', 'تُعرض داخل شاشة كتابة الرأي لاختصار الوقت.', U.el('div', { class: 'stack' }, [
        templates,
        U.el('label', { class: 'field' }, [U.el('span', { class: 'field__label', text: 'قالب جديد' }), tTitle]),
        tBody,
        U.el('button', {
          class: 'btn btn--ghost', style: 'margin-top:8px', text: 'إضافة القالب',
          onclick: function () {
            if (!tTitle.value.trim() || !tBody.value.trim()) { U.toast('العنوان والنص مطلوبان', 'error'); return; }
            S.update(function (dd) {
              dd.templates.push({ id: S.uid('TP-'), title: tTitle.value.trim(), body: tBody.value.trim() });
            });
            tTitle.value = ''; tBody.value = '';
            paintTemplates();
            U.toast('تمت الإضافة', 'ok');
          }
        })
      ]))
    ]));
  }

  /* ================= قواعد العمل ================= */

  function renderSettings() {
    var d = db();
    var s = d.settings;
    var f = {};
    f.fee = U.el('input', { type: 'number', min: '0', step: '500', value: s.consultFee });
    f.freeMode = U.el('select', {}, [
      U.el('option', { value: 'total_cap', text: 'سقف إجمالي — أول ٢٠٠٠ مستخدم مجاناً' }),
      U.el('option', { value: 'per_user', text: 'سقف لكل مستخدم — أول استشارتين مجاناً' })
    ]);
    f.freeMode.value = s.freeMode;
    f.freeTotalCap = U.el('input', { type: 'number', min: '0', value: s.freeTotalCap });
    f.freePerUser = U.el('input', { type: 'number', min: '0', value: s.freePerUser });
    f.share = U.el('input', { type: 'number', min: '0', max: '100', value: s.doctorSharePercent });
    f.discount = U.el('input', { type: 'number', min: '0', max: '100', value: s.clinicDiscountPercent });
    f.sla = U.el('input', { type: 'number', min: '1', value: s.slaHours });
    f.urgentSla = U.el('input', { type: 'number', min: '5', value: s.urgentSlaMinutes });
    f.pain = U.el('input', { type: 'number', min: '1', max: '10', value: s.escalation.painThreshold });
    f.swelling = U.el('input', { type: 'checkbox' });
    f.swelling.checked = s.escalation.requireSwelling;
    f.fever = U.el('input', { type: 'checkbox' });
    f.fever.checked = s.escalation.requireFever;
    f.matching = U.el('select', {}, [
      U.el('option', { value: 'geo_nearest', text: 'الأقرب جغرافياً (إحداثيات المحافظة والعيادة)' }),
      U.el('option', { value: 'governorate', text: 'ضمن نفس المحافظة فقط' }),
      U.el('option', { value: 'manual', text: 'ربط يدوي من المشرف' })
    ]);
    f.matching.value = s.matching;

    function field(label, node, hint) {
      return U.el('label', { class: 'field' }, [
        U.el('span', { class: 'field__label', text: label }), node,
        hint ? U.el('span', { class: 'field__hint', text: hint }) : null
      ]);
    }

    U.mount(view, U.el('div', { class: 'stack' }, [
      head('قواعد العمل', 'القيم التي يعمل بها المحرك — وهي أيضاً ما يجب حسمه مع العميل قبل الإطلاق.', [
        U.el('button', {
          class: 'btn btn--gold btn--sm', text: 'حفظ كل القواعد',
          onclick: function () {
            S.update(function (dd) {
              var n = function (node, fallback) {
                var v = Number(U.normalizeDigits(node.value));
                return isNaN(v) ? fallback : v;
              };
              dd.settings.consultFee = n(f.fee, dd.settings.consultFee);
              dd.settings.freeMode = f.freeMode.value;
              dd.settings.freeTotalCap = n(f.freeTotalCap, dd.settings.freeTotalCap);
              dd.settings.freePerUser = n(f.freePerUser, dd.settings.freePerUser);
              dd.settings.doctorSharePercent = n(f.share, dd.settings.doctorSharePercent);
              dd.settings.clinicDiscountPercent = n(f.discount, dd.settings.clinicDiscountPercent);
              dd.settings.slaHours = n(f.sla, dd.settings.slaHours);
              dd.settings.urgentSlaMinutes = n(f.urgentSla, dd.settings.urgentSlaMinutes);
              dd.settings.escalation = {
                painThreshold: n(f.pain, dd.settings.escalation.painThreshold),
                requireSwelling: f.swelling.checked,
                requireFever: f.fever.checked
              };
              dd.settings.matching = f.matching.value;
              S.log(dd, { who: 'د. خالد', role: 'super_admin', what: 'تحديث قواعد العمل (التسعير/المجاني/الزمن الملزم/التصعيد)' });
            });
            U.toast('تم حفظ القواعد', 'ok');
          }
        })
      ]),
      U.el('div', { class: 'grid grid--2' }, [
        card('التسعير والشريحة المجانية', 'بند متعارض في العرض — يجب حسمه قبل التطوير (D5).', U.el('div', {}, [
          field('رسم الاستشارة (د.ع)', f.fee, 'لا يرد سعر الاستشارة في العرض — القيمة هنا افتراضية للمعاينة.'),
          field('نمط المجانية', f.freeMode),
          field('السقف الإجمالي (عدد المستخدمين)', f.freeTotalCap),
          field('السقف لكل مستخدم (عدد الاستشارات)', f.freePerUser),
          U.el('div', { class: 'alert alert--warn', text: 'استُهلك حتى الآن ' + U.num(db().settings.freeUsed) + ' من الشريحة المجانية.' })
        ])),
        card('توزيع الإيراد', 'نموذج أجور الأطباء غير محسوم (D3).', U.el('div', {}, [
          field('نسبة الطبيب %', f.share),
          field('نسبة الخصم داخل العيادة من مبلغ الاستشارة %', f.discount, '100% تعني خصم كامل مبلغ الاستشارة من كلفة العلاج.')
        ]))
      ]),
      U.el('div', { class: 'grid grid--2' }, [
        card('زمن الاستجابة الملزم', 'NFR-14 — الرقم غير محدد في العرض.', U.el('div', {}, [
          field('الحالات الاعتيادية (ساعة)', f.sla),
          field('الحالات الطارئة (دقيقة)', f.urgentSla)
        ])),
        card('قواعد التصعيد التلقائي', 'FR-9 — تُطبّق لحظة إرسال الاستبيان.', U.el('div', {}, [
          field('حد شدة الألم', f.pain),
          U.el('label', { class: 'check', style: 'margin:8px 0' }, [f.swelling, U.el('span', { text: 'يشترط وجود تورّم' })]),
          U.el('label', { class: 'check' }, [f.fever, U.el('span', { text: 'يشترط وجود حرارة' })])
        ]))
      ]),
      card('منطق المطابقة الجغرافية', 'FR-8 / D6 — الطريقة المعتمدة حالياً في المحرك.', U.el('div', {}, [field('الطريقة', f.matching)])),
      card('منطقة الخطر', null, U.el('div', { class: 'row', style: 'gap:8px' }, [
        U.el('button', {
          class: 'btn btn--danger', text: 'تصفير كل البيانات التجريبية',
          onclick: function () {
            U.confirmDialog('سيتم حذف كل البيانات وإعادة توليد بيانات المعاينة. متابعة؟', function () {
              S.reset();
              location.reload();
            }, 'تصفير');
          }
        }),
        U.el('span', { class: 'small muted', text: 'يؤثر على متصفحك فقط.' })
      ]))
    ]));
  }

  /* ================= القرارات المفتوحة (القسم ٩) ================= */

  function renderDecisions() {
    var d = db();
    var statuses = d.settings.decisionStatus || {};
    var rows = S.OPEN_DECISIONS.map(function (dec) {
      return Object.assign({}, dec, { status: statuses[dec.id] || 'open' });
    });
    var openCount = rows.filter(function (r) { return r.status === 'open'; }).length;
    var criticalOpen = rows.filter(function (r) { return r.status === 'open' && r.weight === 'حرج'; }).length;

    U.mount(view, U.el('div', { class: 'stack' }, [
      head('القرارات المفتوحة', 'البنود التي لا يجيب عنها العرض ويجب حسمها قبل كتابة وثيقة متطلبات متكاملة.'),
      U.el('div', { class: 'grid grid--kpi' }, [
        U.stat({ label: 'بنود مفتوحة', value: U.num(openCount), accent: openCount ? 'danger' : null }),
        U.stat({ label: 'منها حرجة', value: U.num(criticalOpen) }),
        U.stat({ label: 'محسومة', value: U.num(rows.length - openCount) }),
        U.stat({ label: 'جاهزية الإطلاق', value: U.pct(Math.round(((rows.length - criticalOpen) / rows.length) * 100)), hint: 'تُحتسب على البنود الحرجة' })
      ]),
      card('السجل', 'حدّث الحالة كلما حُسم بند مع العميل.', U.table([
        { title: '#', key: 'id' },
        { title: 'البند', render: function (r) {
            return U.el('div', {}, [
              U.el('div', { class: 'list-item__title', text: r.title }),
              U.el('div', { class: 'list-item__meta', text: r.detail })
            ]);
          } },
        { title: 'المرجع', key: 'ref' },
        { title: 'الأثر', render: function (r) { return U.badge(r.weight, r.weight === 'حرج' ? 'danger' : 'warn'); } },
        { title: 'الحالة', render: function (r) {
            var sel = U.el('select', {}, [
              U.el('option', { value: 'open', text: 'مفتوح' }),
              U.el('option', { value: 'discussing', text: 'قيد النقاش' }),
              U.el('option', { value: 'closed', text: 'محسوم' })
            ]);
            sel.value = r.status;
            sel.addEventListener('change', function () {
              S.update(function (dd) {
                dd.settings.decisionStatus = dd.settings.decisionStatus || {};
                dd.settings.decisionStatus[r.id] = sel.value;
              });
              U.toast('تم تحديث حالة البند ' + r.id, 'ok');
              renderDecisions();
            });
            return sel;
          } }
      ], rows))
    ]));
  }

  /* ================= سجل التدقيق (FR-32) ================= */

  function renderAudit() {
    var d = db();
    var q = '';
    var role = '';
    var host = U.el('div', {});
    var search = U.el('input', { type: 'search', placeholder: 'بحث في السجل' });
    var roleSel = U.el('select', {}, [
      U.el('option', { value: '', text: 'كل الأدوار' }),
      U.el('option', { value: 'super_admin', text: 'مشرف عام' }),
      U.el('option', { value: 'supervisor', text: 'مشرف' }),
      U.el('option', { value: 'doctor', text: 'طبيب' }),
      U.el('option', { value: 'clinic', text: 'عيادة' }),
      U.el('option', { value: 'patient', text: 'مريض' }),
      U.el('option', { value: 'system', text: 'النظام' })
    ]);

    function paint() {
      var rows = db().audit.filter(function (a) {
        if (role && a.role !== role) return false;
        if (q && (a.what + ' ' + a.who).toLowerCase().indexOf(q.toLowerCase()) === -1) return false;
        return true;
      }).slice(0, 200);
      U.mount(host, rows.length ? U.table([
        { title: 'الوقت', render: function (a) { return U.dateTime(a.when); } },
        { title: 'المنفّذ', key: 'who' },
        { title: 'الدور', render: function (a) {
            var map = { super_admin: 'مشرف عام', supervisor: 'مشرف', doctor: 'طبيب', clinic: 'عيادة', patient: 'مريض', system: 'النظام' };
            return U.badge(map[a.role] || a.role, a.role === 'system' ? 'muted' : 'info');
          } },
        { title: 'الإجراء', key: 'what' },
        { title: 'يخص المريض', render: function (a) {
            var p = a.targetPatientId ? E.patientById(db(), a.targetPatientId) : null;
            return p ? (p.name || p.phone) : '—';
          } }
      ], rows) : U.empty('لا توجد سجلات مطابقة.', '🧾'));
    }

    search.addEventListener('input', function () { q = search.value.trim(); paint(); });
    roleSel.addEventListener('change', function () { role = roleSel.value; paint(); });

    U.mount(view, U.el('div', { class: 'stack' }, [
      head('سجل التدقيق', 'كل إجراء ذي صلاحية عالية أو اطّلاع على بيانات مريض يُسجَّل هنا (FR-32 / NFR-3).', [
        U.el('button', {
          class: 'btn btn--sm btn--ghost', text: '⬇️ تصدير',
          onclick: function () {
            var rows = [['الوقت', 'المنفّذ', 'الدور', 'الإجراء']];
            db().audit.forEach(function (a) { rows.push([U.dateTime(a.when), a.who, a.role, a.what]); });
            csv('golden-crown-audit.csv', rows);
          }
        })
      ]),
      U.el('div', { class: 'toolbar' }, [search, roleSel]),
      host
    ]));
    paint();
  }

  /* ================= الموجّه ================= */

  var ROUTES = {
    overview: renderOverview,
    consultations: renderConsultations,
    quality: renderQuality,
    doctors: renderDoctors,
    supervisors: renderSupervisors,
    clinics: renderClinics,
    finance: renderFinance,
    growth: renderGrowth,
    content: renderContent,
    settings: renderSettings,
    decisions: renderDecisions,
    audit: renderAudit
  };

  function route() {
    var key = (location.hash || '#/overview').replace('#/', '').split('/')[0] || 'overview';
    if (!ROUTES[key]) key = 'overview';
    paintNav(key);
    ROUTES[key]();
    window.scrollTo(0, 0);
  }

  window.addEventListener('hashchange', route);
  U.roleBar('admin');
  route();
})();
