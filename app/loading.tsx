export default function DashboardLoading() {
  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="h-8 w-56 animate-pulse rounded-lg bg-gray-200" />
        <div className="mt-2 h-4 w-80 animate-pulse rounded bg-gray-100" />
      </div>
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-200" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 11 }).map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-xl bg-gray-200" />
        ))}
      </div>
    </div>
  )
}
