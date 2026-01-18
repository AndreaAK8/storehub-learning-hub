-- =====================================================
-- RUN ALL NEW TABLES - Single Execution
-- Copy and paste this entire file into Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. TRAINEE REFLECTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS trainee_reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainee_email TEXT NOT NULL,
  trainee_name TEXT,
  role_code TEXT,
  day_number INTEGER NOT NULL,
  confusing_topic TEXT,
  improvement_notes TEXT,
  confidence_level INTEGER CHECK (confidence_level BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE trainee_reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainees can insert own reflections" ON trainee_reflections
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read on trainee_reflections" ON trainee_reflections
  FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_reflections_trainee ON trainee_reflections(trainee_email);
CREATE INDEX IF NOT EXISTS idx_reflections_day ON trainee_reflections(day_number);
CREATE INDEX IF NOT EXISTS idx_reflections_created ON trainee_reflections(created_at DESC);

-- =====================================================
-- 2. ACTIVITY PERFORMANCE TRACKING TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS activity_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainee_email TEXT NOT NULL,
  trainee_name TEXT,
  role_code TEXT,
  day_number INTEGER NOT NULL,
  activity_id TEXT NOT NULL,
  activity_title TEXT,
  activity_type TEXT,
  allocated_seconds INTEGER NOT NULL,
  actual_seconds INTEGER NOT NULL,
  -- Performance flags:
  -- 'fast' = finished in <= 50% of allocated time (fast learner)
  -- 'on_time' = finished in 50-100% of allocated time (on track)
  -- 'slow' = finished in 100-150% of allocated time (slow learner)
  -- 'struggling' = finished in > 150% of allocated time (needs help)
  performance_flag TEXT CHECK (performance_flag IN ('fast', 'on_time', 'slow', 'struggling')),
  percentage_of_allocated INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE activity_performance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainees can insert own performance" ON activity_performance
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read on activity_performance" ON activity_performance
  FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_performance_trainee ON activity_performance(trainee_email);
CREATE INDEX IF NOT EXISTS idx_performance_day ON activity_performance(day_number);
CREATE INDEX IF NOT EXISTS idx_performance_flag ON activity_performance(performance_flag);
CREATE INDEX IF NOT EXISTS idx_performance_created ON activity_performance(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_performance_activity ON activity_performance(activity_id);

-- =====================================================
-- DONE! Verify tables were created
-- =====================================================
SELECT 'SUCCESS: All tables created!' as status;
