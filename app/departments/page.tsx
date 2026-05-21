import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { secondaryLinkButtonClass } from "@/lib/form-styles";

export default async function DepartmentsPage() {
  const departments = await prisma.department.findMany({
    orderBy: { name: "asc" },
    include: {
      organization: {
        select: { name: true },
      },
    },
  });

  return (
    <div className="px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-teal-600 dark:text-teal-400">
              Directory
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Departments
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Departments across all organizations.
            </p>
          </div>
          <Link href="/portal" className={secondaryLinkButtonClass}>
            ← Back to dashboard
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white/90 shadow-xl shadow-slate-200/30 ring-1 ring-slate-200/50 backdrop-blur-sm dark:border-slate-700/90 dark:bg-slate-900/80 dark:shadow-none dark:ring-slate-800">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-white dark:bg-slate-950/80">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Organization</th>
                <th className="px-5 py-3">Designations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
              {departments.length === 0 ? (
                <tr>
                  <td className="px-5 py-10 text-center text-slate-500" colSpan={3}>
                    No departments found.
                  </td>
                </tr>
              ) : (
                departments.map((department) => (
                  <tr
                    key={department.id}
                    className="transition hover:bg-white dark:hover:bg-slate-800/40"
                  >
                    <td className="px-5 py-4 font-medium text-slate-900 dark:text-slate-100">
                      {department.name}
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-400">
                      {department.organization?.name ?? "—"}
                    </td>
                    <td className="px-5 py-4 tabular-nums text-slate-700 dark:text-slate-300">
                      {department.designations.length}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
    </div>
  );
}
