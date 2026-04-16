'use client'

import { useEffect } from 'react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="w-16 h-16 bg-[#ffeef0] rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-[#ff546f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-[#2f2922] mb-2">Something went wrong</h2>
        <p className="text-[#55504a] mb-6">
          We encountered an error loading your dashboard. This might be a temporary issue with our data connection.
        </p>
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full px-4 py-2 bg-[#2a6ee8] text-white rounded-lg hover:bg-[#2a6ee8] transition-colors"
          >
            Try again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 border border-[#c5c3c1] text-[#55504a] rounded-lg hover:bg-[#f5f5f4] transition-colors"
          >
            Refresh page
          </button>
        </div>
        {error.digest && (
          <p className="text-xs text-[#a09d9a] mt-4">Error ID: {error.digest}</p>
        )}
      </div>
    </div>
  )
}
