/* ------------------------------------------------------------------ */
/* Early-access form submission — POST /api/early-access                */
/*                                                                     */
/* MVP storage: data/leads.json, written through the shared serialized  */
/* queue in ~/lib/leads-store (same write pattern the quote form and    */
/* dashboard use, so concurrent submissions and status updates can't    */
/* corrupt the file). These submissions are tagged source               */
/* "early-access" so the dashboard can tell them apart from business-   */
/* site quote requests.                                                 */
/* ------------------------------------------------------------------ */
import { appendLead } from "~/lib/leads-store";

type LeadSubmission = {
  name: string;
  businessType: string;
  phone: string;
  email: string;
  message: string;
};

export async function POST(request: Request) {
  try {
    const data = (await request.json().catch(() => null)) as
      | LeadSubmission
      | null;
    const name = String(data?.name ?? "").trim();
    const businessType = String(data?.businessType ?? "").trim();
    const phone = String(data?.phone ?? "").trim();
    const email = String(data?.email ?? "").trim();
    const message = String(data?.message ?? "").trim();

    if (!name) return Response.json({ ok: false, error: "Please enter your name." });
    if (!phone && !email)
      return Response.json({
        ok: false,
        error: "Add a phone number or email so we know how to reach you.",
      });
    if (
      name.length > 120 ||
      businessType.length > 120 ||
      phone.length > 40 ||
      email.length > 200 ||
      message.length > 2000
    ) {
      return Response.json({
        ok: false,
        error: "One of the fields is too long — please shorten it and try again.",
      });
    }

    await appendLead({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      businessType,
      phone,
      email,
      message,
      createdAt: new Date().toISOString(),
      source: "early-access",
    });

    return Response.json({ ok: true });
  } catch (err) {
    console.error("early-access submit error:", err);
    return Response.json(
      { ok: false, error: "Something went wrong on our end — please try again." },
      { status: 500 }
    );
  }
}
