import { useNavigate } from 'react-router-dom'
import { useMemo, useEffect, useState, useRef } from 'react'
import { useBasketStore } from '../store/basketStore'
import chainPricesData from '../data/chain_prices.json'
import type { ChainPricesData, ChainProductPrices, ChainPrice } from '../types'
import confetti from 'canvas-confetti'

function useCountUp(to: number, duration: number, active: boolean) {
  const [value, setValue] = useState(0)
  const rafRef = useRef<number>(0)
  useEffect(() => {
    if (!active) return
    const startTime = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * to * 100) / 100)
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [active, to, duration])
  return value
}

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

const CHAIN_CIRCLE: Record<DisplayChainName, string> = {
  שופרסל: 'bg-orange-800 text-orange-200',
  'רמי לוי': 'bg-blue-800 text-blue-200',
  יוחננוף: 'bg-green-800 text-green-200',
  'אושר עד': 'bg-yellow-800 text-yellow-200',
  ויקטורי: 'bg-purple-800 text-purple-200',
}

type PerProduct = { product: import('../types').Product; best: { chain: ChainName; price: number } | null }

function ProductList({ perProduct, onToggle, onAddMore }: {
  perProduct: PerProduct[]
  onToggle: (p: import('../types').Product) => void
  onAddMore: () => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mb-6">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between bg-gray-900 border border-gray-700 rounded-2xl px-5 py-3 text-sm text-gray-300 font-medium hover:border-gray-500 transition-colors"
      >
        <span>✏️ עריכת הסל ({perProduct.length} מוצרים)</span>
        <span className="text-gray-500 text-xs">{open ? '▲ סגור' : '▼ פתח'}</span>
      </button>
      {open && (
        <div className="mt-2 space-y-2">
          {perProduct.map(({ product, best }) => {
            const priceDiff = best && product.price != null ? product.price - best.price : null
            const isCheaper = priceDiff !== null && priceDiff > 0.01
            return (
              <div key={product.id + '-' + product.barcode} className="bg-gray-800 rounded-xl border border-gray-700 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-100 leading-snug">{product.name}</p>
                    <p className="text-xs text-gray-400">{product.brand}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold text-blue-400 whitespace-nowrap text-sm">{product.price?.toFixed(2)}₪</span>
                    <button onClick={() => onToggle(product)} className="text-gray-600 hover:text-red-400 transition-colors text-xl leading-none" aria-label="הסר מוצר">×</button>
                  </div>
                </div>
                {best && (
                  <div className="mt-2 pt-2 border-t border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-500">הזול ביותר:</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CHAIN_BADGE[best.chain]}`}>{best.chain}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-sm tabular-nums ${isCheaper ? 'text-green-400' : 'text-gray-400'}`}>{best.price.toFixed(2)}₪</span>
                      {isCheaper && <span className="text-xs text-green-400 font-medium">חיסכון {priceDiff!.toFixed(2)}₪</span>}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
          <button onClick={onAddMore} className="w-full border-2 border-blue-600 text-blue-400 font-bold py-3 rounded-2xl hover:bg-gray-800 transition-colors mt-1">
            + הוסף עוד מוצרים
          </button>
        </div>
      )}
    </div>
  )
}

export default function BasketPage() {
  const { selected, total, count, toggle, clear } = useBasketStore()
  const navigate = useNavigate()
  const items = Array.from(selected.values())
  const [wowActive, setWowActive] = useState(false)
  const [countBefore, setCountBefore] = useState(false)
  const [countSaving, setCountSaving] = useState(false)
  const [countAfter, setCountAfter] = useState(false)

  const totalBefore = total > 0 ? total / 0.7 : 0
  const dealSaving = totalBefore - total

  const animBefore = useCountUp(totalBefore, 800, countBefore)
  const animSaving = useCountUp(dealSaving, 700, countSaving)
  const animAfter = useCountUp(total, 900, countAfter)

  useEffect(() => {
    window.scrollTo(0, 0)
    const t1 = setTimeout(() => setCountBefore(true), 300)
    const t2 = setTimeout(() => setCountSaving(true), 700)
    const t3 = setTimeout(() => { setCountAfter(true); setWowActive(true) }, 1100)
    const t4 = setTimeout(() => {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.55 },
        colors: ['#34d399', '#fbbf24', '#60a5fa', '#ffffff'],
        scalar: 0.9,
        ticks: 180,
      })
    }, 2000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [])

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
    lines.push(``, `⚠️ עד 2 יחידות מכל מוצר. תקף בסניפי קרפור מרקט והיפר בלבד.`)
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
      <div className="mb-5 text-center relative">
        <h1 className="text-xl font-extrabold text-gray-100">סיכום סל המוצרים שלי</h1>
        <p className="text-sm text-gray-400 mt-0.5">{count} מוצרים נבחרו</p>
        <button onClick={clear} className="absolute left-0 top-0 text-sm text-red-400 hover:text-red-300 font-medium">
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
        <div className="bg-gray-800/40 px-5 py-4 text-center">
          <p className="text-xs text-gray-400 mb-1.5">מחיר רגיל (בלי הנחת הסל)</p>
          <span className="text-2xl font-bold text-gray-300 tabular-nums line-through decoration-gray-500">
            {animBefore.toFixed(2)}₪
          </span>
        </div>

        {/* Discount row */}
        <div className="bg-amber-950/40 border-y border-amber-800/30 px-5 py-3 text-center">
          <p className="text-xs text-amber-500 font-medium mb-1">חסכון מהנחת הסל</p>
          <span className="text-xl font-bold text-amber-400 tabular-nums">−{animSaving.toFixed(0)}₪</span>
        </div>

        {/* After — WOW */}
        <div className={`px-5 py-6 bg-gradient-to-b from-emerald-950/80 to-emerald-900/50 text-center ${wowActive ? 'savings-wow' : 'opacity-0'}`}>
          <p className="text-sm text-emerald-400 font-semibold mb-2">✅ המחיר שלך בקרפור</p>
          <p className="text-5xl font-extrabold text-emerald-400 tabular-nums tracking-tight leading-none">
            {animAfter.toFixed(2)}₪
          </p>
          <p className="text-xs text-emerald-700 mt-2">{count} מוצרים · מחיר מוצע ממשלתי</p>
        </div>

      </div>

      {/* Neutral disclaimer */}
      <p className="text-xs text-gray-400 text-center mb-5 leading-relaxed">
        האפליקציה מציגה נתונים בלבד — ההחלטה שלכם
      </p>

      {/* Bonus: chain comparison */}
      {competitorData.bonusChains.length > 0 && (
        <div className="bg-gray-900 border border-gray-700/60 rounded-2xl px-5 py-5 mb-5">
          <p className="text-sm text-blue-300 font-bold text-center mb-1">
            כמה עולה הסל ברשתות אחרות?
          </p>
          <p className="text-xs text-gray-400 text-center mb-4">אותם {count} מוצרים, בלי הנחת הסל</p>
          <div className="space-y-0">
            {competitorData.bonusChains.map(({ chain, total: chainTotal }) => (
              <div key={chain} className="flex items-center justify-center gap-3 py-2.5 border-b border-gray-800 last:border-0">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${CHAIN_CIRCLE[chain]}`}>
                  {chain[0]}
                </span>
                <span className="text-sm text-gray-300 font-medium w-20 text-right">{chain}</span>
                <span className="text-sm font-bold text-gray-200 tabular-nums w-20 text-center">{chainTotal.toFixed(2)}₪</span>
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

      {/* WhatsApp share promo */}
      <div className="bg-green-950/60 border border-green-800/50 rounded-2xl px-5 py-5 mb-5">
        <p className="text-sm font-bold text-green-300 mb-1">📲 שלחו את הרשימה לוואטסאפ</p>
        <p className="text-xs text-green-500 leading-relaxed mb-4">
          הסיכום כולל את כל המוצרים, המחיר לפני ואחרי ההנחה, ומחירי הרשתות — מוכן לשליחה לקבוצת הבית.
        </p>
        <button
          onClick={handleWhatsApp}
          className="w-full flex items-center justify-center gap-2 bg-green-700 hover:bg-green-600 active:scale-95 text-white font-bold text-base py-3 rounded-xl transition-all"
        >
          <span>📲</span>
          <span>שלח את הסיכום לוואטסאפ</span>
        </button>
      </div>

      {/* Collapsible product list */}
      <ProductList
        perProduct={competitorData.perProduct}
        onToggle={toggle}
        onAddMore={() => navigate('/products')}
      />

      <div className="bg-blue-900/20 border border-blue-700 rounded-2xl p-4 mt-6 text-sm text-blue-300">
        <strong>⚠️ שימו לב:</strong> ניתן לרכוש עד 2 יחידות מכל מוצר בכל קנייה.
        המחירים תקפים בסניפי קרפור מרקט והיפר בלבד (לא בסניפי קרפור סיטי).
      </div>

      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4 mt-4 mb-2 text-sm text-gray-400">
        <strong>⚠️ גילוי נאות:</strong> מחירי הרשתות המתחרות נשלפים אוטומטית מהאתרים שלהן ומתעדכנים מדי יום.
        ייתכנו פערים קטנים בין המחיר המוצג לבין המחיר בפועל בחנות.
      </div>

    </div>
  )
}
