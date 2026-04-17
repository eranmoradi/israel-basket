import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import chainPricesData from '../data/chain_prices.json'
import productsData from '../data/products.json'
import type { ChainPricesData, ChainProductPrices, ChainPrice, Product } from '../types'
import { useBasketStore } from '../store/basketStore'

const chainPrices = chainPricesData as ChainPricesData
const allProducts = productsData as Product[]

const CHAINS = ['קרפור', 'שופרסל', 'רמי לוי', 'יוחננוף', 'אושר עד', 'ויקטורי'] as const
type ChainName = (typeof CHAINS)[number]

// Build department lookup from products.json (groupId → department)
const deptByGroup = new Map<number, string>()
for (const p of allProducts) {
  if (!p.isBasic && p.groupId != null) {
    if (!deptByGroup.has(p.groupId)) deptByGroup.set(p.groupId, p.department)
  }
}

const DEPARTMENTS = ['הכל', ...Array.from(new Set(deptByGroup.values())).sort()]

const CHAIN_COLORS: Record<ChainName, string> = {
  קרפור: 'bg-red-900/20 border-red-700',
  שופרסל: 'bg-orange-900/20 border-orange-700',
  'רמי לוי': 'bg-blue-900/20 border-blue-700',
  יוחננוף: 'bg-green-900/20 border-green-700',
  'אושר עד': 'bg-yellow-900/20 border-yellow-700',
  ויקטורי: 'bg-purple-900/20 border-purple-700',
}

const CHAIN_HEADER_COLORS: Record<ChainName, string> = {
  קרפור: 'bg-red-700 text-white',
  שופרסל: 'bg-orange-600 text-white',
  'רמי לוי': 'bg-blue-700 text-white',
  יוחננוף: 'bg-green-700 text-white',
  'אושר עד': 'bg-yellow-700 text-white',
  ויקטורי: 'bg-purple-700 text-white',
}

function getChainPrice(item: ChainProductPrices, chain: ChainName): ChainPrice | null {
  return (item.prices as Record<string, ChainPrice | null>)[chain] ?? null
}

function PriceCell({
  cp,
  isMin,
}: {
  cp: ChainPrice | null
  isMin: boolean
}) {
  if (!cp) {
    return <span className="text-gray-600 text-sm">—</span>
  }
  return (
    <span className={`font-semibold tabular-nums text-sm ${isMin ? 'text-green-400' : 'text-gray-200'}`}>
      {isMin && <span className="ml-0.5 text-green-500 text-xs">★</span>}
      {cp.effective.toFixed(2)}₪
      {cp.sale !== null && (
        <span className="block text-xs text-gray-500 font-normal line-through leading-tight">
          {cp.regular.toFixed(2)}₪
        </span>
      )}
    </span>
  )
}

type SortKey = 'name' | ChainName

export default function ComparePage() {
  const [search, setSearch] = useState('')
  const [dept, setDept] = useState('הכל')
  const [sortBy, setSortBy] = useState<SortKey>('name')
  const [missingOnly, setMissingOnly] = useState(false)
  const [basketOnly, setBasketOnly] = useState(false)
  const navigate = useNavigate()
  const { selected } = useBasketStore()
  const basketGroupIds = new Set(Array.from(selected.values()).map(p => p.groupId))
  const basketCount = basketGroupIds.size

  const items = useMemo(() => {
    const q = search.trim().toLowerCase()
    return chainPrices.products.filter((item) => {
      const itemDept = deptByGroup.get(item.groupId) ?? ''
      const matchesDept = dept === 'הכל' || itemDept === dept
      const matchesSearch = !q || item.name.toLowerCase().includes(q)
      const hasMissing =
        !missingOnly || CHAINS.some((c) => getChainPrice(item, c) === null)
      const matchesBasket = !basketOnly || basketGroupIds.has(item.groupId)
      return matchesDept && matchesSearch && hasMissing && matchesBasket
    })
  }, [search, dept, missingOnly, basketOnly, basketGroupIds])

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name, 'he')
      const pa = getChainPrice(a, sortBy)?.effective ?? Infinity
      const pb = getChainPrice(b, sortBy)?.effective ?? Infinity
      return pa - pb
    })
  }, [items, sortBy])

  if (!chainPrices.fetched_at) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-gray-500">
        <div className="text-5xl mb-4">⏳</div>
        <p className="text-lg font-medium text-gray-400">נתוני מחירים עדיין לא נאספו</p>
        <p className="text-sm mt-2 text-gray-500">הרץ את הסקריפט: <code className="bg-gray-700 text-gray-300 px-2 py-0.5 rounded">python3 scripts/fetch_chain_prices.py</code></p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-5">
        <h1 className="text-2xl font-extrabold text-gray-100">השוואת מחירים</h1>
        <p className="text-sm text-gray-500 mt-1">
          עודכן: {new Date(chainPrices.fetched_at).toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="relative">
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
          <input
            type="search"
            placeholder="חפש מוצר..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 text-gray-100 placeholder:text-gray-500 rounded-xl py-2.5 pr-9 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setMissingOnly((v) => !v)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
              missingOnly
                ? 'bg-red-600 text-white border-red-600'
                : 'bg-gray-800 text-gray-300 border-gray-600 hover:border-red-500'
            }`}
          >
            ⚠ חסר מחיר
          </button>

          <button
            onClick={() => {
              if (!basketOnly && basketCount === 0) {
                navigate('/products')
                return
              }
              setBasketOnly(v => !v)
            }}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
              basketOnly
                ? 'bg-amber-500 text-gray-900 border-amber-500'
                : 'bg-gray-800 text-gray-300 border-gray-600 hover:border-amber-500'
            }`}
          >
            🛒 השווה את המחירים לסל שלי{basketCount > 0 ? ` (${basketCount})` : ''}
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="text-xs bg-gray-800 border border-gray-600 text-gray-300 rounded-full px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="name">מיון: שם מוצר</option>
            {CHAINS.map((c) => (
              <option key={c} value={c}>
                מיון: {c} (זול ראשון)
              </option>
            ))}
          </select>
        </div>

        {/* Department chips */}
        <div className="relative">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {DEPARTMENTS.map((d) => (
              <button
                key={d}
                onClick={() => setDept(d)}
                className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap ${
                  dept === d
                    ? 'bg-blue-700 text-white border-blue-700'
                    : 'bg-gray-800 text-gray-300 border-gray-600 hover:border-blue-500'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-gray-950 to-transparent" />
        </div>
      </div>

      <p className="text-xs text-gray-500 mb-3">מציג {sorted.length} מוצרים</p>

      {/* Price comparison table */}
      {sorted.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <div className="text-4xl mb-3">🔍</div>
          <p>לא נמצאו מוצרים</p>
        </div>
      ) : (
        <div className="relative">
        <div className="overflow-x-auto rounded-xl border border-gray-700 shadow-sm">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-800">
                <th className="sticky right-0 z-10 bg-gray-800 text-right px-3 py-2.5 font-semibold text-gray-300 w-44 border-b border-gray-700">
                  מוצר
                </th>
                {CHAINS.map((chain) => (
                  <th
                    key={chain}
                    className={`px-3 py-2.5 font-semibold text-center border-b border-gray-700 ${CHAIN_HEADER_COLORS[chain]}`}
                  >
                    {chain}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((item, idx) => {
                // Find minimum effective price across chains
                const chainEffectives = CHAINS.map((c) => getChainPrice(item, c)?.effective ?? Infinity)
                const minPrice = Math.min(...chainEffectives)
                const dept = deptByGroup.get(item.groupId) ?? ''

                return (
                  <tr
                    key={item.barcode}
                    className={idx % 2 === 0 ? 'bg-gray-900 hover:bg-gray-800' : 'bg-gray-900/50 hover:bg-gray-800'}
                  >
                    <td className={`sticky right-0 z-10 px-3 py-2.5 border-b border-gray-800 ${idx % 2 === 0 ? 'bg-gray-900' : 'bg-[#0d1117]'}`}>
                      <div className="font-medium text-gray-200 leading-tight text-xs">{item.name}</div>
                      {dept && (
                        <div className="text-gray-600 text-[10px] mt-0.5">{dept}</div>
                      )}
                    </td>
                    {CHAINS.map((chain) => {
                      const cp = getChainPrice(item, chain)
                      const isMin = cp !== null && cp.effective === minPrice
                      return (
                        <td
                          key={chain}
                          className={`px-3 py-2.5 text-center border-b border-gray-800 ${
                            isMin ? 'bg-green-900/20' : ''
                          }`}
                        >
                          <PriceCell cp={cp} isMin={isMin} />
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {/* scroll hint — left-edge fade in RTL signals hidden content */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-10 rounded-l-xl bg-gradient-to-r from-gray-950 to-transparent" />
        </div>
      )}

      {/* Totals row */}
      {sorted.length > 1 && (
        <div className="mt-4 p-4 bg-gray-900 rounded-xl border border-gray-700">
          <div className="text-sm font-semibold text-gray-300 mb-3">סכום לסל (מוצרים עם מחיר בלבד)</div>
          <div className="grid grid-cols-2 gap-3">
            {CHAINS.map((chain) => {
              const total = sorted.reduce((sum, item) => {
                const cp = getChainPrice(item, chain)
                return sum + (cp?.effective ?? 0)
              }, 0)
              const count = sorted.filter((item) => getChainPrice(item, chain) !== null).length
              return (
                <div key={chain} className={`rounded-lg p-3 border ${CHAIN_COLORS[chain]}`}>
                  <div className="text-xs font-medium text-gray-400 mb-1">{chain}</div>
                  <div className="text-lg font-extrabold text-gray-100">{total.toFixed(2)}₪</div>
                  <div className="text-[10px] text-gray-500">{count}/{sorted.length} מוצרים</div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
