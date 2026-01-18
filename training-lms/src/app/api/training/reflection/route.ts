import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST - Save a new reflection
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      traineeEmail,
      traineeName,
      roleCode,
      dayNumber,
      confusingTopic,
      improvement,
      confidenceLevel
    } = body

    if (!traineeEmail || !dayNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('trainee_reflections')
      .insert({
        trainee_email: traineeEmail,
        trainee_name: traineeName,
        role_code: roleCode,
        day_number: dayNumber,
        confusing_topic: confusingTopic,
        improvement_notes: improvement,
        confidence_level: confidenceLevel,
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to save reflection' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error saving reflection:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET - Fetch reflections (for trainers)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const traineeEmail = searchParams.get('email')
    const dayNumber = searchParams.get('day')

    let query = supabase
      .from('trainee_reflections')
      .select('*')
      .order('created_at', { ascending: false })

    if (traineeEmail) {
      query = query.eq('trainee_email', traineeEmail)
    }

    if (dayNumber) {
      query = query.eq('day_number', parseInt(dayNumber))
    }

    const { data, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch reflections' },
        { status: 500 }
      )
    }

    return NextResponse.json({ reflections: data })
  } catch (error) {
    console.error('Error fetching reflections:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
