import { NavLink } from 'react-router-dom'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-blue-700 text-white shadow-md">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center">
        <NavLink to="/" className="font-bold text-lg tracking-wide">
          🛒 הסל של ישראל
        </NavLink>
      </div>
    </header>
  )
}
