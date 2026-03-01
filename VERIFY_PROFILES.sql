-- Verify Profiles Table and Policies
-- Run this in your Supabase SQL Editor to check the setup

-- 1. Check if profiles table exists and its structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check existing policies on profiles table
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles' 
AND schemaname = 'public';

-- 3. Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles' 
AND schemaname = 'public';

-- 4. Test a simple insert (this will help identify policy issues)
-- Note: This will only work if you're authenticated
-- INSERT INTO profiles (user_id, current_position, linkedin_profile, specialization, looking_for)
-- VALUES ('test-user-id', 'Test Position', 'https://test.com', 'Test Specialization', 'Learn')
-- ON CONFLICT (user_id) DO UPDATE SET
--   current_position = EXCLUDED.current_position,
--   linkedin_profile = EXCLUDED.linkedin_profile,
--   specialization = EXCLUDED.specialization,
--   looking_for = EXCLUDED.looking_for,
--   updated_at = NOW();

-- 5. Check for any existing profile data
SELECT COUNT(*) as total_profiles FROM profiles;

-- 6. Check the most recent profiles
SELECT 
  id,
  user_id,
  current_position,
  created_at,
  updated_at
FROM profiles 
ORDER BY created_at DESC 
LIMIT 5; 