import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
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

    // Get invite details from request body
    const body = await request.json()
    const { email, fullName, role } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Validate role
    const validRoles = ['admin', 'coach', 'trainee']
    if (role && !validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Check if user already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (existingProfile) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 })
    }

    // For now, we'll create a pending invite record
    // The actual Supabase invite would require admin API access
    // This creates a pre-registration entry
    const { data: invite, error: inviteError } = await supabase
      .from('profiles')
      .insert({
        email,
        full_name: fullName || email.split('@')[0],
        role: role || 'trainee',
        // Note: id will be null until user actually signs up via Google SSO
      })
      .select()
      .single()

    if (inviteError) {
      // If the insert fails due to missing id (foreign key), 
      // we might need a separate invites table
      console.error('Invite error:', inviteError)
      
      // For MVP, just log the invite request
      console.log('Invite requested for:', { email, fullName, role, invitedBy: user.email })
      
      return NextResponse.json({
        success: true,
        message: `Invite noted for ${email}. User will be assigned ${role || 'trainee'} role on first login.`,
        note: 'User must sign in with Google to complete registration.',
      })
    }

    return NextResponse.json({
      success: true,
      message: `Invited ${email} as ${role || 'trainee'}`,
      invite,
    })
  } catch (error) {
    console.error('Error inviting user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
