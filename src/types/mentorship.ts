export type MentorshipRole = "mentor" | "mentee";
export type RequestStatus = "pending" | "accepted" | "declined" | "ended";

export const PM_SKILLS = [
  "Strategy",
  "Execution",
  "Stakeholder Management",
  "Career Growth",
  "Technical PM",
  "Data & Analytics",
  "UX/Product Design",
  "Interviewing",
] as const;

export type PMSkill = (typeof PM_SKILLS)[number];

export interface MentorshipProfile {
  id: string;
  user_id: string;
  full_name?: string | null;
  current_position: string;
  linkedin_profile: string;
  specialization: string;
  looking_for?: string;
  profile_picture_url?: string | null;
  mentorship_role?: MentorshipRole | null;
  mentorship_active?: boolean;
  mentorship_goals?: string | null;
  experience_years?: number | null;
  mentor_capacity?: number | null;
  mentorship_dismissed_at?: string | null;
}

export interface MentorshipRequest {
  id: string;
  mentee_id: string;
  mentor_id: string;
  status: RequestStatus;
  message?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MentorWithScore extends MentorshipProfile {
  score: number;
  activeMatchCount: number;
}
