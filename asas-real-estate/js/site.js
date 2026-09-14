/* =============================================================
   أدوات مشتركة لصفحات الموقع العام (الترويسة والتذييل)
   ============================================================= */
(function () {
  'use strict';

  var U = window.AS.ui;
  var S = window.AS.store;

  /** يملأ اسم الشركة وبيانات التواصل في أي عنصر يحمل data-* */
  function fillCompany() {
    var s = S.db.settings;
    U.$$('[data-company]').forEach(function (n) { n.textContent = s.company; });
    U.$$('[data-slogan]').forEach(function (n) { n.textContent = s.slogan; });
    U.$$('[data-address]').forEach(function (n) { n.textContent = s.address; });
    U.$$('[data-phone]').forEach(function (n) { n.textContent = s.phone; });
    U.$$('[data-email]').forEach(function (n) { n.textContent = s.email; });
    U.$$('[data-phone-line]').forEach(function (n) { n.textContent = '📞 ' + s.phone + ' · ' + s.email; });
    U.$$('[data-tel-href]').forEach(function (n) { n.href = 'tel:' + s.phone; });
    U.$$('[data-wa-href]').forEach(function (n) {
      n.href = U.whatsapp(s.whatsapp, 'مرحباً، أريد الاستفسار عن عروضكم العقارية');
    });
    U.$$('[data-year]').forEach(function (n) { n.textContent = new Date().getFullYear(); });
    var slot = U.$('#theme-slot');
    if (slot && !slot.firstChild) slot.appendChild(U.themeToggle());
    document.title = document.title.replace('أساس للاستثمار العقاري', s.company);
  }

  /** يقرأ معايير البحث من رابط الصفحة */
  function params() {
    var out = {};
    (location.search || '').replace(/^\?/, '').split('&').forEach(function (pair) {
      if (!pair) return;
      var kv = pair.split('=');
      out[decodeURIComponent(kv[0])] = decodeURIComponent((kv[1] || '').replace(/\+/g, ' '));
    });
    return out;
  }

  window.AS.site = { fillCompany: fillCompany, params: params };
})();
