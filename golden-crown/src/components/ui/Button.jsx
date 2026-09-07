const variants = {
  primary: 'bg-teal-900 text-gold-100 hover:bg-teal-800 active:bg-teal-950 disabled:opacity-40',
  gold: 'bg-gold-500 text-teal-950 hover:bg-gold-400 active:bg-gold-600 disabled:opacity-40 font-bold',
  outline: 'border-2 border-teal-900 text-teal-900 hover:bg-teal-900/5 disabled:opacity-40',
  ghost: 'text-teal-900 hover:bg-teal-900/5 disabled:opacity-40',
  danger: 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-40',
  subtle: 'bg-teal-900/5 text-teal-900 hover:bg-teal-900/10 disabled:opacity-40',
}

export default function Button({ variant = 'primary', className = '', children, ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
