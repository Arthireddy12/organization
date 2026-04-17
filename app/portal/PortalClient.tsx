"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export type OrganizationPortalApi = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  portal: {
    id: string;
    planName: string;
    userLimit: number;
    moduleAccess: string[];
    isActive: boolean;
  } | null;
};

type PortalClientProps = {
  initialOrganizations: OrganizationPortalApi[];
};

export default function PortalClient({
  initialOrganizations,
}: PortalClientProps) {
  const router = useRouter();
  const [organizations] = useState(initialOrganizations);

  const stats = useMemo(() => {
    const totalOrganizations = organizations.length;
    const activeOrganizations = organizations.filter(
      (org) => org.portal?.isActive,
    ).length;
    const totalUserLimit = organizations.reduce(
      (sum, org) => sum + (org.portal?.userLimit ?? 0),
      0,
    );
    const totalModulesEnabled = organizations.reduce((sum, org) => {
      return sum + (org.portal?.moduleAccess.length ?? 0);
    }, 0);

    return {
      totalOrganizations,
      activeOrganizations,
      totalUserLimit,
      totalModulesEnabled,
    };
  }, [organizations]);

  async function logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
      <div
        className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-20"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(at 0% 0%, rgb(20 184 166 / 0.15) 0px, transparent 50%), radial-gradient(at 100% 0%, rgb(99 102 241 / 0.12) 0px, transparent 45%)",
        }}
      />

      <main className="relative mx-auto w-full max-w-none flex-1 px-4 pb-16 pt-8 sm:px-6 lg:px-10 xl:px-14 2xl:px-16">
        <header className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-teal-600 dark:text-teal-400">
              Control center
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Organization portal
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Manage tenants, user limits, and which HR modules each organization can use.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/portal/create"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-600/25 transition hover:from-teal-500 hover:to-emerald-500 hover:shadow-teal-500/30"
            >
              Create organization
            </Link>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white/80 px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm backdrop-blur transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Log out
            </button>
          </div>
        </header>

        <section className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Organizations",
              value: stats.totalOrganizations,
              hint: "Total registered",
              accent: "from-teal-500/10 to-teal-600/5",
            },
            {
              label: "Active",
              value: stats.activeOrganizations,
              hint: "Currently enabled",
              accent: "from-emerald-500/10 to-emerald-600/5",
            },
            {
              label: "User capacity",
              value: stats.totalUserLimit,
              hint: "Seats across orgs",
              accent: "from-violet-500/10 to-violet-600/5",
            },
            {
              label: "Module grants",
              value: stats.totalModulesEnabled,
              hint: "Enabled module slots",
              accent: "from-amber-500/10 to-amber-600/5",
            },
          ].map((card) => (
            <article
              key={card.label}
              className={`relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br ${card.accent} p-5 shadow-sm backdrop-blur-sm dark:border-slate-700/80 dark:from-slate-800/50 dark:to-slate-900/50`}
            >
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {card.label}
              </p>
              <p className="mt-2 text-3xl font-bold tabular-nums text-slate-900 dark:text-white">
                {card.value}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                {card.hint}
              </p>
            </article>
          ))}
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {organizations.length === 0 ? (
            <article className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white/60 px-8 py-16 text-center dark:border-slate-700 dark:bg-slate-900/40">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                No organizations yet
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Create your first organization to get started.
              </p>
              <Link
                href="/portal/create"
                className="mt-4 inline-flex rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-500"
              >
                Create organization
              </Link>
            </article>
          ) : (
            organizations.map((organization) => (
              <article
                key={organization.id}
                className="group flex flex-col rounded-2xl border border-slate-200/90 bg-white/90 p-6 shadow-sm ring-1 ring-slate-200/50 transition hover:-translate-y-0.5 hover:border-teal-200/80 hover:shadow-lg hover:shadow-teal-500/5 dark:border-slate-700/90 dark:bg-slate-900/80 dark:ring-slate-800 dark:hover:border-teal-800/60"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Organization
                    </p>
                    <h2 className="mt-0.5 text-lg font-semibold text-slate-900 dark:text-white">
                      {organization.name}
                    </h2>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      organization.portal?.isActive
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {organization.portal?.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="mt-3 font-mono text-[11px] text-slate-500 dark:text-slate-500">
                  {organization.slug}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {(organization.portal?.moduleAccess ?? []).slice(0, 6).map((moduleName) => (
                    <span
                      key={moduleName}
                      className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {moduleName}
                    </span>
                  ))}
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                  <span className="text-xs text-slate-500">
                    Limit:{" "}
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {organization.portal?.userLimit ?? "—"}
                    </span>
                  </span>
                  <Link
                    href={`/portal/${organization.slug}`}
                    className="rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white transition group-hover:bg-teal-600 dark:bg-white dark:text-slate-900 dark:group-hover:bg-teal-400 dark:group-hover:text-slate-900"
                  >
                    Manage
                  </Link>
                </div>
              </article>
            ))
          )}
        </section>
      </main>
    </div>
  );
}
