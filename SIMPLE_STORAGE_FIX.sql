-- Simple Storage Fix for PM Hive
-- Run these commands in your Supabase SQL Editor

-- 1. Create storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Drop ALL existing storage policies
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can view all avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own avatars" ON storage.objects;

-- 3. Create very simple policies (allowing all authenticated users)
CREATE POLICY "Allow all authenticated uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Allow all authenticated reads" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Allow all authenticated updates" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars');

CREATE POLICY "Allow all authenticated deletes" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars');

-- 4. Verify
SELECT * FROM storage.buckets WHERE id = 'avatars';
SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage'; 