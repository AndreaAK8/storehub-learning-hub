import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/dashboard/Sidebar'
import Header from '@/components/dashboard/Header'
import MobileNav from '@/components/dashboard/MobileNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Use role from database directly
  const userRole = (profile?.role || 'trainee') as 'admin' | 'coach' | 'trainee'

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar userRole={userRole} />
      <MobileNav userRole={userRole} />
      <div className="lg:pl-64">
        <Header user={user} profile={profile} />
        <main className="py-6 px-4 sm:px-6 lg:px-8 pt-16 lg:pt-6">
          {children}
        </main>
      </div>
    </div>
  )
}
