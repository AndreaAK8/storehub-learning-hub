import { NextRequest, NextResponse } from 'next/server'

// This endpoint receives callbacks from n8n when workflows complete
export async function POST(request: NextRequest) {
  try {
    // Optionally verify webhook secret
    const webhookSecret = process.env.N8N_WEBHOOK_SECRET
    const authHeader = request.headers.get('x-webhook-secret')

    if (webhookSecret && authHeader !== webhookSecret) {
      console.warn('Invalid webhook secret received')
      return NextResponse.json({ error: 'Invalid webhook secret' }, { status: 401 })
    }

    const body = await request.json()
    const { workflowType, status, traineeEmail, error } = body

    console.log('n8n callback received:', {
      workflowType,
      status,
      traineeEmail,
      timestamp: new Date().toISOString(),
    })

    // Handle different workflow completion types
    switch (workflowType) {
      case 'welcome':
        console.log(`Welcome email workflow ${status} for ${traineeEmail}`)
        // Could update trainee status in Google Sheets via another n8n call
        // Or store in Supabase jobs table for tracking
        break

      case 'reminder':
        console.log(`Reminder workflow ${status} for ${traineeEmail}`)
        break

      case 'assessment':
        console.log(`Assessment workflow ${status} for ${traineeEmail}`)
        break

      case 'report':
        console.log(`Report workflow ${status} for ${traineeEmail}`)
        break

      default:
        console.log(`Unknown workflow type: ${workflowType}`)
    }

    // Log any errors
    if (status === 'failed' && error) {
      console.error(`Workflow ${workflowType} failed:`, error)
    }

    return NextResponse.json({
      received: true,
      workflowType,
      status,
      processedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('n8n callback processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process callback' },
      { status: 500 }
    )
  }
}

// Health check for n8n to verify endpoint is reachable
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/webhooks/n8n',
    timestamp: new Date().toISOString(),
  })
}
