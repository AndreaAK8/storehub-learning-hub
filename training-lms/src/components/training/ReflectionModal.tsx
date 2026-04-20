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
          <span className="bg-[#fff4e8] text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            Required Reflection
          </span>
        </div>

        {/* Header */}
        <div className="text-center mb-6 mt-2">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#fff4e8' }}>
            <span className="text-3xl">🎉</span>
          </div>
          <h2 className="text-2xl font-bold text-[#2f2922]">Day {dayNumber} Complete!</h2>
          <p className="text-[#7a7672] mt-1">{dayTitle}</p>
        </div>

        {/* Info Banner */}
        <div className="rounded-xl p-3 mb-5" style={{ background: '#e9f0fd', border: '1px solid #c4d7f9' }}>
          <div className="flex items-start gap-2">
            <span className="text-lg">💡</span>
            <p className="text-sm" style={{ color: '#2a6ee8' }}>
              Please complete this reflection before continuing. It helps your coach understand your progress and provide better support.
            </p>
          </div>
        </div>

        {/* Reflection Form */}
        <div className="space-y-5">
          {/* Confusing Topic */}
          <div>
            <label className="block text-sm font-semibold text-[#55504a] mb-2">
              What was the most confusing topic today? <span className="text-[#ff546f]">*</span>
            </label>
            <textarea
              value={confusingTopic}
              onChange={(e) => setConfusingTopic(e.target.value)}
              placeholder="Describe anything that was unclear or difficult to understand... (minimum 10 characters)"
              rows={2}
              className={`
                w-full px-3 py-2 border rounded-lg outline-none resize-none text-sm transition-colors
                ${showValidation && confusingTopic.trim().length < 10
                  ? 'border-[#ffcfd7] bg-[#ffeef0] focus:ring-2 focus:ring-red-500 focus:border-[#ffcfd7]'
                  : 'border-[#a09d9a] focus:ring-2 focus:ring-[#ff9419] focus:border-[#ff9419]'
                }
              `}
            />
            {showValidation && confusingTopic.trim().length < 10 && (
              <p className="text-[#ff546f] text-xs mt-1">Please provide more detail (at least 10 characters)</p>
            )}
          </div>

          {/* Improvement */}
          <div>
            <label className="block text-sm font-semibold text-[#55504a] mb-2">
              What would you do differently next time? <span className="text-[#ff546f]">*</span>
            </label>
            <textarea
              value={improvement}
              onChange={(e) => setImprovement(e.target.value)}
              placeholder="Think about your approach and what could be improved... (minimum 10 characters)"
              rows={2}
              className={`
                w-full px-3 py-2 border rounded-lg outline-none resize-none text-sm transition-colors
                ${showValidation && improvement.trim().length < 10
                  ? 'border-[#ffcfd7] bg-[#ffeef0] focus:ring-2 focus:ring-red-500 focus:border-[#ffcfd7]'
                  : 'border-[#a09d9a] focus:ring-2 focus:ring-[#ff9419] focus:border-[#ff9419]'
                }
              `}
            />
            {showValidation && improvement.trim().length < 10 && (
              <p className="text-[#ff546f] text-xs mt-1">Please provide more detail (at least 10 characters)</p>
            )}
          </div>

          {/* Confidence Level */}
          <div>
            <label className="block text-sm font-semibold text-[#55504a] mb-3">
              How confident are you with today&apos;s topics? <span className="text-[#ff546f]">*</span>
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => setConfidenceLevel(level)}
                  className={`w-12 h-12 rounded-full text-lg font-medium transition-all ${
                    showValidation && confidenceLevel === 0 && confidenceLevel !== level
                      ? 'bg-[#ffeef0] text-[#ff546f] border-2 border-[#ffcfd7]'
                      : confidenceLevel !== level
                      ? 'bg-[#eae9e8] text-[#55504a] hover:bg-[#c5c3c1]'
                      : 'scale-110 shadow-lg text-white'
                  }`}
                  style={confidenceLevel === level ? { background: '#ff9419' } : {}}
                >
                  {level}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-[#a09d9a] mt-2 px-2">
              <span>Not confident</span>
              <span>Very confident</span>
            </div>
            {showValidation && confidenceLevel === 0 && (
              <p className="text-[#ff546f] text-xs mt-2 text-center">Please select your confidence level</p>
            )}
          </div>
        </div>

        {/* Progress indicator */}
        <div className="mt-6 mb-4">
          <div className="flex items-center justify-between text-xs text-[#7a7672] mb-2">
            <span>Completion</span>
            <span>{isFormComplete ? '3/3' : `${(confusingTopic.trim().length >= 10 ? 1 : 0) + (improvement.trim().length >= 10 ? 1 : 0) + (confidenceLevel > 0 ? 1 : 0)}/3`}</span>
          </div>
          <div className="w-full h-2 bg-[#c5c3c1] rounded-full overflow-hidden">
            <div
              style={{ background: isFormComplete ? '#2a6ee8' : '#ff9419' }}
              className="h-full rounded-full transition-all duration-300"
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
          className="w-full py-4 px-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 text-white disabled:cursor-not-allowed"
          style={{ background: isFormComplete ? '#2a6ee8' : '#ff9419', opacity: isSubmitting ? 0.7 : 1 }}
        >
          {isSubmitting ? (
            <>
              <span className="text-sm">Saving...</span>
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
        <p className="text-center text-xs text-[#a09d9a] mt-4">
          Your reflection helps your coach understand your learning journey and provide better support.
        </p>
      </div>
    </div>
  )
}
