/* =============================================================
   لوحة المشرف — FR-15 .. FR-18 (جودة المتابعة وتسريع الطوارئ)
   ============================================================= */
(function () {
  'use strict';
  var S = window.GC.store, U = window.GC.ui, E = window.GC.engine;
  var view = U.$('#view');

  function db() { return S.load(); }
  function go(h) { location.hash = h; }

  function currentSupervisor() {
    var d = db();
    return d.supervisors.filter(function (s) { return s.id === (d.session.supervisorId || 'SV-1'); })[0] || d.supervisors[0];
  }

  var NAV = [
    { key: 'queue', icon: '⏱️', label: 'طابور الاستشارات' },
    { key: 'quality', icon: '⭐', label: 'مراجعة الجودة' },
    { key: 'complaints', icon: '📣', label: 'شكاوى المراجعين' },
    { key: 'doctors', icon: '🩺', label: 'أطباء نطاقي' }
  ];

  function paintNav(active) {
    var host = U.$('#side-nav');
    U.clear(host);
    host.appendChild(U.el('div', { class: 'side__links-wrap' }, NAV.map(function (it) {
      return U.el('a', {
        class: 'side__link' + (it.key === active ? ' is-active' : ''), href: '#/' + it.key
      }, [U.el('span', { class: 'ico', text: it.icon }), U.el('span', { text: it.label })]);
    })));

    var sup = currentSupervisor();
    var foot = U.$('#side-foot');
    U.clear(foot);
    var sel = U.el('select', {}, db().supervisors.map(function (s) {
      return U.el('option', { value: s.id, text: s.name });
    }));
    sel.value = sup.id;
    sel.addEventListener('change', function () {
      S.update(function (d) { d.session.supervisorId = sel.value; d.session.role = 'supervisor'; });
      route();
    });
    foot.appendChild(U.el('div', {}, [U.el('div', { text: 'المشرف الحالي:' }), sel, U.el('div', { style: 'margin-top:6px', text: 'النطاق: ' + sup.scope })]));
  }

  function head(title, sub, actions) {
    return U.el('div', { class: 'page-head' }, [
      U.el('div', {}, [U.el('h1', { text: title }), sub ? U.el('p', { text: sub }) : null]),
      actions ? U.el('div', { class: 'row', style: 'gap:8px' }, actions) : null
    ]);
  }

  function scopeDoctors() {
    var sup = currentSupervisor();
    return db().doctors.filter(function (x) { return x.supervisorId === sup.id; });
  }

  function scopeCases() {
    var ids = scopeDoctors().map(function (x) { return x.id; });
    return db().consultations.filter(function (c) {
      return c.doctorId ? ids.indexOf(c.doctorId) !== -1 : true;
    });
  }

  /* ---------- الطابور ---------- */

  function renderQueue() {
    var d = db();
    var cases = scopeCases();
    var open = cases.filter(function (c) { return c.status === 'new' || c.status === 'in_review'; });
    var urgent = open.filter(function (c) { return c.urgent; });
    var overdue = open.filter(function (c) { return E.isOverdue(d, c); });
    var unassigned = open.filter(function (c) { return !c.doctorId; });

    open.sort(function (a, b) {
      var score = function (c) { return (c.urgent ? 100 : 0) + (E.isOverdue(d, c) ? 50 : 0); };
      return score(b) - score(a) || a.createdAt - b.createdAt;
    });

    U.mount(view, U.el('div', { class: 'stack' }, [
      head('طابور الاستشارات', 'الحالات الطارئة والمتأخرة أولاً — ضمن نطاق إشرافك.'),
      U.el('div', { class: 'grid grid--kpi' }, [
        U.stat({ label: 'حالات مفتوحة', value: U.num(open.length) }),
        U.stat({ label: 'طارئة', value: U.num(urgent.length), accent: urgent.length ? 'danger' : null }),
        U.stat({ label: 'تجاوزت الزمن الملزم', value: U.num(overdue.length), accent: overdue.length ? 'danger' : null }),
        U.stat({ label: 'بلا طبيب مسند', value: U.num(unassigned.length) })
      ]),
      open.length ? U.table([
        { title: 'الحالة', key: 'id' },
        { title: 'وردت', render: function (c) { return U.ago(c.createdAt); } },
        { title: 'الأولوية', render: function (c) {
            var box = U.el('div', { class: 'row', style: 'gap:4px' });
            if (c.urgent) box.appendChild(U.badge('طارئة', 'danger'));
            if (E.isOverdue(db(), c)) box.appendChild(U.badge('متأخرة', 'warn'));
            if (!c.urgent && !E.isOverdue(db(), c)) box.appendChild(U.badge('اعتيادية', 'muted'));
            return box;
          } },
        { title: 'الشكوى', render: function (c) {
            var cm = S.COMPLAINTS.filter(function (x) { return x.id === c.complaintId; })[0];
            return cm ? cm.icon + ' ' + cm.label : '—';
          } },
        { title: 'الألم', render: function (c) { return U.num((c.answers.step3 || {}).painLevel) + '/١٠'; } },
        { title: 'الطبيب', render: function (c) {
            var doc = E.doctorById(db(), c.doctorId);
            return doc ? doc.name : '— غير مسند';
          } },
        { title: 'إجراء', render: function (c) {
            return U.el('button', {
              class: 'btn btn--sm btn--ghost', text: 'إعادة توجيه',
              onclick: function () { reassignModal(c.id); }
            });
          } }
      ], open) : U.empty('لا توجد حالات مفتوحة في نطاقك.', '✅')
    ]));
  }

  function reassignModal(id) {
    var d = db();
    var c = E.consultationById(d, id);
    var ranked = E.rankDoctors(d, {
      specialty: c.specialty,
      regionId: (c.answers.step1 || {}).region
    }).filter(function (r) { return r.doctor.id !== c.doctorId; });

    var sel = U.el('select', {}, ranked.map(function (r) {
      return U.el('option', { value: r.doctor.id, text: r.doctor.name + ' — ' + r.doctor.specialty + ' (' + U.num(r.distanceKm) + ' كم · ' + U.num(r.load) + ' حالة مفتوحة)' });
    }));
    var reason = U.el('input', { type: 'text', placeholder: 'سبب إعادة التوجيه', value: E.isOverdue(d, c) ? 'تجاوز الزمن الملزم للرد' : '' });

    var m = U.modal({
      title: 'إعادة توجيه الحالة ' + c.id,
      body: U.el('div', { class: 'stack' }, [
        U.el('label', { class: 'field' }, [U.el('span', { class: 'field__label', text: 'الطبيب الجديد' }), sel]),
        U.el('label', { class: 'field' }, [U.el('span', { class: 'field__label', text: 'السبب' }), reason])
      ]),
      actions: [
        U.el('button', { class: 'btn btn--ghost', text: 'إلغاء', onclick: function () { m.close(); } }),
        U.el('button', {
          class: 'btn btn--gold', text: 'تأكيد',
          onclick: function () {
            S.update(function (dd) {
              var cc = E.consultationById(dd, id);
              var prev = E.doctorById(dd, cc.doctorId);
              var next = E.doctorById(dd, sel.value);
              cc.doctorId = sel.value;
              cc.supervisorId = next ? next.supervisorId : cc.supervisorId;
              cc.status = 'in_review';
              cc.reassignedAt = Date.now();
              var tx = dd.transactions.filter(function (t) { return t.consultationId === cc.id; })[0];
              if (tx) tx.doctorId = sel.value;
              S.log(dd, {
                who: currentSupervisor().name, role: 'supervisor',
                what: 'إعادة توجيه ' + cc.id + ' من ' + (prev ? prev.name : 'غير مسند') + ' إلى ' + (next ? next.name : '—') + ' — السبب: ' + (reason.value || 'غير مذكور'),
                targetPatientId: cc.patientId
              });
            });
            m.close();
            U.toast('تمت إعادة التوجيه', 'ok');
            renderQueue();
          }
        })
      ]
    });
  }

  /* ---------- مراجعة الجودة (FR-15 / FR-16) ---------- */

  function renderQuality() {
    var d = db();
    var answered = scopeCases().filter(function (c) { return c.status === 'answered' || c.status === 'closed'; });
    var pending = answered.filter(function (c) { return c.qualityStatus !== 'reviewed'; });

    U.mount(view, U.el('div', { class: 'stack' }, [
      head('مراجعة جودة الاستشارات', 'مراجعة رد الطبيب بعد التسليم — نقطة المراجعة (قبل/بعد) بند مفتوح (FR-16).'),
      U.el('div', { class: 'grid grid--kpi' }, [
        U.stat({ label: 'ردود بانتظار المراجعة', value: U.num(pending.length) }),
        U.stat({ label: 'تمت مراجعتها', value: U.num(answered.length - pending.length) }),
        U.stat({ label: 'إجمالي الردود', value: U.num(answered.length) })
      ]),
      answered.length ? U.table([
        { title: 'الحالة', key: 'id' },
        { title: 'الطبيب', render: function (c) {
            var doc = E.doctorById(db(), c.doctorId);
            return doc ? doc.name : '—';
          } },
        { title: 'زمن الرد', render: function (c) { return U.hours(c.responseHours); } },
        { title: 'تقييم المريض', render: function (c) { return c.patientRating ? '★ ' + c.patientRating : '—'; } },
        { title: 'مراجعة الجودة', render: function (c) {
            return c.qualityStatus === 'reviewed' ? U.badge('مراجَعة', 'ok') : U.badge('بانتظار المراجعة', 'warn');
          } },
        { title: 'إجراء', render: function (c) {
            return U.el('button', {
              class: 'btn btn--sm btn--ghost', text: 'فتح الرد',
              onclick: function () { reviewModal(c.id); }
            });
          } }
      ], answered.slice(0, 80)) : U.empty('لا توجد ردود بعد.', '⭐')
    ]));
  }

  function reviewModal(id) {
    var d = db();
    var c = E.consultationById(d, id);
    var doc = E.doctorById(d, c.doctorId);
    var note = U.el('textarea', { placeholder: 'ملاحظة الجودة على الرد (تُحفظ مع الحالة)...' });

    var notesBox = U.el('div', { class: 'stack small' }, (c.qualityNotes || []).map(function (n) {
      return U.el('div', { class: 'list-item' }, [
        U.el('div', {}, [U.el('div', { text: n.note }), U.el('div', { class: 'list-item__meta', text: U.dateTime(n.when) })])
      ]);
    }));

    var m = U.modal({
      title: 'مراجعة رد ' + (doc ? doc.name : '') + ' — ' + c.id,
      body: U.el('div', { class: 'stack' }, [
        U.el('div', { class: 'report__opinion', text: c.opinion || 'لا يوجد رد بعد.' }),
        U.el('label', { class: 'field' }, [U.el('span', { class: 'field__label', text: 'ملاحظة جودة' }), note]),
        notesBox
      ]),
      actions: [
        U.el('button', { class: 'btn btn--ghost', text: 'إغلاق', onclick: function () { m.close(); } }),
        U.el('button', {
          class: 'btn', text: 'حفظ الملاحظة',
          onclick: function () {
            if (!note.value.trim()) { U.toast('اكتب الملاحظة أولاً', 'error'); return; }
            S.update(function (dd) {
              var cc = E.consultationById(dd, id);
              cc.qualityNotes = cc.qualityNotes || [];
              cc.qualityNotes.unshift({ id: S.uid('QN-'), note: note.value.trim(), when: Date.now() });
              S.log(dd, { who: currentSupervisor().name, role: 'supervisor', what: 'ملاحظة جودة على الحالة ' + cc.id, targetPatientId: cc.patientId });
            });
            m.close();
            U.toast('حُفظت الملاحظة', 'ok');
            renderQuality();
          }
        }),
        U.el('button', {
          class: 'btn btn--ok', text: 'اعتماد المراجعة',
          onclick: function () {
            S.update(function (dd) {
              var cc = E.consultationById(dd, id);
              cc.qualityStatus = 'reviewed';
              S.log(dd, { who: currentSupervisor().name, role: 'supervisor', what: 'اعتماد مراجعة جودة الحالة ' + cc.id, targetPatientId: cc.patientId });
            });
            m.close();
            U.toast('تم اعتماد المراجعة', 'ok');
            renderQuality();
          }
        })
      ]
    });
  }

  /* ---------- الشكاوى ---------- */

  function renderComplaints() {
    var d = db();
    var rows = d.complaints;
    U.mount(view, U.el('div', { class: 'stack' }, [
      head('شكاوى وملاحظات المراجعين', 'ترد من شاشة حالة الطلب في تطبيق المريض.'),
      rows.length ? U.table([
        { title: 'التاريخ', render: function (c) { return U.ago(c.createdAt); } },
        { title: 'الحالة', key: 'consultationId' },
        { title: 'المريض', render: function (c) {
            var p = E.patientById(db(), c.patientId);
            return p ? (p.name || p.phone) : '—';
          } },
        { title: 'النص', key: 'text' },
        { title: 'الحالة', render: function (c) {
            return c.status === 'open' ? U.badge('مفتوحة', 'warn') : U.badge('معالجة', 'ok');
          } },
        { title: 'إجراء', render: function (c) {
            if (c.status !== 'open') return '—';
            return U.el('button', {
              class: 'btn btn--sm btn--ghost', text: 'تعليم كمعالجة',
              onclick: function () {
                S.update(function (dd) {
                  var x = dd.complaints.filter(function (y) { return y.id === c.id; })[0];
                  if (x) { x.status = 'resolved'; x.resolvedAt = Date.now(); }
                  S.log(dd, { who: currentSupervisor().name, role: 'supervisor', what: 'معالجة شكوى على الحالة ' + c.consultationId });
                });
                renderComplaints();
              }
            });
          } }
      ], rows) : U.empty('لا توجد شكاوى.', '📣')
    ]));
  }

  /* ---------- أطباء النطاق (FR-18) ---------- */

  function renderDoctors() {
    var d = db();
    var ids = scopeDoctors().map(function (x) { return x.id; });
    var rows = E.doctorQuality(d, 90).filter(function (r) { return ids.indexOf(r.doctor.id) !== -1; });

    U.mount(view, U.el('div', { class: 'stack' }, [
      head('أطباء نطاقي', 'مؤشرات الجودة خلال ٩٠ يوماً.'),
      rows.length ? U.table([
        { title: 'الطبيب', render: function (r) { return r.doctor.name; } },
        { title: 'التخصص', render: function (r) { return r.doctor.specialty; } },
        { title: 'الحالة', render: function (r) {
            return U.badge(r.doctor.status === 'active' ? 'مفعّل' : r.doctor.status === 'pending' ? 'بانتظار التفعيل' : 'موقوف',
              r.doctor.status === 'active' ? 'ok' : 'muted');
          } },
        { title: 'حالات', render: function (r) { return U.num(r.cases); } },
        { title: 'مفتوحة', render: function (r) { return U.num(r.open); } },
        { title: 'متوسط الرد', render: function (r) { return U.hours(r.avgResponse); } },
        { title: 'تجاوزات', render: function (r) { return r.breaches ? U.badge(U.num(r.breaches), 'danger') : U.badge('٠', 'ok'); } },
        { title: 'التقييم', render: function (r) { return r.avgRating ? '★ ' + r.avgRating : '—'; } }
      ], rows) : U.empty('لا يوجد أطباء مرتبطون بنطاقك.', '🩺')
    ]));
  }

  var ROUTES = { queue: renderQueue, quality: renderQuality, complaints: renderComplaints, doctors: renderDoctors };

  function route() {
    var key = (location.hash || '#/queue').replace('#/', '').split('/')[0] || 'queue';
    if (!ROUTES[key]) key = 'queue';
    paintNav(key);
    ROUTES[key]();
    window.scrollTo(0, 0);
  }

  window.addEventListener('hashchange', route);
  U.roleBar('supervisor');
  route();
})();
