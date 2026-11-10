import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateMeetingImpact,
  generateEmail,
  getVerdict,
  type ResponseIntent,
} from "./meeting";

test("calculates a one-hour PM meeting", () => {
  assert.deepEqual(
    calculateMeetingImpact([{ roleId: "pm", count: 1 }], 60),
    { costCad: 58, focusHours: 1 },
  );
});

test("calculates two engineers for 30 minutes", () => {
  assert.deepEqual(
    calculateMeetingImpact([{ roleId: "engineer", count: 2 }], 30),
    { costCad: 63, focusHours: 1 },
  );
});

test("sums mixed roles and rounds output", () => {
  assert.deepEqual(
    calculateMeetingImpact(
      [
        { roleId: "designer", count: 2 },
        { roleId: "executive", count: 1 },
      ],
      45,
    ),
    { costCad: 147, focusHours: 2.3 },
  );
});

test("writes the expected request for each response intent", () => {
  const expected: Record<ResponseIntent, string> = {
    decline: "decline for now",
    agenda: "share the agenda",
    async: "handle this asynchronously",
  };

  for (const intent of Object.keys(expected) as ResponseIntent[]) {
    const email = generateEmail(intent, "Weekly sync", 120, 2);
    assert.match(email, new RegExp(expected[intent]));
    assert.match(email, /“Weekly sync”/);
    assert.match(email, /\$120 CAD and 2\.0 collective focus-hours/);
  }
});

test("keeps verdict copy short, kind, and actionable", () => {
  const verdicts = [50, 150, 450, 750].map(getVerdict);

  for (const verdict of verdicts) {
    assert.ok(verdict.title.split(/\s+/).length <= 6);
    assert.ok(verdict.line.split(/\s+/).length <= 18);
  }

  assert.match(verdicts[0].line, /confirm the outcome/);
  assert.match(verdicts[1].line, /ask for an agenda/);
  assert.match(verdicts[2].line, /suggest async/);
  assert.match(verdicts[3].line, /decline or demand a decision/);
});
