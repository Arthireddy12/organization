"use client";

import { useMemo, useState } from "react";
import type { FormMode } from "../types";
import ModuleAccessModal from "./roles-definition/ModuleAccessModal";
import RoleAccessTable from "./roles-definition/RoleAccessTable";
import RoleAccessToolbar from "./roles-definition/RoleAccessToolbar";
import { useRoleAccessSubjects } from "./roles-definition/useRoleAccessSubjects";

type RolesDefinitionStepProps = {
  mode: FormMode;
  organizationId?: string;
  modulePermissions: Record<string, boolean>;
  openModuleGroups: Record<string, boolean>;
  superAdminName: string;
  superAdminEmail: string;
  onToggleModuleGroup: (groupName: string, childModules: readonly string[]) => void;
  onToggleSubModule: (
    groupName: string,
    childModules: readonly string[],
    moduleName: string,
  ) => void;
  onToggleModuleGroupOpen: (groupName: string) => void;
  getSubjectModuleAccess: (subjectKey: string, moduleName: string) => boolean;
  onSubjectModuleAccessChange: (
    subjectKey: string,
    moduleName: string,
    enabled: boolean,
  ) => void;
};

export default function RolesDefinitionStep({
  mode,
  organizationId,
  modulePermissions,
  openModuleGroups,
  superAdminName,
  superAdminEmail,
  onToggleModuleGroup,
  onToggleSubModule,
  onToggleModuleGroupOpen,
  getSubjectModuleAccess,
  onSubjectModuleAccessChange,
}: RolesDefinitionStepProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [moduleAccessOpen, setModuleAccessOpen] = useState(false);
  const disabled = mode === "view";
  const { error, loading, refresh, subjects } = useRoleAccessSubjects({
    organizationId,
    superAdminName,
    superAdminEmail,
  });

  const filteredSubjects = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return subjects;
    }

    return subjects.filter((subject) =>
      `${subject.name} ${subject.email} ${subject.role}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [searchQuery, subjects]);

  return (
    <div className="min-w-0 max-w-full space-y-4 overflow-x-hidden">
      <section className="max-w-full overflow-hidden rounded-[20px] border border-slate-200 bg-gradient-to-r from-sky-50 via-white to-white p-5 shadow-sm">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] xl:items-end">
          <div className="min-w-0">
            <div className="inline-flex rounded-full border border-white bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-700 shadow-sm">
              Step 3 Guide
            </div>
            <h2 className="mt-3 text-2xl font-semibold text-slate-800">
              Assign module access and employee role rights
            </h2>
            <p className="mt-1 max-w-3xl text-sm text-slate-500">
              First enable the modules your organization will use, then search employees and mark
              which groups they can access. Super admin remains enabled for all groups.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-2xl border border-white bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                First Action
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                Turn on required module groups
              </p>
            </div>
            <div className="rounded-2xl border border-white bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Second Action
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                Grant access row by row in the table
              </p>
            </div>
          </div>
        </div>
      </section>

      <RoleAccessToolbar
        disabled={disabled}
        loading={loading}
        organizationReady={Boolean(organizationId)}
        searchQuery={searchQuery}
        subjectCount={filteredSubjects.length}
        onOpenModuleAccess={() => setModuleAccessOpen(true)}
        onRefresh={refresh}
        onSearchChange={setSearchQuery}
      />

      <RoleAccessTable
        disabled={disabled}
        loading={loading}
        organizationReady={Boolean(organizationId)}
        error={error}
        modulePermissions={modulePermissions}
        subjects={filteredSubjects}
        getSubjectModuleAccess={getSubjectModuleAccess}
        onSubjectModuleAccessChange={onSubjectModuleAccessChange}
      />

      <ModuleAccessModal
        open={moduleAccessOpen}
        isViewMode={disabled}
        modulePermissions={modulePermissions}
        openModuleGroups={openModuleGroups}
        onClose={() => setModuleAccessOpen(false)}
        onToggleModuleGroup={onToggleModuleGroup}
        onToggleSubModule={onToggleSubModule}
        onToggleModuleGroupOpen={onToggleModuleGroupOpen}
      />
    </div>
  );
}
