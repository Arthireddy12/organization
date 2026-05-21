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
} from "lucide-react";

export type OrganizationListItem = {
  id: string;
  name: string;
  email?: string; 
  slug: string;
  planName: string;
  userLimit: number;
  userCount: number;
  isActive: boolean;
  status?: 'Active' | 'Inactive' | 'Trial'; 
  createdAt: string;
  autoDeactivateDate: string | null;
  moduleAccess: string[];
};

type OrganizationsClientProps = {
  initialOrganizations: OrganizationListItem[];
};

export default function OrganizationsClient({ initialOrganizations }: OrganizationsClientProps) {
  const [organizations] = useState(initialOrganizations);

  const stats = useMemo(() => {
    const totalOrganizations = organizations.length;
    const activeOrganizations = organizations.filter((org) => org.isActive).length;
    const totalUsers = organizations.reduce((sum, org) => sum + org.userCount, 0);

    return [
      {
        label: "Total Organizations",
        value: totalOrganizations,
        hint: "from database",
        icon: <Building2 className="text-violet-600" size={20} />,
        bg: "bg-violet-50",
      },
      {
        label: "Active Organizations",
        value: activeOrganizations,
        hint: "currently active",
        icon: <Users2 className="text-emerald-600" size={20} />,
        bg: "bg-emerald-50",
      },
      {
        label: "Total Subscriptions",
        value: totalOrganizations,
        hint: "same as organizations",
        icon: <CreditCard className="text-blue-600" size={20} />,
        bg: "bg-blue-50",
      },
      {
        label: "Total Users",
        value: totalUsers,
        hint: "from users table",
        icon: <Users2 className="text-rose-600" size={20} />,
        bg: "bg-rose-50",
      },
    ];
  }, [organizations]);

  return (
    <div className="min-h-screen font-sans text-slate-900">
      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="mb-3 flex justify-between items-start">
              <div className={`${stat.bg} rounded-lg p-2`}>{stat.icon}</div>
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
            <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
            <div className="mt-2 flex items-center gap-1 text-xs font-bold text-emerald-500">
              <TrendingUp size={13} />
              <span className="text-slate-400 font-medium">{stat.hint}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="font-bold text-lg">Organizations</h2>
            <p className="text-xs text-slate-500 font-medium">View and manage all your organizations</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                placeholder="Search organization..." 
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs w-64"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">
              <Filter size={16} /> Filter
            </button>
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
                <th className="px-6 py-4 text-center">Plan</th>
                <th className="px-6 py-4 text-center">Users</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Renewal Date</th>
                <th className="px-6 py-4">Created On</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {organizations.map((org) => (
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
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-bold border ${getPlanStyle(org.planName)}`}>
                      {org.planName}
                    </span>
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
                      <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors">
                        <Eye size={18} />
                      </button>
                      <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors">
                        <Edit3 size={18} />
                      </button>
                      <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="px-8 py-5 border-t border-slate-100 flex justify-between items-center text-[11px] font-bold text-slate-400">
          <p>Showing 1 to {organizations.length} of {organizations.length} organizations</p>
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

// Helper Styles
function getPlanStyle(plan: string) {
  const p = plan.toLowerCase();
  if (p.includes('enterprise')) return "bg-indigo-50 border-indigo-100 text-indigo-600";
  if (p.includes('professional')) return "bg-blue-50 border-blue-100 text-blue-600";
  return "bg-orange-50 border-orange-100 text-orange-600";
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
