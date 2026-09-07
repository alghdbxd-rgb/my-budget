// مخطط أسنان تفاعلي مبسّط بترقيم FDI — لاختيار السن المصاب (F-P-03 / شاشة 3)
const UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11]
const UPPER_LEFT = [21, 22, 23, 24, 25, 26, 27, 28]
const LOWER_LEFT = [31, 32, 33, 34, 35, 36, 37, 38]
const LOWER_RIGHT = [48, 47, 46, 45, 44, 43, 42, 41]

function Tooth({ n, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(n)}
      className={`flex h-9 w-7 flex-col items-center justify-center rounded-md border text-[10px] font-bold transition-colors ${
        selected
          ? 'border-gold-500 bg-gold-500 text-teal-950'
          : 'border-black/10 bg-white text-black/50 hover:border-teal-700 hover:text-teal-800'
      }`}
    >
      <span className="text-sm">🦷</span>
      {n}
    </button>
  )
}

export default function ToothChart({ value, onChange }) {
  const row = (nums) => (
    <div className="flex justify-center gap-1">
      {nums.map((n) => (
        <Tooth key={n} n={n} selected={value === String(n)} onClick={(n) => onChange(String(n))} />
      ))}
    </div>
  )
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-3">
      <div className="mb-2 flex justify-center gap-1">
        {row(UPPER_RIGHT)}
        <div className="w-1" />
        {row(UPPER_LEFT)}
      </div>
      <div className="my-2 border-t border-dashed border-black/10" />
      <div className="flex justify-center gap-1">
        {row(LOWER_RIGHT)}
        <div className="w-1" />
        {row(LOWER_LEFT)}
      </div>
      <p className="mt-3 text-center text-xs text-black/40">
        {value ? `السن المحدد: ${value}` : 'اضغط على السن المصاب لتحديده (اختياري)'}
      </p>
    </div>
  )
}
