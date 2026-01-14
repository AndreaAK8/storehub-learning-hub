import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
      // Return basic user info if profile doesn't exist
      return NextResponse.json({
        id: user.id,
        email: user.email,
        fullName: user.user_metadata?.full_name || user.email?.split('@')[0],
        role: 'trainee', // Default role
        avatarUrl: user.user_metadata?.avatar_url,
        createdAt: user.created_at,
      })
    }

    return NextResponse.json({
      id: user.id,
      email: profile.email || user.email,
      fullName: profile.full_name || user.user_metadata?.full_name,
      role: profile.role || 'trainee',
      googleSheetEmail: profile.google_sheet_email,
      avatarUrl: user.user_metadata?.avatar_url,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
