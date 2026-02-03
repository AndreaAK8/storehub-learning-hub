import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Weightage configuration by role
const WEIGHTAGE_CONFIG: Record<string, Record<string, number>> = {
  'Onboarding Coodinator': {
    'All in One Quiz': 50,
    'Advance System & Networking Quiz': 35,
    'Hardware Assessment': 15,
  },
  'Onboarding Coordinator': {
    'All in One Quiz': 50,
    'Advance System & Networking Quiz': 35,
    'Hardware Assessment': 15,
  },
  'OC': {
    'All in One Quiz': 50,
    'Advance System & Networking Quiz': 35,
    'Hardware Assessment': 15,
  },
  'Onboarding Specialist': {
    'All in One Quiz': 20,
    'Advance System & Networking Quiz': 10,
    'Hardware Assessment': 5,
    'Training Assessment (F&B)': 10,
    'Training Assessment (Retail)': 10,
    'Mock Test': 45,
  },
  'OS': {
    'All in One Quiz': 20,
    'Advance System & Networking Quiz': 10,
    'Hardware Assessment': 5,
    'Training Assessment (F&B)': 10,
    'Training Assessment (Retail)': 10,
    'Mock Test': 45,
  },
  'Merchant Care': {
    'All in One Quiz': 20,
    'Advance System & Networking Quiz': 15,
    'Hardware Assessment': 20,
    'Care Mock Test': 45,
  },
  'MC': {
    'All in One Quiz': 20,
    'Advance System & Networking Quiz': 15,
    'Hardware Assessment': 20,
    'Care Mock Test': 45,
  },
  'Merchant Onboarding Manager': {
    'All in One Quiz': 20,
    'Advance System & Networking Quiz': 10,
    'Hardware Assessment': 5,
    'Training Assessment (F&B)': 10,
    'Training Assessment (Retail)': 10,
    // Mock Test components (45% total)
    'Welcome Call Assessment': 11.25,
    'Go Live Call Assessment': 11.25,
    'Training Mock Test (F&B)': 11.25,
    'Training Mock Test (Retail)': 11.25,
  },
  'MOM': {
    'All in One Quiz': 20,
    'Advance System & Networking Quiz': 10,
    'Hardware Assessment': 5,
    'Training Assessment (F&B)': 10,
    'Training Assessment (Retail)': 10,
    // Mock Test components (45% total)
    'Welcome Call Assessment': 11.25,
    'Go Live Call Assessment': 11.25,
    'Training Mock Test (F&B)': 11.25,
    'Training Mock Test (Retail)': 11.25,
  },
  'Customer Success Manager': {
    'All in One Quiz': 20,
    'Advance System & Networking Quiz': 10,
    'Hardware Assessment': 5,
    'CSM Assessment': 20,
    'Mock Test': 45,
  },
  'CSM': {
    'All in One Quiz': 20,
    'Advance System & Networking Quiz': 10,
    'Hardware Assessment': 5,
    'CSM Assessment': 20,
    'Mock Test': 45,
  },
  'Business Consultant': {
    'All in One Quiz': 20,
    'BC Pitching Assessment - F&B': 5,
    'BC Pitching Assessment - Retail': 5,
    'BC SPIN Assessment - Session 2': 5,
    'BC Closing Skills - Session 1': 5,
    'BC Closing Skills - Session 2': 5,
    'BC Full Pitching - F&B': 10,
    'BC Full Pitching - Retail': 10,
    'Mock Test': 35,
  },
  'BC': {
    'All in One Quiz': 20,
    'BC Pitching Assessment - F&B': 5,
    'BC Pitching Assessment - Retail': 5,
    'BC SPIN Assessment - Session 2': 5,
    'BC Closing Skills - Session 1': 5,
    'BC Closing Skills - Session 2': 5,
    'BC Full Pitching - F&B': 10,
    'BC Full Pitching - Retail': 10,
    'Mock Test': 35,
  },
  'Sales Coordinator': {
    'All in One Quiz': 15,
    'Full Call Assessment': 10,
    'Objection Handling - F&B': 15,
    'Objection Handling - Retail': 15,
    'Mock Test': 45,
  },
  'SC': {
    'All in One Quiz': 15,
    'Full Call Assessment': 10,
    'Objection Handling - F&B': 15,
    'Objection Handling - Retail': 15,
    'Mock Test': 45,
  },
  'Marketing': {
    'All in One Quiz': 100,
  },
  'Ops': {
    'All in One Quiz': 100,
  },
}

// Default weightage if role not found
const DEFAULT_WEIGHTAGE = 20

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const traineeEmail = searchParams.get('email')
    const traineeRole = searchParams.get('role') || 'OS'

    if (!traineeEmail) {
      return NextResponse.json({ error: 'email is required' }, { status: 400 })
    }

    // Verify user is authenticated
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch scores from the scores API
    const scoresUrl = `${process.env.N8N_WEBHOOK_BASE_URL || 'https://storehub.app.n8n.cloud/webhook'}/scores?traineeEmail=${encodeURIComponent(traineeEmail)}`

    let scores: Array<{
      assessmentName: string
      score: number
      passed: boolean
      submittedAt: string
      attemptNumber: number
    }> = []

    // Helper function to parse scores in various formats
    const parseScore = (scoreVal: unknown): number => {
      if (!scoreVal && scoreVal !== 0) return 0
      let str = String(scoreVal).trim()

      // Handle "85 / 100" format
      if (str.includes('/')) {
        const parts = str.split('/')
        const num = parseFloat(parts[0]) || 0
        const denom = parseFloat(parts[1]) || 100
        return Math.round((num / denom) * 100)
      }

      // Remove % sign
      str = str.replace('%', '')
      let num = parseFloat(str) || 0

      // If decimal (0.93 = 93%), convert to percentage
      if (num > 0 && num <= 1) {
        num = num * 100
      }

      return Math.round(num)
    }

    try {
      const response = await fetch(scoresUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        next: { revalidate: 60 }
      })

      if (response.ok) {
        const data = await response.json()
        const rawScores = Array.isArray(data) ? data : data.scores || []

        scores = rawScores
          .filter((score: Record<string, unknown>) => {
            // Filter to only scores for this trainee
            const email = String(score['Trainee Email'] || score.traineeEmail || '').toLowerCase()
            return email === traineeEmail.toLowerCase()
          })
          .map((score: Record<string, unknown>) => {
            const scoreNum = parseScore(score['Score'] || score.score)
            return {
              assessmentName: String(score['Assessment Name'] || score.assessmentName || ''),
              score: scoreNum,
              passed: score['Passed'] === 'Pass' || score.passed === true || score.passed === 'Pass' || scoreNum >= 80,
              submittedAt: String(score['Evaluated At'] || score['Submitted At'] || score.submittedAt || score.evaluatedAt || ''),
              attemptNumber: parseInt(String(score['Attempt Number'] || score.attemptNumber || 1)),
            }
          })
      }
    } catch (error) {
      console.log('Could not fetch scores from n8n:', error)
    }

    // Get weightage config for this role
    const roleWeightages = WEIGHTAGE_CONFIG[traineeRole] || WEIGHTAGE_CONFIG['OS'] || {}

    // Map scores with weightages
    const assessmentScores = scores
      .filter(score => score.assessmentName) // Filter out empty names
      .map(score => {
        // Find matching weightage (case-insensitive partial match)
        let weightage = DEFAULT_WEIGHTAGE
        for (const [name, weight] of Object.entries(roleWeightages)) {
          if (score.assessmentName.toLowerCase().includes(name.toLowerCase()) ||
              name.toLowerCase().includes(score.assessmentName.toLowerCase())) {
            weightage = weight
            break
          }
        }

        return {
          name: score.assessmentName,
          score: score.score,
          maxScore: 100,
          weightage,
          passed: score.passed,
          date: score.submittedAt,
        }
      })
      // Sort by date
      .sort((a, b) => {
        if (!a.date && !b.date) return 0
        if (!a.date) return 1
        if (!b.date) return -1
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      })

    // Get list of all expected assessments for this role with weightages
    const expectedAssessments = Object.entries(roleWeightages).map(([name, weightage]) => ({
      name,
      weightage,
      completed: assessmentScores.some(s =>
        s.name.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(s.name.toLowerCase())
      )
    }))

    return NextResponse.json({
      assessmentScores,
      expectedAssessments,
      role: traineeRole,
    })
  } catch (error) {
    console.error('Error fetching assessment scores:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
