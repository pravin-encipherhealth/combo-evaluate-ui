/**
 * Workflow API functions — all require authentication headers.
 * These are client-side only (called from Client Components).
 */

import { authHeaders } from './auth'

const BASE = ''  // relative → proxied through Next.js rewrite

async function wFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...init?.headers,
    },
  })
  const body = await res.json()
  if (!res.ok || body.status !== 'SUCCESS') {
    throw new Error(body.message ?? `Request failed: ${res.status}`)
  }
  return body.response as T
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TicketStatus =
  | 'PENDING_SUPERVISOR'
  | 'PENDING_ENCIPHER'
  | 'APPROVED'
  | 'REJECTED'

export interface AuditEntry {
  action: string
  performedBy: string
  performedByRole: string
  fromStatus: TicketStatus | null
  toStatus: TicketStatus
  remarks: string | null
  timestamp: string
}

export interface Ticket {
  id: string
  entityName: string
  entityId: string
  oldData: Record<string, unknown>
  newData: Record<string, unknown>
  status: TicketStatus
  createdBy: string
  createdByRole: string
  updatedBy: string | null
  approvedBy: string | null
  rejectedBy: string | null
  rejectionReason: string | null
  createdAt: string
  updatedAt: string
  auditTrail: AuditEntry[]
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function login(username: string, password: string) {
  const res = await fetch('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  const body = await res.json()
  if (!res.ok || body.status !== 'SUCCESS') {
    throw new Error(body.message ?? 'Login failed')
  }
  return body.response as {
    username: string
    roleId: string
    displayName: string
    roleDisplayName: string
  }
}

// ---------------------------------------------------------------------------
// Tickets
// ---------------------------------------------------------------------------

export function fetchPendingTickets(): Promise<Ticket[]> {
  return wFetch<Ticket[]>('/api/v1/approval-tickets/pending')
}

export function fetchAuditHistory(entityName: string, entityId: string): Promise<Ticket[]> {
  return wFetch<Ticket[]>(
    `/api/v1/approval-tickets/audit-history?entityName=${encodeURIComponent(entityName)}&entityId=${encodeURIComponent(entityId)}`,
  )
}

export function createTicket(payload: {
  entityName: string
  entityId: string
  newData: Record<string, unknown>
}): Promise<Ticket> {
  return wFetch<Ticket>('/api/v1/approval-tickets', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function approveTicket(ticketId: string): Promise<Ticket> {
  return wFetch<Ticket>(`/api/v1/approval-tickets/${ticketId}/approve`, { method: 'PUT' })
}

export function rejectTicket(ticketId: string, remarks: string): Promise<Ticket> {
  return wFetch<Ticket>(`/api/v1/approval-tickets/${ticketId}/reject`, {
    method: 'PUT',
    body: JSON.stringify({ remarks }),
  })
}

export function editTicket(
  ticketId: string,
  newData: Record<string, unknown>,
  remarks?: string,
): Promise<Ticket> {
  return wFetch<Ticket>(`/api/v1/approval-tickets/${ticketId}/edit`, {
    method: 'PUT',
    body: JSON.stringify({ newData, remarks }),
  })
}
