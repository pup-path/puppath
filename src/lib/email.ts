import "server-only";

/**
 * Thin Resend wrapper. Does nothing (and says so in the logs) until
 * RESEND_API_KEY is set, so the forms work before email is wired up.
 */
const FROM = process.env.RESEND_FROM ?? "Northern Beaches Groodles <onboarding@resend.dev>";
const NOTIFY = process.env.NOTIFY_EMAIL; // Jen's inbox for "new enquiry" pings

export async function sendEmail(opts: { to: string; subject: string; text: string; html?: string; replyTo?: string }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.info(`[email skipped, no RESEND_API_KEY] to=${opts.to} subject=${opts.subject}`);
    return { skipped: true as const };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to: [opts.to], subject: opts.subject, text: opts.text, html: opts.html, reply_to: opts.replyTo }),
  });
  if (!res.ok) {
    console.error("Resend error", res.status, await res.text());
    return { error: true as const };
  }
  return { ok: true as const };
}

export async function notifyBreeder(subject: string, text: string) {
  if (!NOTIFY) return;
  await sendEmail({ to: NOTIFY, subject, text });
}

export function enquiryConfirmation(firstName: string) {
  return {
    subject: "Thanks for getting in touch with Northern Beaches Groodles",
    text: `Hi ${firstName},

Thanks for your enquiry. Jen has it and will be in touch within a couple of days.

If you'd like to get ahead, you can fill in the full puppy application here:
${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/apply

Warm regards,
Jen
Northern Beaches Groodles`,
  };
}

export function applicationConfirmation(firstName: string) {
  return {
    subject: "Your application has arrived",
    text: `Hi ${firstName},

Thank you for taking the time to fill in the application. Jen reads every one personally and will come back to you once she has.

Warm regards,
Jen
Northern Beaches Groodles`,
  };
}
