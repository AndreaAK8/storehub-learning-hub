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

// Brand-aligned: warm orange tints for Days 3-5, brand blue for Day 6 graduation
const dayTheme: Record<number, {
  bg: string
  border: string
  labelColor: string
  titleColor: string
  milestoneColor: string
  milestoneTimeBg: string
  badgeBg: string
  badgeText: string
}> = {
  3: {
    bg: 'linear-gradient(135deg, #FFF4E8 0%, #FFF0DF 100%)',
    border: '#FFD4A3',
    labelColor: '#CC6E00',
    titleColor: '#7A3500',
    milestoneColor: '#CC6E00',
    milestoneTimeBg: '#FFF4E8',
    badgeBg: '#FFE4BF',
    badgeText: '#7A3500',
  },
  4: {
    bg: 'linear-gradient(135deg, #FFF1E0 0%, #FFEBD4 100%)',
    border: '#FFBE80',
    labelColor: '#C25A00',
    titleColor: '#6B3000',
    milestoneColor: '#C25A00',
    milestoneTimeBg: '#FFF1E0',
    badgeBg: '#FFD9B0',
    badgeText: '#6B3000',
  },
  5: {
    bg: 'linear-gradient(135deg, #FFF0E0 0%, #FFE8D0 100%)',
    border: '#FFAA66',
    labelColor: '#B54A00',
    titleColor: '#5E2800',
    milestoneColor: '#B54A00',
    milestoneTimeBg: '#FFF0E0',
    badgeBg: '#FFCCA0',
    badgeText: '#5E2800',
  },
  // Day 6: Brand blue — signals this is the final milestone
  6: {
    bg: 'linear-gradient(135deg, #EEF4FF 0%, #E6EFFF 100%)',
    border: '#B8CFFF',
    labelColor: '#2A6EE8',
    titleColor: '#1A3D8A',
    milestoneColor: '#2A6EE8',
    milestoneTimeBg: '#EEF4FF',
    badgeBg: '#D0E2FF',
    badgeText: '#1A3D8A',
  },
}

const fallbackTheme = dayTheme[3]

export function DayIntroCard({ dayNumber, data }: DayIntroCardProps) {
  const [expanded, setExpanded] = useState(true)
  const illustration = dayIllustrations[dayNumber]
  const theme = dayTheme[dayNumber] ?? fallbackTheme

  return (
    <div
      className="mb-4 rounded-2xl overflow-hidden"
      style={{ background: theme.bg, border: `1px solid ${theme.border}` }}
    >
      {/* Card header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 text-left transition-all hover:brightness-95"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">📋</span>
          <div>
            <span className="text-xs font-semibold tracking-wide" style={{ color: theme.labelColor }}>
              Day {dayNumber} Briefing
            </span>
            <h3 className="font-bold text-sm" style={{ color: theme.titleColor }}>{data.title}</h3>
          </div>
        </div>
        <svg
          className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`}
          style={{ color: theme.labelColor }}
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
            <p className="text-sm text-[#55504a] leading-relaxed">{data.summary}</p>
          </div>

          {/* Milestones */}
          {data.milestones.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold tracking-wide mb-2" style={{ color: theme.milestoneColor }}>
                🎯 Milestones today
              </h4>
              <div className="space-y-1.5">
                {data.milestones.map((m, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 shadow-sm"
                    style={{ background: 'rgba(255,255,255,0.75)', border: `1px solid ${theme.border}` }}
                  >
                    <span className="text-xs font-semibold whitespace-nowrap" style={{ color: theme.milestoneColor }}>{m.time}</span>
                    <div className="w-px h-4" style={{ background: theme.border }} />
                    <span className="text-sm text-[#55504a]">{m.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {data.notes && (
            <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.6)', border: `1px solid ${theme.border}` }}>
              <h4 className="text-xs font-semibold tracking-wide mb-1.5" style={{ color: theme.labelColor }}>
                💡 Good to know
              </h4>
              <p className="text-xs text-[#55504a] leading-relaxed whitespace-pre-line">{data.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
