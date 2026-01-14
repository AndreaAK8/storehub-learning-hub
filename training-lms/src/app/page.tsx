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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900">Training LMS</span>
          <Link
            href="/login"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center space-y-8">
          <h1 className="text-5xl font-bold text-gray-900">
            StoreHub Training
            <span className="text-blue-600"> Management System</span>
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Streamline employee onboarding with automated workflows,
            assessment tracking, and AI-powered feedback analysis.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link
              href="/login"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon="📧"
            title="Automated Onboarding"
            description="Welcome emails, calendar scheduling, and resource packs sent automatically when new hires join."
          />
          <FeatureCard
            icon="📊"
            title="Assessment Tracking"
            description="Schedule assessments, track scores, send reminders, and generate comprehensive reports."
          />
          <FeatureCard
            icon="🤖"
            title="AI Feedback Analysis"
            description="Gemini-powered sentiment analysis extracts insights from training feedback surveys."
          />
        </div>

        {/* Tech Stack */}
        <div className="mt-24 text-center">
          <p className="text-sm text-gray-500 mb-4">Powered by</p>
          <div className="flex items-center justify-center gap-8 text-gray-400">
            <span className="font-medium">Next.js</span>
            <span>•</span>
            <span className="font-medium">Supabase</span>
            <span>•</span>
            <span className="font-medium">n8n</span>
            <span>•</span>
            <span className="font-medium">Vercel</span>
          </div>
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
  icon: string
  title: string
  description: string
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
