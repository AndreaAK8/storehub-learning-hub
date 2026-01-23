# AI Feature Roadmap - StoreHub Learning Hub

> Created: January 22, 2026
> Based on: AI-SaaS LMS Feature Research analysis
> Status: Planning (not yet implemented)

---

## Current State (Already Implemented)

The Learning Hub already has:
- **Gamification**: XP system, badges, confetti celebrations, certificates
- **Onboarding**: 8-step tour, pre-training checklist
- **Training Dashboard**: Role-based content, training roadmap, activity cards
- **Progress Tracking**: Day-by-day progress, completion status
- **Search**: Cmd+K search for modules and resources
- **Workflow Automation**: n8n integration for emails, assessments, notifications
- **Role-Based Access**: Admin, Coach, Trainee views

---

## Feature Tiers

### Tier 1: High Impact, Low-Medium Complexity (Recommended First)

| Feature | Description | Why It's Valuable | Complexity | Cost |
|---------|-------------|-------------------|------------|------|
| **"Store Builder" Visual Metaphor** | Replace generic progress bar with building a virtual store | Much more engaging than current day-based progress. Aligns with StoreHub's mission. | Low | Free |
| **Spaced Repetition** | Algorithmic micro-quizzes scheduled based on forgetting curves | Improves long-term retention of critical knowledge (pricing tiers, hardware specs). | Low-Medium | Free |
| **RAG AI Chatbot** | Context-aware AI assistant that answers questions from training materials | Eliminates "tab fatigue" - trainees get instant answers without leaving the dashboard. | Medium | Free tier available |

### Tier 2: High Impact, High Complexity (Future Phase)

| Feature | Description | Why It's Valuable | Complexity | Cost |
|---------|-------------|-------------------|------------|------|
| **Voice AI Roleplay** | AI-powered conversation practice for sales/support roles | Critical for Day 3+ divergence - sales needs to practice pitching, support needs de-escalation practice. | High | Paid APIs |
| **3D Hardware Configurator** | Interactive WebGL simulation of StoreHub hardware | Perfect for Merchant Onboarding Manager role - practice cabling, troubleshooting without physical hardware. | High | Free |
| **Adaptive Learning Engine** | Dynamic paths based on diagnostic pre-assessments | Respects learner's time, prevents boredom/anxiety. | High | Free |

### Tier 3: Medium Impact (Nice to Have)

| Feature | Description | Why It's Valuable | Complexity |
|---------|-------------|-------------------|------------|
| **Digital Adoption Platform (Chrome Extension)** | Overlay training guides on live StoreHub staging | "Learn by doing" on actual software. | Medium |
| **Generative Quiz Generation** | AI creates new quiz questions from content | Prevents answer-sharing, infinite practice variations. | Low-Medium |
| **xAPI Granular Tracking** | Detailed interaction tracking beyond completion | Better analytics for coaches. | Medium |
| **Cohort Leaderboards** | Competition within same-batch trainees | Already have XP - leaderboards add social motivation. | Low |

### Tier 4: Skip for Now

| Feature | Reason to Deprioritize |
|---------|------------------------|
| **Headless LMS Migration** | Already built custom Next.js + Supabase stack |
| **Full SPA Refactor** | Current architecture is already SPA-like with Next.js |
| **Calendly/HubSpot Scheduling** | Already using n8n for scheduling automation |

---

## Implementation Roadmap

### Phase 1: Immediate (Post-Pilot, Feb 2026)
1. **"Store Builder" Visual Progression** - Quick win, high engagement boost
2. **Spaced Repetition Micro-Quizzes** - Low effort, high retention impact

### Phase 2: Short-Term (Q1 2026)
3. **RAG AI Chatbot** - Major UX improvement, reduces coach load
   - Use existing training content in Lark/Google Sheets
   - Embed in training dashboard as collapsible panel
   - Consider: OpenAI API + Supabase pgvector

### Phase 3: Medium-Term (Q2 2026)
4. **Voice AI Roleplay** (for Sales roles first)
   - Start with Vapi.ai or OpenAI Realtime API
   - Create 3-5 scenario templates (objection handling, cold calls)

5. **Generative Quiz Generation**
   - Auto-create quizzes from module content
   - Use GPT-4 with rubrics

### Phase 4: Long-Term (Q3-Q4 2026)
6. **3D Hardware Configurator** (for Ops/Support roles)
7. **Adaptive Learning Engine**

---

## Detailed Implementation Plans

### Feature 1: "Store Builder" Visual Progression

**Concept:** Replace the current day-based progress bar with an animated visualization of building a StoreHub-powered store.

**Visual Progression:**
- Day 1: Foundation/floor plan appears
- Day 2: Walls, counter, shelves materialize
- Day 3: POS terminal, printer, hardware installed
- Day 4: Products on shelves, customers enter, "Grand Opening" ribbon cut

**Implementation Structure:**
```
components/training/
├── StoreBuilder/
│   ├── StoreBuilder.tsx      # Main container with SVG/Canvas
│   ├── BuildingStage.tsx     # Individual stage animations
│   ├── StoreElements.tsx     # Reusable store pieces (counter, shelves, POS)
│   └── CelebrationOverlay.tsx # Grand opening animation
```

**Technical Approach:**
- Use CSS animations or Framer Motion
- SVG-based illustrations for clean scaling
- Store state in trainee_progress table (already exists)
- Could use existing confetti system for grand opening

**Files to Modify:**
- `components/training/TrainingRoadmap.tsx` - Replace current progress bar
- `components/training/ProgressPanel.tsx` - Add store visualization
- `app/dashboard/my-training/page.tsx` - Integrate new component

**Effort:** ~2-3 days

---

### Feature 2: Spaced Repetition System

**Concept:** Automatically schedule review quizzes based on forgetting curves. When a trainee struggles with a concept, the system schedules micro-quizzes at optimal intervals.

**Algorithm:** Use SM-2 (SuperMemo) or simplified FSRS
- Correct answer → longer interval before next review
- Wrong answer → shorter interval, more repetitions

**Database Schema:**
```sql
CREATE TABLE spaced_repetition_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainee_id UUID REFERENCES profiles(id),
  module_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  ease_factor FLOAT DEFAULT 2.5,
  interval_days INT DEFAULT 1,
  repetitions INT DEFAULT 0,
  next_review TIMESTAMPTZ DEFAULT now(),
  last_reviewed TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Implementation Structure:**
```
lib/
├── spaced-repetition/
│   ├── algorithm.ts          # SM-2 or FSRS implementation
│   ├── scheduler.ts          # Calculate next review dates
│   └── queries.ts            # Supabase queries

components/training/
├── MicroQuiz/
│   ├── MicroQuiz.tsx         # Quiz modal component
│   ├── QuizCard.tsx          # Individual question card
│   └── ReviewQueue.tsx       # Shows pending reviews

app/api/
├── reviews/
│   ├── route.ts              # GET pending reviews, POST answer
│   └── schedule/route.ts     # Trigger review scheduling
```

**UX Flow:**
1. When trainee completes a module quiz, items marked as "struggled" get added to SRS
2. On dashboard load, check for pending reviews
3. Show "X items to review" badge on activity panel
4. Quick 2-3 question micro-quiz takes <1 minute

**Files to Modify:**
- `components/training/ActivityCard.tsx` - Track struggle items
- `components/training/ProgressPanel.tsx` - Add review queue indicator
- `app/dashboard/my-training/page.tsx` - Check for pending reviews

**Effort:** ~3-4 days

---

### Feature 3: RAG AI Chatbot (Stretch Goal)

**Concept:** Context-aware AI assistant embedded in the training dashboard that answers trainee questions using the actual training materials.

**Architecture:**
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Trainee asks   │────▶│  Vector Search  │────▶│  LLM generates  │
│  question       │     │  (pgvector)     │     │  answer + cite  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

**Data Sources to Ingest:**
- Training module content from Supabase
- Lark documentation links
- Google Sheets training materials
- Help center articles

**Tech Stack:**
- Supabase pgvector (free) for vector storage
- OpenAI text-embedding-3-small for embeddings
- GPT-4 or Claude for answer generation

**Estimated Effort:** ~1-2 weeks

---

## Verification Plans

### Store Builder
1. Create test trainee at different completion stages (Day 1, 2, 3, 4)
2. Verify animations trigger correctly at each stage
3. Test grand opening celebration on completion
4. Check responsive design on mobile

### Spaced Repetition
1. Complete a module quiz, intentionally miss some questions
2. Verify items appear in review queue
3. Answer review questions, verify interval updates
4. Check next_review dates in Supabase

---

## Summary Table

| Feature | Cost | Effort | Impact | Priority |
|---------|------|--------|--------|----------|
| Store Builder Visual | Free | 2-3 days | High engagement | 1 |
| Spaced Repetition | Free | 3-4 days | Proven retention boost | 2 |
| RAG AI Chatbot | Free tier | 1-2 weeks | Reduces coach load | 3 |
| Voice AI Roleplay | Paid APIs | 2-3 weeks | Game-changer for sales | 4 |
| 3D Hardware Config | Free | 3-4 weeks | Critical for Ops roles | 5 |

---

## Questions to Revisit

1. Which roles are being onboarded next after OC? (Affects Voice AI vs Hardware Sim priority)
2. What's the budget for external AI APIs when ready to scale?
3. Is there existing training content that could feed a RAG system?
