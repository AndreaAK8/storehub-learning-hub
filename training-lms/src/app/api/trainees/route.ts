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

    // Fetch trainees from n8n webhook
    const n8nUrl = process.env.N8N_WEBHOOK_TRAINEES

    if (!n8nUrl) {
      return NextResponse.json({ error: 'n8n webhook URL not configured' }, { status: 500 })
    }

    const response = await fetch(n8nUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Cache for 30 seconds to avoid hammering n8n
      next: { revalidate: 30 }
    })

    if (!response.ok) {
      throw new Error(`n8n responded with status ${response.status}`)
    }

    const data = await response.json()

    // Transform n8n data to match our frontend structure
    const trainees = data.map((item: Record<string, unknown>) => ({
      email: item['Email Address'] || '',
      fullName: item['Full Name'] || '',
      department: item['Department'] || '',
      country: item['Country'] || '',
      trainingStartDate: item['Training Start Date'] || '',
      status: item['Status'] || 'New',
      coachName: item['Coach Name'] || '',
      coachEmail: item['Coach Email'] || '',
      daysSinceTrainingStart: parseInt(String(item['Days since Training Start '] || item['Days since Training Start'] || '0')),
      totalAssessmentsRequired: parseInt(String(item['Total Assessments Required'] || '0')),
      totalAssessmentsCompleted: parseInt(String(item['Total Assessments Completed'] || '0')),
      totalAssessmentsIncomplete: parseInt(String(item['Total Assessments Incomplete'] || '0')),
    })).filter((t: { fullName: string }) => t.fullName) // Filter out empty rows

    return NextResponse.json(trainees)
  } catch (error) {
    console.error('Error fetching trainees:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trainees' },
      { status: 500 }
    )
  }
}
