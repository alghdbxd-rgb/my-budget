/* =============================================================
   عناصر مشتركة: بطاقة العرض، نافذة التفاصيل، الخريطة، والبحث
   تُستخدم في صفحة العروض العامة وفي لوحة الإدارة معاً
   ============================================================= */
(function () {
  'use strict';

  var U = window.AS.ui;
  var S = window.AS.store;
  var M = window.AS.media;
  var el = U.el;

  /* ---------- الخريطة ---------- */

  function mapsLink(p) {
    if (p.lat && p.lng) return 'https://www.google.com/maps/search/?api=1&query=' + p.lat + ',' + p.lng;
    if (p.mapUrl) return p.mapUrl;
    var q = [p.address, p.area, S.govName(p.gov), 'العراق'].filter(Boolean).join(' ');
    return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q);
  }

  /** خريطة مصغّرة من OpenStreetMap (بلا مكتبات خارجية) */
  function mapBox(p, height) {
    if (!p || (!p.lat && !p.lng)) return null;
    var d = 0.006;
    var bbox = [(p.lng - d).toFixed(5), (p.lat - d / 1.7).toFixed(5), (p.lng + d).toFixed(5), (p.lat + d / 1.7).toFixed(5)].join(',');
    var src = 'https://www.openstreetmap.org/export/embed.html?bbox=' + bbox + '&layer=mapnik&marker=' + p.lat + ',' + p.lng;
    return el('div', { class: 'mapbox' }, [
      el('iframe', { src: src, loading: 'lazy', title: 'موقع العقار', style: height ? 'height:' + height + 'px' : null }),
      el('div', { class: 'mapbox__foot' }, [
        el('span', { class: 'mono muted', text: Number(p.lat).toFixed(5) + ' , ' + Number(p.lng).toFixed(5) }),
        el('a', { href: mapsLink(p), target: '_blank', rel: 'noopener', text: '🗺️ فتح في خرائط جوجل' })
      ])
    ]);
  }

  /* ---------- معرض الوسائط ---------- */

  function mediaNode(ref, controls) {
    if (ref.kind === 'video') {
      var embed = ref.src === 'link' ? M.embedUrl(ref.url) : null;
      if (embed) return el('iframe', { src: embed, allowfullscreen: 'true', style: 'width:100%;height:100%;border:0', title: ref.name || 'فيديو' });
      var v = el('video', { controls: controls === false ? null : 'controls', playsinline: 'true', preload: 'metadata' });
      M.attach(v, ref);
      return v;
    }
    var img = el('img', { alt: ref.name || 'صورة العقار', loading: 'lazy' });
    M.attach(img, ref);
    return img;
  }

  function gallery(p) {
    var media = (p.media || []).slice();
    if (!media.length) {
      return el('div', { class: 'viewer__stage' }, [
        el('div', { style: 'font-size:3rem;opacity:.5', text: S.typeIcon(p.type) })
      ]);
    }
    var stage = el('div', { class: 'viewer__stage' });
    var thumbs = el('div', { class: 'viewer__thumbs' });

    function show(i) {
      U.mount(stage, mediaNode(media[i], true));
      U.$$('button', thumbs).forEach(function (b, bi) { b.classList.toggle('is-on', bi === i); });
    }

    media.forEach(function (m, i) {
      var t = el('button', { type: 'button', title: m.kind === 'video' ? 'فيديو' : 'صورة', onclick: function () { show(i); } });
      if (m.kind === 'video') t.appendChild(el('div', { style: 'display:grid;place-items:center;height:100%;background:#0b1f1a;color:#fff;font-size:1.1rem', text: '▶' }));
      else t.appendChild(mediaNode(m, false));
      thumbs.appendChild(t);
    });

    show(0);
    return el('div', { class: 'stack-sm' }, [stage, media.length > 1 ? thumbs : null]);
  }

  /* ---------- نصوص ---------- */

  function priceText(v) {
    var o = v.offer, p = v.prop;
    var base = U.money(v.price, v.currency);
    if (o.kind === 'rent') base += ' / ' + (p.rentPeriod === 'monthly' ? 'شهرياً' : 'سنوياً');
    return base;
  }

  function locText(p) {
    return [S.govName(p.gov), p.area, p.address].filter(Boolean).join(' — ');
  }

  function shareText(v, settings) {
    var o = v.offer, p = v.prop;
    var lines = [
      '🏠 ' + (v.title || ''),
      'كود العرض: ' + o.code,
      'النوع: ' + S.typeName(p.type) + ' · ' + S.purposeName(o.kind),
      'الموقع: ' + locText(p),
      'المساحة: ' + (p.space ? U.num(p.space) + ' م²' : '—') + (p.rooms ? ' · غرف: ' + U.num(p.rooms) : ''),
      'السعر: ' + priceText(v)
    ];
    if (o.downPayment) lines.push('الدفعة الأولى: ' + U.money(o.downPayment, o.currency) + (o.installCount ? ' ثم ' + U.num(o.installCount) + ' قسط × ' + U.money(o.installAmount, o.currency) : ''));
    (o.highlights || []).forEach(function (h) { lines.push('• ' + h); });
    if (p.lat && p.lng) lines.push('الموقع على الخريطة: ' + mapsLink(p));
    if (settings) lines.push('—\n' + settings.company + ' · ' + settings.phone);
    return lines.join('\n');
  }

  /* ---------- بطاقة العرض ---------- */

  function offerCard(v, opts) {
    opts = opts || {};
    var o = v.offer, p = v.prop;
    var st = S.statusOf(S.OFFER_STATUS, o.status);
    var left = U.daysLeft(o.validUntil);

    var media = el('div', { class: 'prop__media' });
    if (v.cover) media.appendChild(mediaNode(v.cover, false));
    else media.appendChild(el('div', { class: 'noimg', text: S.typeIcon(p.type) }));

    media.appendChild(el('div', { class: 'prop__tags' }, [
      U.badge(S.purposeName(o.kind), o.kind === 'rent' ? 'info' : o.kind === 'investment' ? 'purple' : 'gold'),
      o.status !== 'active' ? U.badge(st.name, st.tone) : null,
      p.exclusive ? U.badge('حصري', 'gold') : null
    ]));
    if (S.hasVideo(p)) media.appendChild(el('div', { class: 'prop__vid', text: '▶ فيديو' }));

    var card = el('article', { class: 'prop', role: 'button', tabindex: '0' }, [
      media,
      el('div', { class: 'prop__body' }, [
        el('div', { class: 'row row--between', style: 'gap:6px' }, [
          el('span', { class: 'tiny mono muted', text: o.code }),
          left != null && left >= 0 && o.status === 'active'
            ? el('span', { class: 'tiny muted', text: 'ينتهي خلال ' + U.num(left) + ' يوم' })
            : null
        ]),
        el('div', { class: 'prop__title', text: v.title }),
        el('div', { class: 'prop__loc', text: '📍 ' + locText(p) }),
        el('div', { class: 'prop__price', text: priceText(v) }),
        el('div', { class: 'prop__meta' }, [
          el('span', { html: '📐 <b>' + (p.space ? U.num(p.space) + ' م²' : '—') + '</b>' }),
          p.rooms ? el('span', { html: '🛏️ <b>' + U.num(p.rooms) + '</b>' }) : null,
          p.baths ? el('span', { html: '🚿 <b>' + U.num(p.baths) + '</b>' }) : null,
          el('span', { html: '🏷️ <b>' + S.typeName(p.type) + '</b>' })
        ])
      ])
    ]);

    function open() { (opts.onOpen || detailModal)(v, opts); }
    card.addEventListener('click', open);
    card.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    return card;
  }

  /* ---------- نافذة تفاصيل العرض ---------- */

  function detailModal(v, opts) {
    opts = opts || {};
    var o = v.offer, p = v.prop;
    var db = S.db;
    var admin = !!opts.admin;

    var specs = [
      { k: 'المساحة', val: p.space ? U.num(p.space) + ' م²' : '—' },
      p.frontage ? { k: 'الواجهة', val: U.num(p.frontage) + ' م' } : null,
      p.rooms ? { k: 'الغرف', val: U.num(p.rooms) } : null,
      p.baths ? { k: 'الحمامات', val: U.num(p.baths) } : null,
      p.floors > 1 ? { k: 'الطوابق', val: U.num(p.floors) } : null,
      p.floorNo ? { k: 'رقم الطابق', val: U.num(p.floorNo) } : null,
      p.age ? { k: 'عمر البناء', val: U.num(p.age) + ' سنة' } : null,
      { k: 'التشطيب', val: p.finish || '—' },
      { k: 'نوع الملكية', val: p.deedType || '—' },
      { k: 'الحالة', val: S.statusOf(S.PROP_STATUS, p.status).name }
    ].filter(Boolean);

    var body = el('div', { class: 'stack' }, [
      el('div', { class: 'viewer' }, [
        el('div', { class: 'stack-sm' }, [
          gallery(p),
          mapBox(p, 190)
        ]),
        el('div', { class: 'stack-sm' }, [
          el('div', { class: 'row', style: 'gap:6px' }, [
            U.badge(o.code, 'muted'),
            U.badge(S.purposeName(o.kind), o.kind === 'rent' ? 'info' : o.kind === 'investment' ? 'purple' : 'gold'),
            U.badge(S.statusOf(S.OFFER_STATUS, o.status).name, S.statusOf(S.OFFER_STATUS, o.status).tone)
          ]),
          el('h3', { text: v.title, style: 'margin:4px 0 0' }),
          el('div', { class: 'small muted', text: '📍 ' + locText(p) }),
          el('div', { class: 'prop__price', style: 'font-size:1.35rem', text: priceText(v) }),
          o.downPayment ? el('div', { class: 'panel small' }, [
            el('div', { html: '<b>الدفعة الأولى:</b> ' + U.money(o.downPayment, o.currency) }),
            o.installCount ? el('div', { html: '<b>التقسيط:</b> ' + U.num(o.installCount) + ' قسط ' + (o.installPeriod || '') + ' × ' + U.money(o.installAmount, o.currency) }) : null
          ]) : null,
          (o.highlights || []).length ? el('ul', { class: 'small', style: 'margin:0;padding-inline-start:18px' },
            o.highlights.map(function (h) { return el('li', { text: h }); })) : null,
          el('div', { class: 'spec' }, specs.map(function (s) {
            return el('div', {}, [el('b', { text: s.val }), el('span', { text: s.k })]);
          })),
          (p.features || []).length ? el('div', { class: 'chips' }, p.features.map(function (f) {
            return el('span', { class: 'badge badge--muted', text: '✓ ' + f });
          })) : null,
          o.validUntil ? el('div', { class: 'small muted', text: 'صالح حتى ' + U.shortDate(o.validUntil) }) : null,
          admin && p.ownerName ? el('div', { class: 'panel small' }, [
            el('div', { html: '<b>المالك:</b> ' + U.esc(p.ownerName) }),
            p.ownerPhone ? el('div', { html: '<b>الهاتف:</b> <span class="mono">' + U.esc(p.ownerPhone) + '</span>' }) : null,
            el('div', { html: '<b>العمولة:</b> ' + U.num(o.commissionPct) + (o.kind === 'rent' ? '٪ من الإيجار' : '٪') })
          ]) : null,
          admin && p.notes ? el('div', { class: 'small', style: 'color:var(--ink-2)', html: '<b>ملاحظات داخلية:</b> ' + U.esc(p.notes) }) : null
        ])
      ])
    ]);

    var foot = [
      el('a', { class: 'btn', href: U.whatsapp(db.settings.whatsapp, shareText(v, db.settings)), target: '_blank', rel: 'noopener', text: '💬 استفسار واتساب' }),
      el('a', { class: 'btn btn--ghost', href: 'tel:' + db.settings.phone, text: '📞 اتصال' }),
      el('a', { class: 'btn btn--ghost', href: mapsLink(p), target: '_blank', rel: 'noopener', text: '🗺️ الموقع على الخريطة' }),
      el('button', {
        class: 'btn btn--ghost', type: 'button', text: '📋 نسخ تفاصيل العرض',
        onclick: function () { U.copy(shareText(v, db.settings), 'نُسخت تفاصيل العرض — الصقها في واتساب'); }
      })
    ];
    if (opts.extraFoot) foot = foot.concat(opts.extraFoot);

    o.views = (o.views || 0) + 1;
    S.save();

    return U.modal({ title: 'تفاصيل العرض', body: body, foot: foot, wide: true });
  }

  /* ---------- البحث والفلترة ---------- */

  var DEFAULT_QUERY = {
    text: '', kind: '', type: '', gov: '', status: 'active',
    minPrice: 0, maxPrice: 0, minSpace: 0, rooms: 0, featured: false, sort: 'newest'
  };

  function applyQuery(views, q) {
    var text = (q.text || '').trim().toLowerCase();
    var words = text ? text.split(/\s+/) : [];

    var out = views.filter(function (v) {
      var o = v.offer, p = v.prop;
      if (q.status && o.status !== q.status) return false;
      if (q.kind && o.kind !== q.kind) return false;
      if (q.type && p.type !== q.type) return false;
      if (q.gov && p.gov !== q.gov) return false;
      if (q.featured && !o.featured) return false;
      if (q.rooms && (p.rooms || 0) < q.rooms) return false;
      if (q.minSpace && (p.space || 0) < q.minSpace) return false;
      var price = S.toMain(v.price, v.currency);
      if (q.minPrice && price < S.toMain(q.minPrice, q.priceCurrency || S.db.settings.mainCurrency)) return false;
      if (q.maxPrice && price > S.toMain(q.maxPrice, q.priceCurrency || S.db.settings.mainCurrency)) return false;
      if (words.length) {
        for (var i = 0; i < words.length; i++) if (v.haystack.indexOf(words[i]) === -1) return false;
      }
      return true;
    });

    var sorters = {
      newest: function (a, b) { return b.offer.createdAt - a.offer.createdAt; },
      oldest: function (a, b) { return a.offer.createdAt - b.offer.createdAt; },
      price_asc: function (a, b) { return S.toMain(a.price, a.currency) - S.toMain(b.price, b.currency); },
      price_desc: function (a, b) { return S.toMain(b.price, b.currency) - S.toMain(a.price, a.currency); },
      space_desc: function (a, b) { return (b.space || 0) - (a.space || 0); },
      views: function (a, b) { return (b.offer.views || 0) - (a.offer.views || 0); }
    };
    out.sort(sorters[q.sort] || sorters.newest);
    return out;
  }

  /** لوحة البحث الكاملة — تستدعي onChange عند أي تعديل */
  function searchPanel(q, onChange, opts) {
    opts = opts || {};
    var db = S.db;

    function set(k, v) { q[k] = v; onChange(); }

    var text = el('input', { type: 'search', value: q.text, placeholder: 'ابحث بالكود، المنطقة، اسم المالك، أو أي كلمة…' });
    var tmr;
    text.addEventListener('input', function () {
      clearTimeout(tmr);
      tmr = setTimeout(function () { set('text', text.value); }, 180);
    });

    function chipRow(items, key, goldWhenOn) {
      var row = el('div', { class: 'chips' });
      var all = el('button', {
        class: 'chip' + (!q[key] ? ' is-on' : ''), type: 'button', text: 'الكل',
        onclick: function () { set(key, ''); }
      });
      row.appendChild(all);
      items.forEach(function (it) {
        row.appendChild(el('button', {
          class: 'chip' + (goldWhenOn ? ' chip--gold' : '') + (q[key] === it.id ? ' is-on' : ''),
          type: 'button', text: (it.icon ? it.icon + ' ' : '') + it.name,
          onclick: function () { set(key, q[key] === it.id ? '' : it.id); }
        }));
      });
      return row;
    }

    var govSel = U.select(
      [{ value: '', label: 'كل المحافظات' }].concat(S.GOVS.map(function (g) { return { value: g.id, label: g.name }; })),
      q.gov, { onchange: function () { set('gov', govSel.value); } }
    );

    var sortSel = U.select([
      { value: 'newest', label: 'الأحدث أولاً' },
      { value: 'price_asc', label: 'السعر: الأقل أولاً' },
      { value: 'price_desc', label: 'السعر: الأعلى أولاً' },
      { value: 'space_desc', label: 'المساحة: الأكبر أولاً' },
      { value: 'views', label: 'الأكثر مشاهدة' },
      { value: 'oldest', label: 'الأقدم أولاً' }
    ], q.sort, { onchange: function () { set('sort', sortSel.value); } });

    var minP = el('input', { type: 'text', inputmode: 'numeric', value: q.minPrice || '', placeholder: 'من' });
    var maxP = el('input', { type: 'text', inputmode: 'numeric', value: q.maxPrice || '', placeholder: 'إلى' });
    [minP, maxP].forEach(function (inp) {
      inp.addEventListener('change', function () {
        q.minPrice = U.toNum(minP.value);
        q.maxPrice = U.toNum(maxP.value);
        onChange();
      });
    });
    var curSel = U.select([
      { value: 'USD', label: '$ دولار' },
      { value: 'IQD', label: 'د.ع دينار' }
    ], q.priceCurrency || db.settings.mainCurrency, { onchange: function () { set('priceCurrency', curSel.value); } });

    var spaceInp = el('input', { type: 'text', inputmode: 'numeric', value: q.minSpace || '', placeholder: 'أقل مساحة م²' });
    spaceInp.addEventListener('change', function () { set('minSpace', U.toNum(spaceInp.value)); });

    var roomsSel = U.select([
      { value: 0, label: 'أي عدد غرف' }, { value: 1, label: '+١' }, { value: 2, label: '+٢' },
      { value: 3, label: '+٣' }, { value: 4, label: '+٤' }, { value: 5, label: '+٥' }
    ], q.rooms, { onchange: function () { set('rooms', Number(roomsSel.value)); } });

    var more = el('div', { class: 'grid grid--4', style: 'display:none' }, [
      U.field('السعر من / إلى', el('div', { class: 'row', style: 'gap:6px;flex-wrap:nowrap' }, [minP, maxP])),
      U.field('عملة البحث', curSel),
      U.field('أقل مساحة', spaceInp),
      U.field('الغرف', roomsSel)
    ]);

    var moreBtn = el('button', {
      class: 'btn btn--ghost btn--sm', type: 'button', text: '⚙️ بحث متقدّم',
      onclick: function () { more.style.display = more.style.display === 'none' ? '' : 'none'; }
    });

    var resetBtn = el('button', {
      class: 'btn btn--ghost btn--sm', type: 'button', text: '↺ تصفير',
      onclick: function () {
        Object.keys(DEFAULT_QUERY).forEach(function (k) { q[k] = DEFAULT_QUERY[k]; });
        if (opts.defaultStatus !== undefined) q.status = opts.defaultStatus;
        onChange(true);
      }
    });

    var statusRow = opts.showStatus ? U.field('حالة العرض', U.select(
      [{ value: '', label: 'كل الحالات' }].concat(S.OFFER_STATUS.map(function (s) { return { value: s.id, label: s.name }; })),
      q.status, { onchange: function (e) { set('status', e.target.value); } }
    )) : null;

    return el('div', { class: 'card stack-sm' }, [
      el('div', { class: 'searchbox' }, [text]),
      chipRow(S.PURPOSES, 'kind', true),
      chipRow(S.TYPES, 'type'),
      el('div', { class: 'row', style: 'gap:8px' }, [
        el('div', { style: 'flex:1 1 170px' }, [govSel]),
        el('div', { style: 'flex:1 1 170px' }, [sortSel]),
        statusRow ? el('div', { style: 'flex:1 1 170px' }, [statusRow]) : null,
        moreBtn, resetBtn
      ]),
      more
    ]);
  }

  window.AS.views = {
    mapsLink: mapsLink, mapBox: mapBox, mediaNode: mediaNode, gallery: gallery,
    priceText: priceText, locText: locText, shareText: shareText,
    offerCard: offerCard, detailModal: detailModal,
    applyQuery: applyQuery, searchPanel: searchPanel,
    defaultQuery: function (over) { return Object.assign({}, DEFAULT_QUERY, over || {}); }
  };
})();
