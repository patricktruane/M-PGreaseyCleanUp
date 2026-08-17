import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Lead } from "./leads";

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
  };
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
