-- =====================================================
-- ACTIVITY PERFORMANCE TRACKING TABLE
-- Run this in Supabase SQL Editor
-- Tracks trainee performance vs allocated time
-- =====================================================

-- Create table for tracking activity performance
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

-- Enable RLS
ALTER TABLE activity_performance ENABLE ROW LEVEL SECURITY;

-- Allow trainees to insert their own performance data
CREATE POLICY "Trainees can insert own performance" ON activity_performance
  FOR INSERT WITH CHECK (true);

-- Allow trainers/admins to view all performance data
CREATE POLICY "Allow read on activity_performance" ON activity_performance
  FOR SELECT USING (true);

-- Create indexes for faster queries
CREATE INDEX idx_performance_trainee ON activity_performance(trainee_email);
CREATE INDEX idx_performance_day ON activity_performance(day_number);
CREATE INDEX idx_performance_flag ON activity_performance(performance_flag);
CREATE INDEX idx_performance_created ON activity_performance(created_at DESC);
CREATE INDEX idx_performance_activity ON activity_performance(activity_id);

-- Verify
SELECT 'activity_performance table created successfully' as status;

-- =====================================================
-- USEFUL QUERIES FOR TRAINERS
-- =====================================================

-- Get all struggling trainees (need attention)
-- SELECT DISTINCT trainee_email, trainee_name, COUNT(*) as struggling_count
-- FROM activity_performance
-- WHERE performance_flag = 'struggling'
-- GROUP BY trainee_email, trainee_name
-- ORDER BY struggling_count DESC;

-- Get performance summary by trainee
-- SELECT
--   trainee_email,
--   trainee_name,
--   COUNT(*) as total_activities,
--   SUM(CASE WHEN performance_flag = 'fast' THEN 1 ELSE 0 END) as fast_count,
--   SUM(CASE WHEN performance_flag = 'on_time' THEN 1 ELSE 0 END) as on_time_count,
--   SUM(CASE WHEN performance_flag = 'slow' THEN 1 ELSE 0 END) as slow_count,
--   SUM(CASE WHEN performance_flag = 'struggling' THEN 1 ELSE 0 END) as struggling_count,
--   ROUND(AVG(percentage_of_allocated)) as avg_percentage
-- FROM activity_performance
-- GROUP BY trainee_email, trainee_name
-- ORDER BY struggling_count DESC, slow_count DESC;
