import { NextRequest, NextResponse } from 'next/server'
import {
  getTrainees,
  getAssessmentConfig,
  getScores,
  calculateTrainingDay,
  formatDate,
  isBusinessDay,
  type TraineeRow,
  type AssessmentConfigRow,
  type ScoreRow,
} from '@/lib/google/sheets'
import { sendMessage, LARK_CHAT_ANDREA, LARK_CHAT_GROUP } from '@/lib/lark/client'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// ─── Types ───────────────────────────────────────────────────────────────────

interface TraineeAssessment {
  trainee: TraineeRow
  trainingDay: number
  assessmentsDue: Array<{
    config: AssessmentConfigRow
    submitted: boolean
    score?: number
    passFail?: string
  }>
}

interface RecentScore {
  traineeName: string
  assessmentName: string
  score: number
  passFail: string
}

// ─── Route Handler ───────────────────────────────────────────────────────────

/**
 * POST /api/cron/assessment-digest
 *
 * Vercel Cron: daily at 9:30 AM MYT (1:30 AM UTC), Mon-Fri only
 *
 * 1. Gets active trainees (Status = "Email Sent" or "In Progress")
 * 2. Calculates each trainee's training day (business days from start)
 * 3. Matches against Assessment Schedule Configuration for today's assessments
 * 4. Checks Individual Progress for already-submitted scores
 * 5. Gets scores submitted in the last 24 hours
 * 6. Sends formatted digest to Lark group chat + Andrea's bot chat
 *
 * Idempotent: read-only from sheets, only sends notifications.
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Skip weekends
    if (!isBusinessDay()) {
      return NextResponse.json({
        success: true,
        message: 'Skipped — weekend',
        processed: 0,
      })
    }

    // 1. Fetch all data in parallel
    const [allTrainees, assessmentConfig, allScores] = await Promise.all([
      getTrainees(),
      getAssessmentConfig(),
      getScores(),
    ])

    // 2. Filter active trainees
    const activeTrainees = allTrainees.filter((t) => {
      const status = t.status.toLowerCase()
      return (
        (status === 'email sent' || status === 'in progress') &&
        t.email &&
        t.trainingStartDate
      )
    })

    if (activeTrainees.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active trainees',
        processed: 0,
      })
    }

    // 3. Build assessment digest for each trainee
    const traineeAssessments: TraineeAssessment[] = []

    for (const trainee of activeTrainees) {
      const trainingDay = calculateTrainingDay(trainee.trainingStartDate)
      if (trainingDay <= 0) continue

      // Find assessments scheduled for this training day
      const todaysAssessments = assessmentConfig.filter(
        (config) =>
          config.role.toLowerCase() === trainee.role.toLowerCase() &&
          config.scheduleDay === trainingDay
      )

      if (todaysAssessments.length === 0) continue

      // Check which have been submitted
      const assessmentsDue = todaysAssessments.map((config) => {
        // Find score for this trainee + assessment
        const matchingScore = allScores.find(
          (s) =>
            s.email.toLowerCase() === trainee.email.toLowerCase() &&
            s.assessmentName.toLowerCase() === config.assessmentName.toLowerCase()
        )

        return {
          config,
          submitted: !!matchingScore,
          score: matchingScore ? Math.round(matchingScore.score) : undefined,
          passFail: matchingScore?.passFail,
        }
      })

      traineeAssessments.push({
        trainee,
        trainingDay,
        assessmentsDue,
      })
    }

    // 4. Get scores submitted in last 24 hours
    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const recentScores: RecentScore[] = allScores
      .filter((s) => {
        if (!s.timestamp) return false
        const scoreDate = new Date(s.timestamp)
        return scoreDate >= twentyFourHoursAgo && scoreDate <= now
      })
      .map((s) => ({
        traineeName: s.traineeName,
        assessmentName: s.assessmentName,
        score: Math.round(s.score),
        passFail: s.passFail,
      }))

    // 5. Build the digest message
    const today = formatDate(new Date())
    const message = buildDigestMessage(today, traineeAssessments, recentScores)

    // 6. Send to Lark
    if (traineeAssessments.length > 0 || recentScores.length > 0) {
      const sendResults = await Promise.allSettled([
        sendMessage(LARK_CHAT_ANDREA, message),
        sendMessage(LARK_CHAT_GROUP, message),
      ])

      for (const result of sendResults) {
        if (result.status === 'rejected') {
          console.error('[assessment-digest] Lark send failed:', result.reason)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Digest sent for ${traineeAssessments.length} trainees`,
      processed: traineeAssessments.length,
      recentScoresCount: recentScores.length,
      date: today,
    })
  } catch (error) {
    console.error('[assessment-digest] Cron job error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}

// Also support GET for manual testing
export async function GET(request: NextRequest) {
  return POST(request)
}

// ─── Message Builder ─────────────────────────────────────────────────────────

function buildDigestMessage(
  date: string,
  traineeAssessments: TraineeAssessment[],
  recentScores: RecentScore[]
): string {
  const lines: string[] = []

  lines.push(`Assessment Digest — ${date}`)
  lines.push('——————————————————————————')
  lines.push('')

  // Today's assessments section
  if (traineeAssessments.length > 0) {
    lines.push("TODAY'S ASSESSMENTS")
    lines.push('')

    for (const ta of traineeAssessments) {
      const { trainee, trainingDay, assessmentsDue } = ta
      const coachDisplay = trainee.coachName || 'Unassigned'

      lines.push(
        `${trainee.fullName} (${trainee.role}, Day ${trainingDay})`
      )
      lines.push(`Coach: ${coachDisplay}`)

      for (const assessment of assessmentsDue) {
        const { config, submitted, score, passFail } = assessment

        // Determine who submits: Trainee, Trainer, or Coach (default)
        const evaluator = config.evaluateBy
          ? config.evaluateBy
          : 'Coach'

        if (submitted) {
          const passIcon = passFail?.toLowerCase() === 'pass' ? 'Pass' : 'Fail'
          lines.push(
            `  - ${config.assessmentName} — ${score}% (${passIcon}) [${evaluator}]`
          )
        } else {
          lines.push(
            `  - ${config.assessmentName} — Not yet submitted [${evaluator}]`
          )
          if (config.formLink) {
            lines.push(`    Form: ${config.formLink}`)
          }
        }
      }

      lines.push('')
    }
  } else {
    lines.push('No assessments scheduled for today.')
    lines.push('')
  }

  // Recent scores section
  if (recentScores.length > 0) {
    lines.push('SCORES SUBMITTED (Last 24h)')

    for (const score of recentScores) {
      const passThreshold = 80
      const passIcon = score.score >= passThreshold ? 'Pass' : 'Fail'
      const checkmark = score.score >= passThreshold ? '✅' : '❌'
      lines.push(
        `${checkmark} ${score.traineeName}: ${score.assessmentName} — ${score.score}% (${passIcon})`
      )
    }

    lines.push('')
  }

  lines.push('Please submit all scores by end of day.')

  return lines.join('\n')
}
