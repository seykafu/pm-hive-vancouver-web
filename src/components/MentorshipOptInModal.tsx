import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { PM_SKILLS, type PMSkill } from "@/types/mentorship";
import { GraduationCap, Users, X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

type Step = "role" | "details";

export default function MentorshipOptInModal({ open, onClose }: Props) {
  const [step, setStep] = useState<Step>("role");
  const [role, setRole] = useState<"mentor" | "mentee" | null>(null);
  const [fullName, setFullName] = useState("");
  const [goals, setGoals] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [mentorCapacity, setMentorCapacity] = useState("2");
  const [selectedSkills, setSelectedSkills] = useState<PMSkill[]>([]);
  const [loading, setLoading] = useState(false);
  const { updateProfile } = useAuth();
  const { toast } = useToast();

  const handleDismiss = async () => {
    await updateProfile({
      mentorship_dismissed_at: new Date().toISOString(),
    } as any);
    onClose();
  };

  const handleRoleSelect = (r: "mentor" | "mentee") => {
    setRole(r);
    setStep("details");
  };

  const toggleSkill = (skill: PMSkill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : prev.length < 3
        ? [...prev, skill]
        : prev
    );
  };

  const handleSubmit = async () => {
    if (!role) return;
    setLoading(true);

    const specializationUpdate =
      role === "mentee" && selectedSkills.length > 0
        ? selectedSkills.join(", ")
        : undefined;

    const profileData: Record<string, unknown> = {
      mentorship_role: role,
      mentorship_active: true,
      mentorship_goals: goals || null,
      experience_years: experienceYears ? parseInt(experienceYears) : null,
      ...(fullName && { full_name: fullName }),
      ...(role === "mentor" && {
        mentor_capacity: parseInt(mentorCapacity) || 2,
      }),
      ...(specializationUpdate && { specialization: specializationUpdate }),
    };

    const { error } = await updateProfile(profileData as any);

    if (error) {
      toast({
        title: "Error saving preferences",
        description: (error as any).message,
        variant: "destructive",
      });
    } else {
      toast({
        title:
          role === "mentor"
            ? "You're now listed as a mentor!"
            : "You're now looking for a mentor!",
        description: "Head to the Mentorship page to see your matches.",
      });
      onClose();
    }
    setLoading(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) handleDismiss();
      }}
    >
      <DialogContent className="bg-[#000131] border-[#d4af37]/20 text-white max-w-md">
        {step === "role" ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">
                Join the Mentorship Program
              </DialogTitle>
              <DialogDescription className="text-gray-300">
                PM Hive connects experienced PMs with those looking to grow.
                What are you looking for?
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 mt-4">
              <button
                onClick={() => handleRoleSelect("mentor")}
                className="w-full p-4 rounded-lg border border-[#d4af37]/30 bg-white/5 hover:bg-white/10 hover:border-[#d4af37] transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#d4af37] to-[#f4d03f] flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="h-5 w-5 text-[#000131]" />
                  </div>
                  <div>
                    <p className="font-semibold text-white group-hover:text-[#d4af37] transition-colors">
                      I want to mentor
                    </p>
                    <p className="text-sm text-gray-400">
                      Share your experience with aspiring PMs
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleRoleSelect("mentee")}
                className="w-full p-4 rounded-lg border border-[#d4af37]/30 bg-white/5 hover:bg-white/10 hover:border-[#d4af37] transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#d4af37] to-[#f4d03f] flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-[#000131]" />
                  </div>
                  <div>
                    <p className="font-semibold text-white group-hover:text-[#d4af37] transition-colors">
                      I want to be mentored
                    </p>
                    <p className="text-sm text-gray-400">
                      Find a mentor to guide your PM journey
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={handleDismiss}
                className="w-full p-3 text-sm text-gray-500 hover:text-gray-300 transition-colors flex items-center justify-center gap-1"
              >
                <X className="h-3 w-3" />
                Not right now
              </button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">
                {role === "mentor"
                  ? "Set up your mentor profile"
                  : "Tell us what you're looking for"}
              </DialogTitle>
              <DialogDescription className="text-gray-300">
                This helps us find your best matches.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-white">
                  Your name{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </Label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  placeholder="e.g. Alex Chen"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Years of PM experience</Label>
                <Input
                  type="number"
                  min={0}
                  max={30}
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  placeholder="e.g. 5"
                />
              </div>

              {role === "mentee" && (
                <div className="space-y-2">
                  <Label className="text-white">
                    Areas of focus{" "}
                    <span className="text-gray-400 font-normal">
                      (pick up to 3)
                    </span>
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {PM_SKILLS.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`px-3 py-1 rounded-full text-sm border transition-all ${
                          selectedSkills.includes(skill)
                            ? "bg-[#d4af37] border-[#d4af37] text-[#000131] font-semibold"
                            : "border-white/20 text-gray-300 hover:border-[#d4af37]/50"
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {role === "mentor" && (
                <div className="space-y-2">
                  <Label className="text-white">Max mentees at once</Label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={mentorCapacity}
                    onChange={(e) => setMentorCapacity(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-white">
                  {role === "mentor"
                    ? "What do you hope to give from this?"
                    : "What are you hoping to get out of this?"}
                </Label>
                <Textarea
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 resize-none"
                  placeholder={
                    role === "mentor"
                      ? "e.g. I want to help PMs break into senior roles and navigate complex orgs…"
                      : "e.g. I want to grow into a senior PM role and improve my stakeholder skills…"
                  }
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setStep("role")}
                  className="border-white/20 text-gray-300 hover:bg-white/10"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-[#d4af37] to-[#f4d03f] hover:from-[#b8941f] hover:to-[#d4af37] text-[#000131] font-semibold"
                >
                  {loading ? "Saving…" : "Get started"}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
