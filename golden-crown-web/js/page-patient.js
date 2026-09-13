/* =============================================================
   تطبيق المريض — تسجيل، استبيان 4 خطوات، دفع، حالة، تقرير
   (FR-1, FR-4 .. FR-9, FR-19 .. FR-25)
   ============================================================= */
(function () {
  'use strict';
  var S = window.GC.store, U = window.GC.ui, E = window.GC.engine;
  var view = U.$('#view');
  var OTP_DEMO = '1234';
  var pendingOtp = null;

  function db() { return S.load(); }
  function me() {
    var d = db();
    return d.patients.filter(function (p) { return p.id === d.session.patientId; })[0] || null;
  }
  function go(hash) { location.hash = hash; }

  /* ---------------- تخطيط ---------------- */

  function header() {
    var p = me();
    U.$('#app-user').textContent = p ? (p.name || p.phone) : 'زائر';
    U.$('#app-logout').hidden = !p;
  }

  U.$('#app-logout').addEventListener('click', function () {
    S.update(function (d) { d.session = { role: 'guest', patientId: null, doctorId: null, supervisorId: null, adminId: null }; });
    go('#/login');
    U.toast('تم تسجيل الخروج');
  });

  function bottomNav(active) {
    var nav = U.$('#bottom-nav');
    if (!me()) { nav.hidden = true; return; }
    nav.hidden = false;
    U.clear(nav);
    [
      { key: 'home', icon: '🏠', label: 'الرئيسية', hash: '#/home' },
      { key: 'orders', icon: '📋', label: 'استشاراتي', hash: '#/orders' },
      { key: 'new', icon: '➕', label: 'استشارة جديدة', hash: '#/consult/1' },
      { key: 'profile', icon: '👤', label: 'حسابي', hash: '#/profile' }
    ].forEach(function (it) {
      nav.appendChild(
        U.el('button', { class: it.key === active ? 'is-active' : '', onclick: function () { go(it.hash); } }, [
          U.el('span', { class: 'ico', text: it.icon }),
          U.el('span', { text: it.label })
        ])
      );
    });
  }

  function page(title, sub, nodes) {
    var head = [U.el('h1', { text: title })];
    if (sub) head.push(U.el('p', { class: 'muted small', text: sub }));
    return U.el('div', { class: 'stack' }, head.concat(nodes));
  }

  function backBtn(hash, label) {
    return U.el('button', { class: 'btn btn--ghost btn--sm no-print', text: '→ ' + (label || 'رجوع'), onclick: function () { go(hash); } });
  }

  /* ---------------- الدخول (FR-1 / FR-4) ---------------- */

  function renderLogin() {
    bottomNav(null);
    var phoneInput = U.el('input', { type: 'tel', inputmode: 'numeric', placeholder: '07XXXXXXXXX', id: 'login-phone' });
    var otpBox = U.el('div', { class: 'stack', hidden: 'hidden' });
    var otpInput = U.el('input', { type: 'tel', inputmode: 'numeric', placeholder: '____', maxlength: '4', style: 'letter-spacing:10px;text-align:center;font-size:1.3rem' });

    otpBox.appendChild(U.el('label', { class: 'field' }, [
      U.el('span', { class: 'field__label', text: 'رمز التحقق المرسل برسالة نصية' }),
      otpInput,
      U.el('span', { class: 'field__hint', text: 'في نسخة المعاينة لا تُرسل رسائل فعلية — الرمز التجريبي ' + OTP_DEMO })
    ]));
    otpBox.appendChild(U.el('button', {
      class: 'btn btn--gold btn--block', text: 'تأكيد الدخول',
      onclick: function () {
        if (U.normalizeDigits(otpInput.value).trim() !== OTP_DEMO) { U.toast('رمز التحقق غير صحيح', 'error'); return; }
        var phone = pendingOtp;
        var newUser = false;
        S.update(function (d) {
          var p = d.patients.filter(function (x) { return x.phone === phone; })[0];
          if (!p) {
            newUser = true;
            p = {
              id: S.uid('PT-'), phone: phone, name: '', age: '', gender: '', region: '',
              chronic: '', allergies: '',
              channel: sessionStorage.getItem('gc-channel') || 'direct',
              createdAt: Date.now()
            };
            d.patients.push(p);
          }
          d.session = { role: 'patient', patientId: p.id, doctorId: null, supervisorId: null, adminId: null };
        });
        U.toast(newUser ? 'أهلاً بك في التاج الذهبي 👋' : 'أهلاً بعودتك 👋', 'ok');
        go('#/home');
      }
    }));

    var sendBtn = U.el('button', {
      class: 'btn btn--gold btn--block', text: 'إرسال رمز التحقق',
      onclick: function () {
        var phone = U.normalizeDigits(phoneInput.value).trim();
        if (!/^07\d{9}$/.test(phone)) { U.toast('رقم غير صحيح — يبدأ بـ 07 ويتكوّن من 11 رقماً', 'error'); return; }
        pendingOtp = phone;
        otpBox.hidden = false;
        sendBtn.textContent = 'إعادة إرسال الرمز';
        U.toast('رمز التحقق التجريبي: ' + OTP_DEMO, 'ok');
        otpInput.focus();
      }
    });

    U.mount(view, page('تسجيل الدخول', 'برقم الهاتف ورمز تحقق — بلا كلمات مرور.', [
      U.el('div', { class: 'card stack' }, [
        U.el('label', { class: 'field' }, [
          U.el('span', { class: 'field__label', text: 'رقم الهاتف' }),
          phoneInput,
          U.el('span', { class: 'field__hint', text: 'حساب تجريبي جاهز: 07701234567' })
        ]),
        sendBtn,
        otpBox
      ]),
      U.el('div', { class: 'alert alert--info', text: 'بياناتك الصحية تُحفظ على جهازك في هذه النسخة التجريبية ولا تُرسل لأي خادم.' })
    ]));
  }

  /* ---------------- الرئيسية ---------------- */

  function renderHome() {
    var d = db(), p = me();
    bottomNav('home');
    var mine = d.consultations.filter(function (c) { return c.patientId === p.id; });
    var active = mine.filter(function (c) { return c.status === 'new' || c.status === 'in_review'; });
    var ready = mine.filter(function (c) { return c.status === 'answered'; });
    var draft = d.drafts[p.id];
    var free = E.freeEligibility(d, p.id);

    var nodes = [];

    nodes.push(
      U.el('div', { class: 'card card--gold' }, [
        U.el('h2', { text: 'ابدأ استشارة جديدة' }),
        U.el('p', { class: 'small muted', text: 'أربع خطوات قصيرة: بياناتك، شكواك، أعراضك، وصورك.' }),
        free.eligible
          ? U.el('p', { class: 'small' }, [U.badge('مجاناً', 'ok'), U.el('span', {
              text: ' ' + (free.mode === 'total_cap'
                ? 'ضمن الشريحة المجانية الأولى (' + U.num(free.cap - free.used) + ' مقعداً متبقياً)'
                : 'تبقّت لك ' + U.num(free.cap - free.used) + ' استشارة مجانية')
            })])
          : U.el('p', { class: 'small muted', text: 'رسم الاستشارة: ' + U.money(d.settings.consultFee, d.settings.currency) }),
        U.el('button', {
          class: 'btn btn--gold btn--block', text: draft ? 'إكمال الاستبيان المحفوظ' : 'ابدأ الآن',
          onclick: function () { go('#/consult/' + (draft ? draft.step : 1)); }
        })
      ])
    );

    if (active.length) {
      nodes.push(U.el('h3', { text: 'قيد المتابعة' }));
      active.forEach(function (c) { nodes.push(consultCard(c)); });
    }
    if (ready.length) {
      nodes.push(U.el('h3', { text: 'جاهزة للاطلاع' }));
      ready.forEach(function (c) { nodes.push(consultCard(c)); });
    }
    if (!mine.length) {
      nodes.push(U.empty('لا توجد استشارات بعد — ابدأ أول استشارة مجانية.', '🦷'));
    }

    nodes.push(
      U.el('div', { class: 'notice-legal small' }, [
        U.el('b', { text: 'تنبيه' }),
        U.el('span', { text: d.settings.legalNotice })
      ])
    );

    U.mount(view, page('مرحباً ' + (p.name || 'بك'), null, nodes));
  }

  function consultCard(c) {
    var d = db();
    var doc = E.doctorById(d, c.doctorId);
    var complaint = S.COMPLAINTS.filter(function (x) { return x.id === c.complaintId; })[0];
    return U.el('div', { class: 'card stack' }, [
      U.el('div', { class: 'row row--between' }, [
        U.el('div', {}, [
          U.el('div', { class: 'list-item__title', text: (complaint ? complaint.icon + ' ' + complaint.label : 'استشارة') + ' — ' + c.id }),
          U.el('div', { class: 'list-item__meta', text: U.ago(c.createdAt) + (doc ? ' · ' + doc.name : '') })
        ]),
        U.el('div', { class: 'row', style: 'gap:6px' }, [
          c.urgent ? U.badge('طارئة', 'danger') : null,
          U.badge(E.statusLabel(c.status), E.statusTone(c.status))
        ])
      ]),
      U.el('div', { class: 'row', style: 'gap:8px' }, [
        U.el('button', { class: 'btn btn--sm btn--ghost', text: 'تفاصيل الحالة', onclick: function () { go('#/status/' + c.id); } }),
        (c.status === 'answered' || c.status === 'closed')
          ? U.el('button', { class: 'btn btn--sm', text: 'عرض التقرير', onclick: function () { go('#/report/' + c.id); } })
          : null
      ])
    ]);
  }

  /* ---------------- الاستبيان (FR-5 .. FR-7) ---------------- */

  function draftOf(p) {
    var d = db();
    return d.drafts[p.id] || { step: 1, answers: {} };
  }

  function saveDraft(p, patch) {
    S.update(function (d) {
      var cur = d.drafts[p.id] || { step: 1, answers: {} };
      d.drafts[p.id] = {
        step: patch.step != null ? patch.step : cur.step,
        answers: Object.assign({}, cur.answers, patch.answers || {}),
        updatedAt: Date.now()
      };
    });
  }

  function stepsBar(step) {
    var bar = U.el('div', { class: 'steps' });
    for (var i = 1; i <= 4; i++) {
      bar.appendChild(U.el('div', { class: 'steps__dot ' + (i < step ? 'is-done' : i === step ? 'is-current' : '') }));
    }
    return U.el('div', {}, [
      bar,
      U.el('div', { class: 'row row--between small muted' }, [
        U.el('span', { text: 'الخطوة ' + U.num(step) + ' من ٤' }),
        U.el('span', { text: 'يُحفظ تلقائياً — يمكنك المتابعة لاحقاً' })
      ])
    ]);
  }

  function toothChart(selected, onPick) {
    function row(nums) {
      return U.el('div', { class: 'teeth__row' }, nums.map(function (n) {
        return U.el('button', {
          class: 'tooth' + (String(selected) === String(n) ? ' is-active' : ''),
          type: 'button',
          text: String(n),
          onclick: function () { onPick(String(n)); }
        });
      }));
    }
    var upper = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
    var lower = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];
    return U.el('div', { class: 'teeth' }, [
      U.el('div', { class: 'small muted center', text: 'الفك العلوي' }),
      row(upper),
      row(lower),
      U.el('div', { class: 'small muted center', text: 'الفك السفلي' })
    ]);
  }

  function renderConsult(stepStr) {
    var p = me();
    var step = Math.min(4, Math.max(1, Number(stepStr) || 1));
    var dr = draftOf(p);
    bottomNav('new');
    saveDraft(p, { step: step });

    var body;
    if (step === 1) body = consultStep1(p, dr);
    else if (step === 2) body = consultStep2(p, dr);
    else if (step === 3) body = consultStep3(p, dr);
    else body = consultStep4(p, dr);

    U.mount(view, U.el('div', { class: 'stack' }, [stepsBar(step), body]));
    window.scrollTo(0, 0);
  }

  function navRow(step, onNext, nextLabel) {
    return U.el('div', { class: 'row', style: 'gap:10px;margin-top:6px' }, [
      step > 1 ? U.el('button', { class: 'btn btn--ghost', text: 'السابق', onclick: function () { go('#/consult/' + (step - 1)); } }) : null,
      U.el('button', { class: 'btn btn--gold grow', text: nextLabel || 'التالي', onclick: onNext })
    ]);
  }

  function consultStep1(p, dr) {
    var a = dr.answers.step1 || { age: p.age, gender: p.gender, region: p.region, chronic: p.chronic || 'لا يوجد', allergies: p.allergies || 'لا يوجد' };
    var name = U.el('input', { type: 'text', value: p.name || '' });
    var age = U.el('input', { type: 'tel', inputmode: 'numeric', value: a.age || '' });
    var gender = U.el('select', {}, [
      U.el('option', { value: '', text: 'اختر' }),
      U.el('option', { value: 'male', text: 'ذكر' }),
      U.el('option', { value: 'female', text: 'أنثى' })
    ]);
    gender.value = a.gender || '';
    var region = U.el('select', {}, [U.el('option', { value: '', text: 'اختر المحافظة' })].concat(
      S.GOVERNORATES.map(function (g) { return U.el('option', { value: g.id, text: g.name }); })
    ));
    region.value = a.region || '';
    var chronic = U.el('input', { type: 'text', value: a.chronic || '', placeholder: 'سكري، ضغط، لا يوجد...' });
    var allergies = U.el('input', { type: 'text', value: a.allergies || '', placeholder: 'بنسلين، لا يوجد...' });

    return U.el('div', { class: 'card stack' }, [
      U.el('h2', { text: 'بياناتك الأساسية' }),
      U.el('label', { class: 'field' }, [U.el('span', { class: 'field__label', text: 'الاسم' }), name]),
      U.el('label', { class: 'field' }, [U.el('span', { class: 'field__label', text: 'العمر' }), age]),
      U.el('label', { class: 'field' }, [U.el('span', { class: 'field__label', text: 'الجنس' }), gender]),
      U.el('label', { class: 'field' }, [U.el('span', { class: 'field__label', text: 'المحافظة' }), region,
        U.el('span', { class: 'field__hint', text: 'تُستخدم لتوجيهك إلى أقرب طبيب مختص.' })]),
      U.el('label', { class: 'field' }, [U.el('span', { class: 'field__label', text: 'أمراض مزمنة' }), chronic]),
      U.el('label', { class: 'field' }, [U.el('span', { class: 'field__label', text: 'حساسية من أدوية' }), allergies]),
      navRow(1, function () {
        var ageV = Number(U.normalizeDigits(age.value));
        if (!ageV || ageV < 1 || ageV > 110) { U.toast('يرجى إدخال عمر صحيح', 'error'); return; }
        if (!region.value) { U.toast('يرجى اختيار المحافظة', 'error'); return; }
        S.update(function (d) {
          var pp = d.patients.filter(function (x) { return x.id === p.id; })[0];
          if (pp) {
            pp.name = name.value.trim() || pp.name;
            pp.age = ageV; pp.gender = gender.value; pp.region = region.value;
            pp.chronic = chronic.value.trim(); pp.allergies = allergies.value.trim();
          }
        });
        saveDraft(p, {
          step: 2,
          answers: { step1: { age: ageV, gender: gender.value, region: region.value, chronic: chronic.value.trim(), allergies: allergies.value.trim() } }
        });
        go('#/consult/2');
      })
    ]);
  }

  function consultStep2(p, dr) {
    var a = dr.answers.step2 || {};
    var chosen = a.complaintId || null;
    var tooth = a.tooth || null;
    var grid = U.el('div', { class: 'option-grid' });

    function paint() {
      U.clear(grid);
      S.COMPLAINTS.forEach(function (c) {
        grid.appendChild(U.el('button', {
          type: 'button',
          class: 'option' + (chosen === c.id ? ' is-active' : ''),
          onclick: function () { chosen = c.id; paint(); }
        }, [
          U.el('span', { class: 'option__icon', text: c.icon }),
          U.el('span', { class: 'option__label', text: c.label })
        ]));
      });
    }
    paint();

    var chartHost = U.el('div', {});
    function paintTeeth() {
      U.mount(chartHost, toothChart(tooth, function (n) { tooth = (tooth === n ? null : n); paintTeeth(); }));
    }
    paintTeeth();

    return U.el('div', { class: 'card stack' }, [
      U.el('h2', { text: 'ما هي شكواك الرئيسية؟' }),
      grid,
      U.el('h3', { style: 'margin-top:10px', text: 'حدّد السن المصاب (اختياري)' }),
      U.el('p', { class: 'small muted', text: 'اضغط على رقم السن حسب ترقيم FDI — إن لم تكن متأكداً تجاوز هذه الخطوة.' }),
      chartHost,
      navRow(2, function () {
        if (!chosen) { U.toast('يرجى اختيار الشكوى الرئيسية', 'error'); return; }
        saveDraft(p, { step: 3, answers: { step2: { complaintId: chosen, tooth: tooth } } });
        go('#/consult/3');
      })
    ]);
  }

  function consultStep3(p, dr) {
    var a = dr.answers.step3 || { painLevel: 5, duration: '', worseWhen: '', swelling: false, fever: false };
    var painOut = U.el('div', { class: 'pain-value', text: U.num(a.painLevel || 5) });
    var pain = U.el('input', { type: 'range', min: '1', max: '10', step: '1', value: String(a.painLevel || 5) });
    pain.addEventListener('input', function () { painOut.textContent = U.num(pain.value); });

    var durations = ['أقل من يوم', 'يوم واحد', 'يومان', '3 أيام', 'أسبوع', 'أكثر من أسبوعين'];
    var worseOpts = ['عند المضغ', 'مع البارد', 'مع الحار', 'ليلاً', 'عند اللمس', 'بلا سبب واضح'];
    var duration = a.duration || '';
    var worse = a.worseWhen || '';

    function chipRow(options, current, onPick) {
      var box = U.el('div', { class: 'chips' });
      function paint() {
        U.clear(box);
        options.forEach(function (o) {
          box.appendChild(U.el('button', {
            type: 'button', class: 'chip chip--gold' + (current() === o ? ' is-active' : ''), text: o,
            onclick: function () { onPick(o); paint(); }
          }));
        });
      }
      paint();
      return box;
    }

    var swelling = U.el('input', { type: 'checkbox' });
    swelling.checked = !!a.swelling;
    var fever = U.el('input', { type: 'checkbox' });
    fever.checked = !!a.fever;

    return U.el('div', { class: 'card stack' }, [
      U.el('h2', { text: 'أعراضك بالتفصيل' }),
      U.el('div', { class: 'field' }, [
        U.el('span', { class: 'field__label', text: 'شدة الألم' }),
        painOut,
        pain,
        U.el('div', { class: 'pain-scale' }, [U.el('span', { text: 'خفيف' }), U.el('span', { text: 'لا يُحتمل' })])
      ]),
      U.el('div', { class: 'field' }, [
        U.el('span', { class: 'field__label', text: 'منذ متى بدأ الألم؟' }),
        chipRow(durations, function () { return duration; }, function (v) { duration = v; })
      ]),
      U.el('div', { class: 'field' }, [
        U.el('span', { class: 'field__label', text: 'متى يزداد الألم؟' }),
        chipRow(worseOpts, function () { return worse; }, function (v) { worse = v; })
      ]),
      U.el('label', { class: 'check', style: 'margin-bottom:8px' }, [swelling, U.el('span', { text: 'يوجد تورّم في الوجه أو اللثة' })]),
      U.el('label', { class: 'check' }, [fever, U.el('span', { text: 'ترافقه حرارة أو إعياء' })]),
      navRow(3, function () {
        if (!duration) { U.toast('يرجى تحديد مدة الألم', 'error'); return; }
        saveDraft(p, {
          step: 4,
          answers: { step3: { painLevel: Number(pain.value), duration: duration, worseWhen: worse, swelling: swelling.checked, fever: fever.checked } }
        });
        go('#/consult/4');
      })
    ]);
  }

  /* ضغط الصور قبل الحفظ (NFR-12) */
  function compress(file, cb) {
    var reader = new FileReader();
    reader.onload = function () {
      var img = new Image();
      img.onload = function () {
        var max = 900;
        var scale = Math.min(1, max / Math.max(img.width, img.height));
        var canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        cb(canvas.toDataURL('image/jpeg', 0.6));
      };
      img.onerror = function () { cb(null); };
      img.src = reader.result;
    };
    reader.onerror = function () { cb(null); };
    reader.readAsDataURL(file);
  }

  function consultStep4(p, dr) {
    var a = dr.answers.step4 || { images: [], note: '' };
    var images = (a.images || []).slice();
    var note = U.el('textarea', { placeholder: 'أي تفاصيل إضافية تريد أن يعرفها الطبيب...' });
    note.value = a.note || '';

    var thumbs = U.el('div', { class: 'thumbs' });
    function paint() {
      U.clear(thumbs);
      images.forEach(function (src, i) {
        thumbs.appendChild(U.el('div', { class: 'thumb' }, [
          U.el('img', { src: src, alt: 'صورة ' + (i + 1) }),
          U.el('button', { type: 'button', text: '✕', onclick: function () { images.splice(i, 1); paint(); } })
        ]));
      });
      if (!images.length) thumbs.appendChild(U.el('div', { class: 'small muted', text: 'لم تُرفع صور بعد.' }));
    }
    paint();

    var input = U.el('input', { type: 'file', accept: 'image/*', multiple: 'multiple', capture: 'environment', style: 'display:none' });
    input.addEventListener('change', function () {
      var files = Array.prototype.slice.call(input.files || []);
      if (!files.length) return;
      var left = files.length;
      files.forEach(function (f) {
        compress(f, function (src) {
          if (src) images.push(src);
          if (--left === 0) { paint(); U.toast('تمت إضافة الصور', 'ok'); }
        });
      });
      input.value = '';
    });

    var urgentPreview = E.computeUrgency(dr.answers.step3, db().settings);

    return U.el('div', { class: 'card stack' }, [
      U.el('h2', { text: 'صور الحالة' }),
      U.el('p', { class: 'small muted', text: 'صوّر الابتسامة والسن المصاب بإضاءة جيدة. يمكنك رفع أكثر من صورة أو التصوير مباشرة من الكاميرا.' }),
      input,
      U.el('button', { class: 'btn btn--ghost btn--block', text: '📷 إضافة صور', onclick: function () { input.click(); } }),
      thumbs,
      U.el('label', { class: 'field', style: 'margin-top:10px' }, [
        U.el('span', { class: 'field__label', text: 'ملاحظات إضافية' }), note
      ]),
      urgentPreview ? U.el('div', { class: 'alert alert--danger', text: '⚠️ أعراضك تشير إلى حالة قد تكون طارئة — سيتم تصعيدها تلقائياً لفريق المشرفين بعد الإرسال.' }) : null,
      navRow(4, function () {
        saveDraft(p, { step: 4, answers: { step4: { images: images, note: note.value.trim() } } });
        submitQuestionnaire(p);
      }, 'إرسال ومتابعة الدفع')
    ]);
  }

  function submitQuestionnaire(p) {
    var id = null;
    S.update(function (d) {
      var dr = d.drafts[p.id];
      if (!dr) return;
      var complaint = S.COMPLAINTS.filter(function (c) { return c.id === (dr.answers.step2 || {}).complaintId; })[0];
      var cs = {
        id: S.uid('CS-'),
        patientId: p.id,
        code: null,
        status: 'draft',
        urgent: E.computeUrgency(dr.answers.step3, d.settings),
        complaintId: complaint ? complaint.id : 'other',
        specialty: complaint ? complaint.specialty : 'طب أسنان عام',
        doctorId: null,
        supervisorId: null,
        createdAt: Date.now(),
        channel: p.channel || 'direct',
        answers: dr.answers,
        paymentStatus: 'pending',
        paymentMethod: null,
        amount: 0,
        opinion: '',
        qualityNotes: []
      };
      d.consultations.unshift(cs);
      delete d.drafts[p.id];
      id = cs.id;
    });
    if (id) go('#/pay/' + id);
  }

  /* ---------------- الدفع (FR-23 / FR-24) ---------------- */

  function renderPayment(id) {
    var d = db();
    var cs = E.consultationById(d, id);
    if (!cs) { go('#/home'); return; }
    bottomNav(null);
    var free = E.freeEligibility(d, cs.patientId);
    var selected = free.eligible ? 'free' : null;

    var options = U.el('div', { class: 'stack' });
    function paint() {
      U.clear(options);
      if (free.eligible) {
        options.appendChild(U.el('button', {
          class: 'wallet' + (selected === 'free' ? ' is-active' : ''), type: 'button',
          onclick: function () { selected = 'free'; paint(); }
        }, [
          U.el('span', { class: 'wallet__icon', text: '🎁' }),
          U.el('span', { class: 'grow' }, [
            U.el('div', { text: 'استشارة مجانية' }),
            U.el('div', { class: 'small muted', text: free.mode === 'total_cap' ? 'ضمن أول ' + U.num(free.cap) + ' مستخدم' : 'ضمن أول ' + U.num(free.cap) + ' استشارتين لك' })
          ])
        ]));
      }
      S.WALLETS.forEach(function (w) {
        options.appendChild(U.el('button', {
          class: 'wallet' + (selected === w.id ? ' is-active' : ''), type: 'button',
          disabled: w.phase2 ? 'disabled' : null,
          onclick: function () { if (!w.phase2) { selected = w.id; paint(); } }
        }, [
          U.el('span', { class: 'wallet__icon', text: w.name.slice(0, 1) }),
          U.el('span', { class: 'grow' }, [
            U.el('div', { text: w.name }),
            U.el('div', { class: 'small muted', text: w.hint })
          ])
        ]));
      });
    }
    paint();

    U.mount(view, page('إتمام الطلب', 'الحالة ' + cs.id, [
      U.el('div', { class: 'card stack' }, [
        U.el('div', { class: 'row row--between' }, [
          U.el('span', { text: 'رسم الاستشارة' }),
          U.el('b', { text: free.eligible ? 'مجاناً' : U.money(d.settings.consultFee, d.settings.currency) })
        ]),
        U.el('div', { class: 'small muted', text: 'يُخصم مبلغ الاستشارة لاحقاً من كلفة العلاج داخل العيادة الشريكة عند استخدام رمز الخصم.' })
      ]),
      U.el('div', { class: 'card stack' }, [
        U.el('h3', { text: 'طريقة الدفع' }),
        options,
        U.el('button', {
          class: 'btn btn--gold btn--block', text: 'تأكيد وإرسال الحالة للطبيب',
          onclick: function () {
            if (!selected) { U.toast('اختر طريقة الدفع', 'error'); return; }
            payAndRoute(cs.id, selected);
          }
        }),
        U.el('button', {
          class: 'btn btn--ghost btn--block btn--sm', text: 'محاكاة فشل الدفع (للاختبار)',
          onclick: function () {
            S.update(function (dd) {
              var c = E.consultationById(dd, cs.id);
              if (c) c.paymentStatus = 'failed';
            });
            U.toast('فشلت عملية الدفع — يمكنك إعادة المحاولة', 'error');
            renderPayment(cs.id);
          }
        })
      ]),
      cs.paymentStatus === 'failed' ? U.el('div', { class: 'alert alert--danger', text: 'آخر محاولة دفع لم تكتمل. لم يُخصم أي مبلغ — أعد المحاولة.' }) : null
    ]));
  }

  function payAndRoute(id, method) {
    var result = { assigned: null, code: null };
    S.update(function (d) {
      var cs = E.consultationById(d, id);
      if (!cs) return;
      var patient = E.patientById(d, cs.patientId);
      var isFree = method === 'free';
      cs.paymentStatus = 'paid';
      cs.paymentMethod = method;
      cs.amount = isFree ? 0 : d.settings.consultFee;
      cs.paidAt = Date.now();
      cs.code = S.makeCode();
      cs.status = 'new';
      if (isFree) d.settings.freeUsed += 1;

      d.codes.push({
        id: S.uid('CD-'), value: cs.code, consultationId: cs.id,
        redeemed: false, clinicId: null, redeemedAt: null, discount: 0
      });

      if (cs.amount > 0) {
        var share = Math.round(cs.amount * (d.settings.doctorSharePercent / 100));
        d.transactions.unshift({
          id: S.uid('TX-'), type: 'consultation', consultationId: cs.id, doctorId: null,
          clinicId: null, amount: cs.amount, doctorShare: share, platformShare: cs.amount - share,
          clinicDiscount: 0, settled: false, date: Date.now()
        });
      }

      var routed = E.routeConsultation(d, { specialty: cs.specialty, regionId: patient ? patient.region : null });
      if (routed.doctor) {
        cs.doctorId = routed.doctor.id;
        cs.supervisorId = routed.doctor.supervisorId;
        cs.status = 'in_review';
        var tx = d.transactions.filter(function (t) { return t.consultationId === cs.id; })[0];
        if (tx) tx.doctorId = routed.doctor.id;
        result.assigned = routed.doctor.name;
      }
      if (cs.urgent) {
        S.log(d, { who: 'النظام', role: 'system', what: 'تصعيد تلقائي لحالة طارئة ' + cs.id + ' إلى قائمة المشرفين', targetPatientId: cs.patientId });
      }
      S.log(d, { who: 'النظام', role: 'system', what: 'إسناد الحالة ' + cs.id + ' إلى ' + (result.assigned || 'قائمة الانتظار'), targetPatientId: cs.patientId });
      result.code = cs.code;
    });
    U.toast(result.assigned ? 'تم الإرسال إلى ' + result.assigned : 'تم الإرسال — بانتظار إسناد طبيب', 'ok');
    go('#/status/' + id);
  }

  /* ---------------- حالة الطلب ---------------- */

  function renderStatus(id) {
    var d = db();
    var cs = E.consultationById(d, id);
    if (!cs) { go('#/home'); return; }
    bottomNav('orders');
    var doc = E.doctorById(d, cs.doctorId);
    var clinic = doc ? E.clinicById(d, doc.clinicId) : null;
    var complaint = S.COMPLAINTS.filter(function (x) { return x.id === cs.complaintId; })[0];
    var sla = cs.urgent ? d.settings.urgentSlaMinutes + ' دقيقة' : d.settings.slaHours + ' ساعة';

    var steps = [
      { title: 'استلام الحالة', done: true, meta: U.dateTime(cs.createdAt) },
      { title: 'تأكيد الدفع', done: cs.paymentStatus === 'paid', meta: cs.paymentStatus === 'paid' ? (cs.paymentMethod === 'free' ? 'ضمن الشريحة المجانية' : 'مدفوعة') : 'بانتظار الدفع' },
      { title: 'إسناد طبيب مختص', done: !!cs.doctorId, meta: doc ? doc.name + ' — ' + doc.specialty : 'بانتظار الإسناد' },
      { title: 'كتابة الرأي الاستشاري', done: !!cs.answeredAt, meta: cs.answeredAt ? U.dateTime(cs.answeredAt) : 'الزمن الملزم: ' + sla },
      { title: 'التقرير جاهز', done: cs.status === 'answered' || cs.status === 'closed', meta: cs.status === 'answered' || cs.status === 'closed' ? 'يمكنك تنزيله وطباعته' : '—' }
    ];
    var currentIdx = steps.filter(function (s) { return s.done; }).length;

    var nodes = [
      backBtn('#/orders', 'استشاراتي'),
      U.el('div', { class: 'card stack' }, [
        U.el('div', { class: 'row row--between' }, [
          U.el('h2', { style: 'margin:0', text: (complaint ? complaint.icon + ' ' + complaint.label : 'استشارة') }),
          U.el('div', { class: 'row', style: 'gap:6px' }, [
            cs.urgent ? U.badge('طارئة', 'danger') : null,
            U.badge(E.statusLabel(cs.status), E.statusTone(cs.status))
          ])
        ]),
        U.el('div', { class: 'small muted', text: 'رقم الحالة ' + cs.id + ' · ' + U.dateTime(cs.createdAt) }),
        E.isOverdue(d, cs) ? U.el('div', { class: 'alert alert--warn', text: 'تجاوزت الحالة زمن الرد الملزم — أُبلغ فريق المشرفين وسيُعاد توجيهها لطبيب آخر.' }) : null,
        U.el('ul', { class: 'timeline' }, steps.map(function (s, i) {
          return U.el('li', { class: s.done ? 'is-done' : i === currentIdx ? 'is-current' : '' }, [
            U.el('div', { class: 'timeline__title', text: s.title }),
            U.el('div', { class: 'timeline__meta', text: s.meta })
          ]);
        }))
      ])
    ];

    if (cs.code) {
      nodes.push(U.el('div', { class: 'code-box' }, [
        U.el('div', { class: 'small', text: 'رمز الخصم داخل العيادة الشريكة' }),
        U.el('div', { class: 'code-box__value', text: cs.code }),
        U.el('div', { class: 'small', text: 'يُستخدم مرة واحدة فقط' })
      ]));
    }

    if (cs.status === 'answered' || cs.status === 'closed') {
      nodes.push(U.el('div', { class: 'row', style: 'gap:10px' }, [
        U.el('button', { class: 'btn btn--gold grow', text: 'عرض التقرير الطبي', onclick: function () { go('#/report/' + cs.id); } }),
        U.el('button', { class: 'btn btn--ghost', text: 'أقرب الأطباء', onclick: function () { go('#/doctors/' + cs.id); } })
      ]));
      nodes.push(U.el('div', { class: 'card stack' }, [
        U.el('h3', { text: 'هل لديك ملاحظة على الاستشارة؟' }),
        (function () {
          var t = U.el('textarea', { placeholder: 'اكتب ملاحظتك لفريق جودة المتابعة الطبية...' });
          return U.el('div', {}, [
            t,
            U.el('button', {
              class: 'btn btn--ghost btn--block', style: 'margin-top:8px', text: 'إرسال الملاحظة',
              onclick: function () {
                if (!t.value.trim()) { U.toast('اكتب ملاحظتك أولاً', 'error'); return; }
                S.update(function (dd) {
                  dd.complaints.unshift({
                    id: S.uid('CP-'), consultationId: cs.id, patientId: cs.patientId,
                    text: t.value.trim(), status: 'open', createdAt: Date.now()
                  });
                });
                t.value = '';
                U.toast('وصلت ملاحظتك لفريق الجودة', 'ok');
              }
            })
          ]);
        })()
      ]));
    } else if (cs.paymentStatus !== 'paid') {
      nodes.push(U.el('button', { class: 'btn btn--gold btn--block', text: 'إكمال الدفع', onclick: function () { go('#/pay/' + cs.id); } }));
    }

    if (doc) {
      nodes.push(U.el('div', { class: 'card stack' }, [
        U.el('h3', { text: 'الطبيب المسؤول' }),
        U.el('div', { text: doc.name }),
        U.el('div', { class: 'small muted', text: doc.specialty + (clinic ? ' · ' + clinic.name + ' — ' + clinic.address : '') })
      ]));
    }

    U.mount(view, U.el('div', { class: 'stack' }, nodes));
  }

  /* ---------------- التقرير (FR-19 .. FR-22) ---------------- */

  function renderReport(id) {
    var d = db();
    var cs = E.consultationById(d, id);
    if (!cs || !(cs.status === 'answered' || cs.status === 'closed')) { go('#/home'); return; }
    bottomNav('orders');
    var p = E.patientById(d, cs.patientId);
    var doc = E.doctorById(d, cs.doctorId);
    var clinic = doc ? E.clinicById(d, doc.clinicId) : null;
    var complaint = S.COMPLAINTS.filter(function (x) { return x.id === cs.complaintId; })[0];
    var a3 = cs.answers.step3 || {};
    var gov = E.govById((cs.answers.step1 || {}).region);

    function row(k, v) {
      return U.el('div', { class: 'report__row' }, [U.el('b', { text: k }), U.el('span', { text: v })]);
    }

    var report = U.el('div', { class: 'report' }, [
      U.el('div', { class: 'report__head' }, [
        U.el('div', { class: 'report__logo' }, [U.el('span', { text: '👑' }), U.el('span', { text: 'منصة التاج الذهبي' })]),
        U.el('div', { class: 'report__meta' }, [
          U.el('div', { text: 'تقرير استشارة أسنان عن بُعد' }),
          U.el('div', { text: 'رقم الحالة: ' + cs.id }),
          U.el('div', { text: 'تاريخ الإصدار: ' + U.dateTime(cs.answeredAt || Date.now()) })
        ])
      ]),
      U.el('h2', { text: 'بيانات المراجع' }),
      U.el('div', { class: 'report__grid' }, [
        row('الاسم', p.name || '—'),
        row('العمر', U.num(p.age) + ' سنة'),
        row('الجنس', p.gender === 'female' ? 'أنثى' : 'ذكر'),
        row('المحافظة', gov ? gov.name : '—'),
        row('أمراض مزمنة', p.chronic || 'لا يوجد'),
        row('حساسية دوائية', p.allergies || 'لا يوجد')
      ]),
      U.el('h2', { text: 'الشكوى والأعراض' }),
      U.el('div', { class: 'report__grid' }, [
        row('الشكوى الرئيسية', complaint ? complaint.label : '—'),
        row('السن المصاب', (cs.answers.step2 || {}).tooth || 'غير محدد'),
        row('شدة الألم', U.num(a3.painLevel) + ' / ١٠'),
        row('مدة الأعراض', a3.duration || '—'),
        row('يزداد', a3.worseWhen || '—'),
        row('تورّم / حرارة', (a3.swelling ? 'تورّم' : 'بلا تورّم') + ' · ' + (a3.fever ? 'حرارة' : 'بلا حرارة'))
      ]),
      (cs.answers.step4 && cs.answers.step4.images && cs.answers.step4.images.length)
        ? U.el('div', {}, [
            U.el('h2', { text: 'الصور المرفوعة' }),
            U.el('div', { class: 'thumbs' }, cs.answers.step4.images.map(function (src) {
              return U.el('div', { class: 'thumb' }, [U.el('img', { src: src, alt: 'صورة الحالة' })]);
            }))
          ])
        : null,
      U.el('h2', { text: 'الرأي الاستشاري' }),
      U.el('div', { class: 'report__opinion', text: cs.opinion }),
      U.el('h2', { text: 'التوجيه والخصم' }),
      U.el('div', { class: 'report__grid' }, [
        row('الطبيب المستشار', doc ? doc.name : '—'),
        row('التخصص', doc ? doc.specialty : '—'),
        row('العيادة الموصى بمراجعتها', clinic ? clinic.name : '—'),
        row('العنوان', clinic ? clinic.address : '—'),
        row('رمز الخصم التسلسلي', cs.code || '—'),
        row('قيمة الخصم', cs.amount ? U.money(cs.amount, d.settings.currency) + ' تُخصم من كلفة العلاج' : 'استشارة مجانية')
      ]),
      U.el('div', { class: 'report__legal' }, [
        U.el('b', { text: 'تنبيه طبي وقانوني إلزامي' }),
        U.el('div', { text: '«' + d.settings.legalNotice + '»' }),
        U.el('div', { style: 'margin-top:6px', text: 'الجهة المنسوب إليها: ' + d.settings.legalSource })
      ]),
      U.el('div', { class: 'report__sign' }, [
        U.el('div', {}, [U.el('div', { text: 'الطبيب المستشار' }), U.el('b', { text: doc ? doc.name : '—' })]),
        U.el('div', {}, [U.el('div', { text: 'رمز التحقق' }), U.el('b', { text: cs.code || '—' })])
      ])
    ]);

    U.mount(view, U.el('div', { class: 'stack' }, [
      U.el('div', { class: 'row no-print', style: 'gap:8px' }, [
        backBtn('#/status/' + cs.id, 'حالة الطلب'),
        U.el('button', { class: 'btn btn--gold grow', text: '⬇️ تنزيل / طباعة PDF', onclick: function () { window.print(); } })
      ]),
      report,
      U.el('button', {
        class: 'btn btn--ghost btn--block no-print', text: 'أقرب عيادة لحالتي',
        onclick: function () { go('#/doctors/' + cs.id); }
      })
    ]));
  }

  /* ---------------- أقرب الأطباء وحجز موعد (FR-11) ---------------- */

  function renderDoctors(id) {
    var d = db();
    var cs = E.consultationById(d, id);
    if (!cs) { go('#/home'); return; }
    bottomNav('orders');
    var p = E.patientById(d, cs.patientId);
    var ranked = E.rankDoctors(d, { specialty: cs.specialty, regionId: p.region }).slice(0, 5);

    U.mount(view, U.el('div', { class: 'stack' }, [
      backBtn('#/status/' + cs.id, 'حالة الطلب'),
      U.el('h1', { text: 'أقرب الأطباء المناسبين' }),
      U.el('p', { class: 'muted small', text: 'مرتّبة حسب التخصص ثم المسافة من محافظتك ثم حجم العمل الحالي.' }),
      U.el('div', { class: 'stack' }, ranked.map(function (r) {
        return U.el('div', { class: 'card stack' }, [
          U.el('div', { class: 'row row--between' }, [
            U.el('div', {}, [
              U.el('div', { class: 'list-item__title', text: r.doctor.name }),
              U.el('div', { class: 'list-item__meta', text: r.doctor.specialty + ' · ' + (r.clinic ? r.clinic.name : '—') })
            ]),
            U.badge('★ ' + (r.doctor.rating || '—'), 'gold')
          ]),
          U.el('div', { class: 'small muted', text: (r.clinic ? r.clinic.address + ' · ' : '') + 'يبعد نحو ' + U.num(r.distanceKm) + ' كم' }),
          U.el('button', {
            class: 'btn btn--ghost btn--sm', text: 'حجز موعد مراجعة',
            onclick: function () { bookModal(cs, r.doctor); }
          })
        ]);
      }))
    ]));
  }

  function bookModal(cs, doctor) {
    var dateInput = U.el('input', { type: 'date' });
    var timeInput = U.el('input', { type: 'time', value: '10:00' });
    var m = U.modal({
      title: 'حجز موعد مع ' + doctor.name,
      body: U.el('div', { class: 'stack' }, [
        U.el('label', { class: 'field' }, [U.el('span', { class: 'field__label', text: 'التاريخ' }), dateInput]),
        U.el('label', { class: 'field' }, [U.el('span', { class: 'field__label', text: 'الوقت' }), timeInput]),
        U.el('p', { class: 'small muted', text: 'الموعد تأكيد مبدئي — تتواصل العيادة معك لتثبيته.' })
      ]),
      actions: [
        U.el('button', { class: 'btn btn--ghost', text: 'إلغاء', onclick: function () { m.close(); } }),
        U.el('button', {
          class: 'btn btn--gold', text: 'تأكيد الحجز',
          onclick: function () {
            if (!dateInput.value) { U.toast('اختر التاريخ', 'error'); return; }
            S.update(function (d) {
              var c = E.consultationById(d, cs.id);
              if (c) c.appointment = { doctorId: doctor.id, when: dateInput.value + ' ' + timeInput.value, bookedAt: Date.now() };
              S.log(d, { who: 'المريض', role: 'patient', what: 'حجز موعد مع ' + doctor.name + ' للحالة ' + cs.id, targetPatientId: cs.patientId });
            });
            m.close();
            U.toast('تم تسجيل الموعد ✅', 'ok');
          }
        })
      ]
    });
  }

  /* ---------------- استشاراتي وحسابي ---------------- */

  function renderOrders() {
    var d = db(), p = me();
    bottomNav('orders');
    var mine = d.consultations.filter(function (c) { return c.patientId === p.id; });
    U.mount(view, page('استشاراتي', 'كل استشاراتك وتقاريرك السابقة محفوظة في حسابك.', [
      mine.length ? U.el('div', { class: 'stack' }, mine.map(consultCard)) : U.empty('لا توجد استشارات بعد.', '📋')
    ]));
  }

  function renderProfile() {
    var d = db(), p = me();
    bottomNav('profile');
    var name = U.el('input', { type: 'text', value: p.name || '' });
    var age = U.el('input', { type: 'tel', value: p.age || '' });
    var region = U.el('select', {}, S.GOVERNORATES.map(function (g) { return U.el('option', { value: g.id, text: g.name }); }));
    region.value = p.region || 'baghdad';
    var chronic = U.el('input', { type: 'text', value: p.chronic || '' });
    var allergies = U.el('input', { type: 'text', value: p.allergies || '' });

    U.mount(view, page('حسابي', p.phone, [
      U.el('div', { class: 'card stack' }, [
        U.el('label', { class: 'field' }, [U.el('span', { class: 'field__label', text: 'الاسم' }), name]),
        U.el('label', { class: 'field' }, [U.el('span', { class: 'field__label', text: 'العمر' }), age]),
        U.el('label', { class: 'field' }, [U.el('span', { class: 'field__label', text: 'المحافظة' }), region]),
        U.el('label', { class: 'field' }, [U.el('span', { class: 'field__label', text: 'أمراض مزمنة' }), chronic]),
        U.el('label', { class: 'field' }, [U.el('span', { class: 'field__label', text: 'حساسية دوائية' }), allergies]),
        U.el('button', {
          class: 'btn btn--gold btn--block', text: 'حفظ التعديلات',
          onclick: function () {
            S.update(function (dd) {
              var pp = E.patientById(dd, p.id);
              if (pp) {
                pp.name = name.value.trim();
                pp.age = Number(U.normalizeDigits(age.value)) || pp.age;
                pp.region = region.value;
                pp.chronic = chronic.value.trim();
                pp.allergies = allergies.value.trim();
              }
            });
            U.toast('تم الحفظ', 'ok');
            header();
          }
        })
      ]),
      U.el('div', { class: 'card stack' }, [
        U.el('h3', { text: 'الخصوصية' }),
        U.el('p', { class: 'small muted', text: 'يصل إلى بياناتك الطبيب المسند لحالتك وفريق جودة المتابعة فقط، وكل اطّلاع يُسجَّل في سجل التدقيق.' })
      ])
    ]));
  }

  /* ---------------- الموجّه ---------------- */

  function route() {
    header();
    var hash = location.hash || '#/home';
    var parts = hash.replace('#/', '').split('/');
    var name = parts[0] || 'home';
    if (!me() && name !== 'login') { renderLogin(); return; }

    switch (name) {
      case 'login': me() ? go('#/home') : renderLogin(); break;
      case 'home': renderHome(); break;
      case 'consult': renderConsult(parts[1]); break;
      case 'pay': renderPayment(parts[1]); break;
      case 'status': renderStatus(parts[1]); break;
      case 'report': renderReport(parts[1]); break;
      case 'doctors': renderDoctors(parts[1]); break;
      case 'orders': renderOrders(); break;
      case 'profile': renderProfile(); break;
      default: renderHome();
    }
  }

  window.addEventListener('hashchange', route);
  U.roleBar('patient');
  route();
})();
