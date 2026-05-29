"use client";

import { Fragment, useMemo, useState } from "react";
import {
  Building2,
  ChevronDown,
  ChevronRight,
  Search,
  UserRoundPlus,
  Users,
} from "lucide-react";
import { Button } from "@/components/common/button";
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
} from "@/components/common/data-table";
import { Input } from "@/components/common/input";
import { MetricCard } from "@/components/common/metric-card";
import { Pagination } from "@/components/common/pagination";
import { Panel, PanelHeader } from "@/components/common/panel";
import type { PortalOrganizationUsers } from "@/lib/portal-users";

type UsersClientProps = {
  initialOrganizations: PortalOrganizationUsers[];
};

const pageSize = 6;

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function roleLabel(role: string) {
  return role
    .toLowerCase()
    .split("_")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

export default function UsersClient({ initialOrganizations }: UsersClientProps) {
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState(initialOrganizations[0]?.id ?? "");
  const [page, setPage] = useState(1);

  const filteredOrganizations = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return initialOrganizations;

    return initialOrganizations.filter((organization) => {
      const organizationMatch =
        organization.name.toLowerCase().includes(search) ||
        organization.planName.toLowerCase().includes(search);
      const userMatch = organization.users.some(
        (user) =>
          user.name.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search) ||
          user.role.toLowerCase().includes(search) ||
          user.employee?.department.toLowerCase().includes(search),
      );

      return organizationMatch || userMatch;
    });
  }, [initialOrganizations, query]);

  const pageCount = Math.max(1, Math.ceil(filteredOrganizations.length / pageSize));
  const visibleOrganizations = filteredOrganizations.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );
  const totalUsers = initialOrganizations.reduce(
    (sum, organization) => sum + organization.userCount,
    0,
  );
  const totalEmployees = initialOrganizations.reduce(
    (sum, organization) => sum + organization.employeeCount,
    0,
  );
  const activeOrganizations = initialOrganizations.filter(
    (organization) => organization.isActive,
  ).length;

  function handleSearch(value: string) {
    setQuery(value);
    setPage(1);
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Organizations"
          value={initialOrganizations.length}
          trend={`${activeOrganizations} active`}
          icon={<Building2 size={22} />}
          tone="violet"
        />
        <MetricCard
          label="Total Users"
          value={totalUsers}
          trend="from database"
          icon={<Users size={22} />}
          tone="blue"
        />
        <MetricCard
          label="Employee Records"
          value={totalEmployees}
          trend="linked profiles"
          icon={<UserRoundPlus size={22} />}
          tone="green"
        />
      </section>

      <Panel>
        <PanelHeader
          action={
            <div className="w-full sm:w-72">
              <Input
                icon={<Search size={16} />}
                placeholder="Search organizations or users..."
                value={query}
                onChange={(event) => handleSearch(event.target.value)}
              />
            </div>
          }
        >
          <div>
            <h3 className="font-bold text-slate-950">Organizations & Users</h3>
            <p className="mt-1 text-xs text-slate-500">
              Expand an organization to view users and employee details.
            </p>
          </div>
        </PanelHeader>

        <DataTable minWidth="680px">
          <DataTableHead>
            <tr>
              <DataTableHeaderCell>Organization</DataTableHeaderCell>
              <DataTableHeaderCell className="text-center">Users</DataTableHeaderCell>
              <DataTableHeaderCell>Status</DataTableHeaderCell>
            </tr>
          </DataTableHead>
          <DataTableBody>
            {visibleOrganizations.map((organization) => {
              const expanded = expandedId === organization.id;

              return (
                <Fragment key={organization.id}>
                  <DataTableRow>
                    <DataTableCell>
                      <div className="flex items-center gap-3">
                        <Button
                          aria-label={
                            expanded
                              ? `Collapse ${organization.name}`
                              : `Expand ${organization.name}`
                          }
                          className="shrink-0"
                          onClick={() =>
                            setExpandedId(expanded ? "" : organization.id)
                          }
                          size="icon"
                          variant="ghost"
                        >
                          {expanded ? (
                            <ChevronDown size={18} />
                          ) : (
                            <ChevronRight size={18} />
                          )}
                        </Button>
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-600">
                          {initials(organization.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-950">
                            {organization.name}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {organization.slug || "organization"}
                          </p>
                        </div>
                      </div>
                    </DataTableCell>
                    <DataTableCell className="text-center font-semibold text-slate-800">
                      {organization.userCount}
                    </DataTableCell>
                    <DataTableCell>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                          organization.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {organization.isActive ? "Active" : "Inactive"}
                      </span>
                    </DataTableCell>
                  </DataTableRow>

                  {expanded && (
                    <DataTableRow className="hover:bg-white">
                      <DataTableCell colSpan={3} className="bg-slate-50/70 p-4">
                        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
                            <div>
                              <p className="text-sm font-bold text-slate-950">
                                Users in {organization.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {organization.userCount} users,{" "}
                                {organization.employeeCount} employee profiles
                              </p>
                            </div>
                          </div>
                          <DataTable minWidth="820px">
                            <DataTableHead>
                              <tr>
                                <DataTableHeaderCell>User</DataTableHeaderCell>
                                <DataTableHeaderCell>Role</DataTableHeaderCell>
                                <DataTableHeaderCell>Department</DataTableHeaderCell>
                                <DataTableHeaderCell>Employee ID</DataTableHeaderCell>
                                <DataTableHeaderCell>Phone</DataTableHeaderCell>
                                <DataTableHeaderCell>Status</DataTableHeaderCell>
                              </tr>
                            </DataTableHead>
                            <DataTableBody>
                              {organization.users.map((user) => (
                                <DataTableRow key={user.id}>
                                  <DataTableCell>
                                    <div className="flex items-center gap-3">
                                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600">
                                        {initials(user.employee?.fullName || user.name)}
                                      </div>
                                      <div>
                                        <p className="font-semibold text-slate-900">
                                          {user.employee?.fullName || user.name}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                          {user.email}
                                        </p>
                                      </div>
                                    </div>
                                  </DataTableCell>
                                  <DataTableCell>{roleLabel(user.role)}</DataTableCell>
                                  <DataTableCell>
                                    {user.employee?.department ?? "Not assigned"}
                                  </DataTableCell>
                                  <DataTableCell>
                                    {user.employee?.employeeId ?? "-"}
                                  </DataTableCell>
                                  <DataTableCell>
                                    {user.employee?.phone ?? "-"}
                                  </DataTableCell>
                                  <DataTableCell>
                                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
                                      Active
                                    </span>
                                  </DataTableCell>
                                </DataTableRow>
                              ))}
                              {organization.users.length === 0 && (
                                <DataTableRow>
                                  <DataTableCell
                                    colSpan={6}
                                    className="py-8 text-center text-sm text-slate-500"
                                  >
                                    No users found for this organization.
                                  </DataTableCell>
                                </DataTableRow>
                              )}
                            </DataTableBody>
                          </DataTable>
                        </div>
                      </DataTableCell>
                    </DataTableRow>
                  )}
                </Fragment>
              );
            })}
            {visibleOrganizations.length === 0 && (
              <DataTableRow>
                <DataTableCell
                  colSpan={3}
                  className="py-12 text-center text-sm text-slate-500"
                >
                  No organizations or users match your search.
                </DataTableCell>
              </DataTableRow>
            )}
          </DataTableBody>
        </DataTable>

        <Pagination
          page={Math.min(page, pageCount)}
          pageCount={pageCount}
          onPageChange={setPage}
          summary={`Showing ${visibleOrganizations.length ? (page - 1) * pageSize + 1 : 0} to ${Math.min(
            page * pageSize,
            filteredOrganizations.length,
          )} of ${filteredOrganizations.length} organizations`}
        />
      </Panel>
    </div>
  );
}
