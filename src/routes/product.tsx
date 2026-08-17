import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { appendLead } from "~/lib/leads-store";

/* ------------------------------------------------------------------ */
/* Server: early-access form submission                                */
/* ------------------------------------------------------------------ */

type LeadSubmission = {
  name: string;
  businessType: string;
  phone: string;
  email: string;
  message: string;
};

// MVP storage: data/leads.json, written through the shared serialized queue in
// ~/lib/leads-store (same write pattern the dashboard uses, so concurrent form
// submissions and status updates can't corrupt the file). SITE.md documents the
// path to a real database (Neon via DATABASE_URL) — migrate before traffic is
// meaningful. These submissions are tagged source "early-access" so the
// dashboard can tell them apart from business-site quote requests.

type SubmitResult = { ok: boolean; error?: string };

const submitLead = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as LeadSubmission)
  .handler(async ({ data }): Promise<SubmitResult> => {
    try {
      return await doSubmit(data);
    } catch (err) {
      console.error("submitLead error:", err);
      return { ok: false, error: "Something went wrong on our end — please try again." };
    }
  });

async function doSubmit(raw: LeadSubmission): Promise<SubmitResult> {
    const name = String(raw?.name ?? "").trim();
    const businessType = String(raw?.businessType ?? "").trim();
    const phone = String(raw?.phone ?? "").trim();
    const email = String(raw?.email ?? "").trim();
    const message = String(raw?.message ?? "").trim();

    if (!name) return { ok: false, error: "Please enter your name." };
    if (!phone && !email)
      return {
        ok: false,
        error: "Add a phone number or email so we know how to reach you.",
      };
    if (
      name.length > 120 ||
      businessType.length > 120 ||
      phone.length > 40 ||
      email.length > 200 ||
      message.length > 2000
    ) {
      return { ok: false, error: "One of the fields is too long — please shorten it and try again." };
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

    return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Route                                                               */
/* ------------------------------------------------------------------ */

export const Route = createFileRoute("/product")({
  head: () => ({
    meta: [
      {
        title: "M&P Growth Assistant — Never Miss a Lead. Book More Jobs.",
      },
    ],
  }),
  component: Product,
});

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */

function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20 ${className}`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-5 w-5" aria-hidden="true">
        <path d="M12 2 3 7v10l9 5 9-5V7l-9-5Z" strokeLinejoin="round" />
        <path d="M12 22V12" strokeLinejoin="round" />
        <path d="M3 7l9 5 9-5" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function CheckIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={className} aria-hidden="true">
      <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type Feature = {
  title: string;
  body: string;
  icon: ReactNode;
};

const featureIconProps = {
  className: "h-6 w-6",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const FEATURES: Feature[] = [
  {
    title: "Instant SMS responses",
    body: "Missed a call? The AI texts back in seconds: \u201CHey, sorry we missed your call \u2014 what can we help you with?\u201D Then it follows up at 1 hour, 24 hours, and 3 days until the lead responds \u2014 qualifying job type, urgency, location, and budget by text.",
    icon: (
      <svg viewBox="0 0 24 24" {...featureIconProps}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <path d="M8 9h8M8 13h5" />
      </svg>
    ),
  },
  {
    title: "AI lead qualification & pipeline",
    body: "Every lead is auto-tagged hot / warm / cold and summarized in one line. High-value leads alert you the moment they come in, and a simple CRM dashboard keeps the whole pipeline in one place.",
    icon: (
      <svg viewBox="0 0 24 24" {...featureIconProps}>
        <path d="M3 3v18h18" />
        <path d="m7 15 4-5 3 3 5-7" />
      </svg>
    ),
  },
  {
    title: "Smart follow-up system",
    body: "Estimate follow-ups, \u201Cstill interested?\u201D reactivation, no-show rescheduling \u2014 with AI-personalized messages that don\u2019t sound robotic.",
    icon: (
      <svg viewBox="0 0 24 24" {...featureIconProps}>
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M12 7v5l3 3" />
      </svg>
    ),
  },
  {
    title: "Booking & calendar automation",
    body: "The AI offers time slots by text, syncs with Google Calendar, auto-confirms bookings, and sends 24-hour and 2-hour reminders \u2014 so the right jobs land on the calendar and no-shows shrink.",
    icon: (
      <svg viewBox="0 0 24 24" {...featureIconProps}>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
        <path d="m9 16 2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Estimate & job-start automation",
    body: "Confirmation right after booking, a \u201Cwant to move forward?\u201D nudge after every estimate, and job-start confirmations that set expectations before the crew arrives.",
    icon: (
      <svg viewBox="0 0 24 24" {...featureIconProps}>
        <path d="M14 3v4a1 1 0 0 0 1 1h4" />
        <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" />
        <path d="m9 13 2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Content ideation engine",
    body: "Weekly ideas for Instagram Reels, Facebook posts, and your Google Business Profile \u2014 tailored to your trade and local market, with hooks, captions, and CTAs ready to post.",
    icon: (
      <svg viewBox="0 0 24 24" {...featureIconProps}>
        <path d="m12 3 1.9 5.7a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3Z" />
        <path d="M19 3v4M17 5h4" />
      </svg>
    ),
  },
  {
    title: "Simple dashboard",
    body: "Leads, conversations, bookings, revenue pipeline, and missed opportunities \u2014 all visible at a glance, without a spreadsheet in sight.",
    icon: (
      <svg viewBox="0 0 24 24" {...featureIconProps}>
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
      </svg>
    ),
  },
];

const OUTCOMES: { title: string; body: string }[] = [
  { title: "Capture every lead", body: "Missed calls, texts, and messages all get answered \u2014 nothing slips through." },
  { title: "Instantly follow up via SMS", body: "The AI replies in seconds, while the job is still on their mind." },
  { title: "Automatically book qualified appointments", body: "Good leads get time slots and confirmations without you touching the phone." },
  { title: "Nurture leads until they convert", body: "Estimates, reactivation, reminders \u2014 follow-up that actually happens." },
  { title: "Generate content to attract new leads", body: "Weekly post ideas for Reels, Facebook, and your Google profile." },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "Do I have to change my phone number?",
    a: "No \u2014 keep your number. Missed calls are detected automatically and followed up by text, all through your existing line.",
  },
  {
    q: "How long does setup take?",
    a: "Days, not months. Connect your phone number and calendar, and the AI starts handling follow-ups the same week.",
  },
  {
    q: "Will my customers know it's an AI?",
    a: "Messages are personalized and human-sounding, and any customer can ask to talk to a real person any time.",
  },
  {
    q: "What does early access involve?",
    a: "Tell us about your business and we'll reach out to get you set up as an early customer \u2014 with direct access to our team while we build.",
  },
];

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

function Product() {
  return (
    <div className="min-h-dvh bg-white text-slate-900">
      <Nav />
      <Hero />
      <Outcomes />
      <Features />
      <Integrations />
      <LaunchBand />
      <Faq />
      <EarlyAccess />
      <Footer />
    </div>
  );
}

/* Nav ------------------------------------------------------------------ */

function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* small link back to the M&P business site */}
      <div className="border-b border-white/10 bg-slate-900/95 backdrop-blur">
        <div className="mx-auto flex h-8 max-w-6xl items-center justify-between px-5">
          <a
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 transition hover:text-amber-300"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-3.5 w-3.5" aria-hidden="true">
              <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            M &amp; P Greasey Clean Up Inc — business site
          </a>
          <span className="hidden text-[11px] font-medium uppercase tracking-wider text-slate-500 sm:block">
            AI Growth Assistant
          </span>
        </div>
      </div>
      <div className="border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
          <a href="#top" className="flex items-center gap-3">
            <LogoMark />
            <div className="leading-tight">
              <div className="text-sm font-bold tracking-tight text-white">M&amp;P Growth Assistant</div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                For local service businesses
              </div>
            </div>
          </a>
          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-300 md:flex">
            <a href="#outcomes" className="transition hover:text-white">Why</a>
            <a href="#features" className="transition hover:text-white">What it does</a>
            <a href="#faq" className="transition hover:text-white">FAQ</a>
            <a
              href="#early-access"
              className="rounded-lg bg-amber-400 px-4 py-2 font-semibold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-300"
            >
              Get early access
            </a>
          </nav>
          <a
            href="#early-access"
            className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-300 md:hidden"
          >
            Early access
          </a>
        </div>
      </div>
    </header>
  );
}

/* Hero ------------------------------------------------------------------ */

function Hero() {
  return (
    <section className="relative overflow-hidden bg-slate-950 pt-32 pb-20 text-white sm:pt-36">
      {/* background: grid + glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(148,163,184,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.07) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-amber-500/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-950 to-transparent"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            AI Growth Assistant for Local Service Businesses
          </span>
          <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]">
            Never miss a lead.
            <br />
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 bg-clip-text text-transparent">
              Book more jobs
            </span>{" "}
            — automatically.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
            The AI assistant that captures every lead — missed calls, texts, Facebook messages —
            replies by SMS in seconds, qualifies the lead, books the good ones, and nurtures the
            rest. Your crew keeps working; the phone keeps making money.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#early-access"
              className="rounded-xl bg-amber-400 px-7 py-3.5 text-base font-bold text-slate-950 shadow-xl shadow-amber-500/25 transition hover:-translate-y-0.5 hover:bg-amber-300"
            >
              Get early access
            </a>
            <a
              href="#features"
              className="rounded-xl border border-white/15 bg-white/5 px-7 py-3.5 text-base font-semibold text-white transition hover:bg-white/10"
            >
              See how it works
            </a>
          </div>
          <p className="mt-8 text-sm font-medium text-slate-400">
            Built for <span className="text-slate-200">roofers · plumbers · HVAC · landscapers · grease &amp; cleanup crews</span>
            <span className="mt-1 block text-slate-500">
              Our own cleanup operation is customer #1 — we eat our own cooking.
            </span>
          </p>
        </div>

        <SmsMock />
      </div>
    </section>
  );
}

function SmsMock() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div
        aria-hidden="true"
        className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-amber-500/20 via-transparent to-sky-500/10 blur-2xl"
      />
      <div className="relative rounded-3xl border border-white/10 bg-slate-900/90 shadow-2xl shadow-black/50 backdrop-blur">
        {/* phone header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <LogoMark className="h-8 w-8" />
            <div className="leading-tight">
              <div className="text-sm font-semibold text-white">M&amp;P Greasey Clean Up</div>
              <div className="text-xs text-emerald-400">AI Assistant · online</div>
            </div>
          </div>
          <span className="rounded-full bg-red-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-red-400">
            Missed call
          </span>
        </div>

        {/* conversation */}
        <div className="space-y-3 px-5 py-5">
          <p className="text-center text-[11px] font-medium text-slate-500">Today · 2:14 PM</p>

          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-slate-800 px-4 py-2.5 text-sm text-slate-100">
              Hey, sorry we missed your call — what can we help you with?
            </div>
          </div>

          <div className="flex justify-end">
            <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-amber-400 px-4 py-2.5 text-sm font-medium text-slate-950">
              Hi, I need my restaurant's grease trap cleaned. Can you come this week?
            </div>
          </div>

          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-slate-800 px-4 py-2.5 text-sm text-slate-100">
              Absolutely. What's the location, and about how much do you usually pay for this?
              I'll find a time that works.
            </div>
          </div>

          {/* auto-tag chip */}
          <div className="flex items-center justify-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1.5 text-[11px] font-semibold text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Qualified · Hot lead · Restaurant grease trap · Northside · Budget on file
          </div>

          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-slate-800 px-4 py-2.5 text-sm text-slate-100">
              Great — we have Thursday 9:00 AM or Friday 1:00 PM. Which works better?
            </div>
          </div>

          <div className="flex justify-end">
            <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-amber-400 px-4 py-2.5 text-sm font-medium text-slate-950">
              Thursday works.
            </div>
          </div>

          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-slate-800 px-4 py-2.5 text-sm text-slate-100">
              Booked for Thursday at 9:00 AM. You'll get a reminder tomorrow and 2 hours before.
              See you then!
            </div>
          </div>
        </div>

        {/* footer */}
        <div className="flex items-center justify-between border-t border-white/10 px-5 py-3.5 text-[11px] font-medium text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <CheckIcon className="h-3.5 w-3.5" /> Auto-confirmed
          </span>
          <span>Google Calendar synced</span>
          <span>Reminders: 24hr · 2hr</span>
        </div>
      </div>
    </div>
  );
}

/* Outcomes ------------------------------------------------------------------ */

function Outcomes() {
  return (
    <section id="outcomes" className="scroll-mt-24 bg-white py-24">
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600">
              The outcomes
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Every lead captured. Every follow-up done. Every job a step closer.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              Five things every local service business needs to stop losing work — handled
              automatically, from the first missed call to the booked job.
            </p>
          </div>
          <ol className="divide-y divide-slate-200 border-y border-slate-200">
            {OUTCOMES.map((o, i) => (
              <li key={o.title} className="group flex gap-5 py-6">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-extrabold text-slate-900 transition group-hover:bg-amber-400">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{o.title}</h3>
                  <p className="mt-1 text-slate-600">{o.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* Features ------------------------------------------------------------------ */

function Features() {
  const regular = FEATURES.slice(0, 6);
  const [dashboard] = FEATURES.slice(6);
  return (
    <section id="features" className="scroll-mt-24 bg-slate-50 py-24">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600">
            What it does
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            A full-time office assistant that texts, books, and follows up — for less than a cup
            of coffee a day
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Seven systems working together so no lead falls through the cracks.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {regular.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-amber-300 hover:shadow-xl hover:shadow-amber-500/10"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-amber-400 transition group-hover:bg-amber-400 group-hover:text-slate-950">
                {f.icon}
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-900">{f.title}</h3>
              <p className="mt-2 leading-relaxed text-slate-600">{f.body}</p>
            </div>
          ))}
        </div>

        {/* 7th feature: dashboard, wide */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid items-center gap-8 p-8 lg:grid-cols-2 lg:p-12">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-amber-400">
                {dashboard.icon}
              </div>
              <h3 className="mt-5 text-2xl font-bold text-slate-900">{dashboard.title}</h3>
              <p className="mt-3 text-lg leading-relaxed text-slate-600">{dashboard.body}</p>
              <ul className="mt-6 space-y-3">
                {[
                  "Every lead with a hot / warm / cold tag",
                  "One-line AI summary on each conversation",
                  "Bookings and revenue pipeline at a glance",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-slate-700">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <CheckIcon className="h-3.5 w-3.5" />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <DashboardMock />
          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardMock() {
  const rows = [
    { name: "Riverside Diner", job: "Grease trap", tag: "Hot", color: "bg-emerald-100 text-emerald-700", value: "$340 · booked" },
    { name: "Maple St. Homeowner", job: "Pressure wash", tag: "Warm", color: "bg-amber-100 text-amber-700", value: "estimate sent" },
    { name: "Corner Market", job: "Kitchen deep clean", tag: "Hot", color: "bg-emerald-100 text-emerald-700", value: "$520 · booked" },
    { name: "Old Mill Apartments", job: "Dumpster pad", tag: "Cold", color: "bg-slate-100 text-slate-500", value: "nurture (3d)" },
  ];
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-inner">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-bold text-slate-900">Pipeline — this week</div>
        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
          2 new hot leads
        </span>
      </div>
      <div className="space-y-2.5">
        {rows.map((r) => (
          <div
            key={r.name}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-[11px] font-bold text-amber-400">
                {r.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold text-slate-900">{r.name}</div>
                <div className="text-xs text-slate-500">{r.job}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${r.color}`}>{r.tag}</span>
              <span className="hidden text-xs font-medium text-slate-500 sm:block">{r.value}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between rounded-xl border border-dashed border-slate-300 px-4 py-3 text-xs text-slate-500">
        <span>Missed opportunities</span>
        <span className="font-bold text-slate-700">0 — every call got a text back</span>
      </div>
    </div>
  );
}

/* Integrations ------------------------------------------------------------------ */

function Integrations() {
  const items = [
    { label: "Twilio", detail: "SMS + call tracking" },
    { label: "Google Calendar", detail: "2-way booking sync" },
    { label: "Facebook & Instagram", detail: "message inbox" },
    { label: "Website", detail: "chat widget" },
  ];
  return (
    <section className="border-y border-slate-200 bg-white py-16">
      <div className="mx-auto max-w-6xl px-5">
        <p className="text-center text-sm font-semibold uppercase tracking-widest text-slate-500">
          Plugs into the tools you already use
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          {items.map((i) => (
            <div
              key={i.label}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-5 py-3"
            >
              <span className="text-sm font-bold text-slate-900">{i.label}</span>
              <span className="text-xs font-medium text-slate-500">{i.detail}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Launch band ------------------------------------------------------------------ */

function LaunchBand() {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-20 text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 left-1/2 h-72 w-[640px] -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl"
      />
      <div className="relative mx-auto max-w-4xl px-5 text-center">
        <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
          Built for our own crew first
        </span>
        <blockquote className="mt-5 text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
          "We built this for M&amp;P Greasey Clean Up — our own two-truck grease and cleanup
          operation. If it keeps our phones answered between jobs, it can do it for yours."
        </blockquote>
        <p className="mt-6 text-slate-400">
          We're running it as customer #1, so it's tested on real calls, real jobs, and real
          customers — not a demo.
        </p>
      </div>
    </section>
  );
}

/* FAQ ------------------------------------------------------------------ */

function Faq() {
  return (
    <section id="faq" className="scroll-mt-24 bg-white py-24">
      <div className="mx-auto max-w-3xl px-5">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600">FAQ</span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Questions crews actually ask
          </h2>
        </div>
        <div className="mt-12 space-y-4">
          {FAQS.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5 open:bg-white open:shadow-sm"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-bold text-slate-900 [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600 transition group-open:rotate-45 group-open:bg-amber-400 group-open:text-slate-950">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
                    <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                  </svg>
                </span>
              </summary>
              <p className="mt-3 leading-relaxed text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Early access + form ------------------------------------------------------------------ */

type FormState = {
  name: string;
  businessType: string;
  phone: string;
  email: string;
  message: string;
};

const EMPTY_FORM: FormState = { name: "", businessType: "", phone: "", email: "", message: "" };

function EarlyAccess() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [firstName, setFirstName] = useState("");

  function set<K extends keyof FormState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    setError("");
    try {
      const result = await submitLead({ data: form });
      if (result.ok) {
        setFirstName(form.name.split(" ")[0] || "there");
        setStatus("success");
      } else {
        setError(result.error ?? "Something went wrong — please try again.");
        setStatus("error");
      }
    } catch {
      setError("Something went wrong — please try again.");
      setStatus("error");
    }
  }

  const inputCls =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200";
  const labelCls = "mb-1.5 block text-sm font-semibold text-slate-700";

  return (
    <section id="early-access" className="scroll-mt-24 bg-gradient-to-b from-slate-50 to-white py-24">
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600">
              Early access
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Ready to stop missing leads?
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              We're onboarding a small group of local service businesses right now. Tell us a
              little about yours and we'll reach out to get you set up.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                "Keep your phone number and calendar",
                "Set up in days, not months",
                "Direct line to our team while we build",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-slate-700">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <CheckIcon className="h-3.5 w-3.5" />
                  </span>
                  <span className="font-medium">{t}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60">
            {status === "success" ? (
              <div className="py-10 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckIcon className="h-8 w-8" />
                </div>
                <h3 className="mt-6 text-2xl font-extrabold text-slate-900">
                  You're on the list, {firstName}!
                </h3>
                <p className="mx-auto mt-3 max-w-sm text-slate-600">
                  Thanks for your interest. We'll reach out when it's your turn to get set up.
                </p>
                <p className="mt-6 text-xs text-slate-400">
                  No spam — just a real conversation about your business.
                </p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-5" noValidate>
                <div>
                  <label htmlFor="name" className={labelCls}>
                    Your name <span className="text-amber-600">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Mike Peterson"
                    className={inputCls}
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="businessType" className={labelCls}>
                    Business type
                  </label>
                  <select
                    id="businessType"
                    name="businessType"
                    className={inputCls}
                    value={form.businessType}
                    onChange={(e) => set("businessType", e.target.value)}
                  >
                    <option value="">Select your trade…</option>
                    <option>Roofing</option>
                    <option>Plumbing</option>
                    <option>HVAC</option>
                    <option>Landscaping</option>
                    <option>Grease &amp; cleanup</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="phone" className={labelCls}>
                      Phone
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="(555) 123-4567"
                      className={inputCls}
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className={labelCls}>
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@yourbusiness.com"
                      className={inputCls}
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                    />
                  </div>
                </div>
                <p className="-mt-2 text-xs text-slate-500">
                  Phone or email — either works, so we know how to reach you.
                </p>

                <div>
                  <label htmlFor="message" className={labelCls}>
                    Anything else? <span className="font-normal text-slate-400">(optional)</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={3}
                    placeholder="A sentence or two about your business is plenty."
                    className={inputCls}
                    value={form.message}
                    onChange={(e) => set("message", e.target.value)}
                  />
                </div>

                {status === "error" && error && (
                  <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="w-full rounded-xl bg-amber-400 px-6 py-3.5 text-base font-bold text-slate-950 shadow-lg shadow-amber-500/25 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === "submitting" ? "Sending…" : "Get early access"}
                </button>
                <p className="text-center text-xs text-slate-400">
                  You're joining the list — nothing more. We'll reach out when it's your turn.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* Footer ------------------------------------------------------------------ */

function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-12 text-slate-400">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-5 sm:flex-row">
        <div className="flex items-center gap-3">
          <LogoMark className="h-8 w-8" />
          <div className="text-sm font-semibold text-white">M&amp;P Growth Assistant</div>
        </div>
        <p className="text-center text-sm">
          Built by <span className="font-semibold text-slate-200">M&amp;P Greasey Clean Up Inc</span> — our own
          first customer.
        </p>
        <a href="#early-access" className="text-sm font-semibold text-amber-400 transition hover:text-amber-300">
          Get early access
        </a>
      </div>
      <p className="mt-8 text-center text-xs text-slate-600">
        © {new Date().getFullYear()} M&amp;P Greasey Clean Up Inc. All rights reserved.
      </p>
    </footer>
  );
}
