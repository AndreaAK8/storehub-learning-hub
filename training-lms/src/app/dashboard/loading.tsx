export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="bg-gradient-to-r from-gray-300 to-gray-200 rounded-lg p-6 h-24" />

      {/* Stats Cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-5">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-20" />
                <div className="h-8 bg-gray-200 rounded w-16" />
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Progress section skeleton */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
        <div className="h-4 bg-gray-200 rounded w-full mb-4" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 rounded-lg p-3 text-center">
              <div className="h-8 bg-gray-200 rounded w-12 mx-auto mb-2" />
              <div className="h-4 bg-gray-200 rounded w-16 mx-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* Timeline skeleton */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="h-6 bg-gray-200 rounded w-40 mb-4" />
        <div className="space-y-6 pl-10">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="w-4 h-4 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32" />
                <div className="h-3 bg-gray-200 rounded w-48" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
