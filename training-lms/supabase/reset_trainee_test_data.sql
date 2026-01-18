-- =====================================================
-- RESET TRAINEE TEST DATA
-- Run this in Supabase SQL Editor before testing
-- =====================================================

-- Step 1: Set your test trainee email
-- Replace with your actual test email
DO $$
DECLARE
    test_email TEXT := 'YOUR_TEST_EMAIL@storehub.com';  -- <-- CHANGE THIS
BEGIN
    RAISE NOTICE 'Resetting data for: %', test_email;
END $$;

-- =====================================================
-- OPTION A: Reset specific trainee (recommended for testing)
-- =====================================================

-- Clear progress for specific trainee
DELETE FROM trainee_progress
WHERE trainee_email = 'YOUR_TEST_EMAIL@storehub.com';  -- <-- CHANGE THIS

-- Clear reflections for specific trainee
DELETE FROM trainee_reflections
WHERE trainee_email = 'YOUR_TEST_EMAIL@storehub.com';  -- <-- CHANGE THIS

-- Clear activity performance for specific trainee
DELETE FROM trainee_activity_performance
WHERE trainee_email = 'YOUR_TEST_EMAIL@storehub.com';  -- <-- CHANGE THIS

-- Clear schedule adjustments for specific trainee
DELETE FROM schedule_adjustments
WHERE trainee_email = 'YOUR_TEST_EMAIL@storehub.com';  -- <-- CHANGE THIS

-- Verify deletion
SELECT 'trainee_progress' as table_name, COUNT(*) as remaining
FROM trainee_progress WHERE trainee_email = 'YOUR_TEST_EMAIL@storehub.com'
UNION ALL
SELECT 'trainee_reflections', COUNT(*)
FROM trainee_reflections WHERE trainee_email = 'YOUR_TEST_EMAIL@storehub.com'
UNION ALL
SELECT 'trainee_activity_performance', COUNT(*)
FROM trainee_activity_performance WHERE trainee_email = 'YOUR_TEST_EMAIL@storehub.com'
UNION ALL
SELECT 'schedule_adjustments', COUNT(*)
FROM schedule_adjustments WHERE trainee_email = 'YOUR_TEST_EMAIL@storehub.com';

-- =====================================================
-- OPTION B: Reset ALL trainee data (use with caution!)
-- Uncomment below if you want to clear everything
-- =====================================================

-- DELETE FROM trainee_progress;
-- DELETE FROM trainee_reflections;
-- DELETE FROM trainee_activity_performance;
-- DELETE FROM schedule_adjustments;

-- =====================================================
-- BROWSER: Clear localStorage (run in browser console)
-- This clears celebration viewed and survey completed flags
-- =====================================================

-- Copy and paste this in browser DevTools Console:
/*
// Clear all celebration/certificate flags
Object.keys(localStorage).forEach(key => {
    if (key.startsWith('celebration_seen_') ||
        key.startsWith('survey_completed_') ||
        key.startsWith('reflection_')) {
        localStorage.removeItem(key);
        console.log('Removed:', key);
    }
});
console.log('localStorage cleared for testing!');
*/

-- =====================================================
-- VERIFY: Check what training data exists
-- =====================================================

-- Check available roles
SELECT code, name, total_days FROM training_roles ORDER BY code;

-- Check modules for OC role (pilot)
SELECT day_number, module_name, duration_minutes, activity_type
FROM training_modules
WHERE role_code = 'OC'
ORDER BY day_number, sort_order
LIMIT 20;

-- Check if trainee exists in profiles
SELECT id, email, full_name, role
FROM profiles
WHERE email = 'YOUR_TEST_EMAIL@storehub.com';  -- <-- CHANGE THIS
