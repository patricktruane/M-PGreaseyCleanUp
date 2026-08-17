/* Client-safe lead types & constants — no server imports here so this module
 * can be bundled for the browser. The file storage lives in leads-store.ts
 * (server-only; import it only from createServerFn handlers). */

export const STATUSES = ["New", "Contacted", "Qualified", "Booked"] as const;
export type LeadStatus = (typeof STATUSES)[number];

/** Where a lead came in from. Existing entries without a source default to "early-access". */
export const LEAD_SOURCES = ["early-access", "quote"] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

/** Services offered on the business-site quote form. */
export const QUOTE_SERVICES = [
  "Commercial Kitchen Degreasing",
  "Grease Trap & Interceptor Cleaning",
  "Exhaust Hood & Duct Cleaning",
  "Industrial Surface Degreasing",
  "Pressure Washing",
  "Scheduled Maintenance Plans",
  "Other",
] as const;

export type Lead = {
  id: string;
  name: string;
  businessType: string;
  phone: string;
  email: string;
  message: string;
  createdAt: string;
  status?: string;
  /* Optional fields (backward compatible — old leads simply won't have them). */
  source?: string; // "early-access" | "quote" (default "early-access" for existing entries)
  service?: string; // quote leads: service requested
  company?: string; // quote leads: company name (optional)
};
