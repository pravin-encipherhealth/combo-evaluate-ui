export default function CollectionLoading() {
  return (
    <div className="px-6 py-8 max-w-full">
      {/* Breadcrumb skeleton */}
      <div className="mb-5 flex items-center gap-2">
        <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
        <span className="text-gray-300">/</span>
        <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
      </div>

      {/* Heading skeleton */}
      <div className="mb-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-200" />
        <div className="mt-1 h-3 w-24 animate-pulse rounded bg-gray-100" />
      </div>

      {/* Card skeleton */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {/* Filter bar */}
        <div className="border-b border-gray-100 px-5 py-3 flex justify-between">
          <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
          <div className="flex gap-3">
            <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
            <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
          </div>
        </div>

        {/* Table header skeleton */}
        <div className="bg-gray-50 px-4 py-3 flex gap-4">
          {[100, 140, 120, 160, 90, 110, 130].map((w, i) => (
            <div key={i} style={{ width: w }} className="h-3 animate-pulse rounded bg-gray-200" />
          ))}
        </div>

        {/* Row skeletons */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="px-4 py-3 border-t border-gray-100 flex gap-4">
            {[100, 140, 120, 160, 90, 110, 130].map((w, j) => (
              <div
                key={j}
                style={{ width: w }}
                className="h-4 animate-pulse rounded bg-gray-100"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
