'use client'

import { useState } from 'react'
import { Trainee } from '@/types/trainee'
import AlertCard from './AlertCard'
import TraineeUpdateModal, { TraineeUpdate } from './TraineeUpdateModal'

interface NeedsAttentionSectionProps {
  critical: Trainee[]
  atRisk: Trainee[]
  allTrainees?: Trainee[]
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

export default function NeedsAttentionSection({ critical, atRisk, allTrainees = [] }: NeedsAttentionSectionProps) {
  const [selectedTrainee, setSelectedTrainee] = useState<Trainee | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [reminderStatus, setReminderStatus] = useState<string | null>(null)

  // Combine and sort: critical first, then at-risk
  const needsAttention = [...critical, ...atRisk].slice(0, 5)

  // Find trainees with extensions that need review (expired or ending soon)
  const extensionsToReview = allTrainees
    .filter(t => {
      const status = getExtensionStatus(t.adjustedEndDate)
      return status && (status.status === 'expired' || status.status === 'ends-today' || status.status === 'ending-soon')
    })
    .sort((a, b) => {
      const statusA = getExtensionStatus(a.adjustedEndDate)
      const statusB = getExtensionStatus(b.adjustedEndDate)
      return (statusA?.daysLeft || 0) - (statusB?.daysLeft || 0)
    })

  const handleSendReminder = async (trainee: Trainee) => {
    setReminderStatus(`Sending reminder to ${trainee.fullName}...`)

    // TODO: Call n8n webhook to send reminder
    // For now, just show a message
    setTimeout(() => {
      setReminderStatus(`Reminder sent to ${trainee.fullName}! (n8n webhook needed)`)
      setTimeout(() => setReminderStatus(null), 3000)
    }, 1000)
  }

  const handleUpdateStatus = (trainee: Trainee) => {
    setSelectedTrainee(trainee)
    setIsModalOpen(true)
  }

  const handleSaveUpdate = async (updates: TraineeUpdate) => {
    // Call API to update trainee
    const response = await fetch('/api/trainees/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to update trainee')
    }

    // If n8n webhook not configured, show helpful message
    if (result.message === 'n8n webhook not configured') {
      console.log('n8n webhook instructions:', result.instructions)
    }

    // Close modal and refresh page to show updated data
    setIsModalOpen(false)
    setSelectedTrainee(null)
    // In production, you'd use router.refresh() or SWR revalidation
    window.location.reload()
  }

  if (needsAttention.length === 0) {
    return (
      <div className="bg-[#e9f0fd] border border-[#c4d7f9] rounded-lg p-6 text-center">
        <div className="w-12 h-12 bg-[#e9f0fd] rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-[#2a6ee8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-[#2a6ee8]">All trainees on track!</h3>
        <p className="text-[#2a6ee8] mt-1">No urgent attention needed right now.</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        {/* Header */}
        <div className="p-4 border-b border-[#c5c3c1]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#ff546f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h2 className="text-lg font-semibold text-[#2f2922]">Needs Attention</h2>
              <span className="text-sm text-[#7a7672]">
                ({critical.length + atRisk.length} trainee{critical.length + atRisk.length !== 1 ? 's' : ''})
              </span>
            </div>
            {(critical.length + atRisk.length) > 5 && (
              <a href="/dashboard/trainees?filter=attention" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                View all
              </a>
            )}
          </div>
        </div>

        {/* Reminder Status Toast */}
        {reminderStatus && (
          <div className="mx-4 mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {reminderStatus}
          </div>
        )}

        {/* Alert Cards */}
        <div className="p-4 space-y-3">
          {needsAttention.map((trainee) => (
            <AlertCard
              key={trainee.email}
              trainee={trainee}
              onSendReminder={handleSendReminder}
              onUpdateStatus={handleUpdateStatus}
            />
          ))}
        </div>

        {/* Legend / Help */}
        <div className="px-4 pb-4">
          <div className="flex items-center gap-4 text-xs text-[#7a7672]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#ffeef0]" />
              <span>Overdue (behind 20%+)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#fff4e8]" />
              <span>At Risk (behind 5-20%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Review Extensions Section */}
      {extensionsToReview.length > 0 && (
        <div className="bg-white rounded-lg shadow mt-6">
          <div className="p-4 border-b border-[#c5c3c1]">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔔</span>
              <h2 className="text-lg font-semibold text-[#2f2922]">Review Extensions</h2>
              <span className="text-sm text-[#7a7672]">
                ({extensionsToReview.length} trainee{extensionsToReview.length !== 1 ? 's' : ''})
              </span>
            </div>
            <p className="text-sm text-[#55504a] mt-1">
              These trainees have extensions that need review. Update their status if they&apos;ve caught up.
            </p>
          </div>

          <div className="divide-y divide-gray-100">
            {extensionsToReview.map((trainee) => {
              const status = getExtensionStatus(trainee.adjustedEndDate)
              if (!status) return null

              const statusColors = {
                'expired': 'bg-[#ffeef0] border-[#ffcfd7]',
                'ends-today': 'bg-orange-50 border-orange-200',
                'ending-soon': 'bg-[#fff4e8] border-yellow-200',
                'active': 'bg-blue-50 border-blue-200'
              }

              const statusTextColors = {
                'expired': 'text-[#ff546f]',
                'ends-today': 'text-orange-700',
                'ending-soon': 'text-[#ff9419]',
                'active': 'text-blue-700'
              }

              return (
                <div key={trainee.email} className={`p-4 ${statusColors[status.status]} border-l-4`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[#2f2922]">{trainee.fullName}</p>
                      <p className={`text-sm font-medium ${statusTextColors[status.status]}`}>
                        {status.status === 'expired' ? '⚠️' : status.status === 'ends-today' ? '🔔' : '⏰'} {status.message}
                      </p>
                      {trainee.delayReason && (
                        <p className="text-sm text-[#7a7672] mt-1">Reason: {trainee.delayReason}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleUpdateStatus(trainee)}
                      className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                      Review & Update
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Update Modal */}
      {selectedTrainee && (
        <TraineeUpdateModal
          trainee={selectedTrainee}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedTrainee(null)
          }}
          onSave={handleSaveUpdate}
        />
      )}
    </>
  )
}
