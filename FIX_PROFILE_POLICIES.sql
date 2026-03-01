-- Fix Profile Policies for PM Hive
-- Run this in your Supabase SQL Editor

-- 1. First, let's check what policies exist
SELECT policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'profiles' 
AND schemaname = 'public';

-- 2. Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON profiles;

-- 3. Create simple, permissive policies for testing
-- Allow authenticated users to read all profiles
CREATE POLICY "Enable read access for all users" ON profiles
  FOR SELECT USING (true);

-- Allow authenticated users to insert their own profile
CREATE POLICY "Enable insert for authenticated users only" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update their own profile
CREATE POLICY "Enable update for users based on user_id" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow authenticated users to delete their own profile
CREATE POLICY "Enable delete for users based on user_id" ON profiles
  FOR DELETE USING (auth.uid() = user_id);

-- 4. Verify the policies were created
SELECT policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'profiles' 
AND schemaname = 'public';

-- 5. Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles' 
AND schemaname = 'public';

-- 6. Enable RLS if it's not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 7. Test: Check if there are any existing profiles
SELECT COUNT(*) as total_profiles FROM profiles;

-- 8. Test: Show recent profiles
SELECT id, user_id, current_position, created_at, updated_at
FROM profiles 
ORDER BY created_at DESC 
LIMIT 5; 