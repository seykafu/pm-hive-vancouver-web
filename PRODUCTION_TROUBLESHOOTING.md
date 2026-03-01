# Production Troubleshooting Guide

## Issue 1: 404 Errors on Page Refresh

### Problem
When you refresh a page like `/profile` or `/resources`, you get a 404 error.

### Solution
This is a common SPA (Single Page Application) routing issue. The server doesn't know how to handle client-side routes.

#### For Netlify:
- The `public/_redirects` file has been created
- This tells Netlify to serve `index.html` for all routes

#### For Vercel:
- The `public/vercel.json` file has been created
- This tells Vercel to rewrite all routes to `index.html`

#### For other hosting providers:
You may need to configure your hosting provider to handle SPA routing. Common solutions:
- Apache: Create `.htaccess` file
- Nginx: Configure try_files directive
- AWS S3: Configure error page to redirect to index.html

## Issue 2: Profile Information Not Saving

### Problem
Profile updates don't persist and you get errors when trying to save.

### Debugging Steps

1. **Check Environment Variables**
   - Open browser console (F12)
   - Look for the "Environment variables check" logs
   - Ensure both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` show "Present"

2. **Check Supabase Configuration**
   - Verify your Supabase project is active
   - Check that the database is online
   - Ensure your API keys are correct

3. **Check Database Permissions**
   - Go to your Supabase dashboard
   - Navigate to Database → Policies
   - Ensure the `profiles` table has the correct RLS policies:
     - Users can view their own profile
     - Users can insert their own profile
     - Users can update their own profile

4. **Check Console Errors**
   - Look for any error messages in the browser console
   - The enhanced logging will show:
     - User ID being used
     - Profile data being sent
     - Any database errors

### Common Solutions

1. **Environment Variables Not Set**
   ```bash
   # Make sure these are set in your hosting environment
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. **Database Policies Missing**
   Run this SQL in your Supabase SQL Editor:
   ```sql
   -- Enable RLS if not already enabled
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
   
   -- Create policies if they don't exist
   CREATE POLICY "Users can view their own profile" ON profiles
     FOR SELECT USING (auth.uid() = user_id);
   
   CREATE POLICY "Users can insert their own profile" ON profiles
     FOR INSERT WITH CHECK (auth.uid() = user_id);
   
   CREATE POLICY "Users can update their own profile" ON profiles
     FOR UPDATE USING (auth.uid() = user_id);
   ```

3. **Authentication Issues**
   - Ensure users are properly authenticated
   - Check that the session is valid
   - Verify the user ID is being passed correctly

## Issue 3: Image Upload Not Working

### Problem
Profile picture uploads fail in production.

### Debugging Steps

1. **Check Storage Bucket**
   - Go to Supabase → Storage
   - Ensure the "avatars" bucket exists
   - Check that it's public

2. **Check Storage Policies**
   - Go to Storage → avars → Policies
   - Ensure these policies exist:
     - Users can upload their own avatar
     - Users can view all avatars
     - Users can update their own avatar
     - Users can delete their own avatar

3. **Check Console Logs**
   - The enhanced logging will show:
     - File details (name, size, type)
     - Upload path
     - Any upload errors

### Common Solutions

1. **Storage Bucket Missing**
   ```sql
   INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
   ```

2. **Storage Policies Missing**
   ```sql
   CREATE POLICY "Users can upload their own avatar" ON storage.objects
     FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
   
   CREATE POLICY "Users can view all avatars" ON storage.objects
     FOR SELECT USING (bucket_id = 'avatars');
   
   CREATE POLICY "Users can update their own avatar" ON storage.objects
     FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
   
   CREATE POLICY "Users can delete their own avatar" ON storage.objects
     FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
   ```

## Testing in Production

1. **Open Browser Console**
   - Press F12 to open developer tools
   - Go to Console tab
   - Look for any error messages

2. **Test Authentication**
   - Try signing up with a new account
   - Try signing in with an existing account
   - Check if the session persists after refresh

3. **Test Profile Updates**
   - Try updating profile information
   - Check console logs for any errors
   - Verify changes persist after refresh

4. **Test Image Upload**
   - Try uploading a profile picture
   - Check console logs for upload progress
   - Verify the image appears after upload

## Getting Help

If you're still experiencing issues:

1. **Check the console logs** - they now provide detailed information
2. **Verify your Supabase setup** - ensure all tables and policies are created
3. **Check your hosting environment variables** - ensure they're properly set
4. **Test with a fresh deployment** - sometimes caching can cause issues

## Environment Variables Checklist

Make sure these are set in your production environment:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

You can verify this by checking the console logs when the app loads. 