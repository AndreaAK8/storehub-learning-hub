'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Trainee } from '@/types/trainee'
import { VideoPlayer } from '@/components/training/VideoPlayer'
import RiskBadge, { calculateRiskLevel } from './RiskBadge'

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

interface CoachingNote {
  id: string
  coach_email: string
  trainee_email: string
  note: string
  visibility: 'private' | 'trainer' | 'trainee' | 'all'
  category: 'general' | 'performance' | 'feedback' | 'action_item' | 'concern'
  created_at: string
  updated_at: string
}

interface TraineeReflection {
  id: string
  trainee_email: string
  trainee_name: string
  role_code: string
  day_number: number
  confusing_topic: string
  improvement_notes: string
  confidence_level: number
  created_at: string
}

interface TraineeScoreSummary {
  assessmentScores: {
    name: string
    score: number
    maxScore: number
    weightage: number
    passed: boolean
    date?: string
  }[]
  expectedAssessments: {
    name: string
    weightage: number
    completed: boolean
  }[]
  learningScore: number
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

// Assessment Form Modal
interface FormModalProps {
  isOpen: boolean
  onClose: () => void
  formUrl: string
  formName: string
  traineeName?: string
  onScoreSubmitted?: () => void
}

function AssessmentFormModal({ isOpen, onClose, formUrl, formName, traineeName, onScoreSubmitted }: FormModalProps) {
  const [showConfirmation, setShowConfirmation] = useState(false)

  if (!isOpen) return null

  const handleClose = () => {
    if (showConfirmation && onScoreSubmitted) {
      onScoreSubmitted()
    }
    setShowConfirmation(false)
    onClose()
  }

  const handleMarkSubmitted = () => {
    setShowConfirmation(true)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{formName}</h2>
              {traineeName && (
                <p className="text-sm text-gray-600">Scoring: {traineeName}</p>
              )}
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-auto p-4">
            {showConfirmation ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Score Submitted!</h3>
                <p className="text-gray-600 mb-6">
                  The score will be reflected in the trainee's profile shortly.
                </p>
                <button
                  onClick={handleClose}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Close & Refresh Scores
                </button>
              </div>
            ) : (
              <VideoPlayer url={formUrl} title={formName} />
            )}
          </div>

          {/* Footer - only show when form is visible */}
          {!showConfirmation && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
              <p className="text-sm text-gray-500">
                Fill out the form above, then click "I've Submitted"
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMarkSubmitted}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  I've Submitted the Score
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CoachDashboard({ trainees, coachEmail, coachName }: CoachDashboardProps) {
  // Simplified tabs: My Trainees, Score Now
  const [activeTab, setActiveTab] = useState<'trainees' | 'scoring'>('trainees')
  const [scores, setScores] = useState<Record<string, AssessmentScore[]>>({})
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Form modal state
  const [formModal, setFormModal] = useState<{
    isOpen: boolean
    formUrl: string
    formName: string
    traineeName?: string
    traineeEmail?: string
  }>({ isOpen: false, formUrl: '', formName: '' })

  // Quick note state (for Score Now tab)
  const [newNote, setNewNote] = useState<string>('')
  const [savingNote, setSavingNote] = useState<boolean>(false)
  const [noteTrainee, setNoteTrainee] = useState<string>('')

  // Reflections state (for Score Now tab)
  const [reflections, setReflections] = useState<Record<string, TraineeReflection[]>>({})
  const [loadingReflections, setLoadingReflections] = useState<boolean>(false)

  // Score summaries state (for Score Now tab)
  const [scoreSummaries, setScoreSummaries] = useState<Record<string, TraineeScoreSummary>>({})
  const [loadingScoreSummary, setLoadingScoreSummary] = useState<Record<string, boolean>>({})

  // Score dropdown state (for inline scoring)
  const [scoreDropdown, setScoreDropdown] = useState<string | null>(null)

  // Stat card popup state
  const [statPopup, setStatPopup] = useState<'attention' | 'pending' | null>(null)

  // Filter trainees assigned to this coach
  const myTrainees = trainees.filter(t =>
    t.coachEmail?.toLowerCase() === coachEmail.toLowerCase()
  )

  // Get unique roles from coach's trainees
  const uniqueRoles = [...new Set(myTrainees.map(t => t.department).filter(Boolean))].sort()

  // Filter by selected role and search query
  const filteredTrainees = myTrainees.filter(t => {
    const matchesRole = selectedRole === 'all' || t.department === selectedRole
    const matchesSearch = !searchQuery ||
      t.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesRole && matchesSearch
  })

  // Active trainees (in training) - exclude completed
  const activeTrainees = filteredTrainees.filter(t =>
    !['Training Complete', 'Report Sent', 'Graduated'].includes(t.status)
  )

  // Calculate new stat card values
  // 1. Needs Attention = Critical + At Risk + Alerts
  const needsAttention = activeTrainees.filter(t => {
    const risk = calculateRiskLevel(t)
    return risk === 'critical' || risk === 'at-risk'
  })
  const needsAttentionCount = needsAttention.length + alerts.length

  // 2. Pending Scores = Trainees with assessments to grade (Day 1+)
  const needsScoring = activeTrainees.filter(t =>
    t.totalAssessmentsRequired > t.totalAssessmentsCompleted &&
    t.daysSinceTrainingStart >= 1
  )

  // 3. On Track = Active trainees that are healthy
  const onTrack = activeTrainees.filter(t => {
    const risk = calculateRiskLevel(t)
    return risk === 'on-track'
  })

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

  // Simplified stats for new design
  const redAlerts = alerts.filter(a => a.alertType === 'RED').length
  const orangeAlerts = alerts.filter(a => a.alertType === 'ORANGE').length

  // Open form modal
  const openFormModal = (formUrl: string, formName: string, traineeName?: string, traineeEmail?: string) => {
    setFormModal({ isOpen: true, formUrl, formName, traineeName, traineeEmail })
  }

  // Refresh scores for a specific trainee
  const refreshTraineeScores = async (traineeEmail: string) => {
    try {
      const res = await fetch(`/api/scores?traineeEmail=${encodeURIComponent(traineeEmail)}`)
      if (res.ok) {
        const data = await res.json()
        setScores(prev => ({ ...prev, [traineeEmail]: data.scores || [] }))
      }
    } catch {
      // Ignore errors
    }
  }

  // Handle score submitted - refresh that trainee's scores
  const handleScoreSubmitted = () => {
    if (formModal.traineeEmail) {
      // Wait a bit for n8n to process the form submission
      setTimeout(() => {
        refreshTraineeScores(formModal.traineeEmail!)
      }, 2000)
    }
  }

  // Save a quick note
  const saveNote = async (traineeEmail: string) => {
    if (!newNote.trim()) return

    setSavingNote(true)
    try {
      const res = await fetch('/api/coaching-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          traineeEmail,
          note: newNote.trim(),
          visibility: 'private',
          category: 'general'
        })
      })
      if (res.ok) {
        setNewNote('')
        setNoteTrainee('')
        alert('Note saved!')
      }
    } catch {
      // Ignore errors
    } finally {
      setSavingNote(false)
    }
  }

  // Fetch reflections for a trainee
  const fetchReflections = async (traineeEmail: string) => {
    if (reflections[traineeEmail]) return // Already loaded
    setLoadingReflections(true)
    try {
      const res = await fetch(`/api/training/reflections?traineeEmail=${encodeURIComponent(traineeEmail)}`)
      if (res.ok) {
        const data = await res.json()
        setReflections(prev => ({ ...prev, [traineeEmail]: data.reflections || [] }))
      }
    } catch {
      // Ignore errors
    } finally {
      setLoadingReflections(false)
    }
  }

  // Fetch score summary for a trainee
  const fetchScoreSummary = async (traineeEmail: string, traineeRole: string) => {
    if (scoreSummaries[traineeEmail] || loadingScoreSummary[traineeEmail]) return // Already loaded or loading
    setLoadingScoreSummary(prev => ({ ...prev, [traineeEmail]: true }))
    try {
      const res = await fetch(
        `/api/training/assessment-scores?email=${encodeURIComponent(traineeEmail)}&role=${encodeURIComponent(traineeRole)}`
      )
      if (res.ok) {
        const data = await res.json()
        // Calculate learning score
        const learningScore = (data.assessmentScores || []).reduce((acc: number, score: { score: number; maxScore: number; weightage: number }) => {
          const percentage = score.maxScore > 0 ? (score.score / score.maxScore) * 100 : score.score
          return acc + (percentage * (score.weightage / 100))
        }, 0)
        setScoreSummaries(prev => ({
          ...prev,
          [traineeEmail]: {
            assessmentScores: data.assessmentScores || [],
            expectedAssessments: data.expectedAssessments || [],
            learningScore: Math.round(learningScore)
          }
        }))
      }
    } catch {
      // Ignore errors
    } finally {
      setLoadingScoreSummary(prev => ({ ...prev, [traineeEmail]: false }))
    }
  }


  return (
    <div className="space-y-6">
      {/* Simplified Welcome Header */}
      <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border border-amber-100 rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-[var(--sh-black)]">Welcome, {coachName}!</h1>
        <p className="text-slate-600 mt-1">
          {selectedRole === 'all'
            ? 'Manage your trainees and track their progress'
            : <>Viewing <span className="font-semibold text-orange-600">{selectedRole}</span> trainees</>
          }
        </p>
      </div>

      {/* 3 Actionable Stat Cards */}
      <div className="grid grid-cols-3 gap-4">
        {/* Needs Attention (Critical + At Risk + Alerts) */}
        <button
          onClick={() => needsAttentionCount > 0 && setStatPopup('attention')}
          className={`bg-gradient-to-br from-red-50 to-pink-100 border-2 rounded-xl p-5 text-left transition-all hover:shadow-md ${
            needsAttentionCount > 0 ? 'border-red-300 cursor-pointer' : 'border-pink-200 cursor-default'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="text-3xl font-bold text-red-700">{needsAttentionCount}</p>
              <p className="text-sm font-medium text-red-600">Needs Attention</p>
            </div>
          </div>
          {needsAttentionCount > 0 && (
            <p className="text-xs text-red-500 mt-2">Click to see who</p>
          )}
        </button>

        {/* Pending Scores */}
        <button
          onClick={() => needsScoring.length > 0 && setStatPopup('pending')}
          className={`bg-gradient-to-br from-amber-50 to-orange-100 border-2 rounded-xl p-5 text-left transition-all hover:shadow-md ${
            needsScoring.length > 0 ? 'border-amber-300 cursor-pointer' : 'border-orange-200 cursor-default'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">📝</span>
            <div>
              <p className="text-3xl font-bold text-amber-700">{needsScoring.length}</p>
              <p className="text-sm font-medium text-amber-600">Pending Scores</p>
            </div>
          </div>
          {needsScoring.length > 0 && (
            <p className="text-xs text-amber-500 mt-2">Click to score now</p>
          )}
        </button>

        {/* On Track */}
        <div className="bg-gradient-to-br from-emerald-50 to-green-100 border-2 border-green-200 rounded-xl p-5 text-left">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="text-3xl font-bold text-green-700">{onTrack.length}</p>
              <p className="text-sm font-medium text-green-600">On Track</p>
            </div>
          </div>
          {onTrack.length > 0 && (
            <p className="text-xs text-green-500 mt-2">Healthy progress</p>
          )}
        </div>
      </div>

      {/* Stat Card Popup - Needs Attention */}
      {statPopup === 'attention' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setStatPopup(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-red-50 to-pink-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔥</span>
                <h3 className="font-semibold text-gray-900">Needs Attention ({needsAttentionCount})</h3>
              </div>
              <button onClick={() => setStatPopup(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto space-y-2">
              {needsAttention.map(trainee => (
                <Link
                  key={trainee.email}
                  href={`/dashboard/trainees/${encodeURIComponent(trainee.email)}`}
                  onClick={() => setStatPopup(null)}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                      {trainee.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{trainee.fullName}</p>
                      <p className="text-xs text-gray-500">{trainee.department} • Day {trainee.daysSinceTrainingStart}</p>
                    </div>
                  </div>
                  <RiskBadge trainee={trainee} size="sm" />
                </Link>
              ))}
              {alerts.length > 0 && (
                <>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide pt-2">Alerts</p>
                  {alerts.map((alert, i) => (
                    <Link
                      key={alert.alertId || i}
                      href={`/dashboard/trainees/${encodeURIComponent(alert.traineeEmail)}`}
                      onClick={() => setStatPopup(null)}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                        alert.alertType === 'RED'
                          ? 'border-red-200 hover:bg-red-50'
                          : 'border-orange-200 hover:bg-orange-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{alert.alertType === 'RED' ? '🔴' : '🟠'}</span>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{alert.traineeName}</p>
                          <p className="text-xs text-gray-500">{alert.alertReason}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stat Card Popup - Pending Scores */}
      {statPopup === 'pending' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setStatPopup(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-orange-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">📝</span>
                <h3 className="font-semibold text-gray-900">Pending Scores ({needsScoring.length})</h3>
              </div>
              <button onClick={() => setStatPopup(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto space-y-2">
              {needsScoring.map(trainee => {
                const assessments = ASSESSMENT_LINKS[trainee.department] || []
                const traineeScores = scores[trainee.email] || []

                // Filter out assessments that have already been scored
                const pendingAssessments = assessments.filter(link => {
                  const isScored = traineeScores.some(s =>
                    s.assessmentName.toLowerCase().includes(link.name.toLowerCase()) ||
                    link.name.toLowerCase().includes(s.assessmentName.toLowerCase())
                  )
                  return !isScored
                })

                if (pendingAssessments.length === 0) return null // Hide if all scored

                return (
                  <div
                    key={trainee.email}
                    className="p-3 rounded-lg border border-gray-200 hover:border-amber-300 hover:bg-amber-50 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          {trainee.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{trainee.fullName}</p>
                          <p className="text-xs text-gray-500">{trainee.department} • Day {trainee.daysSinceTrainingStart}</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                        {pendingAssessments.length} pending
                      </span>
                    </div>
                    {/* Assessment buttons - only show pending ones */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {pendingAssessments.slice(0, 4).map((link, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            openFormModal(link.url, link.name, trainee.fullName, trainee.email)
                            setStatPopup(null)
                          }}
                          className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-xs font-medium transition-colors"
                        >
                          {link.name.length > 20 ? link.name.substring(0, 18) + '...' : link.name}
                        </button>
                      ))}
                      {pendingAssessments.length > 4 && (
                        <button
                          onClick={() => {
                            setActiveTab('scoring')
                            setStatPopup(null)
                          }}
                          className="px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-xs font-medium transition-colors"
                        >
                          +{pendingAssessments.length - 4} more
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Simple Role Filter + Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search trainees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm"
            />
          </div>
          {/* Role Filter Pills */}
          {uniqueRoles.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedRole('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  selectedRole === 'all'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({activeTrainees.length})
              </button>
              {uniqueRoles.map(role => {
                const count = activeTrainees.filter(t => t.department === role).length
                return (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      selectedRole === role
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {role} ({count})
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* 3 Focused Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('trainees')}
              className={`px-6 py-4 text-sm font-medium border-b-2 flex items-center gap-2 ${
                activeTab === 'trainees'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📋 My Trainees
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'trainees' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {activeTrainees.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('scoring')}
              className={`px-6 py-4 text-sm font-medium border-b-2 flex items-center gap-2 ${
                activeTab === 'scoring'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📝 Score Now
              {needsScoring.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700 animate-pulse">
                  {needsScoring.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-4">
          {/* My Trainees Tab - Table Layout with Headers */}
          {activeTab === 'trainees' && (
            <div>
              {activeTrainees.length > 0 ? (
                <div>
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-4 px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200 mb-2">
                    <div className="col-span-4">Trainee</div>
                    <div className="col-span-2 text-center">Status</div>
                    <div className="col-span-3 text-center">Progress</div>
                    <div className="col-span-3 text-right">Quick Actions</div>
                  </div>
                  {/* Table Rows */}
                  <div className="space-y-2">
                    {activeTrainees.map(trainee => {
                      const pendingCount = trainee.totalAssessmentsRequired - trainee.totalAssessmentsCompleted
                      const progress = getProgress(trainee)
                      const assessments = ASSESSMENT_LINKS[trainee.department] || []

                      return (
                        <div
                          key={trainee.email}
                          className="grid grid-cols-12 gap-4 items-center p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
                        >
                          {/* Trainee */}
                          <div className="col-span-4 flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                              {trainee.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 text-sm truncate">{trainee.fullName}</p>
                              <p className="text-xs text-gray-500 truncate">
                                {trainee.department} • Day {trainee.daysSinceTrainingStart}
                              </p>
                            </div>
                          </div>

                          {/* Status */}
                          <div className="col-span-2 flex justify-center">
                            <RiskBadge trainee={trainee} size="sm" />
                          </div>

                          {/* Progress */}
                          <div className="col-span-3 flex items-center justify-center gap-2">
                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  progress >= 100 ? 'bg-green-500' : progress >= 50 ? 'bg-orange-500' : 'bg-yellow-500'
                                }`}
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 w-8">{trainee.totalAssessmentsCompleted}/{trainee.totalAssessmentsRequired}</span>
                          </div>

                          {/* Quick Actions */}
                          <div className="col-span-3 flex items-center justify-end gap-2">
                            {pendingCount > 0 && assessments.length > 0 && (
                              <div className="relative">
                                <button
                                  onClick={() => setScoreDropdown(scoreDropdown === trainee.email ? null : trainee.email)}
                                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                                >
                                  Submit Score
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>
                                {scoreDropdown === trainee.email && (
                                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10 py-1">
                                    {assessments.map((link, i) => (
                                      <button
                                        key={i}
                                        onClick={() => {
                                          openFormModal(link.url, link.name, trainee.fullName, trainee.email)
                                          setScoreDropdown(null)
                                        }}
                                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700"
                                      >
                                        {link.name}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                            <Link
                              href={`/dashboard/trainees/${encodeURIComponent(trainee.email)}`}
                              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-colors"
                            >
                              View
                            </Link>
                          </div>
                        </div>
                      )
                    })}
                  </div>
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

          {/* Score Now Tab - Enhanced with Reflections */}
          {activeTab === 'scoring' && (
            <div>
              {needsScoring.length > 0 ? (
                <div className="space-y-4">
                  {needsScoring.map(trainee => {
                    const pendingCount = trainee.totalAssessmentsRequired - trainee.totalAssessmentsCompleted
                    const traineeReflections = reflections[trainee.email] || []
                    const latestReflection = traineeReflections[0]
                    const assessments = ASSESSMENT_LINKS[trainee.department] || []
                    const summary = scoreSummaries[trainee.email]

                    // Load reflections if not loaded
                    if (!reflections[trainee.email] && !loadingReflections) {
                      fetchReflections(trainee.email)
                    }

                    // Load score summary if not loaded
                    if (!scoreSummaries[trainee.email] && !loadingScoreSummary[trainee.email]) {
                      fetchScoreSummary(trainee.email, trainee.department || 'OS')
                    }

                    return (
                      <div
                        key={trainee.email}
                        className="p-4 rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50"
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center text-white font-medium">
                              {trainee.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{trainee.fullName}</p>
                              <p className="text-xs text-gray-500">
                                {trainee.department} • Day {trainee.daysSinceTrainingStart}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="px-3 py-1 bg-amber-200 text-amber-800 rounded-full text-sm font-semibold">
                              {pendingCount} pending
                            </span>
                          </div>
                        </div>

                        {/* Submitted Scores Summary */}
                        {summary && summary.assessmentScores.length > 0 && (
                          <div className="mb-4 bg-white/80 rounded-lg p-3 border border-green-200">
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-xs font-medium text-green-700">✅ Scores Already Submitted</p>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">Current Score:</span>
                                <span className={`text-sm font-bold ${
                                  summary.learningScore >= 80 ? 'text-green-600' :
                                  summary.learningScore >= 60 ? 'text-amber-600' : 'text-red-500'
                                }`}>
                                  {summary.learningScore}%
                                </span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              {summary.assessmentScores.map((score, i) => {
                                const percentage = score.maxScore > 0
                                  ? Math.round((score.score / score.maxScore) * 100)
                                  : Math.round(score.score)
                                return (
                                  <div key={i} className="flex items-center gap-2">
                                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                                      score.passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                    }`}>
                                      {score.passed ? '✓' : '✗'}
                                    </span>
                                    <span className="text-xs text-gray-700 flex-1 truncate">{score.name}</span>
                                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full rounded-full ${score.passed ? 'bg-green-400' : 'bg-red-400'}`}
                                        style={{ width: `${percentage}%` }}
                                      />
                                    </div>
                                    <span className={`text-xs font-medium w-10 text-right ${
                                      score.passed ? 'text-green-600' : 'text-red-500'
                                    }`}>
                                      {percentage}%
                                    </span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {/* Assessment List */}
                        <div className="mb-4">
                          <p className="text-xs font-medium text-gray-600 mb-2">📋 Assessments to Score:</p>
                          <div className="space-y-2">
                            {assessments.map((link, i) => {
                              // Check if this assessment is already scored
                              const isScored = summary?.assessmentScores.some(s =>
                                s.name.toLowerCase().includes(link.name.toLowerCase()) ||
                                link.name.toLowerCase().includes(s.name.toLowerCase())
                              )

                              if (isScored) return null // Skip already scored assessments

                              return (
                                <div
                                  key={i}
                                  className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-amber-200"
                                >
                                  <span className="text-sm text-gray-700">{link.name}</span>
                                  <div className="flex items-center gap-3">
                                    <span className="text-xs text-amber-600 font-medium">Pending</span>
                                    <button
                                      onClick={() => openFormModal(link.url, link.name, trainee.fullName, trainee.email)}
                                      className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-xs font-medium transition-colors"
                                    >
                                      Score Now
                                    </button>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* Latest Reflection */}
                        {latestReflection && (
                          <div className="bg-white/70 rounded-lg p-3 border border-amber-100">
                            <p className="text-xs font-medium text-gray-600 mb-2">💭 Their reflection (Day {latestReflection.day_number}):</p>
                            {latestReflection.confusing_topic && (
                              <p className="text-sm text-gray-700 italic mb-2">"{latestReflection.confusing_topic}"</p>
                            )}
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">Confidence:</span>
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <span key={star} className={star <= latestReflection.confidence_level ? 'text-amber-400' : 'text-gray-300'}>
                                    ★
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Quick Note Input */}
                        <div className="mt-3 flex gap-2">
                          <input
                            type="text"
                            placeholder="Add a quick note..."
                            value={noteTrainee === trainee.email ? newNote : ''}
                            onChange={(e) => {
                              setNoteTrainee(trainee.email)
                              setNewNote(e.target.value)
                            }}
                            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
                          />
                          <button
                            onClick={() => saveNote(trainee.email)}
                            disabled={savingNote || !newNote.trim() || noteTrainee !== trainee.email}
                            className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <span className="text-4xl mb-4 block">✅</span>
                  <p className="font-medium">All caught up!</p>
                  <p className="text-sm mt-1">No trainees need scoring right now</p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Assessment Form Modal */}
      <AssessmentFormModal
        isOpen={formModal.isOpen}
        onClose={() => setFormModal({ isOpen: false, formUrl: '', formName: '' })}
        formUrl={formModal.formUrl}
        formName={formModal.formName}
        traineeName={formModal.traineeName}
        onScoreSubmitted={handleScoreSubmitted}
      />

    </div>
  )
}
