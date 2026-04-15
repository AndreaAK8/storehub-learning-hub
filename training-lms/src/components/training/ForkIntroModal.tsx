'use client'

import { useState } from 'react'

interface ChecklistItem {
  text: string
  required: boolean
}

interface WhatToExpectItem {
  day: number
  label: string
  summary: string
}

interface ForkIntroData {
  title: string
  overview: string
  what_to_expect: WhatToExpectItem[]
  checklist: ChecklistItem[]
}

interface ForkIntroModalProps {
  data: ForkIntroData
  onComplete: () => void
}

export function ForkIntroModal({ data, onComplete }: ForkIntroModalProps) {
  const [checked, setChecked] = useState<Record<number, boolean>>({})
  const [page, setPage] = useState<'overview' | 'checklist'>('overview')

  const requiredItems = data.checklist.filter(i => i.required)
  const allRequiredChecked = requiredItems.every((item, idx) =>
    data.checklist.findIndex(i => i === item) !== -1 &&
    checked[data.checklist.indexOf(item)]
  )

  const toggleCheck = (idx: number) => {
    setChecked(prev => ({ ...prev, [idx]: !prev[idx] }))
  }

  const dayColors: Record<number, { card: string; badge: string }> = {
    3: { card: 'bg-amber-50 border-amber-200 text-amber-900', badge: 'bg-amber-200 text-amber-800' },
    4: { card: 'bg-orange-50 border-orange-200 text-orange-900', badge: 'bg-orange-200 text-orange-800' },
    5: { card: 'bg-orange-100 border-orange-300 text-orange-900', badge: 'bg-orange-300 text-orange-900' },
    6: { card: 'bg-red-50 border-red-200 text-red-900', badge: 'bg-red-200 text-red-800' },
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="bg-gradient-to-br from-[var(--sh-orange)] to-orange-600 p-6 text-white">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🚀</span>
            <span className="text-sm font-medium opacity-80 uppercase tracking-wide">Role-Specific Phase</span>
          </div>
          <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-barlow), system-ui, sans-serif' }}>
            {data.title}
          </h2>
        </div>

        {/* Tab nav */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setPage('overview')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              page === 'overview'
                ? 'text-[var(--sh-orange)] border-b-2 border-[var(--sh-orange)]'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setPage('checklist')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              page === 'checklist'
                ? 'text-[var(--sh-orange)] border-b-2 border-[var(--sh-orange)]'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Pre-Start Checklist
            {requiredItems.length > 0 && (
              <span className="ml-2 bg-red-100 text-red-600 text-xs px-1.5 py-0.5 rounded-full">
                {requiredItems.length} required
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {page === 'overview' ? (
            <div className="space-y-6">
              {/* Overview text */}
              <div>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line text-sm">
                  {data.overview}
                </p>
              </div>

              {/* Pyramid diagram */}
              <div>
                <h3 className="font-semibold text-slate-800 mb-4 text-sm uppercase tracking-wide">
                  Your Learning Path
                </h3>
                <div className="flex flex-col items-center gap-0 select-none">
                  {/* Peak — Mock Test */}
                  <div className="flex flex-col items-center w-full">
                    <div className="w-36 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl py-3 px-4 text-center shadow-md">
                      <div className="text-xs font-semibold opacity-80 mb-0.5">Day 6</div>
                      <div className="text-sm font-bold">🏆 Mock Test</div>
                    </div>
                    {/* Arrow up */}
                    <div className="flex flex-col items-center my-1">
                      <div className="w-0.5 h-4 bg-slate-300" />
                      <div className="w-0 h-0" style={{ borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: '8px solid #cbd5e1', transform: 'rotate(180deg)' }} />
                    </div>
                  </div>

                  {/* Middle — Full Pitching */}
                  <div className="flex flex-col items-center w-full">
                    <div className="w-56 bg-gradient-to-br from-orange-400 to-orange-500 text-white rounded-xl py-3 px-4 text-center shadow-md">
                      <div className="text-xs font-semibold opacity-80 mb-0.5">Day 5</div>
                      <div className="text-sm font-bold">🎤 Full Pitching</div>
                    </div>
                    {/* Arrow up */}
                    <div className="flex flex-col items-center my-1">
                      <div className="w-0.5 h-4 bg-slate-300" />
                      <div className="w-0 h-0" style={{ borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: '8px solid #cbd5e1', transform: 'rotate(180deg)' }} />
                    </div>
                  </div>

                  {/* Base — Pitching + SPIN + Closing */}
                  <div className="w-full">
                    <div className="w-full bg-gradient-to-br from-amber-400 to-amber-500 text-white rounded-xl py-3 px-4 shadow-md">
                      <div className="text-xs font-semibold opacity-80 mb-1 text-center">Days 3–4 · Foundation</div>
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        <span className="bg-white/25 rounded-lg px-3 py-1 text-sm font-bold">Pitching</span>
                        <span className="opacity-60 text-lg">+</span>
                        <span className="bg-white/25 rounded-lg px-3 py-1 text-sm font-bold">SPIN</span>
                        <span className="opacity-60 text-lg">+</span>
                        <span className="bg-white/25 rounded-lg px-3 py-1 text-sm font-bold">Closing</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* What to expect */}
              <div>
                <h3 className="font-semibold text-slate-800 mb-3 text-sm uppercase tracking-wide">
                  What's coming up
                </h3>
                <div className="space-y-2">
                  {data.what_to_expect.map((item) => {
                    const colors = dayColors[item.day] || { card: 'bg-slate-50 border-slate-200 text-slate-800', badge: 'bg-slate-200 text-slate-700' }
                    return (
                      <div
                        key={item.day}
                        className={`flex items-start gap-3 p-3 rounded-lg border ${colors.card}`}
                      >
                        <span className={`font-bold text-xs px-2 py-1 rounded-full whitespace-nowrap ${colors.badge}`}>Day {item.day}</span>
                        <div>
                          <span className="font-semibold text-sm">{item.label}</span>
                          <p className="text-xs mt-0.5 opacity-70">{item.summary}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-500">
                Complete these before starting Day 3. Required items must be checked to proceed.
              </p>
              <div className="space-y-3">
                {data.checklist.map((item, idx) => (
                  <label
                    key={idx}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      checked[idx]
                        ? 'bg-green-50 border-green-200'
                        : item.required
                        ? 'bg-red-50 border-red-100 hover:bg-red-100'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!!checked[idx]}
                      onChange={() => toggleCheck(idx)}
                      className="mt-0.5 w-4 h-4 accent-[var(--sh-orange)]"
                    />
                    <div className="flex-1">
                      <span className={`text-sm ${checked[idx] ? 'text-green-800 line-through' : 'text-slate-700'}`}>
                        {item.text}
                      </span>
                      {item.required && !checked[idx] && (
                        <span className="ml-2 text-xs text-red-500 font-medium">Required</span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          {page === 'overview' ? (
            <>
              <span className="text-xs text-slate-400">This will not show again</span>
              <button
                onClick={() => setPage('checklist')}
                className="bg-[var(--sh-orange)] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
              >
                Next: Checklist →
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setPage('overview')}
                className="text-slate-500 text-sm hover:text-slate-700"
              >
                ← Back
              </button>
              <button
                onClick={onComplete}
                disabled={!allRequiredChecked}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                  allRequiredChecked
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {allRequiredChecked ? "I'm ready — Let's go! 🎯" : `Check ${requiredItems.filter((_, i) => !checked[data.checklist.indexOf(requiredItems[i])]).length} required items`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
