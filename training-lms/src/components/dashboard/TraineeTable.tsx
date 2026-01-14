'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import type { Trainee, RiskLevel } from '@/types/trainee'
import RiskBadge, { calculateRiskLevel } from './RiskBadge'

interface TraineeTableProps {
  trainees: Trainee[]
}

export default function TraineeTable({ trainees }: TraineeTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialFilter = searchParams.get('filter') || 'all'

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [riskFilter, setRiskFilter] = useState<string>(initialFilter)
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')

  // Sync risk filter with URL params
  useEffect(() => {
    const filter = searchParams.get('filter')
    if (filter) {
      setRiskFilter(filter)
    }
  }, [searchParams])

  // Get unique departments
  const departments = [...new Set(trainees.map(t => t.department))]

  // Filter trainees
  const filteredTrainees = trainees
    .filter(trainee => {
      const matchesSearch =
        trainee.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trainee.email.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === 'all' || trainee.status === statusFilter
      const matchesDepartment = departmentFilter === 'all' || trainee.department === departmentFilter

      // Risk filter
      let matchesRisk = true
      if (riskFilter !== 'all') {
        const riskLevel = calculateRiskLevel(trainee)
        if (riskFilter === 'critical') matchesRisk = riskLevel === 'critical'
        else if (riskFilter === 'at-risk') matchesRisk = riskLevel === 'at-risk'
        else if (riskFilter === 'on-track') matchesRisk = riskLevel === 'on-track'
        else if (riskFilter === 'attention') matchesRisk = riskLevel === 'critical' || riskLevel === 'at-risk'
        else if (riskFilter === 'new') matchesRisk = trainee.status === 'New'
      }

      return matchesSearch && matchesStatus && matchesDepartment && matchesRisk
    })
    // Sort by urgency: critical first, then at-risk, then on-track
    .sort((a, b) => {
      const riskOrder: Record<RiskLevel, number> = { 'critical': 0, 'at-risk': 1, 'on-track': 2, 'unknown': 3 }
      return riskOrder[calculateRiskLevel(a)] - riskOrder[calculateRiskLevel(b)]
    })

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Filters */}
      <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
          className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            riskFilter === 'critical' ? 'border-red-300 bg-red-50' :
            riskFilter === 'at-risk' ? 'border-yellow-300 bg-yellow-50' :
            riskFilter === 'on-track' ? 'border-green-300 bg-green-50' :
            'border-gray-300'
          }`}
        >
          <option value="all">All Risk Levels</option>
          <option value="critical">Overdue</option>
          <option value="at-risk">At Risk</option>
          <option value="on-track">On Track</option>
          <option value="attention">Needs Attention</option>
          <option value="new">New Trainees</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Statuses</option>
          <option value="New">New</option>
          <option value="Email Sent">Email Sent</option>
          <option value="Training Complete">Training Complete</option>
          <option value="Report Sent">Report Sent</option>
        </select>
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Departments</option>
          {departments.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trainee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Risk
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progress
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Day
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Coach
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredTrainees.map((trainee) => (
              <tr
                key={trainee.email}
                className="hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => router.push(`/dashboard/trainees/${encodeURIComponent(trainee.email)}`)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                      {trainee.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{trainee.fullName}</div>
                      <div className="text-sm text-gray-500">{trainee.department} - {trainee.country}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <RiskBadge trainee={trainee} size="sm" />
                  {trainee.delayReason && (
                    <div className="text-xs text-gray-500 mt-1 max-w-[120px] truncate" title={trainee.delayReason}>
                      {trainee.delayReason}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <ProgressBar
                    completed={trainee.totalAssessmentsCompleted}
                    total={trainee.totalAssessmentsRequired}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {['Training Complete', 'Report Sent'].includes(trainee.status) ? (
                    <span className="text-sm text-green-600 font-medium">{trainee.daysSinceTrainingStart} days</span>
                  ) : (
                    <span className="text-sm text-gray-900">Day {trainee.currentTrainingDay || trainee.daysSinceTrainingStart}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={trainee.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{trainee.coachName}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <Link
                    href={`/dashboard/trainees/${encodeURIComponent(trainee.email)}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredTrainees.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No trainees found matching your filters.
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200 text-sm text-gray-500">
        Showing {filteredTrainees.length} of {trainees.length} trainees
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'New': 'bg-gray-100 text-gray-800',
    'Email Sent': 'bg-blue-100 text-blue-800',
    'Training Complete': 'bg-green-100 text-green-800',
    'Report Sent': 'bg-purple-100 text-purple-800',
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  )
}

function ProgressBar({ completed, total }: { completed: number; total: number }) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${percentage === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm text-gray-600">{completed}/{total}</span>
    </div>
  )
}
