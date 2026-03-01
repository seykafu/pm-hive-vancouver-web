-- Fix Storage Policies for PM Hive
-- Run this in your Supabase SQL Editor

-- 1. First, check if the avatars bucket exists
SELECT * FROM storage.buckets WHERE id = 'avatars';

-- 2. Create the avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Drop ALL existing storage policies to start fresh
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can view all avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow all authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow all authenticated reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow all authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow all authenticated deletes" ON storage.objects;

-- 4. Create very simple, permissive storage policies
-- Allow all authenticated users to upload to avatars bucket
CREATE POLICY "Allow all authenticated uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Allow all authenticated users to read from avatars bucket
CREATE POLICY "Allow all authenticated reads" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Allow all authenticated users to update in avatars bucket
CREATE POLICY "Allow all authenticated updates" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Allow all authenticated users to delete from avatars bucket
CREATE POLICY "Allow all authenticated deletes" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- 5. Verify the storage policies were created
SELECT policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';

-- 6. Check the bucket configuration
SELECT * FROM storage.buckets WHERE id = 'avatars';

-- 7. Test: Check if there are any existing files in the bucket
SELECT COUNT(*) as total_files FROM storage.objects WHERE bucket_id = 'avatars'; 