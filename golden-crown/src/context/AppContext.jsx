import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { loadDb, saveDb, resetDb, uid, makeCode, COMPLAINTS } from '../lib/db'
import { routeConsultation, computeUrgency } from '../lib/engine'

const Ctx = createContext(null)

export function AppProvider({ children }) {
  const [db, setDbState] = useState(() => loadDb())

  const commit = useCallback((updater) => {
    setDbState((prev) => {
      const next = typeof updater === 'function' ? updater(structuredClone(prev)) : updater
      saveDb(next)
      return next
    })
  }, [])

  const log = useCallback((next, { who, role, what, targetPatientId }) => {
    next.auditLog.unshift({
      id: uid('AL-'),
      who,
      role,
      what,
      targetPatientId,
      when: Date.now(),
    })
  }, [])

  // ---------- المريض ----------
  const loginPatient = useCallback(
    (phone) => {
      let patientId
      commit((d) => {
        let p = d.patients.find((x) => x.phone === phone)
        if (!p) {
          p = { id: uid('PT-'), phone, name: '', age: '', gender: '', region: '', chronic: '', allergies: '', createdAt: Date.now() }
          d.patients.push(p)
        }
        patientId = p.id
        d.session = { ...d.session, patientId, role: 'patient' }
        return d
      })
      return patientId
    },
    [commit],
  )

  const logout = useCallback(() => {
    commit((d) => {
      d.session = { patientId: null, role: 'guest', doctorId: null }
      return d
    })
  }, [commit])

  const saveDraft = useCallback(
    (patientId, partial) => {
      commit((d) => {
        const existing = d.drafts[patientId] || { step: 1, answers: {} }
        d.drafts[patientId] = {
          ...existing,
          ...partial,
          answers: { ...existing.answers, ...(partial.answers || {}) },
          updatedAt: Date.now(),
        }
        return d
      })
    },
    [commit],
  )

  const clearDraft = useCallback(
    (patientId) => {
      commit((d) => {
        delete d.drafts[patientId]
        return d
      })
    },
    [commit],
  )

  const updatePatientProfile = useCallback(
    (patientId, partial) => {
      commit((d) => {
        const p = d.patients.find((x) => x.id === patientId)
        if (p) Object.assign(p, partial)
        return d
      })
    },
    [commit],
  )

  /** إنهاء الاستبيان وإنشاء استشارة كمسودة غير مدفوعة */
  const finalizeQuestionnaire = useCallback(
    (patientId) => {
      let consultationId
      commit((d) => {
        const draft = d.drafts[patientId]
        if (!draft) return d
        const complaint = COMPLAINTS.find((c) => c.id === draft.answers.step2?.complaintId)
        const urgent = computeUrgency(draft.answers.step3, d.settings)
        const cs = {
          id: uid('CS-'),
          patientId,
          code: null,
          status: 'draft',
          urgent,
          complaintId: complaint?.id,
          specialty: complaint?.specialty || 'طب أسنان عام',
          doctorId: null,
          createdAt: Date.now(),
          answers: draft.answers,
          paymentStatus: 'pending',
          paymentMethod: null,
          opinion: '',
        }
        d.consultations.unshift(cs)
        consultationId = cs.id
        delete d.drafts[patientId]
        return d
      })
      return consultationId
    },
    [commit],
  )

  const isFreeEligible = useCallback(() => db.settings.usedFreeCount < db.settings.freeConsultationsLimit, [db])

  /** الدفع (محاكاة بوابة) أو تأكيد الأهلية المجانية — ثم التوجيه التلقائي للطبيب */
  const payConsultation = useCallback(
    (consultationId, method) => {
      let result = { ok: false }
      commit((d) => {
        const cs = d.consultations.find((c) => c.id === consultationId)
        if (!cs) return d
        const patient = d.patients.find((p) => p.id === cs.patientId)
        const free = method === 'free'
        if (method === 'fail-test') {
          cs.paymentStatus = 'failed'
          result = { ok: false, reason: 'payment_failed' }
          return d
        }
        cs.paymentStatus = 'paid'
        cs.paymentMethod = free ? 'free' : method
        cs.status = cs.urgent ? 'in_review' : 'new'
        cs.code = makeCode()
        if (free) d.settings.usedFreeCount += 1

        d.codes.push({
          id: uid('CD-'),
          value: cs.code,
          consultationId: cs.id,
          redeemed: false,
          discount: 0,
          clinicId: null,
          redeemedAt: null,
        })

        const region = patient?.region
        const routed = routeConsultation(d, { specialty: cs.specialty, regionId: region })
        if (routed.doctor) {
          cs.doctorId = routed.doctor.id
          cs.status = 'in_review'
        }
        if (cs.urgent) {
          log(d, { who: 'النظام', role: 'system', what: `تصعيد تلقائي لحالة طارئة ${cs.id}`, targetPatientId: cs.patientId })
        }
        result = { ok: true, code: cs.code, doctorFound: !!routed.doctor, fallback: routed.fallback }
        return d
      })
      return result
    },
    [commit, log],
  )

  const retryPayment = useCallback(
    (consultationId) => {
      commit((d) => {
        const cs = d.consultations.find((c) => c.id === consultationId)
        if (cs) cs.paymentStatus = 'pending'
        return d
      })
    },
    [commit],
  )

  const submitComplaint = useCallback(
    (consultationId, patientId, text) => {
      commit((d) => {
        d.complaints.unshift({ id: uid('CP-'), consultationId, patientId, text, status: 'open', createdAt: Date.now() })
        return d
      })
    },
    [commit],
  )

  // ---------- الطبيب ----------
  const viewConsultation = useCallback(
    (consultationId, viewer) => {
      commit((d) => {
        const cs = d.consultations.find((c) => c.id === consultationId)
        if (!cs) return d
        log(d, { who: viewer.name, role: viewer.role, what: `عرض بيانات/صور الاستشارة ${cs.id}`, targetPatientId: cs.patientId })
        return d
      })
    },
    [commit, log],
  )

  const submitOpinion = useCallback(
    (consultationId, doctorId, text) => {
      commit((d) => {
        const cs = d.consultations.find((c) => c.id === consultationId)
        if (!cs) return d
        cs.opinion = text
        cs.status = 'ready'
        cs.readyAt = Date.now()
        const doc = d.doctors.find((x) => x.id === doctorId)
        log(d, { who: doc?.name || 'طبيب', role: 'doctor', what: `كتابة رأي استشاري للحالة ${cs.id}`, targetPatientId: cs.patientId })
        return d
      })
    },
    [commit, log],
  )

  const updateDoctorProfile = useCallback(
    (doctorId, partial) => {
      commit((d) => {
        const doc = d.doctors.find((x) => x.id === doctorId)
        if (doc) Object.assign(doc, partial)
        return d
      })
    },
    [commit],
  )

  const addTemplate = useCallback(
    (title, body) => {
      commit((d) => {
        d.templates.push({ id: uid('TP-'), title, body })
        return d
      })
    },
    [commit],
  )

  // ---------- المشرف ----------
  const reassignConsultation = useCallback(
    (consultationId, newDoctorId, reason) => {
      commit((d) => {
        const cs = d.consultations.find((c) => c.id === consultationId)
        if (!cs) return d
        const prevDoctor = d.doctors.find((x) => x.id === cs.doctorId)
        cs.doctorId = newDoctorId
        cs.status = 'in_review'
        cs.reassignedAt = Date.now()
        log(d, {
          who: 'المشرف',
          role: 'supervisor',
          what: `إعادة توجيه ${cs.id} من ${prevDoctor?.name || '—'} إلى طبيب آخر — السبب: ${reason || 'تجاوز مدة الرد'}`,
          targetPatientId: cs.patientId,
        })
        return d
      })
    },
    [commit, log],
  )

  const addQualityNote = useCallback(
    (consultationId, note) => {
      commit((d) => {
        const cs = d.consultations.find((c) => c.id === consultationId)
        if (cs) {
          cs.qualityNotes = cs.qualityNotes || []
          cs.qualityNotes.unshift({ id: uid('QN-'), note, when: Date.now() })
        }
        return d
      })
    },
    [commit],
  )

  const resolveComplaint = useCallback(
    (complaintId, note) => {
      commit((d) => {
        const c = d.complaints.find((x) => x.id === complaintId)
        if (c) {
          c.status = 'resolved'
          c.note = note
          c.resolvedAt = Date.now()
        }
        return d
      })
    },
    [commit],
  )

  const bookAppointment = useCallback(
    (consultationId, doctorId, when) => {
      commit((d) => {
        const cs = d.consultations.find((c) => c.id === consultationId)
        if (cs) cs.appointment = { doctorId, when, bookedAt: Date.now() }
        return d
      })
    },
    [commit],
  )

  // ---------- الموقع التسويقي ----------
  const applyAsDoctor = useCallback(
    (data) => {
      commit((d) => {
        d.doctors.push({
          id: uid('DR-'),
          status: 'pending',
          rating: 0,
          reviewsCount: 0,
          hours: [],
          credentials: data.fileName ? [{ name: 'شهادة/إجازة مرفوعة عند التسجيل', fileName: data.fileName }] : [],
          photo: null,
          createdAt: Date.now(),
          name: data.name,
          phone: data.phone,
          specialty: data.specialty,
          clinicId: null,
          region: data.region,
          bio: data.bio || '',
        })
        return d
      })
    },
    [commit],
  )

  const registerInterest = useCallback(
    (type, data) => {
      commit((d) => {
        d.interests.unshift({ id: uid('IN-'), type, ...data, createdAt: Date.now() })
        return d
      })
    },
    [commit],
  )

  // ---------- الإدمن ----------
  const setDoctorStatus = useCallback(
    (doctorId, status) => {
      commit((d) => {
        const doc = d.doctors.find((x) => x.id === doctorId)
        if (doc) doc.status = status
        return d
      })
    },
    [commit],
  )

  const redeemCode = useCallback(
    (value, clinicId) => {
      let result = { ok: false }
      commit((d) => {
        const code = d.codes.find((c) => c.value === value.trim())
        if (!code) {
          result = { ok: false, reason: 'not_found' }
          return d
        }
        if (code.redeemed) {
          result = { ok: false, reason: 'already_redeemed', at: code.redeemedAt }
          return d
        }
        const cs = d.consultations.find((c) => c.id === code.consultationId)
        code.redeemed = true
        code.redeemedAt = Date.now()
        code.clinicId = clinicId

        if (cs) {
          const doctorShare = Math.round(d.settings.consultFee * 0.7)
          const platformShare = d.settings.consultFee - doctorShare
          d.transactions.unshift({
            id: uid('TX-'),
            consultationId: cs.id,
            doctorId: cs.doctorId,
            clinicId,
            amount: d.settings.consultFee,
            doctorShare,
            platformShare,
            settled: false,
            date: Date.now(),
          })
          log(d, { who: 'عيادة/موظف صرف', role: 'clinic', what: `صرف الكود ${value} للحالة ${cs.id}`, targetPatientId: cs.patientId })
        }
        result = { ok: true }
        return d
      })
      return result
    },
    [commit, log],
  )

  const settleTransaction = useCallback(
    (txId) => {
      commit((d) => {
        const tx = d.transactions.find((t) => t.id === txId)
        if (tx) tx.settled = true
        return d
      })
    },
    [commit],
  )

  const updateSettings = useCallback(
    (partial) => {
      commit((d) => {
        d.settings = { ...d.settings, ...partial }
        return d
      })
    },
    [commit],
  )

  const setRole = useCallback(
    (role, extra = {}) => {
      commit((d) => {
        d.session = { ...d.session, role, ...extra }
        return d
      })
    },
    [commit],
  )

  const hardReset = useCallback(() => {
    setDbState(resetDb())
  }, [])

  const value = useMemo(
    () => ({
      db,
      loginPatient,
      logout,
      saveDraft,
      clearDraft,
      updatePatientProfile,
      finalizeQuestionnaire,
      isFreeEligible,
      payConsultation,
      retryPayment,
      submitComplaint,
      viewConsultation,
      submitOpinion,
      updateDoctorProfile,
      addTemplate,
      reassignConsultation,
      addQualityNote,
      resolveComplaint,
      setDoctorStatus,
      redeemCode,
      settleTransaction,
      updateSettings,
      setRole,
      hardReset,
      applyAsDoctor,
      registerInterest,
      bookAppointment,
    }),
    [
      db,
      loginPatient,
      logout,
      saveDraft,
      clearDraft,
      updatePatientProfile,
      finalizeQuestionnaire,
      isFreeEligible,
      payConsultation,
      retryPayment,
      submitComplaint,
      viewConsultation,
      submitOpinion,
      updateDoctorProfile,
      addTemplate,
      reassignConsultation,
      addQualityNote,
      resolveComplaint,
      setDoctorStatus,
      redeemCode,
      settleTransaction,
      updateSettings,
      setRole,
      hardReset,
      applyAsDoctor,
      registerInterest,
      bookAppointment,
    ],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useApp() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
