export interface AuthUser {
  username: string
  roleId: string
  displayName: string
  roleDisplayName: string
}

const COOKIE_NAME = 'combo_auth'
const STORAGE_KEY = 'combo_auth'

// ---------------------------------------------------------------------------
// Client-side helpers (browser only)
// ---------------------------------------------------------------------------

export function getAuthUser(): AuthUser | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

export function setAuthUser(user: AuthUser): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  // Also set a plain cookie so Next.js middleware can read it
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(user))}; path=/; SameSite=Lax`
}

export function clearAuthUser(): void {
  localStorage.removeItem(STORAGE_KEY)
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`
}

// ---------------------------------------------------------------------------
// Auth headers for fetch calls (client-side only)
// ---------------------------------------------------------------------------

export function authHeaders(): Record<string, string> {
  const user = getAuthUser()
  if (!user) return {}
  return {
    'X-User': user.username,
    'X-Role-Id': user.roleId,
  }
}

// ---------------------------------------------------------------------------
// Role capability helpers
// ---------------------------------------------------------------------------

export function canCreateTicket(roleId: string): boolean {
  return roleId === 'THREE_GEN_CODER' || roleId === 'THREE_GEN_SUPERVISOR'
}

export function canReviewTicket(roleId: string): boolean {
  return roleId === 'THREE_GEN_SUPERVISOR' || roleId === 'ENCIPHER_SUPERVISOR'
}

export function canEditTicket(roleId: string): boolean {
  return roleId === 'THREE_GEN_SUPERVISOR'
}

export function roleColor(roleId: string): string {
  switch (roleId) {
    case 'THREE_GEN_CODER':      return 'bg-blue-100 text-blue-700'
    case 'THREE_GEN_SUPERVISOR': return 'bg-violet-100 text-violet-700'
    case 'ENCIPHER_SUPERVISOR':  return 'bg-emerald-100 text-emerald-700'
    default:                     return 'bg-gray-100 text-gray-600'
  }
}
