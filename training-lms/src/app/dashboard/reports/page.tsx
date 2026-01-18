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
  { email: 'james.lee@storehub.com', fullName: 'James Lee', status: 'Training Complete', department: 'Customer Success Manager', country: 'Philippines', trainingStartDate: '2026-01-02', coachName: 'Jason Tan', coachEmail: 'jason.tan@storehub.com', daysSinceTrainingStart: 12, totalAssessmentsRequired: 5, totalAssessmentsCompleted: 5, totalAssessmentsIncomplete: 0, role: 'CSM', currentTrainingDay: 5 },
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

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  const { trainees, isDemo } = await getTrainees()

  // Calculate stats
  const totalTrainees = trainees.length
  const completedTrainees = trainees.filter(t => ['Training Complete', 'Report Sent'].includes(t.status)).length
  const inProgressTrainees = trainees.filter(t => t.status === 'Email Sent').length
  const avgCompletion = trainees.length > 0
    ? Math.round(
        trainees.reduce((acc, t) => {
          const total = t.totalAssessmentsRequired || 1
          const done = t.totalAssessmentsCompleted || 0
          return acc + (done / total) * 100
        }, 0) / trainees.length
      )
    : 0

  // Group by department
  const byDepartment = trainees.reduce((acc, t) => {
    const dept = t.department || 'Unknown'
    if (!acc[dept]) acc[dept] = { total: 0, completed: 0 }
    acc[dept].total++
    if (['Training Complete', 'Report Sent'].includes(t.status)) {
      acc[dept].completed++
    }
    return acc
  }, {} as Record<string, { total: number; completed: number }>)

  // Group by country
  const byCountry = trainees.reduce((acc, t) => {
    const country = t.country || 'Unknown'
    if (!acc[country]) acc[country] = { total: 0, completed: 0 }
    acc[country].total++
    if (['Training Complete', 'Report Sent'].includes(t.status)) {
      acc[country].completed++
    }
    return acc
  }, {} as Record<string, { total: number; completed: number }>)

  // Recent completions
  const recentCompletions = trainees
    .filter(t => ['Training Complete', 'Report Sent'].includes(t.status))
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--sh-black)]">Performance Reports</h1>
        <p className="text-[var(--neutral-400)] mt-1">Training performance analytics and insights</p>
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

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Trainees" value={totalTrainees} color="blue" />
        <StatCard label="Completed Training" value={completedTrainees} color="green" />
        <StatCard label="In Progress" value={inProgressTrainees} color="yellow" />
        <StatCard label="Avg. Completion" value={`${avgCompletion}%`} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Department */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-[var(--sh-black)] mb-4">By Department</h2>
          <div className="space-y-3">
            {Object.entries(byDepartment).map(([dept, stats]) => {
              const percent = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
              return (
                <div key={dept}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[var(--sh-black)]">{dept}</span>
                    <span className="text-[var(--neutral-300)]">{stats.completed}/{stats.total} ({percent}%)</span>
                  </div>
                  <div className="w-full h-2 progress-bar-track rounded-full overflow-hidden">
                    <div className="h-full progress-bar-brand rounded-full transition-all" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              )
            })}
            {Object.keys(byDepartment).length === 0 && (
              <p className="text-[var(--neutral-300)] text-sm">No department data available</p>
            )}
          </div>
        </div>

        {/* By Country */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-[var(--sh-black)] mb-4">By Country</h2>
          <div className="space-y-3">
            {Object.entries(byCountry).map(([country, stats]) => {
              const percent = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
              return (
                <div key={country}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[var(--sh-black)]">{country}</span>
                    <span className="text-[var(--neutral-300)]">{stats.completed}/{stats.total} ({percent}%)</span>
                  </div>
                  <div className="w-full h-2 progress-bar-track rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--sh-blue)] rounded-full transition-all" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              )
            })}
            {Object.keys(byCountry).length === 0 && (
              <p className="text-[var(--neutral-300)] text-sm">No country data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Completions */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-[var(--neutral-100)]">
          <h2 className="text-lg font-semibold text-[var(--sh-black)]">Recent Completions</h2>
        </div>
        {recentCompletions.length > 0 ? (
          <div className="divide-y divide-[var(--neutral-100)]">
            {recentCompletions.map((trainee) => (
              <div key={trainee.email} className="p-4 flex items-center justify-between hover:bg-[var(--orange-100)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-[var(--sh-black)]">{trainee.fullName}</p>
                    <p className="text-sm text-[var(--neutral-300)]">{trainee.department} {trainee.country && `• ${trainee.country}`}</p>
                  </div>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium badge-success">
                  {trainee.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-[var(--neutral-300)]">No completions yet</p>
          </div>
        )}
      </div>

      {/* Export Options */}
      {profile?.role === 'admin' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-[var(--sh-black)] mb-4">Export Reports</h2>
          <div className="flex flex-wrap gap-3">
            <button className="btn-brand px-4 py-2 rounded-lg flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0-6l-3 3m3-3l3 3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export to CSV
            </button>
            <a
              href="https://docs.google.com/spreadsheets/d/1ygEYNDbhmtaqjXhO7K_GfWwYK2WtV_erws7n52cWUZA/edit"
              target="_blank"
              className="px-4 py-2 border border-[var(--neutral-200)] text-[var(--sh-black)] rounded-lg hover:bg-[var(--orange-100)] transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View in Google Sheets
            </a>
          </div>
        </div>
      )}
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
