/* ------------------------------------------------------------------ */
/* SMS agent — pure logic (client-safe: no node:* imports)             */
/* ------------------------------------------------------------------ */
// Everything here is deterministic and dependency-free so the webhook,
// tests, and any future UI share one implementation. The server-only IO
// (leads store, Twilio REST) lives in sms-handler.ts / sms-outbound.ts.
//
// ── RULE-BASED QUALIFICATION (v1 — no LLM, no API key) ───────────────
// Inbound text is lowercased and matched as substrings against the
// keyword tables below. Tiers:
//   hot  — any URGENCY keyword (emergency, leak, flood, fire, broken,
//          no heat / no AC, burst, sewer, …). Someone needs help now.
//   warm — no urgency, but a job type and/or booking intent (quote,
//          price, schedule, available…) was detected. Real, actionable lead.
//   cold — nothing matched. First-contact bounces land here until the
//          caller says something meaningful.
// businessType — the trade with the most keyword hits wins; ties are
//   broken by the priority order below (Grease & cleanup first because
//   it is M&P's own trade and the launch customer's inbound line).
// ─────────────────────────────────────────────────────────────────────

import type { LeadScore } from "./leads";

/** Urgency signals → hot. Matched as substrings on the lowercased text. */
export const URGENCY_KEYWORDS = [
  "emergency",
  "urgent",
  "asap",
  "as soon as possible",
  "right away",
  "immediately",
  "leak",
  "leaking",
  "burst",
  "flood",
  "flooding",
  "overflow",
  "overflowing",
  "fire",
  "smoke",
  "burning",
  "sparking",
  "broken",
  "not working",
  "no heat",
  "no hot water",
  "no ac",
  "no cooling",
  "no a/c",
  "sewage",
  "sewer backup",
  "smell gas",
  "water damage",
] as const;

/** Booking/readiness intent → warm when no urgency keyword matched. */
export const BOOKING_KEYWORDS = [
  "quote",
  "price",
  "pricing",
  "cost",
  "estimate",
  "book",
  "booking",
  "schedule",
  "appointment",
  "available",
  "availability",
  "today",
  "tomorrow",
  "free",
  "can you come",
  "need help",
] as const;

/** Job-type detection → businessType. Each keyword list is weighted:
 *  `strong` anchors are worth 2 points (unambiguous trade signals such as
 *  "roof" or "toilet"), `weak` matches are worth 1 ("leak" could be
 *  plumbing, roofing or HVAC depending on context — it stays a 1-pointer
 *  so the anchor wins when the caller is specific). The trade with the
 *  most points wins. */
export const JOB_TYPE_KEYWORDS: Record<
  string,
  { strong: readonly string[]; weak: readonly string[] }
> = {
  Roofing: {
    strong: ["roof", "roofing", "shingle", "shingles", "gutter", "gutters", "chimney"],
    weak: ["siding", "roof leak"],
  },
  Plumbing: {
    strong: [
      "toilet",
      "drain",
      "clog",
      "clogged",
      "burst",
      "sewage",
      "sewer",
      "septic",
      "water heater",
      "garbage disposal",
      "faucet",
      "water pressure",
    ],
    weak: ["plumb", "plumbing", "pipe", "pipes", "sink", "leak", "leaking", "backed up"],
  },
  HVAC: {
    strong: ["furnace", "no heat", "no ac", "no a/c", "no cooling", "boiler", "thermostat"],
    weak: ["hvac", "heat", "heating", "ac", "a/c", "air conditioning", "cooling", "vent"],
  },
  Landscaping: {
    strong: ["lawn", "mow", "mowing", "sprinkler", "irrigation", "snow removal", "snow plow"],
    weak: ["landscap", "tree", "trees", "mulch", "sod", "yard"],
  },
  "Grease & cleanup": {
    strong: [
      "grease",
      "degreas",
      "hood",
      "trap",
      "interceptor",
      "restaurant",
      "kitchen",
      "fryer",
      "commercial kitchen",
      "vent hood",
      "pressure wash",
      "deep clean",
    ],
    weak: ["cafe", "diner", "exhaust", "grill", "food service"],
  },
};

/** Tie-break order when two trades score equally (M&P's trade first). */
export const JOB_TYPE_PRIORITY: readonly string[] = [
  "Grease & cleanup",
  "Plumbing",
  "HVAC",
  "Roofing",
  "Landscaping",
];

/** Instant-reply copy (product spec). First contact opens the
 *  conversation; follow-ups get a short human ack. No fake promises
 *  of email or automated channels. */
export const REPLY_FIRST_CONTACT =
  "Hey, sorry we missed your call — what can we help you with?";
export const REPLY_FOLLOW_UP = "Got it, thanks — we'll get back to you shortly.";

export type SmsQualification = {
  score: LeadScore;
  businessType: string; // detected trade, or "" when unknown
  urgencyHits: string[];
  jobTypeHits: string[];
  bookingHits: string[];
};

/** Normalize a phone number for lead-key matching: keep digits and a
 *  leading "+", drop everything else. Twilio sends E.164, so this is
 *  mostly defensive. */
export function normalizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, "");
}

/** Keywords from `candidates` that appear in `text`, deduped so that a
 *  word never double-counts via a shorter substring ("leaking" matching
 *  both "leak" and "leaking" would otherwise inflate a trade's score). */
function matchedKeywords(candidates: readonly string[], text: string): string[] {
  const found = candidates.filter((k) => text.includes(k));
  return found.filter((k) => !found.some((other) => other.length > k.length && other.includes(k)));
}

/** Rule-based qualification of one inbound message (see rules at top). */
export function qualifyMessage(text: string): SmsQualification {
  const t = text.toLowerCase();
  const urgencyHits = URGENCY_KEYWORDS.filter((k) => t.includes(k));
  const bookingHits = BOOKING_KEYWORDS.filter((k) => t.includes(k));

  // Job-type detection: score each trade by weighted keyword hits
  // (strong = 2 points, weak = 1); most points wins, ties break by
  // JOB_TYPE_PRIORITY.
  const points = new Map<string, number>();
  for (const [trade, { strong, weak }] of Object.entries(JOB_TYPE_KEYWORDS)) {
    const strongHits = matchedKeywords(strong, t);
    const weakHits = matchedKeywords(weak, t);
    const n = strongHits.length * 2 + weakHits.length;
    if (n > 0) points.set(trade, n);
  }
  const jobTypeHits = [...points.keys()];
  let businessType = "";
  let best = 0;
  for (const trade of JOB_TYPE_PRIORITY) {
    const n = points.get(trade) ?? 0;
    if (n > best) {
      best = n;
      businessType = trade;
    }
  }

  const score: LeadScore =
    urgencyHits.length > 0
      ? "hot"
      : jobTypeHits.length > 0 || bookingHits.length > 0
        ? "warm"
        : "cold";

  return { score, businessType, urgencyHits, jobTypeHits, bookingHits };
}

/** Pick the reply for an inbound message: first contact vs follow-up. */
export function pickReply(isFirstContact: boolean): string {
  return isFirstContact ? REPLY_FIRST_CONTACT : REPLY_FOLLOW_UP;
}

/** Merge two scores, keeping the hotter one (an emergency stated earlier
 *  must not downgrade because a follow-up question lacks urgency words). */
export function mergeScores(a: LeadScore | null | undefined, b: LeadScore): LeadScore {
  if (!a) return b;
  const rank: Record<LeadScore, number> = { hot: 3, warm: 2, cold: 1 };
  return rank[a] >= rank[b] ? a : b;
}

/** TwiML envelope Twilio uses to send the reply SMS. */
export function twimlReply(body: string): string {
  const escaped = body.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<Response><Message>${escaped}</Message></Response>`;
}
