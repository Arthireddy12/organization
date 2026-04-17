import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
      <div
        className="pointer-events-none absolute inset-0 opacity-50 dark:opacity-25"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(at 0% 50%, rgb(20 184 166 / 0.18) 0px, transparent 55%), radial-gradient(at 100% 30%, rgb(99 102 241 / 0.14) 0px, transparent 50%)",
        }}
      />
      <main className="relative mx-auto max-w-5xl px-6 py-20 sm:py-28">
        <p className="text-xs font-semibold uppercase tracking-widest text-teal-600 dark:text-teal-400">
          Platform
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          HRMS super admin
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-400">
          Manage organizations, enforce user limits, and control which HR modules each tenant can use.
        </p>
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          <Link
            href="/portal"
            className="group rounded-2xl border border-slate-200/90 bg-white/90 p-7 shadow-lg shadow-slate-200/30 ring-1 ring-slate-200/50 transition hover:-translate-y-0.5 hover:border-teal-200/80 hover:shadow-xl hover:shadow-teal-500/10 dark:border-slate-700/90 dark:bg-slate-900/70 dark:ring-slate-800 dark:hover:border-teal-800/50"
          >
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              Open organization portal
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Create organizations, assign plans, update limits and module permissions.
            </p>
            <span className="mt-4 inline-flex text-sm font-semibold text-teal-700 group-hover:text-teal-600 dark:text-teal-400">
              Go to portal →
            </span>
          </Link>
          <Link
            href="/signup"
            className="group rounded-2xl border border-slate-200/90 bg-white/90 p-7 shadow-lg shadow-slate-200/30 ring-1 ring-slate-200/50 transition hover:-translate-y-0.5 hover:border-teal-200/80 hover:shadow-xl hover:shadow-teal-500/10 dark:border-slate-700/90 dark:bg-slate-900/70 dark:ring-slate-800 dark:hover:border-teal-800/50"
          >
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              Create super admin account
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Sign up, then sign in to manage organizations from the portal.
            </p>
            <span className="mt-4 inline-flex text-sm font-semibold text-teal-700 group-hover:text-teal-600 dark:text-teal-400">
              Sign up →
            </span>
          </Link>
        </div>
      </main>
    </div>
  );
}
