"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/common/button";
import { Input } from "@/components/common/input";
import { SetupField } from "../../SetupField";

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

  function resetAndClose() {
    setDraft(initialDraft);
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/35 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Add Branch Office</h3>
            <p className="mt-1 text-sm text-slate-500">
              Add branch name, main location, and optional sub location.
            </p>
          </div>
          <button
            type="button"
            onClick={resetAndClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close branch popup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <SetupField label="Branch Name" required>
            <Input
              value={draft.name}
              onChange={(event) =>
                setDraft((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="Enter branch name"
              required
            />
          </SetupField>

          <SetupField label="Main Location" required>
            <Input
              value={draft.location}
              onChange={(event) =>
                setDraft((current) => ({ ...current, location: event.target.value }))
              }
              placeholder="Hyderabad"
              required
            />
          </SetupField>

          <SetupField label="Sub Location">
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
              if (!draft.name.trim() || !draft.location.trim()) {
                return;
              }
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
