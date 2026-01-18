import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/scores - Fetch scores for a trainee
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const traineeEmail = searchParams.get('traineeEmail')

    if (!traineeEmail) {
      return NextResponse.json({ error: 'traineeEmail is required' }, { status: 400 })
    }

    // Fetch scores from n8n webhook (which reads from Assessment_Scores sheet)
    const webhookUrl = process.env.N8N_WEBHOOK_SCORES || `${process.env.N8N_WEBHOOK_BASE_URL}/scores`

    const response = await fetch(`${webhookUrl}?traineeEmail=${encodeURIComponent(traineeEmail)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Cache for 2 minutes
      next: { revalidate: 120 }
    })

    if (!response.ok) {
      // If n8n webhook doesn't exist yet, return empty scores
      console.log('Scores webhook not available, returning empty scores')
      return NextResponse.json({ scores: [] })
    }

    const data = await response.json()

    // Transform the data to match expected format
    const scores = (Array.isArray(data) ? data : data.scores || []).map((score: Record<string, unknown>) => ({
      traineeEmail: score['Trainee Email'] || score.traineeEmail || '',
      traineeName: score['Trainee Name'] || score.traineeName || '',
      assessmentName: score['Assessment Name'] || score.assessmentName || '',
      score: parseFloat(String(score['Score'] || score.score || 0).replace('%', '')),
      passed: score['Passed'] === 'Pass' || score.passed === true || score.passed === 'Pass',
      attemptNumber: parseInt(String(score['Attempt Number'] || score.attemptNumber || 1)),
      submittedAt: score['Submitted At'] || score.submittedAt || new Date().toISOString(),
    }))

    // Sort by date, most recent first
    scores.sort((a: { submittedAt: string }, b: { submittedAt: string }) =>
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    )

    return NextResponse.json({ scores })
  } catch (error) {
    console.error('Error fetching scores:', error)
    // Return empty scores on error to avoid breaking the UI
    return NextResponse.json({ scores: [] })
  }
}

// POST /api/scores - Submit a new score
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

    const n8nWebhookUrl = process.env.N8N_WEBHOOK_SCORE_SUBMIT ||
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
