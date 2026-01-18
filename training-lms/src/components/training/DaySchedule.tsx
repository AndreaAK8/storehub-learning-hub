'use client'

import { useMemo } from 'react'
import { ActivityCard } from './ActivityCard'

interface Activity {
  id: string
  title: string
  description: string
  startTime: string
  endTime: string
  durationHours: number
  activityType: string
  status: 'pending' | 'in_progress' | 'completed' | 'skipped'
  pic: string
  resourceLinks?: { title: string; url: string }[]
  successCriteria?: string[]
  tldr?: string
}

interface DayScheduleProps {
  dayNumber: number
  title: string
  description?: string
  activities: Activity[]
  dueDate?: string
  isLocked?: boolean
  onMarkComplete: (activityId: string) => void
  onStartActivity: (activityId: string) => void
}

export function DaySchedule({
  dayNumber,
  title,
  description,
  activities,
  dueDate,
  isLocked,
  onMarkComplete,
  onStartActivity,
}: DayScheduleProps) {
  // Calculate completion stats
  const stats = useMemo(() => {
    const total = activities.filter(a => a.activityType !== 'lunch' && a.activityType !== 'break').length
    const completed = activities.filter(a => a.status === 'completed' && a.activityType !== 'lunch' && a.activityType !== 'break').length
    const inProgress = activities.filter(a => a.status === 'in_progress').length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

    return { total, completed, inProgress, percentage }
  }, [activities])

  // Determine if an activity should be locked (previous non-break activities not completed)
  const getActivityLockStatus = (index: number): boolean => {
    if (isLocked) return true
    if (index === 0) return false

    // Find the previous non-break activity
    for (let i = index - 1; i >= 0; i--) {
      const prevActivity = activities[i]
      if (prevActivity.activityType !== 'lunch' && prevActivity.activityType !== 'break') {
        return prevActivity.status !== 'completed'
      }
    }
    return false
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Day Header */}
      <div className="p-6 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border-b border-amber-100">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-[var(--sh-orange)] text-white px-3 py-1 rounded-full text-sm font-medium">
                Day {dayNumber}
              </span>
              {stats.percentage === 100 && (
                <span className="px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 bg-green-500 text-white">
                  ✓ Complete
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-[var(--sh-black)] mb-2" style={{ fontFamily: 'var(--font-barlow), system-ui, sans-serif' }}>{title}</h2>
            {description && (
              <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
            )}
          </div>

          {/* Progress Ring */}
          <div className="flex flex-col items-center">
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="#e5e7eb"
                  strokeWidth="4"
                  fill="none"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="#ff9419"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${stats.percentage * 1.76} 176`}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-[var(--sh-orange)]">{stats.percentage}%</span>
              </div>
            </div>
            <span className="text-xs mt-1 text-slate-500">
              {stats.completed}/{stats.total} tasks
            </span>
          </div>
        </div>

        {/* Due Date */}
        {dueDate && (
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Due: {dueDate}</span>
          </div>
        )}
      </div>

      {/* Activities List */}
      <div className="p-4 space-y-3">
        {isLocked ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">Day Locked</h3>
            <p className="text-slate-500 text-sm">
              Complete all activities in the previous day to unlock this day.
            </p>
          </div>
        ) : (
          activities.map((activity, index) => (
            <ActivityCard
              key={activity.id}
              {...activity}
              isLocked={getActivityLockStatus(index)}
              onMarkComplete={onMarkComplete}
              onStartActivity={onStartActivity}
            />
          ))
        )}
      </div>

      {/* Day Summary Footer */}
      {!isLocked && stats.percentage === 100 && (
        <div className="p-4" style={{ backgroundColor: '#e9f0fd', borderTop: '1px solid #c4d7f9' }}>
          <div className="flex items-center justify-center gap-2" style={{ color: '#2a6ee8' }}>
            <span className="text-xl">🎉</span>
            <span className="font-medium">Day {dayNumber} Complete!</span>
          </div>
        </div>
      )}
    </div>
  )
}
