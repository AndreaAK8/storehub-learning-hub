'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface OnboardingChecklistProps {
  roleName: string
  roleCode: string
  totalDays: number
  traineeName?: string
}

type Step = {
  id: string
  title: string
  description: string
  icon: string
  completed: boolean
}

export default function OnboardingChecklist({
  roleName,
  roleCode,
  totalDays,
  traineeName = 'there'
}: OnboardingChecklistProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [steps, setSteps] = useState<Step[]>([
    { id: 'welcome', title: 'Welcome', description: 'Get started with your training journey', icon: '👋', completed: false },
    { id: 'how-it-works', title: 'How This Training Works', description: 'Understand the self-study philosophy', icon: '📚', completed: false },
    { id: 'scoring', title: 'Performance Scoring', description: 'Learn how you\'ll be evaluated', icon: '📊', completed: false },
    { id: 'role-mission', title: 'Your Role & Mission', description: `What it means to be an ${roleCode}`, icon: '🎯', completed: false },
    { id: 'journey', title: 'Your Training Journey', description: `Your ${totalDays}-day roadmap`, icon: '🗺️', completed: false },
  ])

  // Load progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('onboarding-progress')
    if (saved) {
      const progress = JSON.parse(saved)
      setSteps(prev => prev.map(step => ({
        ...step,
        completed: progress[step.id] || false
      })))
      // Find first incomplete step
      const firstIncomplete = steps.findIndex(s => !progress[s.id])
      if (firstIncomplete !== -1) {
        setCurrentStep(firstIncomplete)
      }
    }
  }, [])

  const markComplete = (stepId: string) => {
    setSteps(prev => {
      const updated = prev.map(step =>
        step.id === stepId ? { ...step, completed: true } : step
      )
      // Save to localStorage
      const progress: Record<string, boolean> = {}
      updated.forEach(s => progress[s.id] = s.completed)
      localStorage.setItem('onboarding-progress', JSON.stringify(progress))
      return updated
    })
  }

  const goToNext = () => {
    markComplete(steps[currentStep].id)
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const goToSchedule = () => {
    markComplete(steps[currentStep].id)
    router.push('/dashboard/my-training')
  }

  const completedCount = steps.filter(s => s.completed).length
  const isLastStep = currentStep === steps.length - 1

  // Get role-specific content
  const roleContent = getRoleContent(roleCode)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--sh-orange)] to-[var(--sh-orange-dark)] flex items-center justify-center">
                <span className="text-white text-lg">📖</span>
              </div>
              <div>
                <h1 className="font-semibold text-[var(--sh-black)]">Training Overview</h1>
                <p className="text-sm text-slate-500">{completedCount} of {steps.length} completed</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="flex items-center gap-4">
              <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[var(--sh-orange)] to-[var(--sh-orange-dark)] transition-all duration-500"
                  style={{ width: `${(completedCount / steps.length) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium text-slate-600">{Math.round((completedCount / steps.length) * 100)}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar Checklist */}
          <div className="w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-2">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(index)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                    currentStep === index
                      ? 'bg-[var(--orange-100)] border-2 border-[var(--sh-orange)]'
                      : step.completed
                        ? 'bg-green-50 border border-green-200 hover:bg-green-100'
                        : 'bg-white border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    step.completed
                      ? 'bg-green-500 text-white'
                      : currentStep === index
                        ? 'bg-[var(--sh-orange)] text-white'
                        : 'bg-slate-100 text-slate-400'
                  }`}>
                    {step.completed ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-sm font-semibold">{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${
                      currentStep === index ? 'text-[var(--sh-orange)]' : step.completed ? 'text-green-700' : 'text-slate-700'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                </button>
              ))}

              {/* Skip to Schedule */}
              {completedCount >= 3 && (
                <button
                  onClick={() => router.push('/dashboard/my-training')}
                  className="w-full mt-4 p-3 text-sm text-slate-500 hover:text-[var(--sh-orange)] transition-colors flex items-center justify-center gap-2"
                >
                  Skip to My Schedule
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Step Content */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {currentStep === 0 && (
                <WelcomeStep traineeName={traineeName} roleCode={roleCode} roleName={roleName} />
              )}
              {currentStep === 1 && (
                <HowItWorksStep />
              )}
              {currentStep === 2 && (
                <ScoringStep />
              )}
              {currentStep === 3 && (
                <RoleMissionStep roleCode={roleCode} roleName={roleName} content={roleContent} />
              )}
              {currentStep === 4 && (
                <JourneyStep roleCode={roleCode} totalDays={totalDays} content={roleContent} />
              )}

              {/* Navigation Footer */}
              <div className="px-8 py-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <button
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  className={`flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors ${
                    currentStep === 0 ? 'invisible' : ''
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>

                {isLastStep ? (
                  <button
                    onClick={goToSchedule}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[var(--sh-orange)] to-[var(--sh-orange-dark)] text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                  >
                    Start My Training
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                ) : (
                  <button
                    onClick={goToNext}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[var(--sh-orange)] to-[var(--sh-orange-dark)] text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                  >
                    Continue
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Step 1: Welcome
function WelcomeStep({ traineeName, roleCode, roleName }: { traineeName: string, roleCode: string, roleName: string }) {
  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
          <span className="text-4xl">👋</span>
        </div>
        <h2 className="text-3xl font-bold text-[var(--sh-black)] mb-4">
          Welcome to StoreHub Training, {traineeName}!
        </h2>
        <p className="text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
          You're about to embark on an exciting learning journey that will equip you with everything you need to succeed as an <strong className="text-[var(--sh-orange)]">{roleName}</strong>.
        </p>
      </div>

      <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-xl p-6 border border-amber-100">
        <h3 className="font-semibold text-[var(--sh-black)] mb-4 flex items-center gap-2">
          <span>🎯</span> What to expect in this overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            'How the self-study training works',
            'How your performance is scored',
            'Your role and mission as an ' + roleCode,
            'Your day-by-day training journey'
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 bg-white/70 rounded-lg p-3">
              <div className="w-6 h-6 rounded-full bg-[var(--sh-orange)] text-white flex items-center justify-center text-sm font-semibold">
                {i + 1}
              </div>
              <span className="text-sm text-slate-700">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-3">
        <span className="text-xl">💡</span>
        <p className="text-sm text-blue-700">
          <strong>Pro tip:</strong> Take your time going through each section. This overview sets the foundation for your entire training experience!
        </p>
      </div>
    </div>
  )
}

// Step 2: How It Works
function HowItWorksStep() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--sh-orange)] to-[var(--sh-orange-dark)] flex items-center justify-center">
            <span className="text-2xl">📚</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--sh-black)]">How This Training Works</h2>
            <p className="text-slate-500">The Self-Study Philosophy</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
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

        {/* Click Everything */}
        <div className="p-5 rounded-xl bg-gradient-to-r from-[var(--orange-100)] to-[var(--blue-100)] border border-[var(--orange-200)]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-2xl">🔗</span>
            </div>
            <div>
              <h4 className="font-semibold text-[var(--sh-black)] mb-2">Click Everything!</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Throughout your training materials, there are hyperlinks hidden like Easter eggs. Instead of chocolate, they're packed with valuable insights. Don't miss out!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Step 3: Scoring
function ScoringStep() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--sh-blue)] to-blue-600 flex items-center justify-center">
            <span className="text-2xl">📊</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--sh-black)]">Understanding Your Performance Score</h2>
            <p className="text-slate-500">How you'll be evaluated</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
              <p className="text-sm text-slate-600 mb-3">Your formal assessments:</p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-[var(--sh-orange)] mt-0.5">•</span>
                  <span><strong>All-in-One Quiz</strong> (Day 2)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--sh-orange)] mt-0.5">•</span>
                  <span><strong>Role-Specific Assessments</strong> (Day 3+)</span>
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
              <p className="text-sm text-slate-600 mb-3">Evaluated daily by trainer:</p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-[var(--sh-blue)] mt-0.5">•</span>
                  <span><strong>Task Completion</strong> (5%)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--sh-blue)] mt-0.5">•</span>
                  <span><strong>Culture Code</strong> (10%)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--sh-blue)] mt-0.5">•</span>
                  <span><strong>Attendance</strong> (5%)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Participation Levels */}
      <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 mb-6">
        <h4 className="font-semibold text-[var(--sh-black)] mb-4">Participation Levels</h4>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-white border border-red-200 text-center">
            <span className="text-2xl">🔴</span>
            <p className="font-semibold text-red-700 mt-1">5%</p>
            <p className="text-xs text-red-600">Passive</p>
          </div>
          <div className="p-3 rounded-lg bg-white border border-yellow-200 text-center">
            <span className="text-2xl">🟡</span>
            <p className="font-semibold text-yellow-700 mt-1">10%</p>
            <p className="text-xs text-yellow-600">Somewhat Active</p>
          </div>
          <div className="p-3 rounded-lg bg-white border border-blue-200 text-center">
            <span className="text-2xl">🔵</span>
            <p className="font-semibold text-blue-700 mt-1">15%</p>
            <p className="text-xs text-blue-600">Engaged</p>
          </div>
          <div className="p-3 rounded-lg bg-white border border-green-200 text-center">
            <span className="text-2xl">🟢</span>
            <p className="font-semibold text-green-700 mt-1">20%</p>
            <p className="text-xs text-green-600">Go-Getter</p>
          </div>
        </div>
      </div>

      {/* Final Score Formula */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-[var(--sh-orange)] to-[var(--sh-orange-dark)] text-white">
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <span className="font-medium">Your Final Score =</span>
          <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">Learning (80%)</span>
          <span>+</span>
          <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">Participation (5-20%)</span>
        </div>
        <p className="text-center text-sm mt-3 text-white/90">
          💡 High participation can boost your score and provide insurance against weaker assessments!
        </p>
      </div>
    </div>
  )
}

// Step 4: Role & Mission
function RoleMissionStep({ roleCode, roleName, content }: { roleCode: string, roleName: string, content: RoleContent }) {
  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
            <span className="text-2xl">🎯</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--sh-black)]">Your Role & Mission</h2>
            <p className="text-slate-500">What it means to be an {roleCode}</p>
          </div>
        </div>
      </div>

      <div className="mb-6 p-5 rounded-xl bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-100">
        <p className="text-slate-700 leading-relaxed">{content.missionIntro}</p>
      </div>

      {/* Core Pillars */}
      <h3 className="font-semibold text-[var(--sh-black)] mb-4">Your 5 Core Pillars</h3>
      <div className="space-y-3 mb-6">
        {content.pillars.map((pillar, index) => (
          <div
            key={index}
            className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-200 hover:border-[var(--sh-orange)] hover:shadow-sm transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--sh-orange)] to-[var(--sh-orange-dark)] text-white flex items-center justify-center text-lg font-bold flex-shrink-0">
              {index + 1}
            </div>
            <p className="text-sm text-slate-700 leading-relaxed pt-2">{pillar}</p>
          </div>
        ))}
      </div>

      {/* Inspiring Message */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-[var(--blue-100)] to-[var(--blue-100)]/50 border border-[var(--blue-200)]">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💫</span>
          <p className="text-sm text-[var(--blue-600)] italic leading-relaxed">
            {content.inspiringMessage}
          </p>
        </div>
      </div>
    </div>
  )
}

// Step 5: Journey
function JourneyStep({ roleCode, totalDays, content }: { roleCode: string, totalDays: number, content: RoleContent }) {
  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <span className="text-2xl">🗺️</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--sh-black)]">Your {totalDays}-Day Journey</h2>
            <p className="text-slate-500">From foundation to specialization</p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative mb-8">
        {/* Connection Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-400 via-[var(--sh-orange)] to-[var(--sh-blue)]" />

        {/* Foundation Phase */}
        <div className="relative pl-16 pb-6">
          <div className="absolute left-3 top-2 w-7 h-7 rounded-full bg-green-500 flex items-center justify-center shadow-md">
            <span className="text-white text-xs font-bold">1</span>
          </div>
          <div className="p-5 rounded-xl bg-green-50 border border-green-200">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold px-3 py-1 rounded-full text-green-700 bg-green-200">
                FOUNDATION
              </span>
              <h4 className="font-semibold text-[var(--sh-black)]">Day 1-2</h4>
            </div>
            <p className="text-sm text-slate-600 mb-4">Generic Training - Building your StoreHub knowledge base</p>
            <div className="grid grid-cols-1 gap-2">
              {content.foundationItems.map((item, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-green-100">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="text-xs text-green-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Specialization Phase */}
        <div className="relative pl-16">
          <div className="absolute left-3 top-2 w-7 h-7 rounded-full bg-[var(--sh-blue)] flex items-center justify-center shadow-md">
            <span className="text-white text-xs font-bold">2</span>
          </div>
          <div className="p-5 rounded-xl bg-[var(--blue-100)] border border-[var(--blue-200)]">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold px-3 py-1 rounded-full text-[var(--blue-600)] bg-[var(--blue-200)]">
                SPECIALIZATION
              </span>
              <h4 className="font-semibold text-[var(--sh-black)]">Day 3-{totalDays}</h4>
            </div>
            <p className="text-sm text-slate-600 mb-4">Role-Specific Training - Mastering your {roleCode} skills</p>
            <div className="grid grid-cols-1 gap-2">
              {content.specializationItems.map((item, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-[var(--blue-200)]">
                  <svg className="w-4 h-4 text-[var(--sh-blue)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="text-xs text-[var(--blue-600)]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Note */}
      {content.note && (
        <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <span className="text-xl">💡</span>
          </div>
          <div>
            <p className="text-sm font-medium text-amber-800 mb-1">Good to know</p>
            <p className="text-sm text-amber-700">{content.note}</p>
          </div>
        </div>
      )}

      {/* Ready Message */}
      <div className="mt-6 p-5 rounded-xl bg-gradient-to-r from-[var(--sh-orange)] to-[var(--sh-orange-dark)] text-white text-center">
        <p className="text-lg font-semibold mb-2">You're all set! 🎉</p>
        <p className="text-sm text-white/90">Click "Start My Training" to view your detailed schedule and begin Day 1.</p>
      </div>
    </div>
  )
}

// Role content types and data
interface RoleContent {
  missionIntro: string
  pillars: string[]
  inspiringMessage: string
  foundationItems: string[]
  specializationItems: string[]
  note?: string
}

function getRoleContent(roleCode: string): RoleContent {
  const content: Record<string, RoleContent> = {
    OC: {
      missionIntro: "As an Onboarding Coordinator, your role is built on 5 core pillars that ensure every merchant has a seamless onboarding experience:",
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
        "Hardware Demo & Foundational Quiz",
      ],
      specializationItems: [
        "BackOffice Deep Dive & Configuration",
        "Beep Store Setup & Optimization",
        "Collateral Management & Fulfillment",
        "Menu Setup Task (Final Evaluation)",
      ],
      note: "OC training is streamlined—no mock test required! Your final evaluation is the Menu Setup task, which demonstrates real-world capability.",
    },
    CSM: {
      missionIntro: "As a Customer Success Manager, your role is built on these core pillars that drive merchant success:",
      pillars: [
        "Merchant Relationship Management: Build and maintain strong relationships with assigned merchants",
        "Proactive Support: Identify and resolve issues before they become problems",
        "Product Adoption: Drive feature adoption and usage among merchants",
        "Growth Consultation: Help merchants grow their business using StoreHub tools",
        "Retention & Expansion: Ensure merchant satisfaction and identify upsell opportunities",
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

  return content[roleCode] || content.OC
}
