import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Disable caching for this route
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Verify user is authenticated
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch trainees from n8n webhook
    const n8nUrl = process.env.N8N_WEBHOOK_TRAINEES

    if (!n8nUrl) {
      return NextResponse.json({ error: 'n8n webhook URL not configured' }, { status: 500 })
    }

    const response = await fetch(n8nUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store' // Disable caching to always get fresh data
    })

    if (!response.ok) {
      throw new Error(`n8n responded with status ${response.status}`)
    }

    const data = await response.json()

    // Helper to calculate days since training start
    const calculateDaysSinceStart = (startDateStr: string): number => {
      if (!startDateStr) return 0
      try {
        const startDate = new Date(startDateStr)
        if (isNaN(startDate.getTime())) return 0
        const today = new Date()
        today.setHours(0, 0, 0, 0) // Reset to start of day
        startDate.setHours(0, 0, 0, 0)
        const diffTime = today.getTime() - startDate.getTime()
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
        console.log(`Date calc: ${startDateStr} -> startDate: ${startDate.toISOString()}, today: ${today.toISOString()}, days: ${diffDays}`)
        return Math.max(0, diffDays)
      } catch (e) {
        console.error('Date calc error:', e)
        return 0
      }
    }

    // Transform n8n data to match our frontend structure
    // Google Sheet now has formulas that auto-calculate assessment counts
    const trainees = data.map((item: Record<string, unknown>) => {
      const trainingStartDate = String(item['Training Start Date'] || '')

      // Get days from Google Sheet (Current Day column with formula) or calculate
      let daysSinceTrainingStart = parseInt(String(item['Current Day'] || '0'))
      if (!daysSinceTrainingStart || isNaN(daysSinceTrainingStart)) {
        daysSinceTrainingStart = calculateDaysSinceStart(trainingStartDate)
      }

      return {
        email: item['Email Address'] || '',
        fullName: item['Full Name'] || '',
        department: item['Role'] || '',
        country: item['Country'] || '',
        trainingStartDate,
        status: item['Status'] || 'New',
        coachName: item['Coach Name'] || '',
        coachEmail: item['Coach Email'] || '',
        daysSinceTrainingStart,
        // These values now come directly from Google Sheet formulas
        totalAssessmentsRequired: parseInt(String(item['Total Assessments Required'] || '0')),
        totalAssessmentsCompleted: parseInt(String(item['Total Assessments Completed'] || '0')),
        totalAssessmentsIncomplete: parseInt(String(item['Total Assessments Incomplete'] || '0')),
      }
    }).filter((t: { fullName: string }) => t.fullName) // Filter out empty rows

    return NextResponse.json(trainees)
  } catch (error) {
    console.error('Error fetching trainees:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trainees' },
      { status: 500 }
    )
  }
}
