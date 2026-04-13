import Link from 'next/link'
import type { CollectionMeta } from '@/lib/types'

interface CollectionCardProps {
  collection: CollectionMeta
}

const PALETTE = [
  'bg-blue-500',
  'bg-indigo-500',
  'bg-violet-500',
  'bg-purple-500',
  'bg-cyan-500',
  'bg-teal-500',
  'bg-emerald-500',
  'bg-green-500',
  'bg-amber-500',
  'bg-orange-500',
  'bg-rose-500',
]

function colorFor(alias: string): string {
  let hash = 0
  for (let i = 0; i < alias.length; i++) hash = (hash * 31 + alias.charCodeAt(i)) | 0
  return PALETTE[Math.abs(hash) % PALETTE.length]
}

export default function CollectionCard({ collection }: CollectionCardProps) {
  const color = colorFor(collection.alias)
  const count = collection.count

  return (
    <Link
      href={`/collections/${collection.alias}`}
      className="group flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color} text-white`}>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7M4 7c0-2 1-3 3-3h10c2 0 3 1 3 3M4 7h16M10 11h4" />
          </svg>
        </div>
        <svg
          className="h-4 w-4 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-blue-500"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>

      {/* Title */}
      <div>
        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
          {collection.displayName}
        </h3>
        <p className="mt-0.5 text-xs text-gray-400 font-mono">{collection.mongoCollection}</p>
      </div>

      {/* Count */}
      <div className="mt-auto">
        {count === null ? (
          <div className="h-7 w-20 animate-pulse rounded-md bg-gray-100" />
        ) : (
          <p className="text-2xl font-bold text-gray-900 tabular-nums">
            {count.toLocaleString()}
          </p>
        )}
        <p className="text-xs text-gray-400 mt-0.5">active documents</p>
      </div>
    </Link>
  )
}
