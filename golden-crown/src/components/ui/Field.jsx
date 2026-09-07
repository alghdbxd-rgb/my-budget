export function Field({ label, hint, error, required, children }) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-semibold text-teal-950">
          {label} {required && <span className="text-red-600">*</span>}
        </span>
      )}
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-black/50">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-semibold text-red-600">{error}</span>}
    </label>
  )
}

const baseInput =
  'w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15'

export function Input({ error, className = '', ...props }) {
  return (
    <input
      className={`${baseInput} ${error ? 'border-red-400' : 'border-black/10'} ${className}`}
      {...props}
    />
  )
}

export function Textarea({ error, className = '', ...props }) {
  return (
    <textarea
      className={`${baseInput} min-h-28 resize-y ${error ? 'border-red-400' : 'border-black/10'} ${className}`}
      {...props}
    />
  )
}

export function Select({ error, className = '', children, ...props }) {
  return (
    <select
      className={`${baseInput} bg-white ${error ? 'border-red-400' : 'border-black/10'} ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}
