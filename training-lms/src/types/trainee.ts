export interface Trainee {
  email: string
  fullName: string
  department: string
  country: string
  trainingStartDate: string
  status: string
  coachName: string
  coachEmail: string
  daysSinceTrainingStart: number
  totalAssessmentsRequired: number
  totalAssessmentsCompleted: number
  totalAssessmentsIncomplete: number
  // New fields from Google Sheets
  performanceFlag?: 'On Track' | 'At Risk' | 'Critical' | string
  delayReason?: string
  daysExtended?: number
  adjustedEndDate?: string
  originalEndDate?: string
  role?: string  // Job role (Sales, Support, etc.)
  notes?: string
  currentTrainingDay?: number
}

export type RiskLevel = 'critical' | 'at-risk' | 'on-track' | 'unknown'

export interface TraineeScore {
  assessmentName: string
  score: number
  attemptNumber: number
  dateTaken: string
  coachEmail: string
}

export interface TraineeDetail extends Trainee {
  scores: TraineeScore[]
  finalScore?: number
  participationScore?: number
  overallStatus?: 'PASS' | 'FAIL' | 'IN_PROGRESS'
}
