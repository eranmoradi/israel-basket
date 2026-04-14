import { useNavigate } from 'react-router-dom'
import { useBasketStore } from '../store/basketStore'

export default function BasketBar() {
  const { count, total } = useBasketStore()
  const navigate = useNavigate()

  if (count === 0) return null

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-blue-700 text-white shadow-2xl">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        <div>
          <span className="font-bold text-lg">{total.toFixed(2)} ₪</span>
          <span className="text-blue-200 text-sm mr-2">{count} מוצרים</span>
        </div>
        <button
          onClick={() => navigate('/basket')}
          className="bg-white text-blue-700 font-bold px-5 py-2 rounded-full text-sm hover:bg-blue-50 transition-colors"
        >
          לסל שלי ←
        </button>
      </div>
    </div>
  )
}
