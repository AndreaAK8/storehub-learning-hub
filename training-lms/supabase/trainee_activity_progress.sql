-- Activity Performance Table (Updated)
-- Tracks when trainees complete each activity with timing data
-- Run this in Supabase SQL Editor to update the existing table

-- Add new columns if they don't exist
ALTER TABLE activity_performance
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed',
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ DEFAULT now();

-- Add unique constraint for upsert (if not exists)
-- Note: Run this only if the constraint doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'activity_performance_trainee_activity_unique'
  ) THEN
    ALTER TABLE activity_performance
    ADD CONSTRAINT activity_performance_trainee_activity_unique
    UNIQUE (trainee_email, activity_id);
  END IF;
END $$;

-- Index for fast lookups by trainee
CREATE INDEX IF NOT EXISTS idx_activity_perf_email ON activity_performance(trainee_email);

-- Index for querying by role and day
CREATE INDEX IF NOT EXISTS idx_activity_perf_role_day ON activity_performance(role_code, day_number);

-- Index for completed activities today (for trainer dashboard)
CREATE INDEX IF NOT EXISTS idx_activity_perf_completed ON activity_performance(completed_at);

-- Enable RLS if not already
ALTER TABLE activity_performance ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can insert performance" ON activity_performance;
DROP POLICY IF EXISTS "Anyone can view performance" ON activity_performance;
DROP POLICY IF EXISTS "Service role full access" ON activity_performance;

-- Policy: Allow inserts from authenticated users and service role
CREATE POLICY "Anyone can insert performance" ON activity_performance
  FOR INSERT WITH CHECK (true);

-- Policy: Allow reads from authenticated users
CREATE POLICY "Anyone can view performance" ON activity_performance
  FOR SELECT USING (true);

-- Policy: Service role can do everything (for API)
CREATE POLICY "Service role full access" ON activity_performance
  FOR ALL USING (auth.role() = 'service_role');

-- Grant access
GRANT ALL ON activity_performance TO authenticated;
GRANT ALL ON activity_performance TO service_role;

-- ============================================
-- USEFUL QUERIES FOR TRAINERS
-- ============================================

-- Get all progress for a specific trainee
-- SELECT * FROM activity_performance WHERE trainee_email = 'jade@example.com' ORDER BY day_number, completed_at;

-- Get today's completions (live feed for trainer)
-- SELECT trainee_name, activity_title, day_number, performance_flag, completed_at
-- FROM activity_performance
-- WHERE completed_at::date = CURRENT_DATE
-- ORDER BY completed_at DESC;

-- Get trainees who are struggling (slow on multiple activities)
-- SELECT trainee_email, trainee_name, COUNT(*) as slow_count
-- FROM activity_performance
-- WHERE performance_flag IN ('slow', 'struggling')
-- GROUP BY trainee_email, trainee_name
-- HAVING COUNT(*) > 2;

-- Get average completion times by activity (find hard activities)
-- SELECT activity_title,
--        AVG(actual_seconds) as avg_time_seconds,
--        AVG(percentage_of_allocated) as avg_pct_of_allocated,
--        COUNT(*) as completions
-- FROM activity_performance
-- GROUP BY activity_title
-- ORDER BY avg_pct_of_allocated DESC;
