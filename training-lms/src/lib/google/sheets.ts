// Google Sheets API helper using API Key (read) and Service Account (write)
// Reads from "Training LMS Master - 2026" spreadsheet

const SHEET_ID = process.env.GOOGLE_SHEET_ID || '1IFAAelyD_x2uCOQKcbj8n7wgizNtVirAYbqCv67Y468'
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY!
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TraineeRow {
  fullName: string
  email: string
  role: string
  country: string
  trainingStartDate: string
  expectedEndDate: string
  status: string
  emailSentDate: string
  coachName: string
  coachEmail: string
  batchChatId: string
}

export interface AssessmentConfigRow {
  role: string
  assessmentName: string
  scheduleDay: number
  formLink: string
  instructions: string
  evaluateBy: string // "Trainee" | "Trainer" | "" (Coach)
  deadlineTime: string
}

export interface ScoreRow {
  timestamp: string
  traineeName: string
  email: string
  role: string
  assessmentName: string
  score: number
  passFail: string
  attemptNumber: number
  coachName: string
  coachEmail: string
  remarks: string
}

// ─── Read helpers ────────────────────────────────────────────────────────────

/**
 * Read a range from a Google Sheet tab using Service Account auth.
 * Returns rows as arrays of strings.
 */
async function readRange(tabName: string, range?: string): Promise<string[][]> {
  const fullRange = range ? `${tabName}!${range}` : tabName
  const accessToken = await getAccessToken()
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(fullRange)}`

  const response = await fetch(url, {
    cache: 'no-store',
    headers: { 'Authorization': `Bearer ${accessToken}` },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Google Sheets API error (${response.status}): ${errorText}`)
  }

  const data = await response.json()
  return data.values || []
}

/**
 * Read a sheet tab and return as array of objects using header row as keys.
 */
async function readTabAsObjects<T extends Record<string, string>>(
  tabName: string
): Promise<T[]> {
  const rows = await readRange(tabName)
  if (rows.length < 2) return []

  const headers = rows[0]
  return rows.slice(1).map((row) => {
    const obj: Record<string, string> = {}
    headers.forEach((header, i) => {
      obj[header] = row[i] || ''
    })
    return obj as T
  })
}

// ─── Write helpers (Service Account JWT auth) ────────────────────────────────

/**
 * Create a JWT for Google Service Account authentication.
 */
async function createServiceAccountJWT(): Promise<string> {
  if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
    throw new Error('Google Service Account credentials not configured')
  }

  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'RS256', typ: 'JWT' }
  const payload = {
    iss: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }

  const encodeBase64Url = (obj: unknown): string => {
    const json = JSON.stringify(obj)
    return btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  }

  const headerB64 = encodeBase64Url(header)
  const payloadB64 = encodeBase64Url(payload)
  const signingInput = `${headerB64}.${payloadB64}`

  // Import the private key and sign
  const pemKey = GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
  const pemContents = pemKey
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '')

  const binaryKey = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0))

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(signingInput)
  )

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  return `${signingInput}.${signatureB64}`
}

/**
 * Get an OAuth2 access token using Service Account JWT.
 */
let cachedAccessToken: { token: string; expiresAt: number } | null = null

async function getAccessToken(): Promise<string> {
  if (cachedAccessToken && Date.now() < cachedAccessToken.expiresAt - 60_000) {
    return cachedAccessToken.token
  }

  const jwt = await createServiceAccountJWT()

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Google OAuth error (${response.status}): ${errorText}`)
  }

  const data = await response.json()
  cachedAccessToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  }

  return cachedAccessToken.token
}

/**
 * Update a cell range in Google Sheets using Service Account credentials.
 */
async function updateRange(
  tabName: string,
  range: string,
  values: string[][]
): Promise<void> {
  const token = await getAccessToken()
  const fullRange = `${tabName}!${range}`
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(fullRange)}?valueInputOption=USER_ENTERED`

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ range: fullRange, majorDimension: 'ROWS', values }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Google Sheets write error (${response.status}): ${errorText}`)
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Get all trainees from the "Trainee List" tab.
 */
export async function getTrainees(): Promise<TraineeRow[]> {
  const rows = await readRange('Trainee List')
  if (rows.length < 2) return []

  const headers = rows[0]
  return rows.slice(1)
    .filter((row) => row[0] && row[0].trim() !== '') // skip empty rows
    .map((row) => ({
      fullName: row[headers.indexOf('Full Name')] || '',
      email: row[headers.indexOf('Email Address')] || '',
      role: row[headers.indexOf('Role')] || '',
      country: row[headers.indexOf('Country')] || '',
      trainingStartDate: row[headers.indexOf('Training Start Date')] || '',
      expectedEndDate: row[headers.indexOf('Expected End Date')] || '',
      status: row[headers.indexOf('Status')] || '',
      emailSentDate: row[headers.indexOf('Email Sent Date')] || '',
      coachName: row[headers.indexOf('Coach Name')] || '',
      coachEmail: row[headers.indexOf('Coach Email')] || '',
      batchChatId: row[headers.indexOf('Batch Chat ID')] || '',
    }))
}

/**
 * Get assessment schedule configuration.
 */
export async function getAssessmentConfig(): Promise<AssessmentConfigRow[]> {
  const rows = await readRange('Assessment Schedule Configuration')
  if (rows.length < 2) return []

  const headers = rows[0]
  return rows.slice(1)
    .filter((row) => row[0] && row[0].trim() !== '')
    .map((row) => ({
      role: row[headers.indexOf('Role')] || '',
      assessmentName: row[headers.indexOf('Assessment Name')] || '',
      scheduleDay: parseInt(row[headers.indexOf('Schedule Day')] || '0', 10),
      formLink: row[headers.indexOf('Form Link')] || '',
      instructions: row[headers.indexOf('Instructions')] || '',
      evaluateBy: row[headers.indexOf('Evaluate By?')] || '',
      deadlineTime: row[headers.indexOf('Deadline Time')] || '',
    }))
}

/**
 * Get all scores from "Individual Progress" tab.
 */
export async function getScores(): Promise<ScoreRow[]> {
  const rows = await readRange('Individual Progress')
  if (rows.length < 2) return []

  const headers = rows[0]
  return rows.slice(1)
    .filter((row) => row[0] && row[0].trim() !== '')
    .map((row) => ({
      timestamp: row[headers.indexOf('Timestamp')] || '',
      traineeName: row[headers.indexOf('Trainee Name')] || '',
      email: row[headers.indexOf('Email')] || '',
      role: row[headers.indexOf('Role')] || '',
      assessmentName: row[headers.indexOf('Assessment Name')] || '',
      score: parseFloat(row[headers.indexOf('Score')] || '0'),
      passFail: row[headers.indexOf('Pass/Fail')] || '',
      attemptNumber: parseInt(row[headers.indexOf('Attempt Number')] || '1', 10),
      coachName: row[headers.indexOf('Coach Name')] || '',
      coachEmail: row[headers.indexOf('Coach Email')] || '',
      remarks: row[headers.indexOf('Remarks')] || '',
    }))
}

/**
 * Update a trainee's status in the "Trainee List" tab.
 * Finds the row by email and updates the Status and Email Sent Date columns.
 */
export async function updateTraineeStatus(
  email: string,
  newStatus: string,
  emailSentDate?: string
): Promise<void> {
  const rows = await readRange('Trainee List')
  if (rows.length < 2) throw new Error('Trainee List is empty')

  const headers = rows[0]
  const emailColIndex = headers.indexOf('Email Address')
  const statusColIndex = headers.indexOf('Status')
  const emailSentDateColIndex = headers.indexOf('Email Sent Date')

  if (emailColIndex === -1 || statusColIndex === -1) {
    throw new Error('Required columns not found in Trainee List')
  }

  // Find the row index (1-indexed for Sheets, +1 for header)
  const rowIndex = rows.findIndex(
    (row, i) => i > 0 && row[emailColIndex]?.toLowerCase() === email.toLowerCase()
  )

  if (rowIndex === -1) {
    throw new Error(`Trainee not found: ${email}`)
  }

  // Sheets uses 1-indexed rows, the header is row 1
  const sheetRowNumber = rowIndex + 1

  // Update Status column
  const statusCol = String.fromCharCode(65 + statusColIndex) // A=65
  await updateRange('Trainee List', `${statusCol}${sheetRowNumber}`, [[newStatus]])

  // Update Email Sent Date if provided
  if (emailSentDate && emailSentDateColIndex !== -1) {
    const dateCol = String.fromCharCode(65 + emailSentDateColIndex)
    await updateRange('Trainee List', `${dateCol}${sheetRowNumber}`, [[emailSentDate]])
  }
}

// ─── Utility functions ──────────────────────────────────────────────────────

/**
 * Calculate business day number (Mon-Fri) from training start date to today.
 * Returns 0 if training hasn't started yet.
 */
export function calculateTrainingDay(trainingStartDate: string): number {
  if (!trainingStartDate) return 0

  const start = new Date(trainingStartDate)
  start.setHours(0, 0, 0, 0)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (today < start) return 0

  let businessDays = 0
  const current = new Date(start)

  while (current <= today) {
    const dayOfWeek = current.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      businessDays++
    }
    current.setDate(current.getDate() + 1)
  }

  return businessDays
}

/**
 * Format a date as YYYY-MM-DD.
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Check if today is a business day (Mon-Fri).
 */
export function isBusinessDay(date?: Date): boolean {
  const d = date || new Date()
  const day = d.getDay()
  return day !== 0 && day !== 6
}
