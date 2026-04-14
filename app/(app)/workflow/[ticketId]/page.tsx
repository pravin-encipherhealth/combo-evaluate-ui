'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  fetchAuditHistory,
  approveTicket,
  rejectTicket,
  editTicket,
  type Ticket,
} from '@/lib/workflow-api'
import { getAuthUser, canReviewTicket, canEditTicket } from '@/lib/auth'
import TicketStatusBadge from '@/components/workflow/TicketStatusBadge'
import DataDiff from '@/components/workflow/DataDiff'
import AuditTimeline from '@/components/workflow/AuditTimeline'
import KeyValueEditor, { pairsToRecord } from '@/components/workflow/KeyValueEditor'
import { formatDate } from '@/lib/utils'

export default function TicketDetailPage() {
  const { ticketId } = useParams<{ ticketId: string }>()
  const router = useRouter()
  const user = typeof window !== 'undefined' ? getAuthUser() : null

  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Reject modal
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectRemarks, setRejectRemarks] = useState('')
  const [rejectLoading, setRejectLoading] = useState(false)

  // Edit mode
  const [editOpen, setEditOpen] = useState(false)
  const [editPairs, setEditPairs] = useState<{ key: string; value: string }[]>([])
  const [editRemarks, setEditRemarks] = useState('')
  const [editLoading, setEditLoading] = useState(false)

  const [actionLoading, setActionLoading] = useState(false)

  // Load ticket — we reuse getAuditHistory filtered by ticketId
  useEffect(() => {
    if (!ticketId) return
    // Fetch all tickets history for this specific ticketId via pending list workaround:
    // We load pending tickets and check; if not found, load from a known entity via history.
    // Simplest: the backend has no GET /tickets/:id — use pending list + history
    // We'll do a direct approach: fetch pending and if not there try a trick
    loadTicket()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId])

  async function loadTicket() {
    setLoading(true)
    setError('')
    try {
      // Fetch pending tickets first; if this ticket is there, use it.
      const { fetchPendingTickets } = await import('@/lib/workflow-api')
      const pending = await fetchPendingTickets()
      const found = pending.find((t) => t.id === ticketId)
      if (found) {
        setTicket(found)
        return
      }
      // If not in pending, we need audit history — but we need entityName+entityId.
      // Since we can't look up by ticketId alone with current API,
      // show a "not found in pending" message guiding user.
      setError('Ticket not found in your pending queue. It may have already been resolved.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load ticket')
    } finally {
      setLoading(false)
    }
  }

  async function handleApprove() {
    if (!ticket) return
    setActionLoading(true)
    try {
      const updated = await approveTicket(ticket.id)
      setTicket(updated)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Approve failed')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleReject() {
    if (!ticket) return
    setRejectLoading(true)
    try {
      const updated = await rejectTicket(ticket.id, rejectRemarks)
      setTicket(updated)
      setRejectOpen(false)
      setRejectRemarks('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Reject failed')
    } finally {
      setRejectLoading(false)
    }
  }

  function openEdit() {
    if (!ticket) return
    setEditPairs(
      Object.entries(ticket.newData).map(([key, value]) => ({
        key,
        value: typeof value === 'string' ? value : JSON.stringify(value),
      })),
    )
    setEditRemarks('')
    setEditOpen(true)
  }

  async function handleEdit() {
    if (!ticket) return
    const newData = pairsToRecord(editPairs)
    if (Object.keys(newData).length === 0) return
    setEditLoading(true)
    try {
      const updated = await editTicket(ticket.id, newData, editRemarks || undefined)
      setTicket(updated)
      setEditOpen(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Edit failed')
    } finally {
      setEditLoading(false)
    }
  }

  const isPending =
    ticket?.status === 'PENDING_SUPERVISOR' || ticket?.status === 'PENDING_ENCIPHER'
  const canReview = user ? canReviewTicket(user.roleId) : false
  const canEdit =
    user && ticket
      ? canEditTicket(user.roleId) && ticket.status === 'PENDING_SUPERVISOR'
      : false

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <nav className="mb-5 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/workflow" className="hover:text-gray-800 transition-colors">Workflow</Link>
        <span className="text-gray-300">/</span>
        <span className="font-medium text-gray-800 font-mono text-xs">{ticketId.slice(0, 10)}…</span>
      </nav>

      {loading && (
        <div className="space-y-4">
          <div className="h-10 w-64 animate-pulse rounded-lg bg-gray-200" />
          <div className="h-48 animate-pulse rounded-xl bg-gray-100" />
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
          <div className="mt-3">
            <Link href="/workflow" className="font-medium underline">← Back to Workflow</Link>
          </div>
        </div>
      )}

      {!loading && ticket && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900">{ticket.entityName}</h1>
                <TicketStatusBadge status={ticket.status} />
              </div>
              <p className="mt-1 font-mono text-xs text-gray-400">{ticket.entityId}</p>
              <p className="mt-1 text-xs text-gray-500">
                Raised by <span className="font-medium">{ticket.createdBy}</span>
                {' '}({ticket.createdByRole}) · {formatDate(ticket.createdAt)}
              </p>
            </div>

            {/* Action buttons */}
            {isPending && canReview && (
              <div className="flex items-center gap-2">
                {canEdit && (
                  <button
                    onClick={openEdit}
                    className="rounded-lg border border-violet-300 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700 hover:bg-violet-100 transition-colors"
                  >
                    Edit Changes
                  </button>
                )}
                <button
                  onClick={() => setRejectOpen(true)}
                  disabled={actionLoading}
                  className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50 transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {actionLoading ? 'Processing…' : 'Approve'}
                </button>
              </div>
            )}
          </div>

          {/* Data diff */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-3">
              <div className="grid grid-cols-3 gap-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                <span>Field</span>
                <span>Current Value</span>
                <span>Requested Value</span>
              </div>
            </div>
            <div className="px-5 py-4">
              <DataDiff oldData={ticket.oldData ?? {}} newData={ticket.newData} />
            </div>
          </div>

          {/* Rejection reason */}
          {ticket.status === 'REJECTED' && ticket.rejectionReason && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-red-500 mb-1">Rejection Reason</p>
              <p className="text-sm text-red-800">{ticket.rejectionReason}</p>
              <p className="text-xs text-red-400 mt-1">by {ticket.rejectedBy}</p>
            </div>
          )}

          {/* Audit trail */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm px-5 py-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Audit Trail</h2>
            <AuditTimeline entries={ticket.auditTrail} />
          </div>
        </div>
      )}

      {/* Reject modal */}
      {rejectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-gray-900 mb-1">Reject Ticket</h3>
            <p className="text-sm text-gray-500 mb-4">Provide a reason so the requester can revise and resubmit.</p>
            <textarea
              value={rejectRemarks}
              onChange={(e) => setRejectRemarks(e.target.value)}
              rows={3}
              placeholder="e.g. Incorrect result code — should be Z88 not Z99"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm resize-none focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setRejectOpen(false)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={rejectLoading || !rejectRemarks.trim()}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {rejectLoading ? 'Rejecting…' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-gray-900 mb-1">Edit Requested Changes</h3>
            <p className="text-sm text-gray-500 mb-4">Modify the fields before forwarding to Encipher review.</p>
            <div className="mb-4">
              <KeyValueEditor value={editPairs} onChange={setEditPairs} />
            </div>
            <textarea
              value={editRemarks}
              onChange={(e) => setEditRemarks(e.target.value)}
              rows={2}
              placeholder="Optional note explaining the edit"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm resize-none focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setEditOpen(false)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                disabled={editLoading}
                className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
              >
                {editLoading ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
