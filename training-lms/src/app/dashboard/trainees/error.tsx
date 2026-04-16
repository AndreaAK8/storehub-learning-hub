'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function TraineesError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Trainees error:', error)
  }, [error])

  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="w-16 h-16 bg-[#fff4e8] rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-[#ff9419]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-[#2f2922] mb-2">Unable to load trainees</h2>
        <p className="text-[#55504a] mb-6">
          We couldn&apos;t connect to the training data. This might be due to a network issue or the n8n webhook being unavailable.
        </p>
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full px-4 py-2 bg-[#2a6ee8] text-white rounded-lg hover:bg-[#2a6ee8] transition-colors"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="block w-full px-4 py-2 border border-[#c5c3c1] text-[#55504a] rounded-lg hover:bg-[#f5f5f4] transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
