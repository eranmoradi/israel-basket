import { NavLink } from 'react-router-dom'
import { useBasketStore } from '../store/basketStore'

export default function Header() {
  const count = useBasketStore((s) => s.count)

  return (
    <header className="sticky top-0 z-50 bg-blue-700 text-white shadow-md">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <NavLink to="/" className="font-bold text-lg tracking-wide">
          🛒 הסל של ישראל
        </NavLink>
        <nav className="flex gap-1 text-sm font-medium">
          <NavLink
            to="/products"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-full transition-colors ${
                isActive ? 'bg-white text-blue-700' : 'hover:bg-blue-600'
              }`
            }
          >
            מוצרים
          </NavLink>
          <NavLink
            to="/basket"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-full transition-colors relative ${
                isActive ? 'bg-white text-blue-700' : 'hover:bg-blue-600'
              }`
            }
          >
            הסל שלי
            {count > 0 && (
              <span className="absolute -top-1 -left-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {count}
              </span>
            )}
          </NavLink>
          <NavLink
            to="/compare"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-full transition-colors ${
                isActive ? 'bg-white text-blue-700' : 'hover:bg-blue-600'
              }`
            }
          >
            השוואה
          </NavLink>
          <NavLink
            to="/branches"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-full transition-colors ${
                isActive ? 'bg-white text-blue-700' : 'hover:bg-blue-600'
              }`
            }
          >
            סניפים
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
