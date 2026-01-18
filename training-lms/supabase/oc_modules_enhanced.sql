-- =====================================================
-- OC (Onboarding Coordinator) MODULES - ENHANCED DESCRIPTIONS
-- Run this in Supabase SQL Editor
-- =====================================================

-- First, delete existing OC-specific modules to avoid duplicates
DELETE FROM training_modules
WHERE role_id = (SELECT id FROM training_roles WHERE short_code = 'OC')
AND is_common = false;

-- Update OC role to 4 days
UPDATE training_roles SET total_days = 4 WHERE short_code = 'OC';

-- Update Day 1-2 common modules with better descriptions and resource links
UPDATE training_modules
SET
  details = 'Welcome to your first dive into StoreHub! This module covers everything about our software - from the BackOffice dashboard to POS operations. You''ll learn how merchants use StoreHub daily to manage their business. Pay special attention to the menu structure and how items flow from BackOffice to POS. Take notes on anything confusing - we''ll address questions in the sync-up session.',
  resource_url = 'https://storehub.sg.larksuite.com/wiki/QqIDwLTciiUfhnk7dLylG5I6ghb'
WHERE topic = 'All-in-One - Software' AND is_common = true;

UPDATE training_modules
SET
  details = 'Time to get hands-on with the hardware! This module covers all StoreHub devices: terminals, receipt printers, cash drawers, and barcode scanners. You''ll learn the physical setup process, cable connections, and how each device communicates with the POS. Understanding hardware is crucial for OCs - merchants often need help troubleshooting device issues during onboarding.',
  resource_url = 'https://storehub.sg.larksuite.com/wiki/QqIDwLTciiUfhnk7dLylG5I6ghb'
WHERE topic = 'All-in-One - Hardware' AND is_common = true;

UPDATE training_modules
SET
  details = 'Deep dive into StoreHub''s powerful features! This module covers advanced capabilities like inventory management, reporting, staff permissions, and integrations. You''ll discover features that make StoreHub stand out - multi-location support, real-time analytics, and seamless payment processing. These features are your selling points when helping merchants see the full value of StoreHub.',
  resource_url = 'https://storehub.sg.larksuite.com/wiki/QqIDwLTciiUfhnk7dLylG5I6ghb'
WHERE topic = 'All-in-One - Features' AND is_common = true;

UPDATE training_modules
SET
  details = 'Master the art of navigating StoreHub like a pro! This extended session covers the BackOffice dashboard, merchant profile settings, and system configuration. You''ll learn where to find everything - from sales reports to employee management. By the end, you should be able to guide a merchant through any section of the system confidently.',
  resource_url = 'https://storehub.sg.larksuite.com/wiki/QqIDwLTciiUfhnk7dLylG5I6ghb'
WHERE topic = 'System Navigation & Merchant Profile' AND is_common = true;

UPDATE training_modules
SET
  details = 'Continue building your system navigation expertise. Focus on merchant profile customization, business settings, and tax configuration. These details matter during onboarding - merchants need their profiles set up correctly from day one. Practice navigating between sections quickly - speed and confidence will impress merchants.'
WHERE topic = 'System Navigation (Cont.)' AND is_common = true;

UPDATE training_modules
SET
  details = 'Watch and learn as your trainer demonstrates the hardware in action! This live demo covers device assembly, pairing procedures, and real-world troubleshooting scenarios. Ask questions freely - this is your chance to see expert techniques before you try them yourself. Pay attention to the small details that make setup smooth.'
WHERE topic = 'Product Demo' AND is_common = true;

UPDATE training_modules
SET
  details = 'Let''s pause and address any questions or concerns from today''s learning. This is your safe space to clarify confusing topics, share observations, and get guidance. No question is too basic - understanding the fundamentals now prevents issues later. Your trainer will also preview what''s coming next.'
WHERE topic = 'Sync Up' AND is_common = true;

UPDATE training_modules
SET
  details = 'Time to prove your knowledge! This 48-question quiz covers everything from Days 1-2. You need 80% to pass. Good news: it''s open-book, so use your slides as reference. Take your time, read each question carefully, and trust your learning. If you don''t pass, don''t worry - your trainer will help you identify gaps before a retake.',
  resource_url = 'https://forms.gle/dAiBZXvPqpfg5fjK8'
WHERE topic = 'Product Knowledge Quiz' AND is_common = true;

UPDATE training_modules
SET
  details = 'Wrapping up the foundation days! Your trainer will address final questions and brief you on what''s coming in your OC-specific training. You''ll learn about the Buddy Session, Menu Setup Challenge, and assessments ahead. Get mentally prepared - the next days focus on real OC skills you''ll use daily.'
WHERE topic = 'Debrief & Role Specific Prep' AND is_common = true;

-- Insert OC-specific modules for Days 3-4 with enhanced descriptions
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
   'Level up your StoreHub expertise! This advanced module covers features that OCs use daily: Reports & Analytics (help merchants understand their data), CSV Import/Export (bulk menu uploads save hours), Promotions & Pricebooks (essential for F&B and retail), QR Order & Pay (contactless dining), Beep Delivery (food delivery integration), and Membership programs. Master these and you''ll handle any merchant request confidently.',
   'Self-Study',
   'https://storehub.sg.larksuite.com/wiki/Q6dkwGUhhiRNrKkPAY0l37KYgig',
   1),

  (3, '11:30', '13:00', 1.5,
   'Advanced Troubleshooting',
   'Become the troubleshooting hero merchants need! This critical module covers: Networking basics (IP addresses, Wi-Fi vs Ethernet, router configuration), Printer troubleshooting (the most common issue you''ll face - learn IP setup, feed tests, paper jams, connectivity drops), and systematic problem diagnosis. When a merchant''s printer stops working mid-service, you''ll know exactly what to check. Practice these steps until they''re second nature.',
   'Self-Study',
   'https://storehub.sg.larksuite.com/wiki/BV67wlB0Yic2B7k83Y4le3VigIe',
   2),

  (3, '13:00', '14:00', 1.0,
   'Lunch Break',
   'Take a well-deserved break! Grab lunch, rest your mind, and come back refreshed for the afternoon assessments. Maybe review your notes if you''re feeling uncertain about anything.',
   'Break',
   NULL,
   3),

  (3, '14:00', '15:00', 1.0,
   'Advance System & Networking Quiz',
   'Show what you''ve learned! This 35-question quiz tests your advanced system knowledge and troubleshooting skills. You need 80% to pass. It''s open-book, so reference your slides. Pro tip: Read each scenario carefully - the details matter in troubleshooting questions. Discuss any uncertainties with your trainer before submitting.',
   'Assessment',
   'https://forms.gle/Jwec7XCXsd9JDc4f7',
   4),

  (3, '15:00', '16:00', 1.0,
   'Hardware Assessment',
   'Time to get your hands dirty! Your trainer will give you a real-world scenario and watch you troubleshoot. You''ll demonstrate: assembling hardware from scratch, searching for and connecting printers, running feed tests, resetting stuck printers, configuring printer settings, and diagnosing IP/network issues. Stay calm, think systematically, and narrate your thought process. 80% pass required - you''ve got this!',
   'Assessment',
   'https://forms.gle/4uqyPthsVweeZPqx6',
   5),

  (3, '16:00', '17:00', 1.0,
   'OC Tools & Supply Chain',
   'Discover the tools that make OC life easier! Learn Intercom (how to communicate with merchants and internal teams), Aircall (phone system for merchant calls), and our supply chain process (how hardware orders flow from request to delivery). Understanding these tools means you can coordinate merchant onboarding smoothly and answer "where''s my equipment?" questions confidently.',
   'Self-Study',
   'https://storehub.sg.larksuite.com/wiki/RUfHwlcveiyzoHkFwp5ltIuXgCc',
   6),

  (3, '17:00', '18:30', 1.5,
   'Day 3 Wrap-up & Day 4 Prep',
   'Reflecting on a big day! Your trainer will address any concerns from today''s assessments and learning. Get briefed on tomorrow''s exciting Buddy Session - you''ll shadow a real Onboarding Executive and see how they work. Also learn about the Menu Setup Challenge where you''ll build actual merchant menus. Come tomorrow ready to observe, ask questions, and get hands-on!',
   'Trainer-Led',
   NULL,
   7),

  -- DAY 4: Buddy Session & Menu Setup
  (4, '09:30', '12:00', 2.5,
   'Buddy Session with Onboarding Executive',
   'The highlight of your training! Spend the morning shadowing an experienced Onboarding Executive. Watch how they conduct welcome calls, set up merchants, handle questions, and solve problems in real-time. This isn''t passive observation - come with questions prepared, take detailed notes in your Buddy Checklist, and ask "why" behind every action. Your buddy will share tips that aren''t in any manual. This is where theory becomes practice.',
   'Buddy Session',
   'https://storehub.sg.larksuite.com/sheets/ZqDlseFE3hfXObt78Sql4vq8gsc',
   8),

  (4, '12:00', '13:00', 1.0,
   'Lunch Break',
   'Refuel for the afternoon challenge! Chat with your buddy over lunch if possible - informal conversations often reveal the best insights about the OC role. Think about what you observed this morning.',
   'Break',
   NULL,
   9),

  (4, '13:00', '16:00', 3.0,
   'Menu Setup Challenge',
   'Put your skills to the test with a real-world challenge! You''ll receive actual merchant menu requests from Intercom tickets. Your mission: set up at least 40 products for an F&B business AND 40 products for a Retail business in your BackOffice account. This simulates what you''ll do daily as an OC. Pay attention to categories, modifiers, pricing, and images. Quality matters - your buddy will review your work. Pro tip: Check similar existing setups for reference on structure.',
   'Self-Work',
   'https://app.intercom.com/a/inbox/v2axofpf/inbox/conversation/189972000831621?view=List',
   10),

  (4, '16:00', '17:00', 1.0,
   'Menu Review & Feedback',
   'Moment of truth! Share your BackOffice access with your buddy and walk them through your menu setup. They''ll evaluate your organization, accuracy, and attention to detail. Receive constructive feedback on what you did well and where to improve. Don''t take corrections personally - every OC makes mistakes early on. The goal is learning, not perfection.',
   'Buddy Session',
   NULL,
   11),

  (4, '17:00', '18:30', 1.5,
   'Graduation & Handover',
   'Congratulations - you''ve completed your OC training! 🎓 This final session includes: reviewing your overall performance, discussing your strengths and growth areas, meeting your team lead, and understanding your first week''s assignments. You''ll receive your official onboarding schedule and learn who to contact for support. Welcome to the Onboarding team - merchants are waiting for your help!',
   'Graduation',
   NULL,
   12)

) AS data(day, start_time, end_time, duration_hours, topic, details, type, resource_url, sort_order)
WHERE training_roles.short_code = 'OC';

-- Verify the insert
SELECT
  tm.day,
  tm.start_time,
  tm.topic,
  LEFT(tm.details, 80) as description_preview,
  tm.resource_url IS NOT NULL as has_resource
FROM training_modules tm
JOIN training_roles tr ON tm.role_id = tr.id
WHERE tr.short_code = 'OC' OR tm.is_common = true
ORDER BY tm.day, tm.sort_order;
