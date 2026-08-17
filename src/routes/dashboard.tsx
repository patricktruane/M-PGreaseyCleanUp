import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { readLeads, setLeadStatus } from "~/lib/leads-store";
import { STATUSES, type Lead } from "~/lib/leads";
import { DASHBOARD_PASSCODE } from "~/lib/config";

/* ------------------------------------------------------------------ */
/* Server functions — every read of lead data requires the passcode,   */
/* so a wrong (or missing) code can never pull lead data out of the    */
/* server, even with the page open.                                    */
/* ------------------------------------------------------------------ */

type GateResult = { ok: true; leads: Lead[] } | { ok: false; error: string };

const fetchLeads = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as { passcode: string })
  .handler(async ({ data }): Promise<GateResult> => {
    if (data.passcode !== DASHBOARD_PASSCODE) {
      return { ok: false, error: "That passcode isn't right. Try again." };
    }
    try {
      return { ok: true, leads: await readLeads() };
    } catch (err) {
      console.error("fetchLeads error:", err);
      return { ok: false, error: "Couldn't load leads — please try again." };
    }
  });

const updateStatus = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as { passcode: string; id: string; status: string })
  .handler(async ({ data }): Promise<GateResult> => {
    if (data.passcode !== DASHBOARD_PASSCODE) {
      return { ok: false, error: "That passcode isn't right. Try again." };
    }
    if (!STATUSES.includes(data.status as (typeof STATUSES)[number])) {
      return { ok: false, error: "Invalid status." };
    }
    try {
      return { ok: true, leads: await setLeadStatus(data.id, data.status) };
    } catch (err) {
      console.error("updateStatus error:", err);
      return { ok: false, error: "Couldn't save the status — please try again." };
    }
  });

/* ------------------------------------------------------------------ */
/* Route                                                               */
/* ------------------------------------------------------------------ */

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

/* ------------------------------------------------------------------ */
/* Constants & helpers                                                 */
/* ------------------------------------------------------------------ */

const BUSINESS_TYPES = [
  "Roofing",
  "Plumbing",
  "HVAC",
  "Landscaping",
  "Grease & cleanup",
  "Other",
] as const;

// Remember the passcode for the rest of this tab session (cleared on close
// or when the user clicks "Lock"). The server still validates it on every
// fetch, so this is convenience, not the security boundary.
const SESSION_KEY = "mp-dashboard-passcode";

const STATUS_STYLES: Record<string, string> = {
  New: "bg-sky-100 text-sky-700",
  Contacted: "bg-amber-100 text-amber-700",
  Qualified: "bg-emerald-100 text-emerald-700",
  Booked: "bg-violet-100 text-violet-700",
};

function statusOf(lead: Lead): string {
  return (STATUSES as readonly string[]).includes(lead.status ?? "")
    ? (lead.status as string)
    : "New";
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function downloadCsv(leads: Lead[]) {
  const header = [
    "Name",
    "Business type",
    "Source",
    "Service",
    "Phone",
    "Email",
    "Message",
    "Status",
    "Captured at",
  ];
  const esc = (v: string) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = leads.map((l) =>
    [
      l.name,
      l.businessType,
      l.source ?? "early-access",
      l.service ?? "",
      l.phone,
      l.email,
      l.message,
      statusOf(l),
      l.createdAt,
    ]
      .map(esc)
      .join(",")
  );
  const csv = [header.map(esc).join(","), ...rows].join("\r\n");
  // BOM so Excel opens UTF-8 correctly.
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

function Dashboard() {
  const [attempt, setAttempt] = useState(""); // what the user typed
  const [passcode, setPasscode] = useState(""); // the code that unlocked
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  // Restore a previously-entered passcode for this tab session.
  useEffect(() => {
    let cancelled = false;
    let saved: string | null = null;
    try {
      saved = window.sessionStorage.getItem(SESSION_KEY);
    } catch {
      saved = null;
    }
    if (saved) {
      (async () => {
        try {
          const res = await fetchLeads({ data: { passcode: saved } });
          if (cancelled) return;
          if (res.ok) {
            setPasscode(saved as string);
            setLeads(res.leads);
            setUnlocked(true);
          } else {
            try {
              window.sessionStorage.removeItem(SESSION_KEY);
            } catch {
              /* ignore */
            }
          }
        } catch {
          /* leave the gate showing */
        }
      })();
    }
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const code = attempt.trim();
    if (!code || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetchLeads({ data: { passcode: code } });
      if (res.ok) {
        try {
          window.sessionStorage.setItem(SESSION_KEY, code);
        } catch {
          /* sessionStorage unavailable — just keep it in memory */
        }
        setPasscode(code);
        setLeads(res.leads);
        setUnlocked(true);
      } else {
        setError(res.error);
      }
    } catch {
      setError("Couldn't reach the server — please try again.");
    } finally {
      setLoading(false);
    }
  }

  function lock() {
    try {
      window.sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
    setUnlocked(false);
    setLeads([]);
    setPasscode("");
    setAttempt("");
    setError("");
  }

  async function changeStatus(id: string, status: string) {
    if (!passcode || savingId) return;
    setSavingId(id);
    setError("");
    try {
      const res = await updateStatus({ data: { passcode, id, status } });
      if (res.ok) {
        setLeads(res.leads);
      } else {
        setError(res.error);
      }
    } catch {
      setError("Couldn't save the status — please try again.");
    } finally {
      setSavingId(null);
    }
  }

  // Newest first, then search + business-type filter.
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...leads].sort((a, b) => {
      const at = new Date(a.createdAt).getTime() || 0;
      const bt = new Date(b.createdAt).getTime() || 0;
      return bt - at;
    });
    return sorted.filter((l) => {
      const bt = (l.businessType ?? "").trim();
      if (typeFilter === "Unknown") {
        if (bt !== "") return false;
      } else if (typeFilter === "Other") {
        if (bt === "" || (BUSINESS_TYPES as readonly string[]).includes(bt))
          return false;
      } else if (typeFilter !== "all") {
        if (bt !== typeFilter) return false;
      }
      if (q) {
        const hay = `${l.name} ${l.phone} ${l.email}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [leads, query, typeFilter]);

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900">
      <Header unlocked={unlocked} onLock={lock} />

      {unlocked ? (
        <DashboardBody
          leads={leads}
          visible={visible}
          query={query}
          setQuery={setQuery}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          savingId={savingId}
          onStatusChange={changeStatus}
          error={error}
          onExport={() => downloadCsv(leads)}
        />
      ) : (
        <Gate loading={loading} onSubmit={onSubmit} attempt={attempt} setAttempt={setAttempt} error={error} />
      )}
    </div>
  );
}

/* Header ------------------------------------------------------------------ */

function Header({ unlocked, onLock }: { unlocked: boolean; onLock: () => void }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-5">
        <a href="/" className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-5 w-5" aria-hidden="true">
              <path d="M12 2 3 7v10l9 5 9-5V7l-9-5Z" strokeLinejoin="round" />
              <path d="M12 22V12" strokeLinejoin="round" />
              <path d="M3 7l9 5 9-5" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="min-w-0 leading-tight">
            <div className="truncate text-sm font-bold tracking-tight text-white">Leads Dashboard</div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
              M&amp;P Growth Assistant
            </div>
          </div>
        </a>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {unlocked && (
            <button
              type="button"
              onClick={onLock}
              className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              Lock
            </button>
          )}
          <a
            href="/"
            className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            <span className="hidden sm:inline">← Back to site</span>
            <span className="sm:hidden">← Home</span>
          </a>
        </div>
      </div>
    </header>
  );
}

/* Passcode gate ------------------------------------------------------------- */

function Gate({
  loading,
  onSubmit,
  attempt,
  setAttempt,
  error,
}: {
  loading: boolean;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  attempt: string;
  setAttempt: (v: string) => void;
  error: string;
}) {
  return (
    <section className="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-5 py-16">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-amber-400">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7" aria-hidden="true">
            <rect x="4" y="11" width="16" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className="mt-6 text-center text-2xl font-extrabold tracking-tight text-slate-900">
          Leads dashboard
        </h1>
        <p className="mt-2 text-center text-sm leading-relaxed text-slate-600">
          This dashboard is for the M&amp;P team only. Enter the passcode to view
          captured leads.
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          <input
            type="password"
            autoComplete="off"
            value={attempt}
            onChange={(e) => setAttempt(e.target.value)}
            placeholder="Passcode"
            aria-label="Passcode"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
          />
          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-amber-400 px-6 py-3.5 text-base font-bold text-slate-950 shadow-lg shadow-amber-500/25 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Checking…" : "Unlock dashboard"}
          </button>
        </form>
      </div>
    </section>
  );
}

/* Dashboard body ------------------------------------------------------------- */

function DashboardBody({
  leads,
  visible,
  query,
  setQuery,
  typeFilter,
  setTypeFilter,
  savingId,
  onStatusChange,
  error,
  onExport,
}: {
  leads: Lead[];
  visible: Lead[];
  query: string;
  setQuery: (v: string) => void;
  typeFilter: string;
  setTypeFilter: (v: string) => void;
  savingId: string | null;
  onStatusChange: (id: string, status: string) => void;
  error: string;
  onExport: () => void;
}) {
  const countBy = (s: string) =>
    leads.filter((l) => statusOf(l) === s).length;

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Stat label="Total leads" value={leads.length} highlight />
        {STATUSES.map((s) => (
          <Stat key={s} label={s} value={countBy(s)} />
        ))}
      </div>

      {/* Toolbar */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, phone, or email…"
            aria-label="Search leads"
            className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          aria-label="Filter by business type"
          className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
        >
          <option value="all">All business types</option>
          {BUSINESS_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
          <option value="Unknown">Unknown</option>
        </select>
        <button
          type="button"
          onClick={onExport}
          disabled={leads.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="m7 10 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 15V3" strokeLinecap="round" />
          </svg>
          Export CSV
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
          {error}
        </p>
      )}

      {/* List */}
      <div className="mt-6">
        {leads.length === 0 ? (
          <EmptyState />
        ) : visible.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center">
            <h3 className="text-lg font-bold text-slate-900">No matches</h3>
            <p className="mt-1 text-sm text-slate-600">
              No leads match your search or filter.
            </p>
          </div>
        ) : (
          <>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Showing {visible.length} of {leads.length} leads
            </p>

            {/* Mobile cards */}
            <div className="space-y-4 md:hidden">
              {visible.map((l) => (
                <LeadCard
                  key={l.id}
                  lead={l}
                  saving={savingId === l.id}
                  onStatusChange={(s) => onStatusChange(l.id, s)}
                />
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-3.5">Lead</th>
                    <th className="px-5 py-3.5">Contact</th>
                    <th className="px-5 py-3.5">Message</th>
                    <th className="px-5 py-3.5">Captured</th>
                    <th className="px-5 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visible.map((l) => (
                    <LeadRow
                      key={l.id}
                      lead={l}
                      saving={savingId === l.id}
                      onStatusChange={(s) => onStatusChange(l.id, s)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div
      className={
        highlight
          ? "rounded-2xl bg-slate-950 px-5 py-4 text-white shadow-lg shadow-slate-900/10"
          : "rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm"
      }
    >
      <div className={`text-2xl font-extrabold ${highlight ? "text-amber-400" : "text-slate-900"}`}>
        {value}
      </div>
      <div className={`mt-0.5 text-xs font-semibold uppercase tracking-wider ${highlight ? "text-slate-300" : "text-slate-500"}`}>
        {label}
      </div>
    </div>
  );
}

function BusinessBadge({ businessType }: { businessType: string }) {
  const bt = businessType.trim();
  if (!bt) {
    return (
      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500">
        Unknown
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
      {bt}
    </span>
  );
}

/** Small chips showing where the lead came from + service requested (quote leads). */
function SourceServiceBadges({ lead }: { lead: Lead }) {
  const isQuote = (lead.source ?? "early-access") === "quote";
  return (
    <>
      <span
        className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
          isQuote ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-500"
        }`}
      >
        {isQuote ? "Quote request" : "Early access"}
      </span>
      {lead.service && (
        <span className="inline-flex rounded-full bg-sky-100 px-2.5 py-0.5 text-[11px] font-semibold text-sky-700">
          {lead.service}
        </span>
      )}
    </>
  );
}

function StatusSelect({
  status,
  saving,
  onChange,
}: {
  status: string;
  saving: boolean;
  onChange: (s: string) => void;
}) {
  return (
    <select
      value={status}
      disabled={saving}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Pipeline status"
      className={`rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200 ${
        STATUS_STYLES[status] ?? "bg-slate-100 text-slate-600"
      } disabled:cursor-wait disabled:opacity-60`}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}

function LeadCard({
  lead,
  saving,
  onStatusChange,
}: {
  lead: Lead;
  saving: boolean;
  onStatusChange: (s: string) => void;
}) {
  const l = lead;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-amber-400">
            {initials(l.name) || "?"}
          </div>
          <div className="min-w-0">
            <div className="truncate font-bold text-slate-900">{l.name}</div>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <BusinessBadge businessType={l.businessType} />
              <SourceServiceBadges lead={l} />
            </div>
          </div>
        </div>
        <StatusSelect status={statusOf(l)} saving={saving} onChange={onStatusChange} />
      </div>
      {(l.phone || l.email || l.company) && (
        <div className="mt-3 space-y-0.5 text-sm text-slate-600">
          {l.company && <div className="truncate">🏢 {l.company}</div>}
          {l.phone && <div className="truncate">📞 {l.phone}</div>}
          {l.email && <div className="truncate">✉️ {l.email}</div>}
        </div>
      )}
      {l.message && (
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600">{l.message}</p>
      )}
      <p className="mt-3 text-xs font-medium text-slate-400">
        Captured {formatDate(l.createdAt)}
      </p>
    </div>
  );
}

function LeadRow({
  lead,
  saving,
  onStatusChange,
}: {
  lead: Lead;
  saving: boolean;
  onStatusChange: (s: string) => void;
}) {
  const l = lead;
  return (
    <tr className="transition hover:bg-slate-50/70">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-[11px] font-bold text-amber-400">
            {initials(l.name) || "?"}
          </div>
          <div className="min-w-0">
            <div className="truncate font-bold text-slate-900">{l.name}</div>
            <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
              <BusinessBadge businessType={l.businessType} />
              <SourceServiceBadges lead={l} />
            </div>
          </div>
        </div>
      </td>
      <td className="px-5 py-4">
        <div className="max-w-[220px] space-y-0.5 text-slate-600">
          {l.company && <div className="truncate">🏢 {l.company}</div>}
          {l.phone && <div className="truncate">{l.phone}</div>}
          {l.email && <div className="truncate">{l.email}</div>}
          {!l.phone && !l.email && !l.company && <span className="text-slate-400">—</span>}
        </div>
      </td>
      <td className="px-5 py-4">
        <p className="max-w-[280px] truncate text-slate-600" title={l.message}>
          {l.message || <span className="text-slate-400">—</span>}
        </p>
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-slate-600">{formatDate(l.createdAt)}</td>
      <td className="px-5 py-4">
        <StatusSelect status={statusOf(l)} saving={saving} onChange={onStatusChange} />
      </td>
    </tr>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7" aria-hidden="true">
          <path d="M22 12h-6l-2 3h-4l-2-3H2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h3 className="mt-5 text-lg font-bold text-slate-900">No leads yet</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-slate-600">
        No leads yet — the early-access form and the quote request form will show
        up here.
      </p>
      <a
        href="/product#early-access"
        className="mt-6 inline-block rounded-xl bg-amber-400 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-300"
      >
        Go to the early-access form
      </a>
    </div>
  );
}
