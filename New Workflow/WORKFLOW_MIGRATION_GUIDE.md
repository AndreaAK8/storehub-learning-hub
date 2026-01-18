# n8n Workflow Migration Guide

## New Unified Sheet
**Sheet ID:** `1IFAAelyD_x2uCOQKcbj8n7wgizNtVirAYbqCv67Y468`
**Sheet Name:** Training LMS Master - 2026

---

## Old Sheet Mappings

### Sheet 1: Master New Hire List
- **Old ID:** `1ygEYNDbhmtaqjXhO7K_GfWwYK2WtV_erws7n52cWUZA`
- **Old Tab:** `New Hire List`
- **New Tab:** `Trainees`

**Used in:**
- Win 1 (Welcome)
- Win 1.5 (Role Overview)
- Win 2 (Assessment Scheduler) - REPLACED by Win 2.1
- Win 3 (Incomplete Assessment Alerter)
- Win 4 (Score Aggregator)
- Win 6 (AI Feedback)
- API: Fetch Trainees
- API: Update Trainee

---

### Sheet 2: Assessment Responses
- **Old ID:** `1bA5ljjILFVBS9caa7_6PIf4nL4FS3sr7UDqohnXFC8o`
- **Old Tabs:** Multiple tabs per role (e.g., "BC Responses", "CSM Responses", etc.)
- **New Tab:** `Assessment_Scores`

**Used in:**
- Win 2.5 (Score Notification)
- Win 4 (Score Aggregator)

---

### Sheet 3: Performance Dashboard
- **Old ID:** `13R0oJBp7PfgLjV2gjI_nH3ZEZc40xEzhue6JebsT2G8`
- **Old Tabs:** Various performance tabs
- **New Tab:** `Performance_Summary`

**Used in:**
- Win 2.5 (Score Notification)
- Win 3 (Incomplete Assessment Alerter)
- Win 4 (Score Aggregator)
- API: Performance Reports

---

### Sheet 4: Feedback Responses
- **Old ID:** `1Eels0RtYr6ixYzsRjOxIHVpqR92XjCJoEirvOqQwXcI`
- **Old Tabs:** Feedback response tabs
- **New Tab:** (Not migrated - keep separate for now or add `Feedback_Responses` tab)

**Used in:**
- Win 6 (AI Feedback Analysis)

---

## Tab Name Mapping (Quick Reference)

| Old Tab Name | New Tab Name (Actual) |
|-------------|----------------------|
| New Hire List | Trainees (verify gid) |
| [Role] Responses | Assessments Scores |
| Performance Summary | Performance Summary |
| Coach Directory | Coach & Managers Directory |
| N/A (new) | Schedule Adjustments |
| N/A (new) | Assessment Schedule Configuration |
| N/A (new) | Notification Log |
| N/A (new) | Reflections |

**Note:** Tab names in your sheet may have spaces instead of underscores.

---

## Workflow Update Priority

### Priority 1: Critical for Pilot (Jan 19)
1. **Win 2.1** - Already uses new sheet (DONE)
2. **API: Fetch Trainees** - Simple update
3. **Win 1** - Welcome emails

### Priority 2: Important
4. **Win 2.5** - Score notifications
5. **Win 3** - Incomplete assessment alerts
6. **Win 4** - Final reports

### Priority 3: Can Wait
7. **Win 6** - AI Feedback (uses separate feedback sheet)
8. **Win 1.5** - Optional reminder

---

## Update Steps in n8n

For each workflow:

1. **Open workflow in n8n Cloud**
2. **Find Google Sheets nodes** (yellow nodes)
3. **Update each node:**
   - Change Document ID to: `1IFAAelyD_x2uCOQKcbj8n7wgizNtVirAYbqCv67Y468`
   - Change Sheet Name to new tab name (see mapping above)
4. **Test with sample data**
5. **Save and activate**

---

## Column Name Changes

### Trainees Tab (was New Hire List)
| Old Column | New Column |
|-----------|-----------|
| Name | full_name |
| Email | email |
| Role | role |
| Training Start Date | training_start_date |
| Current Day | current_day |
| Status | status |
| Assigned Coach | coach_name |
| Coach Email | coach_email |

### Assessment_Scores Tab (was [Role] Responses)
| Old Column | New Column |
|-----------|-----------|
| Timestamp | evaluated_at |
| Email Address | trainee_email |
| Score | score |
| N/A (new) | assessment_name |
| N/A (new) | attempt_number |
| N/A (new) | passed |

---

## Verification Checklist

After updating each workflow:

- [ ] Test trigger works
- [ ] Data fetches correctly from new tabs
- [ ] Email sends with correct data
- [ ] No errors in execution log

---

## Notes

- Win 2 (old Assessment Scheduler) is being **replaced** by Win 2.1 (Daily Digest)
- Keep old workflows as backup until new ones are verified
- The unified sheet simplifies future maintenance
