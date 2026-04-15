# LMS Improvement Ideas
> Captured: Apr 13, 2026 — revisit anytime

---

## 🚨 Critical Fixes (Do First)
- [ ] **Win 2.6 - Score Submit & Coach Notify** — No active n8n workflow at `/webhook/scores/submit`. Score submissions are currently broken (never written to Sheets). New workflow should: (1) count attempts, (2) append to Assessment_Scores tab, (3) send coach a beautiful HTML confirmation email immediately.
- [ ] **Win 2 & Win 1.5** — Still reading from OLD 2025 sheet. Need tab references updated to new 2026 master sheet.

---

## 📧 Email Flow Improvements

### Coach Score Confirmation Email (Win 2.6)
After a coach submits a score in LMS, send them an immediate card-style HTML email:
- Trainee name, assessment name, score, pass/fail badge
- Attempt number (e.g. "Attempt #2 — improved 12% from first attempt")
- Pass = green card. Fail = amber card + "Another attempt can be scheduled"
- Link back to LMS trainee page
- CC trainee if passed ("Here's how you did" copy)
- On fail: email trainee with what to review + retry encouragement

### Trainee Score Feedback Email
- If passed: celebratory email with score + what's next
- If failed: supportive email with what to review, retry guidance
- Triggered automatically from Win 2.6 after score write

### Andrea's Morning Briefing (8 AM digest)
- One daily email to Andrea (not coaches)
- 3-line summary per active trainee: Day X of Y, assessments due today, risk flag
- Different from Win 2 (which goes to coaches)

---

## 🧠 Trainee Dashboard Improvements

### Trainees Can See Their Own Scores
- Currently scores are only visible to coaches/admins
- Trainees should see "You scored 87% on Care Mock Test — Passed ✅" in their ActivityCard
- Closes the feedback loop, makes the LMS actually useful to them

### Score Visibility Timeline
- Trainee sees a timeline: "Day 3 — Passed Care Mock Test (87%) → Day 4 — Passed Hardware Setup (92%)"
- Visual progress feel, motivating

---

## ⚡ Automation Logic Improvements

### Auto-trigger Win 4 on Completion
- When last assessment passes → automatically fire Win 4 (final report)
- Currently requires manual trigger from LMS
- Condition: all required assessments passed → call `/webhook/final-report`

### Win 1.5 Should Respect Reschedules
- Currently fires every day for anyone on Day 2 regardless of schedule adjustments
- Should check `schedule_adjustments` table before sending
- Prevents trainees getting Day 2 email on wrong day

### Completion Milestone Emails
- Day 2 check-in email to trainee (what did you learn? what's next?)
- Midpoint email (halfway there, here's your progress)
- All powered by n8n scheduled triggers checking training days

---

## 🔧 Technical / UX Improvements

### Auto-detect Coach from Coach_Directory
- Coach assignment should be looked up automatically from `Coach_Directory` tab
- Currently coach email is manually typed in score submission form
- Risk: wrong coach gets attributed to a score

### Leaderboard (Gamification)
- Anonymous or named comparison with batch peers
- XP comparison, assessment scores, completion rate
- Motivates healthy competition

### Streaks
- Daily login streaks with bonus XP
- "🔥 5-day streak! Keep going"

### Push/Browser Notifications
- Assessment due reminders in-browser
- Score received notification

### Video Progress Tracking
- Track % watched, not just "completed"
- Require 80% watched before marking complete

### Dark Mode
- Theme toggle for trainee dashboard

### Custom Avatars
- Profile photo / avatar customization for trainees

---

## 🏗️ Coach Dashboard (Paused — Build Later)
- Assigned trainee list with progress at a glance
- Pending scores widget
- Quick score submission from dashboard
- Score history per trainee
- For now: coaches get everything via email (Win 2.6)

---

## 📦 Skills from skills.sh to Add
| Skill | Purpose |
|-------|---------|
| `frontend-design` | Polish trainee dashboard — spacing, hierarchy, mobile |
| `web-design-guidelines` | Consistent design system (colours, typography) |
| `webapp-testing` | Catch broken flows before trainees hit them |
| `playwright-best-practices` | Automate full trainee/coach flow testing |
| `pdf` | Improve certificate export quality |
| `email-sequence` | Design the full email journey as a coherent sequence |

---

## 📋 Roles Still to Populate in LMS
| Role | Short Code | Days | Status |
|------|------------|------|--------|
| Onboarding Coordinator | OC | 4 | ✅ Ready |
| Customer Success Manager | CSM | 10 | ⏳ Pending |
| Business Consultant | BC | 12 | ⏳ Pending |
| Merchant Consultant | MC | 8 | ⏳ Pending |
| Technical Support | TS | 6 | ⏳ Pending |
