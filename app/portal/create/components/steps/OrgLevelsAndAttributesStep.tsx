"use client";

import { useState } from "react";
import type {
  AttributeCategory,
  AttributeUnit,
  OrganizationAttribute,
  OrganizationAttributeSetup,
} from "@/lib/organization-attributes";
import type { FormMode } from "../types";
import AttributeAddModal from "./org-attributes/AttributeAddModal";
import AttributeCategorySection from "./org-attributes/AttributeCategorySection";
import AttributeUnitModal from "./org-attributes/AttributeUnitModal";
import SelectedAttributesBoard from "./org-attributes/SelectedAttributesBoard";

const categoryMeta: Array<{
  key: AttributeCategory;
  title: string;
}> = [
  { key: "financial", title: "Financial" },
  { key: "geographical", title: "Geographical" },
  { key: "roleBased", title: "Role Based" },
];

export default function OrgLevelsAndAttributesStep({
  mode,
  attributeSetup,
  selectedAttributes,
  onAddAvailableAttribute,
  onEnsureSelectedAttribute,
  onGetAttributeUnits,
  onSaveAttributeUnit,
  onDeleteAttributeUnit,
  onRemoveSelectedAttribute,
  onReorderSelectedAttribute,
}: {
  mode: FormMode;
  attributeSetup: OrganizationAttributeSetup;
  selectedAttributes: OrganizationAttribute[];
  onAddAvailableAttribute: (category: AttributeCategory, label: string) => void;
  onEnsureSelectedAttribute: (attributeId: string) => void;
  onGetAttributeUnits: (attributeId: string) => AttributeUnit[];
  onSaveAttributeUnit: (
    attributeId: string,
    unit: { id?: string; code: string; description: string },
  ) => void;
  onDeleteAttributeUnit: (attributeId: string, unitId: string) => void;
  onRemoveSelectedAttribute: (attributeId: string) => void;
  onReorderSelectedAttribute: (draggedId: string, targetId: string) => void;
}) {
  const [activeCategory, setActiveCategory] = useState<AttributeCategory | null>(null);
  const [activeAttribute, setActiveAttribute] = useState<OrganizationAttribute | null>(null);
  const disabled = mode === "view";

  return (
    <div className="space-y-4">
      <section className="rounded-[20px] border border-slate-200 bg-gradient-to-r from-sky-50 via-white to-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex rounded-full border border-white bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-700 shadow-sm">
              Org Attributes Setup
            </div>
            <h2 className="mt-3 text-2xl font-semibold text-slate-800">
              Build your organization structure in a clear way
            </h2>
            <p className="mt-1 max-w-3xl text-sm text-slate-500">
              Choose attributes from financial, geographical, and role-based groups. Selected
              items appear on the right where you can manage units and mapping order.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Available Categories
              </p>
              <p className="mt-1 text-xl font-semibold text-slate-800">{categoryMeta.length}</p>
            </div>
            <div className="rounded-2xl border border-white bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Selected Attributes
              </p>
              <p className="mt-1 text-xl font-semibold text-slate-800">
                {selectedAttributes.length}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
        <div className="space-y-4">
        {categoryMeta.map((category) => (
          <AttributeCategorySection
            key={category.key}
            title={category.title}
            attributes={attributeSetup[category.key]}
            selectedIds={attributeSetup.selectedIds}
            disabled={disabled}
            onAddCustom={() => setActiveCategory(category.key)}
            onOpenAttribute={(attribute) => {
              onEnsureSelectedAttribute(attribute.id);
              setActiveAttribute(attribute);
            }}
          />
        ))}
        </div>

        <SelectedAttributesBoard
          attributes={selectedAttributes}
          disabled={disabled}
          onOpenAttribute={(attribute) => setActiveAttribute(attribute)}
          onRemove={onRemoveSelectedAttribute}
          onReorder={onReorderSelectedAttribute}
        />
      </div>

      <AttributeAddModal
        open={activeCategory !== null}
        categoryLabel={
          categoryMeta.find((category) => category.key === activeCategory)?.title ?? "Attribute"
        }
        onClose={() => setActiveCategory(null)}
        onSave={(label) => {
          if (activeCategory) {
            onAddAvailableAttribute(activeCategory, label);
          }
        }}
      />
      <AttributeUnitModal
        key={activeAttribute?.id ?? "none"}
        open={activeAttribute !== null}
        attribute={activeAttribute}
        units={activeAttribute ? onGetAttributeUnits(activeAttribute.id) : []}
        onClose={() => setActiveAttribute(null)}
        onSaveUnit={onSaveAttributeUnit}
        onDeleteUnit={onDeleteAttributeUnit}
      />
    </div>
  );
}
