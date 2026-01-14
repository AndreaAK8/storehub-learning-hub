'use client'

import Link from 'next/link'
import { Trainee } from '@/types/trainee'
import { calculateRiskLevel, getRiskStyles, getRiskLabel } from './RiskBadge'

interface AlertCardProps {
  trainee: Trainee
  onSendReminder?: (trainee: Trainee) => void
  onUpdateStatus?: (trainee: Trainee) => void
}

// Calculate extension status
function getExtensionStatus(adjustedEndDate: string | undefined): {
  status: 'active' | 'ending-soon' | 'ends-today' | 'expired'
  daysLeft: number
  message: string
} | null {
  if (!adjustedEndDate) return null

  try {
    const endDate = new Date(adjustedEndDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    endDate.setHours(0, 0, 0, 0)

    const diffTime = endDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return {
        status: 'expired',
        daysLeft: diffDays,
        message: `Extension expired ${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''} ago`
      }
    } else if (diffDays === 0) {
      return {
        status: 'ends-today',
        daysLeft: 0,
        message: 'Extension ends today'
      }
    } else if (diffDays <= 2) {
      return {
        status: 'ending-soon',
        daysLeft: diffDays,
        message: `Extension ends in ${diffDays} day${diffDays > 1 ? 's' : ''}`
      }
    } else {
      return {
        status: 'active',
        daysLeft: diffDays,
        message: `${diffDays} days left on extension`
      }
    }
  } catch {
    return null
  }
}

export default function AlertCard({ trainee, onSendReminder, onUpdateStatus }: AlertCardProps) {
  const riskLevel = calculateRiskLevel(trainee)
  const styles = getRiskStyles(riskLevel)
  const remaining = trainee.totalAssessmentsRequired - trainee.totalAssessmentsCompleted

  // Calculate how far behind they are
  const expectedDay = trainee.daysSinceTrainingStart
  const expectedAssessments = Math.floor((expectedDay / 30) * trainee.totalAssessmentsRequired)
  const assessmentsBehind = Math.max(0, expectedAssessments - trainee.totalAssessmentsCompleted)

  return (
    <div className={`rounded-lg border-l-4 bg-white shadow-sm p-4 ${
      riskLevel === 'critical' ? 'border-l-red-500' :
      riskLevel === 'at-risk' ? 'border-l-yellow-500' :
      'border-l-green-500'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {/* Risk Indicator */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${styles.bg}`}>
            <span className={`font-bold text-sm ${styles.text}`}>
              {trainee.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </span>
          </div>

          <div className="min-w-0">
            {/* Name and Day */}
            <div className="flex items-center gap-2">
              <Link
                href={`/dashboard/trainees/${encodeURIComponent(trainee.email)}`}
                className="font-medium text-gray-900 hover:text-blue-600 truncate"
              >
                {trainee.fullName}
              </Link>
              <span className="text-xs text-gray-500 flex-shrink-0">
                Day {trainee.currentTrainingDay || trainee.daysSinceTrainingStart}
              </span>
            </div>

            {/* Status message */}
            <p className="text-sm text-gray-600 mt-0.5">
              {riskLevel === 'critical' && assessmentsBehind > 0 && (
                <span className="text-red-600 font-medium">
                  {assessmentsBehind} assessment{assessmentsBehind > 1 ? 's' : ''} overdue
                </span>
              )}
              {riskLevel === 'at-risk' && (
                <span className="text-yellow-700">
                  {remaining} assessment{remaining > 1 ? 's' : ''} remaining
                </span>
              )}
              {riskLevel === 'on-track' && (
                <span className="text-green-700">
                  On track - {remaining} remaining
                </span>
              )}
            </p>

            {/* Delay Reason / Notes */}
            {trainee.delayReason && (
              <div className="flex items-start gap-1.5 mt-2 text-sm text-gray-500">
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <span className="italic">&quot;{trainee.delayReason}&quot;</span>
              </div>
            )}

            {trainee.notes && !trainee.delayReason && (
              <div className="flex items-start gap-1.5 mt-2 text-sm text-gray-500">
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <span className="italic">&quot;{trainee.notes}&quot;</span>
              </div>
            )}

            {/* Extension status indicator */}
            {(() => {
              const extensionStatus = getExtensionStatus(trainee.adjustedEndDate)
              if (!extensionStatus) return null

              const statusColors = {
                'expired': 'text-red-600 bg-red-50',
                'ends-today': 'text-orange-600 bg-orange-50',
                'ending-soon': 'text-yellow-600 bg-yellow-50',
                'active': 'text-blue-600 bg-blue-50'
              }

              const statusIcons = {
                'expired': '⚠️',
                'ends-today': '🔔',
                'ending-soon': '⏰',
                'active': '📅'
              }

              return (
                <div className={`flex items-center gap-1.5 mt-2 text-xs px-2 py-1 rounded-md ${statusColors[extensionStatus.status]}`}>
                  <span>{statusIcons[extensionStatus.status]}</span>
                  <span className="font-medium">{extensionStatus.message}</span>
                  {extensionStatus.status === 'expired' && (
                    <span className="ml-1 text-red-500">— needs review</span>
                  )}
                </div>
              )
            })()}
          </div>
        </div>

        {/* Risk Badge */}
        <span className={`text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 ${styles.bg} ${styles.text}`}>
          {getRiskLabel(riskLevel)}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
        {onSendReminder && (
          <button
            onClick={() => onSendReminder(trainee)}
            className="flex-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 py-1.5 px-3 rounded transition-colors"
          >
            Send Reminder
          </button>
        )}
        {onUpdateStatus && (
          <button
            onClick={() => onUpdateStatus(trainee)}
            className="flex-1 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 py-1.5 px-3 rounded transition-colors"
          >
            Update Status
          </button>
        )}
        <Link
          href={`/dashboard/trainees/${encodeURIComponent(trainee.email)}`}
          className="flex-1 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 py-1.5 px-3 rounded transition-colors text-center"
        >
          View Details
        </Link>
      </div>
    </div>
  )
}

// Compact version for lists
export function AlertCardCompact({ trainee }: { trainee: Trainee }) {
  const riskLevel = calculateRiskLevel(trainee)
  const styles = getRiskStyles(riskLevel)

  return (
    <Link
      href={`/dashboard/trainees/${encodeURIComponent(trainee.email)}`}
      className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
    >
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${styles.dot}`} />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm truncate">{trainee.fullName}</p>
        {trainee.delayReason && (
          <p className="text-xs text-gray-500 truncate">{trainee.delayReason}</p>
        )}
      </div>
      <span className="text-xs text-gray-400">
        Day {trainee.currentTrainingDay || trainee.daysSinceTrainingStart}
      </span>
    </Link>
  )
}
