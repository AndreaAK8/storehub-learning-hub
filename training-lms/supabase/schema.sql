-- ============================================
-- TRAINING LMS - DATABASE SCHEMA
-- ============================================
-- Designed for StoreHub's complex training program
-- Supports: 9 roles, 3 regions, weighted scoring
-- ============================================

-- ============================================
-- 1. CORE TABLES
-- ============================================

-- Regions (MY, PH, TH)
CREATE TABLE regions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  timezone TEXT DEFAULT 'Asia/Kuala_Lumpur'
);

INSERT INTO regions (id, name, timezone) VALUES
  ('MY', 'Malaysia', 'Asia/Kuala_Lumpur'),
  ('PH', 'Philippines', 'Asia/Manila'),
  ('TH', 'Thailand', 'Asia/Bangkok');

-- Roles (Business Consultant, Merchant Care, etc.)
CREATE TABLE roles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  training_duration_days INTEGER NOT NULL,
  description TEXT
);

INSERT INTO roles (id, name, training_duration_days, description) VALUES
  ('BC', 'Business Consultant', 6, 'Field sales with full pitching skills'),
  ('MC', 'Merchant Care', 4, 'Customer support and troubleshooting'),
  ('CSM', 'Customer Success Manager', 5, 'Account management and retention'),
  ('MOM', 'Merchant Onboarding Manager', 6, 'New merchant setup and training'),
  ('OS', 'Onboarding Specialist', 6, 'Merchant onboarding execution'),
  ('SC', 'Sales Coordinator', 4, 'Inside sales and lead qualification'),
  ('OC', 'Onboarding Coordinator', 3, 'Onboarding support'),
  ('BE', 'Billing Executive', 3, 'Billing and invoicing'),
  ('MKT', 'Marketing', 3, 'Marketing campaigns');

-- ============================================
-- 2. USER TABLES
-- ============================================

-- Coaches (Team Leads who conduct assessments)
CREATE TABLE coaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role_id TEXT REFERENCES roles(id),
  region_id TEXT REFERENCES regions(id),
  is_active BOOLEAN DEFAULT true,
  max_trainees INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Trainees (New hires going through training)
CREATE TABLE trainees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role_id TEXT NOT NULL REFERENCES roles(id),
  region_id TEXT NOT NULL REFERENCES regions(id),
  coach_id UUID REFERENCES coaches(id),

  -- Training status
  training_start_date DATE,
  training_end_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',
    'in_training',
    'completed',
    'report_sent',
    'extended',
    'failed'
  )),

  -- Calculated fields
  current_day INTEGER DEFAULT 0,
  total_assessments_required INTEGER DEFAULT 0,
  total_assessments_completed INTEGER DEFAULT 0,
  learning_score DECIMAL(5,2),
  participation_score DECIMAL(5,2),
  final_score DECIMAL(5,2),

  -- Metadata
  performance_flag TEXT CHECK (performance_flag IN ('green', 'orange', 'red')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 3. TRAINING PROGRAM STRUCTURE
-- ============================================

-- Training Days (template for each role)
CREATE TABLE training_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id TEXT REFERENCES roles(id),
  day_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  is_common BOOLEAN DEFAULT false,
  UNIQUE(role_id, day_number)
);

-- Training Activities (what happens each day)
CREATE TABLE training_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  training_day_id UUID REFERENCES training_days(id) ON DELETE CASCADE,
  start_time TIME,
  end_time TIME,
  duration_hours DECIMAL(3,1),
  title TEXT NOT NULL,
  description TEXT,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'briefing', 'self_study', 'assessment', 'review_session',
    'buddy_session', 'mock_test', 'lunch', 'handover'
  )),
  pic TEXT CHECK (pic IN ('trainer', 'player', 'coach', 'tl')),
  content_id UUID,
  assessment_id UUID,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 4. LEARNING CONTENT
-- ============================================

CREATE TABLE learning_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN (
    'slides', 'document', 'video', 'wiki', 'quiz'
  )),
  role_id TEXT REFERENCES roles(id),
  file_url TEXT,
  file_name TEXT,
  external_url TEXT,
  estimated_duration_mins INTEGER,
  is_required BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 5. ASSESSMENTS & SCORING
-- ============================================

CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role_id TEXT REFERENCES roles(id),
  assessment_type TEXT NOT NULL CHECK (assessment_type IN (
    'quiz', 'practical', 'roleplay', 'mock_test', 'video_submission', 'written'
  )),
  scheduled_day INTEGER NOT NULL,
  passing_score INTEGER DEFAULT 80,
  weight_percentage DECIMAL(5,2),
  max_attempts INTEGER DEFAULT 3,
  form_url TEXT,
  instructions TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE assessment_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainee_id UUID NOT NULL REFERENCES trainees(id) ON DELETE CASCADE,
  assessment_id UUID NOT NULL REFERENCES assessments(id),
  coach_id UUID REFERENCES coaches(id),
  score DECIMAL(5,2) NOT NULL,
  passed BOOLEAN GENERATED ALWAYS AS (score >= 80) STORED,
  attempt_number INTEGER DEFAULT 1,
  remarks TEXT,
  highlights TEXT,
  areas_for_improvement TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(trainee_id, assessment_id, attempt_number)
);

-- ============================================
-- 6. PROGRESS TRACKING
-- ============================================

CREATE TABLE trainee_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainee_id UUID NOT NULL REFERENCES trainees(id) ON DELETE CASCADE,
  training_day_id UUID NOT NULL REFERENCES training_days(id),
  activity_id UUID REFERENCES training_activities(id),
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'in_progress', 'completed', 'skipped'
  )),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  UNIQUE(trainee_id, activity_id)
);

-- ============================================
-- 7. BATCHES & SCHEDULING
-- ============================================

CREATE TABLE training_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  region_id TEXT REFERENCES regions(id),
  start_date DATE NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN (
    'scheduled', 'in_progress', 'completed'
  )),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE batch_trainees (
  batch_id UUID REFERENCES training_batches(id) ON DELETE CASCADE,
  trainee_id UUID REFERENCES trainees(id) ON DELETE CASCADE,
  PRIMARY KEY (batch_id, trainee_id)
);

-- ============================================
-- 8. ACTIVITY LOGS
-- ============================================

CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_type TEXT NOT NULL CHECK (log_type IN (
    'welcome_email', 'assessment_scheduled', 'score_submitted',
    'reminder_sent', 'alert_sent', 'report_sent', 'survey_sent', 'status_change'
  )),
  trainee_id UUID REFERENCES trainees(id),
  coach_id UUID REFERENCES coaches(id),
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 9. FEEDBACK & SURVEYS
-- ============================================

CREATE TABLE survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainee_id UUID REFERENCES trainees(id),
  overall_satisfaction INTEGER CHECK (overall_satisfaction BETWEEN 1 AND 5),
  role_confidence INTEGER CHECK (role_confidence BETWEEN 1 AND 5),
  content_quality INTEGER CHECK (content_quality BETWEEN 1 AND 5),
  support_quality INTEGER CHECK (support_quality BETWEEN 1 AND 5),
  most_valuable TEXT,
  needs_improvement TEXT,
  additional_comments TEXT,
  ai_sentiment TEXT CHECK (ai_sentiment IN ('positive', 'neutral', 'negative')),
  ai_themes JSONB,
  ai_summary TEXT,
  ai_urgency TEXT CHECK (ai_urgency IN ('low', 'medium', 'high')),
  ai_confidence DECIMAL(3,2),
  submitted_at TIMESTAMPTZ DEFAULT now(),
  analyzed_at TIMESTAMPTZ
);

-- ============================================
-- 10. INDEXES
-- ============================================

CREATE INDEX idx_trainees_status ON trainees(status);
CREATE INDEX idx_trainees_coach ON trainees(coach_id);
CREATE INDEX idx_trainees_role ON trainees(role_id);
CREATE INDEX idx_assessment_scores_trainee ON assessment_scores(trainee_id);
CREATE INDEX idx_activity_logs_trainee ON activity_logs(trainee_id);
