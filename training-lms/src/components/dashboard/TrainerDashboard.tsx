'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Trainee } from '@/types/trainee'

interface Reflection {
  id: string
  trainee_email: string
  trainee_name: string
  role_code: string
  day_number: number
  confusing_topic: string
  improvement_notes: string
  confidence_level: number
  created_at: string
}

interface PerformanceRecord {
  id: string
  trainee_email: string
  trainee_name: string
  role_code: string
  day_number: number
  activity_id: string
  activity_title: string
  activity_type: string
  allocated_seconds: number
  actual_seconds: number
  performance_flag: 'fast' | 'on_time' | 'slow' | 'struggling'
  percentage_of_allocated: number
  created_at: string
}

interface PerformanceSummary {
  total: number
  fast: number
  onTime: number
  slow: number
  struggling: number
  averagePercentage: number
}

interface TrainerDashboardProps {
  trainees: Trainee[]
  userName: string
}

// Group trainees by their current training day
function groupByTrainingDay(trainees: Trainee[]) {
  const groups: Record<number, Trainee[]> = {}

  trainees.forEach(trainee => {
    const day = trainee.daysSinceTrainingStart || 0
    if (day >= 1 && day <= 6) { // Only active training (days 1-6)
      if (!groups[day]) groups[day] = []
      groups[day].push(trainee)
    }
  })

  return groups
}

// Get today's expected activities based on training day
function getTodayActivities(day: number, role: string) {
  const commonActivities: Record<number, string[]> = {
    1: ['Kick-off Briefing (1hr)', 'Product Fundamentals Self-Study', 'Live Demo Session'],
    2: ['Product Fundamentals Cont.', 'Quiz Assessment', 'Day 3 Briefing'],
  }

  const roleActivities: Record<string, Record<number, string[]>> = {
    'Customer Success Manager': {
      3: ['Advanced Modules Self-Study', 'CSM Tools Training'],
      4: ['Buddy Session', 'Assessment'],
      5: ['Mock Test', 'Graduation'],
    },
    'Business Consultant': {
      3: ['Pitching & SPIN Training'],
      4: ['Closing Skills Training'],
      5: ['Full Pitching Assessment'],
      6: ['Mock Test', 'Graduation'],
    },
    'Merchant Care': {
      3: ['Advanced Systems Training', 'Brand Servicing'],
      4: ['Assessment', 'Mock Test', 'Handover'],
    },
    'Onboarding Coordinator': {
      3: ['Advanced Modules', 'OC Tools'],
      4: ['Buddy Session', 'Menu Setup'],
      5: ['Mock Test', 'Graduation'],
    },
    'Sales Coordinator': {
      3: ['Advanced Modules', 'SC Tools'],
      4: ['Buddy Session', 'Assessment'],
      5: ['Mock Test', 'Graduation'],
    },
  }

  if (day <= 2) {
    return commonActivities[day] || []
  }

  return roleActivities[role]?.[day] || ['Role-specific Training']
}

// Demo data for when no real trainees exist
// Realistic: Trainees start in batches, so they're on the same training day
const demoTrainees: Trainee[] = [
  // OC Batch - Jan 13 start (currently Day 2) - 4 trainees
  {
    email: 'sarah.chen@storehub.com',
    fullName: 'Sarah Chen',
    status: 'In Progress',
    department: 'Onboarding Coordinator',
    country: 'Malaysia',
    trainingStartDate: '2026-01-13',
    coachName: 'Wei Lin',
    coachEmail: 'wei.lin@storehub.com',
    daysSinceTrainingStart: 2,
    totalAssessmentsRequired: 4,
    totalAssessmentsCompleted: 1,
    totalAssessmentsIncomplete: 3,
    role: 'OC',
    currentTrainingDay: 2,
  },
  {
    email: 'ahmad.rizal@storehub.com',
    fullName: 'Ahmad Rizal',
    status: 'In Progress',
    department: 'Onboarding Coordinator',
    country: 'Malaysia',
    trainingStartDate: '2026-01-13',
    coachName: 'Wei Lin',
    coachEmail: 'wei.lin@storehub.com',
    daysSinceTrainingStart: 2,
    totalAssessmentsRequired: 4,
    totalAssessmentsCompleted: 1,
    totalAssessmentsIncomplete: 3,
    role: 'OC',
    currentTrainingDay: 2,
  },
  {
    email: 'nurul.aina@storehub.com',
    fullName: 'Nurul Aina',
    status: 'In Progress',
    department: 'Onboarding Coordinator',
    country: 'Malaysia',
    trainingStartDate: '2026-01-13',
    coachName: 'Wei Lin',
    coachEmail: 'wei.lin@storehub.com',
    daysSinceTrainingStart: 2,
    totalAssessmentsRequired: 4,
    totalAssessmentsCompleted: 1,
    totalAssessmentsIncomplete: 3,
    role: 'OC',
    currentTrainingDay: 2,
  },
  {
    email: 'kevin.lim@storehub.com',
    fullName: 'Kevin Lim',
    status: 'In Progress',
    department: 'Onboarding Coordinator',
    country: 'Malaysia',
    trainingStartDate: '2026-01-13',
    coachName: 'Wei Lin',
    coachEmail: 'wei.lin@storehub.com',
    daysSinceTrainingStart: 2,
    totalAssessmentsRequired: 4,
    totalAssessmentsCompleted: 0,
    totalAssessmentsIncomplete: 4,
    role: 'OC',
    currentTrainingDay: 2,
    performanceFlag: 'At Risk',
  },
  // CSM Batch - Jan 10 start (currently Day 4, handover tomorrow) - 2 trainees
  {
    email: 'priya.sharma@storehub.com',
    fullName: 'Priya Sharma',
    status: 'In Progress',
    department: 'Customer Success Manager',
    country: 'Malaysia',
    trainingStartDate: '2026-01-10',
    coachName: 'Jason Tan',
    coachEmail: 'jason.tan@storehub.com',
    daysSinceTrainingStart: 4,
    totalAssessmentsRequired: 5,
    totalAssessmentsCompleted: 3,
    totalAssessmentsIncomplete: 2,
    role: 'CSM',
    currentTrainingDay: 4,
  },
  {
    email: 'david.wong@storehub.com',
    fullName: 'David Wong',
    status: 'In Progress',
    department: 'Customer Success Manager',
    country: 'Philippines',
    trainingStartDate: '2026-01-10',
    coachName: 'Jason Tan',
    coachEmail: 'jason.tan@storehub.com',
    daysSinceTrainingStart: 4,
    totalAssessmentsRequired: 5,
    totalAssessmentsCompleted: 4,
    totalAssessmentsIncomplete: 1,
    role: 'CSM',
    currentTrainingDay: 4,
  },
  // New batch starting Jan 19 (not started yet)
  {
    email: 'mei.ling@storehub.com',
    fullName: 'Mei Ling Tan',
    status: 'New',
    department: 'Merchant Care',
    country: 'Malaysia',
    trainingStartDate: '2026-01-19',
    coachName: 'Unassigned',
    coachEmail: '',
    daysSinceTrainingStart: 0,
    totalAssessmentsRequired: 4,
    totalAssessmentsCompleted: 0,
    totalAssessmentsIncomplete: 4,
    role: 'MC',
    currentTrainingDay: 0,
  },
  {
    email: 'raj.kumar@storehub.com',
    fullName: 'Raj Kumar',
    status: 'New',
    department: 'Merchant Care',
    country: 'Malaysia',
    trainingStartDate: '2026-01-19',
    coachName: 'Unassigned',
    coachEmail: '',
    daysSinceTrainingStart: 0,
    totalAssessmentsRequired: 4,
    totalAssessmentsCompleted: 0,
    totalAssessmentsIncomplete: 4,
    role: 'MC',
    currentTrainingDay: 0,
  },
]

const demoReflections: Reflection[] = [
  // Day 1 reflections from OC batch (submitted yesterday)
  {
    id: '1',
    trainee_email: 'sarah.chen@storehub.com',
    trainee_name: 'Sarah Chen',
    role_code: 'OC',
    day_number: 1,
    confusing_topic: 'Difference between BackOffice and Dashboard merchant views',
    improvement_notes: 'Take more notes during the live demo session, the presenter went quite fast',
    confidence_level: 4,
    created_at: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    trainee_email: 'ahmad.rizal@storehub.com',
    trainee_name: 'Ahmad Rizal',
    role_code: 'OC',
    day_number: 1,
    confusing_topic: 'Hardware setup - unsure about printer compatibility with different POS models',
    improvement_notes: 'Ask more questions during the Q&A portion instead of staying quiet',
    confidence_level: 3,
    created_at: new Date(Date.now() - 21 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    trainee_email: 'nurul.aina@storehub.com',
    trainee_name: 'Nurul Aina',
    role_code: 'OC',
    day_number: 1,
    confusing_topic: 'Nothing specific - Day 1 was straightforward',
    improvement_notes: 'Will prepare questions for tomorrow based on the self-study materials',
    confidence_level: 5,
    created_at: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    trainee_email: 'kevin.lim@storehub.com',
    trainee_name: 'Kevin Lim',
    role_code: 'OC',
    day_number: 1,
    confusing_topic: 'Menu categories and modifiers - not clear on the hierarchy',
    improvement_notes: 'Need to revisit the Lark docs, felt a bit overwhelmed with all the new terms',
    confidence_level: 2,
    created_at: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
  },
  // CSM batch Day 3 reflections (from 2 days ago)
  {
    id: '5',
    trainee_email: 'priya.sharma@storehub.com',
    trainee_name: 'Priya Sharma',
    role_code: 'CSM',
    day_number: 3,
    confusing_topic: 'Renewal conversation flow - when to upsell vs just renew',
    improvement_notes: 'Practice the objection handling scripts more before the assessment',
    confidence_level: 4,
    created_at: new Date(Date.now() - 44 * 60 * 60 * 1000).toISOString(),
  },
]

const demoPerformanceRecords: PerformanceRecord[] = [
  // OC Batch Day 1 activities (completed yesterday)
  {
    id: '1',
    trainee_email: 'sarah.chen@storehub.com',
    trainee_name: 'Sarah Chen',
    role_code: 'OC',
    day_number: 1,
    activity_id: 'oc_day1_1',
    activity_title: 'Product Fundamentals Self-Study',
    activity_type: 'self_study',
    allocated_seconds: 5400, // 90 min
    actual_seconds: 4500,    // 75 min
    performance_flag: 'fast',
    percentage_of_allocated: 83,
    created_at: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    trainee_email: 'ahmad.rizal@storehub.com',
    trainee_name: 'Ahmad Rizal',
    role_code: 'OC',
    day_number: 1,
    activity_id: 'oc_day1_1',
    activity_title: 'Product Fundamentals Self-Study',
    activity_type: 'self_study',
    allocated_seconds: 5400,
    actual_seconds: 5200,
    performance_flag: 'on_time',
    percentage_of_allocated: 96,
    created_at: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    trainee_email: 'nurul.aina@storehub.com',
    trainee_name: 'Nurul Aina',
    role_code: 'OC',
    day_number: 1,
    activity_id: 'oc_day1_1',
    activity_title: 'Product Fundamentals Self-Study',
    activity_type: 'self_study',
    allocated_seconds: 5400,
    actual_seconds: 4000,
    performance_flag: 'fast',
    percentage_of_allocated: 74,
    created_at: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    trainee_email: 'kevin.lim@storehub.com',
    trainee_name: 'Kevin Lim',
    role_code: 'OC',
    day_number: 1,
    activity_id: 'oc_day1_1',
    activity_title: 'Product Fundamentals Self-Study',
    activity_type: 'self_study',
    allocated_seconds: 5400,
    actual_seconds: 8100,    // 135 min - struggling
    performance_flag: 'struggling',
    percentage_of_allocated: 150,
    created_at: new Date(Date.now() - 21 * 60 * 60 * 1000).toISOString(),
  },
  // OC Batch Day 1 Quiz
  {
    id: '5',
    trainee_email: 'sarah.chen@storehub.com',
    trainee_name: 'Sarah Chen',
    role_code: 'OC',
    day_number: 1,
    activity_id: 'oc_day1_quiz',
    activity_title: 'Product Fundamentals Quiz',
    activity_type: 'assessment',
    allocated_seconds: 1800, // 30 min
    actual_seconds: 1500,
    performance_flag: 'fast',
    percentage_of_allocated: 83,
    created_at: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    trainee_email: 'kevin.lim@storehub.com',
    trainee_name: 'Kevin Lim',
    role_code: 'OC',
    day_number: 1,
    activity_id: 'oc_day1_quiz',
    activity_title: 'Product Fundamentals Quiz',
    activity_type: 'assessment',
    allocated_seconds: 1800,
    actual_seconds: 2400,
    performance_flag: 'slow',
    percentage_of_allocated: 133,
    created_at: new Date(Date.now() - 19 * 60 * 60 * 1000).toISOString(),
  },
  // CSM Batch Day 4 activities (today)
  {
    id: '7',
    trainee_email: 'priya.sharma@storehub.com',
    trainee_name: 'Priya Sharma',
    role_code: 'CSM',
    day_number: 4,
    activity_id: 'csm_day4_buddy',
    activity_title: 'Buddy Session with Senior CSM',
    activity_type: 'buddy_session',
    allocated_seconds: 7200, // 2 hours
    actual_seconds: 7000,
    performance_flag: 'on_time',
    percentage_of_allocated: 97,
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '8',
    trainee_email: 'david.wong@storehub.com',
    trainee_name: 'David Wong',
    role_code: 'CSM',
    day_number: 4,
    activity_id: 'csm_day4_buddy',
    activity_title: 'Buddy Session with Senior CSM',
    activity_type: 'buddy_session',
    allocated_seconds: 7200,
    actual_seconds: 6300,
    performance_flag: 'fast',
    percentage_of_allocated: 88,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
]

const demoPerformanceSummary: PerformanceSummary = {
  total: 8,
  fast: 4,
  onTime: 2,
  slow: 1,
  struggling: 1,
  averagePercentage: 98,
}

export default function TrainerDashboard({ trainees, userName }: TrainerDashboardProps) {
  const [actionStatus, setActionStatus] = useState<string | null>(null)
  const [reflections, setReflections] = useState<Reflection[]>([])
  const [loadingReflections, setLoadingReflections] = useState(true)
  const [performanceRecords, setPerformanceRecords] = useState<PerformanceRecord[]>([])
  const [performanceSummary, setPerformanceSummary] = useState<PerformanceSummary | null>(null)
  const [loadingPerformance, setLoadingPerformance] = useState(true)

  // Use demo data if no real trainees
  const hasRealData = trainees.length > 0
  const displayTrainees = hasRealData ? trainees : demoTrainees

  // Fetch recent reflections (or use demo data)
  useEffect(() => {
    async function fetchReflections() {
      try {
        const response = await fetch('/api/training/reflection')
        if (response.ok) {
          const data = await response.json()
          const fetchedReflections = data.reflections?.slice(0, 5) || []
          // Use demo data if no real reflections
          setReflections(fetchedReflections.length > 0 ? fetchedReflections : demoReflections)
        } else {
          setReflections(demoReflections)
        }
      } catch (error) {
        console.error('Failed to fetch reflections:', error)
        setReflections(demoReflections)
      } finally {
        setLoadingReflections(false)
      }
    }
    fetchReflections()
  }, [])

  // Fetch performance tracking data (or use demo data)
  useEffect(() => {
    async function fetchPerformance() {
      try {
        const response = await fetch('/api/training/performance')
        if (response.ok) {
          const data = await response.json()
          const fetchedRecords = data.performance?.slice(0, 10) || []
          // Use demo data if no real performance data
          setPerformanceRecords(fetchedRecords.length > 0 ? fetchedRecords : demoPerformanceRecords)
          setPerformanceSummary(data.summary?.total > 0 ? data.summary : demoPerformanceSummary)
        } else {
          setPerformanceRecords(demoPerformanceRecords)
          setPerformanceSummary(demoPerformanceSummary)
        }
      } catch (error) {
        console.error('Failed to fetch performance:', error)
        setPerformanceRecords(demoPerformanceRecords)
        setPerformanceSummary(demoPerformanceSummary)
      } finally {
        setLoadingPerformance(false)
      }
    }
    fetchPerformance()
  }, [])

  // Get active trainees (those currently in training)
  const activeTrainees = displayTrainees.filter(t =>
    t.daysSinceTrainingStart >= 1 &&
    t.daysSinceTrainingStart <= 6 &&
    !['Training Complete', 'Report Sent', 'Graduated'].includes(t.status)
  )

  const groupedByDay = groupByTrainingDay(activeTrainees)
  const trainingDays = Object.keys(groupedByDay).map(Number).sort((a, b) => a - b)

  // Stats
  const day1And2Count = (groupedByDay[1]?.length || 0) + (groupedByDay[2]?.length || 0)
  const day3PlusCount = activeTrainees.length - day1And2Count
  const newTraineesCount = displayTrainees.filter(t => t.status === 'New').length
  const pendingAssessments = displayTrainees.filter(t =>
    t.totalAssessmentsRequired > t.totalAssessmentsCompleted
  ).length

  // Trigger workflow action
  const triggerWorkflow = async (workflow: string, description: string) => {
    setActionStatus(`Triggering: ${description}...`)

    try {
      const response = await fetch(`/api/workflows/${workflow}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (response.ok) {
        setActionStatus(`Done! ${description}`)
      } else {
        setActionStatus(`Error: Could not trigger ${workflow}`)
      }
    } catch {
      setActionStatus(`Error: Failed to connect`)
    }

    setTimeout(() => setActionStatus(null), 3000)
  }

  // Send welcome email to a specific trainee
  const sendWelcomeEmail = async (trainee: Trainee) => {
    setActionStatus(`Sending welcome email to ${trainee.fullName}...`)

    try {
      const response = await fetch('/api/workflows/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trainee.email,
          fullName: trainee.fullName,
          role: trainee.department,
          country: trainee.country,
          trainingStartDate: trainee.trainingStartDate,
          coachName: trainee.coachName,
          coachEmail: trainee.coachEmail,
        }),
      })

      if (response.ok) {
        setActionStatus(`Welcome email sent to ${trainee.fullName}!`)
        // Refresh the page to update trainee status
        window.location.reload()
      } else {
        const error = await response.json()
        setActionStatus(`Error: ${error.error || 'Could not send email'}`)
      }
    } catch {
      setActionStatus(`Error: Failed to connect`)
    }

    setTimeout(() => setActionStatus(null), 5000)
  }

  // Get trainees who need welcome emails (Status = "New")
  const newTrainees = displayTrainees.filter(t => t.status === 'New')

  return (
    <div className="space-y-6">
      {/* Demo Mode Banner */}
      {!hasRealData && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-amber-800">Demo Mode</p>
            <p className="text-sm text-amber-600">Showing sample data. Real trainee data will appear once connected to n8n.</p>
          </div>
        </div>
      )}

      {/* Welcome & Quick Stats */}
      <div className="rounded-xl shadow-sm p-6 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border border-amber-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--sh-black)]" style={{ fontFamily: 'var(--font-barlow), system-ui, sans-serif' }}>Good morning, {userName}!</h1>
            <p className="mt-2 text-slate-600 leading-relaxed">Here&apos;s your training overview for today</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-[var(--sh-orange)]">{activeTrainees.length}</p>
            <p className="text-sm text-slate-500">Active Trainees</p>
          </div>
        </div>

        {/* Action Status Toast */}
        {actionStatus && (
          <div className="mt-4 p-3 bg-white/70 border border-amber-200 rounded-lg text-slate-700 text-sm">
            {actionStatus}
          </div>
        )}
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#e9f0fd' }}>
              <svg className="w-5 h-5" style={{ color: '#2a6ee8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: '#2f2922' }}>{day1And2Count}</p>
              <p className="text-sm" style={{ color: '#7a7672' }}>Day 1-2 (Fundamentals)</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{day3PlusCount}</p>
              <p className="text-sm text-slate-500">Day 3+ (Role-Specific)</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{newTraineesCount}</p>
              <p className="text-sm text-slate-500">New (Pending Setup)</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{pendingAssessments}</p>
              <p className="text-sm text-slate-500">Pending Assessments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Training Batches */}
      <div className="bg-white rounded-xl border border-slate-100">
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Active Training Batches</h2>
            <Link href="/dashboard/trainees" className="text-sm text-blue-600 hover:text-orange-800">
              View all trainees
            </Link>
          </div>
        </div>

        {trainingDays.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {trainingDays.map(day => (
              <div key={day} className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                    day <= 2 ? 'bg-blue-100 text-orange-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {day}
                  </span>
                  <div>
                    <h3 className="font-medium text-slate-900">
                      Day {day}: {day <= 2 ? 'Product Fundamentals' : 'Role-Specific Training'}
                    </h3>
                    <p className="text-sm text-slate-500">{groupedByDay[day].length} trainee{groupedByDay[day].length !== 1 ? 's' : ''}</p>
                  </div>
                </div>

                <div className="ml-11 space-y-2">
                  {groupedByDay[day].map(trainee => {
                    const activities = getTodayActivities(day, trainee.department)
                    return (
                      <div key={trainee.email} className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-sm font-medium text-slate-600">
                            {trainee.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 text-sm">{trainee.fullName}</p>
                            <p className="text-xs text-slate-500">{trainee.department} - {trainee.country}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p className="text-xs text-slate-500">Today&apos;s focus:</p>
                            <p className="text-xs font-medium text-slate-700">{activities[0] || 'Training'}</p>
                          </div>
                          <Link
                            href={`/dashboard/trainees/${encodeURIComponent(trainee.email)}`}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-orange-50 rounded transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500">
            <p>No active training batches right now</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-slate-100">
        <div className="p-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
          <p className="text-sm text-slate-500 mt-1">One-click workflow triggers</p>
        </div>

        <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => triggerWorkflow('reminder', 'Send incomplete assessment reminders')}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50 transition-colors"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <span className="text-sm font-medium text-slate-700">Send Reminders</span>
          </button>

          <button
            onClick={() => triggerWorkflow('report', 'Generate performance reports')}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50 transition-colors"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-slate-700">Generate Reports</span>
          </button>

          <button
            onClick={() => triggerWorkflow('feedback', 'Send feedback surveys')}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50 transition-colors"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-slate-700">Send Surveys</span>
          </button>

          <Link
            href="/dashboard/assessments"
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50 transition-colors"
          >
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <span className="text-sm font-medium text-slate-700">View Assessments</span>
          </Link>
        </div>
      </div>

      {/* New Trainees - Send Welcome */}
      {newTrainees.length > 0 && (
        <div className="bg-white rounded-xl border border-blue-200 shadow-sm">
          <div className="p-4 border-b border-blue-100 bg-blue-50 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">New Trainees - Pending Welcome Email</h2>
                  <p className="text-sm text-slate-500">{newTrainees.length} trainee{newTrainees.length !== 1 ? 's' : ''} need welcome emails</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {newTrainees.map((trainee) => (
              <div key={trainee.email} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-medium">
                    {trainee.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{trainee.fullName}</p>
                    <p className="text-sm text-slate-500">{trainee.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-700">{trainee.department}</p>
                    <p className="text-xs text-slate-500">Start: {trainee.trainingStartDate}</p>
                  </div>
                  <button
                    onClick={() => sendWelcomeEmail(trainee)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Send Welcome
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today's Sessions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Your Sessions Today */}
        <div className="bg-white rounded-xl border border-slate-100">
          <div className="p-4 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900">Your Sessions Today</h2>
          </div>
          <div className="p-4 space-y-3">
            {activeTrainees.some(t => t.daysSinceTrainingStart <= 2) ? (
              <>
                {activeTrainees.some(t => t.daysSinceTrainingStart === 1) && (
                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
                    <div className="w-12 h-12 bg-orange-600 rounded-lg flex flex-col items-center justify-center text-white">
                      <span className="text-xs">AM</span>
                      <span className="text-sm font-bold">9:30</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Kick-off Briefing</p>
                      <p className="text-sm text-slate-500">Day 1 trainees - 1 hour</p>
                    </div>
                  </div>
                )}
                {activeTrainees.some(t => t.daysSinceTrainingStart <= 2) && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex flex-col items-center justify-center text-white">
                      <span className="text-xs">PM</span>
                      <span className="text-sm font-bold">2:00</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Product Demo Session</p>
                      <p className="text-sm text-slate-500">Day 1-2 trainees - 2.5 hours</p>
                    </div>
                  </div>
                )}
                {activeTrainees.some(t => t.daysSinceTrainingStart === 2) && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="w-12 h-12 bg-slate-600 rounded-lg flex flex-col items-center justify-center text-white">
                      <span className="text-xs">PM</span>
                      <span className="text-sm font-bold">5:00</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Day 3 Briefing</p>
                      <p className="text-sm text-slate-500">Day 2 trainees - 30 mins</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-6 text-slate-500">
                <p>No trainer-led sessions today</p>
                <p className="text-sm mt-1">Day 1-2 trainees have live sessions</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Handovers */}
        <div className="bg-white rounded-xl border border-slate-100">
          <div className="p-4 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900">Upcoming Handovers</h2>
          </div>
          <div className="p-4">
            {activeTrainees.filter(t => {
              // MC hands over on Day 4, others on Day 5-6
              const handoverDay = t.department === 'Merchant Care' ? 4 : 5
              return t.daysSinceTrainingStart >= handoverDay - 1 && t.daysSinceTrainingStart <= handoverDay
            }).length > 0 ? (
              <div className="space-y-3">
                {activeTrainees.filter(t => {
                  const handoverDay = t.department === 'Merchant Care' ? 4 : 5
                  return t.daysSinceTrainingStart >= handoverDay - 1 && t.daysSinceTrainingStart <= handoverDay
                }).map(trainee => (
                  <div key={trainee.email} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{trainee.fullName}</p>
                        <p className="text-xs text-slate-500">{trainee.department}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Handover to:</p>
                      <p className="text-sm font-medium text-slate-700">{trainee.coachName || 'TL'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500">
                <p>No handovers scheduled soon</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Trainee Reflections */}
      <div className="bg-white rounded-xl border border-slate-100">
        <div className="p-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">Recent Trainee Reflections</h2>
          <p className="text-sm text-slate-500 mt-1">End-of-day feedback from trainees</p>
        </div>
        <div className="p-4">
          {loadingReflections ? (
            <div className="text-center py-6 text-slate-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600 mx-auto mb-2"></div>
              <p className="text-sm">Loading reflections...</p>
            </div>
          ) : reflections.length > 0 ? (
            <div className="space-y-4">
              {reflections.map((reflection) => (
                <div key={reflection.id} className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-medium">
                        {reflection.trainee_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{reflection.trainee_name || reflection.trainee_email}</p>
                        <p className="text-xs text-slate-500">Day {reflection.day_number} • {reflection.role_code}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-500">Confidence:</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`w-2 h-2 rounded-full ${
                              level <= reflection.confidence_level ? 'bg-blue-500' : 'bg-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  {reflection.confusing_topic && (
                    <div className="mb-2">
                      <p className="text-xs font-medium text-slate-500 mb-1">Confusing Topic:</p>
                      <p className="text-sm text-slate-700">{reflection.confusing_topic}</p>
                    </div>
                  )}
                  {reflection.improvement_notes && (
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1">Would do differently:</p>
                      <p className="text-sm text-slate-700">{reflection.improvement_notes}</p>
                    </div>
                  )}
                  <p className="text-xs text-slate-400 mt-2">
                    {new Date(reflection.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500">
              <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <p>No reflections submitted yet</p>
              <p className="text-sm mt-1">Trainees will submit reflections after completing each day</p>
            </div>
          )}
        </div>
      </div>

      {/* Performance Tracking - Who's Struggling vs Fast Learners */}
      <div className="bg-white rounded-xl border border-slate-100">
        <div className="p-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">Activity Performance Tracking</h2>
          <p className="text-sm text-slate-500 mt-1">Monitor trainee learning speed and identify who needs help</p>
        </div>

        {/* Performance Summary Stats */}
        {performanceSummary && performanceSummary.total > 0 && (
          <div className="grid grid-cols-5 gap-4 p-4 bg-slate-50 border-b border-slate-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">{performanceSummary.total}</p>
              <p className="text-xs text-slate-500">Total Activities</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{performanceSummary.fast}</p>
              <p className="text-xs text-blue-600">Fast Learners</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{performanceSummary.onTime}</p>
              <p className="text-xs text-blue-600">On Time</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-600">{performanceSummary.slow}</p>
              <p className="text-xs text-amber-600">Slow</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{performanceSummary.struggling}</p>
              <p className="text-xs text-red-600">Struggling</p>
            </div>
          </div>
        )}

        <div className="p-4">
          {loadingPerformance ? (
            <div className="text-center py-6 text-slate-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600 mx-auto mb-2"></div>
              <p className="text-sm">Loading performance data...</p>
            </div>
          ) : performanceRecords.length > 0 ? (
            <div className="space-y-3">
              {performanceRecords.map((record) => {
                const flagConfig = {
                  fast: { label: 'Fast Learner', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: '🚀' },
                  on_time: { label: 'On Time', color: 'bg-blue-100 text-orange-700 border-orange-200', icon: '✓' },
                  slow: { label: 'Slow', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: '⏱️' },
                  struggling: { label: 'Needs Help', color: 'bg-red-100 text-red-700 border-red-200', icon: '⚠️' },
                }
                const config = flagConfig[record.performance_flag]
                const allocatedMinutes = Math.round(record.allocated_seconds / 60)
                const actualMinutes = Math.round(record.actual_seconds / 60)

                return (
                  <div
                    key={record.id}
                    className={`p-3 rounded-lg border ${
                      record.performance_flag === 'struggling' ? 'bg-red-50 border-red-200' :
                      record.performance_flag === 'slow' ? 'bg-amber-50 border-amber-200' :
                      'bg-slate-50 border-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                          record.performance_flag === 'struggling' ? 'bg-red-100 text-red-600' :
                          record.performance_flag === 'slow' ? 'bg-amber-100 text-amber-600' :
                          record.performance_flag === 'fast' ? 'bg-blue-100 text-blue-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {record.trainee_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 text-sm">
                            {record.trainee_name || record.trainee_email?.split('@')[0]}
                          </p>
                          <p className="text-xs text-slate-500">
                            {record.activity_title} • Day {record.day_number}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-xs text-slate-500">Time</p>
                          <p className={`text-sm font-medium ${
                            record.performance_flag === 'struggling' ? 'text-red-600' :
                            record.performance_flag === 'slow' ? 'text-amber-600' :
                            record.performance_flag === 'fast' ? 'text-blue-600' :
                            'text-slate-900'
                          }`}>
                            {actualMinutes}m / {allocatedMinutes}m
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
                          {config.icon} {config.label}
                        </span>
                      </div>
                    </div>
                    {record.performance_flag === 'struggling' && (
                      <p className="text-xs text-red-600 mt-2 pl-11">
                        Took {record.percentage_of_allocated}% of allocated time - may need additional support
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500">
              <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>No performance data yet</p>
              <p className="text-sm mt-1">Data will appear when trainees complete activities</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
