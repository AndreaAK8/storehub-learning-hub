'use client'

import { useState } from 'react'

interface ReflectionModalProps {
  isOpen: boolean
  onClose: () => void
  dayNumber: number
  dayTitle: string
  onSubmit: (reflection: {
    confusingTopic: string
    improvement: string
    confidenceLevel: number
  }) => Promise<void>
}

export function ReflectionModal({
  isOpen,
  onClose,
  dayNumber,
  dayTitle,
  onSubmit,
}: ReflectionModalProps) {
  const [confusingTopic, setConfusingTopic] = useState('')
  const [improvement, setImprovement] = useState('')
  const [confidenceLevel, setConfidenceLevel] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showValidation, setShowValidation] = useState(false)

  // Check if form is complete
  const isFormComplete = confusingTopic.trim().length >= 10 &&
                         improvement.trim().length >= 10 &&
                         confidenceLevel > 0

  const handleSubmit = async () => {
    setShowValidation(true)

    if (!isFormComplete) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        confusingTopic,
        improvement,
        confidenceLevel,
      })
      // Reset form
      setConfusingTopic('')
      setImprovement('')
      setConfidenceLevel(0)
      setShowValidation(false)
      onClose()
    } catch (error) {
      console.error('Failed to submit reflection:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop - No click to close */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in duration-200">
        {/* Mandatory Badge */}
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            Required Reflection
          </span>
        </div>

        {/* Header */}
        <div className="text-center mb-6 mt-2">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-3xl">🎉</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Day {dayNumber} Complete!</h2>
          <p className="text-gray-500 mt-1">{dayTitle}</p>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-5">
          <div className="flex items-start gap-2">
            <span className="text-blue-500 text-lg">💡</span>
            <p className="text-sm text-blue-700">
              Please complete this reflection before continuing. It helps your coach understand your progress and provide better support.
            </p>
          </div>
        </div>

        {/* Reflection Form */}
        <div className="space-y-5">
          {/* Confusing Topic */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              What was the most confusing topic today? <span className="text-red-500">*</span>
            </label>
            <textarea
              value={confusingTopic}
              onChange={(e) => setConfusingTopic(e.target.value)}
              placeholder="Describe anything that was unclear or difficult to understand... (minimum 10 characters)"
              rows={2}
              className={`
                w-full px-3 py-2 border rounded-lg outline-none resize-none text-sm transition-colors
                ${showValidation && confusingTopic.trim().length < 10
                  ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                }
              `}
            />
            {showValidation && confusingTopic.trim().length < 10 && (
              <p className="text-red-500 text-xs mt-1">Please provide more detail (at least 10 characters)</p>
            )}
          </div>

          {/* Improvement */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              What would you do differently next time? <span className="text-red-500">*</span>
            </label>
            <textarea
              value={improvement}
              onChange={(e) => setImprovement(e.target.value)}
              placeholder="Think about your approach and what could be improved... (minimum 10 characters)"
              rows={2}
              className={`
                w-full px-3 py-2 border rounded-lg outline-none resize-none text-sm transition-colors
                ${showValidation && improvement.trim().length < 10
                  ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                }
              `}
            />
            {showValidation && improvement.trim().length < 10 && (
              <p className="text-red-500 text-xs mt-1">Please provide more detail (at least 10 characters)</p>
            )}
          </div>

          {/* Confidence Level */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              How confident are you with today&apos;s topics? <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => setConfidenceLevel(level)}
                  className={`
                    w-12 h-12 rounded-full text-lg font-medium transition-all
                    ${confidenceLevel === level
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white scale-110 shadow-lg'
                      : showValidation && confidenceLevel === 0
                        ? 'bg-red-50 text-red-400 border-2 border-red-300 hover:bg-red-100'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                >
                  {level}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2 px-2">
              <span>Not confident</span>
              <span>Very confident</span>
            </div>
            {showValidation && confidenceLevel === 0 && (
              <p className="text-red-500 text-xs mt-2 text-center">Please select your confidence level</p>
            )}
          </div>
        </div>

        {/* Progress indicator */}
        <div className="mt-6 mb-4">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>Completion</span>
            <span>{isFormComplete ? '3/3' : `${(confusingTopic.trim().length >= 10 ? 1 : 0) + (improvement.trim().length >= 10 ? 1 : 0) + (confidenceLevel > 0 ? 1 : 0)}/3`}</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${isFormComplete ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-blue-400 to-indigo-500'}`}
              style={{
                width: `${((confusingTopic.trim().length >= 10 ? 1 : 0) + (improvement.trim().length >= 10 ? 1 : 0) + (confidenceLevel > 0 ? 1 : 0)) / 3 * 100}%`
              }}
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`
            w-full py-4 px-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2
            ${isFormComplete
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-200 hover:shadow-xl hover:scale-[1.02]'
              : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 shadow-lg shadow-blue-200'
            }
            ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}
          `}
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Submitting...
            </>
          ) : isFormComplete ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Submit & Continue
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Complete All Fields
            </>
          )}
        </button>

        {/* Note */}
        <p className="text-center text-xs text-gray-400 mt-4">
          Your reflection helps your coach understand your learning journey and provide better support.
        </p>
      </div>
    </div>
  )
}
