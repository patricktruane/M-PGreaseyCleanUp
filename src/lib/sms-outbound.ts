/* ------------------------------------------------------------------ */
/* Outbound SMS helper — server-only, DORMANT until Twilio creds exist */
/* ------------------------------------------------------------------ */
// v1 replies in-band as the webhook's HTTP response (TwiML), so Twilio
// sends the SMS itself and this helper is not called yet. It exists so
// the follow-up sequences (1hr / 24hr / 3d, next iteration) and any
// future manual "text this lead" dashboard button have a single place
// that talks to Twilio's REST API.
//
// ACTIVATE: set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
// (env-first — see src/lib/config.ts), then call sendSms(). Without them
// it resolves { ok: false, error: "Twilio not configured" } and never
// touches the network. Credentials are never hardcoded.
import {
  twilioConfigured,
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER,
} from "./config";

export type SendSmsResult =
  | { ok: true; sid: string }
  | { ok: false; error: string };

/** Send an SMS via Twilio's REST API. Resolves false-safe when unconfigured. */
export async function sendSms(to: string, body: string): Promise<SendSmsResult> {
  if (!twilioConfigured()) {
    return { ok: false, error: "Twilio not configured — set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER" };
  }
  if (!to || !body) return { ok: false, error: "sendSms requires a recipient number and message body" };

  const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64");
  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: to,
          From: TWILIO_PHONE_NUMBER,
          Body: body,
        }),
      }
    );
    const payload = (await res.json()) as { sid?: string; message?: string };
    if (!res.ok) {
      return { ok: false, error: `Twilio API ${res.status}: ${payload.message ?? "unknown error"}` };
    }
    return { ok: true, sid: payload.sid ?? "" };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
