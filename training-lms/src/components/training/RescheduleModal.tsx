'use client'

import { useState } from 'react'

interface RescheduleModalProps {
  isOpen: boolean
  onClose: () => void
  traineeName: string
  traineeEmail: string
  activityName: string
  activityId: string
  currentDay: number
  totalDays: number
  onReschedule: (data: {
    newDay: number
    reason: string
    notes: string
  }) => Promise<void>
}

const RESCHEDULE_REASONS = [
  { value: 'external', label: 'Coach/Buddy unavailable', description: 'Coach, buddy, or trainer not available' },
  { value: 'leave', label: 'Trainee on leave', description: 'Planned leave or time off' },
  { value: 'sick', label: 'Trainee sick/MC', description: 'Medical leave or sick day' },
  { value: 'pace', label: 'Extended learning time', description: 'Trainee needs more time on current material' },
  { value: 'other', label: 'Other', description: 'Other reason (specify in notes)' },
]

export function RescheduleModal({
  isOpen,
  onClose,
  traineeName,
  traineeEmail,
  activityName,
  activityId,
  currentDay,
  totalDays,
  onReschedule,
}: RescheduleModalProps) {
  const [newDay, setNewDay] = useState(currentDay + 1)
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!reason) {
      setError('Please select a reason')
      return
    }

    if (newDay === currentDay) {
      setError('New day must be different from current day')
      return
    }

    if (reason === 'other' && !notes.trim()) {
      setError('Please provide details in notes for "Other" reason')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await onReschedule({
        newDay,
        reason,
        notes,
      })
      onClose()
    } catch (err) {
      console.error('Failed to reschedule:', err)
      setError('Failed to reschedule. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setNewDay(currentDay + 1)
    setReason('')
    setNotes('')
    setError(null)
    onClose()
  }

  if (!isOpen) return null

  // Generate day options (from current day + 1 to totalDays + 2 for extensions)
  const dayOptions = []
  for (let i = 1; i <= totalDays + 2; i++) {
    if (i !== currentDay) {
      dayOptions.push(i)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Reschedule Activity</h2>
              <p className="text-sm text-gray-500">Move to a different day</p>
            </div>
          </div>
        </div>

        {/* Activity Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="text-sm text-gray-500 mb-1">Activity</div>
          <div className="font-medium text-gray-900 mb-2">{activityName}</div>
          <div className="text-sm text-gray-500 mb-1">Trainee</div>
          <div className="font-medium text-gray-900">{traineeName}</div>
          <div className="text-xs text-gray-400 mt-1">Currently: Day {currentDay}</div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* New Day */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Move to Day
            </label>
            <select
              value={newDay}
              onChange={(e) => setNewDay(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              {dayOptions.map((day) => (
                <option key={day} value={day}>
                  Day {day} {day > totalDays ? '(Extension)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Rescheduling
            </label>
            <div className="space-y-2">
              {RESCHEDULE_REASONS.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    reason === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={option.value}
                    checked={reason === option.value}
                    onChange={(e) => setReason(e.target.value)}
                    className="mt-0.5"
                  />
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes {reason === 'other' && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional details about the reschedule..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-sm"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 py-2.5 px-4 text-gray-600 hover:text-gray-800 font-medium rounded-lg border border-gray-300 hover:border-gray-400 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-colors ${
              isSubmitting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? 'Saving...' : 'Reschedule'}
          </button>
        </div>

        {/* Info note */}
        <p className="text-center text-xs text-gray-400 mt-4">
          This will update the trainee&apos;s schedule. They will see the activity on the new day.
        </p>
      </div>
    </div>
  )
}
