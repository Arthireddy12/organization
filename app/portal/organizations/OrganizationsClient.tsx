"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { 
  Edit3, 
  Eye, 
  MoreVertical, 
  Search, 
  Filter, 
  Plus, 
  TrendingUp, 
  Building2, 
  Users2, 
  CreditCard, 
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

export type OrganizationListItem = {
  id: string;
  name: string;
  email?: string; 
  phone: string;
  industry: string;
  address: string;
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  adminDesignation: string;
  slug: string;
  planName: string;
  userLimit: number;
  userCount: number;
  isActive: boolean;
  status?: 'Active' | 'Inactive' | 'Trial'; 
  startDate: string | null;
  createdAt: string;
  autoDeactivateDate: string | null;
  moduleAccess: string[];
};

type OrganizationsClientProps = {
  initialOrganizations: OrganizationListItem[];
};

export default function OrganizationsClient({ initialOrganizations }: OrganizationsClientProps) {
  const [organizations, setOrganizations] = useState(initialOrganizations);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredOrganizations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return organizations.filter((org) => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" ? org.isActive : !org.isActive);

      if (!matchesStatus) return false;
      if (!query) return true;

      return [
        org.name,
        org.email,
        org.slug,
        org.phone,
        org.industry,
        org.adminName,
        org.adminEmail,
      ]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(query));
    });
  }, [organizations, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const totalOrganizations = filteredOrganizations.length;
    const activeOrganizations = filteredOrganizations.filter((org) => org.isActive).length;
    const totalUsers = filteredOrganizations.reduce((sum, org) => sum + org.userCount, 0);

    return [
      {
        label: "Total Organizations",
        value: totalOrganizations,
        hint: "from database",
        icon: <Building2 className="text-violet-600" size={18} />,
        bg: "bg-violet-50",
      },
      {
        label: "Active Organizations",
        value: activeOrganizations,
        hint: "currently active",
        icon: <Users2 className="text-emerald-600" size={18} />,
        bg: "bg-emerald-50",
      },
      {
        label: "Total Subscriptions",
        value: totalOrganizations,
        hint: "same as organizations",
        icon: <CreditCard className="text-blue-600" size={18} />,
        bg: "bg-blue-50",
      },
      {
        label: "Total Users",
        value: totalUsers,
        hint: "from users table",
        icon: <Users2 className="text-rose-600" size={18} />,
        bg: "bg-rose-50",
      },
    ];
  }, [filteredOrganizations]);

  async function deleteOrganization(org: OrganizationListItem) {
    const confirmed = window.confirm(`Delete "${org.name}"? This action cannot be undone.`);
    if (!confirmed) {
      setOpenActionMenuId(null);
      return;
    }

    setDeletingId(org.id);
    setOpenActionMenuId(null);

    try {
      const response = await fetch(`/api/portal/${org.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string; details?: string };
        throw new Error(payload.error || payload.details || "Failed to delete organization");
      }

      setOrganizations((current) => current.filter((item) => item.id !== org.id));
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-screen font-sans text-slate-900">
      {/* Stats Cards */}
      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="mb-2 flex items-start justify-between">
              <div className={`${stat.bg} rounded-lg p-2`}>{stat.icon}</div>
            </div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{stat.label}</p>
            <h3 className="mt-0.5 text-xl font-bold leading-tight text-slate-950">{stat.value}</h3>
            <div className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-emerald-500">
              <TrendingUp size={12} />
              <span className="font-medium text-slate-400">{stat.hint}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Table Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Table Toolbar */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="font-bold text-lg">Organizations</h2>
            <p className="text-xs text-slate-500 font-medium">View and manage all your organizations</p>
          </div>
          <div className="flex flex-wrap justify-end gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                placeholder="Search organization..." 
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs w-64"
              />
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowFilters((open) => !open)}
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                <Filter size={16} />
                {statusFilter === "all" ? "Filter" : statusFilter === "active" ? "Active" : "Inactive"}
              </button>
              {showFilters ? (
                <div className="absolute right-0 top-11 z-20 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg shadow-slate-200/70">
                  {[
                    { label: "All", value: "all" },
                    { label: "Active", value: "active" },
                    { label: "Inactive", value: "inactive" },
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => {
                        setStatusFilter(item.value as "all" | "active" | "inactive");
                        setShowFilters(false);
                      }}
                      className={`block w-full px-4 py-2 text-left text-xs font-bold transition ${
                        statusFilter === item.value
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <Link href="/portal/create" className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100">
              <Plus size={16} /> Add Organization
            </Link>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F9FAFB] text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-8 py-4">Organization</th>
                <th className="px-6 py-4 text-center">Users</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Renewal Date</th>
                <th className="px-6 py-4">Created On</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredOrganizations.map((org, index) => {
                const openUpward = index >= Math.max(filteredOrganizations.length - 2, 0);
                return (
                <tr key={org.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm ${getAvatarColor(org.name)}`}>
                        {org.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-900">{org.name}</p>
                        <p className="text-[11px] text-slate-500 font-medium">{org.email || `${org.slug}@tech.com`}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex items-center justify-center gap-1.5 font-bold text-slate-700 text-sm">
                      <Users2 size={16} className="text-slate-400" />
                      {org.userCount}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-bold ${org.isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${org.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      {org.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-bold text-slate-800">
                      {org.autoDeactivateDate ? formatDate(org.autoDeactivateDate) : "-"}
                    </p>
                    <p className="text-[11px] text-slate-400 font-bold mt-0.5">
                      {org.autoDeactivateDate ? "Subscription end" : "No renewal date"}
                    </p>
                  </td>
                  <td className="px-6 py-5 text-sm font-bold text-slate-500">
                    {formatDate(org.createdAt)}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-1">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenActionMenuId((current) => (current === org.id ? null : org.id))
                          }
                          className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
                          aria-label={`More actions for ${org.name}`}
                        >
                        <MoreVertical size={18} />
                        </button>
                        {openActionMenuId === org.id ? (
                          <div
                            className={`absolute right-0 z-20 w-36 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-left shadow-lg shadow-slate-200/70 ${
                              openUpward ? "bottom-10" : "top-10"
                            }`}
                          >
                            <Link
                              href={`/portal/create?id=${org.id}&mode=view`}
                              className="flex w-full items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                            >
                              <Eye size={15} /> View
                            </Link>
                            <Link
                              href={`/portal/create?id=${org.id}&mode=edit`}
                              className="flex w-full items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                            >
                              <Edit3 size={15} /> Edit
                            </Link>
                            <button
                              type="button"
                              onClick={() => deleteOrganization(org)}
                              disabled={deletingId === org.id}
                              className="flex w-full items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"
                            >
                              <X size={15} /> {deletingId === org.id ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </td>
                </tr>
              );
              })}
              {filteredOrganizations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-sm font-semibold text-slate-500">
                    No organizations match your search or filter.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="px-8 py-5 border-t border-slate-100 flex justify-between items-center text-[11px] font-bold text-slate-400">
          <p>
            Showing {filteredOrganizations.length ? 1 : 0} to {filteredOrganizations.length} of{" "}
            {organizations.length} organizations
          </p>
          <div className="flex items-center gap-2">
            <button className="p-1 border border-slate-200 rounded-md hover:bg-slate-50"><ChevronLeft size={16}/></button>
            <button className="w-7 h-7 flex items-center justify-center bg-indigo-600 text-white rounded-md">1</button>
            <button className="w-7 h-7 flex items-center justify-center hover:bg-slate-100 rounded-md">2</button>
            <button className="w-7 h-7 flex items-center justify-center hover:bg-slate-100 rounded-md">3</button>
            <span className="mx-1">...</span>
            <button className="w-7 h-7 flex items-center justify-center hover:bg-slate-100 rounded-md">8</button>
            <button className="p-1 border border-slate-200 rounded-md hover:bg-slate-50"><ChevronRight size={16}/></button>
            
            <div className="ml-4 flex items-center gap-2 border border-slate-200 px-2 py-1 rounded-md text-slate-600">
              <span>10 / page</span>
              <ChevronDown size={14} />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

function getAvatarColor(name: string) {
  const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-orange-500', 'bg-blue-500', 'bg-rose-500', 'bg-violet-500'];
  const index = name.length % colors.length;
  return colors[index];
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function ChevronDown({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>;
}
