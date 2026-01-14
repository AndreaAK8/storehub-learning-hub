# Training LMS Dashboard - CLAUDE.md Blueprint

## What I'm Building
An admin dashboard for managing StoreHub's employee training LMS, powered by n8n automation workflows, with role-based access for Admins, Coaches, and Trainees.

---

## 1. MY N8N AUTOMATION

**What it does:** Complete employee training lifecycle management
- Welcome emails & calendar scheduling (Win 1)
- Assessment scheduling & notifications (Win 2)
- Score tracking with attempt history (Win 2.5)
- Incomplete assessment reminders (Win 3)
- Final reports with weighted scores (Win 4)
- AI-powered feedback analysis using Gemini (Win 6)

**Input:** Trainee data, assessment submissions, survey responses

**Output:**
- JSON data (trainee lists, scores, reports)
- Email notifications
- Calendar events
- AI-analyzed feedback with sentiment/themes

**How long it takes:** Seconds for data fetch, minutes for email/report workflows

**Webhook URLs:** n8n Cloud - will configure during implementation

---

## 2. FRONTEND

**Framework:** Next.js 14 with App Router
**Styling:** Tailwind CSS
**Auth:** Google SSO via Supabase Auth

### Pages Needed:

| Route | Purpose | Access |
|-------|---------|--------|
| `/` | Landing page | Public |
| `/login` | Google SSO login | Public |
| `/dashboard` | Overview + role-based home | All authenticated |
| `/dashboard/trainees` | List all trainees | Admin, Coach |
| `/dashboard/trainees/[id]` | Individual trainee progress | Admin, Coach, Self |
| `/dashboard/assessments` | Assessment management | Admin |
| `/dashboard/reports` | Performance reports & analytics | Admin, Coach |
| `/dashboard/feedback` | AI-analyzed feedback insights | Admin |
| `/dashboard/settings` | App settings, user management | Admin |

---

## 3. BACKEND / API

**Using:** Next.js API Routes

### Endpoints Needed:

```
# Data Fetching (via n8n webhooks to Google Sheets)
GET  /api/trainees              - List trainees (filtered by role)
GET  /api/trainees/[id]         - Single trainee details + scores
GET  /api/assessments           - Assessment schedule config
GET  /api/reports/performance   - Aggregated performance data

# Workflow Triggers
POST /api/workflows/welcome     - Trigger welcome email flow
POST /api/workflows/assessment  - Trigger assessment scheduling
POST /api/workflows/reminder    - Trigger incomplete assessment reminder
POST /api/workflows/feedback    - Trigger feedback survey

# n8n Callbacks
POST /api/webhooks/n8n          - Receive workflow results

# User Management
GET  /api/users/me              - Current user profile + role
POST /api/users/invite          - Invite new user (Admin only)
```

---

## 4. DATABASE

**Using:** Supabase (Postgres)
**Data Strategy:** Hybrid
- Google Sheets = Training data (trainees, scores, assessments) - via n8n
- Supabase = App data (users, roles, sessions, settings)

### Tables Needed:

```sql
-- User profiles (extends Supabase Auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('admin', 'coach', 'trainee')) DEFAULT 'trainee',
  google_sheet_email TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Workflow job tracking
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles ON DELETE SET NULL,
  workflow_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  input JSONB,
  output JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- App settings
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Row Level Security Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read their own profile, admins can read all
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Jobs: Users can view their own jobs
CREATE POLICY "Users can view own jobs" ON jobs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all jobs" ON jobs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

---

## 5. AUTH

**Using:** Supabase Auth with Google OAuth
**Why:** Google SSO aligns with existing @storehub.com workspace

### Flow:
1. User clicks "Sign in with Google"
2. Supabase handles OAuth with Google
3. On first login: create profile with 'trainee' role (default)
4. Admin can upgrade roles via settings
5. Protected routes redirect to /login if not authenticated

### Role Assignment Logic:
- Match Google email to Coach Directory sheet → assign 'coach' role
- Match Google email to Admin list → assign 'admin' role
- Otherwise → 'trainee' role (can view own progress)

---

## 6. HOSTING

**App:** Vercel (free tier)
**n8n:** n8n Cloud (already configured)
**Domain:** `training.storehub.com` (subdomain - free)

---

## 7. N8N ↔ APP CONNECTION

### Architecture:
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Next.js App   │────▶│   n8n Cloud     │────▶│  Google Sheets  │
│   (Vercel)      │◀────│   Webhooks      │◀────│  Gmail/Calendar │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │
        ▼
┌─────────────────┐
│    Supabase     │
│  (Users/Jobs)   │
└─────────────────┘
```

### Data Flow:
1. User requests data (e.g., trainee list)
2. Next.js API calls n8n webhook
3. n8n fetches from Google Sheets
4. n8n returns JSON to Next.js
5. Next.js caches & returns to frontend

### Workflow Trigger Flow:
1. Admin clicks "Send Welcome Email" for a trainee
2. Next.js creates job record (status: pending)
3. Next.js calls n8n webhook with { job_id, trainee_email }
4. n8n runs Win 1 workflow
5. n8n calls back to /api/webhooks/n8n with results
6. Next.js updates job record (status: completed)

---

## 8. ENVIRONMENT VARIABLES

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# n8n Cloud Webhooks
N8N_WEBHOOK_BASE_URL=https://your-instance.app.n8n.cloud/webhook/
N8N_WEBHOOK_SECRET=<generate-random-string>

# Specific workflow webhooks
N8N_WEBHOOK_TRAINEES=        # Fetch trainee list
N8N_WEBHOOK_TRAINEE_DETAIL=  # Fetch single trainee
N8N_WEBHOOK_WELCOME=         # Trigger welcome flow
N8N_WEBHOOK_ASSESSMENT=      # Trigger assessment scheduler
N8N_WEBHOOK_REPORTS=         # Fetch performance reports
N8N_WEBHOOK_FEEDBACK=        # Fetch AI feedback analysis

# Google OAuth (via Supabase)
# Configured in Supabase Dashboard
```

---

## 9. FILE STRUCTURE

```
/training-lms
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   ├── page.tsx                 # Dashboard home
│   │   │   ├── trainees/
│   │   │   │   ├── page.tsx             # Trainee list
│   │   │   │   └── [id]/page.tsx        # Trainee detail
│   │   │   ├── assessments/page.tsx
│   │   │   ├── reports/page.tsx
│   │   │   ├── feedback/page.tsx
│   │   │   └── settings/page.tsx
│   │   └── layout.tsx                   # Dashboard layout with sidebar
│   ├── api/
│   │   ├── trainees/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── workflows/
│   │   │   ├── welcome/route.ts
│   │   │   ├── assessment/route.ts
│   │   │   └── feedback/route.ts
│   │   ├── webhooks/
│   │   │   └── n8n/route.ts
│   │   └── users/
│   │       ├── me/route.ts
│   │       └── invite/route.ts
│   ├── layout.tsx
│   └── page.tsx                         # Landing page
├── components/
│   ├── ui/                              # Shadcn/ui components
│   ├── dashboard/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── TraineeCard.tsx
│   │   ├── ScoreChart.tsx
│   │   └── AssessmentTable.tsx
│   └── auth/
│       └── GoogleSignIn.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── n8n/
│   │   └── client.ts                    # n8n webhook helpers
│   └── utils.ts
├── types/
│   ├── trainee.ts
│   ├── assessment.ts
│   └── user.ts
├── middleware.ts                         # Auth middleware
└── tailwind.config.ts
```

---

## 10. USER ROLE PERMISSIONS

| Feature | Admin | Coach | Trainee |
|---------|-------|-------|---------|
| View all trainees | ✅ | ✅ (assigned only) | ❌ |
| View own progress | ✅ | ✅ | ✅ |
| Trigger welcome email | ✅ | ❌ | ❌ |
| Trigger assessments | ✅ | ❌ | ❌ |
| View all reports | ✅ | ✅ (assigned only) | ❌ |
| View AI feedback | ✅ | ❌ | ❌ |
| Manage users | ✅ | ❌ | ❌ |
| Submit scores | ✅ | ✅ | ❌ |

---

## 11. IMPLEMENTATION ORDER

### Phase 1: Foundation
1. Set up Next.js 14 project with Tailwind
2. Configure Supabase (database + Google OAuth)
3. Create auth flow with role-based middleware
4. Build basic dashboard layout with sidebar

### Phase 2: n8n Integration
5. Create n8n webhook endpoints for data fetching
6. Build /api routes to proxy n8n calls
7. Implement trainee list & detail pages
8. Add workflow trigger buttons (welcome, assessment)

### Phase 3: Features
9. Build assessment management page
10. Build performance reports dashboard
11. Integrate AI feedback analysis display
12. Add score submission for coaches

### Phase 4: Polish
13. Add loading states, error handling
14. Implement caching for n8n responses
15. Mobile responsive design
16. Deploy to Vercel

---

## 12. IMPLEMENTATION PROGRESS

### Phase 1: Foundation ✅ COMPLETE
- [x] Set up Next.js 14 project with Tailwind
- [x] Configure Supabase (database + Google OAuth)
- [x] Create auth flow with role-based middleware
- [x] Build basic dashboard layout with sidebar

### Phase 2: n8n Integration ✅ COMPLETE
- [x] Create n8n webhook endpoint for trainees (`/webhook/trainees`)
- [x] Connect trainees page to n8n → Google Sheets (LIVE DATA WORKING)
- [x] Implement trainee detail page (`/dashboard/trainees/[id]`) ✅
- [x] Add workflow trigger buttons (reminder, report, assessment) ✅
- [x] Welcome email changed to automated n8n scheduled workflow ✅

### Phase 3: Features ✅ COMPLETE
- [x] Build assessment management page ✅
- [x] Build performance reports dashboard ✅
- [x] Integrate AI feedback analysis display ✅
- [x] Add score submission for coaches ✅
- [x] Build settings page with user management ✅
- [x] Dashboard home with live stats from n8n ✅

### Phase 4: Role-Specific Views ✅ COMPLETE (Jan 12, 2026)
- [x] **Trainee Dashboard**: My Training page with role-specific schedule from Supabase
- [x] **Trainer Dashboard**: Andrea's view with active batches, today's sessions, workflow triggers
- [x] **Coach Dashboard**: Assigned trainees, pending scores, quick actions
- [x] Supabase training content tables (training_roles, training_modules, trainee_progress)
- [x] API for training schedule (`/api/training/schedule`)

### Phase 5: Workflow Improvements ✅ COMPLETE
- [x] Win 1 - Lark Calendar Version (saved to `/New Workflow/`)
- [x] Win 1.5 - LMS Version (replaced Lark Wiki links with LMS dashboard links)
- [x] Note: Win 1.5 may be optional now since trainees can access LMS directly

### Phase 6: Trainee Dashboard Redesign ✅ COMPLETE (Jan 14, 2026)
**Focus: Jan 19 Pilot with Onboarding Coordinator (OC) Role**

- [x] **TrainingRoadmap.tsx** - Day progress bar with visual completion status
- [x] **DaySchedule.tsx** - Daily activities list with time-based layout
- [x] **ActivityCard.tsx** - Individual activity cards with success criteria, TL;DR
- [x] **ProgressPanel.tsx** - Sidebar with overall progress and per-day breakdown
- [x] **SearchBar.tsx** - Global Cmd+K search for modules and resources
- [x] **HelpButton.tsx** - Floating help button with checklist before contacting coach
- [x] **ReflectionModal.tsx** - End-of-day reflection prompts
- [x] **RescheduleModal.tsx** - Trainer can reschedule activities with reason codes
- [x] **my-training page rewrite** - Complete redesign with new components
- [x] Fixed SearchBar infinite loop error (stable array references with useMemo)

### Phase 7: n8n Workflow Improvements ✅ COMPLETE (Jan 14, 2026)
- [x] **Win 2.1 Daily Assessment Digest** - Replaces every-30-min emails with:
  - Single 9:30 AM digest email grouping all assessments by coach
  - 6:30 PM deadline reminder
  - Support for rescheduled assessments via Schedule_Adjustments tab
- [x] **Unified Google Sheet Structure** - Consolidated all data into one master sheet
- [x] Schedule adjustments table (Supabase + Google Sheet)

### Phase 8: Polish ⏳ PENDING
- [x] Add OC learning materials (Lark links in unified sheet)
- [ ] Mobile responsive design
- [ ] Deploy to Vercel

### Completed Files:
```
src/
├── app/
│   ├── page.tsx                          ✅ Landing page
│   ├── login/page.tsx                    ✅ Google SSO login
│   ├── auth/callback/route.ts            ✅ OAuth callback
│   ├── dashboard/
│   │   ├── layout.tsx                    ✅ Dashboard layout
│   │   ├── page.tsx                      ✅ Dashboard home (role-based: Trainer/Coach/Trainee)
│   │   ├── my-training/page.tsx          ✅ Trainee dashboard - REDESIGNED Jan 14
│   │   ├── resources/page.tsx            ✅ Training resources page
│   │   ├── assessments/page.tsx          ✅ Assessment management
│   │   ├── reports/page.tsx              ✅ Performance reports
│   │   ├── feedback/page.tsx             ✅ AI feedback analysis
│   │   ├── settings/page.tsx             ✅ User management + settings
│   │   └── trainees/
│   │       ├── page.tsx                  ✅ Trainees list (n8n connected)
│   │       └── [id]/page.tsx             ✅ Trainee detail + score submission
│   └── api/
│       ├── trainees/route.ts             ✅ API route
│       ├── training/
│       │   ├── schedule/route.ts         ✅ Training schedule from Supabase
│       │   └── reschedule/route.ts       ✅ NEW: Schedule adjustments API
│       ├── scores/route.ts               ✅ Score submission API
│       ├── reports/performance/route.ts  ✅ Performance analytics API
│       ├── users/me/route.ts             ✅ Current user API
│       ├── users/invite/route.ts         ✅ User invite API
│       └── workflows/
│           ├── assessment/route.ts       ✅ Assessment trigger
│           ├── report/route.ts           ✅ Report trigger
│           └── feedback/route.ts         ✅ Feedback trigger
├── components/
│   ├── dashboard/
│   │   ├── Sidebar.tsx                   ✅ Role-based navigation
│   │   ├── Header.tsx                    ✅ User menu + sign out
│   │   ├── TraineeTable.tsx              ✅ Table with search/filters
│   │   ├── TraineeActions.tsx            ✅ Workflow trigger buttons
│   │   ├── ScoreSubmission.tsx           ✅ Coach score submission form
│   │   ├── NeedsAttentionSection.tsx     ✅ Alert cards for at-risk trainees
│   │   ├── TrainerDashboard.tsx          ✅ Andrea's trainer view
│   │   └── CoachDashboard.tsx            ✅ Coach-specific dashboard
│   └── training/                         ✅ NEW: Trainee Dashboard Components
│       ├── index.ts                      ✅ Barrel exports
│       ├── TrainingRoadmap.tsx           ✅ Day progress bar
│       ├── DaySchedule.tsx               ✅ Daily activities list
│       ├── ActivityCard.tsx              ✅ Individual activity (success criteria, TL;DR)
│       ├── ProgressPanel.tsx             ✅ Progress sidebar
│       ├── SearchBar.tsx                 ✅ Cmd+K search
│       ├── HelpButton.tsx                ✅ Floating help button
│       ├── ReflectionModal.tsx           ✅ End-of-day reflection
│       └── RescheduleModal.tsx           ✅ Reschedule with reason codes
├── lib/supabase/
│   ├── client.ts                         ✅ Browser client
│   ├── server.ts                         ✅ Server client
│   └── middleware.ts                     ✅ Auth middleware
├── types/trainee.ts                      ✅ Trainee type
└── middleware.ts                         ✅ Route protection

Database (Supabase):
├── supabase_training_setup.sql           ✅ Complete training DB setup
│   ├── training_roles                    ✅ Role definitions (CSM, BC, MC, etc.)
│   ├── training_modules                  ✅ All training modules/timetables
│   ├── training_resources                ✅ Resource links
│   └── trainee_progress                  ✅ Progress tracking
└── schedule_adjustments.sql              ✅ NEW: Reschedule tracking table

Workflows (New Workflow/):
├── Win 1 - Lark Calendar Version.json    ✅ Lark Calendar integration
├── Win 1.5 - LMS Version.json            ✅ Updated with LMS links
├── Win 2.1_ Daily Assessment Digest.json ✅ NEW: Single daily digest (9:30 AM)
└── UNIFIED_SHEET_STRUCTURE.md            ✅ NEW: 7-tab sheet documentation
```

### Environment Configured:
```env
NEXT_PUBLIC_SUPABASE_URL=https://czdofunqbroxttddmkgn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=configured
SUPABASE_SERVICE_ROLE_KEY=configured
N8N_WEBHOOK_BASE_URL=https://storehub.app.n8n.cloud/webhook
N8N_WEBHOOK_TRAINEES=https://storehub.app.n8n.cloud/webhook/trainees ✅ WORKING
N8N_WEBHOOK_PERFORMANCE=https://storehub.app.n8n.cloud/webhook/reports/performance
N8N_WEBHOOK_FEEDBACK_ANALYSIS=https://storehub.app.n8n.cloud/webhook/feedback/analysis
N8N_WEBHOOK_WELCOME=https://storehub.app.n8n.cloud/webhook/trigger/welcome
N8N_WEBHOOK_REMINDER=https://storehub.app.n8n.cloud/webhook/trigger/reminder
N8N_WEBHOOK_ASSESSMENT=https://storehub.app.n8n.cloud/webhook/trigger/assessment
N8N_WEBHOOK_REPORT=https://storehub.app.n8n.cloud/webhook/trigger/report
N8N_WEBHOOK_FEEDBACK=https://storehub.app.n8n.cloud/webhook/trigger/feedback
N8N_WEBHOOK_SCORES=https://storehub.app.n8n.cloud/webhook/scores/submit
```

---

## 13. N8N WEBHOOK SETUP NEEDED

You'll need to create these webhook endpoints in n8n Cloud:

| Webhook | Purpose | Method |
|---------|---------|--------|
| `/webhook/trainees` | Fetch trainee list from GSheet | GET |
| `/webhook/trainee/:email` | Fetch single trainee + scores | GET |
| `/webhook/reports/performance` | Fetch aggregated performance | GET |
| `/webhook/feedback/analysis` | Fetch AI feedback results | GET |
| `/webhook/trigger/welcome` | Trigger Win 1 workflow | POST |
| `/webhook/trigger/assessment` | Trigger Win 2 workflow | POST |
| `/webhook/callback` | Receive workflow completion | POST |

---

## 14. SESSION NOTES & NEXT STEPS

### Last Session: Jan 14, 2026

**Completed:**
1. **Trainee Dashboard Complete Redesign** - 8 new components for comprehensive learning experience
   - TrainingRoadmap, DaySchedule, ActivityCard, ProgressPanel
   - SearchBar (Cmd+K), HelpButton, ReflectionModal, RescheduleModal
   - Fixed infinite loop error in SearchBar (stable array references)

2. **Unified Google Sheet Structure** - Consolidated all scattered sheets into one master
   - Sheet ID: `1IFAAelyD_x2uCOQKcbj8n7wgizNtVirAYbqCv67Y468`
   - Location: `/Training LMS Master - 2026/`
   - 7 Tabs: Trainees, Schedule_Adjustments, Assessment_Config, Assessment_Scores, Coach_Directory, Notification_Log, Performance_Summary
   - OC content populated with Lark links

3. **Win 2.1 Daily Assessment Digest** - Replaced annoying every-30-min emails
   - Single email at 9:30 AM with all day's assessments grouped by coach
   - 6:30 PM deadline reminder
   - Supports rescheduled assessments

4. **Reschedule Feature** - Trainers can reschedule activities with reason codes
   - API: `/api/training/reschedule`
   - Modal: `RescheduleModal.tsx`
   - SQL: `schedule_adjustments.sql`
   - Reasons: external (coach unavailable), leave, sick, pace (slow learner), other

**Pilot Preparation (Jan 19):**
- Role: Onboarding Coordinator (OC) - 4 days
- Learning materials: All in Lark (shareable links, no API needed)
- Assessment schedule: Populated in unified sheet

**Next Session To-Do:**
1. [ ] Deploy to Vercel
2. [ ] Update old n8n workflows (Win 1, 2.5, 3, 4, 6) to use new unified sheet ID
3. [ ] Test full trainee flow end-to-end
4. [ ] Mobile responsive polish

**Key Decisions Made:**
- Win 1.5 (Role Overview email) kept as optional proactive reminder
- Lark integration: Just shareable links, no API needed
- Schedule adjustments use neutral reason codes (not blame-focused)

---

## 15. UNIFIED GOOGLE SHEET STRUCTURE

**Master Sheet:** Training LMS Master - 2026
**Sheet ID:** `1IFAAelyD_x2uCOQKcbj8n7wgizNtVirAYbqCv67Y468`

| Tab | Purpose |
|-----|---------|
| Trainees | All trainee records (replaces New Hire List) |
| Schedule_Adjustments | Reschedules with reason codes |
| Assessment_Config | Assessment schedule by role/day |
| Assessment_Scores | All assessment submissions |
| Coach_Directory | Coach assignments and contact info |
| Notification_Log | Track all emails/notifications sent |
| Performance_Summary | Aggregated metrics for reporting |

**Note:** OC content includes Lark links for learning materials. Other roles to be populated before their pilot dates.
