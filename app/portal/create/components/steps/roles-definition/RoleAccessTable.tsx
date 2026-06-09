import { UserRound } from "lucide-react";
import { Checkbox } from "@/components/common/checkbox";
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
} from "@/components/common/data-table";
import { moduleGroups } from "../../constants";
import type { RoleAccessSubject } from "./types";

type RoleAccessTableProps = {
  disabled: boolean;
  loading: boolean;
  organizationReady: boolean;
  error: string | null;
  modulePermissions: Record<string, boolean>;
  subjects: RoleAccessSubject[];
  getSubjectModuleAccess: (subjectKey: string, moduleName: string) => boolean;
  onSubjectModuleAccessChange: (
    subjectKey: string,
    moduleName: string,
    enabled: boolean,
  ) => void;
};

export default function RoleAccessTable({
  disabled,
  loading,
  organizationReady,
  error,
  modulePermissions,
  subjects,
  getSubjectModuleAccess,
  onSubjectModuleAccessChange,
}: RoleAccessTableProps) {
  return (
    <section className="min-w-0 max-w-full overflow-hidden rounded-sm border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-700">Employee Role Access</h3>
        <p className="mt-1 text-xs text-slate-500">
          Enable group modules above, then grant each employee access here based on the modules
          you want each role to use.
        </p>
      </div>

      {error ? (
        <div className="border-b border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      ) : null}

      <div className="w-full max-w-full overflow-x-auto overflow-y-auto">
        <div className="max-h-[calc(100vh-420px)] min-w-0">
          <DataTable minWidth="1040px">
          <DataTableHead>
            <tr>
              <DataTableHeaderCell className="sticky left-0 top-0 z-20 min-w-[240px] bg-slate-50">
                Organization Users
              </DataTableHeaderCell>
              {moduleGroups.map((group) => {
                const groupEnabled = modulePermissions[group.name] === true;

                return (
                  <DataTableHeaderCell
                    key={group.name}
                    className={`sticky top-0 z-10 min-w-[100px] text-center ${
                      groupEnabled ? "bg-white" : "bg-slate-50"
                    }`}
                  >
                    <div className="text-[13px] font-semibold leading-snug text-slate-700">
                      {group.name}
                    </div>
                    <div className="mt-1.5 text-[10px] leading-snug text-slate-400">
                      {group.modules.length > 0
                        ? `${group.modules.length} submodules`
                        : "Standalone"}
                    </div>
                  </DataTableHeaderCell>
                );
              })}
            </tr>
          </DataTableHead>

          <DataTableBody>
            {subjects.length === 0 ? (
              <DataTableRow>
                <DataTableCell
                  colSpan={moduleGroups.length + 1}
                  className="py-8 text-center text-sm text-slate-500"
                >
                  {loading && organizationReady
                    ? "Loading organization employees..."
                    : "No matching employees found for this access view."}
                </DataTableCell>
              </DataTableRow>
            ) : (
              subjects.map((subject) => (
                <DataTableRow key={subject.key}>
                  <DataTableCell className="sticky left-0 z-[1] min-w-[240px] bg-white align-top">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500">
                        <UserRound className="h-4.5 w-4.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-700">
                          {subject.name}
                        </div>
                        <div className="truncate text-[11px] text-slate-500">{subject.email}</div>
                        <div className="mt-1 inline-flex rounded-sm bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                          {subject.role.replaceAll("_", " ")}
                        </div>
                      </div>
                    </div>
                  </DataTableCell>

                  {moduleGroups.map((group) => {
                    const groupEnabled = modulePermissions[group.name] === true;
                    const checked = getSubjectModuleAccess(subject.key, group.name);

                    return (
                      <DataTableCell
                        key={`${subject.key}-${group.name}`}
                        className={`text-center ${
                          groupEnabled ? "bg-white" : "bg-slate-50/40"
                        }`}
                      >
                        <div className="flex items-center justify-center">
                          <Checkbox
                            checked={checked}
                            disabled={
                              disabled ||
                              (loading && organizationReady)
                            }
                            onChange={(event) =>
                              onSubjectModuleAccessChange(
                                subject.key,
                                group.name,
                                event.target.checked,
                              )
                            }
                            aria-label={`Toggle ${group.name} access for ${subject.name}`}
                          />
                        </div>
                      </DataTableCell>
                    );
                  })}
                </DataTableRow>
              ))
            )}
          </DataTableBody>
          </DataTable>
        </div>
      </div>
    </section>
  );
}
