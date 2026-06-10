"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/common/button";
import { Input } from "@/components/common/input";
import { SetupField } from "../../SetupField";
import { validateAttributeLabel } from "@/lib/organization-setup-validation";

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
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  if (!open) return null;

  function closeModal() {
    setLabel("");
    setErrors({});
    onClose();
  }

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto overscroll-contain bg-sky-950/18 px-4 py-6 backdrop-blur-[2px] sm:py-8">
      <div className="mx-auto flex w-full max-w-md flex-col overflow-hidden rounded-[24px] border border-sky-100 bg-white shadow-[0_28px_100px_rgba(14,165,233,0.16)] sm:max-h-[calc(100dvh-4rem)]">
        <div className="flex items-center justify-between border-b border-sky-200 bg-gradient-to-r from-sky-600 to-blue-600 px-5 py-4 text-white">
          <div>
            <h3 className="text-base font-semibold text-white">Add Attribute</h3>
            <p className="mt-1 text-sm text-sky-50">
              Create a custom {categoryLabel.toLowerCase()} attribute for this client.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={closeModal}
            className="rounded-lg text-white hover:bg-white/10 hover:text-white"
            aria-label="Close attribute popup"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
          <SetupField label="Attribute Name" required error={errors.attributeLabel}>
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
              const validation = validateAttributeLabel(label);
              if (!validation.valid) {
                setErrors(validation.errors);
                return;
              }
              setErrors({});
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
