import { useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import { useBasketStore } from '../store/basketStore'
import chainPricesData from '../data/chain_prices.json'
import type { ChainPricesData, ChainProductPrices, ChainPrice } from '../types'

const chainPrices = chainPricesData as ChainPricesData

const CHAINS = ['שופרסל', 'רמי לוי', 'יוחננוף', 'חצי חינם'] as const
type ChainName = (typeof CHAINS)[number]

// Index chain prices by groupId for fast lookup
const priceByGroup = new Map<number, ChainProductPrices>()
for (const item of chainPrices.products) {
  priceByGroup.set(item.groupId, item)
}

function getCheapest(item: ChainProductPrices): { chain: ChainName; price: number } | null {
  let best: { chain: ChainName; price: number } | null = null
  for (const chain of CHAINS) {
    const cp = (item.prices as Record<string, ChainPrice | null>)[chain]
    if (cp && (best === null || cp.effective < best.price)) {
      best = { chain: chain as ChainName, price: cp.effective }
    }
  }
  return best
}

const CHAIN_BADGE: Record<ChainName, string> = {
  שופרסל: 'bg-orange-100 text-orange-700',
  'רמי לוי': 'bg-blue-100 text-blue-700',
  יוחננוף: 'bg-green-100 text-green-700',
  'חצי חינם': 'bg-purple-100 text-purple-700',
}

export default function BasketPage() {
  const { selected, total, count, toggle, clear } = useBasketStore()
  const navigate = useNavigate()
  const items = Array.from(selected.values())

  const competitorData = useMemo(() => {
    let cheapestTotal = 0
    let coveredCount = 0

    const perProduct = items.map((product) => {
      if (product.groupId == null) return { product, best: null }
      const priceItem = priceByGroup.get(product.groupId)
      if (!priceItem) return { product, best: null }
      const best = getCheapest(priceItem)
      if (best) {
        cheapestTotal += best.price
        coveredCount++
      }
      return { product, best }
    })

    return { perProduct, cheapestTotal, coveredCount }
  }, [items])

  const saving = total - competitorData.cheapestTotal

  if (count === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h1 className="text-2xl font-bold text-gray-700 mb-2">הסל שלך ריק</h1>
        <p className="text-gray-500 mb-6">הוסף מוצרים מהרשימה וראה את הסכום הכולל</p>
        <button
          onClick={() => navigate('/products')}
          className="bg-blue-700 text-white font-bold px-8 py-3 rounded-2xl hover:bg-blue-800 transition-colors"
        >
          לרשימת המוצרים
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">הסל שלי ({count})</h1>
        <button
          onClick={clear}
          className="text-sm text-red-500 hover:text-red-700 font-medium"
        >
          נקה הכל
        </button>
      </div>

      {/* Summary card */}
      <div className="rounded-2xl overflow-hidden mb-6 shadow-sm">
        {/* Official price row */}
        <div className="bg-blue-700 text-white px-5 py-4 flex justify-between items-center">
          <div>
            <div className="text-blue-200 text-xs mb-0.5">מחיר מוצע (ממשלתי)</div>
            <div className="font-bold text-sm">קרפור · {count} מוצרים</div>
          </div>
          <span className="text-3xl font-extrabold">{total.toFixed(2)} ₪</span>
        </div>

        {/* Cheapest competitor row */}
        {competitorData.coveredCount > 0 && (
          <div className="bg-green-600 text-white px-5 py-4 flex justify-between items-center">
            <div>
              <div className="text-green-200 text-xs mb-0.5">הזול ביותר (מחיר לכל מוצר)</div>
              <div className="font-bold text-sm">
                {competitorData.coveredCount}/{count} מוצרים נמצאו
              </div>
            </div>
            <span className="text-3xl font-extrabold">
              {competitorData.cheapestTotal.toFixed(2)} ₪
            </span>
          </div>
        )}

        {/* Saving row */}
        {saving > 0.01 && (
          <div className="bg-amber-50 border-t border-amber-200 px-5 py-3 flex justify-between items-center">
            <span className="text-amber-800 font-semibold text-sm">חיסכון פוטנציאלי</span>
            <span className="text-amber-700 font-extrabold text-lg">
              {saving.toFixed(2)} ₪ ↓
            </span>
          </div>
        )}
      </div>

      {/* Product list */}
      <div className="space-y-3 mb-6">
        {competitorData.perProduct.map(({ product, best }) => {
          const priceDiff =
            best && product.price != null ? product.price - best.price : null
          const isCheaper = priceDiff !== null && priceDiff > 0.01

          return (
            <div
              key={product.id + '-' + product.barcode}
              className="bg-white rounded-xl border border-gray-200 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                {/* Name + brand */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-800 leading-snug">
                    {product.name}
                  </p>
                  <p className="text-xs text-gray-500">{product.brand}</p>
                </div>

                {/* Official price + remove */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-bold text-blue-700 whitespace-nowrap text-sm">
                    {product.price?.toFixed(2)} ₪
                  </span>
                  <button
                    onClick={() => toggle(product)}
                    className="text-gray-400 hover:text-red-500 transition-colors text-xl leading-none"
                    aria-label="הסר מוצר"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Competitor best price */}
              {best && (
                <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-400">הזול ביותר:</span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        CHAIN_BADGE[best.chain]
                      }`}
                    >
                      {best.chain}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-bold text-sm tabular-nums ${
                        isCheaper ? 'text-green-600' : 'text-gray-500'
                      }`}
                    >
                      {best.price.toFixed(2)} ₪
                    </span>
                    {isCheaper && (
                      <span className="text-xs text-green-600 font-medium">
                        חיסכון {priceDiff!.toFixed(2)} ₪
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <button
        onClick={() => navigate('/products')}
        className="w-full border-2 border-blue-700 text-blue-700 font-bold py-3 rounded-2xl hover:bg-blue-50 transition-colors"
      >
        + הוסף עוד מוצרים
      </button>
    </div>
  )
}
