import Link from 'next/link'

export default function TraineeNotFound() {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Trainee not found</h2>
        <p className="text-gray-600 mb-6">
          We couldn&apos;t find a trainee with that email address. They may have been removed or the email might be incorrect.
        </p>
        <Link
          href="/dashboard/trainees"
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          View all trainees
        </Link>
      </div>
    </div>
  )
}
