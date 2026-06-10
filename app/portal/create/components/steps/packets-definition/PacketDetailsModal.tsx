"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/common/button";
import { Checkbox } from "@/components/common/checkbox";
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
} from "@/components/common/data-table";
import { Dropdown } from "@/components/common/dropdown";
import { Input } from "@/components/common/input";
import type { OrganizationAttribute } from "@/lib/organization-attributes";
import { validatePacketAssignmentDraft } from "@/lib/organization-setup-validation";
import {
  packetPositionOptions,
  type PacketAssignment,
  type PacketCatalogItem,
} from "@/lib/organization-packets";
import { SetupField } from "../../SetupField";

export default function PacketDetailsModal({
  open,
  item,
  selectedAttributes,
  assignments,
  onClose,
  onSave,
  onDelete,
}: {
  open: boolean;
  item: PacketCatalogItem | null;
  selectedAttributes: OrganizationAttribute[];
  assignments: PacketAssignment[];
  onClose: () => void;
  onSave: (
    itemId: string,
    assignment: Omit<PacketAssignment, "id"> & { id?: string },
  ) => void;
  onDelete: (itemId: string, assignmentId: string) => void;
}) {
  const [positionCode, setPositionCode] = useState("");
  const [superAccess, setSuperAccess] = useState(false);
  const [attributeIds, setAttributeIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const filteredAssignments = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return assignments;
    }

    return assignments.filter((assignment) =>
      `${assignment.positionLabel} ${assignment.attributeIds.join(" ")}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [assignments, searchQuery]);

  if (!open || !item) return null;

  function resetDraft() {
    setPositionCode("");
    setSuperAccess(false);
    setAttributeIds([]);
    setEditingId(null);
    setErrors({});
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-sky-950/18 px-4 backdrop-blur-[2px]">
      <div className="flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-[24px] border border-sky-100 bg-white shadow-[0_28px_100px_rgba(14,165,233,0.16)]">
        <div className="flex items-start justify-between gap-4 border-b border-sky-200 bg-gradient-to-r from-sky-600 to-blue-600 px-6 py-5 text-white">
          <div>
            <div className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
              {item.kind === "report" ? "Reports" : "Screens"}
            </div>
            <h3 className="mt-3 text-2xl font-semibold text-white">{item.label}</h3>
            <p className="mt-1 text-sm text-sky-50">
              Configure position-wise access, super access, and selected attribute visibility.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-10 w-10 rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="grid gap-4 md:grid-cols-2">
                <SetupField label={item.kind === "report" ? "Reports" : "Screens"} required>
                  <Input value={item.label} readOnly />
                </SetupField>
              <SetupField label="Position Code" required error={errors.positionCode}>
                  <Dropdown
                    value={positionCode}
                    options={packetPositionOptions.map((option) => ({
                      label: option,
                      value: option,
                    }))}
                    onChange={setPositionCode}
                    placeholder="Select position code"
                  />
                </SetupField>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                <label className="flex items-start gap-3">
                  <Checkbox
                    checked={superAccess}
                    onChange={(event) => setSuperAccess(event.target.checked)}
                  />
                  <span className="text-sm text-slate-600">
                    <span className="block font-semibold text-slate-700">Superuser Access</span>
                    If enabled, this packet can be used as full owner access for the selected
                    position code.
                  </span>
                </label>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="mb-3">
                  <h4 className="text-sm font-semibold text-slate-800">Select Attributes</h4>
                  <p className="mt-1 text-xs text-slate-500">
                    Choose which organization attributes are visible for this packet access.
                  </p>
                  {errors.packetAttributes ? (
                    <p className="mt-2 text-[11px] font-medium text-rose-600">
                      {errors.packetAttributes}
                    </p>
                  ) : null}
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {selectedAttributes.map((attribute) => (
                    <label
                      key={attribute.id}
                      className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-sm text-slate-700"
                    >
                      <Checkbox
                        checked={attributeIds.includes(attribute.id)}
                        onChange={(event) =>
                          setAttributeIds((current) =>
                            event.target.checked
                              ? [...current, attribute.id]
                              : current.filter((id) => id !== attribute.id),
                          )
                        }
                      />
                      <span>{attribute.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                  <Button
                    variant="secondary"
                    onClick={resetDraft}
                    className="border-blue-100 text-blue-700 hover:border-blue-200 hover:bg-blue-50"
                  >
                    Reset
                  </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    const validation = validatePacketAssignmentDraft({
                      positionCode,
                      attributeIds,
                    });
                    if (!validation.valid) {
                      setErrors(validation.errors);
                      return;
                    }
                    setErrors({});
                    onSave(item.id, {
                      id: editingId ?? undefined,
                      positionCode,
                      positionLabel: positionCode,
                      superAccess,
                      attributeIds,
                    });
                    resetDraft();
                  }}
                >
                  {editingId ? "Update" : "Save"}
                </Button>
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">Applied Access</h4>
                  <p className="mt-1 text-xs text-slate-500">
                    Saved position-wise packet access for this item.
                  </p>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  {assignments.length} saved
                </span>
              </div>

              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search position code"
                icon={<Search className="h-4 w-4" />}
              />

              <div className="max-h-[420px] overflow-y-auto rounded-xl border border-slate-200">
                {filteredAssignments.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-slate-400">
                    No packet access saved yet
                  </div>
                ) : (
                  <DataTable minWidth="620px">
                    <DataTableHead>
                      <tr>
                        <DataTableHeaderCell>Position Code</DataTableHeaderCell>
                        <DataTableHeaderCell>Access</DataTableHeaderCell>
                        <DataTableHeaderCell>Attributes</DataTableHeaderCell>
                        <DataTableHeaderCell className="text-right">Actions</DataTableHeaderCell>
                      </tr>
                    </DataTableHead>
                    <DataTableBody>
                      {filteredAssignments.map((assignment) => (
                        <DataTableRow key={assignment.id}>
                          <DataTableCell className="font-semibold text-slate-800">
                            {assignment.positionLabel}
                          </DataTableCell>
                          <DataTableCell className="text-slate-600">
                            {assignment.superAccess ? "Superuser" : "Standard"}
                          </DataTableCell>
                          <DataTableCell className="text-slate-600">
                            {assignment.attributeIds.length || "All"}
                          </DataTableCell>
                          <DataTableCell>
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="secondary"
                                size="sm"
                                className="rounded-sm border-blue-100 text-blue-700 hover:border-blue-200 hover:bg-blue-50"
                                onClick={() => {
                                  setEditingId(assignment.id);
                                  setPositionCode(assignment.positionCode);
                                  setSuperAccess(assignment.superAccess);
                                  setAttributeIds(assignment.attributeIds);
                                  setErrors({});
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                className="rounded-sm border-blue-100 text-blue-700 hover:border-blue-200 hover:bg-blue-50"
                                onClick={() => onDelete(item.id, assignment.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </DataTableCell>
                        </DataTableRow>
                      ))}
                    </DataTableBody>
                  </DataTable>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
