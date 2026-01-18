import { createClient } from '@/lib/supabase/server'
import type { Trainee } from '@/types/trainee'

// Demo trainees data
const demoTrainees: Trainee[] = [
  { email: 'sarah.chen@storehub.com', fullName: 'Sarah Chen', status: 'In Progress', department: 'Onboarding Coordinator', country: 'Malaysia', trainingStartDate: '2026-01-13', coachName: 'Wei Lin', coachEmail: 'wei.lin@storehub.com', daysSinceTrainingStart: 2, totalAssessmentsRequired: 4, totalAssessmentsCompleted: 1, totalAssessmentsIncomplete: 3, role: 'OC', currentTrainingDay: 2 },
  { email: 'ahmad.rizal@storehub.com', fullName: 'Ahmad Rizal', status: 'In Progress', department: 'Onboarding Coordinator', country: 'Malaysia', trainingStartDate: '2026-01-13', coachName: 'Wei Lin', coachEmail: 'wei.lin@storehub.com', daysSinceTrainingStart: 2, totalAssessmentsRequired: 4, totalAssessmentsCompleted: 1, totalAssessmentsIncomplete: 3, role: 'OC', currentTrainingDay: 2 },
  { email: 'nurul.aina@storehub.com', fullName: 'Nurul Aina', status: 'In Progress', department: 'Onboarding Coordinator', country: 'Malaysia', trainingStartDate: '2026-01-13', coachName: 'Wei Lin', coachEmail: 'wei.lin@storehub.com', daysSinceTrainingStart: 2, totalAssessmentsRequired: 4, totalAssessmentsCompleted: 1, totalAssessmentsIncomplete: 3, role: 'OC', currentTrainingDay: 2 },
  { email: 'kevin.lim@storehub.com', fullName: 'Kevin Lim', status: 'In Progress', department: 'Onboarding Coordinator', country: 'Malaysia', trainingStartDate: '2026-01-13', coachName: 'Wei Lin', coachEmail: 'wei.lin@storehub.com', daysSinceTrainingStart: 2, totalAssessmentsRequired: 4, totalAssessmentsCompleted: 0, totalAssessmentsIncomplete: 4, role: 'OC', currentTrainingDay: 2, performanceFlag: 'At Risk' },
  { email: 'priya.sharma@storehub.com', fullName: 'Priya Sharma', status: 'In Progress', department: 'Customer Success Manager', country: 'Malaysia', trainingStartDate: '2026-01-10', coachName: 'Jason Tan', coachEmail: 'jason.tan@storehub.com', daysSinceTrainingStart: 4, totalAssessmentsRequired: 5, totalAssessmentsCompleted: 3, totalAssessmentsIncomplete: 2, role: 'CSM', currentTrainingDay: 4 },
  { email: 'david.wong@storehub.com', fullName: 'David Wong', status: 'In Progress', department: 'Customer Success Manager', country: 'Philippines', trainingStartDate: '2026-01-10', coachName: 'Jason Tan', coachEmail: 'jason.tan@storehub.com', daysSinceTrainingStart: 4, totalAssessmentsRequired: 5, totalAssessmentsCompleted: 4, totalAssessmentsIncomplete: 1, role: 'CSM', currentTrainingDay: 4 },
  { email: 'lisa.wong@storehub.com', fullName: 'Lisa Wong', status: 'Training Complete', department: 'Onboarding Coordinator', country: 'Malaysia', trainingStartDate: '2026-01-06', coachName: 'Wei Lin', coachEmail: 'wei.lin@storehub.com', daysSinceTrainingStart: 8, totalAssessmentsRequired: 4, totalAssessmentsCompleted: 4, totalAssessmentsIncomplete: 0, role: 'OC', currentTrainingDay: 4 },
]

async function getTrainees(): Promise<{ trainees: Trainee[], isDemo: boolean }> {
  try {
    const n8nUrl = process.env.N8N_WEBHOOK_TRAINEES
    if (!n8nUrl) return { trainees: demoTrainees, isDemo: true }

    const response = await fetch(n8nUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    })

    if (!response.ok) return { trainees: demoTrainees, isDemo: true }

    const data = await response.json()
    const trainees = data.map((item: Record<string, unknown>) => ({
      email: item['Email Address'] || '',
      fullName: item['Full Name'] || '',
      department: item['Department'] || '',
      country: item['Country'] || '',
      trainingStartDate: item['Training Start Date'] || '',
      status: item['Status'] || 'New',
      coachName: item['Coach Name'] || '',
      coachEmail: item['Coach Email'] || '',
      daysSinceTrainingStart: parseInt(String(item['Days since Training Start '] || item['Days since Training Start'] || '0')) || 0,
      totalAssessmentsRequired: parseInt(String(item['Total Assessments Required'] || '0')) || 0,
      totalAssessmentsCompleted: parseInt(String(item['Total Assessments Completed'] || '0')) || 0,
      totalAssessmentsIncomplete: parseInt(String(item['Total Assessments Incomplete'] || '0')) || 0,
    })).filter((t: Trainee) => t.fullName)

    if (trainees.length === 0) return { trainees: demoTrainees, isDemo: true }
    return { trainees, isDemo: false }
  } catch {
    return { trainees: demoTrainees, isDemo: true }
  }
}

export default async function AssessmentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  const { trainees, isDemo } = await getTrainees()

  const totalRequired = trainees.reduce((acc, t) => acc + t.totalAssessmentsRequired, 0)
  const totalCompleted = trainees.reduce((acc, t) => acc + t.totalAssessmentsCompleted, 0)
  const totalIncomplete = trainees.reduce((acc, t) => acc + t.totalAssessmentsIncomplete, 0)
  const completionRate = totalRequired > 0 ? Math.round((totalCompleted / totalRequired) * 100) : 0

  const traineesWithPending = trainees
    .filter(t => t.totalAssessmentsIncomplete > 0)
    .sort((a, b) => b.totalAssessmentsIncomplete - a.totalAssessmentsIncomplete)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--sh-black)]">Assessments</h1>
        <p className="text-[var(--neutral-400)] mt-1">Track and manage trainee assessments</p>
      </div>

      {/* Demo Mode Banner */}
      {isDemo && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-amber-800 font-medium">Demo Mode</p>
            <p className="text-amber-700 text-sm">Showing sample data. Real data will appear once connected to n8n.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Assessments" value={totalRequired} color="blue" />
        <StatCard label="Completed" value={totalCompleted} color="green" />
        <StatCard label="Pending" value={totalIncomplete} color="yellow" />
        <StatCard label="Completion Rate" value={`${completionRate}%`} color="purple" />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-[var(--sh-black)] mb-4">Assessment Schedule</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ScheduleCard title="Week 1 Assessment" description="Basic product knowledge & tools" timing="Day 5-7" />
          <ScheduleCard title="Week 2 Assessment" description="Process & workflow understanding" timing="Day 12-14" />
          <ScheduleCard title="Final Assessment" description="Comprehensive evaluation" timing="Day 26-30" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-[var(--neutral-100)]">
          <h2 className="text-lg font-semibold text-[var(--sh-black)]">Trainees with Pending Assessments</h2>
          <p className="text-sm text-[var(--neutral-300)] mt-1">Sorted by number of incomplete assessments</p>
        </div>

        {traineesWithPending.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="table-header-brand">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--sh-black)] uppercase">Trainee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--sh-black)] uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--sh-black)] uppercase">Day</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--sh-black)] uppercase">Progress</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--sh-black)] uppercase">Pending</th>
                  {profile?.role === 'admin' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--sh-black)] uppercase">Action</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--neutral-100)]">
                {traineesWithPending.map((trainee) => {
                  const progress = trainee.totalAssessmentsRequired > 0
                    ? (trainee.totalAssessmentsCompleted / trainee.totalAssessmentsRequired) * 100
                    : 0
                  return (
                    <tr key={trainee.email} className="hover:bg-[var(--orange-100)]">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-[var(--sh-black)]">{trainee.fullName}</p>
                          <p className="text-sm text-[var(--neutral-300)]">{trainee.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={trainee.status} />
                      </td>
                      <td className="px-6 py-4 text-[var(--neutral-400)]">Day {trainee.daysSinceTrainingStart}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 progress-bar-track rounded-full overflow-hidden">
                            <div className="h-full progress-bar-brand rounded-full" style={{ width: `${progress}%` }} />
                          </div>
                          <span className="text-sm text-[var(--neutral-400)]">
                            {trainee.totalAssessmentsCompleted}/{trainee.totalAssessmentsRequired}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium badge-warning">
                          {trainee.totalAssessmentsIncomplete} pending
                        </span>
                      </td>
                      {profile?.role === 'admin' && (
                        <td className="px-6 py-4">
                          <button className="link-brand text-sm font-medium">
                            Send Reminder
                          </button>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <svg className="w-12 h-12 mx-auto text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="mt-4 text-gray-600">All trainees are up to date with their assessments!</p>
          </div>
        )}
      </div>

      <div className="banner-info rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-[var(--sh-blue)] mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-[var(--blue-600)] font-medium">n8n Automation Active</p>
            <p className="text-[var(--blue-500)] text-sm mt-1">
              Assessment reminders are sent automatically via n8n scheduled workflows.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  const colors: Record<string, string> = {
    blue: 'stat-card-blue',
    yellow: 'stat-card-orange',
    green: 'badge-success',
    purple: 'stat-card-pink',
  }
  return (
    <div className={`rounded-lg border p-4 ${colors[color]}`}>
      <p className="text-sm opacity-80">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  )
}

function ScheduleCard({ title, description, timing }: { title: string; description: string; timing: string }) {
  return (
    <div className="border border-[var(--neutral-200)] rounded-lg p-4 hover:border-[var(--sh-orange)] transition-colors">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-[var(--sh-black)]">{title}</h3>
        <span className="text-xs badge-orange px-2 py-1 rounded">{timing}</span>
      </div>
      <p className="text-sm text-[var(--neutral-300)]">{description}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'New': 'stat-card-neutral',
    'Email Sent': 'badge-blue',
    'In Progress': 'badge-orange',
    'Training Complete': 'badge-success',
    'Report Sent': 'badge-pink',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'stat-card-neutral'}`}>
      {status}
    </span>
  )
}
