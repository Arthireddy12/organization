"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/common/button";
import { Input } from "@/components/common/input";
import { SetupField } from "../../SetupField";
import { validateBranchOfficeDraft } from "@/lib/organization-setup-validation";

type BranchOfficeModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (branch: {
    name: string;
    location: string;
    subLocation: string;
  }) => void;
};

const initialDraft = {
  name: "",
  location: "Hyderabad",
  subLocation: "Gachibowli",
};

export default function BranchOfficeModal({
  open,
  onClose,
  onSave,
}: BranchOfficeModalProps) {
  const [draft, setDraft] = useState(initialDraft);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  function resetAndClose() {
    setDraft(initialDraft);
    setErrors({});
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-sky-950/18 px-4 py-6 backdrop-blur-[2px] sm:py-8">
      <div className="mx-auto flex w-full max-w-md flex-col overflow-hidden rounded-[24px] border border-sky-100 bg-white shadow-[0_28px_100px_rgba(14,165,233,0.16)] sm:max-h-[calc(100dvh-4rem)]">
        <div className="flex items-center justify-between border-b border-sky-200 bg-gradient-to-r from-sky-600 to-blue-600 px-5 py-4 text-white">
          <div>
            <h3 className="text-base font-semibold text-white">Add Branch Office</h3>
            <p className="mt-1 text-sm text-sky-50">
              Add branch name, main location, and optional sub location.
            </p>
          </div>
          <button
            type="button"
            onClick={resetAndClose}
            className="rounded-lg p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
            aria-label="Close branch popup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
          <SetupField label="Branch Name" required error={errors.branchName}>
            <Input
              value={draft.name}
              onChange={(event) =>
                setDraft((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="Enter branch name"
              required
            />
          </SetupField>

          <SetupField label="Main Location" required error={errors.branchLocation}>
            <Input
              value={draft.location}
              onChange={(event) =>
                setDraft((current) => ({ ...current, location: event.target.value }))
              }
              placeholder="Hyderabad"
              required
            />
          </SetupField>

          <SetupField label="Sub Location" error={errors.branchSubLocation}>
            <Input
              value={draft.subLocation}
              onChange={(event) =>
                setDraft((current) => ({ ...current, subLocation: event.target.value }))
              }
              placeholder="Gachibowli"
            />
          </SetupField>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 px-5 py-4">
          <Button variant="secondary" onClick={resetAndClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              const validation = validateBranchOfficeDraft(draft);
              if (!validation.valid) {
                setErrors(validation.errors);
                return;
              }
              setErrors({});
              onSave({
                name: draft.name.trim(),
                location: draft.location.trim(),
                subLocation: draft.subLocation.trim(),
              });
              resetAndClose();
            }}
          >
            Save Branch
          </Button>
        </div>
      </div>
    </div>
  );
}
