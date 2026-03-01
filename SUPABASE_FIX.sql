-- PM Hive Supabase Database Fix
-- Run these commands in your Supabase SQL Editor

-- 1. First, check if the profiles table exists and has RLS enabled
SELECT 
    schemaname, 
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';

-- 2. Enable RLS on the profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. Check existing policies
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual 
FROM pg_policies 
WHERE tablename = 'profiles';

-- 4. Drop existing policies if they exist (to recreate them properly)
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;

-- 5. Create new policies with proper permissions
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile" ON profiles
  FOR DELETE USING (auth.uid() = user_id);

-- 6. Verify the policies were created
SELECT 
    policyname, 
    cmd, 
    qual 
FROM pg_policies 
WHERE tablename = 'profiles';

-- 7. Test the policies with a simple query
-- This should return the current user's profile if they exist
SELECT * FROM profiles WHERE user_id = auth.uid();

-- 8. If you need to create the profiles table (in case it doesn't exist)
-- Uncomment and run this if the table doesn't exist:

/*
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  current_position TEXT NOT NULL,
  linkedin_profile TEXT NOT NULL,
  specialization TEXT NOT NULL,
  looking_for TEXT CHECK (looking_for IN ('Mentorship', 'Help Mentor', 'Learn')) NOT NULL,
  profile_picture_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
*/ 