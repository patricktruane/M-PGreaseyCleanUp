import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-slate-950 px-5 text-center text-white">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950">
        <span className="text-sm font-extrabold tracking-tight">M·P</span>
      </div>
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight">
        Page not found
      </h1>
      <p className="mt-3 max-w-sm text-slate-400">
        That page doesn&apos;t exist — but the crew is still here.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-xl bg-amber-400 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/25 transition hover:bg-amber-300"
      >
        Back to the site
      </Link>
    </div>
  );
}
