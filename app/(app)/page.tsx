import type { Metadata } from 'next'
import { fetchCollections, fetchAllCounts } from '@/lib/api'
import { formatAlias } from '@/lib/utils'
import CollectionCard from '@/components/CollectionCard'
import type { CollectionMeta } from '@/lib/types'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  let collections: CollectionMeta[] = []
  let fetchError: string | null = null

  try {
    const infos = await fetchCollections()
    const counts = await fetchAllCounts(infos.map((c) => c.alias), true)
    collections = infos.map((c) => ({
      ...c,
      displayName: formatAlias(c.alias),
      count: counts[c.alias] ?? null,
    }))
  } catch (err) {
    fetchError = err instanceof Error ? err.message : 'Failed to load collections.'
  }

  const total = collections.reduce((acc, c) => acc + (c.count ?? 0), 0)

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Collections Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Browse all medical coding reference data collections.
        </p>
      </div>

      {/* Summary stats */}
      {!fetchError && (
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <StatCard label="Collections" value={collections.length} />
          <StatCard label="Total Documents" value={total} />
          <StatCard label="Status" value="Live" highlight />
        </div>
      )}

      {/* Error */}
      {fetchError && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <strong>Backend unavailable:</strong> {fetchError}
        </div>
      )}

      {/* Collection cards grid */}
      {collections.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {collections.map((c) => (
            <CollectionCard key={c.alias} collection={c} />
          ))}
        </div>
      ) : (
        !fetchError && (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white py-16 text-center text-sm text-gray-500">
            No collections found.
          </div>
        )
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: number | string
  highlight?: boolean
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold tabular-nums ${highlight ? 'text-green-600' : 'text-gray-900'}`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
    </div>
  )
}
