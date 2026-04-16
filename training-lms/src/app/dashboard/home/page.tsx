'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Activity {
  id: string
  title: string
  activityType: string
  durationHours: number
  status: 'pending' | 'in_progress' | 'completed' | 'skipped'
  startTime: string
  endTime: string
}

interface TrainingDay {
  dayNumber: number
  title: string
  activities: Activity[]
  date?: string
}

interface TraineeData {
  email: string
  roleName: string
  totalDays: number
  trainingStartDate?: string
  trainingDays: TrainingDay[]
  currentDay: number
}

// Status badge colours per DESIGN_RULES
const statusBadge = {
  completed:   { bg: '#e9f0fd', text: '#2a6ee8', label: 'Completed' },
  in_progress: { bg: '#fff4e8', text: '#ff630f', label: 'In progress' },
  pending:     { bg: '#eae9e8', text: '#7a7672', label: 'Not started' },
  skipped:     { bg: '#eae9e8', text: '#7a7672', label: 'Not started' },
}

function getDayDate(startDate: string | undefined, dayNumber: number): string {
  if (!startDate) return ''
  const d = new Date(startDate)
  d.setDate(d.getDate() + dayNumber - 1)
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function getDayStatus(day: TrainingDay, currentDay: number): 'completed' | 'in_progress' | 'not_started' | 'overdue' {
  const trackable = day.activities.filter(a => a.activityType !== 'lunch' && a.activityType !== 'break')
  if (trackable.length === 0) return 'not_started'
  const allDone = trackable.every(a => a.status === 'completed')
  if (allDone) return 'completed'
  if (day.dayNumber < currentDay && !allDone) return 'overdue'
  if (day.dayNumber === currentDay) return 'in_progress'
  return 'not_started'
}

export default function HomePage() {
  const [traineeData, setTraineeData] = useState<TraineeData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAllTasks, setShowAllTasks] = useState(false)
  const scheduleRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, google_sheet_email, full_name')
        .eq('id', user.id)
        .single()

      const traineeEmail = profile?.google_sheet_email || user.email || ''

      // Get role
      const urlParams = new URLSearchParams(window.location.search)
      const roleOverride = urlParams.get('role')
      let traineeRole = roleOverride || 'OS'

      if (!roleOverride) {
        try {
          const res = await fetch('/api/trainees')
          if (res.ok) {
            const data = await res.json()
            const match = data.find((t: { email: string; department: string }) =>
              t.email?.toLowerCase() === traineeEmail.toLowerCase()
            )
            if (match?.department) {
              const roleMap: Record<string, string> = {
                'Onboarding Specialist': 'OS',
                'Merchant Onboarding Manager': 'MOM',
                'Onboarding Coordinator': 'OC',
                'Customer Success Manager': 'CSM',
                'Business Consultant': 'BC',
                'Merchant Care': 'MC',
                'Sales Coordinator': 'SC',
              }
              traineeRole = roleMap[match.department] || match.department
            }
          }
        } catch { /* use default */ }
      }

      const schedRes = await fetch(`/api/training/schedule?role=${traineeRole}&email=${encodeURIComponent(traineeEmail)}`)
      if (!schedRes.ok) throw new Error('Failed to load schedule')
      const schedData = await schedRes.json()

      // Load completion data
      const perfRes = await fetch(`/api/training/performance?email=${encodeURIComponent(traineeEmail)}`)
      const perfData = perfRes.ok ? await perfRes.json() : { performance: [] }
      const completedIds = new Set(perfData.performance?.map((p: { activity_id: string }) => p.activity_id) || [])

      const days: TrainingDay[] = schedData.trainingDays.map((day: TrainingDay) => ({
        ...day,
        activities: day.activities.map((a: Activity) => ({
          ...a,
          status: completedIds.has(a.id) ? 'completed' : a.status,
        })),
      }))

      // Find current day
      let currentDay = 1
      for (let i = days.length - 1; i >= 0; i--) {
        const hasActivity = days[i].activities.some(a => a.status === 'in_progress' || a.status === 'completed')
        if (hasActivity) { currentDay = days[i].dayNumber; break }
      }

      setTraineeData({
        email: traineeEmail,
        roleName: schedData.role.name,
        totalDays: schedData.role.totalDays,
        trainingStartDate: new Date().toISOString().split('T')[0],
        trainingDays: days,
        currentDay,
      })
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [supabase, router])

  useEffect(() => { fetchData() }, [fetchData])

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {[0, 1].map(i => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border" style={{ borderColor: '#eae9e8' }}>
              <div className="skeleton h-10 w-20 mb-2 rounded" />
              <div className="skeleton h-4 w-32 mb-1 rounded" />
              <div className="skeleton h-3 w-24 rounded" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border" style={{ borderColor: '#eae9e8' }}>
          <div className="skeleton h-5 w-40 mb-4 rounded" />
          <div className="space-y-3">
            {[0, 1, 2].map(i => <div key={i} className="skeleton h-10 rounded" />)}
          </div>
        </div>
      </div>
    )
  }

  if (!traineeData) return null

  // --- Derived stats ---
  const allActivities = traineeData.trainingDays.flatMap(d =>
    d.activities.filter(a => a.activityType !== 'lunch' && a.activityType !== 'break')
  )
  const totalModules = allActivities.length
  const completedModules = allActivities.filter(a => a.status === 'completed').length
  const overallPct = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0

  const todayDay = traineeData.trainingDays.find(d => d.dayNumber === traineeData.currentDay)
  const todayActivities = (todayDay?.activities || []).filter(a => a.activityType !== 'lunch' && a.activityType !== 'break')
  const todayDue = todayActivities.filter(a => a.status !== 'completed').length
  const overdueCount = traineeData.trainingDays
    .filter(d => d.dayNumber < traineeData.currentDay)
    .flatMap(d => d.activities)
    .filter(a => a.activityType !== 'lunch' && a.activityType !== 'break' && a.status !== 'completed')
    .length

  const allTrainingDone = completedModules === totalModules && totalModules > 0
  const visibleTasks = showAllTasks ? todayActivities : todayActivities.slice(0, 4)

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">

      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'Barlow, sans-serif', color: '#2f2922' }}>Home</h1>
        <p className="text-sm mt-0.5" style={{ color: '#7a7672' }}>{traineeData.roleName}</p>
      </div>

      {/* ── Section 1: Progress snapshot ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Card A — Overall progress */}
        <div className="bg-white rounded-xl p-6 shadow-sm border" style={{ borderColor: '#eae9e8' }}>
          <div className="text-5xl font-black leading-none mb-1" style={{ fontFamily: 'Barlow, sans-serif', color: '#2f2922' }}>
            {overallPct}%
          </div>
          <p className="text-sm mb-0.5" style={{ color: '#7a7672' }}>Overall completion</p>
          <p className="text-sm mb-4" style={{ color: '#a09d9a' }}>{completedModules} of {totalModules} modules done</p>
          {/* Animated progress bar */}
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: '#eae9e8' }}>
            <div
              className="h-full rounded-full transition-all duration-[600ms] ease-out"
              style={{ width: `${overallPct}%`, background: '#ff9419' }}
            />
          </div>
        </div>

        {/* Card B — Today's focus */}
        <div className="bg-white rounded-xl p-6 shadow-sm border" style={{ borderColor: '#eae9e8' }}>
          <div className="text-5xl font-black leading-none mb-1" style={{ fontFamily: 'Barlow, sans-serif', color: '#2f2922' }}>
            {allTrainingDone ? '🎉' : todayDue}
          </div>
          <p className="text-sm mb-0.5" style={{ color: '#7a7672' }}>
            {allTrainingDone ? 'All done!' : 'Tasks due today'}
          </p>
          {overdueCount > 0 && (
            <p className="text-sm font-semibold" style={{ fontFamily: 'Barlow, sans-serif', color: '#ff546f' }}>
              {overdueCount} overdue
            </p>
          )}
        </div>
      </div>

      {/* Link to schedule */}
      <button
        onClick={() => scheduleRef.current?.scrollIntoView({ behavior: 'smooth' })}
        className="text-sm font-medium -mt-4"
        style={{ color: '#ff9419' }}
      >
        Show me my training schedule →
      </button>

      {/* ── Section 2: Today's milestones ── */}
      <div>
        <h2 className="text-lg font-bold mb-3" style={{ fontFamily: 'Barlow, sans-serif', color: '#2f2922' }}>
          Today's milestones
        </h2>

        {allTrainingDone ? (
          /* Empty state — all done */
          <div className="bg-white rounded-xl p-8 text-center shadow-sm border" style={{ borderColor: '#eae9e8' }}>
            <p className="text-lg font-bold mb-1" style={{ fontFamily: 'Barlow, sans-serif', color: '#2f2922' }}>
              You're all caught up for today 🎉
            </p>
            <p className="text-sm mb-4" style={{ color: '#7a7672' }}>Check what's coming up next.</p>
            <button
              onClick={() => scheduleRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="text-sm font-medium"
              style={{ color: '#ff9419' }}
            >
              View full schedule →
            </button>
          </div>
        ) : todayDay ? (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor: '#eae9e8' }}>
            {/* Card header */}
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#eae9e8' }}>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded" style={{ background: '#ff9419', color: 'white', fontFamily: 'Barlow, sans-serif' }}>
                  Day {todayDay.dayNumber}
                </span>
                <span className="font-bold text-base" style={{ fontFamily: 'Barlow, sans-serif', color: '#2f2922' }}>
                  {todayDay.title}
                </span>
              </div>
            </div>

            {/* Task list */}
            <div className="divide-y" style={{ borderColor: '#eae9e8' }}>
              {visibleTasks.map(task => {
                const badge = statusBadge[task.status] || statusBadge.pending
                const hrs = Math.floor(task.durationHours)
                const mins = Math.round((task.durationHours - hrs) * 60)
                const timeLabel = hrs > 0 ? (mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`) : `${mins}m`
                return (
                  <div key={task.id} className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-sm font-medium truncate" style={{ color: '#2f2922' }}>{task.title}</span>
                      <span className="text-xs shrink-0" style={{ color: '#a09d9a' }}>{timeLabel}</span>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full shrink-0 ml-3"
                      style={{ background: badge.bg, color: badge.text, fontFamily: 'Barlow, sans-serif' }}>
                      {badge.label}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Show all / CTA footer */}
            <div className="px-5 py-3 flex items-center justify-between border-t" style={{ borderColor: '#eae9e8', background: '#f5f5f4' }}>
              {todayActivities.length > 4 && (
                <button
                  onClick={() => setShowAllTasks(v => !v)}
                  className="text-sm"
                  style={{ color: '#7a7672' }}
                >
                  {showAllTasks ? 'Show less ↑' : `Show all ${todayActivities.length} tasks ↓`}
                </button>
              )}
              <div className="ml-auto">
                <Link
                  href={`/dashboard/my-training?day=${todayDay.dayNumber}`}
                  className="text-sm font-semibold px-4 py-2 rounded-lg text-white transition-opacity hover:opacity-90"
                  style={{ background: '#ff9419', fontFamily: 'Barlow, sans-serif' }}
                >
                  Go to today's tasks →
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Empty state — no plan loaded */
          <div className="bg-white rounded-xl p-8 text-center shadow-sm border" style={{ borderColor: '#eae9e8' }}>
            <p className="font-bold text-base mb-1" style={{ fontFamily: 'Barlow, sans-serif', color: '#2f2922' }}>
              Your training plan is being set up.
            </p>
            <p className="text-sm" style={{ color: '#7a7672' }}>Check back soon or contact your coach.</p>
          </div>
        )}
      </div>

      {/* ── Section 3: Training schedule calendar ── */}
      <div ref={scheduleRef}>
        <h2 className="text-lg font-bold mb-3" style={{ fontFamily: 'Barlow, sans-serif', color: '#2f2922' }}>
          Your training schedule
        </h2>

        <div className={`grid gap-3`} style={{ gridTemplateColumns: `repeat(${traineeData.totalDays}, minmax(0, 1fr))` }}>
          {traineeData.trainingDays.map(day => {
            const dayStatus = getDayStatus(day, traineeData.currentDay)
            const trackable = day.activities.filter(a => a.activityType !== 'lunch' && a.activityType !== 'break')
            const dateLabel = getDayDate(traineeData.trainingStartDate, day.dayNumber)

            const colStyle: React.CSSProperties = dayStatus === 'in_progress'
              ? { background: '#fff4e8', borderTop: '3px solid #ff9419' }
              : dayStatus === 'completed'
              ? { background: '#e9f0fd', borderTop: '3px solid transparent' }
              : dayStatus === 'overdue'
              ? { background: '#ffeef0', borderTop: '3px solid #ff546f' }
              : { background: '#f5f5f4', borderTop: '3px solid transparent' }

            const statusMap = {
              completed:   { bg: '#e9f0fd', text: '#2a6ee8', label: 'Completed' },
              in_progress: { bg: '#fff4e8', text: '#ff630f', label: 'In progress' },
              not_started: { bg: '#eae9e8', text: '#7a7672', label: 'Not started' },
              overdue:     { bg: '#ffeef0', text: '#ff546f', label: 'Overdue' },
            }
            const s = statusMap[dayStatus]

            return (
              <Link
                key={day.dayNumber}
                href={`/dashboard/my-training?day=${day.dayNumber}`}
                className="rounded-xl p-3 border hover:shadow-md transition-all"
                style={{ ...colStyle, borderColor: '#eae9e8' }}
              >
                <p className="font-bold text-sm mb-0.5" style={{ fontFamily: 'Barlow, sans-serif', color: '#2f2922' }}>
                  Day {day.dayNumber}
                </p>
                {dateLabel && (
                  <p className="text-xs mb-2" style={{ color: '#7a7672' }}>{dateLabel}</p>
                )}
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full inline-block mb-2"
                  style={{ background: s.bg, color: s.text, fontFamily: 'Barlow, sans-serif' }}>
                  {s.label}
                </span>
                <p className="text-xs" style={{ color: '#a09d9a' }}>
                  {trackable.length} module{trackable.length !== 1 ? 's' : ''}
                </p>
              </Link>
            )
          })}
        </div>
      </div>

    </div>
  )
}
