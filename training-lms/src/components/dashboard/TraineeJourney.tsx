'use client'

import { useState, useEffect } from 'react'

interface ActivityRecord {
  id: string
  activity_id: string
  activity_title: string
  activity_type: string
  day_number: number
  performance_flag: 'fast' | 'on_time' | 'slow' | 'struggling'
  percentage_of_allocated: number
  created_at: string
  is_coach_led?: boolean
}

interface TrainingModule {
  id: string
  activity_id: string
  activity_title: string
  activity_type: string
  day_number: number
  estimated_duration_minutes: number
  is_coach_led: boolean
}

interface TraineeJourneyProps {
  traineeEmail: string
  traineeName: string
  roleCode: string
  totalDays: number
  currentDay: number
  isCoach?: boolean
}

export default function TraineeJourney({
  traineeEmail,
  traineeName,
  roleCode,
  totalDays,
  currentDay,
  isCoach = false
}: TraineeJourneyProps) {
  const [activities, setActivities] = useState<ActivityRecord[]>([])
  const [modules, setModules] = useState<TrainingModule[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedDay, setExpandedDay] = useState<number | null>(currentDay)
  const [editingActivity, setEditingActivity] = useState<string | null>(null)
  const [editDateTime, setEditDateTime] = useState<string>('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        // Fetch completed activities
        const perfRes = await fetch(
          `/api/training/performance?email=${encodeURIComponent(traineeEmail)}`
        )
        if (perfRes.ok) {
          const perfData = await perfRes.json()
          setActivities(perfData.performance || [])
        }

        // Fetch all modules for the role to show pending ones
        const scheduleRes = await fetch(
          `/api/training/schedule?role=${encodeURIComponent(roleCode)}`
        )
        if (scheduleRes.ok) {
          const scheduleData = await scheduleRes.json()
          setModules(scheduleData.modules || [])
        }
      } catch (err) {
        console.error('Error fetching journey data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [traineeEmail, roleCode])

  // Group activities by day
  const activitiesByDay: Record<number, ActivityRecord[]> = {}
  activities.forEach(a => {
    if (!activitiesByDay[a.day_number]) {
      activitiesByDay[a.day_number] = []
    }
    activitiesByDay[a.day_number].push(a)
  })

  // Group modules by day
  const modulesByDay: Record<number, TrainingModule[]> = {}
  modules.forEach(m => {
    if (!modulesByDay[m.day_number]) {
      modulesByDay[m.day_number] = []
    }
    modulesByDay[m.day_number].push(m)
  })

  // Handle edit for coach-led activities
  const handleEditDateTime = async (activityId: string) => {
    if (!editDateTime) return
    setSaving(true)
    try {
      const res = await fetch('/api/training/performance', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityId,
          traineeEmail,
          completedAt: editDateTime
        })
      })
      if (res.ok) {
        // Refresh activities
        const perfRes = await fetch(
          `/api/training/performance?email=${encodeURIComponent(traineeEmail)}`
        )
        if (perfRes.ok) {
          const perfData = await perfRes.json()
          setActivities(perfData.performance || [])
        }
        setEditingActivity(null)
        setEditDateTime('')
      }
    } catch (err) {
      console.error('Error updating activity:', err)
    } finally {
      setSaving(false)
    }
  }

  const getPerformanceIcon = (flag: string) => {
    switch (flag) {
      case 'fast': return '🚀'
      case 'on_time': return '✅'
      case 'slow': return '🐢'
      case 'struggling': return '⚠️'
      default: return '○'
    }
  }

  const getPerformanceColor = (flag: string) => {
    switch (flag) {
      case 'fast': return 'bg-green-100 border-green-300 text-green-700'
      case 'on_time': return 'bg-blue-100 border-blue-300 text-blue-700'
      case 'slow': return 'bg-yellow-100 border-yellow-300 text-yellow-700'
      case 'struggling': return 'bg-red-100 border-red-300 text-red-700'
      default: return 'bg-gray-100 border-gray-300 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Training Journey</h2>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-3 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Training Journey</h2>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="text-green-500">●</span> Completed</span>
          <span className="flex items-center gap-1"><span className="text-amber-500">●</span> In Progress</span>
          <span className="flex items-center gap-1"><span className="text-gray-300">●</span> Upcoming</span>
        </div>
      </div>

      {/* Day Progress Pills */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {Array.from({ length: totalDays }, (_, i) => i + 1).map(day => {
          const dayActivities = activitiesByDay[day] || []
          const dayModules = modulesByDay[day] || []
          const completedCount = dayActivities.length
          const totalCount = dayModules.length
          const isComplete = completedCount >= totalCount && totalCount > 0
          const isCurrentDay = day === currentDay
          const isFuture = day > currentDay

          return (
            <button
              key={day}
              onClick={() => setExpandedDay(expandedDay === day ? null : day)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg border-2 transition-all ${
                expandedDay === day
                  ? 'border-orange-400 bg-orange-50'
                  : isComplete
                    ? 'border-green-300 bg-green-50'
                    : isCurrentDay
                      ? 'border-amber-300 bg-amber-50'
                      : isFuture
                        ? 'border-gray-200 bg-gray-50 opacity-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <p className="text-xs font-medium text-gray-500">Day {day}</p>
              <p className={`text-sm font-bold ${
                isComplete ? 'text-green-600' : isCurrentDay ? 'text-amber-600' : 'text-gray-600'
              }`}>
                {completedCount}/{totalCount}
              </p>
            </button>
          )
        })}
      </div>

      {/* Expanded Day Details */}
      {expandedDay && (
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Day {expandedDay} Activities</h3>
            <button
              onClick={() => setExpandedDay(null)}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Close
            </button>
          </div>

          <div className="space-y-3">
            {(modulesByDay[expandedDay] || []).map((module, idx) => {
              // Find if this activity is completed
              const completed = activities.find(
                a => a.activity_id === module.activity_id ||
                     (a.activity_title === module.activity_title && a.day_number === module.day_number)
              )
              const isCoachLed = module.is_coach_led

              return (
                <div
                  key={module.id || idx}
                  className={`p-3 rounded-lg border ${
                    completed
                      ? getPerformanceColor(completed.performance_flag)
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-lg">
                        {completed ? getPerformanceIcon(completed.performance_flag) : '○'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`font-medium text-sm ${completed ? '' : 'text-gray-500'}`}>
                            {module.activity_title}
                          </p>
                          {isCoachLed && (
                            <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-medium rounded">
                              Coach-led
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {module.activity_type} • {module.estimated_duration_minutes} min
                        </p>

                        {/* Completion Time */}
                        {completed && (
                          <div className="mt-2">
                            {editingActivity === completed.id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="datetime-local"
                                  value={editDateTime}
                                  onChange={(e) => setEditDateTime(e.target.value)}
                                  className="px-2 py-1 text-xs border border-gray-300 rounded"
                                />
                                <button
                                  onClick={() => handleEditDateTime(completed.id)}
                                  disabled={saving}
                                  className="px-2 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 disabled:opacity-50"
                                >
                                  {saving ? '...' : 'Save'}
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingActivity(null)
                                    setEditDateTime('')
                                  }}
                                  className="px-2 py-1 text-gray-500 text-xs hover:text-gray-700"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">
                                  Completed: {new Date(completed.created_at).toLocaleString()}
                                </span>
                                {isCoach && isCoachLed && (
                                  <button
                                    onClick={() => {
                                      setEditingActivity(completed.id)
                                      setEditDateTime(
                                        new Date(completed.created_at).toISOString().slice(0, 16)
                                      )
                                    }}
                                    className="text-xs text-purple-600 hover:text-purple-800 underline"
                                  >
                                    Edit time
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Performance indicator */}
                        {completed && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs">
                              {completed.percentage_of_allocated}% of allocated time
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status badge */}
                    <div className="flex-shrink-0">
                      {completed ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          completed.performance_flag === 'fast' ? 'bg-green-200 text-green-800' :
                          completed.performance_flag === 'on_time' ? 'bg-blue-200 text-blue-800' :
                          completed.performance_flag === 'slow' ? 'bg-yellow-200 text-yellow-800' :
                          'bg-red-200 text-red-800'
                        }`}>
                          {completed.performance_flag === 'fast' ? 'Early' :
                           completed.performance_flag === 'on_time' ? 'On Time' :
                           completed.performance_flag === 'slow' ? 'Slow' : 'Struggling'}
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {(modulesByDay[expandedDay] || []).length === 0 && (
              <p className="text-center text-gray-500 py-4">No activities scheduled for Day {expandedDay}</p>
            )}
          </div>
        </div>
      )}

      {/* Overall Journey Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-green-600">
              {activities.filter(a => a.performance_flag === 'fast').length}
            </p>
            <p className="text-xs text-gray-500">Early 🚀</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {activities.filter(a => a.performance_flag === 'on_time').length}
            </p>
            <p className="text-xs text-gray-500">On Time ✅</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-600">
              {activities.filter(a => a.performance_flag === 'slow').length}
            </p>
            <p className="text-xs text-gray-500">Slow 🐢</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">
              {activities.filter(a => a.performance_flag === 'struggling').length}
            </p>
            <p className="text-xs text-gray-500">Struggling ⚠️</p>
          </div>
        </div>
      </div>
    </div>
  )
}
