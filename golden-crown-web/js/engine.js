/* =============================================================
   محرك المنصة — التوجيه الجغرافي، التصعيد، التسعير، والمؤشرات
   ============================================================= */
(function () {
  'use strict';

  var S = window.GC.store;

  /* ---------- جغرافيا ---------- */

  function haversine(a, b) {
    if (!a || !b) return Infinity;
    var R = 6371;
    var dLat = ((b.lat - a.lat) * Math.PI) / 180;
    var dLng = ((b.lng - a.lng) * Math.PI) / 180;
    var la1 = (a.lat * Math.PI) / 180;
    var la2 = (b.lat * Math.PI) / 180;
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(la1) * Math.cos(la2);
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  function govById(id) {
    return S.GOVERNORATES.filter(function (g) { return g.id === id; })[0] || null;
  }

  function clinicById(db, id) {
    return db.clinics.filter(function (c) { return c.id === id; })[0] || null;
  }

  function doctorById(db, id) {
    return db.doctors.filter(function (d) { return d.id === id; })[0] || null;
  }

  function patientById(db, id) {
    return db.patients.filter(function (p) { return p.id === id; })[0] || null;
  }

  function consultationById(db, id) {
    return db.consultations.filter(function (c) { return c.id === id; })[0] || null;
  }

  /** ترتيب الأطباء المرشّحين: التخصص أولاً، ثم الأقرب جغرافياً، ثم الأقل حِملاً (FR-8) */
  function rankDoctors(db, opts) {
    var origin = govById(opts.regionId);
    var openLoad = {};
    db.consultations.forEach(function (c) {
      if (c.doctorId && (c.status === 'new' || c.status === 'in_review')) {
        openLoad[c.doctorId] = (openLoad[c.doctorId] || 0) + 1;
      }
    });

    var active = db.doctors.filter(function (d) { return d.status === 'active'; });
    var exact = active.filter(function (d) { return d.specialty === opts.specialty; });
    var pool = exact.length ? exact : active;

    return pool
      .map(function (d) {
        var clinic = clinicById(db, d.clinicId);
        var dist = clinic && origin ? haversine(origin, clinic) : 999;
        var load = openLoad[d.id] || 0;
        return {
          doctor: d,
          clinic: clinic,
          distanceKm: Math.round(dist),
          load: load,
          exactSpecialty: exact.length > 0,
          score: dist + load * 12 - (d.rating || 0) * 8
        };
      })
      .sort(function (a, b) { return a.score - b.score; });
  }

  function routeConsultation(db, opts) {
    var ranked = rankDoctors(db, opts);
    return {
      doctor: ranked.length ? ranked[0].doctor : null,
      matches: ranked.slice(0, 5),
      fallbackSpecialty: ranked.length ? !ranked[0].exactSpecialty : false
    };
  }

  /** تصعيد الحالات الطارئة (FR-9) — القيم قابلة للتعديل من لوحة الإدارة */
  function computeUrgency(step3, settings) {
    if (!step3) return false;
    var e = settings.escalation;
    var painHit = Number(step3.painLevel || 0) >= e.painThreshold;
    var swellingHit = e.requireSwelling ? !!step3.swelling : true;
    var feverHit = e.requireFever ? !!step3.fever : true;
    return painHit && swellingHit && feverHit;
  }

  /** أهلية الاستشارة المجانية (FR-24 — والبند المتعارض D5) */
  function freeEligibility(db, patientId) {
    var s = db.settings;
    if (s.freeMode === 'per_user') {
      var used = db.consultations.filter(function (c) {
        return c.patientId === patientId && c.paymentMethod === 'free';
      }).length;
      return { eligible: used < s.freePerUser, used: used, cap: s.freePerUser, mode: 'per_user' };
    }
    return { eligible: s.freeUsed < s.freeTotalCap, used: s.freeUsed, cap: s.freeTotalCap, mode: 'total_cap' };
  }

  /* ---------- حالات الاستشارة ---------- */

  var STATUS = {
    draft: { label: 'غير مكتملة', tone: 'muted' },
    new: { label: 'جديدة', tone: 'info' },
    in_review: { label: 'قيد المراجعة', tone: 'warn' },
    answered: { label: 'مُجاب عليها', tone: 'ok' },
    closed: { label: 'مغلقة', tone: 'muted' }
  };

  function statusLabel(k) { return (STATUS[k] || { label: k }).label; }
  function statusTone(k) { return (STATUS[k] || { tone: 'muted' }).tone; }

  /** هل تجاوزت الحالة زمن الرد الملزم؟ (NFR-14) */
  function isOverdue(db, cs) {
    if (cs.status !== 'new' && cs.status !== 'in_review') return false;
    var limitMs = cs.urgent ? db.settings.urgentSlaMinutes * 60000 : db.settings.slaHours * 3600000;
    return Date.now() - cs.createdAt > limitMs;
  }

  /** هل يحق للمريض طلب استرجاع المبلغ؟ (FR-28) */
  function refundEligible(db, cs) {
    if (db.settings.refundPolicy === 'none') return false;
    if (!cs || cs.paymentStatus !== 'paid' || !cs.amount) return false;
    if (cs.status === 'answered' || cs.status === 'closed') return false;
    if (cs.refund) return false;
    return Date.now() - cs.createdAt > db.settings.refundAfterHours * 3600000;
  }

  /* ---------- مؤشرات لوحة الإدارة ---------- */

  function inRange(ts, days) {
    return Date.now() - ts <= days * S.DAY;
  }

  function metrics(db, days) {
    days = days || 30;
    var all = db.consultations;
    var period = all.filter(function (c) { return inRange(c.createdAt, days); });
    var prev = all.filter(function (c) {
      var age = Date.now() - c.createdAt;
      return age > days * S.DAY && age <= days * 2 * S.DAY;
    });

    function paid(list) {
      return list.filter(function (c) { return c.paymentStatus === 'paid'; });
    }
    function answered(list) {
      return list.filter(function (c) { return c.status === 'answered' || c.status === 'closed'; });
    }

    var periodPaid = paid(period);
    var periodAnswered = answered(period);

    var revenue = 0;
    var platformShare = 0;
    var doctorShare = 0;
    var refunded = 0;
    db.transactions.forEach(function (t) {
      if (!inRange(t.date, days)) return;
      revenue += t.amount;
      platformShare += t.platformShare;
      doctorShare += t.doctorShare;
      if (t.type === 'refund') refunded += Math.abs(t.amount);
    });

    var responseTimes = periodAnswered
      .filter(function (c) { return c.responseHours != null; })
      .map(function (c) { return c.responseHours; });
    var avgResponse = responseTimes.length
      ? Math.round((responseTimes.reduce(function (a, b) { return a + b; }, 0) / responseTimes.length) * 10) / 10
      : 0;

    var slaBreaches = period.filter(function (c) {
      if (c.responseHours != null) return c.responseHours > db.settings.slaHours;
      return isOverdue(db, c);
    }).length;

    var newPatients = db.patients.filter(function (p) { return inRange(p.createdAt, days); }).length;
    var prevPatients = db.patients.filter(function (p) {
      var age = Date.now() - p.createdAt;
      return age > days * S.DAY && age <= days * 2 * S.DAY;
    }).length;

    var redeemed = db.codes.filter(function (c) { return c.redeemed && inRange(c.redeemedAt, days); }).length;
    var issued = db.codes.filter(function (c) {
      var cs = consultationById(db, c.consultationId);
      return cs && inRange(cs.createdAt, days);
    }).length;

    function delta(cur, before) {
      if (!before) return cur ? 100 : 0;
      return Math.round(((cur - before) / before) * 100);
    }

    return {
      days: days,
      patients: { total: db.patients.length, period: newPatients, delta: delta(newPatients, prevPatients) },
      consultations: { total: all.length, period: period.length, delta: delta(period.length, prev.length) },
      paid: periodPaid.length,
      answered: periodAnswered.length,
      urgent: period.filter(function (c) { return c.urgent; }).length,
      open: all.filter(function (c) { return c.status === 'new' || c.status === 'in_review'; }).length,
      overdue: all.filter(function (c) { return isOverdue(db, c); }).length,
      revenue: revenue,
      refunded: refunded,
      refundRequests: all.filter(function (c) { return c.refund && c.refund.status === 'requested'; }).length,
      platformShare: platformShare,
      doctorShare: doctorShare,
      unsettled: db.transactions.filter(function (t) { return !t.settled; }).reduce(function (a, t) { return a + t.doctorShare; }, 0),
      avgResponse: avgResponse,
      slaBreaches: slaBreaches,
      conversion: period.length ? Math.round((periodPaid.length / period.length) * 100) : 0,
      redemption: issued ? Math.round((redeemed / issued) * 100) : 0,
      redeemed: redeemed,
      freeLeft: Math.max(0, db.settings.freeTotalCap - db.settings.freeUsed)
    };
  }

  /** قمع التحويل: زيارات ← تسجيل ← استبيان ← دفع ← رد ← صرف الكود */
  function funnel(db, days) {
    days = days || 30;
    var visits = db.visits
      .filter(function (v) { return inRange(v.date, days); })
      .reduce(function (a, v) { return a + v.count; }, 0);
    var signups = db.patients.filter(function (p) { return inRange(p.createdAt, days); }).length;
    var started = db.consultations.filter(function (c) { return inRange(c.createdAt, days); }).length;
    var paid = db.consultations.filter(function (c) { return inRange(c.createdAt, days) && c.paymentStatus === 'paid'; }).length;
    var answered = db.consultations.filter(function (c) {
      return inRange(c.createdAt, days) && (c.status === 'answered' || c.status === 'closed');
    }).length;
    var redeemed = db.codes.filter(function (c) { return c.redeemed && inRange(c.redeemedAt, days); }).length;

    return [
      { key: 'visits', label: 'زيارات الموقع', value: visits },
      { key: 'signups', label: 'تسجيل مستخدمين', value: signups },
      { key: 'started', label: 'بدء استبيان', value: started },
      { key: 'paid', label: 'استشارات مدفوعة/مجانية مؤكدة', value: paid },
      { key: 'answered', label: 'ردّ الطبيب', value: answered },
      { key: 'redeemed', label: 'صرف الكود في العيادة', value: redeemed }
    ];
  }

  /** سلسلة زمنية يومية للاستشارات والإيراد */
  function timeseries(db, days) {
    days = days || 30;
    var buckets = [];
    var map = {};
    var i;
    for (i = days - 1; i >= 0; i--) {
      var d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      var key = d.getTime();
      var row = { date: key, consultations: 0, answered: 0, revenue: 0 };
      map[key] = row;
      buckets.push(row);
    }
    function bucketOf(ts) {
      var d = new Date(ts);
      d.setHours(0, 0, 0, 0);
      return map[d.getTime()];
    }
    db.consultations.forEach(function (c) {
      var b = bucketOf(c.createdAt);
      if (b) b.consultations++;
      if (c.answeredAt) {
        var b2 = bucketOf(c.answeredAt);
        if (b2) b2.answered++;
      }
    });
    db.transactions.forEach(function (t) {
      var b = bucketOf(t.date);
      if (b) b.revenue += t.amount;
    });
    return buckets;
  }

  /** التوزيع الجغرافي (FR-29) */
  function byGovernorate(db, days) {
    days = days || 30;
    var counts = {};
    db.consultations.forEach(function (c) {
      if (!inRange(c.createdAt, days)) return;
      var r = (c.answers && c.answers.step1 && c.answers.step1.region) || 'unknown';
      counts[r] = (counts[r] || 0) + 1;
    });
    return S.GOVERNORATES.map(function (g) {
      return { id: g.id, name: g.name, value: counts[g.id] || 0 };
    }).sort(function (a, b) { return b.value - a.value; });
  }

  /** أداء قنوات الإحالة الأربع (FR-36) */
  function byChannel(db, days) {
    days = days || 30;
    var visits = {};
    db.visits.forEach(function (v) {
      if (!inRange(v.date, days)) return;
      visits[v.channel] = (visits[v.channel] || 0) + v.count;
    });
    var consults = {};
    db.consultations.forEach(function (c) {
      if (!inRange(c.createdAt, days)) return;
      var ch = c.channel || 'direct';
      consults[ch] = (consults[ch] || 0) + 1;
    });
    return S.CHANNELS.map(function (ch) {
      var v = visits[ch.id] || 0;
      var c = consults[ch.id] || 0;
      return {
        id: ch.id,
        name: ch.name,
        target: ch.target,
        visits: v,
        consultations: c,
        conversion: v ? Math.round((c / v) * 1000) / 10 : 0
      };
    });
  }

  /** توزيع الشكاوى الرئيسية */
  function byComplaint(db, days) {
    days = days || 30;
    var counts = {};
    db.consultations.forEach(function (c) {
      if (!inRange(c.createdAt, days)) return;
      counts[c.complaintId] = (counts[c.complaintId] || 0) + 1;
    });
    return S.COMPLAINTS.map(function (c) {
      return { id: c.id, name: c.label, icon: c.icon, value: counts[c.id] || 0 };
    })
      .filter(function (x) { return x.value > 0; })
      .sort(function (a, b) { return b.value - a.value; });
  }

  /** مؤشرات جودة لكل طبيب (FR-18) */
  function doctorQuality(db, days) {
    days = days || 90;
    return db.doctors
      .map(function (d) {
        var cases = db.consultations.filter(function (c) {
          return c.doctorId === d.id && inRange(c.createdAt, days);
        });
        var answered = cases.filter(function (c) { return c.responseHours != null; });
        var avg = answered.length
          ? Math.round((answered.reduce(function (a, c) { return a + c.responseHours; }, 0) / answered.length) * 10) / 10
          : null;
        var ratings = cases.filter(function (c) { return c.patientRating; });
        var avgRating = ratings.length
          ? Math.round((ratings.reduce(function (a, c) { return a + c.patientRating; }, 0) / ratings.length) * 10) / 10
          : null;
        var breaches = answered.filter(function (c) { return c.responseHours > db.settings.slaHours; }).length;
        var earned = db.transactions
          .filter(function (t) { return t.doctorId === d.id && inRange(t.date, days); })
          .reduce(function (a, t) { return a + t.doctorShare; }, 0);
        return {
          doctor: d,
          cases: cases.length,
          answered: answered.length,
          open: cases.filter(function (c) { return c.status === 'new' || c.status === 'in_review'; }).length,
          avgResponse: avg,
          avgRating: avgRating,
          breaches: breaches,
          earned: earned
        };
      })
      .sort(function (a, b) { return b.cases - a.cases; });
  }

  window.GC.engine = {
    haversine: haversine,
    govById: govById,
    clinicById: clinicById,
    doctorById: doctorById,
    patientById: patientById,
    consultationById: consultationById,
    rankDoctors: rankDoctors,
    routeConsultation: routeConsultation,
    computeUrgency: computeUrgency,
    freeEligibility: freeEligibility,
    STATUS: STATUS,
    statusLabel: statusLabel,
    statusTone: statusTone,
    isOverdue: isOverdue,
    refundEligible: refundEligible,
    metrics: metrics,
    funnel: funnel,
    timeseries: timeseries,
    byGovernorate: byGovernorate,
    byChannel: byChannel,
    byComplaint: byComplaint,
    doctorQuality: doctorQuality
  };
})();
