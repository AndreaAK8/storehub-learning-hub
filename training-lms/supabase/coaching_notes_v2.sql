-- Coaching Notes V2 - With Visibility Options
-- Run this in Supabase SQL Editor to add shared notes feature

-- Add visibility column (private, trainer, trainee, all)
ALTER TABLE coaching_notes
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'private'
CHECK (visibility IN ('private', 'trainer', 'trainee', 'all'));

-- Add category/tag for organizing notes
ALTER TABLE coaching_notes
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general'
CHECK (category IN ('general', 'performance', 'feedback', 'action_item', 'concern'));

-- Drop existing policies to recreate with visibility logic
DROP POLICY IF EXISTS "Coaches can view own notes" ON coaching_notes;
DROP POLICY IF EXISTS "Coaches can insert own notes" ON coaching_notes;
DROP POLICY IF EXISTS "Coaches can update own notes" ON coaching_notes;
DROP POLICY IF EXISTS "Coaches can delete own notes" ON coaching_notes;
DROP POLICY IF EXISTS "Admins can view all notes" ON coaching_notes;
DROP POLICY IF EXISTS "Trainers can view trainer-visible notes" ON coaching_notes;
DROP POLICY IF EXISTS "Trainees can view their notes" ON coaching_notes;

-- Coaches can view their own notes
CREATE POLICY "Coaches can view own notes" ON coaching_notes
  FOR SELECT USING (
    coach_email = (SELECT email FROM profiles WHERE id = auth.uid())
  );

-- Coaches can insert notes
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

-- Admins/Trainers can view notes marked as 'trainer' or 'all'
CREATE POLICY "Trainers can view trainer-visible notes" ON coaching_notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'trainer')
    )
    AND visibility IN ('trainer', 'all')
  );

-- Trainees can view notes marked as 'trainee' or 'all' for themselves
CREATE POLICY "Trainees can view their notes" ON coaching_notes
  FOR SELECT USING (
    trainee_email = (SELECT email FROM profiles WHERE id = auth.uid())
    AND visibility IN ('trainee', 'all')
  );

-- Admins can manage all notes
CREATE POLICY "Admins can manage all notes" ON coaching_notes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Verify
SELECT 'coaching_notes updated with visibility and category columns' as status;
