-- =====================================================
-- UPDATE: Set resource_url for Day 1 & Day 2 slides
-- Uploaded to Google Drive on Apr 13, 2026
-- Run AFTER update_day1_day2_modules.sql
-- =====================================================

-- Day 1: All modules → [Day 1] What & Why slides
UPDATE training_modules
SET resource_url = 'https://drive.google.com/file/d/1pCKEaBznFT7pXPBJP0IyUzmqSqQuCkBj/view?usp=sharing'
WHERE is_common = true
  AND day = 1
  AND role_id = (SELECT id FROM training_roles WHERE short_code = 'ALL');

-- Day 2: All modules → [Day 2] The How slides (except Lunch Break)
UPDATE training_modules
SET resource_url = 'https://drive.google.com/file/d/11KkY3ka235RrXmlT7G4I_SUyhOMoA5zy/view?usp=sharing'
WHERE is_common = true
  AND day = 2
  AND type != 'Break'
  AND role_id = (SELECT id FROM training_roles WHERE short_code = 'ALL');

-- VERIFY
SELECT day, sort_order, topic, type, resource_url
FROM training_modules tm
JOIN training_roles tr ON tm.role_id = tr.id
WHERE tr.short_code = 'ALL' AND tm.is_common = true
ORDER BY day, sort_order;
