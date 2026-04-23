import { NextRequest, NextResponse } from 'next/server'
import { getTrainees, formatDate, isBusinessDay } from '@/lib/google/sheets'
import { sendMessage, LARK_CHAT_ANDREA } from '@/lib/lark/client'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/**
 * POST /api/cron/calendar-scheduler
 *
 * Vercel Cron: daily at 11:00 AM MYT (3:00 AM UTC), Mon-Fri only
 *
 * 1. Finds trainees with Training Start Date = today and Status = "Email Sent"
 * 2. Groups them into one Lark message to Andrea's bot chat
 * 3. Message includes calendar event suggestions for Day 1 and Day 2
 *
 * Idempotent: read-only, only sends notifications.
 * If re-run, Andrea will just see the same reminder again.
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

    // 1. Get all trainees
    const allTrainees = await getTrainees()
    const today = formatDate(new Date())

    // 2. Find trainees starting today with Status = "Email Sent"
    const startingToday = allTrainees.filter((t) => {
      if (!t.trainingStartDate || !t.email) return false

      // Normalize date comparison (handle various date formats)
      const startDate = normalizeDate(t.trainingStartDate)
      const status = t.status.toLowerCase()

      return startDate === today && status === 'email sent'
    })

    if (startingToday.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No trainees starting today',
        processed: 0,
      })
    }

    console.log(
      `[calendar-scheduler] ${startingToday.length} trainees starting today (${today})`
    )

    // 3. Build and send Lark message
    const message = buildCalendarMessage(today, startingToday)

    try {
      await sendMessage(LARK_CHAT_ANDREA, message)
    } catch (larkError) {
      console.error('[calendar-scheduler] Lark notification failed:', larkError)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to send Lark notification',
        },
        { status: 502 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Calendar reminder sent for ${startingToday.length} trainees`,
      processed: startingToday.length,
      trainees: startingToday.map((t) => ({
        name: t.fullName,
        role: t.role,
        email: t.email,
      })),
    })
  } catch (error) {
    console.error('[calendar-scheduler] Cron job error:', error)
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Normalize date string to YYYY-MM-DD format.
 * Handles "2026-04-23", "4/23/2026", "Apr 23, 2026", etc.
 */
function normalizeDate(dateStr: string): string {
  if (!dateStr) return ''

  // Already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr

  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return ''
    return formatDate(date)
  } catch {
    return ''
  }
}

/**
 * Build the Lark notification message with calendar event details.
 */
function buildCalendarMessage(
  today: string,
  trainees: Array<{
    fullName: string
    role: string
    email: string
    coachName: string
  }>
): string {
  const lines: string[] = []

  lines.push(`Calendar Reminder — ${today}`)
  lines.push('——————————————————————————')
  lines.push('')
  lines.push(
    `${trainees.length} trainee${trainees.length > 1 ? 's' : ''} starting training today:`
  )
  lines.push('')

  for (const t of trainees) {
    lines.push(`- ${t.fullName} (${t.role}) — ${t.email}`)
    if (t.coachName) {
      lines.push(`  Coach: ${t.coachName}`)
    }
  }

  lines.push('')
  lines.push('Please create the following calendar invitations:')
  lines.push('')
  lines.push('Day 1 — What & Why')
  lines.push('  Time: 2:00 PM - 6:30 PM')
  lines.push('  Type: Product Training (self-study with Andrea)')
  lines.push('')
  lines.push('Day 2 — The How')
  lines.push('  Time: 9:30 AM - 6:30 PM')
  lines.push('  Type: Product Training (hands-on)')
  lines.push('')
  lines.push('Day 2 — Demo Session')
  lines.push('  Time: 2:30 PM - 4:45 PM')
  lines.push('  Type: Demo & Practice')
  lines.push('')

  // List emails for easy copy-paste
  lines.push('Trainee emails (for calendar invite):')
  for (const t of trainees) {
    lines.push(`  ${t.email}`)
  }

  return lines.join('\n')
}
