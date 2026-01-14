import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated and is admin
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get trainee email from request body
    const body = await request.json()
    const { traineeEmail, traineeName, reminderType = 'assessment' } = body

    if (!traineeEmail) {
      return NextResponse.json({ error: 'Trainee email is required' }, { status: 400 })
    }

    // Get n8n webhook URL
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_REMINDER ||
      `${process.env.N8N_WEBHOOK_BASE_URL}/trigger/reminder`

    // Trigger n8n workflow
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        traineeEmail,
        traineeName,
        reminderType,
        triggeredBy: user.email,
        triggeredAt: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('n8n webhook error:', errorText)
      return NextResponse.json(
        { error: 'Failed to trigger workflow', details: errorText },
        { status: 502 }
      )
    }

    const result = await response.json().catch(() => ({ success: true }))

    return NextResponse.json({
      success: true,
      message: `Reminder workflow triggered for ${traineeEmail}`,
      result,
    })
  } catch (error) {
    console.error('Reminder workflow error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
