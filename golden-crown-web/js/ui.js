/* =============================================================
   أدوات الواجهة: DOM، التنسيق، النوافذ، والرسوم البيانية (SVG)
   ============================================================= */
(function () {
  'use strict';

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
        else if (k.slice(0, 2) === 'on' && typeof v === 'function') node.addEventListener(k.slice(2), v);
        else if (k === 'dataset') Object.keys(v).forEach(function (d) { node.dataset[d] = v[d]; });
        else node.setAttribute(k, v);
      });
    }
    (children || []).forEach(function (c) {
      if (c == null || c === false) return;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function clear(node) { while (node && node.firstChild) node.removeChild(node.firstChild); }

  function mount(node, child) { clear(node); if (child) node.appendChild(child); }

  /* ---------- تنسيق ---------- */

  var nf = new Intl.NumberFormat('ar-IQ-u-nu-latn');

  function num(n) { return nf.format(Math.round(Number(n) || 0)); }

  function money(n, currency) {
    return num(n) + ' ' + (currency || 'د.ع');
  }

  function pct(n) { return num(Math.round(Number(n) || 0)) + '%'; }

  var MONTHS = ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'];
  var DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  function two(n) { return n < 10 ? '0' + n : String(n); }

  function date(ts) {
    var d = new Date(ts);
    return two(d.getDate()) + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear();
  }

  function shortDate(ts) {
    var d = new Date(ts);
    return two(d.getDate()) + '/' + two(d.getMonth() + 1);
  }

  function dateTime(ts) {
    var d = new Date(ts);
    return date(ts) + ' — ' + two(d.getHours()) + ':' + two(d.getMinutes());
  }

  function dayName(i) { return DAYS[i]; }

  function ago(ts) {
    var s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return 'قبل لحظات';
    var m = Math.floor(s / 60);
    if (m < 60) return 'قبل ' + num(m) + ' دقيقة';
    var h = Math.floor(m / 60);
    if (h < 24) return 'قبل ' + num(h) + ' ساعة';
    var d = Math.floor(h / 24);
    if (d < 30) return 'قبل ' + num(d) + ' يوم';
    return date(ts);
  }

  function hours(h) {
    if (h == null) return '—';
    if (h < 1) return num(Math.round(h * 60)) + ' دقيقة';
    return num(Math.round(h * 10) / 10) + ' ساعة';
  }

  /* تحويل الأرقام العربية إلى إنجليزية في أي حقل إدخال */
  function normalizeDigits(v) {
    return String(v == null ? '' : v)
      .replace(/[٠-٩]/g, function (c) { return String(c.charCodeAt(0) - 0x0660); })
      .replace(/[۰-۹]/g, function (c) { return String(c.charCodeAt(0) - 0x06f0); });
  }

  /* ---------- تنبيهات ونوافذ ---------- */

  function toast(msg, type) {
    var host = $('#gc-toasts');
    if (!host) {
      host = el('div', { id: 'gc-toasts', class: 'toasts' });
      document.body.appendChild(host);
    }
    var t = el('div', { class: 'toast toast--' + (type || 'info'), text: msg });
    host.appendChild(t);
    setTimeout(function () { t.classList.add('is-out'); }, 3200);
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 3700);
  }

  function modal(opts) {
    var overlay = el('div', { class: 'modal-overlay' });
    var box = el('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true' });
    var head = el('div', { class: 'modal__head' }, [
      el('h3', { text: opts.title || '' }),
      el('button', { class: 'icon-btn', 'aria-label': 'إغلاق', text: '✕', onclick: close })
    ]);
    var body = el('div', { class: 'modal__body' });
    if (typeof opts.body === 'string') body.innerHTML = opts.body;
    else if (opts.body) body.appendChild(opts.body);
    box.appendChild(head);
    box.appendChild(body);
    if (opts.actions) {
      var foot = el('div', { class: 'modal__foot' }, opts.actions);
      box.appendChild(foot);
    }
    overlay.appendChild(box);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    document.body.appendChild(overlay);
    document.body.classList.add('no-scroll');

    function close() {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      document.body.classList.remove('no-scroll');
      if (opts.onClose) opts.onClose();
    }
    return { close: close, body: body, overlay: overlay };
  }

  function confirmDialog(question, onYes, yesLabel) {
    var m = modal({
      title: 'تأكيد',
      body: el('p', { text: question }),
      actions: [
        el('button', { class: 'btn btn--ghost', text: 'إلغاء', onclick: function () { m.close(); } }),
        el('button', {
          class: 'btn btn--danger',
          text: yesLabel || 'تأكيد',
          onclick: function () { m.close(); onYes(); }
        })
      ]
    });
    return m;
  }

  /* ---------- مكوّنات صغيرة ---------- */

  function badge(text, tone) {
    return el('span', { class: 'badge badge--' + (tone || 'muted'), text: text });
  }

  function stat(opts) {
    var children = [
      el('div', { class: 'stat__label', text: opts.label }),
      el('div', { class: 'stat__value', text: opts.value })
    ];
    if (opts.hint) children.push(el('div', { class: 'stat__hint', text: opts.hint }));
    if (opts.delta != null) {
      var up = opts.delta >= 0;
      var good = opts.invert ? !up : up;
      children.push(
        el('div', { class: 'stat__delta ' + (good ? 'is-good' : 'is-bad') }, [
          el('span', { text: (up ? '▲' : '▼') + ' ' + pct(Math.abs(opts.delta)) }),
          el('span', { class: 'stat__delta-note', text: opts.deltaNote || 'مقارنة بالفترة السابقة' })
        ])
      );
    }
    return el('div', { class: 'stat' + (opts.accent ? ' stat--' + opts.accent : '') }, children);
  }

  function empty(text, icon) {
    return el('div', { class: 'empty' }, [
      el('div', { class: 'empty__icon', text: icon || '🗂️' }),
      el('p', { text: text })
    ]);
  }

  function table(columns, rows) {
    var thead = el('thead', {}, [el('tr', {}, columns.map(function (c) { return el('th', { text: c.title, style: c.width ? 'width:' + c.width : null }); }))]);
    var tbody = el('tbody', {}, rows.map(function (r) {
      return el('tr', {}, columns.map(function (c) {
        var v = c.render ? c.render(r) : r[c.key];
        var td = el('td', {});
        if (v == null) td.textContent = '—';
        else if (typeof v === 'string' || typeof v === 'number') td.textContent = v;
        else td.appendChild(v);
        return td;
      }));
    }));
    return el('div', { class: 'table-wrap' }, [el('table', { class: 'table' }, [thead, tbody])]);
  }

  /* ---------- الرسوم البيانية (SVG خام، بلا مكتبات) ---------- */

  var C = {
    s1: '#2a78d6',
    s2: '#eb6834',
    s3: '#1baf7a',
    good: '#0ca30c',
    warn: '#fab219',
    serious: '#ec835a',
    critical: '#d03b3b',
    grid: '#e1e0d9',
    axis: '#c3c2b7',
    muted: '#898781',
    ink: '#0b0b0b',
    seq: ['#cde2fb', '#9ec5f4', '#6da7ec', '#3987e5', '#256abf', '#184f95', '#0d366b']
  };

  var SVGNS = 'http://www.w3.org/2000/svg';

  function svgEl(tag, attrs) {
    var n = document.createElementNS(SVGNS, tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (attrs[k] == null) return;
      n.setAttribute(k, attrs[k]);
    });
    return n;
  }

  function chartFrame(width, height) {
    var svg = svgEl('svg', {
      viewBox: '0 0 ' + width + ' ' + height,
      class: 'chart',
      preserveAspectRatio: 'none',
      role: 'img'
    });
    return svg;
  }

  function niceMax(v) {
    if (v <= 5) return 5;
    var mag = Math.pow(10, Math.floor(Math.log10(v)));
    var n = Math.ceil(v / mag);
    if (n > 5) n = 10;
    else if (n > 2) n = 5;
    return n * mag;
  }

  function tooltipLayer(host) {
    var tip = el('div', { class: 'chart-tip', hidden: 'hidden' });
    host.appendChild(tip);
    return {
      show: function (html, x, y) {
        tip.innerHTML = html;
        tip.hidden = false;
        var w = host.clientWidth;
        tip.style.left = Math.min(Math.max(x, 8), Math.max(8, w - tip.offsetWidth - 8)) + 'px';
        tip.style.top = Math.max(4, y) + 'px';
      },
      hide: function () { tip.hidden = true; }
    };
  }

  /**
   * رسم خطي/مساحي لسلسلة زمنية. المحور الزمني من اليمين (الأقدم) إلى اليسار (الأحدث)
   * ليتوافق مع اتجاه القراءة العربي.
   */
  function lineChart(host, opts) {
    clear(host);
    host.classList.add('chart-host');
    var W = 760, H = opts.height || 230;
    var padT = 14, padB = 26, padR = 46, padL = 10;
    var svg = chartFrame(W, H);
    var series = opts.series;
    var points = series[0].points.length;
    var maxV = niceMax(Math.max.apply(null, series.reduce(function (a, s) { return a.concat(s.points.map(function (p) { return p.y; })); }, [1])));
    var plotW = W - padR - padL;
    var plotH = H - padT - padB;

    function xAt(i) { return W - padR - (points === 1 ? plotW / 2 : (i / (points - 1)) * plotW); }
    function yAt(v) { return padT + plotH - (v / maxV) * plotH; }

    /* الشبكة ومحور القيم */
    var ticks = 4, i;
    for (i = 0; i <= ticks; i++) {
      var v = (maxV / ticks) * i;
      var y = yAt(v);
      svg.appendChild(svgEl('line', { x1: padL, x2: W - padR, y1: y, y2: y, stroke: i === 0 ? C.axis : C.grid, 'stroke-width': 1 }));
      var lbl = svgEl('text', { x: W - padR + 8, y: y + 4, fill: C.muted, 'font-size': 11, 'text-anchor': 'start' });
      lbl.textContent = opts.yFormat ? opts.yFormat(v) : num(v);
      svg.appendChild(lbl);
    }

    /* تسميات المحور الزمني (كل ~6 نقاط) */
    var step = Math.max(1, Math.round(points / 6));
    for (i = 0; i < points; i += step) {
      var tx = xAt(i);
      var t = svgEl('text', { x: tx, y: H - 8, fill: C.muted, 'font-size': 11, 'text-anchor': 'middle' });
      t.textContent = series[0].points[i].label;
      svg.appendChild(t);
    }

    series.forEach(function (s, si) {
      var d = '';
      s.points.forEach(function (p, idx) {
        d += (idx ? ' L' : 'M') + xAt(idx).toFixed(1) + ' ' + yAt(p.y).toFixed(1);
      });
      if (s.area) {
        var area = d + ' L' + xAt(points - 1).toFixed(1) + ' ' + yAt(0) + ' L' + xAt(0).toFixed(1) + ' ' + yAt(0) + ' Z';
        svg.appendChild(svgEl('path', { d: area, fill: s.color, opacity: 0.1 }));
      }
      svg.appendChild(svgEl('path', { d: d, fill: 'none', stroke: s.color, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
      if (si === 0 && points <= 40) {
        s.points.forEach(function (p, idx) {
          svg.appendChild(svgEl('circle', { cx: xAt(idx), cy: yAt(p.y), r: 2.5, fill: s.color }));
        });
      }
    });

    host.appendChild(svg);
    var tip = tooltipLayer(host);

    /* طبقة التمرير: خط عمودي + بطاقة قيم */
    var hoverLine = svgEl('line', { y1: padT, y2: padT + plotH, stroke: C.axis, 'stroke-width': 1, 'stroke-dasharray': '4 3', opacity: 0 });
    svg.appendChild(hoverLine);
    var dots = series.map(function (s) {
      var c = svgEl('circle', { r: 4.5, fill: s.color, stroke: '#fff', 'stroke-width': 2, opacity: 0 });
      svg.appendChild(c);
      return c;
    });

    svg.addEventListener('mousemove', function (e) {
      var rect = svg.getBoundingClientRect();
      var relX = ((e.clientX - rect.left) / rect.width) * W;
      var idx = Math.round(((W - padR - relX) / plotW) * (points - 1));
      idx = Math.max(0, Math.min(points - 1, idx));
      var x = xAt(idx);
      hoverLine.setAttribute('x1', x);
      hoverLine.setAttribute('x2', x);
      hoverLine.setAttribute('opacity', 1);
      var rows = series
        .map(function (s, si) {
          dots[si].setAttribute('cx', x);
          dots[si].setAttribute('cy', yAt(s.points[idx].y));
          dots[si].setAttribute('opacity', 1);
          return '<div class="chart-tip__row"><span class="dot" style="background:' + s.color + '"></span>' +
            esc(s.name) + ': <b>' + (opts.yFormat ? opts.yFormat(s.points[idx].y) : num(s.points[idx].y)) + '</b></div>';
        })
        .join('');
      tip.show('<div class="chart-tip__title">' + esc(series[0].points[idx].fullLabel || series[0].points[idx].label) + '</div>' + rows,
        (x / W) * host.clientWidth - 60, 8);
    });
    svg.addEventListener('mouseleave', function () {
      hoverLine.setAttribute('opacity', 0);
      dots.forEach(function (d) { d.setAttribute('opacity', 0); });
      tip.hide();
    });

    if (series.length > 1) host.appendChild(legend(series));
    return host;
  }

  function legend(series) {
    return el(
      'div',
      { class: 'legend' },
      series.map(function (s) {
        return el('span', { class: 'legend__item' }, [
          el('span', { class: 'dot', style: 'background:' + s.color }),
          el('span', { text: s.name })
        ]);
      })
    );
  }

  /** أعمدة رأسية لقيمة واحدة (مع تمرير) */
  function barChart(host, opts) {
    clear(host);
    host.classList.add('chart-host');
    var data = opts.data;
    var W = 760, H = opts.height || 220;
    var padT = 14, padB = 28, padR = 46, padL = 10;
    var svg = chartFrame(W, H);
    var maxV = niceMax(Math.max.apply(null, data.map(function (d) { return d.value; }).concat([1])));
    var plotW = W - padR - padL;
    var plotH = H - padT - padB;
    var slot = plotW / data.length;
    var bw = Math.max(6, Math.min(34, slot - 8));

    var i;
    for (i = 0; i <= 4; i++) {
      var v = (maxV / 4) * i;
      var y = padT + plotH - (v / maxV) * plotH;
      svg.appendChild(svgEl('line', { x1: padL, x2: W - padR, y1: y, y2: y, stroke: i === 0 ? C.axis : C.grid, 'stroke-width': 1 }));
      var lbl = svgEl('text', { x: W - padR + 8, y: y + 4, fill: C.muted, 'font-size': 11 });
      lbl.textContent = opts.yFormat ? opts.yFormat(v) : num(v);
      svg.appendChild(lbl);
    }

    var tip = null;
    data.forEach(function (d, idx) {
      var h = (d.value / maxV) * plotH;
      var x = W - padR - (idx + 1) * slot + (slot - bw) / 2;
      var y = padT + plotH - h;
      var r = svgEl('rect', {
        x: x, y: y, width: bw, height: Math.max(h, d.value ? 2 : 0),
        rx: 4, fill: d.color || opts.color || C.s1, class: 'bar'
      });
      svg.appendChild(r);
      var t = svgEl('text', { x: x + bw / 2, y: H - 9, fill: C.muted, 'font-size': 11, 'text-anchor': 'middle' });
      t.textContent = d.label;
      svg.appendChild(t);
      r.addEventListener('mouseenter', function () {
        if (!tip) tip = tooltipLayer(host);
        tip.show('<div class="chart-tip__title">' + esc(d.fullLabel || d.label) + '</div><b>' +
          (opts.yFormat ? opts.yFormat(d.value) : num(d.value)) + '</b>', ((x + bw / 2) / W) * host.clientWidth - 50, 8);
      });
      r.addEventListener('mouseleave', function () { if (tip) tip.hide(); });
    });

    host.appendChild(svg);
    return host;
  }

  /** أشرطة أفقية مرتّبة — مناسبة لأسماء عربية طويلة (التوزيع الجغرافي، القنوات) */
  function hbarChart(host, opts) {
    clear(host);
    var max = Math.max.apply(null, opts.data.map(function (d) { return d.value; }).concat([1]));
    var wrap = el('div', { class: 'hbars' });
    opts.data.forEach(function (d, i) {
      var w = (d.value / max) * 100;
      var color = d.color || (opts.sequential ? C.seq[Math.min(C.seq.length - 1, 6 - Math.floor((i / opts.data.length) * 4))] : opts.color || C.s1);
      wrap.appendChild(
        el('div', { class: 'hbar' }, [
          el('div', { class: 'hbar__label', text: d.label }),
          el('div', { class: 'hbar__track' }, [
            el('div', { class: 'hbar__fill', style: 'width:' + Math.max(w, d.value ? 2 : 0) + '%;background:' + color, title: num(d.value) })
          ]),
          el('div', { class: 'hbar__value', text: opts.format ? opts.format(d.value) : num(d.value) })
        ])
      );
    });
    mount(host, wrap);
    return host;
  }

  /** حلقة توزيع (أقصى 6 شرائح + "أخرى") */
  function donutChart(host, opts) {
    clear(host);
    var data = opts.data.slice(0, 6);
    var rest = opts.data.slice(6).reduce(function (a, d) { return a + d.value; }, 0);
    if (rest) data.push({ name: 'أخرى', value: rest });
    var total = data.reduce(function (a, d) { return a + d.value; }, 0) || 1;
    var palette = [C.s1, C.s2, C.s3, '#eda100', '#e87ba4', '#4a3aa7', '#898781'];
    var size = 190, r = 72, cx = size / 2, cy = size / 2, sw = 26;
    var svg = svgEl('svg', { viewBox: '0 0 ' + size + ' ' + size, class: 'donut' });
    var start = -Math.PI / 2;

    data.forEach(function (d, i) {
      var frac = d.value / total;
      var end = start + frac * Math.PI * 2;
      var large = frac > 0.5 ? 1 : 0;
      var x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start);
      var x2 = cx + r * Math.cos(end), y2 = cy + r * Math.sin(end);
      var path = svgEl('path', {
        d: 'M' + x1 + ' ' + y1 + ' A' + r + ' ' + r + ' 0 ' + large + ' 1 ' + x2 + ' ' + y2,
        stroke: palette[i % palette.length],
        'stroke-width': sw,
        fill: 'none',
        'stroke-linecap': 'butt'
      });
      var title = svgEl('title');
      title.textContent = d.name + ': ' + num(d.value) + ' (' + pct((d.value / total) * 100) + ')';
      path.appendChild(title);
      svg.appendChild(path);
      start = end + 0.02;
      d.color = palette[i % palette.length];
    });

    var center = svgEl('text', { x: cx, y: cy - 2, 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 700, fill: C.ink });
    center.textContent = num(total);
    svg.appendChild(center);
    var sub = svgEl('text', { x: cx, y: cy + 18, 'text-anchor': 'middle', 'font-size': 11, fill: C.muted });
    sub.textContent = opts.centerLabel || 'حالة';
    svg.appendChild(sub);

    var legendBox = el('div', { class: 'donut-legend' }, data.map(function (d) {
      return el('div', { class: 'donut-legend__row' }, [
        el('span', { class: 'dot', style: 'background:' + d.color }),
        el('span', { class: 'donut-legend__name', text: d.name }),
        el('span', { class: 'donut-legend__val', text: num(d.value) + ' · ' + pct((d.value / total) * 100) })
      ]);
    }));

    mount(host, el('div', { class: 'donut-wrap' }, [svg, legendBox]));
    return host;
  }

  /** قمع التحويل */
  function funnelChart(host, steps) {
    clear(host);
    var top = steps[0].value || 1;
    var wrap = el('div', { class: 'funnel' });
    steps.forEach(function (s, i) {
      var w = Math.max((s.value / top) * 100, 4);
      var prev = i ? steps[i - 1].value : null;
      var dropped = prev != null && prev > 0 ? Math.round(((prev - s.value) / prev) * 100) : null;
      wrap.appendChild(
        el('div', { class: 'funnel__row' }, [
          el('div', { class: 'funnel__head' }, [
            el('span', { class: 'funnel__label', text: s.label }),
            el('span', { class: 'funnel__value', text: num(s.value) })
          ]),
          el('div', { class: 'funnel__track' }, [
            el('div', { class: 'funnel__fill', style: 'width:' + w + '%;background:' + C.seq[Math.min(6, 2 + i)] })
          ]),
          el('div', { class: 'funnel__meta', text: i === 0 ? 'قاعدة القياس' : 'من السابق: ' + pct((s.value / (prev || 1)) * 100) + (dropped ? ' · تسرّب ' + pct(dropped) : '') })
        ])
      );
    });
    mount(host, wrap);
    return host;
  }

  function progress(value, max, tone) {
    var p = Math.min(100, (value / (max || 1)) * 100);
    return el('div', { class: 'progress' }, [
      el('div', { class: 'progress__fill progress__fill--' + (tone || 'ok'), style: 'width:' + p + '%' })
    ]);
  }

  /* ---------- الهوية والتنقل ---------- */

  function roleBar(current) {
    var links = [
      { href: 'index.html', label: 'الموقع', key: 'site' },
      { href: 'app.html', label: 'المريض', key: 'patient' },
      { href: 'doctor.html', label: 'الطبيب', key: 'doctor' },
      { href: 'supervisor.html', label: 'المشرف', key: 'supervisor' },
      { href: 'dashboard.html', label: 'الإدارة', key: 'admin' },
      { href: 'clinic.html', label: 'العيادة', key: 'clinic' }
    ];
    var bar = el('div', { class: 'rolebar' }, [
      el('span', { class: 'rolebar__tag', text: 'معاينة' }),
      el('div', { class: 'rolebar__links' }, links.map(function (l) {
        return el('a', { href: l.href, class: 'rolebar__link' + (l.key === current ? ' is-active' : ''), text: l.label });
      })),
      el('button', {
        class: 'rolebar__reset',
        text: 'تصفير البيانات',
        onclick: function () {
          confirmDialog('سيتم حذف كل البيانات التجريبية وإعادة توليدها من جديد. هل تريد المتابعة؟', function () {
            window.GC.store.reset();
            location.reload();
          }, 'تصفير');
        }
      })
    ]);
    document.body.appendChild(bar);
  }

  window.GC = window.GC || {};
  window.GC.ui = {
    $: $, $$: $$, el: el, esc: esc, clear: clear, mount: mount,
    num: num, money: money, pct: pct, date: date, shortDate: shortDate, dateTime: dateTime,
    dayName: dayName, ago: ago, hours: hours, normalizeDigits: normalizeDigits,
    toast: toast, modal: modal, confirmDialog: confirmDialog,
    badge: badge, stat: stat, empty: empty, table: table, progress: progress,
    lineChart: lineChart, barChart: barChart, hbarChart: hbarChart,
    donutChart: donutChart, funnelChart: funnelChart, legend: legend,
    colors: C, roleBar: roleBar
  };
})();
