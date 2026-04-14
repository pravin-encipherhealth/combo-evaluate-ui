import type { TicketStatus } from '@/lib/workflow-api'

const STATUS_STYLES: Record<TicketStatus, { bg: string; label: string; dot: string }> = {
  PENDING_SUPERVISOR: { bg: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20', label: 'Pending Supervisor', dot: 'bg-yellow-400' },
  PENDING_SUPERADMIN:   { bg: 'bg-blue-50 text-blue-700 ring-blue-600/20',       label: 'Pending SUPERADMIN',   dot: 'bg-blue-400'   },
  APPROVED:           { bg: 'bg-green-50 text-green-700 ring-green-600/20',    label: 'Approved',           dot: 'bg-green-400'  },
  REJECTED:           { bg: 'bg-red-50 text-red-700 ring-red-600/20',          label: 'Rejected',           dot: 'bg-red-400'    },
}

export default function TicketStatusBadge({ status }: { status: TicketStatus }) {
  const s = STATUS_STYLES[status]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${s.bg}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  )
}
