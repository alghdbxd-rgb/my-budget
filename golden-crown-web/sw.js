/* =============================================================
   عامل الخدمة — تشغيل التطبيق بدون اتصال وتحمّل ضعف الشبكة (NFR-12)
   ============================================================= */
var CACHE = 'gc-web-v1';

var ASSETS = [
  './',
  'index.html',
  'app.html',
  'doctor.html',
  'supervisor.html',
  'dashboard.html',
  'clinic.html',
  'css/app.css',
  'js/store.js',
  'js/engine.js',
  'js/ui.js',
  'js/page-landing.js',
  'js/page-patient.js',
  'js/page-doctor.js',
  'js/page-supervisor.js',
  'js/page-dashboard.js',
  'js/page-clinic.js',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      /* لا نُفشل التثبيت إذا تعذّر جلب ملف واحد */
      return Promise.all(ASSETS.map(function (url) {
        return c.add(url).catch(function () {});
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        return k === CACHE ? null : caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return; /* الخطوط الخارجية تُترك للمتصفح */

  if (req.mode === 'navigate') {
    /* الشبكة أولاً للصفحات، مع الرجوع للنسخة المخزّنة عند انقطاع الاتصال */
    e.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
        return res;
      }).catch(function () {
        return caches.match(req).then(function (hit) {
          return hit || caches.match('index.html');
        });
      })
    );
    return;
  }

  /* الملفات الثابتة: من المخزن أولاً ثم تحديثها في الخلفية */
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
