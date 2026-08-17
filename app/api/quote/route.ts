/* ------------------------------------------------------------------ */
/* Quote-request form submission — POST /api/quote                      */
/*                                                                     */
/* MVP storage: data/leads.json, written through the shared serialized  */
/* queue in ~/lib/leads-store (same write pattern the early-access form */
/* and dashboard use). Quote leads land in the same store as early-     */
/* access leads, so they show up in the /dashboard leads dashboard with */
/* source "quote" + status "New". SITE.md documents the path to a real  */
/* database (Neon via DATABASE_URL) before traffic is meaningful.       */
/* ------------------------------------------------------------------ */
import { appendLead } from "~/lib/leads-store";
import { QUOTE_SERVICES } from "~/lib/leads";

type QuoteSubmission = {
  name: string;
  company: string;
  phone: string;
  service: string;
  siteDetails: string;
};

export async function POST(request: Request) {
  try {
    const data = (await request.json().catch(() => null)) as
      | QuoteSubmission
      | null;
    const name = String(data?.name ?? "").trim();
    const company = String(data?.company ?? "").trim();
    const phone = String(data?.phone ?? "").trim();
    const service = String(data?.service ?? "").trim();
    const siteDetails = String(data?.siteDetails ?? "").trim();

    if (!name) return Response.json({ ok: false, error: "Please enter your name." });
    if (!phone)
      return Response.json({
        ok: false,
        error: "Add a phone number so the crew can call you back.",
      });
    if (!service || !(QUOTE_SERVICES as readonly string[]).includes(service))
      return Response.json({ ok: false, error: "Please pick the service you need." });
    if (
      name.length > 120 ||
      company.length > 120 ||
      phone.length > 40 ||
      service.length > 80 ||
      siteDetails.length > 2000
    ) {
      return Response.json({
        ok: false,
        error: "One of the fields is too long — please shorten it and try again.",
      });
    }

    await appendLead({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      businessType: "Grease & cleanup",
      phone,
      email: "",
      message: siteDetails,
      createdAt: new Date().toISOString(),
      status: "New",
      source: "quote",
      service,
      company: company || undefined,
    });

    return Response.json({ ok: true });
  } catch (err) {
    console.error("quote submit error:", err);
    return Response.json(
      { ok: false, error: "Something went wrong on our end — please try again." },
      { status: 500 }
    );
  }
}
