'use client'

import { useEffect, useCallback } from 'react'
import { VideoPlayer, isVideoUrl, isGoogleFormUrl, isEmbeddableUrl } from './VideoPlayer'

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

interface ActivityDetailModalProps {
  isOpen: boolean
  onClose: () => void
  activity: {
    id: string
    title: string
    description: string
    startTime: string
    endTime: string
    durationHours: number
    activityType: string
    status: 'pending' | 'in_progress' | 'completed' | 'skipped'
    resourceLinks?: Resource[]
    successCriteria?: string[]
    successCriteriaRaw?: string // Full text with formatting preserved
    parsedCriteria?: ParsedCriteriaItem[] // Structured format
    checklist?: ChecklistItem[]
    slideImage?: string // URL to slide screenshot
    isTrainerLed?: boolean
    isCoachLed?: boolean
  }
  onStart?: () => void
  onComplete?: () => void
}

const activityTypeConfig: Record<string, { label: string; color: string; bgColor: string; icon: string }> = {
  self_study:     { label: 'Self Study',     color: 'text-[#2a6ee8]', bgColor: 'bg-[#e9f0fd]', icon: '📖' },
  assignment:     { label: 'Assignment',     color: 'text-[#2a6ee8]', bgColor: 'bg-[#e9f0fd]', icon: '📋' },
  assessment:     { label: 'Assessment',     color: 'text-[#ff630f]', bgColor: 'bg-[#fff4e8]', icon: '📝' },
  trainer_led:    { label: 'Trainer Led',    color: 'text-[#2f2922]', bgColor: 'bg-[#f0ede9]', icon: '👨‍🏫' },
  coach_led:      { label: 'Coach Led',      color: 'text-[#2f2922]', bgColor: 'bg-[#f0ede9]', icon: '🧑‍💼' },
  buddy_led:      { label: 'Buddy Led',      color: 'text-[#c43155]', bgColor: 'bg-[#ffeef0]', icon: '👥' },
  briefing:       { label: 'Briefing',       color: 'text-[#2f2922]', bgColor: 'bg-[#f0ede9]', icon: '📢' },
  buddy_session:  { label: 'Buddy Session',  color: 'text-[#c43155]', bgColor: 'bg-[#ffeef0]', icon: '👥' },
  review_session: { label: 'Review',         color: 'text-[#2a6ee8]', bgColor: 'bg-[#e9f0fd]', icon: '💬' },
  coach_review:   { label: 'Coach Review',   color: 'text-[#2f2922]', bgColor: 'bg-[#f0ede9]', icon: '✍️' },
  mock_test:      { label: 'Mock Test',      color: 'text-[#c43155]', bgColor: 'bg-[#ffeef0]', icon: '🎯' },
  handover:       { label: 'Graduation',     color: 'text-[#ff630f]', bgColor: 'bg-[#fff4e8]', icon: '🎓' },
  lunch:          { label: 'Break',          color: 'text-[#7a7672]', bgColor: 'bg-[#eae9e8]', icon: '☕' },
  break:          { label: 'Break',          color: 'text-[#7a7672]', bgColor: 'bg-[#eae9e8]', icon: '☕' },
}

// Group resources by region
function groupResourcesByRegion(resources: Resource[]): Record<string, Resource[]> {
  const grouped: Record<string, Resource[]> = {
    ALL: [],
    MY: [],
    PH: [],
  }

  resources.forEach(resource => {
    const region = resource.region || 'ALL'
    if (grouped[region]) {
      grouped[region].push(resource)
    } else {
      grouped.ALL.push(resource)
    }
  })

  return grouped
}

export function ActivityDetailModal({
  isOpen,
  onClose,
  activity,
  onStart,
  onComplete,
}: ActivityDetailModalProps) {
  const typeConfig = activityTypeConfig[activity.activityType] || activityTypeConfig.self_study
  const isTrainerOrCoachLed = activity.isTrainerLed || activity.isCoachLed ||
    activity.activityType === 'trainer_led' || activity.activityType === 'coach_led'

  // Group resources by region
  const groupedResources = activity.resourceLinks ? groupResourcesByRegion(activity.resourceLinks) : null
  const hasResources = groupedResources && (
    groupedResources.ALL.length > 0 ||
    groupedResources.MY.length > 0 ||
    groupedResources.PH.length > 0
  )

  // Handle escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, handleKeyDown])

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-[250ms]"
        style={{ opacity: isOpen ? 1 : 0 }}
        onClick={onClose}
      />

      {/* Drawer — slides in from right */}
      <div
        className="relative bg-white w-[480px] max-w-full h-full shadow-2xl flex flex-col transition-transform duration-[250ms] ease-out"
        style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 border-b flex items-start justify-between"
          style={{
            background: activity.status === 'completed' ? '#e9f0fd' : activity.status === 'in_progress' ? '#fff4e8' : '#f5f5f4',
            borderColor: activity.status === 'completed' ? '#c4d7f9' : activity.status === 'in_progress' ? '#ffe1bf' : '#c5c3c1',
          }}
        >
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-2">
              <span className={`${typeConfig.bgColor} ${typeConfig.color} px-2.5 py-1 rounded-full text-xs font-semibold`}>
                {typeConfig.icon} {typeConfig.label}
              </span>
              {activity.status === 'completed' && (
                <span className="bg-[#e9f0fd] text-[#2a6ee8] px-2.5 py-1 rounded-full text-xs font-semibold">
                  ✓ Completed
                </span>
              )}
              {activity.status === 'in_progress' && (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: '#fff4e8', color: '#ff9419' }}>
                  ● In Progress
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-[#2f2922]">{activity.title}</h2>
            <div className="flex items-center gap-3 mt-2 text-sm text-[#55504a]">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {activity.startTime} - {activity.endTime}
              </span>
              {/* Only show duration for non Trainer/Coach Led */}
              {!isTrainerOrCoachLed && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {activity.durationHours}h allocated
                </span>
              )}
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#eae9e8] rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-[#7a7672]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Slide Screenshot */}
          {activity.slideImage && (
            <div className="rounded-xl overflow-hidden border border-[#c5c3c1] shadow-sm">
              <img
                src={activity.slideImage}
                alt={`${activity.title} slide`}
                className="w-full h-auto"
              />
            </div>
          )}

          {/* Description */}
          {activity.description && (
            <div className="p-4 bg-[#f5f5f4] rounded-xl border border-[#c5c3c1]">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📖</span>
                <div className="flex-1">
                  <div className="text-sm font-bold text-[#55504a] mb-2">What You'll Do</div>
                  <div className="text-base text-[#55504a] leading-relaxed whitespace-pre-line">
                    {activity.description}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Success Criteria - Structured Display */}
          {activity.parsedCriteria && activity.parsedCriteria.length > 0 ? (
            <div className="p-4 rounded-xl" style={{ background: '#e9f0fd', border: '1px solid #c4d7f9' }}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎯</span>
                <div className="flex-1">
                  <div className="text-sm font-bold text-[#2f2922] mb-3">Your Goal</div>
                  <div className="space-y-1">
                    {activity.parsedCriteria.map((item, index) => {
                      // Different styling based on item type
                      if (item.type === 'header') {
                        return (
                          <div
                            key={index}
                            className="font-semibold text-[#2f2922] mt-4 first:mt-0 text-base"
                            style={{ paddingLeft: `${item.indent * 1}rem` }}
                          >
                            {item.text}
                          </div>
                        )
                      }

                      if (item.type === 'numbered') {
                        return (
                          <div
                            key={index}
                            className="flex items-start gap-2 text-base text-[#2f2922]"
                            style={{ paddingLeft: `${item.indent * 1}rem` }}
                          >
                            <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5" style={{ background: '#2a6ee8', color: 'white' }}>
                              {activity.parsedCriteria!.filter((i, idx) => idx <= index && i.type === 'numbered' && i.indent === item.indent).length}
                            </span>
                            <span>{item.text}</span>
                          </div>
                        )
                      }

                      if (item.type === 'bullet' || item.type === 'sub-bullet') {
                        return (
                          <div
                            key={index}
                            className="flex items-start gap-2 text-sm text-[#2f2922]"
                            style={{ paddingLeft: `${(item.indent + 1) * 1}rem` }}
                          >
                            <span className="text-[#2f2922] flex-shrink-0 mt-0.5">•</span>
                            <span>{item.text}</span>
                          </div>
                        )
                      }

                      // Regular text
                      return (
                        <div
                          key={index}
                          className="text-sm text-[#2f2922]"
                          style={{ paddingLeft: `${(item.indent + 1) * 1}rem` }}
                        >
                          {item.text}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : activity.successCriteria && activity.successCriteria.length > 0 ? (
            // Fallback to simple list
            <div className="p-4 rounded-xl" style={{ background: '#e9f0fd', border: '1px solid #c4d7f9' }}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎯</span>
                <div className="flex-1">
                  <div className="text-sm font-bold text-[#2f2922] mb-3">Your Goal</div>
                  <ul className="space-y-2">
                    {activity.successCriteria.map((criteria, index) => (
                      <li key={index} className="flex items-start gap-3 text-base text-[#2f2922]">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5" style={{ background: '#2a6ee8', color: 'white' }}>
                          {index + 1}
                        </span>
                        <span>{criteria}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : null}

          {/* Checklist (for BackOffice Assignment, etc.) */}
          {activity.checklist && activity.checklist.length > 0 && (
            <div className="p-4 rounded-xl" style={{ background: '#fff4e8', border: '1px solid #ffe1bf' }}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">✅</span>
                <div className="flex-1">
                  <div className="text-sm font-bold text-[#ff9419] mb-3">Checklist</div>
                  <ul className="space-y-2">
                    {activity.checklist.map((item) => (
                      <li
                        key={item.id}
                        className={`
                          flex items-start gap-2 text-base
                          ${item.isHeader ? 'font-semibold text-[#ff9419] mt-3 first:mt-0' : 'text-[#ff9419]'}
                        `}
                        style={{ paddingLeft: item.indent ? `${item.indent * 1.5}rem` : 0 }}
                      >
                        {!item.isHeader && (
                          <span className="w-5 h-5 rounded border-2 border-amber-300 flex-shrink-0 mt-0.5" />
                        )}
                        <span>{item.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Resources - Grouped by Region */}
          {hasResources && (
            <div className="p-4 rounded-xl" style={{ background: '#f5f5f4', border: '1px solid #c5c3c1' }}>
              <div className="text-sm font-bold text-[#2a6ee8] mb-4 flex items-center gap-2">
                <span className="text-lg">📎</span>
                <span>Resources</span>
              </div>

              <div className="space-y-4">
                {/* All/General Resources */}
                {groupedResources!.ALL.length > 0 && (
                  <div className="space-y-3">
                    {groupedResources!.ALL.map((resource, index) => (
                      isEmbeddableUrl(resource.url) ? (
                        <div key={index} className="space-y-2">
                          <div className="text-sm font-medium text-[#2a6ee8]">{resource.title}</div>
                          <VideoPlayer url={resource.url} title={resource.title} />
                        </div>
                      ) : (
                        <a
                          key={index}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 px-4 py-3 bg-white text-[#2a6ee8] hover:text-[#2a6ee8] rounded-lg border border-emerald-200 hover:border-emerald-300 transition-all hover:shadow-md"
                        >
                          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          <span className="font-medium">{resource.title}</span>
                        </a>
                      )
                    ))}
                  </div>
                )}

                {/* MY Resources */}
                {groupedResources!.MY.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-[#2a6ee8] tracking-wide mb-2 flex items-center gap-2">
                      <span className="w-6 h-4 rounded overflow-hidden">
                        🇲🇾
                      </span>
                      Malaysia
                    </div>
                    <div className="space-y-3">
                      {groupedResources!.MY.map((resource, index) => (
                        isEmbeddableUrl(resource.url) ? (
                          <div key={index} className="space-y-2">
                            <div className="text-sm font-medium text-[#2a6ee8]">{resource.title}</div>
                            <VideoPlayer url={resource.url} title={resource.title} />
                          </div>
                        ) : (
                          <a
                            key={index}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-4 py-3 bg-white text-[#2a6ee8] hover:text-[#2a6ee8] rounded-lg border border-emerald-200 hover:border-emerald-300 transition-all hover:shadow-md"
                          >
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            <span className="font-medium">{resource.title}</span>
                          </a>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {/* PH Resources */}
                {groupedResources!.PH.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-[#2a6ee8] tracking-wide mb-2 flex items-center gap-2">
                      <span className="w-6 h-4 rounded overflow-hidden">
                        🇵🇭
                      </span>
                      Philippines
                    </div>
                    <div className="space-y-3">
                      {groupedResources!.PH.map((resource, index) => (
                        isEmbeddableUrl(resource.url) ? (
                          <div key={index} className="space-y-2">
                            <div className="text-sm font-medium text-[#2a6ee8]">{resource.title}</div>
                            <VideoPlayer url={resource.url} title={resource.title} />
                          </div>
                        ) : (
                          <a
                            key={index}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-4 py-3 bg-white text-[#2a6ee8] hover:text-[#2a6ee8] rounded-lg border border-emerald-200 hover:border-emerald-300 transition-all hover:shadow-md"
                          >
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            <span className="font-medium">{resource.title}</span>
                          </a>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {activity.status !== 'completed' && (
          <div className="px-6 py-4 border-t border-[#c5c3c1]" style={{ background: '#f5f5f4' }}>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-medium text-[#55504a] hover:text-[#2f2922] hover:bg-[#eae9e8] rounded-xl transition-colors"
              >
                Close
              </button>

              {activity.status === 'pending' && onStart && !isTrainerOrCoachLed && (
                <button
                  onClick={() => {
                    onStart()
                    onClose()
                  }}
                  className="px-6 py-2.5 text-sm font-bold text-white rounded-xl transition-all flex items-center gap-2 hover:opacity-90"
                  style={{ background: '#ff9419' }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Start Activity
                </button>
              )}

              {activity.status === 'in_progress' && onComplete && (
                <button
                  onClick={() => {
                    onComplete()
                    onClose()
                  }}
                  className="px-6 py-2.5 text-sm font-bold text-white rounded-xl transition-all flex items-center gap-2 hover:opacity-90"
                  style={{ background: '#2a6ee8' }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Mark Complete
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
