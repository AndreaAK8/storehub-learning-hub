-- BC Day 2 Homework + Days 3-6 Modules
-- Run AFTER update_day1_day2_modules.sql (Day 1-2 common modules must exist)
-- Deletes any existing BC-specific modules first, then re-inserts

DO $$
DECLARE
  bc_role_id UUID;
BEGIN
  SELECT id INTO bc_role_id FROM training_roles WHERE short_code = 'BC';

  IF bc_role_id IS NULL THEN
    RAISE EXCEPTION 'BC role not found in training_roles. Make sure short_code = BC exists.';
  END IF;

  -- Remove existing BC-specific modules (is_common = false)
  DELETE FROM training_modules WHERE role_id = bc_role_id AND is_common = false;

  -- ============================================================
  -- DAY 2 HOMEWORK (BC-specific, appended to end of Day 2)
  -- ============================================================
  INSERT INTO training_modules (role_id, day, sort_order, start_time, end_time, duration_hours, topic, type, pic, details, is_common) VALUES
  (bc_role_id, 2, 100, '18:30', '19:30', 1.0,
   'Homework: Pitching Video & Slides',
   'Self-Study', 'player',
   'Self-study pitching slides (F&B and Retail) that will be used once on the field with merchants. Simultaneously watch video example to grasp the pitching flow for Assessment later — presentation and soft skills will be evaluated.',
   false);

  -- ============================================================
  -- DAY 3 — Pitching + SPIN
  -- ============================================================
  INSERT INTO training_modules (role_id, day, sort_order, start_time, end_time, duration_hours, topic, type, pic, details, is_common) VALUES
  (bc_role_id, 3, 1,  '09:30', '10:00', 0.5,
   'Pitching Video & Slides',
   'Self-Study', 'player',
   'Review pitching slides (F&B and Retail) and watch video examples to grasp the pitching flow in preparation for Assessment. Presentation and soft skills will be evaluated.',
   false),

  (bc_role_id, 3, 2,  '10:00', '11:00', 1.0,
   'People Engagement Slides — BC TL Session',
   'TL-Led', 'trainer',
   'BC TL trains player on pitching flow using People Engagement slides. This methodology will be essential throughout your journey as a BC at StoreHub.',
   false),

  (bc_role_id, 3, 3,  '11:00', '12:00', 1.0,
   '[F&B & Retail] Pitching Assessment',
   'Assessment', 'trainer',
   'Pitch to trainer using F&B slides following the recording steps. Trainer evaluates presentation and soft skills.',
   false),

  (bc_role_id, 3, 4,  '12:00', '13:00', 1.0,
   'Lunch',
   'Lunch', '',
   '',
   false),

  (bc_role_id, 3, 5,  '13:00', '14:00', 1.0,
   'SPIN Tasks — Trial Run',
   'Self-Work', 'player',
   '1. Challenge yourself by practicing a SPIN based on the merchant profile assigned to you. Spend 30 minutes to prep and remaining 30 minutes performing SPIN based on the assigned scenario.
2. Record your assessment using Lark Video. Once complete, share recording to BC TL.',
   false),

  (bc_role_id, 3, 6,  '14:00', '15:00', 1.0,
   'SPIN Tasks — SPIN Video Review',
   'Self-Study', 'player',
   'Watch SPIN video samples: F&B SPIN recording and Retail SPIN recording.',
   false),

  (bc_role_id, 3, 7,  '15:00', '16:00', 1.0,
   '[BC TL] Review Session',
   'Coach Review', 'coach',
   'BC TL shares feedback on improvement areas from Trial Run.',
   false),

  (bc_role_id, 3, 8,  '16:00', '17:00', 1.0,
   'SPIN Tasks — SPIN 1 [Graded]',
   'Assessment', 'player',
   '[Graded] Record your assessment using Lark Video. Once complete, share recording to BC TL.',
   false),

  (bc_role_id, 3, 9,  '17:00', '17:30', 0.5,
   'Closing Task — Video, POS & BackOffice Demo Review',
   'Self-Study', 'player',
   'Spend 30 minutes reviewing the Closing and Product sample video to prepare for Closing Assessment.',
   false),

  (bc_role_id, 3, 10, '17:30', '18:30', 1.0,
   '[BC TL] Review Session — SPIN 1',
   'Coach Review', 'coach',
   'BC TL shares feedback on improvement areas. Sets expectations for Closing 1 assessment.',
   false);

  -- ============================================================
  -- DAY 4 — Closing
  -- ============================================================
  INSERT INTO training_modules (role_id, day, sort_order, start_time, end_time, duration_hours, topic, type, pic, details, is_common) VALUES
  (bc_role_id, 4, 1,  '09:30', '11:30', 2.0,
   'Closing Task — Closing 1',
   'Assessment', 'player',
   '[Graded] Record your assessment using Lark Video. Once complete, share recording to BC TL.',
   false),

  (bc_role_id, 4, 2,  '11:30', '12:30', 1.0,
   'Setup BackOffice and POS',
   'Self-Work', 'player',
   'Add products on BackOffice and have them displayed on the POS following the assigned scenario for Closing 2. Include Product Demo in your Closing 2.',
   false),

  (bc_role_id, 4, 3,  '12:30', '13:30', 1.0,
   'Lunch',
   'Lunch', '',
   '',
   false),

  (bc_role_id, 4, 4,  '13:30', '14:30', 1.0,
   '[BC TL] Review Session — Closing 1',
   'Coach Review', 'coach',
   'BC TL shares feedback on improvement areas. Sets expectations for Closing 2 assessment.',
   false),

  (bc_role_id, 4, 5,  '14:30', '16:30', 2.0,
   'Closing Task — Closing 2',
   'Assessment', 'player',
   '[Graded] Record your assessment including Product Demo using Lark Video. Once complete, share recording to BC TL.',
   false),

  (bc_role_id, 4, 6,  '16:30', '17:30', 1.0,
   'Full Pitching — Overview',
   'Self-Study', 'player',
   'Understand the overall process of how Business Consultants conduct demo sessions. Review the quick guide to adding products in BackOffice and POS.',
   false),

  (bc_role_id, 4, 7,  '17:30', '18:30', 1.0,
   '[BC TL] Review Session — Closing 2',
   'Coach Review', 'coach',
   'BC TL shares feedback on improvement areas. Sets expectations for Full Pitching Assessment.',
   false),

  (bc_role_id, 4, 100, '18:30', '19:30', 1.0,
   'Homework: Full Pitching Prep',
   'Self-Study', 'player',
   'Continue reviewing and prepare for Full Pitching assessment on Day 5.',
   false);

  -- ============================================================
  -- DAY 5 — Full Pitching
  -- ============================================================
  INSERT INTO training_modules (role_id, day, sort_order, start_time, end_time, duration_hours, topic, type, pic, details, is_common) VALUES
  (bc_role_id, 5, 1,  '09:30', '12:00', 2.5,
   'Full Pitching — Retail',
   'Assessment', 'player',
   '[Graded] Video should contain SPIN + Product Demo + Closing (full pitching flow).
1. Refer to the scenarios list for your assigned scenario and complete the recording on time — delays impact the TL schedule.
2. Once complete, share Lark video recording to TLs.',
   false),

  (bc_role_id, 5, 2,  '12:00', '13:00', 1.0,
   'Lunch',
   'Lunch', '',
   '',
   false),

  (bc_role_id, 5, 3,  '13:00', '15:30', 2.5,
   'Full Pitching — F&B',
   'Assessment', 'player',
   '[Graded] Video should contain SPIN + Product Demo + Closing (full pitching flow).
1. Refer to the scenarios list for your assigned scenario and complete the recording on time — delays impact the TL schedule.
2. Once complete, share Lark video recording to TLs.',
   false),

  (bc_role_id, 5, 4,  '15:30', '16:30', 1.0,
   'Mock Test Briefing',
   'Trainer-Led', 'trainer',
   'Trainer goes through Mock Test flow with players, provides mock test timeslot and scenarios to prepare.',
   false),

  (bc_role_id, 5, 5,  '16:30', '17:30', 1.0,
   'Mock Scenario Prep',
   'Self-Work', 'player',
   'Setup BackOffice and POS device following mock test scenario.',
   false),

  (bc_role_id, 5, 6,  '17:30', '18:30', 1.0,
   '[BC TL] Review Session — Full Pitching',
   'Coach Review', 'coach',
   'BC TL shares feedback on improvement areas. Sets expectations for Mock Test.',
   false),

  (bc_role_id, 5, 100, '18:30', '19:30', 1.0,
   'Homework: Mock Scenario Prep',
   'Self-Work', 'player',
   'Setup BackOffice and POS device following mock test scenario in preparation for Day 6.',
   false);

  -- ============================================================
  -- DAY 6 — Mock Test & Graduation
  -- ============================================================
  INSERT INTO training_modules (role_id, day, sort_order, start_time, end_time, duration_hours, topic, type, pic, details, is_common) VALUES
  (bc_role_id, 6, 1,  '09:30', '10:30', 1.0,
   'Mock Preparation',
   'Self-Study', 'player',
   'Prepare for Mock Test — review your notes, scenarios, and improvement areas from previous review sessions.',
   false),

  (bc_role_id, 6, 2,  '10:30', '11:30', 1.0,
   'Mock Test — Retail',
   'Assessment', 'trainer',
   'BC TL carries out mock test (refer to Mock Schedule). Player joins Lark meeting link on time.',
   false),

  (bc_role_id, 6, 3,  '11:30', '12:00', 0.5,
   'Prep Time',
   'Self-Study', 'player',
   'Use this time to absorb the areas of improvement highlighted by the TL and apply these improvements in the next assessment.',
   false),

  (bc_role_id, 6, 4,  '12:00', '13:00', 1.0,
   'Mock Test — F&B',
   'Assessment', 'trainer',
   'BC TL carries out mock test (refer to Mock Schedule). Player joins Lark meeting link on time.',
   false),

  (bc_role_id, 6, 5,  '13:00', '14:00', 1.0,
   'Lunch',
   'Lunch', '',
   '',
   false),

  (bc_role_id, 6, 6,  '14:00', '15:00', 1.0,
   'Salesforce Playbook — Business Consultant',
   'Self-Study', 'player',
   'Document information based on the Mock scenario conducted. Gain experience with documentation using Salesforce. Ensure SF accounts are ready before starting.',
   false),

  (bc_role_id, 6, 7,  '15:00', '16:00', 1.0,
   'BC Process Review',
   'Self-Study', 'player',
   'Review all BC processes:
- BC handoff message template
- MY Sales Order Submission Checklist
- Complex Meeting Playbook
- Big Logo',
   false),

  (bc_role_id, 6, 8,  '16:00', '16:30', 0.5,
   'Graduation & Handover',
   'Graduation', 'trainer',
   'BC TL reveals score and provides next steps.',
   false);

  RAISE NOTICE 'BC modules inserted successfully for role_id: %', bc_role_id;
END $$;
