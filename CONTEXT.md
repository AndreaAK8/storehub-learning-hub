# Training LMS - Full Project Context
> Last updated: 2026-04-07
> Purpose: If you crash, lose context, or start a new session — read this file first.

---

## WHO

- **Andrea Kaur** (andrea.kaur@storehub.com) — Training Lead at StoreHub
- **Lark Open ID:** `ou_eb91f697a0fa0ffd9bb717cf2592e025`
- **Role:** Designs and manages new hire training programs, built this LMS dashboard

---

## WHAT IS THIS PROJECT

An **admin dashboard (Learning Hub)** for managing StoreHub's employee training. It tracks trainees through onboarding, sends automated emails, manages assessments, and gives trainee/coach/admin role-based views.

**Tech Stack:**
- Frontend: Next.js 14 + Tailwind CSS + TypeScript
- Backend: Next.js API Routes
- Database: Supabase (Postgres) — users, roles, training modules, progress
- Data source: Google Sheets (trainees, scores, assessments) via n8n webhooks
- Auth: Google SSO via Supabase Auth
- Automation: n8n Cloud (9+ workflows)
- Hosting: Vercel

---

## KEY URLS & CREDENTIALS

| Resource | URL / ID |
|----------|----------|
| **Production** | https://storehub-learning-hub.vercel.app |
| **Supabase** | https://supabase.com/dashboard/project/czdofunqbroxttddmkgn |
| **n8n** | https://storehub.app.n8n.cloud |
| **Google Sheet** | ID: `1IFAAelyD_x2uCOQKcbj8n7wgizNtVirAYbqCv67Y468` |
| **Vercel Project** | storehub-learning-hub |
| **Lark Audit Task** | [Main Task](https://applink.larksuite.com/client/todo/detail?guid=bb839268-3bc0-40e1-ad94-7e2764bf22ad&suite_entity_num=t138811) |

**Env vars** are in `training-lms/.env.local` — Supabase URL/keys, n8n webhook URLs all configured.

---

## WHAT'S BEEN BUILT (Phases 1-10, Jan 2026)

### Core App (all working as of Jan 18, 2026)
- Landing page, Google SSO login, auto profile creation on first sign-in
- Role-based dashboard (Trainer/Coach/Trainee get different views)
- Trainee list page connected to n8n → Google Sheets (LIVE DATA)
- Individual trainee detail + score submission
- Assessment management, performance reports, AI feedback analysis pages
- Settings page with user management
- 23 API endpoints

### Trainee Dashboard (redesigned Jan 14)
- `TrainingRoadmap.tsx` — visual day progress bar
- `DaySchedule.tsx` — daily activities list
- `ActivityCard.tsx` — individual activity with success criteria, TL;DR
- `ProgressPanel.tsx` — sidebar with per-day breakdown
- `SearchBar.tsx` — Cmd+K global search
- `HelpButton.tsx` — floating help button
- `ReflectionModal.tsx` — end-of-day reflection
- `RescheduleModal.tsx` — reschedule with reason codes

### Gamification (Jan 18)
- XP system with early-finish bonuses
- GiftReveal (animated badge unlock), CompletionCelebration (confetti)
- Downloadable Certificate
- 8-step OnboardingTour for first-time trainees
- OnboardingChecklist before starting Day 1

### n8n Workflows (9+ active)
| Workflow | Purpose | Status |
|----------|---------|--------|
| Win 1 - Auto Welcome | Scheduled every 30 min, sends welcome email | Needs verification |
| Win 1.5 - LMS Version | Welcome with LMS links | Needs verification |
| Win 2.1 - Daily Assessment Digest | 9:30 AM digest + 6:30 PM reminder | Needs verification |
| Win 2.5 - Score Notification | Notifies when scores submitted | Needs verification |
| Win 3 - Critical Alert | Alerts for at-risk trainees | Needs verification |
| Win 4 - Final Report | Weighted score report | Needs verification |
| Win 6 - AI Feedback | Gemini-powered feedback analysis | Needs verification |
| Fetch Trainees API | Returns trainee list from Sheets | Was working |
| Fetch Alerts/Scores | Data APIs | Needs verification |

### Database (Supabase)
**App tables:** profiles, jobs, settings
**Training tables:** training_roles, training_modules, training_resources, trainee_progress, schedule_adjustments, coaching_notes, trainee_reflections, activity_performance

**Roles in DB:** ALL, CSM, BC, MC, MOM, OS, OC, SC

---

## CURRENT STATE (Apr 2026)

### What happened since Jan 18
Andrea paused LMS development for ~3 months to focus on **building new Day 1 & 2 training slides**. The training program was completely restructured from passive slide-reading to a hands-on model.

### The NEW Training Structure (replaces old)

**Old structure (what's in Supabase now):**
- Day 1: Training Briefing → All-in-One Software/Hardware/Features (self-study)
- Day 2: System Navigation (self-study) → Product Demo → 48-question quiz

**New structure (from `Training Plan with LMS.docx`):**
- **Day 1: What & Why** — Modules A-E:
  - A: Welcome to StoreHub (30m)
  - B: Software & Plans (30m)
  - C: Hardware Essentials (30m)
  - D: Core Features Overview (45m)
  - E: Merchant Profiles (15m)
  - Pop Quiz (12-15 questions, NOT 48)
  - Homework Assignment (BackOffice config, done before Day 2)
- **Day 2: The How** — Hands-on configuration, feature demos, hardware setup, Foundation Quiz
- **Day 3: Integrate & Fix** — Sales roles (BC, SC) fork to coach; Success roles go deep on troubleshooting. **SLIDES PENDING** (progressive build)
- **Day 4-5: Coach-led** — Fully role-specific

### Slides Status
| Slides | Status |
|--------|--------|
| Day 1 | Done ✅ |
| Day 2 | Done ✅ |
| Day 3 | In progress (pending) |

### Test Run Results
- **Run 1 (Mar 24):** Day 1 finished 1hr early, Day 2 on track
- **Run 2 (Mar 30):** Day 1 finished 1hr early, Day 2 ran +30min over
- **Key wins:** Higher engagement, trainees more self-directed, trainer can circulate
- **Issues:** Some quiz Qs not on slides, inventory types confuse non-POS hires
- **Need:** 3rd test run focused on Day 2

---

## WHAT NEEDS TO BE DONE (Audit Checklist)

Tracked in Lark: [Main Task](https://applink.larksuite.com/client/todo/detail?guid=bb839268-3bc0-40e1-ad94-7e2764bf22ad&suite_entity_num=t138811)

### Priority Order
1. **Verify infrastructure** — Auth, Vercel, Supabase still working?
2. **Update Day 1-2 Supabase modules** — Replace old All-in-One with Module A-E
3. **Update quiz references** — Pop quiz (12-15 Qs) replaces 48-question quiz
4. **Verify trainee dashboard** — Components render correctly with new data
5. **Verify n8n workflows** — All 9+ workflows still fire
6. **Build Day 3 content** — Progressive
7. **Add homework feature** — New concept, LMS needs homework tracking
8. **Apply test run fixes** — Quiz gaps, connector images, timing adjustments

### Lark Sub-tasks (7 sections, 44 items)

| # | Section | GUID | Items |
|---|---------|------|-------|
| 1 | Training Content (Supabase) | 402c730a-954b-4d42-bb2a-c6c05d94839b | 6 |
| 2 | Slides & Quiz | 8dd1ffa2-1bac-4bb7-b8f2-d15a543f395b | 6 |
| 3 | Trainee Dashboard (UI) | 17def443-5bae-47d4-8510-1b1a66c613cb | 8 |
| 4 | API & Backend | b5c45681-7bd6-4a00-bd35-f457579a44a5 | 6 |
| 5 | n8n Workflows | ba13482e-3c6a-424f-b0b8-d73b24d282fb | 8 |
| 6 | Auth & Infrastructure | 477ea6a9-23f4-4a1c-b791-097b7f4e3a15 | 5 |
| 7 | Test Run Findings | c4228da2-9e1e-49e8-8e3c-eadc8b4bce53 | 5 |

---

## KEY FILES

### App Source (training-lms/src/)
```
app/
├── page.tsx                          — Landing page
├── login/page.tsx                    — Google SSO login
├── auth/callback/route.ts            — OAuth callback (auto-creates profile)
├── dashboard/
│   ├── layout.tsx                    — Dashboard shell with sidebar
│   ├── page.tsx                      — Role-based home (Trainer/Coach/Trainee)
│   ├── my-training/page.tsx          — Trainee dashboard (REDESIGNED Jan 14)
│   ├── trainees/page.tsx             — Trainee list (n8n connected)
│   ├── trainees/[id]/page.tsx        — Trainee detail + scores
│   ├── assessments/page.tsx          — Assessment management
│   ├── reports/page.tsx              — Performance reports
│   ├── feedback/page.tsx             — AI feedback analysis
│   ├── settings/page.tsx             — User management
│   ├── resources/page.tsx            — Training resources
│   ├── certificate/page.tsx          — Certificate page
│   ├── training-overview/page.tsx    — Training overview
│   ├── my-scores/page.tsx            — Trainee scores
│   └── final-report/[email]/page.tsx — Final report
└── api/
    ├── trainees/route.ts             — Trainee list API
    ├── training/schedule/route.ts    — Training schedule from Supabase
    ├── training/reschedule/route.ts  — Schedule adjustments
    ├── scores/route.ts               — Score submission
    ├── reports/performance/route.ts  — Performance analytics
    ├── users/me/route.ts             — Current user
    └── workflows/*.ts                — n8n trigger endpoints

components/
├── dashboard/                        — Sidebar, Header, TraineeTable, etc.
└── training/                         — TrainingRoadmap, DaySchedule, ActivityCard, etc.
```

### Important Non-Code Files
```
CLAUDE.md                             — Full project blueprint (KEEP UPDATED)
CONTEXT.md                            — THIS FILE (crash recovery)
training-lms/.env.local               — All env vars
training-lms/supabase_training_setup.sql — DB schema + seed data (OUTDATED Day 1-2)
training-lms/scripts/import-training-content.js — OUTDATED import script
Slides Content/                       — Day 1-3 slide decks + images
New Training Program/                 — Restructure proposals
New Workflow/                         — n8n workflow JSON files
Materials/                            — Training timetables per role
```

---

## KEY DECISIONS MADE

1. **Supabase for app data, Google Sheets for training data** — Hybrid approach via n8n
2. **Google SSO only** — Aligns with @storehub.com workspace
3. **Trainee profiles auto-created on first sign-in** — No manual Supabase entry
4. **Welcome emails fully automated** — Scheduled n8n workflow, no manual trigger
5. **Onboarding tour uses emoji illustrations** — Simpler than DOM highlighting
6. **Schedule adjustments use neutral reason codes** — Not blame-focused
7. **LocalStorage tracks tour completion per user email**
8. **Win 2.1 replaced per-assessment emails with single daily digest** — Less spam

---

## ROLES & WHAT THEY SEE

| Role | Dashboard | Key Features |
|------|-----------|--------------|
| **Trainee** | My Training | Roadmap, activities, progress, XP, search, help |
| **Coach** | Coach Dashboard | Assigned trainees, pending scores, quick actions |
| **Trainer (Admin)** | Trainer Dashboard | All batches, today's sessions, workflow triggers, settings |

---

## HOW TO RESUME WORK

1. Read this file (CONTEXT.md)
2. Check the [Lark audit task](https://applink.larksuite.com/client/todo/detail?guid=bb839268-3bc0-40e1-ad94-7e2764bf22ad&suite_entity_num=t138811) for current progress
3. Run `cd training-lms && npm run dev` to start local dev
4. Reference `Training Plan with LMS.docx` in Downloads for the new training structure
5. Follow the priority order in the audit checklist above
