/**
 * Score Consolidator for StoreHub Training LMS
 *
 * This Google Apps Script reads all assessment form response tabs from the
 * Master Assessment Scores spreadsheet, normalizes the data, and appends
 * new scores to the Individual Progress tab in Training LMS Master.
 *
 * HOW TO SET UP:
 * 1. Open Training LMS Master spreadsheet
 * 2. Extensions > Apps Script
 * 3. Paste this entire script
 * 4. Create a time-driven trigger: consolidateScores() every 5 minutes
 *
 * SPREADSHEET IDs:
 * - Assessment Forms: 1bA5ljjILFVBS9caa7_6PIf4nL4FS3sr7UDqohnXFC8o
 * - Training LMS Master (Individual Progress): 1IFAAelyD_x2uCOQKcbj8n7wgizNtVirAYbqCv67Y468
 */

// ============ CONFIG ============

const ASSESSMENT_SHEET_ID = '1bA5ljjILFVBS9caa7_6PIf4nL4FS3sr7UDqohnXFC8o';
const LMS_MASTER_SHEET_ID = '1IFAAelyD_x2uCOQKcbj8n7wgizNtVirAYbqCv67Y468';
const PROGRESS_TAB_NAME = 'Individual Progress';
const TRAINEE_LIST_TAB_NAME = 'Trainee List';
const PASS_THRESHOLD = 80;

// Tabs to SKIP (not form responses)
const SKIP_TABS = [
  'Notification Log',
  'Individual Progress',
  '[Master] Assessment Tracker',
  'Coach & Managers Directory',
  'New Hire List',
  'Trainees',
  'Trainee List',
  'Coach_Directory',
  'Assessment_Config',
  'Performance_Summary',
  'Schedule_Adjustments',
  'Assessments Scores'
];

// Tab-specific config: where to find fields
// Pattern: { scoreCol, nameCol, emailCol, coachCol, typeCol }
// Use column HEADER NAME (not index) — the script will find the column by header
const TAB_CONFIG = {
  // === SELF-SUBMIT QUIZZES (trainee submits, no coach, no name) ===
  'Foundation Quiz': {
    type: 'self-submit',
    scoreHeader: 'Score',
    emailHeader: 'Email Address'
  },
  'All in One Quiz - 2026': {
    type: 'self-submit',
    scoreHeader: 'Score',
    emailHeader: 'Email Address'
  },
  'Training Assessment (F&B)': {
    type: 'self-submit',
    scoreHeader: 'Score',
    emailHeader: 'Email Address'
  },
  'Training Assessment (Retail)': {
    type: 'self-submit',
    scoreHeader: 'Score',
    emailHeader: 'Email Address'
  },
  'Advance System & Networking Quiz': {
    type: 'self-submit',
    scoreHeader: 'Score',
    emailHeader: 'Email Address'
  },

  // === SC FORMS (older pattern: Score col 3, Assessment Type col 7) ===
  '[SC] Mock Test': {
    type: 'coach-submit',
    scoreHeader: 'Score',
    nameHeader: 'New Hire Full Name',
    emailHeader: 'New Hire Email',
    coachHeader: 'Coach Name',
    assessmentTypeHeader: 'Assessment Type'
  },
  '[SC] Objection Handling': {
    type: 'coach-submit',
    scoreHeader: 'Score',
    nameHeader: 'New Hire Full Name',
    emailHeader: 'New Hire Email',
    coachHeader: 'Coach Name',
    assessmentTypeHeader: 'Assessment Type'
  },
  '[SC] Full Call Assessment': {
    type: 'coach-submit',
    scoreHeader: 'Score',
    nameHeader: 'New Hire Full Name',
    emailHeader: 'New Hire Email',
    coachHeader: 'Coach Name',
    assessmentTypeHeader: 'Assessment Type'
  },

  // === BC FORMS (newer pattern: Assessment Type col 7, Score col 8) ===
  '[BC] Pitching': {
    type: 'coach-submit',
    scoreHeader: 'Score',
    nameHeader: 'New Hire Full Name',
    emailHeader: 'New Hire Email',
    coachHeader: 'Coach Name',
    assessmentTypeHeader: 'Assessment Type'
  },
  '[BC] SPIN': {
    type: 'coach-submit',
    scoreHeader: 'Score',
    nameHeader: 'New Hire Full Name',
    emailHeader: 'New Hire Email',
    coachHeader: 'Coach Name',
    assessmentTypeHeader: 'Assessment Type'
  },
  '[BC] Closing': {
    type: 'coach-submit',
    scoreHeader: 'Score',
    nameHeader: 'New Hire Full Name',
    emailHeader: 'New Hire Email',
    coachHeader: 'Coach Name',
    assessmentTypeHeader: 'Attempt' // BC Closing uses "Attempt" column
  },
  '[BC] Full Pitching': {
    type: 'coach-submit',
    scoreHeader: 'Score',
    nameHeader: 'New Hire Full Name',
    emailHeader: 'New Hire Email',
    coachHeader: 'Coach Name',
    assessmentTypeHeader: 'Assessment Type'
  },
  '[BC] Mock Test': {
    type: 'coach-submit',
    scoreHeader: 'Score',
    nameHeader: 'New Hire Full Name',
    emailHeader: 'New Hire Email',
    coachHeader: 'Coach Name',
    assessmentTypeHeader: 'Assessment Type'
  },

  // === HARDWARE (unique: Score col 3, Coach col 7, no assessment type) ===
  'Hardware Setup': {
    type: 'coach-submit',
    scoreHeader: 'Score',
    nameHeader: 'New Hire Full Name',
    emailHeader: 'New Hire Email',
    coachHeader: 'Coach Name'
    // No assessmentTypeHeader — use tab name
  },

  // === CARE (unique: no Dept/Role, Coach col 5, Assessment Type col 6) ===
  'Care Mock Test': {
    type: 'coach-submit',
    scoreHeader: 'Score',
    nameHeader: 'New Hire Full Name',
    emailHeader: 'New Hire Email',
    coachHeader: 'Coach Name',
    assessmentTypeHeader: 'Assessment Type'
  },

  // === MOM / WELCOME / GO LIVE (Score is trailing column) ===
  'Welcome Call Assessment': {
    type: 'coach-submit',
    scoreHeader: 'Score',
    nameHeader: 'New Hire Full Name',
    emailHeader: 'New Hire Email',
    coachHeader: 'Coach Name'
    // No assessmentTypeHeader — use tab name
  },
  'Go Live Call Assessment': {
    type: 'coach-submit',
    scoreHeader: 'Score',
    nameHeader: 'New Hire Full Name',
    emailHeader: 'New Hire Email',
    coachHeader: 'Coach Name'
    // No assessmentTypeHeader — use tab name
  },

  // === CSM ===
  'Customer Success Manager - Roleplay': {
    type: 'coach-submit',
    scoreHeader: 'Score',
    nameHeader: 'New Hire Full Name',
    emailHeader: 'New Hire Email',
    coachHeader: 'Coach Name',
    assessmentTypeHeader: 'Assessment Type'
  },
  'CSM Assessment': {
    type: 'coach-submit',
    scoreHeader: 'Score',
    nameHeader: 'New Hire Full Name',
    emailHeader: 'New Hire Email',
    coachHeader: 'Coach Name'
    // No assessmentTypeHeader — use tab name
  }
};

// ============ MAIN FUNCTION ============

function consolidateScores() {
  const assessmentSS = SpreadsheetApp.openById(ASSESSMENT_SHEET_ID);
  const lmsMasterSS = SpreadsheetApp.openById(LMS_MASTER_SHEET_ID);

  // Get or create Individual Progress tab
  let progressSheet = lmsMasterSS.getSheetByName(PROGRESS_TAB_NAME);
  if (!progressSheet) {
    progressSheet = lmsMasterSS.insertSheet(PROGRESS_TAB_NAME);
    progressSheet.appendRow([
      'Timestamp', 'Trainee Name', 'Email', 'Role', 'Assessment Name',
      'Score', 'Pass/Fail', 'Attempt Number', 'Coach Name', 'Coach Email', 'Remarks'
    ]);
    // Bold headers
    progressSheet.getRange(1, 1, 1, 11).setFontWeight('bold');
  }

  // Load existing progress rows to prevent duplicates
  const existingData = progressSheet.getDataRange().getValues();
  const existingKeys = new Set();
  for (let i = 1; i < existingData.length; i++) {
    const row = existingData[i];
    // Key: email + assessment name + timestamp
    const key = `${String(row[2]).toLowerCase().trim()}|${String(row[4]).trim()}|${String(row[0]).trim()}`;
    existingKeys.add(key);
  }

  // Load trainee list for name/role/coach lookup (for self-submit quizzes)
  const traineeSheet = lmsMasterSS.getSheetByName(TRAINEE_LIST_TAB_NAME);
  const traineeMap = {};
  if (traineeSheet) {
    const traineeData = traineeSheet.getDataRange().getValues();
    const traineeHeaders = traineeData[0];
    for (let i = 1; i < traineeData.length; i++) {
      const row = traineeData[i];
      const email = String(getColValue(traineeHeaders, row, 'Email Address') || '').toLowerCase().trim();
      if (email) {
        traineeMap[email] = {
          name: getColValue(traineeHeaders, row, 'Full Name') || '',
          role: getColValue(traineeHeaders, row, 'Role') || '',
          coachName: getColValue(traineeHeaders, row, 'Coach Name') || '',
          coachEmail: getColValue(traineeHeaders, row, 'Coach Email') || ''
        };
      }
    }
  }

  // Process each assessment tab
  const allTabs = assessmentSS.getSheets();
  const newRows = [];

  for (const sheet of allTabs) {
    const tabName = sheet.getName();

    // Skip non-form tabs
    if (SKIP_TABS.includes(tabName)) continue;

    // Get config for this tab
    let config = TAB_CONFIG[tabName];

    // If no config found, try partial match
    if (!config) {
      for (const [key, val] of Object.entries(TAB_CONFIG)) {
        if (tabName.includes(key) || key.includes(tabName)) {
          config = val;
          break;
        }
      }
    }

    // If still no config, use a generic fallback
    if (!config) {
      config = {
        type: 'unknown',
        scoreHeader: 'Score',
        emailHeader: 'Email Address'
      };
    }

    // Read the sheet data
    const data = sheet.getDataRange().getValues();
    if (data.length < 2) continue; // Skip empty sheets

    const headers = data[0].map(h => String(h).trim());

    // Find column indices by header name
    const scoreIdx = findColumnIndex(headers, config.scoreHeader || 'Score');
    const emailIdx = findColumnIndex(headers, config.emailHeader || 'Email Address');
    const nameIdx = config.nameHeader ? findColumnIndex(headers, config.nameHeader) : -1;
    const coachIdx = config.coachHeader ? findColumnIndex(headers, config.coachHeader) : -1;
    const typeIdx = config.assessmentTypeHeader ? findColumnIndex(headers, config.assessmentTypeHeader) : -1;

    if (scoreIdx === -1 || emailIdx === -1) continue; // Can't process without score and email

    // Process each row
    for (let i = 1; i < data.length; i++) {
      const row = data[i];

      // Skip empty rows
      const email = String(row[emailIdx] || '').trim().toLowerCase();
      if (!email || !email.includes('@')) continue;

      const timestamp = row[0] ? formatTimestamp(row[0]) : '';
      if (!timestamp) continue;

      // Get score as whole number percentage
      const score = normalizeScore(row[scoreIdx]);
      if (score === null) continue; // Skip if no valid score

      // Determine assessment name
      let assessmentName = '';
      if (typeIdx !== -1 && row[typeIdx]) {
        assessmentName = String(row[typeIdx]).trim();
      } else {
        // Use tab name, clean up brackets
        assessmentName = tabName.replace(/^\[.*?\]\s*/, '').trim() || tabName;
      }

      // Get trainee info
      let traineeName = '';
      let role = '';
      let coachName = '';
      let coachEmail = '';

      if (config.type === 'self-submit') {
        // Look up from trainee list
        const trainee = traineeMap[email];
        if (trainee) {
          traineeName = trainee.name;
          role = trainee.role;
          coachName = trainee.coachName;
          coachEmail = trainee.coachEmail;
        }
      } else {
        // Coach-submitted: get from form row
        traineeName = nameIdx !== -1 ? String(row[nameIdx] || '').trim() : '';
        coachName = coachIdx !== -1 ? String(row[coachIdx] || '').trim() : '';

        // Look up role and coach email from trainee list
        const trainee = traineeMap[email];
        if (trainee) {
          role = trainee.role;
          coachEmail = trainee.coachEmail;
          if (!traineeName) traineeName = trainee.name;
          if (!coachName) coachName = trainee.coachName;
        }
      }

      // Pass/Fail
      const passFail = score >= PASS_THRESHOLD ? 'Pass' : 'Fail';

      // Check for duplicates
      const key = `${email}|${assessmentName}|${timestamp}`;
      if (existingKeys.has(key)) continue;

      // Calculate attempt number
      let attemptNumber = 1;
      // Count existing rows with same email + assessment name
      for (let j = 1; j < existingData.length; j++) {
        const existEmail = String(existingData[j][2]).toLowerCase().trim();
        const existAssessment = String(existingData[j][4]).trim();
        if (existEmail === email && existAssessment === assessmentName) {
          attemptNumber++;
        }
      }
      // Also count from new rows we're about to add
      for (const newRow of newRows) {
        if (String(newRow[2]).toLowerCase().trim() === email &&
            String(newRow[4]).trim() === assessmentName) {
          attemptNumber++;
        }
      }

      const newRow = [
        timestamp,       // Timestamp
        traineeName,     // Trainee Name
        email,           // Email
        role,            // Role
        assessmentName,  // Assessment Name
        score + '%',     // Score (whole number %)
        passFail,        // Pass/Fail
        attemptNumber,   // Attempt Number
        coachName,       // Coach Name
        coachEmail,      // Coach Email
        ''               // Remarks
      ];

      newRows.push(newRow);
      existingKeys.add(key);
    }
  }

  // Append new rows to Individual Progress
  if (newRows.length > 0) {
    const startRow = progressSheet.getLastRow() + 1;
    progressSheet.getRange(startRow, 1, newRows.length, 11).setValues(newRows);
    Logger.log(`Consolidated ${newRows.length} new score(s) to Individual Progress`);
  } else {
    Logger.log('No new scores to consolidate');
  }

  return newRows.length;
}


// ============ HELPER FUNCTIONS ============

/**
 * Find column index by header name (case-insensitive, partial match)
 */
function findColumnIndex(headers, headerName) {
  const target = headerName.toLowerCase().trim();

  // Exact match first
  for (let i = 0; i < headers.length; i++) {
    if (headers[i].toLowerCase().trim() === target) return i;
  }

  // Partial match (for cases like "Score" matching "Score (out of 100)")
  for (let i = 0; i < headers.length; i++) {
    if (headers[i].toLowerCase().trim().startsWith(target)) return i;
  }

  return -1;
}

/**
 * Get column value by header name
 */
function getColValue(headers, row, headerName) {
  const idx = findColumnIndex(headers.map(h => String(h)), headerName);
  return idx !== -1 ? row[idx] : null;
}

/**
 * Normalize score to whole number percentage (no decimals)
 * Handles: "85%", "85", 0.85, "80 / 100", "23 / 35"
 */
function normalizeScore(rawScore) {
  if (rawScore === null || rawScore === undefined || rawScore === '') return null;

  const str = String(rawScore).trim();

  // Handle "X / Y" format (e.g., "80 / 100", "23 / 35")
  const fractionMatch = str.match(/(\d+\.?\d*)\s*\/\s*(\d+\.?\d*)/);
  if (fractionMatch) {
    const numerator = parseFloat(fractionMatch[1]);
    const denominator = parseFloat(fractionMatch[2]);
    if (denominator === 0) return null;
    return Math.round((numerator / denominator) * 100);
  }

  // Handle percentage string (e.g., "85%", "85.5%")
  const percentMatch = str.match(/(\d+\.?\d*)\s*%/);
  if (percentMatch) {
    return Math.round(parseFloat(percentMatch[1]));
  }

  // Handle plain number
  const num = parseFloat(str);
  if (isNaN(num)) return null;

  // If number is between 0 and 1, treat as decimal (0.85 = 85%)
  if (num >= 0 && num <= 1) {
    return Math.round(num * 100);
  }

  // If number is between 1 and 100, treat as percentage
  if (num >= 1 && num <= 100) {
    return Math.round(num);
  }

  return Math.round(num);
}

/**
 * Format timestamp to consistent string
 */
function formatTimestamp(ts) {
  if (!ts) return '';

  // If it's already a Date object
  if (ts instanceof Date) {
    return Utilities.formatDate(ts, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
  }

  // If it's a string, try to parse it
  const str = String(ts).trim();
  if (!str) return '';

  try {
    const date = new Date(str);
    if (isNaN(date.getTime())) return str; // Return as-is if unparseable
    return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
  } catch (e) {
    return str;
  }
}


// ============ MANUAL TRIGGER FOR TESTING ============

/**
 * Run this manually to test. Check View > Logs for output.
 */
function testConsolidate() {
  const count = consolidateScores();
  Logger.log(`Done. ${count} new scores consolidated.`);
}
