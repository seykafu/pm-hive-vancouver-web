import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MentorshipOptInModal from "@/components/MentorshipOptInModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Users,
  GraduationCap,
  Linkedin,
  Search,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Briefcase,
  UserCheck,
} from "lucide-react";
import type { MentorshipProfile, MentorWithScore, MentorshipRequest } from "@/types/mentorship";
import {
  getMatchesForMentee,
  getMentorDirectory,
  sendMatchRequest,
  acceptMatchRequest,
  declineMatchRequest,
  endMatch,
  getUserRequests,
  getProfilesByUserIds,
  displayName,
} from "@/lib/mentorship";
import {
  emailMatchRequested,
  emailMatchAccepted,
  emailMatchDeclined,
  emailMatchEnded,
} from "@/lib/email";

// ── Helper components ───────────────────────────────────────────────────────

function ExperienceBadge({ years }: { years?: number | null }) {
  if (years == null) return null;
  const label =
    years < 2 ? "0–2 yrs" : years < 5 ? "2–5 yrs" : years < 10 ? "5–10 yrs" : "10+ yrs";
  return (
    <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20">
      {label}
    </span>
  );
}

interface MentorCardProps {
  mentor: MentorWithScore;
  onRequest: (mentor: MentorWithScore) => void;
  alreadyRequested: boolean;
  loading: boolean;
}

function MentorCard({ mentor, onRequest, alreadyRequested, loading }: MentorCardProps) {
  const capacity = mentor.mentor_capacity ?? 2;
  const slotsLeft = capacity - mentor.activeMatchCount;
  const available = mentor.mentorship_active && slotsLeft > 0;

  return (
    <Card className="bg-white/5 border-[#d4af37]/20 backdrop-blur-sm hover:border-[#d4af37]/40 transition-all">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <Avatar className="w-12 h-12 border-2 border-[#d4af37]/30 flex-shrink-0">
            <AvatarImage src={mentor.profile_picture_url ?? undefined} />
            <AvatarFallback className="bg-gradient-to-r from-[#d4af37] to-[#f4d03f] text-[#000131] text-sm font-bold">
              {displayName(mentor).charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <p className="text-white font-semibold leading-tight">
                  {displayName(mentor)}
                </p>
                <p className="text-gray-400 text-sm mt-0.5">{mentor.current_position}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {available ? (
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">
                    Available
                  </Badge>
                ) : (
                  <Badge className="bg-white/5 text-gray-400 border-white/10 text-xs">
                    Full
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              <ExperienceBadge years={mentor.experience_years} />
              {mentor.specialization && (
                <span className="text-xs text-gray-400 truncate max-w-[200px]">
                  {mentor.specialization}
                </span>
              )}
            </div>

            {mentor.mentorship_goals && (
              <p className="text-gray-300 text-sm mt-2 line-clamp-2">
                {mentor.mentorship_goals}
              </p>
            )}

            <div className="flex items-center gap-3 mt-3 flex-wrap">
              {mentor.linkedin_profile && (
                <a
                  href={mentor.linkedin_profile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-[#d4af37] hover:text-[#f4d03f] transition-colors"
                >
                  <Linkedin className="h-3 w-3" />
                  LinkedIn
                </a>
              )}
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Star className="h-3 w-3" />
                {Math.round(mentor.score * 100)}% match
              </div>
            </div>
          </div>
        </div>

        <Button
          onClick={() => onRequest(mentor)}
          disabled={alreadyRequested || loading || !available}
          className="w-full mt-4 bg-gradient-to-r from-[#d4af37] to-[#f4d03f] hover:from-[#b8941f] hover:to-[#d4af37] text-[#000131] font-semibold disabled:opacity-50"
        >
          {alreadyRequested ? "Request Sent" : available ? "Request Match" : "Mentor Full"}
        </Button>
      </CardContent>
    </Card>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────

export default function Mentorship() {
  const { user, profile, updateProfile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [showOptIn, setShowOptIn] = useState(false);
  const [matches, setMatches] = useState<MentorWithScore[]>([]);
  const [directory, setDirectory] = useState<MentorshipProfile[]>([]);
  const [requests, setRequests] = useState<{
    incoming: MentorshipRequest[];
    outgoing: MentorshipRequest[];
    active: MentorshipRequest[];
  }>({ incoming: [], outgoing: [], active: [] });
  const [relatedProfiles, setRelatedProfiles] = useState<Record<string, MentorshipProfile>>({});
  const [loadingData, setLoadingData] = useState(true);
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [directorySearch, setDirectorySearch] = useState("");

  // Redirect if not authed
  useEffect(() => {
    if (!authLoading && !user) navigate("/signin");
  }, [user, authLoading, navigate]);

  // Show opt-in modal if role is null and dismissal has expired (or never)
  useEffect(() => {
    if (!profile) return;
    const p = profile as any;
    if (p.mentorship_role != null) return;
    if (p.mentorship_dismissed_at) {
      const dismissed = new Date(p.mentorship_dismissed_at);
      const daysSince = (Date.now() - dismissed.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < 30) return;
    }
    setShowOptIn(true);
  }, [profile]);

  const loadData = useCallback(async () => {
    if (!user || !profile) return;
    const p = profile as any;
    setLoadingData(true);

    // Fetch requests for any logged-in user with a mentorship role
    if (p.mentorship_role) {
      const reqResult = await getUserRequests(user.id);
      setRequests({
        incoming: reqResult.incoming,
        outgoing: reqResult.outgoing,
        active: reqResult.active,
      });

      // Gather all user IDs we need profiles for
      const allReqs = [
        ...reqResult.incoming,
        ...reqResult.outgoing,
        ...reqResult.active,
      ];
      const ids = [
        ...new Set(allReqs.flatMap((r) => [r.mentee_id, r.mentor_id])),
      ].filter((id) => id !== user.id);

      if (ids.length > 0) {
        const { data: profiles } = await getProfilesByUserIds(ids);
        const profileMap: Record<string, MentorshipProfile> = {};
        for (const prof of profiles) {
          profileMap[prof.user_id] = prof;
        }
        setRelatedProfiles(profileMap);
      }
    }

    // Fetch recommended matches for mentees
    if (p.mentorship_role === "mentee") {
      const { data: menteeMatches } = await getMatchesForMentee(p as any);
      setMatches(menteeMatches);
    }

    // Always fetch directory
    const { data: dir } = await getMentorDirectory();
    setDirectory(dir);

    setLoadingData(false);
  }, [user, profile]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRequestMatch = async (mentor: MentorWithScore) => {
    if (!user) return;
    setRequestingId(mentor.user_id);

    const { data: req, error } = await sendMatchRequest(user.id, mentor.user_id);
    if (error) {
      toast({ title: "Request failed", description: (error as any).message, variant: "destructive" });
      setRequestingId(null);
      return;
    }

    const p = profile as any;
    const menteeName = displayName(p) || user.email || "A mentee";
    const mentorName = displayName(mentor);

    // Notify mentor by email
    await emailMatchRequested({
      recipient_user_id: mentor.user_id,
      mentorName,
      menteeName,
    });

    toast({ title: "Request sent!", description: `${mentorName} will be notified.` });
    await loadData();
    setRequestingId(null);
  };

  const handleAccept = async (req: MentorshipRequest) => {
    const { error } = await acceptMatchRequest(req.id);
    if (error) {
      toast({ title: "Error", description: (error as any).message, variant: "destructive" });
      return;
    }

    const menteeProfile = relatedProfiles[req.mentee_id];
    const mentorProfile = profile as any;
    const p = profile as any;

    await emailMatchAccepted({
      recipient_user_id: req.mentee_id,
      menteeName: displayName(menteeProfile),
      mentorName: displayName(p),
      mentorLinkedIn: mentorProfile?.linkedin_profile || "",
    });

    toast({ title: "Match accepted!", description: "Both of you have been notified." });
    await loadData();
  };

  const handleDecline = async (req: MentorshipRequest) => {
    const { error } = await declineMatchRequest(req.id);
    if (error) {
      toast({ title: "Error", description: (error as any).message, variant: "destructive" });
      return;
    }

    const menteeProfile = relatedProfiles[req.mentee_id];
    const p = profile as any;

    await emailMatchDeclined({
      recipient_user_id: req.mentee_id,
      menteeName: displayName(menteeProfile),
      mentorName: displayName(p),
    });

    toast({ title: "Declined", description: "The mentee has been notified." });
    await loadData();
  };

  const handleEndMatch = async (req: MentorshipRequest) => {
    const { error } = await endMatch(req.id);
    if (error) {
      toast({ title: "Error", description: (error as any).message, variant: "destructive" });
      return;
    }

    const p = profile as any;
    const ismentor = req.mentor_id === user?.id;
    const otherId = ismentor ? req.mentee_id : req.mentor_id;
    const otherProfile = relatedProfiles[otherId];
    const myName = displayName(p);
    const otherName = displayName(otherProfile);

    // Email both parties
    await emailMatchEnded({
      recipient_user_id: user!.id,
      recipientName: myName,
      otherPartyName: otherName,
    });
    await emailMatchEnded({
      recipient_user_id: otherId,
      recipientName: otherName,
      otherPartyName: myName,
    });

    toast({ title: "Match ended", description: "Both parties have been notified." });
    await loadData();
  };

  const handleToggleAvailability = async () => {
    const p = profile as any;
    setAvailabilityLoading(true);
    await updateProfile({ mentorship_active: !p.mentorship_active } as any);
    setAvailabilityLoading(false);
    toast({
      title: p.mentorship_active ? "You're now offline" : "You're now available for matches",
    });
  };

  const sentMentorIds = new Set([
    ...requests.outgoing.map((r) => r.mentor_id),
    ...requests.active.map((r) => r.mentor_id),
  ]);

  const filteredDirectory = directory.filter((m) => {
    if (!directorySearch) return true;
    const q = directorySearch.toLowerCase();
    return (
      displayName(m).toLowerCase().includes(q) ||
      (m.current_position || "").toLowerCase().includes(q) ||
      (m.specialization || "").toLowerCase().includes(q)
    );
  });

  // ── Loading / unauthenticated states ──

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#000131] via-[#000131] to-[#1a1f3a] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4af37] mx-auto mb-4" />
          <p>Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const p = profile as any;
  const mentorshipRole = p?.mentorship_role as "mentor" | "mentee" | null | undefined;
  const isAvailable = p?.mentorship_active === true;
  const capacity = p?.mentor_capacity ?? 2;
  const activeCount = requests.active.filter(
    (r) => r.mentor_id === user.id
  ).length;

  // ── No role set yet ──

  if (!mentorshipRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#000131] via-[#000131] to-[#1a1f3a]">
        <Navbar />
        <MentorshipOptInModal
          open={showOptIn}
          onClose={() => { setShowOptIn(false); loadData(); }}
        />
        <div className="max-w-2xl mx-auto px-4 pt-32 pb-16 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#d4af37] to-[#f4d03f] flex items-center justify-center mx-auto mb-6">
            <Users className="h-8 w-8 text-[#000131]" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            PM Hive Mentorship
          </h1>
          <p className="text-gray-300 text-lg mb-8">
            Connect with experienced PMs or give back to the community as a mentor.
          </p>
          <Button
            onClick={() => setShowOptIn(true)}
            className="bg-gradient-to-r from-[#d4af37] to-[#f4d03f] hover:from-[#b8941f] hover:to-[#d4af37] text-[#000131] font-semibold px-8 py-3 rounded-full text-lg"
          >
            Get Started
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Authed + role set ──

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000131] via-[#000131] to-[#1a1f3a]">
      <Navbar />

      <MentorshipOptInModal
        open={showOptIn}
        onClose={() => { setShowOptIn(false); loadData(); }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-1">Mentorship</h1>
            <p className="text-gray-400">
              You're registered as a{" "}
              <span className="text-[#d4af37] font-medium">{mentorshipRole}</span>
            </p>
          </div>

          {mentorshipRole === "mentor" && (
            <div className="flex items-center gap-3 bg-white/5 border border-[#d4af37]/20 rounded-lg px-4 py-3">
              <div>
                <p className="text-white text-sm font-medium">Availability</p>
                <p className="text-gray-400 text-xs">
                  {activeCount}/{capacity} slots filled
                </p>
              </div>
              <Switch
                checked={isAvailable}
                onCheckedChange={handleToggleAvailability}
                disabled={availabilityLoading}
              />
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue={mentorshipRole === "mentor" ? "requests" : "matches"}>
          <TabsList className="bg-white/5 border border-white/10 mb-6">
            {mentorshipRole === "mentee" && (
              <TabsTrigger
                value="matches"
                className="data-[state=active]:bg-[#d4af37] data-[state=active]:text-[#000131]"
              >
                <Star className="h-4 w-4 mr-1.5" />
                Recommended
              </TabsTrigger>
            )}
            {mentorshipRole === "mentor" && (
              <>
                <TabsTrigger
                  value="requests"
                  className="data-[state=active]:bg-[#d4af37] data-[state=active]:text-[#000131]"
                >
                  <Clock className="h-4 w-4 mr-1.5" />
                  Requests
                  {requests.incoming.length > 0 && (
                    <span className="ml-1.5 bg-[#d4af37] text-[#000131] text-xs rounded-full w-4 h-4 inline-flex items-center justify-center font-bold">
                      {requests.incoming.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="mentees"
                  className="data-[state=active]:bg-[#d4af37] data-[state=active]:text-[#000131]"
                >
                  <UserCheck className="h-4 w-4 mr-1.5" />
                  My Mentees
                </TabsTrigger>
              </>
            )}
            {mentorshipRole === "mentee" && (
              <TabsTrigger
                value="my-requests"
                className="data-[state=active]:bg-[#d4af37] data-[state=active]:text-[#000131]"
              >
                <Clock className="h-4 w-4 mr-1.5" />
                My Requests
              </TabsTrigger>
            )}
            <TabsTrigger
              value="directory"
              className="data-[state=active]:bg-[#d4af37] data-[state=active]:text-[#000131]"
            >
              <Users className="h-4 w-4 mr-1.5" />
              Directory
            </TabsTrigger>
          </TabsList>

          {/* ── Mentee: Recommended matches ── */}
          {mentorshipRole === "mentee" && (
            <TabsContent value="matches">
              {loadingData ? (
                <div className="text-center py-12 text-gray-400">Loading matches…</div>
              ) : matches.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No mentors available right now. Check back soon!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {matches.map((m) => (
                    <MentorCard
                      key={m.user_id}
                      mentor={m}
                      onRequest={handleRequestMatch}
                      alreadyRequested={sentMentorIds.has(m.user_id)}
                      loading={requestingId === m.user_id}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          )}

          {/* ── Mentee: Outgoing requests ── */}
          {mentorshipRole === "mentee" && (
            <TabsContent value="my-requests">
              {requests.outgoing.length === 0 && requests.active.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Clock className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>You haven't sent any requests yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Active matches */}
                  {requests.active
                    .filter((r) => r.mentee_id === user.id)
                    .map((req) => {
                      const mentor = relatedProfiles[req.mentor_id];
                      return (
                        <Card key={req.id} className="bg-white/5 border-green-500/20">
                          <CardContent className="p-4 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                              <div>
                                <p className="text-white font-medium">
                                  {displayName(mentor)}
                                </p>
                                <p className="text-gray-400 text-sm">
                                  {mentor?.current_position}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {mentor?.linkedin_profile && (
                                <a
                                  href={mentor.linkedin_profile}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#d4af37] hover:text-[#f4d03f]"
                                >
                                  <Linkedin className="h-4 w-4" />
                                </a>
                              )}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs"
                                  >
                                    End Match
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-[#000131] border-white/10">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-white">
                                      End this match?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-gray-400">
                                      Both you and {displayName(mentor)} will be notified.
                                      This cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="border-white/20 text-gray-300">
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleEndMatch(req)}
                                      className="bg-red-600 hover:bg-red-700 text-white"
                                    >
                                      End Match
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}

                  {/* Pending/declined outgoing */}
                  {requests.outgoing.map((req) => {
                    const mentor = relatedProfiles[req.mentor_id];
                    return (
                      <Card key={req.id} className="bg-white/5 border-white/10">
                        <CardContent className="p-4 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            {req.status === "pending" ? (
                              <Clock className="h-5 w-5 text-[#d4af37] flex-shrink-0" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                            )}
                            <div>
                              <p className="text-white font-medium">
                                {displayName(mentor)}
                              </p>
                              <p className="text-gray-400 text-sm">
                                {req.status === "pending"
                                  ? "Awaiting response"
                                  : "Declined — find another mentor"}
                              </p>
                            </div>
                          </div>
                          {req.status === "declined" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-[#d4af37]/30 text-[#d4af37] hover:bg-[#d4af37]/10 text-xs"
                              onClick={() =>
                                document
                                  .querySelector<HTMLButtonElement>('[data-tab="directory"]')
                                  ?.click()
                              }
                            >
                              Browse Mentors
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          )}

          {/* ── Mentor: Incoming requests ── */}
          {mentorshipRole === "mentor" && (
            <TabsContent value="requests">
              {requests.incoming.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Clock className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No pending requests right now.</p>
                  {!isAvailable && (
                    <p className="mt-2 text-sm">
                      Turn on availability above to start receiving requests.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {requests.incoming.map((req) => {
                    const mentee = relatedProfiles[req.mentee_id];
                    return (
                      <Card key={req.id} className="bg-white/5 border-[#d4af37]/20">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10 border border-[#d4af37]/30">
                                <AvatarImage src={mentee?.profile_picture_url ?? undefined} />
                                <AvatarFallback className="bg-[#d4af37]/20 text-[#d4af37] text-sm">
                                  {displayName(mentee).charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-white font-medium">{displayName(mentee)}</p>
                                <p className="text-gray-400 text-sm">
                                  {mentee?.current_position}
                                </p>
                                {mentee?.specialization && (
                                  <p className="text-gray-500 text-xs mt-0.5">
                                    {mentee.specialization}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleAccept(req)}
                                className="bg-gradient-to-r from-[#d4af37] to-[#f4d03f] text-[#000131] font-semibold text-xs"
                              >
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDecline(req)}
                                className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs"
                              >
                                Decline
                              </Button>
                            </div>
                          </div>
                          {mentee?.mentorship_goals && (
                            <p className="text-gray-300 text-sm mt-3 pl-13 line-clamp-2">
                              "{mentee.mentorship_goals}"
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          )}

          {/* ── Mentor: Active mentees ── */}
          {mentorshipRole === "mentor" && (
            <TabsContent value="mentees">
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-400 text-sm">
                  {activeCount} of {capacity} slots filled
                </p>
                <div className="flex gap-1">
                  {Array.from({ length: capacity }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full ${
                        i < activeCount
                          ? "bg-gradient-to-r from-[#d4af37] to-[#f4d03f]"
                          : "bg-white/10"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {requests.active.filter((r) => r.mentor_id === user.id).length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No active mentees yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {requests.active
                    .filter((r) => r.mentor_id === user.id)
                    .map((req) => {
                      const mentee = relatedProfiles[req.mentee_id];
                      return (
                        <Card key={req.id} className="bg-white/5 border-green-500/20">
                          <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
                            <div className="flex items-center gap-3">
                              <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                              <div>
                                <p className="text-white font-medium">{displayName(mentee)}</p>
                                <p className="text-gray-400 text-sm">
                                  {mentee?.current_position}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {mentee?.linkedin_profile && (
                                <a
                                  href={mentee.linkedin_profile}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#d4af37] hover:text-[#f4d03f]"
                                >
                                  <Linkedin className="h-4 w-4" />
                                </a>
                              )}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs"
                                  >
                                    End Match
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-[#000131] border-white/10">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-white">
                                      End this match?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-gray-400">
                                      Both you and {displayName(mentee)} will be notified.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="border-white/20 text-gray-300">
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleEndMatch(req)}
                                      className="bg-red-600 hover:bg-red-700 text-white"
                                    >
                                      End Match
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              )}
            </TabsContent>
          )}

          {/* ── Directory (shared) ── */}
          <TabsContent value="directory">
            <div className="mb-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={directorySearch}
                onChange={(e) => setDirectorySearch(e.target.value)}
                placeholder="Search by name, position, or specialization…"
                className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>

            {loadingData ? (
              <div className="text-center py-12 text-gray-400">Loading…</div>
            ) : filteredDirectory.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No mentors found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDirectory.map((mentor) => {
                  const scored: MentorWithScore = {
                    ...mentor,
                    score: 0,
                    activeMatchCount: 0,
                  };
                  return (
                    <MentorCard
                      key={mentor.user_id}
                      mentor={scored}
                      onRequest={handleRequestMatch}
                      alreadyRequested={sentMentorIds.has(mentor.user_id)}
                      loading={requestingId === mentor.user_id}
                    />
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
