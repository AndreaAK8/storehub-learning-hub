'use client'

import { useState, useEffect } from 'react'

interface AssessmentScore {
  name: string
  score: number
  maxScore: number
  weightage: number
  passed: boolean
  date?: string
}

interface ExpectedAssessment {
  name: string
  weightage: number
  completed: boolean
}

interface AssessmentScoresChartProps {
  traineeEmail: string
  traineeRole: string
}

export default function AssessmentScoresChart({ traineeEmail, traineeRole }: AssessmentScoresChartProps) {
  const [assessmentScores, setAssessmentScores] = useState<AssessmentScore[]>([])
  const [expectedAssessments, setExpectedAssessments] = useState<ExpectedAssessment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchScores() {
      try {
        setLoading(true)
        const response = await fetch(
          `/api/training/assessment-scores?email=${encodeURIComponent(traineeEmail)}&role=${encodeURIComponent(traineeRole)}`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch scores')
        }

        const data = await response.json()
        setAssessmentScores(data.assessmentScores || [])
        setExpectedAssessments(data.expectedAssessments || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load scores')
      } finally {
        setLoading(false)
      }
    }

    fetchScores()
  }, [traineeEmail, traineeRole])

  // Calculate weighted learning score
  const learningScore = assessmentScores.reduce((acc, score) => {
    const percentage = score.maxScore > 0 ? (score.score / score.maxScore) * 100 : score.score
    return acc + (percentage * (score.weightage / 100))
  }, 0)

  const completedCount = expectedAssessments.filter(e => e.completed).length

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl shadow-sm border border-orange-200 p-6">
        <h2 className="text-lg font-semibold text-orange-900 mb-4">Assessment Scores</h2>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-3 border-orange-300 border-t-orange-600 rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl shadow-sm border border-orange-200 p-6">
        <h2 className="text-lg font-semibold text-orange-900 mb-4">Assessment Scores</h2>
        <div className="text-center py-8 text-orange-600">
          <p className="font-medium">Unable to load assessment scores</p>
          <p className="text-sm mt-1 text-orange-500">{error}</p>
        </div>
      </div>
    )
  }

  // No scores yet
  if (assessmentScores.length === 0 && expectedAssessments.length === 0) {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl shadow-sm border border-orange-200 p-6">
        <h2 className="text-lg font-semibold text-orange-900 mb-4">Assessment Scores</h2>
        <div className="text-center py-8 text-orange-600">
          <svg className="w-12 h-12 mx-auto mb-3 text-orange-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="font-medium">No assessment data yet</p>
          <p className="text-sm mt-1 text-orange-500">Scores will appear here once assessments are graded</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl shadow-sm border border-orange-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-orange-900">Assessment Scores</h2>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-orange-600">Completed</p>
            <p className="text-lg font-bold text-orange-800">{completedCount}/{expectedAssessments.length}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-orange-600">Learning Score</p>
            <p className="text-lg font-bold text-orange-800">{Math.round(learningScore)}%</p>
          </div>
        </div>
      </div>

      {/* Score Summary Bar */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-sm text-orange-700 font-medium">Overall Progress</span>
          <span className="text-sm text-orange-600">{Math.round(learningScore)}% / 80% to pass</span>
        </div>
        <div className="h-4 bg-white/60 rounded-full overflow-hidden shadow-inner">
          <div
            className={`h-full rounded-full transition-all ${
              learningScore >= 80 ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
              learningScore >= 60 ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
              'bg-gradient-to-r from-orange-400 to-red-400'
            }`}
            style={{ width: `${Math.min(learningScore, 100)}%` }}
          />
        </div>
        {/* 80% marker */}
        <div className="relative h-0">
          <div
            className="absolute -top-4 w-0.5 h-4 bg-green-600"
            style={{ left: '80%' }}
          />
          <span
            className="absolute -top-6 text-xs text-green-700 font-medium"
            style={{ left: '80%', transform: 'translateX(-50%)' }}
          >
            80%
          </span>
        </div>
      </div>

      {/* Individual Assessment Scores */}
      <div className="space-y-4 mt-8">
        {expectedAssessments.map((expected, i) => {
          const completedScore = assessmentScores.find(s =>
            s.name.toLowerCase().includes(expected.name.toLowerCase()) ||
            expected.name.toLowerCase().includes(s.name.toLowerCase())
          )
          const isCompleted = !!completedScore
          const percentage = completedScore
            ? Math.round((completedScore.score / completedScore.maxScore) * 100)
            : 0
          const passed = completedScore?.passed || false

          return (
            <div key={i} className={`${!isCompleted ? 'opacity-60' : ''}`}>
              {/* Assessment header */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    isCompleted
                      ? passed
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {isCompleted ? (passed ? '✓' : '✗') : '○'}
                  </span>
                  <span className={`text-sm font-medium ${isCompleted ? 'text-gray-800' : 'text-gray-500'}`}>
                    {expected.name}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-orange-600 bg-orange-200/50 px-2 py-0.5 rounded">
                    {expected.weightage}% weight
                  </span>
                  {isCompleted && (
                    <span className={`text-sm font-bold ${passed ? 'text-green-600' : 'text-red-500'}`}>
                      {percentage}%
                    </span>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="relative h-6 bg-white/70 rounded-lg overflow-hidden ml-8">
                {isCompleted ? (
                  <div
                    className={`h-full rounded-lg transition-all flex items-center justify-end pr-2 ${
                      passed
                        ? 'bg-gradient-to-r from-green-300 to-green-400'
                        : 'bg-gradient-to-r from-red-300 to-red-400'
                    }`}
                    style={{ width: `${percentage}%` }}
                  >
                    {percentage >= 30 && (
                      <span className="text-xs font-medium text-white">{percentage}%</span>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-gray-400">
                    Pending
                  </div>
                )}
                {/* 80% threshold marker */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-green-600/50"
                  style={{ left: '80%' }}
                />
              </div>

              {/* Date if available */}
              {completedScore?.date && (
                <p className="text-xs text-gray-400 ml-8 mt-1">
                  Completed: {new Date(completedScore.date).toLocaleDateString()}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-600 mt-6 pt-4 border-t border-orange-200">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-400" />
          <span>Passed (≥80%)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <span>Failed (&lt;80%)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-gray-400">○</span>
          <span>Pending</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-0.5 h-3 bg-green-600" />
          <span>Pass threshold</span>
        </div>
      </div>
    </div>
  )
}
