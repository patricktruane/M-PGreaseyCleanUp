/* ------------------------------------------------------------------ */
/* /dashboard passcode                                                 */
/* ------------------------------------------------------------------ */
// The dashboard is server-gated: every read of lead data requires this
// passcode, so the public site can never expose leads without it.
//
// HOW TO CHANGE IT:
//   1. Edit the default below, OR
//   2. Set the DASHBOARD_PASSCODE environment variable before running
//      `bun run publish` — the running server reads process.env at startup
//      and the env var wins over the default. (e.g.
//      `DASHBOARD_PASSCODE=my-code bun run publish`)
//
// Default (memorable): grease-2026
export const DASHBOARD_PASSCODE: string =
  process.env.DASHBOARD_PASSCODE || "grease-2026";

/* ------------------------------------------------------------------ */
/* Twilio SMS agent                                                    */
/* ------------------------------------------------------------------ */
// Credentials arrive as env/secrets when the owner finishes the Twilio
// signup. The SMS webhook is live-but-dormant without them: it still
// answers every inbound text with the instant reply and captures the lead,
// and only the REST outbound helper (and webhook signature verification)
// wait for credentials.
//
// HOW TO ACTIVATE: set these environment variables before `bun run publish`
// — the running server reads process.env at startup. Never hardcode them.
//   TWILIO_ACCOUNT_SID  — Twilio console account SID (AC…)
//   TWILIO_AUTH_TOKEN   — Twilio console auth token
//   TWILIO_PHONE_NUMBER — the purchased Twilio number in E.164 form (+1…)
export const TWILIO_ACCOUNT_SID: string = process.env.TWILIO_ACCOUNT_SID || "";
export const TWILIO_AUTH_TOKEN: string = process.env.TWILIO_AUTH_TOKEN || "";
export const TWILIO_PHONE_NUMBER: string = process.env.TWILIO_PHONE_NUMBER || "";

/** True once all three Twilio credentials are present. */
export function twilioConfigured(): boolean {
  return Boolean(
    TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER
  );
}
