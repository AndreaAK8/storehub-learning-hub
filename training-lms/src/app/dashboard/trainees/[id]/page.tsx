import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Trainee } from '@/types/trainee'
import TraineeActions from '@/components/dashboard/TraineeActions'
import ActivitiesStatCard from '@/components/dashboard/ActivitiesStatCard'
import AssessmentScoresChart from '@/components/dashboard/AssessmentScoresChart'

async function getTrainee(email: string): Promise<{ trainee: Trainee | null, error: string | null }> {
  try {
    const n8nUrl = process.env.N8N_WEBHOOK_TRAINEES

    if (!n8nUrl) {
      return { trainee: null, error: 'n8n webhook URL not configured' }
    }

    const response = await fetch(n8nUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`n8n responded with status ${response.status}`)
    }

    const data = await response.json()

    // Find the trainee by email
    const item = data.find((row: Record<string, unknown>) =>
      String(row['Email Address'] || '').toLowerCase() === email.toLowerCase()
    )

    if (!item) {
      return { trainee: null, error: null }
    }

    // Calculate days since training start
    const trainingStartDate = item['Training Start Date'] || ''
    let daysSinceStart = 0
    if (trainingStartDate) {
      const start = new Date(trainingStartDate)
      const today = new Date()
      daysSinceStart = Math.max(1, Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))
    }

    const trainee: Trainee = {
      email: item['Email Address'] || '',
      fullName: item['Full Name'] || '',
      department: item['Role'] || item['Department'] || '',
      country: item['Country'] || '',
      trainingStartDate: trainingStartDate,
      status: item['Status'] || 'New',
      coachName: item['Coach Name'] || '',
      coachEmail: item['Coach Email'] || '',
      daysSinceTrainingStart: daysSinceStart,
      totalAssessmentsRequired: parseInt(String(item['Total Assessments Required'] || '0')) || 0,
      totalAssessmentsCompleted: parseInt(String(item['Total Assessments Completed'] || '0')) || 0,
      totalAssessmentsIncomplete: parseInt(String(item['Total Assessments Incomplete'] || '0')) || 0,
      role: String(item['Role Code'] || item['Role'] || '').trim() || undefined,
      currentTrainingDay: parseInt(String(item['Current Training Day'] || item['Current Day'] || '0')) || undefined,
    }

    return { trainee, error: null }
  } catch (error) {
    console.error('Error fetching trainee:', error)
    return { trainee: null, error: 'Failed to load trainee data' }
  }
}

// Fetch activity progress from Supabase
async function getActivityProgress(email: string): Promise<{
  completed: number
  total: number
  activities: { activity_title: string; day_number: number; completed_at: string; performance_flag: string }[]
}> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const response = await fetch(
      `${baseUrl}/api/training/performance?email=${encodeURIComponent(email)}`,
      { cache: 'no-store' }
    )

    if (!response.ok) {
      return { completed: 0, total: 24, activities: [] }
    }

    const data = await response.json()
    // All records in activity_performance are completed activities
    const completedActivities = data.performance || []

    return {
      completed: completedActivities.length,
      total: 24, // OC role has ~24 activities
      activities: completedActivities.map((p: { activity_title: string; day_number: number; created_at: string; performance_flag: string }) => ({
        activity_title: p.activity_title,
        day_number: p.day_number,
        completed_at: p.created_at, // Use created_at as completion timestamp
        performance_flag: p.performance_flag,
      })),
    }
  } catch {
    return { completed: 0, total: 24, activities: [] }
  }
}

export default async function TraineeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const email = decodeURIComponent(id)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  const { trainee, error } = await getTrainee(email)

  if (!trainee) {
    notFound()
  }

  // Fetch real progress from Supabase
  const activityProgress = await getActivityProgress(email)

  const completionPercentage = activityProgress.total > 0
    ? Math.round((activityProgress.completed / activityProgress.total) * 100)
    : 0

  // Determine training status based on progress
  const getTrainingStatus = () => {
    if (activityProgress.completed === 0) return trainee.status
    if (activityProgress.completed >= activityProgress.total) return 'Training Complete'
    return `Day ${trainee.daysSinceTrainingStart} - In Progress`
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/dashboard/trainees"
        className="inline-flex items-center text-gray-600 hover:text-gray-900"
      >
        <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Trainees
      </Link>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
              {trainee.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{trainee.fullName}</h1>
              <p className="text-gray-600">{trainee.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-gray-500">{trainee.department || 'No department'}</span>
                <span className="text-gray-300">•</span>
                <span className="text-sm text-gray-500">{trainee.country || 'No country'}</span>
              </div>
            </div>
          </div>
          <StatusBadge status={getTrainingStatus()} />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Training Day" value={`Day ${trainee.daysSinceTrainingStart}`} color="blue" />
        <StatCard label="Completion" value={`${completionPercentage}%`} color="purple" />
        <ActivitiesStatCard
          completed={activityProgress.completed}
          total={activityProgress.total}
          traineeEmail={trainee.email}
          traineeName={trainee.fullName}
          roleCode={trainee.role || 'OC'}
          currentDay={trainee.currentTrainingDay || trainee.daysSinceTrainingStart}
        />
        <StatCard label="Coach" value={trainee.coachName || 'Not assigned'} color="teal" />
      </div>

      {/* Progress Section */}
      <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-xl shadow-sm border border-purple-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Training Progress</h2>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 h-4 bg-white/60 rounded-full overflow-hidden shadow-inner">
            <div
              className={`h-full rounded-full transition-all ${
                completionPercentage >= 100 ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                completionPercentage >= 50 ? 'bg-gradient-to-r from-blue-400 to-indigo-500' : 'bg-gradient-to-r from-amber-400 to-orange-500'
              }`}
              style={{ width: `${Math.min(completionPercentage, 100)}%` }}
            />
          </div>
          <span className="text-lg font-bold text-gray-900">
            {activityProgress.completed} / {activityProgress.total}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-gradient-to-br from-emerald-100 to-green-200 rounded-xl p-4 border border-green-200">
            <p className="text-3xl font-bold text-green-700">{activityProgress.completed}</p>
            <p className="text-sm font-medium text-green-600">Completed</p>
          </div>
          <div className="bg-gradient-to-br from-amber-100 to-yellow-200 rounded-xl p-4 border border-yellow-200">
            <p className="text-3xl font-bold text-amber-700">{activityProgress.total - activityProgress.completed}</p>
            <p className="text-sm font-medium text-amber-600">Remaining</p>
          </div>
          <div className="bg-gradient-to-br from-blue-100 to-indigo-200 rounded-xl p-4 border border-indigo-200">
            <p className="text-3xl font-bold text-indigo-700">{activityProgress.total}</p>
            <p className="text-sm font-medium text-indigo-600">Total Required</p>
          </div>
        </div>
      </div>

      {/* Training Timeline */}
      <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Training Timeline</h2>

        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-300 via-blue-300 to-gray-200" />

          <div className="space-y-6">
            {/* Training Start */}
            <TimelineItem
              date={trainee.trainingStartDate}
              title="Training Started"
              description="Trainee began their onboarding journey"
              status="completed"
            />

            {/* Welcome Email */}
            <TimelineItem
              date={trainee.status !== 'New' ? trainee.trainingStartDate : undefined}
              title="Welcome Email Sent"
              description="Resource pack and calendar invites delivered"
              status={trainee.status === 'New' ? 'pending' : 'completed'}
            />

            {/* Training Progress */}
            <TimelineItem
              title="Training In Progress"
              description={`${activityProgress.completed} of ${activityProgress.total} activities completed`}
              status={
                activityProgress.completed >= activityProgress.total
                  ? 'completed'
                  : activityProgress.completed > 0
                    ? 'current'
                    : 'pending'
              }
            />

            {/* Training Complete */}
            <TimelineItem
              title="Training Complete"
              description="All activities completed, ready for final assessment"
              status={activityProgress.completed >= activityProgress.total ? 'completed' : 'pending'}
            />
          </div>
        </div>
      </div>

      {/* Assessment Scores Chart */}
      <AssessmentScoresChart
        traineeEmail={trainee.email}
        traineeRole={trainee.role || trainee.department || 'OS'}
      />

      {/* Trainee Details - Combined */}
      <TraineeDetailsCard trainee={trainee} />

      {/* Actions (Admin only) */}
      {profile?.role === 'admin' && (
        <TraineeActions
          traineeEmail={trainee.email}
          traineeName={trainee.fullName}
          traineeStatus={trainee.status}
        />
      )}
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
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  )
}

function StatCard({ label, value, color = 'gray' }: { label: string; value: string; color?: string }) {
  const styles: Record<string, string> = {
    blue: 'bg-gradient-to-br from-sky-50 to-blue-100 border-blue-200 text-blue-700',
    purple: 'bg-gradient-to-br from-violet-50 to-purple-100 border-purple-200 text-purple-700',
    green: 'bg-gradient-to-br from-emerald-50 to-green-100 border-green-200 text-green-700',
    teal: 'bg-gradient-to-br from-teal-50 to-cyan-100 border-cyan-200 text-cyan-700',
    orange: 'bg-gradient-to-br from-amber-50 to-orange-100 border-orange-200 text-orange-700',
    gray: 'bg-white border-gray-200 text-gray-700',
  }

  return (
    <div className={`rounded-xl border-2 p-4 shadow-sm hover:shadow-md transition-shadow ${styles[color]}`}>
      <p className="text-sm font-medium opacity-70">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  )
}

// Training duration by role (in days)
const TRAINING_DURATION: Record<string, number> = {
  'OC': 4,
  'Onboarding Coordinator': 4,
  'OS': 7,
  'Onboarding Specialist': 7,
  'MC': 8,
  'Merchant Care': 8,
  'CSM': 10,
  'Customer Success Manager': 10,
  'BC': 12,
  'Business Consultant': 12,
  'MOM': 12,
  'Merchant Onboarding Manager': 12,
  'SC': 5,
  'Sales Coordinator': 5,
}

function TraineeDetailsCard({ trainee }: { trainee: Trainee }) {
  // Calculate expected end date
  const getExpectedEndDate = () => {
    if (!trainee.trainingStartDate) return null
    const duration = TRAINING_DURATION[trainee.role || ''] || TRAINING_DURATION[trainee.department || ''] || 7
    const startDate = new Date(trainee.trainingStartDate)
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + duration)
    return endDate
  }

  const expectedEndDate = getExpectedEndDate()
  const today = new Date()
  const isOverdue = expectedEndDate && today > expectedEndDate
  const daysOverdue = expectedEndDate ? Math.ceil((today.getTime() - expectedEndDate.getTime()) / (1000 * 60 * 60 * 24)) : 0

  return (
    <div className="bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-200 p-6">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        {/* Details */}
        <div className="md:col-span-4">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">Details</h2>
          <dl className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <dt className="text-xs text-blue-600 font-medium uppercase tracking-wide">Email</dt>
              <dd className="text-gray-900 text-sm mt-1">{trainee.email}</dd>
            </div>
            <div>
              <dt className="text-xs text-blue-600 font-medium uppercase tracking-wide">Department</dt>
              <dd className="text-gray-900 text-sm mt-1">{trainee.department || 'Not specified'}</dd>
            </div>
            <div>
              <dt className="text-xs text-blue-600 font-medium uppercase tracking-wide">Country</dt>
              <dd className="text-gray-900 text-sm mt-1">{trainee.country || 'Not specified'}</dd>
            </div>
            <div>
              <dt className="text-xs text-blue-600 font-medium uppercase tracking-wide">Start Date</dt>
              <dd className="text-gray-900 text-sm mt-1">{trainee.trainingStartDate || 'Not set'}</dd>
            </div>
            <div>
              <dt className="text-xs text-blue-600 font-medium uppercase tracking-wide">Expected End Date</dt>
              <dd className={`text-sm mt-1 ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-900'}`}>
                {expectedEndDate ? expectedEndDate.toISOString().split('T')[0] : 'Not set'}
                {isOverdue && (
                  <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                    {daysOverdue} days overdue
                  </span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-blue-600 font-medium uppercase tracking-wide">Days in Training</dt>
              <dd className="text-gray-900 text-sm mt-1">{trainee.daysSinceTrainingStart} days</dd>
            </div>
          </dl>
        </div>

        {/* Coach */}
        <div className="md:col-span-2 md:border-l md:border-blue-200 md:pl-6">
          <h2 className="text-lg font-semibold text-purple-900 mb-4">Coach</h2>
          {trainee.coachName ? (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-violet-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold">
                  {trainee.coachName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">{trainee.coachName}</p>
                <p className="text-xs text-purple-600">{trainee.coachEmail}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No coach assigned</p>
          )}
        </div>
      </div>
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
