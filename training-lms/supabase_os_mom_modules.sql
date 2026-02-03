-- =====================================================
-- INSERT OS (Onboarding Specialist) AND MOM (Merchant Onboarding Manager) MODULES
-- Generated from CSV: Training LMS Master - 2026 - [Blueprint] Roles & Learning Agendas
-- Run this in Supabase SQL Editor
-- =====================================================

-- First, delete existing OS and MOM modules to avoid duplicates
DELETE FROM training_modules
WHERE role_id IN (
  SELECT id FROM training_roles WHERE short_code IN ('OS', 'MOM')
);

-- Also update the total_days for MOM role (6 days total)
UPDATE training_roles SET total_days = 6 WHERE short_code = 'MOM';
UPDATE training_roles SET total_days = 5 WHERE short_code = 'OS';

-- =====================================================
-- SHARED MODULES (OS + MOM) - Day 3
-- =====================================================

-- Day 3: Advanced System & Features (SHARED)
INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, resource_url, is_common, sort_order)
SELECT id, 3, '09:30', '11:30', 2.0,
  'Advanced System & Features',
  'Reports, CSVs, promotions, price books… any many more. What really matters is how these tools help merchants understand their business, save time, and make better decisions. Go deeper into advanced features like QR Order & Pay, Beep Delivery, Membership, Engage, and more- and think about how they solve real merchant problems in the real world.---SUCCESS_CRITERIA---Complete task within the hour and move on to Advanced Troubleshooting.',
  'Self Study',
  'https://storehub.sg.larksuite.com/wiki/Q6dkwGUhhiRNrKkPAY0l37KYgig',
  false, 1
FROM training_roles WHERE short_code = 'OS';

INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, resource_url, is_common, sort_order)
SELECT id, 3, '09:30', '11:30', 2.0,
  'Advanced System & Features',
  'Reports, CSVs, promotions, price books… any many more. What really matters is how these tools help merchants understand their business, save time, and make better decisions. Go deeper into advanced features like QR Order & Pay, Beep Delivery, Membership, Engage, and more- and think about how they solve real merchant problems in the real world.---SUCCESS_CRITERIA---Complete task within the hour and move on to Advanced Troubleshooting.',
  'Self Study',
  'https://storehub.sg.larksuite.com/wiki/Q6dkwGUhhiRNrKkPAY0l37KYgig',
  false, 1
FROM training_roles WHERE short_code = 'MOM';

-- Day 3: Advanced Troubleshooting (SHARED)
INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, resource_url, is_common, sort_order)
SELECT id, 3, '11:30', '13:00', 1.5,
  'Advanced Troubleshooting',
  'IP addresses, feed tests, printer resets… sounds technical, sure. But this is really about getting merchants unstuck when things stop printing. Self-study the basics of networking and printer troubleshooting, and understand how each step helps get operations back on track.---SUCCESS_CRITERIA---Complete task within the hour and move on to Quiz.',
  'Self Study',
  'https://storehub.sg.larksuite.com/wiki/BV67wlB0Yic2B7k83Y4le3VigIe',
  false, 2
FROM training_roles WHERE short_code = 'OS';

INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, resource_url, is_common, sort_order)
SELECT id, 3, '11:30', '13:00', 1.5,
  'Advanced Troubleshooting',
  'IP addresses, feed tests, printer resets… sounds technical, sure. But this is really about getting merchants unstuck when things stop printing. Self-study the basics of networking and printer troubleshooting, and understand how each step helps get operations back on track.---SUCCESS_CRITERIA---Complete task within the hour and move on to Quiz.',
  'Self Study',
  'https://storehub.sg.larksuite.com/wiki/BV67wlB0Yic2B7k83Y4le3VigIe',
  false, 2
FROM training_roles WHERE short_code = 'MOM';

-- Day 3: Lunch (SHARED)
INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, resource_url, is_common, sort_order)
SELECT id, 3, '13:00', '14:00', 1.0, 'Lunch', 'Lunch break', 'Break', NULL, false, 3
FROM training_roles WHERE short_code = 'OS';

INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, resource_url, is_common, sort_order)
SELECT id, 3, '13:00', '14:00', 1.0, 'Lunch', 'Lunch break', 'Break', NULL, false, 3
FROM training_roles WHERE short_code = 'MOM';

-- Day 3: Advanced System Quiz (SHARED)
INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, resource_url, is_common, sort_order)
SELECT id, 3, '14:00', '15:00', 1.0,
  'Advanced System: Quiz Time !',
  'Complete 35 questions. Achieve a minimal score of 80%, there will be no retake. Use slides as reference as this is an open book test.---SUCCESS_CRITERIA---Minimum passing rate is 80%',
  'Assessment',
  'https://forms.gle/p6D3RURcN4sa9ukw8',
  false, 4
FROM training_roles WHERE short_code = 'OS';

INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, resource_url, is_common, sort_order)
SELECT id, 3, '14:00', '15:00', 1.0,
  'Advanced System: Quiz Time !',
  'Complete 35 questions. Achieve a minimal score of 80%, there will be no retake. Use slides as reference as this is an open book test.---SUCCESS_CRITERIA---Minimum passing rate is 80%',
  'Assessment',
  'https://forms.gle/p6D3RURcN4sa9ukw8',
  false, 4
FROM training_roles WHERE short_code = 'MOM';

-- Day 3: Sync Up (SHARED)
INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, resource_url, is_common, sort_order)
SELECT id, 3, '15:00', '15:30', 0.5,
  'Sync Up !',
  'This is a chance to tell your trainer if you have any confusion- feel free and shamelessly ask questions so you could stay on track. During this session, your trainer will:
1. Recap on the topics you''ve read through
2. Conduct a product demo
3. Discuss quiz questions

P.S.: Do not submit the quiz form until you''ve discussed with trainer.',
  'Trainer Led',
  NULL,
  false, 5
FROM training_roles WHERE short_code = 'OS';

INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, resource_url, is_common, sort_order)
SELECT id, 3, '15:00', '15:30', 0.5,
  'Sync Up !',
  'This is a chance to tell your trainer if you have any confusion- feel free and shamelessly ask questions so you could stay on track. During this session, your trainer will:
1. Recap on the topics you''ve read through
2. Conduct a product demo
3. Discuss quiz questions

P.S.: Do not submit the quiz form until you''ve discussed with trainer.',
  'Trainer Led',
  NULL,
  false, 5
FROM training_roles WHERE short_code = 'MOM';

-- Day 3: Hardware Assessment (SHARED)
INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, resource_url, is_common, sort_order)
SELECT id, 3, '15:30', '16:30', 1.0,
  'Hardware Assessment',
  'Assemble hardware, search for printers, run feed tests, reset and configure devices, and troubleshoot IP issues… sounds like a lot, but this is about making sure everything works for merchants. You''ll need at least 80% to pass.---SUCCESS_CRITERIA---Minimum passing rate is 80%',
  'Trainer Led',
  'https://forms.gle/4uqyPthsVweeZPqx6',
  false, 6
FROM training_roles WHERE short_code = 'OS';

INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, resource_url, is_common, sort_order)
SELECT id, 3, '15:30', '16:30', 1.0,
  'Hardware Assessment',
  'Assemble hardware, search for printers, run feed tests, reset and configure devices, and troubleshoot IP issues… sounds like a lot, but this is about making sure everything works for merchants. You''ll need at least 80% to pass.---SUCCESS_CRITERIA---Minimum passing rate is 80%',
  'Trainer Led',
  'https://forms.gle/4uqyPthsVweeZPqx6',
  false, 6
FROM training_roles WHERE short_code = 'MOM';

-- =====================================================
-- OS-SPECIFIC MODULES - Day 3 (continued)
-- =====================================================

-- Day 3: Tools & Supply Chain (OS)
INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, resource_url, is_common, sort_order)
SELECT id, 3, '16:30', '17:30', 1.0,
  'Tools & Supply Chain',
  'Intercom, Aircall, supply chain processes, sounds like tools. What really matters is how you use them to help merchants faster, solve problems smarter, and keep operations running smoothly.---SUCCESS_CRITERIA---Complete task within the hour and move on to Brand Servicing',
  'Self Study',
  'https://storehub.sg.larksuite.com/wiki/XptXwmBv1iC3MqkQBUnlyaBjgkb',
  false, 7
FROM training_roles WHERE short_code = 'OS';

-- Day 3: Brand Servicing (OS only)
INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, resource_url, is_common, sort_order)
SELECT id, 3, '17:30', '18:30', 1.0,
  'Brand Servicing',
  'Communication, empathy, patience… these are the tools that actually make merchants feel heard, supported, and confident. Master these, and you''ll turn every interaction into a positive experience.---SUCCESS_CRITERIA---Complete task within the hour.',
  'Self Study',
  'https://storehub.sg.larksuite.com/wiki/Ug1Kw52ROiPFy6kQVbRlyLAKg6b',
  false, 8
FROM training_roles WHERE short_code = 'OS';

-- =====================================================
-- MOM-SPECIFIC MODULES - Day 3 (continued)
-- =====================================================

-- Day 3: Tools & Supply Chain (MOM - different resource link)
INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, resource_url, is_common, sort_order)
SELECT id, 3, '16:30', '17:30', 1.0,
  'Tools & Supply Chain',
  'Intercom, Aircall, supply chain processes, sounds like tools. What really matters is how you use them to help merchants faster, solve problems smarter, and keep operations running smoothly.---SUCCESS_CRITERIA---Complete task within the hour and move on to Brand Servicing',
  'Self Study',
  'https://storehub.sg.larksuite.com/wiki/Nw1KwmDV9iVPDzkzDdQlUeHEgUc',
  false, 7
FROM training_roles WHERE short_code = 'MOM';

-- =====================================================
-- OS-SPECIFIC MODULES - Day 4
-- =====================================================

-- Day 4: Buddy Session with OC (OS)
INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, resource_url, is_common, sort_order)
SELECT id, 4, '09:30', '10:30', 1.0,
  'Buddy Session with Onboarding Coordinator',
  'Buddy sessions with OEs to learn menu setup, take notes in the Buddy Checklist, and record everything they learn, while senior players leave comments and reviews.

While self-study is a fantastic way to build your foundation, nothing beats the insight and guidance of a senior showing you their top skills in action.

Enter the Buddy Session- your opportunity to learn directly from seasoned experts. This is your chance to connect with the Onboarding Coordinator, Onboarding Specialist, and Merchant Onboarding Managers.

But it''s more than just a meet-and-greet! These sessions will help you:
- Get to know your senior teammates better.
- Understand their workflows.
- Learn how to communicate effectively as a team when handling merchants.

What''s Expected During the Sessions:

1. Ask Questions: Come prepared with queries and ask away!
2. Observe: Pay close attention to their processes and how they manage tasks.
3. Record Your Learnings: Create a copy of the Buddy Checklist Template to document everything you learn.

P.S.: Ensure that you''ve already sent invitations to your Buddy.',
  'Buddy Led',
  'https://storehub.sg.larksuite.com/sheets/ZqDlseFE3hfXObt78Sql4vq8gsc',
  false, 1
FROM training_roles WHERE short_code = 'OS';

-- Day 4: Menu Setup (OS)
INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, resource_url, is_common, sort_order)
SELECT id, 4, '10:30', '13:00', 2.5,
  'Menu Setup!',
  'The purpose of this task is to help you get hands-on experience with menu setup—just like an Onboarding Executive! Upskilling starts here.

Here''s what you need to do:
1. Open the Request section in each ticket and review the merchant''s menu.
2. Use your BackOffice account (the one you created on Day 1) to set up the items from these tickets.
3. Create at least 20 products each for both F&B and Retail businesses.

Once you''re done, inform your Buddy to review your work by sharing access to your BackOffice. Don''t forget to add them as an employee to give them a peek at your setup.',
  'Assignment',
  'https://app.intercom.com/a/inbox/v2axofpf/inbox/conversation/189972000831621?view=List

https://app.intercom.com/a/inbox/v2axofpf/inbox/conversation/189972000848166?view=List',
  false, 2
FROM training_roles WHERE short_code = 'OS';

-- Day 4: Lunch (OS)
INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, resource_url, is_common, sort_order)
SELECT id, 4, '13:00', '14:00', 1.0, 'Lunch', 'Lunch break', 'Break', NULL, false, 3
FROM training_roles WHERE short_code = 'OS';

-- Day 4: Training Slides & Assessment Prep (OS)
INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, resource_url, is_common, sort_order)
SELECT id, 4, '14:00', '16:30', 2.5,
  'Training Slides & Assessment Preparation',
  'Training Deck Deep Dive & Assessments

For this task, you''ll spend time immersing yourself in the training deck that you''ll soon use to guide your beloved merchants.

Step 1: Learn from the Masters
- Begin by watching video samples of your seniors in action.
- Observe how they ace merchant training.
- While you watch and read through the deck, take your own notes.

Pro Tip for Watching Videos:
- Speed things up: Play them at a higher speed.
- Skip around: Jump to the sections you need.

Step 2: Put Your Knowledge to the Test
Later in the day, you''ll be tested in a mock assessment with your coach. There will be 2 Training Assessments:
- F&B Training Assessment
- Retail Training Assessment

The assessments flow:
1. First 30 minutes: Conduct a mock training session
2. Next 30 minutes: Receive feedback from your coach

Important Tips:
- No Pressure: Just have fun and stay natural
- Be Engaging: Treat it like it''s with real merchants
- Be Prepared: Use the provided checklist',
  'Self Study',
  'MY

Training Deck
F&B: https://docs.google.com/presentation/d/1U-dwU-kC8l-pJ211sBoQQS4jexhtpNCpcqE-4EEjbys/edit#slide=id.g26b7f38cc86_0_2118

Retail:
- BackOffice: https://drive.google.com/file/d/12cW2Y_KCrX-mCLtVJxh-jKNEQMoZMjpS/view?usp=sharing
- POS: https://drive.google.com/file/d/12rmHgBFt5RjwTRfLE972Crf1a5f57k_f/view?usp=sharing

F&B:
Backoffice + POS+QR Order+Composite Inventory
https://drive.google.com/file/d/1QTENB88GpZKnxoirVeIpXZ-f2M1atCF6/view?usp=sharing

Training Checklist: https://storehub.sg.larksuite.com/wiki/EEwFwJc4ZiEhebkxzT9l0QjSgjh',
  false, 4
FROM training_roles WHERE short_code = 'OS';

-- Day 4: Buddy Session with OS (OS)
INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, resource_url, is_common, sort_order)
SELECT id, 4, '16:30', '18:30', 2.0,
  'Buddy Session with Onboarding Specialist',
  'Buddy sessions with OSs to learn menu setup, take notes in the Buddy Checklist, and record everything they learn.

What''s Expected During the Sessions:

1. Ask Questions: Come prepared with queries and ask away!
2. Observe: Pay close attention to their processes and how they manage tasks.
3. Record Your Learnings: Create a copy of the Buddy Checklist Template to document everything you learn.

P.S.: Ensure that you''ve already sent invitations to your Buddy.',
  'Buddy Led',
  'https://storehub.sg.larksuite.com/sheets/ZqDlseFE3hfXObt78Sql4vq8gsc',
  false, 5
FROM training_roles WHERE short_code = 'OS';

-- =====================================================
-- OS-SPECIFIC MODULES - Day 5
-- =====================================================

-- Day 5: Training Video Assessment F&B (OS)
INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, resource_url, is_common, sort_order)
SELECT id, 5, '09:30', '10:30', 1.0,
  'Training Video Assessment (F&B)',
  'The time has come! Time for you to show us what you got.---SUCCESS_CRITERIA---Passing rate of 80%---SCORECARD_URL---https://forms.gle/PoWWciHpStBQyoy2A',
  'Coach Led',
  'https://storehub.sg.larksuite.com/wiki/EEwFwJc4ZiEhebkxzT9l0QjSgjh',
  false, 1
FROM training_roles WHERE short_code = 'OS';

-- Day 5: Self Reflect (OS)
INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, resource_url, is_common, sort_order)
SELECT id, 5, '10:30', '11:00', 0.5,
  'Self Reflect',
  'Reflect from previous assessment and apply improvement on Retail Assessment',
  'Self Study',
  NULL,
  false, 2
FROM training_roles WHERE short_code = 'OS';

-- Day 5: Training Video Assessment Retail (OS)
INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, resource_url, is_common, sort_order)
SELECT id, 5, '11:00', '12:00', 1.0,
  'Training Video Assessment (Retail)',
  'The time has come! Time for you to show us what you got.---SUCCESS_CRITERIA---Passing rate of 80%---SCORECARD_URL---https://forms.gle/NLz3fTGEzrtig3qz9',
  'Coach Led',
  'https://storehub.sg.larksuite.com/wiki/EEwFwJc4ZiEhebkxzT9l0QjSgjh',
  false, 3
FROM training_roles WHERE short_code = 'OS';

-- Day 5: Lunch (OS)
INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, resource_url, is_common, sort_order)
SELECT id, 5, '13:00', '14:00', 1.0, 'Lunch', 'Lunch break', 'Break', NULL, false, 4
FROM training_roles WHERE short_code = 'OS';

-- Day 5: Buddy Session with MOM (OS)
INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, resource_url, is_common, sort_order)
SELECT id, 5, '14:00', '15:00', 1.0,
  'Buddy Session with Merchant Onboarding Manager !',
  'Buddy sessions with MOMs to learn menu setup, take notes in the Buddy Checklist, and record everything they learn.

What''s Expected During the Sessions:

1. Ask Questions: Come prepared with queries and ask away!
2. Observe: Pay close attention to their processes and how they manage tasks.
3. Record Your Learnings: Create a copy of the Buddy Checklist Template to document everything you learn.

P.S.: Ensure that you''ve already sent invitations to your Buddy.',
  'Buddy Led',
  'https://storehub.sg.larksuite.com/sheets/ZqDlseFE3hfXObt78Sql4vq8gsc',
  false, 5
FROM training_roles WHERE short_code = 'OS';

-- Day 5: Mock Test Briefing (OS)
INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, resource_url, is_common, sort_order)
SELECT id, 5, '15:00', '15:30', 0.5,
  'Mock Test !',
  'Final Stage: Mock Test Assessment

Congratulations on reaching the final stage of your training program! This is your ultimate challenge: two rounds of Mock Tests—one focused on Retail and the other on F&B.

How It Works:
- Topics: Your coach will share the topics you need to cover during the Mock Test.
- Preparation: A ticket will be assigned to you one day prior.
- Application: Bring all your learning to life! Remember those soft skills from Brand Servicing.
- Evaluation: Your performance will be assessed.',
  'Trainer Led',
  NULL,
  false, 6
FROM training_roles WHERE short_code = 'OS';

-- Day 5: Training Mock Test F&B (OS)
INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, resource_url, is_common, sort_order)
SELECT id, 5, '15:30', '16:30', 1.0,
  'Training Mock Test (F&B)',
  'Final Tips:
- Stay calm and confident—you''ve got this!
- Review your notes and practice the training flow beforehand.
- Focus on both technical accuracy and delivering an excellent experience.

Good luck, and may you ace your Mock Test like a pro!---SUCCESS_CRITERIA---Passing rate of 80%---SCORECARD_URL---https://forms.gle/CcfmMcrb48cj6iMx6',
  'Coach Led',
  NULL,
  false, 7
FROM training_roles WHERE short_code = 'OS';

-- Day 5: Self Reflect 2 (OS)
INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, resource_url, is_common, sort_order)
SELECT id, 5, '16:30', '17:00', 0.5,
  'Self Reflect',
  'Reflect from previous assessment and apply improvement on Retail Assessment',
  'Self Study',
  NULL,
  false, 8
FROM training_roles WHERE short_code = 'OS';

-- Day 5: Training Mock Test Retail (OS)
INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, resource_url, is_common, sort_order)
SELECT id, 5, '17:00', '18:00', 1.0,
  'Training Mock Test (Retail)',
  'Final Tips:
- Stay calm and confident—you''ve got this!
- Review your notes and practice the training flow beforehand.
- Focus on both technical accuracy and delivering an excellent experience.

Good luck, and may you ace your Mock Test like a pro!---SUCCESS_CRITERIA---Passing rate of 80%---SCORECARD_URL---https://forms.gle/F5SaX7CURqrNoEV66',
  'Coach Led',
  NULL,
  false, 9
FROM training_roles WHERE short_code = 'OS';

-- Day 5: Feedback Session (OS)
INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, resource_url, is_common, sort_order)
SELECT id, 5, '18:00', '18:30', 0.5,
  'Feedback Session with coach',
  'Great job! You have reached the finishing line- your coach will advice you the next steps.',
  'Coach Led',
  'Provide certificate.',
  false, 10
FROM training_roles WHERE short_code = 'OS';

-- =====================================================
-- MOM-SPECIFIC MODULES - Day 4
-- =====================================================

-- Day 4: Menu Setup (MOM)
INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, resource_url, is_common, sort_order)
SELECT id, 4, '09:30', '10:30', 1.0,
  'Menu Setup',
  'The purpose of this task is to help you get hands-on experience with menu setup—just like an Onboarding Executive! Upskilling starts here.

Here''s what you need to do:
1. Open the Request section in each ticket and review the merchant''s menu.
2. Use your BackOffice account (the one you created on Day 1) to set up the items from these tickets.
3. Create at least 20 products each for both F&B and Retail businesses.

Once you''re done, inform your Buddy to review your work by sharing access to your BackOffice.',
  'Assignment',
  'https://app.intercom.com/a/inbox/v2axofpf/inbox/conversation/189972000831621?view=List

https://app.intercom.com/a/inbox/v2axofpf/inbox/conversation/189972000848166?view=List',
  false, 1
FROM training_roles WHERE short_code = 'MOM';

-- Day 4: Buddy with OS (MOM)
INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, resource_url, is_common, sort_order)
SELECT id, 4, '10:30', '12:30', 2.0,
  'Buddy with Onboarding Specialist',
  'Buddy sessions with OSs to learn menu setup, take notes in the Buddy Checklist, and record everything they learn.

What''s Expected During the Sessions:

1. Ask Questions: Come prepared with queries and ask away!
2. Observe: Pay close attention to their processes and how they manage tasks.
3. Record Your Learnings: Create a copy of the Buddy Checklist Template to document everything you learn.

P.S.: Ensure that you''ve already sent invitations to your Buddy.',
  'Buddy Led',
  'https://storehub.sg.larksuite.com/sheets/ZqDlseFE3hfXObt78Sql4vq8gsc',
  false, 2
FROM training_roles WHERE short_code = 'MOM';

-- Day 4: Lunch (MOM)
INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, resource_url, is_common, sort_order)
SELECT id, 4, '12:30', '13:30', 1.0, 'Lunch', 'Lunch break', 'Break', NULL, false, 3
FROM training_roles WHERE short_code = 'MOM';

-- Day 4: Buddy with MOM (MOM)
INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, resource_url, is_common, sort_order)
SELECT id, 4, '13:30', '15:30', 2.0,
  'Buddy with Merchant Onboarding Manager',
  'Buddy sessions with MOMs to learn BAU duties, take notes in the Buddy Checklist, and record everything they learn.

What''s Expected During the Sessions:

1. Ask Questions: Come prepared with queries and ask away!
2. Observe: Pay close attention to their processes and how they manage tasks.
3. Record Your Learnings: Create a copy of the Buddy Checklist Template to document everything you learn.

P.S.: Ensure that you''ve already sent invitations to your Buddy.',
  'Buddy Led',
  'https://storehub.sg.larksuite.com/sheets/ZqDlseFE3hfXObt78Sql4vq8gsc',
  false, 4
FROM training_roles WHERE short_code = 'MOM';

-- Day 4: Welcome Call and Go Live Check in (MOM)
INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, resource_url, is_common, sort_order)
SELECT id, 4, '15:30', '16:30', 1.0,
  'Welcome Call and Go Live Check in recording',
  'What is a Welcome Call?

The Welcome Call is like rolling out the red carpet for merchants who''ve just onboarded with StoreHub. Your role? To greet them warmly, make sure they''re equipped with everything they need, and offer your stellar assistance to get them off to a smooth start.

Before you dial in:
1. Dive into their Salesforce account. Understand their profile, their business.
2. Adjust your script based on the intel you gather.
3. Be sharp, prepared, and have all the info at your fingertips.

What is a Go Live Check-in?

The Go Live Check-in is your chance to give merchants one final pulse check before they officially hit the ground running with their business.

Your role:
- Check in on their onboarding experience
- Confirm they''ve received all the resources they need
- Offer any last-minute assistance',
  'Self Study',
  'https://storehub.sg.larksuite.com/wiki/YQlLwMo5UilR6KkuGtIlKxScgGw',
  false, 5
FROM training_roles WHERE short_code = 'MOM';

-- Day 4: Training Slides & Assessment Prep (MOM)
INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, resource_url, is_common, sort_order)
SELECT id, 4, '16:30', '18:30', 2.0,
  'Training Slides & Assessment Preparation',
  'Training Deck Deep Dive & Assessments

For this task, you''ll immerse yourself in the training deck that you''ll soon use to guide your beloved merchants.

Step 1: Learn from the Masters
- Begin by watching video samples of your seniors in action.
- Observe how they ace merchant training.
- While you watch and read through the deck, take your own notes.

Step 2: Put Your Knowledge to the Test
Later in the day, you''ll be tested in a mock assessment with your coach. There will be 2 Training Assessments:
- F&B Training Assessment
- Retail Training Assessment',
  'Self Study',
  'MY

Training Deck
F&B: https://docs.google.com/presentation/d/1U-dwU-kC8l-pJ211sBoQQS4jexhtpNCpcqE-4EEjbys/edit#slide=id.g26b7f38cc86_0_2118

Training Checklist: https://storehub.sg.larksuite.com/wiki/EEwFwJc4ZiEhebkxzT9l0QjSgjh',
  false, 6
FROM training_roles WHERE short_code = 'MOM';

-- =====================================================
-- MOM-SPECIFIC MODULES - Day 5
-- =====================================================

-- Day 5: Training Slides Prep Cont (MOM)
INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, resource_url, is_common, sort_order)
SELECT id, 5, '09:30', '11:30', 2.0,
  'Training Slides & Assessment Preparation (Cont.)',
  'Continue your training deck deep dive. Review all materials and prepare for the assessments.',
  'Self Study',
  'Training Checklist: https://storehub.sg.larksuite.com/wiki/EEwFwJc4ZiEhebkxzT9l0QjSgjh',
  false, 1
FROM training_roles WHERE short_code = 'MOM';

-- Day 5: Training Video Assessment F&B (MOM)
INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, resource_url, is_common, sort_order)
SELECT id, 5, '11:30', '12:30', 1.0,
  'Training Video Assessment (F&B)',
  'The time has come! Time for you to show us what you got.---SUCCESS_CRITERIA---Passing rate of 80%---SCORECARD_URL---https://forms.gle/PoWWciHpStBQyoy2A',
  'Coach Led',
  'https://storehub.sg.larksuite.com/wiki/GZ4PwgMIZiLz2Jkp1u8lyphBgEg',
  false, 2
FROM training_roles WHERE short_code = 'MOM';

-- Day 5: Lunch (MOM)
INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, resource_url, is_common, sort_order)
SELECT id, 5, '13:00', '14:00', 1.0, 'Lunch', 'Lunch break', 'Break', NULL, false, 3
FROM training_roles WHERE short_code = 'MOM';

-- Day 5: Self Reflect (MOM)
INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, resource_url, is_common, sort_order)
SELECT id, 5, '14:00', '15:30', 1.5,
  'Self Reflect',
  'Reflect from previous assessment and apply improvement on Retail Assessment',
  'Self Study',
  NULL,
  false, 4
FROM training_roles WHERE short_code = 'MOM';

-- Day 5: Training Video Assessment Retail (MOM)
INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, resource_url, is_common, sort_order)
SELECT id, 5, '15:30', '16:30', 1.0,
  'Training Video Assessment (Retail)',
  'The time has come! Time for you to show us what you got.---SUCCESS_CRITERIA---Passing rate of 80%---SCORECARD_URL---https://forms.gle/NLz3fTGEzrtig3qz9',
  'Coach Led',
  'https://storehub.sg.larksuite.com/wiki/GZ4PwgMIZiLz2Jkp1u8lyphBgEg',
  false, 5
FROM training_roles WHERE short_code = 'MOM';

-- Day 5: Mock Test Flow (MOM)
INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, resource_url, is_common, sort_order)
SELECT id, 5, '16:30', '17:00', 0.5,
  'Mock Test Flow!',
  'Final Stage: Mock Test Assessment

Congratulations on reaching the final stage of your training program! This is your ultimate challenge: For your role, you''ll face 4 rounds of Mock Tests, and your total score will be the average of all 4 rounds.

How It Works:
- Topics: Your coach will share the topics you need to cover during the Mock Test.
- Preparation: A ticket will be assigned to you one day prior.
- Application: Bring all your learning to life!
- Evaluation: Your performance will be assessed.',
  'Trainer Led',
  'https://storehub.sg.larksuite.com/wiki/Gmi5w3KyYiRE4Akpvt8lcgJFgob',
  false, 6
FROM training_roles WHERE short_code = 'MOM';

-- Day 5: Practice for Mock Test (MOM)
INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, resource_url, is_common, sort_order)
SELECT id, 5, '17:00', '18:30', 1.5,
  'Practice for Mock Test',
  'Use this time to recap all the modules you''ve learned and practice Welcome Call, Go Live Call and Training Assessment',
  'Self Study',
  'https://storehub.sg.larksuite.com/wiki/Gmi5w3KyYiRE4Akpvt8lcgJFgob',
  false, 7
FROM training_roles WHERE short_code = 'MOM';

-- =====================================================
-- MOM-SPECIFIC MODULES - Day 6
-- =====================================================

-- Day 6: Practice for Mock Test Cont (MOM)
INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, resource_url, is_common, sort_order)
SELECT id, 6, '09:30', '10:30', 1.0,
  'Practice for Mock Test (Cont.)',
  'Use this time to recap all the modules you''ve learned and practice Welcome Call, Go Live Call and Training Assessment',
  'Self Study',
  NULL,
  false, 1
FROM training_roles WHERE short_code = 'MOM';

-- Day 6: Mock Test Welcome Call (MOM)
INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, resource_url, is_common, sort_order)
SELECT id, 6, '10:30', '11:30', 1.0,
  'Mock Test: Welcome Call',
  'Final Tips:
- Stay calm and confident- you''ve got this!
- Review your notes and practice the Welcome Call flow beforehand.
- Focus on both technical accuracy and delivering an excellent experience.

Good luck, and may you ace your Mock Test like a pro!---SCORECARD_URL---https://forms.gle/faZ9tWtdaq34Sb9r7',
  'Coach Led',
  NULL,
  false, 2
FROM training_roles WHERE short_code = 'MOM';

-- Day 6: Mock Test Go Live (MOM)
INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, resource_url, is_common, sort_order)
SELECT id, 6, '11:30', '12:30', 1.0,
  'Mock Test: Go Live',
  'Final Tips:
- Stay calm and confident- you''ve got this!
- Review your notes and practice the Go Live Call flow beforehand.
- Focus on both technical accuracy and delivering an excellent experience.

Good luck, and may you ace your Mock Test like a pro!---SCORECARD_URL---https://forms.gle/8RqXyt7unMg25skK9',
  'Coach Led',
  NULL,
  false, 3
FROM training_roles WHERE short_code = 'MOM';

-- Day 6: Lunch (MOM)
INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, resource_url, is_common, sort_order)
SELECT id, 6, '12:30', '13:30', 1.0, 'Lunch', 'Lunch break', 'Break', NULL, false, 4
FROM training_roles WHERE short_code = 'MOM';

-- Day 6: Practice for Mock Test 2 (MOM)
INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, resource_url, is_common, sort_order)
SELECT id, 6, '13:30', '14:30', 1.0,
  'Practice for Mock Test',
  'Use this time to recap all the modules you''ve learned and practice Welcome Call, Go Live Call and Training Assessment',
  'Self Study',
  NULL,
  false, 5
FROM training_roles WHERE short_code = 'MOM';

-- Day 6: Training Mock Test F&B (MOM)
INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, resource_url, is_common, sort_order)
SELECT id, 6, '14:30', '15:30', 1.0,
  'Training Mock Test (F&B)',
  'Final Tips:
- Stay calm and confident—you''ve got this!
- Review your notes and practice the training flow beforehand.
- Focus on both technical accuracy and delivering an excellent experience.

Good luck, and may you ace your Mock Test like a pro!---SUCCESS_CRITERIA---Passing rate of 80%---SCORECARD_URL---https://forms.gle/CcfmMcrb48cj6iMx6',
  'Coach Led',
  NULL,
  false, 6
FROM training_roles WHERE short_code = 'MOM';

-- Day 6: Self Reflect (MOM)
INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, resource_url, is_common, sort_order)
SELECT id, 6, '15:30', '16:00', 0.5,
  'Self Reflect',
  'Reflect from previous assessment and apply improvement on Retail Assessment',
  'Self Study',
  NULL,
  false, 7
FROM training_roles WHERE short_code = 'MOM';

-- Day 6: Training Mock Test Retail (MOM)
INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, resource_url, is_common, sort_order)
SELECT id, 6, '16:00', '17:00', 1.0,
  'Training Mock Test (Retail)',
  'Final Tips:
- Stay calm and confident—you''ve got this!
- Review your notes and practice the training flow beforehand.
- Focus on both technical accuracy and delivering an excellent experience.

Good luck, and may you ace your Mock Test like a pro!---SCORECARD_URL---https://forms.gle/F5SaX7CURqrNoEV66',
  'Coach Led',
  NULL,
  false, 8
FROM training_roles WHERE short_code = 'MOM';

-- Day 6: Feedback Session (MOM)
INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, resource_url, is_common, sort_order)
SELECT id, 6, '17:00', '18:30', 1.5,
  'Feedback Session with coach',
  'Great job! You have reached the finishing line- your coach will advice you the next steps.',
  'Coach Led',
  'Provide certificate.',
  false, 9
FROM training_roles WHERE short_code = 'MOM';

-- =====================================================
-- DONE! Run this in Supabase SQL Editor
-- =====================================================
