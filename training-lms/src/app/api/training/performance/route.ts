import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST - Save activity performance tracking
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      traineeEmail,
      traineeName,
      roleCode,
      dayNumber,
      activityId,
      activityTitle,
      activityType,
      allocatedSeconds,
      actualSeconds,
      performanceFlag,
      percentageOfAllocated
    } = body

    if (!traineeEmail || !activityId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Use upsert to handle re-completing activities
    // Note: All records in activity_performance are completed activities
    // The created_at timestamp serves as the completion time
    const { data, error } = await supabase
      .from('activity_performance')
      .upsert({
        trainee_email: traineeEmail,
        trainee_name: traineeName,
        role_code: roleCode,
        day_number: dayNumber,
        activity_id: activityId,
        activity_title: activityTitle,
        activity_type: activityType,
        allocated_seconds: allocatedSeconds,
        actual_seconds: actualSeconds,
        performance_flag: performanceFlag,
        percentage_of_allocated: percentageOfAllocated,
      }, {
        onConflict: 'trainee_email,activity_id'
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to save performance data' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error saving performance:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET - Fetch performance data (for trainers)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const traineeEmail = searchParams.get('email')
    const dayNumber = searchParams.get('day')
    const performanceFlag = searchParams.get('flag')

    let query = supabase
      .from('activity_performance')
      .select('*')
      .order('created_at', { ascending: false })

    if (traineeEmail) {
      query = query.eq('trainee_email', traineeEmail)
    }

    if (dayNumber) {
      query = query.eq('day_number', parseInt(dayNumber))
    }

    if (performanceFlag) {
      query = query.eq('performance_flag', performanceFlag)
    }

    const { data, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch performance data' },
        { status: 500 }
      )
    }

    // Calculate summary stats
    const summary = {
      total: data.length,
      fast: data.filter(d => d.performance_flag === 'fast').length,
      onTime: data.filter(d => d.performance_flag === 'on_time').length,
      slow: data.filter(d => d.performance_flag === 'slow').length,
      struggling: data.filter(d => d.performance_flag === 'struggling').length,
      averagePercentage: data.length > 0
        ? Math.round(data.reduce((acc, d) => acc + d.percentage_of_allocated, 0) / data.length)
        : 0
    }

    return NextResponse.json({ performance: data, summary })
  } catch (error) {
    console.error('Error fetching performance:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - Update activity completion time (for coach-led activities)
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { activityId, traineeEmail, completedAt } = body

    if (!activityId || !traineeEmail || !completedAt) {
      return NextResponse.json(
        { error: 'Missing required fields: activityId, traineeEmail, completedAt' },
        { status: 400 }
      )
    }

    // Update the created_at timestamp for this activity
    const { data, error } = await supabase
      .from('activity_performance')
      .update({ created_at: completedAt })
      .eq('activity_id', activityId)
      .eq('trainee_email', traineeEmail)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to update activity time' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error updating activity time:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
