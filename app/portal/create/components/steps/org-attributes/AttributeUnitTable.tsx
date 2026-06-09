import { Boxes, Pencil, X } from "lucide-react";
import { Button } from "@/components/common/button";
import type { AttributeUnit } from "@/lib/organization-attributes";

export default function AttributeUnitTable({
  units,
  onEdit,
  onDelete,
}: {
  units: AttributeUnit[];
  onEdit: (unit: AttributeUnit) => void;
  onDelete: (unitId: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50/80 px-4 py-3">
        <h4 className="text-sm font-semibold text-slate-700">Configured Units</h4>
        <p className="mt-0.5 text-xs text-slate-500">
          Review, edit, or remove saved values from this list.
        </p>
      </div>
      <div className="max-h-[360px] overflow-y-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-white">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Sr. No.
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Unit Code
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Description
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {units.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-14">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sky-50 text-sky-600">
                      <Boxes className="h-5 w-5" />
                    </div>
                    <p className="text-base font-medium text-slate-700">No units added yet</p>
                    <p className="mt-1 max-w-sm text-sm text-slate-400">
                      Add the first unit above or upload a CSV file to populate this attribute
                      quickly.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              units.map((unit, index) => (
                <tr key={unit.id} className="transition hover:bg-sky-50/50">
                  <td className="px-4 py-4 text-slate-700">{index + 1}</td>
                  <td className="px-4 py-4">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {unit.code || "-"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-700">{unit.description || "-"}</td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                        onClick={() => onEdit(unit)}
                        aria-label={`Edit ${unit.description || unit.code}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-rose-50 hover:text-rose-500"
                        onClick={() => onDelete(unit.id)}
                        aria-label={`Delete ${unit.description || unit.code}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
