# Product Requirements Document (PRD)
## Training LMS Dashboard

**Version:** 1.0
**Last Updated:** December 23, 2024
**Author:** Andrea Kaur
**Status:** In Development

---

## 1. Executive Summary

### Problem Statement
StoreHub's employee training process currently relies on manual coordination between Google Sheets, Gmail, and Google Calendar. Coaches and admins lack visibility into trainee progress, assessment completion rates, and overall training effectiveness. There is no centralized dashboard to monitor and manage the training lifecycle.

### Solution
A centralized Training LMS Dashboard that:
- Provides real-time visibility into all trainee progress
- Automates repetitive tasks (welcome emails, assessment scheduling, reminders)
- Delivers AI-powered insights from training feedback
- Enables role-based access for Admins, Coaches, and Trainees

### Key Benefits
| Benefit | Impact |
|---------|--------|
| Time Savings | Automate 80% of manual email/scheduling tasks |
| Visibility | Real-time trainee progress at a glance |
| Accountability | Track assessment completion and coach assignments |
| Insights | AI-analyzed feedback reveals training improvement opportunities |

---

## 2. Goals & Success Metrics

### Primary Goals
1. **Centralize training management** - Single source of truth for all trainee data
2. **Automate workflows** - Reduce manual intervention in routine tasks
3. **Improve visibility** - Enable data-driven decisions on training effectiveness

### Success Metrics (KPIs)
| Metric | Current State | Target |
|--------|---------------|--------|
| Time to send welcome pack | 30 min manual | < 1 min automated |
| Assessment reminder compliance | Unknown | 95% sent on time |
| Admin hours on training ops | 10+ hrs/week | < 2 hrs/week |
| Trainee progress visibility | Spreadsheet lookup | Real-time dashboard |

---

## 3. User Personas

### Admin (Training Manager)
- **Needs:** Full visibility, workflow triggers, user management, reports
- **Pain Points:** Manually tracking 50+ trainees, sending individual emails, compiling reports
- **Goals:** Streamline operations, ensure no trainee falls through cracks

### Coach
- **Needs:** View assigned trainees, submit scores, track progress
- **Pain Points:** No easy way to see who needs attention, manual score recording
- **Goals:** Focus coaching time on trainees who need help most

### Trainee
- **Needs:** View own progress, see upcoming assessments
- **Pain Points:** Unclear on training timeline, no self-service progress view
- **Goals:** Know where they stand, what's next

---

## 4. Features & Requirements

### 4.1 Authentication & Access Control
| Requirement | Priority | Status |
|-------------|----------|--------|
| Google SSO login (StoreHub workspace) | P0 | ✅ Done |
| Role-based access (Admin/Coach/Trainee) | P0 | ✅ Done |
| Automatic role assignment by email domain | P1 | Planned |
| Admin can change user roles | P1 | Planned |

### 4.2 Dashboard & Analytics
| Requirement | Priority | Status |
|-------------|----------|--------|
| Overview stats (total trainees, in-progress, completed) | P0 | ✅ Done |
| Trainee list with search & filters | P0 | ✅ Done |
| Progress bars showing assessment completion | P0 | ✅ Done |
| Coach performance metrics | P2 | Planned |

### 4.3 Trainee Management
| Requirement | Priority | Status |
|-------------|----------|--------|
| View all trainees (Admin/Coach) | P0 | ✅ Done |
| Individual trainee detail page | P0 | In Progress |
| Assessment scores & history | P1 | Planned |
| Training timeline visualization | P2 | Planned |

### 4.4 Workflow Automation (via n8n)
| Requirement | Priority | Status |
|-------------|----------|--------|
| Trigger welcome email + resource pack | P0 | Backend Ready |
| Schedule assessments automatically | P0 | Backend Ready |
| Send incomplete assessment reminders | P1 | Backend Ready |
| Generate final training reports | P1 | Backend Ready |
| AI-powered feedback analysis | P2 | Backend Ready |

### 4.5 Reporting
| Requirement | Priority | Status |
|-------------|----------|--------|
| Performance reports by coach | P1 | Planned |
| Assessment completion rates | P1 | Planned |
| Training duration analytics | P2 | Planned |
| Export reports (PDF/Excel) | P2 | Planned |

### 4.6 AI Features
| Requirement | Priority | Status |
|-------------|----------|--------|
| Sentiment analysis of feedback | P2 | Backend Ready |
| Theme extraction from comments | P2 | Backend Ready |
| Training improvement recommendations | P3 | Planned |

---

## 5. Technical Architecture

### Stack
| Component | Technology | Rationale |
|-----------|------------|-----------|
| Frontend | Next.js 14 (App Router) | Modern React, SSR, great DX |
| Styling | Tailwind CSS | Rapid UI development |
| Auth | Supabase (Google OAuth) | Managed auth, RLS support |
| Database | Supabase (Postgres) | User/session data |
| Training Data | Google Sheets (via n8n) | Existing data source |
| Automation | n8n Cloud | Visual workflow builder |
| AI | Google Gemini | Feedback analysis |
| Hosting | Vercel | Zero-config Next.js hosting |

### Data Flow
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│   n8n Cloud  │────▶│ Google Sheets│
│  (Next.js)   │◀────│   Webhooks   │◀────│ Gmail/Cal    │
└──────────────┘     └──────────────┘     └──────────────┘
       │
       ▼
┌──────────────┐
│   Supabase   │
│ (Users/Auth) │
└──────────────┘
```

### Security
- All routes protected by authentication middleware
- Row-Level Security (RLS) in Supabase
- Role-based access control on frontend and API
- No direct database access from client

---

## 6. User Interface

### Navigation Structure
```
Dashboard (/)
├── Overview (stats, quick actions)
├── Trainees
│   ├── List view (searchable, filterable)
│   └── Detail view (progress, scores, timeline)
├── Assessments (schedule, manage)
├── Reports (performance, analytics)
├── Feedback (AI insights)
└── Settings (users, configuration)
```

### Design Principles
- **Clean & Professional** - Enterprise SaaS aesthetic
- **Data-Dense** - Show key info without overwhelming
- **Action-Oriented** - Clear CTAs for common tasks
- **Mobile-Friendly** - Responsive for on-the-go access

---

## 7. Current Progress

### Completed (Phase 1)
- [x] Project setup (Next.js 14 + Tailwind)
- [x] Supabase integration (auth + database)
- [x] Google SSO authentication
- [x] Role-based dashboard layout
- [x] Trainees list page with live n8n data
- [x] Search and filter functionality
- [x] Progress visualization

### In Progress (Phase 2)
- [ ] Individual trainee detail page
- [ ] Workflow trigger buttons (welcome, assessment)
- [ ] Additional n8n webhook integrations

### Upcoming (Phase 3-4)
- [ ] Assessment management page
- [ ] Performance reports dashboard
- [ ] AI feedback analysis display
- [ ] Score submission for coaches
- [ ] Mobile optimization
- [ ] Vercel deployment

---

## 8. Timeline & Milestones

| Milestone | Target | Status |
|-----------|--------|--------|
| Phase 1: Foundation | Week 1 | ✅ Complete |
| Phase 2: n8n Integration | Week 2 | 🔄 In Progress |
| Phase 3: Core Features | Week 3-4 | Planned |
| Phase 4: Polish & Deploy | Week 5 | Planned |
| Production Launch | TBD | Pending |

---

## 9. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| n8n Cloud downtime | Data unavailable | Implement caching, graceful error handling |
| Google Sheets rate limits | Slow data fetch | Cache responses, batch requests |
| User adoption | Low engagement | Training sessions, intuitive UX |
| Scope creep | Delayed launch | Strict P0/P1 prioritization |

---

## 10. Future Roadmap (Post-MVP)

### V1.1
- Slack notifications for key events
- Bulk actions (send emails to multiple trainees)
- Advanced filtering and saved views

### V1.2
- Coach leaderboard and gamification
- Trainee self-service portal enhancements
- Calendar integration for assessments

### V2.0
- Native mobile app
- Offline support
- Multi-language support
- Custom training program templates

---

## 11. Appendix

### Glossary
| Term | Definition |
|------|------------|
| Trainee | New hire going through onboarding training |
| Coach | Senior employee assigned to guide trainees |
| Assessment | Evaluation tests during training period |
| n8n | Workflow automation platform (backend) |

### Related Documents
- `CLAUDE.md` - Technical implementation blueprint
- n8n Workflows - Backend automation definitions
- Google Sheets - Master trainee data source

---

*This is a living document. Updates will be made as requirements evolve.*
