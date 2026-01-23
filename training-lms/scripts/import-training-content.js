// Script to import training content from CSV to Supabase
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://czdofunqbroxttddmkgn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6ZG9mdW5xYnJveHR0ZGRta2duIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQ3NDYxOCwiZXhwIjoyMDgyMDUwNjE4fQ.QYkPNB4OaKQBzXDIKSpFZ1uLXee3luLJVGcICuYpxiE';

// Role IDs from Supabase
const ROLE_IDS = {
  'All': '63fb1295-9007-4f2c-9329-e87c71457220',
  'Onboarding Specialist': 'd2e06273-66da-4352-8c73-ff04bce9b65a',
};

// Map activity types from CSV to database format
// Valid types: Assessment, Break, Buddy Session, Coach Review, Graduation, Self-Prep, Self-Study, Self-Work, TL-Led, Trainer-Led
function mapActivityType(csvType) {
  const typeMap = {
    'Trainer Led': 'Trainer-Led',
    'Self Study': 'Self-Study',
    'Coach Led': 'Coach Review',
    'Buddy Led': 'Buddy Session',
    'Assessment': 'Assessment',
    'Assignment': 'Self-Work',
    '': 'Break',
  };
  return typeMap[csvType] || 'Self-Study';
}

// Parse time string to 24h format
function parseTime(timeStr) {
  if (!timeStr || timeStr === '-') return null;

  // Handle formats like "2:00pm - 3:00pm" or "09:30am - 11:30am"
  const match = timeStr.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/i);
  if (!match) return null;

  let hours = parseInt(match[1]);
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const period = match[3]?.toLowerCase();

  if (period === 'pm' && hours !== 12) hours += 12;
  if (period === 'am' && hours === 12) hours = 0;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

// Parse duration string to hours
function parseDuration(durationStr) {
  if (!durationStr) return 1;

  let hours = 0;
  const hourMatch = durationStr.match(/(\d+)\s*hour/i);
  const minMatch = durationStr.match(/(\d+)\s*min/i);

  if (hourMatch) hours += parseInt(hourMatch[1]);
  if (minMatch) hours += parseInt(minMatch[1]) / 60;

  return hours || 1;
}

// Parse time range to get start and end times
function parseTimeRange(timeStr) {
  if (!timeStr || timeStr === '-') return { start: null, end: null };

  const parts = timeStr.split(' - ');
  if (parts.length !== 2) return { start: null, end: null };

  return {
    start: parseTime(parts[0]),
    end: parseTime(parts[1]),
  };
}

async function importContent() {
  // Read CSV file
  const csvPath = path.join(__dirname, '../../Materials/Learning Hub Structure/Training LMS Master - 2026 - [Blueprint] Roles & Learning Agendas.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');

  // Parse CSV (handle multi-line fields)
  const lines = [];
  let currentLine = '';
  let inQuotes = false;

  for (const char of csvContent) {
    if (char === '"') {
      inQuotes = !inQuotes;
    }
    if (char === '\n' && !inQuotes) {
      lines.push(currentLine);
      currentLine = '';
    } else {
      currentLine += char;
    }
  }
  if (currentLine) lines.push(currentLine);

  // Skip header
  const header = lines[0].split(',');
  console.log('Header:', header);

  // Parse each row
  const modules = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    // Parse CSV fields (handling quoted fields with commas)
    const fields = [];
    let field = '';
    let inQuote = false;

    for (const char of line) {
      if (char === '"') {
        inQuote = !inQuote;
      } else if (char === ',' && !inQuote) {
        fields.push(field.trim());
        field = '';
      } else {
        field += char;
      }
    }
    fields.push(field.trim());

    const [
      taskNumber,
      role,
      day,
      activityName,
      description,
      time,
      duration,
      type,
      resourceLink,
      successCriteria,
      scorecardLink,
      publishOnLMS
    ] = fields;

    if (!taskNumber || !role || !day || !activityName) continue;

    const roleId = ROLE_IDS[role];
    if (!roleId) {
      console.log(`Skipping unknown role: ${role}`);
      continue;
    }

    const { start, end } = parseTimeRange(time);
    const durationHours = parseDuration(duration);
    const activityType = mapActivityType(type);

    // Determine if resource should be hidden (assessments, coach/trainer led with forms)
    const isAssessmentForm = type === 'Assessment' ||
      ((type === 'Coach Led' || type === 'Trainer Led') && resourceLink?.includes('forms.gle'));

    // Combine description and success criteria for details field
    // Format: description + "\n\n---SUCCESS_CRITERIA---\n" + successCriteria
    // Also add scorecard info for coach/trainer reference
    let fullDetails = description || '';
    if (successCriteria && successCriteria !== '-') {
      fullDetails += '\n\n---SUCCESS_CRITERIA---\n' + successCriteria;
    }
    if (scorecardLink) {
      fullDetails += '\n\n---SCORECARD_URL---\n' + scorecardLink;
    }

    const module = {
      role_id: roleId,
      day: parseInt(day),
      start_time: start,
      end_time: end,
      duration_hours: durationHours,
      topic: activityName,
      details: fullDetails || null,
      type: activityType,
      resource_url: (resourceLink && resourceLink !== '-' && !isAssessmentForm) ? resourceLink : null,
      is_common: role === 'All',
      sort_order: parseInt(taskNumber),
    };

    modules.push(module);
    console.log(`Parsed: Day ${day} - ${activityName} (${type})`);
  }

  console.log(`\nTotal modules parsed: ${modules.length}`);

  // Delete existing modules for ALL and OS roles
  console.log('\nDeleting existing modules for ALL and OS roles...');

  for (const [roleName, roleId] of Object.entries(ROLE_IDS)) {
    const deleteResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/training_modules?role_id=eq.${roleId}`,
      {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
      }
    );
    console.log(`Deleted modules for ${roleName}: ${deleteResponse.status}`);
  }

  // Insert new modules
  console.log('\nInserting new modules...');

  const insertResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/training_modules`,
    {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(modules),
    }
  );

  if (insertResponse.ok) {
    console.log(`Successfully inserted ${modules.length} modules!`);
  } else {
    const error = await insertResponse.text();
    console.error('Insert failed:', error);
  }
}

importContent().catch(console.error);
