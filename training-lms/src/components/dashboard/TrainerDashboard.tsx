'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Trainee } from '@/types/trainee'

interface TrainerDashboardProps {
  trainees: Trainee[]
  userName: string
}

// Group trainees by their current training day
function groupByTrainingDay(trainees: Trainee[]) {
  const groups: Record<number, Trainee[]> = {}

  trainees.forEach(trainee => {
    const day = trainee.daysSinceTrainingStart || 0
    if (day >= 1 && day <= 6) { // Only active training (days 1-6)
      if (!groups[day]) groups[day] = []
      groups[day].push(trainee)
    }
  })

  return groups
}

// Get today's expected activities based on training day
function getTodayActivities(day: number, role: string) {
  const commonActivities: Record<number, string[]> = {
    1: ['Kick-off Briefing (1hr)', 'Product Fundamentals Self-Study', 'Live Demo Session'],
    2: ['Product Fundamentals Cont.', 'Quiz Assessment', 'Day 3 Briefing'],
  }

  const roleActivities: Record<string, Record<number, string[]>> = {
    'Customer Success Manager': {
      3: ['Advanced Modules Self-Study', 'CSM Tools Training'],
      4: ['Buddy Session', 'Assessment'],
      5: ['Mock Test', 'Graduation'],
    },
    'Business Consultant': {
      3: ['Pitching & SPIN Training'],
      4: ['Closing Skills Training'],
      5: ['Full Pitching Assessment'],
      6: ['Mock Test', 'Graduation'],
    },
    'Merchant Care': {
      3: ['Advanced Systems Training', 'Brand Servicing'],
      4: ['Assessment', 'Mock Test', 'Handover'],
    },
    'Onboarding Coordinator': {
      3: ['Advanced Modules', 'OC Tools'],
      4: ['Buddy Session', 'Menu Setup'],
      5: ['Mock Test', 'Graduation'],
    },
    'Sales Coordinator': {
      3: ['Advanced Modules', 'SC Tools'],
      4: ['Buddy Session', 'Assessment'],
      5: ['Mock Test', 'Graduation'],
    },
  }

  if (day <= 2) {
    return commonActivities[day] || []
  }

  return roleActivities[role]?.[day] || ['Role-specific Training']
}

export default function TrainerDashboard({ trainees, userName }: TrainerDashboardProps) {
  const [actionStatus, setActionStatus] = useState<string | null>(null)

  // Get active trainees (those currently in training)
  const activeTrainees = trainees.filter(t =>
    t.daysSinceTrainingStart >= 1 &&
    t.daysSinceTrainingStart <= 6 &&
    !['Training Complete', 'Report Sent', 'Graduated'].includes(t.status)
  )

  const groupedByDay = groupByTrainingDay(activeTrainees)
  const trainingDays = Object.keys(groupedByDay).map(Number).sort((a, b) => a - b)

  // Stats
  const day1And2Count = (groupedByDay[1]?.length || 0) + (groupedByDay[2]?.length || 0)
  const day3PlusCount = activeTrainees.length - day1And2Count
  const newTraineesCount = trainees.filter(t => t.status === 'New').length
  const pendingAssessments = trainees.filter(t =>
    t.totalAssessmentsRequired > t.totalAssessmentsCompleted
  ).length

  // Trigger workflow action
  const triggerWorkflow = async (workflow: string, description: string) => {
    setActionStatus(`Triggering: ${description}...`)

    try {
      const response = await fetch(`/api/workflows/${workflow}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (response.ok) {
        setActionStatus(`Done! ${description}`)
      } else {
        setActionStatus(`Error: Could not trigger ${workflow}`)
      }
    } catch {
      setActionStatus(`Error: Failed to connect`)
    }

    setTimeout(() => setActionStatus(null), 3000)
  }

  return (
    <div className="space-y-6">
      {/* Welcome & Quick Stats */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Good morning, {userName}!</h1>
            <p className="text-purple-100 mt-1">Here&apos;s your training overview for today</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{activeTrainees.length}</p>
            <p className="text-purple-200 text-sm">Active Trainees</p>
          </div>
        </div>

        {/* Action Status Toast */}
        {actionStatus && (
          <div className="mt-4 p-3 bg-white/20 rounded-lg text-white text-sm">
            {actionStatus}
          </div>
        )}
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{day1And2Count}</p>
              <p className="text-sm text-gray-500">Day 1-2 (Fundamentals)</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{day3PlusCount}</p>
              <p className="text-sm text-gray-500">Day 3+ (Role-Specific)</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{newTraineesCount}</p>
              <p className="text-sm text-gray-500">New (Pending Setup)</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingAssessments}</p>
              <p className="text-sm text-gray-500">Pending Assessments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Training Batches */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Active Training Batches</h2>
            <Link href="/dashboard/trainees" className="text-sm text-blue-600 hover:text-blue-800">
              View all trainees
            </Link>
          </div>
        </div>

        {trainingDays.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {trainingDays.map(day => (
              <div key={day} className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                    day <= 2 ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                  }`}>
                    {day}
                  </span>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Day {day}: {day <= 2 ? 'Product Fundamentals' : 'Role-Specific Training'}
                    </h3>
                    <p className="text-sm text-gray-500">{groupedByDay[day].length} trainee{groupedByDay[day].length !== 1 ? 's' : ''}</p>
                  </div>
                </div>

                <div className="ml-11 space-y-2">
                  {groupedByDay[day].map(trainee => {
                    const activities = getTodayActivities(day, trainee.department)
                    return (
                      <div key={trainee.email} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                            {trainee.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{trainee.fullName}</p>
                            <p className="text-xs text-gray-500">{trainee.department} - {trainee.country}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Today&apos;s focus:</p>
                            <p className="text-xs font-medium text-gray-700">{activities[0] || 'Training'}</p>
                          </div>
                          <Link
                            href={`/dashboard/trainees/${encodeURIComponent(trainee.email)}`}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <p>No active training batches right now</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          <p className="text-sm text-gray-500 mt-1">One-click workflow triggers</p>
        </div>

        <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => triggerWorkflow('reminder', 'Send incomplete assessment reminders')}
            className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700">Send Reminders</span>
          </button>

          <button
            onClick={() => triggerWorkflow('report', 'Generate performance reports')}
            className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors"
          >
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700">Generate Reports</span>
          </button>

          <button
            onClick={() => triggerWorkflow('feedback', 'Send feedback surveys')}
            className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700">Send Surveys</span>
          </button>

          <Link
            href="/dashboard/assessments"
            className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-yellow-300 hover:bg-yellow-50 transition-colors"
          >
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700">View Assessments</span>
          </Link>
        </div>
      </div>

      {/* Today's Sessions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Your Sessions Today */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Your Sessions Today</h2>
          </div>
          <div className="p-4 space-y-3">
            {activeTrainees.some(t => t.daysSinceTrainingStart <= 2) ? (
              <>
                {activeTrainees.some(t => t.daysSinceTrainingStart === 1) && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex flex-col items-center justify-center text-white">
                      <span className="text-xs">AM</span>
                      <span className="text-sm font-bold">9:30</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Kick-off Briefing</p>
                      <p className="text-sm text-gray-500">Day 1 trainees - 1 hour</p>
                    </div>
                  </div>
                )}
                {activeTrainees.some(t => t.daysSinceTrainingStart <= 2) && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                    <div className="w-12 h-12 bg-green-600 rounded-lg flex flex-col items-center justify-center text-white">
                      <span className="text-xs">PM</span>
                      <span className="text-sm font-bold">2:00</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Product Demo Session</p>
                      <p className="text-sm text-gray-500">Day 1-2 trainees - 2.5 hours</p>
                    </div>
                  </div>
                )}
                {activeTrainees.some(t => t.daysSinceTrainingStart === 2) && (
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                    <div className="w-12 h-12 bg-purple-600 rounded-lg flex flex-col items-center justify-center text-white">
                      <span className="text-xs">PM</span>
                      <span className="text-sm font-bold">5:00</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Day 3 Briefing</p>
                      <p className="text-sm text-gray-500">Day 2 trainees - 30 mins</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p>No trainer-led sessions today</p>
                <p className="text-sm mt-1">Day 1-2 trainees have live sessions</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Handovers */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Handovers</h2>
          </div>
          <div className="p-4">
            {activeTrainees.filter(t => {
              // MC hands over on Day 4, others on Day 5-6
              const handoverDay = t.department === 'Merchant Care' ? 4 : 5
              return t.daysSinceTrainingStart >= handoverDay - 1 && t.daysSinceTrainingStart <= handoverDay
            }).length > 0 ? (
              <div className="space-y-3">
                {activeTrainees.filter(t => {
                  const handoverDay = t.department === 'Merchant Care' ? 4 : 5
                  return t.daysSinceTrainingStart >= handoverDay - 1 && t.daysSinceTrainingStart <= handoverDay
                }).map(trainee => (
                  <div key={trainee.email} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{trainee.fullName}</p>
                        <p className="text-xs text-gray-500">{trainee.department}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Handover to:</p>
                      <p className="text-sm font-medium text-gray-700">{trainee.coachName || 'TL'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p>No handovers scheduled soon</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
