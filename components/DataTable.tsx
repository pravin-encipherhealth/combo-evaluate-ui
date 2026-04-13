'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import type { CollectionQueryParams, DocumentRow, SortDir } from '@/lib/types'
import { fieldLabel, formatDate, isIsoDate } from '@/lib/utils'

interface DataTableProps {
  columns: string[]
  rows: DocumentRow[]
  params: CollectionQueryParams
}

export default function DataTable({ columns, rows, params }: DataTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  function toggleSort(col: string) {
    const next = new URLSearchParams(searchParams.toString())
    let dir: SortDir = 'DESC'
    if (params.sortBy === col) {
      dir = params.sortDir === 'DESC' ? 'ASC' : 'DESC'
    }
    next.set('sortBy', col)
    next.set('sortDir', dir)
    next.set('page', '0')
    startTransition(() => router.push(`${pathname}?${next.toString()}`))
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
          <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p className="text-sm font-medium text-gray-900">No documents found</p>
        <p className="mt-1 text-xs text-gray-500">Try disabling the Active Only filter.</p>
      </div>
    )
  }

  return (
    <div className={`overflow-x-auto transition-opacity ${isPending ? 'opacity-50' : ''}`}>
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead>
          <tr className="bg-gray-50">
            {columns.map((col) => {
              const isSorted = params.sortBy === col
              return (
                <th
                  key={col}
                  scope="col"
                  onClick={() => toggleSort(col)}
                  className="cursor-pointer whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 hover:bg-gray-100 hover:text-gray-700 select-none"
                >
                  <span className="flex items-center gap-1">
                    {fieldLabel(col)}
                    <span className={`ml-0.5 ${isSorted ? 'text-blue-600' : 'text-gray-300'}`}>
                      {isSorted
                        ? params.sortDir === 'DESC' ? '↓' : '↑'
                        : '↕'}
                    </span>
                  </span>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {rows.map((row, rowIdx) => (
            <tr key={rowIdx} className="hover:bg-blue-50/40 transition-colors">
              {columns.map((col) => (
                <td key={col} className="whitespace-nowrap px-4 py-3 align-middle">
                  <CellValue value={row[col]} columnKey={col} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Cell value renderer
// ---------------------------------------------------------------------------

function CellValue({ value, columnKey }: { value: unknown; columnKey: string }) {
  // null / undefined
  if (value === null || value === undefined) {
    return <span className="text-gray-300">—</span>
  }

  // Boolean — active column gets a badge, others get Yes/No
  if (typeof value === 'boolean') {
    if (columnKey === 'active') {
      return value ? (
        <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-green-600/20">
          Active
        </span>
      ) : (
        <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 ring-1 ring-red-600/20">
          Inactive
        </span>
      )
    }
    return <span className="text-gray-700">{value ? 'Yes' : 'No'}</span>
  }

  // Number
  if (typeof value === 'number') {
    return <span className="tabular-nums text-gray-800">{value.toLocaleString()}</span>
  }

  // String
  if (typeof value === 'string') {
    // ID fields — truncate + tooltip
    if (columnKey === 'id' || columnKey === '_id') {
      return (
        <span
          title={value}
          className="font-mono text-xs text-gray-600 cursor-default"
        >
          {value.length > 12 ? `${value.slice(0, 8)}…` : value}
        </span>
      )
    }
    // Date strings
    if (isIsoDate(value)) {
      return (
        <span title={value} className="text-gray-700 cursor-default">
          {formatDate(value)}
        </span>
      )
    }
    // Long text — truncate
    if (value.length > 60) {
      return (
        <span title={value} className="text-gray-800 cursor-default">
          {value.slice(0, 58)}…
        </span>
      )
    }
    return <span className="text-gray-800">{value}</span>
  }

  // Array (years, inputSource, etc.)
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-gray-300">—</span>
    return (
      <div className="flex flex-wrap gap-1 max-w-xs">
        {value.slice(0, 6).map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-700"
          >
            {String(item)}
          </span>
        ))}
        {value.length > 6 && (
          <span className="text-xs text-gray-400">+{value.length - 6}</span>
        )}
      </div>
    )
  }

  // Object (nested)
  if (typeof value === 'object') {
    const json = JSON.stringify(value)
    return (
      <span
        title={json}
        className="font-mono text-xs text-gray-500 cursor-default"
      >
        {json.length > 40 ? `${json.slice(0, 38)}…` : json}
      </span>
    )
  }

  return <span className="text-gray-800">{String(value)}</span>
}
