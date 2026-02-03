'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PersonalScoreboard } from '@/components/training'

interface PerformanceRecord {
  activity_id: string
  activity_title: string
  activity_type: string
  day_number: number
  performance_flag: 'fast' | 'on_time' | 'slow' | 'struggling'
  percentage_of_allocated: number
  created_at: string
}

interface AssessmentScore {
  name: string
  score: number
  maxScore: number
  weightage: number
  passed: boolean
  date?: string
}

interface ExpectedAssessment {
  name: string
  weightage: number
  completed: boolean
}

export default function MyScoresPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [performanceData, setPerformanceData] = useState<PerformanceRecord[]>([])
  const [totalActivities, setTotalActivities] = useState(0)
  const [totalDays, setTotalDays] = useState(4)
  const [currentDay, setCurrentDay] = useState(1)
  const [trainingStartDate, setTrainingStartDate] = useState<string | undefined>()
  const [assessments, setAssessments] = useState({ passed: 0, total: 0 })
  const [assessmentScores, setAssessmentScores] = useState<AssessmentScore[]>([])
  const [expectedAssessments, setExpectedAssessments] = useState<ExpectedAssessment[]>([])

  const supabase = createClient()

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Please log in to view your scores')
        return
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('google_sheet_email, training_role')
        .eq('id', user.id)
        .single()

      const traineeEmail = profile?.google_sheet_email || user.email
      let traineeRole = profile?.training_role || 'OS'

      // Fetch trainee data from n8n FIRST to get actual role
      let myData: {
        email?: string
        department?: string
        totalAssessmentsCompleted?: number
        totalAssessmentsRequired?: number
        trainingStartDate?: string
        daysSinceTrainingStart?: number
      } | null = null

      try {
        const traineeResponse = await fetch('/api/trainees', {
          credentials: 'include'
        })
        if (traineeResponse.ok) {
          const trainees = await traineeResponse.json()
          myData = trainees.find((t: { email: string }) =>
            t.email?.toLowerCase() === traineeEmail?.toLowerCase()
          )
          if (myData) {
            // Get actual role from trainee's department field
            if (myData.department) {
              const roleMapping: Record<string, string> = {
                'Onboarding Specialist': 'OS',
                'Merchant Onboarding Manager': 'MOM',
                'Customer Success Manager': 'CSM',
                'Business Consultant': 'BC',
                'Merchant Consultant': 'MC',
                'Onboarding Coordinator': 'OC',
                'Support Consultant': 'SC'
              }
              traineeRole = roleMapping[myData.department] || myData.department
            }

            setAssessments({
              passed: myData.totalAssessmentsCompleted || 0,
              total: myData.totalAssessmentsRequired || 0
            })
            setTrainingStartDate(myData.trainingStartDate)
          }
        }
      } catch {
        // Ignore trainee fetch errors, will use default role
      }

      // Fetch performance data
      const perfResponse = await fetch(
        `/api/training/performance?email=${encodeURIComponent(traineeEmail || '')}`
      )
      if (perfResponse.ok) {
        const perfData = await perfResponse.json()
        setPerformanceData(perfData.performance || [])
      }

      // Fetch training schedule to get totals (now using correct role)
      const scheduleResponse = await fetch(
        `/api/training/schedule?role=${traineeRole}&email=${encodeURIComponent(traineeEmail || '')}`
      )
      if (scheduleResponse.ok) {
        const scheduleData = await scheduleResponse.json()
        setTotalDays(scheduleData.role?.totalDays || 4)

        // Count trackable activities
        let activityCount = 0
        let completedDays = 0
        scheduleData.trainingDays?.forEach((day: { activities: { activityType: string; status: string }[] }) => {
          let dayComplete = true
          day.activities?.forEach((activity: { activityType: string; status: string }) => {
            if (activity.activityType !== 'lunch' && activity.activityType !== 'break') {
              activityCount++
              if (activity.status !== 'completed') {
                dayComplete = false
              }
            }
          })
          if (dayComplete && day.activities.length > 0) {
            completedDays++
          }
        })
        setTotalActivities(activityCount || 20)
        setCurrentDay(Math.min(completedDays + 1, scheduleData.role?.totalDays || 4))

        // Override current day if we have trainee data
        if (myData?.daysSinceTrainingStart) {
          setCurrentDay(Math.min(myData.daysSinceTrainingStart, scheduleData.role?.totalDays || 4))
        }
      }

      // Fetch individual assessment scores with weightages and expected assessments (now using correct role)
      try {
        const scoresResponse = await fetch(
          `/api/training/assessment-scores?email=${encodeURIComponent(traineeEmail || '')}&role=${encodeURIComponent(traineeRole || '')}`,
          { credentials: 'include' }
        )
        if (scoresResponse.ok) {
          const scoresData = await scoresResponse.json()
          if (scoresData.assessmentScores) {
            setAssessmentScores(scoresData.assessmentScores)
          }
          if (scoresData.expectedAssessments) {
            setExpectedAssessments(scoresData.expectedAssessments)
          }
        }
      } catch {
        // Ignore assessment scores fetch errors
      }

    } catch (err) {
      console.error('Error fetching scores data:', err)
      setError('Failed to load scores. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [supabase, totalDays])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading your scores...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Scores</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Scores</h1>
        <p className="text-slate-500 mt-1">Track your training performance and progress</p>
      </div>

      {/* Scoreboard */}
      <div>
        <PersonalScoreboard
          performanceData={performanceData}
          totalActivities={totalActivities}
          assessmentsPassed={assessments.passed}
          assessmentsTotal={assessments.total}
          assessmentScores={assessmentScores}
          expectedAssessments={expectedAssessments}
          trainingStartDate={trainingStartDate}
          currentDay={currentDay}
          totalDays={totalDays}
        />
      </div>
    </div>
  )
}
