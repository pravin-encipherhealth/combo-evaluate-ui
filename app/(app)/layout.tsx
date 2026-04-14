import { fetchCollections, fetchAllCounts } from '@/lib/api'
import { formatAlias } from '@/lib/utils'
import Sidebar from '@/components/Sidebar'
import type { CollectionMeta } from '@/lib/types'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  let collections: CollectionMeta[] = []
  try {
    const infos = await fetchCollections()
    const counts = await fetchAllCounts(infos.map((c) => c.alias), true)
    collections = infos.map((c) => ({
      ...c,
      displayName: formatAlias(c.alias),
      count: counts[c.alias] ?? null,
    }))
  } catch {
    // sidebar degrades gracefully
  }

  return (
    <>
      <Sidebar collections={collections} />
      <main className="lg:pl-64">
        <div className="pt-14 lg:pt-0">{children}</div>
      </main>
    </>
  )
}
