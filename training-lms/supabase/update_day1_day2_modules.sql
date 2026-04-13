-- =====================================================
-- MIGRATION: Update Day 1 & Day 2 Common Modules
-- Based on: [Blueprint] New Agenda CSV + Day 1/Day 2 PPTX slides
-- Run in Supabase SQL Editor
-- =====================================================
-- NOTE: Times from slides (Day 1 Slide 3 overview) used as authoritative source.
-- CSV had a 15-min overlap between Module A/B — corrected here.
-- =====================================================

-- STEP 1: Remove old Day 1-2 common modules
-- (trainee_progress entries cascade delete — OK for fresh start)
DELETE FROM training_modules
WHERE is_common = true
  AND role_id = (SELECT id FROM training_roles WHERE short_code = 'ALL');

-- STEP 2: Insert new Day 1-2 common modules
INSERT INTO training_modules (role_id, day, start_time, end_time, duration_hours, topic, details, type, resource_url, is_common, sort_order)
SELECT
  r.id,
  d.day,
  d.start_time,
  d.end_time,
  d.duration_hours,
  d.topic,
  d.details,
  d.type,
  d.resource_url,
  true,
  d.sort_order
FROM training_roles r,
(VALUES

  -- ===========================
  -- DAY 1: What & Why
  -- ===========================

  -- 1. Training Briefing
  (1, '14:00', '14:30', 0.5,
  'Training Briefing',
  'Welcome to StoreHub training. Andrea introduces the week structure:
• Day 1: What & Why (self-study foundation)
• Day 2: How (hands-on BackOffice + POS)
• Day 3: Fork — Sales track (pitching, SPIN, closing) or Success track (troubleshooting, tools)
• Day 4+: Role-specific coaching

You will receive your Learning Hub access and BackOffice login credentials today. Make sure your MacBook and iPad are ready.',
  'Trainer-Led',
  NULL,
  1),

  -- 2. Module A: Welcome to StoreHub
  (1, '14:30', '15:00', 0.5,
  'Module A: Welcome to StoreHub',
  'StoreHub at a glance — who we are, what we build, and why it matters.

19,000+ merchants served across Malaysia, Philippines & Thailand. One unified cloud platform: POS, BackOffice, Payments, Online Ordering, Loyalty.

You will learn:
• The StoreHub ecosystem (what each part does)
• How StoreHub helps merchants run, sell, grow, and manage
• Where YOU fit — your role''s touchpoint in the merchant lifecycle (role journey map)

🎬 Watch: "StoreHub in 90 Seconds" explainer video.

Ends with a 3-question Pulse Check.
---SUCCESS_CRITERIA---
1. Can explain what StoreHub does in 1 sentence
2. Can name all 4 parts of the ecosystem (POS, BackOffice, Online, Loyalty)
3. Can identify where your role fits in the merchant journey',
  'Self-Study',
  NULL,
  2),

  -- 3. Module B: Software & Plans
  (1, '15:00', '15:45', 0.75,
  'Module B: Software & Plans',
  'StoreHub''s three plans and how to match them to merchants.

You will learn:
• Plans: Starter vs Advanced vs Pro — who each is for, key differences, starting price
• Licenses: Store License vs Register License (visual diagram with examples)
• Industry matching: F&B / Retail / Services — which plan fits which merchant
• Add-on services overview

🎮 Last 10 minutes — Merchant Matching Activity: 3 merchant scenarios, "which plan would you recommend?"

Ends with a 4-question Pulse Check.
---SUCCESS_CRITERIA---
1. Can name the 3 plans and their key differentiator
2. Can distinguish a Store License from a Register License
3. Can match a merchant type to the correct plan in under 30 seconds',
  'Self-Study',
  NULL,
  3),

  -- 4. Module C: Hardware Essentials
  (1, '15:45', '16:15', 0.5,
  'Module C: Hardware Essentials',
  'Every device in the StoreHub hardware ecosystem and how they connect.

You will learn:
• Core devices: iMin Falcon 1, Sunmi D3 Pro, Sunmi D3 Mini, iPad — physical look + key differentiator
• Supplementary: Receipt printer, barcode scanner, cash drawer
• Enhancements: KDS/Swan 1K, Kiosk, Mi TV Stick, NexGo N5
• How It All Connects — basic network concept, F&B vs Retail setup diagrams

🎬 Watch: POS Terminal Showcase video.

Ends with a 4-question Pulse Check.
---SUCCESS_CRITERIA---
1. Can identify each POS terminal by sight
2. Can explain the difference between core and supplementary devices
3. Can describe how a basic F&B setup connects (terminal → printer → network)',
  'Self-Study',
  NULL,
  4),

  -- 5. Module D: Core Features Overview
  (1, '16:15', '17:15', 1.0,
  'Module D: Core Features Overview',
  'The full StoreHub feature ecosystem — WHAT each feature does and WHY merchants use it (not HOW to configure yet).

Feature Ecosystem Map — 7 zones:
• Cloud POS & BackOffice — the core
• QR Order & Pay (Static vs Dynamic QR)
• Beep Delivery (SHALP vs Self-Delivery)
• Webstore & Marketplace Integration
• Loyalty: Membership & Engage campaigns
• Kitchen Display System (KDS) & NCS
• E-Invoice, Payment Terminal

Feature × Plan matrix — which features come with which plan.

🎬 Video markers: QR Order & Pay, Beep Delivery, Membership + Engage.

Ends with a 4-question Pulse Check.
---SUCCESS_CRITERIA---
1. Can name all 7 feature zones from memory
2. Can explain WHAT QR Order & Pay does and WHY a merchant would use it
3. Can correctly fill in the Feature × Plan matrix for 3 key features
4. Can distinguish Static vs Dynamic QR without notes',
  'Self-Study',
  NULL,
  5),

  -- 6. Module E: Merchant Profiles
  (1, '17:15', '17:30', 0.25,
  'Module E: Merchant Profiles',
  'The 3-layer merchant matching framework — how to identify what a merchant needs before recommending anything.

Framework layers:
1. Business Type (F&B, Retail, Services)
2. Pain Points (what problem are they trying to solve?)
3. Scale (number of outlets, transaction volume)

Two example merchant profile cards:
• Quick-Service Cafe (F&B, growth-stage, Beep Delivery needed)
• Multi-outlet Retail Shop (Retail, stock management priority)

This is the lens you will use in your role every day.
---SUCCESS_CRITERIA---
1. Can walk through the 3-layer framework for any merchant scenario
2. Can build a basic merchant profile from a 2-sentence description',
  'Self-Study',
  NULL,
  6),

  -- 7. Day 1 Recap Pop Quiz + BackOffice Exploration
  (1, '17:30', '18:15', 0.75,
  'Day 1 Recap Pop Quiz + BackOffice Exploration',
  'Two-part session to test what you learned and get your first hands-on system time.

Part 1 — Pop Quiz (first 30 min):
12–15 questions covering Modules A–E. Submitted via Google Form + Learning Hub. Self-check with immediate results shown.

Part 2 — BackOffice Exploration (last 15 min):
Log into BackOffice with your credentials. Find these 5 things:
1. Where to add a new product
2. Where to see today''s sales
3. Where to set store opening hours
4. Where to find payment settings
5. Where to add an employee

This is your first hands-on interaction with the system — explore freely.
---SUCCESS_CRITERIA---
1. Quiz submitted before end of session
2. All 5 BackOffice items located and noted',
  'Assessment',
  NULL,
  7),

  -- 8. Homework Assignment
  (1, '18:15', '18:30', 0.25,
  'Homework Assignment',
  'Must complete before Day 2 (9:30 AM tomorrow). Videos will be provided to guide each step.

BackOffice Configuration Checklist:
☐ General Settings: business name, country, currency, timezone, default tax (SST 8%), enable rounding, smallest currency, closing time (12 AM), display price
☐ Store Management: store name, address, company name, BRN, cashier access control
☐ Payment Options: Maybank QR / DuitNow
☐ Receipt Template + logo
☐ Bank Account (payouts)
☐ F&B Tab: review Service Charge, Takeaway, Kitchen Stations (read only, do not change)
☐ Add Employees (add Trainer)
☐ Add 1 product per pricing type + inventory tracking type
☐ Add products with modifier and variant
☐ Review pop quiz results — note what you got wrong
☐ Write 3 questions to ask tomorrow

All configuration must be done before 9:30 AM Day 2.',
  'Self-Work',
  NULL,
  8),

  -- ===========================
  -- DAY 2: The How
  -- ===========================

  -- 9. Day 1 Q&A & Homework Recap
  (2, '09:30', '10:00', 0.5,
  'Day 1 Q&A & BackOffice Homework Recap',
  'Open debrief to address questions from Day 1 and homework.

Trainer reviews:
• Top 3–5 questions submitted overnight
• Quick-fire review of most-missed pop quiz topics (trainer checks Form results beforehand)
• "Who had trouble with any homework steps?"

Come prepared with your 3 written questions from homework.',
  'Trainer-Led',
  NULL,
  9),

  -- 10. POS Layout & POS Register
  (2, '10:00', '10:30', 0.5,
  'POS Layout & POS Register',
  'How your products appear on the POS register screen and how to organise them.

You will configure:
• Product display on POS register
• Category organisation and display order
• Colour coding for quick navigation

Live follow-along with trainer. By end of session your POS register should reflect your BackOffice product setup.',
  'Trainer-Led',
  NULL,
  10),

  -- 11. Online Platform Setup
  (2, '10:30', '11:30', 1.0,
  'Online Platform Setup (QR Order, Beep Delivery, Webstore)',
  'All three online platforms share the same core BackOffice settings. Learn how to configure them end-to-end.

Session structure:
• Trainer-led walkthrough (30 min): end-to-end configuration shown
• Hands-on practice (30 min): you set it up independently

Platforms covered:
• QR Order & Pay — static and dynamic QR setup, menu configuration
• Beep Delivery — SHALP vs self-delivery, delivery zone settings
• Webstore — storename.storehub.me, product visibility

Test URLs to use during practice:
• QR: (storename).beepit.com/dinein
• Delivery: (storename).beepit.com/delivery
• Webstore: (storename).storehub.me',
  'Trainer-Led',
  NULL,
  11),

  -- 12. Loyalty Program
  (2, '11:30', '13:00', 1.5,
  'Loyalty Program (Membership & Engage)',
  'Full loyalty setup from adding a customer to launching your first campaign.

You will configure:
• Customer creation flow (walk-in → member)
• All ways customers can become members
• Membership settings, tiers, and rewards rules
• Engage: create and launch a campaign, target members, track responses

Session structure: Trainer demo first, then hands-on practice.

By end of this session you should have a working loyalty program with at least 1 tier and 1 campaign draft.',
  'Trainer-Led',
  NULL,
  12),

  -- 13. Lunch
  (2, '13:00', '14:00', 1.0,
  'Lunch Break',
  'Lunch break.',
  'Break',
  NULL,
  13),

  -- 14. Stock Management & Reports
  (2, '14:00', '14:30', 0.5,
  'Stock Management & Reports',
  'From adding new items to tracking movement to reconciliation.

You will learn:
• Adding stock items and setting reorder levels
• Receiving, transfers, and wastage recording
• Stock count and variance checking
• Reports walkthrough: sales vs stock movement, top-selling, slow-moving, out-of-stock

Configure your own stock setup during the session.',
  'Trainer-Led',
  NULL,
  14),

  -- 15. Hardware Setup
  (2, '14:30', '15:30', 1.0,
  'Hardware — Device Introduction & Basic Configuration',
  'Physical setup and configuration of every device in the StoreHub ecosystem.

Devices covered: POS terminal, receipt printer, cash drawer, barcode scanner, router.

You will set up:
• Power, network, and device pairing
• Printer configuration (IP address, paper size, auto-print, copy format)
• Cash drawer connection
• WiFi/LAN connection and stability check
• Default devices and backup options
• Test run: sample sale → receipt print → cash drawer open

Trainer demonstrates first, then you configure your own setup.',
  'Trainer-Led',
  NULL,
  15),

  -- 16. POS App Navigation
  (2, '15:30', '16:30', 1.0,
  'POS App Navigation',
  'Full walkthrough of the POS app — everything a frontliner needs to operate a merchant''s POS.

You will learn:
• Clock in / clock out and staff login
• Create a sale: add items, apply discounts, split bills, process payments
• Access customer profiles and membership info during a transaction
• Quick settings: tax, receipt, device settings
• Tips & best practices: efficient navigation, avoiding common errors, using search

Trainer demonstrates, then you walk through each function independently.',
  'Trainer-Led',
  NULL,
  16),

  -- 17. StoreHub Manager App
  (2, '16:30', '16:45', 0.25,
  'StoreHub Manager App',
  'The mobile app merchants use to monitor their business on the go.

Key features:
• Real-time sales dashboard
• Push notifications for new orders
• Basic report viewing
• Multi-store overview

When merchants use it: checking sales after hours, monitoring during holidays, remote store management.

"Many merchants will ask about this — it is a retention tool. They feel connected to their business."

Quick live demo on trainer phone/tablet.',
  'Trainer-Led',
  NULL,
  17),

  -- 18. Foundation Quiz
  (2, '16:45', '17:30', 0.75,
  'Foundation Quiz',
  '25-question comprehensive assessment covering everything taught in Days 1–2.

Question breakdown:
• Settings & Store Setup — 3 questions
• Products (modifiers, variants, pricing types) — 5 questions
• POS Navigation (register operations, transactions) — 4 questions
• Features (purpose, plan mapping) — 4 questions
• Reports (which report answers which question) — 3 questions
• Hardware (device identification, connections, setup sequence) — 4 questions
• Merchant Profile (scenario-based) — 2 questions

Format: 15 multiple choice, 5 true/false, 3 short answer, 2 scenario-based.
Passing score: 80% (20/25).
Open-book: you may use slides, KB articles, and your BackOffice.

"Open-book because we want you to build the habit of looking things up — that is how you will work in your role."
---SUCCESS_CRITERIA---
1. Score 80% or above (20/25 questions)
2. All questions answered — no blanks',
  'Assessment',
  NULL,
  18),

  -- 19. Quiz Debrief
  (2, '17:30', '17:45', 0.25,
  'Quiz Debrief',
  'Trainer reviews the top 3–5 most-missed questions from the Foundation Quiz.

Quick re-teach for each with the correct reasoning.

"Below 80%? Here are the specific KB articles to review tonight. You are not behind — you just know exactly what to focus on."',
  'Trainer-Led',
  NULL,
  19),

  -- 20. Fork Briefing
  (2, '17:45', '18:00', 0.25,
  'Fork Briefing — Your Track from Day 3',
  'Two tracks diverge from here. Trainer reveals which track you are on.

Sales Track (blue):
Day 3–6: Pitching, SPIN methodology, closing skills, coach-led role-specific training.

Success Track (green):
Day 3: Troubleshooting deep dive.
Day 5+: Role-specific training with your assigned coach.

Visual shown on screen. No ambiguity about what happens next.',
  'Trainer-Led',
  NULL,
  20),

  -- 21. Complete BackOffice Configuration
  (2, '18:00', '18:30', 0.5,
  'Complete BackOffice Configuration',
  'Final session — all trainees must complete their full BackOffice configuration before leaving today.

Target: Every trainee has a fully configured BackOffice and can upload to POS before Day 3.

Trainer and peers available to help. Do not leave until configuration is confirmed complete.',
  'Self-Work',
  NULL,
  21)

) AS d(day, start_time, end_time, duration_hours, topic, details, type, resource_url, sort_order)
WHERE r.short_code = 'ALL';

-- =====================================================
-- VERIFICATION QUERY — Run after to confirm
-- =====================================================
-- SELECT day, start_time, end_time, topic, type, sort_order
-- FROM training_modules tm
-- JOIN training_roles tr ON tm.role_id = tr.id
-- WHERE tr.short_code = 'ALL' AND tm.is_common = true
-- ORDER BY day, sort_order;

-- =====================================================
-- TODO: Add resource_url for slide decks once hosted
-- Day 1 slides: [Day 1] What & Why (1).pptx → upload to Lark Drive or Google Drive, paste URL here
-- Day 2 slides: [Day 2] The How (2).pptx → upload to Lark Drive or Google Drive, paste URL here
-- UPDATE training_modules SET resource_url = 'YOUR_LARK_LINK_HERE'
--   WHERE topic IN ('Module A: Welcome to StoreHub', 'Module B: Software & Plans', ...) AND is_common = true;
-- =====================================================
