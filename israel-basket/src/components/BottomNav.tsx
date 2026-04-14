import { NavLink } from 'react-router-dom'
import { useBasketStore } from '../store/basketStore'

const tabs = [
  { to: '/products', label: 'מוצרים', icon: '📦' },
  { to: '/basket', label: 'הסל שלי', icon: '🛒' },
  { to: '/compare', label: 'השוואה', icon: '📊' },
  { to: '/branches', label: 'סניפים', icon: '🏪' },
] as const

export default function BottomNav() {
  const count = useBasketStore((s) => s.count)

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-200">
      <div className="max-w-3xl mx-auto flex">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-2 gap-0.5 min-h-[60px] transition-colors relative ${
                isActive ? 'text-blue-700' : 'text-gray-500'
              }`
            }
          >
            <span className="text-xl relative inline-block">
              {tab.icon}
              {tab.to === '/basket' && count > 0 && (
                <span className="absolute -top-1 -right-1.5 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold leading-none">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </span>
            <span className="text-[11px] font-medium">{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
