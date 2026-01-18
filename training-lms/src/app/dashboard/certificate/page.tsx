'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CertificatePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to my-training page where the certificate is now integrated
    router.replace('/dashboard/my-training')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[var(--sh-orange)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500">Redirecting to your training...</p>
      </div>
    </div>
  )
}
