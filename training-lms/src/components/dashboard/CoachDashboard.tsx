'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Trainee } from '@/types/trainee'

interface CoachDashboardProps {
  trainees: Trainee[]
  coachEmail: string
  coachName: string
}

// Calculate progress percentage
function getProgress(trainee: Trainee): number {
  if (!trainee.totalAssessmentsRequired) return 0
  return Math.round((trainee.totalAssessmentsCompleted / trainee.totalAssessmentsRequired) * 100)
}

// Get status color
function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'New': 'bg-gray-100 text-gray-700',
    'Email Sent': 'bg-blue-100 text-blue-700',
    'In Progress': 'bg-yellow-100 text-yellow-700',
    'Training Complete': 'bg-green-100 text-green-700',
    'Report Sent': 'bg-purple-100 text-purple-700',
  }
  return colors[status] || 'bg-gray-100 text-gray-700'
}

export default function CoachDashboard({ trainees, coachEmail, coachName }: CoachDashboardProps) {
  const [submittingScore, setSubmittingScore] = useState<string | null>(null)

  // Filter trainees assigned to this coach
  const myTrainees = trainees.filter(t =>
    t.coachEmail?.toLowerCase() === coachEmail.toLowerCase()
  )

  // Get trainees who need attention (incomplete assessments, Day 3+)
  const activeTrainees = myTrainees.filter(t =>
    t.daysSinceTrainingStart >= 3 &&
    !['Training Complete', 'Report Sent', 'Graduated'].includes(t.status)
  )

  // Trainees awaiting handover (Day 3-4)
  const pendingHandover = myTrainees.filter(t =>
    t.daysSinceTrainingStart >= 3 && t.daysSinceTrainingStart <= 4
  )

  // Trainees with incomplete assessments
  const needsScoring = myTrainees.filter(t =>
    t.totalAssessmentsRequired > t.totalAssessmentsCompleted &&
    t.daysSinceTrainingStart >= 3
  )

  // Stats
  const totalAssigned = myTrainees.length
  const activeCount = activeTrainees.length
  const completedCount = myTrainees.filter(t => ['Training Complete', 'Report Sent'].includes(t.status)).length

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {coachName}!</h1>
            <p className="text-teal-100 mt-1">Here are your assigned trainees and pending actions</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{activeCount}</p>
            <p className="text-teal-200 text-sm">Active Trainees</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalAssigned}</p>
              <p className="text-sm text-gray-500">Total Assigned</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
              <p className="text-sm text-gray-500">In Training</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{needsScoring.length}</p>
              <p className="text-sm text-gray-500">Need Scoring</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
              <p className="text-sm text-gray-500">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Actions */}
      {needsScoring.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="font-semibold text-orange-800">Action Required: Submit Scores</h3>
          </div>
          <p className="text-sm text-orange-700 mb-3">
            The following trainees have pending assessments that need your scores:
          </p>
          <div className="flex flex-wrap gap-2">
            {needsScoring.map(trainee => (
              <Link
                key={trainee.email}
                href={`/dashboard/trainees/${encodeURIComponent(trainee.email)}`}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-full text-sm font-medium text-orange-700 hover:bg-orange-100 transition-colors border border-orange-200"
              >
                {trainee.fullName}
                <span className="text-xs text-orange-500">
                  ({trainee.totalAssessmentsCompleted}/{trainee.totalAssessmentsRequired})
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* My Trainees */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">My Trainees</h2>
            <span className="text-sm text-gray-500">{myTrainees.length} assigned</span>
          </div>
        </div>

        {myTrainees.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {myTrainees.map(trainee => (
              <div key={trainee.email} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                      {trainee.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{trainee.fullName}</p>
                      <p className="text-sm text-gray-500">
                        {trainee.department} - Day {trainee.daysSinceTrainingStart}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Progress Bar */}
                    <div className="w-32">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{getProgress(trainee)}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            getProgress(trainee) >= 100 ? 'bg-green-500' :
                            getProgress(trainee) >= 50 ? 'bg-blue-500' : 'bg-yellow-500'
                          }`}
                          style={{ width: `${Math.min(getProgress(trainee), 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(trainee.status)}`}>
                      {trainee.status}
                    </span>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/trainees/${encodeURIComponent(trainee.email)}`}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>
                      {trainee.totalAssessmentsRequired > trainee.totalAssessmentsCompleted && (
                        <Link
                          href={`/dashboard/trainees/${encodeURIComponent(trainee.email)}#scores`}
                          className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Submit Score"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                          </svg>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <p>No trainees assigned yet</p>
            <p className="text-sm mt-1">You&apos;ll see your trainees here once assigned</p>
          </div>
        )}
      </div>

      {/* Upcoming Sessions */}
      {pendingHandover.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Handovers</h2>
            <p className="text-sm text-gray-500 mt-1">Trainees recently handed over to you</p>
          </div>
          <div className="p-4 space-y-3">
            {pendingHandover.map(trainee => (
              <div key={trainee.email} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{trainee.fullName}</p>
                    <p className="text-sm text-gray-500">{trainee.department} - Day {trainee.daysSinceTrainingStart}</p>
                  </div>
                </div>
                <div className="text-right text-sm">
                  <p className="text-blue-700 font-medium">
                    {trainee.daysSinceTrainingStart === 3 ? 'Just started role-specific' : 'Day 4 - Assessment phase'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h2>
        <div className="grid grid-cols-3 gap-3">
          <Link
            href="/dashboard/trainees"
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="font-medium text-gray-700">All Trainees</span>
          </Link>
          <Link
            href="/dashboard/reports"
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="font-medium text-gray-700">Performance Reports</span>
          </Link>
          <Link
            href="/dashboard/resources"
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="font-medium text-gray-700">Training Resources</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
