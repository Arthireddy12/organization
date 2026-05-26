import { redirect } from "next/navigation";
import { Mail, ShieldCheck, UserRound } from "lucide-react";
import { getSessionFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Panel, PanelHeader } from "@/components/common/panel";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatRole(role: string) {
  return role
    .toLowerCase()
    .split("_")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

export default async function SettingsPage() {
  const session = await getSessionFromCookie();
  if (!session) {
    redirect("/login");
  }
  if (session.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="px-6 pb-10 pt-5 lg:px-8">
      <div className="mb-5 border-b border-slate-200 pb-5">
        <h2 className="text-lg font-bold text-slate-950">Settings</h2>
        <p className="mt-1 text-sm text-slate-500">
          Manage the main logged-in admin account details.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)]">
        <Panel>
          <PanelHeader>
            <div className="flex items-center gap-2">
              <UserRound size={18} className="text-blue-600" />
              <h3 className="font-bold text-slate-950">Profile Details</h3>
            </div>
          </PanelHeader>

          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Name
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-950">{user.name}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Email
              </p>
              <p className="mt-1 break-all text-sm font-semibold text-slate-950">
                {user.email}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Role
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-950">
                {formatRole(user.role)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Account Created
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-950">
                {formatDate(user.createdAt)}
              </p>
            </div>
          </div>
        </Panel>

        <Panel className="p-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <ShieldCheck size={26} />
          </div>
          <h3 className="mt-4 font-bold text-slate-950">Admin Access</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            This account controls organizations, users, billing, and tenant settings.
          </p>
          <div className="mt-5 flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
            <Mail size={16} />
            Main login account
          </div>
        </Panel>
      </div>
    </div>
  );
}
