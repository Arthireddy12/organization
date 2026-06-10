"use client";

import { useMemo, useState } from "react";
import { Eye, Search, SquarePen } from "lucide-react";
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
import type { OrganizationAttribute } from "@/lib/organization-attributes";
import {
  getGroupDefinitionModule,
  groupDefinitionModules,
  type GroupDefinitionRule,
} from "@/lib/organization-group-definition";
import type { FormMode } from "../types";
import GroupDefinitionModal from "./group-definition/GroupDefinitionModal";

export default function GroupDefinitionStep({
  mode,
  selectedAttributes,
  onGetGroupDefinitionRules,
  onSaveGroupDefinitionRule,
  onDeleteGroupDefinitionRule,
}: {
  mode: FormMode;
  selectedAttributes: OrganizationAttribute[];
  onGetGroupDefinitionRules: (moduleId: string) => GroupDefinitionRule[];
  onSaveGroupDefinitionRule: (
    moduleId: string,
    rule: Omit<GroupDefinitionRule, "id"> & { id?: string },
  ) => void;
  onDeleteGroupDefinitionRule: (moduleId: string, ruleId: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const disabled = mode === "view";

  const visibleModules = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return groupDefinitionModules;
    }

    return groupDefinitionModules.filter((module) =>
      `${module.label} ${module.description}`.toLowerCase().includes(normalizedQuery),
    );
  }, [searchQuery]);

  const configuredModulesCount = useMemo(
    () =>
      groupDefinitionModules.filter((module) => onGetGroupDefinitionRules(module.id).length > 0)
        .length,
    [onGetGroupDefinitionRules],
  );

  const activeModule = activeModuleId ? getGroupDefinitionModule(activeModuleId) : null;

  return (
    <div className="space-y-4">
      <section className="rounded-[20px] border border-slate-200 bg-gradient-to-r from-sky-50 via-white to-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="inline-flex rounded-full border border-white bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-700 shadow-sm">
              Step 5 Guide
            </div>
            <h2 className="mt-3 text-2xl font-semibold text-slate-800">
              Open each module and configure group-wise details
            </h2>
            <p className="mt-1 max-w-3xl text-sm text-slate-500">
              Search a module, open its popup, and save rules using the attributes selected in
              step 2. Each module shows its own detail form.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Modules</p>
              <p className="mt-1 text-xl font-semibold text-slate-800">
                {groupDefinitionModules.length}
              </p>
            </div>
            <div className="rounded-2xl border border-white bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Configured</p>
              <p className="mt-1 text-xl font-semibold text-slate-800">
                {configuredModulesCount}
              </p>
            </div>
            <div className="rounded-2xl border border-white bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Attributes</p>
              <p className="mt-1 text-xl font-semibold text-slate-800">{selectedAttributes.length}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-sm border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Group Definition</h3>
            <p className="mt-1 text-xs text-slate-500">
              Click the action icon to open the popup and manage the selected module.
            </p>
          </div>

          <div className="w-full lg:w-96">
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Enter min 3 characters to search"
              icon={<Search className="h-4 w-4" />}
            />
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-sm border border-slate-200 bg-white shadow-sm">
        <div className="max-h-[520px] overflow-y-auto">
          {visibleModules.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-slate-400">
              No modules match this search.
            </div>
          ) : (
            <DataTable minWidth="720px">
              <DataTableHead>
                <tr>
                  <DataTableHeaderCell>Modules</DataTableHeaderCell>
                  <DataTableHeaderCell className="text-center">Saved</DataTableHeaderCell>
                  <DataTableHeaderCell className="text-center">Group Details</DataTableHeaderCell>
                </tr>
              </DataTableHead>
              <DataTableBody>
                {visibleModules.map((module) => {
                  const savedCount = onGetGroupDefinitionRules(module.id).length;

                  return (
                    <DataTableRow key={module.id}>
                      <DataTableCell>
                        <p className="font-medium text-slate-700">{module.label}</p>
                        <p className="mt-1 text-xs text-slate-500">{module.description}</p>
                      </DataTableCell>
                      <DataTableCell className="text-center">
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                          {savedCount}
                        </span>
                      </DataTableCell>
                      <DataTableCell className="text-center">
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          className="h-8 w-8 rounded-full border-blue-100 text-blue-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                          onClick={() => setActiveModuleId(module.id)}
                          aria-label={`${disabled ? "View" : "Edit"} ${module.label}`}
                        >
                          {disabled ? <Eye className="h-4 w-4" /> : <SquarePen className="h-4 w-4" />}
                        </Button>
                      </DataTableCell>
                    </DataTableRow>
                  );
                })}
              </DataTableBody>
            </DataTable>
          )}
        </div>
      </section>

      <GroupDefinitionModal
        key={activeModule?.id ?? "group-definition-modal"}
        open={activeModule !== null}
        module={activeModule}
        selectedAttributes={selectedAttributes}
        rules={activeModule ? onGetGroupDefinitionRules(activeModule.id) : []}
        disabled={disabled}
        onClose={() => setActiveModuleId(null)}
        onSave={onSaveGroupDefinitionRule}
        onDelete={onDeleteGroupDefinitionRule}
      />
    </div>
  );
}
