import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export function SetupField({
  label,
  children,
  required,
  hint,
}: {
  label: string;
  children: ReactNode;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-slate-700">
        {label}
        {required ? <span className="ml-1 text-rose-500">*</span> : null}
      </label>
      {children}
      {hint ? <p className="text-[11px] text-slate-500">{hint}</p> : null}
    </div>
  );
}

export function SetupSectionTitle({ title }: { title: string }) {
  return (
    <h3 className="border-b border-slate-200 pb-2 text-sm font-semibold text-slate-700">
      {title}
    </h3>
  );
}

export function SetupSelectChevron() {
  return (
    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
  );
}

export const setupInputClassName =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-200 focus:ring-0 focus:outline-none";

export const setupTextareaClassName =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-200 focus:ring-0 focus:outline-none";

export const setupCardClassName =
  "rounded-sm border border-slate-200 bg-white p-4 shadow-sm";
