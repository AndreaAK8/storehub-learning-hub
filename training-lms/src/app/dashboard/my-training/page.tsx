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
  CompletionCelebration,
  GiftReveal,
  OnboardingTour,
  ForkIntroModal,
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
  checklist?: { id: string; text: string }[]
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
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([1]))
  const [showReflection, setShowReflection] = useState(false)
  const [completedDayForReflection, setCompletedDayForReflection] = useState<number | null>(null)
  const [surveyCompleted, setSurveyCompleted] = useState(false)
  const [userName, setUserName] = useState<string>('')
  const [giftRevealed, setGiftRevealed] = useState(false)
  const [showGiftReveal, setShowGiftReveal] = useState(false)
  const [viewMode, setViewMode] = useState<'certificate' | 'activities'>('certificate')
  const [showTransition, setShowTransition] = useState(false)
  const [showTour, setShowTour] = useState(false)
  const [forkIntro, setForkIntro] = useState<any>(null)
  const [dayIntros, setDayIntros] = useState<Record<number, any>>({})
  const [showForkIntro, setShowForkIntro] = useState(false)

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
        .select('role, google_sheet_email, full_name')
        .eq('id', user.id)
        .single()

      const traineeEmail = profile?.google_sheet_email || user.email
      const traineeName = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Trainee'
      setUserName(traineeName)

      // Check if survey already completed
      const surveyKey = `survey_completed_${traineeEmail}`
      if (localStorage.getItem(surveyKey)) {
        setSurveyCompleted(true)
      }

      // Check if gift has been revealed
      const giftKey = `gift_revealed_${traineeEmail}`
      if (localStorage.getItem(giftKey)) {
        setGiftRevealed(true)
      }

      // Check if onboarding tour has been completed
      const tourKey = `tour_completed_${traineeEmail}`
      if (!localStorage.getItem(tourKey)) {
        // Show tour after a short delay to let the page load
        setTimeout(() => setShowTour(true), 500)
      }

      // Get training role from URL param (for testing) or from trainee data
      const urlParams = new URLSearchParams(window.location.search)
      const roleOverride = urlParams.get('role')

      // Fetch trainee's actual role from Google Sheets via trainees API
      let traineeRole = roleOverride || 'OS' // Default fallback

      if (!roleOverride) {
        try {
          const traineesResponse = await fetch('/api/trainees')
          if (traineesResponse.ok) {
            const traineesData = await traineesResponse.json()
            // Find current user's trainee record by email
            const currentTrainee = traineesData.find(
              (t: { email: string }) => t.email?.toLowerCase() === traineeEmail?.toLowerCase()
            )
            if (currentTrainee?.department) {
              // Map full role name to short code
              const roleMapping: Record<string, string> = {
                'Onboarding Specialist': 'OS',
                'Merchant Onboarding Manager': 'MOM',
                'Onboarding Coordinator': 'OC',
                'Customer Success Manager': 'CSM',
                'Business Consultant': 'BC',
                'Merchant Care': 'MC',
                'Sales Coordinator': 'SC',
              }
              traineeRole = roleMapping[currentTrainee.department] || currentTrainee.department
              console.log(`Fetched role for ${traineeEmail}: ${currentTrainee.department} -> ${traineeRole}`)
            }
          }
        } catch (roleErr) {
          console.error('Failed to fetch trainee role, using default:', roleErr)
        }
      }

      // Fetch training schedule from API
      const response = await fetch(
        `/api/training/schedule?role=${traineeRole}&email=${encodeURIComponent(traineeEmail || '')}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch training schedule')
      }

      const data = await response.json()

      // Fetch fork intro + day intros from Supabase
      const roleId = data.role?.id
      if (roleId) {
        const [forkRes, dayIntrosRes] = await Promise.all([
          supabase.from('training_fork_intros').select('*').eq('role_id', roleId).single(),
          supabase.from('training_day_intros').select('*').eq('role_id', roleId)
        ])
        if (forkRes.data) {
          setForkIntro(forkRes.data)
          // Show fork intro if trainee hasn't seen it yet
          const forkKey = `fork_intro_seen_${traineeEmail}_${data.role.shortCode}`
          if (!localStorage.getItem(forkKey)) {
            setShowForkIntro(true)
          }
        }
        if (dayIntrosRes.data) {
          const map: Record<number, any> = {}
          dayIntrosRes.data.forEach((d: any) => { map[d.day] = d })
          setDayIntros(map)
        }
      }

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

      // Check if a specific day was requested via URL param (from Training Overview)
      const dayOverride = urlParams.get('day')
      if (dayOverride) {
        const requestedDay = parseInt(dayOverride)
        if (requestedDay >= 1 && requestedDay <= data.role.totalDays) {
          setSelectedDay(requestedDay)
          setExpandedDays(new Set([requestedDay]))
        } else {
          // Fallback to current active day
          const currentDay = findCurrentDay(data.trainingDays)
          setSelectedDay(currentDay)
          setExpandedDays(new Set([currentDay]))
        }
      } else {
        // Auto-select the current active day
        const currentDay = findCurrentDay(data.trainingDays)
        setSelectedDay(currentDay)
        setExpandedDays(new Set([currentDay]))
      }
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

      // Check if day is now complete (include the just-completed activity)
      const currentDayData = traineeData.trainingDays.find((d) => d.dayNumber === selectedDay)
      if (currentDayData) {
        const allComplete = currentDayData.activities.every(
          (a) => a.status === 'completed' || a.id === activityId || a.activityType === 'lunch' || a.activityType === 'break'
        )
        if (allComplete) {
          // Delay slightly to let the UI update first
          setTimeout(() => {
            setCompletedDayForReflection(selectedDay)
            setShowReflection(true)
          }, 500)
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

  // Handle survey submission - triggers Win 6 workflow
  const handleTakeSurvey = useCallback(async () => {
    if (!traineeData) return

    try {
      // Open survey form (could be a modal or external link)
      // For now, trigger the Win 6 feedback workflow
      const response = await fetch('/api/workflows/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          traineeEmail: traineeData.email,
          traineeName: userName,
          roleCode: traineeData.role,
          roleName: traineeData.roleName,
        }),
      })

      if (response.ok) {
        // Mark survey as completed
        const surveyKey = `survey_completed_${traineeData.email}`
        localStorage.setItem(surveyKey, 'true')
        setSurveyCompleted(true)
      }
    } catch (error) {
      console.error('Failed to trigger survey:', error)
    }
  }, [traineeData, userName])

  // Check if all training is complete
  const isTrainingComplete = useMemo(() => {
    if (!traineeData) return false

    return traineeData.trainingDays.every(day =>
      day.activities.every(activity =>
        activity.status === 'completed' ||
        activity.activityType === 'lunch' ||
        activity.activityType === 'break'
      )
    )
  }, [traineeData])

  // Trigger gift reveal when training completes AND reflection is closed
  useEffect(() => {
    // Only proceed if training is complete and gift hasn't been revealed
    if (!isTrainingComplete || giftRevealed || !traineeData) {
      return
    }

    // If reflection is showing, wait for it to close
    if (showReflection) {
      return
    }

    // Delay to let UI settle before showing gift
    const timer = setTimeout(() => {
      setShowGiftReveal(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [isTrainingComplete, giftRevealed, traineeData, showReflection])

  // Handle gift reveal completion
  const handleGiftRevealComplete = useCallback(() => {
    if (!traineeData) return

    // Show transition screen first
    setShowTransition(true)
    setShowGiftReveal(false)

    // After transition, reveal certificate
    setTimeout(() => {
      const giftKey = `gift_revealed_${traineeData.email}`
      localStorage.setItem(giftKey, 'true')
      setGiftRevealed(true)
      setShowTransition(false)
    }, 1500)
  }, [traineeData])

  // Calculate completion stats
  const completionStats = useMemo(() => {
    if (!traineeData) return { totalActivities: 0, completedActivities: 0, totalHours: 0 }

    let totalActivities = 0
    let completedActivities = 0
    let totalHours = 0

    traineeData.trainingDays.forEach(day => {
      day.activities.forEach(activity => {
        if (activity.activityType !== 'lunch' && activity.activityType !== 'break') {
          totalActivities++
          totalHours += activity.durationHours || 0
          if (activity.status === 'completed') {
            completedActivities++
          }
        }
      })
    })

    return { totalActivities, completedActivities, totalHours: Math.round(totalHours) }
  }, [traineeData])

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

  // Find next incomplete module across all days
  const nextUpModule = useMemo(() => {
    if (!traineeData) return null
    for (const day of traineeData.trainingDays) {
      for (const activity of day.activities) {
        if (
          activity.activityType !== 'lunch' &&
          activity.activityType !== 'break' &&
          activity.status !== 'completed'
        ) {
          return { activity, dayNumber: day.dayNumber }
        }
      }
    }
    return null // All done
  }, [traineeData])

  // When selectedDay changes (e.g. roadmap click), expand that day
  useEffect(() => {
    setExpandedDays(prev => new Set([...prev, selectedDay]))
  }, [selectedDay])

  const toggleDay = (dayNumber: number) => {
    setExpandedDays(prev => {
      const next = new Set(prev)
      if (next.has(dayNumber)) next.delete(dayNumber)
      else next.add(dayNumber)
      return next
    })
  }

  // Calculate total XP (1h = 100 XP)
  const totalXP = useMemo(() => {
    if (!traineeData) return 0
    return traineeData.trainingDays.reduce((total, day) => {
      return total + day.activities.reduce((dayTotal, activity) => {
        if (activity.activityType !== 'lunch' && activity.activityType !== 'break') {
          return dayTotal + Math.round((activity.durationHours || 0) * 100)
        }
        return dayTotal
      }, 0)
    }, 0)
  }, [traineeData])

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

  // Check if a day is locked - All days unlocked for overview purposes
  const isDayLocked = (_dayNumber: number): boolean => {
    return false // All days accessible so trainees can preview upcoming content
  }

  // Loading state — skeleton screen (no spinners per design rules)
  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ background: '#f5f5f4' }}>
        {/* Header skeleton */}
        <div className="bg-white border-b sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <div className="skeleton h-6 w-32" />
              <div className="skeleton h-4 w-48" />
            </div>
            <div className="skeleton h-9 w-56 rounded-lg" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main column */}
            <div className="lg:col-span-3 space-y-6">
              {/* Roadmap skeleton */}
              <div className="bg-white rounded-xl border border-[#c5c3c1] p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="skeleton w-10 h-10 rounded-lg" />
                  <div className="flex flex-col gap-2">
                    <div className="skeleton h-5 w-40" />
                    <div className="skeleton h-3 w-28" />
                  </div>
                </div>
                <div className="flex justify-between px-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div className="skeleton w-8 h-8 rounded-full" style={{ borderRadius: '50%' }} />
                      <div className="skeleton h-3 w-10" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Day header skeleton */}
              <div className="bg-white rounded-xl border border-[#c5c3c1] overflow-hidden">
                <div className="p-6 border-b" style={{ background: '#fff4e8', borderColor: '#ffe1bf' }}>
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-3 flex-1">
                      <div className="skeleton h-6 w-16 rounded-full" />
                      <div className="skeleton h-7 w-64" />
                      <div className="skeleton h-4 w-80" />
                    </div>
                    <div className="skeleton w-16 h-16 rounded-full" style={{ borderRadius: '50%' }} />
                  </div>
                </div>

                {/* Activity card skeletons */}
                <div className="p-4 space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-2xl border-2 border-[#c5c3c1] overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-2.5 border-b bg-[#f5f5f4] border-[#c5c3c1]">
                        <div className="skeleton h-6 w-20 rounded-full" />
                        <div className="skeleton h-5 w-28 rounded-full" />
                      </div>
                      <div className="p-4 flex items-start gap-4">
                        <div className="skeleton w-12 h-12 rounded-full flex-shrink-0" style={{ borderRadius: '50%' }} />
                        <div className="flex-1 flex flex-col gap-2">
                          <div className="skeleton h-5 w-3/4" />
                          <div className="skeleton h-4 w-full" />
                          <div className="skeleton h-4 w-2/3" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar skeleton */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-[#c5c3c1] p-5 space-y-4">
                <div className="skeleton h-5 w-32" />
                <div className="skeleton h-3 w-full rounded-full" />
                <div className="skeleton h-3 w-4/5 rounded-full" />
                <div className="mt-4 flex flex-col gap-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="skeleton h-4 w-16" />
                      <div className="skeleton h-4 w-24" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !traineeData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#ffeef0] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#ff546f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#2f2922] mb-2">Unable to Load Training</h2>
          <p className="text-[#7a7672] mb-4">{error || 'Something went wrong'}</p>
          <button
            onClick={fetchTraineeData}
            className="bg-[#2a6ee8] text-white px-4 py-2 rounded-lg hover:bg-[#2a6ee8] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Transition screen between gift and certificate
  if (showTransition) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: '#2f2922' }}>
        <div className="text-center animate-pulse">
          <div className="text-8xl mb-6">🎓</div>
          <h2 className="text-2xl font-bold text-white mb-2">Preparing your certificate...</h2>
          <p style={{ color: '#a09d9a' }}>Just a moment</p>
          <div className="mt-8 flex justify-center gap-2">
            <div className="w-3 h-3 rounded-full animate-bounce" style={{ background: '#ff9419', animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 rounded-full animate-bounce" style={{ background: '#ff9419', animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 rounded-full animate-bounce" style={{ background: '#ff9419', animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    )
  }

  // Training Complete - Show Gift Reveal or Certificate
  if (isTrainingComplete && traineeData && viewMode === 'certificate') {
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '')
    const certId = `SH-${traineeData.role}-${dateStr}-${traineeData.email.slice(0, 6).toUpperCase()}`

    // Survey URL - Google Form for trainee feedback
    const surveyUrl = 'https://forms.gle/Ar8hfoPHNdJ3K1gZ7'

    // Show gift reveal experience first
    if (showGiftReveal && !giftRevealed) {
      return (
        <GiftReveal
          traineeName={userName}
          roleName={traineeData.roleName}
          roleCode={traineeData.role}
          totalXP={totalXP}
          onRevealComplete={handleGiftRevealComplete}
        />
      )
    }

    // After gift is revealed, show certificate with toggle button
    return (
      <div className="animate-fade-in">
        {/* Toggle to Activities Button */}
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setViewMode('activities')}
            className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm text-[#55504a] rounded-xl shadow-lg hover:bg-white hover:scale-105 transition-all border border-[#c5c3c1]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <span className="font-medium">View Activities</span>
          </button>
        </div>

        <CompletionCelebration
          traineeName={userName}
          roleName={traineeData.roleName}
          roleCode={traineeData.role}
          completionDate={new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
          certificateId={certId}
          finalScore={Math.round((completionStats.completedActivities / completionStats.totalActivities) * 100)}
          totalHours={completionStats.totalHours}
          activitiesCompleted={completionStats.completedActivities}
          onTakeSurvey={handleTakeSurvey}
          surveyCompleted={surveyCompleted}
          surveyUrl={surveyUrl}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#f5f5f4' }}>
      {/* Training Completed Banner */}
      {isTrainingComplete && (
        <div style={{ background: '#2a6ee8' }} className="text-white">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                <span className="text-xl">🎓</span>
              </div>
              <div>
                <p className="font-bold">Training complete!</p>
                <p className="text-sm" style={{ color: '#c4d7f9' }}>You finished all {traineeData.totalDays} days</p>
              </div>
            </div>
            <button
              onClick={() => setViewMode('certificate')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all shadow-lg"
              style={{ background: 'white', color: '#2a6ee8' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              View Certificate
            </button>
          </div>
        </div>
      )}

      {/* Header with Search */}
      <div className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#2f2922' }}>My Training</h1>
              <p className="text-sm" style={{ color: '#7a7672' }}>{traineeData.roleName}</p>
            </div>
            <button
              onClick={() => setShowTour(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#7a7672] hover:text-[#ff9419] hover:bg-[#fff4e8] rounded-lg transition-colors"
              title="Take a quick tour of the dashboard"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden sm:inline">Tour</span>
            </button>
          </div>
          <SearchBar
            modules={searchModules}
            onResultClick={handleSearchResultClick}
          />
        </div>

        {/* Next up banner */}
        {nextUpModule ? (
          <div
            className="border-t border-l-4 px-4 py-3"
            style={{ background: '#fff4e8', borderTopColor: '#ffe1bf', borderLeftColor: '#ff9419' }}
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#ff9419' }}>
                  <path d="M8 5v14l11-7z" />
                </svg>
                <div className="min-w-0">
                  <span className="text-xs font-bold mr-2" style={{ color: '#ff9419', fontFamily: 'var(--font-barlow), system-ui, sans-serif' }}>
                    Next up
                  </span>
                  <span className="text-sm font-bold truncate" style={{ color: '#2f2922', fontFamily: 'var(--font-barlow), system-ui, sans-serif' }}>
                    {nextUpModule.activity.title}
                  </span>
                  <span className="ml-2 text-xs hidden sm:inline" style={{ color: '#7a7672' }}>
                    {nextUpModule.activity.durationHours
                      ? `${Math.round(nextUpModule.activity.durationHours * 60)} min`
                      : ''}
                    {nextUpModule.dayNumber !== selectedDay ? ` · Day ${nextUpModule.dayNumber}` : ''}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedDay(nextUpModule.dayNumber)
                  handleStartActivity(nextUpModule.activity.id)
                }}
                className="flex-shrink-0 px-4 py-1.5 rounded-lg text-sm font-semibold text-white transition-colors hover:opacity-90"
                style={{ background: '#ff9419', fontFamily: 'var(--font-barlow), system-ui, sans-serif' }}
              >
                Begin →
              </button>
            </div>
          </div>
        ) : !isTrainingComplete ? null : (
          <div
            className="border-t border-l-4 px-4 py-3"
            style={{ background: '#e9f0fd', borderTopColor: '#c4d7f9', borderLeftColor: '#2a6ee8' }}
          >
            <div className="max-w-7xl mx-auto flex items-center gap-3">
              <span className="text-base">🎉</span>
              <span className="text-sm font-semibold" style={{ color: '#2a6ee8', fontFamily: 'var(--font-barlow), system-ui, sans-serif' }}>
                Training complete —{' '}
                <a href="/dashboard/my-scores" className="underline hover:opacity-80">Check your scores →</a>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-3 space-y-6">
            {/* Training Roadmap */}
            <div data-tour="roadmap">
              <TrainingRoadmap
                roleName={traineeData.roleName}
                totalDays={traineeData.totalDays}
                trainingDays={traineeData.trainingDays}
                trainingStartDate={traineeData.trainingStartDate}
                currentDay={findCurrentDay(traineeData.trainingDays)}
                onDayClick={setSelectedDay}
                selectedDay={selectedDay}
              />
            </div>

            {/* Day Sections — collapsible, current day expanded by default */}
            {traineeData.trainingDays.map((day, idx) => {
              const isExpanded = expandedDays.has(day.dayNumber)
              const isCurrent = day.dayNumber === findCurrentDay(traineeData.trainingDays)
              const totalTasks = day.activities.filter(
                a => a.activityType !== 'lunch' && a.activityType !== 'break'
              ).length
              const completedTasks = day.activities.filter(
                a => a.status === 'completed' && a.activityType !== 'lunch' && a.activityType !== 'break'
              ).length
              const pct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

              return (
                <div key={day.dayNumber} data-tour={idx === 0 ? 'activities' : undefined}
                  id={`day-${day.dayNumber}`}>
                  {!isExpanded ? (
                    /* Collapsed header */
                    <button
                      onClick={() => toggleDay(day.dayNumber)}
                      className="w-full text-left bg-white rounded-xl shadow-sm border border-[#c5c3c1] px-5 py-4 flex items-center justify-between gap-4 hover:bg-[#fff4e8] transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className="flex-shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold text-white"
                          style={{ background: '#ff9419' }}
                        >
                          Day {day.dayNumber}
                        </span>
                        <span
                          className="font-bold text-base truncate"
                          style={{ color: '#2f2922', fontFamily: 'var(--font-barlow), system-ui, sans-serif' }}
                        >
                          {day.title}
                        </span>
                        {isCurrent && (
                          <span className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: '#fff4e8', color: '#ff9419' }}>
                            Today
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={
                            pct === 100
                              ? { background: '#e9f0fd', color: '#2a6ee8' }
                              : pct > 0
                              ? { background: '#fff4e8', color: '#ff9419' }
                              : { background: '#eae9e8', color: '#7a7672' }
                          }
                        >
                          {pct}%
                        </span>
                        <span className="text-xs" style={{ color: '#a09d9a' }}>
                          {completedTasks}/{totalTasks} tasks
                        </span>
                        <svg
                          className="w-4 h-4 transition-transform group-hover:text-[#ff9419]"
                          style={{ color: '#a09d9a' }}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>
                  ) : (
                    /* Expanded — full DaySchedule with a collapse toggle in the header */
                    <div>
                      <button
                        onClick={() => toggleDay(day.dayNumber)}
                        className="w-full text-left mb-1 flex items-center gap-2 px-1 py-0.5 text-xs font-medium text-[#a09d9a] hover:text-[#ff9419] transition-colors"
                      >
                        <svg className="w-3.5 h-3.5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        Collapse day {day.dayNumber}
                      </button>
                      <DaySchedule
                        dayNumber={day.dayNumber}
                        title={day.title}
                        description={day.description}
                        activities={day.activities}
                        dueDate={getDueDate(day.dayNumber)}
                        isLocked={isDayLocked(day.dayNumber)}
                        dayIntro={dayIntros[day.dayNumber] || null}
                        onMarkComplete={handleMarkComplete}
                        onStartActivity={handleStartActivity}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24" data-tour="progress">
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

      {/* Fork Intro Modal */}
      {showForkIntro && forkIntro && (
        <ForkIntroModal
          data={forkIntro}
          onComplete={() => {
            const forkKey = `fork_intro_seen_${traineeData.email}_${traineeData.role}`
            localStorage.setItem(forkKey, 'true')
            setShowForkIntro(false)
          }}
        />
      )}

      {/* Onboarding Tour */}
      {showTour && (
        <OnboardingTour
          traineeEmail={traineeData.email}
          onComplete={() => setShowTour(false)}
        />
      )}
    </div>
  )
}
