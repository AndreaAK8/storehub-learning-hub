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

// XP Calculation: 1 hour = 100 XP
function calculateXP(durationHours: number): number {
  return Math.round(durationHours * 100)
}

// Bonus XP for finishing early (within 50% of time)
function calculateBonusXP(durationHours: number): number {
  return Math.round(durationHours * 50)
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

const activityTypeConfig: Record<string, { label: string; color: string; bgColor: string; icon: string }> = {
  self_study: { label: 'Self-Study', color: 'text-indigo-700', bgColor: 'bg-indigo-100', icon: '📚' },
  briefing: { label: 'Briefing', color: 'text-slate-700', bgColor: 'bg-slate-100', icon: '📋' },
  assessment: { label: 'Assessment', color: 'text-amber-700', bgColor: 'bg-amber-100', icon: '📝' },
  lunch: { label: 'Break', color: 'text-slate-600', bgColor: 'bg-slate-100', icon: '☕' },
  break: { label: 'Break', color: 'text-slate-600', bgColor: 'bg-slate-100', icon: '☕' },
  review_session: { label: 'Review', color: 'text-blue-700', bgColor: 'bg-blue-100', icon: '💬' },
  buddy_session: { label: 'Buddy Session', color: 'text-pink-700', bgColor: 'bg-pink-100', icon: '👥' },
  mock_test: { label: 'Mock Test', color: 'text-red-700', bgColor: 'bg-red-100', icon: '🎯' },
  handover: { label: 'Graduation', color: 'text-purple-700', bgColor: 'bg-purple-100', icon: '🎓' },
  coach_review: { label: 'Coach Review', color: 'text-teal-700', bgColor: 'bg-teal-100', icon: '👨‍🏫' },
}

// Progress Ring Component
function ProgressRing({ progress, size = 48, strokeWidth = 4, status }: {
  progress: number
  size?: number
  strokeWidth?: number
  status: 'pending' | 'in_progress' | 'completed' | 'skipped'
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  const getColors = () => {
    switch (status) {
      case 'completed':
        return { stroke: '#22c55e', bg: '#dcfce7', icon: '✓', iconColor: '#16a34a' }
      case 'in_progress':
        return { stroke: '#ff9419', bg: '#fff7ed', icon: '▶', iconColor: '#ea580c' }
      default:
        return { stroke: '#e2e8f0', bg: '#f8fafc', icon: '○', iconColor: '#94a3b8' }
    }
  }

  const colors = getColors()

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill={colors.bg}
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {/* Center icon */}
      <div
        className="absolute inset-0 flex items-center justify-center font-bold text-sm"
        style={{ color: colors.iconColor }}
      >
        {status === 'completed' ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        ) : status === 'in_progress' ? (
          <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse" />
        ) : (
          <span className="text-slate-400">○</span>
        )}
      </div>
    </div>
  )
}

// XP Badge Component
function XPBadge({ xp, bonus, earned, showCelebration }: {
  xp: number
  bonus: number
  earned?: boolean
  showCelebration?: boolean
}) {
  return (
    <div className={`
      flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold text-sm
      transition-all duration-300
      ${earned
        ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-lg shadow-amber-200'
        : 'bg-gradient-to-r from-slate-100 to-slate-50 text-slate-600 border border-slate-200'
      }
      ${showCelebration ? 'animate-bounce scale-110' : ''}
    `}>
      <span className="text-base">{earned ? '⭐' : '✨'}</span>
      <span>{earned ? `+${xp} XP` : `${xp} XP`}</span>
      {bonus > 0 && !earned && (
        <span className="text-xs opacity-70 ml-1">+{bonus} bonus</span>
      )}
    </div>
  )
}

// Celebration Overlay
function CelebrationOverlay({ xp, onComplete }: { xp: number; onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2000)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-2xl z-20 animate-fade-in">
      <div className="text-center">
        <div className="text-5xl mb-2 animate-bounce">🎉</div>
        <div className="text-2xl font-bold text-green-600 animate-pulse">+{xp} XP</div>
        <div className="text-sm text-slate-500 mt-1">Activity Complete!</div>
      </div>
    </div>
  )
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
  const [showCelebration, setShowCelebration] = useState(false)

  const typeConfig = activityTypeConfig[activityType] || activityTypeConfig.self_study
  const xp = calculateXP(durationHours)
  const bonusXP = calculateBonusXP(durationHours)

  // Calculate progress percentage based on status
  const getProgress = () => {
    if (status === 'completed') return 100
    if (status === 'in_progress' && timeRemaining !== null) {
      const total = durationHours * 3600
      const elapsed = total - timeRemaining
      return Math.min(100, Math.max(0, (elapsed / total) * 100))
    }
    return 0
  }

  // Storage key for this activity's start time
  const storageKey = `activity_timer_${id}`

  // Initialize timer from localStorage when activity is in progress
  useEffect(() => {
    if (status === 'in_progress') {
      const storedStartTime = localStorage.getItem(storageKey)
      if (storedStartTime) {
        const startedAt = parseInt(storedStartTime, 10)
        const totalDuration = durationHours * 3600
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
        const now = Date.now()
        localStorage.setItem(storageKey, now.toString())
        setTimeRemaining(durationHours * 3600)
        setIsOvertime(false)
      }
    } else if (status === 'completed') {
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
          return prev + 1
        } else {
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

  const calculatePerformance = (actualSeconds: number, allocatedSeconds: number): ActivityPerformance => {
    const percentage = (actualSeconds / allocatedSeconds) * 100

    let performanceFlag: 'fast' | 'on_time' | 'slow' | 'struggling'

    if (percentage <= 50) {
      performanceFlag = 'fast'
    } else if (percentage <= 100) {
      performanceFlag = 'on_time'
    } else if (percentage <= 150) {
      performanceFlag = 'slow'
    } else {
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
    if (status === 'pending') return

    setIsCompleting(true)
    setShowCelebration(true)

    try {
      const storedStartTime = localStorage.getItem(storageKey)
      let performance: ActivityPerformance | undefined

      if (storedStartTime) {
        const startedAt = parseInt(storedStartTime, 10)
        const actualSeconds = Math.floor((Date.now() - startedAt) / 1000)
        const allocatedSeconds = durationHours * 3600
        performance = calculatePerformance(actualSeconds, allocatedSeconds)
      }

      await onMarkComplete(id, performance)
      localStorage.removeItem(storageKey)
      setTimeRemaining(null)
    } finally {
      setIsCompleting(false)
    }
  }

  const handleStart = useCallback(() => {
    if (onStartActivity) {
      const now = Date.now()
      localStorage.setItem(storageKey, now.toString())
      setTimeRemaining(durationHours * 3600)
      setIsOvertime(false)
      onStartActivity(id)
    }
  }, [onStartActivity, id, durationHours, storageKey])

  // Break card - simple version
  if (activityType === 'lunch' || activityType === 'break') {
    return (
      <div className="flex items-center gap-4 py-3 px-4 bg-slate-50 rounded-xl border border-slate-100">
        <div className="text-slate-400 text-sm font-medium w-24">
          {startTime} - {endTime}
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <span className="text-lg">{typeConfig.icon}</span>
          <span>{title || 'Break'}</span>
        </div>
      </div>
    )
  }

  const hasExpandableContent = description || (successCriteria && successCriteria.length > 0) || (resourceLinks && resourceLinks.length > 0)

  return (
    <div
      className={`
        relative rounded-2xl border-2 transition-all duration-300 overflow-hidden
        ${isLocked
          ? 'opacity-50 bg-slate-50 border-slate-200 grayscale'
          : status === 'completed'
            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg shadow-green-100'
            : status === 'in_progress'
              ? 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-300 shadow-lg shadow-orange-100 ring-2 ring-orange-200 ring-offset-2'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
        }
      `}
    >
      {/* Celebration Overlay */}
      {showCelebration && (
        <CelebrationOverlay xp={xp} onComplete={() => setShowCelebration(false)} />
      )}

      {/* XP Header Bar */}
      <div className={`
        flex items-center justify-between px-4 py-2 border-b
        ${status === 'completed'
          ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-200'
          : status === 'in_progress'
            ? 'bg-gradient-to-r from-orange-100 to-amber-100 border-orange-200'
            : 'bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200'
        }
      `}>
        <XPBadge xp={xp} bonus={bonusXP} earned={status === 'completed'} />

        <div className="flex items-center gap-3 text-xs">
          <span className={`${typeConfig.bgColor} ${typeConfig.color} px-2 py-1 rounded-full font-medium`}>
            {typeConfig.icon} {typeConfig.label}
          </span>
          <span className="text-slate-500 font-medium">
            {durationHours}h • {startTime}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {/* Title Row with Progress Ring */}
        <div className="flex items-start gap-4">
          <ProgressRing
            progress={getProgress()}
            status={status}
            size={52}
            strokeWidth={5}
          />

          <div className="flex-1 min-w-0">
            <h3 className={`font-bold text-lg leading-tight ${isLocked ? 'text-slate-400' : 'text-slate-900'}`}>
              {title}
            </h3>

            {isRescheduled && rescheduledFrom && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 mt-1 rounded-full bg-orange-100 text-orange-700">
                📅 Moved from Day {rescheduledFrom}
              </span>
            )}

            {/* TL;DR Preview */}
            {tldr && !isLocked && (
              <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                {tldr}
              </p>
            )}
          </div>

          {/* Reschedule Button (Trainer only) */}
          {showReschedule && onReschedule && status !== 'completed' && (
            <button
              onClick={() => onReschedule(id, title)}
              className="text-xs px-2 py-1 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-lg transition-colors flex items-center gap-1"
              title="Reschedule this activity"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
          )}
        </div>

        {/* Success Criteria Preview (collapsed) */}
        {successCriteria && successCriteria.length > 0 && !isLocked && !isExpanded && (
          <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100">
            <div className="flex items-center gap-2 text-sm font-semibold text-indigo-700 mb-1">
              <span>🎯</span>
              <span>Goals</span>
            </div>
            <p className="text-sm text-indigo-600 line-clamp-1">
              {successCriteria.slice(0, 2).join(' • ')}
              {successCriteria.length > 2 && ` +${successCriteria.length - 2} more`}
            </p>
          </div>
        )}

        {/* Expand Button - Clear Call to Action */}
        {hasExpandableContent && !isLocked && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`
              w-full mt-4 py-2.5 px-4 rounded-xl text-sm font-medium
              flex items-center justify-center gap-2 transition-all duration-200
              ${isExpanded
                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                : 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white hover:from-indigo-600 hover:to-blue-600 shadow-md shadow-indigo-200'
              }
            `}
          >
            {isExpanded ? (
              <>
                <span>Hide Details</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </>
            ) : (
              <>
                <span>View Full Details</span>
                <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </>
            )}
          </button>
        )}

        {/* Expanded Content */}
        {isExpanded && !isLocked && (
          <div className="mt-4 space-y-4 animate-fade-in">
            {/* Full TL;DR */}
            {tldr && (
              <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <div className="text-sm font-bold text-amber-800 mb-1">TL;DR</div>
                    <p className="text-base text-amber-900 leading-relaxed">{tldr}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Full Success Criteria */}
            {successCriteria && successCriteria.length > 0 && (
              <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-200">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🎯</span>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-indigo-800 mb-2">By the end, you should be able to:</div>
                    <ul className="space-y-2">
                      {successCriteria.map((criteria, index) => (
                        <li key={index} className="flex items-start gap-2 text-base text-indigo-900">
                          <span className="w-5 h-5 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                            {index + 1}
                          </span>
                          <span>{criteria}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            {description && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📖</span>
                  <div>
                    <div className="text-sm font-bold text-slate-700 mb-1">Description</div>
                    <p className="text-base text-slate-600 leading-relaxed">{description}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Resources */}
            {resourceLinks && resourceLinks.length > 0 && (
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                <div className="text-sm font-bold text-emerald-800 mb-3 flex items-center gap-2">
                  <span className="text-lg">📎</span>
                  <span>Resources</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {resourceLinks.map((resource, index) => (
                    <a
                      key={index}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white text-emerald-700 hover:text-emerald-900 rounded-lg border border-emerald-200 hover:border-emerald-300 transition-all hover:shadow-md text-sm font-medium"
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
        <div className="border-t-2 px-4 py-4 bg-gradient-to-r from-slate-50 to-slate-100">
          {/* Timer Display - In Progress */}
          {status === 'in_progress' && timeRemaining !== null && (
            <div className={`mb-4 p-4 rounded-xl ${isOvertime ? 'bg-red-50 border-2 border-red-200' : 'bg-white border-2 border-slate-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isOvertime ? 'bg-red-100' : 'bg-indigo-100'}`}>
                    <svg className={`w-5 h-5 ${isOvertime ? 'text-red-600' : 'text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className={`text-xs font-semibold uppercase tracking-wide ${isOvertime ? 'text-red-600' : 'text-indigo-600'}`}>
                      {isOvertime ? '⚠️ Overtime' : '⏱️ Time Left'}
                    </div>
                    <div className={`text-2xl font-bold font-mono ${isOvertime ? 'text-red-600' : 'text-slate-900'}`}>
                      {isOvertime && '+'}{formatTimeRemaining(timeRemaining).display}
                    </div>
                  </div>
                </div>

                {/* Bonus XP Indicator */}
                {!isOvertime && timeRemaining > (durationHours * 3600 * 0.5) && (
                  <div className="text-right">
                    <div className="text-xs text-amber-600 font-semibold">🚀 Speed Bonus</div>
                    <div className="text-sm text-amber-700 font-bold">+{bonusXP} XP available</div>
                  </div>
                )}
              </div>

              {/* Progress bar */}
              <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${isOvertime ? 'bg-red-500' : 'bg-gradient-to-r from-indigo-500 to-blue-500'}`}
                  style={{
                    width: isOvertime ? '100%' : `${Math.max(0, Math.min(100, 100 - (timeRemaining / (durationHours * 3600)) * 100))}%`
                  }}
                />
              </div>

              {isOvertime && (
                <p className="mt-2 text-xs text-red-600">
                  Take your time to complete properly. Quality over speed! 💪
                </p>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-500">
              {status === 'pending' && (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                  Ready to start • Earn <span className="font-semibold text-indigo-600">{xp} XP</span>
                </span>
              )}
            </div>

            <div className="flex gap-2">
              {status === 'pending' && onStartActivity && (
                <button
                  onClick={handleStart}
                  className="px-6 py-3 text-sm font-bold bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700 rounded-xl transition-all shadow-lg shadow-indigo-200 hover:shadow-xl hover:scale-105 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Start Activity
                </button>
              )}

              {status === 'in_progress' && onMarkComplete && (
                <button
                  onClick={handleMarkComplete}
                  disabled={isCompleting}
                  className={`
                    px-6 py-3 text-sm font-bold rounded-xl transition-all flex items-center gap-2
                    ${isCompleting
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-200 hover:shadow-xl hover:scale-105'
                    }
                  `}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {isCompleting ? 'Saving...' : 'Complete & Claim XP'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Completed Footer */}
      {status === 'completed' && !isLocked && (
        <div className="border-t-2 border-green-200 px-4 py-3 bg-gradient-to-r from-green-100 to-emerald-100">
          <div className="flex items-center justify-center gap-2 text-green-700 font-semibold">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Completed</span>
            <span className="text-green-600">•</span>
            <span className="text-amber-600">+{xp} XP earned!</span>
          </div>
        </div>
      )}

      {/* Locked Overlay */}
      {isLocked && (
        <div className="px-4 py-3 bg-slate-100 border-t-2 border-slate-200">
          <div className="text-sm text-slate-500 flex items-center justify-center gap-2">
            <span className="text-lg">🔒</span>
            <span>Complete previous activities to unlock</span>
          </div>
        </div>
      )}
    </div>
  )
}
