import { redirect } from "next/navigation";
import { getSessionFromCookie } from "@/lib/auth";
import { getPortalOrganizationUsers } from "@/lib/portal-users";
import UsersClient from "./UsersClient";

export default async function PortalUsersPage() {
  const session = await getSessionFromCookie();
  if (!session) {
    redirect("/login");
  }
  if (session.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  const organizations = await getPortalOrganizationUsers();

  return (
    <div className="px-6 pb-10 pt-5 lg:px-8">
      <div className="mb-5 border-b border-slate-200 pb-5">
        <h2 className="text-lg font-bold text-slate-950">Users</h2>
        <p className="mt-1 text-sm text-slate-500">
          See every organization, total users, and employee records in one place.
        </p>
      </div>

      <UsersClient initialOrganizations={organizations} />
    </div>
  );
}
