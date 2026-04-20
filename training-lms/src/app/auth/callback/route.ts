import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Get the user
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Check if profile exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('id', user.id)
          .single()

        if (!existingProfile) {
          // First login — create profile, send trainee to My Training (tour auto-shows)
          await supabase.from('profiles').insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
            role: 'trainee',
            google_sheet_email: user.email,
          })
          // If a specific next was requested, honour it; otherwise → My Training
          const destination = next !== '/dashboard' ? next : '/dashboard/my-training'
          return NextResponse.redirect(`${origin}${destination}`)
        }

        // Returning user — if a specific next was requested, honour it
        if (next !== '/dashboard') {
          return NextResponse.redirect(`${origin}${next}`)
        }

        // Default redirect based on role
        if (existingProfile.role === 'trainee') {
          return NextResponse.redirect(`${origin}/dashboard/home`)
        }
        return NextResponse.redirect(`${origin}/dashboard`)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
