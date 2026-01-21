'use client'

import { useMemo, useState } from 'react'

interface TrainingDay {
  dayNumber: number
  title: string
  activities: { status: string; activityType: string }[]
}

interface TrainingRoadmapProps {
  roleName: string
  totalDays: number
  trainingDays: TrainingDay[]
  trainingStartDate?: string
  currentDay: number
  onDayClick: (dayNumber: number) => void
  selectedDay: number
}


export function TrainingRoadmap({
  roleName,
  totalDays,
  trainingDays,
  trainingStartDate,
  currentDay,
  onDayClick,
  selectedDay,
}: TrainingRoadmapProps) {
  const [showPlan, setShowPlan] = useState(true) // Default open
  // Calculate day statuses (excluding lunch/break activities)
  const dayStatuses = useMemo(() => {
    return trainingDays.map((day) => {
      // Filter out lunch and break activities
      const trackableActivities = day.activities.filter(
        (a) => a.activityType !== 'lunch' && a.activityType !== 'break'
      )

      const allCompleted = trackableActivities.length > 0 &&
        trackableActivities.every((a) => a.status === 'completed')
      const anyInProgress = trackableActivities.some((a) => a.status === 'in_progress')
      const anyCompleted = trackableActivities.some((a) => a.status === 'completed')

      if (allCompleted) return 'completed'
      if (anyInProgress || anyCompleted) return 'in_progress'
      return 'pending' // Changed from 'locked' - all days viewable
    })
  }, [trainingDays])

  // Calculate expected completion date
  const expectedCompletion = useMemo(() => {
    if (!trainingStartDate) return null
    const start = new Date(trainingStartDate)
    start.setDate(start.getDate() + totalDays - 1)
    return start.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }, [trainingStartDate, totalDays])

  // Calculate due date for each day
  const getDueDate = (dayNumber: number) => {
    if (!trainingStartDate) return null
    const start = new Date(trainingStartDate)
    start.setDate(start.getDate() + dayNumber - 1)
    return start.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  // All days are now unlocked - trainees can view any day for briefing purposes
  // On rare occasions, the schedule might change and tasks may need to be brought forward
  const isDayUnlocked = (_dayNumber: number) => {
    return true // All days accessible
  }

  return (
    <div className="mb-6">
      {/* Your Training Plan - Collapsible Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <button
          onClick={() => setShowPlan(!showPlan)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">📅</span>
            </div>
            <div className="text-left">
              <h3 className="font-bold text-lg text-slate-800">Your Training Plan</h3>
              <p className="text-slate-500 text-sm">{roleName} • {totalDays} Days</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {showPlan ? 'Hide' : 'Expand'}
            </span>
            <svg
              className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${showPlan ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {/* Expandable Content */}
        <div className={`transition-all duration-300 ease-in-out ${showPlan ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
          <div className="px-6 pb-6">

      {/* Day Progress Bar */}
      <div className="relative mb-8 pt-2">
        {/* Connection Line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-200" />

        {/* Day Dots */}
        <div className="relative flex justify-between">
          {Array.from({ length: totalDays }, (_, i) => {
            const dayNumber = i + 1
            const status = dayStatuses[i] || 'pending'
            const isUnlocked = isDayUnlocked(dayNumber)
            const isSelected = selectedDay === dayNumber

            return (
              <button
                key={dayNumber}
                onClick={() => isUnlocked && onDayClick(dayNumber)}
                disabled={!isUnlocked}
                className={`
                  relative flex flex-col items-center group
                  ${isUnlocked ? 'cursor-pointer' : 'cursor-not-allowed'}
                `}
              >
                {/* Dot */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 z-10"
                  style={{
                    backgroundColor: status === 'completed' ? '#2a6ee8'
                      : status === 'in_progress' ? '#ff9419'
                      : isUnlocked ? '#eae9e8' : '#f5f5f5',
                    color: status === 'completed' || status === 'in_progress' ? 'white'
                      : isUnlocked ? '#2f2922' : '#a09d9a',
                    boxShadow: status === 'in_progress' ? '0 0 0 4px #fff4e8'
                      : isSelected ? '0 0 0 4px #ffe1bf' : 'none',
                    transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                  }}
                >
                  {status === 'completed' ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-sm font-medium">{dayNumber}</span>
                  )}
                </div>

                {/* Label */}
                <div className="mt-2 text-center">
                  <div className="text-xs font-medium" style={{ color: isSelected ? '#ff9419' : '#2f2922' }}>
                    Day {dayNumber}
                  </div>
                  <div className="text-xs" style={{ color: '#7a7672' }}>
                    {status === 'completed'
                      ? 'Done'
                      : status === 'in_progress'
                        ? 'In Progress'
                        : 'Ready'
                    }
                  </div>
                </div>

                {/* Tooltip with due date */}
                {isUnlocked && (
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs px-2 py-1 rounded whitespace-nowrap" style={{ backgroundColor: '#2f2922' }}>
                    Due: {getDueDate(dayNumber)}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="rounded-lg p-3" style={{ backgroundColor: '#fff4e8' }}>
          <div className="mb-1" style={{ color: '#7a7672' }}>Training Start</div>
          <div className="font-semibold" style={{ color: '#2f2922' }}>
            {trainingStartDate
              ? new Date(trainingStartDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })
              : 'Not set'
            }
          </div>
        </div>
        <div className="rounded-lg p-3" style={{ backgroundColor: '#e9f0fd' }}>
          <div className="mb-1" style={{ color: '#7a7672' }}>Expected Completion</div>
          <div className="font-semibold" style={{ color: '#2f2922' }}>
            {expectedCompletion || 'Not set'}
          </div>
        </div>
        <div className="rounded-lg p-3" style={{ backgroundColor: '#ffeef0' }}>
          <div className="mb-1" style={{ color: '#7a7672' }}>Current Progress</div>
          <div className="font-semibold" style={{ color: '#2f2922' }}>
            Day {currentDay} of {totalDays}
          </div>
        </div>
      </div>

          </div>
        </div>
      </div>
    </div>
  )
}
