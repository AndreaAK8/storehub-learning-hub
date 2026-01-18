import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If logged in, redirect to dashboard
  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-lg font-semibold text-slate-900">Learning Hub</span>
          </div>
          <Link
            href="/login"
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 border border-orange-100 rounded-full text-orange-700 text-sm font-medium">
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
            Now live for StoreHub teams
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
            Your path to
            <span className="text-orange-600"> excellence</span>
            <br />starts here
          </h1>

          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            A modern learning platform for StoreHub teams. Track progress, access materials, and grow your skills.
          </p>

          <div className="flex items-center justify-center gap-4 pt-4">
            <Link
              href="/login"
              className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all font-medium shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30"
            >
              Get Started
            </Link>
            <Link
              href="#features"
              className="px-6 py-3 text-slate-600 hover:text-slate-900 transition-colors font-medium"
            >
              Learn more
            </Link>
          </div>
        </div>

        {/* Features */}
        <div id="features" className="mt-20 md:mt-32 grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<CalendarIcon />}
            title="Structured Learning"
            description="Follow a clear day-by-day training roadmap tailored to your role."
          />
          <FeatureCard
            icon={<ChartIcon />}
            title="Track Progress"
            description="See your completion status, performance metrics, and achievements."
          />
          <FeatureCard
            icon={<BookIcon />}
            title="All Resources"
            description="Access training materials, guides, and assessments in one place."
          />
        </div>

        {/* Stats */}
        <div className="mt-20 md:mt-32 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-white rounded-2xl border border-slate-100">
            <p className="text-3xl font-bold text-orange-600">7+</p>
            <p className="text-sm text-slate-600 mt-1">Training Roles</p>
          </div>
          <div className="text-center p-6 bg-white rounded-2xl border border-slate-100">
            <p className="text-3xl font-bold text-orange-600">4-5</p>
            <p className="text-sm text-slate-600 mt-1">Days per Program</p>
          </div>
          <div className="text-center p-6 bg-white rounded-2xl border border-slate-100">
            <p className="text-3xl font-bold text-orange-600">100%</p>
            <p className="text-sm text-slate-600 mt-1">Self-Paced</p>
          </div>
          <div className="text-center p-6 bg-white rounded-2xl border border-slate-100">
            <p className="text-3xl font-bold text-orange-600">24/7</p>
            <p className="text-sm text-slate-600 mt-1">Access</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-20 md:mt-32 text-center pb-8">
          <p className="text-sm text-slate-400">
            Built with care for StoreHub teams
          </p>
        </div>
      </main>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 hover:border-orange-200 hover:shadow-lg hover:shadow-orange-500/5 transition-all">
      <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
    </div>
  )
}

function CalendarIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )
}

function BookIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  )
}
