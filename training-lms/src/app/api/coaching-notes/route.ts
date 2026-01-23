import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - Fetch notes for a trainee
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

  if (!profile || (profile.role !== 'coach' && profile.role !== 'admin')) {
    return NextResponse.json({ error: 'Only coaches can access notes' }, { status: 403 })
  }

  const traineeEmail = request.nextUrl.searchParams.get('traineeEmail')

  let query = supabase
    .from('coaching_notes')
    .select('*')
    .order('created_at', { ascending: false })

  // Filter by trainee if specified
  if (traineeEmail) {
    query = query.eq('trainee_email', traineeEmail)
  }

  // Coaches can only see their own notes, admins see all
  if (profile.role === 'coach') {
    query = query.eq('coach_email', profile.email)
  }

  const { data: notes, error } = await query

  if (error) {
    console.error('Error fetching notes:', error)
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 })
  }

  return NextResponse.json({ notes })
}

// POST - Create a new note
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'coach' && profile.role !== 'admin')) {
    return NextResponse.json({ error: 'Only coaches can create notes' }, { status: 403 })
  }

  const body = await request.json()
  const { traineeEmail, note, visibility = 'private', category = 'general' } = body

  if (!traineeEmail || !note) {
    return NextResponse.json({ error: 'traineeEmail and note are required' }, { status: 400 })
  }

  // Validate visibility
  const validVisibilities = ['private', 'trainer', 'trainee', 'all']
  if (!validVisibilities.includes(visibility)) {
    return NextResponse.json({ error: 'Invalid visibility option' }, { status: 400 })
  }

  // Validate category
  const validCategories = ['general', 'performance', 'feedback', 'action_item', 'concern']
  if (!validCategories.includes(category)) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
  }

  const { data: newNote, error } = await supabase
    .from('coaching_notes')
    .insert({
      coach_id: profile.id,
      coach_email: profile.email,
      trainee_email: traineeEmail,
      note: note.trim(),
      visibility,
      category
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating note:', error)
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 })
  }

  return NextResponse.json({ note: newNote })
}

// PUT - Update a note
export async function PUT(request: NextRequest) {
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

  if (!profile || (profile.role !== 'coach' && profile.role !== 'admin')) {
    return NextResponse.json({ error: 'Only coaches can update notes' }, { status: 403 })
  }

  const body = await request.json()
  const { id, note } = body

  if (!id || !note) {
    return NextResponse.json({ error: 'id and note are required' }, { status: 400 })
  }

  let query = supabase
    .from('coaching_notes')
    .update({ note: note.trim(), updated_at: new Date().toISOString() })
    .eq('id', id)

  // Coaches can only update their own notes
  if (profile.role === 'coach') {
    query = query.eq('coach_email', profile.email)
  }

  const { data: updatedNote, error } = await query.select().single()

  if (error) {
    console.error('Error updating note:', error)
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 })
  }

  return NextResponse.json({ note: updatedNote })
}

// DELETE - Delete a note
export async function DELETE(request: NextRequest) {
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

  if (!profile || (profile.role !== 'coach' && profile.role !== 'admin')) {
    return NextResponse.json({ error: 'Only coaches can delete notes' }, { status: 403 })
  }

  const id = request.nextUrl.searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  let query = supabase
    .from('coaching_notes')
    .delete()
    .eq('id', id)

  // Coaches can only delete their own notes
  if (profile.role === 'coach') {
    query = query.eq('coach_email', profile.email)
  }

  const { error } = await query

  if (error) {
    console.error('Error deleting note:', error)
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
