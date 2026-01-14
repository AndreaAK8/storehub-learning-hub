import { Trainee, RiskLevel } from '@/types/trainee'

interface RiskBadgeProps {
  trainee: Trainee
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

// Calculate risk level from trainee data
export function calculateRiskLevel(trainee: Trainee): RiskLevel {
  // If we have a direct performance flag from Google Sheets, use it
  if (trainee.performanceFlag) {
    const flag = trainee.performanceFlag.toLowerCase()
    if (flag.includes('critical') || flag.includes('overdue')) return 'critical'
    if (flag.includes('risk') || flag.includes('behind')) return 'at-risk'
    if (flag.includes('track') || flag.includes('good')) return 'on-track'
  }

  // Fallback: Calculate based on progress
  const { daysSinceTrainingStart, totalAssessmentsCompleted, totalAssessmentsRequired } = trainee

  if (totalAssessmentsRequired === 0) return 'unknown'

  // Assume 30-day training program
  const expectedProgress = Math.min(daysSinceTrainingStart / 30, 1)
  const actualProgress = totalAssessmentsCompleted / totalAssessmentsRequired

  // More than 20% behind schedule = Critical
  if (actualProgress < expectedProgress - 0.2) return 'critical'
  // Behind schedule = At Risk
  if (actualProgress < expectedProgress - 0.05) return 'at-risk'
  // On track or ahead
  return 'on-track'
}

export function getRiskLabel(level: RiskLevel): string {
  switch (level) {
    case 'critical': return 'Overdue'
    case 'at-risk': return 'At Risk'
    case 'on-track': return 'On Track'
    default: return 'Unknown'
  }
}

export function getRiskStyles(level: RiskLevel): { bg: string; text: string; ring: string; dot: string } {
  switch (level) {
    case 'critical':
      return {
        bg: 'bg-red-100',
        text: 'text-red-800',
        ring: 'ring-red-600/20',
        dot: 'bg-red-500'
      }
    case 'at-risk':
      return {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        ring: 'ring-yellow-600/20',
        dot: 'bg-yellow-500'
      }
    case 'on-track':
      return {
        bg: 'bg-green-100',
        text: 'text-green-800',
        ring: 'ring-green-600/20',
        dot: 'bg-green-500'
      }
    default:
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        ring: 'ring-gray-600/20',
        dot: 'bg-gray-400'
      }
  }
}

export default function RiskBadge({ trainee, size = 'md', showLabel = true }: RiskBadgeProps) {
  const level = calculateRiskLevel(trainee)
  const styles = getRiskStyles(level)
  const label = getRiskLabel(level)

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5'
  }

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5'
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ring-1 ring-inset ${styles.bg} ${styles.text} ${styles.ring} ${sizeClasses[size]}`}
    >
      <span className={`${dotSizes[size]} rounded-full ${styles.dot}`} />
      {showLabel && label}
    </span>
  )
}

// Simple dot indicator (no label)
export function RiskDot({ trainee, size = 'md' }: { trainee: Trainee; size?: 'sm' | 'md' | 'lg' }) {
  const level = calculateRiskLevel(trainee)
  const styles = getRiskStyles(level)

  const dotSizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  }

  return (
    <span
      className={`inline-block ${dotSizes[size]} rounded-full ${styles.dot}`}
      title={getRiskLabel(level)}
    />
  )
}
