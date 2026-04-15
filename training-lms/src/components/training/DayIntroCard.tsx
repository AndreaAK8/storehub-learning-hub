'use client'

import { useState } from 'react'

interface Milestone {
  label: string
  time: string
}

interface DayIntroData {
  title: string
  summary: string
  milestones: Milestone[]
  notes?: string
}

interface DayIntroCardProps {
  dayNumber: number
  data: DayIntroData
}

export function DayIntroCard({ dayNumber, data }: DayIntroCardProps) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="mb-4 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden">
      {/* Card header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-blue-100/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">📋</span>
          <div>
            <span className="text-xs font-medium text-blue-500 uppercase tracking-wide">
              Day {dayNumber} Briefing
            </span>
            <h3 className="font-bold text-blue-900 text-sm">{data.title}</h3>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-blue-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-4">
          {/* Summary */}
          <p className="text-sm text-slate-600 leading-relaxed">{data.summary}</p>

          {/* Milestones */}
          {data.milestones.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">
                🎯 Milestones today
              </h4>
              <div className="space-y-1.5">
                {data.milestones.map((m, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 border border-blue-100">
                    <span className="text-xs font-mono text-blue-500 font-medium whitespace-nowrap">{m.time}</span>
                    <div className="w-px h-4 bg-blue-200" />
                    <span className="text-sm text-slate-700">{m.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {data.notes && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
              <h4 className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1.5">
                💡 Good to know
              </h4>
              <p className="text-xs text-amber-800 leading-relaxed whitespace-pre-line">{data.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
