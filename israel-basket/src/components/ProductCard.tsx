import type { Product } from '../types'
import { useBasketStore } from '../store/basketStore'

interface Props {
  product: Product
}

export default function ProductCard({ product }: Props) {
  const { selected, toggle } = useBasketStore()
  const isSelected = selected.has(product.id)

  return (
    <button
      onClick={() => toggle(product)}
      className={`w-full text-right p-4 rounded-xl border-2 transition-all cursor-pointer ${
        isSelected
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {product.isBasic && (
              <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                מוצר יסוד
              </span>
            )}
            <span className="text-xs text-gray-400 truncate">{product.category}</span>
          </div>
          <p className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2">
            {product.name}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{product.brand}</p>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          {product.price !== null ? (
            <span className="text-lg font-bold text-blue-700 whitespace-nowrap">
              {product.price.toFixed(2)} ₪
            </span>
          ) : (
            <span className="text-sm text-gray-400">מחיר לא זמין</span>
          )}
          <div
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
              isSelected
                ? 'bg-blue-500 border-blue-500 text-white'
                : 'border-gray-300'
            }`}
          >
            {isSelected && (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}
