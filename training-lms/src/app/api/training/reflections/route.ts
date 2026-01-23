import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - Fetch reflections for a trainee
export async function GET(request: NextRequest) {
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

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  const traineeEmail = request.nextUrl.searchParams.get('traineeEmail')

  // Trainees can only see their own reflections
  // Coaches/Admins can see any trainee's reflections
  if (profile.role === 'trainee') {
    if (traineeEmail && traineeEmail !== profile.email) {
      return NextResponse.json({ error: 'Cannot view other trainee reflections' }, { status: 403 })
    }
  }

  const emailToFetch = traineeEmail || profile.email

  const { data: reflections, error } = await supabase
    .from('trainee_reflections')
    .select('*')
    .eq('trainee_email', emailToFetch)
    .order('day_number', { ascending: true })

  if (error) {
    console.error('Error fetching reflections:', error)
    return NextResponse.json({ error: 'Failed to fetch reflections' }, { status: 500 })
  }

  return NextResponse.json({ reflections })
}
