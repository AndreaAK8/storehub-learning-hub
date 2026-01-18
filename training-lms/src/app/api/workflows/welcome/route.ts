import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/workflows/welcome - Trigger welcome email via n8n
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check user role - admins and trainers can send welcome emails
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'trainer', 'coach'].includes(profile.role)) {
      return NextResponse.json({ error: 'Only admins, trainers, and coaches can send welcome emails' }, { status: 403 })
    }

    const body = await request.json()
    const {
      email,
      fullName,
      role,
      country,
      trainingStartDate,
      coachName,
      coachEmail,
    } = body

    // Validate required fields
    if (!email || !fullName) {
      return NextResponse.json({ error: 'Missing required fields: email, fullName' }, { status: 400 })
    }

    // Call n8n webhook to send the welcome email
    const webhookUrl = process.env.N8N_WEBHOOK_WELCOME || `${process.env.N8N_WEBHOOK_BASE_URL}/trigger/welcome`

    const n8nResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        fullName,
        role: role || 'New Hire',
        country: country || 'MY',
        trainingStartDate: trainingStartDate || new Date().toISOString().split('T')[0],
        coachName: coachName || 'Training Team',
        coachEmail: coachEmail || 'andrea.kaur@storehub.com',
        triggeredBy: user.email,
        triggeredAt: new Date().toISOString(),
      }),
    })

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text()
      console.error('n8n welcome webhook error:', errorText)
      return NextResponse.json(
        { error: 'Failed to send welcome email', details: errorText },
        { status: 502 }
      )
    }

    // Log to Supabase jobs table
    try {
      await supabase.from('jobs').insert({
        user_id: user.id,
        workflow_type: 'welcome_email',
        status: 'completed',
        input: {
          traineeEmail: email,
          traineeName: fullName,
          role,
        },
        output: {
          sentAt: new Date().toISOString(),
        },
        completed_at: new Date().toISOString(),
      })
    } catch (logError) {
      console.error('Error logging to Supabase:', logError)
    }

    return NextResponse.json({
      success: true,
      message: 'Welcome email sent successfully',
      sentTo: email,
    })
  } catch (error) {
    console.error('Welcome email error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
