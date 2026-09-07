export default function StepDots({ total, current }) {
  return (
    <div className="mb-5 flex items-center justify-center gap-2">
      {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
        <div
          key={n}
          className={`h-1.5 rounded-full transition-all ${
            n === current ? 'w-8 bg-gold-500' : n < current ? 'w-4 bg-teal-800' : 'w-4 bg-black/10'
          }`}
        />
      ))}
    </div>
  )
}
