-- =====================================================
-- TRAINING LMS - COMPLETE DATABASE SETUP
-- Run this entire script in Supabase SQL Editor
-- =====================================================

-- 1. CREATE TABLES
-- =====================================================

-- Roles table
CREATE TABLE IF NOT EXISTS training_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  short_code TEXT NOT NULL UNIQUE,
  total_days INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Training modules/timetable
CREATE TABLE IF NOT EXISTS training_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID REFERENCES training_roles(id) ON DELETE CASCADE,
  day INTEGER NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  duration_hours DECIMAL(3,1),
  topic TEXT NOT NULL,
  details TEXT,
  type TEXT NOT NULL CHECK (type IN ('Self-Study', 'Trainer-Led', 'Assessment', 'Break', 'Buddy Session', 'Coach Review', 'Self-Prep', 'Self-Work', 'Graduation', 'TL-Led')),
  resource_url TEXT,
  is_common BOOLEAN DEFAULT false,
  sort_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Training resources
CREATE TABLE IF NOT EXISTS training_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID REFERENCES training_roles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_type TEXT,
  url TEXT,
  day INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Trainee progress tracking
CREATE TABLE IF NOT EXISTS trainee_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainee_email TEXT NOT NULL,
  module_id UUID REFERENCES training_modules(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(trainee_email, module_id)
);

-- Enable RLS
ALTER TABLE training_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainee_progress ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow public read on training_roles" ON training_roles;
DROP POLICY IF EXISTS "Allow public read on training_modules" ON training_modules;
DROP POLICY IF EXISTS "Allow public read on training_resources" ON training_resources;
DROP POLICY IF EXISTS "Users can manage own progress" ON trainee_progress;

-- Allow public read for training content
CREATE POLICY "Allow public read on training_roles" ON training_roles FOR SELECT USING (true);
CREATE POLICY "Allow public read on training_modules" ON training_modules FOR SELECT USING (true);
CREATE POLICY "Allow public read on training_resources" ON training_resources FOR SELECT USING (true);
CREATE POLICY "Users can manage own progress" ON trainee_progress FOR ALL USING (true);

-- 2. INSERT ROLES
-- =====================================================

INSERT INTO training_roles (name, short_code, total_days) VALUES
  ('All Roles', 'ALL', 2),
  ('Customer Success Manager', 'CSM', 5),
  ('Business Consultant', 'BC', 6),
  ('Merchant Care', 'MC', 4),
  ('Merchant Onboarding Manager', 'MOM', 5),
  ('Onboarding Specialist', 'OS', 5),
  ('Onboarding Coordinator', 'OC', 5),
  ('Sales Coordinator', 'SC', 5)
ON CONFLICT (name) DO NOTHING;

-- 3. INSERT DAY 1-2 COMMON MODULES (All Roles)
-- =====================================================

INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, is_common, sort_order)
SELECT
  id,
  day,
  start_time,
  end_time,
  duration_hours,
  topic,
  details,
  type,
  true,
  sort_order
FROM training_roles, (VALUES
  -- DAY 1
  (1, '14:00', '15:00', 1.0, 'Training Briefing', 'Trainer briefs new hires on the self-study structure and sets clear expectations for the training.', 'Trainer-Led', 1),
  (1, '15:00', '16:00', 1.0, 'All-in-One - Software', 'Self-study Module 1: Software. Learn everything about StoreHub product offerings and features. Update learning progress to trainer by 6:00pm.', 'Self-Study', 2),
  (1, '16:00', '17:00', 1.0, 'All-in-One - Hardware', 'Self-study Module 2: Hardware. Learn about StoreHub hardware devices and setup.', 'Self-Study', 3),
  (1, '17:00', '18:30', 1.5, 'All-in-One - Features', 'Self-study Module 3: Features. Deep dive into StoreHub features and capabilities.', 'Self-Study', 4),

  -- DAY 2
  (2, '09:30', '13:00', 3.5, 'System Navigation & Merchant Profile', 'Self-study Modules 4 & 5: System Navigation and Merchant Profile. By the end of this session, all players must complete the slides.', 'Self-Study', 5),
  (2, '13:00', '14:00', 1.0, 'Lunch Break', 'Lunch break', 'Break', 6),
  (2, '14:00', '15:00', 1.0, 'System Navigation (Cont.)', 'Continue self-study on System Navigation and Merchant Profile modules.', 'Self-Study', 7),
  (2, '15:00', '16:00', 1.0, 'Product Demo', 'Trainer conducts face-to-face demo session on Hardware devices.', 'Trainer-Led', 8),
  (2, '16:00', '16:30', 0.5, 'Sync Up', 'Quick sync up to address concerns on topics learned.', 'Trainer-Led', 9),
  (2, '16:30', '18:00', 1.5, 'Product Knowledge Quiz', 'Complete 48 questions with 80% passing score. Open-book test using slides as reference. No retakes if failed.', 'Assessment', 10),
  (2, '18:00', '18:30', 0.5, 'Debrief & Role Specific Prep', 'Address concerns and advise next steps for role-specific training.', 'Trainer-Led', 11)
) AS data(day, start_time, end_time, duration_hours, topic, details, type, sort_order)
WHERE training_roles.short_code = 'ALL';

-- 4. INSERT CSM MODULES (Days 3-5)
-- =====================================================

INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, is_common, sort_order)
SELECT
  id,
  day,
  start_time,
  end_time,
  duration_hours,
  topic,
  details,
  type,
  false,
  sort_order
FROM training_roles, (VALUES
  -- DAY 3
  (3, '09:30', '11:30', 2.0, 'Advanced System & Features', 'Topics: Reports, CSV import/export, Promotions, Pricebooks, QR Order & Pay, Beep Delivery, Membership, Engage', 'Self-Study', 1),
  (3, '11:30', '13:00', 1.5, 'Advanced Troubleshooting', 'Topics: Networking basics, printer troubleshooting (IP addresses, feed tests, printer resets, printer configuration)', 'Self-Study', 2),
  (3, '13:00', '14:00', 1.0, 'Lunch Break', 'Lunch break', 'Break', 3),
  (3, '14:00', '15:00', 1.0, 'Advance System & Networking Quiz', '35 questions, 80% pass required, open-book. Discuss with trainer before submitting.', 'Assessment', 4),
  (3, '15:00', '15:30', 0.5, 'Sync Up with Trainer', 'Address concerns and clarify concepts.', 'Trainer-Led', 5),
  (3, '15:30', '16:30', 1.0, 'Hardware Assessment', 'Demonstrate: Hardware assembly, printer search, feed test, printer reset, configuration, IP troubleshooting. 80% pass required.', 'Assessment', 6),
  (3, '16:30', '17:30', 1.0, 'CSM Tools & Supply Chain', 'Internal tools: Intercom, Aircall, supply chain processes', 'Self-Study', 7),
  (3, '17:30', '18:30', 1.0, 'Begin CSM Assessment', 'Review instructions and start working (due end of Day 4)', 'Self-Work', 8),

  -- DAY 4
  (4, '09:30', '11:30', 2.0, 'Buddy Session with Senior CSM', 'Shadow a senior CSM to understand daily duties. Take detailed notes in Buddy Checklist. Senior will provide feedback on your engagement.', 'Buddy Session', 9),
  (4, '11:30', '12:00', 0.5, 'CSM Assessment (Cont.)', 'Continue working on your assessment.', 'Self-Work', 10),
  (4, '12:00', '13:00', 1.0, 'Lunch Break', 'Lunch break', 'Break', 11),
  (4, '13:00', '14:00', 1.0, 'Mock Test Flow Briefing', 'Learn what to expect during Mock Test and how scoring works.', 'Trainer-Led', 12),
  (4, '14:00', '18:30', 4.5, 'CSM Assessment (Cont.)', 'Focus time to complete and submit by end of day.', 'Self-Work', 13),

  -- DAY 5
  (5, '09:30', '10:30', 1.0, 'Self-Preparation for Mock Test', 'Mental preparation: Recap role-specific processes and product knowledge.', 'Self-Prep', 14),
  (5, '10:30', '12:00', 1.5, 'Review Session with Coach', 'Present your CSM Assessment to your coach. Receive feedback and coaching. Coach completes scoring.', 'Coach Review', 15),
  (5, '12:00', '13:00', 1.0, 'Lunch Break', 'Lunch break', 'Break', 16),
  (5, '13:00', '15:00', 2.0, 'Region-Specific Training', 'PH: BIR Training (study BIR slides). MY: Mock Preparation (quick recap of Day 1-2 training slides)', 'Self-Study', 17),
  (5, '15:00', '16:00', 1.0, 'Mock Test!', '2 rounds of roleplay with spontaneous scenarios. Final performance assessment (45% of total score!). 80% pass required.', 'Assessment', 18),
  (5, '16:00', '18:30', 2.5, 'Handover to Team Lead', 'You have officially graduated! Handover to team lead.', 'Graduation', 19)
) AS data(day, start_time, end_time, duration_hours, topic, details, type, sort_order)
WHERE training_roles.short_code = 'CSM';

-- 5. INSERT BUSINESS CONSULTANT MODULES (Days 3-6)
-- =====================================================

INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, is_common, sort_order)
SELECT
  id,
  day,
  start_time,
  end_time,
  duration_hours,
  topic,
  details,
  type,
  false,
  sort_order
FROM training_roles, (VALUES
  -- DAY 3 (Pitching + SPIN)
  (3, '09:30', '10:00', 0.5, 'Pitching Video & Slides', 'Self Study pitching slides (F&B and Retail) and watch video examples to grasp the pitching flow for Assessment.', 'Self-Study', 1),
  (3, '10:00', '11:00', 1.0, 'People Engagement with BC TL', 'BC TL trains on Pitching flow using People Engagement slides. Essential methodology for BC journey.', 'TL-Led', 2),
  (3, '11:00', '12:00', 1.0, 'F&B & Retail Pitching Assessment', 'Pitch to trainer using F&B slides. Presentation and soft skills evaluated.', 'Assessment', 3),
  (3, '12:00', '13:00', 1.0, 'Lunch Break', 'Lunch break', 'Break', 4),
  (3, '13:00', '14:00', 1.0, 'SPIN Tasks - Trial Run', 'Practice SPIN based on assigned merchant profile. 30 min prep, 30 min performance. Record using Lark Video.', 'Self-Work', 5),
  (3, '14:00', '15:00', 1.0, 'SPIN Tasks - Video Review', 'Watch SPIN video samples (F&B and Retail recordings)', 'Self-Study', 6),
  (3, '15:00', '16:00', 1.0, 'BC TL Review Session', 'BC TL shares feedback on improvement areas.', 'TL-Led', 7),
  (3, '16:00', '17:00', 1.0, 'SPIN Tasks - Graded Recording', 'Record graded SPIN assessment using Lark Video. Share to BC TL.', 'Assessment', 8),
  (3, '17:00', '17:30', 0.5, 'Closing Task Prep', 'Review Closing and Product sample video for Closing Assessment.', 'Self-Study', 9),
  (3, '17:30', '18:30', 1.0, 'BC TL Review - SPIN 1', 'Feedback on SPIN 1. Set expectations for Closing 1 assessment.', 'TL-Led', 10),

  -- DAY 4 (Closing)
  (4, '09:30', '11:30', 2.0, 'Closing Task - Closing 1', 'Record Closing 1 assessment using Lark Video. Share to BC TL.', 'Assessment', 11),
  (4, '11:30', '12:30', 1.0, 'Setup BackOffice and POS', 'Add products on BackOffice and display on POS for Closing 2 scenario. Include Product Demo.', 'Self-Work', 12),
  (4, '12:30', '13:30', 1.0, 'Lunch Break', 'Lunch break', 'Break', 13),
  (4, '13:30', '14:30', 1.0, 'BC TL Review - Closing 1', 'Feedback on Closing 1. Set expectations for Closing 2.', 'TL-Led', 14),
  (4, '14:30', '16:30', 2.0, 'Closing Task - Closing 2', 'Record Closing 2 with Product demo using Lark Video. Share to BC TL.', 'Assessment', 15),
  (4, '16:30', '17:30', 1.0, 'Full Pitching Overview', 'Understand overall process of BC demo sessions.', 'Self-Study', 16),
  (4, '17:30', '18:30', 1.0, 'BC TL Review - Closing 2', 'Feedback on Closing 2. Set expectations for Full Pitching.', 'TL-Led', 17),

  -- DAY 5 (Full Pitching)
  (5, '09:30', '12:00', 2.5, 'Full Pitching - Retail', 'Graded Full Pitching video (Retail). SPIN + Product Demo + Closing. Share to TLs.', 'Assessment', 18),
  (5, '12:00', '13:00', 1.0, 'Lunch Break', 'Lunch break', 'Break', 19),
  (5, '13:00', '15:30', 2.5, 'Full Pitching - F&B', 'Graded Full Pitching video (F&B). SPIN + Product Demo + Closing. Share to TLs.', 'Assessment', 20),
  (5, '15:30', '16:30', 1.0, 'Mock Test Briefing', 'Go through Mock Test Flow, provide timeslot & scenarios.', 'Trainer-Led', 21),
  (5, '16:30', '17:30', 1.0, 'Mock Scenario Prep', 'Setup BackOffice and POS device for mock test scenario.', 'Self-Prep', 22),
  (5, '17:30', '18:30', 1.0, 'BC TL Review - Full Pitching', 'Feedback on Full Pitching. Set expectations for Mock Test.', 'TL-Led', 23),

  -- DAY 6 (Mock Test)
  (6, '09:30', '10:30', 1.0, 'Mock Preparation', 'Final preparation for Mock Test.', 'Self-Prep', 24),
  (6, '10:30', '11:30', 1.0, 'Mock Test: Retail', 'Mock test via Lark meeting. Join on time.', 'Assessment', 25),
  (6, '11:30', '12:00', 0.5, 'Prep Time', 'Absorb improvement areas and apply in next assessment.', 'Self-Prep', 26),
  (6, '12:00', '13:00', 1.0, 'Mock Test: F&B', 'Mock test via Lark meeting. Join on time.', 'Assessment', 27),
  (6, '13:00', '14:00', 1.0, 'Lunch Break', 'Lunch break', 'Break', 28),
  (6, '14:00', '15:00', 1.0, 'Salesforce Playbook', 'Document information based on Mock scenario using Salesforce.', 'Self-Work', 29),
  (6, '15:00', '16:00', 1.0, 'BC Process Review', 'Review all BC processes: handoff templates, order checklists, meeting playbooks.', 'Self-Study', 30),
  (6, '16:00', '18:30', 2.5, 'Handover', 'BC TL reveals score and provides next steps. Graduation!', 'Graduation', 31)
) AS data(day, start_time, end_time, duration_hours, topic, details, type, sort_order)
WHERE training_roles.short_code = 'BC';

-- 6. INSERT MERCHANT CARE MODULES (Days 3-4)
-- =====================================================

INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, is_common, sort_order)
SELECT
  id,
  day,
  start_time,
  end_time,
  duration_hours,
  topic,
  details,
  type,
  false,
  sort_order
FROM training_roles, (VALUES
  -- DAY 3
  (3, '09:30', '11:30', 2.0, 'Advanced System Navigation', 'Topics: Reports, CSV import/export, Promotions, Pricebooks, QR Order & Pay, Beep Delivery, Membership, Engage.', 'Self-Study', 1),
  (3, '11:30', '13:00', 1.5, 'Advanced Troubleshooting', 'Networking basics & printer troubleshooting: IP Address, feed test, reset printer, configure printer.', 'Self-Study', 2),
  (3, '13:00', '14:00', 1.0, 'Lunch Break', 'Lunch break', 'Break', 3),
  (3, '14:00', '14:30', 0.5, 'Quick Sync Up', 'Address concerns on topics learned.', 'Trainer-Led', 4),
  (3, '14:30', '15:30', 1.0, 'Advance System & Networking Quiz', '35 questions, 80% pass required, open-book test.', 'Assessment', 5),
  (3, '15:30', '17:30', 2.0, 'Brand Servicing', 'Self-study essential soft skills for merchant interactions.', 'Self-Study', 6),
  (3, '17:30', '18:30', 1.0, 'Care Tools & Supply Chain', 'Internal tools: Intercom, Aircall. Supply chain processes.', 'Self-Study', 7),

  -- DAY 4
  (4, '09:30', '10:30', 1.0, 'Hardware Assessment', 'Demonstrate troubleshooting: Hardware assembly, printer search, feed test, reset, configure, IP fix. 80% pass required.', 'Assessment', 8),
  (4, '10:30', '11:30', 1.0, 'Case Study Review', 'Review Intercom tickets to understand conversation flow. Practice for Mock Test.', 'Self-Study', 9),
  (4, '11:30', '12:30', 1.0, 'Self-Prepare for Mock Test', 'Revise all slides in preparation.', 'Self-Prep', 10),
  (4, '13:00', '14:00', 1.0, 'Lunch Break', 'Lunch break', 'Break', 11),
  (4, '14:00', '17:00', 3.0, 'Mock Test!', 'Pass mock test by meeting requirements. Trainer creates ticket through care.storehub.com.', 'Assessment', 12),
  (4, '17:00', '18:30', 1.5, 'Handover to TL', 'Graduation and handover to Team Lead.', 'Graduation', 13)
) AS data(day, start_time, end_time, duration_hours, topic, details, type, sort_order)
WHERE training_roles.short_code = 'MC';

-- 7. INSERT ONBOARDING COORDINATOR MODULES (Days 3-5)
-- =====================================================

INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, is_common, sort_order)
SELECT
  id,
  day,
  start_time,
  end_time,
  duration_hours,
  topic,
  details,
  type,
  false,
  sort_order
FROM training_roles, (VALUES
  -- DAY 3
  (3, '09:30', '11:30', 2.0, 'Advanced System & Features', 'Topics: Reports, CSV import/export, Promotions, Pricebooks, QR Order & Pay, Beep Delivery, Membership, Engage', 'Self-Study', 1),
  (3, '11:30', '13:00', 1.5, 'Advanced Troubleshooting', 'Networking basics, printer troubleshooting (IP addresses, feed tests, resets, configuration)', 'Self-Study', 2),
  (3, '13:00', '14:00', 1.0, 'Lunch Break', 'Lunch break', 'Break', 3),
  (3, '14:00', '15:00', 1.0, 'Advance System & Networking Quiz', '35 questions, 80% pass required, open-book.', 'Assessment', 4),
  (3, '15:00', '15:30', 0.5, 'Sync Up with Trainer', 'Address concerns and clarify concepts.', 'Trainer-Led', 5),
  (3, '15:30', '16:30', 1.0, 'Hardware Assessment', '80% pass required. Assembly, printer operations, IP troubleshooting.', 'Assessment', 6),
  (3, '16:30', '18:30', 2.0, 'OC Tools & Supply Chain', 'Internal tools and supply chain processes.', 'Self-Study', 7),

  -- DAY 4
  (4, '09:30', '11:30', 2.0, 'Buddy Session', 'Shadow a senior OC to understand daily duties. Complete Buddy Checklist.', 'Buddy Session', 8),
  (4, '11:30', '13:00', 1.5, 'Menu Setup Practice', 'Practice menu setup procedures.', 'Self-Work', 9),
  (4, '13:00', '14:00', 1.0, 'Lunch Break', 'Lunch break', 'Break', 10),
  (4, '14:00', '16:00', 2.0, 'Menu Setup Assessment', 'Complete menu setup assessment.', 'Assessment', 11),
  (4, '16:00', '18:30', 2.5, 'Mock Test Preparation', 'Prepare for mock test.', 'Self-Prep', 12),

  -- DAY 5
  (5, '09:30', '10:30', 1.0, 'Review Session with Coach', 'Present work to coach. Receive feedback.', 'Coach Review', 13),
  (5, '10:30', '12:00', 1.5, 'Mock Test!', 'Final performance assessment. 80% pass required.', 'Assessment', 14),
  (5, '12:00', '13:00', 1.0, 'Lunch Break', 'Lunch break', 'Break', 15),
  (5, '13:00', '18:30', 5.5, 'Handover to Team Lead', 'Graduation and handover!', 'Graduation', 16)
) AS data(day, start_time, end_time, duration_hours, topic, details, type, sort_order)
WHERE training_roles.short_code = 'OC';

-- 8. INSERT SALES COORDINATOR MODULES (Days 3-5)
-- =====================================================

INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, is_common, sort_order)
SELECT
  id,
  day,
  start_time,
  end_time,
  duration_hours,
  topic,
  details,
  type,
  false,
  sort_order
FROM training_roles, (VALUES
  -- DAY 3
  (3, '09:30', '11:30', 2.0, 'Advanced System & Features', 'Topics: Reports, CSV import/export, Promotions, Pricebooks, QR Order & Pay, Beep Delivery, Membership, Engage', 'Self-Study', 1),
  (3, '11:30', '13:00', 1.5, 'Advanced Troubleshooting', 'Networking basics, printer troubleshooting', 'Self-Study', 2),
  (3, '13:00', '14:00', 1.0, 'Lunch Break', 'Lunch break', 'Break', 3),
  (3, '14:00', '15:00', 1.0, 'Advance System & Networking Quiz', '35 questions, 80% pass required, open-book.', 'Assessment', 4),
  (3, '15:00', '15:30', 0.5, 'Sync Up with Trainer', 'Address concerns and clarify concepts.', 'Trainer-Led', 5),
  (3, '15:30', '16:30', 1.0, 'Hardware Assessment', '80% pass required.', 'Assessment', 6),
  (3, '16:30', '18:30', 2.0, 'SC Tools & Processes', 'Sales Coordinator specific tools and processes.', 'Self-Study', 7),

  -- DAY 4
  (4, '09:30', '11:30', 2.0, 'Buddy Session', 'Shadow a senior SC to understand daily duties.', 'Buddy Session', 8),
  (4, '11:30', '13:00', 1.5, 'SC Assessment Work', 'Work on SC specific assessment.', 'Self-Work', 9),
  (4, '13:00', '14:00', 1.0, 'Lunch Break', 'Lunch break', 'Break', 10),
  (4, '14:00', '18:30', 4.5, 'SC Assessment (Cont.)', 'Continue and complete SC assessment.', 'Self-Work', 11),

  -- DAY 5
  (5, '09:30', '10:30', 1.0, 'Review Session with Coach', 'Present work to coach. Receive feedback.', 'Coach Review', 12),
  (5, '10:30', '12:00', 1.5, 'Mock Test!', 'Final performance assessment. 80% pass required.', 'Assessment', 13),
  (5, '12:00', '13:00', 1.0, 'Lunch Break', 'Lunch break', 'Break', 14),
  (5, '13:00', '18:30', 5.5, 'Handover to Team Lead', 'Graduation and handover!', 'Graduation', 15)
) AS data(day, start_time, end_time, duration_hours, topic, details, type, sort_order)
WHERE training_roles.short_code = 'SC';

-- 9. CREATE USEFUL VIEWS
-- =====================================================

-- View: Get full schedule for a role (combines common + role-specific)
CREATE OR REPLACE VIEW v_full_training_schedule AS
SELECT
  COALESCE(r.name, 'All Roles') as role_name,
  r.short_code,
  m.day,
  m.start_time,
  m.end_time,
  m.duration_hours,
  m.topic,
  m.details,
  m.type,
  m.is_common,
  m.sort_order,
  m.id as module_id
FROM training_modules m
LEFT JOIN training_roles r ON m.role_id = r.id
ORDER BY m.day, m.sort_order;

-- =====================================================
-- DONE! Your training database is ready.
-- =====================================================
