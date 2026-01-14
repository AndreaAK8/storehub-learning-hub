'use client'

import { useMemo } from 'react'

interface TrainingDay {
  dayNumber: number
  title: string
  activities: { status: string }[]
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
  // Calculate day statuses
  const dayStatuses = useMemo(() => {
    return trainingDays.map((day) => {
      const allCompleted = day.activities.every((a) => a.status === 'completed')
      const anyInProgress = day.activities.some((a) => a.status === 'in_progress')
      const anyCompleted = day.activities.some((a) => a.status === 'completed')

      if (allCompleted) return 'completed'
      if (anyInProgress || anyCompleted) return 'in_progress'
      return 'locked'
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

  // Check if day is unlocked (previous day completed or first day)
  const isDayUnlocked = (dayNumber: number) => {
    if (dayNumber === 1) return true
    const prevDayIndex = dayNumber - 2
    return prevDayIndex >= 0 && dayStatuses[prevDayIndex] === 'completed'
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Your Training Journey</h2>
        <p className="text-gray-600">{roleName} • {totalDays} Days</p>
      </div>

      {/* Day Progress Bar */}
      <div className="relative mb-8">
        {/* Connection Line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200" />

        {/* Day Dots */}
        <div className="relative flex justify-between">
          {Array.from({ length: totalDays }, (_, i) => {
            const dayNumber = i + 1
            const status = dayStatuses[i] || 'locked'
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
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    transition-all duration-200 z-10
                    ${status === 'completed'
                      ? 'bg-green-500 text-white'
                      : status === 'in_progress'
                        ? 'bg-blue-500 text-white ring-4 ring-blue-100'
                        : isUnlocked
                          ? 'bg-gray-200 text-gray-600'
                          : 'bg-gray-100 text-gray-400'
                    }
                    ${isSelected ? 'ring-4 ring-blue-200 scale-110' : ''}
                    ${isUnlocked && !isSelected ? 'hover:scale-105' : ''}
                  `}
                >
                  {status === 'completed' ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : !isUnlocked ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  ) : (
                    <span className="text-sm font-medium">{dayNumber}</span>
                  )}
                </div>

                {/* Label */}
                <div className="mt-2 text-center">
                  <div className={`text-xs font-medium ${isSelected ? 'text-blue-600' : 'text-gray-700'}`}>
                    Day {dayNumber}
                  </div>
                  <div className="text-xs text-gray-500">
                    {status === 'completed'
                      ? 'Done'
                      : status === 'in_progress'
                        ? 'In Progress'
                        : isUnlocked
                          ? 'Ready'
                          : 'Locked'
                    }
                  </div>
                </div>

                {/* Tooltip with due date */}
                {isUnlocked && (
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
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
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-gray-500 mb-1">Training Start</div>
          <div className="font-semibold text-gray-900">
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
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-gray-500 mb-1">Expected Completion</div>
          <div className="font-semibold text-gray-900">
            {expectedCompletion || 'Not set'}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-gray-500 mb-1">Current Progress</div>
          <div className="font-semibold text-gray-900">
            Day {currentDay} of {totalDays}
          </div>
        </div>
      </div>
    </div>
  )
}
