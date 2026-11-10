export type ResponseIntent = "decline" | "agenda" | "async";

export type AttendeeGroup = {
  roleId: string;
  count: number;
};

export type Role = {
  id: string;
  label: string;
  annualCad: number;
  hourlyCad: number;
};

export const ROLES: readonly Role[] = [
  { id: "attendee", label: "Attendee / unspecified", annualCad: 100_000, hourlyCad: 48 },
  { id: "pm", label: "Product manager", annualCad: 120_000, hourlyCad: 58 },
  { id: "engineer", label: "Software engineer", annualCad: 130_000, hourlyCad: 63 },
  { id: "designer", label: "Product designer", annualCad: 105_000, hourlyCad: 50 },
  { id: "lead", label: "People manager / lead", annualCad: 145_000, hourlyCad: 70 },
  { id: "executive", label: "Executive", annualCad: 200_000, hourlyCad: 96 },
];

export function calculateMeetingImpact(
  attendees: readonly AttendeeGroup[],
  durationMinutes: number,
) {
  const hours = durationMinutes / 60;
  const totals = attendees.reduce(
    (sum, group) => {
      const role = ROLES.find((item) => item.id === group.roleId);
      if (!role || group.count < 1 || !Number.isFinite(group.count)) return sum;

      return {
        costCad: sum.costCad + group.count * role.hourlyCad * hours,
        focusHours: sum.focusHours + group.count * hours,
      };
    },
    { costCad: 0, focusHours: 0 },
  );

  return {
    costCad: Math.round(totals.costCad),
    focusHours: Math.round(totals.focusHours * 10) / 10,
  };
}

export function getVerdict(costCad: number) {
  if (costCad < 100) {
    return {
      title: "Tiny meeting, tidy agenda",
      line: "Low stakes, still worth protecting—confirm the outcome before you click accept.",
    };
  }

  if (costCad < 300) {
    return {
      title: "This sync has rent",
      line: "Not outrageous, not free—ask for an agenda before donating the hour.",
    };
  }

  if (costCad < 600) {
    return {
      title: "That invite has teeth",
      line: "The room is getting pricey—suggest async before everyone pays in focus.",
    };
  }

  return {
    title: "You booked a budget",
    line: "That is real money wearing a calendar hat—decline or demand a decision.",
  };
}

export function generateEmail(
  intent: ResponseIntent,
  title: string,
  costCad: number,
  focusHours: number,
) {
  const meeting = title.trim() ? `“${title.trim()}”` : "this meeting";
  const impact = `It represents roughly $${costCad.toLocaleString("en-CA")} CAD and ${focusHours.toFixed(1)} collective focus-hours.`;
  const requests: Record<ResponseIntent, string> = {
    decline:
      "I’m going to decline for now so I can protect that focus time. If there’s a decision I’m needed for, please send it my way and I’ll respond.",
    agenda:
      "Before I accept, could you share the agenda, desired outcome, and the decision you need from me? That will help me confirm whether I should attend.",
    async:
      "Could we handle this asynchronously instead? A short written update with the question or decision needed would help everyone respond with context.",
  };

  return `Hi,\n\nThanks for the invite to ${meeting}. ${impact}\n\n${requests[intent]}\n\nThanks for understanding.`;
}
