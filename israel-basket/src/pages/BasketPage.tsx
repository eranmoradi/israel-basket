import { useNavigate } from 'react-router-dom'
import { useMemo, useEffect, useState } from 'react'
import { useBasketStore } from '../store/basketStore'
import chainPricesData from '../data/chain_prices.json'
import type { ChainPricesData, ChainProductPrices, ChainPrice } from '../types'

const chainPrices = chainPricesData as ChainPricesData

const CHAINS = ['שופרסל', 'רמי לוי', 'יוחננוף', 'אושר עד', 'ויקטורי', 'חצי חינם'] as const
const DISPLAY_CHAINS = ['שופרסל', 'רמי לוי', 'יוחננוף', 'אושר עד', 'ויקטורי'] as const
type ChainName = (typeof CHAINS)[number]
type DisplayChainName = (typeof DISPLAY_CHAINS)[number]

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
  const [wowActive, setWowActive] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    const t = setTimeout(() => setWowActive(true), 300)
    return () => clearTimeout(t)
  }, [])

  const totalBefore = total > 0 ? total / 0.7 : 0
  const dealSaving = totalBefore - total

  const competitorData = useMemo(() => {
    const perProduct = items.map((product) => {
      if (product.groupId == null) return { product, best: null }
      const priceItem = priceByGroup.get(product.groupId)
      if (!priceItem) return { product, best: null }
      const best = getCheapest(priceItem)
      return { product, best }
    })

    const chainTotals: Record<DisplayChainName, { total: number; count: number }> = {
      שופרסל: { total: 0, count: 0 },
      'רמי לוי': { total: 0, count: 0 },
      יוחננוף: { total: 0, count: 0 },
      'אושר עד': { total: 0, count: 0 },
      ויקטורי: { total: 0, count: 0 },
    }

    for (const { product } of perProduct) {
      if (product.groupId == null || product.price == null) continue
      const priceItem = priceByGroup.get(product.groupId)
      if (!priceItem) continue
      for (const chain of DISPLAY_CHAINS) {
        const cp = (priceItem.prices as Record<string, ChainPrice | null>)[chain]
        if (cp) {
          chainTotals[chain].total += cp.effective
          chainTotals[chain].count++
        }
      }
    }

    const comparableCount = items.filter(
      (p) => p.groupId != null && p.price != null && priceByGroup.has(p.groupId)
    ).length

    const bonusChains: Array<{ chain: DisplayChainName; total: number }> = []
    let hiddenCount = 0

    for (const chain of DISPLAY_CHAINS) {
      const d = chainTotals[chain]
      if (comparableCount > 0 && d.count === comparableCount) {
        bonusChains.push({ chain, total: d.total })
      } else if (d.count > 0) {
        hiddenCount++
      }
    }

    bonusChains.sort((a, b) => a.chain.localeCompare(b.chain, 'he'))

    return { perProduct, bonusChains, hiddenCount }
  }, [items])

  function buildSummaryText() {
    const date = new Date().toLocaleDateString('he-IL')
    const lines: string[] = [
      `🛒 סיכום סל המוצרים שלי — הסל של ישראל`,
      `תאריך: ${date}`,
      ``,
      `מוצרים (${count}):`,
      ...items.map((p) => `• ${p.name}${p.price != null ? ` — ${p.price.toFixed(2)}₪` : ''}`),
      ``,
      `מחיר רגיל (לפני הנחת הסל): ${totalBefore.toFixed(2)}₪`,
      `✅ מחיר בקרפור (אחרי הנחת הסל של ישראל): ${total.toFixed(2)}₪`,
      `💰 חסכון מהנחת הסל: ${dealSaving.toFixed(0)}₪`,
    ]
    if (competitorData.bonusChains.length > 0) {
      lines.push(``, `אותו סל ברשתות אחרות:`)
      for (const { chain, total: chainTotal } of competitorData.bonusChains) {
        lines.push(`  ${chain}: ${chainTotal.toFixed(2)}₪`)
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
    const text = `בדקתי כמה חוסך לי הסל של ישראל — תוך 30 שניות 😮\nהאפליקציה מראה לפני ואחרי ההנחה, ואיך המחיר מול כל הרשתות.\nחינם, ללא הרשמה: israelbasket.app`
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

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-extrabold text-gray-100">סיכום סל המוצרים שלי</h1>
          <p className="text-sm text-gray-400 mt-0.5">{count} מוצרים נבחרו</p>
        </div>
        <button onClick={clear} className="text-sm text-red-400 hover:text-red-300 font-medium shrink-0">
          נקה הכל
        </button>
      </div>

      {/* Context Banner */}
      <div className="bg-blue-950/70 border border-blue-700/40 rounded-2xl px-4 py-3 mb-4 flex items-start gap-3">
        <span className="text-lg mt-0.5 shrink-0">🏪</span>
        <div>
          <p className="text-sm font-semibold text-blue-300 leading-snug">קרפור זכתה במכרז "הסל של ישראל"</p>
          <p className="text-xs text-blue-400/70 mt-1 leading-relaxed">
            100 מוצרים עם הנחה קבועה — לרכישה בסניפי קרפור מרקט והיפר בלבד · תקף עד אוקטובר 2026
          </p>
        </div>
      </div>

      {/* Before / After Card */}
      <div className="rounded-2xl overflow-hidden mb-3 border border-gray-700/60 shadow-xl">

        {/* Before */}
        <div className="bg-gray-800/60 px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">מחיר רגיל (לפני הנחת הסל)</p>
            <p className="text-xs text-gray-600">בלי מכרז ממשלתי</p>
          </div>
          <span className="text-xl font-bold text-gray-500 tabular-nums line-through decoration-gray-600">
            {totalBefore.toFixed(2)}₪
          </span>
        </div>

        {/* Discount row */}
        <div className="bg-amber-950/50 border-y border-amber-800/30 px-5 py-3 flex items-center justify-between">
          <p className="text-xs text-amber-400 font-medium">↓ הנחת הסל של ישראל (30%)</p>
          <span className="text-sm font-bold text-amber-400 tabular-nums">
            −{dealSaving.toFixed(2)}₪
          </span>
        </div>

        {/* After — WOW */}
        <div className={`px-5 py-5 bg-gradient-to-l from-emerald-900/70 to-emerald-950/90 ${wowActive ? 'savings-wow' : 'opacity-0'}`}>
          <p className="text-sm text-emerald-300 font-medium mb-1">✅ המחיר שלך בקרפור</p>
          <p className="text-5xl font-extrabold text-emerald-400 tabular-nums tracking-tight leading-none">
            {total.toFixed(2)}₪
          </p>
          <p className="text-xs text-emerald-600 mt-2">מחיר מוצע ממשלתי · {count} מוצרים</p>
        </div>

      </div>

      {/* Neutral disclaimer */}
      <p className="text-xs text-gray-600 text-center mb-5 leading-relaxed">
        האפליקציה מציגה נתונים בלבד — ההחלטה שלכם
      </p>

      {/* Bonus: chain comparison */}
      {competitorData.bonusChains.length > 0 && (
        <div className="bg-gray-900 border border-gray-700/60 rounded-2xl px-5 py-5 mb-5">
          <p className="text-xs text-gray-400 font-semibold tracking-widest uppercase mb-1">
            לעיונך — כמה עולה הסל ברשתות אחרות
          </p>
          <p className="text-xs text-gray-600 mb-4">אותם {count} מוצרים, בלי הנחת הסל</p>
          <div className="space-y-0">
            {competitorData.bonusChains.map(({ chain, total: chainTotal }) => (
              <div key={chain} className="flex items-center justify-between py-2.5 border-b border-gray-800 last:border-0">
                <span className="text-sm text-gray-300 font-medium">{chain}</span>
                <span className="text-sm font-bold text-gray-200 tabular-nums">{chainTotal.toFixed(2)}₪</span>
              </div>
            ))}
          </div>
          {competitorData.hiddenCount > 0 && (
            <p className="text-xs text-gray-600 mt-3">
              * {competitorData.hiddenCount === 1 ? 'רשת אחת לא מוצגת' : `${competitorData.hiddenCount} רשתות לא מוצגות`} — אין לנו מחיר לחלק ממוצרי הסל שלך
            </p>
          )}
        </div>
      )}

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
          <span>שלח את הסיכום לוואטסאפ</span>
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
          className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 active:scale-95 border border-gray-600 text-gray-200 font-semibold text-base py-4 rounded-xl transition-all mb-3"
        >
          <span>📍</span>
          <span>5 הסניפים הקרובים אלי</span>
        </button>
        <button
          onClick={() => navigate('/compare', { state: { basketOnly: true } })}
          className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 active:scale-95 border border-amber-400 text-gray-900 font-semibold text-base py-4 rounded-xl transition-all"
        >
          <span>🛒</span>
          <span>השוואה מלאה לרשתות נוספות</span>
        </button>
      </div>

      {/* Product list */}
      <div className="space-y-3 mb-6">
        {competitorData.perProduct.map(({ product, best }) => {
          const priceDiff = best && product.price != null ? product.price - best.price : null
          const isCheaper = priceDiff !== null && priceDiff > 0.01

          return (
            <div
              key={product.id + '-' + product.barcode}
              className="bg-gray-800 rounded-xl border border-gray-700 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-100 leading-snug">{product.name}</p>
                  <p className="text-xs text-gray-400">{product.brand}</p>
                </div>
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

              {best && (
                <div className="mt-2 pt-2 border-t border-gray-700 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-500">הזול ביותר:</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CHAIN_BADGE[best.chain]}`}>
                      {best.chain}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-sm tabular-nums ${isCheaper ? 'text-green-400' : 'text-gray-400'}`}>
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

      <div className="bg-blue-900/20 border border-blue-700 rounded-2xl p-4 mt-6 text-sm text-blue-300">
        <strong>⚠️ שימו לב:</strong> ניתן לרכוש עד 2 יחידות מכל מוצר בכל קנייה.
        המחירים תקפים בסניפי קארפור מרקט והיפר בלבד (לא בסניפי קארפור סיטי).
      </div>

      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4 mt-4 mb-2 text-sm text-gray-400">
        <strong>⚠️ גילוי נאות:</strong> מחירי הרשתות המתחרות נשלפים אוטומטית מהאתרים שלהן ומתעדכנים מדי יום.
        ייתכנו פערים קטנים בין המחיר המוצג לבין המחיר בפועל בחנות.
      </div>

    </div>
  )
}
