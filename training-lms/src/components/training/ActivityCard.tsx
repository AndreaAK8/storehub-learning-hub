'use client'

import { useState } from 'react'

interface Resource {
  title: string
  url: string
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
  onMarkComplete?: (id: string) => void
  onStartActivity?: (id: string) => void
  // Trainer-only props
  showReschedule?: boolean
  onReschedule?: (id: string, title: string) => void
}

const activityTypeConfig: Record<string, { label: string; color: string; icon: string }> = {
  self_study: { label: 'Self-Study', color: 'bg-blue-100 text-blue-700', icon: '📚' },
  briefing: { label: 'Briefing', color: 'bg-purple-100 text-purple-700', icon: '📋' },
  assessment: { label: 'Assessment', color: 'bg-orange-100 text-orange-700', icon: '📝' },
  lunch: { label: 'Break', color: 'bg-gray-100 text-gray-600', icon: '☕' },
  break: { label: 'Break', color: 'bg-gray-100 text-gray-600', icon: '☕' },
  review_session: { label: 'Review', color: 'bg-teal-100 text-teal-700', icon: '💬' },
  buddy_session: { label: 'Buddy Session', color: 'bg-pink-100 text-pink-700', icon: '👥' },
  mock_test: { label: 'Mock Test', color: 'bg-red-100 text-red-700', icon: '🎯' },
  handover: { label: 'Graduation', color: 'bg-green-100 text-green-700', icon: '🎓' },
  coach_review: { label: 'Coach Review', color: 'bg-indigo-100 text-indigo-700', icon: '👨‍🏫' },
}

const statusConfig = {
  completed: { label: 'Completed', color: 'text-green-600', bgColor: 'bg-green-50 border-green-200', icon: '✓' },
  in_progress: { label: 'In Progress', color: 'text-blue-600', bgColor: 'bg-blue-50 border-blue-200', icon: '⏳' },
  pending: { label: 'Pending', color: 'text-gray-500', bgColor: 'bg-white border-gray-200', icon: '○' },
  skipped: { label: 'Skipped', color: 'text-gray-400', bgColor: 'bg-gray-50 border-gray-200', icon: '—' },
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

  const typeConfig = activityTypeConfig[activityType] || activityTypeConfig.self_study
  const currentStatus = statusConfig[status]

  const handleMarkComplete = async () => {
    if (!onMarkComplete || isCompleting) return
    setIsCompleting(true)
    try {
      await onMarkComplete(id)
    } finally {
      setIsCompleting(false)
    }
  }

  const handleStart = () => {
    if (onStartActivity) {
      onStartActivity(id)
    }
  }

  // Don't show full card for breaks
  if (activityType === 'lunch' || activityType === 'break') {
    return (
      <div className="flex items-center gap-4 py-3 px-4 bg-gray-50 rounded-lg border border-gray-100">
        <div className="text-gray-400 text-sm font-medium w-24">
          {startTime} - {endTime}
        </div>
        <div className="flex items-center gap-2 text-gray-500">
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
        ${isLocked ? 'opacity-60 bg-gray-50 border-gray-200' : currentStatus.bgColor}
        ${status === 'in_progress' ? 'ring-2 ring-blue-200' : ''}
      `}
    >
      {/* Main Content */}
      <div className="p-4">
        {/* Header Row */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3">
            {/* Status Icon */}
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                ${status === 'completed' ? 'bg-green-500 text-white' : ''}
                ${status === 'in_progress' ? 'bg-blue-500 text-white' : ''}
                ${status === 'pending' && !isLocked ? 'bg-gray-200 text-gray-600' : ''}
                ${isLocked ? 'bg-gray-200 text-gray-400' : ''}
              `}
            >
              {isLocked ? '🔒' : currentStatus.icon}
            </div>

            {/* Title & Type */}
            <div>
              <h3 className={`font-semibold ${isLocked ? 'text-gray-400' : 'text-gray-900'}`}>
                {title}
              </h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded-full ${typeConfig.color}`}>
                  {typeConfig.icon} {typeConfig.label}
                </span>
                <span className="text-xs text-gray-500">
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
              className="text-gray-400 hover:text-gray-600 p-1"
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
          <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
            <div className="flex items-start gap-2">
              <span className="text-amber-600">💡</span>
              <div>
                <div className="text-xs font-medium text-amber-700 mb-1">TL;DR</div>
                <p className="text-sm text-amber-900">{tldr}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Criteria (always visible for assessments) */}
        {successCriteria && successCriteria.length > 0 && !isLocked && (
          <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-100">
            <div className="flex items-start gap-2">
              <span className="text-green-600">🎯</span>
              <div>
                <div className="text-xs font-medium text-green-700 mb-1">By the end, you should be able to:</div>
                <ul className="text-sm text-green-900 space-y-1">
                  {successCriteria.map((criteria, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-500">•</span>
                      {criteria}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Expanded Content */}
        {isExpanded && !isLocked && (
          <div className="mt-4 space-y-4">
            {/* Description */}
            {description && (
              <div className="text-sm text-gray-600">
                {description}
              </div>
            )}

            {/* Resources */}
            {resourceLinks && resourceLinks.length > 0 && (
              <div className="border-t pt-3">
                <div className="text-xs font-medium text-gray-500 mb-2">📎 Resources</div>
                <div className="flex flex-wrap gap-2">
                  {resourceLinks.map((resource, index) => (
                    <a
                      key={index}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:underline"
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
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {status === 'pending' && 'Ready to start'}
              {status === 'in_progress' && 'In progress...'}
            </div>
            <div className="flex gap-2">
              {status === 'pending' && onStartActivity && (
                <button
                  onClick={handleStart}
                  className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Start Activity
                </button>
              )}
              {(status === 'pending' || status === 'in_progress') && onMarkComplete && (
                <button
                  onClick={handleMarkComplete}
                  disabled={isCompleting}
                  className={`
                    px-4 py-1.5 text-sm font-medium rounded-lg transition-colors
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
