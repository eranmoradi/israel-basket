import { useMemo, useState } from 'react'
import chainPricesData from '../data/chain_prices.json'
import productsData from '../data/products.json'
import type { ChainPricesData, ChainProductPrices, ChainPrice, Product } from '../types'

const chainPrices = chainPricesData as ChainPricesData
const allProducts = productsData as Product[]

const CHAINS = ['שופרסל', 'רמי לוי', 'יוחננוף', 'חצי חינם'] as const
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
  שופרסל: 'bg-orange-50 border-orange-200',
  'רמי לוי': 'bg-blue-50 border-blue-200',
  יוחננוף: 'bg-green-50 border-green-200',
  'חצי חינם': 'bg-purple-50 border-purple-200',
}

const CHAIN_HEADER_COLORS: Record<ChainName, string> = {
  שופרסל: 'bg-orange-500 text-white',
  'רמי לוי': 'bg-blue-600 text-white',
  יוחננוף: 'bg-green-600 text-white',
  'חצי חינם': 'bg-purple-600 text-white',
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
    return <span className="text-gray-300 text-sm">—</span>
  }
  return (
    <span className={`font-semibold tabular-nums text-sm ${isMin ? 'text-green-700' : 'text-gray-800'}`}>
      {isMin && <span className="ml-0.5 text-green-500 text-xs">★</span>}
      {cp.effective.toFixed(2)}₪
      {cp.sale !== null && (
        <span className="block text-xs text-gray-400 font-normal line-through leading-tight">
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

  const items = useMemo(() => {
    const q = search.trim().toLowerCase()
    return chainPrices.products.filter((item) => {
      const itemDept = deptByGroup.get(item.groupId) ?? ''
      const matchesDept = dept === 'הכל' || itemDept === dept
      const matchesSearch = !q || item.name.toLowerCase().includes(q)
      const hasMissing =
        !missingOnly || CHAINS.some((c) => getChainPrice(item, c) === null)
      return matchesDept && matchesSearch && hasMissing
    })
  }, [search, dept, missingOnly])

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name, 'he')
      const pa = getChainPrice(a, sortBy)?.effective ?? Infinity
      const pb = getChainPrice(b, sortBy)?.effective ?? Infinity
      return pa - pb
    })
  }, [items, sortBy])

  // Coverage stats
  const coverage = useMemo(() => {
    const total = chainPrices.products.length
    return CHAINS.map((c) => ({
      chain: c,
      count: chainPrices.products.filter((p) => getChainPrice(p, c) !== null).length,
      total,
    }))
  }, [])

  if (!chainPrices.fetched_at) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-gray-400">
        <div className="text-5xl mb-4">⏳</div>
        <p className="text-lg font-medium text-gray-600">נתוני מחירים עדיין לא נאספו</p>
        <p className="text-sm mt-2">הרץ את הסקריפט: <code className="bg-gray-100 px-2 py-0.5 rounded">python3 scripts/fetch_chain_prices.py</code></p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-5">
        <h1 className="text-2xl font-extrabold text-gray-900">השוואת מחירים</h1>
        <p className="text-sm text-gray-500 mt-1">
          עודכן: {new Date(chainPrices.fetched_at).toLocaleString('he-IL')} · {chainPrices.product_count} מוצרים
        </p>
      </div>

      {/* Coverage pills */}
      <div className="flex gap-2 flex-wrap mb-5">
        {coverage.map(({ chain, count, total }) => (
          <div
            key={chain}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border ${CHAIN_COLORS[chain as ChainName]}`}
          >
            <span>{chain}</span>
            <span className="font-bold">{count}/{total}</span>
          </div>
        ))}
      </div>

      {/* Search + filters */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="relative">
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="search"
            placeholder="חפש מוצר..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-xl py-2.5 pr-9 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setMissingOnly((v) => !v)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
              missingOnly
                ? 'bg-red-500 text-white border-red-500'
                : 'bg-white text-gray-600 border-gray-300 hover:border-red-300'
            }`}
          >
            ⚠ חסר מחיר
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="text-xs border border-gray-300 rounded-full px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
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
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {DEPARTMENTS.map((d) => (
            <button
              key={d}
              onClick={() => setDept(d)}
              className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap ${
                dept === d
                  ? 'bg-blue-700 text-white border-blue-700'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-3">מציג {sorted.length} מוצרים</p>

      {/* Price comparison table */}
      {sorted.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">🔍</div>
          <p>לא נמצאו מוצרים</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-right px-3 py-2.5 font-semibold text-gray-700 w-44 border-b border-gray-200">
                  מוצר
                </th>
                {CHAINS.map((chain) => (
                  <th
                    key={chain}
                    className={`px-3 py-2.5 font-semibold text-center border-b border-gray-200 ${CHAIN_HEADER_COLORS[chain]}`}
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
                    className={idx % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50/50 hover:bg-gray-100'}
                  >
                    <td className="px-3 py-2.5 border-b border-gray-100">
                      <div className="font-medium text-gray-800 leading-tight text-xs">{item.name}</div>
                      {dept && (
                        <div className="text-gray-400 text-[10px] mt-0.5">{dept}</div>
                      )}
                    </td>
                    {CHAINS.map((chain, ci) => {
                      const cp = getChainPrice(item, chain)
                      const isMin = cp !== null && cp.effective === minPrice
                      return (
                        <td
                          key={chain}
                          className={`px-3 py-2.5 text-center border-b border-gray-100 ${
                            isMin ? 'bg-green-50' : ''
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
      )}

      {/* Totals row */}
      {sorted.length > 1 && (
        <div className="mt-4 p-4 bg-gray-100 rounded-xl border border-gray-200">
          <div className="text-sm font-semibold text-gray-700 mb-3">סכום לסל (מוצרים עם מחיר בלבד)</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CHAINS.map((chain) => {
              const total = sorted.reduce((sum, item) => {
                const cp = getChainPrice(item, chain)
                return sum + (cp?.effective ?? 0)
              }, 0)
              const count = sorted.filter((item) => getChainPrice(item, chain) !== null).length
              return (
                <div key={chain} className={`rounded-lg p-3 border ${CHAIN_COLORS[chain]}`}>
                  <div className="text-xs font-medium text-gray-600 mb-1">{chain}</div>
                  <div className="text-lg font-extrabold text-gray-900">{total.toFixed(2)}₪</div>
                  <div className="text-[10px] text-gray-400">{count}/{sorted.length} מוצרים</div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
