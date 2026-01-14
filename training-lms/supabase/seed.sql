-- ============================================
-- TRAINING LMS - SEED DATA
-- ============================================
-- Populates training program structure based on actual materials
-- ============================================

-- ============================================
-- TRAINING DAYS STRUCTURE
-- ============================================

-- Day 1-2: Common Foundation (All Roles)
INSERT INTO training_days (role_id, day_number, title, description, is_common) VALUES
  (NULL, 1, 'Product Fundamentals - Day 1', 'Foundation training covering StoreHub basics, account setup, and core modules', true),
  (NULL, 2, 'Product Fundamentals - Day 2', 'Continued foundation training with demos, Q&A, and product quiz', true);

-- Business Consultant (BC) - 6 days total
INSERT INTO training_days (role_id, day_number, title, description) VALUES
  ('BC', 3, 'Advanced Modules & Hardware', 'Advanced system features, troubleshooting, and hardware assessment'),
  ('BC', 4, 'Pitching & Demo Skills', 'Pitching video, product demo, buddy session with senior BC'),
  ('BC', 5, 'SPIN Training & Review', 'Sales skills training and review session with coach'),
  ('BC', 6, 'Mock Test & Graduation', 'Final mock test assessment and handover to team');

-- Merchant Care (MC) - 4 days total
INSERT INTO training_days (role_id, day_number, title, description) VALUES
  ('MC', 3, 'Advanced Systems & Brand Servicing', 'Advanced features, troubleshooting, quiz, and brand servicing'),
  ('MC', 4, 'Assessment & Mock Test', 'Hardware assessment, case study review, mock test, and handover');

-- Customer Success Manager (CSM) - 5 days total
INSERT INTO training_days (role_id, day_number, title, description) VALUES
  ('CSM', 3, 'Advanced Modules & CSM Assessment', 'Advanced features, hardware assessment, tools training, begin CSM assessment'),
  ('CSM', 4, 'Buddy Session & Assessment', 'Shadow senior CSM, continue assessment work'),
  ('CSM', 5, 'Review & Mock Test', 'Review session with coach, region-specific training, final mock test');

-- Merchant Onboarding Manager (MOM) - 6 days total
INSERT INTO training_days (role_id, day_number, title, description) VALUES
  ('MOM', 3, 'Advanced Modules & Tools', 'Advanced system features, tools & supply chain'),
  ('MOM', 4, 'Menu Setup & Onboarding', 'Menu setup training, welcome call procedures'),
  ('MOM', 5, 'Buddy Session & Practice', 'Shadow senior MOM, practice onboarding calls'),
  ('MOM', 6, 'Assessment & Graduation', 'Final assessment and handover to team');

-- Onboarding Specialist (OS) - 6 days total
INSERT INTO training_days (role_id, day_number, title, description) VALUES
  ('OS', 3, 'Advanced Modules & Hardware', 'Advanced features and hardware assessment'),
  ('OS', 4, 'Onboarding Workflows', 'Menu setup, merchant onboarding procedures'),
  ('OS', 5, 'Buddy Session & Practice', 'Shadow senior OS, practice onboarding'),
  ('OS', 6, 'Assessment & Graduation', 'Final assessment and team handover');

-- Sales Coordinator (SC) - 4 days total
INSERT INTO training_days (role_id, day_number, title, description) VALUES
  ('SC', 3, 'Advanced Modules & Inside Sales', 'Advanced features, inside sales processes'),
  ('SC', 4, 'Assessment & Graduation', 'Lead qualification training, assessment, and handover');

-- Onboarding Coordinator (OC) - 3 days total
INSERT INTO training_days (role_id, day_number, title, description) VALUES
  ('OC', 3, 'Onboarding Support & Graduation', 'Onboarding support workflows, assessment, and handover');

-- Billing Executive (BE) - 3 days total
INSERT INTO training_days (role_id, day_number, title, description) VALUES
  ('BE', 3, 'Billing Systems & Graduation', 'Billing and invoicing systems, assessment, and handover');

-- Marketing (MKT) - 3 days total
INSERT INTO training_days (role_id, day_number, title, description) VALUES
  ('MKT', 3, 'Marketing Tools & Graduation', 'Marketing campaign tools, assessment, and handover');

-- ============================================
-- TRAINING ACTIVITIES - DAY 1-2 (Common)
-- ============================================

-- Day 1 Activities
INSERT INTO training_activities (training_day_id, start_time, end_time, duration_hours, title, description, activity_type, pic, sort_order)
SELECT
  td.id,
  '09:30:00'::TIME,
  '10:30:00'::TIME,
  1.0,
  'Kick-off Briefing',
  'Introduction, expectations setting, overview of training program',
  'briefing',
  'trainer',
  1
FROM training_days td WHERE td.day_number = 1 AND td.is_common = true;

INSERT INTO training_activities (training_day_id, start_time, end_time, duration_hours, title, description, activity_type, pic, sort_order)
SELECT
  td.id,
  '10:30:00'::TIME,
  '12:30:00'::TIME,
  2.0,
  'Self-Study: Module 1 - StoreHub Basics',
  'Introduction to StoreHub POS system and core concepts',
  'self_study',
  'player',
  2
FROM training_days td WHERE td.day_number = 1 AND td.is_common = true;

INSERT INTO training_activities (training_day_id, start_time, end_time, duration_hours, title, description, activity_type, pic, sort_order)
SELECT
  td.id,
  '12:30:00'::TIME,
  '13:30:00'::TIME,
  1.0,
  'Lunch Break',
  '🍽️',
  'lunch',
  NULL,
  3
FROM training_days td WHERE td.day_number = 1 AND td.is_common = true;

INSERT INTO training_activities (training_day_id, start_time, end_time, duration_hours, title, description, activity_type, pic, sort_order)
SELECT
  td.id,
  '13:30:00'::TIME,
  '15:30:00'::TIME,
  2.0,
  'Self-Study: Module 2 - Menu & Inventory',
  'Menu setup, inventory management, and stock tracking',
  'self_study',
  'player',
  4
FROM training_days td WHERE td.day_number = 1 AND td.is_common = true;

INSERT INTO training_activities (training_day_id, start_time, end_time, duration_hours, title, description, activity_type, pic, sort_order)
SELECT
  td.id,
  '15:30:00'::TIME,
  '17:00:00'::TIME,
  1.5,
  'Live Demo & Q&A Session',
  'Trainer demonstrates key features, answers questions',
  'review_session',
  'trainer',
  5
FROM training_days td WHERE td.day_number = 1 AND td.is_common = true;

INSERT INTO training_activities (training_day_id, start_time, end_time, duration_hours, title, description, activity_type, pic, sort_order)
SELECT
  td.id,
  '17:00:00'::TIME,
  '18:30:00'::TIME,
  1.5,
  'Self-Study: Module 3 - Payments',
  'Payment processing, refunds, and transaction management',
  'self_study',
  'player',
  6
FROM training_days td WHERE td.day_number = 1 AND td.is_common = true;

-- Day 2 Activities
INSERT INTO training_activities (training_day_id, start_time, end_time, duration_hours, title, description, activity_type, pic, sort_order)
SELECT
  td.id,
  '09:30:00'::TIME,
  '11:30:00'::TIME,
  2.0,
  'Self-Study: Module 4 - Reports & Analytics',
  'Sales reports, analytics dashboards, data export',
  'self_study',
  'player',
  1
FROM training_days td WHERE td.day_number = 2 AND td.is_common = true;

INSERT INTO training_activities (training_day_id, start_time, end_time, duration_hours, title, description, activity_type, pic, sort_order)
SELECT
  td.id,
  '11:30:00'::TIME,
  '12:30:00'::TIME,
  1.0,
  'Debrief Session: Modules 1-4',
  'Review of all modules covered, clarify concepts',
  'review_session',
  'trainer',
  2
FROM training_days td WHERE td.day_number = 2 AND td.is_common = true;

INSERT INTO training_activities (training_day_id, start_time, end_time, duration_hours, title, description, activity_type, pic, sort_order)
SELECT
  td.id,
  '12:30:00'::TIME,
  '13:30:00'::TIME,
  1.0,
  'Lunch Break',
  '🍽️',
  'lunch',
  NULL,
  3
FROM training_days td WHERE td.day_number = 2 AND td.is_common = true;

INSERT INTO training_activities (training_day_id, start_time, end_time, duration_hours, title, description, activity_type, pic, sort_order)
SELECT
  td.id,
  '13:30:00'::TIME,
  '15:00:00'::TIME,
  1.5,
  'Self-Study: Module 5 - Customer Management',
  'Customer database, loyalty programs, customer engagement',
  'self_study',
  'player',
  4
FROM training_days td WHERE td.day_number = 2 AND td.is_common = true;

INSERT INTO training_activities (training_day_id, start_time, end_time, duration_hours, title, description, activity_type, pic, sort_order)
SELECT
  td.id,
  '15:00:00'::TIME,
  '16:00:00'::TIME,
  1.0,
  'Create Dummy Account',
  'Hands-on: Set up personal test account for practice',
  'self_study',
  'player',
  5
FROM training_days td WHERE td.day_number = 2 AND td.is_common = true;

INSERT INTO training_activities (training_day_id, start_time, end_time, duration_hours, title, description, activity_type, pic, sort_order)
SELECT
  td.id,
  '16:00:00'::TIME,
  '17:30:00'::TIME,
  1.5,
  'Product Knowledge Quiz',
  '5 modules quiz, 80% pass required, open-book',
  'assessment',
  'player',
  6
FROM training_days td WHERE td.day_number = 2 AND td.is_common = true;

INSERT INTO training_activities (training_day_id, start_time, end_time, duration_hours, title, description, activity_type, pic, sort_order)
SELECT
  td.id,
  '17:30:00'::TIME,
  '18:30:00'::TIME,
  1.0,
  'Day 3 Briefing',
  'Overview of role-specific training starting tomorrow',
  'briefing',
  'trainer',
  7
FROM training_days td WHERE td.day_number = 2 AND td.is_common = true;

-- ============================================
-- TRAINING ACTIVITIES - MERCHANT CARE (MC)
-- ============================================

-- MC Day 3
INSERT INTO training_activities (training_day_id, start_time, end_time, duration_hours, title, description, activity_type, pic, sort_order)
SELECT
  td.id,
  '09:30:00'::TIME,
  '11:30:00'::TIME,
  2.0,
  'Advanced System & Features',
  'Reports, CSV import/export, Promotions, Pricebooks, QR Order & Pay, Beep Delivery, Membership, Engage',
  'self_study',
  'player',
  1
FROM training_days td WHERE td.role_id = 'MC' AND td.day_number = 3;

INSERT INTO training_activities (training_day_id, start_time, end_time, duration_hours, title, description, activity_type, pic, sort_order)
SELECT
  td.id,
  '11:30:00'::TIME,
  '13:00:00'::TIME,
  1.5,
  'Advanced Troubleshooting',
  'Networking basics, printer troubleshooting (IP addresses, feed tests, printer resets, configuration)',
  'self_study',
  'player',
  2
FROM training_days td WHERE td.role_id = 'MC' AND td.day_number = 3;

INSERT INTO training_activities (training_day_id, start_time, end_time, duration_hours, title, description, activity_type, pic, sort_order)
SELECT
  td.id,
  '13:00:00'::TIME,
  '14:00:00'::TIME,
  1.0,
  'Lunch Break',
  '🍽️',
  'lunch',
  NULL,
  3
FROM training_days td WHERE td.role_id = 'MC' AND td.day_number = 3;

INSERT INTO training_activities (training_day_id, start_time, end_time, duration_hours, title, description, activity_type, pic, sort_order)
SELECT
  td.id,
  '14:00:00'::TIME,
  '14:30:00'::TIME,
  0.5,
  'Sync Up with Trainer',
  'Address concerns and clarify concepts',
  'review_session',
  'trainer',
  4
FROM training_days td WHERE td.role_id = 'MC' AND td.day_number = 3;

INSERT INTO training_activities (training_day_id, start_time, end_time, duration_hours, title, description, activity_type, pic, sort_order)
SELECT
  td.id,
  '14:30:00'::TIME,
  '15:30:00'::TIME,
  1.0,
  'Advanced System & Networking Quiz',
  '35 questions, 80% pass required, open-book',
  'assessment',
  'player',
  5
FROM training_days td WHERE td.role_id = 'MC' AND td.day_number = 3;

INSERT INTO training_activities (training_day_id, start_time, end_time, duration_hours, title, description, activity_type, pic, sort_order)
SELECT
  td.id,
  '15:30:00'::TIME,
  '17:30:00'::TIME,
  2.0,
  'Brand Servicing',
  'Essential soft skills for merchant interactions',
  'self_study',
  'player',
  6
FROM training_days td WHERE td.role_id = 'MC' AND td.day_number = 3;

INSERT INTO training_activities (training_day_id, start_time, end_time, duration_hours, title, description, activity_type, pic, sort_order)
SELECT
  td.id,
  '17:30:00'::TIME,
  '18:30:00'::TIME,
  1.0,
  'Care Tools & Supply Chain',
  'Internal tools: Intercom, Aircall, supply chain processes',
  'self_study',
  'player',
  7
FROM training_days td WHERE td.role_id = 'MC' AND td.day_number = 3;

-- MC Day 4
INSERT INTO training_activities (training_day_id, start_time, end_time, duration_hours, title, description, activity_type, pic, sort_order)
SELECT
  td.id,
  '09:30:00'::TIME,
  '10:30:00'::TIME,
  1.0,
  'Hardware Assessment',
  'Demonstrate: Hardware assembly, printer search, feed test, reset, configuration, IP troubleshooting. 80% pass required',
  'assessment',
  'trainer',
  1
FROM training_days td WHERE td.role_id = 'MC' AND td.day_number = 4;

INSERT INTO training_activities (training_day_id, start_time, end_time, duration_hours, title, description, activity_type, pic, sort_order)
SELECT
  td.id,
  '10:30:00'::TIME,
  '11:30:00'::TIME,
  1.0,
  'Case Study Review',
  'Review Intercom tickets to understand conversation flow for mock test',
  'self_study',
  'player',
  2
FROM training_days td WHERE td.role_id = 'MC' AND td.day_number = 4;

INSERT INTO training_activities (training_day_id, start_time, end_time, duration_hours, title, description, activity_type, pic, sort_order)
SELECT
  td.id,
  '11:30:00'::TIME,
  '12:30:00'::TIME,
  1.0,
  'Self-Prepare for Mock Test',
  'Revise all slides and prepare for mock',
  'self_study',
  'player',
  3
FROM training_days td WHERE td.role_id = 'MC' AND td.day_number = 4;

INSERT INTO training_activities (training_day_id, start_time, end_time, duration_hours, title, description, activity_type, pic, sort_order)
SELECT
  td.id,
  '13:00:00'::TIME,
  '14:00:00'::TIME,
  1.0,
  'Lunch Break',
  '🍽️',
  'lunch',
  NULL,
  4
FROM training_days td WHERE td.role_id = 'MC' AND td.day_number = 4;

INSERT INTO training_activities (training_day_id, start_time, end_time, duration_hours, title, description, activity_type, pic, sort_order)
SELECT
  td.id,
  '14:00:00'::TIME,
  '17:00:00'::TIME,
  3.0,
  'Mock Test',
  'Live roleplay through Intercom. 80% pass required',
  'mock_test',
  'trainer',
  5
FROM training_days td WHERE td.role_id = 'MC' AND td.day_number = 4;

INSERT INTO training_activities (training_day_id, start_time, end_time, duration_hours, title, description, activity_type, pic, sort_order)
SELECT
  td.id,
  '17:00:00'::TIME,
  '18:30:00'::TIME,
  1.5,
  'Handover to Team Lead',
  'Graduation! 🎓 Official handover to team',
  'handover',
  'tl',
  6
FROM training_days td WHERE td.role_id = 'MC' AND td.day_number = 4;

-- ============================================
-- TRAINING ACTIVITIES - CUSTOMER SUCCESS (CSM)
-- ============================================

-- CSM Day 3
INSERT INTO training_activities (training_day_id, start_time, end_time, duration_hours, title, description, activity_type, pic, sort_order)
SELECT
  td.id,
  '09:30:00'::TIME,
  '11:30:00'::TIME,
  2.0,
  'Advanced System & Features',
  'Reports, CSV import/export, Promotions, Pricebooks, QR Order & Pay, Beep Delivery, Membership, Engage',
  'self_study',
  'player',
  1
FROM training_days td WHERE td.role_id = 'CSM' AND td.day_number = 3;

INSERT INTO training_activities (training_day_id, start_time, end_time, duration_hours, title, description, activity_type, pic, sort_order)
SELECT
  td.id,
  '11:30:00'::TIME,
  '13:00:00'::TIME,
  1.5,
  'Advanced Troubleshooting',
  'Networking basics, printer troubleshooting',
  'self_study',
  'player',
  2
FROM training_days td WHERE td.role_id = 'CSM' AND td.day_number = 3;

INSERT INTO training_activities (training_day_id, start_time, end_time, duration_hours, title, description, activity_type, pic, sort_order)
SELECT
  td.id,
  '13:00:00'::TIME,
  '14:00:00'::TIME,
  1.0,
  'Lunch Break',
  '🍽️',
  'lunch',
  NULL,
  3
FROM training_days td WHERE td.role_id = 'CSM' AND td.day_number = 3;

INSERT INTO training_activities (training_day_id, start_time, end_time, duration_hours, title, description, activity_type, pic, sort_order)
SELECT
  td.id,
  '14:00:00'::TIME,
  '15:00:00'::TIME,
  1.0,
  'Advanced System & Networking Quiz',
  '35 questions, 80% pass required, open-book',
  'assessment',
  'player',
  4
FROM training_days td WHERE td.role_id = 'CSM' AND td.day_number = 3;

INSERT INTO training_activities (training_day_id, start_time, end_time, duration_hours, title, description, activity_type, pic, sort_order)
SELECT
  td.id,
  '15:00:00'::TIME,
  '15:30:00'::TIME,
  0.5,
  'Sync Up with Trainer',
  'Address concerns and clarify concepts',
  'review_session',
  'trainer',
  5
FROM training_days td WHERE td.role_id = 'CSM' AND td.day_number = 3;

INSERT INTO training_activities (training_day_id, start_time, end_time, duration_hours, title, description, activity_type, pic, sort_order)
SELECT
  td.id,
  '15:30:00'::TIME,
  '16:30:00'::TIME,
  1.0,
  'Hardware Assessment',
  'Demonstrate hardware assembly and troubleshooting. 80% pass required',
  'assessment',
  'trainer',
  6
FROM training_days td WHERE td.role_id = 'CSM' AND td.day_number = 3;

INSERT INTO training_activities (training_day_id, start_time, end_time, duration_hours, title, description, activity_type, pic, sort_order)
SELECT
  td.id,
  '16:30:00'::TIME,
  '17:30:00'::TIME,
  1.0,
  'CSM Tools & Supply Chain',
  'Internal tools: Intercom, Aircall, supply chain processes',
  'self_study',
  'player',
  7
FROM training_days td WHERE td.role_id = 'CSM' AND td.day_number = 3;

INSERT INTO training_activities (training_day_id, start_time, end_time, duration_hours, title, description, activity_type, pic, sort_order)
SELECT
  td.id,
  '17:30:00'::TIME,
  '18:30:00'::TIME,
  1.0,
  'Begin CSM Assessment',
  'Review instructions and start working (due end of Day 4)',
  'self_study',
  'player',
  8
FROM training_days td WHERE td.role_id = 'CSM' AND td.day_number = 3;

-- CSM Day 4
INSERT INTO training_activities (training_day_id, start_time, end_time, duration_hours, title, description, activity_type, pic, sort_order)
SELECT
  td.id,
  '09:30:00'::TIME,
  '11:30:00'::TIME,
  2.0,
  'Buddy Session with Senior CSM',
  'Shadow a senior CSM to understand daily duties. Take detailed notes',
  'buddy_session',
  'coach',
  1
FROM training_days td WHERE td.role_id = 'CSM' AND td.day_number = 4;

INSERT INTO training_activities (training_day_id, start_time, end_time, duration_hours, title, description, activity_type, pic, sort_order)
SELECT
  td.id,
  '11:30:00'::TIME,
  '12:00:00'::TIME,
  0.5,
  'CSM Assessment (Cont.)',
  'Continue working on assessment',
  'self_study',
  'player',
  2
FROM training_days td WHERE td.role_id = 'CSM' AND td.day_number = 4;

INSERT INTO training_activities (training_day_id, start_time, end_time, duration_hours, title, description, activity_type, pic, sort_order)
SELECT
  td.id,
  '12:00:00'::TIME,
  '13:00:00'::TIME,
  1.0,
  'Lunch Break',
  '🍽️',
  'lunch',
  NULL,
  3
FROM training_days td WHERE td.role_id = 'CSM' AND td.day_number = 4;

INSERT INTO training_activities (training_day_id, start_time, end_time, duration_hours, title, description, activity_type, pic, sort_order)
SELECT
  td.id,
  '13:00:00'::TIME,
  '14:00:00'::TIME,
  1.0,
  'Mock Test Flow Briefing',
  'Learn what to expect during Mock Test and how scoring works',
  'briefing',
  'trainer',
  4
FROM training_days td WHERE td.role_id = 'CSM' AND td.day_number = 4;

INSERT INTO training_activities (training_day_id, start_time, end_time, duration_hours, title, description, activity_type, pic, sort_order)
SELECT
  td.id,
  '14:00:00'::TIME,
  '18:30:00'::TIME,
  4.5,
  'CSM Assessment (Cont.)',
  'Focus time to complete and submit by end of day',
  'self_study',
  'player',
  5
FROM training_days td WHERE td.role_id = 'CSM' AND td.day_number = 4;

-- CSM Day 5
INSERT INTO training_activities (training_day_id, start_time, end_time, duration_hours, title, description, activity_type, pic, sort_order)
SELECT
  td.id,
  '09:30:00'::TIME,
  '10:30:00'::TIME,
  1.0,
  'Self-Preparation for Mock Test',
  'Mental preparation: Recap role-specific processes and product knowledge',
  'self_study',
  'player',
  1
FROM training_days td WHERE td.role_id = 'CSM' AND td.day_number = 5;

INSERT INTO training_activities (training_day_id, start_time, end_time, duration_hours, title, description, activity_type, pic, sort_order)
SELECT
  td.id,
  '10:30:00'::TIME,
  '12:00:00'::TIME,
  1.5,
  'Review Session with Coach',
  'Present CSM Assessment to coach. Receive feedback and coaching',
  'review_session',
  'coach',
  2
FROM training_days td WHERE td.role_id = 'CSM' AND td.day_number = 5;

INSERT INTO training_activities (training_day_id, start_time, end_time, duration_hours, title, description, activity_type, pic, sort_order)
SELECT
  td.id,
  '12:00:00'::TIME,
  '13:00:00'::TIME,
  1.0,
  'Lunch Break',
  '🍽️',
  'lunch',
  NULL,
  3
FROM training_days td WHERE td.role_id = 'CSM' AND td.day_number = 5;

INSERT INTO training_activities (training_day_id, start_time, end_time, duration_hours, title, description, activity_type, pic, sort_order)
SELECT
  td.id,
  '13:00:00'::TIME,
  '15:00:00'::TIME,
  2.0,
  'Region-Specific Training',
  'PH: BIR Training | MY: Mock Preparation (recap Day 1-2 slides)',
  'self_study',
  'player',
  4
FROM training_days td WHERE td.role_id = 'CSM' AND td.day_number = 5;

INSERT INTO training_activities (training_day_id, start_time, end_time, duration_hours, title, description, activity_type, pic, sort_order)
SELECT
  td.id,
  '15:00:00'::TIME,
  '17:00:00'::TIME,
  2.0,
  '🎭 Mock Test!',
  '2 rounds of roleplay with spontaneous scenarios. 80% pass required (45% of total score)',
  'mock_test',
  'coach',
  5
FROM training_days td WHERE td.role_id = 'CSM' AND td.day_number = 5;

INSERT INTO training_activities (training_day_id, start_time, end_time, duration_hours, title, description, activity_type, pic, sort_order)
SELECT
  td.id,
  '17:00:00'::TIME,
  '18:30:00'::TIME,
  1.5,
  'Handover to Team Lead',
  'Graduation! 🎓 Official handover to team',
  'handover',
  'tl',
  6
FROM training_days td WHERE td.role_id = 'CSM' AND td.day_number = 5;

-- ============================================
-- ASSESSMENTS
-- ============================================

-- Common Assessments (Day 1-2)
INSERT INTO assessments (name, role_id, assessment_type, scheduled_day, passing_score, weight_percentage, instructions) VALUES
  ('Product Knowledge Quiz', NULL, 'quiz', 2, 80, 15.00, '5 modules quiz covering StoreHub basics. Open-book test.');

-- Merchant Care Assessments
INSERT INTO assessments (name, role_id, assessment_type, scheduled_day, passing_score, weight_percentage, instructions) VALUES
  ('Advanced System & Networking Quiz', 'MC', 'quiz', 3, 80, 15.00, '35 questions on advanced features and troubleshooting. Open-book.'),
  ('Hardware Assessment', 'MC', 'practical', 4, 80, 15.00, 'Demonstrate hardware assembly, printer configuration, IP troubleshooting.'),
  ('Mock Test - Merchant Care', 'MC', 'mock_test', 4, 80, 45.00, 'Live roleplay through Intercom handling customer support scenarios.');

-- Customer Success Manager Assessments
INSERT INTO assessments (name, role_id, assessment_type, scheduled_day, passing_score, weight_percentage, instructions) VALUES
  ('Advanced System & Networking Quiz', 'CSM', 'quiz', 3, 80, 10.00, '35 questions on advanced features and troubleshooting. Open-book.'),
  ('Hardware Assessment', 'CSM', 'practical', 3, 80, 10.00, 'Demonstrate hardware assembly, printer configuration, IP troubleshooting.'),
  ('CSM Assessment', 'CSM', 'written', 4, 80, 20.00, 'Written assessment on CSM responsibilities and processes.'),
  ('Review Session', 'CSM', 'roleplay', 5, 80, 15.00, 'Present CSM Assessment to coach for feedback.'),
  ('Mock Test - CSM', 'CSM', 'mock_test', 5, 80, 45.00, '2 rounds of roleplay with spontaneous scenarios.');

-- Business Consultant Assessments (to be populated with more detail)
INSERT INTO assessments (name, role_id, assessment_type, scheduled_day, passing_score, weight_percentage, instructions) VALUES
  ('Advanced System & Networking Quiz', 'BC', 'quiz', 3, 80, 10.00, 'Advanced features quiz. Open-book.'),
  ('Hardware Assessment', 'BC', 'practical', 3, 80, 10.00, 'Hardware demonstration and troubleshooting.'),
  ('Pitching Video Submission', 'BC', 'video_submission', 4, 80, 15.00, 'Record and submit pitching video for review.'),
  ('Product Demo', 'BC', 'practical', 4, 80, 15.00, 'Demonstrate full product demo following checklist.'),
  ('SPIN Assessment', 'BC', 'roleplay', 5, 80, 10.00, 'Sales skills assessment using SPIN methodology.'),
  ('Mock Test - BC', 'BC', 'mock_test', 6, 80, 40.00, 'Full pitching mock test with closing.');

-- ============================================
-- LEARNING CONTENT
-- ============================================

-- Day 1-2 Common Content
INSERT INTO learning_content (title, content_type, role_id, estimated_duration_mins, is_required, sort_order) VALUES
  ('All in One 1.1', 'slides', NULL, 120, true, 1),
  ('Module 1 - StoreHub Basics', 'wiki', NULL, 60, true, 2),
  ('Module 2 - Menu & Inventory', 'wiki', NULL, 60, true, 3),
  ('Module 3 - Payments', 'wiki', NULL, 60, true, 4),
  ('Module 4 - Reports & Analytics', 'wiki', NULL, 60, true, 5),
  ('Module 5 - Customer Management', 'wiki', NULL, 60, true, 6);

-- Advanced Training Content
INSERT INTO learning_content (title, content_type, role_id, estimated_duration_mins, is_required, sort_order) VALUES
  ('Advanced System & Features V1.0', 'slides', NULL, 120, true, 10),
  ('Advanced Troubleshooting', 'slides', NULL, 90, true, 11),
  ('Brand Servicing', 'slides', NULL, 120, true, 12);

-- Role-Specific Content
INSERT INTO learning_content (title, content_type, role_id, estimated_duration_mins, is_required, sort_order) VALUES
  ('Care Tools & Supply Chain', 'slides', 'MC', 60, true, 20),
  ('CSM Tools & Supply Chain', 'slides', 'CSM', 60, true, 20),
  ('MOM Tools & Supply Chain', 'slides', 'MOM', 60, true, 20),
  ('People Engagement', 'slides', 'BC', 90, true, 20),
  ('Salesforce Playbook', 'document', 'BC', 60, true, 21),
  ('BIR Training (PH Only)', 'slides', NULL, 60, false, 30);
