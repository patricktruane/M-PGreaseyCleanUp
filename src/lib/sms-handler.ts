/* ------------------------------------------------------------------ */
/* SMS webhook handler — server-only (imported from the /api/sms       */
/* route handler; never imported by client components)                 */
/* ------------------------------------------------------------------ */
import { createHmac, timingSafeEqual } from "node:crypto";
import { twilioConfigured, TWILIO_AUTH_TOKEN } from "./config";
import { readLeads, upsertSmsLead } from "./leads-store";
import {
  qualifyMessage,
  pickReply,
  twimlReply,
  normalizePhone,
  mergeScores,
} from "./sms";
import type { SmsMessage } from "./leads";

/** The canonical webhook path on the published site (route: /api/sms). */
export const SMS_WEBHOOK_PATH = "/api/sms";

/** Fields Twilio POSTs (form-encoded) on an inbound SMS webhook. */
export type TwilioInboundSms = {
  from: string; // sender number (E.164)
  body: string; // message text
  to?: string; // our Twilio number
  messageSid?: string; // unique id — used to dedupe webhook retries
  /** The raw form entries exactly as Twilio sent them (used for
   *  X-Twilio-Signature verification, which hashes the original keys). */
  rawParams: Record<string, string>;
};

export type SmsWebhookResult = {
  reply: string; // the text we reply with (returned in-band via TwiML)
  twiml: string;
  leadCreated: boolean;
  deduped: boolean;
};

/** Parse a Twilio inbound-SMS request (POST form body or GET query). */
export async function parseSmsRequest(request: Request): Promise<TwilioInboundSms> {
  const url = new URL(request.url);
  let values: Record<string, string> = {};
  if (request.method === "GET") {
    for (const [k, v] of url.searchParams.entries()) values[k] = v;
  } else {
    // Twilio uses application/x-www-form-urlencoded; request.formData()
    // also handles multipart/form-data if a provider ever sends that.
    const form = await request.formData();
    for (const [k, v] of form.entries()) {
      if (typeof v === "string") values[k] = v;
    }
  }
  return {
    from: values.From ?? "",
    body: values.Body ?? "",
    to: values.To ?? "",
    messageSid: values.MessageSid ?? undefined,
    rawParams: values,
  };
}

/**
 * Verify Twilio's X-Twilio-Signature (HMAC-SHA1 over the canonical URL
 * + sorted params). Only enforced when TWILIO_AUTH_TOKEN is configured —
 * without credentials the endpoint stays live-but-dormant and accepts
 * unverified requests (fine for v1: the payload only writes leads).
 */
export function isSignatureValid(
  request: Request,
  params: Record<string, string>,
  signature: string | null
): boolean {
  // Not configured → skip the check entirely (endpoint stays live-but-dormant).
  if (!TWILIO_AUTH_TOKEN) return true;
  if (!signature) return false;
  const canonical = new URL(request.url);
  canonical.search = ""; // Twilio hashes the URL *without* the query string
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  const digest = createHmac("sha1", TWILIO_AUTH_TOKEN)
    .update(canonical.toString() + sorted)
    .digest();
  const provided = Buffer.from(signature, "base64");
  return (
    digest.length === provided.length && timingSafeEqual(digest, provided)
  );
}

/**
 * Handle one inbound SMS end-to-end:
 *   1. Dedupe Twilio webhook retries by MessageSid (same sid → replay the
 *      last outbound reply, write nothing).
 *   2. Qualify the message (rule-based hot/warm/cold + job-type detection).
 *   3. Upsert the lead by phone (first contact creates; later messages
 *      update the same lead's conversation log).
 *   4. Log both the inbound text and our reply on the lead.
 * The reply is returned in-band as the webhook's HTTP response (v1); the
 * REST outbound helper exists for when creds are set (see sms-outbound.ts).
 */
export async function handleInboundSms(msg: TwilioInboundSms): Promise<SmsWebhookResult> {
  const now = new Date().toISOString();
  const from = normalizePhone(msg.from);
  const body = (msg.body ?? "").trim();

  // Defensive: no sender or empty body → acknowledge quietly, no lead.
  if (!from || !body) {
    const reply = pickReply(true);
    return { reply, twiml: twimlReply(reply), leadCreated: false, deduped: true };
  }

  // Twilio retries webhooks that time out / 5xx with the SAME MessageSid —
  // dedupe so a retry never double-writes or double-replies.
  const existing = (await readLeads()).find(
    (l) => l.phone && normalizePhone(l.phone) === from
  );
  const sid = msg.messageSid;
  if (sid && existing?.messages?.some((m) => m.messageSid === sid)) {
    const lastOutbound = [...(existing.messages ?? [])]
      .reverse()
      .find((m) => m.direction === "outbound");
    const reply = lastOutbound?.body ?? pickReply(false);
    return { reply, twiml: twimlReply(reply), leadCreated: false, deduped: true };
  }

  const qualified = qualifyMessage(body);
  const isFirstContact = !existing;
  const reply = pickReply(isFirstContact);
  // Score is the conversation max — never downgrade an earlier emergency.
  const score = mergeScores(
    (existing?.score as "hot" | "warm" | "cold" | undefined) ?? null,
    qualified.score
  );

  const inbound: SmsMessage = { direction: "inbound", body, at: now, messageSid: sid };
  const outbound: SmsMessage = { direction: "outbound", body: reply, at: now };

  const { isNew } = await upsertSmsLead({
    phone: msg.from,
    inbound,
    outbound,
    score,
    businessType: qualified.businessType,
  });

  return {
    reply,
    twiml: twimlReply(reply),
    leadCreated: isNew,
    deduped: false,
  };
}

/** Build the HTTP response Twilio expects: 200 + TwiML. */
export function webhookResponse(result: SmsWebhookResult): Response {
  return new Response(result.twiml, {
    status: 200,
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

/** Human-readable status for GET/health checks on the webhook URL. */
export function webhookInfoResponse(): Response {
  const configured = twilioConfigured();
  return new Response(
    `M&P SMS agent webhook is live. Twilio REST credentials: ${
      configured ? "configured" : "not yet configured (live-but-dormant — replies are returned in-band via TwiML)"
    }.`,
    { status: 200, headers: { "Content-Type": "text/plain; charset=utf-8" } }
  );
}
