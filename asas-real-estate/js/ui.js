/* =============================================================
   أدوات الواجهة: DOM، التنسيق، النوافذ، والرسوم البيانية (SVG)
   ============================================================= */
(function () {
  'use strict';

  window.AS = window.AS || {};

  /* ---------- DOM ---------- */

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v == null || v === false) return;
        if (k === 'class') node.className = v;
        else if (k === 'html') node.innerHTML = v;
        else if (k === 'text') node.textContent = v;
        else if (k === 'value') node.value = v;
        else if (k.slice(0, 2) === 'on' && typeof v === 'function') node.addEventListener(k.slice(2), v);
        else if (k === 'dataset') Object.keys(v).forEach(function (d) { node.dataset[d] = v[d]; });
        else node.setAttribute(k, v);
      });
    }
    (children || []).forEach(function (c) {
      if (c == null || c === false) return;
      node.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
    });
    return node;
  }

  function frag(children) {
    var f = document.createDocumentFragment();
    (children || []).forEach(function (c) { if (c) f.appendChild(c); });
    return f;
  }

  function clear(node) { while (node && node.firstChild) node.removeChild(node.firstChild); }
  function mount(node, child) { clear(node); if (child) node.appendChild(child); }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------- أرقام وتواريخ ---------- */

  var nf = new Intl.NumberFormat('ar-IQ-u-nu-latn');

  /** يحوّل الأرقام العربية والفواصل العربية لصيغة يفهمها JS */
  function normalizeDigits(v) {
    return String(v == null ? '' : v)
      .replace(/[٠-٩]/g, function (d) { return String(d.charCodeAt(0) - 1632); })
      .replace(/[۰-۹]/g, function (d) { return String(d.charCodeAt(0) - 1776); })
      .replace(/[٫،]/g, '.')
      .replace(/,/g, '');
  }

  function toNum(v) {
    var n = parseFloat(normalizeDigits(v));
    return isNaN(n) ? 0 : n;
  }

  function num(n) { return nf.format(Math.round(Number(n) || 0)); }

  /** صيغة مختصرة للأرقام الكبيرة: ٢٥٠ مليون / ١٫٢ مليار */
  function shortNum(n) {
    n = Number(n) || 0;
    var a = Math.abs(n);
    if (a >= 1e9) return (n / 1e9).toFixed(a >= 1e10 ? 0 : 1).replace(/\.0$/, '') + ' مليار';
    if (a >= 1e6) return (n / 1e6).toFixed(a >= 1e7 ? 0 : 1).replace(/\.0$/, '') + ' مليون';
    if (a >= 1e3) return (n / 1e3).toFixed(a >= 1e4 ? 0 : 1).replace(/\.0$/, '') + ' ألف';
    return num(n);
  }

  function curSign(c) { return c === 'USD' ? '$' : 'د.ع'; }

  function money(n, currency) {
    return num(n) + ' ' + curSign(currency);
  }

  function moneyShort(n, currency) {
    return shortNum(n) + ' ' + curSign(currency);
  }

  function pct(n) { return num(Math.round(Number(n) || 0)) + '%'; }

  var MONTHS = ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'];
  var MONTHS_SHORT = ['ك٢', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'ت١', 'ت٢', 'ك١'];

  function two(n) { return n < 10 ? '0' + n : String(n); }

  function date(ts) {
    if (!ts) return '—';
    var d = new Date(ts);
    return two(d.getDate()) + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear();
  }

  function shortDate(ts) {
    if (!ts) return '—';
    var d = new Date(ts);
    return two(d.getDate()) + '/' + two(d.getMonth() + 1) + '/' + d.getFullYear();
  }

  function dateTime(ts) {
    if (!ts) return '—';
    var d = new Date(ts);
    return shortDate(ts) + ' · ' + two(d.getHours()) + ':' + two(d.getMinutes());
  }

  /** قيمة <input type="date"> من طابع زمني */
  function dateInput(ts) {
    if (!ts) return '';
    var d = new Date(ts);
    return d.getFullYear() + '-' + two(d.getMonth() + 1) + '-' + two(d.getDate());
  }

  function ago(ts) {
    if (!ts) return '—';
    var s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return 'قبل قليل';
    if (s < 3600) return 'قبل ' + num(Math.floor(s / 60)) + ' دقيقة';
    if (s < 86400) return 'قبل ' + num(Math.floor(s / 3600)) + ' ساعة';
    if (s < 2592000) return 'قبل ' + num(Math.floor(s / 86400)) + ' يوم';
    return shortDate(ts);
  }

  function daysLeft(ts) {
    if (!ts) return null;
    return Math.ceil((ts - Date.now()) / 86400000);
  }

  function monthKey(ts) {
    var d = new Date(ts);
    return d.getFullYear() + '-' + two(d.getMonth() + 1);
  }

  function monthLabel(key) {
    var p = String(key).split('-');
    return MONTHS_SHORT[Number(p[1]) - 1] + ' ' + String(p[0]).slice(2);
  }

  /* ---------- تنبيهات ---------- */

  function toastHost() {
    var host = $('.toast-host');
    if (!host) { host = el('div', { class: 'toast-host' }); document.body.appendChild(host); }
    return host;
  }

  function toast(msg, type) {
    var t = el('div', { class: 'toast' + (type ? ' toast--' + type : ''), text: msg });
    toastHost().appendChild(t);
    setTimeout(function () {
      t.style.transition = 'opacity .25s ease';
      t.style.opacity = '0';
      setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 260);
    }, 2400);
  }

  /* ---------- النوافذ ---------- */

  function modal(opts) {
    var back = el('div', { class: 'modal-back' });
    var body = el('div', { class: 'modal__body' });
    if (typeof opts.body === 'string') body.innerHTML = opts.body;
    else if (opts.body) body.appendChild(opts.body);

    var box = el('div', { class: 'modal' + (opts.wide ? ' modal--wide' : '') }, [
      el('div', { class: 'modal__head' }, [
        el('div', { class: 'modal__title', text: opts.title || '' }),
        el('button', { class: 'x-btn', type: 'button', title: 'إغلاق', text: '✕', onclick: close })
      ]),
      body,
      opts.foot ? el('div', { class: 'modal__foot' }, opts.foot) : null
    ]);

    back.appendChild(box);
    back.addEventListener('mousedown', function (e) { if (e.target === back) close(); });
    document.addEventListener('keydown', onKey);
    document.body.appendChild(back);
    document.body.classList.add('no-scroll');

    function onKey(e) { if (e.key === 'Escape') close(); }

    function close() {
      document.removeEventListener('keydown', onKey);
      if (back.parentNode) back.parentNode.removeChild(back);
      document.body.classList.remove('no-scroll');
      if (opts.onClose) opts.onClose();
    }

    return { close: close, body: body, box: box };
  }

  function confirmDialog(question, onYes, yesLabel, tone) {
    var m = modal({
      title: 'تأكيد',
      body: el('p', { text: question, style: 'margin:0' }),
      foot: [
        el('button', {
          class: 'btn ' + (tone === 'danger' ? 'btn--danger' : ''), type: 'button', text: yesLabel || 'نعم، أكمل',
          onclick: function () { m.close(); onYes(); }
        }),
        el('button', { class: 'btn btn--ghost', type: 'button', text: 'إلغاء', onclick: function () { m.close(); } })
      ]
    });
    return m;
  }

  function prompt(opts, onSave) {
    var input = el(opts.multiline ? 'textarea' : 'input', {
      type: 'text', value: opts.value || '', placeholder: opts.placeholder || ''
    });
    var m = modal({
      title: opts.title || '',
      body: el('label', { class: 'field' }, [
        opts.label ? el('span', { class: 'label', text: opts.label }) : null,
        input
      ]),
      foot: [
        el('button', {
          class: 'btn', type: 'button', text: 'حفظ',
          onclick: function () { var v = input.value.trim(); m.close(); onSave(v); }
        }),
        el('button', { class: 'btn btn--ghost', type: 'button', text: 'إلغاء', onclick: function () { m.close(); } })
      ]
    });
    setTimeout(function () { input.focus(); }, 40);
    return m;
  }

  /* ---------- عناصر جاهزة ---------- */

  function badge(text, tone) {
    return el('span', { class: 'badge' + (tone ? ' badge--' + tone : ''), text: text });
  }

  function stat(opts) {
    return el('div', { class: 'stat' + (opts.variant ? ' stat--' + opts.variant : '') }, [
      el('div', { class: 'stat__label' }, [opts.icon ? el('span', { text: opts.icon }) : null, el('span', { text: opts.label })]),
      el('div', { class: 'stat__value', text: opts.value }),
      opts.hint ? el('div', { class: 'stat__hint', text: opts.hint }) : null
    ]);
  }

  function empty(text, icon) {
    return el('div', { class: 'empty' }, [
      el('span', { class: 'empty__icon', text: icon || '🗂️' }),
      el('div', { text: text })
    ]);
  }

  function field(label, control, hint) {
    return el('label', { class: 'field' }, [
      label ? el('span', { class: 'label', text: label }) : null,
      control,
      hint ? el('span', { class: 'hint', text: hint }) : null
    ]);
  }

  function input(attrs) { return el('input', Object.assign({ type: 'text' }, attrs || {})); }

  function select(options, value, attrs) {
    var s = el('select', attrs || {});
    options.forEach(function (o) {
      var opt = el('option', { value: o.value, text: o.label });
      if (String(o.value) === String(value)) opt.selected = true;
      s.appendChild(opt);
    });
    return s;
  }

  function table(columns, rows) {
    var wrap = el('div', { class: 'table-wrap' });
    var t = el('table', { class: 'tbl' });
    var head = el('tr', {}, columns.map(function (c) { return el('th', { text: c.label || c }); }));
    t.appendChild(el('thead', {}, [head]));
    var tb = el('tbody');
    rows.forEach(function (r) {
      var tr = el('tr');
      r.forEach(function (cell) {
        if (cell && cell.nodeType) tr.appendChild(el('td', {}, [cell]));
        else if (cell && typeof cell === 'object') tr.appendChild(el('td', { class: cell.class || '', html: cell.html != null ? cell.html : null, text: cell.html != null ? null : String(cell.text == null ? '' : cell.text) }));
        else tr.appendChild(el('td', { text: String(cell == null ? '' : cell) }));
      });
      tb.appendChild(tr);
    });
    t.appendChild(tb);
    wrap.appendChild(t);
    return wrap;
  }

  function progress(value, max, tone) {
    var p = max > 0 ? Math.min(100, (value / max) * 100) : 0;
    return el('div', { class: 'bar-track' }, [
      el('div', { class: 'bar-fill', style: 'width:' + p + '%' + (tone ? ';background:var(--' + tone + ')' : '') })
    ]);
  }

  /* ---------- رسوم SVG ---------- */

  var NS = 'http://www.w3.org/2000/svg';

  function svgEl(tag, attrs) {
    var n = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    return n;
  }

  function niceMax(v) {
    if (v <= 0) return 1;
    var mag = Math.pow(10, Math.floor(Math.log10(v)));
    var n = v / mag;
    var step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
    return step * mag;
  }

  /** أعمدة رأسية — data: [{label, value, tone}] */
  function barChart(opts) {
    var data = opts.data || [];
    var W = 520, H = opts.height || 200, padB = 26, padT = 12;
    var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, width: '100%', height: H, role: 'img' });
    if (!data.length) return svg;
    var maxV = niceMax(Math.max.apply(null, data.map(function (d) { return Math.abs(d.value) || 0; })));
    var plotH = H - padB - padT;
    var slot = W / data.length;
    var bw = Math.min(46, slot * 0.58);

    [0, 0.5, 1].forEach(function (g) {
      var y = padT + plotH * g;
      svg.appendChild(svgEl('line', { x1: 0, x2: W, y1: y, y2: y, stroke: 'var(--line)', 'stroke-width': 1 }));
    });

    data.forEach(function (d, i) {
      var h = Math.max(2, (Math.abs(d.value) / maxV) * plotH);
      /* RTL: أول عنصر على اليمين */
      var x = W - (i + 1) * slot + (slot - bw) / 2;
      var g = svgEl('g');
      g.appendChild(svgEl('rect', {
        x: x, y: padT + plotH - h, width: bw, height: h, rx: 6,
        fill: d.tone ? 'var(--' + d.tone + ')' : 'var(--brand-600)'
      }));
      var label = svgEl('text', { x: x + bw / 2, y: H - 8, 'text-anchor': 'middle', 'font-size': 11, fill: 'var(--muted)' });
      label.textContent = d.label;
      g.appendChild(label);
      var val = svgEl('text', { x: x + bw / 2, y: padT + plotH - h - 4, 'text-anchor': 'middle', 'font-size': 10, fill: 'var(--ink-2)' });
      val.textContent = d.short || shortNum(d.value);
      g.appendChild(val);
      svg.appendChild(g);
    });
    return svg;
  }

  /** أعمدة أفقية — أنسب للأسماء العربية الطويلة */
  function hbarChart(data, opts) {
    opts = opts || {};
    var host = el('div', { class: 'stack-sm' });
    if (!data.length) return empty('لا توجد بيانات كافية', '📊');
    var maxV = Math.max.apply(null, data.map(function (d) { return d.value || 0; })) || 1;
    data.forEach(function (d) {
      host.appendChild(el('div', {}, [
        el('div', { class: 'row row--between', style: 'gap:8px' }, [
          el('span', { class: 'small', style: 'font-weight:700', text: d.label }),
          el('span', { class: 'small mono muted', text: d.display || num(d.value) })
        ]),
        el('div', { class: 'bar-track' }, [
          el('div', { class: 'bar-fill', style: 'width:' + ((d.value / maxV) * 100) + '%' + (d.tone ? ';background:var(--' + d.tone + ')' : '') })
        ])
      ]));
    });
    return host;
  }

  /** دائرة مفرّغة — data: [{label, value, color}] */
  function donutChart(data, opts) {
    opts = opts || {};
    var total = data.reduce(function (s, d) { return s + (d.value || 0); }, 0);
    var size = opts.size || 168, r = size / 2 - 12, cx = size / 2, cy = size / 2;
    var svg = svgEl('svg', { viewBox: '0 0 ' + size + ' ' + size, width: size, height: size });
    if (total <= 0) {
      svg.appendChild(svgEl('circle', { cx: cx, cy: cy, r: r, fill: 'none', stroke: 'var(--line)', 'stroke-width': 18 }));
    } else {
      var acc = 0;
      var C = 2 * Math.PI * r;
      data.forEach(function (d) {
        if (!d.value) return;
        var frac = d.value / total;
        var c = svgEl('circle', {
          cx: cx, cy: cy, r: r, fill: 'none', stroke: d.color || 'var(--brand-600)', 'stroke-width': 18,
          'stroke-dasharray': (C * frac - 2) + ' ' + (C * (1 - frac) + 2),
          'stroke-dashoffset': -C * acc,
          transform: 'rotate(-90 ' + cx + ' ' + cy + ')'
        });
        svg.appendChild(c);
        acc += frac;
      });
    }
    var t1 = svgEl('text', { x: cx, y: cy - 2, 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: 'var(--ink)' });
    t1.textContent = opts.centerValue != null ? opts.centerValue : num(total);
    svg.appendChild(t1);
    if (opts.centerLabel) {
      var t2 = svgEl('text', { x: cx, y: cy + 16, 'text-anchor': 'middle', 'font-size': 11, fill: 'var(--muted)' });
      t2.textContent = opts.centerLabel;
      svg.appendChild(t2);
    }

    var legend = el('div', { class: 'stack-sm grow' }, data.map(function (d) {
      return el('div', { class: 'row row--between', style: 'gap:8px' }, [
        el('span', { class: 'row', style: 'gap:6px' }, [
          el('span', { style: 'width:10px;height:10px;border-radius:3px;background:' + (d.color || 'var(--brand-600)') }),
          el('span', { class: 'small', text: d.label })
        ]),
        el('span', { class: 'small mono muted', text: num(d.value) + (total ? ' · ' + pct((d.value / total) * 100) : '') })
      ]);
    }));

    return el('div', { class: 'row', style: 'gap:18px;align-items:center' }, [svg, legend]);
  }

  /* ---------- أدوات عامة ---------- */

  function copy(text, okMsg) {
    function fallback() {
      var ta = el('textarea', { value: text, style: 'position:fixed;opacity:0' });
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); toast(okMsg || 'تم النسخ', 'ok'); }
      catch (e) { toast('تعذّر النسخ', 'err'); }
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast(okMsg || 'تم النسخ', 'ok'); }, fallback);
    } else fallback();
  }

  function download(filename, content, type) {
    var blob = content instanceof Blob ? content : new Blob([content], { type: type || 'application/json;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = el('a', { href: url, download: filename });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function theme(next) {
    var t = next || localStorage.getItem('asas-theme') || 'light';
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('asas-theme', t);
    return t;
  }

  function themeToggle() {
    var btn = el('button', { class: 'btn btn--ghost btn--icon', type: 'button', title: 'الوضع الليلي' });
    function paint() { btn.textContent = document.documentElement.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙'; }
    btn.addEventListener('click', function () {
      theme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
      paint();
    });
    paint();
    return btn;
  }

  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    if (location.protocol === 'file:') return;
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    });
  }

  function installPrompt(host) {
    var deferred = null;
    var btn = el('button', { class: 'btn btn--gold', type: 'button', text: '⬇️ تثبيت التطبيق', style: 'display:none' });
    btn.addEventListener('click', function () {
      if (!deferred) return;
      deferred.prompt();
      deferred.userChoice.then(function () { deferred = null; btn.style.display = 'none'; });
    });
    window.addEventListener('beforeinstallprompt', function (e) {
      e.preventDefault();
      deferred = e;
      btn.style.display = '';
    });
    if (host) host.appendChild(btn);
    return btn;
  }

  /** يفتح واتساب برسالة جاهزة */
  function whatsapp(phone, text) {
    var p = String(phone || '').replace(/[^0-9]/g, '');
    if (p.indexOf('0') === 0) p = '964' + p.slice(1);
    return 'https://wa.me/' + p + (text ? '?text=' + encodeURIComponent(text) : '');
  }

  window.AS.ui = {
    $: $, $$: $$, el: el, frag: frag, clear: clear, mount: mount, esc: esc,
    num: num, shortNum: shortNum, money: money, moneyShort: moneyShort, curSign: curSign, pct: pct,
    toNum: toNum, normalizeDigits: normalizeDigits,
    date: date, shortDate: shortDate, dateTime: dateTime, dateInput: dateInput, ago: ago,
    daysLeft: daysLeft, monthKey: monthKey, monthLabel: monthLabel, MONTHS: MONTHS,
    toast: toast, modal: modal, confirm: confirmDialog, prompt: prompt,
    badge: badge, stat: stat, empty: empty, field: field, input: input, select: select,
    table: table, progress: progress,
    barChart: barChart, hbarChart: hbarChart, donutChart: donutChart,
    copy: copy, download: download, theme: theme, themeToggle: themeToggle,
    registerServiceWorker: registerServiceWorker, installPrompt: installPrompt, whatsapp: whatsapp
  };

  theme();
})();
