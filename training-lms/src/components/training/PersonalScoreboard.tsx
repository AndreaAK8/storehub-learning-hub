'use client'

import { useMemo, useState } from 'react'

interface PerformanceRecord {
  activity_id: string
  activity_title: string
  activity_type: string
  day_number: number
  performance_flag: 'fast' | 'on_time' | 'slow' | 'struggling'
  percentage_of_allocated: number
  created_at: string
}

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

interface PersonalScoreboardProps {
  performanceData: PerformanceRecord[]
  totalActivities: number
  assessmentsPassed: number
  assessmentsTotal: number
  assessmentScores?: AssessmentScore[]
  expectedAssessments?: ExpectedAssessment[]
  trainingStartDate?: string
  currentDay: number
  totalDays: number
}

// Compact Daily Completion Row with expandable details
function DailyCompletionRow({
  dailyProgress,
  totalActivities,
  totalDays,
  currentDay,
  performanceData,
}: {
  dailyProgress: { day: number; completed: number }[]
  totalActivities: number
  totalDays: number
  currentDay: number
  performanceData: PerformanceRecord[]
}) {
  const [expandedDay, setExpandedDay] = useState<number | null>(null)

  // Get activities for the expanded day
  const dayActivities = useMemo(() => {
    if (expandedDay === null) return []
    return performanceData.filter((p) => p.day_number === expandedDay)
  }, [expandedDay, performanceData])

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <h3 className="text-sm font-semibold text-slate-900 mb-3">Daily Completion</h3>

      {/* Horizontal row - cards fill available space */}
      <div className="flex gap-2">
        {dailyProgress.map((day) => {
          const isComplete = day.completed >= Math.ceil(totalActivities / totalDays)
          const isCurrent = day.day === currentDay
          const isFuture = day.day > currentDay
          const isExpanded = expandedDay === day.day

          return (
            <button
              key={day.day}
              onClick={() => setExpandedDay(isExpanded ? null : day.day)}
              disabled={isFuture || day.completed === 0}
              className={`flex-1 py-3 rounded-xl text-center transition-all ${
                isCurrent ? 'ring-2 ring-orange-400' : ''
              } ${isExpanded ? 'ring-2 ring-blue-500' : ''} ${
                !isFuture && day.completed > 0 ? 'cursor-pointer hover:scale-[1.02]' : ''
              }`}
              style={{
                backgroundColor: isFuture ? '#f8fafc' : isComplete ? '#e9f0fd' : '#fff7ed',
                opacity: isFuture ? 0.5 : 1,
              }}
            >
              <p className="text-xs text-slate-500">Day {day.day}</p>
              <p className="text-2xl font-bold" style={{
                color: isFuture ? '#94a3b8' : isComplete ? '#2a6ee8' : '#f59e0b'
              }}>
                {day.completed}
              </p>
              <p className="text-[10px] text-slate-400">activities</p>
            </button>
          )
        })}
      </div>

      {/* Expanded details panel */}
      {expandedDay !== null && dayActivities.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-slate-700">Day {expandedDay} Activities</p>
            <button
              onClick={() => setExpandedDay(null)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Close
            </button>
          </div>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {dayActivities.map((activity, idx) => (
              <div
                key={activity.activity_id + idx}
                className="flex items-center justify-between py-1.5 px-2 rounded bg-slate-50 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0"
                    style={{
                      backgroundColor:
                        activity.performance_flag === 'fast' ? '#dcfce7' :
                        activity.performance_flag === 'on_time' ? '#e9f0fd' :
                        activity.performance_flag === 'slow' ? '#fef3c7' : '#fee2e2',
                    }}
                  >
                    {activity.performance_flag === 'fast' ? '🚀' :
                     activity.performance_flag === 'on_time' ? '✓' :
                     activity.performance_flag === 'slow' ? '🐢' : '⚠️'}
                  </span>
                  <span className="truncate text-slate-700">{activity.activity_title}</span>
                </div>
                <span className="text-slate-500 flex-shrink-0 ml-2">
                  {activity.percentage_of_allocated}% time
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state for expanded day with no activities */}
      {expandedDay !== null && dayActivities.length === 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100 text-center py-4">
          <p className="text-xs text-slate-400">No activities completed on Day {expandedDay}</p>
        </div>
      )}
    </div>
  )
}

export function PersonalScoreboard({
  performanceData,
  totalActivities,
  assessmentsPassed,
  assessmentsTotal,
  assessmentScores = [],
  expectedAssessments = [],
  currentDay,
  totalDays,
}: PersonalScoreboardProps) {
  // Calculate participation (activity completion percentage)
  const participationPercentage = useMemo(() => {
    if (totalActivities === 0) return 0
    return Math.round((performanceData.length / totalActivities) * 100)
  }, [performanceData.length, totalActivities])


  // Calculate activities per day for trajectory chart
  const dailyProgress = useMemo(() => {
    const dayMap: Record<number, number> = {}
    for (let i = 1; i <= totalDays; i++) {
      dayMap[i] = 0
    }
    performanceData.forEach((record) => {
      if (dayMap[record.day_number] !== undefined) {
        dayMap[record.day_number]++
      }
    })
    return Object.entries(dayMap).map(([day, count]) => ({
      day: parseInt(day),
      completed: count,
    }))
  }, [performanceData, totalDays])

  // Calculate daily progress percentage (not cumulative)
  const trajectoryData = useMemo(() => {
    // Estimate activities per day (evenly distributed)
    const activitiesPerDay = Math.ceil(totalActivities / totalDays)

    return dailyProgress.map((day) => {
      // Show percentage of that day's expected activities completed
      const dayPercentage = day.completed > 0
        ? Math.round((day.completed / activitiesPerDay) * 100)
        : 0
      return {
        day: day.day,
        completed: day.completed,
        percentage: Math.min(dayPercentage, 100), // Cap at 100%
      }
    })
  }, [dailyProgress, totalActivities, totalDays])


  // Learning Score based on weighted assessment scores
  // Formula: sum of (score% × weightage%) for each completed assessment
  // Example: 85% on All-in-One Quiz (50% weight) = 85 × 0.50 = 42.5 points toward 100
  const learningScore = useMemo(() => {
    if (assessmentScores.length === 0) {
      // No individual scores available - show 0 until assessments are graded
      return 0
    }

    // Calculate weighted contribution from each assessment
    let weightedScore = 0

    assessmentScores.forEach((assessment) => {
      // Score is already 0-100, weightage is percentage (e.g., 50 for 50%)
      const scorePercent = assessment.maxScore > 0
        ? (assessment.score / assessment.maxScore) * 100
        : assessment.score // If maxScore is 0, assume score is already a percentage

      // Add contribution: score% × weightage%
      // e.g., 85% score × 50% weight = 42.5 points
      weightedScore += scorePercent * (assessment.weightage / 100)
    })

    return Math.round(weightedScore)
  }, [assessmentScores])

  // Check if all assessments are complete
  const allAssessmentsComplete = useMemo(() => {
    if (expectedAssessments.length === 0) return false
    return expectedAssessments.every(e => e.completed)
  }, [expectedAssessments])

  // Grade based on learning score (80% is passing)
  // Show "In Progress" if training is not complete
  const grade = useMemo(() => {
    if (!allAssessmentsComplete) {
      return { letter: '...', color: '#3b82f6', label: 'In Progress' }
    }
    if (learningScore >= 90) return { letter: 'A', color: '#2a6ee8', label: 'Excellent' }
    if (learningScore >= 80) return { letter: 'B', color: '#22c55e', label: 'Passed' }
    if (learningScore >= 70) return { letter: 'C', color: '#ff9419', label: 'Almost There' }
    if (learningScore >= 60) return { letter: 'D', color: '#f59e0b', label: 'Needs Work' }
    return { letter: 'F', color: '#ef4444', label: 'At Risk' }
  }, [learningScore, allAssessmentsComplete])

  // Max activities in a day for chart scaling
  const maxDailyActivities = Math.max(...dailyProgress.map((d) => d.completed), 1)

  // Calculate completed vs total assessments
  const completedAssessments = expectedAssessments.filter(e => e.completed).length
  const totalExpectedAssessments = expectedAssessments.length

  // State for expandable breakdown
  const [showBreakdown, setShowBreakdown] = useState(false)

  // Calculate what's needed to reach 80%
  const pointsNeeded = Math.max(0, 80 - learningScore)
  const remainingWeightage = expectedAssessments
    .filter(e => !e.completed)
    .reduce((sum, e) => sum + e.weightage, 0)

  return (
    <div className="space-y-6">
      {/* Score Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm mb-1">Learning Score</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">{learningScore}%</span>
              <span className="text-slate-400 text-lg">/ 80% to pass</span>
            </div>
            <p className="text-sm mt-2" style={{ color: grade.color }}>
              {grade.label}
            </p>
          </div>
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold"
            style={{ backgroundColor: grade.color }}
          >
            {grade.letter}
          </div>
        </div>

        {/* Score breakdown mini */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-slate-700">
          <div className="text-center">
            <p className="text-2xl font-bold">{performanceData.length}/{totalActivities}</p>
            <p className="text-xs text-slate-400">Activities Done</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{completedAssessments}/{totalExpectedAssessments}</p>
            <p className="text-xs text-slate-400">Assessments Done</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{learningScore}%</p>
            <p className="text-xs text-slate-400">Current Score</p>
          </div>
        </div>

        {/* Expandable: How to reach 80% */}
        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="w-full mt-4 pt-3 border-t border-slate-700 flex items-center justify-center gap-2 text-sm text-slate-300 hover:text-white transition-colors"
        >
          <span>How is my score calculated?</span>
          <svg
            className={`w-4 h-4 transition-transform ${showBreakdown ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showBreakdown && (
          <div className="mt-4 p-4 bg-slate-800/50 rounded-xl text-sm">
            <p className="text-slate-300 mb-3">
              Your score = Sum of (Assessment Score × Weight)
            </p>

            {/* Weightage table */}
            <div className="mb-4">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-700">
                    <th className="text-left py-2">Assessment</th>
                    <th className="text-center py-2 w-16">Weight</th>
                    <th className="text-center py-2 w-16">Score</th>
                    <th className="text-right py-2 w-20">Contribution</th>
                  </tr>
                </thead>
                <tbody>
                  {expectedAssessments.map((expected, i) => {
                    const completed = assessmentScores.find(s =>
                      s.name.toLowerCase().includes(expected.name.toLowerCase()) ||
                      expected.name.toLowerCase().includes(s.name.toLowerCase())
                    )
                    const score = completed ? Math.round((completed.score / completed.maxScore) * 100) : null
                    const contribution = score !== null ? Math.round(score * expected.weightage / 100) : 0
                    const maxContribution = expected.weightage // If 100% score

                    return (
                      <tr key={i} className="border-b border-slate-700/50">
                        <td className="py-2 text-slate-300">{expected.name}</td>
                        <td className="py-2 text-center text-slate-400">{expected.weightage}%</td>
                        <td className="py-2 text-center">
                          {score !== null ? (
                            <span className="text-white">{score}%</span>
                          ) : (
                            <span className="text-slate-500">—</span>
                          )}
                        </td>
                        <td className="py-2 text-right">
                          {score !== null ? (
                            <span className="text-green-400">{contribution} / {maxContribution}</span>
                          ) : (
                            <span className="text-slate-500">0 / {maxContribution}</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="font-medium">
                    <td className="py-2 text-slate-300">Total</td>
                    <td className="py-2 text-center text-slate-400">100%</td>
                    <td className="py-2"></td>
                    <td className="py-2 text-right text-white">{learningScore} / 100</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Summary */}
            <div className="pt-3 border-t border-slate-700">
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Current Total</span>
                <span className="text-white font-bold">{learningScore} / 100</span>
              </div>
              {!allAssessmentsComplete && (
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-slate-300">Remaining Weight</span>
                  <span className="text-blue-400">{remainingWeightage}%</span>
                </div>
              )}
              {pointsNeeded > 0 && !allAssessmentsComplete && (
                <p className="text-xs text-slate-400 mt-2">
                  You need <span className="text-orange-400">{pointsNeeded} more points</span> to reach 80%.
                  With {remainingWeightage}% remaining weight, aim for ~{Math.ceil(pointsNeeded / remainingWeightage * 100)}% average on remaining assessments.
                </p>
              )}
              {learningScore >= 80 && (
                <p className="text-xs text-green-400 mt-2">
                  You&apos;ve already reached the passing threshold!
                </p>
              )}
            </div>

            {/* Note about Participation */}
            <div className="mt-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="text-blue-400 text-lg">💡</span>
                <div>
                  <p className="text-sm text-blue-300 font-medium">Participation Bonus</p>
                  <p className="text-xs text-blue-200/80 mt-1">
                    Your trainer will add a participation score (5-20%) based on your engagement, attitude, and class participation. This will be added to your final score.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Progress Trajectory Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Progress Trajectory</h3>

        {/* Simple bar chart */}
        <div className="flex items-end gap-3 h-32 mb-2">
          {trajectoryData.map((day) => (
            <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-slate-500">{day.percentage}%</span>
              <div
                className="w-full rounded-t transition-all"
                style={{
                  height: `${Math.max(day.percentage, 2)}%`,
                  minHeight: '4px',
                  backgroundColor: day.completed > 0
                    ? (day.percentage >= 80 ? '#2a6ee8' : '#ff9419')
                    : '#e2e8f0',
                }}
              />
              <span className="text-xs text-slate-400">Day {day.day}</span>
            </div>
          ))}
        </div>

        {/* Target line indicator */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mt-4">
          <div className="w-3 h-3 rounded bg-blue-500" />
          <span>On/Ahead of target</span>
          <div className="w-3 h-3 rounded bg-orange-400 ml-4" />
          <span>Behind target</span>
        </div>
      </div>

      {/* Assessment Scores - Show ALL expected assessments */}
      {expectedAssessments.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Assessment Scores</h3>

          {/* Show all expected assessments */}
          <div className="space-y-3">
            {expectedAssessments.map((expected, i) => {
              // Find matching completed score
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
                <div key={i} className={`flex items-center gap-3 ${!isCompleted ? 'opacity-60' : ''}`}>
                  {/* Assessment name */}
                  <div className="w-56 flex-shrink-0">
                    <p className={`text-sm font-medium ${isCompleted ? 'text-slate-700' : 'text-slate-400'}`}>
                      {expected.name}
                    </p>
                    <p className="text-xs text-slate-400">Weight: {expected.weightage}%</p>
                  </div>

                  {/* Progress bar */}
                  <div className="flex-1 relative">
                    <div className="h-8 bg-slate-100 rounded-lg overflow-hidden">
                      {isCompleted ? (
                        <div
                          className={`h-full rounded-lg transition-all ${
                            passed ? 'bg-green-500' : 'bg-red-400'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center text-xs text-slate-400">
                          Not yet completed
                        </div>
                      )}
                      {/* 80% threshold marker */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-green-600"
                        style={{ left: '80%' }}
                      />
                    </div>
                  </div>

                  {/* Score */}
                  <div className="w-16 text-right">
                    {isCompleted ? (
                      <span className={`text-lg font-bold ${passed ? 'text-green-600' : 'text-red-500'}`}>
                        {percentage}%
                      </span>
                    ) : (
                      <span className="text-sm text-slate-400">—</span>
                    )}
                  </div>

                  {/* Status */}
                  <div className="w-6">
                    {isCompleted ? (
                      passed ? (
                        <span className="text-green-500">✓</span>
                      ) : (
                        <span className="text-red-500">✗</span>
                      )
                    ) : (
                      <span className="text-slate-300">○</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs text-slate-500 mt-4 pt-4 border-t">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>Passed (≥80%)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <span>Failed (&lt;80%)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-slate-300">○</span>
              <span>Pending</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-0.5 h-3 bg-green-600" />
              <span>Passing threshold</span>
            </div>
          </div>
        </div>
      )}


      {/* Daily Completion - Compact Row */}
      <DailyCompletionRow
        dailyProgress={dailyProgress}
        totalActivities={totalActivities}
        totalDays={totalDays}
        currentDay={currentDay}
        performanceData={performanceData}
      />

      {/* Recent Activity Feed */}
      {performanceData.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Completions</h3>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {performanceData.slice(0, 10).map((record, index) => (
              <div
                key={record.activity_id + index}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                  style={{
                    backgroundColor:
                      record.performance_flag === 'fast' ? '#dcfce7' :
                      record.performance_flag === 'on_time' ? '#e9f0fd' :
                      record.performance_flag === 'slow' ? '#fef3c7' : '#fee2e2',
                    color:
                      record.performance_flag === 'fast' ? '#22c55e' :
                      record.performance_flag === 'on_time' ? '#2a6ee8' :
                      record.performance_flag === 'slow' ? '#f59e0b' : '#ef4444',
                  }}
                >
                  {record.performance_flag === 'fast' ? '🚀' :
                   record.performance_flag === 'on_time' ? '✓' :
                   record.performance_flag === 'slow' ? '🐢' : '⚠️'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {record.activity_title}
                  </p>
                  <p className="text-xs text-slate-500">
                    Day {record.day_number} • {record.percentage_of_allocated}% of time
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {performanceData.length === 0 && (
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📊</span>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Activity Data Yet</h3>
          <p className="text-slate-500 text-sm mb-4">
            Start completing activities in your training schedule to see your scores here!
          </p>
          <a
            href="/dashboard/my-training"
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Go to My Training
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      )}
    </div>
  )
}

