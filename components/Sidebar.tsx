'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import type { CollectionMeta } from '@/lib/types'
import { formatAlias } from '@/lib/utils'

interface SidebarProps {
  collections: CollectionMeta[]
}

export default function Sidebar({ collections }: SidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = collections.map((c) => ({
    alias: c.alias,
    label: c.displayName,
    count: c.count,
    href: `/collections/${c.alias}`,
  }))

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo / App name */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-700 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
          CE
        </div>
        <div>
          <p className="text-sm font-semibold text-white leading-tight">Combo Evaluate</p>
          <p className="text-xs text-slate-400">Data Explorer</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {/* Dashboard link */}
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            pathname === '/'
              ? 'bg-blue-600 text-white'
              : 'text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Dashboard
        </Link>

        {/* Divider */}
        <div className="pt-3 pb-1">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Collections
          </p>
        </div>

        {navItems.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.alias}
              href={item.href}
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
                <span className="truncate">{item.label}</span>
              </span>
              {item.count !== null && (
                <span className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                  active ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'
                }`}>
                  {item.count.toLocaleString()}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-700 px-5 py-3">
        <p className="text-xs text-slate-500">
          {collections.length} collection{collections.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col bg-slate-900">
        {sidebarContent}
      </aside>

      {/* Mobile: hamburger button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex h-14 items-center gap-3 bg-slate-900 px-4 shadow">
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white"
          aria-label="Open menu"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="text-sm font-semibold text-white">
          {pathname === '/' ? 'Dashboard' : formatAlias(pathname.split('/').pop() ?? '')}
        </span>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 shadow-xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 rounded-md p-1.5 text-slate-400 hover:text-white"
              aria-label="Close menu"
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
