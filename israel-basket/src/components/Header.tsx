import { NavLink, useLocation } from 'react-router-dom'

interface HeaderProps {
  onBotOpen?: () => void
}

export default function Header({ onBotOpen }: HeaderProps) {
  const { pathname } = useLocation()
  const showBot = pathname !== '/'

  return (
    <header className="sticky top-0 z-50 bg-blue-700 text-white shadow-md">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <NavLink to="/" className="font-bold text-lg tracking-wide">
          🛒 הסל של ישראל
        </NavLink>
        {showBot && onBotOpen && (
          <button
            onClick={onBotOpen}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:scale-95 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md transition-all whitespace-nowrap"
          >
            <span>💬</span>
            <span>עזרה</span>
          </button>
        )}
      </div>
    </header>
  )
}
