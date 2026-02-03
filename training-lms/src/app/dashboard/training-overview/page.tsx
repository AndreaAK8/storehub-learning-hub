'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { OnboardingChecklist } from '@/components/training'

export default function TrainingOverviewPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [traineeData, setTraineeData] = useState<{
    roleName: string
    roleCode: string
    totalDays: number
    traineeName: string
  } | null>(null)

  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setIsLoading(false)
          return
        }

        // Fetch user profile to get name
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, full_name, google_sheet_email')
          .eq('id', user.id)
          .single()

        const traineeEmail = profile?.google_sheet_email || user.email
        let roleCode = 'OS' // Default fallback

        // Fetch trainee's actual role from trainees API
        try {
          const traineeResponse = await fetch('/api/trainees', {
            credentials: 'include'
          })
          if (traineeResponse.ok) {
            const trainees = await traineeResponse.json()
            const myData = trainees.find((t: { email: string }) =>
              t.email?.toLowerCase() === traineeEmail?.toLowerCase()
            )
            if (myData?.department) {
              const roleMapping: Record<string, string> = {
                'Onboarding Specialist': 'OS',
                'Merchant Onboarding Manager': 'MOM',
                'Customer Success Manager': 'CSM',
                'Business Consultant': 'BC',
                'Merchant Consultant': 'MC',
                'Merchant Care': 'MC',
                'Onboarding Coordinator': 'OC',
                'Support Consultant': 'SC',
                'Sales Coordinator': 'SC'
              }
              roleCode = roleMapping[myData.department] || myData.department
            }
          }
        } catch {
          // Use default role on error
        }

        // Get role details from API
        const response = await fetch(`/api/training/schedule?role=${roleCode}&email=${encodeURIComponent(traineeEmail || '')}`)
        if (response.ok) {
          const data = await response.json()

          // Get trainee name from profile or user metadata
          const traineeName = profile?.full_name
            || user.user_metadata?.full_name
            || user.email?.split('@')[0]
            || 'there'

          setTraineeData({
            roleName: data.role.name,
            roleCode: data.role.shortCode,
            totalDays: data.role.totalDays,
            traineeName: traineeName.split(' ')[0], // Use first name only
          })
        }
      } catch (error) {
        console.error('Error fetching trainee data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [supabase])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--sh-orange)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--neutral-400)] text-lg">Preparing your training overview...</p>
        </div>
      </div>
    )
  }

  if (!traineeData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50">
        <div className="text-center">
          <p className="text-[var(--neutral-400)]">Unable to load training data.</p>
        </div>
      </div>
    )
  }

  return (
    <OnboardingChecklist
      roleName={traineeData.roleName}
      roleCode={traineeData.roleCode}
      totalDays={traineeData.totalDays}
      traineeName={traineeData.traineeName}
    />
  )
}
