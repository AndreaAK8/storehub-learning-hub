# Unified Google Sheet Structure

## Current Problem
You have data scattered across multiple sheets:
- Master New Hire List (multiple tabs)
- Performance Dashboard (multiple tabs)
- Assessment Scores
- Various notification logs

## Proposed: ONE Master Sheet

**Sheet Name:** `Training LMS Master - 2026`

---

## Tab Structure

### Tab 1: `Trainees`
Main trainee registry - one row per trainee

| Column | Description | Example |
|--------|-------------|---------|
| trainee_id | Auto-generated | TRN-001 |
| full_name | Trainee name | John Smith |
| email | Work email | john.smith@storehub.com |
| role | Training role | Onboarding Coordinator |
| role_code | Short code | OC |
| country | MY/PH/TH | MY |
| training_start_date | Start date | 2026-01-19 |
| expected_end_date | Auto-calculated | 2026-01-22 |
| actual_end_date | When graduated | |
| current_day | Current training day | 3 |
| status | Training status | in_progress |
| coach_name | Assigned coach | Andrea K. |
| coach_email | Coach email | andrea.kaur@storehub.com |
| manager_name | Reporting manager | |
| manager_email | Manager email | |
| created_at | Record created | 2026-01-15 |
| notes | Any notes | |

**Status values:** `pending`, `in_progress`, `completed`, `extended`, `terminated`

---

### Tab 2: `Schedule_Adjustments`
Track all reschedules - audit trail

| Column | Description | Example |
|--------|-------------|---------|
| adjustment_id | Auto-generated | ADJ-001 |
| trainee_email | Link to trainee | john.smith@storehub.com |
| original_day | Original day | 3 |
| new_day | New day | 4 |
| activity_name | What was moved | Hardware Assessment |
| reason_code | Reason category | external |
| reason_detail | Specific reason | Coach unavailable |
| notes | Additional notes | Coach on client visit |
| adjusted_by | Who made change | andrea.kaur@storehub.com |
| adjusted_at | When changed | 2026-01-20 10:30:00 |

**Reason codes:**
- `external` - Coach/Buddy/Trainer not available
- `leave` - Trainee on planned leave
- `sick` - Trainee sick/MC
- `pace` - Extended learning time needed
- `other` - Other (see notes)

---

### Tab 3: `Assessment_Config`
Assessment definitions per role (static config)

| Column | Description | Example |
|--------|-------------|---------|
| role | Role name | Onboarding Coordinator |
| role_code | Short code | OC |
| assessment_name | Assessment | Hardware Assessment |
| schedule_day | Default day | 3 |
| form_link | Google Form URL | https://forms.gle/xxx |
| instructions | Brief instructions | Demonstrate hardware setup |
| passing_score | Minimum pass | 80 |
| weight_percent | Score weight | 15 |
| max_attempts | Max retakes | 3 |
| deadline_time | Due time | 18:30 |

---

### Tab 4: `Assessment_Scores`
Individual assessment attempts and scores

| Column | Description | Example |
|--------|-------------|---------|
| score_id | Auto-generated | SCR-001 |
| trainee_email | Link to trainee | john.smith@storehub.com |
| assessment_name | Which assessment | Hardware Assessment |
| attempt_number | Which attempt | 1 |
| score | Score achieved | 85 |
| passed | Yes/No | Yes |
| evaluated_by | Coach email | andrea.kaur@storehub.com |
| evaluated_at | When scored | 2026-01-20 16:00:00 |
| feedback | Coach feedback | Good hardware knowledge |
| form_response_id | Google Form ID | abc123 |

---

### Tab 5: `Coach_Directory`
Coach assignments by role and country

| Column | Description | Example |
|--------|-------------|---------|
| coach_name | Coach name | Andrea Kaur |
| coach_email | Coach email | andrea.kaur@storehub.com |
| role | Role they coach | Onboarding Coordinator |
| role_code | Short code | OC |
| country | Country | MY |
| is_primary | Primary coach? | Yes |
| is_active | Currently active? | Yes |

---

### Tab 6: `Notification_Log`
Track all emails sent (for deduplication)

| Column | Description | Example |
|--------|-------------|---------|
| log_id | Auto-generated | LOG-001 |
| notification_type | Type of email | daily_digest |
| recipient_email | Who received | andrea.kaur@storehub.com |
| trainee_email | Related trainee | john.smith@storehub.com |
| subject | Email subject | Today's Assessments |
| sent_at | When sent | 2026-01-20 09:30:00 |
| status | Sent/Failed | sent |

**Notification types:**
- `welcome` - Welcome email
- `role_overview` - Day 2 role overview
- `daily_digest` - Daily assessment digest
- `reminder` - Incomplete assessment reminder
- `completion` - Training completion

---

### Tab 7: `Reflections`
Trainee self-reflections

| Column | Description | Example |
|--------|-------------|---------|
| reflection_id | Auto-generated | REF-001 |
| trainee_email | Who submitted | john.smith@storehub.com |
| day_number | Which day | 3 |
| confusing_topic | What was confusing | Network troubleshooting |
| improvement | What to do differently | Take more notes |
| confidence_level | 1-5 rating | 4 |
| submitted_at | When submitted | 2026-01-20 18:00:00 |

---

### Tab 8: `Performance_Summary`
Calculated summary (can be auto-generated)

| Column | Description | Example |
|--------|-------------|---------|
| trainee_email | Link to trainee | john.smith@storehub.com |
| total_assessments | Total required | 3 |
| completed_assessments | Completed | 2 |
| passed_assessments | Passed | 2 |
| failed_assessments | Failed | 0 |
| weighted_score | Final score | 87.5 |
| on_track | Yes/No | Yes |
| days_extended | Extra days | 0 |
| last_updated | Auto-update | 2026-01-20 |

---

## Migration Steps

1. **Create new Google Sheet** with above tabs
2. **Copy existing data** from old sheets to new structure
3. **Update n8n workflows** to point to new sheet
4. **Update LMS API** to use new sheet structure
5. **Archive old sheets** (don't delete yet)

---

## Benefits

| Before | After |
|--------|-------|
| 5+ separate spreadsheets | 1 unified sheet |
| Data scattered | Single source of truth |
| Hard to track reschedules | Full audit trail |
| Manual status updates | Automated via n8n/LMS |
| No reason tracking | Clear reason categories |
