/**
 * Email utility — thin client wrapper around the `send-email` Supabase Edge Function.
 * All email sends go through this file. The actual sending uses Resend server-side,
 * so RESEND_API_KEY is never exposed to the browser.
 */
import { supabase } from "./supabase";

interface SendEmailOptions {
  /** Direct recipient email address */
  to?: string;
  /** Supabase auth user ID — edge function will look up their email */
  recipient_user_id?: string;
  subject: string;
  html: string;
}

export async function sendEmail(opts: SendEmailOptions): Promise<{ error?: string }> {
  try {
    const { error } = await (supabase as any).functions.invoke("send-email", {
      body: opts,
    });
    if (error) return { error: error.message };
    return {};
  } catch (err) {
    console.error("sendEmail:", err);
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}

// ── Templates ──────────────────────────────────────────────────────────────

function baseTemplate(body: string) {
  return `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#000131;color:#ffffff;padding:40px 32px;border-radius:10px;">
  <div style="text-align:center;margin-bottom:32px;">
    <h1 style="color:#d4af37;font-size:28px;margin:0;letter-spacing:1px;">PM Hive</h1>
    <p style="color:#888;margin:4px 0 0 0;font-size:13px;">Mentorship Program</p>
  </div>
  ${body}
  <p style="color:#555;font-size:11px;margin-top:40px;text-align:center;">
    PM Hive · Vancouver's Product Management Community · pmhive.ca
  </p>
</div>`;
}

function ctaButton(href: string, label: string) {
  return `<a href="${href}" style="display:inline-block;background:linear-gradient(to right,#d4af37,#f4d03f);color:#000131;padding:12px 28px;border-radius:24px;text-decoration:none;font-weight:bold;margin-top:16px;">${label}</a>`;
}

export function emailMatchRequested(params: {
  recipient_user_id: string;
  mentorName: string;
  menteeName: string;
}) {
  return sendEmail({
    recipient_user_id: params.recipient_user_id,
    subject: `New mentorship request from ${params.menteeName}`,
    html: baseTemplate(`
      <h2 style="color:#ffffff;font-size:20px;margin-top:0;">You have a new mentorship request!</h2>
      <p style="color:#cccccc;line-height:1.7;">
        Hi ${params.mentorName},<br/><br/>
        <strong style="color:#d4af37;">${params.menteeName}</strong> is interested in being mentored by you through PM Hive.
      </p>
      <div style="background:rgba(212,175,55,0.08);border:1px solid rgba(212,175,55,0.25);border-radius:8px;padding:18px;margin:24px 0;">
        <p style="color:#d4af37;margin:0;font-weight:bold;">Next step</p>
        <p style="color:#cccccc;margin:8px 0 0 0;">Log in to PM Hive to review their profile and accept or decline the request.</p>
      </div>
      ${ctaButton("https://pmhive.ca/mentorship", "View Request")}
    `),
  });
}

export function emailMatchAccepted(params: {
  recipient_user_id: string;
  menteeName: string;
  mentorName: string;
  mentorLinkedIn: string;
}) {
  return sendEmail({
    recipient_user_id: params.recipient_user_id,
    subject: `Great news — ${params.mentorName} accepted your mentorship request!`,
    html: baseTemplate(`
      <h2 style="color:#ffffff;font-size:20px;margin-top:0;">You've been matched!</h2>
      <p style="color:#cccccc;line-height:1.7;">
        Hi ${params.menteeName},<br/><br/>
        <strong style="color:#d4af37;">${params.mentorName}</strong> has accepted your mentorship request. You're officially matched!
      </p>
      <div style="background:rgba(212,175,55,0.08);border:1px solid rgba(212,175,55,0.25);border-radius:8px;padding:18px;margin:24px 0;">
        <p style="color:#d4af37;margin:0;font-weight:bold;">Connect with your mentor</p>
        <p style="margin:8px 0 0 0;">
          <a href="${params.mentorLinkedIn}" style="color:#d4af37;">${params.mentorLinkedIn}</a>
        </p>
      </div>
      ${ctaButton("https://pmhive.ca/profile", "View My Matches")}
    `),
  });
}

export function emailMatchDeclined(params: {
  recipient_user_id: string;
  menteeName: string;
  mentorName: string;
}) {
  return sendEmail({
    recipient_user_id: params.recipient_user_id,
    subject: `${params.mentorName} isn't available right now`,
    html: baseTemplate(`
      <h2 style="color:#ffffff;font-size:20px;margin-top:0;">Mentor availability update</h2>
      <p style="color:#cccccc;line-height:1.7;">
        Hi ${params.menteeName},<br/><br/>
        <strong style="color:#d4af37;">${params.mentorName}</strong> isn't available to take on new mentees right now. No worries — there are plenty of great mentors in the PM Hive community.
      </p>
      ${ctaButton("https://pmhive.ca/mentorship", "Browse Other Mentors")}
    `),
  });
}

export function emailMatchEnded(params: {
  recipient_user_id: string;
  recipientName: string;
  otherPartyName: string;
}) {
  return sendEmail({
    recipient_user_id: params.recipient_user_id,
    subject: `Your mentorship match with ${params.otherPartyName} has ended`,
    html: baseTemplate(`
      <h2 style="color:#ffffff;font-size:20px;margin-top:0;">Mentorship match ended</h2>
      <p style="color:#cccccc;line-height:1.7;">
        Hi ${params.recipientName},<br/><br/>
        Your mentorship match with <strong style="color:#d4af37;">${params.otherPartyName}</strong> has ended. We hope it was a valuable experience!
      </p>
      ${ctaButton("https://pmhive.ca/mentorship", "Find New Matches")}
    `),
  });
}
