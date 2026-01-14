import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated and has admin/coach role
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
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get update data from request
    const body = await request.json()
    const { email, performanceFlag, delayReason, daysExtended, adjustedEndDate, notes } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Get n8n webhook URL for updates
    const n8nUpdateUrl = process.env.N8N_WEBHOOK_TRAINEE_UPDATE

    if (!n8nUpdateUrl) {
      // n8n webhook not configured yet - return helpful message
      return NextResponse.json({
        success: false,
        message: 'n8n webhook not configured',
        instructions: {
          envVar: 'N8N_WEBHOOK_TRAINEE_UPDATE',
          expectedUrl: 'https://storehub.app.n8n.cloud/webhook/trainee/update',
          payload: {
            email,
            performanceFlag,
            delayReason,
            daysExtended,
            adjustedEndDate,
            notes,
            updatedBy: user.email,
            updatedAt: new Date().toISOString(),
          },
          description: 'Create an n8n webhook that receives this payload and updates the corresponding row in Google Sheets'
        }
      }, { status: 200 }) // Return 200 so frontend knows the call worked (just n8n not ready)
    }

    // Call n8n webhook to update Google Sheet
    const response = await fetch(n8nUpdateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        performanceFlag,
        delayReason,
        daysExtended,
        adjustedEndDate,
        notes,
        updatedBy: user.email,
        updatedAt: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('n8n webhook error:', errorText)
      return NextResponse.json({ error: 'Failed to update trainee' }, { status: 500 })
    }

    // Handle empty response from n8n (some webhooks return 200 with no body)
    const responseText = await response.text()
    let result = null
    if (responseText) {
      try {
        result = JSON.parse(responseText)
      } catch {
        // Response is not JSON, that's okay
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Trainee updated successfully',
      data: result,
    })
  } catch (error) {
    console.error('Error updating trainee:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
