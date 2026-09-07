import { NavLink } from 'react-router-dom'

export default function BottomNav({ items }) {
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-black/5 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-md justify-around">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-semibold ${
                isActive ? 'text-teal-900' : 'text-black/40'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <it.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                {it.label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
