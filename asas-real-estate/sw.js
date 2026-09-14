/* =============================================================
   عامل الخدمة — تشغيل الموقع بدون اتصال بعد أول زيارة
   ============================================================= */
var CACHE = 'asas-re-v1';

var ASSETS = [
  './',
  'index.html',
  'offers.html',
  'app.html',
  'css/app.css',
  'js/ui.js',
  'js/store.js',
  'js/media.js',
  'js/views.js',
  'js/site.js',
  'js/page-landing.js',
  'js/page-offers.js',
  'js/admin.js',
  'js/admin-property.js',
  'js/admin-offers.js',
  'js/admin-money.js',
  'manifest.webmanifest',
  'icons/favicon.svg'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      /* لا نُفشل التثبيت إذا تعذّر جلب ملف واحد */
      return Promise.all(ASSETS.map(function (url) { return c.add(url).catch(function () {}); }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) { return k === CACHE ? null : caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return; /* الخطوط والخرائط تُترك للمتصفح */

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
        return res;
      }).catch(function () {
        return caches.match(req).then(function (hit) { return hit || caches.match('index.html'); });
      })
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(function (hit) {
      var network = fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
        return res;
      }).catch(function () { return hit; });
      return hit || network;
    })
  );
});
