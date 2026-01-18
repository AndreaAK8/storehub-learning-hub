'use client'

import { useState, useEffect, useCallback } from 'react'

interface Resource {
  title: string
  url: string
}

// Performance tracking data
export interface ActivityPerformance {
  activityId: string
  activityTitle: string
  allocatedSeconds: number
  actualSeconds: number
  performanceFlag: 'fast' | 'on_time' | 'slow' | 'struggling'
  percentageOfAllocated: number
}

interface ActivityCardProps {
  id: string
  title: string
  description: string
  startTime: string
  endTime: string
  durationHours: number
  activityType: string
  status: 'pending' | 'in_progress' | 'completed' | 'skipped'
  pic: string
  resourceLinks?: Resource[]
  successCriteria?: string[]
  tldr?: string
  isLocked?: boolean
  isRescheduled?: boolean
  rescheduledFrom?: number
  onMarkComplete?: (id: string, performance?: ActivityPerformance) => void
  onStartActivity?: (id: string) => void
  // Trainer-only props
  showReschedule?: boolean
  onReschedule?: (id: string, title: string) => void
}

// Helper function to format time remaining
function formatTimeRemaining(seconds: number): { hours: number; minutes: number; secs: number; display: string } {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return { hours, minutes, secs, display: `${hours}h ${minutes}m ${secs}s` }
  } else if (minutes > 0) {
    return { hours, minutes, secs, display: `${minutes}m ${secs}s` }
  }
  return { hours, minutes, secs, display: `${secs}s` }
}

const activityTypeConfig: Record<string, { label: string; color: string; icon: string }> = {
  self_study: { label: 'Self-Study', color: 'bg-blue-100 text-blue-700', icon: '📚' },
  briefing: { label: 'Briefing', color: 'bg-slate-100 text-slate-700', icon: '📋' },
  assessment: { label: 'Assessment', color: 'bg-amber-100 text-amber-700', icon: '📝' },
  lunch: { label: 'Break', color: 'bg-slate-100 text-slate-600', icon: '☕' },
  break: { label: 'Break', color: 'bg-slate-100 text-slate-600', icon: '☕' },
  review_session: { label: 'Review', color: 'bg-blue-100 text-blue-700', icon: '💬' },
  buddy_session: { label: 'Buddy Session', color: 'bg-pink-100 text-pink-700', icon: '👥' },
  mock_test: { label: 'Mock Test', color: 'bg-red-100 text-red-700', icon: '🎯' },
  handover: { label: 'Graduation', color: 'bg-blue-100 text-blue-700', icon: '🎓' },
  coach_review: { label: 'Coach Review', color: 'bg-slate-100 text-slate-700', icon: '👨‍🏫' },
}

const statusConfig = {
  completed: { label: 'Completed', color: 'text-blue-600', bgColor: 'bg-blue-50 border-blue-200', icon: '✓' },
  in_progress: { label: 'In Progress', color: 'text-orange-600', bgColor: 'bg-orange-50 border-orange-200', icon: '⏳' },
  pending: { label: 'Pending', color: 'text-slate-500', bgColor: 'bg-white border-slate-200', icon: '○' },
  skipped: { label: 'Skipped', color: 'text-slate-400', bgColor: 'bg-slate-50 border-slate-200', icon: '—' },
}

export function ActivityCard({
  id,
  title,
  description,
  startTime,
  endTime,
  durationHours,
  activityType,
  status,
  pic,
  resourceLinks,
  successCriteria,
  tldr,
  isLocked,
  isRescheduled,
  rescheduledFrom,
  onMarkComplete,
  onStartActivity,
  showReschedule,
  onReschedule,
}: ActivityCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [isOvertime, setIsOvertime] = useState(false)

  const typeConfig = activityTypeConfig[activityType] || activityTypeConfig.self_study
  const currentStatus = statusConfig[status]

  // Storage key for this activity's start time
  const storageKey = `activity_timer_${id}`

  // Initialize timer from localStorage when activity is in progress
  useEffect(() => {
    if (status === 'in_progress') {
      const storedStartTime = localStorage.getItem(storageKey)
      if (storedStartTime) {
        const startedAt = parseInt(storedStartTime, 10)
        const totalDuration = durationHours * 3600 // Convert hours to seconds
        const elapsed = Math.floor((Date.now() - startedAt) / 1000)
        const remaining = totalDuration - elapsed

        if (remaining > 0) {
          setTimeRemaining(remaining)
          setIsOvertime(false)
        } else {
          setTimeRemaining(Math.abs(remaining))
          setIsOvertime(true)
        }
      } else {
        // Activity was started but no timer stored (edge case), start fresh
        const now = Date.now()
        localStorage.setItem(storageKey, now.toString())
        setTimeRemaining(durationHours * 3600)
        setIsOvertime(false)
      }
    } else if (status === 'completed') {
      // Clear timer when completed
      localStorage.removeItem(storageKey)
      setTimeRemaining(null)
      setIsOvertime(false)
    }
  }, [status, id, durationHours, storageKey])

  // Countdown timer effect
  useEffect(() => {
    if (status !== 'in_progress' || timeRemaining === null) return

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null) return null

        if (isOvertime) {
          // Count up when overtime
          return prev + 1
        } else {
          // Count down
          if (prev <= 1) {
            setIsOvertime(true)
            return 1
          }
          return prev - 1
        }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [status, timeRemaining, isOvertime])

  // Calculate performance flag based on time spent
  const calculatePerformance = (actualSeconds: number, allocatedSeconds: number): ActivityPerformance => {
    const percentage = (actualSeconds / allocatedSeconds) * 100

    let performanceFlag: 'fast' | 'on_time' | 'slow' | 'struggling'

    if (percentage <= 50) {
      // Finished in less than half the time - fast learner
      performanceFlag = 'fast'
    } else if (percentage <= 100) {
      // Finished within allocated time - on track
      performanceFlag = 'on_time'
    } else if (percentage <= 150) {
      // Took up to 50% more time - slow learner
      performanceFlag = 'slow'
    } else {
      // Took more than 150% of allocated time - struggling
      performanceFlag = 'struggling'
    }

    return {
      activityId: id,
      activityTitle: title,
      allocatedSeconds,
      actualSeconds,
      performanceFlag,
      percentageOfAllocated: Math.round(percentage)
    }
  }

  const handleMarkComplete = async () => {
    if (!onMarkComplete || isCompleting) return

    // Must start activity first
    if (status === 'pending') {
      return
    }

    setIsCompleting(true)
    try {
      // Calculate performance based on time spent
      const storedStartTime = localStorage.getItem(storageKey)
      let performance: ActivityPerformance | undefined

      if (storedStartTime) {
        const startedAt = parseInt(storedStartTime, 10)
        const actualSeconds = Math.floor((Date.now() - startedAt) / 1000)
        const allocatedSeconds = durationHours * 3600
        performance = calculatePerformance(actualSeconds, allocatedSeconds)
      }

      await onMarkComplete(id, performance)
      // Clear timer on completion
      localStorage.removeItem(storageKey)
      setTimeRemaining(null)
    } finally {
      setIsCompleting(false)
    }
  }

  const handleStart = useCallback(() => {
    if (onStartActivity) {
      // Store start time in localStorage
      const now = Date.now()
      localStorage.setItem(storageKey, now.toString())
      // Initialize timer
      setTimeRemaining(durationHours * 3600)
      setIsOvertime(false)
      onStartActivity(id)
    }
  }, [onStartActivity, id, durationHours, storageKey])

  // Don't show full card for breaks
  if (activityType === 'lunch' || activityType === 'break') {
    return (
      <div className="flex items-center gap-4 py-3 px-4 bg-slate-50 rounded-lg border border-slate-100">
        <div className="text-slate-400 text-sm font-medium w-24">
          {startTime} - {endTime}
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <span>{typeConfig.icon}</span>
          <span>{title || 'Break'}</span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`
        rounded-xl border transition-all duration-200
        ${isLocked ? 'opacity-60 bg-slate-50 border-slate-200' : currentStatus.bgColor}
        ${status === 'in_progress' ? 'ring-2 ring-orange-200' : ''}
      `}
    >
      {/* Main Content */}
      <div className="p-4">
        {/* Header Row */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3">
            {/* Status Icon */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
              style={{
                backgroundColor: status === 'completed' ? '#2a6ee8' : status === 'in_progress' ? '#ff9419' : '#e2e8f0',
                color: status === 'completed' || status === 'in_progress' ? 'white' : isLocked ? '#94a3b8' : '#475569'
              }}
            >
              {isLocked ? '🔒' : currentStatus.icon}
            </div>

            {/* Title & Type */}
            <div>
              <h3 className={`font-semibold ${isLocked ? 'text-slate-400' : 'text-slate-900'}`}>
                {title}
              </h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded-full ${typeConfig.color}`}>
                  {typeConfig.icon} {typeConfig.label}
                </span>
                <span className="text-xs text-slate-500">
                  {durationHours}h • {startTime} - {endTime}
                </span>
                {isRescheduled && rescheduledFrom && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                    📅 Moved from Day {rescheduledFrom}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Reschedule Button (Trainer only) */}
          {showReschedule && onReschedule && status !== 'completed' && (
            <button
              onClick={() => onReschedule(id, title)}
              className="text-xs px-2 py-1 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded transition-colors flex items-center gap-1"
              title="Reschedule this activity"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Reschedule
            </button>
          )}

          {/* Expand Toggle */}
          {!isLocked && (description || successCriteria?.length || resourceLinks?.length) && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <svg
                className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>

        {/* TL;DR (always visible) */}
        {tldr && !isLocked && (
          <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-100">
            <div className="flex items-start gap-3">
              <span className="text-amber-600 text-lg">💡</span>
              <div>
                <div className="text-sm font-semibold text-amber-700 mb-2">TL;DR</div>
                <p className="text-base text-amber-900 leading-7 tracking-wide">{tldr}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Criteria (always visible for assessments) */}
        {successCriteria && successCriteria.length > 0 && !isLocked && (
          <div className="mt-4 p-4 rounded-lg border" style={{ backgroundColor: '#e9f0fd', borderColor: '#c4d7f9' }}>
            <div className="flex items-start gap-3">
              <span className="text-lg" style={{ color: '#2a6ee8' }}>🎯</span>
              <div>
                <div className="text-sm font-semibold mb-3" style={{ color: '#1e5bb8' }}>By the end, you should be able to:</div>
                <ul className="text-base space-y-3" style={{ color: '#1e4080' }}>
                  {successCriteria.map((criteria, index) => (
                    <li key={index} className="flex items-start gap-3 leading-7">
                      <span className="mt-1" style={{ color: '#2a6ee8' }}>•</span>
                      <span className="tracking-wide">{criteria}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Expanded Content */}
        {isExpanded && !isLocked && (
          <div className="mt-5 space-y-5">
            {/* Description */}
            {description && (
              <div className="text-base text-gray-600 leading-7 tracking-wide">
                {description}
              </div>
            )}

            {/* Resources */}
            {resourceLinks && resourceLinks.length > 0 && (
              <div className="border-t pt-4 mt-4">
                <div className="text-sm font-semibold text-gray-500 mb-3">📎 Resources</div>
                <div className="flex flex-wrap gap-3">
                  {resourceLinks.map((resource, index) => (
                    <a
                      key={index}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-base text-blue-600 hover:text-blue-800 hover:underline py-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      {resource.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Footer */}
      {!isLocked && status !== 'completed' && (
        <div className="border-t px-4 py-3 bg-gray-50 rounded-b-xl">
          {/* Timer Display */}
          {status === 'in_progress' && timeRemaining !== null && (
            <div className={`mb-3 p-3 rounded-lg ${isOvertime ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isOvertime ? 'bg-red-100' : 'bg-blue-100'}`}>
                    <svg className={`w-4 h-4 ${isOvertime ? 'text-red-600' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className={`text-xs font-medium ${isOvertime ? 'text-red-700' : 'text-blue-700'}`}>
                      {isOvertime ? 'Overtime' : 'Time Remaining'}
                    </div>
                    <div className={`text-lg font-bold font-mono ${isOvertime ? 'text-red-600' : 'text-blue-600'}`}>
                      {isOvertime && '+'}{formatTimeRemaining(timeRemaining).display}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Allocated</div>
                  <div className="text-sm font-medium text-gray-700">{durationHours}h</div>
                </div>
              </div>
              {/* Progress bar */}
              {!isOvertime && (
                <div className="mt-2">
                  <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                      style={{
                        width: `${Math.max(0, Math.min(100, (timeRemaining / (durationHours * 3600)) * 100))}%`
                      }}
                    />
                  </div>
                </div>
              )}
              {isOvertime && (
                <div className="mt-2 text-xs text-red-600">
                  You&apos;ve exceeded the allocated time. Take your time to complete properly.
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {status === 'pending' && `Ready to start • ${durationHours}h allocated`}
              {status === 'in_progress' && !timeRemaining && 'In progress...'}
            </div>
            <div className="flex gap-2">
              {status === 'pending' && onStartActivity && (
                <button
                  onClick={handleStart}
                  className="px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Start Activity
                </button>
              )}
              {/* Only show Mark Complete after activity is started */}
              {status === 'in_progress' && onMarkComplete && (
                <button
                  onClick={handleMarkComplete}
                  disabled={isCompleting}
                  className={`
                    px-4 py-2 text-sm font-medium rounded-lg transition-colors
                    ${isCompleting
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                    }
                  `}
                >
                  {isCompleting ? 'Saving...' : 'Mark Complete ✓'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Locked Overlay Message */}
      {isLocked && (
        <div className="px-4 py-3 bg-gray-100 rounded-b-xl border-t border-gray-200">
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <span>🔒</span>
            <span>Complete previous activities to unlock</span>
          </div>
        </div>
      )}
    </div>
  )
}
