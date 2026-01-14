import { createClient } from '@/lib/supabase/server'
import type { Trainee } from '@/types/trainee'

async function getTrainees(): Promise<Trainee[]> {
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
  } catch {
    return []
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

  const trainees = await getTrainees()

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
        <h1 className="text-2xl font-bold text-gray-900">Assessments</h1>
        <p className="text-gray-600 mt-1">Track and manage trainee assessments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Assessments" value={totalRequired} color="blue" />
        <StatCard label="Completed" value={totalCompleted} color="green" />
        <StatCard label="Pending" value={totalIncomplete} color="yellow" />
        <StatCard label="Completion Rate" value={`${completionRate}%`} color="purple" />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Assessment Schedule</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ScheduleCard title="Week 1 Assessment" description="Basic product knowledge & tools" timing="Day 5-7" />
          <ScheduleCard title="Week 2 Assessment" description="Process & workflow understanding" timing="Day 12-14" />
          <ScheduleCard title="Final Assessment" description="Comprehensive evaluation" timing="Day 26-30" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Trainees with Pending Assessments</h2>
          <p className="text-sm text-gray-500 mt-1">Sorted by number of incomplete assessments</p>
        </div>

        {traineesWithPending.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trainee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Day</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pending</th>
                  {profile?.role === 'admin' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {traineesWithPending.map((trainee) => {
                  const progress = trainee.totalAssessmentsRequired > 0
                    ? (trainee.totalAssessmentsCompleted / trainee.totalAssessmentsRequired) * 100
                    : 0
                  return (
                    <tr key={trainee.email} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{trainee.fullName}</p>
                          <p className="text-sm text-gray-500">{trainee.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={trainee.status} />
                      </td>
                      <td className="px-6 py-4 text-gray-600">Day {trainee.daysSinceTrainingStart}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${progress}%` }} />
                          </div>
                          <span className="text-sm text-gray-600">
                            {trainee.totalAssessmentsCompleted}/{trainee.totalAssessmentsRequired}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          {trainee.totalAssessmentsIncomplete} pending
                        </span>
                      </td>
                      {profile?.role === 'admin' && (
                        <td className="px-6 py-4">
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
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

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-blue-800 font-medium">n8n Automation Active</p>
            <p className="text-blue-700 text-sm mt-1">
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
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
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
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-gray-900">{title}</h3>
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{timing}</span>
      </div>
      <p className="text-sm text-gray-500">{description}</p>
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
