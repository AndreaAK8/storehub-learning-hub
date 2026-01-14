import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const roleShortCode = searchParams.get('role') // e.g., 'CSM', 'BC', 'MC'
    const traineeEmail = searchParams.get('email')

    if (!roleShortCode) {
      return NextResponse.json(
        { error: 'Role parameter is required' },
        { status: 400 }
      )
    }

    // Get the role ID
    const { data: roleData, error: roleError } = await supabase
      .from('training_roles')
      .select('id, name, short_code, total_days')
      .eq('short_code', roleShortCode)
      .single()

    if (roleError || !roleData) {
      return NextResponse.json(
        { error: `Role not found: ${roleShortCode}` },
        { status: 404 }
      )
    }

    // Get common modules (Day 1-2 for ALL roles)
    const { data: commonModules, error: commonError } = await supabase
      .from('training_modules')
      .select('*')
      .eq('is_common', true)
      .order('day', { ascending: true })
      .order('sort_order', { ascending: true })

    if (commonError) {
      console.error('Error fetching common modules:', commonError)
    }

    // Get role-specific modules (Day 3+)
    const { data: roleModules, error: roleModulesError } = await supabase
      .from('training_modules')
      .select('*')
      .eq('role_id', roleData.id)
      .eq('is_common', false)
      .order('day', { ascending: true })
      .order('sort_order', { ascending: true })

    if (roleModulesError) {
      console.error('Error fetching role modules:', roleModulesError)
    }

    // Combine all modules
    const allModules = [...(commonModules || []), ...(roleModules || [])]

    // Get trainee progress if email provided
    let progressMap: Record<string, string> = {}
    if (traineeEmail) {
      const { data: progressData } = await supabase
        .from('trainee_progress')
        .select('module_id, status')
        .eq('trainee_email', traineeEmail)

      if (progressData) {
        progressMap = progressData.reduce((acc, p) => {
          acc[p.module_id] = p.status
          return acc
        }, {} as Record<string, string>)
      }
    }

    // Group modules by day
    const dayMap: Record<number, any[]> = {}
    allModules.forEach(module => {
      if (!dayMap[module.day]) {
        dayMap[module.day] = []
      }
      dayMap[module.day].push({
        id: module.id,
        startTime: module.start_time,
        endTime: module.end_time,
        durationHours: parseFloat(module.duration_hours),
        title: module.topic,
        description: module.details || '',
        activityType: mapTypeToActivityType(module.type),
        pic: mapTypeToPic(module.type),
        status: progressMap[module.id] || 'pending',
        resourceLinks: module.resource_url ? [{ title: 'View Resource', url: module.resource_url }] : []
      })
    })

    // Convert to array of training days
    const trainingDays = Object.entries(dayMap).map(([dayNum, activities]) => ({
      dayNumber: parseInt(dayNum),
      title: getDayTitle(parseInt(dayNum), roleShortCode),
      description: getDayDescription(parseInt(dayNum), roleShortCode),
      activities: activities
    })).sort((a, b) => a.dayNumber - b.dayNumber)

    return NextResponse.json({
      role: {
        id: roleData.id,
        name: roleData.name,
        shortCode: roleData.short_code,
        totalDays: roleData.total_days
      },
      trainingDays,
      totalModules: allModules.length,
      completedModules: Object.values(progressMap).filter(s => s === 'completed').length
    })

  } catch (error) {
    console.error('Error in training schedule API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper functions
function mapTypeToActivityType(type: string): string {
  const mapping: Record<string, string> = {
    'Self-Study': 'self_study',
    'Trainer-Led': 'briefing',
    'Assessment': 'assessment',
    'Break': 'lunch',
    'Buddy Session': 'buddy_session',
    'Coach Review': 'review_session',
    'Self-Prep': 'self_study',
    'Self-Work': 'self_study',
    'Graduation': 'handover',
    'TL-Led': 'review_session'
  }
  return mapping[type] || 'self_study'
}

function mapTypeToPic(type: string): string {
  const mapping: Record<string, string> = {
    'Self-Study': 'player',
    'Trainer-Led': 'trainer',
    'Assessment': 'player',
    'Break': '',
    'Buddy Session': 'coach',
    'Coach Review': 'coach',
    'Self-Prep': 'player',
    'Self-Work': 'player',
    'Graduation': 'tl',
    'TL-Led': 'tl'
  }
  return mapping[type] || 'player'
}

function getDayTitle(day: number, role: string): string {
  if (day <= 2) {
    return `Product Fundamentals - Day ${day}`
  }

  const roleTitles: Record<string, Record<number, string>> = {
    'CSM': {
      3: 'Advanced Modules & CSM Assessment',
      4: 'Buddy Session & Assessment',
      5: 'Mock Test & Graduation'
    },
    'BC': {
      3: 'Pitching & SPIN Training',
      4: 'Closing Skills',
      5: 'Full Pitching Assessment',
      6: 'Mock Test & Graduation'
    },
    'MC': {
      3: 'Advanced Systems & Brand Servicing',
      4: 'Assessment & Mock Test'
    },
    'OC': {
      3: 'Advanced Modules & OC Tools',
      4: 'Buddy Session & Menu Setup',
      5: 'Mock Test & Graduation'
    },
    'SC': {
      3: 'Advanced Modules & SC Tools',
      4: 'Buddy Session & Assessment',
      5: 'Mock Test & Graduation'
    }
  }

  return roleTitles[role]?.[day] || `Day ${day} - Role Specific Training`
}

function getDayDescription(day: number, role: string): string {
  if (day === 1) {
    return 'Foundation training covering StoreHub basics'
  }
  if (day === 2) {
    return 'Continued foundation training with demos and quiz'
  }
  return 'Role-specific advanced training'
}

// Update trainee progress
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { traineeEmail, moduleId, status } = body

    if (!traineeEmail || !moduleId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: traineeEmail, moduleId, status' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('trainee_progress')
      .upsert({
        trainee_email: traineeEmail,
        module_id: moduleId,
        status: status,
        completed_at: status === 'completed' ? new Date().toISOString() : null
      }, {
        onConflict: 'trainee_email,module_id'
      })
      .select()

    if (error) {
      console.error('Error updating progress:', error)
      return NextResponse.json(
        { error: 'Failed to update progress' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })

  } catch (error) {
    console.error('Error in progress update:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
