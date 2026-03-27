/**
 * Mentorship service — matching algorithm + Supabase data layer.
 *
 * The matching algorithm runs client-side on data fetched from Supabase.
 * The underlying data query (`get_mentorship_matches` RPC) is server-side,
 * so filtering by role and auth checks happen in PostgreSQL.
 */
import { supabase } from "./supabase";
import type {
  MentorshipProfile,
  MentorWithScore,
  MentorshipRequest,
} from "../types/mentorship";

// ── Matching algorithm ──────────────────────────────────────────────────────

const STOPWORDS = new Set([
  "i","me","my","we","our","you","your","he","she","they","it","the","a","an",
  "and","or","but","in","on","at","to","for","of","with","by","from","is","are",
  "was","were","be","been","have","has","had","do","does","did","will","would",
  "could","should","may","might","want","like","get","more","can","am","not",
  "this","that","as","into","about","how","what","when","who","which","also",
  "so","than","then","just","up","out","its","their","help","work","looking",
]);

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOPWORDS.has(w))
  );
}

function jaccardOverlap(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let intersection = 0;
  for (const word of a) {
    if (b.has(word)) intersection++;
  }
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : intersection / union;
}

function scoreExperienceDelta(
  menteeYears: number | null | undefined,
  mentorYears: number | null | undefined
): number {
  if (menteeYears == null || mentorYears == null) return 0.5; // neutral if unknown
  const delta = mentorYears - menteeYears;
  if (delta >= 3 && delta <= 7) return 1.0;
  if ((delta >= 1 && delta < 3) || (delta > 7 && delta <= 10)) return 0.5;
  return 0.0;
}

export function scoreMentorMentee(
  mentee: MentorshipProfile,
  mentor: MentorshipProfile,
  mentorActiveMatchCount: number
): number {
  // 1. Specialization overlap — 40%
  const specScore = jaccardOverlap(
    tokenize(mentee.specialization || ""),
    tokenize(mentor.specialization || "")
  );

  // 2. Experience delta — 30%
  const expScore = scoreExperienceDelta(
    mentee.experience_years,
    mentor.experience_years
  );

  // 3. Goals alignment — 20%
  const goalsScore = jaccardOverlap(
    tokenize(mentee.mentorship_goals || ""),
    tokenize(mentor.mentorship_goals || "")
  );

  // 4. Availability — 10%
  const capacity = mentor.mentor_capacity ?? 2;
  const available =
    mentor.mentorship_active === true && mentorActiveMatchCount < capacity;
  const availScore = available ? 1.0 : 0.0;

  return specScore * 0.4 + expScore * 0.3 + goalsScore * 0.2 + availScore * 0.1;
}

// ── Data fetching ───────────────────────────────────────────────────────────

/**
 * GET /api/mentorship/matches equivalent.
 * Calls the `get_mentorship_matches` RPC (server-side SQL),
 * then scores and ranks results client-side.
 */
export async function getMatchesForMentee(
  mentee: MentorshipProfile,
  limit = 5
): Promise<{ data: MentorWithScore[]; error: unknown }> {
  const { data: mentors, error } = await (supabase as any).rpc(
    "get_mentorship_matches",
    { p_mentee_user_id: mentee.user_id }
  );

  if (error) return { data: [], error };
  if (!mentors || mentors.length === 0) return { data: [], error: null };

  const scored: MentorWithScore[] = (mentors as any[]).map((m) => ({
    ...m,
    activeMatchCount: Number(m.active_match_count ?? 0),
    score: scoreMentorMentee(mentee, m, Number(m.active_match_count ?? 0)),
  }));

  scored.sort((a, b) => b.score - a.score);
  return { data: scored.slice(0, limit), error: null };
}

export async function getMentorDirectory(): Promise<{
  data: MentorshipProfile[];
  error: unknown;
}> {
  const { data, error } = await (supabase as any)
    .from("profiles")
    .select("*")
    .eq("mentorship_role", "mentor")
    .order("mentorship_active", { ascending: false });
  return { data: data ?? [], error };
}

export async function getAllOptedInProfiles(): Promise<{
  data: MentorshipProfile[];
  error: unknown;
}> {
  const { data, error } = await (supabase as any)
    .from("profiles")
    .select("*")
    .not("mentorship_role", "is", null)
    .order("mentorship_active", { ascending: false });
  return { data: data ?? [], error };
}

// ── Requests ────────────────────────────────────────────────────────────────

export async function sendMatchRequest(
  menteeId: string,
  mentorId: string
): Promise<{ data: MentorshipRequest | null; error: unknown }> {
  const { data, error } = await (supabase as any)
    .from("mentorship_requests")
    .insert({ mentee_id: menteeId, mentor_id: mentorId, status: "pending" })
    .select()
    .single();
  return { data, error };
}

export async function acceptMatchRequest(
  requestId: string
): Promise<{ error: unknown }> {
  const { error } = await (supabase as any)
    .from("mentorship_requests")
    .update({ status: "accepted" })
    .eq("id", requestId);
  return { error };
}

export async function declineMatchRequest(
  requestId: string
): Promise<{ error: unknown }> {
  const { error } = await (supabase as any)
    .from("mentorship_requests")
    .update({ status: "declined" })
    .eq("id", requestId);
  return { error };
}

export async function endMatch(
  requestId: string
): Promise<{ error: unknown }> {
  const { error } = await (supabase as any)
    .from("mentorship_requests")
    .update({ status: "ended" })
    .eq("id", requestId);
  return { error };
}

export async function getUserRequests(userId: string): Promise<{
  incoming: MentorshipRequest[];
  outgoing: MentorshipRequest[];
  active: MentorshipRequest[];
  error: unknown;
}> {
  const { data, error } = await (supabase as any)
    .from("mentorship_requests")
    .select("*")
    .or(`mentee_id.eq.${userId},mentor_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error) return { incoming: [], outgoing: [], active: [], error };

  const requests = (data ?? []) as MentorshipRequest[];
  const incoming = requests.filter(
    (r) => r.mentor_id === userId && r.status === "pending"
  );
  const outgoing = requests.filter(
    (r) =>
      r.mentee_id === userId && ["pending", "declined"].includes(r.status)
  );
  const active = requests.filter((r) => r.status === "accepted");

  return { incoming, outgoing, active, error: null };
}

/** Fetch the profiles for a list of user IDs */
export async function getProfilesByUserIds(
  userIds: string[]
): Promise<{ data: MentorshipProfile[]; error: unknown }> {
  if (userIds.length === 0) return { data: [], error: null };
  const { data, error } = await (supabase as any)
    .from("profiles")
    .select("*")
    .in("user_id", userIds);
  return { data: data ?? [], error };
}

export function displayName(p: MentorshipProfile | null | undefined): string {
  if (!p) return "PM Member";
  return p.full_name || p.current_position || "PM Member";
}
