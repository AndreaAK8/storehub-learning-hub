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
}

export default function FeedbackPage() {
  const [profile, setProfile] = useState<{ role: string } | null>(null)
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

        setProfile(profileData)

        if (profileData?.role === 'admin') {
          try {
            const response = await fetch('/api/feedback/analysis')
            if (response.ok) {
              const data = await response.json()
              setAnalysis(data)
            } else {
              const errData = await response.json()
              setError(errData.error || 'Failed to load feedback analysis')
            }
          } catch (err) {
            console.error('Error fetching feedback:', err)
            setError('Failed to connect to feedback service')
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
          <h1 className="text-2xl font-bold text-gray-900">Feedback Analysis</h1>
          <p className="text-gray-600 mt-1">AI-powered feedback insights using Google Gemini</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-600">Loading AI analysis...</span>
        </div>
      </div>
    )
  }

  // Only admins can view feedback analysis
  if (profile?.role !== 'admin') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feedback Analysis</h1>
          <p className="text-gray-600 mt-1">AI-powered feedback insights</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Feedback Analysis</h1>
          <p className="text-gray-600 mt-1">AI-powered feedback insights using Google Gemini</p>
        </div>
        {analysis?.last_updated && (
          <p className="text-sm text-gray-500">
            Last updated: {new Date(analysis.last_updated).toLocaleString()}
          </p>
        )}
      </div>

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
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <p className="text-purple-800 font-medium">AI Insights (Gemini)</p>
              <p className="text-purple-700 text-sm mt-1 whitespace-pre-wrap">{analysis.ai_insights}</p>
            </div>
          </div>
        </div>
      )}

      {/* Key Themes */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Themes (AI Analysis)</h2>
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
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673m1.664-4l-2.625 2.625a1 1 0 01-.354.245l-3.875 1.453a1 1 0 01-1.268-1.268l1.453-3.875a1 1 0 01.245-.354L12.42 9.4m5.203-2.431a2 2 0 010 2.828l-.707.707-2.828-2.828.707-.707a2 2 0 012.828 0z" />
            </svg>
            <p className="text-gray-500">No themes identified yet</p>
            <p className="text-sm text-gray-400 mt-1">Themes will appear once feedback is analyzed</p>
          </div>
        )}
      </div>

      {/* Recent Feedback Entries */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Feedback Entries</h2>
        </div>
        {analysis?.feedback_entries && analysis.feedback_entries.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {analysis.feedback_entries.map((entry) => (
              <div key={entry.id} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-gray-900">{entry.trainee_name}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getSentimentColor(entry.sentiment)}`}>
                        {getSentimentIcon(entry.sentiment)}
                        {entry.sentiment}
                      </span>
                    </div>
                    <p className="text-gray-700">{entry.feedback_text}</p>
                    {entry.ai_summary && (
                      <p className="text-sm text-purple-600 mt-2 italic">
                        AI Summary: {entry.ai_summary}
                      </p>
                    )}
                    {entry.themes && entry.themes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {entry.themes.map((theme, i) => (
                          <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                            {theme}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-gray-400 whitespace-nowrap">
                    {new Date(entry.submitted_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-3m0-4h-4a2 2 0 00-2 2v4a2 2 0 002 2h4a2 2 0 002-2V2a2 2 0 00-2-2zm0 12v4m-4-2h8" />
            </svg>
            <p className="text-gray-500">No feedback data available yet</p>
            <p className="text-sm text-gray-400 mt-1">Feedback will appear once trainees submit survey responses</p>
          </div>
        )}
      </div>
    </div>
  )
}
