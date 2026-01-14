-- Fix OC (Onboarding Coordinator) Schedule
-- OC is a 4-day program, not 5

-- 1. Update OC role to 4 days
UPDATE training_roles
SET total_days = 4
WHERE short_code = 'OC';

-- 2. Delete Day 5 modules for OC (they shouldn't exist)
DELETE FROM training_modules
WHERE role_id = (SELECT id FROM training_roles WHERE short_code = 'OC')
AND day_number = 5;

-- 3. Delete existing Day 3-4 OC modules to replace with correct data
DELETE FROM training_modules
WHERE role_id = (SELECT id FROM training_roles WHERE short_code = 'OC')
AND day_number IN (3, 4);

-- 4. Insert correct Day 3 modules for OC (from CSV)
INSERT INTO training_modules (role_id, day_number, day_title, start_time, end_time, duration_hours, title, description, activity_type, pic, display_order)
SELECT
  r.id,
  3,
  'Advanced Modules & OC Tools',
  start_time,
  end_time,
  duration_hours,
  title,
  description,
  activity_type::activity_type,
  pic,
  display_order
FROM training_roles r
CROSS JOIN (VALUES
  ('09:30', '11:30', 2.0, 'Advanced System & Features', 'Topics: Reports, CSV import/export, Promotions, Pricebooks, QR Order & Pay, Beep Delivery, Membership, Engage', 'Self-Study', 'player', 1),
  ('11:30', '13:00', 1.5, 'Advanced Troubleshooting', 'Topics: Networking basics, printer troubleshooting (IP addresses, feed tests, printer resets, printer configuration)', 'Self-Study', 'player', 2),
  ('13:00', '14:00', 1.0, 'Lunch Break', 'Lunch break', 'Break', 'player', 3),
  ('14:00', '15:00', 1.0, 'Advance System & Networking Quiz', '35 questions, 80% pass required, open-book. Use slides as reference', 'Assessment', 'player', 4),
  ('15:00', '15:30', 0.5, 'Quick Sync Up', 'Address concerns and clarify concepts with your trainer', 'Trainer-Led', 'trainer', 5),
  ('15:30', '16:30', 1.0, 'Hardware Assessment', 'Demonstrate: Hardware assembly, printer search, kitchen printer setup, printer assignment on POS, WiFi connection, main register assignment for Beep Orders. 80% pass required', 'Assessment', 'trainer', 6),
  ('16:30', '17:30', 1.0, 'Tools & Supply Chain', 'Internal tools: Intercom, Aircall, supply chain processes', 'Self-Study', 'player', 7),
  ('17:30', '18:30', 1.0, 'Brand Servicing', 'Essential soft skills for merchant interactions', 'Self-Study', 'player', 8)
) AS v(start_time, end_time, duration_hours, title, description, activity_type, pic, display_order)
WHERE r.short_code = 'OC';

-- 5. Insert correct Day 4 modules for OC (from CSV) - Graduation day
INSERT INTO training_modules (role_id, day_number, day_title, start_time, end_time, duration_hours, title, description, activity_type, pic, display_order)
SELECT
  r.id,
  4,
  'Buddy Session & Graduation',
  start_time,
  end_time,
  duration_hours,
  title,
  description,
  activity_type::activity_type,
  pic,
  display_order
FROM training_roles r
CROSS JOIN (VALUES
  ('09:30', '12:00', 2.5, 'Buddy Session with Senior OC', 'Shadow a senior OC to understand menu setup process from start to end. Take detailed notes in Buddy Checklist. Senior will provide feedback on your engagement', 'Buddy Session', 'coach', 1),
  ('12:00', '13:00', 1.0, 'Lunch Break', 'Lunch break', 'Break', 'player', 2),
  ('14:00', '16:30', 2.5, 'Menu Setup Task', 'Using an Intercom ticket, set up a merchant menu with minimum 20 products. Configure on both Beep and QR Order & Pay. Senior OC will cross-check your work for accuracy', 'Assessment', 'player', 3),
  ('16:30', '18:30', 2.0, 'Handover to Team Lead', 'You have officially graduated! Handover to your Team Lead for next steps', 'Graduation', 'tl', 4)
) AS v(start_time, end_time, duration_hours, title, description, activity_type, pic, display_order)
WHERE r.short_code = 'OC';

-- Verify the fix
SELECT
  r.name as role,
  r.total_days,
  m.day_number,
  m.start_time,
  m.title
FROM training_roles r
JOIN training_modules m ON m.role_id = r.id
WHERE r.short_code = 'OC'
ORDER BY m.day_number, m.start_time;
