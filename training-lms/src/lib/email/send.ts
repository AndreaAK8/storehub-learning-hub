// Email sending via Resend API
// Free tier: 100 emails/day, no npm package needed (just REST API)

const RESEND_API_KEY = process.env.RESEND_API_KEY

interface SendEmailParams {
  to: string
  subject: string
  html: string
  from?: string
  replyTo?: string
}

interface SendEmailResult {
  success: boolean
  id?: string
  error?: string
}

/**
 * Send an email via Resend API.
 * Falls back to logging if RESEND_API_KEY is not configured.
 */
export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const {
    to,
    subject,
    html,
    from = process.env.EMAIL_FROM || 'StoreHub Training <training@storehub.com>',
    replyTo = 'andrea.kaur@storehub.com',
  } = params

  // If no API key, log and return success (dry-run mode)
  if (!RESEND_API_KEY) {
    console.log(`[EMAIL DRY-RUN] To: ${to}, Subject: ${subject}`)
    return { success: true, id: `dry-run-${Date.now()}` }
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
        reply_to: replyTo,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }))
      console.error('Resend API error:', errorData)
      return {
        success: false,
        error: `Resend error (${response.status}): ${errorData.message || JSON.stringify(errorData)}`,
      }
    }

    const data = await response.json()
    return { success: true, id: data.id }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Email send error:', message)
    return { success: false, error: message }
  }
}
