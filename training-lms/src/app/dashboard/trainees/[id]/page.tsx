import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Trainee } from '@/types/trainee'
import TraineeActions from '@/components/dashboard/TraineeActions'
import ScoreSubmission from '@/components/dashboard/ScoreSubmission'

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
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold">
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
        <StatCard label="Training Day" value={`Day ${trainee.daysSinceTrainingStart}`} />
        <StatCard label="Completion" value={`${completionPercentage}%`} />
        <StatCard label="Activities Done" value={`${activityProgress.completed}/${activityProgress.total}`} />
        <StatCard label="Coach" value={trainee.coachName || 'Not assigned'} />
      </div>

      {/* Progress Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Training Progress</h2>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                completionPercentage >= 100 ? 'bg-green-500' :
                completionPercentage >= 50 ? 'bg-blue-500' : 'bg-yellow-500'
              }`}
              style={{ width: `${Math.min(completionPercentage, 100)}%` }}
            />
          </div>
          <span className="text-lg font-semibold text-gray-900">
            {activityProgress.completed} / {activityProgress.total}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-2xl font-bold text-green-600">{activityProgress.completed}</p>
            <p className="text-sm text-green-700">Completed</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3">
            <p className="text-2xl font-bold text-yellow-600">{activityProgress.total - activityProgress.completed}</p>
            <p className="text-sm text-yellow-700">Remaining</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-2xl font-bold text-blue-600">{activityProgress.total}</p>
            <p className="text-sm text-blue-700">Total Required</p>
          </div>
        </div>
      </div>

      {/* Training Timeline */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Training Timeline</h2>

        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

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

      {/* Trainee Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Details Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>

          <dl className="space-y-4">
            <div>
              <dt className="text-sm text-gray-500">Email</dt>
              <dd className="text-gray-900">{trainee.email}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Department</dt>
              <dd className="text-gray-900">{trainee.department || 'Not specified'}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Country</dt>
              <dd className="text-gray-900">{trainee.country || 'Not specified'}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Training Start Date</dt>
              <dd className="text-gray-900">{trainee.trainingStartDate || 'Not set'}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Days in Training</dt>
              <dd className="text-gray-900">{trainee.daysSinceTrainingStart} days</dd>
            </div>
          </dl>
        </div>

        {/* Coach Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Assigned Coach</h2>

          {trainee.coachName ? (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-medium text-lg">
                  {trainee.coachName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{trainee.coachName}</p>
                <p className="text-sm text-gray-500">{trainee.coachEmail}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No coach assigned</p>
          )}
        </div>
      </div>

      {/* Assessment Scores Placeholder */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Assessment Scores</h2>

        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p>Detailed assessment scores require an additional n8n webhook</p>
          <p className="text-sm mt-1">Connect your score tracking workflow to display individual results here</p>
        </div>
      </div>

      {/* Score Submission (Admin and Coach) */}
      {(profile?.role === 'admin' || profile?.role === 'coach') && (
        <ScoreSubmission
          traineeEmail={trainee.email}
          traineeName={trainee.fullName}
        />
      )}

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

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
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
