import { createClient } from '@/lib/supabase/server'
import TraineeTable from '@/components/dashboard/TraineeTable'
import type { Trainee } from '@/types/trainee'

async function getTrainees(): Promise<{ trainees: Trainee[], error: string | null }> {
  try {
    const n8nUrl = process.env.N8N_WEBHOOK_TRAINEES

    if (!n8nUrl) {
      return { trainees: [], error: 'n8n webhook URL not configured' }
    }

    // Fetch directly from n8n webhook
    const response = await fetch(n8nUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Always fetch fresh data
    })

    if (!response.ok) {
      throw new Error(`n8n responded with status ${response.status}`)
    }

    const data = await response.json()

    // Transform n8n data to match our frontend structure
    const trainees: Trainee[] = data.map((item: Record<string, unknown>) => ({
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
      // New fields from Google Sheets (handle trailing spaces in column names)
      performanceFlag: String(item['Performance Flag '] || item['Performance Flag'] || '').trim() || undefined,
      delayReason: String(item['Delay Reason'] || '').trim() || undefined,
      daysExtended: parseInt(String(item['Total Days Extended'] || '0')) || undefined,
      adjustedEndDate: String(item['Adjusted End Date '] || item['Adjusted End Date'] || '').trim() || undefined,
      originalEndDate: String(item['Original End Date'] || '').trim() || undefined,
      role: String(item['Role'] || '').trim() || undefined,
      notes: String(item['Notes'] || '').trim() || undefined,
      currentTrainingDay: parseInt(String(item['Current Training Day'] || '0')) || undefined,
    })).filter((t: Trainee) => t.fullName) // Filter out empty rows

    return { trainees, error: null }
  } catch (error) {
    console.error('Error fetching trainees:', error)
    return { trainees: [], error: 'Failed to load trainees from n8n. Make sure your workflow is active.' }
  }
}

export default async function TraineesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  // Fetch real data from n8n
  const { trainees, error } = await getTrainees()

  // Stats
  const totalTrainees = trainees.length
  const inTraining = trainees.filter(t => t.status === 'Email Sent').length
  const completed = trainees.filter(t => ['Training Complete', 'Report Sent'].includes(t.status)).length
  const avgCompletion = trainees.length > 0
    ? Math.round(
        trainees.reduce((acc, t) => {
          const total = t.totalAssessmentsRequired || 1
          const done = t.totalAssessmentsCompleted || 0
          return acc + (done / total) * 100
        }, 0) / trainees.length
      )
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trainees</h1>
          <p className="text-gray-600 mt-1">Manage and track all trainees in the system</p>
        </div>
        {profile?.role === 'admin' && (
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Trainee
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Trainees" value={totalTrainees} color="blue" />
        <StatCard label="In Training" value={inTraining} color="yellow" />
        <StatCard label="Completed" value={completed} color="green" />
        <StatCard label="Avg. Completion" value={`${avgCompletion}%`} color="purple" />
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-red-800 font-medium">Connection Error</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Success Banner */}
      {!error && trainees.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <div>
            <p className="text-green-800 font-medium">Connected to n8n</p>
            <p className="text-green-700 text-sm">Showing live data from your Google Sheets via n8n webhook.</p>
          </div>
        </div>
      )}

      {/* Trainee Table */}
      <TraineeTable trainees={trainees} />
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  const colors = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
  }

  return (
    <div className={`rounded-lg border p-4 ${colors[color as keyof typeof colors]}`}>
      <p className="text-sm opacity-80">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  )
}
