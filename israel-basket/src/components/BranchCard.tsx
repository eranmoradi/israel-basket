import type { Branch } from '../types'

const FORMAT_COLORS: Record<string, string> = {
  'מרקט': 'bg-blue-900/40 text-blue-300',
  'היפר': 'bg-purple-900/40 text-purple-300',
  'מהדרין': 'bg-green-900/40 text-green-300',
}

interface Props {
  branch: Branch
  distance?: number // km, optional — shown when in near-me mode
}

export default function BranchCard({ branch, distance }: Props) {
  const colorClass = FORMAT_COLORS[branch.format] ?? 'bg-gray-700 text-gray-300'

  const distanceLabel =
    distance !== undefined
      ? distance < 1
        ? `${Math.round(distance * 1000)} מ׳`
        : `${distance.toFixed(1)} ק״מ`
      : null

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colorClass}`}>
              קארפור {branch.format}
            </span>
            {distanceLabel && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                📍 {distanceLabel}
              </span>
            )}
          </div>
          <p className="font-semibold text-gray-100">{branch.name}</p>
          <p className="text-sm text-gray-400 mt-0.5">{branch.address}</p>
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <a
            href={branch.wazeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-sky-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-sky-700 transition-colors"
          >
            <span>🗺</span> Waze
          </a>
          <a
            href={branch.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-gray-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-gray-500 transition-colors"
          >
            <span>📍</span> Maps
          </a>
        </div>
      </div>
    </div>
  )
}
