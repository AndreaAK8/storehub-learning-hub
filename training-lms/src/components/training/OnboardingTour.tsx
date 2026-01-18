'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface TourStep {
  id: string
  title: string
  description: string
  icon: string
  image: string // All steps now have images
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Your Training! 🎉',
    description: 'This is your personal learning hub. Let me give you a quick tour to help you get started.',
    icon: '👋',
    image: '🎓',
  },
  {
    id: 'roadmap',
    title: 'Training Roadmap',
    description: 'At the top, you\'ll see your training journey. Each circle represents a day. Green = completed, Blue = current day, Gray = locked. Click any unlocked day to view its activities.',
    icon: '🗺️',
    image: '📅',
  },
  {
    id: 'activities',
    title: 'Daily Activities',
    description: 'Below the roadmap, you\'ll see your daily tasks. Click "Start Activity" to begin timing, then "Complete" when done. You\'ll earn XP and bonus points for finishing early!',
    icon: '📋',
    image: '✅',
  },
  {
    id: 'progress',
    title: 'Progress Panel',
    description: 'On the right side, track your overall completion. See your XP, daily breakdown, and your coach\'s contact info if you need help.',
    icon: '📊',
    image: '📈',
  },
  {
    id: 'search',
    title: 'Quick Search',
    description: 'Press ⌘K (Mac) or Ctrl+K (Windows) anytime to quickly search for any activity or module. You can also click the search button in the top-right corner.',
    icon: '🔍',
    image: '🔎',
  },
  {
    id: 'help',
    title: 'Need Help?',
    description: 'Look for the blue "Need Help?" button in the bottom-right corner of the screen. It has a checklist of things to try before contacting your coach.',
    icon: '❓',
    image: '💬',
  },
  {
    id: 'reflection',
    title: 'Daily Reflection',
    description: 'After completing all activities for a day, you\'ll be asked to reflect on what you learned. This helps your coach understand your progress and support you better.',
    icon: '💭',
    image: '✍️',
  },
  {
    id: 'complete',
    title: 'Let\'s Get Started! 🚀',
    description: 'First, complete your onboarding checklist to get familiar with StoreHub. Once done, come back to "My Schedule" to start your training activities.',
    icon: '🎯',
    image: '🏆',
  },
]

interface OnboardingTourProps {
  onComplete: () => void
  traineeEmail: string
}

export default function OnboardingTour({ onComplete, traineeEmail }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const router = useRouter()

  const step = tourSteps[currentStep]
  const isLastStep = currentStep === tourSteps.length - 1
  const isFirstStep = currentStep === 0

  const handleNext = useCallback(() => {
    if (isLastStep) {
      localStorage.setItem(`tour_completed_${traineeEmail}`, 'true')
      setIsVisible(false)
      onComplete()
      router.push('/dashboard/training-overview')
    } else {
      setCurrentStep((prev) => prev + 1)
    }
  }, [isLastStep, traineeEmail, onComplete, router])

  const handlePrevious = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1)
    }
  }, [isFirstStep])

  const handleSkip = useCallback(() => {
    localStorage.setItem(`tour_completed_${traineeEmail}`, 'true')
    setIsVisible(false)
    onComplete()
    router.push('/dashboard/training-overview')
  }, [traineeEmail, onComplete, router])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') handleNext()
      else if (e.key === 'ArrowLeft') handlePrevious()
      else if (e.key === 'Escape') handleSkip()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleNext, handlePrevious, handleSkip])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Image header */}
        <div className="bg-gradient-to-br from-orange-400 to-amber-500 p-10 text-center">
          <span className="text-8xl drop-shadow-lg">{step.image}</span>
        </div>

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{step.icon}</span>
              <span className="text-sm text-gray-500 font-semibold bg-gray-100 px-3 py-1 rounded-full">
                {currentStep + 1} of {tourSteps.length}
              </span>
            </div>
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600 text-sm font-medium transition-colors"
            >
              Skip tour
            </button>
          </div>

          {/* Content */}
          <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
          <p className="text-gray-600 leading-relaxed text-base mb-8">{step.description}</p>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {tourSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'bg-orange-500 w-8'
                    : index < currentStep
                    ? 'bg-green-500 w-2.5'
                    : 'bg-gray-200 w-2.5'
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={isFirstStep}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all ${
                isFirstStep
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-orange-200 hover:shadow-xl hover:scale-105 transition-all"
            >
              {isLastStep ? 'Start Checklist' : 'Next'}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isLastStep ? "M5 13l4 4L19 7" : "M9 5l7 7-7 7"} />
              </svg>
            </button>
          </div>

          {/* Keyboard hint */}
          <p className="text-center text-xs text-gray-400 mt-5">
            Use arrow keys ← → to navigate • Enter to continue • Esc to skip
          </p>
        </div>
      </div>
    </div>
  )
}
