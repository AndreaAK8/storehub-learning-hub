'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between" style={{ background: 'linear-gradient(135deg, #ff630f 0%, #ff9419 100%)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="text-xl font-semibold text-white" style={{ fontFamily: 'Barlow, sans-serif' }}>Learning Hub</span>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight" style={{ fontFamily: 'Barlow, sans-serif' }}>
            Your journey to excellence starts here
          </h1>
          <p className="text-lg" style={{ color: 'rgba(255,255,255,0.9)' }}>
            Access training materials, track your progress, and grow with StoreHub.
          </p>
        </div>

        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
          StoreHub Training Platform
        </p>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8" style={{ backgroundColor: '#f9f9f8' }}>
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#ff9419' }}>
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-xl font-semibold" style={{ color: '#2f2922', fontFamily: 'Barlow, sans-serif' }}>Learning Hub</span>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold" style={{ color: '#2f2922', fontFamily: 'Barlow, sans-serif' }}>Welcome back</h2>
            <p className="mt-2" style={{ color: '#7a7672' }}>Sign in with your StoreHub account</p>
          </div>

          <div className="space-y-4">
            {error && (
              <div className="px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: '#ffeef0', border: '1px solid #ffcfd7', color: '#ff546f' }}>
                {error}
              </div>
            )}

            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              style={{ border: '1px solid #eae9e8' }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = '#ff9419'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = '#eae9e8'}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="font-medium" style={{ color: '#2f2922' }}>
                {isLoading ? 'Signing in...' : 'Continue with Google'}
              </span>
            </button>
          </div>

          <p className="text-center text-sm" style={{ color: '#a09d9a' }}>
            By signing in, you agree to access the StoreHub Learning Hub
          </p>
        </div>
      </div>
    </div>
  )
}
