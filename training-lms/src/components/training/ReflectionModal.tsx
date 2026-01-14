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

  const handleSubmit = async () => {
    if (confidenceLevel === 0) return

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
      onClose()
    } catch (error) {
      console.error('Failed to submit reflection:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkip = () => {
    setConfusingTopic('')
    setImprovement('')
    setConfidenceLevel(0)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={handleSkip} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🎉</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Day {dayNumber} Complete!</h2>
          <p className="text-gray-500 mt-1">{dayTitle}</p>
        </div>

        {/* Reflection Form */}
        <div className="space-y-5">
          {/* Confusing Topic */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What was the most confusing topic today?
            </label>
            <textarea
              value={confusingTopic}
              onChange={(e) => setConfusingTopic(e.target.value)}
              placeholder="Describe anything that was unclear or difficult to understand..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-sm"
            />
          </div>

          {/* Improvement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What would you do differently next time?
            </label>
            <textarea
              value={improvement}
              onChange={(e) => setImprovement(e.target.value)}
              placeholder="Think about your approach and what could be improved..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-sm"
            />
          </div>

          {/* Confidence Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              How confident are you with today&apos;s topics?
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => setConfidenceLevel(level)}
                  className={`
                    w-12 h-12 rounded-full text-lg font-medium transition-all
                    ${confidenceLevel === level
                      ? 'bg-blue-600 text-white scale-110 shadow-lg'
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
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={handleSkip}
            className="flex-1 py-3 px-4 text-gray-600 hover:text-gray-800 font-medium rounded-lg transition-colors"
          >
            Skip for now
          </button>
          <button
            onClick={handleSubmit}
            disabled={confidenceLevel === 0 || isSubmitting}
            className={`
              flex-1 py-3 px-4 rounded-lg font-medium transition-colors
              ${confidenceLevel === 0 || isSubmitting
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
              }
            `}
          >
            {isSubmitting ? 'Submitting...' : 'Submit & Continue'}
          </button>
        </div>

        {/* Note */}
        <p className="text-center text-xs text-gray-400 mt-4">
          Your reflection helps your coach understand your learning journey
        </p>
      </div>
    </div>
  )
}
