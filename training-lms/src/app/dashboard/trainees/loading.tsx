export default function TraineesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div>
        <div className="h-8 bg-gray-200 rounded w-32 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-64" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-200">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
            <div className="h-8 bg-gray-200 rounded w-12" />
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow">
        {/* Filters */}
        <div className="p-4 border-b border-gray-200 flex gap-4">
          <div className="flex-1 h-10 bg-gray-200 rounded" />
          <div className="w-40 h-10 bg-gray-200 rounded" />
          <div className="w-40 h-10 bg-gray-200 rounded" />
        </div>

        {/* Table header */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex gap-6">
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-4 bg-gray-200 rounded w-20" />
            <div className="h-4 bg-gray-200 rounded w-16" />
            <div className="h-4 bg-gray-200 rounded w-20" />
            <div className="h-4 bg-gray-200 rounded w-24" />
          </div>
        </div>

        {/* Table rows */}
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32" />
                  <div className="h-3 bg-gray-200 rounded w-48" />
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-20" />
              <div className="h-6 bg-gray-200 rounded-full w-24" />
              <div className="h-4 bg-gray-200 rounded w-16" />
              <div className="h-4 bg-gray-200 rounded w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
