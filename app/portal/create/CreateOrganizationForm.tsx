"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  errorBoxClass,
  formInputClass,
  formLabelClass,
  infoBoxClass,
  pageShellClass,
  primaryButtonClass,
  secondaryLinkButtonClass,
} from "@/lib/form-styles";

const moduleOptions = [
  "Attendance",
  "Leave",
  "Payroll",
  "Recruitment",
  "Performance",
  "Shift",
];

export default function CreateOrganizationForm() {
  const router = useRouter();
  const [organizationName, setOrganizationName] = useState("");
  const [superAdminName, setSuperAdminName] = useState("");
  const [superAdminEmail, setSuperAdminEmail] = useState("");
  const [superAdminPassword, setSuperAdminPassword] = useState("");
  const [userLimit, setUserLimit] = useState(25);
  const [autoDeactivateDate, setAutoDeactivateDate] = useState("");
  const [selectedModules, setSelectedModules] = useState<Set<string>>(
    new Set(["Attendance", "Leave"]),
  );
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleModule(moduleName: string) {
    setSelectedModules((current) => {
      const next = new Set(current);
      if (next.has(moduleName)) {
        next.delete(moduleName);
      } else {
        next.add(moduleName);
      }
      return next;
    });
  }

  async function handleCreateOrganization(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    setError(null);

    try {
      const response = await fetch("/api/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationName,
          superAdminName,
          superAdminEmail,
          superAdminPassword,
          planName: "Starter",
          userLimit,
          autoDeactivateDate: autoDeactivateDate || null,
          moduleAccess: Array.from(selectedModules),
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error || "Failed to create organization");
      }

      router.push("/portal");
      router.refresh();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Unknown error");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className={`${pageShellClass} flex min-h-[100dvh] w-full flex-col`}>
      <div
        className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-20"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(at 0% 0%, rgb(20 184 166 / 0.12) 0px, transparent 50%), radial-gradient(at 100% 100%, rgb(99 102 241 / 0.1) 0px, transparent 45%)",
        }}
      />
      <main className="relative mx-auto w-full max-w-none flex-1 px-4 pb-16 pt-10 sm:px-6 lg:px-10 xl:px-14 2xl:px-16">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-teal-600 dark:text-teal-400">
              New tenant
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Create organization
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-600 dark:text-slate-400">
              Add an organization and its org super-admin. Start date matches the create date automatically.
            </p>
          </div>
          <Link href="/portal" className={secondaryLinkButtonClass}>
            ← Back to portal
          </Link>
        </div>

        <section className="rounded-2xl border border-slate-200/90 bg-white/90 p-6 shadow-xl shadow-slate-200/40 ring-1 ring-slate-200/50 backdrop-blur-sm dark:border-slate-700/90 dark:bg-slate-900/80 dark:shadow-none dark:ring-slate-800 sm:p-8">
          {error ? <div className={`mb-6 ${errorBoxClass}`}>{error}</div> : null}

          <div className={`mb-8 ${infoBoxClass}`}>
            Start date is set to the organization create date. Choose subscription end and modules below.
          </div>

          <form className="space-y-8" onSubmit={handleCreateOrganization}>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Organization
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                Display name for this tenant.
              </p>
              <div className="mt-4">
                <label htmlFor="orgName" className={formLabelClass}>
                  Name
                </label>
                <input
                  id="orgName"
                  value={organizationName}
                  onChange={(event) => setOrganizationName(event.target.value)}
                  placeholder="Acme Corp"
                  className={formInputClass}
                  required
                />
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Org super-admin
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                First user for this organization; they sign in with this email and password.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="adminName" className={formLabelClass}>
                    Full name
                  </label>
                  <input
                    id="adminName"
                    value={superAdminName}
                    onChange={(event) => setSuperAdminName(event.target.value)}
                    placeholder="Jane Doe"
                    className={formInputClass}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="adminEmail" className={formLabelClass}>
                    Email
                  </label>
                  <input
                    id="adminEmail"
                    type="email"
                    value={superAdminEmail}
                    onChange={(event) => setSuperAdminEmail(event.target.value)}
                    placeholder="admin@company.com"
                    className={formInputClass}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="adminPassword" className={formLabelClass}>
                    Password
                  </label>
                  <input
                    id="adminPassword"
                    type="password"
                    value={superAdminPassword}
                    onChange={(event) => setSuperAdminPassword(event.target.value)}
                    placeholder="Min. 8 characters"
                    minLength={8}
                    className={formInputClass}
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Plan & limits
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="userLimit" className={formLabelClass}>
                    User limit
                  </label>
                  <input
                    id="userLimit"
                    type="number"
                    min={1}
                    value={userLimit}
                    onChange={(event) => setUserLimit(Number(event.target.value))}
                    className={formInputClass}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="subEnd" className={formLabelClass}>
                    Subscription end (optional)
                  </label>
                  <input
                    id="subEnd"
                    type="date"
                    value={autoDeactivateDate}
                    onChange={(event) => setAutoDeactivateDate(event.target.value)}
                    className={formInputClass}
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Modules
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                Toggle which HR modules this organization can access.
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {moduleOptions.map((moduleName) => {
                  const checked = selectedModules.has(moduleName);
                  return (
                    <label
                      key={moduleName}
                      className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-sm transition ${
                        checked
                          ? "border-teal-500/50 bg-teal-50/80 text-teal-950 dark:border-teal-600/50 dark:bg-teal-950/30 dark:text-teal-100"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300"
                      }`}
                    >
                      <span className="font-medium">{moduleName}</span>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleModule(moduleName)}
                        className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                      />
                    </label>
                  );
                })}
              </div>
            </div>

            <button type="submit" disabled={creating} className={primaryButtonClass}>
              {creating ? "Creating…" : "Create organization"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
