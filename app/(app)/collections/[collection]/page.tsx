import type { Metadata } from 'next'
import Link from 'next/link'
import { fetchCollectionData } from '@/lib/api'
import { formatAlias, deriveColumns } from '@/lib/utils'
import { DEFAULT_QUERY } from '@/lib/types'
import type { CollectionQueryParams, SortDir } from '@/lib/types'
import DataTable from '@/components/DataTable'
import FilterBar from '@/components/FilterBar'
import Pagination from '@/components/Pagination'

// ---------------------------------------------------------------------------
// Dynamic metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ collection: string }>
}): Promise<Metadata> {
  const { collection } = await params
  return { title: formatAlias(collection) }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ collection: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { collection } = await params
  const sp = await searchParams

  // Parse URL search params with safe defaults
  const queryParams: CollectionQueryParams = {
    page: clampInt(sp.page, 0, 0),
    size: clampInt(sp.size, DEFAULT_QUERY.size, 1, 100),
    sortBy: (sp.sortBy as string) || DEFAULT_QUERY.sortBy,
    sortDir: ((sp.sortDir as string) === 'ASC' ? 'ASC' : 'DESC') as SortDir,
    activeOnly: sp.activeOnly !== 'false',
  }

  // Fetch data (throws on backend error → caught by error.tsx boundary)
  const pageData = await fetchCollectionData(collection, queryParams)
  const columns = deriveColumns(pageData.content)

  return (
    <div className="px-6 py-8 max-w-full">
      {/* Breadcrumb */}
      <nav className="mb-5 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-gray-800 transition-colors">
          Dashboard
        </Link>
        <span className="text-gray-300">/</span>
        <span className="font-medium text-gray-800">{formatAlias(collection)}</span>
      </nav>

      {/* Page header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{formatAlias(collection)}</h1>
          <p className="mt-0.5 font-mono text-xs text-gray-400">{collection}</p>
        </div>
      </div>

      {/* Main card */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {/* Filter bar */}
        <div className="border-b border-gray-100 px-5 py-3">
          <FilterBar params={queryParams} totalElements={pageData.totalElements} />
        </div>

        {/* Table */}
        <DataTable columns={columns} rows={pageData.content} params={queryParams} />

        {/* Pagination */}
        {pageData.totalPages > 1 && (
          <div className="border-t border-gray-100 px-5 py-3">
            <Pagination
              params={queryParams}
              totalPages={pageData.totalPages}
              totalElements={pageData.totalElements}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clampInt(
  raw: string | string[] | undefined,
  fallback: number,
  min?: number,
  max?: number,
): number {
  const n = parseInt(String(raw ?? fallback), 10)
  if (isNaN(n)) return fallback
  if (min !== undefined && n < min) return min
  if (max !== undefined && n > max) return max
  return n
}
