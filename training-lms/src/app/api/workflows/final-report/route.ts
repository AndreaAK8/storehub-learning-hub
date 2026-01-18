import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

interface AssessmentBreakdown {
  name: string
  score: number
  weight: number
  weighted: number
  passed: boolean
}

// POST /api/workflows/final-report - Trigger final report email via n8n
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check user role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'coach', 'trainer'].includes(profile.role)) {
      return NextResponse.json({ error: 'Only admins, coaches, and trainers can send final reports' }, { status: 403 })
    }

    const body = await request.json()
    const {
      traineeEmail,
      traineeName,
      role,
      country,
      trainingStartDate,
      coachEmail,
      coachName,
      rawLearningScore,
      learningScore,
      participationScore,
      participationContribution,
      finalScore,
      overallStatus,
      highlights,
      lowlights,
      assessmentBreakdown,
    } = body

    // Validate required fields
    if (!traineeEmail || !traineeName || !highlights || !lowlights) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Format assessment breakdown for email
    const breakdownText = (assessmentBreakdown as AssessmentBreakdown[])
      .map((item, i) => {
        const passIcon = item.passed ? '✅' : item.score > 0 ? '❌' : '⬜'
        return `${i + 1}. ${item.name}: ${item.score > 0 ? `${item.score}%` : '-'} × ${item.weight}% = ${item.weighted}% ${passIcon}`
      })
      .join('\n')

    // Build email body
    const emailBody = `Hi ${coachName || 'Team'},

${traineeName} has completed their training program! Here's the final performance summary:

═══════════════════════════════════════════════
📈 FINAL TRAINING SCORE: ${finalScore}%
═══════════════════════════════════════════════

Learning Score: ${learningScore}%/80%
Participation Score: ${participationContribution}%/20%

Training Period: ${trainingStartDate} - ${new Date().toISOString().split('T')[0]}
Country: ${country}

═══════════════════════════════════════════════
📊 ASSESSMENT BREAKDOWN
═══════════════════════════════════════════════

Raw Learning Score: ${rawLearningScore}%

${breakdownText}

═══════════════════════════════════════════════
✨ HIGHLIGHTS
═══════════════════════════════════════════════
${highlights}

═══════════════════════════════════════════════
⚠️ AREAS FOR DEVELOPMENT
═══════════════════════════════════════════════
${lowlights}

═══════════════════════════════════════════════
Overall Result: ${overallStatus} ${overallStatus === 'PASS' ? '✅' : '❌'}
═══════════════════════════════════════════════

View in Learning Hub: https://training.storehub.com/dashboard/trainees/${encodeURIComponent(traineeEmail)}

Best regards,
${profile.full_name || user.email}
Training Team`

    // Call n8n webhook to send the email
    const webhookUrl = process.env.N8N_WEBHOOK_FINAL_REPORT || `${process.env.N8N_WEBHOOK_BASE_URL}/final-report`

    const n8nResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: coachEmail || 'andrea.kaur@storehub.com',
        cc: 'andrea.kaur@storehub.com',
        subject: `📊 Final Training Report: ${traineeName} - ${role}`,
        body: emailBody,
        // Also include structured data for logging
        traineeEmail,
        traineeName,
        role,
        country,
        trainingStartDate,
        learningScore,
        participationScore: participationScore,
        finalScore,
        overallStatus,
        highlights,
        lowlights,
        sentBy: user.email,
        sentAt: new Date().toISOString(),
      }),
    })

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text()
      console.error('n8n final report webhook error:', errorText)
      return NextResponse.json(
        { error: 'Failed to send final report', details: errorText },
        { status: 502 }
      )
    }

    // Log to Supabase (optional - for tracking)
    try {
      await supabase.from('jobs').insert({
        user_id: user.id,
        workflow_type: 'final_report',
        status: 'completed',
        input: {
          traineeEmail,
          traineeName,
          role,
          finalScore,
        },
        output: {
          sentTo: coachEmail,
          sentAt: new Date().toISOString(),
        },
        completed_at: new Date().toISOString(),
      })
    } catch (logError) {
      console.error('Error logging to Supabase:', logError)
      // Don't fail the request if logging fails
    }

    return NextResponse.json({
      success: true,
      message: 'Final report sent successfully',
      sentTo: coachEmail,
    })
  } catch (error) {
    console.error('Final report error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
