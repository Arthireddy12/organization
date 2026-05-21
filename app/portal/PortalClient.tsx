"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  BarChart3,
  Building2,
  CalendarCheck,
  CircleDollarSign,
  ClipboardPlus,
  MoreVertical,
  Plane,
  TrendingUp,
  UserRoundPlus,
  Users,
  WalletCards,
} from "lucide-react";
import { MetricCard } from "@/components/common/metric-card";
import { Pagination } from "@/components/common/pagination";
import { Panel, PanelHeader } from "@/components/common/panel";

export type OrganizationPortalApi = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  userCount: number;
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

const moduleCards = [
  { label: "Employee Management", icon: Users, tone: "text-blue-600 bg-blue-50" },
  { label: "Attendance", icon: CalendarCheck, tone: "text-emerald-600 bg-emerald-50" },
  { label: "Payroll", icon: WalletCards, tone: "text-orange-600 bg-orange-50" },
  { label: "Leave Management", icon: Plane, tone: "text-violet-600 bg-violet-50" },
  { label: "Performance", icon: TrendingUp, tone: "text-pink-600 bg-pink-50" },
  { label: "Reports & Analytics", icon: BarChart3, tone: "text-cyan-600 bg-cyan-50" },
];

const revenuePoints = [18, 36, 48, 42, 64, 61, 78, 84, 100];
const planColors = ["#7c3aed", "#2563eb", "#22c55e", "#f59e0b", "#ec4899"];
const activityItems = [
  {
    title: "New organization registered",
    time: "2 hours ago",
    icon: ClipboardPlus,
    tone: "text-violet-600 bg-violet-50",
  },
  {
    title: "Subscription renewed",
    time: "5 hours ago",
    icon: WalletCards,
    tone: "text-emerald-600 bg-emerald-50",
  },
  {
    title: "New user added",
    time: "1 day ago",
    icon: UserRoundPlus,
    tone: "text-orange-600 bg-orange-50",
  },
  {
    title: "Payment received",
    time: "2 days ago",
    icon: CircleDollarSign,
    tone: "text-pink-600 bg-pink-50",
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function planTone(planName?: string) {
  const plan = planName?.toLowerCase() ?? "";
  if (plan.includes("enterprise")) return "bg-violet-100 text-violet-700";
  if (plan.includes("professional")) return "bg-blue-100 text-blue-700";
  if (plan.includes("basic")) return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-600";
}

export default function PortalClient({
  initialOrganizations,
}: PortalClientProps) {
  const organizations = initialOrganizations;

  const stats = useMemo(() => {
    const totalOrganizations = organizations.length;
    const activeOrganizations = organizations.filter(
      (org) => org.portal?.isActive,
    ).length;
    const totalUsers = organizations.reduce(
      (sum, org) => sum + org.userCount,
      0,
    );
    return {
      totalOrganizations,
      activeOrganizations,
      totalUsers,
      monthlyRevenue: organizations.reduce(
        (sum, org) => sum + (org.portal?.userLimit ?? 0) * 490,
        0,
      ),
    };
  }, [organizations]);

  const visibleOrganizations = organizations.slice(0, 5);
  const planCounts = organizations.reduce<Record<string, number>>((acc, org) => {
    const plan = org.portal?.planName || "Basic";
    acc[plan] = (acc[plan] || 0) + 1;
    return acc;
  }, {});
  const planEntries = Object.entries(planCounts);
  const chartTotal = planEntries.reduce((sum, [, count]) => sum + count, 0);
  let chartCursor = 0;
  const chartGradient =
    chartTotal > 0
      ? planEntries
          .map(([, count], index) => {
            const start = chartCursor;
            const end = chartCursor + (count / chartTotal) * 100;
            chartCursor = end;
            return `${planColors[index % planColors.length]} ${start}% ${end}%`;
          })
          .join(", ")
      : "#e2e8f0 0% 100%";

  return (
    <div className="px-6 pb-10 pt-4 lg:px-8">
      <div className="mb-5 flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-950">Welcome back, Admin!</h2>
          <p className="mt-1 text-sm text-slate-500">
            Here&apos;s what&apos;s happening on your dashboard today.
          </p>
        </div>
        <Link
          href="/portal/create"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-500"
        >
          Add Organization
        </Link>
      </div>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total Organizations"
          value={stats.totalOrganizations}
          trend="from database"
          icon={<Building2 size={22} />}
          tone="violet"
        />
        <MetricCard
          label="Active Subscriptions"
          value={stats.activeOrganizations}
          trend="from database"
          icon={<Users size={22} />}
          tone="green"
        />
        <MetricCard
          label="Monthly Revenue"
          value={
            stats.monthlyRevenue
              ? `Rs ${stats.monthlyRevenue.toLocaleString("en-IN")}`
              : "Rs 0"
          }
          trend="estimated"
          icon={<CircleDollarSign size={22} />}
          tone="amber"
        />
        <MetricCard
          label="Total Users"
          value={stats.totalUsers}
          trend="from database"
          icon={<BarChart3 size={22} />}
          tone="blue"
        />
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="space-y-5">
          <Panel>
            <PanelHeader
              action={
                <Link href="/portal/organizations" className="text-xs font-semibold text-blue-600">
                  View All Organizations
                </Link>
              }
            >
              <div className="flex items-center gap-2">
                <Building2 size={18} className="text-blue-600" />
                <h3 className="font-bold text-slate-950">Recent Organizations</h3>
              </div>
            </PanelHeader>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-white text-xs font-semibold text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Organization Name</th>
                    <th className="px-5 py-3">Plan</th>
                    <th className="px-5 py-3">Users</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Subscription</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(visibleOrganizations.length ? visibleOrganizations : []).map(
                    (organization, index) => (
                      <tr key={organization.id} className="hover:bg-white">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
                              {initials(organization.name)}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">
                                {organization.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                admin@{organization.slug || `organization-${index + 1}`}.com
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${planTone(
                              organization.portal?.planName,
                            )}`}
                          >
                            {organization.portal?.planName || "Basic"}
                          </span>
                        </td>
                        <td className="px-5 py-3 font-medium text-slate-700">
                          {organization.userCount}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                              organization.portal?.isActive
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-rose-100 text-rose-700"
                            }`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {organization.portal?.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-slate-600">
                          {formatDate(organization.createdAt)}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <Link
                            href={`/portal/${organization.slug}`}
                            className="inline-flex rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                            aria-label={`Manage ${organization.name}`}
                          >
                            <MoreVertical size={18} />
                          </Link>
                        </td>
                      </tr>
                    ),
                  )}
                  {visibleOrganizations.length === 0 && (
                    <tr>
                      <td className="px-5 py-12 text-center text-sm text-slate-500" colSpan={6}>
                        No organizations yet. Add your first organization to fill this table.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination page={1} pageCount={Math.max(1, Math.ceil(organizations.length / 5))} />
          </Panel>

          <div className="grid gap-5 lg:grid-cols-2">
            <Panel className="p-5">
              <h3 className="font-bold text-slate-950">Subscription Overview</h3>
              <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row">
                <div
                  className="grid h-44 w-44 place-items-center rounded-full"
                  style={{
                    background: `conic-gradient(${chartGradient})`,
                  }}
                >
                  <div className="grid h-24 w-24 place-items-center rounded-full bg-white text-center shadow-inner">
                    <div>
                      <p className="text-3xl font-bold text-slate-950">
                        {stats.totalOrganizations}
                      </p>
                      <p className="text-xs text-slate-500">Total</p>
                    </div>
                  </div>
                </div>
                <div className="w-full space-y-3">
                  {planEntries.map(([label, count], index) => (
                    <div key={label} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-slate-600">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            ["bg-violet-600", "bg-blue-600", "bg-emerald-500", "bg-amber-500"][
                              index % 4
                            ]
                          }`}
                        />
                        {label}
                      </span>
                      <span className="font-semibold text-slate-700">{count}</span>
                    </div>
                  ))}
                  {planEntries.length === 0 && (
                    <p className="text-sm text-slate-500">No subscriptions yet.</p>
                  )}
                </div>
              </div>
            </Panel>

            <Panel>
              <PanelHeader
                action={<button className="text-xs font-semibold text-blue-600">View All</button>}
              >
                <h3 className="font-bold text-slate-950">Recent Activities</h3>
              </PanelHeader>
              <div className="space-y-4 p-5">
                {activityItems.map((item) => {
                  const ActivityIcon = item.icon;
                  return (
                    <div key={item.title} className="flex gap-3">
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.tone}`}
                      >
                        <ActivityIcon size={18} />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {item.title}
                        </p>
                        <p className="text-xs text-slate-500">{item.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>
          </div>
        </div>

        <aside className="space-y-5">
          <Panel className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold text-slate-950">Revenue Overview</h3>
              <button className="rounded-lg border border-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-600">
                View Report
              </button>
            </div>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-950">Rs 2,45,000</p>
                <p className="text-xs text-slate-500">Total Revenue</p>
              </div>
              <p className="text-xs font-semibold text-emerald-600">18% vs last month</p>
            </div>
            <div className="mt-5 flex h-36 items-end gap-2 border-b border-slate-100">
              {revenuePoints.map((point, index) => (
                <div key={index} className="flex flex-1 items-end">
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-violet-200 to-violet-500"
                    style={{ height: `${point}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[11px] text-slate-400">
              <span>May 12</span>
              <span>May 26</span>
              <span>Jun 12</span>
            </div>
          </Panel>

          <Panel className="p-5">
            <h3 className="font-bold text-slate-950">HRMS Modules</h3>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {moduleCards.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    className="flex min-h-16 items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-blue-200 hover:bg-blue-50/40"
                  >
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.tone}`}>
                      <Icon size={18} />
                    </span>
                    <span className="text-xs font-semibold leading-tight text-slate-700">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
            <button className="mt-4 text-xs font-semibold text-blue-600">
              View All Modules -&gt;
            </button>
          </Panel>

        </aside>
      </section>
    </div>
  );
}
