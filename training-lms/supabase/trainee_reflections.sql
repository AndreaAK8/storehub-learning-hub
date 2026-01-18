-- =====================================================
-- TRAINEE REFLECTIONS TABLE
-- Run this in Supabase SQL Editor
-- =====================================================

-- Create table for storing trainee reflections
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

-- Enable RLS
ALTER TABLE trainee_reflections ENABLE ROW LEVEL SECURITY;

-- Allow trainees to insert their own reflections
CREATE POLICY "Trainees can insert own reflections" ON trainee_reflections
  FOR INSERT WITH CHECK (true);

-- Allow trainers/admins to view all reflections
CREATE POLICY "Allow read on trainee_reflections" ON trainee_reflections
  FOR SELECT USING (true);

-- Create index for faster queries
CREATE INDEX idx_reflections_trainee ON trainee_reflections(trainee_email);
CREATE INDEX idx_reflections_day ON trainee_reflections(day_number);
CREATE INDEX idx_reflections_created ON trainee_reflections(created_at DESC);

-- Verify
SELECT 'trainee_reflections table created successfully' as status;
