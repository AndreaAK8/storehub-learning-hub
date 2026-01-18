'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TrainingOverview } from '@/components/training'
import { useRouter } from 'next/navigation'

export default function TrainingOverviewPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [traineeData, setTraineeData] = useState<{
    roleName: string
    roleCode: string
    totalDays: number
    currentDay: number
  } | null>(null)

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setIsLoading(false)
          return
        }

        // Fetch user profile to get training role
        const { data: profile } = await supabase
          .from('profiles')
          .select('training_role')
          .eq('id', user.id)
          .single()

        const validTrainingRoles = ['OC', 'OS', 'MOM', 'CSM', 'BC', 'MC', 'SC']
        const roleCode = profile?.training_role && validTrainingRoles.includes(profile.training_role)
          ? profile.training_role
          : 'OC'

        // Get role details from API
        const response = await fetch(`/api/training/schedule?role=${roleCode}&email=${encodeURIComponent(user.email || '')}`)
        if (response.ok) {
          const data = await response.json()

          // Calculate current day based on progress
          let currentDay = 0
          if (data.trainingDays && data.trainingDays.length > 0) {
            // Check completed activities to determine progress
            const progressResponse = await fetch(`/api/training/performance?email=${encodeURIComponent(user.email || '')}`)
            const progressData = progressResponse.ok ? await progressResponse.json() : { performance: [] }

            if (progressData.performance && progressData.performance.length > 0) {
              // Find the highest day with completed activities
              const completedDays = new Set(progressData.performance.map((p: { day_number: number }) => p.day_number))
              currentDay = Math.max(...Array.from(completedDays) as number[], 0)

              // If they have progress, they're at least on day 1
              if (currentDay === 0 && progressData.performance.length > 0) {
                currentDay = 1
              }
            }
          }

          setTraineeData({
            roleName: data.role.name,
            roleCode: data.role.shortCode,
            totalDays: data.role.totalDays,
            currentDay: currentDay,
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

  const handleViewSchedule = () => {
    router.push('/dashboard/my-training')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--sh-orange)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--neutral-400)]">Loading your training overview...</p>
        </div>
      </div>
    )
  }

  if (!traineeData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-[var(--neutral-400)]">Unable to load training data.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--sh-black)]">Training Overview</h1>
        <p className="text-[var(--neutral-400)]">Everything you need to know about your training journey</p>
      </div>

      <TrainingOverview
        roleName={traineeData.roleName}
        roleCode={traineeData.roleCode}
        totalDays={traineeData.totalDays}
        currentDay={traineeData.currentDay}
        onViewSchedule={handleViewSchedule}
      />
    </div>
  )
}
