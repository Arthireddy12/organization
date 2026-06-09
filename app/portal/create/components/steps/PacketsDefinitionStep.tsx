"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/common/input";
import type { OrganizationAttribute } from "@/lib/organization-attributes";
import {
  packetCatalog,
  type PacketAssignment,
  type PacketCatalogItem,
  type PacketKind,
} from "@/lib/organization-packets";
import type { FormMode } from "../types";
import PacketCatalogTable from "./packets-definition/PacketCatalogTable";
import PacketDetailsModal from "./packets-definition/PacketDetailsModal";

export default function PacketsDefinitionStep({
  mode,
  selectedAttributes,
  onGetPacketAssignments,
  onSavePacketAssignment,
  onDeletePacketAssignment,
}: {
  mode: FormMode;
  selectedAttributes: OrganizationAttribute[];
  onGetPacketAssignments: (itemId: string) => PacketAssignment[];
  onSavePacketAssignment: (
    itemId: string,
    assignment: Omit<PacketAssignment, "id"> & { id?: string },
  ) => void;
  onDeletePacketAssignment: (itemId: string, assignmentId: string) => void;
}) {
  const [activeKind, setActiveKind] = useState<PacketKind>("report");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeItem, setActiveItem] = useState<PacketCatalogItem | null>(null);
  const disabled = mode === "view";

  const visibleItems = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return packetCatalog.filter(
      (item) =>
        item.kind === activeKind &&
        `${item.label} ${item.category}`.toLowerCase().includes(normalizedQuery),
    );
  }, [activeKind, searchQuery]);

  return (
    <div className="space-y-4">
      <section className="rounded-[20px] border border-slate-200 bg-gradient-to-r from-sky-50 via-white to-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="inline-flex rounded-full border border-white bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-700 shadow-sm">
              Step 4 Guide
            </div>
            <h2 className="mt-3 text-2xl font-semibold text-slate-800">
              Configure reports and screens packet access
            </h2>
            <p className="mt-1 max-w-3xl text-sm text-slate-500">
              Switch between reports and screens, open any packet, and assign access using
              position codes, super access, and the attributes created in step 2.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Reports</p>
              <p className="mt-1 text-xl font-semibold text-slate-800">
                {packetCatalog.filter((item) => item.kind === "report").length}
              </p>
            </div>
            <div className="rounded-2xl border border-white bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Screens</p>
              <p className="mt-1 text-xl font-semibold text-slate-800">
                {packetCatalog.filter((item) => item.kind === "screen").length}
              </p>
            </div>
            <div className="rounded-2xl border border-white bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Attributes</p>
              <p className="mt-1 text-xl font-semibold text-slate-800">{selectedAttributes.length}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-sm border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
            {(["report", "screen"] as const).map((kind) => (
              <button
                key={kind}
                type="button"
                onClick={() => setActiveKind(kind)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  activeKind === kind
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-white"
                }`}
              >
                {kind === "report" ? "Reports" : "Screens"}
              </button>
            ))}
          </div>

          <div className="w-full lg:w-80">
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={`Search ${activeKind}s`}
              icon={<Search className="h-4 w-4" />}
            />
          </div>
        </div>
      </section>

      <PacketCatalogTable
        activeKind={activeKind}
        items={visibleItems}
        getAssignmentCount={(itemId) => onGetPacketAssignments(itemId).length}
        onOpenItem={(item) => !disabled && setActiveItem(item)}
      />

      <PacketDetailsModal
        open={activeItem !== null}
        item={activeItem}
        selectedAttributes={selectedAttributes}
        assignments={activeItem ? onGetPacketAssignments(activeItem.id) : []}
        onClose={() => setActiveItem(null)}
        onSave={onSavePacketAssignment}
        onDelete={onDeletePacketAssignment}
      />
    </div>
  );
}
