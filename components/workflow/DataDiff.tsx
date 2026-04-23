import { fieldLabel, formatDate, isIsoDate } from '@/lib/utils'

interface DataDiffProps {
  oldData: Record<string, unknown>
  newData: Record<string, unknown>
}

function renderValue(val: unknown): string {
  if (val === null || val === undefined) return '—'
  if (typeof val === 'string' && isIsoDate(val)) return formatDate(val)
  if (Array.isArray(val)) return val.join(', ')
  if (typeof val === 'object') return JSON.stringify(val)
  return String(val)
}

export default function DataDiff({ oldData, newData }: DataDiffProps) {
  const changedKeys = Object.keys(newData).filter(
    (k) => JSON.stringify(oldData[k]) !== JSON.stringify(newData[k])
  )
  const unchangedKeys = Object.keys(oldData).filter((k) => !changedKeys.includes(k) && k !== '_id' && k !== 'version')

  return (
    <div className="space-y-4">
      {/* Changed fields */}
      {changedKeys.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
            Changed Fields ({changedKeys.length})
          </h4>
          <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 overflow-hidden">
            {changedKeys.map((key) => (
              <div key={key} className="grid grid-cols-3 gap-4 bg-amber-50/60 px-4 py-3 text-sm">
                <div className="font-medium text-gray-700">{fieldLabel(key)}</div>
                <div className="text-red-600 line-through opacity-70">{renderValue(oldData[key])}</div>
                <div className="text-green-700 font-medium">{renderValue(newData[key])}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unchanged context */}
      {unchangedKeys.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-gray-400 hover:text-gray-600 select-none">
            Unchanged fields ({unchangedKeys.length}) ▸
          </summary>
          <div className="mt-2 divide-y divide-gray-100 rounded-xl border border-gray-200 overflow-hidden">
            {unchangedKeys.map((key) => (
              <div key={key} className="grid grid-cols-3 gap-4 px-4 py-2.5 text-sm bg-white">
                <div className="text-gray-500">{fieldLabel(key)}</div>
                <div className="col-span-2 text-gray-700">{renderValue(oldData[key])}</div>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
