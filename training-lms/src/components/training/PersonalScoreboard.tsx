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
    <div className="bg-white rounded-xl border border-[#c5c3c1] p-4">
      <h3 className="text-sm font-semibold text-[#2f2922] mb-3">Daily completion</h3>

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
                isCurrent ? 'ring-2 ring-[#ff9419]' : ''
              } ${isExpanded ? 'ring-2 ring-[#2a6ee8]' : ''} ${
                !isFuture && day.completed > 0 ? 'cursor-pointer hover:scale-[1.02]' : ''
              }`}
              style={{
                backgroundColor: isFuture ? '#f5f5f4' : isComplete ? '#e9f0fd' : '#fff4e8',
                opacity: isFuture ? 0.5 : 1,
              }}
            >
              <p className="text-xs text-[#7a7672]">Day {day.day}</p>
              <p className="text-2xl font-bold" style={{
                color: isFuture ? '#a09d9a' : isComplete ? '#2a6ee8' : '#ff9419'
              }}>
                {day.completed}
              </p>
              <p className="text-[10px] text-[#a09d9a]">activities</p>
            </button>
          )
        })}
      </div>

      {/* Expanded details panel */}
      {expandedDay !== null && dayActivities.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[#eae9e8]">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-[#55504a]">Day {expandedDay} activities</p>
            <button
              onClick={() => setExpandedDay(null)}
              className="text-xs text-[#a09d9a] hover:text-[#55504a]"
            >
              Close
            </button>
          </div>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {dayActivities.map((activity, idx) => (
              <div
                key={activity.activity_id + idx}
                className="flex items-center justify-between py-1.5 px-2 rounded bg-[#f5f5f4] text-xs"
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
                  <span className="truncate text-[#55504a]">{activity.activity_title}</span>
                </div>
                <span className="text-[#7a7672] flex-shrink-0 ml-2">
                  {activity.percentage_of_allocated}% time
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state for expanded day with no activities */}
      {expandedDay !== null && dayActivities.length === 0 && (
        <div className="mt-3 pt-3 border-t border-[#eae9e8] text-center py-4">
          <p className="text-xs text-[#a09d9a]">No activities completed on Day {expandedDay}</p>
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
            <p className="text-[#a09d9a] text-sm mb-1">Learning Score</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">{learningScore}%</span>
              <span className="text-[#a09d9a] text-lg">/ 80% to pass</span>
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
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-[#55504a]">
          <div className="text-center">
            <p className="text-2xl font-bold">{performanceData.length}/{totalActivities}</p>
            <p className="text-xs text-[#a09d9a]">Activities Done</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{completedAssessments}/{totalExpectedAssessments}</p>
            <p className="text-xs text-[#a09d9a]">Assessments Done</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{learningScore}%</p>
            <p className="text-xs text-[#a09d9a]">Current Score</p>
          </div>
        </div>

        {/* Expandable: How to reach 80% */}
        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="w-full mt-4 pt-3 border-t border-[#55504a] flex items-center justify-center gap-2 text-sm text-[#a09d9a] hover:text-white transition-colors"
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
          <div className="mt-4 p-4 bg-[#2f2922]/50 rounded-xl text-sm">
            <p className="text-[#a09d9a] mb-3">
              Your score = Sum of (Assessment Score × Weight)
            </p>

            {/* Weightage table */}
            <div className="mb-4">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-[#a09d9a] border-b border-[#55504a]">
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
                      <tr key={i} className="border-b border-[#55504a]/50">
                        <td className="py-2 text-[#a09d9a]">{expected.name}</td>
                        <td className="py-2 text-center text-[#a09d9a]">{expected.weightage}%</td>
                        <td className="py-2 text-center">
                          {score !== null ? (
                            <span className="text-white">{score}%</span>
                          ) : (
                            <span className="text-[#7a7672]">—</span>
                          )}
                        </td>
                        <td className="py-2 text-right">
                          {score !== null ? (
                            <span className="text-[#2a6ee8]">{contribution} / {maxContribution}</span>
                          ) : (
                            <span className="text-[#7a7672]">0 / {maxContribution}</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="font-medium">
                    <td className="py-2 text-[#a09d9a]">Total</td>
                    <td className="py-2 text-center text-[#a09d9a]">100%</td>
                    <td className="py-2"></td>
                    <td className="py-2 text-right text-white">{learningScore} / 100</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Summary */}
            <div className="pt-3 border-t border-[#55504a]">
              <div className="flex justify-between text-sm">
                <span className="text-[#a09d9a]">Current Total</span>
                <span className="text-white font-bold">{learningScore} / 100</span>
              </div>
              {!allAssessmentsComplete && (
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-[#a09d9a]">Remaining Weight</span>
                  <span className="text-blue-400">{remainingWeightage}%</span>
                </div>
              )}
              {pointsNeeded > 0 && !allAssessmentsComplete && (
                <p className="text-xs text-[#a09d9a] mt-2">
                  You need <span className="text-orange-400">{pointsNeeded} more points</span> to reach 80%.
                  With {remainingWeightage}% remaining weight, aim for ~{Math.ceil(pointsNeeded / remainingWeightage * 100)}% average on remaining assessments.
                </p>
              )}
              {learningScore >= 80 && (
                <p className="text-xs text-[#2a6ee8] mt-2">
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
      <div className="bg-white rounded-xl border border-[#c5c3c1] p-5">
        <h3 className="text-lg font-bold text-[#2f2922] mb-4">Progress Trajectory</h3>

        {/* Simple bar chart */}
        <div className="flex items-end gap-3 h-32 mb-2">
          {trajectoryData.map((day) => (
            <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-[#7a7672]">{day.percentage}%</span>
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
              <span className="text-xs text-[#a09d9a]">Day {day.day}</span>
            </div>
          ))}
        </div>

        {/* Target line indicator */}
        <div className="flex items-center gap-2 text-xs text-[#7a7672] mt-4">
          <div className="w-3 h-3 rounded bg-blue-500" />
          <span>On/Ahead of target</span>
          <div className="w-3 h-3 rounded bg-orange-400 ml-4" />
          <span>Behind target</span>
        </div>
      </div>

      {/* Assessment Scores - Show ALL expected assessments */}
      {expectedAssessments.length > 0 && (
        <div className="bg-white rounded-xl border border-[#c5c3c1] p-5">
          <h3 className="text-lg font-bold text-[#2f2922] mb-4">Assessment Scores</h3>

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
                    <p className={`text-sm font-medium ${isCompleted ? 'text-[#55504a]' : 'text-[#a09d9a]'}`}>
                      {expected.name}
                    </p>
                    <p className="text-xs text-[#a09d9a]">Weight: {expected.weightage}%</p>
                  </div>

                  {/* Progress bar */}
                  <div className="flex-1 relative">
                    <div className="h-8 bg-[#eae9e8] rounded-lg overflow-hidden">
                      {isCompleted ? (
                        <div
                          className={`h-full rounded-lg transition-all ${
                            passed ? 'bg-[#e9f0fd]' : 'bg-[#ffeef0]'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center text-xs text-[#a09d9a]">
                          Not yet completed
                        </div>
                      )}
                      {/* 80% threshold marker */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-[#e9f0fd]"
                        style={{ left: '80%' }}
                      />
                    </div>
                  </div>

                  {/* Score */}
                  <div className="w-16 text-right">
                    {isCompleted ? (
                      <span className={`text-lg font-bold ${passed ? 'text-[#2a6ee8]' : 'text-[#ff546f]'}`}>
                        {percentage}%
                      </span>
                    ) : (
                      <span className="text-sm text-[#a09d9a]">—</span>
                    )}
                  </div>

                  {/* Status */}
                  <div className="w-6">
                    {isCompleted ? (
                      passed ? (
                        <span className="text-[#2a6ee8]">✓</span>
                      ) : (
                        <span className="text-[#ff546f]">✗</span>
                      )
                    ) : (
                      <span className="text-[#a09d9a]">○</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs text-[#7a7672] mt-4 pt-4 border-t">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-[#e9f0fd]" />
              <span>Passed (≥80%)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-[#ffeef0]" />
              <span>Failed (&lt;80%)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[#a09d9a]">○</span>
              <span>Pending</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-0.5 h-3 bg-[#e9f0fd]" />
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
        <div className="bg-white rounded-xl border border-[#c5c3c1] p-5">
          <h3 className="text-lg font-bold text-[#2f2922] mb-4">Recent Completions</h3>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {performanceData.slice(0, 10).map((record, index) => (
              <div
                key={record.activity_id + index}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#f5f5f4]"
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
                  <p className="text-sm font-medium text-[#2f2922] truncate">
                    {record.activity_title}
                  </p>
                  <p className="text-xs text-[#7a7672]">
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
        <div className="bg-[#f5f5f4] rounded-xl border border-[#c5c3c1] p-8 text-center">
          <div className="w-16 h-16 bg-[#eae9e8] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📊</span>
          </div>
          <h3 className="text-lg font-semibold text-[#2f2922] mb-2">No Activity Data Yet</h3>
          <p className="text-[#7a7672] text-sm mb-4">
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

