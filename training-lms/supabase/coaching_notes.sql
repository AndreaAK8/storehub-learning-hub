-- Coaching Notes Table
-- Private notes per trainee, visible only to the assigned coach

CREATE TABLE IF NOT EXISTS coaching_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  coach_email TEXT NOT NULL,
  trainee_email TEXT NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_coaching_notes_coach_trainee
  ON coaching_notes(coach_email, trainee_email);

CREATE INDEX IF NOT EXISTS idx_coaching_notes_trainee
  ON coaching_notes(trainee_email);

-- Row Level Security
ALTER TABLE coaching_notes ENABLE ROW LEVEL SECURITY;

-- Coaches can only see their own notes
CREATE POLICY "Coaches can view own notes" ON coaching_notes
  FOR SELECT USING (
    coach_email = (SELECT email FROM profiles WHERE id = auth.uid())
  );

-- Coaches can insert their own notes
CREATE POLICY "Coaches can insert own notes" ON coaching_notes
  FOR INSERT WITH CHECK (
    coach_email = (SELECT email FROM profiles WHERE id = auth.uid())
  );

-- Coaches can update their own notes
CREATE POLICY "Coaches can update own notes" ON coaching_notes
  FOR UPDATE USING (
    coach_email = (SELECT email FROM profiles WHERE id = auth.uid())
  );

-- Coaches can delete their own notes
CREATE POLICY "Coaches can delete own notes" ON coaching_notes
  FOR DELETE USING (
    coach_email = (SELECT email FROM profiles WHERE id = auth.uid())
  );

-- Admins can see all notes
CREATE POLICY "Admins can view all notes" ON coaching_notes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
