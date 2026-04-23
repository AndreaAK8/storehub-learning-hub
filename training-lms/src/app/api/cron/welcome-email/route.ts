import { NextRequest, NextResponse } from 'next/server'
import { getTrainees, updateTraineeStatus, formatDate } from '@/lib/google/sheets'
import { sendEmail } from '@/lib/email/send'
import { generateWelcomeEmailHTML } from '@/lib/email/templates'
import { sendMessage, LARK_CHAT_ANDREA } from '@/lib/lark/client'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Allow up to 60s for processing multiple trainees

/**
 * POST /api/cron/welcome-email
 *
 * Vercel Cron: daily at 9:00 AM MYT (1:00 AM UTC)
 *
 * 1. Reads "Trainee List" tab for Status = "New"
 * 2. Sends HTML welcome email to each new trainee
 * 3. Updates Google Sheet: Status -> "Email Sent", Email Sent Date -> now
 * 4. Sends grouped Lark notification to Andrea's bot chat
 *
 * Idempotent: Only processes Status = "New" trainees, so re-running is safe.
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

    // 1. Fetch all trainees
    const allTrainees = await getTrainees()
    const newTrainees = allTrainees.filter(
      (t) => t.status.toLowerCase() === 'new' && t.email
    )

    if (newTrainees.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No new trainees to process',
        processed: 0,
      })
    }

    console.log(`[welcome-email] Found ${newTrainees.length} new trainees`)

    // 2. Send welcome emails and update status
    const results: Array<{
      name: string
      email: string
      role: string
      startDate: string
      emailSent: boolean
      sheetUpdated: boolean
      error?: string
    }> = []

    for (const trainee of newTrainees) {
      const result = {
        name: trainee.fullName,
        email: trainee.email,
        role: trainee.role,
        startDate: trainee.trainingStartDate,
        emailSent: false,
        sheetUpdated: false,
        error: undefined as string | undefined,
      }

      try {
        // Generate and send welcome email
        const html = generateWelcomeEmailHTML({
          fullName: trainee.fullName,
          role: trainee.role,
          trainingStartDate: trainee.trainingStartDate,
        })

        const emailResult = await sendEmail({
          to: trainee.email,
          subject: `Welcome to StoreHub Training, ${trainee.fullName}!`,
          html,
        })

        result.emailSent = emailResult.success
        if (!emailResult.success) {
          result.error = emailResult.error
          console.error(`[welcome-email] Failed to send email to ${trainee.email}:`, emailResult.error)
        }

        // Update Google Sheet status (even if email fails to dry-run mode, we still update)
        if (emailResult.success) {
          try {
            const now = formatDate(new Date())
            await updateTraineeStatus(trainee.email, 'Email Sent', now)
            result.sheetUpdated = true
          } catch (sheetError) {
            const msg = sheetError instanceof Error ? sheetError.message : 'Unknown'
            result.error = `Sheet update failed: ${msg}`
            console.error(`[welcome-email] Failed to update sheet for ${trainee.email}:`, msg)
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        result.error = msg
        console.error(`[welcome-email] Error processing ${trainee.email}:`, msg)
      }

      results.push(result)
    }

    // 3. Send grouped Lark notification to Andrea
    const successfulTrainees = results.filter((r) => r.emailSent)

    if (successfulTrainees.length > 0) {
      try {
        const traineeLines = successfulTrainees
          .map(
            (t) =>
              `- ${t.name} (${t.role}) — ${t.email} — Start: ${t.startDate}`
          )
          .join('\n')

        const larkMessage = [
          `${successfulTrainees.length} new trainee${successfulTrainees.length > 1 ? 's' : ''} onboarded!`,
          traineeLines,
          'Welcome emails sent. Please create calendar invitations when ready.',
        ].join('\n')

        await sendMessage(LARK_CHAT_ANDREA, larkMessage)
      } catch (larkError) {
        console.error('[welcome-email] Lark notification failed:', larkError)
        // Don't fail the whole job for a notification error
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.length} new trainees`,
      processed: results.length,
      emailsSent: successfulTrainees.length,
      results,
    })
  } catch (error) {
    console.error('[welcome-email] Cron job error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}

// Also support GET for manual testing via browser
export async function GET(request: NextRequest) {
  return POST(request)
}
