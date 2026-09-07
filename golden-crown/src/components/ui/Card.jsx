export default function Card({ className = '', children, ...props }) {
  return (
    <div
      className={`rounded-2xl border border-black/5 bg-white p-4 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
