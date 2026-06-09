"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { DashboardProvider, useSidebar } from "@/components/DashboardShell";
import type { ReactNode } from "react";

function DashboardPages({ children }: { children: ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <div className="flex min-h-screen bg-white text-slate-900">
      <Sidebar />
      <div
        className={`flex min-h-screen min-w-0 flex-1 flex-col bg-white transition-all duration-300 ${
          collapsed ? "lg:ml-[96px]" : "lg:ml-[280px]"
        }`}
      >
        <Navbar />
        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto bg-white">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const isAuthPage =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/signup";

  const isApiRoute = pathname.startsWith("/api");

  if (isApiRoute) {
    return <>{children}</>;
  }

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <DashboardProvider>
      <DashboardPages>{children}</DashboardPages>
    </DashboardProvider>
  );
}
