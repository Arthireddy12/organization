"use client";

import { Bell, Search, LogOut } from "lucide-react"; // Added LogOut icon
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";

export default function Navbar() {
  const router = useRouter();
  const { logout } = useAuth();

  async function handleLogout() {
    await logout();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 h-16 border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <div className="flex h-full items-center justify-between gap-4 px-8">
        
        {/* 1. Left Side: Search Bar */}
        <div className="flex items-center flex-1">
          <div className="relative hidden w-80 md:block group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
              <Search size={16} strokeWidth={2.5} />
            </div>
            <input
              type="text"
              placeholder="Search organizations..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-12 text-xs font-medium text-slate-900 outline-none transition-all focus:border-indigo-500/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/5"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-400 shadow-sm">
              <span className="text-[9px]">Selection ⌘</span>
              <span>K</span>
            </div>
          </div>
        </div>

        {/* 2. Right Side: Notifications & Logout */}
        <div className="flex items-center gap-3">
          
          {/* Notification Bell */}
          <button
            type="button"
            className="group relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-500 transition-all hover:border-indigo-100 hover:bg-indigo-50 hover:text-indigo-600"
            aria-label="Notifications"
          >
            <Bell size={20} strokeWidth={2} />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-indigo-600 text-[10px] font-bold text-white shadow-sm">
              3
            </span>
          </button>

          {/* Separator */}
          <div className="h-6 w-[1px] bg-slate-200 mx-1" />

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            type="button"
            className="flex items-center gap-2 rounded-xl border border-rose-50 bg-rose-50/50 px-4 py-2 text-xs font-semibold text-rose-600 transition-all hover:bg-rose-100 hover:text-rose-700 active:scale-95"
          >
            <LogOut size={16} strokeWidth={2.5} />
            <span className="hidden sm:block">Logout</span>
          </button>
          
        </div>
      </div>
    </header>
  );
}
