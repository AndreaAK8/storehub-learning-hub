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
      case 'fast': return 'bg-[#e9f0fd] border-[#9dbcf4] text-[#2a6ee8]'
      case 'on_time': return 'bg-[#e9f0fd] border-[#9dbcf4] text-[#2a6ee8]'
      case 'slow': return 'bg-[#fff4e8] border-[#ffce95] text-[#ff9419]'
      case 'struggling': return 'bg-[#ffeef0] border-[#ffcfd7] text-[#ff546f]'
      default: return 'bg-[#eae9e8] border-[#a09d9a] text-[#7a7672]'
    }
  }

  if (loading) {
    return (
      <div className="bg-[#f5f5f4] rounded-xl shadow-sm border border-[#eae9e8] p-6">
        <h2 className="text-lg font-semibold text-[#2f2922] mb-4">Training journey</h2>
        <div className="flex items-center justify-center py-12">
          <div className="w-5 h-5 rounded-full border-2 border-[#eae9e8] border-t-[#ff9419] animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#f5f5f4] rounded-xl shadow-sm border border-[#eae9e8] p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-[#2f2922]">Training journey</h2>
        <div className="flex items-center gap-4 text-xs text-[#7a7672]">
          <span className="flex items-center gap-1"><span className="text-[#2a6ee8]">●</span> Completed</span>
          <span className="flex items-center gap-1"><span className="text-[#ff9419]">●</span> In progress</span>
          <span className="flex items-center gap-1"><span className="text-[#c5c3c1]">●</span> Upcoming</span>
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
                  ? 'border-[#ff9419] bg-[#fff4e8]'
                  : isComplete
                    ? 'border-[#9dbcf4] bg-[#e9f0fd]'
                    : isCurrentDay
                      ? 'border-[#ffce95] bg-[#fff4e8]'
                      : isFuture
                        ? 'border-[#eae9e8] bg-[#f5f5f4] opacity-50'
                        : 'border-[#eae9e8] bg-white hover:border-[#a09d9a]'
              }`}
            >
              <p className="text-xs font-medium text-[#7a7672]">Day {day}</p>
              <p className={`text-sm font-bold ${
                isComplete ? 'text-[#2a6ee8]' : isCurrentDay ? 'text-[#ff9419]' : 'text-[#55504a]'
              }`}>
                {completedCount}/{totalCount}
              </p>
            </button>
          )
        })}
      </div>

      {/* Expanded Day Details */}
      {expandedDay && (
        <div className="border-t border-[#c5c3c1] pt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#2f2922]">Day {expandedDay} Activities</h3>
            <button
              onClick={() => setExpandedDay(null)}
              className="text-xs text-[#a09d9a] hover:text-[#55504a]"
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
                      : 'bg-white border-[#c5c3c1]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-lg">
                        {completed ? getPerformanceIcon(completed.performance_flag) : '○'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`font-medium text-sm ${completed ? '' : 'text-[#7a7672]'}`}>
                            {module.activity_title}
                          </p>
                          {isCoachLed && (
                            <span className="px-1.5 py-0.5 bg-[#55504a] text-[#55504a] text-[10px] font-medium rounded">
                              Coach-led
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#7a7672] mt-0.5">
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
                                  className="px-2 py-1 text-xs border border-[#a09d9a] rounded"
                                />
                                <button
                                  onClick={() => handleEditDateTime(completed.id)}
                                  disabled={saving}
                                  className="px-2 py-1 bg-[#55504a] text-white text-xs rounded hover:bg-[#55504a] disabled:opacity-50"
                                >
                                  {saving ? '...' : 'Save'}
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingActivity(null)
                                    setEditDateTime('')
                                  }}
                                  className="px-2 py-1 text-[#7a7672] text-xs hover:text-[#55504a]"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-[#7a7672]">
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
                                    className="text-xs text-[#55504a] hover:text-[#55504a] underline"
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
                          completed.performance_flag === 'fast' ? 'bg-[#e9f0fd] text-[#2a6ee8]' :
                          completed.performance_flag === 'on_time' ? 'bg-blue-200 text-blue-800' :
                          completed.performance_flag === 'slow' ? 'bg-[#fff4e8] text-[#ff9419]' :
                          'bg-[#ffeef0] text-[#ff546f]'
                        }`}>
                          {completed.performance_flag === 'fast' ? 'Early' :
                           completed.performance_flag === 'on_time' ? 'On Time' :
                           completed.performance_flag === 'slow' ? 'Slow' : 'Struggling'}
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-[#eae9e8] text-[#7a7672] rounded-full text-xs">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {(modulesByDay[expandedDay] || []).length === 0 && (
              <p className="text-center text-[#7a7672] py-4">No activities scheduled for Day {expandedDay}</p>
            )}
          </div>
        </div>
      )}

      {/* Overall Journey Stats */}
      <div className="mt-6 pt-4 border-t border-[#c5c3c1]">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-[#2a6ee8]">
              {activities.filter(a => a.performance_flag === 'fast').length}
            </p>
            <p className="text-xs text-[#7a7672]">Early 🚀</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {activities.filter(a => a.performance_flag === 'on_time').length}
            </p>
            <p className="text-xs text-[#7a7672]">On Time ✅</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#ff9419]">
              {activities.filter(a => a.performance_flag === 'slow').length}
            </p>
            <p className="text-xs text-[#7a7672]">Slow 🐢</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#ff546f]">
              {activities.filter(a => a.performance_flag === 'struggling').length}
            </p>
            <p className="text-xs text-[#7a7672]">Struggling ⚠️</p>
          </div>
        </div>
      </div>
    </div>
  )
}
