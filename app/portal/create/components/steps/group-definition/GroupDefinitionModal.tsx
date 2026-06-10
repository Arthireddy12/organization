"use client";

import { useMemo, useState } from "react";
import { Search, Trash2, X } from "lucide-react";
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
import type {
  GroupDefinitionField,
  GroupDefinitionModule,
  GroupDefinitionRule,
} from "@/lib/organization-group-definition";
import { validateGroupDefinitionDraft } from "@/lib/organization-setup-validation";
import { SetupField } from "../../SetupField";

function createEmptyValues(module: GroupDefinitionModule | null) {
  if (!module) return {};

  return module.fields.reduce<Record<string, string>>((result, field) => {
    result[field.key] = "";
    return result;
  }, {});
}

function formatFieldValue(field: GroupDefinitionField, value: string) {
  if (field.type !== "select") {
    return value;
  }

  return field.options?.find((option) => option.value === value)?.label ?? value;
}

export default function GroupDefinitionModal({
  open,
  module,
  selectedAttributes,
  rules,
  disabled,
  onClose,
  onSave,
  onDelete,
}: {
  open: boolean;
  module: GroupDefinitionModule | null;
  selectedAttributes: OrganizationAttribute[];
  rules: GroupDefinitionRule[];
  disabled: boolean;
  onClose: () => void;
  onSave: (
    moduleId: string,
    rule: Omit<GroupDefinitionRule, "id"> & { id?: string },
  ) => void;
  onDelete: (moduleId: string, ruleId: string) => void;
}) {
  const [draftValues, setDraftValues] = useState<Record<string, string>>(
    createEmptyValues(module),
  );
  const [attributeIds, setAttributeIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const attributeNameById = useMemo(
    () =>
      Object.fromEntries(
        selectedAttributes.map((attribute) => [attribute.id, attribute.label]),
      ) as Record<string, string>,
    [selectedAttributes],
  );

  const filteredRules = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery || !module) {
      return rules;
    }

    return rules.filter((rule) => {
      const attributesSummary = rule.attributeIds
        .map((attributeId) => attributeNameById[attributeId] ?? attributeId)
        .join(" ");
      const valuesSummary = module.fields
        .map((field) => formatFieldValue(field, rule.values[field.key] ?? ""))
        .join(" ");

      return `${attributesSummary} ${valuesSummary}`.toLowerCase().includes(normalizedQuery);
    });
  }, [attributeNameById, module, rules, searchQuery]);

  if (!open || !module) return null;

  const canSave =
    !disabled &&
    module.fields.every((field) => (draftValues[field.key] ?? "").trim().length > 0);

  function resetDraft() {
    setDraftValues(createEmptyValues(module));
    setAttributeIds([]);
    setEditingId(null);
    setErrors({});
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-sky-950/18 px-4 backdrop-blur-[2px]">
      <div className="flex max-h-[88vh] w-full max-w-6xl flex-col overflow-hidden rounded-[24px] border border-sky-100 bg-white shadow-[0_28px_100px_rgba(14,165,233,0.16)]">
        <div className="flex items-start justify-between gap-4 border-b border-sky-200 bg-gradient-to-r from-sky-600 to-blue-600 px-6 py-5 text-white">
          <div>
            <h3 className="text-2xl font-semibold">{module.label}</h3>
            <p className="mt-1 text-sm text-sky-50">{module.description}</p>
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
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="grid gap-4 xl:grid-cols-[minmax(0,220px)_repeat(3,minmax(0,1fr))]">
                <SetupField label="Module">
                  <Input value={module.label} readOnly />
                </SetupField>

                {module.fields.map((field) => (
                  <SetupField
                    key={field.key}
                    label={field.label}
                    required
                    error={errors[`moduleField:${field.key}`]}
                  >
                    {field.type === "select" ? (
                      <Dropdown
                        value={draftValues[field.key] ?? ""}
                        options={field.options ?? []}
                        onChange={(value) =>
                          setDraftValues((current) => ({ ...current, [field.key]: value }))
                        }
                        placeholder={`Select ${field.label}`}
                        disabled={disabled}
                      />
                    ) : (
                      <Input
                        type={field.type}
                        min={field.min}
                        value={draftValues[field.key] ?? ""}
                        onChange={(event) =>
                          setDraftValues((current) => ({
                            ...current,
                            [field.key]: event.target.value,
                          }))
                        }
                        placeholder={field.placeholder}
                        readOnly={disabled}
                      />
                    )}
                  </SetupField>
                ))}
              </div>

              <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
                <SetupField
                  label="Select Attributes"
                  hint={
                    selectedAttributes.length === 0
                      ? "No attributes available. Add attributes in step 2 first."
                      : "Choose one or more attributes for this rule."
                  }
                  error={errors.groupAttributes}
                >
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                    {selectedAttributes.length === 0 ? (
                      <p className="text-sm text-slate-400">No attributes selected yet.</p>
                    ) : (
                      <>
                        <div className="mb-3 flex flex-wrap gap-2">
                          {attributeIds.length === 0 ? (
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 shadow-sm">
                              None selected
                            </span>
                          ) : (
                            attributeIds.map((attributeId) => (
                              <span
                                key={attributeId}
                                className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                              >
                                {attributeNameById[attributeId] ?? attributeId}
                              </span>
                            ))
                          )}
                        </div>

                        <div className="grid max-h-36 gap-2 overflow-y-auto md:grid-cols-2">
                          {selectedAttributes.map((attribute) => (
                            <label
                              key={attribute.id}
                              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
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
                                disabled={disabled}
                              />
                              <span>{attribute.label}</span>
                            </label>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </SetupField>

                <div className="flex justify-end gap-3">
                  <Button
                    variant="secondary"
                    onClick={resetDraft}
                    disabled={disabled}
                    className="border-blue-100 text-blue-700 hover:border-blue-200 hover:bg-blue-50"
                  >
                    Reset
                  </Button>
                  <Button
                    variant="primary"
                    disabled={!canSave}
                    onClick={() => {
                      const validation = validateGroupDefinitionDraft({
                        fields: module.fields,
                        values: draftValues,
                        attributeIds,
                      });
                      if (!validation.valid) {
                        setErrors(validation.errors);
                        return;
                      }
                      setErrors({});
                      onSave(module.id, {
                        id: editingId ?? undefined,
                        attributeIds,
                        values: module.fields.reduce<Record<string, string>>((result, field) => {
                          result[field.key] = (draftValues[field.key] ?? "").trim();
                          return result;
                        }, {}),
                      });
                      resetDraft();
                    }}
                  >
                    {editingId ? "Update" : "Save"}
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">Attribute applied</h4>
                  <p className="mt-1 text-xs text-slate-500">
                    Review saved rules for this module and reopen any row to edit it.
                  </p>
                </div>

                <div className="w-full lg:w-80">
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search module"
                    icon={<Search className="h-4 w-4" />}
                  />
                </div>
              </div>

              <div className="mt-4 max-h-[360px] overflow-y-auto rounded-xl border border-slate-200">
                {filteredRules.length === 0 ? (
                  <div className="px-4 py-10 text-center text-sm text-slate-400">
                    No rules saved for this module yet.
                  </div>
                ) : (
                  <DataTable minWidth="900px">
                    <DataTableHead>
                      <tr>
                        <DataTableHeaderCell>Module</DataTableHeaderCell>
                        <DataTableHeaderCell>Attributes</DataTableHeaderCell>
                        <DataTableHeaderCell>Details</DataTableHeaderCell>
                        <DataTableHeaderCell className="text-right">Actions</DataTableHeaderCell>
                      </tr>
                    </DataTableHead>
                    <DataTableBody>
                      {filteredRules.map((rule) => (
                        <DataTableRow key={rule.id}>
                          <DataTableCell className="font-semibold text-slate-800">
                            {module.label}
                          </DataTableCell>
                          <DataTableCell className="text-slate-700">
                            {rule.attributeIds.length === 0
                              ? "All attributes"
                              : rule.attributeIds
                                  .map((attributeId) => attributeNameById[attributeId] ?? attributeId)
                                  .join(", ")}
                          </DataTableCell>
                          <DataTableCell>
                            <div className="space-y-1">
                              {module.fields.map((field) => (
                                <p key={field.key} className="text-sm text-slate-600">
                                  <span className="font-semibold text-slate-700">{field.label}:</span>{" "}
                                  {formatFieldValue(field, rule.values[field.key] ?? "-")}
                                </p>
                              ))}
                            </div>
                          </DataTableCell>
                          <DataTableCell>
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="secondary"
                                size="sm"
                                className="rounded-sm border-blue-100 text-blue-700 hover:border-blue-200 hover:bg-blue-50"
                                disabled={disabled}
                                onClick={() => {
                                  setEditingId(rule.id);
                                  setAttributeIds(rule.attributeIds);
                                  setDraftValues({
                                    ...createEmptyValues(module),
                                    ...rule.values,
                                  });
                                  setErrors({});
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                className="rounded-sm border-blue-100 text-blue-700 hover:border-blue-200 hover:bg-blue-50"
                                disabled={disabled}
                                onClick={() => onDelete(module.id, rule.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
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
