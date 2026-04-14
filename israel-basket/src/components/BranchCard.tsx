import type { Branch } from '../types'

const FORMAT_COLORS: Record<string, string> = {
  'מרקט': 'bg-blue-100 text-blue-700',
  'היפר': 'bg-purple-100 text-purple-700',
  'מהדרין': 'bg-green-100 text-green-700',
}

interface Props {
  branch: Branch
}

export default function BranchCard({ branch }: Props) {
  const colorClass = FORMAT_COLORS[branch.format] ?? 'bg-gray-100 text-gray-700'

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colorClass}`}>
              קארפור {branch.format}
            </span>
          </div>
          <p className="font-semibold text-gray-800">{branch.name}</p>
          <p className="text-sm text-gray-500 mt-0.5">{branch.address}</p>
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <a
            href={branch.wazeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-sky-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-sky-600 transition-colors"
          >
            <span>🗺</span> Waze
          </a>
          <a
            href={branch.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-gray-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <span>📍</span> Maps
          </a>
        </div>
      </div>
    </div>
  )
}
