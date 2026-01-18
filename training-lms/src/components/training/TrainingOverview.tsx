'use client'

import { useState } from 'react'

interface TrainingOverviewProps {
  roleName: string
  roleCode: string
  totalDays: number
  currentDay?: number // 0 = not started, 1-2 = foundation, 3+ = specialization
  onViewSchedule?: () => void
}

export default function TrainingOverview({ roleName, roleCode, totalDays, currentDay = 0, onViewSchedule }: TrainingOverviewProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  // Role-specific content - can be expanded for other roles
  const roleContent = getRoleContent(roleCode)

  // Determine progress status
  const foundationStatus = currentDay === 0 ? 'not_started' : currentDay <= 2 ? 'in_progress' : 'completed'
  const specializationStatus = currentDay === 0 ? 'not_started' : currentDay <= 2 ? 'upcoming' : currentDay <= totalDays ? 'in_progress' : 'completed'

  // Dynamic welcome message based on progress
  const getWelcomeMessage = () => {
    if (currentDay === 0) {
      return `Welcome to your ${roleCode} training! You're about to begin an exciting journey to become a world-class ${roleName}. Let's get started!`
    } else if (currentDay <= 2) {
      return `Great start on your ${roleCode} training! You're currently in the Foundation phase, building your StoreHub knowledge base. Keep up the momentum!`
    } else {
      return roleContent.welcomeMessage
    }
  }

  return (
    <div className="bg-white rounded-xl border border-[var(--neutral-100)] overflow-hidden">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-[var(--orange-100)] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--sh-orange-dark)] to-[var(--sh-orange)] flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-left">
            <h2 className="text-lg font-semibold text-[var(--sh-black)]">Your {roleName} Journey</h2>
            <p className="text-sm text-[var(--neutral-300)]">Training overview & what to expect</p>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-[var(--neutral-400)] transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="px-6 pb-6 space-y-8">
          {/* Welcome Banner with Illustration */}
          <div className="rounded-xl p-8 relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border border-amber-100">
            <div className="flex items-center gap-8">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-[var(--sh-black)] mb-4 tracking-wide">
                  Welcome to StoreHub Training!
                </h3>
                <p className="text-slate-600 text-base leading-7 tracking-wide">
                  You're about to embark on an exciting learning journey that will equip you with everything you need to succeed in your role. This overview covers your training program—the foundation that every StoreHub team member builds upon.
                </p>
              </div>
              {/* Rocket Illustration */}
              <div className="hidden md:block flex-shrink-0">
                <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="60" cy="60" r="50" fill="#ff9419" fillOpacity="0.1"/>
                  <path d="M60 20C60 20 80 35 80 60C80 85 60 100 60 100C60 100 40 85 40 60C40 35 60 20 60 20Z" fill="#ff9419" fillOpacity="0.8"/>
                  <circle cx="60" cy="55" r="8" fill="white"/>
                  <path d="M45 80L35 95L50 85L45 80Z" fill="#ff9419" fillOpacity="0.5"/>
                  <path d="M75 80L85 95L70 85L75 80Z" fill="#ff9419" fillOpacity="0.5"/>
                  <path d="M55 95L60 110L65 95H55Z" fill="#ff9419" fillOpacity="0.5"/>
                  <circle cx="60" cy="55" r="4" fill="#ff630f"/>
                </svg>
              </div>
            </div>
          </div>

          {/* How This Training Works: The Self-Study Philosophy */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--sh-orange)] to-[var(--sh-orange-dark)] flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[var(--sh-black)] tracking-wide">How This Training Works</h3>
                <p className="text-base text-[var(--neutral-400)]">The Self-Study Philosophy</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* You're in Control */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-800 mb-2">You're in Control</h4>
                    <p className="text-sm text-green-700 leading-relaxed">
                      This is a self-paced journey, and you're in the driver's seat. Your proactivity and accountability will shape your success. There's no trainer watching over your shoulder—you own your learning pace and outcomes.
                    </p>
                  </div>
                </div>
              </div>

              {/* We've Got Your Back */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🤝</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-2">We've Got Your Back</h4>
                    <p className="text-sm text-blue-700 leading-relaxed">
                      While you're learning independently, you're not alone: daily check-ins with your trainer, a questions sheet for your burning questions, and trainer review sessions built into the schedule.
                    </p>
                  </div>
                </div>
              </div>

              {/* Time Matters */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">⏰</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-800 mb-2">Time Matters!</h4>
                    <p className="text-sm text-amber-700 leading-relaxed">
                      Every task has a set time limit, so managing your schedule is key. Check the training agenda to stay on track. If you fall behind, tasks can pile up—fast.
                    </p>
                  </div>
                </div>
              </div>

              {/* Some Parts Might Get Tricky */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🧩</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-purple-800 mb-2">Some Parts Might Get Tricky</h4>
                    <p className="text-sm text-purple-700 leading-relaxed">
                      Stay engaged, take notes, and don't hesitate to ask questions. Your trainer will go through them during check-ins—no question is too big or too small.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Click Everything - Full Width */}
            <div className="p-5 rounded-xl bg-gradient-to-r from-[var(--orange-100)] to-[var(--blue-100)] border border-[var(--orange-200)]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="text-2xl">🔗</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-[var(--sh-black)] mb-1">Click Everything!</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Throughout your training materials, there are hyperlinks hidden like Easter eggs. Instead of chocolate, they're packed with valuable insights. Don't miss out!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Understanding Your Training Performance Score */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--sh-blue)] to-blue-600 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 12H18L15 21L9 3L6 12H2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[var(--sh-black)] tracking-wide">Understanding Your Training Performance Score</h3>
                <p className="text-base text-[var(--neutral-400)]">How your performance is measured</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Learning Score */}
              <div className="p-5 rounded-xl bg-white border-2 border-[var(--sh-orange)] relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-[var(--sh-orange)] text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  80%
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-[var(--orange-100)] flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📚</span>
                  </div>
                  <div className="flex-1 pt-2">
                    <h4 className="font-bold text-[var(--sh-black)] text-lg mb-2">Learning Score</h4>
                    <p className="text-sm text-slate-600 mb-3">Your formal assessments contribute to this score:</p>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li className="flex items-start gap-2">
                        <span className="text-[var(--sh-orange)] mt-0.5">•</span>
                        <span><strong>All-in-One Quiz</strong> (Day 2) - Weighted based on your role</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[var(--sh-orange)] mt-0.5">•</span>
                        <span><strong>Role-Specific Assessments</strong> (Day 3+) - Details in your role overview</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Participation Score */}
              <div className="p-5 rounded-xl bg-white border-2 border-[var(--sh-blue)] relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-[var(--sh-blue)] text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  5-20%
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-[var(--blue-100)] flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">⭐</span>
                  </div>
                  <div className="flex-1 pt-2">
                    <h4 className="font-bold text-[var(--sh-black)] text-lg mb-2">Participation Score</h4>
                    <p className="text-sm text-slate-600 mb-3">Evaluated daily by your trainer across:</p>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li className="flex items-start gap-2">
                        <span className="text-[var(--sh-blue)] mt-0.5">•</span>
                        <span><strong>Task Completion</strong> (5%) - Engagement & assignment completion</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[var(--sh-blue)] mt-0.5">•</span>
                        <span><strong>Culture Code Alignment</strong> (10%) - Collaboration & Impact</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[var(--sh-blue)] mt-0.5">•</span>
                        <span><strong>Attendance</strong> (5%) - Punctuality & presence</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Participation Levels */}
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
              <h4 className="font-semibold text-[var(--sh-black)] mb-4">Participation Levels</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-white border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-red-500 text-lg">🔴</span>
                    <span className="font-semibold text-red-700">5%</span>
                  </div>
                  <p className="text-xs text-red-600">Passive & Non-Responsive</p>
                </div>
                <div className="p-3 rounded-lg bg-white border border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-yellow-500 text-lg">🟡</span>
                    <span className="font-semibold text-yellow-700">10%</span>
                  </div>
                  <p className="text-xs text-yellow-600">Passive & Somewhat Responsive</p>
                </div>
                <div className="p-3 rounded-lg bg-white border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-blue-500 text-lg">🔵</span>
                    <span className="font-semibold text-blue-700">15%</span>
                  </div>
                  <p className="text-xs text-blue-600">Neutral - Regular participation</p>
                </div>
                <div className="p-3 rounded-lg bg-white border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-green-500 text-lg">🟢</span>
                    <span className="font-semibold text-green-700">20%</span>
                  </div>
                  <p className="text-xs text-green-600">Go-Getter - Fully engaged</p>
                </div>
              </div>
            </div>

            {/* Final Score Formula */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-[var(--sh-orange)] to-[var(--sh-orange-dark)] text-white">
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <span className="font-medium">Your Final Score =</span>
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">Learning Score (80%)</span>
                <span>+</span>
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">Participation Score (5-20%)</span>
              </div>
              <p className="text-center text-sm mt-3 text-white/90">
                💡 Pro Tip: High participation can boost your overall score and provide insurance against weaker assessments!
              </p>
            </div>
          </div>

          {/* Mission Section with Icon Cards */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              {/* Target Icon */}
              <div className="w-14 h-14 rounded-xl bg-[var(--orange-100)] flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="#ff9419" strokeWidth="2"/>
                  <circle cx="12" cy="12" r="6" stroke="#ff9419" strokeWidth="2"/>
                  <circle cx="12" cy="12" r="2" fill="#ff630f"/>
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[var(--sh-black)] tracking-wide">Your Mission as an {roleCode}</h3>
                <p className="text-base text-[var(--neutral-400)] mt-1">{roleContent.missionIntro}</p>
              </div>
            </div>

            {/* Core Pillars with Numbers */}
            <div className="grid grid-cols-1 gap-4">
              {roleContent.pillars.map((pillar, index) => (
                <div
                  key={index}
                  className="flex items-start gap-5 p-5 rounded-xl bg-gradient-to-r from-[var(--orange-100)] to-white border border-[var(--orange-200)] hover:shadow-sm transition-shadow"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--sh-orange)] to-[var(--sh-orange-dark)] text-white flex items-center justify-center text-xl font-bold flex-shrink-0 shadow-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-base text-[var(--sh-black)] leading-7 tracking-wide">{pillar}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Inspiring Message with Quote Icon */}
            <div className="p-6 rounded-xl bg-gradient-to-r from-[var(--blue-100)] to-[var(--blue-100)]/50 border border-[var(--blue-200)] relative">
              <div className="absolute top-4 left-5 opacity-20">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="#2a6ee8">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                </svg>
              </div>
              <p className="text-base text-[var(--blue-600)] italic pl-10 leading-7 tracking-wide">
                {roleContent.inspiringMessage}
              </p>
            </div>
          </div>

          {/* Timeline Section with Visual Path */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              {/* Calendar Journey Icon */}
              <div className="w-12 h-12 rounded-xl bg-[var(--blue-100)] flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke="#2a6ee8" strokeWidth="2"/>
                  <path d="M3 10H21" stroke="#2a6ee8" strokeWidth="2"/>
                  <path d="M8 2V6" stroke="#2a6ee8" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M16 2V6" stroke="#2a6ee8" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="8" cy="15" r="1.5" fill="#2a6ee8"/>
                  <circle cx="12" cy="15" r="1.5" fill="#2a6ee8"/>
                  <circle cx="16" cy="15" r="1.5" fill="#2a6ee8"/>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--sh-black)]">Your {totalDays}-Day Journey</h3>
                <p className="text-sm text-[var(--neutral-400)]">A clear path from foundation to specialization</p>
              </div>
            </div>

            {/* Visual Timeline */}
            <div className="relative">
              {/* Connection Line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-400 via-[var(--sh-orange)] to-[var(--sh-blue)]" />

              {/* Foundation Phase */}
              <div className="relative pl-16 pb-6">
                <div className={`absolute left-3 top-2 w-7 h-7 rounded-full flex items-center justify-center shadow-md ${
                  foundationStatus === 'completed' ? 'bg-green-500' :
                  foundationStatus === 'in_progress' ? 'bg-[var(--sh-orange)] animate-pulse' :
                  'bg-gray-300'
                }`}>
                  {foundationStatus === 'completed' ? (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : foundationStatus === 'in_progress' ? (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  ) : (
                    <span className="text-white text-xs font-bold">1</span>
                  )}
                </div>
                <div className={`p-5 rounded-xl ${
                  foundationStatus === 'completed' ? 'bg-green-50 border border-green-200' :
                  foundationStatus === 'in_progress' ? 'bg-[var(--orange-100)] border border-[var(--orange-200)]' :
                  'bg-gray-50 border border-gray-200'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      foundationStatus === 'completed' ? 'text-green-700 bg-green-200' :
                      foundationStatus === 'in_progress' ? 'text-[var(--sh-orange)] bg-[var(--orange-200)]' :
                      'text-gray-600 bg-gray-200'
                    }`}>
                      {foundationStatus === 'completed' ? 'COMPLETED' :
                       foundationStatus === 'in_progress' ? 'IN PROGRESS' : 'UP NEXT'}
                    </span>
                    <h4 className="font-semibold text-[var(--sh-black)]">Foundation (Day 1-2)</h4>
                  </div>
                  <p className="text-sm text-[var(--neutral-400)] mb-4">Generic Training - Building your StoreHub knowledge base</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {roleContent.foundationItems.map((item, index) => (
                      <div key={index} className={`flex items-center gap-2 p-2 bg-white rounded-lg ${
                        foundationStatus === 'completed' ? 'border border-green-100' :
                        foundationStatus === 'in_progress' ? 'border border-[var(--orange-200)]' :
                        'border border-gray-100'
                      }`}>
                        <svg className={`w-4 h-4 flex-shrink-0 ${
                          foundationStatus === 'completed' ? 'text-green-500' :
                          foundationStatus === 'in_progress' ? 'text-[var(--sh-orange)]' :
                          'text-gray-400'
                        }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          {foundationStatus === 'completed' ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          )}
                        </svg>
                        <span className={`text-xs ${
                          foundationStatus === 'completed' ? 'text-green-700' :
                          foundationStatus === 'in_progress' ? 'text-[var(--orange-700)]' :
                          'text-gray-600'
                        }`}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Specialization Phase */}
              <div className="relative pl-16">
                <div className={`absolute left-3 top-2 w-7 h-7 rounded-full flex items-center justify-center shadow-md ${
                  specializationStatus === 'completed' ? 'bg-green-500' :
                  specializationStatus === 'in_progress' ? 'bg-[var(--sh-blue)] animate-pulse' :
                  'bg-gray-300'
                }`}>
                  {specializationStatus === 'completed' ? (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : specializationStatus === 'in_progress' ? (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  ) : (
                    <span className="text-white text-xs font-bold">2</span>
                  )}
                </div>
                <div className={`p-5 rounded-xl ${
                  specializationStatus === 'completed' ? 'bg-green-50 border border-green-200' :
                  specializationStatus === 'in_progress' ? 'bg-[var(--blue-100)] border border-[var(--blue-200)]' :
                  'bg-gray-50 border border-gray-200'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      specializationStatus === 'completed' ? 'text-green-700 bg-green-200' :
                      specializationStatus === 'in_progress' ? 'text-[var(--blue-600)] bg-[var(--blue-200)]' :
                      'text-gray-600 bg-gray-200'
                    }`}>
                      {specializationStatus === 'completed' ? 'COMPLETED' :
                       specializationStatus === 'in_progress' ? 'IN PROGRESS' : 'COMING UP'}
                    </span>
                    <h4 className="font-semibold text-[var(--sh-black)]">Specialization (Day 3-{totalDays})</h4>
                  </div>
                  <p className="text-sm text-[var(--neutral-400)] mb-4">Role-Specific Training - Mastering your {roleCode} skills</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {roleContent.specializationItems.map((item, index) => (
                      <div key={index} className={`flex items-center gap-2 p-2 bg-white rounded-lg ${
                        specializationStatus === 'completed' ? 'border border-green-100' :
                        specializationStatus === 'in_progress' ? 'border border-[var(--blue-200)]' :
                        'border border-gray-100'
                      }`}>
                        <svg className={`w-4 h-4 flex-shrink-0 ${
                          specializationStatus === 'completed' ? 'text-green-500' :
                          specializationStatus === 'in_progress' ? 'text-[var(--sh-blue)]' :
                          'text-gray-400'
                        }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          {specializationStatus === 'completed' ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          )}
                        </svg>
                        <span className={`text-xs ${
                          specializationStatus === 'completed' ? 'text-green-700' :
                          specializationStatus === 'in_progress' ? 'text-[var(--blue-600)]' :
                          'text-gray-600'
                        }`}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Note */}
            {roleContent.note && (
              <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-amber-800 mb-1">Good to know</p>
                  <p className="text-sm text-amber-700">{roleContent.note}</p>
                </div>
              </div>
            )}
          </div>

          {/* Self-Paced Learning Section with Illustration */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              {/* Learning Icon */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--orange-100)] to-[var(--blue-100)] flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 14L21 9L12 4L3 9L12 14Z" stroke="#ff9419" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 9V15" stroke="#ff9419" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M6 11.5V17C6 17 9 20 12 20C15 20 18 17 18 17V11.5" stroke="#ff9419" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--sh-black)]">Self-Paced Learning</h3>
                <p className="text-sm text-[var(--neutral-400)]">You're in control of your learning journey</p>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-gradient-to-br from-[var(--blue-100)]/50 via-white to-[var(--orange-100)]/50 border border-[var(--neutral-200)]">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Percentage Circle */}
                <div className="flex-shrink-0 relative">
                  <svg width="120" height="120" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="8"/>
                    <circle cx="60" cy="60" r="54" fill="none" stroke="url(#gradient)" strokeWidth="8" strokeLinecap="round" strokeDasharray="339.29" strokeDashoffset="67.86" transform="rotate(-90 60 60)"/>
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ff630f"/>
                        <stop offset="100%" stopColor="#ff9419"/>
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-[var(--sh-orange)]">80%</span>
                    <span className="text-xs text-[var(--neutral-400)]">Self-Study</span>
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <h4 className="font-semibold text-[var(--sh-black)] text-lg mb-2">Learn at Your Own Pace</h4>
                  <p className="text-sm text-[var(--neutral-400)] mb-4 leading-relaxed">
                    This training is designed for self-directed learning. Around <strong className="text-[var(--sh-orange)]">80% of your training is self-study</strong> —
                    watching videos, reading materials, and hands-on practice. The remaining 20% includes live sessions with your coach
                    and assessments.
                  </p>

                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-green-200 text-sm">
                      <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-green-700">Your own speed</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-green-200 text-sm">
                      <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-green-700">Unlimited replays</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-green-200 text-sm">
                      <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-green-700">Coach support</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* View My Schedule Button */}
            {onViewSchedule && (
              <button
                onClick={onViewSchedule}
                className="w-full py-4 px-6 bg-gradient-to-r from-[var(--sh-orange)] to-[var(--sh-orange-dark)] hover:from-[var(--sh-orange-dark)] hover:to-[var(--sh-orange)] text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                View My Schedule
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            )}
          </div>

          {/* Collapse Button */}
          <button
            onClick={() => setIsExpanded(false)}
            className="w-full py-2 text-sm text-[var(--neutral-300)] hover:text-[var(--sh-orange)] transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            Collapse overview
          </button>
        </div>
      )}
    </div>
  )
}

// Role-specific content
function getRoleContent(roleCode: string) {
  const content: Record<string, {
    welcomeMessage: string
    missionIntro: string
    pillars: string[]
    inspiringMessage: string
    foundationItems: string[]
    specializationItems: string[]
    note?: string
  }> = {
    OC: {
      welcomeMessage: "Congratulations on completing your foundational training! You're now entering the role-specific phase where you'll master the operational and technical skills that make a world-class Onboarding Coordinator.",
      missionIntro: "As an Onboarding Coordinator, your role is built on 5 core pillars:",
      pillars: [
        "BackOffice & Beep Store Setup: Configure the BackOffice and set up the Beep store, including uploading pictures and writing store descriptions",
        "Manage Beep Collateral Requests: Handle requests from both merchants and internal teams efficiently",
        "Collateral Fulfillment: Ensure all collateral requests are fulfilled within the 3-day SLA",
        "Coordinate Collateral Delivery: Align with third-party vendors to arrange timely delivery",
        "Manage GHL Setups in the Backoffice: Handle GHL configurations and integrations within the BackOffice system",
      ],
      inspiringMessage: "You're the operational backbone of merchant onboarding—ensuring every merchant has a beautifully configured store and all the materials they need to launch successfully. You're not just setting up accounts—you're enabling merchant success through flawless execution and on-time delivery.",
      foundationItems: [
        "All-in-One StoreHub Product Knowledge",
        "System Navigation & Merchant Profile Basics",
        "Hardware Demo & Foundational Quiz (50% of final score!)",
      ],
      specializationItems: [
        "BackOffice Deep Dive & Configuration",
        "Beep Store Setup & Optimization",
        "Collateral Management & Fulfillment",
        "Menu Setup Task (Final Evaluation)",
      ],
      note: "OC training is streamlined—no mock test required! Your final evaluation is the Menu Setup task, which demonstrates real-world capability.",
    },
    // Add other roles as needed
    CSM: {
      welcomeMessage: "Welcome to your Customer Success Manager training! You're about to learn how to be the champion of merchant success at StoreHub.",
      missionIntro: "As a Customer Success Manager, your role is built on these core pillars:",
      pillars: [
        "Merchant Relationship Management: Build and maintain strong relationships with assigned merchants",
        "Proactive Support: Identify and resolve issues before they become problems",
        "Product Adoption: Drive feature adoption and usage among merchants",
        "Growth Consultation: Help merchants grow their business using StoreHub tools",
      ],
      inspiringMessage: "You're the bridge between StoreHub and our merchants—ensuring they get maximum value from our platform and achieve their business goals.",
      foundationItems: [
        "All-in-One StoreHub Product Knowledge",
        "System Navigation & Merchant Profile Basics",
        "Hardware Demo & Foundational Quiz",
      ],
      specializationItems: [
        "Merchant Success Playbook",
        "Advanced Product Features",
        "Reporting & Analytics Deep Dive",
        "Role Play Assessments",
      ],
    },
  }

  return content[roleCode] || content.OC // Default to OC if role not found
}
