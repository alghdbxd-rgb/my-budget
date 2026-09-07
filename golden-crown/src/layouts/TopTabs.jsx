import { NavLink } from 'react-router-dom'

export default function TopTabs({ items }) {
  return (
    <div className="sticky top-0 z-30 -mx-4 mb-4 overflow-x-auto border-b border-black/5 bg-[#f6f4ee]/95 px-4 backdrop-blur">
      <div className="flex min-w-max gap-1 py-2">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.end}
            className={({ isActive }) =>
              `flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${
                isActive ? 'bg-teal-900 text-gold-100' : 'text-teal-950/60 hover:bg-black/5'
              }`
            }
          >
            {it.icon && <it.icon size={15} />}
            {it.label}
          </NavLink>
        ))}
      </div>
    </div>
  )
}
