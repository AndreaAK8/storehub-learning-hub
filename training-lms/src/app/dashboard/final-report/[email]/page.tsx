'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface AssessmentScore {
  assessmentName: string
  score: number
  passed: boolean
  attemptNumber: number
  submittedAt: string
}

interface WeightageConfig {
  role: string
  assessmentName: string
  weightage: number
  passingRate: number
}

interface TraineeData {
  email: string
  fullName: string
  department: string
  country: string
  trainingStartDate: string
  coachName: string
  coachEmail: string
  daysSinceTrainingStart: number
}

// Mock weightage data (in production, fetch from API)
const WEIGHTAGE_CONFIG: WeightageConfig[] = [
  // Merchant Care
  { role: 'Merchant Care', assessmentName: 'All in One Quiz', weightage: 20, passingRate: 80 },
  { role: 'Merchant Care', assessmentName: 'Advance System & Networking Quiz', weightage: 15, passingRate: 80 },
  { role: 'Merchant Care', assessmentName: 'Hardware Assessment', weightage: 20, passingRate: 80 },
  { role: 'Merchant Care', assessmentName: 'Care Mock Test', weightage: 45, passingRate: 80 },
  // Onboarding Coordinator
  { role: 'Onboarding Coordinator', assessmentName: 'All in One Quiz', weightage: 50, passingRate: 80 },
  { role: 'Onboarding Coordinator', assessmentName: 'Advance System & Networking Quiz', weightage: 35, passingRate: 80 },
  { role: 'Onboarding Coordinator', assessmentName: 'Hardware Assessment', weightage: 15, passingRate: 80 },
  // Business Consultant
  { role: 'Business Consultant', assessmentName: 'All in One Quiz', weightage: 20, passingRate: 80 },
  { role: 'Business Consultant', assessmentName: 'BC Pitching Assessment - F&B', weightage: 5, passingRate: 80 },
  { role: 'Business Consultant', assessmentName: 'BC Pitching Assessment - Retail', weightage: 5, passingRate: 80 },
  { role: 'Business Consultant', assessmentName: 'BC SPIN Assessment - Session 2', weightage: 5, passingRate: 80 },
  { role: 'Business Consultant', assessmentName: 'BC Closing Skills - Session 1', weightage: 5, passingRate: 80 },
  { role: 'Business Consultant', assessmentName: 'BC Closing Skills - Session 2', weightage: 5, passingRate: 80 },
  { role: 'Business Consultant', assessmentName: 'BC Full Pitching - F&B', weightage: 10, passingRate: 80 },
  { role: 'Business Consultant', assessmentName: 'BC Full Pitching - Retail', weightage: 10, passingRate: 80 },
  { role: 'Business Consultant', assessmentName: 'Mock Test', weightage: 35, passingRate: 80 },
]

export default function FinalReportPage({ params }: { params: Promise<{ email: string }> }) {
  const resolvedParams = use(params)
  const traineeEmail = decodeURIComponent(resolvedParams.email)
  const router = useRouter()

  const [trainee, setTrainee] = useState<TraineeData | null>(null)
  const [scores, setScores] = useState<AssessmentScore[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  // Form state
  const [participationScore, setParticipationScore] = useState(15)
  const [highlights, setHighlights] = useState('')
  const [lowlights, setLowlights] = useState('')

  // Fetch trainee data and scores
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch trainee info
        const traineeRes = await fetch(`/api/trainees?email=${encodeURIComponent(traineeEmail)}`)
        if (traineeRes.ok) {
          const traineeData = await traineeRes.json()
          if (traineeData.trainees?.length > 0) {
            setTrainee(traineeData.trainees[0])
          }
        }

        // Fetch scores
        const scoresRes = await fetch(`/api/scores?traineeEmail=${encodeURIComponent(traineeEmail)}`)
        if (scoresRes.ok) {
          const scoresData = await scoresRes.json()
          setScores(scoresData.scores || [])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [traineeEmail])

  // Calculate weighted learning score
  const calculateLearningScore = () => {
    if (!trainee || scores.length === 0) return { total: 0, breakdown: [] }

    const role = trainee.department
    const roleWeightage = WEIGHTAGE_CONFIG.filter(w => w.role === role)

    // Get latest score for each assessment
    const latestScores = new Map<string, AssessmentScore>()
    scores.forEach(score => {
      const existing = latestScores.get(score.assessmentName)
      if (!existing || score.attemptNumber > existing.attemptNumber) {
        latestScores.set(score.assessmentName, score)
      }
    })

    let totalWeightedScore = 0
    const breakdown: { name: string; score: number; weight: number; weighted: number; passed: boolean }[] = []

    roleWeightage.forEach(config => {
      const scoreData = latestScores.get(config.assessmentName)
      if (scoreData) {
        const weighted = (scoreData.score / 100) * config.weightage
        totalWeightedScore += weighted
        breakdown.push({
          name: config.assessmentName,
          score: scoreData.score,
          weight: config.weightage,
          weighted: Math.round(weighted * 10) / 10,
          passed: scoreData.passed
        })
      } else {
        breakdown.push({
          name: config.assessmentName,
          score: 0,
          weight: config.weightage,
          weighted: 0,
          passed: false
        })
      }
    })

    return { total: Math.round(totalWeightedScore), breakdown }
  }

  const { total: rawLearningScore, breakdown } = calculateLearningScore()

  // Calculate final score (80% learning + 20% participation)
  const learningContribution = rawLearningScore * 0.8
  const participationPercentage = (participationScore / 20) * 100
  const participationContribution = participationPercentage * 0.2
  const finalScore = Math.round(learningContribution + participationContribution)
  const overallStatus = finalScore >= 80 ? 'PASS' : 'FAIL'

  // Send final report
  const handleSendReport = async () => {
    if (!trainee || !highlights || !lowlights) {
      alert('Please fill in highlights and lowlights')
      return
    }

    setSending(true)
    try {
      const response = await fetch('/api/workflows/final-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          traineeEmail: trainee.email,
          traineeName: trainee.fullName,
          role: trainee.department,
          country: trainee.country,
          trainingStartDate: trainee.trainingStartDate,
          coachEmail: trainee.coachEmail,
          coachName: trainee.coachName,
          rawLearningScore,
          learningScore: Math.round(learningContribution),
          participationScore,
          participationContribution: Math.round(participationContribution),
          finalScore,
          overallStatus,
          highlights,
          lowlights,
          assessmentBreakdown: breakdown,
        })
      })

      if (response.ok) {
        setSent(true)
      } else {
        const error = await response.json()
        alert(`Error: ${error.message || 'Failed to send report'}`)
      }
    } catch (error) {
      console.error('Error sending report:', error)
      alert('Failed to send report')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  if (!trainee) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Trainee not found</p>
          <Link href="/dashboard/trainees" className="text-teal-600 hover:underline mt-2 inline-block">
            Back to trainees
          </Link>
        </div>
      </div>
    )
  }

  if (sent) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Sent!</h2>
          <p className="text-gray-600 mb-6">
            Final report for {trainee.fullName} has been sent to {trainee.coachEmail}
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href={`/dashboard/trainees/${encodeURIComponent(trainee.email)}`}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              View Trainee
            </Link>
            <Link
              href="/dashboard/trainees"
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              Back to Trainees
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href={`/dashboard/trainees/${encodeURIComponent(trainee.email)}`} className="text-teal-600 hover:underline text-sm mb-2 inline-block">
          ← Back to {trainee.fullName}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Generate Final Report</h1>
        <p className="text-gray-600">Review scores and generate the final training report</p>
      </div>

      {/* Trainee Info */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
            {trainee.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{trainee.fullName}</h2>
            <p className="text-gray-600">{trainee.department} • {trainee.country}</p>
            <p className="text-sm text-gray-500">
              Training: {trainee.trainingStartDate} ({trainee.daysSinceTrainingStart} days)
            </p>
          </div>
        </div>
      </div>

      {/* Score Calculation */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Calculation</h3>

        {/* Assessment Breakdown */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Assessment Breakdown</h4>
          <div className="space-y-2">
            {breakdown.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${item.passed ? 'bg-green-500' : item.score > 0 ? 'bg-red-500' : 'bg-gray-300'}`} />
                  <span className="text-sm text-gray-700">{item.name}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className={item.passed ? 'text-green-600' : item.score > 0 ? 'text-red-600' : 'text-gray-400'}>
                    {item.score > 0 ? `${item.score}%` : '-'}
                  </span>
                  <span className="text-gray-400">×</span>
                  <span className="text-gray-500">{item.weight}%</span>
                  <span className="text-gray-400">=</span>
                  <span className="font-medium text-gray-900 w-12 text-right">{item.weighted}%</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between">
            <span className="font-medium text-gray-900">Raw Learning Score</span>
            <span className="font-bold text-lg text-gray-900">{rawLearningScore}%</span>
          </div>
        </div>

        {/* Final Score Calculation */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Learning Score (80% weight)</p>
              <p className="text-xl font-bold text-gray-900">{Math.round(learningContribution)}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Participation Score (20% weight)</p>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={participationScore}
                  onChange={(e) => setParticipationScore(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-xl font-bold text-gray-900 w-20 text-right">
                  {participationScore}/20
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                = {Math.round(participationContribution)}% contribution
              </p>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-900">Final Score</span>
            <div className="flex items-center gap-3">
              <span className={`text-3xl font-bold ${finalScore >= 80 ? 'text-green-600' : 'text-red-600'}`}>
                {finalScore}%
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                finalScore >= 80 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {overallStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Trainer Input */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Trainer Feedback</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Highlights <span className="text-red-500">*</span>
            </label>
            <textarea
              value={highlights}
              onChange={(e) => setHighlights(e.target.value)}
              placeholder="What did the trainee do well? Key strengths observed..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Areas for Development <span className="text-red-500">*</span>
            </label>
            <textarea
              value={lowlights}
              onChange={(e) => setLowlights(e.target.value)}
              placeholder="Areas that need improvement, coaching points..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              rows={4}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Link
          href={`/dashboard/trainees/${encodeURIComponent(trainee.email)}`}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </Link>
        <button
          onClick={handleSendReport}
          disabled={sending || !highlights || !lowlights}
          className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 ${
            sending || !highlights || !lowlights
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-teal-600 text-white hover:bg-teal-700'
          }`}
        >
          {sending ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Sending...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Send Final Report
            </>
          )}
        </button>
      </div>
    </div>
  )
}
