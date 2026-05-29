"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  BarChart3,
  Building2,
  CalendarCheck,
  CircleDollarSign,
  Plane,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react";
import type { ComponentType } from "react";
import { MetricCard } from "@/components/common/metric-card";
import { Panel, PanelHeader } from "@/components/common/panel";

export type OrganizationPortalApi = {
  id: string;
  name: string;
  email?: string | null;
  slug: string;
  createdAt: string;
  updatedAt: string;
  userCount: number;
  startDate: string | null;
  autoDeactivateDate: string | null;
  portal: {
    id: string;
    planName: string | null;
    userLimit: number;
    moduleAccess: string[];
    isActive: boolean;
  } | null;
};

export type InvoicePortalApi = {
  id: string;
  invoiceNumber: string;
  organizationName: string;
  finalAmount: number;
  createdAt: string;
};

type PortalClientProps = {
  initialOrganizations: OrganizationPortalApi[];
  initialInvoices: InvoicePortalApi[];
};

const planColors = ["#7c3aed", "#2563eb", "#22c55e", "#f59e0b", "#ec4899"];

const moduleMeta: Record<string, { icon: ComponentType<{ size?: number }>; tone: string }> = {
  Employees: { icon: Users, tone: "text-blue-600 bg-blue-50" },
  Attendance: { icon: CalendarCheck, tone: "text-emerald-600 bg-emerald-50" },
  "HR Payroll Portal": { icon: WalletCards, tone: "text-orange-600 bg-orange-50" },
  "Payroll Policy Engine": { icon: WalletCards, tone: "text-orange-600 bg-orange-50" },
  Leaves: { icon: Plane, tone: "text-violet-600 bg-violet-50" },
  "Leave Intelligence": { icon: Plane, tone: "text-violet-600 bg-violet-50" },
  Analytics: { icon: BarChart3, tone: "text-cyan-600 bg-cyan-50" },
  Dashboard: { icon: BarChart3, tone: "text-slate-600 bg-slate-50" },
  Projects: { icon: TrendingUp, tone: "text-pink-600 bg-pink-50" },
};

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

function formatCurrency(value: number) {
  return `Rs ${value.toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}

function relativeTime(date: string) {
  const timestamp = new Date(date).getTime();
  if (Number.isNaN(timestamp)) return "";

  const diffMs = Date.now() - timestamp;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < hour) return `${Math.max(1, Math.floor(diffMs / minute))} minutes ago`;
  if (diffMs < day) return `${Math.floor(diffMs / hour)} hours ago`;
  return `${Math.floor(diffMs / day)} days ago`;
}

export default function PortalClient({
  initialOrganizations,
  initialInvoices,
}: PortalClientProps) {
  const organizations = initialOrganizations;
  const invoices = initialInvoices;

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
      totalRevenue: invoices.reduce((sum, invoice) => sum + invoice.finalAmount, 0),
      currentMonthRevenue: invoices.reduce((sum, invoice) => {
        const date = new Date(invoice.createdAt);
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
          ? sum + invoice.finalAmount
          : sum;
      }, 0),
      previousMonthRevenue: invoices.reduce((sum, invoice) => {
        const date = new Date(invoice.createdAt);
        const now = new Date();
        const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return date.getMonth() === previousMonth.getMonth() && date.getFullYear() === previousMonth.getFullYear()
          ? sum + invoice.finalAmount
          : sum;
      }, 0),
    };
  }, [organizations, invoices]);

  const visibleOrganizations = organizations.slice(0, 3);
  const subscriptionCounts = organizations.reduce(
    (acc, org) => {
      const now = new Date();
      const start = org.startDate ? new Date(org.startDate) : null;
      const end = org.autoDeactivateDate ? new Date(org.autoDeactivateDate) : null;
      const willStart = start ? start.getTime() > now.getTime() : false;
      const isExpired = end ? end.getTime() <= now.getTime() : false;

      if (willStart) {
        acc.pending += 1;
      } else if (isExpired) {
        acc.expired += 1;
      } else {
        acc.active += 1;
      }
      return acc;
    },
    { active: 0, expired: 0, pending: 0 },
  );

  const subscriptionEntries = [
    { label: "Active", count: subscriptionCounts.active, color: "#22c55e", badge: "bg-emerald-600" },
    { label: "Expired", count: subscriptionCounts.expired, color: "#ef4444", badge: "bg-rose-600" },
    { label: "Pending Start", count: subscriptionCounts.pending, color: "#2563eb", badge: "bg-blue-600" },
  ];

  const chartTotal = subscriptionEntries.reduce((sum, item) => sum + item.count, 0);
  let chartCursor = 0;
  const chartGradient =
    chartTotal > 0
      ? subscriptionEntries
          .map((item) => {
            const start = chartCursor;
            const end = chartCursor + (item.count / chartTotal) * 100;
            chartCursor = end;
            return `${item.color} ${start}% ${end}%`;
          })
          .join(", ")
      : "#e2e8f0 0% 100%";

  const revenuePoints = useMemo(() => {
    const now = new Date();
    const buckets = Array.from({ length: 9 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (8 - index), 1);
      return { label: date.toLocaleDateString("en", { month: "short" }), total: 0 };
    });

    invoices.forEach((invoice) => {
      const date = new Date(invoice.createdAt);
      const bucket = buckets.find(
        (item, index) => {
          const bucketDate = new Date(now.getFullYear(), now.getMonth() - (8 - index), 1);
          return date.getMonth() === bucketDate.getMonth() && date.getFullYear() === bucketDate.getFullYear();
        },
      );
      if (bucket) bucket.total += invoice.finalAmount;
    });

    const max = Math.max(...buckets.map((bucket) => bucket.total), 1);
    return buckets.map((bucket) => ({
      ...bucket,
      height: bucket.total > 0 ? Math.max(12, (bucket.total / max) * 100) : 8,
    }));
  }, [invoices]);

  const revenueTrend = stats.previousMonthRevenue
    ? ((stats.currentMonthRevenue - stats.previousMonthRevenue) / stats.previousMonthRevenue) * 100
    : stats.currentMonthRevenue > 0
      ? 100
      : 0;

  const activityItems = useMemo(() => {
    const organizationActivities = organizations.slice(0, 5).map((org) => ({
      id: `org-${org.id}`,
      title: `${org.name} registered`,
      time: relativeTime(org.createdAt),
      createdAt: org.createdAt,
      icon: Building2,
      tone: "text-violet-600 bg-violet-50",
    }));

    const invoiceActivities = invoices.slice(0, 5).map((invoice) => ({
      id: `invoice-${invoice.id}`,
      title: `${invoice.invoiceNumber} generated`,
      time: relativeTime(invoice.createdAt),
      createdAt: invoice.createdAt,
      icon: CircleDollarSign,
      tone: "text-emerald-600 bg-emerald-50",
    }));

    return [...organizationActivities, ...invoiceActivities]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4);
  }, [organizations, invoices]);

  const moduleCards = useMemo(() => {
    const counts = organizations.reduce<Record<string, number>>((acc, org) => {
      org.portal?.moduleAccess.forEach((moduleName) => {
        acc[moduleName] = (acc[moduleName] || 0) + 1;
      });
      return acc;
    }, {});

    return Object.entries(counts)
      .sort(([, firstCount], [, secondCount]) => secondCount - firstCount)
      .slice(0, 6)
      .map(([label, count]) => {
        const meta = moduleMeta[label] || { icon: BarChart3, tone: "text-slate-600 bg-slate-50" };
        return { label, count, ...meta };
      });
  }, [organizations]);

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
            stats.currentMonthRevenue
              ? formatCurrency(stats.currentMonthRevenue)
              : "Rs 0"
          }
          trend="from invoices"
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
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-white text-xs font-semibold text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Organization Name</th>
                    <th className="px-5 py-3">Users</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Subscription dates</th>
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
                                {organization.email ||
                                  `admin@${organization.slug || `organization-${index + 1}`}.com`}
                              </p>
                            </div>
                          </div>
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
                          <div className="font-semibold text-slate-800">
                            {organization.startDate ? formatDate(organization.startDate) : "-"}
                          </div>
                          <div className="text-xs text-slate-500">
                            {organization.autoDeactivateDate
                              ? `Ends ${formatDate(organization.autoDeactivateDate)}`
                              : "No end date"}
                          </div>
                        </td>
                      </tr>
                    ),
                  )}
                  {visibleOrganizations.length === 0 && (
                    <tr>
                      <td className="px-5 py-12 text-center text-sm text-slate-500" colSpan={4}>
                        No organizations yet. Add your first organization to fill this table.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Panel>

          <div className="grid gap-5 lg:grid-cols-2">
            <Panel className="p-5">
              <h3 className="font-bold text-slate-950">Subscription Overview</h3>
              <div className="mt-6 grid items-center gap-6 sm:grid-cols-[180px_minmax(0,1fr)]">
                <div
                  className="relative mx-auto grid aspect-square w-44 shrink-0 place-items-center rounded-full"
                  style={{
                    background: `conic-gradient(${chartGradient})`,
                  }}
                >
                  <div className="absolute inset-12 grid place-items-center rounded-full bg-white text-center shadow-inner">
                    <div>
                      <p className="text-3xl font-bold text-slate-950">
                        {stats.totalOrganizations}
                      </p>
                      <p className="text-xs text-slate-500">Total</p>
                    </div>
                  </div>
                </div>
                <div className="w-full space-y-4">
                  {subscriptionEntries.map((entry) => (
                    <div key={entry.label} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-slate-600">
                        <span className={`h-2.5 w-2.5 rounded-full ${entry.badge}`} />
                        {entry.label}
                      </span>
                      <span className="font-semibold text-slate-700">{entry.count}</span>
                    </div>
                  ))}
                  {chartTotal === 0 && (
                    <p className="text-sm text-slate-500">No subscription dates available yet.</p>
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
                <p className="text-2xl font-bold text-slate-950">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-xs text-slate-500">Total Revenue</p>
              </div>
              <p className={`text-xs font-semibold ${revenueTrend >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {Math.abs(revenueTrend).toFixed(0)}% vs last month
              </p>
            </div>
            <div className="mt-5 flex h-36 items-end gap-2 border-b border-slate-100">
              {revenuePoints.map((point, index) => (
                <div key={index} className="flex flex-1 items-end">
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-violet-200 to-violet-500"
                    style={{ height: `${point.height}%` }}
                    title={`${point.label}: ${formatCurrency(point.total)}`}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[11px] text-slate-400">
              <span>{revenuePoints[0]?.label ?? "-"}</span>
              <span>{revenuePoints[Math.floor(revenuePoints.length / 2)]?.label ?? "-"}</span>
              <span>{revenuePoints[revenuePoints.length - 1]?.label ?? "-"}</span>
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
                      <span className="mt-1 block text-[11px] font-medium text-slate-400">
                        {item.count} orgs
                      </span>
                    </span>
                  </button>
                );
              })}
              {moduleCards.length === 0 && (
                <p className="col-span-2 text-sm text-slate-500">
                  No module access has been configured yet.
                </p>
              )}
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
