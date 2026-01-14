import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Verify user is authenticated
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check user role - only admin and coach can view reports
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'coach'].includes(profile.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get n8n webhook URL for performance reports
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_PERFORMANCE ||
      `${process.env.N8N_WEBHOOK_BASE_URL}/reports/performance`

    // Fetch performance data from n8n
    const response = await fetch(n8nWebhookUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 } // Cache for 1 minute
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('n8n performance webhook error:', errorText)
      return NextResponse.json(
        { error: 'Failed to fetch performance data' },
        { status: 502 }
      )
    }

    const data = await response.json()

    // Transform data if needed
    const performanceData = {
      summary: {
        totalTrainees: data.totalTrainees || 0,
        activeTrainees: data.activeTrainees || 0,
        completedTrainees: data.completedTrainees || 0,
        averageCompletionRate: data.averageCompletionRate || 0,
        averageScore: data.averageScore || 0,
      },
      byDepartment: data.byDepartment || [],
      byCountry: data.byCountry || [],
      recentCompletions: data.recentCompletions || [],
      trends: data.trends || [],
    }

    return NextResponse.json(performanceData)
  } catch (error) {
    console.error('Error fetching performance data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
