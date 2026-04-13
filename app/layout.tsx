import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import { fetchCollections, fetchAllCounts } from '@/lib/api'
import { formatAlias } from '@/lib/utils'
import type { CollectionMeta } from '@/lib/types'

export const metadata: Metadata = {
  title: {
    default: 'Combo Evaluate — Data Explorer',
    template: '%s | Combo Evaluate',
  },
  description: 'Browse and inspect medical coding reference data collections.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Fetch collections for the sidebar; gracefully degrade on error.
  let collections: CollectionMeta[] = []
  try {
    const infos = await fetchCollections()
    const counts = await fetchAllCounts(
      infos.map((c) => c.alias),
      true,
    )
    collections = infos.map((c) => ({
      ...c,
      displayName: formatAlias(c.alias),
      count: counts[c.alias] ?? null,
    }))
  } catch {
    // Sidebar will render with empty list; individual pages handle their own errors.
  }

  return (
    <html lang="en">
      <body>
        <Sidebar collections={collections} />

        {/* Main content — offset by sidebar width on desktop, top bar on mobile */}
        <main className="lg:pl-64">
          <div className="pt-14 lg:pt-0">
            {children}
          </div>
        </main>
      </body>
    </html>
  )
}
