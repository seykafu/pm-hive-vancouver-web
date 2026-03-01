# PM Hive Authentication Setup Guide

This guide will help you set up the authentication system for PM Hive using Supabase.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. Node.js and npm installed on your system

## Supabase Setup

### 1. Create a New Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `pm-hive-vancouver`
   - Database Password: Choose a strong password
   - Region: Select the closest region to Vancouver
5. Click "Create new project"

### 2. Get Your Project Credentials

1. In your Supabase dashboard, go to Settings > API
2. Copy the following values:
   - Project URL
   - Anon public key

### 3. Set Up Environment Variables

Create a `.env` file in the root of your project with the following content:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace the placeholder values with your actual Supabase credentials.

### 4. Create the Database Schema

Run the following SQL in your Supabase SQL Editor (Database > SQL Editor):

```sql
-- Create profiles table
CREATE TABLE profiles (
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

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Create storage bucket for profile pictures
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Create storage policies
CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view all avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- You can add additional logic here if needed
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### 5. Configure Authentication Settings

1. Go to Authentication > Settings in your Supabase dashboard
2. Configure the following:
   - **Site URL**: Set to your development URL (e.g., `http://localhost:5173`)
   - **Redirect URLs**: Add your development and production URLs
   - **Email Templates**: Customize the email templates if desired

### 6. Enable Email Confirmation (Optional)

1. Go to Authentication > Settings > Email Templates
2. Customize the confirmation email template
3. Enable "Confirm email" in Authentication > Settings > Auth Providers > Email

## Features Implemented

### Authentication
- ✅ User registration with email/password
- ✅ User login/logout
- ✅ Persistent sessions (users stay logged in after refresh)
- ✅ Email verification (optional)

### Profile Management
- ✅ Profile creation during signup
- ✅ Profile editing
- ✅ Profile picture upload
- ✅ Current position, LinkedIn profile, specialization, and goals

### Access Control
- ✅ Resources page only accessible to logged-in users
- ✅ Profile page only accessible to logged-in users
- ✅ Navigation updates based on authentication status

### UI/UX
- ✅ Responsive design matching PM Hive's branding
- ✅ Toast notifications for user feedback
- ✅ Form validation with Zod
- ✅ Loading states
- ✅ Error handling

## Usage

### For Users
1. Visit the website
2. Click "Sign Up" to create an account
3. Complete the profile setup
4. Access the Resources page (only available to logged-in users)
5. Edit profile anytime from the user dropdown

### For Developers
1. Set up environment variables
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start the development server
4. The authentication system will be fully functional

## Security Features

- Row Level Security (RLS) enabled on all tables
- User can only access their own profile data
- Secure file upload with size and type validation
- Environment variables for sensitive configuration
- CSRF protection through Supabase
- Secure session management

## Troubleshooting

### Common Issues

1. **Environment variables not loading**: Make sure your `.env` file is in the root directory and starts with `VITE_`
2. **Database connection errors**: Verify your Supabase URL and anon key are correct
3. **File upload failures**: Check that the storage bucket is created and policies are set up correctly
4. **Authentication not working**: Ensure your site URL and redirect URLs are configured in Supabase

### Getting Help

If you encounter issues:
1. Check the browser console for error messages
2. Verify your Supabase configuration
3. Check the Supabase dashboard logs
4. Ensure all SQL commands were executed successfully

## Next Steps

Consider implementing these additional features:
- Password reset functionality
- Social authentication (Google, GitHub)
- Email notifications for profile updates
- Admin panel for managing users
- Activity logging
- User search and discovery 