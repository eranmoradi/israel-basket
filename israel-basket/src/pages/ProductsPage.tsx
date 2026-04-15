import { useMemo, useState } from 'react'
import productsData from '../data/products.json'
import type { Product } from '../types'
import ProductCard from '../components/ProductCard'

const products = productsData as Product[]
const DEPARTMENTS = ['הכל', ...Array.from(new Set(products.map((p) => p.department))).sort()]

export default function ProductsPage() {
  const [search, setSearch] = useState('')
  const [dept, setDept] = useState('הכל')
  const [showBasicOnly, setShowBasicOnly] = useState(false)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products.filter((p) => {
      const matchesDept = dept === 'הכל' || p.department === dept
      const matchesBasic = !showBasicOnly || p.isBasic
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      return matchesDept && matchesBasic && matchesSearch
    })
  }, [search, dept, showBasicOnly])

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-extrabold text-gray-100 mb-5">מוצרי הסל ({products.length})</h1>

      {/* Search */}
      <div className="relative mb-4">
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">🔍</span>
        <input
          type="search"
          placeholder="חפש מוצר, מותג או קטגוריה..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-800 border border-gray-600 text-gray-100 placeholder:text-gray-500 rounded-xl py-3 pr-10 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setShowBasicOnly((v) => !v)}
          className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
            showBasicOnly
              ? 'bg-green-600 text-white border-green-600'
              : 'bg-gray-800 text-gray-300 border-gray-600 hover:border-green-500'
          }`}
        >
          🌿 מוצרי יסוד בלבד
        </button>
      </div>

      {/* Department filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
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

      {/* Results count */}
      <p className="text-xs text-gray-500 mb-3">מציג {filtered.length} מוצרים</p>

      {/* Product grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <div className="text-4xl mb-3">🔍</div>
          <p>לא נמצאו מוצרים</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((product) => (
            <ProductCard key={product.id + '-' + product.barcode} product={product} />
          ))}
        </div>
      )}

    </div>
  )
}
