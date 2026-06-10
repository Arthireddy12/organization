"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/common/button";
import type { OrganizationSetupProfile } from "@/lib/organization-setup";
import {
  SetupSectionTitle,
  setupCardClassName,
} from "../../SetupField";
import BranchOfficeModal from "./BranchOfficeModal";

type BranchOfficesCardProps = {
  disabled: boolean;
  setupProfile: OrganizationSetupProfile;
  onAddBranchOffice: (branch: {
    name: string;
    location: string;
    subLocation: string;
  }) => void;
  onRemoveBranchOffice: (branchId: string) => void;
};

export default function BranchOfficesCard({
  disabled,
  setupProfile,
  onAddBranchOffice,
  onRemoveBranchOffice,
}: BranchOfficesCardProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section className={setupCardClassName}>
      <div className="flex items-center justify-between gap-3">
        <SetupSectionTitle title="Branch Offices" />
        {!disabled ? (
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="h-3.5 w-3.5" />}
            className="rounded-sm px-3"
            onClick={() => setModalOpen(true)}
          >
            Add New Branch
          </Button>
        ) : null}
      </div>

      <div className="mt-4 min-h-[344px]">
        {setupProfile.branchOffices.length === 0 ? (
          <div className="flex h-full min-h-[300px] items-center justify-center rounded-sm border border-dashed border-slate-300 bg-slate-50 px-6 text-center">
            <div>
              <p className="text-sm font-medium text-slate-600">No branch offices added yet</p>
              <p className="mt-1 text-xs text-slate-400">
                Use the Add New Branch button to enter branch name, main location, and sub
                location.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {setupProfile.branchOffices.map((branch) => (
              <div key={branch.id} className="rounded-sm border border-slate-200 bg-slate-50 p-3">
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                      Branch Name
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-800">{branch.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                      Location
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      {branch.location}
                      {branch.subLocation ? (
                        <span className="text-slate-500"> / {branch.subLocation}</span>
                      ) : null}
                    </p>
                  </div>
                </div>

                {!disabled ? (
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => onRemoveBranchOffice(branch.id)}
                      className="text-xs font-medium text-rose-600 transition hover:text-rose-500"
                    >
                      Remove branch
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>

      <BranchOfficeModal
        open={!disabled && modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={onAddBranchOffice}
      />
    </section>
  );
}
