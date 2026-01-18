'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  TrainingRoadmap,
  DaySchedule,
  ProgressPanel,
  SearchBar,
  HelpButton,
  ReflectionModal,
} from '@/components/training'
import type { ActivityPerformance } from '@/components/training'

interface Activity {
  id: string
  title: string
  description: string
  startTime: string
  endTime: string
  durationHours: number
  activityType: string
  status: 'pending' | 'in_progress' | 'completed' | 'skipped'
  pic: string
  resourceLinks?: { title: string; url: string }[]
  successCriteria?: string[]
  tldr?: string
}

interface TrainingDay {
  dayNumber: number
  title: string
  description: string
  activities: Activity[]
}

interface TraineeData {
  email: string
  role: string
  roleName: string
  totalDays: number
  trainingStartDate?: string
  trainingDays: TrainingDay[]
  coachName?: string
  coachEmail?: string
}

export default function MyTrainingPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [traineeData, setTraineeData] = useState<TraineeData | null>(null)
  const [selectedDay, setSelectedDay] = useState(1)
  const [showReflection, setShowReflection] = useState(false)
  const [completedDayForReflection, setCompletedDayForReflection] = useState<number | null>(null)

  const supabase = createClient()

  // Fetch trainee data
  const fetchTraineeData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Please log in to view your training')
        return
      }

      // Fetch user profile to get role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, google_sheet_email, training_role')
        .eq('id', user.id)
        .single()

      const traineeEmail = profile?.google_sheet_email || user.email

      // Valid training program roles (not permission roles like 'admin', 'coach', 'trainee')
      const validTrainingRoles = ['OC', 'OS', 'MOM', 'CSM', 'BC', 'MC', 'SC']

      // Use training_role if set, otherwise default to 'OC' for pilot
      // Note: profile.role is the permission role (admin/coach/trainee), not training program
      const traineeRole = profile?.training_role && validTrainingRoles.includes(profile.training_role)
        ? profile.training_role
        : 'OC' // Default to OC for Jan 19 pilot

      // Fetch training schedule from API
      const response = await fetch(
        `/api/training/schedule?role=${traineeRole}&email=${encodeURIComponent(traineeEmail || '')}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch training schedule')
      }

      const data = await response.json()

      // Fetch saved progress from Supabase
      const progressResponse = await fetch(
        `/api/training/performance?email=${encodeURIComponent(traineeEmail || '')}`
      )
      const progressData = progressResponse.ok ? await progressResponse.json() : { performance: [] }
      // All records in activity_performance are completed activities
      const completedActivities = new Set(
        progressData.performance
          ?.map((p: { activity_id: string }) => p.activity_id) || []
      )

      // Transform data for components, merging saved progress
      setTraineeData({
        email: traineeEmail || '',
        role: data.role.shortCode,
        roleName: data.role.name,
        totalDays: data.role.totalDays,
        trainingStartDate: new Date().toISOString().split('T')[0], // TODO: Get from trainee record
        trainingDays: data.trainingDays.map((day: TrainingDay) => ({
          ...day,
          activities: day.activities.map((activity: Activity) => ({
            ...activity,
            // Restore completed status from Supabase
            status: completedActivities.has(activity.id) ? 'completed' : activity.status,
            // Add default success criteria based on activity type
            successCriteria: activity.successCriteria || getDefaultSuccessCriteria(activity),
            tldr: activity.tldr || getDefaultTldr(activity),
          })),
        })),
        coachName: 'Andrea K.',
        coachEmail: 'andrea.kaur@storehub.com',
      })

      // Auto-select the current active day
      const currentDay = findCurrentDay(data.trainingDays)
      setSelectedDay(currentDay)
    } catch (err) {
      console.error('Error fetching trainee data:', err)
      setError('Failed to load training data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchTraineeData()
  }, [fetchTraineeData])

  // Find the current active day
  const findCurrentDay = (days: TrainingDay[]): number => {
    for (let i = days.length - 1; i >= 0; i--) {
      const day = days[i]
      const hasInProgress = day.activities.some((a) => a.status === 'in_progress')
      const hasCompleted = day.activities.some((a) => a.status === 'completed')
      if (hasInProgress || hasCompleted) {
        return day.dayNumber
      }
    }
    return 1
  }

  // Get default success criteria based on activity type
  const getDefaultSuccessCriteria = (activity: Activity): string[] => {
    if (activity.activityType === 'assessment') {
      return ['Achieve a minimum score of 80%', 'Complete within the allocated time']
    }
    if (activity.activityType === 'self_study') {
      return ['Review all provided materials', 'Understand key concepts']
    }
    return []
  }

  // Get default TL;DR based on activity
  const getDefaultTldr = (activity: Activity): string => {
    if (activity.description && activity.description.length > 100) {
      return activity.description.substring(0, 100) + '...'
    }
    return activity.description
  }

  // Handle marking activity as complete
  const handleMarkComplete = useCallback(async (activityId: string, performance?: ActivityPerformance) => {
    if (!traineeData) return

    try {
      // Find the activity to get its details
      let activityDetails: Activity | undefined
      traineeData.trainingDays.forEach(day => {
        const found = day.activities.find(a => a.id === activityId)
        if (found) activityDetails = found
      })

      // Update local state optimistically
      setTraineeData((prev) => {
        if (!prev) return null

        const updatedDays = prev.trainingDays.map((day) => ({
          ...day,
          activities: day.activities.map((activity) =>
            activity.id === activityId
              ? { ...activity, status: 'completed' as const }
              : activity
          ),
        }))

        return { ...prev, trainingDays: updatedDays }
      })

      // Save performance tracking data if available
      if (performance) {
        try {
          await fetch('/api/training/performance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              traineeEmail: traineeData.email,
              traineeName: traineeData.email?.split('@')[0],
              roleCode: traineeData.role,
              dayNumber: selectedDay,
              activityId: performance.activityId,
              activityTitle: performance.activityTitle,
              activityType: activityDetails?.activityType,
              allocatedSeconds: performance.allocatedSeconds,
              actualSeconds: performance.actualSeconds,
              performanceFlag: performance.performanceFlag,
              percentageOfAllocated: performance.percentageOfAllocated,
            }),
          })
          console.log(`Activity completed: ${performance.performanceFlag} (${performance.percentageOfAllocated}% of allocated time)`)
        } catch (perfErr) {
          console.error('Failed to save performance data:', perfErr)
          // Don't fail the completion, just log the error
        }
      }

      // Check if day is now complete
      const currentDayData = traineeData.trainingDays.find((d) => d.dayNumber === selectedDay)
      if (currentDayData) {
        const allComplete = currentDayData.activities.every(
          (a) => a.status === 'completed' || a.id === activityId || a.activityType === 'lunch' || a.activityType === 'break'
        )
        if (allComplete) {
          setCompletedDayForReflection(selectedDay)
          setShowReflection(true)
        }
      }

      // TODO: Save to Supabase
      // await supabase.from('trainee_progress').upsert({
      //   trainee_email: traineeData.email,
      //   module_id: activityId,
      //   status: 'completed',
      //   completed_at: new Date().toISOString(),
      // })
    } catch (err) {
      console.error('Error marking activity complete:', err)
      // Revert optimistic update
      fetchTraineeData()
    }
  }, [traineeData, selectedDay, fetchTraineeData])

  // Handle starting an activity
  const handleStartActivity = useCallback(async (activityId: string) => {
    if (!traineeData) return

    setTraineeData((prev) => {
      if (!prev) return null

      const updatedDays = prev.trainingDays.map((day) => ({
        ...day,
        activities: day.activities.map((activity) =>
          activity.id === activityId
            ? { ...activity, status: 'in_progress' as const }
            : activity
        ),
      }))

      return { ...prev, trainingDays: updatedDays }
    })
  }, [traineeData])

  // Handle reflection submission
  const handleReflectionSubmit = useCallback(async (reflection: {
    confusingTopic: string
    improvement: string
    confidenceLevel: number
  }) => {
    try {
      const response = await fetch('/api/training/reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          traineeEmail: traineeData?.email || 'demo@storehub.com',
          traineeName: traineeData?.email?.split('@')[0] || 'Demo User',
          roleCode: traineeData?.role || 'OC',
          dayNumber: completedDayForReflection,
          confusingTopic: reflection.confusingTopic,
          improvement: reflection.improvement,
          confidenceLevel: reflection.confidenceLevel,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save reflection')
      }

      console.log('Reflection saved successfully')
    } catch (error) {
      console.error('Failed to submit reflection:', error)
    }

    setShowReflection(false)
    setCompletedDayForReflection(null)
  }, [traineeData, completedDayForReflection])

  // Handle search result click
  const handleSearchResultClick = useCallback((result: { dayNumber?: number }) => {
    if (result.dayNumber) {
      setSelectedDay(result.dayNumber)
    }
  }, [])

  // Get search data
  const searchModules = useMemo(() => {
    if (!traineeData) return []
    return traineeData.trainingDays.flatMap((day) =>
      day.activities.map((activity) => ({
        id: activity.id,
        title: activity.title,
        description: activity.description,
        dayNumber: day.dayNumber,
      }))
    )
  }, [traineeData])

  // Get current day data
  const currentDayData = useMemo(() => {
    return traineeData?.trainingDays.find((d) => d.dayNumber === selectedDay)
  }, [traineeData, selectedDay])

  // Get due date for current day
  const getDueDate = (dayNumber: number): string => {
    if (!traineeData?.trainingStartDate) return ''
    const start = new Date(traineeData.trainingStartDate)
    start.setDate(start.getDate() + dayNumber - 1)
    return start.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  // Check if a day is locked
  const isDayLocked = (dayNumber: number): boolean => {
    if (dayNumber === 1) return false
    if (!traineeData) return true

    const prevDay = traineeData.trainingDays.find((d) => d.dayNumber === dayNumber - 1)
    if (!prevDay) return true

    return !prevDay.activities.every(
      (a) => a.status === 'completed' || a.activityType === 'lunch' || a.activityType === 'break'
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading your training schedule...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !traineeData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Training</h2>
          <p className="text-gray-500 mb-4">{error || 'Something went wrong'}</p>
          <button
            onClick={fetchTraineeData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Search */}
      <div className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Training</h1>
            <p className="text-gray-500 text-sm">{traineeData.roleName}</p>
          </div>
          <SearchBar
            modules={searchModules}
            onResultClick={handleSearchResultClick}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-3 space-y-6">
            {/* Training Roadmap */}
            <TrainingRoadmap
              roleName={traineeData.roleName}
              totalDays={traineeData.totalDays}
              trainingDays={traineeData.trainingDays}
              trainingStartDate={traineeData.trainingStartDate}
              currentDay={findCurrentDay(traineeData.trainingDays)}
              onDayClick={setSelectedDay}
              selectedDay={selectedDay}
            />

            {/* Day Schedule */}
            {currentDayData && (
              <DaySchedule
                dayNumber={currentDayData.dayNumber}
                title={currentDayData.title}
                description={currentDayData.description}
                activities={currentDayData.activities}
                dueDate={getDueDate(currentDayData.dayNumber)}
                isLocked={isDayLocked(currentDayData.dayNumber)}
                onMarkComplete={handleMarkComplete}
                onStartActivity={handleStartActivity}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <ProgressPanel
                trainingDays={traineeData.trainingDays}
                totalDays={traineeData.totalDays}
                trainingStartDate={traineeData.trainingStartDate}
                assessmentsPassed={0}
                assessmentsTotal={4}
                coachName={traineeData.coachName}
                coachEmail={traineeData.coachEmail}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Help Button */}
      <HelpButton
        coachName={traineeData.coachName}
        coachEmail={traineeData.coachEmail}
        trainingTeamEmail="training@storehub.com"
      />

      {/* Reflection Modal */}
      {completedDayForReflection && currentDayData && (
        <ReflectionModal
          isOpen={showReflection}
          onClose={() => {
            setShowReflection(false)
            setCompletedDayForReflection(null)
          }}
          dayNumber={completedDayForReflection}
          dayTitle={currentDayData.title}
          onSubmit={handleReflectionSubmit}
        />
      )}
    </div>
  )
}
