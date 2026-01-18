'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface FeedbackEntry {
  id: string
  trainee_name: string
  trainee_email: string
  feedback_text: string
  sentiment: 'positive' | 'neutral' | 'negative'
  themes: string[]
  submitted_at: string
  ai_summary?: string
}

interface FeedbackAnalysis {
  sentiment_counts: {
    positive: number
    neutral: number
    negative: number
  }
  key_themes: Array<{
    theme: string
    count: number
    sentiment: 'positive' | 'neutral' | 'negative'
  }>
  feedback_entries: FeedbackEntry[]
  ai_insights?: string
  last_updated?: string
  isDemo?: boolean
}

// Demo feedback data
const demoFeedbackAnalysis: FeedbackAnalysis = {
  sentiment_counts: { positive: 12, neutral: 5, negative: 2 },
  key_themes: [
    { theme: 'Product Knowledge', count: 8, sentiment: 'positive' },
    { theme: 'Training Materials', count: 6, sentiment: 'positive' },
    { theme: 'Hands-on Practice', count: 5, sentiment: 'positive' },
    { theme: 'Time Management', count: 3, sentiment: 'neutral' },
    { theme: 'Technical Issues', count: 2, sentiment: 'negative' },
  ],
  feedback_entries: [
    {
      id: '1',
      trainee_name: 'Lisa Wong',
      trainee_email: 'lisa.wong@storehub.com',
      feedback_text: 'The training was comprehensive and well-structured. Really appreciated the hands-on demos with the actual BackOffice system.',
      sentiment: 'positive',
      themes: ['Product Knowledge', 'Hands-on Practice'],
      submitted_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      ai_summary: 'Positive experience with practical demonstrations',
    },
    {
      id: '2',
      trainee_name: 'James Lee',
      trainee_email: 'james.lee@storehub.com',
      feedback_text: 'The Lark docs were helpful but sometimes hard to navigate. Would be great to have a quick reference guide.',
      sentiment: 'neutral',
      themes: ['Training Materials'],
      submitted_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      ai_summary: 'Suggests improvement in documentation organization',
    },
    {
      id: '3',
      trainee_name: 'Sarah Chen',
      trainee_email: 'sarah.chen@storehub.com',
      feedback_text: 'Day 1 was excellent! Andrea explained everything clearly and the pace was perfect for beginners.',
      sentiment: 'positive',
      themes: ['Product Knowledge', 'Training Materials'],
      submitted_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      ai_summary: 'Strong positive feedback on trainer delivery',
    },
    {
      id: '4',
      trainee_name: 'Kevin Lim',
      trainee_email: 'kevin.lim@storehub.com',
      feedback_text: 'Had some trouble accessing the sandbox environment initially. IT support helped but it took time away from learning.',
      sentiment: 'negative',
      themes: ['Technical Issues'],
      submitted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      ai_summary: 'Technical access issues impacted learning time',
    },
  ],
  ai_insights: 'Overall sentiment is highly positive (63%). Trainees appreciate the hands-on approach and comprehensive product coverage. Main improvement areas: 1) Simplify documentation navigation, 2) Ensure sandbox access is pre-configured before training starts. The Day 1 kick-off sessions receive consistently positive feedback.',
  last_updated: new Date().toISOString(),
  isDemo: true,
}

export default function FeedbackPage() {
  const [isTrainer, setIsTrainer] = useState(false)
  const [analysis, setAnalysis] = useState<FeedbackAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        // Check if trainer (same logic as dashboard)
        const trainerCheck = profileData?.role === 'admin' ||
          user?.email?.toLowerCase().includes('andrea') ||
          user?.email?.toLowerCase().includes('trainer') ||
          false

        setIsTrainer(trainerCheck)

        if (trainerCheck) {
          try {
            const response = await fetch('/api/feedback/analysis')
            if (response.ok) {
              const data = await response.json()
              // Use demo data if no real data
              if (!data || !data.feedback_entries || data.feedback_entries.length === 0) {
                setAnalysis(demoFeedbackAnalysis)
              } else {
                setAnalysis(data)
              }
            } else {
              // Use demo data on error
              setAnalysis(demoFeedbackAnalysis)
            }
          } catch (err) {
            console.error('Error fetching feedback:', err)
            // Use demo data on error
            setAnalysis(demoFeedbackAnalysis)
          }
        }
      }
      setLoading(false)
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--sh-black)]">Feedback Analysis</h1>
          <p className="text-[var(--neutral-400)] mt-1">AI-powered feedback insights using Google Gemini</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--sh-orange)]"></div>
          <span className="ml-3 text-[var(--neutral-400)]">Loading AI analysis...</span>
        </div>
      </div>
    )
  }

  // Only trainers/admins can view feedback analysis
  if (!isTrainer) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--sh-black)]">Feedback Analysis</h1>
          <p className="text-[var(--neutral-400)] mt-1">AI-powered feedback insights</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <svg className="w-12 h-12 mx-auto text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 20c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-red-800 font-medium">Access Denied</p>
          <p className="text-red-600 text-sm mt-1">Only administrators can view feedback analysis</p>
        </div>
      </div>
    )
  }

  const sentimentCounts = analysis?.sentiment_counts || { positive: 0, neutral: 0, negative: 0 }
  const totalFeedback = sentimentCounts.positive + sentimentCounts.neutral + sentimentCounts.negative

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800'
      case 'negative': return 'bg-red-100 text-red-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'negative':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      default:
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14s1.5 2 4 2 4-2 4-2m-4-4h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--sh-black)]">Feedback Analysis</h1>
          <p className="text-[var(--neutral-400)] mt-1">AI-powered feedback insights using Google Gemini</p>
        </div>
        {analysis?.last_updated && (
          <p className="text-sm text-[var(--neutral-300)]">
            Last updated: {new Date(analysis.last_updated).toLocaleString()}
          </p>
        )}
      </div>

      {/* Demo Mode Banner */}
      {analysis?.isDemo && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-amber-800 font-medium">Demo Mode</p>
            <p className="text-amber-700 text-sm">Showing sample AI feedback analysis. Real data will appear once trainees submit survey responses.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Sentiment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-green-700">{sentimentCounts.positive}</p>
          <p className="text-sm text-green-600">Positive Feedback</p>
          {totalFeedback > 0 && (
            <p className="text-xs text-green-500 mt-1">
              {Math.round((sentimentCounts.positive / totalFeedback) * 100)}%
            </p>
          )}
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14s1.5 2 4 2 4-2 4-2m-4-4h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-yellow-700">{sentimentCounts.neutral}</p>
          <p className="text-sm text-yellow-600">Neutral Feedback</p>
          {totalFeedback > 0 && (
            <p className="text-xs text-yellow-500 mt-1">
              {Math.round((sentimentCounts.neutral / totalFeedback) * 100)}%
            </p>
          )}
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-red-700">{sentimentCounts.negative}</p>
          <p className="text-sm text-red-600">Negative Feedback</p>
          {totalFeedback > 0 && (
            <p className="text-xs text-red-500 mt-1">
              {Math.round((sentimentCounts.negative / totalFeedback) * 100)}%
            </p>
          )}
        </div>
      </div>

      {/* AI Insights */}
      {analysis?.ai_insights && (
        <div className="stat-card-pink rounded-lg p-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--pink-200)] flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-[var(--pink-600)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <p className="text-[var(--pink-600)] font-medium">AI Insights (Gemini)</p>
              <p className="text-[var(--pink-500)] text-sm mt-1 whitespace-pre-wrap">{analysis.ai_insights}</p>
            </div>
          </div>
        </div>
      )}

      {/* Key Themes */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-[var(--sh-black)] mb-4">Key Themes (AI Analysis)</h2>
        {analysis?.key_themes && analysis.key_themes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {analysis.key_themes.map((theme, index) => (
              <div
                key={index}
                className={`rounded-lg p-4 ${getSentimentColor(theme.sentiment)}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{theme.theme}</span>
                  <span className="text-sm opacity-75">{theme.count} mentions</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <svg className="w-12 h-12 mx-auto text-[var(--neutral-200)] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673m1.664-4l-2.625 2.625a1 1 0 01-.354.245l-3.875 1.453a1 1 0 01-1.268-1.268l1.453-3.875a1 1 0 01.245-.354L12.42 9.4m5.203-2.431a2 2 0 010 2.828l-.707.707-2.828-2.828.707-.707a2 2 0 012.828 0z" />
            </svg>
            <p className="text-[var(--neutral-300)]">No themes identified yet</p>
            <p className="text-sm text-[var(--neutral-200)] mt-1">Themes will appear once feedback is analyzed</p>
          </div>
        )}
      </div>

      {/* Recent Feedback Entries */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-[var(--neutral-100)]">
          <h2 className="text-lg font-semibold text-[var(--sh-black)]">Recent Feedback Entries</h2>
        </div>
        {analysis?.feedback_entries && analysis.feedback_entries.length > 0 ? (
          <div className="divide-y divide-[var(--neutral-100)]">
            {analysis.feedback_entries.map((entry) => (
              <div key={entry.id} className="p-6 hover:bg-[var(--orange-100)]">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-[var(--sh-black)]">{entry.trainee_name}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getSentimentColor(entry.sentiment)}`}>
                        {getSentimentIcon(entry.sentiment)}
                        {entry.sentiment}
                      </span>
                    </div>
                    <p className="text-[var(--neutral-500)]">{entry.feedback_text}</p>
                    {entry.ai_summary && (
                      <p className="text-sm text-[var(--pink-600)] mt-2 italic">
                        AI Summary: {entry.ai_summary}
                      </p>
                    )}
                    {entry.themes && entry.themes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {entry.themes.map((theme, i) => (
                          <span key={i} className="px-2 py-0.5 badge-orange rounded text-xs">
                            {theme}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-[var(--neutral-300)] whitespace-nowrap">
                    {new Date(entry.submitted_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <svg className="w-12 h-12 mx-auto text-[var(--neutral-200)] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-3m0-4h-4a2 2 0 00-2 2v4a2 2 0 002 2h4a2 2 0 002-2V2a2 2 0 00-2-2zm0 12v4m-4-2h8" />
            </svg>
            <p className="text-[var(--neutral-300)]">No feedback data available yet</p>
            <p className="text-sm text-[var(--neutral-200)] mt-1">Feedback will appear once trainees submit survey responses</p>
          </div>
        )}
      </div>
    </div>
  )
}
