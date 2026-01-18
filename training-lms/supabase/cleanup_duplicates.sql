-- =====================================================
-- CLEANUP: Remove duplicate OC modules
-- Run this in Supabase SQL Editor FIRST
-- =====================================================

-- Step 1: Delete ALL OC-specific modules (Days 3-4)
DELETE FROM training_modules
WHERE role_id = (SELECT id FROM training_roles WHERE short_code = 'OC')
AND is_common = false;

-- Step 2: Verify cleanup - should show only common modules for OC
SELECT
  tm.day,
  tm.topic,
  tm.is_common,
  COUNT(*) as count
FROM training_modules tm
JOIN training_roles tr ON tm.role_id = tr.id
WHERE tr.short_code = 'OC' OR tm.is_common = true
GROUP BY tm.day, tm.topic, tm.is_common
HAVING COUNT(*) > 1
ORDER BY tm.day;

-- If the above returns no rows, duplicates are cleaned up!
