# StoreHub Learning Hub - Coach Dashboard Guide

## What is the Coach Dashboard?

Your command center for managing assigned trainees. See who needs attention, submit assessment scores, and track progress—all in one place.

---

## Objective

Spend less time tracking spreadsheets and chasing updates. The dashboard surfaces what's important so you can focus on coaching, not admin work.

---

## Quick Start

1. **Login** at https://storehub-learning-hub.vercel.app
2. You'll land on your **Coach Dashboard** automatically
3. Check the **stat cards** for immediate action items
4. Use **Score Now** tab to submit assessment scores

---

## Dashboard Overview

### The 3 Stat Cards

| Card | What it Shows | Action |
|------|---------------|--------|
| 🔥 **Needs Attention** | Trainees who are overdue or at-risk + alerts | Click to see list, then click trainee to view details |
| 📝 **Pending Scores** | Trainees with assessments waiting to be graded | Click to jump to scoring |
| ✅ **On Track** | Trainees progressing normally | No action needed |

**Pro tip:** Start your day by checking the red "Needs Attention" card.

---

## Features

### 1. My Trainees Tab

**What it is:** List of all trainees assigned to you.

**How it works:**
- Shows trainee name, role, current day
- **Status badge:** Overdue (red), At Risk (orange), On Track (green)
- **Progress bar:** Visual indicator of assessment completion
- **Quick Actions:**
  - "Submit Score" dropdown → opens Google Form
  - "View" → opens trainee detail page

**Filtering:**
- Search by name or email
- Filter by role (e.g., show only OS trainees)

---

### 2. Score Now Tab

**What it is:** Focused view for submitting assessment scores.

**How it works:**
- Lists trainees with pending assessments
- Shows how many assessments are pending for each trainee
- **Already Submitted Scores:** See what you've already graded with pass/fail status
- **Assessments to Score:** Only shows pending ones (already-scored hidden)
- **Trainee Reflection:** See their latest reflection (what confused them, confidence level)
- **Quick Note:** Add a coaching note without leaving the page

**Workflow:**
1. Click "Score Now" on an assessment
2. Google Form opens in a modal
3. Fill in the score
4. Click "I've Submitted the Score"
5. Score syncs automatically

---

### 3. Stat Card Popups

**Needs Attention Popup:**
- Lists trainees with Overdue/At Risk status
- Shows any alerts (failed assessments, missed deadlines)
- Click trainee name to view their full profile

**Pending Scores Popup:**
- Lists trainees with pending assessments
- Shows count of pending items
- "Score Now" button takes you directly to their scoring

---

### 4. Trainee Detail Page

**How to access:** Click "View" or click a trainee's name

**Sections:**

| Section | What it Shows |
|---------|---------------|
| **Header** | Name, email, department, country, status badge |
| **Stats Grid** | Training day, completion %, activities done, coach name |
| **Training Progress** | Progress bar + completed/remaining/total counts |
| **Training Timeline** | Milestone view of their journey |
| **Assessment Scores** | Chart showing all scores with pass/fail, weightage, learning score |
| **Details** | Start date, expected end date, overdue indicator |

**Activities Done Card:**
- Click to see full list of completed activities
- Shows which day, activity name, and performance (early/on-time/slow)

---

### 5. Assessment Scores Chart

**What it is:** Visual breakdown of a trainee's assessment performance.

**Shows:**
- Overall learning score (% towards 80% pass threshold)
- Each assessment with:
  - Score bar (green = passed, red = failed)
  - Weightage (how much it contributes to final score)
  - Pass/fail indicator
- Pending assessments shown as gray "Pending"

**Understanding the Score:**
- Learning Score = Sum of (Assessment Score × Weight)
- Example: 85% on All-in-One Quiz (50% weight) = 42.5 points
- 80% total = passing threshold

---

### 6. Risk Badges

| Badge | Meaning | Criteria |
|-------|---------|----------|
| 🔴 **Overdue** | Past expected end date | Days in training > role duration |
| 🟠 **At Risk** | Falling behind | Progress significantly behind schedule |
| 🟢 **On Track** | Healthy progress | On pace to complete on time |

**Expected Training Duration by Role:**
| Role | Days |
|------|------|
| Onboarding Coordinator (OC) | 4 |
| Onboarding Specialist (OS) | 7 |
| Merchant Care (MC) | 8 |
| Customer Success Manager (CSM) | 10 |
| Business Consultant (BC) | 12 |

---

### 7. Submitting Scores

**Option A: From My Trainees Tab**
1. Find the trainee
2. Click "Submit Score" dropdown
3. Select the assessment type
4. Fill in the Google Form
5. Click "I've Submitted"

**Option B: From Score Now Tab**
1. Go to "Score Now" tab
2. Find the trainee card
3. Click "Score Now" next to the assessment
4. Fill in the Google Form
5. Click "I've Submitted"

**After Submitting:**
- Score syncs to Google Sheets automatically
- Trainee sees updated score in their "My Scores" page
- Assessment moves from "Pending" to "Submitted" in your view

---

### 8. Quick Notes

**What it is:** Add coaching notes directly from the Score Now tab.

**How to use:**
1. In Score Now tab, find the trainee
2. Type in the "Add a quick note..." field
3. Click "Save"

**Notes are saved privately** and can be viewed later for reference.

---

## Daily Workflow

### Morning Routine
1. **Check Needs Attention card** → Address any overdue trainees
2. **Check Pending Scores card** → Grade any waiting assessments
3. **Review new reflections** → See what trainees struggled with

### During the Day
- Grade assessments as they come in
- Check trainee detail pages before coaching sessions
- Add notes after interactions

### End of Day
- Ensure all today's assessments are graded
- Check that no trainee moved to "At Risk"

---

## Assessment Weightage Reference

### Onboarding Coordinator (OC)
| Assessment | Weight |
|------------|--------|
| All in One Quiz | 50% |
| Advance System & Networking Quiz | 35% |
| Hardware Assessment | 15% |

### Onboarding Specialist (OS) / MOM
| Assessment | Weight |
|------------|--------|
| All in One Quiz | 20% |
| Advance System & Networking Quiz | 10% |
| Hardware Assessment | 5% |
| Training Assessment (F&B) | 10% |
| Training Assessment (Retail) | 10% |
| Training Mock Test (F&B) | 22% |
| Training Mock Test (Retail) | 23% |

### Customer Success Manager (CSM)
| Assessment | Weight |
|------------|--------|
| All in One Quiz | 20% |
| Advance System & Networking Quiz | 10% |
| Hardware Assessment | 5% |
| CSM Assessment | 20% |
| Mock Test | 45% |

### Merchant Care (MC)
| Assessment | Weight |
|------------|--------|
| All in One Quiz | 20% |
| Advance System & Networking Quiz | 15% |
| Hardware Assessment | 20% |
| Care Mock Test | 45% |

### Business Consultant (BC)
| Assessment | Weight |
|------------|--------|
| All in One Quiz | 20% |
| BC Pitching Assessment - F&B | 5% |
| BC Pitching Assessment - Retail | 5% |
| BC SPIN Assessment | 5% |
| BC Closing Skills (1 & 2) | 10% |
| BC Full Pitching (F&B & Retail) | 20% |
| Mock Test | 35% |

### Sales Coordinator (SC)
| Assessment | Weight |
|------------|--------|
| All in One Quiz | 15% |
| Full Call Assessment | 10% |
| Objection Handling (F&B & Retail) | 30% |
| Mock Test | 45% |

---

## FAQ

**Q: Why can't I see a trainee?**
A: You only see trainees assigned to you. Check with Andrea if assignment is incorrect.

**Q: Score not showing after I submitted?**
A: Wait 1-2 minutes for sync. If still missing, check that the Google Form submitted correctly.

**Q: What's the difference between "At Risk" and "Overdue"?**
A: At Risk = falling behind but still within time. Overdue = past expected completion date.

**Q: How do I add participation score?**
A: Participation score (5-20%) is added manually at the end of training during final report.

**Q: Can trainees see my notes?**
A: No, quick notes are private to coaches only.

---

## Need Help?

Contact: Andrea (andrea.kaur@storehub.com)
