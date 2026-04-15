'use client'

import { useState } from 'react'
import Image from 'next/image'

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

const dayIllustrations: Record<number, string> = {
  3: '/illustrations/presentation.svg',
  4: '/illustrations/agreement.svg',
  5: '/illustrations/conference-speaker.svg',
  6: '/illustrations/interview.svg',
}

const dayTheme: Record<number, { bg: string; border: string; label: string; title: string; milestone: string; badge: string }> = {
  3: { bg: 'from-sky-50 to-indigo-50',   border: 'border-sky-200',   label: 'text-sky-500',    title: 'text-sky-900',   milestone: 'text-sky-500',   badge: 'bg-sky-100 text-sky-700' },
  4: { bg: 'from-indigo-50 to-violet-50', border: 'border-indigo-200', label: 'text-indigo-500', title: 'text-indigo-900', milestone: 'text-indigo-500', badge: 'bg-indigo-100 text-indigo-700' },
  5: { bg: 'from-violet-50 to-purple-50', border: 'border-violet-200', label: 'text-violet-500', title: 'text-violet-900', milestone: 'text-violet-500', badge: 'bg-violet-100 text-violet-700' },
  6: { bg: 'from-emerald-50 to-teal-50',  border: 'border-emerald-200', label: 'text-emerald-600', title: 'text-emerald-900', milestone: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
}

const fallbackTheme = { bg: 'from-slate-50 to-slate-100', border: 'border-slate-200', label: 'text-slate-500', title: 'text-slate-900', milestone: 'text-slate-500', badge: 'bg-slate-100 text-slate-700' }

export function DayIntroCard({ dayNumber, data }: DayIntroCardProps) {
  const [expanded, setExpanded] = useState(true)
  const illustration = dayIllustrations[dayNumber]
  const theme = dayTheme[dayNumber] ?? fallbackTheme

  return (
    <div className={`mb-4 rounded-2xl border ${theme.border} bg-gradient-to-br ${theme.bg} overflow-hidden`}>
      {/* Card header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:brightness-95 transition-all"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">📋</span>
          <div>
            <span className={`text-xs font-medium ${theme.label} uppercase tracking-wide`}>
              Day {dayNumber} Briefing
            </span>
            <h3 className={`font-bold ${theme.title} text-sm`}>{data.title}</h3>
          </div>
        </div>
        <svg
          className={`w-5 h-5 ${theme.label} transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-4">
          {/* Illustration + Summary side by side */}
          <div className="flex items-center gap-4">
            {illustration && (
              <div className="flex-shrink-0">
                <Image
                  src={illustration}
                  alt={`Day ${dayNumber} illustration`}
                  width={110}
                  height={90}
                  className="object-contain drop-shadow-sm"
                />
              </div>
            )}
            <p className="text-sm text-slate-600 leading-relaxed">{data.summary}</p>
          </div>

          {/* Milestones */}
          {data.milestones.length > 0 && (
            <div>
              <h4 className={`text-xs font-semibold ${theme.milestone} uppercase tracking-wide mb-2`}>
                🎯 Milestones today
              </h4>
              <div className="space-y-1.5">
                {data.milestones.map((m, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 border border-white/80 shadow-sm">
                    <span className={`text-xs font-mono ${theme.milestone} font-medium whitespace-nowrap`}>{m.time}</span>
                    <div className="w-px h-4 bg-slate-200" />
                    <span className="text-sm text-slate-700">{m.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {data.notes && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
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
