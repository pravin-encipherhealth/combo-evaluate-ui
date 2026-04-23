'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import type { CollectionMeta } from '@/lib/types'
import { formatAlias } from '@/lib/utils'
import { getAuthUser, clearAuthUser, roleColor, type AuthUser } from '@/lib/auth'

interface SidebarProps {
  collections: CollectionMeta[]
}

export default function Sidebar({ collections }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    setUser(getAuthUser())
  }, [])

  function handleLogout() {
    clearAuthUser()
    router.push('/login')
  }

  function NavLink({
    href,
    children,
    exact = false,
  }: {
    href: string
    children: React.ReactNode
    exact?: boolean
  }) {
    const active = exact ? pathname === href : pathname.startsWith(href)
    return (
      <Link
        href={href}
        onClick={() => setMobileOpen(false)}
        className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
          active
            ? 'bg-blue-600 text-white'
            : 'text-slate-300 hover:bg-slate-700 hover:text-white'
        }`}
      >
        {children}
      </Link>
    )
  }

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-700 px-5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
          CE
        </div>
        <div>
          <p className="text-sm font-semibold text-white leading-tight">Combo Evaluate</p>
          <p className="text-xs text-slate-400">Data Explorer</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {/* Dashboard */}
        <NavLink href="/" exact>
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Dashboard
        </NavLink>

        {/* Workflow section */}
        <div className="pt-4 pb-1">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Workflow</p>
        </div>

        <NavLink href="/workflow">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Pending Tickets
        </NavLink>

        <NavLink href="/workflow/create">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Ticket
        </NavLink>

        {/* Collections section */}
        <div className="pt-4 pb-1">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Collections</p>
        </div>

        {collections.map((c) => {
          const active = pathname === `/collections/${c.alias}`
          return (
            <Link
              key={c.alias}
              href={`/collections/${c.alias}`}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2 min-w-0">
                <svg className="h-3.5 w-3.5 shrink-0 opacity-60" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 000 2h14a1 1 0 100-2H3zm0 4a1 1 0 000 2h14a1 1 0 100-2H3zm0 4a1 1 0 000 2h8a1 1 0 100-2H3z" />
                </svg>
                <span className="truncate">{c.displayName}</span>
              </span>
              {c.count !== null && (
                <span className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                  active ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'
                }`}>
                  {c.count.toLocaleString()}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User info + logout */}
      {user && (
        <div className="border-t border-slate-700 px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.displayName}</p>
              <span className={`inline-block mt-0.5 rounded-full px-2 py-0.5 text-xs font-medium ${roleColor(user.roleId)}`}>
                {user.roleDisplayName}
              </span>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="shrink-0 rounded-md p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col bg-slate-900">
        {sidebarContent}
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex h-14 items-center gap-3 bg-slate-900 px-4 shadow">
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="text-sm font-semibold text-white">
          {pathname === '/' ? 'Dashboard'
            : pathname.startsWith('/workflow') ? 'Workflow'
            : formatAlias(pathname.split('/').pop() ?? '')}
        </span>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="lg:hidden fixed inset-0 z-40 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 shadow-xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 rounded-md p-1.5 text-slate-400 hover:text-white"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  )
}
