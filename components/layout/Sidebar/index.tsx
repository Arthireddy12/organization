"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Building2,
  CreditCard,
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { useSidebar } from "@/components/DashboardShell";
import { useAuth } from "@/components/AuthContext";
import type { ElementType } from "react";

type NavItem = {
  label: string;
  href: string;
  icon: ElementType;
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/portal", icon: LayoutDashboard },
  { label: "Organizations", href: "/portal/organizations", icon: Building2 },
  { label: "Users", href: "/portal/users", icon: Users },
  { label: "Billing & Invoices", href: "/billing", icon: FileText },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { collapsed } = useSidebar();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/portal") return pathname === "/portal";
    return pathname.startsWith(href);
  };

  async function handleLogout() {
    await logout();
    router.push("/login");
    router.refresh();
  }

  const userInitials =
    user?.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AD";

  const sidebarContent = (
    <nav className="flex h-full flex-col bg-white">
      {/* 1. Header/Logo Area */}
      <div className={`flex h-20 items-center px-6 border-b border-slate-50 ${collapsed ? "justify-center px-0" : "gap-3"}`}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-100">
            <Building2 className="text-white" size={22} />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-bold tracking-tight text-slate-900">HRMS Dashboard</p>
              <p className="text-[10px] font-medium text-slate-400">Organization Dashboard</p>
            </div>
          )}
        </div>
      </div>

      {/* 2. Navigation Items */}
      <div className="flex-1 overflow-y-auto px-4 pt-6 scrollbar-hide">
        <ul className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`group flex items-center rounded-xl px-3 py-2.5 transition-all duration-200 ${
                    active 
                      ? "bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-50/50" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  } ${collapsed ? "justify-center" : "gap-3"}`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon 
                    size={20} 
                    className={`shrink-0 transition-colors ${active ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"}`} 
                  />
                  {!collapsed && (
                    <span className={`truncate text-[13px] font-semibold tracking-tight`}>
                      {item.label}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* 3. Promo Card (Hidden if collapsed) */}
        {!collapsed && (
          <div className="mt-10 mb-6 px-2">
          </div>
        )}
      </div>

      {/* 4. Footer / User Profile */}
      <div className="border-t border-slate-50 p-4">
        <div className={`flex items-center gap-3 rounded-xl p-2 transition hover:bg-slate-50 cursor-pointer ${collapsed ? "justify-center" : ""}`}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-[11px] font-bold text-white">
            {userInitials}
          </div>
          {!collapsed && (
            <div className="flex flex-1 items-center justify-between min-w-0">
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-slate-900">{user?.name || "Admin User"}</p>
                <p className="text-[10px] font-medium text-slate-400">{user?.role || "Super Admin"}</p>
              </div>
              <ChevronDown size={14} className="text-slate-400" />
            </div>
          )}
        </div>
        
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={`mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-bold text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 ${collapsed ? "justify-center" : ""}`}
        >
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </nav>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm lg:hidden hover:bg-slate-50"
      >
        <Menu size={20} />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[280px] bg-white animate-in slide-in-from-left duration-300">
            <button onClick={() => setMobileOpen(false)} className="absolute right-4 top-5 p-2 text-slate-400 hover:text-slate-600"><X size={20}/></button>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-30 hidden h-full border-r border-slate-100 bg-white transition-all duration-300 ease-in-out lg:block ${
          collapsed ? "w-[88px]" : "w-[280px]"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
