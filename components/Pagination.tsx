'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import type { CollectionQueryParams } from '@/lib/types'

interface PaginationProps {
  params: CollectionQueryParams
  totalPages: number
  totalElements: number
}

export default function Pagination({ params, totalPages, totalElements }: PaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  if (totalPages <= 1) return null

  function goTo(page: number) {
    const next = new URLSearchParams(searchParams.toString())
    next.set('page', String(page))
    startTransition(() => router.push(`${pathname}?${next.toString()}`))
  }

  const current = params.page
  const from = current * params.size + 1
  const to = Math.min((current + 1) * params.size, totalElements)

  // Build visible page numbers: always show first, last, current ±2, with ellipsis
  function buildPages(): (number | '…')[] {
    const pages: (number | '…')[] = []
    const window = 2

    for (let i = 0; i < totalPages; i++) {
      if (
        i === 0 ||
        i === totalPages - 1 ||
        (i >= current - window && i <= current + window)
      ) {
        pages.push(i)
      } else if (pages[pages.length - 1] !== '…') {
        pages.push('…')
      }
    }
    return pages
  }

  const pages = buildPages()

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
      {/* Range info */}
      <p className="text-gray-500">
        Showing{' '}
        <span className="font-medium text-gray-800">{from.toLocaleString()}–{to.toLocaleString()}</span>
        {' '}of{' '}
        <span className="font-medium text-gray-800">{totalElements.toLocaleString()}</span>
      </p>

      {/* Page buttons */}
      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          onClick={() => goTo(current - 1)}
          disabled={current === 0 || isPending}
          className="rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Previous page"
        >
          ←
        </button>

        {pages.map((p, idx) =>
          p === '…' ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 select-none">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => goTo(p)}
              disabled={p === current || isPending}
              className={`min-w-[2rem] rounded-md border px-2.5 py-1.5 shadow-sm transition-colors ${
                p === current
                  ? 'border-blue-600 bg-blue-600 font-semibold text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40'
              }`}
            >
              {(p as number) + 1}
            </button>
          ),
        )}

        {/* Next */}
        <button
          onClick={() => goTo(current + 1)}
          disabled={current >= totalPages - 1 || isPending}
          className="rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Next page"
        >
          →
        </button>
      </div>
    </div>
  )
}
