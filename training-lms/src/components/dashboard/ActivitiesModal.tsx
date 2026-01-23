'use client'

import { useState, useEffect } from 'react'

// Map full role names to short codes
const ROLE_CODE_MAP: Record<string, string> = {
  'Onboarding Coordinator': 'OC',
  'Customer Success Manager': 'CSM',
  'Business Consultant': 'BC',
  'Merchant Care': 'MC',
  'Merchant Consultant': 'MC',
  'Technical Support': 'TS',
  'Onboarding Specialist': 'OS',
  'Sales Consultant': 'SC',
  'OC': 'OC',
  'CSM': 'CSM',
  'BC': 'BC',
  'MC': 'MC',
  'TS': 'TS',
  'OS': 'OS',
  'SC': 'SC',
}

function getRoleShortCode(role: string): string {
  return ROLE_CODE_MAP[role] || role
}

interface Activity {
  id: string
  dayNumber: number
  title: string
  type: string
  status: 'completed' | 'in_progress' | 'pending'
  allocatedMinutes: number
  actualMinutes?: number
  performanceFlag?: 'fast' | 'on_time' | 'slow' | 'struggling'
  completedAt?: string
  reflection?: {
    confusingTopic: string
    improvementNotes: string
    confidenceLevel: number
  }
  coachRemarks?: string
  extensionDays?: number
  extensionReason?: string
}

interface DayGroup {
  dayNumber: number
  activities: Activity[]
  completedCount: number
  totalCount: number
}

interface ActivitiesModalProps {
  isOpen: boolean
  onClose: () => void
  traineeEmail: string
  traineeName: string
  roleCode: string
  currentDay: number
}

export default function ActivitiesModal({
  isOpen,
  onClose,
  traineeEmail,
  traineeName,
  roleCode,
  currentDay
}: ActivitiesModalProps) {
  const [loading, setLoading] = useState(true)
  const [dayGroups, setDayGroups] = useState<DayGroup[]>([])
  const [expandedDay, setExpandedDay] = useState<number | null>(null)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [showRemarkModal, setShowRemarkModal] = useState(false)
  const [showExtendModal, setShowExtendModal] = useState(false)
  const [remark, setRemark] = useState('')
  const [extensionDays, setExtensionDays] = useState(1)
  const [extensionReason, setExtensionReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all')

  useEffect(() => {
    if (isOpen) {
      fetchActivities()
      setExpandedDay(currentDay)
    }
  }, [isOpen, traineeEmail, roleCode])

  const fetchActivities = async () => {
    setLoading(true)
    try {
      const shortCode = getRoleShortCode(roleCode)

      const scheduleRes = await fetch(`/api/training/schedule?role=${shortCode}&email=${traineeEmail}`)
      const scheduleData = await scheduleRes.json()

      const perfRes = await fetch(`/api/training/performance?email=${traineeEmail}`)
      const perfData = await perfRes.json()

      const reflectionsRes = await fetch(`/api/training/reflections?email=${traineeEmail}`)
      const reflectionsData = await reflectionsRes.json()

      const perfLookup = new Map<string, {
        actualSeconds: number
        performanceFlag: string
        completedAt: string
      }>()
      perfData.performance?.forEach((p: { activity_id: string; actual_seconds: number; performance_flag: string; created_at: string }) => {
        perfLookup.set(p.activity_id, {
          actualSeconds: p.actual_seconds,
          performanceFlag: p.performance_flag,
          completedAt: p.created_at
        })
      })

      const reflectionsLookup = new Map<number, {
        confusingTopic: string
        improvementNotes: string
        confidenceLevel: number
      }>()
      reflectionsData.reflections?.forEach((r: { day_number: number; confusing_topic: string; improvement_notes: string; confidence_level: number }) => {
        reflectionsLookup.set(r.day_number, {
          confusingTopic: r.confusing_topic,
          improvementNotes: r.improvement_notes,
          confidenceLevel: r.confidence_level
        })
      })

      const groups: DayGroup[] = (scheduleData.trainingDays || []).map((day: { dayNumber: number; activities: { id: string; title: string; activityType: string; durationHours: number; status: string }[] }) => {
        const activities: Activity[] = day.activities.map(act => {
          const perf = perfLookup.get(act.id)
          const dayReflection = reflectionsLookup.get(day.dayNumber)

          return {
            id: act.id,
            dayNumber: day.dayNumber,
            title: act.title,
            type: act.activityType,
            status: perf ? 'completed' : (day.dayNumber <= currentDay ? 'in_progress' : 'pending'),
            allocatedMinutes: Math.round((act.durationHours || 0) * 60),
            actualMinutes: perf ? Math.round(perf.actualSeconds / 60) : undefined,
            performanceFlag: perf?.performanceFlag as Activity['performanceFlag'],
            completedAt: perf?.completedAt,
            reflection: dayReflection
          } as Activity
        })

        return {
          dayNumber: day.dayNumber,
          activities,
          completedCount: activities.filter(a => a.status === 'completed').length,
          totalCount: activities.length
        }
      })

      setDayGroups(groups)
    } catch (error) {
      console.error('Error fetching activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveRemark = async () => {
    if (!selectedActivity || !remark.trim()) return
    setSaving(true)
    try {
      await fetch('/api/coaching-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          traineeEmail,
          activityId: selectedActivity.id,
          note: remark,
          category: 'activity_feedback'
        })
      })
      setShowRemarkModal(false)
      setRemark('')
      setSelectedActivity(null)
      fetchActivities()
    } catch (error) {
      console.error('Error saving remark:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleExtendDeadline = async () => {
    if (!selectedActivity) return
    setSaving(true)
    try {
      await fetch('/api/training/extend-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          traineeEmail,
          activityId: selectedActivity.id,
          extensionDays,
          reason: extensionReason
        })
      })
      setShowExtendModal(false)
      setExtensionDays(1)
      setExtensionReason('')
      setSelectedActivity(null)
      fetchActivities()
    } catch (error) {
      console.error('Error extending deadline:', error)
    } finally {
      setSaving(false)
    }
  }

  const getPerformanceEmoji = (flag?: string) => {
    switch (flag) {
      case 'fast': return '🚀'
      case 'on_time': return '✅'
      case 'slow': return '🐢'
      case 'struggling': return '⚠️'
      default: return ''
    }
  }

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '-'
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  const getDayEmoji = (dayNumber: number) => {
    const emojis = ['🌱', '📚', '💪', '🎯', '🏆']
    return emojis[(dayNumber - 1) % emojis.length]
  }

  const totalCompleted = dayGroups.reduce((sum, g) => sum + g.completedCount, 0)
  const totalActivities = dayGroups.reduce((sum, g) => sum + g.totalCount, 0)
  const overallProgress = totalActivities > 0 ? Math.round((totalCompleted / totalActivities) * 100) : 0

  const filteredDayGroups = dayGroups.map(group => ({
    ...group,
    activities: group.activities.filter(a => {
      if (filter === 'all') return true
      if (filter === 'completed') return a.status === 'completed'
      return a.status !== 'completed'
    })
  })).filter(g => g.activities.length > 0)

  if (!isOpen) return null

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

          <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden">
            {/* Gradient Header */}
            <div className="relative bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 px-6 py-5">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex items-center gap-4">
                {/* Progress Circle */}
                <div className="relative w-20 h-20">
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle cx="40" cy="40" r="34" stroke="rgba(255,255,255,0.3)" strokeWidth="6" fill="none" />
                    <circle
                      cx="40" cy="40" r="34"
                      stroke="white"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={`${overallProgress * 2.136} 213.6`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-white">{overallProgress}%</span>
                  </div>
                </div>

                <div className="text-white">
                  <h2 className="text-2xl font-bold">{traineeName}&apos;s Journey</h2>
                  <p className="text-white/80 text-sm">{getRoleShortCode(roleCode)} Training Progress</p>
                  <p className="text-white/90 font-medium mt-1">{totalCompleted} of {totalActivities} activities completed</p>
                </div>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="px-6 py-4 bg-gradient-to-b from-gray-50 to-white border-b flex items-center gap-3">
              {(['all', 'completed', 'pending'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    filter === f
                      ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-200'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {f === 'all' ? '📋 All' : f === 'completed' ? '✅ Completed' : '⏳ Pending'}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-6 bg-gray-50" style={{ maxHeight: 'calc(85vh - 200px)' }}>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
                  <p className="mt-4 text-gray-500 font-medium">Loading activities...</p>
                </div>
              ) : filteredDayGroups.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-4xl">📭</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-700">No activities found</p>
                  <p className="text-sm mt-1">Training schedule may not be configured yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredDayGroups.map(group => {
                    const dayProgress = Math.round((group.completedCount / group.totalCount) * 100)
                    const isComplete = group.completedCount === group.totalCount
                    const isActive = group.dayNumber <= currentDay

                    return (
                      <div
                        key={group.dayNumber}
                        className={`rounded-xl overflow-hidden transition-all ${
                          isComplete
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200'
                            : isActive
                            ? 'bg-white border-2 border-orange-200 shadow-lg shadow-orange-100'
                            : 'bg-white border border-gray-200'
                        }`}
                      >
                        {/* Day Header */}
                        <button
                          onClick={() => setExpandedDay(expandedDay === group.dayNumber ? null : group.dayNumber)}
                          className="w-full px-5 py-4 flex items-center justify-between transition-colors hover:bg-black/5"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm ${
                              isComplete
                                ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                                : isActive
                                ? 'bg-gradient-to-br from-orange-400 to-pink-500'
                                : 'bg-gray-200'
                            }`}>
                              {isComplete ? '✓' : getDayEmoji(group.dayNumber)}
                            </div>
                            <div className="text-left">
                              <h3 className="font-bold text-gray-900 text-lg">Day {group.dayNumber}</h3>
                              <p className="text-sm text-gray-500">{group.totalCount} activities</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            {/* Mini Progress Bar */}
                            <div className="hidden sm:flex items-center gap-3">
                              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    isComplete ? 'bg-green-500' : 'bg-orange-500'
                                  }`}
                                  style={{ width: `${dayProgress}%` }}
                                />
                              </div>
                              <span className={`text-sm font-semibold ${isComplete ? 'text-green-600' : 'text-gray-600'}`}>
                                {group.completedCount}/{group.totalCount}
                              </span>
                            </div>

                            <svg
                              className={`w-5 h-5 text-gray-400 transition-transform ${expandedDay === group.dayNumber ? 'rotate-180' : ''}`}
                              fill="none" viewBox="0 0 24 24" stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </button>

                        {/* Activities List */}
                        {expandedDay === group.dayNumber && (
                          <div className="px-5 pb-4 space-y-3">
                            {group.activities.map(activity => (
                              <div
                                key={activity.id}
                                className={`p-4 rounded-xl transition-all ${
                                  activity.status === 'completed'
                                    ? 'bg-white border border-green-200'
                                    : activity.status === 'in_progress'
                                    ? 'bg-orange-50 border border-orange-200'
                                    : 'bg-gray-50 border border-gray-200'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                      {activity.status === 'completed' ? (
                                        <span className="text-lg">✅</span>
                                      ) : activity.status === 'in_progress' ? (
                                        <span className="text-lg">🔄</span>
                                      ) : (
                                        <span className="text-lg opacity-50">⭕</span>
                                      )}
                                      <h4 className="font-semibold text-gray-900">{activity.title}</h4>
                                      {activity.performanceFlag && (
                                        <span className="text-lg" title={activity.performanceFlag}>
                                          {getPerformanceEmoji(activity.performanceFlag)}
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 ml-7">
                                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                                        activity.type === 'assessment' ? 'bg-purple-100 text-purple-700' :
                                        activity.type === 'trainer_led' ? 'bg-blue-100 text-blue-700' :
                                        activity.type === 'self_study' ? 'bg-amber-100 text-amber-700' :
                                        'bg-gray-100 text-gray-700'
                                      }`}>
                                        {activity.type.replace('_', ' ')}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        ⏱️ {formatDuration(activity.allocatedMinutes)}
                                      </span>
                                      {activity.actualMinutes !== undefined && activity.actualMinutes > 0 && (
                                        <span className="text-xs text-gray-500">
                                          → Took {formatDuration(activity.actualMinutes)}
                                        </span>
                                      )}
                                    </div>

                                    {/* Reflection */}
                                    {activity.status === 'completed' && activity.reflection && (
                                      <div className="mt-3 ml-7 p-3 bg-blue-50 rounded-lg">
                                        <p className="text-xs font-medium text-blue-700 mb-1">💭 Self Reflection</p>
                                        {activity.reflection.confusingTopic && (
                                          <p className="text-sm text-gray-700">
                                            <span className="text-gray-500">Struggled with:</span> {activity.reflection.confusingTopic}
                                          </p>
                                        )}
                                        <div className="flex items-center gap-1 mt-2">
                                          <span className="text-xs text-gray-500">Confidence:</span>
                                          {[1, 2, 3, 4, 5].map(level => (
                                            <span
                                              key={level}
                                              className={`text-sm ${level <= activity.reflection!.confidenceLevel ? '' : 'opacity-30'}`}
                                            >
                                              ⭐
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Actions */}
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => {
                                        setSelectedActivity(activity)
                                        setShowRemarkModal(true)
                                      }}
                                      className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                      title="Add Remark"
                                    >
                                      💬
                                    </button>
                                    {activity.status !== 'completed' && (
                                      <button
                                        onClick={() => {
                                          setSelectedActivity(activity)
                                          setShowExtendModal(true)
                                        }}
                                        className="p-2 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                                        title="Extend Deadline"
                                      >
                                        ⏰
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Remark Modal */}
      {showRemarkModal && selectedActivity && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowRemarkModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-1">💬 Add Remark</h3>
            <p className="text-sm text-gray-500 mb-4">{selectedActivity.title}</p>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Enter your feedback or coaching notes..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 resize-none"
              rows={4}
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setShowRemarkModal(false)
                  setRemark('')
                  setSelectedActivity(null)
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRemark}
                disabled={!remark.trim() || saving}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Remark'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Extend Modal */}
      {showExtendModal && selectedActivity && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowExtendModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-1">⏰ Extend Deadline</h3>
            <p className="text-sm text-gray-500 mb-4">{selectedActivity.title}</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Extension (days)</label>
                <input
                  type="number"
                  min={1}
                  max={7}
                  value={extensionDays}
                  onChange={(e) => setExtensionDays(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                <select
                  value={extensionReason}
                  onChange={(e) => setExtensionReason(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300"
                >
                  <option value="">Select reason...</option>
                  <option value="needs_more_time">Needs more time to learn</option>
                  <option value="sick_leave">Sick leave</option>
                  <option value="external_factor">External factor</option>
                  <option value="coach_unavailable">Coach unavailable</option>
                  <option value="technical_issue">Technical issue</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowExtendModal(false)
                  setExtensionDays(1)
                  setExtensionReason('')
                  setSelectedActivity(null)
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleExtendDeadline}
                disabled={!extensionReason || saving}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Extend'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
