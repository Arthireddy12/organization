import { Settings2 } from "lucide-react";
import { Button } from "@/components/common/button";
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
} from "@/components/common/data-table";
import type { PacketCatalogItem, PacketKind } from "@/lib/organization-packets";

export default function PacketCatalogTable({
  activeKind,
  items,
  getAssignmentCount,
  onOpenItem,
}: {
  activeKind: PacketKind;
  items: PacketCatalogItem[];
  getAssignmentCount: (itemId: string) => number;
  onOpenItem: (item: PacketCatalogItem) => void;
}) {
  const groupedItems = items.reduce<Record<string, PacketCatalogItem[]>>((result, item) => {
    if (!result[item.category]) {
      result[item.category] = [];
    }
    result[item.category].push(item);
    return result;
  }, {});

  return (
    <section className="overflow-hidden rounded-sm border border-slate-200 bg-white shadow-sm">
      <div className="max-h-[540px] overflow-y-auto">
        <DataTable minWidth="760px">
          <DataTableHead>
            <tr>
              <DataTableHeaderCell>
                {activeKind === "report" ? "Report Type" : "Screen Type"}
              </DataTableHeaderCell>
              <DataTableHeaderCell className="text-center">Assignments</DataTableHeaderCell>
              <DataTableHeaderCell className="text-center">Packet Details</DataTableHeaderCell>
            </tr>
          </DataTableHead>
          <DataTableBody>
            {Object.entries(groupedItems).map(([category, categoryItems]) => (
              <DataTableRow key={category} className="hover:bg-white">
                <DataTableCell colSpan={3} className="p-0">
                  <div className="border-b border-slate-100 last:border-b-0">
                    <div className="bg-blue-50/50 px-5 py-3 text-sm font-semibold text-slate-700">
                      {category}
                    </div>
                    {categoryItems.map((item) => {
                      const assignmentCount = getAssignmentCount(item.id);

                      return (
                        <div
                          key={item.id}
                          className="grid grid-cols-[minmax(0,1.4fr)_140px_150px] items-center border-t border-slate-100 px-5 py-3"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-800">{item.label}</p>
                            <p className="mt-1 text-xs text-slate-400">
                              Configure position codes and attribute-wise access
                            </p>
                          </div>
                          <div className="flex justify-center">
                            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                              {assignmentCount} saved
                            </span>
                          </div>
                          <div className="flex justify-center">
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              className="rounded-sm border-blue-100 text-blue-700 hover:border-blue-200 hover:bg-blue-50"
                              icon={<Settings2 className="h-3.5 w-3.5" />}
                              onClick={() => onOpenItem(item)}
                            >
                              Configure
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </DataTableCell>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      </div>
    </section>
  );
}
