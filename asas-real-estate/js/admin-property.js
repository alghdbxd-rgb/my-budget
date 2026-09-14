/* =============================================================
   العقارات — التسجيل الكامل (معلومات + صور/فيديو + موقع)
   وشاشة «نقاط البيع» للعقارات الموجودة تحت يد المكتب
   ============================================================= */
(function () {
  'use strict';

  var U = window.AS.ui;
  var S = window.AS.store;
  var M = window.AS.media;
  var V = window.AS.views;
  var el = U.el;

  window.AS.screens = window.AS.screens || {};

  /* ---------- نموذج العقار ---------- */

  function blank() {
    return {
      code: '', title: '', type: 'house', purpose: 'sale', status: 'available',
      gov: 'baghdad', area: '', address: '', lat: null, lng: null,
      space: 0, frontage: 0, rooms: 0, baths: 0, floors: 1, floorNo: 0, age: 0,
      finish: 'جيد', furnished: false, deedType: 'طابو صرف',
      price: 0, currency: S.db.settings.mainCurrency, rentPeriod: 'yearly', negotiable: true,
      ownerName: '', ownerPhone: '', notes: '',
      inHand: true, exclusive: false, features: [], media: []
    };
  }

  /** يستخرج الإحداثيات من رابط خرائط جوجل أو من نص «lat,lng» */
  function parseCoords(text) {
    var t = U.normalizeDigits(String(text || ''));
    var m = t.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
      || t.match(/[?&]query=(-?\d+\.\d+),\s*(-?\d+\.\d+)/)
      || t.match(/[?&]q=(-?\d+\.\d+),\s*(-?\d+\.\d+)/)
      || t.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/)
      || t.match(/^\s*(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)\s*$/);
    if (!m) return null;
    return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
  }

  function propertyForm(existing, onSaved) {
    var p = Object.assign(blank(), existing || {});
    p.features = (p.features || []).slice();
    p.media = (p.media || []).slice();
    var isNew = !p.id;

    var f = {};
    f.title = el('input', { type: 'text', value: p.title, placeholder: 'مثال: دار طابقين — زيونة قرب ساحة المنتصر' });
    f.type = U.select(S.TYPES.map(function (t) { return { value: t.id, label: t.icon + ' ' + t.name }; }), p.type);
    f.purpose = U.select(S.PURPOSES.map(function (t) { return { value: t.id, label: t.name }; }), p.purpose);
    f.status = U.select(S.PROP_STATUS.map(function (t) { return { value: t.id, label: t.name }; }), p.status);

    /* الموقع */
    var areaList = el('datalist', { id: 'areas-list' });
    f.gov = U.select(S.GOVS.map(function (g) { return { value: g.id, label: g.name }; }), p.gov, {
      onchange: function () { fillAreas(); }
    });
    f.area = el('input', { type: 'text', value: p.area, placeholder: 'المنطقة / الحي', list: 'areas-list' });
    f.address = el('input', { type: 'text', value: p.address, placeholder: 'أقرب نقطة دالة، رقم المحلة والزقاق' });
    f.lat = el('input', { type: 'text', inputmode: 'decimal', value: p.lat || '', placeholder: 'خط العرض' });
    f.lng = el('input', { type: 'text', inputmode: 'decimal', value: p.lng || '', placeholder: 'خط الطول' });
    var mapHost = el('div');

    function fillAreas() {
      U.clear(areaList);
      var g = S.byId(S.GOVS, f.gov.value);
      (g ? g.areas : []).forEach(function (a) { areaList.appendChild(el('option', { value: a })); });
    }
    fillAreas();

    function refreshMap() {
      var lat = U.toNum(f.lat.value), lng = U.toNum(f.lng.value);
      if (!lat || !lng) { U.mount(mapHost, el('div', { class: 'panel small center muted', text: 'حدّد الموقع لتظهر الخريطة هنا' })); return; }
      U.mount(mapHost, V.mapBox({ lat: lat, lng: lng }, 190));
    }
    f.lat.addEventListener('change', refreshMap);
    f.lng.addEventListener('change', refreshMap);

    var pasteInp = el('input', { type: 'text', placeholder: 'الصق رابط خرائط جوجل هنا…' });
    pasteInp.addEventListener('input', function () {
      var c = parseCoords(pasteInp.value);
      if (c) {
        f.lat.value = c.lat; f.lng.value = c.lng;
        refreshMap();
        U.toast('تم استخراج الموقع من الرابط', 'ok');
        pasteInp.value = '';
      }
    });

    var gpsBtn = el('button', {
      class: 'btn btn--ghost btn--sm', type: 'button', text: '📍 موقعي الحالي',
      onclick: function () {
        if (!navigator.geolocation) return U.toast('المتصفح لا يدعم تحديد الموقع', 'err');
        gpsBtn.textContent = '… جاري التحديد';
        navigator.geolocation.getCurrentPosition(function (pos) {
          f.lat.value = pos.coords.latitude.toFixed(6);
          f.lng.value = pos.coords.longitude.toFixed(6);
          gpsBtn.textContent = '📍 موقعي الحالي';
          refreshMap();
          U.toast('تم تسجيل موقعك الحالي', 'ok');
        }, function () {
          gpsBtn.textContent = '📍 موقعي الحالي';
          U.toast('تعذّر تحديد الموقع — تأكد من السماح للمتصفح', 'err');
        }, { enableHighAccuracy: true, timeout: 10000 });
      }
    });

    /* المواصفات */
    f.space = el('input', { type: 'text', inputmode: 'numeric', value: p.space || '', placeholder: 'م²' });
    f.frontage = el('input', { type: 'text', inputmode: 'numeric', value: p.frontage || '' });
    f.rooms = el('input', { type: 'text', inputmode: 'numeric', value: p.rooms || '' });
    f.baths = el('input', { type: 'text', inputmode: 'numeric', value: p.baths || '' });
    f.floors = el('input', { type: 'text', inputmode: 'numeric', value: p.floors || '' });
    f.floorNo = el('input', { type: 'text', inputmode: 'numeric', value: p.floorNo || '' });
    f.age = el('input', { type: 'text', inputmode: 'numeric', value: p.age || '' });
    f.finish = U.select(S.FINISH.map(function (x) { return { value: x, label: x }; }), p.finish);
    f.deedType = U.select(['طابو صرف', 'سند عقاري', 'ملك صرف', 'مقاطعة زراعية', 'تمليك دولة', 'وكالة'].map(function (x) {
      return { value: x, label: x };
    }), p.deedType);
    f.furnished = el('input', { type: 'checkbox' });
    f.furnished.checked = !!p.furnished;

    var featureChips = el('div', { class: 'chips' }, S.FEATURES.map(function (name) {
      var on = p.features.indexOf(name) !== -1;
      var b = el('button', { class: 'chip' + (on ? ' is-on' : ''), type: 'button', text: name });
      b.addEventListener('click', function () {
        var i = p.features.indexOf(name);
        if (i === -1) p.features.push(name); else p.features.splice(i, 1);
        b.classList.toggle('is-on');
      });
      return b;
    }));

    /* السعر */
    f.price = el('input', { type: 'text', inputmode: 'numeric', value: p.price || '', placeholder: 'السعر' });
    f.currency = U.select([{ value: 'USD', label: '$ دولار' }, { value: 'IQD', label: 'د.ع دينار' }], p.currency);
    f.rentPeriod = U.select([{ value: 'monthly', label: 'شهري' }, { value: 'yearly', label: 'سنوي' }], p.rentPeriod);
    f.negotiable = el('input', { type: 'checkbox' });
    f.negotiable.checked = !!p.negotiable;

    /* المالك */
    f.ownerName = el('input', { type: 'text', value: p.ownerName, placeholder: 'اسم صاحب العقار' });
    f.ownerPhone = el('input', { type: 'tel', value: p.ownerPhone, placeholder: '07XXXXXXXXX' });
    f.notes = el('textarea', { placeholder: 'ملاحظات داخلية لا تظهر للزبون…' });
    f.notes.value = p.notes || '';

    /* نقطة بيع */
    f.inHand = el('input', { type: 'checkbox' });
    f.inHand.checked = p.inHand !== false;
    f.exclusive = el('input', { type: 'checkbox' });
    f.exclusive.checked = !!p.exclusive;

    /* ---------- الوسائط ---------- */

    var galleryHost = el('div', { class: 'gallery' });
    var fileInput = el('input', { type: 'file', accept: 'image/*,video/*', multiple: 'multiple', style: 'display:none' });
    var statusLine = el('div', { class: 'small muted' });

    function paintGallery() {
      U.clear(galleryHost);
      if (!p.media.length) {
        galleryHost.appendChild(el('div', { class: 'small muted', text: 'لا توجد صور أو فيديو بعد.' }));
      }
      p.media.forEach(function (m, i) {
        var item = el('div', { class: 'gallery__item' });
        if (m.kind === 'video') {
          item.appendChild(el('div', { style: 'display:grid;place-items:center;height:100%;background:#0b1f1a;color:#fff;font-size:1.4rem', text: '▶' }));
        } else {
          item.appendChild(V.mediaNode(m, false));
        }
        item.appendChild(el('span', { class: 'kind', text: m.kind === 'video' ? 'فيديو' : (m.src === 'link' ? 'رابط' : 'صورة') }));
        item.appendChild(el('button', {
          class: 'del', type: 'button', title: 'حذف', text: '✕',
          onclick: function (e) {
            e.stopPropagation();
            M.del(m);
            p.media.splice(i, 1);
            paintGallery();
          }
        }));
        if (m.kind === 'image') {
          item.appendChild(el('button', {
            class: 'cover' + (m.cover ? ' is-on' : ''), type: 'button', text: m.cover ? 'الغلاف' : 'تعيين غلاف',
            onclick: function (e) {
              e.stopPropagation();
              p.media.forEach(function (x) { x.cover = false; });
              m.cover = true;
              paintGallery();
            }
          }));
        }
        galleryHost.appendChild(item);
      });
      var total = p.media.reduce(function (s, m) { return s + (m.size || 0); }, 0);
      statusLine.textContent = p.media.length
        ? U.num(p.media.length) + ' ملف · الحجم بعد الضغط ' + M.humanSize(total)
        : '';
    }

    function handleFiles(files) {
      var list = Array.prototype.slice.call(files || []);
      if (!list.length) return;
      U.toast('جاري معالجة ' + U.num(list.length) + ' ملف…');
      var chain = Promise.resolve();
      list.forEach(function (file) {
        chain = chain.then(function () {
          return M.add(file).then(function (ref) {
            if (ref.kind === 'image' && !p.media.some(function (x) { return x.cover; })) ref.cover = true;
            p.media.push(ref);
            paintGallery();
          }).catch(function (err) {
            U.toast(err && err.message === 'video-needs-idb'
              ? 'حفظ الفيديو يحتاج فتح الموقع عبر خادم — استخدم رابط يوتيوب/درايف بدلاً منه'
              : 'تعذّر إضافة: ' + file.name, 'err');
          });
        });
      });
      chain.then(function () { U.toast('تمت إضافة الوسائط', 'ok'); });
    }

    fileInput.addEventListener('change', function () { handleFiles(fileInput.files); fileInput.value = ''; });

    var drop = el('div', { class: 'dropzone' }, [
      el('div', { style: 'font-size:1.6rem', text: '📷 🎬' }),
      el('div', { html: '<b>اسحب الصور والفيديو هنا</b> أو اضغط للاختيار من الجهاز' }),
      el('div', { class: 'tiny', text: 'الصور تُضغط تلقائياً لتوفير المساحة' })
    ]);
    drop.addEventListener('click', function () { fileInput.click(); });
    ['dragenter', 'dragover'].forEach(function (ev) {
      drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('is-over'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('is-over'); });
    });
    drop.addEventListener('drop', function (e) { handleFiles(e.dataTransfer.files); });

    var linkInp = el('input', { type: 'url', placeholder: 'رابط فيديو يوتيوب / درايف أو رابط صورة…' });
    var linkBtn = el('button', {
      class: 'btn btn--ghost', type: 'button', text: '➕ إضافة الرابط',
      onclick: function () {
        var ref = M.addLink(linkInp.value);
        if (!ref) return U.toast('اكتب رابطاً صحيحاً', 'err');
        p.media.push(ref);
        linkInp.value = '';
        paintGallery();
      }
    });

    paintGallery();

    /* ---------- التجميع ---------- */

    function collect() {
      return {
        id: p.id,
        code: p.code || S.nextCode('property'),
        title: f.title.value.trim(),
        type: f.type.value, purpose: f.purpose.value, status: f.status.value,
        gov: f.gov.value, area: f.area.value.trim(), address: f.address.value.trim(),
        lat: U.toNum(f.lat.value) || null, lng: U.toNum(f.lng.value) || null,
        space: U.toNum(f.space.value), frontage: U.toNum(f.frontage.value),
        rooms: U.toNum(f.rooms.value), baths: U.toNum(f.baths.value),
        floors: U.toNum(f.floors.value) || 1, floorNo: U.toNum(f.floorNo.value), age: U.toNum(f.age.value),
        finish: f.finish.value, deedType: f.deedType.value, furnished: f.furnished.checked,
        price: U.toNum(f.price.value), currency: f.currency.value,
        rentPeriod: f.rentPeriod.value, negotiable: f.negotiable.checked,
        ownerName: f.ownerName.value.trim(), ownerPhone: f.ownerPhone.value.trim(),
        notes: f.notes.value.trim(),
        inHand: f.inHand.checked, exclusive: f.exclusive.checked,
        features: p.features, media: p.media,
        createdAt: p.createdAt
      };
    }

    var body = el('div', { class: 'stack' }, [
      areaList,
      section('١. المعلومات الأساسية', el('div', { class: 'grid grid--2' }, [
        U.field('عنوان العقار (كما يظهر للزبون)', f.title),
        el('div', { class: 'grid grid--3' }, [
          U.field('النوع', f.type),
          U.field('الغرض', f.purpose),
          U.field('الحالة', f.status)
        ])
      ])),

      section('٢. الموقع', el('div', { class: 'stack-sm' }, [
        el('div', { class: 'grid grid--3' }, [
          U.field('المحافظة', f.gov),
          U.field('المنطقة', f.area),
          U.field('العنوان التفصيلي', f.address)
        ]),
        el('div', { class: 'grid grid--2' }, [
          U.field('لصق رابط خرائط جوجل', pasteInp, 'انسخ الرابط من تطبيق الخرائط والصقه — تُستخرج الإحداثيات تلقائياً'),
          el('div', { class: 'row', style: 'gap:8px;align-items:flex-end' }, [
            el('div', { class: 'grow' }, [U.field('خط العرض', f.lat)]),
            el('div', { class: 'grow' }, [U.field('خط الطول', f.lng)]),
            gpsBtn
          ])
        ]),
        mapHost
      ])),

      section('٣. الصور والفيديو', el('div', { class: 'stack-sm' }, [
        drop, fileInput,
        el('div', { class: 'row', style: 'gap:8px' }, [el('div', { class: 'grow' }, [linkInp]), linkBtn]),
        galleryHost,
        statusLine
      ])),

      section('٤. المواصفات', el('div', { class: 'stack-sm' }, [
        el('div', { class: 'grid grid--4' }, [
          U.field('المساحة (م²)', f.space),
          U.field('طول الواجهة (م)', f.frontage),
          U.field('عدد الغرف', f.rooms),
          U.field('عدد الحمامات', f.baths)
        ]),
        el('div', { class: 'grid grid--4' }, [
          U.field('عدد الطوابق', f.floors),
          U.field('رقم الطابق', f.floorNo),
          U.field('عمر البناء (سنة)', f.age),
          U.field('التشطيب', f.finish)
        ]),
        el('div', { class: 'grid grid--3' }, [
          U.field('نوع الملكية', f.deedType),
          el('label', { class: 'switch', style: 'margin-top:22px' }, [f.furnished, el('span', { text: 'مفروش' })]),
          el('label', { class: 'switch', style: 'margin-top:22px' }, [f.negotiable, el('span', { text: 'السعر قابل للتفاوض' })])
        ]),
        U.field('المزايا', featureChips)
      ])),

      section('٥. السعر والمالك', el('div', { class: 'stack-sm' }, [
        el('div', { class: 'grid grid--4' }, [
          U.field('السعر', f.price),
          U.field('العملة', f.currency),
          U.field('فترة الإيجار', f.rentPeriod, 'تُستخدم مع عروض الإيجار فقط'),
          U.field('', el('div'))
        ]),
        el('div', { class: 'grid grid--2' }, [
          U.field('اسم المالك', f.ownerName),
          U.field('هاتف المالك', f.ownerPhone)
        ]),
        U.field('ملاحظات داخلية', f.notes)
      ])),

      section('٦. نقطة البيع', el('div', { class: 'row', style: 'gap:18px' }, [
        el('label', { class: 'switch' }, [f.inHand, el('span', { text: 'العقار تحت يدنا (يظهر في نقاط البيع)' })]),
        el('label', { class: 'switch' }, [f.exclusive, el('span', { text: 'تسويق حصري' })])
      ]))
    ]);

    function section(title, content) {
      return el('div', { class: 'card' }, [
        el('div', { class: 'card__head' }, [el('h3', { class: 'card__title', text: title })]),
        content
      ]);
    }

    var m = U.modal({
      title: isNew ? '🏠 تسجيل عقار جديد' : 'تعديل العقار ' + (p.code || ''),
      body: body,
      wide: true,
      foot: [
        el('button', {
          class: 'btn', type: 'button', text: '💾 حفظ العقار',
          onclick: function () {
            var data = collect();
            if (!data.title) return U.toast('اكتب عنوان العقار', 'err');
            var saved = S.upsert('properties', data);
            m.close();
            U.toast('تم حفظ العقار ' + saved.code, 'ok');
            if (onSaved) onSaved(saved, isNew);
          }
        }),
        el('button', { class: 'btn btn--ghost', type: 'button', text: 'إلغاء', onclick: function () { m.close(); } })
      ]
    });

    refreshMap();
    return m;
  }

  /* ---------- شاشة العقارات ---------- */

  function propertyRow(p, rerender) {
    var cover = S.coverOf(p);
    var thumb = el('div', { class: 'list-row__thumb' });
    if (cover) thumb.appendChild(V.mediaNode(cover, false));
    else thumb.appendChild(el('span', { text: S.typeIcon(p.type) }));

    var st = S.statusOf(S.PROP_STATUS, p.status);
    var offersCount = S.db.offers.filter(function (o) { return o.propertyId === p.id; }).length;

    return el('div', { class: 'list-row' }, [
      thumb,
      el('div', { class: 'grow' }, [
        el('div', { class: 'row', style: 'gap:6px' }, [
          el('span', { class: 'tiny mono muted', text: p.code }),
          U.badge(st.name, st.tone),
          p.exclusive ? U.badge('حصري', 'gold') : null,
          S.hasVideo(p) ? U.badge('▶ فيديو', 'muted') : null,
          (p.lat && p.lng) ? U.badge('📍 موقع', 'muted') : null
        ]),
        el('div', { style: 'font-weight:700', text: p.title }),
        el('div', { class: 'small muted', text: V.locText(p) + ' · ' + S.typeName(p.type) + (p.space ? ' · ' + U.num(p.space) + ' م²' : '') })
      ]),
      el('div', { class: 'nowrap', style: 'text-align:left' }, [
        el('div', { style: 'font-weight:800', text: U.money(p.price, p.currency) }),
        el('div', { class: 'tiny muted', text: offersCount ? U.num(offersCount) + ' عرض مرتبط' : 'بلا عروض' })
      ]),
      el('div', { class: 'row', style: 'gap:6px;flex-wrap:nowrap' }, [
        el('button', { class: 'btn btn--ghost btn--sm', type: 'button', text: '✏️', title: 'تعديل', onclick: function () { propertyForm(p, rerender); } }),
        el('button', {
          class: 'btn btn--ghost btn--sm', type: 'button', text: '🏷️', title: 'إنشاء عرض لهذا العقار',
          onclick: function () { window.AS.screens.newOfferFor(p.id, rerender); }
        }),
        el('button', {
          class: 'btn btn--ghost btn--sm', type: 'button', text: '🗑️', title: 'حذف',
          onclick: function () {
            U.confirm('حذف العقار «' + p.title + '» وكل عروضه؟', function () {
              (p.media || []).forEach(function (m) { M.del(m); });
              S.db.offers.filter(function (o) { return o.propertyId === p.id; })
                .forEach(function (o) { S.remove('offers', o.id); });
              S.remove('properties', p.id);
              U.toast('تم الحذف', 'ok');
              rerender();
            }, 'نعم، احذف', 'danger');
          }
        })
      ])
    ]);
  }

  window.AS.screens.properties = function (host, ctx) {
    var state = ctx.state.properties = ctx.state.properties || { text: '', type: '', gov: '', status: '', inHandOnly: false };

    function render() {
      var db = S.db;
      var text = state.text.trim().toLowerCase();
      var list = db.properties.filter(function (p) {
        if (state.type && p.type !== state.type) return false;
        if (state.gov && p.gov !== state.gov) return false;
        if (state.status && p.status !== state.status) return false;
        if (state.inHandOnly && !p.inHand) return false;
        if (!text) return true;
        return [p.code, p.title, p.address, p.area, S.govName(p.gov), p.ownerName, p.ownerPhone, p.notes]
          .join(' ').toLowerCase().indexOf(text) !== -1;
      });

      var search = el('input', { type: 'search', value: state.text, placeholder: 'ابحث بالكود أو العنوان أو اسم المالك…' });
      var t;
      search.addEventListener('input', function () {
        clearTimeout(t);
        t = setTimeout(function () { state.text = search.value; render(); }, 180);
      });

      var typeSel = U.select([{ value: '', label: 'كل الأنواع' }].concat(S.TYPES.map(function (x) { return { value: x.id, label: x.name }; })), state.type,
        { onchange: function (e) { state.type = e.target.value; render(); } });
      var govSel = U.select([{ value: '', label: 'كل المحافظات' }].concat(S.GOVS.map(function (x) { return { value: x.id, label: x.name }; })), state.gov,
        { onchange: function (e) { state.gov = e.target.value; render(); } });
      var statSel = U.select([{ value: '', label: 'كل الحالات' }].concat(S.PROP_STATUS.map(function (x) { return { value: x.id, label: x.name }; })), state.status,
        { onchange: function (e) { state.status = e.target.value; render(); } });

      U.mount(host, el('div', { class: 'stack' }, [
        el('div', { class: 'main__head' }, [
          el('div', {}, [
            el('h1', { text: 'العقارات' }),
            el('p', { class: 'muted small', text: 'سجّل كل عقار بمعلوماته وصوره وفيديوه وموقعه على الخريطة.' })
          ]),
          el('button', {
            class: 'btn', type: 'button', text: '➕ عقار جديد',
            onclick: function () { propertyForm(null, function (saved, isNew) { render(); if (isNew) askPublish(saved, render); }); }
          })
        ]),
        el('div', { class: 'toolbar' }, [
          el('div', { class: 'searchbox grow' }, [search]),
          typeSel, govSel, statSel,
          el('label', { class: 'switch' }, [
            (function () {
              var c = el('input', { type: 'checkbox' });
              c.checked = state.inHandOnly;
              c.addEventListener('change', function () { state.inHandOnly = c.checked; render(); });
              return c;
            })(),
            el('span', { text: 'تحت يدنا فقط' })
          ])
        ]),
        el('div', { class: 'small muted', text: U.num(list.length) + ' عقار من أصل ' + U.num(db.properties.length) }),
        list.length
          ? el('div', {}, list.map(function (p) { return propertyRow(p, render); }))
          : U.empty('ما في عقار مطابق — سجّل عقارك الأول', '🏠')
      ]));
    }

    render();
  };

  function askPublish(prop, done) {
    var m = U.modal({
      title: 'تم حفظ العقار ✅',
      body: el('p', { text: 'تحب تنشر عرضاً لهذا العقار الآن حتى يظهر في شاشة العروض والبحث؟' }),
      foot: [
        el('button', {
          class: 'btn', type: 'button', text: '🏷️ نعم، انشر عرضاً',
          onclick: function () { m.close(); window.AS.screens.newOfferFor(prop.id, done); }
        }),
        el('button', { class: 'btn btn--ghost', type: 'button', text: 'لاحقاً', onclick: function () { m.close(); } })
      ]
    });
  }

  /* ---------- نقاط البيع ---------- */

  window.AS.screens.stock = function (host, ctx) {
    var state = ctx.state.stock = ctx.state.stock || { text: '', status: '' };

    function render() {
      var db = S.db;
      var text = state.text.trim().toLowerCase();
      var stock = db.properties.filter(function (p) { return p.inHand; }).filter(function (p) {
        if (state.status && p.status !== state.status) return false;
        if (!text) return true;
        return [p.code, p.title, p.area, S.govName(p.gov), p.ownerName].join(' ').toLowerCase().indexOf(text) !== -1;
      });

      var byStatus = {};
      S.PROP_STATUS.forEach(function (s) { byStatus[s.id] = 0; });
      db.properties.forEach(function (p) { if (p.inHand) byStatus[p.status] = (byStatus[p.status] || 0) + 1; });

      var totalValue = db.properties.reduce(function (s, p) {
        return p.inHand && p.status !== 'sold' ? s + S.toMain(p.price, p.currency) : s;
      }, 0);

      var search = el('input', { type: 'search', value: state.text, placeholder: 'ابحث داخل نقاط البيع…' });
      var t;
      search.addEventListener('input', function () {
        clearTimeout(t);
        t = setTimeout(function () { state.text = search.value; render(); }, 180);
      });

      function card(p) {
        var st = S.statusOf(S.PROP_STATUS, p.status);
        var offers = db.offers.filter(function (o) { return o.propertyId === p.id; });
        var cover = S.coverOf(p);
        var media = el('div', { class: 'prop__media' });
        if (cover) media.appendChild(V.mediaNode(cover, false));
        else media.appendChild(el('div', { class: 'noimg', text: S.typeIcon(p.type) }));
        media.appendChild(el('div', { class: 'prop__tags' }, [
          U.badge(st.name, st.tone),
          p.exclusive ? U.badge('حصري', 'gold') : null
        ]));

        var statusSel = U.select(S.PROP_STATUS.map(function (s) { return { value: s.id, label: s.name }; }), p.status, {
          onchange: function (e) {
            p.status = e.target.value;
            S.save();
            U.toast('تم تحديث حالة ' + p.code, 'ok');
            render();
          }
        });

        return el('article', { class: 'prop' }, [
          media,
          el('div', { class: 'prop__body' }, [
            el('div', { class: 'row row--between' }, [
              el('span', { class: 'tiny mono muted', text: p.code }),
              el('span', { class: 'tiny muted', text: U.ago(p.createdAt) })
            ]),
            el('div', { class: 'prop__title', text: p.title }),
            el('div', { class: 'prop__loc', text: '📍 ' + V.locText(p) }),
            el('div', { class: 'prop__price', text: U.money(p.price, p.currency) }),
            el('div', { class: 'small muted', text: p.ownerName ? '👤 ' + p.ownerName + (p.ownerPhone ? ' · ' + p.ownerPhone : '') : 'بلا بيانات مالك' }),
            statusSel,
            el('div', { class: 'row', style: 'gap:6px' }, [
              el('button', { class: 'btn btn--ghost btn--sm grow', type: 'button', text: '✏️ تعديل', onclick: function () { propertyForm(p, render); } }),
              offers.length
                ? el('button', {
                  class: 'btn btn--ghost btn--sm grow', type: 'button', text: '👁️ العرض',
                  onclick: function () {
                    var v = S.offersView().filter(function (x) { return x.offer.id === offers[0].id; })[0];
                    if (v) V.detailModal(v, { admin: true });
                  }
                })
                : el('button', { class: 'btn btn--sm grow', type: 'button', text: '🏷️ انشر عرض', onclick: function () { window.AS.screens.newOfferFor(p.id, render); } })
            ])
          ])
        ]);
      }

      U.mount(host, el('div', { class: 'stack' }, [
        el('div', { class: 'main__head' }, [
          el('div', {}, [
            el('h1', { text: 'نقاط البيع' }),
            el('p', { class: 'muted small', text: 'كل عقار موجود تحت يد المكتب: متاح، محجوز، أو مباع.' })
          ]),
          el('button', { class: 'btn', type: 'button', text: '➕ عقار جديد', onclick: function () { propertyForm(null, function (s, isNew) { render(); if (isNew) askPublish(s, render); }); } })
        ]),
        el('div', { class: 'grid grid--4' }, [
          U.stat({ label: 'تحت اليد', value: U.num(S.db.properties.filter(function (p) { return p.inHand; }).length), icon: '📍', variant: 'brand' }),
          U.stat({ label: 'متاح', value: U.num(byStatus.available || 0), icon: '✅' }),
          U.stat({ label: 'محجوز', value: U.num(byStatus.reserved || 0), icon: '🔒' }),
          U.stat({ label: 'قيمة المخزون', value: U.moneyShort(totalValue, S.db.settings.mainCurrency), icon: '💎', variant: 'gold' })
        ]),
        el('div', { class: 'toolbar' }, [
          el('div', { class: 'searchbox grow' }, [search]),
          U.select([{ value: '', label: 'كل الحالات' }].concat(S.PROP_STATUS.map(function (x) { return { value: x.id, label: x.name }; })), state.status,
            { onchange: function (e) { state.status = e.target.value; render(); } })
        ]),
        stock.length
          ? el('div', { class: 'prop-grid' }, stock.map(card))
          : U.empty('ما في عقار تحت اليد — سجّل عقاراً وفعّل خيار «العقار تحت يدنا»', '📍')
      ]));
    }

    render();
  };

  window.AS.screens.propertyForm = propertyForm;
})();
