import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
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

    if (!profile || !['admin', 'coach'].includes(profile.role)) {
      return NextResponse.json({ error: 'Only admins and coaches can submit scores' }, { status: 403 })
    }

    const body = await request.json()
    const { traineeEmail, traineeName, assessmentType, score, notes } = body

    if (!traineeEmail || !assessmentType || score === undefined) {
      return NextResponse.json({ error: 'traineeEmail, assessmentType, and score are required' }, { status: 400 })
    }

    if (score < 0 || score > 100) {
      return NextResponse.json({ error: 'Score must be between 0 and 100' }, { status: 400 })
    }

    const n8nWebhookUrl = process.env.N8N_WEBHOOK_SCORES ||
      process.env.N8N_WEBHOOK_BASE_URL + '/scores/submit'

    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        traineeEmail,
        traineeName,
        assessmentType,
        score,
        notes: notes || '',
        submittedBy: user.email,
        submittedAt: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('n8n scores webhook error:', errorText)
      return NextResponse.json(
        { error: 'Failed to submit score', details: errorText },
        { status: 502 }
      )
    }

    const result = await response.json().catch(() => ({ success: true }))

    return NextResponse.json({
      success: true,
      message: 'Score submitted successfully',
      result,
    })
  } catch (error) {
    console.error('Score submission error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
