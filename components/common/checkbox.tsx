import { Check } from "lucide-react";
import type { InputHTMLAttributes } from "react";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  className?: string;
  indicatorClassName?: string;
};

export function Checkbox({
  className = "",
  indicatorClassName = "",
  disabled,
  checked,
  ...props
}: CheckboxProps) {
  return (
    <label
      className={`relative inline-flex h-5 w-5 items-center justify-center rounded-md border transition ${
        checked
          ? "border-blue-600 bg-blue-600 text-white"
          : "border-slate-300 bg-white text-transparent"
      } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"} ${className}`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        className="absolute inset-0 h-full w-full cursor-inherit opacity-0"
        {...props}
      />
      <Check className={`h-3.5 w-3.5 ${indicatorClassName}`} />
    </label>
  );
}
