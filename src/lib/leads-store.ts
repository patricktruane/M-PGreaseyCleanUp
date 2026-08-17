import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Lead, SmsMessage } from "./leads";

/* ------------------------------------------------------------------ */
/* Server-only lead storage: data/leads.json                           */
/* ------------------------------------------------------------------ */
// MVP stopgap — SITE.md documents migrating to a real database (Neon via
// DATABASE_URL) before traffic is meaningful. This module is the single owner
// of the file. Every write goes through one serialized queue (the same pattern
// the early-access form originally used) so concurrent form submissions and
// dashboard status updates can't interleave read-modify-write cycles and
// corrupt the file.
//
// SERVER-ONLY: import this module only from createServerFn handlers (never
// from client-rendered components) — the client bundle drops it.

const DATA_FILE = path.resolve(process.cwd(), "data", "leads.json");

// Serialize all writes through one queue.
let writeQueue: Promise<void> = Promise.resolve();

/** Read all leads. Tolerant of missing/corrupt file. */
export async function readLeads(): Promise<Lead[]> {
  try {
    const parsed: unknown = JSON.parse(await readFile(DATA_FILE, "utf8"));
    if (Array.isArray(parsed)) {
      return parsed
        .map((e) => normalizeLead(e))
        .filter((e): e is Lead => e !== null);
    }
  } catch {
    // Missing or unparseable file -> no leads yet.
  }
  return [];
}

function normalizeLead(raw: unknown): Lead | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== "string" || typeof r.name !== "string") return null;
  return {
    id: r.id,
    name: r.name,
    businessType: typeof r.businessType === "string" ? r.businessType : "",
    phone: typeof r.phone === "string" ? r.phone : "",
    email: typeof r.email === "string" ? r.email : "",
    message: typeof r.message === "string" ? r.message : "",
    createdAt:
      typeof r.createdAt === "string" ? r.createdAt : new Date(0).toISOString(),
    status: typeof r.status === "string" ? r.status : undefined,
    // Backward compatible: old entries have no source — treat them as
    // early-access. New optional fields are kept only when present.
    source:
      typeof r.source === "string" && r.source.trim() ? r.source : "early-access",
    service: typeof r.service === "string" ? r.service : undefined,
    company: typeof r.company === "string" ? r.company : undefined,
    // SMS agent fields — kept only when present (backward compatible).
    score: typeof r.score === "string" ? r.score : undefined,
    messages: Array.isArray(r.messages) ? r.messages.filter(isSmsMessage) : undefined,
  };
}

function isSmsMessage(m: unknown): m is SmsMessage {
  if (!m || typeof m !== "object") return false;
  const r = m as Record<string, unknown>;
  return (
    (r.direction === "inbound" || r.direction === "outbound") &&
    typeof r.body === "string" &&
    typeof r.at === "string"
  );
}

function enqueueWrite(mutator: (leads: Lead[]) => Lead[]): Promise<Lead[] | null> {
  let result: Lead[] | null = null;
  const run = async () => {
    await mkdir(path.dirname(DATA_FILE), { recursive: true });
    const leads = await readLeads();
    const next = mutator(leads);
    result = next;
    await writeFile(DATA_FILE, JSON.stringify(next, null, 2) + "\n", "utf8");
  };
  // Chain regardless of the previous write's outcome so one failure can't
  // permanently wedge the queue.
  writeQueue = writeQueue.then(run, run);
  return writeQueue.then(() => result);
}

/** Append a lead (used by the early-access form). */
export function appendLead(entry: Lead): Promise<void> {
  return enqueueWrite((leads) => [...leads, entry]).then(() => undefined);
}

/** Set a lead's pipeline status; resolves with the full updated list. */
export function setLeadStatus(id: string, status: string): Promise<Lead[]> {
  return enqueueWrite((leads) =>
    leads.map((l) => (l.id === id ? { ...l, status } : l))
  ).then((updated) => updated ?? []);
}

/* ------------------------------------------------------------------ */
/* SMS conversations                                                   */
/* ------------------------------------------------------------------ */

export type UpsertSmsResult = {
  lead: Lead | null;
  /** True when the phone number had no lead yet (first contact). */
  isNew: boolean;
};

/**
 * Upsert a lead by phone for an inbound SMS + the reply we're sending.
 * First contact creates the lead (source "sms", status "New"); later
 * messages from the same number update that lead's conversation — never
 * duplicate. Both the inbound text and the outbound reply are appended to
 * the lead's `messages` log. Runs through the same serialized write queue
 * as every other write, so concurrent form submissions can't corrupt the
 * file. Callers must pass the outbound message only when the inbound was
 * actually processed (webhook-retry dedupe by MessageSid happens before
 * this is called — see sms-handler.ts).
 */
export function upsertSmsLead(input: {
  phone: string; // E.164 From number — the lead key
  inbound: SmsMessage;
  outbound: SmsMessage;
  score: string; // hot | warm | cold
  businessType: string; // detected trade or ""
}): Promise<UpsertSmsResult> {
  const norm = (p: string) => p.replace(/[^\d+]/g, "");
  const key = norm(input.phone);
  let isNew = false;

  return enqueueWrite((leads) => {
    const idx = leads.findIndex((l) => l.phone && norm(l.phone) === key);
    if (idx >= 0) {
      const existing = leads[idx];
      const updated: Lead = {
        ...existing,
        phone: input.phone,
        message: input.inbound.body,
        score: input.score,
        businessType: input.businessType || existing.businessType,
        messages: [...(existing.messages ?? []), input.inbound, input.outbound],
      };
      return leads.map((l) => (l === existing ? updated : l));
    }
    isNew = true;
    const created: Lead = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: "",
      businessType: input.businessType,
      phone: input.phone,
      email: "",
      message: input.inbound.body,
      createdAt: input.inbound.at,
      status: "New",
      source: "sms",
      score: input.score,
      messages: [input.inbound, input.outbound],
    };
    return [...leads, created];
  }).then((next) => {
    const list = next ?? [];
    const lead = list.find((l) => l.phone && norm(l.phone) === key) ?? null;
    return { lead, isNew };
  });
}
