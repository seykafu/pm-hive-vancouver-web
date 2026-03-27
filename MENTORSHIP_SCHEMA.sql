-- ============================================================
-- PM Hive Mentorship Schema Migration
-- Run this in your Supabase SQL Editor AFTER SETUP_COMPLETE_DATABASE.sql
-- ============================================================

-- 1. Extend profiles table with mentorship fields
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS mentorship_role TEXT CHECK (mentorship_role IN ('mentor', 'mentee')),
  ADD COLUMN IF NOT EXISTS mentorship_active BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS mentorship_goals TEXT,
  ADD COLUMN IF NOT EXISTS experience_years INTEGER,
  ADD COLUMN IF NOT EXISTS mentor_capacity INTEGER DEFAULT 2,
  ADD COLUMN IF NOT EXISTS mentorship_dismissed_at TIMESTAMP WITH TIME ZONE;

-- 2. Indexes for query performance
CREATE INDEX IF NOT EXISTS idx_profiles_mentorship_role ON profiles(mentorship_role);
CREATE INDEX IF NOT EXISTS idx_profiles_mentorship_active ON profiles(mentorship_active);

-- 3. Mentorship requests table
CREATE TABLE IF NOT EXISTS mentorship_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mentee_id UUID NOT NULL,
  mentor_id UUID NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined', 'ended')) NOT NULL DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_mentee FOREIGN KEY (mentee_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_mentor FOREIGN KEY (mentor_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 4. Index for request lookups
CREATE INDEX IF NOT EXISTS idx_mentorship_requests_mentee ON mentorship_requests(mentee_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_requests_mentor ON mentorship_requests(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_requests_status ON mentorship_requests(status);

-- 5. Enable RLS on mentorship_requests
ALTER TABLE mentorship_requests ENABLE ROW LEVEL SECURITY;

-- 6. RLS policies for mentorship_requests
DROP POLICY IF EXISTS "Users can view their own requests" ON mentorship_requests;
DROP POLICY IF EXISTS "Mentees can create requests" ON mentorship_requests;
DROP POLICY IF EXISTS "Parties can update requests" ON mentorship_requests;

CREATE POLICY "Users can view their own requests" ON mentorship_requests
  FOR SELECT USING (auth.uid() = mentee_id OR auth.uid() = mentor_id);

CREATE POLICY "Mentees can create requests" ON mentorship_requests
  FOR INSERT WITH CHECK (auth.uid() = mentee_id);

CREATE POLICY "Parties can update requests" ON mentorship_requests
  FOR UPDATE USING (auth.uid() = mentee_id OR auth.uid() = mentor_id);

-- 7. Auto-update updated_at on mentorship_requests
CREATE OR REPLACE FUNCTION update_mentorship_request_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_mentorship_request_updated_at ON mentorship_requests;
CREATE TRIGGER trigger_mentorship_request_updated_at
  BEFORE UPDATE ON mentorship_requests
  FOR EACH ROW EXECUTE FUNCTION update_mentorship_request_timestamp();

-- 8. Server-side RPC: get_mentorship_matches
-- Returns all active mentors for a given mentee (scoring happens client-side)
CREATE OR REPLACE FUNCTION get_mentorship_matches(p_mentee_user_id UUID)
RETURNS TABLE (
  user_id UUID,
  full_name TEXT,
  current_position TEXT,
  linkedin_profile TEXT,
  specialization TEXT,
  mentorship_goals TEXT,
  experience_years INTEGER,
  mentor_capacity INTEGER,
  mentorship_active BOOLEAN,
  profile_picture_url TEXT,
  active_match_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.user_id,
    p.full_name,
    p.current_position,
    p.linkedin_profile,
    p.specialization,
    p.mentorship_goals,
    p.experience_years,
    p.mentor_capacity,
    p.mentorship_active,
    p.profile_picture_url,
    COUNT(mr.id) FILTER (WHERE mr.status = 'accepted') AS active_match_count
  FROM profiles p
  LEFT JOIN mentorship_requests mr ON mr.mentor_id = p.user_id
  WHERE p.mentorship_role = 'mentor'
    AND p.user_id != p_mentee_user_id
  GROUP BY
    p.user_id, p.full_name, p.current_position, p.linkedin_profile,
    p.specialization, p.mentorship_goals, p.experience_years,
    p.mentor_capacity, p.mentorship_active, p.profile_picture_url
  ORDER BY p.mentorship_active DESC, p.created_at ASC;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_mentorship_matches(UUID) TO authenticated;

-- 9. Verify
SELECT 'Mentorship columns on profiles:' AS info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' AND table_schema = 'public'
  AND column_name IN (
    'full_name', 'mentorship_role', 'mentorship_active',
    'mentorship_goals', 'experience_years', 'mentor_capacity', 'mentorship_dismissed_at'
  )
ORDER BY ordinal_position;

SELECT 'mentorship_requests table created:' AS info;
SELECT COUNT(*) FROM mentorship_requests;
