import { useState } from 'react'
import { Camera, X, Info } from 'lucide-react'
import { resizeImage, ACCEPTED_IMAGE_TYPES, MAX_IMAGE_MB } from '../../../lib/image'

const GUIDES = [
  { icon: '💡', text: 'صوّر في مكان مضاء جيداً' },
  { icon: '📏', text: 'اقترب بما يكفي ليظهر السن أو المنطقة بوضوح' },
  { icon: '🚫', text: 'تجنّب الصور المهزوزة أو غير الواضحة' },
]

export default function Step4({ value, onChange }) {
  const images = value.images || []
  const [error, setError] = useState('')

  const handleFiles = async (files) => {
    setError('')
    const remaining = 3 - images.length
    if (remaining <= 0) {
      setError('الحد الأقصى 3 صور')
      return
    }
    const picked = Array.from(files).slice(0, remaining)
    const next = [...images]
    for (const file of picked) {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        setError('صيغة غير مدعومة — الرجاء رفع JPG أو PNG أو WEBP فقط')
        continue
      }
      if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
        setError(`حجم الصورة أكبر من ${MAX_IMAGE_MB}MB`)
        continue
      }
      const dataUrl = await resizeImage(file)
      next.push({ id: `${Date.now()}-${Math.random()}`, dataUrl, name: file.name })
    }
    onChange({ images: next })
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-extrabold text-teal-950">صور الحالة</h2>
      <p className="text-sm text-black/50">حتى 3 صور تساعد الطبيب على تقييم حالتك بدقة أكبر (اختياري).</p>

      <div className="rounded-xl bg-teal-900/5 p-3 text-xs text-teal-900">
        <p className="mb-1.5 flex items-center gap-1 font-bold">
          <Info size={14} /> إرشادات التصوير
        </p>
        <ul className="space-y-1">
          {GUIDES.map((g) => (
            <li key={g.text} className="flex items-center gap-1.5">
              <span>{g.icon}</span> {g.text}
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {images.map((img) => (
          <div key={img.id} className="relative aspect-square overflow-hidden rounded-xl border border-black/10">
            <img src={img.dataUrl} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange({ images: images.filter((i) => i.id !== img.id) })}
              className="absolute left-1 top-1 rounded-full bg-black/60 p-1 text-white"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        {images.length < 3 && (
          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-black/15 text-black/40 hover:border-teal-700/40 hover:text-teal-800">
            <Camera size={22} />
            <span className="text-[11px] font-semibold">إضافة صورة</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => e.target.files?.length && handleFiles(e.target.files)}
            />
          </label>
        )}
      </div>
      {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
      <p className="text-[11px] text-black/40">{images.length} / 3 صور مرفوعة</p>
    </div>
  )
}
