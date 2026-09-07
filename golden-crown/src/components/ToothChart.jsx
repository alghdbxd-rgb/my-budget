// مخطط أسنان تفاعلي مبسّط بترقيم FDI — لاختيار السن المصاب (F-P-03 / شاشة 3)
// كل صف (علوي/سفلي) قابل للتمرير الأفقي داخل حاويته فقط، حتى لا يتسبب في
// انزياح أفقي لكامل الصفحة على شاشات الموبايل الضيقة.
const UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11]
const UPPER_LEFT = [21, 22, 23, 24, 25, 26, 27, 28]
const LOWER_LEFT = [31, 32, 33, 34, 35, 36, 37, 38]
const LOWER_RIGHT = [48, 47, 46, 45, 44, 43, 42, 41]

function Tooth({ n, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(n)}
      className={`flex h-9 w-7 shrink-0 flex-col items-center justify-center rounded-md border text-[10px] font-bold transition-colors ${
        selected
          ? 'border-gold-500 bg-gold-500 text-teal-950'
          : 'border-black/10 bg-white text-black/50 hover:border-teal-700 hover:text-teal-800'
      }`}
    >
      <span className="text-xs leading-none">🦷</span>
      {n}
    </button>
  )
}

export default function ToothChart({ value, onChange }) {
  const row = (right, left) => (
    <div className="-mx-3 overflow-x-auto px-3">
      <div className="flex w-max justify-center gap-1">
        {[...right, 'div', ...left].map((n) =>
          n === 'div' ? (
            <div key="div" className="w-2 shrink-0" />
          ) : (
            <Tooth key={n} n={n} selected={value === String(n)} onClick={(n) => onChange(String(n))} />
          ),
        )}
      </div>
    </div>
  )
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-3">
      <div className="mb-2">{row(UPPER_RIGHT, UPPER_LEFT)}</div>
      <div className="my-2 border-t border-dashed border-black/10" />
      <div>{row(LOWER_RIGHT, LOWER_LEFT)}</div>
      <p className="mt-3 text-center text-xs text-black/40">
        {value ? `السن المحدد: ${value}` : 'مرّر يميناً/يساراً واضغط على السن المصاب لتحديده (اختياري)'}
      </p>
    </div>
  )
}
