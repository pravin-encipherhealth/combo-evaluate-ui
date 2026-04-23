import type { AuditEntry } from '@/lib/workflow-api'
import { formatDate } from '@/lib/utils'

const ACTION_STYLES: Record<string, { icon: string; color: string }> = {
  CREATED:  { icon: '✦', color: 'bg-blue-500'   },
  APPROVED: { icon: '✔', color: 'bg-green-500'   },
  REJECTED: { icon: '✖', color: 'bg-red-500'     },
  EDITED:   { icon: '✎', color: 'bg-violet-500'  },
}

function style(action: string) {
  return ACTION_STYLES[action] ?? { icon: '•', color: 'bg-gray-400' }
}

export default function AuditTimeline({ entries }: { entries: AuditEntry[] }) {
  return (
    <ol className="relative space-y-0">
      {entries.map((entry, idx) => {
        const s = style(entry.action)
        const isLast = idx === entries.length - 1
        return (
          <li key={idx} className="flex gap-4">
            {/* Line + dot */}
            <div className="flex flex-col items-center">
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold ${s.color}`}>
                {s.icon}
              </div>
              {!isLast && <div className="w-px flex-1 bg-gray-200 my-1" />}
            </div>
            {/* Content */}
            <div className="pb-5 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {entry.action}{' '}
                <span className="font-normal text-gray-500">by</span>{' '}
                <span className="font-semibold">{entry.performedBy}</span>
                <span className="ml-1.5 text-xs text-gray-400">({entry.performedByRole})</span>
              </p>
              {entry.fromStatus && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {entry.fromStatus} → {entry.toStatus}
                </p>
              )}
              {entry.remarks && (
                <p className="mt-1 text-xs text-gray-600 italic bg-gray-50 rounded px-2 py-1 border border-gray-100">
                  "{entry.remarks}"
                </p>
              )}
              <p className="mt-1 text-xs text-gray-400">{formatDate(entry.timestamp)}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
