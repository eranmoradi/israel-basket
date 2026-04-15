import { useMemo, useState } from 'react'
import branchesData from '../data/branches.json'
import type { Branch } from '../types'
import BranchCard from '../components/BranchCard'
import { haversineKm } from '../utils/geo'

const branches = branchesData as Branch[]
const FORMATS = ['הכל', 'מרקט', 'היפר', 'מהדרין']
const CITIES = ['הכל', ...Array.from(new Set(branches.map((b) => b.city))).sort()]
const NEAR_ME_COUNT = 5

type GeoState =
  | { mode: 'off' }
  | { mode: 'loading' }
  | { mode: 'active'; userLat: number; userLng: number }
  | { mode: 'error'; message: string }

export default function BranchesPage() {
  const [format, setFormat] = useState('הכל')
  const [city, setCity] = useState('הכל')
  const [search, setSearch] = useState('')
  const [geo, setGeo] = useState<GeoState>({ mode: 'off' })

  const isNearMeActive = geo.mode === 'active'
  const hasCoords = branches.some((b) => b.lat !== undefined && b.lng !== undefined)

  function handleNearMeClick() {
    if (geo.mode === 'active' || geo.mode === 'error') {
      setGeo({ mode: 'off' })
      return
    }
    if (geo.mode === 'loading') return

    if (!navigator.geolocation) {
      setGeo({ mode: 'error', message: 'הדפדפן שלך אינו תומך בשירותי מיקום' })
      return
    }

    setGeo({ mode: 'loading' })
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeo({ mode: 'active', userLat: pos.coords.latitude, userLng: pos.coords.longitude })
      },
      (err) => {
        const message =
          err.code === err.PERMISSION_DENIED
            ? 'לא אישרת גישה למיקום. אנא אפשר מיקום בהגדרות הדפדפן ונסה שנית.'
            : 'לא הצלחנו לאתר את מיקומך. נסה שנית.'
        setGeo({ mode: 'error', message })
      },
      { timeout: 10000, maximumAge: 60000 },
    )
  }

  const nearMeBranches = useMemo(() => {
    if (geo.mode !== 'active') return []
    const { userLat, userLng } = geo
    return branches
      .filter((b) => b.lat !== undefined && b.lng !== undefined)
      .map((b) => ({ branch: b, distance: haversineKm(userLat, userLng, b.lat!, b.lng!) }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, NEAR_ME_COUNT)
  }, [geo])

  const filtered = useMemo(() => {
    if (isNearMeActive) return []
    const q = search.trim().toLowerCase()
    return branches.filter((b) => {
      const matchesFormat = format === 'הכל' || b.format === format
      const matchesCity = city === 'הכל' || b.city === city
      const matchesSearch =
        !q || b.name.toLowerCase().includes(q) || b.address.toLowerCase().includes(q)
      return matchesFormat && matchesCity && matchesSearch
    })
  }, [format, city, search, isNearMeActive])

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-extrabold text-gray-100 mb-5">
        סניפים משתתפים ({branches.length})
      </h1>

      {/* Search — hidden in near-me mode */}
      {!isNearMeActive && (
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
      )}

      {/* Filter row: format pills + near-me button */}
      <div className="flex gap-2 mb-4 items-center">
        {!isNearMeActive &&
          FORMATS.map((f) => (
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

        {/* Spacer pushes near-me button to the left end (RTL = visual left) */}
        <span className="flex-1" />

        <button
          onClick={handleNearMeClick}
          disabled={geo.mode === 'loading' || !hasCoords}
          title={!hasCoords ? 'נתוני מיקום לא זמינים' : undefined}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
            isNearMeActive
              ? 'bg-amber-600 text-white border-amber-600'
              : geo.mode === 'error'
                ? 'bg-red-900/40 text-red-300 border-red-700'
                : 'bg-gray-800 text-gray-300 border-gray-600 hover:border-amber-500'
          }`}
        >
          {geo.mode === 'loading' ? (
            <>
              <span className="animate-spin inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full" />
              מאתר...
            </>
          ) : (
            <>📍 סניפים קרובים</>
          )}
        </button>
      </div>

      {/* City filter — hidden in near-me mode */}
      {!isNearMeActive && (
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
      )}

      {/* Error banner */}
      {geo.mode === 'error' && (
        <div className="mb-4 rounded-xl bg-red-900/30 border border-red-800 px-4 py-3 text-sm text-red-300">
          {geo.message}
        </div>
      )}

      {/* Near-me mode header */}
      {isNearMeActive && (
        <p className="text-xs text-amber-400 mb-3">
          מציג {NEAR_ME_COUNT} הסניפים הקרובים ביותר אליך
        </p>
      )}

      {/* Normal mode count */}
      {!isNearMeActive && geo.mode !== 'loading' && (
        <p className="text-xs text-gray-500 mb-3">מציג {filtered.length} סניפים</p>
      )}

      {/* Results */}
      {isNearMeActive ? (
        nearMeBranches.length > 0 ? (
          <div className="space-y-3">
            {nearMeBranches.map(({ branch, distance }, idx) => (
              <BranchCard key={idx} branch={branch} distance={distance} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <div className="text-4xl mb-3">📍</div>
            <p>לא נמצאו סניפים עם נתוני מיקום</p>
          </div>
        )
      ) : filtered.length === 0 ? (
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
