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
      department: String(item['Department'] || ''),
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

  // For trainees, find their own record by matching email
  const myTraineeData = userRole === 'trainee'
    ? allTrainees.find(t => t.email.toLowerCase() === user?.email?.toLowerCase())
    : null

  // Admin/Coach stats
  const stats = calculateAdminStats(allTrainees)
  const recentTrainees = allTrainees.slice(0, 5)

  // Trainee Dashboard
  if (userRole === 'trainee') {
    return <TraineeDashboard user={user} profile={profile} traineeData={myTraineeData} />
  }

  // Check if user is a trainer (Andrea) - show enhanced trainer dashboard
  const isTrainer = profile?.role === 'admin' ||
    user?.email?.toLowerCase().includes('andrea') ||
    user?.email?.toLowerCase().includes('trainer')

  // Trainer Dashboard (for Andrea)
  if (isTrainer) {
    return (
      <TrainerDashboard
        trainees={allTrainees}
        userName={profile?.full_name || user?.email?.split('@')[0] || 'Trainer'}
      />
    )
  }

  // Admin/Coach Dashboard
  return (
    <div className="space-y-6">
      {/* Header with greeting */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {profile?.full_name || user?.email}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here&apos;s what needs your attention today.
        </p>
      </div>

      {/* Needs Attention Summary Bar */}
      <div className="grid grid-cols-3 gap-4">
        <Link
          href="/dashboard/trainees?filter=critical"
          className={`p-4 rounded-lg border-2 transition-all ${
            stats.critical.length > 0
              ? 'bg-red-50 border-red-200 hover:border-red-400'
              : 'bg-gray-50 border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${stats.critical.length > 0 ? 'bg-red-500' : 'bg-gray-300'}`} />
            <div>
              <span className={`text-2xl font-bold ${stats.critical.length > 0 ? 'text-red-700' : 'text-gray-500'}`}>
                {stats.critical.length}
              </span>
              <p className={`text-sm font-medium ${stats.critical.length > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                Overdue
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/trainees?filter=at-risk"
          className={`p-4 rounded-lg border-2 transition-all ${
            stats.atRisk.length > 0
              ? 'bg-yellow-50 border-yellow-200 hover:border-yellow-400'
              : 'bg-gray-50 border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${stats.atRisk.length > 0 ? 'bg-yellow-500' : 'bg-gray-300'}`} />
            <div>
              <span className={`text-2xl font-bold ${stats.atRisk.length > 0 ? 'text-yellow-700' : 'text-gray-500'}`}>
                {stats.atRisk.length}
              </span>
              <p className={`text-sm font-medium ${stats.atRisk.length > 0 ? 'text-yellow-600' : 'text-gray-500'}`}>
                At Risk
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/trainees?filter=on-track"
          className="p-4 rounded-lg border-2 bg-green-50 border-green-200 hover:border-green-400 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <div>
              <span className="text-2xl font-bold text-green-700">{stats.onTrack.length}</span>
              <p className="text-sm font-medium text-green-600">On Track</p>
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
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.newTrainees.length > 0 && (
            <Link
              href="/dashboard/trainees?filter=new"
              className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors border border-purple-200"
            >
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">{stats.newTrainees.length} New</p>
                <p className="text-sm text-purple-600">Need welcome email</p>
              </div>
            </Link>
          )}
          <Link
            href="/dashboard/trainees"
            className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">All Trainees</p>
              <p className="text-sm text-gray-500">{stats.total} active</p>
            </div>
          </Link>
          <Link
            href="/dashboard/reports"
            className="flex items-center gap-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Reports</p>
              <p className="text-sm text-gray-500">Performance analytics</p>
            </div>
          </Link>
          {userRole === 'admin' && (
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Settings</p>
                <p className="text-sm text-gray-500">Manage users</p>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Trainees</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Assessments Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingAssessments}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg Completion</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completionRate}%</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* n8n Connected Status */}
      {stats.total > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <div>
            <p className="text-green-800 font-medium">Connected to n8n</p>
            <p className="text-green-700 text-sm">Live data from Google Sheets via n8n webhook</p>
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
  traineeData
}: {
  user: { email?: string } | null
  profile: { full_name?: string; role?: string } | null
  traineeData: Trainee | null | undefined
}) {
  const completionPercentage = traineeData && traineeData.totalAssessmentsRequired > 0
    ? Math.round((traineeData.totalAssessmentsCompleted / traineeData.totalAssessmentsRequired) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-2xl font-bold">
          Welcome, {profile?.full_name || traineeData?.fullName || user?.email}!
        </h1>
        <p className="text-blue-100 mt-1">
          Track your training progress and stay on top of your assessments.
        </p>
      </div>

      {traineeData ? (
        <>
          {/* Progress Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Training Day</p>
                  <p className="text-3xl font-bold text-gray-900">Day {traineeData.daysSinceTrainingStart}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Completion</p>
                  <p className="text-3xl font-bold text-gray-900">{completionPercentage}%</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Assessments Done</p>
                  <p className="text-3xl font-bold text-gray-900">{traineeData.totalAssessmentsCompleted}/{traineeData.totalAssessmentsRequired}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="text-lg font-bold text-gray-900">{traineeData.status}</p>
                </div>
                <StatusBadge status={traineeData.status} />
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Training Progress</h2>
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{traineeData.totalAssessmentsCompleted} of {traineeData.totalAssessmentsRequired} assessments completed</span>
              </div>
              <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    completionPercentage >= 100 ? 'bg-green-500' :
                    completionPercentage >= 50 ? 'bg-blue-500' : 'bg-yellow-500'
                  }`}
                  style={{ width: `${Math.min(completionPercentage, 100)}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-green-600">{traineeData.totalAssessmentsCompleted}</p>
                <p className="text-sm text-green-700">Completed</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-yellow-600">{traineeData.totalAssessmentsRequired - traineeData.totalAssessmentsCompleted}</p>
                <p className="text-sm text-yellow-700">Remaining</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-blue-600">{traineeData.totalAssessmentsRequired}</p>
                <p className="text-sm text-blue-700">Total</p>
              </div>
            </div>
          </div>

          {/* Training Timeline */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Training Timeline</h2>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
              <div className="space-y-6">
                <TimelineItem
                  date={traineeData.trainingStartDate}
                  title="Training Started"
                  description="You began your onboarding journey"
                  status="completed"
                />
                <TimelineItem
                  date={traineeData.status !== 'New' ? traineeData.trainingStartDate : undefined}
                  title="Welcome Email Received"
                  description="Resource pack and calendar invites delivered"
                  status={traineeData.status === 'New' ? 'pending' : 'completed'}
                />
                <TimelineItem
                  title="Assessments In Progress"
                  description={`${traineeData.totalAssessmentsCompleted} of ${traineeData.totalAssessmentsRequired} completed`}
                  status={
                    traineeData.totalAssessmentsCompleted === traineeData.totalAssessmentsRequired && traineeData.totalAssessmentsRequired > 0
                      ? 'completed'
                      : traineeData.totalAssessmentsCompleted > 0
                        ? 'current'
                        : 'pending'
                  }
                />
                <TimelineItem
                  title="Training Complete"
                  description="All assessments passed, final report generated"
                  status={['Training Complete', 'Report Sent'].includes(traineeData.status) ? 'completed' : 'pending'}
                />
              </div>
            </div>
          </div>

          {/* Coach Info */}
          {traineeData.coachName && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Coach</h2>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-lg">
                    {traineeData.coachName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-lg">{traineeData.coachName}</p>
                  <p className="text-gray-500">{traineeData.coachEmail}</p>
                </div>
                {traineeData.coachEmail && (
                  <a
                    href={`mailto:${traineeData.coachEmail}`}
                    className="ml-auto px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Contact Coach
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Details</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-gray-500">Email</dt>
                  <dd className="text-gray-900">{traineeData.email}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Department</dt>
                  <dd className="text-gray-900">{traineeData.department || 'Not assigned'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Country</dt>
                  <dd className="text-gray-900">{traineeData.country || 'Not specified'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Training Start Date</dt>
                  <dd className="text-gray-900">{traineeData.trainingStartDate || 'Not set'}</dd>
                </div>
              </dl>
            </div>
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Need Help?</h3>
              <p className="text-blue-800 mb-4">
                If you have questions about your training or assessments, reach out to your coach or the training team.
              </p>
              <div className="space-y-2">
                {traineeData.coachEmail && (
                  <a
                    href={`mailto:${traineeData.coachEmail}`}
                    className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Email Your Coach
                  </a>
                )}
                <a
                  href="mailto:training@storehub.com"
                  className="block w-full text-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Contact Training Team
                </a>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* No trainee data found */
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-yellow-800">Training Record Not Found</h3>
              <p className="text-yellow-700 mt-1">
                We couldn&apos;t find your training record. This could mean:
              </p>
              <ul className="list-disc list-inside text-yellow-700 mt-2 space-y-1">
                <li>Your training hasn&apos;t been set up yet</li>
                <li>Your email ({user?.email}) doesn&apos;t match our records</li>
              </ul>
              <p className="text-yellow-700 mt-3">
                Please contact your manager or the training team for assistance.
              </p>
              <a
                href="mailto:training@storehub.com"
                className="inline-block mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Contact Training Team
              </a>
            </div>
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
  return (
    <div className="relative pl-10">
      <div className={`absolute left-2 w-4 h-4 rounded-full border-2 ${
        status === 'completed'
          ? 'bg-green-500 border-green-500'
          : status === 'current'
            ? 'bg-blue-500 border-blue-500 ring-4 ring-blue-100'
            : 'bg-white border-gray-300'
      }`}>
        {status === 'completed' && (
          <svg className="w-3 h-3 text-white absolute top-0.5 left-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <div>
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
        {date && <p className="text-xs text-gray-400 mt-1">{date}</p>}
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
  color: 'blue' | 'yellow' | 'green' | 'purple'
}) {
  const colorClasses = {
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`w-2 h-12 ${colorClasses[color]} rounded-full mr-4`} />
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-400">{description}</p>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'New': 'bg-gray-100 text-gray-800',
    'Email Sent': 'bg-blue-100 text-blue-800',
    'In Progress': 'bg-yellow-100 text-yellow-800',
    'Training Complete': 'bg-green-100 text-green-800',
    'Report Sent': 'bg-purple-100 text-purple-800',
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  )
}
