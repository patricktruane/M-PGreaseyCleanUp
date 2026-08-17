/* ------------------------------------------------------------------ */
/* Leads dashboard — status updates.                                    */
/*                                                                     */
/* Same server-gating as /api/dashboard/leads: the passcode is checked  */
/* on every write too, and only the four pipeline statuses are allowed. */
/* Resolves with the full updated lead list so the client can re-render */
/* in one round-trip.                                                   */
/* ------------------------------------------------------------------ */
import { setLeadStatus } from "~/lib/leads-store";
import { STATUSES } from "~/lib/leads";
import { DASHBOARD_PASSCODE } from "~/lib/config";

type GateResult = { ok: true; leads: unknown[] } | { ok: false; error: string };

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    passcode?: string;
    id?: string;
    status?: string;
  } | null;
  if (body?.passcode !== DASHBOARD_PASSCODE) {
    return Response.json({ ok: false, error: "That passcode isn't right. Try again." });
  }
  if (!body?.id || !STATUSES.includes(body.status as (typeof STATUSES)[number])) {
    return Response.json({ ok: false, error: "Invalid status." });
  }
  try {
    const leads = await setLeadStatus(body.id, body.status as string);
    return Response.json({ ok: true, leads } satisfies GateResult);
  } catch (err) {
    console.error("updateStatus error:", err);
    return Response.json({ ok: false, error: "Couldn't save the status — please try again." });
  }
}
