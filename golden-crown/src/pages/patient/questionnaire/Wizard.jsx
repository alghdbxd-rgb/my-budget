import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { useApp } from '../../../context/AppContext'
import StepDots from '../../../components/ui/StepDots'
import Button from '../../../components/ui/Button'
import Step1 from './Step1'
import Step2 from './Step2'
import Step3 from './Step3'
import Step4 from './Step4'
import { validateStep1, validateStep2, validateStep3, validateStep4 } from '../../../lib/validate'

const STEPS = [
  { n: 1, Comp: Step1, validate: validateStep1, key: 'step1' },
  { n: 2, Comp: Step2, validate: validateStep2, key: 'step2' },
  { n: 3, Comp: Step3, validate: validateStep3, key: 'step3' },
  { n: 4, Comp: Step4, validate: validateStep4, key: 'step4' },
]

export default function Wizard() {
  const { step } = useParams()
  const nav = useNavigate()
  const { db, saveDraft, finalizeQuestionnaire } = useApp()
  const patientId = db.session.patientId
  const draft = db.drafts[patientId]

  const n = Math.min(4, Math.max(1, Number(step) || 1))
  const current = STEPS[n - 1]
  const [value, setValue] = useState(() => draft?.answers?.[current.key] || {})
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setValue(draft?.answers?.[current.key] || {})
    setErrors({})
    window.scrollTo(0, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n])

  const handleChange = (next) => {
    setValue(next)
    saveDraft(patientId, { step: n, answers: { [current.key]: next } })
  }

  const goNext = () => {
    const res = current.validate(value)
    if (!res.valid) {
      setErrors(res.errors)
      return
    }
    setErrors({})
    if (n < 4) {
      nav(`/p/consult/${n + 1}`)
    } else {
      const id = finalizeQuestionnaire(patientId)
      nav(`/p/payment/${id}`)
    }
  }

  const goBack = () => {
    if (n > 1) nav(`/p/consult/${n - 1}`)
    else nav('/p')
  }

  const Comp = current.Comp

  return (
    <div className="mx-auto min-h-screen max-w-md px-4 pb-32 pt-5">
      <button onClick={goBack} className="mb-3 flex items-center gap-1 text-sm font-semibold text-teal-800">
        <ChevronRight size={16} /> {n > 1 ? 'الشاشة السابقة' : 'الرئيسية'}
      </button>
      <StepDots total={4} current={n} />
      <Comp value={value} onChange={handleChange} errors={errors} />

      <div className="fixed inset-x-0 bottom-0 border-t border-black/5 bg-white/95 p-4 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <Button onClick={goNext} variant="gold" className="flex-1 py-3.5">
            {n < 4 ? (
              <>
                التالي <ChevronLeft size={18} />
              </>
            ) : (
              'متابعة إلى الدفع'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
