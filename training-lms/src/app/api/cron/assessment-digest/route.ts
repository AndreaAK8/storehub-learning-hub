import { NextRequest, NextResponse } from 'next/server'
import {
  getTrainees,
  getAssessmentConfig,
  getScores,
  calculateTrainingDay,
  formatDate,
  isBusinessDay,
  getNowMYT,
  type TraineeRow,
  type AssessmentConfigRow,
  type ScoreRow,
} from '@/lib/google/sheets'
import { sendCardMessage, LARK_CHAT_GROUP } from '@/lib/lark/client'

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
    // Verify cron secret (via header or query param for manual testing)
    const authHeader = request.headers.get('authorization')
    const { searchParams } = new URL(request.url)
    const querySecret = searchParams.get('secret')
    const cronSecret = process.env.CRON_SECRET
    if (cronSecret && authHeader !== `Bearer ${cronSecret}` && querySecret !== cronSecret) {
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

    // 4. Get all submitted scores for active trainees
    const activeEmails = new Set(activeTrainees.map(t => t.email.toLowerCase().trim()))

    const recentScores: RecentScore[] = allScores
      .filter((s) => {
        const email = (s.email || '').toLowerCase().trim()
        return activeEmails.has(email)
      })
      .map((s) => ({
        traineeName: s.traineeName,
        assessmentName: s.assessmentName,
        score: Math.round(s.score),
        passFail: s.passFail,
      }))

    // 5. Build and send the digest
    const today = formatDate(getNowMYT())

    // 6. Send to Lark — split by audience
    if (traineeAssessments.length > 0 || recentScores.length > 0) {
      // Separate trainee-submitted vs coach/trainer-submitted assessments
      const coachAssessments = traineeAssessments.map(ta => ({
        ...ta,
        assessmentsDue: ta.assessmentsDue.filter(a => {
          const evaluator = (a.config.evaluateBy || '').toLowerCase()
          return evaluator !== 'trainee' && evaluator !== 'new hire'
        }),
      })).filter(ta => ta.assessmentsDue.length > 0)

      const traineeAssessmentsByBatch: Record<string, TraineeAssessment[]> = {}
      for (const ta of traineeAssessments) {
        const traineeItems = ta.assessmentsDue.filter(a => {
          const evaluator = (a.config.evaluateBy || '').toLowerCase()
          return evaluator === 'trainee' || evaluator === 'new hire'
        })
        if (traineeItems.length === 0) continue
        const chatId = ta.trainee.batchChatId
        if (!chatId) continue
        if (!traineeAssessmentsByBatch[chatId]) traineeAssessmentsByBatch[chatId] = []
        traineeAssessmentsByBatch[chatId].push({
          ...ta,
          assessmentsDue: traineeItems,
        })
      }

      const sendPromises: Promise<unknown>[] = []

      // Send coach/trainer assessments + all scores to Alerts group
      if (coachAssessments.length > 0 || recentScores.length > 0) {
        const coachCard = buildCoachCard(today, coachAssessments, recentScores)
        sendPromises.push(sendCardMessage(LARK_CHAT_GROUP, coachCard))
      }

      // Send trainee-submitted reminders to each batch group chat (no scores, simplified card)
      for (const [chatId, assessments] of Object.entries(traineeAssessmentsByBatch)) {
        // Collect all unique pending assessments for this batch
        const allPendingAssessments: Array<{ config: AssessmentConfigRow; submitted: boolean }> = []
        for (const ta of assessments) {
          for (const a of ta.assessmentsDue) {
            // Avoid duplicating the same assessment (same form for all trainees)
            if (!allPendingAssessments.some(existing => existing.config.assessmentName === a.config.assessmentName)) {
              allPendingAssessments.push(a)
            }
          }
        }
        const traineeCard = buildTraineeCard(today, allPendingAssessments)
        sendPromises.push(sendCardMessage(chatId, traineeCard))
      }

      const sendResults = await Promise.allSettled(sendPromises)
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

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatPrettyDate(date: string): string {
  // Parse YYYY-MM-DD directly to avoid timezone conversion issues
  const [yearStr, monthStr, dayStr] = date.split('-')
  const year = parseInt(yearStr)
  const month = parseInt(monthStr) - 1 // 0-indexed
  const day = parseInt(dayStr)
  // Create date at noon UTC to avoid any day boundary issues
  const dateObj = new Date(Date.UTC(year, month, day, 12, 0, 0))
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  return `${days[dateObj.getUTCDay()]}, ${dateObj.getUTCDate()} ${months[dateObj.getUTCMonth()]} ${dateObj.getUTCFullYear()}`
}

// ─── Coach Card (Alerts Group) ──────────────────────────────────────────────

function buildCoachCard(
  date: string,
  traineeAssessments: TraineeAssessment[],
  recentScores: RecentScore[]
): Record<string, unknown> {
  const prettyDate = formatPrettyDate(date)
  const elements: Record<string, unknown>[] = []

  // ── Upcoming section ──
  if (traineeAssessments.length > 0) {
    elements.push({
      tag: 'div',
      text: { tag: 'lark_md', content: '**Upcoming**' },
    })
    elements.push({ tag: 'hr' })

    for (const ta of traineeAssessments) {
      const { trainee, trainingDay, assessmentsDue } = ta
      const coachDisplay = trainee.coachName || 'Unassigned'

      elements.push({
        tag: 'div',
        text: {
          tag: 'lark_md',
          content: `**Trainee:** ${trainee.fullName}\n**Role:** ${trainee.role}\n**Day:** ${trainingDay}\n**Coach:** ${coachDisplay}`,
        },
      })

      for (const assessment of assessmentsDue) {
        const { config, submitted, score, passFail } = assessment
        const evaluator = config.evaluateBy || 'Coach'

        if (submitted) {
          const icon = passFail?.toLowerCase() === 'pass' ? '✅' : '❌'
          elements.push({
            tag: 'div',
            text: {
              tag: 'lark_md',
              content: `${icon} ${config.assessmentName} — ${score}% (${passFail}) [${evaluator}]`,
            },
          })
        } else {
          elements.push({
            tag: 'div',
            text: {
              tag: 'lark_md',
              content: `⏳ ${config.assessmentName} [${evaluator}]`,
            },
          })
          if (config.formLink) {
            elements.push({
              tag: 'action',
              actions: [{
                tag: 'button',
                text: { tag: 'plain_text', content: 'Open Form →' },
                type: 'primary',
                url: config.formLink,
              }],
            })
          }
        }
      }
      elements.push({ tag: 'hr' })
    }
  }

  // ── Submitted section (scores visible to coaches only) ──
  if (recentScores.length > 0) {
    elements.push({
      tag: 'div',
      text: { tag: 'lark_md', content: '**Submitted Scores**' },
    })
    elements.push({ tag: 'hr' })

    // Column header row
    elements.push({
      tag: 'column_set',
      flex_mode: 'none',
      background_style: 'grey',
      columns: [
        { tag: 'column', width: 'weighted', weight: 2, elements: [{ tag: 'div', text: { tag: 'lark_md', content: '**Trainee**' } }] },
        { tag: 'column', width: 'weighted', weight: 3, elements: [{ tag: 'div', text: { tag: 'lark_md', content: '**Assessment**' } }] },
        { tag: 'column', width: 'weighted', weight: 1, elements: [{ tag: 'div', text: { tag: 'lark_md', content: '**Score**' } }] },
        { tag: 'column', width: 'weighted', weight: 1, elements: [{ tag: 'div', text: { tag: 'lark_md', content: '**Result**' } }] },
      ],
    })

    // Score rows
    for (const s of recentScores) {
      const icon = s.score >= 80 ? '✅' : '❌'
      const result = s.score >= 80 ? 'Pass' : 'Fail'
      elements.push({
        tag: 'column_set',
        flex_mode: 'none',
        columns: [
          { tag: 'column', width: 'weighted', weight: 2, elements: [{ tag: 'div', text: { tag: 'plain_text', content: s.traineeName || 'Unknown' } }] },
          { tag: 'column', width: 'weighted', weight: 3, elements: [{ tag: 'div', text: { tag: 'plain_text', content: s.assessmentName } }] },
          { tag: 'column', width: 'weighted', weight: 1, elements: [{ tag: 'div', text: { tag: 'plain_text', content: `${s.score}%` } }] },
          { tag: 'column', width: 'weighted', weight: 1, elements: [{ tag: 'div', text: { tag: 'plain_text', content: `${icon} ${result}` } }] },
        ],
      })
    }
    elements.push({ tag: 'hr' })
  }

  elements.push({
    tag: 'div',
    text: { tag: 'lark_md', content: 'Please submit all scores by end of day.' },
  })

  return {
    header: {
      template: 'orange',
      title: { tag: 'plain_text', content: "📋 Today's Training Assessments" },
      subtitle: { tag: 'plain_text', content: prettyDate },
    },
    elements,
  }
}

// ─── Trainee Card (Batch Group) ─────────────────────────────────────────────

function buildTraineeCard(
  date: string,
  assessments: Array<{ config: AssessmentConfigRow; submitted: boolean }>
): Record<string, unknown> {
  const prettyDate = formatPrettyDate(date)
  const elements: Record<string, unknown>[] = []

  const pending = assessments.filter(a => !a.submitted)

  if (pending.length > 0) {
    for (const assessment of pending) {
      elements.push({
        tag: 'div',
        text: {
          tag: 'lark_md',
          content: `⏳ **${assessment.config.assessmentName}**`,
        },
      })

      if (assessment.config.instructions) {
        elements.push({
          tag: 'div',
          text: {
            tag: 'plain_text',
            content: assessment.config.instructions,
          },
        })
      }

      if (assessment.config.formLink) {
        elements.push({
          tag: 'action',
          actions: [{
            tag: 'button',
            text: { tag: 'plain_text', content: 'Open Form →' },
            type: 'primary',
            url: assessment.config.formLink,
          }],
        })
      }

      elements.push({ tag: 'hr' })
    }
  }

  elements.push({
    tag: 'div',
    text: { tag: 'lark_md', content: '⏰ Please complete by **6:00 PM** today.' },
  })

  return {
    header: {
      template: 'orange',
      title: { tag: 'plain_text', content: "📋 Today's Assessments" },
      subtitle: { tag: 'plain_text', content: prettyDate },
    },
    elements,
  }
}
