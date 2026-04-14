/**
 * User management API functions — SUPERADMIN only.
 * Client-side only (called from Client Components).
 */

import { authHeaders } from './auth'

async function uFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
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

export type UserRole = 'CODER' | 'SUPERVISOR' | 'SUPERADMIN'

export interface User {
  id: string
  username: string
  displayName: string
  role: UserRole
  active: boolean
  createdAt: string
  createdBy: string
  updatedAt?: string
  updatedBy?: string
}

export interface CreateUserPayload {
  username: string
  password: string
  displayName: string
  role: UserRole
}

export interface UpdateUserPayload {
  displayName?: string
  role?: UserRole
  active?: boolean
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

export function fetchUsers(): Promise<User[]> {
  return uFetch<User[]>('/api/v1/users')
}

export function createUser(payload: CreateUserPayload): Promise<User> {
  return uFetch<User>('/api/v1/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateUser(id: string, payload: UpdateUserPayload): Promise<User> {
  return uFetch<User>(`/api/v1/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function changePassword(id: string, payload: ChangePasswordPayload): Promise<void> {
  return uFetch<void>(`/api/v1/users/${id}/change-password`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}
