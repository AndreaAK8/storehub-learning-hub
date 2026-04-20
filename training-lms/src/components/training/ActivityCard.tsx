'use client'

import { useState, useEffect, useCallback } from 'react'
import { ActivityDetailModal } from './ActivityDetailModal'

interface Resource {
  title: string
  url: string
  region?: 'MY' | 'PH' | 'ALL'
}

interface ChecklistItem {
  id: string
  text: string
  isHeader?: boolean
  indent?: number
}

interface ParsedCriteriaItem {
  text: string
  type: 'header' | 'numbered' | 'bullet' | 'sub-bullet' | 'text'
  indent: number
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
  successCriteriaRaw?: string // Full text with formatting preserved
  parsedCriteria?: ParsedCriteriaItem[] // Structured format for display
  checklist?: ChecklistItem[]
  slideImage?: string
  isLocked?: boolean
  isRescheduled?: boolean
  rescheduledFrom?: number
  onMarkComplete?: (id: string, performance?: ActivityPerformance) => void
  onStartActivity?: (id: string) => void
  // Trainer-only props
  showReschedule?: boolean
  onReschedule?: (id: string, title: string) => void
  // Hide timer for Trainer/Coach Led
  hideTimer?: boolean
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
  self_study:     { label: 'Self-Study',    color: 'text-[#2a6ee8]', bgColor: 'bg-[#e9f0fd]', icon: '📖' },
  assignment:     { label: 'Assignment',    color: 'text-[#2a6ee8]', bgColor: 'bg-[#e9f0fd]', icon: '📋' },
  assessment:     { label: 'Assessment',    color: 'text-[#ff630f]', bgColor: 'bg-[#fff4e8]', icon: '📝' },
  trainer_led:    { label: 'Trainer Led',   color: 'text-[#2f2922]', bgColor: 'bg-[#f0ede9]', icon: '👨‍🏫' },
  coach_led:      { label: 'Coach Led',     color: 'text-[#2f2922]', bgColor: 'bg-[#f0ede9]', icon: '🧑‍💼' },
  buddy_led:      { label: 'Buddy Led',     color: 'text-[#c43155]', bgColor: 'bg-[#ffeef0]', icon: '👥' },
  briefing:       { label: 'Briefing',      color: 'text-[#2f2922]', bgColor: 'bg-[#f0ede9]', icon: '📢' },
  buddy_session:  { label: 'Buddy Session', color: 'text-[#c43155]', bgColor: 'bg-[#ffeef0]', icon: '👥' },
  review_session: { label: 'Review',        color: 'text-[#2a6ee8]', bgColor: 'bg-[#e9f0fd]', icon: '💬' },
  coach_review:   { label: 'Coach Review',  color: 'text-[#2f2922]', bgColor: 'bg-[#f0ede9]', icon: '✍️' },
  mock_test:      { label: 'Mock Test',     color: 'text-[#c43155]', bgColor: 'bg-[#ffeef0]', icon: '🎯' },
  handover:       { label: 'Graduation',    color: 'text-[#ff630f]', bgColor: 'bg-[#fff4e8]', icon: '🎓' },
  lunch:          { label: 'Break',         color: 'text-[#7a7672]',  bgColor: 'bg-[#eae9e8]', icon: '☕' },
  break:          { label: 'Break',         color: 'text-[#7a7672]',  bgColor: 'bg-[#eae9e8]', icon: '☕' },
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
        return { stroke: '#2a6ee8', bg: '#e9f0fd', icon: '✓', iconColor: '#2a6ee8' }
      case 'in_progress':
        return { stroke: '#ff9419', bg: '#fff4e8', icon: '▶', iconColor: '#ff9419' }
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
          <span className="text-[#a09d9a]">○</span>
        )}
      </div>
    </div>
  )
}

// Duration Badge — replaces XP, shows time investment
function DurationBadge({ durationHours, completed }: { durationHours: number; completed?: boolean }) {
  const hours = Math.floor(durationHours)
  const mins = Math.round((durationHours - hours) * 60)
  const label = hours > 0 ? (mins > 0 ? `${hours}h ${mins}m` : `${hours}h`) : `${mins}m`
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-300 ${
      completed
        ? 'bg-[#e9f0fd] text-[#2a6ee8] border-[#c4d7f9]'
        : 'bg-[#f5f5f4] text-[#7a7672] border-[#c5c3c1]'
    }`}>
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{label}</span>
    </div>
  )
}

// Completion Flash — subtle brand pulse, replaces bouncing emoji
function CompletionFlash({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1400)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="absolute inset-0 flex items-center justify-center rounded-2xl z-20" style={{ background: 'rgba(255,148,25,0.08)' }}>
      <div className="flex items-center gap-3 bg-white rounded-2xl px-6 py-4 shadow-lg border border-[#ffce95]">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#fff4e8' }}>
          <svg className="w-6 h-6" style={{ color: '#ff9419' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <div className="font-bold text-sm" style={{ color: '#2f2922' }}>Module complete</div>
          <div className="text-xs text-[#a09d9a]">Progress saved</div>
        </div>
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
  successCriteriaRaw,
  parsedCriteria,
  checklist,
  slideImage,
  isLocked,
  isRescheduled,
  rescheduledFrom,
  onMarkComplete,
  onStartActivity,
  showReschedule,
  onReschedule,
  hideTimer,
}: ActivityCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [isOvertime, setIsOvertime] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)

  const typeConfig = activityTypeConfig[activityType] || activityTypeConfig.self_study

  // Only these activity types should have Start Activity button and Timer
  const TIMED_ACTIVITY_TYPES = ['self_study', 'assignment', 'assessment']
  const showTimerAndStart = !hideTimer && TIMED_ACTIVITY_TYPES.includes(activityType)

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

  // Countdown timer effect - calculates from stored start time to handle tab switching
  useEffect(() => {
    if (status !== 'in_progress') return

    const updateTimer = () => {
      const storedStartTime = localStorage.getItem(storageKey)
      if (!storedStartTime) return

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
    }

    // Update immediately
    updateTimer()

    // Update every second
    const interval = setInterval(updateTimer, 1000)

    // Also update when tab becomes visible again (handles tab switching)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateTimer()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [status, durationHours, storageKey])

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
      <div className="flex items-center gap-4 py-3 px-4 bg-[#f5f5f4] rounded-xl border border-[#eae9e8]">
        <div className="text-[#a09d9a] text-sm font-medium w-24">
          {startTime} - {endTime}
        </div>
        <div className="flex items-center gap-2 text-[#7a7672]">
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
          ? 'opacity-50 bg-[#f5f5f4] border-[#c5c3c1] grayscale'
          : status === 'completed'
            ? 'border-[#c4d7f9] shadow-sm'
            : status === 'in_progress'
              ? 'bg-[#fffaf4] border-[#ffaa55] shadow-md shadow-orange-50 ring-2 ring-[#ffe1bf] ring-offset-2'
              : 'bg-white border-[#c5c3c1] hover:border-[#ffce95] hover:shadow-md'
        }
      `}
    >
      {/* Completion Flash */}
      {showCelebration && (
        <CompletionFlash onComplete={() => setShowCelebration(false)} />
      )}

      {/* Activity Meta Bar */}
      <div className={`flex items-center justify-between px-4 py-2.5 border-b ${
        status === 'completed' ? 'bg-[#e9f0fd] border-[#c4d7f9]'
        : status === 'in_progress' ? 'bg-[#fff9f2] border-[#ffbb6c]'
        : 'bg-[#f5f5f4] border-[#c5c3c1]'
      }`}>
        <DurationBadge durationHours={durationHours} completed={status === 'completed'} />
        <div className="flex items-center gap-2 text-xs">
          <span className={`${typeConfig.bgColor} ${typeConfig.color} px-2.5 py-1 rounded-full font-semibold`}>
            {typeConfig.icon} {typeConfig.label}
          </span>
          <span className="text-[#a09d9a]">{startTime}–{endTime}</span>
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
            <h3 className={`font-bold text-lg leading-tight ${isLocked ? 'text-[#a09d9a]' : 'text-[#2f2922]'}`}>
              {title}
            </h3>

            {isRescheduled && rescheduledFrom && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 mt-1 rounded-full bg-orange-100 text-orange-700">
                📅 Moved from Day {rescheduledFrom}
              </span>
            )}

            {/* Brief description preview - first 100 chars */}
            {description && !isLocked && (
              <p className="text-sm text-[#55504a] mt-2 line-clamp-2">
                {description.slice(0, 120)}{description.length > 120 ? '...' : ''}
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
        {successCriteria && successCriteria.length > 0 && !isLocked && (
          <div className="mt-4 p-3 rounded-xl bg-[#fff4e8] border border-[#ffce95]">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#ff630f] mb-1">
              <span>🎯</span>
              <span>Goals</span>
            </div>
            <p className="text-sm text-[#ff7a30] line-clamp-1">
              {successCriteria.slice(0, 2).join(' • ')}
              {successCriteria.length > 2 && ` +${successCriteria.length - 2} more`}
            </p>
          </div>
        )}

        {/* View Details Button - Opens Modal */}
        {hasExpandableContent && !isLocked && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full mt-4 py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 text-white hover:opacity-90 shadow-sm"
            style={{ backgroundColor: '#2f2922' }}
          >
            <span>View Full Details</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        )}

      </div>

      {/* Action Footer — hidden for passive types (trainer/coach-led) when still pending */}
      {!isLocked && status !== 'completed' && (status !== 'pending' || showTimerAndStart) && (
        <div className="border-t px-4 py-4 bg-[#fffaf4] border-[#ffe1bf]">
          {/* Timer Display - Only for Self Study, Assignment, Assessment */}
          {status === 'in_progress' && timeRemaining !== null && showTimerAndStart && (
            <div className={`mb-4 p-4 rounded-xl border ${isOvertime ? 'bg-[#ffeef0] border-[#ffcfd7]' : 'bg-white border-[#ffe1bf]'}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isOvertime ? 'bg-[#ffeef0]' : 'bg-[#fff4e8]'}`}>
                  <svg className={`w-4 h-4 ${isOvertime ? 'text-[#ff546f]' : 'text-[#ff9419]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className={`text-xs font-semibold tracking-wide ${isOvertime ? 'text-[#ff546f]' : 'text-[#ff9419]'}`}>
                    {isOvertime ? 'Overtime' : 'Time remaining'}
                  </div>
                  <div className={`text-xl font-bold ${isOvertime ? 'text-[#ff546f]' : 'text-[#2f2922]'}`}>
                    {isOvertime && '+'}{formatTimeRemaining(timeRemaining).display}
                  </div>
                </div>
              </div>
              <div className="w-full h-2 bg-[#eae9e8] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: isOvertime ? '100%' : `${Math.max(0, Math.min(100, 100 - (timeRemaining / (durationHours * 3600)) * 100))}%`,
                    backgroundColor: isOvertime ? '#ef4444' : '#ff9419'
                  }}
                />
              </div>
              {isOvertime && (
                <p className="mt-2 text-xs text-[#ff546f]">Take your time — quality over speed.</p>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="text-sm text-[#7a7672]">
              {status === 'pending' && (
                <span className="flex items-center gap-2 text-[#a09d9a]">
                  <span className="w-2 h-2 rounded-full bg-[#a09d9a]"></span>
                  Ready to start
                </span>
              )}
            </div>

            <div className="flex gap-2">
              {/* Start Activity button - Only for Self Study, Assignment, Assessment */}
              {status === 'pending' && onStartActivity && showTimerAndStart && (
                <button
                  onClick={handleStart}
                  className="px-6 py-2.5 text-sm font-bold text-white rounded-xl transition-all hover:opacity-90 hover:scale-105 flex items-center gap-2 shadow-sm"
                  style={{ backgroundColor: '#ff9419' }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Begin
                </button>
              )}

              {status === 'in_progress' && onMarkComplete && (
                <button
                  onClick={handleMarkComplete}
                  disabled={isCompleting}
                  className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${
                    isCompleting ? 'bg-[#c5c3c1] text-[#a09d9a] cursor-not-allowed' : 'text-white hover:opacity-90 hover:scale-105 shadow-sm'
                  }`}
                  style={!isCompleting ? { backgroundColor: '#2f2922' } : {}}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {isCompleting ? 'Saving...' : 'Mark as Complete'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Completed Footer */}
      {status === 'completed' && !isLocked && (
        <div className="border-t px-4 py-3" style={{ background: '#e9f0fd', borderColor: '#c4d7f9' }}>
          <div className="flex items-center justify-center gap-2 font-semibold" style={{ color: '#2a6ee8' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <span>Completed</span>
          </div>
        </div>
      )}

      {/* Locked Overlay */}
      {isLocked && (
        <div className="px-4 py-3 bg-[#eae9e8] border-t-2 border-[#c5c3c1]">
          <div className="text-sm text-[#7a7672] flex items-center justify-center gap-2">
            <span className="text-lg">🔒</span>
            <span>Complete previous activities to unlock</span>
          </div>
        </div>
      )}

      {/* Activity Detail Modal */}
      <ActivityDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        activity={{
          id,
          title,
          description,
          startTime,
          endTime,
          durationHours,
          activityType,
          status,
          resourceLinks,
          successCriteria,
          successCriteriaRaw,
          parsedCriteria,
          checklist,
          slideImage,
          isTrainerLed: activityType === 'trainer_led' || activityType === 'briefing',
          isCoachLed: activityType === 'coach_led',
        }}
        onStart={onStartActivity ? () => handleStart() : undefined}
        onComplete={onMarkComplete ? () => handleMarkComplete() : undefined}
      />
    </div>
  )
}
