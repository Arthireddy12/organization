import { Plus, SquarePlus } from "lucide-react";
import { Button } from "@/components/common/button";
import type { OrganizationAttribute } from "@/lib/organization-attributes";

export default function AttributeCategorySection({
  title,
  attributes,
  selectedIds,
  disabled,
  onAddCustom,
  onOpenAttribute,
}: {
  title: string;
  attributes: OrganizationAttribute[];
  selectedIds: string[];
  disabled: boolean;
  onAddCustom: () => void;
  onOpenAttribute: (attribute: OrganizationAttribute) => void;
}) {
  return (
    <section className="rounded-sm border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-800">{title}</h3>
          <p className="mt-1 text-xs text-slate-500">
            Select an attribute to configure its units and mapping.
          </p>
        </div>
        {!disabled ? (
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="h-3.5 w-3.5" />}
            className="h-9 rounded-sm bg-blue-600 px-3.5 text-xs shadow-sm hover:bg-blue-500"
            onClick={onAddCustom}
          >
            Add
          </Button>
        ) : null}
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        {attributes.map((attribute) => {
          const selected = selectedIds.includes(attribute.id);

          return (
            <Button
              key={attribute.id}
              variant="secondary"
              disabled={disabled}
              onClick={() => onOpenAttribute(attribute)}
              className={`h-12 w-full justify-between rounded-sm px-4 py-2 text-left text-sm font-medium shadow-sm transition ${
                selected
                  ? "border-blue-200 bg-blue-50 text-blue-900"
                  : "border-slate-200 bg-slate-50/70 text-slate-700 hover:border-blue-100 hover:bg-white"
              } ${disabled ? "cursor-default" : ""}`}
            >
              <span className="truncate text-left">{attribute.label}</span>
              <span
                className={`ml-3 shrink-0 rounded-md p-1 ${
                  selected
                    ? "bg-white text-blue-500"
                    : "bg-white text-slate-400"
                }`}
              >
                <SquarePlus className="h-3.5 w-3.5" />
              </span>
            </Button>
          );
        })}
      </div>
    </section>
  );
}
