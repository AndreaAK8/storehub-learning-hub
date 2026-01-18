'use client'

import { useState, useEffect } from 'react'
import Certificate from './Certificate'
import Confetti from './Confetti'

interface CompletionCelebrationProps {
  traineeName: string
  roleName: string
  roleCode: string
  completionDate: string
  certificateId: string
  finalScore?: number
  totalHours?: number
  activitiesCompleted?: number
  onTakeSurvey: () => void
  surveyCompleted?: boolean
  surveyUrl?: string
}

export default function CompletionCelebration({
  traineeName,
  roleName,
  roleCode,
  completionDate,
  certificateId,
  finalScore,
  totalHours,
  activitiesCompleted,
  onTakeSurvey,
  surveyCompleted = false,
  surveyUrl
}: CompletionCelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(false)
  const [hasSeenCelebration, setHasSeenCelebration] = useState(false)

  useEffect(() => {
    // Check if user has seen the celebration before
    const celebrationKey = `celebration_seen_${certificateId}`
    const seen = localStorage.getItem(celebrationKey)

    if (!seen) {
      setShowConfetti(true)
      localStorage.setItem(celebrationKey, 'true')
    }
    setHasSeenCelebration(true)
  }, [certificateId])

  return (
    <div className="min-h-screen py-8 px-4">
      {/* Confetti on first view */}
      {showConfetti && <Confetti duration={5000} />}

      {/* Achievement Header */}
      <div className="max-w-3xl mx-auto text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 rounded-full mb-4">
          <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-amber-300 font-medium">Achievement Unlocked!</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
          Congratulations, {traineeName.split(' ')[0]}! 🎉
        </h1>
        <p className="text-slate-600 text-lg">
          You've completed your <span className="font-semibold text-slate-800">{roleName}</span> training journey.
        </p>
      </div>

      {/* Certificate */}
      <Certificate
        traineeName={traineeName}
        roleName={roleName}
        roleCode={roleCode}
        completionDate={completionDate}
        certificateId={certificateId}
        finalScore={finalScore}
        totalHours={totalHours}
        activitiesCompleted={activitiesCompleted}
      />

      {/* Survey Section */}
      <div className="max-w-3xl mx-auto mt-10">
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8 border border-slate-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                Help Us Improve
              </h3>
              <p className="text-slate-600 text-sm mb-4">
                Your feedback helps us create better training experiences for future team members.
                It only takes 2 minutes!
              </p>

              {surveyCompleted ? (
                <div className="flex items-center gap-2 text-green-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Thank you for your feedback!</span>
                </div>
              ) : (
                <button
                  onClick={() => {
                    // Open survey in new tab
                    if (surveyUrl) {
                      window.open(surveyUrl, '_blank', 'noopener,noreferrer')
                    }
                    // Call the handler to trigger workflow and mark as completed
                    onTakeSurvey()
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all hover:scale-105 shadow-lg shadow-violet-500/25"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Take Quick Survey
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Journey Summary */}
      <div className="max-w-3xl mx-auto mt-8">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Your Training Journey
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-slate-900">{totalHours || 32}h</p>
              <p className="text-xs text-slate-500 mt-1">Training Hours</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-slate-900">{activitiesCompleted || 24}</p>
              <p className="text-xs text-slate-500 mt-1">Activities Done</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-slate-900">{finalScore || 100}%</p>
              <p className="text-xs text-slate-500 mt-1">Final Score</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-amber-600">🏆</p>
              <p className="text-xs text-slate-500 mt-1">Certified</p>
            </div>
          </div>
        </div>
      </div>

      {/* What's Next */}
      <div className="max-w-3xl mx-auto mt-8 text-center">
        <p className="text-slate-500 text-sm">
          Your certificate is ready to download. You can also access it anytime from your training dashboard.
        </p>
      </div>
    </div>
  )
}
