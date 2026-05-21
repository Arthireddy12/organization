import type { InputHTMLAttributes, ReactNode } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  icon?: ReactNode;
};

export function Input({ className = "", icon, ...props }: InputProps) {
  return (
    <label className="relative block">
      {icon && (
        <span className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 text-slate-400">
          {icon}
        </span>
      )}
      <input
        className={`h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 ${
          icon ? "pl-9" : ""
        } ${className}`}
        {...props}
      />
    </label>
  );
}
