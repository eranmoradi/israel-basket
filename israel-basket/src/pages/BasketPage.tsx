import { useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import { useBasketStore } from '../store/basketStore'
import chainPricesData from '../data/chain_prices.json'
import type { ChainPricesData, ChainProductPrices, ChainPrice } from '../types'

const chainPrices = chainPricesData as ChainPricesData

const CHAINS = ['שופרסל', 'רמי לוי', 'יוחננוף', 'אושר עד', 'ויקטורי', 'חצי חינם'] as const
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
  שופרסל: 'bg-orange-900/50 text-orange-300',
  'רמי לוי': 'bg-blue-900/50 text-blue-300',
  יוחננוף: 'bg-green-900/50 text-green-300',
  'אושר עד': 'bg-yellow-900/50 text-yellow-300',
  ויקטורי: 'bg-purple-900/50 text-purple-300',
  'חצי חינם': 'bg-fuchsia-900/50 text-fuchsia-300',
}

export default function BasketPage() {
  const { selected, total, count, toggle, clear } = useBasketStore()
  const navigate = useNavigate()
  const items = Array.from(selected.values())

  const competitorData = useMemo(() => {
    // Per-product cheapest (for item-level display)
    const perProduct = items.map((product) => {
      if (product.groupId == null) return { product, best: null }
      const priceItem = priceByGroup.get(product.groupId)
      if (!priceItem) return { product, best: null }
      const best = getCheapest(priceItem)
      return { product, best }
    })

    // Cheapest single chain: for each chain, sum all covered products
    const chainTotals: Record<ChainName, { total: number; carrefourTotal: number; count: number }> = {
      שופרסל: { total: 0, carrefourTotal: 0, count: 0 },
      'רמי לוי': { total: 0, carrefourTotal: 0, count: 0 },
      יוחננוף: { total: 0, carrefourTotal: 0, count: 0 },
      'אושר עד': { total: 0, carrefourTotal: 0, count: 0 },
      ויקטורי: { total: 0, carrefourTotal: 0, count: 0 },
      'חצי חינם': { total: 0, carrefourTotal: 0, count: 0 },
    }

    for (const { product } of perProduct) {
      if (product.groupId == null || product.price == null) continue
      const priceItem = priceByGroup.get(product.groupId)
      if (!priceItem) continue
      for (const chain of CHAINS) {
        const cp = (priceItem.prices as Record<string, ChainPrice | null>)[chain]
        if (cp) {
          chainTotals[chain].total += cp.effective
          chainTotals[chain].carrefourTotal += product.price
          chainTotals[chain].count++
        }
      }
    }

    // Count how many basket products have a groupId + carrefour price (comparable products)
    const comparableCount = items.filter(
      (p) => p.groupId != null && p.price != null && priceByGroup.has(p.groupId)
    ).length

    // Prefer chains with full coverage; fall back to best-coverage chain
    let cheapestChain: ChainName | null = null
    let cheapestChainTotal = Infinity
    let cheapestChainCount = 0
    let cheapestChainCarrefourTotal = 0
    let isPartialCoverage = false

    // First pass: only chains with 100% coverage
    for (const chain of CHAINS) {
      const d = chainTotals[chain]
      if (d.count === comparableCount && d.total < cheapestChainTotal) {
        cheapestChain = chain
        cheapestChainTotal = d.total
        cheapestChainCount = d.count
        cheapestChainCarrefourTotal = d.carrefourTotal
      }
    }

    // Second pass: if no chain covers everything, pick best-coverage chain
    if (cheapestChain === null) {
      let bestCoverage = 0
      for (const chain of CHAINS) {
        const d = chainTotals[chain]
        if (d.count > bestCoverage || (d.count === bestCoverage && d.total < cheapestChainTotal)) {
          bestCoverage = d.count
          cheapestChain = chain
          cheapestChainTotal = d.total
          cheapestChainCount = d.count
          cheapestChainCarrefourTotal = d.carrefourTotal
        }
      }
      if (cheapestChain !== null) isPartialCoverage = true
    }

    return {
      perProduct,
      comparableCount,
      cheapestChain,
      cheapestChainTotal: cheapestChainTotal === Infinity ? 0 : cheapestChainTotal,
      cheapestChainCount,
      cheapestChainCarrefourTotal,
      isPartialCoverage,
    }
  }, [items])

  // Saving = Carrefour price for the same covered products vs cheapest chain
  const saving = competitorData.cheapestChain
    ? competitorData.cheapestChainCarrefourTotal - competitorData.cheapestChainTotal
    : 0

  function buildSummaryText() {
    const date = new Date().toLocaleDateString('he-IL')
    const lines: string[] = [
      `🛒 הסל שלי — הסל של ישראל`,
      `תאריך: ${date}`,
      ``,
      `מוצרים (${count}):`,
      ...items.map((p) => `• ${p.name}${p.price != null ? ` — ${p.price.toFixed(2)}₪` : ''}`),
      ``,
      `סה״כ בקארפור: ${total.toFixed(2)}₪`,
    ]
    if (competitorData.cheapestChain) {
      lines.push(`הרשת הזולה ביותר (${competitorData.cheapestChain}): ${competitorData.cheapestChainTotal.toFixed(2)}₪`)
      if (saving > 0.01 && !competitorData.isPartialCoverage) {
        lines.push(`✅ חסכתי ${saving.toFixed(0)}₪ בקארפור לעומת ${competitorData.cheapestChain}`)
      }
    }
    lines.push(``, `⚠️ עד 2 יחידות מכל מוצר. תקף בסניפי קארפור מרקט והיפר בלבד.`)
    lines.push(`💡 בדקו כמה תחסכו גם אתם: israelbasket.app`)
    return lines.join('\n')
  }

  function handleWhatsApp() {
    const text = buildSummaryText()
    if (navigator.share) {
      navigator.share({ title: 'הסל של ישראל', text }).catch(() => {
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
      })
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
    }
  }

  function handleShareApp() {
    const text = `שלחתי לעצמי את רשימת הקניות דרך הסל של ישראל 😮\nהאפליקציה משווה מחירים ב-4 רשתות ומראה מאיפה הכי כדאי לקנות.\nחינם, ללא הרשמה: israelbasket.app`
    if (navigator.share) {
      navigator.share({ title: 'הסל של ישראל', text, url: 'https://israelbasket.app' }).catch(() => {
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
      })
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
    }
  }

  if (count === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-2xl font-bold text-gray-300 mb-2">הסל שלכם ריק</h1>
          <p className="text-gray-500 mb-6">הוסיפו מוצרים מהרשימה וראו את הסכום הכולל</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-blue-700 text-white font-bold px-8 py-3 rounded-2xl hover:bg-blue-600 transition-colors"
          >
            לרשימת המוצרים
          </button>
        </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-gray-100">הסל שלי ({count})</h1>
        <button
          onClick={clear}
          className="text-sm text-red-400 hover:text-red-300 font-medium"
        >
          נקה הכל
        </button>
      </div>

      {/* Summary card */}
      <div className="rounded-2xl overflow-hidden mb-6 shadow-sm">
        {/* Official price row */}
        <div className="bg-blue-800 text-white px-6 py-6 flex justify-between items-center">
          <div>
            <div className="text-blue-300 text-sm mb-1">מחיר מוצע (ממשלתי)</div>
            <div className="font-bold text-base">קרפור · {count} מוצרים</div>
          </div>
          <span className="text-4xl font-extrabold">{total.toFixed(2)}₪</span>
        </div>

        {/* Cheapest single chain row */}
        {competitorData.cheapestChain && (
          <div
            className={`text-white px-6 py-6 flex justify-between items-center ${
              competitorData.isPartialCoverage ? 'bg-gray-700' : 'bg-green-700'
            }`}
          >
            <div>
              <div className={`text-sm mb-1 ${competitorData.isPartialCoverage ? 'text-gray-400' : 'text-green-300'}`}>
                {competitorData.isPartialCoverage
                  ? `השוואה חלקית — רק ${competitorData.cheapestChainCount} מתוך ${competitorData.comparableCount} מוצרים`
                  : 'הרשת הזולה ביותר לסל זה'}
              </div>
              <div className="font-bold text-base">{competitorData.cheapestChain}</div>
            </div>
            <span className="text-4xl font-extrabold">
              {competitorData.cheapestChainTotal.toFixed(2)}₪
            </span>
          </div>
        )}

        {/* Saving row — only shown for full-coverage chains */}
        {saving > 0.01 && !competitorData.isPartialCoverage && (
          <div className="bg-amber-900/30 border-t border-amber-700 px-6 py-4 flex justify-between items-center">
            <span className="text-amber-300 font-semibold text-base">
              חיסכון לעומת {competitorData.cheapestChain}
            </span>
            <span className="text-amber-400 font-extrabold text-xl">
              {saving.toFixed(2)}₪ ↓
            </span>
          </div>
        )}
      </div>

      {/* Save & Share */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5 mb-6">
        <p className="text-sm text-amber-400 mb-4 flex items-center gap-1.5">
          <span>⚠️</span>
          <span>הנתונים שלכם לא נשמרים — כדאי לשמור לפני שתצאו</span>
        </p>
        <button
          onClick={handleWhatsApp}
          className="w-full flex items-center justify-center gap-2 bg-green-800 hover:bg-green-700 active:scale-95 text-white font-semibold text-base py-4 rounded-xl transition-all mb-3"
        >
          <span>📲</span>
          <span>רשימת הקניות שלך לוואטסאפ</span>
        </button>
        <button
          onClick={handleShareApp}
          className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-600 active:scale-95 text-white font-semibold text-base py-4 rounded-xl transition-all mb-3"
        >
          <span>🤝</span>
          <span>שתף עם חברים ומשפחה</span>
        </button>
        <button
          onClick={() => navigate('/branches')}
          className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 active:scale-95 border border-gray-600 text-gray-200 font-semibold text-base py-4 rounded-xl transition-all"
        >
          <span>📍</span>
          <span>5 הסניפים הקרובים אלי</span>
        </button>
        <button
          onClick={() => navigate('/compare', { state: { basketOnly: true } })}
          className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 active:scale-95 border border-amber-400 text-gray-900 font-semibold text-base py-4 rounded-xl transition-all"
        >
          <span>🛒</span>
          <span>השווה את מחיר הסל שלי לרשתות נוספות</span>
        </button>
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
              className="bg-gray-800 rounded-xl border border-gray-700 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                {/* Name + brand */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-100 leading-snug">
                    {product.name}
                  </p>
                  <p className="text-xs text-gray-400">{product.brand}</p>
                </div>

                {/* Official price + remove */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-bold text-blue-400 whitespace-nowrap text-sm">
                    {product.price?.toFixed(2)}₪
                  </span>
                  <button
                    onClick={() => toggle(product)}
                    className="text-gray-600 hover:text-red-400 transition-colors text-xl leading-none"
                    aria-label="הסר מוצר"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Competitor best price */}
              {best && (
                <div className="mt-2 pt-2 border-t border-gray-700 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-500">הזול ביותר:</span>
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
                        isCheaper ? 'text-green-400' : 'text-gray-400'
                      }`}
                    >
                      {best.price.toFixed(2)}₪
                    </span>
                    {isCheaper && (
                      <span className="text-xs text-green-400 font-medium">
                        חיסכון {priceDiff!.toFixed(2)}₪
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
        className="w-full border-2 border-blue-600 text-blue-400 font-bold py-3 rounded-2xl hover:bg-gray-800 transition-colors"
      >
        + הוסף עוד מוצרים
      </button>

      {/* Limit notice */}
      <div className="bg-blue-900/20 border border-blue-700 rounded-2xl p-4 mt-6 text-sm text-blue-300">
        <strong>⚠️ שימו לב:</strong> ניתן לרכוש עד 2 יחידות מכל מוצר בכל קנייה.
        המחירים תקפים בסניפי קארפור מרקט והיפר בלבד (לא בסניפי קארפור סיטי).
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4 mt-4 text-sm text-gray-400">
        <strong>⚠️ גילוי נאות:</strong> מחירי הרשתות המתחרות נשלפים אוטומטית מהאתרים שלהן ומתעדכנים מדי יום.
        ייתכנו פערים קטנים בין המחיר המוצג לבין המחיר בפועל בחנות.
      </div>
    </div>
  )
}
