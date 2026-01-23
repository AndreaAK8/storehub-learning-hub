import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// POST - Extend training deadline for a trainee
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'coach', 'trainer'].includes(profile.role)) {
    return NextResponse.json({ error: 'Only coaches/trainers can extend deadlines' }, { status: 403 })
  }

  const body = await request.json()
  const { traineeEmail, extensionDays, reason, notes } = body

  if (!traineeEmail || !extensionDays || !reason) {
    return NextResponse.json({ error: 'traineeEmail, extensionDays, and reason are required' }, { status: 400 })
  }

  // Validate reason
  const validReasons = ['coach_unavailable', 'buddy_unavailable', 'trainee_leave', 'trainee_sick', 'needs_more_time', 'other']
  if (!validReasons.includes(reason)) {
    return NextResponse.json({ error: 'Invalid reason' }, { status: 400 })
  }

  // Create extension record
  const { data: extension, error } = await supabase
    .from('schedule_adjustments')
    .insert({
      trainee_email: traineeEmail,
      activity_name: 'TRAINING_EXTENSION',
      original_day: 0,
      new_day: extensionDays,
      reason: reason === 'coach_unavailable' || reason === 'buddy_unavailable' ? 'external' :
              reason === 'trainee_leave' ? 'leave' :
              reason === 'trainee_sick' ? 'sick' :
              reason === 'needs_more_time' ? 'pace' : 'other',
      notes: notes || `Extended by ${extensionDays} days. Reason: ${reason}`,
      adjusted_by: profile.email
    })
    .select()
    .single()

  if (error) {
    console.error('Error extending deadline:', error)
    return NextResponse.json({ error: 'Failed to extend deadline' }, { status: 500 })
  }

  // Also update n8n/Google Sheet if webhook is available
  const webhookUrl = process.env.N8N_WEBHOOK_TRAINEE_UPDATE
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          traineeEmail,
          action: 'extend_deadline',
          extensionDays,
          reason,
          notes,
          adjustedBy: profile.email
        })
      })
    } catch (e) {
      console.error('Failed to notify n8n:', e)
      // Don't fail the request, just log
    }
  }

  return NextResponse.json({
    success: true,
    message: `Training extended by ${extensionDays} days`,
    extension
  })
}

// GET - Fetch extension history for a trainee
export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const traineeEmail = request.nextUrl.searchParams.get('traineeEmail')
  if (!traineeEmail) {
    return NextResponse.json({ error: 'traineeEmail is required' }, { status: 400 })
  }

  const { data: extensions, error } = await supabase
    .from('schedule_adjustments')
    .select('*')
    .eq('trainee_email', traineeEmail)
    .eq('activity_name', 'TRAINING_EXTENSION')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching extensions:', error)
    return NextResponse.json({ error: 'Failed to fetch extensions' }, { status: 500 })
  }

  return NextResponse.json({ extensions })
}
