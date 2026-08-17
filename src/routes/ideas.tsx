import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  TRADES,
  copyTextFor,
  generateWeek,
  type Cta,
  type Idea,
  type Platform,
  type Trade,
} from "~/lib/ideas-data";

/* ------------------------------------------------------------------ */
/* Route                                                               */
/* ------------------------------------------------------------------ */

export const Route = createFileRoute("/ideas")({
  component: Ideas,
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

const PLATFORM_STYLES: Record<Platform, string> = {
  "Instagram Reels": "bg-violet-100 text-violet-700",
  Facebook: "bg-sky-100 text-sky-700",
  "Google Business Profile": "bg-amber-100 text-amber-700",
};

const CTA_STYLES: Record<Cta, string> = {
  "Call/text us": "bg-slate-950 text-amber-400",
  "Book a free estimate": "bg-emerald-100 text-emerald-800",
  "DM us 'HELP'": "bg-amber-400 text-slate-950",
};

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

function Ideas() {
  const [trade, setTrade] = useState<Trade>("Grease & cleanup");
  const [town, setTown] = useState("");
  const [seed, setSeed] = useState(0);
  const [ideas, setIdeas] = useState<Idea[]>(() => generateWeek("Grease & cleanup", "", 0));
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Regenerate when the trade or town changes (seed unchanged).
  useEffect(() => {
    setIdeas(generateWeek(trade, town, seed));
  }, [trade, town, seed]);

  useEffect(() => {
    return () => {
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
    };
  }, []);

  function shuffle() {
    setSeed((s) => (s + 1) % 100000);
  }

  function flashCopied(id: string) {
    setCopiedId(id);
    setCopiedAll(false);
    if (copiedTimer.current) clearTimeout(copiedTimer.current);
    copiedTimer.current = setTimeout(() => setCopiedId(null), 1600);
  }

  function flashCopiedAll() {
    setCopiedAll(true);
    setCopiedId(null);
    if (copiedTimer.current) clearTimeout(copiedTimer.current);
    copiedTimer.current = setTimeout(() => setCopiedAll(false), 1600);
  }

  async function copyIdea(idea: Idea, id: string) {
    try {
      await navigator.clipboard.writeText(copyTextFor(idea));
    } catch {
      // Fallback for contexts where the async clipboard API is unavailable.
      const ta = document.createElement("textarea");
      ta.value = copyTextFor(idea);
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    flashCopied(id);
  }

  async function copyAll() {
    const text = ideas.map(copyTextFor).join("\n\n---\n\n");
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    flashCopiedAll();
  }

  return (
    <div className="bg-white text-slate-900">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-950 pt-28 pb-16 text-white sm:pt-32">
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
          className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-amber-500/15 blur-3xl"
        />
        <div className="relative mx-auto max-w-6xl px-5">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Content ideation engine
          </span>
          <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl">
            A week of content ideas,
            <br />
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 bg-clip-text text-transparent">
              ready to post
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
            Pick your trade and your town — get 7 done-for-you ideas for Instagram Reels, Facebook,
            and Google Business Profile. Hooks, captions, and lead-gen CTAs included. No AI, no
            sign-up, no fluff.
          </p>
        </div>
      </section>

      {/* Controls */}
      <section className="relative z-10 -mt-10">
        <div className="mx-auto max-w-6xl px-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8">
            <div className="grid gap-5 md:grid-cols-[1fr_1fr_auto] md:items-end">
              <div>
                <label htmlFor="ideas-trade" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Your trade
                </label>
                <select
                  id="ideas-trade"
                  value={trade}
                  onChange={(e) => setTrade(e.target.value as Trade)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
                >
                  {TRADES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="ideas-town" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Your town{" "}
                  <span className="font-normal text-slate-400">(optional — for the local angle)</span>
                </label>
                <input
                  id="ideas-town"
                  type="text"
                  value={town}
                  onChange={(e) => setTown(e.target.value)}
                  placeholder="e.g. Springfield"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
                />
              </div>
              <div className="flex flex-wrap gap-3 md:justify-end">
                <button
                  type="button"
                  onClick={shuffle}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/25 transition hover:-translate-y-0.5 hover:bg-amber-300"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-4 w-4" aria-hidden="true">
                    <path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Generate another week
                </button>
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-400">
              Ideas update as you change trade or town. Every "Generate another week" mixes in a
              fresh spread of content pillars.
            </p>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Your week of content
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {trade}
              {town.trim() ? ` · ${town.trim()}` : ""} ·{" "}
              {new Set(ideas.map((i) => i.platform)).size} platforms · 7 pillars
            </p>
          </div>
          <button
            type="button"
            onClick={copyAll}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-amber-400 hover:text-slate-900"
          >
            {copiedAll ? (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4 text-emerald-600" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Week copied!
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
                  <rect x="9" y="9" width="11" height="11" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Copy all 7
              </>
            )}
          </button>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {ideas.map((idea, idx) => (
            <IdeaCard
              key={`${seed}-${idx}`}
              idea={idea}
              copied={copiedId === `${seed}-${idx}`}
              onCopy={() => copyIdea(idea, `${seed}-${idx}`)}
            />
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="bg-slate-950 py-20 text-white">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Want this done for you{" "}
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 bg-clip-text text-transparent">
              every week?
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-slate-300">
            Join the early-access list and get fresh, trade-tailored content ideas delivered on
            autopilot — plus lead capture, SMS follow-up, and booking.
          </p>
          <a
            href="/#early-access"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-amber-400 px-7 py-3.5 text-base font-bold text-slate-950 shadow-xl shadow-amber-500/25 transition hover:-translate-y-0.5 hover:bg-amber-300"
          >
            Join the early-access list
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <p className="mt-6 text-xs text-slate-500">
            Free to try · no spam · built by a local service business, for local service businesses
          </p>
        </div>
      </section>
    </div>
  );
}

/* Header ------------------------------------------------------------------ */

function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-5">
        <a href="/" className="flex min-w-0 items-center gap-3">
          <LogoMark />
          <div className="min-w-0 leading-tight">
            <div className="truncate text-sm font-bold tracking-tight text-white">Content Ideas</div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
              M&amp;P Growth Assistant
            </div>
          </div>
        </a>
        <a
          href="/"
          className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          <span className="hidden sm:inline">← Back to home</span>
          <span className="sm:hidden">← Home</span>
        </a>
      </div>
    </header>
  );
}

/* Idea card ---------------------------------------------------------------- */

function IdeaCard({ idea, copied, onCopy }: { idea: Idea; copied: boolean; onCopy: () => void }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-6 py-4">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
            {idea.day}
          </span>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${PLATFORM_STYLES[idea.platform]}`}
        >
          {idea.platform}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-4 px-6 py-5">
        <h3 className="text-lg font-bold leading-snug tracking-tight text-slate-900">
          {idea.headline}
        </h3>

        <div className="rounded-2xl bg-slate-950 px-4 py-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
            First 2 seconds
          </div>
          <p className="mt-1 text-sm font-medium leading-relaxed text-white">“{idea.hook}”</p>
        </div>

        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Caption
          </div>
          <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-slate-600">
            {idea.caption}
          </p>
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2">
          <span
            className={`rounded-full px-3 py-1.5 text-xs font-bold ${CTA_STYLES[idea.cta]}`}
            title="Lead-gen call to action"
          >
            {idea.cta}
          </span>
          <button
            type="button"
            onClick={onCopy}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              copied
                ? "bg-emerald-100 text-emerald-800"
                : "border border-slate-300 bg-white text-slate-700 hover:border-amber-400 hover:text-slate-900"
            }`}
          >
            {copied ? (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
                  <rect x="9" y="9" width="11" height="11" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
