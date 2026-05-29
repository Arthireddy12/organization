"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  errorBoxClass,
  formInputClass,
  formLabelClass,
  primaryButtonClass,
  successBoxClass,
} from "@/lib/form-styles";


type OrganizationSettingsProps = {
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  /** Pre-formatted on the server to avoid locale hydration mismatches */
  organizationCreatedAtLabel: string;
  initialUserLimit: number;
  initialModules: string[];
  initialIsActive: boolean;
  initialStartDate: string | null;
  initialAutoDeactivateDate: string | null;
};

const moduleOptions = [
  "Attendance",
  "Leave",
  "Payroll",
  "Recruitment",
  "Performance & Goals",
  "Helpdesk",
  "Shift",
] as const;

const MODULES_PER_ROW = 4;

const moduleConfirmToastDuration = Number.POSITIVE_INFINITY;

export default function OrganizationSettingsClient({
  organizationId,
  organizationName,
  organizationSlug,
  organizationCreatedAtLabel,
  initialUserLimit,
  initialModules,
  initialIsActive,
  initialStartDate,
  initialAutoDeactivateDate,
}: OrganizationSettingsProps) {
  const router = useRouter();
  const todayDate = getTodayDateInputValue();
  const [userLimit, setUserLimit] = useState(initialUserLimit);
  const [isActive, setIsActive] = useState(initialIsActive);
  const [startDate, setStartDate] = useState(
    initialStartDate ? initialStartDate.slice(0, 10) : "",
  );
  const [autoDeactivateDate, setAutoDeactivateDate] = useState(
    initialAutoDeactivateDate ? initialAutoDeactivateDate.slice(0, 10) : "",
  );
  const [selectedModules, setSelectedModules] = useState<Set<string>>(
    new Set(initialModules),
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAllModules, setShowAllModules] = useState(false);

  const hasExtraModules = moduleOptions.length > MODULES_PER_ROW;
  const visibleModuleNames = showAllModules
    ? moduleOptions
    : moduleOptions.slice(0, MODULES_PER_ROW);

  function promptModuleToggle(moduleName: string) {
    const isEnabled = selectedModules.has(moduleName);

    if (isEnabled) {
      const id = toast.message(`Disable ${moduleName}?`, {
        description: `Are you sure you want to disable ${moduleName}?`,
        duration: moduleConfirmToastDuration,
        action: {
          label: "Disable",
          onClick: () => {
            setSelectedModules((prev) => {
              const next = new Set(prev);
              next.delete(moduleName);
              return next;
            });
            toast.dismiss(id);
            toast.info(`${moduleName} disabled`, {
              description: "Save settings to apply this change.",
            });
          },
        },
        cancel: {
          label: "Cancel",
          onClick: () => toast.dismiss(id),
        },
      });
      return;
    }

    const id = toast.message(`Enable ${moduleName}?`, {
      description: `Are you sure you want to enable ${moduleName}?`,
      duration: moduleConfirmToastDuration,
      action: {
        label: "Enable",
        onClick: () => {
          setSelectedModules((prev) => new Set(prev).add(moduleName));
          toast.dismiss(id);
          toast.success(`${moduleName} enabled`, {
            description: "Save settings to apply this change.",
          });
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => toast.dismiss(id),
      },
    });
  }

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (autoDeactivateDate && autoDeactivateDate < todayDate) {
      setError("Auto deactivate / subscription end date cannot be before today.");
      setMessage(null);
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`/api/portal/${organizationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userLimit,
          isActive,
          startDate: startDate || null,
          autoDeactivateDate: autoDeactivateDate || null,
          moduleAccess: Array.from(selectedModules),
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error || "Failed to save organization settings");
      }

      setMessage("Settings saved successfully.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex w-full max-w-none flex-1 flex-col gap-10 px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <header>
          <Link
            href="/portal"
            className="text-sm font-medium text-teal-700 transition hover:text-teal-600 dark:text-teal-400 dark:hover:text-teal-300"
          >
            ← Back to organizations
          </Link>
          <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-teal-600 dark:text-teal-400">
            Tenant settings
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {organizationName}
          </h1>
          <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-400">
            <span className="rounded-lg bg-white px-2.5 py-1 font-mono text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {organizationSlug}
            </span>
            <span>Created {organizationCreatedAtLabel}</span>
          </div>
        </header>

        <section
          aria-labelledby="allowed-modules-heading"
          className="flex flex-col gap-4 border-0 p-0"
        >
          <h2 id="allowed-modules-heading" className={formLabelClass}>
            Allowed modules
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-500">
            Tap a card to change access, then confirm in the toast. Four modules per row; use Show more for the rest.
          </p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {visibleModuleNames.map((moduleName) => {
              const enabled = selectedModules.has(moduleName);
              return (
                <button
                  key={moduleName}
                  type="button"
                  onClick={() => promptModuleToggle(moduleName)}
                  className={`flex flex-col items-start rounded-2xl border p-4 text-left shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 ${
                    enabled
                      ? "border-teal-500/50 bg-gradient-to-br from-teal-500/10 to-emerald-600/5 ring-1 ring-teal-500/20 dark:from-teal-950/40 dark:to-emerald-950/20 dark:border-teal-600/40"
                      : "border-slate-200/90 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:border-slate-600"
                  }`}
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Module
                  </span>
                  <span className="mt-2 text-base font-semibold text-slate-900 dark:text-white">
                    {moduleName}
                  </span>
                  <span
                    className={`mt-3 inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      enabled
                        ? "bg-emerald-500/15 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300"
                        : "bg-slate-200/80 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                    }`}
                  >
                    {enabled ? "Enabled" : "Disabled"}
                  </span>
                </button>
              );
            })}
          </div>
          {hasExtraModules ? (
            <button
              type="button"
              onClick={() => setShowAllModules((open) => !open)}
              className="w-fit text-sm font-semibold text-teal-700 underline-offset-4 hover:underline dark:text-teal-400"
            >
              {showAllModules ? "Show less" : "Show more"}
            </button>
          ) : null}
        </section>

        <section className="rounded-2xl border border-slate-200/90 bg-white/90 p-6 shadow-xl shadow-slate-200/40 ring-1 ring-slate-200/50 backdrop-blur-sm dark:border-slate-700/90 dark:bg-slate-900/80 dark:shadow-none dark:ring-slate-800 sm:p-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Organization settings
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Status, subscription dates, and user limit. Save to apply module changes together with these fields.
          </p>

          {message ? <div className={`mt-6 ${successBoxClass}`}>{message}</div> : null}
          {error ? <div className={`mt-6 ${errorBoxClass}`}>{error}</div> : null}

          <form className="mt-8 space-y-8" onSubmit={saveSettings}>
            <div>
              <p className={formLabelClass}>Status</p>
              <label className="inline-flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(event) => setIsActive(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <span>{isActive ? "Organization is active" : "Organization is deactivated"}</span>
              </label>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="startDate" className={formLabelClass}>
                  Start date
                </label>
                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className={formInputClass}
                />
              </div>

              <div>
                <label htmlFor="autoDeactivateDate" className={formLabelClass}>
                  Auto deactivate / subscription end
                </label>
                <input
                  id="autoDeactivateDate"
                  type="date"
                  min={todayDate}
                  value={autoDeactivateDate}
                  onChange={(event) => setAutoDeactivateDate(event.target.value)}
                  className={formInputClass}
                />
              </div>
            </div>

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

            <button type="submit" disabled={saving} className={primaryButtonClass}>
              {saving ? "Saving…" : "Save settings"}
            </button>
          </form>
        </section>

        {/* Delete section */}
        <section className="rounded-2xl border border-rose-200/80 bg-white/90 p-6 shadow-xl shadow-rose-200/20 ring-1 ring-rose-200/50 backdrop-blur-sm dark:border-rose-900/50 dark:bg-slate-900/80 dark:shadow-none dark:ring-rose-900/30">
          <h2 className="text-lg font-semibold text-rose-800 dark:text-rose-300">
            Danger zone
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Deleting this organization will permanently remove all associated users, departments, employees, and data. This cannot be undone.
          </p>

          {error ? <div className={`mt-6 ${errorBoxClass}`}>{error}</div> : null}

          <button
            type="button"
            disabled={deleting}
            onClick={async () => {
              const confirmed = window.confirm(
                `Are you sure you want to delete "${organizationName}"? This action cannot be undone. All associated data will be permanently removed.`,
              );
              if (!confirmed) return;

              setDeleting(true);
              setError(null);

              try {
                const response = await fetch(`/api/portal/${organizationId}`, {
                  method: "DELETE",
                });

                if (!response.ok) {
                  const payload = (await response.json()) as { error?: string };
                  throw new Error(payload.error || "Failed to delete organization");
                }

                toast.success(`${organizationName} deleted`);
                router.push("/portal");
                router.refresh();
              } catch (deleteError) {
                setError(deleteError instanceof Error ? deleteError.message : "Unknown error");
                setDeleting(false);
              }
            }}
            className="mt-6 inline-flex items-center justify-center rounded-xl border border-rose-300 bg-rose-50 px-5 py-2.5 text-sm font-semibold text-rose-700 shadow-sm transition hover:bg-rose-100 hover:text-rose-800 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300 dark:hover:bg-rose-950/60"
          >
            {deleting ? "Deleting…" : `Delete "${organizationName}"`}
          </button>
        </section>
    </div>
  );
}

function getTodayDateInputValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
