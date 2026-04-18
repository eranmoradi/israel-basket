import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import CartIcon from './CartIcon'

interface HeaderProps {
  onBotOpen?: () => void
}

export default function Header({ onBotOpen }: HeaderProps) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const isInner = pathname !== '/'

  return (
    <header className="sticky top-0 z-50 bg-blue-700 text-white shadow-md">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2 font-bold text-lg tracking-wide">
          <CartIcon size={28} color="white" className="inline-block flex-shrink-0" />
          <span>הסל של ישראל</span>
        </NavLink>
        {isInner && (
          <div className="flex items-center gap-2">
            {onBotOpen && (
              <button
                onClick={onBotOpen}
                className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:scale-95 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg ring-2 ring-white/40 transition-all whitespace-nowrap"
              >
                <span>💬</span>
                <span>עזרה</span>
              </button>
            )}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 active:scale-95 text-white text-sm font-bold px-4 py-2 rounded-full transition-all whitespace-nowrap"
            >
              <span className="text-lg leading-none">‹</span>
              <span>חזרה</span>
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
