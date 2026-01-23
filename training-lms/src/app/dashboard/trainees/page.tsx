import { createClient } from '@/lib/supabase/server'
import TraineeTable from '@/components/dashboard/TraineeTable'
import type { Trainee } from '@/types/trainee'

// Demo data - same batches as TrainerDashboard
const demoTrainees: Trainee[] = [
  // OC Batch - Day 2
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
  // CSM Batch - Day 4
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
  // New batch - Jan 19
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
  // Completed trainee
  {
    email: 'lisa.wong@storehub.com',
    fullName: 'Lisa Wong',
    status: 'Training Complete',
    department: 'Onboarding Coordinator',
    country: 'Malaysia',
    trainingStartDate: '2026-01-06',
    coachName: 'Wei Lin',
    coachEmail: 'wei.lin@storehub.com',
    daysSinceTrainingStart: 8,
    totalAssessmentsRequired: 4,
    totalAssessmentsCompleted: 4,
    totalAssessmentsIncomplete: 0,
    role: 'OC',
    currentTrainingDay: 4,
  },
]

async function getTrainees(): Promise<{ trainees: Trainee[], error: string | null, isDemo: boolean }> {
  try {
    const n8nUrl = process.env.N8N_WEBHOOK_TRAINEES

    if (!n8nUrl) {
      return { trainees: demoTrainees, error: null, isDemo: true }
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
      department: item['Role'] || item['Department'] || '',
      country: item['Country'] || '',
      trainingStartDate: item['Training Start Date'] || '',
      status: item['Status'] || 'New',
      coachName: item['Coach Name'] || '',
      coachEmail: item['Coach Email'] || '',
      daysSinceTrainingStart: parseInt(String(item['Current Day'] || item['Days since Training Start '] || item['Days since Training Start'] || '0')) || 0,
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

    // If no real trainees, return demo data
    if (trainees.length === 0) {
      return { trainees: demoTrainees, error: null, isDemo: true }
    }

    return { trainees, error: null, isDemo: false }
  } catch (error) {
    console.error('Error fetching trainees:', error)
    // Return demo data on error
    return { trainees: demoTrainees, error: null, isDemo: true }
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

  // Fetch real data from n8n (or demo data)
  const { trainees, error, isDemo } = await getTrainees()

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
          <h1 className="text-2xl font-bold text-[var(--sh-black)]">Trainees</h1>
          <p className="text-[var(--neutral-400)] mt-1">Manage and track all trainees in the system</p>
        </div>
        {profile?.role === 'admin' && (
          <button className="btn-brand px-4 py-2 rounded-lg flex items-center gap-2">
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

      {/* Demo Mode Banner */}
      {isDemo && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-amber-800 font-medium">Demo Mode</p>
            <p className="text-amber-700 text-sm">Showing sample data. Real trainee data will appear once connected to n8n.</p>
          </div>
        </div>
      )}

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
      {!error && !isDemo && trainees.length > 0 && (
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
  const styles = {
    blue: 'bg-gradient-to-br from-sky-50 to-blue-100 border-blue-200 text-blue-700',
    yellow: 'bg-gradient-to-br from-amber-50 to-orange-100 border-orange-200 text-orange-600',
    green: 'bg-gradient-to-br from-emerald-50 to-green-100 border-green-200 text-green-600',
    purple: 'bg-gradient-to-br from-fuchsia-50 to-pink-100 border-pink-200 text-pink-600',
  }

  return (
    <div className={`rounded-xl border-2 p-5 ${styles[color as keyof typeof styles]} shadow-sm hover:shadow-md transition-shadow`}>
      <p className="text-sm font-medium opacity-70">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  )
}
