-- =====================================================
-- OC (Onboarding Coordinator) MODULES WITH LARK RESOURCES
-- Run this in Supabase SQL Editor
-- =====================================================

-- First, update the OC role to have 4 days (not 5)
UPDATE training_roles SET total_days = 4 WHERE short_code = 'OC';

-- Update Day 1-2 common modules with resource links
UPDATE training_modules
SET resource_url = 'https://storehub.sg.larksuite.com/wiki/QqIDwLTciiUfhnk7dLylG5I6ghb'
WHERE topic = 'All-in-One - Software' AND is_common = true;

UPDATE training_modules
SET resource_url = 'https://storehub.sg.larksuite.com/wiki/QqIDwLTciiUfhnk7dLylG5I6ghb'
WHERE topic = 'All-in-One - Hardware' AND is_common = true;

UPDATE training_modules
SET resource_url = 'https://storehub.sg.larksuite.com/wiki/QqIDwLTciiUfhnk7dLylG5I6ghb'
WHERE topic = 'All-in-One - Features' AND is_common = true;

UPDATE training_modules
SET resource_url = 'https://storehub.sg.larksuite.com/wiki/QqIDwLTciiUfhnk7dLylG5I6ghb'
WHERE topic = 'System Navigation & Merchant Profile' AND is_common = true;

-- Insert OC-specific modules for Days 3-4
INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, resource_url, is_common, sort_order)
SELECT
  id,
  day,
  start_time,
  end_time,
  duration_hours,
  topic,
  details,
  type,
  resource_url,
  false,
  sort_order
FROM training_roles, (VALUES
  -- DAY 3: Advanced Modules & OC Tools
  (3, '09:30', '11:30', 2.0,
   'Advanced System & Features',
   'Advanced StoreHub Knowledge: Ready to Level Up! This part is tailored for Customer Representatives roles. Topics: Reports, CSV import/export, Promotions, Pricebooks, QR Order & Pay, Beep Delivery, Membership, Engage. Deep dive into advanced system navigation and troubleshooting.',
   'Self-Study',
   'https://storehub.sg.larksuite.com/wiki/Q6dkwGUhhiRNrKkPAY0l37KYgig',
   1),

  (3, '11:30', '13:00', 1.5,
   'Advanced Troubleshooting',
   'Learn advanced troubleshooting techniques. Topics: Networking basics, printer troubleshooting (IP addresses, feed tests, printer resets, printer configuration). By the end, you should be able to configure printer IP addresses, run feed tests, reset printers, and troubleshoot common network issues.',
   'Self-Study',
   'https://storehub.sg.larksuite.com/wiki/BV67wlB0Yic2B7k83Y4le3VigIe',
   2),

  (3, '13:00', '14:00', 1.0,
   'Lunch Break',
   'Lunch break',
   'Break',
   NULL,
   3),

  (3, '14:00', '15:00', 1.0,
   'Advance System & Networking Quiz',
   'Complete the Advanced System & Networking Quiz. 35 questions with 80% passing score required. Open-book test - you can use slides as reference. Discuss any concerns with your trainer before submitting.',
   'Assessment',
   'https://forms.gle/Jwec7XCXsd9JDc4f7',
   4),

  (3, '15:00', '16:00', 1.0,
   'Hardware Assessment',
   'Time to roll up your sleeves and get technical! Demonstrate: Hardware assembly, printer search, feed test, printer reset, configuration, IP troubleshooting. Your trainer will assign you a scenario - your job is to diagnose and resolve the issue. 80% pass required.',
   'Assessment',
   'https://forms.gle/4uqyPthsVweeZPqx6',
   5),

  (3, '16:00', '17:00', 1.0,
   'OC Tools & Supply Chain',
   'Explore internal tools: Intercom, Aircall, supply chain processes. Learn how to navigate these tools effectively for your daily OC tasks.',
   'Self-Study',
   'https://storehub.sg.larksuite.com/wiki/RUfHwlcveiyzoHkFwp5ltIuXgCc',
   6),

  (3, '17:00', '18:30', 1.5,
   'Sync Up & Prep for Day 4',
   'Address concerns from today''s learning. Prepare for tomorrow''s Buddy Session and Menu Setup task.',
   'Trainer-Led',
   NULL,
   7),

  -- DAY 4: Buddy Session & Menu Setup
  (4, '09:30', '12:00', 2.5,
   'Buddy Session with Onboarding Executive',
   'Introducing the Buddy Session: Learning From the Pros! This is your opportunity to learn directly from seasoned experts - connect with the Onboarding Executives. Get to know your senior teammates, understand their workflows, and learn effective team communication. Come prepared with queries, observe their processes, and document everything in your Buddy Checklist.',
   'Buddy Session',
   'https://storehub.sg.larksuite.com/sheets/ZqDlseFE3hfXObt78Sql4vq8gsc',
   8),

  (4, '12:00', '13:00', 1.0,
   'Lunch Break',
   'Lunch break',
   'Break',
   NULL,
   9),

  (4, '13:00', '16:00', 3.0,
   'Menu Setup Challenge',
   'Menu Setup Challenge: Channel Your Inner Onboarding Executive! Get hands-on experience with menu setup. Review merchant tickets with menus and set up items in BackOffice. Create at least 40 products each for F&B and Retail businesses. Once done, inform your Buddy to review your work by sharing access to your BackOffice.',
   'Self-Work',
   'https://app.intercom.com/a/inbox/v2axofpf/inbox/conversation/189972000831621?view=List',
   10),

  (4, '16:00', '17:00', 1.0,
   'Menu Review & Feedback',
   'Your Buddy reviews your menu setup work and provides feedback. Address any issues and make corrections.',
   'Buddy Session',
   NULL,
   11),

  (4, '17:00', '18:30', 1.5,
   'Day 4 Wrap-up & Graduation Prep',
   'Final sync up with trainer. You have completed your OC training journey! Handover preparation and next steps discussion.',
   'Graduation',
   NULL,
   12)

) AS data(day, start_time, end_time, duration_hours, topic, details, type, resource_url, sort_order)
WHERE training_roles.short_code = 'OC';

-- Verify the insert
SELECT
  tm.day,
  tm.topic,
  tm.type,
  tm.resource_url,
  tr.short_code as role
FROM training_modules tm
JOIN training_roles tr ON tm.role_id = tr.id
WHERE tr.short_code = 'OC' OR tm.is_common = true
ORDER BY tm.day, tm.sort_order;
