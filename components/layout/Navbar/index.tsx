"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown, LogOut, UserRound } from "lucide-react";
import { useAuth } from "@/components/AuthContext";

export default function Navbar() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    setOpen(false);
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

  return (
    <header className="sticky top-0 z-20 h-16 border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <div className="flex h-full items-center justify-end px-8">
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left shadow-sm transition hover:bg-slate-50"
            aria-expanded={open}
            aria-haspopup="menu"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
              {userInitials}
            </span>
            <span className="hidden min-w-0 sm:block">
              <span className="block max-w-40 truncate text-xs font-bold text-slate-900">
                {user?.name || "Admin User"}
              </span>
              <span className="block text-[10px] font-medium text-slate-400">
                {user?.role || "SUPER_ADMIN"}
              </span>
            </span>
            <ChevronDown
              size={16}
              className={`text-slate-400 transition ${open ? "rotate-180" : ""}`}
            />
          </button>

          {open && (
            <div
              className="absolute right-0 top-12 z-50 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-2 text-sm shadow-xl shadow-slate-200/70"
              role="menu"
            >
              <Link
                href="/portal/settings"
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2 px-4 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50"
                role="menuitem"
              >
                <UserRound size={16} />
                Profile
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left font-medium text-rose-600 transition hover:bg-rose-50"
                role="menuitem"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
