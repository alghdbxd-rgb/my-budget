/* =============================================================
   صفحة العروض العامة — البحث السريع بين كل العروض
   ============================================================= */
(function () {
  'use strict';

  var U = window.AS.ui;
  var S = window.AS.store;
  var V = window.AS.views;
  var el = U.el;

  var p = window.AS.site.params();
  var q = V.defaultQuery({
    status: 'active',
    text: p.q || '',
    kind: p.kind || '',
    type: p.type || '',
    gov: p.gov || ''
  });

  var host = U.$('#offers-page');

  function render() {
    var views = S.offersView();
    var list = V.applyQuery(views, q);

    U.mount(host, el('div', { class: 'stack' }, [
      el('div', {}, [
        el('span', { class: 'eyebrow', text: 'سوق العروض' }),
        el('h1', { text: 'دوّر على العقار الي يناسبك' }),
        el('p', { class: 'muted', text: 'ابحث بالكود أو المنطقة أو أي كلمة، وفلتر حسب النوع والسعر والمساحة.' })
      ]),
      V.searchPanel(q, function () { render(); }, { showStatus: false, defaultStatus: 'active' }),
      el('div', { class: 'row row--between' }, [
        el('span', { class: 'small muted', text: 'النتائج: ' + U.num(list.length) + ' عرض' }),
        el('a', { class: 'btn btn--ghost btn--sm', href: 'index.html#contact', text: '📝 ما لكيت؟ سجّل طلبك' })
      ]),
      list.length
        ? el('div', { class: 'prop-grid' }, list.map(function (v) { return V.offerCard(v); }))
        : U.empty('ما في عرض مطابق — جرّب توسيع البحث', '🔍')
    ]));
  }

  window.AS.site.fillCompany();
  render();

  /* فتح عرض مباشرة عبر الرابط: offers.html?o=ض-2001 */
  if (p.o) {
    var match = S.offersView().filter(function (v) { return v.offer.code === p.o || v.offer.id === p.o; })[0];
    if (match) V.detailModal(match);
  }
})();
