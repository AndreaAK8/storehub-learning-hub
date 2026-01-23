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

    // Get additional resources from training_resources table
    const { data: additionalResources, error: resourcesError } = await supabase
      .from('training_resources')
      .select('*')
      .eq('role_id', roleData.id)

    if (resourcesError) {
      console.error('Error fetching additional resources:', resourcesError)
    }

    // Group additional resources by day
    const resourcesByDay: Record<number, { title: string; url: string; region?: string; file_type?: string }[]> = {}
    if (additionalResources) {
      for (const resource of additionalResources) {
        if (!resource.day) continue
        if (!resourcesByDay[resource.day]) {
          resourcesByDay[resource.day] = []
        }
        // Extract region from title prefix if present (e.g., "[MY] Title" -> region: "MY")
        let region = 'ALL'
        let title = resource.title
        const regionMatch = resource.title.match(/^\[(MY|PH|ALL)\]\s*/)
        if (regionMatch) {
          region = regionMatch[1]
          title = resource.title.replace(regionMatch[0], '')
        }
        resourcesByDay[resource.day].push({
          title: title,
          url: resource.url,
          region: region,
          file_type: resource.file_type
        })
      }
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

      // Parse details to extract description, success criteria, and scorecard
      const { description, successCriteria, successCriteriaRaw, parsedCriteria, scorecardUrl } = parseDetails(module.details || '')

      // Parse resource URLs (might have multiple separated by newlines)
      let resourceLinks = parseResourceLinks(module.resource_url)

      // Check if this activity should get additional video resources from training_resources table
      // Target activities that have "Training" or "Slides" or "Assessment Preparation" in the topic
      const shouldAddVideos = module.topic && (
        module.topic.toLowerCase().includes('training slides') ||
        module.topic.toLowerCase().includes('assessment preparation')
      )

      if (shouldAddVideos && resourcesByDay[module.day]) {
        // Add video resources from training_resources table
        const additionalLinks = resourcesByDay[module.day].map(r => ({
          title: r.title,
          url: r.url,
          region: r.region
        }))
        resourceLinks = [...resourceLinks, ...additionalLinks]
      }

      // Determine if timer should be hidden (Trainer-Led, Coach Review)
      const hideTimer = ['Trainer-Led', 'Coach Review', 'TL-Led'].includes(module.type)

      dayMap[module.day].push({
        id: module.id,
        startTime: module.start_time,
        endTime: module.end_time,
        durationHours: parseFloat(module.duration_hours),
        title: module.topic,
        description: description,
        activityType: mapTypeToActivityType(module.type),
        pic: mapTypeToPic(module.type),
        status: progressMap[module.id] || 'pending',
        resourceLinks: resourceLinks,
        successCriteria: successCriteria,
        successCriteriaRaw: successCriteriaRaw, // Full text with formatting
        parsedCriteria: parsedCriteria, // Structured format
        scorecardUrl: scorecardUrl, // For coach/trainer view
        hideTimer: hideTimer,
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
    'Trainer-Led': 'trainer_led',
    'Assessment': 'assessment',
    'Break': 'lunch',
    'Buddy Session': 'buddy_session',
    'Coach Review': 'coach_led',
    'Self-Prep': 'self_study',
    'Self-Work': 'assignment',
    'Graduation': 'handover',
    'TL-Led': 'trainer_led'
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
    'OS': {
      3: 'Advanced System & Troubleshooting',
      4: 'Buddy Sessions & Menu Setup',
      5: 'Assessments & Mock Tests'
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

// Parse details field to extract description, success criteria, and scorecard URL
interface ParsedCriteriaItem {
  text: string
  type: 'header' | 'numbered' | 'bullet' | 'sub-bullet' | 'text'
  indent: number
}

function parseDetails(details: string): {
  description: string
  successCriteria: string[]
  successCriteriaRaw: string | null
  parsedCriteria: ParsedCriteriaItem[]
  scorecardUrl: string | null
} {
  let description = details
  let successCriteria: string[] = []
  let successCriteriaRaw: string | null = null
  let parsedCriteria: ParsedCriteriaItem[] = []
  let scorecardUrl: string | null = null

  // Extract success criteria
  const successMatch = details.split('---SUCCESS_CRITERIA---')
  if (successMatch.length > 1) {
    description = successMatch[0].trim()
    const criteriaAndRest = successMatch[1]

    // Check if there's also a scorecard URL
    const scorecardMatch = criteriaAndRest.split('---SCORECARD_URL---')
    const criteriaText = scorecardMatch[0].trim()

    if (scorecardMatch.length > 1) {
      scorecardUrl = scorecardMatch[1].trim()
    }

    // Store raw criteria for detailed display
    if (criteriaText) {
      successCriteriaRaw = criteriaText

      // Parse into structured format
      const lines = criteriaText.split('\n')

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed) continue

        // Calculate indent level based on leading spaces
        const leadingSpaces = line.match(/^(\s*)/)?.[1].length || 0
        const indent = Math.floor(leadingSpaces / 2)

        // Detect line type
        if (/^\d+\.\s/.test(trimmed)) {
          // Numbered item (1. 2. 3. etc)
          parsedCriteria.push({
            text: trimmed.replace(/^\d+\.\s*/, ''),
            type: 'numbered',
            indent
          })
        } else if (/^-\s/.test(trimmed)) {
          // Bullet item
          parsedCriteria.push({
            text: trimmed.replace(/^-\s*/, ''),
            type: indent > 0 ? 'sub-bullet' : 'bullet',
            indent
          })
        } else if (trimmed.endsWith(':') || /\([^)]+\)$/.test(trimmed) || trimmed.match(/^[A-Z].*Products?$/)) {
          // Header (ends with colon, parentheses, or is a category like "F&B Products")
          parsedCriteria.push({
            text: trimmed,
            type: 'header',
            indent
          })
        } else {
          // Regular text
          parsedCriteria.push({
            text: trimmed,
            type: 'text',
            indent
          })
        }
      }

      // Also create simple array for backwards compatibility
      // Only get top-level numbered items
      successCriteria = parsedCriteria
        .filter(item => item.type === 'numbered' && item.indent === 0)
        .map(item => item.text)

      // If no numbered items, use headers
      if (successCriteria.length === 0) {
        successCriteria = parsedCriteria
          .filter(item => item.type === 'header' || item.type === 'numbered')
          .slice(0, 5) // Limit to first 5
          .map(item => item.text)
      }
    }
  } else {
    // Check for scorecard URL without success criteria
    const scorecardOnlyMatch = details.split('---SCORECARD_URL---')
    if (scorecardOnlyMatch.length > 1) {
      description = scorecardOnlyMatch[0].trim()
      scorecardUrl = scorecardOnlyMatch[1].trim()
    }
  }

  return { description, successCriteria, successCriteriaRaw, parsedCriteria, scorecardUrl }
}

// Parse resource URL field to extract multiple links
function parseResourceLinks(resourceUrl: string | null): { title: string; url: string; region?: string }[] {
  if (!resourceUrl || resourceUrl === '-') return []

  const links: { title: string; url: string; region?: string }[] = []

  // Split by newlines to get individual URLs or URL groups
  const lines = resourceUrl.split('\n').filter(line => line.trim())

  let currentRegion: string | undefined = undefined

  for (const line of lines) {
    const trimmed = line.trim()

    // Check if this is a region header (MY, PH)
    if (trimmed === 'MY' || trimmed === 'PH') {
      currentRegion = trimmed
      continue
    }

    // Check if this line contains a URL
    const urlMatch = trimmed.match(/https?:\/\/[^\s]+/)
    if (urlMatch) {
      const url = urlMatch[0]

      // Try to extract title from the line (e.g., "F&B: https://...")
      let title = 'View Resource'
      const titleMatch = trimmed.match(/^([^:]+):\s*https/)
      if (titleMatch) {
        title = titleMatch[1].trim()
      } else if (url.includes('lark')) {
        title = 'Lark Resource'
      } else if (url.includes('google.com/presentation')) {
        title = 'Training Deck'
      } else if (url.includes('drive.google.com')) {
        title = 'Video Resource'
      } else if (url.includes('intercom')) {
        title = 'Intercom Ticket'
      } else if (url.includes('forms.gle')) {
        title = 'Assessment Form'
      }

      links.push({
        title,
        url,
        region: currentRegion,
      })
    }
  }

  return links
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
