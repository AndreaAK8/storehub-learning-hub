'use client'

import { useState } from 'react'
import { Trainee } from '@/types/trainee'

interface TraineeUpdateModalProps {
  trainee: Trainee
  isOpen: boolean
  onClose: () => void
  onSave: (updates: TraineeUpdate) => Promise<void>
}

export interface TraineeUpdate {
  email: string
  performanceFlag?: string
  delayReason?: string
  daysExtended?: number
  adjustedEndDate?: string
  notes?: string
}

const PERFORMANCE_FLAGS = [
  { value: 'On Track', label: 'On Track', color: 'text-green-600' },
  { value: 'At Risk', label: 'At Risk', color: 'text-yellow-600' },
  { value: 'Critical', label: 'Critical', color: 'text-red-600' },
]

const DELAY_REASONS = [
  'Coach on leave',
  'Buddy unavailable',
  'Extended training period',
  'Medical leave',
  'Emergency leave',
  'System issues',
  'Other (specify in notes)',
]

// Calculate adjusted end date: today + days extended
function calculateAdjustedEndDate(daysExtended: number): string | null {
  if (daysExtended <= 0) return null

  try {
    const today = new Date()
    const endDate = new Date(today)
    endDate.setDate(endDate.getDate() + daysExtended)

    // Format as YYYY-MM-DD
    return endDate.toISOString().split('T')[0]
  } catch {
    return null
  }
}

function formatDateDisplay(dateStr: string | null): string {
  if (!dateStr) return 'N/A'
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-MY', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  } catch {
    return dateStr
  }
}

export default function TraineeUpdateModal({
  trainee,
  isOpen,
  onClose,
  onSave,
}: TraineeUpdateModalProps) {
  const [performanceFlag, setPerformanceFlag] = useState(trainee.performanceFlag || 'On Track')
  const [delayReason, setDelayReason] = useState(trainee.delayReason || '')
  const [daysExtended, setDaysExtended] = useState(trainee.daysExtended || 0)
  const [notes, setNotes] = useState(trainee.notes || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Calculate adjusted end date if days are extended (today + days)
      const adjustedEndDate = daysExtended > 0
        ? calculateAdjustedEndDate(daysExtended)
        : undefined

      await onSave({
        email: trainee.email,
        performanceFlag,
        delayReason: delayReason || undefined,
        daysExtended: daysExtended || undefined,
        adjustedEndDate: adjustedEndDate || undefined,
        notes: notes || undefined,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update trainee')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Update Trainee Status</h3>
              <p className="text-sm text-gray-500">{trainee.fullName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Performance Flag */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Performance Flag
              </label>
              <div className="flex gap-2">
                {PERFORMANCE_FLAGS.map((flag) => (
                  <button
                    key={flag.value}
                    type="button"
                    onClick={() => setPerformanceFlag(flag.value)}
                    className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                      performanceFlag === flag.value
                        ? flag.value === 'On Track'
                          ? 'bg-green-100 border-green-500 text-green-700'
                          : flag.value === 'At Risk'
                            ? 'bg-yellow-100 border-yellow-500 text-yellow-700'
                            : 'bg-red-100 border-red-500 text-red-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {flag.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Delay Reason - only show if At Risk or Critical */}
            {performanceFlag !== 'On Track' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delay Reason
                </label>
                <select
                  value={delayReason}
                  onChange={(e) => setDelayReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a reason...</option>
                  {DELAY_REASONS.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Days Extended */}
            {performanceFlag !== 'On Track' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Extend Training By (days)
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={daysExtended}
                  onChange={(e) => setDaysExtended(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
                {/* Show calculated adjusted end date */}
                {daysExtended > 0 && (
                  <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">New End Date:</span>{' '}
                      <span className="text-gray-900">
                        {formatDateDisplay(calculateAdjustedEndDate(daysExtended))}
                      </span>
                      <span className="text-gray-500 ml-1">(today + {daysExtended} days)</span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Add any additional context..."
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* n8n webhook notice */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-700">
                  <p className="font-medium">n8n Webhook Required</p>
                  <p className="text-blue-600 mt-0.5">
                    Updates will be sent to: <code className="text-xs bg-blue-100 px-1 py-0.5 rounded">POST /webhook/trainee/update</code>
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
