import { NextRequest, NextResponse } from 'next/server'

// GET /api/alerts - Fetch alerts for a coach from Alert_Log
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const coachEmail = searchParams.get('coachEmail')

    if (!coachEmail) {
      return NextResponse.json({ error: 'coachEmail is required' }, { status: 400 })
    }

    // Fetch alerts from n8n webhook (which reads from Alert_Log sheet)
    const webhookUrl = process.env.N8N_WEBHOOK_ALERTS || `${process.env.N8N_WEBHOOK_BASE_URL}/alerts`

    const response = await fetch(`${webhookUrl}?coachEmail=${encodeURIComponent(coachEmail)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Cache for 5 minutes
      next: { revalidate: 300 }
    })

    if (!response.ok) {
      // If n8n webhook doesn't exist yet, return empty alerts
      console.log('Alert webhook not available, returning empty alerts')
      return NextResponse.json({ alerts: [] })
    }

    const data = await response.json()

    // Transform the data to match expected format
    const alerts = (Array.isArray(data) ? data : data.alerts || []).map((alert: Record<string, unknown>) => ({
      alertId: alert['Alert ID'] || alert.alertId || '',
      traineeEmail: alert['Trainee Email'] || alert.traineeEmail || '',
      traineeName: alert['Trainee Name'] || alert.traineeName || '',
      alertType: alert['Alert Type'] || alert.alertType || 'ORANGE',
      alertReason: alert['Alert Reason'] || alert.alertReason || '',
      coachEmail: alert['Coach Email'] || alert.coachEmail || '',
      sentAt: alert['Sent At'] || alert.sentAt || new Date().toISOString(),
      assessmentName: alert['Assessment Name'] || alert.assessmentName || '',
      failedAttempts: parseInt(String(alert['Failed Attempts'] || alert.failedAttempts || 0)),
      notes: alert['Notes'] || alert.notes || '',
    }))

    // Filter to only show recent alerts (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentAlerts = alerts.filter((alert: { sentAt: string }) => {
      const alertDate = new Date(alert.sentAt)
      return alertDate >= sevenDaysAgo
    })

    // Sort by date, most recent first
    recentAlerts.sort((a: { sentAt: string }, b: { sentAt: string }) =>
      new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
    )

    return NextResponse.json({ alerts: recentAlerts })
  } catch (error) {
    console.error('Error fetching alerts:', error)
    // Return empty alerts on error to avoid breaking the UI
    return NextResponse.json({ alerts: [] })
  }
}
