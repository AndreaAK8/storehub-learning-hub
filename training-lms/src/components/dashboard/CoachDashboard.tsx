'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Trainee } from '@/types/trainee'

interface CoachDashboardProps {
  trainees: Trainee[]
  coachEmail: string
  coachName: string
}

interface AssessmentScore {
  traineeEmail: string
  traineeName: string
  assessmentName: string
  score: number
  passed: boolean
  attemptNumber: number
  submittedAt: string
}

interface Alert {
  alertId: string
  traineeEmail: string
  traineeName: string
  alertType: 'RED' | 'ORANGE'
  alertReason: string
  sentAt: string
  assessmentName: string
  failedAttempts: number
  notes: string
}

// Assessment form links by role (from Assessment Schedule Configuration)
const ASSESSMENT_LINKS: Record<string, { name: string; url: string }[]> = {
  'Merchant Care': [
    { name: 'All in One Quiz', url: 'https://forms.gle/dAiBZXvPqpfg5fjK8' },
    { name: 'Advance System Quiz', url: 'https://forms.gle/Jwec7XCXsd9JDc4f7' },
    { name: 'Hardware Assessment', url: 'https://forms.gle/4uqyPthsVweeZPqx6' },
    { name: 'Care Mock Test', url: 'https://forms.gle/FKaQMgkzC6waDdhh8' },
  ],
  'Onboarding Coordinator': [
    { name: 'All in One Quiz', url: 'https://forms.gle/dAiBZXvPqpfg5fjK8' },
    { name: 'Advance System Quiz', url: 'https://forms.gle/Jwec7XCXsd9JDc4f7' },
    { name: 'Hardware Assessment', url: 'https://forms.gle/4uqyPthsVweeZPqx6' },
  ],
  'Merchant Onboarding Manager': [
    { name: 'All in One Quiz', url: 'https://forms.gle/dAiBZXvPqpfg5fjK8' },
    { name: 'Advance System Quiz', url: 'https://forms.gle/Jwec7XCXsd9JDc4f7' },
    { name: 'Hardware Assessment', url: 'https://forms.gle/4uqyPthsVweeZPqx6' },
    { name: 'Training Assessment (F&B)', url: 'https://forms.gle/PoWWciHpStBQyoy2A' },
    { name: 'Training Assessment (Retail)', url: 'https://forms.gle/NLz3fTGEzrtig3qz9' },
    { name: 'Welcome Call Assessment', url: 'https://forms.gle/faZ9tWtdaq34Sb9r7' },
    { name: 'Go Live Call Assessment', url: 'https://forms.gle/8RqXyt7unMg25skK9' },
    { name: 'Training Mock (F&B)', url: 'https://forms.gle/CcfmMcrb48cj6iMx6' },
    { name: 'Training Mock (Retail)', url: 'https://forms.gle/F5SaX7CURqrNoEV66' },
  ],
  'Customer Success Manager': [
    { name: 'All in One Quiz', url: 'https://forms.gle/dAiBZXvPqpfg5fjK8' },
    { name: 'Advance System Quiz', url: 'https://forms.gle/Jwec7XCXsd9JDc4f7' },
    { name: 'Hardware Assessment', url: 'https://forms.gle/4uqyPthsVweeZPqx6' },
    { name: 'CSM Assessment', url: 'https://forms.gle/89McoPTBytfjnh78A' },
    { name: 'Roleplay 1 & 2', url: 'https://forms.gle/SDGiQgRzWkWKAj7f6' },
  ],
  'Onboarding Specialist': [
    { name: 'All in One Quiz', url: 'https://forms.gle/dAiBZXvPqpfg5fjK8' },
    { name: 'Advance System Quiz', url: 'https://forms.gle/Jwec7XCXsd9JDc4f7' },
    { name: 'Hardware Assessment', url: 'https://forms.gle/4uqyPthsVweeZPqx6' },
    { name: 'Training Assessment (F&B)', url: 'https://forms.gle/PoWWciHpStBQyoy2A' },
    { name: 'Training Assessment (Retail)', url: 'https://forms.gle/NLz3fTGEzrtig3qz9' },
    { name: 'Training Mock (F&B)', url: 'https://forms.gle/CcfmMcrb48cj6iMx6' },
    { name: 'Training Mock (Retail)', url: 'https://forms.gle/F5SaX7CURqrNoEV66' },
  ],
  'Business Consultant': [
    { name: 'All in One Quiz', url: 'https://forms.gle/dAiBZXvPqpfg5fjK8' },
    { name: 'Pitching (F&B/Retail)', url: 'https://forms.gle/T8r3RasUErBVoN2K9' },
    { name: 'SPIN Assessment', url: 'https://forms.gle/bRwtLNVJ1iM5iAdS6' },
    { name: 'Closing Skills', url: 'https://forms.gle/HWRkF7SEQhLqdFJ28' },
    { name: 'Full Pitching', url: 'https://forms.gle/SVf58PiWJMC9D3fF7' },
    { name: 'Mock Test', url: 'https://forms.gle/BiZNVduMTUREzCvt5' },
  ],
  'Sales Coordinator': [
    { name: 'All in One Quiz', url: 'https://forms.gle/dAiBZXvPqpfg5fjK8' },
    { name: 'Full Call Assessment', url: 'https://forms.gle/s7LqdJuvj2FgGdJ76' },
    { name: 'Objection Handling', url: 'https://forms.gle/yBY7NnSxnsQtm8dy5' },
    { name: 'SC Mock Test', url: 'https://forms.gle/LtAdSwy6LpmQnBzK7' },
  ],
  'Marketing': [
    { name: 'All in One Quiz', url: 'https://forms.gle/dAiBZXvPqpfg5fjK8' },
  ],
  'Ops': [
    { name: 'All in One Quiz', url: 'https://forms.gle/dAiBZXvPqpfg5fjK8' },
  ],
}

// Calculate progress percentage
function getProgress(trainee: Trainee): number {
  if (!trainee.totalAssessmentsRequired) return 0
  return Math.round((trainee.totalAssessmentsCompleted / trainee.totalAssessmentsRequired) * 100)
}

// Get status color
function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'New': 'bg-gray-100 text-gray-700',
    'Email Sent': 'bg-blue-100 text-blue-700',
    'In Progress': 'bg-yellow-100 text-yellow-700',
    'Training Complete': 'bg-green-100 text-green-700',
    'Report Sent': 'bg-purple-100 text-purple-700',
    'Graduated': 'bg-blue-100 text-blue-700',
  }
  return colors[status] || 'bg-gray-100 text-gray-700'
}

// Score Trajectory Mini Chart
function ScoreTrajectory({ scores }: { scores: AssessmentScore[] }) {
  if (scores.length === 0) {
    return <span className="text-gray-400 text-xs">No scores yet</span>
  }

  const sortedScores = [...scores].sort((a, b) =>
    new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
  )

  const maxScore = 100
  const chartHeight = 32
  const chartWidth = 80

  return (
    <div className="flex items-center gap-2">
      <svg width={chartWidth} height={chartHeight} className="overflow-visible">
        {/* Background line */}
        <line x1="0" y1={chartHeight - 4} x2={chartWidth} y2={chartHeight - 4} stroke="#e5e7eb" strokeWidth="1" />
        {/* Pass line at 80% */}
        <line x1="0" y1={chartHeight - (80 / maxScore) * (chartHeight - 8)} x2={chartWidth} y2={chartHeight - (80 / maxScore) * (chartHeight - 8)} stroke="#10b981" strokeWidth="1" strokeDasharray="2,2" opacity="0.5" />

        {/* Score points */}
        {sortedScores.slice(-6).map((score, i, arr) => {
          const x = arr.length === 1 ? chartWidth / 2 : (i / (arr.length - 1)) * (chartWidth - 8) + 4
          const y = chartHeight - (score.score / maxScore) * (chartHeight - 8)
          const color = score.passed ? '#10b981' : '#ef4444'

          return (
            <g key={i}>
              {i > 0 && (
                <line
                  x1={(i - 1) / (arr.length - 1) * (chartWidth - 8) + 4}
                  y1={chartHeight - (arr[i - 1].score / maxScore) * (chartHeight - 8)}
                  x2={x}
                  y2={y}
                  stroke="#94a3b8"
                  strokeWidth="1"
                />
              )}
              <circle cx={x} cy={y} r="3" fill={color} />
            </g>
          )
        })}
      </svg>
      <span className="text-xs text-gray-500">
        {sortedScores.length} scores
      </span>
    </div>
  )
}

export default function CoachDashboard({ trainees, coachEmail, coachName }: CoachDashboardProps) {
  const [activeTab, setActiveTab] = useState<'active' | 'history' | 'alerts'>('active')
  const [scores, setScores] = useState<Record<string, AssessmentScore[]>>({})
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTrainee, setSelectedTrainee] = useState<string | null>(null)

  // Filter trainees assigned to this coach
  const myTrainees = trainees.filter(t =>
    t.coachEmail?.toLowerCase() === coachEmail.toLowerCase()
  )

  // Active trainees (in training)
  const activeTrainees = myTrainees.filter(t =>
    !['Training Complete', 'Report Sent', 'Graduated'].includes(t.status)
  )

  // Completed trainees (history)
  const completedTrainees = myTrainees.filter(t =>
    ['Training Complete', 'Report Sent', 'Graduated'].includes(t.status)
  )

  // Trainees needing attention
  const needsScoring = myTrainees.filter(t =>
    t.totalAssessmentsRequired > t.totalAssessmentsCompleted &&
    t.daysSinceTrainingStart >= 3
  )

  // Fetch scores and alerts
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch scores for all trainees
        const scorePromises = myTrainees.map(async (trainee) => {
          try {
            const res = await fetch(`/api/scores?traineeEmail=${encodeURIComponent(trainee.email)}`)
            if (res.ok) {
              const data = await res.json()
              return { email: trainee.email, scores: data.scores || [] }
            }
          } catch {
            // Ignore individual errors
          }
          return { email: trainee.email, scores: [] }
        })

        const scoreResults = await Promise.all(scorePromises)
        const scoreMap: Record<string, AssessmentScore[]> = {}
        scoreResults.forEach(result => {
          scoreMap[result.email] = result.scores
        })
        setScores(scoreMap)

        // Fetch alerts for this coach
        try {
          const alertRes = await fetch(`/api/alerts?coachEmail=${encodeURIComponent(coachEmail)}`)
          if (alertRes.ok) {
            const alertData = await alertRes.json()
            setAlerts(alertData.alerts || [])
          }
        } catch {
          // Ignore alert errors
        }
      } finally {
        setLoading(false)
      }
    }

    if (myTrainees.length > 0) {
      fetchData()
    } else {
      setLoading(false)
    }
  }, [myTrainees.length, coachEmail])

  // Stats
  const totalAssigned = myTrainees.length
  const activeCount = activeTrainees.length
  const completedCount = completedTrainees.length
  const redAlerts = alerts.filter(a => a.alertType === 'RED').length
  const orangeAlerts = alerts.filter(a => a.alertType === 'ORANGE').length

  // Get unique roles from trainees
  const roles = [...new Set(myTrainees.map(t => t.department))].filter(Boolean)

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border border-amber-100 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--sh-black)]">Welcome, {coachName}!</h1>
            <p className="text-slate-600 mt-2 leading-relaxed">Manage your trainees and track their progress</p>
          </div>
          <div className="flex gap-6 text-right">
            <div>
              <p className="text-3xl font-bold text-[var(--sh-orange)]">{activeCount}</p>
              <p className="text-slate-500 text-sm">Active</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-600">{completedCount}</p>
              <p className="text-slate-500 text-sm">Completed</p>
            </div>
            {(redAlerts > 0 || orangeAlerts > 0) && (
              <div>
                <p className="text-3xl font-bold">
                  {redAlerts > 0 && <span className="text-red-300">{redAlerts}</span>}
                  {redAlerts > 0 && orangeAlerts > 0 && <span className="text-white/50">/</span>}
                  {orangeAlerts > 0 && <span className="text-orange-300">{orangeAlerts}</span>}
                </p>
                <p className="text-orange-200 text-sm">Alerts</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alerts Banner */}
      {alerts.length > 0 && (
        <div className={`rounded-lg p-4 ${redAlerts > 0 ? 'bg-red-50 border border-red-200' : 'bg-orange-50 border border-orange-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${redAlerts > 0 ? 'bg-red-100' : 'bg-orange-100'}`}>
                <span className="text-xl">{redAlerts > 0 ? '🔴' : '🟠'}</span>
              </div>
              <div>
                <h3 className={`font-semibold ${redAlerts > 0 ? 'text-red-800' : 'text-orange-800'}`}>
                  {alerts.length} Trainee{alerts.length > 1 ? 's' : ''} Need{alerts.length === 1 ? 's' : ''} Attention
                </h3>
                <p className={`text-sm ${redAlerts > 0 ? 'text-red-600' : 'text-orange-600'}`}>
                  {redAlerts > 0 ? `${redAlerts} critical` : ''}{redAlerts > 0 && orangeAlerts > 0 ? ', ' : ''}{orangeAlerts > 0 ? `${orangeAlerts} warning` : ''}
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${redAlerts > 0 ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'}`}
            >
              View Alerts
            </button>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalAssigned}</p>
              <p className="text-sm text-gray-500">Total Assigned</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
              <p className="text-sm text-gray-500">In Training</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{needsScoring.length}</p>
              <p className="text-sm text-gray-500">Need Scoring</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
              <p className="text-sm text-gray-500">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'active'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Active Trainees ({activeCount})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'history'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              History ({completedCount})
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`px-6 py-4 text-sm font-medium border-b-2 flex items-center gap-2 ${
                activeTab === 'alerts'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Alerts
              {alerts.length > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${redAlerts > 0 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                  {alerts.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-4">
          {/* Active Trainees Tab */}
          {activeTab === 'active' && (
            <div>
              {activeTrainees.length > 0 ? (
                <div className="space-y-3">
                  {activeTrainees.map(trainee => (
                    <div
                      key={trainee.email}
                      className={`p-4 rounded-lg border transition-all cursor-pointer ${
                        selectedTrainee === trainee.email
                          ? 'border-orange-300 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedTrainee(selectedTrainee === trainee.email ? null : trainee.email)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-400 rounded-full flex items-center justify-center text-white font-medium">
                            {trainee.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{trainee.fullName}</p>
                            <p className="text-sm text-gray-500">
                              {trainee.department} • Day {trainee.daysSinceTrainingStart} • {trainee.country}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          {/* Score Trajectory */}
                          <div className="hidden md:block">
                            {loading ? (
                              <div className="w-20 h-8 bg-gray-100 animate-pulse rounded" />
                            ) : (
                              <ScoreTrajectory scores={scores[trainee.email] || []} />
                            )}
                          </div>

                          {/* Progress */}
                          <div className="w-32">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Progress</span>
                              <span>{trainee.totalAssessmentsCompleted}/{trainee.totalAssessmentsRequired}</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  getProgress(trainee) >= 100 ? 'bg-green-500' :
                                  getProgress(trainee) >= 50 ? 'bg-orange-500' : 'bg-yellow-500'
                                }`}
                                style={{ width: `${Math.min(getProgress(trainee), 100)}%` }}
                              />
                            </div>
                          </div>

                          {/* Status */}
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(trainee.status)}`}>
                            {trainee.status}
                          </span>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/dashboard/trainees/${encodeURIComponent(trainee.email)}`}
                              className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                              title="View Details"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </Link>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {selectedTrainee === trainee.email && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="grid grid-cols-2 gap-6">
                            {/* Recent Scores */}
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Scores</h4>
                              {loading ? (
                                <div className="space-y-2">
                                  {[1, 2, 3].map(i => (
                                    <div key={i} className="h-8 bg-gray-100 animate-pulse rounded" />
                                  ))}
                                </div>
                              ) : (scores[trainee.email] || []).length > 0 ? (
                                <div className="space-y-2">
                                  {(scores[trainee.email] || []).slice(-5).reverse().map((score, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm">
                                      <span className="text-gray-600 truncate max-w-[200px]">{score.assessmentName}</span>
                                      <span className={`font-medium ${score.passed ? 'text-green-600' : 'text-red-600'}`}>
                                        {score.score}% {score.passed ? '✓' : '✗'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-400">No scores yet</p>
                              )}
                            </div>

                            {/* Quick Actions */}
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-3">Submit Score</h4>
                              <div className="flex flex-wrap gap-2">
                                {(ASSESSMENT_LINKS[trainee.department] || []).map((link, i) => (
                                  <a
                                    key={i}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1.5 bg-gray-100 hover:bg-teal-100 text-gray-700 hover:text-teal-700 rounded-lg text-xs font-medium transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {link.name}
                                  </a>
                                ))}
                                <Link
                                  href={`/dashboard/trainees/${encodeURIComponent(trainee.email)}#scores`}
                                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  + Manual Score
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="font-medium">No active trainees</p>
                  <p className="text-sm mt-1">New trainees will appear here when assigned</p>
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div>
              {completedTrainees.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                        <th className="pb-3 font-medium">Trainee</th>
                        <th className="pb-3 font-medium">Role</th>
                        <th className="pb-3 font-medium">Training Period</th>
                        <th className="pb-3 font-medium">Final Score</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {completedTrainees.map(trainee => {
                        const traineeScores = scores[trainee.email] || []
                        const avgScore = traineeScores.length > 0
                          ? Math.round(traineeScores.reduce((sum, s) => sum + s.score, 0) / traineeScores.length)
                          : null

                        return (
                          <tr key={trainee.email} className="hover:bg-gray-50">
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                                  {trainee.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{trainee.fullName}</p>
                                  <p className="text-xs text-gray-500">{trainee.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 text-sm text-gray-600">{trainee.department}</td>
                            <td className="py-4 text-sm text-gray-600">
                              {trainee.trainingStartDate} - {trainee.daysSinceTrainingStart} days
                            </td>
                            <td className="py-4">
                              {avgScore !== null ? (
                                <span className={`text-sm font-medium ${avgScore >= 80 ? 'text-green-600' : 'text-red-600'}`}>
                                  {avgScore}%
                                </span>
                              ) : (
                                <span className="text-sm text-gray-400">-</span>
                              )}
                            </td>
                            <td className="py-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(trainee.status)}`}>
                                {trainee.status}
                              </span>
                            </td>
                            <td className="py-4">
                              <Link
                                href={`/dashboard/trainees/${encodeURIComponent(trainee.email)}`}
                                className="text-orange-600 hover:text-teal-800 text-sm font-medium"
                              >
                                View Report
                              </Link>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="font-medium">No completed trainees yet</p>
                  <p className="text-sm mt-1">Completed trainee records will appear here</p>
                </div>
              )}
            </div>
          )}

          {/* Alerts Tab */}
          {activeTab === 'alerts' && (
            <div>
              {alerts.length > 0 ? (
                <div className="space-y-3">
                  {alerts.map((alert, i) => (
                    <div
                      key={alert.alertId || i}
                      className={`p-4 rounded-lg border ${
                        alert.alertType === 'RED'
                          ? 'border-red-200 bg-red-50'
                          : 'border-orange-200 bg-orange-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{alert.alertType === 'RED' ? '🔴' : '🟠'}</span>
                          <div>
                            <h4 className={`font-medium ${alert.alertType === 'RED' ? 'text-red-800' : 'text-orange-800'}`}>
                              {alert.traineeName}
                            </h4>
                            <p className={`text-sm mt-1 ${alert.alertType === 'RED' ? 'text-red-600' : 'text-orange-600'}`}>
                              {alert.alertReason}
                            </p>
                            {alert.assessmentName && (
                              <p className="text-xs text-gray-500 mt-2">
                                Assessment: {alert.assessmentName} • {alert.failedAttempts} failed attempts
                              </p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(alert.sentAt).toLocaleDateString()} at {new Date(alert.sentAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <Link
                          href={`/dashboard/trainees/${encodeURIComponent(alert.traineeEmail)}`}
                          className={`px-4 py-2 rounded-lg text-sm font-medium ${
                            alert.alertType === 'RED'
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                          }`}
                        >
                          View Trainee
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <span className="text-4xl mb-4 block">✅</span>
                  <p className="font-medium">No alerts</p>
                  <p className="text-sm mt-1">All your trainees are on track!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Assessment Links by Role */}
      {roles.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Assessment Links</h2>
          <div className="space-y-4">
            {roles.map(role => (
              <div key={role}>
                <h3 className="text-sm font-medium text-gray-700 mb-2">{role}</h3>
                <div className="flex flex-wrap gap-2">
                  {(ASSESSMENT_LINKS[role] || []).map((link, i) => (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-orange-50 text-gray-700 hover:text-teal-700 rounded-lg text-sm font-medium transition-colors border border-gray-200 hover:border-teal-200"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      {link.name}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
