import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST - Create a schedule adjustment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      traineeEmail,
      moduleId,
      activityName,
      originalDay,
      newDay,
      reason,
      notes,
      adjustedBy
    } = body

    // Validate required fields
    if (!traineeEmail || !activityName || !originalDay || !newDay || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields: traineeEmail, activityName, originalDay, newDay, reason' },
        { status: 400 }
      )
    }

    // Check if adjustment already exists for this trainee + activity
    const { data: existing } = await supabase
      .from('schedule_adjustments')
      .select('id')
      .eq('trainee_email', traineeEmail)
      .eq('activity_name', activityName)
      .single()

    let result
    if (existing) {
      // Update existing adjustment
      const { data, error } = await supabase
        .from('schedule_adjustments')
        .update({
          new_day: newDay,
          reason,
          notes,
          adjusted_by: adjustedBy,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      // Create new adjustment
      const { data, error } = await supabase
        .from('schedule_adjustments')
        .insert({
          trainee_email: traineeEmail,
          module_id: moduleId,
          activity_name: activityName,
          original_day: originalDay,
          new_day: newDay,
          reason,
          notes,
          adjusted_by: adjustedBy
        })
        .select()
        .single()

      if (error) throw error
      result = data
    }

    return NextResponse.json({
      success: true,
      adjustment: result
    })

  } catch (error) {
    console.error('Error creating schedule adjustment:', error)
    return NextResponse.json(
      { error: 'Failed to create schedule adjustment' },
      { status: 500 }
    )
  }
}

// GET - Fetch adjustments for a trainee
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const traineeEmail = searchParams.get('email')

    if (!traineeEmail) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('schedule_adjustments')
      .select('*')
      .eq('trainee_email', traineeEmail)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({
      adjustments: data || []
    })

  } catch (error) {
    console.error('Error fetching schedule adjustments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch schedule adjustments' },
      { status: 500 }
    )
  }
}

// DELETE - Remove an adjustment (revert to original schedule)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adjustmentId = searchParams.get('id')

    if (!adjustmentId) {
      return NextResponse.json(
        { error: 'Adjustment ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('schedule_adjustments')
      .delete()
      .eq('id', adjustmentId)

    if (error) throw error

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting schedule adjustment:', error)
    return NextResponse.json(
      { error: 'Failed to delete schedule adjustment' },
      { status: 500 }
    )
  }
}
