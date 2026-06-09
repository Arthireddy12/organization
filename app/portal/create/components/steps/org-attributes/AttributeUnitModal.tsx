"use client";

import { useRef, useState } from "react";
import { Boxes, Download, Upload, X } from "lucide-react";
import { Button } from "@/components/common/button";
import { Input } from "@/components/common/input";
import type { AttributeUnit, OrganizationAttribute } from "@/lib/organization-attributes";
import { validateAttributeUnitDraft } from "@/lib/organization-setup-validation";
import { SetupField } from "../../SetupField";
import AttributeUnitTable from "./AttributeUnitTable";

function downloadUnitsCsv(attribute: OrganizationAttribute, units: AttributeUnit[]) {
  const csvLines = [
    "Unit Code,Description",
    ...units.map((unit) => `"${unit.code.replace(/"/g, '""')}","${unit.description.replace(/"/g, '""')}"`),
  ];
  const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${attribute.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-units.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function AttributeUnitModal({
  open,
  attribute,
  units,
  onClose,
  onSaveUnit,
  onDeleteUnit,
}: {
  open: boolean;
  attribute: OrganizationAttribute | null;
  units: AttributeUnit[];
  onClose: () => void;
  onSaveUnit: (attributeId: string, unit: { id?: string; code: string; description: string }) => void;
  onDeleteUnit: (attributeId: string, unitId: string) => void;
}) {
  const [draftCode, setDraftCode] = useState("");
  const [draftDescription, setDraftDescription] = useState("");
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!open || !attribute) return null;
  const activeAttribute = attribute;

  function resetDraft() {
    setDraftCode("");
    setDraftDescription("");
    setEditingUnitId(null);
    setErrors({});
  }

  function closeModal() {
    resetDraft();
    onClose();
  }

  function submitUnit() {
    const validation = validateAttributeUnitDraft({
      code: draftCode,
      description: draftDescription,
    });
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }
    setErrors({});
    onSaveUnit(activeAttribute.id, {
      id: editingUnitId ?? undefined,
      code: draftCode.trim(),
      description: draftDescription.trim(),
    });
    resetDraft();
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-sky-950/18 px-4 py-6 backdrop-blur-[3px] sm:py-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col overflow-hidden rounded-[24px] border border-sky-100 bg-[#fcfdff] shadow-[0_28px_100px_rgba(14,165,233,0.16)] sm:max-h-[calc(100dvh-4rem)]">
        <div className="border-b border-sky-200 bg-gradient-to-r from-sky-600 to-blue-600 px-6 py-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
                <Boxes className="h-3.5 w-3.5" />
                Attribute Unit Setup
              </div>
              <h3 className="mt-3 text-[28px] font-semibold leading-tight text-white">
                Add New Unit ({activeAttribute.label})
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-sky-50">
                Create unit codes for this attribute, upload them in bulk, and keep the list easy
                to manage from one place.
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={closeModal}
              className="h-10 w-10 rounded-full border border-white/20 bg-white/10 text-white shadow-sm hover:bg-white/20 hover:text-white"
              aria-label="Close attribute unit popup"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain space-y-5 px-6 py-6">
          <div className="grid gap-3 lg:grid-cols-[1.35fr_0.9fr_0.9fr]">
            <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-700">
                Current Attribute
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-800">{activeAttribute.label}</p>
              <p className="mt-1 text-sm text-slate-500">
                Add business units or values under this selected organization attribute.
              </p>
            </div>
            <div className="rounded-2xl border border-sky-100 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Existing Units
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-800">{units.length}</p>
              <p className="mt-1 text-sm text-slate-500">
                Saved values currently mapped for this field.
              </p>
            </div>
            <div className="rounded-2xl border border-sky-100 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Quick Action
              </p>
              <p className="mt-2 text-base font-semibold text-slate-800">
                Add one or import many
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Use the form below for single entries or upload a CSV for bulk setup.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h4 className="text-base font-semibold text-slate-800">Create Or Update Unit</h4>
              <p className="mt-1 text-sm text-slate-500">
                Enter a description and short code so users can identify the value clearly.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-[1.35fr_0.6fr_auto]">
              <SetupField label="Unit Description" error={errors.unitDescription}>
                <Input
                  value={draftDescription}
                  onChange={(event) => setDraftDescription(event.target.value)}
                  placeholder="Enter unit description"
                  className="h-12 rounded-xl border-slate-200 bg-slate-50/60"
                />
              </SetupField>

              <SetupField label="Unit Code" error={errors.unitCode}>
                <Input
                  value={draftCode}
                  onChange={(event) => setDraftCode(event.target.value)}
                  placeholder="Enter unit code"
                  className="h-12 rounded-xl border-slate-200 bg-slate-50/60"
                />
              </SetupField>

              <div className="flex items-end">
                <Button
                  variant="primary"
                  className="h-12 rounded-xl bg-blue-600 px-6 shadow-sm hover:bg-blue-500"
                  onClick={submitUnit}
                >
                  {editingUnitId ? "Update" : "Submit"}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sky-100 bg-sky-50/70 px-4 py-3">
            <div>
              <h4 className="text-sm font-semibold text-sky-800">Bulk Actions</h4>
              <p className="text-xs text-slate-500">
                Download the current list or upload a prepared CSV file.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="secondary"
                className="h-11 rounded-xl border-sky-100 bg-white px-4 text-sky-700 hover:border-sky-200 hover:bg-sky-50"
                icon={<Download className="h-4 w-4" />}
                onClick={() => downloadUnitsCsv(activeAttribute, units)}
              >
                Download
              </Button>
              <Button
                variant="secondary"
                className="h-11 rounded-xl border-sky-100 bg-white px-4 text-sky-700 hover:border-sky-200 hover:bg-sky-50"
                icon={<Upload className="h-4 w-4" />}
                onClick={() => fileInputRef.current?.click()}
              >
                Upload
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  const text = await file.text();
                  const rows = text
                    .split(/\r?\n/)
                    .slice(1)
                    .map((line) =>
                      line.split(",").map((item) => item.replace(/^"|"$/g, "").trim()),
                    )
                    .filter((parts) => parts.some(Boolean));

                  rows.forEach(([code = "", description = ""]) => {
                    if (code || description) {
                      onSaveUnit(activeAttribute.id, { code, description });
                    }
                  });
                  event.target.value = "";
                }}
              />
            </div>
          </div>

          <p className="text-sm text-slate-500">
            Note: Special characters are allowed in the attribute sheet as needed.
          </p>

          <AttributeUnitTable
            units={units}
            onEdit={(unit) => {
              setDraftCode(unit.code);
              setDraftDescription(unit.description);
              setEditingUnitId(unit.id);
              setErrors({});
            }}
            onDelete={(unitId) => onDeleteUnit(activeAttribute.id, unitId)}
          />
        </div>
      </div>
    </div>
  );
}
