import { useMemo, useState } from 'react'
import branchesData from '../data/branches.json'
import type { Branch } from '../types'
import BranchCard from '../components/BranchCard'

const branches = branchesData as Branch[]
const FORMATS = ['הכל', 'מרקט', 'היפר', 'מהדרין']
const CITIES = ['הכל', ...Array.from(new Set(branches.map((b) => b.city))).sort()]

export default function BranchesPage() {
  const [format, setFormat] = useState('הכל')
  const [city, setCity] = useState('הכל')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return branches.filter((b) => {
      const matchesFormat = format === 'הכל' || b.format === format
      const matchesCity = city === 'הכל' || b.city === city
      const matchesSearch =
        !q || b.name.toLowerCase().includes(q) || b.address.toLowerCase().includes(q)
      return matchesFormat && matchesCity && matchesSearch
    })
  }, [format, city, search])

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-extrabold text-gray-100 mb-5">
        סניפים משתתפים ({branches.length})
      </h1>

      {/* Search */}
      <div className="relative mb-4">
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">🔍</span>
        <input
          type="search"
          placeholder="חפש עיר או כתובת..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-800 border border-gray-600 text-gray-100 placeholder:text-gray-500 rounded-xl py-3 pr-10 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Format filter */}
      <div className="flex gap-2 mb-4">
        {FORMATS.map((f) => (
          <button
            key={f}
            onClick={() => setFormat(f)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
              format === f
                ? 'bg-blue-700 text-white border-blue-700'
                : 'bg-gray-800 text-gray-300 border-gray-600 hover:border-blue-500'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* City filter */}
      <div className="mb-4">
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full bg-gray-800 border border-gray-600 text-gray-100 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c === 'הכל' ? 'כל הערים' : c}
            </option>
          ))}
        </select>
      </div>

      <p className="text-xs text-gray-500 mb-3">מציג {filtered.length} סניפים</p>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <div className="text-4xl mb-3">🏪</div>
          <p>לא נמצאו סניפים</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((branch, idx) => (
            <BranchCard key={idx} branch={branch} />
          ))}
        </div>
      )}
    </div>
  )
}
