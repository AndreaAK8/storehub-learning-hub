-- Schedule Adjustments Table
-- Tracks all reschedules for training activities

CREATE TABLE IF NOT EXISTS schedule_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainee_email TEXT NOT NULL,
  module_id UUID REFERENCES training_modules(id) ON DELETE SET NULL,
  activity_name TEXT NOT NULL,
  original_day INTEGER NOT NULL,
  new_day INTEGER NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('external', 'leave', 'sick', 'pace', 'other')),
  notes TEXT,
  adjusted_by TEXT, -- email of trainer/admin who made the change
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_schedule_adjustments_trainee
ON schedule_adjustments(trainee_email);

CREATE INDEX IF NOT EXISTS idx_schedule_adjustments_activity
ON schedule_adjustments(activity_name);

-- Enable RLS
ALTER TABLE schedule_adjustments ENABLE ROW LEVEL SECURITY;

-- Policy: Admins and coaches can manage adjustments
CREATE POLICY "Admins and coaches can manage adjustments" ON schedule_adjustments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'coach')
    )
  );

-- Policy: Trainees can view their own adjustments
CREATE POLICY "Trainees can view own adjustments" ON schedule_adjustments
  FOR SELECT USING (
    trainee_email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  );

-- Comment on table
COMMENT ON TABLE schedule_adjustments IS 'Tracks reschedules for training activities with reason codes';

-- Reason code meanings:
-- external: Coach/Buddy/Trainer not available
-- leave: Trainee on planned leave
-- sick: Trainee sick/MC
-- pace: Extended learning time needed (slow learner)
-- other: Other reason (see notes)
