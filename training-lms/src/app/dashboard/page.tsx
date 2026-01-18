import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Trainee, RiskLevel } from '@/types/trainee'
import NeedsAttentionSection from '@/components/dashboard/NeedsAttentionSection'
import TrainerDashboard from '@/components/dashboard/TrainerDashboard'

interface AdminStats {
  total: number
  pendingAssessments: number
  completionRate: number
  trainees: Trainee[]
  critical: Trainee[]
  atRisk: Trainee[]
  onTrack: Trainee[]
  newTrainees: Trainee[]
}

async function getAllTrainees(): Promise<Trainee[]> {
  try {
    const n8nUrl = process.env.N8N_WEBHOOK_TRAINEES
    if (!n8nUrl) return []

    const response = await fetch(n8nUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    })

    if (!response.ok) return []

    const data = await response.json()
    return data.map((item: Record<string, unknown>) => ({
      email: String(item['Email Address'] || ''),
      fullName: String(item['Full Name'] || ''),
      status: String(item['Status'] || 'New'),
      department: String(item['Role'] || ''),  // Role column from Google Sheet
      country: String(item['Country'] || ''),
      trainingStartDate: String(item['Training Start Date'] || ''),
      coachName: String(item['Coach Name'] || ''),
      coachEmail: String(item['Coach Email'] || ''),
      daysSinceTrainingStart: parseInt(String(item['Days since Training Start '] || item['Days since Training Start'] || '0')) || 0,
      totalAssessmentsRequired: parseInt(String(item['Total Assessments Required'] || '0')) || 0,
      totalAssessmentsCompleted: parseInt(String(item['Total Assessments Completed'] || '0')) || 0,
      totalAssessmentsIncomplete: parseInt(String(item['Total Assessments Incomplete'] || '0')) || 0,
      // New fields from Google Sheets (handle trailing spaces in column names)
      performanceFlag: String(item['Performance Flag '] || item['Performance Flag'] || '').trim() || undefined,
      delayReason: String(item['Delay Reason'] || '').trim() || undefined,
      daysExtended: parseInt(String(item['Total Days Extended'] || '0')) || undefined,
      adjustedEndDate: String(item['Adjusted End Date '] || item['Adjusted End Date'] || '').trim() || undefined,
      originalEndDate: String(item['Original End Date'] || '').trim() || undefined,
      role: String(item['Role'] || '').trim() || undefined,
      notes: String(item['Notes'] || '').trim() || undefined,
      currentTrainingDay: parseInt(String(item['Current Training Day'] || '0')) || undefined,
    })).filter((t: Trainee) => t.fullName)
  } catch {
    return []
  }
}

// Fetch activity progress from Supabase for a trainee
async function getTraineeProgress(email: string, role: string = 'OC'): Promise<{
  completedActivities: number
  totalActivities: number
}> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    // Fetch completed activities from Supabase
    const response = await fetch(
      `${baseUrl}/api/training/performance?email=${encodeURIComponent(email)}`,
      { cache: 'no-store' }
    )

    const completed = response.ok
      ? (await response.json()).performance?.length || 0
      : 0

    // Fetch total activities from training schedule API
    const scheduleResponse = await fetch(
      `${baseUrl}/api/training/schedule?role=${role}&email=${encodeURIComponent(email)}`,
      { cache: 'no-store' }
    )

    let totalActivities = 0
    if (scheduleResponse.ok) {
      const scheduleData = await scheduleResponse.json()
      // Count trackable activities (exclude lunch/break)
      scheduleData.trainingDays?.forEach((day: { activities: { activityType: string }[] }) => {
        day.activities?.forEach((activity: { activityType: string }) => {
          if (activity.activityType !== 'lunch' && activity.activityType !== 'break') {
            totalActivities++
          }
        })
      })
    }

    // Fallback to 20 if schedule API fails (OC has 20 trackable activities)
    if (totalActivities === 0) totalActivities = 20

    return { completedActivities: completed, totalActivities }
  } catch {
    return { completedActivities: 0, totalActivities: 20 }
  }
}

// Calculate risk level for a trainee
function calculateRiskLevel(trainee: Trainee): RiskLevel {
  // Use performance flag if available from Google Sheets
  if (trainee.performanceFlag) {
    const flag = trainee.performanceFlag.toLowerCase()
    if (flag.includes('critical') || flag.includes('overdue')) return 'critical'
    if (flag.includes('risk') || flag.includes('behind')) return 'at-risk'
    if (flag.includes('track') || flag.includes('good')) return 'on-track'
  }

  // Fallback calculation based on progress
  const { daysSinceTrainingStart, totalAssessmentsCompleted, totalAssessmentsRequired } = trainee
  if (totalAssessmentsRequired === 0) return 'unknown'

  const expectedProgress = Math.min(daysSinceTrainingStart / 30, 1)
  const actualProgress = totalAssessmentsCompleted / totalAssessmentsRequired

  if (actualProgress < expectedProgress - 0.2) return 'critical'
  if (actualProgress < expectedProgress - 0.05) return 'at-risk'
  return 'on-track'
}

function calculateAdminStats(trainees: Trainee[]): AdminStats {
  const total = trainees.length
  const pendingAssessments = trainees.reduce((acc, t) => acc + (t.totalAssessmentsRequired - t.totalAssessmentsCompleted), 0)
  const completionRate = trainees.length > 0
    ? Math.round(
        trainees.reduce((acc, t) => {
          const required = t.totalAssessmentsRequired || 1
          const completed = t.totalAssessmentsCompleted || 0
          return acc + (completed / required) * 100
        }, 0) / trainees.length
      )
    : 0

  // Categorize by risk level
  const critical = trainees.filter(t => calculateRiskLevel(t) === 'critical')
  const atRisk = trainees.filter(t => calculateRiskLevel(t) === 'at-risk')
  const onTrack = trainees.filter(t => calculateRiskLevel(t) === 'on-track')
  const newTrainees = trainees.filter(t => t.status === 'New')

  return { total, pendingAssessments, completionRate, trainees, critical, atRisk, onTrack, newTrainees }
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  const userRole = profile?.role || 'trainee'
  const allTrainees = await getAllTrainees()

  // Check if user is a trainer - only admins and trainers see the trainer dashboard
  const isTrainer = profile?.role === 'admin' || profile?.role === 'trainer'

  // Trainer Dashboard (for Andrea) - check before trainee to prioritize trainer view
  if (isTrainer) {
    const stats = calculateAdminStats(allTrainees)
    return (
      <TrainerDashboard
        trainees={allTrainees}
        userName={profile?.full_name || user?.email?.split('@')[0] || 'Trainer'}
      />
    )
  }

  // For trainees, find their own record by matching email
  const myTraineeData = userRole === 'trainee'
    ? allTrainees.find(t => t.email.toLowerCase() === user?.email?.toLowerCase())
    : null

  // Get trainee's role (OC, OS, etc.) - default to OC for the pilot
  const traineeRole = myTraineeData?.department || profile?.training_role || 'OC'

  // Fetch activity progress from Supabase for trainee
  const activityProgress = userRole === 'trainee' && user?.email
    ? await getTraineeProgress(user.email, traineeRole)
    : { completedActivities: 0, totalActivities: 0 }

  // Admin/Coach stats
  const stats = calculateAdminStats(allTrainees)

  // Trainee Dashboard
  if (userRole === 'trainee') {
    return <TraineeDashboard user={user} profile={profile} traineeData={myTraineeData} activityProgress={activityProgress} />
  }

  // Admin/Coach Dashboard
  return (
    <div className="space-y-6">
      {/* Header with greeting */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--sh-black)]">
          Welcome back, {profile?.full_name || user?.email}!
        </h1>
        <p className="text-[var(--neutral-400)] mt-1">
          Here&apos;s what needs your attention today.
        </p>
      </div>

      {/* Needs Attention Summary Bar */}
      <div className="grid grid-cols-3 gap-4">
        <Link
          href="/dashboard/trainees?filter=critical"
          className={`p-4 rounded-xl border-2 transition-all ${
            stats.critical.length > 0
              ? 'bg-red-50 border-red-200 hover:border-red-400'
              : 'bg-slate-50 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${stats.critical.length > 0 ? 'bg-red-500' : 'bg-slate-300'}`} />
            <div>
              <span className={`text-2xl font-bold ${stats.critical.length > 0 ? 'text-red-700' : 'text-slate-500'}`}>
                {stats.critical.length}
              </span>
              <p className={`text-sm font-medium ${stats.critical.length > 0 ? 'text-red-600' : 'text-slate-500'}`}>
                Overdue
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/trainees?filter=at-risk"
          className={`p-4 rounded-xl border-2 transition-all ${
            stats.atRisk.length > 0
              ? 'bg-amber-50 border-amber-200 hover:border-amber-400'
              : 'bg-slate-50 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${stats.atRisk.length > 0 ? 'bg-amber-500' : 'bg-slate-300'}`} />
            <div>
              <span className={`text-2xl font-bold ${stats.atRisk.length > 0 ? 'text-amber-700' : 'text-slate-500'}`}>
                {stats.atRisk.length}
              </span>
              <p className={`text-sm font-medium ${stats.atRisk.length > 0 ? 'text-amber-600' : 'text-slate-500'}`}>
                At Risk
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/trainees?filter=on-track"
          className="p-4 rounded-xl border-2 bg-[var(--blue-100)] border-[var(--blue-300)] hover:border-[var(--sh-blue)] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[var(--sh-blue)]" />
            <div>
              <span className="text-2xl font-bold text-[var(--blue-600)]">{stats.onTrack.length}</span>
              <p className="text-sm font-medium text-[var(--blue-500)]">On Track</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Needs Attention Section - Critical and At Risk */}
      <NeedsAttentionSection
        critical={stats.critical}
        atRisk={stats.atRisk}
        allTrainees={stats.trainees}
      />

      {/* Today's Actions */}
      <div className="bg-white rounded-xl border border-[var(--neutral-100)] p-6">
        <h2 className="text-lg font-semibold text-[var(--sh-black)] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.newTrainees.length > 0 && (
            <Link
              href="/dashboard/trainees?filter=new"
              className="flex items-center gap-3 p-4 bg-[var(--orange-100)] rounded-xl hover:bg-[var(--orange-200)] transition-colors border border-[var(--orange-300)]"
            >
              <div className="w-10 h-10 bg-[var(--sh-orange)] rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-[var(--sh-black)]">{stats.newTrainees.length} New</p>
                <p className="text-sm text-[var(--sh-orange)]">Need welcome email</p>
              </div>
            </Link>
          )}
          <Link
            href="/dashboard/trainees"
            className="flex items-center gap-3 p-4 bg-[var(--neutral-100)] rounded-xl hover:bg-[var(--orange-100)] transition-colors border border-[var(--neutral-200)]"
          >
            <div className="w-10 h-10 bg-[var(--sh-orange)] rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-[var(--sh-black)]">All Trainees</p>
              <p className="text-sm text-[var(--neutral-300)]">{stats.total} active</p>
            </div>
          </Link>
          <Link
            href="/dashboard/reports"
            className="flex items-center gap-3 p-4 bg-[var(--neutral-100)] rounded-xl hover:bg-[var(--orange-100)] transition-colors border border-[var(--neutral-200)]"
          >
            <div className="w-10 h-10 bg-[var(--sh-orange)] rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-[var(--sh-black)]">Reports</p>
              <p className="text-sm text-[var(--neutral-300)]">Performance analytics</p>
            </div>
          </Link>
          {userRole === 'admin' && (
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 p-4 bg-[var(--neutral-100)] rounded-xl hover:bg-[var(--orange-100)] transition-colors border border-[var(--neutral-200)]"
            >
              <div className="w-10 h-10 bg-[var(--neutral-400)] rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-[var(--sh-black)]">Settings</p>
                <p className="text-sm text-[var(--neutral-300)]">Manage users</p>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-[var(--neutral-100)] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--neutral-300)]">Total Trainees</p>
              <p className="text-2xl font-bold text-[var(--sh-black)]">{stats.total}</p>
            </div>
            <div className="w-10 h-10 bg-[var(--orange-100)] rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-[var(--sh-orange)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[var(--neutral-100)] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--neutral-300)]">Assessments Pending</p>
              <p className="text-2xl font-bold text-[var(--sh-black)]">{stats.pendingAssessments}</p>
            </div>
            <div className="w-10 h-10 bg-[var(--orange-200)] rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-[var(--orange-700)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[var(--neutral-100)] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--neutral-300)]">Avg Completion</p>
              <p className="text-2xl font-bold text-[var(--sh-black)]">{stats.completionRate}%</p>
            </div>
            <div className="w-10 h-10 bg-[var(--blue-100)] rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-[var(--sh-blue)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* n8n Connected Status */}
      {stats.total > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <div>
            <p className="text-orange-800 font-medium">Connected to n8n</p>
            <p className="text-orange-700 text-sm">Live data from Google Sheets via n8n webhook</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Trainee-specific Dashboard Component
function TraineeDashboard({
  user,
  profile,
  traineeData,
  activityProgress,
}: {
  user: { email?: string } | null
  profile: { full_name?: string; role?: string; training_role?: string } | null
  traineeData: Trainee | null | undefined
  activityProgress: { completedActivities: number; totalActivities: number }
}) {
  // Use Supabase activity progress for completion percentage
  const completionPercentage = activityProgress.totalActivities > 0
    ? Math.round((activityProgress.completedActivities / activityProgress.totalActivities) * 100)
    : 0

  // Calculate training day from start date
  const calculateTrainingDay = (): number => {
    if (traineeData?.daysSinceTrainingStart && traineeData.daysSinceTrainingStart > 0) {
      return traineeData.daysSinceTrainingStart
    }
    if (traineeData?.trainingStartDate) {
      const start = new Date(traineeData.trainingStartDate)
      const today = new Date()
      const diffDays = Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      return Math.max(1, diffDays)
    }
    // Default to day 1 if no start date
    return 1
  }

  // Derive status from actual progress
  const getDerivedStatus = (): string => {
    if (activityProgress.completedActivities === 0) {
      return traineeData?.status || 'New'
    }
    if (activityProgress.completedActivities >= activityProgress.totalActivities) {
      return 'Training Complete'
    }
    return 'In Progress'
  }

  const trainingDay = calculateTrainingDay()
  const derivedStatus = getDerivedStatus()

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="rounded-xl shadow-sm p-6 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border border-amber-100">
        <h1 className="text-2xl font-bold text-[var(--sh-black)]" style={{ fontFamily: 'Barlow, sans-serif' }}>
          Welcome, {profile?.full_name || traineeData?.fullName || user?.email}!
        </h1>
        <p className="mt-2 text-slate-600 leading-relaxed">
          Track your training progress and stay on top of your assessments.
        </p>
      </div>

      {traineeData ? (
        <>
          {/* Progress Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-100 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Training Day</p>
                  <p className="text-3xl font-bold text-slate-900">Day {trainingDay}</p>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#fff4e8' }}>
                  <svg className="w-6 h-6" style={{ color: '#ff9419' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Completion</p>
                  <p className="text-3xl font-bold text-slate-900">{completionPercentage}%</p>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#e9f0fd' }}>
                  <svg className="w-6 h-6" style={{ color: '#2a6ee8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Activities Done</p>
                  <p className="text-3xl font-bold text-slate-900">{activityProgress.completedActivities}/{activityProgress.totalActivities}</p>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#ffe1bf' }}>
                  <svg className="w-6 h-6" style={{ color: '#ff630f' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Status</p>
                  <StatusBadge status={derivedStatus} />
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#e9f0fd' }}>
                  <svg className="w-6 h-6" style={{ color: '#2a6ee8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-white rounded-xl border border-slate-100 p-6">
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#2f2922', fontFamily: 'Barlow, sans-serif' }}>Your Training Progress</h2>
            <div className="mb-4">
              <div className="flex justify-between text-sm text-slate-600 mb-2">
                <span>Progress</span>
                <span>{activityProgress.completedActivities} of {activityProgress.totalActivities} activities completed</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(completionPercentage, 100)}%`,
                    backgroundColor: completionPercentage >= 100 ? '#2a6ee8' : completionPercentage >= 50 ? '#ff9419' : '#ff630f'
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="rounded-xl p-3" style={{ backgroundColor: '#e9f0fd', border: '1px solid #c4d7f9' }}>
                <p className="text-2xl font-bold" style={{ color: '#2a6ee8' }}>{activityProgress.completedActivities}</p>
                <p className="text-sm" style={{ color: '#5088ec' }}>Completed</p>
              </div>
              <div className="rounded-xl p-3" style={{ backgroundColor: '#ffeef0', border: '1px solid #ffcfd7' }}>
                <p className="text-2xl font-bold" style={{ color: '#ff546f' }}>{activityProgress.totalActivities - activityProgress.completedActivities}</p>
                <p className="text-sm" style={{ color: '#ff7389' }}>Remaining</p>
              </div>
              <div className="rounded-xl p-3" style={{ backgroundColor: '#fff4e8', border: '1px solid #ffe1bf' }}>
                <p className="text-2xl font-bold" style={{ color: '#ff9419' }}>{activityProgress.totalActivities}</p>
                <p className="text-sm" style={{ color: '#ffa742' }}>Total</p>
              </div>
            </div>
          </div>

          {/* Training Timeline */}
          <div className="bg-white rounded-xl border border-slate-100 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Training Timeline</h2>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />
              <div className="space-y-6">
                <TimelineItem
                  date={traineeData.trainingStartDate}
                  title="Training Started"
                  description="You began your onboarding journey"
                  status="completed"
                />
                <TimelineItem
                  date={derivedStatus !== 'New' ? traineeData.trainingStartDate : undefined}
                  title="Welcome Email Received"
                  description="Resource pack and calendar invites delivered"
                  status={derivedStatus === 'New' ? 'pending' : 'completed'}
                />
                <TimelineItem
                  title="Training In Progress"
                  description={`${activityProgress.completedActivities} of ${activityProgress.totalActivities} activities completed`}
                  status={
                    activityProgress.completedActivities === activityProgress.totalActivities && activityProgress.totalActivities > 0
                      ? 'completed'
                      : activityProgress.completedActivities > 0
                        ? 'current'
                        : 'pending'
                  }
                />
                <TimelineItem
                  title="Training Complete"
                  description="All assessments passed, final report generated"
                  status={['Training Complete', 'Report Sent'].includes(derivedStatus) ? 'completed' : 'pending'}
                />
              </div>
            </div>
          </div>

          {/* Coach Info */}
          {traineeData.coachName && (
            <div className="bg-white rounded-xl border border-slate-100 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Your Coach</h2>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-bold text-lg">
                    {traineeData.coachName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-slate-900 text-lg">{traineeData.coachName}</p>
                  <p className="text-slate-500">{traineeData.coachEmail}</p>
                </div>
                {traineeData.coachEmail && (
                  <a
                    href={`mailto:${traineeData.coachEmail}`}
                    className="ml-auto px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Contact Coach
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-100 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Your Details</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-slate-500">Email</dt>
                  <dd className="text-slate-900">{traineeData.email}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Department</dt>
                  <dd className="text-slate-900">{traineeData.department || 'Not assigned'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Country</dt>
                  <dd className="text-slate-900">{traineeData.country || 'Not specified'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Training Start Date</dt>
                  <dd className="text-slate-900">{traineeData.trainingStartDate || 'Not set'}</dd>
                </div>
              </dl>
            </div>
            <div className="bg-orange-50 rounded-xl p-6 border border-orange-100">
              <h3 className="text-lg font-semibold text-orange-900 mb-3">Need Help?</h3>
              <p className="text-orange-700 mb-4">
                If you have questions about your training or assessments, reach out to your coach or the training team.
              </p>
              <div className="space-y-2">
                {traineeData.coachEmail && (
                  <a
                    href={`mailto:${traineeData.coachEmail}`}
                    className="block w-full text-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Email Your Coach
                  </a>
                )}
                <a
                  href="mailto:training@storehub.com"
                  className="block w-full text-center px-4 py-2 border border-orange-500 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  Contact Training Team
                </a>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* New trainee - show onboarding view */
        <div className="space-y-6">
          {/* Getting Started Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold">Ready to Start Your Training!</h2>
              </div>
              <p className="text-orange-100">
                Welcome to StoreHub Training. Your learning journey begins now.
              </p>
            </div>

            <div className="p-6">
              {/* Role Introduction */}
              <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Your Role: Onboarding Coordinator (OC)
                </h3>
                <p className="text-slate-600 text-sm">
                  As an OC, you&apos;ll be the first point of contact for new merchants joining StoreHub.
                  You&apos;ll help them set up their accounts, configure menus, and ensure a smooth onboarding experience.
                  This training will equip you with product knowledge, technical skills, and best practices.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-slate-900">4 Days</h3>
                  <p className="text-sm text-slate-500">Training Duration</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-slate-900">4 Assessments</h3>
                  <p className="text-sm text-slate-500">To Complete</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-slate-900">Buddy Session</h3>
                  <p className="text-sm text-slate-500">Learn from Experts</p>
                </div>
              </div>

              {/* Performance Expectations */}
              <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  How Your Performance is Measured
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-amber-700 font-bold">80%</span>
                    </div>
                    <div>
                      <p className="font-medium text-amber-900">Learning Scores</p>
                      <p className="text-sm text-amber-700">Weighted average of all quizzes and assessments throughout your training</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-amber-700 font-bold">20%</span>
                    </div>
                    <div>
                      <p className="font-medium text-amber-900">Participation Score</p>
                      <p className="text-sm text-amber-700">Attendance, engagement, and completion of training activities</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-amber-200">
                  <p className="text-sm text-amber-800">
                    <strong>Tip:</strong> All quizzes are open-book. Use your training materials as reference!
                  </p>
                </div>
              </div>

              <Link
                href="/dashboard/my-training"
                className="block w-full text-center px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/25"
              >
                View My Training Schedule
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/dashboard/my-training"
              className="bg-white rounded-xl border border-slate-100 p-5 hover:border-orange-200 hover:shadow-lg transition-all flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">My Schedule</h3>
                <p className="text-sm text-slate-500">View daily activities and materials</p>
              </div>
            </Link>
            <a
              href="mailto:training@storehub.com"
              className="bg-white rounded-xl border border-slate-100 p-5 hover:border-orange-200 hover:shadow-lg transition-all flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Need Help?</h3>
                <p className="text-sm text-slate-500">Contact the training team</p>
              </div>
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

function TimelineItem({
  date,
  title,
  description,
  status
}: {
  date?: string
  title: string
  description: string
  status: 'completed' | 'current' | 'pending'
}) {
  const getStatusStyles = () => {
    switch (status) {
      case 'completed':
        return { bg: '#2a6ee8', border: '#2a6ee8', ring: '' }
      case 'current':
        return { bg: '#ff9419', border: '#ff9419', ring: '0 0 0 4px #fff4e8' }
      default:
        return { bg: '#ffffff', border: '#c5c3c1', ring: '' }
    }
  }

  const styles = getStatusStyles()

  return (
    <div className="relative pl-10">
      <div
        className="absolute left-2 w-4 h-4 rounded-full border-2"
        style={{
          backgroundColor: styles.bg,
          borderColor: styles.border,
          boxShadow: styles.ring
        }}
      >
        {status === 'completed' && (
          <svg className="w-3 h-3 text-white absolute top-0.5 left-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <div>
        <p className="font-medium" style={{ color: '#2f2922' }}>{title}</p>
        <p className="text-sm" style={{ color: '#7a7672' }}>{description}</p>
        {date && <p className="text-xs mt-1" style={{ color: '#a09d9a' }}>{date}</p>}
      </div>
    </div>
  )
}

function StatsCard({
  title,
  value,
  description,
  color
}: {
  title: string
  value: string
  description: string
  color: 'orange' | 'amber' | 'blue' | 'slate'
}) {
  const colorClasses = {
    orange: 'bg-orange-500',
    amber: 'bg-amber-500',
    blue: 'bg-blue-500',
    slate: 'bg-slate-500',
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-6">
      <div className="flex items-center">
        <div className={`w-2 h-12 ${colorClasses[color]} rounded-full mr-4`} />
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-xs text-slate-400">{description}</p>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  // StoreHub brand color mapping
  const getStyles = (s: string): { bg: string; text: string } => {
    switch (s) {
      case 'New':
        return { bg: '#eae9e8', text: '#2f2922' }
      case 'Email Sent':
        return { bg: '#e9f0fd', text: '#2a6ee8' }
      case 'In Progress':
        return { bg: '#fff4e8', text: '#ff9419' }
      case 'Training Complete':
        return { bg: '#e9f0fd', text: '#2a6ee8' }
      case 'Report Sent':
        return { bg: '#ffeef0', text: '#ff546f' }
      default:
        return { bg: '#eae9e8', text: '#2f2922' }
    }
  }

  const { bg, text } = getStyles(status)

  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: bg, color: text }}
    >
      {status}
    </span>
  )
}
