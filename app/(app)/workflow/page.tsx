'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { fetchPendingTickets, type Ticket } from '@/lib/workflow-api'
import { getAuthUser, canCreateTicket } from '@/lib/auth'
import TicketStatusBadge from '@/components/workflow/TicketStatusBadge'
import { formatDate } from '@/lib/utils'

export default function WorkflowPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const user = typeof window !== 'undefined' ? getAuthUser() : null

  useEffect(() => {
    fetchPendingTickets()
      .then(setTickets)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Approval Workflow</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {user
              ? `Showing tickets pending your review as ${user.roleDisplayName}`
              : 'Pending tickets'}
          </p>
        </div>
        {user && canCreateTicket(user.roleId) && (
          <Link
            href="/workflow/create"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Ticket
          </Link>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && tickets.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-20 text-center">
          <svg className="mx-auto h-10 w-10 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-medium text-gray-600">No pending tickets</p>
          <p className="text-xs text-gray-400 mt-1">All caught up!</p>
        </div>
      )}

      {/* Ticket list */}
      {!loading && !error && tickets.length > 0 && (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/workflow/${ticket.id}`}
              className="group flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {ticket.entityName}
                  </span>
                  <span className="font-mono text-xs text-gray-400 truncate max-w-[200px]" title={ticket.entityId}>
                    {ticket.entityId.slice(0, 12)}…
                  </span>
                  <TicketStatusBadge status={ticket.status} />
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                  <span>
                    {Object.keys(ticket.newData).length} field{Object.keys(ticket.newData).length !== 1 ? 's' : ''} changing
                  </span>
                  <span>·</span>
                  <span>by {ticket.createdBy}</span>
                  <span>·</span>
                  <span>{formatDate(ticket.createdAt)}</span>
                </div>
              </div>
              <svg className="h-4 w-4 text-gray-300 group-hover:text-blue-500 shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
