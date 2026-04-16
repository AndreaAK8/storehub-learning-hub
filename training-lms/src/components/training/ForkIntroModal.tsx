'use client'

import { useState } from 'react'

interface ChecklistItem {
  text: string
  required: boolean
  steps?: string[]
  gif?: string
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
  const [expanded, setExpanded] = useState<Record<number, boolean>>({})
  const [page, setPage] = useState<'overview' | 'checklist'>('overview')

  const requiredItems = data.checklist.filter(i => i.required)
  const allRequiredChecked = requiredItems.every((item, idx) =>
    data.checklist.findIndex(i => i === item) !== -1 &&
    checked[data.checklist.indexOf(item)]
  )

  const toggleCheck = (idx: number) => {
    setChecked(prev => ({ ...prev, [idx]: !prev[idx] }))
  }

  const toggleExpand = (idx: number) => {
    setExpanded(prev => ({ ...prev, [idx]: !prev[idx] }))
  }

  // Brand-aligned tints: warm orange for Days 3-5, brand blue for Day 6
  const dayCardTheme: Record<number, { bg: string; border: string; badgeBg: string; text: string; badgeText: string }> = {
    3: { bg: '#FFF4E8', border: '#FFD4A3', badgeBg: '#FFE4BF', text: '#7A3500', badgeText: '#7A3500' },
    4: { bg: '#FFF0DC', border: '#FFBE80', badgeBg: '#FFD9B0', text: '#6B3000', badgeText: '#6B3000' },
    5: { bg: '#FFEBD0', border: '#FFAA66', badgeBg: '#FFCCA0', text: '#5E2800', badgeText: '#5E2800' },
    6: { bg: '#EEF4FF', border: '#B8CFFF', badgeBg: '#D0E2FF', text: '#1A3D8A', badgeText: '#1A3D8A' },
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="px-6 py-5 text-white" style={{ background: '#2f2922' }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold uppercase tracking-widest px-2.5 py-0.5 rounded-full" style={{ background: '#ff9419', color: 'white' }}>
              Role-Specific Phase
            </span>
          </div>
          <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-barlow), system-ui, sans-serif' }}>
            {data.title}
          </h2>
          <h1 className="text-xl mt-2" style={{ color: '#ffffff', fontFamily: 'var(--font-barlow), system-ui, sans-serif' }}>
            <span className="font-bold">Days 3 – 6.</span>
            <span className="font-normal"> Your path to becoming a BC.</span>
          </h1>
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
                  {/* Peak — Mock Test: brand black, authoritative */}
                  <div className="w-44 text-white rounded-2xl py-3 px-4 text-center shadow-lg mx-auto" style={{ background: '#2f2922' }}>
                    <div className="text-xs font-medium mb-0.5" style={{ color: '#8a8480' }}>Day 6</div>
                    <div className="text-sm font-bold">🏆 Mock Test</div>
                  </div>

                  {/* Arrow UP */}
                  <div className="flex flex-col items-center my-1.5">
                    <div className="w-0 h-0" style={{ borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: '8px solid #8a8480' }} />
                    <div className="w-px h-5" style={{ background: '#d4cfc9' }} />
                  </div>

                  {/* Middle — Full Pitching: warm charcoal */}
                  <div className="w-60 text-white rounded-2xl py-3 px-4 text-center shadow-md mx-auto" style={{ background: '#6b6259' }}>
                    <div className="text-xs font-medium mb-0.5" style={{ color: '#c5bfb8' }}>Day 5</div>
                    <div className="text-sm font-bold">🎤 Full Pitching</div>
                  </div>

                  {/* Arrow UP */}
                  <div className="flex flex-col items-center my-1.5">
                    <div className="w-0 h-0" style={{ borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: '8px solid #c5bfb8' }} />
                    <div className="w-px h-5" style={{ background: '#d4cfc9' }} />
                  </div>

                  {/* Base — Foundation: light warm stone */}
                  <div className="w-full rounded-2xl py-4 px-5 shadow-sm" style={{ background: '#f0ede9', border: '1px solid #e0d9d0' }}>
                    <div className="text-xs font-semibold mb-2.5 text-center tracking-wider" style={{ color: '#8a8480' }}>DAYS 3–4 · FOUNDATION</div>
                    <div className="flex items-center justify-center gap-3 flex-wrap">
                      <span className="rounded-xl px-3 py-1.5 text-sm font-bold" style={{ background: '#2f2922', color: 'white' }}>Pitching</span>
                      <span className="text-lg font-light" style={{ color: '#c5bfb8' }}>+</span>
                      <span className="rounded-xl px-3 py-1.5 text-sm font-bold" style={{ background: '#2f2922', color: 'white' }}>SPIN</span>
                      <span className="text-lg font-light" style={{ color: '#c5bfb8' }}>+</span>
                      <span className="rounded-xl px-3 py-1.5 text-sm font-bold" style={{ background: '#2f2922', color: 'white' }}>Closing</span>
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
                    const t = dayCardTheme[item.day] ?? dayCardTheme[3]
                    return (
                      <div
                        key={item.day}
                        className="flex items-start gap-3 p-3 rounded-xl"
                        style={{ background: t.bg, border: `1px solid ${t.border}` }}
                      >
                        <span className="font-bold text-xs px-2.5 py-1 rounded-full whitespace-nowrap" style={{ background: t.badgeBg, color: t.badgeText }}>Day {item.day}</span>
                        <div>
                          <span className="font-semibold text-sm" style={{ color: t.text }}>{item.label}</span>
                          <p className="text-xs mt-0.5" style={{ color: t.text, opacity: 0.7 }}>{item.summary}</p>
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
                  <div
                    key={idx}
                    className={`rounded-lg border transition-colors ${
                      checked[idx]
                        ? 'bg-green-50 border-green-200'
                        : item.required
                        ? 'bg-red-50 border-red-100'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    {/* Main row */}
                    <div className="flex items-start gap-3 p-3">
                      <input
                        type="checkbox"
                        checked={!!checked[idx]}
                        onChange={() => toggleCheck(idx)}
                        className="mt-0.5 w-4 h-4 accent-[var(--sh-orange)] cursor-pointer flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm ${checked[idx] ? 'text-green-800 line-through' : 'text-slate-700'}`}>
                          {item.text}
                        </span>
                        {item.required && !checked[idx] && (
                          <span className="ml-2 text-xs text-red-500 font-medium">Required</span>
                        )}
                      </div>
                      {item.steps && item.steps.length > 0 && (
                        <button
                          onClick={() => toggleExpand(idx)}
                          className="flex-shrink-0 flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full transition-colors"
                          style={{ color: '#ff9419', background: '#fff4e8' }}
                        >
                          How?
                          <svg
                            className={`w-3 h-3 transition-transform ${expanded[idx] ? 'rotate-180' : ''}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* Expandable steps */}
                    {item.steps && expanded[idx] && (
                      <div className="px-4 pb-3 pt-0 border-t" style={{ borderColor: checked[idx] ? '#bbf7d0' : item.required ? '#fecaca' : '#e2e8f0' }}>
                        {item.gif && (
                          <div className="mt-3 mb-2 rounded-lg overflow-hidden border border-slate-200">
                            <img src={item.gif} alt="How-to guide" className="w-full h-auto" />
                          </div>
                        )}
                        <ol className="mt-2 space-y-1.5">
                          {item.steps.map((step, si) => (
                            <li key={si} className="flex items-start gap-2 text-xs text-slate-600">
                              <span className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px] font-bold mt-0.5" style={{ background: '#ff9419' }}>
                                {si + 1}
                              </span>
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
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
