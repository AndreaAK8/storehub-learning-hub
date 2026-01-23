# Training LMS Dashboard
## Executive Summary

**Document Version:** 1.0
**Last Updated:** January 19, 2026
**Project Owner:** Training Team
**Status:** In Development (Pre-Pilot)

---

## 1. What Is It?

A self-service **Learning Management System (LMS)** for StoreHub's new hire training program.

### Key Capabilities:
- **Role-based training paths** - Different content for each role (BC, OS, CSM, etc.)
- **Daily activity tracking** - Trainees see exactly what to do each day
- **Progress monitoring** - Visual progress bars, XP gamification
- **Automated workflows** - Welcome emails, assessment reminders (via n8n)
- **Coach dashboards** - Score submission, trainee oversight
- **Admin reporting** - Performance analytics across batches

### Live URL:
🔗 **https://storehub-learning-hub.vercel.app**

---

## 2. What's Been Built

| Feature | Status | Description |
|---------|--------|-------------|
| Trainee Dashboard | ✅ Complete | Daily activities, progress tracking, XP rewards |
| Onboarding Tour | ✅ Complete | 8-step guided intro for first-time users |
| Role-based Access | ✅ Complete | Admin / Coach / Trainee permissions |
| Google SSO | ✅ Complete | Sign in with StoreHub Google account |
| Auto Welcome Emails | ✅ Complete | Triggered automatically for new trainees |
| Coach Score Submission | ✅ Complete | Coaches can submit assessment scores |
| Admin Reports | ✅ Complete | Performance analytics dashboard |
| Gamification | ✅ Complete | XP system, badges, completion celebrations |
| OC Role Content | ✅ Complete | 4-day Onboarding Coordinator training |
| BC Role Content | ⏳ Pending | Business Consultant training |
| OS Role Content | ⏳ Pending | Onboarding Specialist training |

---

## 3. Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Frontend | Next.js 14 | Web application framework |
| Styling | Tailwind CSS | UI design system |
| Database | Supabase | User auth, progress tracking |
| Automation | n8n Cloud | Email workflows, Google Sheets sync |
| Hosting | Vercel | Application deployment |
| Data Source | Google Sheets | Training content, scores |

---

## 4. Why Vercel? (Hosting Decision)

### Vercel vs Render Comparison:

| Factor | Vercel | Render |
|--------|--------|--------|
| **Best For** | Next.js / Frontend | General-purpose / Backend |
| **Next.js Support** | ⭐ Native (built by Vercel) | Good, not optimized |
| **Deploy Speed** | ~30-60 seconds | ~2-5 minutes |
| **Global CDN** | 100+ edge locations | Fewer locations |
| **Free Tier** | ✅ Sufficient for our scale | ✅ Also free |
| **Database Hosting** | ❌ No (we use Supabase) | ✅ Yes |
| **Docker Support** | ❌ No | ✅ Yes |

### Why Vercel Wins for This Project:

| Reason | Explanation |
|--------|-------------|
| **Native Next.js** | Vercel created Next.js - best optimization |
| **Speed** | Fastest deploys, global edge network |
| **Zero Ops** | No server maintenance required |
| **Cost** | Free at our usage level |
| **Architecture Fit** | We use Supabase for DB, n8n for workflows - Vercel handles frontend perfectly |

**Bottom Line:** Vercel is purpose-built for Next.js applications. Since we're using Supabase (database) and n8n (automation) as separate services, Vercel is the optimal choice for hosting the frontend.

---

## 5. Timeline & Milestones

### Completed:
| Date | Milestone |
|------|-----------|
| Jan 14 | Trainee dashboard redesign complete |
| Jan 18 | Production deployment to Vercel |
| Jan 18 | Gamification & onboarding tour complete |
| Jan 18 | OC role content populated |

### Upcoming:
| Date | Milestone | Details |
|------|-----------|---------|
| ~~Jan 19~~ | ~~OC Pilot~~ | Cancelled - new hire no-show |
| **Jan 20-31** | Content Development | Populate BC and OS training modules |
| **Jan 27** | Internal Testing | Full flow test with BC/OS content |
| **Feb 2** | **BC + OS Batch Go-Live** | First batch onboarding |
| Feb 3-7 | Monitor & Support | Active support during training |
| Feb 10+ | Feedback Review | Iterate based on batch feedback |

### Content Readiness (for Feb 2):
| Role | Days | Content Status | Deadline |
|------|------|----------------|----------|
| Business Consultant (BC) | 12 | ⏳ In Progress | Jan 30 |
| Onboarding Specialist (OS) | TBD | ⏳ In Progress | Jan 30 |

---

## 6. Focus Areas (Jan 20 - Feb 1)

### Priority 1: Content (Must Have)
- [ ] Finalize BC training modules (12 days of content)
- [ ] Finalize OS training modules (days TBD)
- [ ] Add resource links (Lark docs, videos)
- [ ] Define success criteria for each activity

### Priority 2: Testing (Must Have)
- [ ] End-to-end trainee flow testing
- [ ] Coach score submission testing
- [ ] Email workflow verification
- [ ] Mobile device testing

### Priority 3: Improvements (Nice to Have)
- [ ] UI refinements based on OC content learnings
- [ ] Mobile responsiveness optimization
- [ ] Additional reporting features

---

## 7. Success Metrics

| Metric | Target | How Measured |
|--------|--------|--------------|
| Trainee adoption | 100% | All trainees access LMS on Day 1 |
| Daily completion rate | >80% | Activities marked complete |
| Assessment submission | 100% | All scores recorded |
| System uptime | >99% | Vercel monitoring |
| Trainee satisfaction | >4/5 | Post-training survey |

---

## 8. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Content not ready by Feb 2 | High | Start content collection now, daily check-ins |
| Technical issues on go-live | Medium | Thorough testing week of Jan 27 |
| Trainee confusion | Medium | Onboarding tour, help resources in-app |
| Coach unfamiliarity | Low | Quick training session before Feb 2 |

---

## 9. Support & Contacts

| Role | Responsibility |
|------|----------------|
| Project Owner | Overall delivery, content coordination |
| Technical Support | System issues, bug fixes |
| Coaches | Trainee support, score submission |

---

## 10. Next Steps (Immediate)

1. **This Week (Jan 20-24):**
   - Collect BC training content (all 12 days)
   - Confirm OS training duration and content
   - Begin populating content in system

2. **Next Week (Jan 27-31):**
   - Complete content population
   - Full system testing
   - Coach briefing session

3. **Feb 2:**
   - Go-live with BC + OS batch

---

*Document prepared for supervisor review. For technical details, refer to CLAUDE.md in the project repository.*
