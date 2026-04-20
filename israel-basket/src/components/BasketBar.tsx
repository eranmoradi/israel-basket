import { useNavigate, useLocation } from 'react-router-dom'
import { useBasketStore } from '../store/basketStore'

export default function BasketBar() {
  const { count, total } = useBasketStore()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  if (count === 0 || pathname === '/basket') return null

  const totalBefore = total / 0.7
  const saving = totalBefore - total

  return (
    <div className="fixed bottom-[60px] inset-x-0 z-40 bg-blue-700 text-white shadow-2xl">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex flex-col min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="font-extrabold text-lg tabular-nums">{total.toFixed(2)}₪</span>
            <span className="text-blue-300 text-xs tabular-nums line-through">{totalBefore.toFixed(0)}₪</span>
          </div>
          <span className="text-emerald-300 text-xs font-semibold tabular-nums">חוסכים {saving.toFixed(0)}₪ מהמחיר בקרפור ללא ההנחה · {count} מוצרים</span>
        </div>
        <button
          onClick={() => navigate('/basket')}
          className="shrink-0 bg-white text-blue-700 font-bold px-5 py-2 rounded-full text-sm hover:bg-blue-50 transition-colors"
        >
          לסיכום ←
        </button>
      </div>
    </div>
  )
}
