import { ArrowUpRight, GripVertical, Link2, X } from "lucide-react";
import { Button } from "@/components/common/button";
import type { OrganizationAttribute } from "@/lib/organization-attributes";

export default function SelectedAttributesBoard({
  attributes,
  disabled,
  onOpenAttribute,
  onRemove,
  onReorder,
}: {
  attributes: OrganizationAttribute[];
  disabled: boolean;
  onOpenAttribute: (attribute: OrganizationAttribute) => void;
  onRemove: (attributeId: string) => void;
  onReorder: (draggedId: string, targetId: string) => void;
}) {
  return (
    <section className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm xl:sticky xl:top-6">
      <div className="mb-4 rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-white p-4">
        <div>
          <div className="inline-flex rounded-full border border-white bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-700 shadow-sm">
            Mapping Board
          </div>
          <h3 className="mt-3 text-xl font-semibold text-slate-800">Selected Elements</h3>
          <p className="mt-1 text-sm text-slate-500">
            Added attributes appear here. Open any card to manage its units and keep the mapping
            order clear.
          </p>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-white bg-white/90 px-4 py-3 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Selected Count
            </p>
            <p className="mt-1 text-2xl font-semibold text-slate-800">{attributes.length}</p>
          </div>
          <div className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
            Active Mapping
          </div>
        </div>
      </div>

      {attributes.length === 0 ? (
        <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-sky-200 bg-sky-50/50 px-6 text-center text-sm text-slate-400">
          Select or create attributes from the left panel to start building this mapping view
        </div>
      ) : (
        <div className="space-y-3">
          {attributes.map((attribute, index) => (
            <div
              key={attribute.id}
              className="rounded-2xl border border-slate-200 bg-slate-50/70 p-2"
            >
              <div
                draggable={!disabled}
                onDragStart={(event) => {
                  event.dataTransfer.setData("text/plain", attribute.id);
                }}
                onDragOver={(event) => {
                  if (!disabled) event.preventDefault();
                }}
                onDrop={(event) => {
                  if (disabled) return;
                  event.preventDefault();
                  const draggedId = event.dataTransfer.getData("text/plain");
                  if (draggedId && draggedId !== attribute.id) {
                    onReorder(draggedId, attribute.id);
                  }
                }}
                onClick={() => onOpenAttribute(attribute)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onOpenAttribute(attribute);
                  }
                }}
                role="button"
                tabIndex={disabled ? -1 : 0}
                className="group flex min-h-[88px] items-center justify-between rounded-xl border border-white bg-white px-4 py-3 text-left shadow-sm transition hover:border-sky-100 hover:shadow-md"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sm font-semibold text-sky-700">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-slate-800">
                      {attribute.label}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Click to manage units and keep this attribute ready for mapping.
                    </p>
                  </div>
                </div>
                {!disabled ? (
                  <div className="flex items-center gap-2">
                    <span className="rounded-xl bg-slate-50 p-2 text-slate-400 transition group-hover:bg-blue-50 group-hover:text-blue-500">
                      <GripVertical className="h-3.5 w-3.5" />
                    </span>
                    <span className="rounded-xl bg-blue-50 p-2 text-blue-600">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(event) => {
                        event.stopPropagation();
                        onRemove(attribute.id);
                      }}
                      className="h-8 w-8 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-rose-50 hover:text-rose-500"
                      aria-label={`Remove ${attribute.label}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : null}
              </div>
              {!disabled ? (
                <div className="mt-2 flex items-center gap-2 px-2 pb-1 text-xs text-slate-500">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-blue-500 shadow-sm">
                    <Link2 className="h-3.5 w-3.5" />
                  </div>
                  Ready to connect units and element mapping
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
