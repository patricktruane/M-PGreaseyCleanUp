/* ------------------------------------------------------------------ */
/* Leads dashboard — server-gated reads.                                */
/*                                                                     */
/* Every read of lead data requires the passcode, so a wrong (or       */
/* missing) code can never pull lead data out of the server, even with */
/* the page open. The passcode lives only in lib/config.ts (env-first) */
/* and is never bundled to the client.                                 */
/* ------------------------------------------------------------------ */
import { readLeads } from "~/lib/leads-store";
import { DASHBOARD_PASSCODE } from "~/lib/config";

type GateResult = { ok: true; leads: unknown[] } | { ok: false; error: string };

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    passcode?: string;
  } | null;
  if (body?.passcode !== DASHBOARD_PASSCODE) {
    return Response.json({ ok: false, error: "That passcode isn't right. Try again." });
  }
  try {
    return Response.json({ ok: true, leads: await readLeads() } satisfies GateResult);
  } catch (err) {
    console.error("fetchLeads error:", err);
    return Response.json({ ok: false, error: "Couldn't load leads — please try again." });
  }
}
