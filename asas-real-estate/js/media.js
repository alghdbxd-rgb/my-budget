/* =============================================================
   الوسائط — صور وفيديوهات العقار
   -------------------------------------------------------------
   الصور تُضغط داخل المتصفح قبل الحفظ، والملفات تُخزَّن في
   IndexedDB (يتحمّل الفيديو والملفات الكبيرة)، ويُرجَع للتخزين
   المحلي البسيط إذا كان المتصفح لا يسمح بـ IndexedDB.
   الروابط الخارجية (يوتيوب/درايف/رابط مباشر) تُحفظ كرابط فقط.
   ============================================================= */
(function () {
  'use strict';

  window.AS = window.AS || {};

  var DB_NAME = 'asas-media';
  var STORE = 'files';
  var LS_PREFIX = 'asas-media-';
  var urlCache = {};
  var idbFailed = false;

  function openDB() {
    return new Promise(function (resolve, reject) {
      if (idbFailed || !window.indexedDB) return reject(new Error('no-idb'));
      var req;
      try { req = indexedDB.open(DB_NAME, 1); }
      catch (e) { idbFailed = true; return reject(e); }
      req.onupgradeneeded = function () {
        var d = req.result;
        if (!d.objectStoreNames.contains(STORE)) d.createObjectStore(STORE, { keyPath: 'id' });
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { idbFailed = true; reject(req.error || new Error('idb-error')); };
      req.onblocked = function () { reject(new Error('idb-blocked')); };
    });
  }

  function idbPut(rec) {
    return openDB().then(function (d) {
      return new Promise(function (resolve, reject) {
        var tx = d.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).put(rec);
        tx.oncomplete = function () { resolve(rec); };
        tx.onerror = function () { reject(tx.error); };
      });
    });
  }

  function idbGet(mid) {
    return openDB().then(function (d) {
      return new Promise(function (resolve, reject) {
        var tx = d.transaction(STORE, 'readonly');
        var r = tx.objectStore(STORE).get(mid);
        r.onsuccess = function () { resolve(r.result || null); };
        r.onerror = function () { reject(r.error); };
      });
    });
  }

  function idbDel(mid) {
    return openDB().then(function (d) {
      return new Promise(function (resolve) {
        var tx = d.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).delete(mid);
        tx.oncomplete = function () { resolve(); };
        tx.onerror = function () { resolve(); };
      });
    }).catch(function () {});
  }

  /* ---------- ضغط الصور ---------- */

  function compressImage(file, maxSide, quality) {
    return new Promise(function (resolve) {
      var reader = new FileReader();
      reader.onload = function () {
        var img = new Image();
        img.onload = function () {
          var w = img.naturalWidth, h = img.naturalHeight;
          var scale = Math.min(1, (maxSide || 1400) / Math.max(w, h));
          var cw = Math.round(w * scale), ch = Math.round(h * scale);
          var canvas = document.createElement('canvas');
          canvas.width = cw; canvas.height = ch;
          var ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, cw, ch);
          canvas.toBlob(function (blob) {
            resolve(blob && blob.size < file.size ? blob : file);
          }, 'image/jpeg', quality || 0.74);
        };
        img.onerror = function () { resolve(file); };
        img.src = reader.result;
      };
      reader.onerror = function () { resolve(file); };
      reader.readAsDataURL(file);
    });
  }

  function blobToDataUrl(blob) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () { resolve(r.result); };
      r.onerror = function () { reject(r.error); };
      r.readAsDataURL(blob);
    });
  }

  /* ---------- الإضافة ---------- */

  /** يضيف ملفاً ويُرجع مرجع وسائط جاهزاً للحفظ داخل العقار */
  function add(file) {
    var kind = file.type.indexOf('video') === 0 ? 'video' : 'image';
    var mid = 'm-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);

    var prep = kind === 'image' ? compressImage(file, 1400, 0.74) : Promise.resolve(file);

    return prep.then(function (blob) {
      var ref = { id: mid, kind: kind, name: file.name, size: blob.size, type: blob.type || file.type, src: 'idb', cover: false };
      return idbPut({ id: mid, blob: blob, name: file.name, type: blob.type || file.type, kind: kind, createdAt: Date.now() })
        .then(function () { return ref; })
        .catch(function () {
          /* لا يوجد IndexedDB: نحفظ الصور الصغيرة فقط كنص داخل التخزين المحلي */
          if (kind === 'video') throw new Error('video-needs-idb');
          return compressImage(file, 1000, 0.6).then(blobToDataUrl).then(function (dataUrl) {
            if (dataUrl.length > 900000) throw new Error('too-big');
            localStorage.setItem(LS_PREFIX + mid, dataUrl);
            ref.src = 'data';
            ref.size = dataUrl.length;
            return ref;
          });
        });
    });
  }

  /** يضيف رابطاً خارجياً (يوتيوب، درايف، أو رابط مباشر) */
  function addLink(url, kind, name) {
    var clean = String(url || '').trim();
    if (!clean) return null;
    return {
      id: 'm-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7),
      kind: kind || (isVideoLink(clean) ? 'video' : 'image'),
      src: 'link', url: clean, name: name || clean.slice(0, 60), size: 0, cover: false
    };
  }

  function isVideoLink(u) {
    return /youtu\.be|youtube\.com|vimeo\.com|\.mp4($|\?)|\.webm($|\?)|drive\.google\.com/i.test(u);
  }

  /** رابط تضمين يوتيوب/درايف إن وُجد، وإلا الرابط كما هو */
  function embedUrl(u) {
    var m = String(u).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,})/);
    if (m) return 'https://www.youtube.com/embed/' + m[1];
    var g = String(u).match(/drive\.google\.com\/file\/d\/([\w-]+)/);
    if (g) return 'https://drive.google.com/file/d/' + g[1] + '/preview';
    var v = String(u).match(/vimeo\.com\/(\d+)/);
    if (v) return 'https://player.vimeo.com/video/' + v[1];
    return null;
  }

  /* ---------- القراءة ---------- */

  /** يُرجع رابطاً صالحاً للعرض (Promise) */
  function url(ref) {
    if (!ref) return Promise.resolve('');
    if (ref.src === 'link') return Promise.resolve(ref.url);
    if (urlCache[ref.id]) return Promise.resolve(urlCache[ref.id]);
    if (ref.src === 'data') {
      var d = localStorage.getItem(LS_PREFIX + ref.id) || '';
      urlCache[ref.id] = d;
      return Promise.resolve(d);
    }
    return idbGet(ref.id).then(function (rec) {
      if (!rec || !rec.blob) return '';
      var u = URL.createObjectURL(rec.blob);
      urlCache[ref.id] = u;
      return u;
    }).catch(function () { return ''; });
  }

  /** يملأ عنصر <img> أو <video> بالمصدر الصحيح */
  function attach(node, ref) {
    if (!node || !ref) return;
    url(ref).then(function (u) { if (u) node.src = u; });
  }

  function del(ref) {
    if (!ref) return;
    if (ref.src === 'data') localStorage.removeItem(LS_PREFIX + ref.id);
    else if (ref.src === 'idb') idbDel(ref.id);
    delete urlCache[ref.id];
  }

  /** حجم الوسائط المخزَّنة تقريبياً (بايت) */
  function usage(mediaLists) {
    var total = 0;
    (mediaLists || []).forEach(function (list) {
      (list || []).forEach(function (m) { total += m.size || 0; });
    });
    return total;
  }

  function humanSize(bytes) {
    if (!bytes) return '—';
    if (bytes > 1048576) return (bytes / 1048576).toFixed(1) + ' م.ب';
    if (bytes > 1024) return Math.round(bytes / 1024) + ' ك.ب';
    return bytes + ' بايت';
  }

  window.AS.media = {
    add: add, addLink: addLink, url: url, attach: attach, del: del,
    isVideoLink: isVideoLink, embedUrl: embedUrl, usage: usage, humanSize: humanSize
  };
})();
