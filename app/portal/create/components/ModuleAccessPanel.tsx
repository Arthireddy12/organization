import { ChevronDown, ChevronRight, LayoutGrid } from "lucide-react";
import { Checkbox } from "@/components/common/checkbox";
import { moduleGroups } from "./constants";
import { setupCardClassName } from "./SetupField";

type ModuleAccessPanelProps = {
  isViewMode: boolean;
  modulePermissions: Record<string, boolean>;
  openModuleGroups: Record<string, boolean>;
  onToggleModuleGroup: (groupName: string, childModules: readonly string[]) => void;
  onToggleSubModule: (
    groupName: string,
    childModules: readonly string[],
    moduleName: string,
  ) => void;
  onToggleModuleGroupOpen: (groupName: string) => void;
};

export default function ModuleAccessPanel({
  isViewMode,
  modulePermissions,
  openModuleGroups,
  onToggleModuleGroup,
  onToggleSubModule,
  onToggleModuleGroupOpen,
}: ModuleAccessPanelProps) {
  return (
    <section className={setupCardClassName}>
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <LayoutGrid className="h-4 w-4 text-blue-600" />
        Module Access
      </div>

      <div className="mt-4 space-y-3">
        {moduleGroups.map((group, index) => {
          const checked =
            modulePermissions[group.name] &&
            group.modules.every((moduleName) => modulePermissions[moduleName]);
          const partiallyChecked =
            group.modules.length > 0 &&
            group.modules.some((moduleName) => modulePermissions[moduleName]) &&
            !checked;
          const expanded = openModuleGroups[group.name];

          return (
            <div key={group.name} className="rounded-sm border border-slate-200">
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="w-6 text-xs font-semibold text-slate-400">
                  {index + 1}.
                </span>
                <button
                  type="button"
                  onClick={() => onToggleModuleGroupOpen(group.name)}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100"
                  disabled={group.modules.length === 0}
                  aria-label={`${expanded ? "Collapse" : "Expand"} ${group.name}`}
                >
                  {group.modules.length > 0 ? (
                    expanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-slate-300" />
                  )}
                </button>

                <label className="flex flex-1 cursor-pointer items-center justify-between gap-4">
                  <span>
                    <span className="block text-sm font-semibold text-slate-800">
                      {group.name}
                    </span>
                    <span className="block text-xs text-slate-500">
                      {group.modules.length > 0
                        ? `${group.modules.length} submodules`
                        : "Standalone access"}
                    </span>
                  </span>

                  <span className="flex items-center gap-2">
                    {partiallyChecked ? (
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                        Partial
                      </span>
                    ) : null}
                    <Checkbox
                      checked={checked}
                      onChange={() => onToggleModuleGroup(group.name, group.modules)}
                      disabled={isViewMode}
                      aria-label={`Toggle ${group.name}`}
                    />
                  </span>
                </label>
              </div>

              {expanded && group.modules.length > 0 ? (
                <div className="border-t border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {group.modules.map((moduleName) => (
                      <label
                        key={moduleName}
                        className={`flex cursor-pointer items-center justify-between rounded-sm border px-3 py-2 text-sm transition ${
                          modulePermissions[moduleName]
                            ? "border-blue-200 bg-blue-50 text-blue-900"
                            : "border-slate-200 bg-white text-slate-600"
                        }`}
                      >
                        {moduleName}
                        <Checkbox
                          checked={modulePermissions[moduleName]}
                          onChange={() =>
                            onToggleSubModule(group.name, group.modules, moduleName)
                          }
                          disabled={isViewMode}
                          aria-label={`Toggle ${moduleName}`}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
