"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/common/button";
import { Input } from "@/components/common/input";
import { SetupField } from "../../SetupField";

export default function AttributeAddModal({
  open,
  categoryLabel,
  onClose,
  onSave,
}: {
  open: boolean;
  categoryLabel: string;
  onClose: () => void;
  onSave: (label: string) => void;
}) {
  const [label, setLabel] = useState("");

  if (!open) return null;

  function closeModal() {
    setLabel("");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/35 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Add Attribute</h3>
            <p className="mt-1 text-sm text-slate-500">
              Create a custom {categoryLabel.toLowerCase()} attribute for this client.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={closeModal}
            className="rounded-lg"
            aria-label="Close attribute popup"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="px-5 py-5">
          <SetupField label="Attribute Name" required>
            <Input
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder="Enter attribute name"
              required
            />
          </SetupField>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 px-5 py-4">
          <Button variant="secondary" onClick={closeModal}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              if (!label.trim()) return;
              onSave(label.trim());
              closeModal();
            }}
          >
            Add Attribute
          </Button>
        </div>
      </div>
    </div>
  );
}
