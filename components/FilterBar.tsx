'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import type { CollectionQueryParams } from '@/lib/types'

interface FilterBarProps {
  params: CollectionQueryParams
  totalElements: number
}

const PAGE_SIZES = [10, 20, 50, 100]

export default function FilterBar({ params, totalElements }: FilterBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  function pushParams(updates: Partial<CollectionQueryParams>) {
    const next = new URLSearchParams(searchParams.toString())
    const merged = { ...params, ...updates }
    next.set('page', String(merged.page))
    next.set('size', String(merged.size))
    next.set('sortBy', merged.sortBy)
    next.set('sortDir', merged.sortDir)
    next.set('activeOnly', String(merged.activeOnly))
    startTransition(() => router.push(`${pathname}?${next.toString()}`))
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {/* Left: total count */}
      <p className="text-sm text-gray-500">
        {isPending ? (
          <span className="text-blue-600 animate-pulse">Loading…</span>
        ) : (
          <>
            <span className="font-semibold text-gray-800 tabular-nums">
              {totalElements.toLocaleString()}
            </span>{' '}
            document{totalElements !== 1 ? 's' : ''}
          </>
        )}
      </p>

      {/* Right: controls */}
      <div className="flex items-center gap-3">
        {/* Active-only toggle */}
        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600 select-none">
          <button
            type="button"
            role="switch"
            aria-checked={params.activeOnly}
            onClick={() => pushParams({ activeOnly: !params.activeOnly, page: 0 })}
            className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
              params.activeOnly ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                params.activeOnly ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
          Active only
        </label>

        {/* Page size */}
        <div className="flex items-center gap-1.5">
          <label htmlFor="page-size" className="text-sm text-gray-600 whitespace-nowrap">
            Rows
          </label>
          <select
            id="page-size"
            value={params.size}
            onChange={(e) => pushParams({ size: Number(e.target.value), page: 0 })}
            className="rounded-md border border-gray-300 bg-white py-1 pl-2 pr-7 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
