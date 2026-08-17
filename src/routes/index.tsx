import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useCallback, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { appendLead } from "~/lib/leads-store";
import { QUOTE_SERVICES } from "~/lib/leads";

/* ------------------------------------------------------------------ */
/* Server: quote-request form submission                               */
/* ------------------------------------------------------------------ */

type QuoteSubmission = {
  name: string;
  company: string;
  phone: string;
  service: string;
  siteDetails: string;
};

type SubmitResult = { ok: boolean; error?: string };

// MVP storage: data/leads.json, written through the shared serialized queue in
// ~/lib/leads-store (same write pattern the early-access form and dashboard
// use). SITE.md documents the path to a real database (Neon via DATABASE_URL).
// Quote leads land in the same store as early-access leads, so they show up in
// the /dashboard leads dashboard with source "quote" + status "New".

const submitQuote = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as QuoteSubmission)
  .handler(async ({ data }): Promise<SubmitResult> => {
    try {
      const name = String(data?.name ?? "").trim();
      const company = String(data?.company ?? "").trim();
      const phone = String(data?.phone ?? "").trim();
      const service = String(data?.service ?? "").trim();
      const siteDetails = String(data?.siteDetails ?? "").trim();

      if (!name) return { ok: false, error: "Please enter your name." };
      if (!phone)
        return { ok: false, error: "Add a phone number so the crew can call you back." };
      if (!service || !(QUOTE_SERVICES as readonly string[]).includes(service))
        return { ok: false, error: "Please pick the service you need." };
      if (
        name.length > 120 ||
        company.length > 120 ||
        phone.length > 40 ||
        service.length > 80 ||
        siteDetails.length > 2000
      ) {
        return {
          ok: false,
          error: "One of the fields is too long — please shorten it and try again.",
        };
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

      return { ok: true };
    } catch (err) {
      console.error("submitQuote error:", err);
      return {
        ok: false,
        error: "Something went wrong on our end — please try again.",
      };
    }
  });

/* ------------------------------------------------------------------ */
/* Route                                                               */
/* ------------------------------------------------------------------ */

export const Route = createFileRoute("/")({
  component: Home,
});

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */

function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20 ${className}`}
    >
      <span className="text-sm font-extrabold tracking-tight">M·P</span>
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

function PhoneIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className={className} aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className={className} aria-hidden="true">
      <path d="M8 3 4 7l4 4M4 7h16M16 21l4-4-4-4M20 17H4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const iconProps = {
  className: "h-6 w-6",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const PHONE_DISPLAY = "(570) 825-5403";
const PHONE_HREF = "tel:+15708255403";
const ADDRESS = "233 S Sherman St, Wilkes-Barre, PA 18702";

const SERVICES: { title: string; body: string; icon: ReactNode }[] = [
  {
    title: "Commercial Kitchen Degreasing",
    body: "Deep degreasing for restaurant kitchens — walls, floors, hoods, and equipment surfaces where grease accumulates fastest.",
    icon: (
      <svg viewBox="0 0 24 24" {...iconProps}>
        <path d="M4 21h16" />
        <path d="M6 21V9a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12" />
        <path d="M8 9V7a4 4 0 0 1 8 0v2" />
        <path d="M10 13h4" />
      </svg>
    ),
  },
  {
    title: "Grease Trap & Interceptor Cleaning",
    body: "Scheduled pump-outs and cleaning to keep traps and interceptors running and out of code violation territory.",
    icon: (
      <svg viewBox="0 0 24 24" {...iconProps}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3a9 9 0 0 1 9 9h-9V3Z" />
        <path d="M12 12 8.5 15.5M12 12l4.5 3.5" />
      </svg>
    ),
  },
  {
    title: "Exhaust Hood & Duct Cleaning",
    body: "Hood, filter, and duct degreasing that supports fire-safety compliance for restaurants and food service facilities.",
    icon: (
      <svg viewBox="0 0 24 24" {...iconProps}>
        <path d="M3 8h10M13 8a5 5 0 0 1 5 5v2M3 8v9h17" />
        <path d="M3 8V6a2 2 0 0 1 2-2h6" />
        <path d="M7 13h6" />
      </svg>
    ),
  },
  {
    title: "Industrial Surface Degreasing",
    body: "Heavy-duty degreasing for plant floors, machinery, and industrial surfaces with built-up grease and grime.",
    icon: (
      <svg viewBox="0 0 24 24" {...iconProps}>
        <path d="M2 20h20" />
        <path d="M4 20V8l5 4V8l5 4V8l6 4v8" />
        <path d="M9 20v-4M14 20v-4" />
      </svg>
    ),
  },
  {
    title: "Pressure Washing",
    body: "High-pressure exterior and surface washing for loading docks, lots, and facility exteriors.",
    icon: (
      <svg viewBox="0 0 24 24" {...iconProps}>
        <path d="M5 21h14" />
        <path d="M7 21V5h10v16" />
        <path d="M7 9h10" />
        <path d="M12 5V3" />
      </svg>
    ),
  },
  {
    title: "Scheduled Maintenance Plans",
    body: "Recurring cleaning on a schedule built around your inspection calendar, not ours.",
    icon: (
      <svg viewBox="0 0 24 24" {...iconProps}>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
        <path d="m9 15 2 2 4-4" />
      </svg>
    ),
  },
];

const PROCESS_STEPS: { title: string; body: string }[] = [
  {
    title: "Site Walkthrough & Assessment",
    body: "We inspect the affected areas, identify grease type and buildup severity, and scope the work before anything starts.",
  },
  {
    title: "Degreasing & Treatment",
    body: "Commercial-grade degreasing applied to the surfaces, equipment, or systems identified in the walkthrough.",
  },
  {
    title: "Removal & Disposal",
    body: "Grease waste is removed and disposed of properly — not left behind for you to deal with.",
  },
  {
    title: "Final Walkthrough",
    body: "We walk the site with you before we leave, so you can see the result and confirm the job's done right.",
  },
];

const FACTS: { label: string; value: string }[] = [
  { label: "Since", value: "2002 — Incorporated in PA" },
  { label: "Based in", value: "Wilkes-Barre, PA" },
  { label: "Serves", value: "Commercial & Industrial Sites" },
  { label: "Specialty", value: "Grease Removal & Degreasing" },
];

const SEGMENTS = [
  "Restaurants & commercial kitchens",
  "Food processing facilities",
  "Manufacturing plants",
  "Warehouses & distribution centers",
  "Property managers & landlords",
  "Auto shops & garages",
];

/* ------------------------------------------------------------------ */
/* Before/After slider (placeholder visuals)                           */
/* ------------------------------------------------------------------ */

// NOTE: We have no real photos of grease work, and fabricating convincing
// before/after "grease" images would be deceptive — so these two panels are
// deliberately stylized, obviously-artificial placeholders (labeled gradient
// panels). Swap in real before/after photos of actual jobs when the owner
// provides them; the drag interaction below will work unchanged.

function BeforeAfterSlider() {
  const [pos, setPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(96, Math.max(4, pct)));
  }, []);

  return (
    <div>
      <p className="text-center text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">
        Drag to see the difference we make
      </p>
      <div
        ref={containerRef}
        role="slider"
        aria-label="Before and after comparison"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pos)}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") setPos((p) => Math.max(4, p - 4));
          if (e.key === "ArrowRight") setPos((p) => Math.min(96, p + 4));
        }}
        onPointerDown={(e) => {
          draggingRef.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          updateFromClientX(e.clientX);
        }}
        onPointerMove={(e) => {
          if (draggingRef.current) updateFromClientX(e.clientX);
        }}
        onPointerUp={(e) => {
          draggingRef.current = false;
          if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
          }
        }}
        onPointerCancel={() => {
          draggingRef.current = false;
        }}
        className="relative h-64 w-full cursor-ew-resize touch-none select-none overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/40 sm:h-80"
      >
        {/* AFTER — base layer (revealed on the right) */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-white to-slate-200">
          {/* stylized clean shine streaks */}
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden="true">
            {[40, 120, 200, 280].map((y, i) => (
              <line
                key={i}
                x1="-20"
                y1={y}
                x2="420"
                y2={y + 60}
                stroke="#ffffff"
                strokeOpacity="0.65"
                strokeWidth={i % 2 === 0 ? 26 : 14}
                strokeLinecap="round"
              />
            ))}
          </svg>
          <div className="absolute right-4 top-4 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-extrabold uppercase tracking-widest text-slate-900 shadow">
            After
          </div>
          <div className="absolute bottom-4 right-4 rounded-lg bg-white/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
            Degreased &amp; cleaned
          </div>
        </div>

        {/* BEFORE — clipped to the left of the divider */}
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <div className="absolute inset-0 bg-gradient-to-br from-stone-700 via-slate-800 to-slate-950">
            {/* stylized grease streaks */}
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden="true">
              {[60, 150, 240].map((x, i) => (
                <g key={i} opacity="0.5">
                  <line x1={x} y1="0" x2={x + 20} y2="300" stroke="#0f172a" strokeWidth={i === 1 ? 34 : 22} strokeLinecap="round" />
                  <circle cx={x + 10} cy="300" r={i === 1 ? 22 : 14} fill="#0f172a" />
                </g>
              ))}
              <g opacity="0.35">
                <ellipse cx="330" cy="70" rx="60" ry="36" fill="#1c1917" />
                <ellipse cx="70" cy="220" rx="50" ry="42" fill="#1c1917" />
              </g>
            </svg>
            <div className="absolute left-4 top-4 rounded-lg bg-slate-950/85 px-3 py-1.5 text-xs font-extrabold uppercase tracking-widest text-slate-200 shadow">
              Before
            </div>
            <div className="absolute bottom-4 left-4 rounded-lg bg-slate-950/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Built-up grease
            </div>
          </div>
        </div>

        {/* divider handle */}
        <div className="pointer-events-none absolute inset-y-0" style={{ left: `${pos}%` }}>
          <div className="absolute inset-y-0 -ml-px w-0.5 bg-amber-400 shadow-[0_0_14px_rgba(251,191,36,0.9)]" />
          <div className="absolute top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-amber-400 text-slate-950 shadow-xl shadow-amber-500/40 ring-4 ring-slate-950/40">
            <ArrowIcon className="h-5 w-5" />
          </div>
        </div>
      </div>
      <p className="mt-2 text-center text-[11px] text-slate-500">
        Placeholder panels — real before/after photos of our work drop in here.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

function Home() {
  return (
    <div id="top" className="min-h-dvh bg-white text-slate-900">
      <Nav />
      <Hero />
      <WhatWeDo />
      <HowAJobRuns />
      <Facts />
      <WhoWeServe />
      <QuoteBand />
      <GetInTouch />
      <QuoteFormSection />
      <Footer />
    </div>
  );
}

/* Nav ------------------------------------------------------------------ */

function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-5">
        <a href="#top" className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <LogoMark className="h-9 w-9 shrink-0" />
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-sm font-bold tracking-tight text-white">
              M &amp; P Greasey Clean Up Inc
            </span>
            <span className="hidden text-[10px] font-bold uppercase tracking-[0.16em] text-amber-400 sm:block">
              Grease &amp; Degreasing Specialists
            </span>
          </span>
        </a>
        <nav className="hidden items-center gap-7 text-sm font-medium text-slate-300 lg:flex">
          <a href="#services" className="transition hover:text-white">Services</a>
          <a href="#process" className="transition hover:text-white">Process</a>
          <a href="#who-we-serve" className="transition hover:text-white">Who We Serve</a>
          <a href="#contact" className="transition hover:text-white">Contact</a>
        </nav>
        <div className="flex shrink-0 items-center gap-2.5 sm:gap-4">
          <a
            href={PHONE_HREF}
            className="hidden items-center gap-1.5 text-sm font-semibold text-slate-200 transition hover:text-amber-300 md:flex"
          >
            <PhoneIcon className="h-4 w-4 text-amber-400" />
            {PHONE_DISPLAY}
          </a>
          <a
            href="#quote"
            className="rounded-lg bg-amber-400 px-3.5 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-300 sm:px-4 sm:text-sm"
          >
            Request a Quote
          </a>
        </div>
      </div>
    </header>
  );
}

/* Hero ------------------------------------------------------------------ */

function Hero() {
  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(148,163,184,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.06) 1px, transparent 1px)",
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

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 pb-20 pt-14 sm:px-5 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Wilkes-Barre, PA · Serving NEPA since 2002
          </span>
          <h1 className="mt-6 text-4xl font-extrabold leading-[1.06] tracking-tight sm:text-5xl lg:text-[3.4rem]">
            Grease down.
            <br />
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 bg-clip-text text-transparent">
              Standards up.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
            M &amp; P Greasey Clean Up Inc handles the grease your facility can't afford to
            ignore — commercial kitchens, hoods, traps, and industrial surfaces, cleaned and
            documented to code.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#quote"
              className="rounded-xl bg-amber-400 px-7 py-3.5 text-base font-bold text-slate-950 shadow-xl shadow-amber-500/25 transition hover:-translate-y-0.5 hover:bg-amber-300"
            >
              Request a Quote
            </a>
            <a
              href={PHONE_HREF}
              className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-7 py-3.5 text-base font-semibold text-white transition hover:bg-white/10"
            >
              <PhoneIcon className="h-4 w-4 text-amber-400" />
              Call {PHONE_DISPLAY}
            </a>
          </div>
          <dl className="mt-10 grid grid-cols-1 gap-4 border-t border-white/10 pt-8 sm:grid-cols-3 sm:gap-6">
            {[
              ["20+", "YRS SERVING NEPA"],
              ["Comm. + Ind.", "INDUSTRIAL CLIENTS"],
              ["Local", "WILKES-BARRE BASED CREW"],
            ].map(([big, label]) => (
              <div key={label} className="leading-tight">
                <dt className="sr-only">{label}</dt>
                <dd>
                  <div className="text-xl font-extrabold tracking-tight text-amber-400">{big}</div>
                  <div className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {label}
                  </div>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <BeforeAfterSlider />
      </div>
    </section>
  );
}

/* What We Do -------------------------------------------------------------- */

function WhatWeDo() {
  return (
    <section id="services" className="scroll-mt-20 bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-5">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600">
            What we do
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Built for the jobs other cleaners turn down
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Grease is a different problem than dirt. It builds, it hides, and it becomes a fire
            and compliance risk if it's not handled by people who know the buildup.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <div
              key={s.title}
              className="group rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-amber-300 hover:shadow-xl hover:shadow-amber-500/10"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-amber-400 transition group-hover:bg-amber-400 group-hover:text-slate-950">
                {s.icon}
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-900">{s.title}</h3>
              <p className="mt-2 leading-relaxed text-slate-600">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* How a Job Runs ---------------------------------------------------------- */

function HowAJobRuns() {
  return (
    <section id="process" className="scroll-mt-20 border-y border-slate-200 bg-slate-50 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-5">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600">
            How a job runs
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            The same sequence, every time
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            No guesswork on-site. Every job follows the same four stages so you know exactly
            what's happening and when it's done.
          </p>
        </div>

        <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS_STEPS.map((step, i) => (
            <li
              key={step.title}
              className="relative rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"
            >
              <span className="text-3xl font-extrabold tracking-tight text-amber-400">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 text-base font-bold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* Facts ------------------------------------------------------------------- */

function Facts() {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-16 text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 left-1/2 h-72 w-[640px] -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl"
      />
      <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 sm:grid-cols-2 sm:px-5 lg:grid-cols-4">
        {FACTS.map((f) => (
          <div key={f.label} className="border-l-2 border-amber-400 pl-5">
            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
              {f.label}
            </div>
            <div className="mt-2 text-lg font-bold leading-snug text-white">{f.value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* Who We Serve ------------------------------------------------------------ */

function WhoWeServe() {
  return (
    <section id="who-we-serve" className="scroll-mt-20 bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-5">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600">
              Who we serve
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              If grease builds up on it, we clean it
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              Facility managers, restaurant owners, and plant operators across Northeastern
              Pennsylvania call us when grease becomes a liability.
            </p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {SEGMENTS.map((s) => (
              <li
                key={s}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 font-semibold text-slate-800"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-400 text-slate-950">
                  <CheckIcon className="h-3.5 w-3.5" />
                </span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* Quote band -------------------------------------------------------------- */

function QuoteBand() {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-20 text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[720px] -translate-x-1/2 rounded-full bg-amber-500/15 blur-3xl"
      />
      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-5">
        <h2 className="text-2xl font-extrabold leading-snug tracking-tight sm:text-3xl">
          Grease doesn't wait for an inspection date. Get a straightforward quote from a crew
          that's worked NEPA's kitchens and plants since 2002.
        </h2>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#quote"
            className="rounded-xl bg-amber-400 px-7 py-3.5 text-base font-bold text-slate-950 shadow-xl shadow-amber-500/25 transition hover:-translate-y-0.5 hover:bg-amber-300"
          >
            Request a Quote
          </a>
          <a
            href={PHONE_HREF}
            className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-7 py-3.5 text-base font-semibold text-white transition hover:bg-white/10"
          >
            <PhoneIcon className="h-4 w-4 text-amber-400" />
            Call {PHONE_DISPLAY}
          </a>
        </div>
      </div>
    </section>
  );
}

/* Get in Touch ------------------------------------------------------------ */

function GetInTouch() {
  const items = [
    {
      label: "Address",
      value: ADDRESS,
      icon: (
        <svg viewBox="0 0 24 24" {...iconProps}>
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
    },
    {
      label: "Phone",
      value: PHONE_DISPLAY,
      note: "Best way to reach us directly",
      href: PHONE_HREF,
      icon: <PhoneIcon className="h-6 w-6" />,
    },
    {
      label: "Service area",
      value: "Wilkes-Barre & Northeastern PA",
      note: "Commercial & industrial sites",
      icon: (
        <svg viewBox="0 0 24 24" {...iconProps}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z" />
        </svg>
      ),
    },
  ];
  return (
    <section id="contact" className="scroll-mt-20 border-t border-slate-200 bg-slate-50 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-5">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600">
            Get in touch
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Talk to the crew
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Call directly for the fastest response, or send over your site details and we'll
            follow up.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-amber-400">
                {item.icon}
              </div>
              <div className="mt-4 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                {item.label}
              </div>
              {item.href ? (
                <a href={item.href} className="mt-1 block text-lg font-bold text-slate-900 transition hover:text-amber-600">
                  {item.value}
                </a>
              ) : (
                <div className="mt-1 text-lg font-bold leading-snug text-slate-900">{item.value}</div>
              )}
              {item.note && <div className="mt-1 text-sm text-slate-500">{item.note}</div>}
            </div>
          ))}

          {/* Hours card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-amber-400">
              <svg viewBox="0 0 24 24" {...iconProps}>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 3" />
              </svg>
            </div>
            <div className="mt-4 text-[11px] font-bold uppercase tracking-widest text-slate-500">
              Hours
            </div>
            <ul className="mt-1 text-sm leading-relaxed text-slate-700">
              <li className="font-semibold">Monday – Friday</li>
              <li className="text-slate-500">7:00 AM – 5:00 PM</li>
              <li className="mt-1 font-semibold">Saturday</li>
              <li className="text-slate-500">By appointment</li>
              <li className="mt-1 font-semibold">Sunday</li>
              <li className="text-amber-700">Emergency calls only</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Quote request form ------------------------------------------------------ */

type QuoteFormState = {
  name: string;
  company: string;
  phone: string;
  service: string;
  siteDetails: string;
};

const EMPTY_QUOTE_FORM: QuoteFormState = {
  name: "",
  company: "",
  phone: "",
  service: "",
  siteDetails: "",
};

function QuoteFormSection() {
  const [form, setForm] = useState<QuoteFormState>(EMPTY_QUOTE_FORM);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [firstName, setFirstName] = useState("");

  function set<K extends keyof QuoteFormState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    setError("");
    try {
      const result = await submitQuote({ data: form });
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
    <section id="quote" className="scroll-mt-20 bg-gradient-to-b from-white to-slate-50 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-5">
        <div className="grid items-start gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600">
              Request a quote
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Tell us what's building up
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              Send over your site details and the crew will follow up with a straightforward
              quote. No runaround, no surprises.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                "Scope confirmed before anything starts",
                "Straightforward pricing on the work you need",
                "Recurring plans built around your inspection calendar",
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

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8">
            {status === "success" ? (
              <div className="py-10 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckIcon className="h-8 w-8" />
                </div>
                <h3 className="mt-6 text-2xl font-extrabold text-slate-900">
                  Quote request received, {firstName}!
                </h3>
                <p className="mx-auto mt-3 max-w-sm leading-relaxed text-slate-600">
                  We've got your details. The crew will call you back to confirm the scope and
                  get you a straightforward quote.
                </p>
                <p className="mt-6 text-sm font-semibold text-slate-700">
                  Need it sooner?{" "}
                  <a href={PHONE_HREF} className="text-amber-600 underline-offset-2 transition hover:text-amber-500 hover:underline">
                    Call {PHONE_DISPLAY}
                  </a>
                </p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-5" noValidate>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="quote-name" className={labelCls}>
                      Name <span className="text-amber-600">*</span>
                    </label>
                    <input
                      id="quote-name"
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      placeholder="Your name"
                      className={inputCls}
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="quote-company" className={labelCls}>
                      Company <span className="font-normal text-slate-400">(optional)</span>
                    </label>
                    <input
                      id="quote-company"
                      name="company"
                      type="text"
                      autoComplete="organization"
                      placeholder="Business or facility"
                      className={inputCls}
                      value={form.company}
                      onChange={(e) => set("company", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="quote-phone" className={labelCls}>
                      Phone <span className="text-amber-600">*</span>
                    </label>
                    <input
                      id="quote-phone"
                      name="phone"
                      type="tel"
                      required
                      autoComplete="tel"
                      placeholder="(570) 555-0123"
                      className={inputCls}
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="quote-service" className={labelCls}>
                      Service needed <span className="text-amber-600">*</span>
                    </label>
                    <select
                      id="quote-service"
                      name="service"
                      required
                      className={inputCls}
                      value={form.service}
                      onChange={(e) => set("service", e.target.value)}
                    >
                      <option value="">Select a service…</option>
                      {QUOTE_SERVICES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="quote-siteDetails" className={labelCls}>
                    Site details <span className="font-normal text-slate-400">(optional)</span>
                  </label>
                  <textarea
                    id="quote-siteDetails"
                    name="siteDetails"
                    rows={4}
                    placeholder="Facility type, location, and what's going on…"
                    className={inputCls}
                    value={form.siteDetails}
                    onChange={(e) => set("siteDetails", e.target.value)}
                  />
                </div>

                {status === "error" && error && (
                  <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="w-full rounded-xl bg-amber-400 px-6 py-3.5 text-base font-bold text-slate-950 shadow-lg shadow-amber-500/25 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === "submitting" ? "Sending…" : "Submit Quote Request"}
                </button>
                <p className="text-center text-xs text-slate-500">
                  Prefer to talk it through? Call {PHONE_DISPLAY} — that's the fastest way to
                  reach us.
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
  const footerServices = [
    "Kitchen Degreasing",
    "Grease Trap Cleaning",
    "Hood & Duct Cleaning",
    "Pressure Washing",
  ];
  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-14 text-slate-400">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-5 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <LogoMark className="h-8 w-8" />
            <span className="text-sm font-bold text-white">M &amp; P Greasey Clean Up Inc</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed">
            Commercial &amp; industrial grease removal serving Wilkes-Barre and Northeastern
            Pennsylvania since 2002.
          </p>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Services</div>
          <ul className="mt-4 space-y-2.5 text-sm">
            {footerServices.map((s) => (
              <li key={s}>
                <a href="#services" className="transition hover:text-amber-300">
                  {s}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Contact</div>
          <address className="mt-4 space-y-2 text-sm not-italic leading-relaxed">
            <div>{ADDRESS}</div>
            <div>
              <a href={PHONE_HREF} className="transition hover:text-amber-300">
                {PHONE_DISPLAY}
              </a>
            </div>
          </address>
        </div>
      </div>
      <div className="mx-auto mt-12 max-w-6xl border-t border-slate-800/80 px-4 pt-6 sm:px-5">
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs text-slate-500">
            © 2026 M &amp; P GREASEY CLEAN UP INC — WILKES-BARRE, PA
          </p>
          <a
            href="/product"
            className="text-xs text-slate-600 transition hover:text-amber-400/80"
          >
            Built with our AI Growth Assistant
          </a>
        </div>
      </div>
    </footer>
  );
}
