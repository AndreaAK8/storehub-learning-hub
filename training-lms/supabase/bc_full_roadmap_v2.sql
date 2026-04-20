-- =====================================================================
-- BC Full Roadmap v2 — Days 2 Homework + Days 3–6
-- Replaces insert_bc_day3_6_modules.sql
-- Includes: cleaned trainee-facing descriptions + all Lark resource links
-- Run AFTER update_day1_day2_modules.sql (Day 1–2 common modules must exist)
-- =====================================================================

DO $$
DECLARE
  bc_role_id UUID;
BEGIN
  SELECT id INTO bc_role_id FROM training_roles WHERE short_code = 'BC';

  IF bc_role_id IS NULL THEN
    RAISE EXCEPTION 'BC role not found. Make sure short_code = BC exists in training_roles.';
  END IF;

  -- Ensure total_days = 6
  UPDATE training_roles SET total_days = 6 WHERE short_code = 'BC';

  -- Remove existing BC-specific modules (is_common = false)
  DELETE FROM training_modules WHERE role_id = bc_role_id AND is_common = false;

  -- ============================================================
  -- DAY 2 HOMEWORK (BC-specific, after fork briefing)
  -- ============================================================
  INSERT INTO training_modules
    (role_id, day, sort_order, start_time, end_time, duration_hours, topic, type, details, resource_url, is_common)
  VALUES
  (bc_role_id, 2, 100, '18:30', '19:30', 1.0,
   'Homework: Pitching Video & Slides',
   'Self-Study',
   'Before Day 3, review the F&B and Retail pitching decks and watch the pitching example video. Focus on flow, tone, and delivery — your presentation and soft skills will be assessed tomorrow.',
   'Pitching Slides: https://storehub.sg.larksuite.com/wiki/Z3vHwrjCPiBs45kK9Iolcp6dgvf',
   false);

  -- ============================================================
  -- DAY 3 — Pitching + SPIN
  -- ============================================================
  INSERT INTO training_modules
    (role_id, day, sort_order, start_time, end_time, duration_hours, topic, type, details, resource_url, is_common)
  VALUES
  (bc_role_id, 3, 1, '09:30', '10:00', 0.5,
   'Pitching Slides Review',
   'Self-Study',
   'Review the F&B and Retail pitching decks and watch the example pitching video. Focus on flow, tone, and delivery — your presentation and soft skills will be assessed today.
---SUCCESS_CRITERIA---
1. Familiar with the full pitching slide structure for both F&B and Retail
2. Understand the expected delivery flow shown in the example video',
   'Pitching Slides: https://storehub.sg.larksuite.com/wiki/Z3vHwrjCPiBs45kK9Iolcp6dgvf',
   false),

  (bc_role_id, 3, 2, '10:00', '11:00', 1.0,
   'People Engagement — Pitching Framework',
   'TL-Led',
   'Your BC TL walks you through StoreHub''s People Engagement pitching methodology — the framework you will use on every merchant visit. This is a core skill for your entire BC career.',
   'People Engagement Slides: https://storehub.sg.larksuite.com/wiki/Ak7IwWrWsihWzEkvPuild5lYgFh',
   false),

  (bc_role_id, 3, 3, '11:00', '12:00', 1.0,
   'Pitching Assessment (F&B + Retail)',
   'Assessment',
   'Pitch to your trainer using the F&B slides, following the recording steps. Both your presentation quality and soft skills are evaluated. Record using Lark Video and share with your BC TL once done.
---SUCCESS_CRITERIA---
1. Followed the correct pitching flow for F&B slides
2. Demonstrated clear communication and confident delivery
3. Recording submitted to BC TL on time',
   'Pitching Slides: https://storehub.sg.larksuite.com/wiki/Z3vHwrjCPiBs45kK9Iolcp6dgvf',
   false),

  (bc_role_id, 3, 4, '12:00', '13:00', 1.0,
   'Lunch', 'Break', '', NULL, false),

  (bc_role_id, 3, 5, '13:00', '14:00', 1.0,
   'SPIN Trial Run',
   'Self-Work',
   'Practice a SPIN-based conversation using your assigned merchant scenario. Spend the first 30 minutes preparing, then record a 30-minute SPIN session using Lark Video and share it with your BC TL.',
   'SPIN Guide: https://storehub.sg.larksuite.com/wiki/K0qcwzg4bi2GSEk4Lefle1ojgOc',
   false),

  (bc_role_id, 3, 6, '14:00', '15:00', 1.0,
   'SPIN Video Samples',
   'Self-Study',
   'Watch example SPIN recordings to study technique, question flow, and how to handle different merchant responses. Take notes on what to apply in your graded assessment.',
   'SPIN Guide: https://storehub.sg.larksuite.com/wiki/K0qcwzg4bi2GSEk4Lefle1ojgOc',
   false),

  (bc_role_id, 3, 7, '15:00', '16:00', 1.0,
   'TL Review: SPIN Trial',
   'Coach Review',
   'Your BC TL shares detailed feedback on your trial run — what worked, what to improve, and what to focus on for the graded assessment.',
   NULL,
   false),

  (bc_role_id, 3, 8, '16:00', '17:00', 1.0,
   'SPIN Assessment 1 (Graded)',
   'Assessment',
   'Graded SPIN assessment. Record your full session using Lark Video and submit to your BC TL once complete.
---SUCCESS_CRITERIA---
1. Applied SPIN questioning framework correctly
2. Demonstrated active listening and follow-up responses
3. Recording submitted to BC TL on time',
   'SPIN Guide: https://storehub.sg.larksuite.com/wiki/K0qcwzg4bi2GSEk4Lefle1ojgOc',
   false),

  (bc_role_id, 3, 9, '17:00', '17:30', 0.5,
   'Closing Prep',
   'Self-Study',
   'Watch the Closing and Product Demo sample videos to prepare for tomorrow''s Closing assessment.',
   'Closing Guide: https://storehub.sg.larksuite.com/wiki/D7ErwD6qciiBwckHglEl8EhRgRc',
   false),

  (bc_role_id, 3, 10, '17:30', '18:30', 1.0,
   'TL Review: SPIN 1 + Closing Briefing',
   'Coach Review',
   'Your BC TL reviews your SPIN 1 results and sets clear expectations for tomorrow''s Closing assessment.',
   NULL,
   false);

  -- ============================================================
  -- DAY 4 — Closing
  -- ============================================================
  INSERT INTO training_modules
    (role_id, day, sort_order, start_time, end_time, duration_hours, topic, type, details, resource_url, is_common)
  VALUES
  (bc_role_id, 4, 1, '09:30', '11:30', 2.0,
   'Closing Assessment 1 (Graded)',
   'Assessment',
   'First graded Closing assessment. Record using Lark Video and share with your BC TL once complete.
---SUCCESS_CRITERIA---
1. Followed the correct closing flow
2. Handled objections appropriately
3. Recording submitted to BC TL on time',
   'Closing Guide: https://storehub.sg.larksuite.com/wiki/D7ErwD6qciiBwckHglEl8EhRgRc',
   false),

  (bc_role_id, 4, 2, '11:30', '12:30', 1.0,
   'BackOffice & POS Setup for Closing 2',
   'Self-Work',
   'Configure BackOffice and POS following your assigned Closing 2 scenario. Your product demo must be ready — this setup feeds directly into your next assessment.',
   'Product Demo Checklist: https://storehub.sg.larksuite.com/wiki/GyZMw2o9wirA3bkkbhwl8PrNgdg',
   false),

  (bc_role_id, 4, 3, '12:30', '13:30', 1.0,
   'Lunch', 'Break', '', NULL, false),

  (bc_role_id, 4, 4, '13:30', '14:30', 1.0,
   'TL Review: Closing 1',
   'Coach Review',
   'Your BC TL gives feedback on Closing 1 and sets clear expectations for the Closing 2 assessment.',
   NULL,
   false),

  (bc_role_id, 4, 5, '14:30', '16:30', 2.0,
   'Closing Assessment 2 (Graded)',
   'Assessment',
   'Graded Closing 2 — include a full BackOffice/POS product demo in your recording. Submit via Lark Video once done.
---SUCCESS_CRITERIA---
1. Closing flow executed correctly
2. Product demo is live on BackOffice/POS and shown during recording
3. Recording submitted to BC TL on time',
   'Closing Guide: https://storehub.sg.larksuite.com/wiki/D7ErwD6qciiBwckHglEl8EhRgRc',
   false),

  (bc_role_id, 4, 6, '16:30', '17:30', 1.0,
   'Full Pitching Overview',
   'Self-Study',
   'Study the end-to-end BC demo session flow: SPIN + Product Demo + Closing as one complete pitch. This is what you will perform in tomorrow''s Full Pitching assessments.',
   'Full Pitching Guide: https://storehub.sg.larksuite.com/wiki/FnW8wgarPiNv25k294jlliTIgsc',
   false),

  (bc_role_id, 4, 7, '17:30', '18:30', 1.0,
   'TL Review: Closing 2 + Full Pitch Briefing',
   'Coach Review',
   'Your BC TL reviews Closing 2 and sets final expectations for tomorrow''s Full Pitching assessments.',
   NULL,
   false),

  (bc_role_id, 4, 100, '18:30', '19:30', 1.0,
   'Homework: Full Pitching Prep',
   'Self-Study',
   'Continue reviewing the Full Pitching flow and materials tonight to prepare for tomorrow''s assessments.',
   'Full Pitching Guide: https://storehub.sg.larksuite.com/wiki/FnW8wgarPiNv25k294jlliTIgsc',
   false);

  -- ============================================================
  -- DAY 5 — Full Pitching
  -- ============================================================
  INSERT INTO training_modules
    (role_id, day, sort_order, start_time, end_time, duration_hours, topic, type, details, resource_url, is_common)
  VALUES
  (bc_role_id, 5, 1, '09:30', '12:00', 2.5,
   'Full Pitching — Retail (Graded)',
   'Assessment',
   'Graded Full Pitching assessment — Retail scenario. Your recording must include SPIN + Product Demo + Closing as a complete flow. Check your assigned scenario, complete on time, and submit via Lark Video.
---SUCCESS_CRITERIA---
1. Recording includes SPIN + Product Demo + Closing in full
2. Assigned Retail scenario used correctly
3. Submitted via Lark Video on time',
   'Full Pitching Guide: https://storehub.sg.larksuite.com/wiki/FnW8wgarPiNv25k294jlliTIgsc',
   false),

  (bc_role_id, 5, 2, '12:00', '13:00', 1.0,
   'Lunch', 'Break', '', NULL, false),

  (bc_role_id, 5, 3, '13:00', '15:30', 2.5,
   'Full Pitching — F&B (Graded)',
   'Assessment',
   'Graded Full Pitching assessment — F&B scenario. Same requirements: SPIN + Product Demo + Closing. Submit via Lark Video on time.
---SUCCESS_CRITERIA---
1. Recording includes SPIN + Product Demo + Closing in full
2. Assigned F&B scenario used correctly
3. Submitted via Lark Video on time',
   'Full Pitching Guide: https://storehub.sg.larksuite.com/wiki/FnW8wgarPiNv25k294jlliTIgsc',
   false),

  (bc_role_id, 5, 4, '15:30', '16:30', 1.0,
   'Mock Test Briefing',
   'Trainer-Led',
   'Your trainer explains the Mock Test format, gives you your timeslot, and shares the scenario you need to prepare for Day 6.',
   'Mock Test Guide: https://storehub.sg.larksuite.com/wiki/MWqcwnbVkicMKnkjJmSlYKeAgGb',
   false),

  (bc_role_id, 5, 5, '16:30', '17:30', 1.0,
   'Mock Scenario Setup',
   'Self-Work',
   'Configure your BackOffice and POS device to match your assigned Mock Test scenario. Everything must be ready before Day 6.',
   'Mock Test Guide: https://storehub.sg.larksuite.com/wiki/MWqcwnbVkicMKnkjJmSlYKeAgGb',
   false),

  (bc_role_id, 5, 6, '17:30', '18:30', 1.0,
   'TL Review: Full Pitching',
   'Coach Review',
   'Your BC TL reviews your Full Pitching recordings and sets final expectations for the Mock Test.',
   NULL,
   false),

  (bc_role_id, 5, 100, '18:30', '19:30', 1.0,
   'Homework: Mock Scenario Prep',
   'Self-Work',
   'Complete your BackOffice and POS configuration for the Mock Test scenario if not yet done. Come Day 6 fully prepared.',
   'Mock Test Guide: https://storehub.sg.larksuite.com/wiki/MWqcwnbVkicMKnkjJmSlYKeAgGb',
   false);

  -- ============================================================
  -- DAY 6 — Mock Test + Graduation
  -- ============================================================
  INSERT INTO training_modules
    (role_id, day, sort_order, start_time, end_time, duration_hours, topic, type, details, resource_url, is_common)
  VALUES
  (bc_role_id, 6, 1, '09:30', '10:30', 1.0,
   'Mock Test Preparation',
   'Self-Work',
   'Final prep time — review your scenario, practise your delivery, and confirm your BackOffice and POS setup is complete and working.',
   'Mock Test Guide: https://storehub.sg.larksuite.com/wiki/MWqcwnbVkicMKnkjJmSlYKeAgGb',
   false),

  (bc_role_id, 6, 2, '10:30', '11:30', 1.0,
   'Mock Test: Retail (Live)',
   'Assessment',
   'Live Mock Test with your BC TL — Retail scenario. Join the Lark meeting link on time. Lateness impacts the full schedule.
---SUCCESS_CRITERIA---
1. Joined Lark meeting on time
2. Completed full pitch: SPIN + Product Demo + Closing
3. Applied feedback from Full Pitching review session',
   'Mock Test Guide: https://storehub.sg.larksuite.com/wiki/MWqcwnbVkicMKnkjJmSlYKeAgGb',
   false),

  (bc_role_id, 6, 3, '11:30', '12:00', 0.5,
   'Improvement Window',
   'Self-Work',
   'Apply the feedback from your Retail mock before the F&B session. Use this time to adjust your approach, not to prepare new content.',
   'Mock Test Guide: https://storehub.sg.larksuite.com/wiki/MWqcwnbVkicMKnkjJmSlYKeAgGb',
   false),

  (bc_role_id, 6, 4, '12:00', '13:00', 1.0,
   'Mock Test: F&B (Live)',
   'Assessment',
   'Live Mock Test with your BC TL — F&B scenario. Join the Lark meeting link on time.
---SUCCESS_CRITERIA---
1. Joined Lark meeting on time
2. Completed full pitch: SPIN + Product Demo + Closing
3. Incorporated improvements from Retail session feedback',
   'Mock Test Guide: https://storehub.sg.larksuite.com/wiki/MWqcwnbVkicMKnkjJmSlYKeAgGb',
   false),

  (bc_role_id, 6, 5, '13:00', '14:00', 1.0,
   'Lunch', 'Break', '', NULL, false),

  (bc_role_id, 6, 6, '14:00', '15:00', 1.0,
   'Salesforce Playbook',
   'Self-Work',
   'Document your Mock Test scenario in Salesforce — a practice run to build the CRM documentation habits you will use every day as a BC. Ensure your Salesforce account is ready before starting.',
   'Salesforce Playbook: https://storehub.sg.larksuite.com/wiki/T7ntwjcZxi4x1CkxO3FlIJ7bgPc',
   false),

  (bc_role_id, 6, 7, '15:00', '16:00', 1.0,
   'BC Process Review',
   'Self-Study',
   'Review the key BC process documents before your handover:
• BC handoff message template
• MY Sales Order Submission Checklist
• Complex Meeting Playbook
• Big Logo guide',
   NULL,
   false),

  (bc_role_id, 6, 8, '16:00', '16:30', 0.5,
   'Graduation & Handover',
   'Graduation',
   'Your BC TL reveals your final scores across all assessments and shares your next steps for your first week on the floor. Congratulations on completing BC Training.',
   NULL,
   false);

  RAISE NOTICE 'BC full roadmap v2 inserted successfully for role_id: %', bc_role_id;
END $$;
