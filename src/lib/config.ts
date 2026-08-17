/* ------------------------------------------------------------------ */
/* /dashboard passcode                                                 */
/* ------------------------------------------------------------------ */
// The dashboard is server-gated: every read of lead data requires this
// passcode, so the public site can never expose leads without it.
//
// HOW TO CHANGE IT:
//   1. Edit the default below, OR
//   2. Set the DASHBOARD_PASSCODE environment variable before running
//      `bun run publish` — the running server reads process.env at startup
//      and the env var wins over the default. (e.g.
//      `DASHBOARD_PASSCODE=my-code bun run publish`)
//
// Default (memorable): grease-2026
export const DASHBOARD_PASSCODE: string =
  process.env.DASHBOARD_PASSCODE || "grease-2026";
