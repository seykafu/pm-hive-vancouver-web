"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  calculateLiveMeetingCost,
  calculateMeetingImpact,
  formatElapsedTime,
  formatVerdict,
  generateEmail,
  getElapsedMs,
  getVerdict,
  pauseTimer,
  ROLES,
  startTimer,
  type ResponseIntent,
  type TimerSnapshot,
} from "@/lib/meeting";

type EditableGroup = {
  uid: number;
  roleId: string;
  count: number;
};

type Theme = "light" | "dark";
type CopyState = "idle" | "copied" | "error";

const intents: { value: ResponseIntent; label: string; description: string }[] = [
  { value: "decline", label: "Kindly decline", description: "Save the hour without burning the bridge." },
  { value: "agenda", label: "Ask for receipts", description: "Request the agenda and decision needed." },
  { value: "async", label: "Take it async", description: "Move the chat somewhere calendars cannot multiply." },
];

export default function Home() {
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(30);
  const [groups, setGroups] = useState<EditableGroup[]>([
    { uid: 1, roleId: "pm", count: 1 },
    { uid: 2, roleId: "engineer", count: 3 },
  ]);
  const [nextUid, setNextUid] = useState(3);
  const [intent, setIntent] = useState<ResponseIntent>("async");
  const [emailDraft, setEmailDraft] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const [verdictCopyState, setVerdictCopyState] = useState<CopyState>("idle");
  const [timer, setTimer] = useState<TimerSnapshot>({
    accumulatedMs: 0,
    startedAtMs: null,
  });
  const [clockNow, setClockNow] = useState(0);
  const emailRef = useRef<HTMLTextAreaElement>(null);
  const verdictFallbackRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (timer.startedAtMs === null) return;
    const updateClock = () => setClockNow(Date.now());
    updateClock();
    const interval = window.setInterval(updateClock, 250);
    return () => window.clearInterval(interval);
  }, [timer.startedAtMs]);

  const impact = useMemo(
    () => calculateMeetingImpact(groups, duration),
    [groups, duration],
  );
  const generatedEmail = useMemo(
    () => generateEmail(intent, title, impact.costCad, impact.focusHours),
    [intent, title, impact],
  );
  const elapsedMs = getElapsedMs(timer, clockNow);
  const timerStarted = timer.startedAtMs !== null || timer.accumulatedMs > 0;
  const liveCost = calculateLiveMeetingCost(groups, elapsedMs);
  const displayedCost = timerStarted ? liveCost : impact.costCad;
  const verdict = getVerdict(displayedCost);
  const verdictText = formatVerdict(verdict.title, verdict.line);
  const email = emailDraft ?? generatedEmail;
  const durationValid = Number.isFinite(duration) && duration >= 1 && duration <= 480;
  const attendeesValid =
    groups.length > 0 &&
    groups.every((group) => Number.isInteger(group.count) && group.count >= 1);
  const formValid = durationValid && attendeesValid;
  const attendeeCount = groups.reduce(
    (total, group) => total + (Number.isFinite(group.count) ? Math.max(group.count, 0) : 0),
    0,
  );
  const displayedFocusHours = timerStarted
    ? attendeeCount * elapsedMs / 3_600_000
    : impact.focusHours;

  function updateInputs(callback: () => void) {
    callback();
    setEmailDraft(null);
    setCopyState("idle");
  }

  function updateGroup(uid: number, update: Partial<EditableGroup>) {
    updateInputs(() => {
      setGroups((current) =>
        current.map((group) => (group.uid === uid ? { ...group, ...update } : group)),
      );
    });
  }

  function addGroup() {
    updateInputs(() => {
      setGroups((current) => [
        ...current,
        { uid: nextUid, roleId: "attendee", count: 1 },
      ]);
      setNextUid((value) => value + 1);
    });
  }

  function removeGroup(uid: number) {
    updateInputs(() => {
      setGroups((current) => current.filter((group) => group.uid !== uid));
    });
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(email);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1800);
    } catch {
      setCopyState("error");
      emailRef.current?.focus();
      emailRef.current?.select();
    }
  }

  function toggleTheme() {
    const nextTheme: Theme =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;
    window.localStorage.setItem("meeting-theme", nextTheme);
  }

  async function copyVerdict() {
    try {
      await navigator.clipboard.writeText(verdictText);
      setVerdictCopyState("copied");
      window.setTimeout(() => setVerdictCopyState("idle"), 1800);
    } catch {
      setVerdictCopyState("error");
      window.requestAnimationFrame(() => {
        verdictFallbackRef.current?.focus();
        verdictFallbackRef.current?.select();
      });
    }
  }

  function beginTimer() {
    const now = Date.now();
    setClockNow(now);
    setTimer((current) => startTimer(current, now));
  }

  function holdTimer() {
    const now = Date.now();
    setClockNow(now);
    setTimer((current) => pauseTimer(current, now));
  }

  function resetTimer() {
    setTimer({ accumulatedMs: 0, startedAtMs: null });
    setClockNow(0);
  }

  return (
    <main>
      <header className="hero">
        <div className="heroBar">
          <p className="eyebrow">PM Hive · Meeting maths</p>
          <button
            type="button"
            className="themeToggle"
            onClick={toggleTheme}
          >
            <span className="themeWhenLight"><span aria-hidden="true">☾</span> Dark mode</span>
            <span className="themeWhenDark"><span aria-hidden="true">☀</span> Light mode</span>
          </button>
        </div>
        <h1>That meeting isn&apos;t free.</h1>
        <p className="heroCopy">
          See what the room costs, then send a kind little no—or ask for a
          better reason.
        </p>
        <div className="privacyPill" aria-label="Privacy information">
          <span aria-hidden="true">●</span> Private by design — nothing leaves this page
        </div>
      </header>

      <div className="workspace">
        <section className="card formCard" aria-labelledby="meeting-heading">
          <div className="sectionHeading">
            <span className="step">01</span>
            <div>
              <h2 id="meeting-heading">Price the meeting</h2>
              <p>Add the room. We&apos;ll do the uncomfortable maths.</p>
            </div>
          </div>

          <div className="field">
            <label htmlFor="meeting-title">
              Meeting title <span>Optional</span>
            </label>
            <input
              id="meeting-title"
              type="text"
              value={title}
              placeholder="e.g. Weekly product sync"
              onChange={(event) =>
                updateInputs(() => setTitle(event.target.value))
              }
            />
          </div>

          <fieldset className="field durationField">
            <legend>Duration</legend>
            <div className="durationOptions">
              {[15, 30, 45, 60].map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  className={duration === minutes ? "duration active" : "duration"}
                  aria-pressed={duration === minutes}
                  onClick={() => updateInputs(() => setDuration(minutes))}
                >
                  {minutes}m
                </button>
              ))}
              <label className="customDuration">
                <span className="srOnly">Custom duration in minutes</span>
                <input
                  type="number"
                  min="1"
                  max="480"
                  value={duration}
                  aria-invalid={!durationValid}
                  aria-describedby={!durationValid ? "duration-error" : undefined}
                  onChange={(event) =>
                    updateInputs(() => setDuration(event.target.valueAsNumber))
                  }
                />
                <span>min</span>
              </label>
            </div>
            {!durationValid && (
              <p className="error" id="duration-error">
                Enter a duration from 1 to 480 minutes.
              </p>
            )}
          </fieldset>

          <fieldset className="field attendeeField">
            <legend>Who&apos;s in the room?</legend>
            <div className="attendeeLabels" aria-hidden="true">
              <span>Role</span><span>People</span>
            </div>
            <div className="attendeeRows">
              {groups.map((group, index) => (
                <div className="attendeeRow" key={group.uid}>
                  <label className="srOnly" htmlFor={`role-${group.uid}`}>
                    Role for attendee group {index + 1}
                  </label>
                  <select
                    id={`role-${group.uid}`}
                    value={group.roleId}
                    onChange={(event) =>
                      updateGroup(group.uid, { roleId: event.target.value })
                    }
                  >
                    {ROLES.map((role) => (
                      <option value={role.id} key={role.id}>
                        {role.label} · ${role.hourlyCad}/hr
                      </option>
                    ))}
                  </select>
                  <label className="srOnly" htmlFor={`count-${group.uid}`}>
                    Number of people in attendee group {index + 1}
                  </label>
                  <input
                    id={`count-${group.uid}`}
                    className="countInput"
                    type="number"
                    min="1"
                    step="1"
                    value={group.count}
                    aria-invalid={!Number.isInteger(group.count) || group.count < 1}
                    onChange={(event) =>
                      updateGroup(group.uid, { count: event.target.valueAsNumber })
                    }
                  />
                  <button
                    type="button"
                    className="removeButton"
                    onClick={() => removeGroup(group.uid)}
                    aria-label={`Remove attendee group ${index + 1}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            {!attendeesValid && (
              <p className="error">
                Add at least one attendee and use whole numbers of 1 or more.
              </p>
            )}
            <button type="button" className="addButton" onClick={addGroup}>
              <span aria-hidden="true">＋</span> Add another role
            </button>
          </fieldset>

          <details className="rateDetails">
            <summary>How the fictional rates work</summary>
            <p>
              Rates use illustrative Vancouver tech salaries divided by 2,080
              working hours, from $48/hr for an unspecified attendee to $96/hr
              for an executive.
            </p>
          </details>
        </section>

        <aside className="resultsColumn" aria-label="Meeting impact and response">
          <section className="impactCard" aria-labelledby="impact-heading">
            <p className="impactLabel" id="impact-heading">The damage, roughly</p>
            <div className="cost">
              <span>~</span>$
              {timerStarted
                ? displayedCost.toLocaleString("en-CA", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : displayedCost.toLocaleString("en-CA")}
              <small>CAD</small>
            </div>
            <div className="liveTimer" aria-label="Live meeting cost timer">
              <div>
                <span>Live meeting timer</span>
                <strong aria-live="off">{formatElapsedTime(elapsedMs)}</strong>
              </div>
              <div className="timerControls">
                {timer.startedAtMs === null ? (
                  <button type="button" onClick={beginTimer}>
                    {timer.accumulatedMs > 0 ? "Resume" : "Start"}
                  </button>
                ) : (
                  <button type="button" onClick={holdTimer}>Pause</button>
                )}
                <button
                  type="button"
                  className="timerReset"
                  onClick={resetTimer}
                  disabled={!timerStarted}
                >
                  Reset
                </button>
              </div>
            </div>
            <div className="focusStat">
              <strong>{displayedFocusHours.toFixed(timerStarted ? 2 : 1)}</strong>
              <span>{timerStarted ? "elapsed " : ""}collective focus-hours across {attendeeCount} {attendeeCount === 1 ? "person" : "people"}</span>
            </div>
            <div className="verdict" aria-live="polite">
              <div className="verdictHeading">
                <span>Verdict</span>
                <button type="button" onClick={copyVerdict}>
                  {verdictCopyState === "copied" ? "Copied ✓" : "Copy verdict"}
                </button>
              </div>
              <h3>{verdict.title}</h3>
              <p>{verdict.line}</p>
              <p className="verdictCopyStatus" aria-live="polite">
                {verdictCopyState === "copied" && "Verdict copied to your clipboard."}
                {verdictCopyState === "error" && "Clipboard unavailable. The verdict is selected below—copy it manually."}
              </p>
              {verdictCopyState === "error" && (
                <textarea
                  ref={verdictFallbackRef}
                  className="verdictFallback"
                  readOnly
                  value={verdictText}
                  aria-label="Verdict text to copy manually"
                />
              )}
            </div>
            <p className="disclaimer">
              Illustrative estimate only. Rates use rough, fictional Vancouver
              tech salary assumptions and do not represent actual compensation,
              payroll cost, or financial advice. No meeting or attendee data
              leaves this page.
            </p>
          </section>

          <section className="card responseCard" aria-labelledby="response-heading">
            <div className="sectionHeading compact">
              <span className="step">02</span>
              <div>
                <h2 id="response-heading">Push back, politely</h2>
                <p>Firm can still be friendly. Pick your flavour.</p>
              </div>
            </div>

            <fieldset className="intentOptions">
              <legend className="srOnly">Response intent</legend>
              {intents.map((option) => (
                <label
                  className={intent === option.value ? "intent active" : "intent"}
                  key={option.value}
                >
                  <input
                    type="radio"
                    name="intent"
                    value={option.value}
                    checked={intent === option.value}
                    onChange={() =>
                      updateInputs(() => setIntent(option.value))
                    }
                  />
                  <span>
                    <strong>{option.label}</strong>
                    <small>{option.description}</small>
                  </span>
                </label>
              ))}
            </fieldset>

            <div className="emailHeader">
              <label htmlFor="email-draft">Your draft</label>
              <span>Editable</span>
            </div>
            <textarea
              ref={emailRef}
              id="email-draft"
              value={email}
              onChange={(event) => {
                setEmailDraft(event.target.value);
                setCopyState("idle");
              }}
              rows={9}
            />
            <button
              type="button"
              className="copyButton"
              disabled={!formValid}
              onClick={copyEmail}
            >
              <span>{copyState === "copied" ? "Copied. Lovely." : "Copy the polite pushback"}</span>
              <span aria-hidden="true">{copyState === "copied" ? "✓" : "↗"}</span>
            </button>
            <p className={copyState === "error" ? "copyStatus error" : "copyStatus"} aria-live="polite">
              {copyState === "copied" && "Response copied to your clipboard."}
              {copyState === "error" && "Clipboard unavailable. The draft is selected—copy it manually."}
            </p>
          </section>
        </aside>
      </div>
    </main>
  );
}
