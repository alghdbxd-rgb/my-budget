/* الموقع التسويقي + قائمة الانتظار + تتبّع مصدر الإحالة (FR-36 / FR-37) */
(function () {
  'use strict';
  var S = window.GC.store, U = window.GC.ui;
  var db = S.load();

  /* --- تتبّع قناة الإحالة من رابط الحملة: index.html?src=colleges --- */
  var params = new URLSearchParams(location.search);
  var src = params.get('src');
  var known = S.CHANNELS.map(function (c) { return c.id; });
  if (src && known.indexOf(src) !== -1) {
    try { sessionStorage.setItem('gc-channel', src); } catch (e) {}
    S.update(function (d) {
      var today = new Date();
      today.setHours(0, 0, 0, 0);
      var row = d.visits.filter(function (v) {
        var vd = new Date(v.date); vd.setHours(0, 0, 0, 0);
        return vd.getTime() === today.getTime() && v.channel === src;
      })[0];
      if (row) row.count += 1;
      else d.visits.push({ date: Date.now(), channel: src, count: 1 });
    });
  }

  /* --- نصوص قابلة للتحرير من لوحة الإدارة --- */
  U.$('#hero-headline').textContent = db.settings.homeHeadline;
  U.$('#hero-sub').textContent = db.settings.homeSub;
  U.$('#legal-text').textContent = db.settings.legalNotice;
  U.$('#legal-source').textContent = 'الجهة المنسوب إليها: ' + db.settings.legalSource;

  var free = window.GC.engine.freeEligibility(db, null);
  U.$('#free-banner').textContent =
    free.mode === 'total_cap'
      ? 'الاستشارة مجانية بالكامل لأول ' + U.num(db.settings.freeTotalCap) + ' مستخدم — تبقّى ' + U.num(Math.max(0, db.settings.freeTotalCap - db.settings.freeUsed)) + ' مقعداً.'
      : 'أول ' + U.num(db.settings.freePerUser) + ' استشارتين مجاناً بالكامل لكل مستخدم.';

  /* --- قائمة المحافظات --- */
  var sel = U.$('#waitlist-region');
  S.GOVERNORATES.forEach(function (g) {
    sel.appendChild(U.el('option', { value: g.id, text: g.name }));
  });

  function refreshCount() {
    U.$('#waitlist-count').textContent = 'انضم حتى الآن ' + U.num(S.load().waitlist.length) + ' مسجّلاً.';
  }
  refreshCount();

  U.$('#waitlist-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target;
    var phone = U.normalizeDigits(f.phone.value).trim();
    if (!/^07\d{9}$/.test(phone)) {
      U.toast('رقم الهاتف يجب أن يبدأ بـ 07 ويتكوّن من 11 رقماً', 'error');
      return;
    }
    S.update(function (d) {
      d.waitlist.unshift({
        id: S.uid('WL-'),
        name: f.name.value.trim(),
        phone: phone,
        region: f.region.value,
        type: 'patient',
        channel: sessionStorage.getItem('gc-channel') || 'direct',
        createdAt: Date.now()
      });
    });
    f.reset();
    refreshCount();
    U.toast('تم تسجيلك في قائمة الانتظار ✅', 'ok');
  });

  /* --- طلب انضمام طبيب --- */
  U.$('#join-doctor').addEventListener('click', function () {
    var form = U.el('form', { class: 'stack', id: 'doctor-form' }, [
      U.el('label', { class: 'field' }, [
        U.el('span', { class: 'field__label', text: 'الاسم الكامل' }),
        U.el('input', { type: 'text', name: 'name', required: 'required', placeholder: 'د. ...' })
      ]),
      U.el('label', { class: 'field' }, [
        U.el('span', { class: 'field__label', text: 'رقم الهاتف' }),
        U.el('input', { type: 'tel', name: 'phone', required: 'required', placeholder: '07XXXXXXXXX' })
      ]),
      U.el('label', { class: 'field' }, [
        U.el('span', { class: 'field__label', text: 'التخصص' }),
        U.el('select', { name: 'specialty' }, S.SPECIALTIES.map(function (s) { return U.el('option', { value: s, text: s }); }))
      ]),
      U.el('label', { class: 'field' }, [
        U.el('span', { class: 'field__label', text: 'المحافظة' }),
        U.el('select', { name: 'region' }, S.GOVERNORATES.map(function (g) { return U.el('option', { value: g.id, text: g.name }); }))
      ]),
      U.el('label', { class: 'field' }, [
        U.el('span', { class: 'field__label', text: 'رقم إجازة مزاولة المهنة' }),
        U.el('input', { type: 'text', name: 'licenseNo', required: 'required', placeholder: 'IQ-D-xxxxx' }),
        U.el('span', { class: 'field__hint', text: 'يُتحقق منها يدوياً من قبل المشرف العام قبل التفعيل (NFR-17).' })
      ]),
      U.el('label', { class: 'field' }, [
        U.el('span', { class: 'field__label', text: 'نبذة مختصرة' }),
        U.el('textarea', { name: 'bio', placeholder: 'سنوات الخبرة، الشهادات، العيادة...' })
      ])
    ]);

    var m = U.modal({
      title: 'طلب انضمام طبيب',
      body: form,
      actions: [
        U.el('button', { class: 'btn btn--ghost', text: 'إلغاء', onclick: function () { m.close(); } }),
        U.el('button', {
          class: 'btn btn--gold',
          text: 'إرسال الطلب',
          onclick: function () {
            if (!form.name.value.trim() || !form.phone.value.trim()) {
              U.toast('يرجى إكمال الاسم ورقم الهاتف', 'error');
              return;
            }
            S.update(function (d) {
              d.doctors.push({
                id: S.uid('DR-'),
                name: form.name.value.trim(),
                phone: U.normalizeDigits(form.phone.value).trim(),
                specialty: form.specialty.value,
                region: form.region.value,
                licenseNo: form.licenseNo.value.trim(),
                licenseVerified: false,
                bio: form.bio.value.trim(),
                clinicId: null,
                supervisorId: null,
                status: 'pending',
                rating: 0,
                reviewsCount: 0,
                payoutModel: 'share',
                sharePercent: d.settings.doctorSharePercent,
                hours: [],
                credentials: [],
                photo: null,
                createdAt: Date.now()
              });
              S.log(d, { who: 'موقع المنصة', role: 'system', what: 'طلب انضمام طبيب جديد: ' + form.name.value.trim() });
            });
            m.close();
            U.toast('وصل طلبك — سيراجعه المشرف العام ويفعّل حسابك بعد التحقق من الإجازة.', 'ok');
          }
        })
      ]
    });
  });

  /* --- تسجيل اهتمام جهة (مختبر / مكتب إعلان / عيادة) --- */
  U.$('#join-partner').addEventListener('click', function () {
    var form = U.el('form', { class: 'stack' }, [
      U.el('label', { class: 'field' }, [
        U.el('span', { class: 'field__label', text: 'اسم الجهة' }),
        U.el('input', { type: 'text', name: 'name', required: 'required' })
      ]),
      U.el('label', { class: 'field' }, [
        U.el('span', { class: 'field__label', text: 'النوع' }),
        U.el('select', { name: 'type' }, [
          U.el('option', { value: 'lab', text: 'مختبر أسنان' }),
          U.el('option', { value: 'ads', text: 'مكتب إعلان' }),
          U.el('option', { value: 'clinic', text: 'عيادة شريكة' }),
          U.el('option', { value: 'academy', text: 'أكاديمية/دورات' })
        ])
      ]),
      U.el('label', { class: 'field' }, [
        U.el('span', { class: 'field__label', text: 'رقم التواصل' }),
        U.el('input', { type: 'tel', name: 'phone', required: 'required' })
      ])
    ]);
    var m = U.modal({
      title: 'تسجيل اهتمام',
      body: form,
      actions: [
        U.el('button', { class: 'btn btn--ghost', text: 'إلغاء', onclick: function () { m.close(); } }),
        U.el('button', {
          class: 'btn',
          text: 'إرسال',
          onclick: function () {
            if (!form.name.value.trim()) { U.toast('يرجى إدخال اسم الجهة', 'error'); return; }
            S.update(function (d) {
              d.waitlist.unshift({
                id: S.uid('WL-'),
                name: form.name.value.trim(),
                phone: U.normalizeDigits(form.phone.value).trim(),
                region: null,
                type: form.type.value,
                channel: sessionStorage.getItem('gc-channel') || 'direct',
                createdAt: Date.now()
              });
            });
            m.close();
            refreshCount();
            U.toast('تم تسجيل اهتمام الجهة — بوابات المرحلة الثانية قيد التجهيز.', 'ok');
          }
        })
      ]
    });
  });

  U.roleBar('site');
})();
