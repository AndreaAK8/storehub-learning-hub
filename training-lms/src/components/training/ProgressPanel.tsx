'use client'

import { useMemo } from 'react'

interface TrainingDay {
  dayNumber: number
  title: string
  activities: { status: string; activityType: string }[]
}

interface ProgressPanelProps {
  trainingDays: TrainingDay[]
  totalDays: number
  trainingStartDate?: string
  assessmentsPassed?: number
  assessmentsTotal?: number
  coachName?: string
  coachEmail?: string
}

export function ProgressPanel({
  trainingDays,
  totalDays,
  trainingStartDate,
  assessmentsPassed = 0,
  assessmentsTotal = 0,
  coachName,
  coachEmail,
}: ProgressPanelProps) {
  // Calculate overall progress
  const overallProgress = useMemo(() => {
    let totalActivities = 0
    let completedActivities = 0

    trainingDays.forEach((day) => {
      day.activities.forEach((activity) => {
        if (activity.activityType !== 'lunch' && activity.activityType !== 'break') {
          totalActivities++
          if (activity.status === 'completed') {
            completedActivities++
          }
        }
      })
    })

    return totalActivities > 0
      ? Math.round((completedActivities / totalActivities) * 100)
      : 0
  }, [trainingDays])

  // Calculate per-day progress
  const dayProgress = useMemo(() => {
    return trainingDays.map((day) => {
      const activities = day.activities.filter(
        (a) => a.activityType !== 'lunch' && a.activityType !== 'break'
      )
      const completed = activities.filter((a) => a.status === 'completed').length
      const total = activities.length
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
      const isComplete = percentage === 100
      const isInProgress = activities.some((a) => a.status === 'in_progress')
      const isLocked = !isComplete && !isInProgress && completed === 0

      return {
        dayNumber: day.dayNumber,
        title: day.title,
        completed,
        total,
        percentage,
        isComplete,
        isInProgress,
        isLocked,
      }
    })
  }, [trainingDays])

  // Determine schedule status
  const scheduleStatus = useMemo(() => {
    if (!trainingStartDate) return { status: 'unknown', label: 'Schedule not set' }

    const start = new Date(trainingStartDate)
    const today = new Date()
    const daysSinceStart = Math.floor(
      (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    )
    const expectedDay = Math.min(daysSinceStart + 1, totalDays)

    // Count completed days
    const completedDays = dayProgress.filter((d) => d.isComplete).length

    if (completedDays >= expectedDay) {
      return { status: 'on_track', label: 'On Schedule', color: 'text-blue-600', bg: 'bg-blue-100' }
    } else if (completedDays >= expectedDay - 1) {
      return { status: 'slight_delay', label: 'Slight Delay', color: 'text-amber-600', bg: 'bg-amber-100' }
    } else {
      return { status: 'behind', label: 'Behind Schedule', color: 'text-red-600', bg: 'bg-red-100' }
    }
  }, [trainingStartDate, totalDays, dayProgress])

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-slate-900">Your Progress</h3>
        <p className="text-sm text-slate-500">Track your training completion</p>
      </div>

      {/* Overall Progress */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">Overall Completion</span>
          <span className="text-sm font-bold text-slate-900">{overallProgress}%</span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${overallProgress}%`,
              backgroundColor: overallProgress === 100 ? '#2a6ee8' : overallProgress >= 50 ? '#ff9419' : '#f59e0b'
            }}
          />
        </div>
      </div>

      {/* Schedule Status */}
      <div className={`p-3 rounded-lg ${scheduleStatus.bg}`}>
        <div className="flex items-center gap-2">
          {scheduleStatus.status === 'on_track' && (
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {scheduleStatus.status === 'slight_delay' && (
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {scheduleStatus.status === 'behind' && (
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
          <span className={`text-sm font-medium ${scheduleStatus.color}`}>
            {scheduleStatus.label}
          </span>
        </div>
      </div>

      {/* Per-Day Progress */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-slate-700">Daily Breakdown</h4>
        {dayProgress.map((day) => (
          <div key={day.dayNumber} className="flex items-center gap-3">
            {/* Day indicator */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
              style={{
                backgroundColor: day.isComplete ? '#2a6ee8' : day.isInProgress ? '#ff9419' : day.isLocked ? '#f1f5f9' : '#e2e8f0',
                color: day.isComplete || day.isInProgress ? 'white' : day.isLocked ? '#94a3b8' : '#475569'
              }}
            >
              {day.isComplete ? '✓' : day.isLocked ? '🔒' : day.dayNumber}
            </div>

            {/* Progress bar */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-600">Day {day.dayNumber}</span>
                <span className="text-xs text-slate-500">{day.percentage}%</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${day.percentage}%`,
                    backgroundColor: day.isComplete ? '#2a6ee8' : day.isInProgress ? '#ff9419' : '#cbd5e1'
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Assessments */}
      {assessmentsTotal > 0 && (
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Assessments Passed</span>
            <span className="text-sm font-bold text-slate-900">
              {assessmentsPassed}/{assessmentsTotal}
            </span>
          </div>
        </div>
      )}

      {/* Coach Info */}
      {coachName && (
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium text-slate-700 mb-2">Your Coach</h4>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e9f0fd' }}>
              <span className="font-medium" style={{ color: '#2a6ee8' }}>
                {coachName.split(' ').map((n) => n[0]).join('')}
              </span>
            </div>
            <div>
              <div className="text-sm font-medium text-slate-900">{coachName}</div>
              {coachEmail && (
                <a
                  href={`mailto:${coachEmail}`}
                  className="text-xs hover:underline"
                  style={{ color: '#2a6ee8' }}
                >
                  {coachEmail}
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
