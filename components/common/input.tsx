import type { InputHTMLAttributes, ReactNode } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  icon?: ReactNode;
};

export function Input({ className = "", icon, ...props }: InputProps) {
  return (
    <div className="relative block">
      {icon && (
        <span className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 text-slate-400">
          {icon}
        </span>
      )}
      <input
        className={`h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-200 focus:bg-white focus:ring-0 focus:outline-none ${
          icon ? "pl-9" : ""
        } ${className}`}
        {...props}
      />
    </div>
  );
}
