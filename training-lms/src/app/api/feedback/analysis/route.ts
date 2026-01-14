import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Mock data for demo purposes
const MOCK_FEEDBACK_DATA = {
  sentiment_counts: {
    positive: 18,
    neutral: 7,
    negative: 3
  },
  key_themes: [
    { theme: "Coach Support", count: 12, sentiment: "positive" as const },
    { theme: "Training Materials", count: 9, sentiment: "positive" as const },
    { theme: "Session Pacing", count: 5, sentiment: "neutral" as const },
    { theme: "Product Knowledge", count: 8, sentiment: "positive" as const },
    { theme: "Time Management", count: 4, sentiment: "neutral" as const },
    { theme: "Technical Issues", count: 3, sentiment: "negative" as const }
  ],
  feedback_entries: [
    {
      id: "1",
      trainee_name: "Sarah Chen",
      trainee_email: "sarah.chen@storehub.com",
      feedback_text: "The training sessions were incredibly helpful! My coach explained everything clearly and was always available for questions. I feel much more confident using the POS system now.",
      sentiment: "positive" as const,
      themes: ["Coach Support", "Product Knowledge"],
      submitted_at: "2025-01-08T14:30:00Z",
      ai_summary: "Highly positive feedback highlighting coach effectiveness and improved confidence"
    },
    {
      id: "2",
      trainee_name: "Ahmad Rizal",
      trainee_email: "ahmad.rizal@storehub.com",
      feedback_text: "Good training overall. Some sessions felt a bit rushed, would appreciate more time for hands-on practice with the inventory module.",
      sentiment: "neutral" as const,
      themes: ["Session Pacing", "Training Materials"],
      submitted_at: "2025-01-07T11:15:00Z",
      ai_summary: "Mixed feedback - appreciates training but requests more practice time"
    },
    {
      id: "3",
      trainee_name: "Priya Sharma",
      trainee_email: "priya.sharma@storehub.com",
      feedback_text: "Excellent experience! The role-play exercises really helped me understand how to handle difficult customer situations. The training materials were comprehensive.",
      sentiment: "positive" as const,
      themes: ["Training Materials", "Coach Support"],
      submitted_at: "2025-01-07T09:45:00Z",
      ai_summary: "Strong positive response to interactive training methods and materials"
    },
    {
      id: "4",
      trainee_name: "Marcus Lee",
      trainee_email: "marcus.lee@storehub.com",
      feedback_text: "Had some issues with the training platform freezing during the assessment. Otherwise the content was good and the coach was patient.",
      sentiment: "neutral" as const,
      themes: ["Technical Issues", "Coach Support"],
      submitted_at: "2025-01-06T16:20:00Z",
      ai_summary: "Technical difficulties noted but positive about coach interaction"
    },
    {
      id: "5",
      trainee_name: "Jenny Wong",
      trainee_email: "jenny.wong@storehub.com",
      feedback_text: "The product knowledge sessions were fantastic. I learned so many features I didn't know existed. This will definitely help me serve customers better.",
      sentiment: "positive" as const,
      themes: ["Product Knowledge", "Training Materials"],
      submitted_at: "2025-01-06T10:00:00Z",
      ai_summary: "Enthusiastic about product training depth and practical applications"
    },
    {
      id: "6",
      trainee_name: "David Tan",
      trainee_email: "david.tan@storehub.com",
      feedback_text: "Struggled to keep up with the pace. The assessments came too quickly after the training sessions. Need more time to absorb the information.",
      sentiment: "negative" as const,
      themes: ["Session Pacing", "Time Management"],
      submitted_at: "2025-01-05T15:30:00Z",
      ai_summary: "Concerns about training pace and assessment timing"
    }
  ],
  ai_insights: "Overall sentiment is strongly positive (64%) with trainees particularly appreciating coach support and comprehensive training materials. Key areas for improvement include:\n\n• Session pacing - some trainees feel rushed, especially before assessments\n• Technical stability - platform issues reported during assessments\n• More hands-on practice time requested for complex modules\n\nRecommendation: Consider adding a buffer day between training completion and assessments to allow for better knowledge retention.",
  last_updated: new Date().toISOString()
}

export async function GET() {
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

    // Try to fetch from n8n Win 6 workflow
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_FEEDBACK_ANALYSIS ||
      `${process.env.N8N_WEBHOOK_BASE_URL}/feedback/analysis`

    try {
      const response = await fetch(n8nWebhookUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      }
    } catch (fetchError) {
      console.log('n8n webhook not available, using mock data')
    }

    // Return mock data if n8n is not available
    return NextResponse.json(MOCK_FEEDBACK_DATA)
  } catch (error) {
    console.error('Feedback analysis error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
