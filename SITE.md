# Your site

This is the team's website. It's a [Next.js](https://nextjs.org) (App Router)
app (React + Tailwind CSS v4), served on **port 3000** via `next start`. It's the
real M & P Greasey Clean Up business site plus the AI Growth Assistant product
pages — see **Routes** below.

Migrated from TanStack Start to Next.js (owner direction, 2026-08-17): all
existing pages and ALL future builds use Next.js.

## Layout

```
app/
  layout.tsx            # HTML shell: metadata, Inter font, globals.css
  page.tsx              # "/" — M&P business home (renders components/home.tsx)
  product/page.tsx      # /product — AI Growth Assistant pitch
  ideas/page.tsx        # /ideas — content ideation engine
  dashboard/page.tsx    # /dashboard — passcode-gated leads dashboard
  api/sms/route.ts      # /api/sms — Twilio SMS webhook (POST) + health check (GET)
  api/quote/route.ts    # POST /api/quote — quote request form → leads store
  api/early-access/route.ts  # POST — early-access form → leads store
  api/dashboard/leads/route.ts   # POST { passcode } → leads (server-gated)
  api/dashboard/status/route.ts  # POST { passcode, id, status } → update status
  globals.css           # Tailwind entrypoint + base styles
components/
  home.tsx              # "use client" — full home page (interactive forms/slider)
  product.tsx           # "use client"
  ideas.tsx             # "use client"
  dashboard.tsx         # "use client"
lib/
  leads.ts              # client-safe lead types/constants (no node:* imports)
  leads-store.ts        # SERVER-ONLY data/leads.json storage (serialized queue)
  config.ts             # env-first config (DASHBOARD_PASSCODE, TWILIO_*)
  sms.ts                # pure SMS qualification rules (client-safe)
  sms-handler.ts        # server-only webhook logic (signature check, upsert)
  sms-outbound.ts       # dormant Twilio REST helper (needs creds)
  ideas-data.ts         # content engine: 162 templates + generateWeek()
  db.ts                 # server-only Neon helper (DATABASE_URL) — unused today
```

Add a page by creating a file under `app/` — e.g. `app/about/page.tsx` becomes
`/about`. Anything interactive gets a `"use client"` component (see
`components/`); server pages can export `metadata` for per-page titles/OG.

## Serving and shipping

The public surface is **port 3000** — the platform reverse-proxies the
published preview URL to `0.0.0.0:3000` inside the sandbox, so the server MUST
bind there.

- `bun run dev` — Next dev server on port 3000.
- `bun run build` — `next build` (production build into `.next/`).
- `bun run start` — `next start -H 0.0.0.0 -p 3000` (production server).
- `bun run publish` — `bash publish.sh`: install → build → free port 3000 →
  start detached. Safe to re-run; server log in `.run/server.log`.

To test a build without touching the live site, run
`bunx next start -H 127.0.0.1 -p 3001` after a build (or `next dev -p 3001`).

## Leads storage

Leads (quote requests, early-access signups, SMS conversations) are stored in
`data/leads.json` (gitignored) via `lib/leads-store.ts` — the single owner of
the file, with all writes serialized through one queue so concurrent form
submissions and dashboard status updates can't corrupt it.

**MVP stopgap — migrate to a real database before traffic is meaningful:**
connect a serverless Postgres (Neon) via the database card; `DATABASE_URL` is
injected automatically and passed to the live host. Query it from route handlers
only, never client code — see `lib/db.ts`:

```ts
import { sql } from "~/lib/db";
// Inside a route handler:
const rows = await sql()`select id, title, created_at from leads`;
// Coerce non-primitive columns (timestamps are JS Dates) to strings before
// returning to the client, or React will refuse to render them:
return rows.map((r) => ({ ...r, created_at: String(r.created_at) }));
```

One database serves both the preview and the live site.

## Config (env-first)

`lib/config.ts` reads env at process start; defaults apply when unset:

- `DASHBOARD_PASSCODE` — default `grease-2026` (dashboard is server-gated on
  every read; the passcode never ships to the client bundle).
- `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_PHONE_NUMBER` — SMS agent
  creds. The webhook is live-but-dormant without them: it still replies via
  TwiML and captures leads; only REST outbound and signature verification wait
  for creds.

Set them before `bun run publish` (e.g.
`DASHBOARD_PASSCODE=my-code bun run publish`) — the running server reads env at
startup. Never hardcode them.
