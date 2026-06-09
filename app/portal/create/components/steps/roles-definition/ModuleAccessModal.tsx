"use client";

import { X } from "lucide-react";
import { Button } from "@/components/common/button";
import ModuleAccessPanel from "../../ModuleAccessPanel";

type ModuleAccessModalProps = {
  open: boolean;
  isViewMode: boolean;
  modulePermissions: Record<string, boolean>;
  openModuleGroups: Record<string, boolean>;
  onClose: () => void;
  onToggleModuleGroup: (groupName: string, childModules: readonly string[]) => void;
  onToggleSubModule: (
    groupName: string,
    childModules: readonly string[],
    moduleName: string,
  ) => void;
  onToggleModuleGroupOpen: (groupName: string) => void;
};

export default function ModuleAccessModal({
  open,
  isViewMode,
  modulePermissions,
  openModuleGroups,
  onClose,
  onToggleModuleGroup,
  onToggleSubModule,
  onToggleModuleGroupOpen,
}: ModuleAccessModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/25 px-4 backdrop-blur-[2px]">
      <div className="flex max-h-[86vh] w-full max-w-5xl flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_28px_100px_rgba(15,23,42,0.18)]">
        <div className="flex items-start justify-between gap-4 border-b border-blue-200 bg-blue-600 px-6 py-5 text-white">
          <div>
            <div className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
              Module Access
            </div>
            <h3 className="mt-3 text-2xl font-semibold text-white">
              Configure organization modules
            </h3>
            <p className="mt-1 text-sm text-blue-50">
              Choose which groups and submodules will be available for this organization.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-10 w-10 rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            aria-label="Close module access popup"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <ModuleAccessPanel
            isViewMode={isViewMode}
            modulePermissions={modulePermissions}
            openModuleGroups={openModuleGroups}
            onToggleModuleGroup={onToggleModuleGroup}
            onToggleSubModule={onToggleSubModule}
            onToggleModuleGroupOpen={onToggleModuleGroupOpen}
          />
        </div>
      </div>
    </div>
  );
}
