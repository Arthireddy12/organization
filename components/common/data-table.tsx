import type { ReactNode } from "react";

type DataTableProps = {
  children: ReactNode;
  minWidth?: string;
};

type DataTableHeadProps = {
  children: ReactNode;
};

type DataTableBodyProps = {
  children: ReactNode;
};

type DataTableRowProps = {
  children: ReactNode;
  className?: string;
};

type DataTableCellProps = {
  children: ReactNode;
  className?: string;
  colSpan?: number;
};

export function DataTable({ children, minWidth = "760px" }: DataTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm" style={{ minWidth }}>
        {children}
      </table>
    </div>
  );
}

export function DataTableHead({ children }: DataTableHeadProps) {
  return (
    <thead className="border-b border-slate-100 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
      {children}
    </thead>
  );
}

export function DataTableBody({ children }: DataTableBodyProps) {
  return <tbody className="divide-y divide-slate-100">{children}</tbody>;
}

export function DataTableRow({ children, className = "" }: DataTableRowProps) {
  return <tr className={`transition hover:bg-slate-50/70 ${className}`}>{children}</tr>;
}

export function DataTableHeaderCell({
  children,
  className = "",
}: DataTableCellProps) {
  return <th className={`px-5 py-3 ${className}`}>{children}</th>;
}

export function DataTableCell({
  children,
  className = "",
  colSpan,
}: DataTableCellProps) {
  return (
    <td className={`px-5 py-4 align-middle ${className}`} colSpan={colSpan}>
      {children}
    </td>
  );
}
